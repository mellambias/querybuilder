import PostgreSQLExtended from "./postgresql-extended.js";

console.log('Testing PostgreSQLExtended toString...');

async function test() {
  try {
    const qb = new PostgreSQLExtended();
    console.log('PostgreSQLExtended created successfully');

    console.log('Type of qb.select:', typeof qb.select);
    console.log('Type of qb.from:', typeof qb.from);

    const step1 = qb.select(['*']);
    console.log('After select - step1 type:', typeof step1);
    console.log('After select - step1 === qb:', step1 === qb);

    const step2 = step1.from('users');
    console.log('After from - step2 type:', typeof step2);
    console.log('After from - step2 === qb:', step2 === qb);

    console.log('About to call toString...');
    const result = await step2.toString();
    console.log('toString result:', result);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();