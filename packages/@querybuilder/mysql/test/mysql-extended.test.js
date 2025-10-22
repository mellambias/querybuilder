/**
 * Test de MySQLExtended - Características avanzadas de MySQL
 * Prueba todas las funcionalidades específicas de MySQL
 */

import MySQLExtended from '../mysql-extended.js';

console.log('=== TESTING MYSQL EXTENDED FEATURES ===\n');

// Crear instancia de MySQLExtended
const mysql = new MySQLExtended();

// ===========================================
// 1. TESTING JSON FUNCTIONS
// ===========================================
console.log('1. TESTING JSON FUNCTIONS:');

// JSON Extract
const jsonExtractQuery = await mysql
  .select(['id', 'name'])
  .jsonExtract('profile', '$.age')
  .from('users')
  .toString();
console.log('JSON Extract:', jsonExtractQuery);

mysql.reset();

// JSON Unquote
const jsonUnquoteQuery = await mysql
  .select(['id', 'name'])
  .jsonUnquote('profile', '$.city')
  .from('users')
  .toString();
console.log('JSON Unquote:', jsonUnquoteQuery);

mysql.reset();

// JSON Contains
const jsonContainsQuery = await mysql
  .select('*')
  .from('users')
  .jsonContains('profile', 'developer', '$.skills')
  .toString();
console.log('JSON Contains:', jsonContainsQuery);

mysql.reset();

// JSON Object
const jsonObjectExample = mysql.jsonObject({
  name: 'user.name',
  age: 'user.age',
  active: 'user.active'
});
console.log('JSON Object:', jsonObjectExample);

// JSON Array
const jsonArrayExample = mysql.jsonArray(['tag1', 'tag2', 'tag3']);
console.log('JSON Array:', jsonArrayExample);

// ===========================================
// 2. TESTING WINDOW FUNCTIONS
// ===========================================
console.log('\n2. TESTING WINDOW FUNCTIONS:');

// ROW_NUMBER
const rowNumberQuery = await mysql
  .select(['id', 'name', 'department', 'salary'])
  .rowNumber({
    partitionBy: 'department',
    orderBy: 'salary DESC'
  })
  .from('employees')
  .toString();
console.log('ROW_NUMBER:', rowNumberQuery);

mysql.reset();

// RANK
const rankQuery = await mysql
  .select(['id', 'name', 'salary'])
  .rank({
    orderBy: 'salary DESC'
  })
  .from('employees')
  .toString();
console.log('RANK:', rankQuery);

mysql.reset();

// ===========================================
// 3. TESTING UPSERT
// ===========================================
console.log('\n3. TESTING UPSERT:');

const upsertQuery = await mysql
  .upsert('users',
    {
      email: 'john@example.com',
      name: 'John Doe',
      age: 30
    },
    {
      name: 'John Doe Updated',
      age: 31,
      updated_at: 'NOW()'
    }
  )
  .toString();
console.log('UPSERT:', upsertQuery);

mysql.reset();

// ===========================================
// 4. TESTING FULL-TEXT SEARCH
// ===========================================
console.log('\n4. TESTING FULL-TEXT SEARCH:');

const fullTextQuery = await mysql
  .select(['id', 'title', 'content'])
  .from('articles')
  .fullTextSearch(['title', 'content'], 'mysql database tutorial')
  .toString();
console.log('Full-Text Search:', fullTextQuery);

mysql.reset();

// ===========================================
// 5. TESTING OPTIMIZATION HINTS
// ===========================================
console.log('\n5. TESTING OPTIMIZATION HINTS:');

const hintQuery = await mysql
  .select(['id', 'name', 'email'])
  .from('users')
  .useIndex('idx_email')
  .where('email', 'LIKE', '%@gmail.com')
  .toString();
console.log('USE INDEX Hint:', hintQuery);

mysql.reset();

console.log('\n=== MYSQL EXTENDED BASIC TESTS COMPLETED ===');

export default {
  jsonExtractQuery,
  jsonUnquoteQuery,
  jsonContainsQuery,
  jsonObjectExample,
  jsonArrayExample,
  rowNumberQuery,
  rankQuery,
  upsertQuery,
  fullTextQuery,
  hintQuery
};
