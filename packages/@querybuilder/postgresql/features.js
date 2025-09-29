/**
 * Características avanzadas específicas de PostgreSQL
 * Consolidado de CTEs, UPSERT, Window Functions, Full-Text Search, etc.
 */

/**
 * Builder para Common Table Expressions (CTE)
 */
export class CTEBuilder {
  constructor() {
    this.ctes = [];
    this.isRecursive = false;
  }

  /**
   * Añade un CTE simple
   * @param {string} name - Nombre del CTE
   * @param {string|object} query - Query del CTE
   * @returns {CTEBuilder}
   */
  with(name, query) {
    const queryString = typeof query === 'string' ? query : query.toString();
    this.ctes.push({ name, query: queryString, recursive: false });
    return this;
  }

  /**
   * Añade un CTE recursivo
   * @param {string} name - Nombre del CTE
   * @param {string} baseQuery - Query base
   * @param {string} recursiveQuery - Query recursiva
   * @returns {CTEBuilder}
   */
  withRecursive(name, baseQuery, recursiveQuery) {
    const fullQuery = `${baseQuery} UNION ALL ${recursiveQuery}`;
    this.ctes.push({ name, query: fullQuery, recursive: true });
    this.isRecursive = true;
    return this;
  }

  /**
   * Construye la cláusula WITH
   * @returns {string}
   */
  build() {
    if (this.ctes.length === 0) return '';

    const prefix = this.isRecursive ? 'WITH RECURSIVE ' : 'WITH ';
    const cteStrings = this.ctes.map(cte => `${cte.name} AS (${cte.query})`);
    return prefix + cteStrings.join(', ');
  }

  /**
   * Limpia todos los CTEs
   * @returns {CTEBuilder}
   */
  clear() {
    this.ctes = [];
    this.isRecursive = false;
    return this;
  }
}

/**
 * Builder para operaciones UPSERT (INSERT ... ON CONFLICT)
 */
export class UpsertBuilder {
  constructor() {
    this.conflictTarget = null;
    this.conflictAction = null;
    this.whereClause = null;
  }

  /**
   * Define las columnas de conflicto
   * @param {string|Array} columns - Columnas de conflicto
   * @returns {UpsertBuilder}
   */
  onConflict(columns) {
    this.conflictTarget = {
      type: 'columns',
      value: Array.isArray(columns) ? columns : [columns]
    };
    return this;
  }

  /**
   * Define constraint de conflicto
   * @param {string} constraint - Nombre del constraint
   * @returns {UpsertBuilder}
   */
  onConflictConstraint(constraint) {
    this.conflictTarget = {
      type: 'constraint',
      value: constraint
    };
    return this;
  }

  /**
   * Define acción DO UPDATE
   * @param {object} values - Valores a actualizar
   * @returns {UpsertBuilder}
   */
  doUpdate(values) {
    this.conflictAction = {
      type: 'update',
      values: values
    };
    return this;
  }

  /**
   * Define acción DO NOTHING
   * @returns {UpsertBuilder}
   */
  doNothing() {
    this.conflictAction = {
      type: 'nothing'
    };
    return this;
  }

  /**
   * Añade cláusula WHERE para DO UPDATE
   * @param {string} condition - Condición WHERE
   * @returns {UpsertBuilder}
   */
  where(condition) {
    this.whereClause = condition;
    return this;
  }

  /**
   * Construye la cláusula ON CONFLICT
   * @returns {string}
   */
  build() {
    if (!this.conflictTarget || !this.conflictAction) {
      throw new Error('Both conflict target and action must be specified');
    }

    let clause = 'ON CONFLICT ';

    if (this.conflictTarget.type === 'columns') {
      clause += `(${this.conflictTarget.value.join(', ')})`;
    } else {
      clause += `ON CONSTRAINT ${this.conflictTarget.value}`;
    }

    if (this.conflictAction.type === 'nothing') {
      clause += ' DO NOTHING';
    } else {
      const updates = Object.entries(this.conflictAction.values)
        .map(([key, value]) => {
          if (value === 'EXCLUDED') {
            return `${key} = EXCLUDED.${key}`;
          }
          return `${key} = ${value}`;
        })
        .join(', ');

      clause += ` DO UPDATE SET ${updates}`;

      if (this.whereClause) {
        clause += ` WHERE ${this.whereClause}`;
      }
    }

    return clause;
  }
}

/**
 * Builder para Window Functions
 */
export class WindowBuilder {
  constructor() {
    this.partitions = [];
    this.orders = [];
    this.frame = null;
  }

  /**
   * Define PARTITION BY
   * @param {...string} columns - Columnas de partición
   * @returns {WindowBuilder}
   */
  partitionBy(...columns) {
    this.partitions = columns.flat();
    return this;
  }

  /**
   * Define ORDER BY
   * @param {...string} columns - Columnas de ordenamiento
   * @returns {WindowBuilder}
   */
  orderBy(...columns) {
    this.orders = columns.flat();
    return this;
  }

