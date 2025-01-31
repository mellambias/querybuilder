import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	getColValuesFrom,
	checktable,
	checkRows,
} from "../utilsForTest/resultUtils.js";
import { fechasVentas } from "../models/inventario.js";
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
const rowsInTableExist = checkRows.bind(current);

/**
 * Funciones y expresiones de valor
 * Utilizar funciones SET
 ** Utilizar funciones de Valor
 * Utilizar Expresiones de valor
 * Utilizar valores especiales
 **/

suite("uso de funciones de valor", { concurrency: false }, async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
	test("crea tabla FECHAS_VENTAS", async () => {
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

		await qb
			.dropTable("FECHAS_VENTAS", { secure: true })
			.createTable("FECHAS_VENTAS", { cols: fechasVentas, secure: true })
			.insert("FECHAS_VENTAS", fechasVentasRows)
			.execute();

		await tableExist("FECHAS_VENTAS", fechasVentas);
		await rowsInTableExist("FECHAS_VENTAS", fechasVentasRows);
	});
	//fin test
	test("extrae un numero definido de caracteres con 'SUBSTRING'", async () => {
		const response = await qb
			.select([qb.substr("DISCO_COMPACTO", 1, 10, "NOMBRE_ABREVIADO")])
			.from("FECHAS_VENTAS")
			.execute();

		const actual = response.result.rows
			.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			})
			.map((item) => item.NOMBRE_ABREVIADO);
		const expect = (
			await getColValuesFrom(
				databaseTest,
				"inventario",
				"FECHAS_VENTAS",
				"DISCO_COMPACTO",
			)
		).map((item) => item.substring(0, 10));

		assert.deepEqual(actual, expect, "No son iguales");
	});
	//fin test
	test("uso de 'SUBSTRING' en la clausula 'WHERE'", async () => {
		const response = await qb
			.select(["DISCO_COMPACTO", "FECHA_VENTA"])
			.from("FECHAS_VENTAS")
			.where(qb.eq(qb.substr("DISCO_COMPACTO", 1, 4), "Blue"))
			.execute();

		const actual = response.result.rows
			.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			})
			.map((item) => item.DISCO_COMPACTO);
		const expect = (
			await getColValuesFrom(
				databaseTest,
				"inventario",
				"FECHAS_VENTAS",
				"DISCO_COMPACTO",
			)
		).filter((item) => item.substring(0, 4) === "Blue");

		assert.deepEqual(actual, expect, "No son iguales");
	});
	//fin test
	test("uso de 'UPPER' para poner el mayusculas", async () => {
		const result = await qb
			.select([qb.upper("DISCO_COMPACTO", "TITULO"), "FECHA_VENTA"])
			.from("FECHAS_VENTAS")
			.where(qb.eq(qb.substr("DISCO_COMPACTO", 1, 4), "Blue"))
			.execute();

		const actual = result.result.rows
			.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			})
			.map((item) => item.TITULO);

		const expect = (
			await getColValuesFrom(
				databaseTest,
				"inventario",
				"FECHAS_VENTAS",
				"DISCO_COMPACTO",
			)
		)
			.filter((item) => item.substring(0, 4) === "Blue")
			.map((item) => item.toUpperCase());

		assert.deepEqual(actual, expect, "No son iguales");
	});
	//fin test
});
