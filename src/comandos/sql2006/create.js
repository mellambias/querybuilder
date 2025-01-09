import QueryBuilder from "../../querybuilder.js";
import { log } from "../../utils/utils.js";
export const createSchema = {
	name: (name) => name,
	authorization: (authorization) => `AUTHORIZATION ${authorization}`,
	charset: (charset) => `DEFAULT CHARACTER SET ${charset}`,
	orden: ["name", "authorization", "charset"],
};

export const createTable = {
	name: (name) => `TABLE ${name}`,
	temporary: (temporary) =>
		/^(GLOBAL|LOCAL)$/i.test(temporary)
			? `${temporary.toUpperCase()} TEMPORARY`
			: undefined,
	cols: function (cols, self) {
		const columns = Object.keys(cols).map((key) => {
			const newColumn = this.column(key, cols[key]);
			return newColumn;
		});
		if (self._options?.constraints) {
			columns.push(this.tableConstraints(self._options.constraints));
		}

		return `( ${columns.join(",\n ")} )`;
	},
	onCommit: (onCommit, self) => {
		if (self._options?.temporary && /^(PRESERVE|DELETE)$/i.test(onCommit)) {
			return `ON COMMIT ${onCommit.toUpperCase()} ROWS`;
		}
	},
	orden: ["temporary", "name", "cols", "onCommit"],
};

export const createType = {
	name: (name) => `TYPE ${name}`,
	as: (as) => `AS ${as}`,
	final: (final) => (final ? "FINAL" : "NOT FINAL"),
	orden: ["name", "as", "final"],
};

export const createDomain = {
	name: (name) => name,
	as: function (sqlType) {
		return `AS ${sqlType.toDataType(this.dataType)}`;
	},
	default: (value) => `DEFAULT ${value}`,
	constraint: ({ name, check }) => `CONSTRAINT ${name} CHECK ( ${check} )`,
	orden: ["name", "as", "default", "constraint"],
};

export const createView = {
	name: (name) => `VIEW ${name}`,
	cols: (cols) => `( ${cols.join(", ")} )`,
	as: (vista) =>
		vista instanceof QueryBuilder
			? `AS ${vista.toString({ as: "subselect" })}`
			: `AS ${vista}`,
	check: (check) => (check === true ? "WITH CHECK OPTION" : undefined),
	orden: ["name", "cols", "as", "check"],
};

export const createCursor = {
	name: (name) => name,
	changes: (changes) =>
		/^(SENSITIVE|INSENSITIVE|ASENSITIVE)$/i.test(changes)
			? changes.toUpperCase()
			: undefined,
	cursor: (cursor) =>
		/^(SCROLL|NO SCROLL)$/i.test(cursor) ? cursor.toUpperCase() : undefined,
	hold: (hold) => `${hold === true ? "WITH" : "WITHOUT"} HOLD`,
	return: (value) => `${value === true ? "WITH" : "WITHOUT"} RETURN`,
	expresion: function (expresion, self) {
		const next = self._values.next;

		if (typeof expresion === "string") {
			return `CURSOR FOR ${expresion}`;
		}
		if (expresion instanceof QueryBuilder) {
			return `CURSOR FOR ${this.getSubselect(next).join("\n")}`;
		}
		throw new Error("la expresion no es valida");
	},
	orderBy: (orderBy) => `ORDER BY ${orderBy}`,
	readOnly: (readOnly) => (readOnly === true ? "FOR READ ONLY" : undefined),
	update: (update, self) => {
		if (self._options?.readOnly === true)
			throw new Error("No puede actualizar un curson de solo lectura");
		if (Array.isArray(update)) {
			return `FOR UPDATE OF ${update.join(", ")}`;
		}
		if (typeof update === "string") {
			return `FOR UPDATE OF ${update}`;
		}
		if (update === true) {
			return "FOR UPDATE";
		}
	},
	orden: [
		"name",
		"changes",
		"cursor",
		"hold",
		"return",
		"expresion",
		"orderBy",
		"readOnly",
		"update",
	],
};
