# @querybuilder/sqlite# @querybuilder/sqlite



Adaptador SQLite para QueryBuilder - Base de datos SQL ligera, embebida y sin servidor.Adaptador SQLite para QueryBuilder - Base de datos SQL ligera, embebida y sin servidor.



## 📦 Instalación## � Instalación



```bash```bash

# Instalar el paquete SQLite# Instalar el paquete SQLite

npm install @querybuilder/core @querybuilder/sqlitenpm install @querybuilder/core @querybuilder/sqlite



# Instalar driver SQLite (elige uno)# Instalar driver SQLite (elige uno)

npm install better-sqlite3  # Recomendado - síncrono, más rápidonpm install better-sqlite3  # Recomendado - síncrono, más rápido

# O# O

npm install sqlite3         # Tradicional - asíncrononpm install sqlite3         # Tradicional - asíncrono

``````



## 🚀 Uso Básico



```javascript## 📁 Estructura del Proyecto## 💻 Basic Usage

import QueryBuilder from '@querybuilder/core';

import { SQLite } from '@querybuilder/sqlite';



// Crear instancia con adaptador SQLite```### Simple Query Builder

const qb = new QueryBuilder(SQLite);

sqlite/

// Operaciones CRUD

const insert = qb.insertInto('users', {├── SQLite.js                 # Clase principal```javascript

  name: 'John Doe',

  email: 'john@example.com',├── package.json             # Configuración del paqueteimport { SQLite } from '@querybuilder/sqlite';

  age: 30

});├── comandos/import { QueryBuilder } from '@querybuilder/core';



const select = qb.select('*').from('users').where('age', '>=', 18);│   └── sqlite.js           # Comandos específicos de SQLite

const update = qb.update('users').set({ status: 'active' }).where('id', '=', 1);

const remove = qb.deleteFrom('users').where('inactive', '=', true);├── test/// Create SQLite instance

```

│   └── test-funciones-sqlite.js  # Suite de pruebas completaconst sqlite = new SQLite();

## 🔧 Características Principales

└── README.md               # Documentación

### ✅ DDL Completo

```javascript```// Use with QueryBuilder

// Crear tabla con características SQLite

qb.createTable('users')const qb = new QueryBuilder(sqlite);

  .addColumn('id', 'INTEGER PRIMARY KEY AUTOINCREMENT')

  .addColumn('name', 'TEXT NOT NULL')## 🛠 Instalación

  .addColumn('email', 'TEXT UNIQUE')

  .addColumn('data', 'JSON')// Build queries

  .addColumn('created_at', "DATETIME DEFAULT (datetime('now'))");

```bashconst createTable = qb.createTable('users', {

// Tabla STRICT (SQLite 3.37+)

qb.createTable('logs')# Instalar dependencias  cols: {

  .strict()

  .addColumn('id', 'INTEGER PRIMARY KEY')npm install sqlite3    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },

  .addColumn('level', 'TEXT NOT NULL')

  .addColumn('message', 'TEXT');    name: { type: 'TEXT', notNull: true },



// Tabla WITHOUT ROWID (optimización)# Ejecutar pruebas    email: { type: 'TEXT', unique: true },

qb.createTable('settings')

  .withoutRowId()npm test    created_at: { type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }

  .addColumn('key', 'TEXT PRIMARY KEY')

  .addColumn('value', 'TEXT');```  }

```

});

### ✅ UPSERT (INSERT ... ON CONFLICT)

```javascript## 📋 Uso Básico

// UPSERT básico

qb.insertInto('users', { email: 'user@test.com', name: 'John' })console.log(createTable.toString());

  .onConflict('email')

  .doUpdate();### Importar la Clase// CREATE TABLE users (



// UPSERT con actualización selectiva//   id INTEGER PRIMARY KEY AUTOINCREMENT,

qb.insertInto('stats', { user_id: 1, views: 1 })

  .onConflict('user_id')```javascript//   name TEXT NOT NULL,

  .doUpdate({ views: 'views + 1' });

