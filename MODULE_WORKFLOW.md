# 🌳 QueryBuilder - Workflow de Desarrollo Modular

## 🚀 Inicio Rápido

### Cambiar entre Módulos

```bash
# Usar script batch (Windows)
.\switch-module.bat postgresql   # Cambiar a PostgreSQL
.\switch-module.bat mysql        # Cambiar a MySQL  
.\switch-module.bat mongodb      # Cambiar a MongoDB
.\switch-module.bat core         # Cambiar a Core
.\switch-module.bat main         # Cambiar a rama principal
.\switch-module.bat list         # Ver estado de ramas

# O usar Git directamente
git checkout module/postgresql
git checkout module/mysql
git checkout module/mongodb
git checkout module/core
git checkout main
```

## 📋 Ejemplos de Workflow

### 1. Desarrollar Feature en PostgreSQL

```bash
# 1. Cambiar a módulo PostgreSQL
.\switch-module.bat postgresql

# 2. Crear rama de feature
git checkout -b feature/postgresql-array-improvements

# 3. Desarrollar la feature
# Editar archivos en packages/@querybuilder/postgresql/

# 4. Commitear cambios
git add .
git commit -m "feat(postgresql): Improve array operations with new helpers"

# 5. Merge a rama del módulo
git checkout module/postgresql
git merge feature/postgresql-array-improvements

# 6. Limpiar rama temporal
git branch -d feature/postgresql-array-improvements
```

### 2. Fix Urgente en Core

```bash
# 1. Cambiar a módulo Core
.\switch-module.bat core

# 2. Crear rama de fix
git checkout -b fix/core-query-chaining

# 3. Aplicar fix
# Editar archivos en packages/@querybuilder/core/

# 4. Commitear fix
git add .
git commit -m "fix(core): Resolve query chaining memory leak"

# 5. Merge directo a módulo
git checkout module/core  
git merge fix/core-query-chaining

# 6. Merge a main si es crítico
git checkout main
git merge module/core
```

### 3. Integración de Módulos

```bash
# 1. Cambiar a rama de integración
git checkout feature/integration

# 2. Mergear cambios de módulos
git merge module/postgresql
git merge module/mysql
git merge module/core

# 3. Tests de integración
pnpm test

# 4. Si todo ok, merge a main
git checkout main
git merge feature/integration
```

## 🎯 Estrategia de Commits

### Por Módulo

| Módulo | Prefijo | Ejemplo |
|--------|---------|---------|
| Core | `feat(core):` | `feat(core): Add new query optimization` |
| PostgreSQL | `feat(postgresql):` | `feat(postgresql): Add JSONB path operators` |
| MySQL | `feat(mysql):` | `feat(mysql): Add MySQL 8.0 window functions` |
| MongoDB | `feat(mongodb):` | `feat(mongodb): Optimize aggregation pipeline` |

### Tipos de Commit

- **`feat`** - Nueva funcionalidad
- **`fix`** - Corrección de bug
- **`docs`** - Documentación
- **`refactor`** - Refactoring
- **`test`** - Tests
- **`chore`** - Mantenimiento

## 📊 Estado Actual de Módulos

### ✅ PostgreSQL (module/postgresql)
- **Estado**: Optimizado y completo
- **Features**: JSON/JSONB, Arrays, CTEs, Window Functions, UPSERT
- **Estructura**: Consolidada (types.js, operators.js, functions.js, features.js)
- **Última actualización**: Sept 29, 2025

### 🔄 Core (module/core) 
- **Estado**: Estable
- **Features**: SQL2006 estándar, query building básico
- **Estructura**: Motor principal
- **Próximos**: Optimizaciones de rendimiento

### 🚧 MySQL (module/mysql)
- **Estado**: Pendiente optimización
- **Features**: MySQL básicas
- **Estructura**: Necesita consolidación similar a PostgreSQL
- **Próximos**: Aplicar misma estrategia que PostgreSQL

### 🚧 MongoDB (module/mongodb)
- **Estado**: Pendiente optimización  
- **Features**: NoSQL básicas
- **Estructura**: Necesita consolidación
- **Próximos**: Optimizar aggregation pipeline

## 🔄 Flujos de Trabajo Comunes

### Sincronizar módulo con main

```bash
# En la rama del módulo
git checkout module/postgresql
git merge main
```

### Ver diferencias entre módulos

```bash
git diff module/postgresql..module/mysql
git diff main..module/postgresql
```

### Crear feature branch

```bash
git checkout module/postgresql
git checkout -b feature/postgresql-new-feature
```

### Merge feature a módulo

```bash
git checkout module/postgresql
git merge feature/postgresql-new-feature
git branch -d feature/postgresql-new-feature
```

## 🛠️ Comandos Útiles

### Estado de repositorio
```bash
git status                    # Estado actual
git branch                    # Listar ramas locales
git branch -a                 # Listar todas las ramas
git log --oneline -5          # Últimos 5 commits
```

### Comparaciones
```bash
git diff HEAD~1               # Diferencias con commit anterior
git diff main                 # Diferencias con main
git show --name-only          # Archivos del último commit
```

### Limpieza
```bash
git branch -d feature/nombre  # Eliminar rama local
git remote prune origin       # Limpiar referencias remotas
git gc                        # Garbage collection
```

## 📝 Checklist de Desarrollo

### Antes de empezar
- [ ] Verificar rama actual: `git branch --show-current`
- [ ] Cambiar a módulo correcto: `.\switch-module.bat [módulo]`
- [ ] Sincronizar con main si es necesario: `git merge main`

### Durante desarrollo
- [ ] Commits frecuentes con mensajes descriptivos
- [ ] Seguir convenciones de commit por módulo
- [ ] Probar cambios localmente

### Antes de merge
- [ ] Tests pasando: `pnpm test`
- [ ] Documentación actualizada
- [ ] Sin conflictos con main
- [ ] Código revisado

### Después de merge
- [ ] Limpiar ramas temporales
- [ ] Actualizar documentación si es necesario
- [ ] Comunicar cambios importantes

---

**🎯 Objetivo**: Facilitar desarrollo independiente de módulos manteniendo la coherencia del proyecto general.