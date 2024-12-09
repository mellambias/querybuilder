import QueryBuilder from "../querybuilder.js";
class Command {
	constructor(command) {
		this._commands = command !== undefined ? [command] : [];
		this.from = undefined;
		this.where = undefined;
	}

	async execute(driver) {
		try {
			await driver.execute(this);
			const response = driver.response();
			return response;
		} catch (error) {
			console.error("[Command][execute]", error);
		}
	}
	set(value) {
		if (value !== undefined) {
			this._commands = [value];
		}
		return this;
	}
	get commands() {
		return this._commands.map((command) => {
			this.evalCommand(command);
			return command;
		});
	}
	add(value) {
		if (value !== undefined) {
			this._commands.push(value);
		}
		return this;
	}

	toString() {
		return this._commands
			.map((command) => {
				return JSON.stringify(command);
			})
			.join(";");
	}
	async toJson() {
		return await Promise.all(
			this._commands.map(async (command) => {
				await this.evalCommand(command);
				return command;
			}),
		);
	}
	async evalCommand(command) {
		for (const item in command) {
			if (typeof command[item] === "object") {
				if (Array.isArray(command[item])) {
					await this.evalCommand(command[item]);
				} else if (command[item] instanceof QueryBuilder) {
					const { rows } = await command[item].selectCommand.execute(
						command[item].driverDB,
					);
					const data = rows[0].map((row) => {
						const values = Object.values(row);
						if (values.length > 1) {
							return values;
						}
						return values[0];
					});
					command[item] = data.length > 1 ? data : data[0];
				} else {
					await this.evalCommand(command[item]);
				}
			}
			if (typeof command[item] === "function") {
				const result = command[item](this);
				if (result) {
					command[item] = result;
				} else {
					delete command[item];
				}
			}
		}
		return command;
	}
}
export default Command;
