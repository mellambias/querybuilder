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
	cascade: (value) =>
		value === true && revoke._options?.restrict === undefined
			? "CASCADE"
			: "RESTRICT",
	restrict: (value) =>
		value === true && revoke._options?.cascade === undefined
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
	from: (from) => revoke.from(from),
	grantBy: (grantBy) => grant.grantBy(grantBy),
	cascade: (cascade) => revoke.cascade(cascade),
	restrict: (restrict) => revoke.restrict(restrict),
	orden: ["adminOption", "roles", "from", "grantBy", "cascade", "restrict"],
	defaults: { cascade: true },
};
