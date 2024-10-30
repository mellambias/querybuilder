import { grant } from "./grant.js";
export const revoke = {
	...grant,

	grantOption: (grantOption) =>
		grantOption === true ? "GRANT OPTION FOR" : undefined,
	from: (from) =>
		typeof from === "string"
			? /^(PUBLIC|ALL)$/i.test(from)
				? "FROM PUBLIC"
				: `FROM ${from}`
			: `FROM ${from.join(", ")}`,
	cascade: (value, self) =>
		value === true && self._options?.restrict === undefined
			? "CASCADE"
			: "RESTRICT",
	restrict: (value, self) =>
		value === true && self._options?.cascade === undefined
			? "RESTRICT"
			: "CASCADE",
	orden: [
		"grantOption",
		"commands",
		"on",
		"from",
		"withGrant",
		"grantBy",
		"cascade",
	],
	_options: {},
	defaults: { cascade: true },
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
