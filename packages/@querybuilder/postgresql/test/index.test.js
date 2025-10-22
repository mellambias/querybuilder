/**
 * PostgreSQL Test Suite - Modular Structure
 * Archivo principal que ejecuta todos los tests organizados por funcionalidad
 */

// Tests básicos y compatibilidad con Core
import "./database-operations.test.js";
import "./table-operations.test.js";
import "./data-types.test.js";

// Tests de características específicas de PostgreSQL
import "./json-operations.test.js";
import "./array-operations.test.js";
import "./advanced-features.test.js";

console.log("🐘 Ejecutando suite completa de tests PostgreSQL...");
console.log("📋 Tests incluidos:");
console.log("   ✅ Database Operations - Operaciones de base de datos");
console.log("   ✅ Table Operations - Operaciones de tabla");
console.log("   ✅ Data Types - Tipos de datos personalizados");
console.log("   ✅ JSON Operations - Operaciones JSON/JSONB");
console.log("   ✅ Array Operations - Operaciones con arrays");
console.log("   ✅ Advanced Features - CTEs, Window Functions, UPSERT");
console.log("");
