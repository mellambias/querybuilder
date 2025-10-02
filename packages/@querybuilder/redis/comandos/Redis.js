/*/**

Comandos específicos de Redis - In-Memory Data Structure Store * @fileoverview Redis Command Definitions

Operaciones optimizadas para cache, estructuras de datos y pub/sub * Advanced Redis commands and data structures

*/ * 

 * @version 1.0.0

const redisCommands = { * @author mellambias

	// ================================ */

	// Connection Commands

	// ================================// =============================================

	// REDIS STREAMS

	/**/ / =============================================

	 * Conexión a Redis

  */export const StreamCommands = {

connection: {  /**

		connect: {   * XADD stream ID field1 value1 field2 value2 ...

			template: "createClient({socket: {host, port}, password, database})",   * Add entry to stream

			process: (params) => {   */

  return `createClient({  xadd(stream, id, fields, options = {}) {

	socket: {    let cmd = 'XADD';

		host: '${params.host || 'localhost'}',    if (options.maxlen) cmd += ` MAXLEN ${ options.maxlen } `;

		port: ${params.port || 6379}    if (options.nomkstream) cmd += ' NOMKSTREAM';

	},

	${params.password ? `password: '${params.password}',` : ''}    cmd += ` ${ stream } ${ id } `;

	database: ${params.database || 0},

	${params.keyPrefix ? `keyPrefix: '${params.keyPrefix}',` : ''}    if (typeof fields === 'object') {

	retryDelayOnFailover: ${params.retryDelayOnFailover || 100}      for (const [field, value] of Object.entries(fields)) {

})`; cmd += ` ${field} ${this._formatValue(value)}`;

}      }

		},    }

disconnect: {

  template: "client.disconnect()",    return cmd;

  process: () => "client.disconnect()"
},

		},

ping: {  /**

			template: "client.ping(message?)",   * XREAD [COUNT count] [BLOCK milliseconds] STREAMS key1 key2 ... id1 id2 ...

			process: (params) => {   * Read from streams

				return params.message ?    */

  `client.ping('${params.message}')` : xread(streams, options = {}) {

    'client.ping()'; let cmd = 'XREAD';

  } if (options.count) cmd += ` COUNT ${options.count}`;

}, if (options.block !== undefined) cmd += ` BLOCK ${options.block}`;

info: {

  template: "client.info(section?)", cmd += ' STREAMS';

  process: (params) => {
    const streamNames = Object.keys(streams);

    return params.section ?     const streamIds = Object.values(streams);

    `client.info('${params.section}')` :

    'client.info()'; cmd += ` ${streamNames.join(' ')} ${streamIds.join(' ')}`;

  }    return cmd;

}  },

	},

/**

// ================================   * XGROUP CREATE stream group id [MKSTREAM]

// String Operations   * Create consumer group

// ================================   */

xgroupCreate(stream, group, id, mkstream = false) {

	/**    let cmd = `XGROUP CREATE ${stream} ${group} ${id}`;

	 * Operaciones con strings    if (mkstream) cmd += ' MKSTREAM';

	 */    return cmd;

  strings: { },

  set: {

    template: "client.set(key, value, options?)",  /**

			process: (params) => {   * XREADGROUP GROUP group consumer [COUNT count] [BLOCK milliseconds] STREAMS key1 key2 ... id1 id2 ...

				let command = `client.set('${params.key}', '${params.value}'`;   * Read from stream as consumer group

				   */

				if (params.EX) command += `, { EX: ${params.EX} }`; xreadgroup(group, consumer, streams, options = {}) {

				else if (params.PX) command += `, { PX: ${params.PX} }`; let cmd = `XREADGROUP GROUP ${group} ${consumer}`;

				else if (params.NX) command += `, { NX: true }`; if (options.count) cmd += ` COUNT ${options.count}`;

      else if (params.XX) command += `, { XX: true }`; if (options.block !== undefined) cmd += ` BLOCK ${options.block}`;

      else if (params.options) command += `, ${JSON.stringify(params.options)}`; if (options.noack) cmd += ' NOACK';



      command += ')'; cmd += ' STREAMS';

      return command; const streamNames = Object.keys(streams);

    } const streamIds = Object.values(streams);

  },

  get: {
    cmd += ` ${streamNames.join(' ')} ${streamIds.join(' ')}`;

    template: "client.get(key)",    return cmd;

    process: (params) => `client.get('${params.key}')`
  },

},

