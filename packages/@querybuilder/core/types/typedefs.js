/**
 * @namespace typedefs
 */

/**
 * @global
 * @typedef {Object} types.Status
 * @property {String} query - La consulta SQL ejecutada.
 * @property {Number} rowCount - El número de filas devueltas por la consulta.
 * @property {Number} fieldCount - El número de columnas devueltas por la consulta.
 * @property {String} info - Información adicional sobre el resultado de la consulta.
 * @property {Number} errors - El número de errores ocurridos durante la consulta.
 * @property {Number} warnings - El número de advertencias generadas durante la consulta.
 * @property {Error} [error] - El objeto Error si ocurrió un error durante la consulta.
*/
/**
 * @global
 * @typedef {Object} types.ResultData
 * @property {Status} status - El estado del resultado de la consulta.
 * @property {Array<Object>} rows - Las filas devueltas por la consulta.
 * @property {Array<String>} columns - Los nombres de las columnas devueltas por la consulta.
 */

/**
 * @global
 * @typedef {Object} types.queryBuilderOptions
 * @prop {String} [typeIdentificator] - Tipo de identificador (MySQL, PostgreSQL, etc.)
 * @prop {String} [mode] - Modo de operación TEST | PRODUCTION
 */
