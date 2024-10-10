/*
clase base para los drivers/connectores a bases de datos
*/
import Driver from "./Driver.js";
import pg from "pg";
class PostgresDriver extends Driver {
	constructor(params) {
		super(pg, params);
	}

	async connect() {
		console.log("conecta con la base de datos", this.database);
		const { Client } = this.library;
		this.client = new Client({
			host: this.host,
			port: this.port,
			user: this.username,
			password: this.password,
			database: this.database,
		});
		await this.client.connect();
		return this;
	}

	async use(database) {
		// no implementa este comando, debe cerrar y abrir una nueva conexion
		this.database = database;
		await this.close();
		await this.connect();
	}
	async execute(query) {
		this.queyResult = await this.client.query(query);
		return this;
	}

	response() {
		console.log("devuelve la respuesta del servidor");
		return this.queyResult;
	}

	async close() {
		console.log("cierra la conexión");
		await this.client.end();
	}
}

export default PostgresDriver;
