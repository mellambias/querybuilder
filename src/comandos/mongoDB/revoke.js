import { actions } from "./utils.js";
export const revoke = {
	on: (tables, self) => {
		self._tables = Array.isArray(tables) ? tables : [tables];
	},
	from: (rol, self) => {
		self._rol = rol;
		return { revokePrivilegesFromRole: rol };
	},
	commands: function (comands, self) {
		const database = this.qb.driverDB.database;
		const privileges = self._tables.map((table) => {
			const resource = {
				db: database,
				collection: table,
			};
			return {
				resource,
				actions: actions(comands),
			};
		});

		return { privileges };
	},
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (any) => ({ comment: any }),
	orden: ["on", "from", "commands", "writeConcern", "comment"],
};

export const revokeRoles = {
	from: (rol) => ({ revokeRolesFromRole: rol }),
	roles: function (rolList) {
		const database = this.qb.driverDB.database;
		const roles = Array.isArray(rolList) ? rolList : [rolList];
		return { roles: roles.map((role) => ({ role, db: database })) };
	},
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (any) => ({ comment: any }),
	orden: ["from", "roles", "writeConcern", "comment"],
};
