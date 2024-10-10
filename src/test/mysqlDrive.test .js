import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import MySQL from "../sql/MySQL.js";
import Types from "../types/Type.js";
import { config } from "../../config.js";

describe("Driver MySqlDriver", () => {
	test("crea una base de datos", async () => {
		const MySql8 = config.databases.MySql8;
		const sql = new QueryBuilder(MySQL, {
			typeIdentificator: Types.identificador.regular,
		});
		await sql
			.createDatabase("testing")
			.driver(MySql8.driver, MySql8.params)
			.execute();
		console.log(sql.result);
		// assert.equal(result, "CREATE DATABASE prueba;");
	});
	test("Elimina una base de datos", async () => {
		const MySql8 = config.databases.MySql8;
		const sql = new QueryBuilder(MySQL, {
			typeIdentificator: Types.identificador.regular,
		});
		const result = await sql
			.dropDatabase("testing")
			.driver(MySql8.driver, MySql8.params)
			.execute();
		console.log(result);
	});
});
