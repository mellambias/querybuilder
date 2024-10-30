export const createRoles = {
	secure: (secure) => (secure === true ? "IF NOT EXISTS" : undefined),
	names: function (names, self) {
		if (Array.isArray(names)) {
			return `${names.map((rol) => this.getAccount(rol, self._options?.host)).join(", ")}`;
		}
		return this.getAccount(names, self._options?.host);
	},
	orden: ["secure", "names"],
};

export const dropRoles = {
	secure: (secure) => (secure === true ? "IF EXISTS" : undefined),
	names: function (names, self) {
		if (Array.isArray(names)) {
			return `${names.map((rol) => this.getAccount(rol, self._options.host)).join(", ")}`;
		}
		return this.getAccount(names, self._options.host);
	},
	orden: ["secure", "names"],
};
