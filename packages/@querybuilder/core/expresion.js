/**
 * Esta clase evita que el valor devuelto sea de tipo String
 */

/**
 * @class Expresion
 * @description Clase que representa una expresión SQL con soporte para alias.
 * Permite definir una expresión y asignarle un alias opcional.
 * Proporciona métodos para convertir la expresión a mayúsculas o minúsculas.
 * @param {string} expresion - La expresión SQL.
 * @returns {Expresion} Una instancia de la clase Expresion.
 * @example
 * const expr = new Expresion("COUNT(*)").as("total");
 * console.log(expr.toString()); // "COUNT(*) AS total"
 * console.log(expr.toUpperCase()); // "COUNT(*) AS TOTAL"
 * console.log(expr.toLowerCase()); // "count(*) as total"
 */
class Expresion {
	constructor(expresion) {
		this.value = expresion;
		this.alias = undefined;
	}
	/**
	 * @method as
	 * @description Asigna un alias a la expresión.
	 * @param {string} alias - Asigna un alias a la expresión.
	 */
	as(alias) {
		this.alias = alias;
		return this;
	}
	/**
	 * @method toString
	 * @description Convierte la expresión a una cadena de texto, incluyendo el alias si está definido.
	 * @returns {string} La representación en cadena de la expresión con su alias.
	 */
	toString() {
		return `${this.value}${this.alias !== undefined ? ` AS ${this.alias}` : ""}`;
	}
	/**
	 * @method toUpperCase
	 * @description Convierte la expresión a mayúsculas.
	 * @returns {string} La expresión en mayúsculas.
	 */
	toUpperCase() {
		return this.toString().toUpperCase();
	}
	/**
	 * @method toLowerCase
	 * @description Convierte la expresión a minúsculas.
	 * @returns {string} La expresión en minúsculas.
	 */
	toLowerCase() {
		return this.toString().toLowerCase();
	}
}

export default Expresion;
