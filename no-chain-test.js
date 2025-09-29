/**
 * Test sin encadenamiento de métodos
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testWithoutChaining() {
  console.log('🧪 Testing without method chaining\n');

  try {
    console.log('Creating instance...');
    const qb = new PostgreSQLExtended();

    console.log('Setting select...');
    qb.select(['*']);

    console.log('Setting from...');
    qb.from('products');

    console.log('Setting where directly...');
    qb.where("metadata @> '{\"brand\":\"Apple\"}'");

    console.log('Converting to string...');
    const result = await qb.toString();
    console.log('✅ Without chaining:', result.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testWithoutChaining();