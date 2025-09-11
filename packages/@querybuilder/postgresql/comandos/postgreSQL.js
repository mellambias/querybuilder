import { createType, createTable } from "./postgreSQL/create.js";
import { dropType } from "./postgreSQL/drop.js";
import { column } from "./postgreSQL/column.js";
import { createRoles } from "./postgreSQL/roles.js";

const postgreSQL = {
	createType,
	dropType,
	createTable,
	column,
	createRoles,
};
export default postgreSQL;
