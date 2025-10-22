/**
 * JSON Operations Tests - PostgreSQL
 * Tests específicos para operaciones JSON/JSONB en PostgreSQL
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL - JSON Operations", async () => {
  let qb;

  beforeEach(async () => {
    qb = new PostgreSQLExtended();
  });

  test("SELECT con operador JSON ->", async () => {
    const result = await qb.select(["data->>'name' as name"])
      .from("users")
      .toString();
    assert.ok(result.includes("data->>'name'"));
  });

  test("WHERE con jsonContains", async () => {
    const result = await qb.select()
      .from("products")
      .jsonContains("metadata", { brand: "Apple" })
      .toString();
    assert.ok(result.includes("metadata @>"));
    assert.ok(result.includes('{"brand":"Apple"}'));
  });

  test("WHERE con jsonExists", { only: false }, async () => {
    const result = sql.select()
      .from("products")
      .jsonExists("metadata->specs->cpu")
      .toString();
    assert.ok(result.includes("metadata->specs->cpu IS NOT NULL"));
  });

  test("WHERE con jsonHasKey", { only: false }, async () => {
    const result = sql.select()
      .from("users")
      .jsonHasKey("preferences", "theme")
      .toString();
    assert.ok(result.includes("preferences ? 'theme'"));
  });

  test("WHERE con jsonHasAnyKey", { only: false }, async () => {
    const result = sql.select()
      .from("users")
      .jsonHasAnyKey("preferences", ["theme", "language"])
      .toString();
    assert.ok(result.includes("preferences ?|"));
    assert.ok(result.includes("array['theme','language']"));
  });

  test("WHERE con jsonHasAllKeys", { only: false }, async () => {
    const result = sql.select()
      .from("users")
      .jsonHasAllKeys("preferences", ["theme", "language"])
      .toString();
    assert.ok(result.includes("preferences ?&"));
    assert.ok(result.includes("array['theme','language']"));
  });

  test("UPDATE con jsonSet", { only: false }, async () => {
    const result = sql.update("users")
      .jsonSet("preferences", "$.theme", "dark")
      .where("id", 1)
      .toString();
    assert.ok(result.includes("jsonb_set"));
    assert.ok(result.includes("'{theme}'"));
    assert.ok(result.includes('"dark"'));
  });

  test("SELECT con funciones JSON de agregación", { only: false }, async () => {
    const result = sql.select([
      "json_agg(name) as names",
      "jsonb_object_agg(id, name) as id_name_map"
    ])
      .from("users")
      .toString();
    assert.ok(result.includes("json_agg(name)"));
    assert.ok(result.includes("jsonb_object_agg(id, name)"));
  });

  test("INSERT con datos JSON", { only: false }, async () => {
    const jsonData = {
      name: "John Doe",
      preferences: { theme: "dark", language: "en" },
      tags: ["user", "premium"]
    };

    const result = sql.insertInto("users", {
      data: JSON.stringify(jsonData)
    }).toString();
    assert.ok(result.includes("INSERT INTO users"));
    assert.ok(result.includes('"theme":"dark"'));
  });

  test("Operaciones con paths JSON complejos", { only: false }, async () => {
    const result = sql.select([
      "data#>'{user,preferences,theme}' as theme",
      "data#>>'{user,contact,email}' as email"
    ])
      .from("app_data")
      .toString();
    assert.ok(result.includes("#>'{user,preferences,theme}'"));
    assert.ok(result.includes("#>>'{user,contact,email}'"));
  });

  test("Índices en columnas JSON", { only: false }, async () => {
    const result = sql.createIndex("users", "data", {
      using: "gin",
      expression: "(data jsonb_path_ops)"
    });
    assert.ok(result.includes("CREATE INDEX"));
    assert.ok(result.includes("USING gin"));
    assert.ok(result.includes("jsonb_path_ops"));
  });
});
