/**
 * Configuracion
 */

import MySqlDriver from "./src/drivers/MySqlDriver.js";
import PostgreSQLDriver from "./src/drivers/PostgreSQLDriver.js";

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
	},
};

export { config };
