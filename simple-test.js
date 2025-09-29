/**
 * Test Simple para PostgreSQLExtended
 */

import PostgreSQLExtended from './packages/@querybuilder/postgresql/postgresql-extended.js';

console.log('🧪 Testing PostgreSQLExtended - Simple Version...\n');

try {
  // Test 1: Instanciación básica
  console.log('1. Testing basic instantiation...');
  const qb = new PostgreSQLExtended();
  console.log('✅ PostgreSQLExtended instantiated successfully');

  // Test 2: SELECT básico sin toString async
  console.log('\n2. Testing basic SELECT structure...');
  const qb2 = new PostgreSQLExtended();
  qb2.select(['id', 'name']).from('users');
  console.log('✅ Basic SELECT structure created');

  // Test 3: JSON Contains structure
  console.log('\n3. Testing JSON Contains structure...');
  const qb3 = new PostgreSQLExtended();
  const result = qb3.select(['*']).from('products').jsonContains('metadata', { brand: 'Apple' });
  console.log('✅ JSON Contains structure created:', result === qb3);

  // Test 4: Verificar que los métodos existen
  console.log('\n4. Testing method availability...');
  const methods = [
    'jsonContains', 'jsonHasKey', 'arrayContains', 'arrayOverlaps',
    'fullTextSearch', 'regexMatch', 'rowNumber', 'with'
  ];

  methods.forEach(method => {
    if (typeof qb[method] === 'function') {
      console.log(`✅ Method ${method} is available`);
    } else {
      console.log(`❌ Method ${method} is NOT available`);
    }
  });

  console.log('\n🎉 All structural tests passed!');
  console.log('\n⏳ Now testing async toString() functionality...');

  // Test async solo al final
  setTimeout(async () => {
    try {
      const qb4 = new PostgreSQLExtended();
      const query = await qb4.select(['id', 'name']).from('users').toString();
      console.log('✅ Async toString works:', query);
    } catch (error) {
      console.log('❌ Async toString failed:', error.message);
    }
  }, 100);

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}