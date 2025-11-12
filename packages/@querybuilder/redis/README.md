# @querybuilder/redis

Adaptador Redis para QueryBuilder - Almacén de estructuras de datos en memoria de alto rendimiento.

## 📦 Instalación

```bash
# Instalar el paquete Redis
npm install @querybuilder/core @querybuilder/redis

# Instalar cliente Redis (elige uno)
npm install redis      # Cliente oficial (recomendado)
# O
npm install ioredis    # Cliente con clustering avanzado
```

## 🚀 Uso Básico

```javascript
import { Redis } from '@querybuilder/redis';
import { createClient } from 'redis';

// Conectar a Redis
const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379
  }
});

await client.connect();

// Operaciones básicas
await client.set('user:1000', 'John Doe');
const name = await client.get('user:1000');
console.log(name); // 'John Doe'

// Con expiración (TTL de 1 hora)
await client.set('session:abc', '{"userId":1000}', { EX: 3600 });

await client.disconnect();
```

## 🔧 Estructuras de Datos

### ✅ Strings (Cadenas)
```javascript
// SET/GET básico
await client.set('key', 'value');
const value = await client.get('key');

// Con opciones
await client.set('key', 'value', {
  EX: 3600,      // Expira en 3600 segundos
  NX: true       // Solo si NO existe (SET IF NOT EXISTS)
});

// SETEX - Set con expiración
await client.setEx('session:123', 3600, '{"userId":1}');

// SETNX - Set si no existe
const wasSet = await client.setNX('lock:resource', 'locked');

// MSET/MGET - Múltiples valores
await client.mSet({
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3'
});

const values = await client.mGet(['key1', 'key2', 'key3']);

// APPEND - Agregar al final
await client.append('message', ' world');

// INCR/DECR - Incrementar/Decrementar
await client.incr('counter');
await client.incrBy('counter', 10);
await client.decr('counter');
await client.decrBy('counter', 5);

// STRLEN - Longitud de string
const length = await client.strLen('message');
```

### ✅ Hashes (Objetos)
```javascript
// HSET - Set campo en hash
await client.hSet('user:1000', 'name', 'John Doe');

// HSET múltiples campos
await client.hSet('user:1000', {
  name: 'John Doe',
  email: 'john@example.com',
  age: '30',
  city: 'New York'
});

// HGET - Obtener campo
const email = await client.hGet('user:1000', 'email');

// HMGET - Obtener múltiples campos
const [name, age] = await client.hmGet('user:1000', ['name', 'age']);

// HGETALL - Obtener todos los campos
const user = await client.hGetAll('user:1000');
console.log(user); // { name: 'John Doe', email: 'john@example.com', ... }

// HEXISTS - Verificar si existe campo
const exists = await client.hExists('user:1000', 'email');

// HDEL - Eliminar campo
await client.hDel('user:1000', 'age');

// HKEYS - Obtener todas las claves
const keys = await client.hKeys('user:1000');

// HVALS - Obtener todos los valores
const vals = await client.hVals('user:1000');

// HLEN - Número de campos
const fieldCount = await client.hLen('user:1000');

// HINCRBY - Incrementar campo numérico
await client.hIncrBy('user:1000', 'loginCount', 1);
```

### ✅ Lists (Listas)
```javascript
// LPUSH/RPUSH - Agregar al inicio/final
await client.lPush('queue:tasks', 'task1');
await client.rPush('queue:tasks', 'task2');

// Agregar múltiples elementos
await client.lPush('queue:tasks', ['task3', 'task4', 'task5']);

// LPOP/RPOP - Extraer del inicio/final
const task = await client.lPop('queue:tasks');
const lastTask = await client.rPop('queue:tasks');

// LRANGE - Obtener rango de elementos
const allTasks = await client.lRange('queue:tasks', 0, -1); // Todos
const first10 = await client.lRange('queue:tasks', 0, 9);   // Primeros 10

// LLEN - Longitud de la lista
const length = await client.lLen('queue:tasks');

// LINDEX - Obtener elemento por índice
const element = await client.lIndex('queue:tasks', 0);

// LSET - Establecer valor por índice
await client.lSet('queue:tasks', 0, 'updated-task');

// LREM - Eliminar elementos
await client.lRem('queue:tasks', 0, 'task-to-remove'); // Eliminar todas las ocurrencias

// LTRIM - Recortar lista al rango
await client.lTrim('queue:tasks', 0, 99); // Mantener solo primeros 100

// BLPOP/BRPOP - Pop bloqueante (espera hasta que haya elemento)
const result = await client.blPop('queue:tasks', 5); // Espera máximo 5 segundos
```

