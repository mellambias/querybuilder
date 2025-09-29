/**
 * Test Paso a Paso para PostgreSQLExtended
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testStepByStep() {
  console.log('🧪 PostgreSQLExtended - Step by Step Test\n');

  try {
    console.log('Step 1: Basic instantiation...');
    const qb = new PostgreSQLExtended();
    console.log('✅ Step 1: Passed');

    console.log('Step 2: Basic SELECT...');
    const basicQuery = await qb.select(['id']).from('test').toString();
    console.log('✅ Step 2: Passed -', basicQuery.trim());

    console.log('Step 3: JSON Contains test...');
    const qb2 = new PostgreSQLExtended();
    console.log('  3a: Instance created');

    const result1 = qb2.select(['*']);
    console.log('  3b: Select added');

    const result2 = result1.from('products');
    console.log('  3c: From added');

    const result3 = result2.jsonContains('metadata', { brand: 'Apple' });
    console.log('  3d: jsonContains called');

    const finalQuery = await result3.toString();
    console.log('✅ Step 3: Passed -', finalQuery.trim());

    console.log('\n🎉 All step-by-step tests passed!');

  } catch (error) {
    console.error('❌ Test failed at current step:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar tests
testStepByStep();