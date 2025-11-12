# @querybuilder/cassandra# @querybuilder/cassandra



Adaptador Apache Cassandra para QueryBuilder - Base de datos NoSQL distribuida para Big Data y alta disponibilidad.Integración de Apache Cassandra para QueryBuilder - Base de datos NoSQL distribuida para aplicaciones Big Data y de alta escala.



## 📦 Instalación## Características



```bash- 🌐 **Distribuida**: Soporte completo para clustering y distribución horizontal

# Instalar el paquete Cassandra- 📊 **Big Data**: Optimizada para grandes volúmenes de datos y alta concurrencia

npm install @querybuilder/core @querybuilder/cassandra- ⚡ **Alto Rendimiento**: Operaciones CQL eficientes con consistencia configurable

- 🔧 **QueryBuilder**: Integración completa con la metodología QueryBuilder

# Instalar driver Cassandra- 📦 **Collections**: Soporte para listas, sets, maps y tipos definidos por el usuario

npm install cassandra-driver- ⏰ **Time-Series**: Patrones optimizados para datos de series temporales

```- 🔍 **Indexación**: Índices secundarios y consultas flexibles

- 🎯 **Consistency**: Niveles de consistencia configurables para cada operación

## 🚀 Uso Básico

## Instalación

```javascript

import { Cassandra } from '@querybuilder/cassandra';```bash

import { Client } from 'cassandra-driver';npm install @querybuilder/cassandra

# o

// Conectar a Cassandrapnpm add @querybuilder/cassandra

const client = new Client({```

  contactPoints: ['127.0.0.1'],

  localDataCenter: 'datacenter1',## Uso Básico

  keyspace: 'myapp'

});### Conexión



await client.connect();```javascript

console.log('Conectado a Cassandra');import Cassandra from '@querybuilder/cassandra';



// Operaciones básicasconst cassandra = new Cassandra({

await client.execute(    contactPoints: ['127.0.0.1'],

  'INSERT INTO users (user_id, name, email) VALUES (?, ?, ?)',    localDataCenter: 'datacenter1',

  [uuid(), 'John Doe', 'john@example.com'],    keyspace: 'my_app'

  { prepare: true }});

);

await cassandra.connect();

await client.shutdown();```

```

### Operaciones de Keyspace

## 🔧 Keyspaces y Tablas

