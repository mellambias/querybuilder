import { test, suite, after } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import PostgreSQL from "../../sql/PostgreSQL.js";
import { config } from "../../../config.js";
import { commandToGroup } from "../../comandos/subconjuntos.js";

//SETUP postgreSQL
const postgreSQL = config.databases.PostgreSQL;
const pgDriver = postgreSQL.driver;
const pgdatabaseTest = new pgDriver(postgreSQL.params);
const pgqueryBuilder = new QueryBuilder(PostgreSQL, {
	typeIdentificator: "regular",
	mode: "test",
});
const pg = pgqueryBuilder.driver(postgreSQL.driver, postgreSQL.params);

import MySQL from "../../sql/MySQL.js";

// SETUP mySQL
const MySql8 = config.databases.MySql8;
const myDriver = MySql8.driver;

const mydatabaseTest = new myDriver(MySql8.params);

const myqueryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
// añade el driver a queryBuilder
const my = myqueryBuilder.driver(MySql8.driver, MySql8.params);

suite("Prueba los resultados devueltos por los drivers", async () => {
	test("subconjuntos Devuelve el/los grupos al que pertenece un comando", async () => {
		const sql = "CREATE INDEX";
		console.log(sql, commandToGroup(sql));
	});
	test("uso de hilos para componer dos instrucciones usando una misma instancia", async () => {
		pg.thread("A1").select("*");
		pg.thread("A2").select("B").from("tablaB");
		pg.thread("A1").from("TABLA A");
		pg.thread("A2").where("predicado");

		assert.equal(
			await pg.thread("A1").toString(),
			`SELECT *
FROM TABLA A;`,
			"No coincide con la composion",
		);
		assert.equal(
			await pg.thread("A2").toString(),
			`SELECT B
FROM tablaB
WHERE predicado;`,
			"No coincide con la composion",
		);
	});
	test("Lista las bases de datos", async () => {
		const mySQLResponse = await mydatabaseTest.execute("show databases;");
		const pgSQLResponse = await pgdatabaseTest.execute(
			"SELECT datname FROM pg_database;",
		);

		console.log("============ Respuesta MySQL ============");
		console.dir(mySQLResponse.response(), { depth: null });
		// console.log("============ Respuesta Postgres ============");
		// console.dir(pgSQLResponse.response(), { depth: null });
	});
	test("Lista tablas", async () => {
		const mySQLResponse = await mydatabaseTest.execute(
			"USE testing; show tables;",
		);
		const pgSQLResponse = await pgdatabaseTest.execute(
			`USE testing; SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';`,
		);

		console.log("============ Respuesta MySQL ============");
		console.dir(mySQLResponse.response(), { depth: null });
		// console.log("============ Respuesta Postgres ============");
		// console.dir(pgSQLResponse.response(), { depth: null });
	});
	test("select", async () => {
		const mySQLResponse = await mydatabaseTest.execute(
			"use testing; select * from table_test;",
		);
		const pgSQLResponse = await pgdatabaseTest.execute(
			"SELECT datname FROM pg_database;",
		);

		console.log("============ Respuesta MySQL ============");
		const { res } = mySQLResponse.response();

		console.dir(
			res.map((item) => {
				return item.toJson({ clave: "ID", col: "Columna_2" });
			}),
			{
				depth: null,
			},
		);
		// console.log("============ Respuesta Postgres ============");
		// console.dir(pgSQLResponse.response(), { depth: null });
	});
});
