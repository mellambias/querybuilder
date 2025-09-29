/**
 * Ejemplo básico de uso de MySQL QueryBuilder
 * Demuestra operaciones CRUD fundamentales
 */

import MySQL from '../MySQL.js';

// Configuración de conexión
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'test_db'
};

// Crear instancia de MySQL QueryBuilder
const mysql = new MySQL(config);

// Ejemplo 1: CREATE TABLE
console.log('=== CREATE TABLE ===');
const createTableQuery = mysql
  .createTable('users')
  .addColumn('id', 'INT', { primaryKey: true, autoIncrement: true })
  .addColumn('name', 'VARCHAR(255)', { notNull: true })
  .addColumn('email', 'VARCHAR(255)', { unique: true })
  .addColumn('age', 'INT')
  .addColumn('profile', 'JSON')
  .addColumn('created_at', 'TIMESTAMP', { default: 'CURRENT_TIMESTAMP' })
  .toString();

console.log(createTableQuery);

// Ejemplo 2: INSERT
console.log('\n=== INSERT ===');
const insertQuery = mysql
  .insert('users')
  .values({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    profile: JSON.stringify({ city: 'New York', active: true })
  })
  .toString();

console.log(insertQuery);

// Ejemplo 3: SELECT básico
console.log('\n=== SELECT básico ===');
const selectQuery = mysql
  .select(['id', 'name', 'email', 'age'])
  .from('users')
  .where('age', '>', 18)
  .orderBy('created_at', 'DESC')
  .limit(10)
  .toString();

console.log(selectQuery);

// Ejemplo 4: UPDATE
console.log('\n=== UPDATE ===');
const updateQuery = mysql
  .update('users')
  .set({
    name: 'Jane Doe',
    age: 31
  })
  .where('id', '=', 1)
  .toString();

console.log(updateQuery);

// Ejemplo 5: DELETE
console.log('\n=== DELETE ===');
const deleteQuery = mysql
  .delete()
  .from('users')
  .where('age', '<', 18)
  .toString();

console.log(deleteQuery);

export default {
  createTableQuery,
  insertQuery,
  selectQuery,
  updateQuery,
  deleteQuery
};