```javascript

### ✅ Crear Keyspace// Crear keyspace

```javascriptawait cassandra.createKeyspace('my_app', {

// Keyspace con SimpleStrategy (desarrollo/testing)    replication: {

await client.execute(`        class: 'SimpleStrategy',

  CREATE KEYSPACE IF NOT EXISTS myapp        replication_factor: 3

  WITH replication = {    },

    'class': 'SimpleStrategy',    durableWrites: true

    'replication_factor': 3});

  }

  AND durable_writes = true// Usar keyspace

`);await cassandra.useKeyspace('my_app');



// Keyspace con NetworkTopologyStrategy (producción multi-datacenter)// Eliminar keyspace

await client.execute(`await cassandra.dropKeyspace('my_app');

  CREATE KEYSPACE IF NOT EXISTS production```

  WITH replication = {

    'class': 'NetworkTopologyStrategy',### Operaciones de Tablas

    'datacenter1': 3,

    'datacenter2': 2```javascript

  }// Crear tabla

`);await cassandra.createTable('users', {

    id: 'uuid',

// Usar keyspace    email: 'text',

await client.execute('USE myapp');    name: 'text',

```    age: 'int',

    created_at: 'timestamp',

### ✅ Crear Tablas    tags: 'set<text>',

```javascript    metadata: 'map<text, text>'

// Tabla básica con partition key simple}, {

await client.execute(`    primaryKey: 'id',

  CREATE TABLE IF NOT EXISTS users (    ifNotExists: true

    user_id uuid PRIMARY KEY,});

    name text,

    email text,// Crear tabla con clustering

    created_at timestampawait cassandra.createTable('user_sessions', {

  )    user_id: 'uuid',

`);    session_start: 'timestamp',

    activity: 'text',

// Tabla con partition key y clustering columns    duration: 'int'

await client.execute(`}, {

  CREATE TABLE IF NOT EXISTS user_events (    primaryKey: ['user_id', 'session_start'],

    user_id uuid,    clusteringOrder: 'session_start DESC'

    event_time timestamp,});

    event_type text,```

    data map<text, text>,

    PRIMARY KEY (user_id, event_time)## Operaciones de Datos

  ) WITH CLUSTERING ORDER BY (event_time DESC)

`);### Insertar



// Tabla con partition key compuesta (para distribución)```javascript

await client.execute(`// Inserción básica

  CREATE TABLE IF NOT EXISTS sensor_data (await cassandra.insert('users', {

    sensor_id uuid,    id: cassandra.uuid(),

    bucket_date date,    email: 'user@example.com',

    reading_time timestamp,    name: 'John Doe',

    temperature decimal,    age: 30,

    humidity decimal,    created_at: new Date(),

    PRIMARY KEY ((sensor_id, bucket_date), reading_time)    tags: ['premium', 'verified'],

  ) WITH CLUSTERING ORDER BY (reading_time DESC)    metadata: { source: 'web', version: '1.0' }

    AND default_time_to_live = 2592000  -- 30 días});

    AND compaction = {

      'class': 'TimeWindowCompactionStrategy',// Inserción con TTL

      'compaction_window_size': '1',await cassandra.insert('sessions', {

      'compaction_window_unit': 'DAYS'    session_id: cassandra.uuid(),

    }    user_id: userId,

`);    data: 'session_data'

```}, {

    using: { ttl: 3600 } // 1 hora

## 📊 Operaciones CRUD});

```

### ✅ INSERT

```javascript### Consultar

import { types } from 'cassandra-driver';

```javascript

// INSERT básico// Consulta básica

await client.execute(const users = await cassandra.select('users');

  'INSERT INTO users (user_id, name, email, created_at) VALUES (?, ?, ?, ?)',

  [types.Uuid.random(), 'John Doe', 'john@example.com', new Date()],// Consulta con filtros

  { prepare: true }const user = await cassandra.select('users', {

);    where: { id: userId },

    columns: ['name', 'email', 'age']

// INSERT con TTL (Time To Live)});

await client.execute(

  'INSERT INTO sessions (session_id, user_id, data) VALUES (?, ?, ?) USING TTL 3600',// Consulta con rango

  [sessionId, userId, sessionData],const sessions = await cassandra.select('user_sessions', {

  { prepare: true }    where: { 

);        user_id: userId,

        session_start: { gt: new Date('2024-01-01') }

// INSERT con timestamp específico    },

await client.execute(    orderBy: 'session_start DESC',

  'INSERT INTO logs (log_id, message) VALUES (?, ?) USING TIMESTAMP ?',    limit: 10

  [types.Uuid.random(), 'Log message', Date.now() * 1000], // microsegundos});

  { prepare: true }```

);

### Actualizar

// INSERT IF NOT EXISTS

await client.execute(```javascript

  'INSERT INTO users (user_id, name) VALUES (?, ?) IF NOT EXISTS',// Actualización básica

  [userId, 'John'],await cassandra.update('users', 

  { prepare: true }    { age: 31, name: 'John Smith' },

);    { id: userId }

```);



### ✅ SELECT// Actualización con TTL

```javascriptawait cassandra.update('user_cache', 

// SELECT básico    { data: 'new_data' },

const result = await client.execute(    { user_id: userId },

  'SELECT * FROM users WHERE user_id = ?',    { using: { ttl: 1800 } }

  [userId],);

  { prepare: true }```

);

### Eliminar

console.log(result.rows);

```javascript

// SELECT con múltiples condiciones (solo clustering columns)// Eliminar registro

const events = await client.execute(await cassandra.delete('users', { id: userId });

  'SELECT * FROM user_events WHERE user_id = ? AND event_time >= ? AND event_time < ?',

  [userId, startDate, endDate],// Eliminar columnas específicas

  { prepare: true }await cassandra.delete('users', { id: userId }, {

);    columns: ['metadata', 'tags']

});

// SELECT con LIMIT```

const recent = await client.execute(

  'SELECT * FROM user_events WHERE user_id = ? ORDER BY event_time DESC LIMIT 10',## Colecciones

  [userId],

  { prepare: true }### Sets

);

```javascript

// SELECT con ALLOW FILTERING (usar con cuidado)// Agregar elementos a un set

const filtered = await client.execute(await cassandra.update('users',

  'SELECT * FROM users WHERE email = ? ALLOW FILTERING',    { tags: "tags + {'vip'}" },

  ['john@example.com'],    { id: userId }

  { prepare: true });

);

// Remover elementos de un set

// SELECT COUNTawait cassandra.update('users',

const count = await client.execute(    { tags: "tags - {'temp'}" },

  'SELECT COUNT(*) FROM users WHERE user_id = ?',    { id: userId }

  [userId],);

  { prepare: true }```

);

console.log('Total:', count.rows[0].count.toNumber());### Listas

```

```javascript

### ✅ UPDATE// Agregar al final de una lista

```javascriptawait cassandra.update('user_scores',

// UPDATE básico    { scores: "scores + [95]" },

await client.execute(    { user_id: userId }

  'UPDATE users SET email = ? WHERE user_id = ?',);

  ['newemail@example.com', userId],

  { prepare: true }// Agregar al inicio de una lista

);await cassandra.update('user_scores',

    { scores: "[100] + scores" },

// UPDATE múltiples campos    { user_id: userId }

await client.execute();

  'UPDATE users SET name = ?, email = ?, updated_at = ? WHERE user_id = ?',```

  ['Jane Doe', 'jane@example.com', new Date(), userId],

  { prepare: true }### Maps

);

```javascript

// UPDATE con TTL// Agregar/actualizar elementos de un map

await client.execute(await cassandra.update('user_settings',

  'UPDATE sessions SET data = ? WHERE session_id = ? USING TTL 1800',    { "preferences['theme']": "'dark'" },

  [newData, sessionId],    { user_id: userId }

  { prepare: true });

);

// Agregar múltiples elementos

// UPDATE condicional (lightweight transaction)await cassandra.update('user_settings',

await client.execute(    { preferences: "preferences + {'lang': 'en', 'tz': 'UTC'}" },

  'UPDATE users SET email = ? WHERE user_id = ? IF email = ?',    { user_id: userId }

  ['new@email.com', userId, 'old@email.com'],);

  { prepare: true }```

);

## Operaciones por Lotes

// UPDATE colecciones

await client.execute(```javascript

  'UPDATE user_profile SET tags = tags + ? WHERE user_id = ?',const batchQueries = [

  [['new-tag'], userId],    {

  { prepare: true }        query: 'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',

);        params: [cassandra.uuid(), 'User 1', 'user1@example.com']

```    },

    {

### ✅ DELETE        query: 'INSERT INTO user_profiles (user_id, bio) VALUES (?, ?)',

```javascript        params: [userId, 'User bio']

// DELETE básico    }

await client.execute(];

  'DELETE FROM users WHERE user_id = ?',

  [userId],await cassandra.executeBatch(batchQueries, { logged: true });

  { prepare: true }```

);

## Niveles de Consistencia

// DELETE campos específicos

await client.execute(```javascript

  'DELETE email, phone FROM users WHERE user_id = ?',// Configurar nivel de consistencia global

  [userId],cassandra.setConsistencyLevel('quorum');

  { prepare: true }

);// Nivel de consistencia por operación

await cassandra.select('users', {

// DELETE con clustering key    where: { id: userId }

await client.execute(}, {

  'DELETE FROM user_events WHERE user_id = ? AND event_time = ?',    consistency: cassandra.consistency.localQuorum

  [userId, eventTime],});

  { prepare: true }

);// Niveles disponibles

const levels = [

// DELETE rango    'any', 'one', 'two', 'three', 'quorum', 'all',

await client.execute(    'localQuorum', 'eachQuorum', 'localOne'

  'DELETE FROM user_events WHERE user_id = ? AND event_time >= ? AND event_time < ?',];

  [userId, startDate, endDate],```

  { prepare: true }

);## Patrones Big Data



// DELETE condicional### Desnormalización

await client.execute(

  'DELETE FROM users WHERE user_id = ? IF email = ?',```javascript

  [userId, 'old@email.com'],// Tabla principal

  { prepare: true }await cassandra.createTable('users', {

);    id: 'uuid',

```    email: 'text',

    name: 'text'

## 🗂️ Colecciones}, { primaryKey: 'id' });



### ✅ Lists (Listas ordenadas)// Tabla desnormalizada para búsqueda por email

```javascriptawait cassandra.createTable('users_by_email', {

// Crear tabla con lista    email: 'text',

await client.execute(`    user_id: 'uuid',

  CREATE TABLE IF NOT EXISTS user_activity (    name: 'text'

    user_id uuid PRIMARY KEY,}, { primaryKey: 'email' });

    recent_logins list<timestamp>,

    activity_log list<text>// Mantener ambas tablas sincronizadas

  )const userData = { id: userId, email, name };

`);await cassandra.executeBatch([

    { query: 'INSERT INTO users (id, email, name) VALUES (?, ?, ?)', 

// INSERT con lista      params: [userData.id, userData.email, userData.name] },

await client.execute(    { query: 'INSERT INTO users_by_email (email, user_id, name) VALUES (?, ?, ?)', 

  'INSERT INTO user_activity (user_id, recent_logins) VALUES (?, ?)',      params: [userData.email, userData.id, userData.name] }

  [userId, [new Date(), new Date()]],]);

  { prepare: true }```

);

### Particionamiento por Tiempo

// APPEND a lista

await client.execute(```javascript

  'UPDATE user_activity SET recent_logins = recent_logins + ? WHERE user_id = ?',// Tabla particionada por día

  [[new Date()], userId],await cassandra.createTable('events_by_day', {

  { prepare: true }    day: 'text',         // Partition key

);    hour: 'int',         // Clustering key

    event_id: 'timeuuid', // Clustering key

// PREPEND a lista    event_type: 'text',

await client.execute(    data: 'text'

  'UPDATE user_activity SET recent_logins = ? + recent_logins WHERE user_id = ?',}, {

  [[new Date()], userId],    primaryKey: ['day', 'hour', 'event_id'],

  { prepare: true }    clusteringOrder: 'hour DESC, event_id DESC'

);});



// REMOVE de lista por valor// Insertar eventos

await client.execute(const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  'UPDATE user_activity SET recent_logins = recent_logins - ? WHERE user_id = ?',await cassandra.insert('events_by_day', {

  [[oldDate], userId],    day: today,

  { prepare: true }    hour: new Date().getHours(),

);    event_id: cassandra.timeUuid(),

    event_type: 'user_action',

// UPDATE por índice    data: JSON.stringify(eventData)

await client.execute(});

  'UPDATE user_activity SET recent_logins[0] = ? WHERE user_id = ?',```

  [new Date(), userId],

  { prepare: true }## Series Temporales

);

```### Tabla Optimizada para Time-Series



### ✅ Sets (Conjuntos únicos)```javascript

```javascriptawait cassandra.createTable('sensor_readings', {

// Crear tabla con set    sensor_id: 'uuid',

await client.execute(`    reading_time: 'timestamp',

  CREATE TABLE IF NOT EXISTS user_profile (    temperature: 'double',

    user_id uuid PRIMARY KEY,    humidity: 'double',

    interests set<text>,    location: 'text'

    tags set<text>}, {

  )    primaryKey: ['sensor_id', 'reading_time'],

`);    clusteringOrder: 'reading_time DESC',

    compaction: {

// INSERT con set        class: 'TimeWindowCompactionStrategy',

await client.execute(        compaction_window_unit: 'HOURS',

  'INSERT INTO user_profile (user_id, interests) VALUES (?, ?)',        compaction_window_size: '24'

  [userId, ['javascript', 'nodejs', 'cassandra']],    }

  { prepare: true }});

);

// Consultar datos recientes

// ADD a setconst recentReadings = await cassandra.select('sensor_readings', {

await client.execute(    where: { 

  'UPDATE user_profile SET interests = interests + ? WHERE user_id = ?',        sensor_id: sensorId,

  [['react', 'vue'], userId],        reading_time: { gt: new Date(Date.now() - 24*60*60*1000) }

  { prepare: true }    },

);    orderBy: 'reading_time DESC',

    limit: 100

// REMOVE de set});

await client.execute(```

  'UPDATE user_profile SET interests = interests - ? WHERE user_id = ?',

  [['nodejs'], userId],## Tipos Definidos por el Usuario (UDT)

  { prepare: true }

);```javascript

// Crear UDT

// CLEAR setawait cassandra.createType('address', {

await client.execute(    street: 'text',

  'UPDATE user_profile SET interests = {} WHERE user_id = ?',    city: 'text',

  [userId],    zip: 'text',

  { prepare: true }    country: 'text'

);});

```

// Usar UDT en tabla

### ✅ Maps (Mapas clave-valor)await cassandra.createTable('user_addresses', {

```javascript    user_id: 'uuid',

// Crear tabla con map    home_address: 'address',

await client.execute(`    work_address: 'address',

  CREATE TABLE IF NOT EXISTS user_settings (    addresses: 'list<frozen<address>>'

    user_id uuid PRIMARY KEY,}, { primaryKey: 'user_id' });

    preferences map<text, text>,

    metadata map<text, int>// Insertar con UDT

  )await cassandra.insert('user_addresses', {

`);    user_id: userId,

    home_address: {

// INSERT con map        street: '123 Main St',

await client.execute(        city: 'New York',

  'INSERT INTO user_settings (user_id, preferences) VALUES (?, ?)',        zip: '10001',

  [userId, { theme: 'dark', language: 'es', timezone: 'UTC' }],        country: 'USA'

  { prepare: true }    }

);});

```

// ADD/UPDATE entrada en map

await client.execute(## Índices Secundarios

  'UPDATE user_settings SET preferences[?] = ? WHERE user_id = ?',

  ['notifications', 'enabled', userId],```javascript

  { prepare: true }// Crear índice en columna

);await cassandra.createIndex('users_age_idx', 'users', 'age');



// ADD múltiples entradas// Consultar usando índice

await client.execute(const youngUsers = await cassandra.select('users', {

  'UPDATE user_settings SET preferences = preferences + ? WHERE user_id = ?',    where: { age: { lt: 30 } },

  [{ font_size: '14px', sidebar: 'collapsed' }, userId],    allowFiltering: true

  { prepare: true }});

);

// Índice en colección

// DELETE entrada de mapawait cassandra.createIndex('users_tags_idx', 'users', 'tags');

await client.execute(

  'DELETE preferences[?] FROM user_settings WHERE user_id = ?',// Consultar elementos en colección

  ['theme', userId],const premiumUsers = await cassandra.select('users', {

  { prepare: true }    where: { tags: { contains: 'premium' } }

);});

``````



## 🎯 Características Avanzadas## Funciones y Agregaciones



### ✅ Batch Operations```javascript

```javascript// Usar funciones built-in

import { types } from 'cassandra-driver';await cassandra.insert('events', {

    id: cassandra.uuid(),

// Batch con misma partition key (logged batch - atómico)    timestamp: cassandra.timeUuid(),

const queries = [    created_at: new Date()

  {});

    query: 'INSERT INTO user_activity (user_id, activity_id, type) VALUES (?, ?, ?)',

    params: [userId, types.Uuid.random(), 'login']// Consultas con funciones

  },const result = await cassandra.execute(`

  {    SELECT dateOf(timestamp) as event_date, 

    query: 'UPDATE users SET last_login = ? WHERE user_id = ?',           unixTimestampOf(timestamp) as unix_time

    params: [new Date(), userId]    FROM events 

  },    WHERE id = ?

  {`, [eventId]);

    query: 'UPDATE user_stats SET login_count = login_count + 1 WHERE user_id = ?',```

    params: [userId]

  }## Configuración Avanzada

];

### Configuración del Cliente

await client.batch(queries, { prepare: true });

```javascript

// Unlogged batch (mejor performance, no atómico entre particiones)const cassandra = new Cassandra({

await client.batch(queries, {     contactPoints: ['node1.cassandra.com', 'node2.cassandra.com'],

  prepare: true,    localDataCenter: 'datacenter1',

  logged: false     keyspace: 'production_app',

});    

    // Autenticación

// Counter batch    credentials: {

const counterQueries = [        username: 'cassandra_user',

  {        password: 'secure_password'

    query: 'UPDATE page_views SET views = views + 1 WHERE page_id = ?',    },

    params: [pageId1]    

  },    // Pool de conexiones

  {    pooling: {

    query: 'UPDATE page_views SET views = views + 1 WHERE page_id = ?',        heartBeatInterval: 30000,

    params: [pageId2]        maxRequestsPerConnection: 32768

  }    },

];    

    // Opciones de socket

await client.batch(counterQueries, {     socketOptions: {

  prepare: true,        connectTimeout: 5000,

  counter: true         readTimeout: 12000

});    },

```    

    // Políticas

### ✅ Counters    policies: {

```javascript        loadBalancing: new cassandra.policies.loadBalancing.RoundRobinPolicy(),

// Crear tabla de contadores        retry: new cassandra.policies.retry.RetryPolicy(),

await client.execute(`        reconnection: new cassandra.policies.reconnection.ExponentialReconnectionPolicy()

  CREATE TABLE IF NOT EXISTS statistics (    }

    metric_name text PRIMARY KEY,});

    value counter```

  )

`);### Monitoreo y Métricas



await client.execute(````javascript

  CREATE TABLE IF NOT EXISTS page_views (// Obtener metadatos del cluster

    page_id uuid,const metadata = cassandra.getMetadata();

    date date,console.log('Hosts:', metadata.hosts.length);

    views counter,console.log('Keyspaces:', Object.keys(metadata.keyspaces));

    PRIMARY KEY (page_id, date)

  )// Metadatos de keyspace

`);const ksMetadata = cassandra.getKeyspaceMetadata('my_app');

console.log('Tables:', Object.keys(ksMetadata.tables));

// Incrementar contador

await client.execute(// Metadatos de tabla

  'UPDATE page_views SET views = views + 1 WHERE page_id = ? AND date = ?',const tableMetadata = cassandra.getTableMetadata('users');

  [pageId, new Date()],console.log('Columns:', Object.keys(tableMetadata.columns));

  { prepare: true }console.log('Partition key:', tableMetadata.partitionKeys);

);console.log('Clustering keys:', tableMetadata.clusteringKeys);

```

// Incrementar por valor

await client.execute(## Mejores Prácticas

  'UPDATE statistics SET value = value + ? WHERE metric_name = ?',

  [10, 'total_requests'],### Diseño de Esquema

  { prepare: true }

);1. **Modelar por consultas**: Diseña las tablas basándote en las consultas que necesitas

2. **Desnormalización**: Acepta la duplicación de datos para optimizar consultas

// Decrementar3. **Partition keys eficientes**: Distribuye los datos uniformemente

await client.execute(4. **Clustering keys apropiados**: Ordena los datos según tus necesidades

  'UPDATE statistics SET value = value - 1 WHERE metric_name = ?',

  ['active_sessions'],### Rendimiento

  { prepare: true }

);1. **Usa declaraciones preparadas** para consultas repetitivas

2. **Operaciones por lotes** para múltiples escrituras relacionadas

// Leer contador3. **TTL apropiados** para datos temporales

const result = await client.execute(4. **Niveles de consistencia** según tus necesidades de disponibilidad

  'SELECT value FROM statistics WHERE metric_name = ?',

  ['total_requests'],### Ejemplo de Aplicación Completa

  { prepare: true }

);```javascript

import Cassandra from '@querybuilder/cassandra';

console.log('Valor:', result.rows[0].value.toNumber());

```class UserService {

    constructor() {

### ✅ User Defined Types (UDT)        this.cassandra = new Cassandra({

```javascript            contactPoints: ['127.0.0.1'],

// Crear tipo            localDataCenter: 'datacenter1',

await client.execute(`            keyspace: 'user_service'

  CREATE TYPE IF NOT EXISTS address (        });

    street text,    }

    city text,

    state text,    async initialize() {

    zip_code text,        await this.cassandra.connect();

    country text        await this.setupSchema();

  )    }

`);

    async setupSchema() {

await client.execute(`        // Crear keyspace

  CREATE TYPE IF NOT EXISTS phone_number (        await this.cassandra.createKeyspace('user_service', {

    country_code text,            replication: { class: 'SimpleStrategy', replication_factor: 1 }

    number text,        });

    type text        

  )        await this.cassandra.useKeyspace('user_service');

`);

        // Tabla principal de usuarios

// Usar UDT en tabla        await this.cassandra.createTable('users', {

await client.execute(`            id: 'uuid',

  CREATE TABLE IF NOT EXISTS customers (            email: 'text',

    customer_id uuid PRIMARY KEY,            name: 'text',

    name text,            created_at: 'timestamp',

    home_address frozen<address>,            profile: 'map<text, text>',

    billing_address frozen<address>,            tags: 'set<text>'

    phones list<frozen<phone_number>>        }, { primaryKey: 'id' });

  )

`);        // Tabla para búsqueda por email

        await this.cassandra.createTable('users_by_email', {

// INSERT con UDT            email: 'text',

await client.execute(            user_id: 'uuid',

  `INSERT INTO customers (customer_id, name, home_address, phones)             name: 'text'

   VALUES (?, ?, {street: ?, city: ?, state: ?, zip_code: ?, country: ?}, ?)`,        }, { primaryKey: 'email' });

  [

    types.Uuid.random(),        // Actividad de usuarios (time-series)

    'John Doe',        await this.cassandra.createTable('user_activity', {

    '123 Main St', 'New York', 'NY', '10001', 'USA',            user_id: 'uuid',

    [            activity_date: 'timestamp',

      { country_code: '+1', number: '1234567890', type: 'mobile' },            activity_type: 'text',

      { country_code: '+1', number: '0987654321', type: 'home' }            metadata: 'map<text, text>'

    ]        }, {

  ],            primaryKey: ['user_id', 'activity_date'],

  { prepare: true }            clusteringOrder: 'activity_date DESC'

);        });

    }

// SELECT con UDT

const result = await client.execute(    async createUser(userData) {

  'SELECT name, home_address.city, home_address.state FROM customers WHERE customer_id = ?',        const userId = this.cassandra.uuid();

  [customerId],        const user = {

  { prepare: true }            id: userId,

);            email: userData.email,

```            name: userData.name,

            created_at: new Date(),

### ✅ TTL (Time To Live)            profile: userData.profile || {},

```javascript            tags: userData.tags || []

// INSERT con TTL        };

await client.execute(

  'INSERT INTO sessions (session_id, data) VALUES (?, ?) USING TTL 3600',        // Batch para mantener consistencia

  [sessionId, data],        await this.cassandra.executeBatch([

  { prepare: true }            {

);                query: 'INSERT INTO users (id, email, name, created_at, profile, tags) VALUES (?, ?, ?, ?, ?, ?)',

                params: [user.id, user.email, user.name, user.created_at, user.profile, user.tags]

// UPDATE con TTL            },

await client.execute(            {

  'UPDATE cache SET value = ? WHERE key = ? USING TTL 300',                query: 'INSERT INTO users_by_email (email, user_id, name) VALUES (?, ?, ?)',

  [value, key],                params: [user.email, user.id, user.name]

  { prepare: true }            }

);        ]);



// Verificar TTL restante        return user;

const result = await client.execute(    }

  'SELECT TTL(value) as ttl_remaining FROM cache WHERE key = ?',

  [key],    async getUserById(userId) {

  { prepare: true }        const result = await this.cassandra.select('users', {

);            where: { id: userId }

        });

const ttl = result.rows[0].ttl_remaining;        return result.rows[0];

console.log(`TTL restante: ${ttl} segundos`);    }



// Eliminar TTL (hacer permanente)    async getUserByEmail(email) {

await client.execute(        const result = await this.cassandra.select('users_by_email', {

  'UPDATE cache SET value = ? WHERE key = ? USING TTL 0',            where: { email }

  [value, key],        });

  { prepare: true }        

);        if (result.rows.length === 0) return null;

```        

        const userInfo = result.rows[0];

### ✅ Niveles de Consistencia        return await this.getUserById(userInfo.user_id);

```javascript    }

import { types } from 'cassandra-driver';

    async logActivity(userId, activityType, metadata = {}) {

// ONE - una réplica (más rápido, menos consistente)        await this.cassandra.insert('user_activity', {

await client.execute(            user_id: userId,

  'SELECT * FROM users WHERE user_id = ?',            activity_date: new Date(),

  [userId],            activity_type: activityType,

  {             metadata

    prepare: true,        });

    consistency: types.consistencies.one     }

  }

);    async getUserActivity(userId, limit = 50) {

        const result = await this.cassandra.select('user_activity', {

// LOCAL_ONE - una réplica local            where: { user_id: userId },

await client.execute(            orderBy: 'activity_date DESC',

  'INSERT INTO logs (log_id, message) VALUES (?, ?)',            limit

  [types.Uuid.random(), 'message'],        });

  {         return result.rows;

    prepare: true,    }

    consistency: types.consistencies.localOne 

  }    async cleanup() {

);        await this.cassandra.disconnect();

    }

// QUORUM - mayoría de réplicas (balance)}

await client.execute(

  'SELECT * FROM users WHERE user_id = ?',// Uso

  [userId],const userService = new UserService();

  { await userService.initialize();

    prepare: true,

    consistency: types.consistencies.quorum const user = await userService.createUser({

  }    email: 'john@example.com',

);    name: 'John Doe',

    profile: { age: '30', city: 'New York' },

// LOCAL_QUORUM - mayoría en datacenter local    tags: ['premium', 'verified']

await client.execute(});

  'UPDATE users SET email = ? WHERE user_id = ?',

  [email, userId],await userService.logActivity(user.id, 'signup', { source: 'web' });

  { ```

    prepare: true,

    consistency: types.consistencies.localQuorum ## API Reference

  }

);### Constructor Options

