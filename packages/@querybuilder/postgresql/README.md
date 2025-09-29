# @querybuilder/postgresql

Implementación específica de PostgreSQL para QueryBuilder con soporte completo para características avanzadas de PostgreSQL 12+.

## 📦 Instalación

```bash
npm install @querybuilder/postgresql
# o
pnpm add @querybuilder/postgresql
```

## 🚀 Uso

### Versión Básica (Compatible con estándar SQL2006)

```javascript
import PostgreSQL from '@querybuilder/postgresql';

const qb = new PostgreSQL({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'username',
  password: 'password'
});

// Métodos estándar compatibles con Core
const users = await qb.select(['name', 'email'])
  .from('users')
  .where('active', true)
  .limit(10)
  .get();
```

### Versión Extendida (Características avanzadas de PostgreSQL)

```javascript
import PostgreSQLExtended from '@querybuilder/postgresql/extended';

const qb = new PostgreSQLExtended(config);

// JSON/JSONB operations
const users = await qb.select()
  .from('users')
  .jsonContains('preferences', {theme: 'dark'})
  .get();

// UPSERT (INSERT ... ON CONFLICT)
await qb.insertInto('users', {email: 'user@example.com', name: 'John'})
  .onConflict('email')
  .doUpdate({name: 'excluded.name'});

// Window Functions
const ranked = await qb.select([
  'name',
  qb.rowNumber().over().partitionBy('department').orderBy('salary', 'desc').as('rank')
]).from('employees').get();

// Common Table Expressions (CTEs)
const result = await qb.with('dept_avg', 
  qb.select(['department', qb.avg('salary').as('avg_salary')])
    .from('employees')
    .groupBy('department')
).select().from('dept_avg').get();
```

## 📋 Estructura de Módulos

### Imports Disponibles

```javascript
// Clase principal básica
import PostgreSQL from '@querybuilder/postgresql';

// Clase extendida con todas las características
import PostgreSQLExtended from '@querybuilder/postgresql/extended';

// Módulos específicos para uso granular
import * as PostgreSQLTypes from '@querybuilder/postgresql/types';
import * as PostgreSQLOperators from '@querybuilder/postgresql/operators';
import * as PostgreSQLFunctions from '@querybuilder/postgresql/functions';
import * as PostgreSQLFeatures from '@querybuilder/postgresql/features';
```

### Tipos de Datos (types.js)

```javascript
import { JsonTypes, SerialTypes, ArrayTypes } from '@querybuilder/postgresql/types';

// Tipos JSON/JSONB
JsonTypes.json()
JsonTypes.jsonb()

// Tipos Serial
SerialTypes.serial()
SerialTypes.bigserial()

// Tipos de Arrays
ArrayTypes.textArray()
ArrayTypes.intArray()
```

### Operadores (operators.js)

```javascript
import { JsonOperators, ArrayOperators } from '@querybuilder/postgresql/operators';

// Operadores JSON
JsonOperators.contains('@>')
JsonOperators.containedBy('<@')
JsonOperators.hasKey('?')

// Operadores de Arrays
ArrayOperators.overlap('&&')
ArrayOperators.contains('@>')
```

### Funciones (functions.js)

```javascript
import { JsonFunctions, ArrayFunctions, WindowFunctions } from '@querybuilder/postgresql/functions';

// Funciones JSON
JsonFunctions.jsonAgg()
JsonFunctions.jsonObjectAgg()

// Funciones de Arrays
ArrayFunctions.arrayAgg()
ArrayFunctions.arrayLength()

// Funciones de Ventana
WindowFunctions.rowNumber()
WindowFunctions.rank()
WindowFunctions.lag()
```

### Características Avanzadas (features.js)

