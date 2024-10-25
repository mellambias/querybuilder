/*
Implementa las variaciones al SQL2006 propias del SGBD
*/
import Core from "../core.js";
import QueryBuilder from "../querybuilder.js";
import { dropTable } from "../comandos/ddl.js";
class MySQL extends Core {
	constructor() {
		super();
		this.dataType = "mysql";
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
			sql += " TABLE ";
			if (options?.secure === true) {
				sql += "IF NOT EXISTS ";
			}
			sql += name;
			if (options?.cols) {
				const columns = Object.keys(options.cols).map((key) => {
					if (options.cols[key]?.foreingKey !== undefined) {
						const fk = this.column(key, options.cols[key]);
						const fk_col = {
							name: `FK_${options.cols[key].foreingKey.table}`,
							type: "foreign key",
							cols: [key],
							foreignKey: options.cols[key].foreingKey,
						};
						if (options?.constraints !== undefined) {
							options.constraints.push(this.tableConstraints(fk_col));
						} else {
							options.constraints = [fk_col];
						}
						return fk;
					}
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
	dropTable(name, options) {
		const MySqlDropTable = {
			...dropTable,
			temporary: (temporary) => (temporary === true ? "TEMPORARY" : undefined),
			table: (table) => table,
			name: (name) => name,
			secure: (secure) => (secure === true ? "IF EXISTS" : undefined),
			orden: ["temporary", "table", "secure", "name", "option"],
		};
		//return sql;
		return this.getStatement(
			"DROP",
			MySqlDropTable,
			{
				name,
				table: "TABLE",
				options,
			},
			" ",
		);
	}
	createDomain(name, options) {
		/*
		* Sin soporte de CREATE DOMAIN: MySQL no soporta directamente la creación de dominios, 
		por lo que debes aplicar restricciones directamente en cada tabla que necesite el comportamiento específico.
		Restricción CHECK: A partir de MySQL 8.0.16, puedes utilizar la cláusula CHECK para definir reglas de validación a nivel de columna.
		Triggers: Si necesitas restricciones en versiones anteriores de MySQL o si quieres más flexibilidad en la validación de reglas, puedes usar triggers.
		*/
		throw new Error(
			"Este lenguaje no soporta los 'Dominios' use 'CHECK' o 'TRIGGERS' ",
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
		const createRole = {
			secure: (secure) => (secure === true ? "IF NOT EXISTS" : undefined),
			names: (names) => {
				if (Array.isArray(names)) {
					return `${names.map((rol) => `${rol}${createRole._options?.host !== undefined ? `@${createRole._options.host}` : ""}`).join(", ")}`;
				}
				return `${names}${createRole._options.host !== undefined ? `@${createRole._options.host}` : ""}`;
			},
			orden: ["secure", "names"],
		};
		return this.getStatement(
			"CREATE ROLE",
			createRole,
			{ names, options },
			" ",
		);
	}
	dropRoles(names, options) {
		let sql = "DROP ROLE ";
		if (options?.secure === true) {
			sql += "IF EXISTS ";
		}
		if (Array.isArray(names)) {
			sql += `${names.map((rol) => `${rol}${options?.host !== undefined ? `@${options.host}` : ""}`).join(", ")}`;
		} else {
			sql += `${names}${options?.host !== undefined ? `@${options.host}` : ""}`;
		}
		return sql;
	}
	grant(privilegios, on, to, options) {
		let sql = "GRANT ";
		sql += this.privilegios(privilegios);
		sql += this.onObjects(on);
		sql += `\nTO ${to.join(", ")}`;
		return sql;
	}
	revoke(privilegios, on, from, options) {
		let sql = "REVOKE ";
		if (options?.secure === true) {
			sql += "IF EXISTS ";
		}
		sql += this.privilegios(privilegios);
		sql += this.onObjects(on);
		if (Array.isArray(from)) {
			sql += `\nFROM ${from.join(", ")}`;
		} else {
			sql += `\nFROM ${from}`;
		}
		if (options?.secure === true) {
			sql += "\nIGNORE UNKNOWN USER";
		}
		return sql;
	}

	// 15.1.23 CREATE VIEW Statement
	createView(name, options) {
		const commandFormat = {
			replace: (replace) => (replace === true ? "OR REPLACE" : ""),
			algorithm: (algorithm) =>
				/^(UNDEFINED|MERGE|TEMPTABLE)$/i.test(algorithm)
					? `ALGORITHM=${algorithm.toUpperCase()}`
					: "",
			user: (user) => (user !== undefined ? `DEFINER=${user}` : ""),
			security: (security) =>
				/^(DEFINER|INVOKER)$/i.test(security)
					? `SQL SECURITY ${security.toUpperCase()}`
					: undefined,
			name: (name) => `VIEW ${name}`,
			cols: (cols) => `( ${cols.join(", ")} )`,
			as: (vista) => {
				if (vista instanceof QueryBuilder) {
					return `AS ${vista.toString().replace(";", "")}`;
				}
				return `AS ${vista}`;
			},
			mode: (mode) =>
				/^(CASCADED|LOCAL)$/i.test(mode) ? ` ${mode.toUpperCase()}` : "",
			check: (check) =>
				check === true
					? `WITH${commandFormat.mode(options?.with)} CHECK OPTION`
					: undefined,
			orden: [
				"replace",
				"algorithm",
				"user",
				"security",
				"name",
				"cols",
				"as",
				"check",
			],
		};
		return this.getStatement("CREATE", commandFormat, { name, ...options });
	}
}
export default MySQL;
