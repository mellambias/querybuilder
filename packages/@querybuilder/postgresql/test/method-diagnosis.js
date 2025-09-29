import PostgreSQLExtended from '../postgresql-extended.js';

console.log("🔍 DIAGNÓSTICO DE MÉTODOS POSTGRESQL EXTENDED");
console.log("=".repeat(60));

async function testMethods() {
  const qb = new PostgreSQLExtended();

  console.log("\n📋 MÉTODOS BÁSICOS (SIN WHERE):");

  try {
    // Test 1: SELECT puro
    const select1 = await qb.select(['id', 'name']).from('users').toString();
    console.log("✅ SELECT básico:", select1.substring(0, 50) + "...");
  } catch (error) {
    console.log("❌ SELECT básico falló:", error.message);
  }

  try {
    // Test 2: SELECT con JSON operators
    const qb2 = new PostgreSQLExtended();
    const select2 = await qb2.select(["data->>'name'"]).from('users').toString();
    console.log("✅ SELECT con JSON:", select2.substring(0, 50) + "...");
  } catch (error) {
    console.log("❌ SELECT con JSON falló:", error.message);
  }

  console.log("\n📋 MÉTODOS QUE USAN WHERE:");

  // Test 3: jsonContains (usa WHERE internamente)
  try {
    const qb3 = new PostgreSQLExtended();
    console.log("🔍 Probando jsonContains...");
    qb3.select(['*']).from('products');
    console.log("   - Hasta aquí bien...");

    const step = qb3.jsonContains('metadata', { brand: 'Apple' });
    console.log("   - jsonContains ejecutado, tipo:", typeof step);
    console.log("   - Es igual a qb3:", step === qb3);

    const result = await step.toString();
    console.log("✅ jsonContains funcionó:", result.substring(0, 50) + "...");
  } catch (error) {
    console.log("❌ jsonContains falló:", error.message);
    console.log("   Stack:", error.stack?.split('\n')[1]);
  }

  // Test 4: arrayContains (usa WHERE internamente)
  try {
    const qb4 = new PostgreSQLExtended();
    console.log("🔍 Probando arrayContains...");
    qb4.select(['*']).from('products');

    const step = qb4.arrayContains('tags', ['electronics']);
    console.log("   - arrayContains ejecutado");

    const result = await step.toString();
    console.log("✅ arrayContains funcionó:", result.substring(0, 50) + "...");
  } catch (error) {
    console.log("❌ arrayContains falló:", error.message);
  }

  console.log("\n📋 MÉTODOS DE FLUENT API:");

  // Test 5: Verificar herencia y disponibilidad
  const qb5 = new PostgreSQLExtended();
  console.log("✅ Métodos disponibles:");
  console.log("   - select:", typeof qb5.select);
  console.log("   - from:", typeof qb5.from);
  console.log("   - where:", typeof qb5.where);
  console.log("   - jsonContains:", typeof qb5.jsonContains);
  console.log("   - arrayContains:", typeof qb5.arrayContains);
  console.log("   - arrayOverlap:", typeof qb5.arrayOverlap);

  // Test 6: Chaining sin ejecutar toString
  try {
    const chain = qb5.select(['*']).from('test');
    console.log("✅ Chaining funciona:", chain === qb5);
  } catch (error) {
    console.log("❌ Chaining falló:", error.message);
  }
}

testMethods();