/**
 * @fileoverview Comandos SQL2006 estándar para QueryBuilder
 * @module sql2006
 * @description Módulo que centraliza todos los comandos SQL estándar ISO/IEC 9075 (SQL2006).
 * Incluye comandos DDL, DCL y DML básicos que son compatibles con la mayoría de SGBDs.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * import sql2006 from './sql2006.js';
 * 
 * // Usar comandos SQL2006
 * const createTableCmd = sql2006.createTable;
 * const grantCmd = sql2006.grant;
 * const selectCmd = sql2006.select;
 */
import { grant, grantRoles } from "./sql2006/grant.js";
import { revoke, revokeRoles } from "./sql2006/revoke.js";
import { createRoles, dropRoles } from "./sql2006/roles.js";
import {
	createSchema,
	createTable,
	createType,
	createDomain,
	createView,
	createCursor,
} from "./sql2006/create.js";
import { dropSchema, dropColumn, dropTable, dropType, dropDomain, dropView } from "./sql2006/drop.js";
import { column } from "./sql2006/column.js";
import { constraint } from "./sql2006/constraint.js";
import { select } from "./sql2006/select.js";
import { setTransaction } from "./sql2006/transaction.js";

/**
 * Colección de comandos SQL2006 estándar
 * @name sql2006
 * @description Objeto que contiene los esquemas usados por getStatement() para generar sentencias SQL.
 * Incluye comandos de definición de datos (DDL), control de datos (DCL) y manipulación de datos (DML).
 * Cada comando está representado como un objeto con funciones para construir las diferentes partes de la sentencia SQL.
 * @property {objeto} createSchema {@link createSchema | objeto}  - Comando para crear esquemas (CREATE SCHEMA).
 * @property {Object} grant {@link grant | objeto} - Comando para otorgar permisos (GRANT).
 * @property {Object} grantRoles {@link grantRoles | objeto} - Comando para otorgar roles (GRANT ROLE).
 * @property {Object} revoke {@link revoke | objeto} - Comando para revocar permisos (REVOKE).
 * @property {Object} revokeRoles {@link revokeRoles | objeto} - Comando para revocar roles (REVOKE ROLE).
 * @property {Object} createRoles {@link createRoles | objeto} - Comando para crear roles (CREATE ROLE).
 * @property {Object} dropRoles {@link dropRoles | objeto} - Comando para eliminar roles (DROP ROLE).
 * @property {Object} createTable {@link createTable | objeto} - Comando para crear tablas (CREATE TABLE).
 * @property {Object} createType {@link createType | objeto} - Comando para crear tipos de datos (CREATE TYPE).
 * @property {Object} createDomain {@link createDomain | objeto} - Comando para crear dominios (CREATE DOMAIN).
 * @property {Object} createView {@link createView | objeto} - Comando para crear vistas (CREATE VIEW).
 * @property {Object} createCursor {@link createCursor | objeto} - Comando para crear cursores (CREATE CURSOR).
 * @property {Object} dropSchema {@link dropSchema | objeto} - Comando para eliminar esquemas (DROP SCHEMA).
 * @property {Object} dropColumn {@link dropColumn | objeto} - Comando para eliminar columnas (DROP COLUMN).
 * @property {Object} dropTable {@link dropTable | objeto} - Comando para eliminar tablas (DROP TABLE).
 * @property {Object} dropType {@link dropType | objeto} - Comando para eliminar tipos de datos (DROP TYPE).
 * @property {Object} dropDomain {@link dropDomain | objeto} - Comando para eliminar dominios (DROP DOMAIN).
 * @property {Object} column {@link column | objeto} - Comando para definir columnas (COLUMN).
 * @property {Object} constraint {@link constraint | objeto} - Comando para definir restricciones (CONSTRAINT).
 * @property {Object} select {@link select | objeto} - Comando para consultas de selección (SELECT).
 * @property {Object} setTransaction {@link setTransaction | objeto} - Comando para configurar transacciones (SET TRANSACTION).
 * @since 2.0.0
 */
const sql2006 = {
	createSchema,
	createRoles,
	dropRoles,
	grant,
	revoke,
	grantRoles,
	revokeRoles,
	dropSchema,
	createTable,
	dropTable,
	createType,
	dropType,
	createDomain,
	dropDomain,
	createView,
	dropView,
	createCursor,
	column,
	dropColumn,
	constraint,
	select,
	setTransaction,
};

export default sql2006;
