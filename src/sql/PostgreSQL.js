/*
Implementa las variaciones al SQL2006 propias del SGBD
*/
import Core from "../core.js";
import postgreSQL from "../comandos/postgreSQL.js";
class PostgreSQL extends Core {
	constructor() {
		super();
		this.dataType = "postgresql"; // especifica el tipo de datos usado
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
		// PostgreSQL no implementa esta instrucción
		return null;
	}
	createType(name, options) {
		return this.getStatement(
			"CREATE",
			postgreSQL.createType,
			{ name, options },
			" ",
		);
	}
	dropType(name, options) {
		return this.getStatement(
			"DROP TYPE",
			postgreSQL.dropType,
			{ name, options },
			" ",
		);
	}

	createTable(name, options) {
		try {
			const sql = this.getStatement(
				"CREATE",
				postgreSQL.createTable,
				{
					name,
					options,
					table: "TABLE",
				},
				" ",
			);
			return sql;
		} catch (error) {
			throw new Error(`createTable error ${error.message}`);
		}
	}
	column(name, options) {
		const resultado = this.getStatement(
			"",
			postgreSQL.column,
			{ name, options },
			" ",
		).trim();
		return resultado;
	}
	dropTable(name, options) {
		return this.getStatement(
			"DROP TABLE",
			postgreSQL.dropType,
			{ name, options },
			" ",
		);
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
	createRoles(names, options) {
		const stack = [];
		if (Array.isArray(names)) {
			for (const name in names) {
				if (Array.isArray(options)) {
					if (options[name] !== undefined) {
						stack.push(this.createRoles(names[name], options[name]));
						continue;
					}
					stack.push(this.createRoles(names[name], {}));
					continue;
				}
				stack.push(this.createRoles(names[name], options));
			}
			return stack.join(";\n");
		}
		return this.getStatement(
			"CREATE ROLE",
			postgreSQL.createRoles,
			{ names, options },
			" ",
		);
	}
	limit(limit) {
		return `LIMIT ${limit}`;
	}
	offset(offset) {
		return `OFFSET ${offset}`;
	}
}
export default PostgreSQL;