```javascript
import { CTEBuilder, UpsertBuilder, WindowBuilder } from '@querybuilder/postgresql/features';

// Constructor de CTEs
const cte = new CTEBuilder('my_cte', baseQuery);

// Constructor de UPSERT
const upsert = new UpsertBuilder('users', data)
  .onConflict('email')
  .doUpdate(updateData);

// Constructor de Window Functions
const window = new WindowBuilder()
  .partitionBy('department')
  .orderBy('salary', 'desc');
```

## ✨ Características Principales

### ✅ Compatibilidad con Core QueryBuilder
- Extiende correctamente la clase Core
- Implementa todos los métodos estándar (dropDatabase, createType, createTable, etc.)
- Compatible con el patrón de herencia del QueryBuilder

### 🚀 Características Avanzadas de PostgreSQL

#### JSON/JSONB Support
- Operadores nativos (@>, <@, ?, ?&, ?|)
- Funciones de agregación JSON
- Path queries y extractions

#### Arrays
- Tipos de array nativos
- Operadores de arrays (&&, @>, <@)
- Funciones de manipulación de arrays

#### UPSERT (INSERT ... ON CONFLICT)
- Sintaxis completa ON CONFLICT
- DO UPDATE y DO NOTHING
- Constraint targeting

#### Window Functions
- ROW_NUMBER(), RANK(), DENSE_RANK()
- LAG(), LEAD()
- Partitioning y Ordering

#### Common Table Expressions (CTEs)
- WITH queries simples
- WITH RECURSIVE para queries recursivas
- Múltiples CTEs

#### Full-text Search
- Vectores tsvector y tsquery
- Configuraciones de idioma
- Ranking y highlighting

```javascript
// Buscar productos con metadata específica
const products = db.table('products')
    .select(['name', 'price', 'metadata'])
    .jsonContains('metadata', { category: 'electronics' })  // metadata @> '{"category":"electronics"}'
    .jsonHasKey('metadata', 'reviews')                      // metadata ? 'reviews'
    .jsonPath('metadata', '$.price', '>', 100);             // metadata->'price' > 100

// Actualizar campos JSON
const update = db.table('products')
    .where('id', 1)
    .jsonSet('metadata', '$.last_updated', new Date().toISOString())
    .jsonRemove('metadata', '$.deprecated_field')
    .update();
```

### UPSERT (INSERT ... ON CONFLICT)

```javascript
// UPSERT básico
const upsert = db.table('users')
    .insert({
        email: 'user@example.com',
        name: 'John Doe',
        created_at: 'NOW()'
    })
    .onConflict(['email'])
    .doUpdate({
        name: 'EXCLUDED.name',
        updated_at: 'NOW()'
    });

// UPSERT condicional
const conditionalUpsert = db.table('products')
    .insert({ sku: 'ABC123', price: 99.99 })
    .onConflict(['sku'])
    .doUpdate({ price: 'EXCLUDED.price' })
    .where('products.price != EXCLUDED.price');
```

### Window Functions

```javascript
// Ranking y numeración
const ranking = db.table('sales')
    .select(['product_id', 'amount', 'sale_date'])
    .rowNumber(['product_id'], ['amount DESC'], 'row_num')
    .rank(['product_id'], ['amount DESC'], 'rank')
    .lag('amount', 1, 0, ['product_id'], ['sale_date'], 'prev_amount');

// Agregaciones con ventana
const windowAgg = db.table('orders')
    .select(['customer_id', 'order_date', 'amount'])
    .sum('amount', ['customer_id'], [], 'total_by_customer')
    .avg('amount', ['customer_id'], ['order_date'], 'running_avg');
```

### Common Table Expressions (CTE)

```javascript
// CTE simple
const cteQuery = db
    .with('high_value_customers', 
        db.table('orders')
          .select(['customer_id'])
          .groupBy('customer_id')
          .having('SUM(amount)', '>', 1000)
    )
    .table('customers c')
    .join('high_value_customers hvc', 'c.id', 'hvc.customer_id')
    .select(['c.name', 'c.email']);

// CTE recursivo
const recursiveCTE = db
    .withRecursive('employee_hierarchy',
        // Base case
        db.table('employees').whereNull('manager_id'),
        // Recursive case
        db.table('employees e').join('employee_hierarchy eh', 'e.manager_id', 'eh.id')
    )
    .table('employee_hierarchy')
    .select(['name', 'level']);
```