mget: {  /**

			template: "client.mGet([keys])",   * XACK stream group id1 id2 ...

			process: (params) => {   * Acknowledge stream messages

				const keys = Array.isArray(params.keys) ? params.keys : [params.keys];   */

  return `client.mGet([${keys.map(k => `'${k}'`).join(', ')}])`; xack(stream, group, ids) {

  } const idList = Array.isArray(ids) ? ids.join(' ') : ids;

}, return `XACK ${stream} ${group} ${idList}`;

mset: { }

template: "client.mSet([key1, value1, key2, value2...])",};

process: (params) => {

  const pairs = Object.entries(params.data || params)// =============================================

    .map(([k, v]) => `'${k}', '${v}'`)// HYPERLOGLOG

    .join(', ');// =============================================

  return `client.mSet([${pairs}])`;

}export const HyperLogLogCommands = {

},  /**

		incr: {   * PFADD key element1 element2 ...

			template: "client.incr(key) | client.incrBy(key, increment)",   * Add elements to HyperLogLog

			process: (params) => {   */

const increment = params.increment || 1; pfadd(key, elements) {

  return increment === 1 ?     const elementList = Array.isArray(elements)

    `client.incr('${params.key}')` :       ?elements.map(el => this._formatValue(el)).join(' ')

      `client.incrBy('${params.key}', ${increment})`;      : this._formatValue(elements);

} return `PFADD ${key} ${elementList}`;

		},  },

decr: {

  template: "client.decr(key) | client.decrBy(key, decrement)",  /**

			process: (params) => {   * PFCOUNT key1 key2 ...

				const decrement = params.decrement || 1;   * Get HyperLogLog cardinality

				return decrement === 1 ?    */

    `client.decr('${params.key}')` : pfcount(keys) {

    `client.decrBy('${params.key}', ${decrement})`; const keyList = Array.isArray(keys) ? keys.join(' ') : keys;

  } return `PFCOUNT ${keyList}`;

},  },

append: {

  template: "client.append(key, value)",  /**

			process: (params) => `client.append('${params.key}', '${params.value}')`   * PFMERGE destkey sourcekey1 sourcekey2 ...

		},   * Merge HyperLogLogs

		strlen: {   */

    template: "client.strLen(key)", pfmerge(destkey, sourcekeys) {

    process: (params) => `client.strLen('${params.key}')`    const keyList = Array.isArray(sourcekeys) ? sourcekeys.join(' ') : sourcekeys;

  } return `PFMERGE ${destkey} ${keyList}`;

},  }

};

// ================================

// Hash Operations// =============================================

// ================================// BITMAP OPERATIONS

// =============================================

/**

 * Operaciones con hashesexport const BitmapCommands = {

 */  /**

hashes: {   * SETBIT key offset value

 hset: {   * Set bit at offset

   template: "client.hSet(key, field, value) | client.hSet(key, {field1: value1})",   */

process: (params) => {
  setbit(key, offset, value) {

    if (params.field && params.value) {
      return `SETBIT ${key} ${offset} ${value}`;

      return `client.hSet('${params.key}', '${params.field}', '${params.value}')`;
    },

  } else if (params.data) {

    return `client.hSet('${params.key}', ${JSON.stringify(params.data)})`;  /**

				}   * GETBIT key offset

				return `client.hSet('${params.key}', '${params.field}', '${params.value}')`;   * Get bit at offset

			}   */

  }, getbit(key, offset) {

    hget: {
      return `GETBIT ${key} ${offset}`;

      template: "client.hGet(key, field)",  },

    process: (params) => `client.hGet('${params.key}', '${params.field}')`

  },  /**

		hmget: {   * BITCOUNT key [start end]

			template: "client.hmGet(key, [fields])",   * Count set bits

			process: (params) => {   */

  const fields = Array.isArray(params.fields) ? params.fields : [params.fields]; bitcount(key, start = null, end = null) {

    return `client.hmGet('${params.key}', [${fields.map(f => `'${f}'`).join(', ')}])`; let cmd = `BITCOUNT ${key}`;

  } if (start !== null && end !== null) {

  }, cmd += ` ${start} ${end}`;

  hgetall: { }

  template: "client.hGetAll(key)",    return cmd;

  process: (params) => `client.hGetAll('${params.key}')`
},

		},

