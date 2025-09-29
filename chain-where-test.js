/**
 * Test con encadenamiento pero sin jsonContains
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testChainedWhere() {
  console.log('🧪 Testing chained WHERE\n');

  try {
    console.log('Test 1: Chained simple where...');
    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1
      .select(['*'])
      .from('products')
      .where('id = 1')
      .toString();
    console.log('✅ Chained simple:', result1.trim());

    console.log('\nTest 2: Chained PostgreSQL specific...');
    const qb2 = new PostgreSQLExtended();
    const result2 = await qb2
      .select(['*'])
      .from('products')
      .where("metadata @> '{\"brand\":\"Apple\"}'")
      .toString();
    console.log('✅ Chained PostgreSQL:', result2.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testChainedWhere();