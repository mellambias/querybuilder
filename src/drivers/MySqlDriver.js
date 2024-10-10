import Driver from "./Driver.js";
import mysql from "mysql2/promise";
class MySqlDriver extends Driver {
	constructor(params) {
		super(mysql, params);
	}
	async connect() {
		this.connection = await this.library.createConnection({
			host: this.host,
			port: this.port,
			user: this.username,
			password: this.password,
			database: this.database || "",
		});
		return this;
	}

	async execute(query) {
		if (!this.connection.isConnected()) {
			await this.connect();
		}
		this.queyResult = await this.connection.query(query);
		return this;
	}

	response() {
		return this.queyResult;
	}

	async close() {
		if (this.connection.isConnected()) {
			await this.connection.close();
		}
	}
}

export default MySqlDriver;
