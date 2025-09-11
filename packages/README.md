# @querybuilder packages

Este monorepo contiene los paquetes modulares de QueryBuilder, una biblioteca para construir consultas SQL y NoSQL de manera programática.

## Paquetes disponibles

### @querybuilder/core
El paquete principal que contiene la funcionalidad base del QueryBuilder con soporte para SQL2006 estándar.

```javascript
import { QueryBuilder, SQL2006 } from '@querybuilder/core';
```

### @querybuilder/mysql
Adaptador específico para MySQL con características propias de MySQL.

```javascript
import { MySQL } from '@querybuilder/mysql';
```

### @querybuilder/postgresql
Adaptador específico para PostgreSQL con características propias de PostgreSQL.

```javascript
import { PostgreSQL } from '@querybuilder/postgresql';
```

### @querybuilder/mongodb
Adaptador para MongoDB con soporte para pipelines de agregación.

```javascript
import { MongoDB } from '@querybuilder/mongodb';
```

## Instalación

Puedes instalar solo los paquetes que necesites:

```bash
# Para SQL estándar
npm install @querybuilder/core

# Para MySQL específico
npm install @querybuilder/mysql

# Para PostgreSQL específico
npm install @querybuilder/postgresql

# Para MongoDB
npm install @querybuilder/mongodb
```

## Uso básico

```javascript
// Usando el core para SQL estándar
import { QueryBuilder } from '@querybuilder/core';

const qb = new QueryBuilder();
const query = qb.select('*').from('users').where('active', '=', 1);

// Usando adaptadores específicos
import { MySQL } from '@querybuilder/mysql';

const mysql = new MySQL();
const mysqlQuery = mysql.select('*').from('users').limit(10);
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
