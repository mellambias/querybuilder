import QueryBuilder from "../../querybuilder.js";
import { log } from "../../utils/utils.js";

export const constraint = {
	name: (name) => `${name}`,
	type: (type, self) =>
		/^(NOT NULL|UNIQUE|PRIMARY KEY)$/i.test(type)
			? `${type.toUpperCase()} ${self.cols(self._values.cols)}`
			: undefined,
	cols: (cols) => `(${cols.join(", ")})`,
	foreignKey: function (data, self) {
		const foreingKey = {
			table: (table) =>
				`FOREIGN KEY ${self.cols(self._values.cols)} REFERENCES ${table}`,
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
	check: (check, self) => {
		if (check instanceof QueryBuilder) {
			log(
				["sql2006", "constraint", "check"],
				"Es un QB leer values",
				self._values.next,
			);
			return `CHECK ( ${self._values?.next.q.pop()} )`;
		}
		return `CHECK ( ${check} )`;
	},
	orden: ["name", "type", "foreignKey", "check"],
};
