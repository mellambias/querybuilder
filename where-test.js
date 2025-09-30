/**
 * Test del método where para entender la API
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testWhere() {
  console.log('🧪 Testing WHERE method API\n');

  try {
    console.log('Test 1: Standard where with 3 parameters...');
    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1.select(['*']).from('test').where('id', '=', 1).toString();
    console.log('✅ Standard where:', result1.trim());

    console.log('\nTest 2: Where with 2 parameters...');
    const qb2 = new PostgreSQLExtended();
    const result2 = await qb2.select(['*']).from('test').where('id', 1).toString();
    console.log('✅ Two-param where:', result2.trim());

    console.log('\nTest 3: Where with single string...');
    const qb3 = new PostgreSQLExtended();
    const result3 = await qb3.select(['*']).from('test').where("id = 1").toString();
    console.log('✅ String where:', result3.trim());

    console.log('\nNow testing the problematic condition...');
    const qb4 = new PostgreSQLExtended();
    const testCondition = "metadata @> '{\"brand\":\"Apple\"}'";
    console.log('Condition to test:', testCondition);

    const result4 = await qb4.select(['*']).from('products').where(testCondition).toString();
    console.log('✅ Custom condition:', result4.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar tests
testWhere();