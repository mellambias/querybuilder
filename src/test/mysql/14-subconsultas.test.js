import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	getResultFromTest,
	getColValuesFrom,
	checktable,
	checkRows,
} from "../utilsForTest/resultUtils.js";

import {
	EXISTENCIA_CD,
	ARTISTA,
	PRECIOS_MENUDEO,
	PRECIOS_VENTA,
	INVENTARIO_TITULOS,
	TIPOS_TITULO,
} from "../models/inventario.js";
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
suite(
	"Usar subconsultas para acceder y moficiar datos capitulo 12",
	{ concurrency: false },
	async () => {
		beforeEach(async () => {
			qb = qb.use("INVENTARIO");
		});
		afterEach(async () => {
			qb.dropQuery();
		});

		test("crea tabla EXISTENCIA_CD", async () => {
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

			await qb
				.dropTable("EXISTENCIA_CD", { secure: true })
				.createTable("EXISTENCIA_CD", { cols: EXISTENCIA_CD })
				.insert("EXISTENCIA_CD", existenciaCdRows)
				.execute();

			// Probar la existencia de la tabla
			await tableExist("EXISTENCIA_CD", EXISTENCIA_CD);
			await rowsInTableExist("EXISTENCIA_CD", existenciaCdRows);
		});
		//fin test
		test("crea tabla 'ARTISTAS_CD'", async () => {
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

			await qb
				.dropTable("ARTISTAS_CD", { secure: true })
				.createTable("ARTISTAS_CD", { cols: ARTISTA })
				.insert("ARTISTAS_CD", artistasCdRows)
				.execute();

			// Probar la existencia de la tabla
			await tableExist("ARTISTAS_CD", ARTISTA);
			await rowsInTableExist("ARTISTAS_CD", artistasCdRows);
		});
		//fin test
		test("el predicado 'IN' compara valores de una columna en la tabla primaria con valores arrojados por la subconsulta", async () => {
			const response = await qb
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

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const subTabla = (
				await getResultFromTest(
					databaseTest,
					"USE inventario",
					"SELECT TITULO FROM ARTISTAS_CD WHERE ARTIST_NAME = 'Joni Mitchell'",
				)
			).map((item) => item.TITULO);

			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "EXISTENCIA_CD", "*")
			).filter((item) => subTabla.includes(item.TITULO_CD));
			assert.deepEqual(actual, expect, "No coinciden los resultados");
		});
		//fin test
		/**
		 * El predicado EXISTS se evalúa como verdadero si una o más filas son arrojadas por
la subconsulta; de otra manera, se evalúa como falso.
la subconsulta asociada deberá incluir una condición de búsqueda que haga coincidir los valores en las dos tablas que están siendo vinculadas
a través de la subconsulta
		 */
		test("predicado EXISTS", async () => {
			const response = await qb
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

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const subTabla = (
				await getResultFromTest(
					databaseTest,
					"USE inventario",
					"SELECT TITULO FROM ARTISTAS_CD WHERE ARTIST_NAME = 'Joni Mitchell'",
				)
			).map((item) => item.TITULO);

			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "EXISTENCIA_CD", "*")
			).filter((item) => subTabla.includes(item.TITULO_CD));

			assert.deepEqual(actual, expect, "No coinciden los resultados");
		}); //fin test
		/**
		 * El predicado ALL comprueba si todos los valores arrojados cumplen con la condición
de búsqueda.
Cuando se utiliza un predicado de comparación cuantificado (SOME, ANY y ALL), los valores en una columna de
la tabla primaria se comparan con los valores arrojados por la subconsulta.
		 */
		test("crea tabla 'PRECIOS_MENUDEO'", async () => {
			const preciosMenudeoRows = [
				["Famous Blue Raincoat", 16.99, 5],
				["Blue", 14.99, 10],
				["Court and Spark", 14.99, 12],
				["Past Light", 15.99, 11],
				["Kojiki", 15.99, 4],
				["That Christmas Feeling", 10.99, 8],
				["Patsy Cline: 12 Greatest Hits", 16.99, 14],
			];

			await qb
				.dropTable("PRECIOS_MENUDEO", { secure: true })
				.createTable("PRECIOS_MENUDEO", { cols: PRECIOS_MENUDEO })
				.insert("PRECIOS_MENUDEO", preciosMenudeoRows)
				.execute();

			await tableExist("PRECIOS_MENUDEO", PRECIOS_MENUDEO);
			await rowsInTableExist("PRECIOS_MENUDEO", preciosMenudeoRows);
		});
		//fin test
		test("crea tabla PRECIOS_VENTA", async () => {
			const preciosVentaRows = [
				["Famous Blue Raincoat", 14.99],
				["Blue", 12.99],
				["Court and Spark", 14.99],
				["Past Light", 14.99],
				["Kojiki", 13.99],
				["That Christmas Feeling", 10.99],
				["Patsy Cline: 12 Greatest Hits", 16.99],
			];

			await qb
				.dropTable("PRECIOS_VENTA", { secure: true })
				.createTable("PRECIOS_VENTA", { cols: PRECIOS_VENTA })
				.insert("PRECIOS_VENTA", preciosVentaRows)
				.execute();

			await tableExist("PRECIOS_VENTA", PRECIOS_VENTA);
			await rowsInTableExist("PRECIOS_VENTA", preciosVentaRows);
		});
		//fin test
		test("predicado cuantificado", async () => {
			const response = await qb
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

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const subTabla = (
				await getResultFromTest(
					databaseTest,
					"USE inventario",
					`SELECT P_VENTA
FROM PRECIOS_VENTA
WHERE P_VENTA < 15.99`,
				)
			).map((item) => item.P_VENTA);

			const expect = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"PRECIOS_MENUDEO",
					"*",
				)
			)
				.filter((item) => subTabla.every((val) => item.P_MENUDEO > val))
				.map((item) => ({
					NOMBRE_CD: item.NOMBRE_CD,
					P_MENUDEO: item.P_MENUDEO,
				}));

			assert.deepEqual(actual, expect, "No coinciden los resultados");
		});
		//fin test
		test("incluir una subconsulta en la clausula SELECT", async () => {
			const response = await qb
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

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const subTabla = await getColValuesFrom(
				databaseTest,
				"inventario",
				"ARTISTAS_CD",
				"*",
			);

			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "EXISTENCIA_CD", "*")
			).map((item) => ({
				TITULO_CD: item.TITULO_CD,
				ARTIST: subTabla
					.filter((artista) => item.TITULO_CD === artista.TITULO)
					.map((item) => item.ARTIST_NAME)[0],
				EXISTENCIA: item.EXISTENCIA,
			}));

			assert.deepEqual(actual, expect, "No coinciden los resultados");
		});
		//fin test
		test("subconsultas que devuelve un solo valor", async () => {
			const response = await qb
				.select(["NOMBRE_CD", "P_MENUDEO"])
				.from("PRECIOS_MENUDEO")
				.where(
					qb.eq(
						"P_MENUDEO",
						qb.select(qb.max("P_VENTA")).from("PRECIOS_VENTA"),
					),
				)
				.execute();

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const subTabla = await getColValuesFrom(
				databaseTest,
				"inventario",
				"PRECIOS_VENTA",
				"P_VENTA",
			);

			const expect = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"PRECIOS_MENUDEO",
					"*",
				)
			)
				.filter((item) => item.P_MENUDEO === Math.max(...subTabla))
				.map((item) => ({
					NOMBRE_CD: item.NOMBRE_CD,
					P_MENUDEO: item.P_MENUDEO,
				}));

			assert.deepEqual(actual, expect, "No coinciden los resultados");
		});
		//fin test
		//Modificar datos
		test("crea tabla INVENTARIO_TITULOS", async () => {
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

			await qb
				.dropTable("INVENTARIO_TITULOS", { secure: true })
				.createTable("INVENTARIO_TITULOS", { cols: INVENTARIO_TITULOS })
				.insert("INVENTARIO_TITULOS", inventarioTituloRows)
				.execute();
			// Probar la existencia de la tabla
			await tableExist("INVENTARIO_TITULOS", INVENTARIO_TITULOS);
			await rowsInTableExist("INVENTARIO_TITULOS", inventarioTituloRows);
		});
		//fin test
		test("crea tabla TIPOS_TITULO", async () => {
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

			await qb
				.dropTable("TIPOS_TITULO", { secure: true })
				.createTable("TIPOS_TITULO", { cols: TIPOS_TITULO })
				.insert("TIPOS_TITULO", tiposTituloRows)
				.execute();

			// Probar la existencia de la tabla
			await tableExist("TIPOS_TITULO", TIPOS_TITULO);
			await rowsInTableExist("TIPOS_TITULO", tiposTituloRows);
		});
		//fin test
		test("insertar registros usando una subconsulta", async () => {
			await qb
				.insert("TIPOS_TITULO", [
					qb
						.select("TITULO")
						.from("INVENTARIO_TITULOS")
						.where(qb.eq("ID_TITULO", 108)),
					"Popular",
				])
				.execute();

			const newRow = (
				await getResultFromTest(
					databaseTest,
					"USE inventario",
					"SELECT TITULO FROM INVENTARIO_TITULOS WHERE ID_TITULO = 108",
				)
			).map((item) => [item.TITULO, "Popular"]);

			await rowsInTableExist("TIPOS_TITULO", newRow);
		});
		//fin test
		test("actualizar el valor 'Both Sides Now'", async () => {
			await qb
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

			const subTabla = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"INVENTARIO_TITULOS",
					"*",
				)
			)
				.filter((item) => item.ID_TITULO === 108)
				.map((item) => item.TITULO);

			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "TIPOS_TITULO", "*")
			)
				.filter((item) => {
					subTabla.includes(item.TITULO_CD);
				})
				.map((item) => ({
					TIPO_CD: item.TIPO_CD,
				}));

			assert.ok(
				expect.every((item) => item.TIPO_CD === "Folk"),
				"No coinciden los resultados",
			);
		});
		//fin test
		test("subconsulta en la cláusula SET para proporcionar un valor para la columna identificada", async () => {
			await qb
				.update("TIPOS_TITULO", {
					TITULO_CD: qb
						.select("TITULO")
						.from("INVENTARIO_TITULOS")
						.where(qb.eq("ID_TITULO", 108)),
				})
				.where(qb.eq("TITULO_CD", "Both Sides Now"))
				.execute();

			const subTabla = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"INVENTARIO_TITULOS",
					"*",
				)
			)
				.filter((item) => item.ID_TITULO === 108)
				.map((item) => item.TITULO);

			const expect = (
				await getColValuesFrom(databaseTest, "inventario", "TIPOS_TITULO", "*")
			).filter((item) => item.TITULO_CD === "Both Sides Now");

			assert.ok(
				expect.every((item) => item.TITULO_CD === subTabla[0]),
				"No coinciden los resultados",
			);
		});
		//fin test
		test("borra las filas de 'TIPOS_TITULO' cuyo titulo coincide con el 'TITULO' con el 'ID_TITULO=108'", async () => {
			await qb
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

			// comprobar que no existe ninguna fila que coincida con el 'TITULO' cuyo 'ID_TITULO' sea 108
			const subTabla = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"INVENTARIO_TITULOS",
					"*",
				)
			)
				.filter((item) => item.ID_TITULO === 108)
				.map((item) => item.TITULO);

			const expect = await getColValuesFrom(
				databaseTest,
				"inventario",
				"TIPOS_TITULO",
				"*",
			);

			assert.ok(
				expect.every((item) => item.TITULO_CD !== subTabla[0]),
				"No coinciden los resultados",
			);
		});
		//fin test
		test("uso de 'limit' y 'offset' para MySQL, PostgreSQL, y SQLite ", async () => {
			const response = await qb
				.select("*")
				.from("TIPOS_TITULO")
				.limit(3)
				.offset(3)
				.execute();

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const expect = await getColValuesFrom(
				databaseTest,
				"inventario",
				"TIPOS_TITULO",
				"*",
			);

			assert.ok(actual.length === 3, "Deberia devolver 3 filas");
			assert.deepEqual(
				actual,
				[expect[3], expect[4], expect[5]],
				"Los valores devueltos no son correctos",
			);
		});
		//fin test
	},
);
