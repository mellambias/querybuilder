/*
PostgreSQL QueryBuilder Extendido - Incluye todas las características avanzadas de PostgreSQL
JSON/JSONB, UPSERT, Window Functions, CTEs, Arrays, Full-Text Search, etc.
*/
import PostgreSQL from './PostgreSQL.js';

/**
 * PostgreSQL QueryBuilder Extendido con todas las características avanzadas
 * @class PostgreSQLExtended
 * @extends PostgreSQL
 */
export class PostgreSQLExtended extends PostgreSQL {
  constructor(connection = null) {
    super();
    this.dialect = 'postgresql';
    this.version = '16.0'; // PostgreSQL version support
    this.connection = connection;

    // Características específicas de PostgreSQL
    this.features = {
      cte: true,                // Common Table Expressions
      upsert: true,            // INSERT ... ON CONFLICT
      jsonOperators: true,     // JSON/JSONB operators
      windowFunctions: true,   // Window functions
      arrays: true,            // Array support
      fullTextSearch: true,    // Full-text search
      recursive: true,         // Recursive queries
      partitioning: true,      // Table partitioning
      extensions: true         // PostgreSQL extensions
    };

    // Estado para características específicas
    this.cteQueries = [];
    this.conflictTarget = null;
    this.conflictAction = null;
    this.windowSpecs = {};
    this.isRecursive = false;

    // Inicializar extensiones
    this.initializePostgreSQLFeatures();
  }

  /**
   * Inicializa características específicas de PostgreSQL
   * @private
   */
  initializePostgreSQLFeatures() {
    // Registrar tipos de datos específicos
    this.registerPostgreSQLTypes();

    // Registrar operadores específicos
    this.registerPostgreSQLOperators();

    // Registrar funciones específicas  
    this.registerPostgreSQLFunctions();
  }

  /**
   * Registra tipos de datos específicos de PostgreSQL
   * @private
   */
  registerPostgreSQLTypes() {
    this.pgTypes = {
      // Tipos seriales
      SERIAL: 'SERIAL',
      BIGSERIAL: 'BIGSERIAL',
      SMALLSERIAL: 'SMALLSERIAL',

      // Tipos JSON
      JSON: 'JSON',
      JSONB: 'JSONB',

      // Tipos de red
      INET: 'INET',
      CIDR: 'CIDR',
      MACADDR: 'MACADDR',

      // UUID
      UUID: 'UUID',

      // Arrays
      ARRAY: 'ARRAY',

      // Texto
      TEXT: 'TEXT',

      // Geométricos
      POINT: 'POINT',
      LINE: 'LINE',
      POLYGON: 'POLYGON',

      // Full-text search
      TSVECTOR: 'TSVECTOR',
      TSQUERY: 'TSQUERY',

      // Rangos
      INT4RANGE: 'INT4RANGE',
      TSRANGE: 'TSRANGE',
      DATERANGE: 'DATERANGE'
    };
  }

  /**
   * Registra operadores específicos de PostgreSQL
   * @private  
   */
  registerPostgreSQLOperators() {
    this.pgOperators = {
      // JSON operators
      JSON_CONTAINS: '@>',
      JSON_CONTAINED: '<@',
      JSON_EXTRACT_PATH: '#>',
      JSON_EXTRACT_TEXT: '#>>',
      JSON_EXISTS: '?',
      JSON_EXISTS_ANY: '?|',
      JSON_EXISTS_ALL: '?&',
      JSON_CONCAT: '||',

      // Array operators
      ARRAY_CONTAINS: '@>',
      ARRAY_CONTAINED: '<@',
      ARRAY_OVERLAP: '&&',
      ARRAY_CONCAT: '||',

      // Text operators
      REGEX_MATCH: '~',
      REGEX_MATCH_CI: '~*',
      REGEX_NO_MATCH: '!~',
      REGEX_NO_MATCH_CI: '!~*',
      STRING_CONCAT: '||',

      // Full-text search
      FULLTEXT_MATCH: '@@',

      // Range operators
      RANGE_CONTAINS: '@>',
      RANGE_CONTAINED: '<@',
      RANGE_OVERLAP: '&&'
    };
  }

