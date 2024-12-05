/**
 * Adaptador para conectar con bases de datos MongoDB
 *
 * Utiliza el paquete mongodb https://www.npmjs.com/package/mongodb
 */
import Driver from "./Driver.js";
import { MongoClient } from "mongodb";
import Command from "../noSql/Command.js";

const cursorCommands = [
	"find",
	"aggregate",
	"listCollections",
	"listIndexes",
	"watch",
	"explain",
];

class MongodbDriver extends Driver {
	constructor(params) {
		super(MongoClient, params);
		this.params = params;
		this.connection = null;
		this.queyResult = [];
		this.queryFields = [];
		this.queryRows = [];
		this.client = null;
	}
	async connect() {
		try {
			this.client = new this.library(this.params.getConnectionString());
			await this.client.connect();
			return this;
		} catch (error) {
			throw new Error(error);
		}
	}
	async use(database) {
		this.database = database;
	}

	async execute(query, options) {
		try {
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
				commands = query.commands;
			}
			console.log("comandos a ejecutar", commands);
			let response = null;
			for await (const command of commands) {
				if (this.isCursorCommand(command)) {
					console.log("%s en un cursor", command);
					response = await this.client
						.db(this.database)
						.runCursorCommand(command);
					for await (const doc of response) {
						this.queryRows.push(doc);
					}
					this.queyResult.push(this.queryRows);
				} else {
					response = await this.client.db(this.database).command(command);
					this.queyResult.push(response);
				}
			}
			return this;
		} catch (error) {
			console.log("[Error][MongodbDriver]", error);
			console.error("[errorResponse][MongodbDriver]", error.errorResponse);
			await this.close(error);
			return this;
		}
	}

	response() {
		console.log("[response] resultados del comando\n", this.queyResult.length);
		const columns = [];
		const rows = [];
		const response = [];

		if (Array.isArray(this.queyResult)) {
			rows.push(this.queryRows || []);
			columns.push(Object.keys(this.queryRows[0] || {}));
			response.push({
				...this.queyResult,
				rows: rows.length,
				fields: columns.length,
			});
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
		if (!this.client?.s.hasBeenClosed) {
			this.client.close();
			this.client = null;
		}
		return this;
	}

	isCursorCommand(command) {
		return Object.keys(command).some((key) => cursorCommands.includes(key));
	}
}
export default MongodbDriver;
