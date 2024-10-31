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

	async execute(query) {
		try {
			if (this.connection === null) {
				await this.connect();
			}
			[this.queyResult, this.queryFields] = await this.connection.query(query);
			await this.close();
			return this;
		} catch (error) {
			await this.close();
			throw new Error(`[Driver execute] ${error.message}`);
		}
	}

	response() {
		return this.queyResult;
	}
	fields() {
		return this.queryFields;
	}

	async close() {
		try {
			if (this.connection !== null) {
				await this.connection.close();
				this.connection = null;
				return this;
			}
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export default MySqlDriver;
