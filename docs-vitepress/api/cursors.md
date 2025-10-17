# Cursors - Gestión de Cursores

Los cursores permiten procesar grandes conjuntos de resultados de forma eficiente, procesando los datos fila por fila sin cargar todo en memoria.

## ¿Qué son los Cursores?

Un cursor es un objeto de base de datos que permite navegar a través de un conjunto de resultados fila por fila. Son especialmente útiles para:

- Procesar grandes volúmenes de datos sin agotar la memoria
- Implementar paginación eficiente
- Procesar datos de forma streaming
- Operaciones que requieren procesamiento secuencial

## createCursor()

Crea un nuevo cursor para una consulta.

### Sintaxis

```javascript
const cursor = queryBuilder.createCursor(query, options)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `query` | `QueryBuilder` | Consulta para el cursor |
| `options` | `Object` | Opciones del cursor |

### Ejemplos

```javascript
// Cursor básico
const cursor = qb.createCursor(
  qb.select(['id', 'nombre', 'email'])
    .from('usuarios')
    .where('activo = ?', [1])
);

// Cursor con opciones
const cursorConOpciones = qb.createCursor(
  qb.select(['*']).from('logs'),
  {
    batchSize: 1000,        // Tamaño del lote
    timeout: 30000,         // Timeout en ms
    readOnly: true,         // Solo lectura
    scrollable: true        // Permite navegación bidireccional
  }
);
```

## openCursor()

Abre un cursor y lo prepara para la navegación.

### Sintaxis

```javascript
await cursor.open()
```

### Ejemplo

```javascript
const cursor = qb.createCursor(
  qb.select(['id', 'data'])
    .from('big_table')
    .orderBy(['id'])
);

await cursor.open();
```

## fetch()

Obtiene la siguiente fila o conjunto de filas del cursor.

### Sintaxis

```javascript
const row = await cursor.fetch()
const rows = await cursor.fetch(count)
```

### Ejemplos

```javascript
// Obtener una fila
const fila = await cursor.fetch();
if (fila) {
  console.log('Datos:', fila);
}

// Obtener múltiples filas
const filas = await cursor.fetch(10); // 10 filas
console.log(`Obtenidas ${filas.length} filas`);

// Procesamiento fila por fila
while (true) {
  const fila = await cursor.fetch();
  if (!fila) break; // No hay más filas
  
  await procesarFila(fila);
}
```

## fetchAll()

Obtiene todas las filas restantes del cursor.

```javascript
// Obtener todas las filas restantes
const todasLasFilas = await cursor.fetchAll();

// Con límite máximo
const filasLimitadas = await cursor.fetchAll({ limit: 5000 });
```

## Navegación del Cursor

### next()

Mueve el cursor a la siguiente fila.

```javascript
// Navegar manualmente
while (await cursor.next()) {
  const fila = await cursor.getCurrentRow();
  await procesarFila(fila);
}
```

### previous()

Mueve el cursor a la fila anterior (si es scrollable).

```javascript
// Cursor scrollable
const cursor = qb.createCursor(query, { scrollable: true });
await cursor.open();

// Navegar hacia adelante
await cursor.next();
await cursor.next();

// Navegar hacia atrás
await cursor.previous();
const fila = await cursor.getCurrentRow();
```

### first() y last()

Mueve el cursor al primer o último registro.

```javascript
// Ir al primer registro
await cursor.first();
const primerRegistro = await cursor.getCurrentRow();

// Ir al último registro
await cursor.last();
const ultimoRegistro = await cursor.getCurrentRow();
```

### absolute()

Mueve el cursor a una posición específica.

```javascript
// Ir a la fila 100
await cursor.absolute(100);
const fila100 = await cursor.getCurrentRow();

