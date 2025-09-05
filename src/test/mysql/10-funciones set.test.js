import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	getColValuesFrom,
	checktable,
	checkRows,
} from "../utilsForTest/mysqlUtils.js";
import { cdsVendidos } from "../models/inventario.js";
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
 ** Utilizar funciones SET
 * Utilizar funciones de Valor
 * Utilizar Expresiones de valor
 * Utilizar valores especiales
 **/

suite("uso de funciones SET capitulo 10", { concurrency: false }, async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
	/**
	 * Cada vez que se incluya una 'función set' en una instrucción SQL, cada argumento en la lista
	 * SELECT deberá ser una función set o estar incluido en un grupo
	 */

	test("crea tabla CDS_VENDIDOS", async () => {
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

		await qb
			.dropTable("CDS_VENDIDOS", { secure: true })
			.createTable("CDS_VENDIDOS", { cols: cdsVendidos, secure: true })
			.insert("CDS_VENDIDOS", cdsVendidosRows)
			.execute();

		await tableExist("CDS_VENDIDOS", cdsVendidos);
		await rowsInTableExist("CDS_VENDIDOS", cdsVendidosRows);
	});
	//fin test
	test("contar registros de una tabla", async () => {
		const response = await qb
			.select(qb.count("*", "FILAS_TOTALES"))
			.from("CDS_VENDIDOS")
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		const values = await getColValuesFrom(
			databaseTest,
			"inventario",
			"CDS_VENDIDOS",
			"NOMBRE_ARTISTA",
		);
		assert.equal(values.length, rows.map((item) => item.FILAS_TOTALES)[0]);
	});
	//fin test
	test("contar valores en una columna", async () => {
		const response = await qb
			.select(qb.count("NOMBRE_ARTISTA", "TOTAL_DE_ARTISTAS"))
			.from("CDS_VENDIDOS")
			.where(qb.gt("VENDIDOS", 20))
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		const values = (
			await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_VENDIDOS",
				"VENDIDOS",
			)
		).filter((item) => item > 20);
		assert.equal(values.length, rows.map((item) => item.TOTAL_DE_ARTISTAS)[0]);
	});
	//fin test
	test("contar valores 'unicos' en una columna", async () => {
		const response = await qb
			.select(qb.count(qb.distinct("NOMBRE_ARTISTA"), "TOTAL_DE_ARTISTAS"))
			.from("CDS_VENDIDOS")
			.where(qb.gt("VENDIDOS", 20))
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		const unique = (
			await getColValuesFrom(databaseTest, "inventario", "CDS_VENDIDOS", "*")
		)
			.filter((item) => item.VENDIDOS > 20)
			.reduce((unique, item) => {
				unique.add(item.NOMBRE_ARTISTA);
				return unique;
			}, new Set());
		assert.equal(unique.size, rows.map((item) => item.TOTAL_DE_ARTISTAS)[0]);
	});
	//fin test

	test("el valor mas alto para una columna", async () => {
		const response = await qb
			.select(["NOMBRE_ARTISTA", "NOMBRE_CD", "VENDIDOS"])
			.from("CDS_VENDIDOS")
			.where(
				qb.eq("VENDIDOS", qb.select(qb.max("VENDIDOS")).from("CDS_VENDIDOS")),
			)
			.execute();

		const valorMaximo = Math.max(
			...(await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_VENDIDOS",
				"VENDIDOS",
			)),
		);
		assert.ok(
			response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every((item) => item.VENDIDOS === valorMaximo),
			`Las filas devueltas no corresponden a lo esperado 'VENDIDOS=${valorMaximo}'`,
		);
	});
	//fin test
	test("el valor 'maximo' para una columna usando agrupacion", async () => {
		const response = await qb
			.select(["NOMBRE_ARTISTA", qb.max("VENDIDOS", "MAX_VENDIDOS")])
			.from("CDS_VENDIDOS")
			.where(qb.gt("VENDIDOS", 20))
			.groupBy("NOMBRE_ARTISTA")
			.execute();

		const expected = (
			await getColValuesFrom(databaseTest, "inventario", "CDS_VENDIDOS", "*")
		)
			.filter((item) => item.VENDIDOS > 20)
			.reduce((group, item) => {
				const row = group.find(
					(itemInGroup) => itemInGroup.NOMBRE_ARTISTA === item.NOMBRE_ARTISTA,
				);
				if (row) {
					row.MAX_VENDIDOS = Math.max(row.MAX_VENDIDOS, item.VENDIDOS);
				} else {
					group.push({
						NOMBRE_ARTISTA: item.NOMBRE_ARTISTA,
						MAX_VENDIDOS: item.VENDIDOS,
					});
				}
				return group;
			}, []);

		assert.ok(
			response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every((item) => {
					const el = expected.find(
						(row) => row.NOMBRE_ARTISTA === item.NOMBRE_ARTISTA,
					);
					if (el) {
						return el.MAX_VENDIDOS === item.MAX_VENDIDOS;
					}
					return false;
				}),
			"El resultado devuelto no es correcto",
		);

		assert.ok(
			response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			}).length === 6,
			"El número de filas devueltas debe ser 6",
		);
	});
	//fin test
	test("suma de valores de una columna usando 'GROUP BY'", async () => {
		const result = await qb
			.select(["NOMBRE_ARTISTA", qb.sum("VENDIDOS", "TOTAL_VENDIDOS")])
			.from("CDS_VENDIDOS")
			.where(qb.gt("VENDIDOS", 30))
			.groupBy("NOMBRE_ARTISTA")
			.execute();

		const data = (
			await getColValuesFrom(databaseTest, "inventario", "CDS_VENDIDOS", "*")
		)
			.filter((item) => item.VENDIDOS > 30)
			.reduce((acumulados, actual) => {
				if (acumulados[actual.NOMBRE_ARTISTA] === undefined) {
					acumulados[actual.NOMBRE_ARTISTA] = actual.VENDIDOS;
				} else {
					acumulados[actual.NOMBRE_ARTISTA] += actual.VENDIDOS;
				}
				return acumulados;
			}, {});
		assert.ok(
			result.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every((item) => data[item.NOMBRE_ARTISTA] === item.TOTAL_VENDIDOS),
			"Los valores devueltos no suman correctamente",
		);
	});
	//fin test
	test("promedio de valores de una columna usando 'GROUP BY'", async () => {
		const result = await qb
			.select(["NOMBRE_ARTISTA", qb.avg("VENDIDOS", "PROM_VENDIDOS")])
			.from("CDS_VENDIDOS")
			.where(qb.gt("VENDIDOS", 30))
			.groupBy("NOMBRE_ARTISTA")
			.execute();

		const data = (
			await getColValuesFrom(databaseTest, "inventario", "CDS_VENDIDOS", "*")
		)
			.filter((item) => item.VENDIDOS > 30)
			.reduce((acumulados, actual) => {
				if (acumulados[actual.NOMBRE_ARTISTA] === undefined) {
					acumulados[actual.NOMBRE_ARTISTA] = {
						acumulado: actual.VENDIDOS,
						inputs: 1,
						avg: actual.VENDIDOS,
					};
				} else {
					acumulados[actual.NOMBRE_ARTISTA] = {
						acumulado:
							acumulados[actual.NOMBRE_ARTISTA].acumulado + actual.VENDIDOS,
						inputs: acumulados[actual.NOMBRE_ARTISTA].inputs + 1,
						avg:
							(acumulados[actual.NOMBRE_ARTISTA].acumulado + actual.VENDIDOS) /
							(acumulados[actual.NOMBRE_ARTISTA].inputs + 1),
					};
				}
				return acumulados;
			}, {});
		assert.ok(
			result.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every((item) => data[item.NOMBRE_ARTISTA].avg === item.PROM_VENDIDOS),
			"El promedio devuelto no corresponde al calculado",
		);
	});
	//fin test
});
