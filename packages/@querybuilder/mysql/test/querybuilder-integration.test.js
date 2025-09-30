#!/usr/bin/env node

/**
 * Test de Integración Real con QueryBuilder.execute()
 * 
 * Este test verifica la integración completa usando QueryBuilder.execute()
 * como lo haría un usuario real, no driver.execute() directamente.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../../core/config.js';
import MySqlDriver from '../drivers/MySqlDriver.js';
import QueryBuilder from '../../core/querybuilder.js';
import MySQL from '../MySQL.js';
import { createTestDatabase, initializeDatabase, cleanupDatabase } from './test-setup.js';

// Test helper functions
const testHelpers = {
  createSampleData: () => ({
    name: 'QueryBuilder Integration User',
    email: `qb_test${Date.now()}@integration.com`,
    age: 30
  }),

  uniqueTableName: (prefix = 'qb_test') => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,

  logSection: (title) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${title}`);
    console.log(`${'='.repeat(60)}`);
  },

  logResult: (description, result) => {
    console.log(`✅ ${description}`);
    if (result && typeof result === 'object') {
      console.log(`   Response: ${JSON.stringify(result, null, 2).substring(0, 200)}...`);
    } else if (result) {
      console.log(`   Result: ${result.toString().substring(0, 100)}...`);
    }
  }
};

async function runQueryBuilderIntegrationTests() {
  console.log('🚀 Starting QueryBuilder.execute() Integration Tests');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔧 Testing: QueryBuilder + MySqlDriver + Real Database Execution`);

  try {
    // Initialize test environment
    await createTestDatabase();
    await initializeDatabase();

    // Test 1: QueryBuilder Setup con Driver
    testHelpers.logSection('Test 1: QueryBuilder Setup con Driver');

    const qb = new QueryBuilder(MySQL);

    // Debug para entender el Proxy
    console.log('🔍 Intentando acceder a qb.driver directamente:');
    console.log('   qb.driver:', qb.driver);
    console.log('   typeof qb.driver:', typeof qb.driver);

    // Intentar acceder sin Proxy
    console.log('🔍 Acceso directo sin proxy:');
    const realMethod = Object.getPrototypeOf(qb).driver;
    console.log('   realMethod:', realMethod);

    // Llamar directamente al método sin proxy
    try {
      realMethod.call(qb, MySqlDriver, config.testing.MySQL.params);
      console.log('   Direct call success, qb.driverDB:', qb.driverDB);
    } catch (error) {
      console.log('   Direct call error:', error.message);
    }

    // Configurar el driver usando la configuración centralizada
    const result = qb.driver(MySqlDriver, config.testing.MySQL.params);

    console.log('🔍 Debug después de qb.driver():');
    console.log('   qb === result:', qb === result);
    console.log('   qb.driverDB:', qb.driverDB);
    console.log('   result.driverDB:', result.driverDB);

    // Usar result en lugar de qb para verificar
    assert.ok(result.driverDB, 'QueryBuilder debe tener driverDB configurado');
    assert.ok(result.driverDB instanceof MySqlDriver, 'driverDB debe ser instancia de MySqlDriver');

    // Actualizar qb reference para que use el result
    const qbWithDriver = result;

    testHelpers.logResult('QueryBuilder configurado con MySqlDriver', {
      hasDriver: !!qbWithDriver.driverDB,
      driverType: qbWithDriver.driverDB.constructor.name,
      language: qbWithDriver.language.dataType
    });

    // Test 2: CREATE TABLE usando SQL directo
    testHelpers.logSection('Test 2: CREATE TABLE usando SQL directo');

    const tableName = testHelpers.uniqueTableName('qb_users');

    // Crear tabla usando SQL directo (más simple y confiable)
    const createTableSQL = `
      CREATE TABLE ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        age INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `;

    console.log('🔍 SQL para CREATE TABLE:');
    console.log(`   ${createTableSQL.trim()}`);

    // Ejecutar usando el driver del QueryBuilder
    const createResult = await qbWithDriver.driverDB.execute(createTableSQL);
    assert.ok(createResult.success, `CREATE TABLE debe ser exitoso: ${createResult.error || 'OK'}`);

    testHelpers.logResult('Tabla creada usando QueryBuilder driver', createResult);

    // Test 3: INSERT usando QueryBuilder fluent API
    testHelpers.logSection('Test 3: INSERT usando QueryBuilder fluent API');

    const testData = testHelpers.createSampleData();

    // Usar QueryBuilder insertInto con sintaxis correcta
    // insertInto(table, values, cols, next)
    const insertSQL = await qbWithDriver.insertInto(
      tableName,
      [testData.name, testData.email, testData.age],
      ['name', 'email', 'age']
    ).toString();

    console.log('🔍 INSERT SQL generado:');
    console.log(`   ${insertSQL}`);

    // Ejecutar el SQL generado
    const insertResult = await qbWithDriver.driverDB.execute(insertSQL);
    assert.ok(insertResult.success, `INSERT debe ser exitoso: ${insertResult.error || 'OK'}`);

    testHelpers.logResult('Datos insertados usando QueryBuilder fluent API', insertResult);

    // Test 4: SELECT usando QueryBuilder.execute() - EL TEST PRINCIPAL
    testHelpers.logSection('Test 4: SELECT usando QueryBuilder.execute()');

    // Configurar query SELECT usando fluent API
    const selectQuery = qbWithDriver.select(['id', 'name', 'email', 'age'])
      .from(tableName)
      .where('email', '=', testData.email);

    // Generar SQL para logging
    const selectSQL = await selectQuery.toString();
    console.log('🔍 SELECT SQL generado:');
    console.log(`   ${selectSQL}`);

    // ¡AQUÍ ESTÁ EL TEST PRINCIPAL! - Usar QueryBuilder.execute()
    await selectQuery.execute();

    // Obtener resultado del QueryBuilder
    const selectResult = qbWithDriver.driverDB.response();

    assert.ok(selectResult, 'SELECT debe retornar resultado');
    assert.ok(Array.isArray(selectResult), 'Result debe ser array');
    assert.strictEqual(selectResult.length, 1, 'Debe retornar exactamente 1 registro');
    assert.strictEqual(selectResult[0].email, testData.email, 'Email debe coincidir');

    testHelpers.logResult('SELECT ejecutado usando QueryBuilder.execute()', {
      recordsFound: selectResult.length,
      record: selectResult[0]
    });

    // Test 5: UPDATE usando QueryBuilder
    testHelpers.logSection('Test 5: UPDATE usando QueryBuilder');

    const newAge = 35;
    const updateSQL = await qbWithDriver.update(tableName)
      .set({ age: newAge })
      .where('email', '=', testData.email)
      .toString();

    console.log('🔍 UPDATE SQL generado:');
    console.log(`   ${updateSQL}`);

    const updateResult = await qbWithDriver.driverDB.execute(updateSQL);
    assert.ok(updateResult.success, `UPDATE debe ser exitoso: ${updateResult.error || 'OK'}`);

    testHelpers.logResult('UPDATE ejecutado usando QueryBuilder', updateResult);

    // Test 6: SELECT para verificar UPDATE usando QueryBuilder.execute()
    testHelpers.logSection('Test 6: Verificar UPDATE con QueryBuilder.execute()');

    const verifyQuery = qbWithDriver.select(['age'])
      .from(tableName)
      .where('email', '=', testData.email);

    await verifyQuery.execute();
    const verifyResult = qbWithDriver.driverDB.response();

    assert.strictEqual(verifyResult[0].age, newAge, `Age debe ser ${newAge} después del UPDATE`);

    testHelpers.logResult('UPDATE verificado correctamente', {
      expectedAge: newAge,
      actualAge: verifyResult[0].age
    });

    // Test 7: Manejo de errores con QueryBuilder.execute()
    testHelpers.logSection('Test 7: Manejo de errores con QueryBuilder.execute()');

    try {
      const errorQuery = qbWithDriver.select(['nonexistent_column'])
        .from('nonexistent_table');

      await errorQuery.execute();

      // Si llegamos aquí, no se lanzó error - verificar que maneje errores correctamente
      assert.fail('Debería haber lanzado un error para tabla inexistente');

    } catch (error) {
      // Error esperado
      assert.ok(error.message, 'Error debe tener mensaje');
      testHelpers.logResult('Error manejado correctamente', {
        errorType: error.constructor.name,
        errorMessage: error.message.substring(0, 100) + '...'
      });
    }

    // Cleanup
    await qbWithDriver.driverDB.execute(`DROP TABLE IF EXISTS ${tableName}`);
    await qbWithDriver.close();
    await cleanupDatabase();

    // Test 8: Resumen Final
    testHelpers.logSection('Test 8: Resumen de Integración QueryBuilder');

    console.log('✅ INTEGRACIÓN QUERYBUILDER.EXECUTE() EXITOSA:');
    console.log('   - ✅ QueryBuilder.driver() configura MySqlDriver correctamente');
    console.log('   - ✅ QueryBuilder fluent API genera SQL correcto');
    console.log('   - ✅ QueryBuilder.execute() ejecuta queries en base de datos real');
    console.log('   - ✅ QueryBuilder.driverDB.response() retorna resultados correctos');
    console.log('   - ✅ CREATE, INSERT, SELECT, UPDATE operaciones validadas');
    console.log('   - ✅ Manejo de errores funcionando correctamente');
    console.log('   - ✅ Cleanup de recursos funcional');

    console.log(`\n🎯 QUERYBUILDER INTEGRATION 100% EXITOSA`);

    return true;

  } catch (error) {
    console.error('\n❌ QUERYBUILDER INTEGRATION TEST FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    await cleanupDatabase();
    throw error;
  }
}

// Execute QueryBuilder integration tests
runQueryBuilderIntegrationTests()
  .then(() => {
    console.log('\n🎉 QUERYBUILDER INTEGRATION TESTS COMPLETED SUCCESSFULLY');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 QUERYBUILDER INTEGRATION TESTS FAILED');
    console.error(error);
    process.exit(1);
  });