  /**
   * Registra funciones específicas de PostgreSQL
   * @private
   */
  registerPostgreSQLFunctions() {
    this.pgFunctions = {
      // JSON functions
      jsonBuildObject: 'json_build_object',
      jsonbAgg: 'jsonb_agg',
      jsonExtractPath: 'json_extract_path',
      jsonObjectKeys: 'json_object_keys',

      // Array functions
      arrayAgg: 'array_agg',
      unnest: 'unnest',
      arrayLength: 'array_length',
      arrayPosition: 'array_position',
      arrayAppend: 'array_append',

      // Text search functions
      toTsVector: 'to_tsvector',
      toTsQuery: 'to_tsquery',
      tsRank: 'ts_rank',

      // Window functions
      rowNumber: 'ROW_NUMBER',
      rank: 'RANK',
      denseRank: 'DENSE_RANK',
      lag: 'LAG',
      lead: 'LEAD',
      firstValue: 'FIRST_VALUE',
      lastValue: 'LAST_VALUE',

      // Utility functions
      coalesce: 'COALESCE',
      nullif: 'NULLIF',
      greatest: 'GREATEST',
      least: 'LEAST'
    };
  }

  // ===== JSON OPERATIONS =====

  /**
   * Operador @> para containment JSON
   * @param {string} column - Columna JSON/JSONB
   * @param {object} value - Valor a buscar
   * @returns {PostgreSQLExtended}
   */
  jsonContains(column, value) {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    return this.where(`${column}`, '@>', `'${jsonValue}'`);
  }

  /**
   * Operador <@ para contained by JSON
   * @param {string} column - Columna JSON/JSONB
   * @param {object} value - Valor contenedor
   * @returns {PostgreSQLExtended}
   */
  jsonContainedBy(column, value) {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    return this.where(`${column}`, '<@', `'${jsonValue}'`);
  }

  /**
   * Verifica existencia de key en JSON (?)
   * @param {string} column - Columna JSON/JSONB  
   * @param {string} key - Key a verificar
   * @returns {PostgreSQLExtended}
   */
  jsonHasKey(column, key) {
    return this.where(`${column}`, '?', `'${key}'`);
  }

  /**
   * Verifica existencia de cualquier key (?|)
   * @param {string} column - Columna JSON/JSONB
   * @param {array} keys - Keys a verificar
   * @returns {PostgreSQLExtended}
   */
  jsonHasAnyKeys(column, keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return this.where(`${column}`, '?|', `ARRAY[${keyArray.map(k => `'${k}'`).join(', ')}]`);
  }

  /**
   * Verifica existencia de todas las keys (?&)
   * @param {string} column - Columna JSON/JSONB
   * @param {array} keys - Keys a verificar
   * @returns {PostgreSQLExtended}
   */
  jsonHasAllKeys(column, keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return this.where(`${column}`, '?&', `ARRAY[${keyArray.map(k => `'${k}'`).join(', ')}]`);
  }

  /**
   * Extrae valor de JSON usando path con operador y comparación
   * @param {string} column - Columna JSON/JSONB
   * @param {string} path - Path a extraer ($.path.notation)
   * @param {string} operator - Operador de comparación
   * @param {*} value - Valor a comparar
   * @returns {PostgreSQLExtended}
   */
  jsonPath(column, path, operator, value) {
    // Convertir $.path.notation a PostgreSQL path {path,notation}
    const pgPath = path.replace(/^\$\./, '').split('.').join(',');
    return this.where(`${column} #>> '{${pgPath}}'`, operator, value);
  }

  /**
   * Actualiza campo JSON usando jsonb_set
   * @param {string} column - Columna JSONB
   * @param {string} path - Path a actualizar ($.path.notation)
   * @param {*} value - Nuevo valor
   * @returns {PostgreSQLExtended}
   */
  jsonSet(column, path, value) {
    const pgPath = path.replace(/^\$\./, '').split('.');
    const jsonValue = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
    const updateValue = `jsonb_set(${column}, '{${pgPath.join(',')}}', '${jsonValue}')`;
    return this.update({ [column]: updateValue });
  }

  /**
   * Elimina campo JSON usando operador #-
   * @param {string} column - Columna JSONB
   * @param {string} path - Path a eliminar
   * @returns {PostgreSQLExtended}
   */
  jsonRemove(column, path) {
    const pgPath = path.replace(/^\$\./, '').split('.');
    const updateValue = `${column} #- '{${pgPath.join(',')}}'`;
    return this.update({ [column]: updateValue });
  }

  // ===== UPSERT OPERATIONS =====

  /**
   * Define columnas para ON CONFLICT
   * @param {string|array} columns - Columnas de conflicto
   * @returns {PostgreSQLExtended}
   */
  onConflict(columns) {
    this.conflictTarget = Array.isArray(columns) ? columns : [columns];
    return this;
  }