hdel: {  /**

			template: "client.hDel(key, [fields])",   * BITOP operation destkey key1 key2 ...

			process: (params) => {   * Perform bitwise operations

				const fields = Array.isArray(params.fields) ? params.fields : [params.fields];   */

  return `client.hDel('${params.key}', [${fields.map(f => `'${f}'`).join(', ')}])`; bitop(operation, destkey, keys) {

  } const keyList = Array.isArray(keys) ? keys.join(' ') : keys;

}, return `BITOP ${operation.toUpperCase()} ${destkey} ${keyList}`;

hexists: { }

template: "client.hExists(key, field)",};

process: (params) => `client.hExists('${params.key}', '${params.field}')`

		},// =============================================

hlen: {// GEOSPATIAL OPERATIONS

  template: "client.hLen(key)",// =============================================

    process: (params) => `client.hLen('${params.key}')`

}, export const GeoCommands = {

  hkeys: {  /**

			template: "client.hKeys(key)",   * GEOADD key longitude1 latitude1 member1 longitude2 latitude2 member2 ...

			process: (params) => `client.hKeys('${params.key}')`   * Add geospatial items

		},   */

    hvals: {
      geoadd(key, locations) {

        template: "client.hVals(key)", let cmd = `GEOADD ${key}`;

        process: (params) => `client.hVals('${params.key}')`

      }, if(Array.isArray(locations)) {

        hincrby: { for (const location of locations) {

          template: "client.hIncrBy(key, field, increment)", cmd += ` ${location.longitude} ${location.latitude} ${location.member}`;

          process: (params) => `client.hIncrBy('${params.key}', '${params.field}', ${params.increment || 1})`
        }

		}    } else if (typeof locations === 'object') {

}, for (const [member, coords] of Object.entries(locations)) {

  cmd += ` ${coords.longitude} ${coords.latitude} ${member}`;

  // ================================      }

  // List Operations    }

  // ================================

  return cmd;

  /**  },

   * Operaciones con listas

   */  /**

 lists: {   * GEODIST key member1 member2 [unit]

   lpush: {   * Get distance between members

     template: "client.lPush(key, [values])",   */

  process: (params) => {
    geodist(key, member1, member2, unit = 'm') {

      const values = Array.isArray(params.values) ? params.values : [params.values]; return `GEODIST ${key} ${member1} ${member2} ${unit}`;

      return `client.lPush('${params.key}', [${values.map(v => `'${v}'`).join(', ')}])`;
    },

  }

},  /**

		rpush: {   * GEORADIUS key longitude latitude radius unit [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count]

			template: "client.rPush(key, [values])",   * Get members within radius

			process: (params) => {   */

const values = Array.isArray(params.values) ? params.values : [params.values]; georadius(key, longitude, latitude, radius, unit, options = {}) {

  return `client.rPush('${params.key}', [${values.map(v => `'${v}'`).join(', ')}])`; let cmd = `GEORADIUS ${key} ${longitude} ${latitude} ${radius} ${unit}`;

}

		}, if (options.withcoord) cmd += ' WITHCOORD';

lpop: {
  if (options.withdist) cmd += ' WITHDIST';

  template: "client.lPop(key, count?)",    if (options.withhash) cmd += ' WITHHASH';

  process: (params) => {
    if (options.count) cmd += ` COUNT ${options.count}`;

    return params.count ?     if (options.sort) cmd += ` ${options.sort.toUpperCase()}`;

    `client.lPop('${params.key}', ${params.count})` :

    `client.lPop('${params.key}')`; return cmd;

  }
},

		},

rpop: {  /**

			template: "client.rPop(key, count?)",   * GEORADIUSBYMEMBER key member radius unit [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count]

			process: (params) => {   * Get members within radius of member

				return params.count ?    */

  `client.rPop('${params.key}', ${params.count})` : georadiusbymember(key, member, radius, unit, options = {}) {

    `client.rPop('${params.key}')`; let cmd = `GEORADIUSBYMEMBER ${key} ${member} ${radius} ${unit}`;

  }

}, if (options.withcoord) cmd += ' WITHCOORD';

lrange: {
  if (options.withdist) cmd += ' WITHDIST';

  template: "client.lRange(key, start, stop)",    if (options.withhash) cmd += ' WITHHASH';

  process: (params) => `client.lRange('${params.key}', ${params.start || 0}, ${params.stop || -1})`    if (options.count) cmd += ` COUNT ${options.count}`;

}, if (options.sort) cmd += ` ${options.sort.toUpperCase()}`;

llen: {

  template: "client.lLen(key)",    return cmd;

  process: (params) => `client.lLen('${params.key}')`
}

		},};

