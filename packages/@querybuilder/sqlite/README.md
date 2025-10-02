# SQLite QueryBuilder# @querybuilder/sqlite



Implementación completa del QueryBuilder para SQLite, siguiendo la misma metodología utilizada para MongoDB. SQLite es una base de datos embebida que sigue el estándar SQL con características específicas.SQLite implementation for QueryBuilder - Lightweight, serverless SQL database support.



## 🚀 Características## 📋 Features



### ✅ Funcionalidad Completa✅ **Complete SQLite support** - All major SQLite features  

- **DDL (Data Definition Language)**: CREATE/DROP TABLE, INDEX, VIEW✅ **Lightweight & Fast** - No server required, file-based database  

- **DQL (Data Query Language)**: SELECT, UNION, CASE WHEN✅ **Modern SQLite features** - STRICT tables, WITHOUT ROWID, JSON support  

- **DML (Data Manipulation Language)**: INSERT, UPDATE, DELETE con opciones SQLite✅ **Transaction support** - BEGIN, COMMIT, ROLLBACK, SAVEPOINT  

- **Funciones de Cadena**: SUBSTR, CONCAT, TRIM, LENGTH, UPPER, LOWER✅ **PRAGMA commands** - Database configuration and optimization  

- **Funciones de Utilidad**: COALESCE, NULLIF✅ **Dual driver support** - better-sqlite3 (recommended) or sqlite3  

- **Funciones de Fecha**: DATE, TIME, DATETIME con 'now'✅ **Type safety** - Full TypeScript-ready implementation  

- **Funciones Agregadas**: COUNT, SUM, AVG, MIN, MAX

- **Window Functions**: ROW_NUMBER, RANK, LAG, LEAD (SQLite 3.25+)## 🚀 Installation

- **JSON Functions**: JSON_EXTRACT, JSON_SET, JSON_VALID (SQLite 3.45+)

- **Funciones Matemáticas**: ABS, ROUND, RANDOM```bash

# Install the SQLite package

### 🎯 Características Específicas de SQLitenpm install @querybuilder/sqlite

- **PRAGMA Statements**: Configuración de base de datos

- **UPSERT**: INSERT con ON CONFLICT# Install SQLite driver (choose one)

- **INSERT OR REPLACE/IGNORE**: Manejo de conflictosnpm install better-sqlite3  # Recommended - synchronous, faster

- **ATTACH/DETACH**: Múltiples bases de datos# OR

- **Common Table Expressions (CTE)**: WITH RECURSIVEnpm install sqlite3         # Traditional - asynchronous

- **Full-Text Search**: FTS5 support```



## 📁 Estructura del Proyecto## 💻 Basic Usage



```### Simple Query Builder

sqlite/

├── SQLite.js                 # Clase principal```javascript

├── package.json             # Configuración del paqueteimport { SQLite } from '@querybuilder/sqlite';

├── comandos/import { QueryBuilder } from '@querybuilder/core';

│   └── sqlite.js           # Comandos específicos de SQLite

├── test/// Create SQLite instance

│   └── test-funciones-sqlite.js  # Suite de pruebas completaconst sqlite = new SQLite();

└── README.md               # Documentación

