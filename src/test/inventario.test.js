/*
 * Utiliza los ejercicios del libro SQL2006 pag 92-95
 */
import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Modelo de datos para la base de datos INVENTARIO", () => {
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

	let sql;
	beforeEach(() => {
		sql = new QueryBuilder(Core, {
			typeIdentificator: "regular",
		});
	});
	test("crear tabla TIPOS_MUSICA", () => {
		const result = sql
			.createTable("TIPOS_MUSICA", {
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
			.toString();
		assert.equal(
			result,
			`CREATE TABLE TIPOS_MUSICA
 ( ID_TIPO INT,
 NOMBRE_TIPO VARCHAR(20) NOT NULL,
 CONSTRAINT UN_NOMBRE_TIPO UNIQUE (NOMBRE_TIPO),
 CONSTRAINT PK_TIPOS_MUSICA PRIMARY KEY (ID_TIPO) );`,
		);
	});
	test("crear tabla DISQUERAS_CD", () => {
		const result = sql
			.createTable("DISQUERAS_CD", {
				cols: DISQUERAS_CD,
				constraints: [
					{
						name: "PK_DISQUERAS_CD",
						type: "primary key",
						cols: ["ID_DISQUERA"],
					},
				],
			})
			.toString();
		assert.equal(
			result,
			`CREATE TABLE DISQUERAS_CD
 ( ID_DISQUERA INT,
 NOMBRE_DISCOGRAFICA VARCHAR(60) NOT NULL DEFAULT 'Independiente',
 CONSTRAINT PK_DISQUERAS_CD PRIMARY KEY (ID_DISQUERA) );`,
		);
	});
	test("crear la tabla DISCOS_COMPACTOS", () => {
		const result = sql
			.createTable("DISCOS_COMPACTOS", {
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
			.toString();
		assert.equal(
			result,
			`CREATE TABLE DISCOS_COMPACTOS
 ( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 ID_DISQUERA INT NOT NULL,
 CONSTRAINT PK_DISCOS_COMPACTOS PRIMARY KEY (ID_DISCO_COMPACTO),
 CONSTRAINT FK_ID_DISQUERA FOREIGN KEY (ID_DISQUERA) REFERENCES DISQUERAS_CD (ID_DISQUERA) MATCH FULL );`,
		);
	});

	test("crear tabla TIPOS_DISCO_COMPACTO", () => {
		const result = sql
			.createTable("TIPOS_DISCO_COMPACTO", {
				cols: TIPOS_DISCO_COMPACTO,
				constraints: [
					{
						name: "PK_TIPOS_DISCO_COMPACTO",
						type: "primary key",
						cols: ["ID_DISCO_COMPACTO", "ID_TIPO_MUSICA"],
					},
					{
						name: "FK_ID_DISCO_COMPACTO_01",
						cols: ["ID_DISCO_COMPACTO"],
						foreignKey: {
							table: "DISCOS_COMPACTOS",
						},
					},
					{
						name: "FK_ID_TIPO_MUSICA",
						cols: ["ID_TIPO_MUSICA"],
						foreignKey: {
							table: "TIPOS_MUSICA",
						},
					},
				],
			})
			.toString();
		assert.equal(
			result,
			`CREATE TABLE TIPOS_DISCO_COMPACTO
 ( ID_DISCO_COMPACTO INT,
 ID_TIPO_MUSICA INT,
 CONSTRAINT PK_TIPOS_DISCO_COMPACTO PRIMARY KEY (ID_DISCO_COMPACTO, ID_TIPO_MUSICA),
 CONSTRAINT FK_ID_DISCO_COMPACTO_01 FOREIGN KEY (ID_DISCO_COMPACTO) REFERENCES DISCOS_COMPACTOS,
 CONSTRAINT FK_ID_TIPO_MUSICA FOREIGN KEY (ID_TIPO_MUSICA) REFERENCES TIPOS_MUSICA );`,
		);
	});
	test("crear tabla ARTISTAS", () => {
		const result = sql
			.createTable("ARTISTAS", {
				cols: ARTISTAS,
				constraints: [
					{
						name: "PK_ARTISTAS",
						type: "primary key",
						cols: ["ID_ARTISTA"],
					},
				],
			})
			.toString();
		assert.equal(
			result,
			`CREATE TABLE ARTISTAS
 ( ID_ARTISTA INT,
 NOMBRE_ARTISTA VARCHAR(60) NOT NULL,
 LUGAR_DE_NACIMIENTO VARCHAR(60) NOT NULL DEFAULT 'Desconocido',
 CONSTRAINT PK_ARTISTAS PRIMARY KEY (ID_ARTISTA) );`,
		);
	});
	test("crear tabla CDS_ARTISTA", () => {
		const result = sql
			.createTable("CDS_ARTISTA", {
				cols: CDS_ARTISTA,
				constraints: [
					{
						name: "PK_CDS_ARTISTA",
						type: "primary key",
						cols: ["ID_ARTISTA", "ID_DISCO_COMPACTO"],
					},
					{
						name: "FK_ID_ARTISTA",
						cols: ["ID_ARTISTA"],
						foreignKey: {
							table: "ARTISTAS",
						},
					},
					{
						name: "FK_ID_DISCO_COMPACTO_02",
						cols: ["ID_DISCO_COMPACTO"],
						foreignKey: {
							table: "DISCOS_COMPACTOS",
						},
					},
				],
			})
			.toString();
		assert.equal(
			result,
			`CREATE TABLE CDS_ARTISTA
 ( ID_ARTISTA INT,
 ID_DISCO_COMPACTO INT,
 CONSTRAINT PK_CDS_ARTISTA PRIMARY KEY (ID_ARTISTA, ID_DISCO_COMPACTO),
 CONSTRAINT FK_ID_ARTISTA FOREIGN KEY (ID_ARTISTA) REFERENCES ARTISTAS,
 CONSTRAINT FK_ID_DISCO_COMPACTO_02 FOREIGN KEY (ID_DISCO_COMPACTO) REFERENCES DISCOS_COMPACTOS );`,
		);
	});

	test("Añadir una restriccion CHECK", () => {
		const result = sql
			.alterTable("DISCOS_COMPACTOS")
			.addColumn("EN_EXISTENCIA", { type: "INT", values: ["not null"] })
			.toString();
		assert.equal(
			result,
			`ALTER TABLE DISCOS_COMPACTOS
ADD COLUMN EN_EXISTENCIA INT NOT NULL;`,
		);
		const result2 = sql
			.alterTable("DISCOS_COMPACTOS")
			.addConstraint("CK_EN_EXISTENCIA", {
				check: "EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 50",
			});
		assert.equal(
			result2.toString(),
			`ALTER TABLE DISCOS_COMPACTOS
ADD CONSTRAINT CK_EN_EXISTENCIA CHECK ( EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 50 );`,
		);
	});
	test("añadir la vista CDS_EN_EXISTENCIA", () => {
		const query = `SELECT TITULO_CD, EN_EXISTENCIA
FROM DISCOS_COMPACTOS
WHERE EN_EXISTENCIA > 10`;
		const result = sql
			.createView("CDS_EN_EXISTENCIA", { as: query, check: true })
			.toString();
		assert.equal(
			result,
			`CREATE VIEW CDS_EN_EXISTENCIA AS
SELECT TITULO_CD, EN_EXISTENCIA
FROM DISCOS_COMPACTOS
WHERE EN_EXISTENCIA > 10 WITH CHECK OPTION;`,
		);
	});
	test("añade la vista EDITORES_CD", () => {
		const query = `SELECT DISCOS_COMPACTOS.TITULO_CD, DISQUERAS_CD.NOMBRE_COMPAÑIA
FROM DISCOS_COMPACTOS, DISQUERAS_CD
WHERE DISCOS_COMPACTOS.ID_DISQUERA = DISQUERAS_CD.ID_DISQUERA
AND DISQUERAS_CD.ID_DISQUERA = 5403 OR DISQUERAS_CD.ID_DISQUERA =
5402`;
		const result = sql
			.createView("EDITORES_CD", { cols: ["TITULO_CD", "EDITOR"], as: query })
			.toString();

		assert.equal(
			result,
			`CREATE VIEW EDITORES_CD
( TITULO_CD, EDITOR ) AS
SELECT DISCOS_COMPACTOS.TITULO_CD, DISQUERAS_CD.NOMBRE_COMPAÑIA
FROM DISCOS_COMPACTOS, DISQUERAS_CD
WHERE DISCOS_COMPACTOS.ID_DISQUERA = DISQUERAS_CD.ID_DISQUERA
AND DISQUERAS_CD.ID_DISQUERA = 5403 OR DISQUERAS_CD.ID_DISQUERA =
5402;`,
		);
	});
	test("volver a crear la vista EDITORES_CD sin restricciones", () => {
		const query = `SELECT DISCOS_COMPACTOS.TITULO_CD, DISQUERAS_CD.NOMBRE_COMPAÑIA
FROM DISCOS_COMPACTOS, DISQUERAS_CD
WHERE DISCOS_COMPACTOS.ID_DISQUERA = DISQUERAS_CD.ID_DISQUERA`;
		const result = sql
			.dropView("EDITORES_CD")
			.createView("EDITORES_CD", {
				cols: ["TITULO_CD", "EDITOR"],
				as: query,
			})
			.toString();

		assert.equal(
			result,
			`DROP VIEW EDITORES_CD;
CREATE VIEW EDITORES_CD
( TITULO_CD, EDITOR ) AS
SELECT DISCOS_COMPACTOS.TITULO_CD, DISQUERAS_CD.NOMBRE_COMPAÑIA
FROM DISCOS_COMPACTOS, DISQUERAS_CD
WHERE DISCOS_COMPACTOS.ID_DISQUERA = DISQUERAS_CD.ID_DISQUERA;`,
		);
	});
	test("Gestion de roles y privilegios", () => {
		let nuevoRol = sql.createRole("MRKT");
		assert(nuevoRol.toString(), "CREATE ROLE MRKT;");
		nuevoRol = sql.createRole("PERSONAL_VENTAS");
		assert(nuevoRol.toString(), "CREATE ROLE PERSONAL_VENTAS;");
		//otorga el privilegio SELECT en la vista CD_EN_EXISTENCIA
		let otorga = sql.grant("select", "CD_EN_EXISTENCIA", "public");
		assert(otorga.toString(), "GRANT SELECT ON CD_EN_EXISTENCIA TO PUBLIC;");
		/* al rol PERSONAL_VENTAS Se otorgan los privilegios SELECT, INSERT y UPDATE en la tabla DISCOS_COMPACTOS.
    Para el privilegio UPDATE se especifica la columna TITULO_CD. PERSONAL_VENTAS puede otorgar estos privilegios a otros usuarios
    */
		otorga = sql.grant(
			["SELECT", "INSERT", "UPDATE(TITULO_CD)"],
			"DISCOS_COMPACTOS",
			"PERSONAL_VENTAS",
			{ withGrant: true },
		);
		assert(
			otorga.toString(),
			`GRANT SELECT, INSERT, UPDATE(TITULO_CD) ON DISCOS_COMPACTOS
TO PERSONAL_VENTAS WITH GRANT OPTION;`,
		);
		//se otorga el rol PERSONAL_VENTAS al rol MRKT
		otorga = sql.grantRoles("PERSONAL_VENTAS", "MRKT");
		assert(otorga.toString(), "GRANT PERSONAL_VENTAS TO MRKT;");
		// El siguiente paso es revocar el privilegio SELECT que se otorgó al identificador de autorización PUBLIC;
		let revoca = sql.revoke("SELECT", "CD_EN_EXISTENCIA", "PUBLIC");
		assert(
			revoca.toString(),
			"REVOKE SELECT ON CD_EN_EXISTENCIA FROM PUBLIC CASCADE;",
		);
		/*Ahora se revocan los privilegios que se concedieron al rol PERSONAL_VENTAS. Ya que se
revocan todos los privilegios, se puede utilizar la palabra clave ALL PRIVILEGES. También
debe asegurarse de revocar cualquier privilegio dependiente; por lo tanto, se utiliza la palabra
clave CASCADE*/
		revoca = sql.revoke("ALL", "DISCOS_COMPACTOS", "PERSONAL_VENTAS");
		assert(
			revoca.toString(),
			"REVOKE ALL PRIVILEGES ON DISCOS_COMPACTOS FROM PERSONAL_VENTAS CASCADE;",
		);
		//Ahora se puede revocar el rol PERSONAL_VENTAS del rol MRKT
		revoca = sql.revokeRoles("PERSONAL_VENTAS", "MRKT");
		assert(revoca.toString(), "REVOKE PERSONAL_VENTAS FROM MRKT CASCADE;");
		//El siguiente paso es eliminar el rol MRKT.
		revoca = sql.dropRoles("MRKT");
		assert(revoca.toString(), "DROP ROLE MRKT;");
		//Finalmente, se requiere eliminar el rol PERSONAL_VENTAS..
		revoca = sql.dropRoles("PERSONAL_VENTAS");
		assert(revoca.toString(), "DROP ROLE PERSONAL_VENTAS;");
		// como una sola consulta
		const result = sql
			.createRole("MRKT")
			.createRole("PERSONAL_VENTAS")
			.grant("select", "CD_EN_EXISTENCIA", "public")
			.grant(
				["SELECT", "INSERT", "UPDATE(TITULO_CD)"],
				"DISCOS_COMPACTOS",
				"PERSONAL_VENTAS",
				{ withGrant: true },
			)
			.grantRoles("PERSONAL_VENTAS", "MRKT")
			.revoke("SELECT", "CD_EN_EXISTENCIA", "PUBLIC")
			.revoke("ALL", "DISCOS_COMPACTOS", "PERSONAL_VENTAS")
			.revokeRoles("PERSONAL_VENTAS", "MRKT")
			.dropRoles(["MRKT", "PERSONAL_VENTAS"]);
		assert(
			result.toString(),
			`CREATE ROLE MRKT;
CREATE ROLE PERSONAL_VENTAS;
GRANT ON TABLE CD_EN_EXISTENCIA
TO PUBLIC ;
GRANT SELECT, INSERT, UPDATE(TITULO_CD)
ON TABLE DISCOS_COMPACTOS WITH GRANT OPTION;
GRANT PERSONAL_VENTAS TO MRKT;
REVOKE ON TABLE CD_EN_EXISTENCIA
FROM PUBLIC CASCADE;
REVOKE ALL PRIVILEGES
ON TABLE DISCOS_COMPACTOS CASCADE;
REVOKE PERSONAL_VENTAS FROM MRKT CASCADE;
DROP ROLE MRKT;
DROP ROLE PERSONAL_VENTAS;`,
		);
	});

	test("Modificar datos SQL", () => {
		const sqlInsert = sql
			.insert("DISQUERAS_CD", [], [837, "DRG Records"])
			.insert("DISCOS_COMPACTOS", [], [116, "Ann Hampton Callaway", 836, 14])
			.insert(
				"DISCOS_COMPACTOS",
				["ID_DISCO_COMPACTO", "TITULO_CD", "ID_DISQUERA", "EN_EXISTENCIA"],
				[117, "Rhythm Country and Blues", 832, 21],
			)
			.update("DISCOS_COMPACTOS", {
				ID_DISQUERA: sql
					.select("ID_DISQUERA")
					.from("DISQUERAS_CD")
					.where(sql.eq("NOMBRE_COMPAÑIA", "DRG Records")),
			})
			.where("ID_DISCO_COMPACTO = 116");

		const sqlSelect = sql
			.select("*")
			.from("DISCOS_COMPACTOS")
			.where(
				sql.or(
					sql.eq("ID_DISCO_COMPACTO", 116),
					sql.eq("ID_DISCO_COMPACTO", 117),
				),
			)
			.delete("DISCOS_COMPACTOS")
			.where(
				sql.or(
					sql.eq("ID_DISCO_COMPACTO", 116),
					sql.eq("ID_DISCO_COMPACTO", 117),
				),
			)
			.delete("DISQUERAS_CD")
			.where(sql.eq("ID_DISQUERA", 837));

		assert.equal(
			sqlInsert.toString(),
			`INSERT INTO DISQUERAS_CD
VALUES ( 837, 'DRG Records' );
INSERT INTO DISCOS_COMPACTOS
VALUES ( 116, 'Ann Hampton Callaway', 836, 14 );
INSERT INTO DISCOS_COMPACTOS
( ID_DISCO_COMPACTO, TITULO_CD, ID_DISQUERA, EN_EXISTENCIA )
VALUES ( 117, 'Rhythm Country and Blues', 832, 21 );
UPDATE DISCOS_COMPACTOS
SET ID_DISQUERA =
( SELECT ID_DISQUERA
FROM DISQUERAS_CD
WHERE NOMBRE_COMPAÑIA = 'DRG Records' )
WHERE ID_DISCO_COMPACTO = 116;`,
		);
		assert.equal(
			sqlSelect.toString(),
			`SELECT *
FROM DISCOS_COMPACTOS
WHERE (ID_DISCO_COMPACTO = 116
OR ID_DISCO_COMPACTO = 117);
DELETE FROM DISCOS_COMPACTOS
WHERE (ID_DISCO_COMPACTO = 116
OR ID_DISCO_COMPACTO = 117);
DELETE FROM DISQUERAS_CD
WHERE ID_DISQUERA = 837;`,
		);
	});
	test("consulta de las existencias inferiores a 20 unidades", () => {
		const result = sql
			.select("*")
			.from("INVENTARIO")
			.where([
				sql.lt("EN_EXISTENCIA", 20),
				"AND",
				sql.lt("PRECIO_MENUDEO", 15),
			]);
		assert.equal(
			result.toString(),
			`SELECT *
FROM INVENTARIO
WHERE EN_EXISTENCIA < 20
AND
PRECIO_MENUDEO < 15;`,
		);
	});
	describe("Uso de predicados capitulo9", () => {
		test("se consultará la tabla TIPOS_MUSICA para arrojar los nombres de aquellas filas cuyo valor ID_TIPO sea igual a 11 o 12", () => {
			const result = sql
				.select(["ID_TIPO", "NOMBRE_TIPO"])
				.from("TIPOS_MUSICA")
				.where(sql.or(sql.eq("ID_TIPO", 11), sql.eq("ID_TIPO", 12)));

			assert.equal(
				result.toString(),
				`SELECT ID_TIPO, NOMBRE_TIPO
FROM TIPOS_MUSICA
WHERE (ID_TIPO = 11
OR ID_TIPO = 12);`,
			);
		});
		test("se consultará la tabla ARTISTAS para buscar artistas diferentes a Patsy Cline y Bing Crosby", () => {
			const result = sql
				.select(["NOMBRE_ARTISTA", "LUGAR_DE_NACIMIENTO"])
				.from("ARTISTAS")
				.where(
					sql.and(
						sql.ne("NOMBRE_ARTISTA", "Patsy Cline"),
						sql.ne("NOMBRE_ARTISTA", "Bing Crosby"),
					),
				);

			assert.equal(
				result.toString(),
				`SELECT NOMBRE_ARTISTA, LUGAR_DE_NACIMIENTO
FROM ARTISTAS
WHERE (NOMBRE_ARTISTA <> 'Patsy Cline'
AND NOMBRE_ARTISTA <> 'Bing Crosby');`,
			);
		});
		test("combinar un predicado LIKE con otro predicado LIKE", () => {
			const result = sql
				.select("*")
				.from("CDS")
				.where(
					sql.and(
						sql.notLike("TITULO_CD", "%Christmas%"),
						sql.like("TITULO_CD", "%Blue%"),
					),
				);

			assert.equal(
				result.toString(),
				`SELECT *
FROM CDS
WHERE (TITULO_CD NOT LIKE ('%Christmas%')
AND TITULO_CD LIKE ('%Blue%'));`,
			);
		});
	});
});
