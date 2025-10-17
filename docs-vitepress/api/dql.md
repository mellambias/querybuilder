# DQL - Data Query Language

Los métodos DQL permiten consultar y recuperar datos de la base de datos usando SELECT y operaciones relacionadas.

## select()

Especifica las columnas a seleccionar en la consulta.

### Sintaxis

```javascript
queryBuilder.select(columns)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `columns` | `Array\|string` | Columnas a seleccionar |

### Ejemplos

```javascript
// Seleccionar columnas específicas
const usuarios = await qb
  .select(['id', 'nombre', 'email'])
  .from('usuarios')
  .execute();

// Seleccionar todas las columnas
const productos = await qb
  .select('*')
  .from('productos')
  .execute();

// Seleccionar con alias
const ventas = await qb
  .select([
    'v.id',
    'v.total as monto_total',
    'u.nombre as cliente',
    'DATE(v.fecha) as fecha_venta'
  ])
  .from('ventas', 'v')
  .innerJoin('usuarios', 'u')
  .on('u.id = v.usuario_id')
  .execute();
```

## from()

Especifica la tabla principal de la consulta.

### Sintaxis

```javascript
queryBuilder.from(table, alias)
```

### Ejemplo

```javascript
// Tabla simple
const result = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .execute();

// Tabla con alias
const result = await qb
  .select(['u.nombre', 'u.email'])
  .from('usuarios', 'u')
  .execute();
```

## where()

Agrega condiciones WHERE a la consulta.

### Sintaxis

```javascript
queryBuilder.where(condition, values)
```

### Ejemplos

```javascript
// Condición simple
const activos = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('activo = ?', [1])
  .execute();

// Múltiples condiciones
const filtrados = await qb
  .select(['nombre', 'edad'])
  .from('usuarios')
  .where('edad >= ?', [18])
  .and('pais = ?', ['ES'])
  .execute();

// Condiciones con OR
const busqueda = await qb
  .select(['titulo', 'contenido'])
  .from('articulos')
  .where('titulo LIKE ?', ['%javascript%'])
  .or('contenido LIKE ?', ['%javascript%'])
  .execute();

// Condiciones IN
const categorias = await qb
  .select(['nombre', 'precio'])
  .from('productos')
  .where('categoria_id IN (?)', [[1, 2, 3, 4]])
  .execute();
```

## join()

Diferentes tipos de JOIN para relacionar tablas.

### innerJoin()

```javascript
const pedidosConUsuarios = await qb
  .select(['p.id', 'p.total', 'u.nombre', 'u.email'])
  .from('pedidos', 'p')
  .innerJoin('usuarios', 'u')
  .on('u.id = p.usuario_id')
  .execute();
```

### leftJoin()

```javascript
const usuariosConPedidos = await qb
  .select(['u.nombre', 'u.email', 'COUNT(p.id) as total_pedidos'])
  .from('usuarios', 'u')
  .leftJoin('pedidos', 'p')
  .on('p.usuario_id = u.id')
  .groupBy(['u.id'])
  .execute();
```

### rightJoin()

```javascript
const productosConCategorias = await qb
  .select(['p.nombre', 'c.nombre as categoria'])
  .from('productos', 'p')
  .rightJoin('categorias', 'c')
  .on('c.id = p.categoria_id')
  .execute();
```

### fullJoin()

```javascript
const relacionCompleta = await qb
  .select(['u.nombre', 'p.nombre as perfil'])
  .from('usuarios', 'u')
  .fullJoin('perfiles', 'p')
  .on('p.usuario_id = u.id')
  .execute();
```

## orderBy()

Ordena los resultados de la consulta.

### Sintaxis

```javascript
queryBuilder.orderBy(columns, direction)
```

### Ejemplos

```javascript
// Orden ascendente (por defecto)
const usuarios = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .orderBy(['nombre'])
  .execute();

// Orden descendente
const recientes = await qb
  .select(['titulo', 'fecha_creacion'])
  .from('articulos')
  .orderBy(['fecha_creacion'], 'DESC')
  .execute();

// Orden múltiple
const ordenado = await qb
  .select(['nombre', 'apellido', 'edad'])
  .from('usuarios')
  .orderBy(['apellido', 'nombre'], 'ASC')
  .execute();
```

## groupBy()

Agrupa resultados para usar con funciones de agregación.

### Sintaxis

```javascript
queryBuilder.groupBy(columns)
```

### Ejemplo

```javascript
const ventasPorCategoria = await qb
  .select([
    'c.nombre as categoria',
    'COUNT(v.id) as total_ventas',
    'SUM(v.total) as ingresos_totales',
    'AVG(v.total) as promedio_venta'
  ])
  .from('ventas', 'v')
  .innerJoin('productos', 'p')
  .on('p.id = v.producto_id')
  .innerJoin('categorias', 'c')
  .on('c.id = p.categoria_id')
  .groupBy(['c.id', 'c.nombre'])
  .execute();
```

## having()

Filtra grupos después del GROUP BY.

### Sintaxis

```javascript
queryBuilder.having(condition, values)
```

### Ejemplo

```javascript
const clientesVIP = await qb
  .select([
    'u.nombre',
    'COUNT(p.id) as total_pedidos',
    'SUM(p.total) as gasto_total'
  ])
  .from('usuarios', 'u')
  .innerJoin('pedidos', 'p')
  .on('p.usuario_id = u.id')
  .groupBy(['u.id', 'u.nombre'])
  .having('SUM(p.total) > ?', [1000])
  .and('COUNT(p.id) >= ?', [5])
  .execute();
