/*
MySQL QueryBuilder Extendido - Incluye todas las características avanzadas de MySQL
JSON, Window Functions, CTEs, Full-Text Search, etc.
*/
import QueryBuilder from '../core/querybuilder.js';
import MySQL from './MySQL.js';
import { MySQLFunctions } from './functions.js';
import { MySQLOperators } from './operators.js';

/**
 * MySQL QueryBuilder Extendido con todas las características avanzadas
 * @class MySQLExtended
 * @extends QueryBuilder
 */
export class MySQLExtended extends QueryBuilder {
  constructor(connection = null) {
    super(MySQL); // Pasar MySQL como lenguaje
    this.dialect = 'mysql';
    this.version = '8.0'; // MySQL version support
    this.connection = connection;

    // Características específicas de MySQL
    this.features = {
      cte: true,                // Common Table Expressions (MySQL 8.0+)
      windowFunctions: true,    // Window functions (MySQL 8.0+)
      jsonSupport: true,        // JSON native type (MySQL 5.7+)
      fullTextSearch: true,     // Full-text search
      recursive: true,          // Recursive CTEs (MySQL 8.0+)
      partitioning: true,       // Table partitioning
      triggers: true,           // Triggers
      storedProcedures: true,   // Stored procedures
      upsert: true,            // INSERT ... ON DUPLICATE KEY UPDATE
      roles: true,             // Role-based access (MySQL 8.0+)
      gis: true                // Geographic Information System
    };

    // Estado para características específicas
    this.cteQueries = [];
    this.duplicateKeyUpdate = null;
    this.windowSpecs = {};
    this.isRecursive = false;
    this.hints = [];

    // Inicializar extensiones MySQL
    this.initializeMySQLFeatures();
  }

  /**
   * Inicializa características específicas de MySQL
   * @private
   */
  initializeMySQLFeatures() {
    // Registrar tipos de datos específicos
    this.registerMySQLTypes();

    // Registrar operadores específicos
    this.registerMySQLOperators();

    // Registrar funciones específicas  
    this.registerMySQLFunctions();
  }

  /**
   * Registra tipos de datos específicos de MySQL
   * @private
   */
  registerMySQLTypes() {
    this.mysqlTypes = {
      // Tipos JSON
      JSON: 'JSON',

      // Tipos enteros con opciones
      TINYINT: 'TINYINT',
      SMALLINT: 'SMALLINT',
      MEDIUMINT: 'MEDIUMINT',
      INT: 'INT',
      BIGINT: 'BIGINT',

      // Tipos numéricos
      DECIMAL: 'DECIMAL',
      NUMERIC: 'NUMERIC',
      FLOAT: 'FLOAT',
      DOUBLE: 'DOUBLE',
      BIT: 'BIT',

      // Tipos de texto
      CHAR: 'CHAR',
      VARCHAR: 'VARCHAR',
      TINYTEXT: 'TINYTEXT',
      TEXT: 'TEXT',
      MEDIUMTEXT: 'MEDIUMTEXT',
      LONGTEXT: 'LONGTEXT',

      // Tipos binarios
      BINARY: 'BINARY',
      VARBINARY: 'VARBINARY',
      TINYBLOB: 'TINYBLOB',
      BLOB: 'BLOB',
      MEDIUMBLOB: 'MEDIUMBLOB',
      LONGBLOB: 'LONGBLOB',

      // Tipos de fecha y hora
      DATE: 'DATE',
      TIME: 'TIME',
      DATETIME: 'DATETIME',
      TIMESTAMP: 'TIMESTAMP',
      YEAR: 'YEAR',

      // Tipos especiales
      ENUM: 'ENUM',
      SET: 'SET',
      BOOLEAN: 'BOOLEAN',

      // Tipos geométricos
      GEOMETRY: 'GEOMETRY',
      POINT: 'POINT',
      LINESTRING: 'LINESTRING',
      POLYGON: 'POLYGON',
      MULTIPOINT: 'MULTIPOINT',
      MULTILINESTRING: 'MULTILINESTRING',
      MULTIPOLYGON: 'MULTIPOLYGON',
      GEOMETRYCOLLECTION: 'GEOMETRYCOLLECTION'
    };
  }

