import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import {
	describeTable,
	restriccionesTable,
	checktable,
} from "../utilsForTest/resultUtils.js";
//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);
const current = { databaseTest, dataBase: "inventario" };
// crea una funcion que al ser llamada usa como 'this' el valor pasado a 'bind'
const tableExist = checktable.bind(current);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite(
	"Modifica la estructura de la tabla 'alterTable'",
	{ concurrency: false },
	async () => {
		beforeEach(async () => {
			qb = qb.use("INVENTARIO");
		});
		afterEach(async () => {
			qb.dropQuery();
		});
		test("Añadir una columna a la tabla DISCOS_COMPACTOS", async () => {
			await qb
				.alterTable("DISCOS_COMPACTOS")
				.addColumn("EN_EXISTENCIA", { type: "INT", values: ["not null"] })
				.execute();

			const cols = await describeTable(
				databaseTest,
				"inventario",
				"DISCOS_COMPACTOS",
			);
			assert.ok(
				cols.some((item) => item.Field.toUpperCase() === "EN_EXISTENCIA"),
				"El campo 'EN_EXISTENCIA' no existe",
			);
		});

		test("añade una constraint de tipo 'CHECK' al campo 'EN_EXISTENCIA'", async () => {
			await qb
				.alterTable("DISCOS_COMPACTOS")
				.addConstraint("CK_EN_EXISTENCIA", {
					check: qb.and(qb.gt("EN_EXISTENCIA", 0), qb.lt("EN_EXISTENCIA", 50)),
				})
				.execute();
			const { check } = await restriccionesTable(
				databaseTest,
				"inventario",
				"DISCOS_COMPACTOS",
			);
			const newConstraint = check.find(
				(item) => item.CONSTRAINT_NAME === "CK_EN_EXISTENCIA",
			);
			assert.equal(
				newConstraint.CHECK_CLAUSE,
				"((`EN_EXISTENCIA` > 0) and (`EN_EXISTENCIA` < 50))",
				"La constraint no existe o no coincide",
			);
		});
	},
);
