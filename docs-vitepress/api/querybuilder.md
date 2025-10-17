# QueryBuilder Class

La clase principal que proporciona una API fluida para construir y ejecutar consultas de base de datos.

## Constructor

```javascript
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';

const qb = new QueryBuilder(MySQL, options);
```

### Parámetros del Constructor

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `language` | `Object` | Adaptador de lenguaje (MySQL, PostgreSQL, MongoDB, etc.) |
| `options` | `Object` | Opciones de configuración |

### Opciones de Configuración

```javascript
const options = {
  // Configuración de conexión
  host: 'localhost',
  port: 3306,
  username: 'user',
  password: 'password',
  database: 'mydb',
  
  // Configuración de QueryBuilder
  debug: false,
  timeout: 30000,
  charset: 'utf8mb4'
};
```

## Propiedades Principales

### `.result`
Contiene el resultado de la última operación ejecutada.

```javascript
const users = qb.select('*').from('users').execute();
console.log(qb.result); // Resultado de la consulta
```

## Métodos Principales

### Flujo de Consulta

1. **[DDL Methods](/api/ddl)** - Data Definition Language
2. **[DML Methods](/api/dml)** - Data Manipulation Language  
3. **[DQL Methods](/api/dql)** - Data Query Language
4. **[DCL Methods](/api/dcl)** - Data Control Language

### Utilidades

- **[Predicates](/api/predicates)** - Condiciones y operadores
- **[Functions](/api/functions)** - Funciones SQL integradas
- **[Transactions](/api/transactions)** - Control de transacciones
- **[Cursors](/api/cursors)** - Manejo de cursores
- **[Utilities](/api/utilities)** - Métodos de utilidad

## Ejemplo Completo

```javascript
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';

// Crear instancia
const qb = new QueryBuilder(MySQL, {
  host: 'localhost',
  database: 'myapp',
  username: 'user',
  password: 'pass'
});

// Consulta con JOIN y condiciones
const result = qb
  .select('u.name', 'u.email', 'p.title')
  .from('users u')
  .join('posts p', 'u.id = p.user_id')
  .where('u.active = 1')
  .where('p.published = 1')
  .orderBy('u.name')
  .limit(10)
  .execute();

console.log(result);
```

## Adaptadores Disponibles

| Adaptador | Paquete | Base de Datos |
|-----------|---------|---------------|
| MySQL | `@querybuilder/mysql` | MySQL/MariaDB |
| PostgreSQL | `@querybuilder/postgresql` | PostgreSQL |
| MongoDB | `@querybuilder/mongodb` | MongoDB |
| SQLite | `@querybuilder/sqlite` | SQLite |
| Redis | `@querybuilder/redis` | Redis |
| Cassandra | `@querybuilder/cassandra` | Apache Cassandra |
| ChromaDB | `@querybuilder/chroma` | ChromaDB |

## Ver También

- [API Completa (JSDoc)](/api/generated) - Documentación completa generada
- [Ejemplos](/guides/examples) - Casos de uso comunes
- [Configuración](/guides/configuration) - Guía de configuración