---
title: API Generada desde JSDoc
description: Documentación automática generada desde comentarios JSDoc
---

# API Generada desde JSDoc

##### Modules

<dl>
<dt><a href="#module_@querybuilder/core/config">@querybuilder/core/config</a></dt>
<dd><p>Contiene la configuración de conexión para diferentes motores de base de datos
incluyendo MySQL, MariaDB, PostgreSQL y MongoDB, tanto para producción como para testing.</p>
</dd>
</dl>

##### Classes

<dl>
<dt><a href="#QueryBuilder">QueryBuilder</a></dt>
<dd></dd>
<dt><a href="#Core">Core</a></dt>
<dd></dd>
</dl>

##### Objects

<dl>
<dt><a href="#typedefs">typedefs</a> : <code>object</code></dt>
<dd></dd>
</dl>

##### Functions

<dl>
<dt><a href="#QueryBuilderDefine la condición WHERE CURRENT OF para un cursor específico.Esta cláusula se utiliza en sentencias SQL para referirse a la fila actual apuntada por un cursor.Es especialmente útil en operaciones de actualización o eliminación donde se desea modificar o eliminarla fila actual del conjunto de resultados manejado por el cursor.whereCursor">whereCursor(cursorName, next)</a> ⇒ <code><a href="#QueryBuilder">QueryBuilder</a></code></dt>
<dd></dd>
</dl>

##### Typedefs

<dl>
<dt><a href="#Status">Status</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DatabaseParams">DatabaseParams</a> : <code>Object</code></dt>
<dd><p>Parámetros básicos de conexión a base de datos.
Define la información mínima necesaria para establecer una conexión.</p>
</dd>
<dt><a href="#MongoDBOptions">MongoDBOptions</a> : <code>Object</code></dt>
<dd><p>Opciones específicas de configuración para MongoDB.
Define parámetros adicionales para optimizar la conexión MongoDB.</p>
</dd>
<dt><a href="#MongoDBParams">MongoDBParams</a> : <code>Object</code></dt>
<dd><p>Parámetros extendidos específicos para conexiones MongoDB.
Incluye configuraciones adicionales y método para generar cadena de conexión.</p>
</dd>
<dt><a href="#DatabaseConfig">DatabaseConfig</a> : <code>Object</code></dt>
<dd><p>Configuración completa para un motor de base de datos específico.
Define todos los aspectos necesarios para conectar y operar con una base de datos.</p>
</dd>
<dt><a href="#next">next</a> : <code>Object</code></dt>
<dd><p>Objeto de contexto para el encadenamiento fluido de métodos QueryBuilder.
Mantiene el estado de la consulta SQL mientras se construye progresivamente.
Este objeto es gestionado internamente por el Proxy de QueryBuilder y 
permite que los métodos mantengan contexto entre llamadas encadenadas.</p>
</dd>
<dt><a href="#queryBuilderOptions">queryBuilderOptions</a> : <code>Object</code></dt>
<dd><p>Opciones de configuración para la instancia QueryBuilder.
Define comportamientos, adaptadores y configuraciones específicas del entorno.</p>
</dd>
<dt><a href="#ResultData">ResultData</a> : <code>Object</code></dt>
<dd><p>Datos de resultado después de ejecutar una consulta SQL.
Contiene información sobre la ejecución y los datos devueltos.</p>
</dd>
</dl>

##### @querybuilder/core/config
Contiene la configuración de conexión para diferentes motores de base de datosincluyendo MySQL, MariaDB, PostgreSQL y MongoDB, tanto para producción como para testing.

**Requires**: <code>module:./types/typedefs.js</code>  
**Version**: 2.0.0  
**Author**: QueryBuilder Team  

