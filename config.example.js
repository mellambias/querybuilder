/**
 * 🔧 Database Configuration Template
 * ==================================
 * 
 * Copy this file to 'config.js' and update with your real credentials.
 * The real 'config.js' file is ignored by git for security.
 */

import { MySqlDriver } from "@querybuilder/mysql";
import { PostgreSQLDriver } from "@querybuilder/postgresql";
import { MongodbDriver } from "@querybuilder/mongodb";

const config = {
	databases: {
		MySql8: {
			version: "8.4.3",
			driver: MySqlDriver,
			params: {
				host: "localhost",
				port: "3306",
				xport: "33060",
				username: "your_mysql_username",
				password: "your_mysql_password",
				database: "your_database_name"
			},
		},
		MariaDB: {
			version: "11.0",
			driver: MySqlDriver,
			params: {
				host: "localhost",
				port: "3306",
				username: "your_mariadb_username",
				password: "your_mariadb_password",
				database: "your_database_name"
			},
		},
		PostgreSQL: {
			version: "16",
			driver: PostgreSQLDriver,
			params: {
				host: "localhost",
				port: 5432,
				username: "your_postgres_username",
				password: "your_postgres_password",
				database: "your_database_name"
			},
		},
		MongoDB: {
			version: "8.0.3",
			driver: MongodbDriver,
			params: {
				host: "localhost",
				port: 27017,
				username: "your_mongo_username", // undefined if no auth
				password: "your_mongo_password", // undefined if no auth
				database: "your_database_name",
				options: {
					retryWrites: true,
					w: "majority",
					connectTimeoutMS: 30000,
				},
				getConnectionString: function () {
					const { host, port, username, password, options } = this;
					const userPasswordString =
						username !== undefined ? `${username}:${password}@` : "";
					const optionsString = `?${Object.keys(options)
						.map((key) => `${key}=${options[key]}`)
						.join("&")}`;
					return `mongodb://${userPasswordString}${host}${port ? `:${port}` : ""}/${this.database}${optionsString}`;
				},
			},
		},
	},
	testing: {
		MySQL: {
			version: "8.4.3",
			driver: MySqlDriver,
			params: {
				host: "localhost",
				port: "3306",
				username: "your_mysql_username",
				password: "your_mysql_password",
				database: "querybuilder_test"
			},
		},
		PostgreSQL: {
			version: "16",
			driver: PostgreSQLDriver,
			params: {
				host: "localhost",
				port: 5432,
				username: "your_postgres_username",
				password: "your_postgres_password",
				database: "querybuilder_test"
			},
		},
		MongoDB: {
			version: "8.0.3",
			driver: MongodbDriver,
			params: {
				host: "localhost",
				port: 27017,
				username: "your_mongo_username", // undefined if no auth
				password: "your_mongo_password", // undefined if no auth
				database: "querybuilder_test",
				options: {
					retryWrites: true,
					w: "majority",
					connectTimeoutMS: 30000,
				},
				getConnectionString: function () {
					const { host, port, username, password, options } = this;
					const userPasswordString =
						username !== undefined ? `${username}:${password}@` : "";
					const optionsString = `?${Object.keys(options)
						.map((key) => `${key}=${options[key]}`)
						.join("&")}`;
					return `mongodb://${userPasswordString}${host}${port ? `:${port}` : ""}/${this.database}${optionsString}`;
				},
			},
		},
	},
};

export { config };
export default config;