- `contactPoints`: Array de direcciones de nodos Cassandra

// ALL - todas las réplicas (más consistente, más lento)- `localDataCenter`: Nombre del datacenter local

await client.execute(- `keyspace`: Keyspace por defecto

  'INSERT INTO critical_data (id, value) VALUES (?, ?)',- `credentials`: Credenciales de autenticación

  [id, value],- `pooling`: Configuración del pool de conexiones

  { - `socketOptions`: Opciones de socket

    prepare: true,

    consistency: types.consistencies.all ### Métodos Principales

  }- `connect()`: Conectar al cluster

);- `disconnect()`: Desconectar del cluster

- `execute(query, params, options)`: Ejecutar consulta CQL

// EACH_QUORUM - quorum en cada datacenter- `executeBatch(queries, options)`: Ejecutar lote de consultas

await client.execute(- `setConsistencyLevel(level)`: Configurar nivel de consistencia

  'UPDATE users SET status = ? WHERE user_id = ?',

  ['active', userId],### Operaciones de Keyspace

  { - `createKeyspace(name, options)`: Crear keyspace

    prepare: true,- `dropKeyspace(name)`: Eliminar keyspace

    consistency: types.consistencies.eachQuorum - `useKeyspace(name)`: Usar keyspace

  }

);### Operaciones de Tabla

