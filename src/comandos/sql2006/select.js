import Column from "../../column.js";
import Expresion from "../../expresion.js";
import QueryBuilder from "../../querybuilder.js";
export const select = {
	unique: (unique) => (unique === true ? "DISTINCT" : undefined),
	all: (all) => (all === true ? "ALL" : undefined),
	columns: (columns) => {
		if (
			typeof columns === "string" ||
			columns instanceof Column ||
			columns instanceof Expresion
		) {
			return columns;
		}
		const colStack = [];
		for (const column of columns) {
			if (typeof column === "string") {
				colStack.push(`${column}`);
			}
			if (column instanceof Column || column instanceof Expresion) {
				colStack.push(`${column}`);
			}
			if (column?.col !== undefined) {
				if (column.as !== undefined) {
					colStack.push(`${column.col} AS ${column.as}`);
				} else {
					colStack.push(`${column.col}`);
				}
			}
			// if(column instanceof QueryBuilder){
			// 	colStack.push(`${column.toString( {as:"subquery"})} AS `)
			// }
		}
		return colStack.join(", ");
	},
	orden: ["unique", "all", "columns"],
};