### Array Operations

```javascript
// Consultas con arrays
const arrayQuery = db.table('posts')
    .select(['title', 'tags'])
    .arrayContains('tags', 'javascript')           // tags @> ARRAY['javascript']
    .arrayOverlaps('tags', ['web', 'frontend'])    // tags && ARRAY['web','frontend']
    .arrayLength('tags', '>', 2);                  // array_length(tags, 1) > 2

// Agregación de arrays
const arrayAgg = db.table('posts p')
    .join('post_tags pt', 'p.id', 'pt.post_id')
    .select(['p.title'])
    .arrayAgg('pt.tag_name', 'all_tags')
    .groupBy('p.title');
```

### Full-Text Search

```javascript
// Búsqueda de texto completo
const search = db.table('documents')
    .select(['id', 'title', 'content'])
    .fullTextSearch('content', 'javascript programming', 'english')
    .fullTextRank('content', 'javascript programming', 'english', 'rank')
    .fullTextHeadline('content', 'javascript programming', 'english', 'highlight')
    .orderBy('rank', 'DESC');
```

## 🎨 Características Avanzadas

### Importar Builders Específicos

```javascript
import { 
    CTEBuilder, 
    UpsertBuilder, 
    WindowBuilder, 
    FullTextSearchBuilder 
} from '@querybuilder/postgresql/features';

// Usar builders independientes
const cte = new CTEBuilder()
    .with('sales_summary', 'SELECT category, SUM(amount) FROM sales GROUP BY category')
    .withRecursive('hierarchy', 'base_query', 'recursive_query');

const upsert = new UpsertBuilder()
    .onConflict(['email'])
    .doUpdate({ updated_at: 'NOW()' })
    .where('users.active = true');
```

### Tipos de Datos PostgreSQL

```javascript
import { PostgreSQLTypes } from '@querybuilder/postgresql/types';

// Usar tipos específicos
const createTable = `
    CREATE TABLE advanced_table (
        id ${PostgreSQLTypes.SERIAL} PRIMARY KEY,
        uuid_field ${PostgreSQLTypes.UUID} DEFAULT gen_random_uuid(),
        json_field ${PostgreSQLTypes.JSONB},
        array_field ${PostgreSQLTypes.TEXT_ARRAY},
        network_field ${PostgreSQLTypes.INET}
    )
`;
```

### Operadores PostgreSQL

```javascript
import { PostgreSQLOperators } from '@querybuilder/postgresql/operators';

// Usar operadores específicos
const query = db.table('products')
    .whereRaw(`metadata ${PostgreSQLOperators.JSON_CONTAINS} '{"featured": true}'`)
    .whereRaw(`tags ${PostgreSQLOperators.ARRAY_OVERLAP} ARRAY['popular', 'trending']`);
```

### Funciones PostgreSQL

```javascript
import { PostgreSQLFunctions } from '@querybuilder/postgresql/functions';

// Usar funciones específicas
const query = db.table('sales')
    .select([
        'product_id',
        `${PostgreSQLFunctions.JSON_AGG}(amount) as amounts`,
        `${PostgreSQLFunctions.ARRAY_AGG}(sale_date) as dates`
    ])
    .groupBy('product_id');
```

## 🔧 Configuración

### Opciones de Conexión

```javascript
const config = {
    // Configuración básica
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'password',
    
    // Opciones específicas de PostgreSQL
    ssl: false,
    schema: 'public',
    searchPath: ['public', 'extensions'],
    
    // Pool de conexiones
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

const db = new PostgreSQL(config);
```

### Extensiones