```- `createTable(name, columns, options)`: Crear tabla

- `dropTable(name)`: Eliminar tabla

### ✅ Paginación- `alterTable(name, alterations)`: Modificar tabla

```javascript

// Primera página### Operaciones de Datos

let result = await client.execute(- `insert(table, data, options)`: Insertar datos

  'SELECT * FROM users',- `select(table, options)`: Consultar datos

  [],- `update(table, data, where, options)`: Actualizar datos

  { - `delete(table, where, options)`: Eliminar datos

    prepare: true,

    fetchSize: 100  // Tamaño de página## Licencia

  }

);MIT License - ver archivo LICENSE para detalles.



console.log('Primera página:', result.rows);## Contribuciones



// Iterar páginasLas contribuciones son bienvenidas. Por favor, abre un issue o pull request en el repositorio del proyecto.

while (result.pageState) {

  result = await client.execute(## Soporte

    'SELECT * FROM users',

    [],Para soporte y preguntas, consulta la documentación oficial de Apache Cassandra y el repositorio del proyecto QueryBuilder.
    { 
      prepare: true,
      fetchSize: 100,
      pageState: result.pageState 
    }
  );
  console.log('Siguiente página:', result.rows);
}

// Paginación manual con API
function getAllUsers() {
  return new Promise((resolve, reject) => {
    const allRows = [];
    
    client.eachRow(
      'SELECT * FROM users',
      [],
      { prepare: true, fetchSize: 1000 },
      (n, row) => {
        // Callback por cada fila
        allRows.push(row);
      },
      (err, result) => {
        // Callback final
        if (err) {
          reject(err);
        } else {
          resolve(allRows);
        }
      }
    );
  });
}
```

## 🔌 Configuración Avanzada

### Opciones del Cliente
```javascript
import { Client, types, policies } from 'cassandra-driver';

