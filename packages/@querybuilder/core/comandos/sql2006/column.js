/**
 * @file Comando SQL2006 COLUMN
 * @module comandos/sql2006/column
 * @description Objeto que representa el comando COLUMN del estándar SQL2006.
 */

/**
 * @name column
 * @description Objeto que representa el comando COLUMN del estándar SQL2006.
 * Permite construir definiciones de columnas para sentencias SQL.
 * @property {String} name - el nombre de la columna y su tipo de datos.
 * @property {String} type - el tipo de datos de la columna.
 * @property {String} values=NOT NULL|UNIQUE|PRIMARY KEY - valores como NOT NULL, UNIQUE o PRIMARY KEY.
 * @property {ANY} default - el valor por defecto de la columna.
 * @property {Array<object>} foreingKey - una clave foránea que referencia a otra tabla.
 * @property {String} check - una restricción CHECK para la columna.
 *
 */
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
