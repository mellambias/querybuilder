# Guía de Contribución

¡Gracias por tu interés en contribuir al QueryBuilder Universal! 🎉

## 🚀 Cómo Contribuir

### 1. Fork y Clonar
```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/querybuilder.git
cd querybuilder
```

### 2. Configurar Entorno de Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar tests para verificar setup
npm test
```

### 3. Crear Rama para tu Feature
```bash
git checkout -b feature/mi-nueva-caracteristica
# o
git checkout -b fix/corregir-bug
```

### 4. Desarrollar y Probar
```bash
# Desarrolla tu feature...

# Ejecutar tests
npm test

# Verificar que la distribución funciona
npm run build:dist
npm run test:dist
```

### 5. Commit y Push
```bash
git add .
git commit -m "feat: agregar nueva característica increíble"
git push origin feature/mi-nueva-caracteristica
```

### 6. Crear Pull Request
- Ve a GitHub y crea un Pull Request
- Describe claramente qué cambios hiciste
- Agrega tests si es necesario

## 📝 Convenciones de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar soporte para Oracle Database
fix: corregir bug en PostgreSQL driver
docs: actualizar README con ejemplos
test: agregar tests para MongoDB adapter
refactor: mejorar estructura de archivos
```

## 🧪 Tests

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests específicos
npm test -- test/postgres.test.js
```

### Escribir Tests
- Agrega tests para cualquier funcionalidad nueva
- Los tests deben estar en la carpeta `test/`
- Usa nombres descriptivos para los tests

```javascript
// Ejemplo de test
import { test } from 'node:test';
import assert from 'node:assert';

test('QueryBuilder should create valid SQL', () => {
  const qb = new QueryBuilder(MySQL);
  const sql = qb.table('users').select('*').toString();
  assert.strictEqual(sql, 'SELECT * FROM users');
});
```

## 📁 Estructura del Proyecto

```
QueryBuilder/
├── packages/@querybuilder/     # Packages NPM
│   ├── core/                   # Core universal
│   ├── mysql/                  # Adapter MySQL
│   ├── postgresql/             # Adapter PostgreSQL
│   └── mongodb/                # Adapter MongoDB
├── src/                        # Código fuente de desarrollo
├── test/                       # Tests
├── dist/                       # Distribución NPM (generada)
└── examples/                   # Ejemplos de uso
```

## 🎯 Tipos de Contribuciones

### 🐛 Bug Fixes
- Reporta bugs abriendo un issue
- Incluye pasos para reproducir el bug
- Agrega tests que fallen antes de tu fix

### ✨ Nuevas Características
- Abre un issue primero para discutir la feature
- Asegúrate de que es consistente con la API
- Agrega documentación y tests

### 📚 Documentación
- Mejoras al README
- Ejemplos de código
- Comentarios en el código
- Documentación de APIs

### 🏗️ Nuevos Adaptadores de Base de Datos
¿Quieres agregar soporte para una nueva base de datos?

1. Crea un nuevo package en `packages/@querybuilder/nueva-db/`
2. Implementa las interfaces requeridas del core
3. Agrega tests específicos
4. Actualiza el build script
5. Documenta el nuevo adapter

## 🔍 Code Review

### Criterios de Aceptación:
- ✅ Los tests pasan
- ✅ Código bien documentado
- ✅ Sigue las convenciones del proyecto
- ✅ No rompe la API existente
- ✅ Incluye tests para nueva funcionalidad

### Proceso:
1. Un mantenedor revisará tu PR
2. Puede solicitar cambios
3. Una vez aprobado, se mergea

## 🎨 Estilo de Código

### JavaScript/ES6+
- Usa ES6+ features (import/export, arrow functions, etc.)
- Usa nombres descriptivos para variables y funciones
- Prefiere funciones puras cuando sea posible

### Comentarios
```javascript
/**
 * Creates a new QueryBuilder instance
 * @param {Object} dialect - Database dialect (MySQL, PostgreSQL, etc.)
 * @returns {QueryBuilder} New QueryBuilder instance
 */
constructor(dialect) {
  this.dialect = dialect;
}
```

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/bdinfogestio/querybuilder/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/bdinfogestio/querybuilder/discussions)
- **Email**: mellambias@gmail.com

## 🙏 Reconocimiento

Todos los contribuidores serán reconocidos en:
- README principal
- Release notes
- Contributors list

¡Gracias por hacer que QueryBuilder sea mejor! 🚀