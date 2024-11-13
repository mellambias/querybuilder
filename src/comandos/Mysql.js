import { createView, createTable } from "./Mysql/create.js";
import { dropTable } from "./Mysql/drop.js";
import { createRoles, dropRoles } from "./Mysql/roles.js";
import { grant, grantRoles } from "./Mysql/grant.js";
import { revoke, revokeRoles } from "./Mysql/revoke.js";
import { setTransaction, startTransaction } from "./Mysql/transaction.js";

const Mysql = {
	createTable,
	dropTable,
	createView,
	createRoles,
	dropRoles,
	grant,
	grantRoles,
	revoke,
	revokeRoles,
	setTransaction,
	startTransaction,
};

export default Mysql;
