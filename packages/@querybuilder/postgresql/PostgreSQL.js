/**
 * @fileoverview PostgreSQL QueryBuilder - Implementa las variaciones al SQL2006 propias de PostgreSQL
 * @description Clase especializada para PostgreSQL que extiende Core con funcionalidades específicas del SGBD.
 * Versión optimizada con estructura simplificada. Incluye soporte completo para tipos personalizados, 
 * dominios, schemas, transacciones avanzadas y características específicas de PostgreSQL.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * // Crear instancia PostgreSQL
 * const pg = new PostgreSQL();
 * 
 * // Crear base de datos con opciones PostgreSQL
 * const createDbSQL = pg.createDatabase('myapp_db', {
 *   encoding: 'UTF8',
 *   owner: 'app_user',
 *   template: 'template0',
 *   locale: 'en_US.UTF-8'
 * });
 * 
 * // Crear tipo personalizado
 * const typeSQL = pg.createType('address_type', {
 *   type: 'COMPOSITE',
 *   attributes: [
 *     { name: 'street', type: 'TEXT' },
 *     { name: 'city', type: 'TEXT' }
 *   ]
 * });
 */

/**
 * @namespace QueryBuilder.Adapters.PostgreSQL
 * @description Adaptador PostgreSQL que extiende QueryBuilder con funcionalidades específicas de PostgreSQL
 * @memberof QueryBuilder.Adapters
 * @example
 * // Instalación del adaptador PostgreSQL
 * npm install @querybuilder/core @querybuilder/postgresql
 * 
 * // Uso del adaptador PostgreSQL
 * import QueryBuilder from '@querybuilder/core';
 * import PostgreSQL from '@querybuilder/postgresql';
 * 
 * const qb = new QueryBuilder(PostgreSQL);
 * qb.select('*').from('users').where('active = true');
 */
import Core from "../core/core.js";
import postgreSQL from "./comandos/postgreSQL.js";
import Types from "../core/types/Type.js";
import "../core/utils/utils.js"; // Para toDataType

/**
 * Clase PostgreSQL QueryBuilder para operaciones específicas de PostgreSQL
 * @class PostgreSQL
 * @memberof QueryBuilder.Adapters.PostgreSQL
 * @extends Core
 * @description Implementa las variaciones específicas de PostgreSQL al estándar SQL2006.
 * Compatible con estructura original, optimizada y simplificada.
 * Incluye soporte para tipos personalizados, dominios, schemas, transacciones avanzadas, 
 * funciones, triggers, y características avanzadas de PostgreSQL.
 * @since 1.0.0
 */
class PostgreSQL extends Core {
	/**
	 * Constructor de la clase PostgreSQL
	 * @description Inicializa una nueva instancia del QueryBuilder para PostgreSQL
	 * @constructor
	 * @since 1.0.0
	 * @example
	 * const pg = new PostgreSQL();
	 * console.log(pg.dataType); // 'postgresql'
	 */
	constructor() {
		super();
		/**
		 * Tipo de base de datos - siempre 'postgresql'
		 * @type {string}
		 */
		this.dataType = "postgresql"; // especifica el tipo de datos usado
		// Configurar Types para validSqlId
		Types.identificador.set("regular");
	}

	/**
	 * Elimina una base de datos con opciones específicas de PostgreSQL
	 * @param {string} name - Nombre de la base de datos
	 * @param {object} options - Opciones (exist, force)
	 * @returns {string}
	 */
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

	/**
	 * Crea una base de datos con opciones específicas de PostgreSQL
	 * @param {string} name - Nombre de la base de datos
	 * @param {object} options - Opciones (encoding, owner, template, etc.)
	 * @returns {string}
	 */
	createDatabase(name, options = {}) {
		let query = `CREATE DATABASE ${name}`;

		if (Object.keys(options).length > 0) {
			const optionParts = [];

			if (options.encoding) {
				optionParts.push(`ENCODING '${options.encoding}'`);
			}
			if (options.owner) {
				optionParts.push(`OWNER ${options.owner}`);
			}
			if (options.template) {
				optionParts.push(`TEMPLATE ${options.template}`);
			}
			if (options.tablespace) {
				optionParts.push(`TABLESPACE ${options.tablespace}`);
			}
			if (options.locale) {
				optionParts.push(`LOCALE '${options.locale}'`);
			}

			if (optionParts.length > 0) {
				query += ` WITH ${optionParts.join(' ')}`;
			}
		}

		return query;
	}

