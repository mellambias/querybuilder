# DML - Data Manipulation Language

Los métodos DML permiten insertar, actualizar y eliminar datos en las tablas de la base de datos.

## insert()

Inserta nuevos registros en una tabla.

### Sintaxis

```javascript
queryBuilder.insert(table, values, columns)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `table` | `string` | Nombre de la tabla |
| `values` | `Array\|Object` | Valores a insertar |
| `columns` | `Array` | Nombres de las columnas (opcional) |

### Ejemplos

```javascript
// Inserción simple con objeto
await qb
  .insert('usuarios', {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    edad: 30
  })
  .execute();

// Inserción con array de valores
await qb
  .insert('usuarios', ['María García', 'maria@example.com', 25], 
         ['nombre', 'email', 'edad'])
  .execute();

// Inserción múltiple
await qb
  .insert('usuarios', [
    ['Carlos López', 'carlos@example.com', 28],
    ['Ana Martín', 'ana@example.com', 32],
    ['Luis Rodríguez', 'luis@example.com', 27]
  ], ['nombre', 'email', 'edad'])
  .execute();
```

## insertOrUpdate()

Inserta un registro o lo actualiza si ya existe (UPSERT).

### Sintaxis

```javascript
queryBuilder.insertOrUpdate(table, values, updateColumns)
```

### Ejemplo

```javascript
await qb
  .insertOrUpdate('usuarios', 
    { id: 1, nombre: 'Juan Pérez', email: 'juan.nuevo@example.com' },
    ['nombre', 'email'] // Columnas a actualizar si existe
  )
  .execute();
```

## update()

Actualiza registros existentes en una tabla.

### Sintaxis

```javascript
queryBuilder.update(table, values)
```

### Ejemplo

```javascript
// Actualización simple
await qb
  .update('usuarios', { 
    nombre: 'Juan Carlos Pérez',
    ultima_conexion: new Date()
  })
  .where('id = ?', [123])
  .execute();

// Actualización con múltiples condiciones
await qb
  .update('productos', {
    precio: 25.99,
    stock: 100
  })
  .where('categoria = ? AND activo = ?', ['electronica', 1])
  .execute();

// Actualización con operadores
await qb
  .update('usuarios', {
    visitas: qb.raw('visitas + 1'),
    ultima_visita: qb.raw('NOW()')
  })
  .where('id = ?', [456])
  .execute();
```

## delete()

Elimina registros de una tabla.

### Sintaxis

```javascript
queryBuilder.delete(table)
```

### Ejemplo

```javascript
// Eliminación con condición
await qb
  .delete('usuarios')
  .where('activo = ?', [0])
  .execute();

// Eliminación múltiple con condiciones complejas
await qb
  .delete('logs')
  .where('fecha < ?', ['2023-01-01'])
  .and('nivel = ?', ['debug'])
  .execute();

// Eliminación con LIMIT
await qb
  .delete('notificaciones')
  .where('leida = ?', [1])
  .limit(100)
  .execute();
```

## replace()

Reemplaza un registro (elimina e inserta).

### Sintaxis

```javascript
queryBuilder.replace(table, values)
```

### Ejemplo

```javascript
await qb
  .replace('configuracion', {
    clave: 'tema',
    valor: 'oscuro',
    usuario_id: 123
  })
  .execute();
```

## Métodos de Inserción Avanzada

### insertIgnore()

Inserta registros ignorando errores de duplicados.

```javascript
await qb
  .insertIgnore('usuarios', [
    { email: 'existente@example.com', nombre: 'Usuario' },
    { email: 'nuevo@example.com', nombre: 'Nuevo Usuario' }
  ])
  .execute();
```

### insertSelect()

Inserta datos desde una consulta SELECT.

```javascript
await qb
  .insertSelect('usuarios_backup', 
    qb.select(['nombre', 'email', 'fecha_registro'])
      .from('usuarios')
      .where('activo = ?', [0])
  )
  .execute();
```

## Métodos con Joins

### updateWithJoin()

Actualiza registros usando JOINs.

```javascript
await qb
  .update('pedidos', { estado: 'enviado' })
  .innerJoin('productos', 'productos.id = pedidos.producto_id')
  .where('productos.categoria = ?', ['electronicos'])
  .and('pedidos.estado = ?', ['pendiente'])
  .execute();
```

### deleteWithJoin()

Elimina registros usando JOINs.

```javascript
await qb
  .delete('pedidos')
  .innerJoin('usuarios', 'usuarios.id = pedidos.usuario_id')
  .where('usuarios.activo = ?', [0])
  .execute();
```

## Transacciones

Todos los métodos DML pueden usarse dentro de transacciones:

```javascript
try {
  await qb.startTransaction();
  
  // Insertar nuevo usuario
  const userId = await qb
    .insert('usuarios', {
      nombre: 'Carlos Nuevo',
      email: 'carlos@example.com'
    })
    .execute();
  
  // Actualizar contador de usuarios
  await qb
    .update('estadisticas', {
      total_usuarios: qb.raw('total_usuarios + 1')
    })
    .where('id = ?', [1])
    .execute();
  
  // Insertar log de actividad
  await qb
    .insert('logs', {
      accion: 'usuario_creado',
      usuario_id: userId,
      fecha: new Date()
    })
    .execute();
  
  await qb.commit();
} catch (error) {
  await qb.rollback();
  throw error;
}
```

## Validación y Sanitización

QueryBuilder incluye validación automática:

```javascript
// Los valores son automáticamente escapados
await qb
  .insert('comentarios', {
    contenido: "Texto con 'comillas' y \"comillas dobles\"",
    autor: 'Usuario <script>alert("xss")</script>'
  })
  .execute(); // Valores seguros automáticamente

// Para valores raw (sin escapar), usar raw()
await qb
  .update('productos', {
    precio: qb.raw('precio * 1.1'), // Incrementar 10%
    fecha_actualizacion: qb.raw('NOW()')
  })
  .where('categoria = ?', ['electronics'])
  .execute();
```

## Ejemplo Completo: CRUD de Productos

```javascript
class ProductoService {
  constructor(queryBuilder) {
    this.qb = queryBuilder;
  }

  // CREATE
  async crear(producto) {
    return await this.qb
      .insert('productos', {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        categoria_id: producto.categoria_id,
        stock: producto.stock,
        fecha_creacion: new Date()
      })
      .execute();
  }

  // READ (se cubre en DQL)
  
  // UPDATE
  async actualizar(id, cambios) {
    return await this.qb
      .update('productos', {
        ...cambios,
        fecha_actualizacion: new Date()
      })
      .where('id = ?', [id])
      .execute();
  }

  // DELETE
  async eliminar(id) {
    // Soft delete
    return await this.qb
      .update('productos', {
        eliminado: 1,
        fecha_eliminacion: new Date()
      })
      .where('id = ?', [id])
      .execute();
  }

  // Actualizar stock
  async actualizarStock(id, cantidad) {
    return await this.qb
      .update('productos', {
        stock: this.qb.raw('stock + ?', [cantidad]),
        fecha_actualizacion: new Date()
      })
      .where('id = ?', [id])
      .execute();
  }

  // Inserción masiva
  async crearMasivo(productos) {
    const valores = productos.map(p => [
      p.nombre, p.descripcion, p.precio, 
      p.categoria_id, p.stock, new Date()
    ]);
    
    return await this.qb
      .insert('productos', valores, [
        'nombre', 'descripcion', 'precio',
        'categoria_id', 'stock', 'fecha_creacion'
      ])
      .execute();
  }
}
```