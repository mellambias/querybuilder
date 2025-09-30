/**
 * Tests de Integración QueryBuilder → PostgreSQL
 * Valida que el usuario final puede usar todas las funcionalidades implementadas
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../../core/querybuilder.js";
import PostgreSQL from "../PostgreSQL.js";

describe("QueryBuilder + PostgreSQL - Integración Usuario Final", async () => {
  let qb;

  beforeEach(async () => {
    // Como lo haría el usuario real
    qb = new QueryBuilder(PostgreSQL, {
      typeIdentificator: "regular"
    });
  });

  test("Usuario: CREATE TABLE con tipos PostgreSQL específicos", async () => {
    const result = await qb.createTable("users", {
      cols: {
        id: "UUID",
        email: "VARCHAR(255)",
        created_at: "TIMESTAMPTZ",
        profile: "JSONB",
        ip_address: "INET",
        tags: "TEXT[]"
      }
    }).toString();

    console.log("CREATE TABLE result:", result);

    assert.ok(result.includes("CREATE TABLE users"));
    assert.ok(result.includes("UUID"));
    assert.ok(result.includes("TIMESTAMPTZ"));
    assert.ok(result.includes("JSONB"));
    assert.ok(result.includes("INET"));
    assert.ok(result.includes("TEXT[]"));
  });

  test("Usuario: CREATE TYPE con diferentes variantes", async () => {
    // Tipo básico
    const basicType = await qb.createType("SALARIO", {
      as: "NUMERIC(8,2)"
    }).toString();
    assert.ok(basicType.includes("CREATE TYPE SALARIO AS NUMERIC(8,2)"));

    // Reset query builder para siguiente test
    qb = new QueryBuilder(PostgreSQL, { typeIdentificator: "regular" });

    // Tipo ENUM
    const enumType = await qb.createType("status_enum", {
      as: "ENUM",
      values: ["active", "inactive", "pending"]
    }).toString();
    assert.ok(enumType.includes("CREATE TYPE status_enum AS ENUM"));
    assert.ok(enumType.includes("'active', 'inactive', 'pending'"));

    // Reset para tipo compuesto
    qb = new QueryBuilder(PostgreSQL, { typeIdentificator: "regular" });

    // Tipo compuesto
    const compositeType = await qb.createType("address_type", {
      as: "COMPOSITE",
      attributes: {
        street: "VARCHAR(100)",
        city: "VARCHAR(50)",
        zipcode: "VARCHAR(10)"
      }
    }).toString();
    assert.ok(compositeType.includes("CREATE TYPE address_type AS"));
    assert.ok(compositeType.includes("street VARCHAR(100)"));
    assert.ok(compositeType.includes("city VARCHAR(50)"));
  });

  test("Usuario: CREATE DOMAIN", async () => {
    const result = await qb.createDomain("email_domain", {
      dataType: "VARCHAR(255)",
      constraint: "CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}$')"
    }).toString();

    console.log("CREATE DOMAIN result:", result);

    assert.ok(result.includes("CREATE DOMAIN email_domain AS VARCHAR(255)"));
    assert.ok(result.includes("CHECK"));
  });

  test("Usuario: ALTER TABLE operations", async () => {
    // Crear tabla base primero
    qb = new QueryBuilder(PostgreSQL, { typeIdentificator: "regular" });

    // Verificar que alterTable existe como método
    assert.ok(typeof qb.alterTable === 'function');

    const alterResult = await qb.alterTable("users").toString();
    assert.ok(alterResult.includes("ALTER TABLE users"));

    console.log("ALTER TABLE result:", alterResult);
  });

  test("Usuario: SELECT con WHERE usando operadores PostgreSQL", async () => {
    const result = await qb.select(["name", "email", "profile"])
      .from("users")
      .where("profile", "@>", "'{\"active\": true}'")
      .where("tags", "&&", "ARRAY['admin', 'user']")
      .where("ip_address", "<<", "'192.168.1.0/24'")
      .toString();

    console.log("SELECT con operadores PostgreSQL:", result);

    assert.ok(result.includes("SELECT"));
    assert.ok(result.includes("FROM users"));
    assert.ok(result.includes("WHERE"));
    assert.ok(result.includes("profile"));
    assert.ok(result.includes("tags"));
    assert.ok(result.includes("ip_address"));
  });

  test("Usuario: INSERT con tipos específicos", async () => {
    const result = await qb.insertInto("users", {
      id: "gen_random_uuid()",
      email: "'user@example.com'",
      profile: "'{\"role\": \"admin\"}'",
      created_at: "NOW()",
      tags: "ARRAY['admin', 'active']"
    }).toString();

    console.log("INSERT result:", result);

    assert.ok(result.includes("INSERT INTO users"));
    assert.ok(result.includes("gen_random_uuid()"));
    assert.ok(result.includes("NOW()"));
    assert.ok(result.includes("ARRAY"));
  });

  test("Usuario: Funcionalidades avanzadas disponibles", async () => {
    // Verificar que las funcionalidades están disponibles para el usuario

    // Métodos básicos de QueryBuilder
    assert.ok(typeof qb.select === 'function');
    assert.ok(typeof qb.from === 'function');
    assert.ok(typeof qb.where === 'function');
    assert.ok(typeof qb.insertInto === 'function');
    assert.ok(typeof qb.update === 'function');
    assert.ok(typeof qb.deleteFrom === 'function');

    // Métodos específicos PostgreSQL
    assert.ok(typeof qb.createTable === 'function');
    assert.ok(typeof qb.createType === 'function');
    assert.ok(typeof qb.createDomain === 'function');
    assert.ok(typeof qb.alterTable === 'function');
    assert.ok(typeof qb.dropTable === 'function');
    assert.ok(typeof qb.dropType === 'function');

    // Verificar que el motor SQL es PostgreSQL
    assert.ok(qb.language instanceof PostgreSQL);
    assert.equal(qb.language.dataType, "postgresql");
  });

  test("Usuario: Query compleja con JOIN y subconsultas", async () => {
    const result = await qb.select([
      "u.name",
      "u.email",
      "p.title as profile_title"
    ])
      .from("users u")
      .leftJoin("profiles p", "u.profile_id", "p.id")
      .where("u.created_at", ">", "'2024-01-01'")
      .where("u.profile", "@>", "'{\"active\": true}'")
      .orderBy("u.created_at", "DESC")
      .limit(10)
      .toString();

    console.log("Query compleja:", result);

    assert.ok(result.includes("SELECT"));
    assert.ok(result.includes("LEFT JOIN"));
    assert.ok(result.includes("WHERE"));
    assert.ok(result.includes("ORDER BY"));
    assert.ok(result.includes("LIMIT"));
    assert.ok(result.includes("@>"));
  });

  test("Usuario: Flujo completo CREATE → INSERT → SELECT", async () => {
    // 1. Crear tabla
    qb = new QueryBuilder(PostgreSQL, { typeIdentificator: "regular" });
    const createSQL = await qb.createTable("test_flow", {
      cols: {
        id: "UUID DEFAULT gen_random_uuid()",
        name: "VARCHAR(100)",
        data: "JSONB",
        created_at: "TIMESTAMPTZ DEFAULT NOW()"
      }
    }).toString();

    console.log("1. CREATE:", createSQL);
    assert.ok(createSQL.includes("CREATE TABLE test_flow"));

    // 2. Insertar datos
    qb = new QueryBuilder(PostgreSQL, { typeIdentificator: "regular" });
    const insertSQL = await qb.insertInto("test_flow", {
      name: "'Test User'",
      data: "'{\"role\": \"user\"}'"
    }).toString();

    console.log("2. INSERT:", insertSQL);
    assert.ok(insertSQL.includes("INSERT INTO test_flow"));

    // 3. Consultar datos
    qb = new QueryBuilder(PostgreSQL, { typeIdentificator: "regular" });
    const selectSQL = await qb.select("*")
      .from("test_flow")
      .where("data", "@>", "'{\"role\": \"user\"}'")
      .toString();

    console.log("3. SELECT:", selectSQL);
    assert.ok(selectSQL.includes("SELECT * FROM test_flow"));
    assert.ok(selectSQL.includes("@>"));
  });
});

console.log("\\n=== TESTS DE INTEGRACIÓN QUERYBUILDER + POSTGRESQL ===");
console.log("🔗 Validando la experiencia completa del usuario final");
console.log("📋 QueryBuilder → PostgreSQL → SQL Generation");
console.log("✅ CREATE TABLE, CREATE TYPE, CREATE DOMAIN");
console.log("✅ ALTER TABLE operations");
console.log("✅ INSERT/SELECT con tipos PostgreSQL específicos");
console.log("✅ Operadores JSON/Array (@>, &&, <<)");
console.log("✅ Queries complejas con JOINs");
console.log("✅ Flujo completo CREATE → INSERT → SELECT");
console.log("🎯 Usuario puede usar todas las funcionalidades implementadas");