lindex: {

  template: "client.lIndex(key, index)",// =============================================

    process: (params) => `client.lIndex('${params.key}', ${params.index})`// LUA SCRIPTING

},// =============================================

lset: {

  template: "client.lSet(key, index, value)",export const ScriptCommands = {

    process: (params) => `client.lSet('${params.key}', ${params.index}, '${params.value}')`  /**

		},   * EVAL script numkeys key1 key2 ... arg1 arg2 ...

		ltrim: {   * Execute Lua script

			template: "client.lTrim(key, start, stop)",   */

			process: (params) => `client.lTrim('${params.key}', ${params.start}, ${params.stop})`  eval(script, keys = [], args = []) {

    }    let cmd = `EVAL "${script}" ${keys.length}`;

  },    if (keys.length > 0) cmd += ` ${keys.join(' ')}`;

  if (args.length > 0) cmd += ` ${args.join(' ')}`;

	// ================================    return cmd;

	// Set Operations  },

	// ================================

	  /**

	/**   * EVALSHA sha1 numkeys key1 key2 ... arg1 arg2 ...

	 * Operaciones con sets   * Execute cached Lua script

	 */   */

  sets: {
    evalsha(sha1, keys = [], args = []) {

      sadd: {
        let cmd = `EVALSHA ${sha1} ${keys.length}`;

        template: "client.sAdd(key, [members])",    if (keys.length > 0) cmd += ` ${keys.join(' ')}`;

        process: (params) => {
          if (args.length > 0) cmd += ` ${args.join(' ')}`;

          const members = Array.isArray(params.members) ? params.members : [params.members]; return cmd;

          return `client.sAdd('${params.key}', [${members.map(m => `'${m}'`).join(', ')}])`;
        },

			}

    },  /**

		smembers: {   * SCRIPT LOAD script

			template: "client.sMembers(key)",   * Load Lua script

			process: (params) => `client.sMembers('${params.key}')`   */

  }, scriptLoad(script) {

    sismember: {
      return `SCRIPT LOAD "${script}"`;

      template: "client.sIsMember(key, member)",  },

    process: (params) => `client.sIsMember('${params.key}', '${params.member}')`

  },  /**

		srem: {   * SCRIPT EXISTS sha1 sha2 ...

			template: "client.sRem(key, [members])",   * Check if scripts exist

			process: (params) => {   */

  const members = Array.isArray(params.members) ? params.members : [params.members]; scriptExists(sha1s) {

    return `client.sRem('${params.key}', [${members.map(m => `'${m}'`).join(', ')}])`; const shaList = Array.isArray(sha1s) ? sha1s.join(' ') : sha1s;

  } return `SCRIPT EXISTS ${shaList}`;

},  },

scard: {

  template: "client.sCard(key)",  /**

			process: (params) => `client.sCard('${params.key}')`   * SCRIPT FLUSH

		},   * Flush script cache

		sinter: {   */

    template: "client.sInter([keys])", scriptFlush() {

    process: (params) => {
      return 'SCRIPT FLUSH';

      const keys = Array.isArray(params.keys) ? params.keys : [params.keys];
    }

    return `client.sInter([${keys.map(k => `'${k}'`).join(', ')}])`;
  };

}

		},// =============================================

