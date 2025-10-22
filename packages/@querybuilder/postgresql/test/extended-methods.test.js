/**
 * Test simple para verificar que PostgreSQLExtended tenga los métodos especializados
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL Extended Methods", async () => {
  let qb;

  beforeEach(async () => {
    qb = new PostgreSQLExtended();
  });

  test("Verificar que jsonContains existe", async () => {
    assert.ok(typeof qb.jsonContains === 'function');
  });

  test("Verificar que arrayContains existe", async () => {
    assert.ok(typeof qb.arrayContains === 'function');
  });

  test("Verificar que hereda métodos de QueryBuilder", async () => {
    assert.ok(typeof qb.select === 'function');
    assert.ok(typeof qb.from === 'function');
    assert.ok(typeof qb.where === 'function');
  });

  test("Verificar el encadenamiento de métodos básicos", async () => {
    const result = qb.select(['*']).from('users');
    assert.ok(result === qb); // Debe retornar this para permitir encadenamiento
  });
});
