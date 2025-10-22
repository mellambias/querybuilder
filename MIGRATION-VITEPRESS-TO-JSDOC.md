# Migración de VitePress a JSDoc Standalone


## 📋 Resumen de Cambios

Este documento describe la migración de VitePress a un sistema de documentación basado únicamente en JSDoc + Docdash.

## 🎯 Motivación

VitePress presentaba problemas de configuración y conflictos de enrutamiento. Se decidió simplificar la documentación usando solo JSDoc con un servidor HTTP simple.

## ✅ Cambios Realizados

### 1. Nueva Estructura de Directorios

**Antes:**
```
docs-vitepress/
├── .vitepress/
│   └── config.mjs
├── api/
│   └── index.md
└── public/
    └── api-jsdoc/    # Documentación JSDoc oculta
```

**Después:**
```
docs/
├── README.md         # Guía de uso de la documentación
└── jsdoc/           # Documentación JSDoc principal
    ├── index.html
    ├── QueryBuilder.html
    ├── Column.html
    └── ...
```

### 2. Archivos Creados

- ✅ `serve-docs-jsdoc.mjs` - Servidor HTTP simple para la documentación
- ✅ `docs/README.md` - Guía de uso de la documentación
- ✅ Actualizado `scripts/generate-jsdoc-docdash.mjs` - Eliminadas referencias a VitePress

### 3. Archivos Modificados

#### `jsdoc.config.json`
```diff
- "destination": "docs-vitepress/public/jsdoc"
+ "destination": "docs/jsdoc"
```

#### `package.json`
```diff
- "docs:dev": "cd docs-vitepress && npm run dev",
- "docs:serve": "cd docs-vitepress && npm run dev",
- "docs:build": "cd docs-vitepress && npm run build",
- "docs:preview": "cd docs-vitepress && npm run preview",
- "docs:watch": "nodemon",
- "docs:full": "node scripts/start-full-system.mjs",
+ "docs:serve": "node serve-docs-jsdoc.mjs",
+ "docs:dev": "node serve-docs-jsdoc.mjs",
```

#### `README.md`
- Actualizada la sección de documentación
- Nuevos comandos para generar y servir JSDoc
- URLs actualizadas

### 4. Scripts NPM Actualizados

```bash
# Generar documentación
pnpm run docs:jsdoc         # o pnpm run docs:generate

# Servir documentación (puerto 3000)
pnpm run docs:serve         # o pnpm run docs:dev

# Modo watch (regenera al cambiar archivos)
pnpm run docs:jsdoc-watch
```

## 🌐 Acceso a la Documentación

### Desarrollo Local
```bash
pnpm run docs:serve
```
Abre: **http://localhost:3000**

### Archivo Estático
Abre directamente: `docs/jsdoc/index.html`

## 📦 Dependencias

### Eliminables (si decides limpiar completamente)
- `vitepress`
- `vue`

### Mantenidas
- `jsdoc`
- `docdash`
- `fs-extra`

## 🗑️ Archivos/Directorios para Eliminar (Opcional)

Si quieres limpiar completamente VitePress:

```bash
# Directorio completo de VitePress
rm -rf docs-vitepress/

# Scripts relacionados con VitePress
rm serve-docs.mjs
rm serve-docs-es.mjs
rm scripts/start-full-system.mjs
rm scripts/generate-docs-auto.mjs

# Archivos de configuración antiguos (si existen)
rm -rf docs/         # Solo si está vacío o contiene archivos antiguos
```

## ✨ Ventajas del Nuevo Sistema

1. **Más Simple**: Un solo sistema de documentación
2. **Más Rápido**: Servidor HTTP simple, sin build step
3. **Sin Conflictos**: No hay enrutamiento complejo
4. **Standalone**: La documentación funciona sin servidor (abrir HTML)
5. **Mejor Rendimiento**: Arranque instantáneo del servidor
6. **Mantenible**: Menos configuración, menos problemas

## 🔄 Rollback (Si es Necesario)

Si necesitas volver a VitePress:

1. Restaurar `package.json` scripts
2. Cambiar `jsdoc.config.json` destination a `docs-vitepress/public/jsdoc`
3. Iniciar VitePress: `cd docs-vitepress && npm run dev`

## 📝 Notas

- El servidor HTTP simple (`serve-docs-jsdoc.mjs`) es solo para desarrollo
- Para producción, considera servir `docs/jsdoc/` como archivos estáticos
- La documentación JSDoc es standalone y no requiere build
- Todos los enlaces internos en JSDoc funcionan correctamente

---

*Fecha de migración: 20 de octubre de 2025*
