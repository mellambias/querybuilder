# 🚀 QueryBuilder

[![NPM Version](https://img.shields.io/npm/v/@querybuilder/core?style=flat-square)](https://www.npmjs.com/package/@querybuilder/core)
[![License](https://img.shields.io/badge/license-MPL--2.0-blue?style=flat-square)](https://www.mozilla.org/en-US/MPL/2.0/)
[![Build Status](https://img.shields.io/github/workflow/status/mellambias/querybuilder/CI?style=flat-square)](https://github.com/mellambias/querybuilder/actions)

Libreria **QueryBuilder multi-paradigma** con soporte para bases de datos **SQL**, **NoSQL**, **Vector DB**, **In-Memory** y **Distribuidas** usando una API fluida unificada y elegante.

## 🎯 **Características Principales**

✅ **Multi-Database**: MySQL, PostgreSQL, MongoDB, Cassandra, Redis, SQLite, Chroma  
✅ **Multi-Paradigma**: SQL, NoSQL, Vector DB, In-Memory, Distributed  
✅ **API Unificada**: Misma sintaxis para diferentes paradigmas  
✅ **Modular**: Instala solo lo que necesitas  
✅ **TypeScript Ready**: Soporte completo para tipos  
✅ **Fluent Interface**: Sintaxis intuitiva y legible  
✅ **Driver Abstraction**: Cambio fácil entre bases de datos  
✅ **Big Data Ready**: Soporte para Cassandra y sistemas distribuidos  

## 📦 **Instalación**

### Instalación Selectiva (Recomendado)
```bash
# Solo el core (mínimo)
npm install @querybuilder/core

# Bases de datos SQL
npm install @querybuilder/mysql      # Para MySQL/MariaDB
npm install @querybuilder/postgresql # Para PostgreSQL  
npm install @querybuilder/sqlite     # Para SQLite

# Bases de datos NoSQL
npm install @querybuilder/mongodb    # Para MongoDB
npm install @querybuilder/cassandra  # Para Cassandra (distribuida)

# Bases de datos especializadas
npm install @querybuilder/redis      # Para Redis (in-memory)
npm install @querybuilder/chroma     # Para Chroma (vector database)
```

### Instalación Completa
```bash
npm install @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb @querybuilder/cassandra @querybuilder/redis @querybuilder/sqlite @querybuilder/chroma
```

## ⚙️ **Configuración**

### Configurar Base de Datos
```bash
# 1. Copiar template de configuración en el directorio del core
copy config.example.js config.js

# 2. Editar config.js con tus credenciales
```

📋 Ver [CONFIG.md](./CONFIG.md) para instrucciones detalladas de configuración.

## 🚀 **Uso Rápido**

### MySQL
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { MySQL} from "@querybuilder/mysql";
import config from "./config.js";

const mysql = config.databases.MySql8
const qb = new QueryBuilder(MySQL).driver(mysql.driver, mysql.params);

// Crear tabla
await qb.createTable("users", {
  id: "INT AUTO_INCREMENT PRIMARY KEY",
  name: "VARCHAR(100) NOT NULL",
  email: "VARCHAR(100) UNIQUE"
}).execute();

// Insertar datos
await qb.table("users")
  .insert({ name: "Juan", email: "juan@email.com" })
  .execute();

// Consultar datos
const users = await qb.table("users")
  .select("*")
  .where(qb.like("name", "%Juan%"))
  .execute();
```

### PostgreSQL
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { PostgreSQL, PostgreSQLExtended} from "@querybuilder/postgresql";
import config from "./config.js";

const postgreSQL = config.databases.PostgreSQL;
const qb = new PostgreSQLExtended(PostgreSQL).driver(postgreSQL.driver, postgreSQL.params);

// Consulta con JSONB (PostgreSQL específico)
const result = await qb.table("products")
  .select("*")
  .whereJsonContains("metadata", { category: "electronics" })
  .execute();
```

### MongoDB
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { MongoDB, MongodbDriver } from "@querybuilder/mongodb";
import config from "./config.js";

const mongoDB = config.databases.MongoDB
const qb = new QueryBuilder(MongoDB).driver(mongoDB.driver, mongoDB.params);

// Operaciones NoSQL con sintaxis familiar
await qb.collection("users")
  .insert({ name: "Juan", email: "juan@email.com" })
  .execute();

const users = await qb.collection("users")
  .select()
  .where("name", "Juan")
  .execute();
```

### Cassandra (Distributed NoSQL)
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { Cassandra } from "@querybuilder/cassandra";
import config from "./config.js";

const cassandra = config.databases.Cassandra;
const qb = new QueryBuilder(Cassandra).driver(cassandra.driver, cassandra.params);

// Crear keyspace y tabla para Big Data
await qb.createKeyspace("analytics", { 
  replication: { class: "SimpleStrategy", replication_factor: 3 } 
}).execute();

await qb.createTable("events", {
  user_id: "UUID",
  timestamp: "TIMESTAMP", 
  event_type: "TEXT",
  data: "MAP<TEXT, TEXT>",
  "PRIMARY KEY": "(user_id, timestamp)"
}).execute();

// Insertar datos time-series
await qb.table("events")
  .insert({ 
    user_id: "uuid()", 
    timestamp: "now()", 
    event_type: "page_view",
    data: { page: "/home", source: "organic" }
  })
  .execute();
```

### Redis (In-Memory Cache)
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { Redis } from "@querybuilder/redis";
import config from "./config.js";

const redis = config.databases.Redis;
const qb = new QueryBuilder(Redis).driver(redis.driver, redis.params);

// Operaciones de cache y pub/sub
await qb.set("user:1000", JSON.stringify({ name: "Juan", email: "juan@email.com" }))
  .expire(3600) // TTL de 1 hora
  .execute();

const userData = await qb.get("user:1000").execute();

// Pub/Sub para tiempo real
await qb.publish("notifications", "New user registered").execute();
```

### SQLite (Embedded SQL)
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { SQLite } from "@querybuilder/sqlite";

const qb = new QueryBuilder(SQLite).driver("sqlite3", { 
  filename: "./database.sqlite" 
});

// Base de datos embebida perfecta para aplicaciones locales
await qb.createTable("settings", {
  key: "TEXT PRIMARY KEY",
  value: "TEXT NOT NULL",
  updated_at: "DATETIME DEFAULT CURRENT_TIMESTAMP"
}).execute();

await qb.table("settings")
  .insert({ key: "theme", value: "dark" })
  .execute();
```

### Chroma (Vector Database)
```javascript
import { QueryBuilder } from "@querybuilder/core";
import { Chroma } from "@querybuilder/chroma";
import config from "./config.js";

const chroma = config.databases.Chroma;
const qb = new QueryBuilder(Chroma).driver(chroma.driver, chroma.params);

// Búsqueda semántica con embeddings
await qb.collection("documents")
  .add({
    ids: ["doc1", "doc2"],
    documents: ["The cat sat on the mat", "The dog ran in the park"],
    metadatas: [{ type: "story" }, { type: "adventure" }]
  })
  .execute();

// Búsqueda por similitud
const results = await qb.collection("documents")
  .query({
    query_texts: ["pet on furniture"],
    n_results: 5
  })
  .execute();
```

## 📋 **API Unificada**

El QueryBuilder proporciona una interfaz consistente para múltiples paradigmas de bases de datos:

### Paradigmas Soportados

| Paradigma | Bases de Datos | Caso de Uso |
|-----------|----------------|-------------|
| **SQL Relacional** | MySQL, PostgreSQL, SQLite | Aplicaciones CRUD tradicionales |
| **NoSQL Documento** | MongoDB | Datos semi-estructurados |
| **NoSQL Distribuido** | Cassandra | Big Data, time-series |
| **In-Memory** | Redis | Cache, sesiones, pub/sub |
| **Vector Database** | Chroma | IA, búsqueda semántica |

### API Consistente

| Operación | SQL | NoSQL | Distribuido | Vector |
|-----------|-----|-------|-------------|--------|
| **Insertar** | `.table("users").insert({...})` | `.collection("users").insert({...})` | `.table("events").insert({...})` | `.collection("docs").add({...})` |
| **Consultar** | `.table("users").select("*")` | `.collection("users").select()` | `.table("events").select()` | `.collection("docs").query({...})` |
| **Filtrar** | `.where("name", "Juan")` | `.where("name", "Juan")` | `.where("user_id", "uuid")` | `.where({type: "story"})` |
| **Actualizar** | `.table("users").update({...})` | `.collection("users").update({...})` | `.table("events").update({...})` | `.collection("docs").update({...})` |
| **Eliminar** | `.table("users").delete()` | `.collection("users").delete()` | `.table("events").delete()` | `.collection("docs").delete()` |

## 🏗️ **Arquitectura Modular**

```
@querybuilder/
├── core/           → Base fundamental y tipos
├── mysql/          → Adaptador MySQL/MariaDB
├── postgresql/     → Adaptador PostgreSQL  
├── mongodb/        → Adaptador MongoDB
├── cassandra/      → Adaptador Cassandra (distribuida)
├── redis/          → Adaptador Redis (in-memory)
├── sqlite/         → Adaptador SQLite (embebida)
└── chroma/         → Adaptador Chroma (vector DB)
```

### Paradigmas por Módulo:
- **🗄️ SQL**: `mysql`, `postgresql`, `sqlite` - Bases relacionales
- **📄 NoSQL Documento**: `mongodb` - Datos semi-estructurados  
- **🌐 NoSQL Distribuido**: `cassandra` - Big Data, alta disponibilidad
- **⚡ In-Memory**: `redis` - Cache, sesiones, tiempo real
- **🧠 Vector**: `chroma` - IA, embeddings, búsqueda semántica

### Beneficios de la Arquitectura Modular:
- **🚀 Bundles más pequeños**: Solo importa lo que usas
- **🔧 Mantenimiento fácil**: Cada base de datos es independiente
- **📈 Escalabilidad**: Agrega nuevos adaptadores fácilmente
- **🧪 Testing**: Prueba cada módulo por separado

## 🎯 **Casos de Uso por Paradigma**

### 🏢 **Aplicaciones Empresariales**
```bash
# Stack tradicional con PostgreSQL + Redis
npm install @querybuilder/core @querybuilder/postgresql @querybuilder/redis
```
- **PostgreSQL**: Datos transaccionales, reportes, ACID
- **Redis**: Sesiones de usuario, cache de consultas, rate limiting

### 📊 **Analytics y Big Data**
```bash
# Stack de análiticas con Cassandra + Chroma
npm install @querybuilder/core @querybuilder/cassandra @querybuilder/chroma
```
- **Cassandra**: Time-series, eventos, logs distribuidos
- **Chroma**: Análisis semántico, recomendaciones IA

### 🚀 **Aplicaciones Modernas**
```bash
# Stack híbrido completo
npm install @querybuilder/core @querybuilder/postgresql @querybuilder/mongodb @querybuilder/redis
```
- **PostgreSQL**: Datos críticos (usuarios, transacciones)
- **MongoDB**: Contenido dinámico (posts, comentarios)
- **Redis**: Cache, cola de trabajos, notificaciones

### 📱 **Aplicaciones Móviles/Desktop**
```bash
# Stack embebido ligero
npm install @querybuilder/core @querybuilder/sqlite @querybuilder/redis
```
- **SQLite**: Base de datos local offline-first
- **Redis**: Sincronización y cache cuando hay conexión

### 🤖 **Aplicaciones de IA**
```bash
# Stack especializado en IA
npm install @querybuilder/core @querybuilder/chroma @querybuilder/postgresql @querybuilder/redis
```
- **Chroma**: Vectores y embeddings para ML
- **PostgreSQL**: Metadatos y configuración de modelos
- **Redis**: Cache de inferencias y resultados

## 🛠️ **Desarrollo**

### Requisitos
- Node.js ≥ 16.0.0
- npm, yarn o pnpm

### Setup Local
```bash
# Clonar repositorio
git clone https://github.com/mellambias/querybuilder.git
cd querybuilder

# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Build distribución NPM
npm run build:dist
```

### Scripts Disponibles
```bash
npm run test          # Ejecutar todos los tests
npm run build:dist    # Construir distribución NPM
npm run test:dist     # Probar distribución localmente
npm run pack:all      # Crear archivos .tgz
npm run publish:all   # Publicar a NPM
```

## 📚 **Documentación**

### 📖 **Documentación API Interactiva**
La documentación completa de la API se genera automáticamente usando **JSDoc + Docdash**:

```bash
# Modo desarrollo: Servidor + Auto-regeneración
pnpm run docs:dev       # Recomendado para desarrollo

# O comandos individuales:
pnpm run docs:jsdoc     # Generar documentación
pnpm run docs:serve     # Servir en http://localhost:3000
```

Abre tu navegador en **http://localhost:3000** para ver la documentación completa.

**Comandos disponibles:**
- `docs:dev` - Servidor + auto-regeneración (modo desarrollo completo)
- `docs:jsdoc` - Generar documentación una vez
- `docs:serve` - Solo servidor HTTP (sin regeneración)
- `docs:jsdoc-watch` - Solo watch (regenera pero no sirve)

**Características de la documentación:**
- ✅ Búsqueda integrada y rápida
- ✅ Navegación lateral interactiva
- ✅ Syntax highlighting en ejemplos de código
- ✅ Enlaces cruzados entre clases y métodos
- ✅ Información completa de tipos y parámetros
- ✅ Ejemplos de código en cada método

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas! Por favor lee nuestro [código de conducta](./CODE_OF_CONDUCT.md) y [guía de contribución](./CONTRIBUTING.md).

### Proceso de Contribución:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 👤 **Autor**

**mellambias** - [mellambias](https://github.com/mellambias)


---

**¿Problemas o sugerencias?** [Abre un issue](https://github.com/mellambias/querybuilder/issues) 

**¿Te gusta el proyecto?** ⭐ ¡Dale una estrella al repositorio!
