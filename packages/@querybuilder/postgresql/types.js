/**
 * @fileoverview PostgreSQL Data Types - Tipos de datos SQL de PostgreSQL
 * @module @querybuilder/postgresql/types
 * @description Definiciones completas de todos los tipos de datos soportados por PostgreSQL 12+,
 * incluyendo tipos estándar SQL y tipos específicos de PostgreSQL como JSONB, ARRAY, SERIAL,
 * tipos de red (INET, CIDR), tipos geométricos, rangos, UUID, y tipos de búsqueda de texto completo.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Usar tipos en definición de columnas
 * import { JsonTypes, SerialTypes, ArrayTypes } from '@querybuilder/postgresql/types';
 * 
 * qb.createTable('users')
 *   .addColumn('id', SerialTypes.BIGSERIAL, { primaryKey: true })
 *   .addColumn('data', JsonTypes.JSONB)
 *   .addColumn('tags', 'TEXT[]');
 * 
 * @example
 * // Tipos de red
 * import { NetworkTypes } from '@querybuilder/postgresql/types';
 * 
 * qb.createTable('connections')
 *   .addColumn('ip_address', NetworkTypes.INET)
 *   .addColumn('subnet', NetworkTypes.CIDR)
 *   .addColumn('mac', NetworkTypes.MACADDR);
 * 
 * @example
 * // Tipos UUID y timestamp
 * import { UuidTypes, DateTimeTypes } from '@querybuilder/postgresql/types';
 * 
 * qb.createTable('sessions')
 *   .addColumn('id', UuidTypes.UUID, { default: 'gen_random_uuid()' })
 *   .addColumn('created_at', 'TIMESTAMP WITH TIME ZONE', { default: 'CURRENT_TIMESTAMP' });
 */

/**
 * Tipos JSON de PostgreSQL
 * @namespace JsonTypes
 * @memberof module:@querybuilder/postgresql/types
 * @description Tipos para almacenar datos JSON. JSONB es binario y más eficiente.
 * 
 * @property {string} JSON - Tipo JSON textual (sin indexación eficiente)
 * @property {string} JSONB - Tipo JSON binario (soporta indexación GIN/GiST)
 * 
 * @example
 * // Usar JSONB para datos indexables
 * qb.createTable('documents')
 *   .addColumn('metadata', JsonTypes.JSONB)
 *   .addIndex(['metadata'], { using: 'GIN' });
 * 
 * @example
 * // JSON para preservar orden y duplicados
 * qb.createTable('logs')
 *   .addColumn('raw_data', JsonTypes.JSON);
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