/**
 * @fileoverview Redis Command Definitions
 * Comandos específicos de Redis - In-Memory Data Structure Store
 * Operaciones optimizadas para cache, estructuras de datos y pub/sub
 * Advanced Redis commands and data structures
 * 
 * @version 1.0.0
 * @author Miguel E. Llambías Llansó
 */

// =============================================
// REDIS CONNECTION COMMANDS
// =============================================

export const ConnectionCommands = {
  connect: {
    template: "createClient({socket: {host, port}, password, database})",
    process: (params) => {
      return `createClient({
        socket: {
          host: '${params.host || 'localhost'}',
          port: ${params.port || 6379}
        },
        ${params.password ? `password: '${params.password}',` : ''}
        database: ${params.database || 0},
        ${params.keyPrefix ? `keyPrefix: '${params.keyPrefix}',` : ''}
        retryDelayOnFailover: ${params.retryDelayOnFailover || 100}
      })`;
    }
  },

  disconnect: {
    template: "client.disconnect()",
    process: () => "client.disconnect()"
  },

  ping: {
    template: "client.ping(message?)",
    process: (params) => {
      return params.message ? 
        `client.ping('${params.message}')` : 
        'client.ping()';
    }
  },

  info: {
    template: "client.info(section?)",
    process: (params) => {
      return params.section ? 
        `client.info('${params.section}')` : 
        'client.info()';
    }
  }
};

// =============================================
// REDIS STREAMS
// =============================================

export const StreamCommands = {
  /**
   * XADD stream ID field1 value1 field2 value2 ...
   * Add entry to stream
   */
  xadd: {
    template: "XADD stream id field1 value1 [field2 value2 ...]",
    process: (stream, id, fields, options = {}) => {
      let cmd = 'XADD';
      
      if (options.maxlen) cmd += ` MAXLEN ${options.maxlen}`;
      if (options.nomkstream) cmd += ' NOMKSTREAM';
      
      cmd += ` ${stream} ${id}`;
      
      if (typeof fields === 'object') {
        for (const [field, value] of Object.entries(fields)) {
          cmd += ` ${field} ${value}`;
        }
      }
      
      return cmd;
    }
  },

  /**
   * XREAD [COUNT count] [BLOCK milliseconds] STREAMS key1 key2 ... id1 id2 ...
   * Read from streams
   */
  xread: {
    template: "XREAD [COUNT count] [BLOCK milliseconds] STREAMS key1 key2 ... id1 id2 ...",
    process: (streams, options = {}) => {
      let cmd = 'XREAD';
      
      if (options.count) cmd += ` COUNT ${options.count}`;
      if (options.block !== undefined) cmd += ` BLOCK ${options.block}`;
      
      cmd += ' STREAMS';
      
      const streamNames = Object.keys(streams);
      const streamIds = Object.values(streams);
      
      cmd += ` ${streamNames.join(' ')} ${streamIds.join(' ')}`;
      
      return cmd;
    }
  },

  /**
   * XGROUP CREATE stream group id [MKSTREAM]
   * Create consumer group
   */
  xgroupCreate: {
    template: "XGROUP CREATE stream group id [MKSTREAM]",
    process: (stream, group, id, mkstream = false) => {
      let cmd = `XGROUP CREATE ${stream} ${group} ${id}`;
      if (mkstream) cmd += ' MKSTREAM';
      return cmd;
    }
  },

  /**
   * XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] STREAMS key1 key2 ... id1 id2 ...
   * Read from stream as consumer group member
   */
  xreadgroup: {
    template: "XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] STREAMS key1 key2 ... id1 id2 ...",
    process: (group, consumer, streams, options = {}) => {
      let cmd = `XREADGROUP GROUP ${group} ${consumer}`;
      
      if (options.count) cmd += ` COUNT ${options.count}`;
      if (options.block !== undefined) cmd += ` BLOCK ${options.block}`;
      if (options.noack) cmd += ' NOACK';
      
      cmd += ' STREAMS';
      
      const streamNames = Object.keys(streams);
      const streamIds = Object.values(streams);
      
      cmd += ` ${streamNames.join(' ')} ${streamIds.join(' ')}`;
      
      return cmd;
    }
  }
};

// =============================================
// REDIS PUB/SUB
// =============================================

export const PubSubCommands = {
  publish: {
    template: "PUBLISH channel message",
    process: (channel, message) => `PUBLISH ${channel} "${message}"`
  },

  subscribe: {
    template: "SUBSCRIBE channel1 [channel2 ...]",
    process: (...channels) => `SUBSCRIBE ${channels.join(' ')}`
  },

  unsubscribe: {
    template: "UNSUBSCRIBE [channel1 [channel2 ...]]",
    process: (...channels) => {
      return channels.length > 0 ? 
        `UNSUBSCRIBE ${channels.join(' ')}` : 
        'UNSUBSCRIBE';
    }
  },

  psubscribe: {
    template: "PSUBSCRIBE pattern1 [pattern2 ...]",
    process: (...patterns) => `PSUBSCRIBE ${patterns.join(' ')}`
  },

  punsubscribe: {
    template: "PUNSUBSCRIBE [pattern1 [pattern2 ...]]",
    process: (...patterns) => {
      return patterns.length > 0 ? 
        `PUNSUBSCRIBE ${patterns.join(' ')}` : 
        'PUNSUBSCRIBE';
    }
  }
};

