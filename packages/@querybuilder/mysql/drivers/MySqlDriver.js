import { Driver } from "@querybuilder/core";
import MysqlResult from "../results/MysqlResult.js";
import mysql from "mysql2/promise";
class MySqlDriver extends Driver {
	constructor(params) {
		super(mysql, params);
		this.connection = null;
		this.queyResult = [];
		this.query = null;
		this.serverResponse = null;
	}
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
