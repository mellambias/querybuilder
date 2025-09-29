// Test para entender diferentes patterns de WHERE
import PostgreSQLExtended from '../postgresql-extended.js';

async function testWherePatterns() {
  console.log('🔧 TEST WHERE PATTERNS COMPLETO');
  console.log('===============================');

  try {
    // Test 1: WHERE de 2 parámetros (columna, valor)
    console.log('\n📋 Test 1: WHERE(column, value)');
    const qb1 = new PostgreSQLExtended();
    qb1.select('*').from('users').where('id', 1);
    console.log('✅ WHERE 2 params creado');

    const sql1 = await qb1.toString();
    console.log('📄 SQL 1:', sql1);

    // Test 2: WHERE de 3 parámetros (columna, operador, valor)
    console.log('\n📋 Test 2: WHERE(column, operator, value)');
    const qb2 = new PostgreSQLExtended();
    qb2.select('*').from('users').where('age', '>', 18);
    console.log('✅ WHERE 3 params creado');

    const sql2 = await qb2.toString();
    console.log('📄 SQL 2:', sql2);

    // Test 3: WHERE con operador custom
    console.log('\n📋 Test 3: WHERE con operador personalizado');
    const qb3 = new PostgreSQLExtended();
    qb3.select('*').from('users').where('metadata', '?|', "ARRAY['name', 'email']");
    console.log('✅ WHERE con operador ?| creado');

    const sql3 = await qb3.toString();
    console.log('📄 SQL 3:', sql3);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
  }
}

testWherePatterns();