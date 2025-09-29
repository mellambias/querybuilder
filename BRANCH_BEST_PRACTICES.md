# 🌳 Guía de Mejores Prácticas - Selección de Rama Adecuada

## 🎯 **Regla de Oro: Siempre Verificar Antes de Trabajar**

Antes de realizar cualquier trabajo en el proyecto, **SIEMPRE** verifica que estés en la rama correcta para evitar commits en rama incorrecta y conflictos.

## 🔍 **Verificación Rápida**

### Comando Básico
```bash
git branch --show-current
```

### Con Scripts de Verificación
```bash
# Verificar que estamos en rama correcta para PostgreSQL
.\verify-branch.bat postgresql

# Verificar para otros módulos
.\verify-branch.bat core
.\verify-branch.bat mysql
.\verify-branch.bat mongodb
.\verify-branch.bat main
```

## 📋 **Workflow Recomendado**

### 1. **Antes de Empezar Cualquier Trabajo**
```bash
# PASO 1: Verificar rama actual
git branch --show-current

# PASO 2: Verificar que es la correcta para el módulo
.\verify-branch.bat [módulo]

# PASO 3: Si no es correcta, cambiar
.\switch-module.bat [módulo]

# PASO 4: Verificar nuevamente
.\verify-branch.bat [módulo]
```

### 2. **Al Cambiar de Tareas**
```bash
# Si cambias de PostgreSQL a MySQL
.\switch-module.bat mysql
.\verify-branch.bat mysql

# Si cambias de módulo específico a integración
.\switch-module.bat integration
.\verify-branch.bat integration
```

### 3. **Antes de Cada Commit**
```bash
# SIEMPRE verificar antes de commit
.\verify-branch.bat [módulo_esperado]
git status
git add .
git commit -m "..."
```

## 🎨 **Mapeo de Trabajo vs Rama**

| Tipo de Trabajo | Rama Correcta | Comando |
|------------------|---------------|---------|
| **Desarrollo PostgreSQL** | `module/postgresql` | `.\switch-module.bat postgresql` |
| **Desarrollo MySQL** | `module/mysql` | `.\switch-module.bat mysql` |
| **Desarrollo MongoDB** | `module/mongodb` | `.\switch-module.bat mongodb` |
| **Desarrollo Core** | `module/core` | `.\switch-module.bat core` |
| **Features transversales** | `feature/integration` | `.\switch-module.bat integration` |
| **Integración final** | `main` | `.\switch-module.bat main` |
| **Releases** | `main` | `.\switch-module.bat main` |

## ⚡ **Comandos de Verificación por Contexto**

### Desarrollo PostgreSQL
```bash
# Antes de trabajar en PostgreSQL
.\verify-branch.bat postgresql

# Si falla, cambiar
.\switch-module.bat postgresql

# Verificar directorio correcto
ls packages/@querybuilder/postgresql/
```

### Desarrollo Core
```bash
# Antes de trabajar en Core
.\verify-branch.bat core

# Si falla, cambiar  
.\switch-module.bat core

# Verificar directorio correcto
ls packages/@querybuilder/core/
```

### Integración General
```bash
# Antes de trabajar en features transversales
.\verify-branch.bat integration

# Si falla, cambiar
.\switch-module.bat integration
```

## 🚨 **Señales de Rama Incorrecta**

### ❌ **Síntomas de Estar en Rama Incorrecta**
- Intentas editar archivos que "no existen"
- Los cambios no se reflejan donde esperas
- Git muestra archivos inesperados en `git status`
- Los tests fallan de manera inexplicable
- Las importaciones no funcionan

### ✅ **Cómo Diagnosticar**
```bash
# 1. Verificar rama actual
git branch --show-current

# 2. Verificar archivos en directorio actual
ls packages/@querybuilder/

# 3. Verificar estado del repositorio
git status

# 4. Usar script de verificación
.\verify-branch.bat [módulo_que_crees_necesitar]
```

## 🔧 **Corrección de Errores Comunes**

### Error: "Archivo no encontrado"
```bash
# Probablemente estás en rama incorrecta
git branch --show-current

# Cambiar a rama correcta
.\switch-module.bat [módulo_correcto]
```

### Error: "Cambios en archivos inesperados"
```bash
# Verificar qué archivos han cambiado
git status

# Si no son del módulo actual, probablemente rama incorrecta
.\verify-branch.bat [módulo_esperado]
```

### Error: "Commit en rama incorrecta"
```bash
# Si ya hiciste commit en rama incorrecta
git log --oneline -1  # Ver último commit

# Opción 1: Mover commit a rama correcta (avanzado)
git cherry-pick [commit-hash]

# Opción 2: Revertir y empezar en rama correcta
git reset --soft HEAD~1
.\switch-module.bat [rama_correcta]
git add .
git commit -m "..."
```

## 📝 **Checklist Pre-Trabajo**

### ✅ **Antes de Cada Sesión de Desarrollo**
- [ ] Verificar rama actual: `git branch --show-current`
- [ ] Confirmar rama correcta: `.\verify-branch.bat [módulo]`
- [ ] Si es incorrecta, cambiar: `.\switch-module.bat [módulo]`
- [ ] Verificar directorio de trabajo correcto
- [ ] Sincronizar con cambios remotos: `git pull`

### ✅ **Antes de Cada Commit**
- [ ] Verificar rama: `.\verify-branch.bat [módulo]`
- [ ] Revisar archivos modificados: `git status`
- [ ] Confirmar que archivos son del módulo correcto
- [ ] Commit con mensaje descriptivo

### ✅ **Al Cambiar de Tarea**
- [ ] Commit o stash cambios actuales
- [ ] Cambiar a rama correcta: `.\switch-module.bat [nuevo_módulo]`
- [ ] Verificar cambio: `.\verify-branch.bat [nuevo_módulo]`
- [ ] Continuar con nueva tarea

## 🎯 **Ejemplos Prácticos**

### Ejemplo 1: Trabajando en Tests PostgreSQL
```bash
# CORRECTO
.\verify-branch.bat postgresql          # ✅ Verificar primero
cd packages/@querybuilder/postgresql   # ✅ Ir al directorio correcto
node test/index.test.js                 # ✅ Ejecutar tests

# INCORRECTO
node test/index.test.js                 # ❌ Sin verificar rama
```

### Ejemplo 2: Desarrollando Feature PostgreSQL
```bash
# CORRECTO
.\verify-branch.bat postgresql                    # ✅ Verificar rama
git checkout -b feature/postgresql-new-feature   # ✅ Crear feature branch
# ... desarrollo ...
git commit -m "feat(postgresql): ..."            # ✅ Commit en rama correcta

# INCORRECTO  
git checkout -b feature/postgresql-new-feature   # ❌ Sin verificar rama base
```

### Ejemplo 3: Cambiando Entre Módulos
```bash
# CORRECTO
.\verify-branch.bat postgresql    # ✅ Verificar estado actual
.\switch-module.bat mysql         # ✅ Cambiar a MySQL
.\verify-branch.bat mysql         # ✅ Verificar cambio exitoso

# INCORRECTO
git checkout module/mysql         # ❌ Cambio manual sin verificación
```

---

## 🎊 **Resumen de la Regla de Oro**

**🌳 SIEMPRE verifica la rama antes de trabajar:**

```bash
# Tu mantra diario de desarrollo
.\verify-branch.bat [módulo]

# Si falla:
.\switch-module.bat [módulo]
.\verify-branch.bat [módulo]

# Solo entonces: ¡a trabajar!
```

**💡 Recuerda: 5 segundos de verificación te ahorran horas de problemas.**