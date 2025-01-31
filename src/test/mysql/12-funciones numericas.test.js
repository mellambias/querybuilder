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
import { formatDate } from "../../utils/utils.js";
import { rastreoCd } from "../models/inventario.js";
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
 * Utilizar funciones de Valor
 ** Utilizar Expresiones de valor
 * Utilizar valores especiales
 **/

suite(
	"uso de Expresiones valor 'numericas'",
	{ concurrency: false },
	async () => {
		beforeEach(async () => {
			qb = qb.use("INVENTARIO");
		});
		afterEach(async () => {
			qb.dropQuery();
		});
		test("crea la tabla 'RASTREO_CD'", async () => {
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

			await qb
				.dropTable("RASTREO_CD", { secure: true })
				.createTable("RASTREO_CD", {
					cols: rastreoCd,
					secure: true,
				})
				.insert("RASTREO_CD", rastreoCdRows)
				.execute();

			await tableExist("RASTREO_CD", rastreoCd);
			await rowsInTableExist("RASTREO_CD", rastreoCdRows);
		});
		//fin test
		test("expresion de valor numerico", async () => {
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

			const actual = result.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.map((item) => item.TOTAL);
			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "RASTREO_CD", "*")
			)
				.filter((item) => item.EN_EXISTENCIA + item.EN_PEDIDO > 25)
				.map((item) => item.EN_EXISTENCIA + item.EN_PEDIDO);

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("expresion de valor numerico 'CASE'", async () => {
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

			const actual = result.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.map((item) => item.NUEVAS_ORDENES);
			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "RASTREO_CD", "*")
			)
				.filter((item) => item.EN_PEDIDO < 11)
				.map((item) => {
					switch (true) {
						case item.EN_PEDIDO < 6:
							return item.EN_PEDIDO + 4;
						case item.EN_PEDIDO >= 6 && item.EN_PEDIDO <= 8:
							return item.EN_PEDIDO + 2;
						default:
							return item.EN_PEDIDO;
					}
				});

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("expresion de valor numerico 'case' en un 'SET'", async () => {
			// Antes de la operacion 'update'
			const actual = (
				await getColValuesFrom(databaseTest, "inventario", "RASTREO_CD", "*")
			).map((item) => {
				switch (true) {
					case item.EN_PEDIDO < 6:
						item.EN_PEDIDO = item.EN_PEDIDO + 4;
						break;
					case item.EN_PEDIDO >= 6 && item.EN_PEDIDO <= 8:
						item.EN_PEDIDO = item.EN_PEDIDO + 2;
						break;
				}
				return item.EN_PEDIDO;
			});

			await qb
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

			const expect = await getColValuesFrom(
				databaseTest,
				"inventario",
				"RASTREO_CD",
				"EN_PEDIDO",
			);

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("utilizar la expresion 'CAST' en 'SELECT' para cambiar el tipo", async () => {
			const result = await qb
				.select([
					"DISCO_COMPACTO",
					"FECHA_VENTA",
					"CAST(FECHA_VENTA AS CHAR(25)) AS CHAR_FECHA",
				])
				.from("FECHAS_VENTAS")
				.where(qb.like("DISCO_COMPACTO", "%Blue%"))
				.execute();

			const actual = result.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.map((item) => item.CHAR_FECHA);
			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "FECHAS_VENTAS", "*")
			)
				.filter((item) => item.DISCO_COMPACTO.includes("Blue"))
				.map((item) => formatDate(item.FECHA_VENTA, "YYYY-MM-DD HH:mm:ss"));
			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
	},
);
