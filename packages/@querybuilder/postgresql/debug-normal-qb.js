import QueryBuilder from "../core/querybuilder.js";
import PostgreSQL from "./PostgreSQL.js";

console.log('Testing normal QueryBuilder with PostgreSQL...');

async function test() {
  try {
    const qb = new QueryBuilder(PostgreSQL);
    console.log('QueryBuilder created successfully');

    const step1 = qb.select(['*']);
    console.log('After select - step1 === qb:', step1 === qb);

    const step2 = step1.from('users');
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