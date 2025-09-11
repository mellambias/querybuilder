/**
 * La clave principal es el tipo soportado por SQL2006
 * las secundarias son las variaciones de cada implementacion
 * las claves siempre en minuscula.
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
};

export { dataTypes };
