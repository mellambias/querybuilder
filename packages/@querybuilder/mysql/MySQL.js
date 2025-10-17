/**
 * @fileoverview MySQL QueryBuilder - Implementa las variaciones al SQL2006 propias de MySQL
 * @description Clase especializada para MySQL que extiende Core con funcionalidades específicas del SGBD MySQL.
 * Incluye soporte para CREATE TABLE, roles, permisos, transacciones y limitaciones específicas de MySQL.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * // Crear instancia MySQL
 * const mysql = new MySQL();
 * 
 * // Crear tabla con opciones MySQL
 * const createTableSQL = mysql.createTable('users', {
 *   columns: [
 *     { name: 'id', type: 'INT', autoIncrement: true, primaryKey: true },
 *     { name: 'name', type: 'VARCHAR(255)', notNull: true },
 *     { name: 'email', type: 'VARCHAR(255)', unique: true }
 *   ],
 *   engine: 'InnoDB',
 *   charset: 'utf8mb4'
 * });
 * 
 * // Crear roles MySQL
 * const rolesSQL = mysql.createRoles(['app_user', 'app_admin']);
 * 
 * // Gestionar permisos
 * const grantSQL = mysql.grant(['SELECT', 'INSERT'], 'users', 'app_user');
 */

/**
 * @namespace QueryBuilder.Adapters.MySQL
 * @description Adaptador MySQL que extiende QueryBuilder con funcionalidades específicas de MySQL
 * @memberof QueryBuilder.Adapters
 * @example
 * // Instalación del adaptador MySQL
 * npm install @querybuilder/core @querybuilder/mysql
 * 
 * // Uso del adaptador MySQL
 * import QueryBuilder from '@querybuilder/core';
 * import MySQL from '@querybuilder/mysql';
 * 
 * const qb = new QueryBuilder(MySQL);
 * qb.select('*').from('users').where('active = 1');
 */
import Core from "../core/core.js";
import Mysql84 from "./comandos/Mysql.js";
import Expresion from "../core/expresion.js";

/**
 * Clase MySQL QueryBuilder para operaciones específicas de MySQL
 * @class MySQL
 * @memberof QueryBuilder.Adapters.MySQL
 * @extends Core
 * @description Implementa las variaciones específicas de MySQL al estándar SQL2006.
 * Incluye soporte para tipos de datos MySQL, transacciones, roles, permisos y limitaciones específicas.
 */
class MySQL extends Core {
	/**
	 * Constructor de la clase MySQL
	 * @description Inicializa una nueva instancia del QueryBuilder para MySQL
	 * @constructor
	 * @since 1.0.0
	 * @example
	 * const mysql = new MySQL();
	 * console.log(mysql.dataType); // 'mysql'
	 */
	constructor() {
		super();
		/**
		 * Tipo de base de datos - siempre 'mysql'
		 * @type {string}
		 */
		this.dataType = "mysql";
	}

