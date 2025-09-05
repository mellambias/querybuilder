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
import {
	inventarioCD,
	interpretes,
	tipoInterprete,
	empleados,
	TITULOS_EN_EXISTENCIA,
	COSTOS_TITULO,
	TITULO_CDS,
	ARTISTAS_TITULOS,
	ARTISTAS_CD,
	INFO_CD,
	TIPO_CD,
	CDS_CONTINUADOS,
	CDS_DESCONTINUADOS,
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
	"Capitulo 11 Acceso a multiples tablas",
	{ concurrency: false },
	async () => {
		beforeEach(async () => {
			qb = qb.use("INVENTARIO");
		});
		afterEach(async () => {
			qb.dropQuery();
		});
		test("crea la tabla INVENTARIO_CD", async () => {
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

			await qb
				.dropTable("INVENTARIO_CD", { secure: true })
				.createTable("INVENTARIO_CD", { cols: inventarioCD })
				.insert("INVENTARIO_CD", inventarioCDRows)
				.execute();

			// Probar la existencia de la tabla
			await tableExist("INVENTARIO_CD", inventarioCD);
			await rowsInTableExist("INVENTARIO_CD", inventarioCDRows);
		});
		//fin test
		test("crea la tabla INTERPRETES", async () => {
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

			await qb
				.dropTable("INTERPRETES", { secure: true })
				.createTable("INTERPRETES", { cols: interpretes })
				.insert("INTERPRETES", interpretesRows)
				.execute();

			await tableExist("INTERPRETES", interpretes);
			await rowsInTableExist("INTERPRETES", interpretesRows);
		});
		//fin test
		test("crea la tabla TIPO_INTER", async () => {
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

			await qb
				.dropTable("TIPO_INTER", { secure: true })
				.createTable("TIPO_INTER", { cols: tipoInterprete })
				.insert("TIPO_INTER", tipoInterpreteRows)
				.execute();

			await tableExist("TIPO_INTER", tipoInterprete);
			await rowsInTableExist("TIPO_INTER", tipoInterpreteRows);
		});
		//fin test

		test("operciones basicas JOIN", async () => {
			const response = await qb
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

			const actual = response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.map((item) => ({
					NOMBRE_CD: item.NOMBRE_CD,
					NOMBRE_INTER: item.NOMBRE_INTER,
					EN_EXISTENCIA: item.EN_EXISTENCIA,
				}));

			const tablaA = (
				await getColValuesFrom(databaseTest, "inventario", "INVENTARIO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`INVENTARIO_CD_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = (
				await getColValuesFrom(databaseTest, "inventario", "INTERPRETES", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`INTERPRETES_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			const expect = tablaB
				.reduce((joinTables, itemB) => {
					for (const itemA of tablaA) {
						joinTables.push({ ...itemB, ...itemA });
					}
					return joinTables;
				}, [])
				.filter(
					(item) =>
						item.INVENTARIO_CD_ID_INTER === item.INTERPRETES_ID_INTER &&
						item.INVENTARIO_CD_EN_EXISTENCIA < 15,
				)
				.map((item) => ({
					NOMBRE_CD: item.INVENTARIO_CD_NOMBRE_CD,
					NOMBRE_INTER: item.INTERPRETES_NOMBRE_INTER,
					EN_EXISTENCIA: item.INVENTARIO_CD_EN_EXISTENCIA,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("uso de nombres de correlacion", async () => {
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

			// Probar los resultados
			const actual = result.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaC = (
				await getColValuesFrom(databaseTest, "inventario", "INVENTARIO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`c_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaP = (
				await getColValuesFrom(databaseTest, "inventario", "INTERPRETES", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`p_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'join' (reduce), aplica el 'WHERE' (filter) y el 'SELECT' (map)
			const expect = tablaP
				.reduce((joinTables, itemP) => {
					for (const itemC of tablaC) {
						joinTables.push({ ...itemP, ...itemC });
					}
					return joinTables;
				}, [])
				.filter(
					(item) =>
						item.c_ID_INTER === item.p_ID_INTER && item.c_EN_EXISTENCIA < 15,
				)
				.map((item) => ({
					NOMBRE_CD: item.c_NOMBRE_CD,
					NOMBRE_INTER: item.p_NOMBRE_INTER,
					EN_EXISTENCIA: item.c_EN_EXISTENCIA,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("JOIN con mas de dos tablas", async () => {
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
						qb.eq("t.NOMBRE_TIPO", "Popular"),
					),
				)
				.execute();

			const actual = result.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaC = (
				await getColValuesFrom(databaseTest, "inventario", "INVENTARIO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`c_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaP = (
				await getColValuesFrom(databaseTest, "inventario", "INTERPRETES", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`p_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaT = (
				await getColValuesFrom(databaseTest, "inventario", "TIPO_INTER", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`t_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'join' (reduce), aplica el 'WHERE' (filter) y el 'SELECT' (map)
			const expect = tablaT
				.reduce((joinTables, itemT) => {
					for (const itemC of tablaC) {
						for (const itemP of tablaP) {
							joinTables.push({ ...itemT, ...itemC, ...itemP });
						}
					}
					return joinTables;
				}, [])
				.filter(
					(item) =>
						item.c_ID_INTER === item.p_ID_INTER &&
						item.p_ID_TIPO === item.t_ID_TIPO &&
						item.t_NOMBRE_TIPO === "Popular",
				)
				.map((item) => ({
					NOMBRE_CD: item.c_NOMBRE_CD,
					NOMBRE_INTER: item.p_NOMBRE_INTER,
					NOMBRE_TIPO: item.t_NOMBRE_TIPO,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("operacion CROSS JOIN", async () => {
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

			const actual = result.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaC = (
				await getColValuesFrom(databaseTest, "inventario", "INVENTARIO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`c_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaP = (
				await getColValuesFrom(databaseTest, "inventario", "INTERPRETES", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`p_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'join' (reduce), aplica el 'WHERE' (filter) y el 'SELECT' (map)
			const expect = tablaP
				.reduce((joinTables, itemP) => {
					for (const itemC of tablaC) {
						joinTables.push({ ...itemP, ...itemC });
					}
					return joinTables;
				}, [])
				.filter(
					(item) =>
						item.c_ID_INTER === item.p_ID_INTER && item.c_EN_EXISTENCIA < 15,
				)
				.map((item) => ({
					NOMBRE_CD: item.c_NOMBRE_CD,
					NOMBRE_INTER: item.p_NOMBRE_INTER,
					EN_EXISTENCIA: item.c_EN_EXISTENCIA,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("crea tabla 'EMPLEADOS'", async () => {
			const empleadosRows = [
				[101, "Ms. Smith", qb.exp("null")],
				[102, "Mr. Jones", 101],
				[103, "Mr. Roberts", 101],
				[104, "Ms. Hanson", 103],
				[105, "Mr. Fields", 102],
				[106, "Ms. Lee", 102],
				[107, "Mr. Carver", 103],
			];

			await qb
				.dropTable("EMPLEADOS", { secure: true })
				.createTable("EMPLEADOS", { cols: empleados, secure: true })
				.insert("EMPLEADOS", empleadosRows)
				.execute();

			await tableExist("EMPLEADOS", empleados);
			await rowsInTableExist("EMPLEADOS", empleadosRows);
		});
		//fin test
		test("operacion SELF JOIN", async () => {
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

			// Probar los resultados
			const actual = result.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo 'FROM'
			const empleados = await getColValuesFrom(
				databaseTest,
				"inventario",
				"EMPLEADOS",
				"*",
			);
			const tablaA = empleados.map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`a_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = empleados.map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`b_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'JOIN' (reduce), aplica el 'WHERE' (filter), el 'ORDER BY' (sort) y el 'SELECT' (map)
			const expect = tablaB
				.reduce((joinTables, itemB) => {
					for (const itemA of tablaA) {
						joinTables.push({ ...itemB, ...itemA });
					}
					return joinTables;
				}, [])
				.filter((item) => item.a_ADMIN === item.b_ID_EMP)
				.sort((a, b) => a.a_ID_EMP - b.a_ID_EMP)
				.map((item) => ({
					ID_EMP: item.a_ID_EMP,
					NOMBRE_EMP: item.a_NOMBRE_EMP,
					ADMINISTRADOR: item.b_NOMBRE_EMP,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("Crea tablas TITULOS_EN_EXISTENCIA y COSTOS_TITULOS", async () => {
			const result = await qb
				.dropTable("TITULOS_EN_EXISTENCIA", { secure: true })
				.dropTable("COSTOS_TITULO", { secure: true })
				.createTable("TITULOS_EN_EXISTENCIA", {
					secure: true,
					cols: TITULOS_EN_EXISTENCIA,
				})
				.createTable("COSTOS_TITULO", {
					secure: true,
					cols: COSTOS_TITULO,
				})
				.execute();

			// Probar la existencia de las tablas
			await tableExist("TITULOS_EN_EXISTENCIA", TITULOS_EN_EXISTENCIA);
			await tableExist("COSTOS_TITULO", COSTOS_TITULO);
		});
		test("añade registros a las tablas 'TITULOS_EN_EXISTENCIA' y 'COSTOS_TITULO'", async () => {
			const titulos = [
				["Famous Blue Raincoat", "Folk", 12],
				["Blue", "Popular", 24],
				["Past Light", "New Age", 9],
				["Luck of the Draw", "Popular", 19],
				["Deuces Wild", "Blues", 25],
				["Nick of Time", "Popular", 17],
				["Blues on the Bayou", "Blues", 11],
				["Both Sides Now", "Popular", 13],
			];

			const costes = [
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

			await qb
				.insert("TITULOS_EN_EXISTENCIA", titulos)
				.insert("COSTOS_TITULO", costes)
				.execute();

			await rowsInTableExist("TITULOS_EN_EXISTENCIA", titulos);
			await rowsInTableExist("COSTOS_TITULO", costes);
		});
		//fin test
		test("join natural hace coincidir automáticamente las filas de aquellas columnas con el mismo nombre", async () => {
			const response = await qb
				.select(["TITULO_CD", "TIPO_CD", qb.col("MENUDEO").from("c")])
				.naturalJoin(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
				.where(qb.gt(qb.col("INVENTARIO").from("s"), 15))
				.execute();

			// Probar los resultados
			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaA = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"TITULOS_EN_EXISTENCIA",
					"*",
				)
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`s_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = (
				await getColValuesFrom(databaseTest, "inventario", "COSTOS_TITULO", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`c_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'natural join' (reduce + 1er filter), aplica el 'WHERE' (2d filter) y el 'SELECT' (map)
			const expect = tablaB
				.reduce((joinTables, itemB) => {
					for (const itemA of tablaA) {
						joinTables.push({ ...itemB, ...itemA });
					}
					return joinTables;
				}, [])
				.filter(
					(item) =>
						item.s_TITULO_CD === item.c_TITULO_CD &&
						item.s_TIPO_CD === item.c_TIPO_CD,
				)
				.filter((item) => item.s_INVENTARIO > 15)
				.map((item) => ({
					TITULO_CD: item.s_TITULO_CD,
					TIPO_CD: item.s_TIPO_CD,
					MENUDEO: item.c_MENUDEO,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("join natural de columna nombrada permite especificar las columnas coincidentes", async () => {
			//las columnas identificadas en la cláusula USING están sin cualificar el resto debe hacerlo

			const response = await qb
				.select([
					"TITULO_CD",
					qb.col("TIPO_CD", "s"),
					qb.col("MENUDEO").from("c"),
				])
				.join(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
				.using("TITULO_CD")
				.where(qb.gt(qb.col("INVENTARIO").from("s"), 15))
				.execute();

			// Probar los resultados
			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaA = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"TITULOS_EN_EXISTENCIA",
					"*",
				)
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`s_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = (
				await getColValuesFrom(databaseTest, "inventario", "COSTOS_TITULO", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`c_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'natural join' (reduce + 1er filter), aplica el 'WHERE' (2d filter) y el 'SELECT' (map)
			const expect = tablaB
				.reduce((joinTables, itemB) => {
					for (const itemA of tablaA) {
						joinTables.push({ ...itemB, ...itemA });
					}
					return joinTables;
				}, [])
				.filter((item) => item.s_TITULO_CD === item.c_TITULO_CD)
				.filter((item) => item.s_INVENTARIO > 15)
				.map((item) => ({
					TITULO_CD: item.s_TITULO_CD,
					TIPO_CD: item.s_TIPO_CD,
					MENUDEO: item.c_MENUDEO,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		/*
		El join de condición realiza un método diferente a cualquiera
		la condición equi-join está definida en la cláusula 'ON'
		que funciona de manera muy similar a la cláusula 'WHERE'

		tipos de uniones: 'inner joins' y 'outer joins'.
				*/
		test("tablas 'TITULO_CDS', 'ARTISTAS_TITULOS' y 'ARTISTAS_CD'", async () => {
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

			// Probar la existencia de la tabla

			await tableExist("TITULO_CDS", TITULO_CDS);
			await tableExist("ARTISTAS_TITULOS", ARTISTAS_TITULOS);
			await tableExist("ARTISTAS_CD", ARTISTAS_CD);
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

			const result = await qb.insert("TITULO_CDS", TITULO_CDS).execute();

			// Comprobar si los valores han sido insertados
			await rowsInTableExist("TITULO_CDS", TITULO_CDS);
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

			await qb.insert("ARTISTAS_TITULOS", ARTISTAS_TITULOS).execute();

			// Comprobar si los valores han sido insertados
			await rowsInTableExist("ARTISTAS_TITULOS", ARTISTAS_TITULOS);
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

			await qb.insert("ARTISTAS_CD", ARTISTAS_CD).execute();

			// Comprobar si los valores han sido insertados
			await rowsInTableExist("ARTISTAS_CD", ARTISTAS_CD);
		});
		//fin test

		test("unir las tablas 'TITULO_CDS', 'ARTISTAS_TITULOS' y 'ARTISTAS_CD' usando dos 'INNER JOIN'", async () => {
			const response = await qb
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

			// Probar los resultados
			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaA = (
				await getColValuesFrom(databaseTest, "inventario", "TITULO_CDS", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`t_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = (
				await getColValuesFrom(
					databaseTest,
					"inventario",
					"ARTISTAS_TITULOS",
					"*",
				)
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`ta_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaC = (
				await getColValuesFrom(databaseTest, "inventario", "ARTISTAS_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`a_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			// realiza el 'inner join' (reduce) 'on' (1er filter), 'inner join' (reduce)'on' (2d filter) aplica el 'WHERE' (3r filter) y el 'SELECT' (map)
			const expect = tablaB
				.reduce((joinTables, itemB) => {
					for (const itemA of tablaA) {
						joinTables.push({ ...itemB, ...itemA });
					}
					return joinTables;
				}, [])
				.filter((item) => item.t_ID_TITULO === item.ta_ID_TITULO)
				.reduce((joinTables, item) => {
					for (const itemC of tablaC) {
						joinTables.push({ ...item, ...itemC });
					}
					return joinTables;
				}, [])
				.filter((item) => item.ta_ID_ARTISTA === item.a_ID_ARTISTA)
				.filter((item) => item.t_TITULO.includes("Blue"))
				.map((item) => ({
					TITULO: item.t_TITULO,
					ARTISTA: item.a_ARTISTA,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("crea tablas 'INFO_CD' y 'TIPO_CD'", async () => {
			const result = await qb
				.createTable("INFO_CD", { cols: INFO_CD })
				.createTable("TIPO_CD", { cols: TIPO_CD })
				.execute();

			await tableExist("INFO_CD", INFO_CD);
			await tableExist("TIPO_CD", TIPO_CD);
		});
		//fin test
		test("añadir registros a 'INFO_CD'", async () => {
			const INFO_CD = [
				["Famous Blue Raincoat", "FROK", 19],
				["Blue", "CPOP", 28],
				["Past Light", "NEWA", 6],
				["Out of Africa", "STRK", 8],
				["Fundamental", "NPOP", 10],
				["Blues on the Bayou", "BLUS", 11],
			];

			await qb.insert("INFO_CD", INFO_CD).execute();
			await rowsInTableExist("INFO_CD", INFO_CD);
		});
		//fin test
		test("añadir registros a 'TIPO_CD'", async () => {
			const TIPO_CD = [
				["FROK", "Folk Rock"],
				["CPOP", "Classic Pop"],
				["NEWA", "New Age"],
				["CTRY", "Country"],
				["STRK", "Soundtrack"],
				["BLUS", "Blues"],
				["JAZZ", "Jazz"],
			];

			await qb.insert("TIPO_CD", TIPO_CD).execute();

			await rowsInTableExist("TIPO_CD", TIPO_CD);
		});
		//fin test
		test("operación 'join' sobre dos tablas", async () => {
			const $ = qb;

			const result = await qb
				.select([
					$.col("TITULO").from("i"),
					$.col("NOMBRE_TIPO").from("t"),
					$.col("EXISTENCIA", "i"),
				])
				.join(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on($.eq($.col("ID_TIPO", "i"), $.col("ID_TIPO", "t")))
				.execute();

			// Probar los resultados
			const actual = result.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaA = (
				await getColValuesFrom(databaseTest, "inventario", "INFO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`i_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = (
				await getColValuesFrom(databaseTest, "inventario", "TIPO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`t_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'inner join' (reduce) 'on' (filter), el 'SELECT' (map)
			const expect = tablaB
				.reduce((joinTables, itemB) => {
					for (const itemA of tablaA) {
						joinTables.push({ ...itemB, ...itemA });
					}
					return joinTables;
				}, [])
				.filter((item) => item.i_ID_TIPO === item.t_ID_TIPO)
				.map((item) => ({
					TITULO: item.i_TITULO,
					NOMBRE_TIPO: item.t_NOMBRE_TIPO,
					EXISTENCIA: item.i_EXISTENCIA,
				}));

			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("mostrar la tabla 'INFO_CD' y las coincidencias con 'TIPO_CD' 'LEFT OUTER JOIN'", async () => {
			const $ = qb;

			const result = await qb
				.select([
					$.col("TITULO").from("i"),
					$.col("NOMBRE_TIPO").from("t"),
					$.col("EXISTENCIA", "i"),
				])
				.leftJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on($.eq($.col("ID_TIPO", "i"), $.col("ID_TIPO", "t")))
				.execute();

			// Probar los resultados
			const actual = result.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaA = (
				await getColValuesFrom(databaseTest, "inventario", "INFO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`i_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = (
				await getColValuesFrom(databaseTest, "inventario", "TIPO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`t_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'left outer join' (reduce) 'on' (filter), el 'SELECT' (map)
			const nullItemB = Object.keys(tablaB[0]).reduce((nullItem, key) => {
				nullItem[key] = null;
				return nullItem;
			}, {});
			const expect = tablaA
				.reduce((leftOuterJoin, itemA) => {
					const items = tablaB.filter(
						(item) => itemA.i_ID_TIPO === item.t_ID_TIPO,
					);
					if (items.length > 0) {
						for (const itemB of items) {
							leftOuterJoin.push({ ...itemA, ...itemB });
						}
					} else {
						leftOuterJoin.push({ ...itemA, ...nullItemB });
					}

					return leftOuterJoin;
				}, [])
				.map((item) => ({
					TITULO: item.i_TITULO,
					NOMBRE_TIPO: item.t_NOMBRE_TIPO,
					EXISTENCIA: item.i_EXISTENCIA,
				}));
			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("mostrar la tabla 'TIPO_CD' y las coincidencias con 'INFO_CD' 'RIGHT OUTER JOIN'", async () => {
			const $ = qb;

			const result = await qb
				.select([
					$.col("NOMBRE_TIPO").from("t"),
					$.col("TITULO").from("i"),
					$.col("EXISTENCIA", "i"),
				])
				.rightJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
				.on($.eq($.col("ID_TIPO", "i"), $.col("ID_TIPO", "t")))
				.execute();

			// Probar los resultados
			const actual = result.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			//lee las filas de la tabla y modifica el nombre del campo con el prefijo
			const tablaA = (
				await getColValuesFrom(databaseTest, "inventario", "INFO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`i_${key}`] = item[key];
					return newItem;
				}, {}),
			);
			const tablaB = (
				await getColValuesFrom(databaseTest, "inventario", "TIPO_CD", "*")
			).map((item) =>
				Object.keys(item).reduce((newItem, key) => {
					newItem[`t_${key}`] = item[key];
					return newItem;
				}, {}),
			);

			// realiza el 'RIGHT OUTER JOIN' (reduce) 'on' (filter), el 'SELECT' (map)
			const nullItemA = Object.keys(tablaA[0]).reduce((nullItem, key) => {
				nullItem[key] = null;
				return nullItem;
			}, {});
			const expect = tablaB
				.reduce((rightOutenJoin, itemB) => {
					const items = tablaA.filter(
						(item) => itemB.t_ID_TIPO === item.i_ID_TIPO,
					);
					if (items.length > 0) {
						for (const itemA of items) {
							rightOutenJoin.push({ ...itemA, ...itemB });
						}
					} else {
						rightOutenJoin.push({ ...nullItemA, ...itemB });
					}

					return rightOutenJoin;
				}, [])
				.map((item) => ({
					NOMBRE_TIPO: item.t_NOMBRE_TIPO,
					TITULO: item.i_TITULO,
					EXISTENCIA: item.i_EXISTENCIA,
				}));
			assert.deepEqual(actual, expect, "No son iguales");
		});
		//fin test
		test("todas las filas 'full outer join' no soportado en el SGBD", async () => {
			//En MySQL no existe una sintaxis especifica, se utiliza LEFT JOIN UNION RIGTH JOIN
		});
		//fin test
		test("crea tablas CDS_CONTINUADOS y CDS_DESCONTINUADOS", async () => {
			const result = await qb
				.dropTable("CDS_CONTINUADOS", { secure: true })
				.dropTable("CDS_DESCONTINUADOS", { secure: true })
				.createTable("CDS_CONTINUADOS", {
					cols: CDS_CONTINUADOS,
				})
				.createTable("CDS_DESCONTINUADOS", {
					cols: CDS_DESCONTINUADOS,
				})
				.execute();

			await tableExist("CDS_CONTINUADOS", CDS_CONTINUADOS);
			await tableExist("CDS_DESCONTINUADOS", CDS_DESCONTINUADOS);
		});
		//fin test
		test("añade registros a 'CDS_CONTINUADOS'", async () => {
			const CDS_CONTINUADOS = [
				["Famous Blue Raincoat", "FROK", 19],
				["Blue", "CPOP", 28],
				["Past Light", "NEWA", 6],
				["Out of Africa", "STRK", 8],
				["Fundamental", "NPOP", 10],
				["Blues on the Bayou", "BLUS", 11],
				["Leonard Cohen The Best of", "FROK", 3],
				["Orlando", "STRK", 1],
			];

			await qb.insert("CDS_CONTINUADOS", CDS_CONTINUADOS).execute();

			await rowsInTableExist("CDS_CONTINUADOS", CDS_CONTINUADOS);
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

			await qb.insert("CDS_DESCONTINUADOS", CDS_DESCONTINUADOS).execute();

			await rowsInTableExist("CDS_DESCONTINUADOS", CDS_DESCONTINUADOS);
		});
		//fin test
		test("combinar instrucciones 'SELECT' en una sola que combine la informacion, omite duplicados", async () => {
			const response = await qb
				.union(
					qb.select("*").from("CDS_CONTINUADOS"),
					qb.select("*").from("CDS_DESCONTINUADOS"),
				)
				.execute();

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			const tablaA = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_CONTINUADOS",
				"*",
			);
			const tablaB = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_DESCONTINUADOS",
				"*",
			);
			for (const itemB of tablaB) {
				if (!tablaA.find((item) => item.NOMBRE_CD === itemB.NOMBRE_CD)) {
					tablaA.push(itemB);
				}
			}

			assert.deepEqual(actual, tablaA);
		});
		//fin test
		test("combinar instrucciones 'SELECT' en una sola que combine la informacion, incluye duplicados", async () => {
			const response = await qb
				.unionAll(
					qb.select("*").from("CDS_CONTINUADOS"),
					qb.select("*").from("CDS_DESCONTINUADOS"),
				)
				.execute();

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});
			const tablaA = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_CONTINUADOS",
				"*",
			);
			const tablaB = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_DESCONTINUADOS",
				"*",
			);
			for (const itemB of tablaB) {
				tablaA.push(itemB);
			}
			assert.deepEqual(actual, tablaA);
		});
		//fin test

		test("combinar solo aquellas filas que los bloques tengan en comun, omite duplicados", async () => {
			const response = await qb
				.intersect(
					qb.select("*").from("CDS_CONTINUADOS"),
					qb.select("*").from("CDS_DESCONTINUADOS"),
				)
				.execute();

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const tablaA = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_CONTINUADOS",
				"*",
			);
			const tablaB = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_DESCONTINUADOS",
				"*",
			);
			const expect = [];
			for (const itemA of tablaA) {
				if (tablaB.find((item) => itemA.NOMBRE_CD === item.NOMBRE_CD)) {
					expect.push(itemA);
				}
			}
			for (const itemB of tablaB) {
				if (!tablaA.find((item) => itemB.NOMBRE_CD === item.NOMBRE_CD)) {
					if (expect.find((item) => itemB.NOMBRE_CD === item.NOMBRE_CD)) {
						expect.push(itemB);
					}
				}
			}
			assert.deepEqual(actual, expect);
		});
		//Fin
		test("limita el resultado del primer bloque a las filas que no esten en el segundo", async () => {
			const response = await qb
				.except(
					qb.select("*").from("CDS_CONTINUADOS"),
					qb.select("*").from("CDS_DESCONTINUADOS"),
				)
				.execute();

			const actual = response.result.rows.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			});

			const tablaA = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_CONTINUADOS",
				"*",
			);
			const tablaB = await getColValuesFrom(
				databaseTest,
				"inventario",
				"CDS_DESCONTINUADOS",
				"*",
			);
			const expect = [];
			for (const itemA of tablaA) {
				if (!tablaB.find((item) => itemA.NOMBRE_CD === item.NOMBRE_CD)) {
					expect.push(itemA);
				}
			}
			assert.deepEqual(actual, expect);
		});
	},
);
