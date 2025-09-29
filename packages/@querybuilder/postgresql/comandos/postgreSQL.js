import { createType, createTable, createDomain } from "./postgreSQL/create.js";
import { dropType } from "./postgreSQL/drop.js";
import { column } from "./postgreSQL/column.js";
import { createRoles } from "./postgreSQL/roles.js";
import { alterTable, addColumn, dropColumn, alterColumn, addConstraint, dropConstraint, renameTable, renameColumn, setSchema } from "./postgreSQL/alter.js";

const postgreSQL = {
	createType,
	createDomain,
	dropType,
	createTable,
	column,
	createRoles,
	alterTable,
	addColumn,
	dropColumn,
	alterColumn,
	addConstraint,
	dropConstraint,
	renameTable,
	renameColumn,
	setSchema,
};
export default postgreSQL;
