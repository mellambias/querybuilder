/**
 * @fileoverview Comandos MySQL específicos para QueryBuilder
 * @description Módulo que centraliza todos los comandos específicos de MySQL.
 * Extiende y modifica comandos SQL2006 para adaptarse a las características particulares de MySQL.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * import Mysql from './Mysql.js';
 * 
 * // Usar comandos específicos de MySQL
 * const createTableCmd = Mysql.createTable;
 * const grantCmd = Mysql.grant;
 * const transactionCmd = Mysql.startTransaction;
 */
import { createView, createTable } from "./Mysql/create.js";
import { dropTable } from "./Mysql/drop.js";
import { createRoles, dropRoles } from "./Mysql/roles.js";
import { grant, grantRoles } from "./Mysql/grant.js";
import { revoke, revokeRoles } from "./Mysql/revoke.js";
import { setTransaction, startTransaction } from "./Mysql/transaction.js";

/**
 * Colección de comandos específicos de MySQL
 * @namespace Mysql
 * @description Objeto que contiene comandos adaptados a las características específicas de MySQL.
 * Incluye variaciones de comandos SQL estándar y comandos únicos de MySQL.
 */
const Mysql = {
	/** @description Comando CREATE TABLE específico de MySQL */
	createTable,
	/** @description Comando DROP TABLE específico de MySQL */
	dropTable,
	/** @description Comando CREATE VIEW específico de MySQL */
	createView,
	/** @description Comando CREATE ROLE específico de MySQL */
	createRoles,
	/** @description Comando DROP ROLE específico de MySQL */
	dropRoles,
	/** @description Comando GRANT específico de MySQL */
	grant,
	/** @description Comando GRANT ROLE específico de MySQL */
	grantRoles,
	/** @description Comando REVOKE específico de MySQL */
	revoke,
	/** @description Comando REVOKE ROLE específico de MySQL */
	revokeRoles,
	/** @description Comando SET TRANSACTION específico de MySQL */
	setTransaction,
	/** @description Comando START TRANSACTION específico de MySQL */
	startTransaction,
};

/**
 * @description Exportación por defecto de comandos MySQL
 * @exports Mysql
 */
export default Mysql;
