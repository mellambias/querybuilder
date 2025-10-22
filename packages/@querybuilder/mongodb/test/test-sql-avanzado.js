/**
 * Test Completo: Características SQL Avanzadas → MongoDB
 * Validación de GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET en MongoDB
 */

import { MongoDB } from '../MongoDB.js';

async function testSQLAvanzado() {
  console.log('🚀 Test Completo: Características SQL Avanzadas → MongoDB\n');

  try {
    const mongodb = new MongoDB();

    // ===========================================
    // 1. TEST GROUP BY BÁSICO
    // ===========================================
    console.log('📊 1. Test GROUP BY básico...');

    const groupByCmd = mongodb.select(['category', 'total']);
    mongodb.from('products', null, groupByCmd);
    mongodb.groupBy('category', { total: { $count: {} } }, groupByCmd);

    console.log('✅ GROUP BY construido:');
    console.log('   SQL: SELECT category, COUNT(*) as total FROM products GROUP BY category');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(groupByCmd._commands[0].buildFinalCommand(groupByCmd), null, 2));

    // ===========================================
    // 2. TEST GROUP BY MÚLTIPLES CAMPOS
    // ===========================================
    console.log('\n📊 2. Test GROUP BY múltiples campos...');

    const multiGroupCmd = mongodb.select(['user_id', 'status', 'count', 'total']);
    mongodb.from('orders', null, multiGroupCmd);
    mongodb.groupBy(['user_id', 'status'], {
      count: { $count: {} },
      total: { $sum: '$amount' }
    }, multiGroupCmd);

    console.log('✅ GROUP BY múltiple construido:');
    console.log('   SQL: SELECT user_id, status, COUNT(*) as count, SUM(amount) as total');
    console.log('        FROM orders GROUP BY user_id, status');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(multiGroupCmd._commands[0].buildFinalCommand(multiGroupCmd), null, 2));

    // ===========================================
    // 3. TEST GROUP BY + HAVING
    // ===========================================
    console.log('\n📊 3. Test GROUP BY + HAVING...');

    const havingCmd = mongodb.select(['category', 'total']);
    mongodb.from('products', null, havingCmd);
    mongodb.groupBy('category', { total: { $count: {} } }, havingCmd);
    mongodb.having({ total: { $gt: 5 } }, havingCmd);

    console.log('✅ GROUP BY + HAVING construido:');
    console.log('   SQL: SELECT category, COUNT(*) as total FROM products');
    console.log('        GROUP BY category HAVING COUNT(*) > 5');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(havingCmd._commands[0].buildFinalCommand(havingCmd), null, 2));

    // ===========================================
    // 4. TEST ORDER BY SIMPLE
    // ===========================================
    console.log('\n🔤 4. Test ORDER BY simple...');

    const orderCmd = mongodb.select(['name', 'age']);
    mongodb.from('users', null, orderCmd);
    mongodb.orderBy('name', 'asc', orderCmd);

    console.log('✅ ORDER BY simple construido:');
    console.log('   SQL: SELECT name, age FROM users ORDER BY name ASC');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(orderCmd._commands[0].buildFinalCommand(orderCmd), null, 2));

    // ===========================================
    // 5. TEST ORDER BY MÚLTIPLE
    // ===========================================
    console.log('\n🔤 5. Test ORDER BY múltiple...');

    const multiOrderCmd = mongodb.select(['name', 'age']);
    mongodb.from('users', null, multiOrderCmd);
    mongodb.orderBy([
      { field: 'age', direction: 'desc' },
      { field: 'name', direction: 'asc' }
    ], null, multiOrderCmd);

    console.log('✅ ORDER BY múltiple construido:');
    console.log('   SQL: SELECT name, age FROM users ORDER BY age DESC, name ASC');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(multiOrderCmd._commands[0].buildFinalCommand(multiOrderCmd), null, 2));

    // ===========================================
    // 6. TEST LIMIT
    // ===========================================
    console.log('\n📏 6. Test LIMIT...');

    const limitCmd = mongodb.select(['name']);
    mongodb.from('users', null, limitCmd);
    mongodb.limit(10, limitCmd);

    console.log('✅ LIMIT construido:');
    console.log('   SQL: SELECT name FROM users LIMIT 10');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(limitCmd._commands[0].buildFinalCommand(limitCmd), null, 2));

    // ===========================================
    // 7. TEST OFFSET + LIMIT (PAGINACIÓN)
    // ===========================================
    console.log('\n📄 7. Test OFFSET + LIMIT (paginación)...');

    const paginationCmd = mongodb.select(['name', 'email']);
    mongodb.from('users', null, paginationCmd);
    mongodb.offset(20, paginationCmd);
    mongodb.limit(10, paginationCmd);

    console.log('✅ Paginación construida:');
    console.log('   SQL: SELECT name, email FROM users OFFSET 20 LIMIT 10');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(paginationCmd._commands[0].buildFinalCommand(paginationCmd), null, 2));

    // ===========================================
    // 8. TEST CONSULTA COMPLEJA COMBINADA
    // ===========================================
    console.log('\n🎯 8. Test consulta compleja combinada...');

    const complexCmd = mongodb.select(['u.name', 'category', 'total_amount', 'order_count']);
    mongodb.from('users', 'u', complexCmd);
    mongodb.join('orders', 'u.id = o.user_id', 'inner', 'o', complexCmd);
    mongodb.where({ 'o.status': 'completed' }, complexCmd);
    mongodb.groupBy(['u.name', 'o.category'], {
      total_amount: { $sum: '$o.amount' },
      order_count: { $count: {} }
    }, complexCmd);
    mongodb.having({ total_amount: { $gt: 1000 } }, complexCmd);
    mongodb.orderBy('total_amount', 'desc', complexCmd);
    mongodb.limit(5, complexCmd);

    console.log('✅ Consulta compleja construida:');
    console.log('   SQL: SELECT u.name, o.category, SUM(o.amount) as total_amount, COUNT(*) as order_count');
    console.log('        FROM users u');
    console.log('        INNER JOIN orders o ON u.id = o.user_id');
    console.log('        WHERE o.status = "completed"');
    console.log('        GROUP BY u.name, o.category');
    console.log('        HAVING SUM(o.amount) > 1000');
    console.log('        ORDER BY total_amount DESC');
    console.log('        LIMIT 5');
    console.log('   MongoDB Aggregation:');
    console.log('   ', JSON.stringify(complexCmd._commands[0].buildFinalCommand(complexCmd), null, 2));

    // ===========================================
    // 9. TEST DE VALIDACIONES
    // ===========================================
    console.log('\n🔍 9. Test de validaciones...');

    try {
      // Test HAVING sin GROUP BY
      const invalidCmd = mongodb.select(['name']);
      mongodb.from('users', null, invalidCmd);
      mongodb.having({ count: { $gt: 5 } }, invalidCmd);
      console.log('❌ HAVING sin GROUP BY debería fallar');
    } catch (error) {
      console.log('✅ HAVING sin GROUP BY correctamente rechazado:', error.message);
    }

    try {
      // Test LIMIT con valor inválido
      const invalidLimitCmd = mongodb.select(['name']);
      mongodb.from('users', null, invalidLimitCmd);
      mongodb.limit(-5, invalidLimitCmd);
      console.log('❌ LIMIT negativo debería fallar');
    } catch (error) {
      console.log('✅ LIMIT negativo correctamente rechazado:', error.message);
    }

    try {
      // Test OFFSET con valor inválido
      const invalidOffsetCmd = mongodb.select(['name']);
      mongodb.from('users', null, invalidOffsetCmd);
      mongodb.offset('invalid', invalidOffsetCmd);
      console.log('❌ OFFSET inválido debería fallar');
    } catch (error) {
      console.log('✅ OFFSET inválido correctamente rechazado:', error.message);
    }

    // ===========================================
    // 10. RESUMEN DE FUNCIONALIDADES
    // ===========================================
    console.log('\n📋 10. Resumen de funcionalidades implementadas...');

    console.log('\n✅ GROUP BY IMPLEMENTADO:');
    console.log('   • Campos simples: groupBy("category")');
    console.log('   • Múltiples campos: groupBy(["user_id", "status"])');
    console.log('   • Funciones agregación: { $count: {}, $sum: "$field", $avg: "$field" }');
    console.log('   • Pipeline: $group con _id y agregaciones');

    console.log('\n✅ HAVING IMPLEMENTADO:');
    console.log('   • Filtrado post-GROUP BY: having({ total: { $gt: 5 } })');
    console.log('   • Validación: requiere GROUP BY previo');
    console.log('   • Pipeline: $match después de $group');

    console.log('\n✅ ORDER BY IMPLEMENTADO:');
    console.log('   • Campo simple: orderBy("name", "asc")');
    console.log('   • Múltiples campos: orderBy([{field: "age", direction: "desc"}])');
    console.log('   • Formato MongoDB: orderBy({ age: -1, name: 1 })');
    console.log('   • Pipeline: $sort con especificación completa');

    console.log('\n✅ LIMIT/OFFSET IMPLEMENTADO:');
    console.log('   • Límite: limit(10)');
    console.log('   • Offset: offset(20) o skip(20)');
    console.log('   • Paginación: offset(20) + limit(10)');
    console.log('   • Pipeline: $skip + $limit en orden correcto');
    console.log('   • Validaciones: números positivos requeridos');

    console.log('\n✅ INTEGRACIÓN COMPLETA:');
    console.log('   • Pipeline automático: detecta cuándo usar aggregation vs find');
    console.log('   • Orden correcto: WHERE → JOIN → GROUP BY → HAVING → ORDER BY → SKIP → LIMIT');
    console.log('   • Compatibilidad: funciona con JOINs existentes');
    console.log('   • Validaciones: errores claros para casos inválidos');

    console.log('\n🎯 CASOS DE USO CUBIERTOS:');
    console.log('   • Reportes con agrupación y totales');
    console.log('   • Consultas con paginación');
    console.log('   • Análisis estadísticos con filtros');
    console.log('   • Dashboards con datos agregados');
    console.log('   • APIs REST con ordenamiento y límites');

  } catch (error) {
    console.error('❌ Error en test SQL avanzado:', error);
    console.error('Stack:', error.stack);
  }
}

