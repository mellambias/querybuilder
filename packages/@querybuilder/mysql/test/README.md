# MySQL QueryBuilder - Tests

Este directorio contiene la suite completa de tests para el módulo MySQL del QueryBuilder.

## 📋 Estructura de Tests

```
test/
├── mysql-driver.test.js           # Tests para MySqlDriver
├── mysql-integration.test.js      # Tests de integración 
├── mysql-extended.test.js         # Tests para MySqlExtended
├── mysql-extended-simple.test.js  # Tests básicos MySqlExtended
├── package.json                   # Configuración Jest y dependencias
├── test-setup.js                  # Configuración global de tests
├── run-tests.js                   # Script runner de tests
└── README.md                      # Esta documentación
```

## 🚀 Ejecución de Tests

### Scripts Disponibles

```bash
# Ejecutar todos los tests
npm test

# Tests específicos del driver
npm run test:driver

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests de integración
npm run test:integration
```

### Usando el Test Runner

```bash
# Runner personalizado
node run-tests.js [comando]

# Comandos disponibles:
node run-tests.js driver          # Solo tests del driver
node run-tests.js all             # Todos los tests
node run-tests.js coverage        # Con reporte de cobertura
node run-tests.js watch           # Modo watch
node run-tests.js specific "test" # Test específico
node run-tests.js install         # Instalar dependencias
node run-tests.js check           # Verificar setup
```

## 🧪 Tipos de Tests

### 1. Unit Tests (mysql-driver.test.js)

Tests unitarios para la clase `MySqlDriver`:

- ✅ **Constructor**: Inicialización y herencia
- ✅ **Conexión**: Establecer conexión con MySQL
- ✅ **Ejecución**: Queries simples y múltiples
- ✅ **Transacciones**: Manejo de transacciones
- ✅ **Errores**: Gestión de errores SQL
- ✅ **Cierre**: Cerrar conexiones
- ✅ **Integración**: Flujos completos

### 2. Integration Tests (mysql-integration.test.js)

Tests de integración con base de datos real:

- 🔄 **CRUD Operations**: Create, Read, Update, Delete
- 🔗 **Joins**: Consultas con múltiples tablas
- 📊 **Aggregations**: GROUP BY, SUM, COUNT, etc.
- 🏗️ **DDL**: CREATE, ALTER, DROP tables
- 🔒 **Transactions**: BEGIN, COMMIT, ROLLBACK
- 🎯 **Performance**: Tests de rendimiento

### 3. Extended Tests (mysql-extended.test.js)

Tests para funcionalidades avanzadas:

- 🔧 **MySQL Extended**: Funciones específicas MySQL
- 📝 **Query Builder**: Construcción fluida de queries
- 🎛️ **Functions**: Funciones SQL avanzadas
- 🎯 **Operators**: Operadores MySQL específicos
- 📊 **Types**: Sistema de tipos MySQL

## ⚙️ Configuración

### Variables de Entorno

```bash
# Base de datos de testing
MYSQL_TEST_HOST=localhost
MYSQL_TEST_PORT=3306
MYSQL_TEST_USER=test_user
MYSQL_TEST_PASSWORD=test_password
MYSQL_TEST_DATABASE=test_db

# Configuración de tests
NODE_ENV=test
TEST_TIMEOUT=30000
```

### Setup de Base de Datos

Para tests de integración, necesitas una base de datos MySQL:

```sql
-- Crear usuario de testing
CREATE USER 'test_user'@'localhost' IDENTIFIED BY 'test_password';

-- Crear base de datos de testing
CREATE DATABASE test_db;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON test_db.* TO 'test_user'@'localhost';
FLUSH PRIVILEGES;
```

### Jest Configuration

El archivo `package.json` incluye configuración Jest optimizada para ES modules:

```json
{
  "jest": {
    "preset": "default",
    "testEnvironment": "node",
    "extensionsToTreatAsEsm": [".js"],
    "moduleNameMapping": {
      "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    "setupFilesAfterEnv": ["<rootDir>/test-setup.js"]
  }
}
```

## 📊 Coverage Reports

Los tests generan reportes de cobertura en:

```
coverage/
├── lcov-report/     # Reporte HTML
├── lcov.info        # Formato LCOV
└── coverage.json    # Datos de cobertura
```

### Métricas de Cobertura

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >90%

## 🧰 Utilities y Helpers

### Test Helpers (test-setup.js)

Funciones utilitarias disponibles globalmente:

