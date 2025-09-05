import { test, suite } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import { getResultFromTest } from "../utilsForTest/mysqlUtils.js";
//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
const qb = queryBuilder.driver(MySql8.driver, MySql8.params);
suite(
	"Procesos de finalización de pruebas",
	{ concurrency: false },
	async () => {
		test("Elimina las bases de datos", async () => {
			await qb.dropDatabase("INVENTARIO", { secure: true }).execute();

			const resultTest = await getResultFromTest(
				databaseTest,
				"show databases",
			);
			assert.ok(
				resultTest.every((item) => !Object.values(item).includes("inventario")),
				"La base de datos 'INVENTARIO' no ha sido eliminada",
			);
		});
	},
);
