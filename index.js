import QueryBuilder from "./src/querybuilder.js";
import MySQL from "./src/sql/MySQL.js";
import PostgreSQL from "./src/sql/PostgresSQL.js";
import Types from "./src/types/Type.js";
import { config } from "./config.js";

const mySqlDatabase = config.databases.MySql8;
const mariaDb = config.databases.MariaDB;
const postgesSql = config.databases.PostgresSQL;
try {
	const sql = new QueryBuilder(PostgreSQL, {
		typeIdentificator: Types.identificador.regular,
	});
	// await sql
	// 	.createDatabase("inventario")
	// 	.driver(postgesSql.driver, postgesSql.params)
	// 	.send();
	// console.log(sql.result);
	await sql
		.dropDatabase("inventario", { exist: true, force: true })
		.driver(postgesSql.driver, postgesSql.params)
		.send();
	console.log(sql.result);
} catch (error) {
	console.log(error);
	console.log("Upps!!", error.message);
}