### ✅ Sets (Conjuntos)
```javascript
// SADD - Agregar miembros al set
await client.sAdd('tags:article:1', 'javascript');
await client.sAdd('tags:article:1', ['nodejs', 'redis', 'database']);

// SMEMBERS - Obtener todos los miembros
const tags = await client.sMembers('tags:article:1');

// SISMEMBER - Verificar si es miembro
const isMember = await client.sIsMember('tags:article:1', 'javascript');

// SCARD - Número de miembros
const count = await client.sCard('tags:article:1');

// SREM - Eliminar miembros
await client.sRem('tags:article:1', 'javascript');

// SPOP - Extraer miembro aleatorio
const randomTag = await client.sPop('tags:article:1');

// SRANDMEMBER - Obtener miembro aleatorio sin eliminar
const random = await client.sRandMember('tags:article:1');

// Operaciones de conjuntos
await client.sAdd('set1', ['a', 'b', 'c']);
await client.sAdd('set2', ['b', 'c', 'd']);

// SINTER - Intersección
const intersection = await client.sInter(['set1', 'set2']); // ['b', 'c']

// SUNION - Unión
const union = await client.sUnion(['set1', 'set2']); // ['a', 'b', 'c', 'd']

// SDIFF - Diferencia
const diff = await client.sDiff(['set1', 'set2']); // ['a']
```

### ✅ Sorted Sets (Conjuntos Ordenados)
```javascript
// ZADD - Agregar miembros con score
await client.zAdd('leaderboard', { score: 100, value: 'player1' });
await client.zAdd('leaderboard', [
  { score: 200, value: 'player2' },
  { score: 150, value: 'player3' },
  { score: 175, value: 'player4' }
]);

// ZRANGE - Obtener rango por índice
const topPlayers = await client.zRange('leaderboard', 0, 9); // Top 10

// ZRANGE con scores
const withScores = await client.zRange('leaderboard', 0, 9, { 
  REV: true,      // Orden inverso (mayor a menor)
  WITHSCORES: true 
});

// ZRANGEBYSCORE - Obtener por rango de score
const midRange = await client.zRangeByScore('leaderboard', 100, 200);

// ZRANK - Obtener posición (rank)
const rank = await client.zRank('leaderboard', 'player1');

// ZSCORE - Obtener score
const score = await client.zScore('leaderboard', 'player1');

// ZINCRBY - Incrementar score
await client.zIncrBy('leaderboard', 10, 'player1');

// ZCARD - Número de miembros
const count = await client.zCard('leaderboard');

// ZREM - Eliminar miembros
await client.zRem('leaderboard', 'player1');

// ZCOUNT - Contar en rango de score
const inRange = await client.zCount('leaderboard', 100, 200);

// ZPOPMIN/ZPOPMAX - Extraer menor/mayor
const min = await client.zPopMin('leaderboard');
const max = await client.zPopMax('leaderboard');
```

## 🎯 Características Avanzadas

### ✅ Pub/Sub (Publicación/Suscripción)
```javascript
import { createClient } from 'redis';

// Crear cliente suscriptor
const subscriber = createClient();
await subscriber.connect();

// Suscribirse a canales
await subscriber.subscribe('notifications', (message) => {
  console.log('Notificación:', message);
});

await subscriber.subscribe('alerts', (message) => {
  console.log('Alerta:', message);
});

// Suscripción con patrón
await subscriber.pSubscribe('user:*', (message, channel) => {
  console.log(`Mensaje en ${channel}:`, message);
});

// Crear cliente publicador
const publisher = createClient();
await publisher.connect();

// Publicar mensajes
await publisher.publish('notifications', 'Nuevo mensaje');
await publisher.publish('user:1000', 'Login exitoso');

// Obtener número de suscriptores
const count = await publisher.pubSubNumSub('notifications');
```

### ✅ Transacciones (MULTI/EXEC)
```javascript
// Transacción básica
const results = await client
  .multi()
  .set('key1', 'value1')
  .set('key2', 'value2')
  .incr('counter')
  .exec();

console.log('Resultados:', results);

// Transferencia entre cuentas (atómica)
await client
  .multi()
  .decrBy('account:1', 100)
  .incrBy('account:2', 100)
  .exec();

// Con WATCH (optimistic locking)
await client.watch('balance');
const balance = parseInt(await client.get('balance'));

if (balance >= 100) {
  await client
    .multi()
    .decrBy('balance', 100)
    .exec();
} else {
  await client.unwatch();
}
```

