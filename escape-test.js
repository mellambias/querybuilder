/**
 * Test de diferentes métodos de escape
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testEscaping() {
  console.log('🧪 Testing different escaping methods\n');

  try {
    console.log('Test 1: Simple quotes...');
    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1
      .select(['*'])
      .from('products')
      .where("name = 'Apple'")
      .toString();
    console.log('✅ Simple quotes:', result1.trim());

    console.log('\nTest 2: Escaped quotes...');
    const qb2 = new PostgreSQLExtended();
    const result2 = await qb2
      .select(['*'])
      .from('products')
      .where('metadata @> \'{"brand":"Apple"}\'')
      .toString();
    console.log('✅ Escaped quotes:', result2.trim());

    console.log('\nTest 3: Template literal...');
    const qb3 = new PostgreSQLExtended();
    const jsonStr = '{"brand":"Apple"}';
    const condition = `metadata @> '${jsonStr}'`;
    console.log('Condition:', condition);
    const result3 = await qb3
      .select(['*'])
      .from('products')
      .where(condition)
      .toString();
    console.log('✅ Template literal:', result3.trim());

    console.log('\nTest 4: Array format...');
    const qb4 = new PostgreSQLExtended();
    const result4 = await qb4
      .select(['*'])
      .from('products')
      .where([`metadata @> '{"brand":"Apple"}'`])
      .toString();
    console.log('✅ Array format:', result4.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testEscaping();