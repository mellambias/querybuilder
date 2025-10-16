/**
 * @fileoverview Cassandra QueryBuilder - Integración para Apache Cassandra
 * @description Clase especializada para Apache Cassandra que extiende Core con funcionalidades NoSQL distribuidas.
 * Soporta CQL operations, keyspaces, tablas, UDT, colecciones y características específicas de Cassandra.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * // Crear instancia Cassandra
 * const cassandra = new Cassandra({
 *   contactPoints: ['127.0.0.1'],
 *   localDataCenter: 'datacenter1',
 *   keyspace: 'myapp'
 * });
 * 
 * // Crear keyspace
 * const keyspaceSQL = cassandra.createKeyspace('myapp', {
 *   replication: {
 *     class: 'SimpleStrategy',
 *     replication_factor: 3
 *   }
 * });
 */
import cassandra from 'cassandra-driver';
import Core from '@querybuilder/core/core.js';
import cassandraCommands from './comandos/cassandra.js';
import { log, Types } from '@querybuilder/core/utils/utils.js';

/**
 * Clase Cassandra QueryBuilder para operaciones específicas de Apache Cassandra
 * @class Cassandra
 * @extends Core
 * @description Integración de Apache Cassandra para aplicaciones Big Data distribuidas.
 * Soporta operaciones CQL, keyspaces, tablas, tipos definidos por usuario y colecciones.
 * @since 1.0.0
 */
class Cassandra extends Core {
  /**
   * Constructor de la clase Cassandra
   * @description Inicializa una nueva instancia del QueryBuilder para Cassandra
   * @constructor
   * @param {Object} [options={}] - Opciones de configuración para Cassandra
   * @param {Array<string>} [options.contactPoints=['127.0.0.1']] - Puntos de contacto del cluster
   * @param {string} [options.localDataCenter='datacenter1'] - Datacenter local
   * @param {string} [options.keyspace] - Keyspace por defecto
   * @param {Object} [options.credentials] - Credenciales de autenticación
   * @since 1.0.0
   * @example
   * const cassandra = new Cassandra({
   *   contactPoints: ['192.168.1.100', '192.168.1.101'],
   *   localDataCenter: 'datacenter1',
   *   keyspace: 'production'
   * });
   */
  constructor(options = {}) {
    super();
    /**
     * Tipo de base de datos - siempre 'cassandra'
     * @type {string}
     */
    this.dataType = "cassandra";
    /**
     * Cliente Cassandra
     * @type {Object|null}
     */
    this.client = null;
    /**
     * Keyspace actual
     * @type {string|null}
     */
    this.keyspace = null;
    /**
     * Nivel de consistencia por defecto
     * @type {number}
     */
    this.consistencyLevel = cassandra.types.consistencies.quorum;

    /**
     * Configuración Cassandra específica
     * @type {Object}
     */
    this.config = {
      contactPoints: options.contactPoints || ['127.0.0.1'],
      localDataCenter: options.localDataCenter || 'datacenter1',
      keyspace: options.keyspace || null,
      credentials: options.credentials || null,
      pooling: options.pooling || {},
      socketOptions: options.socketOptions || {},
      ...options
    };

    // Initialize Cassandra commands and functions
    this.initializeCassandraCommands();
    this.initializeDataTypes();
    this.initializeConsistencyLevels();
  }

  /**
   * Initialize Cassandra-specific commands
   */
  initializeCassandraCommands() {
    this.commands = cassandraCommands;

    // Keyspace operations
    this.createKeyspace = (name, options = {}) => this.executeKeyspaceOperation('CREATE', name, options);
    this.dropKeyspace = (name) => this.executeKeyspaceOperation('DROP', name);
    this.useKeyspace = (name) => this.setKeyspace(name);

    // Table operations
    this.createTable = (name, columns, options = {}) => this.executeTableOperation('CREATE', name, columns, options);
    this.dropTable = (name) => this.executeTableOperation('DROP', name);
    this.alterTable = (name, alterations) => this.executeTableOperation('ALTER', name, alterations);

    // Index operations
    this.createIndex = (name, table, column, options = {}) => this.executeIndexOperation('CREATE', name, table, column, options);
    this.dropIndex = (name) => this.executeIndexOperation('DROP', name);

    // UDT (User Defined Types) operations
    this.createType = (name, fields) => this.executeTypeOperation('CREATE', name, fields);
    this.dropType = (name) => this.executeTypeOperation('DROP', name);
    this.alterType = (name, alterations) => this.executeTypeOperation('ALTER', name, alterations);
  }

