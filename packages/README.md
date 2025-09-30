# @querybuilder packages

Este monorepo contiene los paquetes modulares de QueryBuilder, una biblioteca para construir consultas SQL y NoSQL de manera programática.

## Paquetes disponibles

### @querybuilder/core
El paquete principal que contiene la funcionalidad base del QueryBuilder con soporte para SQL2006 estándar.
Permite obtener la "query" en formato texto

```javascript
import { QueryBuilder, SQL2006 } from '@querybuilder/core';
```

### @querybuilder/mysql
Adaptador específico para MySQL y un Querybuilder con características propias MySQLExtended.

```javascript
import { MySQL, MySQLExtended } from '@querybuilder/mysql';
```

### @querybuilder/postgresql
Adaptador específico para PostgreSQL y un Querybuilder con características propias de PostgreSQLExtended.

```javascript
import { PostgreSQL, PostgreSQLExtended } from '@querybuilder/postgresql';
```

### @querybuilder/mongodb
Adaptador para MongoDB con soporte para pipelines de agregación.

```javascript
import { MongoDB } from '@querybuilder/mongodb';
```

## Instalación

El único módulo obligatorio es el core e instalar solo los paquetes que necesites:

```bash
# Obligatorio son soporte SQL2006
pnpm install @querybuilder/core

# Controladores para MySQL / MariaDB 
pnpm install @querybuilder/mysql

# Controladores para PostgreSQL
pnpm install @querybuilder/postgresql

# PaControladores MongoDB
pnpm install @querybuilder/mongodb
```

## Uso básico

```javascript
// Usando el core para SQL estándar
import { QueryBuilder } from '@querybuilder/core';

const qb = new QueryBuilder();
const query = await qb.select('*').from('users').where('active = 1').toString();
// devuelve la sentencia
SELECT * FROM users WHERE active = 1;

// Usando adaptadores específicos
import { MySQL } from '@querybuilder/mysql';

const qb = new QueryBuilder(MySQL);
const mysqlQuery = await qb.select('*')
.from('users')
.limit(10)
.execute();

Devuelve el resultado de "SELECT * FROM users LIMIT 10;"
```

## Estructura del monorepo

```
packages/
├── @querybuilder/
│   ├── core/          # Funcionalidad base
│   ├── mysql/         # Adaptador MySQL
│   ├── postgresql/    # Adaptador PostgreSQL
│   └── mongodb/       # Adaptador MongoDB
```

Cada paquete es independiente y puede instalarse por separado según tus necesidades.
