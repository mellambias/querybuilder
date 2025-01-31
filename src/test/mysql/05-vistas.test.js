import { test, after, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import { existView } from "../utilsForTest/resultUtils.js";

//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Trabajar con vistas", { concurrency: false }, async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
	test("crea la vista 'CDS_EN_EXISTENCIA'", async () => {
		const result = await qb
			.createView("CDS_EN_EXISTENCIA", {
				as: qb
					.select(["TITULO_CD", "EN_EXISTENCIA"])
					.from("DISCOS_COMPACTOS")
					.where(qb.gt("EN_EXISTENCIA", 10)),
				check: true,
			})
			.execute();

		assert.ok(
			await existView(databaseTest, "inventario", "CDS_EN_EXISTENCIA"),
			"La vista CDS_EN_EXISTENCIA no existe",
		);
	});
	test("crea la vista la vista 'EDITORES_CD'", async () => {
		const result = await qb
			.createView("EDITORES_CD", {
				cols: ["TITULO_CD", "EDITOR"],
				as: qb
					.select([
						qb.col("TITULO_CD", "DISCOS_COMPACTOS"),
						qb.col("NOMBRE_DISCOGRAFICA", "DISQUERAS_CD"),
					])
					.from(["DISCOS_COMPACTOS", "DISQUERAS_CD"])
					.where(
						qb.and(
							qb.eq(
								qb.col("ID_DISQUERA", "DISCOS_COMPACTOS"),
								qb.col("ID_DISQUERA", "DISQUERAS_CD"),
							),
							qb.or(
								qb.eq(qb.col("ID_DISQUERA", "DISQUERAS_CD"), 5403),
								qb.eq(qb.col("ID_DISQUERA", "DISQUERAS_CD"), 5402),
							),
						),
					),
			})
			.execute();

		assert.ok(
			await existView(databaseTest, "inventario", "EDITORES_CD"),
			"La vista 'EDITORES_CD' no existe ",
		);
	});

	test("volver a crear la vista 'EDITORES_CD' ahora sin restricciones", async () => {
		await qb
			.dropView("EDITORES_CD")
			.createView("EDITORES_CD", {
				cols: ["TITULO_CD", "EDITOR"],
				as: qb
					.select([
						qb.col("TITULO_CD", "DISCOS_COMPACTOS"),
						qb.col("NOMBRE_DISCOGRAFICA", "DISQUERAS_CD"),
					])
					.from(["DISCOS_COMPACTOS", "DISQUERAS_CD"])
					.where(
						qb.eq(
							qb.col("ID_DISQUERA", "DISCOS_COMPACTOS"),
							qb.col("ID_DISQUERA", "DISQUERAS_CD"),
						),
					),
			})
			.execute();
		assert.ok(
			await existView(databaseTest, "inventario", "EDITORES_CD"),
			"La nueva vista EDITORES_CD no existe",
		);
	});
});
