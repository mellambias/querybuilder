/**
 * @fileoverview MySQL Features - Características y capacidades de MySQL
 * @module @querybuilder/mysql/features
 * @description Documentación completa de características, funcionalidades y limitaciones
 * específicas de MySQL. Incluye soporte de tipos de datos, características de consultas,
 * funcionalidades de índices, transacciones, y compatibilidad con diferentes versiones.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Verificar soporte de características
 * import { QueryFeatures, DataTypeFeatures } from '@querybuilder/mysql/features';
 * 
 * if (QueryFeatures.WINDOW_FUNCTIONS) {
 *   // Usar window functions (MySQL 8.0+)
 *   qb.select('ROW_NUMBER() OVER (ORDER BY created_at) as row_num').from('users');
 * }
 * 
 * @example
 * // Verificar soporte de tipos
 * if (DataTypeFeatures.JSON_NATIVE_TYPE) {
 *   qb.createTable('logs').addColumn('data', 'JSON');
 * }
 */

/**
 * Características de tipos de datos de MySQL
 * @namespace DataTypeFeatures
 * @memberof module:@querybuilder/mysql/features
 * @description Capacidades y características de los tipos de datos en MySQL
 * 
 * @property {boolean} JSON_NATIVE_TYPE - Soporte de tipo JSON nativo (MySQL 5.7+)
 * @property {boolean} JSON_FUNCTIONS - Funciones JSON disponibles
 * @property {boolean} UNSIGNED_INTEGERS - Soporte de enteros sin signo
 * @property {boolean} ENUM_TYPE - Soporte de tipo ENUM
 * @property {boolean} SET_TYPE - Soporte de tipo SET
 * @property {boolean} GEOMETRY_TYPES - Tipos de datos espaciales/geométricos
 * 
 * @example
 * // Verificar características antes de usar
 * if (DataTypeFeatures.JSON_NATIVE_TYPE) {
 *   console.log('JSON nativo soportado');
 * }
 */
export const DataTypeFeatures = {
  // JSON support (MySQL 5.7+)
  JSON_NATIVE_TYPE: true,
  JSON_FUNCTIONS: true,
  JSON_OPERATORS: true,

  // Numeric types
  TINYINT_AUTO_INCREMENT: true,
  UNSIGNED_INTEGERS: true,
  ZEROFILL: true,

  // String types
  VARIABLE_LENGTH_STRINGS: true,
  CHARSET_COLLATION: true,
  CASE_SENSITIVE_COLLATIONS: true,
  BINARY_STRINGS: true,

  // Date/Time
  YEAR_TYPE: true,
  TIMESTAMP_AUTO_UPDATE: true,
  DATETIME_PRECISION: true, // microseconds

  // Special types
  ENUM_TYPE: true,
  SET_TYPE: true,
  GEOMETRY_TYPES: true,
  SPATIAL_INDEX: true
};

/**
 * Características de consultas de MySQL
 */
export const QueryFeatures = {
  // Join types
  INNER_JOIN: true,
  LEFT_JOIN: true,
  RIGHT_JOIN: true,
  CROSS_JOIN: true,
  NATURAL_JOIN: true,
  STRAIGHT_JOIN: true, // MySQL specific

  // Subqueries
  SCALAR_SUBQUERIES: true,
  CORRELATED_SUBQUERIES: true,
  DERIVED_TABLES: true,

  // Window functions (MySQL 8.0+)
  WINDOW_FUNCTIONS: true,
  RECURSIVE_CTE: true, // Common Table Expressions

  // Advanced features
  FULL_TEXT_SEARCH: true,
  REGEXP_MATCHING: true,
  SPATIAL_QUERIES: true,

  // Limits and offsets
  LIMIT_CLAUSE: true,
  OFFSET_SUPPORT: true,

  // Grouping
  GROUP_BY_EXTENSIONS: true,
  HAVING_CLAUSE: true,
  ROLLUP: true,

  // Sorting
  ORDER_BY_EXPRESSIONS: true,
  COLLATION_SORTING: true
};

