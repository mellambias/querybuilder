/**
 * Table Operations Tests - PostgreSQL
 * Tests específicos para operaciones de tabla en PostgreSQL
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQL from "../PostgreSQL.js";

describe("PostgreSQL - Table Operations", async () => {
  let sql;

  beforeEach(async () => {
    sql = new PostgreSQL();
  });

  test("Crear una tabla básica", async () => {
    const result = sql.createTable("table_test");
    assert.equal(result, "CREATE TABLE table_test");
  });

  test("Crear una tabla temporal global", async () => {
    const result = sql.createTable("table_test", {
      temporary: "global",
      onCommit: "delete"
    });
    assert.equal(
      result,
      "CREATE GLOBAL TEMPORARY TABLE table_test ON COMMIT DELETE ROWS"
    );
  });

  test("Crear una tabla temporal local", async () => {
    const result = sql.createTable("table_test", {
      temporary: "local",
      onCommit: "PRESERVE"
    });
    assert.equal(
      result,
      "CREATE LOCAL TEMPORARY TABLE table_test ON COMMIT PRESERVE ROWS"
    );
  });

  test("Crear una tabla con múltiples columnas", async () => {
    const columns = {
      ID_ARTISTA: "integer",
      NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
      FDN_ARTISTA: "DATE",
      POSTER_EN_EXISTENCIA: "BOOLEAN",
      INTERVALO: "INTERVAL YEAR(2)",
    };

    const result = sql.createTable("table_test", { cols: columns });
    assert.equal(
      result,
      "CREATE TABLE table_test\n( ID_ARTISTA INTEGER,\n NOMBRE_ARTISTA CHAR(60),\n FDN_ARTISTA DATE,\n POSTER_EN_EXISTENCIA BOOLEAN,\n INTERVALO INTERVAL YEAR(2) )"
    );
  });

  test("Crear tabla con columnas JSON/JSONB", async () => {
    const columns = {
      id: "SERIAL PRIMARY KEY",
      data: "JSONB",
      metadata: "JSON",
      created_at: "TIMESTAMP DEFAULT NOW()"
    };

    const result = sql.createTable("json_table", { cols: columns });
    assert.ok(result.includes("JSONB"));
    assert.ok(result.includes("JSON"));
  });

  test("Crear tabla con arrays", async () => {
    const columns = {
      id: "SERIAL",
      tags: "TEXT[]",
      numbers: "INTEGER[]",
      emails: "VARCHAR(255)[]"
    };

    const result = sql.createTable("array_table", { cols: columns });
    assert.ok(result.includes("TEXT[]"));
    assert.ok(result.includes("INTEGER[]"));
  });

  test("Eliminar tabla", async () => {
    const result = sql.dropTable("table_test");
    assert.equal(result, "DROP TABLE table_test");
  });

  test("Eliminar tabla con CASCADE", async () => {
    const result = sql.dropTable("table_test", { cascade: true });
    assert.equal(result, "DROP TABLE table_test CASCADE");
  });

  test("Falla al crear tabla con columna de nombre reservado", async () => {
    try {
      const columns = {
        DAY: "INTEGER",
        NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
      };
      sql.createTable("table_test", { cols: columns });
    } catch (error) {
      assert.equal(error.message, "createTable error DAY no es un identificador valido");
    }
  });

  test("Alterar tabla - agregar columna", { only: false }, async () => {
    const result = sql.alterTable("users")
      .addColumn("email", "VARCHAR(255)");
    assert.ok(result.includes("ALTER TABLE users"));
    assert.ok(result.includes("ADD COLUMN email VARCHAR(255)"));
  });

  test("Alterar tabla - eliminar columna", { only: false }, async () => {
    const result = sql.alterTable("users")
      .dropColumn("email");
    assert.ok(result.includes("ALTER TABLE users"));
    assert.ok(result.includes("DROP COLUMN email"));
  });
});
