# QueryBuilder Core Tests

Esta carpeta contiene los tests organizados de forma lógica para el paquete `@querybuilder/core`.

## Estructura de Tests

### 🗃️ Organización por Funcionalidad

| Archivo | Descripción |
|---------|-------------|
| `database-operations.test.js` | Operaciones de base de datos (CREATE/DROP DATABASE, CREATE TYPE) |
| `table-operations.test.js` | Operaciones de tabla (CREATE/ALTER/DROP TABLE) |
| `constraints-datatypes.test.js` | Restricciones de columna/tabla, dominios, aserciones |
| `views.test.js` | Operaciones con vistas (CREATE/DROP VIEW) |
| `security-permissions.test.js` | Roles, permisos (GRANT/REVOKE) |
| `select-queries.test.js` | Consultas SELECT, GROUP BY, ORDER BY |
| `data-modification.test.js` | Operaciones INSERT/UPDATE/DELETE |
| `predicates-where.test.js` | Predicados WHERE y operaciones lógicas |
| `functions.test.js` | Funciones SET y VALUE (COUNT, SUM, etc.) |
| `joins.test.js` | Todos los tipos de JOIN |
| `subqueries.test.js` | Consultas anidadas y subconsultas |
| `cursors.test.js` | Operaciones con cursores |
| `transactions.test.js` | Manejo de transacciones |

### 📁 Archivo Original

El archivo original `core.test.js` contenía **1765 líneas** con todas las pruebas mezcladas. Ha sido dividido en **13 archivos** especializados para mejor organización y mantenimiento.

## 🚀 Cómo Ejecutar los Tests

### Todos los tests
```bash
cd packages/@querybuilder/core
node --test test/
```

### Tests individuales
```bash
# Operaciones de base de datos
node --test test/database-operations.test.js

# Operaciones de tabla
node --test test/table-operations.test.js

# Consultas SELECT
node --test test/select-queries.test.js

# etc...
```

### Test específico
```bash
# Ejecutar solo un test específico
node --test test/joins.test.js --grep "INNER JOIN"
```

## 📊 Beneficios de la Nueva Estructura

### ✅ Ventajas

1. **Mejor organización**: Cada archivo se enfoca en una funcionalidad específica
2. **Fácil navegación**: Encontrar tests relacionados es mucho más simple
3. **Ejecución selectiva**: Puedes ejecutar solo los tests que necesites
4. **Mantenimiento**: Más fácil agregar nuevos tests o modificar existentes
5. **Debugging**: Identificar problemas es más rápido
6. **Paralelización**: Los tests se pueden ejecutar en paralelo por categoría
7. **Documentación**: Cada archivo documenta su funcionalidad específica

### 🎯 Casos de Uso

- **Desarrollo de nuevas características**: Ejecuta solo los tests relacionados
- **Refactoring**: Verifica funcionalidad específica sin ejecutar toda la suite
- **CI/CD**: Ejecutar tests en paralelo para mayor velocidad
- **Debugging**: Aislar problemas por categoría de funcionalidad

## 🔧 Configuración

Cada archivo de test:

- Importa las dependencias necesarias
- Configura el `beforeEach` con QueryBuilder
- Organiza tests en `describe` blocks lógicos
- Usa nombres descriptivos para cada test

## 📝 Convenciones

- **Nombres de archivo**: `funcionalidad.test.js`
- **Estructura**: `describe` → `test` anidados
- **Setup**: `beforeEach` para inicializar QueryBuilder
- **Assertions**: Uso consistente de `assert` de Node.js
