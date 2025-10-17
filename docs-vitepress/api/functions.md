# Functions - Funciones SQL

Las funciones SQL proporcionan capacidades avanzadas para manipular datos, realizar cálculos y transformaciones durante las consultas.

## Funciones de Agregación

### count()

Cuenta el número de filas que cumplen una condición.

### Sintaxis

```javascript
queryBuilder.select(['COUNT(columna)'])
```

### Ejemplos

```javascript
// Contar todos los registros
const totalUsuarios = await qb
  .select(['COUNT(*) as total'])
  .from('usuarios')
  .execute();

// Contar registros específicos
const usuariosActivos = await qb
  .select(['COUNT(id) as activos'])
  .from('usuarios')
  .where('activo = ?', [1])
  .execute();

// Contar valores únicos
const paisesUnicos = await qb
  .select(['COUNT(DISTINCT pais) as total_paises'])
  .from('usuarios')
  .execute();
```

### sum()

Suma valores numéricos de una columna.

```javascript
// Suma simple
const totalVentas = await qb
  .select(['SUM(total) as ingresos_totales'])
  .from('pedidos')
  .where('estado = ?', ['completado'])
  .execute();

// Suma condicional
const ventasPorCategoria = await qb
  .select([
    'categoria_id',
    'SUM(CASE WHEN precio > 100 THEN precio ELSE 0 END) as ventas_premium'
  ])
  .from('productos')
  .groupBy(['categoria_id'])
  .execute();
```

### avg()

Calcula el promedio de valores numéricos.

```javascript
// Promedio simple
const edadPromedio = await qb
  .select(['AVG(edad) as edad_media'])
  .from('usuarios')
  .execute();

// Promedio por grupo
const precioPromedioPorCategoria = await qb
  .select([
    'c.nombre as categoria',
    'AVG(p.precio) as precio_promedio'
  ])
  .from('productos', 'p')
  .innerJoin('categorias', 'c')
  .on('c.id = p.categoria_id')
  .groupBy(['c.id', 'c.nombre'])
  .execute();
```

### min() y max()

Encuentran los valores mínimo y máximo.

```javascript
// Rango de precios
const rangoPrecios = await qb
  .select([
    'MIN(precio) as precio_minimo',
    'MAX(precio) as precio_maximo',
    'MAX(precio) - MIN(precio) as diferencia'
  ])
  .from('productos')
  .where('activo = ?', [1])
  .execute();

// Por categoría
const rangoPorCategoria = await qb
  .select([
    'categoria_id',
    'MIN(precio) as min_precio',
    'MAX(precio) as max_precio'
  ])
  .from('productos')
  .groupBy(['categoria_id'])
  .execute();
```

## Funciones de Cadenas (String)

### concat()

Concatena múltiples cadenas.

```javascript
// Concatenar nombre completo
const nombresCompletos = await qb
  .select([
    'CONCAT(nombre, " ", apellido) as nombre_completo',
    'email'
  ])
  .from('usuarios')
  .execute();

// Concatenar con separadores
const direccionesCompletas = await qb
  .select([
    'CONCAT_WS(", ", calle, ciudad, codigo_postal, pais) as direccion_completa'
  ])
  .from('direcciones')
  .execute();
```

### substring()

Extrae parte de una cadena.

```javascript
// Primeras 3 letras
const iniciales = await qb
  .select([
    'nombre',
    'SUBSTRING(nombre, 1, 3) as iniciales'
  ])
  .from('usuarios')
  .execute();

// Dominio del email
const dominios = await qb
  .select([
    'SUBSTRING(email, LOCATE("@", email) + 1) as dominio',
    'COUNT(*) as cantidad'
  ])
  .from('usuarios')
  .groupBy(['dominio'])
  .execute();
```

### upper() y lower()

Convierten texto a mayúsculas o minúsculas.

```javascript
// Normalizar datos
const normalizados = await qb
  .select([
    'UPPER(nombre) as nombre_mayusculas',
    'LOWER(email) as email_minusculas'
  ])
  .from('usuarios')
  .execute();

// Búsqueda case-insensitive
const busqueda = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('LOWER(nombre) LIKE LOWER(?)', ['%juan%'])
  .execute();
```

### trim()

Elimina espacios al inicio y final.

```javascript
// Limpiar datos
const limpios = await qb
  .select([
    'TRIM(nombre) as nombre_limpio',
    'LTRIM(RTRIM(descripcion)) as descripcion_limpia'
  ])
  .from('productos')
  .execute();
```

### length()

Obtiene la longitud de una cadena.

```javascript
// Longitud de campos
const longitudes = await qb
  .select([
    'nombre',
    'LENGTH(nombre) as longitud_nombre',
    'LENGTH(descripcion) as longitud_descripcion'
  ])
  .from('productos')
  .where('LENGTH(nombre) > ?', [20])
  .execute();
```

### replace()

Reemplaza texto dentro de una cadena.

