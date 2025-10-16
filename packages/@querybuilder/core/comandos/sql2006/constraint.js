/**
 * @file Comando SQL2006 CONSTRAINT.
 * @module comandos/sql2006/constraint
 * @description Objeto que representa el comando CONSTRAINT del estándar SQL2006.
 */

import QueryBuilder from "../../querybuilder.js";
import { log } from "../../utils/utils.js";

/**
 * @name constraint
 * @description Objeto que representa el comando CONSTRAINT del estándar SQL2006.
 * Permite construir definiciones de restricciones para sentencias SQL.
 * @property {String} name - el nombre de la restricción.
 * @property {String} type - el tipo de restricción (NOT NULL, UNIQUE, PRIMARY KEY) y las columnas asociadas.
 * @property {Array<String>} cols - las columnas asociadas a la restricción.
 * @property {Object} foreignKey - una clave foránea que referencia a otra tabla.
 * @property {String | QueryBuilder} check - una restricción CHECK para la tabla o columna.
 */
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
