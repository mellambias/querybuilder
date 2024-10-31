import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../querybuilder.js";
import MySQL from "../sql/MySQL.js";
import { config } from "../../config.js";
import { tableFormat } from "./utilsForTest/tableFormat.js";

const MySql8 = config.databases.MySql8;
let qb;
beforeEach(() => {
	const queryBuilder = new QueryBuilder(MySQL, {
		typeIdentificator: "regular",
		mode: "test",
	});
	qb = queryBuilder.driver(MySql8.driver, MySql8.params);
});

describe("Driver MySqlDriver", async () => {
	test("crea una base de datos", async () => {
		try {
			await qb.createDatabase("testing").execute();
			assert.equal(qb.toString(), "CREATE DATABASE testing;");
		} catch (error) {
			assert.equal(
				error.message,
				"Can't create database 'testing'; database exists",
			);
		}
	});
	test("Crear una tabla en la base de datos testing", async () => {
		const result = await qb
			.use("testing")
			.createTable("TABLE_TEST", { cols: { ID: "INT" } })
			.execute();

		if (!result.error) {
			assert.equal(
				result.toString(),
				"USE testing;\nCREATE TABLE TABLE_TEST\n( ID INT );",
			);
		} else {
			assert.equal(result.error, "Table 'table_test' already exists");
		}
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
				result.toString(),
				"USE testing;\nCREATE TEMPORARY TABLE table_test_temp ( ID INT );",
			);
			assert.ok(result.queryResult);
		} else {
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
		const result = await qb
			.use("testing")
			.createTable("table_test2", { cols, secure: true })
			.execute();

		if (!result.error) {
			assert.equal(
				result.toString(),
				`USE testing;
CREATE TABLE IF NOT EXISTS table_test2
( ID_ARTISTA INT,
 NOMBRE_ARTISTA CHAR(60) DEFAULT 'artista',
 FDN_ARTISTA DATE,
 POSTER_EN_EXISTENCIA TINYINT );`,
			);
		} else {
			assert.equal(result.error, "Table 'table_test2' already exists");
		}
	});

	test("Crear un tipo definido por el usuario", async () => {
		const result = await qb
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.execute();

		if (!result.error) {
			assert.equal(result.toString(), "USE testing;");
		} else {
			assert.equal(result.error, "No soportado utilice SET o ENUM");
		}
	});

	test("elimina una tabla", async () => {
		const result = await qb
			.use("testing")
			.dropTable("TABLE_TEST_2", { secure: true, option: "cascade" })
			.execute();

		if (!result.error) {
			assert.equal(
				result.toString(),
				"USE testing;\nDROP TABLE IF EXISTS TABLE_TEST_2 CASCADE;",
			);
		} else {
			assert.equal(result.error, "");
		}
	});

	after(async () => {
		qb.use("testing").dropDatabase("testing").execute();
	});
});

// Usa la base de datos inventario

const TIPOS_MUSICA = {
	ID_TIPO: "INT",
	NOMBRE_TIPO: { type: "VARCHAR(20)", values: ["not null"] },
};
const ARTISTAS = {
	ID_ARTISTA: "INT",
	NOMBRE_ARTISTA: { type: "VARCHAR(60)", values: ["not null"] },
	LUGAR_DE_NACIMIENTO: {
		type: "VARCHAR(60)",
		values: ["not null"],
		default: "Desconocido",
	},
};
const DISQUERAS_CD = {
	ID_DISQUERA: "INT",
	NOMBRE_DISCOGRAFICA: {
		type: "VARCHAR(60)",
		default: "Independiente",
		values: ["not null"],
	},
};

const TITULOS_CD = {
	ID_DISCO_COMPACTO: "INT",
	TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
	EN_EXISTENCIA: { type: "INT", values: ["NOT NULL"] },
};

