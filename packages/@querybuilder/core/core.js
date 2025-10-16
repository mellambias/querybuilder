// Usar el formato JSDoc para documentar el código en castellano en todas las funciones, clases y métodos.

/**
 * @fileoverview Core QueryBuilder Implementation
 * @description Implementa el SQL 2006 - Clase base para todas las operaciones de QueryBuilder
 * @version 2.0.0
 * @author Miguel E. Llambías Llansó
 * @license MPL-2.0
 */

// Circular import removed to fix constructor issues
// import QueryBuilder from "./querybuilder.js";
import sql2006 from "./comandos/sql2006.js";
import Expresion from "./expresion.js";
import Column from "./column.js";
import { log, Types } from "./utils/utils.js";

/**
 * Clase Core - Implementación base de QueryBuilder.language.
 * Proporciona métodos y propiedades comunes para construir sentencias en el lenguaje SQL 2006.
 * @class Core
 * @version 2.0.0
 * @example
 * import { Core } from '@querybuilder/core';
 * import { QueryBuilder } from '@querybuilder/querybuilder';
 * const qb = new QueryBuilder(Core); // instancia un QueryBuilder quien delega en "Core" las operaciones de construcción de sentencias
 */
class Core {
	/**
	 * Creates a new Core instance
	 * Initializes SQL 2006 compliance, predicates, functions and query state
	 * 
	 * @constructor
	 * @memberof Core
	 */
	constructor() {
		/**
		 * Data type identifica la version sql del core
		 * @type {string}
		 * @default 'sql2006'
		 * @private
		 */
		this.dataType = "sql2006";

		/**
		 * Query array to store query parts
		 * @type {Array}
		 * @default []
		 * @private
		 */
		this.q = []; // Initialize the query array

		/**
		 * Unique instance identifier for debugging
		 * @type {number}
		 * @private
		 */
		this.id = Math.random(); // Debug: unique id for each instance

		// Initialize Types.identificador for validSqlId method
		Types.identificador.set("regular");

		/**
		 * Currently connected database instance
		 * @type {Object|null}
		 * @default null
		 * @private
		 */
		this.currentDatabase = null;

		// Initialize core components
		this.predicados();
		this.functionOneParam();
		this.functionDate();
		this.joins();
		this.fetches();
	}

	/**
	 * Helper method to check if an object is a QueryBuilder instance
	 * Avoids circular import issues by checking for specific properties
	 * 
	 * @method isQueryBuilder
	 * @memberof Core
	 * @private
	 * @param {*} obj - Object to check
	 * @returns {boolean} True if object is a QueryBuilder instance
	 */
	isQueryBuilder(obj) {
		// More robust detection - check for specific QueryBuilder properties
		return obj &&
			typeof obj === 'object' &&
			obj.languageClass &&
			obj.language &&
			obj.options &&
			typeof obj.toString === 'function' &&
			obj.returnOriginal &&
			Array.isArray(obj.returnOriginal);
	}

	/**
	 * Genera una sentencia SQL basada en el comando, esquema y parámetros dados
	 * Usada internamente por los métodos de comando para construir sentencias SQL con parametros dinámicos
	 * 
	 * @method getStatement
	 * @memberof Core
	 * @private
	 * @param {string} command - SQL command type (SELECT, INSERT, etc.)
	 * @param {Object} scheme - Command scheme definition
	 * @param {Object} params - Parameters for the command
	 * @param {string} [charJoin="\n"] - Character to join statement parts
	 * @returns {string} Generated SQL statement
	 */
	getStatement(command, scheme, params, charJoin = "\n") {
		const values = params?.options ? { ...params, ...params.options } : params;
		scheme._options = { ...params?.options };
		scheme._values = { ...values };
		const defaultOptions = Object.keys(scheme?.defaults || {});
		const commandArray = scheme?.orden
			.filter(
				(key) =>
					values[key] !== undefined || defaultOptions.indexOf(key) !== -1,
			)
			.map((key) => {
				if (typeof scheme[key] !== "function") {
					throw new Error(
						`${key} tiene que ser una funcion ${typeof scheme[key]}`,
					);
				}
				const callFunction = scheme[key].bind(this);
				if (values[key] !== undefined) {
					log(
						["Core", "getStatement", "%o"],
						"llamar funcion parametros:values[key]\n%o",
						key,
						typeof values[key],
					);
					const respuesta = callFunction(values[key], scheme);
					log(["Core", "getStatement", "%o"], "respuesta", key, respuesta);
					return respuesta;
				}
				const respuesta = callFunction(scheme.defaults[key], scheme);
				log(
					["Core", "getStatement", "%o"],
					"respuesta de %o",
					key,
					scheme.defaults,
					respuesta,
				);
				return respuesta;
			})
			.filter((result) => result !== undefined)
			.join(charJoin)
			.replaceAll(" \n", "\n")
			.trim();

		return `${command ? `${command} ` : ""}${commandArray}`;
	}

	/**
	 * @method getAccount
	 * @memberof Core
	 * @description
	 * Formats user account string for SQL statements
	 * Used in GRANT, REVOKE and user management operations
	 *
	 * @param {string|Object} userOrRole - User name or user object
	 * @param {string} [host="%"] - Host specification for user
	 * @returns {string} Formatted account string
	 * @example

	 * // String format
	 * qb.getAccount('admin', 'localhost'); // "'admin'@'localhost'"
	 * 
	 * // Object format
	 * qb.getAccount({name: 'admin', host: 'localhost'}); // "'admin'@'localhost'"

	 */
	getAccount(userOrRole, host = "%") {
		if (typeof userOrRole === "string") {
			return `'${userOrRole}'${host !== undefined ? `@'${host}'` : ""}`;
		}
		if (typeof userOrRole === "object") {
			return `'${userOrRole?.name}'${userOrRole?.host !== undefined ? `@'${userOrRole.host}'` : `@'${host}'`}`;
		}
	}

	/**
	 * @method getSubselect
	 * @memberof Core
	 * @description
	 * Extracts subselect from query array or returns last resolved value
	 * Used to handle nested queries and subqueries in SQL generation
	 * 
	 * @param {Object} next - QueryBuilder instance containing query array
	 * @param {boolean} [all=false] - Include first select if true
	 * @returns {Array} Array with subselect parts or last value
	 * @example

	 * const subSelect = qb.getSubselect(next, true);
	 *

	 */
	getSubselect(next, all = false) {
		try {
			const start = next.q.findLastIndex(
				(item) =>
					item.toUpperCase().startsWith("SELECT"),
			);
			log(["Core", "getSubselect"], "start", start, next.q);
			if (start === -1 || (start === 1 && !all)) {
				log(["Core", "getSubselect"], "No encuentra el SubSelect next:", next);
				const lastItem = next.q.pop();
				log(
					["Core", "getSubselect"],
					"(%o) No existe un 'SELECT', devuelve el ultimo item %o",
					start,
					lastItem,
				);
				return lastItem;
			}
			const subSelect = next.q.splice(start, next.q.length - start);
			log(
				["Core", "getSubselect"],
				"Modifica next:\n%o\n subSelect:\n%o",
				next,
				subSelect,
			);
			return subSelect;
		} catch (error) {
			log(["Core", "getSubselect", "ERROR"], "Error", error);
		}
	}

