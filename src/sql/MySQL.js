/*
Implementa las variaciones al SQL2006 propias del SGBD
*/
import Core from "../core.js";
class MySQL extends Core {
	constructor() {
		super();
		this.dataType = "mysql";
	}
	createSchema(name, options) {
		super.createDatabase(name, options);
	}
	dropSchema(name, options) {
		super.dropDatabase(name, options);
	}
	createType(name, options) {
		return "No soportado utilice SET o ENUM";
	}
}
export default MySQL;