	/**
	 * Crea un tipo personalizado
	 * @param {string} name - Nombre del tipo
	 * @param {object} options - Opciones del tipo
	 * @returns {string}
	 */
	createType(name, options) {
		return this.getStatement(
			"CREATE",
			postgreSQL.createType,
			{ name, options },
			" ",
		);
	}

	/**
	 * Crea un dominio personalizado
	 * @param {string} name - Nombre del dominio
	 * @param {object} options - Opciones del dominio
	 * @returns {string}
	 */
	createDomain(name, options) {
		return this.getStatement(
			"CREATE",
			postgreSQL.createDomain,
			{ name, options },
			" ",
		);
	}

	/**
	 * Elimina un tipo personalizado
	 * @param {string} name - Nombre del tipo
	 * @param {object} options - Opciones
	 * @returns {string}
	 */
	dropType(name, options) {
		return this.getStatement(
			"DROP TYPE",
			postgreSQL.dropType,
			{ name, options },
			" ",
		);
	}

	/**
	 * Elimina un esquema
	 * @param {string} name - Nombre del esquema
	 * @param {object} options - Opciones (cascade: boolean)
	 * @returns {string}
	 */
	dropSchema(name, options = {}) {
		let query = `DROP SCHEMA ${name}`;

		if (options.cascade) {
			query += " CASCADE";
		} else if (options.restrict) {
			query += " RESTRICT";
		}

		return query;
	}

	/**
	 * Define una columna con tipos específicos de PostgreSQL
	 * @param {string} name - Nombre de la columna
	 * @param {string|object} options - Tipo de datos o opciones
	 * @returns {string}
	 */
	column(name, options) {
		return this.getStatement("", postgreSQL.column, { name, options }, " ");
	}

	/**
	 * Crea una tabla con opciones específicas de PostgreSQL
	 * @param {string} name - Nombre de la tabla
	 * @param {object} options - Opciones de la tabla
	 * @returns {string}
	 */
	createTable(name, options = {}) {
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

	/**
	 * Define una columna con tipos específicos de PostgreSQL
	 * @param {string} name - Nombre de la columna
	 * @param {object} options - Opciones de la columna
	 * @returns {string}
	 */
	column(name, options) {
		const resultado = this.getStatement(
			"",
			postgreSQL.column,
			{ name, options },
			" ",
		).trim();
		return resultado;
	}

	/**
	 * Elimina una tabla
	 * @param {string} name - Nombre de la tabla
	 * @param {object} options - Opciones
	 * @returns {string}
	 */
	dropTable(name, options) {
		return this.getStatement(
			"DROP TABLE",
			postgreSQL.dropType,
			{ name, options },
			" ",
		);
	}

	/**
	 * Crea assertion - No soportado en PostgreSQL
	 * @param {string} name - Nombre
	 * @param {string} assertion - Assertion
	 * @throws {Error}
	 */
	createAssertion(name, assertion) {
		/*
		El estándar SQL incluye assertions como una forma de crear restricciones más complejas a nivel de base de datos, 
		pero la mayoría de los sistemas no han implementado esta característica.
		*/
		throw new Error(
			"Este lenguaje no soporta los 'createAssertion' use 'TRIGGERS' o 'Constraints' ",
		);
	}

	/**
	 * Crea roles con opciones específicas de PostgreSQL
	 * @param {string|array} names - Nombres de roles
	 * @param {object} options - Opciones de roles
	 * @returns {string}
	 */
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

	/**
	 * Cláusula LIMIT específica de PostgreSQL
	 * @param {number} limit - Límite de filas
	 * @returns {string}
	 */
	limit(limit) {
		return `LIMIT ${limit}`;
	}

	/**
	 * Cláusula OFFSET específica de PostgreSQL
	 * @param {number} offset - Desplazamiento
	 * @returns {string}
	 */
	offset(offset) {
		return `OFFSET ${offset}`;
	}

	/**
	 * Modifica una tabla existente
	 * @param {string} name - Nombre de la tabla
	 * @returns {string}
	 */
	alterTable(name) {
		return this.getStatement(
			"ALTER TABLE",
			postgreSQL.alterTable,
			{ name },
			" ",
		);
	}
}

// Exportaciones
export default PostgreSQL;
export { PostgreSQL };
