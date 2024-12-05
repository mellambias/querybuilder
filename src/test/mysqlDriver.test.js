import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../querybuilder.js";
import MySQL from "../sql/MySQL.js";
import { config } from "../../config.js";
import { showResults } from "./utilsForTest/resultUtils.js";

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
			const result = await qb.createDatabase("testing").execute();
			showResults(result);
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
			.dropTable("TABLE_TEST", { secure: true })
			.createTable("TABLE_TEST", { cols: { ID: "INT" } })
			.execute();
		showResults(result);

		assert.equal(
			await result.toString(),
			"USE testing;\nDROP TABLE IF EXIST TABLE_TEST;\nCREATE TABLE TABLE_TEST\n( ID INT );",
		);
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
		showResults(result);
		if (!result.error) {
			assert.equal(
				await result.toString(),
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
		showResults(result);

		assert.equal(
			await result.toString(),
			`USE testing;
CREATE TABLE IF NOT EXISTS table_test2
( ID_ARTISTA INT,
 NOMBRE_ARTISTA CHAR(60) DEFAULT 'artista',
 FDN_ARTISTA DATE,
 POSTER_EN_EXISTENCIA TINYINT );`,
		);
	});

	test("Crear un tipo definido por el usuario", async () => {
		const result = await qb
			.use("testing")
			.createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
			.execute();

		if (!result.error) {
			assert.equal(await result.toString(), "USE testing;");
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
				await result.toString(),
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
			await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
	describe("llena las tablas inventario", async () => {
		test("TIPOS_MUSICA", async () => {
			const table = "TIPOS_MUSICA";
			const rows = [
				[11, "Blues"],
				[12, "Jazz"],
				[13, "Pop"],
				[14, "Rock"],
				[15, "Classical"],
				[16, "New Age"],
				[17, "Country"],
				[18, "Folk"],
				[19, "International"],
				[20, "Soundtracks"],
				[21, "Christmas"],
			];
			const result = await qb.insert(table, [], rows).execute();
			showResults(result);
		});
		//fin
		test("DISQUERAS_CD", async () => {
			const disqueras_cd = [
				[827, "Private Music"],
				[828, "Reprise Records"],
				[829, "Asylum Records"],
				[830, "Windham Hill Records"],
				[831, "Geffen"],
				[832, "MCA Records"],
				[833, "Decca Record Company"],
				[834, "CBS Records"],
				[835, "Capitol Records"],
				[836, "Sarabande Records"],
			];
			const result = await qb
				.insert("DISQUERAS_CD", [], disqueras_cd)
				.execute();
			showResults(result);
		});
		//fin
		test("DISCOS_COMPACTOS", async () => {
			const discos_compactos = [
				[101, "Famous Blue Raincoat", 827, 13],
				[102, "Blue", 828, 42],
				[103, "Court and Spark", 829, 22],
				[104, "Past Light", 830, 17],
				[105, "Kojiki", 831, 6],
				[106, "That Christmas Feeling", 832, 8],
				[107, "Patsy Cline: 12 Greatest Hits", 832, 32],
				[108, "Carreras Domingo Pavarotti in Concert", 833, 27],
				[109, "After the Rain: The Soft Sounds of Erik Satie", 833, 21],
				[110, "Out of Africa", 832, 29],
				[111, "Leonard Cohen The Best Of", 834, 12],
				[112, "Fundamental", 835, 34],
				[113, "Bob Seger and the Silver Bullet Band Greatest Hits", 835, 16],
				[114, "Blues on the Bayou", 832, 27],
				[115, "Orlando", 836, 5],
			];
			const result = await qb
				.insert("DISCOS_COMPACTOS", [], discos_compactos)
				.execute();
			showResults(result);
		});
		//fin
		test("TIPOS_DISCO_COMPACTO", async () => {
			const table = "TIPOS_DISCO_COMPACTO";
			const rows = [
				[101, 18],
				[101, 13],
				[102, 11],
				[102, 18],
				[102, 13],
				[103, 18],
				[103, 13],
				[104, 16],
				[105, 16],
				[106, 21],
				[107, 13],
				[107, 17],
				[108, 13],
				[108, 15],
				[109, 15],
				[110, 20],
				[111, 13],
				[111, 18],
				[112, 11],
				[112, 13],
				[113, 13],
				[113, 14],
				[114, 11],
				[115, 20],
			];
			const result = await qb.insert(table, [], rows).execute();
			showResults(result);
		});
		test("ARTISTAS", async () => {
			const table = "ARTISTAS";
			const rows = [
				[2001, "Jennifer Warnes", "Seattle, Washington, Estados Unidos"],
				[2002, "Joni Mitchell", "Fort MacLeod, Alberta, Canadá"],
				[2003, "William Ackerman", "Alemania"],
				[2004, "Kitaro", "Toyohashi, Japón"],
				[2005, "Bing Crosby", "Tacoma, Washington, Estados Unidos"],
				[2006, "Patsy Cline", "Winchester, Virginia, Estados Unidos"],
				[2007, "Jose Carreras", "Barcelona, España"],
				[2008, "Luciano Pavarotti", "Modena, Italia"],
				[2009, "Placido Domingo", "Madrid, España"],
				[2010, "Pascal Roge", "Desconocido"],
				[2011, "John Barry", "Desconocido"],
				[2012, "Leonard Cohen", "Montreal, Quebec, Canadá"],
				[2013, "Bonnie Raitt", "Burbank, California, Estados Unidos"],
				[2014, "Bob Seger", "Dearborn, Michigan, Estados Unidos"],
				[2015, "Silver Bullet Band", "No aplica"],
				[2016, "B.B. King", "Indianola, Mississippi, Estados Unidos"],
				[2017, "David Motion", "Desconocido"],
				[2018, "Sally Potter", "Desconocido"],
			];
			const result = await qb.insert(table, [], rows).execute();
			showResults(result);
		});
		//fin
		test("CDS_ARTISTA", async () => {
			const table = "CDS_ARTISTA";
			const rows = [
				[2001, 101],
				[2002, 102],
				[2002, 103],
				[2003, 104],
				[2004, 105],
				[2005, 106],
				[2006, 107],
				[2007, 108],
				[2008, 108],
				[2009, 108],
				[2010, 109],
				[2011, 110],
				[2012, 111],
				[2013, 112],
				[2014, 113],
				[2015, 113],
				[2016, 114],
				[2017, 115],
				[2018, 115],
			];
			const result = await qb.insert(table, [], rows).execute();
			showResults(result);
		});
		//fin

		//fin

		//fin
		// test("", async () => {
		// 	const table = "";
		// 	const rows = [];
		// 	const result = await qb.insert(table, [], rows).execute();
		// 	showResults(result);
		// });
		//fin
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
					await result.toString(),
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
				await result.toString(),
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
				await result.toString(),
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
				await result.toString(),
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
				await result.toString(),
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
				await result.toString(),
				"USE INVENTARIO;\nDROP ROLE IF EXISTS 'PERSONAL_VENTAS'@'%';",
			);
		});
	});

	describe("Manejo de datos", async () => {
		test("Insertar datos", async () => {
			const result = await qb
				.insert("DISQUERAS_CD", [], [837, "DRG Records"])
				.insert("DISCOS_COMPACTOS", [], [116, "Ann Hampton Callaway", 837, 14])
				.insert(
					"DISCOS_COMPACTOS",
					["ID_DISCO_COMPACTO", "TITULO_CD", "ID_DISQUERA", "EN_EXISTENCIA"],
					[117, "Rhythm Country and Blues", 837, 21],
				)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
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

		test("Actualiza datos", async () => {
			const result = await qb
				.update("DISCOS_COMPACTOS", {
					ID_DISQUERA: qb
						.select("ID_DISQUERA")
						.from("DISQUERAS_CD")
						.where(qb.eq("NOMBRE_DISCOGRAFICA", "DRG Records")),
				})
				.where("ID_DISCO_COMPACTO = 116")
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
UPDATE DISCOS_COMPACTOS
SET ID_DISQUERA =
( SELECT ID_DISQUERA
FROM DISQUERAS_CD
WHERE NOMBRE_DISCOGRAFICA = 'DRG Records' )
WHERE ID_DISCO_COMPACTO = 116;`,
			);
		});

		test("leer datos de la tabla DISCOS_COMPACTO", async () => {
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

			showResults(result);

			assert(
				await result.toString(),
				`USE INVENTARIO;
SELECT *
FROM DISCOS_COMPACTOS
WHERE (ID_DISCO_COMPACTO = 116
OR ID_DISCO_COMPACTO = 117);`,
			);
		});

		test("borrar registros", async () => {
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

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
DELETE FROM DISCOS_COMPACTOS
WHERE (ID_DISCO_COMPACTO = 116
OR ID_DISCO_COMPACTO = 117);
DELETE FROM DISQUERAS_CD
WHERE ID_DISQUERA = 837;`,
			);
		});
	});

	describe("capitulo 8", async () => {
		test("crea la tabla INVENTARIO_CD.", async () => {
			const inventario_cd = {
				NOMBRE_CD: { type: "varchar(60)", values: ["NOT NULL"] },
				TIPO_MUSICA: "VARCHAR(15)",
				EDITOR: {
					type: "varchar(50)",
					default: "Independiente",
					values: ["not null"],
				},
				EN_EXISTENCIA: { type: "int", values: ["not null"] },
			};

			const result = await qb
				.createTable("INVENTARIO_CD", {
					cols: inventario_cd,
					secure: true,
				})
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
CREATE TABLE IF NOT EXISTS INVENTARIO_CD
( NOMBRE_CD VARCHAR(60) NOT NULL,
 TIPO_MUSICA VARCHAR(15),
 EDITOR VARCHAR(50) NOT NULL DEFAULT 'Independiente',
 EN_EXISTENCIA INT NOT NULL );`,
			);
		});
		test("inserta un registro o row", async () => {
			const result = await qb
				.insert(
					"INVENTARIO_CD",
					[],
					["Patsy Cline: 12 Greatest Hits", "Country", "MCA Records", 32],
				)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
INSERT INTO INVENTARIO_CD
VALUES ( 'Patsy Cline: 12 Greatest Hits', 'Country', 'MCA Records', 32 );`,
			);
		});

		test("Insertar datos en una tabla especificando columnas", async () => {
			const result = await qb
				.insert(
					"INVENTARIO_CD",
					["NOMBRE_CD", "EDITOR", "EN_EXISTENCIA"],
					["Fundamental", "Capitol Records", 34],
				)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`INSERT INTO INVENTARIO_CD\n( NOMBRE_CD, EDITOR, EN_EXISTENCIA )
VALUES ( 'Fundamental', 'Capitol Records', 34 );`,
			);
		});

		test("Insertar datos en una tabla usando datos de otra tabla", async () => {
			const result = await qb
				.createTable("INVENTARIO_CD_2", {
					cols: {
						NOMBRE_CD_2: { type: "varchar(60)", values: ["not null"] },
						EN_EXISTENCIA_2: { type: "int", values: ["not null"] },
					},
				})
				.insert(
					"INVENTARIO_CD_2",
					[],
					qb.select(["NOMBRE_CD", "EN_EXISTENCIA"]).from("INVENTARIO_CD"),
				)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
CREATE TABLE INVENTARIO_CD_2
( NOMBRE_CD_2 VARCHAR(60) NOT NULL,
 EN_EXISTENCIA_2 INT NOT NULL );
INSERT INTO INVENTARIO_CD_2
SELECT NOMBRE_CD, EN_EXISTENCIA
FROM INVENTARIO_CD;`,
			);
		});

		test("Insertar varias filas de datos en una tabla", async () => {
			const result = await qb
				.insert(
					"DISQUERAS_CD",
					[],
					[
						[827, "Private Music"],
						[828, "Reprise Records"],
						[829, "Asylum Records"],
						[830, "Windham Hill Records"],
					],
				)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
INSERT INTO DISQUERAS_CD
VALUES
(827, 'Private Music'),
(828, 'Reprise Records'),
(829, 'Asylum Records'),
(830, 'Windham Hill Records');`,
			);
		});

		test("Actualizar el valor de una columna", async () => {
			const result = await qb
				.update("INVENTARIO_CD", { EN_EXISTENCIA: 27 })
				.execute();
			showResults(result);
			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 27;`,
			);
		});

		test("añadir columna cantidad a inventario_cd", async () => {
			const result = await qb
				.alterTable("INVENTARIO_CD")
				.addColumn("CANTIDAD", "INT")
				.execute();
			showResults(result);
			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
ALTER TABLE INVENTARIO_CD
ADD COLUMN CANTIDAD INT;`,
			);
		});

		test("Actualizar el valor de varias columnas", async () => {
			const result = await qb
				.update("INVENTARIO_CD", {
					EN_EXISTENCIA: "27",
					CANTIDAD: 10,
				})
				.execute();
			showResults(result);
			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = '27',
CANTIDAD = 10;`,
			);
		});

		test("Actualizar el valor de una columna solo de algunas filas usando where", async () => {
			const result = await qb
				.update("INVENTARIO_CD", { EN_EXISTENCIA: 37 })
				.where([qb.eq("NOMBRE_CD", "Fundamental")])
				.execute();

			showResults(result);

			assert(
				await result.toString(),
				`USE INVENTARIO;
UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 37
WHERE NOMBRE_CD = 'Fundamental';`,
			);
		});

		test("Actualizar una columna usando como valor el resultado devuelto por un select", async () => {
			const result = await qb
				.update("INVENTARIO_CD_2", {
					EN_EXISTENCIA_2: qb
						.select(qb.avg("EN_EXISTENCIA"))
						.from("INVENTARIO_CD"),
				})
				.where([qb.eq("NOMBRE_CD_2", "Fundamental")])
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
UPDATE INVENTARIO_CD_2
SET EN_EXISTENCIA_2 =
( SELECT AVG(EN_EXISTENCIA)
FROM INVENTARIO_CD )
WHERE NOMBRE_CD_2 = 'Fundamental';`,
			);
		});

		test("Eliminar todas las filas de una tabla con DELETE FROM", async () => {
			const result = await qb.delete("INVENTARIO_CD_2").execute();

			showResults(result);
			assert.equal(
				await result.toString(),
				"USE INVENTARIO;\nDELETE FROM INVENTARIO_CD_2;",
			);
		});

		test("Eliminar algunas filas de una tabla con DELETE y where", async () => {
			const result = await qb
				.delete("INVENTARIO_CD")
				.where(qb.eq("TIPO_MUSICA", "Country"))
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
DELETE FROM INVENTARIO_CD
WHERE TIPO_MUSICA = 'Country';`,
			);
		});
	});

	describe("Uso de predicados capitulo 9", async () => {
		test("se consultará la tabla TIPOS_MUSICA para arrojar los nombres de aquellas filas cuyo valor ID_TIPO sea igual a 11 o 12", async () => {
			const result = await qb
				.select(["ID_TIPO", "NOMBRE_TIPO"])
				.from("TIPOS_MUSICA")
				.where(qb.or(qb.eq("ID_TIPO", 11), qb.eq("ID_TIPO", 12)))
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
SELECT ID_TIPO, NOMBRE_TIPO
FROM TIPOS_MUSICA
WHERE (ID_TIPO = 11
OR ID_TIPO = 12);`,
			);
		});
		test("se consultará la tabla ARTISTAS para buscar artistas diferentes a Patsy Cline y Bing Crosby", async () => {
			const result = await qb
				.select(["NOMBRE_ARTISTA", "LUGAR_DE_NACIMIENTO"])
				.from("ARTISTAS")
				.where(
					qb.and(
						qb.ne("NOMBRE_ARTISTA", "Patsy Cline"),
						qb.ne("NOMBRE_ARTISTA", "Bing Crosby"),
					),
				)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
SELECT NOMBRE_ARTISTA, LUGAR_DE_NACIMIENTO
FROM ARTISTAS
WHERE (NOMBRE_ARTISTA <> 'Patsy Cline'
AND NOMBRE_ARTISTA <> 'Bing Crosby');`,
			);
		});
		test("combinar un predicado LIKE con otro predicado LIKE", async () => {
			const result = await qb
				.select("*")
				.from("DISCOS_COMPACTOS")
				.where(
					qb.and(
						qb.notLike("TITULO_CD", "%Christmas%"),
						qb.like("TITULO_CD", "%Blue%"),
					),
				)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
SELECT *
FROM DISCOS_COMPACTOS
WHERE (TITULO_CD NOT LIKE ('%Christmas%')
AND TITULO_CD LIKE ('%Blue%'));`,
			);
		});

		test("creamos la tabla CDS_A_LA_MANO y añadimos registros", async () => {
			const cds_a_la_mano = {
				TITULO_CD: "varchar(60)",
				DERECHOSDEAUTOR: "INT",
				PRECIO_MENUDEO: "NUMERIC(5,2)",
				INVENTARIO: "INT",
			};
			const cd_rows = [
				["Famous Blue Raincoat", 1991, 16.99, 6],
				["Blue", 1971, 14.99, 26],
				["Past Light", 1983, 15.99, 18],
				["Kojiki", 1990, 15.99, 2],
				["That Christmas Feeling", 1993, 10.99, 5],
				["Patsy Cline: 12 Greatest Hits", 1988, 16.99, 3],
				["Court and Spark", 1974, 14.99, 25],
			];

			const result = await qb
				.createTable("CDS_A_LA_MANO", { cols: cds_a_la_mano })
				.insert("CDS_A_LA_MANO", [], cd_rows)
				.execute();

			showResults(result);

			assert.equal(
				await result.toString(),
				`USE INVENTARIO;
CREATE TABLE CDS_A_LA_MANO\n( TITULO_CD VARCHAR(60),
 DERECHOSDEAUTOR INT,
 PRECIO_MENUDEO DECIMAL(5,2),
 INVENTARIO INT );
INSERT INTO CDS_A_LA_MANO
VALUES
('Famous Blue Raincoat', 1991, 16.99, 6),
('Blue', 1971, 14.99, 26),
('Past Light', 1983, 15.99, 18),
('Kojiki', 1990, 15.99, 2),
('That Christmas Feeling', 1993, 10.99, 5),
('Patsy Cline: 12 Greatest Hits', 1988, 16.99, 3),
('Court and Spark', 1974, 14.99, 25);`,
			);
		});

		test("operador Igual a para comparar los valores en la columna TITULO_CD con uno de los títulos de CD", async () => {
			const query = `SELECT TITULO_CD, DERECHOSDEAUTOR
FROM CDS_A_LA_MANO
WHERE TITULO_CD = 'Past Light';`;

			const result = await qb
				.select(["TITULO_CD", "DERECHOSDEAUTOR"])
				.from("CDS_A_LA_MANO")
				.where(qb.eq("TITULO_CD", "Past Light"))
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		test("operador distinto a para comparar los valores en la columna TITULO_CD con uno de los títulos de CD", async () => {
			const query = `SELECT TITULO_CD, DERECHOSDEAUTOR
FROM CDS_A_LA_MANO
WHERE TITULO_CD <> 'Past Light';`;

			const result = await qb
				.select(["TITULO_CD", "DERECHOSDEAUTOR"])
				.from("CDS_A_LA_MANO")
				.where(qb.ne("TITULO_CD", "Past Light"))
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		test("operador Menor que y al operador Mayor que", async () => {
			const query = `SELECT TITULO_CD, INVENTARIO
FROM CDS_A_LA_MANO
WHERE (INVENTARIO > 2
AND INVENTARIO < 25
AND  PRECIO_MENUDEO <> 16.99);`;

			const result = await qb
				.select(["TITULO_CD", "INVENTARIO"])
				.from("CDS_A_LA_MANO")
				.where(
					qb.and(
						qb.gt("INVENTARIO", 2),
						qb.lt("INVENTARIO", 25),
						qb.ne(" PRECIO_MENUDEO", 16.99),
					),
				)
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		test("Menor que o igual a y Mayor que o igual a.", async () => {
			const query = `SELECT TITULO_CD, DERECHOSDEAUTOR
FROM CDS_A_LA_MANO
WHERE (DERECHOSDEAUTOR >= 1971
AND DERECHOSDEAUTOR <= 1989);`;

			const result = await qb
				.select(["TITULO_CD", "DERECHOSDEAUTOR"])
				.from("CDS_A_LA_MANO")
				.where(
					qb.and(
						qb.gte("DERECHOSDEAUTOR", 1971),
						qb.lte("DERECHOSDEAUTOR", 1989),
					),
				)
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});

		test("combinar dos o más predicados para formar una condición de búsqueda", async () => {
			const query = `UPDATE CDS_A_LA_MANO
SET INVENTARIO = 3
WHERE (TITULO_CD = 'That Christmas Feeling'
AND DERECHOSDEAUTOR = 1993);`;

			const result = await qb
				.update("CDS_A_LA_MANO", { INVENTARIO: 3 })
				.where(
					qb.and(
						qb.eq("TITULO_CD", "That Christmas Feeling"),
						qb.eq("DERECHOSDEAUTOR", 1993),
					),
				)
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});

		test("especifica un rango entre 14 y 16", async () => {
			const query = `SELECT TITULO_CD, PRECIO_MENUDEO
FROM CDS_A_LA_MANO
WHERE (PRECIO_MENUDEO BETWEEN 14 AND 16
AND INVENTARIO > 10);`;

			const result = await qb
				.select(["TITULO_CD", "PRECIO_MENUDEO"])
				.from("CDS_A_LA_MANO")
				.where(
					qb.and(qb.between("PRECIO_MENUDEO", 14, 16), qb.gt("INVENTARIO", 10)),
				)
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});

		test("excluye un rango entre 14 y 16", async () => {
			const query = `SELECT TITULO_CD, PRECIO_MENUDEO
FROM CDS_A_LA_MANO
WHERE PRECIO_MENUDEO NOT BETWEEN 14 AND 16;`;

			const result = await qb
				.select(["TITULO_CD", "PRECIO_MENUDEO"])
				.from("CDS_A_LA_MANO")
				.where(qb.notBetween("PRECIO_MENUDEO", 14, 16))
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});

		test("arroja filas con un valor nulo", async () => {
			const query = `SELECT *
FROM ARTISTAS
WHERE LUGAR_DE_NACIMIENTO IS NULL;`;

			const result = await qb
				.select("*")
				.from("ARTISTAS")
				.where(qb.isNull("LUGAR_DE_NACIMIENTO"))
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("arroja filas con un valor no nulo", async () => {
			const query = `SELECT *
FROM ARTISTAS
WHERE LUGAR_DE_NACIMIENTO IS NOT NULL;`;

			const result = await qb
				.select("*")
				.from("ARTISTAS")
				.where(qb.isNotNull("LUGAR_DE_NACIMIENTO"))
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("encontrar cualquier CD que no contenga la palabra Christmas y si la palabra Blue en el título", async () => {
			const query = `SELECT *
FROM DISCOS_COMPACTOS
WHERE (TITULO_CD NOT LIKE ('%Christmas%')
AND TITULO_CD LIKE ('%Blue%'));`;

			const result = await qb
				.select("*")
				.from("DISCOS_COMPACTOS")
				.where(
					qb.and(
						qb.notLike("TITULO_CD", "%Christmas%"),
						qb.like("TITULO_CD", "%Blue%"),
					),
				)
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("Crea las tablas MENUDEO_CD y REBAJA_CD", async () => {
			const menudeo_cd = {
				NOMBRE_CD: "VARCHAR(60)",
				MENUDEO: "NUMERIC(5,2)",
				EN_EXISTENCIA: "INT",
			};
			const rebaja_cd = {
				TITULO: "VARCHAR(60)",
				VENTA: "NUMERIC(5,2)",
			};
			const menudeo_cd_rows = [
				["Famous Blue Raincoat", 16.99, 5],
				["Blue", 14.99, 10],
				["Court and Spark", 14.99, 12],
				["Past Light", 15.99, 11],
				["Kojiki", 15.99, 4],
				["That Christmas Feeling", 10.99, 8],
				["Patsy Cline: 12 Greatest Hits", 16.99, 14],
			];
			const rebaja_cd_rows = [
				["Famous Blue Raincoat", 14.99],
				["Blue", 12.99],
				["Court and Spark", 14.99],
				["Past Light", 14.99],
				["Kojiki", 13.99],
				["That Christmas Feeling", 10.99],
				["Patsy Cline: 12 Greatest Hits", 16.99],
			];
			const query = `CREATE TABLE IF NOT EXISTS MENUDEO_CD
( NOMBRE_CD VARCHAR(60),
 MENUDEO DECIMAL(5,2),
 EN_EXISTENCIA INT );
CREATE TABLE IF NOT EXISTS REBAJA_CD
( TITULO VARCHAR(60),
 VENTA DECIMAL(5,2) );
INSERT INTO MENUDEO_CD
VALUES
('Famous Blue Raincoat', 16.99, 5),
('Blue', 14.99, 10),
('Court and Spark', 14.99, 12),
('Past Light', 15.99, 11),
('Kojiki', 15.99, 4),
('That Christmas Feeling', 10.99, 8),
('Patsy Cline: 12 Greatest Hits', 16.99, 14);
INSERT INTO REBAJA_CD
VALUES
('Famous Blue Raincoat', 14.99),
('Blue', 12.99),
('Court and Spark', 14.99),
('Past Light', 14.99),
('Kojiki', 13.99),
('That Christmas Feeling', 10.99),
('Patsy Cline: 12 Greatest Hits', 16.99);`;

			const result = await qb
				.createTable("MENUDEO_CD", { secure: true, cols: menudeo_cd })
				.createTable("REBAJA_CD", { secure: true, cols: rebaja_cd })
				.insert("MENUDEO_CD", [], menudeo_cd_rows)
				.insert("REBAJA_CD", [], rebaja_cd_rows)
				.execute();

			showResults(result);

			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		/**
		 * Los valores RETAIL deberán ser de filas que tengan un valor EN_EXISTENCIA mayor a 9. En
otras palabras, la consulta deberá arrojar solamente aquellos CD cuyo precio rebajado (VENTA)
sea menor que algun precio de lista (MENUDEO) en aquellos CD que haya una existencia
mayor a nueve.
		 */
		test("uso de ANY", async () => {
			const query = `SELECT TITULO, VENTA
FROM REBAJA_CD
WHERE VENTA < ANY ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`;

			const result = await qb
				.select(["TITULO", "VENTA"])
				.from("REBAJA_CD")
				.where(
					qb.lt(
						"VENTA",
						qb.any(
							qb
								.select("MENUDEO")
								.from("MENUDEO_CD")
								.where(qb.gt("EN_EXISTENCIA", 9)),
						),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("uso de SOME", async () => {
			const query = `SELECT TITULO, VENTA
FROM REBAJA_CD
WHERE VENTA < SOME ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`;

			const result = await qb
				.select(["TITULO", "VENTA"])
				.from("REBAJA_CD")
				.where(
					qb.lt(
						"VENTA",
						qb.some(
							qb
								.select("MENUDEO")
								.from("MENUDEO_CD")
								.where(qb.gt("EN_EXISTENCIA", 9)),
						),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("uso de ALL", async () => {
			const query = `SELECT TITULO, VENTA
FROM REBAJA_CD
WHERE VENTA < ALL ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`;

			const result = await qb
				.select(["TITULO", "VENTA"])
				.from("REBAJA_CD")
				.where(
					qb.lt(
						"VENTA",
						qb.all(
							qb
								.select("MENUDEO")
								.from("MENUDEO_CD")
								.where(qb.gt("EN_EXISTENCIA", 9)),
						),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
	});

	describe("uso de funciones SET capitulo 10", async () => {
		/**
		 * Cada vez que se incluya una función set en una instrucción SQL, cada argumento en la lista
		 * SELECT deberá ser una función set o estar incluido en un grupo
		 */

		test("crea tabla CDS_VENDIDOS", async () => {
			const cdsVendidos = {
				NOMBRE_ARTISTA: "VARCHAR(60)",
				NOMBRE_CD: "VARCHAR(60)",
				VENDIDOS: "INT",
			};
			const cdsVendidosRows = [
				["Jennifer Warnes", "Famous Blue Raincoat", 23],
				["Joni Mitchell", "Blue", 45],
				["Joni Mitchell", "Court and Spark", 34],
				["William Ackerman", "Past Light", 12],
				["Bing Crosby", "That Christmas Feeling", 34],
				["Patsy Cline", "Patsy Cline: 12 Greatest Hits", 54],
				["John Barry", "Out of Africa", 23],
				["Leonard Cohen", "Leonard Cohen The Best of", 20],
				["Bonnie Raitt", "Fundamental", 29],
				["B.B. King", "Blues on the Bayou", 18],
			];

			const query = `CREATE TABLE IF NOT EXISTS CDS_VENDIDOS
( NOMBRE_ARTISTA VARCHAR(60),
 NOMBRE_CD VARCHAR(60),
 VENDIDOS INT );
INSERT INTO CDS_VENDIDOS
VALUES
('Jennifer Warnes', 'Famous Blue Raincoat', 23),
('Joni Mitchell', 'Blue', 45),
('Joni Mitchell', 'Court and Spark', 34),
('William Ackerman', 'Past Light', 12),
('Bing Crosby', 'That Christmas Feeling', 34),
('Patsy Cline', 'Patsy Cline: 12 Greatest Hits', 54),
('John Barry', 'Out of Africa', 23),
('Leonard Cohen', 'Leonard Cohen The Best of', 20),
('Bonnie Raitt', 'Fundamental', 29),
('B.B. King', 'Blues on the Bayou', 18);`;

			const result = await qb
				.createTable("CDS_VENDIDOS", { cols: cdsVendidos, secure: true })
				.insert("CDS_VENDIDOS", [], cdsVendidosRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("contar registros", async () => {
			const query = `SELECT COUNT(*) AS FILAS_TOTALES
FROM CDS_VENDIDOS;`;

			const result = await qb
				.select(qb.count("*", "FILAS_TOTALES"))
				.from("CDS_VENDIDOS")
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("contar valores en una columna", async () => {
			const query = `SELECT COUNT(NOMBRE_ARTISTA) AS TOTAL_DE_ARTISTAS
FROM CDS_VENDIDOS
WHERE VENDIDOS > 20;`;

			const result = await qb
				.select(qb.count("NOMBRE_ARTISTA", "TOTAL_DE_ARTISTAS"))
				.from("CDS_VENDIDOS")
				.where(qb.gt("VENDIDOS", 20))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("contar valores unicos en una columna", async () => {
			const query = `SELECT COUNT(DISTINCT NOMBRE_ARTISTA) AS TOTAL_DE_ARTISTAS
FROM CDS_VENDIDOS
WHERE VENDIDOS > 20;`;

			const result = await qb
				.select(qb.count(qb.distinct("NOMBRE_ARTISTA"), "TOTAL_DE_ARTISTAS"))
				.from("CDS_VENDIDOS")
				.where(qb.gt("VENDIDOS", 20))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test

		test("el valor mas alto para una columna", async () => {
			const query = `SELECT NOMBRE_ARTISTA, NOMBRE_CD, VENDIDOS
FROM CDS_VENDIDOS
WHERE VENDIDOS = ( SELECT MAX(VENDIDOS)
FROM CDS_VENDIDOS );`;

			const result = await qb
				.select(["NOMBRE_ARTISTA", "NOMBRE_CD", "VENDIDOS"])
				.from("CDS_VENDIDOS")
				.where(
					qb.eq("VENDIDOS", qb.select(qb.max("VENDIDOS")).from("CDS_VENDIDOS")),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("el valor mas alto para una columna usando agrupacion", async () => {
			const query = `SELECT NOMBRE_ARTISTA, MAX(VENDIDOS) AS MAX_VENDIDOS
FROM CDS_VENDIDOS
WHERE VENDIDOS > 30
GROUP BY NOMBRE_ARTISTA;`;

			const result = await qb
				.select(["NOMBRE_ARTISTA", qb.max("VENDIDOS", "MAX_VENDIDOS")])
				.from("CDS_VENDIDOS")
				.where(qb.gt("VENDIDOS", 30))
				.groupBy("NOMBRE_ARTISTA")
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("suma de valores de una columna usando grupos", async () => {
			const query = `SELECT NOMBRE_ARTISTA, SUM(VENDIDOS) AS TOTAL_VENDIDOS
FROM CDS_VENDIDOS
WHERE VENDIDOS > 30
GROUP BY NOMBRE_ARTISTA;`;

			const result = await qb
				.select(["NOMBRE_ARTISTA", qb.sum("VENDIDOS", "TOTAL_VENDIDOS")])
				.from("CDS_VENDIDOS")
				.where(qb.gt("VENDIDOS", 30))
				.groupBy("NOMBRE_ARTISTA")
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("promedio de valores de una columna usando grupos", async () => {
			const query = `SELECT NOMBRE_ARTISTA, AVG(VENDIDOS) AS PROM_VENDIDOS
FROM CDS_VENDIDOS
WHERE VENDIDOS > 30
GROUP BY NOMBRE_ARTISTA;`;

			const result = await qb
				.select(["NOMBRE_ARTISTA", qb.avg("VENDIDOS", "PROM_VENDIDOS")])
				.from("CDS_VENDIDOS")
				.where(qb.gt("VENDIDOS", 30))
				.groupBy("NOMBRE_ARTISTA")
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
	});

	describe("uso de funciones de valor capitulo 10", () => {
		test("crea tabla FECHAS_VENTAS", async () => {
			const fechasVentas = {
				DISCO_COMPACTO: "VARCHAR(60)",
				FECHA_VENTA: "TIMESTAMP",
			};
			const fechasVentasRows = [
				["Famous Blue Raincoat", "2002-12-22 10:58:05.120"],
				["Blue", "2002-12-22 12:02:05.033"],
				["Court and Spark", "2002-12-22 16:15:22.930"],
				["Past Light", "2002-12-23 11:29:14.223"],
				["That Christmas Feeling", "2002-12-23 13:32:45.547"],
				["Patsy Cline: 12 Greatest Hits", "2002-12-23 15:51:15.730"],
				["Out of Africa", "2002-12-23 17:01:32.270"],
				["Leonard Cohen The Best of", "2002-12-24 10:46:35.123"],
				["Fundamental", "2002-12-24 12:19:13.843"],
				["Blues on the Bayou", "2002-12-24 14:15:09.673"],
			];

			const query = `CREATE TABLE IF NOT EXISTS FECHAS_VENTAS
( DISCO_COMPACTO VARCHAR(60),
 FECHA_VENTA TIMESTAMP );
INSERT INTO FECHAS_VENTAS
VALUES
('Famous Blue Raincoat', '2002-12-22 10:58:05.120'),
('Blue', '2002-12-22 12:02:05.033'),
('Court and Spark', '2002-12-22 16:15:22.930'),
('Past Light', '2002-12-23 11:29:14.223'),
('That Christmas Feeling', '2002-12-23 13:32:45.547'),
('Patsy Cline: 12 Greatest Hits', '2002-12-23 15:51:15.730'),
('Out of Africa', '2002-12-23 17:01:32.270'),
('Leonard Cohen The Best of', '2002-12-24 10:46:35.123'),
('Fundamental', '2002-12-24 12:19:13.843'),
('Blues on the Bayou', '2002-12-24 14:15:09.673');`;

			const result = await qb
				.createTable("FECHAS_VENTAS", { cols: fechasVentas, secure: true })
				.insert("FECHAS_VENTAS", [], fechasVentasRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("extrae un número definido de caracteres", async () => {
			const query = `SELECT SUBSTRING(DISCO_COMPACTO FROM 1 FOR 10) AS NOMBRE_ABREVIADO
FROM FECHAS_VENTAS;`;

			const result = await qb
				.select([qb.substr("DISCO_COMPACTO", 1, 10, "NOMBRE_ABREVIADO")])
				.from("FECHAS_VENTAS")
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("uso de substring en la clausula WHERE", async () => {
			const query = `SELECT DISCO_COMPACTO, FECHA_VENTA
FROM FECHAS_VENTAS
WHERE SUBSTRING(DISCO_COMPACTO FROM 1 FOR 4) = 'Blue';`;

			const result = await qb
				.select(["DISCO_COMPACTO", "FECHA_VENTA"])
				.from("FECHAS_VENTAS")
				.where(qb.eq(qb.substr("DISCO_COMPACTO", 1, 4), "Blue"))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("uso de UPPER y LOWER", async () => {
			const query = `SELECT UPPER(DISCO_COMPACTO) AS TITULO, FECHA_VENTA
FROM FECHAS_VENTAS
WHERE SUBSTRING(DISCO_COMPACTO FROM 1 FOR 4) = 'Blue';`;

			const result = await qb
				.select([qb.upper("DISCO_COMPACTO", "TITULO"), "FECHA_VENTA"])
				.from("FECHAS_VENTAS")
				.where(qb.eq(qb.substr("DISCO_COMPACTO", 1, 4), "Blue"))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
	});
	describe("uso de funciones valor  numericas", () => {
		test("crea la tabla RASTREO_CD", async () => {
			const rastreoCd = {
				NOMBRE_CD: "VARCHAR(60)",
				CATEGORIA_CD: "CHAR(4)",
				EN_EXISTENCIA: "INT",
				EN_PEDIDO: "INT",
				VENDIDOS: "INT",
			};
			const rastreoCdRows = [
				["Famous Blue Raincoat", "FROK", 19, 16, 34],
				["Blue", "CPOP", 28, 22, 56],
				["Past Light", "CPOP", 12, 11, 48],
				["That Christmas Feeling", "NEWA", 6, 7, 22],
				["Patsy Cline: 12 Greatest Hits", "XMAS", 14, 14, 34],
				["Court and Spark", "CTRY", 15, 18, 54],
				["Out of Africa", "STRK", 8, 5, 26],
				["Leonard Cohen The Best of", "FROK", 6, 8, 18],
				["Fundamental", "BLUS", 10, 6, 21],
				["Blues on the Bayou", "BLUS", 11, 10, 17],
			];
			const query = `CREATE TABLE IF NOT EXISTS RASTREO_CD
( NOMBRE_CD VARCHAR(60),
 CATEGORIA_CD CHAR(4),
 EN_EXISTENCIA INT,
 EN_PEDIDO INT,
 VENDIDOS INT );
INSERT INTO RASTREO_CD
VALUES
('Famous Blue Raincoat', 'FROK', 19, 16, 34),
('Blue', 'CPOP', 28, 22, 56),
('Past Light', 'CPOP', 12, 11, 48),
('That Christmas Feeling', 'NEWA', 6, 7, 22),
('Patsy Cline: 12 Greatest Hits', 'XMAS', 14, 14, 34),
('Court and Spark', 'CTRY', 15, 18, 54),
('Out of Africa', 'STRK', 8, 5, 26),
('Leonard Cohen The Best of', 'FROK', 6, 8, 18),
('Fundamental', 'BLUS', 10, 6, 21),
('Blues on the Bayou', 'BLUS', 11, 10, 17);`;

			const result = await qb
				.createTable("RASTREO_CD", {
					cols: rastreoCd,
					secure: true,
				})
				.insert("RASTREO_CD", [], rastreoCdRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("expresion de valor numerico", async () => {
			const query = `SELECT NOMBRE_CD, EN_EXISTENCIA, EN_PEDIDO, (EN_EXISTENCIA + EN_PEDIDO) AS TOTAL
FROM RASTREO_CD
WHERE (EN_EXISTENCIA + EN_PEDIDO) > 25;`;

			const result = await qb
				.select([
					"NOMBRE_CD",
					"EN_EXISTENCIA",
					"EN_PEDIDO",
					"(EN_EXISTENCIA + EN_PEDIDO) AS TOTAL",
				])
				.from("RASTREO_CD")
				.where(qb.gt("(EN_EXISTENCIA + EN_PEDIDO)", 25))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("expresion de valor numerico case", async () => {
			const query = `SELECT NOMBRE_CD, EN_PEDIDO, CASE
WHEN EN_PEDIDO < 6 THEN EN_PEDIDO + 4
WHEN EN_PEDIDO BETWEEN 6 AND 8 THEN EN_PEDIDO + 2
ELSE EN_PEDIDO
END AS NUEVAS_ORDENES
FROM RASTREO_CD
WHERE EN_PEDIDO < 11;`;

			const result = await qb
				.select([
					"NOMBRE_CD",
					"EN_PEDIDO",
					qb.case(
						"NUEVAS_ORDENES",
						[
							[qb.lt("EN_PEDIDO", 6), "EN_PEDIDO + 4"],
							[qb.between("EN_PEDIDO", 6, 8), "EN_PEDIDO + 2"],
						],
						"EN_PEDIDO",
					),
				])
				.from("RASTREO_CD")
				.where(qb.lt("EN_PEDIDO", 11))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("expresion de valor numerico case en un SET", async () => {
			const query = `UPDATE RASTREO_CD
SET EN_PEDIDO = CASE
WHEN EN_PEDIDO < 6 THEN EN_PEDIDO + 4
WHEN EN_PEDIDO BETWEEN 6 AND 8 THEN EN_PEDIDO + 2
ELSE EN_PEDIDO
END;`;

			const result = await qb
				.update("RASTREO_CD", {
					EN_PEDIDO: qb.case(
						[
							[qb.lt("EN_PEDIDO", 6), "EN_PEDIDO + 4"],
							[qb.between("EN_PEDIDO", 6, 8), "EN_PEDIDO + 2"],
						],
						"EN_PEDIDO",
					),
				})
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("utilizar la expresión CAST en SELECT", async () => {
			const query = `SELECT DISCO_COMPACTO, FECHA_VENTA, CAST(FECHA_VENTA AS CHAR(25)) AS CHAR_FECHA
FROM FECHAS_VENTAS
WHERE DISCO_COMPACTO LIKE ('%Blue%');`;

			const result = await qb
				.select([
					"DISCO_COMPACTO",
					"FECHA_VENTA",
					"CAST(FECHA_VENTA AS CHAR(25)) AS CHAR_FECHA",
				])
				.from("FECHAS_VENTAS")
				.where(qb.like("DISCO_COMPACTO", "%Blue%"))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
	});
	describe("Capitulo 11 Acceso a multiples tablas", () => {
		test("crea la tabla INVENTARIO_CD", async () => {
			const inventarioCD = {
				NOMBRE_CD: "VARCHAR(60)",
				ID_INTER: "INT",
				EN_EXISTENCIA: "INT",
			};
			const inventarioCDRows = [
				["Famous Blue Raincoat", 102, 12],
				["Blue", 101, 24],
				["Court and Spark", 101, 17],
				["Past Light", 105, 9],
				["Fundamental", 104, 22],
				["Blues on the Bayou", 103, 19],
				["Longing in Their Hearts", 104, 18],
				["Luck of the Draw", 104, 25],
				["Deuces Wild", 103, 17],
				["Nick of Time", 104, 11],
				["Both Sides Now", 101, 13],
			];
			const query = `CREATE TABLE INVENTARIO_CD
( NOMBRE_CD VARCHAR(60),
 ID_INTER INT,
 EN_EXISTENCIA INT );
INSERT INTO INVENTARIO_CD
VALUES
('Famous Blue Raincoat', 102, 12),
('Blue', 101, 24),
('Court and Spark', 101, 17),
('Past Light', 105, 9),
('Fundamental', 104, 22),
('Blues on the Bayou', 103, 19),
('Longing in Their Hearts', 104, 18),
('Luck of the Draw', 104, 25),
('Deuces Wild', 103, 17),
('Nick of Time', 104, 11),
('Both Sides Now', 101, 13);`;

			const result = await qb
				.createTable("INVENTARIO_CD", { cols: inventarioCD })
				.insert("INVENTARIO_CD", [], inventarioCDRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("crea la tabla INTERPRETES", async () => {
			const interpretes = {
				ID_INTER: "INT",
				NOMBRE_INTER: "VARCHAR(60)",
				ID_TIPO: "INT",
			};
			const interpretesRows = [
				[101, "Joni Mitchell", 10],
				[102, "Jennifer Warnes", 12],
				[103, "B.B. King", 11],
				[104, "Bonnie Raitt", 10],
				[105, "William Ackerman", 15],
				[106, "Bing Crosby", 16],
				[107, "Patsy Cline", 17],
				[108, "John Barry", 18],
				[109, "Leonard Cohen", 12],
			];
			const query = `CREATE TABLE INTERPRETES
( ID_INTER INT,
 NOMBRE_INTER VARCHAR(60),
 ID_TIPO INT );
INSERT INTO INTERPRETES
VALUES
(101, 'Joni Mitchell', 10),
(102, 'Jennifer Warnes', 12),
(103, 'B.B. King', 11),
(104, 'Bonnie Raitt', 10),
(105, 'William Ackerman', 15),
(106, 'Bing Crosby', 16),
(107, 'Patsy Cline', 17),
(108, 'John Barry', 18),
(109, 'Leonard Cohen', 12);`;

			const result = await qb
				.createTable("INTERPRETES", { cols: interpretes })
				.insert("INTERPRETES", [], interpretesRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("crea la tabla TIPO_INTER", async () => {
			const tipoInterprete = {
				ID_TIPO: "INT",
				NOMBRE_TIPO: "CHAR(20)",
			};
			const tipoInterpreteRows = [
				[10, "Popular"],
				[11, "Blues"],
				[12, "Folk"],
				[13, "Rock"],
				[14, "Classical"],
				[15, "New Age"],
				[16, "Classic Pop"],
				[17, "Country"],
				[18, "Soundtrack"],
			];
			const query = `CREATE TABLE TIPO_INTER
( ID_TIPO INT,
 NOMBRE_TIPO CHAR(20) );
INSERT INTO TIPO_INTER
VALUES
(10, 'Popular'),
(11, 'Blues'),
(12, 'Folk'),
(13, 'Rock'),
(14, 'Classical'),
(15, 'New Age'),
(16, 'Classic Pop'),
(17, 'Country'),
(18, 'Soundtrack');`;

			const result = await qb
				.createTable("TIPO_INTER", { cols: tipoInterprete })
				.insert("TIPO_INTER", [], tipoInterpreteRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("operciones basicas JOIN", async () => {
			const query = `SELECT INVENTARIO_CD.NOMBRE_CD, INTERPRETES.NOMBRE_INTER, INVENTARIO_CD.EN_EXISTENCIA
FROM INVENTARIO_CD, INTERPRETES
WHERE (INVENTARIO_CD.ID_INTER = INTERPRETES.ID_INTER
AND INVENTARIO_CD.EN_EXISTENCIA < 15);`;

			const result = await qb
				.select([
					qb.coltn("INVENTARIO_CD", "NOMBRE_CD"),
					qb.coltn("INTERPRETES", "NOMBRE_INTER"),
					qb.coltn("INVENTARIO_CD", "EN_EXISTENCIA"),
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
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("uso de nombres de correlacion", async () => {
			const query = `SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD AS c, INTERPRETES AS p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`;

			const result = await qb
				.select([
					qb.coltn("c", "NOMBRE_CD"),
					qb.coltn("p", "NOMBRE_INTER"),
					qb.coltn("c", "EN_EXISTENCIA"),
				])
				.from(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
				.where(
					qb.and(
						qb.eq(qb.col("ID_INTER", "c"), qb.col("ID_INTER", "p")),
						qb.lt(qb.col("EN_EXISTENCIA", "c"), 15),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("JOIN con mas de dos tablas", async () => {
			const query = `SELECT c.NOMBRE_CD, p.NOMBRE_INTER, t.NOMBRE_TIPO
FROM INVENTARIO_CD AS c, INTERPRETES AS p, TIPO_INTER AS t
WHERE (c.ID_INTER = p.ID_INTER
AND p.ID_TIPO = t.ID_TIPO
AND NOMBRE_TIPO = 'Popular');`;

			const result = await qb
				.select([
					qb.coltn("c", "NOMBRE_CD"),
					qb.coltn("p", "NOMBRE_INTER"),
					qb.coltn("t", "NOMBRE_TIPO"),
				])
				.from(["INVENTARIO_CD", "INTERPRETES", "TIPO_INTER"], ["c", "p", "t"])
				.where(
					qb.and(
						qb.eq(qb.col("ID_INTER", "c"), qb.col("ID_INTER", "p")),
						qb.eq(qb.col("ID_TIPO", "p"), qb.col("ID_TIPO", "t")),
						qb.eq("NOMBRE_TIPO", "Popular"),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("operacion CROSS JOIN", async () => {
			const query = `SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD c CROSS JOIN INTERPRETES p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`;

			const result = await qb
				.select([
					qb.coltn("c", "NOMBRE_CD"),
					qb.coltn("p", "NOMBRE_INTER"),
					qb.coltn("c", "EN_EXISTENCIA"),
				])
				.crossJoin(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
				.where(
					qb.and(
						qb.eq(qb.col("ID_INTER", "c"), qb.col("ID_INTER", "p")),
						qb.lt(qb.col("EN_EXISTENCIA", "c"), 15),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("crea tabla EMPLEADOS", async () => {
			const empleados = {
				ID_EMP: "INT",
				NOMBRE_EMP: "VARCHAR(60)",
				ADMIN: "INT",
			};

			const empleadosRows = [
				[101, "Ms. Smith", qb.exp("null")],
				[102, "Mr. Jones", 101],
				[103, "Mr. Roberts", 101],
				[104, "Ms. Hanson", 103],
				[105, "Mr. Fields", 102],
				[106, "Ms. Lee", 102],
				[107, "Mr. Carver", 103],
			];
			const query = `CREATE TABLE IF NOT EXISTS EMPLEADOS
( ID_EMP INT,
 NOMBRE_EMP VARCHAR(60),
 ADMIN INT );
INSERT INTO EMPLEADOS
VALUES
(101, 'Ms. Smith', null),
(102, 'Mr. Jones', 101),
(103, 'Mr. Roberts', 101),
(104, 'Ms. Hanson', 103),
(105, 'Mr. Fields', 102),
(106, 'Ms. Lee', 102),
(107, 'Mr. Carver', 103);`;

			const result = await qb
				.createTable("EMPLEADOS", { cols: empleados, secure: true })
				.insert("EMPLEADOS", [], empleadosRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("operacion SELF JOIN", async () => {
			const query = `SELECT a.ID_EMP, a.NOMBRE_EMP, b.NOMBRE_EMP AS ADMINISTRADOR
FROM EMPLEADOS AS a, EMPLEADOS AS b
WHERE a.ADMIN = b.ID_EMP
ORDER BY a.ID_EMP;`;

			const result = await qb
				.select([
					qb.col("ID_EMP", "a"),
					qb.col("NOMBRE_EMP").from("a"),
					qb.col("NOMBRE_EMP").from("b").as("ADMINISTRADOR"),
				])
				.from(["EMPLEADOS", "EMPLEADOS"], ["a", "b"])
				.where(qb.eq(qb.col("ADMIN", "a"), qb.col("ID_EMP", "b")))
				.orderBy(qb.col("ID_EMP", "a"))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("Crea tablas TITULOS_EN_EXISTENCIA y COSTOS_TITULOS", async () => {
			const TITULOS_EN_EXISTENCIA = {
				TITULO_CD: "VARCHAR(60)",
				TIPO_CD: "CHAR(20)",
				INVENTARIO: "INT",
			};
			const COSTOS_TITULO = {
				TITULO_CD: "VARCHAR(60)",
				TIPO_CD: "CHAR(20)",
				MENUDEO: "NUMERIC(5,2)",
			};

			const query = `CREATE TABLE IF NOT EXISTS TITULOS_EN_EXISTENCIA
( TITULO_CD VARCHAR(60),
 TIPO_CD CHAR(20),
 INVENTARIO INT );
CREATE TABLE IF NOT EXISTS COSTOS_TITULO
( TITULO_CD VARCHAR(60),
 TIPO_CD CHAR(20),
 MENUDEO DECIMAL(5,2) );`;

			const result = await qb
				.createTable("TITULOS_EN_EXISTENCIA", {
					secure: true,
					cols: TITULOS_EN_EXISTENCIA,
				})
				.createTable("COSTOS_TITULO", {
					secure: true,
					cols: COSTOS_TITULO,
				})
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		test("añade registros a las tablas TITULOS_EN_EXISTENCIA y COSTOS_TITULO", async () => {
			const TITULOS_EN_EXISTENCIA = [
				["Famous Blue Raincoat", "Folk", 12],
				["Blue", "Popular", 24],
				["Past Light", "New Age", 9],
				["Luck of the Draw", "Popular", 19],
				["Deuces Wild", "Blues", 25],
				["Nick of Time", "Popular", 17],
				["Blues on the Bayou", "Blues", 11],
				["Both Sides Now", "Popular", 13],
			];

			const COSTOS_TITULO = [
				["Famous Blue Raincoat", "Folk", 16.99],
				["Blue", "Popular", 15.99],
				["Court and Spark", "Popular", 15.99],
				["Past Light", "New Age", 14.99],
				["Fundamental", "Popular", 16.99],
				["Blues on the Bayou", "Blues", 15.99],
				["Longing in their Hearts", "Popular", 15.99],
				["Deuces Wild", "Blues", 14.99],
				["Nick of Time", "Popular", 14.99],
			];
			const query = `INSERT INTO TITULOS_EN_EXISTENCIA
VALUES
('Famous Blue Raincoat','Folk',12),
('Blue','Popular',24),
('Past Light','New Age',9),
('Luck of the Draw','Popular',19),
('Deuces Wild','Blues',25),
('Nick of Time','Popular',17),
('Blues on the Bayou','Blues',11),
('Both Sides Now','Popular',13),
;
INSERT INTO COSTOS_TITULO
VALUES
('Famous Blue Raincoat', 'Folk', 16.99),
('Blue', 'Popular', 15.99),
('Court and Spark', 'Popular', 15.99),
('Past Light', 'New Age', 14.99),
('Fundamental', 'Popular', 16.99),
('Blues on the Bayou', 'Blues', 15.99),
('Longing in their Hearts', 'Popular', 15.99),
('Deuces Wild', 'Blues', 14.99),
('Nick of Time', 'Popular', 14.99);`;

			const result = await qb
				.insert("TITULOS_EN_EXISTENCIA", [], TITULOS_EN_EXISTENCIA)
				.insert("COSTOS_TITULO", [], COSTOS_TITULO)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("join natural hace coincidir automáticamente las filas de aquellas columnas con el mismo nombre", async () => {
			const query = `SELECT TITULO_CD, TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s NATURAL JOIN COSTOS_TITULO c
WHERE s.INVENTARIO > 15;`;

			const result = await qb
				.select(["TITULO_CD", "TIPO_CD", qb.col("MENUDEO").from("c")])
				.naturalJoin(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
				.where(qb.gt(qb.col("INVENTARIO").from("s"), 15))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("join natural de columna nombrada permite especificar las columnas coincidentes", async () => {
			//las columnas identificadas en la cláusula USING están sin cualificar el resto debe hacerlo
			const query = `SELECT TITULO_CD, s.TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s JOIN COSTOS_TITULO c
USING (TITULO_CD)
WHERE s.INVENTARIO > 15;`;

			const result = await qb
				.select([
					"TITULO_CD",
					qb.col("TIPO_CD", "s"),
					qb.col("MENUDEO").from("c"),
				])
				.join(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
				.using("TITULO_CD")
				.where(qb.gt(qb.col("INVENTARIO").from("s"), 15))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		/*
		El join de condición realiza un método diferente a cualquiera
		la condición equi-join está definida en la cláusula 'ON'
		que funciona de manera muy similar a la cláusula 'WHERE'

		tipos de uniones: 'inner joins' y 'outer joins'.
        */
		test("tablas TITULO_CDS, ARTISTAS_TITULOS y ARTISTAS_CD", async () => {
			const TITULO_CDS = {
				ID_TITULO: "INT",
				TITULO: "VARCHAR(60)",
			};
			const ARTISTAS_TITULOS = {
				ID_TITULO: "INT",
				ID_ARTISTA: "INT",
			};
			const ARTISTAS_CD = {
				ID_ARTISTA: "INT",
				ARTISTA: "VARCHAR(60)",
			};
			const query = `DROP TABLE IF EXISTS TITULO_CDS;
DROP TABLE IF EXISTS ARTISTAS_TITULOS;
DROP TABLE IF EXISTS ARTISTAS_CD;
CREATE TABLE TITULO_CDS
( ID_TITULO INT,
 TITULO VARCHAR(60) );
CREATE TABLE ARTISTAS_TITULOS
( ID_TITULO INT,
 ID_ARTISTA INT );
CREATE TABLE ARTISTAS_CD
( ID_ARTISTA INT,
 ARTISTA VARCHAR(60) );`;

			const result = await qb
				.dropTable("TITULO_CDS", { secure: true })
				.dropTable("ARTISTAS_TITULOS", { secure: true })
				.dropTable("ARTISTAS_CD", { secure: true })
				.createTable("TITULO_CDS", {
					cols: TITULO_CDS,
				})
				.createTable("ARTISTAS_TITULOS", { cols: ARTISTAS_TITULOS })
				.createTable("ARTISTAS_CD", { cols: ARTISTAS_CD })
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("añadir registros a TITULO_CD", async () => {
			const TITULO_CDS = [
				[101, "Famous Blue Raincoat"],
				[102, "Blue"],
				[103, "Court and Spark"],
				[104, "Past Light"],
				[105, "Kojiki"],
				[106, "That Christmas Feeling"],
				[107, "Patsy Cline: 12 Greatest Hits"],
				[108, "Carreras Domingo Pavarotti in Concert"],
				[109, "Out of Africa"],
				[110, "Leonard Cohen The Best of"],
				[111, "Fundamental"],
				[112, "Blues on the Bayou"],
				[113, "Orlando"],
			];
			const query = `INSERT INTO TITULO_CDS
VALUES
(101, 'Famous Blue Raincoat'),
(102, 'Blue'),
(103, 'Court and Spark'),
(104, 'Past Light'),
(105, 'Kojiki'),
(106, 'That Christmas Feeling'),
(107, 'Patsy Cline: 12 Greatest Hits'),
(108, 'Carreras Domingo Pavarotti in Concert'),
(109, 'Out of Africa'),
(110, 'Leonard Cohen The Best of'),
(111, 'Fundamental'),
(112, 'Blues on the Bayou'),
(113, 'Orlando');`;

			const result = await qb.insert("TITULO_CDS", [], TITULO_CDS).execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("añadir registros a ARTISTAS_TITULOS", async () => {
			const ARTISTAS_TITULOS = [
				[101, 2001],
				[102, 2002],
				[103, 2002],
				[104, 2003],
				[105, 2004],
				[106, 2005],
				[107, 2006],
				[108, 2007],
				[108, 2008],
				[108, 2009],
				[109, 2010],
				[110, 2011],
				[11, 2012],
				[112, 2013],
				[113, 2014],
				[113, 2015],
			];
			const query = `INSERT INTO ARTISTAS_TITULOS
VALUES
(101, 2001),
(102, 2002),
(103, 2002),
(104, 2003),
(105, 2004),
(106, 2005),
(107, 2006),
(108, 2007),
(108, 2008),
(108, 2009),
(109, 2010),
(110, 2011),
(11, 2012),
(112, 2013),
(113, 2014),
(113, 2015);`;

			const result = await qb
				.insert("ARTISTAS_TITULOS", [], ARTISTAS_TITULOS)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("añadir registros a ARTISTAS_CD", async () => {
			const ARTISTAS_CD = [
				[2001, "Jennifer Warnes"],
				[2002, "Joni Mitchell"],
				[2003, "William Ackerman"],
				[2004, "Kitaro"],
				[2005, "Bing Crosby"],
				[2006, "Patsy Cline"],
				[2007, "Jose Carreras"],
				[2008, "Luciano Pavarotti"],
				[2009, "Placido Domingo"],
				[2010, "John Barry"],
				[2011, "Leonard Cohen"],
				[2012, "Bonnie Raitt"],
				[2013, "B.B. King"],
				[2014, "David Motion"],
				[2015, "Sally Potter"],
			];
			const query = `INSERT INTO ARTISTAS_CD
VALUES
(2001, 'Jennifer Warnes'),
(2002, 'Joni Mitchell'),
(2003, 'William Ackerman'),
(2004, 'Kitaro'),
(2005, 'Bing Crosby'),
(2006, 'Patsy Cline'),
(2007, 'Jose Carreras'),
(2008, 'Luciano Pavarotti'),
(2009, 'Placido Domingo'),
(2010, 'John Barry'),
(2011, 'Leonard Cohen'),
(2012, 'Bonnie Raitt'),
(2013, 'B.B. King'),
(2014, 'David Motion'),
(2015, 'Sally Potter');`;

			const result = await qb.insert("ARTISTAS_CD", [], ARTISTAS_CD).execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("unir las tablas TITULO_CDS, ARTISTAS_TITULOS y ARTISTAS_CD usando dos INNER JOIN", async () => {
			const query = `SELECT t.TITULO, a.ARTISTA
FROM TITULO_CDS t INNER JOIN ARTISTAS_TITULOS ta
ON t.ID_TITULO = ta.ID_TITULO
INNER JOIN ARTISTAS_CD a
ON ta.ID_ARTISTA = a.ID_ARTISTA
WHERE t.TITULO LIKE ('%Blue%');`;

			const result = await qb
				.select(["t.TITULO", "a.ARTISTA"])
				.innerJoin(["TITULO_CDS", "ARTISTAS_TITULOS"], ["t", "ta"])
				.on(qb.eq(qb.col("ID_TITULO", "t"), qb.col("ID_TITULO", "ta")))
				.innerJoin("ARTISTAS_CD", "a")
				.on(
					qb.eq(
						qb.col("ID_ARTISTA").from("ta"),
						qb.col("ID_ARTISTA").from("a"),
					),
				)
				.where(qb.like(qb.col("TITULO").from("t"), "%Blue%"))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("crea tablas INFO_CD y TIPO_CD", async () => {
			const INFO_CD = {
				TITULO: "VARCHAR(60)",
				ID_TIPO: "CHAR(4)",
				EXISTENCIA: "INT",
			};
			const TIPO_CD = {
				ID_TIPO: "CHAR(4)",
				NOMBRE_TIPO: "CHAR(20)",
			};
			const query = `CREATE TABLE INFO_CD
( TITULO VARCHAR(60),
 ID_TIPO CHAR(4),
 EXISTENCIA INT );
CREATE TABLE TIPO_CD
( ID_TIPO CHAR(4),
 NOMBRE_TIPO CHAR(20) );`;

			const result = await qb
				.createTable("INFO_CD", { cols: INFO_CD })
				.createTable("TIPO_CD", { cols: TIPO_CD })
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("añadir registros a INFO_CD", async () => {
			const INFO_CD = [
				["Famous Blue Raincoat", "FROK", 19],
				["Blue", "CPOP", 28],
				["Past Light", "NEWA", 6],
				["Out of Africa", "STRK", 8],
				["Fundamental", "NPOP", 10],
				["Blues on the Bayou", "BLUS", 11],
			];
			const query = `INSERT INTO INFO_CD
VALUES
('Famous Blue Raincoat', 'FROK', 19),
('Blue', 'CPOP', 28),
('Past Light', 'NEWA', 6),
('Out of Africa', 'STRK', 8),
('Fundamental', 'NPOP', 10),
('Blues on the Bayou', 'BLUS', 11);`;

			const result = await qb.insert("INFO_CD", [], INFO_CD).execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("añadir registros a TIPO_CD", async () => {
			const TIPO_CD = [
				["FROK", "Folk Rock"],
				["CPOP", "Classic Pop"],
				["NEWA", "New Age"],
				["CTRY", "Country"],
				["STRK", "Soundtrack"],
				["BLUS", "Blues"],
				["JAZZ", "Jazz"],
			];
			const query = `INSERT INTO TIPO_CD
VALUES
('FROK', 'Folk Rock'),
('CPOP', 'Classic Pop'),
('NEWA', 'New Age'),
('CTRY', 'Country'),
('STRK', 'Soundtrack'),
('BLUS', 'Blues'),
('JAZZ', 'Jazz');`;

			const result = await qb.insert("TIPO_CD", [], TIPO_CD).execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("operación join sobre dos tablas", async () => {
			const $ = qb;
			const query = `SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`;

			const result = await qb
				.select([
					$.col("TITULO").from("i"),
					$.col("NOMBRE_TIPO").from("t"),
					$.col("EXISTENCIA", "i"),
				])
				.join(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on($.eq($.col("ID_TIPO", "i"), $.col("ID_TIPO", "t")))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("incluir las filas no coincidentes de la tabla INFO_CD usando LEFT OUTER JOIN", async () => {
			const $ = qb;
			const query = `SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i LEFT OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`;

			const result = await qb
				.select([
					$.col("TITULO").from("i"),
					$.col("NOMBRE_TIPO").from("t"),
					$.col("EXISTENCIA", "i"),
				])
				.leftJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on($.eq($.col("ID_TIPO", "i"), $.col("ID_TIPO", "t")))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("incluir las filas no coincidentes de la tabla TIPO_CD usando RIGHT OUTER JOIN", async () => {
			const $ = qb;
			const query = `SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i RIGHT OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`;

			const result = await qb
				.select([
					$.col("TITULO").from("i"),
					$.col("NOMBRE_TIPO").from("t"),
					$.col("EXISTENCIA", "i"),
				])
				.rightJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on($.eq($.col("ID_TIPO", "i"), $.col("ID_TIPO", "t")))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		// 		test(
		// 			"todas las filas no coincidentes usando full outer join",
		// 			async () => {
		// 				const $ = qb;
		// 				const query = `SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
		// FROM INFO_CD i FULL OUTER JOIN TIPO_CD t
		// ON i.ID_TIPO = t.ID_TIPO;`;

		// 				const result = await qb
		// 					.select([
		// 						$.col("TITULO").from("i"),
		// 						$.col("NOMBRE_TIPO").from("t"),
		// 						$.col("EXISTENCIA", "i"),
		// 					])
		// 					.fullJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
		// 					.on($.eq($.col("ID_TIPO", "i"), $.col("ID_TIPO", "t")));

		// 				showResults(result);
		// 				assert.equal(await  result.toString(), `USE INVENTARIO;\n${query}`);
		// 			},
		// 		);
		//fin test
		test("crea tablas CDS_CONTINUADOS y CDS_DESCONTINUADOS", async () => {
			const CDS_CONTINUADOS = {
				NOMBRE_CD: "VARCHAR(60)",
				TIPO_CD: "CHAR(4)",
				EN_EXISTENCIA: "INT",
			};
			const CDS_DESCONTINUADOS = {
				NOMBRE_CD: "VARCHAR(60)",
				TIPO_CD: "CHAR(4)",
				EN_EXISTENCIA: "INT",
			};
			const query = `CREATE TABLE CDS_CONTINUADOS
( NOMBRE_CD VARCHAR(60),
 TIPO_CD CHAR(4),
 EN_EXISTENCIA INT );
CREATE TABLE CDS_DESCONTINUADOS
( NOMBRE_CD VARCHAR(60),
 TIPO_CD CHAR(4),
 EN_EXISTENCIA INT );`;

			const result = await qb
				.createTable("CDS_CONTINUADOS", {
					cols: CDS_CONTINUADOS,
				})
				.createTable("CDS_DESCONTINUADOS", {
					cols: CDS_DESCONTINUADOS,
				})
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("añade registros a CDS_CONTINUADOS", async () => {
			const CDS_CONTINUADOS = [
				["Famous Blue Raincoat", "FROK", 19],
				["Blue", "CPOP", 28],
				["Past Light", "NEWA", 6],
				["Out of Africa", "STRK", 8],
				["Fundamental", "NPOP", 10],
				["Blues on the Bayou", "BLUS", 11],
			];
			const query = `INSERT INTO CDS_CONTINUADOS
VALUES
('Famous Blue Raincoat', 'FROK', 19),
('Blue', 'CPOP', 28),
('Past Light', 'NEWA', 6),
('Out of Africa', 'STRK', 8),
('Fundamental', 'NPOP', 10),
('Blues on the Bayou', 'BLUS', 11);`;

			const result = await qb
				.insert("CDS_CONTINUADOS", [], CDS_CONTINUADOS)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("añade registros a CDS_DESCONTINUADOS", async () => {
			const CDS_DESCONTINUADOS = [
				["Court and Spark", "FROK", 3],
				["Kojiki", "NEWA", 2],
				["That Christmas Feeling", "XMAS", 2],
				["Patsy Cline: 12 Greatest Hits", "CTRY", 4],
				["Leonard Cohen The Best of", "FROK", 3],
				["Orlando", "STRK", 1],
			];
			const query = `INSERT INTO CDS_DESCONTINUADOS
VALUES
('Court and Spark', 'FROK', 3),
('Kojiki', 'NEWA', 2),
('That Christmas Feeling', 'XMAS', 2),
('Patsy Cline: 12 Greatest Hits', 'CTRY', 4),
('Leonard Cohen The Best of', 'FROK', 3),
('Orlando', 'STRK', 1);`;

			const result = await qb
				.insert("CDS_DESCONTINUADOS", [], CDS_DESCONTINUADOS)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("combinar instrucciones 'SELECT' en una sola que combine la información", async () => {
			const query = `SELECT *
FROM CDS_CONTINUADOS
UNION ALL
SELECT *
FROM CDS_DESCONTINUADOS;`;

			const result = await qb
				.unionAll(
					qb.select("*").from("CDS_CONTINUADOS"),
					qb.select("*").from("CDS_DESCONTINUADOS"),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		/**
		 * Usar subconsultas para acceder y moficiar datos capitulo 12
		 */
		test("crea tabla EXISTENCIA_CD", async () => {
			const EXISTENCIA_CD = {
				TITULO_CD: "VARCHAR(60)",
				EXISTENCIA: "INT",
			};
			const existenciaCdRows = [
				["Famous Blue Raincoat", 13],
				["Blue", 42],
				["Court and Spark", 22],
				["Past Light", 17],
				["Kojiki", 6],
				["That Christmas Feeling", 8],
				["Out of Africa", 29],
				["Blues on the Bayou", 27],
				["Orlando", 5],
			];
			const query = `DROP TABLE IF EXISTS EXISTENCIA_CD;
CREATE TABLE EXISTENCIA_CD
( TITULO_CD VARCHAR(60),
 EXISTENCIA INT );
INSERT INTO EXISTENCIA_CD
VALUES
('Famous Blue Raincoat', 13),
('Blue', 42),
('Court and Spark', 22),
('Past Light', 17),
('Kojiki', 6),
('That Christmas Feeling', 8),
('Out of Africa', 29),
('Blues on the Bayou', 27),
('Orlando', 5);`;

			const result = await qb
				.dropTable("EXISTENCIA_CD", { secure: true })
				.createTable("EXISTENCIA_CD", { cols: EXISTENCIA_CD })
				.insert("EXISTENCIA_CD", [], existenciaCdRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("crea tabla ARTISTAS_CD", async () => {
			const ARTISTAS_CD = {
				TITULO: "VARCHAR(60)",
				ARTIST_NAME: "VARCHAR(60)",
			};
			const artistasCdRows = [
				["Famous Blue Raincoat", "Jennifer Warnes"],
				["Blue", "Joni Mitchell"],
				["Court and Spark", "Joni Mitchell"],
				["Past Light", "William Ackerman"],
				["Kojiki", "Kitaro"],
				["That Christmas Feeling", "Bing Crosby"],
				["Patsy Cline: 12 Greatest Hits", "Patsy Cline"],
				["After the Rain: The Soft Sounds of Erik Satie", "Pascal Roge"],
				["Out of Africa", "John Barry"],
				["Leonard Cohen The Best of", "Leonard Cohen"],
				["Fundamental", "Bonnie Raitt"],
				["Blues on the Bayou", "B.B. King"],
				["Orlando", "David Motion"],
			];
			const query = `DROP TABLE IF EXISTS ARTISTAS_CD;
CREATE TABLE ARTISTAS_CD
( TITULO VARCHAR(60),
 ARTIST_NAME VARCHAR(60) );
INSERT INTO ARTISTAS_CD
VALUES
('Famous Blue Raincoat', 'Jennifer Warnes'),
('Blue', 'Joni Mitchell'),
('Court and Spark', 'Joni Mitchell'),
('Past Light', 'William Ackerman'),
('Kojiki', 'Kitaro'),
('That Christmas Feeling', 'Bing Crosby'),
('Patsy Cline: 12 Greatest Hits', 'Patsy Cline'),
('After the Rain: The Soft Sounds of Erik Satie', 'Pascal Roge'),
('Out of Africa', 'John Barry'),
('Leonard Cohen The Best of', 'Leonard Cohen'),
('Fundamental', 'Bonnie Raitt'),
('Blues on the Bayou', 'B.B. King'),
('Orlando', 'David Motion');`;

			const result = await qb
				.dropTable("ARTISTAS_CD", { secure: true })
				.createTable("ARTISTAS_CD", { cols: ARTISTAS_CD })
				.insert("ARTISTAS_CD", [], artistasCdRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("el predicado IN compara valores de una columna en la tabla primaria con valores arrojados por la subconsulta", async () => {
			const query = `SELECT *
FROM EXISTENCIA_CD
WHERE TITULO_CD IN ( SELECT TITULO
FROM ARTISTAS_CD
WHERE ARTIST_NAME = 'Joni Mitchell' );`;

			const result = await qb
				.select("*")
				.from("EXISTENCIA_CD")
				.where(
					qb.in(
						"TITULO_CD",
						qb
							.select("TITULO")
							.from("ARTISTAS_CD")
							.where(qb.eq("ARTIST_NAME", "Joni Mitchell")),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		/**
		 * El predicado EXISTS se evalúa como verdadero si una o más filas son arrojadas por
la subconsulta; de otra manera, se evalúa como falso.
la subconsulta asociada deberá incluir una condición de búsqueda que haga coincidir los valores en las dos tablas que están siendo vinculadas
a través de la subconsulta
		 */
		test("predicado EXISTS", async () => {
			const query = `SELECT *
FROM EXISTENCIA_CD s
WHERE EXISTS ( SELECT TITULO
FROM ARTISTAS_CD a
WHERE (a.ARTIST_NAME = 'Joni Mitchell'
AND s.TITULO_CD = a.TITULO) );`;

			const result = await qb
				.select("*")
				.from("EXISTENCIA_CD", "s")
				.where(
					qb.exists(
						qb
							.select("TITULO")
							.from("ARTISTAS_CD", "a")
							.where(
								qb.and(
									qb.eq(qb.col("ARTIST_NAME", "a"), "Joni Mitchell"),
									qb.eq(qb.col("TITULO_CD", "s"), qb.col("TITULO", "a")),
								),
							),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		}); //fin test
		/**
		 * El predicado ALL comprueba si todos los valores arrojados cumplen con la condición
de búsqueda.
Cuando se utiliza un predicado de comparación cuantificado (SOME, ANY y ALL), los valores en una columna de
la tabla primaria se comparan con los valores arrojados por la subconsulta.
		 */
		test("crea tabla PRECIOS_MENUDEO", async () => {
			const PRECIOS_MENUDEO = {
				NOMBRE_CD: "VARCHAR(60)",
				P_MENUDEO: "NUMERIC(5, 2)",
				CANTIDAD: "INT",
			};
			const preciosMenudeoRows = [
				["Famous Blue Raincoat", 16.99, 5],
				["Blue", 14.99, 10],
				["Court and Spark", 14.99, 12],
				["Past Light", 15.99, 11],
				["Kojiki", 15.99, 4],
				["That Christmas Feeling", 10.99, 8],
				["Patsy Cline: 12 Greatest Hits", 16.99, 14],
			];
			const query = `DROP TABLE IF EXISTS PRECIOS_MENUDEO;
CREATE TABLE PRECIOS_MENUDEO
( NOMBRE_CD VARCHAR(60),
 P_MENUDEO DECIMAL(5, 2),\n CANTIDAD INT );
INSERT INTO PRECIOS_MENUDEO
VALUES
('Famous Blue Raincoat', 16.99, 5),
('Blue', 14.99, 10),
('Court and Spark', 14.99, 12),
('Past Light', 15.99, 11),
('Kojiki', 15.99, 4),
('That Christmas Feeling', 10.99, 8),
('Patsy Cline: 12 Greatest Hits', 16.99, 14);`;

			const result = await qb
				.dropTable("PRECIOS_MENUDEO", { secure: true })
				.createTable("PRECIOS_MENUDEO", { cols: PRECIOS_MENUDEO })
				.insert("PRECIOS_MENUDEO", [], preciosMenudeoRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("crea tabla PRECIOS_VENTA", async () => {
			const PRECIOS_VENTA = {
				TITULO_CD: "VARCHAR(60)",
				P_VENTA: "NUMERIC(5,2)",
			};
			const preciosVentaRows = [
				["Famous Blue Raincoat", 14.99],
				["Blue", 12.99],
				["Court and Spark", 14.99],
				["Past Light", 14.99],
				["Kojiki", 13.99],
				["That Christmas Feeling", 10.99],
				["Patsy Cline: 12 Greatest Hits", 16.99],
			];
			const query = `DROP TABLE IF EXISTS PRECIOS_VENTA;
CREATE TABLE PRECIOS_VENTA\n( TITULO_CD VARCHAR(60),\n P_VENTA DECIMAL(5,2) );
INSERT INTO PRECIOS_VENTA\nVALUES
('Famous Blue Raincoat', 14.99),
('Blue', 12.99),
('Court and Spark', 14.99),
('Past Light', 14.99),
('Kojiki', 13.99),
('That Christmas Feeling', 10.99),
('Patsy Cline: 12 Greatest Hits', 16.99);`;

			const result = await qb
				.dropTable("PRECIOS_VENTA", { secure: true })
				.createTable("PRECIOS_VENTA", { cols: PRECIOS_VENTA })
				.insert("PRECIOS_VENTA", [], preciosVentaRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("predicado cuantificado", async () => {
			const query = `SELECT NOMBRE_CD, P_MENUDEO
FROM PRECIOS_MENUDEO
WHERE P_MENUDEO > ALL ( SELECT P_VENTA
FROM PRECIOS_VENTA
WHERE P_VENTA < 15.99 );`;

			const result = await qb
				.select(["NOMBRE_CD", "P_MENUDEO"])
				.from("PRECIOS_MENUDEO")
				.where(
					qb.gt(
						"P_MENUDEO",
						qb.all(
							qb
								.select("P_VENTA")
								.from("PRECIOS_VENTA")
								.where(qb.lt("P_VENTA", 15.99)),
						),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("incluir una subconsulta en la cláusula SELECT", async () => {
			const query = `SELECT TITULO_CD, ( SELECT ARTIST_NAME
FROM ARTISTAS_CD a
WHERE s.TITULO_CD = a.TITULO ) AS ARTIST, EXISTENCIA
FROM EXISTENCIA_CD s;`;

			const result = await qb
				.select([
					"TITULO_CD",
					qb
						.col(
							qb
								.select("ARTIST_NAME")
								.from("ARTISTAS_CD", "a")
								.where(qb.eq(qb.col("TITULO_CD", "s"), qb.col("TITULO", "a"))),
						)
						.as("ARTIST"),
					"EXISTENCIA",
				])
				.from("EXISTENCIA_CD", "s")
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("subconsultas que devuelve un solo valor", async () => {
			const query = `SELECT NOMBRE_CD, P_MENUDEO
FROM PRECIOS_MENUDEO
WHERE P_MENUDEO = ( SELECT MAX(P_VENTA)
FROM PRECIOS_VENTA );`;

			const result = await qb
				.select(["NOMBRE_CD", "P_MENUDEO"])
				.from("PRECIOS_MENUDEO")
				.where(
					qb.eq(
						"P_MENUDEO",
						qb.select(qb.max("P_VENTA")).from("PRECIOS_VENTA"),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		//Modificar datos
		test("crea tabla INVENTARIO_TITULOS", async () => {
			const INVENTARIO_TITULOS = {
				ID_TITULO: "INT",
				TITULO: "VARCHAR(60)",
				EXISTENCIA: "INT",
			};
			const inventarioTituloRows = [
				[101, "Famous Blue Raincoat", 12],
				[102, "Blue", 24],
				[103, "Past Light", 9],
				[104, "Luck of the Draw", 19],
				[105, "Deuces Wild", 25],
				[106, "Nick of Time", 17],
				[107, "Blues on the Bayou", 11],
				[108, "Both Sides Now", 13],
			];
			const query = `DROP TABLE IF EXISTS INVENTARIO_TITULOS;
CREATE TABLE INVENTARIO_TITULOS
( ID_TITULO INT,
 TITULO VARCHAR(60),
 EXISTENCIA INT );
INSERT INTO INVENTARIO_TITULOS
VALUES
(101, 'Famous Blue Raincoat', 12),
(102, 'Blue', 24),
(103, 'Past Light', 9),
(104, 'Luck of the Draw', 19),
(105, 'Deuces Wild', 25),
(106, 'Nick of Time', 17),
(107, 'Blues on the Bayou', 11),
(108, 'Both Sides Now', 13);`;

			const result = await qb
				.dropTable("INVENTARIO_TITULOS", { secure: true })
				.createTable("INVENTARIO_TITULOS", { cols: INVENTARIO_TITULOS })
				.insert("INVENTARIO_TITULOS", [], inventarioTituloRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("crea tabla TIPOS_TITULO", async () => {
			const TIPOS_TITULO = {
				TITULO_CD: "VARCHAR(60)",
				TIPO_CD: "CHAR(20)",
			};
			const tiposTituloRows = [
				["Famous Blue Raincoat", "Folk"],
				["Blue", "Popular"],
				["Court and Spark", "Popular"],
				["Past Light", "New Age"],
				["Fundamental", "Popular"],
				["Blues on the Bayou", "Blues"],
				["Longing in their Hearts", "Popular"],
				["Deuces Wild", "Blues"],
				["Nick of Time", "Popular"],
			];
			const query = `DROP TABLE IF EXISTS TIPOS_TITULO;
CREATE TABLE TIPOS_TITULO\n( TITULO_CD VARCHAR(60),\n TIPO_CD CHAR(20) );
INSERT INTO TIPOS_TITULO
VALUES
('Famous Blue Raincoat', 'Folk'),
('Blue', 'Popular'),
('Court and Spark', 'Popular'),
('Past Light', 'New Age'),
('Fundamental', 'Popular'),
('Blues on the Bayou', 'Blues'),
('Longing in their Hearts', 'Popular'),
('Deuces Wild', 'Blues'),
('Nick of Time', 'Popular');`;

			const result = await qb
				.dropTable("TIPOS_TITULO", { secure: true })
				.createTable("TIPOS_TITULO", { cols: TIPOS_TITULO })
				.insert("TIPOS_TITULO", [], tiposTituloRows)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("insertar registros usando una subconsulta", async () => {
			const query = `INSERT INTO TIPOS_TITULO
VALUES
( ( SELECT TITULO FROM INVENTARIO_TITULOS WHERE ID_TITULO = 108 ), 'Popular' );`;

			const result = await qb
				.insert(
					"TIPOS_TITULO",
					[],
					[
						qb
							.select("TITULO")
							.from("INVENTARIO_TITULOS")
							.where(qb.eq("ID_TITULO", 108)),
						"Popular",
					],
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("actualizar el valor Both Sides Now", async () => {
			const query = `UPDATE TIPOS_TITULO
SET TIPO_CD = 'Folk'
WHERE TITULO_CD IN ( SELECT TITULO
FROM INVENTARIO_TITULOS
WHERE ID_TITULO = 108 );`;

			const result = await qb
				.update("TIPOS_TITULO", {
					TIPO_CD: "Folk",
				})
				.where(
					qb.in(
						"TITULO_CD",
						qb
							.select("TITULO")
							.from("INVENTARIO_TITULOS")
							.where(qb.eq("ID_TITULO", 108)),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("subconsulta en la cláusula SET para proporcionar un valor para la columna identificada", async () => {
			const query = `UPDATE TIPOS_TITULO
SET TITULO_CD =
( SELECT TITULO
FROM INVENTARIO_TITULOS
WHERE ID_TITULO = 108 )
WHERE TITULO_CD = 'Both Sides Now';`;

			const result = await qb
				.update("TIPOS_TITULO", {
					TITULO_CD: qb
						.select("TITULO")
						.from("INVENTARIO_TITULOS")
						.where(qb.eq("ID_TITULO", 108)),
				})
				.where(qb.eq("TITULO_CD", "Both Sides Now"))
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test("borra el valor Both Sides", async () => {
			const query = `DELETE FROM TIPOS_TITULO
WHERE TITULO_CD IN ( SELECT TITULO
FROM INVENTARIO_TITULOS
WHERE ID_TITULO = 108 );`;

			const result = await qb
				.delete("TIPOS_TITULO")
				.where(
					qb.in(
						"TITULO_CD",
						qb
							.select("TITULO")
							.from("INVENTARIO_TITULOS")
							.where(qb.eq("ID_TITULO", 108)),
					),
				)
				.execute();

			showResults(result);
			assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
		});
		//fin test
		test(
			"uso de limit y offset para MySQL, PostgreSQL, y SQLite ",
			{ only: true },
			async () => {
				const debug = false;
				const query = `SELECT *
FROM TIPOS_TITULO
LIMIT 3
OFFSET 3;`;

				const result = await qb
					.select("*")
					.from("TIPOS_TITULO")
					.limit(3)
					.offset(3)
					.execute(debug);

				showResults(result, debug);
				assert.equal(await result.toString(), `USE INVENTARIO;\n${query}`);
			},
		);
		//fin test
	});
	describe("Capitulo 16 Transacciones", () => {
		test("usar una transaccion para actualizar", async () => {
			const query = `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION WITH CONSISTENT SNAPSHOT, READ WRITE;
USE INVENTARIO;
UPDATE DISCOS_COMPACTOS
SET EN_EXISTENCIA = EN_EXISTENCIA - 1;
UPDATE COSTOS_TITULO
SET MENUDEO = MENUDEO - 10;`;

			const result = await qb
				.setTransaction({ isolation: "READ COMMITTED" })
				.add(
					qb.update("DISCOS_COMPACTOS", {
						EN_EXISTENCIA: qb.exp("EN_EXISTENCIA - 1"),
					}),
				)
				.add(qb.update("COSTOS_TITULO", { MENUDEO: qb.exp("MENUDEO - 10") }))
				.start({ snapshot: true, access: "READ WRITE" });

			showResults(result);
			assert.equal(await result.toString(), `${query}`);
		});
		//fin test
		test("punto de recuperación a la transacción", async () => {
			const query = `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
USE INVENTARIO;
SELECT TITULO_CD, EN_EXISTENCIA
FROM DISCOS_COMPACTOS
WHERE ID_DISQUERA = 832;
SAVEPOINT SECCION_1;
USE INVENTARIO;
UPDATE DISCOS_COMPACTOS
SET EN_EXISTENCIA = EN_EXISTENCIA + 2
WHERE ID_DISQUERA = 832;
ROLLBACK TO SAVEPOINT SECCION_1;`;

			const $ = qb;

			const result = await qb
				.setTransaction({ isolation: "serializable" })
				.add(
					qb
						.select(["TITULO_CD", "EN_EXISTENCIA"])
						.from("DISCOS_COMPACTOS")
						.where($.eq("ID_DISQUERA", 832)),
				)
				.setSavePoint("SECCION_1")
				.add(
					qb
						.update("DISCOS_COMPACTOS", {
							EN_EXISTENCIA: $.exp("EN_EXISTENCIA + 2"),
						})
						.where($.eq("ID_DISQUERA", 832)),
				)
				.rollback("SECCION_1") // Invierte la actualización de datos
				.start();

			showResults(result);
			assert.equal(await result.toString(), `${query}`);
		});
		//fin test
	});
});

/**
 * test("",{only:true}, async () => {
			const query = ``;

			const result = await qb;

			showResults(result);
			assert.equal(await  result.toString(),`USE INVENTARIO;\n${query}`);
		});
		//fin test
 */
