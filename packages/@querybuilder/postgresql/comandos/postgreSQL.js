/**
 * @fileoverview PostgreSQL Commands - Comandos SQL específicos de PostgreSQL
 * @module @querybuilder/postgresql/comandos/postgreSQL
 * @description Módulo que centraliza todos los comandos específicos de PostgreSQL,
 * incluyendo DDL (CREATE TYPE, CREATE DOMAIN, ALTER TABLE), gestión de roles,
 * y comandos de esquema. Extiende SQL2006 con características propias de PostgreSQL.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Importar comandos PostgreSQL
 * import postgreSQL from '@querybuilder/postgresql/comandos/postgreSQL.js';
 * 
 * // Crear tipo personalizado
 * const createEnum = postgreSQL.createType('status_type', ['active', 'inactive', 'pending']);
 * 
 * @example
 * // Crear dominio
 * const emailDomain = postgreSQL.createDomain('email', 'VARCHAR(255)', {
 *   check: "VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'"
 * });
 * 
 * @example
 * // Alterar tabla
 * const alterCmd = postgreSQL.alterTable('users')
 *   .addColumn('profile', 'JSONB')
 *   .addConstraint('check_age', 'CHECK (age >= 18)');
 */

import { createType, createTable, createDomain } from "./postgreSQL/create.js";
import { dropType } from "./postgreSQL/drop.js";
import { column } from "./postgreSQL/column.js";
import { createRoles } from "./postgreSQL/roles.js";
import { alterTable, addColumn, dropColumn, alterColumn, addConstraint, dropConstraint, renameTable, renameColumn, setSchema } from "./postgreSQL/alter.js";

/**
 * Colección de comandos específicos de PostgreSQL
 * @namespace postgreSQL
 * @type {Object}
 * 
 * @property {Function} createType - Crea tipos personalizados (ENUM, COMPOSITE)
 * @property {Function} createDomain - Crea dominios con restricciones
 * @property {Function} dropType - Elimina tipos personalizados
 * @property {Function} createTable - Crea tablas con características PostgreSQL
 * @property {Function} column - Define columnas con tipos PostgreSQL
 * @property {Function} createRoles - Crea roles de base de datos
 * @property {Function} alterTable - Modifica estructura de tablas
 * @property {Function} addColumn - Agrega columnas a tabla existente
 * @property {Function} dropColumn - Elimina columnas de tabla
 * @property {Function} alterColumn - Modifica definición de columna
 * @property {Function} addConstraint - Agrega restricciones (CHECK, FK, etc.)
 * @property {Function} dropConstraint - Elimina restricciones
 * @property {Function} renameTable - Renombra tabla
 * @property {Function} renameColumn - Renombra columna
 * @property {Function} setSchema - Cambia esquema de tabla
 * 
 * @example
 * // Crear tipo ENUM
 * const statusType = postgreSQL.createType('order_status', ['pending', 'processing', 'completed', 'cancelled']);
 * 
 * @example
 * // Usar comandos ALTER
 * const alterCmds = [
 *   postgreSQL.addColumn('users', 'profile_data', 'JSONB'),
 *   postgreSQL.addConstraint('users', 'email_unique', 'UNIQUE (email)'),
 *   postgreSQL.renameColumn('users', 'old_name', 'new_name')
 * ];
 */
const postgreSQL = {
	createType,
	createDomain,
	dropType,
	createTable,
	column,
	createRoles,
	alterTable,
	addColumn,
	dropColumn,
	alterColumn,
	addConstraint,
	dropConstraint,
	renameTable,
	renameColumn,
	setSchema,
};

export default postgreSQL;
