/**
 * Advanced Features Tests - PostgreSQL
 * Tests para características avanzadas: CTEs, Window Functions, UPSERT
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL - Advanced Features", async () => {
  let sql;

  beforeEach(async () => {
    sql = new PostgreSQLExtended();
  });

  // Common Table Expressions (CTEs)
  test("CTE básico con WITH", { only: false }, async () => {
    const cteQuery = sql.select(["department", sql.avg("salary").as("avg_salary")])
      .from("employees")
      .groupBy("department");

    const result = sql.with("dept_avg", cteQuery)
      .select()
      .from("dept_avg")
      .toString();

    assert.ok(result.includes("WITH dept_avg AS"));
    assert.ok(result.includes("SELECT department"));
    assert.ok(result.includes("FROM dept_avg"));
  });

  test("CTE recursivo", { only: false }, async () => {
    const baseCase = sql.select(["id", "name", "manager_id", sql.raw("1 as level")])
      .from("employees")
      .whereNull("manager_id");

    const recursiveCase = sql.select(["e.id", "e.name", "e.manager_id", "oc.level + 1"])
      .from("employees e")
      .join("org_chart oc", "e.manager_id", "oc.id");

    const result = sql.withRecursive("org_chart", [baseCase, recursiveCase])
      .select()
      .from("org_chart")
      .toString();

    assert.ok(result.includes("WITH RECURSIVE org_chart AS"));
    assert.ok(result.includes("UNION"));
  });

  test("Múltiples CTEs", { only: false }, async () => {
    const cte1 = sql.select().from("table1");
    const cte2 = sql.select().from("table2");

    const result = sql.with("cte1", cte1)
      .with("cte2", cte2)
      .select()
      .from("cte1")
      .join("cte2", "cte1.id", "cte2.id")
      .toString();

    assert.ok(result.includes("WITH cte1 AS"));
    assert.ok(result.includes(", cte2 AS"));
  });

  // Window Functions
  test("ROW_NUMBER() con OVER", { only: false }, async () => {
    const result = sql.select([
      "name",
      "salary",
      sql.rowNumber().over().partitionBy("department").orderBy("salary", "desc").as("rank")
    ])
      .from("employees")
      .toString();

    assert.ok(result.includes("ROW_NUMBER() OVER"));
    assert.ok(result.includes("PARTITION BY department"));
    assert.ok(result.includes("ORDER BY salary DESC"));
  });

  test("RANK() y DENSE_RANK()", { only: false }, async () => {
    const result = sql.select([
      "name",
      "salary",
      sql.rank().over().orderBy("salary", "desc").as("rank"),
      sql.denseRank().over().orderBy("salary", "desc").as("dense_rank")
    ])
      .from("employees")
      .toString();

    assert.ok(result.includes("RANK() OVER"));
    assert.ok(result.includes("DENSE_RANK() OVER"));
  });

  test("LAG() y LEAD()", { only: false }, async () => {
    const result = sql.select([
      "name",
      "salary",
      sql.lag("salary").over().orderBy("hire_date").as("prev_salary"),
      sql.lead("salary").over().orderBy("hire_date").as("next_salary")
    ])
      .from("employees")
      .toString();

    assert.ok(result.includes("LAG(salary) OVER"));
    assert.ok(result.includes("LEAD(salary) OVER"));
  });

  test("Window frame con ROWS", { only: false }, async () => {
    const result = sql.select([
      "name",
      "salary",
      sql.sum("salary")
        .over()
        .orderBy("hire_date")
        .rows("UNBOUNDED PRECEDING", "CURRENT ROW")
        .as("running_total")
    ])
      .from("employees")
      .toString();

    assert.ok(result.includes("SUM(salary) OVER"));
    assert.ok(result.includes("ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW"));
  });

  // UPSERT (INSERT ... ON CONFLICT)
  test("UPSERT básico con ON CONFLICT DO UPDATE", { only: false }, async () => {
    const result = sql.insertInto("users", {
      email: "user@example.com",
      name: "John Doe"
    })
      .onConflict("email")
      .doUpdate({
        name: "excluded.name",
        updated_at: "NOW()"
      })
      .toString();

    assert.ok(result.includes("INSERT INTO users"));
    assert.ok(result.includes("ON CONFLICT (email)"));
    assert.ok(result.includes("DO UPDATE SET"));
    assert.ok(result.includes("name = excluded.name"));
  });

  test("UPSERT con ON CONFLICT DO NOTHING", { only: false }, async () => {
    const result = sql.insertInto("users", {
      email: "user@example.com",
      name: "John Doe"
    })
      .onConflict("email")
      .doNothing()
      .toString();

    assert.ok(result.includes("ON CONFLICT (email)"));
    assert.ok(result.includes("DO NOTHING"));
  });

  test("UPSERT con constraint específico", { only: false }, async () => {
    const result = sql.insertInto("users", {
      email: "user@example.com",
      name: "John Doe"
    })
      .onConflictOnConstraint("users_email_key")
      .doUpdate({
        name: "excluded.name"
      })
      .toString();

    assert.ok(result.includes("ON CONFLICT ON CONSTRAINT users_email_key"));
  });

  test("UPSERT con WHERE en UPDATE", { only: false }, async () => {
    const result = sql.insertInto("users", {
      email: "user@example.com",
      name: "John Doe",
      version: 1
    })
      .onConflict("email")
      .doUpdate({
        name: "excluded.name",
        version: "users.version + 1"
      })
      .where("users.version < excluded.version")
      .toString();

    assert.ok(result.includes("WHERE users.version < excluded.version"));
  });

  // Full-text Search
  test("Full-text search con to_tsvector", { only: false }, async () => {
    const result = sql.select()
      .from("articles")
      .fullTextSearch("title", "javascript postgresql", "english")
      .toString();

    assert.ok(result.includes("to_tsvector('english', title)"));
    assert.ok(result.includes("plainto_tsquery('english', 'javascript postgresql')"));
  });

  test("Full-text search con ranking", { only: false }, async () => {
    const result = sql.select([
      "*",
      sql.raw("ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as rank")
    ])
      .from("articles")
      .where(sql.raw("to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)"))
      .orderBy("rank", "desc")
      .toString();

    assert.ok(result.includes("ts_rank"));
    assert.ok(result.includes("@@"));
  });
});