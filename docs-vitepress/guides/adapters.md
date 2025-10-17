# Adaptadores

Guía completa sobre los adaptadores de base de datos disponibles en QueryBuilder.

## Adaptadores Disponibles

| Adaptador | Paquete | Base de Datos | Estado |
|-----------|---------|---------------|---------|
| **MySQL** | `@querybuilder/mysql` | MySQL/MariaDB | ✅ Estable |
| **PostgreSQL** | `@querybuilder/postgresql` | PostgreSQL | ✅ Estable |
| **MongoDB** | `@querybuilder/mongodb` | MongoDB | ✅ Estable |
| **SQLite** | `@querybuilder/sqlite` | SQLite | ✅ Estable |
| **Redis** | `@querybuilder/redis` | Redis | 🚧 Beta |
| **Cassandra** | `@querybuilder/cassandra` | Apache Cassandra | 🚧 Beta |
| **ChromaDB** | `@querybuilder/chroma` | ChromaDB | 🚧 Beta |

## MySQL Adapter

### Instalación
```bash
npm install @querybuilder/core @querybuilder/mysql
```

### Configuración
```javascript
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';

const qb = new QueryBuilder(MySQL, {
  host: 'localhost',
  port: 3306,
  database: 'myapp',
  username: 'user',
  password: 'password',
  charset: 'utf8mb4',
  timezone: 'local'
});
```

### Características Específicas
- ✅ Soporte completo para MySQL 5.7+ y 8.0+
- ✅ Soporte para MariaDB 10.3+
- ✅ Pool de conexiones
- ✅ Transacciones
- ✅ Stored procedures
- ✅ Funciones específicas de MySQL

### Funciones MySQL
```javascript
// Funciones de fecha
qb.select('NOW()', 'DATE_ADD(created_at, INTERVAL 1 DAY)')
  .from('posts')
  .execute();

// Funciones de cadena
qb.select('CONCAT(first_name, " ", last_name) as full_name')
  .from('users')
  .execute();

// Funciones de agregación
qb.select('GROUP_CONCAT(name) as names')
  .from('users')
  .groupBy('department')
  .execute();
```

## PostgreSQL Adapter

### Instalación
```bash
npm install @querybuilder/core @querybuilder/postgresql
```

### Configuración
```javascript
import QueryBuilder from '@querybuilder/core';
import PostgreSQL from '@querybuilder/postgresql';

const qb = new QueryBuilder(PostgreSQL, {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  username: 'user',
  password: 'password',
  ssl: false
});
```

### Características Específicas
- ✅ Soporte para PostgreSQL 12+
- ✅ Tipos de datos avanzados (JSON, Arrays, UUID)
- ✅ Common Table Expressions (CTE)
- ✅ Window functions
- ✅ Full-text search
- ✅ Extensiones (PostGIS, etc.)

### Funciones PostgreSQL
```javascript
// Tipos JSON
qb.select('data->>\'name\' as name')
  .from('users')
  .where('data ? \'active\'')
  .execute();

// Arrays
qb.select('*')
  .from('posts')
  .where('tags && ARRAY[\'javascript\', \'nodejs\']')
  .execute();

// Window functions
qb.select('name', 'score', 'ROW_NUMBER() OVER (ORDER BY score DESC) as rank')
  .from('users')
  .execute();

// CTE
qb.with('top_users', 
    qb.select('*').from('users').where('score > 100')
  )
  .select('*')
  .from('top_users')
  .execute();
```

## MongoDB Adapter

### Instalación
```bash
npm install @querybuilder/core @querybuilder/mongodb
```

### Configuración
```javascript
import QueryBuilder from '@querybuilder/core';
import MongoDB from '@querybuilder/mongodb';

const qb = new QueryBuilder(MongoDB, {
  connectionString: 'mongodb://localhost:27017/myapp',
  options: {
    useUnifiedTopology: true,
    maxPoolSize: 10
  }
});
```

### Características Específicas
- ✅ Soporte para MongoDB 4.4+
- ✅ Agregation Pipeline
- ✅ Geospatial queries
- ✅ Text search
- ✅ GridFS
- ✅ Change streams

### Operaciones MongoDB
```javascript
// Find
const users = qb
  .collection('users')
  .find({ active: true, age: { $gte: 18 } })
  .sort({ name: 1 })
  .limit(10)
  .execute();

// Agregación
const stats = qb
  .collection('orders')
  .aggregate([
    { $match: { status: 'completed' } },
    { $group: { 
        _id: '$customer_id', 
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ])
  .execute();

// Geospatial
const nearby = qb
  .collection('places')
  .find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [-73.9857, 40.7484] },
        $maxDistance: 1000
      }
    }
  })
  .execute();
```

## SQLite Adapter

### Instalación
```bash
npm install @querybuilder/core @querybuilder/sqlite
```

### Configuración
```javascript
import QueryBuilder from '@querybuilder/core';
import SQLite from '@querybuilder/sqlite';

const qb = new QueryBuilder(SQLite, {
  filename: './database.sqlite',
  options: {
    verbose: console.log
  }
});
```

