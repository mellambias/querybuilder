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
			if (column instanceof QueryBuilder) {
				const colValue = next.q.pop();
				if (colValue instanceof Column || colValue instanceof Expresion) {
					log(
						["sql2006", "select"],
						"col isColumn: %o, isExpresion: %o valor:%s indice:%o",
						colValue instanceof Column,
						colValue instanceof Expresion,
						colValue,
						index,
					);

					colStack[index] = `${colValue}`;
					log("despues QB", "colStack", colStack);
				} else {
					log(
						["sql2006", "columns", "colValue?.col"],
						"colValue colStack",
						colValue,
						colStack,
					);
					colStack[index] = `${colValue}`;
				}
			}

			log("despues column?.col", "colStack", colStack);
		}
		return colStack.reverse().join(", ");
	},
	orden: ["unique", "all", "columns"],
};
