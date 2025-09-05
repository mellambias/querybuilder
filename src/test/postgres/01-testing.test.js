import { test, suite, after } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import PostgreSQL from "../../sql/PostgreSQL.js";
import { config } from "../../../config.js";
import {
	getResultFromTest,
	checktable,
	checkRows,
} from "../utilsForTest/pgUtils.js";

//SEPUP
const postgreSQL = config.databases.PostgreSQL;
const Driver = postgreSQL.driver;
const databaseTest = new Driver(postgreSQL.params);
const queryBuilder = new QueryBuilder(PostgreSQL, {
	typeIdentificator: "regular",
	mode: "test",
});
const qb = queryBuilder.driver(postgreSQL.driver, postgreSQL.params);
const current = { databaseTest, database: "testing" };
// crea funciones que al ser llamadas usa como 'this' el valor pasado a 'bind'
const tableExist = checktable.bind(current);
const rowsInTableExist = checkRows.bind(current);

suite("Driver postgreDriver", async () => {
	test("crea una base de datos", async () => {
		const result = await qb.createDatabase("testing").execute();
		// showResults(result, debug);

		const resultTest = await getResultFromTest(
			databaseTest,
			"SELECT datname FROM pg_database",
		);
		assert.ok(
			resultTest.some((item) => Object.values(item).includes("testing")),
			"La base de datos 'testing' no ha sido creada",
		);
		//Limpia la query
		result.dropQuery();
	});
	test(
		"Crear una tabla en la base de datos testing",
		{ only: true },
		async () => {
			const result = await qb
				.use("testing")
				.dropTable("TABLE_TEST", { secure: true })
				.createTable("TABLE_TEST", { cols: { ID: "INT" } })
				.execute();

			console.log("result", await result.toString());

			await tableExist("TABLE_TEST", { ID: "INT" });
		},
	);
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
			.execute(debug);

		// showResults(result, debug);
		await tableExist("table_test2", cols);
	});

	test("Crear una tabla temporal global", async () => {
		const result = await qb
			.use("testing")
			.createTable("table_test_temp", {
				temporary: "global",
				onCommit: "delete",
				cols: { ID: "INT" },
			})
			.execute();

		if (!result.error) {
			assert.equal(
				await result.toString(),
				"CREATE TEMPORARY TABLE table_test_temp ( ID INTEGER );",
			);
			assert.ok(result.queryResult);
		} else {
			assert.equal(result.error, result.queryResultError);
		}
	});

	test("Crear un tipo definido por el usuario", async () => {
		const result = await qb
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.execute();

		const resultTest = await getResultFromTest(
			databaseTest,
			`SELECT *
FROM pg_type
WHERE typname LIKE '%SALARIO%' AND typtype = 'c'`,
		);
		assert.ok(
			resultTest.includes("SALARIO"),
			"No se ha creado el tipo definido por el usuario",
		);
	});

	test("elimina una tabla", async () => {
		const result = await qb
			.use("testing")
			.dropTable("TABLE_TEST2", { secure: true, option: "cascade" })
			.execute();

		assert.ok(
			await noExistTable(databaseTest, "testing", "TABLE_TEST2"),
			"La tabla 'TABLE_TEST2' no se ha eliminado",
		);
	});

	// after(async () => {
	// 	await qb.use("testing").dropDatabase("testing").execute();
	// 	const resultTest = await getResultFromTest(
	// 		databaseTest,
	// 		"SELECT datname FROM pg_database",
	// 	);
	// 	assert.ok(
	// 		resultTest.every((item) => !Object.values(item).includes("testing")),
	// 		"La base de datos 'testing' no ha sido creada",
	// 	);
	// });
});
