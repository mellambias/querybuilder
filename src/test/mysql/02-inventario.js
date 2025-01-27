import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import { getResultFromTest, checktable } from "../utilsForTest/resultUtils.js";
import {
	TIPOS_MUSICA,
	DISQUERAS_CD,
	DISCOS_COMPACTOS,
	TIPOS_DISCO_COMPACTO,
	ARTISTAS,
	CDS_ARTISTA,
	TITULOS_CD,
} from "../models/inventario.js";
//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);
const current = { databaseTest, dataBase: "inventario" };
// crea una funcion que al ser llamada usa como 'this' el valor pasado a 'bind'
const tableExist = checktable.bind(current);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Base de datos INVENTARIO", async () => {
	test("Crea la base de datos 'inventario'", async () => {
		const result = await qb
			.dropDatabase("INVENTARIO")
			.createDatabase("INVENTARIO")
			.execute();
		qb.dropQuery();

		const data = await getResultFromTest(databaseTest, "show databases");
		assert.ok(
			data.some(
				(item) => Object.values(item)[0].toUpperCase() === "INVENTARIO",
			),
		);
	});
});

suite("Crea las tablas de 'inventario'", async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
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

		// existe la tabla
		await tableExist("TIPOS_MUSICA", TIPOS_MUSICA);
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

		await tableExist("DISQUERAS_CD", DISQUERAS_CD);
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

		await tableExist("DISCOS_COMPACTOS", DISCOS_COMPACTOS);
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

		await tableExist("TIPOS_DISCO_COMPACTO", TIPOS_DISCO_COMPACTO);
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
		await tableExist("ARTISTAS", ARTISTAS);
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

		await tableExist("CDS_ARTISTA", CDS_ARTISTA);
	});

	test("Crea tabla TITULOS_CD", async () => {
		const result = await qb
			.createTable("TITULOS_CD", {
				secure: true,
				cols: TITULOS_CD,
			})
			.execute();

		await tableExist("TITULOS_CD", TITULOS_CD);
	});
});
