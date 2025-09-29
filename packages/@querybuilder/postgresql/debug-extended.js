import { PostgreSQLExtended } from './postgresql-extended.js';

console.log('Testing PostgreSQLExtended directly...');
try {
  const sql = new PostgreSQLExtended();
  console.log('PostgreSQLExtended created successfully');

  // Ver si tiene el método jsonContains
  console.log('Has jsonContains method:', typeof sql.jsonContains);

  // Probar el método
  const result = sql.select().from("products").jsonContains("metadata", { brand: "Apple" });
  console.log('jsonContains result type:', typeof result);
  console.log('jsonContains result:', result);

} catch (error) {
  console.error('PostgreSQLExtended error:', error.message);
}