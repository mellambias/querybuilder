# 🚀 PNPM Local Development Setup

Guía completa para usar QueryBuilder en desarrollo local con PNPM

## 📋 Características del Sistema

✅ **Minificación completa** - Solo archivos .min.js en distribución  
✅ **Workspace symlinks** - Enlaces simbólicos para desarrollo local  
✅ **File protocol dependencies** - Dependencias locales con protocolo file:  
✅ **Compatibilidad total** - Funciona con npm link, pnpm y file:  
✅ **Exportaciones duales** - Soporte para import default e import nombrado  

## 🛠️ Configuración Inicial

### 1. Construir distribución minificada
```bash
npm run build:dist
```

### 2. Configurar enlaces PNPM
```bash
npm run link:pnpm
```

### 3. Crear proyecto de prueba
```bash
npm run test:pnpm
```

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run link:pnpm` | Crea enlaces PNPM con workspace symlinks |
| `npm run unlink:pnpm` | Elimina enlaces PNPM |
| `npm run test:pnpm` | Crea proyecto de prueba con PNPM |

## 🔧 Uso en Proyecto Local

### Crear nuevo proyecto
```bash
mkdir mi-proyecto
cd mi-proyecto
npm init -y
```

### Instalar QueryBuilder localmente
```json
{
  "dependencies": {
    "@querybuilder/core": "file:../QueryBuilder/dist/@querybuilder/core",
    "@querybuilder/mysql": "file:../QueryBuilder/dist/@querybuilder/mysql",
    "@querybuilder/postgresql": "file:../QueryBuilder/dist/@querybuilder/postgresql",
    "@querybuilder/mongodb": "file:../QueryBuilder/dist/@querybuilder/mongodb",
    "@querybuilder/sqlite": "file:../QueryBuilder/dist/@querybuilder/sqlite",
    "@querybuilder/redis": "file:../QueryBuilder/dist/@querybuilder/redis",
    "@querybuilder/cassandra": "file:../QueryBuilder/dist/@querybuilder/cassandra",
    "@querybuilder/chroma": "file:../QueryBuilder/dist/@querybuilder/chroma"
  }
}
```

### Instalar dependencias
```bash
pnpm install
```

## 💻 Código de Ejemplo

```javascript
// Importación con exportación por defecto
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';
import PostgreSQL from '@querybuilder/postgresql';
import MongoDB from '@querybuilder/mongodb';
import SQLite from '@querybuilder/sqlite';
import Redis from '@querybuilder/redis';
import Cassandra from '@querybuilder/cassandra';
import Chroma from '@querybuilder/chroma';

// Importación con exportación nombrada
import { QueryBuilder } from '@querybuilder/core';
import { MySQL } from '@querybuilder/mysql';
import { PostgreSQL } from '@querybuilder/postgresql';
import { MongoDB } from '@querybuilder/mongodb';
import { SQLite } from '@querybuilder/sqlite';
import { Redis } from '@querybuilder/redis';
import { Cassandra } from '@querybuilder/cassandra';
import { Chroma } from '@querybuilder/chroma';

// Crear instancias - Bases de datos SQL
const mysql = new MySQL();
const postgresql = new PostgreSQL();
const sqlite = new SQLite();

// Crear instancias - Bases de datos NoSQL
const mongodb = new MongoDB();
const redis = new Redis();
const cassandra = new Cassandra();

// Crear instancias - Bases de datos especializadas
const chroma = new Chroma();

// Usar con QueryBuilder
const qb = new QueryBuilder(MySQL);

console.log('✅ QueryBuilder funcionando con PNPM y todos los adaptadores!');
```

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos
```
dist/
├── @querybuilder/core/
│   ├── core.min.js           # Archivo principal minificado
│   ├── core.bundle.min.js    # Bundle UMD para CDN
│   ├── package.json          # Configuración del paquete
│   └── *.min.js             # Archivos auxiliares minificados
├── @querybuilder/mysql/
│   ├── mysql.min.js          # MySQL minificado
│   ├── mysql.bundle.min.js   # Bundle UMD
│   └── package.json
├── @querybuilder/postgresql/
│   ├── postgresql.min.js     # PostgreSQL minificado
│   ├── postgresql.bundle.min.js
│   └── package.json
├── @querybuilder/mongodb/
│   ├── mongodb.min.js        # MongoDB minificado
│   ├── mongodb.bundle.min.js
│   └── package.json
├── @querybuilder/sqlite/
│   ├── sqlite.min.js         # SQLite minificado
│   ├── sqlite.bundle.min.js
│   └── package.json
├── @querybuilder/redis/
│   ├── redis.min.js          # Redis minificado
│   ├── redis.bundle.min.js
│   └── package.json
├── @querybuilder/cassandra/
│   ├── cassandra.min.js      # Cassandra minificado
│   ├── cassandra.bundle.min.js
│   └── package.json
└── @querybuilder/chroma/
    ├── chroma.min.js         # Chroma minificado
    ├── chroma.bundle.min.js
    └── package.json
