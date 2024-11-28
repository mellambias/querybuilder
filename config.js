/**
 * Configuracion
 */

import MySqlDriver from "./src/drivers/MySqlDriver.js";
import PostgreSQLDriver from "./src/drivers/PostgreSQLDriver.js";
import MongodbDriver from "./src/drivers/MongodbDriver.js";

const config = {
	databases: {
		MySql8: {
			version: "8.4.3",
			driver: MySqlDriver,
			params: {
				host: "localhost",
				port: "3308",
				xport: "33060",
				username: "root",
				password: "d4t55qpl",
			},
		},
		MariaDB: {
			version: "",
			driver: MySqlDriver,
			params: {
				host: "localhost",
				port: "3306",
				username: "root",
				password: "d4t55qpl",
			},
		},
		PostgreSQL: {
			version: "16",
			driver: PostgreSQLDriver,
			params: {
				host: "localhost",
				port: 5432,
				username: "postgres",
				password: "d4t55qpl",
			},
		},
		MongoDB: {
			version: "8.0.3",
			driver: MongodbDriver,
			params: {
				host: "localhost",
				port: 27017,
				username: undefined,
				password: undefined,
				options: {
					retryWrites: true,
					w: "majority",
					connectTimeoutMS: 30000,
				},
				getConnectionString: function () {
					const { host, port, username, password, options } = this;
					const userPaswordString =
						username !== undefined ? `${username}:${password}@` : "";
					const optionsString = `?${Object.keys(options)
						.map((key) => `${key}=${options[key]}`)
						.join("&")}`;
					return `mongodb://${userPaswordString}${host}${port ? `:${port}` : ""}/${optionsString}`;
				},
			},
		},
	},
};

export { config };