	/**
	 * @method getListValues
	 * @memberof Core
	 * @private
	 * @description
	 * Processes array values for SQL generation and QueryBuilder operations
	 * Handles conversion of array elements to appropriate SQL format based on context
	 * 
	 * @param {Array|*} values - Array of values to process or single value
	 * @param {Object} next - QueryBuilder instance providing context
	 * @returns {Array|string} Processed array values or formatted string ready for SQL
	 * @example

	 * const values = core.getListValues([1, 'test', null], queryBuilder);
	 * // Returns formatted values for SQL based on context

	 */
	getListValues(values, next) {
		log(["Core", "getListValues(values, next)"], "next", next);
		log(
			["Core", "getListValues(values, next)"],
			"typeof values",
			typeof values,
		);
		let arrayValues = [];
		if (Array.isArray(values[0])) {
			arrayValues = values[0].map((value) => {
				if (this.isQueryBuilder(value)) {
					log(["Core", "getListValues(values, next)"], "next", next);
					return this.getSubselect(next);
				}
				return value;
			});
		} else if (Array.isArray(values)) {
			arrayValues = values.map((value) => {
				if (this.isQueryBuilder(value)) {
					log(["Core", "getListValues(values, next)"], "next %o", next);

					// Try to get SQL from the QueryBuilder object first
					if (value && typeof value === 'object') {
						// Check if it has a .q array property and extract SQL directly
						if (value.q && Array.isArray(value.q)) {
							const sqlParts = value.q.filter(q => typeof q === "string" && q.trim() !== "");
							if (sqlParts.length > 0) {
								return sqlParts.join("\n");
							}
						}

						// Try to call toString() if it exists and is a function
						if (typeof value.toString === 'function') {
							try {
								const result = value.toString();
								// Check if it's not just [object Object] and contains SQL-like content
								if (result !== "[object Object]" && typeof result === "string" &&
									(result.toUpperCase().includes('SELECT') || result.includes('FROM'))) {
									return result;
								}
							} catch (error) {
								// If toString() fails, fall back to original logic
							}
						}
					}

					// Check if we have a DELETE/UPDATE command that needs special handling
					const hasDeleteUpdateCommand = next.q.some(item =>
						typeof item === 'string' &&
						(item.trim().toLowerCase().startsWith('delete') || item.trim().toLowerCase().startsWith('update'))
					);

					if (hasDeleteUpdateCommand) {
						// Find SELECT and take everything from there for DELETE/UPDATE subconsulta context
						const selectIndex = next.q.findIndex(item =>
							typeof item === 'string' &&
							(item.toUpperCase().startsWith('SELECT') || item.toUpperCase().includes('SELECT'))
						);

						if (selectIndex !== -1) {
							// Get all elements from SELECT onwards
							const subquery = next.q.slice(selectIndex);
							// Remove the subquery parts from next.q to prevent contamination
							next.q.splice(selectIndex);
							return subquery.join('\n');
						}
					}

					return this.getSubselect(next);
				}
				return value;
			});
		} else {
			if (this.isQueryBuilder(values)) {
				log(["Core", "getListValues(values, next)"], "Es un QB next", next);

				// Try to get SQL from the QueryBuilder object first
				if (values && typeof values === 'object') {
					// Check if it has a .q array property and extract SQL directly
					if (values.q && Array.isArray(values.q)) {
						const sqlParts = values.q.filter(q => typeof q === "string" && q.trim() !== "");
						if (sqlParts.length > 0) {
							return sqlParts.join("\n");
						}
					}

					// Try to call toString() if it exists and is a function
					if (typeof values.toString === 'function') {
						try {
							const result = values.toString();
							// Check if it's not just [object Object] and contains SQL-like content
							if (result !== "[object Object]" && typeof result === "string" &&
								(result.toUpperCase().includes('SELECT') || result.includes('FROM'))) {
								return result;
							}
						} catch (error) {
							// If toString() fails, fall back to getSubselect
						}
					}
				}

				// Fallback to original method
				const resolve = this.getSubselect(next);
				return Array.isArray(resolve) ? resolve.join("\n") : resolve;
			}
			arrayValues = [values];
		}
		return arrayValues
			.map((item) => {
				if (typeof item === "string") {
					// Check if this string looks like a SQL subquery
					if (item.toUpperCase().includes('SELECT') && item.includes('\n')) {
						// This is a SQL subquery, don't add quotes
						return item;
					} else {
						// This is a regular string value, add quotes
						return `'${item}'`;
					}
				}
				if (Array.isArray(item)) {
					return item.join("\n");
				}

				// Handle object cases (like QueryBuilder objects)
				if (typeof item === "object" && item !== null) {
					// Check if it has a .q array property (QueryBuilder-like object)
					if (item.q && Array.isArray(item.q)) {
						// Extract string conditions from the q array
						const conditions = item.q.filter(q => typeof q === "string");
						return conditions.join(" "); // Join with space for proper SQL
					}

					// If it's an object but doesn't have .q, try to convert safely
					if (item.toString && typeof item.toString === "function") {
						const str = item.toString();
						// Only return if it's not [object Object]
						return str !== "[object Object]" ? str : String(item);
					}
				}

				// Fallback: convert to string safely
				return String(item);
			})
			.join(", ");
	}

	/************************************************************************
	 * utility
	 * Comandos auxiliares para gestión y mantenimiento de la base de datos.
	 ************************************************************************/

	/**
	 * Selects a database for use in subsequent operations
	 * Sets the current database context and returns USE statement
	 * 
	 * @method use
	 * @memberof Core
	 * @param {string} database - Name of the database to use
	 * @returns {string} USE SQL statement
	 * @example

	 * const useStatement = core.use('myDatabase');
	 * // Returns: "USE myDatabase"

	 */
	use(database) {
		this.useDatabase = database;
		return `USE ${database}`;
	}
	set useDatabase(value) {
		this.currentDatabase = value;
	}
	get useDatabase() {
		return this.currentDatabase;
	}

	/***************************************************************
	 * DDL
	 * Definen y modifican la estructura de la base de datos.
	 ***************************************************************/

	/**
	 * Creates a new database with optional configuration
	 * Generates CREATE DATABASE SQL statement with options
	 * 
	 * @method createDatabase
	 * @memberof Core
	 * @param {string} name - Name of the database to create
	 * @param {Object} [options={}] - Database creation options
	 * @returns {string} CREATE DATABASE SQL statement
	 * @example

	 * const createDb = core.createDatabase('myDB', { charset: 'utf8' });
	 * // Returns: "CREATE DATABASE myDB\n charset utf8"

	 */
	createDatabase(name, options) {
		let query = `CREATE DATABASE ${name}`;
		for (const option in options) {
			query += `\n ${option} ${option[option]}`;
		}
		return query;
	}

	/**
	 * Drops (deletes) an existing database
	 * Generates DROP DATABASE SQL statement with optional safety check
	 * 
	 * @method dropDatabase
	 * @memberof Core
	 * @param {string} name - Name of the database to drop
	 * @param {Object} [options={}] - Drop options
	 * @param {boolean} [options.secure=false] - If true, uses IF EXISTS clause
	 * @returns {string} DROP DATABASE SQL statement
	 * @example

	 * const dropDb = core.dropDatabase('myDB', { secure: true });
	 * // Returns: "DROP DATABASE IF EXISTS myDB"

	 */
	dropDatabase(name, options) {
		this.useDatabase = null;
		options?.secure;
		const query = "DROP DATABASE".concat(
			options?.secure === true ? " IF EXISTS " : " ",
			name,
		);
		return query;
	}

	/**
	 * Crea un nuevo esquema (schema) en la base de datos
	 * Genera CREATE SCHEMA SQL usando el estándar SQL 2006
	 * 
	 * @method createSchema
	 * @memberof Core
	 * @param {string} name - Nombre del esquema a crear
	 * @param {Object} options - Opciones de creación del esquema
	 * @returns {string} Sentencia SQL CREATE SCHEMA
	 * @see {@link sql2006.createSchema | Esquema createSchema}
	 */
	createSchema(name, options) {
		return this.getStatement("CREATE SCHEMA", sql2006.createSchema, {
			name,
			options,
		});
	}
	/**
	 * Elimina un esquema (schema) existente en la base de datos
	 * Genera DROP SCHEMA SQL usando el estándar SQL 2006
	 * @method dropSchema
	 * @memberof Core
	 * @param {string} name - Nombre del esquema a eliminar
	 * @param {Object} options - Opciones para el comando
	 * @return {string} Sentencia SQL DROP SCHEMA
	 * @see {@link sql2006.dropSchema | Esquema dropSchema}
	 */
	dropSchema(name, options) {
		return this.getStatement("DROP SCHEMA", sql2006.dropSchema, {
			name,
			options,
		});
	}

	/**
	 * Creates a new table with specified name and options
	 * Generates CREATE TABLE SQL statement using SQL 2006 standard
	 * 
	 * @method createTable
	 * @memberof Core
	 * @param {string} name - Name of the table to create
	 * @param {Object} [options={}] - Table creation options (temporary, constraints, etc.)
	 * @returns {string} CREATE TABLE SQL statement
	 * @example

	 * const createTable = core.createTable('users', { temporary: true });
	 * // Returns formatted CREATE TABLE statement

	 */
	createTable(name, options) {
		return this.getStatement("CREATE", sql2006.createTable, {
			name,
			options,
		});
	}

	/**
	 * Defines a column specification for table creation or alteration
	 * Generates column definition with data type and constraints
	 * 
	 * @method column
	 * @memberof Core
	 * @param {string} name - Name of the column
	 * @param {Object} options - Column options (type, constraints, default, etc.)
	 * @returns {string} Column definition SQL
	 * @example

	 * const col = core.column('id', { type: 'INT', primaryKey: true, autoIncrement: true });
	 * // Returns formatted column definition

	 */
	column(name, options) {
		const resultado = this.getStatement(
			"",
			sql2006.column,
			{ name, options },
			" ",
		).trim();
		return resultado;
	}