// =============================================
// REDIS DATA STRUCTURES
// =============================================

export const DataStructureCommands = {
  // Strings
  set: {
    template: "SET key value [EX seconds] [PX milliseconds] [NX|XX]",
    process: (key, value, options = {}) => {
      let cmd = `SET ${key} "${value}"`;
      
      if (options.ex) cmd += ` EX ${options.ex}`;
      if (options.px) cmd += ` PX ${options.px}`;
      if (options.nx) cmd += ' NX';
      if (options.xx) cmd += ' XX';
      
      return cmd;
    }
  },

  get: {
    template: "GET key",
    process: (key) => `GET ${key}`
  },

  // Lists
  lpush: {
    template: "LPUSH key value1 [value2 ...]",
    process: (key, ...values) => `LPUSH ${key} ${values.map(v => `"${v}"`).join(' ')}`
  },

  rpush: {
    template: "RPUSH key value1 [value2 ...]",
    process: (key, ...values) => `RPUSH ${key} ${values.map(v => `"${v}"`).join(' ')}`
  },

  lpop: {
    template: "LPOP key [count]",
    process: (key, count) => count ? `LPOP ${key} ${count}` : `LPOP ${key}`
  },

  rpop: {
    template: "RPOP key [count]",
    process: (key, count) => count ? `RPOP ${key} ${count}` : `RPOP ${key}`
  },

  // Sets
  sadd: {
    template: "SADD key member1 [member2 ...]",
    process: (key, ...members) => `SADD ${key} ${members.map(m => `"${m}"`).join(' ')}`
  },

  srem: {
    template: "SREM key member1 [member2 ...]",
    process: (key, ...members) => `SREM ${key} ${members.map(m => `"${m}"`).join(' ')}`
  },

  smembers: {
    template: "SMEMBERS key",
    process: (key) => `SMEMBERS ${key}`
  },

  // Hashes
  hset: {
    template: "HSET key field1 value1 [field2 value2 ...]",
    process: (key, fields) => {
      let cmd = `HSET ${key}`;
      
      if (typeof fields === 'object') {
        for (const [field, value] of Object.entries(fields)) {
          cmd += ` ${field} "${value}"`;
        }
      }
      
      return cmd;
    }
  },

  hget: {
    template: "HGET key field",
    process: (key, field) => `HGET ${key} ${field}`
  },

  hgetall: {
    template: "HGETALL key",
    process: (key) => `HGETALL ${key}`
  },

  // Sorted Sets
  zadd: {
    template: "ZADD key score1 member1 [score2 member2 ...]",
    process: (key, scoreMemberPairs) => {
      let cmd = `ZADD ${key}`;
      
      if (Array.isArray(scoreMemberPairs)) {
        for (let i = 0; i < scoreMemberPairs.length; i += 2) {
          const score = scoreMemberPairs[i];
          const member = scoreMemberPairs[i + 1];
          cmd += ` ${score} "${member}"`;
        }
      }
      
      return cmd;
    }
  },

  zrange: {
    template: "ZRANGE key start stop [WITHSCORES]",
    process: (key, start, stop, withScores = false) => {
      let cmd = `ZRANGE ${key} ${start} ${stop}`;
      if (withScores) cmd += ' WITHSCORES';
      return cmd;
    }
  }
};

// =============================================
// REDIS TRANSACTIONS
// =============================================

export const TransactionCommands = {
  multi: {
    template: "MULTI",
    process: () => "MULTI"
  },

  exec: {
    template: "EXEC",
    process: () => "EXEC"
  },

  discard: {
    template: "DISCARD",
    process: () => "DISCARD"
  },

  watch: {
    template: "WATCH key1 [key2 ...]",
    process: (...keys) => `WATCH ${keys.join(' ')}`
  },

  unwatch: {
    template: "UNWATCH",
    process: () => "UNWATCH"
  }
};

// =============================================
// REDIS ADMINISTRATION
// =============================================

export const AdminCommands = {
  flushdb: {
    template: "FLUSHDB [ASYNC]",
    process: (async = false) => async ? "FLUSHDB ASYNC" : "FLUSHDB"
  },

  flushall: {
    template: "FLUSHALL [ASYNC]",
    process: (async = false) => async ? "FLUSHALL ASYNC" : "FLUSHALL"
  },

  dbsize: {
    template: "DBSIZE",
    process: () => "DBSIZE"
  },

  keys: {
    template: "KEYS pattern",
    process: (pattern = "*") => `KEYS ${pattern}`
  },

  exists: {
    template: "EXISTS key1 [key2 ...]",
    process: (...keys) => `EXISTS ${keys.join(' ')}`
  },

  del: {
    template: "DEL key1 [key2 ...]",
    process: (...keys) => `DEL ${keys.join(' ')}`
  },

  expire: {
    template: "EXPIRE key seconds",
    process: (key, seconds) => `EXPIRE ${key} ${seconds}`
  },

  ttl: {
    template: "TTL key",
    process: (key) => `TTL ${key}`
  }
};

// =============================================
// EXPORT ALL COMMANDS
// =============================================

export const RedisCommands = {
  connection: ConnectionCommands,
  streams: StreamCommands,
  pubsub: PubSubCommands,
  dataStructures: DataStructureCommands,
  transactions: TransactionCommands,
  admin: AdminCommands
};

export default RedisCommands;