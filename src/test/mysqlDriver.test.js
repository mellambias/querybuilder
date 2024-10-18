import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import MySQL from "../sql/MySQL.js";
import { config } from "../../config.js";

describe("Driver MySqlDriver", async () => {
	const MySql8 = config.databases.MySql8;
	let sql;
	beforeEach(() => {
		const queryBuilder = new QueryBuilder(MySQL, {
			typeIdentificator: "regular",
		});
		sql = queryBuilder.driver(MySql8.driver, MySql8.params);
	});
	test("crea una base de datos", async () => {
		try {
			await sql.createDatabase("testing").execute();
			assert.equal(sql.toString(), "CREATE DATABASE prueba;");
		} catch (error) {
			assert.equal(
				error.message,
				"Can't create database 'testing'; database exists",
			);
		}
	});
	test("Crear una tabla", async () => {
		try {
			const result = await sql
				.use("testing")
				.createTable("TABLE_TEST", { cols: { ID: "INT" } })
				.execute();

			assert.equal(
				result.toString(),
				"USE testing;\nCREATE TABLE TABLE_TEST\n ( ID INT );",
			);
			assert.equal(result.queryResult, "result");
		} catch (error) {
			assert.equal(error.message, "Table 'table_test' already exists");
		}
	});
	test("Crear una tabla temporal global", async () => {
		try {
			const result = await sql
				.use("testing")
				.createTable("table_test_temp", {
					temporary: "global",
					onCommit: "delete",
					cols: { ID: "INT" },
				})
				.execute();

			assert.equal(
				result.toString(),
				"USE testing;\nCREATE TEMPORARY TABLE table_test_temp\n ( ID INT );",
			);
			assert.ok(result.queryResult);
		} catch (error) {
			assert.equal(error.message, result.queryResultError);
		}
	});
	test("Crear una tabla con varias columnas", async () => {
		try {
			const cols = {
				ID_ARTISTA: "INTEGER",
				NOMBRE_ARTISTA: { type: "CHARACTER(60)", default: "artista" },
				FDN_ARTISTA: "DATE",
				POSTER_EN_EXISTENCIA: "BOOLEAN",
			};
			const result = await sql
				.use("testing")
				.createTable("table_test2", { cols })
				.execute();

			assert.equal(
				result.toString(),
				`USE testing;
CREATE TABLE table_test2
 ( ID_ARTISTA INT,
NOMBRE_ARTISTA CHARACTER(60) DEFAULT 'artista',
FDN_ARTISTA DATE,
POSTER_EN_EXISTENCIA TINYINT );`,
			);
			assert.equal(result.queryResult, "result");
		} catch (error) {
			assert.equal(error.message, "Table 'table_test2' already exists");
		}
	});
	test("Crear un tipo definido por el usuario", async () => {
		try {
			const result = await sql
				.use("testing")
				.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
				.execute();

			assert.equal(
				result.toString(),
				"USE testing;\nCREATE TYPE SALARIO AS NUMERIC(8,2)\nNOT FINAL;",
			);
		} catch (error) {
			assert.equal(error.message, "No soportado utilice SET o ENUM");
		}
	});
	test("Crea la base de datos inventario", async () => {
		try {
			const cols = {
				DISCOS_COMPACTOS: {
					ID_DISCO_COMPACTO: "INT",
					TITULO_CD: "VARCHAR(60)",
					ID_DISQUERA: "INT",
				},
				DISQUERAS_CD: {
					ID_DISQUERA: "INT",
					NOMBRE_COMPANYI: "VARCHAR(60)",
				},
				TIPOS_MUSICA: {
					ID_TIPO: "INT",
					NOMBRE_TIPO: "VARCHAR(20)",
				},
			};

			const result = await sql
				.createDatabase("INVENTARIO")
				.use("INVENTARIO")
				.createTable("DISCOS_COMPACTOS", { cols: cols.DISCOS_COMPACTOS })
				.createTable("DISQUERAS_CD", { cols: cols.DISQUERAS_CD })
				.createTable("TIPOS_MUSICA", { cols: cols.TIPOS_MUSICA })
				.execute();

			assert.equal(
				result.toString(),
				`CREATE DATABASE INVENTARIO;
USE INVENTARIO;
CREATE TABLE DISCOS_COMPACTOS
 ( ID_DISCO_COMPACTO: INT,
TITULO_CD: VARCHAR(60),
ID_DISQUERA: INT );
CREATE TABLE DISQUERAS_CD
 ( ID_DISQUERA: INT,
NOMBRE_COMPANYI: VARCHAR(60);
CREATE TABLE TIPOS_MUSICA
 ( ID_TIPO: INT,
NOMBRE_TIPO: VARCHAR(20)`,
			);
		} catch (error) {
			assert.equal(
				error.message,
				"Can't create database 'inventario'; database exists",
			);
		}
	});

	describe("Alter TABLE", async () => {
		test("Añade una columna a la tabla", async () => {
			const result = await sql
				.use("INVENTARIO")
				.alterTable("DISCOS_COMPACTOS")
				.addColumn("CANTIDAD", "INT")
				.addColumn("CIUDAD", {
					type: "VARCHAR(30)",
					default: "Ciudad Desconocida",
				})
				.execute();

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
ALTER TABLE DISCOS_COMPACTOS
ADD COLUMN CANTIDAD INT;
ALTER TABLE DISCOS_COMPACTOS
ADD COLUMN CIUDAD VARCHAR(30) DEFAULT 'Ciudad Desconocida';`,
			);
		});
		test("Modifica una columna a la tabla", { only: true }, async () => {
			const result = await sql
				.use("INVENTARIO")
				.alterTable("DISCOS_COMPACTOS")
				.alterColumn("CANTIDAD")
				.setDefault(0)
				.alterColumn("CIUDAD")
				.dropDefault()
				.execute();

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
ALTER TABLE DISCOS_COMPACTOS
ALTER COLUMN CANTIDAD SET DEFAULT 0;
ALTER TABLE DISCOS_COMPACTOS
ALTER COLUMN CIUDAD DROP DEFAULT;`,
			);
		});
		test("Elimina una columna a la tabla", () => {
			const result = sql
				.use("INVENTARIO")
				.alterTable("DISCOS_COMPACTOS")
				.dropColumn("CANTIDAD", "CASCADE")
				.toString();

			assert.equal(
				result,
				"USE INVENTARIO;\nALTER TABLE DISCOS_COMPACTOS\nDROP COLUMN CANTIDAD CASCADE;",
			);
		});
	});
});
