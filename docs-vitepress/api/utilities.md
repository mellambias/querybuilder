# Utilities - Funciones de Utilidad

Las funciones de utilidad proporcionan herramientas auxiliares para validación, depuración, configuración y operaciones comunes con QueryBuilder.

## validate()

Valida la sintaxis y estructura de una consulta antes de ejecutarla.

### Sintaxis

```javascript
const validation = queryBuilder.validate()
```

### Retorna

```javascript
{
  isValid: boolean,
  errors: Array<string>,
  warnings: Array<string>,
  suggestions: Array<string>
}
```

### Ejemplos

```javascript
// Validar consulta SELECT
const query = qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('edad > ?', [18]);

const validation = query.validate();

if (!validation.isValid) {
  console.log('Errores:', validation.errors);
  console.log('Advertencias:', validation.warnings);
} else {
  const result = await query.execute();
}

// Validación detallada
const complexQuery = qb
  .select(['u.nombre', 'p.total'])
  .from('usuarios', 'u')
  .leftJoin('pedidos', 'p')
  .on('p.usuario_id = u.id')
  .where('u.activo = ?', [1])
  .groupBy(['u.id'])
  .having('COUNT(p.id) > ?', [5]);

const detailedValidation = complexQuery.validate();
console.log('Sugerencias:', detailedValidation.suggestions);
```

## debug()

Proporciona información de depuración sobre la consulta.

### Sintaxis

```javascript
const debugInfo = queryBuilder.debug(options)
```

### Opciones

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `includeParams` | `boolean` | Incluir parámetros de la consulta |
| `explainPlan` | `boolean` | Mostrar plan de ejecución |
| `showTiming` | `boolean` | Mostrar información de tiempo |

### Ejemplos

```javascript
// Debug básico
const query = qb
  .select(['*'])
  .from('usuarios')
  .where('edad BETWEEN ? AND ?', [18, 65]);

const debugInfo = query.debug();
console.log('SQL generado:', debugInfo.sql);
console.log('Parámetros:', debugInfo.parameters);

// Debug con plan de ejecución
const debugWithPlan = query.debug({
  explainPlan: true,
  showTiming: true
});

console.log('Plan de ejecución:', debugWithPlan.executionPlan);
console.log('Tiempo estimado:', debugWithPlan.estimatedTime);

// Debug durante la ejecución
const result = await query
  .debug({ includeParams: true })
  .execute();
```

## explain()

Obtiene el plan de ejecución de la consulta.

```javascript
// Plan de ejecución básico
const plan = await qb
  .select(['u.nombre', 'COUNT(p.id) as pedidos'])
  .from('usuarios', 'u')
  .leftJoin('pedidos', 'p')
  .on('p.usuario_id = u.id')
  .groupBy(['u.id'])
  .explain();

console.log('Tipo de plan:', plan.type);
console.log('Costo estimado:', plan.cost);
console.log('Filas estimadas:', plan.rows);

// Plan detallado
const detailedPlan = await query.explain({ 
  format: 'JSON',
  analyze: true 
});
```

## getSQL()

Obtiene la consulta SQL generada sin ejecutarla.

```javascript
// SQL básico
const sql = qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('activo = ?', [1])
  .getSQL();

console.log('SQL:', sql.query);
console.log('Parámetros:', sql.parameters);

// SQL con parámetros interpolados (para debug)
const sqlInterpolated = qb
  .select(['*'])
  .from('productos')
  .where('precio BETWEEN ? AND ?', [10, 100])
  .getSQL({ interpolate: true });

console.log('SQL con valores:', sqlInterpolated);
```

## reset()

Reinicia el estado del QueryBuilder.

```javascript
// Reiniciar completamente
qb.select(['nombre'])
  .from('usuarios')
  .where('activo = ?', [1]);

qb.reset(); // Limpia todo

// Ahora podemos construir una nueva consulta
qb.select(['*'])
  .from('productos');

// Reiniciar selectivamente
qb.reset('where'); // Solo reinicia condiciones WHERE
qb.reset(['select', 'from']); // Reinicia SELECT y FROM
```

## clone()

Crea una copia independiente del QueryBuilder.

```javascript
// Consulta base
const baseQuery = qb
  .select(['id', 'nombre', 'email'])
  .from('usuarios')
  .where('activo = ?', [1]);

// Crear variaciones
const usuariosPremium = baseQuery
  .clone()
  .and('tipo = ?', ['premium'])
  .orderBy(['nombre']);

const usuariosRecientes = baseQuery
  .clone()
  .and('fecha_registro >= ?', ['2024-01-01'])
  .orderBy(['fecha_registro'], 'DESC');

// Ambas consultas son independientes
const premium = await usuariosPremium.execute();
const recientes = await usuariosRecientes.execute();
```

## raw()

Permite insertar SQL crudo en la consulta.

