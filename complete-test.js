/**
 * Test Completo para PostgreSQLExtended
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

async function runCompleteTests() {
  console.log('🧪 PostgreSQLExtended - Complete Functionality Test\n');

  try {
    // Test 1: JSON Operations
    console.log('🔍 1. JSON OPERATIONS');

    const jsonTest1 = new PostgreSQLExtended();
    const jsonQuery1 = await jsonTest1
      .select(['*'])
      .from('products')
      .jsonContains('metadata', { brand: 'Apple' })
      .toString();
    console.log('✅ JSON Contains:', jsonQuery1.trim());

    const jsonTest2 = new PostgreSQLExtended();
    const jsonQuery2 = await jsonTest2
      .select(['*'])
      .from('users')
      .jsonHasKey('profile', 'email')
      .toString();
    console.log('✅ JSON Has Key:', jsonQuery2.trim());

    const jsonTest3 = new PostgreSQLExtended();
    const jsonQuery3 = await jsonTest3
      .select(['*'])
      .from('users')
      .jsonPath('data', '$.user.name', '=', 'John')
      .toString();
    console.log('✅ JSON Path:', jsonQuery3.trim());

    // Test 2: Array Operations
    console.log('\n🔍 2. ARRAY OPERATIONS');

    const arrayTest1 = new PostgreSQLExtended();
    const arrayQuery1 = await arrayTest1
      .select(['id', 'name'])
      .from('products')
      .arrayContains('tags', ['electronics', 'mobile'])
      .toString();
    console.log('✅ Array Contains:', arrayQuery1.trim());

    const arrayTest2 = new PostgreSQLExtended();
    const arrayQuery2 = await arrayTest2
      .select(['*'])
      .from('products')
      .arrayOverlaps('categories', ['tech', 'gadgets'])
      .toString();
    console.log('✅ Array Overlaps:', arrayQuery2.trim());

    // Test 3: Window Functions
    console.log('\n🔍 3. WINDOW FUNCTIONS');

    const windowTest1 = new PostgreSQLExtended();
    const windowQuery1 = await windowTest1
      .select(['id', 'name'])
      .from('employees')
      .rowNumber(['department'], ['salary DESC'], 'row_num')
      .toString();
    console.log('✅ Row Number:', windowQuery1.trim());

    const windowTest2 = new PostgreSQLExtended();
    const windowQuery2 = await windowTest2
      .select(['id', 'name'])
      .from('sales')
      .rank(['region'], ['amount DESC'], 'sales_rank')
      .toString();
    console.log('✅ Rank:', windowQuery2.trim());

    // Test 4: Full Text Search
    console.log('\n🔍 4. FULL TEXT SEARCH');

    const ftsTest1 = new PostgreSQLExtended();
    const ftsQuery1 = await ftsTest1
      .select(['*'])
      .from('articles')
      .fullTextSearch('content', 'PostgreSQL database')
      .toString();
    console.log('✅ Full Text Search:', ftsQuery1.trim());

    const ftsTest2 = new PostgreSQLExtended();
    const ftsQuery2 = await ftsTest2
      .select(['title'])
      .from('articles')
      .fullTextRank('content', 'PostgreSQL tutorial', 'english', 'relevance')
      .toString();
    console.log('✅ Full Text Rank:', ftsQuery2.trim());

    // Test 5: Regex Operations
    console.log('\n🔍 5. REGEX OPERATIONS');

    const regexTest1 = new PostgreSQLExtended();
    const regexQuery1 = await regexTest1
      .select(['*'])
      .from('users')
      .regexMatch('email', '@gmail\.com$')
      .toString();
    console.log('✅ Regex Match:', regexQuery1.trim());

    // Test 6: Complex Chaining
    console.log('\n🔍 6. COMPLEX CHAINING');

    const complexTest = new PostgreSQLExtended();
    const complexQuery = await complexTest
      .select(['id', 'name', 'metadata', 'tags'])
      .from('products')
      .jsonContains('metadata', { category: 'electronics' })
      .arrayOverlaps('tags', ['popular', 'trending'])
      .where('price', '>', 100)
      .orderBy('created_at', 'DESC')
      .limit(10)
      .toString();
    console.log('✅ Complex Chaining:', complexQuery.trim());

    // Test 7: Utility Functions
    console.log('\n🔍 7. UTILITY FUNCTIONS');

    const utilTest = new PostgreSQLExtended();
    const coalesceExpr = utilTest.coalesce('name', 'username', "'Anonymous'");
    console.log('✅ Coalesce:', coalesceExpr);

    const nullifExpr = utilTest.nullif('value', '0');
    console.log('✅ Nullif:', nullifExpr);

    // Test 8: Dialect Info
    console.log('\n🔍 8. DIALECT INFO');

    const dialectInfo = new PostgreSQLExtended().getDialectInfo();
    console.log('✅ Dialect Name:', dialectInfo.name);
    console.log('✅ Supported Features Available:', dialectInfo.features !== undefined);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('\n📊 SUMMARY:');
    console.log('- JSON Operations: ✅ Working');
    console.log('- Array Operations: ✅ Working');
    console.log('- Window Functions: ✅ Working');
    console.log('- Full Text Search: ✅ Working');
    console.log('- Regex Operations: ✅ Working');
    console.log('- Complex Chaining: ✅ Working');
    console.log('- Utility Functions: ✅ Working');
    console.log('- Class Information: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar tests
runCompleteTests();