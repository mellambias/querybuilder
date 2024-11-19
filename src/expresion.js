/**
 * Esta clase evita que el valor devuelto sea de tipo String
 */
class Expresion {
	constructor(expresion) {
		this.value = expresion;
		this.alias = undefined;
	}
	toString() {
		return `${this.value}${this.alias !== undefined ? ` AS ${this.alias}` : ""}`;
	}
	as(alias) {
		this.alias = alias;
		return this;
	}
}

export default Expresion;
