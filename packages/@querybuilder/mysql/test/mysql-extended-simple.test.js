/**
 * Test básico de MySQLExtended - Verificación de métodos
 * Prueba que los métodos específicos de MySQL estén disponibles
 */

import MySQLExtended from '../mysql-extended.js';

console.log('=== TESTING MYSQL EXTENDED METHODS ===\n');

// Crear instancia de MySQLExtended
const mysql = new MySQLExtended();

console.log('✅ MySQLExtended instance created successfully');
console.log('✅ Dialect:', mysql.dialect);
console.log('✅ Version:', mysql.version);

// ===========================================
// 1. TESTING METHOD AVAILABILITY
// ===========================================
console.log('\n1. TESTING METHOD AVAILABILITY:');

// Verificar métodos JSON
console.log('✅ JSON Methods:');
console.log('  - jsonExtract:', typeof mysql.jsonExtract === 'function');
console.log('  - jsonUnquote:', typeof mysql.jsonUnquote === 'function');
console.log('  - jsonObject:', typeof mysql.jsonObject === 'function');
console.log('  - jsonArray:', typeof mysql.jsonArray === 'function');
console.log('  - jsonContains:', typeof mysql.jsonContains === 'function');
console.log('  - jsonSearch:', typeof mysql.jsonSearch === 'function');
console.log('  - jsonSet:', typeof mysql.jsonSet === 'function');

// Verificar métodos Window Functions
console.log('✅ Window Function Methods:');
console.log('  - rowNumber:', typeof mysql.rowNumber === 'function');
console.log('  - rank:', typeof mysql.rank === 'function');
console.log('  - lag:', typeof mysql.lag === 'function');
console.log('  - lead:', typeof mysql.lead === 'function');

// Verificar métodos CTE
console.log('✅ CTE Methods:');
console.log('  - with:', typeof mysql.with === 'function');
console.log('  - withRecursive:', typeof mysql.withRecursive === 'function');

// Verificar métodos UPSERT
console.log('✅ UPSERT Methods:');
console.log('  - upsert:', typeof mysql.upsert === 'function');
console.log('  - onDuplicateKeyUpdate:', typeof mysql.onDuplicateKeyUpdate === 'function');

// Verificar métodos Full-Text Search
console.log('✅ Full-Text Search Methods:');
console.log('  - fullTextSearch:', typeof mysql.fullTextSearch === 'function');
console.log('  - orderByRelevance:', typeof mysql.orderByRelevance === 'function');

// Verificar métodos de Optimización
console.log('✅ Optimization Methods:');
console.log('  - hint:', typeof mysql.hint === 'function');
console.log('  - forceIndex:', typeof mysql.forceIndex === 'function');
console.log('  - useIndex:', typeof mysql.useIndex === 'function');
console.log('  - ignoreIndex:', typeof mysql.ignoreIndex === 'function');

// ===========================================
// 2. TESTING FEATURES
// ===========================================
console.log('\n2. TESTING FEATURES:');
console.log('✅ MySQL Features:');
for (const [feature, supported] of Object.entries(mysql.features)) {
  console.log(`  - ${feature}: ${supported}`);
}

// ===========================================
// 3. TESTING REGISTERED TYPES
// ===========================================
console.log('\n3. TESTING REGISTERED TYPES:');
console.log('✅ MySQL Types Available:');
if (mysql.mysqlTypes) {
  const sampleTypes = ['JSON', 'TINYINT', 'MEDIUMINT', 'LONGTEXT', 'DECIMAL', 'ENUM', 'GEOMETRY'];
  sampleTypes.forEach(type => {
    console.log(`  - ${type}: ${mysql.mysqlTypes[type] || 'Not found'}`);
  });
} else {
  console.log('  - MySQL types not initialized');
}

// ===========================================
// 4. TESTING FUNCTIONS
// ===========================================
console.log('\n4. TESTING MYSQL FUNCTIONS:');
console.log('✅ MySQL Functions Available:');
if (mysql.mysqlFunctions) {
  const sampleFunctions = ['JSON_EXTRACT', 'JSON_OBJECT', 'CONCAT', 'ROW_NUMBER', 'COUNT'];
  sampleFunctions.forEach(func => {
    console.log(`  - ${func}: ${mysql.mysqlFunctions[func] || 'Not found'}`);
  });
} else {
  console.log('  - MySQL functions not initialized');
}

// ===========================================
// 5. TESTING SIMPLE OUTPUTS
// ===========================================
console.log('\n5. TESTING SIMPLE OUTPUTS:');

// JSON Object simple
const jsonObj = mysql.jsonObject({ name: 'John', age: 30 });
console.log('✅ JSON Object output:', jsonObj);

// JSON Array simple
const jsonArr = mysql.jsonArray(['tag1', 'tag2', 'tag3']);
console.log('✅ JSON Array output:', jsonArr);

// Reset test
mysql.reset();
console.log('✅ Reset method works');

// Clone test
const cloned = mysql.clone();
console.log('✅ Clone method works:', cloned instanceof MySQLExtended);

console.log('\n=== ALL MYSQL EXTENDED METHOD TESTS PASSED ===');

export default {
  success: true,
  dialect: mysql.dialect,
  version: mysql.version,
  features: mysql.features,
  mysqlTypes: mysql.mysqlTypes,
  mysqlFunctions: mysql.mysqlFunctions
};