sunion: {// CLUSTER OPERATIONS

  template: "client.sUnion([keys])",// =============================================

    process: (params) => {

      const keys = Array.isArray(params.keys) ? params.keys : [params.keys]; export const ClusterCommands = {

        return `client.sUnion([${keys.map(k => `'${k}'`).join(', ')}])`;  /**

			}   * CLUSTER NODES

		},   * Get cluster nodes info

		sdiff: {   */

        template: "client.sDiff([keys])", clusterNodes() {

          process: (params) => {
            return 'CLUSTER NODES';

            const keys = Array.isArray(params.keys) ? params.keys : [params.keys];
          },

				return `client.sDiff([${keys.map(k => `'${k}'`).join(', ')}])`;

        }  /**

		},   * CLUSTER INFO

		spop: {   * Get cluster info

			template: "client.sPop(key, count?)",   */

			process: (params) => {
          clusterInfo() {

            return params.count ?     return 'CLUSTER INFO';

            `client.sPop('${params.key}', ${params.count})` :
          },

          `client.sPop('${params.key}')`;

        }  /**

		}   * CLUSTER KEYSLOT key

	},   * Get key slot

   */

	// ================================  clusterKeyslot(key) {

	// Sorted Set Operations    return `CLUSTER KEYSLOT ${key}`;

	// ================================  },



	/**  /**

	 * Operaciones con sorted sets   * CLUSTER COUNTKEYSINSLOT slot

	 */   * Count keys in slot

	sortedSets: { */

          zadd: { clusterCountKeysInSlot(slot) {

            template: "client.zAdd(key, {score, value} | [{score, value}])",    return `CLUSTER COUNTKEYSINSLOT ${slot}`;

            process: (params) => { }

            if (Array.isArray(params.members)) { };

            const members = params.members.map(m => `{ score: ${m.score}, value: '${m.value}' }`).join(', ');

            return `client.zAdd('${params.key}', [${members}])`;// =============================================

          } else {// PIPELINE HELPERS

        return `client.zAdd('${params.key}', { score: ${params.score}, value: '${params.member || params.value}' })`;// =============================================

      }

    }export const PipelineHelpers = {

    },  /**

		zrange: {   * Create a pipeline of commands

			template: "client.zRange(key, start, stop, options?)",   * @param {Array} commands - Array of command strings

			process: (params) => {   * @returns {string} Pipeline command

				let command = `client.zRange('${params.key}', ${params.start || 0}, ${params.stop || -1}`;   */

  if (params.withScores) command += `, { withScores: true }`; pipeline(commands) {

    if (params.REV) command += `, { REV: true }`; return commands.join('\r\n');

    command += ')';
  },

  return command;

}  /**

		},   * Create a transaction with commands

		zrangebyscore: {   * @param {Array} commands - Array of command strings

			template: "client.zRangeByScore(key, min, max, options?)",   * @returns {string} Transaction commands

			process: (params) => {   */

let command = `client.zRangeByScore('${params.key}', ${params.min}, ${params.max}`; transaction(commands) {

  if (params.withScores) command += `, { withScores: true }`; return ['MULTI', ...commands, 'EXEC'].join('\r\n');

  if (params.LIMIT) command += `, { LIMIT: ${JSON.stringify(params.LIMIT)} }`;
}

command += ')';};

return command;

			}// =============================================

		},// REDIS MODULES COMMANDS (if available)

