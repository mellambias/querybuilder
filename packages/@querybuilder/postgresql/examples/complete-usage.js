/**
 * Ejemplo completo de uso del módulo PostgreSQL
 * Demuestra todas las características implementadas
 */

import PostgreSQL from '@querybuilder/postgresql';

// Configurar conexión (ejemplo con pg)
const config = {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  user: 'postgres',
  password: 'password'
};

const db = new PostgreSQL(config);

/**
 * EJEMPLOS DE JSON/JSONB OPERATIONS
 */

// Consulta con operadores JSON
const jsonQuery = db.table('products')
  .select(['name', 'metadata'])
  .jsonContains('metadata', { category: 'electronics' })  // metadata @> '{"category":"electronics"}'
  .jsonHasKey('metadata', 'price')                        // metadata ? 'price'
  .jsonPath('metadata', '$.reviews[*].rating', '>', 4);   // metadata #> '{reviews}' -> rating > 4

console.log('JSON Query:', jsonQuery.toString());

// Actualización con JSON
const jsonUpdate = db.table('products')
  .where('id', 1)
  .jsonSet('metadata', '$.last_updated', new Date().toISOString())
  .jsonRemove('metadata', '$.old_field')
  .update();

console.log('JSON Update:', jsonUpdate.toString());

/**
 * EJEMPLOS DE UPSERT (INSERT ... ON CONFLICT)
 */

// UPSERT básico
const upsert1 = db.table('users')
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

console.log('Basic UPSERT:', upsert1.toString());

// UPSERT con WHERE condition
const upsert2 = db.table('products')
  .insert({
    sku: 'ABC123',
    name: 'Product Name',
    price: 99.99
  })
  .onConflict(['sku'])
  .doUpdate({
    price: 'EXCLUDED.price',
    updated_at: 'NOW()'
  })
  .where('products.price != EXCLUDED.price');

console.log('Conditional UPSERT:', upsert2.toString());

/**
 * EJEMPLOS DE WINDOW FUNCTIONS
 */

// Ranking y numeración
const windowQuery = db.table('sales')
  .select([
    'product_id',
    'amount',
    'sale_date'
  ])
  .rowNumber(['product_id'], ['amount DESC'], 'row_num')
  .rank(['product_id'], ['amount DESC'], 'rank')
  .denseRank(['product_id'], ['amount DESC'], 'dense_rank')
  .lag('amount', 1, 0, ['product_id'], ['sale_date'], 'prev_amount')
  .lead('amount', 1, 0, ['product_id'], ['sale_date'], 'next_amount');

console.log('Window Functions:', windowQuery.toString());

// Funciones de agregación con ventana
const aggregateWindow = db.table('orders')
  .select([
    'customer_id',
    'order_date',
    'amount'
  ])
  .sum('amount', ['customer_id'], [], 'total_by_customer')
  .avg('amount', ['customer_id'], ['order_date'], 'running_avg')
  .count('*', [], ['order_date'], 'daily_count');

console.log('Aggregate Window:', aggregateWindow.toString());

/**
 * EJEMPLOS DE CTE (Common Table Expressions)
 */

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

console.log('CTE Query:', cteQuery.toString());

// CTE recursivo para jerarquías
const recursiveCTE = db
  .withRecursive('employee_hierarchy',
    // Base case
    db.table('employees')
      .select(['id', 'name', 'manager_id', '1 as level'])
      .whereNull('manager_id'),
    // Recursive case  
    db.table('employees e')
      .join('employee_hierarchy eh', 'e.manager_id', 'eh.id')
      .select(['e.id', 'e.name', 'e.manager_id', 'eh.level + 1'])
  )
  .table('employee_hierarchy')
  .select(['name', 'level'])
  .orderBy('level', 'name');

console.log('Recursive CTE:', recursiveCTE.toString());

/**
 * EJEMPLOS DE ARRAYS
 */

// Operaciones con arrays
const arrayQuery = db.table('tags')
  .select(['post_id', 'tags'])
  .arrayContains('tags', 'javascript')           // tags @> ARRAY['javascript']
  .arrayOverlaps('tags', ['web', 'frontend'])    // tags && ARRAY['web','frontend']
  .arrayLength('tags', '>', 2);                  // array_length(tags, 1) > 2

console.log('Array Query:', arrayQuery.toString());

// Agregaciones con arrays
const arrayAgg = db.table('posts p')
  .join('post_tags pt', 'p.id', 'pt.post_id')
  .join('tags t', 'pt.tag_id', 't.id')
  .select([
    'p.id',
    'p.title'
  ])
  .arrayAgg('t.name', 'tag_names')
  .groupBy(['p.id', 'p.title']);

console.log('Array Aggregation:', arrayAgg.toString());

/**
 * EJEMPLOS DE FULL-TEXT SEARCH
 */

// Búsqueda de texto completo
const fullTextSearch = db.table('documents')
  .select([
    'id',
    'title',
    'content'
  ])
  .fullTextSearch('content', 'javascript programming', 'english')
  .fullTextRank('content', 'javascript programming', 'english', 'rank')
  .fullTextHeadline('content', 'javascript programming', 'english', 'highlight')
  .orderBy('rank', 'DESC');

