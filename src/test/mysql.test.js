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

	test("Falla cuando se crea una base de datos con un nombre reservado", () => {
		try {
			sql.createDatabase("DAY").toString();
		} catch (error) {
			assert.equal(error, "Error: DAY no es un identificador valido");
		}
	});

	test("Crear una tabla", () => {
		const result = sql.use("testing").createTable("table_test").toString();
		assert.equal(result, "USE testing\nCREATE TABLE table_test;");
	});
	test("Crear una tabla temporal global", () => {
		const result = sql
			.use("testing")
			.createTable("table_test", { temporary: "global", onCommit: "delete" })
			.toString();
		assert.equal(
			result,
			"USE testing\nCREATE GLOBAL TEMPORARY TABLE table_test\n ON COMMIT DELETE ROWS;",
		);
	});
	test("Crear una tabla temporal local", () => {
		const result = sql
			.use("testing")
			.createTable("table_test", { temporary: "local", onCommit: "PRESERVE" })
			.toString();
		assert.equal(
			result,
			"USE testing\nCREATE LOCAL TEMPORARY TABLE table_test\n ON COMMIT PRESERVE ROWS;",
		);
	});
	test("Crear una tabla con varias columnas", { only: true }, () => {
		const columns = {
			ID_ARTISTA: "INTEGER",
			NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
			FDN_ARTISTA: "DATE",
			POSTER_EN_EXISTENCIA: "BOOLEAN",
		};
		const result = sql
			.use("testing")
			.createTable("table_test", { columns })
			.toString();
		assert.equal(
			result,
			"USE testing\nCREATE TABLE table_test\n ( ID_ARTISTA INT,\n NOMBRE_ARTISTA CHAR(60),\n FDN_ARTISTA DATE,\n POSTER_EN_EXISTENCIA TINYINT );",
		);
	});
	test("No puede Crear una tabla si una columna no es valida", () => {
		try {
			const columns = {
				DAY: "INTEGER",
				NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
			};
			sql.use("testing").createTable("table_test", { columns }).toString();
		} catch (error) {
			assert.equal(error.message, "DAY no es un identificador valido");
		}
	});

	test("Crear un tipo definido por el usuario", () => {
		const result = sql
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)" })
			.toString();
		assert.equal(result, "USE testing\nNo soportado utilice SET o ENUM;");
	});
});
