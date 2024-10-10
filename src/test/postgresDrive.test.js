import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import PostgreSQL from "../sql/PostgresSQL.js";
import Types from "../types/Type.js";
import { config } from "../../config.js";

describe("Driver PostgresDriver", () => {
	const PostgresSQL = config.databases.PostgresSQL;
	let sql;
	beforeEach(() => {
		const queryBuilder = new QueryBuilder(PostgreSQL, {
			typeIdentificator: Types.identificador.regular,
		});
		sql = queryBuilder.driver(PostgresSQL.driver, PostgresSQL.params);
	});
	test("Crear una base de datos", { only: false }, async () => {
		await sql.createDatabase("testing").execute();
		console.log(sql.result);
		// assert.equal(result, "CREATE DATABASE prueba;");
	});
	test("Crear un esquema", { only: true }, async () => {
		await sql.use("testing").createSchema("CD_INVENTARIO").execute();
		console.log(sql.result);
	});
	test("Elimina una base de datos", { only: false }, async () => {
		await sql.dropDatabase("testing", { force: true }).execute();
		console.log(sql.result);
	});
});
