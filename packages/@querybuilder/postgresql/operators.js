/**
 * @fileoverview PostgreSQL Operators - Operadores SQL de PostgreSQL
 * @module @querybuilder/postgresql/operators
 * @description Colección completa de operadores específicos de PostgreSQL 12+,
 * incluyendo operadores para JSON/JSONB, Arrays, texto con regex, rangos, búsqueda
 * de texto completo, tipos de red, y operadores geométricos.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Usar operadores JSONB
 * import { JsonOperators } from '@querybuilder/postgresql/operators';
 * 
 * qb.select('*')
 *   .from('users')
 *   .whereRaw(`data ${JsonOperators.CONTAINS} '{"active": true}'::jsonb`);
 * 
 * @example
 * // Operadores de arrays
 * import { ArrayOperators } from '@querybuilder/postgresql/operators';
 * 
 * qb.select('*')
 *   .from('posts')
 *   .whereRaw(`tags ${ArrayOperators.OVERLAP} ARRAY['javascript', 'nodejs']`);
 * 
 * @example
 * // Búsqueda de texto completo
 * import { TextSearchOperators } from '@querybuilder/postgresql/operators';
 * 
 * qb.select('*')
 *   .from('articles')
 *   .whereRaw(`to_tsvector('english', content) ${TextSearchOperators.MATCH} to_tsquery('postgresql')`);
 */

/**
 * Operadores JSON/JSONB de PostgreSQL
 * @namespace JsonOperators
 * @memberof module:@querybuilder/postgresql/operators
 * @description Operadores para trabajar con tipos JSON y JSONB.
 * JSONB soporta indexación y es más eficiente.
 * 
 * @property {string} CONTAINS - Contiene JSON (@>)
 * @property {string} CONTAINED_BY - Contenido por JSON (<@)
 * @property {string} EXISTS_KEY - Existe clave (?)
 * @property {string} EXTRACT_PATH - Extraer ruta como JSON (#>)
 * @property {string} EXTRACT_PATH_TEXT - Extraer ruta como texto (#>>)
 * 
 * @example
 * // Buscar documentos que contienen un valor
 * qb.select('*')
 *   .from('logs')
 *   .whereRaw("data @> '{\"level\": \"error\"}'::jsonb");
 * 
 * @example
 * // Verificar existencia de clave
 * qb.select('*')
 *   .from('users')
 *   .whereRaw("preferences ? 'theme'");
 * 
 * @example
 * // Extraer valor de ruta
 * qb.select("data #>> '{user,name}' as username")
 *   .from('events');
 */
export const JsonOperators = {
  CONTAINS: '@>',              // JSON contains
  CONTAINED_BY: '<@',          // JSON contained by
  EXISTS_KEY: '?',             // JSON key exists
  EXISTS_ANY_KEY: '?|',        // Any of array keys exists
  EXISTS_ALL_KEYS: '?&',       // All array keys exist
  EXTRACT_PATH: '#>',          // Extract JSON path as JSON
  EXTRACT_PATH_TEXT: '#>>',    // Extract JSON path as text
  CONCAT: '||',                // JSON concatenation
  REMOVE: '-',                 // Remove key/index
  REMOVE_PATH: '#-'            // Remove path
};

/**
 * Operadores de Arrays
 */
export const ArrayOperators = {
  CONTAINS: '@>',              // Array contains
  CONTAINED_BY: '<@',          // Array contained by
  OVERLAP: '&&',               // Arrays overlap
  CONCAT: '||',                // Array concatenation
  APPEND: '||',                // Append element
  PREPEND: '||',               // Prepend element
  REMOVE: '-'                  // Remove element
};

/**
 * Operadores de texto y regex
 */
export const TextOperators = {
  REGEX_MATCH: '~',            // Regex match
  REGEX_MATCH_CI: '~*',        // Regex match case insensitive
  REGEX_NO_MATCH: '!~',        // Regex no match
  REGEX_NO_MATCH_CI: '!~*',    // Regex no match case insensitive
  SIMILAR_TO: 'SIMILAR TO',    // SQL regex
  NOT_SIMILAR_TO: 'NOT SIMILAR TO',
  CONCAT: '||'                 // String concatenation
};

/**
 * Operadores de búsqueda de texto completo
 */
export const TextSearchOperators = {
  MATCH: '@@',                 // Text search match
  CONTAINS: '@>',              // Lexeme contains
  CONTAINED_BY: '<@'           // Lexeme contained by
};

/**
 * Operadores de rangos
 */
export const RangeOperators = {
  CONTAINS: '@>',              // Range contains element/range
  CONTAINED_BY: '<@',          // Range contained by
  OVERLAP: '&&',               // Ranges overlap
  STRICTLY_LEFT: '<<',         // Strictly left of
  STRICTLY_RIGHT: '>>',        // Strictly right of
  NOT_EXTEND_RIGHT: '&<',      // Does not extend to right
  NOT_EXTEND_LEFT: '&>',       // Does not extend to left
  ADJACENT: '-|-',             // Adjacent ranges
  UNION: '+',                  // Range union
  INTERSECTION: '*',           // Range intersection
  DIFFERENCE: '-'              // Range difference
};

/**
 * Operadores de geometría
 */
