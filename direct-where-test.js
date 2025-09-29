/**
 * Test directo del método where con string
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testDirectWhere() {
  console.log('🧪 Testing direct WHERE with string\n');

  try {
    console.log('Creating instance...');
    const qb = new PostgreSQLExtended();
    console.log('✅ Instance created');

    console.log('Adding SELECT...');
    qb.select(['*']);
    console.log('✅ SELECT added');

    console.log('Adding FROM...');
    qb.from('products');
    console.log('✅ FROM added');

    console.log('Adding WHERE directly...');
    // Usar where directamente en lugar de jsonContains
    qb.where("metadata @> '{\"brand\":\"Apple\"}'");
    console.log('✅ WHERE added');

    console.log('Converting to string...');
    const result = await qb.toString();
    console.log('✅ Result:', result.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testDirectWhere();