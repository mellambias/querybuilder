export const column = {
	name: function (name, self) {
		if (typeof self._values.options === "string") {
			const dataType = self._values.options.toDataType(this.dataType);
			return `${name.validSqlId()} ${dataType}`;
		}
	},
	type: function (type, self) {
		return `${self._values.name.validSqlId()} ${type.toDataType(this.dataType)}`;
	},
	values: (values) => {
		return values
			.filter((value) => /^(NOT NULL|UNIQUE|PRIMARY KEY)$/i.test(value))
			.map((value) => value.toUpperCase())
			.join(" ");
	},
	default: (valor) =>
		`DEFAULT ${typeof valor === "string" ? `'${valor}'` : valor}`,
	foreingKey: function (data) {
		const commandForm = {
			table: (name) => name,
			cols: (cols) => `(${Array.isArray(cols) ? cols.join(", ") : cols})`,
			match: (match) =>
				/^(FULL|PARTIAL|SIMPLE)$/i.test(match)
					? `MATCH ${match.toUpperCase()}`
					: undefined,
			check: (check) => `CHECK ( ${check} )`,
			orden: ["table", "cols", "match"],
		};
		return this.getStatement("REFERENCES", commandForm, { ...data }, " ");
	},
	check: (check) => `CHECK ( ${check} )`,
	orden: ["name", "type", "values", "default", "foreingKey", "check"],
};
