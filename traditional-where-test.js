/**
 * Test de WHERE tradicional
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testTraditionalWhere() {
  console.log('🧪 Testing traditional WHERE patterns\n');

  try {
    // Test 1: WHERE con 3 parámetros
    console.log('Test 1: Traditional 3-param WHERE...');
    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1.select(['*']).from('products').where('id', '=', '1').toString();
    console.log('✅ 3-param WHERE:', result1.trim());

    // Test 2: WHERE con 2 parámetros
    console.log('\nTest 2: Traditional 2-param WHERE...');
    const qb2 = new PostgreSQLExtended();
    const result2 = await qb2.select(['*']).from('products').where('name', 'Apple').toString();
    console.log('✅ 2-param WHERE:', result2.trim());

    // Test 3: WHERE con array
    console.log('\nTest 3: Array WHERE...');
    const qb3 = new PostgreSQLExtended();
    const result3 = await qb3.select(['*']).from('products').where(['id', '=', '1']).toString();
    console.log('✅ Array WHERE:', result3.trim());

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testTraditionalWhere();