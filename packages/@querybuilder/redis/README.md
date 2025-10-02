# Redis Integration for QueryBuilder# @querybuilder/redis



Integración completa de Redis con QueryBuilder, proporcionando operaciones de cache, estructuras de datos en memoria, pub/sub y más.Un driver Redis profesional para QueryBuilder que proporciona soporte completo para operaciones de base de datos clave-valor, caché, pub/sub y más.



## 🚀 Características Principales## Instalación



- **Cache de Alto Rendimiento**: Almacenamiento en memoria ultra-rápido```bash

- **Estructuras de Datos Nativas**: Strings, Hashes, Lists, Sets, Sorted Setsnpm install @querybuilder/redis

- **Pub/Sub en Tiempo Real**: Mensajería y eventos# También necesitas uno de estos clientes Redis:

- **Transacciones Atómicas**: Operaciones ACIDnpm install redis     # Cliente oficial Redis

- **Streams**: Procesamiento de eventos y logs# o

- **TTL y Expiración**: Gestión automática de memorianpm install ioredis   # Cliente IORedis (recomendado para clustering)

- **Pipeline y Clustering**: Operaciones masivas y escalabilidad```



## 📦 Instalación## Características Principales



```bash### 🚀 Soporte Multi-Cliente

npm install @querybuilder/redis redis- **redis**: Cliente oficial Redis con soporte completo

```- **ioredis**: Cliente avanzado con clustering automático

- Auto-detección del cliente disponible

## 🔧 Configuración

### 📊 Estructuras de Datos Redis

### Servidor Redis- **Strings**: SET, GET, INCR, DECR, APPEND

- **Hashes**: HSET, HGET, HMSET, HMGET, HDEL

```bash- **Lists**: LPUSH, RPUSH, LPOP, RPOP, LRANGE

# Docker (recomendado)- **Sets**: SADD, SREM, SMEMBERS, SINTER, SUNION

docker run -d -p 6379:6379 --name redis redis:alpine- **Sorted Sets**: ZADD, ZRANGE, ZREVRANGE, ZSCORE

- **Streams**: XADD, XREAD, XGROUP, XACK

# O instalación local- **Bitmaps**: SETBIT, GETBIT, BITCOUNT, BITOP

# Ubuntu/Debian- **HyperLogLog**: PFADD, PFCOUNT, PFMERGE

sudo apt install redis-server

### 🔧 Características Avanzadas

# macOS- **Transacciones**: MULTI, EXEC, DISCARD, WATCH

brew install redis- **Pipelines**: Ejecución en lote optimizada

```- **Pub/Sub**: PUBLISH, SUBSCRIBE, PSUBSCRIBE

- **Clustering**: Soporte automático para Redis Cluster

### Cliente Básico- **Scripting**: Ejecución de scripts Lua

- **Geoespacial**: GEOADD, GEORADIUS, GEODIST

```javascript

import Redis from '@querybuilder/redis';## Uso Básico



const redis = new Redis({```javascript

  host: 'localhost',import { Redis } from '@querybuilder/redis';

  port: 6379,

  password: 'your-password', // opcional// Conexión simple

  database: 0,const redis = new Redis({

  keyPrefix: 'myapp:', // opcional  host: 'localhost',

});  port: 6379,

```  database: 0

});

## 🎯 Casos de Uso Principales

// Conectar

### 1. Cache de Aplicaciónawait redis.connect();



```javascript// Operaciones básicas

// Cache básico con TTLawait redis.set('user:1', 'John Doe');

const result = redis.set('user:123', JSON.stringify(userData), { EX: 3600 });const user = await redis.get('user:1');

console.log(result.command); // client.set('user:123', '...', { EX: 3600 })console.log(user); // "John Doe"



// Obtener desde cache// Operaciones con expiración

const cached = redis.get('user:123');await redis.setex('session:abc123', 3600, 'user_data');



// Cache múltiple// Cerrar conexión