```javascript
// Reemplazar texto
const reemplazados = await qb
  .select([
    'nombre',
    'REPLACE(descripcion, "antiguo", "nuevo") as descripcion_actualizada'
  ])
  .from('productos')
  .execute();

// Limpiar caracteres especiales
const limpios = await qb
  .select([
    'REPLACE(REPLACE(telefono, "-", ""), " ", "") as telefono_limpio'
  ])
  .from('usuarios')
  .execute();
```

## Funciones de Fecha y Tiempo

### now()

Obtiene la fecha y hora actual.

```javascript
// Timestamp actual
const registrosRecientes = await qb
  .select(['*'])
  .from('logs')
  .where('fecha_creacion >= DATE_SUB(NOW(), INTERVAL 1 HOUR)')
  .execute();
```

### dateFormat()

Formatea fechas según un patrón.

```javascript
// Formatear fechas
const fechasFormateadas = await qb
  .select([
    'nombre',
    'DATE_FORMAT(fecha_registro, "%d/%m/%Y") as fecha_legible',
    'DATE_FORMAT(fecha_registro, "%Y-%m") as año_mes'
  ])
  .from('usuarios')
  .execute();
```

### dateAdd() y dateSub()

Suman o restan intervalos de tiempo.

```javascript
// Calcular fechas futuras
const fechasVencimiento = await qb
  .select([
    'id',
    'fecha_compra',
    'DATE_ADD(fecha_compra, INTERVAL 1 YEAR) as fecha_vencimiento'
  ])
  .from('suscripciones')
  .execute();

// Registros de los últimos N días
const recientes = await qb
  .select(['*'])
  .from('pedidos')
  .where('fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)')
  .execute();
```

### year(), month(), day()

Extraen partes específicas de una fecha.

```javascript
// Estadísticas por período
const ventasPorMes = await qb
  .select([
    'YEAR(fecha) as año',
    'MONTH(fecha) as mes',
    'COUNT(*) as total_ventas',
    'SUM(total) as ingresos'
  ])
  .from('pedidos')
  .where('YEAR(fecha) = ?', [2024])
  .groupBy(['YEAR(fecha)', 'MONTH(fecha)'])
  .orderBy(['año', 'mes'])
  .execute();
```

### dayOfWeek(), weekDay()

Obtienen el día de la semana.

```javascript
// Análisis por día de la semana
const ventasPorDia = await qb
  .select([
    'DAYNAME(fecha) as dia_semana',
    'COUNT(*) as total_pedidos',
    'AVG(total) as ticket_promedio'
  ])
  .from('pedidos')
  .groupBy(['DAYOFWEEK(fecha)', 'DAYNAME(fecha)'])
  .orderBy(['DAYOFWEEK(fecha)'])
  .execute();
```

### timestampDiff()

Calcula diferencias entre fechas.

```javascript
// Tiempo transcurrido
const tiemposTranscurridos = await qb
  .select([
    'id',
    'fecha_inicio',
    'fecha_fin',
    'TIMESTAMPDIFF(HOUR, fecha_inicio, fecha_fin) as horas_duracion',
    'TIMESTAMPDIFF(DAY, fecha_inicio, fecha_fin) as dias_duracion'
  ])
  .from('proyectos')
  .where('fecha_fin IS NOT NULL')
  .execute();
```

## Funciones Matemáticas

### round()

Redondea números decimales.

```javascript
// Redondear precios
const preciosRedondeados = await qb
  .select([
    'nombre',
    'precio',
    'ROUND(precio, 2) as precio_redondeado',
    'ROUND(precio * 1.21, 2) as precio_con_iva'
  ])
  .from('productos')
  .execute();
```

### ceil() y floor()

Redondean hacia arriba o hacia abajo.

```javascript
const calculos = await qb
  .select([
    'precio',
    'CEIL(precio) as precio_techo',
    'FLOOR(precio) as precio_piso'
  ])
  .from('productos')
  .execute();
```

### abs()

Valor absoluto de un número.

```javascript
const diferencias = await qb
  .select([
    'presupuesto',
    'gasto_real',
    'ABS(presupuesto - gasto_real) as diferencia_absoluta'
  ])
  .from('proyectos')
  .execute();
```

### power() y sqrt()

Potencia y raíz cuadrada.

```javascript
const calculos = await qb
  .select([
    'valor',
    'POWER(valor, 2) as valor_cuadrado',
    'SQRT(valor) as raiz_cuadrada'
  ])
  .from('mediciones')
  .execute();
```

## Funciones Condicionales

### case()

Lógica condicional similar a switch.

```javascript
// Categorizar por edad
const categoriasEdad = await qb
  .select([
    'nombre',
    'edad',
    `CASE 
       WHEN edad < 18 THEN 'Menor'
       WHEN edad BETWEEN 18 AND 65 THEN 'Adulto'
       ELSE 'Mayor'
     END as categoria_edad`
  ])
  .from('usuarios')
  .execute();

// Estado de stock
const estadoStock = await qb
  .select([
    'nombre',
    'stock',
    `CASE 
       WHEN stock = 0 THEN 'Agotado'
       WHEN stock < 10 THEN 'Poco Stock'
       WHEN stock < 50 THEN 'Stock Normal'
       ELSE 'Stock Alto'
     END as estado_stock`
  ])
  .from('productos')
  .execute();
```

