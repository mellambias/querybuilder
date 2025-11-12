# 🔧 **Configuración de Base de Datos**

## 📋 **Setup Inicial**

### **1. Crear archivo de configuración**
```bash
# Copiar el template de configuración
copy config.example.js config.js
```

### **2. Editar credenciales**
Abre `config.js` y actualiza con tus credenciales reales:

```javascript
import { MySqlDriver } from "@querybuilder/mysql";
import { PostgreSQLDriver } from "@querybuilder/postgresql";
import { MongodbDriver } from "@querybuilder/mongodb";
import { SQLiteDriver } from "@querybuilder/sqlite";
import { RedisDriver } from "@querybuilder/redis";
import { CassandraDriver } from "@querybuilder/cassandra";
import { ChromaDriver } from "@querybuilder/chroma";

const config = {
	databases: {
		MySql8: {
			version: "8.4.3",
			driver: MySqlDriver,
			params: {
				host: "localhost",
				port: "3306",
				username: "tu_usuario_mysql",    // ⚠️ Reemplazar
				password: "tu_password",         // ⚠️ Reemplazar
				database: "tu_base_datos"        // ⚠️ Reemplazar
			},
		},
		PostgreSQL: {
			version: "16",
			driver: PostgreSQLDriver,
			params: {
				host: "localhost",
				port: 5432,
				username: "tu_usuario_postgres", // ⚠️ Reemplazar
				password: "tu_password",         // ⚠️ Reemplazar
				database: "tu_base_datos"        // ⚠️ Reemplazar
			},
		},
		MongoDB: {
			version: "8.0.3",
			driver: MongodbDriver,
			params: {
				host: "localhost",
				port: 27017,
				username: "tu_usuario_mongo",    // ⚠️ Reemplazar (o undefined)
				password: "tu_password",         // ⚠️ Reemplazar (o undefined)
				database: "tu_base_datos",       // ⚠️ Reemplazar
				options: {
					retryWrites: true,
					w: "majority",
					connectTimeoutMS: 30000,
				}
			},
		},
		SQLite: {
			version: "5.x",
			driver: SQLiteDriver,
			params: {
				filename: "./database.sqlite"    // ⚠️ Reemplazar con tu ruta
			},
		},
		Redis: {
			version: "7.x",
			driver: RedisDriver,
			params: {
				host: "localhost",
				port: 6379,
				password: "tu_password",         // ⚠️ Reemplazar (opcional)
				db: 0                            // Base de datos Redis (0-15)
			},
		},
		Cassandra: {
			version: "4.x",
			driver: CassandraDriver,
			params: {
				contactPoints: ["localhost"],
				localDataCenter: "datacenter1",
				keyspace: "tu_keyspace",         // ⚠️ Reemplazar
				credentials: {
					username: "tu_usuario_cassandra", // ⚠️ Reemplazar (opcional)
					password: "tu_password"           // ⚠️ Reemplazar (opcional)
				}
			},
		},
		Chroma: {
			version: "1.x",
			driver: ChromaDriver,
			params: {
				path: "http://localhost:8000"    // ⚠️ URL del servidor Chroma
			},
		},
	},
};

export { config };
export default config;
```

## 🔒 **Seguridad**

### **⚠️ IMPORTANTE**
- ❌ **NUNCA** subas `config.js` al repositorio
- ✅ El archivo `config.js` está en `.gitignore`
- ✅ Solo sube `config.example.js` como template
- ✅ Usa variables de entorno en producción

### **🌍 Variables de Entorno (Recomendado para Producción)**
```bash
# Crear archivo .env

# MySQL
DB_MYSQL_HOST=localhost
DB_MYSQL_USER=tu_usuario
DB_MYSQL_PASSWORD=tu_password
DB_MYSQL_DATABASE=tu_bd

# PostgreSQL
DB_POSTGRES_HOST=localhost
DB_POSTGRES_USER=tu_usuario
DB_POSTGRES_PASSWORD=tu_password
DB_POSTGRES_DATABASE=tu_bd

# MongoDB
DB_MONGO_URL=mongodb://usuario:password@localhost:27017
DB_MONGO_DATABASE=tu_bd

# SQLite
DB_SQLITE_FILENAME=./database.sqlite

# Redis
DB_REDIS_HOST=localhost
DB_REDIS_PORT=6379
DB_REDIS_PASSWORD=tu_password
DB_REDIS_DB=0

# Cassandra
DB_CASSANDRA_CONTACT_POINTS=localhost
DB_CASSANDRA_DATACENTER=datacenter1
DB_CASSANDRA_KEYSPACE=tu_keyspace
DB_CASSANDRA_USERNAME=tu_usuario
DB_CASSANDRA_PASSWORD=tu_password

# Chroma
DB_CHROMA_PATH=http://localhost:8000
```

## 🧪 **Configuración para Tests**

### **Bases de Datos de Prueba**
Se recomienda usar bases de datos separadas para testing:

