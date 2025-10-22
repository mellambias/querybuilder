# @querybuilder/mongodb

Adaptador MongoDB para QueryBuilder - Soporte completo para operaciones NoSQL, agregaciones y pipeline de MongoDB.

## 📦 Instalación

```bash
npm install @querybuilder/core @querybuilder/mongodb
```

## 🚀 Uso Básico

```javascript
import QueryBuilder from '@querybuilder/core';
import { MongoDB } from '@querybuilder/mongodb';

// Crear instancia con adaptador MongoDB
const qb = new QueryBuilder(MongoDB);

// Operaciones CRUD
const insert = qb.insertInto('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

const select = qb.select('*').from('users').where({ age: { $gte: 18 } });
const update = qb.update('users').set({ status: 'active' }).where({ _id: userId });
const remove = qb.deleteFrom('users').where({ inactive: true });
```

## 🔧 Características Principales

### ✅ Operaciones CRUD Completas
- **Insert**: `insertInto()`, `insertMany()`
- **Select**: `select()`, `find()`, `findOne()`
- **Update**: `update()`, `updateOne()`, `updateMany()`
- **Delete**: `deleteFrom()`, `deleteOne()`, `deleteMany()`

### ✅ Pipeline de Agregación
```javascript
const pipeline = qb
  .aggregate('orders')
  .match({ status: 'completed' })
  .group({ _id: '$customer', total: { $sum: '$amount' } })
  .sort({ total: -1 })
  .limit(10);

const results = await pipeline.execute();
```

### ✅ Operadores MongoDB
```javascript
// Operadores de comparación
qb.select('*').from('users').where({
  age: { $gt: 18, $lt: 65 },
  status: { $in: ['active', 'pending'] }
});

// Operadores lógicos
qb.select('*').from('products').where({
  $or: [
    { category: 'electronics' },
    { price: { $lt: 100 } }
  ]
});

// Operadores de texto
qb.select('*').from('articles').where({
  $text: { $search: 'mongodb tutorial' }
});
```

### ✅ Índices y Optimización
```javascript
// Crear índice
qb.createIndex('users', { email: 1 }, { unique: true });

// Índice compuesto
qb.createIndex('orders', { customer: 1, date: -1 });

// Índice de texto
qb.createIndex('articles', { title: 'text', content: 'text' });

// Índice geoespacial
qb.createIndex('locations', { coordinates: '2dsphere' });
```

### ✅ Gestión de Colecciones
```javascript
// Crear colección con validación
qb.createTable('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^.+@.+$' },
        age: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});

// Eliminar colección
qb.dropTable('old_collection');
```

### ✅ Subconsultas y Comandos Anidados
```javascript
import { Command } from '@querybuilder/mongodb';

// Subconsulta con Command
const subquery = new Command()
  .add({ $match: { status: 'active' } })
  .add({ $group: { _id: '$category' } });

const main = qb
  .select('*')
  .from('products')
  .where({ category: { $in: subquery } });
```

## 📚 API Completa

### Command
Clase para construir pipelines de agregación complejos:

```javascript
import { Command } from '@querybuilder/mongodb';

const command = new Command();
command
  .add({ $match: { year: 2024 } })
  .add({ $group: { _id: '$month', total: { $sum: '$sales' } } })
  .add({ $sort: { total: -1 } });

const result = await command.execute(driver);
```

### Utilidades

```javascript
import { jsonReplacer, jsonReviver } from '@querybuilder/mongodb';

// Serializar con RegExp
const query = { name: /^John/i };
const json = JSON.stringify(query, jsonReplacer);

// Deserializar
const parsed = JSON.parse(json, jsonReviver);
```

## 🎯 Operadores Soportados

### Comparación
- `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
- `$in`, `$nin`

### Lógicos
- `$and`, `$or`, `$not`, `$nor`

### Elemento
- `$exists`, `$type`

### Evaluación
- `$regex`, `$text`, `$where`, `$expr`
- `$mod`, `$jsonSchema`

### Array
- `$all`, `$elemMatch`, `$size`

### Agregación
- `$match`, `$group`, `$sort`, `$limit`, `$skip`
- `$project`, `$unwind`, `$lookup`
- `$sum`, `$avg`, `$min`, `$max`, `$push`

## 🔌 Driver MongoDB

```javascript
import { MongodbDriver } from '@querybuilder/mongodb';

const driver = new MongodbDriver({
  host: 'localhost',
  port: 27017,
  database: 'myapp',
  username: 'user',
  password: 'pass'
});

await driver.connect();
const result = await driver.execute(command);
await driver.disconnect();
```

## 📖 Ejemplos Avanzados

### Pipeline de Agregación Complejo
```javascript
const salesReport = qb
  .aggregate('sales')
  .match({ 
    date: { 
      $gte: new Date('2024-01-01'),
      $lt: new Date('2025-01-01')
    }
  })
  .group({
    _id: {
      year: { $year: '$date' },
      month: { $month: '$date' }
    },
    totalSales: { $sum: '$amount' },
    avgSale: { $avg: '$amount' },
    count: { $sum: 1 }
  })
  .sort({ '_id.year': 1, '_id.month': 1 })
  .project({
    _id: 0,
    period: '$_id',
    total: '$totalSales',
    average: '$avgSale',
    transactions: '$count'
  });
```

### Lookup (Join)
```javascript
const ordersWithCustomers = qb
  .aggregate('orders')
  .lookup({
    from: 'customers',
    localField: 'customerId',
    foreignField: '_id',
    as: 'customer'
  })
  .unwind('$customer')
  .project({
    orderNumber: 1,
    'customer.name': 1,
    'customer.email': 1,
    total: 1
  });
```

### Búsqueda de Texto Completo
```javascript
const articles = qb
  .select('*')
  .from('articles')
  .where({
    $text: {
      $search: 'mongodb querybuilder',
      $language: 'es',
      $caseSensitive: false
    }
  })
  .project({
    title: 1,
    score: { $meta: 'textScore' }
  })
  .sort({ score: { $meta: 'textScore' } });
```

## 🧪 Testing

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import QueryBuilder from '@querybuilder/core';
import { MongoDB } from '@querybuilder/mongodb';

test('MongoDB operations', async () => {
  const qb = new QueryBuilder(MongoDB);
  
  const insert = qb.insertInto('test', { name: 'Test' });
  assert.ok(insert.toString().includes('insertOne'));
  
  const select = qb.select('*').from('test');
  assert.ok(select.toString().includes('find'));
});
```

## 📄 Licencia

MPL-2.0

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en el repositorio.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/mellambias/querybuilder/issues)
- **Documentación**: [QueryBuilder Docs](https://github.com/mellambias/querybuilder#readme)

## 🔗 Enlaces

- [@querybuilder/core](../core/README.md)
- [@querybuilder/mysql](../mysql/README.md)
- [@querybuilder/postgresql](../postgresql/README.md)
