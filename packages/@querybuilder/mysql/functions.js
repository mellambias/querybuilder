/**
 * Funciones específicas de MySQL
 * Consolidado de JSON, Strings, Math, Date, Aggregation, etc.
 */

/**
 * Funciones JSON de MySQL
 */
export const JsonFunctions = {
  // Construction functions
  JSON_ARRAY: 'JSON_ARRAY',
  JSON_OBJECT: 'JSON_OBJECT',
  JSON_QUOTE: 'JSON_QUOTE',
  
  // Extraction functions
  JSON_EXTRACT: 'JSON_EXTRACT',
  JSON_UNQUOTE: 'JSON_UNQUOTE',
  JSON_KEYS: 'JSON_KEYS',
  
  // Manipulation functions
  JSON_SET: 'JSON_SET',
  JSON_INSERT: 'JSON_INSERT',
  JSON_REPLACE: 'JSON_REPLACE',
  JSON_REMOVE: 'JSON_REMOVE',
  JSON_MERGE: 'JSON_MERGE',
  JSON_MERGE_PATCH: 'JSON_MERGE_PATCH',
  JSON_MERGE_PRESERVE: 'JSON_MERGE_PRESERVE',
  
  // Info functions
  JSON_LENGTH: 'JSON_LENGTH',
  JSON_TYPE: 'JSON_TYPE',
  JSON_VALID: 'JSON_VALID',
  JSON_CONTAINS: 'JSON_CONTAINS',
  JSON_CONTAINS_PATH: 'JSON_CONTAINS_PATH',
  JSON_SEARCH: 'JSON_SEARCH',
  
  // Array functions
  JSON_ARRAY_APPEND: 'JSON_ARRAY_APPEND',
  JSON_ARRAY_INSERT: 'JSON_ARRAY_INSERT'
};

/**
 * Funciones de String de MySQL
 */
export const StringFunctions = {
  // Case functions
  UPPER: 'UPPER',
  LOWER: 'LOWER',
  UCASE: 'UCASE',
  LCASE: 'LCASE',
  
  // Trim functions
  TRIM: 'TRIM',
  LTRIM: 'LTRIM',
  RTRIM: 'RTRIM',
  
  // Substring functions
  SUBSTRING: 'SUBSTRING',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  MID: 'MID',
  
  // Length functions
  LENGTH: 'LENGTH',
  CHAR_LENGTH: 'CHAR_LENGTH',
  CHARACTER_LENGTH: 'CHARACTER_LENGTH',
  
  // Position functions
  LOCATE: 'LOCATE',
  POSITION: 'POSITION',
  INSTR: 'INSTR',
  
  // Replace functions
  REPLACE: 'REPLACE',
  INSERT: 'INSERT',
  
  // Concatenation
  CONCAT: 'CONCAT',
  CONCAT_WS: 'CONCAT_WS',
  
  // Format functions
  FORMAT: 'FORMAT',
  LPAD: 'LPAD',
  RPAD: 'RPAD',
  REPEAT: 'REPEAT',
  REVERSE: 'REVERSE',
  SPACE: 'SPACE',
  
  // Pattern matching
  REGEXP: 'REGEXP',
  RLIKE: 'RLIKE',
  LIKE: 'LIKE',
  MATCH: 'MATCH'
};

/**
 * Funciones matemáticas de MySQL
 */
export const MathFunctions = {
  // Basic math
  ABS: 'ABS',
  CEIL: 'CEIL',
  CEILING: 'CEILING',
  FLOOR: 'FLOOR',
  ROUND: 'ROUND',
  TRUNCATE: 'TRUNCATE',
  
  // Power and root
  POWER: 'POWER',
  POW: 'POW',
  SQRT: 'SQRT',
  
  // Trigonometric
  SIN: 'SIN',
  COS: 'COS',
  TAN: 'TAN',
  ASIN: 'ASIN',
  ACOS: 'ACOS',
  ATAN: 'ATAN',
  ATAN2: 'ATAN2',
  
  // Logarithmic
  LOG: 'LOG',
  LOG10: 'LOG10',
  LOG2: 'LOG2',
  LN: 'LN',
  EXP: 'EXP',
  
  // Constants
  PI: 'PI',
  
  // Random
  RAND: 'RAND',
  RANDOM: 'RANDOM',
  
  // Sign and modulo
  SIGN: 'SIGN',
  MOD: 'MOD'
};

/**
 * Funciones de fecha y hora de MySQL
 */
export const DateTimeFunctions = {
  // Current date/time
  NOW: 'NOW',
  CURDATE: 'CURDATE',
  CURRENT_DATE: 'CURRENT_DATE',
  CURTIME: 'CURTIME',
  CURRENT_TIME: 'CURRENT_TIME',
  CURRENT_TIMESTAMP: 'CURRENT_TIMESTAMP',
  SYSDATE: 'SYSDATE',
  UTC_DATE: 'UTC_DATE',
  UTC_TIME: 'UTC_TIME',
  UTC_TIMESTAMP: 'UTC_TIMESTAMP',
  
  // Date arithmetic
  DATE_ADD: 'DATE_ADD',
  DATE_SUB: 'DATE_SUB',
  ADDDATE: 'ADDDATE',
  SUBDATE: 'SUBDATE',
  DATEDIFF: 'DATEDIFF',
  TIMEDIFF: 'TIMEDIFF',
  
  // Date extraction
  YEAR: 'YEAR',
  MONTH: 'MONTH',
  DAY: 'DAY',
  HOUR: 'HOUR',
  MINUTE: 'MINUTE',
  SECOND: 'SECOND',
  MICROSECOND: 'MICROSECOND',
  DAYOFWEEK: 'DAYOFWEEK',
  DAYOFMONTH: 'DAYOFMONTH',
  DAYOFYEAR: 'DAYOFYEAR',
  WEEKDAY: 'WEEKDAY',
  WEEK: 'WEEK',
  QUARTER: 'QUARTER',
  
  // Date formatting
  DATE_FORMAT: 'DATE_FORMAT',
  TIME_FORMAT: 'TIME_FORMAT',
  STR_TO_DATE: 'STR_TO_DATE',
  
  // Conversion
  UNIX_TIMESTAMP: 'UNIX_TIMESTAMP',
  FROM_UNIXTIME: 'FROM_UNIXTIME',
  CONVERT_TZ: 'CONVERT_TZ'
};