	/**
	 * Crear tipo personalizado - No soportado en MySQL
	 * @method createType
	 * @param {string} name - Nombre del tipo
	 * @param {Object} options - Opciones del tipo
	 * @throws {Error} MySQL no soporta CREATE TYPE, usar SET o ENUM
	 * @since 1.0.0
	 * @example
	 * // Este método lanzará error
	 * try {
	 *   mysql.createType('custom_type', {});
	 * } catch (error) {
	 *   console.log(error.message); // "No soportado utilice SET o ENUM"
	 * }
	 */
	createType(name, options) {
		throw new Error("No soportado utilice SET o ENUM");
	}
	/**
	 * Crear tabla MySQL con opciones específicas
	 * @method createTable
	 * @override
	 * @param {string} name - Nombre de la tabla
	 * @param {Object} options - Opciones de creación de tabla MySQL
	 * @param {Array} options.columns - Definiciones de columnas
	 * @param {string} [options.engine='InnoDB'] - Motor de almacenamiento MySQL
	 * @param {string} [options.charset] - Charset de la tabla
	 * @param {string} [options.collate] - Collation de la tabla
	 * @param {boolean} [options.ifNotExists] - Si incluir IF NOT EXISTS
	 * @returns {string} SQL CREATE TABLE para MySQL
	 * @throws {Error} Si hay error en la generación del SQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.createTable('products', {
	 *   columns: [
	 *     { name: 'id', type: 'INT', autoIncrement: true, primaryKey: true },
	 *     { name: 'name', type: 'VARCHAR(255)', notNull: true },
	 *     { name: 'price', type: 'DECIMAL(10,2)' }
	 *   ],
	 *   engine: 'InnoDB',
	 *   charset: 'utf8mb4'
	 * });
	 */
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
	/**
	 * Eliminar tabla MySQL
	 * @method dropTable
	 * @override
	 * @param {string} name - Nombre de la tabla a eliminar
	 * @param {Object} [options] - Opciones para DROP TABLE
	 * @param {boolean} [options.ifExists] - Si incluir IF EXISTS
	 * @param {boolean} [options.cascade] - Si eliminar dependencias
	 * @returns {string} SQL DROP TABLE para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.dropTable('old_table', { ifExists: true });
	 * // Genera: DROP TABLE IF EXISTS old_table
	 */
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
	/**
	 * Crear dominio - No soportado en MySQL
	 * @method createDomain
	 * @param {string} name - Nombre del dominio
	 * @param {Object} options - Opciones del dominio
	 * @throws {Error} MySQL no soporta CREATE DOMAIN
	 * @since 1.0.0
	 * @description MySQL no soporta directamente la creación de dominios.
	 * Se deben aplicar restricciones directamente en cada tabla que necesite el comportamiento específico.
	 * Para restricciones, usar CHECK (MySQL 8.0.16+) o TRIGGERS en versiones anteriores.
	 * @example
	 * // Este método lanzará error
	 * try {
	 *   mysql.createDomain('email_domain', { type: 'VARCHAR(255)' });
	 * } catch (error) {
	 *   console.log(error.message); // Error sobre falta de soporte
	 * }
	 */
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
	/**
	 * Crear assertion - No soportado en MySQL
	 * @method createAssertion
	 * @param {string} name - Nombre de la assertion
	 * @param {string} assertion - Condición de la assertion
	 * @throws {Error} MySQL no soporta CREATE ASSERTION
	 * @since 1.0.0
	 * @description El estándar SQL incluye assertions como una forma de crear restricciones más complejas 
	 * a nivel de base de datos, pero la mayoría de los sistemas no han implementado esta característica.
	 * En MySQL usar TRIGGERS o Constraints como alternativa.
	 * @example
	 * // Este método lanzará error
	 * try {
	 *   mysql.createAssertion('check_salary', 'salary > 0');
	 * } catch (error) {
	 *   console.log(error.message); // Error sobre falta de soporte
	 * }
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
	 * Crear roles MySQL
	 * @method createRoles
	 * @param {Array<string>} names - Array de nombres de roles a crear
	 * @param {Object} [options] - Opciones adicionales para los roles
	 * @param {boolean} [options.ifNotExists] - Si incluir IF NOT EXISTS
	 * @returns {string} SQL CREATE ROLE para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.createRoles(['app_user', 'app_admin'], { ifNotExists: true });
	 * // Genera: CREATE ROLE IF NOT EXISTS 'app_user', 'app_admin'
	 */
	createRoles(names, options) {
		return this.getStatement(
			"CREATE ROLE",
			Mysql84.createRoles,
			{ names, options },
			" ",
		);
	}
	/**
	 * Eliminar roles MySQL
	 * @method dropRoles
	 * @param {Array<string>} names - Array de nombres de roles a eliminar
	 * @param {Object} [options] - Opciones adicionales
	 * @param {boolean} [options.ifExists] - Si incluir IF EXISTS
	 * @returns {string} SQL DROP ROLE para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.dropRoles(['old_role', 'temp_role'], { ifExists: true });
	 * // Genera: DROP ROLE IF EXISTS 'old_role', 'temp_role'
	 */
	dropRoles(names, options) {
		return this.getStatement(
			"DROP ROLE",
			Mysql84.dropRoles,
			{ names, options },
			" ",
		);
	}
	/**
	 * Otorgar permisos MySQL
	 * @method grant
	 * @param {Array<string>} commands - Array de comandos/permisos a otorgar
	 * @param {string} on - Objeto sobre el que se otorgan permisos (tabla, base de datos, etc.)
	 * @param {string} to - Usuario o rol al que se otorgan permisos
	 * @param {Object} [options] - Opciones adicionales
	 * @param {boolean} [options.withGrantOption] - Si incluir WITH GRANT OPTION
	 * @returns {string} SQL GRANT para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.grant(['SELECT', 'INSERT'], 'database.table', 'app_user');
	 * // Genera: GRANT SELECT, INSERT ON database.table TO 'app_user'
	 * 
	 * const sqlWithOption = mysql.grant(['ALL'], '*.*', 'admin_user', { withGrantOption: true });
	 * // Genera: GRANT ALL ON *.* TO 'admin_user' WITH GRANT OPTION
	 */
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
	/**
	 * Revocar permisos MySQL
	 * @method revoke
	 * @param {Array<string>} commands - Array de comandos/permisos a revocar
	 * @param {string} on - Objeto del que se revocan permisos (tabla, base de datos, etc.)
	 * @param {string} from - Usuario o rol del que se revocan permisos
	 * @param {Object} [options] - Opciones adicionales
	 * @returns {string} SQL REVOKE para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.revoke(['DELETE'], 'database.table', 'app_user');
	 * // Genera: REVOKE DELETE ON database.table FROM 'app_user'
	 */
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
	/**
	 * Otorgar roles a usuarios MySQL
	 * @method grantRoles
	 * @param {Array<string>} roles - Array de roles a otorgar
	 * @param {Array<string>|string} users - Usuario(s) a los que otorgar roles
	 * @param {Object} [options] - Opciones adicionales
	 * @returns {string} SQL GRANT ROLE para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.grantRoles(['app_admin'], 'john_doe');
	 * // Genera: GRANT 'app_admin' TO 'john_doe'
	 */
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

