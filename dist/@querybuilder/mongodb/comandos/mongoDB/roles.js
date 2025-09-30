/**
 * Comandos relacionados con los roles
 * para la base de datos MongoDB
 */

import { actions } from "./utils.js";

function resource(database, table) {
	return {
		db: database,
		collection: table,
	};
}

export const createRoles = {
	name: (name) => ({
		createRole: name,
	}),
	privileges: function (dataArray) {
		const database = this.qb.driverDB.database;
		return {
			privileges: dataArray.map((privilege) => ({
				resource: resource(database, privilege?.on ? privilege.on : ""),
				actions: actions(privilege.actions),
			})),
		};
	},
	roles: (dataArray) => ({ roles: dataArray }),
	grantedIPs: (dataArray) => ({ authenticationRestrictions: dataArray }),
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (dataArray) => ({ comment: dataArray }),
	defaults: { privileges: [], roles: [] },
	orden: [
		"name",
		"privileges",
		"roles",
		"grantedIPs",
		"writeConcern",
		"comment",
	],
};
export const dropRoles = {
	name: (name) => ({ dropRole: name }),
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (any) => ({ comment: any }),
	orden: ["name", "writeConcern", "comment"],
};
//commands,on,to,options,
export const grant = {
	on: (table, self) => {
		self._table = table;
	},
	commands: function (dataArray, self) {
		const database = this.qb.driverDB.database;
		return {
			privileges: [
				{
					resource: resource(database, self._table),
					actions: actions(dataArray),
				},
			],
		};
	},
	to: (roleName) => ({ grantPrivilegesToRole: roleName }),
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (any) => ({ comment: any }),
	orden: ["to", "on", "commands", "writeConcern", "comment"],
};

export const grantRoles = {
	user: (user) => ({ grantRolesToRole: user }),
	roles: (roles) => ({ roles: typeof roles === "string" ? [roles] : roles }),
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (any) => ({ comment: any }),
	orden: ["user", "roles", "writeConcern", "comment"],
};