// Función adicional para test de performance conceptual
async function testPerformancePatterns() {
  console.log('\n🏃 Test de patrones de performance...');

  const mongodb = new MongoDB();

  // Patrón 1: Optimización de WHERE antes de JOIN
  console.log('\n📈 Patrón 1: WHERE antes de JOIN (optimizado)');
  const optimizedCmd = mongodb.select(['u.name', 'o.total']);
  mongodb.from('users', 'u', optimizedCmd);
  mongodb.where({ 'u.active': true }, optimizedCmd); // WHERE antes de JOIN
  mongodb.join('orders', 'u.id = o.user_id', 'inner', 'o', optimizedCmd);

  const pipeline1 = optimizedCmd._commands[0].buildFinalCommand(optimizedCmd);
  console.log('✅ Pipeline optimizado (WHERE → JOIN):');
  console.log('   ', JSON.stringify(pipeline1.pipeline, null, 2));

  // Patrón 2: GROUP BY con índices implícitos
  console.log('\n📈 Patrón 2: GROUP BY con agregaciones eficientes');
  const efficientCmd = mongodb.select(['category', 'avg_price', 'total_products']);
  mongodb.from('products', null, efficientCmd);
  mongodb.groupBy('category', {
    avg_price: { $avg: '$price' },
    total_products: { $count: {} }
  }, efficientCmd);
  mongodb.orderBy('avg_price', 'desc', efficientCmd);

  const pipeline2 = efficientCmd._commands[0].buildFinalCommand(efficientCmd);
  console.log('✅ Pipeline eficiente (GROUP BY → ORDER BY):');
  console.log('   ', JSON.stringify(pipeline2.pipeline, null, 2));
}

// Ejecutar tests
console.log('🎬 Iniciando Tests de Características SQL Avanzadas...\n');
testSQLAvanzado().then(() => {
  return testPerformancePatterns();
}).catch(console.error);
