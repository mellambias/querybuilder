import { test, after, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import { getResultFromTest } from "../utilsForTest/resultUtils.js";

//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);
const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Roles", { concurrency: false }, async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});
	test("crear un rol", async () => {
		await qb
			.createRoles(["ADMIN", "USER"], {
				secure: true,
				host: "localhost",
			})
			.execute();

		const users = await getResultFromTest(
			databaseTest,
			"USE INVENTARIO",
			"select USER, HOST FROM mysql.user WHERE HOST='localhost'",
		);
		assert.ok(
			users.some((user) => user.USER === "ADMIN"),
			"El rol/usuario ADMIN no ha sido creado",
		);
		assert.ok(
			users.some((user) => user.USER === "USER"),
			"El rol/usuario USER no ha sido creado",
		);
	});

	test("Gestion de roles y privilegios", async () => {
		await qb
			.createRoles("MRKT", {
				secure: true,
				host: "localhost",
			})
			.createRoles("PERSONAL_VENTAS", { secure: true })
			.execute();

		const users = await getResultFromTest(
			databaseTest,
			"USE INVENTARIO",
			"select USER, HOST FROM mysql.user",
		);
		assert.ok(
			users.some((user) => user.USER === "MRKT"),
			"El rol/usuario MRKT no ha sido creado",
		);
		assert.ok(
			users.some((user) => user.USER === "PERSONAL_VENTAS"),
			"El rol/usuario PERSONAL_VENTAS no ha sido creado",
		);
	});

	test("otorga el privilegio 'SELECT' en la vista 'CDS_EN_EXISTENCIA' a 'PERSONAL_VENTAS'", async () => {
		await qb
			.grant("select", "CDS_EN_EXISTENCIA", ["PERSONAL_VENTAS"])
			.execute();

		const data = await getResultFromTest(
			databaseTest,
			`SELECT GRANTEE, TABLE_NAME, PRIVILEGE_TYPE 
FROM information_schema.TABLE_PRIVILEGES
WHERE  TABLE_SCHEMA = 'inventario'
AND TABLE_NAME = 'CDS_EN_EXISTENCIA'`,
		);
		const grant = data.find((item) => item.TABLE_NAME === "cds_en_existencia");
		assert.ok(
			grant.PRIVILEGE_TYPE === "SELECT",
			"El privilegio no ha sido otorgado",
		);
		assert.ok(
			grant.GRANTEE === "'PERSONAL_VENTAS'@'%'",
			"El privilegio no ha sido otorgado al 'PERSONAL_VENTAS'@'%'",
		);
	});
	test("al rol PERSONAL_VENTAS Se otorgan los privilegios SELECT, INSERT y UPDATE (sobre columna) en la tabla DISCOS_COMPACTOS", async () => {
		/* al rol PERSONAL_VENTAS Se otorgan los privilegios SELECT, INSERT y UPDATE en la tabla DISCOS_COMPACTOS.
		Para el privilegio UPDATE se especifica la columna TITULO_CD.
		 PERSONAL_VENTAS puede otorgar estos privilegios a otros usuarios
		*/
		const otorga = await qb
			.grant(
				["SELECT", "INSERT", "UPDATE(TITULO_CD)"],
				"DISCOS_COMPACTOS",
				"PERSONAL_VENTAS",
			)
			.execute();

		// Leemos los privilegios de la base de datos 'inventario'
		const data = await getResultFromTest(
			databaseTest,
			`SELECT GRANTEE, TABLE_NAME, PRIVILEGE_TYPE 
FROM information_schema.TABLE_PRIVILEGES
WHERE  TABLE_SCHEMA = 'inventario'`,
		);
		const columns = await getResultFromTest(
			databaseTest,
			`SELECT GRANTEE, TABLE_NAME, COLUMN_NAME,PRIVILEGE_TYPE 
FROM information_schema.COLUMN_PRIVILEGES
WHERE  TABLE_SCHEMA = 'inventario'`,
		);
		// extraemos los privilegios de la tabla y rol/usuario
		const grants = data
			.filter((item) => item.TABLE_NAME === "discos_compactos")
			.filter((item) => item.GRANTEE === "'PERSONAL_VENTAS'@'%'")
			.map((item) => item.PRIVILEGE_TYPE);
		// extraemos los privilegios de para columnas y rol/usuario
		const columnsGrants = columns
			.filter((item) => item.TABLE_NAME === "discos_compactos")
			.filter((item) => item.GRANTEE === "'PERSONAL_VENTAS'@'%'")
			.filter((item) => item.COLUMN_NAME === "TITULO_CD")
			.map((item) => item.PRIVILEGE_TYPE);

		assert.ok(grants.length > 0, "No existen privilegios para la tabla");
		assert.ok(
			grants.includes("SELECT"),
			"El privilegio SELECT no ha sido otorgado",
		);
		assert.ok(
			grants.includes("INSERT"),
			"El privilegio INSERT no ha sido otorgado",
		);
		assert.ok(
			columnsGrants.includes("UPDATE"),
			"El privilegio INSERT no ha sido otorgado",
		);
	});

	test("otorga el rol 'PERSONAL_VENTAS' al usurio MRKT@localhost", async () => {
		await qb
			.grantRoles("PERSONAL_VENTAS", "MRKT", {
				host: "localhost",
			})
			.execute();

		// Leemos los roles/usuarios del host 'localhost'
		const roles = await getResultFromTest(
			databaseTest,
			"select FROM_USER,TO_USER,WITH_ADMIN_OPTION FROM mysql.role_edges",
		);
		const rolesFrom = roles
			.filter((item) => item.FROM_USER === "PERSONAL_VENTAS")
			.map((item) => item.TO_USER);
		assert.ok(
			rolesFrom.includes("MRKT"),
			"El usuario/role no ha recibido los privilegios de 'PERSONAL_VENTAS'",
		);
	});

	test("revocar el privilegio SELECT a PERSONAL_VENTAS de la tabla CDS_EN_EXISTENCIA", async () => {
		await qb
			.revoke("SELECT", "CDS_EN_EXISTENCIA", "PERSONAL_VENTAS", {
				secure: true,
				ignoreUser: true,
			})
			.execute();

		const data = await getResultFromTest(
			databaseTest,
			`SELECT GRANTEE, TABLE_NAME, PRIVILEGE_TYPE 
FROM information_schema.TABLE_PRIVILEGES
WHERE  TABLE_SCHEMA = 'inventario'`,
		);
		// extraemos los privilegios de la tabla y rol/usuario
		const grants = data
			.filter((item) => item.TABLE_NAME === "cds_en_existencia")
			.filter((item) => item.GRANTEE === "'PERSONAL_VENTAS'@'%'")
			.map((item) => item.PRIVILEGE_TYPE);

		assert.ok(!grants.includes("SELECT"), "El privilegio 'SELECT' aun existe");
	});
	test("revocan todos los privilegios al rol PERSONAL_VENTAS sobre DISCOS_COMPACTOS", async () => {
		await qb
			.revoke("all", "DISCOS_COMPACTOS", "PERSONAL_VENTAS", {
				ignoreUser: true,
			})
			.execute();

		const data = await getResultFromTest(
			databaseTest,
			`SELECT GRANTEE, TABLE_NAME, PRIVILEGE_TYPE 
FROM information_schema.TABLE_PRIVILEGES
WHERE  TABLE_SCHEMA = 'inventario'`,
		);
		// extraemos los privilegios de la tabla y rol/usuario
		const grants = data
			.filter((item) => item.TABLE_NAME === "discos_compactos")
			.filter((item) => item.GRANTEE === "'PERSONAL_VENTAS'@'%'")
			.map((item) => item.PRIVILEGE_TYPE);

		assert.ok(grants.length === 0, "Aun tiene privilegios sobre la tabla");
	});

	test("eliminar al rol/usuario 'MRKT' el rol 'PERSONAL_VENTAS'", async () => {
		await qb
			.revokeRoles("PERSONAL_VENTAS", "MRKT", {
				ignoreUser: true,
				host: "localhost",
			})
			.execute();

		// Leemos los roles/usuarios del host 'localhost'
		const roles = await getResultFromTest(
			databaseTest,
			"select FROM_USER,TO_USER,WITH_ADMIN_OPTION FROM mysql.role_edges",
		);

		const rolesFrom = roles
			.filter((item) => item.FROM_USER === "PERSONAL_VENTAS")
			.map((item) => item.TO_USER);

		assert.ok(
			!rolesFrom.includes("MRKT"),
			"El usuario/role no ha sido eliminado de 'PERSONAL_VENTAS'",
		);
	});

	test("eliminar el rol MRKT", async () => {
		// Se puede usar un objeto {name,host} si el rol o usuario tiene un host distinto al host por defecto
		// se puede utilizar la propiedad options.host como host por defecto distinto de '%'

		await qb
			.dropRoles(
				{ name: "MRKT", host: "localhost" },
				{
					secure: true,
					host: "%",
				},
			)
			.execute();

		const users = await getResultFromTest(
			databaseTest,
			"USE INVENTARIO",
			"select USER, HOST FROM mysql.user WHERE HOST='localhost'",
		);
		const usersName = users.map((item) => item.USER);
		assert.ok(
			!usersName.includes("MRKT"),
			"El usuario/rol no ha sido eliminado del host",
		);
	});

	test("eliminar el rol PERSONAL_VENTAS", async () => {
		await qb
			.dropRoles(
				{ name: "PERSONAL_VENTAS" },
				{
					secure: true,
				},
			)
			.execute();

		const users = await getResultFromTest(
			databaseTest,
			"USE INVENTARIO",
			"select USER, HOST FROM mysql.user WHERE HOST='%'",
		);
		const usersName = users.map((item) => item.USER);
		assert.ok(
			!usersName.includes("PERSONAL_VENTAS"),
			"El usuario/rol no ha sido eliminado del host",
		);
	});
});