* [@querybuilder/core/config](#module_@querybuilder/core/config)
    * [~config](#module_@querybuilder/core/config..config) : <code>Object</code>
        * [.databases](#module_@querybuilder/core/config..config.databases) : <code>Object.&lt;string, types.DatabaseConfig&gt;</code>
            * [.MySql8](#module_@querybuilder/core/config..config.databases.MySql8) : <code>types.DatabaseConfig</code>
            * [.MariaDB](#module_@querybuilder/core/config..config.databases.MariaDB) : <code>types.DatabaseConfig</code>
            * [.PostgreSQL](#module_@querybuilder/core/config..config.databases.PostgreSQL) : <code>types.DatabaseConfig</code>
            * [.MongoDB](#module_@querybuilder/core/config..config.databases.MongoDB) : <code>types.DatabaseConfig</code>
        * [.testing](#module_@querybuilder/core/config..config.testing) : <code>Object.&lt;string, types.DatabaseConfig&gt;</code>
            * [.MySQL](#module_@querybuilder/core/config..config.testing.MySQL) : <code>types.DatabaseConfig</code>
    * [~getConnectionString()](#module_@querybuilder/core/config..getConnectionString) ⇒ <code>string</code>

#### @querybuilder/core/config~config : <code>Object</code>
Configuración principal de bases de datos para QueryBuilder

**Kind**: inner constant of [<code>@querybuilder/core/config</code>](#module_@querybuilder/core/config)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| databases | <code>Object.&lt;string, types.DatabaseConfig&gt;</code> | Configuraciones de bases de datos para producción |
| testing | <code>Object.&lt;string, types.DatabaseConfig&gt;</code> | Configuraciones de bases de datos para testing |

* [~config](#module_@querybuilder/core/config..config) : <code>Object</code>
    * [.databases](#module_@querybuilder/core/config..config.databases) : <code>Object.&lt;string, types.DatabaseConfig&gt;</code>
        * [.MySql8](#module_@querybuilder/core/config..config.databases.MySql8) : <code>types.DatabaseConfig</code>
        * [.MariaDB](#module_@querybuilder/core/config..config.databases.MariaDB) : <code>types.DatabaseConfig</code>
        * [.PostgreSQL](#module_@querybuilder/core/config..config.databases.PostgreSQL) : <code>types.DatabaseConfig</code>
        * [.MongoDB](#module_@querybuilder/core/config..config.databases.MongoDB) : <code>types.DatabaseConfig</code>
    * [.testing](#module_@querybuilder/core/config..config.testing) : <code>Object.&lt;string, types.DatabaseConfig&gt;</code>
        * [.MySQL](#module_@querybuilder/core/config..config.testing.MySQL) : <code>types.DatabaseConfig</code>

##### config.databases : <code>Object.&lt;string, types.DatabaseConfig&gt;</code>
Configuraciones de bases de datos para entorno de producción

**Kind**: static property of [<code>config</code>](#module_@querybuilder/core/config..config)  

* [.databases](#module_@querybuilder/core/config..config.databases) : <code>Object.&lt;string, types.DatabaseConfig&gt;</code>
    * [.MySql8](#module_@querybuilder/core/config..config.databases.MySql8) : <code>types.DatabaseConfig</code>
    * [.MariaDB](#module_@querybuilder/core/config..config.databases.MariaDB) : <code>types.DatabaseConfig</code>
    * [.PostgreSQL](#module_@querybuilder/core/config..config.databases.PostgreSQL) : <code>types.DatabaseConfig</code>
    * [.MongoDB](#module_@querybuilder/core/config..config.databases.MongoDB) : <code>types.DatabaseConfig</code>

###### databases.MySql8 : <code>types.DatabaseConfig</code>
Configuración para MySQL 8.x

**Kind**: static property of [<code>databases</code>](#module_@querybuilder/core/config..config.databases)  

###### databases.MariaDB : <code>types.DatabaseConfig</code>
Configuración para MariaDB

**Kind**: static property of [<code>databases</code>](#module_@querybuilder/core/config..config.databases)  

###### databases.PostgreSQL : <code>types.DatabaseConfig</code>
Configuración para PostgreSQL 16.x

**Kind**: static property of [<code>databases</code>](#module_@querybuilder/core/config..config.databases)  

###### databases.MongoDB : <code>types.DatabaseConfig</code>
Configuración para MongoDB 8.x

**Kind**: static property of [<code>databases</code>](#module_@querybuilder/core/config..config.databases)  

##### config.testing : <code>Object.&lt;string, types.DatabaseConfig&gt;</code>
Configuraciones de bases de datos para entorno de testingIncluye configuraciones específicas para pruebas unitarias e integración

**Kind**: static property of [<code>config</code>](#module_@querybuilder/core/config..config)  

###### testing.MySQL : <code>types.DatabaseConfig</code>
Configuración de MySQL para testing

**Kind**: static property of [<code>testing</code>](#module_@querybuilder/core/config..config.testing)  

#### @querybuilder/core/config~getConnectionString() ⇒ <code>string</code>
Genera la cadena de conexión para MongoDB

**Kind**: inner method of [<code>@querybuilder/core/config</code>](#module_@querybuilder/core/config)  
**Returns**: <code>string</code> - Cadena de conexión MongoDB con formato mongodb://[username:password@]host[:port]/?options  
**Example**  
```js
// Sin autenticación"mongodb://localhost:27017/?retryWrites=true&w=majority&connectTimeoutMS=30000"// Con autenticación"mongodb://user:pass@localhost:27017/?retryWrites=true&w=majority&connectTimeoutMS=30000"
```

##### QueryBuilder
**Tipo**: Clase global  

* QueryBuilder
    * [new QueryBuilder(language, [options])](#new_QueryBuilder_new)
    * _instance_
        * [.result](+result)
    * _static_
        * _DCL_
            * [.grant(privilegios, on, to, next)](#QueryBuilder.grant) ⇒ `QueryBuilder`
            * [.revoke(privilegios, on, from, next)](#QueryBuilder.revoke) ⇒ `QueryBuilder`
            * [.grantRoles(roles, users, next)](#QueryBuilder.grantRoles) ⇒ `QueryBuilder`
            * [.revokeRoles(roles, from, next)](#QueryBuilder.revokeRoles) ⇒ `QueryBuilder`
        * _DDL_
            * [.createDatabase(name, options, next)](#QueryBuilder.createDatabase) ⇒ `QueryBuilder`
            * [.dropDatabase(name, options, next)](#QueryBuilder.dropDatabase) ⇒ `QueryBuilder`
            * [.createSchema(name, options, next)](#QueryBuilder.createSchema) ⇒ `QueryBuilder`
            * [.dropSchema(name, options, next)](#QueryBuilder.dropSchema) ⇒ `QueryBuilder`
            * [.createTable(name, options, next)](#QueryBuilder.createTable) ⇒ `QueryBuilder`
            * [.alterTable(name, next)](#QueryBuilder.alterTable) ⇒ `QueryBuilder`
            * [.alterTableComands(name, options, next)](#QueryBuilder.alterTableComands) ⇒ `QueryBuilder`
            * [.dropTable(name, option, next)](#QueryBuilder.dropTable) ⇒ `QueryBuilder`
            * [.createType(name, option, next)](#QueryBuilder.createType) ⇒ `QueryBuilder`
            * [.dropType(name, option, next)](#QueryBuilder.dropType) ⇒ `QueryBuilder`
            * [.createAssertion(name, assertion, next)](#QueryBuilder.createAssertion) ⇒ `QueryBuilder`
            * [.createDomain(name, options, next)](#QueryBuilder.createDomain) ⇒ `QueryBuilder`
            * [.createView(name, options, next)](#QueryBuilder.createView) ⇒ `QueryBuilder`
            * [.dropView(name, next)](#QueryBuilder.dropView) ⇒ `QueryBuilder`
            * [.createRoles(names, next)](#QueryBuilder.createRoles) ⇒ `QueryBuilder`
            * [.dropRoles(names, options, next)](#QueryBuilder.dropRoles) ⇒ `QueryBuilder`
            * [.createCursor(name, expresion, options, next)](#QueryBuilder.createCursor) ⇒ `QueryBuilder`
        * _DML_
            * [.insert(table, values, cols, next)](#QueryBuilder.insert) ⇒ `QueryBuilder`
            * [.update(table, sets, next)](#QueryBuilder.update) ⇒ `Promise<QueryBuilder>`
            * [.delete(from, next)](#QueryBuilder.delete) ⇒ `QueryBuilder`
        * _DQL_
            * [.select(columns, options, next)](#QueryBuilder.select) ⇒ `QueryBuilder`
            * [.checkFrom(tables, alias)](#QueryBuilder.checkFrom)
            * [.from(tables, alias, next)](#QueryBuilder.from) ⇒ `QueryBuilder`
            * [.where(predicados, next)](#QueryBuilder.where) ⇒ `QueryBuilder`
            * [.groupBy(columns, options, next)](#QueryBuilder.groupBy) ⇒ `QueryBuilder`
            * [.having(predicado, options, next)](#QueryBuilder.having) ⇒ `QueryBuilder`
            * [.orderBy(columns, next)](#QueryBuilder.orderBy) ⇒ `QueryBuilder`
            * [.orderBy(columns, next)](#QueryBuilder.orderBy) ⇒ `QueryBuilder`
            * [.limit(limit, next)](#QueryBuilder.limit) ⇒ `QueryBuilder`
        * _Functions_
            * [.substr(column, inicio, [longitud], next)](#QueryBuilder.substr) ⇒ `QueryBuilder`
        * _General_
            * [.driver(driverClass, params)](#QueryBuilder.driver) ⇒ [<code>next</code>](#next)
            * [.use(database, next)](#QueryBuilder.use) ⇒ `QueryBuilder`
            * [.on(condition, next)](#QueryBuilder.on) ⇒ `QueryBuilder`
            * [.union(selects)](#QueryBuilder.union) ⇒ `QueryBuilder`
            * [.unionAll(selects)](#QueryBuilder.unionAll) ⇒ `QueryBuilder`
            * [.except(selects)](#QueryBuilder.except) ⇒ `QueryBuilder`
            * [.exceptAll(selects)](#QueryBuilder.exceptAll) ⇒ `QueryBuilder`
            * [.on(predicado, next)](#QueryBuilder.on) ⇒ `QueryBuilder`
            * [.col(name, [table])](#QueryBuilder.col) ⇒ <code>Column</code>
            * [.exp(expresion)](#QueryBuilder.exp) ⇒ <code>Expresion</code>
            * [.offset(offset, next)](#QueryBuilder.offset) ⇒ `QueryBuilder`
            * [.case(column, casos, defecto, next)](#QueryBuilder.case) ⇒ `QueryBuilder`
            * [.functionDate()](#QueryBuilder.functionDate) ⇒ `QueryBuilder`
            * [.execute([testOnly])](#QueryBuilder.execute) ⇒ `Promise<QueryBuilder>`
        * _Predicates_
            * [.using(columnsInCommon, next)](#QueryBuilder.using) ⇒ `QueryBuilder`
            * [.intersect(selects)](#QueryBuilder.intersect) ⇒ `QueryBuilder`
            * [.intersectAll(selects)](#QueryBuilder.intersectAll) ⇒ `QueryBuilder`
            * [.in(columna, values, next)](#QueryBuilder.in) ⇒ `QueryBuilder`
            * [.notIn(columna, values, next)](#QueryBuilder.notIn) ⇒ `QueryBuilder`
            * [.coltn(table, name)](#QueryBuilder.coltn) ⇒ <code>Column</code>
            * [.openCursor(name, next)](#QueryBuilder.openCursor) ⇒ `QueryBuilder`
            * [.closeCursor(name, next)](#QueryBuilder.closeCursor) ⇒ `QueryBuilder`
            * [.setConstraints(restrictions, type, next)](#QueryBuilder.setConstraints) ⇒ `QueryBuilder`
            * [.toString([options])](#QueryBuilder.toString) ⇒ <code>Promise.&lt;string&gt;</code>
        * _Transactions_
            * [.setTransaction(options)](#QueryBuilder.setTransaction) ⇒ <code>Transaction</code>
        * _Utilities_
            * [.thread(id)](#QueryBuilder.thread) ⇒ `QueryBuilder`

#### new QueryBuilder(language, [options])
Clase principal QueryBuilder que proporciona una API fluida para construir y ejecutar consultas de base de datos.Delega la sintaxis SQL/NoSQL a adaptadores de lenguaje (MySQL, PostgreSQL, MongoDB, etc.) derivados de la clase Core.Soporta construcción y ejecución de consultas, gestión de conexiones, transacciones y cursores usando clases drivers derivadas de la clase Driver.Soporta múltiples paradigmas de base de datos (SQL, NoSQL, Vector, En-Memoria).

**Returns**: `QueryBuilder` - Instancia de QueryBuilder para encadenar métodos  

| Param | Type | Description |
| --- | --- | --- |
| language | [<code>Core</code>](#Core) | Clase de lenguaje (adaptador SQL/NoSQL) derivada de Core |
| [options] | [<code>queryBuilderOptions</code>](#queryBuilderOptions) | Opciones de configuración para QueryBuilder |

#### queryBuilder.result
Getter y setter para querybuilder

**Kind**: instance property of `QueryBuilder`  

.grant(privilegios, on, to, next) ⇒ `QueryBuilder`
Otorga permisos a usuarios o roles sobre objetos de la base de datos.Permite asignar permisos a usuarios.- PostgreSQL	✅	Permite permisos detallados a nivel de columna, tabla y esquema.- MySQL				✅	Usa GRANT junto con WITH GRANT OPTION para permitir reasignar permisos.- SQL Server	✅	También usa DENY y REVOKE para revocar permisos.- Oracle			✅	Soporta permisos sobre tablas, roles, procedimientos y secuencias.- SQLite			❌ No maneja usuarios ni permisos a nivel SQL.- MongoDB			✅	grantRolesToUser()	Permite asignar roles con permisos específicos.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DCL  

| Param | Type | Description |
| --- | --- | --- |
| privilegios | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Permisos a conceder |
| on | <code>string</code> \| <code>object</code> | Objeto sobre el que se otorga |
| on.objectType | <code>objectTypes</code> | Especifica el tipo sobre el que se aplica 'types/privilevios.js' |
| to | <code>&quot;PUBLIC&quot;</code> \| <code>&quot;ALL&quot;</code> \| <code>string</code> \| <code>Array.&lt;string&gt;</code> | usuarios o roles a los que se otorga |
| options.withGrant | <code>boolean</code> | WITH GRANT OPTION |
| options.grantBy | <code>&quot;CURRENT\_USER&quot;</code> \| <code>&quot;CURRENT\_ROLE&quot;</code> | GRANTED BY |
| options.role | <code>\*</code> | rol desde el que se otorga |
| options.admin | <code>\*</code> | true (WITH ADMIN OPTION) |
| options.cascade | <code>boolean</code> | "CASCADE"/"RESTRICT" |
| options.restrict | <code>boolean</code> | "RESTRICT"/"CASCADE" |
| next | <code>object</code> |  |

**Example**  
```js
qb.revoke('SELECT', 'users', 'admin');// Resultado esperado: { success: true, granted: 'SELECT', on: 'users', to: 'admin' }
```

#### QueryBuilder.revoke(privilegios, on, from, next) ⇒ `QueryBuilder`
Revoca permisos previamente otorgados a usuarios o roles sobre objetos de la base de datos.Se utiliza para eliminar permisos previamente otorgados a usuarios,restringiendo el acceso a objetos como tablas, vistas y esquemas.- PostgreSQL	✅ Sí	Permite revocar permisos de usuarios y roles sobre tablas, esquemas y columnas.- MySQL				✅ Sí	Se usa junto con GRANT para administrar permisos.- SQL Server	✅ Sí	Además, permite DENY para bloquear permisos específicos.- Oracle			✅ Sí	Puede revocar permisos de usuarios y roles sobre objetos de la base de datos.- SQLite			❌ No	No maneja usuarios ni permisos a nivel SQL.- MongoDB			✅	revokeRolesFromUser()	Permite eliminar roles previamente asignados a un usuario.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DCL  

| Param | Type | Description |
| --- | --- | --- |
| privilegios | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Permisos a conceder |
| on | <code>string</code> \| <code>object</code> | Objeto sobre el que se otorga |
| on.objectType | <code>objectTypes</code> | Especifica el tipo sobre el que se aplica 'types/privilevios.js' |
| from | <code>&quot;PUBLIC&quot;</code> \| <code>&quot;ALL&quot;</code> \| <code>Array.&lt;string&gt;</code> | A quien se le retira |
| options.withGrant | <code>boolean</code> | WITH GRANT OPTION |
| options.grantBy | <code>&quot;CURRENT\_USER&quot;</code> \| <code>&quot;CURRENT\_ROLE&quot;</code> | GRANTED BY |
| options.cascade | <code>boolean</code> | "CASCADE"/"RESTRICT" |
| options.restrict | <code>boolean</code> | "RESTRICT"/"CASCADE" |
| next | <code>object</code> |  |

**Example**  
```js
qb.revoke('SELECT', 'users', 'admin');// Resultado esperado: { success: true, revoked: 'SELECT', on: 'users', from: 'admin' }
```

.grantRoles(roles, users, next) ⇒ `QueryBuilder`
Como grant pero solo para roles

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DCL  

| Param | Type | Description |
| --- | --- | --- |
| roles | <code>string</code> \| <code>Array.&lt;string&gt;</code> | rol o roles para asignar |
| users | <code>string</code> \| <code>Array.&lt;string&gt;</code> | usuario o usuarios a los que se conceden |
| options.admin- | <code>boolean</code> | true (WITH ADMIN OPTION) |
| options.granted | <code>&quot;CURRENT\_USER&quot;</code> \| <code>&quot;CURRENT\_ROLE&quot;</code> | GRANTED BY |
| options.cascade | <code>boolean</code> | "CASCADE"/"RESTRICT" |
| options.restrict | <code>boolean</code> | "RESTRICT"/"CASCADE" |
| next | <code>object</code> |  |

**Example**  
```js
qb.grantRoles('editor', 'john_doe');// Resultado esperado: { success: true, granted: 'editor', to: 'john_doe' }
```

#### QueryBuilder.revokeRoles(roles, from, next) ⇒ `QueryBuilder`
Como revoke, pero para roles

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DCL  

| Param | Type | Description |
| --- | --- | --- |
| roles | <code>string</code> \| <code>Array.&lt;string&gt;</code> | roles a eliminar |
| from | <code>&quot;PUBLIC&quot;</code> \| <code>&quot;ALL&quot;</code> \| <code>Array.&lt;string&gt;</code> | A quien se le retira |
| options.grantBy | <code>&quot;CURRENT\_USER&quot;</code> \| <code>&quot;CURRENT\_ROLE&quot;</code> | GRANTED BY |
| options.cascade | <code>boolean</code> | "CASCADE"/"RESTRICT" |
| options.restrict | <code>boolean</code> | "RESTRICT"/"CASCADE" |
| next | <code>object</code> |  |

**Example**  
```js
qb.revokeRoles('editor', 'john_doe');// Resultado esperado: { success: true, revoked: 'editor', from: 'john_doe' }
```

.createDatabase(name, options, next) ⇒ `QueryBuilder`
Crea una base de datos dentro del servidor (SGBD)

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la base de datos |
| options | <code>Object</code> | Opciones para la creacion de datos |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createDatabase('mydb', { ifNotExists: true });	// Resultado esperado: { success: true, database: 'mydb' }
```

#### QueryBuilder.dropDatabase(name, options, next) ⇒ `QueryBuilder`
Elimina una base de datos del servidor (SGBD)

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre de la base de datos |
| options | <code>Object</code> | Opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.dropDatabase('mydb');	// Resultado esperado: { success: true, database: 'mydb' }
```

.createSchema(name, options, next) ⇒ `QueryBuilder`
Crea un "esquema" o "tabla" de nombres para organizar objetos de base de datos

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre del esquema |
| options | <code>Object</code> | Opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createSchema('myschema', { ifNotExists: true });
```

#### QueryBuilder.dropSchema(name, options, next) ⇒ `QueryBuilder`
Elimina un esquema de la base de datos

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre del esquema |
| options | <code>Object</code> | Opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

.createTable(name, options, next) ⇒ `QueryBuilder`
Crea una nueva tabla con el nombre y las opciones especificadas en la base de datos actual.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | El nombre de la tabla. |
| options | <code>Object</code> | Opciones de configuración para la tabla. |
| options.cols | <code>Object</code> | Objeto donde cada clave es el nombre de la columna. |
| options.cols[].column | <code>type</code> \| <code>column</code> | columna name:<string|column> |
| [options.temporary] | <code>GLOBAL</code> \| <code>LOCAL</code> | GLOBAL|LOCAL. |
| [options.onCommit] | <code>PRESERVE</code> \| <code>DELETE</code> | ON COMMIT PRESERVE|DELETE |
| next | <code>object</code> | Objeto recibido por el comando anterior |

#### QueryBuilder.alterTable(name, next) ⇒ `QueryBuilder`
Modifica una tabla existente

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la tabla |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.alterTable('mytable', { addColumn: 'new_column' });
```

.alterTableComands(name, options, next) ⇒ `QueryBuilder`
Define los comandos que modifican la estructura de las columnas de la tabla actual."addColumn" añade una columna"alterColumn" modifica una columna existente"dropColumn" elimina una columnay "addConstraint" añade una restricciónEstos comandos deben ser llamados después de un "alterTable" donde se especifica la tabla a modificar.cada uno recibe tres parametros:

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre de la columna |
| options | <code>Object</code> | opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.alterTable('mytable')  .addColumn('new_column', { type: 'VARCHAR(255)', notNull: true })  .alterColumn('existing_column', { type: 'INT' })  .dropColumn('old_column')  .addConstraint('pk_mytable', { type: 'PRIMARY KEY', columns: ['id'] });
```

#### QueryBuilder.dropTable(name, option, next) ⇒ `QueryBuilder`
Elimina una tabla de la base de datos actual

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre de la tabla |
| option | <code>object</code> | opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.dropTable('mytable', { ifExists: true });
```

.createType(name, option, next) ⇒ `QueryBuilder`
Crea un tipo definido por el usuario en la base de datos actual

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre del tipo |
| option | <code>object</code> | opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createType('mytype', { ... });
```

#### QueryBuilder.dropType(name, option, next) ⇒ `QueryBuilder`
Elimina un tipo definido por el usuario

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre del tipo |
| option | <code>object</code> | opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.dropType('mytype', { ifExists: true });
```

.createAssertion(name, assertion, next) ⇒ `QueryBuilder`
Permite crear una restricción a nivel de base de datos.Es una característica delSQL estándar (SQL-92 y SQL:2006) que permite definir restricciones a nivel de base de datos.Sirve para imponer condiciones que no pueden expresarse fácilmente con restricciones en columnas (CHECK) o en tablas (FOREIGN KEY).No está implementado en MySQL ni en PostgreSQL.- SQL estándar	✅- PostgreSQL		❌- MySQL				❌En su lugar, se pueden usar triggers (BEFORE INSERT/UPDATE/DELETE) o funciones con restricciones CHECK a nivel de tabla.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre |
| assertion | <code>object</code> | opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createAssertion('positive_balance', {  check: 'balance > 0'});
```

#### QueryBuilder.createDomain(name, options, next) ⇒ `QueryBuilder`
Permite definir tipos de datos personalizados con restricciones.Es útil para reutilizar reglas de validación en múltiples tablas sin repetir código.- SQL estándar	✅- PostgreSQL		✅- MySQL				❌

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del dominio |
| options | <code>Object</code> | Opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createDomain('mydomain', {  type: 'text',  constraints: {    notNull: true  }});
```

.createView(name, options, next) ⇒ `QueryBuilder`
Permite definir una consulta almacenada como un objeto de la base de datos.Se comporta como una 'tabla virtual', mostrando datos obtenidos de una o varias tablas sin duplicarlos.- PostgreSQL	✅	Soporta vistas materializadas con "REFRESH MATERIALIZED VIEW"- MySQL			✅	Soporta vistas pero no vistas materializadas- SQL Server	✅	Soporta vistas indexadas para mejorar rendimiento- SQLite			❌	No permite vistas materializadas ni indexadas- Oracle			✅	Soporta vistas normales y materializadas

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre de la vista |
| options | <code>object</code> | opciones aplicables {cols:Array<string>, as:Select, check:boolean} |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createView('myview', {  cols: ['id', 'name'],  as: qb.select().from('mytable'),  check: true});
```

#### QueryBuilder.dropView(name, next) ⇒ `QueryBuilder`
Elimina una vista creada previamente- PostgreSQL	✅- MySQL			✅

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la vista |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.dropView('myview');
```

.createRoles(names, next) ⇒ `QueryBuilder`
Crear un nuevo rol en la base de datos.Un rol es una entidad que puede representar a un usuario o un grupo de usuarios ypuede recibir permisos para acceder a ciertos recursos.- PostgreSQL	✅ Maneja roles en lugar de usuarios individuales- MySQL				✅ (Desde 8.0)	Se complementa con "GRANT" para asignar permisos- SQL Server	✅ Se usa "CREATE ROLE" pero los usuarios son "entidades separadas"- SQLite			❌ No soporta roles ni usuarios- Oracle			✅ Soporta roles con permisos avanzados- MongoDB			✅	Usando "createRole" y "db.createUser"

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>string</code> \| <code>Array.&lt;string&gt;</code> | nombre o nombres de roles a crear |
| options.admin | <code>&quot;CURRENT\_USER&quot;</code> \| <code>&quot;CURRENT\_ROLE&quot;</code> | WITH ADMIN |
| options.ifNotExists | <code>boolean</code> | IF NOT EXISTS |
| next | <code>object</code> |  |

**Example**  
```js
qb.createRoles(['admin', 'editor'], { ifNotExists: true });// Resultado esperado: { success: true, roles: ['admin', 'editor'] }
```

#### QueryBuilder.dropRoles(names, options, next) ⇒ `QueryBuilder`
Elimina el rol o roles especificados de la base de datos.- PostgreSQL	✅- MySQL				✅ (Desde 8.0)

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>string</code> \| <code>Array.&lt;string&gt;</code> | uno o varios roles a eliminar |
| options | <code>object</code> | opciones aplicables |
| options.ifExists | <code>boolean</code> | IF EXISTS |
| options.cascade | <code>boolean</code> | "CASCADE"/"RESTRICT" |
| options.restrict | <code>boolean</code> | "RESTRICT"/"CASCADE" |
| next | <code>object</code> |  |

.createCursor(name, expresion, options, next) ⇒ `QueryBuilder`
Crea un nuevo cursor para la consulta actual.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  
**Throws**:

- <code>Error</code> Cuando los parámetros no coinciden con los tipos esperados

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del cursor |
| expresion | <code>string</code> | Expresión SQL para el cursor |
| options | <code>object</code> | Opciones adicionales para el cursor |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createCursor('myCursor', 'SELECT * FROM users', {}, {});// Resultado: DECLARE myCursor CURSOR FOR SELECT * FROM users;
```

#### QueryBuilder.insert(table, values, cols, next) ⇒ `QueryBuilder`
Inserta datos en una tabla especificada.Crea una instrucción INSERT INTO con valores y especificación opcional de columnas.Se usa para agregar nuevas filas en una tabla.Puede insertar valores manualmente o desde el resultado de otra consulta.PostgreSQL	✅ Sí	Soporta INSERT ... RETURNING para obtener valores insertados.MySQL			✅ Sí	Permite INSERT IGNORE y ON DUPLICATE KEY UPDATE para manejar duplicados.SQL Server	✅ Sí	Compatible con INSERT INTO ... OUTPUT.Oracle			✅ Sí	Usa INSERT ... RETURNING INTO para recuperar valores insertados.SQLite			✅ Sí	Admite INSERT OR REPLACE y INSERT OR IGNORE.MongoDB	insertOne(), insertMany()	insertOne() agrega un solo documento, insertMany() varios a la vez.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DML  
**Throws**:

- <code>Error</code> Cuando los parámetros no coinciden con los tipos esperados

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | nombre de la tabla |
| values | <code>array.&lt;array.&lt;Value&gt;&gt;</code> | Array de Arrays con los valores |
| cols | <code>array.&lt;Column&gt;</code> | columnas correspondientes al orden de los valores o vacio para el orden por defecto |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Inserción simpleawait qb.insert('users', [  ['Alice', 'alice@example.com'],  ['Bob', 'bob@example.com']]);// Inserción con columnas especificadasawait qb.insert('users', [  ['Charlie', 'charlie@example.com']], ['name', 'email']);
```

.update(table, sets, next) ⇒ `Promise<QueryBuilder>`
Crea la sentencia UPDATE con cláusula SET para la tabla especificada

**Kind**: static method of `QueryBuilder`  
**Returns**: `Promise<QueryBuilder>` - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DML  
**Throws**:

- <code>Error</code> Cuando los parámetros no coinciden con los tipos esperados

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Nombre de la tabla objetivo para actualizar |
| sets | <code>Object</code> | Objeto con pares columna-valor para actualizar |
| next | <code>object</code> | Objeto que retorna promesa para el contexto de encadenamiento |

**Example**  
```js
// Actualización simpleqb.update('users', { status: 'active', last_login: new Date() })        .where('id = 1')			 .toString(); // UPDATE users SET status = 'active', last_login = '2023-10-05 12:34:56' WHERE id = 1;// Actualizar con condicionesqb.update('products', { price: 19.99, discount: 10 })        .where('category = "electronics"')        .toString(); // UPDATE products SET price = 19.99, discount = 10 WHERE category = 'electronics';
```

#### QueryBuilder.delete(from, next) ⇒ `QueryBuilder`
Crea la sentencia DELETE FROM para eliminar datos

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DML  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | Nombre de la tabla de la cual eliminar registros |
| next | <code>object</code> | Objeto que retorna promesa para el contexto de encadenamiento |

**Example**  
```js
// Eliminar registros específicosqb.delete('users')        .where('active = 0')        .toString(); // DELETE FROM users WHERE active = 0;// Eliminar con condiciones complejasqb.delete('logs')        .where('created_at < "2023-01-01"')        .toString(); // DELETE FROM logs WHERE created_at < '2023-01-01';
```

.select(columns, options, next) ⇒ `QueryBuilder`
Crea declaración SELECT para recuperación de datosGenera cláusula SQL SELECT con columnas y opciones especificadasSELECT [ DISTINCT | ALL ] { * | < selección de lista > }

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  

| Param | Type | Description |
| --- | --- | --- |
| columns | <code>string</code> \| <code>Column</code> \| <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Column&gt;</code> | Columnas seleccionadas |
| options | <code>object</code> | opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
SELECT columna1, columna2 FROM tabla;// Seleccionar todas las columnasqb.select('*').from('users');// Seleccionar columnas específicasqb.select(['name', 'email']).from('users');// Seleccionar con DISTINCTqb.select('category', { distinct: true }).from('products');
```

#### QueryBuilder.checkFrom(tables, alias)
Comprueba en tiempo de ejecucion que los tipos de "tables" corresponden con los de "alias"y que la longitud de los arrays sea la correcta.

**Kind**: static method of `QueryBuilder`  
**Category**: DQL  
**Throws**:

- <code>Error</code> Si los tipos o longitudes no coinciden

| Param | Type | Description |
| --- | --- | --- |
| tables | <code>string</code> \| <code>Array.&lt;string&gt;</code> | tabla o lista de tablas |
| alias | <code>string</code> \| <code>Array.&lt;string&gt;</code> | alias o lista de alias |

**Example**  
```js
checkFrom("tabla", "t");checkFrom(["tabla1", "tabla2"], ["t1", "t2"]);checkFrom("tabla", ["t1", "t2"]); // ErrorcheckFrom(["tabla1", "tabla2"], "t1"); // ErrorcheckFrom(["tabla1", "tabla2"], ["t1"]); // ErrorcheckFrom("tabla", "t1", "t2"); // ErrorcheckFrom(["tabla1", "tabla2"], ["t1", "t2", "t3"]); // Válido
```

.from(tables, alias, next) ⇒ `QueryBuilder`
Especifica la tabla o vista de donde se van a obtener los datos.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  

| Param | Type | Description |
| --- | --- | --- |
| tables | <code>string</code> \| <code>Array.&lt;string&gt;</code> | tabla o tablas de donde obtener los datos |
| alias | <code>string</code> \| <code>Array.&lt;string&gt;</code> | alias o lista de alias correspondiente a las tablas |
| next | <code>object</code> |  |

**Example**  
```js
// Ejemplos válidosqb.from("users", "u");qb.from(["users", "orders"], ["u", "o"]);qb.from("users");qb.from(["users", "orders"]);// Erroresqb.from("users", ["u", "o"]); // Errorqb.from(["users", "orders"], "u"); // Errorqb.from(["users", "orders"], ["u"]); // Errorqb.from("users", "u", "o"); // Errorqb.from(["users", "orders"], ["u", "o", "x"]); // Válido
```

#### QueryBuilder.where(predicados, next) ⇒ `QueryBuilder`
Define la condición WHERE para filtrar registros en una consulta SQL.Soporta cadenas SQL, instancias de QueryBuilder o arrays de condiciones.Filtrar registros en una consulta, seleccionando solo aquellos que cumplen con una condición específica.Es una parte esencial en las sentencias SELECT, UPDATE, DELETE, etc., ya que permite limitar los resultadoso modificar solo las filas que cumplen con ciertos criterios.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  

| Param | Type | Description |
| --- | --- | --- |
| predicados | <code>string</code> \| `QueryBuilder` \| <code>Array.&lt;(string\|QueryBuilder)&gt;</code> | Condiciones del WHERE (cadena, expresión QB o array) |
| next | <code>object</code> | Instancia de QueryBuilder para el contexto de encadenamiento de métodos |

**Example**  
```js
qb.select('*').from('users').where('age > 18');qb.select('*').from('users').where(qb.and(qb.eq('active', 1), qb.gt('age', 18)));qb.update('users', { status: 'inactive' }).where('last_login < "2023-01-01"');
```

.groupBy(columns, options, next) ⇒ `QueryBuilder`
El comando GROUP BY en SQL se utiliza para agrupar filas que tienen el mismo valor en una o más columnas,permitiendo realizar cálculos agregados (COUNT, SUM, AVG, MAX, MIN, etc.) sobre cada grupo.PostgreSQL	✅ Sí	Soporta GROUP BY con múltiples columnas y funciones agregadas.MySQL			✅ Sí	Compatible con GROUP BY, pero en versiones antiguas permitía resultados ambiguos sin ONLY_FULL_GROUP_BY.SQL Server	✅ Sí	Funciona con agregaciones y permite GROUPING SETS.Oracle			✅ Sí	Compatible y soporta extensiones como ROLLUP y CUBE.SQLite			✅ Sí	Soporta GROUP BY, pero con ciertas limitaciones en comparación con otras bases de datos.MongoDB	$group	En el pipeline de agregación, $group permite agrupar documentos y aplicar operaciones agregadas.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando no hay un comando SELECT previo

| Param | Type | Description |
| --- | --- | --- |
| columns | <code>string</code> \| <code>Array.&lt;string&gt;</code> \| <code>Object</code> | Una columna o varias |
| columns.rollup | <code>Array.&lt;Column&gt;</code> | ROLLUP ( ...column ) |
| columns.cube | <code>Array.&lt;Column&gt;</code> | CUBE (...column ) |
| options | <code>\*</code> | opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.select('columna1, columna2, COUNT(*) as total')  .from('tabla') .groupBy(['columna1', 'columna2']);// Resultado: SELECT columna1, columna2, COUNT(*) as total FROM tabla GROUP BY columna1, columna2;// Usando ROLLUPqb.select('columna1, columna2, SUM(columna3) as total')  .from('tabla')  .groupBy({ rollup: [qb.col('columna1'), qb.col('columna2')] });// Resultado: SELECT columna1, columna2, SUM(columna3) as total FROM tabla GROUP BY ROLLUP (columna1, columna2);// Usando CUBEqb.select('columna1, columna2, AVG(columna3) as promedio')  .from('tabla')  .groupBy({ cube: [qb.col('columna1'), qb.col('columna2')] });// Resultado: SELECT columna1, columna2, AVG(columna3) as promedio FROM tabla GROUP BY CUBE (columna1, columna2);
```

#### QueryBuilder.having(predicado, options, next) ⇒ `QueryBuilder`
El comando HAVING en SQL se usa para filtrar los resultados después de aplicar GROUP BY,permitiendo restringir los grupos basados en condiciones sobre funciones agregadas(COUNT, SUM, AVG, MAX, MIN, etc.).PostgreSQL	✅ Sí	Funciona con GROUP BY para filtrar resultados agrupados.MySQL			✅ Sí	Compatible con todas las versiones, usado para restricciones en funciones agregadas.SQL Server	✅ Sí	Soporta HAVING con agregaciones y expresiones condicionales.Oracle			✅ Sí	Funciona de la misma manera que en SQL estándar.SQLite			✅ Sí	Compatible con HAVING, pero con algunas limitaciones en expresiones más avanzadas.MongoDB	$group seguido de $match.	Primero se agrupan los documentos con $group, luego se filtran los resultados con $match.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando no hay un comando SELECT previo

| Param | Type | Description |
| --- | --- | --- |
| predicado | <code>strict</code> \| `QueryBuilder` | expresion que utiliza el having |
| options | <code>object</code> | opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Cláusula HAVING simplelet qb = new QueryBuilder()qb.having(qb.and(qb.gt(qb.sum("Columna3"),100)),qb.gt(qb.count("*"),2))HAVING SUM(columna3) > 100 AND COUNT(*) > 2;
```

.orderBy(columns, next) ⇒ `QueryBuilder`
El comando ORDER BY en SQL se utiliza para ordenar los resultados de una consulta según una o más columnas,en orden ascendente (ASC) o descendente (DESC).PostgreSQL	✅ Sí	Soporta ORDER BY con múltiples columnas y direcciones de ordenamiento.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando no hay un comando SELECT previo

| Param | Type | Description |
| --- | --- | --- |
| columns | <code>Column</code> \| <code>Array.&lt;string&gt;</code> \| <code>object</code> | columna, lista de columnas o un objeto sobre la que ordenar |
| columns.col | <code>string</code> | columna sobre la que ordenar |
| columns.order | <code>&quot;ASC&quot;</code> \| <code>&quot;DESC&quot;</code> | tipo de orden |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Ordenamiento simpleqb.select('*').from('users').orderBy([{col: 'name', order: 'ASC'}]);// Ordenamiento de múltiples columnasqb.select('*').from('users').orderBy([  {col: 'department', order: 'ASC'},   {col: 'salary', order: 'DESC'}]);
```

#### QueryBuilder.orderBy(columns, next) ⇒ `QueryBuilder`
El comando ORDER BY en SQL se utiliza para ordenar los resultados de una consulta según una o más columnas,en orden ascendente (ASC) o descendente (DESC).PostgreSQL	✅ Sí	Soporta ORDER BY con múltiples columnas y direcciones de ordenamiento.	

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando se llama sin una sentencia SELECT previa

| Param | Type | Description |
| --- | --- | --- |
| columns | <code>Array.&lt;Object&gt;</code> \| <code>string</code> | Column specification(s) for ordering |
| columns.col | <code>string</code> | Nombre de la columna por la cual ordenar |
| columns.order | <code>&quot;ASC&quot;</code> \| <code>&quot;DESC&quot;</code> | Orden de clasificación (ascendente o descendente) |
| next | <code>object</code> | Objeto que retorna promesa para el contexto de encadenamiento |

**Example**  
```js
// Ordenamiento simpleqb.select('*').from('users').orderBy([{col: 'name', order: 'ASC'}]);// Ordenamiento de múltiples columnasqb.select('*').from('users').orderBy([  {col: 'department', order: 'ASC'},   {col: 'salary', order: 'DESC'}]);
```

.limit(limit, next) ⇒ `QueryBuilder`
Se usa para restringir la cantidad de filas devueltas por una consulta.Es útil para paginación y optimización de rendimiento cuando solo se necesitan un número específico de registros.PostgreSQL	✅ Sí	LIMIT y OFFSET funcionan para paginación.MySQL			✅ Sí	Soporta LIMIT con OFFSET para paginación.SQL Server	❌ No	Se usa TOP n o OFFSET FETCH NEXT en su lugar.Oracle			❌ No	Usa FETCH FIRST n ROWS ONLY para limitar resultados.SQLite			✅ Sí	Compatible con LIMIT y OFFSET.MongoDB	limit(n)	Se usa junto con skip(n) para paginación, similar a LIMIT ... OFFSET.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando limit no es un entero positivo o no existe una instrucción SELECT

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | numero de elementos a mostrar |
| next | <code>object</code> | objeto para el contexto de encadenamiento |

**Example**  
```js
// Obtener los primeros 10 usuariosqb.select('*').from('users').limit(10);// Resultado: SELECT * FROM users LIMIT 10;
```

#### QueryBuilder.substr(column, inicio, [longitud], next) ⇒ `QueryBuilder`
Crea una función SQL SUBSTR para extraer una subcadena de una cadena dada.Permite especificar la columna, posición inicial y longitud opcional de la subcadena.Útil para manipulación de cadenas en consultas SQL.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Functions  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>Column</code> | columna sobre la que se aplica la función |
| inicio | <code>number</code> | posición inicial de la subcadena |
| [longitud] | <code>number</code> | longitud de la subcadena (opcional) |
| next | <code>object</code> | objeto recibido por el comando anterior |

**Example**  
```js
qb.substr('nombre', 1, 3) // SUBSTR(nombre, 1, 3)
```

.driver(driverClass, params) ⇒ [<code>next</code>](#next)
Instancia y configura el Driver para la base de datos que ejecutara los comandos

**Kind**: static method of `QueryBuilder`  
**Returns**: [<code>next</code>](#next) - next - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| driverClass | <code>Driver</code> | Clase del controlador de base de datos (MySqlDriver, PostgreSQLDriver, etc.) |
| params | [<code>DatabaseConfig</code>](#DatabaseConfig) | Parámetros de conexión y configuración del controlador |

**Example**  
```js
import MySQL from '@querybuilder/mysql';import config from './config.js';const mysql= config.MYSQL; // importa configuración de la base de datosconst qb = new QueryBuilder(MySQL); // creación de instancia QueryBuilderqb.driver(mysql.driver, mysql.params); // configuración del driver//Prueba de la conexiónqb.driver(mysql.driver, mysql.params)  .testConnection()	.then((res) => console.log('Conexión exitosa:', res))
```

#### QueryBuilder.use(database, next) ⇒ `QueryBuilder`
Gestiona el cambio de base de datos dentro del mismo servidor (SGBD)

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| database | <code>string</code> | Nombre de la base de datos |
| next | [<code>next</code>](#next) | Objeto recibido por el comando anterior |

.on(condition, next) ⇒ `QueryBuilder`
Especifica la condición de unión para un JOIN.Se utiliza para definir cómo se combinan las filas de dos tablas en una operación JOIN.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  
**Throws**:

- <code>Error</code> Si el comando previo no es un JOIN válido

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>string</code> | Condición de unión |
| next | <code>object</code> |  |

**Example**  
```js
qb.select('*').from('tabla1').join('tabla2').on('tabla1.id = tabla2.id');qb.select('*').from('tabla1').innerJoin('tabla2').on('tabla1.id = tabla2.id');// Erroresqb.select('*').from('tabla1').where('condicion').on('tabla1.id = tabla2.id'); // Error
```

#### QueryBuilder.union(selects) ⇒ `QueryBuilder`
SQL Server	

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| `QueryBuilder` | Selects a unir |

.unionAll(selects) ⇒ `QueryBuilder`
Combinar los resultados de dos o más consultas SELECT.Incluyendo duplicados.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| `QueryBuilder` | Selects a unir por UNION ALL |

**Example**  
```js
qb.unionAll(select1, select2);
```

#### QueryBuilder.except(selects) ⇒ `QueryBuilder`
El comando EXCEPT se utiliza para obtener los registros que están en la primera consulta, pero no en la segunda.Este comando elimina los duplicados por defecto, retornando solo los registros únicos que existenen la primera consulta y no en la segunda.PostgreSQL	✅ Soporta EXCEPT para obtener registros de la primera consulta que no estén en la segunda.MySQL			❌ No soporta EXCEPT, pero se puede emular utilizando LEFT JOIN o NOT EXISTS.SQL Server	✅ Soporta EXCEPT para obtener diferencias entre dos conjuntos de resultados.Oracle			✅ Soporta EXCEPT para encontrar registros que están en la primera consulta pero no en la segunda.SQLite			❌ No tiene soporte nativo para EXCEPT, pero se puede simular con LEFT JOIN o NOT EXISTS.MongoDB	$lookup con $match y $project	Se puede emular EXCEPT mediante un lookup para combinar colecciones y luego excluir los registros coincidentes.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| `QueryBuilder` | Selects |

**Example**  
```js
qb.except(select1, select2);
```

.exceptAll(selects) ⇒ `QueryBuilder`
El comando EXCEPT ALL es una variante de EXCEPT que, a diferencia de EXCEPT,mantiene los duplicados en el resultado.Es decir, devuelve todas las filas que están en la primera consulta, pero no en la segunda, y mantiene las repeticiones de esas filas.PostgreSQL	✅ Soporta EXCEPT ALL para obtener las filas que están en la primera consulta, pero no en la segunda, manteniendo duplicados.MySQL			❌ No soporta EXCEPT ALL, pero puede emularse utilizando LEFT JOIN o NOT EXISTS.SQL Server	❌ No soporta EXCEPT ALL, aunque se puede simular con GROUP BY y HAVING.Oracle			❌ No tiene soporte nativo para EXCEPT ALL.SQLite			❌ No soporta EXCEPT ALL, pero puede emularse con LEFT JOIN o NOT EXISTS.MongoDB	$lookup con $group y $match	Se pueden combinar colecciones y luego filtrar los resultados para mantener duplicados.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type |
| --- | --- |
| selects | <code>string</code> \| `QueryBuilder` | 

**Example**  
```js
qb.exceptAll(select1, select2);
```

#### QueryBuilder.on(predicado, next) ⇒ `QueryBuilder`
Operaciones de JOIN para especificar las condiciones de cómo se deben combinar las tablas.Define las columnas o condiciones que se deben cumplir para que filas de diferentes tablas sean combinadas.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| predicado | <code>string</code> \| `QueryBuilder` |  |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
SELECT columna1, columna2FROM tabla1JOIN tabla2ON tabla1.columna = tabla2.columna;
```

.col(name, [table]) ⇒ <code>Column</code>
Crea una instancia de Column para referenciar columnas en consultas SQL.Permite especificar el nombre de la columna y opcionalmente el nombre o alias de la tabla.Facilita la construcción de consultas SQL tipadas y con contexto de tabla.

**Kind**: static method of `QueryBuilder`  
**Returns**: <code>Column</code> - Instancia de Column para su uso en consultas  
**Category**: General  
**Throws**:

- <code>Error</code> Cuando los parámetros no coinciden con los tipos esperados

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> \| `QueryBuilder` \| <code>Expresion</code> | Puede ser el nombre de la columna, una subconsulta o una expresion |
| [table] | <code>string</code> | Nombre de la tabla o alias para la columna |

**Example**  
```js
// Referencia simple de columnaconst userCol = qb.col('name', 'users'); // users.name// Use in queriesqb.select([qb.col('name', 'u'), qb.col('email', 'u')]) // SELECT u.name, u.email  .from('users', 'u')  .where(qb.eq(qb.col('active', 'u'), 1)); // WHERE u.active = 1// Subconsulta como columnaconst subQb = new QueryBuilder().select('COUNT(*)').from('orders').where(qb.eq(qb.col('user_id'), qb.col('id', 'u')));const orderCountCol = qb.col(subQb, 'u'); // (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
```

#### QueryBuilder.exp(expresion) ⇒ <code>Expresion</code>
Crea una instancia de expresion para usar en consultas SQL.Permite incluir expresiones SQL complejas o funciones agregadas en consultas.Facilita la construcción de consultas SQL dinámicas y avanzadas.usando el metodo as() de la clase Expresion se puede asignar un alias a la expresion

**Kind**: static method of `QueryBuilder`  
**Returns**: <code>Expresion</code> - expresion.value = expresion  
**Category**: General  

| Param | Type |
| --- | --- |
| expresion | <code>any</code> | 

**Example**  
```js
´´javascriptlet qb = new QueryBuilder()qb.exp("count(*)") // count(*)qb.exp("count(*)").as("Total") // count(*) AS Totalqb.exp("sum(*)").as("Total") // sum(*) AS Totalqb.exp("avg(*)").as("Total") // avg(*) AS Total
```

.offset(offset, next) ⇒ `QueryBuilder`
Se usa para omitir un número específico de filas antes de comenzar a devolver resultados.Se suele combinar con LIMIT para implementar paginación.PostgreSQL	✅ Sí	OFFSET y LIMIT permiten paginación eficiente.MySQL			✅ Sí	Se usa LIMIT ... OFFSET.SQL Server	✅ Sí	Usa OFFSET ... FETCH NEXT para paginación.Oracle			✅ Sí	Usa OFFSET ... FETCH NEXT en lugar de LIMIT.SQLite			✅ Sí	Compatible con LIMIT y OFFSET.MongoDB	skip(n)	Se usa junto con limit(n) para paginación, similar a OFFSET ... LIMIT.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  
**Throws**:

- <code>Error</code> Cuando offset no es un entero positivo o no existe una instrucción SELECT

| Param | Type | Description |
| --- | --- | --- |
| offset | <code>number</code> | numero de filas que se deben omitir |
| next | <code>object</code> | objeto para el contexto de encadenamiento |

**Example**  
```js
// Obtener los usuarios a partir del usuario 21qb.select('*').from('users').offset(20);// Resultado: SELECT * FROM users OFFSET 20;
```

#### QueryBuilder.case(column, casos, defecto, next) ⇒ `QueryBuilder`
Crea una expresión SQL CASE para evaluaciones condicionales.Permite definir múltiples condiciones y resultados, con un caso por defecto opcional.Útil para lógica condicional directamente en consultas SQL.Sintaxis:columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> | columna |
| casos | <code>Array.&lt;column, string&gt;</code> | [condicion, resultado] |
| defecto | <code>string</code> | Caso else |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Expresión CASE simpleqb.case('status', [  [1, 'Active'],  [0, 'Inactive']], 'Unknown'); // CASE status WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' ELSE 'Unknown' END// Using Column objectsqb.case(column('status'), [  [1, 'Active'],  [0, 'Inactive']], 'Unknown'); // CASE status WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' ELSE 'Unknown' END// Complex conditionsqb.case(null, [  [qb.eq('age', 18), 'Adult'],  [qb.lt('age', 18), 'Minor']], 'Unknown'); // CASE WHEN age = 18 THEN 'Adult' WHEN age < 18 THEN 'Minor' ELSE 'Unknown' END
```

.functionDate() ⇒ `QueryBuilder`
Crea métodos para funciones comunes de fecha y hora en SQL.Genera funciones como CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP, LOCALTIME, LOCALTIMESTAMP.Útil para obtener marcas de tiempo y fechas actuales en consultas SQL.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  
**Example**  
```js
qb.currentDate(); // CURRENT_DATEqb.currentTime(); // CURRENT_TIMEqb.currentTimestamp(); // CURRENT_TIMESTAMPqb.localTime(); // LOCALTIMEqb.localTimestamp(); // LOCALTIMESTAMP
```

#### QueryBuilder.execute([testOnly]) ⇒ `Promise<QueryBuilder>`
Ejecuta la consulta construida contra el controlador de base de datos configuradoEnvía la consulta a la base de datos y retorna resultados o erroresSi testOnly es true, retorna la cadena de consulta sin ejecutar

**Kind**: static method of `QueryBuilder`  
**Returns**: `Promise<QueryBuilder>` - Instancia de QueryBuilder con resultados o errores  
**Category**: General  
**Throws**:

- <code>Error</code> Cuando no hay controlador de base de datos configurado

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [testOnly] | <code>boolean</code> | <code>false</code> | Si es true, retorna la cadena de consulta sin ejecutar |

**Example**  
```js
// Ejecutar consulta y obtener resultadosconst result = await qb.select('*').from('users').where('active = 1').execute();
```

.using(columnsInCommon, next) ⇒ `QueryBuilder`
El comando USING se utiliza en SQL para especificar las columnas que se van a utilizar para combinar dos tablas en una operación JOIN.A diferencia de la cláusula ON, que requiere una condición explícita, USING simplifica la sintaxis al asumir que las columnas mencionadas tienen el mismo nombre en ambas tablas.Se usa principalmente en consultas SQL para especificar columnas en operaciones de JOIN.Es especialmente útil cuando las columnas que se van a combinar tienen el mismo nombre en ambas tablas.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - Instancia de QueryBuilder para el encadenamiento de métodos  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Si el comando previo no es un JOIN válido

| Param | Type | Description |
| --- | --- | --- |
| columnsInCommon | <code>string</code> | Columna en comun |
| next | <code>object</code> |  |

**Example**  
```js
qb.select('*').from('tabla1').join('tabla2').using('columna_comun');qb.select('*').from('tabla1').innerJoin('tabla2').using('columna_comun');// Erroresqb.select('*').from('tabla1').where('condicion').using('columna_comun'); // Error
```

#### QueryBuilder.intersect(selects) ⇒ `QueryBuilder`
El comando INTERSECT se utiliza en SQL para obtener los registros comunes entre dos consultas SELECT.Retorna solo las filas que existen en ambas consultas, eliminando duplicados.PostgreSQL	✅ 	Soporta INTERSECT para obtener los registros comunes entre dos consultas.MySQL			❌ 	No soporta INTERSECT, pero puede emularse con JOIN o IN.SQL Server	❌ 	No soporta INTERSECT ALL, pero se puede simular con GROUP BY y HAVING.Oracle			✅ 	Soporta INTERSECT en consultas SQL.SQLite			❌ 	No tiene soporte nativo para INTERSECT, pero puede simularse con JOIN.MongoDB	$lookup con $match	Se puede utilizar una combinación de lookup para unir colecciones y luego filtrar los resultados comunes con $match.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| `QueryBuilder` | Selects |

**Example**  
```js
qb.intersect(select1, select2);
```

.intersectAll(selects) ⇒ `QueryBuilder`
El comando INTERSECT ALL es similar a INTERSECT, pero mantiene los duplicados en el resultado.A diferencia de INTERSECT, que elimina los duplicados,INTERSECT ALL retiene las filas comunes que aparecen en ambas consultas, incluyendo todas las repeticiones de esas filas.PostgreSQL	✅ 	Soporta INTERSECT para obtener los registros comunes entre dos consultas.MySQL			❌ 	No soporta INTERSECT, pero puede emularse con JOIN o IN.SQL Server	✅ 	Soporta INTERSECT para encontrar intersecciones entre dos conjuntos de resultados.Oracle			✅ 	Soporta INTERSECT en consultas SQL.SQLite			❌ 	No tiene soporte nativo para INTERSECT, pero puede simularse con JOIN.MongoDB	$lookup con $group	Se pueden combinar colecciones y luego agrupar los resultados para mantener duplicados.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| `QueryBuilder` | Selects |

**Example**  
```js
qb.intersectAll(select1, select2);
```

#### QueryBuilder.in(columna, values, next) ⇒ `QueryBuilder`
El operador IN en SQL se utiliza para comprobar si un valor está presente dentro de un conjunto de valores.Es útil cuando se necesita realizar comparaciones múltiples sin tener que escribir múltiples condiciones OR.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| columna | <code>string</code> \| <code>column</code> | nombre de la columna cuyo valor esta contenido el los valores, puede un string o un objeto Column |
| values | <code>Array.&lt;(string\|QueryBuilder)&gt;</code> \| <code>values</code> | Puede ser un array o una lista de strings u objetos QueryBuilder |
| next | <code>object</code> | Objeto recibido por el comando anterior siempre es el ultimo parametro añadido por el Proxy |

**Example**  
```js
qb.where(in("columna1",valor1, valor2, valor3)) // WHERE columna1 IN (valor1, valor2, valor3);
```

.notIn(columna, values, next) ⇒ `QueryBuilder`
El operador NOT IN en SQL se utiliza para filtrar registros cuyo valor NO está presente en un conjunto de valores especificados.Permite excluir múltiples valores en una sola condición, siendo la negación del operador IN.Filtrar registros cuyo valor NO está en una lista de valores o en el resultado de una subconsulta.Es la negación de IN y permite excluir múltiples valores en una sola condición.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| columna | <code>string</code> \| <code>column</code> | nombre de la columna cuyo valor no esta contenido el los valores, puede un string o un objeto Column |
| values | <code>Array.&lt;(string\|QueryBuilder)&gt;</code> \| <code>values</code> |  |
| next | <code>object</code> | Objeto recibido por el comando anterior siempre es el ultimo parametro añadido por el Proxy |

**Example**  
```js
qb.where(notIn("columna1",valor1, valor2, valor3)) // WHERE columna1 NOT IN (valor1, valor2, valor3);
```

#### QueryBuilder.coltn(table, name) ⇒ <code>Column</code>
Crea una instancia de Column con el nombre de la tabla primero y luego el nombre de la columna.Es igual a col cambiando el orden de los parametros

**Kind**: static method of `QueryBuilder`  
**Returns**: <code>Column</code> - Instancia de Column para su uso en consultas  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Cuando los parámetros no coinciden con los tipos esperados

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | nombre de la tabla |
| name | <code>string</code> | nombre de la columna |

**Example**  
```js
// Referencia simple de columnaconst userCol = qb.coltn('users', 'name'); // users.name// Usar en consultasqb.select([qb.coltn('u', 'name'), qb.coltn('u', 'email')]) // SELECT u.name, u.email  .from('users', 'u')  .where(qb.eq(qb.coltn('u', 'active'), 1)); // WHERE u.active = 1// Subconsulta como columnaconst subQb = new QueryBuilder().select('COUNT(*)').from('orders').where(qb.eq(qb.coltn('', 'user_id'), qb.coltn('u', 'id')));const orderCountCol = qb.coltn('u', subQb); // (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
```

.openCursor(name, next) ⇒ `QueryBuilder`
Abre un cursor existente.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Cuando el cursor no existe o no se puede abrir

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del cursor |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.openCursor('myCursor', {});
```

#### QueryBuilder.closeCursor(name, next) ⇒ `QueryBuilder`
Cierra un cursor existente.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Cuando el cursor no existe o no se puede cerrar

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del cursor |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.closeCursor('myCursor', {});
```

.setConstraints(restrictions, type, next) ⇒ `QueryBuilder`
Establece restricciones o reglas en la base de datos.Permite definir restricciones como UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, etc.

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Cuando los parámetros no coinciden con los tipos esperados

| Param | Type | Description |
| --- | --- | --- |
| restrictions | <code>Array.&lt;Object&gt;</code> | Array de objetos que definen las restricciones |
| type | <code>string</code> | Tipo de restricción (e.g., 'UNIQUE', 'PRIMARY KEY', etc.) |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Add a UNIQUE constraintqb.setConstraints([{ column: 'email' }], 'UNIQUE', {});
```

#### QueryBuilder.toString([options]) ⇒ <code>Promise.&lt;string&gt;</code>
Genera la cadena de consulta SQL completa desde la consulta construidaÚtil para depuración, registro, copia, etc. del comando SQL final

**Kind**: static method of `QueryBuilder`  
**Returns**: <code>Promise.&lt;string&gt;</code> - La cadena de consulta SQL completa  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Opciones de formato para la salida |

**Example**  
```js
// Construir y obtener cadena de consultaconst sql = await qb.select('*').from('users').where('active = 1').toString();console.log(sql); // "SELECT * FROM users WHERE active = 1"// Consulta compleja con joinsconst complexSql = await qb  .select(['u.name', 'p.title'])  .from('users', 'u')  .join('posts', 'p', 'u.id = p.user_id')  .where('u.active = 1')  .toString();
```

.setTransaction(options) ⇒ <code>Transaction</code>
Crea una nueva transacción para agrupar múltiples operaciones SQL.Permite iniciar, confirmar o revertir transacciones.

**Kind**: static method of `QueryBuilder`  
**Returns**: <code>Transaction</code> - - Objeto Transaction para manejar la transacción  
**Category**: Transactions  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Opciones para la transacción |

**Example**  
```js
const transaction = qb.setTransaction({ isolationLevel: 'SERIALIZABLE' });
```

#### QueryBuilder.thread(id) ⇒ `QueryBuilder`
Gestiona la ejecución de hilos para operaciones de consulta concurrentesCambia entre diferentes hilos de ejecución de consultas por IDPermite crear distintos hilos usando una instancia de QueryBuilderEvita tener que crear instancias múltiples

**Kind**: static method of `QueryBuilder`  
**Returns**: `QueryBuilder` - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Utilities  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | Identificador del hilo al cual cambiar o crear |

**Example**  
```js
// Crear o cambiar al hilo 'main'qb.thread('main').select('*').from('users');// Cambiar a un hilo diferenteqb.thread('secondary').select('count(*)').from('orders');
```

##### Core
**Tipo**: Clase global  
**Version**: 2.0.0  

* [Core](#Core)
    * [new Core()](#new_Core_new)
    * _instance_
        * [.tableConstraints(restricciones)](#Core+tableConstraints) ⇒ <code>string</code>
        * [.multiTabla(selects, next)](#Core+multiTabla) ⇒ <code>string</code>
    * _static_
        * [.Core](#Core.Core)
            * [new Core()](#new_Core.Core_new)
        * [.getAccount(userOrRole, [host])](#Core.getAccount) ⇒ <code>string</code>
        * [.getSubselect(next, [all])](#Core.getSubselect) ⇒ <code>Array</code>
        * [.use(database)](#Core.use) ⇒ <code>string</code>
        * [.createDatabase(name, [options])](#Core.createDatabase) ⇒ <code>string</code>
        * [.dropDatabase(name, [options])](#Core.dropDatabase) ⇒ <code>string</code>
        * [.createSchema(name, options)](#Core.createSchema) ⇒ <code>string</code>
        * [.dropSchema(name, options)](#Core.dropSchema) ⇒ <code>string</code>
        * [.createTable(name, [options])](#Core.createTable) ⇒ <code>string</code>
        * [.column(name, options)](#Core.column) ⇒ <code>string</code>
        * [.alterTable(name)](#Core.alterTable) ⇒ <code>string</code>
        * [.addColumn(name, options)](#Core.addColumn) ⇒ <code>string</code>
        * [.alterColumn(name)](#Core.alterColumn) ⇒ <code>string</code>
        * [.dropColumn(name, option)](#Core.dropColumn) ⇒ <code>string</code>
        * [.setDefault(value)](#Core.setDefault) ⇒ <code>string</code>
        * [.dropDefault()](#Core.dropDefault) ⇒ <code>string</code>
        * [.addConstraint(name, option, next)](#Core.addConstraint) ⇒ <code>string</code>
        * [.dropConstraint(name, table)](#Core.dropConstraint) ⇒ <code>string</code>
        * [.dropTable(name, option)](#Core.dropTable) ⇒ <code>string</code>
        * [.createType(name, options)](#Core.createType) ⇒ <code>string</code>
        * [.dropType(name, options)](#Core.dropType) ⇒ <code>string</code>
        * [.createAssertion(name, assertion)](#Core.createAssertion) ⇒ <code>string</code>
        * [.dropAssertion(name)](#Core.dropAssertion) ⇒ <code>string</code>
        * [.createDomain(name, options)](#Core.createDomain) ⇒ <code>string</code>
        * [.dropDomain(name, options)](#Core.dropDomain) ⇒ <code>string</code>
        * [.createView(name, options)](#Core.createView) ⇒ <code>string</code>
        * [.dropView(name, options)](#Core.dropView) ⇒ <code>string</code>
        * [.createRoles(names, options)](#Core.createRoles) ⇒ <code>string</code>
        * [.dropRoles(names, options)](#Core.dropRoles) ⇒ <code>string</code>
        * [.grant(commands, on, to, options)](#Core.grant) ⇒ <code>string</code>
        * [.revoke(commands, on, from, options)](#Core.revoke) ⇒ <code>string</code>
        * [.grantRoles(roles, users, options)](#Core.grantRoles) ⇒ <code>string</code>
        * [.from(tables, [alias])](#Core.from) ⇒ <code>string</code>
        * [.where(predicados, next)](#Core.where) ⇒ <code>string</code>
        * [.insert(table, cols, values, next)](#Core.insert) ⇒ <code>string</code>
        * [.update(table, sets, next)](#Core.update) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.delete(from)](#Core.delete) ⇒ <code>string</code>
        * [.avg(column, [alias], column, [alias])](#Core.avg) ⇒ <code>string</code> \| <code>string</code>
        * [.max(column, [alias])](#Core.max) ⇒ <code>string</code>
        * [.min(column, [alias])](#Core.min) ⇒ <code>string</code>
        * [.sum(column, [alias])](#Core.sum) ⇒ <code>string</code>
        * [.upper(column, [alias])](#Core.upper) ⇒ <code>string</code>
        * [.lower(column, [alias])](#Core.lower) ⇒ <code>string</code>
        * [.substr(column, inicio, ...options)](#Core.substr) ⇒ <code>string</code>
        * [.currentDate()](#Core.currentDate) ⇒ <code>string</code>
        * [.currentTime()](#Core.currentTime) ⇒ <code>string</code>
        * [.currentTimestamp()](#Core.currentTimestamp) ⇒ <code>string</code>
        * [.localTime()](#Core.localTime) ⇒ <code>string</code>
        * [.localTimestamp()](#Core.localTimestamp) ⇒ <code>string</code>
        * [.case([column], casos, defecto)](#Core.case) ⇒ <code>Expresion</code>
        * [.createCursor(name, expresion, options)](#Core.createCursor) ⇒ <code>string</code>
        * [.openCursor(name)](#Core.openCursor) ⇒ <code>string</code>
        * [.closeCursor(name)](#Core.closeCursor) ⇒ <code>string</code>
        * [.fetch(cursorName, hostVars)](#Core.fetch) ⇒ <code>string</code>
        * [.fetchNext(cursorName, hostVars)](#Core.fetchNext) ⇒ <code>string</code>
        * [.fetchPrior(cursorName, hostVars)](#Core.fetchPrior) ⇒ <code>string</code>
        * [.fetchFirst(cursorName, hostVars)](#Core.fetchFirst) ⇒ <code>string</code>
        * [.fetchLast(cursorName, hostVars)](#Core.fetchLast) ⇒ <code>string</code>
        * [.fetchAbsolute(cursorName, filas, hostVars)](#Core.fetchAbsolute) ⇒ <code>string</code>
        * [.fetchRelative(cursorName, filas, hostVars)](#Core.fetchRelative) ⇒ <code>string</code>
        * [.setTransaction(config)](#Core.setTransaction) ⇒ <code>string</code>
        * [.startTransaction(config)](#Core.startTransaction) ⇒ <code>string</code>
        * [.setConstraints(restrictions, [type])](#Core.setConstraints) ⇒ <code>string</code>
        * [.setSavePoint(name)](#Core.setSavePoint) ⇒ <code>string</code>
        * [.clearSavePoint(name)](#Core.clearSavePoint) ⇒ <code>string</code>
        * [.commit([name])](#Core.commit) ⇒ <code>string</code>
        * [.rollback([savepoint])](#Core.rollback) ⇒ <code>string</code>
        * [.limit(count, [offset])](#Core.limit) ⇒ <code>string</code>
        * [.concat(columns, [alias])](#Core.concat) ⇒ <code>string</code>
        * [.coalesce(columns, [alias])](#Core.coalesce) ⇒ <code>string</code>
        * [.nullif(expr1, expr2, [alias])](#Core.nullif) ⇒ <code>string</code>
        * [.trim(column, [chars], [alias])](#Core.trim) ⇒ <code>string</code>
        * [.ltrim(column, [chars], [alias])](#Core.ltrim) ⇒ <code>string</code>
        * [.rtrim(column, [chars], [alias])](#Core.rtrim) ⇒ <code>string</code>
        * [.length(column, [alias])](#Core.length) ⇒ <code>string</code>
        * [.on(condition, next)](#Core.on) ⇒ <code>string</code>

#### new Core()
Clase Core - Implementación base de QueryBuilder.language.Proporciona métodos y propiedades comunes para construir sentencias en el lenguaje SQL 2006.

**Example**  
```js
import { Core } from '@querybuilder/core';import { QueryBuilder } from '@querybuilder/querybuilder';const qb = new QueryBuilder(Core); // instancia un QueryBuilder quien delega en "Core" las operaciones de construcción de sentencias
```

#### core.tableConstraints(restricciones) ⇒ <code>string</code>
Generates SQL for table constraints

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL para las restricciones de tabla  

| Param | Type | Description |
| --- | --- | --- |
| restricciones | <code>Array</code> | Lista de restricciones de tabla |

**Example**  
```js
const constraints = core.tableConstraints([{ name: 'pk_id', primaryKey: ['id'] }]);// Returns formatted constraints SQL
```

#### core.multiTabla(selects, next) ⇒ <code>string</code>
Recibe una lista de select y los encadena usando el valor de optios.command

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - La query resultante con las uniones aplicadas  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>Array.&lt;(string\|QueryBuilder)&gt;</code> | lista de selects |
| options.command | <code>string</code> | comando de union |
| options.all | <code>boolean</code> | true añade ALL al comando de union |
| next | <code>\*</code> |  |

#### Core.Core
**Kind**: static class of [<code>Core</code>](#Core)  

##### new Core()
Creates a new Core instanceInitializes SQL 2006 compliance, predicates, functions and query state

#### Core.getAccount(userOrRole, [host]) ⇒ <code>string</code>
Formats user account string for SQL statementsUsed in GRANT, REVOKE and user management operations

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Formatted account string  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| userOrRole | <code>string</code> \| <code>Object</code> |  | User name or user object |
| [host] | <code>string</code> | <code>&quot;\&quot;%\&quot;&quot;</code> | Host specification for user |

**Example**  
```js
// String formatqb.getAccount('admin', 'localhost'); // "'admin'@'localhost'"// Object formatqb.getAccount({name: 'admin', host: 'localhost'}); // "'admin'@'localhost'"
```

#### Core.getSubselect(next, [all]) ⇒ <code>Array</code>
Extracts subselect from query array or returns last resolved valueUsed to handle nested queries and subqueries in SQL generation

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>Array</code> - Array with subselect parts or last value  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| next | <code>Object</code> |  | QueryBuilder instance containing query array |
| [all] | <code>boolean</code> | <code>false</code> | Include first select if true |

**Example**  
```js
const subSelect = qb.getSubselect(next, true);
```

#### Core.use(database) ⇒ <code>string</code>
Selects a database for use in subsequent operationsSets the current database context and returns USE statement

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - USE SQL statement  

| Param | Type | Description |
| --- | --- | --- |
| database | <code>string</code> | Name of the database to use |

**Example**  
```js
const useStatement = core.use('myDatabase');// Returns: "USE myDatabase"
```

#### Core.createDatabase(name, [options]) ⇒ <code>string</code>
Creates a new database with optional configurationGenerates CREATE DATABASE SQL statement with options

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - CREATE DATABASE SQL statement  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Name of the database to create |
| [options] | <code>Object</code> | <code>{}</code> | Database creation options |

**Example**  
```js
const createDb = core.createDatabase('myDB', { charset: 'utf8' });// Returns: "CREATE DATABASE myDB\n charset utf8"
```

#### Core.dropDatabase(name, [options]) ⇒ <code>string</code>
Drops (deletes) an existing databaseGenerates DROP DATABASE SQL statement with optional safety check

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - DROP DATABASE SQL statement  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Name of the database to drop |
| [options] | <code>Object</code> | <code>{}</code> | Drop options |
| [options.secure] | <code>boolean</code> | <code>false</code> | If true, uses IF EXISTS clause |

**Example**  
```js
const dropDb = core.dropDatabase('myDB', { secure: true });// Returns: "DROP DATABASE IF EXISTS myDB"
```

#### Core.createSchema(name, options) ⇒ <code>string</code>
Crea un nuevo esquema (schema) en la base de datosGenera CREATE SCHEMA SQL usando el estándar SQL 2006

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL CREATE SCHEMA  
**See**: [ Esquema createSchema](sql2006.createSchema)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del esquema a crear |
| options | <code>Object</code> | Opciones de creación del esquema |

#### Core.dropSchema(name, options) ⇒ <code>string</code>
Elimina un esquema (schema) existente en la base de datosGenera DROP SCHEMA SQL usando el estándar SQL 2006

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP SCHEMA  
**See**: [ Esquema dropSchema](sql2006.dropSchema)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del esquema a eliminar |
| options | <code>Object</code> | Opciones para el comando |

#### Core.createTable(name, [options]) ⇒ <code>string</code>
Creates a new table with specified name and optionsGenerates CREATE TABLE SQL statement using SQL 2006 standard

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - CREATE TABLE SQL statement  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Name of the table to create |
| [options] | <code>Object</code> | <code>{}</code> | Table creation options (temporary, constraints, etc.) |

**Example**  
```js
const createTable = core.createTable('users', { temporary: true });// Returns formatted CREATE TABLE statement
```

#### Core.column(name, options) ⇒ <code>string</code>
Defines a column specification for table creation or alterationGenerates column definition with data type and constraints

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Column definition SQL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the column |
| options | <code>Object</code> | Column options (type, constraints, default, etc.) |

**Example**  
```js
const col = core.column('id', { type: 'INT', primaryKey: true, autoIncrement: true });// Returns formatted column definition
```

#### Core.alterTable(name) ⇒ <code>string</code>
Genera SQL para modificar una tabla existente

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL ALTER TABLE  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la tabla a modificar |

**Example**  
```js
const alterTable = core.alterTable('users');// Returns: "ALTER TABLE users"
```

#### Core.addColumn(name, options) ⇒ <code>string</code>
Genera SQL para agregar una nueva columna a una tabla existente

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL ADD COLUMN  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la columna a agregar |
| options | <code>Object</code> | Opciones de la columna (tipo, restricciones, etc.) |

**Example**  
```js
const addColumn = core.addColumn('age', { type: 'INT', notNull: true });// Returns: "ADD COLUMN age INT NOT NULL"
```

#### Core.alterColumn(name) ⇒ <code>string</code>
Genera SQL para modificar una columna existente

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL ALTER COLUMN  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la columna a modificar |

**Example**  
```js
const alterColumn = core.alterColumn('age');// Returns: "ALTER COLUMN age"
```

#### Core.dropColumn(name, option) ⇒ <code>string</code>
Genera SQL para eliminar una columna existente

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP COLUMN  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la columna a eliminar |
| option | <code>Object</code> | Opciones de eliminación (si las hay) |

**Example**  
```js
const dropColumn = core.dropColumn('age');// Returns: "DROP COLUMN age"
```

#### Core.setDefault(value) ⇒ <code>string</code>
Genera SQL para establecer un valor por defecto en una columna

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL SET DEFAULT  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | Valor por defecto a establecer |

**Example**  
```js
const setDefault = core.setDefault('active');// Returns: "SET DEFAULT 'active'"
```

#### Core.dropDefault() ⇒ <code>string</code>
Genera SQL para eliminar un valor por defecto en una columna

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP DEFAULT  
**Example**  
```js
const dropDefault = core.dropDefault();// Returns: "DROP DEFAULT"
```

#### Core.addConstraint(name, option, next) ⇒ <code>string</code>
Genera SQL para agregar una restricción a una tabla

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL ADD CONSTRAINT  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la restricción |
| option | <code>Object</code> | Opciones de la restricción (tipo, columnas, etc.) |
| next | <code>string</code> | Sentencia SQL siguiente |

**Example**  
```js
const addConstraint = core.addConstraint('pk_id', { primaryKey: ['id'] }, 'users');// Returns: "ADD CONSTRAINT pk_id PRIMARY KEY (id) ON users"
```

#### Core.dropConstraint(name, table) ⇒ <code>string</code>
Genera SQL para eliminar una restricción de una tabla

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP CONSTRAINT  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la restricción a eliminar |
| table | <code>string</code> | Nombre de la tabla de la que se eliminará la restricción |

**Example**  
```js
const dropConstraint = core.dropConstraint('pk_id', 'users');// Returns: "DROP CONSTRAINT pk_id ON users"
```

#### Core.dropTable(name, option) ⇒ <code>string</code>
Genera SQL para eliminar una tabla

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP TABLE  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la tabla a eliminar |
| option | <code>Object</code> | Opciones de eliminación (si las hay) |

**Example**  
```js
const dropTable = core.dropTable('users');// Returns: "DROP TABLE users"
```

#### Core.createType(name, options) ⇒ <code>string</code>
Genera SQL para crear un nuevo tipo de datos definido por el usuario

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL CREATE TYPE  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del tipo de datos |
| options | <code>Object</code> | Opciones para el tipo de datos (si las hay) |

**Example**  
```js
const createType = core.createType('custom_type', { ... });// Returns: "CREATE TYPE custom_type AS ..."
```

#### Core.dropType(name, options) ⇒ <code>string</code>
Genera SQL para eliminar un tipo de datos definido por el usuario

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP TYPE  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del tipo de datos |
| options | <code>Object</code> | Opciones para la eliminación (si las hay) |

**Example**  
```js
const dropType = core.dropType('custom_type');// Returns: "DROP TYPE custom_type"
```

#### Core.createAssertion(name, assertion) ⇒ <code>string</code>
Genera SQL para crear una nueva aserción (assertion) en la base de datos

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL CREATE ASSERTION  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la aserción |
| assertion | <code>string</code> | Condición de la aserción |

**Example**  
```js
const createAssertion = core.createAssertion('check_user_age', 'age > 0');// Returns: "CREATE ASSERTION check_user_age CHECK ( age > 0 )"
```

#### Core.dropAssertion(name) ⇒ <code>string</code>
Genera SQL para eliminar una aserción (assertion) existente

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP ASSERTION  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la aserción |

**Example**  
```js
const dropAssertion = core.dropAssertion('check_user_age');// Returns: "DROP ASSERTION check_user_age"
```

#### Core.createDomain(name, options) ⇒ <code>string</code>
Genera SQL para crear un nuevo dominio (domain) en la base de datos

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL CREATE DOMAIN  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del dominio |
| options | <code>Object</code> | Opciones para el dominio (si las hay) |

**Example**  
```js
const createDomain = core.createDomain('email_domain', { ... });// Returns: "CREATE DOMAIN email_domain AS ..."
```

#### Core.dropDomain(name, options) ⇒ <code>string</code>
Genera SQL para eliminar un dominio (domain) existente

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP DOMAIN  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del dominio |
| options | <code>Object</code> | Opciones para la eliminación (si las hay) |

**Example**  
```js
const dropDomain = core.dropDomain('email_domain');// Returns: "DROP DOMAIN email_domain"
```

#### Core.createView(name, options) ⇒ <code>string</code>
Genera SQL para crear una nueva vista (view) en la base de datos

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL CREATE VIEW  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la vista |
| options | <code>Object</code> | Opciones para la vista (si las hay) |

**Example**  
```js
const createView = core.createView('user_view', { ... });// Returns: "CREATE VIEW user_view AS ..."
```

#### Core.dropView(name, options) ⇒ <code>string</code>
Genera SQL para eliminar una vista (view) existente

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP VIEW  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la vista |
| options | <code>Object</code> | Opciones para la eliminación (si las hay) CASCADE | RESTRICT |

**Example**  
```js
const dropView = core.dropView('user_view');// Returns: "DROP VIEW user_view"
```

#### Core.createRoles(names, options) ⇒ <code>string</code>
Genera SQL para crear nuevos roles en la base de datos

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL CREATE ROLE  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>Array.&lt;string&gt;</code> | Nombres de los roles a crear |
| options | <code>Object</code> | Opciones para la creación (si las hay) |

**Example**  
```js
const createRoles = core.createRoles(['admin', 'user'], { ... });// Returns: "CREATE ROLE admin, user AS ..."
```

#### Core.dropRoles(names, options) ⇒ <code>string</code>
Genera la instrucción SQL para eliminar roles existentes en la base de datos

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL DROP ROLE  
**See**: [dropRoles](sql2006.dropRoles)  Documentación de opciones soportadas  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>Array.&lt;string&gt;</code> | Nombres de los roles a eliminar |
| options | <code>Object</code> | Opciones para la eliminación (si las hay) |

**Example**  
```js
const dropRoles = core.dropRoles(['admin', 'user'], { ... });// Returns: "DROP ROLE admin, user"
```

#### Core.grant(commands, on, to, options) ⇒ <code>string</code>
Genera la instrucción SQL para conceder permisos a un objeto

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL GRANT  
**See**: [grant](sql2006.grant) Documentación de opciones soportadas  

| Param | Type | Description |
| --- | --- | --- |
| commands | <code>Array.&lt;string&gt;</code> | Comandos de permisos a conceder |
| on | <code>string</code> | Objeto sobre el que se conceden los permisos |
| to | <code>Array.&lt;string&gt;</code> | Usuarios o roles a los que se conceden los permisos |
| options | <code>Object</code> | Opciones para la concesión (si las hay) |

**Example**  
```js
const grant = core.grant(['SELECT', 'INSERT'], 'users', ['admin'], { ... });// Returns: "GRANT SELECT, INSERT ON users TO admin"
```

#### Core.revoke(commands, on, from, options) ⇒ <code>string</code>
Genera la instrucción SQL para revocar permisos a un objeto

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL REVOKE  
**See**: [revoke](sql2006.revoke) Documentación de opciones soportadas  

| Param | Type | Description |
| --- | --- | --- |
| commands | <code>Array.&lt;string&gt;</code> | Comandos de permisos a revocar |
| on | <code>string</code> | Objeto sobre el que se revocan los permisos |
| from | <code>Array.&lt;string&gt;</code> | Usuarios o roles a los que se revocan los permisos |
| options | <code>Object</code> | Opciones para la revocación (si las hay) |

**Example**  
```js
const revoke = core.revoke(['SELECT'], 'users', ['user'], { ... });// Returns: "REVOKE SELECT ON users FROM user"
```

#### Core.grantRoles(roles, users, options) ⇒ <code>string</code>
Genera la instrucción SQL para conceder roles a usuarios o roles

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - Sentencia SQL GRANT  
**See**: [grantRoles](sql2006.grantRoles) Documentación de opciones soportadas  

| Param | Type | Description |
| --- | --- | --- |
| roles | <code>Array.&lt;string&gt;</code> | Roles a conceder |
| users | <code>Array.&lt;string&gt;</code> | Usuarios o roles a los que se conceden los roles |
| options | <code>Object</code> | Opciones para la concesión (si las hay) |

**Example**  
```js
const grant = core.grantRoles(['admin'], ['user'], { ... });// Returns: "GRANT admin TO user"
```

#### Core.from(tables, [alias]) ⇒ <code>string</code>
Generates FROM clause for SQL queriesSupports single table, multiple tables, and table aliases

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - FROM clause SQL  

| Param | Type | Description |
| --- | --- | --- |
| tables | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Table name(s) for the FROM clause |
| [alias] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Table alias(es) |

**Example**  
```js
// Single tableconst from1 = core.from('users');// Returns: "FROM users"// Table with aliasconst from2 = core.from('users', 'u');// Returns: "FROM users u"// Multiple tables with aliasesconst from3 = core.from(['users', 'orders'], ['u', 'o']);// Returns: "FROM users AS u, orders AS o"
```

#### Core.where(predicados, next) ⇒ <code>string</code>
Generates WHERE clause for SQL queries with predicatesHandles various predicate formats and QueryBuilder expressions

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - WHERE clause SQL  

| Param | Type | Description |
| --- | --- | --- |
| predicados | <code>string</code> \| <code>Object</code> \| <code>Array</code> | WHERE conditions (string, QB expression, or array) |
| next | <code>Object</code> | QueryBuilder instance providing context |

**Example**  
```js
// Simple string conditionconst where1 = core.where("age > 18", queryBuilder);// Returns: "WHERE age > 18"// QueryBuilder expressionconst where2 = core.where(qb.eq('status', 'active'), queryBuilder);// Returns: "WHERE status = 'active'"
```

#### Core.insert(table, cols, values, next) ⇒ <code>string</code>
Generates INSERT INTO SQL statement for data insertionSupports various value formats including arrays, objects, and subqueries

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - INSERT INTO SQL statement  
**Throws**:

- <code>Error</code> When table is undefined

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Target table name for insertion |
| cols | <code>Array.&lt;string&gt;</code> | Column names for insertion |
| values | <code>Array</code> \| <code>Object</code> \| <code>\*</code> | Values to insert (array of values, object, or single value) |
| next | <code>Object</code> | QueryBuilder instance providing context |

**Example**  
```js
// Insert with column list and valuesconst insert1 = core.insert('users', ['name', 'email'], ['John', 'john@example.com'], qb);// Returns: "INSERT INTO users\n( name, email )\nVALUES ( 'John', 'john@example.com' )"// Insert multiple rowsconst insert2 = core.insert('users', ['name'], [['John'], ['Jane']], qb);
```

#### Core.update(table, sets, next) ⇒ <code>Promise.&lt;string&gt;</code>
Generates UPDATE SQL statement for data modificationSupports various value types including strings, numbers, and subqueries

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>Promise.&lt;string&gt;</code> - UPDATE SQL statement  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Target table name for update |
| sets | <code>Object</code> | Object with column-value pairs to update |
| next | <code>Object</code> | QueryBuilder instance providing context |

**Example**  
```js
// Simple updateconst update1 = await core.update('users', { name: 'John', age: 25 }, qb);// Returns: "UPDATE users\nSET name = 'John', age = 25"// Update with subqueryconst update2 = await core.update('users', { status: subQueryBuilder }, qb);
```

#### Core.delete(from) ⇒ <code>string</code>
Generates DELETE FROM SQL statement for data removalCreates basic DELETE statement for specified table

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - DELETE FROM SQL statement  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | Table name to delete from |

**Example**  
```js
const deleteStmt = core.delete('users');// Returns: "DELETE FROM users"
```

#### Core.avg(column, [alias], column, [alias]) ⇒ <code>string</code> \| <code>string</code>
Genera una consulta SQL COUNT

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "COUNT(*) [AS total]"

	/**Genera una consulta SQL AVG<code>string</code> - - "AVG(column) [AS average]"  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> \| `QueryBuilder` | Columna o expresión a contar |
| [alias] | <code>string</code> | Alias opcional para el resultado |
| column | <code>string</code> \| <code>column</code> \| `QueryBuilder` | Columna o expresión a contar |
| [alias] | <code>string</code> | Alias opcional para el resultado |

#### Core.max(column, [alias]) ⇒ <code>string</code>
Genera una consulta SQL MAX

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "MAX(column) [AS maximum]"  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> \| `QueryBuilder` | Columna o expresión a contar |
| [alias] | <code>string</code> | Alias opcional para el resultado |

#### Core.min(column, [alias]) ⇒ <code>string</code>
Genera una consulta SQL MIN

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "MIN(column) [AS minimum]"  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> \| `QueryBuilder` | Columna o expresión a contar |
| [alias] | <code>string</code> | Alias opcional para el resultado |

#### Core.sum(column, [alias]) ⇒ <code>string</code>
Genera una consulta SQL SUM

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "SUM(column) [AS total]"  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> \| `QueryBuilder` | Columna o expresión a contar |
| [alias] | <code>string</code> | Alias opcional para el resultado |

#### Core.upper(column, [alias]) ⇒ <code>string</code>
Genera una consulta SQL UPPER

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "UPPER(column) [AS alias]"  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> \| `QueryBuilder` | Columna o expresión a convertir a mayúsculas |
| [alias] | <code>string</code> | Alias opcional para el resultado |

#### Core.lower(column, [alias]) ⇒ <code>string</code>
Genera una consulta SQL LOWER

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "LOWER(column) [AS alias]"  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> \| `QueryBuilder` | Columna o expresión a convertir a minúsculas |
| [alias] | <code>string</code> | Alias opcional para el resultado |

#### Core.substr(column, inicio, ...options) ⇒ <code>string</code>
Función SQL SUBSTRING

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "SUBSTRING(column FROM inicio [FOR longitud]) [AS alias]"  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> | Columna |
| inicio | <code>int</code> | Valor inicial |
| ...options | <code>any</code> |  |

#### Core.currentDate() ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "CURRENT_DATE"  

#### Core.currentTime() ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "CURRENT_TIME"  

#### Core.currentTimestamp() ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "CURRENT_TIMESTAMP"  

#### Core.localTime() ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "LOCALTIME"  

#### Core.localTimestamp() ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - "LOCALTIMESTAMP"  

#### Core.case([column], casos, defecto) ⇒ <code>Expresion</code>
Genera una expresión CASE SQL.Soporta casos con y sin columna ASSe pueden pasar tres parámetros (columna, casos, defecto)o dos parámetros (casos, defecto) si no se usa columna AS

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>Expresion</code> - - instancia de Expresion  
**See**: [Expresion](Expresion)  

| Param | Type | Description |
| --- | --- | --- |
| [column] | <code>string</code> \| <code>column</code> | nombre de la columna AS |
| casos | <code>Array.&lt;Casos&gt;</code> | Array<column,string> => [ [condicion, resultado],...] |
| defecto | <code>string</code> | Caso else |

**Example**  
```js
// Ejemplo sin columna ASconst case1 = core.case([  [ 'age < 18', "'Minor'" ],  [ 'age >= 18 AND age < 65', "'Adult'" ],  [ 'age >= 65', "'Senior'" ]]);// Resultado:// CASE// WHEN age < 18 THEN 'Minor'// WHEN age >= 18 AND age < 65 THEN 'Adult'// WHEN age >= 65 THEN 'Senior'// END
```

#### Core.createCursor(name, expresion, options) ⇒ <code>string</code>
Crea un cursor SQL.Utiliza la función específica del dialecto SQL (sql2006.createCursor).

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para crear el cursor  
**Throws**:

- <code>Error</code> - Si el nombre del cursor no es válido

**See**: [sql2006.createCursor](sql2006.createCursor)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del cursor |
| expresion | <code>string</code> | Expresión SQL para el cursor |
| options | <code>Object</code> | Opciones adicionales para el cursor |

**Example**  
```js
const cursorSql = core.createCursor('myCursor', 'SELECT * FROM users', { scroll: true }, qb);
```

#### Core.openCursor(name) ⇒ <code>string</code>
Abre un cursor SQL.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para abrir el cursor  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del cursor a abrir |

#### Core.closeCursor(name) ⇒ <code>string</code>
Cierra un cursor SQL.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para cerrar el cursor  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del cursor a cerrar |

#### Core.fetch(cursorName, hostVars) ⇒ <code>string</code>
Realiza una operación FETCH en un cursor SQL.Permite recuperar filas del cursor y almacenarlas en variables host.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para realizar la operación FETCH  

| Param | Type | Description |
| --- | --- | --- |
| cursorName | <code>string</code> | Nombre del cursor |
| hostVars | <code>Array.&lt;string&gt;</code> | Variables host donde se almacenarán las filas |

#### Core.fetchNext(cursorName, hostVars) ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para realizar la operación FETCH NEXT  

| Param | Type | Description |
| --- | --- | --- |
| cursorName | <code>string</code> | Nombre del cursor |
| hostVars | <code>Array.&lt;string&gt;</code> | Variables host donde se almacenarán las filas |

#### Core.fetchPrior(cursorName, hostVars) ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para realizar la operación FETCH PRIOR  

| Param | Type | Description |
| --- | --- | --- |
| cursorName | <code>string</code> | Nombre del cursor |
| hostVars | <code>Array.&lt;string&gt;</code> | Variables host donde se almacenarán las filas |

#### Core.fetchFirst(cursorName, hostVars) ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para realizar la operación FETCH FIRST  

| Param | Type | Description |
| --- | --- | --- |
| cursorName | <code>string</code> | Nombre del cursor |
| hostVars | <code>Array.&lt;string&gt;</code> | Variables host donde se almacenarán las filas |

#### Core.fetchLast(cursorName, hostVars) ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para realizar la operación FETCH LAST  

| Param | Type | Description |
| --- | --- | --- |
| cursorName | <code>string</code> | Nombre del cursor |
| hostVars | <code>Array.&lt;string&gt;</code> | Variables host donde se almacenarán las filas |

#### Core.fetchAbsolute(cursorName, filas, hostVars) ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para realizar la operación FETCH ABSOLUTE  

| Param | Type | Description |
| --- | --- | --- |
| cursorName | <code>string</code> | Nombre del cursor |
| filas | <code>number</code> | Número de filas a recuperar |
| hostVars | <code>Array.&lt;string&gt;</code> | Variables host donde se almacenarán las filas |

#### Core.fetchRelative(cursorName, filas, hostVars) ⇒ <code>string</code>
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para realizar la operación FETCH RELATIVE  

| Param | Type | Description |
| --- | --- | --- |
| cursorName | <code>string</code> | Nombre del cursor |
| filas | <code>number</code> | Número de filas a recuperar |
| hostVars | <code>Array.&lt;string&gt;</code> | Variables host donde se almacenarán las filas |

#### Core.setTransaction(config) ⇒ <code>string</code>
Genera una declaración SQL para configurar una transacción.Utiliza la función específica del dialecto SQL (sql2006.setTransaction).

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para configurar la transacción  
**Throws**:

- <code>Error</code> - Si la configuración no es válida

**See**: [sql2006.setTransaction](sql2006.setTransaction)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuración de la transacción |

#### Core.startTransaction(config) ⇒ <code>string</code>
Genera una declaración SQL para iniciar una transacción.Utiliza la función específica del dialecto SQL (sql2006.startTransaction).

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para iniciar la transacción  
**Throws**:

- <code>Error</code> - Si la configuración no es válida

**See**: [sql2006.setTransaction](sql2006.setTransaction)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuración de la transacción |

#### Core.setConstraints(restrictions, [type]) ⇒ <code>string</code>
Genera una declaración SQL para establecer restricciones de integridad.Permite definir restricciones específicas y su tipo (DEFERRED o IMMEDIATE).

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para establecer las restricciones  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| restrictions | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Restricciones a establecer |
| [type] | <code>string</code> | <code>&quot;DEFERRED|IMMEDIATE&quot;</code> | Tipo de restricción (DEFERRED o IMMEDIATE) |

#### Core.setSavePoint(name) ⇒ <code>string</code>
Genera una declaración SQL para manejar puntos de guardado en transacciones.Permite crear, liberar y revertir a puntos de guardado específicos.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para manejar el punto de guardado  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del punto de guardado |

#### Core.clearSavePoint(name) ⇒ <code>string</code>
Genera una declaración SQL para liberar un punto de guardado en una transacción.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para liberar el punto de guardado  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del punto de guardado |

#### Core.commit([name]) ⇒ <code>string</code>
Genera una declaración SQL para confirmar o revertir una transacción.Permite confirmar la transacción actual o revertir a un punto de guardado específico.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para confirmar o revertir la transacción  

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | Nombre del punto de guardado para revertir (opcional) |

#### Core.rollback([savepoint]) ⇒ <code>string</code>
Genera una declaración SQL para revertir una transacción.Permite revertir la transacción actual o a un punto de guardado específico.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Declaración SQL para revertir la transacción  

| Param | Type | Description |
| --- | --- | --- |
| [savepoint] | <code>string</code> | Nombre del punto de guardado para revertir (opcional) |

#### Core.limit(count, [offset]) ⇒ <code>string</code>
Genera una cláusula SQL LIMIT con OFFSET opcional.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Cláusula SQL LIMIT con OFFSET opcional  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>number</code> | Número máximo de filas a devolver |
| [offset] | <code>number</code> | Número de filas a omitir (opcional) |

#### Core.concat(columns, [alias]) ⇒ <code>string</code>
Genera una expresión SQL para concatenar columnas.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Expresión SQL para concatenar columnas  

| Param | Type | Description |
| --- | --- | --- |
| columns | <code>Array.&lt;string&gt;</code> | Columnas a concatenar |
| [alias] | <code>string</code> | Alias para la expresión resultante |

#### Core.coalesce(columns, [alias]) ⇒ <code>string</code>
Genera una expresión SQL para manejar valores nulos.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Expresión SQL para manejar valores nulos  

| Param | Type | Description |
| --- | --- | --- |
| columns | <code>Array.&lt;string&gt;</code> | Columnas a evaluar |
| [alias] | <code>string</code> | Alias para la expresión resultante |

#### Core.nullif(expr1, expr2, [alias]) ⇒ <code>string</code>
Genera una expresión SQL para manejar valores nulos.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Expresión SQL para manejar valores nulos  

| Param | Type | Description |
| --- | --- | --- |
| expr1 | <code>string</code> | Primera expresión a evaluar |
| expr2 | <code>string</code> | Segunda expresión a evaluar |
| [alias] | <code>string</code> | Alias para la expresión resultante |

#### Core.trim(column, [chars], [alias]) ⇒ <code>string</code>
Genera una expresión SQL para recortar espacios en blanco o caracteres específicos.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Expresión SQL para recortar espacios en blanco o caracteres específicos  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> | Columna a recortar |
| [chars] | <code>string</code> | Caracteres específicos a recortar (opcional) |
| [alias] | <code>string</code> | Alias para la expresión resultante (opcional) |

#### Core.ltrim(column, [chars], [alias]) ⇒ <code>string</code>
Genera una expresión SQL para recortar espacios en blanco o caracteres específicos a la izquierda.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Expresión SQL para recortar espacios en blanco o caracteres específicos a la izquierda  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> | Columna a recortar |
| [chars] | <code>string</code> | Caracteres específicos a recortar (opcional) |
| [alias] | <code>string</code> | Alias para la expresión resultante (opcional) |

#### Core.rtrim(column, [chars], [alias]) ⇒ <code>string</code>
Genera una expresión SQL para recortar espacios en blanco o caracteres específicos a la derecha.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Expresión SQL para recortar espacios en blanco o caracteres específicos a la derecha  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> | Columna a recortar |
| [chars] | <code>string</code> | Caracteres específicos a recortar (opcional) |
| [alias] | <code>string</code> | Alias para la expresión resultante (opcional) |

#### Core.length(column, [alias]) ⇒ <code>string</code>
Genera una expresión SQL para obtener la longitud de una cadena.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Expresión SQL para obtener la longitud de una cadena  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> | Columna a evaluar |
| [alias] | <code>string</code> | Alias para la expresión resultante |

#### Core.on(condition, next) ⇒ <code>string</code>
Genera una cláusula SQL ON para condiciones de unión.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>string</code> - - Cláusula SQL ON  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>string</code> \| <code>object</code> | Condición de unión |
| next | <code>object</code> | Objeto de consulta siguiente |

##### typedefs : <code>object</code>
**Kind**: global namespace  

##### Status : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| query | <code>String</code> | La consulta SQL ejecutada. |
| rowCount | <code>Number</code> | El número de filas devueltas por la consulta. |
| fieldCount | <code>Number</code> | El número de columnas devueltas por la consulta. |
| info | <code>String</code> | Información adicional sobre el resultado de la consulta. |
| errors | <code>Number</code> | El número de errores ocurridos durante la consulta. |
| warnings | <code>Number</code> | El número de advertencias generadas durante la consulta. |
| [error] | <code>Error</code> | El objeto Error si ocurrió un error durante la consulta. |

##### DatabaseParams : <code>Object</code>
Parámetros básicos de conexión a base de datos.Define la información mínima necesaria para establecer una conexión.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | Dirección del servidor de base de datos (IP o hostname) |
| port | <code>number</code> \| <code>string</code> | Puerto de conexión del servidor |
| username | <code>string</code> | Nombre de usuario para autenticación |
| password | <code>string</code> | Contraseña para autenticación |
| [database] | <code>string</code> | Nombre de la base de datos específica (requerido para testing) |

**Example**  
```js
// Configuración básicaconst params = {  host: "localhost",  port: 5432,  username: "dbuser",  password: "secret123",  database: "myapp_db"};
```

##### MongoDBOptions : <code>Object</code>
Opciones específicas de configuración para MongoDB.Define parámetros adicionales para optimizar la conexión MongoDB.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| retryWrites | <code>boolean</code> | Si se deben reintentar automáticamente las operaciones de escritura fallidas |
| w | <code>string</code> | Write Concern: nivel de confirmación requerido ("majority", número, o "acknowledged") |
| connectTimeoutMS | <code>number</code> | Tiempo límite para establecer conexión inicial (en milisegundos) |

**Example**  
```js
const mongoOptions = {  retryWrites: true,  w: "majority",  connectTimeoutMS: 30000};
```

##### MongoDBParams : <code>Object</code>
Parámetros extendidos específicos para conexiones MongoDB.Incluye configuraciones adicionales y método para generar cadena de conexión.

**Kind**: global typedef  
**Extends**: <code>types.DatabaseParams</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| options | <code>types.MongoDBOptions</code> | Opciones específicas de MongoDB para la conexión |
| getConnectionString | <code>function</code> | Método que genera la cadena de conexión URI de MongoDB |

**Example**  
```js
const mongoParams = {  host: "localhost",  port: 27017,  username: "mongouser",  password: "mongopass",  database: "myapp",  options: {    retryWrites: true,    w: "majority",    connectTimeoutMS: 30000  },  getConnectionString: function() {    // Implementación específica  }};
```

##### DatabaseConfig : <code>Object</code>
Configuración completa para un motor de base de datos específico.Define todos los aspectos necesarios para conectar y operar con una base de datos.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | Versión específica del motor de base de datos (ej: "8.4.3", "16", "8.0.3") |
| driver | <code>Object</code> | Instancia del driver específico para el motor (MySqlDriver, PostgreSQLDriver, MongodbDriver) |
| params | <code>types.DatabaseParams</code> \| <code>types.MongoDBParams</code> | Parámetros de conexión específicos del motor |

**Example**  
```js
// Configuración MySQLconst mysqlConfig = {  version: "8.4.3",  driver: MySqlDriver,  params: {    host: "localhost",    port: 3306,    username: "root",    password: "secret"  }};// Configuración MongoDB  const mongoConfig = {  version: "8.0.3",  driver: MongodbDriver,  params: {    host: "localhost",    port: 27017,    username: undefined,    password: undefined,    options: {      retryWrites: true,      w: "majority",      connectTimeoutMS: 30000    },    getConnectionString: function() { return "mongodb://..."; }  }};
```

##### next : <code>Object</code>
Objeto de contexto para el encadenamiento fluido de métodos QueryBuilder.Mantiene el estado de la consulta SQL mientras se construye progresivamente.Este objeto es gestionado internamente por el Proxy de QueryBuilder y permite que los métodos mantengan contexto entre llamadas encadenadas.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| q | <code>Array.&lt;String&gt;</code> |  | Array que contiene las partes de la consulta SQL siendo construida. Cada elemento representa un fragmento SQL que será unido para formar la consulta completa. |
| [last] | <code>String</code> \| <code>null</code> | <code></code> | Nombre del último comando SQL ejecutado exitosamente. Se usa para validar el orden correcto de los comandos (ej: FROM debe seguir a SELECT). |
| [prop] | <code>String</code> |  | Nombre del comando actual siendo procesado. Identificador del método que está siendo ejecutado en la cadena fluida. |
| [callStack] | <code>Array.&lt;String&gt;</code> | <code>[]</code> | Historial ordenado de comandos ejecutados. Rastrea la secuencia completa de métodos llamados para validación y depuración. |
| [error] | <code>Error</code> \| <code>String</code> \| <code>null</code> | <code></code> | Error capturado durante la construcción de la consulta. Puede ser un objeto Error o un mensaje de error como string. |
| [isQB] | <code>Boolean</code> | <code>false</code> | Indica si el valor actual contiene una instancia de QueryBuilder. Se activa cuando se detectan subconsultas o QueryBuilders anidados. |

**Example**  
```js
// Evolución del objeto next durante una consulta típica:// 1. Después de qb.select('*'){  q: ["SELECT *"],  last: null,  prop: "select",  callStack: ["select"],  error: null,  isQB: false}// 2. Después de .from('users'){  q: ["SELECT *", "FROM users"],  last: "select",  prop: "from",  callStack: ["select", "from"],  error: null,  isQB: false}// 3. Después de .where('active = 1'){  q: ["SELECT *", "FROM users", "WHERE active = 1"],  last: "from",  prop: "where",  callStack: ["select", "from", "where"],  error: null,  isQB: false}// 4. Con subconsulta{  q: ["SELECT *", "FROM users", "WHERE id IN", "(SELECT user_id FROM orders)"],  last: "where",  prop: "where",  callStack: ["select", "from", "where"],  error: null,  isQB: true  // ← Indica presencia de subconsulta}// 5. Con error{  q: ["SELECT *"],  last: "select",  prop: "from",  callStack: ["select"],  error: "No es posible usar FROM sin SELECT previo",  isQB: false}
```

##### queryBuilderOptions : <code>Object</code>
Opciones de configuración para la instancia QueryBuilder.Define comportamientos, adaptadores y configuraciones específicas del entorno.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [typeIdentificator] | <code>String</code> | <code>&quot;regular&quot;</code> | Identificador del tipo de datos a usar. Determina cómo se manejan los tipos de datos y validaciones. Valores posibles: "regular", "strict", "loose". |
| [mode] | <code>String</code> |  | Modo de operación del QueryBuilder. - "TEST": Suprime errores y permite testing - "PRODUCTION": Modo estricto con validación completa - "DEVELOPMENT": Modo con logging extendido |
| [logging] | <code>Object</code> |  | Configuración de logging y depuración. |
| [logging.enabled] | <code>Boolean</code> | <code>false</code> | Habilita/deshabilita logging |
| [logging.level] | <code>String</code> | <code>&quot;info&quot;</code> | Nivel de logging ("debug", "info", "warn", "error") |
| [connection] | <code>Object</code> |  | Configuración de conexión a base de datos. |
| [connection.host] | <code>String</code> |  | Host del servidor de base de datos |
| [connection.port] | <code>Number</code> |  | Puerto de conexión |
| [connection.database] | <code>String</code> |  | Nombre de la base de datos |
| [connection.user] | <code>String</code> |  | Usuario para autenticación |
| [connection.password] | <code>String</code> |  | Contraseña para autenticación |

**Example**  
```js
// Configuración básicaconst options = {  typeIdentificator: "strict",  mode: "DEVELOPMENT"};// Configuración completaconst fullOptions = {  typeIdentificator: "regular",  mode: "PRODUCTION",  logging: {    enabled: true,    level: "warn"  },  connection: {    host: "localhost",    port: 5432,    database: "myapp",    user: "dbuser",    password: "secret"  }};const qb = new QueryBuilder(PostgreSQL, fullOptions);
```

##### ResultData : <code>Object</code>
Datos de resultado después de ejecutar una consulta SQL.Contiene información sobre la ejecución y los datos devueltos.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [rows] | <code>Array.&lt;Object&gt;</code> | <code>[]</code> | Array de objetos con las filas devueltas por la consulta. Cada objeto representa una fila con propiedades nombradas según las columnas. |
| [rowCount] | <code>Number</code> | <code>0</code> | Número total de filas afectadas o devueltas. Para SELECT: número de filas en el resultado. Para INSERT/UPDATE/DELETE: número de filas afectadas. |
| [fields] | <code>Array.&lt;Object&gt;</code> | <code>[]</code> | Metadatos de las columnas devueltas. |
| fields[].name | <code>String</code> |  | Nombre de la columna |
| fields[].type | <code>String</code> |  | Tipo de datos de la columna |
| fields[].nullable | <code>Boolean</code> |  | Si la columna acepta NULL |
| [query] | <code>String</code> |  | La consulta SQL que fue ejecutada. Útil para logging y depuración. |
| [executionTime] | <code>Number</code> |  | Tiempo de ejecución en milisegundos. |
| [success] | <code>Boolean</code> | <code>true</code> | Indica si la consulta fue exitosa. |
| [error] | <code>String</code> \| <code>null</code> | <code></code> | Mensaje de error si la consulta falló. |

**Example**  
```js
// Resultado de SELECT{  rows: [    { id: 1, name: "John", email: "john@example.com" },    { id: 2, name: "Jane", email: "jane@example.com" }  ],  rowCount: 2,  fields: [    { name: "id", type: "integer", nullable: false },    { name: "name", type: "varchar", nullable: false },    { name: "email", type: "varchar", nullable: true }  ],  query: "SELECT id, name, email FROM users WHERE active = 1",  executionTime: 15,  success: true,  error: null}// Resultado de INSERT/UPDATE/DELETE{  rows: [],  rowCount: 3,  fields: [],  query: "UPDATE users SET active = 1 WHERE created_at < '2023-01-01'",  executionTime: 8,  success: true,  error: null}// Resultado con error{  rows: [],  rowCount: 0,  fields: [],  query: "SELECT * FROM non_existent_table",  executionTime: 2,  success: false,  error: "Table 'non_existent_table' doesn't exist"}
```


---

*Documentación generada automáticamente desde comentarios JSDoc*  
*Última actualización: 17/10/2025, 19:24:56*
