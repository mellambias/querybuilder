import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../querybuilder.js";
import MySQL from "../sql/MySQL.js";
import { config } from "../../config.js";

const MySql8 = config.databases.MySql8;
let sql;
beforeEach(() => {
	const queryBuilder = new QueryBuilder(MySQL, {
		typeIdentificator: "regular",
	});
	sql = queryBuilder.driver(MySql8.driver, MySql8.params);
});

describe("Driver MySqlDriver", async () => {
	test("crea una base de datos", async () => {
		try {
			await sql.createDatabase("testing").execute();
			assert.equal(sql.toString(), "CREATE DATABASE testing;");
		} catch (error) {
			assert.equal(
				error.message,
				"Can't create database 'testing'; database exists",
			);
		}
	});
	test("Crear una tabla en la base de datos testing", async () => {
		const result = await sql
			.use("testing")
			.createTable("TABLE_TEST", { cols: { ID: "INT" } })
			.execute();

		assert.equal(
			result.toString(),
			"USE testing;\nCREATE TABLE TABLE_TEST\n ( ID INT );",
		);

		if (result.error !== null) {
			assert.equal(result.error, "Table 'table_test' already exists");
		}
	});
	test("Crear una tabla temporal global", async () => {
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

		if (result.error !== null) {
			assert.equal(result.error, result.queryResultError);
		}
	});
	test("Crear una tabla con varias columnas", async () => {
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

		if (result.error !== null) {
			assert.equal(result.error, "Table 'table_test2' already exists");
		}
	});
	test("Crear un tipo definido por el usuario", async () => {
		const result = await sql
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.execute();

		assert.equal(
			result.toString(),
			`USE testing;
CREATE TYPE SALARIO AS NUMERIC(8,2)
NOT FINAL;`,
		);

		if (result.error !== null) {
			assert.equal(result.error, "No soportado utilice SET o ENUM");
		}
	});
	after(async () => {
		sql.use("testing").dropDatabase("testing").execute();
	});
});

// Usa la base de datos inventario