zscore: {// =============================================

  template: "client.zScore(key, member)",

    process: (params) => `client.zScore('${params.key}', '${params.member}')`export const ModuleCommands = {

    },  // RedisJSON

      zrem: { jsonGet(key, path = '$') {

        template: "client.zRem(key, [members])", return `JSON.GET ${key} ${path}`;

  process: (params) => { },

				const members = Array.isArray(params.members) ? params.members : [params.members];

  return `client.zRem('${params.key}', [${members.map(m => `'${m}'`).join(', ')}])`; jsonSet(key, path, value) {

  } return `JSON.SET ${key} ${path} ${JSON.stringify(value)}`;

},  },

zcard: {

  template: "client.zCard(key)", jsonDel(key, path = '$') {

    process: (params) => `client.zCard('${params.key}')`    return `JSON.DEL ${key} ${path}`;

  },
},

zcount: {

  template: "client.zCount(key, min, max)",  // RedisGraph

    process: (params) => `client.zCount('${params.key}', ${params.min}, ${params.max})`  graphQuery(graph, query) {

  }, return `GRAPH.QUERY ${graph} "${query}"`;

  zrank: { },

  template: "client.zRank(key, member)",

    process: (params) => `client.zRank('${params.key}', '${params.member}')`  // RedisTimeSeries

} tsAdd(key, timestamp, value) {

}, return `TS.ADD ${key} ${timestamp} ${value}`;

  },

	// ================================

	// Key Management  tsRange(key, fromTimestamp, toTimestamp) {

	// ================================    return `TS.RANGE ${key} ${fromTimestamp} ${toTimestamp}`;

	  },

	/**

	 * Gestión de claves  // RedisBloom (Bloom filters)

	 */  bfAdd(key, item) {

  keys: {
    return `BF.ADD ${key} ${item}`;

    del: { },

    template: "client.del([keys])",

      process: (params) => {
        bfExists(key, item) {

          const keys = Array.isArray(params.keys) ? params.keys : [params.keys]; return `BF.EXISTS ${key} ${item}`;

          return `client.del([${keys.map(k => `'${k}'`).join(', ')}])`;
        }

      }
  };

},

exists: {// =============================================

  template: "client.exists(key)",// COMMON PATTERNS

    process: (params) => `client.exists('${params.key}')`// =============================================

},

