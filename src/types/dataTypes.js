/**
 * La clave principal es el tipo soportado por SQL2006
 * las secundarias son las variaciones de cada implementacion
 * las claves siempre en minuscula.
 */

const dataTypes = {
	CHARACTER: {
		mysql: "CHAR",
		postgresql: "CHAR",
		mongobd: "String",
	},
	CHAR: {
		mysql: "CHAR",
		postgresql: "CHAR",
		mongobd: "String",
	},
	VARCHAR: {
		mysql: "VARCHAR",
		postgresql: "VARCHAR",
		mongobd: "String",
	},
	TEXT: {
		mysql: "TEXT",
		postgresql: "TEXT",
		mongobd: "String",
	},
	CLOB: {
		mysql: "BINARY",
		postgresql: "BPCHAR",
		mongobd: "Binary",
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
		mongobd: "Number",
	},
	DECIMAL: {
		postgresql: "DECIMAL",
		mongobd: "Number",
	},
	INTEGER: {
		mysql: "INT",
		postgresql: "INTEGER",
		mongobd: "Number",
	},
	INT: {
		mysql: "INT",
		postgresql: "INTEGER",
		mongobd: "Number",
	},
	TINYINT: {
		mysql: "TINYINT",
		mongobd: "Number",
	},
	SMALLINT: {
		mysql: "SMALLINT",
		postgresql: "SMALLINT",
		mongobd: "Number",
	},
	MEDIUMINT: {
		mysql: "MEDIUMINT",
		mongobd: "Number",
	},
	BIGINT: {
		mysql: "BIGINT",
		postgresql: "BIGINT",
		mongobd: "Number",
	},
	FLOAT: {
		mysql: "FLOAT",
		mongobd: "Number",
	},
	REAL: {
		mysql: "REAL",
		postgresql: "REAL",
		mongobd: "Number",
	},
	"DOUBLE PRECISION": {
		mysql: "DOUBLE PRECISION",
		postgresql: "DOUBLE PRECISION",
		mongobd: "Number",
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
		mongobd: "Date",
	},
	TIME: {
		mysql: "TIME",
		postgresql: "TIME",
		mongobd: "Date",
	},
	"TIME WITH TIME ZONE": {
		mysql: "DATETIME",
		postgresql: "TIME WHIT TIME ZONE",
		mongobd: "Date",
	},
	TIMESTAMP: {
		mysql: "TIMESTAMP",
		postgresql: "TIMESTAMP",
		mongobd: "Date",
	},
	"TIMESTAMP WITH TIME ZONE": {
		postgresql: "TIMESTAMP WITH TIME ZONE",
		mongobd: "Date",
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
