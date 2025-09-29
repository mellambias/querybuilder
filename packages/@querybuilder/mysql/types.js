/**
 * Tipos de datos específicos de MySQL
 * Consolidado de todas las características de tipos MySQL
 */

/**
 * Tipos JSON de MySQL
 */
export const JsonTypes = {
  JSON: 'JSON'
};

/**
 * Tipos enteros específicos de MySQL
 */
export const IntegerTypes = {
  TINYINT: 'TINYINT',
  SMALLINT: 'SMALLINT',
  MEDIUMINT: 'MEDIUMINT',
  INT: 'INT',
  INTEGER: 'INTEGER',
  BIGINT: 'BIGINT'
};

/**
 * Tipos auto-incrementales de MySQL
 */
export const AutoIncrementTypes = {
  AUTO_INCREMENT: 'AUTO_INCREMENT'
};

/**
 * Tipos de texto específicos de MySQL
 */
export const TextTypes = {
  CHAR: 'CHAR',
  VARCHAR: 'VARCHAR',
  TINYTEXT: 'TINYTEXT',
  TEXT: 'TEXT',
  MEDIUMTEXT: 'MEDIUMTEXT',
  LONGTEXT: 'LONGTEXT'
};

/**
 * Tipos numéricos de MySQL
 */
export const NumericTypes = {
  DECIMAL: 'DECIMAL',
  NUMERIC: 'NUMERIC',
  FLOAT: 'FLOAT',
  DOUBLE: 'DOUBLE',
  REAL: 'REAL',
  BIT: 'BIT'
};

/**
 * Tipos binarios de MySQL
 */
export const BinaryTypes = {
  BINARY: 'BINARY',
  VARBINARY: 'VARBINARY',
  TINYBLOB: 'TINYBLOB',
  BLOB: 'BLOB',
  MEDIUMBLOB: 'MEDIUMBLOB',
  LONGBLOB: 'LONGBLOB'
};

/**
 * Tipos de fecha y hora de MySQL
 */
export const DateTimeTypes = {
  DATE: 'DATE',
  TIME: 'TIME',
  DATETIME: 'DATETIME',
  TIMESTAMP: 'TIMESTAMP',
  YEAR: 'YEAR'
};

/**
 * Tipos especiales de MySQL
 */
export const SpecialTypes = {
  ENUM: 'ENUM',
  SET: 'SET',
  BOOLEAN: 'BOOLEAN',
  BOOL: 'BOOL'
};

/**
 * Tipos geométricos de MySQL (spatial)
 */
export const GeometryTypes = {
  GEOMETRY: 'GEOMETRY',
  POINT: 'POINT',
  LINESTRING: 'LINESTRING',
  POLYGON: 'POLYGON',
  MULTIPOINT: 'MULTIPOINT',
  MULTILINESTRING: 'MULTILINESTRING',
  MULTIPOLYGON: 'MULTIPOLYGON',
  GEOMETRYCOLLECTION: 'GEOMETRYCOLLECTION'
};

/**
 * Todos los tipos de MySQL organizados por categoría
 */
export const MySQLTypes = {
  ...JsonTypes,
  ...IntegerTypes,
  ...AutoIncrementTypes,
  ...TextTypes,
  ...NumericTypes,
  ...BinaryTypes,
  ...DateTimeTypes,
  ...SpecialTypes,
  ...GeometryTypes
};

/**
 * Verificar si un tipo es válido en MySQL
 * @param {string} type - Tipo a verificar
 * @returns {boolean}
 */
export function isValidMySQLType(type) {
  const upperType = type.toUpperCase();
  return Object.values(MySQLTypes).includes(upperType) ||
         upperType.startsWith('VARCHAR(') ||
         upperType.startsWith('CHAR(') ||
         upperType.startsWith('DECIMAL(') ||
         upperType.startsWith('FLOAT(') ||
         upperType.startsWith('DOUBLE(') ||
         upperType.startsWith('ENUM(') ||
         upperType.startsWith('SET(');
}

/**
 * Obtener información sobre un tipo MySQL
 * @param {string} type - Tipo MySQL
 * @returns {object}
 */
export function getMySQLTypeInfo(type) {
  const upperType = type.toUpperCase();
  
  if (Object.values(JsonTypes).includes(upperType)) {
    return { category: 'json', isNative: true, supportsArrays: false };
  }
  
  if (Object.values(IntegerTypes).includes(upperType)) {
    return { category: 'integer', isNative: true, supportsArrays: false };
  }
  
  if (Object.values(TextTypes).includes(upperType)) {
    return { category: 'text', isNative: true, supportsArrays: false };
  }
  
  if (Object.values(NumericTypes).includes(upperType)) {
    return { category: 'numeric', isNative: true, supportsArrays: false };
  }
  
  if (Object.values(DateTimeTypes).includes(upperType)) {
    return { category: 'datetime', isNative: true, supportsArrays: false };
  }
  
  if (Object.values(SpecialTypes).includes(upperType)) {
    return { category: 'special', isNative: true, supportsArrays: false };
  }
  
  if (Object.values(GeometryTypes).includes(upperType)) {
    return { category: 'geometry', isNative: true, supportsArrays: false };
  }
  
  return { category: 'unknown', isNative: false, supportsArrays: false };
}

export default {
  JsonTypes,
  IntegerTypes,
  AutoIncrementTypes,
  TextTypes,
  NumericTypes,
  BinaryTypes,
  DateTimeTypes,
  SpecialTypes,
  GeometryTypes,
  MySQLTypes,
  isValidMySQLType,
  getMySQLTypeInfo
};