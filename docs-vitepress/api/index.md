# API Reference

::: tip Documentación Automática
**[📖 API Completa (JSDoc)](/api/generated)** - Documentación completa generada automáticamente desde el código fuente
:::

::: tip Navegación
Use el menú lateral para explorar las diferentes categorías de métodos o la búsqueda para encontrar métodos específicos.
:::

## Navegación Rápida

### [API Completa (JSDoc)](/api/generated)
Documentación completa generada automáticamente desde los comentarios JSDoc del código fuente. Incluye todos los métodos, parámetros, ejemplos y tipos de datos **siempre actualizada**.

### Guías por categorías
- **[QueryBuilder Class](/api/querybuilder)** - Clase principal y constructor  
- **[DDL Methods](/api/ddl)** - Data Definition Language
- **[DML Methods](/api/dml)** - Data Manipulation Language
- **[DQL Methods](/api/dql)** - Data Query Language
- **[DCL Methods](/api/dcl)** - Data Control Language
- **[Predicates](/api/predicates)** - Condiciones WHERE
- **[Functions](/api/functions)** - Funciones SQL
- **[Transactions](/api/transactions)** - Control de transacciones
- **[Cursors](/api/cursors)** - Manejo de cursores
- **[Utilities](/api/utilities)** - Métodos de utilidad

## QueryBuilder Class

La clase principal que proporciona una API fluida para construir consultas de base de datos.

### Constructor

```javascript
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';

const qb = new QueryBuilder(MySQL, options);
```

### Parámetros del Constructor

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `language` | `Core` | Clase de lenguaje (adaptador SQL/NoSQL) derivada de Core |
| `options` | `Object` | Opciones de configuración para QueryBuilder |

## Categorías de Métodos

### 🏗️ DDL (Data Definition Language)
**Comandos de Definición de Datos** - Operaciones para crear, modificar y eliminar estructuras de base de datos.

- `createDatabase()` - Crear base de datos
- `createTable()` - Crear tabla
- `alterTable()` - Modificar tabla
- `dropTable()` - Eliminar tabla

[Ver todos los métodos DDL →](/api/ddl)

### 📝 DML (Data Manipulation Language)  
**Comandos de Manipulación de Datos** - Operaciones para insertar, actualizar y eliminar datos.

- `insert()` - Insertar registros
- `update()` - Actualizar registros  
- `delete()` - Eliminar registros

[Ver todos los métodos DML →](/api/dml)

### 🔍 DQL (Data Query Language)
**Comandos de Consulta de Datos** - Operaciones para consultar y recuperar datos.

- `select()` - Seleccionar columnas
- `from()` - Tabla origen
- `where()` - Condiciones
- `join()` - Unir tablas

[Ver todos los métodos DQL →](/api/dql)

### 🔐 DCL (Data Control Language) 
**Comandos de Control de Datos** - Operaciones para gestionar permisos y acceso.

- `grant()` - Otorgar permisos
- `revoke()` - Revocar permisos

[Ver todos los métodos DCL →](/api/dcl)

### 🎯 Predicates
**Predicados y Operadores** - Para construcción de condiciones complejas.

- `and()` - Operador AND
- `or()` - Operador OR
- `like()` - Búsqueda con patrones

[Ver todos los predicados →](/api/predicates)

### 📊 Functions
**Funciones SQL** - Funciones matemáticas, de cadena, fecha y agregación.

- `count()` - Contar registros
- `sum()` - Sumar valores
- `max()` - Valor máximo

[Ver todas las funciones →](/api/functions)

### 🔄 Transactions
**Gestión de Transacciones** - Control de transacciones para operaciones atómicas.

- `startTransaction()` - Iniciar transacción
- `commit()` - Confirmar transacción
- `rollback()` - Deshacer transacción

[Ver métodos de transacciones →](/api/transactions)

### 📄 Cursors
**Gestión de Cursores** - Para procesamiento de grandes datasets.

- `createCursor()` - Crear cursor
- `openCursor()` - Abrir cursor
- `fetch()` - Obtener datos

[Ver métodos de cursores →](/api/cursors)

### 🛠️ Utilities
**Funciones de Utilidad** - Métodos auxiliares y herramientas de desarrollo.

- `validate()` - Validar consulta
- `debug()` - Información de depuración
- `reset()` - Reiniciar estado

[Ver utilidades →](/api/utilities)

## Ejemplo de Uso Básico

```javascript
// Consulta simple
const result = await qb
  .select(['name', 'email'])
  .from('users')
  .where('active = 1')
  .orderBy('name')
  .execute();

// Consulta con JOIN
const orders = await qb
  .select(['u.name', 'o.total'])
  .from('users', 'u')
  .innerJoin('orders', 'o')
  .on('u.id = o.user_id')
  .where('o.status = ?', ['completed'])
  .execute();

// Inserción
await qb
  .insert('users', [
    ['John Doe', 'john@example.com'],
    ['Jane Smith', 'jane@example.com']
  ], ['name', 'email'])
  .execute();
```