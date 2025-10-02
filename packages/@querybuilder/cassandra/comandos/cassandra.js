/**
 * Cassandra CQL commands and templates for QueryBuilder
 * Supports distributed database operations, keyspaces, tables, UDT, collections
 */

const cassandraCommands = {
  // Keyspace operations
  keyspace: {
    create: {
      orden: ['createKeyspace', 'keyspaceName', 'replication', 'durableWrites'],
      createKeyspace: 'CREATE KEYSPACE',
      keyspaceName: '{keyspaceName}',
      replication: 'WITH REPLICATION = {replication}',
      durableWrites: 'AND DURABLE_WRITES = {durableWrites}',
      defaults: {
        replication: "{'class': 'SimpleStrategy', 'replication_factor': 1}",
        durableWrites: true
      }
    },
    drop: {
      orden: ['dropKeyspace', 'keyspaceName'],
      dropKeyspace: 'DROP KEYSPACE',
      keyspaceName: '{keyspaceName}'
    },
    alter: {
      orden: ['alterKeyspace', 'keyspaceName', 'replication', 'durableWrites'],
      alterKeyspace: 'ALTER KEYSPACE',
      keyspaceName: '{keyspaceName}',
      replication: 'WITH REPLICATION = {replication}',
      durableWrites: 'AND DURABLE_WRITES = {durableWrites}'
    },
    use: {
      orden: ['useKeyspace', 'keyspaceName'],
      useKeyspace: 'USE',
      keyspaceName: '{keyspaceName}'
    }
  },

  // Table operations
  table: {
    create: {
      orden: ['createTable', 'tableName', 'columns', 'primaryKey', 'clusteringOrder', 'tableOptions'],
      createTable: 'CREATE TABLE',
      tableName: '{tableName}',
      columns: '({columns})',
      primaryKey: 'PRIMARY KEY ({primaryKey})',
      clusteringOrder: 'WITH CLUSTERING ORDER BY ({clusteringOrder})',
      tableOptions: 'AND {tableOptions}',
      defaults: {}
    },
    drop: {
      orden: ['dropTable', 'tableName'],
      dropTable: 'DROP TABLE',
      tableName: '{tableName}'
    },
    alter: {
      orden: ['alterTable', 'tableName', 'alterAction'],
      alterTable: 'ALTER TABLE',
      tableName: '{tableName}',
      alterAction: '{alterAction}'
    },
    truncate: {
      orden: ['truncateTable', 'tableName'],
      truncateTable: 'TRUNCATE TABLE',
      tableName: '{tableName}'
    }
  },

  // Index operations
  index: {
    create: {
      orden: ['createIndex', 'indexName', 'tableName', 'columnName', 'indexOptions'],
      createIndex: 'CREATE INDEX',
      indexName: '{indexName}',
      tableName: 'ON {tableName}',
      columnName: '({columnName})',
      indexOptions: 'USING \'{indexOptions}\''
    },
    drop: {
      orden: ['dropIndex', 'indexName'],
      dropIndex: 'DROP INDEX',
      indexName: '{indexName}'
    },
    createCustom: {
      orden: ['createCustomIndex', 'indexName', 'tableName', 'columnName', 'using', 'withOptions'],
      createCustomIndex: 'CREATE CUSTOM INDEX',
      indexName: '{indexName}',
      tableName: 'ON {tableName}',
      columnName: '({columnName})',
      using: 'USING \'{using}\'',
      withOptions: 'WITH OPTIONS = {withOptions}'
    }
  },

  // User Defined Types (UDT)
  type: {
    create: {
      orden: ['createType', 'typeName', 'fields'],
      createType: 'CREATE TYPE',
      typeName: '{typeName}',
      fields: '({fields})'
    },
    drop: {
      orden: ['dropType', 'typeName'],
      dropType: 'DROP TYPE',
      typeName: '{typeName}'
    },
    alter: {
      orden: ['alterType', 'typeName', 'alterAction'],
      alterType: 'ALTER TYPE',
      typeName: '{typeName}',
      alterAction: '{alterAction}'
    }
  },

  // Data manipulation
  insert: {
    standard: {
      orden: ['insertInto', 'tableName', 'columns', 'values', 'ifNotExists', 'using'],
      insertInto: 'INSERT INTO',
      tableName: '{tableName}',
      columns: '({columns})',
      values: 'VALUES ({values})',
      ifNotExists: 'IF NOT EXISTS',
      using: 'USING {using}'
    },
    json: {
      orden: ['insertInto', 'tableName', 'jsonData', 'ifNotExists', 'using'],
      insertInto: 'INSERT INTO',
      tableName: '{tableName}',
      jsonData: 'JSON \'{jsonData}\'',
      ifNotExists: 'IF NOT EXISTS',
      using: 'USING {using}'
    }
  },

  update: {
    standard: {
      orden: ['updateTable', 'tableName', 'using', 'setClause', 'whereClause', 'ifCondition'],
      updateTable: 'UPDATE',
      tableName: '{tableName}',
      using: 'USING {using}',
      setClause: 'SET {setClause}',
      whereClause: 'WHERE {whereClause}',
      ifCondition: 'IF {ifCondition}'
    },
    counter: {
      orden: ['updateTable', 'tableName', 'setCounters', 'whereClause'],
      updateTable: 'UPDATE',
      tableName: '{tableName}',
      setCounters: 'SET {setCounters}',
      whereClause: 'WHERE {whereClause}'
    }
  },

  delete: {
    standard: {
      orden: ['deleteFrom', 'columns', 'tableName', 'using', 'whereClause', 'ifCondition'],
      deleteFrom: 'DELETE',
      columns: '{columns}',
      tableName: 'FROM {tableName}',
      using: 'USING {using}',
      whereClause: 'WHERE {whereClause}',
      ifCondition: 'IF {ifCondition}'
    },
    truncate: {
      orden: ['truncateTable', 'tableName'],
      truncateTable: 'TRUNCATE',
      tableName: '{tableName}'
    }
  },

  select: {
    standard: {
      orden: ['selectClause', 'fromClause', 'whereClause', 'orderBy', 'limit', 'allowFiltering'],
      selectClause: 'SELECT {selectClause}',
      fromClause: 'FROM {fromClause}',
      whereClause: 'WHERE {whereClause}',
      orderBy: 'ORDER BY {orderBy}',
      limit: 'LIMIT {limit}',
      allowFiltering: 'ALLOW FILTERING'
    },
    count: {
      orden: ['selectCount', 'fromClause', 'whereClause'],
      selectCount: 'SELECT COUNT(*)',
      fromClause: 'FROM {fromClause}',
      whereClause: 'WHERE {whereClause}'
    },
    distinct: {
      orden: ['selectDistinct', 'columns', 'fromClause', 'whereClause', 'limit'],
      selectDistinct: 'SELECT DISTINCT',
      columns: '{columns}',
      fromClause: 'FROM {fromClause}',
      whereClause: 'WHERE {whereClause}',
      limit: 'LIMIT {limit}'
    }
  },

  // Batch operations
  batch: {
    logged: {
      orden: ['beginBatch', 'statements', 'applyBatch', 'using'],
      beginBatch: 'BEGIN BATCH',
      statements: '{statements}',
      applyBatch: 'APPLY BATCH',
      using: 'USING {using}'
    },
    unlogged: {
      orden: ['beginUnloggedBatch', 'statements', 'applyBatch', 'using'],
      beginUnloggedBatch: 'BEGIN UNLOGGED BATCH',
      statements: '{statements}',
      applyBatch: 'APPLY BATCH',
      using: 'USING {using}'
    },
    counter: {
      orden: ['beginCounterBatch', 'statements', 'applyBatch'],
      beginCounterBatch: 'BEGIN COUNTER BATCH',
      statements: '{statements}',
      applyBatch: 'APPLY BATCH'
    }
  },

  // Materialized views
  materializedView: {
    create: {
      orden: ['createView', 'viewName', 'selectClause', 'fromClause', 'whereClause', 'primaryKey', 'clusteringOrder'],
      createView: 'CREATE MATERIALIZED VIEW',
      viewName: '{viewName}',
      selectClause: 'AS SELECT {selectClause}',
      fromClause: 'FROM {fromClause}',
      whereClause: 'WHERE {whereClause}',
      primaryKey: 'PRIMARY KEY ({primaryKey})',
      clusteringOrder: 'WITH CLUSTERING ORDER BY ({clusteringOrder})'
    },
    drop: {
      orden: ['dropView', 'viewName'],
      dropView: 'DROP MATERIALIZED VIEW',
      viewName: '{viewName}'
    }
  },

  // Functions and aggregates
  function: {
    create: {
      orden: ['createFunction', 'functionName', 'parameters', 'calledOnNull', 'returns', 'language', 'functionBody'],
      createFunction: 'CREATE FUNCTION',
      functionName: '{functionName}',
      parameters: '({parameters})',
      calledOnNull: 'CALLED ON NULL INPUT',
      returns: 'RETURNS {returns}',
      language: 'LANGUAGE {language}',
      functionBody: 'AS \'{functionBody}\''
    },
    drop: {
      orden: ['dropFunction', 'functionName', 'parameters'],
      dropFunction: 'DROP FUNCTION',
      functionName: '{functionName}',
      parameters: '({parameters})'
    }
  },

  aggregate: {
    create: {
      orden: ['createAggregate', 'aggregateName', 'parameters', 'sfunc', 'stype', 'finalfunc', 'initcond'],
      createAggregate: 'CREATE AGGREGATE',
      aggregateName: '{aggregateName}',
      parameters: '({parameters})',
      sfunc: 'SFUNC {sfunc}',
      stype: 'STYPE {stype}',
      finalfunc: 'FINALFUNC {finalfunc}',
      initcond: 'INITCOND {initcond}'
    },
    drop: {
      orden: ['dropAggregate', 'aggregateName', 'parameters'],
      dropAggregate: 'DROP AGGREGATE',
      aggregateName: '{aggregateName}',
      parameters: '({parameters})'
    }
  },

  // Consistency and timing
  consistency: {
    levels: [
      'ANY', 'ONE', 'TWO', 'THREE', 'QUORUM', 'ALL',
      'LOCAL_QUORUM', 'EACH_QUORUM', 'LOCAL_ONE'
    ]
  },

  // Collection operations
  collections: {
    list: {
      append: '{column} = {column} + [{value}]',
      prepend: '{column} = [{value}] + {column}',
      setByIndex: '{column}[{index}] = {value}',
      remove: '{column} = {column} - [{value}]'
    },
    set: {
      add: '{column} = {column} + {{{value}}}',
      remove: '{column} = {column} - {{{value}}}'
    },
    map: {
      put: '{column}[\'{key}\'] = {value}',
      putAll: '{column} = {column} + {{{key}: {value}}}',
      remove: '{column} = {column} - {\'{key}\'}'
    },
    counter: {
      increment: '{column} = {column} + {value}',
      decrement: '{column} = {column} - {value}'
    }
  },

  // Time-series patterns
  timeSeries: {
    createTable: {
      orden: ['createTable', 'tableName', 'timeSeriesColumns', 'primaryKey', 'clusteringOrder', 'compaction'],
      createTable: 'CREATE TABLE',
      tableName: '{tableName}',
      timeSeriesColumns: '({timeSeriesColumns})',
      primaryKey: 'PRIMARY KEY ({primaryKey})',
      clusteringOrder: 'WITH CLUSTERING ORDER BY ({clusteringOrder})',
      compaction: 'AND compaction = {compaction}',
      defaults: {
        clusteringOrder: 'timestamp DESC',
        compaction: "{'class': 'TimeWindowCompactionStrategy'}"
      }
    }
  },

  // Common CQL functions
  functions: {
    uuid: 'uuid()',
    now: 'now()',
    timeUuid: 'timeuuid()',
    minTimeUuid: 'minTimeuuid({timestamp})',
    maxTimeUuid: 'maxTimeuuid({timestamp})',
    dateOf: 'dateOf({timeuuid})',
    unixTimestampOf: 'unixTimestampOf({timeuuid})',
    toDate: 'toDate({timeuuid})',
    toTimestamp: 'toTimestamp({timeuuid})',
    toUnixTimestamp: 'toUnixTimestamp({timeuuid})',
    blob: 'textAsBlob({text})',
    text: 'blobAsText({blob})',
    ascii: 'textAsAscii({text})',
    bigint: 'textAsBigint({text})',
    boolean: 'textAsBoolean({text})',
    decimal: 'textAsDecimal({text})',
    double: 'textAsDouble({text})',
    float: 'textAsFloat({text})',
    inet: 'textAsInet({text})',
    int: 'textAsInt({text})',
    varint: 'textAsVarint({text})',

    // Collection functions
    frozen: 'frozen<{type}>',
    listOf: 'list<{type}>',
    setOf: 'set<{type}>',
    mapOf: 'map<{keyType}, {valueType}>',
    tupleOf: 'tuple<{types}>'
  },

  // Data types for validation
  dataTypes: {
    primitives: [
      'ascii', 'bigint', 'blob', 'boolean', 'counter', 'date', 'decimal',
      'double', 'duration', 'float', 'inet', 'int', 'smallint', 'text',
      'time', 'timestamp', 'timeuuid', 'tinyint', 'uuid', 'varchar', 'varint'
    ],
    collections: ['list', 'set', 'map', 'tuple', 'frozen'],
    special: ['counter']
  },

  // Big Data patterns
  bigData: {
    denormalization: {
      userByEmail: 'CREATE TABLE users_by_email (email text PRIMARY KEY, user_id uuid, name text, created_at timestamp)',
      userById: 'CREATE TABLE users_by_id (user_id uuid PRIMARY KEY, email text, name text, created_at timestamp)'
    },
    partitioning: {
      timeSeriesByDay: 'CREATE TABLE events_by_day (day text, hour int, event_id timeuuid, data text, PRIMARY KEY (day, hour, event_id)) WITH CLUSTERING ORDER BY (hour DESC, event_id DESC)',
      userActivityByMonth: 'CREATE TABLE user_activity_by_month (user_id uuid, month text, activity_date timestamp, activity_type text, PRIMARY KEY ((user_id, month), activity_date)) WITH CLUSTERING ORDER BY (activity_date DESC)'
    },
    analytics: {
      aggregateByHour: 'CREATE TABLE analytics_by_hour (metric_name text, hour timestamp, value counter, PRIMARY KEY (metric_name, hour)) WITH CLUSTERING ORDER BY (hour DESC)',
      sessionData: 'CREATE TABLE user_sessions (user_id uuid, session_start timestamp, session_data map<text, text>, PRIMARY KEY (user_id, session_start)) WITH CLUSTERING ORDER BY (session_start DESC)'
    }
  }
};

export default cassandraCommands;