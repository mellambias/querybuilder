// Test más completo de WHERE patterns
import PostgreSQLExtended from '../postgresql-extended.js';

async function testWherePatterns() {
  console.log('🔧 TEST WHERE PATTERNS');
  console.log('=====================');

  try {
    // Test 1: Query completa con WHERE array
    console.log('\n📋 Test 1: Query completa con WHERE array');
    const qb1 = new PostgreSQLExtended();
    qb1.select('*').from('users');
    console.log('✅ SELECT y FROM agregados');

    const beforeWhere = await qb1.toString();
    console.log('📄 Antes de WHERE:', beforeWhere);

    qb1.where(['id = 1'], qb1);
    console.log('✅ WHERE agregado');

    const afterWhere = await qb1.toString();
    console.log('📄 Después de WHERE:', afterWhere);

    // Test 2: Verificar JSON method directamente
    console.log('\n📋 Test 2: jsonHasAnyKeys directo');
    const qb2 = new PostgreSQLExtended();
    qb2.select('*').from('users');

    // En lugar de usar addWhereCondition, usar directamente where con array
    const condition = `data ?| ARRAY['key1', 'key2']`;
    qb2.where([condition], qb2);

    const jsonSQL = await qb2.toString();
    console.log('📄 JSON SQL:', jsonSQL);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
  }
}

testWherePatterns();