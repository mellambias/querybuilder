import PostgreSQL from './PostgreSQL.js';
import QueryBuilder from '../core/querybuilder.js';

console.log('Testing with QueryBuilder...');
try {
  const qb = new QueryBuilder(PostgreSQL);
  console.log('QueryBuilder created successfully');

  const result = qb.select(["data->>'name' as name"]).from("users").toString();
  console.log('QueryBuilder select works:', result);
} catch (error) {
  console.error('QueryBuilder error:', error.message);
}

console.log('\nTesting direct PostgreSQL...');
const sql = new PostgreSQL();
console.log('PostgreSQL created successfully');

console.log('Testing basic select...');
try {
  const result1 = sql.select();
  console.log('Basic select type:', typeof result1);
  console.log('Basic select result:', result1);
} catch (error) {
  console.error('Basic select error:', error.message);
}