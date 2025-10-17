# DCL - Data Control Language

Los métodos DCL permiten gestionar permisos y control de acceso a la base de datos.

## grant()

Otorga permisos específicos a usuarios o roles.

### Sintaxis

```javascript
queryBuilder.grant(privileges, on, to, options)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `privileges` | `Array\|string` | Privilegios a otorgar |
| `on` | `string` | Objeto sobre el que se otorgan (tabla, base de datos, etc.) |
| `to` | `string` | Usuario o rol destinatario |
| `options` | `Object` | Opciones adicionales |

### Ejemplos

```javascript
// Otorgar permisos SELECT en una tabla
await qb
  .grant(['SELECT'], 'usuarios', 'usuario_lectura@localhost')
  .execute();

// Otorgar múltiples permisos
await qb
  .grant(['SELECT', 'INSERT', 'UPDATE'], 'productos', 'empleado@localhost')
  .execute();

// Otorgar todos los permisos en una base de datos
await qb
  .grant(['ALL PRIVILEGES'], 'tienda.*', 'admin@localhost')
  .withGrantOption()
  .execute();

// Otorgar permisos con contraseña
await qb
  .grant(['SELECT', 'INSERT'], 'pedidos', 'app_user@localhost')
  .identifiedBy('mi_password_seguro')
  .execute();
```

## revoke()

Revoca permisos previamente otorgados.

### Sintaxis

```javascript
queryBuilder.revoke(privileges, on, from, options)
```

### Ejemplos

```javascript
// Revocar permisos específicos
await qb
  .revoke(['INSERT', 'UPDATE'], 'usuarios', 'empleado_temp@localhost')
  .execute();

// Revocar todos los permisos
await qb
  .revoke(['ALL PRIVILEGES'], 'tienda.*', 'ex_empleado@localhost')
  .execute();

// Revocar con cascade para eliminar permisos derivados
await qb
  .revoke(['SELECT'], 'datos_sensibles', 'usuario@localhost')
  .cascade()
  .execute();
```

## Gestión de Usuarios

### createUser()

Crea un nuevo usuario de base de datos.

```javascript
// Crear usuario básico
await qb
  .createUser('nuevo_usuario@localhost')
  .identifiedBy('password_seguro')
  .execute();

// Crear usuario con opciones avanzadas
await qb
  .createUser('app_readonly@"%.empresa.com"')
  .identifiedBy('password123')
  .passwordExpire(90) // Expira en 90 días
  .maxConnectionsPerHour(100)
  .execute();
```

### alterUser()

Modifica un usuario existente.

```javascript
// Cambiar contraseña
await qb
  .alterUser('usuario@localhost')
  .identifiedBy('nueva_password')
  .execute();

// Modificar límites de conexión
await qb
  .alterUser('usuario@localhost')
  .maxConnectionsPerHour(50)
  .maxUserConnections(10)
  .execute();
```

### dropUser()

Elimina un usuario de la base de datos.

```javascript
await qb
  .dropUser('usuario_obsoleto@localhost')
  .execute();

// Eliminar múltiples usuarios
await qb
  .dropUser([
    'usuario1@localhost',
    'usuario2@localhost',
    'usuario_temp@"%"'
  ])
  .execute();
```

## Gestión de Roles

### createRole()

Crea un nuevo rol (en sistemas que lo soportan).

```javascript
// Crear rol básico
await qb
  .createRole('lectura_productos')
  .execute();

// Crear rol con descripción
await qb
  .createRole('administrador_ventas')
  .comment('Rol para administradores del módulo de ventas')
  .execute();
```

### grantRole()

Asigna un rol a un usuario.

```javascript
// Asignar rol a usuario
await qb
  .grantRole('lectura_productos', 'empleado@localhost')
  .execute();

// Asignar múltiples roles
await qb
  .grantRole([
    'lectura_productos',
    'escritura_inventario'
  ], 'supervisor@localhost')
  .execute();
```

### revokeRole()

Revoca un rol de un usuario.

```javascript
await qb
  .revokeRole('administrador_ventas', 'ex_supervisor@localhost')
  .execute();
```

## Privilegios Disponibles

### Privilegios de Tabla

```javascript
const privilegiosTabla = [
  'SELECT',     // Leer datos
  'INSERT',     // Insertar datos
  'UPDATE',     // Actualizar datos
  'DELETE',     // Eliminar datos
  'CREATE',     // Crear tablas
  'DROP',       // Eliminar tablas
  'ALTER',      // Modificar estructura
  'INDEX',      // Crear/eliminar índices
  'REFERENCES'  // Crear claves foráneas
];

// Ejemplo de uso
await qb
  .grant(privilegiosTabla, 'inventario', 'gestor_inventario@localhost')
  .execute();
