/**
 * @fileoverview PostgreSQL Database Driver Implementation
 * @description PostgreSQL driver extending base Driver class with pg library
 * @version 2.0.0
 * @author Miguel E. Llambías Llansó
 * @license MPL-2.0
 */

/**
 * Adaptador para conectar con bases de datos PostgreSQL
 * utiliza la libreria pg https://www.npmjs.com/package/pg
 */
import { Driver } from "@querybuilder/core";
import pg from "pg";
const { Client } = pg;

/**
 * PostgreSQL database driver implementation
 * Extends base Driver class to provide PostgreSQL-specific connection and query capabilities
 * Uses pg (node-postgres) library for database operations
 * 
 * @class PostgreSQLDriver
 * @extends Driver
 * @version 2.0.0
 * @example
 * ```javascript
 * import PostgreSQLDriver from '@querybuilder/postgresql/drivers/PostgreSQLDriver';
 * 
 * const driver = new PostgreSQLDriver({
 *   host: 'localhost',
 *   port: 5432,
 *   username: 'postgres',
 *   password: 'password',
 *   database: 'myapp'
 * });
 * 
 * await driver.connect();
 * const result = await driver.execute('SELECT * FROM users');
 * ```
 */
class PostgreSQLDriver extends Driver {
	/**
	 * Creates a new PostgreSQL driver instance
	 * Initializes PostgreSQL connection parameters and state
	 * 
	 * @constructor
	 * @memberof PostgreSQLDriver
	 * @param {Object} params - PostgreSQL connection parameters
	 * @param {string} [params.host='localhost'] - PostgreSQL server host
	 * @param {number} [params.port=5432] - PostgreSQL server port
	 * @param {string} params.username - PostgreSQL username
	 * @param {string} params.password - PostgreSQL password
	 * @param {string} [params.database] - Default database name
	 * @example
	 * ```javascript
	 * const driver = new PostgreSQLDriver({
	 *   host: 'localhost',
	 *   port: 5432,
	 *   username: 'postgres',
	 *   password: 'mypassword',
	 *   database: 'mydb'
	 * });
	 * ```
	 */
	constructor(params) {
		super(pg, params);
		/**
		 * PostgreSQL client connection instance
		 * @type {pg.Client|null}
		 * @private
		 */
		this.connection = null;

		/**
		 * Query execution results
		 * @type {Array}
		 * @private
		 */
		this.queyResult = [];

		/**
		 * Query field metadata
		 * @type {Array}
		 * @private
		 */
		this.queryFields = [];
	}

	/**
	 * Establishes connection to PostgreSQL database
	 * Creates connection using pg.Client with provided parameters
	 * 
	 * @method connect
	 * @memberof PostgreSQLDriver
	 * @async
	 * @override
	 * @returns {Promise<PostgreSQLDriver|Error>} Driver instance or Error object
	 * @example
	 * ```javascript
	 * const result = await driver.connect();
	 * if (result instanceof Error) {
	 *   console.error('Connection failed:', result.message);
	 * } else {
	 *   console.log('Connected to PostgreSQL');
	 * }
	 * ```
	 */
	async connect() {
		try {
			console.log(
				"✔ [postgreSQL:pg] conecta con la base de datos '%s'",
				this.database ? this.database : "postgreSQL",
			);
			this.connection = new Client({
				host: this.host,
				port: this.port,
				user: this.username,
				password: this.password,
				database: this.database,
			});
			await this.connection.connect();
			return this;
		} catch (error) {
			console.log("Error de conexion", error);
			return new Error(
				`❌[PostgreSQLDriver] Error de conexion ${error.message} ${error.stack}`,
			);
		}
	}

	/**
	 * Switches to a different PostgreSQL database
	 * Closes current connection and reopens with new database
	 * Note: PostgreSQL requires reconnection to switch databases
	 * 
	 * @method use
	 * @memberof PostgreSQLDriver
	 * @async
	 * @override
	 * @param {string} database - Name of the database to switch to
	 * @returns {Promise<PostgreSQLDriver>} Driver instance for method chaining
	 * @example
	 * ```javascript
	 * await driver.use('new_database');
	 * console.log('Switched to new_database');
	 * ```
	 */
	async use(database) {
		this.database = database.toLowerCase();
		await this.close();
		return this;
	}
	async execute(query, options) {
		this.queyResult = [];
		this.queryFields = [];
		try {
			if (this.connection === null) {
				await this.connect();
			}
			const querys = query.split(";").filter((q) => q.length > 0);
			for (const query of querys) {
				if (query.toLowerCase().startsWith("use")) {
					const [_, database] = query.replaceAll(";", "").split(" ");
					if (this.database !== database) {
						await this.use(database);
						await this.connect();
					}
					this.queyResult.push({
						command: "USE",
						rowCount: 0,
						rows: [],
						fields: [],
						RowCtor: 0,
					});
					continue;
				}
				const result = await this.connection.query(query);
				this.queyResult.push(result);
			}
			if (
				options?.transaction === undefined ||
				options?.transaction === false
			) {
				await this.close();
			}
			return this;
		} catch (error) {
			await this.close();
			throw new Error(`❌ [PostgreSQLDriver execute] ${error.message}`);
		}
	}

	response() {
		try {
			const rows = [];
			const columns = [];
			const response = [];
			if (Array.isArray(this.queyResult)) {
				for (const result of this.queyResult) {
					const filtered = this.filterResult(result);
					response.push({
						...filtered,
						rows: filtered.rows.length,
						fields: filtered.fields.length,
					});
					rows.push(filtered.rows);
					columns.push(this.fields(filtered.fields));
				}
				return { response, rows, columns };
			}
		} catch (error) {
			return new Error(`❌[PostgreSQLDriver][response] ${error}`);
		}
	}
	/**
	 * queryResult.rows:Array<any> - filas devueltas
	 * queryResult.fields: Array<FieldInfo> - name, dataTypeID de los campos
	 * queryResult.command: string - el último comando ejecutado INSER, UPDATE, CREATE, SELECT, ...
	 * queryResult.rowCount: int | null - numero de filas procesadas por el servidor
	 * https://github.com/brianc/node-postgres/blob/master/docs/pages/apis/result.mdx
	 *
	 * @returns
	 */
	filterResult(queryResult) {
		const keys = ["command", "rowCount", "rows", "fields", "RowCtor"];
		console.log("queryResult", queryResult);
		return Object.keys(queryResult)
			.filter(
				(key) =>
					keys.includes(key) &&
					queryResult[key] !== undefined &&
					queryResult[key] !== null,
			)
			.reduce((result, key) => {
				if (Array.isArray(queryResult[key])) {
					if (queryResult[key]?.length > 0) {
						result[key] = queryResult[key];
					} else {
						result[key] = [];
					}
				} else {
					result[key] = queryResult[key];
				}
				return result;
			}, {});
	}

	fields(queryFields) {
		let campos = [];
		if (Array.isArray(queryFields)) {
			campos = queryFields
				.filter((item) => item !== undefined)
				.reduce((prev, item) => {
					prev.push(item.name);
					return prev;
				}, []);
		}

		return campos;
	}

	async close() {
		try {
			if (this.connection instanceof Client) {
				await this.connection.end();
				this.connection = null;
			}
			return this;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export default PostgreSQLDriver;