### ✅ Pipeline (Operaciones en Lote)
```javascript
// Pipeline reduce llamadas de red
const pipeline = client.multi();

for (let i = 0; i < 1000; i++) {
  pipeline.set(`key:${i}`, `value${i}`);
}

const results = await pipeline.exec();
console.log(`Insertados ${results.length} elementos`);

// Pipeline de lectura
const keys = Array.from({ length: 100 }, (_, i) => `key:${i}`);
const readPipeline = client.multi();

keys.forEach(key => readPipeline.get(key));
const values = await readPipeline.exec();
```

### ✅ Streams (Procesamiento de Eventos)
```javascript
// XADD - Agregar evento al stream
await client.xAdd('events:user', '*', {
  event: 'login',
  userId: '1000',
  ip: '192.168.1.1',
  timestamp: Date.now().toString()
});

// XREAD - Leer eventos
const events = await client.xRead(
  { key: 'events:user', id: '0' },
  { COUNT: 10, BLOCK: 5000 }
);

// XRANGE - Obtener rango de eventos
const range = await client.xRange('events:user', '-', '+', { COUNT: 100 });

// XLEN - Longitud del stream
const length = await client.xLen('events:user');

// Consumer Groups
await client.xGroupCreate('events:user', 'processors', '0', { MKSTREAM: true });

// XREADGROUP - Leer como grupo
const messages = await client.xReadGroup('processors', 'consumer1', {
  key: 'events:user',
  id: '>'
});

// XACK - Confirmar procesamiento
await client.xAck('events:user', 'processors', messageId);
```

### ✅ Expiración y TTL
```javascript
// EXPIRE - Establecer expiración en segundos
await client.set('key', 'value');
await client.expire('key', 3600); // 1 hora

// EXPIREAT - Expirar en timestamp
const timestamp = Math.floor(Date.now() / 1000) + 3600;
await client.expireAt('key', timestamp);

// TTL - Tiempo restante
const ttl = await client.ttl('key'); // Segundos restantes

// PERSIST - Eliminar expiración
await client.persist('key');

// PEXPIRE - Expiración en milisegundos
await client.pExpire('key', 60000); // 60 segundos

// PTTL - TTL en milisegundos
const pttl = await client.pTtl('key');
```

### ✅ Operaciones de Claves
```javascript
// EXISTS - Verificar existencia
const exists = await client.exists('key');

// DEL - Eliminar claves
await client.del('key1');
await client.del(['key2', 'key3', 'key4']);

// KEYS - Buscar claves (no usar en producción)
const keys = await client.keys('user:*');

// SCAN - Buscar claves (preferido)
let cursor = 0;
const allKeys = [];
do {
  const result = await client.scan(cursor, { MATCH: 'user:*', COUNT: 100 });
  cursor = result.cursor;
  allKeys.push(...result.keys);
} while (cursor !== 0);

// RENAME - Renombrar clave
await client.rename('oldKey', 'newKey');

// RENAMENX - Renombrar solo si no existe
await client.renameNX('oldKey', 'newKey');

// TYPE - Obtener tipo de dato
const type = await client.type('key'); // 'string', 'hash', 'list', etc.

// DUMP/RESTORE - Serializar/Deserializar
const serialized = await client.dump('key');
await client.restore('newKey', 0, serialized);
```

## 📖 Patrones Comunes

### Caché Cache-Aside
```javascript
async function getUserById(userId) {
  const cacheKey = `user:${userId}`;
  
  // 1. Intentar obtener de caché
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. Obtener de base de datos
  const user = await db.users.findById(userId);
  
  // 3. Guardar en caché por 1 hora
  await client.set(cacheKey, JSON.stringify(user), { EX: 3600 });
  
  return user;
}
```

### Rate Limiting
```javascript
async function checkRateLimit(userId, maxRequests = 100, windowSeconds = 3600) {
  const key = `rate_limit:${userId}`;
  const current = await client.incr(key);
  
  if (current === 1) {
    await client.expire(key, windowSeconds);
  }
  
  return current <= maxRequests;
}

// Uso
if (await checkRateLimit('user:1000')) {
  // Permitir request
} else {
  // Denegar - límite excedido
}
```

### Distributed Lock
```javascript
async function acquireLock(resource, ttl = 10000) {
  const lockKey = `lock:${resource}`;
  const lockValue = crypto.randomUUID();
  
  const acquired = await client.set(lockKey, lockValue, {
    NX: true,
    PX: ttl
  });
  
  return acquired ? lockValue : null;
}

async function releaseLock(resource, lockValue) {
  const lockKey = `lock:${resource}`;
  
  // Usar Lua script para verificar y eliminar atómicamente
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  
  return await client.eval(script, {
    keys: [lockKey],
    arguments: [lockValue]
  });
}
```

