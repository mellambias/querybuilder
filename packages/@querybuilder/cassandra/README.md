# @querybuilder/cassandra

Integración de Apache Cassandra para QueryBuilder - Base de datos NoSQL distribuida para aplicaciones Big Data y de alta escala.

## Características

- 🌐 **Distribuida**: Soporte completo para clustering y distribución horizontal
- 📊 **Big Data**: Optimizada para grandes volúmenes de datos y alta concurrencia
- ⚡ **Alto Rendimiento**: Operaciones CQL eficientes con consistencia configurable
- 🔧 **QueryBuilder**: Integración completa con la metodología QueryBuilder
- 📦 **Collections**: Soporte para listas, sets, maps y tipos definidos por el usuario
- ⏰ **Time-Series**: Patrones optimizados para datos de series temporales
- 🔍 **Indexación**: Índices secundarios y consultas flexibles
- 🎯 **Consistency**: Niveles de consistencia configurables para cada operación

## Instalación

```bash
npm install @querybuilder/cassandra
# o
pnpm add @querybuilder/cassandra
```

## Uso Básico

### Conexión

```javascript
import Cassandra from '@querybuilder/cassandra';

const cassandra = new Cassandra({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'my_app'
});

await cassandra.connect();
```

### Operaciones de Keyspace

```javascript
// Crear keyspace
await cassandra.createKeyspace('my_app', {
    replication: {
        class: 'SimpleStrategy',
        replication_factor: 3
    },
    durableWrites: true
});

// Usar keyspace
await cassandra.useKeyspace('my_app');

// Eliminar keyspace
await cassandra.dropKeyspace('my_app');
```

### Operaciones de Tablas

```javascript
// Crear tabla
await cassandra.createTable('users', {
    id: 'uuid',
    email: 'text',
    name: 'text',
    age: 'int',
    created_at: 'timestamp',
    tags: 'set<text>',
    metadata: 'map<text, text>'
}, {
    primaryKey: 'id',
    ifNotExists: true
});

// Crear tabla con clustering
await cassandra.createTable('user_sessions', {
    user_id: 'uuid',
    session_start: 'timestamp',
    activity: 'text',
    duration: 'int'
}, {
    primaryKey: ['user_id', 'session_start'],
    clusteringOrder: 'session_start DESC'
});
```

## Operaciones de Datos

### Insertar

```javascript
// Inserción básica
await cassandra.insert('users', {
    id: cassandra.uuid(),
    email: 'user@example.com',
    name: 'John Doe',
    age: 30,
    created_at: new Date(),
    tags: ['premium', 'verified'],
    metadata: { source: 'web', version: '1.0' }
});

// Inserción con TTL
await cassandra.insert('sessions', {
    session_id: cassandra.uuid(),
    user_id: userId,
    data: 'session_data'
}, {
    using: { ttl: 3600 } // 1 hora
});
```

### Consultar

```javascript
// Consulta básica
const users = await cassandra.select('users');

// Consulta con filtros
const user = await cassandra.select('users', {
    where: { id: userId },
    columns: ['name', 'email', 'age']
});

// Consulta con rango
const sessions = await cassandra.select('user_sessions', {
    where: { 
        user_id: userId,
        session_start: { gt: new Date('2024-01-01') }
    },
    orderBy: 'session_start DESC',
    limit: 10
});
```

### Actualizar

```javascript
// Actualización básica
await cassandra.update('users', 
    { age: 31, name: 'John Smith' },
    { id: userId }
);

// Actualización con TTL
await cassandra.update('user_cache', 
    { data: 'new_data' },
    { user_id: userId },
    { using: { ttl: 1800 } }
);
```

### Eliminar

```javascript
// Eliminar registro
await cassandra.delete('users', { id: userId });

// Eliminar columnas específicas
await cassandra.delete('users', { id: userId }, {
    columns: ['metadata', 'tags']
});
```

## Colecciones

### Sets

```javascript
// Agregar elementos a un set
await cassandra.update('users',
    { tags: "tags + {'vip'}" },
    { id: userId }
);

// Remover elementos de un set
await cassandra.update('users',
    { tags: "tags - {'temp'}" },
    { id: userId }
);
```

### Listas

