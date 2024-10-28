import { grant, grantRoles } from "./sql2006/grant.js";
import { revoke, revokeRoles } from "./sql2006/revoke.js";
import { createRole, dropRoles } from "./sql2006/roles.js";
import {
	createSchema,
	createTable,
	createType,
	createDomain,
	createView,
	createCursor,
} from "./sql2006/create.js";
import { dropSchema, dropColumn, dropTable } from "./sql2006/drop.js";
import { column } from "./sql2006/column.js";
import { constraint } from "./sql2006/constraint.js";
import { select } from "./sql2006/select.js";
import { setTransaction } from "./sql2006/transaction.js";

const sql2006 = {
	grant,
	grantRoles,
	revoke,
	revokeRoles,
	createRole,
	dropRoles,
	createSchema,
	createTable,
	createType,
	createDomain,
	createView,
	createCursor,
	dropSchema,
	dropColumn,
	dropTable,
	column,
	constraint,
	select,
	setTransaction,
};
export default sql2006;