  /**
   * Registra operadores específicos de MySQL
   * @private  
   */
  registerMySQLOperators() {
    this.mysqlOperators = {
      // Operadores JSON
      JSON_EXTRACT: '->',
      JSON_UNQUOTE_EXTRACT: '->>',

      // Operadores de comparación especiales
      NULL_SAFE_EQUALS: '<=>',

      // Operadores de bits
      BITWISE_AND: '&',
      BITWISE_OR: '|',
      BITWISE_XOR: '^',
      BITWISE_NOT: '~',
      LEFT_SHIFT: '<<',
      RIGHT_SHIFT: '>>',

      // Operadores de cadena
      REGEXP: 'REGEXP',
      RLIKE: 'RLIKE',
      NOT_REGEXP: 'NOT REGEXP',

      // Operadores de asignación
      ASSIGN: ':=',

      // Operadores de intervalo
      INTERVAL: 'INTERVAL'
    };
  }

  /**
   * Registra funciones específicas de MySQL
   * @private
   */
  registerMySQLFunctions() {
    this.mysqlFunctions = MySQLFunctions;
  }

  // ===========================================
  // MÉTODOS JSON ESPECÍFICOS DE MYSQL
  // ===========================================

  /**
   * Extrae valor de campo JSON usando ->
   * @param {string} column - Columna JSON
   * @param {string} path - Ruta JSON
   * @returns {MySQLExtended}
   */
  jsonExtract(column, path) {
    return this.selectRaw(`${column}->'${path}' as json_extract`);
  }

  /**
   * Extrae y descomilla valor de campo JSON usando ->>
   * @param {string} column - Columna JSON
   * @param {string} path - Ruta JSON
   * @returns {MySQLExtended}
   */
  jsonUnquote(column, path) {
    return this.selectRaw(`${column}->>'${path}' as json_unquote`);
  }

  /**
   * Construye objeto JSON usando JSON_OBJECT
   * @param {object} fields - Campos del objeto
   * @returns {string}
   */
  jsonObject(fields) {
    const pairs = [];
    for (const [key, value] of Object.entries(fields)) {
      pairs.push(`'${key}', ${value}`);
    }
    return `JSON_OBJECT(${pairs.join(', ')})`;
  }

  /**
   * Construye array JSON usando JSON_ARRAY
   * @param {Array} values - Valores del array
   * @returns {string}
   */
  jsonArray(values) {
    return `JSON_ARRAY(${values.join(', ')})`;
  }

  /**
   * Verifica si JSON contiene valor usando JSON_CONTAINS
   * @param {string} column - Columna JSON
   * @param {any} value - Valor a buscar
   * @param {string} path - Ruta opcional
   * @returns {MySQLExtended}
   */
  jsonContains(column, value, path = null) {
    const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
    const pathStr = path ? `, '${path}'` : '';
    return this.whereRaw(`JSON_CONTAINS(${column}, '${valueStr}'${pathStr}) = 1`);
  }

  /**
   * Busca en JSON usando JSON_SEARCH
   * @param {string} column - Columna JSON
   * @param {string} searchValue - Valor a buscar
   * @param {string} oneOrAll - 'one' o 'all'
   * @param {string} path - Ruta opcional
   * @returns {MySQLExtended}
   */
  jsonSearch(column, searchValue, oneOrAll = 'one', path = null) {
    const pathStr = path ? `, null, '${path}'` : '';
    return this.whereRaw(`JSON_SEARCH(${column}, '${oneOrAll}', '${searchValue}'${pathStr}) IS NOT NULL`);
  }

  /**
   * Actualiza valor JSON usando JSON_SET
   * @param {string} column - Columna JSON
   * @param {string} path - Ruta JSON
   * @param {any} value - Nuevo valor
   * @returns {MySQLExtended}
   */
  jsonSet(column, path, value) {
    const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
    return this.updateRaw(`${column} = JSON_SET(${column}, '${path}', '${valueStr}')`);
  }

  // ===========================================
  // WINDOW FUNCTIONS (MySQL 8.0+)
  // ===========================================

  /**
   * Agrega ROW_NUMBER() OVER
   * @param {object} options - Opciones de partición y orden
   * @returns {MySQLExtended}
   */
  rowNumber(options = {}) {
    let windowClause = 'ROW_NUMBER() OVER (';

    if (options.partitionBy) {
      windowClause += `PARTITION BY ${Array.isArray(options.partitionBy) ? options.partitionBy.join(', ') : options.partitionBy} `;
    }

    if (options.orderBy) {
      const order = Array.isArray(options.orderBy) ? options.orderBy.join(', ') : options.orderBy;
      windowClause += `ORDER BY ${order}`;
    }

    windowClause += ')';
    return this.selectRaw(`${windowClause} as row_number`);
  }

