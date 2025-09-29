/**
 * Data Types Tests - PostgreSQL
 * Tests específicos para tipos de datos personalizados en PostgreSQL
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQL from "../PostgreSQL.js";

describe("PostgreSQL - Data Types", async () => {
  let sql;
  
  beforeEach(async () => {
    sql = new PostgreSQL();
  });

  test("Crear tipo como SQL básico", { only: false }, async () => {
    const result = sql.createType("SALARIO", { as: "NUMERIC(8,2)" });
    assert.equal(result, "CREATE TYPE SALARIO AS NUMERIC(8,2)");
  });

  test("Crear tipo ENUM", { only: false }, async () => {
    const result = sql.createType("SALARIO", { as: "ENUM" });
    assert.equal(result, "CREATE TYPE SALARIO AS ENUM");
  });

  test("Crear tipo ENUM con valores", { only: false }, async () => {
    const result = sql.createType("status_type", { 
      as: "ENUM", 
      values: ["active", "inactive", "pending"] 
    });
    assert.equal(result, "CREATE TYPE status_type AS ENUM ('active', 'inactive', 'pending')");
  });

  test("Crear tipo compuesto", { only: false }, async () => {
    const result = sql.createType("address_type", { 
      as: "COMPOSITE",
      attributes: {
        street: "VARCHAR(100)",
        city: "VARCHAR(50)",
        zipcode: "VARCHAR(10)"
      }
    });
    assert.ok(result.includes("CREATE TYPE address_type AS"));
    assert.ok(result.includes("street VARCHAR(100)"));
    assert.ok(result.includes("city VARCHAR(50)"));
  });

  test("Crear dominio", { only: false }, async () => {
    const result = sql.createDomain("email_domain", {
      dataType: "VARCHAR(255)",
      constraint: "CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')"
    });
    assert.ok(result.includes("CREATE DOMAIN email_domain AS VARCHAR(255)"));
    assert.ok(result.includes("CHECK"));
  });

  test("Eliminar tipo", { only: false }, async () => {
    const result = sql.dropType("SALARIO");
    assert.equal(result, "DROP TYPE SALARIO");
  });

  test("Eliminar tipo con CASCADE", { only: false }, async () => {
    const result = sql.dropType("SALARIO", { cascade: true });
    assert.equal(result, "DROP TYPE SALARIO CASCADE");
  });

  test("Tipos PostgreSQL específicos", { only: false }, async () => {
    const columns = {
      id: "UUID DEFAULT gen_random_uuid()",
      created_at: "TIMESTAMPTZ DEFAULT NOW()",
      ip_address: "INET",
      mac_address: "MACADDR",
      network: "CIDR",
      price_range: "NUMRANGE",
      date_range: "DATERANGE"
    };
    
    const result = sql.createTable("postgres_types", { columns });
    assert.ok(result.includes("UUID"));
    assert.ok(result.includes("TIMESTAMPTZ"));
    assert.ok(result.includes("INET"));
    assert.ok(result.includes("MACADDR"));
    assert.ok(result.includes("NUMRANGE"));
  });

  test("Arrays de tipos específicos", { only: false }, async () => {
    const columns = {
      id: "SERIAL",
      uuids: "UUID[]",
      timestamps: "TIMESTAMPTZ[]",
      ip_addresses: "INET[]"
    };
    
    const result = sql.createTable("array_types", { columns });
    assert.ok(result.includes("UUID[]"));
    assert.ok(result.includes("TIMESTAMPTZ[]"));
    assert.ok(result.includes("INET[]"));
  });
});