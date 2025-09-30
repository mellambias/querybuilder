// 📋 EJEMPLO DE USO - Imports Coherentes con NPM
// ================================================

// 🎯 Una aplicación real importaría de esta manera desde NPM:

/*
// 1. Instalar paquetes NPM:
npm install @querybuilder/core @querybuilder/mysql

// 2. Importar en la aplicación:
import { QueryBuilder } from "@querybuilder/core";
import { MySQL } from "@querybuilder/mysql";
import { MySqlDriver } from "@querybuilder/mysql";

// 3. Usar QueryBuilder:
const qb = new QueryBuilder(MySQL).driver(MySqlDriver, {
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password"
});

const result = await qb
    .createTable("users", { cols: { id: "INT AUTO_INCREMENT PRIMARY KEY" }})
    .insert("users", ["John"], ["name"])
    .select("*").from("users")
    .execute();
*/

// 🧪 DEMOSTRACIÓN LOCAL (Simulando imports NPM):
// ===============================================

console.log("🎯 DEMOSTRACIÓN: Imports coherentes con distribución NPM");
console.log("====================================================");

try {
    // Importación NPM-style (simulando desde workspace local)
    const { QueryBuilder, Driver, Result } = await import("@querybuilder/core");
    
    console.log("✅ Core imports funcionando:");
    console.log("   - QueryBuilder:", typeof QueryBuilder);
    console.log("   - Driver:", typeof Driver);  
    console.log("   - Result:", typeof Result);
    
    console.log("\n🎯 Ejemplo de uso en aplicación real:");
    console.log(`
// Instalar paquetes:
npm install @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb

// Importar en aplicación:
import { QueryBuilder } from "@querybuilder/core";
import { MySQL, MySqlDriver } from "@querybuilder/mysql";
import { PostgreSQL, PostgreSQLDriver } from "@querybuilder/postgresql";  
import { MongoDB, MongodbDriver } from "@querybuilder/mongodb";

// Usar según necesidad:
const mysqlQB = new QueryBuilder(MySQL).driver(MySqlDriver, config);
const postgresQB = new QueryBuilder(PostgreSQL).driver(PostgreSQLDriver, config);
const mongoQB = new QueryBuilder(MongoDB).driver(MongodbDriver, config);
    `);
    
    console.log("🎊 Imports NPM-style implementados correctamente!");
    
} catch (error) {
    console.error("❌ Error:", error.message);
}