  /**
   * Initialize Cassandra data types
   */
  initializeDataTypes() {
    this.dataTypes = {
      // Basic types
      ascii: 'ascii',
      bigint: 'bigint',
      blob: 'blob',
      boolean: 'boolean',
      counter: 'counter',
      date: 'date',
      decimal: 'decimal',
      double: 'double',
      duration: 'duration',
      float: 'float',
      inet: 'inet',
      int: 'int',
      smallint: 'smallint',
      text: 'text',
      time: 'time',
      timestamp: 'timestamp',
      timeuuid: 'timeuuid',
      tinyint: 'tinyint',
      uuid: 'uuid',
      varchar: 'varchar',
      varint: 'varint',

      // Collection types
      list: (type) => `list<${type}>`,
      set: (type) => `set<${type}>`,
      map: (keyType, valueType) => `map<${keyType}, ${valueType}>`,
      tuple: (...types) => `tuple<${types.join(', ')}>`,

      // Frozen collections
      frozen: (type) => `frozen<${type}>`
    };
  }

  /**
   * Initialize consistency levels
   */
  initializeConsistencyLevels() {
    this.consistency = {
      any: cassandra.types.consistencies.any,
      one: cassandra.types.consistencies.one,
      two: cassandra.types.consistencies.two,
      three: cassandra.types.consistencies.three,
      quorum: cassandra.types.consistencies.quorum,
      all: cassandra.types.consistencies.all,
      localQuorum: cassandra.types.consistencies.localQuorum,
      eachQuorum: cassandra.types.consistencies.eachQuorum,
      localOne: cassandra.types.consistencies.localOne
    };
  }

