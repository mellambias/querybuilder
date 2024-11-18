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
		this.queyResult = [];
		this.queryFields = [];
	}

	async connect() {
		try {
			console.log(
				"✔ [postgreSQL:pg] conecta con la base de datos '%s'",
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
			return new Error(
				`❌[PostgreSQLDriver] Error de conexion ${error.message} ${error.stack}`,
			);
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
			const querys = query.split(";").filter((q) => q.length > 0);
			for (const query of querys) {
				const result = await this.connection.query(query);
				this.queyResult.push(result);
			}
			await this.close();
			return this;
		} catch (error) {
			await this.close();
			throw new Error(`❌ [PostgreSQLDriver execute] ${error.message}`);
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

	filterResult(queryResult) {
		const keys = ["command", "rowCount", "oid", "rows", "fields", "RowCtor"];
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
