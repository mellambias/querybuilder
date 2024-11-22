/**
 * Adaptador para conectar con bases de datos MongoDB
 *
 * Utiliza el paquete mongodb https://www.npmjs.com/package/mongodb
 */
import Driver from "./Driver.js";
import { MongoClient } from "mongodb";

class MongodbDriver extends Driver {
	constructor(params) {
		super(MongoClient, params);
		this.connection = null;
		this.queyResult = [];
		this.queryFields = [];
		this.client = new MongoClient(params.getConnectionString());
	}
	async connect() {
		try {
			console.log("conectando con la base de datos");
			await this.client.connect();
			console.log("conectado a la base de datos");
			// const dbs = await this.client.db().admin().listDatabases();
			// console.table(dbs.databases);
			const cursor = await this.client.db("fullstack").runCursorCommand({
				find: "users",
				filter: { username: "root" },
			});
			for await (const doc of cursor) {
				console.log(doc);
			}
			// const temp = await this.client
			// 	.db("fullstack")
			// 	.command({ find: "users", filter: { username: "root" } });
			// console.log(temp);
		} catch (error) {
			return new Error(error);
		} finally {
			this.client.close();
		}
	}
	async use(database) {
		this.database = database;
	}
	async getTable(name) {
		await this.execute({
			find: "tableDef",
			filter: { tableName: name },
		});
		const { response } = this.response();
		return response;
	}
	async execute(query, options) {
		try {
			console.log(
				`[MongodbDriver][execute] envia la consulta a la base de datos '${this.database}'`,
			);
			await this.client.connect();
			// const dbs = await this.client.db().admin().listDatabases();
			// console.table(dbs.databases);
			if (typeof query === "string") {
				const querys = query.split(";").filter((q) => q.length > 0);
				for await (const query of querys) {
					console.log("[MongodbDriver][execute]comando string", query);
					let sendCommand = query;
					if (typeof query === "string") {
						sendCommand = JSON.parse(query);
					}
					const result = await this.client
						.db(this.database)
						.command(sendCommand);
					this.queyResult.push(result);
				}
			} else {
				console.log("[MongodbDriver][execute]comando object", query);
				const cursor = await this.client
					.db(this.database)
					.runCursorCommand(query);
				for await (const doc of cursor) {
					this.queyResult.push(doc);
				}
			}

			// const cursor = await this.client.db(this.database).runCursorCommand({
			// 	find: "users",
			// 	filter: { username: "root" },
			// });
			// for await (const doc of cursor) {
			// 	this.queyResult.push(doc);
			// }
			this.client.close();
			return this;
		} catch (error) {
			console.log(error);
			console.error("[MongodbDriver]", error.errorResponse);
			this.client.close();
			return this;
		}
	}

	response() {
		const rows = [];
		const columns = [];
		const response = [];
		return { response: this.queyResult, rows, columns };
	}

	async close() {
		console.log("cierra la conexión");
	}
}
export default MongodbDriver;
