import { grant } from "./grant.js";
export const revoke = {
	...grant,
	secure: (value) => (value === true ? "IF EXISTS" : undefined),
	from: function (from, self) {
		return self.to.bind(this)(from, self).replace("TO", "FROM");
	},
	ignoreUser: (value) => (value === true ? "IGNORE UNKNOWN USER" : undefined),
	orden: ["host", "secure", "commands", "on", "from", "ignoreUser"],
};

export const revokeRoles = {
	...grant,
	roles: (roles) => {
		if (/^(ALL|ALL PROVILEGES)$/i.test(roles)) {
			return "ALL PRIVILEGES, GRANT OPTION";
		}
		return typeof roles === "string" ? roles : roles.join(", ");
	},
	from: function (from, self) {
		return self.to.bind(this)(from, self).replace("TO", "FROM");
	},
	ignoreUser: (value) => (value === true ? "IGNORE UNKNOWN USER" : undefined),
	orden: ["host", "roles", "from", "ignoreUser"],
};