expire: {
  export const CommonPatterns = {

    template: "client.expire(key, seconds)",  /**

			process: (params) => `client.expire('${params.key}', ${params.seconds})`   * Rate limiting pattern

		},   */

    ttl: {
      rateLimitCheck(key, limit, window) {

        template: "client.ttl(key)",    return [

          process: (params) => `client.ttl('${params.key}')`      `MULTI`,

		},      `INCR ${key}`,

    keys: {      `EXPIRE ${key} ${window}`,

    template: "client.keys(pattern)",      `EXEC`

  process: (params) => `client.keys('${params.pattern || '*'}')`    ].join('\r\n');

},  },

type: {

  template: "client.type(key)",  /**

			process: (params) => `client.type('${params.key}')`   * Distributed lock pattern

		},   */

    rename: {
      acquireLock(lockKey, value, ttl) {

        template: "client.rename(key, newkey)",    return `SET ${lockKey} ${value} EX ${ttl} NX`;

        process: (params) => `client.rename('${params.key}', '${params.newkey}')`
      },

  },

  persist: {  /**

			template: "client.persist(key)",   * Session storage pattern

			process: (params) => `client.persist('${params.key}')`   */

  } sessionSet(sessionId, data, ttl = 3600) {

  }, const sessionKey = `session:${sessionId}`;

  let cmd = `HMSET ${sessionKey}`;

  // ================================

  // Pub/Sub Operations    for (const [field, value] of Object.entries(data)) {

  // ================================      cmd += ` ${field} ${JSON.stringify(value)}`;

}

	/**

	 * Operaciones de Publish/Subscribe    return [cmd, `EXPIRE ${sessionKey} ${ttl}`].join('\r\n');

	 */  },

pubsub: {

  publish: {  /**

			template: "publisher.publish(channel, message)",   * Cache with TTL pattern

			process: (params) => `publisher.publish('${params.channel}', '${params.message}')`   */

  }, cacheSet(key, value, ttl) {

    subscribe: {
      return `SETEX ${key} ${ttl} ${JSON.stringify(value)}`;

      template: "subscriber.subscribe(channel, messageHandler)",  },

    process: (params) => {

      const channels = Array.isArray(params.channels) ? params.channels : [params.channels];  /**

				return `subscriber.subscribe('${channels.join("', '")}', ${params.callback?.toString() || 'messageHandler'})`;   * Leaderboard pattern

			}   */

    }, leaderboardAdd(leaderboard, score, member) {

      unsubscribe: {
        return `ZADD ${leaderboard} ${score} ${member}`;

        template: "subscriber.unsubscribe(channel)",  },

      process: (params) => {

        const channels = Array.isArray(params.channels) ? params.channels : [params.channels]; leaderboardTop(leaderboard, count = 10) {

          return `subscriber.unsubscribe('${channels.join("', '")}')`; return `ZREVRANGE ${leaderboard} 0 ${count - 1} WITHSCORES`;

        }
      },

		},

    psubscribe: {  /**

			template: "subscriber.pSubscribe(pattern, messageHandler)",   * Counter pattern with expiration

			process: (params) => {   */

      const patterns = Array.isArray(params.patterns) ? params.patterns : [params.patterns]; counterIncr(key, ttl = null) {

        return `subscriber.pSubscribe('${patterns.join("', '")}', ${params.callback?.toString() || 'messageHandler'})`; if (ttl) {

        } return [

		} `MULTI`,

	}, `INCR ${key}`,

      `EXPIRE ${key} ${ttl}`,

	// ================================        `EXEC`

	// Transaction Operations      ].join('\r\n');

	// ================================    }

	    return `INCR ${key}`;

    /**  }
  
     * Transacciones};
  
     */

    transactions: {// Export all command groups

      multi: {
        export default {

          template: "client.multi()", StreamCommands,

          process: () => "client.multi()"  HyperLogLogCommands,

        }, BitmapCommands,

          exec: {
            GeoCommands,

            template: "multi.exec()", ScriptCommands,

              process: () => "multi.exec()"  ClusterCommands,

		}, PipelineHelpers,

          discard: {
            ModuleCommands,

            template: "multi.discard()", CommonPatterns

          process: () => "multi.discard()"
        };
      },
      watch: {
        template: "client.watch([keys])",
          process: (params) => {
            const keys = Array.isArray(params.keys) ? params.keys : [params.keys];
            return `client.watch([${keys.map(k => `'${k}'`).join(', ')}])`;
          }
      },
      unwatch: {
        template: "client.unwatch()",
          process: () => "client.unwatch()"
      }
    },

    // ================================
    // Advanced Operations
    // ================================

    /**
     * Operaciones avanzadas
     */
    advanced: {
      eval: {
        template: "client.eval(script, {keys, arguments})",
          process: (params) => {
            const keys = params.keys || [];
            const args = params.args || [];
            return `client.eval('${params.script}', { keys: [${keys.map(k => `'${k}'`).join(', ')}], arguments: [${args.map(a => `'${a}'`).join(', ')}] })`;
          }
      },
      pipeline: {
        template: "pipeline = client.multi().command1().command2().exec()",
          process: (params) => {
            const commands = params.commands || [];
            const commandList = commands.map(cmd => cmd.replace('client.', '')).join('\n  .');
            return `pipeline = client.multi()
  .${commandList}
  .exec()`;
          }
      },
      flushdb: {
        template: "client.flushDb({ASYNC: true}?)",
          process: (params) => {
            return params.async ?
              'client.flushDb({ ASYNC: true })' :
              'client.flushDb()';
          }
      },
      flushall: {
        template: "client.flushAll({ASYNC: true}?)",
          process: (params) => {
            return params.async ?
              'client.flushAll({ ASYNC: true })' :
              'client.flushAll()';
          }
      }
    },

    // ================================
    // Stream Operations
    // ================================

    /**
     * Redis Streams
     */
    streams: {
      xadd: {
        template: "client.xAdd(key, id, fields)",
          process: (params) => `client.xAdd('${params.key}', '${params.id || '*'}', ${JSON.stringify(params.fields)})`
      },
      xrange: {
        template: "client.xRange(key, start, end, options?)",
          process: (params) => {
            let command = `client.xRange('${params.key}', '${params.start || '-'}', '${params.end || '+'}'`;
            if (params.COUNT) command += `, { COUNT: ${params.COUNT} }`;
            command += ')';
            return command;
          }
      },
      xread: {
        template: "client.xRead(options?, streams)",
          process: (params) => {
            let command = `client.xRead(`;
            if (params.COUNT) command += `{ COUNT: ${params.COUNT} }, `;
            if (params.BLOCK) command += `{ BLOCK: ${params.BLOCK} }, `;
            command += `${JSON.stringify(params.streams)})`;
            return command;
          }
      },
      xlen: {
        template: "client.xLen(key)",
          process: (params) => `client.xLen('${params.key}')`
      },
      xdel: {
        template: "client.xDel(key, [ids])",
          process: (params) => {
            const ids = Array.isArray(params.ids) ? params.ids : [params.ids];
            return `client.xDel('${params.key}', [${ids.map(id => `'${id}'`).join(', ')}])`;
          }
      }
    },

    // ================================
    // Utilities
    // ================================

    /**
     * Utilidades y helpers
     */
    utils: {
      /**
       * Valida configuración Redis
       */
      validateConfig: (config) => {
        const errors = [];

        if (config.port && (config.port < 1 || config.port > 65535)) {
          errors.push('Puerto debe estar entre 1 y 65535');
        }

        if (config.database && (config.database < 0 || config.database > 15)) {
          errors.push('Base de datos debe estar entre 0 y 15');
        }

        return {
          valid: errors.length === 0,
          errors: errors
        };
      },

        /**
         * Genera clave con prefijo
         */
        keyWithPrefix: (key, prefix = '') => {
          return prefix ? `${prefix}:${key}` : key;
        },

          /**
           * Convierte valor a formato Redis
           */
          formatValue: (value) => {
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
            return String(value);
          },

            /**
             * Parse respuesta Redis
             */
            parseResponse: (response, type = 'string') => {
              if (response === null) return null;

              switch (type) {
                case 'json':
                  try {
                    return JSON.parse(response);
                  } catch {
                    return response;
                  }
                case 'number':
                  return Number(response);
                case 'boolean':
                  return response === '1' || response === 'true';
                default:
                  return response;
              }
            }
    },

    // ================================
    // Examples
    // ================================

    /**
     * Ejemplos de uso común
     */
    examples: {
      basicUsage: `
// Configuración básica
import { createClient } from 'redis';

const client = createClient({
	socket: {
		host: 'localhost',
		port: 6379
	},
	password: 'your-password', // opcional
	database: 0
});

await client.connect();`,

        caching: `
// Cache básico
await client.set('user:123', JSON.stringify(userData), { EX: 3600 }); // TTL 1 hora
const userData = JSON.parse(await client.get('user:123') || '{}');

// Cache con pattern
await client.mSet([
	'cache:user:123', JSON.stringify(user),
	'cache:posts:123', JSON.stringify(posts)
]);`,

          sessionStore: `
// Almacén de sesiones
await client.hSet('session:abc123', {
	userId: '123',
	username: 'john_doe',
	email: 'john@example.com',
	lastActivity: Date.now()
});

// Obtener sesión
const session = await client.hGetAll('session:abc123');`,

            queue: `
// Cola de trabajos
await client.lPush('jobs:queue', JSON.stringify(jobData));

// Procesar trabajos
const job = await client.brPop('jobs:queue', 10); // bloquea 10 segundos`,

              pubsub: `
// Publisher
await publisher.publish('notifications', JSON.stringify({
	type: 'message',
	userId: '123',
	content: 'Nuevo mensaje'
}));

// Subscriber
await subscriber.subscribe('notifications', (message) => {
	const data = JSON.parse(message);
	console.log('Notificación:', data);
});`,

                leaderboard: `
// Leaderboard con sorted sets
await client.zAdd('game:scores', { score: 1500, value: 'player1' });
await client.zAdd('game:scores', { score: 1200, value: 'player2' });

// Top 10
const topPlayers = await client.zRange('game:scores', 0, 9, { 
	withScores: true, 
	REV: true 
});`,

                  rateLimit: `
// Rate limiting
const key = \`rate_limit:\${userId}:\${Math.floor(Date.now() / 60000)}\`;
const current = await client.incr(key);
await client.expire(key, 60); // Expira en 1 minuto

if (current > 100) {
	throw new Error('Rate limit exceeded');
}`,

                    analytics: `
// Contadores analíticos
await client.hIncrBy('stats:daily', \`\${today}:page_views\`, 1);
await client.hIncrBy('stats:daily', \`\${today}:unique_visitors\`, 1);

// Métricas por hora
const hour = new Date().getHours();
await client.hIncrBy(\`stats:hourly:\${today}\`, hour, 1);`
    }
  };

  export default redisCommands;