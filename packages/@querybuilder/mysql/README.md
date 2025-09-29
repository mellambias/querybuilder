# MySQL QueryBuilder Package

Este paquete proporciona funcionalidad específica de MySQL para el QueryBuilder, incluyendo tipos de datos, funciones, operadores y características específicas del motor de base de datos MySQL.

## Características

### ✅ Completamente Implementado

- **Tipos de Datos MySQL**: Soporte completo para todos los tipos de datos de MySQL
- **Funciones MySQL**: Amplio conjunto de funciones nativas de MySQL organizadas por categorías
- **Operadores MySQL**: Todos los operadores soportados con precedencia correcta
- **Características MySQL**: Documentación completa de funcionalidades y limitaciones
- **Integración Core**: Integración completa con el QueryBuilder core
- **Tests**: Suite de tests de integración funcionando

### 🏗️ Arquitectura

```
packages/@querybuilder/mysql/
├── MySQL.js              # Clase principal MySQL QueryBuilder
├── types.js              # Definiciones de tipos de datos MySQL
├── functions.js          # Funciones nativas de MySQL
├── operators.js          # Operadores y precedencia
├── features.js           # Características y limitaciones
├── package.json          # Configuración del paquete
├── comandos/             # Comandos SQL específicos
├── drivers/              # Drivers de conexión
├── results/              # Manejadores de resultados
├── src/                  # Código fuente adicional
├── test/                 # Tests de integración
└── examples/             # Ejemplos de uso
```

## Instalación

```bash
npm install @querybuilder/mysql
```

## Uso Básico

### Importación

```javascript
import MySQL from '@querybuilder/mysql';
// o
const MySQL = require('@querybuilder/mysql');
```

### Crear una instancia

```javascript
const mysql = new MySQL({
  host: 'localhost',
  port: 3306,
  user: 'username',
  password: 'password',
  database: 'mydatabase'
});
```

### Operaciones CRUD

#### CREATE TABLE

```javascript
const createQuery = mysql
  .createTable('users')
  .addColumn('id', 'INT', { primaryKey: true, autoIncrement: true })
  .addColumn('name', 'VARCHAR(255)', { notNull: true })
  .addColumn('email', 'VARCHAR(255)', { unique: true })
  .addColumn('profile', 'JSON')
  .addColumn('created_at', 'TIMESTAMP', { default: 'CURRENT_TIMESTAMP' })
  .toString();
```

#### SELECT

```javascript
const selectQuery = mysql
  .select(['id', 'name', 'email'])
  .from('users')
  .where('active', '=', 1)
  .orderBy('created_at', 'DESC')
  .limit(10)
  .toString();
```

#### INSERT

```javascript
const insertQuery = mysql
  .insert('users')
  .values({
    name: 'John Doe',
    email: 'john@example.com',
    profile: JSON.stringify({ age: 30 })
  })
  .toString();
```

#### UPDATE

```javascript
const updateQuery = mysql
  .update('users')
  .set({ name: 'Jane Doe' })
  .where('id', '=', 1)
  .toString();
```

#### DELETE

```javascript
const deleteQuery = mysql
  .delete()
  .from('users')
  .where('active', '=', 0)
  .toString();
```

## Tipos de Datos MySQL

### Tipos Numéricos

```javascript
import { IntegerTypes, NumericTypes } from '@querybuilder/mysql/types';

// Tipos enteros
console.log(IntegerTypes.TINYINT);   // TINYINT
console.log(IntegerTypes.INT);       // INT
console.log(IntegerTypes.BIGINT);    // BIGINT

// Tipos decimales
console.log(NumericTypes.DECIMAL);   // DECIMAL
console.log(NumericTypes.FLOAT);     // FLOAT
console.log(NumericTypes.DOUBLE);    // DOUBLE
```

### Tipos de Texto

```javascript
import { TextTypes } from '@querybuilder/mysql/types';

console.log(TextTypes.VARCHAR);      // VARCHAR
console.log(TextTypes.TEXT);         // TEXT
console.log(TextTypes.LONGTEXT);     // LONGTEXT
```

### Tipos JSON

```javascript
import { JsonTypes } from '@querybuilder/mysql/types';

console.log(JsonTypes.JSON);         // JSON
```

### Tipos de Fecha y Hora

```javascript
import { DateTimeTypes } from '@querybuilder/mysql/types';

console.log(DateTimeTypes.DATETIME); // DATETIME
console.log(DateTimeTypes.TIMESTAMP); // TIMESTAMP
console.log(DateTimeTypes.DATE);      // DATE
```

## Funciones MySQL

### Funciones JSON

