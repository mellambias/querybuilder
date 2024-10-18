import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import MySQL from "../sql/MySQL.js";

describe("libreria MySQL", () => {
	let sql;
	beforeEach(async () => {
		sql = new QueryBuilder(MySQL, {
			typeIdentificator: "regular",
		});
	});
	test("Comando para crear una base de datos", () => {
		const result = sql.createDatabase("testing").toString();
		assert.equal(result, "CREATE DATABASE testing;");
	});
	test("Elimina una base de datos", async () => {
		const result = await sql.dropDatabase("testing").toString();
		console.log(result);
	});
});
