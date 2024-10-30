export const createRoles = {
	secure: (secure) => (secure === true ? "IF NOT EXISTS" : undefined),
	names: (names, self) => {
		if (Array.isArray(names)) {
			return `${names.map((rol) => `${rol}${self._options?.host !== undefined ? `@${self._options.host}` : ""}`).join(", ")}`;
		}
		return `${names}${self._options.host !== undefined ? `@${self._options.host}` : ""}`;
	},
	orden: ["secure", "names"],
};

export const dropRoles = {
	secure: (secure) => (secure === true ? "IF EXIXTS" : undefined),
	names: (names, self) => {
		if (Array.isArray(names)) {
			return `${names.map((rol) => `${rol}${self._options?.host !== undefined ? `@${self._options.host}` : ""}`).join(", ")}`;
		}
		return `${names}${self._options?.host !== undefined ? `@${self._options.host}` : ""}`;
	},
};