  /**
   * Define constraint para ON CONFLICT
   * @param {string} constraint - Nombre del constraint
   * @returns {PostgreSQLExtended}
   */
  onConflictConstraint(constraint) {
    this.conflictTarget = `ON CONSTRAINT ${constraint}`;
    return this;
  }

  /**
   * Define acción UPDATE para conflictos
   * @param {object} values - Valores a actualizar
   * @returns {PostgreSQLExtended}
   */
  doUpdate(values) {
    this.conflictAction = { type: 'update', values };
    return this;
  }

  /**
   * Define acción NOTHING para conflictos  
   * @returns {PostgreSQLExtended}
   */
  doNothing() {
    this.conflictAction = { type: 'nothing' };
    return this;
  }

  // ===== WINDOW FUNCTIONS =====

  /**
   * ROW_NUMBER() con cláusula OVER
   * @param {array} partitionBy - Columnas de partición
   * @param {array} orderBy - Columnas de ordenamiento
   * @param {string} alias - Alias para el resultado
   * @returns {PostgreSQLExtended}
   */
  rowNumber(partitionBy = [], orderBy = [], alias = 'row_number') {
    const windowClause = this.buildWindowClause(partitionBy, orderBy);
    return this.selectRaw(`ROW_NUMBER() ${windowClause} AS ${alias}`);
  }

  /**
   * RANK() con cláusula OVER
   * @param {array} partitionBy - Columnas de partición
   * @param {array} orderBy - Columnas de ordenamiento
   * @param {string} alias - Alias para el resultado
   * @returns {PostgreSQLExtended}
   */
  rank(partitionBy = [], orderBy = [], alias = 'rank') {
    const windowClause = this.buildWindowClause(partitionBy, orderBy);
    return this.selectRaw(`RANK() ${windowClause} AS ${alias}`);
  }

  /**
   * DENSE_RANK() con cláusula OVER
   * @param {array} partitionBy - Columnas de partición
   * @param {array} orderBy - Columnas de ordenamiento
   * @param {string} alias - Alias para el resultado
   * @returns {PostgreSQLExtended}
   */
  denseRank(partitionBy = [], orderBy = [], alias = 'dense_rank') {
    const windowClause = this.buildWindowClause(partitionBy, orderBy);
    return this.selectRaw(`DENSE_RANK() ${windowClause} AS ${alias}`);
  }

  /**
   * LAG() con cláusula OVER
   * @param {string} column - Columna
   * @param {number} offset - Desplazamiento (default: 1)
   * @param {*} defaultValue - Valor por defecto
   * @param {array} partitionBy - Columnas de partición
   * @param {array} orderBy - Columnas de ordenamiento
   * @param {string} alias - Alias para el resultado
   * @returns {PostgreSQLExtended}
   */
  lag(column, offset = 1, defaultValue = 'NULL', partitionBy = [], orderBy = [], alias = 'lag_value') {
    const windowClause = this.buildWindowClause(partitionBy, orderBy);
    let lagFunc = `LAG(${column}, ${offset}`;
    if (defaultValue !== 'NULL') {
      lagFunc += `, ${defaultValue}`;
    }
    lagFunc += `)`;
    return this.selectRaw(`${lagFunc} ${windowClause} AS ${alias}`);
  }

  /**
   * LEAD() con cláusula OVER
   * @param {string} column - Columna
   * @param {number} offset - Desplazamiento (default: 1)
   * @param {*} defaultValue - Valor por defecto
   * @param {array} partitionBy - Columnas de partición
   * @param {array} orderBy - Columnas de ordenamiento
   * @param {string} alias - Alias para el resultado
   * @returns {PostgreSQLExtended}
   */
  lead(column, offset = 1, defaultValue = 'NULL', partitionBy = [], orderBy = [], alias = 'lead_value') {
    const windowClause = this.buildWindowClause(partitionBy, orderBy);
    let leadFunc = `LEAD(${column}, ${offset}`;
    if (defaultValue !== 'NULL') {
      leadFunc += `, ${defaultValue}`;
    }
    leadFunc += `)`;
    return this.selectRaw(`${leadFunc} ${windowClause} AS ${alias}`);
  }

  /**
   * Construye cláusula OVER para window functions
   * @private
   * @param {array} partitionBy - Columnas de partición
   * @param {array} orderBy - Columnas de ordenamiento
   * @returns {string}
   */
  buildWindowClause(partitionBy = [], orderBy = []) {
    let clause = 'OVER (';
    const parts = [];

    if (partitionBy.length > 0) {
      parts.push(`PARTITION BY ${partitionBy.join(', ')}`);
    }

    if (orderBy.length > 0) {
      parts.push(`ORDER BY ${orderBy.join(', ')}`);
    }

    clause += parts.join(' ');
    clause += ')';

    return clause;
  }

