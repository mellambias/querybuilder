# QueryBuilder - Documentación

Esta carpeta contiene la documentación completa de la API de QueryBuilder, generada automáticamente con **JSDoc + Docdash**.

## 📚 Documentación Disponible

### JSDoc HTML (Recomendado)

Documentación interactiva completa con búsqueda, navegación y ejemplos de código.

**Ubicación:** `docs/jsdoc/index.html`

## 🚀 Ver la Documentación

### Opción 1: Modo Desarrollo (Recomendado)

Servidor con auto-regeneración al cambiar archivos:

```bash
# Inicia el servidor Y regenera automáticamente la documentación
pnpm run docs:dev
# o
pnpm run docs:watch
```

Abre tu navegador en: **http://localhost:3000**

Los cambios en los archivos `.js` regenerarán automáticamente la documentación.

### Opción 2: Servidor Solo (sin watch)

```bash
# Generar documentación una vez
pnpm run docs:jsdoc

# Servir en http://localhost:3000
pnpm run docs:serve
```

### Opción 3: Abrir directamente

Abre el archivo `docs/jsdoc/index.html` directamente en tu navegador.

## 🔄 Regenerar Documentación

```bash
# Generar una vez
pnpm run docs:jsdoc

# Solo watch (regenera al cambiar archivos, pero NO sirve)
pnpm run docs:jsdoc-watch

# Watch + Servidor (regenera Y sirve)
pnpm run docs:dev
```

## 📖 Estructura de la Documentación

```
docs/
├── README.md           # Este archivo
└── jsdoc/             # Documentación HTML generada
    ├── index.html     # Página principal
    ├── QueryBuilder.html
    ├── Column.html
    ├── Core.html
    ├── Driver.html
    ├── Transaction.html
    ├── Cursor.html
    ├── Expresion.html
    ├── Value.html
    └── ...            # Otros archivos generados
```

## ✨ Características

- ✅ **Búsqueda integrada** - Encuentra cualquier método o clase rápidamente
- ✅ **Navegación lateral** - Acceso rápido a todas las clases y módulos
- ✅ **Syntax highlighting** - Código con resaltado de sintaxis
- ✅ **Enlaces cruzados** - Referencias automáticas entre métodos y clases
- ✅ **Ejemplos de código** - Ejemplos de uso en cada método
- ✅ **Tipos de datos** - Información completa de parámetros y valores de retorno

## 🛠️ Tecnologías

- **JSDoc 4.x** - Generador de documentación
- **Docdash 2.x** - Tema moderno y limpio
- **Node.js HTTP Server** - Servidor simple para desarrollo

## 📝 Nota

Esta documentación se genera automáticamente desde los comentarios JSDoc en el código fuente.
Para mantenerla actualizada, asegúrate de documentar bien tu código con comentarios JSDoc.

---

*Para más información sobre cómo contribuir a la documentación, consulta el archivo CONTRIBUTING.md en la raíz del proyecto.*