### Características Específicas
- ✅ Soporte para SQLite 3.35+
- ✅ In-memory databases
- ✅ WAL mode
- ✅ FTS (Full-Text Search)
- ✅ JSON1 extension
- ✅ Backup/Restore

### Funciones SQLite
```javascript
// JSON
qb.select('json_extract(data, "$.name") as name')
  .from('users')
  .where('json_extract(data, "$.active") = 1')
  .execute();

// FTS
qb.select('*')
  .from('documents_fts')
  .where('documents_fts MATCH ?', ['javascript'])
  .execute();
```

## Redis Adapter

### Instalación
```bash
npm install @querybuilder/core @querybuilder/redis
```

### Configuración
```javascript
import QueryBuilder from '@querybuilder/core';
import Redis from '@querybuilder/redis';

const qb = new QueryBuilder(Redis, {
  host: 'localhost',
  port: 6379,
  password: 'password',
  db: 0
});
```

### Operaciones Redis
```javascript
// Strings
qb.set('user:123', JSON.stringify({ name: 'Juan' })).execute();
const user = qb.get('user:123').execute();

// Hashes
qb.hset('user:123', 'name', 'Juan', 'email', 'juan@example.com').execute();
const userData = qb.hgetall('user:123').execute();

// Lists
qb.lpush('tasks', 'task1', 'task2').execute();
const tasks = qb.lrange('tasks', 0, -1).execute();

// Sets
qb.sadd('tags', 'javascript', 'nodejs', 'react').execute();
const tags = qb.smembers('tags').execute();
```

## Cassandra Adapter

### Instalación
```bash
npm install @querybuilder/core @querybuilder/cassandra
```

### Configuración
```javascript
import QueryBuilder from '@querybuilder/core';
import Cassandra from '@querybuilder/cassandra';

const qb = new QueryBuilder(Cassandra, {
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'myapp'
});
```

### Operaciones Cassandra
```javascript
// SELECT
const users = qb
  .select('*')
  .from('users')
  .where('user_id = ?', [userId])
  .execute();

// INSERT
qb.insert('users')
  .values({
    user_id: uuid(),
    name: 'Juan',
    email: 'juan@example.com'
  })
  .execute();

// Time-series data
const metrics = qb
  .select('*')
  .from('metrics')
  .where('device_id = ? AND timestamp >= ?', [deviceId, startTime])
  .orderBy('timestamp DESC')
  .limit(100)
  .execute();
```

## ChromaDB Adapter

### Instalación
```bash
npm install @querybuilder/core @querybuilder/chroma
```

### Configuración
```javascript
import QueryBuilder from '@querybuilder/core';
import ChromaDB from '@querybuilder/chroma';

const qb = new QueryBuilder(ChromaDB, {
  host: 'localhost',
  port: 8000,
  ssl: false
});
```

### Operaciones ChromaDB
```javascript
// Create collection
qb.createCollection('documents').execute();

// Add documents
qb.collection('documents')
  .add({
    documents: ['Document 1 content', 'Document 2 content'],
    metadatas: [{ type: 'article' }, { type: 'blog' }],
    ids: ['doc1', 'doc2']
  })
  .execute();

// Query similarity
const similar = qb
  .collection('documents')
  .query({
    queryTexts: ['search query'],
    nResults: 10
  })
  .execute();
```

## Comparación de Características

| Característica | MySQL | PostgreSQL | MongoDB | SQLite | Redis | Cassandra | ChromaDB |
|----------------|-------|------------|---------|--------|-------|-----------|----------|
| **Transacciones ACID** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Joins complejos** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Escalabilidad horizontal** | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Full-text search** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **JSON nativo** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Geospatial** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Time-series** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Vector search** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |

## Elegir el Adaptador Correcto

### Para aplicaciones web tradicionales
**Recomendado:** MySQL o PostgreSQL
- ✅ Transacciones ACID
- ✅ Joins complejos
- ✅ Ecosistema maduro

### Para aplicaciones de gran escala
**Recomendado:** MongoDB o Cassandra
- ✅ Escalabilidad horizontal
- ✅ Esquema flexible
- ✅ Alto rendimiento

### Para aplicaciones embedidas
**Recomendado:** SQLite
- ✅ Sin servidor
- ✅ Archivo único
- ✅ Bajo overhead

### Para cache y sesiones
**Recomendado:** Redis
- ✅ In-memory
- ✅ Estructuras de datos ricas
- ✅ Pub/Sub

### Para búsqueda por similitud
**Recomendado:** ChromaDB
- ✅ Vector database
- ✅ AI/ML optimized
- ✅ Similarity search

## Ver También

- [Configuración](/guides/configuration) - Configuración específica por adaptador
- [Ejemplos](/guides/examples) - Ejemplos de uso por base de datos
- [API Reference](/api/) - Métodos disponibles por adaptador