  // ===== CTE SUPPORT =====

  /**
   * Common Table Expression (WITH)
   * @param {string} name - Nombre del CTE
   * @param {string|QueryBuilder} query - Query del CTE
   * @returns {PostgreSQLExtended}
   */
  with(name, query) {
    const queryString = typeof query === 'string' ? query : query.toString();
    this.cteQueries.push(`${name} AS (${queryString})`);
    return this;
  }

  /**
   * Recursive CTE
   * @param {string} name - Nombre del CTE recursivo
   * @param {string} baseQuery - Query base
   * @param {string} recursiveQuery - Query recursiva
   * @returns {PostgreSQLExtended}
   */
  withRecursive(name, baseQuery, recursiveQuery) {
    const fullQuery = `${baseQuery} UNION ALL ${recursiveQuery}`;
    this.cteQueries.push(`${name} AS (${fullQuery})`);
    this.isRecursive = true;
    return this;
  }

  // ===== ARRAY OPERATIONS =====

  /**
   * Operador @> para arrays (contains)
   * @param {string} column - Columna array
   * @param {array|string} values - Valores a buscar
   * @returns {PostgreSQLExtended}
   */
  arrayContains(column, values) {
    const arrayStr = Array.isArray(values) ? values : [values];
    return this.where(`${column}`, '@>', `ARRAY[${arrayStr.map(v => `'${v}'`).join(', ')}]`);
  }

  /**
   * Operador <@ para arrays (contained by)
   * @param {string} column - Columna array
   * @param {array} values - Array contenedor
   * @returns {PostgreSQLExtended}
   */
  arrayContainedBy(column, values) {
    const arrayStr = Array.isArray(values) ? values : [values];
    return this.where(`${column}`, '<@', `ARRAY[${arrayStr.map(v => `'${v}'`).join(', ')}]`);
  }

  /**
   * Operador && para arrays (overlap)
   * @param {string} column - Columna array
   * @param {array} values - Valores que se solapan
   * @returns {PostgreSQLExtended}
   */
  arrayOverlaps(column, values) {
    const arrayStr = Array.isArray(values) ? values : [values];
    return this.where(`${column}`, '&&', `ARRAY[${arrayStr.map(v => `'${v}'`).join(', ')}]`);
  }

  /**
   * Función array_length() con comparación
   * @param {string} column - Columna array
   * @param {string} operator - Operador de comparación
   * @param {number} value - Valor a comparar
   * @returns {PostgreSQLExtended}
   */
  arrayLength(column, operator, value) {
    return this.where(`array_length(${column}, 1)`, operator, value);
  }

  /**
   * Función array_agg() en SELECT
   * @param {string} column - Columna a agregar
   * @param {string} alias - Alias para el resultado
   * @param {string} orderBy - Ordenamiento opcional
   * @returns {PostgreSQLExtended}
   */
  arrayAgg(column, alias = 'array_values', orderBy = null) {
    let func = `array_agg(${column}`;
    if (orderBy) {
      func += ` ORDER BY ${orderBy}`;
    }
    func += `)`;
    return this.selectRaw(`${func} AS ${alias}`);
  }

  // ===== FULL-TEXT SEARCH =====

  /**
   * Búsqueda de texto completo
   * @param {string} column - Columna de texto o tsvector
   * @param {string} query - Query de búsqueda
   * @param {string} language - Idioma (default: english)
   * @returns {PostgreSQLExtended}
   */
  fullTextSearch(column, query, language = 'english') {
    const tsVector = `to_tsvector('${language}', ${column})`;
    const tsQuery = `plainto_tsquery('${language}', '${query}')`;
    return this.where(`${tsVector}`, '@@', tsQuery);
  }

  /**
   * Ranking de búsqueda de texto completo
   * @param {string} column - Columna de texto
   * @param {string} query - Query de búsqueda
   * @param {string} language - Idioma
   * @param {string} alias - Alias para el resultado
   * @returns {PostgreSQLExtended}
   */
  fullTextRank(column, query, language = 'english', alias = 'rank') {
    const tsVector = `to_tsvector('${language}', ${column})`;
    const tsQuery = `plainto_tsquery('${language}', '${query}')`;
    return this.selectRaw(`ts_rank(${tsVector}, ${tsQuery}) AS ${alias}`);
  }