```javascript
// Agregar al final de una lista
await cassandra.update('user_scores',
    { scores: "scores + [95]" },
    { user_id: userId }
);

// Agregar al inicio de una lista
await cassandra.update('user_scores',
    { scores: "[100] + scores" },
    { user_id: userId }
);
```

### Maps

```javascript
// Agregar/actualizar elementos de un map
await cassandra.update('user_settings',
    { "preferences['theme']": "'dark'" },
    { user_id: userId }
);

// Agregar múltiples elementos
await cassandra.update('user_settings',
    { preferences: "preferences + {'lang': 'en', 'tz': 'UTC'}" },
    { user_id: userId }
);
```

## Operaciones por Lotes

```javascript
const batchQueries = [
    {
        query: 'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
        params: [cassandra.uuid(), 'User 1', 'user1@example.com']
    },
    {
        query: 'INSERT INTO user_profiles (user_id, bio) VALUES (?, ?)',
        params: [userId, 'User bio']
    }
];

await cassandra.executeBatch(batchQueries, { logged: true });
```

## Niveles de Consistencia

```javascript
// Configurar nivel de consistencia global
cassandra.setConsistencyLevel('quorum');

// Nivel de consistencia por operación
await cassandra.select('users', {
    where: { id: userId }
}, {
    consistency: cassandra.consistency.localQuorum
});

// Niveles disponibles
const levels = [
    'any', 'one', 'two', 'three', 'quorum', 'all',
    'localQuorum', 'eachQuorum', 'localOne'
];
```

## Patrones Big Data

### Desnormalización

```javascript
// Tabla principal
await cassandra.createTable('users', {
    id: 'uuid',
    email: 'text',
    name: 'text'
}, { primaryKey: 'id' });

// Tabla desnormalizada para búsqueda por email
await cassandra.createTable('users_by_email', {
    email: 'text',
    user_id: 'uuid',
    name: 'text'
}, { primaryKey: 'email' });

// Mantener ambas tablas sincronizadas
const userData = { id: userId, email, name };
await cassandra.executeBatch([
    { query: 'INSERT INTO users (id, email, name) VALUES (?, ?, ?)', 
      params: [userData.id, userData.email, userData.name] },
    { query: 'INSERT INTO users_by_email (email, user_id, name) VALUES (?, ?, ?)', 
      params: [userData.email, userData.id, userData.name] }
]);
```

### Particionamiento por Tiempo

```javascript
// Tabla particionada por día
await cassandra.createTable('events_by_day', {
    day: 'text',         // Partition key
    hour: 'int',         // Clustering key
    event_id: 'timeuuid', // Clustering key
    event_type: 'text',
    data: 'text'
}, {
    primaryKey: ['day', 'hour', 'event_id'],
    clusteringOrder: 'hour DESC, event_id DESC'
});

// Insertar eventos
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
await cassandra.insert('events_by_day', {
    day: today,
    hour: new Date().getHours(),
    event_id: cassandra.timeUuid(),
    event_type: 'user_action',
    data: JSON.stringify(eventData)
});
```

## Series Temporales

### Tabla Optimizada para Time-Series

```javascript
await cassandra.createTable('sensor_readings', {
    sensor_id: 'uuid',
    reading_time: 'timestamp',
    temperature: 'double',
    humidity: 'double',
    location: 'text'
}, {
    primaryKey: ['sensor_id', 'reading_time'],
    clusteringOrder: 'reading_time DESC',
    compaction: {
        class: 'TimeWindowCompactionStrategy',
        compaction_window_unit: 'HOURS',
        compaction_window_size: '24'
    }
});

// Consultar datos recientes
const recentReadings = await cassandra.select('sensor_readings', {
    where: { 
        sensor_id: sensorId,
        reading_time: { gt: new Date(Date.now() - 24*60*60*1000) }
    },
    orderBy: 'reading_time DESC',
    limit: 100
});
```

## Tipos Definidos por el Usuario (UDT)

```javascript
// Crear UDT
await cassandra.createType('address', {
    street: 'text',
    city: 'text',
    zip: 'text',
    country: 'text'
});

// Usar UDT en tabla
await cassandra.createTable('user_addresses', {
    user_id: 'uuid',
    home_address: 'address',
    work_address: 'address',
    addresses: 'list<frozen<address>>'
}, { primaryKey: 'user_id' });

// Insertar con UDT
await cassandra.insert('user_addresses', {
    user_id: userId,
    home_address: {
        street: '123 Main St',
        city: 'New York',
        zip: '10001',
        country: 'USA'
    }
});
```