describe("Tabajar con la base de datos inventario", () => {
	test("Crea la base de datos inventario", { only: true }, async () => {
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
 ( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60),
 ID_DISQUERA INT );
CREATE TABLE DISQUERAS_CD
 ( ID_DISQUERA INT,
 NOMBRE_COMPANYI VARCHAR(60) );
CREATE TABLE TIPOS_MUSICA
 ( ID_TIPO INT,
 NOMBRE_TIPO VARCHAR(20) );`,
		);
		if (result.error !== null) {
			assert.equal(
				result.error,
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
		test("Modifica una columna a la tabla", async () => {
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
		test("Elimina una columna a la tabla", async () => {
			const result = await sql
				.use("INVENTARIO")
				.alterTable("DISCOS_COMPACTOS")
				.dropColumn("CANTIDAD", "CASCADE")
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nALTER TABLE DISCOS_COMPACTOS\nDROP COLUMN CANTIDAD CASCADE;",
			);
		});
	});
	test("Elimina una tabla", async () => {
		const result = await sql
			.use("INVENTARIO")
			.dropTable("DISCOS_COMPACTOS", "cascade")
			.execute();

		assert.equal(
			result.toString(),
			"USE INVENTARIO;\nDROP TABLE DISCOS_COMPACTOS CASCADE;",
		);
	});
	describe("Restricciones de columna", () => {
		beforeEach(async () => {
			try {
				await sql
					.use("INVENTARIO")
					.dropTable("ARTISTAS", { secure: true })
					.dropTable("CD_ARTISTA", { secure: true })
					.execute();
				sql.dropQuery().use("INVENTARIO");
			} catch (error) {
				assert(error);
			}
		});
		test("Aplicación de not null", async () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null"] },
			};
			const result = await sql
				.createTable("ARTISTAS", { cols: tabla })
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nCREATE TABLE ARTISTAS\n ( ID_ARTISTA INT NOT NULL );",
			);
		});
		test("Aplicación de UNIQUE", async () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null", "unique"] },
			};
			const result = await sql
				.createTable("ARTISTAS", { cols: tabla })
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nCREATE TABLE ARTISTAS\n ( ID_ARTISTA INT NOT NULL UNIQUE );",
			);
		});
		test("Aplicacion de PRIMARY KEY", async () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["primary key"] },
			};
			const result = await sql
				.createTable("ARTISTAS", { cols: tabla })
				.execute();
			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nCREATE TABLE ARTISTAS\n ( ID_ARTISTA INT PRIMARY KEY );",
			);
		});
		test("Aplicacion de FOREIGN KEY", async () => {
			const CD_ARTISTA = {
				CD_ARTISTA_ID: { type: "INT", values: ["not null", "primary key"] },
			};
			const tabla = {
				ID_ARTISTA: {
					type: "INT",
					values: ["not null", "primary key"],
				},
				CD_ARTISTA_ID: {
					type: "INT",
					foreingKey: {
						table: "CD_ARTISTA",
						cols: "CD_ARTISTA_ID",
						match: "full",
					},
				},
			};
			const result = await sql
				.createTable("CD_ARTISTA", { cols: CD_ARTISTA, secure: true })
				.createTable("ARTISTAS", { cols: tabla })
				.execute();

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS CD_ARTISTA
 ( CD_ARTISTA_ID INT NOT NULL PRIMARY KEY );
CREATE TABLE ARTISTAS
 ( ID_ARTISTA INT NOT NULL PRIMARY KEY,
 CD_ARTISTA_ID INT
REFERENCES CD_ARTISTA (CD_ARTISTA_ID)
MATCH FULL,
 CONSTRAINT FK_CD_ARTISTA FOREIGN KEY (CD_ARTISTA_ID) REFERENCES CD_ARTISTA (CD_ARTISTA_ID) MATCH FULL );`,
			);
		});
		test("Restriccion de CHECK", async () => {
			const TITULOS_CD = {
				ID_DISCO_COMPACTO: "INT",
				TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
				EN_EXISTENCIA: {
					type: "INT",
					values: ["NOT NULL"],
					check: sql.and(
						sql.gt("EN_EXISTENCIA", 0),
						sql.lt("EN_EXISTENCIA", 30),
					),
				},
			};
			const result = await sql
				.createTable("TITULOS_CD", {
					cols: TITULOS_CD,
				})
				.execute();

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
CREATE TABLE TITULOS_CD
 ( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 EN_EXISTENCIA INT NOT NULL CHECK ( EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30 ) );`,
			);
		});
		test("Crear un DOMINIO", async () => {
			try {
				await sql
					.createDomain("CANTIDAD_EN_EXISTENCIA", {
						as: "INT",
						default: 0,
						constraint: {
							name: "CK_CANTIDAD_EN_EXISTENCIA",
							check: "VALUE BETWEEN 0 AND 30",
						},
					})
					.execute();
			} catch (err) {
				assert.equal(
					err.message,
					"Este lenguaje no soporta los 'Dominios' use 'CHECK' o 'TRIGGERS' ",
				);
			}
		});
	});
	describe("Opciones poco o nada soportadas", () => {
		test("CREATE ASSERTION", async () => {
			try {
				await sql
					.createAssertion(
						"LIMITE_EN_EXISTENCIA",
						"( SELECT SUM (EN_EXISTENCIA) FROM TITULOS_CD ) < 5000",
					)
					.execute();
			} catch (errror) {
				assert.equal(
					errror.message,
					"Este lenguaje no soporta los 'createAssertion' use 'TRIGGERS' o 'Constraints' ",
				);
			}
		});
	});
	describe("SEGURIDAD", () => {
		test("crear los Roles de CLIENTES y USUARIOS", async () => {
			const result = await sql
				.createRole(["CLIENTES", "USUARIOS"], {
					host: "localhost",
					secure: true,
				})
				.execute();

			assert.equal(
				result.toString(),
				"CREATE ROLE IF NOT EXISTS CLIENTES@localhost, USUARIOS@localhost;",
			);
		});
		test("elimina el ROL de CLIENTES", async () => {
			const result = await sql
				.dropRoles(["CLIENTES", "USUARIOS"], {
					secure: true,
					host: "localhost",
				})
				.execute();

			assert.equal(
				result.toString(),
				"DROP ROLE IF EXISTS CLIENTES@localhost, USUARIOS@localhost;",
			);
		});
		test("autorizar privilegios", async () => {
			const result = await sql
				.createRole(["VENTAS", "CONTABILIDAD"], {
					secure: true,
				})
				.use("INVENTARIO")
				.grant(["SELECT", "UPDATE(EN_EXISTENCIA)", "INSERT"], "TITULOS_CD", [
					"VENTAS",
					"CONTABILIDAD",
				])
				.execute();

			assert.equal(
				result.toString(),
				`CREATE ROLE IF NOT EXISTS VENTAS, CONTABILIDAD;
USE INVENTARIO;
GRANT SELECT, UPDATE(EN_EXISTENCIA), INSERT
ON TABLE TITULOS_CD
TO VENTAS, CONTABILIDAD;`,
			);
		});
		test("revocar privilegios", async () => {
			const result = await sql
				.use("INVENTARIO")
				.revoke(
					["SELECT", "UPDATE", "INSERT"],
					"TITULOS_CD",
					["VENTAS", "CONTABILIDAD"],
					{ secure: true },
				)
				.execute();

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
REVOKE IF EXISTS SELECT, UPDATE, INSERT
ON TABLE TITULOS_CD
FROM VENTAS, CONTABILIDAD
IGNORE UNKNOWN USER;`,
			);
		});
		test("asignar rol a un identificador de usuario", () => {
			const result = sql.grantRoles("ADMINISTRADORES", "LindaN").toString();
			assert.equal(result, "GRANT ADMINISTRADORES TO LindaN;");
		});
		test("conceder múltiples roles a múltiples identificadores de usuario", () => {
			const result = sql
				.grantRoles(
					["ADMINISTRADORES", "CONTABILIDAD"],
					["LindaN", "MARKETING"],
					{ admin: true },
				)
				.toString();
			assert.equal(
				result,
				"GRANT ADMINISTRADORES, CONTABILIDAD TO LindaN, MARKETING WITH ADMIN OPTION;",
			);
		});
		test("revocar un rol", () => {
			const result = sql
				.revokeRoles("ADMINISTRADORES", "LindaN", {})
				.toString();
			assert.equal(result, "REVOKE ADMINISTRADORES FROM LindaN CASCADE;");
		});
		test("revocar varios roles a varios  identificadores", () => {
			const result = sql
				.revokeRoles(
					["ADMINISTRADORES", "CONTABILIDAD"],
					["LindaN", "MARKETING"],
					{ adminOption: true, grantBy: "current_user" },
				)
				.toString();
			assert.equal(
				result,
				`REVOKE ADMIN OPTION FOR ADMINISTRADORES, CONTABILIDAD FROM LindaN
GRANTED BY CURRENT_USER CASCADE;
REVOKE ADMIN OPTION FOR ADMINISTRADORES, CONTABILIDAD FROM MARKETING
GRANTED BY CURRENT_USER CASCADE;`,
			);
		});
	});
});
