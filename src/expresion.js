/**
 * Esta clase evita que el valor devuelto sea de tipo String
 */
class Expresion {
	constructor(expresion) {
		this.value = expresion;
		this.alias = undefined;
	}
	as(alias) {
		this.alias = alias;
		return this;
	}
	toString() {
		return `${this.value}${this.alias !== undefined ? ` AS ${this.alias}` : ""}`;
	}
	toUpperCase() {
		return this.toString().toUpperCase();
	}
	toLowerCase() {
		return this.toString().toLowerCase();
	}
}

export default Expresion;
