import assert from "node:assert/strict";
import { log } from "../../utils/utils.js";
//Funciones para MySQL

export async function getResultFromTest(databaseTest, ...sql) {
	try {
		if (sql.length === 0) {
			throw new Error("La consulta esta vacia");
		}
		log(["resultUtils", "getResultFromTest"], "ejecutar %s", sql.join(";\n"));
		const resultTest = await databaseTest.execute(sql.join(";\n"));
		const { response } = resultTest.response();
		return response[response.length - 1];
	} catch (error) {
		throw new Error(`[getResultFromTest] ${error.message}`, {
			cause: sql.join(";\n"),
		});
	}
}
export async function existTable(driver, database, tableName) {
	const data = await getResultFromTest(
		driver,
		`use ${database}`,
		"show tables",
	);
	return data.some(
		(item) => Object.values(item)[0].toUpperCase() === tableName.toUpperCase(),
	);
}

export async function existView(driver, database, viewName) {
	const data = await getResultFromTest(
		driver,
		`use ${database}`,
		`SELECT TABLE_NAME
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = '${database}';`,
	);
	return data.some(
		(item) => Object.values(item)[0].toUpperCase() === viewName.toUpperCase(),
	);
}
export async function noExistTable(driver, database, tableName) {
	const data = await getResultFromTest(
		driver,
		`use ${database}`,
		"show tables",
	);
	return data.every(
		(item) => Object.values(item)[0].toUpperCase() !== tableName.toUpperCase(),
	);
}

export async function describeTable(driver, database, tableName) {
	const columns = await getResultFromTest(
		driver,
		`use ${database}`,
		`DESCRIBE ${tableName}`,
	);
	return columns;
}

export async function restriccionesTable(driver, database, tableName) {
	const claves = `SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = '${database}'
    AND TABLE_NAME = '${tableName}';`;

	const check = `SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM 
    information_schema.CHECK_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = '${database}';`;

	const values = `SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_TYPE,
    COLUMN_DEFAULT
FROM 
    information_schema.COLUMNS
WHERE 
    TABLE_SCHEMA = '${database}'
    AND TABLE_NAME = '${tableName}';`;

	const clavesData = await getResultFromTest(driver, claves);
	const checkData = await getResultFromTest(driver, check);
	const valuesData = await getResultFromTest(driver, values);
	return { claves: clavesData, check: checkData, values: valuesData };
}

/**
 * Devuelve true si todos los atributos de cols estan definidos en la tabla
 * @param {object} databaseTest Driver que conecta con la base de datos
 * @param {string} dataBase Nombre de la base de datos
 * @param {string} table Nombre de la tabla
 * @param {Object} cols Objeto con pares atributo:valor
 * @returns true|false
 */
export async function colsExistInTable(databaseTest, dataBase, table, cols) {
	const tabla = (await describeTable(databaseTest, dataBase, table)).map(
		(item) => item.Field,
	);
	return Object.keys(cols).every((item) => tabla.includes(item));
}

/**
 * Devuelve una Promesa que resuelve con una lista con los valores del campo 'col'
 * @param {object} databaseTest Driver que conecta con la base de datos
 * @param {string} dataBase Nombre de la base de datos
 * @param {string} table Nombre de la tabla
 * @param {string} col Nombre de la columna
 * @returns
 */
export async function getColValuesFrom(databaseTest, dataBase, table, col) {
	const data = await getResultFromTest(
		databaseTest,
		`use ${dataBase}`,
		`SELECT * FROM ${table}`,
	);
	if (col === "*") {
		return data;
	}
	return data.map((item) => item[col]);
}

/**
 * Comprueba la existencia de la tabla en la base de datos inventario
 * y que las columnas esten definidas
 * @param {String} tablaToTest Nombre de la tabla
 * @param {Object} cols Definicion de columnas
 * @param {Object} databaseTest Driver a la SGBD
 * @param {String} dataBase Nombre de la base de datos
 */

export async function checktable(tablaToTest, cols) {
	const { databaseTest, dataBase } = this;
	assert.ok(
		await existTable(databaseTest, dataBase, tablaToTest),
		`La tabla '${tablaToTest}' no existe en '${dataBase}'`,
	);
	// Probar si las columnas de la tabla coinciden con la definicion
	assert.ok(
		await colsExistInTable(databaseTest, dataBase, tablaToTest, cols),
		`Las columnas de ${tablaToTest} no coinciden`,
	);
}

/**
 * Busca las filas en la tabla
 * @param {String} tabla nombre de la tabla
 * @param {Array} rows Array con las filas a combrobar
 */
export async function checkRows(tabla, rows) {
	const { databaseTest, dataBase } = this;
	const rowsInTable = await getColValuesFrom(
		databaseTest,
		dataBase,
		tabla,
		"*",
	);
	assert.ok(
		rows.every(([key]) =>
			rowsInTable.find((item) => Object.values(item).includes(key)),
		),
		`los registros no existen en la tabla'${tabla}' de '${dataBase}'`,
	);
}
