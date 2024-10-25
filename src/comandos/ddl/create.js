import QueryBuilder from "../../querybuilder.js";
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
	cols: function (cols) {
		const columns = Object.keys(cols).map((key) => {
			return this.column(key, cols[key]);
		});
		if (createTable._options?.constraints) {
			columns.push(this.tableConstraints(createTable._options.constraints));
		}
		return `( ${columns.join(",\n ")} )`;
	},
	onCommit: (onCommit) => {
		if (
			createTable._options?.temporary &&
			/^(PRESERVE|DELETE)$/i.test(onCommit)
		) {
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
			? `AS ${vista.toString().replace(";", "")}`
			: `AS ${vista}`,
	check: (check) => (check === true ? "WITH CHECK OPTION" : undefined),
	orden: ["name", "cols", "as", "check"],
};