const client = new Client({
  contactPoints: ['host1', 'host2', 'host3'],
  localDataCenter: 'datacenter1',
  keyspace: 'myapp',
  
  // Autenticación
  authProvider: new auth.PlainTextAuthProvider('username', 'password'),
  
  // Pool de conexiones
  pooling: {
    coreConnectionsPerHost: {
      [types.distance.local]: 2,
      [types.distance.remote]: 1
    }
  },
  
  // Política de retry
  policies: {
    retry: new policies.retry.RetryPolicy()
  },
  
  // Política de load balancing
  policies: {
    loadBalancing: new policies.loadBalancing.DCAwareRoundRobinPolicy('datacenter1')
  },
  
  // Timeouts
  socketOptions: {
    connectTimeout: 5000,
    readTimeout: 12000
  },
  
  // Preparación automática
  queryOptions: {
    prepare: true,
    consistency: types.consistencies.localQuorum
  }
});
```

### Prepared Statements (Recomendado)
```javascript
// Preparar statement
const query = 'INSERT INTO users (user_id, name, email) VALUES (?, ?, ?)';
const prepared = await client.prepare(query);

// Ejecutar múltiples veces (más eficiente)
await client.execute(prepared, [uuid1, 'John', 'john@example.com']);
await client.execute(prepared, [uuid2, 'Jane', 'jane@example.com']);
await client.execute(prepared, [uuid3, 'Bob', 'bob@example.com']);

