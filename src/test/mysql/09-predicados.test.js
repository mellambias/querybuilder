import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	getResultFromTest,
	checktable,
	checkRows,
} from "../utilsForTest/resultUtils.js";
import { cds_a_la_mano, menudeo_cd, rebaja_cd } from "../models/inventario.js";
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

// Ejemplos extraidos del Capitulo 9 de libro SQL2006
suite("Uso de predicados", { concurrency: false }, async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
	test("buscar en la tabla 'TIPOS_MUSICA' el 'NOMBRE_TIPO' de aquellas filas cuyo 'ID_TIPO' sea '11' o '12'", async () => {
		const response = await qb
			.select(["ID_TIPO", "NOMBRE_TIPO"])
			.from("TIPOS_MUSICA")
			.where(qb.or(qb.eq("ID_TIPO", 11), qb.eq("ID_TIPO", 12)))
			.execute();

		// Buscamos el primer array con resultados
		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		// tiene que contener filas cuyo 'ID_TIPO' sea 11 o 12
		assert.ok(
			rows.every((item) => item.ID_TIPO === 11 || item.ID_TIPO === 12),
			"Ha devuelto valores incorrectos",
		);
	});

	test("buscar en la tabla 'ARTISTAS' artistas que no sean ni 'Patsy Cline' ni 'Bing Crosby'", async () => {
		const response = await qb
			.select(["NOMBRE_ARTISTA", "LUGAR_DE_NACIMIENTO"])
			.from("ARTISTAS")
			.where(
				qb.and(
					qb.ne("NOMBRE_ARTISTA", "Patsy Cline"),
					qb.ne("NOMBRE_ARTISTA", "Bing Crosby"),
				),
			)
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		assert.ok(
			rows.every(
				(item) =>
					item.NOMBRE_ARTISTA !== "Patsy Cline" &&
					item.NOMBRE_ARTISTA !== "Bing Crosby",
			),
			"Ha devuelto un artista incorrecto",
		);
	});
	test("combinar un predicado 'LIKE' con otro predicado 'NOT LIKE'", async () => {
		const response = await qb
			.select("*")
			.from("DISCOS_COMPACTOS")
			.where(
				qb.and(
					qb.notLike("TITULO_CD", "%Christmas%"),
					qb.like("TITULO_CD", "%Blue%"),
				),
			)
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});

		assert.ok(
			rows.every(
				(item) =>
					!item.TITULO_CD.includes("Christmas") &&
					item.TITULO_CD.includes("Blue"),
			),
		);
	});

	test("creamos la tabla 'CDS_A_LA_MANO' y añadimos registros", async () => {
		const cd_rows = [
			["Famous Blue Raincoat", 1991, 16.99, 6],
			["Blue", 1971, 14.99, 26],
			["Past Light", 1983, 15.99, 18],
			["Kojiki", 1990, 15.99, 2],
			["That Christmas Feeling", 1993, 10.99, 5],
			["Patsy Cline: 12 Greatest Hits", 1988, 16.99, 3],
			["Court and Spark", 1974, 14.99, 25],
		];

		await qb
			.dropTable("CDS_A_LA_MANO", { secure: true })
			.createTable("CDS_A_LA_MANO", { cols: cds_a_la_mano })
			.insert("CDS_A_LA_MANO", cd_rows)
			.execute();

		await tableExist("CDS_A_LA_MANO", cds_a_la_mano);
		await rowsInTableExist("CDS_A_LA_MANO", cd_rows);
	});

	// operadores
	test("operador 'igual a' para comparar los valores en la columna 'TITULO_CD'", async () => {
		const response = await qb
			.select(["TITULO_CD", "DERECHOSDEAUTOR"])
			.from("CDS_A_LA_MANO")
			.where(qb.eq("TITULO_CD", "Past Light"))
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		assert.ok(
			rows.every((item) => item.TITULO_CD === "Past Light"),
			"Ha devuelto filas erroneas",
		);
	});

	test("operador 'distinto a' para comparar los valores en la columna 'TITULO_CD' ", async () => {
		const response = await qb
			.select(["TITULO_CD", "DERECHOSDEAUTOR"])
			.from("CDS_A_LA_MANO")
			.where(qb.ne("TITULO_CD", "Past Light"))
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		assert.ok(
			rows.every((item) => item.TITULO_CD !== "Past Light"),
			"Ha devuelto filas erroneas",
		);
	});

	test("operador 'AND', 'menor que', 'mayor que' y 'no igual'", async () => {
		const response = await qb
			.select(["TITULO_CD", "INVENTARIO"])
			.from("CDS_A_LA_MANO")
			.where(
				qb.and(
					qb.gt("INVENTARIO", 2),
					qb.lt("INVENTARIO", 25),
					qb.ne("PRECIO_MENUDEO", 16.99),
				),
			)
			.execute();

		const rows = response.result.rows.reduce((_, result) => {
			if (result.length > 0) {
				return result;
			}
		});
		assert.ok(
			rows.every(
				(item) =>
					item.INVENTARIO > 2 &&
					item.INVENTARIO < 25 &&
					item.PRECIO_MENUDEO !== 16.99,
			),
			"Ha devuelto filas erroneas",
		);
	});

	test("'Menor o igual' 'Mayor o igual'", async () => {
		const response = await qb
			.select(["TITULO_CD", "DERECHOSDEAUTOR"])
			.from("CDS_A_LA_MANO")
			.where(
				qb.and(
					qb.gte("DERECHOSDEAUTOR", 1971),
					qb.lte("DERECHOSDEAUTOR", 1989),
				),
			)
			.execute();

		assert.ok(
			response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every(
					(item) =>
						item.DERECHOSDEAUTOR >= 1971 && item.DERECHOSDEAUTOR <= 1989,
				),
			"Ha devuelto filas erroneas",
		);
	});

	test("combinar dos o más predicados para formar una condición de búsqueda 'WHERE'", async () => {
		await qb
			.update("CDS_A_LA_MANO", { INVENTARIO: 3 })
			.where(
				qb.and(
					qb.eq("TITULO_CD", "That Christmas Feeling"),
					qb.eq("DERECHOSDEAUTOR", 1993),
				),
			)
			.execute();

		const data = (
			await getResultFromTest(
				databaseTest,
				"use inventario",
				"SELECT * FROM CDS_A_LA_MANO",
			)
		)
			.filter((item) => item.TITULO_CD === "That Christmas Feeling")
			.filter((item) => item.DERECHOSDEAUTOR === 1993)
			.map((item) => item.INVENTARIO);

		assert.ok(
			data.every((item) => item === 3),
			"No se han actualizado correctamente",
		);
	});

	test("especifica un rango entre 14 y 16", async () => {
		const response = await qb
			.select(["TITULO_CD", "PRECIO_MENUDEO", "INVENTARIO"])
			.from("CDS_A_LA_MANO")
			.where(
				qb.and(qb.between("PRECIO_MENUDEO", 14, 16), qb.gt("INVENTARIO", 10)),
			)
			.execute();

		assert.ok(
			response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every(
					(item) =>
						item.PRECIO_MENUDEO >= 14 &&
						item.PRECIO_MENUDEO <= 16 &&
						item.INVENTARIO > 10,
				),
			"Ha devuelto filas erroneas",
		);
	});

	test("excluye un rango entre 14 y 16", async () => {
		const response = await qb
			.select(["TITULO_CD", "PRECIO_MENUDEO"])
			.from("CDS_A_LA_MANO")
			.where(qb.notBetween("PRECIO_MENUDEO", 14, 16))
			.execute();

		assert.ok(
			response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every((item) => item.PRECIO_MENUDEO < 14 || item.PRECIO_MENUDEO > 16),
			"Ha devuelto filas erroneas",
		);
	});

	test("filas con un valor de campo nulo", async () => {
		const response = await qb
			.select("*")
			.from("ARTISTAS")
			.where(qb.isNull("LUGAR_DE_NACIMIENTO"))
			.execute();

		assert.ok(
			response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every((item) => item.LUGAR_DE_NACIMIENTO === null),
			"Ha devuelto filas erroneas",
		);
	});
	//fin test
	test("filas con un valor de campo no nulo", async () => {
		const response = await qb
			.select("*")
			.from("ARTISTAS")
			.where(qb.isNotNull("LUGAR_DE_NACIMIENTO"))
			.execute();

		assert.ok(
			response.result.rows
				.reduce((_, result) => {
					if (result.length > 0) {
						return result;
					}
				})
				.every((item) => item.LUGAR_DE_NACIMIENTO !== null),
			"Ha devuelto filas erroneas",
		);
	});

	//fin test
	test("Crea y rellena las tablas 'MENUDEO_CD' y 'REBAJA_CD'", async () => {
		const menudeo_cd_rows = [
			["Famous Blue Raincoat", 16.99, 5],
			["Blue", 14.99, 10],
			["Court and Spark", 14.99, 12],
			["Past Light", 15.99, 11],
			["Kojiki", 15.99, 4],
			["That Christmas Feeling", 10.99, 8],
			["Patsy Cline: 12 Greatest Hits", 16.99, 14],
		];
		const rebaja_cd_rows = [
			["Famous Blue Raincoat", 14.99],
			["Blue", 12.99],
			["Court and Spark", 14.99],
			["Past Light", 14.99],
			["Kojiki", 13.99],
			["That Christmas Feeling", 10.99],
			["Patsy Cline: 12 Greatest Hits", 16.99],
		];

		await qb
			.dropTable("MENUDEO_CD", { secure: true })
			.dropTable("REBAJA_CD", { secure: true })
			.createTable("MENUDEO_CD", { secure: true, cols: menudeo_cd })
			.createTable("REBAJA_CD", { secure: true, cols: rebaja_cd })
			.insert("MENUDEO_CD", menudeo_cd_rows)
			.insert("REBAJA_CD", rebaja_cd_rows)
			.execute();

		// test tabla 'MENUDEO_CD'
		await tableExist("MENUDEO_CD", menudeo_cd);
		await rowsInTableExist("MENUDEO_CD", menudeo_cd_rows);

		// test tabla 'REBAJA_CD'
		await tableExist("REBAJA_CD", rebaja_cd);
		await rowsInTableExist("REBAJA_CD", rebaja_cd_rows);
	});
	//fin test
	/**
		 * Los valores RETAIL deberán ser de filas que tengan un valor EN_EXISTENCIA mayor a 9. En
otras palabras, la consulta deberá arrojar solamente aquellos CD cuyo precio rebajado (VENTA)
sea menor que algun precio de lista (MENUDEO) en aquellos CD que haya una existencia
mayor a nueve.
		 */
	test("uso de ANY", async () => {
		//Esto significa que la condición es verdadera si al menos una comparación resulta verdadera. Equivale a un OR

		const response = await qb
			.select(["TITULO", "VENTA"])
			.from("REBAJA_CD")
			.where(
				qb.lt(
					"VENTA",
					qb.any(
						qb
							.select("MENUDEO")
							.from("MENUDEO_CD")
							.where(qb.gt("EN_EXISTENCIA", 9)),
					),
				),
			)
			.execute();

		const menudeoList = (
			await getResultFromTest(
				databaseTest,
				"use inventario",
				"SELECT MENUDEO FROM MENUDEO_CD WHERE EN_EXISTENCIA >9",
			)
		).map((item) => item.MENUDEO);

		const rows = response.result.rows
			.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			})
			.map((item) => item.VENTA);
		assert.ok(
			rows.every(
				(venta) => menudeoList.some((menudeo) => venta < menudeo),
				"A devuelto filas que no cumplen",
			),
		);
	});
	//fin test
	test("uso de SOME", async () => {
		//SOME es un sinonimo de ANY

		const response = await qb
			.select(["TITULO", "VENTA"])
			.from("REBAJA_CD")
			.where(
				qb.lt(
					"VENTA",
					qb.some(
						qb
							.select("MENUDEO")
							.from("MENUDEO_CD")
							.where(qb.gt("EN_EXISTENCIA", 9)),
					),
				),
			)
			.execute();

		const menudeoList = (
			await getResultFromTest(
				databaseTest,
				"use inventario",
				"SELECT MENUDEO FROM MENUDEO_CD WHERE EN_EXISTENCIA >9",
			)
		).map((item) => item.MENUDEO);
		const rows = response.result.rows
			.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			})
			.map((item) => item.VENTA);
		assert.ok(
			rows.every(
				(venta) => menudeoList.some((menudeo) => venta < menudeo),
				"A devuelto filas que no cumplen",
			),
		);
	});
	//fin test
	test("uso de ALL", async () => {
		//la condición es verdadera para todos los valores en una lista o subconsulta equivale a un AND

		const response = await qb
			.select(["TITULO", "VENTA"])
			.from("REBAJA_CD")
			.where(
				qb.lt(
					"VENTA",
					qb.all(
						qb
							.select("MENUDEO")
							.from("MENUDEO_CD")
							.where(qb.gt("EN_EXISTENCIA", 9)),
					),
				),
			)
			.execute();

		const menudeoList = (
			await getResultFromTest(
				databaseTest,
				"use inventario",
				"SELECT MENUDEO FROM MENUDEO_CD WHERE EN_EXISTENCIA >9",
			)
		).map((item) => item.MENUDEO);
		const rows = response.result.rows
			.reduce((_, result) => {
				if (result.length > 0) {
					return result;
				}
			})
			.map((item) => item.VENTA);
		assert.ok(
			rows.every(
				(venta) => menudeoList.every((menudeo) => venta < menudeo),
				"A devuelto filas que no cumplen",
			),
		);
	});
	//fin test
});
