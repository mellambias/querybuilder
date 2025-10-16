/**
 * @fileoverview Comandos para la cláusula SELECT.
 * @module comandos/sql2006/select
 * @description Módulo que implementa el comando SELECT del estándar SQL2006 (ISO/IEC 9075).
 * Permite construir sentencias SQL para consultar datos de una o más tablas en una base de datos.
 * @version 2.0.0
 */
import Column from "../../column.js";
import Expresion from "../../expresion.js";
import QueryBuilder from "../../querybuilder.js";
import { log } from "../../utils/utils.js";

/**
 * @namespace select
 * @description Objeto que representa el comando SELECT del estándar SQL2006.
 * Permite construir sentencias SQL para consultar datos de una o más tablas en una base de datos.
 * @property {boolean} unique - Si es true, incluye "DISTINCT" en la sentencia.
 * @property {boolean} all - Si es true, incluye "ALL" en la sentencia.
 * @property {String|Column|Expresion|QueryBuilder|Array<String|Column|Expresion|QueryBuilder>} columns - Las columnas a seleccionar.
 * Puede ser una cadena, una instancia de Column, Expresion, QueryBuilder, o un array de estos tipos.
 * Si es un QueryBuilder, se trata como una subconsulta.
 * Si es un array, se unen las columnas con comas.
 * Si es un objeto plano, se puede usar { col: "NOMBRE_COLUMNA", as: "ALIAS" } para alias.
 */
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
			// Manejar objetos planos como { col: "DISCOS", as: "ID_DISCO" }
			if (typeof column === "object" && !Array.isArray(column) &&
				!(column instanceof Column) && !(column instanceof Expresion) && !(column instanceof QueryBuilder)) {
				if (column.col && column.as) {
					colStack[index] = `${column.col} AS ${column.as}`;
				} else if (column.col) {
					colStack[index] = `${column.col}`;
				}
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
