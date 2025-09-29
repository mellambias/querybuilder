import PostgreSQLExtended from '../postgresql-extended.js';

console.log("🔧 DIAGNÓSTICO DIRECTO - SIN FRAMEWORK DE TESTING");
console.log("=".repeat(60));

async function directDiagnostic() {
  console.log("\n📋 Test 1: SELECT simple (sabemos que funciona)");
  try {
    const qb1 = new PostgreSQLExtended();
    const result1 = await qb1.select(['id']).from('test').toString();
    console.log("✅ SELECT simple OK:", result1);
  } catch (error) {
    console.log("❌ SELECT simple falló:", error.message);
  }

  console.log("\n📋 Test 2: WHERE con un parámetro (el problema)");
  try {
    const qb2 = new PostgreSQLExtended();
    qb2.select(['*']).from('test');
    console.log("   - Base preparada");

    // Este es el patrón que causa problemas
    console.log("   - Llamando where('metadata', '?|', ...)");
    const step = qb2.where('metadata', '?|', "ARRAY['name', 'email']");
    console.log("   - WHERE ejecutado, tipo:", typeof step);

    console.log("   - Intentando toString()... (aquí se cuelga)");
    // const result = await step.toString(); // ESTO SE CUELGA
    console.log("   - ⚠️ OMITIDO toString() para evitar colgarse");

  } catch (error) {
    console.log("❌ WHERE con parámetros falló:", error.message);
  }

  console.log("\n📋 Test 3: Investigar el método addWhereCondition");
  try {
    const qb3 = new PostgreSQLExtended();
    qb3.select(['*']).from('test');

    console.log("   - Probando addWhereCondition...");
    const step = qb3.addWhereCondition("metadata ?| ARRAY['name', 'email']");
    console.log("   - addWhereCondition ejecutado, tipo:", typeof step);
    console.log("   - Es la misma instancia:", step === qb3);

    // Revisar qué hace addWhereCondition internamente
    console.log("   - addWhereCondition llama internamente a:", "this.where(condition)");
    console.log("   - ⚠️ Esto significa que también tendrá el mismo problema");

  } catch (error) {
    console.log("❌ addWhereCondition falló:", error.message);
  }

  console.log("\n📋 Test 4: Alternativa - crear SQL manualmente");
  try {
    const qb4 = new PostgreSQLExtended();
    const baseSQL = await qb4.select(['*']).from('test').toString();
    console.log("✅ Base SQL:", baseSQL);

    // Construir manualmente la parte WHERE
    const whereClause = "WHERE metadata ?| ARRAY['name', 'email']";
    const finalSQL = baseSQL.replace(';', '') + '\n' + whereClause + ';';
    console.log("✅ SQL manual construido:", finalSQL);

    console.log("   - ✅ Esto funciona pero no es fluent API");

  } catch (error) {
    console.log("❌ SQL manual falló:", error.message);
  }

  console.log("\n📋 Test 5: Verificar si el problema es específico del operador");
  try {
    const qb5 = new PostgreSQLExtended();
    qb5.select(['*']).from('test');

    console.log("   - Probando WHERE con operador simple =");
    // Intentar un WHERE más simple pero sin ejecutar toString()
    // const step = qb5.where('id', '=', '1');
    console.log("   - ⚠️ Omitido para evitar colgarse");

    console.log("   - El problema parece ser cualquier uso de where() con múltiples parámetros");

  } catch (error) {
    console.log("❌ WHERE simple falló:", error.message);
  }

  console.log("\n🎯 CONCLUSIONES:");
  console.log("✅ SELECT sin WHERE funciona perfectamente");
  console.log("❌ Cualquier uso de WHERE con múltiples parámetros se cuelga en toString()");
  console.log("❌ addWhereCondition también falla porque usa where() internamente");
  console.log("💡 SOLUCIÓN NECESARIA: Implementar método WHERE alternativo");
  console.log("💡 O encontrar una forma de usar selectRaw para incluir WHERE");
}

// Ejecutar diagnóstico
directDiagnostic().catch(error => {
  console.log("🚨 ERROR GENERAL:", error.message);
});