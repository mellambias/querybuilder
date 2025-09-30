#!/usr/bin/env node

/**
 * Debug script para entender el formato de respuesta del MySqlDriver
 */

import MySqlDriver from '../drivers/MySqlDriver.js';
import { initializeDatabase, cleanupDatabase, createTestDatabase } from './test-setup.js';
import { config } from '../../core/config.js';

async function debugDriver() {
  console.log('🔍 Debugging MySqlDriver response format...');

  try {
    await createTestDatabase();
    await initializeDatabase();

    const params = config.testing.MySQL.params;
    const driver = new MySqlDriver(params);

    console.log('\n1. Testing connection...');
    const connectResult = await driver.connect();
    console.log('Connect result:', JSON.stringify(connectResult, null, 2));

    console.log('\n2. Testing simple SELECT...');
    const selectResult = await driver.execute('SELECT 1 as test_value');
    console.log('Select result:', JSON.stringify(selectResult, null, 2));
    console.log('Select result.response:', JSON.stringify(selectResult.response, null, 2));

    console.log('\n3. Testing CREATE TABLE...');
    const createResult = await driver.execute(`
      CREATE TABLE IF NOT EXISTS debug_test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB
    `);
    console.log('Create result:', JSON.stringify(createResult, null, 2));
    console.log('Create result.response:', JSON.stringify(createResult.response, null, 2));

    console.log('\n4. Testing SHOW TABLES...');
    const showResult = await driver.execute("SHOW TABLES LIKE 'debug_test'");
    console.log('Show result:', JSON.stringify(showResult, null, 2));
    console.log('Show result.response:', JSON.stringify(showResult.response, null, 2));
    console.log('Show result.response type:', typeof showResult.response);
    console.log('Show result.response is array:', Array.isArray(showResult.response));

    console.log('\n5. Cleanup...');
    await driver.execute('DROP TABLE IF EXISTS debug_test');

    await cleanupDatabase();
    console.log('\n✅ Debug completed successfully');

  } catch (error) {
    console.error('❌ Debug error:', error);
    await cleanupDatabase();
  }
}

debugDriver();