// Ir 50 filas desde la posición actual
await cursor.relative(50);
```

## Gestión del Cursor

### close()

Cierra el cursor y libera recursos.

```javascript
try {
  const cursor = qb.createCursor(query);
  await cursor.open();
  
  // Procesar datos...
  
} finally {
  await cursor.close(); // Siempre cerrar el cursor
}
```

### isOpen()

Verifica si el cursor está abierto.

```javascript
if (cursor.isOpen()) {
  const fila = await cursor.fetch();
}
```

### getPosition()

Obtiene la posición actual del cursor.

```javascript
const posicion = cursor.getPosition();
console.log(`Cursor en posición: ${posicion}`);
```

## Patrones de Uso Comunes

### Procesamiento por Lotes

```javascript
async function procesarEnLotes(query, tamañoLote = 1000) {
  const cursor = qb.createCursor(query, { batchSize: tamañoLote });
  
  try {
    await cursor.open();
    let procesados = 0;
    
    while (true) {
      const lote = await cursor.fetch(tamañoLote);
      if (lote.length === 0) break;
      
      // Procesar lote
      await procesarLoteDeFilas(lote);
      procesados += lote.length;
      
      console.log(`Procesadas ${procesados} filas`);
    }
    
    return procesados;
    
  } finally {
    await cursor.close();
  }
}

// Uso
await procesarEnLotes(
  qb.select(['*'])
    .from('usuarios')
    .where('fecha_registro >= ?', ['2024-01-01']),
  500
);
```

### Streaming de Datos

```javascript
async function* streamData(query) {
  const cursor = qb.createCursor(query);
  
  try {
    await cursor.open();
    
    while (true) {
      const fila = await cursor.fetch();
      if (!fila) break;
      
      yield fila; // Yield cada fila
    }
    
  } finally {
    await cursor.close();
  }
}

// Uso con async generator
for await (const usuario of streamData(qb.select(['*']).from('usuarios'))) {
  console.log('Procesando usuario:', usuario.nombre);
}
```

### Paginación Eficiente

```javascript
class CursorPaginator {
  constructor(queryBuilder, query, pageSize = 20) {
    this.qb = queryBuilder;
    this.query = query;
    this.pageSize = pageSize;
    this.cursor = null;
  }
  
  async initialize() {
    this.cursor = this.qb.createCursor(this.query, {
      scrollable: true,
      batchSize: this.pageSize
    });
    await this.cursor.open();
  }
  
  async getPage(pageNumber) {
    if (!this.cursor) await this.initialize();
    
    const position = (pageNumber - 1) * this.pageSize;
    await this.cursor.absolute(position);
    
    return await this.cursor.fetch(this.pageSize);
  }
  
  async getNextPage() {
    if (!this.cursor) await this.initialize();
    
    return await this.cursor.fetch(this.pageSize);
  }
  
  async close() {
    if (this.cursor) {
      await this.cursor.close();
      this.cursor = null;
    }
  }
}

// Uso
const paginator = new CursorPaginator(
  qb,
  qb.select(['id', 'nombre', 'email'])
    .from('usuarios')
    .orderBy(['id']),
  50
);

