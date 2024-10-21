/*
Implementa las variaciones al SQL2006 propias del SGBD
*/
import Core from "../core.js";
class PostgreSQL extends Core {
	constructor() {
		super();
		this.dataType = "postgres";
	}
	dropDatabase(name, options) {
		let query = "DROP DATABASE";
		if (options?.exist === true) {
			query += " IF EXISTS";
		}
		if (options?.force === true) {
			return `${query} ${name} WITH (FORCE)`;
		}
		return `${query} ${name}`;
	}

	use(database) {
		// no implementa este comando, debe cerrar y abrir una nueva conexion
		return null;
	}
	createAssertion(name, assertion) {
		/*
	El estándar SQL incluye assertions como una forma de crear restricciones más complejas a nivel de base de datos, 
	pero la mayoría de los sistemas no han implementado esta característica.
	*/
		throw new Error(
			"Este lenguaje no soporta los 'createAssertion' use 'TRIGGERS' o 'Constraints' ",
		);
	}
}
export default PostgreSQL;