// O usar prepare: true en options
await client.execute(
  query,
  [uuid4, 'Alice', 'alice@example.com'],
  { prepare: true }
);
```

## 📖 Patrones y Best Practices

### Modelado de Datos
```javascript
// ❌ MAL - Múltiples queries por partition key
CREATE TABLE users_bad (
  user_id uuid,
  attribute_name text,
  attribute_value text,
  PRIMARY KEY (user_id, attribute_name)
);

// ✅ BIEN - Desnormalizado, una query
CREATE TABLE users_good (
  user_id uuid PRIMARY KEY,
  name text,
  email text,
  phone text,
  address text
);

// ✅ Series temporales - Bucket pattern
CREATE TABLE sensor_readings (
  sensor_id uuid,
  bucket date,  -- Agrupa por día
  reading_time timestamp,
  temperature decimal,
  humidity decimal,
  PRIMARY KEY ((sensor_id, bucket), reading_time)
) WITH CLUSTERING ORDER BY (reading_time DESC);
```

### Índices Secundarios
```javascript
// Crear índice secundario
await client.execute(`
  CREATE INDEX IF NOT EXISTS users_email_idx 
  ON users (email)
`);

// Usar índice (automático)
const result = await client.execute(
  'SELECT * FROM users WHERE email = ?',
  ['john@example.com'],
  { prepare: true }
);

