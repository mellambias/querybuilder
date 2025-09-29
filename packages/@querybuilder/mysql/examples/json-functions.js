/**
 * Ejemplo avanzado de funciones JSON en MySQL
 * Demuestra el uso de funciones JSON nativas de MySQL
 */

import MySQL from '../MySQL.js';
import { JsonFunctions } from '../functions.js';

// Crear instancia de MySQL QueryBuilder
const mysql = new MySQL();

console.log('=== FUNCIONES JSON DE MYSQL ===\n');

// Ejemplo 1: Crear tabla con campos JSON
console.log('1. CREATE TABLE con JSON:');
const createJsonTable = mysql
  .createTable('products')
  .addColumn('id', 'INT', { primaryKey: true, autoIncrement: true })
  .addColumn('name', 'VARCHAR(255)')
  .addColumn('attributes', 'JSON')
  .addColumn('metadata', 'JSON')
  .toString();

console.log(createJsonTable);

// Ejemplo 2: INSERT con datos JSON
console.log('\n2. INSERT con JSON:');
const insertJsonData = mysql
  .insert('products')
  .values({
    name: 'Laptop Gaming',
    attributes: JSON.stringify({
      brand: 'ASUS',
      model: 'ROG Strix',
      specs: {
        cpu: 'Intel i7',
        ram: '16GB',
        storage: '1TB SSD'
      },
      price: 1299.99,
      tags: ['gaming', 'laptop', 'high-performance']
    }),
    metadata: JSON.stringify({
      category: 'Electronics',
      subcategory: 'Computers',
      created_by: 'admin',
      updated_at: new Date().toISOString()
    })
  })
  .toString();

console.log(insertJsonData);

// Ejemplo 3: JSON_EXTRACT - Extraer valores
console.log('\n3. JSON_EXTRACT - Extraer valores:');
const extractQuery = mysql
  .select([
    'id',
    'name',
    mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.brand']).as('brand'),
    mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.price']).as('price'),
    mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.specs.cpu']).as('cpu')
  ])
  .from('products')
  .toString();

console.log(extractQuery);

// Ejemplo 4: JSON_UNQUOTE - Extraer sin comillas
console.log('\n4. JSON_UNQUOTE - Extraer sin comillas:');
const unquoteQuery = mysql
  .select([
    'id',
    'name',
    mysql.func(JsonFunctions.JSON_UNQUOTE, [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.brand'])
    ]).as('brand_clean'),
    mysql.func(JsonFunctions.JSON_UNQUOTE, [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['metadata', '$.category'])
    ]).as('category')
  ])
  .from('products')
  .toString();

console.log(unquoteQuery);

// Ejemplo 5: JSON_KEYS - Obtener claves
console.log('\n5. JSON_KEYS - Obtener claves:');
const keysQuery = mysql
  .select([
    'id',
    'name',
    mysql.func(JsonFunctions.JSON_KEYS, ['attributes']).as('attribute_keys'),
    mysql.func(JsonFunctions.JSON_KEYS, ['attributes', '$.specs']).as('spec_keys')
  ])
  .from('products')
  .toString();

console.log(keysQuery);

// Ejemplo 6: JSON_LENGTH - Obtener longitud
console.log('\n6. JSON_LENGTH - Obtener longitud:');
const lengthQuery = mysql
  .select([
    'id',
    'name',
    mysql.func(JsonFunctions.JSON_LENGTH, ['attributes']).as('total_attributes'),
    mysql.func(JsonFunctions.JSON_LENGTH, ['attributes', '$.tags']).as('tag_count')
  ])
  .from('products')
  .toString();

console.log(lengthQuery);

// Ejemplo 7: JSON_CONTAINS - Verificar contenido
console.log('\n7. JSON_CONTAINS - Verificar contenido:');
const containsQuery = mysql
  .select(['id', 'name'])
  .from('products')
  .where(
    mysql.func(JsonFunctions.JSON_CONTAINS, [
      'attributes',
      '"gaming"',
      '$.tags'
    ]), '=', 1
  )
  .toString();

console.log(containsQuery);

// Ejemplo 8: JSON_SEARCH - Buscar valores
console.log('\n8. JSON_SEARCH - Buscar valores:');
const searchQuery = mysql
  .select([
    'id',
    'name',
    mysql.func(JsonFunctions.JSON_SEARCH, [
      'attributes',
      'one',
      'Intel%',
      null,
      '$.specs.*'
    ]).as('intel_path')
  ])
  .from('products')
  .toString();

console.log(searchQuery);

// Ejemplo 9: JSON_SET - Actualizar/agregar valores
console.log('\n9. JSON_SET - Actualizar valores:');
const updateJsonQuery = mysql
  .update('products')
  .set({
    attributes: mysql.func(JsonFunctions.JSON_SET, [
      'attributes',
      '$.specs.gpu',
      '"NVIDIA RTX 3070"',
      '$.updated_at',
      '"' + new Date().toISOString() + '"'
    ])
  })
  .where('id', '=', 1)
  .toString();

console.log(updateJsonQuery);

// Ejemplo 10: JSON_ARRAY_APPEND - Agregar a array
console.log('\n10. JSON_ARRAY_APPEND - Agregar a array:');
const appendArrayQuery = mysql
  .update('products')
  .set({
    attributes: mysql.func(JsonFunctions.JSON_ARRAY_APPEND, [
      'attributes',
      '$.tags',
      '"new-arrival"'
    ])
  })
  .where('id', '=', 1)
  .toString();

console.log(appendArrayQuery);

// Ejemplo 11: Consultas complejas con JSON
console.log('\n11. Consulta compleja con JSON:');
const complexJsonQuery = mysql
  .select([
    'id',
    'name',
    mysql.func(JsonFunctions.JSON_UNQUOTE, [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.brand'])
    ]).as('brand'),
    mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.price']).as('price'),
    mysql.func(JsonFunctions.JSON_LENGTH, ['attributes', '$.tags']).as('tag_count')
  ])
  .from('products')
  .where(
    mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.price']), '>', 1000
  )
  .where(
    mysql.func(JsonFunctions.JSON_CONTAINS, [
      'attributes',
      '"laptop"',
      '$.tags'
    ]), '=', 1
  )
  .orderBy(
    mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.price']),
    'ASC'
  )
  .toString();

console.log(complexJsonQuery);

// Ejemplo 12: Agregaciones con JSON
console.log('\n12. Agregaciones con JSON:');
const aggregateJsonQuery = mysql
  .select([
    mysql.func(JsonFunctions.JSON_UNQUOTE, [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['metadata', '$.category'])
    ]).as('category'),
    mysql.func('COUNT', ['*']).as('product_count'),
    mysql.func('AVG', [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.price'])
    ]).as('avg_price'),
    mysql.func('MIN', [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.price'])
    ]).as('min_price'),
    mysql.func('MAX', [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['attributes', '$.price'])
    ]).as('max_price')
  ])
  .from('products')
  .groupBy(
    mysql.func(JsonFunctions.JSON_UNQUOTE, [
      mysql.func(JsonFunctions.JSON_EXTRACT, ['metadata', '$.category'])
    ])
  )
  .toString();

console.log(aggregateJsonQuery);

export default {
  createJsonTable,
  insertJsonData,
  extractQuery,
  unquoteQuery,
  keysQuery,
  lengthQuery,
  containsQuery,
  searchQuery,
  updateJsonQuery,
  appendArrayQuery,
  complexJsonQuery,
  aggregateJsonQuery
};