const DISCOS_COMPACTOS = {
	ID_DISCO_COMPACTO: "INT",
	TITULO_CD: { type: "varchar(60)", values: ["not null"] },
	ID_DISQUERA: {
		type: "INT",
		values: ["NOT NULL"],
	},
};

const TIPOS_DISCO_COMPACTO = {
	ID_DISCO_COMPACTO: "INT",
	ID_TIPO_MUSICA: "INT",
};
const CDS_ARTISTA = {
	ID_ARTISTA: "INT",
	ID_DISCO_COMPACTO: "INT",
};

describe("Trabaja con INVENTARIO", () => {
	test("Crea la base de datos inventario", async () => {
		const result = await qb.createDatabase("INVENTARIO").execute();

		assert.equal(
			result.toString(),
			"USE INVENTARIO;\nCREATE DATABASE INVENTARIO;",
		);

		if (result.error) {
			assert.equal(
				result.error,
				"Can't create database 'inventario'; database exists",
			);
		}
	});
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	describe("Crea las tablas", () => {
		test("crear tabla TIPOS_MUSICA", async () => {
			const result = await qb
				.createTable("TIPOS_MUSICA", {
					secure: true,
					cols: TIPOS_MUSICA,
					constraints: [
						{
							name: "UN_NOMBRE_TIPO",
							type: "unique",
							cols: ["NOMBRE_TIPO"],
						},
						{
							name: "PK_TIPOS_MUSICA",
							type: "PRIMARY KEY",
							cols: ["ID_TIPO"],
						},
					],
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS TIPOS_MUSICA
( ID_TIPO INT,
 NOMBRE_TIPO VARCHAR(20) NOT NULL,
 CONSTRAINT UN_NOMBRE_TIPO UNIQUE (NOMBRE_TIPO),
 CONSTRAINT PK_TIPOS_MUSICA PRIMARY KEY (ID_TIPO) );`,
				);
			} else {
				assert.equal(result.error, "Table 'tipos_musica' already exists");
			}
		});

		test("crear tabla DISQUERAS_CD", async () => {
			const result = await qb
				.createTable("DISQUERAS_CD", {
					secure: true,
					cols: DISQUERAS_CD,
					constraints: [
						{
							name: "PK_DISQUERAS_CD",
							type: "primary key",
							cols: ["ID_DISQUERA"],
						},
					],
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS DISQUERAS_CD
( ID_DISQUERA INT,
 NOMBRE_DISCOGRAFICA VARCHAR(60) NOT NULL DEFAULT 'Independiente',
 CONSTRAINT PK_DISQUERAS_CD PRIMARY KEY (ID_DISQUERA) );`,
				);
			} else {
				assert.equal(result.error, "Table 'disqueras_cd' already exists");
			}
		});

		test("crear la tabla DISCOS_COMPACTOS", async () => {
			const result = await qb
				.createTable("DISCOS_COMPACTOS", {
					secure: true,
					cols: DISCOS_COMPACTOS,
					constraints: [
						{
							name: "PK_DISCOS_COMPACTOS",
							type: "primary key",
							cols: ["ID_DISCO_COMPACTO"],
						},
						{
							name: "FK_ID_DISQUERA",
							type: "foreign key",
							cols: ["ID_DISQUERA"],
							foreignKey: {
								table: "DISQUERAS_CD",
								cols: ["ID_DISQUERA"],
								match: "full",
							},
						},
					],
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS DISCOS_COMPACTOS
( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 ID_DISQUERA INT NOT NULL,
 CONSTRAINT PK_DISCOS_COMPACTOS PRIMARY KEY (ID_DISCO_COMPACTO),
 CONSTRAINT FK_ID_DISQUERA FOREIGN KEY (ID_DISQUERA) REFERENCES DISQUERAS_CD (ID_DISQUERA) MATCH FULL );`,
				);
			} else {
				assert.equal(result.error, "Table 'discos_compactos' already exists");
			}
		});

		test("crear tabla TIPOS_DISCO_COMPACTO", async () => {
			const result = await qb
				.createTable("TIPOS_DISCO_COMPACTO", {
					secure: true,
					cols: TIPOS_DISCO_COMPACTO,
					constraints: [
						{
							name: "PK_TIPOS_DISCO_COMPACTO",
							type: "primary key",
							cols: ["ID_DISCO_COMPACTO", "ID_TIPO_MUSICA"],
						},
						{
							name: "FK_ID_DISCO_COMPACTO_01",
							type: "foreign key",
							cols: ["ID_DISCO_COMPACTO"],
							foreignKey: {
								table: "DISCOS_COMPACTOS",
								cols: ["ID_DISCO_COMPACTO"],
							},
						},
						{
							name: "FK_ID_TIPO_MUSICA",
							type: "foreign key",
							cols: ["ID_TIPO_MUSICA"],
							foreignKey: {
								table: "TIPOS_MUSICA",
								cols: ["ID_TIPO"],
							},
						},
					],
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS TIPOS_DISCO_COMPACTO
( ID_DISCO_COMPACTO INT,
 ID_TIPO_MUSICA INT,
 CONSTRAINT PK_TIPOS_DISCO_COMPACTO PRIMARY KEY (ID_DISCO_COMPACTO, ID_TIPO_MUSICA),
 CONSTRAINT FK_ID_DISCO_COMPACTO_01 FOREIGN KEY (ID_DISCO_COMPACTO) REFERENCES DISCOS_COMPACTOS (ID_DISCO_COMPACTO),
 CONSTRAINT FK_ID_TIPO_MUSICA FOREIGN KEY (ID_TIPO_MUSICA) REFERENCES TIPOS_MUSICA (ID_TIPO) );`,
				);
			} else {
				assert.equal(
					result.cause,
					"Table 'tipos_disco_compacto' already exists",
				);
			}
		});
		test("crear tabla ARTISTAS", async () => {
			const result = await qb
				.createTable("ARTISTAS", {
					secure: true,
					cols: ARTISTAS,
					constraints: [
						{
							name: "PK_ARTISTAS",
							type: "primary key",
							cols: ["ID_ARTISTA"],
						},
					],
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS ARTISTAS
( ID_ARTISTA INT,
 NOMBRE_ARTISTA VARCHAR(60) NOT NULL,
 LUGAR_DE_NACIMIENTO VARCHAR(60) NOT NULL DEFAULT 'Desconocido',
 CONSTRAINT PK_ARTISTAS PRIMARY KEY (ID_ARTISTA) );`,
				);
			} else {
				assert.equal(result.error, "Table 'artistas' already exists");
			}
		});

		test("crear tabla CDS_ARTISTA", async () => {
			const result = await qb
				.createTable("CDS_ARTISTA", {
					secure: true,
					cols: CDS_ARTISTA,
					constraints: [
						{
							name: "PK_CDS_ARTISTA",
							type: "primary key",
							cols: ["ID_ARTISTA", "ID_DISCO_COMPACTO"],
						},
						{
							name: "FK_ID_ARTISTA",
							type: "foreign Key",
							cols: ["ID_ARTISTA"],
							foreignKey: {
								table: "ARTISTAS",
								cols: ["ID_ARTISTA"],
							},
						},
						{
							name: "FK_ID_DISCO_COMPACTO_02",
							type: "foreign key",
							cols: ["ID_DISCO_COMPACTO"],
							foreignKey: {
								table: "DISCOS_COMPACTOS",
								cols: ["ID_DISCO_COMPACTO"],
							},
						},
					],
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS CDS_ARTISTA
( ID_ARTISTA INT,
 ID_DISCO_COMPACTO INT,
 CONSTRAINT PK_CDS_ARTISTA PRIMARY KEY (ID_ARTISTA, ID_DISCO_COMPACTO),
 CONSTRAINT FK_ID_ARTISTA FOREIGN KEY (ID_ARTISTA) REFERENCES ARTISTAS (ID_ARTISTA),
 CONSTRAINT FK_ID_DISCO_COMPACTO_02 FOREIGN KEY (ID_DISCO_COMPACTO) REFERENCES DISCOS_COMPACTOS (ID_DISCO_COMPACTO) );`,
				);
			} else {
				assert.equal(result.error, "Table 'cds_artista' already exists");
			}
		});

		test("Crea tabla TITULOS_CD", async () => {
			const result = await qb
				.createTable("TITULOS_CD", {
					secure: true,
					cols: TITULOS_CD,
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS TITULOS_CD
( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 EN_EXISTENCIA INT NOT NULL );`,
				);
			} else {
				assert.equal(result.error, "table 'titulos_cd' already exists");
			}
		});
	});

	describe("Alterar las tablas", () => {
		test("Añadir una columna a la tabla DISCOS_COMPACTOS", async () => {
			const result = await qb
				.alterTable("DISCOS_COMPACTOS")
				.addColumn("EN_EXISTENCIA", { type: "INT", values: ["not null"] })
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
ALTER TABLE DISCOS_COMPACTOS
ADD COLUMN EN_EXISTENCIA INT NOT NULL;`,
				);
			} else {
				assert.equal(result.error, "Duplicate column name 'EN_EXISTENCIA'");
			}
		});

		test("añade una constraint de tipo CHECK al campo EN_EXISTENCIA", async () => {
			const result = await qb
				.alterTable("DISCOS_COMPACTOS")
				.addConstraint("CK_EN_EXISTENCIA", {
					check: qb.and(qb.gt("EN_EXISTENCIA", 0), qb.lt("EN_EXISTENCIA", 50)),
				})
				.execute();

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
ALTER TABLE DISCOS_COMPACTOS
ADD CONSTRAINT CK_EN_EXISTENCIA CHECK ( (EN_EXISTENCIA > 0
AND EN_EXISTENCIA < 50) );`,
				);
			} else {
				assert.equal(
					result.error,
					"Duplicate check constraint name 'CK_EN_EXISTENCIA'.",
				);
			}
		});
	});

	describe("Crear vistas", () => {
		test("crea la vista CDS_EN_EXISTENCIA", async () => {
			const result = await qb.createView("CDS_EN_EXISTENCIA", {
				as: qb
					.select(["TITULO_CD", "EN_EXISTENCIA"])
					.from("DISCOS_COMPACTOS")
					.where(qb.gt("EN_EXISTENCIA", 10)),
				check: true,
			});

			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE VIEW CDS_EN_EXISTENCIA
AS SELECT TITULO_CD, EN_EXISTENCIA
FROM DISCOS_COMPACTOS
WHERE EN_EXISTENCIA > 10
WITH CHECK OPTION;`,
				);
			} else {
				assert.equal(result.error, "Table 'CDS_EN_EXISTENCIA' already exists");
			}
		});
		test("añade la vista EDITORES_CD", async () => {
			const result = await qb
				.createView("EDITORES_CD", {
					cols: ["TITULO_CD", "EDITOR"],
					as: qb
						.select([
							qb.col("TITULO_CD", "DISCOS_COMPACTOS"),
							qb.col("NOMBRE_DISCOGRAFICA", "DISQUERAS_CD"),
						])
						.from(["DISCOS_COMPACTOS", "DISQUERAS_CD"])
						.where(
							qb.and(
								qb.eq(
									qb.col("ID_DISQUERA", "DISCOS_COMPACTOS"),
									qb.col("ID_DISQUERA", "DISQUERAS_CD"),
								),
								qb.or(
									qb.eq(qb.col("ID_DISQUERA", "DISQUERAS_CD"), 5403),
									qb.eq(qb.col("ID_DISQUERA", "DISQUERAS_CD"), 5402),
								),
							),
						),
				})
				.execute();
			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
CREATE VIEW EDITORES_CD
( TITULO_CD, EDITOR )
AS SELECT DISCOS_COMPACTOS.TITULO_CD, DISQUERAS_CD.NOMBRE_DISCOGRAFICA
FROM DISCOS_COMPACTOS, DISQUERAS_CD
WHERE (DISCOS_COMPACTOS.ID_DISQUERA = DISQUERAS_CD.ID_DISQUERA
AND (DISQUERAS_CD.ID_DISQUERA = 5403
OR DISQUERAS_CD.ID_DISQUERA = 5402));`,
				);
			} else {
				assert.equal(result.error, "Table 'EDITORES_CD' already exists");
			}
		});

		test("volver a crear la vista EDITORES_CD ahora sin restricciones", async () => {
			const query = `SELECT DISCOS_COMPACTOS.TITULO_CD, DISQUERAS_CD.NOMBRE_COMPAÑIA
FROM DISCOS_COMPACTOS, DISQUERAS_CD
WHERE DISCOS_COMPACTOS.ID_DISQUERA = DISQUERAS_CD.ID_DISQUERA`;
			const result = await qb
				.dropView("EDITORES_CD")
				.createView("EDITORES_CD", {
					cols: ["TITULO_CD", "EDITOR"],
					as: qb
						.select([
							qb.col("TITULO_CD", "DISCOS_COMPACTOS"),
							qb.col("NOMBRE_DISCOGRAFICA", "DISQUERAS_CD"),
						])
						.from(["DISCOS_COMPACTOS", "DISQUERAS_CD"])
						.where(
							qb.eq(
								qb.col("ID_DISQUERA", "DISCOS_COMPACTOS"),
								qb.col("ID_DISQUERA", "DISQUERAS_CD"),
							),
						),
				})
				.execute();
			if (!result.error) {
				assert.equal(
					result.toString(),
					`USE INVENTARIO;
DROP VIEW EDITORES_CD;
CREATE VIEW EDITORES_CD
( TITULO_CD, EDITOR )
AS SELECT DISCOS_COMPACTOS.TITULO_CD, DISQUERAS_CD.NOMBRE_DISCOGRAFICA
FROM DISCOS_COMPACTOS, DISQUERAS_CD
WHERE DISCOS_COMPACTOS.ID_DISQUERA = DISQUERAS_CD.ID_DISQUERA;`,
				);
			} else {
				assert.equal(result.error, "");
			}
		});
	});

	describe("Roles", () => {
		test("crear un rol", async () => {
			const result = await qb.createRoles(["ADMIN", "USER"], {
				secure: true,
				host: "localhost",
			});

			if (!result.error) {
				assert.equal(
					result.toString(),
					"USE INVENTARIO;\nCREATE ROLE IF NOT EXISTS ADMIN@localhost, USER@localhost;",
				);
			} else {
				assert.equal(result.error, "");
			}
		});

		test("Gestion de roles y privilegios", async () => {
			let nuevoRol = await qb
				.createRoles("MRKT", {
					secure: true,
					host: "localhost",
				})
				.execute();

			if (!nuevoRol.error) {
				assert.equal(
					nuevoRol.toString(),
					"USE INVENTARIO;\nCREATE ROLE IF NOT EXISTS 'MRKT'@'localhost';",
				);
			} else {
				assert.equal(nuevoRol.error, "");
			}
			nuevoRol = await qb
				.createRoles("PERSONAL_VENTAS", { secure: true })
				.execute();

			if (!nuevoRol.error) {
				assert.equal(
					nuevoRol.toString(),
					"CREATE ROLE IF NOT EXISTS PERSONAL_VENTAS;",
				);
			} else {
				assert.equal(nuevoRol.error, "");
			}
		});

		test("otorga el privilegio SELECT en la vista CDS_EN_EXISTENCIA a PERSONAL_VENTAS", async () => {
			const otorga = await qb
				.grant("select", "CDS_EN_EXISTENCIA", ["PERSONAL_VENTAS"])
				.execute();

			assert.equal(
				otorga.toString(),
				"USE INVENTARIO;\nGRANT SELECT ON INVENTARIO.CDS_EN_EXISTENCIA TO 'PERSONAL_VENTAS'@'%';",
			);
		});
		test("al rol PERSONAL_VENTAS Se otorgan los privilegios SELECT, INSERT y UPDATE en la tabla DISCOS_COMPACTOS", async () => {
			/* al rol PERSONAL_VENTAS Se otorgan los privilegios SELECT, INSERT y UPDATE en la tabla DISCOS_COMPACTOS.
    Para el privilegio UPDATE se especifica la columna TITULO_CD. PERSONAL_VENTAS puede otorgar estos privilegios a otros usuarios
    */
			const otorga = await qb
				.grant(
					["SELECT", "INSERT", "UPDATE(TITULO_CD)"],
					"DISCOS_COMPACTOS",
					"PERSONAL_VENTAS",
				)
				.execute();

			assert.equal(
				otorga.toString(),
				`USE INVENTARIO;\nGRANT SELECT, INSERT, UPDATE(TITULO_CD) ON INVENTARIO.DISCOS_COMPACTOS TO 'PERSONAL_VENTAS'@'%';`,
			);
		});

		test("se otorga el rol PERSONAL_VENTAS al rol MRKT", async () => {
			const otorga = await qb
				.grantRoles("PERSONAL_VENTAS", "MRKT", {
					host: "localhost",
				})
				.execute();

			assert.equal(
				otorga.toString(),
				"USE INVENTARIO;\nGRANT PERSONAL_VENTAS TO 'MRKT'@'localhost';",
			);
		});
		test("revocar el privilegio SELECT a PERSONAL_VENTAS de la tabla CDS_EN_EXISTENCIA", async () => {
			const result = await qb
				.revoke("SELECT", "CDS_EN_EXISTENCIA", "PERSONAL_VENTAS", {
					secure: true,
					ignoreUser: true,
				})
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nREVOKE IF EXISTS SELECT ON INVENTARIO.CDS_EN_EXISTENCIA FROM 'PERSONAL_VENTAS'@'%';",
			);
		});
		test("revocan todos los privilegios al rol PERSONAL_VENTAS sobre DISCOS_COMPACTOS", async () => {
			const result = await qb
				.revoke("all", "DISCOS_COMPACTOS", "PERSONAL_VENTAS", {
					ignoreUser: true,
				})
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nREVOKE ALL ON INVENTARIO.DISCOS_COMPACTOS FROM 'PERSONAL_VENTAS'@'%' IGNORE UNKNOWN USER;",
			);
		});

		test("eliminar MRKT del PERSONAL_VENTAS", async () => {
			const result = await qb
				.revokeRoles("PERSONAL_VENTAS", "MRKT", {
					ignoreUser: true,
					host: "localhost",
				})
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nREVOKE PERSONAL_VENTAS FROM 'MRKT'@'localhost' IGNORE UNKNOWN USER;",
			);
		});

		test("eliminar el rol MRKT", async () => {
			// Se puede usar un objeto {name,host} si el rol o usuario tiene un host distinto al host por defecto
			// se puede utilizar la propiedad options.host como host por defecto distinto de '%'
			const result = await qb
				.dropRoles(
					{ name: "MRKT", host: "localhost" },
					{
						secure: true,
						host: "%",
					},
				)
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nDROP ROLE IF EXISTS 'MRKT'@'localhost';",
			);
		});

		test("eliminar el rol PERSONAL_VENTAS", async () => {
			const result = await qb
				.dropRoles(
					{ name: "PERSONAL_VENTAS" },
					{
						secure: true,
					},
				)
				.execute();

			assert.equal(
				result.toString(),
				"USE INVENTARIO;\nDROP ROLE IF EXISTS 'PERSONAL_VENTAS'@'%';",
			);
		});
	});

	describe("Manejo de datos", async () => {
		test("Insertar datos", { only: true }, async () => {
			const result = await qb
				.insert("DISQUERAS_CD", [], [837, "DRG Records"])
				.insert("DISCOS_COMPACTOS", [], [116, "Ann Hampton Callaway", 837, 14])
				.insert(
					"DISCOS_COMPACTOS",
					["ID_DISCO_COMPACTO", "TITULO_CD", "ID_DISQUERA", "EN_EXISTENCIA"],
					[117, "Rhythm Country and Blues", 837, 21],
				)
				.execute();

			if (result) {
				console.log("Status:%o\n", result.error ? result.error : "OK");
				const { columns, rows } = result.result;
				tableFormat(columns, rows, result.queryJoin());
			}

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
INSERT INTO DISQUERAS_CD
VALUES ( 837, 'DRG Records' );
INSERT INTO DISCOS_COMPACTOS
VALUES ( 116, 'Ann Hampton Callaway', 837, 14 );
INSERT INTO DISCOS_COMPACTOS
( ID_DISCO_COMPACTO, TITULO_CD, ID_DISQUERA, EN_EXISTENCIA )
VALUES ( 117, 'Rhythm Country and Blues', 837, 21 );`,
			);
		});

		test("Actualiza datos", { only: false }, async () => {
			const result = await qb
				.update("DISCOS_COMPACTOS", {
					ID_DISQUERA: qb
						.select("ID_DISQUERA")
						.from("DISQUERAS_CD")
						.where(qb.eq("NOMBRE_DISCOGRAFICA", "DRG Records")),
				})
				.where("ID_DISCO_COMPACTO = 116")
				.execute();

			console.log(
				"Query:\n%s \nStatus:\n%o\nResultado %o\n",
				result.queryJoin(),
				result.error ? result.error : "OK",
				result.result,
			);

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
UPDATE DISCOS_COMPACTOS
SET ID_DISQUERA =
( SELECT ID_DISQUERA
FROM DISQUERAS_CD
WHERE NOMBRE_DISCOGRAFICA = 'DRG Records' )
WHERE ID_DISCO_COMPACTO = 116;`,
			);
		});

		test("leer datos de la tabla DISCOS_COMPACTO", { only: true }, async () => {
			const result = await qb
				.select("*")
				.from("DISCOS_COMPACTOS")
				.where(
					qb.or(
						qb.eq("ID_DISCO_COMPACTO", 116),
						qb.eq("ID_DISCO_COMPACTO", 117),
					),
				)
				.execute();

			console.log("Status:\n%o", result.error ? result.error : "OK");
			if (result.result) {
				const { columns, rows } = result.result;
				tableFormat(columns, rows, result.queryJoin());
			}

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
SELECT *
FROM DISCOS_COMPACTOS
WHERE (ID_DISCO_COMPACTO = 116
OR ID_DISCO_COMPACTO = 117);`,
			);
		});

		test("borrar registros", { only: true }, async () => {
			const result = await qb
				.delete("DISCOS_COMPACTOS")
				.where(
					qb.or(
						qb.eq("ID_DISCO_COMPACTO", 116),
						qb.eq("ID_DISCO_COMPACTO", 117),
					),
				)
				.delete("DISQUERAS_CD")
				.where(qb.eq("ID_DISQUERA", 837))
				.execute();

			if (result) {
				console.log("Status:%o\n", result.error ? result.error : "OK");
				const { columns, rows } = result.result;
				tableFormat(columns, rows, result.queryJoin());
			}

			assert.equal(
				result.toString(),
				`USE INVENTARIO;
DELETE FROM DISCOS_COMPACTOS
WHERE (ID_DISCO_COMPACTO = 116
OR ID_DISCO_COMPACTO = 117);
DELETE FROM DISQUERAS_CD
WHERE ID_DISQUERA = 837;`,
			);
		});
	});
});
