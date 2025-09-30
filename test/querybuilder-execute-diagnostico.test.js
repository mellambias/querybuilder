import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../src/querybuilder.js";
import MySQL from "../src/sql/MySQL.js";
import { config } from "../packages/@querybuilder/core/config.js";

// Setup siguiendo exactamente el patrón de los tests existentes
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);

// QueryBuilder instance siguiendo el patrón estándar del proyecto
const queryBuilder = new QueryBuilder(MySQL, {
  typeIdentificator: "regular",
  mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Diagnóstico QueryBuilder.execute() - Análisis de Respuestas", { concurrency: false }, async () => {

  beforeEach(async () => {
    qb = queryBuilder.driver(MySql8.driver, MySql8.params);
  });

  afterEach(async () => {
    qb.dropQuery();
  });

  test("Diagnóstico: ¿Qué retorna QueryBuilder.execute()?", async () => {
    console.log("\n🔍 DIAGNÓSTICO COMPLETO DE QUERYBUILDER.EXECUTE()");
    console.log("=".repeat(60));

    // Test 1: CREATE DATABASE
    console.log("\n1. CREATE DATABASE");
    const createDBResult = await qb
      .dropDatabase("test_diagnostico", { secure: true })
      .createDatabase("test_diagnostico")
      .execute();
    qb.dropQuery();

    console.log("   createDBResult:", createDBResult);
    console.log("   type:", typeof createDBResult);
    console.log("   constructor:", createDBResult?.constructor?.name);
    if (createDBResult && typeof createDBResult === 'object') {
      console.log("   keys:", Object.keys(createDBResult));
      console.log("   .success:", createDBResult.success);
      console.log("   .response:", createDBResult.response);
      console.log("   .error:", createDBResult.error);
    }

    // Cambiar a la base de datos
    qb = qb.use("test_diagnostico");

    // Test 2: CREATE TABLE
    console.log("\n2. CREATE TABLE");
    const createTableResult = await qb
      .createTable("test_tabla", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        nombre: "VARCHAR(100)"
      })
      .execute();
    qb.dropQuery();

    console.log("   createTableResult:", createTableResult);
    console.log("   type:", typeof createTableResult);
    console.log("   constructor:", createTableResult?.constructor?.name);
    if (createTableResult && typeof createTableResult === 'object') {
      console.log("   keys:", Object.keys(createTableResult));
      console.log("   .success:", createTableResult.success);
      console.log("   .response:", createTableResult.response);
      console.log("   .error:", createTableResult.error);
    }

    // Test 3: INSERT
    console.log("\n3. INSERT");
    const insertResult = await qb
      .insert("test_tabla", [1, "Test User"])
      .execute();
    qb.dropQuery();

    console.log("   insertResult:", insertResult);
    console.log("   type:", typeof insertResult);
    console.log("   constructor:", insertResult?.constructor?.name);
    if (insertResult && typeof insertResult === 'object') {
      console.log("   keys:", Object.keys(insertResult));
      console.log("   .success:", insertResult.success);
      console.log("   .response:", insertResult.response);
      console.log("   .error:", insertResult.error);
    }

    // Test 4: SELECT
    console.log("\n4. SELECT");
    const selectResult = await qb
      .select("*")
      .from("test_tabla")
      .execute();
    qb.dropQuery();

    console.log("   selectResult:", selectResult);
    console.log("   type:", typeof selectResult);
    console.log("   constructor:", selectResult?.constructor?.name);
    if (selectResult && typeof selectResult === 'object') {
      console.log("   keys:", Object.keys(selectResult));
      console.log("   .success:", selectResult.success);
      console.log("   .response:", selectResult.response);
      console.log("   .error:", selectResult.error);
    }

    // Test 5: UPDATE  
    console.log("\n5. UPDATE");
    const updateResult = await qb
      .update("test_tabla", { nombre: "Updated User" })
      .where("id = 1")
      .execute();
    qb.dropQuery();

    console.log("   updateResult:", updateResult);
    console.log("   type:", typeof updateResult);
    console.log("   constructor:", updateResult?.constructor?.name);
    if (updateResult && typeof updateResult === 'object') {
      console.log("   keys:", Object.keys(updateResult));
      console.log("   .success:", updateResult.success);
      console.log("   .response:", updateResult.response);
      console.log("   .error:", updateResult.error);
    }

    // Investigar el driverDB directamente
    console.log("\n6. INVESTIGAR EL DRIVER DIRECTAMENTE");
    console.log("   qb.driverDB:", qb.driverDB);
    console.log("   qb.driverDB?.constructor?.name:", qb.driverDB?.constructor?.name);

    if (qb.driverDB) {
      const directResult = await qb.driverDB.execute("SELECT COUNT(*) as total FROM test_tabla");
      console.log("   directResult:", directResult);
      console.log("   directResult.success:", directResult.success);
      console.log("   directResult.response:", directResult.response);
    }

    // Limpieza
    await qb.dropDatabase("test_diagnostico", { secure: true }).execute();
    qb.dropQuery();

    console.log("\n🎯 DIAGNÓSTICO COMPLETADO");
    console.log("=".repeat(60));

    // Aserción básica para que el test pase
    assert.ok(true, "Diagnóstico completado");
  });
});

console.log("🔍 Test de diagnóstico de QueryBuilder.execute() completado");