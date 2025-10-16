/**
 * @fileoverview Mapeo de tipos de datos SQL2006 a implementaciones específicas
 * @description Diccionario completo que mapea tipos de datos SQL estándar (SQL2006) 
 * a sus equivalentes específicos en diferentes SGBDs (MySQL, PostgreSQL, MongoDB, etc.).
 * La clave principal es el tipo soportado por SQL2006, las secundarias son las variaciones de cada implementación.
 * Todas las claves están en minúscula para consistencia.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * import { dataTypes } from './dataTypes.js';
 * 
 * // Obtener tipo específico para MySQL
 * const mysqlType = dataTypes.VARCHAR.mysql; // 'VARCHAR'
 * const mongoType = dataTypes.VARCHAR.mongobd; // 'string'
 * 
 * // Usar con String.prototype.toDataType()
 * const converted = 'INTEGER'.toDataType('postgresql'); // 'INTEGER'
 */

/**
 * La clave principal es el tipo soportado por SQL2006
 * las secundarias son las variaciones de cada implementacion
 * las claves siempre en minuscula.
 */

/**
 * Mapeo completo de tipos de datos SQL2006 a implementaciones específicas
 * @namespace dataTypes
 * @description Objeto que contiene el mapeo de tipos de datos SQL estándar a sus equivalentes
 * en diferentes sistemas de gestión de bases de datos.
 * 
 * @example
 * // Tipos de caracteres
 * dataTypes.VARCHAR.mysql      // 'VARCHAR'
 * dataTypes.VARCHAR.postgresql // 'VARCHAR' 
 * dataTypes.VARCHAR.mongobd    // 'string'
 * 
 * // Tipos numéricos
 * dataTypes.INTEGER.mysql      // 'INT'
 * dataTypes.INTEGER.postgresql // 'INTEGER'
 * dataTypes.INTEGER.mongobd    // 'int'
 * 
 * // Tipos de fecha
 * dataTypes.DATE.mysql         // 'DATE'
 * dataTypes.DATE.postgresql    // 'DATE'
 * dataTypes.DATE.mongobd       // 'date'
 */
