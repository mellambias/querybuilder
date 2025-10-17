# Predicates - Predicados y Operadores

Los predicados son métodos para construir condiciones complejas en las consultas WHERE, HAVING y JOIN.

## Operadores Lógicos

### and()

Combina condiciones con el operador AND lógico.

### Sintaxis

```javascript
queryBuilder.and(condition, values)
```

### Ejemplos

```javascript
// Condiciones múltiples con AND
const usuarios = await qb
  .select(['nombre', 'email', 'edad'])
  .from('usuarios')
  .where('activo = ?', [1])
  .and('edad >= ?', [18])
  .and('pais = ?', ['ES'])
  .execute();

// AND con operadores complejos
const productos = await qb
  .select(['nombre', 'precio'])
  .from('productos')
  .where('categoria_id = ?', [1])
  .and('precio BETWEEN ? AND ?', [10, 100])
  .and('stock > ?', [0])
  .execute();
```

### or()

Combina condiciones con el operador OR lógico.

### Sintaxis

```javascript
queryBuilder.or(condition, values)
```

### Ejemplos

```javascript
// Condiciones alternativas con OR
const busqueda = await qb
  .select(['titulo', 'contenido'])
  .from('articulos')
  .where('titulo LIKE ?', ['%javascript%'])
  .or('contenido LIKE ?', ['%javascript%'])
  .or('etiquetas LIKE ?', ['%javascript%'])
  .execute();

// OR con grupos de condiciones
const filtros = await qb
  .select(['nombre', 'precio'])
  .from('productos')
  .where('categoria_id = ?', [1])
  .or('(precio < ? AND destacado = ?)', [20, 1])
  .execute();
```

### not()

Niega una condición con el operador NOT.

```javascript
// Excluir registros
const activos = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('NOT eliminado')
  .and('NOT bloqueado')
  .execute();

// NOT con subconsultas
const sinPedidos = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .whereNotExists(
    qb.select(['1'])
      .from('pedidos')
      .where('pedidos.usuario_id = usuarios.id')
  )
  .execute();
```

## Operadores de Comparación

### like()

Búsqueda con patrones usando comodines.

```javascript
// Búsqueda con LIKE
const nombres = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('nombre LIKE ?', ['Juan%'])  // Comienza con "Juan"
  .or('email LIKE ?', ['%@gmail.com']) // Termina con "@gmail.com"
  .execute();

// Case insensitive en algunos motores
const busquedaCI = await qb
  .select(['titulo'])
  .from('articulos')
  .where('UPPER(titulo) LIKE UPPER(?)', ['%javascript%'])
  .execute();
```

### notLike()

Excluye patrones específicos.

```javascript
const filtrados = await qb
  .select(['email'])
  .from('usuarios')
  .where('email NOT LIKE ?', ['%temporal%'])
  .and('email NOT LIKE ?', ['%test%'])
  .execute();
```

### in()

Verifica si un valor está dentro de una lista.

```javascript
// IN con array de valores
const categorias = await qb
  .select(['nombre', 'precio'])
  .from('productos')
  .where('categoria_id IN (?)', [[1, 2, 3, 5]])
  .execute();

// IN con subconsulta
const usuariosActivos = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .whereIn('id',
    qb.select(['usuario_id'])
      .from('sesiones')
      .where('ultimo_acceso >= ?', ['2024-01-01'])
  )
  .execute();
```

### notIn()

Excluye valores de una lista.

```javascript
const disponibles = await qb
  .select(['nombre', 'precio'])
  .from('productos')
  .where('categoria_id NOT IN (?)', [[6, 7, 8]]) // Excluir categorías
  .and('estado NOT IN (?)', [['descontinuado', 'agotado']])
  .execute();
```

### between()

Verifica si un valor está dentro de un rango.

