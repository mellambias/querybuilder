/**
 * Database Operations Tests - Pos    test('Eliminar base de datos con FORCE', () => {greSQL
 * Tests específicos para operaciones de base de datos en PostgreSQL
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQL from "../PostgreSQL.js";

describe("PostgreSQL - Database Operations", async () => {
  let sql;

  beforeEach(async () => {
    sql = new PostgreSQL();
  });

  test("Crear una base de datos", async () => {
    const result = sql.createDatabase("testing");
    assert.equal(result, "CREATE DATABASE testing");
  });

  test("Crear base de datos con opciones", async () => {
    const result = sql.createDatabase("testing", {
      encoding: "UTF8",
      owner: "postgres"
    });
    assert.equal(result, "CREATE DATABASE testing WITH ENCODING 'UTF8' OWNER postgres");
  });

  test("Eliminar una base de datos", async () => {
    const result = sql.dropDatabase("testing");
    assert.equal(result, "DROP DATABASE testing");
  });

  test('Eliminar base de datos con IF EXISTS', () => {
    const result = sql.dropDatabase("testing", { exist: true });
    assert.equal(result, "DROP DATABASE IF EXISTS testing");
  });

  test("Eliminar base de datos con FORCE", async () => {
    const result = sql.dropDatabase("testing", { force: true });
    assert.equal(result, "DROP DATABASE testing WITH (FORCE)");
  });

  test("Falla cuando se crea una base de datos con nombre reservado", async () => {
    try {
      sql.createDatabase("DAY");
    } catch (error) {
      assert.equal(error.message, "DAY no es un identificador valido");
    }
  });

  test("Crear esquema", async () => {
    const result = sql.createSchema("test_schema");
    assert.equal(result, "CREATE SCHEMA test_schema");
  });

  test("Eliminar esquema", async () => {
    const result = sql.dropSchema("test_schema", { cascade: true });
    assert.equal(result, "DROP SCHEMA test_schema CASCADE");
  });
});