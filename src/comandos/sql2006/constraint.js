export const constraint = {
	name: (name) => `${name}`,
	type: (type) =>
		/^(NOT NULL|UNIQUE|PRIMARY KEY)$/i.test(type)
			? `${type.toUpperCase()} ${constraint.cols(constraint._values.cols)}`
			: undefined,
	cols: (cols) => `(${cols.join(", ")})`,
	foreignKey: function (data) {
		const foreingKey = {
			table: (table) =>
				`FOREIGN KEY ${constraint.cols(constraint._values.cols)} REFERENCES ${table}`,
			cols: (cols) => `(${cols.join(", ")})`,
			match: (match) =>
				/^(FULL|PARTIAL|SIMPLE)$/i.test(match)
					? `MATCH ${match.toUpperCase()}`
					: undefined,
			actions: (actions) => {
				const result = [];
				if (actions?.onUpdate) {
					result.push(
						`ON UPDATE ${/^(CASCADE|SET NULL|SET DEFAULT|RESTRICT|NO ACTION)$/i.test(actions?.onUpdate) ? actions?.onUpdate.toUpperCase() : undefined}`,
					);
				}
				if (actions?.onDelete) {
					result.push(
						`ON DELETE ${/^(CASCADE|SET NULL|SET DEFAULT|RESTRICT|NO ACTION)$/i.test(actions?.onDelete) ? actions?.onDelete.toUpperCase() : undefined}`,
					);
				}
				return result.join(" ");
			},
			orden: ["table", "cols", "match", "actions"],
		};

		return this.getStatement("", foreingKey, data, " ");
	},
	check: (check) => `CHECK ( ${check} )`,
	orden: ["name", "type", "foreignKey", "check"],
};