```javascript
// BETWEEN con números
const rangoPrecio = await qb
  .select(['nombre', 'precio'])
  .from('productos')
  .where('precio BETWEEN ? AND ?', [50, 200])
  .execute();

// BETWEEN con fechas
const ventasRecientes = await qb
  .select(['id', 'total', 'fecha'])
  .from('ventas')
  .where('fecha BETWEEN ? AND ?', ['2024-01-01', '2024-12-31'])
  .execute();
```

### notBetween()

Excluye valores dentro de un rango.

```javascript
const fueraRango = await qb
  .select(['nombre', 'precio'])
  .from('productos')
  .where('precio NOT BETWEEN ? AND ?', [100, 500])
  .execute();
```

## Operadores de Existencia

### exists()

Verifica que existe al menos un registro en una subconsulta.

```javascript
const conPedidos = await qb
  .select(['u.nombre', 'u.email'])
  .from('usuarios', 'u')
  .whereExists(
    qb.select(['1'])
      .from('pedidos', 'p')
      .where('p.usuario_id = u.id')
      .and('p.estado = ?', ['completado'])
  )
  .execute();
```

### notExists()

Verifica que NO existe ningún registro en una subconsulta.

```javascript
const sinActividad = await qb
  .select(['nombre', 'email'])
  .from('usuarios', 'u')
  .whereNotExists(
    qb.select(['1'])
      .from('logs_actividad', 'l')
      .where('l.usuario_id = u.id')
      .and('l.fecha >= ?', ['2024-01-01'])
  )
  .execute();
```

## Operadores de Comparación con NULL

### isNull()

Verifica valores NULL.

```javascript
const sinTelefono = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('telefono IS NULL')
  .execute();
```

### isNotNull()

Verifica valores que NO son NULL.

```javascript
const completos = await qb
  .select(['nombre', 'telefono'])
  .from('usuarios')
  .where('telefono IS NOT NULL')
  .and('email IS NOT NULL')
  .execute();
```

## Agrupación de Condiciones

### Paréntesis para agrupar lógica

```javascript
// Agrupación compleja con paréntesis
const filtroComplejo = await qb
  .select(['nombre', 'precio', 'categoria'])
  .from('productos')
  .where('(categoria_id = ? OR categoria_id = ?)', [1, 2])
  .and('(precio < ? OR destacado = ?)', [50, 1])
  .and('stock > ?', [0])
  .execute();

// Múltiples grupos
const busquedaAvanzada = await qb
  .select(['titulo', 'autor', 'precio'])
  .from('libros')
  .where('(titulo LIKE ? OR descripcion LIKE ?)', ['%python%', '%python%'])
  .and('(precio BETWEEN ? AND ? OR oferta = ?)', [10, 30, 1])
  .and('(disponible = ? AND stock > ?)', [1, 0])
  .execute();
```

## Predicados de Comparación Avanzados

### regexp()

Búsqueda con expresiones regulares (MySQL, PostgreSQL).

```javascript
// Expresiones regulares
const emails = await qb
  .select(['email'])
  .from('usuarios')
  .where('email REGEXP ?', ['^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'])
  .execute();

// Patrones complejos
const telefonos = await qb
  .select(['nombre', 'telefono'])
  .from('usuarios')
  .where('telefono REGEXP ?', ['^\\+34[6-9][0-9]{8}$']) // Móviles españoles
  .execute();
```

### soundex()

Búsqueda fonética (palabras que suenan similar).

```javascript
const similares = await qb
  .select(['nombre'])
  .from('usuarios')
  .where('SOUNDEX(nombre) = SOUNDEX(?)', ['Smith'])
  .execute();
```

## Funciones de Comparación de Strings

### locate()

Encuentra la posición de una subcadena.

```javascript
const posiciones = await qb
  .select(['nombre', 'LOCATE("@", email) as posicion_arroba'])
  .from('usuarios')
  .where('LOCATE("gmail", email) > 0')
  .execute();
```

### substring()

Extrae parte de una cadena para comparación.

