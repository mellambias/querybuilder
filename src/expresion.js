/**
 * Esta clase evita que el valor devuelto sea de tipo String
 */
class Expresion {
	constructor(expresion) {
		this.value = expresion;
	}
	toString() {
		return this.value;
	}
}

export default Expresion;
