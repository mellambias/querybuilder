import PostgreSQLExtended from "./postgresql-extended.js";

console.log('Testing jsonContains method...');

async function test() {
  try {
    const qb = new PostgreSQLExtended();
    console.log('PostgreSQLExtended created');

    // Verificar que el método existe
    console.log('Has jsonContains:', typeof qb.jsonContains);
    console.log('Has where:', typeof qb.where);

    // Probar el método paso a paso
    console.log('\n1. Creating base query...');
    const step1 = qb.select(['*']);
    console.log('After select, type:', typeof step1);

    console.log('\n2. Adding from...');
    const step2 = step1.from('products');
    console.log('After from, type:', typeof step2);

    console.log('\n3. Calling jsonContains...');
    const step3 = step2.jsonContains('metadata', { brand: 'Apple' });
    console.log('After jsonContains, type:', typeof step3);
    console.log('Step3 === qb:', step3 === qb);

    console.log('\n4. Calling toString...');
    const result = await step3.toString();
    console.log('Final result:', result);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();