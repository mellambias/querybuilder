import QueryBuilder from "./querybuilder.js";
import { log } from "./utils/utils.js";

class Transaction {
	constructor(builder, options = {}) {
		this.options = options;
		this.builder = builder;
		this.driver = builder?.driverDB;
		this.error = [];
		this.promise = Promise.resolve({ commandStack: [], stack: [], error: [] });
		this.returnOriginal = [...builder.returnOriginal, "start", "connect"];
		this.handler = {
			get(target, prop, receiver) {
				const original = Reflect.get(target, prop, receiver);
				if (typeof original === "function") {
					if (target.returnOriginal.indexOf(prop) >= 0) {
						return original;
					}
					return (...args) => {
						// añade la función a la cadena de promesas
						target.promise = target.promise.then((next) => {
							// iguala el numero de argumentos que recibe la función
							while (args.length < original.length - 1) {
								args.push(undefined);
							}
							// pasa 'next' como ultimo argumento de la función original
							args.push({ ...next });
							// ejecuta la funcion
							const response = original.apply(receiver, args);
							return response;
						});
						return receiver;
					};
				}
				return original;
			},
		};
		// biome-ignore lint/correctness/noConstructorReturn: <explanation>
		return new Proxy(this, this.handler);
	}

	setUpTransaction(next) {
		if (this.options !== undefined) {
			next.commandStack = [
				`${this.builder.language.setTransaction(this.options)};`,
			];
			return next;
		}
	}
	async connect(next) {
		if (next.stack.length === 0) {
			next.error.push(
				new Error("Para iniciar una transacción es necesario tener consultas"),
			);
		}
		return next;
	}

	async add(...querys) {
		const next = querys.pop();
		for (const query of querys) {
			if (query instanceof QueryBuilder) {
				const resolve = await query.promise;
				const lastIndex = resolve.q.length - 1;
				resolve.q[lastIndex] += !resolve.q[lastIndex].endsWith(";") ? ";" : "";
				const endCommandIndex = resolve.q.findIndex((item) =>
					item.endsWith(";"),
				);
				const command = resolve.q.splice(0, endCommandIndex + 1);
				next.stack.push(command.join("\n"));
			} else {
				next.stack.push(query.endsWith(";") ? query : query.concat(";"));
			}
		}
		return next;
	}

	async start(options) {
		let next = await this.promise;
		next = await this.connect(next);
		if (next.error.length) {
			throw new Error("Problemas con la transaccion", { cause: next.error });
		}
		try {
			next.commandStack.push(
				`${this.builder.language.startTransaction(options)};`,
			);
			const transaction = await this.toString();
			if (options?.debug) {
				return this;
			}
			if (this.driver) {
				await this.driver.execute(transaction, {
					transaction: true,
				});
				this.result = this.driver.response();
				this.error = [];
				await this.driver.execute("COMMIT;");
				return this;
			}
		} catch (error) {
			next.error.push(
				`Capture on Transaction [start-rollback] ${error.message}`,
			);
			this.error = next.error;
			this.result = undefined;
			await this.driver.execute("ROLLBACK;");
			throw new Error(`[Transaction][startTransaction] ${next.error}`, {
				cause: next.error,
			});
		}
	}

	setSavePoint(name, next) {
		try {
			const savePoint = `${this.builder.language.setSavePoint(name)};`;
			next.stack.push(savePoint);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	clearSavePoint(name, next) {
		try {
			next.stack.push(`${this.builder.language.clearSavePoint(name)};`);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	commit(next) {
		try {
			next.stack.push(`${this.builder.language.commit()};`);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	rollback(savepoint, next) {
		try {
			next.stack.push(`${this.builder.language.rollback(savepoint)};`);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	async toString() {
		const resolve = await this.promise;
		const text = resolve.commandStack
			.join("\n")
			.concat("\n", resolve.stack.filter((item) => item !== null).join("\n"));
		return text;
	}
	queryJoin() {
		return this.toString();
	}
	execute() {
		return this;
	}
}

export default Transaction;