import SQLite from '@querybuilder/sqlite';//   email TEXT UNIQUE,

// INSERT OR REPLACE

qb.insertOrReplace('cache', { key: 'user:1', value: '{"name":"John"}' });//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP



// INSERT OR IGNOREconst sqlite = new SQLite();// )

qb.insertOrIgnore('logs', { event: 'login', user_id: 1 });

`````````



### ✅ Funciones JSON (SQLite 3.38+)

```javascript

// Extraer datos JSON### DDL Operations### With Database Driver

qb.select("json_extract(data, '$.email') as email")

  .from('users')

  .where("json_extract(data, '$.active')", '=', 1);

```javascript```javascript

// Modificar JSON

qb.update('users')// Crear base de datos con PRAGMAimport { SQLite } from '@querybuilder/sqlite';

  .set({ data: "json_set(data, '$.lastLogin', datetime('now'))" })

  .where('id', '=', 1);const createDB = sqlite.createDatabase('myapp.db', {import { SqliteDriver } from '@querybuilder/sqlite/driver';



// Validar JSON    pragma: ['foreign_keys = ON', 'journal_mode = WAL']import { QueryBuilder } from '@querybuilder/core';

qb.select('*')

  .from('documents')});

  .where('json_valid(content)', '=', 1);

```// Setup database connection



### ✅ Window Functions (SQLite 3.25+)// Crear tablaconst driver = new SqliteDriver('./myapp.db', {

```javascript

// ROW_NUMBERconst createTable = sqlite.createTable('users', {  verbose: true,

qb.select([

  '*',    columns: {  foreignKeys: true

  'ROW_NUMBER() OVER (ORDER BY salary DESC) as rank'

]).from('employees');        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',});



// PARTITION BY        name: 'TEXT NOT NULL',

qb.select([

  'name',        email: 'TEXT UNIQUE',const sqlite = new SQLite();

  'department',

  'salary',        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'const qb = new QueryBuilder(sqlite);

  'RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank'

]).from('employees');    },



// LAG y LEAD    ifNotExists: true// Connect and execute

qb.select([

  'date',});await driver.connect();

  'sales',

  'LAG(sales) OVER (ORDER BY date) as prev_day_sales',

  'LEAD(sales) OVER (ORDER BY date) as next_day_sales'

]).from('daily_sales');// Crear índice// Create table

```

const createIndex = sqlite.createIndex('idx_user_email', {await driver.query(qb.createTable('users', {

### ✅ Common Table Expressions (CTEs)

```javascript    table: 'users',  cols: {

// CTE simple

qb.with('active_users',     columns: ['email'],    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },

  qb.select('*').from('users').where('active', '=', 1)

).select('*').from('active_users');    unique: true    name: 'TEXT NOT NULL',



// CTE recursivo});    email: 'TEXT UNIQUE'

