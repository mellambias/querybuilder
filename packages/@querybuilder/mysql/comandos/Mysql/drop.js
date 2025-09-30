import sql2006 from "../../../core/comandos/sql2006.js";
export const dropTable = {
	...sql2006.dropTable,
	temporary: (temporary) => (temporary === true ? "TEMPORARY" : undefined),
	table: (table) => table,
	name: (name) => name,
	secure: (secure) => (secure === true ? "IF EXISTS" : undefined),
	orden: ["temporary", "table", "secure", "name", "option"],
};
