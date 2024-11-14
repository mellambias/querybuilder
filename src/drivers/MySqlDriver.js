import Driver from "./Driver.js";
import mysql from "mysql2/promise";
class MySqlDriver extends Driver {
	constructor(params) {
		super(mysql, params);
		this.connection = null;
		this.queyResult = null;
		this.queryFields = null;
	}
	async connect() {
		this.connection = await this.library.createConnection({
			host: this.host,
			port: this.port,
			user: this.username,
			password: this.password,
			database: this.database || "",
			multipleStatements: true,
		});
		return this;
	}

	async execute(query, options) {
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
			[this.queyResult, this.queryFields] = await this.connection.query(query);
			if (
				options?.transaction === undefined ||
				options?.transaction === false
			) {
				await this.close();
			}
			return this;
		} catch (error) {
			await this.close();
			throw new Error(`[Driver execute] ${error.message}`);
		}
	}
	isResultSetHeader(data) {
		if (!data || typeof data !== "object") return false;
		const keys = [
			"fieldCount",
			"affectedRows",
			"insertId",
			"info",
			"serverStatus",
			"warningStatus",
			"changedRows",
		];

		return keys.every((key) => key in data);
	}

	response() {
		const response = [];
		const rows = [];
		for (const element of this.queyResult) {
			response.push(element);
			if (!this.isResultSetHeader(element)) {
				rows.push(...element);
			}
		}

		const columns = this.fields();
		return { response, rows, columns };
	}
	fields() {
		if (Array.isArray(this.queryFields)) {
			return this.queryFields
				.filter((item) => item !== undefined)
				.reduce((prev, item) => item, []);
		}
		return this.queryFields;
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
