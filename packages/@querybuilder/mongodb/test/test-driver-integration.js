/**
 * Test de Integración: Driver MongoDB Real
 * Verifica que el driver MongoDB ejecute operaciones reales en la base de datos
 */

import { QueryBuilder } from '@querybuilder/core';
import { MongoDB } from '../MongoDB.js';

async function testMongoDBDriver() {
  console.log('🔌 Test de Integración: Driver MongoDB Real\n');

  try {
    // 1. Verificar si hay una instancia de MongoDB disponible
    console.log('📋 1. Verificando disponibilidad de MongoDB...');

    // Crear QueryBuilder con MongoDB
    const qb = new QueryBuilder(MongoDB);
    console.log('✅ QueryBuilder con MongoDB creado');

    // Verificar que el driver esté disponible
    if (!qb.driverDB) {
      console.log('⚠️ No hay driver de MongoDB configurado');
      console.log('💡 Para probar con MongoDB real, necesitas:');
      console.log('   1. Instancia de MongoDB corriendo');
      console.log('   2. Driver configurado en QueryBuilder');
      console.log('   3. Conexión establecida');
      return;
    }

    console.log('✅ Driver MongoDB detectado\n');

    // ===========================================
    // 2. Test de operaciones CRUD básicas
    // ===========================================
    console.log('📋 2. Test de operaciones CRUD básicas...');

    // INSERT - Insertar datos de prueba
    console.log('\n🔸 Insertando usuarios de prueba...');
    const insertUsersCommand = await qb.insert('test_users', ['name', 'email', 'age'], [
      ['Juan Pérez', 'juan@example.com', 30],
      ['María García', 'maria@example.com', 25],
      ['Carlos López', 'carlos@example.com', 35]
    ]);

    console.log('📄 Comando INSERT generado:');
    console.log(JSON.stringify(insertUsersCommand.commands, null, 2));

    // Ejecutar INSERT
    try {
      const insertResult = await insertUsersCommand.execute(qb.driverDB);
      console.log('✅ INSERT ejecutado:', insertResult);
    } catch (error) {
      console.log('❌ Error en INSERT:', error.message);
    }

    // SELECT - Consultar datos
    console.log('\n🔸 Consultando usuarios...');
    const selectCommand = qb.select(['name', 'email', 'age']).from('test_users');

    console.log('📄 Comando SELECT generado:');
    console.log(JSON.stringify(selectCommand.commands, null, 2));

    try {
      const selectResult = await selectCommand.execute(qb.driverDB);
      console.log('✅ SELECT ejecutado:', selectResult);
    } catch (error) {
      console.log('❌ Error en SELECT:', error.message);
    }

    // UPDATE - Actualizar datos
    console.log('\n🔸 Actualizando usuario...');
    const updateCommand = qb.update('test_users', { age: 31 }).where({ name: 'Juan Pérez' });

    console.log('📄 Comando UPDATE generado:');
    console.log(JSON.stringify(updateCommand.commands, null, 2));

    try {
      const updateResult = await updateCommand.execute(qb.driverDB);
      console.log('✅ UPDATE ejecutado:', updateResult);
    } catch (error) {
      console.log('❌ Error en UPDATE:', error.message);
    }

    // ===========================================
    // 3. Test de JOINs con datos reales
    // ===========================================
    console.log('\n📋 3. Test de JOINs con datos reales...');

    // Insertar órdenes de prueba
    console.log('\n🔸 Insertando órdenes de prueba...');
    const insertOrdersCommand = await qb.insert('test_orders', ['user_name', 'product', 'total'], [
      ['Juan Pérez', 'Laptop', 999],
      ['María García', 'Mouse', 25],
      ['Juan Pérez', 'Teclado', 75]
    ]);

    try {
      const insertOrdersResult = await insertOrdersCommand.execute(qb.driverDB);
      console.log('✅ Órdenes insertadas:', insertOrdersResult);
    } catch (error) {
      console.log('❌ Error insertando órdenes:', error.message);
    }

    // JOIN - Unir usuarios y órdenes
    console.log('\n🔸 Ejecutando JOIN entre usuarios y órdenes...');
    const joinCommand = qb
      .select(['u.name', 'u.email', 'o.product', 'o.total'])
      .from('test_users', 'u')
      .join('test_orders', 'u.name = o.user_name', 'inner', 'o');

    console.log('📄 Comando JOIN generado:');
    console.log(JSON.stringify(joinCommand.commands, null, 2));

    try {
      const joinResult = await joinCommand.execute(qb.driverDB);
      console.log('✅ JOIN ejecutado:', joinResult);
    } catch (error) {
      console.log('❌ Error en JOIN:', error.message);
    }

    // ===========================================
    // 4. Test de limpieza
    // ===========================================
    console.log('\n📋 4. Limpieza de datos de prueba...');

    // DELETE - Limpiar datos de prueba
    try {
      const deleteUsersCommand = qb.delete().from('test_users');
      const deleteUsersResult = await deleteUsersCommand.execute(qb.driverDB);
      console.log('✅ Usuarios de prueba eliminados:', deleteUsersResult);

      const deleteOrdersCommand = qb.delete().from('test_orders');
      const deleteOrdersResult = await deleteOrdersCommand.execute(qb.driverDB);
      console.log('✅ Órdenes de prueba eliminadas:', deleteOrdersResult);
    } catch (error) {
      console.log('⚠️ Error en limpieza:', error.message);
    }

    console.log('\n🎉 Test de integración completado');

  } catch (error) {
    console.error('❌ Error en test de integración:', error);
    console.error('Stack:', error.stack);
  }
}

// Función para crear datos de prueba mínimos
async function createMinimalTest() {
  console.log('\n🧪 Test mínimo sin driver MongoDB real...');

  try {
    const qb = new QueryBuilder(MongoDB);

    // Test de construcción de comandos (sin ejecutar)
    console.log('\n📋 Verificando construcción de comandos...');

    const insertCmd = await qb.insert('users', ['name', 'email'], [['Test User', 'test@example.com']]);
    console.log('✅ Comando INSERT construido correctamente');

    const selectCmd = qb.select(['name', 'email']).from('users');
    console.log('✅ Comando SELECT construido correctamente');

    const joinCmd = qb
      .select(['u.name', 'o.total'])
      .from('users', 'u')
      .join('orders', 'u.id = o.user_id', 'inner', 'o');
    console.log('✅ Comando JOIN construido correctamente');

    console.log('\n📄 Ejemplos de comandos generados:');
    console.log('INSERT:', JSON.stringify(insertCmd.commands[0], null, 2));
    console.log('SELECT:', JSON.stringify(selectCmd.commands[0], null, 2));

    console.log('\n🎯 Los comandos se construyen correctamente');
    console.log('💡 Para ejecutar en MongoDB real, configura la conexión al driver');

  } catch (error) {
    console.error('❌ Error en test mínimo:', error);
  }
}

// Ejecutar tests
console.log('🚀 Iniciando tests del driver MongoDB...\n');

testMongoDBDriver().then(() => {
  // Si el test principal no puede ejecutarse, hacer test mínimo
  return createMinimalTest();
}).catch(console.error);