  /**
   * Define frame de filas
   * @param {string} start - Inicio del frame
   * @param {string} end - Fin del frame (opcional)
   * @returns {WindowBuilder}
   */
  rows(start, end = null) {
    this.frame = {
      type: 'ROWS',
      start: start,
      end: end
    };
    return this;
  }

  /**
   * Define frame de rango
   * @param {string} start - Inicio del frame
   * @param {string} end - Fin del frame (opcional)
   * @returns {WindowBuilder}
   */
  range(start, end = null) {
    this.frame = {
      type: 'RANGE',
      start: start,
      end: end
    };
    return this;
  }

  /**
   * Construye la cláusula OVER
   * @returns {string}
   */
  build() {
    let clause = 'OVER (';
    let parts = [];

    if (this.partitions.length > 0) {
      parts.push(`PARTITION BY ${this.partitions.join(', ')}`);
    }

    if (this.orders.length > 0) {
      parts.push(`ORDER BY ${this.orders.join(', ')}`);
    }

    if (this.frame) {
      let frameClause = this.frame.type;
      if (this.frame.end) {
        frameClause += ` BETWEEN ${this.frame.start} AND ${this.frame.end}`;
      } else {
        frameClause += ` ${this.frame.start}`;
      }
      parts.push(frameClause);
    }

    clause += parts.join(' ');
    clause += ')';

    return clause;
  }
}

/**
 * Builder para consultas de texto completo
 */
export class FullTextSearchBuilder {
  constructor() {
    this.language = 'english';
    this.vector = null;
    this.query = null;
    this.ranking = false;
    this.headline = false;
    this.weights = null;
  }

  /**
   * Define el idioma
   * @param {string} lang - Idioma
   * @returns {FullTextSearchBuilder}
   */
  setLanguage(lang) {
    this.language = lang;
    return this;
  }

  /**
   * Define el vector de búsqueda
   * @param {string} text - Texto o columna
   * @param {string} weight - Peso opcional (A, B, C, D)
   * @returns {FullTextSearchBuilder}
   */
  vector(text, weight = null) {
    this.vector = `to_tsvector('${this.language}', ${text})`;
    if (weight) {
      this.vector = `setweight(${this.vector}, '${weight}')`;
    }
    return this;
  }

  /**
   * Define múltiples vectores con pesos
   * @param {Array} vectors - Array de {text, weight}
   * @returns {FullTextSearchBuilder}
   */
  weightedVectors(vectors) {
    const weightedVectors = vectors.map(v =>
      `setweight(to_tsvector('${this.language}', ${v.text}), '${v.weight}')`
    );
    this.vector = weightedVectors.join(' || ');
    return this;
  }

  /**
   * Define la query de búsqueda
   * @param {string} searchText - Texto de búsqueda
   * @param {string} type - Tipo de query (tsquery, plainto_tsquery, etc.)
   * @returns {FullTextSearchBuilder}
   */
  query(searchText, type = 'plainto_tsquery') {
    this.query = `${type}('${this.language}', '${searchText}')`;
    return this;
  }

  /**
   * Query con operadores específicos
   * @param {string} searchText - Texto con operadores (&, |, !)
   * @returns {FullTextSearchBuilder}
   */
  queryWithOperators(searchText) {
    this.query = `to_tsquery('${this.language}', '${searchText}')`;
    return this;
  }

  /**
   * Query para búsqueda web
   * @param {string} searchText - Texto de búsqueda web
   * @returns {FullTextSearchBuilder}
   */
  webSearch(searchText) {
    this.query = `websearch_to_tsquery('${this.language}', '${searchText}')`;
    return this;
  }

  /**
   * Habilita ranking
   * @param {Array} weights - Pesos opcionales [D-weight, C-weight, B-weight, A-weight]
   * @returns {FullTextSearchBuilder}
   */
  withRanking(weights = null) {
    this.ranking = true;
    this.weights = weights;
    return this;
  }

  /**
   * Habilita headline
   * @param {object} options - Opciones de headline
   * @returns {FullTextSearchBuilder}
   */
  withHeadline(options = {}) {
    this.headline = { enabled: true, ...options };
    return this;
  }

  /**
   * Construye la condición de búsqueda
   * @returns {string}
   */
  buildCondition() {
    if (!this.vector || !this.query) {
      throw new Error('Both vector and query must be defined');
    }
    return `${this.vector} @@ ${this.query}`;
  }

  /**
   * Construye expresión de ranking
   * @returns {string}
   */
  buildRanking() {
    if (!this.vector || !this.query) {
      throw new Error('Both vector and query must be defined');
    }
    if (this.weights) {
      return `ts_rank('{${this.weights.join(',')}}', ${this.vector}, ${this.query})`;
    }
    return `ts_rank(${this.vector}, ${this.query})`;
  }

