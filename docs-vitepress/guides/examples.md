# Ejemplos

Colección de ejemplos prácticos para usar QueryBuilder en diferentes escenarios.

## Consultas SELECT

### Básicas
```javascript
// SELECT simple
const users = qb.select('*').from('users').execute();

// SELECT con columnas específicas
const userNames = qb
  .select('id', 'name', 'email')
  .from('users')
  .execute();

// SELECT con alias
const stats = qb
  .select('COUNT(*) as total', 'AVG(age) as promedio_edad')
  .from('users')
  .execute();
```

### Con WHERE
```javascript
// WHERE simple
const activeUsers = qb
  .select('*')
  .from('users')
  .where('active = 1')
  .execute();

// WHERE múltiple
const filteredUsers = qb
  .select('*')
  .from('users')
  .where('active = 1')
  .where('age >= 18')
  .where('city = "Madrid"')
  .execute();

// WHERE con operadores
const searchUsers = qb
  .select('*')
  .from('users')
  .where('name LIKE "%juan%"')
  .where('age BETWEEN 25 AND 35')
  .execute();
```

### Con JOIN
```javascript
// INNER JOIN
const userPosts = qb
  .select('u.name', 'p.title', 'p.created_at')
  .from('users u')
  .join('posts p', 'u.id = p.user_id')
  .execute();

// LEFT JOIN
const allUsersWithPosts = qb
  .select('u.name', 'COUNT(p.id) as post_count')
  .from('users u')
  .leftJoin('posts p', 'u.id = p.user_id')
  .groupBy('u.id')
  .execute();

// JOIN múltiple
const userPostsComments = qb
  .select('u.name', 'p.title', 'c.content')
  .from('users u')
  .join('posts p', 'u.id = p.user_id')
  .join('comments c', 'p.id = c.post_id')
  .where('p.published = 1')
  .execute();
```

### Con ORDER BY y LIMIT
```javascript
// Ordenación simple
const sortedUsers = qb
  .select('*')
  .from('users')
  .orderBy('name')
  .execute();

// Ordenación múltiple
const complexSort = qb
  .select('*')
  .from('users')
  .orderBy('active DESC', 'name ASC')
  .execute();

// Con límite
const topUsers = qb
  .select('*')
  .from('users')
  .orderBy('score DESC')
  .limit(10)
  .execute();

// Paginación
const page2 = qb
  .select('*')
  .from('users')
  .orderBy('id')
  .limit(20)
  .offset(20)
  .execute();
```

## Operaciones INSERT

### INSERT básico
```javascript
// INSERT simple
const newUser = qb
  .insert('users')
  .values({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    age: 30,
    active: 1
  })
  .execute();
```

### INSERT múltiple
```javascript
// Insertar varios registros
const multipleUsers = qb
  .insert('users')
  .values([
    { name: 'Ana García', email: 'ana@example.com', age: 25 },
    { name: 'Carlos López', email: 'carlos@example.com', age: 32 },
    { name: 'María Rodríguez', email: 'maria@example.com', age: 28 }
  ])
  .execute();
```

### INSERT con subconsulta
```javascript
// INSERT desde SELECT
const copyActiveUsers = qb
  .insert('users_backup')
  .select('name', 'email', 'created_at')
  .from('users')
  .where('active = 1')
  .execute();
```

## Operaciones UPDATE

### UPDATE básico
```javascript
// UPDATE simple
const updateUser = qb
  .update('users')
  .set({ email: 'nuevo@example.com', updated_at: new Date() })
  .where('id = 123')
  .execute();
```

### UPDATE condicional
```javascript
// UPDATE múltiple
const updateInactive = qb
  .update('users')
  .set({ active: 0, deactivated_at: new Date() })
  .where('last_login < "2023-01-01"')
  .execute();
```

### UPDATE con JOIN
```javascript
// UPDATE con JOIN
const updateUserStats = qb
  .update('users u')
  .join('user_stats s', 'u.id = s.user_id')
  .set({ 'u.score': 's.total_points' })
  .where('s.updated_at > "2024-01-01"')
  .execute();
```

## Operaciones DELETE