```javascript
const codigosArea = await qb
  .select(['telefono'])
  .from('usuarios')
  .where('SUBSTRING(telefono, 1, 3) = ?', ['934'])
  .execute();
```

## Predicados con Fechas

### dateRange()

Filtros específicos para fechas.

```javascript
// Fechas del último mes
const ultimoMes = await qb
  .select(['id', 'nombre', 'fecha_registro'])
  .from('usuarios')
  .where('fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)')
  .execute();

// Días de la semana
const finSemana = await qb
  .select(['id', 'total'])
  .from('ventas')
  .where('DAYOFWEEK(fecha) IN (?)', [[1, 7]]) // Domingo y Sábado
  .execute();

// Año específico
const año2024 = await qb
  .select(['titulo', 'fecha_publicacion'])
  .from('articulos')
  .where('YEAR(fecha_publicacion) = ?', [2024])
  .execute();
```

## Ejemplo Completo: Sistema de Filtros Avanzado

```javascript
class ProductoFilter {
  constructor(queryBuilder) {
    this.qb = queryBuilder;
  }

  async buscar(filtros) {
    let query = this.qb
      .select([
        'p.id',
        'p.nombre',
        'p.descripcion', 
        'p.precio',
        'c.nombre as categoria',
        'p.stock'
      ])
      .from('productos', 'p')
      .leftJoin('categorias', 'c')
      .on('c.id = p.categoria_id')
      .where('p.activo = ?', [1]);

    // Filtro de búsqueda en texto
    if (filtros.busqueda) {
      query = query.and(
        '(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.codigo LIKE ?)', 
        [`%${filtros.busqueda}%`, `%${filtros.busqueda}%`, `%${filtros.busqueda}%`]
      );
    }

    // Filtro por categorías
    if (filtros.categorias && filtros.categorias.length > 0) {
      query = query.and('p.categoria_id IN (?)', [filtros.categorias]);
    }

    // Rango de precios
    if (filtros.precio_min && filtros.precio_max) {
      query = query.and('p.precio BETWEEN ? AND ?', [filtros.precio_min, filtros.precio_max]);
    } else if (filtros.precio_min) {
      query = query.and('p.precio >= ?', [filtros.precio_min]);
    } else if (filtros.precio_max) {
      query = query.and('p.precio <= ?', [filtros.precio_max]);
    }

    // Stock disponible
    if (filtros.solo_disponibles) {
      query = query.and('p.stock > ?', [0]);
    }

    // Productos nuevos (últimos 30 días)
    if (filtros.nuevos) {
      query = query.and('p.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    }

    // Productos en oferta
    if (filtros.ofertas) {
      query = query.and(
        '(p.precio_oferta IS NOT NULL AND p.precio_oferta < p.precio)'
      );
    }

    // Excluir productos descontinuados
    if (filtros.excluir_descontinuados) {
      query = query.and('p.estado NOT IN (?)', [['descontinuado', 'agotado']]);
    }

    // Filtro por rating mínimo
    if (filtros.rating_min) {
      query = query
        .leftJoin('reviews', 'r')
        .on('r.producto_id = p.id')
        .groupBy(['p.id'])
        .having('AVG(r.calificacion) >= ?', [filtros.rating_min]);
    }

    // Ordenamiento
    if (filtros.orden) {
      const ordenamientos = {
        'precio_asc': ['p.precio', 'ASC'],
        'precio_desc': ['p.precio', 'DESC'],
        'nombre': ['p.nombre', 'ASC'],
        'fecha': ['p.fecha_creacion', 'DESC'],
        'rating': ['AVG(r.calificacion)', 'DESC']
      };
      
      const orden = ordenamientos[filtros.orden];
      if (orden) {
        query = query.orderBy([orden[0]], orden[1]);
      }
    }

    // Paginación
    if (filtros.pagina && filtros.limite) {
      const offset = (filtros.pagina - 1) * filtros.limite;
      query = query.limit(filtros.limite, offset);
    }

    return await query.execute();
  }
}