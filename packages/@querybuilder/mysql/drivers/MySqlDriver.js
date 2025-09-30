import Driver from "../../core/drivers/Driver.js";
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
		this.connection = await this.library.createConnection({
			host: this.host,
			port: this.port,
			user: this.username,
			password: this.password,
			database: this.database || "",
			multipleStatements: true, // Permite varias consultas en una llamada
			decimalNumbers: true, //DECIMAL and NEWDECIMAL types always returned as string unless you pass this config option. Could lose precision on the number as Javascript Number is a Float!
		});
		return this;
	}

	async execute(query, options) {
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
				this.serverResponse = await this.connection.query(this.query);
				this.queyResult.push(new MysqlResult(this.query, this.serverResponse));
			}
			if (
				options?.transaction === undefined ||
				options?.transaction === false
			) {
				await this.close();
			}
			return this;
		} catch (error) {
			await this.close();
			const result = new MysqlResult(this.query, this.serverResponse);
			[result.info, result.error] = error.sqlMessage.split("; ");
			result.errorStatus = 1;
			this.queyResult.push(result);
			return this;
		}
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
			return this;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export default MySqlDriver;
