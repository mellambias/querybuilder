import Column from "../../column.js";
import Expresion from "../../expresion.js";
import QueryBuilder from "../../querybuilder.js";
import { log } from "../../utils/utils.js";
export const select = {
	unique: (unique) => (unique === true ? "DISTINCT" : undefined),
	all: (all) => (all === true ? "ALL" : undefined),
	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	columns: function (columns, self) {
		console.log("[columns]self._values.next", self._values.next);
		if (
			typeof columns === "string" ||
			columns instanceof Column ||
			columns instanceof Expresion
		) {
			return columns;
		}
		if (columns instanceof QueryBuilder) {
			log(["sql2006", "select"], " Es un QB");
			// colStack.push(`${column.toString( {as:"subquery"})} AS `)
			return self._values.next.q.pop();
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
			if (column instanceof QueryBuilder) {
				console.log("[sql2006][select] ");
				// colStack.push(`${column.toString( {as:"subquery"})} AS `)
			}
		}
		return colStack.join(", ");
	},
	orden: ["unique", "all", "columns"],
};
