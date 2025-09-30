# 📦 Publicación Local de QueryBuilder

Esta guía explica cómo simular la publicación de QueryBuilder en NPM para usarlo localmente en otros proyectos sin necesidad de publicar en el registro público.

## 🚀 Pasos para Publicación Local

### 1. Construir Distribución Optimizada

```bash
# Construir y minificar todos los paquetes
npm run build:dist
```

Este comando:
- ✅ Minifica todos los archivos JS a `.min.js`
- ✅ Genera bundles UMD para CDN
- ✅ Crea source maps para debugging
- ✅ Limpia archivos no minificados
- ✅ Genera `package.json` optimizados

### 2. Crear Enlaces Locales

```bash
# Crear enlaces globales de todos los paquetes
npm run link:local
```

Este comando detecta automáticamente tu gestor de paquetes (npm/pnpm/yarn) y crea enlaces globales de:
- `@querybuilder/core`
- `@querybuilder/mysql`
- `@querybuilder/postgresql`
- `@querybuilder/mongodb`

### 3. Probar Instalación Local

```bash
# Crear proyecto de prueba
npm run test:local
```

Este comando crea un proyecto de prueba en `test-local-install/` que verifica que todos los paquetes se pueden importar correctamente.

## 🔗 Uso en Otros Proyectos

### Enlazar en Tu Proyecto

```bash
cd tu-proyecto

# NPM
npm link @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb

# PNPM
pnpm link --global @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb

# Yarn
yarn link @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb
```

### Uso en Código

```javascript
// Importar módulos
import { QueryBuilder } from '@querybuilder/core';
import { MySQL } from '@querybuilder/mysql';
import { PostgreSQL } from '@querybuilder/postgresql';
import { MongoDB } from '@querybuilder/mongodb';

// Usar QueryBuilder con MySQL
const mysql = new MySQL();
const query = mysql.select(['id', 'name', 'email'])
  .from('users')
  .where('active', true)
  .orderBy('created_at', 'DESC')
  .limit(10);

console.log(query.toSQL());
// SELECT id, name, email FROM users WHERE active = ? ORDER BY created_at DESC LIMIT 10

// Usar QueryBuilder con PostgreSQL
const postgres = new PostgreSQL();
const pgQuery = postgres.select('*')
  .from('products')
  .where('price', '>', 100)
  .where('category', 'electronics');

console.log(pgQuery.toSQL());

// Usar QueryBuilder con MongoDB
const mongo = new MongoDB();
const mongoQuery = mongo.find({ active: true })
  .sort({ created_at: -1 })
  .limit(10);

console.log(mongoQuery.toObject());
```

## 🧪 Verificar Instalación

### Ejecutar Pruebas

```bash
cd test-local-install
npm test
```

### Ejemplo de Salida Exitosa

```
🧪 Testing local QueryBuilder installation...
✅ Core imported successfully
✅ MySQL imported successfully
✅ PostgreSQL imported successfully
✅ MongoDB imported successfully

🎉 All packages working correctly!
```

## 🗑️ Limpieza

### Remover Enlaces Locales

```bash
# Remover todos los enlaces
npm run unlink:local
```

### Remover Enlaces en Proyecto Específico

```bash
cd tu-proyecto

# NPM
npm unlink @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb

# PNPM
pnpm unlink @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb

# Yarn
yarn unlink @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb
```

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run build:dist` | Construir distribución optimizada |
| `npm run link:local` | Crear enlaces locales |
| `npm run unlink:local` | Remover enlaces locales |
| `npm run test:local` | Crear proyecto de prueba |

## 💡 Ventajas de la Publicación Local

### ✅ Beneficios

- **Sin Publicación Real**: No necesita publicar en NPM público
- **Desarrollo Activo**: Perfecto para desarrollo y testing
- **Optimización Completa**: Archivos minificados para rendimiento
- **Múltiples Proyectos**: Usar en varios proyectos simultáneamente
- **Versionado Local**: Control total sobre las versiones

### 🎯 Casos de Uso

- **Desarrollo de Librerías**: Probar en proyectos reales antes de publicar
- **Empresas**: Usar internamente sin exposición pública
- **Testing**: Verificar compatibilidad en diferentes entornos
- **Demos**: Crear ejemplos y demostraciones

## 🔧 Solución de Problemas

### Problema: "Cannot find module '@querybuilder/core'"

**Solución:**
```bash
# 1. Verificar que la distribución existe
ls dist/@querybuilder/

# 2. Crear enlaces si no existen
npm run link:local

# 3. Enlazar en tu proyecto
npm link @querybuilder/core
```

### Problema: "Package not found during linking"

**Solución:**
```bash
# 1. Reconstruir distribución
npm run build:dist

# 2. Intentar enlace nuevamente
npm run link:local
```

### Problema: Enlaces no funcionan después de reinstalar npm

**Solución:**
```bash
# 1. Limpiar enlaces existentes
npm run unlink:local

# 2. Recrear enlaces
npm run link:local

# 3. Re-enlazar en proyectos
cd tu-proyecto
npm link @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb
```

## 🎉 ¡Listo para Usar!

Con esta configuración, puedes usar QueryBuilder localmente en todos tus proyectos como si estuviera publicado en NPM, pero con control total sobre el código y sin necesidad de publicación real.