import QueryBuilder from "../../querybuilder.js";
export const createView = {
	replace: (replace) => (replace === true ? "OR REPLACE" : ""),
	algorithm: (algorithm) =>
		/^(UNDEFINED|MERGE|TEMPTABLE)$/i.test(algorithm)
			? `ALGORITHM=${algorithm.toUpperCase()}`
			: "",
	user: (user) => (user !== undefined ? `DEFINER=${user}` : ""),
	security: (security) =>
		/^(DEFINER|INVOKER)$/i.test(security)
			? `SQL SECURITY ${security.toUpperCase()}`
			: undefined,
	name: (name) => `VIEW ${name}`,
	cols: (cols) => `( ${cols.join(", ")} )`,
	as: function (vista, self) {
		if (vista instanceof QueryBuilder) {
			const resolve = this.getSubselect(self._values.next);
			return `AS ${Array.isArray(resolve) ? resolve.join("\n") : resolve}`;
		}
		return `AS ${vista}`;
	},
	mode: (mode) =>
		/^(CASCADED|LOCAL)$/i.test(mode) ? ` ${mode.toUpperCase()}` : "",
	check: (check, self) =>
		check === true
			? `WITH${self.mode(self._options?.with)} CHECK OPTION`
			: undefined,
	orden: [
		"replace",
		"algorithm",
		"user",
		"security",
		"name",
		"cols",
		"as",
		"check",
	],
};
/**
 * @type createTable
 * @prop {GLOBAL|LOCAL} temporary - Tipo de tabla
 * @prop {BOOLEAN} secure - crea si no existe
 */
export const createTable = {
	columns: [],
	temporary: (temporary) =>
		/^(GLOBAL|LOCAL)$/i.test(temporary)
			? `${temporary.toUpperCase()} TEMPORARY`
			: undefined,
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
	orden: ["temporary", "table", "secure", "name", "cols"],
};
