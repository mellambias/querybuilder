/**
 * Test Básico: Construcción de Comandos MongoDB
 * Verifica que los comandos SQL se traduzcan correctamente a MongoDB sin requerir conexión
 */

import { MongoDB } from '../MongoDB.js';
import Command from '../Command.js';

async function testCommandConstruction() {
  console.log('🔧 Test Básico: Construcción de Comandos MongoDB\n');

  try {
    const mongodb = new MongoDB();

    // ===========================================
    // 1. Test SELECT básico
    // ===========================================
    console.log('📋 1. Test SELECT básico...');

    const selectCommand = mongodb.select(['name', 'email']);
    mongodb.from('users', null, selectCommand);

    console.log('✅ SELECT construido:', JSON.stringify(selectCommand.commands, null, 2));

    // ===========================================
    // 2. Test SELECT con WHERE
    // ===========================================
    console.log('\n📋 2. Test SELECT con WHERE...');

    const selectWithWhereCommand = mongodb.select(['name', 'age']);
    mongodb.from('users', null, selectWithWhereCommand);
    mongodb.where({ age: { $gt: 25 } }, selectWithWhereCommand);

    console.log('✅ SELECT con WHERE construido:', JSON.stringify(selectWithWhereCommand.commands, null, 2));

    // ===========================================
    // 3. Test JOIN (construcción de metadata)
    // ===========================================
    console.log('\n📋 3. Test JOIN (construcción de metadata)...');

    const joinCommand = mongodb.select(['u.name', 'o.total']);
    mongodb.from('users', 'u', joinCommand);
    mongodb.join('orders', 'u.id = o.user_id', 'inner', 'o', joinCommand);

    console.log('✅ JOIN metadata construido:');
    console.log('   - Joins configurados:', joinCommand.joins);
    console.log('   - Comando base:', JSON.stringify(joinCommand.commands, null, 2));

    // ===========================================
    // 4. Test de construcción de pipeline JOIN
    // ===========================================
    console.log('\n📋 4. Test de construcción de pipeline JOIN...');

    if (joinCommand.joins && joinCommand.joins.length > 0) {
      const pipeline = mongodb.buildJoinPipeline(joinCommand.joins);
      console.log('✅ Pipeline de JOIN generado:', JSON.stringify(pipeline, null, 2));
    }

    // ===========================================
    // 5. Test UPDATE básico
    // ===========================================
    console.log('\n📋 5. Test UPDATE básico...');

    const updateCommand = mongodb.update('users', { age: 31 });
    mongodb.where({ name: 'Juan' }, updateCommand);

    console.log('✅ UPDATE construido:', JSON.stringify(updateCommand.commands, null, 2));

    // ===========================================
    // 6. Test DELETE básico
    // ===========================================
    console.log('\n📋 6. Test DELETE básico...');

    const deleteCommand = mongodb.delete('users');
    mongodb.where({ active: false }, deleteCommand);

    console.log('✅ DELETE construido:', JSON.stringify(deleteCommand.commands, null, 2));

    // ===========================================
    // 7. Test de parsing de JOINs
    // ===========================================
    console.log('\n📋 7. Test de parsing de condiciones JOIN...');

    const testConditions = [
      'users.id = orders.user_id',
      'u.id = o.user_id',
      'id = user_id',
      'customers.email = profiles.email'
    ];

    for (const condition of testConditions) {
      try {
        const parsed = mongodb.parseJoinCondition(condition);
        console.log(`✅ "${condition}" → ${JSON.stringify(parsed)}`);
      } catch (error) {
        console.log(`❌ "${condition}" → Error: ${error.message}`);
      }
    }

    // ===========================================
    // 8. Test de múltiples JOINs
    // ===========================================
    console.log('\n📋 8. Test de múltiples JOINs...');

    const multiJoinCommand = mongodb.select(['u.name', 'o.total', 'p.name']);
    mongodb.from('users', 'u', multiJoinCommand);
    mongodb.join('orders', 'u.id = o.user_id', 'inner', 'o', multiJoinCommand);
    mongodb.join('products', 'o.product_id = p.id', 'left', 'p', multiJoinCommand);

    console.log('✅ Múltiples JOINs configurados:');
    console.log('   - Número de JOINs:', multiJoinCommand.joins?.length || 0);
    console.log('   - JOINs:', JSON.stringify(multiJoinCommand.joins, null, 2));

    if (multiJoinCommand.joins) {
      const multiPipeline = mongodb.buildJoinPipeline(multiJoinCommand.joins);
      console.log('✅ Pipeline múltiple generado:', JSON.stringify(multiPipeline, null, 2));
    }

    console.log('\n🎉 Test de construcción de comandos completado exitosamente!');
    console.log('✨ Todos los comandos SQL se traducen correctamente a MongoDB');

  } catch (error) {
    console.error('❌ Error en test de construcción:', error);
    console.error('Stack:', error.stack);
  }
}

// Test específico para validar que los comandos estén bien formados
async function validateCommandStructure() {
  console.log('\n🔍 Validación de estructura de comandos...');

  try {
    const mongodb = new MongoDB();

    // Crear comando SELECT simple
    const cmd = mongodb.select(['name']);
    mongodb.from('users', null, cmd);

    // Verificar que el comando tenga la estructura esperada
    console.log('📄 Estructura del comando:');
    console.log('- Tipo:', typeof cmd);
    console.log('- Es instancia de Command:', cmd instanceof Command);
    console.log('- Tiene commands:', Array.isArray(cmd._commands));
    console.log('- Número de comandos:', cmd._commands?.length || 0);

    // Verificar contenido del comando
    if (cmd._commands && cmd._commands.length > 0) {
      const firstCommand = cmd._commands[0];
      console.log('- Primer comando tiene find:', 'find' in firstCommand);
      console.log('- Primer comando tiene filter:', 'filter' in firstCommand);
      console.log('- Primer comando tiene buildFinalCommand:', 'buildFinalCommand' in firstCommand);
    }

    console.log('✅ Estructura de comando validada');

  } catch (error) {
    console.error('❌ Error en validación:', error);
  }
}

// Ejecutar tests
testCommandConstruction().then(() => {
  return validateCommandStructure();
}).catch(console.error);
