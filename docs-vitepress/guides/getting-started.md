# Inicio Rápido

Aprende a usar QueryBuilder en pocos minutos.

## Instalación

### Opción 1: Solo Core (básico)
```bash
npm install @querybuilder/core
```

### Opción 2: Con adaptador específico
```bash
# MySQL
npm install @querybuilder/core @querybuilder/mysql

# PostgreSQL
npm install @querybuilder/core @querybuilder/postgresql

# MongoDB
npm install @querybuilder/core @querybuilder/mongodb
```

## Configuración Básica

### MySQL
```javascript
import QueryBuilder from '@querybuilder/core';
import MySQL from '@querybuilder/mysql';

const qb = new QueryBuilder(MySQL, {
  host: 'localhost',
  port: 3306,
  database: 'myapp',
  username: 'user',
  password: 'password'
});
```

### PostgreSQL
```javascript
import QueryBuilder from '@querybuilder/core';
import PostgreSQL from '@querybuilder/postgresql';

const qb = new QueryBuilder(PostgreSQL, {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  username: 'user',
  password: 'password'
});
```

### MongoDB
```javascript
import QueryBuilder from '@querybuilder/core';
import MongoDB from '@querybuilder/mongodb';

const qb = new QueryBuilder(MongoDB, {
  connectionString: 'mongodb://localhost:27017/myapp'
});
```

## Primer Ejemplo

```javascript
// Consulta SELECT simple
const users = qb
  .select('id', 'name', 'email')
  .from('users')
  .where('active = 1')
  .orderBy('name')
  .execute();

console.log(users);
```

## Ejemplos Comunes

### 1. INSERT
```javascript
const newUser = qb
  .insert('users')
  .values({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    active: 1
  })
  .execute();
```

### 2. UPDATE
```javascript
const updated = qb
  .update('users')
  .set({ email: 'nuevo@example.com' })
  .where('id = 123')
  .execute();
```

### 3. DELETE
```javascript
const deleted = qb
  .delete('users')
  .where('active = 0')
  .execute();
```

### 4. JOIN
```javascript
const userPosts = qb
  .select('u.name', 'p.title', 'p.created_at')
  .from('users u')
  .join('posts p', 'u.id = p.user_id')
  .where('p.published = 1')
  .orderBy('p.created_at DESC')
  .execute();
```

## Próximos Pasos

1. **[Configuración](/guides/configuration)** - Opciones avanzadas
2. **[Ejemplos](/guides/examples)** - Casos de uso comunes
3. **[Adaptadores](/guides/adapters)** - Guía de adaptadores
4. **[API Reference](/api/)** - Documentación completa

## Soporte

- **GitHub:** [https://github.com/mellambias/querybuilder](https://github.com/mellambias/querybuilder)
- **Issues:** [Reportar problema](https://github.com/mellambias/querybuilder/issues)
- **Discusiones:** [GitHub Discussions](https://github.com/mellambias/querybuilder/discussions)