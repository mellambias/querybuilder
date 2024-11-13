import QueryBuilder from "./querybuilder.js";

class Transaction {
	constructor(builder, options = {}) {
		this.options = options;
		this.builder = builder;
		this.driver = builder?.driverDB;
		this.stack = [];
		this.error = undefined;
		this.commandStack = [];
		this.optionToText = {
			snapshot: "WITH CONSISTENT SNAPSHOT",
			readWrite: "READ WRITE",
			readOnly: "READ ONLY",
			isolation: {
				text: "ISOLATION LEVEL",
				values: [
					"READ UNCOMMITTED",
					"READ COMMITTED",
					"REPEATABLE READ",
					"SERIALIZABLE",
				],
			},
			mode: {
				text: "",
				values: ["READ WRITE", "READ ONLY"],
			},
		};
	}

	async connect() {
		if (this.stack.length === 0) {
			this.error = new Error(
				"Para iniciar una transacción es necesario tener consultas",
			);
		}
		return this;
	}
	add(...querys) {
		for (const query of querys) {
			if (query instanceof QueryBuilder) {
				this.stack.push(query.toString());
			}
		}
		return this;
	}

	async start(options) {
		const transaccion = await this.connect();
		if (transaccion.error) {
			throw new Error(transaccion.error);
		}
		try {
			if (this.options !== undefined) {
				this.commandStack.push(
					`${this.builder.language.setTransaction(this.options)};`,
				);
			}
			this.commandStack.push(
				`${this.builder.language.startTransaction(options)};`,
			);
			for (const command of this.stack) {
				if (command !== null) {
					this.commandStack.push(command);
				}
			}
			if (this.driver) {
				await this.driver.execute(this.commandStack.join("\n"), {
					transaction: true,
				});
				await this.driver.execute("ROLLBACK;");
				this.result = this.driver.response();
				this.error = undefined;
				// await this.driver.execute("COMMIT;");
				return this;
			}
		} catch (error) {
			this.error = `Capture on Transaction [start-rollback] ${error.message}`;
			this.result = undefined;
			await this.driver.execute("ROLLBACK;");
			return this;
		}
	}

	setSavePoint(name) {
		try {
			const savePoint = `${this.builder.language.setSavePoint(name)};`;
			this.stack.push(savePoint);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	clearSavePoint(name) {
		try {
			this.stack.push(`${this.builder.language.clearSavePoint(name)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	commit() {
		try {
			this.stack.push(`${this.builder.language.commit()}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	rollback(savepoint) {
		try {
			this.stack.push(`${this.builder.language.rollback(savepoint)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	toString() {
		return this.commandStack.join("\n");
	}
	queryJoin() {
		return this.toString();
	}
	execute() {
		return this;
	}
}

export default Transaction;
