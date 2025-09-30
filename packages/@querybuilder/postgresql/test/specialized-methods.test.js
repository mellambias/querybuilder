/**
 * Test de métodos especializados de PostgreSQLExtended (sin toString)
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL Extended Specialized Methods", async () => {
  let qb;

  beforeEach(async () => {
    qb = new PostgreSQLExtended();
  });

  test("jsonContains method with fluent API", async () => {
    // Construir la query usando el método jsonContains
    const result = qb.select(['*']).from('products').jsonContains('data', { name: 'test' });

    // Verificar que retorna la instancia para encadenamiento
    assert.ok(result === qb);

    // Verificar que el método existe y es callable
    assert.ok(typeof qb.jsonContains === 'function');
  });

  test("arrayContains method with fluent API", async () => {
    // Construir la query usando el método arrayContains
    const result = qb.select(['*']).from('products').arrayContains('tags', ['electronics', 'mobile']);

    // Verificar que retorna la instancia para encadenamiento
    assert.ok(result === qb);

    // Verificar que el método existe y es callable
    assert.ok(typeof qb.arrayContains === 'function');
  });

  test("jsonHasKey method with fluent API", async () => {
    // Construir la query usando el método jsonHasKey
    const result = qb.select(['*']).from('products').jsonHasKey('data', 'name');

    // Verificar que retorna la instancia para encadenamiento
    assert.ok(result === qb);

    // Verificar que el método existe y es callable
    assert.ok(typeof qb.jsonHasKey === 'function');
  });

  test("Chaining multiple specialized methods", async () => {
    // Encadenar múltiples métodos especializados
    const result = qb
      .select(['id', 'name'])
      .from('products')
      .jsonContains('metadata', { category: 'electronics' })
      .arrayContains('tags', ['popular']);

    // Verificar que el encadenamiento funciona
    assert.ok(result === qb);
  });
});