## Índices Secundarios

```javascript
// Crear índice en columna
await cassandra.createIndex('users_age_idx', 'users', 'age');

// Consultar usando índice
const youngUsers = await cassandra.select('users', {
    where: { age: { lt: 30 } },
    allowFiltering: true
});

// Índice en colección
await cassandra.createIndex('users_tags_idx', 'users', 'tags');

// Consultar elementos en colección
const premiumUsers = await cassandra.select('users', {
    where: { tags: { contains: 'premium' } }
});
```

## Funciones y Agregaciones

```javascript
// Usar funciones built-in
await cassandra.insert('events', {
    id: cassandra.uuid(),
    timestamp: cassandra.timeUuid(),
    created_at: new Date()
});

// Consultas con funciones
const result = await cassandra.execute(`
    SELECT dateOf(timestamp) as event_date, 
           unixTimestampOf(timestamp) as unix_time
    FROM events 
    WHERE id = ?
`, [eventId]);
```

## Configuración Avanzada

### Configuración del Cliente

```javascript
const cassandra = new Cassandra({
    contactPoints: ['node1.cassandra.com', 'node2.cassandra.com'],
    localDataCenter: 'datacenter1',
    keyspace: 'production_app',
    
    // Autenticación
    credentials: {
        username: 'cassandra_user',
        password: 'secure_password'
    },
    
    // Pool de conexiones
    pooling: {
        heartBeatInterval: 30000,
        maxRequestsPerConnection: 32768
    },
    
    // Opciones de socket
    socketOptions: {
        connectTimeout: 5000,
        readTimeout: 12000
    },
    
    // Políticas
    policies: {
        loadBalancing: new cassandra.policies.loadBalancing.RoundRobinPolicy(),
        retry: new cassandra.policies.retry.RetryPolicy(),
        reconnection: new cassandra.policies.reconnection.ExponentialReconnectionPolicy()
    }
});
```

### Monitoreo y Métricas

```javascript
// Obtener metadatos del cluster
const metadata = cassandra.getMetadata();
console.log('Hosts:', metadata.hosts.length);
console.log('Keyspaces:', Object.keys(metadata.keyspaces));

// Metadatos de keyspace
const ksMetadata = cassandra.getKeyspaceMetadata('my_app');
console.log('Tables:', Object.keys(ksMetadata.tables));

// Metadatos de tabla
const tableMetadata = cassandra.getTableMetadata('users');
console.log('Columns:', Object.keys(tableMetadata.columns));
console.log('Partition key:', tableMetadata.partitionKeys);
console.log('Clustering keys:', tableMetadata.clusteringKeys);
```

## Mejores Prácticas

### Diseño de Esquema

1. **Modelar por consultas**: Diseña las tablas basándote en las consultas que necesitas
2. **Desnormalización**: Acepta la duplicación de datos para optimizar consultas
3. **Partition keys eficientes**: Distribuye los datos uniformemente
4. **Clustering keys apropiados**: Ordena los datos según tus necesidades

### Rendimiento

1. **Usa declaraciones preparadas** para consultas repetitivas
2. **Operaciones por lotes** para múltiples escrituras relacionadas
3. **TTL apropiados** para datos temporales
4. **Niveles de consistencia** según tus necesidades de disponibilidad

### Ejemplo de Aplicación Completa

