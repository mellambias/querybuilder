# Guías de Uso

Documentación y tutoriales para aprovechar al máximo QueryBuilder.

## 🚀 Empezar

### [Inicio Rápido](/guides/getting-started)
Aprende a instalar y usar QueryBuilder en pocos minutos. Incluye ejemplos básicos para cada tipo de base de datos.

**Lo que aprenderás:**
- Instalación y configuración básica
- Primeros pasos con consultas simples
- Ejemplos para MySQL, PostgreSQL y MongoDB

---

## ⚙️ Configuración

### [Configuración](/guides/configuration)
Guía completa de todas las opciones de configuración disponibles.

**Lo que aprenderás:**
- Configuración de conexión por base de datos
- Variables de entorno
- Configuración de pools de conexión
- SSL/TLS y seguridad
- Logging y debugging

---

## 💡 Ejemplos Prácticos

### [Ejemplos](/guides/examples)
Colección de ejemplos prácticos para casos de uso comunes.

**Lo que aprenderás:**
- Consultas SELECT avanzadas
- Operaciones INSERT, UPDATE, DELETE
- JOINs y subconsultas
- Casos de uso específicos (e-commerce, blog, analytics)
- Ejemplos NoSQL con MongoDB

---

## 🔌 Adaptadores

### [Adaptadores](/guides/adapters)
Guía detallada de todos los adaptadores de base de datos disponibles.

**Lo que aprenderás:**
- Comparación de adaptadores
- Configuración específica por base de datos
- Funciones y características especiales
- Cómo elegir el adaptador correcto

---

## 📚 Recursos Adicionales

### Documentación de API
- **[API Reference](/api/)** - Documentación completa de métodos
- **[QueryBuilder Class](/api/querybuilder)** - Clase principal
- **[DDL Methods](/api/ddl)** - Data Definition Language
- **[DML Methods](/api/dml)** - Data Manipulation Language
- **[DQL Methods](/api/dql)** - Data Query Language

### Soporte y Comunidad
- **[GitHub Repository](https://github.com/mellambias/querybuilder)** - Código fuente
- **[Issues](https://github.com/mellambias/querybuilder/issues)** - Reportar problemas
- **[Discussions](https://github.com/mellambias/querybuilder/discussions)** - Preguntas y discusión

## 🎯 Flujo de Aprendizaje Recomendado

1. **[Inicio Rápido](/guides/getting-started)** - Configuración básica
2. **[Ejemplos](/guides/examples)** - Casos prácticos
3. **[Configuración](/guides/configuration)** - Opciones avanzadas  
4. **[Adaptadores](/guides/adapters)** - Especialización por BD
5. **[API Reference](/api/)** - Consulta de métodos específicos

---

## ⚡ Inicio Rápido

Si es tu primera vez con QueryBuilder, te recomendamos empezar aquí:

```javascript
// 1. Instalar
npm install @querybuilder/core @querybuilder/mysql

// 2. Configurar
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';

const qb = new QueryBuilder(MySQL, {
  host: 'localhost',
  database: 'myapp',
  username: 'user',
  password: 'password'
});

// 3. Usar
const users = qb
  .select('*')
  .from('users')
  .where('active = 1')
  .execute();
```

**[Continuar con el tutorial completo →](/guides/getting-started)**