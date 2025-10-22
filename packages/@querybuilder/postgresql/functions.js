/**
 * @fileoverview PostgreSQL Functions - Funciones SQL nativas de PostgreSQL
 * @module @querybuilder/postgresql/functions
 * @description Colección completa de funciones SQL nativas soportadas por PostgreSQL 12+,
 * organizadas por categorías: JSON/JSONB, Arrays, Window, Full-Text Search, Math, String,
 * Date/Time, Aggregation, y funciones específicas de PostgreSQL.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Usar funciones JSONB en consultas
 * import { JsonFunctions } from '@querybuilder/postgresql/functions';
 * 
 * qb.select([
 *   JsonFunctions.JSONB_BUILD_OBJECT + "('name', name, 'email', email) as user_data"
 * ]).from('users');
 * 
 * @example
 * // Funciones de arrays
 * import { ArrayFunctions } from '@querybuilder/postgresql/functions';
 * 
 * qb.select([
 *   ArrayFunctions.ARRAY_AGG + '(tag) as tags',
 *   ArrayFunctions.ARRAY_LENGTH + '(categories, 1) as category_count'
 * ]).from('posts').groupBy('id');
 * 
 * @example
 * // Window functions
 * import { WindowFunctions } from '@querybuilder/postgresql/functions';
 * 
 * qb.select([
 *   '*',
 *   WindowFunctions.ROW_NUMBER + ' OVER (PARTITION BY department ORDER BY salary DESC) as rank'
 * ]).from('employees');
 */

/**
 * Funciones JSON/JSONB de PostgreSQL
 * @namespace JsonFunctions
 * @memberof module:@querybuilder/postgresql/functions
 * @description Funciones para manipular datos JSON y JSONB en PostgreSQL 12+.
 * JSONB es binario y más eficiente que JSON para operaciones.
 * 
 * @property {string} JSON_BUILD_OBJECT - Construye objeto JSON desde pares clave-valor
 * @property {string} JSONB_BUILD_OBJECT - Construye objeto JSONB desde pares clave-valor
 * @property {string} JSON_AGG - Agrega valores en un array JSON
 * @property {string} JSONB_SET - Establece valor en ruta JSONB
 * @property {string} JSONB_EXTRACT_PATH - Extrae valor de ruta JSONB
 * 
 * @example
 * // Construir objeto JSONB
 * qb.select("jsonb_build_object('id', id, 'name', name) as data").from('users');
 * 
 * @example
 * // Agregar en JSON array
 * qb.select(['category', 'json_agg(name) as products'])
 *   .from('products')
 *   .groupBy('category');
 * 
 * @example
 * // Actualizar campo JSONB
 * qb.update('users')
 *   .set({ data: "jsonb_set(data, '{address,city}', '\"Madrid\"')" })
 *   .where('id', 1);
 */
export const JsonFunctions = {
  // Construction functions
  JSON_BUILD_OBJECT: 'json_build_object',
  JSON_BUILD_ARRAY: 'json_build_array',
  JSONB_BUILD_OBJECT: 'jsonb_build_object',
  JSONB_BUILD_ARRAY: 'jsonb_build_array',
  TO_JSON: 'to_json',
  TO_JSONB: 'to_jsonb',

  // Aggregation functions
  JSON_AGG: 'json_agg',
  JSONB_AGG: 'jsonb_agg',
  JSON_OBJECT_AGG: 'json_object_agg',
  JSONB_OBJECT_AGG: 'jsonb_object_agg',

  // Extraction functions
  JSON_EXTRACT_PATH: 'json_extract_path',
  JSON_EXTRACT_PATH_TEXT: 'json_extract_path_text',
  JSONB_EXTRACT_PATH: 'jsonb_extract_path',
  JSONB_EXTRACT_PATH_TEXT: 'jsonb_extract_path_text',

  // Manipulation functions
  JSON_STRIP_NULLS: 'json_strip_nulls',
  JSONB_STRIP_NULLS: 'jsonb_strip_nulls',
  JSON_POPULATE_RECORD: 'json_populate_record',
  JSONB_POPULATE_RECORD: 'jsonb_populate_record',
  JSONB_SET: 'jsonb_set',
  JSONB_INSERT: 'jsonb_insert',

  // Info functions
  JSON_ARRAY_LENGTH: 'json_array_length',
  JSONB_ARRAY_LENGTH: 'jsonb_array_length',
  JSON_OBJECT_KEYS: 'json_object_keys',
  JSONB_OBJECT_KEYS: 'jsonb_object_keys',
  JSON_TYPEOF: 'json_typeof',
  JSONB_TYPEOF: 'jsonb_typeof',
  JSONB_PRETTY: 'jsonb_pretty'
};

/**
 * Funciones de Arrays
 */
