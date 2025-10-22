/**
 * Demo: Funcionalidad JOIN SQL → MongoDB
 * Demuestra cómo usar JOINs con sintaxis SQL familiar que se traduce a MongoDB aggregation pipelines
 */

import { QueryBuilder } from '@querybuilder/core';
import { MongoDB } from '../MongoDB.js';

async function demoJoinSQL() {
  console.log('🔗 Demo: JOIN Operations SQL → MongoDB\n');

  try {
    // Crear instancia de QueryBuilder con MongoDB
    const qb = new QueryBuilder(MongoDB);

    console.log('✅ QueryBuilder con MongoDB inicializado\n');

    // ===========================================
    // 1. INNER JOIN - Sintaxis SQL familiar
    // ===========================================
    console.log('📋 1. INNER JOIN - Usuarios con órdenes:');
    console.log('SQL: SELECT u.name, u.email, o.total, o.date FROM users u JOIN orders o ON u.id = o.user_id');

    const innerJoinCommand = qb
      .select(['u.name', 'u.email', 'o.total', 'o.date'])
      .from('users', 'u')
      .join('orders', 'u.id = o.user_id', 'inner', 'o');

    // Mostrar el comando MongoDB generado
    console.log('MongoDB Aggregation:', JSON.stringify(innerJoinCommand.commands, null, 2));
    console.log('✅ INNER JOIN configurado\n');

    // ===========================================
    // 2. LEFT JOIN - Usuarios con/sin órdenes
    // ===========================================
    console.log('📋 2. LEFT JOIN - Todos los usuarios (con/sin órdenes):');
    console.log('SQL: SELECT u.name, u.email, o.total FROM users u LEFT JOIN orders o ON u.id = o.user_id');

    const leftJoinCommand = qb
      .select(['u.name', 'u.email', 'o.total'])
      .from('users', 'u')
      .leftJoin('orders', 'u.id = o.user_id', 'o');

    console.log('MongoDB Aggregation:', JSON.stringify(leftJoinCommand.commands, null, 2));
    console.log('✅ LEFT JOIN configurado\n');

    // ===========================================
    // 3. JOIN con WHERE - Filtrar resultados
    // ===========================================
    console.log('📋 3. JOIN con WHERE - Órdenes mayores a $100:');
    console.log('SQL: SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE o.total > 100');

    const joinWithWhereCommand = qb
      .select(['u.name', 'o.total'])
      .from('users', 'u')
      .join('orders', 'u.id = o.user_id', 'inner', 'o')
      .where({ 'o.total': { $gt: 100 } });

    console.log('MongoDB Aggregation:', JSON.stringify(joinWithWhereCommand.commands, null, 2));
    console.log('✅ JOIN con WHERE configurado\n');

    // ===========================================
    // 4. Múltiples JOINs - Usuarios, órdenes y productos
    // ===========================================
    console.log('📋 4. Múltiples JOINs - Usuarios, órdenes y productos:');
    console.log('SQL: SELECT u.name, o.total, p.name as product FROM users u JOIN orders o ON u.id = o.user_id JOIN products p ON o.product_id = p.id');

    const multiJoinCommand = qb
      .select(['u.name', 'o.total', 'p.name'])
      .from('users', 'u')
      .join('orders', 'u.id = o.user_id', 'inner', 'o')
      .join('products', 'o.product_id = p.id', 'inner', 'p');

    console.log('MongoDB Aggregation:', JSON.stringify(multiJoinCommand.commands, null, 2));
    console.log('✅ Múltiples JOINs configurados\n');

    // ===========================================
    // 5. Test de parsing de condiciones
    // ===========================================
    console.log('🔍 5. Test de parsing de condiciones JOIN:');

    const mongodb = new MongoDB();

    // Test casos válidos
    const condition1 = mongodb.parseJoinCondition('users.id = orders.user_id');
    console.log('✅ "users.id = orders.user_id" →', condition1);

    const condition2 = mongodb.parseJoinCondition('u.id = o.user_id');
    console.log('✅ "u.id = o.user_id" →', condition2);

    const condition3 = mongodb.parseJoinCondition('id = user_id');
    console.log('✅ "id = user_id" →', condition3);

    // Test extracción de nombres de campo
    console.log('\n🔧 Test extracción de nombres de campo:');
    console.log('✅ "users.id" →', mongodb.extractFieldName('users.id'));
    console.log('✅ "u.name" →', mongodb.extractFieldName('u.name'));
    console.log('✅ "email" →', mongodb.extractFieldName('email'));

    // ===========================================
    // 6. Pipeline de JOINs
    // ===========================================
    console.log('\n⚙️ 6. Test de construcción de pipeline:');

    const sampleJoins = [
      {
        type: 'inner',
        lookup: { from: 'orders', localField: 'id', foreignField: 'user_id', as: 'orders' },
        alias: 'orders'
      },
      {
        type: 'left',
        lookup: { from: 'profiles', localField: 'id', foreignField: 'user_id', as: 'profile' },
        alias: 'profile'
      }
    ];

    const pipeline = mongodb.buildJoinPipeline(sampleJoins);
    console.log('Pipeline generado:', JSON.stringify(pipeline, null, 2));

    console.log('\n🎉 Demo de JOINs completada exitosamente!');
    console.log('✨ Ahora puedes usar sintaxis SQL JOIN familiar con MongoDB');

  } catch (error) {
    console.error('❌ Error en demo:', error);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar demo
demoJoinSQL();
