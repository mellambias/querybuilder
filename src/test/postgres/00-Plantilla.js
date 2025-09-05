import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import PostgreSQL from "../../sql/PostgresSQL.js";
import { config } from "../../../config.js";
import {
	showResults,
	getResultFromTest,
	existView,
	describeTable,
	restriccionesTable,
	colsExistInTable,
	getColValuesFrom,
	checktable,
	checkRows,
} from "../utilsForTest/resultUtils.js";
import { formatDate } from "../../utils/utils.js";
import {
	TIPOS_MUSICA,
	DISQUERAS_CD,
	DISCOS_COMPACTOS,
	TIPOS_DISCO_COMPACTO,
	ARTISTAS,
	CDS_ARTISTA,
	TITULOS_CD,
} from "../models/inventario.js";
//SEPUP
const postgreSQL = config.databases.PostgreSQL;
const Driver = postgreSQL.driver;
const databaseTest = new Driver(postgreSQL.params);
const queryBuilder = new QueryBuilder(PostgreSQL, {
	typeIdentificator: "regular",
	mode: "test",
});
let qb = queryBuilder.driver(postgreSQL.driver, postgreSQL.params);
const current = { databaseTest, database: "inventario" };
// crea funciones que al ser llamadas usa como 'this' el valor pasado a 'bind'
const tableExist = checktable.bind(current);
const rowsInTableExist = checkRows.bind(current);
suite("", async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
});