### DELETE básico
```javascript
// DELETE simple
const deleteUser = qb
  .delete('users')
  .where('id = 123')
  .execute();
```

### DELETE condicional
```javascript
// DELETE múltiple
const deleteInactive = qb
  .delete('users')
  .where('active = 0')
  .where('created_at < "2023-01-01"')
  .execute();
```

## Consultas Avanzadas

### GROUP BY y HAVING
```javascript
// Estadísticas por grupo
const cityStats = qb
  .select('city', 'COUNT(*) as user_count', 'AVG(age) as avg_age')
  .from('users')
  .where('active = 1')
  .groupBy('city')
  .having('COUNT(*) > 10')
  .orderBy('user_count DESC')
  .execute();
```

### Subconsultas
```javascript
// Subconsulta en WHERE
const topUsers = qb
  .select('*')
  .from('users')
  .where('score > (SELECT AVG(score) FROM users)')
  .execute();

// Subconsulta en SELECT
const userWithMaxPost = qb
  .select(
    'name',
    '(SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count'
  )
  .from('users')
  .execute();
```

### UNION
```javascript
// UNION de consultas
const allContent = qb
  .select('title', 'created_at', '"post" as type')
  .from('posts')
  .union()
  .select('name as title', 'created_at', '"user" as type')
  .from('users')
  .orderBy('created_at DESC')
  .execute();
```

## Casos de Uso Específicos

### E-commerce
```javascript
// Productos más vendidos
const bestSellers = qb
  .select('p.name', 'p.price', 'SUM(oi.quantity) as total_sold')
  .from('products p')
  .join('order_items oi', 'p.id = oi.product_id')
  .join('orders o', 'oi.order_id = o.id')
  .where('o.status = "completed"')
  .where('o.created_at >= "2024-01-01"')
  .groupBy('p.id')
  .orderBy('total_sold DESC')
  .limit(10)
  .execute();

// Carrito de compras
const cartTotal = qb
  .select('SUM(p.price * ci.quantity) as total')
  .from('cart_items ci')
  .join('products p', 'ci.product_id = p.id')
  .where('ci.user_id = ?', [userId])
  .execute();
```

### Blog/CMS
```javascript
// Posts con autor y categoría
const blogPosts = qb
  .select('p.title', 'p.excerpt', 'u.name as author', 'c.name as category')
  .from('posts p')
  .join('users u', 'p.author_id = u.id')
  .join('categories c', 'p.category_id = c.id')
  .where('p.published = 1')
  .orderBy('p.published_at DESC')
  .limit(10)
  .execute();

// Comentarios recientes
const recentComments = qb
  .select('c.content', 'u.name', 'p.title')
  .from('comments c')
  .join('users u', 'c.user_id = u.id')
  .join('posts p', 'c.post_id = p.id')
  .where('c.approved = 1')
  .orderBy('c.created_at DESC')
  .limit(5)
  .execute();
```

### Análiticas
```javascript
// Usuarios activos por mes
const monthlyActive = qb
  .select('DATE_FORMAT(created_at, "%Y-%m") as month', 'COUNT(*) as users')
  .from('user_sessions')
  .where('created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)')
  .groupBy('month')
  .orderBy('month')
  .execute();

// Top páginas visitadas
const pageViews = qb
  .select('page', 'COUNT(*) as views', 'COUNT(DISTINCT user_id) as unique_users')
  .from('page_views')
  .where('created_at >= CURDATE()')
  .groupBy('page')
  .orderBy('views DESC')
  .limit(20)
  .execute();
```

## MongoDB (NoSQL)

### Consultas MongoDB
```javascript
// Find básico
const users = qb
  .collection('users')
  .find({ active: true })
  .execute();

// Find con proyección
const userNames = qb
  .collection('users')
  .find({}, { name: 1, email: 1, _id: 0 })
  .execute();

// Agregación
const userStats = qb
  .collection('users')
  .aggregate([
    { $match: { active: true } },
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])
  .execute();
```

## Ver También

- [Configuración](/guides/configuration) - Opciones de configuración
- [API Reference](/api/) - Documentación completa de métodos
- [Adaptadores](/guides/adapters) - Guías específicas por base de datos