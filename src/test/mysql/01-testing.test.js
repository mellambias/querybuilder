import { test, after, suite } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import { getResultFromTest, checktable } from "../utilsForTest/mysqlUtils.js";

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
		const result = await qb.createDatabase("testing").execute();

		const resultTest = await getResultFromTest(databaseTest, "show databases");
		assert.ok(
			resultTest.some((item) => Object.values(item).includes("testing")),
			"La base de datos 'testing' no ha sido creada",
		);
		//Limpia la query
		result.dropQuery();
	});
	test("Crear una tabla en la base de datos testing", async () => {
		await qb
			.use("testing")
			.dropTable("TABLE_TEST", { secure: true })
			.createTable("TABLE_TEST", { cols: { ID: "INT" } })
			.execute();

		await tableExist("TABLE_TEST", { ID: "INT" });
	});
	//Fin test
	test("Crear una tabla con varias columnas", async () => {
		const cols = {
			ID_ARTISTA: "INTEGER",
			NOMBRE_ARTISTA: { type: "CHARACTER(60)", default: "artista" },
			FDN_ARTISTA: "DATE",
			POSTER_EN_EXISTENCIA: "BOOLEAN",
		};
		await qb
			.use("testing")
			.createTable("table_test2", { cols, secure: true })
			.execute();

		await tableExist("table_test2", cols);
	});

	test("Crear un tipo definido por el usuario", async () => {
		await qb
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.execute();
	});

	test("elimina una tabla", async () => {
		const result = await qb
			.use("testing")
			.dropTable("TABLE_TEST2", { secure: true, option: "cascade" })
			.execute();

		if (!result.error) {
			const data = await getResultFromTest(
				databaseTest,
				"use testing",
				"show tables",
			);
			assert.ok(data.every((item) => Object.values(item) !== "table_test2"));
		} else {
			assert.equal(result.error, "");
		}
	});

	// after(async () => {
	// 	await qb.use("testing").dropDatabase("testing").execute();
	// });
});
