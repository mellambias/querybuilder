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
					response = await this.client
						.db(this.database)
						.runCursorCommand(command);
					for await (const doc of response) {
						this.queyResult.push(doc);
					}
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
		const rows = [];
		const columns = [];
		const response = this.queyResult;
		this.queyResult = [];
		this.queryFields = [];
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
