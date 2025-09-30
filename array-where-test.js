/**
 * Test usando arrays en WHERE
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testArrayWhere() {
  console.log('🧪 Testing array-based WHERE\n');

  try {
    // Test 1: WHERE con array
    console.log('Test 1: Array WHERE...');
    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1.select(['*']).from('products').where(['id = 1']).toString();
    console.log('✅ Array WHERE:', result1.trim());

    // Test 2: WHERE con string directo
    console.log('\nTest 2: String WHERE...');
    const qb2 = new PostgreSQLExtended();
    const result2 = await qb2.select(['*']).from('products').where('id = 1').toString();
    console.log('✅ String WHERE:', result2.trim());

    // Test 3: WHERE con condición PostgreSQL específica
    console.log('\nTest 3: PostgreSQL specific WHERE...');
    const qb3 = new PostgreSQLExtended();
    const condition = "metadata @> '{\"brand\":\"Apple\"}'";
    const result3 = await qb3.select(['*']).from('products').where(condition).toString();
    console.log('✅ PostgreSQL WHERE:', result3.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testArrayWhere();