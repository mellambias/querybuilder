import { Grant } from "./grant.js";
export const Revoke = {
	...Grant,

	grantOption: (grantOption) =>
		grantOption === true ? "GRANT OPTION FOR" : undefined,
	from: (from) =>
		typeof from === "string"
			? /^(PUBLIC|ALL)$/i.test(from)
				? "FROM PUBLIC"
				: undefined
			: `FROM ${from.join(", ")}`,
	cascade: (value) =>
		value === true && Revoke.options?.restrict === undefined
			? "CASCADE"
			: "RESTRICT",
	restrict: (value) =>
		value === true && Revoke.options?.cascade === undefined
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
	options: {},
};