qb.withRecursive('counter', 

  // Base case  }

  'SELECT 1 as n',

  // Recursive case// Crear vista}).toString());

  'SELECT n + 1 FROM counter WHERE n < 10'

).select('*').from('counter');const createView = sqlite.createView('active_users', {



// Múltiples CTEs    query: 'SELECT * FROM users WHERE active = 1',// Insert data

qb.with('high_earners', 

    qb.select('*').from('employees').where('salary', '>', 100000)    ifNotExists: trueconst insert = qb.insert('users', {

  )

  .with('dept_avg',});  name: 'John Doe',

    qb.select(['department', 'AVG(salary) as avg_salary'])

      .from('employees')```  email: 'john@example.com'

      .groupBy('department')

  )});

  .select('*')

  .from('high_earners')### DQL Operations

  .join('dept_avg', 'high_earners.department', '=', 'dept_avg.department');

```const result = await driver.query(insert.toString(), insert.getParams());



### ✅ Full-Text Search (FTS5)```javascriptconsole.log('Inserted ID:', result.insertId);

```javascript

// Crear tabla FTS5// UNION queries

qb.raw(`

  CREATE VIRTUAL TABLE articles_fts USING fts5(const union = sqlite.union(// Query data

    title, 

    content,     'SELECT name FROM active_users',const select = qb.select('*').from('users').where('email = ?');

    content='articles', 

    content_rowid='id'    'SELECT name FROM inactive_users'const users = await driver.query(select.toString(), ['john@example.com']);

  )

`););console.log('Users:', users.rows);



// Búsqueda de texto completo

qb.select('*')

  .from('articles_fts')// CASE WHENawait driver.disconnect();

  .where('articles_fts', 'MATCH', '"sqlite querybuilder"');

const caseWhen = sqlite.case([```

// Búsqueda con ranking

qb.select(['title', 'rank'])    {when: "status = 'active'", then: "'Usuario Activo'"},

  .from('articles_fts')

  .where('articles_fts', 'MATCH', 'database')    {when: "status = 'inactive'", then: "'Usuario Inactivo'"}## 🔧 SQLite Specific Features

  .orderBy('rank');

```], "'Estado Desconocido'", 'status_description');



### ✅ PRAGMA Statements```### PRAGMA Commands

```javascript

// Configurar journal mode

qb.pragma('journal_mode', 'WAL');

### String Functions```javascript

// Habilitar foreign keys

qb.pragma('foreign_keys', 'ON');const sqlite = new SQLite();



// Ver información de tabla```javascript

qb.pragma('table_info', 'users');

// Substring// Enable foreign keys

// Optimizar base de datos

qb.pragma('optimize');const substr = sqlite.substr('name', 1, 10, 'short_name');console.log(sqlite.pragma('foreign_keys', 1));



// Configurar cache// PRAGMA foreign_keys = 1

qb.pragma('cache_size', 10000);

```// Concatenación (usando || de SQLite)



### ✅ Transaccionesconst concat = sqlite.concat(['first_name', "' '", 'last_name'], 'full_name');// Set journal mode to WAL

```javascript

// Transacción básicaconsole.log(sqlite.pragma('journal_mode', 'WAL'));

const transaction = qb.transaction()

  .begin()// Trim// PRAGMA journal_mode = WAL

  .add(qb.insertInto('users', { name: 'John' }))

  .add(qb.insertInto('logs', { action: 'user_created' }))const trim = sqlite.trim('description', null, 'clean_description');

  .commit();

// Check database info

// Con savepoint

const tx = qb.transaction()// Lengthconsole.log(sqlite.pragma('database_list'));

  .begin()

  .add(qb.update('accounts').set({ balance: 'balance - 100' }).where('id', 1))const length = sqlite.length('content', 'content_length');// PRAGMA database_list

  .savepoint('sp1')

  .add(qb.update('accounts').set({ balance: 'balance + 100' }).where('id', 2))``````

  .commit();



// Rollback

const rollbackTx = qb.transaction()### Utility Functions### Modern SQLite Features

  .begin()

  .add(qb.deleteFrom('temp_data'))

  .rollback();

``````javascript```javascript



### ✅ ATTACH/DETACH Database// COALESCE// STRICT tables (SQLite 3.37+)

```javascript

// Adjuntar otra base de datosconst coalesce = sqlite.coalesce(['nickname', 'first_name', "'Anonymous'"], 'display_name');const strictTable = qb.createTable('products', {

qb.attach('backup.db', 'backup_db');

  cols: {

// Usar tablas de la BD adjunta

qb.select('*').from('backup_db.users');// NULLIF    id: 'INTEGER PRIMARY KEY',



// Copiar datos entre basesconst nullif = sqlite.nullif('status', "'unknown'", 'clean_status');    name: 'TEXT NOT NULL',

qb.insertInto('backup_db.users')

  .select('*')```    price: 'REAL'

  .from('main.users');

  },

// Desconectar base de datos

qb.detach('backup_db');### Date/Time Functions  strict: true

```

});

## 📚 Tipos de Datos SQLite

```javascript

SQLite usa tipado dinámico con clases de almacenamiento:

// Fecha actual// WITHOUT ROWID tables

```javascript

// Tipos principalesconst currentDate = sqlite.currentDate(); // DATE('now')const withoutRowid = qb.createTable('settings', {

qb.createTable('example')

  .addColumn('id', 'INTEGER PRIMARY KEY')  cols: {

  .addColumn('name', 'TEXT NOT NULL')

  .addColumn('amount', 'REAL')// Hora actual    key: 'TEXT PRIMARY KEY',

  .addColumn('data', 'BLOB')

  .addColumn('active', 'INTEGER'); // Para BOOLEAN (0/1)const currentTime = sqlite.currentTime(); // TIME('now')    value: 'TEXT'



// Tipos estrictos (STRICT tables)  },

qb.createTable('strict_example')

  .strict()// Timestamp actual  withoutRowid: true

  .addColumn('id', 'INTEGER PRIMARY KEY')

  .addColumn('value', 'INT')    // Permite NULLconst now = sqlite.now(); // DATETIME('now')});

  .addColumn('name', 'TEXT')

  .addColumn('price', 'REAL')

  .addColumn('any_data', 'ANY'); // Permite cualquier tipo

```// Formato personalizado// Partial indexes



## 🎯 Funciones SQLiteconst customDate = sqlite.currentDate('%d/%m/%Y', 'formatted_date');const partialIndex = sqlite.createIndex('idx_active_users', {



### Funciones de String```  table: 'users',

```javascript

qb.select([  columns: ['email'],

  "SUBSTR(name, 1, 5) as short_name",

  "LENGTH(email) as email_length",### SQLite Specific Features  where: 'active = 1'

  "UPPER(status) as status_upper",

  "LOWER(name) as name_lower",});

  "TRIM(description) as clean_desc",

  "name || ' ' || surname as full_name" // Concatenación```javascript```

]).from('users');

```// PRAGMA statements



### Funciones de Fechaconst pragma1 = sqlite.pragma('foreign_keys', 'ON');### Transactions

```javascript

qb.select([const pragma2 = sqlite.pragma('table_info', 'users');

  "DATE('now') as today",

  "TIME('now') as current_time",```javascript

  "DATETIME('now') as now",

  "STRFTIME('%Y-%m-%d', created_at) as date_only",// UPSERT (INSERT con ON CONFLICT)// Basic transaction

  "JULIANDAY('now') - JULIANDAY(created_at) as days_ago"

]).from('events');const upsert = sqlite.upsert('users',console.log(sqlite.startTransaction());

```

    {name: 'John', email: 'john@example.com'},// BEGIN

### Funciones Matemáticas

```javascript    ['email'],

qb.select([

  'ABS(balance) as absolute',    {name: 'John Updated'}// Transaction types

  'ROUND(price, 2) as rounded_price',

  'RANDOM() as random_num',);console.log(sqlite.startTransaction({ type: 'IMMEDIATE' }));

  'MAX(salary, 50000) as adjusted_salary',

  'MIN(age, 65) as capped_age'// BEGIN IMMEDIATE

]).from('data');

```// INSERT OR REPLACE



### Funciones de Agregaciónconst insertOrReplace = sqlite.insertOrReplace('users', {console.log(sqlite.startTransaction({ type: 'EXCLUSIVE' }));

```javascript

qb.select([    id: 1,// BEGIN EXCLUSIVE

  'COUNT(*) as total',

  'SUM(amount) as total_amount',    name: 'Jane',

  'AVG(price) as average_price',

  'MIN(created_at) as first_date',    email: 'jane@example.com'// Savepoints

  'MAX(updated_at) as last_update',

  'GROUP_CONCAT(tag, ", ") as tags'});console.log(sqlite.savepoint('sp1'));

]).from('orders').groupBy('customer_id');