```javascript
// Expresiones SQL crudas
const query = qb
  .select([
    'nombre',
    qb.raw('UPPER(email) as email_mayusculas'),
    qb.raw('DATEDIFF(NOW(), fecha_registro) as dias_registro')
  ])
  .from('usuarios')
  .where(qb.raw('MONTH(fecha_registro) = ?'), [new Date().getMonth() + 1]);

// En UPDATE
await qb
  .update('productos', {
    stock: qb.raw('stock - ?', [cantidad]),
    fecha_actualizacion: qb.raw('NOW()')
  })
  .where('id = ?', [productoId])
  .execute();

// En condiciones complejas
const complexCondition = await qb
  .select(['*'])
  .from('pedidos')
  .where(qb.raw('YEAR(fecha) = ? AND MONTH(fecha) = ?'), [2024, 3])
  .execute();
```

## escape()

Escapa valores para prevenir inyecciones SQL.

```javascript
// Escapar valores individuales
const nombreEscapado = qb.escape("O'Reilly");
const emailEscapado = qb.escape('user@domain.com');

// Escapar identificadores (nombres de tabla/columna)
const tablaEscapada = qb.escapeId('user-table');
const columnaEscapada = qb.escapeId('user-name');

// Uso en consultas dinámicas
function buscarEnTabla(tabla, columna, valor) {
  return qb
    .select(['*'])
    .from(qb.escapeId(tabla))
    .where(`${qb.escapeId(columna)} = ?`, [valor]);
}
```

## paginate()

Implementa paginación automática.

```javascript
// Paginación básica
const resultado = await qb
  .select(['nombre', 'email'])
  .from('usuarios')
  .where('activo = ?', [1])
  .paginate(2, 20); // Página 2, 20 elementos por página

console.log('Datos:', resultado.data);
console.log('Total:', resultado.total);
console.log('Página actual:', resultado.currentPage);
console.log('Total páginas:', resultado.totalPages);

// Paginación con metadatos adicionales
const paginationOptions = {
  page: 3,
  limit: 50,
  includeCount: true,
  includePrevNext: true
};

const paginatedResult = await qb
  .select(['*'])
  .from('productos')
  .orderBy(['nombre'])
  .paginate(paginationOptions);

console.log('Siguiente página:', paginatedResult.nextPage);
console.log('Página anterior:', paginatedResult.prevPage);
```

## batch()

Ejecuta operaciones en lotes para mejorar performance.

```javascript
// Inserción en lotes
const usuarios = [
  { nombre: 'Juan', email: 'juan@example.com' },
  { nombre: 'María', email: 'maria@example.com' },
  // ... más usuarios
];

const resultado = await qb
  .batch()
  .insert('usuarios', usuarios)
  .batchSize(100) // 100 registros por lote
  .execute();

console.log('Registros insertados:', resultado.affectedRows);

// Actualización en lotes
const actualizaciones = [
  { id: 1, stock: 50 },
  { id: 2, stock: 75 },
  // ... más actualizaciones
];

await qb
  .batch()
  .update('productos', actualizaciones, 'id') // 'id' es la clave
  .batchSize(50)
  .execute();
```

## cache()

Implementa caché de consultas.

```javascript
// Caché básico (5 minutos)
const usuarios = await qb
  .select(['*'])
  .from('usuarios')
  .where('activo = ?', [1])
  .cache(300) // 300 segundos
  .execute();

// Caché con clave personalizada
const productos = await qb
  .select(['*'])
  .from('productos')
  .where('categoria_id = ?', [1])
  .cache(600, 'productos_categoria_1')
  .execute();

// Invalidar caché
qb.clearCache('productos_categoria_1');

// Configuración global de caché
qb.setCacheConfig({
  driver: 'redis',
  ttl: 3600,
  prefix: 'qb_cache:'
});
```

## performance()

Métricas de rendimiento de consultas.

```javascript
// Habilitar métricas
qb.enablePerformanceTracking();

// Ejecutar consultas
await qb.select(['*']).from('usuarios').execute();
await qb.select(['*']).from('productos').execute();

// Obtener estadísticas
const stats = qb.getPerformanceStats();

console.log('Consultas ejecutadas:', stats.totalQueries);
console.log('Tiempo promedio:', stats.averageTime);
console.log('Consulta más lenta:', stats.slowestQuery);

// Métricas por consulta
const queryMetrics = await qb
  .select(['*'])
  .from('big_table')
  .measure() // Mide esta consulta específica
  .execute();

console.log('Tiempo de ejecución:', queryMetrics.executionTime);
console.log('Filas devueltas:', queryMetrics.rowCount);
```

## Utilities de Configuración

### setConfig()

Configura opciones globales del QueryBuilder.

