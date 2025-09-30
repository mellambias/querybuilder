# 🧹 **PROPUESTA: Eliminar directorio src/ redundante**

## 📊 **Análisis del Problema**

### **🔍 Situación Actual**
- ✅ Código principal en: `packages/@querybuilder/`
- ❌ Código duplicado en: `src/`
- 🤔 Tests usan: `src/` (desactualizado)
- 📦 Build NPM usa: `packages/` + copia `src/`

### **📏 Comparación de Archivos**
- `src/querybuilder.js`: 1,601 líneas
- `packages/@querybuilder/core/querybuilder.js`: 1,884 líneas
- **Conclusión**: `packages/` tiene versión más reciente

---

## ⚠️ **Problemas Identificados**

### **1. Duplicación de Código**
```
src/querybuilder.js          ←→ packages/@querybuilder/core/querybuilder.js
src/drivers/                 ←→ packages/@querybuilder/*/drivers/
src/sql/MySQL.js             ←→ packages/@querybuilder/mysql/MySQL.js
src/sql/PostgreSQL.js        ←→ packages/@querybuilder/postgresql/PostgreSQL.js
```

### **2. Inconsistencias en Tests**
```javascript
// Tests usan src/ (desactualizado)
import QueryBuilder from "../src/querybuilder.js";
import PostgreSQL from "../src/sql/PostgreSQL.js";

// Pero distribución NPM usa packages/
import { QueryBuilder } from "@querybuilder/core";
import { PostgreSQL } from "@querybuilder/postgresql";
```

### **3. Confusión para Desarrolladores**
- ❓ ¿Cuál es la fuente de verdad?
- ❓ ¿Dónde hacer cambios?
- ❓ ¿Por qué hay dos directorios?

---

## ✅ **Solución Propuesta**

### **PASO 1: Eliminar directorio src/**
```bash
Remove-Item src/ -Recurse -Force
```

### **PASO 2: Actualizar tests para usar packages/**
```javascript
// ❌ Antes
import QueryBuilder from "../src/querybuilder.js";
import PostgreSQL from "../src/sql/PostgreSQL.js";

// ✅ Después
import { QueryBuilder } from "../packages/@querybuilder/core/index.js";
import { PostgreSQL } from "../packages/@querybuilder/postgresql/index.js";
```

### **PASO 3: Actualizar build-npm-dist.js**
```javascript
// ❌ Remover referencia a src/
const filesToCopy = [
  'querybuilder.js', 'core.js', 'column.js', 'expresion.js', 
  'cursor.js', 'transaction.js', 'value.js', 'proxy.js',
  'drivers/', 'results/', 'types/', 'utils/'
  // 'src/' ← ELIMINAR
];
```

### **PASO 4: Actualizar .gitignore si es necesario**

---

## 🎯 **Beneficios de la Limpieza**

### **📉 Reducción de Tamaño**
- **Repositorio**: ~50% más pequeño
- **Carga**: Más rápida
- **Clones**: Más eficientes

### **🧹 Mayor Claridad**
- ✅ Una sola fuente de verdad: `packages/`
- ✅ Estructura consistente
- ✅ Tests actualizados
- ✅ Sin confusión para contribuidores

### **⚡ Mejor Mantenimiento**
- ✅ Cambios en un solo lugar
- ✅ No sincronizar dos versiones
- ✅ Builds más simples

---

## 📋 **Plan de Ejecución**

### **✅ Seguro para Eliminar**
```
src/column.js               → packages/@querybuilder/core/column.js ✅
src/querybuilder.js         → packages/@querybuilder/core/querybuilder.js ✅
src/sql/MySQL.js            → packages/@querybuilder/mysql/MySQL.js ✅
src/sql/PostgreSQL.js       → packages/@querybuilder/postgresql/PostgreSQL.js ✅
src/drivers/                → packages/@querybuilder/*/drivers/ ✅
src/results/                → packages/@querybuilder/*/results/ ✅
```

### **🔧 Archivos a Actualizar**
1. `test/**/*.test.js` - Cambiar imports de src/ a packages/
2. `build-npm-dist.js` - Remover referencia a src/
3. Cualquier documentación que mencione src/

### **⚠️ Precauciones**
- ✅ Hacer backup antes de eliminar
- ✅ Verificar que todos los tests pasen con packages/
- ✅ Confirmar que build funciona sin src/

---

## 🚀 **Resultado Esperado**

```
QueryBuilder/
├── packages/@querybuilder/    ← Única fuente de código
│   ├── core/
│   ├── mysql/
│   ├── postgresql/
│   └── mongodb/
├── test/                      ← Tests usando packages/
├── dist/                      ← Distribución NPM
└── [archivos de configuración]

❌ src/                        ← ELIMINADO
```

**¿Proceder con la eliminación del directorio src/?**