/**
 * @fileoverview MongoDB Database Driver Implementation
 * @description MongoDB driver extending base Driver class with mongodb library
 * @version 2.0.0
 * @author Miguel E. Llambías Llansó
 * @license MPL-2.0
 */

/**
 * Adaptador para conectar con bases de datos MongoDB
 * Utiliza el paquete mongodb https://www.npmjs.com/package/mongodb
 */
import { Driver } from "@querybuilder/core";
import { MongoClient } from "mongodb";
import Command from "../Command.js";
import { jsonReviver } from "../mongoUtils.js";

/**
 * MongoDB database driver implementation
 * Extends base Driver class to provide MongoDB-specific connection and operations
 * Uses official MongoDB Node.js driver for database operations
 * 
 * @class MongodbDriver
 * @extends Driver
 * @version 2.0.0
 * @example
 * ```javascript
 * import MongodbDriver from '@querybuilder/mongodb/drivers/MongodbDriver';
 * 
 * const driver = new MongodbDriver({
 *   host: 'localhost',
 *   port: 27017,
 *   database: 'myapp',
 *   getConnectionString: () => 'mongodb://localhost:27017/myapp'
 * });
 * 
 * await driver.connect();
 * const result = await driver.execute(new Command('find', 'users', {}));
 * ```
 */
class MongodbDriver extends Driver {
	/**
	 * Creates a new MongoDB driver instance
	 * Initializes MongoDB connection parameters and state
	 * 
	 * @constructor
	 * @memberof MongodbDriver
	 * @param {Object} params - MongoDB connection parameters
	 * @param {string} [params.host='localhost'] - MongoDB server host
	 * @param {number} [params.port=27017] - MongoDB server port
	 * @param {string} [params.database] - Default database name
	 * @param {Function} params.getConnectionString - Function returning MongoDB connection string
	 * @example
	 * ```javascript
	 * const driver = new MongodbDriver({
	 *   host: 'localhost',
	 *   port: 27017,
	 *   database: 'mydb',
	 *   getConnectionString: () => 'mongodb://localhost:27017/mydb'
	 * });
	 * ```
	 */
	constructor(params) {
		super(MongoClient, params);
		/**
		 * MongoDB connection parameters
		 * @type {Object}
		 * @private
		 */
		this.params = params;

		/**
		 * MongoDB database connection instance
		 * @type {mongodb.Db|null}
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

		/**
		 * Query result rows
		 * @type {Array}
		 * @private
		 */
		this.queryRows = [];

		/**
		 * MongoDB client instance
		 * @type {MongoClient|null}
		 * @private
		 */
		this.client = null;

		/**
		 * Active process counter for connection management
		 * @type {number}
		 * @private
		 */
		this._process = 0;
	}

	/**
	 * Establishes connection to MongoDB database
	 * Creates MongoClient connection using connection string
	 * 
	 * @method connect
	 * @memberof MongodbDriver
	 * @async
	 * @override
	 * @returns {Promise<MongodbDriver>} Driver instance for method chaining
	 * @throws {Error} When connection fails
	 * @example
	 * ```javascript
	 * try {
	 *   await driver.connect();
	 *   console.log('Connected to MongoDB');
	 * } catch (error) {
	 *   console.error('Connection failed:', error.message);
	 * }
	 * ```
	 */
	async connect() {
		try {
			this.client = new this.library(this.params.getConnectionString());
			await this.client.connect();
			// console.log(`Conectado a ${this.params.getConnectionString()}`);
			return this;
		} catch (error) {
			throw new Error(
				`No se puede conectar a ${this.params.getConnectionString()}`,
				{
					cause: error,
				},
			);
		}
	}

	/**
	 * Switches to a different MongoDB database
	 * Sets the database name for subsequent operations
	 * 
	 * @method use
	 * @memberof MongodbDriver
	 * @async
	 * @override
	 * @param {string} database - Name of the database to switch to
	 * @returns {Promise<void>} Resolves when database is set
	 * @example
	 * ```javascript
	 * await driver.use('new_database');
	 * console.log('Switched to new_database');
	 * ```
	 */
	async use(database) {
		this.database = database;
	}

	/**
	 * Sets the active process counter for connection management
	 * Automatically closes connection when counter reaches zero
	 * 
	 * @setter process
	 * @memberof MongodbDriver
	 * @param {number} value - Process counter value
	 * @example
	 * ```javascript
	 * driver.process = 1; // Increment active processes
	 * driver.process = 0; // Decrements and closes connection when zero
	 * ```
	 */
	set process(value) {
		this._process = value;
		if (this._process <= 0) {
			this._process = 0;
			this.close();
		}
	}

	/**
	 * Gets the active process counter
	 * 
	 * @getter process
	 * @memberof MongodbDriver
	 * @returns {number} Current process counter value
	 * @example
	 * ```javascript
	 * console.log('Active processes:', driver.process);
	 * ```
	 */
	get process() {
		return this._process;
	}
	async execute(query, options) {
		try {
			this.process++;
			// console.log("[driver][execute] \n>>>\n%o\n<<<\n", query);
			if (this.client === null) {
				await this.connect();
			}
			// Array con los comandos a ejecutar
			let commands;
			if (typeof query === "string") {
				commands = query
					.split(";")
					.filter((q) => q.length > 0)
					.map((command) => JSON.parse(command, jsonReviver));
			}

			if (query instanceof Command) {
				// console.log("Es un Commando");
				commands = query.commands;
			}
			// console.log("ℹ  comandos a ejecutar >>>");
			// console.dir(commands, { depth: 3 });
			// console.log("\n<<<");
			let response = null;
			for await (const command of commands) {
				// console.log("Current command");
				// console.dir(command, { depth: 4 });
				response = await this.client.db(this.database).command(command);
				// console.log("ℹ Procesando el 'resultado'", response);
				if (response?.cursor) {
					// console.log("ℹ cursor %o", response.cursor);
					for await (const doc of response.cursor.firstBatch) {
						this.queryRows.push(doc);
					}
					if (this.queryRows.length) this.queyResult.push(this.queryRows);
				} else {
					this.queyResult.push(response);
				}
			}
			this.process--;
			return this;
		} catch (error) {
			// console.log("[MongodbDriver][execute]", error);
			// console.error("[MongodbDriver][errorResponse]", error.errorResponse);
			this.process--;
			await this.close(error);
			return this;
		}
	}

	response() {
		//console.log("[response] resultados del comando: %o\n", this.queyResult);
		const columns = [];
		const rows = [];
		const response = [];

		if (Array.isArray(this.queyResult)) {
			for (const result of this.queyResult) {
				rows.push(this.queryRows || []);
				columns.push(Object.keys(this.queryRows[0] || {}));
				response.push({
					...result,
				});
			}
		} else {
			response.push(this.queyResult);
		}
		// clear
		this.queyResult = [];
		this.queryFields = [];
		this.queryRows = [];

		return { response, rows, columns };
	}

	async close(error) {
		if (this.client === null) {
			return this;
		}
		if (!this.client?.s.hasBeenClosed && this.process <= 0) {
			this.client.close();
			this.client = null;
		}
		return this;
	}
}
export default MongodbDriver;
