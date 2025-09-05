import { test, suite, afterEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	getResultFromTest,
	getColValuesFrom,
} from "../utilsForTest/mysqlUtils.js";

//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
const qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Capitulo 16 Transacciones", { concurrency: false }, async () => {
	afterEach(async () => {
		qb.dropQuery();
	});
	test("usar una transaccion para actualizar", async () => {
		const beforeCommand1 = await getColValuesFrom(
			databaseTest,
			"inventario",
			"DISCOS_COMPACTOS",
			"EN_EXISTENCIA",
		);
		const beforeCommand2 = await getColValuesFrom(
			databaseTest,
			"inventario",
			"COSTOS_TITULO",
			"MENUDEO",
		);

		const result = await qb
			.setTransaction({ isolation: "READ COMMITTED" })
			.add(qb.use("INVENTARIO"))
			.add(
				qb.update("DISCOS_COMPACTOS", {
					EN_EXISTENCIA: qb.exp("EN_EXISTENCIA - 1"),
				}),
			)
			.add(qb.update("COSTOS_TITULO", { MENUDEO: qb.exp("MENUDEO - 10") }))
			.start({ snapshot: true, access: "READ WRITE" });

		const afterCommand1 = await getColValuesFrom(
			databaseTest,
			"inventario",
			"DISCOS_COMPACTOS",
			"EN_EXISTENCIA",
		);
		const afterCommand2 = (
			await getColValuesFrom(
				databaseTest,
				"inventario",
				"COSTOS_TITULO",
				"MENUDEO",
			)
		).map((item) => new Number(item).toFixed(2));

		assert.deepEqual(
			afterCommand1,
			beforeCommand1.map((item) => item - 1),
			"Los valores en 'DISCOS_COMPACTOS.EN_EXISTENCIA' no se han modificado",
		);
		assert.deepEqual(
			afterCommand2,
			beforeCommand2.map((item) => Number(item - 10).toFixed(2)),
			"Los valores de 'COSTOS_TITULO.MENUDEO' no se han modificado",
		);
	});
	//fin test
	test("punto de recuperacion a la transaccion", async () => {
		const query = `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
USE INVENTARIO;
SELECT TITULO_CD, EN_EXISTENCIA
FROM DISCOS_COMPACTOS
WHERE ID_DISQUERA = 832;
SAVEPOINT SECCION_1;
UPDATE DISCOS_COMPACTOS
SET EN_EXISTENCIA = EN_EXISTENCIA + 2
WHERE ID_DISQUERA = 832;
ROLLBACK TO SAVEPOINT SECCION_1;`;

		const before = await getResultFromTest(
			databaseTest,
			"use inventario",
			`SELECT TITULO_CD, EN_EXISTENCIA
FROM DISCOS_COMPACTOS
WHERE ID_DISQUERA = 832;`,
		);

		const result = await qb
			.setTransaction({ isolation: "serializable" })
			.add(qb.use("INVENTARIO"))
			.add(
				qb
					.select(["TITULO_CD", "EN_EXISTENCIA"])
					.from("DISCOS_COMPACTOS")
					.where(qb.eq("ID_DISQUERA", 832)),
			)
			.setSavePoint("SECCION_1")
			.add(
				qb
					.update("DISCOS_COMPACTOS", {
						EN_EXISTENCIA: qb.exp("EN_EXISTENCIA + 2"),
					})
					.where(qb.eq("ID_DISQUERA", 832)),
			)
			.rollback("SECCION_1") // Invierte la actualización de datos
			.start();

		const after = await getResultFromTest(
			databaseTest,
			"use inventario",
			`SELECT TITULO_CD, EN_EXISTENCIA
FROM DISCOS_COMPACTOS
WHERE ID_DISQUERA = 832;`,
		);

		assert.equal(
			await result.toString(),
			`${query}`,
			"La transaccion generada no coincide con la esperada",
		);
		assert.deepEqual(
			before,
			after,
			"El ROLLBACK no se ha realizado correctamente",
		);
	});
	//fin test
});