/**
 * Características de índices de MySQL
 */
export const IndexFeatures = {
  // Index types
  BTREE_INDEX: true,
  HASH_INDEX: true, // Memory engine
  FULLTEXT_INDEX: true,
  SPATIAL_INDEX: true,

  // Index properties
  UNIQUE_INDEX: true,
  PARTIAL_INDEX: false, // No soportado
  FUNCTIONAL_INDEX: true, // MySQL 8.0+
  INVISIBLE_INDEX: true, // MySQL 8.0+

  // Composite indexes
  MULTI_COLUMN_INDEX: true,
  INDEX_MERGE: true,
  PREFIX_INDEX: true
};

/**
 * Características de transacciones de MySQL
 */
export const TransactionFeatures = {
  // ACID properties
  ATOMICITY: true,
  CONSISTENCY: true,
  ISOLATION: true,
  DURABILITY: true,

  // Isolation levels
  READ_UNCOMMITTED: true,
  READ_COMMITTED: true,
  REPEATABLE_READ: true, // Default
  SERIALIZABLE: true,

  // Transaction control
  AUTOCOMMIT: true,
  EXPLICIT_TRANSACTIONS: true,
  SAVEPOINTS: true,
  DEADLOCK_DETECTION: true,

  // Engine support
  INNODB_TRANSACTIONS: true,
  MYISAM_TRANSACTIONS: false
};

/**
 * Características de almacenamiento de MySQL
 */
export const StorageFeatures = {
  // Storage engines
  INNODB: {
    name: 'InnoDB',
    transactions: true,
    foreignKeys: true,
    crashRecovery: true,
    rowLocking: true,
    default: true
  },

  MYISAM: {
    name: 'MyISAM',
    transactions: false,
    foreignKeys: false,
    fullTextIndex: true,
    tableLocking: true,
    fast: true
  },

  MEMORY: {
    name: 'Memory',
    inMemory: true,
    hashIndex: true,
    temporary: true,
    fast: true
  },

  ARCHIVE: {
    name: 'Archive',
    compressed: true,
    insertOnly: true,
    space: true
  }
};

/**
 * Limitaciones de MySQL
 */
export const MySQLLimitations = {
  // General limits
  MAX_DATABASES: 'unlimited',
  MAX_TABLES_PER_DB: 'unlimited',
  MAX_COLUMNS_PER_TABLE: 4096,
  MAX_INDEXES_PER_TABLE: 64,
  MAX_KEY_LENGTH: 3072, // bytes

  // Row and table limits
  MAX_ROW_SIZE: 65535, // bytes
  MAX_TABLE_SIZE: '256TB', // MyISAM
  MAX_TABLE_SIZE_INNODB: '64TB',

  // String limits
  MAX_VARCHAR_LENGTH: 65535,
  MAX_TEXT_LENGTH: '4GB',
  MAX_BLOB_LENGTH: '4GB',

  // Numeric limits
  MAX_INT_VALUE: 2147483647,
  MAX_BIGINT_VALUE: '9223372036854775807',

  // Query limits
  MAX_JOINS_PER_QUERY: 61,
  MAX_SORT_LENGTH: 1024,
  MAX_GROUP_CONCAT_LENGTH: 1024, // configurable

  // Connection limits
  MAX_CONNECTIONS: 151, // default, configurable
  MAX_USER_CONNECTIONS: 0, // unlimited by default

  // Version specific
  MYSQL_5_7: {
    json: true,
    generated_columns: true
  },
  MYSQL_8_0: {
    window_functions: true,
    cte: true,
    roles: true,
    invisible_indexes: true
  }
};

/**
 * Características de seguridad de MySQL
 */
