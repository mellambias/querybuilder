/**
 * @fileoverview MongoDB Command - Clase para construir y ejecutar comandos MongoDB
 * @module @querybuilder/mongodb/Command
 * @description Clase que representa un comando MongoDB, permitiendo construir pipelines
 * de agregación, resolver subconsultas y ejecutar operaciones MongoDB complejas.
 * Soporta encadenamiento de comandos, evaluación de subconsultas y transformación a JSON.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Crear comando simple
 * import { Command } from '@querybuilder/mongodb';
 * const cmd = new Command({ $match: { status: 'active' } });
 * 
 * @example
 * // Encadenar comandos de agregación
 * const pipeline = new Command();
 * pipeline.add({ $match: { age: { $gte: 18 } } });
 * pipeline.add({ $group: { _id: '$city', count: { $sum: 1 } } });
 * const result = await pipeline.execute(driver);
 * 
 * @example
 * // Comando con subconsulta
 * const subquery = qb.select('user_id').from('orders').where({ total: { $gt: 100 } });
 * const cmd = new Command({ 
 *   $match: { _id: { $in: subquery } } 
 * });
 */

import { QueryBuilder } from "@querybuilder/core";
import { jsonReplacer } from "./mongoUtils.js";

/**
 * Clase Command para construir y ejecutar comandos MongoDB
 * @class Command
 * @memberof module:@querybuilder/mongodb
 * 
 * @property {Array<Object>} _commands - Array de comandos MongoDB a ejecutar
 * @property {string} [from] - Nombre de la colección sobre la que opera el comando
 * @property {Object} [_where] - Condición WHERE para filtrar resultados
 * @property {Object} [driverDB] - Instancia del driver MongoDB para ejecutar comandos
 * 
 * @example
 * // Crear instancia de Command
 * const command = new Command(
 *   { $match: { status: 'active' } },
 *   mongoDriver
 * );
 */
class Command {
	/**
	 * Crea una instancia de Command
	 * @constructor
	 * @param {Object} [command] - Comando MongoDB inicial (ej: {$match: {...}})
	 * @param {Object} [driverDB] - Driver MongoDB para ejecutar el comando
	 * 
	 * @example
	 * // Comando vacío
	 * const cmd = new Command();
	 * 
	 * @example
	 * // Con comando inicial
	 * const cmd = new Command({ $match: { active: true } });
	 * 
	 * @example
	 * // Con comando y driver
	 * const cmd = new Command(
	 *   { $group: { _id: '$category' } },
	 *   mongoDriver
	 * );
	 */
	constructor(command, driverDB) {
		this._commands = command !== undefined ? [command] : [];
		this.from = undefined;
		this._where = undefined;
		this.driverDB = driverDB;
	}

	/**
	 * Ejecuta el comando MongoDB usando el driver proporcionado
	 * @method execute
	 * @memberof Command
	 * @async
	 * @param {Object} [driver] - Driver MongoDB para ejecutar el comando
	 * @returns {Promise<Object>} Respuesta del driver con los resultados de la ejecución
	 * @throws {Error} Si no se proporciona un driver válido
	 * 
	 * @example
	 * // Ejecutar con driver explícito
	 * const result = await command.execute(mongoDriver);
	 * console.log(result.rows);
	 * 
	 * @example
	 * // Ejecutar con driver del constructor
	 * const cmd = new Command(query, mongoDriver);
	 * const result = await cmd.execute();
	 * 
	 * @example
	 * // Manejo de errores
	 * try {
	 *   const result = await command.execute(driver);
	 *   console.log('Éxito:', result);
	 * } catch (error) {
	 *   console.error('Error ejecutando comando:', error);
	 * }
	 */
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

	/**
	 * Setter para la condición WHERE del comando
	 * @memberof Command
	 * @param {Object|QueryBuilder} where - Condición WHERE o subconsulta
	 * 
	 * @example
	 * // WHERE simple
	 * command.where = { status: 'active' };
	 * 
	 * @example
	 * // WHERE con subconsulta
	 * const subquery = qb.select('_id').from('users').where({ role: 'admin' });
	 * command.where = subquery;
	 */
	set where(where) {
		if (where instanceof QueryBuilder) {
			console.log("Resolver la subquery");
		}
		this._where = where;
	}

	/**
	 * Getter para la condición WHERE del comando
	 * @memberof Command
	 * @returns {Object|QueryBuilder} La condición WHERE actual
	 */
	get where() {
		return this._where;
	}

	/**
	 * Establece un único comando reemplazando los existentes
	 * @method set
	 * @memberof Command
	 * @param {Object} value - Comando MongoDB a establecer
	 * @returns {Command} La instancia actual para encadenamiento
	 * 
	 * @example
	 * command.set({ $match: { age: { $gte: 18 } } });
	 * 
	 * @example
	 * // Encadenamiento
	 * command
	 *   .set({ $match: { status: 'active' } })
	 *   .add({ $sort: { createdAt: -1 } });
	 */
	set(value) {
		if (value !== undefined) {
			this._commands = [value];
		}
		return this;
	}

