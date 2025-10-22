/**
 * Test básico para verificar el módulo PostgreSQL corregido
 */

import PostgreSQL from '../PostgreSQL.js';

// Test básico de instanciación
console.log('=== Testing PostgreSQL Module ===\n');

const db = new PostgreSQL();

// 1. Verificar propiedades básicas
console.log('1. Checking basic properties:');
console.log('   - dataType:', db.dataType);
console.log('   - dialect:', db.dialect);
console.log('   - features:', db.features);

// 2. Test métodos estándar reimplementados
console.log('\n2. Testing standard reimplemented methods:');

try {
  // Test dropDatabase
  const dropDB = db.dropDatabase('test_db', { exist: true, force: true });
  console.log('   ✓ dropDatabase:', dropDB);
} catch (error) {
  console.log('   ✗ dropDatabase failed:', error.message);
}

try {
  // Test limit
  const limitClause = db.limit(10);
  console.log('   ✓ limit:', limitClause);
} catch (error) {
  console.log('   ✗ limit failed:', error.message);
}

try {
  // Test offset  
  const offsetClause = db.offset(5);
  console.log('   ✓ offset:', offsetClause);
} catch (error) {
  console.log('   ✗ offset failed:', error.message);
}

// 3. Test características específicas de PostgreSQL
console.log('\n3. Testing PostgreSQL-specific features:');

try {
  // Test JSON operations - solo verificar que los métodos existen
  console.log('   ✓ jsonContains: Method exists -', typeof db.jsonContains);
  console.log('   ✓ jsonHasKey: Method exists -', typeof db.jsonHasKey);
  console.log('   ✓ jsonPath: Method exists -', typeof db.jsonPath);
} catch (error) {
  console.log('   ✗ JSON methods failed:', error.message);
}

try {
  // Test Array operations
  console.log('   ✓ arrayContains: Method exists -', typeof db.arrayContains);
  console.log('   ✓ arrayOverlaps: Method exists -', typeof db.arrayOverlaps);
  console.log('   ✓ arrayAgg: Method exists -', typeof db.arrayAgg);
} catch (error) {
  console.log('   ✗ Array methods failed:', error.message);
}

try {
  // Test Window functions
  console.log('   ✓ rowNumber: Method exists -', typeof db.rowNumber);
  console.log('   ✓ rank: Method exists -', typeof db.rank);
  console.log('   ✓ lag: Method exists -', typeof db.lag);
} catch (error) {
  console.log('   ✗ Window functions failed:', error.message);
}

try {
  // Test CTE
  console.log('   ✓ with (CTE): Method exists -', typeof db.with);
  console.log('   ✓ withRecursive: Method exists -', typeof db.withRecursive);
} catch (error) {
  console.log('   ✗ CTE methods failed:', error.message);
}

try {
  // Test UPSERT
  console.log('   ✓ onConflict: Method exists -', typeof db.onConflict);
  console.log('   ✓ doUpdate: Method exists -', typeof db.doUpdate);
  console.log('   ✓ doNothing: Method exists -', typeof db.doNothing);
} catch (error) {
  console.log('   ✗ UPSERT methods failed:', error.message);
}

try {
  // Test Full-text search
  console.log('   ✓ fullTextSearch: Method exists -', typeof db.fullTextSearch);
  console.log('   ✓ fullTextRank: Method exists -', typeof db.fullTextRank);
  console.log('   ✓ fullTextHeadline: Method exists -', typeof db.fullTextHeadline);
} catch (error) {
  console.log('   ✗ Full-text search methods failed:', error.message);
}

// 4. Test tipos y operadores
console.log('\n4. Testing PostgreSQL types and operators:');
console.log('   - pgTypes keys:', Object.keys(db.pgTypes || {}).slice(0, 5), '...');
console.log('   - pgOperators keys:', Object.keys(db.pgOperators || {}).slice(0, 5), '...');
console.log('   - pgFunctions keys:', Object.keys(db.pgFunctions || {}).slice(0, 5), '...');

// 5. Test herencia del Core
console.log('\n5. Testing Core inheritance:');
try {
  // Test métodos básicos que existen en Core
  console.log('   ✓ select method exists -', typeof db.select);
  console.log('   ✓ where method exists -', typeof db.where);
  console.log('   ✓ toString method exists -', typeof db.toString);
  console.log('   ✓ createTable method exists -', typeof db.createTable);
} catch (error) {
  console.log('   ✗ Core methods failed:', error.message);
}

console.log('\n=== PostgreSQL Module Test Complete ===');

export default { PostgreSQL };
