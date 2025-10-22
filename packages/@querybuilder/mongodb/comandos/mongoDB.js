/**
 * @fileoverview MongoDB Commands - Exportación centralizada de comandos MongoDB
 * @module @querybuilder/mongodb/comandos/mongoDB
 * @description Módulo que centraliza y exporta todos los comandos específicos de MongoDB
 * para gestión de roles, permisos y privilegios.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Importar comandos MongoDB
 * import mongoDB from '@querybuilder/mongodb/comandos/mongoDB.js';
 * 
 * // Crear rol
 * const createRole = mongoDB.createRoles('admin', ['readWrite'], 'mydb');
 * 
 * // Otorgar privilegios
 * const grantPriv = mongoDB.grant('user', ['find', 'insert'], 'users');
 */

import { revoke, revokeRoles } from "./mongoDB/revoke.js";
import { createRoles, dropRoles, grant, grantRoles } from "./mongoDB/roles.js";

/**
 * Objeto que contiene todos los comandos MongoDB disponibles
 * @namespace mongoDB
 * @type {Object}
 * @property {Function} createRoles - Crea roles de usuario en MongoDB
 * @property {Function} dropRoles - Elimina roles de usuario en MongoDB
 * @property {Function} grant - Otorga privilegios específicos a un usuario
 * @property {Function} grantRoles - Otorga roles a un usuario
 * @property {Function} revoke - Revoca privilegios específicos de un usuario
 * @property {Function} revokeRoles - Revoca roles de un usuario
 * 
 * @example
 * // Usar comandos de roles
 * const role = mongoDB.createRoles('developer', ['read', 'write'], 'app_db');
 * const grant = mongoDB.grantRoles('john', ['developer'], 'app_db');
 * 
 * @example
 * // Usar comandos de privilegios
 * const privilege = mongoDB.grant('alice', ['find', 'update'], 'users');
 * const revoked = mongoDB.revoke('bob', ['delete'], 'users');
 */
const mongoDB = {
	createRoles,
	dropRoles,
	grant,
	grantRoles,
	revoke,
	revokeRoles,
};

export default mongoDB;
