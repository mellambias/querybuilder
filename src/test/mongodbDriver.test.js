import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../querybuilder.js";
import MongoDB from "../noSql/MongoDB.js";
import { config } from "../../config.js";
import { showResults } from "./utilsForTest/resultUtils.js";

const mongoDB = config.databases.MongoDB;
let qb;
beforeEach(() => {
	const queryBuilder = new QueryBuilder(MongoDB, {
		typeIdentificator: "regular",
		mode: "test",
	});
	qb = queryBuilder.driver(mongoDB.driver, mongoDB.params);
});
describe("Driver MongodbDriver", async () => {
	test("crea una base de datos", async () => {
		const debug = false;
		const result = await qb.createDatabase("testing").execute(debug);
		showResults(result, debug);

		assert.equal(result.toString(), "null");
	});
	//fin
	test(
		"Crear una tabla en la base de datos testing",
		{ only: true },
		async () => {
			const debug = false;
			const result = await qb
				.use("testing")
				.dropTable("TABLE_TEST", {
					comment: "elimina esta colección",
					secure: true,
				})
				.createTable("TABLE_TEST", { cols: { ID: "INT" } })
				.execute(debug);
			showResults(result, debug);

			assert(
				await result.toString(),
				"USE testing;\nDROP TABLE IF EXIST TABLE_TEST;\nCREATE TABLE TABLE_TEST\n( ID INT );",
			);
		},
	);
	//fin
	test("Crear una tabla con varias columnas", async () => {
		const cols = {
			ID_ARTISTA: "INTEGER",
			NOMBRE_ARTISTA: { type: "CHARACTER(60)", default: "artista" },
			FDN_ARTISTA: "DATE",
			POSTER_EN_EXISTENCIA: "BOOLEAN",
		};
		const result = await qb
			.use("testing")
			.createTable("table_test2", { cols, secure: true })
			.execute();
		showResults(result);

		assert.equal(
			result.toString(),
			`USE testing;
CREATE TABLE IF NOT EXISTS table_test2
( ID_ARTISTA INT,
 NOMBRE_ARTISTA CHAR(60) DEFAULT 'artista',
 FDN_ARTISTA DATE,
 POSTER_EN_EXISTENCIA TINYINT );`,
		);
	});
});