console.log('Full-Text Search:', fullTextSearch.toString());

/**
 * EJEMPLOS DE TIPOS DE DATOS ESPECÍFICOS DE POSTGRESQL
 */

// Crear tabla con tipos específicos de PostgreSQL
const createTable = `
    CREATE TABLE advanced_table (
        id SERIAL PRIMARY KEY,
        uuid_field UUID DEFAULT gen_random_uuid(),
        json_field JSONB,
        array_field TEXT[],
        range_field INT4RANGE,
        network_field INET,
        geometric_field POINT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )
`;

// Insert con tipos específicos
const advancedInsert = db.table('advanced_table')
  .insert({
    json_field: JSON.stringify({ key: 'value' }),
    array_field: "ARRAY['item1', 'item2', 'item3']",
    range_field: "'[1,10)'",
    network_field: "'192.168.1.0/24'",
    geometric_field: "'(1,2)'"
  });

console.log('Advanced Insert:', advancedInsert.toString());

/**
 * EJEMPLO DE TRANSACCIÓN COMPLEJA
 */
async function complexTransaction() {
  const transaction = await db.beginTransaction();

  try {
    // 1. Crear un nuevo pedido
    const orderId = await transaction.table('orders')
      .insert({
        customer_id: 1,
        total: 0,
        status: 'pending'
      })
      .returning('id');

    // 2. Añadir productos al pedido con UPSERT
    await transaction.table('order_items')
      .insert([
        { order_id: orderId, product_id: 1, quantity: 2, price: 29.99 },
        { order_id: orderId, product_id: 2, quantity: 1, price: 49.99 }
      ])
      .onConflict(['order_id', 'product_id'])
      .doUpdate({
        quantity: 'order_items.quantity + EXCLUDED.quantity',
        updated_at: 'NOW()'
      });

    // 3. Actualizar total del pedido usando CTE
    await transaction
      .with('order_total',
        transaction.table('order_items')
          .select(['order_id'])
          .sum('quantity * price', 'total')
          .where('order_id', orderId)
          .groupBy('order_id')
      )
      .table('orders o')
      .join('order_total ot', 'o.id', 'ot.order_id')
      .where('o.id', orderId)
      .update({ total: 'ot.total' });

    // 4. Actualizar inventario usando window function
    await transaction
      .with('inventory_update',
        transaction.table('order_items oi')
          .join('products p', 'oi.product_id', 'p.id')
          .select([
            'p.id',
            'p.stock',
            'oi.quantity'
          ])
          .sum('oi.quantity', ['p.id'], [], 'total_ordered')
          .where('oi.order_id', orderId)
      )
      .table('products p')
      .join('inventory_update iu', 'p.id', 'iu.id')
      .update({
        stock: 'p.stock - iu.total_ordered',
        updated_at: 'NOW()'
      });

    await transaction.commit();
    console.log('Transaction completed successfully');

  } catch (error) {
    await transaction.rollback();
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * EJEMPLO DE CONSULTA COMPLEJA QUE COMBINA MÚLTIPLES CARACTERÍSTICAS
 */
const complexQuery = db
  // CTE para calcular estadísticas de ventas
  .with('sales_stats',
    db.table('sales s')
      .join('products p', 's.product_id', 'p.id')
      .select([
        'p.category',
        's.sale_date',
        's.amount'
      ])
      .where('s.sale_date', '>=', "'2024-01-01'")
  )
  // CTE para ranking por categoría
  .with('category_rankings',
    db.table('sales_stats')
      .select([
        'category',
        'sale_date',
        'amount'
      ])
      .rowNumber(['category'], ['amount DESC'], 'rank_in_category')
      .sum('amount', ['category'], [], 'total_by_category')
  )
  // Query principal con full-text search y JSON
  .table('products p')
  .join('category_rankings cr', 'p.category', 'cr.category')
  .leftJoin('product_reviews pr', 'p.id', 'pr.product_id')
  .select([
    'p.id',
    'p.name',
    'p.category',
    'cr.rank_in_category',
    'cr.total_by_category'
  ])
  .arrayAgg('pr.rating', 'ratings')
  .avg('pr.rating', 'avg_rating')
  .jsonBuildObject({
    'product_info': {
      'name': 'p.name',
      'category': 'p.category',
      'stats': {
        'rank': 'cr.rank_in_category',
        'total_sales': 'cr.total_by_category'
      }
    }
  }, 'product_summary')
  .fullTextSearch('p.description', 'premium quality', 'english')
  .jsonContains('p.metadata', { featured: true })
  .where('cr.rank_in_category', '<=', 10)
  .groupBy(['p.id', 'p.name', 'p.category', 'cr.rank_in_category', 'cr.total_by_category'])
  .having('AVG(pr.rating)', '>=', 4.0)
  .orderBy('cr.total_by_category DESC', 'cr.rank_in_category')
  .limit(50);

console.log('Complex Combined Query:', complexQuery.toString());

/**
 * EXPORTAR EJEMPLOS PARA TESTING
 */
export {
  jsonQuery,
  upsert1,
  windowQuery,
  cteQuery,
  recursiveCTE,
  arrayQuery,
  fullTextSearch,
  complexQuery,
  complexTransaction
};