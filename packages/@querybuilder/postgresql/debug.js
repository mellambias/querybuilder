import PostgreSQL from './PostgreSQL.js';

console.log('Testing toDataType directly:');
try {
  const result2 = "SERIAL".toDataType("postgresql");
  console.log('SERIAL -> postgresql:', result2);
} catch (error) {
  console.error('SERIAL error:', error.message);
}