  /**
   * Agrega RANK() OVER
   * @param {object} options - Opciones de partición y orden
   * @returns {MySQLExtended}
   */
  rank(options = {}) {
    let windowClause = 'RANK() OVER (';

    if (options.partitionBy) {
      windowClause += `PARTITION BY ${Array.isArray(options.partitionBy) ? options.partitionBy.join(', ') : options.partitionBy} `;
    }

    if (options.orderBy) {
      const order = Array.isArray(options.orderBy) ? options.orderBy.join(', ') : options.orderBy;
      windowClause += `ORDER BY ${order}`;
    }

    windowClause += ')';
    return this.selectRaw(`${windowClause} as rank`);
  }

  /**
   * Agrega LAG() OVER
   * @param {string} column - Columna
   * @param {number} offset - Desplazamiento
   * @param {any} defaultValue - Valor por defecto
   * @param {object} options - Opciones de partición y orden
   * @returns {MySQLExtended}
   */
  lag(column, offset = 1, defaultValue = null, options = {}) {
    let windowClause = `LAG(${column}, ${offset}`;

    if (defaultValue !== null) {
      windowClause += `, ${defaultValue}`;
    }

    windowClause += ') OVER (';

    if (options.partitionBy) {
      windowClause += `PARTITION BY ${Array.isArray(options.partitionBy) ? options.partitionBy.join(', ') : options.partitionBy} `;
    }

    if (options.orderBy) {
      const order = Array.isArray(options.orderBy) ? options.orderBy.join(', ') : options.orderBy;
      windowClause += `ORDER BY ${order}`;
    }

    windowClause += ')';
    return this.selectRaw(`${windowClause} as lag_${column}`);
  }

  /**
   * Agrega LEAD() OVER
   * @param {string} column - Columna
   * @param {number} offset - Desplazamiento
   * @param {any} defaultValue - Valor por defecto
   * @param {object} options - Opciones de partición y orden
   * @returns {MySQLExtended}
   */
  lead(column, offset = 1, defaultValue = null, options = {}) {
    let windowClause = `LEAD(${column}, ${offset}`;

    if (defaultValue !== null) {
      windowClause += `, ${defaultValue}`;
    }

    windowClause += ') OVER (';

    if (options.partitionBy) {
      windowClause += `PARTITION BY ${Array.isArray(options.partitionBy) ? options.partitionBy.join(', ') : options.partitionBy} `;
    }

    if (options.orderBy) {
      const order = Array.isArray(options.orderBy) ? options.orderBy.join(', ') : options.orderBy;
      windowClause += `ORDER BY ${order}`;
    }

    windowClause += ')';
    return this.selectRaw(`${windowClause} as lead_${column}`);
  }

  // ===========================================
  // COMMON TABLE EXPRESSIONS (MySQL 8.0+)
  // ===========================================

  /**
   * Agrega CTE (Common Table Expression)
   * @param {string} name - Nombre del CTE
   * @param {MySQLExtended|string} query - Query del CTE
   * @returns {MySQLExtended}
   */
  with(name, query) {
    const queryString = typeof query === 'string' ? query : query.toString();
    this.cteQueries.push(`${name} AS (${queryString})`);
    return this;
  }

  /**
   * Agrega CTE recursivo
   * @param {string} name - Nombre del CTE
   * @param {MySQLExtended|string} anchorQuery - Query ancla
   * @param {MySQLExtended|string} recursiveQuery - Query recursivo
   * @returns {MySQLExtended}
   */
  withRecursive(name, anchorQuery, recursiveQuery) {
    this.isRecursive = true;
    const anchorStr = typeof anchorQuery === 'string' ? anchorQuery : anchorQuery.toString();
    const recursiveStr = typeof recursiveQuery === 'string' ? recursiveQuery : recursiveQuery.toString();
    this.cteQueries.push(`${name} AS (${anchorStr} UNION ALL ${recursiveStr})`);
    return this;
  }

  // ===========================================
  // UPSERT (INSERT ... ON DUPLICATE KEY UPDATE)
  // ===========================================

  /**
   * INSERT ... ON DUPLICATE KEY UPDATE
   * @param {string} table - Tabla
   * @param {object} data - Datos a insertar
   * @param {object} updateData - Datos a actualizar en caso de conflicto
   * @returns {MySQLExtended}
   */
  upsert(table, data, updateData = null) {
    this.type = 'insert';
    this.table = table;
    this.insertData = data;
    this.duplicateKeyUpdate = updateData || data;
    return this;
  }