```// Use with QueryBuilder

const qb = new QueryBuilder(sqlite);

## 🛠 Instalación

// Build queries

```bashconst createTable = qb.createTable('users', {

# Instalar dependencias  cols: {

npm install sqlite3    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },

    name: { type: 'TEXT', notNull: true },

# Ejecutar pruebas    email: { type: 'TEXT', unique: true },

npm test    created_at: { type: 'DATETIME', default: 'CURRENT_TIMESTAMP' }

```  }

});

## 📋 Uso Básico

console.log(createTable.toString());

### Importar la Clase// CREATE TABLE users (

//   id INTEGER PRIMARY KEY AUTOINCREMENT,

```javascript//   name TEXT NOT NULL,

import SQLite from '@querybuilder/sqlite';//   email TEXT UNIQUE,

//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP

const sqlite = new SQLite();// )

``````



### DDL Operations### With Database Driver



```javascript```javascript

// Crear base de datos con PRAGMAimport { SQLite } from '@querybuilder/sqlite';

const createDB = sqlite.createDatabase('myapp.db', {import { SqliteDriver } from '@querybuilder/sqlite/driver';

    pragma: ['foreign_keys = ON', 'journal_mode = WAL']import { QueryBuilder } from '@querybuilder/core';

});

// Setup database connection

// Crear tablaconst driver = new SqliteDriver('./myapp.db', {

const createTable = sqlite.createTable('users', {  verbose: true,

    columns: {  foreignKeys: true

        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',});

        name: 'TEXT NOT NULL',

        email: 'TEXT UNIQUE',const sqlite = new SQLite();

        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'const qb = new QueryBuilder(sqlite);

    },

    ifNotExists: true// Connect and execute

});await driver.connect();



// Crear índice// Create table

const createIndex = sqlite.createIndex('idx_user_email', {await driver.query(qb.createTable('users', {

    table: 'users',  cols: {

    columns: ['email'],    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },

    unique: true    name: 'TEXT NOT NULL',

});    email: 'TEXT UNIQUE'

  }

// Crear vista}).toString());

const createView = sqlite.createView('active_users', {

    query: 'SELECT * FROM users WHERE active = 1',// Insert data

    ifNotExists: trueconst insert = qb.insert('users', {

});  name: 'John Doe',

```  email: 'john@example.com'

});

### DQL Operations

const result = await driver.query(insert.toString(), insert.getParams());

```javascriptconsole.log('Inserted ID:', result.insertId);

// UNION queries

const union = sqlite.union(// Query data

    'SELECT name FROM active_users',const select = qb.select('*').from('users').where('email = ?');

    'SELECT name FROM inactive_users'const users = await driver.query(select.toString(), ['john@example.com']);

);console.log('Users:', users.rows);



// CASE WHENawait driver.disconnect();

const caseWhen = sqlite.case([```

    {when: "status = 'active'", then: "'Usuario Activo'"},

    {when: "status = 'inactive'", then: "'Usuario Inactivo'"}## 🔧 SQLite Specific Features

], "'Estado Desconocido'", 'status_description');

```### PRAGMA Commands



### String Functions```javascript

const sqlite = new SQLite();

```javascript

// Substring// Enable foreign keys

const substr = sqlite.substr('name', 1, 10, 'short_name');console.log(sqlite.pragma('foreign_keys', 1));

// PRAGMA foreign_keys = 1

// Concatenación (usando || de SQLite)

const concat = sqlite.concat(['first_name', "' '", 'last_name'], 'full_name');// Set journal mode to WAL

console.log(sqlite.pragma('journal_mode', 'WAL'));

// Trim// PRAGMA journal_mode = WAL

const trim = sqlite.trim('description', null, 'clean_description');

// Check database info

// Lengthconsole.log(sqlite.pragma('database_list'));

const length = sqlite.length('content', 'content_length');// PRAGMA database_list

``````



### Utility Functions### Modern SQLite Features



```javascript```javascript

// COALESCE// STRICT tables (SQLite 3.37+)

const coalesce = sqlite.coalesce(['nickname', 'first_name', "'Anonymous'"], 'display_name');const strictTable = qb.createTable('products', {

  cols: {

// NULLIF    id: 'INTEGER PRIMARY KEY',

const nullif = sqlite.nullif('status', "'unknown'", 'clean_status');    name: 'TEXT NOT NULL',

```    price: 'REAL'

  },

### Date/Time Functions  strict: true

});

```javascript

// Fecha actual// WITHOUT ROWID tables

const currentDate = sqlite.currentDate(); // DATE('now')const withoutRowid = qb.createTable('settings', {

  cols: {

// Hora actual    key: 'TEXT PRIMARY KEY',

const currentTime = sqlite.currentTime(); // TIME('now')    value: 'TEXT'

  },

// Timestamp actual  withoutRowid: true

const now = sqlite.now(); // DATETIME('now')});



// Formato personalizado// Partial indexes

const customDate = sqlite.currentDate('%d/%m/%Y', 'formatted_date');const partialIndex = sqlite.createIndex('idx_active_users', {

```  table: 'users',

  columns: ['email'],

### SQLite Specific Features  where: 'active = 1'

});

```javascript```

// PRAGMA statements

const pragma1 = sqlite.pragma('foreign_keys', 'ON');### Transactions

const pragma2 = sqlite.pragma('table_info', 'users');

```javascript

// UPSERT (INSERT con ON CONFLICT)// Basic transaction

const upsert = sqlite.upsert('users',console.log(sqlite.startTransaction());

    {name: 'John', email: 'john@example.com'},// BEGIN

    ['email'],

    {name: 'John Updated'}// Transaction types

);console.log(sqlite.startTransaction({ type: 'IMMEDIATE' }));

// BEGIN IMMEDIATE

// INSERT OR REPLACE

const insertOrReplace = sqlite.insertOrReplace('users', {console.log(sqlite.startTransaction({ type: 'EXCLUSIVE' }));

    id: 1,// BEGIN EXCLUSIVE

    name: 'Jane',

    email: 'jane@example.com'// Savepoints

});console.log(sqlite.savepoint('sp1'));

// SAVEPOINT sp1

// Table information

const tableInfo = sqlite.tableInfo('users');console.log(sqlite.rollback('sp1'));

const listTables = sqlite.listTables();// ROLLBACK TO sp1

```

console.log(sqlite.releaseSavepoint('sp1'));

### Window Functions (SQLite 3.25+)// RELEASE SAVEPOINT sp1

```

```javascript

// ROW_NUMBER### Database Maintenance

const rowNumber = sqlite.rowNumber('created_at DESC', 'department', 'row_num');

```javascript

// RANK// Vacuum database

const rank = sqlite.rank('score DESC', 'category', 'position');console.log(sqlite.vacuum());

// VACUUM

// LAG/LEAD

const lag = sqlite.lag('amount', 1, 0, 'date', 'user_id', 'prev_amount');// Analyze statistics

const lead = sqlite.lead('amount', 1, 0, 'date', 'user_id', 'next_amount');console.log(sqlite.analyze());

```// ANALYZE



### JSON Functions (SQLite 3.45+)// Reindex

console.log(sqlite.reindex());

```javascript// REINDEX

// JSON_EXTRACT```

const jsonExtract = sqlite.jsonExtract('metadata', '$.name', 'extracted_name');

## 📊 Driver Features

// JSON_SET

const jsonSet = sqlite.jsonSet('data', '$.updated', "'2024-01-01'", 'updated_data');### Connection Options



// JSON_VALID```javascript

const jsonValid = sqlite.jsonValid('json_column', 'is_valid');const driver = new SqliteDriver('./database.db', {

```  verbose: true,        // Log SQL statements

  readonly: false,      // Read-only database

### Math Functions  fileMustExist: false, // Database file must exist

  timeout: 5000,        // Connection timeout

```javascript});

// Valor absoluto```

const abs = sqlite.abs('balance', 'absolute_balance');

### Prepared Statements

// Redondear

const round = sqlite.round('price', 2, 'rounded_price');```javascript

// With better-sqlite3

// Número aleatorioconst stmt = driver.prepare('SELECT * FROM users WHERE age > ?');

const random = sqlite.random('random_value');const users = stmt.all(18);

```

// Transaction with better-sqlite3

## 🧪 Ejecutar Pruebasconst results = await driver.transaction([

  { sql: 'INSERT INTO users (name) VALUES (?)', params: ['Alice'] },

```bash  { sql: 'INSERT INTO users (name) VALUES (?)', params: ['Bob'] }

# Ejecutar todas las pruebas]);

npm run test:all```



# O directamente### Database Introspection

node test/test-funciones-sqlite.js

``````javascript

// Get all tables

Las pruebas validan:const tables = await driver.getTables();

- ✅ Todas las funciones DDLconsole.log('Tables:', tables);

- ✅ Operaciones DQL complejas

- ✅ Funciones de cadena y utilidad// Get table schema

- ✅ Funciones de fecha/horaconst schema = await driver.getTableInfo('users');

- ✅ Características específicas de SQLiteconsole.log('User table schema:', schema);

- ✅ Window Functions y JSON

- ✅ Construcción de queries complejas// Get complete database schema

const fullSchema = await driver.getSchema();

## 🎯 Ventajas de SQLiteconsole.log('Database schema:', fullSchema);

```

### Para Desarrollo

- **Sin servidor**: Archivo único, fácil distribución## 🔄 Migration from Other Databases

- **ACID compliant**: Transacciones confiables

- **SQL estándar**: Sintaxis familiar### From MySQL

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