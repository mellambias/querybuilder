/**
 * @paramn { Object<columns>} as  - crear tipos compuestos que pueden utilizarse cpmp argumentos o tipos devueltos por una función
 * @paramn { Array<strings>} enum - crea tipos enumerados
 */
import { column } from "./column.js";

export const createType = {
	name: (name) => `TYPE ${name}`,
	as: function (value, self) {
		// Si es un string simple, es un tipo base
		if (typeof value === 'string') {
			if (value === 'ENUM') {
				// Si hay valores para el ENUM, los incluimos
				if (self._options?.values && Array.isArray(self._options.values)) {
					return `AS ENUM ('${self._options.values.join("', '")}')`;
				}
				return 'AS ENUM';
			}

			if (value === 'COMPOSITE') {
				// Para tipos compuestos, buscar los atributos
				if (self._options?.attributes && typeof self._options.attributes === 'object') {
					const columns = Object.keys(self._options.attributes).map((key) => {
						const columnDef = self._options.attributes[key];
						if (typeof columnDef === 'string') {
							return `${key} ${columnDef}`;
						} else if (typeof columnDef === 'object') {
							return `${key} ${columnDef.type || 'TEXT'}`;
						}
						return `${key} TEXT`;
					});

					return `AS (\n  ${columns.join(',\n  ')}\n)`;
				}
			}

			// Otros tipos como NUMERIC(8,2), VARCHAR(255), etc.
			return `AS ${value}`;
		}

		// Si es un objeto, es un tipo compuesto directo
		if (typeof value === 'object' && value !== null) {
			const columns = Object.keys(value).map((key) => {
				const columnDef = value[key];
				if (typeof columnDef === 'string') {
					return `${key} ${columnDef}`;
				} else if (typeof columnDef === 'object') {
					return `${key} ${columnDef.type || 'TEXT'}`;
				}
				return `${key} TEXT`;
			});

			return `AS (\n  ${columns.join(',\n  ')}\n)`;
		}

		return `AS ${value}`;
	},
	enum: (labels) => {
		if (Array.isArray(labels)) {
			return `AS ENUM\n( ${labels.map((label) => `'${label}'`).join(", ")} )`;
		}
	},
	orden: ["name", "as", "enum"],
};

/**
 * CREATE DOMAIN - Crear un dominio de datos personalizado
 * @param {object} params - Parámetros del comando
 * @param {string} params.name - Nombre del dominio
 * @param {object} params.options - Opciones del dominio
 * @returns {string} SQL para crear dominio
 */
export const createDomain = {
	name: (name) => `DOMAIN ${name}`,
	dataType: (dataType) => `AS ${dataType}`,
	default: (defaultValue) => `DEFAULT ${defaultValue}`,
	constraint: (constraint) => constraint,
	notNull: (notNull) => notNull ? 'NOT NULL' : '',
	collate: (collate) => `COLLATE ${collate}`,
	orden: ["name", "dataType", "default", "constraint", "notNull", "collate"],
};

/**
 * CREATE [ { TEMPORARY | TEMP } | UNLOGGED ] TABLE
[ IF NOT EXISTS ] table_name ( [
	{ 
		column_name data_type [ STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN | DEFAULT } ] [ COMPRESSION compression_method ]
		[ COLLATE collation ] [ column_constraint [ ... ] ]
		| table_constraint
		| LIKE source_table [ like_option ... ] 
	}
	[, ... ]
] )
[ INHERITS ( parent_table [, ... ] ) ]
[ PARTITION BY { RANGE | LIST | HASH } ( { column_name | ( expression ) } [ COLLATE collation ] [ opclass ] [, ... ] ) ]
[ USING method ]
[ WITH ( storage_parameter [= value] [, ... ] ) | WITHOUT OIDS ]
[ ON COMMIT { PRESERVE ROWS | DELETE ROWS | DROP } ]
[ TABLESPACE tablespace_name ]

(data_type capitulo 8)

 */
