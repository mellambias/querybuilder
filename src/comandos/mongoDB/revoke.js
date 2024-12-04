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
	adminOption: (adminOption) => (adminOption ? "ADMIN OPTION FOR" : undefined),
	roles: (roles) => (typeof roles === "string" ? roles : roles.join(", ")),
	from: (from, self) => revoke.from(from, self),
	grantBy: (grantBy, self) => grant.grantBy(grantBy, self),
	cascade: (cascade, self) => revoke.cascade(cascade, self),
	restrict: (restrict, self) => revoke.restrict(restrict, self),
	orden: ["adminOption", "roles", "from", "grantBy", "cascade", "restrict"],
	defaults: { cascade: true },
};
