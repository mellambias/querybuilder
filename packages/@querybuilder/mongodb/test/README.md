# Tests MongoDB Package

Esta carpeta contiene todos los tests y demos para el paquete MongoDB de QueryBuilder.

## 📁 Estructura de Tests

### 🧪 **Tests de Funcionalidad**

#### `test-mongodb-directo.js`
**Test directo de la clase MongoDB sin QueryBuilder wrapper**
- ✅ Validación de operaciones básicas (SELECT, WHERE, UPDATE, DELETE)
- ✅ Tests completos de JOINs (INNER, LEFT, RIGHT)
- ✅ Múltiples JOINs secuenciales
- ✅ Métodos de conveniencia (innerJoin, leftJoin, rightJoin)
- ✅ Parsing de condiciones JOIN
- ✅ Construcción de pipelines de agregación

```bash
node test-mongodb-directo.js
```

#### `test-sql-avanzado.js`
**Test completo de características SQL avanzadas → MongoDB**
- ✅ GROUP BY → `$group` con agregaciones (COUNT, SUM, AVG)
- ✅ HAVING → `$match` después de `$group`
- ✅ ORDER BY → `$sort` con múltiples campos y ASC/DESC
- ✅ LIMIT/OFFSET → `$skip` + `$limit` para paginación
- ✅ Consultas complejas combinadas (JOINs + GROUP BY + HAVING + ORDER BY + LIMIT)
- ✅ Validaciones y casos de error
- ✅ Patrones de performance optimizados

```bash
node test-sql-avanzado.js
```

#### `test-command-construction.js`
**Test básico de construcción de comandos MongoDB**
- ✅ Construcción de comandos SELECT, UPDATE, DELETE
- ✅ Aplicación de filtros WHERE
- ✅ Validación de estructura de comandos
- ✅ Verificación de metadata de JOINs
- ✅ Generación de pipelines de agregación

```bash
node test-command-construction.js
```

#### `test-driver-integration.js`
**Test de integración con driver MongoDB real**
- ⚠️ Requiere instancia MongoDB corriendo
- ⚠️ Requiere configuración de driver
- Tests de conexión y operaciones reales
- Validación end-to-end del flujo completo

```bash
node test-driver-integration.js
```

### 🎮 **Demos y Ejemplos**

#### `demo-mongodb-directo.js`
**Demo directo: Funcionalidad JOIN SQL → MongoDB**
- 🔗 Ejemplos de JOINs con sintaxis SQL familiar
- 📊 Traducción a MongoDB aggregation pipelines
- 💡 Casos de uso prácticos
- 🎯 Comparación SQL vs MongoDB

```bash
node demo-join-sql.js
```

#### `demo-querybuilder-completo.js`
**Demo completo: QueryBuilder + MongoDB + SQL Avanzado**
- 🚀 Configuración completa del QueryBuilder
- 📋 Validación de driver MongoDB
- 🔸 Ejemplos SQL básico → MongoDB
- 🔗 JOINs avanzados con múltiples tablas
- 🎯 Roadmap de características futuras

```bash
node demo-querybuilder-completo.js
```

## 🏃‍♂️ **Ejecución Rápida**

### Ejecutar todos los tests funcionales:
```bash
# Test directo (recomendado)
node test-mongodb-directo.js

# Test SQL avanzado (GROUP BY, ORDER BY, LIMIT, etc.)
node test-sql-avanzado.js

# Test de construcción de comandos
node test-command-construction.js
```

### Ejecutar demos:
```bash
# Demo directo de JOINs
node demo-join-sql.js

# Demo completo con QueryBuilder
node demo-querybuilder-completo.js
```

## ✅ **Estado Actual**

### **Funcionalidades Implementadas:**
- 🔥 **JOINs SQL → MongoDB Aggregation**
  - INNER JOIN → `$lookup` + `$unwind`
  - LEFT JOIN → `$lookup` + `$unwind` con `preserveNullAndEmptyArrays`
  - RIGHT JOIN → `$lookup` + `$unwind` con `preserveNullAndEmptyArrays`
  - Múltiples JOINs secuenciales
  - Parsing automático de condiciones: `"users.id = orders.user_id"`

- 🔧 **Operaciones Básicas SQL → MongoDB**
  - SELECT → `find()` con projection
  - WHERE → filter conditions
  - UPDATE → comando `update` con filtros
  - DELETE → comando `delete` con filtros

- 📊 **Características SQL Avanzadas → MongoDB**
  - GROUP BY → `$group` con agregaciones (COUNT, SUM, AVG, etc.)
  - HAVING → `$match` después de `$group`
  - ORDER BY → `$sort` con múltiples campos y ASC/DESC
  - LIMIT → `$limit` para límites de resultados
  - OFFSET/SKIP → `$skip` para paginación
  - Consultas complejas combinadas con pipeline completo

- 🎯 **Métodos de Conveniencia**
  - `innerJoin(table, condition, alias)`
  - `leftJoin(table, condition, alias)`
  - `rightJoin(table, condition, alias)`
  - `groupBy(fields, aggregations)`
  - `having(conditions)`
  - `orderBy(fields, direction)`
  - `limit(count)` / `offset(count)` / `skip(count)`

### **Estado de Tests:**
- ✅ Traducción SQL → MongoDB: **FUNCIONAL**
- ✅ Construcción de comandos: **FUNCIONAL**
- ✅ Pipeline de agregación: **FUNCIONAL**
- ⚠️ Integración con QueryBuilder: **REQUIERE AJUSTES**
- ⚠️ Conexión MongoDB real: **REQUIERE CONFIGURACIÓN**

## 🎯 **Próximas Características SQL**

Las siguientes características están planeadas para implementación futura:

1. **Subconsultas** → Nested aggregation pipelines
2. **UNION** → `$unionWith`
3. **Window Functions** → `$setWindowFields`
4. **CASE/WHEN** → `$cond` expressions
5. **WITH (CTEs)** → Common Table Expressions
6. **Funciones de fecha/string** → Funciones específicas MongoDB
7. **Full-text search** → `$text` search
8. **Geo-spatial queries** → `$geoNear`, `$geoWithin`

## 🔧 **Configuración para Tests con MongoDB Real**

Para ejecutar tests con una instancia real de MongoDB:

1. **Instalar MongoDB** localmente o usar Docker
2. **Configurar conexión** en `config.js`
3. **Ejecutar instancia** en `localhost:27017`
4. **Ejecutar tests de integración**

```bash
# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ejecutar test de integración
node test-driver-integration.js
```

## 📚 **Documentación Relacionada**

- [MongoDB.js](../MongoDB.js) - Clase principal con implementación de JOINs
- [Command.js](../Command.js) - Sistema de comandos MongoDB
- [package.json](../package.json) - Configuración del paquete
- [../../core/config.js](../../core/config.js) - Configuración de drivers

---

**Nota:** Todos los tests están diseñados para ejecutarse independientemente y no requieren configuración adicional, excepto los tests de integración que necesitan una instancia real de MongoDB.