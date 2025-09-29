// Test simple de WHERE para ver qué está pasando
import PostgreSQLExtended from '../postgresql-extended.js';

async function testSimpleWhere() {
  console.log('🔧 TEST SIMPLE WHERE');
  console.log('====================');

  try {
    // Test 1: WHERE normal simple
    console.log('\n📋 Test 1: WHERE normal');
    const qb1 = new PostgreSQLExtended();
    qb1.select('*').from('users').where(['id = 1'], qb1);
    console.log('✅ WHERE normal creado');

    const sql1 = await qb1.toString();
    console.log('📄 SQL:', sql1);

    // Test 2: ¿Cómo maneja strings directos?
    console.log('\n📋 Test 2: WHERE string directo');
    const qb2 = new PostgreSQLExtended();
    qb2.select('*').from('users').where('id = 1', qb2);
    console.log('✅ WHERE string creado');

    const sql2 = await qb2.toString();
    console.log('📄 SQL:', sql2);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
  }
}

testSimpleWhere();