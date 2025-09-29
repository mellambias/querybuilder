/**
 * Test Manual para PostgreSQLExtended
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function testBasicFunctionality() {
  console.log('🧪 Testing PostgreSQLExtended...\n');

  try {
    // Test 1: Instanciación básica
    console.log('1. Testing basic instantiation...');
    const qb = new PostgreSQLExtended();
    console.log('✅ PostgreSQLExtended instantiated successfully');

    // Test 2: SELECT básico
    console.log('\n2. Testing basic SELECT...');
    const basicQuery = await qb.select(['id', 'name']).from('users').toString();
    console.log('✅ Basic SELECT:', basicQuery);

    // Test 3: JSON Contains
    console.log('\n3. Testing JSON Contains...');
    const qb2 = new PostgreSQLExtended();
    const jsonQuery = await qb2
      .select(['*'])
      .from('products')
      .jsonContains('metadata', { brand: 'Apple' })
      .toString();
    console.log('✅ JSON Contains:', jsonQuery);

    // Test 4: Array Contains
    console.log('\n4. Testing Array Contains...');
    const qb3 = new PostgreSQLExtended();
    const arrayQuery = await qb3
      .select(['id', 'name'])
      .from('products')
      .arrayContains('tags', ['electronics', 'mobile'])
      .toString();
    console.log('✅ Array Contains:', arrayQuery);

    // Test 5: JSON Has Key
    console.log('\n5. Testing JSON Has Key...');
    const qb4 = new PostgreSQLExtended();
    const keyQuery = await qb4
      .select(['*'])
      .from('users')
      .jsonHasKey('profile', 'email')
      .toString();
    console.log('✅ JSON Has Key:', keyQuery);

    // Test 6: Window Functions
    console.log('\n6. Testing Window Functions...');
    const qb5 = new PostgreSQLExtended();
    const windowQuery = await qb5
      .select(['id', 'name'])
      .from('employees')
      .rowNumber(['department'], ['salary DESC'], 'row_num')
      .toString();
    console.log('✅ Window Function:', windowQuery);

    // Test 7: Full Text Search
    console.log('\n7. Testing Full Text Search...');
    const qb6 = new PostgreSQLExtended();
    const ftsQuery = await qb6
      .select(['*'])
      .from('articles')
      .fullTextSearch('content', 'PostgreSQL database')
      .toString();
    console.log('✅ Full Text Search:', ftsQuery);

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar tests
testBasicFunctionality();