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
}
export default PostgreSQL;
