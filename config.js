/**
 * Configuracion
 */

import MySqlDriver from "./src/drivers/MySqlDriver.js";
import PostgresDriver from "./src/drivers/PostgresDriver.js";

const config = {
	databases: {
		MySql8: {
			version: "8.4.3",
			driver: MySqlDriver,
			params: {
				host: "localhost",
				port: "3308",
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
		PostgresSQL: {
			version: "16",
			driver: PostgresDriver,
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