const dataTypes = {
	CHARACTER: {
		mysql: "CHAR",
		postgresql: "CHAR",
		mongobd: "string",
	},
	CHAR: {
		mysql: "CHAR",
		postgresql: "CHAR",
		mongobd: "string",
	},
	VARCHAR: {
		mysql: "VARCHAR",
		postgresql: "VARCHAR",
		mongobd: "string",
	},
	TEXT: {
		mysql: "TEXT",
		postgresql: "TEXT",
		mongobd: "string",
	},
	CLOB: {
		mysql: "BINARY",
		postgresql: "BPCHAR",
		mongobd: "binary",
	},
	NCHAR: {
		mysql: "",
		postgresql: "",
		mongobd: "",
	},
	"NCHAR VARYING": {
		mysql: "",
		postgresql: "",
		mongobd: "",
	},
	NCLOB: {
		mysql: "",
		postgresql: "",
		mongobd: "",
	},
	BIT: {
		mysql: "",
		postgresql: "",
		mongobd: "",
	},
	"BIT VARYNG": {
		mysql: "VARBINARY",
		postgresql: "",
		mongobd: "",
	},
	BLOB: {
		mysql: "BLOB",
		postgresql: "",
		mongobd: "",
	},
	XML: {
		mysql: "",
		postgresql: "",
		mongobd: "",
	},
	ENUM: {
		mysql: "ENUM",
	},
	SET: {
		mysql: "SET",
	},
	NUMERIC: {
		mysql: "DECIMAL",
		postgresql: "NUMERIC",
		mongobd: "number",
	},
	DECIMAL: {
		postgresql: "DECIMAL",
		mongobd: "number",
	},
	INTEGER: {
		mysql: "INT",
		postgresql: "INTEGER",
		mongobd: "number",
	},
	INT: {
		mysql: "INT",
		postgresql: "INTEGER",
		mongobd: "number",
	},
	TINYINT: {
		mysql: "TINYINT",
		mongobd: "number",
	},
	SMALLINT: {
		mysql: "SMALLINT",
		postgresql: "SMALLINT",
		mongobd: "number",
	},
	MEDIUMINT: {
		mysql: "MEDIUMINT",
		mongobd: "number",
	},
	BIGINT: {
		mysql: "BIGINT",
		postgresql: "BIGINT",
		mongobd: "number",
	},
	FLOAT: {
		mysql: "FLOAT",
		mongobd: "number",
	},
	REAL: {
		mysql: "REAL",
		postgresql: "REAL",
		mongobd: "number",
	},
	"DOUBLE PRECISION": {
		mysql: "DOUBLE PRECISION",
		postgresql: "DOUBLE PRECISION",
		mongobd: "number",
	},
	smallserial: {
		postgresql: "SMALLSERIAL",
		mongobd: "ObjectId",
	},
	serial: {
		postgresql: "SERIAL",
		mongobd: "ObjectId",
	},
	bigserial: {
		postgresql: "BIGSERIAL",
		mongobd: "ObjectId",
	},
	DATE: {
		mysql: "DATE",
		postgresql: "DATE",
		mongobd: "date",
	},
	TIME: {
		mysql: "TIME",
		postgresql: "TIME",
		mongobd: "date",
	},
	"TIME WITH TIME ZONE": {
		mysql: "DATETIME",
		postgresql: "TIME WHIT TIME ZONE",
		mongobd: "date",
	},
	TIMESTAMP: {
		mysql: "TIMESTAMP",
		postgresql: "TIMESTAMP",
		mongobd: "date",
	},
	"TIMESTAMP WITH TIME ZONE": {
		postgresql: "TIMESTAMP WITH TIME ZONE",
		mongobd: "date",
	},
	INTERVAL: {
		postgresql: "INTERVAL",
	},
	"INTERVAL YEAR": {
		postgresql: "INTERVAL YEAR",
	},
	"INTERVAL MONTH": {
		postgresql: "INTERVAL MONTH",
	},
	"INTERVAL YEAR TO MONTH": {
		postgresql: "INTERVAL YEAR TO MONTH",
	},
	"INTERVAL DAY": {
		postgresql: "INTERVAL DAY",
	},
	"INTERVAL DAY TO HOUR": {
		postgresql: "INTERVAL DAY TO HOUR",
	},
	"INTERVAL DAY TO MINUTE": {
		postgresql: "INTERVAL DAY TO MINUTE",
	},
	"INTERVAL DAY TO SECOND": {
		postgresql: "INTERVAL DAY TO SECOND",
	},
	"INTERVAL HOUR TO MINUTE": {
		postgresql: "INTERVAL HOUR TO MINUTE",
	},
	"INTERVAL HOUR TO SECOND": {
		postgresql: "INTERVAL HOUR TO SECOND",
	},
	"INTERVAL MINUTE TO SECOND": {
		postgresql: "INTERVAL MINUTE TO SECOND",
	},
	BOOLEAN: {
		mysql: "TINYINT",
		postgresql: "BOOLEAN",
		mongobd: "boolean",
	},
	// MySQL-specific types
	JSON: {
		mysql: "JSON",
		postgresql: "JSON",
		mongobd: "object",
	},
	DECIMAL: {
		mysql: "DECIMAL",
		postgresql: "DECIMAL",
		mongobd: "number",
	},
	TINYINT: {
		mysql: "TINYINT",
		postgresql: "SMALLINT",
		mongobd: "number",
	},
	MEDIUMINT: {
		mysql: "MEDIUMINT",
		postgresql: "INTEGER",
		mongobd: "number",
	},
	LONGTEXT: {
		mysql: "LONGTEXT",
		postgresql: "TEXT",
		mongobd: "string",
	},
	MEDIUMTEXT: {
		mysql: "MEDIUMTEXT",
		postgresql: "TEXT",
		mongobd: "string",
	},
	// Tipos específicos de PostgreSQL
	UUID: {
		postgresql: "UUID",
	},
	TIMESTAMPTZ: {
		postgresql: "TIMESTAMPTZ",
	},
	INET: {
		postgresql: "INET",
	},
	MACADDR: {
		postgresql: "MACADDR",
	},
	CIDR: {
		postgresql: "CIDR",
	},
	NUMRANGE: {
		postgresql: "NUMRANGE",
	},
	DATERANGE: {
		postgresql: "DATERANGE",
	},
	TSRANGE: {
		postgresql: "TSRANGE",
	},
	TSTZRANGE: {
		postgresql: "TSTZRANGE",
	},
	JSONB: {
		postgresql: "JSONB",
	},
	XML: {
		postgresql: "XML",
	},
	TSVECTOR: {
		postgresql: "TSVECTOR",
	},
	TSQUERY: {
		postgresql: "TSQUERY",
	},
	BYTEA: {
		postgresql: "BYTEA",
	},
	OID: {
		postgresql: "OID",
	},
	REGPROC: {
		postgresql: "REGPROC",
	},
	REGPROCEDURE: {
		postgresql: "REGPROCEDURE",
	},
	REGOPER: {
		postgresql: "REGOPER",
	},
	REGOPERATOR: {
		postgresql: "REGOPERATOR",
	},
	REGCLASS: {
		postgresql: "REGCLASS",
	},
	REGTYPE: {
		postgresql: "REGTYPE",
	},
	REGCONFIG: {
		postgresql: "REGCONFIG",
	},
	REGDICTIONARY: {
		postgresql: "REGDICTIONARY",
	},
	// Tipos array de PostgreSQL
	"INTEGER[]": {
		postgresql: "INTEGER[]",
	},
	"BIGINT[]": {
		postgresql: "BIGINT[]",
	},
	"SMALLINT[]": {
		postgresql: "SMALLINT[]",
	},
	"REAL[]": {
		postgresql: "REAL[]",
	},
	"DOUBLE PRECISION[]": {
		postgresql: "DOUBLE PRECISION[]",
	},
	"NUMERIC[]": {
		postgresql: "NUMERIC[]",
	},
	"DECIMAL[]": {
		postgresql: "DECIMAL[]",
	},
	"CHAR[]": {
		postgresql: "CHAR[]",
	},
	"VARCHAR[]": {
		postgresql: "VARCHAR[]",
	},
	"TEXT[]": {
		postgresql: "TEXT[]",
	},
	"BYTEA[]": {
		postgresql: "BYTEA[]",
	},
	"DATE[]": {
		postgresql: "DATE[]",
	},
	"TIME[]": {
		postgresql: "TIME[]",
	},
	"TIMESTAMP[]": {
		postgresql: "TIMESTAMP[]",
	},
	"TIMESTAMPTZ[]": {
		postgresql: "TIMESTAMPTZ[]",
	},
	"INTERVAL[]": {
		postgresql: "INTERVAL[]",
	},
	"BOOLEAN[]": {
		postgresql: "BOOLEAN[]",
	},
	"JSON[]": {
		postgresql: "JSON[]",
	},
	"JSONB[]": {
		postgresql: "JSONB[]",
	},
	"UUID[]": {
		postgresql: "UUID[]",
	},
	"INET[]": {
		postgresql: "INET[]",
	},
	"CIDR[]": {
		postgresql: "CIDR[]",
	},
	"MACADDR[]": {
		postgresql: "MACADDR[]",
	},
};

export { dataTypes };