// SASI (SSTable Attached Secondary Index) - mejor performance
await client.execute(`
  CREATE CUSTOM INDEX IF NOT EXISTS users_name_sasi 
  ON users (name) 
  USING 'org.apache.cassandra.index.sasi.SASIIndex'
`);
```

## 🧪 Testing

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client, types } from 'cassandra-driver';

test('Cassandra operations', async () => {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'test'
  });
  
  try {
    await client.connect();
    
    // Test INSERT/SELECT
    const userId = types.Uuid.random();
    await client.execute(
      'INSERT INTO users (user_id, name) VALUES (?, ?)',
      [userId, 'Test User'],
      { prepare: true }
    );
    
    const result = await client.execute(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
      { prepare: true }
    );
    
    assert.equal(result.rows[0].name, 'Test User');
    
    // Cleanup
    await client.execute(
      'DELETE FROM users WHERE user_id = ?',
      [userId],
      { prepare: true }
    );
  } finally {
    await client.shutdown();
  }
});
```

## ⚡ Características Cassandra

- **Distribuida**: Sin punto único de fallo, escalabilidad lineal
- **Alta disponibilidad**: Replicación multi-datacenter
- **Consistencia ajustable**: Balance entre consistencia y disponibilidad
- **Alto rendimiento**: Escrituras y lecturas extremadamente rápidas
- **Escalabilidad**: Petabytes de datos, millones de ops/segundo
- **Modelo wide-column**: Flexible y optimizado para queries específicas

## 📄 Casos de Uso

- **Series temporales**: IoT, métricas, logs
- **Mensajería**: Chat, notificaciones
- **Catálogos de productos**: E-commerce
- **Recomendaciones**: Machine learning
- **Análisis en tiempo real**: Dashboards, analytics
- **Redes sociales**: Feeds, actividad de usuarios

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
- [@querybuilder/redis](../redis/README.md)
- [Apache Cassandra](https://cassandra.apache.org/)
- [DataStax Node.js Driver](https://docs.datastax.com/en/developer/nodejs-driver/)
- [CQL Reference](https://cassandra.apache.org/doc/latest/cql/)