```

### Sistema de Enlaces PNPM

El script `link-pnpm.js` implementa:

1. **Intento de enlace global**: Usa `pnpm link --global`
2. **Fallback a workspace**: Si falla, crea symlinks en workspace
3. **Verificación automática**: Comprueba que los enlaces funcionen
4. **Limpieza inteligente**: Maneja errores y estados inconsistentes

### Proceso de Minificación

1. **Rollup + Terser**: Minificación agresiva con múltiples pasadas
2. **Preservación de APIs**: Mantiene nombres públicos de funciones
3. **Source maps**: Genera mapas para debugging
4. **Cleanup automático**: Elimina archivos no minificados
5. **Optimización de tamaño**: Compresión gzip y brotli

## 🧪 Testing y Validación

### Test Automático
```bash
cd test-pnpm-install
pnpm test
```

### Verificación Manual
```javascript
// test.js
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';
import PostgreSQL from '@querybuilder/postgresql';
import MongoDB from '@querybuilder/mongodb';
import SQLite from '@querybuilder/sqlite';
import Redis from '@querybuilder/redis';
import Cassandra from '@querybuilder/cassandra';
import Chroma from '@querybuilder/chroma';

console.log('Tipos:', {
  QueryBuilder: typeof QueryBuilder,
  MySQL: typeof MySQL,
  PostgreSQL: typeof PostgreSQL,
  MongoDB: typeof MongoDB,
  SQLite: typeof SQLite,
  Redis: typeof Redis,
  Cassandra: typeof Cassandra,
  Chroma: typeof Chroma
});

// Crear instancias
const mysql = new MySQL();
const postgresql = new PostgreSQL();
const mongodb = new MongoDB();
const sqlite = new SQLite();
const redis = new Redis();
const cassandra = new Cassandra();
const chroma = new Chroma();

console.log('✅ Todas las instancias creadas correctamente');
console.log('✅ 8 adaptadores de bases de datos funcionando');
```

## 🚨 Solución de Problemas

### Error: "Module not found"
- Verificar que `pnpm install` se ejecutó correctamente
- Comprobar rutas en package.json
- Ejecutar `npm run link:pnpm` nuevamente

### Error: "Not a constructor"
- Verificar exportaciones en archivos minificados
- Ejecutar `npm run build:dist` para regenerar
- Comprobar que las exportaciones nombradas existen

### Error: "Cannot resolve dependency"
- Limpiar node_modules: `rm -rf node_modules`
- Reinstalar: `pnpm install`
- Verificar workspace symlinks en node_modules

## 📊 Métricas de Optimización

| Paquete | Original | Minificado | Gzip | Compresión |
|---------|----------|------------|------|------------|
| Core | ~110KB | 35.3KB | 9.6KB | 73% |
| MySQL | ~185KB | 64KB | 16.9KB | 65% |
| PostgreSQL | ~210KB | 67KB | 17.9KB | 68% |
| MongoDB | ~220KB | 72KB | 19.4KB | 67% |
| SQLite | ~95KB | 32KB | 8.5KB | 66% |
| Redis | ~120KB | 38KB | 10.2KB | 68% |
| Cassandra | ~240KB | 78KB | 21KB | 67% |
| Chroma | ~150KB | 48KB | 13KB | 68% |

## 🔄 Flujo de Desarrollo

1. **Desarrollo** → Modificar archivos fuente
2. **Build** → `npm run build:dist`
3. **Link** → `npm run link:pnpm` (solo una vez)
4. **Test** → Usar en proyecto local
5. **Repetir** → Volver al paso 1

## 🎯 Beneficios

- **Desarrollo rápido**: Enlaces instantáneos sin publicar
- **Testing completo**: Pruebas en entorno real
- **Optimización máxima**: Solo archivos minificados
- **Compatibilidad amplia**: Funciona con npm, pnpm y yarn
- **Workflow eficiente**: Scripts automatizados para todo el proceso
