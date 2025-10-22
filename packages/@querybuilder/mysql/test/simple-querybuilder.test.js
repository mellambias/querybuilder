#!/usr/bin/env node

/**
 * Test Simplificado de QueryBuilder.execute()
 * 
 * Se enfoca específicamente en probar QueryBuilder.execute() con SELECT
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../../../../config.js';
import MySqlDriver from '../drivers/MySqlDriver.js';
import QueryBuilder from '../../core/querybuilder.js';
import MySQL from '../MySQL.js';
import { createTestDatabase, initializeDatabase, cleanupDatabase } from './test-setup.js';

async function runSimpleQueryBuilderTest() {
  console.log('🚀 Testing QueryBuilder.execute() - Focused Test');
  console.log(`📅 Date: ${new Date().toISOString()}`);

  try {
    // Initialize test environment
    await createTestDatabase();
    await initializeDatabase();

    // Configurar QueryBuilder con Driver
    console.log('\n1. 🔧 Configurando QueryBuilder + MySqlDriver...');
    const qb = new QueryBuilder(MySQL, { mode: 'TEST' });  // Establecer mode TEST

    // Llamar al método driver directamente para evitar problemas de Proxy
    Object.getPrototypeOf(qb).driver.call(qb, MySqlDriver, config.testing.MySQL.params);

    console.log(`   ✅ QueryBuilder configurado`);
    console.log(`   ✅ Driver: ${qb.driverDB.constructor.name}`);
    console.log(`   ✅ Database: ${qb.driverDB.database}`);

    // Crear tabla simple usando driver directo
    console.log('\n2. 📊 Preparando datos de test...');
    const tableName = `simple_test_${Date.now()}`;

    const createTableSQL = `
      CREATE TABLE ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        value INT
      )
    `;

    await qb.driverDB.execute(createTableSQL);
    console.log(`   ✅ Tabla ${tableName} creada`);

    // Insertar datos usando driver directo
    await qb.driverDB.execute(`INSERT INTO ${tableName} (name, value) VALUES ('test1', 10)`);
    await qb.driverDB.execute(`INSERT INTO ${tableName} (name, value) VALUES ('test2', 20)`);
    console.log(`   ✅ Datos de test insertados`);

    // ¡EL TEST PRINCIPAL! - QueryBuilder.execute()
    console.log('\n3. 🎯 TEST PRINCIPAL: QueryBuilder.execute()');

    // Configurar query usando fluent API
    const selectQuery = qb.select(['name', 'value'])
      .from(tableName)
      .where('value > 15');  // Usar condición como string simple

    // Generar SQL para verificar
    const generatedSQL = await selectQuery.toString();
    console.log(`   🔍 SQL generado: ${generatedSQL}`);

    // ¡EJECUTAR CON QUERYBUILDER.EXECUTE()!
    console.log(`   🚀 Ejecutando con QueryBuilder.execute()...`);
    await selectQuery.execute();

    // Obtener resultado
    const result = qb.driverDB.response();
    console.log(`   ✅ Ejecución completada`);
    console.log(`   📊 Registros encontrados: ${result?.length || 0}`);

    if (result && result.length > 0) {
      console.log(`   📋 Resultado: ${JSON.stringify(result[0])}`);
    }

    // Validaciones
    assert.ok(result, 'QueryBuilder.execute() debe retornar resultado');
    assert.ok(Array.isArray(result), 'Resultado debe ser array');
    assert.strictEqual(result.length, 1, 'Debe encontrar 1 registro (value > 15)');
    assert.strictEqual(result[0].name, 'test2', 'Debe retornar test2');
    assert.strictEqual(result[0].value, 20, 'Value debe ser 20');

    console.log('   ✅ Todas las validaciones pasaron');

    // Test adicional: QueryBuilder.execute() con WHERE diferente
    console.log('\n4. 🔄 Test adicional con diferentes parámetros...');

    const selectQuery2 = qb.select(['name'])
      .from(tableName)
      .where('value < 15');  // Usar condición como string simple

    await selectQuery2.execute();
    const result2 = qb.driverDB.response();

    assert.strictEqual(result2.length, 1, 'Debe encontrar 1 registro (value < 15)');
    assert.strictEqual(result2[0].name, 'test1', 'Debe retornar test1');

    console.log('   ✅ Test adicional completado');

    // Cleanup
    await qb.driverDB.execute(`DROP TABLE IF EXISTS ${tableName}`);
    await qb.close();
    await cleanupDatabase();

    // Resumen
    console.log('\n🎉 RESUMEN EXITOSO:');
    console.log('   ✅ QueryBuilder + MySqlDriver integración funcionando');
    console.log('   ✅ QueryBuilder.execute() ejecuta queries correctamente');
    console.log('   ✅ Fluent API (select, from, where) genera SQL válido');
    console.log('   ✅ Resultados obtenidos correctamente con .response()');
    console.log('   ✅ Múltiples queries ejecutadas exitosamente');

    return true;

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    await cleanupDatabase();
    throw error;
  }
}

// Execute test
runSimpleQueryBuilderTest()
  .then(() => {
    console.log('\n🎯 QUERYBUILDER.EXECUTE() TEST SUCCESSFUL');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 QUERYBUILDER.EXECUTE() TEST FAILED');
    console.error(error);
    process.exit(1);
  });