export const ArrayFunctions = {
  // Aggregation
  ARRAY_AGG: 'array_agg',
  STRING_AGG: 'string_agg',

  // Manipulation
  ARRAY_APPEND: 'array_append',
  ARRAY_PREPEND: 'array_prepend',
  ARRAY_CAT: 'array_cat',
  ARRAY_REMOVE: 'array_remove',
  ARRAY_REPLACE: 'array_replace',

  // Info functions
  ARRAY_LENGTH: 'array_length',
  ARRAY_NDIMS: 'array_ndims',
  ARRAY_DIMS: 'array_dims',
  ARRAY_LOWER: 'array_lower',
  ARRAY_UPPER: 'array_upper',
  CARDINALITY: 'cardinality',

  // Search functions
  ARRAY_POSITION: 'array_position',
  ARRAY_POSITIONS: 'array_positions',

  // Conversion
  UNNEST: 'unnest',
  ARRAY_TO_STRING: 'array_to_string',
  STRING_TO_ARRAY: 'string_to_array'
};

/**
 * Funciones Window
 */
export const WindowFunctions = {
  // Ranking functions
  ROW_NUMBER: 'ROW_NUMBER',
  RANK: 'RANK',
  DENSE_RANK: 'DENSE_RANK',
  PERCENT_RANK: 'PERCENT_RANK',
  CUME_DIST: 'CUME_DIST',
  NTILE: 'NTILE',

  // Value functions
  LAG: 'LAG',
  LEAD: 'LEAD',
  FIRST_VALUE: 'FIRST_VALUE',
  LAST_VALUE: 'LAST_VALUE',
  NTH_VALUE: 'NTH_VALUE'
};

/**
 * Funciones de búsqueda de texto completo
 */
export const TextSearchFunctions = {
  // Vector functions
  TO_TSVECTOR: 'to_tsvector',
  SETWEIGHT: 'setweight',
  STRIP: 'strip',

  // Query functions
  TO_TSQUERY: 'to_tsquery',
  PLAINTO_TSQUERY: 'plainto_tsquery',
  PHRASETO_TSQUERY: 'phraseto_tsquery',
  WEBSEARCH_TO_TSQUERY: 'websearch_to_tsquery',

  // Ranking functions
  TS_RANK: 'ts_rank',
  TS_RANK_CD: 'ts_rank_cd',

  // Highlighting functions
  TS_HEADLINE: 'ts_headline',

  // Debugging functions
  TS_DEBUG: 'ts_debug',
  TS_LEXIZE: 'ts_lexize',
  TS_PARSE: 'ts_parse',
  TS_TOKEN_TYPE: 'ts_token_type'
};

/**
 * Funciones matemáticas específicas de PostgreSQL
 */
export const MathFunctions = {
  // Trigonometric
  ACOS: 'acos',
  ASIN: 'asin',
  ATAN: 'atan',
  ATAN2: 'atan2',
  COS: 'cos',
  SIN: 'sin',
  TAN: 'tan',
  COT: 'cot',

  // Logarithmic
  LOG: 'log',
  LN: 'ln',
  LOG10: 'log',

  // Power and root
  POWER: 'power',
  SQRT: 'sqrt',
  CBRT: 'cbrt',

  // Rounding
  CEIL: 'ceil',
  CEILING: 'ceiling',
  FLOOR: 'floor',
  ROUND: 'round',
  TRUNC: 'trunc',

  // Random
  RANDOM: 'random',
  SETSEED: 'setseed',

  // Constants
  PI: 'pi',

  // Other
  ABS: 'abs',
  SIGN: 'sign',
  MOD: 'mod',
  GCD: 'gcd',
  LCM: 'lcm'
};

/**
 * Funciones de fecha y hora
 */
export const DateTimeFunctions = {
  // Current values
  NOW: 'now',
  CURRENT_DATE: 'current_date',
  CURRENT_TIME: 'current_time',
  CURRENT_TIMESTAMP: 'current_timestamp',
  LOCALTIME: 'localtime',
  LOCALTIMESTAMP: 'localtimestamp',

  // Extraction
  EXTRACT: 'extract',
  DATE_PART: 'date_part',
  DATE_TRUNC: 'date_trunc',

  // Arithmetic
  AGE: 'age',

  // Formatting
  TO_CHAR: 'to_char',
  TO_DATE: 'to_date',
  TO_TIMESTAMP: 'to_timestamp',

  // Time zones
  TIMEZONE: 'timezone',
  AT_TIME_ZONE: 'AT TIME ZONE'
};

/**
 * Funciones de string específicas de PostgreSQL
 */
