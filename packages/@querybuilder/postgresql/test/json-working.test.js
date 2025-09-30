/**
 * Test simple para JSON operations funcionando
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL Extended - JSON Operations Working", async () => {
  let qb;

  beforeEach(async () => {
    qb = new PostgreSQLExtended();
  });

  test("Basic SELECT with JSON operator", async () => {
    const result = await qb.select(["data->>'name' as name"])
      .from("users")
      .toString();

    console.log('Result:', result);
    assert.ok(result.includes("data->>'name'"));
    assert.ok(result.includes("FROM users"));
  });

  test("JSON contains with fluent API", async () => {
    const query = qb.select(['*'])
      .from('products')
      .jsonContains('metadata', { brand: 'Apple' });

    // Verificar que tenemos el objeto correcto
    assert.ok(query === qb);
    assert.ok(typeof query.toString === 'function');

    const result = await query.toString();
    console.log('JSON Contains Result:', result);

    // Verificar que contiene los elementos esperados
    assert.ok(result.includes('SELECT *'));
    assert.ok(result.includes('FROM products'));
    assert.ok(result.includes('metadata'));
  });
});