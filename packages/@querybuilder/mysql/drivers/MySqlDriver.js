/**
 * @fileoverview MySQL Database Driver Implementation
 * @description MySQL driver extending base Driver class with mysql2 library
 * @version 2.0.0
 * @author Miguel E. Llambías Llansó
 * @license MPL-2.0
 */

import { Driver } from "@querybuilder/core";
import MysqlResult from "../results/MysqlResult.js";
import mysql from "mysql2/promise";

/**
 * MySQL database driver implementation
 * Extends base Driver class to provide MySQL-specific connection and query capabilities
 * Uses mysql2/promise library for async operations
 * 
 * @class MySqlDriver
 * @extends Driver
 * @version 2.0.0
 * @example
 * ```javascript
 * import MySqlDriver from '@querybuilder/mysql/drivers/MySqlDriver';
 * 
 * const driver = new MySqlDriver({
 *   host: 'localhost',
 *   port: 3306,
 *   username: 'root',
 *   password: 'password',
 *   database: 'myapp'
 * });
 * 
 * await driver.connect();
 * const result = await driver.execute('SELECT * FROM users');
 * ```
 */
class MySqlDriver extends Driver {
	/**
	 * Creates a new MySQL driver instance
	 * Initializes MySQL connection parameters and state
	 * 
	 * @constructor
	 * @memberof MySqlDriver
	 * @param {Object} params - MySQL connection parameters
	 * @param {string} [params.host='localhost'] - MySQL server host
	 * @param {number} [params.port=3306] - MySQL server port
	 * @param {string} params.username - MySQL username
	 * @param {string} params.password - MySQL password
	 * @param {string} [params.database] - Default database name
	 * @example
	 * ```javascript
	 * const driver = new MySqlDriver({
	 *   host: 'localhost',
	 *   port: 3306,
	 *   username: 'root',
	 *   password: 'mypassword',
	 *   database: 'mydb'
	 * });
	 * ```
	 */
	constructor(params) {
		super(mysql, params);
		/**
		 * MySQL connection instance
		 * @type {mysql.Connection|null}
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
		 * Current query string
		 * @type {string|null}
		 * @private
		 */
		this.query = null;

		/**
		 * Server response data
		 * @type {*}
		 * @private
		 */
		this.serverResponse = null;
	}

	/**
	 * Establishes connection to MySQL database
	 * Creates connection with proper MySQL-specific configuration
	 * 
	 * @method connect
	 * @memberof MySqlDriver
	 * @async
	 * @override
	 * @returns {Promise<Object>} Connection result with success status and error details
	 * @returns {boolean} returns.success - Whether connection was successful
	 * @returns {string|null} returns.error - Error message if connection failed
	 * @example
	 * ```javascript
	 * const result = await driver.connect();
	 * if (result.success) {
	 *   console.log('Connected to MySQL');
	 * } else {
	 *   console.error('Connection failed:', result.error);
	 * }
	 * ```
	 */
	async connect() {
		try {
			this.connection = await this.library.createConnection({
				host: this.host,
				port: this.port,
				user: this.username,
				password: this.password,
				database: this.database || "",
				multipleStatements: true, // Permite varias consultas en una llamada
				decimalNumbers: true, //DECIMAL and NEWDECIMAL types always returned as string unless you pass this config option. Could lose precision on the number as Javascript Number is a Float!
			});
			return {
				success: true,
				error: null
			};
		} catch (error) {
			return {
				success: false,
				error: error.message
			};
		}
	}

	/**
	 * Executes SQL query or multiple queries on MySQL database
	 * Handles both simple queries and prepared statements with parameters
	 * Supports multiple statements execution when separated by semicolons
	 * 
	 * @method execute
	 * @memberof MySqlDriver
	 * @async
	 * @override
	 * @param {string} query - SQL query or queries to execute
	 * @param {Array} [values=null] - Parameter values for prepared statements
	 * @param {Object} [options] - Execution options
	 * @returns {Promise<void>} Resolves when execution completes
	 * @throws {Error} When query execution fails
	 * @example
	 * ```javascript
	 * // Simple query
	 * await driver.execute('SELECT * FROM users');
	 * 
	 * // Prepared statement
	 * await driver.execute('SELECT * FROM users WHERE id = ?', [1]);
	 * 
	 * // Multiple statements
	 * await driver.execute('INSERT INTO users (name) VALUES ("John"); SELECT LAST_INSERT_ID();');
	 * ```
	 */
	async execute(query, values = null, options) {
		this.queyResult = [];
		this.queryFields = [];
		this.results = [];
		try {
			if (this.connection === null) {
				await this.connect();
			}
			/**  this.queyResult Puede ser
			 * - INSERT, UPDATE, DELETE, etc un objeto ResultSetHeader, which provides details about the operation executed by the server.
			 * - Si multipleStatements=true entonces contiene un Array de objetos ResultSetHeader
			 * - SELECT -> contains rows returned by server
			 * this.queryFields contains extra meta data about the operation, if available
			 */
			const querys = query
				.split(";")
				.filter((q) => q.length > 2)
				.map((item) => item.trim().concat(";"));
			for (this.query of querys) {
				// Si se proporcionan valores, usarlos para prepared statements
				if (values && Array.isArray(values)) {
					this.serverResponse = await this.connection.execute(this.query, values);
				} else {
					this.serverResponse = await this.connection.query(this.query);
				}
				this.queyResult.push(new MysqlResult(this.query, this.serverResponse));
			}
			if (
				options?.transaction === undefined ||
				options?.transaction === false
			) {
				await this.close();
			}

			// Devolver resultado estructurado para tests
			return {
				success: true,
				response: this.getFormattedResponse(),
				error: null,
				count: this.queyResult.length
			};
		} catch (error) {
			await this.close();
			const result = new MysqlResult(this.query, this.serverResponse);
			if (error.sqlMessage) {
				const parts = error.sqlMessage.split("; ");
				result.info = parts[0] || '';
				result.error = parts[1] || error.sqlMessage;
			} else {
				result.error = error.message;
			}
			result.errorStatus = 1;
			this.queyResult.push(result);

			// Devolver error estructurado para tests
			return {
				success: false,
				response: null,
				error: error.sqlMessage || error.message,
				count: this.queyResult.length
			};
		}
	}

	/**
	 * Formatear respuesta para compatibilidad con tests
	 */
	getFormattedResponse() {
		if (this.queyResult.length === 0) {
			return [];
		}

		// Si hay un solo resultado, devolver su respuesta directamente
		if (this.queyResult.length === 1) {
			const result = this.queyResult[0];
			return result.response || [];
		}

		// Si hay múltiples resultados, devolver array de respuestas
		return this.queyResult.map(result => result.response || []);
	}

	response() {
		return { res: this.queyResult, count: this.queyResult.length };
	}

	async close() {
		try {
			if (this.connection !== null) {
				await this.connection.close();
				this.connection = null;
			}
			return {
				success: true,
				error: null
			};
		} catch (error) {
			return {
				success: false,
				error: error.message
			};
		}
	}
}

export default MySqlDriver;