try {
  // Obtener página específica
  const pagina3 = await paginator.getPage(3);
  
  // Obtener siguiente página
  const siguientePagina = await paginator.getNextPage();
  
} finally {
  await paginator.close();
}
```

## Cursores con Filtros Dinámicos

```javascript
async function procesarConFiltros(filtros) {
  let query = qb
    .select(['id', 'nombre', 'email', 'fecha_registro'])
    .from('usuarios');
  
  // Aplicar filtros dinámicamente
  if (filtros.activo !== undefined) {
    query = query.where('activo = ?', [filtros.activo]);
  }
  
  if (filtros.fechaDesde) {
    query = query.and('fecha_registro >= ?', [filtros.fechaDesde]);
  }
  
  if (filtros.pais) {
    query = query.and('pais = ?', [filtros.pais]);
  }
  
  query = query.orderBy(['id']);
  
  const cursor = qb.createCursor(query, { batchSize: 500 });
  
  try {
    await cursor.open();
    let procesados = 0;
    
    while (true) {
      const usuarios = await cursor.fetch(100);
      if (usuarios.length === 0) break;
      
      for (const usuario of usuarios) {
        // Aplicar lógica de procesamiento
        if (await validarUsuario(usuario)) {
          await actualizarUsuario(usuario);
          procesados++;
        }
      }
    }
    
    return procesados;
    
  } finally {
    await cursor.close();
  }
}
```

## Cursores con Joins Complejos

```javascript
async function generarReporteCompleto() {
  const query = qb
    .select([
      'u.id',
      'u.nombre',
      'u.email',
      'COUNT(p.id) as total_pedidos',
      'SUM(p.total) as total_gastado',
      'MAX(p.fecha) as ultimo_pedido'
    ])
    .from('usuarios', 'u')
    .leftJoin('pedidos', 'p')
    .on('p.usuario_id = u.id')
    .where('u.activo = ?', [1])
    .groupBy(['u.id', 'u.nombre', 'u.email'])
    .having('COUNT(p.id) > ?', [0])
    .orderBy(['total_gastado'], 'DESC');
  
  const cursor = qb.createCursor(query, { batchSize: 100 });
  const reporte = [];
  
  try {
    await cursor.open();
    
    while (true) {
      const clientes = await cursor.fetch(50);
      if (clientes.length === 0) break;
      
      for (const cliente of clientes) {
        reporte.push({
          ...cliente,
          categoria: clasificarCliente(cliente.total_gastado),
          dias_inactivo: calcularDiasInactividad(cliente.ultimo_pedido)
        });
      }
    }
    
    return reporte;
    
  } finally {
    await cursor.close();
  }
}
```

## Manejo de Errores

```javascript
async function procesarConManejoErrores(query) {
  const cursor = qb.createCursor(query);
  let procesados = 0;
  let errores = 0;
  
  try {
    await cursor.open();
    
    while (true) {
      try {
        const fila = await cursor.fetch();
        if (!fila) break;
        
        await procesarFila(fila);
        procesados++;
        
      } catch (error) {
        console.error(`Error procesando fila en posición ${cursor.getPosition()}:`, error);
        errores++;
        
        // Continuar con la siguiente fila
        continue;
      }
    }
    
  } catch (cursorError) {
    console.error('Error con el cursor:', cursorError);
    throw cursorError;
    
  } finally {
    await cursor.close();
  }
  
  return { procesados, errores };
}
```

## Cursores con Transacciones

```javascript
async function procesamientoTransaccional(query) {
  await qb.startTransaction();
  
  try {
    const cursor = qb.createCursor(query);
    await cursor.open();
    
    let lote = [];
    const tamañoLote = 100;
    
    while (true) {
      const fila = await cursor.fetch();
      if (!fila) {
        // Procesar último lote
        if (lote.length > 0) {
          await procesarLoteTransaccional(lote);
        }
        break;
      }
      
      lote.push(fila);
      
      if (lote.length >= tamañoLote) {
        await procesarLoteTransaccional(lote);
        lote = [];
      }
    }
    
    await cursor.close();
    await qb.commit();
    
  } catch (error) {
    await qb.rollback();
    throw error;
  }
}

async function procesarLoteTransaccional(lote) {
  const savepoint = await qb.savepoint('lote_procesamiento');
  
  try {
    for (const fila of lote) {
      // Procesar cada fila del lote
      await actualizarRegistro(fila);
    }
    
  } catch (error) {
    await qb.rollbackTo('lote_procesamiento');
    throw error;
  }
}
```

## Monitoreo y Performance

```javascript
class CursorMonitor {
  constructor(cursor) {
    this.cursor = cursor;
    this.stats = {
      filasLeidas: 0,
      tiempoInicio: null,
      tiempoTotal: 0,
      velocidadPromedio: 0
    };
  }
  
  async open() {
    this.stats.tiempoInicio = Date.now();
    return await this.cursor.open();
  }
  
  async fetch(count = 1) {
    const inicio = Date.now();
    const resultado = await this.cursor.fetch(count);
    const tiempoOperacion = Date.now() - inicio;
    
    this.stats.filasLeidas += Array.isArray(resultado) ? resultado.length : (resultado ? 1 : 0);
    this.stats.tiempoTotal += tiempoOperacion;
    
    if (this.stats.filasLeidas > 0) {
      this.stats.velocidadPromedio = this.stats.filasLeidas / (this.stats.tiempoTotal / 1000);
    }
    
    return resultado;
  }
  
  async close() {
    const result = await this.cursor.close();
    
    console.log('Estadísticas del cursor:', {
      filasLeidas: this.stats.filasLeidas,
      tiempoTotalMs: this.stats.tiempoTotal,
      velocidadFilasPorSegundo: Math.round(this.stats.velocidadPromedio)
    });
    
    return result;
  }
  
  getStats() {
    return { ...this.stats };
  }
}

// Uso
const cursor = new CursorMonitor(qb.createCursor(query));
await cursor.open();

while (true) {
  const filas = await cursor.fetch(100);
  if (filas.length === 0) break;
  
  // Procesar filas...
}

await cursor.close();
```