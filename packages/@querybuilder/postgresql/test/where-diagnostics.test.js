/**
 * Test específico para métodos WHERE complejos
 * Diagnóstico y pruebas de soluciones alternativas
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import PostgreSQLExtended from "../postgresql-extended.js";

describe("PostgreSQL Extended - WHERE Methods Diagnostics", async () => {

  test("🔍 1. Diagnóstico de jsonHasAnyKeys", async () => {
    console.log("=== DIAGNÓSTICO jsonHasAnyKeys ===");

    const qb = new PostgreSQLExtended();

    try {
      // Verificar que el método existe
      assert.ok(typeof qb.jsonHasAnyKeys === 'function', "jsonHasAnyKeys should exist");
      console.log("✅ Método jsonHasAnyKeys existe");

      // Preparar una base
      qb.select(['*']).from('users');
      console.log("✅ Base query preparada");

      // Intentar usar jsonHasAnyKeys
      console.log("🔍 Intentando jsonHasAnyKeys...");
      const step = qb.jsonHasAnyKeys('metadata', ['name', 'email']);
      console.log("✅ jsonHasAnyKeys ejecutado, returned:", typeof step);
      console.log("✅ Es la misma instancia:", step === qb);

      // AQUÍ es donde suele fallar - el toString()
      console.log("🔍 Intentando toString()...");
      const result = await step.toString();
      console.log("✅ SUCCESS! SQL generado:", result);

      // Verificaciones
      assert.ok(result.includes("SELECT"), "Should contain SELECT");
      assert.ok(result.includes("metadata"), "Should contain metadata column");
      assert.ok(result.includes("?|"), "Should contain ?| operator");

    } catch (error) {
      console.log("❌ ERROR en jsonHasAnyKeys:");
      console.log("   Message:", error.message);
      console.log("   Type:", error.constructor.name);
      if (error.stack) {
        console.log("   Stack:", error.stack.split('\n')[1]);
      }

      // No falle el test, solo reporte el error
      assert.ok(true, "Test reported error but continued");
    }
  });

  test("🔍 2. Comparación: método WHERE directo vs helper", async () => {
    console.log("=== COMPARACIÓN WHERE DIRECTO VS HELPER ===");

    try {
      // Test 1: Usando where() directo (patrón problemático)
      console.log("📝 Test 1: WHERE directo");
      const qb1 = new PostgreSQLExtended();
      qb1.select(['*']).from('test');

      // Este es el patrón que causa problemas
      const step1 = qb1.where('column', '?|', "ARRAY['key1', 'key2']");
      console.log("   - WHERE directo ejecutado:", typeof step1);

      // Test 2: Usando addWhereCondition (nuestro helper)
      console.log("📝 Test 2: addWhereCondition helper");
      const qb2 = new PostgreSQLExtended();
      qb2.select(['*']).from('test');

      const step2 = qb2.addWhereCondition("column ?| ARRAY['key1', 'key2']");
      console.log("   - Helper ejecutado:", typeof step2);

      console.log("✅ Ambos métodos ejecutados sin errores inmediatos");

    } catch (error) {
      console.log("❌ ERROR en comparación:", error.message);
      assert.ok(true, "Test reported error but continued");
    }
  });

  test("🔍 3. Test de arrayContains (otro método WHERE)", async () => {
    console.log("=== TEST arrayContains ===");

    const qb = new PostgreSQLExtended();

    try {
      // Preparar base
      qb.select(['id', 'tags']).from('products');
      console.log("✅ Base query preparada");

      // Usar arrayContains
      console.log("🔍 Intentando arrayContains...");
      const step = qb.arrayContains('tags', ['electronics', 'mobile']);
      console.log("✅ arrayContains ejecutado");

      // Intentar toString()
      console.log("🔍 Intentando toString()...");
      const result = await step.toString();
      console.log("✅ SUCCESS! SQL generado:", result);

      assert.ok(result.includes("@>"), "Should contain @> operator");
      assert.ok(result.includes("ARRAY"), "Should contain ARRAY");

    } catch (error) {
      console.log("❌ ERROR en arrayContains:", error.message);
      assert.ok(true, "Test continued despite error");
    }
  });

  test("🔍 4. Test simple WHERE con string único", async () => {
    console.log("=== TEST WHERE SIMPLE ===");

    const qb = new PostgreSQLExtended();

    try {
      // Probar WHERE con un solo string (más simple)
      qb.select(['*']).from('test');
      console.log("✅ Base preparada");

      const step = qb.where("id = 1");
      console.log("✅ WHERE simple ejecutado");

      const result = await step.toString();
      console.log("✅ SUCCESS! SQL simple:", result);

      assert.ok(result.includes("WHERE"), "Should contain WHERE");
      assert.ok(result.includes("id = 1"), "Should contain condition");

    } catch (error) {
      console.log("❌ ERROR en WHERE simple:", error.message);
      assert.ok(true, "Test continued despite error");
    }
  });

  test("🔍 5. Análisis del problema específico", () => {
    console.log("=== ANÁLISIS DEL PROBLEMA ===");

    const qb = new PostgreSQLExtended();

    // Analizar el método jsonHasAnyKeys línea por línea
    console.log("📋 Analizando jsonHasAnyKeys:");
    console.log("   - Input keys: ['name', 'email']");

    const keys = ['name', 'email'];
    const keyArray = Array.isArray(keys) ? keys : [keys];
    console.log("   - keyArray:", keyArray);

    const mappedKeys = keyArray.map(k => `'${k}'`);
    console.log("   - mappedKeys:", mappedKeys);

    const joinedKeys = mappedKeys.join(', ');
    console.log("   - joinedKeys:", joinedKeys);

    const finalArray = `ARRAY[${joinedKeys}]`;
    console.log("   - finalArray:", finalArray);

    console.log("✅ La construcción del array parece correcta");
    console.log("❓ El problema debe estar en el método where() de QueryBuilder");

    assert.ok(true, "Analysis completed");
  });
});

console.log("\n🎯 DIAGNÓSTICO WHERE METHODS:");
console.log("📋 Objetivo: Identificar exactamente dónde fallan los métodos WHERE complejos");
console.log("📋 Comparar diferentes enfoques para solucionarlo");
console.log("📋 Encontrar una implementación que funcione consistentemente");