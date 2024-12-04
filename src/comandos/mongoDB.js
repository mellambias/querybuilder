import { revoke, revokeRoles } from "./mongoDB/revoke.js";
import { createRoles, dropRoles, grant, grantRoles } from "./mongoDB/roles.js";
const mongoDB = {
	createRoles,
	dropRoles,
	grant,
	grantRoles,
	revoke,
	revokeRoles,
};
export default mongoDB;
