import { test, after, suite } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import { getResultFromTest, checktable } from "../utilsForTest/resultUtils.js";

// SETUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;

const databaseTest = new Driver(MySql8.params);
const current = { databaseTest, dataBase: "testing" };
// crea una funcion que al ser llamada usa como 'this' el valor pasado a 'bind'
const tableExist = checktable.bind(current);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
// añade el driver a queryBuilder
const qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Driver MySqlDriver", async () => {
	test("crea una base de datos", async () => {
		const debug = false;
		const result = await qb.createDatabase("testing").execute(debug);
		// showResults(result, debug);

		const resultTest = await getResultFromTest(databaseTest, "show databases");
		assert.ok(
			resultTest.some((item) => Object.values(item).includes("testing")),
			"La base de datos 'testing' no ha sido creada",
		);
		//Limpia la query
		result.dropQuery();
	});
	test("Crear una tabla en la base de datos testing", async () => {
		const debug = false;
		const result = await qb
			.use("testing")
			.dropTable("TABLE_TEST", { secure: true })
			.createTable("TABLE_TEST", { cols: { ID: "INT" } })
			.execute(debug);

		// showResults(result, debug);

		assert.equal(
			await result.toString(),
			"USE testing;\nDROP TABLE IF EXISTS TABLE_TEST;\nCREATE TABLE TABLE_TEST\n( ID INT );",
		);
		await tableExist("TABLE_TEST", { ID: "INT" });
	});
	//Fin test
	test("Crear una tabla con varias columnas", async () => {
		const debug = false;
		const cols = {
			ID_ARTISTA: "INTEGER",
			NOMBRE_ARTISTA: { type: "CHARACTER(60)", default: "artista" },
			FDN_ARTISTA: "DATE",
			POSTER_EN_EXISTENCIA: "BOOLEAN",
		};
		const result = await qb
			.use("testing")
			.createTable("table_test2", { cols, secure: true })
			.execute(debug);

		// showResults(result, debug);
		await tableExist("table_test2", cols);

		assert.equal(
			await result.toString(),
			`USE testing;
CREATE TABLE IF NOT EXISTS table_test2
( ID_ARTISTA INT,
 NOMBRE_ARTISTA CHAR(60) DEFAULT 'artista',
 FDN_ARTISTA DATE,
 POSTER_EN_EXISTENCIA TINYINT );`,
		);
	});

	test("Crear un tipo definido por el usuario", async () => {
		const result = await qb
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.execute();

		if (!result.error) {
			assert.equal(await result.toString(), "USE testing;");
		} else {
			assert.equal(result.error, "No soportado utilice SET o ENUM");
		}
	});

	test("elimina una tabla", async () => {
		const debug = false;
		const result = await qb
			.use("testing")
			.dropTable("TABLE_TEST2", { secure: true, option: "cascade" })
			.execute(debug);

		if (!result.error) {
			const data = await getResultFromTest(
				databaseTest,
				"use testing",
				"show tables",
			);
			assert.ok(data.every((item) => Object.values(item) !== "table_test2"));
			assert.equal(
				await result.toString(),
				"USE testing;\nDROP TABLE IF EXISTS TABLE_TEST2 CASCADE;",
			);
		} else {
			assert.equal(result.error, "");
		}
	});

	after(async () => {
		await qb.use("testing").dropDatabase("testing").execute();
	});
});