```javascript
export const testConfigs = {
  mysql: {
    ...config.databases.MySql8,
    params: {
      ...config.databases.MySql8.params,
      database: 'querybuilder_test'
    }
  },
  postgres: {
    ...config.databases.PostgreSQL,
    params: {
      ...config.databases.PostgreSQL.params,
      database: 'querybuilder_test'
    }
  },
  mongo: {
    ...config.databases.MongoDB,
    params: {
      ...config.databases.MongoDB.params,
      database: 'querybuilder_test'
    }
  },
  sqlite: {
    ...config.databases.SQLite,
    params: {
      filename: './test.sqlite'
    }
  },
  redis: {
    ...config.databases.Redis,
    params: {
      ...config.databases.Redis.params,
      db: 15  // Usar última base de datos para tests
    }
  },
  cassandra: {
    ...config.databases.Cassandra,
    params: {
      ...config.databases.Cassandra.params,
      keyspace: 'querybuilder_test'
    }
  },
  chroma: {
    ...config.databases.Chroma,
    params: {
      ...config.databases.Chroma.params,
      path: 'http://localhost:8001'  // Puerto diferente para tests
    }
  }
};
```

## 📝 **Ejemplos de Uso**

### **Importar Configuración**
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { MySQL } from "@querybuilder/mysql";
import { PostgreSQL } from "@querybuilder/postgresql";
import { MongoDB } from "@querybuilder/mongodb";
import { SQLite } from "@querybuilder/sqlite";
import { Redis } from "@querybuilder/redis";
import { Cassandra } from "@querybuilder/cassandra";
import { Chroma } from "@querybuilder/chroma";
import config from './config.js';

// Bases de datos SQL
const qbMySQL = new QueryBuilder(MySQL).driver(config.databases.MySql8.driver, config.databases.MySql8.params);
const qbPostgres = new QueryBuilder(PostgreSQL).driver(config.databases.PostgreSQL.driver, config.databases.PostgreSQL.params);
const qbSQLite = new QueryBuilder(SQLite).driver(config.databases.SQLite.driver, config.databases.SQLite.params);

// Bases de datos NoSQL
const qbMongo = new QueryBuilder(MongoDB).driver(config.databases.MongoDB.driver, config.databases.MongoDB.params);
const qbCassandra = new QueryBuilder(Cassandra).driver(config.databases.Cassandra.driver, config.databases.Cassandra.params);

// Bases de datos especializadas
const qbRedis = new QueryBuilder(Redis).driver(config.databases.Redis.driver, config.databases.Redis.params);
const qbChroma = new QueryBuilder(Chroma).driver(config.databases.Chroma.driver, config.databases.Chroma.params);
```

### **Configuración Condicional por Entorno**
```javascript
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    mysql: { host: 'localhost', user: 'dev_user', password: 'dev_pass' },
    // ...
  },
  production: {
    mysql: { host: 'prod.server.com', user: 'prod_user', password: 'secure_pass' },
    // ...
  },
  test: {
    mysql: { host: 'localhost', user: 'test_user', database: 'test_db' },
    // ...
  }
};

export default config[env];
```

## � **Guía de Bases de Datos**

### **MySQL / MariaDB** - SQL Relacional
- **Uso**: Aplicaciones web, e-commerce, sistemas CRUD
- **Puerto por defecto**: 3306
- **Características**: Transacciones ACID, joins complejos, índices

### **PostgreSQL** - SQL Avanzado
- **Uso**: Aplicaciones empresariales, análisis de datos
- **Puerto por defecto**: 5432
- **Características**: JSONB, full-text search, extensiones GIS

### **MongoDB** - NoSQL Documento
- **Uso**: APIs REST, datos semi-estructurados, prototipos rápidos
- **Puerto por defecto**: 27017
- **Características**: Esquema flexible, escalabilidad horizontal, agregaciones

### **SQLite** - SQL Embebido
- **Uso**: Apps móviles, apps de escritorio, prototipos
- **Archivo**: Base de datos en un solo archivo
- **Características**: Sin servidor, cero configuración, portable

### **Redis** - In-Memory Cache
- **Uso**: Cache, sesiones, pub/sub, colas de mensajes
- **Puerto por defecto**: 6379
- **Características**: Extremadamente rápido, TTL, estructuras de datos

### **Cassandra** - NoSQL Distribuido
- **Uso**: Big Data, time-series, alta disponibilidad
- **Puerto por defecto**: 9042
- **Características**: Sin punto único de falla, escalabilidad lineal

### **Chroma** - Vector Database
- **Uso**: IA, búsqueda semántica, embeddings, RAG
- **Puerto por defecto**: 8000
- **Características**: Búsqueda por similitud, integración con LLMs

## �🔧 **Troubleshooting**

### **Errores Comunes**

❌ **"config.js not found"**
```bash
# Solución: Copiar el template
copy config.example.js config.js
```

❌ **"Access denied for user"**
- Verificar usuario y password en config.js
- Verificar que el usuario tenga permisos en la BD
- Verificar que el servidor de BD esté ejecutándose

❌ **"Database does not exist"**
- Crear la base de datos antes de usarla
- Verificar el nombre de la BD en config.js

## 📚 **Más Información**

- [Configuración MySQL](../docs/mysql-setup.md)
- [Configuración PostgreSQL](../docs/postgresql-setup.md)
- [Configuración MongoDB](../docs/mongodb-setup.md)