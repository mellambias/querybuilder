#!/usr/bin/env node

/**
 * Debug script para entender qué parámetros son realmente requeridos
 */

import MySqlDriver from '../drivers/MySqlDriver.js';

async function debugConnectionParams() {
  console.log('🔍 Testing connection parameters...');

  // Test 1: Sin parámetros
  console.log('\n1. Testing with empty params...');
  try {
    const driver1 = new MySqlDriver({});
    const result1 = await driver1.connect();
    console.log('Empty params result:', result1);
  } catch (error) {
    console.log('Empty params error:', error.message);
  }

  // Test 2: Solo host
  console.log('\n2. Testing with only host...');
  try {
    const driver2 = new MySqlDriver({ host: 'localhost' });
    const result2 = await driver2.connect();
    console.log('Host only result:', result2);
  } catch (error) {
    console.log('Host only error:', error.message);
  }

  // Test 3: Host falso
  console.log('\n3. Testing with invalid host...');
  try {
    const driver3 = new MySqlDriver({ host: 'invalid-host-12345' });
    const result3 = await driver3.connect();
    console.log('Invalid host result:', result3);
  } catch (error) {
    console.log('Invalid host error:', error.message);
  }

  console.log('\n✅ Debug completed');
}

debugConnectionParams();