```// SAVEPOINT sp1



## 🔌 Drivers SQLite// Table information



### better-sqlite3 (Recomendado)const tableInfo = sqlite.tableInfo('users');console.log(sqlite.rollback('sp1'));

```javascript

import Database from 'better-sqlite3';const listTables = sqlite.listTables();// ROLLBACK TO sp1



const db = new Database('mydb.sqlite');```



// Síncrono - más simpleconsole.log(sqlite.releaseSavepoint('sp1'));

const result = db.prepare('SELECT * FROM users').all();

### Window Functions (SQLite 3.25+)// RELEASE SAVEPOINT sp1

// Con QueryBuilder

const query = qb.select('*').from('users').toString();```

const rows = db.prepare(query).all();

``````javascript



### sqlite3 (Tradicional)// ROW_NUMBER### Database Maintenance

```javascript

import sqlite3 from 'sqlite3';const rowNumber = sqlite.rowNumber('created_at DESC', 'department', 'row_num');



const db = new sqlite3.Database('mydb.sqlite');```javascript



// Asíncrono// RANK// Vacuum database

db.all('SELECT * FROM users', [], (err, rows) => {

  if (err) throw err;const rank = sqlite.rank('score DESC', 'category', 'position');console.log(sqlite.vacuum());

  console.log(rows);

});// VACUUM