```

### Privilegios de Base de Datos

```javascript
const privilegiosDB = [
  'CREATE',           // Crear objetos
  'CREATE TEMPORARY TABLES',  // Crear tablas temporales
  'LOCK TABLES',      // Bloquear tablas
  'CREATE VIEW',      // Crear vistas
  'SHOW VIEW',        // Ver definición de vistas
  'CREATE ROUTINE',   // Crear procedimientos/funciones
  'ALTER ROUTINE',    // Modificar procedimientos/funciones
  'EXECUTE',          // Ejecutar procedimientos/funciones
  'EVENT',            // Crear/modificar eventos
  'TRIGGER'           // Crear/modificar triggers
];
```

### Privilegios Globales

```javascript
const privilegiosGlobales = [
  'ALL PRIVILEGES',   // Todos los privilegios
  'USAGE',           // Conectarse (sin otros privilegios)
  'RELOAD',          // Recargar configuración
  'SHUTDOWN',        // Apagar servidor
  'PROCESS',         // Ver procesos
  'FILE',            // Leer/escribir archivos
  'SUPER',           // Privilegios de superusuario
  'REPLICATION SLAVE',    // Replicación
  'REPLICATION CLIENT',   // Cliente de replicación
  'CREATE USER',     // Crear usuarios
  'SHOW DATABASES'   // Ver todas las bases de datos
];
```

## Ejemplos Prácticos

### Configuración de Ambiente de Desarrollo

```javascript
// Crear usuario desarrollador con acceso completo a DB de desarrollo
await qb
  .createUser('dev_user@localhost')
  .identifiedBy('dev_password')
  .execute();

await qb
  .grant(['ALL PRIVILEGES'], 'desarrollo.*', 'dev_user@localhost')
  .withGrantOption()
  .execute();
```

### Configuración de Aplicación Web

```javascript
// Usuario para la aplicación web (solo operaciones básicas)
await qb
  .createUser('web_app@"%"')
  .identifiedBy('app_secure_password')
  .maxConnectionsPerHour(1000)
  .maxUserConnections(50)
  .execute();

// Permisos para tablas principales
await qb
  .grant(['SELECT', 'INSERT', 'UPDATE'], 'usuarios', 'web_app@"%"')
  .execute();

await qb
  .grant(['SELECT', 'INSERT', 'UPDATE'], 'pedidos', 'web_app@"%"')
  .execute();

await qb
  .grant(['SELECT'], 'productos', 'web_app@"%"')
  .execute();

// Sin permisos para tablas administrativas
await qb
  .revoke(['ALL PRIVILEGES'], 'configuracion', 'web_app@"%"')
  .execute();
```

### Usuario de Solo Lectura para Reportes

```javascript
// Crear usuario para reportes y análisis
await qb
  .createUser('analista@localhost')
  .identifiedBy('analisis_password')
  .execute();

// Solo lectura en todas las tablas de datos
const tablasLectura = [
  'usuarios', 'pedidos', 'productos', 'categorias',
  'ventas', 'inventario', 'reportes'
];

for (const tabla of tablasLectura) {
  await qb
    .grant(['SELECT'], tabla, 'analista@localhost')
    .execute();
}

// Permitir crear vistas temporales para análisis
await qb
  .grant(['CREATE TEMPORARY TABLES'], 'empresa.*', 'analista@localhost')
  .execute();
```

### Sistema de Roles por Departamento

```javascript
// Crear roles por departamento
await qb
  .createRole('ventas_lectura')
  .execute();

await qb
  .createRole('ventas_escritura')
  .execute();

await qb
  .createRole('inventario_gestor')
  .execute();

// Configurar permisos de roles
await qb
  .grant(['SELECT'], 'productos', 'ventas_lectura')
  .execute();

await qb
  .grant(['SELECT'], 'clientes', 'ventas_lectura')
  .execute();

await qb
  .grant(['SELECT', 'INSERT', 'UPDATE'], 'pedidos', 'ventas_escritura')
  .execute();

await qb
  .grant(['ALL PRIVILEGES'], 'inventario', 'inventario_gestor')
  .execute();

// Asignar roles a usuarios
await qb
  .grantRole('ventas_lectura', 'vendedor1@localhost')
  .execute();

await qb
  .grantRole(['ventas_lectura', 'ventas_escritura'], 'supervisor_ventas@localhost')
  .execute();
```

## Consultar Permisos Existentes

### Ver permisos de un usuario

```javascript
const permisos = await qb
  .select(['*'])
  .from('information_schema.user_privileges')
  .where('grantee = ?', ["'usuario@localhost'"])
  .execute();
```

### Ver permisos de tabla

```javascript
const permisosTabla = await qb
  .select(['*'])
  .from('information_schema.table_privileges')
  .where('table_name = ?', ['usuarios'])
  .execute();
```

### Ver todos los usuarios

```javascript
const usuarios = await qb
  .select(['user', 'host'])
  .from('mysql.user')
  .execute();
```

## Buenas Prácticas de Seguridad

```javascript
// 1. Principio del menor privilegio
// Solo otorgar los permisos mínimos necesarios

// 2. Usuarios específicos por aplicación
await qb
  .createUser('app_web@localhost')
  .identifiedBy('password_compleja_123!')
  .execute();

// 3. Restricción por host
await qb
  .createUser('backup_user@"192.168.1.%"')
  .identifiedBy('backup_password')
  .execute();

// 4. Expiracion de contraseñas
await qb
  .alterUser('temp_user@localhost')
  .passwordExpire(30) // 30 días
  .execute();

// 5. Límites de conexión
await qb
  .alterUser('public_user@"%"')
  .maxConnectionsPerHour(100)
  .maxQueriesPerHour(1000)
  .execute();
```