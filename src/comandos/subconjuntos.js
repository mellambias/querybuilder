export const conjuntos = {
	DDL: "Define o modifica la estructura de la base de datos.",
	DML: "Manipula los datos almacenados en las tablas.",
	DCL: "Controla el acceso y permisos de elementos de la base de datos",
	TLC: "Gestiona las transacciones.",
	DQL: "Consulta o recupera datos de una o varias tablas.",
	utility: "Comando auxiliar para gestion y mantenimiento de la base de datos.",
};

//Definen y modifican la estructura de la base de datos.
export const DDL = [
	"CREATE",
	"ALTER",
	"DROP",
	"TRUNCATE",
	"RENAME",
	"CREATE DATABASE",
	"DROP DATABASE",
	"CREATE INDEX",
	"DROP INDEX",
	"CREATE VIEW",
	"DROP VIEW",
	"CREATE TABLESPACE",
	"ALTER TABLESPACE",
	"CREATE SCHEMA",
	"CREATE MATERIALIZED VIEW",
	"REFRESH MATERIALIZED VIEW",
	"ALTER SYSTEM",
	"CITEXT",
];
//Manipulan los datos almacenados en las tablas.
export const DML = [
	"INSERT",
	"UPDATE",
	"DELETE",
	"SELECT",
	"REPLACE",
	"LOAD DATA",
	"MERGE",
	"CALL",
	"HANDLER",
	"EXPLAIN",
	"DO",
	"RETURNING",
	"COPY",
];
//Controlan el acceso y permisos en la base de datos.
export const DCL = [
	"GRANT",
	"REVOKE",
	"CREATE USER",
	"CREATE ROLE",
	"DROP USER",
	"SET PASSWORD",
	"SET ROLE",
];
//Gestionan las transacciones en la base de datos.
export const TLC = [
	"COMMIT",
	"ROLLBACK",
	"SAVEPOINT",
	"RELEASE SAVEPOINT",
	"SET TRANSACTION",
	"START TRANSACTION",
	"LOCK TABLES",
	"UNLOCK TABLES",
	"BEGIN READ ONLY",
];

//Consultan y recuperan datos de una o varias tablas.
export const DQL = ["SELECT", "SHOW", "DESCRIBE", "EXPLAIN", "WITH RECURSIVE"];

//Comandos auxiliares para gestión y mantenimiento de la base de datos.
export const utility = [
	"USE",
	"SOURCE",
	"HELP",
	"STATUS",
	"SHOW WARNINGS",
	"SHOW ERRORS",
	"FLUSH",
	"RESET",
	"OPTIMIZE",
	"ANALYZE",
	"CHECK",
	"REPAIR",
	"BACKUP TABLE",
	"RESTORE TABLE",
	"LISTEN",
	"NOTIFY",
	"UNLISTEN",
	"DO",
	"CHECKPOINT",
	"VACUUM",
	"ANALYZE",
	"CLUSTER",
	"REINDEX",
];

/**
 * Devuelve el/los grupos al que pertenece un comando
 * @param {string} query
 * @returns array<string>
 */
export function commandToGroup(query) {
	const groups = [];
	const command = query.toUpperCase();
	groups.push({
		g: "DDL",
		i: DDL.findIndex((item) => command.substring(0, item.length) === item),
	});

	groups.push({
		g: "DML",
		i: DML.findIndex((item) => command.substring(0, item.length) === item),
	});
	groups.push({
		g: "DCL",
		i: DCL.findIndex((item) => command.substring(0, item.length) === item),
	});
	groups.push({
		g: "TLC",
		i: TLC.findIndex((item) => command.substring(0, item.length) === item),
	});
	groups.push({
		g: "DQL",
		i: DQL.findIndex((item) => command.substring(0, item.length) === item),
	});
	groups.push({
		g: "utility",
		i: utility.findIndex((item) => command.substring(0, item.length) === item),
	});

	return groups
		.filter((item) => item.i !== -1)
		.sort((a, b) => b.i - a.i)
		.reduce(
			(final, item) => {
				if (final[0].i < item.i) {
					final[0] = item;
				} else if (final[0].i === item.i) {
					final.push(item);
				}
				return final;
			},
			[{ i: -1 }],
		)
		.map((item) => ({
			grupo: item.g,
			info: conjuntos[item.g],
		}));
}
