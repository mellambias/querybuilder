import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	getResultFromTest,
	describeTable,
	getColValuesFrom,
	checktable,
} from "../utilsForTest/resultUtils.js";
import { INVENTARIO_CD } from "../models/inventario.js";
//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);
const current = { databaseTest, dataBase: "inventario" };
// crea funciones que al ser llamadas usa como 'this' el valor pasado a 'bind'
const tableExist = checktable.bind(current);

suite("capitulo 8 Modificar datos SQL", { concurrency: false }, async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
	test("crea la tabla 'INVENTARIO_CD'", async () => {
		await qb
			.dropTable("INVENTARIO_CD", { secure: true })
			.createTable("INVENTARIO_CD", {
				cols: INVENTARIO_CD,
				secure: true,
			})
			.execute();

		await tableExist("INVENTARIO_CD", INVENTARIO_CD);
	});

	test("inserta un registro o row en la tabla 'INVENTARIO_CD'", async () => {
		await qb
			.insert("INVENTARIO_CD", [
				"Patsy Cline: 12 Greatest Hits",
				"Country",
				"MCA Records",
				32,
			])
			.execute();

		const rowsNOMBRE_CD = await getColValuesFrom(
			databaseTest,
			"inventario",
			"INVENTARIO_CD",
			"NOMBRE_CD",
		);

		assert.ok(
			rowsNOMBRE_CD.includes("Patsy Cline: 12 Greatest Hits"),
			`El cd 'Patsy Cline: 12 Greatest Hits' no ha sido insertado ${rowsNOMBRE_CD}`,
		);
	});

	test("Insertar datos en la tabla 'INVENTARIO_CD' especificando 'columnas'", async () => {
		await qb
			.insert(
				"INVENTARIO_CD",
				["Fundamental", "Capitol Records", 34],
				["NOMBRE_CD", "EDITOR", "EN_EXISTENCIA"],
			)
			.execute();

		const rowsNOMBRE_CD = await getColValuesFrom(
			databaseTest,
			"inventario",
			"INVENTARIO_CD",
			"NOMBRE_CD",
		);
		assert.ok(
			rowsNOMBRE_CD.includes("Fundamental"),
			"El cd 'Fundamental' no ha sido insertado",
		);
	});

	test("Insertar datos en una tabla usando datos de otra tabla", async () => {
		const INVENTARIO_CD_2 = {
			NOMBRE_CD_2: { type: "varchar(60)", values: ["not null"] },
			EN_EXISTENCIA_2: { type: "int", values: ["not null"] },
		};
		await qb
			.createTable("INVENTARIO_CD_2", {
				cols: {
					NOMBRE_CD_2: { type: "varchar(60)", values: ["not null"] },
					EN_EXISTENCIA_2: { type: "int", values: ["not null"] },
				},
			})
			.insert(
				"INVENTARIO_CD_2",
				qb.select(["NOMBRE_CD", "EN_EXISTENCIA"]).from("INVENTARIO_CD"),
			)
			.execute();

		await tableExist("INVENTARIO_CD_2", INVENTARIO_CD_2);

		const nombreCdInInventarioCd = await getColValuesFrom(
			databaseTest,
			"inventario",
			"INVENTARIO_CD",
			"NOMBRE_CD",
		);
		const nombreCdInInventarioCd_2 = await getColValuesFrom(
			databaseTest,
			"inventario",
			"INVENTARIO_CD_2",
			"NOMBRE_CD_2",
		);

		assert.ok(
			nombreCdInInventarioCd_2.every((item) =>
				nombreCdInInventarioCd.includes(item),
			),
			"No se han insertado todos los registros",
		);
	});

	test("Insertar varias filas de datos en una tabla usando un Array", async () => {
		const result = await qb
			.insert("DISQUERAS_CD", [
				[927, "Private Music"],
				[928, "Reprise Records"],
				[929, "Asylum Records"],
				[930, "Windham Hill Records"],
			])
			.execute();

		const idsInTable = await getColValuesFrom(
			databaseTest,
			"inventario",
			"DISQUERAS_CD",
			"ID_DISQUERA",
		);
		assert.ok(
			[927, 928, 929, 930].every((item) => idsInTable.includes(item)),
			"Los registros no han sido insertados",
		);
	});
	// Actualizar o Modificar un valor
	test("Actualizar el valor de toda una columna", async () => {
		await qb.update("INVENTARIO_CD", { EN_EXISTENCIA: 27 }).execute();

		const enExistenciaInTable = await getColValuesFrom(
			databaseTest,
			"inventario",
			"INVENTARIO_CD",
			"EN_EXISTENCIA",
		);
		assert.ok(
			enExistenciaInTable.every((item) => item === 27),
			"los valores del campo 'EN_EXISTENCIA' debe ser 27",
		);
	});

	test("añade una columna 'CANTIDAD' a la tabla 'INVENTARIO_CD'", async () => {
		await qb.alterTable("INVENTARIO_CD").addColumn("CANTIDAD", "INT").execute();

		const tablaColumns = await describeTable(
			databaseTest,
			"inventario",
			"INVENTARIO_CD",
		);
		const column = tablaColumns.find((item) => item.Field === "CANTIDAD");
		assert.ok(column, "La columna 'CANTIDAD' no existe");
		assert.equal(column.Type, "int", "El tipo de la columna ha de ser INT");
	});

	test("Actualizar el valor de todas las columnas nombradas", async () => {
		await qb
			.update("INVENTARIO_CD", {
				EN_EXISTENCIA: "30",
				CANTIDAD: 10,
			})
			.execute();

		const dataInTable = await getColValuesFrom(
			databaseTest,
			"inventario",
			"INVENTARIO_CD",
			"*",
		);

		assert.ok(
			dataInTable.every(
				(item) => item.EN_EXISTENCIA === 30 && item.CANTIDAD === 10,
			),
			"los valores del campo 'EN_EXISTENCIA' debe ser 30 y 'CANTIDAD' debe ser 10",
		);
	});

	test("Actualizar el valor de la columna solo de algunas filas", async () => {
		await qb
			.update("INVENTARIO_CD", { EN_EXISTENCIA: 37 })
			.where([qb.eq("NOMBRE_CD", "Fundamental")])
			.execute();

		const dataInTable = (
			await getResultFromTest(
				databaseTest,
				"USE INVENTARIO",
				"SELECT * FROM INVENTARIO_CD",
			)
		).filter((item) => item.NOMBRE_CD === "Fundamental");

		assert.ok(
			dataInTable.every((item) => item.EN_EXISTENCIA === 37),
			"El valor del campo 'EN_EXISTENCIA' debe ser 37",
		);
	});

	test("Actualizar una columna usando como valor el resultado devuelto por un 'select'", async () => {
		await qb
			.update("INVENTARIO_CD_2", {
				EN_EXISTENCIA_2: qb
					.select(qb.avg("EN_EXISTENCIA"))
					.from("INVENTARIO_CD"),
			})
			.where([qb.eq("NOMBRE_CD_2", "Fundamental")])
			.execute();

		const dataInTable = (
			await getResultFromTest(
				databaseTest,
				"USE INVENTARIO",
				"SELECT * FROM INVENTARIO_CD_2",
			)
		).filter((item) => item.NOMBRE_CD_2 === "Fundamental");

		const valueInTable = (
			await getResultFromTest(
				databaseTest,
				"USE INVENTARIO",
				"SELECT AVG(EN_EXISTENCIA) FROM INVENTARIO_CD",
			)
		).map((item) => Object.values(item)[0]);

		assert.ok(
			dataInTable.every(
				(item) => item.EN_EXISTENCIA_2 === Math.ceil(valueInTable[0]),
			),
			`El valor del campo 'EN_EXISTENCIA' debe ser ${Math.ceil(valueInTable[0])}`,
		);
	});
	// Delete o eliminar registros
	test("Eliminar todas las filas de una tabla con 'DELETE FROM'", async () => {
		await qb.delete("INVENTARIO_CD_2").execute();

		const dataInTable = await getResultFromTest(
			databaseTest,
			"USE INVENTARIO",
			"SELECT * FROM INVENTARIO_CD_2",
		);
		assert.ok(
			dataInTable.length === 0,
			"La tabla 'INVENTARIO_CD_2' todavia tiene registros",
		);
	});

	test("Eliminar algunas filas de una tabla con 'DELETE' y 'WHERE'", async () => {
		await qb
			.delete("INVENTARIO_CD")
			.where(qb.eq("TIPO_MUSICA", "Country"))
			.execute();

		const dataInTable = (
			await getResultFromTest(
				databaseTest,
				"USE INVENTARIO",
				"SELECT * FROM INVENTARIO_CD",
			)
		).filter((item) => item.TIPO_MUSICA === "Country");
		assert.equal(
			dataInTable.length,
			0,
			`No se han borrado todos los registros para 'Country' queda/n ${dataInTable.length}`,
		);
	});
});
