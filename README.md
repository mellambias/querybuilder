# 🚀 QueryBuilder

[![NPM Version](https://img.shields.io/npm/v/@querybuilder/core?style=flat-square)](https://www.npmjs.com/package/@querybuilder/core)
[![License](https://img.shields.io/badge/license-MPL--2.0-blue?style=flat-square)](https://www.mozilla.org/en-US/MPL/2.0/)
[![Build Status](https://img.shields.io/github/workflow/status/mellambias/querybuilder/CI?style=flat-square)](https://github.com/mellambias/querybuilder/actions)

Un **QueryBuilder** que soporta tanto bases de datos **SQL** como **NoSQL** con una API unificada y elegante.

## 🎯 **Características Principales**

✅ **Multi-Database**: MySQL, PostgreSQL, MongoDB  
✅ **API Unificada**: Misma sintaxis para SQL y NoSQL  
✅ **Modular**: Instala solo lo que necesitas  
✅ **TypeScript Ready**: Soporte completo para tipos  
✅ **Fluent Interface**: Sintaxis intuitiva y legible  
✅ **Driver Abstraction**: Cambio fácil entre bases de datos  

## 📦 **Instalación**

### Instalación Selectiva (Recomendado)
```bash
# Solo el core (mínimo)
npm install @querybuilder/core

# Agregar adaptadores específicos
npm install @querybuilder/mysql      # Para MySQL
npm install @querybuilder/postgresql # Para PostgreSQL  
npm install @querybuilder/mongodb    # Para MongoDB
```

### Instalación Completa
```bash
npm install @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb
```

## ⚙️ **Configuración**

### Configurar Base de Datos
```bash
# 1. Copiar template de configuración en el directorio del core
copy config.example.js config.js

# 2. Editar config.js con tus credenciales
# (El archivo config.js está en .gitignore por seguridad)
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

## 📋 **API Unificada**

El QueryBuilder proporciona una interfaz consistente sin importar la base de datos:

| Operación | SQL (MySQL/PostgreSQL) | NoSQL (MongoDB) |
|-----------|----------------------|----------------|
| **Insertar** | `.table("users").insert({...})` | `.collection("users").insert({...})` |
| **Consultar** | `.table("users").select("*")` | `.collection("users").select()` |
| **Filtrar** | `.where("name", "Juan")` | `.where("name", "Juan")` |
| **Actualizar** | `.table("users").update({...})` | `.collection("users").update({...})` |
| **Eliminar** | `.table("users").delete()` | `.collection("users").delete()` |

## 🏗️ **Arquitectura Modular**

```
@querybuilder/
├── core/           → Base fundamental y tipos
├── mysql/          → Adaptador MySQL
├── postgresql/     → Adaptador PostgreSQL  
└── mongodb/        → Adaptador MongoDB
```

### Beneficios de la Arquitectura Modular:
- **🚀 Bundles más pequeños**: Solo importa lo que usas
- **🔧 Mantenimiento fácil**: Cada base de datos es independiente
- **📈 Escalabilidad**: Agrega nuevos adaptadores fácilmente
- **🧪 Testing**: Prueba cada módulo por separado

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

- [**Guía de Inicio**](./docs/getting-started.md)
- [**API Reference**](./docs/api-reference.md)
- [**Ejemplos Avanzados**](./examples/)
- [**Migraciones**](./docs/migrations.md)

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas! Por favor lee nuestro [código de conducta](./CODE_OF_CONDUCT.md) y [guía de contribución](./CONTRIBUTING.md).

### Proceso de Contribución:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo licencia **PROPRIETARY**. Ver [LICENSE](./LICENSE) para términos y condiciones.

**⚠️ IMPORTANTE**: Este software es propietario. No está permitido copiar, modificar, distribuir o crear trabajos derivados sin autorización explícita por escrito.

## 👤 **Autor**

**mellambias** - [mellambias](https://github.com/mellambias)

## 🏆 **Agradecimientos**

Agradecemos a todos los contribuidores que han hecho posible este proyecto.

---

**¿Problemas o sugerencias?** [Abre un issue](https://github.com/mellambias/querybuilder/issues) 

**¿Te gusta el proyecto?** ⭐ ¡Dale una estrella al repositorio!
