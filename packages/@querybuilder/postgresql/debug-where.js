import PostgreSQLExtended from "./postgresql-extended.js";

console.log('Testing where method directly...');

async function test() {
  try {
    const qb = new PostgreSQLExtended();
    console.log('PostgreSQLExtended created');

    console.log('\n1. Creating base query...');
    const step1 = qb.select(['*']).from('products');
    console.log('Base query ready');

    console.log('\n2. Calling where directly...');
    const step2 = step1.where('metadata', '@>', `'{"brand":"Apple"}'`);
    console.log('After where, type:', typeof step2);
    console.log('Step2 === qb:', step2 === qb);

    console.log('\n3. Calling toString...');
    const result = await step2.toString();
    console.log('Where direct result:', result);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();