### if()

Función condicional simple.

```javascript
const conDescuentos = await qb
  .select([
    'nombre',
    'precio',
    'IF(precio > 100, precio * 0.9, precio) as precio_final'
  ])
  .from('productos')
  .execute();
```

### ifNull() y coalesce()

Manejan valores NULL.

```javascript
// Valores por defecto
const conDefectos = await qb
  .select([
    'nombre',
    'IFNULL(telefono, "No especificado") as telefono',
    'COALESCE(telefono_movil, telefono_fijo, "Sin teléfono") as contacto'
  ])
  .from('usuarios')
  .execute();
```

## Funciones de Ranking y Ventana

### rowNumber()

Asigna números de fila.

```javascript
// Ranking de ventas
const rankingVentas = await qb
  .select([
    'nombre',
    'total_ventas',
    'ROW_NUMBER() OVER (ORDER BY total_ventas DESC) as ranking'
  ])
  .from('vendedores')
  .execute();
```

### rank() y denseRank()

Ranking con empates.

```javascript
const rankingConEmpates = await qb
  .select([
    'estudiante',
    'calificacion',
    'RANK() OVER (ORDER BY calificacion DESC) as ranking',
    'DENSE_RANK() OVER (ORDER BY calificacion DESC) as ranking_denso'
  ])
  .from('exámenes')
  .execute();
```

## Ejemplo Completo: Dashboard Analytics

```javascript
class AnalyticsService {
  constructor(queryBuilder) {
    this.qb = queryBuilder;
  }

  async getDashboardMetrics(fechaInicio, fechaFin) {
    // Métricas generales
    const metricas = await this.qb
      .select([
        'COUNT(DISTINCT p.id) as total_pedidos',
        'COUNT(DISTINCT u.id) as usuarios_activos',
        'SUM(p.total) as ingresos_totales',
        'AVG(p.total) as ticket_promedio',
        'MAX(p.total) as venta_maxima',
        'MIN(p.total) as venta_minima'
      ])
      .from('pedidos', 'p')
      .innerJoin('usuarios', 'u')
      .on('u.id = p.usuario_id')
      .where('p.fecha BETWEEN ? AND ?', [fechaInicio, fechaFin])
      .and('p.estado = ?', ['completado'])
      .execute();

    // Ventas por día
    const ventasDiarias = await this.qb
      .select([
        'DATE(fecha) as dia',
        'COUNT(*) as num_pedidos',
        'SUM(total) as ingresos',
        'AVG(total) as ticket_promedio',
        'DAYNAME(fecha) as nombre_dia'
      ])
      .from('pedidos')
      .where('fecha BETWEEN ? AND ?', [fechaInicio, fechaFin])
      .and('estado = ?', ['completado'])
      .groupBy(['DATE(fecha)'])
      .orderBy(['fecha'])
      .execute();

    // Top productos
    const topProductos = await this.qb
      .select([
        'pr.nombre',
        'COUNT(dp.id) as unidades_vendidas',
        'SUM(dp.precio * dp.cantidad) as ingresos_producto',
        'ROUND(AVG(dp.precio), 2) as precio_promedio'
      ])
      .from('detalle_pedidos', 'dp')
      .innerJoin('productos', 'pr')
      .on('pr.id = dp.producto_id')
      .innerJoin('pedidos', 'p')
      .on('p.id = dp.pedido_id')
      .where('p.fecha BETWEEN ? AND ?', [fechaInicio, fechaFin])
      .and('p.estado = ?', ['completado'])
      .groupBy(['pr.id', 'pr.nombre'])
      .orderBy(['unidades_vendidas'], 'DESC')
      .limit(10)
      .execute();

    // Categorización de clientes
    const categoriasClientes = await this.qb
      .select([
        `CASE 
           WHEN total_gastado < 100 THEN 'Básico'
           WHEN total_gastado BETWEEN 100 AND 500 THEN 'Intermedio'
           WHEN total_gastado BETWEEN 500 AND 1000 THEN 'Premium'
           ELSE 'VIP'
         END as categoria_cliente`,
        'COUNT(*) as num_clientes',
        'AVG(total_gastado) as gasto_promedio'
      ])
      .from(
        this.qb.select([
          'u.id',
          'u.nombre',
          'SUM(p.total) as total_gastado'
        ])
        .from('usuarios', 'u')
        .innerJoin('pedidos', 'p')
        .on('p.usuario_id = u.id')
        .where('p.fecha BETWEEN ? AND ?', [fechaInicio, fechaFin])
        .and('p.estado = ?', ['completado'])
        .groupBy(['u.id', 'u.nombre'])
        .as('clientes_gastado')
      )
      .groupBy(['categoria_cliente'])
      .orderBy(['gasto_promedio'], 'DESC')
      .execute();

    return {
      metricas: metricas[0],
      ventasDiarias,
      topProductos,
      categoriasClientes
    };
  }
}
```