```javascript
import Cassandra from '@querybuilder/cassandra';

class UserService {
    constructor() {
        this.cassandra = new Cassandra({
            contactPoints: ['127.0.0.1'],
            localDataCenter: 'datacenter1',
            keyspace: 'user_service'
        });
    }

    async initialize() {
        await this.cassandra.connect();
        await this.setupSchema();
    }

    async setupSchema() {
        // Crear keyspace
        await this.cassandra.createKeyspace('user_service', {
            replication: { class: 'SimpleStrategy', replication_factor: 1 }
        });
        
        await this.cassandra.useKeyspace('user_service');

        // Tabla principal de usuarios
        await this.cassandra.createTable('users', {
            id: 'uuid',
            email: 'text',
            name: 'text',
            created_at: 'timestamp',
            profile: 'map<text, text>',
            tags: 'set<text>'
        }, { primaryKey: 'id' });

        // Tabla para búsqueda por email
        await this.cassandra.createTable('users_by_email', {
            email: 'text',
            user_id: 'uuid',
            name: 'text'
        }, { primaryKey: 'email' });

        // Actividad de usuarios (time-series)
        await this.cassandra.createTable('user_activity', {
            user_id: 'uuid',
            activity_date: 'timestamp',
            activity_type: 'text',
            metadata: 'map<text, text>'
        }, {
            primaryKey: ['user_id', 'activity_date'],
            clusteringOrder: 'activity_date DESC'
        });
    }

    async createUser(userData) {
        const userId = this.cassandra.uuid();
        const user = {
            id: userId,
            email: userData.email,
            name: userData.name,
            created_at: new Date(),
            profile: userData.profile || {},
            tags: userData.tags || []
        };

        // Batch para mantener consistencia
        await this.cassandra.executeBatch([
            {
                query: 'INSERT INTO users (id, email, name, created_at, profile, tags) VALUES (?, ?, ?, ?, ?, ?)',
                params: [user.id, user.email, user.name, user.created_at, user.profile, user.tags]
            },
            {
                query: 'INSERT INTO users_by_email (email, user_id, name) VALUES (?, ?, ?)',
                params: [user.email, user.id, user.name]
            }
        ]);

        return user;
    }

    async getUserById(userId) {
        const result = await this.cassandra.select('users', {
            where: { id: userId }
        });
        return result.rows[0];
    }

    async getUserByEmail(email) {
        const result = await this.cassandra.select('users_by_email', {
            where: { email }
        });
        
        if (result.rows.length === 0) return null;
        
        const userInfo = result.rows[0];
        return await this.getUserById(userInfo.user_id);
    }

    async logActivity(userId, activityType, metadata = {}) {
        await this.cassandra.insert('user_activity', {
            user_id: userId,
            activity_date: new Date(),
            activity_type: activityType,
            metadata
        });
    }

    async getUserActivity(userId, limit = 50) {
        const result = await this.cassandra.select('user_activity', {
            where: { user_id: userId },
            orderBy: 'activity_date DESC',
            limit
        });
        return result.rows;
    }

    async cleanup() {
        await this.cassandra.disconnect();
    }
}

// Uso
const userService = new UserService();
await userService.initialize();

const user = await userService.createUser({
    email: 'john@example.com',
    name: 'John Doe',
    profile: { age: '30', city: 'New York' },
    tags: ['premium', 'verified']
});

await userService.logActivity(user.id, 'signup', { source: 'web' });
```

## API Reference

### Constructor Options
- `contactPoints`: Array de direcciones de nodos Cassandra
- `localDataCenter`: Nombre del datacenter local
- `keyspace`: Keyspace por defecto
- `credentials`: Credenciales de autenticación
- `pooling`: Configuración del pool de conexiones
- `socketOptions`: Opciones de socket

### Métodos Principales
- `connect()`: Conectar al cluster
- `disconnect()`: Desconectar del cluster
- `execute(query, params, options)`: Ejecutar consulta CQL
- `executeBatch(queries, options)`: Ejecutar lote de consultas
- `setConsistencyLevel(level)`: Configurar nivel de consistencia

### Operaciones de Keyspace
- `createKeyspace(name, options)`: Crear keyspace
- `dropKeyspace(name)`: Eliminar keyspace
- `useKeyspace(name)`: Usar keyspace

### Operaciones de Tabla
- `createTable(name, columns, options)`: Crear tabla
- `dropTable(name)`: Eliminar tabla
- `alterTable(name, alterations)`: Modificar tabla

### Operaciones de Datos
- `insert(table, data, options)`: Insertar datos
- `select(table, options)`: Consultar datos
- `update(table, data, where, options)`: Actualizar datos
- `delete(table, where, options)`: Eliminar datos

## Licencia

MIT License - ver archivo LICENSE para detalles.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en el repositorio del proyecto.

## Soporte

Para soporte y preguntas, consulta la documentación oficial de Apache Cassandra y el repositorio del proyecto QueryBuilder.