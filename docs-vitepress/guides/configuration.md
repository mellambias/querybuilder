# Configuración

Guía completa de configuración para QueryBuilder.

## Configuración de Conexión

### MySQL/MariaDB
```javascript
const options = {
  host: 'localhost',
  port: 3306,
  database: 'myapp',
  username: 'user',
  password: 'password',
  
  // Opciones específicas de MySQL
  charset: 'utf8mb4',
  timezone: 'local',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  
  // Pool de conexiones
  connectionLimit: 10,
  queueLimit: 0
};
```

### PostgreSQL
```javascript
const options = {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  username: 'user',
  password: 'password',
  
  // Opciones específicas de PostgreSQL
  ssl: false,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 10000,
  max: 10,
  
  // Schema por defecto
  searchPath: ['public']
};
```

### MongoDB
```javascript
const options = {
  connectionString: 'mongodb://localhost:27017/myapp',
  
  // Opciones de MongoDB
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  
  // Autenticación
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-1'
};
```

### SQLite
```javascript
const options = {
  filename: './database.sqlite',
  
  // Opciones de SQLite
  readonly: false,
  fileMustExist: false,
  timeout: 5000,
  verbose: console.log
};
```

## Configuración de QueryBuilder

### Opciones Globales
```javascript
const qb = new QueryBuilder(Adapter, {
  // ... opciones de conexión ...
  
  // Configuración de QueryBuilder
  debug: true,                // Mostrar SQL generado
  timeout: 30000,            // Timeout de consultas
  retryAttempts: 3,          // Intentos de reconexión
  logQueries: true,          // Log de consultas
  
  // Formato de respuesta
  returnFormat: 'object',    // 'object' | 'array' | 'raw'
  camelCase: true,          // Convertir a camelCase
  
  // Validación
  validateTypes: true,       // Validar tipos de datos
  strictMode: false         // Modo estricto
});
```

### Variables de Entorno

Crea un archivo `.env`:

```bash
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=myapp
DB_USERNAME=user
DB_PASSWORD=password

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=myapp
PG_USERNAME=user
PG_PASSWORD=password

# MongoDB
MONGO_URL=mongodb://localhost:27017/myapp

# Configuración general
DEBUG_SQL=true
QUERY_TIMEOUT=30000
```

Uso en código:
```javascript
import dotenv from 'dotenv';
dotenv.config();

const options = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  debug: process.env.DEBUG_SQL === 'true'
};
```

## Configuración por Entorno

### Desarrollo
```javascript
const devConfig = {
  host: 'localhost',
  database: 'myapp_dev',
  debug: true,
  logQueries: true,
  connectionLimit: 5
};
```

### Producción
```javascript
const prodConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  debug: false,
  logQueries: false,
  connectionLimit: 20,
  ssl: {
    rejectUnauthorized: false
  }
};
```

### Testing
```javascript
const testConfig = {
  host: 'localhost',
  database: 'myapp_test',
  debug: false,
  connectionLimit: 1
};
```

## Pool de Conexiones

### MySQL
```javascript
const poolConfig = {
  connectionLimit: 10,      // Máximo conexiones
  queueLimit: 0,           // Sin límite de cola
  acquireTimeout: 60000,    // Timeout para obtener conexión
  timeout: 60000,          // Timeout de consulta
  reconnect: true,         // Reconectar automáticamente
  idleTimeout: 300000,     // Timeout de conexión idle
  
  // Eventos
  onConnection: (connection) => {
    console.log('Nueva conexión establecida');
  },
  onAcquire: (connection) => {
    console.log('Conexión adquirida');
  },
  onRelease: (connection) => {
    console.log('Conexión liberada');
  }
};
```

## SSL/TLS

### PostgreSQL con SSL
```javascript
const sslConfig = {
  host: 'secure-host.com',
  ssl: {
    require: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync('./ssl/server-ca.pem'),
    key: fs.readFileSync('./ssl/client-key.pem'),
    cert: fs.readFileSync('./ssl/client-cert.pem')
  }
};
```

### MongoDB con TLS
```javascript
const tlsConfig = {
  connectionString: 'mongodb://host:27017/db?ssl=true',
  sslValidate: false,
  sslCA: fs.readFileSync('./ssl/ca.pem'),
  sslCert: fs.readFileSync('./ssl/client.pem'),
  sslKey: fs.readFileSync('./ssl/client.key')
};
```

## Logging y Debug

### Configuración de Logging
```javascript
const qb = new QueryBuilder(Adapter, {
  debug: true,
  logger: {
    info: (message) => console.info(`[INFO] ${message}`),
    warn: (message) => console.warn(`[WARN] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`),
    debug: (sql, params) => {
      console.debug(`[SQL] ${sql}`);
      if (params) console.debug(`[PARAMS]`, params);
    }
  }
});
```

## Ver También

- [Inicio Rápido](/guides/getting-started) - Configuración básica
- [Ejemplos](/guides/examples) - Ejemplos de uso
- [Adaptadores](/guides/adapters) - Guía de adaptadores específicos