/**
 * Array Operations Tests - PostgreSQL
 * Tests específicos para operaciones con arrays en PostgreSQL
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQL from "../PostgreSQL.js";

describe("PostgreSQL - Array Operations", async () => {
  let sql;

  beforeEach(async () => {
    sql = new PostgreSQL();
  });

  test("WHERE con arrayContains (operador @>)", async () => {
    const result = sql.select()
      .from("products")
      .where(sql.raw("tags @> array['electronics','mobile']"))
      .toString();
    assert.ok(result.includes("tags @>"));
    assert.ok(result.includes("array['electronics','mobile']"));
  });

  test("WHERE con arrayContainedBy (operador <@)", async () => {
    const result = sql.select()
      .from("products")
      .where(sql.raw("tags <@ array['electronics','mobile','accessories']"))
      .toString();
    assert.ok(result.includes("tags <@"));
    assert.ok(result.includes("array['electronics','mobile','accessories']"));
  });

  test("WHERE con arrayOverlap (operador &&)", async () => {
    const result = sql.select()
      .from("products")
      .where(sql.raw("tags && array['electronics','software']"))
      .toString();
    assert.ok(result.includes("tags &&"));
    assert.ok(result.includes("array['electronics','software']"));
  });

  test("SELECT con array_length", async () => {
    const result = sql.select([
      "name",
      "array_length(tags, 1) as tag_count"
    ])
      .from("products")
      .toString();
    assert.ok(result.includes("array_length(tags, 1)"));
  });

  test("SELECT con array_agg", async () => {
    const result = sql.select([
      "category",
      "array_agg(name) as product_names"
    ])
      .from("products")
      .groupBy("category")
      .toString();
    assert.ok(result.includes("array_agg(name)"));
  });

  test("SELECT con unnest para expandir arrays", async () => {
    const result = sql.select([
      "id",
      "unnest(tags) as tag"
    ])
      .from("products")
      .toString();
    assert.ok(result.includes("unnest(tags)"));
  });

  test("UPDATE agregando elementos a array", async () => {
    const result = sql.update("products")
      .set("tags", sql.raw("array_append(tags, 'new_tag')"))
      .where("id", 1)
      .toString();
    assert.ok(result.includes("array_append(tags, 'new_tag')"));
  });

  test("UPDATE removiendo elementos de array", async () => {
    const result = sql.update("products")
      .set("tags", sql.raw("array_remove(tags, 'old_tag')"))
      .where("id", 1)
      .toString();
    assert.ok(result.includes("array_remove(tags, 'old_tag')"));
  });

  test("SELECT con acceso a elemento específico del array", async () => {
    const result = sql.select([
      "name",
      "tags[1] as first_tag",
      "tags[array_length(tags, 1)] as last_tag"
    ])
      .from("products")
      .toString();
    assert.ok(result.includes("tags[1]"));
    assert.ok(result.includes("tags[array_length(tags, 1)]"));
  });

  test("SELECT con slice de array", async () => {
    const result = sql.select([
      "name",
      "tags[1:3] as first_three_tags"
    ])
      .from("products")
      .toString();
    assert.ok(result.includes("tags[1:3]"));
  });

  test("WHERE con ANY para buscar en array", async () => {
    const result = sql.select()
      .from("products")
      .where(sql.raw("'electronics' = ANY(tags)"))
      .toString();
    assert.ok(result.includes("'electronics' = ANY(tags)"));
  });

  test("WHERE con ALL para comparar con todos los elementos", async () => {
    const result = sql.select()
      .from("products")
      .where(sql.raw("price > ALL(competitor_prices)"))
      .toString();
    assert.ok(result.includes("price > ALL(competitor_prices)"));
  });

  test("INSERT con arrays", async () => {
    const result = qb.insertInto("products", {
      name: "Smartphone",
      tags: ["electronics", "mobile", "communication"],
      prices: [299.99, 399.99, 499.99]
    }).toString();
    assert.ok(result.includes("array['electronics','mobile','communication']"));
    assert.ok(result.includes("array[299.99,399.99,499.99]"));
  });

  test("Multidimensional arrays", async () => {
    const result = sql.createTable("matrix_data", {
      columns: {
        id: "SERIAL",
        matrix: "INTEGER[][]",
        cube: "INTEGER[][][]"
      }
    });
    assert.ok(result.includes("INTEGER[][]"));
    assert.ok(result.includes("INTEGER[][][]"));
  });
});