  /**
   * Headline de búsqueda de texto completo
   * @param {string} column - Columna de texto
   * @param {string} query - Query de búsqueda
   * @param {string} language - Idioma
   * @param {string} alias - Alias para el resultado
   * @returns {PostgreSQLExtended}
   */
  fullTextHeadline(column, query, language = 'english', alias = 'highlight') {
    const tsQuery = `plainto_tsquery('${language}', '${query}')`;
    return this.selectRaw(`ts_headline('${language}', ${column}, ${tsQuery}) AS ${alias}`);
  }

  // ===== REGEX OPERATIONS =====

  /**
   * Operador ~ (regex match)
   * @param {string} column - Columna
   * @param {string} pattern - Patrón regex
   * @returns {PostgreSQLExtended}
   */
  regexMatch(column, pattern) {
    return this.whereRaw(`${column} ~ '${pattern}'`);
  }

  /**
   * Operador ~* (regex match case insensitive)
   * @param {string} column - Columna
   * @param {string} pattern - Patrón regex
   * @returns {PostgreSQLExtended}
   */
  regexMatchCI(column, pattern) {
    return this.whereRaw(`${column} ~* '${pattern}'`);
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Función COALESCE
   * @param {...string} values - Valores
   * @returns {string}
   */
  coalesce(...values) {
    return `COALESCE(${values.join(', ')})`;
  }

  /**
   * Función NULLIF
   * @param {string} value1 - Primer valor
   * @param {string} value2 - Segundo valor
   * @returns {string}
   */
  nullif(value1, value2) {
    return `NULLIF(${value1}, ${value2})`;
  }

  /**
   * Función GREATEST
   * @param {...string} values - Valores
   * @returns {string}
   */
  greatest(...values) {
    return `GREATEST(${values.join(', ')})`;
  }

  /**
   * Función LEAST
   * @param {...string} values - Valores
   * @returns {string}
   */
  least(...values) {
    return `LEAST(${values.join(', ')})`;
  }

  // ===== HELPER METHODS =====

  /**
   * Genera cláusula ON CONFLICT
   * @private
   * @returns {string}
   */
  buildConflictClause() {
    if (!this.conflictTarget || !this.conflictAction) {
      return '';
    }

    let clause = 'ON CONFLICT ';

    if (typeof this.conflictTarget === 'string' && this.conflictTarget.startsWith('ON CONSTRAINT')) {
      clause += this.conflictTarget;
    } else {
      clause += `(${Array.isArray(this.conflictTarget) ? this.conflictTarget.join(', ') : this.conflictTarget})`;
    }

    if (this.conflictAction.type === 'nothing') {
      clause += ' DO NOTHING';
    } else if (this.conflictAction.type === 'update') {
      const updates = Object.entries(this.conflictAction.values)
        .map(([key, value]) => {
          if (value === 'EXCLUDED') {
            return `${key} = EXCLUDED.${key}`;
          }
          return `${key} = ${value}`;
        })
        .join(', ');
      clause += ` DO UPDATE SET ${updates}`;
    }

    return clause;
  }

  /**
   * Override toString para procesar características específicas de PostgreSQL
   * @returns {string}
   */
  toString() {
    let sql = '';

    // Agregar CTEs si existen
    if (this.cteQueries && this.cteQueries.length > 0) {
      const ctePrefix = this.isRecursive ? 'WITH RECURSIVE ' : 'WITH ';
      sql += `${ctePrefix}${this.cteQueries.join(', ')}\n`;
    }

    // Llamar al toString del Core para generar SQL base
    const baseSql = super.toString();
    sql += baseSql;

    // Agregar cláusula ON CONFLICT si existe
    const conflictClause = this.buildConflictClause();
    if (conflictClause) {
      sql += `\n${conflictClause}`;
    }

    return sql;
  }

  /**
   * Información del dialecto
   * @returns {object}
   */
  getDialectInfo() {
    return {
      name: 'PostgreSQL Extended',
      version: this.version,
      features: this.features,
      supportedTypes: Object.keys(this.pgTypes),
      supportedOperators: Object.keys(this.pgOperators),
      supportedFunctions: Object.keys(this.pgFunctions)
    };
  }

  /**
   * Clona la instancia actual para crear queries independientes
   * @returns {PostgreSQLExtended}
   */
  clone() {
    const clone = new PostgreSQLExtended(this.connection);
    clone.q = [...this.q];
    clone.cteQueries = [...this.cteQueries];
    clone.conflictTarget = this.conflictTarget;
    clone.conflictAction = this.conflictAction;
    clone.isRecursive = this.isRecursive;
    return clone;
  }
}

export default PostgreSQLExtended;