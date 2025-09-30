#!/usr/bin/env node

/**
 * Debug script para entender el error "value is not iterable"
 */

import MySqlDriver from '../drivers/MySqlDriver.js';
import { initializeDatabase, cleanupDatabase, createTestDatabase } from './test-setup.js';
import { config } from '../../core/config.js';

async function debugErrorHandling() {
  console.log('🔍 Debugging error handling...');

  try {
    await createTestDatabase();
    await initializeDatabase();

    const params = config.testing.MySQL.params;
    const driver = new MySqlDriver(params);

    console.log('\n1. Testing invalid SQL syntax...');
    const invalidQuery = 'SELCT * FRM invalid_table';
    console.log('Query:', invalidQuery);

    try {
      const result = await driver.execute(invalidQuery);
      console.log('Error result:', JSON.stringify(result, null, 2));
      console.log('Result type:', typeof result);
      console.log('Result properties:', Object.keys(result));
    } catch (error) {
      console.log('Caught error:', error);
      console.log('Error type:', typeof error);
      console.log('Error properties:', Object.keys(error));
    }

    await cleanupDatabase();
    console.log('\n✅ Debug completed successfully');

  } catch (error) {
    console.error('❌ Debug error:', error);
    await cleanupDatabase();
  }
}

debugErrorHandling();