import PostgreSQLExtended from '../postgresql-extended.js';

console.log("🔧 TESTING SOLUCIÓN CORREGIDA");
console.log("=".repeat(50));

async function testSolution() {
  console.log("\n📋 Test 1: addWhereCondition corregido");
  try {
    const qb = new PostgreSQLExtended();
    qb.select(['*']).from('users');
    console.log("✅ Base preparada");

    // Usar el método corregido
    const step = qb.addWhereCondition("metadata ?| ARRAY['name', 'email']");
    console.log("✅ addWhereCondition ejecutado");

    // Intentar toString()
    console.log("🔍 Intentando toString()...");
    const result = await step.toString();
    console.log("🎉 SUCCESS! SQL generado:");
    console.log(result);

  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  console.log("\n📋 Test 2: jsonHasAnyKeys usando solución corregida");
  try {
    const qb2 = new PostgreSQLExtended();
    const result = await qb2
      .select(['id', 'metadata'])
      .from('users')
      .jsonHasAnyKeys('metadata', ['name', 'email'])
      .toString();

    console.log("🎉 SUCCESS! jsonHasAnyKeys funciona:");
    console.log(result);

  } catch (error) {
    console.log("❌ Error en jsonHasAnyKeys:", error.message);
  }

  console.log("\n📋 Test 3: arrayContains usando solución corregida");
  try {
    const qb3 = new PostgreSQLExtended();
    const result = await qb3
      .select(['id', 'tags'])
      .from('products')
      .arrayContains('tags', ['electronics', 'mobile'])
      .toString();

    console.log("🎉 SUCCESS! arrayContains funciona:");
    console.log(result);

  } catch (error) {
    console.log("❌ Error en arrayContains:", error.message);
  }

  console.log("\n📋 Test 4: jsonContains usando solución corregida");
  try {
    const qb4 = new PostgreSQLExtended();
    const result = await qb4
      .select(['*'])
      .from('products')
      .jsonContains('data', { brand: 'Apple' })
      .toString();

    console.log("🎉 SUCCESS! jsonContains funciona:");
    console.log(result);

  } catch (error) {
    console.log("❌ Error en jsonContains:", error.message);
  }

  console.log("\n🎯 RESUMEN DE LA SOLUCIÓN:");
  console.log("✅ Identificado problema: QueryBuilder.where() espera (predicados, next)");
  console.log("✅ Solución: addWhereCondition(condition) pasa (condition, this)");
  console.log("✅ Todos los métodos WHERE complejos ahora usan addWhereCondition");
}

testSolution().catch(error => {
  console.log("🚨 ERROR:", error.message);
});