import { QueryBuilder } from "@querybuilder/core";
import { jsonReplacer } from "./mongoUtils.js";
class Command {
	constructor(command, driverDB) {
		this._commands = command !== undefined ? [command] : [];
		this.from = undefined;
		this._where = undefined;
		this.driverDB = driverDB;
	}

	async execute(driver) {
		try {
			let response;
			if (driver !== undefined) {
				await driver.execute(this);
				response = driver.response();
			} else if (this.driverDB !== undefined) {
				await this.driverDB.execute(this);
				response = this.driverDB.response();
			} else {
				throw new Error("Falta el driver");
			}
			return response;
		} catch (error) {
			console.error("[Command][execute]", error);
		}
	}

	set where(where) {
		if (where instanceof QueryBuilder) {
			console.log("Resolver la subquery");
		}
		this._where = where;
	}

	get where() {
		return this._where;
	}
	set(value) {
		if (value !== undefined) {
			this._commands = [value];
		}
		return this;
	}
	get commands() {
		return this._commands.map((command) => {
			this.evalCommand(command, this);
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
		if (Array.isArray(this._commands)) {
			return this._commands
				.map((command) => {
					if (command?.results) {
						const { agregaciones } = command.results;
						if (agregaciones.length === 1) {
							return JSON.stringify(agregaciones[0], jsonReplacer);
						}
						const { results, ...withOutResults } = command;
						return JSON.stringify(withOutResults, jsonReplacer);
					}
					return JSON.stringify(command, jsonReplacer);
				})
				.join(";");
		}
		return this._commands;
	}
	async toJson() {
		return await Promise.all(
			this._commands.map(async (command) => {
				console.log("Evaluamos el comando", command);
				await this.evalCommand(command, this);
				console.log("toJson", command);
				if (command?.results) {
					const { agregaciones } = command.results;
					if (agregaciones.length) {
						return agregaciones;
					}
					const { results, ...withOutResults } = command;
					return withOutResults;
				}
				return command;
			}),
		);
	}
	async evalCommand(command, parent) {
		for (const item in command) {
			if (typeof command[item] === "object") {
				if (Array.isArray(command[item])) {
					await this.evalCommand(command[item], parent);
				} else if (command[item] instanceof QueryBuilder) {
					console.log(
						"[Command][evalCommand] Es una subconsulta",
						command[item].selectCommand._commands,
					);
					const { results } = command[item].selectCommand._commands[0];
					let rows;
					if (results?.agregaciones.length) {
						for await (const agregacion of results.agregaciones) {
							const { from, where } = command[item].selectCommand;
							agregacion.from = from;
							agregacion.where = where;
							rows = (await agregacion.execute()).rows;
						}
					} else {
						rows = (
							await command[item].selectCommand.execute(command[item].driverDB)
						).rows;
					}
					if (rows.length > 0) {
						const data = rows[0].map((row) => {
							const values = Object.values(row);
							if (values.length > 1) {
								return values;
							}
							return values[0];
						});
						command[item] = data.length > 1 ? data : data[0];
					} else {
						command[item] = null;
					}
				} else if (command[item] instanceof Command) {
					console.log(
						"[Command][evalCommand] Es una agregación",
						command[item]._commands,
					);
					console.log("el padre es ", parent._commands);
					command[item].from = parent.from;
					command[item]._where = parent._where;
					const { rows } = await command[item].execute();
					if (rows.length > 0) {
						const data = rows[0].map((row) => {
							const values = Object.values(row);
							if (values.length > 1) {
								return values;
							}
							return values[0];
						});
						console.log("Resultado de la agregación", data);
						command[item] = data.length > 1 ? data : data[0];
					} else {
						throw new Error("No se puede evaluar", { cause: item });
					}
				} else {
					await this.evalCommand(command[item], parent);
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
// Exportaciones
export default Command;
export { Command };
