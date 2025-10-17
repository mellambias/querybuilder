# DDL - Data Definition Language

Los métodos DDL permiten crear, modificar y eliminar estructuras de base de datos como tablas, índices y esquemas.

## createDatabase()

Crea una nueva base de datos.

### Sintaxis

```javascript
queryBuilder.createDatabase(databaseName, options)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `databaseName` | `string` | Nombre de la base de datos a crear |
| `options` | `Object` | Opciones adicionales (charset, collation, etc.) |

### Ejemplo

```javascript
await qb
  .createDatabase('mi_aplicacion')
  .execute();

// Con opciones
await qb
  .createDatabase('mi_aplicacion', {
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  })
  .execute();
```

## createTable()

Crea una nueva tabla con sus columnas y restricciones.

### Sintaxis

```javascript
queryBuilder.createTable(tableName, columns, options)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `tableName` | `string` | Nombre de la tabla a crear |
| `columns` | `Array` | Definición de columnas |
| `options` | `Object` | Opciones de la tabla |

### Ejemplo

```javascript
await qb
  .createTable('usuarios', [
    { name: 'id', type: 'INT', primaryKey: true, autoIncrement: true },
    { name: 'nombre', type: 'VARCHAR(100)', notNull: true },
    { name: 'email', type: 'VARCHAR(150)', unique: true },
    { name: 'fecha_registro', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
  ])
  .execute();
```

## alterTable()

Modifica la estructura de una tabla existente.

### Sintaxis

```javascript
queryBuilder.alterTable(tableName)
```

### Métodos de Alteración

- `addColumn(name, type, options)` - Agregar columna
- `dropColumn(name)` - Eliminar columna
- `modifyColumn(name, type, options)` - Modificar columna
- `addIndex(name, columns)` - Agregar índice
- `dropIndex(name)` - Eliminar índice

### Ejemplo

```javascript
// Agregar columna
await qb
  .alterTable('usuarios')
  .addColumn('telefono', 'VARCHAR(20)')
  .execute();

// Modificar columna
await qb
  .alterTable('usuarios')
  .modifyColumn('email', 'VARCHAR(200)', { notNull: true })
  .execute();

// Agregar índice
await qb
  .alterTable('usuarios')
  .addIndex('idx_email', ['email'])
  .execute();
```

## dropTable()

Elimina una tabla de la base de datos.

### Sintaxis

```javascript
queryBuilder.dropTable(tableName, options)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `tableName` | `string` | Nombre de la tabla a eliminar |
| `options` | `Object` | Opciones (ifExists, cascade, etc.) |

### Ejemplo

```javascript
// Eliminar tabla
await qb
  .dropTable('usuarios_temp')
  .execute();

// Con opción IF EXISTS
await qb
  .dropTable('usuarios_temp', { ifExists: true })
  .execute();
```

## createIndex()

Crea un índice en una tabla.

### Sintaxis

```javascript
queryBuilder.createIndex(indexName, tableName, columns, options)
```

### Ejemplo

```javascript
// Índice simple
await qb
  .createIndex('idx_usuario_email', 'usuarios', ['email'])
  .execute();

// Índice compuesto
await qb
  .createIndex('idx_usuario_nombre_fecha', 'usuarios', ['nombre', 'fecha_registro'])
  .execute();

// Índice único
await qb
  .createIndex('idx_usuario_email_unique', 'usuarios', ['email'], { unique: true })
  .execute();
```

## dropIndex()

Elimina un índice de una tabla.

### Sintaxis

```javascript
queryBuilder.dropIndex(indexName, tableName)
```

### Ejemplo

```javascript
await qb
  .dropIndex('idx_usuario_email', 'usuarios')
  .execute();
```

## truncateTable()

Vacía completamente una tabla eliminando todos sus datos pero manteniendo la estructura.

### Sintaxis

```javascript
queryBuilder.truncateTable(tableName)
```

### Ejemplo

```javascript
await qb
  .truncateTable('logs_temporales')
  .execute();
```

## Opciones de Columna

Al crear o modificar columnas, puedes usar las siguientes opciones:

```javascript
{
  type: 'VARCHAR(100)',      // Tipo de dato
  notNull: true,             // NOT NULL
  primaryKey: true,          // PRIMARY KEY
  autoIncrement: true,       // AUTO_INCREMENT
  unique: true,              // UNIQUE
  default: 'valor_defecto',  // DEFAULT
  comment: 'Descripción',    // COMMENT
  after: 'nombre_columna'    // AFTER (para ALTER TABLE)
}
```

## Ejemplo Completo

```javascript
// Crear una tabla completa para un blog
await qb
  .createTable('articulos', [
    { 
      name: 'id', 
      type: 'INT', 
      primaryKey: true, 
      autoIncrement: true 
    },
    { 
      name: 'titulo', 
      type: 'VARCHAR(200)', 
      notNull: true 
    },
    { 
      name: 'contenido', 
      type: 'TEXT' 
    },
    { 
      name: 'autor_id', 
      type: 'INT', 
      notNull: true 
    },
    { 
      name: 'estado', 
      type: 'ENUM("borrador", "publicado")', 
      default: 'borrador' 
    },
    { 
      name: 'fecha_creacion', 
      type: 'TIMESTAMP', 
      default: 'CURRENT_TIMESTAMP' 
    },
    { 
      name: 'fecha_actualizacion', 
      type: 'TIMESTAMP', 
      default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' 
    }
  ])
  .execute();

// Agregar índices
await qb
  .createIndex('idx_articulos_autor', 'articulos', ['autor_id'])
  .execute();

await qb
  .createIndex('idx_articulos_estado_fecha', 'articulos', ['estado', 'fecha_creacion'])
  .execute();
```