	/**
	 * Revocar roles de usuarios MySQL
	 * @method revokeRoles
	 * @param {Array<string>} roles - Array de roles a revocar
	 * @param {Array<string>|string} from - Usuario(s) de los que revocar roles
	 * @param {Object} [options] - Opciones adicionales
	 * @returns {string} SQL REVOKE ROLE para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.revokeRoles(['app_admin'], 'john_doe');
	 * // Genera: REVOKE 'app_admin' FROM 'john_doe'
	 * 
	 * const multipleUsers = mysql.revokeRoles(['temp_role'], ['user1', 'user2']);
	 * // Genera múltiples statements separados por ;\n
	 */
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
	/**
	 * Crear vista MySQL (15.1.23 CREATE VIEW Statement)
	 * @method createView
	 * @param {string} name - Nombre de la vista
	 * @param {Object} options - Opciones de la vista
	 * @param {string} next - Query SELECT para la vista
	 * @returns {string} SQL CREATE VIEW para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.createView('user_summary', { replace: true }, 'SELECT id, name FROM users WHERE active = 1');
	 * // Genera: CREATE OR REPLACE VIEW user_summary AS SELECT id, name FROM users WHERE active = 1
	 */
	createView(name, options, next) {
		return this.getStatement("CREATE", Mysql84.createView, {
			name,
			options,
			next,
		});
	}

	/**
	 * Full Join - No soportado en MySQL
	 * @method fullJoin
	 * @param {Array} tables - Tablas para el join
	 * @param {string} [alias] - Alias para el resultado
	 * @returns {Error} Error indicando que no está soportado
	 * @since 1.0.0
	 * @description MySQL no soporta de forma nativa 'FULL OUTER JOIN'. 
	 * Se puede simular usando UNION de LEFT JOIN y RIGHT JOIN.
	 * @example
	 * // Este método retorna un Error
	 * const result = mysql.fullJoin(['table1', 'table2']);
	 * console.log(result instanceof Error); // true
	 */
	fullJoin(tables, alias) {
		return new Error("Comando no soportado 'fullJoin'", {
			cause: "MySQL no soporta de forma nativa 'FULL OUTER JOIN'",
		});
	}
	/**
	 * Limitar número de resultados MySQL
	 * @method limit
	 * @override
	 * @param {number} limit - Número máximo de resultados
	 * @returns {string} Cláusula LIMIT para MySQL
	 * @since 1.0.0
	 * @example
	 * const limitClause = mysql.limit(10);
	 * // Retorna: "LIMIT 10"
	 */
	limit(limit) {
		return `LIMIT ${limit}`;
	}

	/**
	 * Saltar número de resultados MySQL
	 * @method offset
	 * @override
	 * @param {number} offset - Número de resultados a saltar
	 * @returns {string} Cláusula OFFSET para MySQL
	 * @since 1.0.0
	 * @example
	 * const offsetClause = mysql.offset(20);
	 * // Retorna: "OFFSET 20"
	 */
	offset(offset) {
		return `OFFSET ${offset}`;
	}
	/**
	 * Configurar transacción MySQL
	 * @method setTransaction
	 * @param {Object} config - Configuración de la transacción
	 * @param {string} [config.isolation] - Nivel de aislamiento (READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE)
	 * @param {boolean} [config.readOnly] - Si la transacción es de solo lectura
	 * @returns {string} SQL SET TRANSACTION para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.setTransaction({ isolation: 'READ COMMITTED', readOnly: true });
	 * // Genera: SET TRANSACTION ISOLATION LEVEL READ COMMITTED, READ ONLY
	 */
	setTransaction(config) {
		return this.getStatement(
			"SET TRANSACTION",
			Mysql84.setTransaction,
			{
				options: config,
			},
			", ",
		).trim();
	}

	/**
	 * Iniciar transacción MySQL
	 * @method startTransaction
	 * @param {Object} [config] - Configuración opcional de la transacción
	 * @param {boolean} [config.readOnly] - Si la transacción es de solo lectura
	 * @param {boolean} [config.readWrite] - Si la transacción es de lectura-escritura
	 * @returns {string} SQL START TRANSACTION para MySQL
	 * @since 1.0.0
	 * @example
	 * const sql = mysql.startTransaction();
	 * // Genera: START TRANSACTION
	 * 
	 * const sqlReadOnly = mysql.startTransaction({ readOnly: true });
	 * // Genera: START TRANSACTION READ ONLY
	 */
	startTransaction(config) {
		return this.getStatement(
			"START TRANSACTION",
			Mysql84.startTransaction,
			{
				options: config,
			},
			", ",
		).trim();
	}
}

/**
 * @description Exportación por defecto de la clase MySQL
 * @exports MySQL
 */
export default MySQL;

/**
 * @description Exportación nombrada de la clase MySQL
 * @exports {MySQL}
 */
export { MySQL };