### Session Store
```javascript
class RedisSessionStore {
  constructor(client, ttl = 3600) {
    this.client = client;
    this.ttl = ttl;
  }
  
  async set(sessionId, data) {
    const key = `session:${sessionId}`;
    await this.client.set(key, JSON.stringify(data), { EX: this.ttl });
  }
  
  async get(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async destroy(sessionId) {
    const key = `session:${sessionId}`;
    await this.client.del(key);
  }
  
  async touch(sessionId) {
    const key = `session:${sessionId}`;
    await this.client.expire(key, this.ttl);
  }
}
```

### Leaderboard
```javascript
class Leaderboard {
  constructor(client, key) {
    this.client = client;
    this.key = key;
  }
  
  async addScore(player, score) {
    await this.client.zAdd(this.key, { score, value: player });
  }
  
  async getTopPlayers(count = 10) {
    return await this.client.zRange(this.key, 0, count - 1, {
      REV: true,
      WITHSCORES: true
    });
  }
  
  async getPlayerRank(player) {
    return await this.client.zRevRank(this.key, player);
  }
  
  async getPlayerScore(player) {
    return await this.client.zScore(this.key, player);
  }
  
  async getPlayersInRange(min, max) {
    return await this.client.zRangeByScore(this.key, min, max, {
      WITHSCORES: true
    });
  }
}
```

## 🔌 Configuración Avanzada

### Cliente Redis Oficial
```javascript
import { createClient } from 'redis';

const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Demasiados reintentos');
      }
      return Math.min(retries * 50, 500);
    }
  },
  password: 'mi-password',
  database: 0,
  name: 'mi-app',
  readonly: false
});

client.on('error', (err) => console.error('Redis Error:', err));
client.on('connect', () => console.log('Redis Conectado'));
client.on('reconnecting', () => console.log('Redis Reconectando...'));

await client.connect();
```

### IORedis (Clustering)
```javascript
import Redis from 'ioredis';

const client = new Redis.Cluster([
  { host: 'localhost', port: 7000 },
  { host: 'localhost', port: 7001 },
  { host: 'localhost', port: 7002 }
], {
  redisOptions: {
    password: 'mi-password'
  },
  clusterRetryStrategy: (times) => {
    return Math.min(100 * times, 2000);
  }
});

// Sentinel para alta disponibilidad
const sentinelClient = new Redis({
  sentinels: [
    { host: 'localhost', port: 26379 },
    { host: 'localhost', port: 26380 }
  ],
  name: 'mymaster'
});
```

## 🧪 Testing

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from 'redis';

test('Redis operations', async () => {
  const client = createClient();
  await client.connect();
  
  try {
    // Test SET/GET
    await client.set('test:key', 'test-value');
    const value = await client.get('test:key');
    assert.equal(value, 'test-value');
    
    // Test HASH
    await client.hSet('test:hash', { field1: 'value1' });
    const hash = await client.hGetAll('test:hash');
    assert.deepEqual(hash, { field1: 'value1' });
    
    // Cleanup
    await client.del(['test:key', 'test:hash']);
  } finally {
    await client.disconnect();
  }
});
```

## ⚡ Características Redis

- **En memoria**: Almacenamiento ultra-rápido con persistencia opcional
- **Estructuras ricas**: Strings, Hashes, Lists, Sets, Sorted Sets, Streams
- **Pub/Sub**: Mensajería en tiempo real
- **Transacciones**: Operaciones atómicas con MULTI/EXEC
- **Clustering**: Escalabilidad horizontal
- **Replicación**: Alta disponibilidad con Sentinel
- **Persistencia**: RDB snapshots y AOF logs
- **Lua scripting**: Operaciones complejas atómicas

## 📄 Casos de Uso

- **Caché**: Reducir carga en base de datos
- **Session Store**: Almacenar sesiones de usuario
- **Rate Limiting**: Controlar frecuencia de requests
- **Leaderboards**: Rankings en tiempo real
- **Real-time Analytics**: Contadores y métricas
- **Message Queue**: Colas de trabajo con Lists
- **Pub/Sub**: Chat, notificaciones en tiempo real
- **Geospatial**: Búsquedas por ubicación

## 📄 Licencia

MPL-2.0

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en el repositorio.

## 🔗 Enlaces

- [@querybuilder/core](../core/README.md)
- [@querybuilder/mongodb](../mongodb/README.md)
- [@querybuilder/mysql](../mysql/README.md)
- [@querybuilder/postgresql](../postgresql/README.md)
- [@querybuilder/sqlite](../sqlite/README.md)
- [Redis Documentation](https://redis.io/docs/)
- [Node Redis Client](https://github.com/redis/node-redis)
- [IORedis](https://github.com/luin/ioredis)
