/*
Implementa las variaciones al SQL2006 propias del SGBD
*/
import Core from "../core.js";
import Mysql84 from "../comandos/Mysql.js";
import Expresion from "../expresion.js";

class MySQL extends Core {
	constructor() {
		super();
		this.dataType = "mysql";
	}

	getAccount(userOrRole, host = "%") {
		if (typeof userOrRole === "string") {
			return `'${userOrRole}'${host !== undefined ? `@'${host}'` : ""}`;
		}
		if (typeof userOrRole === "object") {
			return `'${userOrRole?.name}'${userOrRole?.host !== undefined ? `@'${userOrRole.host}'` : `@'${host}'`}`;
		}
	}

	createType(name, options) {
		throw new Error("No soportado utilice SET o ENUM");
	}
	createTable(name, options) {
		try {
			const sql = this.getStatement(
				"CREATE",
				Mysql84.createTable,
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
			Mysql84.dropTable,
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
			Mysql84.createRoles,
			{ names, options },
			" ",
		);
	}
	dropRoles(names, options) {
		return this.getStatement(
			"DROP ROLE",
			Mysql84.dropRoles,
			{ names, options },
			" ",
		);
	}
	grant(commands, on, to, options) {
		return this.getStatement(
			"GRANT",
			Mysql84.grant,
			{
				commands,
				on,
				to,
				options,
			},
			" ",
		);
	}
	revoke(commands, on, from, options) {
		return this.getStatement(
			"REVOKE",
			Mysql84.revoke,
			{
				commands,
				on,
				from,
				options,
			},
			" ",
		);
	}
	grantRoles(roles, users, options) {
		return this.getStatement(
			"GRANT",
			Mysql84.grantRoles,
			{
				roles,
				users,
				options,
			},
			" ",
		);
	}

	revokeRoles(roles, from, options) {
		const sqlStack = [];
		if (typeof from === "string") {
			return this.getStatement(
				"REVOKE",
				Mysql84.revokeRoles,
				{
					roles,
					from,
					options,
				},
				" ",
			);
		}
		for (const userId of from) {
			sqlStack.push(`${this.revokeRoles(roles, userId, options)}`);
		}
		return sqlStack.join(";\n");
	}
	// 15.1.23 CREATE VIEW Statement
	createView(name, options) {
		return this.getStatement("CREATE", Mysql.createView, { name, ...options });
	}

	/**
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - columna
	 * @param {Array<column,string>} casos - [condicion, resultado]
	 * @param {string} defecto - Caso else
	 * @returns {string}
	 */
	case(column, casos, defecto) {
		let command = "CASE\n";
		let items;
		let lastChance = "";
		if (Array.isArray(column)) {
			items = column;
			lastChance = casos;
		} else {
			items = casos;
			lastChance = defecto;
		}

		command += items
			.map((item) => {
				return `WHEN ${item[0]} THEN ${item[1]}`;
			})
			.join("\n");
		command += `\n${lastChance !== undefined ? `ELSE ${lastChance}\n` : ""}`;
		command += `${Array.isArray(column) ? "END" : `END AS ${column}`}`;
		return new Expresion(command);
	}
	fullJoin(tables, alias) {
		return new Error("MySQL no soporta de forma nativa 'FULL OUTER JOIN'");
	}
	limit(limit) {
		return `LIMIT ${limit}`;
	}
	offset(offset) {
		return `OFFSET ${offset}`;
	}
	// Transacciones
	setTransaction(config) {
		return this.getStatement(
			"SET TRANSACTION",
			Mysql84.setTransaction,
			{
				options: config,
			},
			", ",
		);
	}
	startTransaction(config) {
		return this.getStatement(
			"START TRANSACTION",
			Mysql84.startTransaction,
			{
				options: config,
			},
			", ",
		);
	}
}
export default MySQL;
