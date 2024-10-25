import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("El Core del lenguaje SQL2006", () => {
	let sql;
	beforeEach(async () => {
		sql = new QueryBuilder(Core, {
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
	test("Comando para eliminar una base de datos", () => {
		const result = sql.dropDatabase("testing").toString();
		assert.equal(result, "DROP DATABASE testing;");
	});
	test("Crear una tabla", () => {
		const result = sql
			.use("testing")
			.createTable("table_test", { cols: { ID: "INT" } })
			.toString();
		assert.equal(result, "USE testing;\nCREATE TABLE table_test\n( ID INT );");
	});
	test("Crear una tabla temporal global", () => {
		const result = sql
			.use("testing")
			.createTable("table_test", {
				temporary: "global",
				onCommit: "delete",
				cols: { ID: "INT" },
			})
			.toString();
		assert.equal(
			result,
			"USE testing;\nCREATE GLOBAL TEMPORARY\nTABLE table_test\n( ID INT )\nON COMMIT DELETE ROWS;",
		);
	});
	test("Crear una tabla temporal local", () => {
		const result = sql
			.use("testing")
			.createTable("table_test", {
				temporary: "local",
				onCommit: "PRESERVE",
				cols: { ID: "INT" },
			})
			.toString();
		assert.equal(
			result,
			"USE testing;\nCREATE LOCAL TEMPORARY\nTABLE table_test\n( ID INT )\nON COMMIT PRESERVE ROWS;",
		);
	});
	test("Crear una tabla con varias columnas", () => {
		const cols = {
			ID_ARTISTA: "INTEGER",
			NOMBRE_ARTISTA: { type: "CHARACTER(60)", default: "artista" },
			FDN_ARTISTA: "DATE",
			POSTER_EN_EXISTENCIA: "BOOLEAN",
		};
		const result = sql
			.use("testing")
			.createTable("table_test", { cols })
			.toString();
		assert.equal(
			result,
			"USE testing;\nCREATE TABLE table_test\n( ID_ARTISTA INTEGER,\n NOMBRE_ARTISTA CHARACTER(60) DEFAULT 'artista',\n FDN_ARTISTA DATE,\n POSTER_EN_EXISTENCIA BOOLEAN );",
		);
	});
	test("No puede Crear una tabla si una columna no es valida", () => {
		try {
			const cols = {
				DAY: "INTEGER",
				NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
			};
			sql.use("testing").createTable("table_test", { cols }).toString();
		} catch (error) {
			assert.equal(error.message, "DAY no es un identificador valido");
		}
	});

	test("Crear un tipo definido por el usuario", () => {
		const result = sql
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.toString();
		assert.equal(
			result,
			"USE testing;\nCREATE TYPE SALARIO AS NUMERIC(8,2) NOT FINAL;",
		);
	});
	test("Crea la base de datos inventario", () => {
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

		const result = sql
			.createDatabase("INVENTARIO")
			.use("INVENTARIO")
			.createTable("DISCOS_COMPACTOS", { cols: cols.DISCOS_COMPACTOS })
			.createTable("DISQUERAS_CD", { cols: cols.DISQUERAS_CD })
			.createTable("TIPOS_MUSICA", { cols: cols.TIPOS_MUSICA })
			.toString();
	});
	describe("Alter TABLE", () => {
		test("Añade una columna a la tabla", () => {
			const result = sql
				.use("INVENTARIO")
				.alterTable("DISCOS_COMPACTOS")
				.addColumn("CANTIDAD", "INT")
				.toString();

			assert.equal(
				result,
				"USE INVENTARIO;\nALTER TABLE DISCOS_COMPACTOS\nADD COLUMN CANTIDAD INT;",
			);
		});
		test("Modifica una columna a la tabla", () => {
			const result = sql
				.use("INVENTARIO")
				.alterTable("DISCOS_COMPACTOS")
				.alterColumn("CANTIDAD")
				.setDefault("DESCONOCIDO")
				.alterColumn("CIUDAD")
				.dropDefault()
				.toString();

			assert.equal(
				result,
				`USE INVENTARIO;
ALTER TABLE DISCOS_COMPACTOS
ALTER COLUMN CANTIDAD SET DEFAULT 'DESCONOCIDO';
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
	test("Elimina una tabla", () => {
		const result = sql
			.use("INVENTARIO")
			.dropTable("DISCOS_COMPACTOS", "cascade")
			.toString();
		assert.equal(
			result,
			"USE INVENTARIO;\nDROP TABLE DISCOS_COMPACTOS CASCADE;",
		);
	});
	describe("Restricciones de columna", () => {
		test("Aplicación de not null", () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null"] },
			};
			const result = sql.createTable("ARTISTAS", { cols: tabla }).toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL );",
			);
		});
		test("Aplicación de UNIQUE", () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null", "unique"] },
			};
			const result = sql.createTable("ARTISTAS", { cols: tabla }).toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL UNIQUE );",
			);
		});
		test("Aplicacion de PRIMARY KEY", () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["primary key"] },
			};
			const result = sql.createTable("ARTISTAS", { cols: tabla }).toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT PRIMARY KEY );",
			);
		});
		test("Aplicacion de FOREIGN KEY", () => {
			const tabla = {
				ID_ARTISTA: {
					type: "INT",
					values: ["not null"],
					foreingKey: {
						table: "CD_ARTISTA",
						cols: "CD_ARTISTA_ID",
						match: "full",
					},
				},
			};
			const result = sql.createTable("ARTISTAS", { cols: tabla }).toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL REFERENCES CD_ARTISTA (CD_ARTISTA_ID) MATCH FULL );",
			);
		});
		test("Restriccion de CHECK", () => {
			const TITULOS_CD = {
				ID_DISCO_COMPACTO: "INT",
				TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
				EN_EXISTENCIA: {
					type: "INT",
					values: ["NOT NULL"],
					check: "EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30",
				},
			};
			const result = sql
				.createTable("TITULOS_CD", {
					cols: TITULOS_CD,
				})
				.toString();
			assert.equal(
				result,
				`CREATE TABLE TITULOS_CD
( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 EN_EXISTENCIA INT NOT NULL CHECK ( EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30 ) );`,
			);
		});
	});
	describe("Restriccion de Tabla", { only: true }, () => {
		test("Aplicacion de UNIQUE y NOT NULL", () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null", "unique"] },
				NOMBRE_ARTISTA: { type: "VARCHAR(60)", values: ["not null", "unique"] },
			};
			const result = sql
				.createTable("ARTISTAS", {
					cols: tabla,
					constraints: [
						{
							name: "unicos",
							type: "unique",
							cols: ["ID_ARTISTA", "NOMBRE_ARTISTA"],
						},
						{
							name: "not_null",
							type: "not null",
							cols: ["ID_ARTISTA"],
						},
					],
				})
				.toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL UNIQUE,\n NOMBRE_ARTISTA VARCHAR(60) NOT NULL UNIQUE,\n CONSTRAINT unicos UNIQUE (ID_ARTISTA, NOMBRE_ARTISTA),\n CONSTRAINT not_null NOT NULL (ID_ARTISTA) );",
			);
		});
		test("Aplicacion de PRIMARY KEY", () => {
			const tabla = {
				ID_ARTISTA: "INT",
				NOMBRE_ARTISTA: {
					type: "VARCHAR(60)",
					values: ["not null"],
				},
			};
			const result = sql
				.createTable("ARTISTAS", {
					cols: tabla,
					constraints: [
						{
							name: "PK_ID",
							type: "primary key",
							cols: ["ID_ARTISTA", "NOMBRE_ARTISTA"],
						},
					],
				})
				.toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT,\n NOMBRE_ARTISTA VARCHAR(60) NOT NULL,\n CONSTRAINT PK_ID PRIMARY KEY (ID_ARTISTA, NOMBRE_ARTISTA) );",
			);
		});
		test("Aplicacion de constraing FOREIGN KEY", () => {
			const tabla = {
				ID_ARTISTA: {
					type: "INT",
					values: ["not null"],
				},
			};
			const result = sql
				.createTable("ARTISTAS", {
					cols: tabla,
					constraints: [
						{
							name: "FK_CD_ARTISTA",
							type: "foreign key",
							cols: ["ID_ARTISTA"],
							foreignKey: {
								table: "CD_ARTISTA",
								cols: ["CD_ARTISTA_ID"],
								match: "partial",
							},
						},
					],
				})
				.toString();
			assert.equal(
				result,
				`CREATE TABLE ARTISTAS
( ID_ARTISTA INT NOT NULL,
 CONSTRAINT FK_CD_ARTISTA FOREIGN KEY (ID_ARTISTA) REFERENCES CD_ARTISTA (CD_ARTISTA_ID) MATCH PARTIAL );`,
			);
		});
		test("Aplicacion de FOREIGN KEY ON UPDATE Y ON DELETE", () => {
			const tabla = {
				ID_ARTISTA: {
					type: "INT",
					values: ["not null"],
				},
			};
			const result = sql
				.createTable("ARTISTAS", {
					cols: tabla,
					constraints: [
						{
							name: "FK_CD_ARTISTA",
							type: "foreign key",
							cols: ["ID_ARTISTA"],
							foreignKey: {
								table: "CD_ARTISTA",
								cols: ["CD_ARTISTA_ID"],
								actions: {
									onUpdate: "cascade",
									onDelete: "set null",
								},
							},
						},
					],
				})
				.toString();
			assert.equal(
				result,
				`CREATE TABLE ARTISTAS
( ID_ARTISTA INT NOT NULL,
 CONSTRAINT FK_CD_ARTISTA FOREIGN KEY (ID_ARTISTA) REFERENCES CD_ARTISTA (CD_ARTISTA_ID) ON UPDATE CASCADE ON DELETE SET NULL );`,
			);
		});
		test("Restriccion de CHECK con constraing", () => {
			const TITULOS_CD = {
				ID_DISCO_COMPACTO: "INT",
				TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
				EN_EXISTENCIA: { type: "INT", values: ["NOT NULL"] },
			};
			const result = sql
				.createTable("TITULOS_CD", {
					cols: TITULOS_CD,
					constraints: [
						{
							name: "CK_EN_EXISTENCIA",
							check: "EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30",
						},
					],
				})
				.toString();
			assert.equal(
				result,
				`CREATE TABLE TITULOS_CD
( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 EN_EXISTENCIA INT NOT NULL,
 CONSTRAINT CK_EN_EXISTENCIA CHECK ( EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30 ) );`,
			);
		});
		test("Crear un DOMINIO", () => {
			const result = sql
				.createDomain("CANTIDAD_EN_EXISTENCIA", {
					as: "INT",
					default: 0,
					constraint: {
						name: "CK_CANTIDAD_EN_EXISTENCIA",
						check: "VALUE BETWEEN 0 AND 30",
					},
				})
				.toString();
			assert.equal(
				result,
				`CREATE DOMAIN CANTIDAD_EN_EXISTENCIA
AS INT
DEFAULT 0
CONSTRAINT CK_CANTIDAD_EN_EXISTENCIA CHECK ( VALUE BETWEEN 0 AND 30 );`,
			);
		});
	});
	describe("Opciones poco o nada soportadas", () => {
		test("CREATE ASSERTION", () => {
			const result = sql
				.createAssertion(
					"LIMITE_EN_EXISTENCIA",
					"( SELECT SUM (EN_EXISTENCIA) FROM TITULOS_CD ) < 5000",
				)
				.toString();
			assert.equal(
				result,
				"CREATE ASSERTION LIMITE_EN_EXISTENCIA CHECK ( ( SELECT SUM (EN_EXISTENCIA) FROM TITULOS_CD ) < 5000 );",
			);
		});
	});
	describe("Vistas", () => {
		test("crear una vista de una sola tabla", () => {
			const query = `SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO`;
			const result = sql
				.createView("DISCOS_COMPACTOS_EN_EXISTENCIA", {
					cols: ["DISCO_COMPACTO", "DERECHOSDEAUTOR", "EN_EXISTENCIA"],
					as: query,
					check: true,
				})
				.toString();
			assert.equal(
				result,
				`CREATE VIEW DISCOS_COMPACTOS_EN_EXISTENCIA
( DISCO_COMPACTO, DERECHOSDEAUTOR, EN_EXISTENCIA )
AS SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO
WITH CHECK OPTION;`,
			);
		});
		test("eliminar una vista", () => {
			assert.equal(
				sql.dropView("DISCOS_COMPACTOS_EN_EXISTENCIA").toString(),
				"DROP VIEW DISCOS_COMPACTOS_EN_EXISTENCIA;",
			);
		});
	});
	describe("SEGURIDAD", () => {
		test("crear un ROL de usuario", () => {
			const result = sql
				.createRole("CLIENTES", { admin: "CURRENT_USER" })
				.toString();
			assert.equal(result, "CREATE ROLE CLIENTES WITH ADMIN CURRENT_USER;");
		});
		test("elimina un ROL de usuario", () => {
			const result = sql.dropRoles("CLIENTES").toString();
			assert.equal(result, "DROP ROLE CLIENTES;");
		});
		test("autorizar privilegios", () => {
			const result = sql
				.grant(
					["SELECT", "UPDATE(TITULO_CD)", "INSERT"],
					"INVENTARIO_CD",
					["VENTAS", "CONTABILIDAD"],
					{
						withGrant: true,
						grantBy: "current_user",
					},
				)
				.toString();
			assert.equal(
				result,
				`GRANT SELECT, UPDATE(TITULO_CD), INSERT
ON TABLE INVENTARIO_CD
TO VENTAS, CONTABILIDAD
WITH GRANT OPTION
GRANTED BY CURRENT_USER;`,
			);
		});
		test("revocar privilegios", () => {
			const result = sql
				.revoke(
					["SELECT", "UPDATE", "INSERT"],
					"INVENTARIO_CD",
					["VENTAS", "CONTABILIDAD"],
					{ cascade: true },
				)
				.toString();
			assert.equal(
				result,
				`REVOKE SELECT, UPDATE, INSERT
ON TABLE INVENTARIO_CD
FROM VENTAS, CONTABILIDAD
CASCADE;`,
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
		test("revocar varios roles a varios identificadores", () => {
			const result = sql
				.revokeRoles(
					["ADMINISTRADORES", "CONTABILIDAD"],
					["LindaN", "MARKETING"],
					{ adminOption: true, grantBy: "current_user" },
				)
				.toString();
			assert.equal(
				result,
				`REVOKE ADMIN OPTION FOR ADMINISTRADORES, CONTABILIDAD FROM LindaN GRANTED BY CURRENT_USER CASCADE;
REVOKE ADMIN OPTION FOR ADMINISTRADORES, CONTABILIDAD FROM MARKETING GRANTED BY CURRENT_USER CASCADE;`,
			);
		});
	});
	describe("Consultas de SQL", () => {
		test("SELECT todas las filas distintas y todas las columnas ", () => {
			const result = sql.select("*", { unique: true }).from("MUSICA");
			assert.equal(result.toString(), "SELECT DISTINCT *\nFROM MUSICA;");
		});
		test("SELECT todas las filas distintas y algunas columnas", () => {
			const result = sql
				.select(
					[{ col: "DISCOS", as: "ID_DISCO" }, "PRECIO", { col: "CANTIDAD" }],
					{
						unique: true,
					},
				)
				.from("MUSICA");
			assert.equal(
				result.toString(),
				"SELECT DISTINCT DISCOS AS ID_DISCO, PRECIO, CANTIDAD\nFROM MUSICA;",
			);
		});
		test("Filtrado de datos con WHERE", () => {
			const result = sql
				.select(["TITULO_CD", "DERECHOSDEAUTOR", "EN_EXISTENCIA"])
				.from("INVENTARIO_DISCO_COMPACTO")
				.where(
					sql.and(
						sql.gt("DERECHOSDEAUTOR", 1989),
						sql.lt("DERECHOSDEAUTOR", 2000),
					),
				);
			assert.equal(
				result.toString(),
				`SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO
WHERE (DERECHOSDEAUTOR > 1989
AND DERECHOSDEAUTOR < 2000);`,
			);
		});
		test("agrupar filas cuyos valores de columna son iguales", () => {
			const result = sql
				.select([
					"CATEGORIA",
					"PRECIO",
					{ col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
				])
				.from("EXISTENCIA_DISCO_COMPACTO")
				.groupBy(["CATEGORIA", "PRECIO"]);
			assert.equal(
				result.toString(),
				`SELECT CATEGORIA, PRECIO, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY CATEGORIA, PRECIO;`,
			);
		});
		test("GROUP BY ROLLUP", () => {
			const result = sql
				.select([
					"CATEGORIA",
					"PRECIO",
					{ col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
				])
				.from("EXISTENCIA_DISCO_COMPACTO")
				.groupBy({ rollup: ["CATEGORIA", "PRECIO"] });
			assert.equal(
				result.toString(),
				`SELECT CATEGORIA, PRECIO, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY ROLLUP (CATEGORIA, PRECIO);`,
			);
		});
		test("HAVING", () => {
			const result = sql
				.select([
					"PRECIO",
					"CATEGORIA",
					{ col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
				])
				.from("EXISTENCIA_DISCO_COMPACTO")
				.groupBy(["CATEGORIA", "PRECIO"])
				.having("SUM(A_LA_MANO) > 10");
			assert.equal(
				result.toString(),
				`SELECT PRECIO, CATEGORIA, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY CATEGORIA, PRECIO
HAVING SUM(A_LA_MANO) > 10;`,
			);
		});
		test("ORDER BY", () => {
			const result = sql
				.select("*")
				.from("EXISTENCIA_DISCO_COMPACTO")
				.where("PRECIO < 16.00")
				.orderBy(["PRECIO", { col: "A_LA_MANO", order: "desc" }]);
			assert.equal(
				result.toString(),
				`SELECT *
FROM EXISTENCIA_DISCO_COMPACTO
WHERE PRECIO < 16.00
ORDER BY PRECIO, A_LA_MANO DESC;`,
			);
		});
	});
	describe("Modificacion de datos", () => {
		test("Insertar datos en una tabla sin especificar las columnas", () => {
			const result = sql.insert(
				"INVENTARIO_CD",
				[],
				["Patsy Cline: 12 Greatest Hits", "Country", "MCA Records", 32],
			);
			assert.equal(
				result.toString(),
				`INSERT INTO INVENTARIO_CD
VALUES ( 'Patsy Cline: 12 Greatest Hits', 'Country', 'MCA Records', 32 );`,
			);
		});
		test("Insertar datos en una tabla especificando columnas", () => {
			const result = sql.insert(
				"INVENTARIO_CD",
				["NOMBRE_CD", "EDITOR", "EN_EXISTENCIA"],
				["Fundamental", "Capitol Records", 34],
			);
			assert.equal(
				result.toString(),
				`INSERT INTO INVENTARIO_CD\n( NOMBRE_CD, EDITOR, EN_EXISTENCIA )
VALUES ( 'Fundamental', 'Capitol Records', 34 );`,
			);
		});
		test("Insertar datos en una tabla usando SELECT", () => {
			const sqlSelect = sql
				.select(["NOMBRE_CD", "EN_EXISTENCIA"])
				.from("INVENTARIO_CD");
			const result = sql.insert("INVENTARIO_CD_2", [], sqlSelect);
			console.log(result);
			assert.equal(
				result.toString(),
				`INSERT INTO INVENTARIO_CD_2
SELECT NOMBRE_CD, EN_EXISTENCIA
FROM INVENTARIO_CD;`,
			);
		});
		test("Insertar varias filas de datos", () => {
			const result = sql.insert(
				"INVENTARIO_CD",
				[],
				[
					[827, "Private Music"],
					[828, "Reprise Records"],
					[829, "Asylum Records"],
					[830, "Windham Hill Records"],
				],
			);
			assert.equal(
				result.toString(),
				`INSERT INTO INVENTARIO_CD
VALUES
(827, 'Private Music'),
(828, 'Reprise Records'),
(829, 'Asylum Records'),
(830, 'Windham Hill Records');`,
			);
		});
		test("Actualizar el valor de una columna", () => {
			const result = sql.update("INVENTARIO_CD", { EN_EXISTENCIA: 27 });
			assert.equal(
				result.toString(),
				`UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 27;`,
			);
		});
		test("Actualizar el valor de varias columnas", () => {
			const result = sql.update("INVENTARIO_CD", {
				EN_EXISTENCIA: "27",
				CANTIDAD: 10,
			});
			assert.equal(
				result.toString(),
				`UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = '27',
CANTIDAD = 10;`,
			);
		});
		test("Actualizar el valor de una columna solo de algunas filas usando where", () => {
			const result = sql
				.update("INVENTARIO_CD", { EN_EXISTENCIA: 27 })
				.where([sql.eq("NOMBRE_CD", "Out of Africa")]);
			assert.equal(
				result.toString(),
				`UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 27
WHERE NOMBRE_CD = 'Out of Africa';`,
			);
		});
		test("Actualizar el valor de una columna usando como valor el select", () => {
			const sqlSelect = sql
				.select(sql.avg("EN_EXISTENCIA"))
				.from("INVENTARIO_CD");

			const result = sql
				.update("INVENTARIO_CD_2", { EN_EXISTENCIA_2: sqlSelect })
				.where([sql.eq("NOMBRE_CD_2", "Orlando")]);

			assert.equal(
				result.toString(),
				`UPDATE INVENTARIO_CD_2
SET EN_EXISTENCIA_2 =
( SELECT AVG(EN_EXISTENCIA)
FROM INVENTARIO_CD )
WHERE NOMBRE_CD_2 = 'Orlando';`,
			);
		});
		test("Eliminar filas de una tabla con DELETE FROM", () => {
			const result = sql.delete("INVENTARIO_CD");
			assert.equal(result.toString(), "DELETE FROM INVENTARIO_CD;");
		});
		test("Eliminar algunas filas de una tabla con DELETE y where", () => {
			const result = sql
				.delete("INVENTARIO_CD")
				.where(sql.eq("TIPO_MUSICA", "Country"));
			assert.equal(
				result.toString(),
				`DELETE FROM INVENTARIO_CD
WHERE TIPO_MUSICA = 'Country';`,
			);
		});
		test("eliminar datos usando una sub consulta", () => {
			const result = sql
				.delete("TIPOS_TITULO")
				.where(
					sql.in(
						"TITULO_CD",
						sql
							.select("TITLE")
							.from("INVENTARIO_TITULOS")
							.where(sql.eq("TITLE_ID", 108)),
					),
				);

			assert.equal(
				result.toString(),
				`DELETE FROM TIPOS_TITULO
WHERE TITULO_CD IN ( SELECT TITLE
FROM INVENTARIO_TITULOS
WHERE TITLE_ID = 108 );`,
			);
		});
	});
	describe("Predicados de WHERE", () => {
		test("operadores", () => {
			assert.equal(sql.eq("columna", "string"), "columna = 'string'");
			assert.equal(sql.ne("columna", 4), "columna <> 4");
			assert.equal(sql.gt("columna", 4), "columna > 4");
			assert.equal(sql.gte("columna", 4), "columna >= 4");
			assert.equal(sql.lt("columna", 4), "columna < 4");
			assert.equal(sql.lte("columna", 4), "columna <= 4");
		});
		test("logicos", () => {
			assert.equal(
				sql.and(
					sql.or(
						sql.eq("columna", 1),
						sql.eq("columna", 2),
						sql.eq("columna", 3),
					),
					sql.gt("col", 25),
				) + sql.or(sql.and(sql.gt("PEPE", 10), sql.lt("PEPE", 40))),
				`((columna = 1
OR columna = 2
OR columna = 3)
AND col > 25)
OR (PEPE > 10
AND PEPE < 40)`,
			);
		});
		test("predicado NOT", () => {
			assert.equal(sql.not(sql.eq("col", 24)), "NOT (col = 24)");
			assert.equal(
				sql.not(sql.or(sql.eq("col", 24), sql.gt("col", 10))),
				`NOT ((col = 24
OR col > 10))`,
			);
		});
		test("Un valor entre un mínimo y un máximo", () => {
			assert.equal(sql.between(12, 15), "BETWEEN 12 AND 15");
		});
		test("Valores que pueden ser Null o no Null", () => {
			assert.equal(sql.isNull("col"), "col IS NULL");
			assert.equal(
				sql.isNull(["col1", "col2", "col3"]),
				"col1 IS NULL\nAND col2 IS NULL\nAND col3 IS NULL",
			);
			assert.equal(
				sql.isNotNull(["col1", "col2", "col3"]),
				"col1 IS NOT NULL\nAND col2 IS NOT NULL\nAND col3 IS NOT NULL",
			);
			assert.equal(
				sql.and(
					sql.isNotNull("LUGAR_DE_NACIMIENTO"),
					sql.gt("AÑO_NACIMIENTO", 1940),
				),
				`(LUGAR_DE_NACIMIENTO IS NOT NULL
AND AÑO_NACIMIENTO > 1940)`,
			);
		});
		test("Valor que coincide con una expresion usando comodines % y _", () => {
			assert.equal(sql.like("ID_CD", "%01"), "ID_CD LIKE ('%01')");
		});
		test("valor dentro de una lista", () => {
			assert.equal(
				sql.in("EN_EXISTENCIA", [12, 22, 32, 42, "bocata"]),
				"EN_EXISTENCIA IN ( 12, 22, 32, 42, 'bocata' )",
			);
			assert.equal(
				sql
					.select(["TITULO", "ARTISTA"])
					.from("ARTISTAS_DISCO_COMPACTO")
					.where(
						sql.in(
							"TITULO",
							sql
								.select("NOMBRE_CD")
								.from("INVENTARIO_DISCO_COMPACTO")
								.where(sql.gt("EN_EXISTENCIA", 10)),
						),
					)
					.toString(),
				`SELECT TITULO, ARTISTA
FROM ARTISTAS_DISCO_COMPACTO
WHERE TITULO IN ( SELECT NOMBRE_CD
FROM INVENTARIO_DISCO_COMPACTO
WHERE EN_EXISTENCIA > 10 );`,
			);
		});
		test("El valor existe en la subconsulta", () => {
			assert.equal(
				sql
					.select(["TITULO", "ARTISTA"])
					.from("ARTISTAS_DISCO_COMPACTO")
					.where(
						sql.exists(
							sql
								.select("NOMBRE_CD")
								.from("INVENTARIO_DISCO_COMPACTO")
								.where(sql.gt("EN_EXISTENCIA", 10)),
						),
					)
					.toString(),
				`SELECT TITULO, ARTISTA
FROM ARTISTAS_DISCO_COMPACTO
WHERE EXISTS ( SELECT NOMBRE_CD
FROM INVENTARIO_DISCO_COMPACTO
WHERE EN_EXISTENCIA > 10 );`,
			);
		});
		test("el valor coincide con algun valor en la sub consulta", () => {
			assert.equal(
				sql
					.select(["TITULO", "REBAJA"])
					.from("REBAJA_CD")
					.where(
						sql.lt(
							"REBAJA",
							sql.any(
								sql
									.select("MENUDEO")
									.from("MENUDEO_CD")
									.where(sql.gt("EN_EXISTENCIA", 9)),
							),
						),
					)
					.toString(),
				`SELECT TITULO, REBAJA
FROM REBAJA_CD
WHERE REBAJA < ANY ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`,
			);
		});
		test("coincide con mas de un valor en la sub consulta", () => {
			assert.equal(
				sql
					.select(["TITULO", "REBAJA"])
					.from("REBAJA_CD")
					.where(
						sql.lt(
							"REBAJA",
							sql.some(
								sql
									.select("MENUDEO")
									.from("MENUDEO_CD")
									.where(sql.gt("EN_EXISTENCIA", 9)),
							),
						),
					)
					.toString(),
				`SELECT TITULO, REBAJA
FROM REBAJA_CD
WHERE REBAJA < SOME ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`,
			);
		});
		test("coincide con todos los valores de la sub consulta", () => {
			assert.equal(
				sql
					.select(["TITULO", "REBAJA"])
					.from("REBAJA_CD")
					.where(
						sql.lt(
							"REBAJA",
							sql.all(
								sql
									.select("MENUDEO")
									.from("MENUDEO_CD")
									.where(sql.gt("EN_EXISTENCIA", 9)),
							),
						),
					)
					.toString(),
				`SELECT TITULO, REBAJA
FROM REBAJA_CD
WHERE REBAJA < ALL ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`,
			);
		});
	});
	describe("Funciones", () => {
		describe("SET", () => {
			test("COUNT", () => {
				assert.equal(sql.count("*"), "COUNT(*)");
				assert.equal(sql.count("PRECIO"), "COUNT(PRECIO)");
				assert.equal(sql.count("PRECIO", "DINERO"), "COUNT(PRECIO) AS DINERO");
			});
			test("SELECT con COUNT", () => {
				const result = sql
					.select(sql.count("PRECIO", "DINERO"))
					.from("LISTA_CD");
				assert.equal(
					result.toString(),
					"SELECT COUNT(PRECIO) AS DINERO\nFROM LISTA_CD;",
				);
			});
			test("MAX y MIN", () => {
				assert.equal(sql.max("PRECIO"), "MAX(PRECIO)");
				assert.equal(sql.max("PRECIO", "DINERO"), "MAX(PRECIO) AS DINERO");
				assert.equal(sql.min("PRECIO"), "MIN(PRECIO)");
				assert.equal(sql.min("PRECIO", "DINERO"), "MIN(PRECIO) AS DINERO");
			});
			test("SUM", () => {
				assert.equal(sql.sum("PRECIO"), "SUM(PRECIO)");
				assert.equal(sql.sum("PRECIO", "DINERO"), "SUM(PRECIO) AS DINERO");
			});
			test("AVG", () => {
				assert.equal(sql.avg("PRECIO"), "AVG(PRECIO)");
				assert.equal(sql.avg("PRECIO", "DINERO"), "AVG(PRECIO) AS DINERO");
			});
		});
		describe("VALUE", () => {
			describe("funciones de valor de cadena", () => {
				test("substring", () => {
					assert.equal(
						sql.substr("DESCRIPCION", 3),
						"SUBSTRING(DESCRIPCION FROM 3)",
					);
					assert.equal(
						sql.substr("DESCRIPCION", 3, 10),
						"SUBSTRING(DESCRIPCION FROM 3 FOR 10)",
					);
					assert.equal(
						sql.substr("DESCRIPCION", 3, "ABREVIADO"),
						"SUBSTRING(DESCRIPCION FROM 3) AS ABREVIADO",
					);
				});
				test("UPPER y LOWER", () => {
					assert.equal(sql.upper("DISCO"), "UPPER(DISCO)");
					assert.equal(
						sql.upper("DISCO", "DISCO_EN_MAYUSCULA"),
						"UPPER(DISCO) AS DISCO_EN_MAYUSCULA",
					);
					assert.equal(sql.lower("DISCO"), "LOWER(DISCO)");
					assert.equal(
						sql.lower("DISCO", "DISCO_EN_MAYUSCULA"),
						"LOWER(DISCO) AS DISCO_EN_MAYUSCULA",
					);
				});
			});
			describe("funciones de tiempo", () => {
				test("Current", () => {
					assert.equal(sql.currentDate(), "CURRENT_DATE");
					assert.equal(sql.currentTime(), "CURRENT_TIME");
					assert.equal(sql.currentTimestamp(), "CURRENT_TIMESTAMP");
				});
				test("local time", () => {
					assert.equal(sql.localTime(), "LOCALTIME");
					assert.equal(sql.localTimestamp(), "LOCALTIMESTAMP");
				});
			});
		});
	});
	describe("Operaciones con dos tablas", () => {
		test("tabla de producto cartesiano", () => {
			const result = sql.select("*").from(["INVENTARIO_CD", "INTERPRETES"]);
			assert.equal(
				result.toString(),
				`SELECT *
FROM INVENTARIO_CD, INTERPRETES;`,
			);
		});
		test("Una tabla EQUI-JOIN", () => {
			const result = sql
				.select("*")
				.from(["INVENTARIO_CD", "INTERPRETES"])
				.where(
					sql.eq(
						sql.col("ID_INTER", "INVENTARIO_CD"),
						sql.col("ID_INTER", "INTERPRETES"),
					),
				);
			assert.equal(
				result.toString(),
				`SELECT *
FROM INVENTARIO_CD, INTERPRETES
WHERE INVENTARIO_CD.ID_INTER = INTERPRETES.ID_INTER;`,
			);
		});
		test("limitar las columnas arrojadas y agregar otro predicado a la cláusula WHERE y así limitar las filas arrojadas", () => {
			const result = sql
				.select([
					sql.col("NOMBRE_CD", "INVENTARIO_CD"),
					sql.col("NOMBRE_INTER", "INTERPRETES"),
					sql.col("EN_EXISTENCIA", "INVENTARIO_CD"),
				])
				.from(["INVENTARIO_CD", "INTERPRETES"])
				.where(
					sql.and(
						sql.eq(
							sql.col("ID_INTER", "INVENTARIO_CD"),
							sql.col("ID_INTER", "INTERPRETES"),
						),
						sql.lt(sql.col("EN_EXISTENCIA", "INVENTARIO_CD"), 15),
					),
				);

			assert.equal(
				result.toString(),
				`SELECT INVENTARIO_CD.NOMBRE_CD, INTERPRETES.NOMBRE_INTER, INVENTARIO_CD.EN_EXISTENCIA
FROM INVENTARIO_CD, INTERPRETES
WHERE (INVENTARIO_CD.ID_INTER = INTERPRETES.ID_INTER
AND INVENTARIO_CD.EN_EXISTENCIA < 15);`,
			);
		});
		test("Uso de alias para tablas", () => {
			const result = sql
				.select([
					sql.col("NOMBRE_CD", "c"),
					sql.col("NOMBRE_INTER", "p"),
					sql.col("EN_EXISTENCIA", "c"),
				])
				.from(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
				.where(
					sql.and(
						sql.eq(sql.col("ID_INTER", "c"), sql.col("ID_INTER", "p")),
						sql.lt(sql.col("EN_EXISTENCIA", "c"), 15),
					),
				);

			assert.equal(
				result.toString(),
				`SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD AS c, INTERPRETES AS p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`,
			);
		});
		test("CROSS JOIN", () => {
			const result = sql
				.select([
					sql.col("NOMBRE_CD", "c"),
					sql.col("NOMBRE_INTER", "p"),
					sql.col("EN_EXISTENCIA", "c"),
				])
				.crossJoin(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
				.where(
					sql.and(
						sql.eq(sql.col("ID_INTER", "c"), sql.col("ID_INTER", "p")),
						sql.lt(sql.col("EN_EXISTENCIA", "c"), 15),
					),
				);

			assert.equal(
				result.toString(),
				`SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD c CROSS JOIN INTERPRETES p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`,
			);
		});
		test("NATURAL JOIN", () => {
			const result = sql
				.select(["TITULO_CD", "TIPO_CD", sql.col("MENUDEO", "c")])
				.naturalJoin(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
				.where(sql.gt(sql.col("INVENTARIO", "s"), 15));

			assert.equal(
				result.toString(),
				`SELECT TITULO_CD, TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s NATURAL JOIN COSTOS_TITULO c
WHERE s.INVENTARIO > 15;`,
			);
		});
		test("Join de columna nombrada", () => {
			const result = sql
				.select(["TITULO_CD", sql.col("TIPO_CD", "s"), sql.col("MENUDEO", "c")])
				.colJoin(
					["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"],
					["s", "c"],
					["TITULO_CD"],
				)
				.where(sql.gt(sql.col("INVENTARIO", "s"), 15));

			assert.equal(
				result.toString(),
				`SELECT TITULO_CD, s.TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s JOIN COSTOS_TITULO c
USING (TITULO_CD)
WHERE s.INVENTARIO > 15;`,
			);
		});
		test("INNER JOIN y la clausula ON", () => {
			const result = sql
				.select([sql.col("TITULO", "t"), sql.col("ARTISTA", "a")])
				.innerJoin(["TITULO_CDS", "ARTISTAS_TITULOS"], ["t", "ta"])
				.on(sql.eq(sql.col("ID_TITULO", "t"), sql.col("ID_TITULO", "ta")))
				.innerJoin("ARTISTAS_CD", "a")
				.on(sql.eq(sql.col("ID_ARTISTA", "ta"), sql.col("ID_ARTISTA", "a")))
				.where(sql.like(sql.col("TITULO", "t"), "%Blue%"));

			assert.equal(
				result.toString(),
				`SELECT t.TITULO, a.ARTISTA
FROM TITULO_CDS t INNER JOIN ARTISTAS_TITULOS ta
ON t.ID_TITULO = ta.ID_TITULO
INNER JOIN ARTISTAS_CD a
ON ta.ID_ARTISTA = a.ID_ARTISTA
WHERE t.TITULO LIKE ('%Blue%');`,
			);
		});
		test("LEFT OUTER JOIN", () => {
			const result = sql
				.select([
					sql.col("TITULO", "i"),
					sql.col("NOMBRE_TIPO", "t"),
					sql.col("EXISTENCIA", "i"),
				])
				.leftJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on(sql.eq(sql.col("ID_TIPO", "i"), sql.col("ID_TIPO", "t")));

			assert.equal(
				result.toString(),
				`SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i LEFT OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
			);
		});
		test("RIGTH OUTER JOIN", () => {
			const result = sql
				.select([
					sql.col("TITULO", "i"),
					sql.col("NOMBRE_TIPO", "t"),
					sql.col("EXISTENCIA", "i"),
				])
				.rightJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on(sql.eq(sql.col("ID_TIPO", "i"), sql.col("ID_TIPO", "t")));

			assert.equal(
				result.toString(),
				`SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i RIGTH OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
			);
		});
		test("FULL OUTER JOIN", () => {
			const result = sql
				.select([
					sql.col("TITULO", "i"),
					sql.col("NOMBRE_TIPO", "t"),
					sql.col("EXISTENCIA", "i"),
				])
				.fullJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on(sql.eq(sql.col("ID_TIPO", "i"), sql.col("ID_TIPO", "t")));

			assert.equal(
				result.toString(),
				`SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i FULL OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
			);
		});
		test("UNION", () => {
			const result = sql
				.select("TIPO_CD")
				.from("CDS_CONTINUADOS")
				.union("All")
				.select("TIPO_CD")
				.from("CDS_DESCONTINUADOS");

			assert.equal(
				result.toString(),
				`SELECT TIPO_CD
FROM CDS_CONTINUADOS
UNION ALL
SELECT TIPO_CD
FROM CDS_DESCONTINUADOS;`,
			);
		});
	});
	describe("USO DE SUBCONSULTAS PARA ACCEDER Y MODIFICAR DATOS", () => {
		test("subconsultas con varios resultados", () => {
			const result = sql
				.select("*")
				.from("EXISTENCIA_CD")
				.where(
					sql.in(
						"TITULO_CD",
						sql
							.select("TITULO")
							.from("ARTISTAS_CD")
							.where(sql.eq("NOMBRE_ARTISTA", "Joni Mitchell")),
					),
				);

			assert.equal(
				result.toString(),
				`SELECT *
FROM EXISTENCIA_CD
WHERE TITULO_CD IN ( SELECT TITULO
FROM ARTISTAS_CD
WHERE NOMBRE_ARTISTA = 'Joni Mitchell' );`,
			);
		});
		test("sub consultas anidadas", () => {
			const result = sql
				.select(["NOMBRE_DISCO", "CANTIDAD_EXISTENCIA"])
				.from("INVENTARIO_DISCO")
				.where(
					sql.in(
						"ID_ARTISTA",
						sql
							.select("ID_ARTISTA")
							.from("ARTISTAS_DISCO")
							.where(
								sql.in(
									"ID_TIPO_DISCO",
									sql
										.select("ID_TIPO_DISCO")
										.from("TIPOS_DISCO")
										.where(sql.eq("NOMBRE_TIPO_DISCO", "Blues")),
								),
							),
					),
				);

			assert.equal(
				result.toString(),
				`SELECT NOMBRE_DISCO, CANTIDAD_EXISTENCIA
FROM INVENTARIO_DISCO
WHERE ID_ARTISTA IN ( SELECT ID_ARTISTA
FROM ARTISTAS_DISCO
WHERE ID_TIPO_DISCO IN ( SELECT ID_TIPO_DISCO
FROM TIPOS_DISCO
WHERE NOMBRE_TIPO_DISCO = 'Blues' ) );`,
			);
		});
	});
	describe("trabajo con cursores", () => {
		test("declarar un cursor", () => {
			const options = {
				changes: "ASENSITIVE",
				cursor: "SCROLL",
				hold: true,
				return: false,
				orderBy: "COLUMN",
				readOnly: false,
				update: ["COL1", "COL2"],
			};
			const result = sql.createCursor(
				"name",
				sql.select("*").from("TABLA"),
				options,
			);

			assert.equal(
				result.toString(),
				`DECLARE name ASENSITIVE SCROLL WITH HOLD WITHOUT RETURN CURSOR
FOR
SELECT *
FROM TABLA
ORDER BY COLUMN
FOR UPDATE OF COL1, COL2;`,
			);
		});
		test("instrucción de cursor básica con deplazamiento", () => {
			const result = sql.createCursor(
				"CD_1",
				sql.select("*").from("INVENTARIO_CD"),
				{ orderBy: "DISCO_COMPACTO", cursor: "scroll", readOnly: true },
			);

			assert.equal(
				result.toString(),
				`DECLARE CD_1 SCROLL CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
ORDER BY DISCO_COMPACTO
FOR READ ONLY;`,
			);
		});
		test("un cursor actualizable", () => {
			const result = sql.createCursor(
				"CD_4",
				sql.select("*").from("INVENTARIO_CD"),
				{
					update: "DISCO_COMPACTO",
				},
			);

			assert.equal(
				result.toString(),
				`DECLARE CD_4 CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
FOR UPDATE OF DISCO_COMPACTO;`,
			);
		});
		test("Recuperar datos de un cursor", () => {
			const cursor = sql.createCursor(
				"CD_2",
				sql.select("*").from("INVENTARIO_CD"),
				{ cursor: "scroll", orderBy: "DISCO_COMPACTO", readOnly: true },
			);

			assert.equal(
				cursor.toString(),
				`DECLARE CD_2 SCROLL CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
ORDER BY DISCO_COMPACTO
FOR READ ONLY;`,
			);

			assert.equal(cursor.status, "declared");
			// Se abre el cursor utilizando el queryBuilder
			const openCursor = sql.openCursor("CD_2");
			assert.equal(
				sql.toString(),
				`DECLARE CD_2 SCROLL CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
ORDER BY DISCO_COMPACTO
FOR READ ONLY;
OPEN CD_2;`,
			);
			assert.ok(openCursor.name);
			assert.ok(cursor.name);
			assert.equal(openCursor.name, cursor.name);
			assert.equal(cursor.status, "opened");

			// Lanzamos una peticion
			let query = cursor.fetchNext(["una", "dos"]);
			assert.equal(query, "FETCH NEXT FROM CD_2\nINTO :una, :dos");
			assert.ok(cursor.options.cursor);
			query = cursor.fetchAbsolute(5, ["una", "dos"]);
			assert.equal(query, "FETCH ABSOLUTE 5 FROM CD_2\nINTO :una, :dos");

			// Se cierra el cursor utilizando el queryBuilder
			sql.closeCursor("CD_2");
			assert.equal(cursor.status, "closed");
			assert.equal(
				sql.toString(),
				`FETCH NEXT FROM CD_2\nINTO :una, :dos;
FETCH ABSOLUTE 5 FROM CD_2\nINTO :una, :dos;
CLOSE CD_2;`,
			);
		});
		test("Actualizar datos usando el cursor", () => {
			//declara el cursor para actualizar
			const cursor = sql.createCursor(
				"CD_4",
				sql.select("*").from("INVENTARIO_CD"),
				{ update: true },
			);

			assert.equal(
				cursor.toString(),
				`DECLARE CD_4 CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
FOR UPDATE;`,
			);

			// abre el cursor creado
			cursor.open();
			assert.equal(cursor.name, "CD_4");
			assert.equal(cursor.status, "opened");

			// recupera datos del cursor y los pasa a variables host
			const fetch = cursor.fetch(["CD", "Categoria", "Precio", "A_la_mano"]);
			assert.equal(
				fetch,
				`FETCH CD_4
INTO :CD, :Categoria, :Precio, :A_la_mano`,
			);

			// Actualiza los datos de la tabla usando variables de host obtenidas del cursor
			const result = sql
				.update("INVENTARIO_CD", { A_LA_MANO: ":A_la_mano * 2" })
				.whereCursor("CD_4")
				.closeCursor("CD_4");

			assert.equal(
				result.toString(),
				`DECLARE CD_4 CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
FOR UPDATE;
OPEN CD_4;
FETCH CD_4
INTO :CD, :Categoria, :Precio, :A_la_mano;
UPDATE INVENTARIO_CD
SET A_LA_MANO = :A_la_mano * 2
WHERE CURRENT OF CD_4;
CLOSE CD_4;`,
			);
		});
		test("DELETE POSICIONADO usando cursores", () => {
			const cursor = sql
				.createCursor("CD_4", sql.select("*").from("INVENTARIO_CD"), {
					update: true,
				})
				.open();

			const fila = cursor.fetch(["CD"]);
			const result = sql.delete("INVENTARIO_CD").whereCursor("CD_4");
			cursor.close();

			assert.ok(fila);

			assert.equal(
				result.toString(),
				`DECLARE CD_4 CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
FOR UPDATE;
OPEN CD_4;
FETCH CD_4
INTO :CD;
DELETE FROM INVENTARIO_CD
WHERE CURRENT OF CD_4;
CLOSE CD_4;`,
			);
		});
	});
	describe("trabajo con transacciones", () => {
		test("set transaction", () => {
			const result = sql.setTransaction({
				access: "read only",
				isolation: "READ UNCOMMITTED",
				diagnostic: 5,
			});

			assert.equal(
				result.toString(),
				`SET TRANSACTION
READ ONLY,
ISOLATION LEVEL READ UNCOMMITTED,
DIAGNOSTICS SIZE 5;`,
			);
		});
		test("set transaction READ WRITE", () => {
			const result = sql.setTransaction({
				access: "read WRITE",
				isolation: "serializable",
				diagnostic: 8,
			});

			assert.equal(
				result.toString(),
				`SET TRANSACTION
READ WRITE,
ISOLATION LEVEL SERIALIZABLE,
DIAGNOSTICS SIZE 8;`,
			);
		});
		test("Iniciar la transaccion", () => {
			const result = sql.startTransaction({
				access: "read only",
				isolation: "READ UNCOMMITTED",
				diagnostic: 5,
			});

			assert.equal(
				result.toString(),
				`START TRANSACTION
READ ONLY,
ISOLATION LEVEL READ UNCOMMITTED,
DIAGNOSTICS SIZE 5;`,
			);
		});
		test("aplicar restricciones diferidas", () => {
			const result = sql.setConstraints(
				["RESTRICCION_1", "RESTRICCION_2"],
				"deferred",
			);

			assert.equal(
				result.toString(),
				"SET CONSTRAINTS RESTRICCION_1, RESTRICCION_2 DEFERRED;",
			);
		});
		test("aplicar puntos de recuperación", () => {
			const result = sql.setSavePoint("SECCION_1").clearSavePoint("SECCION_1");

			assert.equal(
				result.toString(),
				"SAVEPOINT SECCION_1;\nRELEASE SAVEPOINT SECCION_1;",
			);
		});
		test("commit and rollback", () => {
			const result = sql.commit().rollback("SECCTION_1");
			assert.equal(
				result.toString(),
				"COMMIT;\nROLLBACK TO SAVEPOINT SECCTION_1;",
			);
		});
	});
});