// Con promesas// LAG/LEAD

const { promisify } = require('util');

const all = promisify(db.all.bind(db));const lag = sqlite.lag('amount', 1, 0, 'date', 'user_id', 'prev_amount');// Analyze statistics

const rows = await all('SELECT * FROM users');

```const lead = sqlite.lead('amount', 1, 0, 'date', 'user_id', 'next_amount');console.log(sqlite.analyze());



## 📖 Ejemplos Avanzados```// ANALYZE



### Migración de Datos

```javascript

// Crear tabla temporal### JSON Functions (SQLite 3.45+)// Reindex

qb.createTable('users_new')

  .addColumn('id', 'INTEGER PRIMARY KEY')console.log(sqlite.reindex());

  .addColumn('email', 'TEXT UNIQUE NOT NULL')

  .addColumn('data', 'JSON');```javascript// REINDEX



// Copiar datos con transformación// JSON_EXTRACT```

qb.insertInto('users_new')

  .select([const jsonExtract = sqlite.jsonExtract('metadata', '$.name', 'extracted_name');

    'id',

    'email',## 📊 Driver Features

    "json_object('name', name, 'age', age) as data"

  ])// JSON_SET

  .from('users_old');

const jsonSet = sqlite.jsonSet('data', '$.updated', "'2024-01-01'", 'updated_data');### Connection Options

// Renombrar tabla

qb.raw('ALTER TABLE users_old RENAME TO users_backup');

qb.raw('ALTER TABLE users_new RENAME TO users');

```// JSON_VALID```javascript



### Análisis con Window Functionsconst jsonValid = sqlite.jsonValid('json_column', 'is_valid');const driver = new SqliteDriver('./database.db', {

```javascript

// Ranking y percentiles```  verbose: true,        // Log SQL statements

qb.select([

  'product_name',  readonly: false,      // Read-only database

  'sales',

  'PERCENT_RANK() OVER (ORDER BY sales DESC) as percentile',### Math Functions  fileMustExist: false, // Database file must exist

  'NTILE(4) OVER (ORDER BY sales DESC) as quartile',

  'CUME_DIST() OVER (ORDER BY sales DESC) as cumulative_dist'  timeout: 5000,        // Connection timeout

]).from('products');

``````javascript});



### JSON Complejo// Valor absoluto```

```javascript

// Consulta JSON anidadoconst abs = sqlite.abs('balance', 'absolute_balance');

qb.select([

  'id',### Prepared Statements

  "json_extract(profile, '$.address.city') as city",

  "json_extract(profile, '$.preferences.theme') as theme"// Redondear

]).from('users')

  .where("json_extract(profile, '$.verified')", '=', 1);const round = sqlite.round('price', 2, 'rounded_price');```javascript



// Actualizar JSON anidado// With better-sqlite3