const cacheMultiple = redis.mset({await redis.disconnect();

  'user:123': JSON.stringify(user1),```

  'user:456': JSON.stringify(user2),

  'user:789': JSON.stringify(user3)## Ejemplos de Uso

});

```### 1. Sistema de Caché



### 2. Sesiones de Usuario```javascript

import { Redis } from '@querybuilder/redis';

```javascript

// Almacenar sesión como hashclass CacheService {

const session = redis.hset('session:abc123', 'userId', '123');  constructor() {

const userInfo = redis.hset('session:abc123', 'username', 'john_doe');    this.redis = new Redis({

      host: process.env.REDIS_HOST || 'localhost',

// Obtener datos de sesión      port: process.env.REDIS_PORT || 6379

const sessionData = redis.hgetall('session:abc123');    });

  }

// TTL para sesión

const expire = redis.expire('session:abc123', 1800); // 30 minutos  async get(key) {

```    try {

      const cached = await this.redis.get(`cache:${key}`);

### 3. Colas de Trabajos      return cached ? JSON.parse(cached) : null;

    } catch (error) {

```javascript      console.error('Cache get error:', error);

// Añadir trabajo a cola      return null;

const addJob = redis.lpush('jobs:queue', JSON.stringify({    }

  type: 'email',  }

  userId: '123',

  template: 'welcome'  async set(key, data, ttl = 3600) {

}));    try {

      const value = JSON.stringify(data);

// Procesar trabajos (FIFO)      await this.redis.setex(`cache:${key}`, ttl, value);

const processJob = redis.rpop('jobs:queue');      return true;

    } catch (error) {

// Cola de prioridad con sorted sets      console.error('Cache set error:', error);

const priorityJob = redis.zadd('jobs:priority', 10, JSON.stringify(jobData));      return false;

```    }

  }

### 4. Contadores y Estadísticas

  async invalidate(pattern) {

```javascript    const keys = await this.redis.keys(`cache:${pattern}`);

// Incrementar contador    if (keys.length > 0) {

const pageViews = redis.incr('stats:page_views');      await this.redis.del(...keys);

const dailyVisits = redis.incr(`stats:visits:${today}`);    }

  }

// Contadores con incremento específico}

const score = redis.incr('user:123:score', 5);

// Uso

// Estadísticas por categoríaconst cache = new CacheService();

const categoryStats = redis.hincrby('stats:categories', 'technology', 1);await cache.connect();

```

// Cachear datos de usuario

### 5. Leaderboards y Rankingsawait cache.set('user:123', { name: 'John', email: 'john@example.com' }, 1800);



```javascript// Recuperar del caché

// Añadir puntuaciónconst user = await cache.get('user:123');

const addScore = redis.zadd('game:leaderboard', 1500, 'player1');```



// Top 10 jugadores### 2. Rate Limiting

const topPlayers = redis.zrange('game:leaderboard', 0, 9, { 

  withScores: true, ```javascript

  REV: true class RateLimiter {

});  constructor(redis) {

    this.redis = redis;

// Posición de jugador  }

const playerRank = redis.zrank('game:leaderboard', 'player1');

```  async checkLimit(identifier, maxRequests = 100, windowSeconds = 3600) {

    const key = `rate_limit:${identifier}`;

## 🛠️ API Completa    

    // Usar pipeline para operaciones atómicas

### Operaciones de String    const pipeline = this.redis.pipeline();

    pipeline.incr(key);

```javascript    pipeline.expire(key, windowSeconds);

// SET - Establecer valor    

redis.set(key, value, options)    const results = await pipeline.exec();

redis.set('name', 'John', { EX: 3600 }) // con TTL    const currentCount = results[0][1];

    

// GET - Obtener valor    if (currentCount <= maxRequests) {

redis.get(key)      return {

        allowed: true,

// MGET/MSET - Múltiples valores        remaining: maxRequests - currentCount,

redis.mget(['key1', 'key2', 'key3'])        resetTime: Date.now() + (windowSeconds * 1000)

redis.mset({ key1: 'value1', key2: 'value2' })      };

    }

// Operaciones numéricas    

redis.incr(key, increment = 1)    const ttl = await this.redis.ttl(key);

redis.decr(key, decrement = 1)    return {

```      allowed: false,

      remaining: 0,

### Operaciones de Hash      resetTime: Date.now() + (ttl * 1000)

    };

```javascript  }

// HSET - Establecer campo}

redis.hset(key, field, value)```

redis.hmset(key, { field1: 'value1', field2: 'value2' })

### 3. Sistema de Sesiones

// HGET - Obtener campo

redis.hget(key, field)```javascript

redis.hmget(key, ['field1', 'field2'])class SessionManager {

redis.hgetall(key) // todos los campos  constructor(redis) {

    this.redis = redis;

// HDEL - Eliminar campo    this.sessionTTL = 24 * 60 * 60; // 24 horas

redis.hdel(key, ['field1', 'field2'])  }

```

  async createSession(userId, sessionData) {

### Operaciones de Lista    const sessionId = this.generateSessionId();

    const sessionKey = `session:${sessionId}`;

```javascript    

// PUSH - Añadir elementos    const data = {

redis.lpush(key, values) // al inicio      userId,

redis.rpush(key, values) // al final      createdAt: Date.now(),

      lastAccess: Date.now(),

// POP - Obtener y eliminar      ...sessionData

redis.lpop(key) // del inicio    };

redis.rpop(key) // del final    

    await this.redis.hmset(sessionKey, data);

// RANGE - Obtener rango    await this.redis.expire(sessionKey, this.sessionTTL);

redis.lrange(key, start, stop)    

redis.llen(key) // longitud    return sessionId;

```  }



### Operaciones de Set  async getSession(sessionId) {

    const sessionKey = `session:${sessionId}`;

```javascript    const sessionData = await this.redis.hgetall(sessionKey);

// SADD - Añadir miembros    

redis.sadd(key, members)    if (Object.keys(sessionData).length === 0) {

      return null;

// Operaciones de set    }

redis.smembers(key) // todos los miembros    

redis.sismember(key, member) // verificar existencia    // Actualizar último acceso

redis.srem(key, members) // eliminar miembros    await this.redis.hset(sessionKey, 'lastAccess', Date.now());

    await this.redis.expire(sessionKey, this.sessionTTL);

// Operaciones entre sets    

redis.sinter([key1, key2]) // intersección    return sessionData;

redis.sunion([key1, key2]) // unión  }

```

  async destroySession(sessionId) {

### Operaciones de Sorted Set    const sessionKey = `session:${sessionId}`;

    await this.redis.del(sessionKey);

```javascript  }

// ZADD - Añadir con puntuación

redis.zadd(key, score, member)  generateSessionId() {

    return require('crypto').randomBytes(32).toString('hex');

// Rangos  }

redis.zrange(key, start, stop, options)}

redis.zrangebyscore(key, min, max, options)```



// Puntuaciones### 4. Sistema de Colas (Job Queue)

redis.zscore(key, member)

redis.zrank(key, member) // posición```javascript

```class JobQueue {

  constructor(redis, queueName = 'default') {

### Gestión de Claves    this.redis = redis;

    this.queueName = queueName;

```javascript    this.processingKey = `processing:${queueName}`;

// Operaciones básicas  }

redis.del(keys) // eliminar

redis.exists(key) // verificar existencia  async addJob(jobData, priority = 0) {

redis.type(key) // tipo de dato    const job = {

      id: this.generateJobId(),

// TTL y expiración      data: jobData,

redis.expire(key, seconds)      createdAt: Date.now(),

redis.ttl(key) // tiempo restante      priority

    };

// Búsqueda    

redis.keys(pattern) // buscar por patrón    // Usar sorted set para prioridad

```    await this.redis.zadd(

      `queue:${this.queueName}`, 

### Pub/Sub      priority, 

      JSON.stringify(job)

```javascript    );

// Publicar mensaje    

redis.publish(channel, message)    return job.id;

  }

// Suscribirse

redis.subscribe(channels, callback)  async processJob() {

redis.unsubscribe(channels)    // Mover job de cola principal a cola de procesamiento

    const result = await this.redis.zpopmax(`queue:${this.queueName}`);

// Pattern subscription    

redis.psubscribe(patterns, callback)    if (!result || result.length === 0) {

```      return null; // No hay jobs

    }

### Transacciones    

    const jobData = JSON.parse(result[0]);

```javascript    

// Transacción básica    // Agregar a cola de procesamiento

const multi = redis.multi()    await this.redis.hset(

// ... añadir comandos      this.processingKey, 

const results = redis.exec()      jobData.id, 

      JSON.stringify(jobData)

// Con WATCH    );

redis.watch(keys)    

// ... transacción    return jobData;

redis.unwatch()  }

```

  async completeJob(jobId) {

## 🔄 Compatibilidad QueryBuilder    await this.redis.hdel(this.processingKey, jobId);

  }

Redis mantiene compatibilidad con la API de QueryBuilder:

  async failJob(jobId, error) {

```javascript    const jobData = await this.redis.hget(this.processingKey, jobId);

// SELECT equivalente    if (jobData) {

redis.select({ key: 'user:123' }) // → redis.get('user:123')      const job = JSON.parse(jobData);

redis.select({ pattern: 'user:*' }) // → redis.keys('user:*')      job.error = error;

      job.failedAt = Date.now();

// INSERT equivalente      

redis.insert({ key: 'user:123', value: 'data' }) // → redis.set()      // Mover a cola de fallidos

      await this.redis.hset(

// UPDATE equivalente          `failed:${this.queueName}`, 

redis.update({ key: 'user:123', value: 'newdata' }) // → redis.set(..., {XX: true})        jobId, 

        JSON.stringify(job)

// DELETE equivalente      );

redis.delete({ key: 'user:123' }) // → redis.del(['user:123'])      await this.redis.hdel(this.processingKey, jobId);

```    }

  }

## 📊 Ejemplos Avanzados

  generateJobId() {

### Cache Inteligente    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  }

```javascript}

class SmartCache {```

  constructor(redis) {

    this.redis = redis;### 5. Leaderboards / Rankings

  }

```javascript

  async get(key, fallbackFn, ttl = 3600) {class Leaderboard {

    // Intentar obtener de cache  constructor(redis, name) {

    let cached = await this.redis.get(key);    this.redis = redis;

        this.key = `leaderboard:${name}`;

    if (!cached) {  }

      // Si no existe, ejecutar fallback y cachear

      const data = await fallbackFn();  async addScore(userId, score) {

      await this.redis.set(key, JSON.stringify(data), { EX: ttl });    await this.redis.zadd(this.key, score, userId);

      return data;  }

    }

      async getTopPlayers(count = 10) {

    return JSON.parse(cached);    const results = await this.redis.zrevrange(

  }      this.key, 

}      0, 

      count - 1, 

// Uso      'WITHSCORES'

const cache = new SmartCache(redis);    );

const user = await cache.get('user:123', () => database.getUser(123));    

```    const players = [];

    for (let i = 0; i < results.length; i += 2) {

### Rate Limiting      players.push({

        userId: results[i],

```javascript        score: parseInt(results[i + 1]),

class RateLimiter {        rank: Math.floor(i / 2) + 1

  constructor(redis) {      });

    this.redis = redis;    }

  }    

    return players;

  async checkLimit(userId, limit = 100, window = 60) {  }

    const key = `rate_limit:${userId}:${Math.floor(Date.now() / (window * 1000))}`;

      async getUserRank(userId) {

    const current = await this.redis.incr(key);    const rank = await this.redis.zrevrank(this.key, userId);

    await this.redis.expire(key, window);    const score = await this.redis.zscore(this.key, userId);

        

    return {    return {

      allowed: current <= limit,      userId,

      remaining: Math.max(0, limit - current),      rank: rank !== null ? rank + 1 : null,

      reset: Date.now() + (window * 1000)      score: score ? parseInt(score) : 0

    };    };

  }  }

}

```  async getUsersAroundRank(userId, range = 5) {

    const userRank = await this.redis.zrevrank(this.key, userId);

### Real-time Analytics    if (userRank === null) return [];

    

```javascript    const start = Math.max(0, userRank - range);

class Analytics {    const end = userRank + range;

  constructor(redis) {    

    this.redis = redis;    return await this.getPlayersByRange(start, end);

  }  }



  async trackEvent(event, userId, metadata = {}) {  async getPlayersByRange(start, end) {

    const today = new Date().toISOString().split('T')[0];    const results = await this.redis.zrevrange(

    const hour = new Date().getHours();      this.key, 

          start, 

    // Contadores globales      end, 

    await this.redis.incr(`analytics:${event}:${today}`);      'WITHSCORES'

    await this.redis.incr(`analytics:${event}:${today}:${hour}`);    );

        

    // Por usuario    const players = [];

    await this.redis.hincrby(`analytics:users:${today}`, userId, 1);    for (let i = 0; i < results.length; i += 2) {

          players.push({

    // Eventos únicos        userId: results[i],

    await this.redis.sadd(`analytics:unique:${event}:${today}`, userId);        score: parseInt(results[i + 1]),

            rank: start + Math.floor(i / 2) + 1

    // Metadata      });

    if (Object.keys(metadata).length > 0) {    }

      await this.redis.lpush(`analytics:events:${event}`, JSON.stringify({    

        userId,    return players;

        timestamp: Date.now(),  }

        ...metadata}

      }));```

    }

  }### 6. Pub/Sub Real-time



  async getDailyStats(date) {```javascript

    const events = await this.redis.keys(`analytics:*:${date}`);class PubSubManager {

    const stats = {};  constructor(redis) {

        this.redis = redis;

    for (const key of events) {    this.subscribers = new Map();

      const count = await this.redis.get(key);  }

      stats[key] = parseInt(count);

    }  async publish(channel, message) {

        const data = {

    return stats;      timestamp: Date.now(),

  }      message: typeof message === 'object' ? JSON.stringify(message) : message

}    };

```    

    return await this.redis.publish(channel, JSON.stringify(data));

## 🚦 Mejores Prácticas  }



### 1. Gestión de Memoria  async subscribe(channel, callback) {

    if (!this.subscribers.has(channel)) {

```javascript      this.subscribers.set(channel, new Set());

// Usar TTL para datos temporales      

redis.set('session:123', data, { EX: 1800 }); // 30 minutos      await this.redis.subscribe(channel, (receivedChannel, message) => {

        if (receivedChannel === channel) {

// Limpiar claves old data          const data = JSON.parse(message);

redis.eval(`          const callbacks = this.subscribers.get(channel);

  local keys = redis.call('KEYS', ARGV[1])          

  local deleted = 0          if (callbacks) {

  for i=1,#keys do            callbacks.forEach(cb => cb(data));

    redis.call('DEL', keys[i])          }

    deleted = deleted + 1        }

  end      });

  return deleted    }

`, [], ['old_data:*']);    

```    this.subscribers.get(channel).add(callback);

  }

### 2. Operaciones Atómicas

  async unsubscribe(channel, callback) {

```javascript    const callbacks = this.subscribers.get(channel);

// Usar transacciones para operaciones relacionadas    if (callbacks) {

const multi = redis.multi();      callbacks.delete(callback);

multi.hincrby('user:123', 'balance', -100);      

multi.hincrby('user:456', 'balance', 100);      if (callbacks.size === 0) {

multi.lpush('transactions', JSON.stringify(transactionData));        await this.redis.unsubscribe(channel);

const results = await multi.exec();        this.subscribers.delete(channel);

```      }

    }

### 3. Patrones de Claves  }



```javascript  async patternSubscribe(pattern, callback) {

// Estructura jerárquica clara    await this.redis.psubscribe(pattern, (pattern, channel, message) => {

const patterns = {      const data = JSON.parse(message);

  user: (id) => `user:${id}`,      callback(channel, data);

  session: (id) => `session:${id}`,    });

  cache: (type, id) => `cache:${type}:${id}`,  }

  stats: (metric, date) => `stats:${metric}:${date}`}

};

```// Uso del Pub/Sub

const pubsub = new PubSubManager(redis);

### 4. Monitoring y Debugging

// Suscribirse a notificaciones de usuario

```javascriptawait pubsub.subscribe('user:notifications', (data) => {

// Información del servidor  console.log('Nueva notificación:', data);

const serverInfo = redis.info();});

const memoryInfo = redis.info('memory');

// Publicar notificación

// Comandos de diagnósticoawait pubsub.publish('user:notifications', {

const slowLog = redis.eval('return redis.call("SLOWLOG", "GET", 10)');  type: 'message',

const clientList = redis.eval('return redis.call("CLIENT", "LIST")');  userId: 123,

```  content: 'Tienes un nuevo mensaje'

});

## 🧪 Testing```



```javascript## Configuración de Clustering

import { describe, test, expect } from 'vitest';

import Redis from '@querybuilder/redis';```javascript

import { Redis } from '@querybuilder/redis';

describe('Redis Integration', () => {

  test('should perform basic operations', () => {// Configuración para Redis Cluster

    const redis = new Redis();const redis = new Redis({

      cluster: true,

    const setCmd = redis.set('test', 'value');  nodes: [

    expect(setCmd.command).toBe("client.set('test', 'value')");    { host: '127.0.0.1', port: 7000 },

        { host: '127.0.0.1', port: 7001 },

    const getCmd = redis.get('test');    { host: '127.0.0.1', port: 7002 }

    expect(getCmd.command).toBe("client.get('test')");  ],

  });  redisOptions: {

});    password: 'your-password'

```  }

});

## 📈 Performance Tips```



1. **Pipeline Operations**: Agrupa múltiples comandos## Scripts Lua

2. **Use Appropriate Data Types**: Elige la estructura correcta

3. **Set TTL**: Evita memory leaks```javascript

4. **Monitor Memory**: Usa `INFO memory`// Contador atómico con límite

5. **Connection Pooling**: Para aplicaciones con alta concurrenciaconst atomicCounterScript = `

  local key = KEYS[1]

## 🔗 Recursos  local limit = tonumber(ARGV[1])

  local current = redis.call('GET', key)

- [Redis Documentation](https://redis.io/documentation)  

- [Redis Commands Reference](https://redis.io/commands)  if current == false then

- [QueryBuilder Core](../core/README.md)    redis.call('SET', key, 1)

- [Examples](./examples/)    return 1

  end

## 🤝 Contribución  

  current = tonumber(current)

1. Fork el repositorio  if current < limit then

2. Crear branch: `git checkout -b feature/redis-enhancement`    return redis.call('INCR', key)

3. Commit: `git commit -am 'Add Redis feature'`  else

4. Push: `git push origin feature/redis-enhancement`    return -1

5. Pull Request  end

`;

## 📄 Licencia

const result = await redis.eval(

MIT © QueryBuilder Team  atomicCounterScript, 

  1, 

---  'counter:api_calls', 

  1000

**Redis** - La base de datos en memoria más popular del mundo, ahora integrada perfectamente con QueryBuilder! 🚀);
```

## Transacciones

```javascript
// Transferencia atómica entre cuentas
async function transferFunds(fromAccount, toAccount, amount) {
  const multi = redis.multi();
  
  // Verificar balance
  const balance = await redis.get(`balance:${fromAccount}`);
  if (parseFloat(balance) < amount) {
    throw new Error('Fondos insuficientes');
  }
  
  // Realizar transferencia
  multi.decrby(`balance:${fromAccount}`, amount);
  multi.incrby(`balance:${toAccount}`, amount);
  multi.zadd('transactions', Date.now(), `${fromAccount}:${toAccount}:${amount}`);
  
  const results = await multi.exec();
  return results.every(result => result[0] === null); // Sin errores
}
```

## Monitoreo y Estadísticas

```javascript
class RedisMonitor {
  constructor(redis) {
    this.redis = redis;
  }

  async getInfo() {
    const info = await this.redis.info();
    return this.parseInfo(info);
  }

  async getMemoryUsage() {
    const info = await this.redis.info('memory');
    const parsed = this.parseInfo(info);
    
    return {
      used: parsed.used_memory_human,
      peak: parsed.used_memory_peak_human,
      percentage: parsed.used_memory_percentage || 'N/A'
    };
  }

  async getConnectedClients() {
    const info = await this.redis.info('clients');
    const parsed = this.parseInfo(info);
    return parseInt(parsed.connected_clients);
  }

  async getCommandStats() {
    const info = await this.redis.info('commandstats');
    const parsed = this.parseInfo(info);
    
    const stats = {};
    Object.keys(parsed).forEach(key => {
      if (key.startsWith('cmdstat_')) {
        const command = key.replace('cmdstat_', '');
        const match = parsed[key].match(/calls=(\d+),usec=(\d+)/);
        if (match) {
          stats[command] = {
            calls: parseInt(match[1]),
            totalTime: parseInt(match[2]),
            avgTime: parseInt(match[2]) / parseInt(match[1])
          };
        }
      }
    });
    
    return stats;
  }

  parseInfo(infoString) {
    const info = {};
    infoString.split('\r\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          info[key] = value;
        }
      }
    });
    return info;
  }
}
```

## Best Practices

### 1. Gestión de Conexiones
```javascript
// Usar pool de conexiones
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true
});

// Manejar eventos de conexión
redis.on('connect', () => console.log('Redis conectado'));
redis.on('error', (err) => console.error('Redis error:', err));
redis.on('close', () => console.log('Redis desconectado'));
```

### 2. Naming Conventions
```javascript
// Usar namespaces claros
const userKey = `user:${userId}`;
const sessionKey = `session:${sessionId}`;
const cacheKey = `cache:products:${categoryId}`;

// Incluir TTL en el nombre cuando sea relevante
const shortCacheKey = `cache:1h:product:${productId}`;
const longCacheKey = `cache:24h:category:${categoryId}`;
```

### 3. Manejo de Errores
```javascript
class SafeRedisClient {
  constructor(redis) {
    this.redis = redis;
  }

  async safeGet(key, defaultValue = null) {
    try {
      const result = await this.redis.get(key);
      return result !== null ? result : defaultValue;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return defaultValue;
    }
  }

  async safeSet(key, value, ttl = null) {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }
}
```

## API Reference

### Métodos de Conexión
- `connect()` - Establecer conexión
- `disconnect()` - Cerrar conexión
- `ping()` - Verificar conectividad

### Operaciones String
- `set(key, value)` - Establecer valor
- `get(key)` - Obtener valor
- `setex(key, seconds, value)` - Set con expiración
- `incr(key)` - Incrementar
- `decr(key)` - Decrementar
- `append(key, value)` - Agregar al final

### Operaciones Hash
- `hset(key, field, value)` - Set campo hash
- `hget(key, field)` - Get campo hash
- `hmset(key, object)` - Set múltiples campos
- `hgetall(key)` - Get todos los campos
- `hdel(key, ...fields)` - Eliminar campos

### Operaciones List
- `lpush(key, ...values)` - Push izquierda
- `rpush(key, ...values)` - Push derecha
- `lpop(key)` - Pop izquierda
- `rpop(key)` - Pop derecha
- `lrange(key, start, stop)` - Rango de lista

### Operaciones Set
- `sadd(key, ...members)` - Agregar miembros
- `srem(key, ...members)` - Remover miembros
- `smembers(key)` - Todos los miembros
- `sinter(...keys)` - Intersección
- `sunion(...keys)` - Unión

### Operaciones Sorted Set
- `zadd(key, score, member)` - Agregar con score
- `zrange(key, start, stop)` - Rango por posición
- `zrevrange(key, start, stop)` - Rango reverso
- `zscore(key, member)` - Obtener score
- `zrank(key, member)` - Obtener ranking

## Licencia

MIT License - ver archivo LICENSE para detalles.

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Soporte

- **Documentación**: [QueryBuilder Docs](https://github.com/tu-usuario/querybuilder)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/querybuilder/issues)
- **Redis Docs**: [Redis Official Documentation](https://redis.io/documentation)