import Column from "../../column.js";
import Expresion from "../../expresion.js";
import QueryBuilder from "../../querybuilder.js";
import { log } from "../../utils/utils.js";
export const select = {
	unique: (unique) => (unique === true ? "DISTINCT" : undefined),
	all: (all) => (all === true ? "ALL" : undefined),
	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	columns: function (columns, self) {
		const next = self._values.next;
		// log(["sql2006", "select", "columns"], "self._values.next", next);
		if (
			typeof columns === "string" ||
			columns instanceof Column ||
			columns instanceof Expresion
		) {
			return columns;
		}
		if (columns instanceof QueryBuilder) {
			log(["sql2006", "select", "QueryBuilder"], " Es un QB");
			// colStack.push(`${column.toString( {as:"subquery"})} AS `)
			return next.q.pop();
		}
		columns.reverse();
		log(
			["sql2006", "select"],
			"Procesa lista de columnas valores en q%o",
			next.q,
		);
		const colStack = Array(columns.length);
		for (const [index, column] of columns.entries()) {
			log("antes", "colStack", colStack);
			if (typeof column === "string") {
				colStack[index] = `${column}`;
			}
			if (column instanceof Expresion) {
				log(
					["sql2006", "select"],
					"isExpresion: %o",
					column instanceof Expresion,
				);
				colStack[index] = `${column}`;
			}
			if (column instanceof Column) {
				log(
					["sql2006", "select"],
					"col isColumn: %o",
					column instanceof Column,
				);
				if (column.name instanceof QueryBuilder) {
					const resolve = this.getSubselect(next, true);
					column.name = Array.isArray(resolve) ? resolve.join("\n") : resolve;
				}
				colStack[index] = `${column}`;
			}
			if (column instanceof QueryBuilder) {
				const colValue = next.q.pop();
				log(
					["sql2006", "columns", "colValue?.col"],
					"colValue colStack",
					colValue,
					colStack,
				);
				colStack[index] = `${colValue}`;
			}

			log("despues column?.col", "colStack", colStack);
		}
		return colStack.reverse().join(", ");
	},
	orden: ["unique", "all", "columns"],
};