  /**
   * Especifica la acción ON DUPLICATE KEY UPDATE
   * @param {object} updateData - Datos a actualizar
   * @returns {MySQLExtended}
   */
  onDuplicateKeyUpdate(updateData) {
    this.duplicateKeyUpdate = updateData;
    return this;
  }

  // ===========================================
  // FULL-TEXT SEARCH
  // ===========================================

  /**
   * Búsqueda de texto completo usando MATCH ... AGAINST
   * @param {string|Array} columns - Columna(s) con índice FULLTEXT
   * @param {string} searchTerm - Término de búsqueda
   * @param {string} mode - Modo de búsqueda ('NATURAL', 'BOOLEAN', 'QUERY EXPANSION')
   * @returns {MySQLExtended}
   */
  fullTextSearch(columns, searchTerm, mode = 'NATURAL') {
    const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
    const modeClause = mode ? ` IN ${mode} MODE` : '';
    return this.whereRaw(`MATCH(${columnList}) AGAINST('${searchTerm}'${modeClause})`);
  }

  /**
   * Ordena por relevancia de búsqueda de texto completo
   * @param {string|Array} columns - Columna(s) con índice FULLTEXT
   * @param {string} searchTerm - Término de búsqueda
   * @param {string} mode - Modo de búsqueda
   * @returns {MySQLExtended}
   */
  orderByRelevance(columns, searchTerm, mode = 'NATURAL') {
    const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
    const modeClause = mode ? ` IN ${mode} MODE` : '';
    return this.orderByRaw(`MATCH(${columnList}) AGAINST('${searchTerm}'${modeClause}) DESC`);
  }

  // ===========================================
  // OPTIMIZACIÓN Y HINTS
  // ===========================================

  /**
   * Agrega hint para el optimizador
   * @param {string} hint - Hint SQL
   * @returns {MySQLExtended}
   */
  hint(hint) {
    this.hints.push(hint);
    return this;
  }

  /**
   * Fuerza uso de índice
   * @param {string} index - Nombre del índice
   * @returns {MySQLExtended}
   */
  forceIndex(index) {
    return this.hint(`FORCE INDEX (${index})`);
  }

  /**
   * Sugiere uso de índice
   * @param {string} index - Nombre del índice
   * @returns {MySQLExtended}
   */
  useIndex(index) {
    return this.hint(`USE INDEX (${index})`);
  }

  /**
   * Ignora índice
   * @param {string} index - Nombre del índice
   * @returns {MySQLExtended}
   */
  ignoreIndex(index) {
    return this.hint(`IGNORE INDEX (${index})`);
  }

  // ===========================================
  // FUNCIONES AUXILIARES
  // ===========================================

  /**
   * Genera el SQL final incluyendo CTEs, hints y características específicas
   * @returns {string}
   */
  toString() {
    let sql = '';

    // Agregar CTEs
    if (this.cteQueries.length > 0) {
      const ctePrefix = this.isRecursive ? 'WITH RECURSIVE ' : 'WITH ';
      sql += ctePrefix + this.cteQueries.join(', ') + ' ';
    }

    // Generar query base
    let baseQuery = super.toString();

    // Agregar hints después del SELECT
    if (this.hints.length > 0 && this.type === 'select') {
      baseQuery = baseQuery.replace(/^SELECT/, `SELECT /*+ ${this.hints.join(' ')} */`);
    }

    // Agregar ON DUPLICATE KEY UPDATE para INSERT
    if (this.type === 'insert' && this.duplicateKeyUpdate) {
      const updatePairs = [];
      for (const [key, value] of Object.entries(this.duplicateKeyUpdate)) {
        const formattedValue = typeof value === 'string' ? `'${value}'` : value;
        updatePairs.push(`${key} = ${formattedValue}`);
      }
      baseQuery += ` ON DUPLICATE KEY UPDATE ${updatePairs.join(', ')}`;
    }

    sql += baseQuery;

    return sql;
  }

  /**
   * Clona la instancia actual
   * @returns {MySQLExtended}
   */
  clone() {
    const cloned = new MySQLExtended(this.connection);

    // Copiar propiedades básicas
    Object.assign(cloned, this);

    // Copiar arrays específicos
    cloned.cteQueries = [...this.cteQueries];
    cloned.hints = [...this.hints];

    return cloned;
  }

  /**
   * Resetea el estado de características específicas
   * @returns {MySQLExtended}
   */
  reset() {
    super.reset();
    this.cteQueries = [];
    this.duplicateKeyUpdate = null;
    this.windowSpecs = {};
    this.isRecursive = false;
    this.hints = [];
    return this;
  }
}

export default MySQLExtended;