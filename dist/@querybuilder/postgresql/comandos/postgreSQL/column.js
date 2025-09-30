/**
 * { 
		column_name data_type [ STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN | DEFAULT } ] [ COMPRESSION compression_method ]
		[ COLLATE collation ] [ column_constraint [ ... ] ]
		| table_constraint
		| LIKE source_table [ like_option ... ] 
	}
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
	storage: (type) => {
		if (/^(PLAIN|EXTERNAL|EXTENDED|MAIN|DEFAULT)$/i.test(type)) {
			return `STORAGE ${type.toUpperCase()}`;
		}
	},
	compression: (type, self) => {
		if (/^(EXTENDED|MAIN)$/i.test(self._values.options.storage)) {
			if (/^(pglz|lz4)$/i.test(type)) {
				return `COMPRESSION ${type}`;
			}
		}
	},
	collate: (lang) => `COLLATE "${lang}"`,
	values: (values) => {
		return values
			.filter((value) =>
				/^(NOT NULL|UNIQUE|PRIMARY KEY|NO INHERIT)$/i.test(value),
			)
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
	calculated: (expresion) => {
		//GENERATED ALWAYS AS ( generation_expr ) STORED
		return `GENERATED ALWAYS AS ( ${expresion} ) STORED`;
	},
	identity: (data) => {
		//GENERATED { ALWAYS | BY DEFAULT } AS IDENTITY [ ( sequence_options ) ]
		// See CREATE SEQUENCE for details
		const { type, options } = data;
		if (/^(ALWAYS|BY DEFAULT)$/i.test(type)) {
			return `GENERATED ${type.toUpperCase()} AS IDENTITY${Array.isArray(options) ? ` ( ${options.join(", ")} )` : ""}`;
		}
		return undefined;
	},
	orden: [
		"name",
		"type",
		"storage",
		"compression",
		"collate",
		"values",
		"default",
		"foreingKey",
		"check",
		"calculated",
		"identity",
	],
};
