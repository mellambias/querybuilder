import { createView, createTable } from "./Mysql/create.js";
import { dropTable } from "./Mysql/drop.js";
import { createRoles, dropRoles } from "./Mysql/roles.js";
import { grant, grantRoles } from "./Mysql/grant.js";

const Mysql = {
	createTable,
	dropTable,
	createView,
	createRoles,
	dropRoles,
	grant,
	grantRoles,
};

export default Mysql;
