// Test de regexMatch que supuestamente funciona
import PostgreSQLExtended from '../postgresql-extended.js';

async function testRegexMatch() {
  console.log('🔧 TEST REGEX MATCH');
  console.log('==================');

  try {
    const qb = new PostgreSQLExtended();
    qb.select('*').from('users');
    console.log('✅ Base preparada');

    // Test regexMatch que usa whereRaw
    console.log('📋 Test: regexMatch (usa whereRaw internamente)');
    qb.regexMatch('name', 'john.*');
    console.log('✅ regexMatch ejecutado');

    const sql = await qb.toString();
    console.log('📄 SQL:', sql);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
  }
}

testRegexMatch();