export const createTable = {
	columns: [],
	temporary: (temporary) => {
		if (/^(GLOBAL|LOCAL)$/i.test(temporary)) {
			return `${temporary.toUpperCase()} TEMPORARY`;
		}
		if (temporary) {
			return "TEMPORARY";
		}
	},
	unlogged: (value, self) => {
		if (self._options?.temporary) {
			return undefined;
		}
		if (value) {
			return "UNLOGGED";
		}
		return undefined;
	},
	table: (table) => table,
	secure: (secure) => (secure === true ? "IF NOT EXISTS" : undefined),
	name: (name) => `${name}`,
	cols: function (cols, self) {
		self.columns = Object.keys(cols).map((key) => {
			if (cols[key]?.foreingKey !== undefined) {
				const fk = this.column(key, cols[key]);
				const fk_col = {
					name: `FK_${cols[key].foreingKey.table}`,
					type: "foreign key",
					cols: [key],
					foreignKey: cols[key].foreingKey,
				};
				if (self._options?.constraints !== undefined) {
					self._options.constraints.push(this.tableConstraints(fk_col));
				} else {
					self._options.constraints = [fk_col];
				}
				return fk;
			}
			return this.column(key, cols[key]);
		});
		if (self._options?.constraints) {
			self.columns.push(this.tableConstraints(self._options.constraints));
		}
		return `\n( ${self.columns.join(",\n ")} )`;
	},
	inherits: (parentTables) => {
		//[ INHERITS ( parent_table [, ... ] ) ]
		//Parent tables can be plain tables or foreign tables
		if (Array.isArray(parentTables)) {
			return `INHERITS ( ${parentTables.join(", ")} )`;
		}
		return `INHERITS ( ${parentTables} )`;
	},
	partition: (data) => {
		// [ PARTITION BY { RANGE | LIST | HASH } ( { column_name | ( expression ) } [ COLLATE collation ] [ opclass ] [, ... ] ) ]
		const { type, cols } = data;
		if (/^(RANGE|LIST|HASH)/i.test(type)) {
			return `PARTITION BY ${type} ( ${cols.join(", ")} )`;
		}
	},
	using: (metodo) => {
		//[ USING method ]
		return `USING ${metodo}`;
	},
	with: (value) => {
		//[ WITH ( storage_parameter [= value] [, ... ] ) | WITHOUT OIDS ]
		return `WITH ( ${value} )`;
	},
	onCommit: (value) => {
		//[ ON COMMIT { PRESERVE ROWS | DELETE ROWS | DROP } ]
		if (/^(PRESERVE ROWS|DELETE ROWS|DROP)/i.test(value)) {
			return `ON COMMIT ${value.toUpperCase()}`;
		}
		// Support simplified values (case-insensitive)
		const lowerValue = value?.toLowerCase();
		if (lowerValue === "delete") {
			return "ON COMMIT DELETE ROWS";
		}
		if (lowerValue === "preserve") {
			return "ON COMMIT PRESERVE ROWS";
		}
		if (lowerValue === "drop") {
			return "ON COMMIT DROP";
		}
	},
	tablespace: (name) => {
		//[ TABLESPACE tablespace_name ]
		return `TABLESPACE ${name}`;
	},
	orden: [
		"temporary",
		"unlogged",
		"table",
		"secure",
		"name",
		"cols",
		"inherits",
		"partition",
		"using",
		"with",
		"onCommit",
		"tablespace",
	],
};

/**
 * table_constraint is:
[ CONSTRAINT constraint_name ]
{ CHECK ( expression ) [ NO INHERIT ] |
UNIQUE [ NULLS [ NOT ] DISTINCT ] ( column_name
[, ... ] ) index_parameters |
PRIMARY KEY ( column_name [, ... ] ) index_parameters |
EXCLUDE [ USING index_method ] ( exclude_element WITH operator
[, ... ] ) index_parameters [ WHERE ( predicate ) ] |
FOREIGN KEY ( column_name [, ... ] ) REFERENCES reftable
[ ( refcolumn [, ... ] ) ]
[ MATCH FULL | MATCH PARTIAL | MATCH SIMPLE ] [ ON
DELETE referential_action ] [ ON UPDATE referential_action ] }
[ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY
IMMEDIATE ]

like_option is:
{ INCLUDING | EXCLUDING } { COMMENTS | COMPRESSION | CONSTRAINTS |
DEFAULTS | GENERATED | IDENTITY | INDEXES | STATISTICS | STORAGE |
ALL }

partition_bound_spec is:
IN ( partition_bound_expr [, ...] ) |
FROM ( { partition_bound_expr | MINVALUE | MAXVALUE } [, ...] )
TO ( { partition_bound_expr | MINVALUE | MAXVALUE } [, ...] ) |
WITH ( MODULUS numeric_literal, REMAINDER numeric_literal )

index_parameters in UNIQUE, PRIMARY KEY, and EXCLUDE constraints
are:
[ INCLUDE ( column_name [, ... ] ) ]
[ WITH ( storage_parameter [= value] [, ... ] ) ]
[ USING INDEX TABLESPACE tablespace_name ]

exclude_element in an EXCLUDE constraint is:
{ column_name | ( expression ) } [ COLLATE collation ] [ opclass
[ ( opclass_parameter = value [, ... ] ) ] ] [ ASC | DESC ]
[ NULLS { FIRST | LAST } ]

referential_action in a FOREIGN KEY/REFERENCES constraint is:
{ NO ACTION | RESTRICT | CASCADE | SET NULL [ ( column_name
[, ... ] ) ] | SET DEFAULT [ ( column_name [, ... ] ) ] }
 */