	/**
	 * Generates SQL for table constraints
	 * @param {Array} restricciones - Lista de restricciones de tabla
	 * @returns {string} Sentencia SQL para las restricciones de tabla
	 * @example

	 * const constraints = core.tableConstraints([{ name: 'pk_id', primaryKey: ['id'] }]);// Returns formatted constraints SQL

	 */
	tableConstraints(restricciones) {
		const command = [];
		for (const restriccion of restricciones) {
			command.push(
				this.getStatement("CONSTRAINT", sql2006.constraint, restriccion, " "),
			);
		}
		return command.join(",\n ");
	}
	/**
	 * Genera SQL para modificar una tabla existente
	 * @method alterTable
	 * @memberof Core
	 * @param {string} name - Nombre de la tabla a modificar
	 * @returns {string} Sentencia SQL ALTER TABLE
	 * @example

	 * const alterTable = core.alterTable('users');
	 * // Returns: "ALTER TABLE users"

	 */
	alterTable(name) {
		return `ALTER TABLE ${name}`;
	}
	/**
	 * Genera SQL para agregar una nueva columna a una tabla existente
	 * @method addColumn
	 * @memberof Core
	 * @param {string} name - Nombre de la columna a agregar
	 * @param {Object} options - Opciones de la columna (tipo, restricciones, etc.)
	 * @returns {string} Sentencia SQL ADD COLUMN
	 * @example

	 * const addColumn = core.addColumn('age', { type: 'INT', notNull: true });
	 * // Returns: "ADD COLUMN age INT NOT NULL"

	 */
	addColumn(name, options) {
		return `ADD COLUMN ${this.column(name, options)}`;
	}
	/**
	 * Genera SQL para modificar una columna existente
	 * @method alterColumn
	 * @memberof Core
	 * @param {string} name - Nombre de la columna a modificar
	 * @returns {string} Sentencia SQL ALTER COLUMN
	 * @example

	 * const alterColumn = core.alterColumn('age');
	 * // Returns: "ALTER COLUMN age"

	 */
	alterColumn(name) {
		return `ALTER COLUMN ${name}`;
	}
	/**
	 * Genera SQL para eliminar una columna existente
	 * @method dropColumn
	 * @memberof Core
	 * @param {string} name - Nombre de la columna a eliminar
	 * @param {Object} option - Opciones de eliminación (si las hay)
	 * @returns {string} Sentencia SQL DROP COLUMN
	 * @example

	 * const dropColumn = core.dropColumn('age');
	 * // Returns: "DROP COLUMN age"

	 */
	dropColumn(name, option) {
		return this.getStatement("DROP", sql2006.dropColumn, { name, option }, " ");
	}
	/**
	 * Genera SQL para establecer un valor por defecto en una columna
	 * @method setDefault
	 * @memberof Core
	 * @param {*} value - Valor por defecto a establecer
	 * @returns {string} Sentencia SQL SET DEFAULT
	 * @example

	 * const setDefault = core.setDefault('active');
	 * // Returns: "SET DEFAULT 'active'"

	 */
	setDefault(value) {
		return `SET DEFAULT ${typeof value === "string" ? `'${value}'` : value}`;
	}
	/**
	 * Genera SQL para eliminar un valor por defecto en una columna
	 * @method dropDefault
	 * @memberof Core
	 * @returns {string} Sentencia SQL DROP DEFAULT
	 * @example

	 * const dropDefault = core.dropDefault();
	 * // Returns: "DROP DEFAULT"

	 */
	dropDefault() {
		return "DROP DEFAULT";
	}
	/**
	 * Genera SQL para agregar una restricción a una tabla
	 * @method addConstraint
	 * @memberof Core
	 * @param {string} name - Nombre de la restricción
	 * @param {Object} option - Opciones de la restricción (tipo, columnas, etc.)
	 * @param {string} next - Sentencia SQL siguiente
	 * @returns {string} Sentencia SQL ADD CONSTRAINT
	 * @example

	 * const addConstraint = core.addConstraint('pk_id', { primaryKey: ['id'] }, 'users');
	 * // Returns: "ADD CONSTRAINT pk_id PRIMARY KEY (id) ON users"

	 */
	addConstraint(name, option, next) {
		const constraint = [
			{
				name,
				check: option.check,
				next,
			},
		];
		return `ADD ${this.tableConstraints(constraint)}`;
	}
	/**
	 * Genera SQL para eliminar una restricción de una tabla
	 * @method dropConstraint
	 * @memberof Core
	 * @param {string} name - Nombre de la restricción a eliminar
	 * @param {string} table - Nombre de la tabla de la que se eliminará la restricción
	 * @returns {string} Sentencia SQL DROP CONSTRAINT
	 * @example

	 * const dropConstraint = core.dropConstraint('pk_id', 'users');
	 * // Returns: "DROP CONSTRAINT pk_id ON users"

	 */
	dropConstraint(name, table) {
		return `DROP CONSTRAINT ${name} ON ${table}`;
	}
	/**
	 * Genera SQL para eliminar una tabla
	 * @method dropTable
	 * @memberof Core
	 * @param {string} name - Nombre de la tabla a eliminar
	 * @param {Object} option - Opciones de eliminación (si las hay)
	 * @returns {string} Sentencia SQL DROP TABLE
	 * @example

	 * const dropTable = core.dropTable('users');
	 * // Returns: "DROP TABLE users"

	 */
	dropTable(name, option) {
		return this.getStatement("DROP", sql2006.dropTable, { name, option }, " ");
	}
	/**
	 * Genera SQL para crear un nuevo tipo de datos definido por el usuario
	 * @method createType
	 * @memberof Core
	 * @param {string} name - Nombre del tipo de datos
	 * @param {Object} options - Opciones para el tipo de datos (si las hay)
	 * @returns {string} Sentencia SQL CREATE TYPE
	 * @example

	 * const createType = core.createType('custom_type', { ... });
	 * // Returns: "CREATE TYPE custom_type AS ..."

	 */
	createType(name, options) {
		return this.getStatement(
			"CREATE",
			sql2006.createType,
			{ name, options },
			" ",
		);
	}
	/**
	 * Genera SQL para eliminar un tipo de datos definido por el usuario
	 * @method dropType
	 * @memberof Core
	 * @param {string} name - Nombre del tipo de datos
	 * @param {Object} options - Opciones para la eliminación (si las hay)
	 * @returns {string} Sentencia SQL DROP TYPE
	 * @example

	 * const dropType = core.dropType('custom_type');
	 * // Returns: "DROP TYPE custom_type"

	 */
	dropType(name, options) {
		return this.getStatement(
			"DROP TYPE",
			sql2006.dropType,
			{ name, options },
			" ",
		);
	}
	/**
	 * Genera SQL para crear una nueva aserción (assertion) en la base de datos
	 * @method createAssertion
	 * @memberof Core
	 * @param {string} name - Nombre de la aserción
	 * @param {string} assertion - Condición de la aserción
	 * @returns {string} Sentencia SQL CREATE ASSERTION
	 * @example

	 * const createAssertion = core.createAssertion('check_user_age', 'age > 0');
	 * // Returns: "CREATE ASSERTION check_user_age CHECK ( age > 0 )"

	 */
	createAssertion(name, assertion) {
		return `CREATE ASSERTION ${name} CHECK ( ${assertion} )`;
	}
	/**
	 * Genera SQL para eliminar una aserción (assertion) existente
	 * @method dropAssertion
	 * @memberof Core
	 * @param {string} name - Nombre de la aserción
	 * @returns {string} Sentencia SQL DROP ASSERTION
	 * @example

	 * const dropAssertion = core.dropAssertion('check_user_age');
	 * // Returns: "DROP ASSERTION check_user_age"

	 */
	dropAssertion(name) {
		return `DROP ASSERTION ${name}`;
	}
	/**
	 * Genera SQL para crear un nuevo dominio (domain) en la base de datos
	 * @method createDomain
	 * @memberof Core
	 * @param {string} name - Nombre del dominio
	 * @param {Object} options - Opciones para el dominio (si las hay)
	 * @returns {string} Sentencia SQL CREATE DOMAIN
	 * @example

	 * const createDomain = core.createDomain('email_domain', { ... });
	 * // Returns: "CREATE DOMAIN email_domain AS ..."

	 */
	createDomain(name, options) {
		return this.getStatement("CREATE DOMAIN", sql2006.createDomain, {
			name,
			options,
		});
	}
	/**
	 * Genera SQL para eliminar un dominio (domain) existente
	 * @method dropDomain
	 * @memberof Core
	 * @param {string} name - Nombre del dominio
	 * @param {Object} options - Opciones para la eliminación (si las hay)
	 * @returns {string} Sentencia SQL DROP DOMAIN
	 * @example

	 * const dropDomain = core.dropDomain('email_domain');
	 * // Returns: "DROP DOMAIN email_domain"

	 */
	dropDomain(name, options) {
		return this.getStatement("DROP DOMAIN", sql2006.dropDomain, {
			name,
			options,
		});
	}
	/**
	 * Genera SQL para crear una nueva vista (view) en la base de datos
	 * @method createView
	 * @memberof Core
	 * @param {string} name - Nombre de la vista
	 * @param {Object} options - Opciones para la vista (si las hay)
	 * @returns {string} Sentencia SQL CREATE VIEW
	 * @example

	 * const createView = core.createView('user_view', { ... });
	 * // Returns: "CREATE VIEW user_view AS ..."

	 */
	createView(name, options) {
		return this.getStatement("CREATE", sql2006.createView, { name, options });
	}
	/**
	 * Genera SQL para eliminar una vista (view) existente
	 * @method dropView
	 * @memberof Core
	 * @param {string} name - Nombre de la vista
	 * @param {Object} options - Opciones para la eliminación (si las hay) CASCADE | RESTRICT
	 * @returns {string} Sentencia SQL DROP VIEW
	 * @example

	 * const dropView = core.dropView('user_view');
	 * // Returns: "DROP VIEW user_view"

	 */
	dropView(name, options) {
		return this.getStatement("DROP", sql2006.dropView, { name, options });
	}

	/********************************************************
	 * DCL
	 * Controlan el acceso y permisos en la base de datos.
	 ********************************************************/

	// Crear roles, usuarios y asignar permisos

