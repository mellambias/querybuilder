/**
 * La clave principal es el tipo soportado por SQL2006
 * las secundarias son las variaciones de cada implementacion
 * las claves siempre en minuscula.
 */

const dataTypes = {
	CHARACTER: {
		mysql: "CHAR",
		postgresql: "CHAR",
	},
	CHAR: {
		mysql: "CHAR",
		postgresql: "CHAR",
	},
	VARCHAR: {
		mysql: "VARCHAR",
		postgresql: "VARCHAR",
	},
	TEXT: {
		mysql: "TEXT",
		postgresql: "TEXT",
	},
	CLOB: {
		mysql: "BINARY",
		postgresql: "BPCHAR",
	},
	NCHAR: {
		mysql: "",
		postgresql: "",
	},
	"NCHAR VARYING": {
		mysql: "",
		postgresql: "",
	},
	NCLOB: {
		mysql: "",
		postgresql: "",
	},
	BIT: {
		mysql: "",
		postgresql: "",
	},
	"BIT VARYNG": {
		mysql: "VARBINARY",
		postgresql: "",
	},
	BLOB: {
		mysql: "BLOB",
		postgresql: "",
	},
	XML: {
		mysql: "",
		postgresql: "",
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
	},
	DECIMAL: {
		postgresql: "DECIMAL",
	},
	INTEGER: {
		mysql: "INT",
		postgresql: "INTEGER",
	},
	INT: {
		mysql: "INT",
		postgresql: "INTEGER",
	},
	TINYINT: {
		mysql: "TINYINT",
	},
	SMALLINT: {
		mysql: "SMALLINT",
		postgresql: "SMALLINT",
	},
	MEDIUMINT: {
		mysql: "MEDIUMINT",
	},
	BIGINT: {
		mysql: "BIGINT",
		postgresql: "BIGINT",
	},
	FLOAT: {
		mysql: "FLOAT",
	},
	REAL: {
		mysql: "REAL",
		postgresql: "REAL",
	},
	"DOUBLE PRECISION": {
		mysql: "DOUBLE PRECISION",
		postgresql: "DOUBLE PRECISION",
	},
	smallserial: {
		postgresql: "SMALLSERIAL",
	},
	serial: {
		postgresql: "SERIAL",
	},
	bigserial: {
		postgresql: "BIGSERIAL",
	},
	DATE: {
		mysql: "DATE",
		postgresql: "DATE",
	},
	TIME: {
		mysql: "TIME",
		postgresql: "TIME",
	},
	"TIME WITH TIME ZONE": {
		mysql: "DATETIME",
		postgresql: "TIME WHIT TIME ZONE",
	},
	TIMESTAMP: {
		mysql: "TIMESTAMP",
		postgresql: "TIMESTAMP",
	},
	"TIMESTAMP WITH TIME ZONE": {
		postgresql: "TIMESTAMP WITH TIME ZONE",
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
	},
};

export { dataTypes };
