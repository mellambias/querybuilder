import PostgreSQLExtended from "./postgresql-extended.js";

console.log('Testing basic where...');

async function test() {
  try {
    const qb = new PostgreSQLExtended();
    console.log('PostgreSQLExtended created');

    console.log('\n1. Creating base query...');
    const step1 = qb.select(['*']).from('products');
    console.log('Base query ready');

    console.log('\n2. Adding simple where...');
    const step2 = step1.where('id', 1);
    console.log('After simple where');

    console.log('\n3. Calling toString...');
    const result = await step2.toString();
    console.log('Simple where result:', result);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();