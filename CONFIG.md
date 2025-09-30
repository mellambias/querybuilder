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
DB_MYSQL_HOST=localhost
DB_MYSQL_USER=tu_usuario
DB_MYSQL_PASSWORD=tu_password
DB_MYSQL_DATABASE=tu_bd

DB_POSTGRES_HOST=localhost
DB_POSTGRES_USER=tu_usuario
DB_POSTGRES_PASSWORD=tu_password
DB_POSTGRES_DATABASE=tu_bd

DB_MONGO_URL=mongodb://usuario:password@localhost:27017
DB_MONGO_DATABASE=tu_bd
```

## 🧪 **Configuración para Tests**

### **Bases de Datos de Prueba**
Se recomienda usar bases de datos separadas para testing:

```javascript
export const testConfigs = {
  mysql: {
    ...mysqlConfig,
    database: 'querybuilder_test'
  },
  postgres: {
    ...postgresConfig,
    database: 'querybuilder_test'
  },
  mongo: {
    ...mongoConfig,
    database: 'querybuilder_test'
  }
};
```

## 📝 **Ejemplos de Uso**

### **Importar Configuración**
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { MySQL, MySqlDriver } from "@querybuilder/mysql";
import { PostgreSQL, PostgreSQLDriver } from "@querybuilder/postgresql";
import { MongoDB, MongodbDriver } from "@querybuilder/mongodb";
import config from './config.js';

// Usar configuración MySQL
const qbMySQL = new QueryBuilder(MySQL).driver(MySqlDriver, config.databases.MySql8.params);

// Usar configuración PostgreSQL
const qbPostgres = new QueryBuilder(PostgreSQL).driver(PostgreSQLDriver, config.databases.PostgreSQL.params);

// Usar configuración MongoDB
const qbMongo = new QueryBuilder(MongoDB).driver(MongodbDriver, config.databases.MongoDB.params);
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

## 🔧 **Troubleshooting**

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