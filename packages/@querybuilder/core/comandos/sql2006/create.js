/**
 * @fileoverview Comandos para crear objetos (CREATE).
 * @module comandos/sql2006/create
 * @description Módulo que implementa comandos CREATE del estándar SQL2006 (ISO/IEC 9075).
 * Permite crear esquemas, tablas, tipos de datos, dominios, vistas y cursores en una base de datos.
 * @version 2.0.0
 */

import QueryBuilder from "../../querybuilder.js";


/**
 * @name createSchema
 * @description Objeto que representa el comando CREATE SCHEMA del estándar SQL2006.
 * Permite construir sentencias SQL para crear esquemas en una base de datos.
 * @property {String} name - El nombre del esquema.
 * @property {String} authorization - el usuario que autoriza el esquema.
 * @property {String} charset - el conjunto de caracteres por defecto del esquema.
 */
export const createSchema = {
	name: (name) => name,
	authorization: (authorization) => `AUTHORIZATION ${authorization}`,
	charset: (charset) => `DEFAULT CHARACTER SET ${charset}`,
	orden: ["name", "authorization", "charset"],
};

/**
 * @name createTable
 * @description Objeto que representa el comando CREATE TABLE del estándar SQL2006.
 * Permite construir sentencias SQL para crear tablas en una base de datos.
 * @property {String} name - el nombre de la tabla.
 * @property {String} [temporary=GLOBAL|LOCAL] - parte de la sentencia si la tabla es temporal.
 * @property {Array<Object>} cols=Array<{name:String,options:Object}> - las columnas de la tabla.
 * @property {String} [onCommit=PRESERVE|DELETE] - la acción ON COMMIT.
 */
export const createTable = {
	name: (name) => `TABLE ${name}`,
	temporary: (temporary) =>
		/^(GLOBAL|LOCAL)$/i.test(temporary)
			? `${temporary.toUpperCase()} TEMPORARY`
			: undefined,
	cols: function (cols, self) {
		const columns = Object.keys(cols).map((key) => {
			const newColumn = this.column(key, cols[key]);
			return newColumn;
		});
		if (self._options?.constraints) {
			columns.push(this.tableConstraints(self._options.constraints));
		}

		return `( ${columns.join(",\n ")} )`;
	},
	onCommit: (onCommit, self) => {
		if (self._options?.temporary && /^(PRESERVE|DELETE)$/i.test(onCommit)) {
			return `ON COMMIT ${onCommit.toUpperCase()} ROWS`;
		}
	},
	orden: ["temporary", "name", "cols", "onCommit"],
};

/**
 * @name createType
 * @description Objeto que representa el comando CREATE TYPE del estándar SQL2006.
 * Permite construir sentencias SQL para crear tipos de datos definidos por el usuario en una base de datos.
 * @property {String} name - el nombre del tipo.
 * @property {boolean} as - la definición del tipo.
 * @property {boolean} final - Tipo es FINAL o NOT FINAL.
 */
export const createType = {
	name: (name) => `TYPE ${name}`,
	as: (as) => `AS ${as}`,
	final: (final) => (final ? "FINAL" : "NOT FINAL"),
	orden: ["name", "as", "final"],
};

/**
 * @name createDomain
 * @description Objeto que representa el comando CREATE DOMAIN del estándar SQL2006.
 * Permite construir sentencias SQL para crear dominios en una base de datos.
 * @property {String} name - el nombre del dominio.
 * @property {String} as - el tipo de datos del dominio.
 * @property {ANY} default - el valor por defecto del dominio.
 * @property {object} [constraint={name: String, check: String}] - una restricción CHECK para el dominio.
 */
export const createDomain = {
	name: (name) => name,
	as: function (sqlType) {
		return `AS ${sqlType.toDataType(this.dataType)}`;
	},
	default: (value) => `DEFAULT ${value}`,
	constraint: ({ name, check }) => `CONSTRAINT ${name} CHECK ( ${check} )`,
	orden: ["name", "as", "default", "constraint"],
};

