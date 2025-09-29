/**
 * Test debug específico de jsonContains
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testJsonContainsDebug() {
  console.log('🧪 Testing jsonContains debug\n');

  try {
    console.log('Creating instance...');
    const qb = new PostgreSQLExtended();

    console.log('Setting up query...');
    qb.select(['*']).from('products');

    console.log('Calling jsonContains manually...');
    const testValue = { brand: 'Apple' };
    const jsonValue = JSON.stringify(testValue);
    const condition = `metadata @> '${jsonValue}'`;
    console.log('Generated condition:', condition);

    console.log('Calling where directly with generated condition...');
    const result = qb.where(condition);
    console.log('Where returned:', result === qb);

    console.log('Converting to string...');
    const finalResult = await result.toString();
    console.log('✅ Final result:', finalResult.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testJsonContainsDebug();