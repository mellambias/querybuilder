import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import MySQL from "../sql/MySQL.js";
import Types from "../types/Type.js";
import { config } from "../../config.js";

describe("Driver MySqlDriver", () => {
	const MySql8 = config.databases.MySql8;
	let sql;
	beforeEach(() => {
		const queryBuilder = new QueryBuilder(MySQL, {
			typeIdentificator: Types.identificador.regular,
		});
		sql = queryBuilder.driver(MySql8.driver, MySql8.params);
	});
	test("crea una base de datos", async () => {
		await sql.createDatabase("testing").execute();
		console.log(sql.result);
		// assert.equal(result, "CREATE DATABASE prueba;");
	});
	test("Elimina una base de datos", async () => {
		const result = await sql.dropDatabase("testing").execute();
		console.log(result);
	});
});
