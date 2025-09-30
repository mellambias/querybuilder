# MySQL QueryBuilder - Tests de Integración

Este directorio contiene tests de integración para el módulo MySQL del QueryBuilder, utilizando una **base de datos MariaDB real** con configuración centralizada desde `core/config.js`.

## 🔧 Configuración

### Configuración Centralizada
Los tests usan la configuración desde `packages/@querybuilder/core/config.js`:

```javascript
testing: {
  MySQL: {
    version: "",
    driver: MySqlDriver,
    params: {
      host: "localhost",
      port: "3306",
      username: "root", 
      password: "d4t55qpl",
      database: "querybuilder_test"
    }
  }
}
```

### Base de Datos
- **Motor**: MariaDB (puerto 3306)
- **Base de datos de test**: `querybuilder_test` (se crea automáticamente)
- **Usuario**: root con la contraseña configurada en config.js

## 🚀 Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Solo tests del driver
npm run test:driver

# Verificar configuración
node run-tests.js --check-env

# Probar conectividad con la base de datos
node run-tests.js --check-db

# Ver ayuda
node run-tests.js --help
```

## 📁 Estructura de Archivos

```
test/
├── package.json                 # Configuración sin Jest, solo mysql2
├── test-setup.js               # Setup usando core/config.js
├── mysql-driver.test.js        # Tests de integración del MySqlDriver
├── run-tests.js               # Test runner personalizado
└── README.md                  # Este archivo
```

## 🧪 Tipos de Tests

### Tests de Integración
Los tests verifican el funcionamiento real del MySqlDriver:

- **Conexión**: Conexión real a MariaDB con credenciales del config.js
- **Queries**: Ejecución de SELECT, INSERT, CREATE TABLE, etc.
- **Manejo de Errores**: Queries con sintaxis incorrecta, tablas inexistentes
- **Transacciones**: BEGIN, COMMIT, ROLLBACK (cuando esté implementado)
- **Limpieza**: Cierre correcto de conexiones

### Ventajas de Configuración Centralizada
- ✅ Una sola fuente de verdad para todas las configuraciones
- ✅ No necesita variables de entorno
- ✅ Fácil de mantener y actualizar
- ✅ Consistencia entre desarrollo y testing
- ✅ Configuración versionada en git

## 🗄️ Gestión de Base de Datos

### Creación Automática
Los tests crean automáticamente:
- Base de datos `querybuilder_test` (si no existe)
- Tablas temporales para cada test
- Pool de conexiones gestionado

### Limpieza Automática
- Tablas temporales se eliminan después de cada test
- Conexiones se cierran al finalizar
- Pool de conexiones se limpia correctamente

### Aislamiento de Tests
- Cada test usa tablas con nombres únicos generados automáticamente
- No hay interferencia entre tests
- Base de datos se mantiene limpia

## ⚙️ Configuración Avanzada

### Modificar Configuración de Test
Editar `packages/@querybuilder/core/config.js`:

```javascript
testing: {
  MySQL: {
    params: {
      host: "localhost",        // Cambiar host si es necesario
      port: "3306",            // Puerto de MariaDB
      username: "root",        // Usuario de BD
      password: "tu_password", // Tu contraseña
      database: "querybuilder_test" // BD de test
    }
  }
}
```

### Personalizar Timeout
En `test-setup.js`, modificar:
```javascript
const DB_TIMEOUT = 30000; // 30 segundos
```

## 🔍 Troubleshooting

### Error: "Access denied for user"
```bash
# Verificar credenciales en config.js
# Conectar manualmente para probar:
mysql -h localhost -P 3306 -u root -p

# Verificar permisos:
GRANT ALL PRIVILEGES ON querybuilder_test.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Can't connect to MySQL server"
```bash
# Verificar que MariaDB esté ejecutándose
# Windows:
net start mariadb

# Linux/macOS:
sudo systemctl start mariadb
# o
brew services start mariadb
```

### Error: "Database doesn't exist"
Los tests crean la base de datos automáticamente, pero el usuario debe tener permisos:
```sql
GRANT CREATE ON *.* TO 'root'@'localhost';
```

### Configuración no encontrada
- Verificar que `core/config.js` existe
- Verificar que la sección `testing.MySQL` está configurada
- Verificar las rutas de import en los archivos de test

## 📋 Ejemplo de Ejecución

```bash
$ npm test

🧪 MySQL QueryBuilder Test Runner
==================================
ℹ️  Verificando configuración del entorno...
Configuración desde core/config.js:
  Host: localhost
  Puerto: 3306
  Usuario: root
  Base de datos: querybuilder_test
  Driver: MariaDB (puerto 3306)
✅ Configuración cargada correctamente desde core/config.js

ℹ️  Verificando archivos de test...
✅ Encontrado: mysql-driver.test.js
✅ Encontrado: test-setup.js

ℹ️  Probando conectividad con la base de datos...
📊 Test database 'querybuilder_test' created or verified
🧪 MySQL Test Database initialized (MariaDB)
📊 Test Database: querybuilder_test
🏠 Test Host: localhost:3306
👤 Test User: root
🔧 Using configuration from: @querybuilder/core/config.js
✅ Base de datos de pruebas disponible

🚀 Ejecutando tests de integración...
🚀 Starting MySQL Driver Integration Tests

📋 Constructor y Configuración
✅ debería crear una instancia con parámetros válidos (2ms)
✅ debería manejar parámetros de conexión faltantes (1ms)
✅ debería configurar parámetros por defecto correctamente (0ms)

📋 Conexión a Base de Datos
✅ debería conectar exitosamente con parámetros válidos (45ms)
✅ debería fallar con credenciales incorrectas (1015ms)
✅ debería manejar timeout de conexión (1002ms)

📋 Ejecución de Queries
✅ debería ejecutar SELECT simple correctamente (12ms)
✅ debería crear tabla de prueba (23ms)
✅ debería insertar y recuperar datos (31ms)
✅ debería manejar queries con error de sintaxis (8ms)

📋 Cierre de Conexión
✅ debería cerrar conexión correctamente (5ms)
✅ debería manejar múltiples llamadas a close() (25ms)

📊 Test Results Summary:
========================
Total Tests: 10
✅ Passed: 10
❌ Failed: 0
📈 Success Rate: 100.0%
🎉 Todos los tests pasaron correctamente!
```

## 🔄 Cambios Recientes

### Migración a Configuración Centralizada
- ❌ **Antes**: Variables de entorno (`MYSQL_TEST_*`)
- ✅ **Ahora**: Configuración en `core/config.js`
- ✅ **Beneficio**: Una sola fuente de configuración para todo el proyecto

### Estructura de Configuración
```javascript
// Estructura en core/config.js
config = {
  databases: {
    // Configuraciones de desarrollo/producción
    MySql8: { /* MySQL 8 en puerto 3308 */ },
    MariaDB: { /* MariaDB en puerto 3306 */ },
    PostgreSQL: { /* PostgreSQL */ },
    MongoDB: { /* MongoDB */ }
  },
  testing: {
    // Configuraciones específicas para tests
    MySQL: { /* MariaDB para tests */ },
    PostgreSQL: { /* PostgreSQL para tests */ },
    MongoDB: { /* MongoDB para tests */ }
  }
}
```

### Ventajas del Nuevo Enfoque
- 🔧 Configuración centralizada y versionada
- 🚀 Setup más simple (sin variables de entorno)
- 📊 Consistencia entre desarrollo y testing
- 🔄 Fácil cambio entre diferentes motores de BD