export const GeometricOperators = {
  LEFT_OF: '<<',               // Left of
  RIGHT_OF: '>>',              // Right of
  OVERLAPS_OR_LEFT: '&<',      // Overlaps or left of
  OVERLAPS_OR_RIGHT: '&>',     // Overlaps or right of
  BELOW: '<<|',                // Below
  ABOVE: '|>>',                // Above
  OVERLAPS_OR_BELOW: '&<|',    // Overlaps or below
  OVERLAPS_OR_ABOVE: '|&>',    // Overlaps or above
  CONTAINS: '@>',              // Contains
  CONTAINED_BY: '<@',          // Contained by
  OVERLAPS: '&&',              // Overlaps
  SAME_AS: '~=',               // Same as
  INTERSECTS: '?#',            // Intersects
  CLOSEST_POINT: '##',         // Closest point
  DISTANCE: '<->'              // Distance
};

/**
 * Operadores de red
 */
export const NetworkOperators = {
  CONTAINS: '@>',              // Contains subnet/address
  CONTAINED_BY: '<@',          // Contained by subnet
  CONTAINS_OR_EQUALS: '>>=',   // Contains or equals
  CONTAINED_OR_EQUALS: '<<=',  // Contained or equals
  OVERLAPS: '&&',              // Overlaps
  BITWISE_NOT: '~',            // Bitwise NOT
  BITWISE_AND: '&',            // Bitwise AND
  BITWISE_OR: '|',             // Bitwise OR
  ADDITION: '+',               // Add to address
  SUBTRACTION: '-'             // Subtract from address
};

/**
 * Todos los operadores PostgreSQL consolidados
 */
export const PostgreSQLOperators = {
  // JSON
  JSON_CONTAINS: JsonOperators.CONTAINS,
  JSON_CONTAINED_BY: JsonOperators.CONTAINED_BY,
  JSON_EXISTS_KEY: JsonOperators.EXISTS_KEY,
  JSON_EXISTS_ANY_KEY: JsonOperators.EXISTS_ANY_KEY,
  JSON_EXISTS_ALL_KEYS: JsonOperators.EXISTS_ALL_KEYS,
  JSON_EXTRACT_PATH: JsonOperators.EXTRACT_PATH,
  JSON_EXTRACT_PATH_TEXT: JsonOperators.EXTRACT_PATH_TEXT,
  JSON_CONCAT: JsonOperators.CONCAT,
  JSON_REMOVE: JsonOperators.REMOVE,
  JSON_REMOVE_PATH: JsonOperators.REMOVE_PATH,

  // Arrays
  ARRAY_CONTAINS: ArrayOperators.CONTAINS,
  ARRAY_CONTAINED_BY: ArrayOperators.CONTAINED_BY,
  ARRAY_OVERLAP: ArrayOperators.OVERLAP,
  ARRAY_CONCAT: ArrayOperators.CONCAT,
  ARRAY_REMOVE: ArrayOperators.REMOVE,

  // Text
  REGEX_MATCH: TextOperators.REGEX_MATCH,
  REGEX_MATCH_CI: TextOperators.REGEX_MATCH_CI,
  REGEX_NO_MATCH: TextOperators.REGEX_NO_MATCH,
  REGEX_NO_MATCH_CI: TextOperators.REGEX_NO_MATCH_CI,
  TEXT_CONCAT: TextOperators.CONCAT,

  // Text Search
  FULLTEXT_MATCH: TextSearchOperators.MATCH,

  // Ranges
  RANGE_CONTAINS: RangeOperators.CONTAINS,
  RANGE_CONTAINED_BY: RangeOperators.CONTAINED_BY,
  RANGE_OVERLAP: RangeOperators.OVERLAP,
  RANGE_STRICTLY_LEFT: RangeOperators.STRICTLY_LEFT,
  RANGE_STRICTLY_RIGHT: RangeOperators.STRICTLY_RIGHT,
  RANGE_ADJACENT: RangeOperators.ADJACENT,

  // Network
  INET_CONTAINS: NetworkOperators.CONTAINS,
  INET_CONTAINED_BY: NetworkOperators.CONTAINED_BY,
  INET_OVERLAPS: NetworkOperators.OVERLAPS
};

/**
 * Helpers para usar operadores
 */
export const OperatorHelpers = {
  /**
   * Construye expresión JSON contains
   * @param {string} column - Columna
   * @param {object} value - Valor JSON
   * @returns {string}
   */
  jsonContains(column, value) {
    return `${column} @> '${JSON.stringify(value)}'`;
  },

  /**
   * Construye expresión array contains
   * @param {string} column - Columna
   * @param {array} values - Valores array
   * @returns {string}
   */
  arrayContains(column, values) {
    const arrayStr = Array.isArray(values) ? values : [values];
    return `${column} @> ARRAY[${arrayStr.map(v => `'${v}'`).join(', ')}]`;
  },

  /**
   * Construye expresión regex match
   * @param {string} column - Columna
   * @param {string} pattern - Patrón regex
   * @param {boolean} caseInsensitive - Case insensitive
   * @returns {string}
   */
  regexMatch(column, pattern, caseInsensitive = false) {
    const operator = caseInsensitive ? '~*' : '~';
    return `${column} ${operator} '${pattern}'`;
  },

  /**
   * Construye expresión full-text search
   * @param {string} column - Columna
   * @param {string} query - Query de búsqueda
   * @param {string} language - Idioma
   * @returns {string}
   */
  fullTextSearch(column, query, language = 'english') {
    return `to_tsvector('${language}', ${column}) @@ plainto_tsquery('${language}', '${query}')`;
  }
};

// Exportación por defecto
export default PostgreSQLOperators;