```javascript
import { JsonFunctions } from '@querybuilder/mysql/functions';

const query = mysql
  .select([
    mysql.func(JsonFunctions.JSON_EXTRACT, ['profile', '$.age']).as('age'),
    mysql.func(JsonFunctions.JSON_KEYS, ['profile']).as('keys')
  ])
  .from('users')
  .toString();
```

### Funciones de Cadena

```javascript
import { StringFunctions } from '@querybuilder/mysql/functions';

const query = mysql
  .select([
    mysql.func(StringFunctions.UPPER, ['name']).as('upper_name'),
    mysql.func(StringFunctions.CONCAT, ['first_name', '" "', 'last_name']).as('full_name')
  ])
  .from('users')
  .toString();
```

### Funciones Matemáticas

```javascript
import { MathFunctions } from '@querybuilder/mysql/functions';

const query = mysql
  .select([
    mysql.func(MathFunctions.ROUND, ['price', 2]).as('rounded_price'),
    mysql.func(MathFunctions.ABS, ['balance']).as('absolute_balance')
  ])
  .from('products')
  .toString();
```

## Operadores MySQL

### Operadores de Comparación

```javascript
import { ComparisonOperators } from '@querybuilder/mysql/operators';

const query = mysql
  .select('*')
  .from('users')
  .where('age', ComparisonOperators.GREATER_THAN, 18)
  .where('name', ComparisonOperators.LIKE, 'John%')
  .toString();
```

### Operadores JSON

```javascript
import { JsonOperators } from '@querybuilder/mysql/operators';

const query = mysql
  .select('*')
  .from('users')
  .whereRaw(`profile${JsonOperators.EXTRACT}'$.age' > 21`)
  .toString();
```

## Características MySQL

### Verificar Soporte de Características

```javascript
import { isFeatureSupported } from '@querybuilder/mysql/features';

console.log(isFeatureSupported('JSON', '5.7'));           // true
console.log(isFeatureSupported('WINDOW_FUNCTIONS', '8.0')); // true
console.log(isFeatureSupported('CTE', '5.6'));            // false
```

### Obtener Límites

```javascript
import { getLimitsForVersion } from '@querybuilder/mysql/features';

const limits = getLimitsForVersion('8.0');
console.log(limits.MAX_COLUMNS_PER_TABLE); // 4096
console.log(limits.MAX_INDEXES_PER_TABLE);  // 64
```

## Ejemplos Avanzados

### Consultas con JSON

```javascript
const jsonQuery = mysql
  .select([
    'id',
    'name',
    mysql.func('JSON_EXTRACT', ['profile', '$.age']).as('age'),
    mysql.func('JSON_UNQUOTE', [mysql.func('JSON_EXTRACT', ['profile', '$.city'])]).as('city')
  ])
  .from('users')
  .where(mysql.func('JSON_EXTRACT', ['profile', '$.active']), '=', true)
  .toString();
```

### Window Functions (MySQL 8.0+)

```javascript
const windowQuery = mysql
  .select([
    'id',
    'name',
    'salary',
    mysql.func('ROW_NUMBER').over().partitionBy('department').orderBy('salary', 'DESC').as('rank')
  ])
  .from('employees')
  .toString();
```

### Common Table Expressions (MySQL 8.0+)

```javascript
const cteQuery = mysql
  .with('ranked_employees', mysql
    .select([
      '*',
      mysql.func('ROW_NUMBER').over().orderBy('salary', 'DESC').as('rank')
    ])
    .from('employees')
  )
  .select('*')
  .from('ranked_employees')
  .where('rank', '<=', 10)
  .toString();
```

## Tests

Ejecutar los tests de integración:

```bash
npm test
```

Los tests cubren:
- ✅ Creación de tablas con tipos MySQL
- ✅ Operaciones CRUD básicas
- ✅ Funciones JSON
- ✅ Validación de tipos
- ✅ Integración con Core QueryBuilder

## Compatibilidad

### Versiones de MySQL Soportadas

- **MySQL 5.7+**: Soporte completo para JSON, columnas generadas
- **MySQL 8.0+**: Soporte adicional para Window Functions, CTEs, Roles

### Motores de Almacenamiento

- **InnoDB**: Motor recomendado, soporte completo para transacciones
- **MyISAM**: Soporte para índices FULLTEXT, sin transacciones
- **Memory**: Tablas en memoria, índices HASH
- **Archive**: Almacenamiento comprimido

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## Licencia

MIT License - ver el archivo LICENSE para más detalles.

## Changelog

### v1.0.0
- ✅ Implementación completa de tipos MySQL
- ✅ Funciones y operadores MySQL
- ✅ Integración con QueryBuilder core
- ✅ Suite de tests funcional
- ✅ Documentación completa

---

**Nota**: Este paquete está diseñado para trabajar con el ecosistema QueryBuilder y proporciona funcionalidad específica para MySQL. Para uso general del QueryBuilder, consulta la documentación del paquete core.