```javascript
// Habilitar extensiones PostgreSQL
await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
await db.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
await db.raw('CREATE EXTENSION IF NOT EXISTS "unaccent"');
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests de desarrollo
npm run dev
```

## 📖 Documentación Completa

### Métodos JSON/JSONB

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `jsonContains(column, value)` | Operador `@>` | `metadata @> '{"type":"premium"}'` |
| `jsonContainedBy(column, value)` | Operador `<@` | `metadata <@ '{"type":"premium","active":true}'` |
| `jsonHasKey(column, key)` | Operador `?` | `metadata ? 'reviews'` |
| `jsonHasKeys(column, keys)` | Operador `?&` | `metadata ?& ARRAY['price','reviews']` |
| `jsonHasAnyKeys(column, keys)` | Operador `?|` | `metadata ?| ARRAY['price','discount']` |
| `jsonPath(column, path, operator, value)` | Operador `#>` | `metadata #> '{reviews,0,rating}' > 4` |
| `jsonSet(column, path, value)` | Función `jsonb_set()` | `jsonb_set(metadata, '{updated}', '"2024-01-01"')` |
| `jsonRemove(column, path)` | Operador `#-` | `metadata #- '{deprecated}'` |

### Métodos UPSERT

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `onConflict(columns)` | Define conflicto por columnas | `.onConflict(['email'])` |
| `onConflictConstraint(name)` | Define conflicto por constraint | `.onConflictConstraint('users_email_key')` |
| `doUpdate(values)` | Acción DO UPDATE SET | `.doUpdate({name: 'EXCLUDED.name'})` |
| `doNothing()` | Acción DO NOTHING | `.doNothing()` |

### Métodos Window Functions

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `rowNumber(partitions, orders, alias)` | ROW_NUMBER() | `.rowNumber(['category'], ['price DESC'], 'rank')` |
| `rank(partitions, orders, alias)` | RANK() | `.rank(['category'], ['sales DESC'], 'rank')` |
| `denseRank(partitions, orders, alias)` | DENSE_RANK() | `.denseRank(['region'], ['revenue DESC'], 'dense_rank')` |
| `lag(column, offset, default, partitions, orders, alias)` | LAG() | `.lag('amount', 1, 0, ['customer'], ['date'], 'prev_amount')` |
| `lead(column, offset, default, partitions, orders, alias)` | LEAD() | `.lead('amount', 1, 0, ['customer'], ['date'], 'next_amount')` |

### Métodos CTE

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `with(name, query)` | CTE simple | `.with('summary', subQuery)` |
| `withRecursive(name, baseQuery, recursiveQuery)` | CTE recursivo | `.withRecursive('tree', base, recursive)` |

### Métodos Arrays

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `arrayContains(column, value)` | Operador `@>` | `tags @> ARRAY['javascript']` |
| `arrayContainedBy(column, value)` | Operador `<@` | `tags <@ ARRAY['js','ts','node']` |
| `arrayOverlaps(column, value)` | Operador `&&` | `tags && ARRAY['web','frontend']` |
| `arrayLength(column, operator, value)` | Función `array_length()` | `array_length(tags, 1) > 3` |
| `arrayAgg(column, alias)` | Función `array_agg()` | `array_agg(name) as names` |

### Métodos Full-Text Search

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `fullTextSearch(column, query, language)` | Búsqueda de texto | `.fullTextSearch('content', 'javascript', 'english')` |
| `fullTextRank(column, query, language, alias)` | Ranking de texto | `.fullTextRank('content', 'js', 'english', 'rank')` |
| `fullTextHeadline(column, query, language, alias)` | Headline de texto | `.fullTextHeadline('content', 'js', 'english', 'highlight')` |

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License. Ver [LICENSE](LICENSE) para más detalles.

## 🔗 Links Relacionados

- [QueryBuilder Core](../core/README.md)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg module](https://node-postgres.com/)

---

**Nota**: Este módulo requiere PostgreSQL 12+ para funcionalidad completa de JSON/JSONB y características avanzadas.