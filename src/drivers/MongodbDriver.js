/**
 * Adaptador para conectar con bases de datos MongoDB
 *
 * Utiliza el paquete mongodb https://www.npmjs.com/package/mongodb
 */
import Driver from "./Driver.js";
import { MongoClient } from "mongodb";
import Command from "../noSql/Command.js";

class MongodbDriver extends Driver {
	constructor(params) {
		super(MongoClient, params);
		this.params = params;
		this.connection = null;
		this.queyResult = [];
		this.queryFields = [];
		this.queryRows = [];
		this.client = null;
		this._process = 0;
	}
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
	async use(database) {
		this.database = database;
	}

	set process(value) {
		this._process = value;
		if (this._process <= 0) {
			this._process = 0;
			this.close();
		}
	}
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
					.map((command) => JSON.parse(command));
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
