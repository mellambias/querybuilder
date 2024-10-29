export const createRoles = {
	secure: (secure) => (secure === true ? "IF NOT EXISTS" : undefined),
	names: (names) => {
		if (Array.isArray(names)) {
			return `${names.map((rol) => `${rol}${createRoles._options?.host !== undefined ? `@${createRoles._options.host}` : ""}`).join(", ")}`;
		}
		return `${names}${createRoles._options.host !== undefined ? `@${createRoles._options.host}` : ""}`;
	},
	orden: ["secure", "names"],
};

export const dropRoles = {
	secure: (secure) => (secure === true ? "IF EXIXTS" : undefined),
	names: (names) => {
		if (Array.isArray(names)) {
			return `${names.map((rol) => `${rol}${dropRoles._options?.host !== undefined ? `@${dropRoles._options.host}` : ""}`).join(", ")}`;
		}
		return `${names}${dropRoles._options?.host !== undefined ? `@${dropRoles._options.host}` : ""}`;
	},
};
