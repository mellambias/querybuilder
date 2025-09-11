/**
* @param {boolean} secure - Do not throw an error if the type does not exist. A notice is issued in this case.
* @param {string} name - The name (optionally schema-qualified) of the data type to remove.
* @param {boolean} CASCADE - Automatically drop objects that depend on the type (such as table columns, functions, and operators),
and in turn all objects that depend on those objects (see Section 5.14).
* @param {boolean} RESTRICT - Refuse to drop the type if any objects depend on it. This is the default.
 */

export const dropType = {
	_option: undefined,
	secure: (value) => (value ? "IF EXISTS" : undefined),
	name: (names) => {
		if (Array.isArray(names)) {
			return names.join(", ");
		}
		return names;
	},
	cascade: (value, self) => {
		if (self._option === undefined) {
			self._option = value ? "CASCADE" : undefined;
			return self._option;
		}
		return undefined;
	},
	restrict: (value, self) => {
		if (self._option === undefined) {
			self._option = value ? "RESTRICT" : undefined;
			return self._option;
		}
		return undefined;
	},
	option: (value, self) => {
		if (self._option === undefined) {
			if (/^(CASCADE|RESTRICT)$/i.test(value)) {
				self._option = value.toUpperCase();
				return self._option;
			}
		}
		return undefined;
	},
	orden: ["secure", "name", "restrict", "cascade", "option"],
};