	/**
	 * Genera SQL para crear nuevos roles en la base de datos
	 * @method createRoles
	 * @memberof Core
	 * @param {Array<string>} names - Nombres de los roles a crear
	 * @param {Object} options - Opciones para la creación (si las hay)
	 * @returns {string} Sentencia SQL CREATE ROLE
	 * @example

	 * const createRoles = core.createRoles(['admin', 'user'], { ... });
	 * // Returns: "CREATE ROLE admin, user AS ..."

	 */
	createRoles(names, options) {
		return this.getStatement(
			"CREATE",
			sql2006.createRoles,
			{ names, options },
			" ",
		);
	}

	/**
	 * Genera la instrucción SQL para eliminar roles existentes en la base de datos
	 * @method dropRoles
	 * @memberof Core
	 * @param {Array<string>} names - Nombres de los roles a eliminar
	 * @param {Object} options - Opciones para la eliminación (si las hay)
	 * @returns {string} Sentencia SQL DROP ROLE
	 * @see {@link sql2006.dropRoles dropRoles}  Documentación de opciones soportadas
	 * @example
	 * 
	 * const dropRoles = core.dropRoles(['admin', 'user'], { ... });
	 * // Returns: "DROP ROLE admin, user"
	 *
	 */
	dropRoles(names, options) {
		return this.getStatement("", sql2006.dropRoles, { names, options });
	}

	/**
	 * Genera la instrucción SQL para conceder permisos a un objeto
	 * @method grant
	 * @memberof Core
	 * @param {Array<string>} commands - Comandos de permisos a conceder
	 * @param {string} on - Objeto sobre el que se conceden los permisos
	 * @param {Array<string>} to - Usuarios o roles a los que se conceden los permisos
	 * @param {Object} options - Opciones para la concesión (si las hay)
	 * @returns {string} Sentencia SQL GRANT
	 * @see {@link sql2006.grant grant} Documentación de opciones soportadas
	 * @example
	 * const grant = core.grant(['SELECT', 'INSERT'], 'users', ['admin'], { ... });
	 * // Returns: "GRANT SELECT, INSERT ON users TO admin"
	 */
	grant(commands, on, to, options) {
		return this.getStatement("GRANT", sql2006.grant, {
			commands,
			on,
			to,
			options,
		});
	}

	/**
	 * Genera la instrucción SQL para revocar permisos a un objeto
	 * @method revoke
	 * @memberof Core
	 * @param {Array<string>} commands - Comandos de permisos a revocar
	 * @param {string} on - Objeto sobre el que se revocan los permisos
	 * @param {Array<string>} from - Usuarios o roles a los que se revocan los permisos
	 * @param {Object} options - Opciones para la revocación (si las hay)
	 * @returns {string} Sentencia SQL REVOKE
	 * @see {@link sql2006.revoke revoke} Documentación de opciones soportadas
	 * @example
	 * const revoke = core.revoke(['SELECT'], 'users', ['user'], { ... });
	 * // Returns: "REVOKE SELECT ON users FROM user"
	 */
	revoke(commands, on, from, options) {
		return this.getStatement("REVOKE", sql2006.revoke, {
			commands,
			on,
			from,
			options,
		});
	}