export const StringFunctions = {
  // Case conversion
  UPPER: 'upper',
  LOWER: 'lower',
  INITCAP: 'initcap',

  // Padding
  LPAD: 'lpad',
  RPAD: 'rpad',

  // Trimming
  TRIM: 'trim',
  LTRIM: 'ltrim',
  RTRIM: 'rtrim',

  // Position and length
  LENGTH: 'length',
  CHAR_LENGTH: 'char_length',
  CHARACTER_LENGTH: 'character_length',
  OCTET_LENGTH: 'octet_length',
  POSITION: 'position',
  STRPOS: 'strpos',

  // Substring
  SUBSTRING: 'substring',
  SUBSTR: 'substr',
  LEFT: 'left',
  RIGHT: 'right',

  // Replacement
  REPLACE: 'replace',
  TRANSLATE: 'translate',
  REGEXP_REPLACE: 'regexp_replace',
  REGEXP_SPLIT_TO_ARRAY: 'regexp_split_to_array',
  REGEXP_SPLIT_TO_TABLE: 'regexp_split_to_table',

  // Conversion
  ASCII: 'ascii',
  CHR: 'chr',

  // Encoding
  ENCODE: 'encode',
  DECODE: 'decode',

  // Other
  REVERSE: 'reverse',
  REPEAT: 'repeat',
  SPLIT_PART: 'split_part'
};

/**
 * Funciones de agregación específicas de PostgreSQL
 */
export const AggregateFunctions = {
  // Statistical
  STDDEV: 'stddev',
  STDDEV_POP: 'stddev_pop',
  STDDEV_SAMP: 'stddev_samp',
  VARIANCE: 'variance',
  VAR_POP: 'var_pop',
  VAR_SAMP: 'var_samp',

  // Correlation
  CORR: 'corr',
  COVAR_POP: 'covar_pop',
  COVAR_SAMP: 'covar_samp',
  REGR_AVGX: 'regr_avgx',
  REGR_AVGY: 'regr_avgy',

  // Ordered set
  PERCENTILE_CONT: 'percentile_cont',
  PERCENTILE_DISC: 'percentile_disc',
  MODE: 'mode',

  // Hypothetical set
  RANK_HYPO: 'rank',
  DENSE_RANK_HYPO: 'dense_rank',
  PERCENT_RANK_HYPO: 'percent_rank',
  CUME_DIST_HYPO: 'cume_dist'
};

/**
 * Todas las funciones PostgreSQL consolidadas
 */
export const PostgreSQLFunctions = {
  ...JsonFunctions,
  ...ArrayFunctions,
  ...WindowFunctions,
  ...TextSearchFunctions,
  ...MathFunctions,
  ...DateTimeFunctions,
  ...StringFunctions,
  ...AggregateFunctions
};

/**
 * Helpers para construir funciones complejas
 */
export const FunctionHelpers = {
  /**
   * Construye json_build_object con pares clave-valor
   * @param {object} pairs - Pares clave-valor
   * @returns {string}
   */
  jsonBuildObject(pairs) {
    const args = Object.entries(pairs).flat().map(v => `'${v}'`).join(', ');
    return `json_build_object(${args})`;
  },

  /**
   * Construye array_agg con ordenamiento
   * @param {string} column - Columna a agregar
   * @param {string} orderBy - Ordenamiento
   * @returns {string}
   */
  arrayAggOrdered(column, orderBy) {
    return `array_agg(${column} ORDER BY ${orderBy})`;
  },

  /**
   * Construye window function con OVER
   * @param {string} func - Función window
   * @param {object} over - Cláusula OVER
   * @returns {string}
   */
  windowFunction(func, over = {}) {
    let clause = `${func} OVER (`;
    const parts = [];

    if (over.partitionBy) {
      parts.push(`PARTITION BY ${Array.isArray(over.partitionBy) ? over.partitionBy.join(', ') : over.partitionBy}`);
    }

    if (over.orderBy) {
      parts.push(`ORDER BY ${Array.isArray(over.orderBy) ? over.orderBy.join(', ') : over.orderBy}`);
    }

    if (over.frame) {
      parts.push(over.frame);
    }

    clause += parts.join(' ') + ')';
    return clause;
  },

  /**
   * Construye full-text search con ranking
   * @param {string} column - Columna de texto
   * @param {string} query - Query de búsqueda
   * @param {string} language - Idioma
   * @returns {object}
   */
  fullTextSearchWithRank(column, query, language = 'english') {
    const vector = `to_tsvector('${language}', ${column})`;
    const tsquery = `plainto_tsquery('${language}', '${query}')`;
    return {
      condition: `${vector} @@ ${tsquery}`,
      rank: `ts_rank(${vector}, ${tsquery})`,
      headline: `ts_headline('${language}', ${column}, ${tsquery})`
    };
  }
};

// Exportación por defecto
export default PostgreSQLFunctions;