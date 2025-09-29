/**
 * Test de escape y caracteres especiales en WHERE
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testSpecialCharacters() {
  console.log('🧪 Testing special characters in WHERE\n');

  try {
    // Test 1: Simple condition
    console.log('Test 1: Simple condition...');
    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1.select(['*']).from('products').where('price > 100').toString();
    console.log('✅ Simple:', result1.trim());

    // Test 2: Condition with single quotes
    console.log('\nTest 2: Condition with quotes...');
    const qb2 = new PostgreSQLExtended();
    const result2 = await qb2.select(['*']).from('products').where("name = 'Apple'").toString();
    console.log('✅ With quotes:', result2.trim());

    // Test 3: Array format
    console.log('\nTest 3: Array format...');
    const qb3 = new PostgreSQLExtended();
    const result3 = await qb3.select(['*']).from('products').where(["name = 'Apple'"]).toString();
    console.log('✅ Array format:', result3.trim());

    // Test 4: PostgreSQL @ operator without @> 
    console.log('\nTest 4: Simple @ operator...');
    const qb4 = new PostgreSQLExtended();
    const result4 = await qb4.select(['*']).from('products').where("tags @> ARRAY['electronics']").toString();
    console.log('✅ @ operator:', result4.trim());

    // Test 5: Step by step building
    console.log('\nTest 5: Step by step...');
    const qb5 = new PostgreSQLExtended();
    console.log('  Building query...');
    qb5.select(['*']);
    qb5.from('products');
    console.log('  Before where...');
    qb5.where('id = 1');
    console.log('  After where...');
    const result5 = await qb5.toString();
    console.log('✅ Step by step:', result5.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testSpecialCharacters();