/**
 * Funciones de agregación de MySQL
 */
export const AggregateFunctions = {
  COUNT: 'COUNT',
  SUM: 'SUM',
  AVG: 'AVG',
  MIN: 'MIN',
  MAX: 'MAX',
  
  // Statistical functions
  STD: 'STD',
  STDDEV: 'STDDEV',
  STDDEV_POP: 'STDDEV_POP',
  STDDEV_SAMP: 'STDDEV_SAMP',
  VARIANCE: 'VARIANCE',
  VAR_POP: 'VAR_POP',
  VAR_SAMP: 'VAR_SAMP',
  
  // String aggregation
  GROUP_CONCAT: 'GROUP_CONCAT',
  
  // Bitwise aggregation
  BIT_AND: 'BIT_AND',
  BIT_OR: 'BIT_OR',
  BIT_XOR: 'BIT_XOR'
};

/**
 * Funciones de ventana (Window Functions) de MySQL
 */
export const WindowFunctions = {
  // Ranking functions
  ROW_NUMBER: 'ROW_NUMBER',
  RANK: 'RANK',
  DENSE_RANK: 'DENSE_RANK',
  PERCENT_RANK: 'PERCENT_RANK',
  CUME_DIST: 'CUME_DIST',
  
  // Value functions
  FIRST_VALUE: 'FIRST_VALUE',
  LAST_VALUE: 'LAST_VALUE',
  LAG: 'LAG',
  LEAD: 'LEAD',
  NTH_VALUE: 'NTH_VALUE',
  NTILE: 'NTILE'
};

/**
 * Funciones de control de flujo de MySQL
 */
export const FlowControlFunctions = {
  IF: 'IF',
  IFNULL: 'IFNULL',
  NULLIF: 'NULLIF',
  COALESCE: 'COALESCE',
  CASE: 'CASE',
  ISNULL: 'ISNULL'
};

/**
 * Funciones de información de MySQL
 */
export const InfoFunctions = {
  DATABASE: 'DATABASE',
  SCHEMA: 'SCHEMA',
  USER: 'USER',
  CURRENT_USER: 'CURRENT_USER',
  SESSION_USER: 'SESSION_USER',
  SYSTEM_USER: 'SYSTEM_USER',
  VERSION: 'VERSION',
  CONNECTION_ID: 'CONNECTION_ID',
  CHARSET: 'CHARSET',
  COLLATION: 'COLLATION',
  ROW_COUNT: 'ROW_COUNT',
  FOUND_ROWS: 'FOUND_ROWS',
  LAST_INSERT_ID: 'LAST_INSERT_ID'
};

/**
 * Todas las funciones de MySQL organizadas por categoría
 */
export const MySQLFunctions = {
  ...JsonFunctions,
  ...StringFunctions,
  ...MathFunctions,
  ...DateTimeFunctions,
  ...AggregateFunctions,
  ...WindowFunctions,
  ...FlowControlFunctions,
  ...InfoFunctions
};

/**
 * Verificar si una función es válida en MySQL
 * @param {string} func - Función a verificar
 * @returns {boolean}
 */
export function isValidMySQLFunction(func) {
  const upperFunc = func.toUpperCase();
  return Object.values(MySQLFunctions).includes(upperFunc);
}

/**
 * Obtener categoría de una función MySQL
 * @param {string} func - Función MySQL
 * @returns {string}
 */
export function getMySQLFunctionCategory(func) {
  const upperFunc = func.toUpperCase();
  
  if (Object.values(JsonFunctions).includes(upperFunc)) return 'json';
  if (Object.values(StringFunctions).includes(upperFunc)) return 'string';
  if (Object.values(MathFunctions).includes(upperFunc)) return 'math';
  if (Object.values(DateTimeFunctions).includes(upperFunc)) return 'datetime';
  if (Object.values(AggregateFunctions).includes(upperFunc)) return 'aggregate';
  if (Object.values(WindowFunctions).includes(upperFunc)) return 'window';
  if (Object.values(FlowControlFunctions).includes(upperFunc)) return 'control';
  if (Object.values(InfoFunctions).includes(upperFunc)) return 'info';
  
  return 'unknown';
}

export default {
  JsonFunctions,
  StringFunctions,
  MathFunctions,
  DateTimeFunctions,
  AggregateFunctions,
  WindowFunctions,
  FlowControlFunctions,
  InfoFunctions,
  MySQLFunctions,
  isValidMySQLFunction,
  getMySQLFunctionCategory
};