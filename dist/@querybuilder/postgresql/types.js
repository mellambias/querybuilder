/**
 * Tipos de datos específicos de PostgreSQL
 * Consolidado de todas las características de tipos
 */

/**
 * Tipos JSON de PostgreSQL
 */
export const JsonTypes = {
  JSON: 'JSON',
  JSONB: 'JSONB'
};

/**
 * Tipos seriales de PostgreSQL
 */
export const SerialTypes = {
  SMALLSERIAL: 'SMALLSERIAL',
  SERIAL: 'SERIAL',
  BIGSERIAL: 'BIGSERIAL'
};

/**
 * Tipos de red de PostgreSQL
 */
export const NetworkTypes = {
  INET: 'INET',
  CIDR: 'CIDR',
  MACADDR: 'MACADDR',
  MACADDR8: 'MACADDR8'
};

/**
 * Tipos geométricos de PostgreSQL
 */
export const GeometricTypes = {
  POINT: 'POINT',
  LINE: 'LINE',
  LSEG: 'LSEG',
  BOX: 'BOX',
  PATH: 'PATH',
  POLYGON: 'POLYGON',
  CIRCLE: 'CIRCLE'
};

/**
 * Tipos de búsqueda de texto completo
 */
export const TextSearchTypes = {
  TSVECTOR: 'TSVECTOR',
  TSQUERY: 'TSQUERY'
};

/**
 * Tipos de rango de PostgreSQL
 */
export const RangeTypes = {
  INT4RANGE: 'INT4RANGE',
  INT8RANGE: 'INT8RANGE',
  NUMRANGE: 'NUMRANGE',
  TSRANGE: 'TSRANGE',
  TSTZRANGE: 'TSTZRANGE',
  DATERANGE: 'DATERANGE'
};

/**
 * Tipos de arrays de PostgreSQL
 */
export const ArrayTypes = {
  TEXT_ARRAY: 'TEXT[]',
  INTEGER_ARRAY: 'INTEGER[]',
  BIGINT_ARRAY: 'BIGINT[]',
  NUMERIC_ARRAY: 'NUMERIC[]',
  BOOLEAN_ARRAY: 'BOOLEAN[]',
  DATE_ARRAY: 'DATE[]',
  TIMESTAMP_ARRAY: 'TIMESTAMP[]',
  UUID_ARRAY: 'UUID[]',
  JSON_ARRAY: 'JSON[]',
  JSONB_ARRAY: 'JSONB[]'
};

/**
 * Otros tipos específicos de PostgreSQL
 */
export const OtherTypes = {
  UUID: 'UUID',
  BYTEA: 'BYTEA',
  BIT: 'BIT',
  VARBIT: 'VARBIT',
  MONEY: 'MONEY',
  XML: 'XML'
};

/**
 * Todos los tipos PostgreSQL consolidados
 */
export const PostgreSQLTypes = {
  ...JsonTypes,
  ...SerialTypes,
  ...NetworkTypes,
  ...GeometricTypes,
  ...TextSearchTypes,
  ...RangeTypes,
  ...ArrayTypes,
  ...OtherTypes
};

/**
 * Helpers para crear tipos con arrays
 */
export const TypeHelpers = {
  /**
   * Convierte un tipo a su versión array
   * @param {string} type - Tipo base
   * @returns {string}
   */
  asArray(type) {
    return `${type}[]`;
  },

  /**
   * Crea definición de columna JSON con valor por defecto
   * @param {object} defaultValue - Valor por defecto JSON
   * @returns {string}
   */
  jsonWithDefault(defaultValue = {}) {
    return `JSONB DEFAULT '${JSON.stringify(defaultValue)}'`;
  },

  /**
   * Crea definición de columna serial con nombre específico
   * @param {string} sequenceName - Nombre de la secuencia
   * @returns {string}
   */
  serialWithSequence(sequenceName) {
    return `SERIAL DEFAULT nextval('${sequenceName}')`;
  },

  /**
   * Crea definición de columna UUID con generación automática
   * @returns {string}
   */
  uuidGenerated() {
    return 'UUID DEFAULT gen_random_uuid()';
  },

  /**
   * Crea definición de columna INET con valor por defecto
   * @param {string} defaultNetwork - Red por defecto
   * @returns {string}
   */
  inetWithDefault(defaultNetwork = '0.0.0.0/0') {
    return `INET DEFAULT '${defaultNetwork}'`;
  }
};

// Exportación por defecto
export default PostgreSQLTypes;