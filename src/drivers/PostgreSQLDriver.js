/*
clase base para los drivers/connectores a bases de datos
*/
import Driver from "./Driver.js";
import pg from "pg";
const { Client } = pg;
class PostgreSQLDriver extends Driver {
	constructor(params) {
		super(pg, params);
		this.connection = null;
		this.queyResult = null;
		this.queryFields = null;
	}

	async connect() {
		try {
			console.log(
				"[postgreSQL:pg] conecta con la base de datos '%s'",
				this.database ? this.database : "postgreSQL",
			);
			// const { Client } = this.library;
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
			return new Error(`Error de conexion ${error.message} ${error.stack}`);
		}
	}

	/**
	 * postgreSQL debe cerrar la conexion actual
	 * y abrir una nueva conexion con la database
	 * @param {string} database - nombre de la base de datos
	 */

	async use(database) {
		this.database = database.toLowerCase();
		await this.close();
		return this;
	}
	async execute(query, options) {
		try {
			if (this.connection === null) {
				await this.connect();
			}
			this.queyResult = await this.connection.query(query);
			await this.close();
			return this;
		} catch (error) {
			await this.close();
			throw new Error(`[Driver execute] ${error.message}`);
		}
	}

	/**
	 * queryResult.rows:Array<any> - filas devueltas
	 * queryResult.fields: Array<FieldInfo> - name, dataTypeID de los campos
	 * queryResult.command: string - el último comando ejecutado INSER, UPDATE, CREATE, SELECT, ...
	 * queryResult.rowCount: int | null - numero de filas procesadas por el servidor
	 *  https://www.postgresql.org/docs/current/protocol-message-formats.html CommandComplete
	 *
	 * @returns
	 */

	response() {
		console.log("devuelve la respuesta del servidor", this.queyResult);
		const response = [];
		const rows = this.queyResult.rows;
		const columns = [];
		if (this.queryResult?.fields) {
			columns.push(...this.queryResult.fields);
		}

		return { response, rows, columns };
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