```javascript
// Configuración general
qb.setConfig({
  // Configuración de conexión
  connection: {
    host: 'localhost',
    port: 3306,
    database: 'mi_app',
    pool: {
      min: 2,
      max: 10
    }
  },
  
  // Configuración de logging
  logging: {
    enabled: true,
    level: 'info',
    logQueries: true,
    logErrors: true
  },
  
  // Configuración de caché
  cache: {
    enabled: true,
    ttl: 3600,
    driver: 'memory'
  },
  
  // Configuración de validación
  validation: {
    strict: true,
    warnUnusedJoins: true,
    warnMissingIndexes: true
  }
});
```

### getConfig()

Obtiene la configuración actual.

```javascript
const config = qb.getConfig();
console.log('Configuración actual:', config);

// Obtener configuración específica
const cacheConfig = qb.getConfig('cache');
const loggingEnabled = qb.getConfig('logging.enabled');
```

## Utilities de Migración

### generateMigration()

Genera archivos de migración basados en cambios de esquema.

```javascript
// Generar migración
const migration = qb.generateMigration('add_user_preferences', {
  up: [
    qb.createTable('user_preferences', [
      { name: 'id', type: 'INT', primaryKey: true, autoIncrement: true },
      { name: 'user_id', type: 'INT', notNull: true },
      { name: 'theme', type: 'VARCHAR(20)', default: 'light' },
      { name: 'language', type: 'VARCHAR(5)', default: 'en' }
    ]),
    qb.addIndex('user_preferences', 'idx_user_id', ['user_id'])
  ],
  down: [
    qb.dropTable('user_preferences')
  ]
});

console.log('Archivo de migración generado:', migration.filename);
```

### executeMigrations()

Ejecuta migraciones pendientes.

```javascript
// Ejecutar todas las migraciones pendientes
const result = await qb.executeMigrations();
console.log('Migraciones ejecutadas:', result.executed);
console.log('Errores:', result.errors);

// Ejecutar migración específica
await qb.executeMigration('20240315_add_user_preferences');

// Rollback de migración
await qb.rollbackMigration('20240315_add_user_preferences');
```

## Ejemplo Completo: Sistema de Utilities

```javascript
class QueryBuilderManager {
  constructor() {
    this.qb = new QueryBuilder();
    this.setupConfiguration();
    this.setupLogging();
  }
  
  setupConfiguration() {
    this.qb.setConfig({
      validation: { strict: true },
      logging: { enabled: true, logQueries: true },
      cache: { enabled: true, ttl: 1800 },
      performance: { tracking: true }
    });
  }
  
  setupLogging() {
    this.qb.onQuery((sql, params, timing) => {
      console.log(`[${timing}ms] ${sql}`, params);
    });
    
    this.qb.onError((error, sql, params) => {
      console.error('Query Error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
    });
  }
  
  async executeWithValidation(queryBuilder) {
    // Validar antes de ejecutar
    const validation = queryBuilder.validate();
    
    if (!validation.isValid) {
      throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Query warnings:', validation.warnings);
    }
    
    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = queryBuilder.debug({ explainPlan: true });
      console.log('Execution plan:', debugInfo.executionPlan);
    }
    
    // Ejecutar con métricas
    const result = await queryBuilder.measure().execute();
    
    return result;
  }
  
  async optimizedPagination(baseQuery, page, limit) {
    // Clonar consulta para contar total
    const countQuery = baseQuery
      .clone()
      .reset('select')
      .reset('orderBy')
      .select(['COUNT(*) as total']);
    
    // Ejecutar ambas consultas en paralelo
    const [totalResult, dataResult] = await Promise.all([
      countQuery.execute(),
      baseQuery.paginate(page, limit)
    ]);
    
    return {
      data: dataResult.data,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }
  
  async safeExecute(queryBuilder, options = {}) {
    const { retries = 3, timeout = 30000 } = options;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Aplicar timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });
        
        const queryPromise = this.executeWithValidation(queryBuilder);
        
        return await Promise.race([queryPromise, timeoutPromise]);
        
      } catch (error) {
        console.warn(`Query attempt ${attempt} failed:`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  getHealthStatus() {
    const stats = this.qb.getPerformanceStats();
    const config = this.qb.getConfig();
    
    return {
      connection: this.qb.isConnected(),
      queries: {
        total: stats.totalQueries,
        averageTime: stats.averageTime,
        errorRate: stats.errorRate
      },
      cache: {
        enabled: config.cache.enabled,
        hitRate: this.qb.getCacheStats().hitRate
      },
      config: {
        validation: config.validation.strict,
        logging: config.logging.enabled
      }
    };
  }
}

// Uso
const qbManager = new QueryBuilderManager();

// Ejecutar consulta con todas las validaciones y optimizaciones
const usuarios = await qbManager.safeExecute(
  qb.select(['*']).from('usuarios').where('activo = ?', [1])
);

// Paginación optimizada
const productos = await qbManager.optimizedPagination(
  qb.select(['*']).from('productos').orderBy(['nombre']),
  1, // página
  20 // elementos por página
);

// Estado del sistema
const health = qbManager.getHealthStatus();
console.log('Estado del QueryBuilder:', health);
```