/**
 * @name createView
 * @description Objeto que representa el comando CREATE VIEW del estándar SQL2006.
 * Permite construir sentencias SQL para crear vistas en una base de datos.
 * @property {String} name - el nombre de la vista.
 * @property {Array<String>} cols - las columnas de la vista.
 * @property {String | QueryBuilder} as - la consulta que define la vista.
 * @property {Boolean} check - Si la vista tiene WITH CHECK OPTION.
 */
export const createView = {
	name: (name) => `VIEW ${name}`,
	cols: (cols) => `( ${cols.join(", ")} )`,
	as: function (vista, self) {
		if (vista instanceof QueryBuilder) {
			const resolve = this.getSubselect(self._values.next, true);
			return `AS ${Array.isArray(resolve) ? resolve.join("\n") : resolve}`;
		}
		return `AS ${vista}`;
	},
	check: (check) => (check === true ? "WITH CHECK OPTION" : undefined),
	orden: ["name", "cols", "as", "check"],
};

/**
 * @name createCursor
 * @description Objeto que representa el comando CREATE CURSOR del estándar SQL2006.
 * Permite construir sentencias SQL para crear cursores en una base de datos.
 * @property {string} name - el nombre del cursor.
 * @property {string} [changes=SENSITIVE|INSENSITIVE|ASENSITIVE] - la sensibilidad a cambios del cursor.
 * @property {string} [cursor=SCROLL|NO SCROLL] - Construye la parte de la sentencia si el cursor es desplazable o no.
 * @property {string} [hold=WITH|WITHOUT] - Construye la parte de la sentencia indicando si el cursor se mantiene abierto
 * después de una transacción.
 * @property {string} [return=WITH|WITHOUT] - Construye la parte de la sentencia indicando si el cursor devuelve filas.
 * @property {string|QueryBuilder} expresion - la consulta que define el cursor.
 * @property {Function} orderBy - el orden de los resultados del cursor.
 * @property {boolean} readOnly - Construye la parte de la sentencia si el cursor es de solo lectura.
 * @property {string|Array<string>|boolean} update - Construye la parte de la sentencia si el cursor permite actualizaciones.
 */
export const createCursor = {
	name: (name) => name,
	changes: (changes) =>
		/^(SENSITIVE|INSENSITIVE|ASENSITIVE)$/i.test(changes)
			? changes.toUpperCase()
			: undefined,
	cursor: (cursor) =>
		/^(SCROLL|NO SCROLL)$/i.test(cursor) ? cursor.toUpperCase() : undefined,
	hold: (hold) => `${hold === true ? "WITH" : "WITHOUT"} HOLD`,
	return: (value) => `${value === true ? "WITH" : "WITHOUT"} RETURN`,
	expresion: function (expresion, self) {
		const next = self._values.next;

		if (typeof expresion === "string") {
			return `CURSOR FOR ${expresion}`;
		}
		if (expresion instanceof QueryBuilder) {
			return `CURSOR FOR ${this.getSubselect(next).join("\n")}`;
		}
		throw new Error("la expresion no es valida");
	},
	orderBy: (orderBy) => `ORDER BY ${orderBy}`,
	readOnly: (readOnly) => (readOnly === true ? "FOR READ ONLY" : undefined),
	update: (update, self) => {
		if (self._options?.readOnly === true)
			throw new Error("No puede actualizar un curson de solo lectura");
		if (Array.isArray(update)) {
			return `FOR UPDATE OF ${update.join(", ")}`;
		}
		if (typeof update === "string") {
			return `FOR UPDATE OF ${update}`;
		}
		if (update === true) {
			return "FOR UPDATE";
		}
	},
	orden: [
		"name",
		"changes",
		"cursor",
		"hold",
		"return",
		"expresion",
		"orderBy",
		"readOnly",
		"update",
	],
};


const createUsers = {
	name: (name) => name,
};