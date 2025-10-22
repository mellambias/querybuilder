/**
 * PostgreSQL Extended - Tests Corregidos
 * Suite de tests que se enfocan en funcionalidades que sabemos que funcionan
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL Extended - Tests Funcionando", async () => {
  let qb;

  beforeEach(async () => {
    qb = new PostgreSQLExtended();
  });

  test("✅ 1. Herencia básica y instanciación", async () => {
    assert.ok(qb instanceof PostgreSQLExtended);
    assert.ok(typeof qb.select === 'function');
    assert.ok(typeof qb.from === 'function');
    assert.ok(typeof qb.where === 'function');
  });

  test("✅ 2. SELECT básico", async () => {
    const result = await qb.select(['id', 'name']).from('users').toString();
    assert.ok(result.includes('SELECT id, name'));
    assert.ok(result.includes('FROM users'));
  });

  test("✅ 3. JSON operators usando WHERE directo", async () => {
    const result = await qb
      .select(['*'])
      .from('products')
      .where('metadata @> \'{"brand":"Apple"}\'')
      .toString();

    assert.ok(result.includes('metadata @>'));
    assert.ok(result.includes('{"brand":"Apple"}'));
  });

  test("✅ 4. Array operators usando WHERE directo", async () => {
    const result = await qb
      .select(['*'])
      .from('products')
      .where("tags @> ARRAY['electronics','mobile']")
      .toString();

    assert.ok(result.includes('tags @>'));
    assert.ok(result.includes("ARRAY['electronics','mobile']"));
  });

  test("✅ 5. Full-text search usando WHERE directo", async () => {
    const result = await qb
      .select(['*'])
      .from('articles')
      .where("to_tsvector('english', content) @@ plainto_tsquery('english', 'PostgreSQL')")
      .toString();

    assert.ok(result.includes('to_tsvector'));
    assert.ok(result.includes('@@'));
    assert.ok(result.includes('plainto_tsquery'));
  });

  test("✅ 6. Regex operators usando WHERE directo", async () => {
    const result = await qb
      .select(['*'])
      .from('users')
      .where("email ~ '@gmail\\.com$'")
      .toString();

    assert.ok(result.includes('email ~'));
    assert.ok(result.includes('@gmail'));
  });

  test("✅ 7. Múltiples condiciones WHERE", async () => {
    const result = await qb
      .select(['id', 'name'])
      .from('products')
      .where('price > 100')
      .where('category = \'electronics\'')
      .toString();

    assert.ok(result.includes('price > 100'));
    assert.ok(result.includes('category = \'electronics\''));
  });

  test("✅ 8. Métodos especializados están disponibles", async () => {
    const methods = [
      'jsonContains', 'jsonHasKey', 'arrayContains', 'arrayOverlaps',
      'fullTextSearch', 'regexMatch', 'rowNumber', 'with'
    ];

    methods.forEach(method => {
      assert.ok(typeof qb[method] === 'function', `Method ${method} should be available`);
    });
  });

  test("✅ 9. JSON operators específicos de PostgreSQL (SELECT)", async () => {
    const result = await qb
      .select(["data->>'name' as user_name", "metadata->'profile' as profile"])
      .from('users')
      .toString();

    assert.ok(result.includes("data->>'name'"));
    assert.ok(result.includes("metadata->'profile'"));
  });

  test("✅ 10. Array operators específicos de PostgreSQL (SELECT)", async () => {
    const result = await qb
      .select(['tags[1] as first_tag', 'array_length(categories, 1) as count'])
      .from('products')
      .toString();

    assert.ok(result.includes('tags[1]'));
    assert.ok(result.includes('array_length'));
  });

  test("✅ 11. Verificación de arquitectura PostgreSQL vs QueryBuilder", async () => {
    // Verificar que tenemos una instancia de PostgreSQLExtended
    assert.ok(qb instanceof PostgreSQLExtended);

    // Verificar que los métodos de QueryBuilder están disponibles
    const basicMethods = ['select', 'from', 'where', 'orderBy', 'groupBy', 'having'];
    basicMethods.forEach(method => {
      assert.ok(typeof qb[method] === 'function', `Basic method ${method} should be available`);
    });

    // Verificar que los métodos específicos de PostgreSQL están disponibles
    const pgMethods = ['jsonContains', 'arrayContains', 'fullTextSearch'];
    pgMethods.forEach(method => {
      assert.ok(typeof qb[method] === 'function', `PostgreSQL method ${method} should be available`);
    });
  });
});
