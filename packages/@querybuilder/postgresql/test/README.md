# 🧪 PostgreSQL Test Suite - Suite Final de Tests

## 📋 Archivos de Test Principales

### 🎯 Test de Integración Core
- **`querybuilder-integration.test.js`** - ⭐ **PRINCIPAL** - Tests de integración QueryBuilder + PostgreSQL
  - Valida que el usuario final puede usar todas las funcionalidades
  - Tests de CREATE TABLE, CREATE TYPE, CREATE DOMAIN
  - Operaciones CRUD completas
  - Tipos PostgreSQL específicos

### 🏗️ Tests de Funcionalidades Específicas
- **`postgresql-extended.test.js`** - Tests del PostgreSQLExtended class
  - Window Functions, CTEs, UPSERT
  - JSON/JSONB operators (@>, <@, ?, etc.)
  - Array operations (@>, &&, <@)
  - Full-text search

- **`postgresql-basic.test.js`** - Tests básicos de PostgreSQL core
  - CREATE/ALTER/DROP operations
  - Tipos de datos básicos
  - Funcionalidades DDL/DML

### 📊 Tests de Validación por Categoría
- **`data-types.test.js`** - Validación de tipos PostgreSQL específicos
- **`json-operations.test.js`** - Operaciones JSON/JSONB completas
- **`array-operations.test.js`** - Operaciones con arrays PostgreSQL
- **`table-operations.test.js`** - Operaciones de tabla avanzadas
- **`advanced-features.test.js`** - CTEs, Window Functions, etc.

### 🔍 Tests de Arquitectura y Métodos
- **`architecture-final.test.js`** - Validación arquitectura QueryBuilder → PostgreSQL
- **`extended-methods.test.js`** - Métodos extendidos específicos
- **`specialized-methods.test.js`** - Métodos especializados PostgreSQL

### 📈 Tests de Resumen y Validación
- **`implementation-summary.test.js`** - Resumen de implementación completa
- **`postgresql-types-validation.test.js`** - Validación exhaustiva de tipos

## 🚀 Ejecutar Tests

### Test Principal (Recomendado)
```bash
# Ejecutar test de integración principal
node --test test/querybuilder-integration.test.js

# Ejecutar PostgreSQL Extended
node --test test/postgresql-extended.test.js

### Ejecutar todos los tests
```bash
cd packages/@querybuilder/postgresql
node test/index.test.js
```

### Ejecutar tests específicos
```bash
# Tests básicos
node test/database-operations.test.js
node test/table-operations.test.js
node test/data-types.test.js

# Tests avanzados
node test/json-operations.test.js
node test/array-operations.test.js
node test/advanced-features.test.js
```

### Ejecutar con Node.js test runner
```bash
# Todos los tests
node --test test/

# Test específico
node --test test/json-operations.test.js
```

## 📊 Cobertura de Tests

### ✅ Database Operations
- [x] CREATE/DROP DATABASE
- [x] CREATE/DROP SCHEMA
- [x] Opciones PostgreSQL específicas
- [x] Validación de nombres reservados

### ✅ Table Operations
- [x] CREATE/DROP TABLE
- [x] Tablas temporales
- [x] Columnas con tipos PostgreSQL
- [x] ALTER TABLE operations
- [x] Validaciones de columnas

### ✅ Data Types
- [x] CREATE TYPE (SQL, ENUM, COMPOSITE)
- [x] CREATE DOMAIN
- [x] Tipos PostgreSQL específicos
- [x] Arrays de tipos específicos

### ✅ JSON Operations
- [x] Operadores JSON básicos (->>, ->, @>, <@)
- [x] Operadores de existencia (?, ?|, ?&)
- [x] Funciones JSON (json_agg, jsonb_set)
- [x] Path queries complejos
- [x] Índices JSON

### ✅ Array Operations
- [x] Operadores de arrays (@>, <@, &&)
- [x] Funciones de arrays (array_agg, unnest)
- [x] Acceso a elementos ([1], [1:3])
- [x] ANY/ALL operations
- [x] Arrays multidimensionales

### ✅ Advanced Features
- [x] CTEs básicos y recursivos
- [x] Window Functions completas
- [x] UPSERT con todas las variantes
- [x] Full-text Search

## 🎯 Beneficios de la Estructura Modular

### ✅ Organización Clara
- Tests agrupados por funcionalidad
- Fácil navegación y mantenimiento
- Documentación específica por módulo

### ✅ Ejecución Granular
- Ejecutar solo tests relevantes
- Debugging más fácil
- CI/CD optimizado

### ✅ Mantenimiento Simplificado
- Agregar nuevos tests en módulo apropiado
- Modificar funcionalidad específica
- Cobertura de tests visible

### ✅ Escalabilidad
- Estructura preparada para nuevas características
- Patrón consistente con core
- Fácil colaboración entre desarrolladores

## 🔄 Migración del Test Original

El archivo original `postgres.test.js` contenía:
- Tests básicos de database y table operations
- Tests de tipos personalizados
- Validaciones de nombres reservados

Estos tests han sido reorganizados y expandidos en:
- `database-operations.test.js` - Tests de database
- `table-operations.test.js` - Tests de tabla expandidos  
- `data-types.test.js` - Tests de tipos expandidos

Los nuevos archivos añaden:
- Tests para características PostgreSQL específicas
- Mayor cobertura de casos edge
- Tests para funcionalidades avanzadas no cubiertas antes

## 📝 Convenciones de Test

### Estructura de Archivo
```javascript
import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import PostgreSQL from "../PostgreSQL.js"; // o postgresql-extended.js

describe("PostgreSQL - [Funcionalidad]", async () => {
  let sql;
  
  beforeEach(async () => {
    sql = new PostgreSQL();
  });

  test("Descripción del test", { only: false }, async () => {
    // Test implementation
    assert.ok(result.includes("expected"));
  });
});
```

### Nomenclatura
- Archivos: `[funcionalidad].test.js`
- Describes: `"PostgreSQL - [Funcionalidad]"`
- Tests: Descripción clara y específica
- Variables: `sql` para instancia PostgreSQL

---

**🎯 Objetivo**: Estructura de tests modular, mantenible y comprehensiva que cubra todas las características específicas de PostgreSQL mientras mantiene compatibilidad con el core QueryBuilder.