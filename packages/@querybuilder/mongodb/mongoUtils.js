/**
 * @fileoverview MongoDB Utilities - Funciones auxiliares para MongoDB
 * @module @querybuilder/mongodb/mongoUtils
 * @description Utilidades para serialización y deserialización de objetos MongoDB,
 * especialmente para manejar expresiones regulares en JSON.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Uso con JSON.stringify para serializar RegExp
 * const query = { name: /^John/i };
 * const json = JSON.stringify(query, jsonReplacer);
 * // json: '{"name":{"__regex":true,"pattern":"^John","flags":"i"}}'
 * 
 * @example
 * // Uso con JSON.parse para deserializar RegExp
 * const jsonStr = '{"name":{"__regex":true,"pattern":"^John","flags":"i"}}';
 * const query = JSON.parse(jsonStr, jsonReviver);
 * // query: { name: /^John/i }
 */

/**
 * Función replacer para JSON.stringify que convierte RegExp a objetos serializables
 * @function jsonReplacer
 * @memberof module:@querybuilder/mongodb/mongoUtils
 * @param {string} key - Clave del objeto siendo procesado
 * @param {*} value - Valor del objeto siendo procesado
 * @returns {*} Valor procesado - RegExp se convierte a objeto con metadatos
 * 
 * @description Convierte instancias de RegExp a un formato serializable JSON
 * que preserva el patrón y las banderas de la expresión regular.
 * 
 * @example
 * // Serializar consulta MongoDB con RegExp
 * const query = { 
 *   email: /^user@.*\.com$/i,
 *   status: 'active'
 * };
 * const json = JSON.stringify(query, jsonReplacer);
 * console.log(json);
 * // '{"email":{"__regex":true,"pattern":"^user@.*\\.com$","flags":"i"},"status":"active"}'
 * 
 * @example
 * // Uso en MongoDB Command
 * const command = { 
 *   find: 'users',
 *   filter: { name: /^A/i }
 * };
 * const serialized = JSON.stringify(command, jsonReplacer);
 */
function jsonReplacer(key, value) {
	if (value instanceof RegExp) {
		return { __regex: true, pattern: value.source, flags: value.flags };
	}
	return value;
}

/**
 * Función reviver para JSON.parse que reconstruye RegExp desde objetos serializados
 * @function jsonReviver
 * @memberof module:@querybuilder/mongodb/mongoUtils
 * @param {string} key - Clave del objeto siendo procesado
 * @param {*} value - Valor del objeto siendo procesado
 * @returns {*} Valor procesado - Objetos __regex se convierten a RegExp
 * 
 * @description Reconstruye instancias de RegExp desde su formato serializado JSON,
 * restaurando el patrón y las banderas originales.
 * 
 * @example
 * // Deserializar consulta MongoDB con RegExp
 * const json = '{"email":{"__regex":true,"pattern":"^user@.*\\.com$","flags":"i"}}';
 * const query = JSON.parse(json, jsonReviver);
 * console.log(query.email); // /^user@.*\.com$/i
 * console.log(query.email instanceof RegExp); // true
 * 
 * @example
 * // Restaurar comando MongoDB
 * const jsonCmd = '{"find":"users","filter":{"name":{"__regex":true,"pattern":"^A","flags":"i"}}}';
 * const command = JSON.parse(jsonCmd, jsonReviver);
 * console.log(command.filter.name); // /^A/i
 * 
 * @example
 * // Uso con datos de API
 * fetch('/api/query')
 *   .then(res => res.text())
 *   .then(text => JSON.parse(text, jsonReviver))
 *   .then(query => {
 *     // query ahora tiene RegExp reconstruidos
 *     console.log(query.pattern instanceof RegExp); // true
 *   });
 */
function jsonReviver(key, value) {
	if (value?.__regex) {
		return new RegExp(value.pattern, value.flags);
	}
	return value;
}

export { jsonReplacer, jsonReviver };
