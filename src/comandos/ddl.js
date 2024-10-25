import {
	createSchema,
	createTable,
	createType,
	createDomain,
	createView,
} from "./ddl/create.js";
import { dropSchema, dropColumn, dropTable } from "./ddl/drop.js";
import { column } from "./ddl/column.js";
import { constraint } from "./ddl/constraint.js";

export {
	createSchema,
	createTable,
	createType,
	createDomain,
	createView,
	dropSchema,
	dropColumn,
	dropTable,
	column,
	constraint,
};