export const SecurityFeatures = {
  // Authentication
  PASSWORD_VALIDATION: true,
  MULTIPLE_AUTH_PLUGINS: true,
  LDAP_AUTHENTICATION: true, // Enterprise

  // Authorization
  ROLE_BASED_ACCESS: true, // MySQL 8.0+
  GRANULAR_PRIVILEGES: true,
  COLUMN_LEVEL_PRIVILEGES: true,

  // Encryption
  DATA_AT_REST_ENCRYPTION: true,
  SSL_TLS_ENCRYPTION: true,
  TRANSPARENT_DATA_ENCRYPTION: true, // Enterprise

  // Auditing
  AUDIT_LOG: true, // Enterprise
  GENERAL_LOG: true,
  BINARY_LOG: true,
  ERROR_LOG: true
};

/**
 * Características de replicación de MySQL
 */
export const ReplicationFeatures = {
  // Replication types
  MASTER_SLAVE: true,
  MASTER_MASTER: true,
  GROUP_REPLICATION: true, // MySQL 5.7+

  // Replication modes
  STATEMENT_BASED: true,
  ROW_BASED: true,
  MIXED_MODE: true,

  // Features
  GTID: true, // Global Transaction Identifiers
  PARALLEL_REPLICATION: true,
  DELAYED_REPLICATION: true,
  FILTERED_REPLICATION: true
};

/**
 * Verificar si una característica está disponible
 * @param {string} feature - Característica a verificar
 * @param {string} version - Versión de MySQL (opcional)
 * @returns {boolean}
 */
export function isFeatureSupported(feature, version = '8.0') {
  const featureMap = {
    'JSON': version >= '5.7',
    'WINDOW_FUNCTIONS': version >= '8.0',
    'CTE': version >= '8.0',
    'ROLES': version >= '8.0',
    'INVISIBLE_INDEXES': version >= '8.0',
    'FUNCTIONAL_INDEXES': version >= '8.0',
    'GROUP_REPLICATION': version >= '5.7',
    'GENERATED_COLUMNS': version >= '5.7'
  };

  return featureMap[feature.toUpperCase()] || false;
}

/**
 * Obtener límites para una versión específica
 * @param {string} version - Versión de MySQL
 * @returns {object}
 */
export function getLimitsForVersion(version) {
  const baseLimits = { ...MySQLLimitations };

  if (version >= '8.0') {
    baseLimits.MAX_COLUMNS_PER_TABLE = 4096;
    baseLimits.MAX_INDEXES_PER_TABLE = 64;
  } else if (version >= '5.7') {
    baseLimits.MAX_COLUMNS_PER_TABLE = 4096;
    baseLimits.MAX_INDEXES_PER_TABLE = 64;
  }

  return baseLimits;
}

/**
 * Verificar compatibilidad de motor de almacenamiento
 * @param {string} engine - Motor de almacenamiento
 * @param {string} feature - Característica a verificar
 * @returns {boolean}
 */
export function isEngineCompatible(engine, feature) {
  const engineUpper = engine.toUpperCase();
  const featureUpper = feature.toUpperCase();

  const compatibility = {
    'INNODB': ['TRANSACTIONS', 'FOREIGN_KEYS', 'ROW_LOCKING', 'CRASH_RECOVERY'],
    'MYISAM': ['FULLTEXT_INDEX', 'TABLE_LOCKING', 'FAST_INSERT'],
    'MEMORY': ['HASH_INDEX', 'IN_MEMORY', 'FAST_ACCESS'],
    'ARCHIVE': ['COMPRESSION', 'INSERT_ONLY']
  };

  return compatibility[engineUpper]?.includes(featureUpper) || false;
}

export default {
  DataTypeFeatures,
  QueryFeatures,
  IndexFeatures,
  TransactionFeatures,
  StorageFeatures,
  MySQLLimitations,
  SecurityFeatures,
  ReplicationFeatures,
  isFeatureSupported,
  getLimitsForVersion,
  isEngineCompatible
};