  /**
   * Construye expresión de headline
   * @param {string} text - Texto original
   * @returns {string}
   */
  buildHeadline(text) {
    if (!this.query) {
      throw new Error('Query must be defined');
    }
    let options = '';
    if (this.headline && typeof this.headline === 'object') {
      const opts = [];
      if (this.headline.startSel) opts.push(`StartSel=${this.headline.startSel}`);
      if (this.headline.stopSel) opts.push(`StopSel=${this.headline.stopSel}`);
      if (this.headline.maxWords) opts.push(`MaxWords=${this.headline.maxWords}`);
      if (this.headline.minWords) opts.push(`MinWords=${this.headline.minWords}`);
      if (opts.length > 0) {
        options = `, '${opts.join(', ')}'`;
      }
    }
    return `ts_headline('${this.language}', ${text}, ${this.query}${options})`;
  }
}

/**
 * Builder para particionado de tablas
 */
export class PartitionBuilder {
  constructor() {
    this.partitionType = null;
    this.partitionKey = null;
    this.partitions = [];
  }

  /**
   * Define particionado por rango
   * @param {string} column - Columna de partición
   * @returns {PartitionBuilder}
   */
  range(column) {
    this.partitionType = 'RANGE';
    this.partitionKey = column;
    return this;
  }

  /**
   * Define particionado por lista
   * @param {string} column - Columna de partición
   * @returns {PartitionBuilder}
   */
  list(column) {
    this.partitionType = 'LIST';
    this.partitionKey = column;
    return this;
  }

  /**
   * Define particionado por hash
   * @param {string} column - Columna de partición
   * @returns {PartitionBuilder}
   */
  hash(column) {
    this.partitionType = 'HASH';
    this.partitionKey = column;
    return this;
  }

  /**
   * Añade una partición
   * @param {string} name - Nombre de la partición
   * @param {string} condition - Condición de la partición
   * @returns {PartitionBuilder}
   */
  addPartition(name, condition) {
    this.partitions.push({ name, condition });
    return this;
  }

  /**
   * Construye definición de tabla particionada
   * @param {string} tableName - Nombre de la tabla
   * @returns {string}
   */
  buildTableDefinition(tableName) {
    return `PARTITION BY ${this.partitionType} (${this.partitionKey})`;
  }

  /**
   * Construye comando de creación de partición
   * @param {string} partitionName - Nombre de la partición
   * @param {string} parentTable - Tabla padre
   * @param {string} condition - Condición de la partición
   * @returns {string}
   */
  buildPartitionCommand(partitionName, parentTable, condition) {
    return `CREATE TABLE ${partitionName} PARTITION OF ${parentTable} FOR VALUES ${condition}`;
  }
}

/**
 * Utilidades para extensiones de PostgreSQL
 */
export class ExtensionUtils {
  /**
   * Genera comando para crear extensión
   * @param {string} name - Nombre de la extensión
   * @param {object} options - Opciones
   * @returns {string}
   */
  static createExtension(name, options = {}) {
    let sql = `CREATE EXTENSION IF NOT EXISTS ${name}`;

    if (options.schema) {
      sql += ` SCHEMA ${options.schema}`;
    }

    if (options.version) {
      sql += ` VERSION '${options.version}'`;
    }

    if (options.cascade) {
      sql += ' CASCADE';
    }

    return sql;
  }

  /**
   * Genera comando para eliminar extensión
   * @param {string} name - Nombre de la extensión
   * @param {boolean} cascade - Si usar CASCADE
   * @returns {string}
   */
  static dropExtension(name, cascade = false) {
    let sql = `DROP EXTENSION IF EXISTS ${name}`;
    if (cascade) {
      sql += ' CASCADE';
    }
    return sql;
  }

  /**
   * Lista de extensiones comunes
   */
  static get COMMON_EXTENSIONS() {
    return {
      UUID_OSSP: 'uuid-ossp',
      PGCRYPTO: 'pgcrypto',
      HSTORE: 'hstore',
      LTREE: 'ltree',
      POSTGIS: 'postgis',
      PG_TRGM: 'pg_trgm',
      UNACCENT: 'unaccent',
      BTREE_GIN: 'btree_gin',
      BTREE_GIST: 'btree_gist'
    };
  }
}

/**
 * Exporta todas las características avanzadas
 */
export const AdvancedFeatures = {
  CTEBuilder,
  UpsertBuilder,
  WindowBuilder,
  FullTextSearchBuilder,
  PartitionBuilder,
  ExtensionUtils
};

// Helpers de conveniencia
export const createCTE = () => new CTEBuilder();
export const createUpsert = () => new UpsertBuilder();
export const createWindow = () => new WindowBuilder();
export const createFullTextSearch = () => new FullTextSearchBuilder();
export const createPartition = () => new PartitionBuilder();

export default AdvancedFeatures;