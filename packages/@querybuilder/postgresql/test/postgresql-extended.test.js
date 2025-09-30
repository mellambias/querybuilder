/**
 * Tests de PostgreSQLExtended - Versión Funcional
 * Tests que manejan correctamente el toString() async
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL Extended - Functional Tests", async () => {
  let qb;

  beforeEach(async () => {
    qb = new PostgreSQLExtended();
  });

  test("Basic SELECT with JSON operator", async () => {
    const result = await qb.select(["data->>'name' as name"])
      .from("users")
      .toString();

    console.log('Basic SELECT result:', result);
    assert.ok(result.includes("data->>'name'"));
    assert.ok(result.includes("FROM users"));
  });

  test("JSON contains with fluent API", async () => {
    // Crear nueva instancia para evitar interferencia
    const query = new PostgreSQLExtended();

    const result = await query
      .select(['*'])
      .from('products')
      .jsonContains('metadata', { brand: 'Apple' })
      .toString();

    console.log('JSON Contains result:', result);

    // Verificar que contiene los elementos esperados
    assert.ok(result.includes('SELECT *'));
    assert.ok(result.includes('FROM products'));
    assert.ok(result.includes('metadata @>'));
    assert.ok(result.includes('{"brand":"Apple"}'));
  });

  test("Array contains with fluent API", async () => {
    // Crear nueva instancia para evitar interferencia
    const query = new PostgreSQLExtended();

    const result = await query
      .select(['id', 'name'])
      .from('products')
      .arrayContains('tags', ['electronics', 'mobile'])
      .toString();

    console.log('Array Contains result:', result);

    // Verificar que contiene los elementos esperados
    assert.ok(result.includes('SELECT id, name'));
    assert.ok(result.includes('FROM products'));
    assert.ok(result.includes('tags @>'));
    assert.ok(result.includes("ARRAY['electronics','mobile']"));
  });

  test("JSON has key with fluent API", async () => {
    // Crear nueva instancia para evitar interferencia
    const query = new PostgreSQLExtended();

    const result = await query
      .select(['*'])
      .from('users')
      .jsonHasKey('profile', 'email')
      .toString();

    console.log('JSON Has Key result:', result);

    // Verificar que contiene los elementos esperados
    assert.ok(result.includes('SELECT *'));
    assert.ok(result.includes('FROM users'));
    assert.ok(result.includes('profile ?'));
    assert.ok(result.includes("'email'"));
  });

  test("Multiple specialized methods chaining", async () => {
    // Crear nueva instancia para evitar interferencia
    const query = new PostgreSQLExtended();

    const result = await query
      .select(['id', 'name', 'metadata'])
      .from('products')
      .jsonContains('metadata', { category: 'electronics' })
      .arrayContains('tags', ['popular'])
      .toString();

    console.log('Multiple chaining result:', result);

    // Verificar que contiene los elementos esperados
    assert.ok(result.includes('SELECT id, name, metadata'));
    assert.ok(result.includes('FROM products'));
    assert.ok(result.includes('metadata @>'));
    assert.ok(result.includes('tags @>'));
  });
});