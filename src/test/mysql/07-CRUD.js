import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	getResultFromTest,
	getColValuesFrom,
} from "../utilsForTest/resultUtils.js";

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

suite("Manipulacion de datos CRUD", async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
	test("insertar datos en tablas 'Create'", async () => {
		await qb
			.insert("DISQUERAS_CD", [837, "DRG Records"])
			.insert("DISCOS_COMPACTOS", [116, "Ann Hampton Callaway", 837, 14])
			.insert(
				"DISCOS_COMPACTOS",
				[117, "Rhythm Country and Blues", 837, 21],
				["ID_DISCO_COMPACTO", "TITULO_CD", "ID_DISQUERA", "EN_EXISTENCIA"],
			)
			.execute();

		const rowsDISQUERAS_CD = await getColValuesFrom(
			databaseTest,
			"inventario",
			"DISQUERAS_CD",
			"ID_DISQUERA",
		);

		const rowsDISCOS_COMPACTOS = await getColValuesFrom(
			databaseTest,
			"inventario",
			"DISCOS_COMPACTOS",
			"ID_DISCO_COMPACTO",
		);

		assert.ok(
			rowsDISQUERAS_CD.includes(837),
			"El registro en DISQUERAS_CD no se ha insertado",
		);
		assert.ok(
			[116, 117].some((item) => rowsDISCOS_COMPACTOS.includes(item)),
			"El registro en DISCOS_COMPACTOS no se ha insertado",
		);
	});

	test("Actualiza datos utilizando una 'subquery'", async () => {
		await qb
			.update("DISCOS_COMPACTOS", {
				ID_DISQUERA: qb
					.select("ID_DISQUERA")
					.from("DISQUERAS_CD")
					.where(qb.eq("NOMBRE_DISCOGRAFICA", "DRG Records")),
			})
			.where("ID_DISCO_COMPACTO = 116")
			.execute();

		const [idDisquera] = await getResultFromTest(
			databaseTest,
			"USE INVENTARIO",
			`SELECT ID_DISQUERA
FROM DISQUERAS_CD
WHERE NOMBRE_DISCOGRAFICA = 'DRG Records'`,
		);
		assert.ok(idDisquera.ID_DISQUERA, "Registro no encontrado");
		const [rowUpdated] = await getResultFromTest(
			databaseTest,
			"USE INVENTARIO",
			`SELECT ID_DISQUERA
FROM DISCOS_COMPACTOS
WHERE ID_DISCO_COMPACTO = 116`,
		);
		assert.equal(
			rowUpdated.ID_DISQUERA,
			idDisquera.ID_DISQUERA,
			"El campo 'ID_DISQUERA' no se ha actualizado correctamente",
		);
	});

	test("leer datos de la tabla DISCOS_COMPACTO", async () => {
		const resolve = await qb
			.select("*")
			.from("DISCOS_COMPACTOS")
			.where(
				qb.or(qb.eq("ID_DISCO_COMPACTO", 116), qb.eq("ID_DISCO_COMPACTO", 117)),
			)
			.execute();

		const { rows } = resolve.result;
		const records = rows
			.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			})
			.map((item) => item.ID_DISCO_COMPACTO);
		assert.ok(
			[116, 117].some((item) => records.includes(item)),
			"El resultado no incluye los valores",
		);
	});

	test("borrar registros", async () => {
		await qb
			.delete("DISCOS_COMPACTOS")
			.where(
				qb.or(qb.eq("ID_DISCO_COMPACTO", 116), qb.eq("ID_DISCO_COMPACTO", 117)),
			)
			.delete("DISQUERAS_CD")
			.where(qb.eq("ID_DISQUERA", 837))
			.execute();

		const rowsDISCOS_COMPACTOS = await getColValuesFrom(
			databaseTest,
			"inventario",
			"DISCOS_COMPACTOS",
			"ID_DISCO_COMPACTO",
		);
		assert.ok(
			[116, 117].every((item) => !rowsDISCOS_COMPACTOS.includes(item)),
			"No todos los registros han sido eliminados",
		);

		const DISQUERAS_CD = await getColValuesFrom(
			databaseTest,
			"inventario",
			"DISQUERAS_CD",
			"ID_DISQUERA",
		);
		assert.ok(
			[837].every((item) => !DISQUERAS_CD.includes(item)),
			"No todos los registros han sido eliminados",
		);
	});
});