```javascript
// Parámetros de conexión de prueba
const params = testHelpers.createTestConnectionParams();

// Mock de ResultSetHeader
const header = testHelpers.createMockResultSetHeader({
  affectedRows: 1,
  insertId: 123
});

// Mock de resultados SELECT
const result = testHelpers.createMockSelectResult(
  [{ id: 1, name: 'test' }],
  ['id', 'name']
);

// Error SQL de prueba
const error = testHelpers.createMockSqlError('Table not found');

// Datos de usuario de prueba
const users = testHelpers.getTestUsers();

// Crear tabla de prueba
const createTable = testHelpers.createTestTable('users');
```

### Mocks Globales

Mocks automáticos disponibles:

```javascript
// Mock de mysql2/promise
global.mockMysql2.createConnection();
global.mockMysql2.createPool();

// Funciones de utilidad
global.silenceConsole();     // Silenciar console.log
global.restoreConsole();     // Restaurar console
global.cleanupTest();        // Limpiar después de test
```

## 🐛 Debugging Tests

### Debug Individual

```bash
# Test específico con debug
node --inspect-brk run-tests.js specific "should connect"

# Con logs detallados
DEBUG=* npm test
```

### Debug en VSCode

Configuración `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MySQL Tests",
  "program": "${workspaceFolder}/packages/@querybuilder/mysql/test/run-tests.js",
  "args": ["driver"],
  "console": "integratedTerminal",
  "skipFiles": ["<node_internals>/**"]
}
```

## 📝 Escribir Nuevos Tests

### Template Básico

```javascript
describe('Nueva Funcionalidad', () => {
  let driver;
  
  beforeEach(() => {
    driver = new MySqlDriver(testHelpers.createTestConnectionParams());
  });
  
  afterEach(async () => {
    await driver.close();
  });
  
  test('debe hacer algo específico', async () => {
    // Arrange
    const query = 'SELECT 1';
    
    // Act
    await driver.execute(query);
    const response = driver.response();
    
    // Assert
    expect(response.count).toBe(1);
  });
});
```

### Best Practices

1. **Aislamiento**: Cada test debe ser independiente
2. **Cleanup**: Limpiar recursos después de cada test
3. **Mocks**: Usar mocks para dependencias externas
4. **Descriptive**: Nombres descriptivos de tests
5. **AAA Pattern**: Arrange, Act, Assert

## 🔍 Troubleshooting

### Problemas Comunes

1. **Connection Issues**:
   ```bash
   Error: connect ECONNREFUSED 127.0.0.1:3306
   ```
   - Verificar que MySQL esté ejecutándose
   - Revisar variables de entorno

2. **Permission Denied**:
   ```bash
   Error: Access denied for user 'test_user'@'localhost'
   ```
   - Verificar credenciales en variables de entorno
   - Revisar permisos de usuario en MySQL

3. **Module Not Found**:
   ```bash
   Cannot find module 'mysql2/promise'
   ```
   - Ejecutar `npm install` en directorio de tests
   - Verificar dependencias en package.json

### Logs de Debug

```bash
# Habilitar logs detallados
export DEBUG=mysql:*,querybuilder:*
npm test

# Solo logs de conexión
export DEBUG=mysql:connection
npm test
```

## 📈 Métricas y Performance

### Benchmarks

Los tests incluyen métricas de rendimiento:

- **Conexión**: < 100ms
- **Query Simple**: < 50ms
- **Query Compleja**: < 500ms
- **Transacción**: < 200ms

### Monitoring

```javascript
// Medir tiempo de ejecución
console.time('test-execution');
await driver.execute(query);
console.timeEnd('test-execution');

// Memory usage
const used = process.memoryUsage();
console.log('Memory usage:', used);
```

## 🎯 Roadmap de Tests

### Próximas Mejoras

- [ ] Tests de stress/carga
- [ ] Tests de concurrencia
- [ ] Tests de failover
- [ ] Benchmarks automatizados
- [ ] Tests de seguridad
- [ ] Tests de migración

### Tests Faltantes

- [ ] Pool de conexiones
- [ ] Prepared statements
- [ ] Streaming de resultados
- [ ] Bulk operations
- [ ] SSL connections

---

## 💡 Tips de Desarrollo

1. **TDD**: Escribir tests antes del código
2. **Coverage**: Mantener >90% de cobertura
3. **Fast Tests**: Tests unitarios < 100ms
4. **Isolation**: Tests independientes entre sí
5. **Documentation**: Documentar casos complejos

Para más información, revisar la documentación principal del QueryBuilder.