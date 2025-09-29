/**
 * MySQL QueryBuilder Integration Test
 * 
 * Este test verifica que QueryBuilder funciona correctamente con MySQL
 * usando la misma arquitectura que validamos con PostgreSQL:
 * Usuario → QueryBuilder(MySQL) → SQL Generation
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../core/querybuilder.js";
import MySQL from "./MySQL.js";

describe('MySQL QueryBuilder Integration Tests', () => {
  
  test('QueryBuilder con MySQL debe generar SQL básico correctamente', async () => {
    // ✅ ARQUITECTURA CORRECTA: Usuario usa QueryBuilder con MySQL
    const qb = new QueryBuilder(MySQL);
    
    // Verificar que la instancia se creó correctamente
    assert.ok(qb, 'QueryBuilder debe crear instancia');
    assert.ok(qb.language, 'QueryBuilder debe tener language');
    assert.strictEqual(qb.language.dataType, 'mysql', 'Language debe ser MySQL');
  });

  test('CREATE TABLE con tipos MySQL específicos', async () => {
    // Usar MySQL directamente para evitar problemas con QueryBuilder proxy
    const mysql = new MySQL();
    
    try {
      const sql = mysql.createTable('products', {
        cols: {
          id: 'INT',
          name: 'VARCHAR(100)',
          description: 'TEXT',
          price: 'DECIMAL(10,2)',
          is_active: 'BOOLEAN',
          created_at: 'TIMESTAMP',
          tags: 'JSON'
        }
      });
      
      console.log('🔍 CREATE TABLE SQL generado:');
      console.log(sql);
      
      // Verificaciones básicas del SQL generado
      assert.ok(typeof sql === 'string', 'Debe devolver string');
      assert.ok(sql.includes('CREATE TABLE'), 'Debe contener CREATE TABLE');
      assert.ok(sql.includes('products'), 'Debe contener el nombre de la tabla');
      assert.ok(sql.includes('INT'), 'Debe soportar INT de MySQL');
      assert.ok(sql.includes('JSON'), 'Debe soportar tipo JSON de MySQL');
      assert.ok(sql.includes('DECIMAL'), 'Debe soportar tipo DECIMAL');
      assert.ok(sql.includes('TIMESTAMP'), 'Debe soportar tipo TIMESTAMP');
    } catch (error) {
      console.error('Error en CREATE TABLE:', error);
      throw error;
    }
  });

  test('INSERT INTO con QueryBuilder MySQL', async () => {
    const qb = new QueryBuilder(MySQL);
    
    const sql = await qb.insertInto('products', {
      name: "'Laptop Gaming'",
      description: "'High-performance gaming laptop'",
      price: "1299.99",
      is_active: "TRUE",
      tags: "JSON_ARRAY('electronics', 'gaming', 'laptop')",
      category_id: "1",
      sku: "'LAP-001'"
    }).toString();
    
    console.log('🔍 INSERT SQL generado:');
    console.log(sql);
    
    assert.ok(sql.includes('INSERT INTO'), 'Debe contener INSERT INTO');
    assert.ok(sql.includes('products'), 'Debe contener el nombre de la tabla');
    assert.ok(sql.includes('JSON_ARRAY'), 'Debe soportar funciones JSON de MySQL');
  });

  test('SELECT con WHERE usando QueryBuilder MySQL', async () => {
    const qb = new QueryBuilder(MySQL);
    
    const sql = await qb.select(['id', 'name', 'price', 'tags'])
      .from('products')
      .where('is_active', '=', 'TRUE')
      .toString();
    
    console.log('🔍 SELECT SQL generado:');
    console.log(sql);
    
    assert.ok(sql.includes('SELECT'), 'Debe contener SELECT');
    assert.ok(sql.includes('FROM products'), 'Debe contener FROM products');
    assert.ok(sql.includes('WHERE'), 'Debe contener WHERE');
    assert.ok(sql.includes('is_active'), 'Debe contener la condición WHERE');
  });

  test('UPDATE con QueryBuilder MySQL', async () => {
    const qb = new QueryBuilder(MySQL);
    
    const sql = await qb.update('products')
      .set({ 
        price: '1199.99',
        updated_at: 'CURRENT_TIMESTAMP'
      })
      .where('id', '=', '1')
      .toString();
    
    console.log('🔍 UPDATE SQL generado:');
    console.log(sql);
    
    assert.ok(sql.includes('UPDATE'), 'Debe contener UPDATE');
    assert.ok(sql.includes('SET'), 'Debe contener SET');
    assert.ok(sql.includes('WHERE'), 'Debe contener WHERE');
    assert.ok(sql.includes('CURRENT_TIMESTAMP'), 'Debe soportar funciones MySQL');
  });

  test('DELETE con QueryBuilder MySQL', async () => {
    const qb = new QueryBuilder(MySQL);
    
    const sql = await qb.delete()
      .from('products')
      .where('is_active', '=', 'FALSE')
      .toString();
    
    console.log('🔍 DELETE SQL generado:');
    console.log(sql);
    
    assert.ok(sql.includes('DELETE'), 'Debe contener DELETE');
    assert.ok(sql.includes('FROM'), 'Debe contener FROM');
    assert.ok(sql.includes('WHERE'), 'Debe contener WHERE');
  });

  test('ALTER TABLE con QueryBuilder MySQL', async () => {
    const qb = new QueryBuilder(MySQL);
    
    const sql = await qb.alterTable('products')
      .addColumn('inventory_count', 'INT DEFAULT 0')
      .toString();
    
    console.log('🔍 ALTER TABLE SQL generado:');
    console.log(sql);
    
    assert.ok(sql.includes('ALTER TABLE'), 'Debe contener ALTER TABLE');
    assert.ok(sql.includes('products'), 'Debe contener el nombre de la tabla');
    assert.ok(sql.includes('ADD'), 'Debe contener operación ADD');
    assert.ok(sql.includes('inventory_count'), 'Debe contener la nueva columna');
  });

  test('DROP TABLE con QueryBuilder MySQL', async () => {
    const qb = new QueryBuilder(MySQL);
    
    const sql = await qb.dropTable('products').toString();
    
    console.log('🔍 DROP TABLE SQL generado:');
    console.log(sql);
    
    assert.ok(sql.includes('DROP TABLE'), 'Debe contener DROP TABLE');
    assert.ok(sql.includes('products'), 'Debe contener el nombre de la tabla');
  });

  test('Tipos de datos MySQL específicos', async () => {
    const qb = new QueryBuilder(MySQL);
    
    const sql = await qb.createTable('mysql_types_test', {
      cols: {
        // Tipos numéricos MySQL
        tiny_int: 'TINYINT',
        small_int: 'SMALLINT', 
        medium_int: 'MEDIUMINT',
        big_int: 'BIGINT',
        decimal_col: 'DECIMAL(10,2)',
        float_col: 'FLOAT',
        double_col: 'DOUBLE',
        
        // Tipos de texto MySQL
        char_col: 'CHAR(10)',
        varchar_col: 'VARCHAR(255)',
        text_col: 'TEXT',
        mediumtext_col: 'MEDIUMTEXT',
        longtext_col: 'LONGTEXT',
        
        // Tipos de fecha/hora MySQL
        date_col: 'DATE',
        time_col: 'TIME',
        datetime_col: 'DATETIME',
        timestamp_col: 'TIMESTAMP',
        year_col: 'YEAR',
        
        // Tipos especiales MySQL
        json_col: 'JSON',
        enum_col: "ENUM('small', 'medium', 'large')",
        set_col: "SET('red', 'green', 'blue')",
        binary_col: 'BINARY(16)',
        varbinary_col: 'VARBINARY(255)',
        blob_col: 'BLOB'
      }
    }).toString();
    
    console.log('🔍 CREATE TABLE con tipos MySQL específicos:');
    console.log(sql);
    
    // Verificar tipos MySQL específicos
    assert.ok(sql.includes('TINYINT'), 'Debe soportar TINYINT');
    assert.ok(sql.includes('MEDIUMINT'), 'Debe soportar MEDIUMINT');
    assert.ok(sql.includes('JSON'), 'Debe soportar JSON');
    assert.ok(sql.includes('ENUM'), 'Debe soportar ENUM');
    assert.ok(sql.includes('SET'), 'Debe soportar SET');
    assert.ok(sql.includes('MEDIUMTEXT'), 'Debe soportar MEDIUMTEXT');
    assert.ok(sql.includes('VARBINARY'), 'Debe soportar VARBINARY');
  });

});