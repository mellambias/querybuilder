/**
 * Test específico del método jsonContains
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testJsonContains() {
  console.log('🧪 Testing jsonContains method\n');

  try {
    console.log('Test 1: Building condition manually...');
    const testValue = { brand: 'Apple' };
    const jsonValue = JSON.stringify(testValue);
    const condition = `metadata @> '${jsonValue}'`;
    console.log('Condition:', condition);

    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1.select(['*']).from('products').where(condition).toString();
    console.log('✅ Manual condition:', result1.trim());

    console.log('\nTest 2: Using jsonContains method...');
    const qb2 = new PostgreSQLExtended();
    console.log('  Creating instance...');
    console.log('  Adding select...');
    qb2.select(['*']);
    console.log('  Adding from...');
    qb2.from('products');
    console.log('  Calling jsonContains...');

    // Llamar al método directamente
    const result = qb2.jsonContains('metadata', { brand: 'Apple' });
    console.log('  jsonContains returned:', result === qb2);
    console.log('  Converting to string...');
    const finalResult = await result.toString();
    console.log('✅ jsonContains method:', finalResult.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar test
testJsonContains();