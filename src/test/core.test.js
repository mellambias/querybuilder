import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";
import Cursor from "../cursor.js";

describe("El Core del lenguaje qb2006", async () => {
	let qb;
	beforeEach(async () => {
		qb = new QueryBuilder(Core, {
			typeIdentificator: "regular",
		});
	});
	test("Comando para crear una base de datos", { only: false }, async () => {
		const result = await qb.createDatabase("testing").toString();

		assert.equal(result, "CREATE DATABASE testing;");
	});

	test(
		"Falla cuando se crea una base de datos con un nombre reservado",
		{ only: false },
		async () => {
			try {
				await qb.createDatabase("DAY").toString();
			} catch (error) {
				assert.equal(error, "Error: DAY no es un identificador valido");
			}
		},
	);
	test("Comando para eliminar una base de datos", { only: false }, async () => {
		const result = await qb.dropDatabase("testing").toString();
		assert.equal(result, "DROP DATABASE testing;");
	});
	test("Crear una tabla", { only: false }, async () => {
		const result = await qb
			.use("testing")
			.createTable("table_test", { cols: { ID: "INT" } })
			.toString();
		assert.equal(result, "USE testing;\nCREATE TABLE table_test\n( ID INT );");
	});
	test("Crear una tabla temporal global", { only: false }, async () => {
		const result = await qb
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
	test("Crear una tabla temporal local", { only: false }, async () => {
		const result = await qb
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
	test("Crear una tabla con varias columnas", { only: false }, async () => {
		const cols = {
			ID_ARTISTA: "INTEGER",
			NOMBRE_ARTISTA: { type: "CHARACTER(60)", default: "artista" },
			FDN_ARTISTA: "DATE",
			POSTER_EN_EXISTENCIA: "BOOLEAN",
		};
		const result = await qb
			.use("testing")
			.createTable("table_test", { cols })
			.toString();
		assert.equal(
			result,
			"USE testing;\nCREATE TABLE table_test\n( ID_ARTISTA INTEGER,\n NOMBRE_ARTISTA CHARACTER(60) DEFAULT 'artista',\n FDN_ARTISTA DATE,\n POSTER_EN_EXISTENCIA BOOLEAN );",
		);
	});
	test(
		"No puede Crear una tabla si una columna no es valida",
		{ only: false },
		async () => {
			try {
				const cols = {
					DAY: "INTEGER",
					NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
				};
				await qb.use("testing").createTable("table_test", { cols }).toString();
			} catch (error) {
				assert.equal(error.message, "DAY no es un identificador valido");
			}
		},
	);

	test("Crear un tipo definido por el usuario", { only: false }, async () => {
		const result = await qb
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.toString();
		assert.equal(
			result,
			"USE testing;\nCREATE TYPE SALARIO AS NUMERIC(8,2) NOT FINAL;",
		);
	});
	test("Crea la base de datos inventario", { only: false }, async () => {
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

		const result = await qb
			.createDatabase("INVENTARIO")
			.use("INVENTARIO")
			.createTable("DISCOS_COMPACTOS", { cols: cols.DISCOS_COMPACTOS })
			.createTable("DISQUERAS_CD", { cols: cols.DISQUERAS_CD })
			.createTable("TIPOS_MUSICA", { cols: cols.TIPOS_MUSICA })
			.toString();
	});
	describe("Alter TABLE", async () => {
		test("Añade una columna a la tabla", { only: false }, async () => {
			const result = await qb
				.use("INVENTARIO")
				.alterTable("DISCOS_COMPACTOS")
				.addColumn("CANTIDAD", "INT")
				.toString();

			assert.equal(
				result,
				"USE INVENTARIO;\nALTER TABLE DISCOS_COMPACTOS\nADD COLUMN CANTIDAD INT;",
			);
		});
		test("Modifica una columna a la tabla", { only: false }, async () => {
			const result = await qb
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
		test("Elimina una columna a la tabla", { only: false }, async () => {
			const result = await qb
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
	test("Elimina una tabla", { only: false }, async () => {
		const result = await qb
			.use("INVENTARIO")
			.dropTable("DISCOS_COMPACTOS", "cascade")
			.toString();
		assert.equal(
			result,
			"USE INVENTARIO;\nDROP TABLE DISCOS_COMPACTOS CASCADE;",
		);
	});

	describe("Restricciones de columna", { only: false }, async () => {
		test("Aplicación de not null", async () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null"] },
			};
			const result = await qb
				.createTable("ARTISTAS", { cols: tabla })
				.toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL );",
			);
		});
		test("Aplicación de UNIQUE", async () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null", "unique"] },
			};
			const result = await qb
				.createTable("ARTISTAS", { cols: tabla })
				.toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL UNIQUE );",
			);
		});
		test("Aplicacion de PRIMARY KEY", async () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["primary key"] },
			};
			const result = await qb
				.createTable("ARTISTAS", { cols: tabla })
				.toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT PRIMARY KEY );",
			);
		});
		test("Aplicacion de FOREIGN KEY", async () => {
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
			const result = await qb
				.createTable("ARTISTAS", { cols: tabla })
				.toString();
			assert.equal(
				result,
				"CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL REFERENCES CD_ARTISTA (CD_ARTISTA_ID) MATCH FULL );",
			);
		});
		test("Restriccion de CHECK", async () => {
			const TITULOS_CD = {
				ID_DISCO_COMPACTO: "INT",
				TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
				EN_EXISTENCIA: {
					type: "INT",
					values: ["NOT NULL"],
					check: "EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30",
				},
			};
			const result = await qb
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
	describe("Restriccion de Tabla", async () => {
		test("Aplicacion de UNIQUE y NOT NULL", { only: false }, async () => {
			const tabla = {
				ID_ARTISTA: { type: "INT", values: ["not null", "unique"] },
				NOMBRE_ARTISTA: { type: "VARCHAR(60)", values: ["not null", "unique"] },
			};
			const result = await qb
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
		test("Aplicacion de PRIMARY KEY", { only: false }, async () => {
			const tabla = {
				ID_ARTISTA: "INT",
				NOMBRE_ARTISTA: {
					type: "VARCHAR(60)",
					values: ["not null"],
				},
			};
			const result = await qb
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
		test("Aplicacion de constraing FOREIGN KEY", { only: false }, async () => {
			const tabla = {
				ID_ARTISTA: {
					type: "INT",
					values: ["not null"],
				},
			};
			const result = await qb
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
		test(
			"Aplicacion de FOREIGN KEY ON UPDATE Y ON DELETE",
			{ only: false },
			async () => {
				const tabla = {
					ID_ARTISTA: {
						type: "INT",
						values: ["not null"],
					},
				};
				const result = await qb
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
			},
		);
		test("Restriccion de CHECK con constraing", { only: false }, async () => {
			const TITULOS_CD = {
				ID_DISCO_COMPACTO: "INT",
				TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
				EN_EXISTENCIA: { type: "INT", values: ["NOT NULL"] },
			};
			const result = await qb
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
		test("Crear un DOMINIO", { only: false }, async () => {
			const result = await qb
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
	describe("Opciones poco o nada soportadas", { only: false }, async () => {
		test("CREATE ASSERTION", async () => {
			const result = await qb
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
	describe("Vistas", async () => {
		test("crear una vista de una sola tabla", { only: false }, async () => {
			const query = `SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO`;
			const result = await qb
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
		test("eliminar una vista", { only: false }, async () => {
			assert.equal(
				await qb.dropView("DISCOS_COMPACTOS_EN_EXISTENCIA").toString(),
				"DROP VIEW DISCOS_COMPACTOS_EN_EXISTENCIA;",
			);
		});
	});
	describe("SEGURIDAD", async () => {
		test("crear un ROL de usuario", { only: false }, async () => {
			const result = await qb
				.createRoles("CLIENTES", { admin: "CURRENT_USER" })
				.toString();
			assert.equal(result, "CREATE ROLE CLIENTES WITH ADMIN CURRENT_USER;");
		});
		test("elimina un ROL de usuario", { only: false }, async () => {
			const result = await qb.dropRoles(["CLIENTES", "ADMIN"]).toString();
			assert.equal(result, "DROP ROLE CLIENTES;\nDROP ROLE ADMIN;");
		});
		test("autorizar privilegios", { only: false }, async () => {
			const result = await qb
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
		test("revocar privilegios", { only: false }, async () => {
			const result = await qb
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
		test(
			"asignar rol a un identificador de usuario",
			{ only: false },
			async () => {
				const result = await qb
					.grantRoles("ADMINISTRADORES", "LindaN")
					.toString();
				assert.equal(result, "GRANT ADMINISTRADORES TO LindaN;");
			},
		);
		test(
			"conceder múltiples roles a múltiples identificadores de usuario",
			{ only: false },
			async () => {
				const result = await qb
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
			},
		);
		test("revocar un rol", { only: false }, async () => {
			const result = await qb
				.revokeRoles("ADMINISTRADORES", "LindaN", {})
				.toString();
			assert.equal(result, "REVOKE ADMINISTRADORES FROM LindaN CASCADE;");
		});
		test(
			"revocar varios roles a varios identificadores",
			{ only: false },
			async () => {
				const result = await qb
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
			},
		);
	});
	describe("Consultas de qb", async () => {
		test(
			"SELECT todas las filas distintas y todas las columnas ",
			{ only: false },
			async () => {
				const result = qb.select("*", { unique: true }).from("MUSICA");
				assert.equal(
					await result.toString(),
					"SELECT DISTINCT *\nFROM MUSICA;",
				);
			},
		);
		test(
			"SELECT todas las filas distintas y algunas columnas",
			{ only: false },
			async () => {
				const result = await qb
					.select(
						[{ col: "DISCOS", as: "ID_DISCO" }, "PRECIO", { col: "CANTIDAD" }],
						{
							unique: true,
						},
					)
					.from("MUSICA")
					.toString();
				assert.equal(
					result,
					"SELECT DISTINCT DISCOS AS ID_DISCO, PRECIO, CANTIDAD\nFROM MUSICA;",
				);
			},
		);
		test("Filtrado de datos con WHERE", { only: false }, async () => {
			const result = await qb
				.select(["TITULO_CD", "DERECHOSDEAUTOR", "EN_EXISTENCIA"])
				.from("INVENTARIO_DISCO_COMPACTO")
				.where(
					qb.and(
						qb.gt("DERECHOSDEAUTOR", 1989),
						qb.lt("DERECHOSDEAUTOR", 2000),
					),
				)
				.toString();

			assert.equal(
				result,
				`SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO
WHERE (DERECHOSDEAUTOR > 1989
AND DERECHOSDEAUTOR < 2000);`,
			);
		});
		test(
			"agrupar filas cuyos valores de columna son iguales",
			{ only: false },
			async () => {
				const result = await qb
					.select([
						"CATEGORIA",
						"PRECIO",
						{ col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
					])
					.from("EXISTENCIA_DISCO_COMPACTO")
					.groupBy(["CATEGORIA", "PRECIO"])
					.toString();

				assert.equal(
					result,
					`SELECT CATEGORIA, PRECIO, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY CATEGORIA, PRECIO;`,
				);
			},
		);
		test("GROUP BY ROLLUP", { only: false }, async () => {
			const result = qb
				.select([
					"CATEGORIA",
					"PRECIO",
					{ col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
				])
				.from("EXISTENCIA_DISCO_COMPACTO")
				.groupBy({ rollup: ["CATEGORIA", "PRECIO"] });
			assert.equal(
				await result.toString(),
				`SELECT CATEGORIA, PRECIO, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY ROLLUP (CATEGORIA, PRECIO);`,
			);
		});
		test("HAVING", { only: false }, async () => {
			const result = qb
				.select([
					"PRECIO",
					"CATEGORIA",
					{ col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
				])
				.from("EXISTENCIA_DISCO_COMPACTO")
				.groupBy(["CATEGORIA", "PRECIO"])
				.having("SUM(A_LA_MANO) > 10");

			assert.equal(
				await result.toString(),
				`SELECT PRECIO, CATEGORIA, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY CATEGORIA, PRECIO
HAVING SUM(A_LA_MANO) > 10;`,
			);
		});
		test("ORDER BY", { only: false }, async () => {
			const result = qb
				.select("*")
				.from("EXISTENCIA_DISCO_COMPACTO")
				.where("PRECIO < 16.00")
				.orderBy(["PRECIO", { col: "A_LA_MANO", order: "desc" }]);

			assert.equal(
				await result.toString(),
				`SELECT *
FROM EXISTENCIA_DISCO_COMPACTO
WHERE PRECIO < 16.00
ORDER BY PRECIO, A_LA_MANO DESC;`,
			);
		});
	});
	describe("Modificacion de datos", async () => {
		test(
			"Insertar datos en una tabla sin especificar las columnas",
			{ only: false },
			async () => {
				const result = await qb
					.insert("INVENTARIO_CD", [
						"Patsy Cline: 12 Greatest Hits",
						"Country",
						"MCA Records",
						32,
					])
					.toString();

				assert.equal(
					result,
					`INSERT INTO INVENTARIO_CD
VALUES
( 'Patsy Cline: 12 Greatest Hits', 'Country', 'MCA Records', 32 );`,
				);
			},
		);
		test(
			"Insertar datos en una tabla especificando columnas",
			{ only: false },
			async () => {
				const sql = `INSERT INTO INVENTARIO_CD\n( NOMBRE_CD, EDITOR, EN_EXISTENCIA )
VALUES
( 'Fundamental', 'Capitol Records', 34 );`;

				const result = await qb
					.insert(
						"INVENTARIO_CD",
						["Fundamental", "Capitol Records", 34],
						["NOMBRE_CD", "EDITOR", "EN_EXISTENCIA"],
					)
					.toString();

				assert.equal(result, sql);
			},
		);
		test(
			"Insertar datos en una tabla usando SELECT",
			{ only: false },
			async () => {
				const sql = `INSERT INTO INVENTARIO_CD_2
SELECT NOMBRE_CD, EN_EXISTENCIA
FROM INVENTARIO_CD;`;

				const result = await qb
					.insert(
						"INVENTARIO_CD_2",
						qb.select(["NOMBRE_CD", "EN_EXISTENCIA"]).from("INVENTARIO_CD"),
					)
					.toString();

				assert.equal(result, sql);
			},
		);
		test("Insertar varias filas de datos", { only: false }, async () => {
			const result = qb.insert("INVENTARIO_CD", [
				[827, "Private Music"],
				[828, "Reprise Records"],
				[829, "Asylum Records"],
				[830, "Windham Hill Records"],
			]);

			assert.equal(
				await result.toString(),
				`INSERT INTO INVENTARIO_CD
VALUES
(827, 'Private Music'),
(828, 'Reprise Records'),
(829, 'Asylum Records'),
(830, 'Windham Hill Records');`,
			);
		});
		test("Actualizar el valor de una columna", { only: false }, async () => {
			const result = qb.update("INVENTARIO_CD", { EN_EXISTENCIA: 27 });
			assert.equal(
				await result.toString(),
				`UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 27;`,
			);
		});
		test(
			"Actualizar el valor de varias columnas",
			{ only: false },
			async () => {
				const result = qb.update("INVENTARIO_CD", {
					EN_EXISTENCIA: "27",
					CANTIDAD: 10,
				});
				assert.equal(
					await result.toString(),
					`UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = '27',
CANTIDAD = 10;`,
				);
			},
		);
		test(
			"Actualizar el valor de una columna solo de algunas filas usando where",
			{ only: false },
			async () => {
				const result = qb
					.update("INVENTARIO_CD", { EN_EXISTENCIA: 27 })
					.where(qb.eq("NOMBRE_CD", "Out of Africa"));

				assert.equal(
					await result.toString(),
					`UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 27
WHERE NOMBRE_CD = 'Out of Africa';`,
				);
			},
		);
		test("probar la anidacion de llamadas", { only: false }, async () => {
			const result = await qb
				.hello({
					say: qb.hello("asigna a say"),
					Value: qb.say("asigna un valor al campo Value"),
				})
				.toString();

			console.log("Resultado final anidacion\n", result);
			assert.ok(result);
		});
		test(
			"Actualizar el valor de una columna usando como valor el select",
			{ only: false },
			async () => {
				const sql = `UPDATE INVENTARIO_CD_2
SET EN_EXISTENCIA_2 =
( SELECT AVG(EN_EXISTENCIA)
FROM INVENTARIO_CD )
WHERE NOMBRE_CD_2 = 'Orlando';`;

				const result = await qb
					.update("INVENTARIO_CD_2", {
						EN_EXISTENCIA_2: qb
							.select(qb.avg("EN_EXISTENCIA"))
							.from("INVENTARIO_CD"),
					})
					.where(qb.eq("NOMBRE_CD_2", "Orlando"))
					.toString();

				assert.equal(result, sql);
			},
		);
		test(
			"Eliminar filas de una tabla con DELETE FROM",
			{ only: false },
			async () => {
				const result = qb.delete("INVENTARIO_CD");
				assert.equal(await result.toString(), "DELETE FROM INVENTARIO_CD;");
			},
		);
		test(
			"Eliminar algunas filas de una tabla con DELETE y where",
			{ only: false },
			async () => {
				const result = qb
					.delete("INVENTARIO_CD")
					.where(qb.eq("TIPO_MUSICA", "Country"));
				assert.equal(
					await result.toString(),
					`DELETE FROM INVENTARIO_CD
WHERE TIPO_MUSICA = 'Country';`,
				);
			},
		);
		test(
			"eliminar datos usando una sub consulta",
			{ only: false },
			async () => {
				const result = await qb
					.delete("TIPOS_TITULO")
					.where(
						qb.in(
							"TITULO_CD",
							qb
								.select("TITLE")
								.from("INVENTARIO_TITULOS")
								.where(qb.eq("TITLE_ID", 108)),
						),
					)
					.toString();

				assert.equal(
					result,
					`DELETE FROM TIPOS_TITULO
WHERE TITULO_CD IN ( SELECT TITLE
FROM INVENTARIO_TITULOS
WHERE TITLE_ID = 108 );`,
				);
			},
		);
	});
	describe("Predicados de WHERE", async () => {
		test("operadores", { only: false }, async () => {
			assert.equal(
				await qb.eq("columna", "string").toString(),
				"columna = 'string';",
			);
			assert.equal(await qb.ne("columna", 4).toString(), "columna <> 4;");
			assert.equal(await qb.gt("columna", 4).toString(), "columna > 4;");
			assert.equal(await qb.gte("columna", 4).toString(), "columna >= 4;");
			assert.equal(await qb.lt("columna", 4).toString(), "columna < 4;");
			assert.equal(await qb.lte("columna", 4).toString(), "columna <= 4;");
		});
		test("logicos", { only: false }, async () => {
			const result = await qb
				.and(
					qb.or(qb.eq("columna", 1), qb.eq("columna", 2), qb.eq("columna", 3)),
					qb.gt("col", 25),
				)
				.or(qb.and(qb.gt("PEPE", 10), qb.lt("PEPE", 40)))
				.toString();

			assert.equal(
				result,
				`((columna = 1
OR columna = 2
OR columna = 3)
AND col > 25)
OR (PEPE > 10
AND PEPE < 40);`,
			);
		});

		test("predicado NOT", { only: false }, async () => {
			assert.equal(
				await qb.not(qb.eq("col", 24)).toString(),
				"NOT (col = 24);",
			);
			assert.equal(
				await qb.not(qb.or(qb.eq("col", 24), qb.gt("col", 10))).toString(),
				`NOT ((col = 24
OR col > 10));`,
			);
		});
		test("Un valor entre un mínimo y un máximo", { only: false }, async () => {
			assert.equal(
				await qb.between("CAMPO", 12, 15).toString(),
				"CAMPO BETWEEN 12 AND 15;",
			);
		});
		test("Valores que pueden ser Null o no Null", { only: false }, async () => {
			assert.equal(await qb.isNull("col").toString(), "col IS NULL;");
			assert.equal(
				await qb.isNull(["col1", "col2", "col3"]).toString(),
				"col1 IS NULL\nAND col2 IS NULL\nAND col3 IS NULL;",
			);
			assert.equal(
				await qb.isNotNull(["col1", "col2", "col3"]).toString(),
				"col1 IS NOT NULL\nAND col2 IS NOT NULL\nAND col3 IS NOT NULL;",
			);
			assert.equal(
				await qb
					.and(
						qb.isNotNull("LUGAR_DE_NACIMIENTO"),
						qb.gt("AÑO_NACIMIENTO", 1940),
					)
					.toString(),
				`(LUGAR_DE_NACIMIENTO IS NOT NULL
AND AÑO_NACIMIENTO > 1940);`,
			);
		});
		test(
			"Valor que coincide con una expresion usando comodines % y _",
			{ only: false },
			async () => {
				assert.equal(
					await qb.like("ID_CD", "%01").toString(),
					"ID_CD LIKE ('%01');",
				);
			},
		);
		test("valor dentro de una lista", { only: false }, async () => {
			assert.equal(
				await qb.in("EN_EXISTENCIA", [12, 22, 32, 42, "bocata"]).toString(),
				"EN_EXISTENCIA IN ( 12, 22, 32, 42, 'bocata' );",
			);
			assert.equal(
				await qb
					.select(["TITULO", "ARTISTA"])
					.from("ARTISTAS_DISCO_COMPACTO")
					.where(
						qb.in(
							"TITULO",
							qb
								.select("NOMBRE_CD")
								.from("INVENTARIO_DISCO_COMPACTO")
								.where(qb.gt("EN_EXISTENCIA", 10)),
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
		test("El valor existe en la subconsulta", { only: false }, async () => {
			assert.equal(
				await qb
					.select(["TITULO", "ARTISTA"])
					.from("ARTISTAS_DISCO_COMPACTO")
					.where(
						qb.exists(
							qb
								.select("NOMBRE_CD")
								.from("INVENTARIO_DISCO_COMPACTO")
								.where(qb.gt("EN_EXISTENCIA", 10)),
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
		test(
			"el valor coincide con algun valor en la sub consulta",
			{ only: false },
			async () => {
				assert.equal(
					await qb
						.select(["TITULO", "REBAJA"])
						.from("REBAJA_CD")
						.where(
							qb.lt(
								"REBAJA",
								qb.any(
									qb
										.select("MENUDEO")
										.from("MENUDEO_CD")
										.where(qb.gt("EN_EXISTENCIA", 9)),
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
			},
		);
		test(
			"coincide con mas de un valor en la sub consulta",
			{ only: false },
			async () => {
				assert.equal(
					await qb
						.select(["TITULO", "REBAJA"])
						.from("REBAJA_CD")
						.where(
							qb.lt(
								"REBAJA",
								qb.some(
									qb
										.select("MENUDEO")
										.from("MENUDEO_CD")
										.where(qb.gt("EN_EXISTENCIA", 9)),
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
			},
		);
		test(
			"coincide con todos los valores de la sub consulta",
			{ only: false },
			async () => {
				assert.equal(
					await qb
						.select(["TITULO", "REBAJA"])
						.from("REBAJA_CD")
						.where(
							qb.lt(
								"REBAJA",
								qb.all(
									qb
										.select("MENUDEO")
										.from("MENUDEO_CD")
										.where(qb.gt("EN_EXISTENCIA", 9)),
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
			},
		);
	});
	describe("Funciones", async () => {
		describe("SET", async () => {
			test("COUNT", { only: false }, async () => {
				assert.equal(await qb.count("*").toString(), "COUNT(*);");
				assert.equal(await qb.count("PRECIO").toString(), "COUNT(PRECIO);");
				assert.equal(
					await qb.count("PRECIO", "DINERO").toString(),
					"COUNT(PRECIO) AS DINERO;",
				);
			});
			test("SELECT con COUNT", { only: false }, async () => {
				const result = await qb
					.select(qb.count("PRECIO", "DINERO"))
					.from("LISTA_CD")
					.toString();

				assert.equal(result, "SELECT COUNT(PRECIO) AS DINERO\nFROM LISTA_CD;");
			});
			test("MAX y MIN", { only: false }, async () => {
				assert.equal(await qb.max("PRECIO").toString(), "MAX(PRECIO);");
				assert.equal(
					await qb.max("PRECIO", "DINERO").toString(),
					"MAX(PRECIO) AS DINERO;",
				);
				assert.equal(await qb.min("PRECIO").toString(), "MIN(PRECIO);");
				assert.equal(
					await qb.min("PRECIO", "DINERO").toString(),
					"MIN(PRECIO) AS DINERO;",
				);
			});
			test("SUM", { only: false }, async () => {
				assert.equal(await qb.sum("PRECIO").toString(), "SUM(PRECIO);");
				assert.equal(
					await qb.sum("PRECIO", "DINERO").toString(),
					"SUM(PRECIO) AS DINERO;",
				);
			});
			test("AVG", { only: false }, async () => {
				assert.equal(await qb.avg("PRECIO").toString(), "AVG(PRECIO);");
				assert.equal(
					await qb.avg("PRECIO", "DINERO").toString(),
					"AVG(PRECIO) AS DINERO;",
				);
			});
		});
		describe("VALUE", async () => {
			describe("funciones de valor de cadena", { only: false }, async () => {
				test("substring", async () => {
					assert.equal(
						await qb.substr("DESCRIPCION", 3).toString(),
						"SUBSTRING(DESCRIPCION FROM 3);",
					);
					assert.equal(
						await qb.substr("DESCRIPCION", 3, 10).toString(),
						"SUBSTRING(DESCRIPCION FROM 3 FOR 10);",
					);
					assert.equal(
						await qb.substr("DESCRIPCION", 3, "ABREVIADO").toString(),
						"SUBSTRING(DESCRIPCION FROM 3) AS ABREVIADO;",
					);
				});
				test("UPPER y LOWER", async () => {
					assert.equal(await qb.upper("DISCO").toString(), "UPPER(DISCO);");
					assert.equal(
						await qb.upper("DISCO", "DISCO_EN_MAYUSCULA").toString(),
						"UPPER(DISCO) AS DISCO_EN_MAYUSCULA;",
					);
					assert.equal(await qb.lower("DISCO").toString(), "LOWER(DISCO);");
					assert.equal(
						await qb.lower("DISCO", "DISCO_EN_MAYUSCULA").toString(),
						"LOWER(DISCO) AS DISCO_EN_MAYUSCULA;",
					);
				});
			});
			describe("funciones de tiempo", { only: false }, async () => {
				test("Current", async () => {
					assert.equal(await qb.currentDate().toString(), "CURRENT_DATE;");
					assert.equal(await qb.currentTime().toString(), "CURRENT_TIME;");
					assert.equal(
						await qb.currentTimestamp().toString(),
						"CURRENT_TIMESTAMP;",
					);
				});
				test("local time", async () => {
					assert.equal(await qb.localTime().toString(), "LOCALTIME;");
					assert.equal(await qb.localTimestamp().toString(), "LOCALTIMESTAMP;");
				});
			});
		});
	});
	describe("Operaciones con dos tablas", async () => {
		test("tabla de producto cartesiano", { only: false }, async () => {
			const result = await qb
				.select("*")
				.from(["INVENTARIO_CD", "INTERPRETES"])
				.toString();

			assert.equal(
				result,
				`SELECT *
FROM INVENTARIO_CD, INTERPRETES;`,
			);
		});
		test("Una tabla EQUI-JOIN", { only: false }, async () => {
			const result = await qb
				.select("*")
				.from(["INVENTARIO_CD", "INTERPRETES"])
				.where(
					qb.eq(
						qb.col("ID_INTER", "INVENTARIO_CD"),
						qb.col("ID_INTER", "INTERPRETES"),
					),
				)
				.toString();
			assert.equal(
				result,
				`SELECT *
FROM INVENTARIO_CD, INTERPRETES
WHERE INVENTARIO_CD.ID_INTER = INTERPRETES.ID_INTER;`,
			);
		});
		test(
			"limitar las columnas arrojadas y agregar otro predicado a la cláusula WHERE y así limitar las filas arrojadas",
			{ only: false },
			async () => {
				const result = await qb
					.select([
						qb.col("NOMBRE_CD", "INVENTARIO_CD"),
						qb.col("NOMBRE_INTER", "INTERPRETES"),
						qb.col("EN_EXISTENCIA", "INVENTARIO_CD"),
					])
					.from(["INVENTARIO_CD", "INTERPRETES"])
					.where(
						qb.and(
							qb.eq(
								qb.col("ID_INTER", "INVENTARIO_CD"),
								qb.col("ID_INTER", "INTERPRETES"),
							),
							qb.lt(qb.col("EN_EXISTENCIA", "INVENTARIO_CD"), 15),
						),
					)
					.toString();

				assert.equal(
					result,
					`SELECT INVENTARIO_CD.NOMBRE_CD, INTERPRETES.NOMBRE_INTER, INVENTARIO_CD.EN_EXISTENCIA
FROM INVENTARIO_CD, INTERPRETES
WHERE (INVENTARIO_CD.ID_INTER = INTERPRETES.ID_INTER
AND INVENTARIO_CD.EN_EXISTENCIA < 15);`,
				);
			},
		);
		test("Uso de alias para tablas", { only: false }, async () => {
			const result = await qb
				.select([
					qb.col("NOMBRE_CD", "c"),
					qb.col("NOMBRE_INTER", "p"),
					qb.col("EN_EXISTENCIA", "c"),
				])
				.from(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
				.where(
					qb.and(
						qb.eq(qb.col("ID_INTER", "c"), qb.col("ID_INTER", "p")),
						qb.lt(qb.col("EN_EXISTENCIA", "c"), 15),
					),
				)
				.toString();

			assert.equal(
				result,
				`SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD AS c, INTERPRETES AS p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`,
			);
		});
		test("CROSS JOIN", { only: false }, async () => {
			const result = await qb
				.select([
					qb.col("NOMBRE_CD", "c"),
					qb.col("NOMBRE_INTER", "p"),
					qb.col("EN_EXISTENCIA", "c"),
				])
				.crossJoin(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
				.where(
					qb.and(
						qb.eq(qb.col("ID_INTER", "c"), qb.col("ID_INTER", "p")),
						qb.lt(qb.col("EN_EXISTENCIA", "c"), 15),
					),
				)
				.toString();

			assert.equal(
				result,
				`SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD c CROSS JOIN INTERPRETES p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`,
			);
		});
		test("NATURAL JOIN", { only: false }, async () => {
			const result = await qb
				.select(["TITULO_CD", "TIPO_CD", qb.col("MENUDEO", "c")])
				.naturalJoin(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
				.where(qb.gt(qb.col("INVENTARIO", "s"), 15))
				.toString();

			assert.equal(
				result,
				`SELECT TITULO_CD, TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s NATURAL JOIN COSTOS_TITULO c
WHERE s.INVENTARIO > 15;`,
			);
		});
		test("Join de columna nombrada con using", { only: false }, async () => {
			const result = await qb
				.select(["TITULO_CD", qb.col("TIPO_CD", "s"), qb.col("MENUDEO", "c")])
				.join(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
				.using("TITULO_CD")
				.where(qb.gt(qb.col("INVENTARIO", "s"), 15))
				.toString();

			assert.equal(
				result,
				`SELECT TITULO_CD, s.TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s JOIN COSTOS_TITULO c
USING (TITULO_CD)
WHERE s.INVENTARIO > 15;`,
			);
		});
		test("INNER JOIN y la clausula ON", { only: false }, async () => {
			const result = await qb
				.select([qb.col("TITULO", "t"), qb.col("ARTISTA", "a")])
				.innerJoin(["TITULO_CDS", "ARTISTAS_TITULOS"], ["t", "ta"])
				.on(qb.eq(qb.col("ID_TITULO", "t"), qb.col("ID_TITULO", "ta")))
				.innerJoin("ARTISTAS_CD", "a")
				.on(qb.eq(qb.col("ID_ARTISTA", "ta"), qb.col("ID_ARTISTA", "a")))
				.where(qb.like(qb.col("TITULO", "t"), "%Blue%"))
				.toString();

			assert.equal(
				result,
				`SELECT t.TITULO, a.ARTISTA
FROM TITULO_CDS t INNER JOIN ARTISTAS_TITULOS ta
ON t.ID_TITULO = ta.ID_TITULO
INNER JOIN ARTISTAS_CD a
ON ta.ID_ARTISTA = a.ID_ARTISTA
WHERE t.TITULO LIKE ('%Blue%');`,
			);
		});
		test("LEFT OUTER JOIN", { only: false }, async () => {
			const result = await qb
				.select([
					qb.col("TITULO", "i"),
					qb.col("NOMBRE_TIPO", "t"),
					qb.col("EXISTENCIA", "i"),
				])
				.leftJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on(qb.eq(qb.col("ID_TIPO", "i"), qb.col("ID_TIPO", "t")))
				.toString();

			assert.equal(
				result,
				`SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i LEFT OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
			);
		});
		test("RIGHT OUTER JOIN", { only: false }, async () => {
			const result = await qb
				.select([
					qb.col("TITULO", "i"),
					qb.col("NOMBRE_TIPO", "t"),
					qb.col("EXISTENCIA", "i"),
				])
				.rightJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on(qb.eq(qb.col("ID_TIPO", "i"), qb.col("ID_TIPO", "t")))
				.toString();

			assert.equal(
				result,
				`SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i RIGHT OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
			);
		});
		test("FULL OUTER JOIN", { only: false }, async () => {
			const result = await qb
				.select([
					qb.col("TITULO", "i"),
					qb.col("NOMBRE_TIPO", "t"),
					qb.col("EXISTENCIA", "i"),
				])
				.fullJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on(qb.eq(qb.col("ID_TIPO", "i"), qb.col("ID_TIPO", "t")))
				.toString();

			assert.equal(
				result,
				`SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i FULL OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
			);
		});
		test("UNION", { only: false }, async () => {
			const result = await qb
				.union(
					qb.select("TIPO_CD").from("CDS_CONTINUADOS"),
					qb.select("TIPO_CD").from("CDS_DESCONTINUADOS"),
				)
				.toString();

			assert.equal(
				result,
				`SELECT TIPO_CD
FROM CDS_CONTINUADOS
UNION
SELECT TIPO_CD
FROM CDS_DESCONTINUADOS;`,
			);
		});
		test("UNION ALL", { only: false }, async () => {
			const result = await qb
				.unionAll(
					qb.select("TIPO_CD").from("CDS_CONTINUADOS"),
					"SELECT TIPO_CD\nFROM CDS_DEVUELTOS",
					qb.select("TIPO_CD").from("CDS_DESCONTINUADOS"),
				)
				.toString();

			assert.equal(
				result,
				`SELECT TIPO_CD
FROM CDS_CONTINUADOS
UNION ALL
SELECT TIPO_CD
FROM CDS_DEVUELTOS
UNION ALL
SELECT TIPO_CD
FROM CDS_DESCONTINUADOS;`,
			);
		});
	});
	describe("USO DE SUBCONSULTAS PARA ACCEDER Y MODIFICAR DATOS", async () => {
		test("subconsultas con varios resultados", { only: false }, async () => {
			const result = await qb
				.select("*")
				.from("EXISTENCIA_CD")
				.where(
					qb.in(
						"TITULO_CD",
						qb
							.select("TITULO")
							.from("ARTISTAS_CD")
							.where(qb.eq("NOMBRE_ARTISTA", "Joni Mitchell")),
					),
				)
				.toString();

			assert.equal(
				result,
				`SELECT *
FROM EXISTENCIA_CD
WHERE TITULO_CD IN ( SELECT TITULO
FROM ARTISTAS_CD
WHERE NOMBRE_ARTISTA = 'Joni Mitchell' );`,
			);
		});
		test("sub consultas anidadas", { only: false }, async () => {
			const result = await qb
				.select(["NOMBRE_DISCO", "CANTIDAD_EXISTENCIA"])
				.from("INVENTARIO_DISCO")
				.where(
					qb.in(
						"ID_ARTISTA",
						qb
							.select("ID_ARTISTA")
							.from("ARTISTAS_DISCO")
							.where(
								qb.in(
									"ID_TIPO_DISCO",
									qb
										.select("ID_TIPO_DISCO")
										.from("TIPOS_DISCO")
										.where(qb.eq("NOMBRE_TIPO_DISCO", "Blues")),
								),
							),
					),
				)
				.toString();

			assert.equal(
				result,
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
	/** Los cursores solo funcionan dentro del SGBD dentro de los procesos y funciones */
	/**
	 * Los siguientes Test prueban la funcionalidad que puede ser añadida al SGBD
	 */
	describe("trabajo con cursores", async () => {
		test("declarar un cursor", { only: false }, async () => {
			const options = {
				changes: "ASENSITIVE",
				cursor: "SCROLL",
				hold: true,
				return: false,
				orderBy: "COLUMN",
				readOnly: false,
				update: ["COL1", "COL2"],
			};

			const result = await qb.createCursor(
				"name",
				qb.select("*").from("TABLA"),
				options,
			);

			assert.equal(
				result,
				`DECLARE name ASENSITIVE SCROLL WITH HOLD WITHOUT RETURN CURSOR FOR SELECT *
FROM TABLA ORDER BY COLUMN FOR UPDATE OF COL1, COL2;`,
			);
		});
		test(
			"instrucción de cursor básica con deplazamiento",
			{ only: false },
			async () => {
				const result = await qb.createCursor(
					"CD_1",
					qb.select("*").from("INVENTARIO_CD"),
					{
						orderBy: "DISCO_COMPACTO",
						cursor: "scroll",
						readOnly: true,
					},
				);

				assert.equal(
					result,
					`DECLARE CD_1 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;`,
				);
			},
		);
		test("un cursor actualizable", { only: false }, async () => {
			const result = await qb.createCursor(
				"CD_4",
				qb.select("*").from("INVENTARIO_CD"),
				{
					update: "DISCO_COMPACTO",
				},
			);

			assert.equal(
				result,
				`DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE OF DISCO_COMPACTO;`,
			);
		});
		test("Recuperar datos de un cursor", { only: false }, async () => {
			const cursor = await qb.createCursor(
				"CD_2",
				qb.select("*").from("INVENTARIO_CD"),
				{
					cursor: "scroll",
					orderBy: "DISCO_COMPACTO",
					readOnly: true,
				},
			);
			assert.ok(cursor instanceof Cursor);
			assert.equal(
				cursor,
				`DECLARE CD_2 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;`,
			);

			assert.equal(cursor.status, "declared");
			// Se abre el cursor utilizando el queryBuilder
			const openCursor = await qb.openCursor("CD_2");
			assert.equal(
				openCursor.toString(),
				`DECLARE CD_2 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;
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
			await qb.closeCursor("CD_2");

			assert.equal(cursor.status, "closed");
			assert.equal(
				cursor.toString(),
				`DECLARE CD_2 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;
OPEN CD_2;
FETCH NEXT FROM CD_2
INTO :una, :dos;
FETCH ABSOLUTE 5 FROM CD_2
INTO :una, :dos;
CLOSE CD_2;`,
			);
		});
		test("Actualizar datos usando el cursor", { only: false }, async () => {
			//declara el cursor para actualizar
			const cursor = await qb.createCursor(
				"CD_4",
				qb.select("*").from("INVENTARIO_CD"),
				{ update: true },
			);

			assert.equal(
				cursor.toString(),
				`DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE;`,
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
			const result = await qb
				.update("INVENTARIO_CD", { A_LA_MANO: ":A_la_mano * 2" })
				.whereCursor("CD_4")
				.closeCursor("CD_4");

			assert.equal(
				result.toString(),
				`DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE;
OPEN CD_4;
FETCH CD_4
INTO :CD, :Categoria, :Precio, :A_la_mano;
UPDATE INVENTARIO_CD
SET A_LA_MANO = :A_la_mano * 2
WHERE CURRENT OF CD_4;
CLOSE CD_4;`,
			);
		});
		test(
			"DELETE POSICIONADO usando comandos de cursor",
			{ only: false },
			async () => {
				// Crea un cursor
				const cursor = await qb.createCursor(
					"CD_4",
					qb.select("*").from("INVENTARIO_CD"),
					{
						update: true,
					},
				);
				// abre el cursor
				cursor.open();
				// Desplaza el cursor
				const fila = cursor.fetch(["CD"]);
				// añade un comando al cursor
				await cursor.add(qb.delete("INVENTARIO_CD").whereCursor("CD_4"));
				// cierra el cursor
				cursor.close();

				assert.ok(fila);

				assert.equal(
					cursor.toString(),
					`DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE;
OPEN CD_4;
FETCH CD_4
INTO :CD;
DELETE FROM INVENTARIO_CD
WHERE CURRENT OF CD_4;
CLOSE CD_4;`,
				);
			},
		);
	});
	describe("trabajo con transacciones", async () => {
		test("set transaction", { only: true }, async () => {
			const result = await qb.setTransaction({
				access: "read only",
				isolation: "READ UNCOMMITTED",
				diagnostic: 5,
			});

			assert.equal(
				result.toString(),
				`SET TRANSACTION READ ONLY,
ISOLATION LEVEL READ UNCOMMITTED,
DIAGNOSTICS SIZE 5;`,
			);
		});
		test("set transaction READ WRITE", async () => {
			const result = await qb.setTransaction({
				access: "read WRITE",
				isolation: "serializable",
				diagnostic: 8,
			});

			assert.equal(
				result.toString(),
				`SET TRANSACTION READ WRITE,
ISOLATION LEVEL SERIALIZABLE,
DIAGNOSTICS SIZE 8;`,
			);
		});
		test("Iniciar la transaccion", async () => {
			const result = await qb.startTransaction({
				access: "read only",
				isolation: "READ UNCOMMITTED",
				diagnostic: 5,
			});

			assert.equal(
				result.toString(),
				`START TRANSACTION READ ONLY,
ISOLATION LEVEL READ UNCOMMITTED,
DIAGNOSTICS SIZE 5;`,
			);
		});
		test("aplicar restricciones diferidas", async () => {
			const result = await qb.setConstraints(
				["RESTRICCION_1", "RESTRICCION_2"],
				"deferred",
			);

			assert.equal(
				result.toString(),
				"SET CONSTRAINTS RESTRICCION_1, RESTRICCION_2 DEFERRED;",
			);
		});
		test("aplicar puntos de recuperación", async () => {
			const result = await qb
				.setSavePoint("SECCION_1")
				.clearSavePoint("SECCION_1");

			assert.equal(
				result.toString(),
				"SAVEPOINT SECCION_1;\nRELEASE SAVEPOINT SECCION_1;",
			);
		});
		test("commit and rollback", async () => {
			const result = await qb.commit().rollback("SECCTION_1");
			assert.equal(
				result.toString(),
				"COMMIT;\nROLLBACK TO SAVEPOINT SECCTION_1;",
			);
		});
	});
});
