/*
Implementa las variaciones al SQL2006 propias del SGBD
*/
import Core from "../core.js";
import Mysql from "../comandos/Mysql.js";

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
			const sql = this.getStatement(
				"CREATE",
				Mysql.createTable,
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
	dropTable(name, options) {
		return this.getStatement(
			"DROP",
			Mysql.dropTable,
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
		return this.getStatement(
			"CREATE ROLE",
			Mysql.createRoles,
			{ names, options },
			" ",
		);
	}
	dropRoles(names, options) {
		return this.getStatement(
			"DROP ROLE",
			Mysql.dropRoles,
			{ names, options },
			" ",
		);
	}
	grant(commands, on, to, options) {
		return this.getStatement(
			"GRANT",
			Mysql.grant,
			{
				commands,
				on,
				to,
				options,
			},
			" ",
		);
	}
	revoke(commands, on, to, options) {
		const revoque = {
			...Mysql.grant,
			secure: (value) => (value === true ? "IF EXISTS" : undefined),
			orden: ["host", "secure", "commands", "on", "to"],
		};
		console.log("revoque", grant);
		return this.getStatement(
			"REVOKE",
			revoque,
			{
				commands,
				on,
				to,
				options,
			},
			" ",
		);
	}
	grantRoles(roles, users, options) {
		return this.getStatement(
			"GRANT",
			Mysql.grantRoles,
			{
				roles,
				users,
				options,
			},
			" ",
		);
	}
	// 15.1.23 CREATE VIEW Statement
	createView(name, options) {
		return this.getStatement("CREATE", Mysql.createView, { name, ...options });
	}
}
export default MySQL;
