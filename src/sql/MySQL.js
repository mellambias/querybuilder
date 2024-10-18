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
		throw new Error("No soportado utilice SET o ENUM");
	}
	createTable(name, options) {
		try {
			let sql = "CREATE";
			if (/^(GLOBAL|LOCAL)$/i.test(options?.temporary)) {
				sql += " TEMPORARY";
			}
			sql += ` TABLE ${name}`;
			if (options?.cols) {
				const columns = Object.keys(options.cols).map((key) => {
					return this.column(key, options.cols[key]);
				});

				if (options?.constraints) {
					columns.push(this.tableConstraints(options.constraints));
				}

				sql += `\n ( ${columns.join(",\n ")} )`;
			}
			return sql;
		} catch (error) {
			throw new Error(error.message);
		}
	}
}
export default MySQL;
