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
