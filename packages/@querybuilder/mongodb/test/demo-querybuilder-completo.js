/**
 * Demo Completo: QueryBuilder con MongoDB + JOINs
 * Demuestra cómo configurar el driver y usar las funcionalidades SQL avanzadas
 */

import QueryBuilder from '../../../../src/querybuilder.js';
import MongoDB from '../MongoDB.js';
import { config } from '../../core/config.js';

async function demoCompleto() {
  console.log('🚀 Demo Completo: QueryBuilder + MongoDB + SQL Avanzado\n');

  try {
    // ===========================================
    // 1. CONFIGURACIÓN DEL QUERYBUILDER
    // ===========================================
    console.log('📋 1. Configurando QueryBuilder con MongoDB...');

    // Crear QueryBuilder con MongoDB como backend
    const queryBuilder = new QueryBuilder(MongoDB, {
      typeIdentificator: "regular",
      mode: "development",
    });

    // Configurar el driver MongoDB (siguiendo el patrón de los tests)
    const MongoDBConfig = config.databases.MongoDB;
    console.log('   - Driver MongoDB:', MongoDBConfig.driver.name);
    console.log('   - Host:', MongoDBConfig.params.host);
    console.log('   - Port:', MongoDBConfig.params.port);
    console.log('   - Connection String:', MongoDBConfig.params.getConnectionString());

    // Configurar el driver en QueryBuilder
    const qb = queryBuilder.driver(MongoDBConfig.driver, MongoDBConfig.params);
    console.log('✅ QueryBuilder configurado con driver MongoDB\n');

    // ===========================================
    // 2. VALIDACIÓN DE CONFIGURACIÓN
    // ===========================================
    console.log('📋 2. Validando configuración del driver...');

    console.log('   - driverDB configurado:', qb.driverDB ? '✅' : '❌');
    console.log('   - Tipo de driver:', qb.driverDB?.constructor?.name || 'No configurado');
    console.log('   - Métodos disponibles:');
    console.log('     * execute():', typeof qb.execute === 'function' ? '✅' : '❌');
    console.log('     * insert():', typeof qb.insert === 'function' ? '✅' : '❌');
    console.log('     * find():', typeof qb.find === 'function' ? '✅' : '❌');
    console.log('     * update():', typeof qb.update === 'function' ? '✅' : '❌');
    console.log('     * delete():', typeof qb.delete === 'function' ? '✅' : '❌');

    // ===========================================
    // 3. DEMO SQL BÁSICO → MONGODB
    // ===========================================
    console.log('\n📋 3. Demo SQL Básico → MongoDB...');

    // SELECT simple
    console.log('\n   🔸 SELECT simple:');
    const selectSimple = qb.select(['name', 'email']).from('users');
    console.log('     SQL: SELECT name, email FROM users');
    console.log('     MongoDB:', JSON.stringify(selectSimple.toString(), null, 6));

    // SELECT con WHERE
    console.log('\n   🔸 SELECT con WHERE:');
    const selectWhere = qb.select(['name', 'age'])
      .from('users')
      .where({ age: { $gt: 25 } });
    console.log('     SQL: SELECT name, age FROM users WHERE age > 25');
    console.log('     MongoDB:', JSON.stringify(selectWhere.toString(), null, 6));

    // ===========================================
    // 4. DEMO JOINs SQL → MONGODB AGGREGATION
    // ===========================================
    console.log('\n📋 4. Demo JOINs SQL → MongoDB Aggregation...');

    // INNER JOIN
    console.log('\n   🔸 INNER JOIN:');
    const innerJoin = qb.select(['u.name', 'o.total'])
      .from('users', 'u')
      .join('orders', 'u.id = o.user_id', 'inner', 'o');

    console.log('     SQL: SELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id');
    console.log('     MongoDB Aggregation:');
    console.log(JSON.stringify(innerJoin.toString(), null, 6));

    // LEFT JOIN
    console.log('\n   🔸 LEFT JOIN:');
    const leftJoin = qb.select(['u.name', 'p.name as profile_name'])
      .from('users', 'u')
      .join('profiles', 'u.id = p.user_id', 'left', 'p');

    console.log('     SQL: SELECT u.name, p.name as profile_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id');
    console.log('     MongoDB Aggregation:');
    console.log(JSON.stringify(leftJoin.toString(), null, 6));

    // MÚLTIPLES JOINs
    console.log('\n   🔸 Múltiples JOINs:');
    const multiJoin = qb.select(['u.name', 'o.total', 'p.name as product_name'])
      .from('users', 'u')
      .join('orders', 'u.id = o.user_id', 'inner', 'o')
      .join('products', 'o.product_id = p.id', 'left', 'p');

    console.log('     SQL: SELECT u.name, o.total, p.name as product_name');
    console.log('          FROM users u');
    console.log('          INNER JOIN orders o ON u.id = o.user_id');
    console.log('          LEFT JOIN products p ON o.product_id = p.id');
    console.log('     MongoDB Aggregation:');
    console.log(JSON.stringify(multiJoin.toString(), null, 6));

    // ===========================================
    // 5. DEMO DE MÉTODOS DE CONVENIENCIA
    // ===========================================
    console.log('\n📋 5. Demo métodos de conveniencia para JOINs...');

    // innerJoin() method
    console.log('\n   🔸 Método innerJoin():');
    const innerJoinMethod = qb.select(['u.name', 'o.total'])
      .from('users', 'u')
      .innerJoin('orders', 'u.id = o.user_id', 'o');

    console.log('     qb.innerJoin("orders", "u.id = o.user_id", "o")');
    console.log('     Resultado:', JSON.stringify(innerJoinMethod.toString(), null, 6));

    // leftJoin() method
    console.log('\n   🔸 Método leftJoin():');
    const leftJoinMethod = qb.select(['u.name', 'p.bio'])
      .from('users', 'u')
      .leftJoin('profiles', 'u.id = p.user_id', 'p');

    console.log('     qb.leftJoin("profiles", "u.id = p.user_id", "p")');
    console.log('     Resultado:', JSON.stringify(leftJoinMethod.toString(), null, 6));

    // ===========================================
    // 6. VALIDACIÓN DE TRADUCCIÓN SQL → MONGODB
    // ===========================================
    console.log('\n📋 6. Validación de traducción SQL → MongoDB...');

    const casos = [
      {
        descripcion: 'Condición simple',
        condicion: 'users.id = orders.user_id',
        esperado: { localField: 'id', foreignField: 'user_id' }
      },
      {
        descripcion: 'Con alias',
        condicion: 'u.id = o.user_id',
        esperado: { localField: 'id', foreignField: 'user_id' }
      },
      {
        descripcion: 'Sin tabla',
        condicion: 'id = user_id',
        esperado: { localField: 'id', foreignField: 'user_id' }
      }
    ];

    // Crear instancia MongoDB directa para testing
    const mongoDB = new MongoDB();

    casos.forEach(caso => {
      try {
        const resultado = mongoDB.parseJoinCondition(caso.condicion);
        const coincide = JSON.stringify(resultado) === JSON.stringify(caso.esperado);
        console.log(`   ${coincide ? '✅' : '❌'} ${caso.descripcion}: "${caso.condicion}"`);
        if (!coincide) {
          console.log(`       Esperado: ${JSON.stringify(caso.esperado)}`);
          console.log(`       Obtenido: ${JSON.stringify(resultado)}`);
        }
      } catch (error) {
        console.log(`   ❌ ${caso.descripcion}: Error - ${error.message}`);
      }
    });

    // ===========================================
    // 7. RESUMEN Y ESTADO
    // ===========================================
    console.log('\n📋 7. Resumen del estado actual...');

    console.log('\n✅ FUNCIONAL:');
    console.log('   • QueryBuilder + MongoDB configurado');
    console.log('   • Traducción SQL → MongoDB commands');
    console.log('   • JOINs SQL → MongoDB Aggregation Pipeline');
    console.log('   • Métodos de conveniencia (innerJoin, leftJoin, rightJoin)');
    console.log('   • Parsing de condiciones JOIN');
    console.log('   • Construcción de pipelines complejos');

    console.log('\n⚠️  REQUIERE CONFIGURACIÓN:');
    console.log('   • Conexión real a MongoDB (instancia corriendo)');
    console.log('   • Validación con datos reales');
    console.log('   • Testing de rendimiento con datasets grandes');

    console.log('\n🎯 PRÓXIMOS PASOS PARA SQL AVANZADO:');
    console.log('   • GROUP BY → $group aggregation');
    console.log('   • HAVING → $match después de $group');
    console.log('   • Subconsultas → Nested aggregations');
    console.log('   • Window Functions → $setWindowFields');
    console.log('   • UNION → $unionWith');
    console.log('   • CASE/WHEN → $cond expressions');

  } catch (error) {
    console.error('❌ Error en demo completo:', error);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar demo
console.log('🎬 Iniciando Demo Completo QueryBuilder + MongoDB...\n');
demoCompleto().catch(console.error);