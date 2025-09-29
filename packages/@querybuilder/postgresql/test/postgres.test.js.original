import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import PostgreSQL from "../sql/PostgresSQL.js";

describe("libreria postgresSQL", () => {
	let sql;
	beforeEach(async () => {
		sql = new QueryBuilder(PostgreSQL, {
			typeIdentificator: "regular",
		});
	});
	test("Comando para crear una base de datos", () => {
		const result = sql.createDatabase("testing").toString();
		assert.equal(result, "CREATE DATABASE testing;");
	});

	test("Falla cuando se crea una base de datos con un nombre reservado", () => {
		try {
			const result = sql.createDatabase("DAY").toString();
		} catch (error) {
			assert.equal(error, "Error: DAY no es un identificador valido");
		}
	});

	test("Crear una tabla", () => {
		const result = sql.use("testing").createTable("table_test").toString();
		assert.equal(result, "CREATE TABLE table_test;");
	});

	test("Crear una tabla temporal global", () => {
		const result = sql
			.use("testing")
			.createTable("table_test", { temporary: "global", onCommit: "delete" })
			.toString();
		assert.equal(
			result,
			"CREATE GLOBAL TEMPORARY TABLE table_test\n ON COMMIT DELETE ROWS;",
		);
	});
	test("Crear una tabla temporal local", () => {
		const result = sql
			.use("testing")
			.createTable("table_test", { temporary: "local", onCommit: "PRESERVE" })
			.toString();
		assert.equal(
			result,
			"CREATE LOCAL TEMPORARY TABLE table_test\n ON COMMIT PRESERVE ROWS;",
		);
	});
	test("Crear una tabla con varias columnas", () => {
		const columns = {
			ID_ARTISTA: "integer",
			NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
			FDN_ARTISTA: "DATE",
			POSTER_EN_EXISTENCIA: "BOOLEAN",
			INTERVALO: "INTERVAL YEAR(2)",
		};
		const result = sql
			.use("testing")
			.createTable("table_test", { columns })
			.toString();
		assert.equal(
			result,
			"CREATE TABLE table_test\n ( ID_ARTISTA INTEGER,\n NOMBRE_ARTISTA CHAR(60),\n FDN_ARTISTA DATE,\n POSTER_EN_EXISTENCIA BOOLEAN,\n INTERVALO INTERVAL YEAR(2) );",
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
	test("Crear un tipo definido por el usuario como tipoSQL", () => {
		const result = sql
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)" })
			.toString();
		assert.equal(result, "CREATE TYPE SALARIO AS NUMERIC(8,2);");
	});
	test("Crear un tipo definido por el usuario como ENUM", () => {
		const result = sql
			.use("testing")
			.createType("SALARIO", { as: "ENUM" })
			.toString();
		assert.equal(result, "CREATE TYPE SALARIO AS ENUM;");
	});
});
