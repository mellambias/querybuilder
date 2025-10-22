<a name="QueryBuilder"></a>

### QueryBuilder
**Kind**: global class  

* [QueryBuilder](#QueryBuilder)
    * [new QueryBuilder(language, [options])](#new_QueryBuilder_new)
    * _instance_
        * [.result](#QueryBuilder+result)
    * _static_
        * _DCL_
            * [.grant(privilegios, on, to, next)](#QueryBuilder.grant) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.revoke(privilegios, on, from, next)](#QueryBuilder.revoke) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.grantRoles(roles, users, next)](#QueryBuilder.grantRoles) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.revokeRoles(roles, from, next)](#QueryBuilder.revokeRoles) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
        * _DDL_
            * [.createDatabase(name, options, next)](#QueryBuilder.createDatabase) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.dropDatabase(name, options, next)](#QueryBuilder.dropDatabase) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createSchema(name, options, next)](#QueryBuilder.createSchema) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.dropSchema(name, options, next)](#QueryBuilder.dropSchema) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createTable(name, options, next)](#QueryBuilder.createTable) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.alterTable(name, next)](#QueryBuilder.alterTable) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.alterTableComands(name, options, next)](#QueryBuilder.alterTableComands) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.dropTable(name, option, next)](#QueryBuilder.dropTable) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createType(name, option, next)](#QueryBuilder.createType) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.dropType(name, option, next)](#QueryBuilder.dropType) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createAssertion(name, assertion, next)](#QueryBuilder.createAssertion) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createDomain(name, options, next)](#QueryBuilder.createDomain) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createView(name, options, next)](#QueryBuilder.createView) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.dropView(name, next)](#QueryBuilder.dropView) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createRoles(names, next)](#QueryBuilder.createRoles) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.dropRoles(names, options, next)](#QueryBuilder.dropRoles) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.createCursor(name, expresion, options, next)](#QueryBuilder.createCursor) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
        * _DML_
            * [.insert(table, values, cols, next)](#QueryBuilder.insert) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.update(table, sets, next)](#QueryBuilder.update) ÔçÆ [<code>Promise.&lt;QueryBuilder&gt;</code>](#QueryBuilder)
            * [.delete(from, next)](#QueryBuilder.delete) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
        * _DQL_
            * [.select(columns, options, next)](#QueryBuilder.select) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.checkFrom(tables, alias)](#QueryBuilder.checkFrom)
            * [.from(tables, alias, next)](#QueryBuilder.from) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.where(predicados, next)](#QueryBuilder.where) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.groupBy(columns, options, next)](#QueryBuilder.groupBy) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.having(predicado, options, next)](#QueryBuilder.having) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.orderBy(columns, next)](#QueryBuilder.orderBy) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.orderBy(columns, next)](#QueryBuilder.orderBy) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.limit(limit, next)](#QueryBuilder.limit) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
        * _Functions_
            * [.substr(column, inicio, [longitud], next)](#QueryBuilder.substr) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
        * _General_
            * [.driver(driverClass, params)](#QueryBuilder.driver) ÔçÆ <code>next</code>
            * [.use(database, next)](#QueryBuilder.use) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.on(condition, next)](#QueryBuilder.on) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.union(selects)](#QueryBuilder.union) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.unionAll(selects)](#QueryBuilder.unionAll) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.except(selects)](#QueryBuilder.except) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.exceptAll(selects)](#QueryBuilder.exceptAll) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.on(predicado, next)](#QueryBuilder.on) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.col(name, [table])](#QueryBuilder.col) ÔçÆ <code>Column</code>
            * [.exp(expresion)](#QueryBuilder.exp) ÔçÆ <code>Expresion</code>
            * [.offset(offset, next)](#QueryBuilder.offset) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.case(column, casos, defecto, next)](#QueryBuilder.case) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.functionDate()](#QueryBuilder.functionDate) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.execute([testOnly])](#QueryBuilder.execute) ÔçÆ [<code>Promise.&lt;QueryBuilder&gt;</code>](#QueryBuilder)
        * _Predicates_
            * [.using(columnsInCommon, next)](#QueryBuilder.using) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.intersect(selects)](#QueryBuilder.intersect) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.intersectAll(selects)](#QueryBuilder.intersectAll) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.in(columna, values, next)](#QueryBuilder.in) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.notIn(columna, values, next)](#QueryBuilder.notIn) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.coltn(table, name)](#QueryBuilder.coltn) ÔçÆ <code>Column</code>
            * [.openCursor(name, next)](#QueryBuilder.openCursor) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.closeCursor(name, next)](#QueryBuilder.closeCursor) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.setConstraints(restrictions, type, next)](#QueryBuilder.setConstraints) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
            * [.toString([options])](#QueryBuilder.toString) ÔçÆ <code>Promise.&lt;string&gt;</code>
        * _Transactions_
            * [.setTransaction(options)](#QueryBuilder.setTransaction) ÔçÆ <code>Transaction</code>
        * _Utilities_
            * [.thread(id)](#QueryBuilder.thread) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)

<a name="new_QueryBuilder_new"></a>

#### new QueryBuilder(language, [options])
Clase principal QueryBuilder que proporciona una API fluida para construir y ejecutar consultas de base de datos.
Delega la sintaxis SQL/NoSQL a adaptadores de lenguaje (MySQL, PostgreSQL, MongoDB, etc.) derivados de la clase Core.
Soporta construcci├│n y ejecuci├│n de consultas, gesti├│n de conexiones, transacciones y cursores usando clases drivers derivadas de la clase Driver.
Soporta m├║ltiples paradigmas de base de datos (SQL, NoSQL, Vector, En-Memoria).

**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - Instancia de QueryBuilder para encadenar m├®todos  

| Param | Type | Description |
| --- | --- | --- |
| language | <code>Core</code> | Clase de lenguaje (adaptador SQL/NoSQL) derivada de Core |
| [options] | <code>queryBuilderOptions</code> | Opciones de configuraci├│n para QueryBuilder |

<a name="QueryBuilder+result"></a>

#### queryBuilder.result
Getter y setter para querybuilder

**Kind**: instance property of [<code>QueryBuilder</code>](#QueryBuilder)  
<a name="QueryBuilder.grant"></a>

#### QueryBuilder.grant(privilegios, on, to, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Otorga permisos a usuarios o roles sobre objetos de la base de datos.
Permite asignar permisos a usuarios.
- PostgreSQL	Ô£à	Permite permisos detallados a nivel de columna, tabla y esquema.
- MySQL				Ô£à	Usa GRANT junto con WITH GRANT OPTION para permitir reasignar permisos.
- SQL Server	Ô£à	Tambi├®n usa DENY y REVOKE para revocar permisos.
- Oracle			Ô£à	Soporta permisos sobre tablas, roles, procedimientos y secuencias.
- SQLite			ÔØî No maneja usuarios ni permisos a nivel SQL.
- MongoDB			Ô£à	grantRolesToUser()	Permite asignar roles con permisos espec├¡ficos.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
qb.revoke('SELECT', 'users', 'admin');
// Resultado esperado: { success: true, granted: 'SELECT', on: 'users', to: 'admin' }
```
<a name="QueryBuilder.revoke"></a>

#### QueryBuilder.revoke(privilegios, on, from, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Revoca permisos previamente otorgados a usuarios o roles sobre objetos de la base de datos.
Se utiliza para eliminar permisos previamente otorgados a usuarios,
restringiendo el acceso a objetos como tablas, vistas y esquemas.
- PostgreSQL	Ô£à S├¡	Permite revocar permisos de usuarios y roles sobre tablas, esquemas y columnas.
- MySQL				Ô£à S├¡	Se usa junto con GRANT para administrar permisos.
- SQL Server	Ô£à S├¡	Adem├ís, permite DENY para bloquear permisos espec├¡ficos.
- Oracle			Ô£à S├¡	Puede revocar permisos de usuarios y roles sobre objetos de la base de datos.
- SQLite			ÔØî No	No maneja usuarios ni permisos a nivel SQL.
- MongoDB			Ô£à	revokeRolesFromUser()	Permite eliminar roles previamente asignados a un usuario.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
qb.revoke('SELECT', 'users', 'admin');
// Resultado esperado: { success: true, revoked: 'SELECT', on: 'users', from: 'admin' }
```
<a name="QueryBuilder.grantRoles"></a>

#### QueryBuilder.grantRoles(roles, users, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Como grant pero solo para roles

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
qb.grantRoles('editor', 'john_doe');
// Resultado esperado: { success: true, granted: 'editor', to: 'john_doe' }
```
<a name="QueryBuilder.revokeRoles"></a>

#### QueryBuilder.revokeRoles(roles, from, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Como revoke, pero para roles

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
qb.revokeRoles('editor', 'john_doe');
// Resultado esperado: { success: true, revoked: 'editor', from: 'john_doe' }
```
<a name="QueryBuilder.createDatabase"></a>

#### QueryBuilder.createDatabase(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea una base de datos dentro del servidor (SGBD)

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la base de datos |
| options | <code>Object</code> | Opciones para la creacion de datos |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createDatabase('mydb', { ifNotExists: true });
	// Resultado esperado: { success: true, database: 'mydb' }
```
<a name="QueryBuilder.dropDatabase"></a>

#### QueryBuilder.dropDatabase(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Elimina una base de datos del servidor (SGBD)

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre de la base de datos |
| options | <code>Object</code> | Opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.dropDatabase('mydb');
	// Resultado esperado: { success: true, database: 'mydb' }
```
<a name="QueryBuilder.createSchema"></a>

#### QueryBuilder.createSchema(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea un "esquema" o "tabla" de nombres para organizar objetos de base de datos

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
<a name="QueryBuilder.dropSchema"></a>

#### QueryBuilder.dropSchema(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Elimina un esquema de la base de datos

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre del esquema |
| options | <code>Object</code> | Opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

<a name="QueryBuilder.createTable"></a>

#### QueryBuilder.createTable(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea una nueva tabla con el nombre y las opciones especificadas en la base de datos actual.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | El nombre de la tabla. |
| options | <code>Object</code> | Opciones de configuraci├│n para la tabla. |
| options.cols | <code>Object</code> | Objeto donde cada clave es el nombre de la columna. |
| options.cols[].column | <code>type</code> \| <code>column</code> | columna name:<string|column> |
| [options.temporary] | <code>GLOBAL</code> \| <code>LOCAL</code> | GLOBAL|LOCAL. |
| [options.onCommit] | <code>PRESERVE</code> \| <code>DELETE</code> | ON COMMIT PRESERVE|DELETE |
| next | <code>object</code> | Objeto recibido por el comando anterior |

<a name="QueryBuilder.alterTable"></a>

#### QueryBuilder.alterTable(name, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Modifica una tabla existente

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la tabla |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.alterTable('mytable', { addColumn: 'new_column' });
```
<a name="QueryBuilder.alterTableComands"></a>

#### QueryBuilder.alterTableComands(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Define los comandos que modifican la estructura de las columnas de la tabla actual.
"addColumn" a├▒ade una columna
"alterColumn" modifica una columna existente
"dropColumn" elimina una columna
y "addConstraint" a├▒ade una restricci├│n
Estos comandos deben ser llamados despu├®s de un "alterTable" donde se especifica la tabla a modificar.
cada uno recibe tres parametros:

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre de la columna |
| options | <code>Object</code> | opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.alterTable('mytable')
  .addColumn('new_column', { type: 'VARCHAR(255)', notNull: true })
  .alterColumn('existing_column', { type: 'INT' })
  .dropColumn('old_column')
  .addConstraint('pk_mytable', { type: 'PRIMARY KEY', columns: ['id'] });
```
<a name="QueryBuilder.dropTable"></a>

#### QueryBuilder.dropTable(name, option, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Elimina una tabla de la base de datos actual

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
<a name="QueryBuilder.createType"></a>

#### QueryBuilder.createType(name, option, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea un tipo definido por el usuario en la base de datos actual

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
<a name="QueryBuilder.dropType"></a>

#### QueryBuilder.dropType(name, option, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Elimina un tipo definido por el usuario

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
<a name="QueryBuilder.createAssertion"></a>

#### QueryBuilder.createAssertion(name, assertion, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Permite crear una restricci├│n a nivel de base de datos.
Es una caracter├¡stica del
SQL est├índar (SQL-92 y SQL:2006) que permite definir restricciones a nivel de base de datos.
Sirve para imponer condiciones que no pueden expresarse f├ícilmente con restricciones en columnas (CHECK) o en tablas (FOREIGN KEY).
No est├í implementado en MySQL ni en PostgreSQL.
- SQL est├índar	Ô£à
- PostgreSQL		ÔØî
- MySQL				ÔØî
En su lugar, se pueden usar triggers (BEFORE INSERT/UPDATE/DELETE) o funciones con restricciones CHECK a nivel de tabla.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre |
| assertion | <code>object</code> | opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createAssertion('positive_balance', {
  check: 'balance > 0'
});
```
<a name="QueryBuilder.createDomain"></a>

#### QueryBuilder.createDomain(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Permite definir tipos de datos personalizados con restricciones.
Es ├║til para reutilizar reglas de validaci├│n en m├║ltiples tablas sin repetir c├│digo.
- SQL est├índar	Ô£à
- PostgreSQL		Ô£à
- MySQL				ÔØî

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del dominio |
| options | <code>Object</code> | Opciones aplicables |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createDomain('mydomain', {
  type: 'text',
  constraints: {
    notNull: true
  }
});
```
<a name="QueryBuilder.createView"></a>

#### QueryBuilder.createView(name, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Permite definir una consulta almacenada como un objeto de la base de datos.
Se comporta como una 'tabla virtual', mostrando datos obtenidos de una o varias tablas sin duplicarlos.

- PostgreSQL	Ô£à	Soporta vistas materializadas con "REFRESH MATERIALIZED VIEW"
- MySQL			Ô£à	Soporta vistas pero no vistas materializadas
- SQL Server	Ô£à	Soporta vistas indexadas para mejorar rendimiento
- SQLite			ÔØî	No permite vistas materializadas ni indexadas
- Oracle			Ô£à	Soporta vistas normales y materializadas

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | nombre de la vista |
| options | <code>object</code> | opciones aplicables {cols:Array<string>, as:Select, check:boolean} |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createView('myview', {
  cols: ['id', 'name'],
  as: qb.select().from('mytable'),
  check: true
});
```
<a name="QueryBuilder.dropView"></a>

#### QueryBuilder.dropView(name, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Elimina una vista creada previamente
- PostgreSQL	Ô£à
- MySQL			Ô£à

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre de la vista |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.dropView('myview');
```
<a name="QueryBuilder.createRoles"></a>

#### QueryBuilder.createRoles(names, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crear un nuevo rol en la base de datos.
Un rol es una entidad que puede representar a un usuario o un grupo de usuarios y
puede recibir permisos para acceder a ciertos recursos.
- PostgreSQL	Ô£à Maneja roles en lugar de usuarios individuales
- MySQL				Ô£à (Desde 8.0)	Se complementa con "GRANT" para asignar permisos
- SQL Server	Ô£à Se usa "CREATE ROLE" pero los usuarios son "entidades separadas"
- SQLite			ÔØî No soporta roles ni usuarios
- Oracle			Ô£à Soporta roles con permisos avanzados
- MongoDB			Ô£à	Usando "createRole" y "db.createUser"

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>string</code> \| <code>Array.&lt;string&gt;</code> | nombre o nombres de roles a crear |
| options.admin | <code>&quot;CURRENT\_USER&quot;</code> \| <code>&quot;CURRENT\_ROLE&quot;</code> | WITH ADMIN |
| options.ifNotExists | <code>boolean</code> | IF NOT EXISTS |
| next | <code>object</code> |  |

**Example**  
```js
qb.createRoles(['admin', 'editor'], { ifNotExists: true });
// Resultado esperado: { success: true, roles: ['admin', 'editor'] }
```
<a name="QueryBuilder.dropRoles"></a>

#### QueryBuilder.dropRoles(names, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Elimina el rol o roles especificados de la base de datos.
- PostgreSQL	Ô£à
- MySQL				Ô£à (Desde 8.0)

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>string</code> \| <code>Array.&lt;string&gt;</code> | uno o varios roles a eliminar |
| options | <code>object</code> | opciones aplicables |
| options.ifExists | <code>boolean</code> | IF EXISTS |
| options.cascade | <code>boolean</code> | "CASCADE"/"RESTRICT" |
| options.restrict | <code>boolean</code> | "RESTRICT"/"CASCADE" |
| next | <code>object</code> |  |

<a name="QueryBuilder.createCursor"></a>

#### QueryBuilder.createCursor(name, expresion, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea un nuevo cursor para la consulta actual.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DDL  
**Throws**:

- <code>Error</code> Cuando los par├ímetros no coinciden con los tipos esperados


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Nombre del cursor |
| expresion | <code>string</code> | Expresi├│n SQL para el cursor |
| options | <code>object</code> | Opciones adicionales para el cursor |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
qb.createCursor('myCursor', 'SELECT * FROM users', {}, {});
// Resultado: DECLARE myCursor CURSOR FOR SELECT * FROM users;
```
<a name="QueryBuilder.insert"></a>

#### QueryBuilder.insert(table, values, cols, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Inserta datos en una tabla especificada.
Crea una instrucci├│n INSERT INTO con valores y especificaci├│n opcional de columnas.
Se usa para agregar nuevas filas en una tabla.
Puede insertar valores manualmente o desde el resultado de otra consulta.
PostgreSQL	Ô£à S├¡	Soporta INSERT ... RETURNING para obtener valores insertados.
MySQL			Ô£à S├¡	Permite INSERT IGNORE y ON DUPLICATE KEY UPDATE para manejar duplicados.
SQL Server	Ô£à S├¡	Compatible con INSERT INTO ... OUTPUT.
Oracle			Ô£à S├¡	Usa INSERT ... RETURNING INTO para recuperar valores insertados.
SQLite			Ô£à S├¡	Admite INSERT OR REPLACE y INSERT OR IGNORE.
MongoDB	insertOne(), insertMany()	insertOne() agrega un solo documento, insertMany() varios a la vez.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DML  
**Throws**:

- <code>Error</code> Cuando los par├ímetros no coinciden con los tipos esperados


| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | nombre de la tabla |
| values | <code>array.&lt;array.&lt;Value&gt;&gt;</code> | Array de Arrays con los valores |
| cols | <code>array.&lt;Column&gt;</code> | columnas correspondientes al orden de los valores o vacio para el orden por defecto |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Inserci├│n simple
await qb.insert('users', [
  ['Alice', 'alice@example.com'],
  ['Bob', 'bob@example.com']
]);
// Inserci├│n con columnas especificadas
await qb.insert('users', [
  ['Charlie', 'charlie@example.com']
], ['name', 'email']);
```
<a name="QueryBuilder.update"></a>

#### QueryBuilder.update(table, sets, next) ÔçÆ [<code>Promise.&lt;QueryBuilder&gt;</code>](#QueryBuilder)
Crea la sentencia UPDATE con cl├íusula SET para la tabla especificada

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>Promise.&lt;QueryBuilder&gt;</code>](#QueryBuilder) - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DML  
**Throws**:

- <code>Error</code> Cuando los par├ímetros no coinciden con los tipos esperados


| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | Nombre de la tabla objetivo para actualizar |
| sets | <code>Object</code> | Objeto con pares columna-valor para actualizar |
| next | <code>object</code> | Objeto que retorna promesa para el contexto de encadenamiento |

**Example**  
```js
// Actualizaci├│n simple
qb.update('users', { status: 'active', last_login: new Date() })
        .where('id = 1')
			 .toString(); // UPDATE users SET status = 'active', last_login = '2023-10-05 12:34:56' WHERE id = 1;

// Actualizar con condiciones
qb.update('products', { price: 19.99, discount: 10 })
        .where('category = "electronics"')
        .toString(); // UPDATE products SET price = 19.99, discount = 10 WHERE category = 'electronics';
```
<a name="QueryBuilder.delete"></a>

#### QueryBuilder.delete(from, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea la sentencia DELETE FROM para eliminar datos

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DML  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | Nombre de la tabla de la cual eliminar registros |
| next | <code>object</code> | Objeto que retorna promesa para el contexto de encadenamiento |

**Example**  
```js
// Eliminar registros espec├¡ficos
qb.delete('users')
        .where('active = 0')
        .toString(); // DELETE FROM users WHERE active = 0;

// Eliminar con condiciones complejas
qb.delete('logs')
        .where('created_at < "2023-01-01"')
        .toString(); // DELETE FROM logs WHERE created_at < '2023-01-01';
```
<a name="QueryBuilder.select"></a>

#### QueryBuilder.select(columns, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea declaraci├│n SELECT para recuperaci├│n de datos
Genera cl├íusula SQL SELECT con columnas y opciones especificadas
SELECT [ DISTINCT | ALL ] { * | < selecci├│n de lista > }

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  

| Param | Type | Description |
| --- | --- | --- |
| columns | <code>string</code> \| <code>Column</code> \| <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Column&gt;</code> | Columnas seleccionadas |
| options | <code>object</code> | opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
SELECT columna1, columna2 FROM tabla;
// Seleccionar todas las columnas
qb.select('*').from('users');

// Seleccionar columnas espec├¡ficas
qb.select(['name', 'email']).from('users');

// Seleccionar con DISTINCT
qb.select('category', { distinct: true }).from('products');
```
<a name="QueryBuilder.checkFrom"></a>

#### QueryBuilder.checkFrom(tables, alias)
Comprueba en tiempo de ejecucion que los tipos de "tables" corresponden con los de "alias"
y que la longitud de los arrays sea la correcta.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Category**: DQL  
**Throws**:

- <code>Error</code> Si los tipos o longitudes no coinciden


| Param | Type | Description |
| --- | --- | --- |
| tables | <code>string</code> \| <code>Array.&lt;string&gt;</code> | tabla o lista de tablas |
| alias | <code>string</code> \| <code>Array.&lt;string&gt;</code> | alias o lista de alias |

**Example**  
```js
checkFrom("tabla", "t");
checkFrom(["tabla1", "tabla2"], ["t1", "t2"]);
checkFrom("tabla", ["t1", "t2"]); // Error
checkFrom(["tabla1", "tabla2"], "t1"); // Error
checkFrom(["tabla1", "tabla2"], ["t1"]); // Error
checkFrom("tabla", "t1", "t2"); // Error
checkFrom(["tabla1", "tabla2"], ["t1", "t2", "t3"]); // V├ílido
```
<a name="QueryBuilder.from"></a>

#### QueryBuilder.from(tables, alias, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Especifica la tabla o vista de donde se van a obtener los datos.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  

| Param | Type | Description |
| --- | --- | --- |
| tables | <code>string</code> \| <code>Array.&lt;string&gt;</code> | tabla o tablas de donde obtener los datos |
| alias | <code>string</code> \| <code>Array.&lt;string&gt;</code> | alias o lista de alias correspondiente a las tablas |
| next | <code>object</code> |  |

**Example**  
```js
// Ejemplos v├ílidos
qb.from("users", "u");
qb.from(["users", "orders"], ["u", "o"]);
qb.from("users");
qb.from(["users", "orders"]);
// Errores
qb.from("users", ["u", "o"]); // Error
qb.from(["users", "orders"], "u"); // Error
qb.from(["users", "orders"], ["u"]); // Error
qb.from("users", "u", "o"); // Error
qb.from(["users", "orders"], ["u", "o", "x"]); // V├ílido
```
<a name="QueryBuilder.where"></a>

#### QueryBuilder.where(predicados, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Define la condici├│n WHERE para filtrar registros en una consulta SQL.
Soporta cadenas SQL, instancias de QueryBuilder o arrays de condiciones.
Filtrar registros en una consulta, seleccionando solo aquellos que cumplen con una condici├│n espec├¡fica.
Es una parte esencial en las sentencias SELECT, UPDATE, DELETE, etc., ya que permite limitar los resultados
o modificar solo las filas que cumplen con ciertos criterios.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  

| Param | Type | Description |
| --- | --- | --- |
| predicados | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) \| <code>Array.&lt;(string\|QueryBuilder)&gt;</code> | Condiciones del WHERE (cadena, expresi├│n QB o array) |
| next | <code>object</code> | Instancia de QueryBuilder para el contexto de encadenamiento de m├®todos |

**Example**  
```js
qb.select('*').from('users').where('age > 18');
qb.select('*').from('users').where(qb.and(qb.eq('active', 1), qb.gt('age', 18)));
qb.update('users', { status: 'inactive' }).where('last_login < "2023-01-01"');
```
<a name="QueryBuilder.groupBy"></a>

#### QueryBuilder.groupBy(columns, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando GROUP BY en SQL se utiliza para agrupar filas que tienen el mismo valor en una o m├ís columnas,
permitiendo realizar c├ílculos agregados (COUNT, SUM, AVG, MAX, MIN, etc.) sobre cada grupo.
PostgreSQL	Ô£à S├¡	Soporta GROUP BY con m├║ltiples columnas y funciones agregadas.
MySQL			Ô£à S├¡	Compatible con GROUP BY, pero en versiones antiguas permit├¡a resultados ambiguos sin ONLY_FULL_GROUP_BY.
SQL Server	Ô£à S├¡	Funciona con agregaciones y permite GROUPING SETS.
Oracle			Ô£à S├¡	Compatible y soporta extensiones como ROLLUP y CUBE.
SQLite			Ô£à S├¡	Soporta GROUP BY, pero con ciertas limitaciones en comparaci├│n con otras bases de datos.
MongoDB	$group	En el pipeline de agregaci├│n, $group permite agrupar documentos y aplicar operaciones agregadas.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
qb.select('columna1, columna2, COUNT(*) as total')
  .from('tabla')
 .groupBy(['columna1', 'columna2']);
// Resultado: SELECT columna1, columna2, COUNT(*) as total FROM tabla GROUP BY columna1, columna2;

// Usando ROLLUP
qb.select('columna1, columna2, SUM(columna3) as total')
  .from('tabla')
  .groupBy({ rollup: [qb.col('columna1'), qb.col('columna2')] });
// Resultado: SELECT columna1, columna2, SUM(columna3) as total FROM tabla GROUP BY ROLLUP (columna1, columna2);

// Usando CUBE
qb.select('columna1, columna2, AVG(columna3) as promedio')
  .from('tabla')
  .groupBy({ cube: [qb.col('columna1'), qb.col('columna2')] });
// Resultado: SELECT columna1, columna2, AVG(columna3) as promedio FROM tabla GROUP BY CUBE (columna1, columna2);
```
<a name="QueryBuilder.having"></a>

#### QueryBuilder.having(predicado, options, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando HAVING en SQL se usa para filtrar los resultados despu├®s de aplicar GROUP BY,
permitiendo restringir los grupos basados en condiciones sobre funciones agregadas
(COUNT, SUM, AVG, MAX, MIN, etc.).
PostgreSQL	Ô£à S├¡	Funciona con GROUP BY para filtrar resultados agrupados.
MySQL			Ô£à S├¡	Compatible con todas las versiones, usado para restricciones en funciones agregadas.
SQL Server	Ô£à S├¡	Soporta HAVING con agregaciones y expresiones condicionales.
Oracle			Ô£à S├¡	Funciona de la misma manera que en SQL est├índar.
SQLite			Ô£à S├¡	Compatible con HAVING, pero con algunas limitaciones en expresiones m├ís avanzadas.
MongoDB	$group seguido de $match.	Primero se agrupan los documentos con $group, luego se filtran los resultados con $match.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando no hay un comando SELECT previo


| Param | Type | Description |
| --- | --- | --- |
| predicado | <code>strict</code> \| [<code>QueryBuilder</code>](#QueryBuilder) | expresion que utiliza el having |
| options | <code>object</code> | opciones |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Cl├íusula HAVING simple
let qb = new QueryBuilder()
qb.having(qb.and(qb.gt(qb.sum("Columna3"),100)),qb.gt(qb.count("*"),2))
HAVING SUM(columna3) > 100 AND COUNT(*) > 2;
```
<a name="QueryBuilder.orderBy"></a>

#### QueryBuilder.orderBy(columns, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando ORDER BY en SQL se utiliza para ordenar los resultados de una consulta seg├║n una o m├ís columnas,
en orden ascendente (ASC) o descendente (DESC).
PostgreSQL	Ô£à S├¡	Soporta ORDER BY con m├║ltiples columnas y direcciones de ordenamiento.
MySQL			Ô£à S├¡	Permite ordenar por columnas, expresiones y alias definidos en SELECT.
SQL Server	Ô£à S├¡	Compatible con funciones como TOP y OFFSET FETCH.
Oracle			Ô£à S├¡	Soporta ORDER BY junto con ROWNUM y FETCH FIRST.
SQLite			Ô£à S├¡	Compatible, pero puede tener restricciones en combinaciones avanzadas.
MongoDB	sort() o $sort	sort() se usa en consultas, y $sort en pipelines de agregaci├│n.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
// Ordenamiento simple
qb.select('*').from('users').orderBy([{col: 'name', order: 'ASC'}]);

// Ordenamiento de m├║ltiples columnas
qb.select('*').from('users').orderBy([
  {col: 'department', order: 'ASC'}, 
  {col: 'salary', order: 'DESC'}
]);
```
<a name="QueryBuilder.orderBy"></a>

#### QueryBuilder.orderBy(columns, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando ORDER BY en SQL se utiliza para ordenar los resultados de una consulta seg├║n una o m├ís columnas,
en orden ascendente (ASC) o descendente (DESC).
PostgreSQL	Ô£à S├¡	Soporta ORDER BY con m├║ltiples columnas y direcciones de ordenamiento.	
MySQL			Ô£à S├¡	Permite ordenar por columnas, expresiones y alias definidos en SELECT.
SQL Server	Ô£à S├¡	Compatible con funciones como TOP y OFFSET FETCH.
Oracle			Ô£à S├¡	Soporta ORDER BY junto con ROWNUM y FETCH FIRST.
SQLite			Ô£à S├¡	Compatible, pero puede tener restricciones en combinaciones avanzadas.
MongoDB	sort() o $sort	sort() se usa en consultas, y $sort en pipelines de agregaci├│n.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando se llama sin una sentencia SELECT previa


| Param | Type | Description |
| --- | --- | --- |
| columns | <code>Array.&lt;Object&gt;</code> \| <code>string</code> | Column specification(s) for ordering |
| columns.col | <code>string</code> | Nombre de la columna por la cual ordenar |
| columns.order | <code>&quot;ASC&quot;</code> \| <code>&quot;DESC&quot;</code> | Orden de clasificaci├│n (ascendente o descendente) |
| next | <code>object</code> | Objeto que retorna promesa para el contexto de encadenamiento |

**Example**  
```js
// Ordenamiento simple
qb.select('*').from('users').orderBy([{col: 'name', order: 'ASC'}]);

// Ordenamiento de m├║ltiples columnas
qb.select('*').from('users').orderBy([
  {col: 'department', order: 'ASC'}, 
  {col: 'salary', order: 'DESC'}
]);
```
<a name="QueryBuilder.limit"></a>

#### QueryBuilder.limit(limit, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Se usa para restringir la cantidad de filas devueltas por una consulta.
Es ├║til para paginaci├│n y optimizaci├│n de rendimiento cuando solo se necesitan un n├║mero espec├¡fico de registros.
PostgreSQL	Ô£à S├¡	LIMIT y OFFSET funcionan para paginaci├│n.
MySQL			Ô£à S├¡	Soporta LIMIT con OFFSET para paginaci├│n.
SQL Server	ÔØî No	Se usa TOP n o OFFSET FETCH NEXT en su lugar.
Oracle			ÔØî No	Usa FETCH FIRST n ROWS ONLY para limitar resultados.
SQLite			Ô£à S├¡	Compatible con LIMIT y OFFSET.
MongoDB	limit(n)	Se usa junto con skip(n) para paginaci├│n, similar a LIMIT ... OFFSET.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: DQL  
**Throws**:

- <code>Error</code> Cuando limit no es un entero positivo o no existe una instrucci├│n SELECT


| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | numero de elementos a mostrar |
| next | <code>object</code> | objeto para el contexto de encadenamiento |

**Example**  
```js
// Obtener los primeros 10 usuarios
qb.select('*').from('users').limit(10);
// Resultado: SELECT * FROM users LIMIT 10;
```
<a name="QueryBuilder.substr"></a>

#### QueryBuilder.substr(column, inicio, [longitud], next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea una funci├│n SQL SUBSTR para extraer una subcadena de una cadena dada.
Permite especificar la columna, posici├│n inicial y longitud opcional de la subcadena.
├Ütil para manipulaci├│n de cadenas en consultas SQL.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Functions  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>Column</code> | columna sobre la que se aplica la funci├│n |
| inicio | <code>number</code> | posici├│n inicial de la subcadena |
| [longitud] | <code>number</code> | longitud de la subcadena (opcional) |
| next | <code>object</code> | objeto recibido por el comando anterior |

**Example**  
```js
qb.substr('nombre', 1, 3) // SUBSTR(nombre, 1, 3)
```
<a name="QueryBuilder.driver"></a>

#### QueryBuilder.driver(driverClass, params) ÔçÆ <code>next</code>
Instancia y configura el Driver para la base de datos que ejecutara los comandos

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: <code>next</code> - next - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| driverClass | <code>Driver</code> | Clase del controlador de base de datos (MySqlDriver, PostgreSQLDriver, etc.) |
| params | <code>DatabaseConfig</code> | Par├ímetros de conexi├│n y configuraci├│n del controlador |

**Example**  
```js
import MySQL from '@querybuilder/mysql';
import config from './config.js';
const mysql= config.MYSQL; // importa configuraci├│n de la base de datos
const qb = new QueryBuilder(MySQL); // creaci├│n de instancia QueryBuilder
qb.driver(mysql.driver, mysql.params); // configuraci├│n del driver
//Prueba de la conexi├│n
qb.driver(mysql.driver, mysql.params)
  .testConnection()
	.then((res) => console.log('Conexi├│n exitosa:', res))
```
<a name="QueryBuilder.use"></a>

#### QueryBuilder.use(database, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Gestiona el cambio de base de datos dentro del mismo servidor (SGBD)

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| database | <code>string</code> | Nombre de la base de datos |
| next | <code>next</code> | Objeto recibido por el comando anterior |

<a name="QueryBuilder.on"></a>

#### QueryBuilder.on(condition, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Especifica la condici├│n de uni├│n para un JOIN.
Se utiliza para definir c├│mo se combinan las filas de dos tablas en una operaci├│n JOIN.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  
**Throws**:

- <code>Error</code> Si el comando previo no es un JOIN v├ílido


| Param | Type | Description |
| --- | --- | --- |
| condition | <code>string</code> | Condici├│n de uni├│n |
| next | <code>object</code> |  |

**Example**  
```js
qb.select('*').from('tabla1').join('tabla2').on('tabla1.id = tabla2.id');
qb.select('*').from('tabla1').innerJoin('tabla2').on('tabla1.id = tabla2.id');
// Errores
qb.select('*').from('tabla1').where('condicion').on('tabla1.id = tabla2.id'); // Error
```
<a name="QueryBuilder.union"></a>

#### QueryBuilder.union(selects) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
SQL Server	Ô£à S├¡	Soporta ambas opciones UNION y UNION ALL.
Oracle			Ô£à S├¡	Permite UNION y UNION ALL para combinar resultados de varias consultas.
SQLite			Ô£à S├¡	Soporta UNION y UNION ALL en consultas SELECT.
MongoDB	$unionWith	Permite combinar los resultados de dos colecciones en una agregaci├│n.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) | Selects a unir |

<a name="QueryBuilder.unionAll"></a>

#### QueryBuilder.unionAll(selects) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Combinar los resultados de dos o m├ís consultas SELECT.
Incluyendo duplicados.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) | Selects a unir por UNION ALL |

**Example**  
```js
qb.unionAll(select1, select2);
```
<a name="QueryBuilder.except"></a>

#### QueryBuilder.except(selects) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando EXCEPT se utiliza para obtener los registros que est├ín en la primera consulta, pero no en la segunda.
Este comando elimina los duplicados por defecto, retornando solo los registros ├║nicos que existen
en la primera consulta y no en la segunda.
PostgreSQL	Ô£à Soporta EXCEPT para obtener registros de la primera consulta que no est├®n en la segunda.
MySQL			ÔØî No soporta EXCEPT, pero se puede emular utilizando LEFT JOIN o NOT EXISTS.
SQL Server	Ô£à Soporta EXCEPT para obtener diferencias entre dos conjuntos de resultados.
Oracle			Ô£à Soporta EXCEPT para encontrar registros que est├ín en la primera consulta pero no en la segunda.
SQLite			ÔØî No tiene soporte nativo para EXCEPT, pero se puede simular con LEFT JOIN o NOT EXISTS.
MongoDB	$lookup con $match y $project	Se puede emular EXCEPT mediante un lookup para combinar colecciones y luego excluir los registros coincidentes.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) | Selects |

**Example**  
```js
qb.except(select1, select2);
```
<a name="QueryBuilder.exceptAll"></a>

#### QueryBuilder.exceptAll(selects) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando EXCEPT ALL es una variante de EXCEPT que, a diferencia de EXCEPT,
mantiene los duplicados en el resultado.
Es decir, devuelve todas las filas que est├ín en la primera consulta, pero no en la segunda, y mantiene las repeticiones de esas filas.
PostgreSQL	Ô£à Soporta EXCEPT ALL para obtener las filas que est├ín en la primera consulta, pero no en la segunda, manteniendo duplicados.
MySQL			ÔØî No soporta EXCEPT ALL, pero puede emularse utilizando LEFT JOIN o NOT EXISTS.
SQL Server	ÔØî No soporta EXCEPT ALL, aunque se puede simular con GROUP BY y HAVING.
Oracle			ÔØî No tiene soporte nativo para EXCEPT ALL.
SQLite			ÔØî No soporta EXCEPT ALL, pero puede emularse con LEFT JOIN o NOT EXISTS.
MongoDB	$lookup con $group y $match	Se pueden combinar colecciones y luego filtrar los resultados para mantener duplicados.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type |
| --- | --- |
| selects | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) | 

**Example**  
```js
qb.exceptAll(select1, select2);
```
<a name="QueryBuilder.on"></a>

#### QueryBuilder.on(predicado, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Operaciones de JOIN para especificar las condiciones de c├│mo se deben combinar las tablas.
Define las columnas o condiciones que se deben cumplir para que filas de diferentes tablas sean combinadas.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| predicado | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) |  |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
SELECT columna1, columna2
FROM tabla1
JOIN tabla2
ON tabla1.columna = tabla2.columna;
```
<a name="QueryBuilder.col"></a>

#### QueryBuilder.col(name, [table]) ÔçÆ <code>Column</code>
Crea una instancia de Column para referenciar columnas en consultas SQL.
Permite especificar el nombre de la columna y opcionalmente el nombre o alias de la tabla.
Facilita la construcci├│n de consultas SQL tipadas y con contexto de tabla.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: <code>Column</code> - Instancia de Column para su uso en consultas  
**Category**: General  
**Throws**:

- <code>Error</code> Cuando los par├ímetros no coinciden con los tipos esperados


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) \| <code>Expresion</code> | Puede ser el nombre de la columna, una subconsulta o una expresion |
| [table] | <code>string</code> | Nombre de la tabla o alias para la columna |

**Example**  
```js
// Referencia simple de columna
const userCol = qb.col('name', 'users'); // users.name

// Use in queries
qb.select([qb.col('name', 'u'), qb.col('email', 'u')]) // SELECT u.name, u.email
  .from('users', 'u')
  .where(qb.eq(qb.col('active', 'u'), 1)); // WHERE u.active = 1
// Subconsulta como columna
const subQb = new QueryBuilder().select('COUNT(*)').from('orders').where(qb.eq(qb.col('user_id'), qb.col('id', 'u')));
const orderCountCol = qb.col(subQb, 'u'); // (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
```
<a name="QueryBuilder.exp"></a>

#### QueryBuilder.exp(expresion) ÔçÆ <code>Expresion</code>
Crea una instancia de expresion para usar en consultas SQL.
Permite incluir expresiones SQL complejas o funciones agregadas en consultas.
Facilita la construcci├│n de consultas SQL din├ímicas y avanzadas.
usando el metodo as() de la clase Expresion se puede asignar un alias a la expresion

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: <code>Expresion</code> - expresion.value = expresion  
**Category**: General  

| Param | Type |
| --- | --- |
| expresion | <code>any</code> | 

**Example**  
```js
┬┤┬┤javascript
let qb = new QueryBuilder()
qb.exp("count(*)") // count(*)
qb.exp("count(*)").as("Total") // count(*) AS Total
qb.exp("sum(*)").as("Total") // sum(*) AS Total
qb.exp("avg(*)").as("Total") // avg(*) AS Total
```
<a name="QueryBuilder.offset"></a>

#### QueryBuilder.offset(offset, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Se usa para omitir un n├║mero espec├¡fico de filas antes de comenzar a devolver resultados.
Se suele combinar con LIMIT para implementar paginaci├│n.
PostgreSQL	Ô£à S├¡	OFFSET y LIMIT permiten paginaci├│n eficiente.
MySQL			Ô£à S├¡	Se usa LIMIT ... OFFSET.
SQL Server	Ô£à S├¡	Usa OFFSET ... FETCH NEXT para paginaci├│n.
Oracle			Ô£à S├¡	Usa OFFSET ... FETCH NEXT en lugar de LIMIT.
SQLite			Ô£à S├¡	Compatible con LIMIT y OFFSET.
MongoDB	skip(n)	Se usa junto con limit(n) para paginaci├│n, similar a OFFSET ... LIMIT.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  
**Throws**:

- <code>Error</code> Cuando offset no es un entero positivo o no existe una instrucci├│n SELECT


| Param | Type | Description |
| --- | --- | --- |
| offset | <code>number</code> | numero de filas que se deben omitir |
| next | <code>object</code> | objeto para el contexto de encadenamiento |

**Example**  
```js
// Obtener los usuarios a partir del usuario 21
qb.select('*').from('users').offset(20);
// Resultado: SELECT * FROM users OFFSET 20;
```
<a name="QueryBuilder.case"></a>

#### QueryBuilder.case(column, casos, defecto, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea una expresi├│n SQL CASE para evaluaciones condicionales.
Permite definir m├║ltiples condiciones y resultados, con un caso por defecto opcional.
├Ütil para l├│gica condicional directamente en consultas SQL.
Sintaxis:
columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>string</code> \| <code>column</code> | columna |
| casos | <code>Array.&lt;column, string&gt;</code> | [condicion, resultado] |
| defecto | <code>string</code> | Caso else |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Expresi├│n CASE simple
qb.case('status', [
  [1, 'Active'],
  [0, 'Inactive']
], 'Unknown'); // CASE status WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' ELSE 'Unknown' END

// Using Column objects
qb.case(column('status'), [
  [1, 'Active'],
  [0, 'Inactive']
], 'Unknown'); // CASE status WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' ELSE 'Unknown' END

// Complex conditions
qb.case(null, [
  [qb.eq('age', 18), 'Adult'],
  [qb.lt('age', 18), 'Minor']
], 'Unknown'); // CASE WHEN age = 18 THEN 'Adult' WHEN age < 18 THEN 'Minor' ELSE 'Unknown' END
```
<a name="QueryBuilder.functionDate"></a>

#### QueryBuilder.functionDate() ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Crea m├®todos para funciones comunes de fecha y hora en SQL.
Genera funciones como CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP, LOCALTIME, LOCALTIMESTAMP.
├Ütil para obtener marcas de tiempo y fechas actuales en consultas SQL.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: General  
**Example**  
```js
qb.currentDate(); // CURRENT_DATE
qb.currentTime(); // CURRENT_TIME
qb.currentTimestamp(); // CURRENT_TIMESTAMP
qb.localTime(); // LOCALTIME
qb.localTimestamp(); // LOCALTIMESTAMP
```
<a name="QueryBuilder.execute"></a>

#### QueryBuilder.execute([testOnly]) ÔçÆ [<code>Promise.&lt;QueryBuilder&gt;</code>](#QueryBuilder)
Ejecuta la consulta construida contra el controlador de base de datos configurado
Env├¡a la consulta a la base de datos y retorna resultados o errores
Si testOnly es true, retorna la cadena de consulta sin ejecutar

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>Promise.&lt;QueryBuilder&gt;</code>](#QueryBuilder) - Instancia de QueryBuilder con resultados o errores  
**Category**: General  
**Throws**:

- <code>Error</code> Cuando no hay controlador de base de datos configurado


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [testOnly] | <code>boolean</code> | <code>false</code> | Si es true, retorna la cadena de consulta sin ejecutar |

**Example**  
```js
// Ejecutar consulta y obtener resultados
const result = await qb.select('*').from('users').where('active = 1').execute();
```
<a name="QueryBuilder.using"></a>

#### QueryBuilder.using(columnsInCommon, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando USING se utiliza en SQL para especificar las columnas que se van a utilizar para combinar dos tablas en una operaci├│n JOIN.
A diferencia de la cl├íusula ON, que requiere una condici├│n expl├¡cita, USING simplifica la sintaxis al asumir que las columnas mencionadas tienen el mismo nombre en ambas tablas.
Se usa principalmente en consultas SQL para especificar columnas en operaciones de JOIN.
Es especialmente ├║til cuando las columnas que se van a combinar tienen el mismo nombre en ambas tablas.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - Instancia de QueryBuilder para el encadenamiento de m├®todos  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Si el comando previo no es un JOIN v├ílido


| Param | Type | Description |
| --- | --- | --- |
| columnsInCommon | <code>string</code> | Columna en comun |
| next | <code>object</code> |  |

**Example**  
```js
qb.select('*').from('tabla1').join('tabla2').using('columna_comun');
qb.select('*').from('tabla1').innerJoin('tabla2').using('columna_comun');
// Errores
qb.select('*').from('tabla1').where('condicion').using('columna_comun'); // Error
```
<a name="QueryBuilder.intersect"></a>

#### QueryBuilder.intersect(selects) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando INTERSECT se utiliza en SQL para obtener los registros comunes entre dos consultas SELECT.
Retorna solo las filas que existen en ambas consultas, eliminando duplicados.
PostgreSQL	Ô£à 	Soporta INTERSECT para obtener los registros comunes entre dos consultas.
MySQL			ÔØî 	No soporta INTERSECT, pero puede emularse con JOIN o IN.
SQL Server	ÔØî 	No soporta INTERSECT ALL, pero se puede simular con GROUP BY y HAVING.
Oracle			Ô£à 	Soporta INTERSECT en consultas SQL.
SQLite			ÔØî 	No tiene soporte nativo para INTERSECT, pero puede simularse con JOIN.
MongoDB	$lookup con $match	Se puede utilizar una combinaci├│n de lookup para unir colecciones y luego filtrar los resultados comunes con $match.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) | Selects |

**Example**  
```js
qb.intersect(select1, select2);
```
<a name="QueryBuilder.intersectAll"></a>

#### QueryBuilder.intersectAll(selects) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El comando INTERSECT ALL es similar a INTERSECT, pero mantiene los duplicados en el resultado.
A diferencia de INTERSECT, que elimina los duplicados,
INTERSECT ALL retiene las filas comunes que aparecen en ambas consultas, incluyendo todas las repeticiones de esas filas.

PostgreSQL	Ô£à 	Soporta INTERSECT para obtener los registros comunes entre dos consultas.
MySQL			ÔØî 	No soporta INTERSECT, pero puede emularse con JOIN o IN.
SQL Server	Ô£à 	Soporta INTERSECT para encontrar intersecciones entre dos conjuntos de resultados.
Oracle			Ô£à 	Soporta INTERSECT en consultas SQL.
SQLite			ÔØî 	No tiene soporte nativo para INTERSECT, pero puede simularse con JOIN.
MongoDB	$lookup con $group	Se pueden combinar colecciones y luego agrupar los resultados para mantener duplicados.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| selects | <code>string</code> \| [<code>QueryBuilder</code>](#QueryBuilder) | Selects |

**Example**  
```js
qb.intersectAll(select1, select2);
```
<a name="QueryBuilder.in"></a>

#### QueryBuilder.in(columna, values, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El operador IN en SQL se utiliza para comprobar si un valor est├í presente dentro de un conjunto de valores.
Es ├║til cuando se necesita realizar comparaciones m├║ltiples sin tener que escribir m├║ltiples condiciones OR.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| columna | <code>string</code> \| <code>column</code> | nombre de la columna cuyo valor esta contenido el los valores, puede un string o un objeto Column |
| values | <code>Array.&lt;(string\|QueryBuilder)&gt;</code> \| <code>values</code> | Puede ser un array o una lista de strings u objetos QueryBuilder |
| next | <code>object</code> | Objeto recibido por el comando anterior siempre es el ultimo parametro a├▒adido por el Proxy |

**Example**  
```js
qb.where(in("columna1",valor1, valor2, valor3)) // WHERE columna1 IN (valor1, valor2, valor3);
```
<a name="QueryBuilder.notIn"></a>

#### QueryBuilder.notIn(columna, values, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
El operador NOT IN en SQL se utiliza para filtrar registros cuyo valor NO est├í presente en un conjunto de valores especificados.
Permite excluir m├║ltiples valores en una sola condici├│n, siendo la negaci├│n del operador IN.
Filtrar registros cuyo valor NO est├í en una lista de valores o en el resultado de una subconsulta.
Es la negaci├│n de IN y permite excluir m├║ltiples valores en una sola condici├│n.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| columna | <code>string</code> \| <code>column</code> | nombre de la columna cuyo valor no esta contenido el los valores, puede un string o un objeto Column |
| values | <code>Array.&lt;(string\|QueryBuilder)&gt;</code> \| <code>values</code> |  |
| next | <code>object</code> | Objeto recibido por el comando anterior siempre es el ultimo parametro a├▒adido por el Proxy |

**Example**  
```js
qb.where(notIn("columna1",valor1, valor2, valor3)) // WHERE columna1 NOT IN (valor1, valor2, valor3);
```
<a name="QueryBuilder.coltn"></a>

#### QueryBuilder.coltn(table, name) ÔçÆ <code>Column</code>
Crea una instancia de Column con el nombre de la tabla primero y luego el nombre de la columna.
Es igual a col cambiando el orden de los parametros

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: <code>Column</code> - Instancia de Column para su uso en consultas  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Cuando los par├ímetros no coinciden con los tipos esperados


| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | nombre de la tabla |
| name | <code>string</code> | nombre de la columna |

**Example**  
```js
// Referencia simple de columna
const userCol = qb.coltn('users', 'name'); // users.name

// Usar en consultas
qb.select([qb.coltn('u', 'name'), qb.coltn('u', 'email')]) // SELECT u.name, u.email
  .from('users', 'u')
  .where(qb.eq(qb.coltn('u', 'active'), 1)); // WHERE u.active = 1
// Subconsulta como columna
const subQb = new QueryBuilder().select('COUNT(*)').from('orders').where(qb.eq(qb.coltn('', 'user_id'), qb.coltn('u', 'id')));
const orderCountCol = qb.coltn('u', subQb); // (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
```
<a name="QueryBuilder.openCursor"></a>

#### QueryBuilder.openCursor(name, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Abre un cursor existente.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
<a name="QueryBuilder.closeCursor"></a>

#### QueryBuilder.closeCursor(name, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Cierra un cursor existente.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
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
<a name="QueryBuilder.setConstraints"></a>

#### QueryBuilder.setConstraints(restrictions, type, next) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Establece restricciones o reglas en la base de datos.
Permite definir restricciones como UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, etc.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Predicates  
**Throws**:

- <code>Error</code> Cuando los par├ímetros no coinciden con los tipos esperados


| Param | Type | Description |
| --- | --- | --- |
| restrictions | <code>Array.&lt;Object&gt;</code> | Array de objetos que definen las restricciones |
| type | <code>string</code> | Tipo de restricci├│n (e.g., 'UNIQUE', 'PRIMARY KEY', etc.) |
| next | <code>object</code> | Objeto recibido por el comando anterior |

**Example**  
```js
// Add a UNIQUE constraint
qb.setConstraints([{ column: 'email' }], 'UNIQUE', {});
```
<a name="QueryBuilder.toString"></a>

#### QueryBuilder.toString([options]) ÔçÆ <code>Promise.&lt;string&gt;</code>
Genera la cadena de consulta SQL completa desde la consulta construida
├Ütil para depuraci├│n, registro, copia, etc. del comando SQL final

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: <code>Promise.&lt;string&gt;</code> - La cadena de consulta SQL completa  
**Category**: Predicates  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Opciones de formato para la salida |

**Example**  
```js
// Construir y obtener cadena de consulta
const sql = await qb.select('*').from('users').where('active = 1').toString();
console.log(sql); // "SELECT * FROM users WHERE active = 1"

// Consulta compleja con joins
const complexSql = await qb
  .select(['u.name', 'p.title'])
  .from('users', 'u')
  .join('posts', 'p', 'u.id = p.user_id')
  .where('u.active = 1')
  .toString();
```
<a name="QueryBuilder.setTransaction"></a>

#### QueryBuilder.setTransaction(options) ÔçÆ <code>Transaction</code>
Crea una nueva transacci├│n para agrupar m├║ltiples operaciones SQL.
Permite iniciar, confirmar o revertir transacciones.

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: <code>Transaction</code> - - Objeto Transaction para manejar la transacci├│n  
**Category**: Transactions  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Opciones para la transacci├│n |

**Example**  
```js
const transaction = qb.setTransaction({ isolationLevel: 'SERIALIZABLE' });
```
<a name="QueryBuilder.thread"></a>

#### QueryBuilder.thread(id) ÔçÆ [<code>QueryBuilder</code>](#QueryBuilder)
Gestiona la ejecuci├│n de hilos para operaciones de consulta concurrentes
Cambia entre diferentes hilos de ejecuci├│n de consultas por ID
Permite crear distintos hilos usando una instancia de QueryBuilder
Evita tener que crear instancias m├║ltiples

**Kind**: static method of [<code>QueryBuilder</code>](#QueryBuilder)  
**Returns**: [<code>QueryBuilder</code>](#QueryBuilder) - Objeto QueryBuilder pasado al siguiente comando para encadenar  
**Category**: Utilities  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | Identificador del hilo al cual cambiar o crear |

**Example**  
```js
// Crear o cambiar al hilo 'main'
qb.thread('main').select('*').from('users');

// Cambiar a un hilo diferente
qb.thread('secondary').select('count(*)').from('orders');
```