	/**
	 * Genera la instrucción SQL para conceder roles a usuarios o roles
	 * @method grantRoles
	 * @memberof Core
	 * @param {Array<string>} roles - Roles a conceder
	 * @param {Array<string>} users - Usuarios o roles a los que se conceden los roles
	 * @param {Object} options - Opciones para la concesión (si las hay)
	 * @returns {string} Sentencia SQL GRANT
	 * @see {@link sql2006.grantRoles grantRoles} Documentación de opciones soportadas
	 * @example
	 * const grant = core.grantRoles(['admin'], ['user'], { ... });
	 * // Returns: "GRANT admin TO user"
	 */
	grantRoles(roles, users, options) {
		return this.getStatement(
			"GRANT",
			sql2006.grantRoles,
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
				sql2006.revokeRoles,
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

	/**************************************************************************
	 * DQL
	 * Consultan y recuperan datos de una o varias tablas.
	 **************************************************************************/

	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options, next) {
		log(["Core", "select"], "next", next);
		const result = this.getStatement(
			"SELECT",
			sql2006.select,
			{
				columns,
				options,
				next,
			},
			" ",
		);
		log(["Core", "select"], "result", result);
		return result;
	}

	/**
	 * Generates FROM clause for SQL queries
	 * Supports single table, multiple tables, and table aliases
	 * 
	 * @method from
	 * @memberof Core
	 * @param {string|Array<string>} tables - Table name(s) for the FROM clause
	 * @param {string|Array<string>} [alias] - Table alias(es)
	 * @returns {string} FROM clause SQL
	 * @example

	 * // Single table
	 * const from1 = core.from('users');
	 * // Returns: "FROM users"
	 * 
	 * // Table with alias
	 * const from2 = core.from('users', 'u');
	 * // Returns: "FROM users u"
	 * 
	 * // Multiple tables with aliases
	 * const from3 = core.from(['users', 'orders'], ['u', 'o']);
	 * // Returns: "FROM users AS u, orders AS o"

	 */
	from(tables, alias) {
		if (typeof tables === "string") {
			if (typeof alias === "string") {
				return `FROM ${tables} ${alias}`;
			}
			if (Array.isArray(alias) && alias.length === 1) {
				return `FROM ${tables} ${alias[0]}`;
			}
			return `FROM ${tables}`;
		}
		if (Array.isArray(tables) && Array.isArray(alias)) {
			return `FROM ${tables
				.map((table, index) => `${table} AS ${alias[index]}`)
				.join(", ")}`;
		}
		if (Array.isArray(tables) && typeof alias === "string") {
			const [first, ...rest] = tables;
			rest.unshift(`${first} ${alias}`);
			return `FROM ${rest.join(", ")}`;
		}
		return `FROM ${tables.join(", ")}`;
	}

	/**
	 * Generates WHERE clause for SQL queries with predicates
	 * Handles various predicate formats and QueryBuilder expressions
	 * 
	 * @method where
	 * @memberof Core
	 * @param {string|Object|Array} predicados - WHERE conditions (string, QB expression, or array)
	 * @param {Object} next - QueryBuilder instance providing context
	 * @returns {string} WHERE clause SQL
	 * @example

	 * // Simple string condition
	 * const where1 = core.where("age > 18", queryBuilder);
	 * // Returns: "WHERE age > 18"
	 * 
	 * // QueryBuilder expression
	 * const where2 = core.where(qb.eq('status', 'active'), queryBuilder);
	 * // Returns: "WHERE status = 'active'"

	 */
	where(predicados, next) {
		const sql = "WHERE";

		// Handle case where predicados comes from qb.eq() or similar - it's an object from querybuilder
		if (predicados && typeof predicados === 'object' && !Array.isArray(predicados) && !this.isQueryBuilder(predicados) && next && next.q && Array.isArray(next.q) && next.q.length > 0) {
			// Get the last element from the query array (which should be the condition)
			const lastItem = next.q[next.q.length - 1];
			if (typeof lastItem === 'string') {
				// Remove the condition from query array as we'll use it in WHERE
				next.q.splice(next.q.length - 1, 1);
				return `${sql} ${lastItem}`;
			}
		}

		if (this.isQueryBuilder(predicados)) {
			const values = next.q.pop();
			return `${sql} ${values}`;
		}
		if (Array.isArray(predicados)) {
			return `${sql} ${predicados
				.map((item) => {
					if (this.isQueryBuilder(item)) {
						return next.q.pop();
					}
					return item;
				})
				.join(", ")}`;
		}

		// Handle string predicados safely
		if (typeof predicados === 'string') {
			return `${sql} ${predicados}`;
		}

		// Fallback - try to convert to string safely
		try {
			return `${sql} ${String(predicados)}`;
		} catch (e) {
			return `${sql} 1=1`; // Safe fallback
		}
	}

	whereCursor(cursorName) {
		return `WHERE CURRENT OF ${cursorName}`;
	}

	joins() {
		const joinTypes = {
			crossJoin: "CROSS JOIN",
			naturalJoin: "NATURAL JOIN",
			innerJoin: "INNER JOIN",
			join: "JOIN",
			leftJoin: "LEFT OUTER JOIN",
			rightJoin: "RIGHT OUTER JOIN",
			fullJoin: "FULL OUTER JOIN",
		};
		for (const join in joinTypes) {
			if (typeof this[join] === "function") {
				continue;
			}
			this[join] = (tables, alias) => {
				if (typeof tables === "string" && typeof alias === "string") {
					return `${joinTypes[join]} ${tables} ${alias}`;
				}
				if (Array.isArray(tables) && Array.isArray(alias)) {
					return `FROM ${tables
						.map((table, index) => `${table} ${alias[index]}`)
						.join(` ${joinTypes[join]} `)}`;
				}
				if (join !== "join") {
					return `FROM ${tables.join(` ${joinTypes[join]} `)}`;
				}
				throw new Error(
					`[core:442] la funcion ${join}(tables,alias,using) => ${join}(${tables}, ${alias}, using)`,
				);
			};
		}
	}

	using(columnsInCommon) {
		if (Array.isArray(columnsInCommon)) {
			return `USING (${columnsInCommon.join(", ")})`;
		}
		return `USING (${columnsInCommon})`;
	}
	/**
	 * Recibe una lista de select y los encadena usando el valor de optios.command
	 * @param {Array<string|QueryBuilder>} selects - lista de selects
	 * @param {string} options.command - comando de union
	 * @param {boolean} options.all - true añade ALL al comando de union
	 * @param {*} next
	 * @returns {string} La query resultante con las uniones aplicadas
	 */
	multiTabla(selects, next, options) {
		let command = `\n${options.command}\n`;
		if (options?.all) {
			command = `\n${options.command} ALL\n`;
		}

		// Find the queriesObject that contains pre-built queries
		let queriesObject = null;
		for (const select of selects) {
			if (typeof select === 'object' && select !== null &&
				!this.isQueryBuilder(select) &&
				'q' in select && 'callStack' in select && 'prop' in select &&
				Array.isArray(select.q)) {
				queriesObject = select;
				break;
			}
		}

		// Process all selects in order, but use queriesObject to get individual queries
		let queries = [];
		let qIndex = 0; // Index for accessing queries from queriesObject

		// If we have a queriesObject, extract individual queries from it
		let extractedQueries = [];
		if (queriesObject && queriesObject.q && Array.isArray(queriesObject.q)) {
			let currentQuery = [];
			for (const item of queriesObject.q) {
				if (item.trim().startsWith('SELECT')) {
					// If we have a complete pair, save it
					if (currentQuery.length === 2) {
						extractedQueries.push(currentQuery.join('\n'));
						currentQuery = [];
					}
					currentQuery.push(item);
				} else if (item.trim().startsWith('FROM')) {
					currentQuery.push(item);
					// Complete pair
					if (currentQuery.length === 2) {
						extractedQueries.push(currentQuery.join('\n'));
						currentQuery = [];
					}
				}
			}
			// Add any remaining query
			if (currentQuery.length > 0) {
				extractedQueries.push(currentQuery.join('\n'));
			}
		}

		// Process selects in original order
		for (const select of selects) {
			if (typeof select === 'string') {
				queries.push(select);
			} else if (this.isQueryBuilder(select)) {
				// Use the next query from extractedQueries
				if (qIndex < extractedQueries.length) {
					queries.push(extractedQueries[qIndex]);
					qIndex++;
				}
			}
			// Skip the queriesObject itself
		}

		return queries.join(command);
	}
	union(selects, next, options) {
		options.command = "UNION";
		return this.multiTabla(selects, next, options);
	}
	intersect(selects, next, options) {
		options.command = "INTERSECT";
		return this.multiTabla(selects, next, options);
	}
	except(selects, next, options) {
		options.command = "EXCEPT";
		return this.multiTabla(selects, next, options);
	}

	on(predicado, next) {
		const sql = "ON";
		if (typeof predicado === "string") {
			return `${sql} ${predicado}`;
		}
		if (this.isQueryBuilder(predicado)) {
			const valor = next.q.pop();
			return `${sql} ${valor}`;
		}
		return `${sql} ${predicado.join("\n")}`;
	}

	// Predicados
	predicados() {
		//operaciones con un argumento
		const operOneCol = {
			isNull: "IS NULL",
			isNotNull: "IS NOT NULL",
		};
		//operaciones con dos argumentos
		const operTwoCols = {
			eq: "=",
			ne: "<>",
			gt: ">",
			gte: ">=",
			lt: "<",
			lte: "<=",
		};

		//operaciones con tres argumentos
		const operThreeArg = { between: "BETWEEN", notBetween: "NOT BETWEEN" };

		//operaciones con n-argumentos
		const logicos = {
			and: "AND",
			or: "OR",
			not: "NOT",
			like: "LIKE",
			notLike: "NOT LIKE",
			distinct: "DISTINCT",
		};

		// Operaciones con un argumento
		for (const operOne in operOneCol) {
			if (typeof this[operOne] === "function") {
				continue;
			}
			this[operOne] = (a, next) => {
				if (this.isQueryBuilder(a)) {
					return `${next.q.pop()} ${operOneCol[operOne]}`;
				}
				// Manejo especial para arrays en isNull y isNotNull
				if (Array.isArray(a)) {
					return a.map(col => `${col} ${operOneCol[operOne]}`).join('\nAND ');
				}
				return `${a} ${operOneCol[operOne]}`;
			};
		}

		// Operaciones con dos argumentos
		for (const oper in operTwoCols) {
			if (typeof this[oper] === "function") {
				continue;
			}
			this[oper] = (a, b, next) => {
				let valorDeA = a;
				let valorDeB = b;

				// Manejo especial para predicados ANY/SOME/ALL
				if (this.isQueryBuilder(b) && next && /^(any|some|all)$/.test(next.last)) {
					// El valor b ya contiene el predicado formateado (ej: "ANY ( SELECT ... )")
					valorDeB = next.q.pop(); // Obtener el último valor que contiene el predicado
				} else if (this.isQueryBuilder(b)) {
					valorDeB = this.getSubselect(next);
					if (Array.isArray(valorDeB)) {
						valorDeB = valorDeB.join("\n");
					}
				}

				if (this.isQueryBuilder(a)) {
					valorDeA = this.getSubselect(next);
					if (Array.isArray(valorDeA)) {
						valorDeA = valorDeA.join("\n");
					}
				}
				if (b !== undefined) {
					if (typeof b === "string") {
						if (/^(ANY|SOME|ALL)/.test(b)) {
							valorDeB = b;
						} else {
							valorDeB = `'${b}'`;
						}
					}
				}
				if (valorDeB !== undefined) {
					if (typeof valorDeB === "string") {
						if (valorDeB.startsWith("SELECT")) {
							valorDeB = `( ${valorDeB} )`;
						}
					}
					return `${valorDeA} ${operTwoCols[oper]} ${valorDeB}`;
				}
				if (Array.isArray(valorDeA)) {
					return `${valorDeA.join(` ${operTwoCols[oper]}\nAND `)} ${operTwoCols[oper]}`;
				}
				return `${valorDeA} ${operTwoCols[oper]}`;
			};
		}

		// Operaciones logicas con n-argumentos
		for (const oper in logicos) {
			if (/^(and|or)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `\n${logicos[oper].toUpperCase()} ${predicados}`;
				};
			}
			if (/^(not)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `${logicos[oper].toUpperCase()} (${predicados})`;
				};
			}

			if (/^(like|notLike)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					const next = predicados.pop();
					let [a, b] = predicados;
					if (this.isQueryBuilder(b)) {
						b = next.q.pop();
					}
					if (this.isQueryBuilder(a)) {
						a = next.q.pop();
					}
					return `${a} ${logicos[oper].toUpperCase()} ('${b}')`;
				};
			}
			if (/^(distinct)$/i.test(oper)) {
				this[oper] = (...predicados) =>
					`${logicos[oper].toUpperCase()} ${predicados}`;
			}
		}

		// Operaciones con tres argumentos
		for (const oper in operThreeArg) {
			if (/^(between|notBetween)$/i.test(oper)) {
				this[oper] = (campo, min, max) => {
					return `${campo} ${operThreeArg[oper].toUpperCase()} ${min} AND ${max}`;
				};
			}
		}
	}

	in(columna, values, next) {
		log(["Core", "in(columna, values, next)"], "values", values.length);
		const response = this.getListValues(values, next);
		log(["Core", "in(columna, values, next)"], "respuesta %o", response);
		return `${columna} IN ( ${response} )`;
	}
	notIn(columna, values, next) {
		const response = this.getListValues(values, next);
		return `${columna} NOT IN ( ${response} )`;
	}
	exists(subSelect, next) {
		const response = this.getListValues(subSelect, next);
		return `EXISTS ( ${response} )`;
	}
	notExists(subSelect, next) {
		const response = this.getListValues(subSelect, next);
		return `NOT EXISTS ( ${response} )`;
	}

	any(subSelect, next) {
		const response = this.getListValues(subSelect, next);
		return `ANY ( ${response} )`;
	}
	some(subSelect, next) {
		return `SOME ( ${this.getListValues(subSelect, next)} )`;
	}
	all(subSelect, next) {
		return `ALL ( ${this.getListValues(subSelect, next)} )`;
	}

	groupBy(columns, options) {
		const sql = "GROUP BY";
		if (typeof columns === "string") {
			return `${sql} ${columns}`;
		}
		if (typeof columns === "object") {
			if (columns?.rollup !== undefined) {
				return `${sql} ROLLUP (${columns.rollup.join(", ")})`;
			}
			if (columns?.cube !== undefined) {
				return `${sql} CUBE (${columns.cube.join(", ")})`;
			}
		}
		return `${sql} ${columns.join(", ")}`;
	}
	having(predicado, options) {
		// Fix: Handle object conversion properly
		if (typeof predicado === 'object' && predicado !== null) {
			// If it's a next object with q array, use last query element
			if (predicado.q && Array.isArray(predicado.q) && predicado.q.length > 0) {
				const lastQuery = predicado.q[predicado.q.length - 1];
				return `HAVING ${lastQuery}`;
			}
			// Default fallback
			return `HAVING COUNT(*) > 0`;
		}
		return `HAVING ${predicado}`;
	}
	orderBy(columns) {
		const colStack = [];
		const sql = "ORDER BY";
		if (Array.isArray(columns)) {
			for (const column of columns) {
				colStack.push(this.orderBy(column).replace(sql, "").trim());
			}
			return `${sql} ${colStack.join(", ")}`;
		}
		if (typeof columns === "string" || columns instanceof Column) {
			return `${sql} ${columns}`;
		}
		if (typeof columns === "object") {
			if (columns?.col !== undefined) {
				if (/^(ASC|DESC)/i.test(columns?.order)) {
					return `${sql} ${columns.col} ${columns.order.toUpperCase()}`;
				}
				return `${sql} ${columns.col}`;
			}
			throw new Error(`Falta el atributo 'col'`);
		}
	}

	/*******************************************************************************
	 * DML
	 * Manipulan los datos almacenados en las tablas.
	 ******************************************************************************/

	/**
	 * Generates INSERT INTO SQL statement for data insertion
	 * Supports various value formats including arrays, objects, and subqueries
	 * 
	 * @method insert
	 * @memberof Core
	 * @param {string} table - Target table name for insertion
	 * @param {Array<string>} cols - Column names for insertion
	 * @param {Array|Object|*} values - Values to insert (array of values, object, or single value)
	 * @param {Object} next - QueryBuilder instance providing context
	 * @returns {string} INSERT INTO SQL statement
	 * @throws {Error} When table is undefined
	 * @example

	 * // Insert with column list and values
	 * const insert1 = core.insert('users', ['name', 'email'], ['John', 'john@example.com'], qb);
	 * // Returns: "INSERT INTO users\n( name, email )\nVALUES ( 'John', 'john@example.com' )"
	 * 
	 * // Insert multiple rows
	 * const insert2 = core.insert('users', ['name'], [['John'], ['Jane']], qb);

	 */
	insert(table, cols, values, next) {
		let sql = "INSERT INTO";
		if (table !== undefined) {
			sql = `${sql} ${table}`;
		} else {
			throw new Error("Tiene que definir una tabla");
		}
		if (Array.isArray(cols)) {
			if (cols.length > 0) {
				sql = `${sql}\n( ${cols.join(", ")} )`;
			}
		}
		if (Array.isArray(values)) {
			if (Array.isArray(values[0])) {
				return `${sql}\nVALUES\n${values
					.map(
						(value) =>
							`(${value
								.map((item) => {
									if (typeof item === "string") {
										return `'${item}'`;
									}
									if (this.isQueryBuilder(item)) {
										log(
											["Core", "insert"],
											"El primer elemento es un Array Recibe next:",
											next,
										);
										const resolve = this.getSubselect(next);
										return Array.isArray(resolve)
											? resolve.join("\n")
											: resolve;
									}
									return item;
								})
								.join(", ")})`,
					)
					.join(",\n")}`;
			}
			sql = `${sql}\nVALUES\n( ${values
				.map((value) => {
					if (typeof value === "string") {
						return `'${value}'`;
					}
					if (this.isQueryBuilder(value)) {
						log(
							["Core", "insert"],
							"El primer elemento no es un Array. Recibe next:",
							next,
						);
						const resolve = this.getSubselect(next, true);
						return Array.isArray(resolve)
							? `( ${resolve.join("\n")} )`
							: resolve;
					}
					return value;
				})
				.join(", ")} )`;
		}
		if (this.isQueryBuilder(values)) {
			const resolve = this.getSubselect(next);
			sql = `${sql}\n${Array.isArray(resolve) ? resolve.join("\n") : resolve}`;
		}
		if (typeof values === "string") {
			sql = `${sql}\n${values}`;
		}
		return sql;
	}

	/**
	 * Generates UPDATE SQL statement for data modification
	 * Supports various value types including strings, numbers, and subqueries
	 * 
	 * @method update
	 * @memberof Core
	 * @param {string} table - Target table name for update
	 * @param {Object} sets - Object with column-value pairs to update
	 * @param {Object} next - QueryBuilder instance providing context
	 * @returns {Promise<string>} UPDATE SQL statement
	 * @example

	 * // Simple update
	 * const update1 = await core.update('users', { name: 'John', age: 25 }, qb);
	 * // Returns: "UPDATE users\nSET name = 'John', age = 25"
	 * 
	 * // Update with subquery
	 * const update2 = await core.update('users', { status: subQueryBuilder }, qb);

	 */
	update(table, sets, next) {
		const sql = `UPDATE ${table}`;
		const setStack = [];
		for (const col in sets) {
			log(["Core", "update"], "Procesa columna", col);
			if (typeof sets[col] === "string" && /(:)/.test(sets[col]) === false) {
				setStack.push(`${col} = '${sets[col]}'`);
			} else if (this.isQueryBuilder(sets[col])) {
				log(
					["Core", "update"],
					"El valor de la columna %o es un QB recibe: %o",
					col,
					next,
				);
				const subSelect = this.getSubselect(next);
				log(["Core", "update"], "el SubSelect es", subSelect);
				setStack.push(
					`${col} =\n( ${Array.isArray(subSelect) ? subSelect.join("\n") : subSelect} )`,
				);
			} else {
				setStack.push(`${col} = ${sets[col]}`);
			}
		}
		return `${sql}\nSET ${setStack.join(",\n")}`;
	}

	/**
	 * Generates DELETE FROM SQL statement for data removal
	 * Creates basic DELETE statement for specified table
	 * 
	 * @method delete
	 * @memberof Core
	 * @param {string} from - Table name to delete from
	 * @returns {string} DELETE FROM SQL statement
	 * @example

	 * const deleteStmt = core.delete('users');
	 * // Returns: "DELETE FROM users"

	 */
	delete(from) {
		return `DELETE FROM ${from}`;
	}

	/**
	 * Funciones de agregación y otras funciones SQL
	 * Estas funciones se añaden dinámicamente al constructor Core
	 * para evitar la repetición de código.
	 * @function functionOneParam
	 * @private
	 * @memberof Core
	 * @param {Object} config - Configuración del Core
	 * @returns {Core} - Instancia de Core con funciones añadidas
	 */

	/**
	 * Genera una consulta SQL COUNT
	 * @method count
	 * @memberof Core
	 * @param {string|column|QueryBuilder} column - Columna o expresión a contar
	 * @param {string} [alias] - Alias opcional para el resultado
	 * @returns {string} - "COUNT(*) [AS total]"

	/**
	 * Genera una consulta SQL AVG
	 * @method avg
	 * @memberof Core
	 * @param {string|column|QueryBuilder} column - Columna o expresión a contar
	 * @param {string} [alias] - Alias opcional para el resultado
	 * @returns {string} - "AVG(column) [AS average]"
	 */
	/**
	 * Genera una consulta SQL MAX
	 * @method max
	 * @memberof Core
	 * @param {string|column|QueryBuilder} column - Columna o expresión a contar
	 * @param {string} [alias] - Alias opcional para el resultado
	 * @returns {string} - "MAX(column) [AS maximum]"
	 */
	/**
	 * Genera una consulta SQL MIN
	 * @method min
	 * @memberof Core
	 * @param {string|column|QueryBuilder} column - Columna o expresión a contar
	 * @param {string} [alias] - Alias opcional para el resultado
	 * @returns {string} - "MIN(column) [AS minimum]"
	 */
	/**
	 * Genera una consulta SQL SUM
	 * @method sum
	 * @memberof Core
	 * @param {string|column|QueryBuilder} column - Columna o expresión a contar
	 * @param {string} [alias] - Alias opcional para el resultado
	 * @returns {string} - "SUM(column) [AS total]"
	 */
	/**
	 * Genera una consulta SQL UPPER
	 * @method upper
	 * @memberof Core
	 * @param {string|column|QueryBuilder} column - Columna o expresión a convertir a mayúsculas
	 * @param {string} [alias] - Alias opcional para el resultado
	 * @returns {string} - "UPPER(column) [AS alias]"
	 */
	/**
	 * Genera una consulta SQL LOWER
	 * @method lower
	 * @memberof Core
	 * @param {string|column|QueryBuilder} column - Columna o expresión a convertir a minúsculas
	 * @param {string} [alias] - Alias opcional para el resultado
	 * @returns {string} - "LOWER(column) [AS alias]"
	 */

	functionOneParam() {
		const names = ["count", "max", "min", "sum", "avg", "upper", "lower"];
		for (const name of names) {
			if (typeof this[name] === "function") {
				continue;
			}

			this[name] = (column, alias, next) => {
				let colName = column;
				if (this.isQueryBuilder(column)) {
					colName = next.q.pop();
				}

				return `${name.toUpperCase()}(${colName})${typeof alias !== "undefined" ? ` AS ${alias}` : ""}`;
			};
		}
	}

	// funciones VALOR de cadena

	/**
	 * Función SQL SUBSTRING
	 * @function substr
	 * @memberof Core
	 * @param {string|column} column - Columna
	 * @param {int} inicio - Valor inicial
	 * @param  {...any} options
	 * @returns {string} - "SUBSTRING(column FROM inicio [FOR longitud]) [AS alias]"
	 */
	substr(column, inicio, ...options) {
		if (typeof options[0] === "string") {
			return `SUBSTRING(${column} FROM ${inicio})${typeof options[0] !== "undefined" ? ` AS ${options[0]}` : ""}`;
		}
		return `SUBSTRING(${column} FROM ${inicio}${typeof options[0] !== "undefined" ? ` FOR ${options[0]}` : ""})${typeof options[1] !== "undefined" ? ` AS ${options[1]}` : ""}`;
	}


	/**
	 * Funciones de fecha y hora
	 * Estas funciones se añaden dinámicamente al constructor Core
	 * para evitar la repetición de código.
	 * @function functionDate
	 * @private
	 * @memberof Core
	 */

	/**
	 * @method currentDate
	 * @memberof Core
	 * @returns {string} - "CURRENT_DATE"
	 */
	/**
	 * @method currentTime
	 * @memberof Core
	 * @returns {string} - "CURRENT_TIME"
	 */
	/**
	 * @method currentTimestamp
	 * @memberof Core
	 * @returns {string} - "CURRENT_TIMESTAMP"
	 */
	/**
	 * @method localTime
	 * @memberof Core
	 * @returns {string} - "LOCALTIME"
	 */
	/**
	 * @method localTimestamp
	 * @memberof Core
	 * @returns {string} - "LOCALTIMESTAMP"
	 */


	functionDate() {
		const names = {
			currentDate: "CURRENT_DATE",
			currentTime: "CURRENT_TIME",
			currentTimestamp: "CURRENT_TIMESTAMP",
			localTime: "LOCALTIME",
			localTimestamp: "LOCALTIMESTAMP",
		};
		for (const name in names) {
			this[name] = () => names[name];
		}
	}
	/**
	 * Genera una expresión CASE SQL.
	 * Soporta casos con y sin columna AS
	 * Se pueden pasar tres parámetros (columna, casos, defecto)
	 * o dos parámetros (casos, defecto) si no se usa columna AS
	 * @method case
	 * @memberof Core
	 * @param {string|column} [column] - nombre de la columna AS
	 * @param {Array<Casos>} casos - Array<column,string> => [ [condicion, resultado],...]
	 * @param {string} defecto - Caso else
	 * @returns {Expresion} - instancia de Expresion
	 * @see {@link Expresion}
	 * @example
	 * // Ejemplo sin columna AS
	 * const case1 = core.case([
	 *   [ 'age < 18', "'Minor'" ],
	 *   [ 'age >= 18 AND age < 65', "'Adult'" ],
	 *   [ 'age >= 65', "'Senior'" ]
	 * ]);
	 * // Resultado:
	 * // CASE
	 * // WHEN age < 18 THEN 'Minor'
	 * // WHEN age >= 18 AND age < 65 THEN 'Adult'
	 * // WHEN age >= 65 THEN 'Senior'
	 * // END
	 */
	case(column, casos, defecto, next) {
		log(["Core", "case"], "Recibe", next);
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

		next.q.reverse(); // invierte el array para que los resultados esten en el orden correcto
		command += items
			.reverse()
			.map((item) => {
				let [caso, resultado] = item;
				if (this.isQueryBuilder(caso)) {
					caso = next.q.shift();
				}
				return `WHEN ${caso} THEN ${resultado}`;
			})
			.reverse()
			.join("\n");
		command += `\n${lastChance !== undefined ? `ELSE ${lastChance}\n` : ""}`;
		command += `${Array.isArray(column) ? "END" : `END AS ${column}`}`;
		next.q.reverse(); // devuelve el orden inicial
		return new Expresion(command);
	}
	// cursores

	/**
	 * Crea un cursor SQL.
	 * Utiliza la función específica del dialecto SQL (sql2006.createCursor).
	 * @method createCursor
	 * @memberof Core
	 * @param {string} name - Nombre del cursor
	 * @param {string} expresion - Expresión SQL para el cursor
	 * @param {Object} options - Opciones adicionales para el cursor
	 * @returns {string} - Declaración SQL para crear el cursor
	 * @throws {Error} - Si el nombre del cursor no es válido
	 * @see {@link sql2006.createCursor}
	 * @example
	 * const cursorSql = core.createCursor('myCursor', 'SELECT * FROM users', { scroll: true }, qb);
	 */
	createCursor(name, expresion, options, next) {
		if (typeof name !== "string" || typeof name === "undefined") {
			throw new Error("Es necesario un nombre valido para el cursor");
		}

		return this.getStatement(
			"DECLARE",
			sql2006.createCursor,
			{
				name,
				expresion,
				options,
				next,
			},
			" ",
		);
	}
	/**
	 * Abre un cursor SQL.
	 * @method openCursor
	 * @memberof Core
	 * @param {string} name - Nombre del cursor a abrir
	 * @returns {string} - Declaración SQL para abrir el cursor
	 */
	openCursor(name) {
		return `OPEN ${name}`;
	}
	/**
	 * Cierra un cursor SQL.
	 * @method closeCursor
	 * @memberof Core
	 * @param {string} name - Nombre del cursor a cerrar
	 * @returns {string} - Declaración SQL para cerrar el cursor
	 */
	closeCursor(name) {
		return `CLOSE ${name}`;
	}
	/**
	 * Realiza una operación FETCH en un cursor SQL.
	 * Permite recuperar filas del cursor y almacenarlas en variables host.
	 * @method fetch
	 * @memberof Core
	 * @param {string} cursorName - Nombre del cursor
	 * @param {Array<string>} hostVars - Variables host donde se almacenarán las filas
	 * @returns {string} - Declaración SQL para realizar la operación FETCH
	 */
	fetch(cursorName, hostVars) {
		return `FETCH ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
	}
	/**
	 * Genera funciones FETCH para diferentes direcciones.
	 * Las funciones generadas incluyen: NEXT, PRIOR, FIRST, LAST, ABSOLUTE, RELATIVE.
	 * Cada función permite recuperar filas del cursor en la dirección especificada.
	 * @method fetches
	 * @memberof Core
	 * @private
	 */

	/**
	 * @method fetchNext
	 * @memberof Core
	 * @param {string} cursorName - Nombre del cursor
	 * @param {Array<string>} hostVars - Variables host donde se almacenarán las filas
	 * @returns {string} - Declaración SQL para realizar la operación FETCH NEXT
	 */
	/**
	 * @method fetchPrior
	 * @memberof Core
	 * @param {string} cursorName - Nombre del cursor
	 * @param {Array<string>} hostVars - Variables host donde se almacenarán las filas
	 * @returns {string} - Declaración SQL para realizar la operación FETCH PRIOR
	 */
	/**
	 * @method fetchFirst
	 * @memberof Core
	 * @param {string} cursorName - Nombre del cursor
	 * @param {Array<string>} hostVars - Variables host donde se almacenarán las filas
	 * @returns {string} - Declaración SQL para realizar la operación FETCH FIRST
	 */
	/**
	 * @method fetchLast
	 * @memberof Core
	 * @param {string} cursorName - Nombre del cursor
	 * @param {Array<string>} hostVars - Variables host donde se almacenarán las filas
	 * @returns {string} - Declaración SQL para realizar la operación FETCH LAST
	 */
	/**
	 * @method fetchAbsolute
	 * @memberof Core
	 * @param {string} cursorName - Nombre del cursor
	 * @param {number} filas - Número de filas a recuperar
	 * @param {Array<string>} hostVars - Variables host donde se almacenarán las filas
	 * @returns {string} - Declaración SQL para realizar la operación FETCH ABSOLUTE
	 */
	/**
	 * @method fetchRelative
	 * @memberof Core
	 * @param {string} cursorName - Nombre del cursor
	 * @param {number} filas - Número de filas a recuperar
	 * @param {Array<string>} hostVars - Variables host donde se almacenarán las filas
	 * @returns {string} - Declaración SQL para realizar la operación FETCH RELATIVE
	 */
	fetches() {
		const directions = ["NEXT", "PRIOR", "FIRST", "LAST"];
		const directionsWithValue = ["ABSOLUTE", "RELATIVE"];
		for (const comand of directions) {
			if (typeof this[comand] === "function") {
				continue;
			}
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (cursorName, direction, hostVars) => {
				return `FETCH ${direction.toUpperCase()} FROM ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
			};
		}
		for (const comand of directionsWithValue) {
			const comandName = `fetch${comand.toCapital()}`;
			if (typeof this[comandName] === "function") {
				continue;
			}
			this[comandName] = (cursorName, direction, filas, hostVars) => {
				return `FETCH ${direction.toUpperCase()} ${filas} FROM ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
			};
		}
	}
	// Transacciones

	/**
	 * Genera una declaración SQL para configurar una transacción.
	 * Utiliza la función específica del dialecto SQL (sql2006.setTransaction).
	 * @method setTransaction
	 * @memberof Core
	 * @param {Object} config - Configuración de la transacción
	 * @returns {string} - Declaración SQL para configurar la transacción
	 * @throws {Error} - Si la configuración no es válida
	 * @see {@link sql2006.setTransaction}
	 */
	setTransaction(config) {
		return this.getStatement(
			"SET TRANSACTION",
			sql2006.setTransaction,
			{
				options: config,
			},
			",\n",
		);
	}
	/**
	 * Genera una declaración SQL para iniciar una transacción.
	 * Utiliza la función específica del dialecto SQL (sql2006.startTransaction).
	 * @method startTransaction
	 * @memberof Core
	 * @param {Object} config - Configuración de la transacción
	 * @returns {string} - Declaración SQL para iniciar la transacción
	 * @throws {Error} - Si la configuración no es válida
	 * @see {@link sql2006.setTransaction}
	 */
	startTransaction(config) {
		return this.setTransaction(config).replace("SET", "START");
	}
	/**
	 * Genera una declaración SQL para establecer restricciones de integridad.
	 * Permite definir restricciones específicas y su tipo (DEFERRED o IMMEDIATE).
	 * @method setConstraints
	 * @memberof Core
	 * @param {string|Array<string>} restrictions - Restricciones a establecer
	 * @param {string} [type= DEFERRED|IMMEDIATE] - Tipo de restricción (DEFERRED o IMMEDIATE)
	 * @returns {string} - Declaración SQL para establecer las restricciones
	 */
	setConstraints(restrictions, type) {
		if (Array.isArray(restrictions)) {
			return `SET CONSTRAINTS ${restrictions.join(", ")} ${/^(DEFERRED|IMMEDIATE)$/i.test(type) ? type.toUpperCase() : ""}`;
		}
		return `SET CONSTRAINTS ${restrictions} ${/^(DEFERRED|IMMEDIATE)$/i.test(type) ? type.toUpperCase() : ""}`;
	}
	/**
	 * Genera una declaración SQL para manejar puntos de guardado en transacciones.
	 * Permite crear, liberar y revertir a puntos de guardado específicos.
	 * @method setSavePoint
	 * @memberof Core
	 * @param {string} name - Nombre del punto de guardado
	 * @returns {string} - Declaración SQL para manejar el punto de guardado
	 */
	setSavePoint(name) {
		return `SAVEPOINT ${name}`;
	}
	/**
	 * Genera una declaración SQL para liberar un punto de guardado en una transacción.
	 * @method clearSavePoint
	 * @memberof Core
	 * @param {string} name - Nombre del punto de guardado
	 * @returns {string} - Declaración SQL para liberar el punto de guardado
	 */
	clearSavePoint(name) {
		return `RELEASE SAVEPOINT ${name}`;
	}
	/**
	 * Genera una declaración SQL para confirmar o revertir una transacción.
	 * Permite confirmar la transacción actual o revertir a un punto de guardado específico.
	 * @method commit
	 * @memberof Core
	 * @param {string} [name] - Nombre del punto de guardado para revertir (opcional)
	 * @returns {string} - Declaración SQL para confirmar o revertir la transacción
	 */
	commit(name) {
		return "COMMIT";
	}
	/**
	 * Genera una declaración SQL para revertir una transacción.
	 * Permite revertir la transacción actual o a un punto de guardado específico.
	 * @method rollback
	 * @memberof Core
	 * @param {string} [savepoint] - Nombre del punto de guardado para revertir (opcional)
	 * @returns {string} - Declaración SQL para revertir la transacción
	 */
	rollback(savepoint) {
		if (typeof savepoint === "string") {
			return `ROLLBACK TO SAVEPOINT ${savepoint}`;
		}
		return "ROLLBACK";
	}
	// Paginación
	/**
	 * Genera una cláusula SQL LIMIT con OFFSET opcional.
	 * @method limit
	 * @memberof Core
	 * @param {number} count - Número máximo de filas a devolver
	 * @param {number} [offset] - Número de filas a omitir (opcional)
	 * @returns {string} - Cláusula SQL LIMIT con OFFSET opcional
	 */
	limit(count, offset) {
		if (typeof offset !== 'undefined') {
			return `LIMIT ${count} OFFSET ${offset}`;
		}
		return `LIMIT ${count}`;
	}
	// Otras funciones SQL
	/**
	 * Genera una expresión SQL para concatenar columnas.
	 * @method concat
	 * @memberof Core
	 * @param {Array<string>} columns - Columnas a concatenar
	 * @param {string} [alias] - Alias para la expresión resultante
	 * @returns {string} - Expresión SQL para concatenar columnas
	 */
	concat(columns, alias) {
		if (Array.isArray(columns)) {
			return `CONCAT(${columns.join(', ')})${alias ? ` AS ${alias}` : ''}`;
		}
		return `CONCAT(${columns})${alias ? ` AS ${alias}` : ''}`;
	}

	/**
	 * Genera una expresión SQL para manejar valores nulos.
	 * @method coalesce
	 * @memberof Core
	 * @param {Array<string>} columns - Columnas a evaluar
	 * @param {string} [alias] - Alias para la expresión resultante
	 * @returns {string} - Expresión SQL para manejar valores nulos
	 */
	coalesce(columns, alias) {
		if (Array.isArray(columns)) {
			return `COALESCE(${columns.join(', ')})${alias ? ` AS ${alias}` : ''}`;
		}
		return `COALESCE(${columns})${alias ? ` AS ${alias}` : ''}`;
	}
	/**
	 * Genera una expresión SQL para manejar valores nulos.
	 * @method nullif
	 * @memberof Core
	 * @param {string} expr1 - Primera expresión a evaluar
	 * @param {string} expr2 - Segunda expresión a evaluar
	 * @param {string} [alias] - Alias para la expresión resultante
	 * @returns {string} - Expresión SQL para manejar valores nulos
	 */
	nullif(expr1, expr2, alias) {
		return `NULLIF(${expr1}, ${expr2})${alias ? ` AS ${alias}` : ''}`;
	}
	/**
	 * Genera una expresión SQL para recortar espacios en blanco o caracteres específicos.
	 * @method trim
	 * @memberof Core
	 * @param {string} column - Columna a recortar
	 * @param {string} [chars] - Caracteres específicos a recortar (opcional)
	 * @param {string} [alias] - Alias para la expresión resultante (opcional)
	 * @returns {string} - Expresión SQL para recortar espacios en blanco o caracteres específicos
	 */
	trim(column, chars, alias) {
		const trimExpr = chars ? `TRIM(${chars} FROM ${column})` : `TRIM(${column})`;
		return `${trimExpr}${alias ? ` AS ${alias}` : ''}`;
	}
	/**
	 * Genera una expresión SQL para recortar espacios en blanco o caracteres específicos a la izquierda.
	 * @method ltrim
	 * @memberof Core
	 * @param {string} column - Columna a recortar
	 * @param {string} [chars] - Caracteres específicos a recortar (opcional)
	 * @param {string} [alias] - Alias para la expresión resultante (opcional)
	 * @returns {string} - Expresión SQL para recortar espacios en blanco o caracteres específicos a la izquierda
	 */
	ltrim(column, chars, alias) {
		const trimExpr = chars ? `LTRIM(${column}, ${chars})` : `LTRIM(${column})`;
		return `${trimExpr}${alias ? ` AS ${alias}` : ''}`;
	}
	/**
	 * Genera una expresión SQL para recortar espacios en blanco o caracteres específicos a la derecha.
	 * @method rtrim
	 * @memberof Core
	 * @param {string} column - Columna a recortar
	 * @param {string} [chars] - Caracteres específicos a recortar (opcional)
	 * @param {string} [alias] - Alias para la expresión resultante (opcional)
	 * @returns {string} - Expresión SQL para recortar espacios en blanco o caracteres específicos a la derecha
	 */
	rtrim(column, chars, alias) {
		const trimExpr = chars ? `RTRIM(${column}, ${chars})` : `RTRIM(${column})`;
		return `${trimExpr}${alias ? ` AS ${alias}` : ''}`;
	}
	/**
	 * Genera una expresión SQL para obtener la longitud de una cadena.
	 * @method length
	 * @memberof Core
	 * @param {string} column - Columna a evaluar
	 * @param {string} [alias] - Alias para la expresión resultante
	 * @returns {string} - Expresión SQL para obtener la longitud de una cadena
	 */
	length(column, alias) {
		return `LENGTH(${column})${alias ? ` AS ${alias}` : ''}`;
	}
	// joins
	/**
	 * Genera una cláusula SQL ON para condiciones de unión.
	 * @method on
	 * @memberof Core
	 * @param {string|object} condition - Condición de unión
	 * @param {object} next - Objeto de consulta siguiente
	 * @returns {string} - Cláusula SQL ON
	 */
	on(condition, next) {
		// Handle case where condition comes from qb.eq() or similar - it's an object from querybuilder
		if (condition && typeof condition === 'object' && next && next.q && Array.isArray(next.q) && next.q.length > 0) {
			// Get the last element from the query array (which should be the condition like "i.ID_TIPO = t.ID_TIPO")
			const lastItem = next.q[next.q.length - 1];
			let lastCondition;

			log(['Core', 'on'], 'lastItem type:', typeof lastItem, 'value:', lastItem);

			// Handle different types of conditions
			if (typeof lastItem === 'string') {
				lastCondition = lastItem;
			} else if (lastItem && typeof lastItem === 'object') {
				// Try to extract string value safely
				try {
					lastCondition = JSON.stringify(lastItem);
				} catch (e) {
					log(['Core', 'on'], 'Cannot stringify lastItem, using fallback');
					return 'ON 1=1';
				}
			} else {
				// Skip conversion and return fallback
				log(['Core', 'on'], 'Unknown lastItem type, using fallback');
				return 'ON 1=1';
			}

			// Remove the condition from query array as we'll replace it with ON version
			next.q.splice(next.q.length - 1, 1);
			log(['Core', 'on'], 'returning ON condition:', lastCondition);
			return `ON ${lastCondition}`;
		}
		if (condition !== undefined) {
			return `ON ${condition}`;
		}
		return 'ON 1=1'; // fallback
	}
}
// Exportaciones
export default Core;
export { Core };

