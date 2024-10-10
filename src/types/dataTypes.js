/**
 * La clave principal es el tipo soportado por SQL2006
 * las secundarias son las variaciones de cada base de datos
 */

const dataTypes = {
	CHARACTER: {
		mysql: "CHAR",
		postgres: "CHAR",
	},
	CHAR: {
		mysql: "CHAR",
		postgres: "CHAR",
	},
	VARCHAR: {
		mysql: "VARCHAR",
		postgres: "VARCHAR",
	},
	TEXT: {
		mysql: "TEXT",
		postgres: "TEXT",
	},
	CLOB: {
		mysql: "BINARY",
		postgres: "BPCHAR",
	},
	NCHAR: {
		mysql: "",
		postgres: "",
	},
	"NCHAR VARYING": {
		mysql: "",
		postgres: "",
	},
	NCLOB: {
		mysql: "",
		postgres: "",
	},
	BIT: {
		mysql: "",
		postgres: "",
	},
	"BIT VARYNG": {
		mysql: "VARBINARY",
		postgres: "",
	},
	BLOB: {
		mysql: "BLOB",
		postgres: "",
	},
	XML: {
		mysql: "",
		postgres: "",
	},
	ENUM: {
		mysql: "ENUM",
	},
	SET: {
		mysql: "SET",
	},
	NUMERIC: {
		mysql: "DECIMAL",
		postgres: "NUMERIC",
	},
	DECIMAL: {
		postgres: "DECIMAL",
	},
	INTEGER: {
		mysql: "INT",
		postgres: "INTEGER",
	},
	INT: {
		mysql: "INT",
		postgres: "INTEGER",
	},
	TINYINT: {
		mysql: "TINYINT",
	},
	SMALLINT: {
		mysql: "SMALLINT",
		postgres: "SMALLINT",
	},
	MEDIUMINT: {
		mysql: "MEDIUMINT",
	},
	BIGINT: {
		mysql: "BIGINT",
		postgres: "BIGINT",
	},
	FLOAT: {
		mysql: "FLOAT",
	},
	REAL: {
		mysql: "REAL",
		postgres: "REAL",
	},
	"DOUBLE PRECISION": {
		mysql: "DOUBLE PRECISION",
		postgres: "DOUBLE PRECISION",
	},
	smallserial: {
		postgres: "SMALLSERIAL",
	},
	serial: {
		postgres: "SERIAL",
	},
	bigserial: {
		postgres: "BIGSERIAL",
	},
	DATE: {
		mysql: "DATE",
		postgres: "DATE",
	},
	TIME: {
		mysql: "TIME",
		postgres: "TIME",
	},
	"TIME WITH TIME ZONE": {
		mysql: "DATETIME",
		postgres: "TIME WHIT TIME ZONE",
	},
	TIMESTAMP: {
		mysql: "TIMESTAMP",
		postgres: "TIMESTAMP",
	},
	"TIMESTAMP WITH TIME ZONE": {
		postgres: "TIMESTAMP WITH TIME ZONE",
	},
	INTERVAL: {
		postgres: "INTERVAL",
	},
	"INTERVAL YEAR": {
		postgres: "INTERVAL YEAR",
	},
	"INTERVAL MONTH": {
		postgres: "INTERVAL MONTH",
	},
	"INTERVAL YEAR TO MONTH": {
		postgres: "INTERVAL YEAR TO MONTH",
	},
	"INTERVAL DAY": {
		postgres: "INTERVAL DAY",
	},
	"INTERVAL DAY TO HOUR": {
		postgres: "INTERVAL DAY TO HOUR",
	},
	"INTERVAL DAY TO MINUTE": {
		postgres: "INTERVAL DAY TO MINUTE",
	},
	"INTERVAL DAY TO SECOND": {
		postgres: "INTERVAL DAY TO SECOND",
	},
	"INTERVAL HOUR TO MINUTE": {
		postgres: "INTERVAL HOUR TO MINUTE",
	},
	"INTERVAL HOUR TO SECOND": {
		postgres: "INTERVAL HOUR TO SECOND",
	},
	"INTERVAL MINUTE TO SECOND": {
		postgres: "INTERVAL MINUTE TO SECOND",
	},
	BOOLEAN: {
		mysql: "TINYINT",
		postgres: "BOOLEAN",
	},
};

export { dataTypes };
