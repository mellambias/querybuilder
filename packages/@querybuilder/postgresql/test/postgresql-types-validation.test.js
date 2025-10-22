/**
 * Test específico para validar tipos PostgreSQL
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQL from "../PostgreSQL.js";

describe("PostgreSQL - Tipos Específicos Validación", async () => {
  let sql;

  beforeEach(async () => {
    sql = new PostgreSQL();
  });

  test("Tipos PostgreSQL básicos", async () => {
    const columns = {
      id: "UUID",
      created_at: "TIMESTAMPTZ",
      ip_address: "INET",
      mac_address: "MACADDR",
      network: "CIDR",
      data: "JSONB"
    };

    const result = sql.createTable("postgres_types", { cols: columns });
    console.log("Result:", result);

    assert.ok(result.includes("UUID"));
    assert.ok(result.includes("TIMESTAMPTZ"));
    assert.ok(result.includes("INET"));
    assert.ok(result.includes("MACADDR"));
    assert.ok(result.includes("CIDR"));
    assert.ok(result.includes("JSONB"));
  });

  test("Arrays de tipos específicos", async () => {
    const columns = {
      id: "SERIAL",
      uuids: "UUID[]",
      timestamps: "TIMESTAMPTZ[]",
      ip_addresses: "INET[]"
    };

    const result = sql.createTable("array_types", { cols: columns });
    console.log("Array Result:", result);

    assert.ok(result.includes("UUID[]"));
    assert.ok(result.includes("TIMESTAMPTZ[]"));
    assert.ok(result.includes("INET[]"));
  });

  test("Tipos con defaults usando formato objeto", async () => {
    const columns = {
      id: { type: "UUID", default: "gen_random_uuid()" },
      created_at: { type: "TIMESTAMPTZ", default: "NOW()" },
      ip_address: "INET"
    };

    const result = sql.createTable("with_defaults", { cols: columns });
    console.log("Defaults Result:", result);

    assert.ok(result.includes("UUID"));
    assert.ok(result.includes("TIMESTAMPTZ"));
    assert.ok(result.includes("DEFAULT"));
  });
});