```

## limit()

Limita el número de resultados devueltos.

### Sintaxis

```javascript
queryBuilder.limit(count, offset)
```

### Ejemplo

```javascript
// Primeros 10 resultados
const primeros = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .orderBy(['nombre'])
  .limit(10)
  .execute();

// Paginación (10 resultados desde el registro 20)
const pagina3 = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .orderBy(['nombre'])
  .limit(10, 20)
  .execute();
```

## distinct()

Elimina duplicados de los resultados.

### Ejemplo

```javascript
const ciudadesUnicas = await qb
  .select(['ciudad'])
  .distinct()
  .from('usuarios')
  .execute();

const paisesConUsuarios = await qb
  .select(['pais'])
  .distinct()
  .from('usuarios')
  .where('activo = ?', [1])
  .execute();
```

## Subconsultas

### whereIn() con subconsulta

```javascript
const usuariosConPedidos = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .whereIn('id', 
    qb.select(['usuario_id'])
      .from('pedidos')
      .where('fecha >= ?', ['2024-01-01'])
  )
  .execute();
```

### whereExists()

```javascript
const usuariosActivos = await qb
  .select(['nombre', 'email'])
  .from('usuarios', 'u')
  .whereExists(
    qb.select(['1'])
      .from('pedidos', 'p')
      .where('p.usuario_id = u.id')
      .and('p.fecha >= ?', ['2024-01-01'])
  )
  .execute();
```

## Funciones de Agregación

```javascript
// COUNT
const totalUsuarios = await qb
  .select(['COUNT(*) as total'])
  .from('usuarios')
  .execute();

// SUM
const ventasTotales = await qb
  .select(['SUM(total) as ingresos'])
  .from('pedidos')
  .where('estado = ?', ['completado'])
  .execute();

// AVG
const promedioEdad = await qb
  .select(['AVG(edad) as edad_promedio'])
  .from('usuarios')
  .execute();

// MIN y MAX
const rangoPrecios = await qb
  .select([
    'MIN(precio) as precio_minimo',
    'MAX(precio) as precio_maximo'
  ])
  .from('productos')
  .where('activo = ?', [1])
  .execute();
```

## UNION

Combina resultados de múltiples SELECT.

```javascript
const todosLosContactos = await qb
  .select(['nombre', 'email', 'tipo'])
  .from('usuarios')
  .select(['nombre', 'email', '"cliente" as tipo'])
  .union(
    qb.select(['nombre', 'email', '"proveedor" as tipo'])
      .from('proveedores')
  )
  .orderBy(['nombre'])
  .execute();
```

## Consultas Complejas

### Ejemplo: Dashboard de Ventas

```javascript
const dashboardVentas = await qb
  .select([
    'DATE(v.fecha) as fecha',
    'c.nombre as categoria',
    'COUNT(v.id) as num_ventas',
    'SUM(v.total) as ingresos_dia',
    'AVG(v.total) as ticket_promedio',
    'MAX(v.total) as venta_maxima'
  ])
  .from('ventas', 'v')
  .innerJoin('productos', 'p')
  .on('p.id = v.producto_id')
  .innerJoin('categorias', 'c')
  .on('c.id = p.categoria_id')
  .where('v.fecha >= ?', ['2024-01-01'])
  .and('v.estado = ?', ['completada'])
  .groupBy(['DATE(v.fecha)', 'c.id', 'c.nombre'])
  .having('SUM(v.total) > ?', [100])
  .orderBy(['fecha', 'ingresos_dia'], 'DESC')
  .limit(50)
  .execute();
```

### Ejemplo: Búsqueda Avanzada

```javascript
async function buscarProductos(filtros) {
  let query = qb
    .select([
      'p.id',
      'p.nombre',
      'p.descripcion',
      'p.precio',
      'c.nombre as categoria',
      'AVG(r.calificacion) as rating',
      'COUNT(r.id) as num_reviews'
    ])
    .from('productos', 'p')
    .leftJoin('categorias', 'c')
    .on('c.id = p.categoria_id')
    .leftJoin('reviews', 'r')
    .on('r.producto_id = p.id')
    .where('p.activo = ?', [1]);

  // Filtros dinámicos
  if (filtros.categoria) {
    query = query.and('p.categoria_id = ?', [filtros.categoria]);
  }

  if (filtros.precio_min) {
    query = query.and('p.precio >= ?', [filtros.precio_min]);
  }

  if (filtros.precio_max) {
    query = query.and('p.precio <= ?', [filtros.precio_max]);
  }

  if (filtros.busqueda) {
    query = query.and('(p.nombre LIKE ? OR p.descripcion LIKE ?)', 
      [`%${filtros.busqueda}%`, `%${filtros.busqueda}%`]);
  }

  if (filtros.rating_min) {
    query = query
      .groupBy(['p.id', 'p.nombre', 'p.descripcion', 'p.precio', 'c.nombre'])
      .having('AVG(r.calificacion) >= ?', [filtros.rating_min]);
  } else {
    query = query.groupBy(['p.id', 'p.nombre', 'p.descripcion', 'p.precio', 'c.nombre']);
  }

  // Ordenamiento
  const orderOptions = {
    'precio_asc': ['p.precio', 'ASC'],
    'precio_desc': ['p.precio', 'DESC'],
    'rating': ['rating', 'DESC'],
    'nombre': ['p.nombre', 'ASC']
  };

  const order = orderOptions[filtros.orden] || ['p.nombre', 'ASC'];
  query = query.orderBy([order[0]], order[1]);

  // Paginación
  const page = filtros.pagina || 1;
  const limit = filtros.limite || 20;
  const offset = (page - 1) * limit;

  return await query.limit(limit, offset).execute();
}
```