	/**
	 * Getter que evalúa y retorna los comandos procesados
	 * @memberof Command
	 * @returns {Array<Object>} Array de comandos evaluados
	 * 
	 * @example
	 * const processedCommands = command.commands;
	 * console.log(processedCommands);
	 */
	get commands() {
		return this._commands.map((command) => {
			this.evalCommand(command, this);
			return command;
		});
	}

	/**
	 * Agrega un nuevo comando al pipeline existente
	 * @method add
	 * @memberof Command
	 * @param {Object} value - Comando MongoDB a agregar
	 * @returns {Command} La instancia actual para encadenamiento
	 * 
	 * @example
	 * // Pipeline de agregación
	 * command
	 *   .add({ $match: { status: 'active' } })
	 *   .add({ $group: { _id: '$category', total: { $sum: 1 } } })
	 *   .add({ $sort: { total: -1 } })
	 *   .add({ $limit: 10 });
	 * 
	 * @example
	 * // Agregar stage condicional
	 * if (filterByDate) {
	 *   command.add({ $match: { date: { $gte: startDate } } });
	 * }
	 */
	add(value) {
		if (value !== undefined) {
			this._commands.push(value);
		}
		return this;
	}

	/**
	 * Convierte los comandos a string JSON serializado
	 * @method toString
	 * @memberof Command
	 * @returns {string} Comandos serializados como string JSON
	 * 
	 * @description Serializa los comandos usando jsonReplacer para manejar
	 * expresiones regulares y otros tipos especiales de MongoDB.
	 * 
	 * @example
	 * const cmdString = command.toString();
	 * console.log(cmdString);
	 * // '{"$match":{"status":"active"}};{"$sort":{"date":-1}}'
	 * 
	 * @example
	 * // Con RegExp
	 * command.add({ $match: { name: /^John/i } });
	 * console.log(command.toString());
	 * // Incluye: {"__regex":true,"pattern":"^John","flags":"i"}
	 */
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

	/**
	 * Convierte los comandos a array de objetos JSON
	 * @method toJson
	 * @memberof Command
	 * @async
	 * @returns {Promise<Array<Object>>} Array de comandos evaluados como objetos
	 * 
	 * @description Evalúa y procesa todos los comandos del pipeline,
	 * resolviendo subconsultas y agregaciones, retornando objetos JavaScript.
	 * 
	 * @example
	 * // Obtener comandos como objetos
	 * const jsonCommands = await command.toJson();
	 * console.log(jsonCommands);
	 * // [
	 * //   { $match: { status: 'active' } },
	 * //   { $group: { _id: '$category', count: { $sum: 1 } } }
	 * // ]
	 * 
	 * @example
	 * // Con resultados de agregación
	 * const results = await command.toJson();
	 * if (results[0].agregaciones) {
	 *   console.log('Agregaciones:', results[0].agregaciones);
	 * }
	 */
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

	/**
	 * Evalúa recursivamente un comando resolviendo subconsultas y agregaciones
	 * @method evalCommand
	 * @memberof Command
	 * @async
	 * @private
	 * @param {Object|Array} command - Comando o array de comandos a evaluar
	 * @param {Command} parent - Comando padre para heredar contexto (from, where)
	 * @returns {Promise<Object>} Comando evaluado con subconsultas resueltas
	 * 
	 * @description Procesa recursivamente comandos MongoDB, resolviendo:
	 * - **Subconsultas QueryBuilder**: Ejecuta y reemplaza con resultados
	 * - **Agregaciones Command**: Ejecuta pipelines anidados
	 * - **Funciones**: Evalúa y reemplaza con su resultado
	 * - **Objetos y Arrays**: Procesa recursivamente
	 * 
	 * @example
	 * // Uso interno para resolver subconsulta
	 * const command = {
	 *   $match: {
	 *     userId: qb.select('_id').from('users').where({ role: 'admin' })
	 *   }
	 * };
	 * await this.evalCommand(command, this);
	 * // Resultado: { $match: { userId: [1, 2, 3] } }
	 * 
	 * @example
	 * // Con agregación anidada
	 * const command = {
	 *   $lookup: {
	 *     pipeline: new Command([
	 *       { $match: { active: true } },
	 *       { $group: { _id: '$category' } }
	 *     ])
	 *   }
	 * };
	 * await this.evalCommand(command, parent);
	 * 
	 * @example
	 * // Con función dinámica
	 * const command = {
	 *   $match: {
	 *     date: () => new Date().toISOString()
	 *   }
	 * };
	 * await this.evalCommand(command, this);
	 * // Resultado: { $match: { date: '2025-10-22T...' } }
	 */
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