qb.update('users')

  .set({// Número aleatorioconst stmt = driver.prepare('SELECT * FROM users WHERE age > ?');

    profile: "json_set(profile, '$.lastLogin', datetime('now'), '$.loginCount', json_extract(profile, '$.loginCount') + 1)"

  })const random = sqlite.random('random_value');const users = stmt.all(18);

  .where('id', '=', 1);

``````



## 🧪 Testing// Transaction with better-sqlite3



```javascript## 🧪 Ejecutar Pruebasconst results = await driver.transaction([

import { test } from 'node:test';

import assert from 'node:assert/strict';  { sql: 'INSERT INTO users (name) VALUES (?)', params: ['Alice'] },

import QueryBuilder from '@querybuilder/core';

import { SQLite } from '@querybuilder/sqlite';```bash  { sql: 'INSERT INTO users (name) VALUES (?)', params: ['Bob'] }



test('SQLite operations', () => {# Ejecutar todas las pruebas]);

  const qb = new QueryBuilder(SQLite);

  npm run test:all```

  const create = qb.createTable('test')

    .addColumn('id', 'INTEGER PRIMARY KEY')

    .toString();

  # O directamente### Database Introspection

  assert.ok(create.includes('CREATE TABLE'));

  assert.ok(create.includes('INTEGER PRIMARY KEY'));node test/test-funciones-sqlite.js

});

`````````javascript



## ⚡ Características SQLite// Get all tables



- **Sin servidor**: Base de datos embebida en archivoLas pruebas validan:const tables = await driver.getTables();

- **Transaccional**: ACID completo

- **Tipado dinámico**: Flexibilidad en tipos de datos- ✅ Todas las funciones DDLconsole.log('Tables:', tables);

- **Ligera**: ~600KB de biblioteca

- **Multiplataforma**: Windows, Linux, macOS- ✅ Operaciones DQL complejas

- **Dominio público**: Sin restricciones de licencia

- ✅ Funciones de cadena y utilidad// Get table schema

## 📄 Versiones Soportadas

- ✅ Funciones de fecha/horaconst schema = await driver.getTableInfo('users');

- **SQLite 3.35+**: Características básicas

- **SQLite 3.37+**: STRICT tables- ✅ Características específicas de SQLiteconsole.log('User table schema:', schema);

- **SQLite 3.38+**: Funciones JSON mejoradas

- **SQLite 3.45+**: Últimas mejoras JSON- ✅ Window Functions y JSON



## 📄 Licencia- ✅ Construcción de queries complejas// Get complete database schema



MPL-2.0const fullSchema = await driver.getSchema();



## 🤝 Contribuciones## 🎯 Ventajas de SQLiteconsole.log('Database schema:', fullSchema);



Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en el repositorio.```



## 🔗 Enlaces### Para Desarrollo



- [@querybuilder/core](../core/README.md)- **Sin servidor**: Archivo único, fácil distribución## 🔄 Migration from Other Databases

- [@querybuilder/mysql](../mysql/README.md)

- [@querybuilder/postgresql](../postgresql/README.md)- **ACID compliant**: Transacciones confiables

- [@querybuilder/mongodb](../mongodb/README.md)

- [SQLite Documentation](https://www.sqlite.org/docs.html)- **SQL estándar**: Sintaxis familiar### From MySQL


- **Zero-configuration**: No requiere configuración

```javascript

### Para Producción// MySQL-style

- **Alto rendimiento**: Especialmente para lecturasconst mysql = qb.createTable('users', {

- **Concurrent reads**: Múltiples lectores simultáneos  cols: {

- **Embebido**: Integración directa en aplicaciones    id: 'INT AUTO_INCREMENT PRIMARY KEY',  // MySQL

- **Cross-platform**: Funciona en cualquier OS    name: 'VARCHAR(255) NOT NULL'

  }

## 🔄 Comparación con Otras Implementaciones});



| Característica | SQLite | MongoDB | MySQL | PostgreSQL |// SQLite equivalent

|---|---|---|---|---|const sqlite = qb.createTable('users', {

| **Tipo** | SQL Embebida | NoSQL Documento | SQL Servidor | SQL Servidor |  cols: {

| **Setup** | ✅ Zero-config | ❌ Servidor | ❌ Servidor | ❌ Servidor |    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },  // SQLite

| **ACID** | ✅ Completo | ⚠️ Documento | ✅ Completo | ✅ Completo |    name: { type: 'TEXT', notNull: true }

| **JSON** | ✅ Nativo | ✅ Nativo | ✅ Nativo | ✅ Nativo |  }

| **Window Functions** | ✅ Sí | ❌ No | ✅ Sí | ✅ Sí |});

| **Full-Text Search** | ✅ FTS5 | ✅ Text Index | ✅ Nativo | ✅ Nativo |```

| **Deployment** | ✅ Archivo único | ❌ Cluster | ❌ Servidor | ❌ Servidor |

### From PostgreSQL

## 🚀 Casos de Uso Ideales

```javascript

### ✅ Perfecto Para:// PostgreSQL-style

- **Aplicaciones móviles** (iOS, Android)const pg = qb.createTable('users', {

- **Aplicaciones de escritorio** (Electron, Tauri)  cols: {

- **Prototipos rápidos** y desarrollo local    id: 'SERIAL PRIMARY KEY',  // PostgreSQL

- **Aplicaciones embebidas** (IoT, embedded systems)    data: 'JSONB'

- **Cache local** y storage offline  }

- **Testing** y desarrollo de aplicaciones});



### ⚠️ Considerar Alternativas Para:// SQLite equivalent

- **Aplicaciones web** con alta concurrencia de escrituraconst sqlite = qb.createTable('users', {

- **Sistemas distribuidos** multi-servidor  cols: {

- **Big Data** con terabytes de información    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },  // SQLite

- **Análisis en tiempo real** con múltiples escritores    data: 'JSON'  // SQLite 3.38+

  }

## 📈 Roadmap});

```

### Versión Actual (1.0.0)

- ✅ Implementación completa del estándar SQL## 🚫 SQLite Limitations

- ✅ Características específicas de SQLite

- ✅ Window Functions y JSON supportSQLite doesn't support some SQL features:

- ✅ Suite de pruebas comprehensiva

```javascript

### Próximas Versiones// ❌ These will throw errors

- 🔄 **FTS5 Integration**: Full-text search avanzadosqlite.createRoles(['admin', 'user']);        // No roles

- 🔄 **Backup/Restore**: Comandos automatizadossqlite.grant('SELECT', 'users', 'admin');     // No GRANT/REVOKE

- 🔄 **Schema Migration**: Herramientas de migraciónsqlite.createDomain('email', { type: 'TEXT' }); // No domains

- 🔄 **Performance Profiling**: EXPLAIN QUERY PLAN integrationsqlite.fullJoin('table1', 'table2');          // No FULL OUTER JOIN



## 🤝 Contribuir// ✅ Use alternatives

// Instead of roles: implement in application layer

1. Fork el proyecto// Instead of domains: use CHECK constraints

2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)// Instead of FULL JOIN: use LEFT JOIN UNION RIGHT JOIN

3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)```

4. Push a la branch (`git push origin feature/nueva-funcionalidad`)

5. Crear Pull Request## 📚 Examples



## 📄 LicenciaCheck the `examples/` directory for complete working examples:



MIT License - ver archivo [LICENSE](LICENSE) para detalles.- `basic-usage.js` - Simple CRUD operations

- `advanced-features.js` - Modern SQLite features

## 🙏 Agradecimientos- `migrations.js` - Database schema migrations

- `performance.js` - Optimization techniques

- **SQLite Development Team** por la excelente base de datos

- **QueryBuilder Core Team** por la arquitectura base## 🔗 Related Packages

- **MongoDB Implementation** por la metodología de desarrollo
- `@querybuilder/core` - Core QueryBuilder functionality
- `@querybuilder/mysql` - MySQL support
- `@querybuilder/postgresql` - PostgreSQL support
- `@querybuilder/mongodb` - MongoDB support

## 📝 License

MIT © mellambias