  /**
   * Connect to Cassandra cluster
   */
  async connect() {
    try {
      this.client = new cassandra.Client(this.config);
      await this.client.connect();

      if (this.config.keyspace) {
        await this.setKeyspace(this.config.keyspace);
      }

      log('Connected to Cassandra cluster');
      return this;
    } catch (error) {
      log('Error connecting to Cassandra:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Cassandra cluster
   */
  async disconnect() {
    if (this.client) {
      await this.client.shutdown();
      this.client = null;
      log('Disconnected from Cassandra cluster');
    }
  }

  /**
   * Set consistency level for operations
   */
  setConsistencyLevel(level) {
    if (typeof level === 'string') {
      this.consistencyLevel = this.consistency[level];
    } else {
      this.consistencyLevel = level;
    }
    return this;
  }

  /**
   * Set keyspace for operations
   */
  async setKeyspace(keyspace) {
    this.keyspace = keyspace;
    if (this.client) {
      await this.client.execute(`USE ${keyspace}`);
    }
    return this;
  }

  /**
   * Execute CQL query
   */
  async execute(query, params = [], options = {}) {
    if (!this.client) {
      throw new Error('Not connected to Cassandra. Call connect() first.');
    }

    const executeOptions = {
      consistency: options.consistency || this.consistencyLevel,
      prepare: options.prepare !== false,
      ...options
    };

    try {
      const result = await this.client.execute(query, params, executeOptions);
      return this.formatResult(result);
    } catch (error) {
      log('Error executing CQL query:', error);
      throw error;
    }
  }

  /**
   * Execute prepared statement
   */
  async executePrepared(query, params = [], options = {}) {
    if (!this.client) {
      throw new Error('Not connected to Cassandra. Call connect() first.');
    }

    try {
      const prepared = await this.client.prepare(query);
      const result = await this.client.execute(prepared, params, {
        consistency: options.consistency || this.consistencyLevel,
        ...options
      });
      return this.formatResult(result);
    } catch (error) {
      log('Error executing prepared statement:', error);
      throw error;
    }
  }

  /**
   * Execute batch operations
   */
  async executeBatch(queries, options = {}) {
    if (!this.client) {
      throw new Error('Not connected to Cassandra. Call connect() first.');
    }

    const batchOptions = {
      consistency: options.consistency || this.consistencyLevel,
      logged: options.logged !== false,
      ...options
    };

    try {
      const result = await this.client.batch(queries, batchOptions);
      return this.formatResult(result);
    } catch (error) {
      log('Error executing batch:', error);
      throw error;
    }
  }

  /**
   * Format query result
   */
  formatResult(result) {
    return {
      rows: result.rows || [],
      rowsCount: result.rowLength || 0,
      info: result.info || {},
      pageState: result.pageState,
      nextPage: result.nextPage ? () => result.nextPage() : null,
      wasApplied: () => result.wasApplied(),
      first: () => result.first(),
      columns: result.columns || []
    };
  }

  /**
   * Create/Drop keyspace operations
   */
  async executeKeyspaceOperation(operation, name, options = {}) {
    let query;

    if (operation === 'CREATE') {
      const replication = options.replication || {
        class: 'SimpleStrategy',
        replication_factor: 1
      };

      const replicationStr = Object.entries(replication)
        .map(([key, value]) => `'${key}': ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(', ');

      query = `CREATE KEYSPACE ${options.ifNotExists ? 'IF NOT EXISTS ' : ''}${name} 
                     WITH REPLICATION = {${replicationStr}}`;

      if (options.durableWrites !== undefined) {
        query += ` AND DURABLE_WRITES = ${options.durableWrites}`;
      }
    } else if (operation === 'DROP') {
      query = `DROP KEYSPACE ${options.ifExists ? 'IF EXISTS ' : ''}${name}`;
    }

    return await this.execute(query);
  }

  /**
   * Table operations
   */
  async executeTableOperation(operation, name, columns, options = {}) {
    let query;

    if (operation === 'CREATE') {
      const columnDefs = Object.entries(columns)
        .map(([col, type]) => `${col} ${type}`)
        .join(', ');

      query = `CREATE TABLE ${options.ifNotExists ? 'IF NOT EXISTS ' : ''}${name} (${columnDefs}`;

      if (options.primaryKey) {
        if (Array.isArray(options.primaryKey)) {
          query += `, PRIMARY KEY (${options.primaryKey.join(', ')})`;
        } else {
          query += `, PRIMARY KEY (${options.primaryKey})`;
        }
      }

      query += ')';

      // Add table options
      const tableOptions = [];
      if (options.clusteringOrder) {
        tableOptions.push(`CLUSTERING ORDER BY (${options.clusteringOrder})`);
      }
      if (options.compaction) {
        const compactionStr = Object.entries(options.compaction)
          .map(([key, value]) => `'${key}': '${value}'`)
          .join(', ');
        tableOptions.push(`compaction = {${compactionStr}}`);
      }
      if (options.compression) {
        const compressionStr = Object.entries(options.compression)
          .map(([key, value]) => `'${key}': '${value}'`)
          .join(', ');
        tableOptions.push(`compression = {${compressionStr}}`);
      }

      if (tableOptions.length > 0) {
        query += ` WITH ${tableOptions.join(' AND ')}`;
      }

    } else if (operation === 'DROP') {
      query = `DROP TABLE ${options.ifExists ? 'IF EXISTS ' : ''}${name}`;
    } else if (operation === 'ALTER') {
      // columns parameter becomes alterations for ALTER
      const alterations = columns;
      query = `ALTER TABLE ${name} ${alterations}`;
    }

    return await this.execute(query);
  }

  /**
   * Index operations
   */
  async executeIndexOperation(operation, name, table, column, options = {}) {
    let query;

    if (operation === 'CREATE') {
      query = `CREATE ${options.custom ? 'CUSTOM ' : ''}INDEX ${options.ifNotExists ? 'IF NOT EXISTS ' : ''}${name}`;
      query += ` ON ${table} (${column})`;

      if (options.using) {
        query += ` USING '${options.using}'`;
      }
      if (options.withOptions) {
        const optionsStr = Object.entries(options.withOptions)
          .map(([key, value]) => `'${key}': '${value}'`)
          .join(', ');
        query += ` WITH OPTIONS = {${optionsStr}}`;
      }
    } else if (operation === 'DROP') {
      query = `DROP INDEX ${options.ifExists ? 'IF EXISTS ' : ''}${name}`;
    }

    return await this.execute(query);
  }

  /**
   * UDT (User Defined Type) operations
   */
  async executeTypeOperation(operation, name, fields) {
    let query;

    if (operation === 'CREATE') {
      const fieldDefs = Object.entries(fields)
        .map(([field, type]) => `${field} ${type}`)
        .join(', ');
      query = `CREATE TYPE ${name} (${fieldDefs})`;
    } else if (operation === 'DROP') {
      query = `DROP TYPE ${name}`;
    } else if (operation === 'ALTER') {
      // fields parameter becomes alterations for ALTER
      const alterations = fields;
      query = `ALTER TYPE ${name} ${alterations}`;
    }

    return await this.execute(query);
  }

  /**
   * Insert data into table
   */
  async insert(table, data, options = {}) {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);

    let query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    if (options.ifNotExists) {
      query += ' IF NOT EXISTS';
    }
    if (options.using) {
      const usingClauses = [];
      if (options.using.ttl) {
        usingClauses.push(`TTL ${options.using.ttl}`);
      }
      if (options.using.timestamp) {
        usingClauses.push(`TIMESTAMP ${options.using.timestamp}`);
      }
      if (usingClauses.length > 0) {
        query += ` USING ${usingClauses.join(' AND ')}`;
      }
    }

    return await this.execute(query, values, options);
  }

  /**
   * Update data in table
   */
  async update(table, data, where, options = {}) {
    const setClause = Object.entries(data)
      .map(([col, value]) => `${col} = ?`)
      .join(', ');
    const values = Object.values(data);

    let query = `UPDATE ${table}`;

    if (options.using) {
      const usingClauses = [];
      if (options.using.ttl) {
        usingClauses.push(`TTL ${options.using.ttl}`);
      }
      if (options.using.timestamp) {
        usingClauses.push(`TIMESTAMP ${options.using.timestamp}`);
      }
      if (usingClauses.length > 0) {
        query += ` USING ${usingClauses.join(' AND ')}`;
      }
    }

    query += ` SET ${setClause}`;

    if (where) {
      const { whereClause, whereValues } = this.buildWhereClause(where);
      query += ` WHERE ${whereClause}`;
      values.push(...whereValues);
    }

    if (options.if) {
      query += ` IF ${options.if}`;
    }

    return await this.execute(query, values, options);
  }

  /**
   * Delete data from table
   */
  async delete(table, where, options = {}) {
    let query = `DELETE FROM ${table}`;
    let values = [];

    if (options.columns) {
      query = `DELETE ${options.columns.join(', ')} FROM ${table}`;
    }

    if (options.using && options.using.timestamp) {
      query += ` USING TIMESTAMP ${options.using.timestamp}`;
    }

    if (where) {
      const { whereClause, whereValues } = this.buildWhereClause(where);
      query += ` WHERE ${whereClause}`;
      values = whereValues;
    }

    if (options.if) {
      query += ` IF ${options.if}`;
    }

    return await this.execute(query, values, options);
  }

  /**
   * Select data from table
   */
  async select(table, options = {}) {
    let query = 'SELECT ';

    if (options.columns) {
      if (Array.isArray(options.columns)) {
        query += options.columns.join(', ');
      } else {
        query += options.columns;
      }
    } else {
      query += '*';
    }

    query += ` FROM ${table}`;

    let values = [];
    if (options.where) {
      const { whereClause, whereValues } = this.buildWhereClause(options.where);
      query += ` WHERE ${whereClause}`;
      values = whereValues;
    }

    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    if (options.allowFiltering) {
      query += ' ALLOW FILTERING';
    }

    return await this.execute(query, values, options);
  }

  /**
   * Build WHERE clause for CQL
   */
  buildWhereClause(where) {
    const conditions = [];
    const values = [];

    for (const [column, condition] of Object.entries(where)) {
      if (typeof condition === 'object' && condition !== null) {
        if (condition.in) {
          const placeholders = condition.in.map(() => '?').join(', ');
          conditions.push(`${column} IN (${placeholders})`);
          values.push(...condition.in);
        } else if (condition.gt !== undefined) {
          conditions.push(`${column} > ?`);
          values.push(condition.gt);
        } else if (condition.gte !== undefined) {
          conditions.push(`${column} >= ?`);
          values.push(condition.gte);
        } else if (condition.lt !== undefined) {
          conditions.push(`${column} < ?`);
          values.push(condition.lt);
        } else if (condition.lte !== undefined) {
          conditions.push(`${column} <= ?`);
          values.push(condition.lte);
        } else if (condition.contains) {
          conditions.push(`${column} CONTAINS ?`);
          values.push(condition.contains);
        } else if (condition.containsKey) {
          conditions.push(`${column} CONTAINS KEY ?`);
          values.push(condition.containsKey);
        }
      } else {
        conditions.push(`${column} = ?`);
        values.push(condition);
      }
    }

    return {
      whereClause: conditions.join(' AND '),
      whereValues: values
    };
  }

  /**
   * Generate UUID
   */
  uuid() {
    return cassandra.types.Uuid.random();
  }

  /**
   * Generate TimeUUID
   */
  timeUuid() {
    return cassandra.types.TimeUuid.now();
  }

  /**
   * Get cluster metadata
   */
  getMetadata() {
    if (!this.client) {
      throw new Error('Not connected to Cassandra. Call connect() first.');
    }
    return this.client.metadata;
  }

  /**
   * Get keyspace metadata
   */
  getKeyspaceMetadata(keyspace) {
    const metadata = this.getMetadata();
    return metadata.keyspaces[keyspace || this.keyspace];
  }

  /**
   * Get table metadata
   */
  getTableMetadata(table, keyspace) {
    const ksMetadata = this.getKeyspaceMetadata(keyspace);
    return ksMetadata ? ksMetadata.tables[table] : null;
  }

  /**
   * Override toString to return CQL instead of SQL
   */
  toString() {
    // This would integrate with the QueryBuilder pattern
    // For now, return a basic identification
    return '[Cassandra QueryBuilder Instance]';
  }
}

export default Cassandra;