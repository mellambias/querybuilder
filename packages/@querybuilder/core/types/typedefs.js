/**
 * @namespace typedefs
 */

/**
 * @global
 * @typedef {Object} types.Status
 * @property {String} query - La consulta SQL ejecutada.
 * @property {Number} rowCount - El número de filas devueltas por la consulta.
 * @property {Number} fieldCount - El número de columnas devueltas por la consulta.
 * @property {String} info - Información adicional sobre el resultado de la consulta.
 * @property {Number} errors - El número de errores ocurridos durante la consulta.
 * @property {Number} warnings - El número de advertencias generadas durante la consulta.
 * @property {Error} [error] - El objeto Error si ocurrió un error durante la consulta.
 */

/**
 * Tipo que representa una instancia de QueryBuilder para encadenamiento de métodos.
 * Se usa como valor de retorno para mantener la fluidez de la API.
 * 
 * @global
 * @typedef {Object} next
 * @description Objeto QueryBuilder pasado al siguiente comando para encadenar métodos de forma fluida
 */

/**
 * Parámetros básicos de conexión a base de datos.
 * Define la información mínima necesaria para establecer una conexión.
 * 
 * @global
 * @typedef {Object} types.DatabaseParams
 * @property {string} host - Dirección del servidor de base de datos (IP o hostname)
 * @property {number|string} port - Puerto de conexión del servidor
 * @property {string} username - Nombre de usuario para autenticación
 * @property {string} password - Contraseña para autenticación
 * @property {string} [database] - Nombre de la base de datos específica (requerido para testing)
 * 
 * @example
 * // Configuración básica
 * const params = {
 *   host: "localhost",
 *   port: 5432,
 *   username: "dbuser",
 *   password: "secret123",
 *   database: "myapp_db"
 * };
 */

/**
 * Opciones específicas de configuración para MongoDB.
 * Define parámetros adicionales para optimizar la conexión MongoDB.
 * 
 * @global
 * @typedef {Object} types.MongoDBOptions
 * @property {boolean} retryWrites - Si se deben reintentar automáticamente las operaciones de escritura fallidas
 * @property {string} w - Write Concern: nivel de confirmación requerido ("majority", número, o "acknowledged")
 * @property {number} connectTimeoutMS - Tiempo límite para establecer conexión inicial (en milisegundos)
 * 
 * @example
 * const mongoOptions = {
 *   retryWrites: true,
 *   w: "majority",
 *   connectTimeoutMS: 30000
 * };
 */

/**
 * Parámetros extendidos específicos para conexiones MongoDB.
 * Incluye configuraciones adicionales y método para generar cadena de conexión.
 * 
 * @global
 * @typedef {Object} types.MongoDBParams
 * @extends types.DatabaseParams
 * @property {types.MongoDBOptions} options - Opciones específicas de MongoDB para la conexión
 * @property {Function} getConnectionString - Método que genera la cadena de conexión URI de MongoDB
 * 
 * @example
 * const mongoParams = {
 *   host: "localhost",
 *   port: 27017,
 *   username: "mongouser",
 *   password: "mongopass",
 *   database: "myapp",
 *   options: {
 *     retryWrites: true,
 *     w: "majority",
 *     connectTimeoutMS: 30000
 *   },
 *   getConnectionString: function() {
 *     // Implementación específica
 *   }
 * };
 */

/**
 * Configuración completa para un motor de base de datos específico.
 * Define todos los aspectos necesarios para conectar y operar con una base de datos.
 * 
 * @global
 * @typedef {Object} types.DatabaseConfig
 * @property {string} version - Versión específica del motor de base de datos (ej: "8.4.3", "16", "8.0.3")
 * @property {Object} driver - Instancia del driver específico para el motor (MySqlDriver, PostgreSQLDriver, MongodbDriver)
 * @property {types.DatabaseParams|types.MongoDBParams} params - Parámetros de conexión específicos del motor
 * 
 * @example
 * // Configuración MySQL
 * const mysqlConfig = {
 *   version: "8.4.3",
 *   driver: MySqlDriver,
 *   params: {
 *     host: "localhost",
 *     port: 3306,
 *     username: "root",
 *     password: "secret"
 *   }
 * };
 * 
 * // Configuración MongoDB  
 * const mongoConfig = {
 *   version: "8.0.3",
 *   driver: MongodbDriver,
 *   params: {
 *     host: "localhost",
 *     port: 27017,
 *     username: undefined,
 *     password: undefined,
 *     options: {
 *       retryWrites: true,
 *       w: "majority",
 *       connectTimeoutMS: 30000
 *     },
 *     getConnectionString: function() { return "mongodb://..."; }
 *   }
 * };
 */

/**
 * Opciones para la creación de una base de datos.
 * Define configuraciones específicas del motor de base de datos al crear una nueva base de datos.
 * Las opciones disponibles varían según el motor utilizado (MySQL, PostgreSQL, etc.).
 * 
 * @global
 * @typedef {Object} types.createDatabaseOptions
 * 
 * @property {boolean} [ifNotExists] - Si es true, crea la base de datos solo si no existe.
 * Evita errores al intentar crear una base de datos que ya existe.
 * Soportado por: MySQL, PostgreSQL, SQLite.
 * 
 * @property {string} [encoding] - Codificación de caracteres para la base de datos.
 * Determina cómo se almacenan los caracteres en la base de datos.
 * Valores comunes: 'UTF8', 'UTF8MB4', 'LATIN1', 'ASCII'.
 * Soportado por: PostgreSQL, MySQL.
 * 
 * @property {string} [charset] - Conjunto de caracteres (alias de encoding en MySQL).
 * Valores comunes: 'utf8mb4', 'utf8', 'latin1'.
 * Soportado por: MySQL.
 * 
 * @property {string} [collate] - Reglas de comparación y ordenamiento de caracteres.
 * Define cómo se comparan y ordenan las cadenas de texto.
 * Valores comunes: 'utf8mb4_unicode_ci', 'utf8mb4_general_ci'.
 * Soportado por: MySQL, PostgreSQL.
 * 
 * @property {string} [owner] - Usuario propietario de la base de datos.
 * Define qué usuario tiene privilegios completos sobre la base de datos.
 * Soportado por: PostgreSQL.
 * 
 * @property {string} [template] - Base de datos plantilla desde la cual copiar.
 * Valores comunes: 'template0', 'template1'.
 * Soportado por: PostgreSQL.
 * 
 * @property {string} [tablespace] - Espacio de tablas donde se almacenará la base de datos.
 * Define la ubicación física de almacenamiento.
 * Soportado por: PostgreSQL.
 * 
 * @property {string} [locale] - Configuración regional para ordenamiento y formato.
 * Afecta el comportamiento de ordenamiento, formato de fechas y números.
 * Valores comunes: 'en_US.UTF-8', 'es_ES.UTF-8'.
 * Soportado por: PostgreSQL.
 * 
 * @example
 * // Opciones básicas (compatible con todos los motores)
 * const basicOptions = {
 *   ifNotExists: true
 * };
 * 
 * // Opciones MySQL
 * const mysqlOptions = {
 *   ifNotExists: true,
 *   charset: 'utf8mb4',
 *   collate: 'utf8mb4_unicode_ci'
 * };
 * 
 * // Opciones PostgreSQL
 * const pgOptions = {
 *   encoding: 'UTF8',
 *   owner: 'dbadmin',
 *   template: 'template0',
 *   tablespace: 'fast_storage',
 *   locale: 'es_ES.UTF-8'
 * };
 * 
 * // Uso con QueryBuilder
 * qb.createDatabase('myapp_db', mysqlOptions);
 * qb.createDatabase('analytics_db', pgOptions);
 */

/**
 * Opciones para eliminar una base de datos.
 * Define configuraciones específicas del motor de base de datos al eliminar una base de datos existente.
 * Las opciones disponibles varían según el motor utilizado (MySQL, PostgreSQL, etc.).
 * 
 * @global
 * @typedef {Object} types.DropDatabaseOptions
 * 
 * @property {boolean} [exist] - Si es true, elimina la base de datos solo si existe.
 * Evita errores al intentar eliminar una base de datos que no existe.
 * Equivalente a la cláusula IF EXISTS en SQL.
 * Soportado por: MySQL, PostgreSQL, SQLite.
 * 
 * @property {boolean} [ifExists] - Alias de 'exist' para compatibilidad.
 * Algunas implementaciones usan ifExists en lugar de exist.
 * Soportado por: MySQL, PostgreSQL.
 * 
 * @property {boolean} [force] - Si es true, fuerza la eliminación de la base de datos.
 * Termina todas las conexiones activas a la base de datos antes de eliminarla.
 * PRECAUCIÓN: Esta opción interrumpirá todas las sesiones activas sin advertencia.
 * Soportado por: PostgreSQL (desde versión 13).
 * 
 * @property {boolean} [cascade] - Si es true, elimina también objetos dependientes.
 * Elimina automáticamente todos los objetos que dependen de la base de datos.
 * PRECAUCIÓN: Puede eliminar datos de forma irrecuperable.
 * Soportado por: Algunos SGBDs avanzados.
 * 
 * @property {boolean} [restrict] - Si es true, previene la eliminación si hay dependencias.
 * La operación falla si existen objetos dependientes de la base de datos.
 * Es el comportamiento predeterminado en la mayoría de SGBDs.
 * Soportado por: PostgreSQL, SQL estándar.
 * 
 * @example
 * // Eliminación básica (puede fallar si la base de datos no existe)
 * qb.dropDatabase('old_db');
 * 
 * // Eliminación segura (no falla si no existe)
 * qb.dropDatabase('temp_db', { exist: true });
 * 
 * // Eliminación forzada en PostgreSQL (termina conexiones activas)
 * qb.dropDatabase('test_db', { 
 *   exist: true, 
 *   force: true 
 * });
 * 
 * // Eliminación con CASCADE (elimina dependencias)
 * qb.dropDatabase('dev_db', { 
 *   exist: true,
 *   cascade: true 
 * });
 * 
 * // Eliminación con RESTRICT (falla si hay dependencias)
 * qb.dropDatabase('prod_db', { 
 *   exist: true,
 *   restrict: true 
 * });
 * 
 * // Ejemplo PostgreSQL completo
 * const pgOptions = {
 *   exist: true,  // IF EXISTS
 *   force: true   // WITH (FORCE)
 * };
 * qb.dropDatabase('analytics_db', pgOptions);
 * // Genera: DROP DATABASE IF EXISTS analytics_db WITH (FORCE)
 */

/**
 * Opciones para crear un esquema en la base de datos.
 * Un esquema es un contenedor lógico que agrupa objetos de base de datos relacionados
 * (tablas, vistas, funciones, etc.) bajo un mismo espacio de nombres.
 * 
 * @global
 * @typedef {Object} types.createSchemaOptions
 * 
 * @property {boolean} [ifNotExists] - Si es true, crea el esquema solo si no existe.
 * Evita errores al intentar crear un esquema que ya existe.
 * Equivalente a la cláusula IF NOT EXISTS en SQL.
 * Soportado por: PostgreSQL, MySQL (desde 8.0), SQL estándar.
 * 
 * @property {string} [authorization] - Usuario propietario del esquema.
 * Especifica qué usuario tendrá privilegios completos sobre el esquema.
 * Define el propietario que puede administrar todos los objetos dentro del esquema.
 * Soportado por: PostgreSQL, SQL estándar.
 * Sintaxis SQL: AUTHORIZATION nombre_usuario
 * 
 * @property {string} [charset] - Conjunto de caracteres predeterminado para el esquema.
 * Define la codificación de caracteres que se usará por defecto para los objetos
 * creados dentro de este esquema (tablas, columnas de texto, etc.).
 * Valores comunes: 'utf8', 'utf8mb4', 'latin1', 'ascii'.
 * Soportado por: MySQL, SQL estándar.
 * Sintaxis SQL: DEFAULT CHARACTER SET nombre_charset
 * 
 * @property {string} [collate] - Reglas de ordenamiento predeterminadas para el esquema.
 * Define cómo se comparan y ordenan las cadenas de texto dentro del esquema.
 * Afecta las operaciones ORDER BY, comparaciones de strings, índices de texto.
 * Valores comunes: 'utf8mb4_unicode_ci', 'utf8_general_ci'.
 * Soportado por: MySQL, PostgreSQL.
 * 
 * @property {string} [owner] - Alias de 'authorization' en algunos SGBDs.
 * Define el usuario propietario del esquema.
 * Soportado por: PostgreSQL.
 * 
 * @example
 * // Creación básica de esquema
 * qb.createSchema('ventas');
 * // Genera: CREATE SCHEMA ventas
 * 
 * // Creación segura (no falla si ya existe)
 * qb.createSchema('ventas', { ifNotExists: true });
 * // Genera: CREATE SCHEMA IF NOT EXISTS ventas
 * 
 * // Esquema con propietario específico (PostgreSQL)
 * qb.createSchema('finanzas', { 
 *   ifNotExists: true,
 *   authorization: 'admin_user' 
 * });
 * // Genera: CREATE SCHEMA IF NOT EXISTS finanzas AUTHORIZATION admin_user
 * 
 * // Esquema con charset personalizado (MySQL)
 * qb.createSchema('productos', {
 *   ifNotExists: true,
 *   charset: 'utf8mb4',
 *   collate: 'utf8mb4_unicode_ci'
 * });
 * // Genera: CREATE SCHEMA IF NOT EXISTS productos 
 * //         DEFAULT CHARACTER SET utf8mb4 
 * //         DEFAULT COLLATE utf8mb4_unicode_ci
 * 
 * // Ejemplo SQL estándar completo
 * const schemaOptions = {
 *   authorization: 'app_owner',
 *   charset: 'utf8mb4'
 * };
 * qb.createSchema('app_schema', schemaOptions);
 * // Genera: CREATE SCHEMA app_schema 
 * //         AUTHORIZATION app_owner 
 * //         DEFAULT CHARACTER SET utf8mb4
 * 
 * // Organización multi-tenant
 * qb.createSchema('tenant_empresa_a', {
 *   ifNotExists: true,
 *   authorization: 'tenant_admin',
 *   charset: 'utf8mb4'
 * });
 * qb.createSchema('tenant_empresa_b', {
 *   ifNotExists: true,
 *   authorization: 'tenant_admin',
 *   charset: 'utf8mb4'
 * });
 */

/**
 * Opciones de configuración para la eliminación de esquemas (DROP SCHEMA).
 * 
 * Un esquema puede contener múltiples objetos de base de datos (tablas, vistas, funciones).
 * Las opciones de eliminación determinan el comportamiento cuando el esquema no está vacío
 * o cuando otros objetos dependen de él.
 * 
 * ⚠️ ADVERTENCIA: La eliminación de esquemas es una operación destructiva e irreversible.
 * Siempre realice respaldos antes de eliminar esquemas en producción.
 * 
 * @global
 * @typedef {Object} types.dropSchemaOptions
 * 
 * @property {boolean} [ifExists] - Si es true, no genera error si el esquema no existe.
 * Equivalente a la cláusula IF EXISTS en SQL.
 * Útil para scripts idempotentes que pueden ejecutarse múltiples veces.
 * Soportado por: PostgreSQL, MySQL (desde 5.1).
 * 
 * @property {boolean} [cascade] - Si es true, elimina el esquema y todos sus objetos dependientes.
 * Elimina recursivamente:
 * - Todas las tablas del esquema
 * - Vistas, funciones, procedimientos
 * - Secuencias, tipos personalizados
 * - Índices, triggers, constraints
 * ⚠️ PELIGROSO: Puede eliminar grandes cantidades de datos sin confirmación adicional.
 * Soportado por: PostgreSQL, SQL estándar.
 * Sintaxis SQL: DROP SCHEMA nombre CASCADE
 * 
 * @property {boolean} [restrict] - Si es true, solo elimina el esquema si está completamente vacío.
 * Genera un error si el esquema contiene algún objeto (tablas, vistas, etc.).
 * Es el comportamiento predeterminado más seguro en la mayoría de SGBDs.
 * Previene eliminaciones accidentales de datos.
 * Soportado por: PostgreSQL, SQL estándar.
 * Sintaxis SQL: DROP SCHEMA nombre RESTRICT
 * 
 * @property {string} [drop] - Alias de texto para cascade/restrict ('CASCADE' o 'RESTRICT').
 * Permite especificar el comportamiento usando strings en lugar de booleanos.
 * Los valores deben ser exactamente 'CASCADE' o 'RESTRICT' (case-insensitive).
 * Soportado por: PostgreSQL, SQL estándar.
 * 
 * @property {string} [option] - Alias alternativo para drop (usado en algunos tests).
 * Permite especificar 'CASCADE' o 'RESTRICT' como string.
 * Soportado por: Implementación interna del QueryBuilder.
 * 
 * @example
 * // Eliminación básica (falla si el esquema no está vacío o no existe)
 * qb.dropSchema('schema_temporal');
 * // Genera: DROP SCHEMA schema_temporal
 * 
 * // Eliminación segura (no falla si no existe)
 * qb.dropSchema('schema_temporal', { ifExists: true });
 * // Genera: DROP SCHEMA IF EXISTS schema_temporal
 * 
 * // Eliminación restrictiva explícita (solo si está vacío)
 * qb.dropSchema('schema_antiguo', { 
 *   ifExists: true,
 *   restrict: true 
 * });
 * // Genera: DROP SCHEMA IF EXISTS schema_antiguo RESTRICT
 * 
 * // Eliminación en cascada - ELIMINA TODO EL CONTENIDO
 * qb.dropSchema('schema_pruebas', { 
 *   ifExists: true,
 *   cascade: true 
 * });
 * // Genera: DROP SCHEMA IF EXISTS schema_pruebas CASCADE
 * // ⚠️ Esto eliminará todas las tablas, vistas, y datos dentro del esquema
 * 
 * // Usando la opción drop como string
 * qb.dropSchema('schema_viejo', { 
 *   ifExists: true,
 *   drop: 'RESTRICT' 
 * });
 * // Genera: DROP SCHEMA IF EXISTS schema_viejo RESTRICT
 * 
 * // Usando la opción option (sintaxis alternativa)
 * qb.dropSchema('TEMPORAL', { 
 *   option: 'CASCADE' 
 * });
 * // Genera: DROP SCHEMA TEMPORAL CASCADE
 * 
 * // Limpieza de esquema multi-tenant
 * qb.dropSchema('tenant_empresa_cerrada', {
 *   ifExists: true,
 *   cascade: true  // Elimina todo el contenido del tenant
 * });
 * 
 * // Script de migración idempotente
 * qb.dropSchema('schema_legacy', {
 *   ifExists: true,    // No falla en ejecuciones repetidas
 *   restrict: true     // Solo elimina si está vacío (seguridad)
 * });
 * 
 * // Limpieza de entorno de testing
 * const testSchemas = ['test_schema_1', 'test_schema_2', 'test_schema_3'];
 * testSchemas.forEach(schema => {
 *   qb.dropSchema(schema, { 
 *     ifExists: true,
 *     cascade: true  // Tests pueden dejar objetos residuales
 *   });
 * });
 * 
 * @see {@link types.createSchemaOptions} - Para opciones de creación de esquemas
 */

/**
 * Opciones de configuración para la creación de tablas (CREATE TABLE).
 * 
 * Las tablas son la estructura fundamental de almacenamiento de datos en bases de datos relacionales.
 * Este typedef define todas las opciones disponibles para crear tablas con diferentes características,
 * columnas, restricciones y comportamientos.
 * 
 * @global
 * @typedef {Object} types.createTableOptions
 * 
 * @property {Object.<string, string|Object>} cols - **OBLIGATORIO**. Definición de columnas de la tabla.
 * Objeto donde las claves son nombres de columnas y los valores pueden ser:
 * - **String simple**: Tipo de dato SQL (ej: 'INTEGER', 'VARCHAR(255)', 'TIMESTAMP')
 * - **Objeto con configuración**: { type: string, values: Array<string>, default: any }
 *   * type: Tipo de dato SQL
 *   * values: Array de restricciones de columna ['NOT NULL', 'UNIQUE', 'PRIMARY KEY']
 *   * default: Valor por defecto para la columna
 * 
 * La propiedad `cols` es obligatoria. Si no se proporciona, se lanzará un error.
 * Los nombres de columnas deben ser identificadores SQL válidos (no palabras reservadas).
 * 
 * Soportado por: Todos los SGBDs (PostgreSQL, MySQL, SQL Server, SQLite, Oracle).
 * 
 * @property {Array<Object>} [constraints] - Restricciones a nivel de tabla (table constraints).
 * Array de objetos que definen restricciones que afectan a múltiples columnas o a la tabla completa.
 * Cada objeto de restricción tiene la estructura:
 * - **name** (string): Nombre de la restricción
 * - **type** (string): Tipo de restricción - 'primary key', 'foreign key', 'unique', 'check', 'not null'
 * - **cols** (Array<string>): Columnas afectadas por la restricción
 * - **foreignKey** (Object): Para FOREIGN KEY - { table: string, cols: Array<string>, onDelete: string, onUpdate: string }
 * - **check** (string): Para CHECK - Expresión SQL de validación
 * 
 * Tipos de constraints soportados:
 * - PRIMARY KEY: Define clave primaria compuesta de múltiples columnas
 * - FOREIGN KEY: Define relación con otra tabla (integridad referencial)
 * - UNIQUE: Garantiza valores únicos en las columnas especificadas
 * - CHECK: Valida que los datos cumplan una condición SQL
 * - NOT NULL: Asegura que las columnas no acepten valores nulos
 * 
 * Soportado por: PostgreSQL, MySQL (desde 5.0), SQL Server, Oracle, SQL estándar.
 * 
 * @property {string} [temporary] - Define si la tabla es temporal ('GLOBAL' o 'LOCAL').
 * Las tablas temporales existen solo durante la sesión o transacción actual.
 * - **'GLOBAL'**: Tabla visible para toda la sesión, datos compartidos entre transacciones
 * - **'LOCAL'**: Tabla visible solo en la transacción actual
 * 
 * Las tablas temporales son útiles para:
 * - Almacenar resultados intermedios en procesos complejos
 * - Evitar colisiones de nombres en sesiones concurrentes
 * - Mejorar rendimiento en operaciones de procesamiento por lotes
 * 
 * Soportado por: PostgreSQL, SQL Server, Oracle, SQL estándar.
 * MySQL usa sintaxis diferente (TEMPORARY TABLE).
 * Sintaxis SQL: CREATE [GLOBAL|LOCAL] TEMPORARY TABLE nombre
 * 
 * @property {string} [onCommit] - Comportamiento de tabla temporal al finalizar transacción ('PRESERVE' o 'DELETE').
 * Solo aplicable cuando temporary está definido.
 * - **'PRESERVE'**: Mantiene los datos de la tabla temporal después de COMMIT (preservar filas)
 * - **'DELETE'**: Elimina todos los datos de la tabla temporal después de COMMIT (borrar filas)
 * 
 * Controla el ciclo de vida de los datos en tablas temporales:
 * - PRESERVE ROWS: Los datos persisten hasta el final de la sesión
 * - DELETE ROWS: Los datos se limpian automáticamente al confirmar la transacción
 * 
 * Soportado por: PostgreSQL, Oracle, SQL estándar.
 * Sintaxis SQL: ON COMMIT {PRESERVE|DELETE} ROWS
 * 
 * @property {boolean} [ifNotExists] - Si es true, crea la tabla solo si no existe.
 * Evita errores al intentar crear una tabla que ya existe en la base de datos.
 * Útil para scripts de migración y despliegues idempotentes que pueden ejecutarse múltiples veces.
 * Equivalente a la cláusula IF NOT EXISTS en SQL.
 * 
 * Soportado por: PostgreSQL, MySQL, SQLite.
 * No soportado por: SQL Server (requiere lógica con IF NOT EXISTS separado).
 * Sintaxis SQL: CREATE TABLE IF NOT EXISTS nombre
 * 
 * @example
 * // Creación básica con columnas simples (tipos como strings)
 * qb.createTable('usuarios', {
 *   cols: {
 *     id: 'SERIAL PRIMARY KEY',
 *     nombre: 'VARCHAR(100)',
 *     email: 'VARCHAR(255)',
 *     created_at: 'TIMESTAMP DEFAULT NOW()'
 *   }
 * });
 * // Genera: CREATE TABLE usuarios (
 * //   id SERIAL PRIMARY KEY,
 * //   nombre VARCHAR(100),
 * //   email VARCHAR(255),
 * //   created_at TIMESTAMP DEFAULT NOW()
 * // )
 * 
 * @example
 * // Creación con columnas configuradas (objetos con opciones)
 * qb.createTable('artistas', {
 *   cols: {
 *     ID_ARTISTA: { 
 *       type: 'INT', 
 *       values: ['NOT NULL', 'UNIQUE'] 
 *     },
 *     NOMBRE_ARTISTA: { 
 *       type: 'VARCHAR(60)', 
 *       values: ['NOT NULL'] 
 *     },
 *     FDN_ARTISTA: 'DATE',
 *     POSTER_EN_EXISTENCIA: 'BOOLEAN'
 *   }
 * });
 * // Genera: CREATE TABLE artistas (
 * //   ID_ARTISTA INT NOT NULL UNIQUE,
 * //   NOMBRE_ARTISTA VARCHAR(60) NOT NULL,
 * //   FDN_ARTISTA DATE,
 * //   POSTER_EN_EXISTENCIA BOOLEAN
 * // )
 * 
 * @example
 * // Tabla con PRIMARY KEY compuesta (constraint a nivel de tabla)
 * qb.createTable('ARTISTAS', {
 *   cols: {
 *     ID_ARTISTA: 'INT',
 *     NOMBRE_ARTISTA: { type: 'VARCHAR(60)', values: ['NOT NULL'] }
 *   },
 *   constraints: [
 *     {
 *       name: 'PK_ID',
 *       type: 'primary key',
 *       cols: ['ID_ARTISTA', 'NOMBRE_ARTISTA']
 *     }
 *   ]
 * });
 * // Genera: CREATE TABLE ARTISTAS (
 * //   ID_ARTISTA INT,
 * //   NOMBRE_ARTISTA VARCHAR(60) NOT NULL,
 * //   CONSTRAINT PK_ID PRIMARY KEY (ID_ARTISTA, NOMBRE_ARTISTA)
 * // )
 * 
 * @example
 * // Tabla con FOREIGN KEY (relación con otra tabla)
 * qb.createTable('pedidos', {
 *   cols: {
 *     id: 'SERIAL PRIMARY KEY',
 *     cliente_id: 'INT NOT NULL',
 *     fecha: 'TIMESTAMP'
 *   },
 *   constraints: [
 *     {
 *       name: 'FK_CLIENTE',
 *       type: 'foreign key',
 *       cols: ['cliente_id'],
 *       foreignKey: {
 *         table: 'clientes',
 *         cols: ['id'],
 *         onDelete: 'CASCADE',
 *         onUpdate: 'CASCADE'
 *       }
 *     }
 *   ]
 * });
 * // Genera: CREATE TABLE pedidos (
 * //   id SERIAL PRIMARY KEY,
 * //   cliente_id INT NOT NULL,
 * //   fecha TIMESTAMP,
 * //   CONSTRAINT FK_CLIENTE FOREIGN KEY (cliente_id) 
 * //     REFERENCES clientes(id) 
 * //     ON DELETE CASCADE ON UPDATE CASCADE
 * // )
 * 
 * @example
 * // Tabla con UNIQUE constraint compuesto
 * qb.createTable('ARTISTAS', {
 *   cols: {
 *     ID_ARTISTA: { type: 'INT', values: ['NOT NULL', 'UNIQUE'] },
 *     NOMBRE_ARTISTA: { type: 'VARCHAR(60)', values: ['NOT NULL', 'UNIQUE'] }
 *   },
 *   constraints: [
 *     {
 *       name: 'unicos',
 *       type: 'unique',
 *       cols: ['ID_ARTISTA', 'NOMBRE_ARTISTA']
 *     }
 *   ]
 * });
 * // Genera: CREATE TABLE ARTISTAS (
 * //   ID_ARTISTA INT NOT NULL UNIQUE,
 * //   NOMBRE_ARTISTA VARCHAR(60) NOT NULL UNIQUE,
 * //   CONSTRAINT unicos UNIQUE (ID_ARTISTA, NOMBRE_ARTISTA)
 * // )
 * 
 * @example
 * // Tabla con tipos avanzados de PostgreSQL (JSON, arrays, tipos especiales)
 * qb.createTable('json_table', {
 *   cols: {
 *     id: 'SERIAL PRIMARY KEY',
 *     data: 'JSONB',               // JSON binario (más eficiente)
 *     metadata: 'JSON',             // JSON texto
 *     tags: 'TEXT[]',               // Array de texto
 *     numbers: 'INTEGER[]',         // Array de enteros
 *     ip_address: 'INET',           // Dirección IP
 *     created_at: 'TIMESTAMPTZ'     // Timestamp con zona horaria
 *   }
 * });
 * // Genera: CREATE TABLE json_table (
 * //   id SERIAL PRIMARY KEY,
 * //   data JSONB,
 * //   metadata JSON,
 * //   tags TEXT[],
 * //   numbers INTEGER[],
 * //   ip_address INET,
 * //   created_at TIMESTAMPTZ
 * // )
 * 
 * @example
 * // Tabla temporal global con DELETE ROWS en COMMIT
 * qb.createTable('temp_calculos', {
 *   temporary: 'GLOBAL',
 *   onCommit: 'DELETE',
 *   cols: {
 *     id: 'INT',
 *     resultado: 'NUMERIC(10,2)',
 *     timestamp: 'TIMESTAMP'
 *   }
 * });
 * // Genera: CREATE GLOBAL TEMPORARY TABLE temp_calculos (
 * //   id INT,
 * //   resultado NUMERIC(10,2),
 * //   timestamp TIMESTAMP
 * // ) ON COMMIT DELETE ROWS
 * 
 * @example
 * // Tabla temporal local con PRESERVE ROWS en COMMIT
 * qb.createTable('session_data', {
 *   temporary: 'LOCAL',
 *   onCommit: 'PRESERVE',
 *   cols: {
 *     session_id: 'VARCHAR(64)',
 *     user_id: 'INT',
 *     data: 'TEXT'
 *   }
 * });
 * // Genera: CREATE LOCAL TEMPORARY TABLE session_data (
 * //   session_id VARCHAR(64),
 * //   user_id INT,
 * //   data TEXT
 * // ) ON COMMIT PRESERVE ROWS
 * 
 * @example
 * // Creación segura con IF NOT EXISTS (idempotente)
 * qb.createTable('productos', {
 *   ifNotExists: true,
 *   cols: {
 *     id: 'UUID PRIMARY KEY',
 *     nombre: 'VARCHAR(255) NOT NULL',
 *     precio: 'DECIMAL(10,2)',
 *     stock: 'INT DEFAULT 0'
 *   }
 * });
 * // Genera: CREATE TABLE IF NOT EXISTS productos (
 * //   id UUID PRIMARY KEY,
 * //   nombre VARCHAR(255) NOT NULL,
 * //   precio DECIMAL(10,2),
 * //   stock INT DEFAULT 0
 * // )
 * 
 * @example
 * // Tabla completa con múltiples constraints y tipos avanzados
 * qb.createTable('usuarios_completo', {
 *   ifNotExists: true,
 *   cols: {
 *     id: 'UUID',
 *     email: 'VARCHAR(255)',
 *     password_hash: 'VARCHAR(255)',
 *     profile: 'JSONB',
 *     roles: 'TEXT[]',
 *     created_at: 'TIMESTAMPTZ DEFAULT NOW()',
 *     updated_at: 'TIMESTAMPTZ'
 *   },
 *   constraints: [
 *     {
 *       name: 'PK_usuarios',
 *       type: 'primary key',
 *       cols: ['id']
 *     },
 *     {
 *       name: 'UQ_email',
 *       type: 'unique',
 *       cols: ['email']
 *     },
 *     {
 *       name: 'CHK_email_format',
 *       type: 'check',
 *       check: "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'"
 *     }
 *   ]
 * });
 * 
 * @see {@link types.dropTableOptions} - Para opciones de eliminación de tablas
 * @see {@link Column} - Para tipos de datos y opciones de columna
 */

/**
 * Opciones de configuración para la eliminación de tablas (DROP TABLE).
 * 
 * La eliminación de tablas es una operación DDL destructiva que remueve permanentemente
 * la estructura de la tabla y todos sus datos asociados. Las opciones controlan el
 * comportamiento cuando la tabla no existe o tiene dependencias (vistas, foreign keys).
 * 
 * ⚠️ ADVERTENCIA CRÍTICA: DROP TABLE elimina todos los datos de forma irreversible.
 * - Realice SIEMPRE respaldos completos antes de eliminar tablas en producción
 * - Verifique dependencias (FOREIGN KEYS, VIEWS) que podrían romperse
 * - Use transacciones cuando sea posible para poder hacer ROLLBACK
 * - Considere usar CASCADE solo después de validar el impacto completo
 * 
 * @global
 * @typedef {Object} types.dropTableOptions
 * 
 * @property {boolean} [ifExists] - Si es true, no genera error si la tabla no existe.
 * Equivalente a la cláusula IF EXISTS en SQL.
 * Hace la operación idempotente - puede ejecutarse múltiples veces sin errores.
 * Útil para:
 * - Scripts de migración que pueden ejecutarse repetidamente
 * - Limpieza de entornos de testing
 * - Scripts de despliegue automatizados
 * 
 * Comportamiento:
 * - Con ifExists=true: La operación es silenciosa si la tabla no existe
 * - Sin ifExists: Genera error si la tabla no existe (comportamiento SQL estándar)
 * 
 * Soportado por: PostgreSQL, MySQL, SQLite, SQL Server (con sintaxis alternativa).
 * Sintaxis SQL: DROP TABLE IF EXISTS nombre
 * 
 * @property {boolean} [cascade] - Si es true, elimina la tabla y todos los objetos que dependen de ella.
 * ⚠️ OPERACIÓN MUY PELIGROSA - Elimina automáticamente:
 * - Todas las FOREIGN KEYS que referencian esta tabla desde otras tablas
 * - Todas las VIEWS que utilizan esta tabla en su definición
 * - Todos los TRIGGERS asociados a la tabla
 * - Todos los ÍNDICES definidos en la tabla
 * - Todas las CONSTRAINTS que involucran la tabla
 * 
 * Impacto en cascada:
 * - Puede afectar múltiples tablas relacionadas
 * - Puede romper la integridad referencial de toda la base de datos
 * - La eliminación es recursiva y no solicita confirmación adicional
 * 
 * ⚠️ RECOMENDACIÓN: 
 * 1. Ejecute primero con RESTRICT para ver si hay dependencias
 * 2. Documente todas las dependencias que serán eliminadas
 * 3. Notifique al equipo antes de usar CASCADE en producción
 * 4. Realice respaldo completo antes de la operación
 * 
 * Soportado por: PostgreSQL, Oracle, SQL estándar.
 * No soportado por: MySQL (debe eliminar dependencias manualmente).
 * Sintaxis SQL: DROP TABLE nombre CASCADE
 * 
 * @property {boolean} [restrict] - Si es true, solo elimina la tabla si NO tiene dependencias.
 * Comportamiento seguro predeterminado (es el default implícito en SQL estándar).
 * Genera un error si existen:
 * - FOREIGN KEYS en otras tablas que referencian esta tabla
 * - VIEWS que dependen de esta tabla
 * - Cualquier otro objeto que tenga dependencia directa
 * 
 * Ventajas del modo RESTRICT:
 * - Previene eliminaciones accidentales de datos relacionados
 * - Obliga a revisar y resolver dependencias explícitamente
 * - Mantiene la integridad referencial de la base de datos
 * - Protege contra efectos en cascada no intencionados
 * 
 * Proceso recomendado con RESTRICT:
 * 1. Intente DROP TABLE con RESTRICT
 * 2. Si falla, analice el error para identificar dependencias
 * 3. Decida si eliminar dependencias manualmente o usar CASCADE
 * 4. Documente la decisión y el impacto
 * 
 * Soportado por: PostgreSQL, Oracle, SQL estándar.
 * Sintaxis SQL: DROP TABLE nombre RESTRICT
 * 
 * @property {string} [option] - Alias de texto para especificar 'CASCADE' o 'RESTRICT'.
 * Permite especificar el comportamiento usando strings en lugar de booleanos.
 * Valores permitidos (case-insensitive):
 * - 'CASCADE': Equivalente a { cascade: true }
 * - 'RESTRICT': Equivalente a { restrict: true }
 * 
 * Esta opción es útil cuando se construyen comandos dinámicamente desde
 * configuración externa o interfaces de usuario.
 * 
 * Soportado por: Implementación interna del QueryBuilder.
 * Validación: Solo acepta 'CASCADE' o 'RESTRICT' (ignorado si es otro valor)
 * 
 * @property {boolean} [secure] - Si es true, solicita confirmación antes de eliminar.
 * Opción de seguridad adicional específica de QueryBuilder (no es SQL estándar).
 * Comportamiento específico de implementación:
 * - Puede requerir confirmación interactiva
 * - Puede generar logs adicionales de auditoría
 * - Puede aplicar validaciones de permisos extra
 * 
 * Útil en entornos donde se requiere:
 * - Auditoría de operaciones destructivas
 * - Confirmación explícita para operaciones críticas
 * - Protección contra ejecuciones accidentales
 * 
 * Soportado por: Implementación específica del QueryBuilder.
 * No es parte del SQL estándar.
 * 
 * @example
 * // Eliminación básica (falla si no existe o tiene dependencias)
 * qb.dropTable('tabla_temporal');
 * // Genera: DROP TABLE tabla_temporal
 * 
 * @example
 * // Eliminación segura - no falla si no existe
 * qb.dropTable('tabla_temporal', { ifExists: true });
 * // Genera: DROP TABLE IF EXISTS tabla_temporal
 * 
 * @example
 * // Eliminación con CASCADE - ELIMINA TODAS LAS DEPENDENCIAS
 * qb.dropTable('tabla_principal', { 
 *   ifExists: true,
 *   cascade: true 
 * });
 * // Genera: DROP TABLE IF EXISTS tabla_principal CASCADE
 * // ⚠️ Esto eliminará también:
 * //    - Foreign keys de otras tablas
 * //    - Vistas que usan esta tabla
 * //    - Triggers asociados
 * 
 * @example
 * // Eliminación con RESTRICT - solo si no hay dependencias
 * qb.dropTable('tabla_antigua', { 
 *   ifExists: true,
 *   restrict: true 
 * });
 * // Genera: DROP TABLE IF EXISTS tabla_antigua RESTRICT
 * // Si hay dependencias, genera error y NO elimina nada
 * 
 * @example
 * // Usando la opción option como string
 * qb.dropTable('tabla_test', { 
 *   ifExists: true,
 *   option: 'CASCADE' 
 * });
 * // Genera: DROP TABLE IF EXISTS tabla_test CASCADE
 * 
 * @example
 * // Eliminación segura en entorno de producción
 * qb.dropTable('clientes_legacy', {
 *   ifExists: true,
 *   secure: true,
 *   restrict: true  // Solo elimina si NO hay dependencias
 * });
 * 
 * @example
 * // Limpieza de múltiples tablas de testing
 * const testTables = ['test_users', 'test_products', 'test_orders'];
 * testTables.forEach(table => {
 *   qb.dropTable(table, { 
 *     ifExists: true,
 *     cascade: true  // Tests pueden tener dependencias temporales
 *   });
 * });
 * 
 * @example
 * // Proceso seguro recomendado para producción
 * // 1. Intentar primero con RESTRICT para ver dependencias
 * try {
 *   qb.dropTable('productos_v1', { 
 *     ifExists: true,
 *     restrict: true 
 *   });
 * } catch (error) {
 *   // 2. El error mostrará qué dependencias existen
 *   console.error('Dependencias encontradas:', error.message);
 *   
 *   // 3. Analizar y documentar el impacto
 *   // 4. Si es seguro, proceder con CASCADE
 *   qb.dropTable('productos_v1', { 
 *     ifExists: true,
 *     cascade: true 
 *   });
 * }
 * 
 * @example
 * // Script de migración idempotente
 * // Elimina tabla antigua solo si existe y está vacía de dependencias
 * qb.dropTable('schema_v1.tabla_obsoleta', {
 *   ifExists: true,     // No falla en ejecuciones repetidas
 *   restrict: true      // Solo elimina si no hay dependencias
 * });
 * 
 * @see {@link types.createTableOptions} - Para opciones de creación de tablas
 * @see {@link types.dropSchemaOptions} - Para opciones de eliminación de esquemas
 */

/**
 * Opciones de configuración para definición y modificación de columnas.
 * 
 * Las columnas son los campos individuales que componen una tabla en una base de datos relacional.
 * Este typedef define las opciones disponibles para crear nuevas columnas (con CREATE TABLE o ALTER TABLE ADD COLUMN),
 * modificar columnas existentes (ALTER TABLE ALTER COLUMN) o definir sus propiedades y restricciones.
 * 
 * Estas opciones se usan en múltiples contextos:
 * - **createTable()**: Definir columnas al crear una tabla nueva
 * - **addColumn()**: Agregar columnas a una tabla existente (ALTER TABLE ADD COLUMN)
 * - **alterColumn()**: Modificar propiedades de columnas existentes (ALTER TABLE ALTER COLUMN)
 * 
 * @global
 * @typedef {string|Object} types.columnOptions
 * 
 * Cuando se especifica como **string simple**:
 * - Representa el tipo de dato SQL completo de la columna
 * - Puede incluir modificadores y restricciones en una sola cadena
 * - Formato: 'TIPO_DATO [MODIFICADORES] [RESTRICCIONES]'
 * - Ejemplo: 'VARCHAR(255) NOT NULL', 'INTEGER PRIMARY KEY', 'TIMESTAMP DEFAULT NOW()'
 * 
 * Cuando se especifica como **objeto estructurado**, acepta las siguientes propiedades:
 * 
 * @property {string} type - **OBLIGATORIO cuando se usa objeto**. Tipo de dato SQL de la columna.
 * Especifica el tipo de dato que almacenará la columna.
 * Tipos comunes:
 * - **Numéricos**: INTEGER, INT, SMALLINT, BIGINT, DECIMAL(p,s), NUMERIC(p,s), FLOAT, DOUBLE, REAL
 * - **Texto**: VARCHAR(n), CHAR(n), TEXT, CHARACTER(n)
 * - **Fecha/Hora**: DATE, TIME, TIMESTAMP, TIMESTAMPTZ, INTERVAL
 * - **Booleanos**: BOOLEAN, BOOL
 * - **Binarios**: BYTEA, BLOB
 * - **JSON** (PostgreSQL): JSON, JSONB
 * - **Arrays** (PostgreSQL): INTEGER[], TEXT[], VARCHAR(255)[]
 * - **Especiales** (PostgreSQL): UUID, INET, CIDR, MACADDR, XML
 * - **Especiales** (MySQL): ENUM, SET
 * - **Secuencias** (PostgreSQL): SERIAL, BIGSERIAL, SMALLSERIAL
 * 
 * El tipo de dato se convertirá automáticamente al dialecto SQL del motor de base de datos configurado.
 * 
 * @property {Array<string>} [values] - Array de restricciones de columna (column constraints).
 * Especifica restricciones que se aplican directamente a la columna individual.
 * Restricciones soportadas:
 * - **'NOT NULL'**: La columna no puede contener valores NULL (obligatoria)
 * - **'UNIQUE'**: Todos los valores en la columna deben ser únicos
 * - **'PRIMARY KEY'**: Define esta columna como clave primaria (implica NOT NULL y UNIQUE)
 * 
 * Valores case-insensitive: 'not null', 'NOT NULL', 'Not Null' son equivalentes.
 * Se pueden combinar múltiples restricciones: ['NOT NULL', 'UNIQUE']
 * 
 * ⚠️ Nota: PRIMARY KEY en una sola columna es equivalente a una PRIMARY KEY constraint a nivel de tabla.
 * Para claves primarias compuestas (múltiples columnas), use table constraints en createTableOptions.
 * 
 * Soportado por: Todos los SGBDs (PostgreSQL, MySQL, SQL Server, SQLite, Oracle).
 * Sintaxis SQL: nombre_columna tipo_dato NOT NULL UNIQUE
 * 
 * @property {*} [default] - Valor predeterminado para la columna cuando no se proporciona valor explícito.
 * Especifica el valor que se insertará automáticamente si no se proporciona uno al crear una fila.
 * 
 * Tipos de valores default:
 * - **Valores literales**: Números (42), strings ('texto'), booleanos (true/false)
 * - **Funciones SQL**: NOW(), CURRENT_TIMESTAMP, CURRENT_DATE, UUID_GENERATE_V4()
 * - **Expresiones SQL**: (SELECT MAX(id) FROM tabla), 'literal' || suffix
 * - **NULL**: Valor NULL explícito
 * 
 * Formateo automático:
 * - Strings se envuelven automáticamente en comillas simples: 'valor'
 * - Números y funciones se pasan tal cual: 42, NOW()
 * 
 * Ejemplos de defaults comunes:
 * - Timestamps: NOW(), CURRENT_TIMESTAMP, CURRENT_DATE
 * - Secuencias: NEXTVAL('mi_secuencia')
 * - UUID: UUID_GENERATE_V4() (requiere extensión uuid-ossp en PostgreSQL)
 * - Valores estáticos: 0, 'Desconocido', true
 * 
 * Soportado por: Todos los SGBDs.
 * Sintaxis SQL: DEFAULT valor_o_funcion
 * 
 * @property {Object|Array} [foreignKey] - Definición de clave foránea (FOREIGN KEY constraint).
 * Establece una relación de integridad referencial con otra tabla.
 * Especifica que los valores de esta columna deben existir en la columna referenciada de la tabla padre.
 * 
 * Estructura del objeto foreignKey:
 * - **table** (string): Nombre de la tabla padre referenciada
 * - **cols** (string|Array<string>): Columna(s) en la tabla padre que se referencian
 * - **match** (string): Tipo de coincidencia - 'FULL', 'PARTIAL', 'SIMPLE'
 * - **onDelete** (string): Acción al eliminar fila padre - 'CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT', 'NO ACTION'
 * - **onUpdate** (string): Acción al actualizar fila padre - 'CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT', 'NO ACTION'
 * 
 * Acciones de integridad referencial:
 * - **CASCADE**: Propaga la eliminación/actualización a las filas hijas
 * - **SET NULL**: Establece la columna en NULL en filas hijas
 * - **SET DEFAULT**: Establece el valor DEFAULT en filas hijas
 * - **RESTRICT**: Rechaza la operación si hay filas hijas (genera error)
 * - **NO ACTION**: Similar a RESTRICT pero se verifica al final de la transacción
 * 
 * Match types:
 * - **SIMPLE**: Default. Permite NULL en columnas de FK compuestas
 * - **FULL**: FK compuesta debe tener todos valores NULL o ninguno
 * - **PARTIAL**: No soportado ampliamente, usar SIMPLE
 * 
 * ⚠️ Consideraciones:
 * - La tabla padre debe existir antes de crear la FK
 * - La columna referenciada debe tener UNIQUE o PRIMARY KEY constraint
 * - Los tipos de datos deben coincidir entre columnas
 * - CASCADE puede eliminar datos en múltiples tablas - usar con cuidado
 * 
 * Soportado por: PostgreSQL, MySQL (InnoDB), SQL Server, Oracle, SQL estándar.
 * SQLite: FK soportadas pero deben habilitarse con PRAGMA foreign_keys = ON
 * 
 * @property {string} [check] - Expresión de validación CHECK constraint.
 * Define una condición SQL que debe cumplirse para cada valor en la columna.
 * La expresión debe evaluarse a TRUE o NULL para que se acepte el valor.
 * 
 * Expresiones CHECK comunes:
 * - Rangos numéricos: 'edad >= 18', 'precio > 0'
 * - Listas de valores: 'estado IN (\'activo\', \'inactivo\', \'suspendido\')'
 * - Validaciones de texto: 'LENGTH(codigo) = 5', 'email LIKE \'%@%.%\''
 * - Comparaciones entre columnas: 'fecha_fin > fecha_inicio'
 * - Expresiones regex (PostgreSQL): 'codigo ~ \'^[A-Z]{3}[0-9]{3}$\''
 * 
 * Limitaciones:
 * - No puede referenciar columnas de otras tablas (use triggers para eso)
 * - No puede usar subconsultas
 * - No puede llamar funciones no-deterministas (NOW(), RANDOM())
 * - Solo puede referenciar la columna actual en constraints de columna
 * 
 * CHECK vs FOREIGN KEY:
 * - CHECK: Valida valores contra una expresión SQL estática
 * - FK: Valida valores contra datos existentes en otra tabla
 * 
 * Rendimiento:
 * - Las CHECK constraints se evalúan en cada INSERT/UPDATE
 * - Pueden impactar rendimiento en tablas con alta frecuencia de escritura
 * - Considere validar en la aplicación para checks complejos
 * 
 * Soportado por: PostgreSQL, SQL Server, Oracle, SQLite, SQL estándar.
 * MySQL: CHECK soportado desde 8.0.16 (anteriormente se ignoraba silenciosamente)
 * 
 * @example
 * // 1. Definición simple con string (tipo de dato solo)
 * qb.createTable('usuarios', {
 *   cols: {
 *     id: 'SERIAL PRIMARY KEY',           // String simple con restricción
 *     nombre: 'VARCHAR(100)',              // String simple sin restricciones
 *     email: 'VARCHAR(255) UNIQUE',        // String simple con UNIQUE
 *     created_at: 'TIMESTAMP DEFAULT NOW()' // String simple con default
 *   }
 * });
 * 
 * @example
 * // 2. Definición con objeto - columna con tipo y restricciones
 * qb.addColumn('edad', {
 *   type: 'INT',
 *   values: ['NOT NULL'],
 *   default: 0
 * });
 * // Genera: ADD COLUMN edad INT NOT NULL DEFAULT 0
 * 
 * @example
 * // 3. Columna con múltiples restricciones
 * qb.addColumn('codigo_producto', {
 *   type: 'VARCHAR(20)',
 *   values: ['NOT NULL', 'UNIQUE'],
 *   check: "LENGTH(codigo_producto) >= 5"
 * });
 * // Genera: ADD COLUMN codigo_producto VARCHAR(20) NOT NULL UNIQUE 
 * //         CHECK ( LENGTH(codigo_producto) >= 5 )
 * 
 * @example
 * // 4. Columna con FOREIGN KEY
 * qb.addColumn('cliente_id', {
 *   type: 'INTEGER',
 *   values: ['NOT NULL'],
 *   foreignKey: {
 *     table: 'clientes',
 *     cols: 'id',
 *     onDelete: 'CASCADE',
 *     onUpdate: 'CASCADE'
 *   }
 * });
 * // Genera: ADD COLUMN cliente_id INTEGER NOT NULL 
 * //         REFERENCES clientes(id) ON DELETE CASCADE ON UPDATE CASCADE
 * 
 * @example
 * // 5. Columna con DEFAULT usando función SQL
 * qb.addColumn('fecha_registro', {
 *   type: 'TIMESTAMPTZ',
 *   default: 'NOW()',
 *   values: ['NOT NULL']
 * });
 * // Genera: ADD COLUMN fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * 
 * @example
 * // 6. Columna UUID con generación automática
 * qb.addColumn('uuid', {
 *   type: 'UUID',
 *   default: 'UUID_GENERATE_V4()',
 *   values: ['PRIMARY KEY']
 * });
 * // Genera: ADD COLUMN uuid UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4()
 * 
 * @example
 * // 7. Columna con CHECK constraint complejo
 * qb.addColumn('precio', {
 *   type: 'DECIMAL(10,2)',
 *   values: ['NOT NULL'],
 *   check: 'precio > 0 AND precio < 1000000',
 *   default: 0.00
 * });
 * // Genera: ADD COLUMN precio DECIMAL(10,2) NOT NULL DEFAULT 0.00 
 * //         CHECK ( precio > 0 AND precio < 1000000 )
 * 
 * @example
 * // 8. Columna de estado con CHECK de lista de valores
 * qb.addColumn('estado', {
 *   type: 'VARCHAR(20)',
 *   values: ['NOT NULL'],
 *   check: "estado IN ('pendiente', 'procesado', 'cancelado', 'completado')",
 *   default: 'pendiente'
 * });
 * // Genera: ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
 * //         CHECK ( estado IN ('pendiente', 'procesado', 'cancelado', 'completado') )
 * 
 * @example
 * // 9. Columna con FOREIGN KEY y MATCH type
 * qb.addColumn('producto_id', {
 *   type: 'INT',
 *   foreignKey: {
 *     table: 'productos',
 *     cols: ['id'],
 *     match: 'SIMPLE',
 *     onDelete: 'SET NULL',
 *     onUpdate: 'CASCADE'
 *   }
 * });
 * // Genera: ADD COLUMN producto_id INT 
 * //         REFERENCES productos(id) MATCH SIMPLE 
 * //         ON DELETE SET NULL ON UPDATE CASCADE
 * 
 * @example
 * // 10. Tipos avanzados de PostgreSQL
 * qb.createTable('logs', {
 *   cols: {
 *     id: 'BIGSERIAL PRIMARY KEY',
 *     data: { type: 'JSONB', default: '{}' },
 *     tags: { type: 'TEXT[]', default: 'ARRAY[]::TEXT[]' },
 *     ip_address: 'INET',
 *     created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
 *   }
 * });
 * 
 * @example
 * // 11. Columna de email con CHECK regex (PostgreSQL)
 * qb.addColumn('email', {
 *   type: 'VARCHAR(255)',
 *   values: ['NOT NULL', 'UNIQUE'],
 *   check: "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'"
 * });
 * // Genera: ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE 
 * //         CHECK ( email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' )
 * 
 * @see {@link types.createTableOptions} - Para opciones completas de creación de tablas
 * @see {@link Column} - Clase Column para manipulación de columnas en consultas
 */

/**
 * Opciones de configuración para añadir restricciones (constraints) a tablas.
 * 
 * Las constraints son reglas de integridad que aseguran la validez y consistencia de los datos
 * en una base de datos. Se pueden agregar al crear una tabla (table constraints en createTableOptions)
 * o posteriormente mediante ALTER TABLE con addConstraint().
 * 
 * Este typedef define las opciones para addConstraint(), que permite añadir constraints
 * a tablas existentes después de su creación inicial.
 * 
 * @global
 * @typedef {Object} types.constraintOptions
 * 
 * @property {string} type - **OBLIGATORIO**. Tipo de constraint a crear.
 * Define el tipo de restricción de integridad que se aplicará.
 * 
 * Tipos de constraints soportados:
 * 
 * **PRIMARY KEY** ('primary key' o 'pk'):
 * - Define la clave primaria de la tabla
 * - Garantiza unicidad e identifica de forma única cada fila
 * - No permite valores NULL
 * - Solo puede haber una PRIMARY KEY por tabla
 * - Puede ser compuesta (múltiples columnas)
 * - Crea automáticamente un índice único
 * - Sintaxis SQL: PRIMARY KEY (columna1, columna2, ...)
 * 
 * **FOREIGN KEY** ('foreign key' o 'fk'):
 * - Establece relación de integridad referencial con otra tabla
 * - Asegura que valores en columna hija existan en columna padre
 * - Permite especificar acciones CASCADE, SET NULL, etc.
 * - Requiere que la columna referenciada sea UNIQUE o PRIMARY KEY
 * - Sintaxis SQL: FOREIGN KEY (col) REFERENCES tabla(col)
 * 
 * **UNIQUE**:
 * - Garantiza que todos los valores en las columnas sean únicos
 * - Permite NULL (a diferencia de PRIMARY KEY)
 * - Puede tener múltiples UNIQUE constraints por tabla
 * - Puede ser compuesta (unicidad en combinación de columnas)
 * - Crea automáticamente un índice único
 * - Sintaxis SQL: UNIQUE (columna1, columna2, ...)
 * 
 * **CHECK**:
 * - Valida que los datos cumplan una expresión booleana
 * - Evalúa la expresión en cada INSERT/UPDATE
 * - Rechaza operaciones si la expresión es FALSE
 * - Permite expresiones complejas con múltiples columnas
 * - Sintaxis SQL: CHECK (expresion_booleana)
 * 
 * **EXCLUDE** (PostgreSQL específico):
 * - Previene que dos filas cumplan cierta condición simultáneamente
 * - Útil para rangos de fechas sin solapamiento, geometrías, etc.
 * - Requiere operador de exclusión y método de índice (GiST, SP-GiST)
 * - Sintaxis SQL: EXCLUDE USING gist (columna WITH operador)
 * 
 * Soportado por: PostgreSQL, MySQL, SQL Server, Oracle, SQL estándar.
 * 
 * @property {string|Array<string>} [columns] - Columna(s) afectada(s) por la constraint.
 * Especifica las columnas sobre las que se aplicará la restricción.
 * 
 * Formato:
 * - **String simple**: Nombre de una sola columna - 'id'
 * - **Array**: Múltiples columnas para constraints compuestas - ['columna1', 'columna2']
 * 
 * Usado en:
 * - PRIMARY KEY: Define qué columna(s) forman la clave primaria
 * - FOREIGN KEY: Define qué columna(s) locales referencian a otra tabla
 * - UNIQUE: Define qué columna(s) deben tener valores únicos
 * 
 * NO usado en:
 * - CHECK: La expresión ya especifica las columnas involucradas
 * - EXCLUDE: Las columnas se especifican en la expresión
 * 
 * Para PRIMARY KEY y UNIQUE compuestas:
 * - La unicidad se evalúa sobre la combinación de todas las columnas
 * - Ejemplo: ['nombre', 'email'] - la combinación debe ser única
 * 
 * Soportado por: Todos los SGBDs.
 * 
 * @property {Object} [options] - Opciones adicionales específicas del tipo de constraint.
 * Objeto que contiene configuraciones específicas según el tipo de constraint.
 * 
 * Para **FOREIGN KEY** (options.references, options.referencedColumns, etc.):
 * 
 * **options.references** (string) - OBLIGATORIO para FK:
 * - Nombre de la tabla padre que contiene los valores referenciados
 * - Formato: 'nombre_tabla' o 'esquema.nombre_tabla'
 * - La tabla debe existir antes de crear la FK
 * - Ejemplo: 'clientes', 'public.usuarios'
 * 
 * **options.referencedColumns** (string|Array<string>):
 * - Columna(s) en la tabla padre que son referenciadas
 * - Debe tener UNIQUE o PRIMARY KEY constraint
 * - Si se omite, usa la PRIMARY KEY de la tabla padre
 * - Debe coincidir en número y tipos con `columns`
 * - Ejemplo: 'id', ['columna1', 'columna2']
 * 
 * **options.onDelete** (string) - Acción al eliminar fila padre:
 * - **'CASCADE'**: Elimina automáticamente las filas hijas (⚠️ PELIGROSO)
 * - **'SET NULL'**: Establece la FK en NULL en filas hijas
 * - **'SET DEFAULT'**: Establece el valor DEFAULT en filas hijas
 * - **'RESTRICT'**: Rechaza la eliminación si hay filas hijas (default)
 * - **'NO ACTION'**: Similar a RESTRICT, verifica al final de transacción
 * 
 * **options.onUpdate** (string) - Acción al actualizar fila padre:
 * - Mismos valores que onDelete
 * - **'CASCADE'**: Actualiza automáticamente las FKs en filas hijas
 * - **'RESTRICT'**: Rechaza la actualización si hay filas hijas
 * 
 * **options.match** (string) - Tipo de coincidencia para FK compuestas:
 * - **'SIMPLE'**: Default. Permite NULL en algunas columnas de FK compuesta
 * - **'FULL'**: FK compuesta debe tener todos NULL o todos con valor
 * - **'PARTIAL'**: No ampliamente soportado
 * 
 * Para **CHECK** (options.expression):
 * 
 * **options.expression** (string) - OBLIGATORIO para CHECK:
 * - Expresión booleana SQL que debe evaluarse a TRUE
 * - Puede referenciar múltiples columnas de la tabla
 * - Rechaza INSERT/UPDATE si la expresión es FALSE
 * - Ejemplos:
 *   * 'precio > 0'
 *   * 'fecha_fin > fecha_inicio'
 *   * 'estado IN (\'activo\', \'inactivo\')'
 *   * 'cantidad >= 0 AND cantidad <= 1000'
 * 
 * Para **EXCLUDE** (options.expression) - PostgreSQL específico:
 * 
 * **options.expression** (string) - OBLIGATORIO para EXCLUDE:
 * - Define el método de índice y las condiciones de exclusión
 * - Formato: 'USING método_indice (columna WITH operador, ...)'
 * - Métodos: GIST, SP-GIST, BTREE, HASH
 * - Operadores comunes: &&, =, <>, !, @>, <@
 * - Ejemplo: 'USING gist (periodo WITH &&)' - rangos sin solapamiento
 * 
 * @property {string} [check] - Atajo para expresión CHECK (alternativa a options.expression).
 * Permite especificar la expresión CHECK directamente sin usar options.expression.
 * Es una forma más concisa cuando solo se necesita una expresión CHECK simple.
 * 
 * Uso:
 * - `{ type: 'check', check: 'precio > 0' }` 
 * - Equivalente a: `{ type: 'check', options: { expression: 'precio > 0' } }`
 * 
 * Útil para constraints CHECK simples y código más legible.
 * 
 * @example
 * // 1. PRIMARY KEY simple (una sola columna)
 * qb.alterTable('usuarios')
 *   .addConstraint('PK_usuarios', {
 *     type: 'primary key',
 *     columns: 'id'
 *   });
 * // Genera: ALTER TABLE usuarios ADD CONSTRAINT PK_usuarios PRIMARY KEY (id)
 * 
 * @example
 * // 2. PRIMARY KEY compuesta (múltiples columnas)
 * qb.alterTable('pedidos_detalle')
 *   .addConstraint('PK_pedido_producto', {
 *     type: 'pk',
 *     columns: ['pedido_id', 'producto_id']
 *   });
 * // Genera: ALTER TABLE pedidos_detalle 
 * //         ADD CONSTRAINT PK_pedido_producto PRIMARY KEY (pedido_id, producto_id)
 * 
 * @example
 * // 3. FOREIGN KEY básica
 * qb.alterTable('pedidos')
 *   .addConstraint('FK_cliente', {
 *     type: 'foreign key',
 *     columns: 'cliente_id',
 *     options: {
 *       references: 'clientes'
 *       // Usa la PRIMARY KEY de 'clientes' automáticamente
 *     }
 *   });
 * // Genera: ALTER TABLE pedidos 
 * //         ADD CONSTRAINT FK_cliente FOREIGN KEY (cliente_id) REFERENCES clientes
 * 
 * @example
 * // 4. FOREIGN KEY con columna referenciada explícita
 * qb.alterTable('pedidos')
 *   .addConstraint('FK_cliente', {
 *     type: 'fk',
 *     columns: 'cliente_id',
 *     options: {
 *       references: 'clientes',
 *       referencedColumns: 'id'
 *     }
 *   });
 * // Genera: ALTER TABLE pedidos 
 * //         ADD CONSTRAINT FK_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
 * 
 * @example
 * // 5. FOREIGN KEY con acciones de integridad referencial
 * qb.alterTable('pedidos')
 *   .addConstraint('FK_cliente', {
 *     type: 'foreign key',
 *     columns: 'cliente_id',
 *     options: {
 *       references: 'clientes',
 *       referencedColumns: 'id',
 *       onDelete: 'CASCADE',      // ⚠️ Elimina pedidos si se elimina cliente
 *       onUpdate: 'CASCADE'       // Actualiza pedidos si cambia ID de cliente
 *     }
 *   });
 * // Genera: ALTER TABLE pedidos 
 * //         ADD CONSTRAINT FK_cliente FOREIGN KEY (cliente_id) 
 * //         REFERENCES clientes(id) 
 * //         ON DELETE CASCADE ON UPDATE CASCADE
 * 
 * @example
 * // 6. FOREIGN KEY segura con SET NULL
 * qb.alterTable('pedidos')
 *   .addConstraint('FK_vendedor', {
 *     type: 'foreign key',
 *     columns: 'vendedor_id',
 *     options: {
 *       references: 'empleados',
 *       referencedColumns: 'id',
 *       onDelete: 'SET NULL',     // Mantiene pedidos aunque se elimine vendedor
 *       onUpdate: 'CASCADE'
 *     }
 *   });
 * // Genera: ALTER TABLE pedidos 
 * //         ADD CONSTRAINT FK_vendedor FOREIGN KEY (vendedor_id) 
 * //         REFERENCES empleados(id) 
 * //         ON DELETE SET NULL ON UPDATE CASCADE
 * 
 * @example
 * // 7. UNIQUE simple
 * qb.alterTable('usuarios')
 *   .addConstraint('UQ_email', {
 *     type: 'unique',
 *     columns: 'email'
 *   });
 * // Genera: ALTER TABLE usuarios ADD CONSTRAINT UQ_email UNIQUE (email)
 * 
 * @example
 * // 8. UNIQUE compuesta
 * qb.alterTable('artistas')
 *   .addConstraint('UQ_nombre_fecha', {
 *     type: 'unique',
 *     columns: ['nombre_artista', 'fecha_nacimiento']
 *   });
 * // Genera: ALTER TABLE artistas 
 * //         ADD CONSTRAINT UQ_nombre_fecha UNIQUE (nombre_artista, fecha_nacimiento)
 * 
 * @example
 * // 9. CHECK simple
 * qb.alterTable('productos')
 *   .addConstraint('CK_precio_positivo', {
 *     type: 'check',
 *     options: {
 *       expression: 'precio > 0'
 *     }
 *   });
 * // Genera: ALTER TABLE productos 
 * //         ADD CONSTRAINT CK_precio_positivo CHECK (precio > 0)
 * 
 * @example
 * // 10. CHECK usando atajo 'check'
 * qb.alterTable('productos')
 *   .addConstraint('CK_stock', {
 *     type: 'check',
 *     check: qb.and(qb.gt('stock', 0), qb.lt('stock', 1000))
 *   });
 * // Genera: ALTER TABLE productos 
 * //         ADD CONSTRAINT CK_stock CHECK (stock > 0 AND stock < 1000)
 * 
 * @example
 * // 11. CHECK con múltiples condiciones
 * qb.alterTable('reservas')
 *   .addConstraint('CK_fechas_validas', {
 *     type: 'check',
 *     options: {
 *       expression: 'fecha_fin > fecha_inicio AND fecha_inicio >= CURRENT_DATE'
 *     }
 *   });
 * // Genera: ALTER TABLE reservas 
 * //         ADD CONSTRAINT CK_fechas_validas 
 * //         CHECK (fecha_fin > fecha_inicio AND fecha_inicio >= CURRENT_DATE)
 * 
 * @example
 * // 12. CHECK con lista de valores permitidos
 * qb.alterTable('pedidos')
 *   .addConstraint('CK_estado', {
 *     type: 'check',
 *     options: {
 *       expression: "estado IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado')"
 *     }
 *   });
 * // Genera: ALTER TABLE pedidos 
 * //         ADD CONSTRAINT CK_estado 
 * //         CHECK (estado IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'))
 * 
 * @example
 * // 13. EXCLUDE para rangos sin solapamiento (PostgreSQL)
 * qb.alterTable('reservas_salas')
 *   .addConstraint('EX_sin_solapamiento', {
 *     type: 'exclude',
 *     options: {
 *       expression: 'USING gist (sala_id WITH =, periodo WITH &&)'
 *     }
 *   });
 * // Genera: ALTER TABLE reservas_salas 
 * //         ADD CONSTRAINT EX_sin_solapamiento 
 * //         EXCLUDE USING gist (sala_id WITH =, periodo WITH &&)
 * // Evita que dos reservas de la misma sala se solapen en el tiempo
 * 
 * @example
 * // 14. FOREIGN KEY compuesta
 * qb.alterTable('pedidos_detalle')
 *   .addConstraint('FK_producto_proveedor', {
 *     type: 'foreign key',
 *     columns: ['producto_id', 'proveedor_id'],
 *     options: {
 *       references: 'productos_proveedores',
 *       referencedColumns: ['producto_id', 'proveedor_id'],
 *       onDelete: 'RESTRICT',
 *       onUpdate: 'CASCADE'
 *     }
 *   });
 * // Genera: ALTER TABLE pedidos_detalle 
 * //         ADD CONSTRAINT FK_producto_proveedor 
 * //         FOREIGN KEY (producto_id, proveedor_id) 
 * //         REFERENCES productos_proveedores(producto_id, proveedor_id) 
 * //         ON DELETE RESTRICT ON UPDATE CASCADE
 * 
 * @see {@link types.createTableOptions} - Para constraints al crear tablas (table constraints)
 * @see {@link types.columnOptions} - Para constraints de columna individual (column constraints)
 */

/**
 * Opciones de configuración para la creación de tipos de datos definidos por el usuario (CREATE TYPE).
 * 
 * Los tipos personalizados (User-Defined Types - UDT) permiten extender el sistema de tipos
 * de la base de datos, creando abstracciones de datos más expresivas y reutilizables.
 * Son especialmente útiles en PostgreSQL y Oracle para modelar datos estructurados complejos.
 * 
 * CREATE TYPE soporta diferentes variantes según el SGBD:
 * - **Tipos alias/base**: Alias para tipos de datos existentes
 * - **Tipos ENUM**: Conjuntos enumerados de valores predefinidos
 * - **Tipos compuestos/composite**: Estructuras con múltiples campos (como structs)
 * - **Tipos RANGE**: Rangos de valores (PostgreSQL)
 * - **Tipos objeto**: Tipos con métodos (Oracle)
 * 
 * @global
 * @typedef {Object} types.createTypeOptions
 * 
 * @property {string|Object} as - **OBLIGATORIO**. Define el tipo de dato personalizado a crear.
 * 
 * Esta propiedad determina la naturaleza del tipo y su estructura.
 * Su formato varía según el tipo de dato que se quiera crear:
 * 
 * **1. Tipo alias/base** (as: string con tipo SQL):
 * - Crea un alias para un tipo de datos SQL existente
 * - Útil para dar semántica de dominio a tipos estándar
 * - Formato: String con tipo SQL completo
 * - Ejemplos: 'NUMERIC(8,2)', 'VARCHAR(255)', 'TEXT', 'INTEGER'
 * - Sintaxis SQL: CREATE TYPE nombre AS tipo_base
 * - Uso: Definir 'salario' como NUMERIC(8,2), 'codigo_postal' como VARCHAR(10)
 * 
 * **2. Tipo ENUM** (as: 'ENUM'):
 * - Crea un tipo enumerado con conjunto fijo de valores
 * - Los valores se definen en la propiedad `values`
 * - Solo permite asignar uno de los valores predefinidos
 * - Formato: as = 'ENUM' (literal string)
 * - Requiere: options.values = Array<string>
 * - Sintaxis SQL: CREATE TYPE nombre AS ENUM ('valor1', 'valor2', ...)
 * - Uso típico: estados, categorías, roles, prioridades
 * - Ventajas:
 *   * Validación automática de valores
 *   * Autocompletado en herramientas
 *   * Eficiencia de almacenamiento
 *   * Documentación implícita de valores válidos
 * 
 * **3. Tipo COMPOSITE** (as: 'COMPOSITE'):
 * - Crea un tipo compuesto con múltiples campos/atributos
 * - Similar a un struct en lenguajes de programación
 * - Los campos se definen en la propiedad `attributes`
 * - Formato: as = 'COMPOSITE' (literal string)
 * - Requiere: options.attributes = Object<string, string>
 * - Sintaxis SQL: CREATE TYPE nombre AS (campo1 tipo1, campo2 tipo2, ...)
 * - Uso típico: direcciones, coordenadas, datos complejos anidados
 * - Ventajas:
 *   * Agrupa datos relacionados
 *   * Reutilizable en múltiples tablas
 *   * Puede usarse en parámetros de funciones
 *   * Permite arrays de tipos compuestos
 * 
 * **4. Tipo COMPOSITE directo** (as: Object):
 * - Alternativa para definir tipo compuesto sin usar 'COMPOSITE' string
 * - El objeto define directamente los campos y sus tipos
 * - Formato: as = { campo1: 'tipo1', campo2: 'tipo2', ... }
 * - No requiere options.attributes
 * - Más conciso para definiciones inline
 * - Mismo resultado SQL que as: 'COMPOSITE' + attributes
 * 
 * Soportado por:
 * - PostgreSQL: ✅ Todos los tipos (base, ENUM, composite, range)
 * - Oracle: ✅ Tipos objeto con métodos
 * - SQL Server: ⚠️ User-defined types limitados
 * - MySQL: ❌ No soporta CREATE TYPE (usa ENUM en columnas)
 * - SQLite: ❌ No soporta tipos personalizados
 * 
 * @property {Array<string>} [values] - Valores permitidos para tipos ENUM.
 * Array de strings que define el conjunto cerrado de valores válidos para el tipo enumerado.
 * 
 * Solo aplicable cuando: as = 'ENUM'
 * 
 * Características:
 * - Cada valor debe ser único en el array
 * - Los valores son case-sensitive
 * - El orden en el array define el orden de comparación y ordenamiento
 * - Se pueden agregar valores posteriormente con ALTER TYPE (PostgreSQL)
 * - No se pueden eliminar valores de un ENUM existente fácilmente
 * 
 * Formato: Array de strings literales
 * - Ejemplo: ['active', 'inactive', 'pending', 'suspended']
 * 
 * Generación SQL:
 * - Los valores se envuelven automáticamente en comillas simples
 * - Se separan por comas: 'valor1', 'valor2', 'valor3'
 * - Sintaxis final: CREATE TYPE nombre AS ENUM ('valor1', 'valor2')
 * 
 * Casos de uso comunes:
 * - Estados de procesos: ['pendiente', 'procesando', 'completado', 'cancelado']
 * - Roles de usuario: ['admin', 'editor', 'viewer', 'guest']
 * - Prioridades: ['baja', 'media', 'alta', 'crítica']
 * - Días de semana: ['lunes', 'martes', 'miércoles', ...]
 * - Categorías fijas: ['producto', 'servicio', 'suscripción']
 * 
 * Mejores prácticas:
 * - Use valores descriptivos y autoexplicativos
 * - Mantenga consistencia en el formato (lowercase, snake_case, etc.)
 * - Considere internacionalización si es necesario
 * - Documente el significado de cada valor
 * - Evite valores excesivamente genéricos ('tipo1', 'tipo2')
 * 
 * Soportado por: PostgreSQL, Oracle (limitado).
 * 
 * @property {Object<string, string>} [attributes] - Campos/atributos para tipos COMPOSITE.
 * Objeto que define la estructura del tipo compuesto especificando cada campo y su tipo de dato.
 * 
 * Solo aplicable cuando: as = 'COMPOSITE'
 * 
 * Formato:
 * - Claves: Nombres de los campos del tipo compuesto
 * - Valores: Tipos de datos SQL para cada campo
 * - Ejemplo: { street: 'VARCHAR(100)', city: 'VARCHAR(50)', zipcode: 'VARCHAR(10)' }
 * 
 * Estructura:
 * ```javascript
 * attributes: {
 *   nombre_campo1: 'TIPO_SQL',
 *   nombre_campo2: 'TIPO_SQL(tamaño)',
 *   nombre_campo3: 'TIPO_SQL'
 * }
 * ```
 * 
 * Los campos se convierten en:
 * - CREATE TYPE nombre AS (nombre_campo1 TIPO_SQL, nombre_campo2 TIPO_SQL, ...)
 * 
 * Tipos de datos soportados en atributos:
 * - Todos los tipos SQL estándar: VARCHAR, INTEGER, NUMERIC, TIMESTAMP, etc.
 * - Arrays: TEXT[], INTEGER[]
 * - Otros tipos personalizados: otros_tipos_composite, enums_personalizados
 * - Tipos específicos PostgreSQL: UUID, JSONB, INET
 * 
 * Casos de uso comunes:
 * 
 * **Dirección**:
 * ```javascript
 * attributes: {
 *   calle: 'VARCHAR(100)',
 *   ciudad: 'VARCHAR(50)',
 *   estado: 'VARCHAR(30)',
 *   codigo_postal: 'VARCHAR(10)',
 *   pais: 'VARCHAR(50)'
 * }
 * ```
 * 
 * **Coordenadas geográficas**:
 * ```javascript
 * attributes: {
 *   latitud: 'DECIMAL(10,8)',
 *   longitud: 'DECIMAL(11,8)',
 *   altitud: 'INTEGER'
 * }
 * ```
 * 
 * **Información de contacto**:
 * ```javascript
 * attributes: {
 *   tipo: 'VARCHAR(20)',
 *   valor: 'VARCHAR(255)',
 *   verificado: 'BOOLEAN',
 *   fecha_verificacion: 'TIMESTAMP'
 * }
 * ```
 * 
 * **Rango de precios**:
 * ```javascript
 * attributes: {
 *   minimo: 'DECIMAL(10,2)',
 *   maximo: 'DECIMAL(10,2)',
 *   moneda: 'VARCHAR(3)'
 * }
 * ```
 * 
 * Ventajas de tipos compuestos:
 * - Encapsulación de datos relacionados
 * - Reutilización en múltiples tablas
 * - Puede usarse como tipo de columna: direccion address_type
 * - Puede usarse en arrays: contactos contact_type[]
 * - Puede usarse en parámetros de funciones
 * - Mejora legibilidad del esquema
 * 
 * Acceso a campos:
 * - En consultas: (columna).campo
 * - Ejemplo: SELECT (direccion).calle, (direccion).ciudad FROM usuarios
 * 
 * Soportado por: PostgreSQL, Oracle (como object types).
 * 
 * @property {boolean} [final] - Especifica si el tipo es FINAL o NOT FINAL (SQL estándar/Oracle).
 * Controla si el tipo puede ser heredado o extendido por otros tipos.
 * 
 * Solo relevante en: Oracle, SQL estándar (tipos objeto con herencia)
 * No aplicable en: PostgreSQL (no soporta herencia de tipos)
 * 
 * Valores:
 * - **true**: Tipo FINAL - no puede ser heredado ni extendido
 * - **false**: Tipo NOT FINAL - permite crear subtipos derivados
 * - **undefined**: Comportamiento default del SGBD
 * 
 * Sintaxis SQL:
 * - final: true → CREATE TYPE nombre AS ... FINAL
 * - final: false → CREATE TYPE nombre AS ... NOT FINAL
 * 
 * Contexto de uso:
 * - Diseño con herencia de tipos (orientado a objetos)
 * - Prevenir extensiones no autorizadas del tipo
 * - Sellar tipos base para garantizar consistencia
 * 
 * Ejemplo en Oracle:
 * ```sql
 * CREATE TYPE persona_t AS OBJECT (
 *   nombre VARCHAR(100),
 *   edad INTEGER
 * ) NOT FINAL;
 * 
 * CREATE TYPE empleado_t UNDER persona_t (
 *   salario NUMBER(10,2)
 * ) FINAL;
 * ```
 * 
 * Soportado por: Oracle, SQL estándar (limitado).
 * No soportado en: PostgreSQL, MySQL, SQLite.
 * 
 * @example
 * // 1. Tipo alias/base - crear alias para tipo numérico
 * qb.createType('SALARIO', {
 *   as: 'NUMERIC(8,2)'
 * });
 * // Genera: CREATE TYPE SALARIO AS NUMERIC(8,2)
 * // Uso: columna SALARIO en lugar de NUMERIC(8,2)
 * 
 * @example
 * // 2. Tipo ENUM simple con valores
 * qb.createType('status_type', {
 *   as: 'ENUM',
 *   values: ['active', 'inactive', 'pending']
 * });
 * // Genera: CREATE TYPE status_type AS ENUM ('active', 'inactive', 'pending')
 * 
 * @example
 * // 3. Tipo ENUM para roles de usuario
 * qb.createType('user_role', {
 *   as: 'ENUM',
 *   values: ['admin', 'editor', 'viewer', 'guest']
 * });
 * // Genera: CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer', 'guest')
 * // Uso en tabla: CREATE TABLE usuarios (id INT, rol user_role)
 * 
 * @example
 * // 4. Tipo ENUM para estados de pedido
 * qb.createType('order_status', {
 *   as: 'ENUM',
 *   values: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']
 * });
 * // Validación automática: solo acepta valores del enum
 * 
 * @example
 * // 5. Tipo compuesto para direcciones
 * qb.createType('address_type', {
 *   as: 'COMPOSITE',
 *   attributes: {
 *     street: 'VARCHAR(100)',
 *     city: 'VARCHAR(50)',
 *     state: 'VARCHAR(30)',
 *     zipcode: 'VARCHAR(10)',
 *     country: 'VARCHAR(50)'
 *   }
 * });
 * // Genera: CREATE TYPE address_type AS (
 * //   street VARCHAR(100),
 * //   city VARCHAR(50),
 * //   state VARCHAR(30),
 * //   zipcode VARCHAR(10),
 * //   country VARCHAR(50)
 * // )
 * 
 * @example
 * // 6. Tipo compuesto para coordenadas geográficas
 * qb.createType('geo_point', {
 *   as: 'COMPOSITE',
 *   attributes: {
 *     latitude: 'DECIMAL(10,8)',
 *     longitude: 'DECIMAL(11,8)',
 *     altitude: 'INTEGER'
 *   }
 * });
 * // Uso: CREATE TABLE lugares (id INT, ubicacion geo_point)
 * // Acceso: SELECT (ubicacion).latitude FROM lugares
 * 
 * @example
 * // 7. Tipo compuesto directo (sintaxis alternativa)
 * qb.createType('contact_info', {
 *   as: {
 *     email: 'VARCHAR(255)',
 *     phone: 'VARCHAR(20)',
 *     verified: 'BOOLEAN'
 *   }
 * });
 * // Genera: CREATE TYPE contact_info AS (
 * //   email VARCHAR(255),
 * //   phone VARCHAR(20),
 * //   verified BOOLEAN
 * // )
 * 
 * @example
 * // 8. Tipo compuesto para rangos de precios
 * qb.createType('price_range', {
 *   as: 'COMPOSITE',
 *   attributes: {
 *     min_price: 'DECIMAL(10,2)',
 *     max_price: 'DECIMAL(10,2)',
 *     currency: 'VARCHAR(3)'
 *   }
 * });
 * // Uso en consultas: 
 * // SELECT nombre, (precio_rango).min_price, (precio_rango).currency FROM productos
 * 
 * @example
 * // 9. Tipo compuesto anidado (usando otros tipos)
 * // Primero crear tipo de coordenadas
 * qb.createType('coordinates', {
 *   as: { lat: 'DECIMAL(10,8)', lng: 'DECIMAL(11,8)' }
 * });
 * 
 * // Luego crear tipo de ubicación que usa coordinates
 * qb.createType('location', {
 *   as: {
 *     name: 'VARCHAR(100)',
 *     coords: 'coordinates',  // Referencia al tipo anterior
 *     country: 'VARCHAR(50)'
 *   }
 * });
 * 
 * @example
 * // 10. Tipo FINAL en Oracle (solo informativo, no en PostgreSQL)
 * qb.createType('sealed_type', {
 *   as: 'NUMERIC(10,2)',
 *   final: true  // No permite herencia
 * });
 * // Genera (Oracle): CREATE TYPE sealed_type AS NUMERIC(10,2) FINAL
 * 
 * @example
 * // 11. Array de tipos compuestos en tabla
 * // Primero crear el tipo
 * qb.createType('phone_contact', {
 *   as: {
 *     type: 'VARCHAR(20)',
 *     number: 'VARCHAR(30)',
 *     primary: 'BOOLEAN'
 *   }
 * });
 * 
 * // Luego usar array del tipo en tabla
 * qb.createTable('usuarios', {
 *   cols: {
 *     id: 'SERIAL PRIMARY KEY',
 *     nombre: 'VARCHAR(100)',
 *     telefonos: 'phone_contact[]'  // Array del tipo personalizado
 *   }
 * });
 * 
 * @see {@link types.createTableOptions} - Para usar tipos personalizados en definiciones de tabla
 * @see {@link types.columnOptions} - Para usar tipos personalizados en columnas
 */

/**
 * Opciones de configuración para la eliminación de tipos de datos definidos por el usuario (DROP TYPE).
 * 
 * DROP TYPE elimina tipos de datos personalizados creados previamente con CREATE TYPE.
 * Al eliminar un tipo, es importante considerar las dependencias, ya que puede haber columnas,
 * funciones u otros objetos que dependan del tipo a eliminar.
 * 
 * ⚠️ ADVERTENCIA: La eliminación de tipos puede romper tablas, vistas y funciones existentes.
 * - Verifique todas las dependencias antes de eliminar un tipo
 * - Considere usar RESTRICT primero para identificar dependencias
 * - Use CASCADE solo después de verificar el impacto completo
 * - Realice respaldos antes de eliminar tipos en producción
 * 
 * @global
 * @typedef {Object} types.dropTypeOptions
 * 
 * @property {boolean} [ifExists] - Si es true, no genera error si el tipo no existe.
 * Equivalente a la cláusula IF EXISTS en SQL.
 * 
 * Comportamiento:
 * - Con ifExists=true: La operación es silenciosa si el tipo no existe (no genera error)
 * - Sin ifExists: Genera error si el tipo no existe (comportamiento SQL estándar)
 * 
 * Útil para:
 * - Scripts de migración idempotentes que pueden ejecutarse múltiples veces
 * - Limpieza de entornos de desarrollo y testing
 * - Scripts de rollback que deben ser seguros
 * - Operaciones automatizadas donde no se conoce el estado actual
 * 
 * Sintaxis SQL: DROP TYPE IF EXISTS nombre
 * Sintaxis PostgreSQL: También soporta secure (alias de ifExists)
 * 
 * Soportado por: PostgreSQL, Oracle.
 * No soportado en: MySQL (no tiene CREATE TYPE), SQL Server (sintaxis diferente).
 * 
 * @property {boolean} [secure] - Alias de ifExists específico de PostgreSQL.
 * Si es true, no lanza error si el tipo no existe, emite un aviso (notice) en su lugar.
 * 
 * Es una forma alternativa de especificar IF EXISTS en implementaciones PostgreSQL.
 * - secure: true → Equivalente a ifExists: true
 * - Genera: DROP TYPE IF EXISTS nombre
 * 
 * Comportamiento PostgreSQL:
 * - Con secure=true: Emite un NOTICE si el tipo no existe, no falla
 * - Sin secure: Lanza ERROR si el tipo no existe
 * 
 * Nota: En la mayoría de casos, use ifExists por ser más estándar.
 * secure es específico de implementaciones PostgreSQL del QueryBuilder.
 * 
 * Soportado por: Implementación PostgreSQL específica.
 * 
 * @property {boolean} [cascade] - Si es true, elimina el tipo y todos los objetos que dependen de él.
 * ⚠️ OPERACIÓN MUY PELIGROSA - Elimina automáticamente:
 * - Todas las columnas de tablas que usan este tipo
 * - Funciones que usan el tipo como parámetro o retorno
 * - Operadores definidos para el tipo
 * - Casts (conversiones) que involucran el tipo
 * - Otros tipos que dependen de este (tipos compuestos que lo usan)
 * - Vistas que referencian columnas del tipo
 * 
 * Impacto en cascada:
 * - Puede eliminar datos de múltiples tablas
 * - Puede romper aplicaciones que dependen de esas columnas
 * - La eliminación es recursiva y no solicita confirmación adicional
 * - Puede afectar objetos en múltiples esquemas
 * 
 * ⚠️ PROCESO RECOMENDADO:
 * 1. Ejecute primero DROP TYPE con RESTRICT para ver dependencias
 * 2. El error mostrará qué objetos dependen del tipo
 * 3. Analice cada dependencia y documente el impacto
 * 4. Elimine dependencias manualmente O use CASCADE conscientemente
 * 5. Realice respaldo completo antes de ejecutar con CASCADE
 * 6. Notifique al equipo sobre cambios que afectarán aplicaciones
 * 
 * Sintaxis SQL: DROP TYPE nombre CASCADE
 * 
 * Soportado por: PostgreSQL, Oracle.
 * 
 * @property {boolean} [restrict] - Si es true, solo elimina el tipo si NO tiene dependencias.
 * Comportamiento seguro predeterminado (es el default implícito en SQL estándar).
 * 
 * Genera un error si existen:
 * - Columnas de tablas que usan el tipo
 * - Funciones con parámetros o retorno del tipo
 * - Operadores definidos para el tipo
 * - Dominios basados en el tipo
 * - Otros tipos compuestos que incluyen este tipo
 * - Cualquier otro objeto que tenga dependencia directa
 * 
 * Ventajas del modo RESTRICT:
 * - Previene eliminaciones accidentales de datos
 * - Obliga a revisar y resolver dependencias explícitamente
 * - Mantiene la integridad del esquema de base de datos
 * - Protege contra efectos en cascada no intencionados
 * - Fuerza documentación de cambios (al eliminar dependencias manualmente)
 * 
 * Proceso con RESTRICT:
 * 1. Intente DROP TYPE nombre RESTRICT
 * 2. Si hay dependencias, PostgreSQL muestra error detallado con lista de objetos
 * 3. Analice cada objeto dependiente
 * 4. Decida estrategia:
 *    - Convertir columnas a otro tipo (ALTER TABLE ALTER COLUMN)
 *    - Modificar funciones para no usar el tipo
 *    - Eliminar objetos dependientes si ya no se necesitan
 *    - Usar CASCADE solo después de verificación completa
 * 
 * Sintaxis SQL: DROP TYPE nombre RESTRICT
 * Comportamiento: Es el default si no se especifica CASCADE ni RESTRICT
 * 
 * Soportado por: PostgreSQL, Oracle, SQL estándar.
 * 
 * @example
 * // 1. Eliminación básica (falla si no existe o tiene dependencias)
 * qb.dropType('status_type');
 * // Genera: DROP TYPE status_type
 * // Falla si: tipo no existe o tiene dependencias
 * 
 * @example
 * // 2. Eliminación segura - no falla si no existe
 * qb.dropType('status_type', { ifExists: true });
 * // Genera: DROP TYPE IF EXISTS status_type
 * // Comportamiento: Silencioso si el tipo no existe
 * 
 * @example
 * // 3. Eliminación con RESTRICT explícito (solo si no hay dependencias)
 * qb.dropType('old_type', { 
 *   ifExists: true,
 *   restrict: true 
 * });
 * // Genera: DROP TYPE IF EXISTS old_type RESTRICT
 * // Falla si hay dependencias, protege contra eliminación accidental
 * 
 * @example
 * // 4. Eliminación con CASCADE - ELIMINA TODO LO DEPENDIENTE
 * qb.dropType('address_type', { 
 *   ifExists: true,
 *   cascade: true 
 * });
 * // Genera: DROP TYPE IF EXISTS address_type CASCADE
 * // ⚠️ PELIGRO: Eliminará todas las columnas que usan address_type
 * //             y todas las funciones que lo usan como parámetro
 * 
 * @example
 * // 5. Usando secure (específico PostgreSQL)
 * qb.dropType('temp_type', { 
 *   secure: true,
 *   cascade: true 
 * });
 * // Genera: DROP TYPE IF EXISTS temp_type CASCADE
 * // secure es alias de ifExists en PostgreSQL
 * 
 * @example
 * // 6. Eliminación de múltiples tipos (PostgreSQL)
 * qb.dropType(['status_enum', 'priority_enum', 'role_enum'], {
 *   ifExists: true,
 *   cascade: true
 * });
 * // Genera: DROP TYPE IF EXISTS status_enum, priority_enum, role_enum CASCADE
 * // PostgreSQL permite eliminar múltiples tipos en un comando
 * 
 * @example
 * // 7. Proceso seguro recomendado para producción
 * // Paso 1: Intentar con RESTRICT para ver dependencias
 * try {
 *   qb.dropType('payment_status', { 
 *     ifExists: true,
 *     restrict: true 
 *   });
 * } catch (error) {
 *   // Paso 2: El error mostrará dependencias
 *   console.error('Dependencias encontradas:', error.message);
 *   // ERROR: cannot drop type payment_status because other objects depend on it
 *   // DETAIL: table payments column status depends on type payment_status
 *   
 *   // Paso 3: Analizar impacto y eliminar dependencias manualmente
 *   // ALTER TABLE payments ALTER COLUMN status TYPE varchar(20);
 *   
 *   // Paso 4: Solo entonces eliminar el tipo
 *   qb.dropType('payment_status', { ifExists: true });
 * }
 * 
 * @example
 * // 8. Limpieza de tipos de testing
 * const testTypes = ['test_enum_1', 'test_composite_1', 'test_status'];
 * testTypes.forEach(typeName => {
 *   qb.dropType(typeName, { 
 *     ifExists: true,
 *     cascade: true  // Safe en testing, tipos temporales
 *   });
 * });
 * 
 * @example
 * // 9. Script de rollback de migración
 * // Al revertir una migración que creó tipos, eliminarlos de forma segura
 * qb.dropType('new_feature_status', {
 *   ifExists: true,   // No falla si la migración no se aplicó
 *   restrict: true    // Solo elimina si no hay dependencias
 * });
 * 
 * @example
 * // 10. Migración con verificación de dependencias
 * // Antes de eliminar tipo antiguo, verificar que ya no se use
 * async function migrateFromOldType() {
 *   // 1. Crear nuevo tipo
 *   await qb.createType('status_v2', {
 *     as: 'ENUM',
 *     values: ['active', 'inactive', 'suspended', 'deleted']
 *   });
 *   
 *   // 2. Migrar columnas al nuevo tipo
 *   await qb.alterTable('users')
 *     .alterColumn('status', { type: 'status_v2' });
 *   
 *   // 3. Eliminar tipo antiguo (ahora sin dependencias)
 *   await qb.dropType('status_v1', { 
 *     ifExists: true,
 *     restrict: true  // Falla si aún hay dependencias (seguridad)
 *   });
 * }
 * 
 * @example
 * // 11. Eliminación de tipo compuesto con verificación
 * // Verificar que no hay columnas usando el tipo antes de eliminar
 * qb.dropType('address_details', {
 *   ifExists: true,
 *   restrict: true  // Protege contra eliminación si hay columnas usándolo
 * });
 * // Si falla: ALTER TABLE ... ALTER COLUMN ... primero
 * 
 * @see {@link types.createTypeOptions} - Para opciones de creación de tipos personalizados
 * @see {@link types.dropTableOptions} - Para opciones similares en eliminación de tablas
 */

/**
 * Opciones de configuración para la creación de aserciones (CREATE ASSERTION).
 * 
 * Las aserciones (assertions) son restricciones de integridad a nivel de base de datos completa
 * definidas en el estándar SQL (SQL-92 y SQL:2006). Permiten expresar condiciones que deben
 * cumplirse en todo momento, incluso cuando involucran múltiples tablas o consultas complejas.
 * 
 * ⚠️ ADVERTENCIA IMPORTANTE: CREATE ASSERTION tiene soporte muy limitado.
 * - **SQL estándar**: ✅ Definido en SQL-92 y SQL:2006
 * - **PostgreSQL**: ❌ NO soportado (usar TRIGGERS o CHECK constraints)
 * - **MySQL**: ❌ NO soportado (usar TRIGGERS o CHECK constraints)
 * - **SQL Server**: ❌ NO soportado (usar TRIGGERS o CHECK constraints)
 * - **Oracle**: ⚠️ Soporte limitado (usar TRIGGERS)
 * - **SQLite**: ❌ NO soportado (usar TRIGGERS o CHECK constraints)
 * 
 * 🔧 ALTERNATIVAS RECOMENDADAS:
 * Dado que las aserciones no están ampliamente soportadas, se recomienda usar:
 * 
 * 1. **CHECK Constraints** a nivel de tabla:
 *    - Para validaciones que involucran una sola tabla
 *    - Ejemplo: CHECK (precio > 0 AND precio < costo * 2)
 * 
 * 2. **TRIGGERS** (BEFORE INSERT/UPDATE/DELETE):
 *    - Para validaciones complejas entre múltiples tablas
 *    - Pueden ejecutar consultas y lanzar errores si no se cumple condición
 *    - Soportados por todos los SGBDs modernos
 * 
 * 3. **Materialized Views** con constraints:
 *    - Para agregaciones que deben cumplir condiciones
 *    - Ejemplo: Vista materializada con SUM que tiene CHECK constraint
 * 
 * 4. **Application-level validation**:
 *    - Validar en la capa de aplicación antes de INSERT/UPDATE
 *    - Usar transacciones para mantener consistencia
 * 
 * @global
 * @typedef {string|Object} types.assertionOptions
 * 
 * Puede especificarse de dos formas:
 * 
 * **1. String simple** - Expresión CHECK directa:
 * - Formato: String con condición SQL booleana
 * - Ejemplo: '(SELECT SUM(cantidad) FROM productos) < 10000'
 * - Uso más común y conciso
 * - Se envuelve automáticamente en CHECK ( ... )
 * 
 * **2. Objeto estructurado** - Con propiedad check explícita:
 * - Formato: { check: 'expresion_sql' }
 * - Ejemplo: { check: 'balance >= 0' }
 * - Permite extensiones futuras del tipo
 * 
 * Cuando se usa como **objeto**, acepta:
 * 
 * @property {string} check - **OBLIGATORIO cuando se usa objeto**. Expresión SQL booleana.
 * Define la condición que debe cumplirse en toda la base de datos.
 * 
 * La expresión debe:
 * - Evaluarse a TRUE para que la operación se permita
 * - Puede incluir subconsultas
 * - Puede referenciar múltiples tablas
 * - Puede usar funciones agregadas (SUM, COUNT, AVG, etc.)
 * - Puede usar cualquier operador SQL válido
 * 
 * Características de la expresión:
 * - Se evalúa cada vez que hay un cambio relevante en la BD
 * - Debe ser determinista (mismo resultado con mismos datos)
 * - No puede referenciar datos externos a la BD
 * - Puede tener impacto significativo en rendimiento
 * 
 * Sintaxis SQL generada:
 * ```sql
 * CREATE ASSERTION nombre CHECK ( expresion )
 * ```
 * 
 * Tipos de expresiones comunes:
 * 
 * **Agregaciones globales**:
 * - `(SELECT SUM(stock) FROM productos) >= 0`
 * - `(SELECT COUNT(*) FROM usuarios WHERE activo = true) <= limite_usuarios`
 * 
 * **Relaciones entre tablas**:
 * - `NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id NOT IN (SELECT id FROM clientes))`
 * - `(SELECT COUNT(*) FROM facturas) = (SELECT COUNT(*) FROM pagos)`
 * 
 * **Límites de negocio**:
 * - `(SELECT AVG(salario) FROM empleados) < presupuesto_total / num_empleados`
 * - `(SELECT SUM(monto) FROM transacciones WHERE tipo = 'debito') <= saldo_disponible`
 * 
 * **Invariantes temporales**:
 * - `NOT EXISTS (SELECT 1 FROM eventos WHERE fecha_fin < fecha_inicio)`
 * - `(SELECT MAX(fecha) FROM auditorias) >= CURRENT_DATE - INTERVAL '1 day'`
 * 
 * ⚠️ CONSIDERACIONES DE RENDIMIENTO:
 * - Las aserciones se evalúan en CADA operación que afecte las tablas involucradas
 * - Pueden causar bloqueos en operaciones concurrentes
 * - Subconsultas complejas pueden degradar significativamente el rendimiento
 * - Considere usar triggers que solo se ejecuten cuando sea necesario
 * - En producción, prefiera validaciones a nivel de aplicación para operaciones frecuentes
 * 
 * CUÁNDO NO USAR ASERCIONES:
 * - Validaciones simples de una sola tabla (use CHECK constraints)
 * - Bases de datos de alto rendimiento con escrituras frecuentes
 * - Cuando la mayoría de SGBDs no las soportan (compatibilidad)
 * - Validaciones que requieren estado externo o servicios externos
 * 
 * @example
 * // 1. Aserción simple como string - stock total positivo
 * qb.createAssertion('stock_positivo', 
 *   '(SELECT SUM(cantidad) FROM inventario) >= 0'
 * );
 * // Genera: CREATE ASSERTION stock_positivo CHECK ( 
 * //           (SELECT SUM(cantidad) FROM inventario) >= 0 
 * //         )
 * 
 * @example
 * // 2. Aserción con objeto - balance de cuentas
 * qb.createAssertion('balance_correcto', {
 *   check: '(SELECT SUM(credito) FROM transacciones) = (SELECT SUM(debito) FROM transacciones)'
 * });
 * // Asegura que créditos y débitos siempre estén balanceados
 * 
 * @example
 * // 3. Límite de existencias en inventario
 * qb.createAssertion('limite_inventario', 
 *   '(SELECT SUM(EN_EXISTENCIA) FROM TITULOS_CD) < 5000'
 * );
 * // Genera: CREATE ASSERTION limite_inventario CHECK ( 
 * //           (SELECT SUM(EN_EXISTENCIA) FROM TITULOS_CD) < 5000 
 * //         )
 * // Asegura que nunca haya más de 5000 unidades en inventario
 * 
 * @example
 * // 4. Aserción de integridad referencial compleja
 * qb.createAssertion('pedidos_validos',
 *   'NOT EXISTS (SELECT 1 FROM pedidos WHERE cliente_id NOT IN (SELECT id FROM clientes))'
 * );
 * // Asegura que todos los pedidos tengan un cliente válido
 * // (similar a FOREIGN KEY pero puede tener lógica más compleja)
 * 
 * @example
 * // 5. Límite de usuarios activos
 * qb.createAssertion('limite_usuarios_activos', {
 *   check: '(SELECT COUNT(*) FROM usuarios WHERE estado = \'activo\') <= 1000'
 * });
 * // Asegura que nunca haya más de 1000 usuarios activos simultáneamente
 * 
 * @example
 * // 6. Balance de cuenta bancaria siempre positivo
 * qb.createAssertion('balance_positivo',
 *   '(SELECT balance FROM cuentas WHERE tipo = \'corriente\') >= 0'
 * );
 * // Previene que cuentas corrientes tengan balance negativo
 * 
 * @example
 * // 7. Relación temporal válida - fechas coherentes
 * qb.createAssertion('fechas_coherentes',
 *   'NOT EXISTS (SELECT 1 FROM proyectos WHERE fecha_fin < fecha_inicio)'
 * );
 * // Asegura que ningún proyecto tenga fecha de fin anterior a inicio
 * 
 * @example
 * // 8. Capacidad máxima de sala
 * qb.createAssertion('capacidad_sala', {
 *   check: '(SELECT COUNT(*) FROM reservas r WHERE r.sala_id = 1 AND r.estado = \'activa\') <= (SELECT capacidad FROM salas WHERE id = 1)'
 * });
 * // Asegura que no se excedan reservas de la capacidad de la sala
 * 
 * @example
 * // 9. ALTERNATIVA CON TRIGGER (Recomendado en PostgreSQL)
 * // En lugar de CREATE ASSERTION, usar TRIGGER:
 * /*
 * CREATE OR REPLACE FUNCTION check_stock_total()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   IF (SELECT SUM(cantidad) FROM inventario) < 0 THEN
 *     RAISE EXCEPTION 'El stock total no puede ser negativo';
 *   END IF;
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * CREATE TRIGGER stock_positivo_trigger
 * AFTER INSERT OR UPDATE OR DELETE ON inventario
 * FOR EACH STATEMENT
 * EXECUTE FUNCTION check_stock_total();
 * 
* // 10. ALTERNATIVA CON CHECK CONSTRAINT (Para tabla única)
 * // En lugar de assertion global, usar CHECK en tabla:
 * qb.createTable('cuentas', {
    *   cols: {
 *     id: 'SERIAL PRIMARY KEY',
    *     balance: 'DECIMAL(10,2)',
    *     tipo: 'VARCHAR(20)'
 *   },
 * constraints: [{
    *     name: 'CK_balance_positivo',
    *     type: 'check',
    *     check: 'balance >= 0'
 *   }]
  * });
 * // Más eficiente y ampliamente soportado que CREATE ASSERTION
 * 
  * // 11. Validación en aplicación (Recomendado para compatibilidad)
 * // JavaScript/TypeScript
 * async function crearPedido(clienteId, items) {
 * await db.transaction(async (trx) => {
 *     // Validar que cliente existe
 *     const cliente = await trx('clientes').where('id', clienteId).first();
 *     if (!cliente) {
 *       throw new Error('Cliente no existe');
 *     }
 *     
 *     // Validar stock disponible
 *     const stockTotal = await trx('inventario').sum('cantidad as total');
 *     if (stockTotal[0].total < items.reduce((sum, i) => sum + i.cantidad, 0)) {
 *       throw new Error('Stock insuficiente');
 *     }
 *     
 *     // Crear pedido si validaciones pasan
 * await trx('pedidos').insert({ cliente_id: clienteId, items });
 *   });
 * }
  * 
 * @see { @link types.constraintOptions } - Para constraints CHECK a nivel de tabla(alternativa)
  * @see { @link types.createTableOptions } - Para CHECK constraints en definición de tabla
    */

/**
 * Opciones de configuración para la creación de dominios (CREATE DOMAIN).
 * 
 * Los dominios (domains) son tipos de datos definidos por el usuario que extienden tipos base
 * con restricciones y valores por defecto específicos. Permiten crear tipos reutilizables con
 * reglas de validación incorporadas, evitando la repetición de constraints en múltiples tablas.
 * 
 * **CARACTERÍSTICAS PRINCIPALES:**
 * - Encapsulación de tipos con validación
 * - Reutilización de reglas de negocio
 * - Mantenimiento centralizado de constraints
 * - Facilita cambios globales de validación
 * - Mejora la legibilidad del esquema
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ Definido en SQL:1999 y posteriores
 * - **PostgreSQL**: ✅ Soporte completo con todas las características
 * - **MySQL**: ❌ NO soportado (usar CHECK constraints o triggers)
 * - **SQL Server**: ✅ Soporte parcial (User-Defined Types con sp_addtype)
 * - **Oracle**: ✅ Soportado como Object Types
 * - **SQLite**: ❌ NO soportado (usar CHECK constraints)
 * 
 * **VENTAJAS:**
 * 1. **Consistencia**: Mismas reglas aplicadas en todas las columnas del dominio
 * 2. **Mantenimiento**: Cambios en un solo lugar afectan todas las columnas
 * 3. **Documentación**: El nombre del dominio documenta el propósito del campo
 * 4. **Validación centralizada**: Constraints definidos una sola vez
 * 5. **Abstracción**: Oculta detalles de implementación del tipo base
 * 
 * **CASOS DE USO COMUNES:**
 * - Correos electrónicos con validación de formato
 * - Números de teléfono con formato específico
 * - Códigos postales por país
 * - URLs válidas
 * - Cantidades positivas
 * - Porcentajes (0-100)
 * - Estados o categorías con valores permitidos
 * 
 * @global
 * @typedef {Object} types.createDomainOptions
 * 
 * @property {string} dataType - **OBLIGATORIO**. Tipo de dato base sobre el que se construye el dominio.
 * 
 * Puede ser cualquier tipo SQL válido:
 * - Tipos numéricos: INT, BIGINT, DECIMAL(p,s), NUMERIC(p,s), REAL, DOUBLE PRECISION
 * - Tipos de texto: VARCHAR(n), CHAR(n), TEXT
 * - Tipos de fecha/hora: DATE, TIME, TIMESTAMP, INTERVAL
 * - Tipos booleanos: BOOLEAN
 * - Tipos especiales: JSON, JSONB, UUID, BYTEA
 * - Otros dominios: Puede basarse en otro dominio existente
 * 
 * El dominio hereda todas las propiedades del tipo base y puede añadir
 * restricciones adicionales para especializarlo.
 * 
 * Sinónimo aceptado: **as** (alias para dataType)
 * 
 * @property {string|number|boolean|null} [default] - Valor por defecto para columnas que usan este dominio.
 * 
 * Se aplica automáticamente a todas las columnas declaradas con este dominio,
 * a menos que la columna especifique su propio DEFAULT.
 * 
 * Tipos de valores:
 * - Literales: Números (0, -1, 3.14), strings ('texto'), booleanos (TRUE, FALSE)
 * - NULL: Permite nulos explícitamente
 * - Expresiones SQL: CURRENT_TIMESTAMP, CURRENT_DATE, CURRENT_USER
 * - Funciones: NOW(), RANDOM(), UUID_GENERATE_V4()
 * - Operaciones: (10 + 5), ('pre' || 'fix')
 * 
 * Nota: El valor por defecto debe ser compatible con el tipo base.
 * 
 * @property {string|Object} [constraint] - Constraint CHECK para validar valores del dominio.
 * 
 * Puede especificarse como:
 * 
 * **1. String simple** - Expresión CHECK directa:
 * - Formato: "VALUE <condicion>"
 * - Ejemplo: "VALUE > 0"
 * - Ejemplo: "VALUE ~ '^[A-Z]{2}[0-9]{4}$'"
 * - La palabra clave VALUE representa el valor actual del dominio
 * 
 * **2. Objeto estructurado** - Con nombre y expresión:
 * - Formato: { name: 'nombre_constraint', check: 'expresion' }
 * - Ejemplo: { name: 'CK_positivo', check: 'VALUE > 0' }
 * - Permite nombrar el constraint para facilitar su identificación
 * - El nombre aparece en mensajes de error
 * 
 * La expresión CHECK debe:
 * - Usar VALUE para referenciar el valor del dominio
 * - Ser determinista (mismo resultado con mismo valor)
 * - No puede referenciar otras tablas (no puede hacer subconsultas)
 * - Debe evaluarse a TRUE o FALSE
 * - Se evalúa en cada INSERT o UPDATE
 * 
 * Operadores comunes:
 * - Comparación: =, <>, <, >, <=, >=
 * - Rango: BETWEEN min AND max
 * - Lista: IN ('val1', 'val2', 'val3')
 * - Patrón: LIKE 'patron%', ~ 'regex'
 * - Lógicos: AND, OR, NOT
 * - Nulos: IS NULL, IS NOT NULL
 * 
 * @property {boolean} [notNull=false] - Indica si el dominio prohíbe valores NULL.
 * 
 * Comportamiento:
 * - `true`: Columnas basadas en este dominio no aceptan NULL
 * - `false` o no especificado: Permite NULL (comportamiento por defecto)
 * 
 * Nota: Una columna puede sobrescribir esta propiedad especificando
 * explícitamente NULL o NOT NULL en su definición.
 * 
 * Precedencia:
 * 1. NOT NULL en definición de columna (mayor prioridad)
 * 2. notNull del dominio
 * 3. Comportamiento por defecto (permite NULL)
 * 
 * @property {string} [collate] - Collation (ordenamiento) para tipos de texto.
 * 
 * Define cómo se comparan y ordenan los valores de texto:
 * - Sensibilidad a mayúsculas/minúsculas
 * - Reglas de ordenamiento específicas del idioma
 * - Tratamiento de acentos y caracteres especiales
 * 
 * Collations comunes en PostgreSQL:
 * - "C": Ordenamiento por código de caracteres (más rápido)
 * - "POSIX": Similar a "C"
 * - "es_ES": Español de España
 * - "es_MX": Español de México
 * - "en_US": Inglés de Estados Unidos
 * - "en_US.utf8": Inglés con UTF-8
 * - "und-x-icu": Unicode Collation Algorithm
 * 
 * Ejemplo de diferencias:
 * ```
 * -- Con "C": A, B, a, b
 * -- Con "es_ES": A, a, B, b
 * -- Con "C": café, cafe
 * -- Con "es_ES": cafe, café
 * ```
 * 
 * Solo aplica a tipos de texto (VARCHAR, CHAR, TEXT).
 * 
 * @example
 * // 1. Dominio simple para emails con validación
 * qb.createDomain('email', {
 *   dataType: 'VARCHAR(255)',
 *   constraint: "VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'"
 * });
 * // Genera: CREATE DOMAIN email AS VARCHAR(255)
 * //         CHECK ( VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' )
 * 
 * @example
 * // 2. Dominio para cantidades positivas con valor por defecto
 * qb.createDomain('cantidad_positiva', {
 *   as: 'INT',
 *   default: 0,
 *   constraint: 'VALUE >= 0'
 * });
 * // Uso: cantidad cantidad_positiva NOT NULL
 * // Si no se especifica valor, se usa 0 automáticamente
 * 
 * @example
 * // 3. Dominio con constraint nombrado para inventario
 * qb.createDomain('CANTIDAD_EN_EXISTENCIA', {
 *   as: 'INT',
 *   default: 0,
 *   constraint: {
 *     name: 'CK_CANTIDAD_EN_EXISTENCIA',
 *     check: 'VALUE BETWEEN 0 AND 30'
 *   }
 * });
 * // Genera: CREATE DOMAIN CANTIDAD_EN_EXISTENCIA AS INT
 * //         DEFAULT 0
 * //         CONSTRAINT CK_CANTIDAD_EN_EXISTENCIA CHECK ( VALUE BETWEEN 0 AND 30 )
 * 
 * @example
 * // 4. Dominio para porcentajes (0-100)
 * qb.createDomain('porcentaje', {
 *   dataType: 'DECIMAL(5,2)',
 *   constraint: 'VALUE BETWEEN 0 AND 100',
 *   default: 0
 * });
 * // Uso en tabla: descuento porcentaje, comision porcentaje
 * 
 * @example
 * // 5. Dominio para códigos postales de España
 * qb.createDomain('codigo_postal_es', {
 *   dataType: 'CHAR(5)',
 *   constraint: "VALUE ~ '^[0-9]{5}$'",
 *   notNull: true
 * });
 * // Valida formato: exactamente 5 dígitos
 * 
 * @example
 * // 6. Dominio para URLs válidas
 * qb.createDomain('url', {
 *   dataType: 'TEXT',
 *   constraint: "VALUE ~ '^https?://[a-zA-Z0-9.-]+\\.[a-z]{2,}(/.*)?$'"
 * });
 * // Valida que empiece con http:// o https://
 * 
 * @example
 * // 7. Dominio para salarios con rango de negocio
 * qb.createDomain('salario', {
 *   dataType: 'DECIMAL(10,2)',
 *   constraint: {
 *     name: 'CK_salario_valido',
 *     check: 'VALUE BETWEEN 0 AND 1000000'
 *   },
 *   notNull: true
 * });
 * 
 * @example
 * // 8. Dominio para teléfonos internacionales
 * qb.createDomain('telefono_internacional', {
 *   dataType: 'VARCHAR(20)',
 *   constraint: "VALUE ~ '^\\+[0-9]{1,3}[0-9]{6,14}$'"
 * });
 * // Formato: +34612345678, +1234567890
 * 
 * @example
 * // 9. Dominio para estados de pedido
 * qb.createDomain('estado_pedido', {
 *   dataType: 'VARCHAR(20)',
 *   constraint: "VALUE IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado')",
 *   default: 'pendiente',
 *   notNull: true
 * });
 * 
 * @example
 * // 10. Dominio con collation específica para nombres
 * qb.createDomain('nombre_persona', {
 *   dataType: 'VARCHAR(100)',
 *   collate: 'es_ES',
 *   constraint: "LENGTH(VALUE) >= 2",
 *   notNull: true
 * });
 * // Ordenará nombres según reglas del español
 * 
 * @example
 * // 11. Uso completo: crear dominio y usarlo en tabla
 * // Paso 1: Crear dominio
 * qb.createDomain('precio_producto', {
 *   dataType: 'DECIMAL(10,2)',
 *   constraint: 'VALUE > 0',
 *   default: 0.01
 * });
 * 
 * // Paso 2: Usar en tabla
 * qb.createTable('productos', {
 *   cols: {
 *     id: 'SERIAL PRIMARY KEY',
 *     nombre: 'VARCHAR(100) NOT NULL',
 *     precio: 'precio_producto', // Usa el dominio
 *     precio_oferta: 'precio_producto' // Reutiliza el mismo dominio
 *   }
 * });
 * // Ambas columnas heredan: tipo DECIMAL(10,2), CHECK > 0, DEFAULT 0.01
 * 
 * @example
 * // 12. Dominio basado en otro dominio
 * qb.createDomain('cantidad_positiva', {
 *   dataType: 'INT',
 *   constraint: 'VALUE >= 0'
 * });
 * 
 * qb.createDomain('cantidad_stock', {
 *   dataType: 'cantidad_positiva', // Se basa en otro dominio
 *   constraint: 'VALUE <= 9999', // Añade constraint adicional
 *   default: 0
 * });
 * // cantidad_stock hereda: INT, >= 0, y añade: <= 9999, DEFAULT 0
 * 
 * @example
 * // 13. MODIFICAR un dominio existente (ALTER DOMAIN)
 * // Cambiar valor por defecto
 * // qb.alterDomain('precio_producto').setDefault(1.00);
 * 
 * // Añadir constraint
 * // qb.alterDomain('precio_producto').addConstraint('CK_precio_max', 'VALUE <= 10000');
 * 
 * // Eliminar constraint
 * // qb.alterDomain('precio_producto').dropConstraint('CK_precio_max');
 * 
 * @example
 * // 14. ELIMINAR un dominio (DROP DOMAIN)
 * // qb.dropDomain('precio_producto'); // Error si está en uso
 * // qb.dropDomain('precio_producto', { cascade: true }); // Elimina columnas que lo usan
 * 
 * @see {@link types.createTypeOptions} - Para tipos ENUM y COMPOSITE personalizados
 * @see {@link types.constraintOptions} - Para constraints CHECK a nivel de tabla
 * @see {@link types.columnOptions} - Para definiciones de columnas que pueden usar dominios
 */

/**
 * Opciones de configuración para la creación de vistas (CREATE VIEW).
 * 
 * Una vista es una "tabla virtual" que representa el resultado de una consulta SELECT almacenada.
 * No contiene datos propios, sino que muestra datos dinámicamente desde las tablas base.
 * Las vistas simplifican consultas complejas, mejoran la seguridad y facilitan el mantenimiento.
 * 
 * **TIPOS DE VISTAS:**
 * 
 * 1. **Vistas estándar** (Standard Views):
 *    - Consulta almacenada que se ejecuta cada vez que se accede
 *    - No almacena datos, siempre muestra información actual
 *    - Ligera y rápida de crear
 *    - Ideal para simplificar consultas frecuentes
 * 
 * 2. **Vistas materializadas** (Materialized Views):
 *    - Almacena físicamente el resultado de la consulta
 *    - Debe actualizarse manualmente (REFRESH MATERIALIZED VIEW)
 *    - Mucho más rápida en consultas complejas
 *    - Consume espacio en disco
 *    - Solo en PostgreSQL, Oracle, SQL Server (indexed views)
 * 
 * 3. **Vistas con CHECK OPTION**:
 *    - Valida que INSERT/UPDATE cumplan la condición WHERE de la vista
 *    - Evita modificaciones que harían que las filas desaparezcan de la vista
 *    - Útil para vistas actualizables con restricciones
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ Definido en SQL-92 y posteriores
 * - **PostgreSQL**: ✅ Soporte completo + vistas materializadas
 * - **MySQL**: ✅ Soporte completo (sin vistas materializadas)
 * - **SQL Server**: ✅ Soporte completo + indexed views (similar a materializadas)
 * - **Oracle**: ✅ Soporte completo + vistas materializadas
 * - **SQLite**: ✅ Vistas estándar solamente
 * 
 * **VENTAJAS DE LAS VISTAS:**
 * 1. **Simplificación**: Oculta complejidad de JOINs y subconsultas
 * 2. **Seguridad**: Restringe acceso a columnas/filas sensibles
 * 3. **Reutilización**: Define lógica de negocio una sola vez
 * 4. **Abstracción**: Cambios en tablas base no afectan aplicación
 * 5. **Mantenibilidad**: Centraliza consultas complejas
 * 6. **Optimización**: El motor puede optimizar la consulta
 * 
 * **LIMITACIONES:**
 * - No todas las vistas son actualizables (INSERT/UPDATE/DELETE)
 * - Rendimiento puede ser inferior a tablas reales
 * - No pueden tener índices (excepto vistas materializadas/indexadas)
 * - Dependencias complejas pueden dificultar el mantenimiento
 * 
 * @global
 * @typedef {Object} types.createViewOptions
 * 
 * @property {Array<string>} [cols] - Lista de nombres de columnas para la vista.
 * 
 * Define los nombres que tendrán las columnas en la vista. Son opcionales si la consulta
 * SELECT ya proporciona nombres claros mediante alias (AS).
 * 
 * Comportamiento:
 * - Si se especifica: Las columnas de la vista tendrán estos nombres
 * - Si se omite: Se usan los nombres/alias de la consulta SELECT
 * - El número debe coincidir con las columnas del SELECT
 * - Los nombres deben ser identificadores SQL válidos
 * 
 * Útil cuando:
 * - La consulta SELECT usa expresiones sin alias
 * - Se quiere renombrar columnas para mayor claridad
 * - Se necesitan nombres más descriptivos que los originales
 * 
 * Sintaxis generada:
 * ```sql
 * CREATE VIEW nombre (col1, col2, col3) AS SELECT ...
 * ```
 * 
 * @property {QueryBuilder|string} as - **OBLIGATORIO**. Consulta SELECT que define el contenido de la vista.
 * 
 * Puede especificarse como:
 * 
 * **1. Objeto QueryBuilder** - Consulta construida con el API:
 * - Formato: qb.select(...).from(...).where(...)
 * - Recomendado: Mayor seguridad y validación
 * - Se convierte automáticamente a SQL
 * - Permite encadenamiento fluido
 * 
 * **2. String SQL** - Consulta SELECT directa:
 * - Formato: 'SELECT col1, col2 FROM tabla WHERE condicion'
 * - Útil para consultas complejas o migración de código existente
 * - Debe ser SQL válido para el SGBD objetivo
 * - No incluir el "AS" inicial (se añade automáticamente)
 * 
 * Restricciones de la consulta:
 * - Debe ser una consulta SELECT válida
 * - No puede contener ORDER BY (en algunas bases de datos)
 * - No puede usar INTO
 * - Puede incluir JOINs, subconsultas, funciones agregadas
 * - Puede referenciar otras vistas
 * 
 * Nota: En PostgreSQL, para ORDER BY en la vista, usar un índice
 * o incluir ORDER BY al consultar la vista.
 * 
 * @property {boolean} [check=false] - Activa WITH CHECK OPTION para vistas actualizables.
 * 
 * Cuando es `true`, asegura que cualquier INSERT o UPDATE en la vista cumpla
 * la condición WHERE de la consulta de la vista. Evita que las filas modificadas
 * "desaparezcan" de la vista después de la modificación.
 * 
 * Comportamiento:
 * - `false` o no especificado: Permite INSERT/UPDATE sin validación
 * - `true`: Valida que las filas modificadas sigan siendo visibles en la vista
 * 
 * Tipos de CHECK OPTION (PostgreSQL/MySQL):
 * - **CASCADED** (por defecto): Valida todas las vistas de la cadena
 * - **LOCAL**: Solo valida la vista actual, no las vistas subyacentes
 * 
 * Ejemplo de comportamiento:
 * ```sql
 * CREATE VIEW active_users AS 
 *   SELECT * FROM users WHERE active = true
 *   WITH CHECK OPTION;
 * 
 * -- Esto funcionará:
 * INSERT INTO active_users (name, active) VALUES ('John', true);
 * 
 * -- Esto FALLARÁ (active = false no cumple WHERE active = true):
 * INSERT INTO active_users (name, active) VALUES ('Jane', false);
 * 
 * -- Esto FALLARÁ (desactivar usuario lo sacaría de la vista):
 * UPDATE active_users SET active = false WHERE id = 1;
 * ```
 * 
 * Solo aplica a vistas actualizables. Una vista es actualizable si:
 * - No usa DISTINCT, GROUP BY, HAVING, UNION
 * - No usa funciones agregadas (SUM, COUNT, AVG, etc.)
 * - Todas las columnas provienen de una tabla base (no expresiones)
 * 
 * @property {boolean} [replace=false] - Si es `true`, usa CREATE OR REPLACE VIEW.
 * 
 * Permite recrear una vista existente sin tener que eliminarla primero.
 * Útil para actualizar la definición de una vista sin romper dependencias.
 * 
 * Comportamiento:
 * - `false`: Error si la vista ya existe
 * - `true`: Reemplaza la vista si existe, crea si no existe
 * 
 * Ventajas de OR REPLACE:
 * - No rompe permisos (GRANTs) otorgados a la vista
 * - No rompe otras vistas que dependen de esta vista
 * - No requiere eliminar primero (sin necesidad de DROP VIEW)
 * - Mantiene comentarios y propiedades de la vista
 * 
 * Limitaciones:
 * - No puede cambiar las columnas (nombre, tipo, orden) en PostgreSQL
 * - Para cambios estructurales, debe usar DROP VIEW + CREATE VIEW
 * - MySQL permite cambios más flexibles
 * 
 * Sintaxis generada:
 * ```sql
 * CREATE OR REPLACE VIEW nombre AS SELECT ...
 * ```
 * 
 * @property {string} [algorithm] - **Solo MySQL**. Estrategia de procesamiento de la vista.
 * 
 * Valores permitidos:
 * - **'UNDEFINED'**: MySQL elige automáticamente (por defecto)
 * - **'MERGE'**: Combina la vista con la consulta externa (más eficiente)
 * - **'TEMPTABLE'**: Crea tabla temporal con resultados (permite más operaciones)
 * 
 * ¿Cuándo usar cada uno?
 * 
 * **MERGE** (recomendado por defecto):
 * - Mejor rendimiento en la mayoría de casos
 * - Permite que el optimizador combine consultas
 * - No soporta funciones agregadas en algunos casos
 * - MySQL puede degradar a TEMPTABLE automáticamente si es necesario
 * 
 * **TEMPTABLE**:
 * - Necesario cuando la vista usa: DISTINCT, GROUP BY, UNION, funciones agregadas
 * - Cuando la vista no es actualizable
 * - Permite ORDER BY, LIMIT en la vista
 * - Consume más recursos (crea tabla temporal)
 * 
 * **UNDEFINED**:
 * - Deja que MySQL decida
 * - Generalmente elige MERGE si es posible
 * - Recomendado a menos que sepa que necesita TEMPTABLE
 * 
 * Sintaxis generada (MySQL):
 * ```sql
 * CREATE ALGORITHM=MERGE VIEW nombre AS SELECT ...
 * ```
 * 
 * @property {string} [security] - **Solo MySQL**. Define el contexto de seguridad de la vista.
 * 
 * Valores permitidos:
 * - **'DEFINER'** (por defecto): Vista ejecuta con permisos del creador
 * - **'INVOKER'**: Vista ejecuta con permisos del usuario que la consulta
 * 
 * **DEFINER** (por defecto):
 * - Vista tiene permisos del usuario que la creó
 * - Los usuarios de la vista no necesitan permisos en tablas base
 * - Útil para ocultar tablas sensibles
 * - Riesgo: Escalar privilegios si no se controla
 * 
 * **INVOKER**:
 * - Vista usa permisos del usuario actual
 * - Cada usuario necesita permisos en tablas base
 * - Más seguro: no permite escalar privilegios
 * - Más flexible: diferentes usuarios ven diferentes datos según permisos
 * 
 * Ejemplo de uso:
 * ```sql
 * -- DEFINER: Todos pueden ver salarios (vista creada por admin)
 * CREATE SQL SECURITY DEFINER VIEW salarios_publicos AS 
 *   SELECT nombre, salario FROM empleados;
 * 
 * -- INVOKER: Solo quién tenga permisos verá datos
 * CREATE SQL SECURITY INVOKER VIEW mis_datos AS
 *   SELECT * FROM empleados WHERE user_id = CURRENT_USER();
 * ```
 * 
 * Sintaxis generada (MySQL):
 * ```sql
 * CREATE SQL SECURITY DEFINER VIEW nombre AS SELECT ...
 * ```
 * 
 * @property {string} [user] - **Solo MySQL**. Usuario que se establece como DEFINER de la vista.
 * 
 * Define explícitamente quién es el "propietario" de la vista para propósitos
 * de seguridad cuando se usa SQL SECURITY DEFINER.
 * 
 * Formato: 'usuario@host' o solo 'usuario'
 * 
 * Ejemplos:
 * - 'admin@localhost'
 * - 'app_user@%'
 * - 'root@192.168.1.%'
 * 
 * Comportamiento:
 * - Si no se especifica: El usuario actual se convierte en DEFINER
 * - Si se especifica: Ese usuario es el DEFINER (requiere privilegio SUPER)
 * - Solo admin/root pueden crear vistas con DEFINER diferente
 * 
 * Útil cuando:
 * - Se migran vistas entre servidores
 * - Se quiere que vistas tengan permisos de un usuario específico
 * - Se centraliza seguridad en un usuario de servicio
 * 
 * Sintaxis generada (MySQL):
 * ```sql
 * CREATE DEFINER=`admin`@`localhost` VIEW nombre AS SELECT ...
 * ```
 * 
 * @property {boolean} [temporary=false] - **PostgreSQL/Oracle**. Crea vista temporal (sesión actual).
 * 
 * Vistas temporales solo existen durante la sesión actual y se eliminan
 * automáticamente al cerrar la conexión.
 * 
 * Características:
 * - Solo visible para la sesión que la creó
 * - Se elimina automáticamente al cerrar conexión
 * - Útil para cálculos intermedios
 * - No persiste entre sesiones
 * - No puede tener dependencias permanentes
 * 
 * Casos de uso:
 * - Procesamiento de datos temporales en scripts
 * - Cálculos intermedios en procedimientos
 * - Testing sin afectar esquema permanente
 * - Reportes ad-hoc de una sola sesión
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE TEMPORARY VIEW nombre AS SELECT ...
 * ```
 * 
 * @property {boolean} [materialized=false] - **PostgreSQL/Oracle**. Crea vista materializada.
 * 
 * Vista materializada almacena físicamente el resultado de la consulta en disco,
 * como una tabla cache. Mejora dramáticamente el rendimiento de consultas complejas
 * a costa de no mostrar datos en tiempo real.
 * 
 * Ventajas:
 * - **Rendimiento**: Consultas muy rápidas (lee datos pre-calculados)
 * - **Índices**: Puede crear índices sobre la vista
 * - **Agregaciones**: Ideal para SUM, COUNT, AVG complejos
 * - **JOINs costosos**: Pre-calcula joins de muchas tablas
 * 
 * Desventajas:
 * - **Desactualizada**: Datos pueden estar obsoletos
 * - **Espacio**: Consume espacio en disco
 * - **Refresh**: Requiere actualización manual/programada
 * - **Mantenimiento**: Debe refrescarse periódicamente
 * 
 * Métodos de actualización (REFRESH):
 * - **REFRESH MATERIALIZED VIEW**: Bloquea la vista durante actualización
 * - **REFRESH MATERIALIZED VIEW CONCURRENTLY**: No bloquea (requiere índice único)
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE MATERIALIZED VIEW nombre AS SELECT ...
 * ```
 * 
 * Actualización posterior:
 * ```sql
 * REFRESH MATERIALIZED VIEW nombre;
 * REFRESH MATERIALIZED VIEW CONCURRENTLY nombre; -- Sin bloqueo
 * ```
 * 
 * @example
 * // 1. Vista simple sin columnas explícitas
 * qb.createView('usuarios_activos', {
 *   as: qb.select().from('usuarios').where(qb.eq('activo', true))
 * });
 * // Genera: CREATE VIEW usuarios_activos AS 
 * //         SELECT * FROM usuarios WHERE activo = true
 * 
 * @example
 * // 2. Vista con columnas renombradas
 * qb.createView('resumen_usuarios', {
 *   cols: ['id_usuario', 'nombre_completo', 'email'],
 *   as: qb.select(['id', 'nombre', 'email']).from('usuarios')
 * });
 * // Genera: CREATE VIEW resumen_usuarios (id_usuario, nombre_completo, email) AS 
 * //         SELECT id, nombre, email FROM usuarios
 * 
 * @example
 * // 3. Vista con CHECK OPTION para validar INSERT/UPDATE
 * qb.createView('CDS_EN_EXISTENCIA', {
 *   as: qb.select(['TITULO_CD', 'EN_EXISTENCIA'])
 *         .from('DISCOS_COMPACTOS')
 *         .where(qb.gt('EN_EXISTENCIA', 10)),
 *   check: true
 * });
 * // Genera: CREATE VIEW CDS_EN_EXISTENCIA AS
 * //         SELECT TITULO_CD, EN_EXISTENCIA FROM DISCOS_COMPACTOS
 * //         WHERE EN_EXISTENCIA > 10
 * //         WITH CHECK OPTION
 * // Ahora: INSERT con EN_EXISTENCIA <= 10 será rechazado
 * 
 * @example
 * // 4. Vista con JOIN complejo y alias de columnas
 * qb.createView('EDITORES_CD', {
 *   cols: ['TITULO_CD', 'EDITOR'],
 *   as: qb.select([
 *           qb.col('TITULO_CD', 'DISCOS_COMPACTOS'),
 *           qb.col('NOMBRE_DISCOGRAFICA', 'DISQUERAS_CD')
 *         ])
 *         .from(['DISCOS_COMPACTOS', 'DISQUERAS_CD'])
 *         .where(qb.eq(
 *           qb.col('ID_DISQUERA', 'DISCOS_COMPACTOS'),
 *           qb.col('ID_DISQUERA', 'DISQUERAS_CD')
 *         ))
 * });
 * 
 * @example
 * // 5. Vista con OR REPLACE (actualiza vista existente)
 * qb.createView('usuarios_activos', {
 *   replace: true,
 *   as: qb.select(['id', 'nombre', 'email'])
 *         .from('usuarios')
 *         .where(qb.and(
 *           qb.eq('activo', true),
 *           qb.gt('ultima_sesion', '2024-01-01')
 *         ))
 * });
 * // Genera: CREATE OR REPLACE VIEW usuarios_activos AS ...
 * 
 * @example
 * // 6. Vista con consulta SQL directa (string)
 * qb.createView('ventas_mensuales', {
 *   as: `SELECT 
 *          DATE_TRUNC('month', fecha) as mes,
 *          SUM(monto) as total,
 *          COUNT(*) as cantidad
 *        FROM ventas
 *        GROUP BY DATE_TRUNC('month', fecha)`
 * });
 * 
 * @example
 * // 7. Vista MySQL con opciones de seguridad
 * qb.createView('salarios_publicos', {
 *   algorithm: 'MERGE',
 *   security: 'DEFINER',
 *   user: 'admin@localhost',
 *   as: 'SELECT nombre, salario FROM empleados'
 * });
 * // Genera: CREATE ALGORITHM=MERGE DEFINER=`admin`@`localhost`
 * //         SQL SECURITY DEFINER VIEW salarios_publicos AS
 * //         SELECT nombre, salario FROM empleados
 * 
 * @example
 * // 8. Vista temporal para procesamiento de sesión (PostgreSQL)
 * qb.createView('calculos_temporales', {
 *   temporary: true,
 *   as: qb.select(['id', qb.raw('precio * cantidad as total')])
 *         .from('pedidos')
 * });
 * // Se elimina automáticamente al cerrar conexión
 * 
 * @example
 * // 9. Vista materializada para reportes (PostgreSQL)
 * qb.createView('estadisticas_ventas', {
 *   materialized: true,
 *   as: `SELECT 
 *          producto_id,
 *          COUNT(*) as total_ventas,
 *          SUM(monto) as ingresos_totales,
 *          AVG(monto) as ticket_promedio
 *        FROM ventas
 *        GROUP BY producto_id`
 * });
 * // Después actualizar con: REFRESH MATERIALIZED VIEW estadisticas_ventas;
 * 
 * @example
 * // 10. Vista con subconsulta y agregaciones
 * qb.createView('productos_populares', {
 *   cols: ['producto', 'total_vendido', 'ranking'],
 *   as: `SELECT 
 *          p.nombre,
 *          COUNT(v.id) as total,
 *          RANK() OVER (ORDER BY COUNT(v.id) DESC) as ranking
 *        FROM productos p
 *        LEFT JOIN ventas v ON p.id = v.producto_id
 *        GROUP BY p.id, p.nombre
 *        HAVING COUNT(v.id) > 100`
 * });
 * 
 * @example
 * // 11. Uso completo: crear vista, usarla, actualizarla, eliminarla
 * // Paso 1: Crear vista
 * await qb.createView('clientes_premium', {
 *   as: qb.select().from('clientes').where(qb.gte('total_compras', 10000))
 * }).execute();
 * 
 * // Paso 2: Consultar vista como tabla normal
 * const premium = await qb.select().from('clientes_premium').execute();
 * 
 * // Paso 3: Actualizar definición de vista
 * await qb.createView('clientes_premium', {
 *   replace: true,
 *   as: qb.select(['id', 'nombre', 'total_compras'])
 *         .from('clientes')
 *         .where(qb.gte('total_compras', 5000))
 * }).execute();
 * 
 * // Paso 4: Eliminar vista
 * // await qb.dropView('clientes_premium').execute();
 * 
 * @see {@link types.dropViewOptions} - Para opciones de eliminación de vistas
 * @see {@link types.createTableOptions} - Para crear tablas reales en lugar de vistas
 * @see {@link QueryBuilder#select} - Para construir consultas SELECT complejas
 */

/**
 * Opciones de configuración para la eliminación de vistas (DROP VIEW).
 * 
 * Elimina una vista existente de la base de datos. Las vistas son objetos dependientes
 * que pueden tener otros objetos que las referencian (otras vistas, procedimientos,
 * funciones, triggers), por lo que es importante considerar las dependencias antes
 * de eliminarlas.
 * 
 * **TIPOS DE ELIMINACIÓN:**
 * 
 * 1. **Eliminación simple** (por defecto):
 *    - Falla si hay objetos que dependen de la vista
 *    - Protección contra eliminaciones accidentales
 *    - Comportamiento más seguro
 * 
 * 2. **CASCADE**:
 *    - Elimina la vista y TODOS los objetos dependientes
 *    - Útil cuando se reorganiza el esquema
 *    - PELIGROSO: Puede eliminar más de lo esperado
 *    - Requiere verificación cuidadosa de dependencias
 * 
 * 3. **RESTRICT** (explícito):
 *    - Falla si hay dependencias (igual que por defecto)
 *    - Hace explícita la intención de protección
 *    - Documentación clara del comportamiento esperado
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ DROP VIEW con CASCADE/RESTRICT
 * - **PostgreSQL**: ✅ Soporte completo + DROP MATERIALIZED VIEW
 * - **MySQL**: ✅ Soporte completo (no tiene CASCADE/RESTRICT explícito)
 * - **SQL Server**: ✅ DROP VIEW (CASCADE implícito, debe eliminar dependencias antes)
 * - **Oracle**: ✅ DROP VIEW con CASCADE CONSTRAINTS
 * - **SQLite**: ✅ DROP VIEW simple (sin CASCADE/RESTRICT)
 * 
 * **CONSIDERACIONES DE SEGURIDAD:**
 * 
 * ⚠️ **ANTES DE ELIMINAR UNA VISTA:**
 * 1. Verificar dependencias (otras vistas, procedimientos que la usan)
 * 2. Revisar permisos otorgados (GRANTs) que se perderán
 * 3. Confirmar que no hay aplicaciones que la consultan
 * 4. Hacer backup del esquema si es producción
 * 5. Considerar DROP IF EXISTS para scripts idempotentes
 * 
 * **DEPENDENCIAS COMUNES:**
 * - Otras vistas que usan esta vista en su SELECT
 * - Procedimientos almacenados que consultan la vista
 * - Funciones que referencian la vista
 * - Triggers que leen de la vista
 * - Reportes y consultas de aplicaciones
 * 
 * **ALTERNATIVAS A DROP VIEW:**
 * - **ALTER VIEW**: Cambiar definición sin eliminar (CREATE OR REPLACE)
 * - **RENAME**: Renombrar temporalmente para testing
 * - **REVOKE**: Quitar permisos sin eliminar
 * - **Comment out**: Deshabilitar lógica de aplicación primero
 * 
 * @global
 * @typedef {Object} types.dropViewOptions
 * 
 * @property {string} [option] - Comportamiento ante dependencias de la vista.
 * 
 * Controla qué sucede cuando existen objetos que dependen de la vista a eliminar.
 * 
 * Valores permitidos:
 * 
 * **'CASCADE'** - Eliminación en cascada:
 * - Elimina la vista y TODOS los objetos que dependen de ella
 * - Incluye: vistas que la referencian, procedimientos, funciones
 * - Puede causar eliminaciones en cadena extensas
 * - Útil en: desarrollo, reorganización de esquemas, limpieza completa
 * 
 * Comportamiento de CASCADE:
 * ```
 * Vista A → Vista B → Vista C
 *           ↓
 *      Procedimiento X
 * 
 * DROP VIEW A CASCADE;
 * -- Resultado: Elimina A, B, C y Procedimiento X
 * ```
 * 
 * ⚠️ **PELIGROS DE CASCADE:**
 * - Puede eliminar objetos críticos sin advertencia
 * - Difícil de revertir (requiere recrear todo)
 * - En producción puede causar downtime severo
 * - Puede romper aplicaciones que dependen de objetos eliminados
 * 
 * **Recomendaciones para CASCADE:**
 * 1. Consultar dependencias primero con queries del sistema:
 *    ```sql
 *    -- PostgreSQL: Ver dependencias
 *    SELECT * FROM pg_depend WHERE refobjid = 'vista_name'::regclass;
 *    ```
 * 2. Usar solo en entornos de desarrollo/testing
 * 3. Hacer backup completo antes de ejecutar en producción
 * 4. Documentar todos los objetos que se eliminarán
 * 5. Validar con equipo antes de ejecutar
 * 
 * **'RESTRICT'** - Restricción estricta (explícita):
 * - Falla la operación si HAY CUALQUIER dependencia
 * - Protección máxima contra eliminaciones accidentales
 * - Comportamiento por defecto en SQL estándar
 * - Documenta explícitamente la intención de seguridad
 * 
 * Comportamiento de RESTRICT:
 * ```
 * DROP VIEW A RESTRICT;
 * -- Si existe Vista B que usa A: ERROR
 * -- Si no hay dependencias: Eliminación exitosa
 * ```
 * 
 * **Ventajas de RESTRICT:**
 * - Seguridad: Evita eliminaciones no intencionales
 * - Control: Obliga a eliminar dependencias manualmente
 * - Documentación: Hace explícita la expectativa
 * - Auditoría: Fuerza revisión de dependencias
 * 
 * **undefined** (no especificado):
 * - Comportamiento por defecto del SGBD
 * - Generalmente equivale a RESTRICT en SQL estándar
 * - MySQL: Elimina sin verificar dependencias (similar a CASCADE)
 * - PostgreSQL/Oracle: Comportamiento RESTRICT
 * 
 * **Diferencias por SGBD:**
 * 
 * PostgreSQL:
 * - `DROP VIEW nombre;` → Falla si hay dependencias
 * - `DROP VIEW nombre RESTRICT;` → Igual, pero explícito
 * - `DROP VIEW nombre CASCADE;` → Elimina todo en cascada
 * 
 * MySQL:
 * - No soporta CASCADE/RESTRICT explícitamente
 * - Comportamiento: Elimina la vista incluso si hay otras vistas que la usan
 * - Otras vistas quedarán inválidas pero no se eliminan
 * 
 * SQL Server:
 * - No tiene CASCADE/RESTRICT
 * - Debe eliminar manualmente objetos dependientes primero
 * - Consultar sys.sql_dependencies para ver dependencias
 * 
 * **CONSULTAS ÚTILES PARA DEPENDENCIAS:**
 * 
 * PostgreSQL:
 * ```sql
 * -- Ver vistas que dependen de esta vista
 * SELECT DISTINCT dependent_view.relname
 * FROM pg_depend 
 * JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
 * JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid
 * WHERE pg_depend.refobjid = 'mi_vista'::regclass;
 * ```
 * 
 * MySQL:
 * ```sql
 * -- Ver vistas en el esquema actual
 * SELECT * FROM information_schema.views 
 * WHERE table_schema = DATABASE();
 * ```
 * 
 * SQL Server:
 * ```sql
 * -- Ver objetos que dependen de la vista
 * EXEC sp_depends 'nombre_vista';
 * ```
 * 
 * Sintaxis generada:
 * ```sql
 * DROP VIEW nombre CASCADE;
 * DROP VIEW nombre RESTRICT;
 * DROP VIEW nombre; -- Sin opción (RESTRICT implícito)
 * ```
 * 
 * @property {boolean} [ifExists=false] - Evita error si la vista no existe.
 * 
 * Cuando es `true`, usa DROP VIEW IF EXISTS, que no genera error si la vista
 * no existe. Útil para scripts idempotentes y automatización.
 * 
 * Comportamiento:
 * - `false` o no especificado: Error si la vista no existe
 * - `true`: Operación exitosa incluso si la vista no existe (no-op silenciosa)
 * 
 * **Ventajas de IF EXISTS:**
 * - Scripts idempotentes (ejecutar múltiples veces sin error)
 * - Limpieza automática (eliminar si existe, ignorar si no)
 * - Deployment automatizado (rollback, recreación)
 * - Testing (limpiar estado entre tests)
 * 
 * **Casos de uso comunes:**
 * 
 * 1. **Scripts de migración**:
 *    ```sql
 *    DROP VIEW IF EXISTS vista_antigua;
 *    CREATE VIEW vista_antigua AS ...
 *    ```
 * 
 * 2. **Cleanup scripts**:
 *    ```sql
 *    DROP VIEW IF EXISTS temp_view_1 CASCADE;
 *    DROP VIEW IF EXISTS temp_view_2 CASCADE;
 *    ```
 * 
 * 3. **Scripts de desarrollo**:
 *    - Ejecutar múltiples veces durante desarrollo
 *    - No preocuparse si la vista ya fue eliminada
 * 
 * 4. **CI/CD pipelines**:
 *    - Limpiar entorno de testing
 *    - Preparar esquema sin errores
 * 
 * Sintaxis generada:
 * ```sql
 * DROP VIEW IF EXISTS nombre;
 * DROP VIEW IF EXISTS nombre CASCADE;
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅
 * - MySQL ✅ (desde 5.7.6)
 * - SQL Server ✅ (desde SQL Server 2016)
 * - Oracle ❌ (no soporta IF EXISTS directamente, usar bloque PL/SQL)
 * - SQLite ✅
 * 
 * @property {boolean} [materialized=false] - **Solo PostgreSQL**. Indica que es vista materializada.
 * 
 * Cuando es `true`, genera DROP MATERIALIZED VIEW en lugar de DROP VIEW.
 * Las vistas materializadas requieren comando diferente en PostgreSQL.
 * 
 * Comportamiento:
 * - `false`: DROP VIEW (vista estándar)
 * - `true`: DROP MATERIALIZED VIEW (vista materializada)
 * 
 * **Diferencias importantes:**
 * - Vista estándar: Solo estructura, no datos
 * - Vista materializada: Contiene datos físicos (como tabla)
 * 
 * **Consideraciones para vistas materializadas:**
 * - Ocupan espacio en disco (puede ser significativo)
 * - Pueden tener índices que también se eliminan
 * - Pueden tener jobs de refresh programados
 * - Eliminación puede ser más lenta (debe limpiar datos)
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * DROP MATERIALIZED VIEW nombre;
 * DROP MATERIALIZED VIEW IF EXISTS nombre CASCADE;
 * ```
 * 
 * **Limpieza completa de vista materializada:**
 * ```sql
 * -- 1. Eliminar índices primero (opcional, se eliminan automáticamente)
 * DROP INDEX IF EXISTS idx_vista_mat_id;
 * 
 * -- 2. Cancelar jobs de refresh (si existen)
 * -- [Lógica específica de scheduling]
 * 
 * -- 3. Eliminar vista materializada
 * DROP MATERIALIZED VIEW IF EXISTS mi_vista_mat CASCADE;
 * ```
 * 
 * @example
 * // 1. Eliminación simple (falla si hay dependencias)
 * qb.dropView('usuarios_activos');
 * // Genera: DROP VIEW usuarios_activos
 * 
 * @example
 * // 2. Eliminación con CASCADE (elimina dependencias)
 * qb.dropView('vista_base', { option: 'CASCADE' });
 * // Genera: DROP VIEW vista_base CASCADE
 * // PELIGRO: Elimina todas las vistas/procedimientos que dependan de vista_base
 * 
 * @example
 * // 3. Eliminación con RESTRICT (explícito, más seguro)
 * qb.dropView('vista_importante', { option: 'RESTRICT' });
 * // Genera: DROP VIEW vista_importante RESTRICT
 * // Error si hay cualquier dependencia
 * 
 * @example
 * // 4. Eliminación con IF EXISTS (no error si no existe)
 * qb.dropView('vista_temporal', { ifExists: true });
 * // Genera: DROP VIEW IF EXISTS vista_temporal
 * // Script idempotente
 * 
 * @example
 * // 5. Combinación: IF EXISTS + CASCADE
 * qb.dropView('vista_antigua', { 
 *   ifExists: true, 
 *   option: 'CASCADE' 
 * });
 * // Genera: DROP VIEW IF EXISTS vista_antigua CASCADE
 * // Útil para limpieza automática en development
 * 
 * @example
 * // 6. Eliminar vista materializada (PostgreSQL)
 * qb.dropView('estadisticas_ventas', { 
 *   materialized: true,
 *   ifExists: true
 * });
 * // Genera: DROP MATERIALIZED VIEW IF EXISTS estadisticas_ventas
 * 
 * @example
 * // 7. Script de limpieza completo
 * await qb.dropView('vista_nivel_3', { ifExists: true, option: 'CASCADE' }).execute();
 * await qb.dropView('vista_nivel_2', { ifExists: true, option: 'CASCADE' }).execute();
 * await qb.dropView('vista_nivel_1', { ifExists: true }).execute();
 * // Elimina jerarquía de vistas de forma segura
 * 
 * @example
 * // 8. Verificar dependencias antes de eliminar (PostgreSQL)
 * // Paso 1: Consultar dependencias
 * const dependencias = await qb.raw(`
 *   SELECT dependent_view.relname as vista_dependiente
 *   FROM pg_depend 
 *   JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
 *   JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid
 *   WHERE pg_depend.refobjid = 'mi_vista'::regclass
 * `).execute();
 * 
 * // Paso 2: Decidir estrategia
 * if (dependencias.length === 0) {
 *   // Seguro eliminar
 *   await qb.dropView('mi_vista').execute();
 * } else {
 *   console.log('Dependencias encontradas:', dependencias);
 *   // Usar CASCADE o eliminar dependencias manualmente
 *   await qb.dropView('mi_vista', { option: 'CASCADE' }).execute();
 * }
 * 
 * @example
 * // 9. Migración segura: reemplazar vista con nueva definición
 * // Opción A: CREATE OR REPLACE (recomendado si es posible)
 * await qb.createView('mi_vista', {
 *   replace: true,
 *   as: qb.select(['id', 'nombre', 'nuevo_campo']).from('tabla')
 * }).execute();
 * 
 * // Opción B: DROP + CREATE (si cambios estructurales mayores)
 * await qb.dropView('mi_vista', { ifExists: true, option: 'CASCADE' }).execute();
 * await qb.createView('mi_vista', {
 *   as: qb.select(['id', 'nombre_completo']).from('tabla')
 * }).execute();
 * 
 * @example
 * // 10. Procedimiento de eliminación en producción
 * async function eliminarVistaSafely(nombreVista) {
 *   try {
 *     // 1. Backup de definición
 *     const definicion = await qb.raw(`
 *       SELECT definition FROM pg_views WHERE viewname = '${nombreVista}'
 *     `).execute();
 *     
 *     console.log('Backup de vista:', definicion);
 *     
 *     // 2. Verificar dependencias
 *     const deps = await verificarDependencias(nombreVista);
 *     
 *     if (deps.length > 0) {
 *       console.warn('ADVERTENCIA: Dependencias encontradas:', deps);
 *       // Requiere aprobación manual
 *       return;
 *     }
 *     
 *     // 3. Eliminar con RESTRICT para seguridad extra
 *     await qb.dropView(nombreVista, { option: 'RESTRICT' }).execute();
 *     
 *     console.log(`Vista ${nombreVista} eliminada exitosamente`);
 *     
 *   } catch (error) {
 *     console.error('Error al eliminar vista:', error);
 *     // Rollback o notificación
 *   }
 * }
 * 
 * @example
 * // 11. Limpieza de vistas temporales en testing
 * afterEach(async () => {
 *   // Limpiar todas las vistas de test
 *   await qb.dropView('test_vista_1', { ifExists: true }).execute();
 *   await qb.dropView('test_vista_2', { ifExists: true }).execute();
 *   await qb.dropView('test_vista_3', { ifExists: true }).execute();
 * });
 * 
 * @see {@link types.createViewOptions} - Para opciones de creación de vistas
 * @see {@link types.dropTableOptions} - Para opciones similares en eliminación de tablas
 * @see {@link types.dropTypeOptions} - Para eliminación de tipos personalizados
 */

/**
 * Opciones de configuración para la creación de roles (CREATE ROLE).
 * 
 * Los roles son entidades de seguridad que representan usuarios individuales o grupos de usuarios.
 * Encapsulan permisos y privilegios que se pueden asignar de forma centralizada. Un rol puede
 * representar un trabajo específico (admin, editor, lector) o un usuario individual del sistema.
 * 
 * **CONCEPTOS FUNDAMENTALES:**
 * 
 * **Diferencia: ROLE vs USER**
 * - PostgreSQL: No distingue entre USER y ROLE (USER es alias de ROLE con LOGIN)
 * - MySQL: Roles son grupos de privilegios, Users son cuentas de autenticación
 * - SQL Server: Users y Roles son entidades separadas
 * - Oracle: Similar a SQL Server, Users y Roles separados
 * 
 * **Tipos de roles:**
 * 1. **Rol de aplicación**: Agrupa permisos para funcionalidad (app_admin, app_readonly)
 * 2. **Rol de usuario**: Representa persona individual (puede hacer LOGIN)
 * 3. **Rol de grupo**: Agrupa otros roles para herencia de permisos
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ Definido en SQL:1999 y posteriores
 * - **PostgreSQL**: ✅ Soporte completo, roles son unificados con usuarios
 * - **MySQL**: ✅ Desde MySQL 8.0 con sistema de roles completo
 * - **SQL Server**: ✅ Soporte completo, roles de base de datos y servidor
 * - **Oracle**: ✅ Soporte robusto con roles predefinidos y personalizados
 * - **SQLite**: ❌ NO soporta roles ni usuarios (base de datos archivo local)
 * - **MongoDB**: ✅ Sistema de roles integrado con privilegios granulares
 * 
 * **VENTAJAS DEL SISTEMA DE ROLES:**
 * 1. **Gestión centralizada**: Cambiar permisos en un lugar afecta a todos los usuarios del rol
 * 2. **Seguridad por principio de mínimo privilegio**: Asignar solo permisos necesarios
 * 3. **Auditoría simplificada**: Rastrear quién tiene qué permisos
 * 4. **Escalabilidad**: Administrar cientos de usuarios asignando roles
 * 5. **Mantenimiento**: Modificar permisos sin tocar usuarios individuales
 * 6. **Separación de responsabilidades**: Diferentes roles para diferentes funciones
 * 
 * **MEJORES PRÁCTICAS:**
 * - Usar roles en lugar de permisos directos a usuarios
 * - Crear roles por función de negocio, no por persona
 * - Principio de mínimo privilegio: solo permisos estrictamente necesarios
 * - Documentar cada rol y sus responsabilidades
 * - Revisar periódicamente roles y permisos otorgados
 * - No reutilizar roles entre aplicaciones diferentes
 * 
 * @global
 * @typedef {Object} types.createRolesOptions
 * 
 * @property {boolean} [ifNotExists=false] - **MySQL**. Evita error si el rol ya existe.
 * 
 * Cuando es `true`, usa CREATE ROLE IF NOT EXISTS, que no genera error si el rol
 * ya existe. Útil para scripts idempotentes y deployment automatizado.
 * 
 * Comportamiento:
 * - `false` o no especificado: Error si el rol ya existe
 * - `true`: Operación exitosa incluso si el rol existe (no-op silenciosa)
 * 
 * Ventajas:
 * - Scripts de deployment idempotentes
 * - Recreación de entornos sin errores
 * - Configuración inicial repetible
 * - CI/CD pipelines más robustos
 * 
 * Nota: PostgreSQL no soporta IF NOT EXISTS en CREATE ROLE (usar DO block o verificación previa)
 * 
 * Sintaxis generada (MySQL):
 * ```sql
 * CREATE ROLE IF NOT EXISTS nombre;
 * ```
 * 
 * @property {string} [host] - **MySQL**. Host desde el cual el rol puede conectarse.
 * 
 * En MySQL, los roles y usuarios están vinculados a hosts específicos, formando
 * una cuenta completa: 'usuario'@'host'
 * 
 * Valores comunes:
 * - `'localhost'`: Solo conexiones locales desde el mismo servidor
 * - `'%'`: Cualquier host (wildcard, menos seguro)
 * - `'192.168.1.%'`: Rango de IPs (subnet)
 * - `'app-server.example.com'`: Host específico
 * - `'10.0.0.5'`: IP específica
 * 
 * Comportamiento por defecto:
 * - MySQL: Si no se especifica, usa '%' (cualquier host)
 * - Seguridad: Siempre especificar host más restrictivo posible
 * 
 * Sintaxis generada (MySQL):
 * ```sql
 * CREATE ROLE 'nombre'@'localhost';
 * CREATE ROLE 'app_role'@'%.example.com';
 * ```
 * 
 * Mejores prácticas:
 * - Producción: Usar IPs/subnets específicas, nunca '%'
 * - Desarrollo: 'localhost' o subnet privada
 * - Aplicaciones: IP del servidor de aplicación
 * - Evitar '%' por razones de seguridad
 * 
 * @property {boolean} [super=false] - **PostgreSQL**. Otorga privilegios de superusuario.
 * 
 * Un SUPERUSER tiene todos los privilegios en la base de datos, incluyendo:
 * - Bypass de todos los checks de permisos
 * - Crear/eliminar bases de datos
 * - Crear/eliminar roles
 * - Modificar configuración del servidor
 * - Acceder a todos los objetos sin restricción
 * 
 * Valores:
 * - `true`: SUPERUSER (máximos privilegios)
 * - `false`: NOSUPERUSER (por defecto, restringido)
 * 
 * ⚠️ **ADVERTENCIA CRÍTICA:**
 * - SUPERUSER equivale a root/admin del sistema
 * - Puede destruir toda la base de datos
 * - Usar SOLO para roles administrativos de emergencia
 * - NUNCA para aplicaciones o usuarios normales
 * - Auditar constantemente el uso de superusuarios
 * 
 * Alternativas más seguras:
 * - Usar roles con permisos específicos (CREATEDB, CREATEROLE)
 * - Implementar sudo-like: roles que pueden escalar privilegios temporalmente
 * - Principio de mínimo privilegio: solo lo necesario
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE nombre SUPERUSER;      -- Superusuario
 * CREATE ROLE nombre NOSUPERUSER;    -- Normal (default)
 * ```
 * 
 * @property {boolean} [createDB=false] - **PostgreSQL**. Permite al rol crear bases de datos.
 * 
 * Valores:
 * - `true`: CREATEDB (puede crear nuevas bases de datos)
 * - `false`: NOCREATEDB (por defecto, no puede crear DBs)
 * 
 * Útil para:
 * - DBAs y administradores
 * - Entornos de desarrollo (crear/eliminar DBs de prueba)
 * - Aplicaciones multi-tenant que crean DBs por cliente
 * - Servicios de CI/CD que crean DBs temporales
 * 
 * Consideraciones:
 * - Puede consumir espacio en disco sin control
 * - Permite crear DBs con cualquier nombre
 * - No controla el tamaño de las DBs creadas
 * - Revisar periódicamente DBs creadas
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE nombre CREATEDB;
 * CREATE ROLE nombre NOCREATEDB;
 * ```
 * 
 * @property {boolean} [createRole=false] - **PostgreSQL**. Permite al rol crear otros roles.
 * 
 * Valores:
 * - `true`: CREATEROLE (puede crear/modificar/eliminar roles)
 * - `false`: NOCREATEROLE (por defecto)
 * 
 * Capacidades otorgadas:
 * - CREATE ROLE / DROP ROLE
 * - ALTER ROLE (modificar roles)
 * - GRANT / REVOKE (otorgar permisos)
 * - Asignar roles a otros roles
 * 
 * ⚠️ **RIESGO DE SEGURIDAD:**
 * - Puede crear rol con más privilegios que él mismo
 * - Puede otorgarse a sí mismo más permisos
 * - Escalar privilegios indirectamente
 * 
 * Recomendaciones:
 * - Solo para administradores de seguridad
 * - No combinar con SUPERUSER (redundante)
 * - Auditar creación/modificación de roles
 * - Limitar número de roles con este privilegio
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE nombre CREATEROLE;
 * CREATE ROLE nombre NOCREATEROLE;
 * ```
 * 
 * @property {boolean} [inherit=true] - **PostgreSQL**. Hereda privilegios de roles asignados.
 * 
 * Controla si el rol hereda automáticamente privilegios de roles a los que pertenece.
 * 
 * Valores:
 * - `true`: INHERIT (por defecto, hereda privilegios)
 * - `false`: NOINHERIT (debe usar SET ROLE para activar privilegios)
 * 
 * **INHERIT (comportamiento normal)**:
 * ```
 * GRANT rol_editor TO usuario_juan;
 * -- usuario_juan tiene automáticamente todos los permisos de rol_editor
 * ```
 * 
 * **NOINHERIT (activación manual)**:
 * ```
 * GRANT rol_admin TO usuario_maria NOINHERIT;
 * -- usuario_maria debe ejecutar: SET ROLE rol_admin;
 * -- Solo entonces tiene permisos de admin
 * ```
 * 
 * Casos de uso para NOINHERIT:
 * - Roles administrativos de emergencia (activar solo cuando sea necesario)
 * - Cumplimiento normativo (auditar cuándo se usan privilegios elevados)
 * - Separación de responsabilidades (usar rol normal vs admin)
 * - Reducir superficie de ataque (privilegios elevados no siempre activos)
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE nombre INHERIT;      -- Por defecto
 * CREATE ROLE nombre NOINHERIT;    -- Requiere SET ROLE
 * ```
 * 
 * @property {boolean} [login=false] - **PostgreSQL**. Permite al rol hacer LOGIN (conectarse).
 * 
 * Diferencia fundamental entre rol de usuario y rol de grupo:
 * - `true`: LOGIN - Puede autenticarse (usuario)
 * - `false`: NOLOGIN - Solo agrupación de permisos (grupo/rol abstracto)
 * 
 * **Rol con LOGIN (usuario)**:
 * - Puede conectarse a la base de datos
 * - Requiere password (generalmente)
 * - Representa persona o servicio individual
 * - Ejemplo: usuario_aplicacion, juan_perez
 * 
 * **Rol sin LOGIN (grupo)**:
 * - Solo contenedor de permisos
 * - Se asigna a otros roles con LOGIN
 * - No puede conectarse directamente
 * - Ejemplo: rol_readonly, rol_admin, rol_editor
 * 
 * Patrón recomendado:
 * ```
 * -- Crear roles de grupo (sin LOGIN)
 * CREATE ROLE rol_admin NOLOGIN;
 * CREATE ROLE rol_editor NOLOGIN;
 * 
 * -- Asignar permisos a roles de grupo
 * GRANT ALL ON TABLE productos TO rol_admin;
 * GRANT SELECT, UPDATE ON TABLE productos TO rol_editor;
 * 
 * -- Crear usuarios (con LOGIN) y asignar roles
 * CREATE ROLE usuario_ana LOGIN PASSWORD 'secure_pass';
 * GRANT rol_admin TO usuario_ana;
 * 
 * CREATE ROLE usuario_bob LOGIN PASSWORD 'secure_pass';
 * GRANT rol_editor TO usuario_bob;
 * ```
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE nombre LOGIN;        -- Usuario (puede conectarse)
 * CREATE ROLE nombre NOLOGIN;      -- Grupo (solo permisos)
 * 
 * -- Alternativa en PostgreSQL:
 * CREATE USER nombre;              -- Equivale a CREATE ROLE nombre LOGIN
 * ```
 * 
 * @property {boolean} [replication=false] - **PostgreSQL**. Permite al rol iniciar replicación.
 * 
 * Privilegio especial para streaming replication y gestión de réplicas.
 * 
 * Valores:
 * - `true`: REPLICATION (puede iniciar replicación streaming)
 * - `false`: NOREPLICATION (por defecto)
 * 
 * Capacidades otorgadas:
 * - Conectarse en modo replication
 * - Ejecutar comandos de replicación (START_REPLICATION)
 * - Leer WAL (Write-Ahead Log)
 * - Crear réplicas físicas y lógicas
 * 
 * Casos de uso:
 * - Configurar servidores standby (hot standby)
 * - Replicación streaming para alta disponibilidad
 * - Roles para herramientas de backup (pg_basebackup)
 * - Replicación lógica entre bases de datos
 * 
 * Seguridad:
 * - Solo para roles de sistema/servicio
 * - Nunca para usuarios de aplicación
 * - Acceso a todo el contenido de la base de datos
 * - Auditar uso constantemente
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE replicator REPLICATION LOGIN PASSWORD 'secret';
 * ```
 * 
 * Ejemplo configuración réplica:
 * ```sql
 * -- En servidor primario:
 * CREATE ROLE replica_user REPLICATION LOGIN PASSWORD 'replica_pass';
 * 
 * -- En pg_hba.conf:
 * host replication replica_user replica_server_ip/32 md5
 * ```
 * 
 * @property {boolean} [bypass=false] - **PostgreSQL**. Bypass Row Level Security (RLS).
 * 
 * Permite ignorar políticas de Row Level Security definidas en tablas.
 * 
 * Valores:
 * - `true`: BYPASSRLS (ignora políticas RLS)
 * - `false`: NOBYPASSRLS (respeta políticas RLS, por defecto)
 * 
 * **Row Level Security (RLS)** es un sistema que filtra filas según usuario:
 * ```sql
 * -- Política: Los usuarios solo ven sus propias filas
 * CREATE POLICY user_policy ON tabla
 *   FOR ALL TO PUBLIC
 *   USING (user_id = current_user);
 * 
 * -- Rol con BYPASSRLS ve TODAS las filas (ignora política)
 * -- Rol con NOBYPASSRLS solo ve sus filas (respeta política)
 * ```
 * 
 * Casos de uso para BYPASSRLS:
 * - Administradores que necesitan ver todos los datos
 * - Procesos de auditoría completa
 * - Backups y exports de datos completos
 * - Reportes globales de gestión
 * 
 * Riesgos:
 * - Acceso a datos que deberían estar restringidos
 * - Puede violar políticas de privacidad
 * - Debe documentarse y auditarse
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE admin BYPASSRLS;
 * CREATE ROLE app_user NOBYPASSRLS;
 * ```
 * 
 * @property {number} [limit] - **PostgreSQL**. Límite de conexiones concurrentes para el rol.
 * 
 * Controla cuántas conexiones simultáneas puede tener el rol.
 * 
 * Valores:
 * - Número positivo: Máximo de conexiones simultáneas
 * - `-1`: Sin límite (por defecto)
 * - `0`: No puede conectarse (útil con NOLOGIN)
 * 
 * Utilidad:
 * - Prevenir consumo excesivo de conexiones
 * - Controlar conexiones por aplicación
 * - Limitar usuarios de desarrollo
 * - Pool de conexiones controlado
 * 
 * Consideraciones:
 * - PostgreSQL tiene límite global (max_connections)
 * - Límite de rol se resta del global
 * - Monitorear conexiones activas: `SELECT * FROM pg_stat_activity`
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE app_user CONNECTION LIMIT 10;
 * CREATE ROLE batch_process CONNECTION LIMIT 1;
 * CREATE ROLE unlimited_user CONNECTION LIMIT -1;
 * ```
 * 
 * Ejemplo práctico:
 * ```sql
 * -- Aplicación web: pool de 20 conexiones
 * CREATE ROLE webapp LOGIN CONNECTION LIMIT 20;
 * 
 * -- Proceso batch: 1 conexión
 * CREATE ROLE etl_process LOGIN CONNECTION LIMIT 1;
 * 
 * -- Usuario admin: sin límite
 * CREATE ROLE admin LOGIN SUPERUSER CONNECTION LIMIT -1;
 * ```
 * 
 * @property {string} [password] - **PostgreSQL**. Contraseña para autenticación del rol.
 * 
 * Define la contraseña que el rol usará para autenticarse al conectarse.
 * 
 * Formato:
 * - String plano: `'mi_password'` (se encripta automáticamente)
 * - Hash MD5: `'md5' + md5(password + username)`
 * - SCRAM-SHA-256: Formato encriptado moderno
 * 
 * Recomendaciones de seguridad:
 * - **Mínimo 12 caracteres**
 * - Combinación de mayúsculas, minúsculas, números, símbolos
 * - No usar palabras de diccionario
 * - No reutilizar passwords
 * - Rotar passwords periódicamente
 * - Usar gestores de passwords (Vault, Secrets Manager)
 * 
 * Métodos de encriptación (PostgreSQL):
 * - `PASSWORD 'texto'`: Encriptación según password_encryption (configuración)
 * - `ENCRYPTED PASSWORD 'hash'`: Hash pre-calculado
 * - `UNENCRYPTED PASSWORD 'texto'`: ⚠️ NO USAR, inseguro
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE usuario LOGIN PASSWORD 'secure_password_123';
 * CREATE ROLE usuario LOGIN PASSWORD 'md5...'; -- Hash MD5
 * CREATE ROLE usuario LOGIN PASSWORD 'SCRAM-SHA-256$...'; -- SCRAM
 * ```
 * 
 * Mejores prácticas:
 * ```sql
 * -- ❌ MAL: Password débil en código
 * CREATE ROLE usuario LOGIN PASSWORD '123456';
 * 
 * -- ✅ BIEN: Password fuerte desde variable de entorno
 * CREATE ROLE usuario LOGIN PASSWORD '${SECURE_PASSWORD}';
 * 
 * -- ✅ MEJOR: Usar servicio de secrets
 * -- Obtener password de AWS Secrets Manager, Azure Key Vault, etc.
 * ```
 * 
 * Configurar método de encriptación:
 * ```sql
 * -- En postgresql.conf:
 * password_encryption = 'scram-sha-256'  -- Más seguro (default en PG 14+)
 * password_encryption = 'md5'            -- Legacy
 * ```
 * 
 * @property {string} [valid] - **PostgreSQL**. Timestamp hasta el cual el password es válido.
 * 
 * Define fecha/hora de expiración del password. Después de esta fecha,
 * el rol no podrá autenticarse hasta que se cambie el password.
 * 
 * Formato: Timestamp SQL
 * - `'2025-12-31 23:59:59'`
 * - `'2025-12-31'`
 * - `'infinity'` - Nunca expira (por defecto)
 * 
 * Casos de uso:
 * - Cuentas temporales (contractors, consultores)
 * - Accesos de emergencia con tiempo limitado
 * - Cumplimiento normativo (rotación obligatoria de passwords)
 * - Usuarios de testing con expiración automática
 * 
 * Comportamiento al expirar:
 * - Login falla con error de autenticación
 * - Debe cambiar password con ALTER ROLE
 * - Superusuario puede cambiar password de cualquier rol
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE temporal LOGIN PASSWORD 'pass' VALID UNTIL '2025-12-31';
 * CREATE ROLE permanente LOGIN PASSWORD 'pass' VALID UNTIL 'infinity';
 * ```
 * 
 * Monitoreo de expiración:
 * ```sql
 * -- Ver roles con passwords próximos a expirar
 * SELECT rolname, rolvaliduntil 
 * FROM pg_authid 
 * WHERE rolvaliduntil < NOW() + INTERVAL '30 days';
 * ```
 * 
 * Renovación:
 * ```sql
 * -- Extender expiración 90 días
 * ALTER ROLE usuario VALID UNTIL NOW() + INTERVAL '90 days';
 * ```
 * 
 * @property {string} [inRole] - **PostgreSQL**. Roles a los que este rol pertenecerá automáticamente.
 * 
 * Asigna el nuevo rol como miembro de otros roles existentes durante la creación.
 * 
 * Formato:
 * - Un rol: `'rol_editor'`
 * - Múltiples roles: `'rol_editor, rol_viewer, rol_reporter'`
 * 
 * Equivale a ejecutar GRANT después de CREATE:
 * ```sql
 * CREATE ROLE usuario IN ROLE rol_editor, rol_viewer;
 * -- Es equivalente a:
 * CREATE ROLE usuario;
 * GRANT rol_editor TO usuario;
 * GRANT rol_viewer TO usuario;
 * ```
 * 
 * Beneficios:
 * - Configuración atómica (todo en un comando)
 * - Menos comandos SQL
 * - Más claro en scripts de deployment
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE usuario LOGIN IN ROLE rol_editor;
 * CREATE ROLE usuario IN ROLE rol_admin, rol_developer;
 * ```
 * 
 * @property {string} [role] - **PostgreSQL**. Roles que serán miembros de este rol automáticamente.
 * 
 * Asigna otros roles como miembros del rol que se está creando.
 * Inverso de `inRole`: este rol contendrá a otros roles.
 * 
 * Formato:
 * - Un rol: `'usuario1'`
 * - Múltiples roles: `'usuario1, usuario2, usuario3'`
 * 
 * Equivale a ejecutar GRANT después de CREATE:
 * ```sql
 * CREATE ROLE grupo_admin ROLE usuario1, usuario2;
 * -- Es equivalente a:
 * CREATE ROLE grupo_admin;
 * GRANT grupo_admin TO usuario1;
 * GRANT grupo_admin TO usuario2;
 * ```
 * 
 * Uso típico: Crear rol de grupo con miembros iniciales
 * ```sql
 * CREATE ROLE equipo_desarrollo 
 *   NOLOGIN 
 *   ROLE developer1, developer2, developer3;
 * ```
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE grupo ROLE usuario1, usuario2;
 * ```
 * 
 * @property {string} [admin] - **PostgreSQL**. Roles que serán administradores de este rol.
 * 
 * Asigna otros roles como administradores del rol que se está creando.
 * Los administradores pueden agregar/remover miembros del rol.
 * 
 * Similar a `role`, pero con WITH ADMIN OPTION:
 * ```sql
 * CREATE ROLE grupo_ventas ADMIN manager1, manager2;
 * -- Es equivalente a:
 * CREATE ROLE grupo_ventas;
 * GRANT grupo_ventas TO manager1 WITH ADMIN OPTION;
 * GRANT grupo_ventas TO manager2 WITH ADMIN OPTION;
 * ```
 * 
 * **WITH ADMIN OPTION** permite al rol:
 * - Otorgar el rol a otros usuarios
 * - Revocar el rol de otros usuarios
 * - Gestionar membresía del rol
 * 
 * Casos de uso:
 * - Managers que administran permisos de su equipo
 * - Delegación de gestión de roles sin ser superusuario
 * - Administración descentralizada de permisos
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * CREATE ROLE equipo_marketing ADMIN jefe_marketing;
 * CREATE ROLE equipo_ventas ADMIN manager1, manager2;
 * ```
 * 
 * Ejemplo completo:
 * ```sql
 * -- Crear rol de equipo con admin
 * CREATE ROLE equipo_desarrollo 
 *   NOLOGIN
 *   ADMIN tech_lead;
 * 
 * -- Ahora tech_lead puede administrar el equipo:
 * -- (ejecutado como tech_lead)
 * GRANT equipo_desarrollo TO developer_junior;
 * REVOKE equipo_desarrollo FROM developer_junior;
 * ```
 * 
 * @example
 * // 1. Rol simple sin opciones (PostgreSQL)
 * qb.createRoles('rol_readonly');
 * // Genera: CREATE ROLE rol_readonly
 * 
 * @example
 * // 2. Múltiples roles a la vez
 * qb.createRoles(['admin', 'editor', 'viewer']);
 * // Genera: CREATE ROLE admin;
 * //         CREATE ROLE editor;
 * //         CREATE ROLE viewer;
 * 
 * @example
 * // 3. Usuario con LOGIN y password (PostgreSQL)
 * qb.createRoles('usuario_app', {
 *   login: true,
 *   password: 'secure_password_123',
 *   limit: 10
 * });
 * // Genera: CREATE ROLE usuario_app 
 * //         WITH LOGIN PASSWORD 'secure_password_123' CONNECTION LIMIT 10
 * 
 * @example
 * // 4. Rol administrativo con permisos elevados (PostgreSQL)
 * qb.createRoles('dba_admin', {
 *   login: true,
 *   password: 'admin_pass',
 *   createDB: true,
 *   createRole: true,
 *   bypass: true
 * });
 * // Genera: CREATE ROLE dba_admin WITH LOGIN PASSWORD 'admin_pass'
 * //         CREATEDB CREATEROLE BYPASSRLS
 * 
 * @example
 * // 5. Rol de grupo sin LOGIN (PostgreSQL)
 * qb.createRoles('equipo_desarrollo', {
 *   login: false,
 *   inherit: true
 * });
 * // Genera: CREATE ROLE equipo_desarrollo NOLOGIN INHERIT
 * 
 * @example
 * // 6. Usuario temporal con expiración (PostgreSQL)
 * qb.createRoles('consultor_externo', {
 *   login: true,
 *   password: 'temp_pass',
 *   valid: '2025-12-31 23:59:59',
 *   limit: 2
 * });
 * // Genera: CREATE ROLE consultor_externo 
 * //         WITH LOGIN PASSWORD 'temp_pass' 
 * //         VALID UNTIL '2025-12-31 23:59:59' CONNECTION LIMIT 2
 * 
 * @example
 * // 7. Rol con herencia de otros roles (PostgreSQL)
 * qb.createRoles('usuario_completo', {
 *   login: true,
 *   password: 'pass',
 *   inRole: 'rol_editor, rol_viewer'
 * });
 * // Genera: CREATE ROLE usuario_completo 
 * //         WITH LOGIN PASSWORD 'pass' 
 * //         IN ROLE rol_editor, rol_viewer
 * 
 * @example
 * // 8. Rol de replicación (PostgreSQL)
 * qb.createRoles('replicator', {
 *   login: true,
 *   replication: true,
 *   password: 'replica_pass',
 *   limit: 3
 * });
 * // Genera: CREATE ROLE replicator 
 * //         WITH LOGIN REPLICATION PASSWORD 'replica_pass' CONNECTION LIMIT 3
 * 
 * @example
 * // 9. Rol en MySQL con IF NOT EXISTS
 * qb.createRoles('app_role', {
 *   ifNotExists: true,
 *   host: 'localhost'
 * });
 * // Genera (MySQL): CREATE ROLE IF NOT EXISTS 'app_role'@'localhost'
 * 
 * @example
 * // 10. Múltiples roles con opciones diferentes (PostgreSQL)
 * await qb.createRoles('rol_admin', {
 *   createDB: true,
 *   createRole: true
 * }).execute();
 * 
 * await qb.createRoles('rol_editor', {
 *   login: false
 * }).execute();
 * 
 * await qb.createRoles('usuario_ana', {
 *   login: true,
 *   password: 'secure_pass',
 *   inRole: 'rol_admin'
 * }).execute();
 * 
 * @example
 * // 11. Setup completo de roles para aplicación
 * async function setupApplicationRoles() {
 *   // 1. Crear roles de grupo (sin LOGIN)
 *   await qb.createRoles('app_admin', { login: false }).execute();
 *   await qb.createRoles('app_readonly', { login: false }).execute();
 *   await qb.createRoles('app_writer', { login: false }).execute();
 *   
 *   // 2. Asignar permisos a roles de grupo
 *   await qb.grant('ALL', 'productos', ['app_admin']).execute();
 *   await qb.grant('SELECT', 'productos', ['app_readonly']).execute();
 *   await qb.grant(['SELECT', 'INSERT', 'UPDATE'], 'productos', ['app_writer']).execute();
 *   
 *   // 3. Crear usuarios (con LOGIN) y asignar roles
 *   await qb.createRoles('usuario_admin', {
 *     login: true,
 *     password: process.env.ADMIN_PASSWORD,
 *     inRole: 'app_admin',
 *     limit: 5
 *   }).execute();
 *   
 *   await qb.createRoles('usuario_app', {
 *     login: true,
 *     password: process.env.APP_PASSWORD,
 *     inRole: 'app_writer',
 *     limit: 20
 *   }).execute();
 * }
 * 
 * @see {@link QueryBuilder#grant} - Para asignar permisos a roles
 * @see {@link QueryBuilder#revoke} - Para revocar permisos de roles
 * @see {@link types.dropRolesOptions} - Para opciones de eliminación de roles
 */

/**
 * Opciones de configuración para la eliminación de roles (DROP ROLE).
 * 
 * Elimina uno o más roles de la base de datos. La eliminación de roles es una operación
 * de administración crítica que debe realizarse con cuidado, ya que puede afectar la
 * seguridad y el acceso de usuarios y aplicaciones.
 * 
 * **CONSIDERACIONES IMPORTANTES:**
 * 
 * **¿Qué sucede al eliminar un rol?**
 * - Se revoca automáticamente el acceso de usuarios que tenían ese rol
 * - Se eliminan los permisos otorgados al rol
 * - Los objetos propiedad del rol quedan huérfanos o causan error
 * - Las sesiones activas del rol pueden continuar hasta desconexión
 * - Los permisos heredados a través del rol se pierden
 * 
 * **Antes de eliminar un rol:**
 * 1. ✅ Verificar usuarios que tienen ese rol asignado
 * 2. ✅ Comprobar objetos propiedad del rol (tablas, vistas, funciones)
 * 3. ✅ Revisar dependencias en aplicaciones y scripts
 * 4. ✅ Hacer backup de permisos y configuración del rol
 * 5. ✅ Notificar a usuarios afectados
 * 6. ✅ Considerar revocar permisos primero, eliminar después
 * 
 * **Alternativas a DROP ROLE:**
 * - **REVOKE**: Quitar permisos sin eliminar el rol
 * - **ALTER ROLE NOLOGIN**: Deshabilitar acceso sin eliminar
 * - **REASSIGN OWNED**: Transferir objetos a otro rol antes de eliminar
 * - **Renombrar**: ALTER ROLE ... RENAME TO (para deprecación gradual)
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ DROP ROLE definido en SQL:1999
 * - **PostgreSQL**: ✅ Soporte completo con opciones avanzadas
 * - **MySQL**: ✅ Desde MySQL 8.0 con IF EXISTS
 * - **SQL Server**: ✅ DROP ROLE para roles de base de datos
 * - **Oracle**: ✅ DROP ROLE con CASCADE opcional
 * - **SQLite**: ❌ NO soporta roles ni usuarios
 * - **MongoDB**: ✅ dropRole y dropAllRolesFromDatabase
 * 
 * **DIFERENCIAS POR SGBD:**
 * 
 * PostgreSQL:
 * - No tiene CASCADE explícito en DROP ROLE
 * - Falla si el rol tiene objetos (usar REASSIGN OWNED primero)
 * - Falla si el rol tiene membresías activas
 * - Debe usar DROP OWNED BY antes de DROP ROLE si tiene objetos
 * 
 * MySQL:
 * - Soporta IF EXISTS desde MySQL 8.0
 * - Los roles deben estar desasignados de usuarios primero
 * - No elimina automáticamente permisos otorgados por el rol
 * 
 * SQL Server:
 * - Solo roles de base de datos (no roles de servidor)
 * - Falla si el rol tiene miembros
 * - Falla si el rol posee objetos (schemas, etc.)
 * 
 * Oracle:
 * - Soporta CASCADE para revocar rol de todos los usuarios
 * - Puede eliminar roles con usuarios asignados usando CASCADE
 * 
 * @global
 * @typedef {Object} types.dropRolesOptions
 * 
 * @property {boolean} [ifExists=false] - Evita error si el rol no existe.
 * 
 * Cuando es `true`, usa DROP ROLE IF EXISTS, que no genera error si el rol
 * no existe. Útil para scripts idempotentes y limpieza automatizada.
 * 
 * Comportamiento:
 * - `false` o no especificado: Error si el rol no existe
 * - `true`: Operación exitosa incluso si el rol no existe (no-op silenciosa)
 * 
 * **Ventajas de IF EXISTS:**
 * - Scripts de limpieza idempotentes
 * - Deployment y rollback automatizado
 * - Configuración de entornos repetible
 * - Testing sin preocuparse del estado inicial
 * - CI/CD pipelines más robustos
 * 
 * **Casos de uso comunes:**
 * 
 * 1. **Scripts de limpieza**:
 *    ```sql
 *    DROP ROLE IF EXISTS temp_role;
 *    DROP ROLE IF EXISTS old_role;
 *    DROP ROLE IF EXISTS deprecated_role;
 *    ```
 * 
 * 2. **Recreación de roles**:
 *    ```sql
 *    DROP ROLE IF EXISTS app_admin;
 *    CREATE ROLE app_admin WITH ...;
 *    ```
 * 
 * 3. **Migrations**:
 *    - Eliminar roles antiguos durante actualizaciones
 *    - No fallar si rol ya fue eliminado manualmente
 * 
 * 4. **Testing**:
 *    - Limpiar estado entre tests
 *    - Setup/teardown de fixtures
 * 
 * Sintaxis generada:
 * ```sql
 * DROP ROLE IF EXISTS nombre;
 * DROP ROLE IF EXISTS rol1, rol2, rol3;  -- MySQL
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅ (desde PostgreSQL 8.1)
 * - MySQL ✅ (desde MySQL 8.0.0)
 * - SQL Server ✅ (desde SQL Server 2016, sintaxis: DROP IF EXISTS)
 * - Oracle ❌ (usar bloque PL/SQL con verificación)
 * - SQLite ❌ (no soporta roles)
 * 
 * @property {string} [host] - **MySQL**. Host asociado al rol para eliminación específica.
 * 
 * En MySQL, los roles están asociados a hosts específicos formando una cuenta: 'rol'@'host'.
 * Esta propiedad permite especificar qué instancia del rol eliminar cuando hay múltiples
 * con el mismo nombre en diferentes hosts.
 * 
 * Valores:
 * - `'localhost'`: Rol solo para conexiones locales
 * - `'%'`: Rol para cualquier host (wildcard)
 * - `'192.168.1.%'`: Rol para subnet específica
 * - `'app-server.example.com'`: Rol para host específico
 * - `'10.0.0.5'`: Rol para IP específica
 * 
 * **Escenario común en MySQL:**
 * ```sql
 * -- Pueden existir múltiples roles con mismo nombre:
 * 'app_role'@'localhost'
 * 'app_role'@'192.168.1.%'
 * 'app_role'@'%'
 * 
 * -- Eliminar instancia específica:
 * DROP ROLE 'app_role'@'localhost';
 * 
 * -- Sin especificar host, MySQL puede dar error ambiguo
 * ```
 * 
 * Comportamiento:
 * - Si se especifica: Elimina solo 'rol'@'host' específico
 * - Si no se especifica: MySQL intenta eliminar con host por defecto
 * - Recomendado: Siempre especificar para claridad
 * 
 * Sintaxis generada (MySQL):
 * ```sql
 * DROP ROLE 'nombre'@'localhost';
 * DROP ROLE IF EXISTS 'app_role'@'%.example.com';
 * ```
 * 
 * Consultar roles existentes con sus hosts:
 * ```sql
 * -- MySQL: Ver todos los roles
 * SELECT user, host FROM mysql.user WHERE account_locked = 'Y';
 * 
 * -- Ver roles específicos
 * SELECT user, host FROM mysql.user WHERE user = 'app_role';
 * ```
 * 
 * @property {boolean} [cascade=false] - **Oracle/PostgreSQL-like**. Revoca rol de usuarios automáticamente.
 * 
 * Controla qué sucede cuando el rol a eliminar está asignado a usuarios o tiene objetos.
 * 
 * Valores:
 * - `false`: Falla si el rol tiene dependencias (por defecto, más seguro)
 * - `true`: Intenta revocar/eliminar dependencias automáticamente
 * 
 * **Comportamiento por SGBD:**
 * 
 * **Oracle (soporta CASCADE directamente)**:
 * ```sql
 * DROP ROLE rol_name;          -- Falla si asignado a usuarios
 * DROP ROLE rol_name CASCADE;  -- Revoca de todos los usuarios primero
 * ```
 * 
 * **PostgreSQL (no soporta CASCADE en DROP ROLE)**:
 * - No existe CASCADE para DROP ROLE
 * - Debe usar procedimiento manual:
 *   1. `REVOKE rol FROM usuario1, usuario2, ...`
 *   2. `DROP OWNED BY rol` o `REASSIGN OWNED BY rol TO otro_rol`
 *   3. `DROP ROLE rol`
 * 
 * **MySQL**:
 * - No soporta CASCADE
 * - Debe revocar manualmente:
 *   ```sql
 *   REVOKE rol FROM usuario1, usuario2;
 *   DROP ROLE rol;
 *   ```
 * 
 * **Procedimiento seguro (PostgreSQL)**:
 * ```sql
 * -- 1. Ver quién tiene el rol
 * SELECT r.rolname AS role, m.rolname AS member
 * FROM pg_auth_members am
 * JOIN pg_roles r ON r.oid = am.roleid
 * JOIN pg_roles m ON m.oid = am.member
 * WHERE r.rolname = 'rol_a_eliminar';
 * 
 * -- 2. Revocar de todos
 * REVOKE rol_a_eliminar FROM usuario1, usuario2;
 * 
 * -- 3. Transferir objetos propiedad del rol
 * REASSIGN OWNED BY rol_a_eliminar TO nuevo_owner;
 * 
 * -- 4. Eliminar permisos restantes
 * DROP OWNED BY rol_a_eliminar;
 * 
 * -- 5. Finalmente eliminar rol
 * DROP ROLE rol_a_eliminar;
 * ```
 * 
 * ⚠️ **PELIGROS DE CASCADE:**
 * - Puede afectar múltiples usuarios sin advertencia
 * - Pérdida de permisos puede causar fallos en aplicaciones
 * - Difícil de revertir (debe reasignar permisos manualmente)
 * - En producción, preferir proceso manual controlado
 * 
 * **Recomendación:**
 * - Development/Testing: Puede usar CASCADE para limpieza rápida
 * - Staging: Verificar impacto antes de usar CASCADE
 * - Producción: NUNCA usar CASCADE, proceso manual auditado
 * 
 * @property {boolean} [restrict=false] - **Explícito**. Falla si el rol tiene dependencias.
 * 
 * Hace explícito el comportamiento por defecto: fallar si hay dependencias.
 * Documenta claramente la intención de protección en el código.
 * 
 * Valores:
 * - `false`: Comportamiento por defecto del SGBD
 * - `true`: RESTRICT explícito (falla si hay dependencias)
 * 
 * Diferencia con CASCADE:
 * ```
 * CASCADE:  Elimina rol + revoca de usuarios
 * RESTRICT: Falla si el rol está asignado a alguien (protección)
 * Default:  Generalmente equivale a RESTRICT
 * ```
 * 
 * **Ventajas de RESTRICT explícito:**
 * - Documentación: Hace clara la intención de seguridad
 * - Code review: Evita eliminar CASCADE por error
 * - Auditoría: Muestra que se consideró el impacto
 * - Prevención: Protección explícita contra eliminaciones peligrosas
 * 
 * Sintaxis generada (si soportado):
 * ```sql
 * DROP ROLE nombre RESTRICT;
 * ```
 * 
 * Nota: La mayoría de SGBDs no soportan RESTRICT explícito en DROP ROLE
 * (es el comportamiento por defecto), pero esta opción documenta la intención.
 * 
 * @example
 * // 1. Eliminación simple (falla si no existe)
 * qb.dropRoles('rol_temporal');
 * // Genera: DROP ROLE rol_temporal
 * 
 * @example
 * // 2. Eliminación con IF EXISTS (no error si no existe)
 * qb.dropRoles('rol_antiguo', { ifExists: true });
 * // Genera: DROP ROLE IF EXISTS rol_antiguo
 * 
 * @example
 * // 3. Eliminar múltiples roles a la vez
 * qb.dropRoles(['rol_dev', 'rol_test', 'rol_staging'], { ifExists: true });
 * // Genera: DROP ROLE IF EXISTS rol_dev;
 * //         DROP ROLE IF EXISTS rol_test;
 * //         DROP ROLE IF EXISTS rol_staging;
 * 
 * @example
 * // 4. Eliminar rol específico en MySQL con host
 * qb.dropRoles('app_role', { 
 *   ifExists: true, 
 *   host: 'localhost' 
 * });
 * // Genera (MySQL): DROP ROLE IF EXISTS 'app_role'@'localhost'
 * 
 * @example
 * // 5. Eliminación con CASCADE (Oracle, o simulado en PostgreSQL)
 * qb.dropRoles('rol_admin', { 
 *   cascade: true 
 * });
 * // Genera (Oracle): DROP ROLE rol_admin CASCADE
 * // PostgreSQL requiere proceso manual (ver procedimiento seguro)
 * 
 * @example
 * // 6. Script de limpieza completo
 * await qb.dropRoles('temp_role_1', { ifExists: true }).execute();
 * await qb.dropRoles('temp_role_2', { ifExists: true }).execute();
 * await qb.dropRoles('temp_role_3', { ifExists: true }).execute();
 * // Limpieza idempotente, no falla si roles ya fueron eliminados
 * 
 * @example
 * // 7. Procedimiento seguro de eliminación (PostgreSQL)
 * async function eliminarRolSeguro(nombreRol) {
 *   try {
 *     // 1. Verificar miembros del rol
 *     const miembros = await qb.raw(`
 *       SELECT m.rolname AS miembro
 *       FROM pg_auth_members am
 *       JOIN pg_roles r ON r.oid = am.roleid
 *       JOIN pg_roles m ON m.oid = am.member
 *       WHERE r.rolname = $1
 *     `, [nombreRol]).execute();
 *     
 *     if (miembros.length > 0) {
 *       console.log('Miembros encontrados:', miembros.map(m => m.miembro));
 *       
 *       // 2. Revocar rol de todos los miembros
 *       for (const miembro of miembros) {
 *         await qb.revoke(nombreRol).from(miembro.miembro).execute();
 *       }
 *     }
 *     
 *     // 3. Verificar objetos propiedad del rol
 *     const objetos = await qb.raw(`
 *       SELECT schemaname, tablename 
 *       FROM pg_tables 
 *       WHERE tableowner = $1
 *     `, [nombreRol]).execute();
 *     
 *     if (objetos.length > 0) {
 *       console.log('Objetos propiedad del rol:', objetos.length);
 *       
 *       // 4. Transferir propiedad a otro rol
 *       await qb.raw(`REASSIGN OWNED BY ${nombreRol} TO postgres`).execute();
 *       
 *       // 5. Eliminar permisos restantes
 *       await qb.raw(`DROP OWNED BY ${nombreRol}`).execute();
 *     }
 *     
 *     // 6. Finalmente eliminar el rol
 *     await qb.dropRoles(nombreRol).execute();
 *     
 *     console.log(`Rol ${nombreRol} eliminado exitosamente`);
 *     
 *   } catch (error) {
 *     console.error(`Error al eliminar rol ${nombreRol}:`, error);
 *     throw error;
 *   }
 * }
 * 
 * @example
 * // 8. Verificar dependencias antes de eliminar
 * async function verificarDependenciasRol(nombreRol) {
 *   // Ver usuarios que tienen el rol
 *   const usuarios = await qb.raw(`
 *     SELECT r.rolname as rol, m.rolname as usuario
 *     FROM pg_auth_members am
 *     JOIN pg_roles r ON r.oid = am.roleid
 *     JOIN pg_roles m ON m.oid = am.member
 *     WHERE r.rolname = $1
 *   `, [nombreRol]).execute();
 *   
 *   // Ver objetos propiedad del rol
 *   const tablas = await qb.raw(`
 *     SELECT schemaname, tablename 
 *     FROM pg_tables 
 *     WHERE tableowner = $1
 *   `, [nombreRol]).execute();
 *   
 *   const vistas = await qb.raw(`
 *     SELECT schemaname, viewname 
 *     FROM pg_views 
 *     WHERE viewowner = $1
 *   `, [nombreRol]).execute();
 *   
 *   return {
 *     usuarios: usuarios.length,
 *     tablas: tablas.length,
 *     vistas: vistas.length,
 *     puedeEliminar: usuarios.length === 0 && tablas.length === 0 && vistas.length === 0
 *   };
 * }
 * 
 * // Uso:
 * const deps = await verificarDependenciasRol('rol_admin');
 * if (deps.puedeEliminar) {
 *   await qb.dropRoles('rol_admin').execute();
 * } else {
 *   console.log('No se puede eliminar:', deps);
 * }
 * 
 * @example
 * // 9. Migración: Renombrar en lugar de eliminar
 * // Opción A: Renombrar rol deprecado
 * await qb.raw('ALTER ROLE rol_antiguo RENAME TO rol_antiguo_deprecated').execute();
 * 
 * // Opción B: Deshabilitar en lugar de eliminar
 * await qb.raw('ALTER ROLE rol_antiguo NOLOGIN').execute();
 * 
 * // Después de confirmar que no hay impacto, eliminar
 * await qb.dropRoles('rol_antiguo_deprecated', { ifExists: true }).execute();
 * 
 * @example
 * // 10. Limpieza de testing (afterEach hook)
 * afterEach(async () => {
 *   // Limpiar roles de test
 *   const rolesTest = ['test_admin', 'test_user', 'test_readonly'];
 *   
 *   for (const rol of rolesTest) {
 *     await qb.dropRoles(rol, { ifExists: true }).execute();
 *   }
 * });
 * 
 * @example
 * // 11. Script de deployment: Recrear roles
 * async function deployRoles() {
 *   // 1. Eliminar roles antiguos si existen
 *   await qb.dropRoles(['app_admin_v1', 'app_user_v1'], { ifExists: true }).execute();
 *   
 *   // 2. Crear nuevas versiones
 *   await qb.createRoles('app_admin_v2', {
 *     login: false,
 *     inherit: true
 *   }).execute();
 *   
 *   await qb.createRoles('app_user_v2', {
 *     login: false,
 *     inherit: true
 *   }).execute();
 *   
 *   // 3. Asignar permisos
 *   await qb.grant('ALL', 'productos', ['app_admin_v2']).execute();
 *   await qb.grant('SELECT', 'productos', ['app_user_v2']).execute();
 * }
 * 
 * @see {@link types.createRolesOptions} - Para opciones de creación de roles
 * @see {@link QueryBuilder#revoke} - Para revocar permisos antes de eliminar rol
 * @see {@link types.dropViewOptions} - Para opciones similares en eliminación de vistas
 */

/**
 * Especifica el tipo de objeto de base de datos sobre el cual se aplican permisos.
 * 
 * Usado en comandos GRANT y REVOKE para indicar explícitamente qué tipo de objeto
 * está siendo referenciado. Esto es importante porque diferentes tipos de objetos
 * pueden tener el mismo nombre en la base de datos.
 * 
 * @global
 * @typedef {string} types.objectTypes
 * 
 * Valores permitidos según SQL estándar:
 * 
 * - **'TABLE'**: Tabla de base de datos (por defecto si no se especifica)
 * - **'VIEW'**: Vista (query almacenada)
 * - **'SEQUENCE'**: Secuencia (generador de números)
 * - **'SCHEMA'**: Esquema (namespace de objetos)
 * - **'DATABASE'**: Base de datos completa
 * - **'FUNCTION'**: Función almacenada
 * - **'PROCEDURE'**: Procedimiento almacenado
 * - **'DOMAIN'**: Dominio (tipo personalizado)
 * - **'TYPE'**: Tipo personalizado
 * - **'TABLESPACE'**: Espacio de tablas
 * - **'LANGUAGE'**: Lenguaje procedural
 * - **'FOREIGN DATA WRAPPER'**: Wrapper para datos externos (PostgreSQL)
 * - **'FOREIGN SERVER'**: Servidor externo (PostgreSQL)
 * - **'ALL TABLES IN SCHEMA'**: Todas las tablas de un esquema (PostgreSQL)
 * - **'ALL SEQUENCES IN SCHEMA'**: Todas las secuencias (PostgreSQL)
 * - **'ALL FUNCTIONS IN SCHEMA'**: Todas las funciones (PostgreSQL)
 * 
 * **Comportamiento por defecto:**
 * Si no se especifica objectType, la mayoría de SGBDs asumen TABLE.
 * 
 * @example
 * // Permiso en tabla (por defecto)
 * qb.grant('SELECT', 'usuarios', 'app_user');
 * // Genera: GRANT SELECT ON TABLE usuarios TO app_user
 * 
 * @example
 * // Permiso en vista (explícito)
 * qb.grant('SELECT', { name: 'vista_activos', objectType: 'VIEW' }, 'app_user');
 * // Genera: GRANT SELECT ON VIEW vista_activos TO app_user
 * 
 * @example
 * // Permiso en secuencia
 * qb.grant('USAGE', { name: 'id_seq', objectType: 'SEQUENCE' }, 'app_user');
 * // Genera: GRANT USAGE ON SEQUENCE id_seq TO app_user
 * 
 * @example
 * // Permiso en esquema
 * qb.grant('USAGE', { name: 'public', objectType: 'SCHEMA' }, 'app_user');
 * // Genera: GRANT USAGE ON SCHEMA public TO app_user
 * 
 * @see {@link types.grantOptions} - Para opciones completas de GRANT
 */

/**
 * Opciones de configuración para otorgar permisos (GRANT).
 * 
 * El comando GRANT es fundamental en el control de acceso y seguridad de bases de datos.
 * Permite asignar privilegios específicos a usuarios o roles sobre objetos de la base de datos.
 * 
 * **PRINCIPIOS DE SEGURIDAD:**
 * 
 * 1. **Principio de mínimo privilegio**: Otorgar solo los permisos estrictamente necesarios
 * 2. **Separación de responsabilidades**: Diferentes roles para diferentes funciones
 * 3. **Auditoría**: Registrar quién otorga qué permisos a quién
 * 4. **Revocación**: Planificar cómo y cuándo revocar permisos
 * 5. **Granularidad**: Permisos a nivel de columna cuando sea posible
 * 
 * **TIPOS DE PRIVILEGIOS COMUNES:**
 * 
 * **Privilegios de lectura:**
 * - `SELECT`: Leer datos de tablas/vistas
 * - `SELECT(columna)`: Leer columnas específicas
 * 
 * **Privilegios de escritura:**
 * - `INSERT`: Insertar nuevas filas
 * - `UPDATE`: Modificar filas existentes
 * - `UPDATE(columna)`: Modificar columnas específicas
 * - `DELETE`: Eliminar filas
 * 
 * **Privilegios de estructura:**
 * - `CREATE`: Crear objetos (tablas, vistas, etc.)
 * - `ALTER`: Modificar estructura de objetos
 * - `DROP`: Eliminar objetos
 * - `TRUNCATE`: Vaciar tablas rápidamente
 * 
 * **Privilegios especiales:**
 * - `ALL PRIVILEGES` o `ALL`: Todos los privilegios disponibles
 * - `USAGE`: Usar esquemas, secuencias, dominios
 * - `EXECUTE`: Ejecutar funciones/procedimientos
 * - `REFERENCES`: Crear foreign keys que referencien tabla
 * - `TRIGGER`: Crear triggers en tabla
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ GRANT definido en SQL-92 y posteriores
 * - **PostgreSQL**: ✅ Soporte completo + permisos a nivel de columna
 * - **MySQL**: ✅ Soporte completo + GRANT OPTION
 * - **SQL Server**: ✅ Soporte completo + DENY (negación explícita)
 * - **Oracle**: ✅ Soporte robusto + roles y permisos de sistema
 * - **SQLite**: ❌ NO soporta usuarios ni permisos
 * - **MongoDB**: ✅ Sistema de roles y privilegios granulares
 * 
 * @global
 * @typedef {Object} types.grantOptions
 * 
 * @property {boolean} [withGrant=false] - Permite que el destinatario otorgue el permiso a otros.
 * 
 * Cuando es `true`, añade WITH GRANT OPTION al comando GRANT, permitiendo que
 * el usuario o rol que recibe el permiso pueda a su vez otorgarlo a otros usuarios.
 * 
 * **Comportamiento:**
 * - `false` o no especificado: Usuario puede usar el privilegio pero no otorgarlo
 * - `true`: Usuario puede usar Y otorgar el privilegio a otros (WITH GRANT OPTION)
 * 
 * **Cadena de otorgamiento:**
 * ```
 * -- Admin otorga SELECT a Manager con GRANT OPTION
 * GRANT SELECT ON productos TO manager WITH GRANT OPTION;
 * 
 * -- Manager puede otorgar SELECT a Employee
 * GRANT SELECT ON productos TO employee;
 * 
 * -- Employee NO puede otorgar a nadie (no tiene GRANT OPTION)
 * ```
 * 
 * **Riesgos de WITH GRANT OPTION:**
 * - Pérdida de control sobre quién tiene permisos
 * - Difícil auditar cadenas de otorgamiento
 * - Complicado revocar permisos en cascada
 * - Puede llevar a proliferación descontrolada de permisos
 * 
 * **Casos de uso legítimos:**
 * - Administradores de equipo que gestionan permisos de su grupo
 * - Roles de gestión que necesitan delegar permisos
 * - Entornos de desarrollo donde equipos auto-gestionan acceso
 * 
 * **Revocación:**
 * Cuando se revoca un permiso con GRANT OPTION, también se revocan
 * automáticamente todos los permisos otorgados por ese usuario (CASCADE).
 * 
 * Sintaxis generada:
 * ```sql
 * GRANT SELECT ON TABLE productos TO usuario WITH GRANT OPTION;
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅
 * - MySQL ✅
 * - SQL Server ✅ (sintaxis: WITH GRANT OPTION)
 * - Oracle ✅
 * 
 * @property {string} [grantBy] - Usuario que otorga el permiso (auditoría).
 * 
 * Especifica explícitamente quién está otorgando el permiso. Útil para auditoría
 * y cuando un usuario con privilegios otorga permisos en nombre de otro.
 * 
 * Valores permitidos:
 * - `'CURRENT_USER'`: Usuario actual de la sesión (por defecto)
 * - `'CURRENT_ROLE'`: Rol actual activo (si se usa SET ROLE)
 * - Nombre específico: Usuario específico (requiere privilegios)
 * 
 * **Comportamiento:**
 * - Sin especificar: Se registra el usuario actual como otorgante
 * - Con `CURRENT_USER`: Hace explícito el usuario actual
 * - Con `CURRENT_ROLE`: Registra el rol activo como otorgante
 * 
 * **Utilidad de GRANTED BY:**
 * - Auditoría detallada de quién otorga permisos
 * - Rastrear cadenas de delegación
 * - Cumplimiento normativo (quién autorizó cada permiso)
 * - Debugging de permisos complejos
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * GRANT SELECT ON TABLE productos TO usuario GRANTED BY CURRENT_USER;
 * GRANT SELECT ON TABLE productos TO usuario GRANTED BY CURRENT_ROLE;
 * ```
 * 
 * **Consultar quién otorgó permisos (PostgreSQL):**
 * ```sql
 * SELECT grantee, privilege_type, grantor
 * FROM information_schema.table_privileges
 * WHERE table_name = 'productos';
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅ (GRANTED BY)
 * - MySQL ❌ (no soporta GRANTED BY explícito)
 * - SQL Server ❌ (usa AS user para ejecutar como otro usuario)
 * - Oracle ❌ (rastreo implícito)
 * 
 * @example
 * // 1. Permiso simple SELECT en tabla
 * qb.grant('SELECT', 'usuarios', 'app_readonly');
 * // Genera: GRANT SELECT ON TABLE usuarios TO app_readonly
 * 
 * @example
 * // 2. Múltiples permisos a múltiples usuarios
 * qb.grant(['SELECT', 'INSERT', 'UPDATE'], 'productos', ['app_user', 'app_admin']);
 * // Genera: GRANT SELECT, INSERT, UPDATE ON TABLE productos TO app_user, app_admin
 * 
 * @example
 * // 3. Permiso con WITH GRANT OPTION
 * qb.grant('SELECT', 'clientes', 'manager', { withGrant: true });
 * // Genera: GRANT SELECT ON TABLE clientes TO manager WITH GRANT OPTION
 * // manager ahora puede otorgar SELECT a otros
 * 
 * @example
 * // 4. Permiso en vista específica
 * qb.grant('SELECT', { name: 'vista_ventas', objectType: 'VIEW' }, 'analista');
 * // Genera: GRANT SELECT ON VIEW vista_ventas TO analista
 * 
 * @example
 * // 5. Permiso en columnas específicas
 * qb.grant(['SELECT', 'UPDATE(email, telefono)'], 'usuarios', 'soporte');
 * // Genera: GRANT SELECT, UPDATE(email, telefono) ON TABLE usuarios TO soporte
 * // soporte solo puede modificar email y telefono
 * 
 * @example
 * // 6. Todos los permisos a un admin
 * qb.grant('ALL PRIVILEGES', 'productos', 'admin', { withGrant: true });
 * // Genera: GRANT ALL PRIVILEGES ON TABLE productos TO admin WITH GRANT OPTION
 * 
 * @example
 * // 7. Permiso en secuencia
 * qb.grant('USAGE', { name: 'productos_id_seq', objectType: 'SEQUENCE' }, 'app_user');
 * // Genera: GRANT USAGE ON SEQUENCE productos_id_seq TO app_user
 * 
 * @example
 * // 8. Permiso en esquema
 * qb.grant('USAGE', { name: 'ventas', objectType: 'SCHEMA' }, 'equipo_ventas');
 * // Genera: GRANT USAGE ON SCHEMA ventas TO equipo_ventas
 * 
 * @example
 * // 9. Permiso con GRANTED BY
 * qb.grant('SELECT', 'facturas', 'contador', {
 *   grantBy: 'CURRENT_USER'
 * });
 * // Genera: GRANT SELECT ON TABLE facturas TO contador GRANTED BY CURRENT_USER
 * 
 * @example
 * // 10. Otorgar a PUBLIC (todos los usuarios)
 * qb.grant('SELECT', 'productos_publicos', 'PUBLIC');
 * // Genera: GRANT SELECT ON TABLE productos_publicos TO PUBLIC
 * // Cualquier usuario puede leer esta tabla
 * 
 * @example
 * // 11. Setup completo de permisos para aplicación
 * async function setupAppPermissions() {
 *   // Rol readonly: solo lectura
 *   await qb.grant('SELECT', 'productos', 'app_readonly').execute();
 *   await qb.grant('SELECT', 'categorias', 'app_readonly').execute();
 *   
 *   // Rol writer: lectura y escritura
 *   await qb.grant(['SELECT', 'INSERT', 'UPDATE'], 'productos', 'app_writer').execute();
 *   await qb.grant(['SELECT', 'INSERT', 'UPDATE'], 'pedidos', 'app_writer').execute();
 *   
 *   // Rol admin: todo con capacidad de otorgar
 *   await qb.grant('ALL PRIVILEGES', 'productos', 'app_admin', {
 *     withGrant: true
 *   }).execute();
 *   
 *   await qb.grant('ALL PRIVILEGES', 'pedidos', 'app_admin', {
 *     withGrant: true
 *   }).execute();
 *   
 *   // Secuencias para app_writer
 *   await qb.grant('USAGE', { 
 *     name: 'productos_id_seq', 
 *     objectType: 'SEQUENCE' 
 *   }, 'app_writer').execute();
 * }
 * 
 * @see {@link QueryBuilder#revoke} - Para revocar permisos otorgados
 * @see {@link QueryBuilder#grantRoles} - Para otorgar roles a usuarios
 * @see {@link types.objectTypes} - Para tipos de objetos válidos
 */

/**
 * Especifica los destinatarios de permisos o roles en comandos GRANT.
 * 
 * Define a quién se otorgan los privilegios o roles. Puede ser usuarios individuales,
 * múltiples usuarios, roles, o palabras clave especiales.
 * 
 * @global
 * @typedef {string|Array<string>} types.toOptions
 * 
 * **Formatos permitidos:**
 * 
 * **1. Usuario individual (string)**:
 * - Formato: `'nombre_usuario'`
 * - Ejemplo: `'app_user'`, `'juan_perez'`, `'admin'`
 * - Otorga permiso a un solo usuario o rol
 * 
 * **2. Múltiples usuarios (array)**:
 * - Formato: `['usuario1', 'usuario2', 'usuario3']`
 * - Ejemplo: `['app_user', 'app_admin', 'backup_user']`
 * - Otorga el mismo permiso a todos los usuarios listados
 * - Más eficiente que múltiples comandos GRANT
 * 
 * **3. Palabras clave especiales (string)**:
 * 
 * **'PUBLIC'**:
 * - Otorga permiso a TODOS los usuarios de la base de datos
 * - Incluye usuarios actuales y futuros
 * - ⚠️ Usar con extrema precaución
 * - Útil para tablas de consulta pública (catálogos, configuración)
 * 
 * **'ALL'** (algunos SGBDs):
 * - Sinónimo de PUBLIC en algunos contextos
 * - Verificar documentación del SGBD específico
 * 
 * **Formato MySQL con host:**
 * En MySQL, usuarios incluyen host: `'usuario'@'host'`
 * - `'app_user@localhost'`: Solo conexiones locales
 * - `'app_user@%'`: Desde cualquier host
 * - `'app_user@192.168.1.%'`: Desde subnet específica
 * 
 * **Consideraciones de seguridad:**
 * 
 * ✅ **Buenas prácticas:**
 * - Otorgar a roles, no directamente a usuarios
 * - Usar principio de mínimo privilegio
 * - Documentar por qué se otorga cada permiso
 * - Revisar periódicamente permisos otorgados
 * - Revocar permisos cuando ya no son necesarios
 * 
 * ⚠️ **Evitar:**
 * - GRANT a PUBLIC en tablas sensibles
 * - Otorgar ALL PRIVILEGES sin necesidad
 * - Acumular permisos sin revisión
 * - Olvidar revocar permisos de usuarios inactivos
 * 
 * **Verificar permisos otorgados:**
 * 
 * PostgreSQL:
 * ```sql
 * -- Ver permisos de tabla
 * SELECT grantee, privilege_type
 * FROM information_schema.table_privileges
 * WHERE table_name = 'nombre_tabla';
 * 
 * -- Ver permisos de un usuario
 * SELECT * FROM information_schema.table_privileges
 * WHERE grantee = 'nombre_usuario';
 * ```
 * 
 * MySQL:
 * ```sql
 * -- Ver permisos de usuario
 * SHOW GRANTS FOR 'usuario'@'host';
 * 
 * -- Ver todos los usuarios y permisos
 * SELECT user, host, Select_priv, Insert_priv, Update_priv
 * FROM mysql.user;
 * ```
 * 
 * @example
 * // 1. Otorgar a un solo usuario
 * qb.grant('SELECT', 'productos', 'app_user');
 * // Genera: GRANT SELECT ON TABLE productos TO app_user
 * 
 * @example
 * // 2. Otorgar a múltiples usuarios
 * qb.grant('SELECT', 'productos', ['usuario1', 'usuario2', 'usuario3']);
 * // Genera: GRANT SELECT ON TABLE productos TO usuario1, usuario2, usuario3
 * 
 * @example
 * // 3. Otorgar a PUBLIC (todos los usuarios)
 * qb.grant('SELECT', 'catalogo_publico', 'PUBLIC');
 * // Genera: GRANT SELECT ON TABLE catalogo_publico TO PUBLIC
 * // ⚠️ PELIGRO: Cualquiera puede leer esta tabla
 * 
 * @example
 * // 4. Patrón recomendado: Otorgar a roles, no usuarios directos
 * // Paso 1: Crear roles
 * await qb.createRoles('app_readonly').execute();
 * await qb.createRoles('app_writer').execute();
 * 
 * // Paso 2: Otorgar permisos a roles
 * await qb.grant('SELECT', 'productos', 'app_readonly').execute();
 * await qb.grant(['SELECT', 'INSERT', 'UPDATE'], 'productos', 'app_writer').execute();
 * 
 * // Paso 3: Asignar roles a usuarios
 * await qb.grantRoles('app_readonly', 'usuario_consulta').execute();
 * await qb.grantRoles('app_writer', 'usuario_aplicacion').execute();
 * 
 * @example
 * // 5. MySQL: Usuario con host específico
 * qb.grant('SELECT', 'productos', 'app_user@localhost');
 * // Genera: GRANT SELECT ON TABLE productos TO 'app_user'@'localhost'
 * 
 * @see {@link types.grantOptions} - Para opciones completas de GRANT
 * @see {@link QueryBuilder#grantRoles} - Para otorgar roles a usuarios
 */

/**
 * Especifica de quién se revocan permisos o roles en comandos REVOKE.
 * 
 * Define a quién se le quitan los privilegios o roles previamente otorgados.
 * Es el inverso de `toOptions` en GRANT.
 * 
 * @global
 * @typedef {string|Array<string>} types.fromOptions
 * 
 * **Formatos permitidos:**
 * 
 * **1. Usuario individual (string)**:
 * - Formato: `'nombre_usuario'`
 * - Ejemplo: `'app_user'`, `'empleado_retirado'`, `'temporal'`
 * - Revoca permiso de un solo usuario o rol
 * 
 * **2. Múltiples usuarios (array)**:
 * - Formato: `['usuario1', 'usuario2', 'usuario3']`
 * - Ejemplo: `['app_user', 'temp_user', 'old_admin']`
 * - Revoca el mismo permiso de todos los usuarios listados
 * - Más eficiente que múltiples comandos REVOKE
 * 
 * **3. Palabras clave especiales (string)**:
 * 
 * **'PUBLIC'**:
 * - Revoca permiso de TODOS los usuarios de la base de datos
 * - Útil cuando se otorgó previamente a PUBLIC
 * - No afecta permisos otorgados individualmente
 * - Sintaxis: `REVOKE ... FROM PUBLIC`
 * 
 * **'ALL'** (algunos SGBDs):
 * - Sinónimo de PUBLIC en algunos contextos
 * - Comportamiento varía por SGBD
 * 
 * **Diferencia importante: FROM vs TO:**
 * ```
 * GRANT SELECT ... TO usuario;      -- Otorgar A usuario
 * REVOKE SELECT ... FROM usuario;   -- Revocar DE usuario
 * ```
 * 
 * **Formato MySQL con host:**
 * En MySQL, usuarios incluyen host: `'usuario'@'host'`
 * - `'app_user@localhost'`: Solo usuario en conexiones locales
 * - `'app_user@%'`: Usuario desde cualquier host
 * - `'app_user@192.168.1.%'`: Usuario desde subnet específica
 * 
 * **Consideraciones importantes:**
 * 
 * **CASCADE automático:**
 * Cuando se revoca un permiso otorgado con GRANT OPTION, también se revocan
 * automáticamente todos los permisos que ese usuario otorgó a otros (CASCADE).
 * 
 * **Verificar antes de revocar:**
 * ```sql
 * -- PostgreSQL: Ver quién tiene permisos
 * SELECT grantee, privilege_type, is_grantable
 * FROM information_schema.table_privileges
 * WHERE table_name = 'nombre_tabla';
 * 
 * -- Ver cadenas de GRANT OPTION
 * SELECT grantee, privilege_type, grantor
 * FROM information_schema.table_privileges
 * WHERE is_grantable = 'YES';
 * ```
 * 
 * **REVOKE de PUBLIC:**
 * Revocar de PUBLIC no afecta permisos otorgados explícitamente:
 * ```sql
 * GRANT SELECT ON productos TO PUBLIC;    -- Todos pueden leer
 * GRANT SELECT ON productos TO app_user;  -- app_user específico
 * 
 * REVOKE SELECT ON productos FROM PUBLIC; -- PUBLIC pierde acceso
 * -- app_user TODAVÍA PUEDE leer (permiso individual no afectado)
 * ```
 * 
 * **Orden de revocación recomendado:**
 * 1. Revocar de PUBLIC primero (si aplica)
 * 2. Revocar de roles
 * 3. Revocar de usuarios individuales
 * 4. Verificar que no queden permisos residuales
 * 
 * @example
 * // 1. Revocar de un solo usuario
 * qb.revoke('SELECT', 'productos', 'empleado_retirado');
 * // Genera: REVOKE SELECT ON TABLE productos FROM empleado_retirado
 * 
 * @example
 * // 2. Revocar de múltiples usuarios
 * qb.revoke('SELECT', 'productos', ['usuario1', 'usuario2', 'usuario3']);
 * // Genera: REVOKE SELECT ON TABLE productos FROM usuario1, usuario2, usuario3
 * 
 * @example
 * // 3. Revocar de PUBLIC (todos los usuarios)
 * qb.revoke('SELECT', 'datos_sensibles', 'PUBLIC');
 * // Genera: REVOKE SELECT ON TABLE datos_sensibles FROM PUBLIC
 * 
 * @example
 * // 4. Procedimiento de revocación completo
 * async function revocarAcceso(tabla, usuario) {
 *   // 1. Verificar permisos actuales
 *   const permisos = await qb.raw(`
 *     SELECT privilege_type, is_grantable
 *     FROM information_schema.table_privileges
 *     WHERE table_name = $1 AND grantee = $2
 *   `, [tabla, usuario]).execute();
 *   
 *   console.log(`Permisos actuales de ${usuario}:`, permisos);
 *   
 *   // 2. Si tiene GRANT OPTION, advertir sobre CASCADE
 *   const tieneGrantOption = permisos.some(p => p.is_grantable === 'YES');
 *   if (tieneGrantOption) {
 *     console.warn('⚠️ Usuario tiene GRANT OPTION. Revocación afectará permisos en cascada.');
 *   }
 *   
 *   // 3. Revocar todos los permisos
 *   await qb.revoke('ALL PRIVILEGES', tabla, usuario, {
 *     cascade: true
 *   }).execute();
 *   
 *   console.log(`✅ Permisos revocados de ${usuario} en ${tabla}`);
 * }
 * 
 * @example
 * // 5. Revocar solo GRANT OPTION (mantener permiso)
 * qb.revoke('SELECT', 'productos', 'manager', {
 *   grantOption: true
 * });
 * // Genera: REVOKE GRANT OPTION FOR SELECT ON TABLE productos FROM manager
 * // manager puede seguir leyendo, pero no puede otorgar a otros
 * 
 * @see {@link types.revokeOptions} - Para opciones completas de REVOKE
 * @see {@link types.toOptions} - Inverso, para GRANT
 */

/**
 * Opciones de configuración para revocar permisos (REVOKE).
 * 
 * El comando REVOKE es esencial para mantener la seguridad eliminando permisos
 * que ya no son necesarios o cuando cambian roles y responsabilidades.
 * 
 * **PRINCIPIOS DE REVOCACIÓN:**
 * 
 * 1. **Principio de mínimo privilegio**: Revocar permisos cuando ya no son necesarios
 * 2. **Auditoría de cambios**: Documentar por qué se revoca cada permiso
 * 3. **Verificación post-revocación**: Confirmar que usuario/aplicación no se rompió
 * 4. **Revocación en cascada**: Entender impacto en permisos delegados
 * 5. **Cleanup periódico**: Revisar y revocar permisos obsoletos regularmente
 * 
 * **DIFERENCIAS CLAVE CON GRANT:**
 * - GRANT añade permisos, REVOKE los quita
 * - GRANT usa TO, REVOKE usa FROM
 * - REVOKE puede tener efectos CASCADE (permisos delegados)
 * - REVOKE puede revocar solo GRANT OPTION (mantener permiso base)
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ REVOKE definido en SQL-92 y posteriores
 * - **PostgreSQL**: ✅ Soporte completo + CASCADE/RESTRICT
 * - **MySQL**: ✅ Soporte completo
 * - **SQL Server**: ✅ Soporte completo + DENY (negación activa)
 * - **Oracle**: ✅ Soporte robusto + CASCADE CONSTRAINTS
 * - **SQLite**: ❌ NO soporta usuarios ni permisos
 * - **MongoDB**: ✅ revokeRolesFromUser
 * 
 * @global
 * @typedef {Object} types.revokeOptions
 * 
 * @property {boolean} [grantOption=false] - Revoca solo la capacidad de otorgar, no el permiso.
 * 
 * Cuando es `true`, añade GRANT OPTION FOR antes del privilegio, revocando solo
 * la capacidad de otorgar el permiso a otros, pero manteniendo el permiso base.
 * 
 * **Comportamiento:**
 * - `false` o no especificado: Revoca el permiso completamente
 * - `true`: Revoca solo GRANT OPTION (usuario mantiene el permiso)
 * 
 * **Caso de uso principal:**
 * Degradar privilegios de un usuario que ya no debe administrar permisos
 * pero todavía necesita usar la funcionalidad.
 * 
 * ```
 * -- Estado inicial:
 * GRANT SELECT ON productos TO manager WITH GRANT OPTION;
 * -- manager puede leer Y otorgar
 * 
 * -- Revocar solo GRANT OPTION:
 * REVOKE GRANT OPTION FOR SELECT ON productos FROM manager;
 * -- manager puede leer pero NO puede otorgar
 * 
 * -- Para revocarlo todo:
 * REVOKE SELECT ON productos FROM manager;
 * -- manager NO puede leer
 * ```
 * 
 * **Ejemplo escenario:**
 * ```javascript
 * // Manager es promovido a otro departamento
 * // Ya no administra equipo pero necesita acceso de lectura
 * 
 * // Revocar capacidad de administrar permisos
 * await qb.revoke('SELECT', 'ventas', 'manager', {
 *   grantOption: true
 * }).execute();
 * 
 * // manager mantiene SELECT pero no puede otorgarlo a nadie
 * ```
 * 
 * Sintaxis generada:
 * ```sql
 * REVOKE GRANT OPTION FOR SELECT ON TABLE productos FROM usuario;
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅
 * - MySQL ✅
 * - SQL Server ✅
 * - Oracle ✅
 * 
 * @property {boolean} [cascade=true] - Revoca permisos en cascada (permisos delegados).
 * 
 * Controla qué sucede con los permisos que el usuario revocado otorgó a otros.
 * 
 * Valores:
 * - `true` (por defecto): CASCADE - Revoca también permisos otorgados por el usuario
 * - `false`: RESTRICT - Falla si el usuario otorgó permisos a otros
 * 
 * **CASCADE (comportamiento por defecto):**
 * Revoca automáticamente todos los permisos que el usuario otorgó:
 * 
 * ```
 * Admin otorga a Manager con GRANT OPTION
 * Manager otorga a Employee
 * 
 * REVOKE ... FROM Manager CASCADE;
 * 
 * Resultado:
 * - Manager pierde permiso ✓
 * - Employee pierde permiso ✓ (revocado en cascada)
 * ```
 * 
 * **RESTRICT (protección):**
 * Falla la operación si hay permisos delegados:
 * 
 * ```
 * REVOKE ... FROM Manager RESTRICT;
 * 
 * Si Manager otorgó permisos:
 * - ERROR: Cannot revoke, user has granted permissions
 * 
 * Si Manager NO otorgó permisos:
 * - Revocación exitosa
 * ```
 * 
 * **Recomendaciones:**
 * 
 * - **Development/Testing**: CASCADE (limpieza rápida)
 * - **Staging**: Verificar impacto, luego CASCADE
 * - **Producción**: 
 *   1. Usar RESTRICT primero
 *   2. Si falla, auditar dependencias
 *   3. Decidir manualmente si usar CASCADE
 *   4. Documentar cadena de revocación
 * 
 * **Verificar impacto antes de CASCADE:**
 * ```sql
 * -- PostgreSQL: Ver permisos otorgados por usuario
 * SELECT grantee, privilege_type, table_name
 * FROM information_schema.table_privileges
 * WHERE grantor = 'usuario_a_revocar';
 * ```
 * 
 * Sintaxis generada:
 * ```sql
 * REVOKE SELECT ON TABLE productos FROM usuario CASCADE;
 * REVOKE SELECT ON TABLE productos FROM usuario RESTRICT;
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅
 * - MySQL ⚠️ (no soporta CASCADE/RESTRICT explícito, comportamiento CASCADE por defecto)
 * - SQL Server ⚠️ (CASCADE implícito)
 * - Oracle ✅
 * 
 * @property {boolean} [restrict=false] - Falla si hay permisos delegados (protección).
 * 
 * Alternativa explícita a `cascade: false`. Hace fallar la operación si el
 * usuario revocado otorgó permisos a otros.
 * 
 * Valores:
 * - `false` o no especificado: Comportamiento según `cascade`
 * - `true`: RESTRICT explícito (falla si hay dependencias)
 * 
 * **Cuándo usar RESTRICT:**
 * - Producción: Prevenir revocaciones accidentales en cascada
 * - Auditoría: Forzar verificación manual de impacto
 * - Seguridad: Evitar romper acceso de múltiples usuarios
 * - Compliance: Requerir aprobación para revocaciones complejas
 * 
 * **Flujo recomendado con RESTRICT:**
 * ```javascript
 * async function revocarConVerificacion(tabla, usuario) {
 *   try {
 *     // Intentar con RESTRICT primero
 *     await qb.revoke('SELECT', tabla, usuario, {
 *       restrict: true
 *     }).execute();
 *     
 *     console.log('✅ Revocación exitosa, sin dependencias');
 *     
 *   } catch (error) {
 *     if (error.message.includes('dependent')) {
 *       // Verificar dependencias
 *       const deps = await verificarDependencias(tabla, usuario);
 *       console.log('⚠️ Dependencias encontradas:', deps);
 *       
 *       // Requiere decisión manual
 *       const confirmar = await confirmarRevocacionCascada();
 *       
 *       if (confirmar) {
 *         await qb.revoke('SELECT', tabla, usuario, {
 *           cascade: true
 *         }).execute();
 *         console.log('✅ Revocación en cascada completada');
 *       }
 *     } else {
 *       throw error;
 *     }
 *   }
 * }
 * ```
 * 
 * Sintaxis generada:
 * ```sql
 * REVOKE SELECT ON TABLE productos FROM usuario RESTRICT;
 * ```
 * 
 * @property {string} [grantBy] - Usuario que originalmente otorgó el permiso (auditoría).
 * 
 * En algunos SGBDs, solo el usuario que otorgó un permiso puede revocarlo.
 * Esta opción especifica quién otorgó el permiso originalmente.
 * 
 * Valores:
 * - `'CURRENT_USER'`: Usuario actual (por defecto)
 * - `'CURRENT_ROLE'`: Rol actual activo
 * - Nombre específico: Usuario específico que otorgó
 * 
 * **Restricciones comunes:**
 * - Solo el otorgante original puede revocar (algunos SGBDs)
 * - Superusuarios pueden revocar cualquier permiso
 * - En PostgreSQL, propietario del objeto puede revocar
 * 
 * **Error común:**
 * ```
 * -- Admin otorga permiso
 * GRANT SELECT ON productos TO app_user;
 * 
 * -- Manager intenta revocar
 * REVOKE SELECT ON productos FROM app_user;
 * -- ERROR: Only grantor can revoke
 * 
 * -- Solución: Admin debe revocar, o usar CASCADE desde nivel superior
 * ```
 * 
 * Sintaxis generada (PostgreSQL):
 * ```sql
 * REVOKE SELECT ON TABLE productos FROM usuario GRANTED BY CURRENT_USER;
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅ (GRANTED BY)
 * - MySQL ❌
 * - SQL Server ❌
 * - Oracle ❌
 * 
 * @example
 * // 1. Revocación simple
 * qb.revoke('SELECT', 'productos', 'usuario_temporal');
 * // Genera: REVOKE SELECT ON TABLE productos FROM usuario_temporal CASCADE
 * 
 * @example
 * // 2. Revocar múltiples permisos
 * qb.revoke(['SELECT', 'INSERT', 'UPDATE'], 'productos', 'empleado_retirado');
 * // Genera: REVOKE SELECT, INSERT, UPDATE ON TABLE productos 
 * //         FROM empleado_retirado CASCADE
 * 
 * @example
 * // 3. Revocar solo GRANT OPTION (mantener permiso)
 * qb.revoke('SELECT', 'ventas', 'ex_manager', {
 *   grantOption: true
 * });
 * // Genera: REVOKE GRANT OPTION FOR SELECT ON TABLE ventas FROM ex_manager
 * // ex_manager puede seguir leyendo, pero no puede otorgar a otros
 * 
 * @example
 * // 4. Revocación con RESTRICT (segura)
 * qb.revoke('SELECT', 'clientes', 'admin', {
 *   restrict: true
 * });
 * // Genera: REVOKE SELECT ON TABLE clientes FROM admin RESTRICT
 * // Falla si admin otorgó permisos a otros
 * 
 * @example
 * // 5. Revocación con CASCADE explícito
 * qb.revoke('ALL PRIVILEGES', 'productos', 'manager', {
 *   cascade: true
 * });
 * // Genera: REVOKE ALL PRIVILEGES ON TABLE productos FROM manager CASCADE
 * // Revoca también permisos que manager otorgó a otros
 * 
 * @example
 * // 6. Revocar de múltiples usuarios
 * qb.revoke('SELECT', 'datos_sensibles', ['usuario1', 'usuario2', 'usuario3'], {
 *   cascade: true
 * });
 * // Genera: REVOKE SELECT ON TABLE datos_sensibles 
 * //         FROM usuario1, usuario2, usuario3 CASCADE
 * 
 * @example
 * // 7. Revocar de PUBLIC
 * qb.revoke('SELECT', 'tabla_publica', 'PUBLIC');
 * // Genera: REVOKE SELECT ON TABLE tabla_publica FROM PUBLIC CASCADE
 * 
 * @example
 * // 8. Revocar en vista
 * qb.revoke('SELECT', { name: 'vista_ventas', objectType: 'VIEW' }, 'analista');
 * // Genera: REVOKE SELECT ON VIEW vista_ventas FROM analista CASCADE
 * 
 * @example
 * // 9. Procedimiento completo de revocación segura
 * async function revocarPermisosSeguro(tabla, usuario) {
 *   try {
 *     console.log(`Iniciando revocación de permisos para ${usuario}...`);
 *     
 *     // 1. Verificar permisos actuales
 *     const permisos = await qb.raw(`
 *       SELECT privilege_type, is_grantable, grantor
 *       FROM information_schema.table_privileges
 *       WHERE table_name = $1 AND grantee = $2
 *     `, [tabla, usuario]).execute();
 *     
 *     if (permisos.length === 0) {
 *       console.log('✅ Usuario no tiene permisos en esta tabla');
 *       return;
 *     }
 *     
 *     console.log('Permisos a revocar:', permisos);
 *     
 *     // 2. Verificar si tiene GRANT OPTION
 *     const tieneGrantOption = permisos.some(p => p.is_grantable === 'YES');
 *     
 *     if (tieneGrantOption) {
 *       console.log('⚠️ Usuario tiene GRANT OPTION');
 *       
 *       // 3. Verificar dependencias
 *       const delegados = await qb.raw(`
 *         SELECT grantee, privilege_type
 *         FROM information_schema.table_privileges
 *         WHERE table_name = $1 AND grantor = $2
 *       `, [tabla, usuario]).execute();
 *       
 *       if (delegados.length > 0) {
 *         console.log('⚠️ Usuario otorgó permisos a:', delegados);
 *         console.log('Revocación usará CASCADE automáticamente');
 *       }
 *     }
 *     
 *     // 4. Revocar todos los permisos
 *     await qb.revoke('ALL PRIVILEGES', tabla, usuario, {
 *       cascade: true
 *     }).execute();
 *     
 *     console.log(`✅ Permisos revocados exitosamente de ${usuario}`);
 *     
 *     // 5. Verificar que se revocaron
 *     const permisosRestantes = await qb.raw(`
 *       SELECT privilege_type
 *       FROM information_schema.table_privileges
 *       WHERE table_name = $1 AND grantee = $2
 *     `, [tabla, usuario]).execute();
 *     
 *     if (permisosRestantes.length > 0) {
 *       console.warn('⚠️ Permisos residuales detectados:', permisosRestantes);
 *     } else {
 *       console.log('✅ Verificación: No quedan permisos');
 *     }
 *     
 *   } catch (error) {
 *     console.error('❌ Error al revocar permisos:', error);
 *     throw error;
 *   }
 * }
 * 
 * @example
 * // 10. Cleanup periódico de permisos
 * async function cleanupPermisosObsoletos() {
 *   // 1. Encontrar usuarios inactivos
 *   const usuariosInactivos = await qb.raw(`
 *     SELECT DISTINCT grantee
 *     FROM information_schema.table_privileges
 *     WHERE grantee NOT IN (
 *       SELECT usename FROM pg_user WHERE valuntil > NOW()
 *     )
 *   `).execute();
 *   
 *   console.log(`Encontrados ${usuariosInactivos.length} usuarios inactivos con permisos`);
 *   
 *   // 2. Revocar de cada usuario inactivo
 *   for (const user of usuariosInactivos) {
 *     // Obtener tablas donde tiene permisos
 *     const tablas = await qb.raw(`
 *       SELECT DISTINCT table_name
 *       FROM information_schema.table_privileges
 *       WHERE grantee = $1
 *     `, [user.grantee]).execute();
 *     
 *     // Revocar de cada tabla
 *     for (const tabla of tablas) {
 *       try {
 *         await qb.revoke('ALL PRIVILEGES', tabla.table_name, user.grantee, {
 *           cascade: true
 *         }).execute();
 *         
 *         console.log(`✅ Revocado de ${user.grantee} en ${tabla.table_name}`);
 *       } catch (error) {
 *         console.error(`❌ Error revocando de ${user.grantee}:`, error);
 *       }
 *     }
 *   }
 *   
 *   console.log('✅ Cleanup completado');
 * }
 * 
 * @example
 * // 11. Downgrade de permisos (reducir sin eliminar)
 * async function downgradePermisos(tabla, usuario) {
 *   // 1. Revocar permisos de escritura
 *   await qb.revoke(['INSERT', 'UPDATE', 'DELETE'], tabla, usuario).execute();
 *   
 *   // 2. Mantener SELECT
 *   // (SELECT no se revoca, usuario queda como readonly)
 *   
 *   console.log(`✅ Usuario ${usuario} ahora es readonly en ${tabla}`);
 * }
 * 
 * @see {@link types.grantOptions} - Para opciones de GRANT (inverso)
 * @see {@link QueryBuilder#grant} - Para otorgar permisos
 * @see {@link types.fromOptions} - Para especificar de quién revocar
 */

/**
 * Opciones de configuración para asignar roles a usuarios (GRANT ROLES).
 * 
 * El comando GRANT ROLES permite asignar roles existentes a usuarios o a otros roles,
 * estableciendo jerarquías de permisos y facilitando la administración centralizada
 * de privilegios.
 * 
 * **DIFERENCIAS CLAVE: GRANT ROLES vs GRANT permisos:**
 * 
 * ```sql
 * -- GRANT permisos: Asigna privilegios específicos sobre objetos
 * GRANT SELECT, INSERT ON productos TO usuario;
 * 
 * -- GRANT ROLES: Asigna conjuntos predefinidos de permisos
 * GRANT rol_vendedor TO usuario;
 * ```
 * 
 * **VENTAJAS DE USAR ROLES:**
 * 
 * 1. **Centralización**: Cambiar permisos del rol afecta a todos los usuarios del rol
 * 2. **Simplicidad**: Un comando en vez de múltiples GRANT individuales
 * 3. **Mantenibilidad**: Modificar rol en un lugar, afecta a todos los usuarios
 * 4. **Auditoría**: Más fácil rastrear qué permisos tiene un usuario
 * 5. **Reutilización**: Roles estándar para tipos de usuarios comunes
 * 6. **Jerarquías**: Roles pueden contener otros roles (herencia)
 * 
 * **MODELO DE ROLES:**
 * 
 * ```
 * SUPER_ADMIN
 *     ↓ (contiene)
 * ADMINISTRADOR
 *     ↓ (contiene)
 * MANAGER
 *     ↓ (contiene)
 * EMPLEADO
 *     ↓ (contiene)
 * READONLY
 * ```
 * 
 * **COMPATIBILIDAD:**
 * - **PostgreSQL**: ✅ Roles son también usuarios (no hay distinción)
 * - **MySQL**: ✅ Roles introducidos en MySQL 8.0+
 * - **SQL Server**: ✅ Roles de base de datos y servidor
 * - **Oracle**: ✅ Sistema robusto de roles
 * - **SQLite**: ❌ NO soporta roles ni usuarios
 * - **MongoDB**: ✅ db.grantRolesToUser()
 * 
 * @global
 * @typedef {Object} types.grantRolesOptions
 * 
 * @property {boolean} [admin=false] - Permite al receptor otorgar el rol a otros.
 * 
 * Equivalente a WITH GRANT OPTION pero para roles. Cuando es `true`, el usuario
 * o rol receptor puede:
 * - Usar todos los permisos del rol
 * - Asignar el rol a otros usuarios/roles
 * - Revocar el rol de otros usuarios/roles (si él lo otorgó)
 * 
 * **Comportamiento:**
 * - `false` o no especificado: Usuario obtiene permisos del rol, no puede delegarlo
 * - `true`: Usuario obtiene permisos Y capacidad administrativa
 * 
 * **Sintaxis generada:**
 * ```sql
 * GRANT rol_nombre TO usuario;                      -- Sin admin
 * GRANT rol_nombre TO usuario WITH ADMIN OPTION;    -- Con admin
 * ```
 * 
 * **Caso de uso principal:**
 * Designar "administradores de roles" que pueden gestionar membresías
 * sin ser superusuarios completos.
 * 
 * **Ejemplo escenario:**
 * ```javascript
 * // Crear jerarquía de roles
 * await qb.createRoles('ROL_VENTAS').execute();
 * 
 * // Manager puede administrar el rol (asignar a su equipo)
 * await qb.grantRoles('ROL_VENTAS', 'manager_ventas', {
 *   admin: true
 * }).execute();
 * 
 * // Vendedor solo obtiene permisos, no puede asignar
 * await qb.grantRoles('ROL_VENTAS', 'vendedor_1').execute();
 * 
 * // Ahora manager_ventas puede hacer:
 * await qb.grantRoles('ROL_VENTAS', 'vendedor_2').execute();
 * // ✅ Funciona porque manager_ventas tiene ADMIN OPTION
 * 
 * // Pero vendedor_1 NO puede hacer:
 * await qb.grantRoles('ROL_VENTAS', 'vendedor_3').execute();
 * // ❌ ERROR: Permission denied, vendedor_1 no tiene ADMIN OPTION
 * ```
 * 
 * **Implicaciones de seguridad:**
 * 
 * ⚠️ **WITH ADMIN OPTION es potente:**
 * - Usuario puede otorgar el rol a CUALQUIER usuario (incluso a sí mismo si lo pierde)
 * - Usuario puede revocar el rol de otros usuarios
 * - En algunos SGBDs, puede incluso modificar el rol
 * 
 * **Mejores prácticas:**
 * - Otorgar ADMIN OPTION solo a usuarios de confianza
 * - Documentar quién tiene ADMIN OPTION sobre qué roles
 * - Auditar periódicamente cambios en membresías de roles
 * - Considerar roles intermedios de "gestión" en vez de ADMIN OPTION directo
 * 
 * **Verificar ADMIN OPTION:**
 * ```sql
 * -- PostgreSQL
 * SELECT rolname, admin_option
 * FROM pg_auth_members m
 * JOIN pg_roles r ON m.member = r.oid
 * WHERE admin_option = true;
 * 
 * -- MySQL
 * SELECT * FROM mysql.role_edges
 * WHERE WITH_ADMIN_OPTION = 'Y';
 * ```
 * 
 * Compatibilidad:
 * - PostgreSQL ✅ (WITH ADMIN OPTION)
 * - MySQL ✅ (WITH ADMIN OPTION en MySQL 8.0+)
 * - SQL Server ✅ (roles de servidor y base de datos)
 * - Oracle ✅ (WITH ADMIN OPTION)
 * 
 * @property {string} [granted] - Usuario que realiza el otorgamiento (auditoría).
 * 
 * Especifica explícitamente quién está otorgando el rol. Útil para:
 * - Auditoría de cambios de permisos
 * - Compliance y regulaciones
 * - Rastrear cadenas de otorgamiento
 * - Debugging de permisos complejos
 * 
 * Valores:
 * - `'CURRENT_USER'`: Usuario actual ejecutando el comando
 * - `'CURRENT_ROLE'`: Rol activo actual (PostgreSQL)
 * - Nombre específico: Usuario/rol específico que otorga
 * 
 * **Sintaxis generada (PostgreSQL):**
 * ```sql
 * GRANT rol_nombre TO usuario GRANTED BY CURRENT_USER;
 * GRANT rol_nombre TO usuario GRANTED BY admin_user;
 * ```
 * 
 * **Caso de uso:**
 * ```javascript
 * // Aplicación hace cambios en nombre de admin
 * await qb.grantRoles('ROL_EDITOR', 'nuevo_empleado', {
 *   granted: 'admin_user'
 * }).execute();
 * 
 * // Queda registrado que admin_user otorgó el rol
 * // Útil para auditoría y compliance
 * ```
 * 
 * **Restricciones comunes:**
 * - Solo usuarios con permiso sobre el rol pueden usar GRANTED BY
 * - En algunos SGBDs, solo superusuarios pueden especificar GRANTED BY
 * - El usuario especificado debe tener privilegios sobre el rol
 * 
 * Compatibilidad:
 * - PostgreSQL ✅ (GRANTED BY en versiones recientes)
 * - MySQL ❌
 * - SQL Server ❌
 * - Oracle ❌
 * 
 * @property {string} [host] - Host específico para usuarios MySQL.
 * 
 * En MySQL, los usuarios incluyen un componente de host que especifica
 * desde dónde pueden conectarse. Esta opción permite especificar el host
 * al otorgar roles a usuarios MySQL.
 * 
 * Valores comunes:
 * - `'localhost'`: Solo conexiones locales
 * - `'%'`: Cualquier host (wildcard)
 * - `'192.168.1.%'`: Subnet específica
 * - `'example.com'`: Host específico
 * - `'10.0.0.1'`: IP específica
 * 
 * **Formato usuario MySQL:**
 * ```
 * 'usuario'@'host'
 * ```
 * 
 * **Sintaxis generada (MySQL):**
 * ```sql
 * GRANT rol_nombre TO 'usuario'@'localhost';
 * GRANT rol_nombre TO 'usuario'@'%';
 * GRANT rol_nombre TO 'usuario'@'192.168.1.%';
 * ```
 * 
 * **Ejemplo:**
 * ```javascript
 * // Usuario solo desde localhost
 * await qb.grantRoles('app_role', 'app_user', {
 *   host: 'localhost'
 * }).execute();
 * // Genera: GRANT app_role TO 'app_user'@'localhost';
 * 
 * // Usuario desde cualquier host
 * await qb.grantRoles('app_role', 'remote_user', {
 *   host: '%'
 * }).execute();
 * // Genera: GRANT app_role TO 'remote_user'@'%';
 * 
 * // Usuario desde subnet específica
 * await qb.grantRoles('app_role', 'office_user', {
 *   host: '192.168.1.%'
 * }).execute();
 * // Genera: GRANT app_role TO 'office_user'@'192.168.1.%';
 * ```
 * 
 * **Consideraciones de seguridad:**
 * 
 * ⚠️ **Evitar '%' en producción:**
 * - Permite conexiones desde cualquier IP
 * - Aumenta superficie de ataque
 * - Preferir IPs o subnets específicas
 * 
 * **Mejores prácticas:**
 * - Desarrollo: `localhost` o `127.0.0.1`
 * - Staging: Subnet de la oficina
 * - Producción: IPs específicas de servidores de aplicación
 * - Nunca usar '%' en producción sin firewall robusto
 * 
 * **Mismo usuario, diferentes hosts:**
 * En MySQL, 'user'@'localhost' y 'user'@'%' son usuarios DIFERENTES:
 * ```javascript
 * // Dos usuarios distintos en MySQL
 * await qb.grantRoles('app_role', 'user', { host: 'localhost' }).execute();
 * await qb.grantRoles('app_role', 'user', { host: '%' }).execute();
 * ```
 * 
 * Compatibilidad:
 * - MySQL ✅ (obligatorio en muchos casos)
 * - PostgreSQL ❌ (usa pg_hba.conf para control de acceso por host)
 * - SQL Server ❌
 * - Oracle ❌
 * 
 * @example
 * // 1. Asignar rol simple a un usuario
 * qb.grantRoles('VENDEDOR', 'juan_perez');
 * // Genera: GRANT VENDEDOR TO juan_perez;
 * 
 * @example
 * // 2. Asignar múltiples roles a un usuario
 * qb.grantRoles(['VENDEDOR', 'SOPORTE'], 'maria_garcia');
 * // Genera: GRANT VENDEDOR, SOPORTE TO maria_garcia;
 * 
 * @example
 * // 3. Asignar rol a múltiples usuarios
 * qb.grantRoles('READONLY', ['consultor1', 'consultor2', 'consultor3']);
 * // Genera: GRANT READONLY TO consultor1, consultor2, consultor3;
 * 
 * @example
 * // 4. Asignar rol con capacidad administrativa
 * qb.grantRoles('MANAGER', 'jefe_ventas', {
 *   admin: true
 * });
 * // Genera: GRANT MANAGER TO jefe_ventas WITH ADMIN OPTION;
 * // jefe_ventas puede ahora asignar MANAGER a su equipo
 * 
 * @example
 * // 5. Asignar múltiples roles a múltiples usuarios con admin
 * qb.grantRoles(
 *   ['ADMINISTRADORES', 'CONTABILIDAD'], 
 *   ['LindaN', 'MARKETING'],
 *   { admin: true }
 * );
 * // Genera: GRANT ADMINISTRADORES, CONTABILIDAD TO LindaN, MARKETING WITH ADMIN OPTION;
 * 
 * @example
 * // 6. Asignar rol con host específico (MySQL)
 * qb.grantRoles('APP_ROLE', 'app_user', {
 *   host: 'localhost'
 * });
 * // Genera (MySQL): GRANT APP_ROLE TO 'app_user'@'localhost';
 * 
 * @example
 * // 7. Crear jerarquía de roles
 * async function setupRoleHierarchy() {
 *   // 1. Crear roles base
 *   await qb.createRoles('ROL_READONLY').execute();
 *   await qb.createRoles('ROL_EDITOR').execute();
 *   await qb.createRoles('ROL_ADMIN').execute();
 *   
 *   // 2. Asignar permisos a cada rol
 *   await qb.grant('SELECT', 'productos', { to: 'ROL_READONLY' }).execute();
 *   await qb.grant(['SELECT', 'INSERT', 'UPDATE'], 'productos', { 
 *     to: 'ROL_EDITOR' 
 *   }).execute();
 *   await qb.grant('ALL PRIVILEGES', 'productos', { 
 *     to: 'ROL_ADMIN' 
 *   }).execute();
 *   
 *   // 3. Crear jerarquía (roles contienen otros roles)
 *   await qb.grantRoles('ROL_READONLY', 'ROL_EDITOR').execute();
 *   await qb.grantRoles('ROL_EDITOR', 'ROL_ADMIN').execute();
 *   
 *   // Ahora:
 *   // - ROL_ADMIN tiene permisos de EDITOR y READONLY
 *   // - ROL_EDITOR tiene permisos de READONLY
 *   // - ROL_READONLY tiene solo SELECT
 * }
 * 
 * @example
 * // 8. Gestión de roles por departamento
 * async function setupDepartmentRoles() {
 *   // Roles de departamento
 *   const roles = {
 *     ventas: 'ROL_VENTAS',
 *     marketing: 'ROL_MARKETING',
 *     contabilidad: 'ROL_CONTABILIDAD',
 *     rrhh: 'ROL_RRHH'
 *   };
 *   
 *   // Crear todos los roles
 *   for (const rol of Object.values(roles)) {
 *     await qb.createRoles(rol).execute();
 *   }
 *   
 *   // Jefes de departamento con ADMIN OPTION
 *   await qb.grantRoles(roles.ventas, 'jefe_ventas', {
 *     admin: true
 *   }).execute();
 *   
 *   await qb.grantRoles(roles.marketing, 'jefe_marketing', {
 *     admin: true
 *   }).execute();
 *   
 *   // Empleados sin ADMIN OPTION
 *   await qb.grantRoles(roles.ventas, [
 *     'vendedor1', 'vendedor2', 'vendedor3'
 *   ]).execute();
 *   
 *   await qb.grantRoles(roles.marketing, [
 *     'marketer1', 'marketer2'
 *   ]).execute();
 *   
 *   console.log('✅ Estructura de roles por departamento creada');
 * }
 * 
 * @example
 * // 9. Sistema de roles temporales
 * async function grantTemporaryRole(usuario, rol, duracion_dias) {
 *   // 1. Otorgar rol
 *   await qb.grantRoles(rol, usuario).execute();
 *   
 *   console.log(`✅ Rol ${rol} otorgado a ${usuario}`);
 *   
 *   // 2. Programar revocación automática
 *   const revocarEn = new Date();
 *   revocarEn.setDate(revocarEn.getDate() + duracion_dias);
 *   
 *   // Guardar en tabla de auditoría
 *   await qb.insert('role_grants_temporales', {
 *     usuario,
 *     rol,
 *     otorgado_en: new Date(),
 *     expira_en: revocarEn,
 *     estado: 'activo'
 *   }).execute();
 *   
 *   console.log(`⏰ Rol expirará en ${duracion_dias} días (${revocarEn})`);
 * }
 * 
 * // Tarea programada para limpiar roles expirados
 * async function cleanupExpiredRoles() {
 *   const expirados = await qb
 *     .select('usuario', 'rol')
 *     .from('role_grants_temporales')
 *     .where('expira_en', '<', new Date())
 *     .where('estado', '=', 'activo')
 *     .execute();
 *   
 *   for (const grant of expirados) {
 *     await qb.revokeRoles(grant.rol, grant.usuario).execute();
 *     
 *     await qb.update('role_grants_temporales', {
 *       estado: 'revocado',
 *       revocado_en: new Date()
 *     })
 *     .where('usuario', '=', grant.usuario)
 *     .where('rol', '=', grant.rol)
 *     .execute();
 *     
 *     console.log(`✅ Rol temporal ${grant.rol} revocado de ${grant.usuario}`);
 *   }
 * }
 * 
 * @example
 * // 10. Auditoría completa de roles
 * async function auditRoleMemberships() {
 *   // PostgreSQL
 *   const memberships = await qb.raw(`
 *     SELECT 
 *       r.rolname as role,
 *       m.rolname as member,
 *       a.admin_option,
 *       g.rolname as granted_by
 *     FROM pg_auth_members am
 *     JOIN pg_roles r ON r.oid = am.roleid
 *     JOIN pg_roles m ON m.oid = am.member
 *     LEFT JOIN pg_roles g ON g.oid = am.grantor
 *     ORDER BY r.rolname, m.rolname
 *   `).execute();
 *   
 *   console.log('=== AUDITORÍA DE ROLES ===');
 *   
 *   const porRol = {};
 *   for (const row of memberships) {
 *     if (!porRol[row.role]) {
 *       porRol[row.role] = [];
 *     }
 *     
 *     porRol[row.role].push({
 *       member: row.member,
 *       admin: row.admin_option,
 *       granted_by: row.granted_by
 *     });
 *   }
 *   
 *   for (const [rol, members] of Object.entries(porRol)) {
 *     console.log(`\nRol: ${rol}`);
 *     console.log(`Miembros (${members.length}):`);
 *     
 *     for (const m of members) {
 *       const admin = m.admin ? ' [ADMIN]' : '';
 *       console.log(`  - ${m.member}${admin} (otorgado por ${m.granted_by})`);
 *     }
 *   }
 *   
 *   // Identificar posibles problemas
 *   const conAdmin = memberships.filter(m => m.admin_option);
 *   if (conAdmin.length > 0) {
 *     console.log('\n⚠️ Usuarios con ADMIN OPTION:');
 *     conAdmin.forEach(m => {
 *       console.log(`  - ${m.member} puede administrar rol ${m.role}`);
 *     });
 *   }
 * }
 * 
 * @example
 * // 11. Sistema de roles por proyecto (multi-tenant)
 * async function setupProjectRoles(proyecto_id, equipo) {
 *   const rolProyecto = `PROYECTO_${proyecto_id}`;
 *   
 *   // 1. Crear rol para el proyecto
 *   await qb.createRoles(rolProyecto).execute();
 *   
 *   // 2. Asignar permisos al rol
 *   await qb.grant('ALL PRIVILEGES', `proyecto_${proyecto_id}_datos`, {
 *     to: rolProyecto
 *   }).execute();
 *   
 *   // 3. Asignar rol a líder con ADMIN
 *   await qb.grantRoles(rolProyecto, equipo.lider, {
 *     admin: true
 *   }).execute();
 *   
 *   // 4. Asignar rol a miembros
 *   if (equipo.miembros.length > 0) {
 *     await qb.grantRoles(rolProyecto, equipo.miembros).execute();
 *   }
 *   
 *   console.log(`✅ Proyecto ${proyecto_id} configurado con ${equipo.miembros.length + 1} usuarios`);
 * }
 * 
 * @see {@link types.createRolesOptions} - Para opciones de creación de roles
 * @see {@link QueryBuilder#createRoles} - Para crear roles
 * @see {@link QueryBuilder#revokeRoles} - Para revocar roles
 * @see {@link QueryBuilder#grant} - Para otorgar permisos específicos
 */

/**
 * Nombre de un rol de base de datos.
 * 
 * Los roles son entidades de seguridad que agrupan permisos y pueden asignarse
 * a usuarios u otros roles. Son fundamentales para la gestión eficiente de
 * permisos en sistemas con múltiples usuarios.
 * 
 * **¿QUÉ ES UN ROL?**
 * 
 * Un rol es un conjunto nombrado de permisos que puede:
 * - Asignarse a usuarios (GRANT ROLE TO usuario)
 * - Asignarse a otros roles (jerarquías de roles)
 * - Contener permisos sobre múltiples objetos
 * - Activarse/desactivarse dinámicamente (en algunos SGBDs)
 * - Heredarse entre roles (herencia de permisos)
 * 
 * **DIFERENCIA: ROLES vs USUARIOS:**
 * 
 * Tradicionalmente:
 * - **Usuario**: Entidad que puede conectarse a la base de datos
 * - **Rol**: Conjunto de permisos que se asigna a usuarios
 * 
 * En **PostgreSQL moderna**:
 * - NO hay distinción técnica entre usuario y rol
 * - "Usuario" es un rol con permiso de LOGIN
 * - Todos son roles internamente
 * 
 * ```sql
 * -- PostgreSQL: Estas dos son equivalentes
 * CREATE USER john_doe WITH PASSWORD 'secret';
 * CREATE ROLE john_doe WITH LOGIN PASSWORD 'secret';
 * 
 * -- Un rol sin LOGIN es un "rol tradicional"
 * CREATE ROLE vendedor;
 * ```
 * 
 * **CONVENCIONES DE NOMBRES:**
 * 
 * **Prefijos comunes:**
 * - `ROL_`: Prefijo explícito (ROL_ADMIN, ROL_EDITOR)
 * - `ROLE_`: Variante en inglés (ROLE_ADMIN, ROLE_EDITOR)
 * - Sin prefijo: Nombres descriptivos (ADMINISTRADORES, VENDEDORES)
 * 
 * **Casos comunes:**
 * - UPPERCASE: `ADMINISTRADORES`, `VENDEDORES`, `READONLY`
 * - snake_case: `administradores`, `personal_ventas`, `readonly_user`
 * - PascalCase: `Administradores`, `PersonalVentas` (menos común)
 * 
 * **Nombres funcionales vs departamentales:**
 * 
 * Funcionales (recomendado):
 * - `READONLY`: Solo lectura
 * - `EDITOR`: Lectura y escritura
 * - `ADMIN`: Permisos administrativos
 * - `SUPERUSER`: Todos los permisos
 * 
 * Departamentales:
 * - `VENTAS`: Personal de ventas
 * - `CONTABILIDAD`: Personal contable
 * - `RRHH`: Recursos humanos
 * - `MARKETING`: Equipo marketing
 * 
 * **Jerarquías típicas:**
 * ```
 * SUPERUSER
 *   ↓
 * ADMIN
 *   ↓
 * MANAGER
 *   ↓
 * EDITOR
 *   ↓
 * READONLY
 * ```
 * 
 * **RESTRICCIONES DE NOMBRES:**
 * 
 * **Caracteres permitidos:**
 * - Letras: a-z, A-Z
 * - Números: 0-9 (no al inicio)
 * - Guión bajo: _
 * - Algunos SGBDs: $ (PostgreSQL, Oracle)
 * 
 * **Longitud máxima:**
 * - PostgreSQL: 63 caracteres
 * - MySQL: 32 caracteres (roles) / 16 caracteres (usuarios hasta 5.7)
 * - SQL Server: 128 caracteres
 * - Oracle: 30 caracteres (hasta 11g) / 128 caracteres (12c+)
 * 
 * **Nombres reservados (evitar):**
 * - `PUBLIC`: Pseudo-rol especial (todos los usuarios)
 * - `CURRENT_USER`: Palabra clave SQL
 * - `SESSION_USER`: Palabra clave SQL
 * - `SYSTEM`: Reservado en muchos SGBDs
 * - `DBA`: Reservado en Oracle
 * - `root`: Usuario especial MySQL
 * - `postgres`: Usuario especial PostgreSQL
 * 
 * **Case sensitivity:**
 * - **PostgreSQL**: Nombres sin comillas → lowercase automático
 *   ```sql
 *   CREATE ROLE Admin;        -- Se crea como "admin"
 *   CREATE ROLE "Admin";      -- Se crea como "Admin" (preserva case)
 *   ```
 * - **MySQL**: Case-insensitive (depende de sistema operativo)
 * - **SQL Server**: Case-insensitive por defecto (configurable)
 * - **Oracle**: Uppercase por defecto sin comillas
 * 
 * **ROLES ESPECIALES / PREDEFINIDOS:**
 * 
 * **PostgreSQL:**
 * - `pg_read_all_data`: Lectura de todas las tablas
 * - `pg_write_all_data`: Escritura en todas las tablas
 * - `pg_read_all_settings`: Lectura de configuración
 * - `pg_read_all_stats`: Lectura de estadísticas
 * - `pg_monitor`: Monitoreo del servidor
 * - `pg_signal_backend`: Enviar señales a procesos
 * 
 * **MySQL:**
 * - `mysql.sys`: Sistema interno
 * - `mysql.session`: Sesiones internas
 * - No hay roles predefinidos de usuario (crear los propios)
 * 
 * **SQL Server:**
 * - `db_owner`: Propietario base de datos
 * - `db_ddladmin`: Administrador DDL
 * - `db_datareader`: Solo lectura
 * - `db_datawriter`: Solo escritura
 * - `db_securityadmin`: Gestión de seguridad
 * 
 * **Oracle:**
 * - `CONNECT`: Conexión básica
 * - `RESOURCE`: Crear objetos
 * - `DBA`: Administración completa
 * - `SELECT_CATALOG_ROLE`: Lectura catálogo
 * 
 * **MEJORES PRÁCTICAS:**
 * 
 * 1. **Nombres descriptivos**: `READONLY` mejor que `R1`
 * 2. **Consistencia**: Usar misma convención en toda la aplicación
 * 3. **Prefijos por proyecto**: `PROYECTO_X_ADMIN`, `PROYECTO_Y_READONLY`
 * 4. **Evitar nombres de usuario**: No crear roles con nombres de personas
 * 5. **Documentar propósito**: Comentar qué permisos tiene cada rol
 * 6. **Jerarquías claras**: Estructura lógica de herencia
 * 7. **No hardcodear**: Usar constantes o configuración
 * 
 * **EJEMPLOS DE SISTEMAS DE ROLES:**
 * 
 * **Sistema CMS:**
 * ```javascript
 * const ROLES = {
 *   SUPERADMIN: 'SUPERADMIN',
 *   ADMIN: 'ADMIN',
 *   EDITOR: 'EDITOR',
 *   AUTHOR: 'AUTHOR',
 *   CONTRIBUTOR: 'CONTRIBUTOR',
 *   SUBSCRIBER: 'SUBSCRIBER'
 * };
 * ```
 * 
 * **Sistema e-commerce:**
 * ```javascript
 * const ROLES = {
 *   ADMIN: 'ADMIN',
 *   INVENTORY_MANAGER: 'INVENTORY_MANAGER',
 *   SALES_REPRESENTATIVE: 'SALES_REPRESENTATIVE',
 *   CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
 *   ANALYST: 'ANALYST',
 *   CUSTOMER: 'CUSTOMER'
 * };
 * ```
 * 
 * **Sistema empresarial:**
 * ```javascript
 * const ROLES = {
 *   C_LEVEL: 'C_LEVEL',           // CEO, CTO, CFO
 *   DIRECTOR: 'DIRECTOR',          // Directores
 *   MANAGER: 'MANAGER',            // Managers
 *   TEAM_LEAD: 'TEAM_LEAD',        // Líderes de equipo
 *   EMPLOYEE: 'EMPLOYEE',          // Empleados
 *   CONTRACTOR: 'CONTRACTOR',      // Contratistas
 *   INTERN: 'INTERN'               // Internos
 * };
 * ```
 * 
 * **VALIDACIÓN DE NOMBRES:**
 * 
 * ```javascript
 * function validarNombreRol(nombre) {
 *   // Longitud
 *   if (nombre.length === 0 || nombre.length > 63) {
 *     throw new Error('Nombre debe tener entre 1 y 63 caracteres');
 *   }
 *   
 *   // Caracteres válidos
 *   if (!/^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(nombre)) {
 *     throw new Error('Nombre inválido. Use letras, números, _ y $');
 *   }
 *   
 *   // Palabras reservadas
 *   const reservados = ['PUBLIC', 'CURRENT_USER', 'SESSION_USER', 'SYSTEM'];
 *   if (reservados.includes(nombre.toUpperCase())) {
 *     throw new Error(`"${nombre}" es una palabra reservada`);
 *   }
 *   
 *   return true;
 * }
 * ```
 * 
 * @global
 * @typedef {string} types.roles
 * 
 * @example
 * // 1. Rol simple
 * qb.createRoles('VENDEDOR');
 * 
 * @example
 * // 2. Múltiples roles
 * qb.createRoles(['READONLY', 'EDITOR', 'ADMIN']);
 * 
 * @example
 * // 3. Rol con prefijo de proyecto
 * qb.createRoles('PROYECTO_CRM_ADMIN');
 * 
 * @example
 * // 4. Sistema de roles con constantes
 * const ROLES = {
 *   ADMIN: 'ADMIN',
 *   MANAGER: 'MANAGER',
 *   EMPLOYEE: 'EMPLOYEE',
 *   READONLY: 'READONLY'
 * };
 * 
 * // Crear jerarquía
 * await qb.createRoles(Object.values(ROLES)).execute();
 * 
 * // Asignar permisos
 * await qb.grant('ALL PRIVILEGES', 'productos', { to: ROLES.ADMIN }).execute();
 * await qb.grant(['SELECT', 'INSERT', 'UPDATE'], 'productos', { 
 *   to: ROLES.MANAGER 
 * }).execute();
 * await qb.grant('SELECT', 'productos', { to: ROLES.READONLY }).execute();
 * 
 * // Crear jerarquía (roles contienen roles)
 * await qb.grantRoles(ROLES.READONLY, ROLES.EMPLOYEE).execute();
 * await qb.grantRoles(ROLES.EMPLOYEE, ROLES.MANAGER).execute();
 * await qb.grantRoles(ROLES.MANAGER, ROLES.ADMIN).execute();
 * 
 * @example
 * // 5. Roles por departamento
 * const DEPARTAMENTOS = {
 *   VENTAS: 'DEPT_VENTAS',
 *   MARKETING: 'DEPT_MARKETING',
 *   CONTABILIDAD: 'DEPT_CONTABILIDAD',
 *   RRHH: 'DEPT_RRHH',
 *   TI: 'DEPT_TI'
 * };
 * 
 * // Crear roles de departamento
 * for (const [nombre, rol] of Object.entries(DEPARTAMENTOS)) {
 *   await qb.createRoles(rol, {
 *     comment: `Rol para departamento de ${nombre}`
 *   }).execute();
 * }
 * 
 * @example
 * // 6. Roles con niveles de acceso
 * const NIVELES = {
 *   NIVEL_1_BASICO: 'ACCESO_NIVEL_1',
 *   NIVEL_2_INTERMEDIO: 'ACCESO_NIVEL_2',
 *   NIVEL_3_AVANZADO: 'ACCESO_NIVEL_3',
 *   NIVEL_4_ADMIN: 'ACCESO_NIVEL_4'
 * };
 * 
 * // Cada nivel incluye permisos del nivel anterior
 * await qb.createRoles(Object.values(NIVELES)).execute();
 * 
 * // Nivel 1: Solo lectura
 * await qb.grant('SELECT', 'public_data', { 
 *   to: NIVELES.NIVEL_1_BASICO 
 * }).execute();
 * 
 * // Nivel 2: Incluye nivel 1 + escritura limitada
 * await qb.grantRoles(NIVELES.NIVEL_1_BASICO, NIVELES.NIVEL_2_INTERMEDIO).execute();
 * await qb.grant(['INSERT', 'UPDATE'], 'user_data', { 
 *   to: NIVELES.NIVEL_2_INTERMEDIO 
 * }).execute();
 * 
 * // Nivel 3: Incluye nivel 2 + DELETE
 * await qb.grantRoles(NIVELES.NIVEL_2_INTERMEDIO, NIVELES.NIVEL_3_AVANZADO).execute();
 * await qb.grant('DELETE', 'user_data', { 
 *   to: NIVELES.NIVEL_3_AVANZADO 
 * }).execute();
 * 
 * // Nivel 4: Incluye nivel 3 + DDL
 * await qb.grantRoles(NIVELES.NIVEL_3_AVANZADO, NIVELES.NIVEL_4_ADMIN).execute();
 * await qb.grant(['CREATE', 'ALTER', 'DROP'], 'DATABASE', { 
 *   to: NIVELES.NIVEL_4_ADMIN 
 * }).execute();
 * 
 * @example
 * // 7. Roles temporales para proyectos
 * async function crearRolProyecto(proyecto_id, nombre_proyecto) {
 *   const rolNombre = `PROYECTO_${proyecto_id}_TEAM`;
 *   
 *   await qb.createRoles(rolNombre, {
 *     comment: `Rol para equipo del proyecto: ${nombre_proyecto}`
 *   }).execute();
 *   
 *   // Permisos sobre esquema del proyecto
 *   await qb.grant('ALL PRIVILEGES', `proyecto_${proyecto_id}_schema.*`, {
 *     to: rolNombre
 *   }).execute();
 *   
 *   return rolNombre;
 * }
 * 
 * @example
 * // 8. Validación y normalización de nombres
 * function normalizarNombreRol(nombre) {
 *   // Convertir a uppercase y reemplazar espacios
 *   let normalizado = nombre.toUpperCase().replace(/\s+/g, '_');
 *   
 *   // Remover caracteres inválidos
 *   normalizado = normalizado.replace(/[^A-Z0-9_$]/g, '');
 *   
 *   // Asegurar que no empieza con número
 *   if (/^\d/.test(normalizado)) {
 *     normalizado = 'ROL_' + normalizado;
 *   }
 *   
 *   // Truncar si es muy largo (PostgreSQL: 63 chars)
 *   if (normalizado.length > 63) {
 *     normalizado = normalizado.substring(0, 63);
 *   }
 *   
 *   return normalizado;
 * }
 * 
 * // Uso
 * const rol1 = normalizarNombreRol('Equipo de Ventas');
 * console.log(rol1); // "EQUIPO_DE_VENTAS"
 * 
 * const rol2 = normalizarNombreRol('123 Admin');
 * console.log(rol2); // "ROL_123_ADMIN"
 * 
 * @example
 * // 9. Gestión de roles con metadata
 * const ROLE_REGISTRY = {
 *   SUPER_ADMIN: {
 *     name: 'SUPER_ADMIN',
 *     description: 'Acceso completo al sistema',
 *     permissions: ['ALL'],
 *     inherits: []
 *   },
 *   ADMIN: {
 *     name: 'ADMIN',
 *     description: 'Administrador de aplicación',
 *     permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
 *     inherits: []
 *   },
 *   MANAGER: {
 *     name: 'MANAGER',
 *     description: 'Manager de equipo',
 *     permissions: ['READ', 'UPDATE', 'CREATE'],
 *     inherits: []
 *   },
 *   EMPLOYEE: {
 *     name: 'EMPLOYEE',
 *     description: 'Empleado estándar',
 *     permissions: ['READ', 'UPDATE'],
 *     inherits: []
 *   },
 *   READONLY: {
 *     name: 'READONLY',
 *     description: 'Solo lectura',
 *     permissions: ['READ'],
 *     inherits: []
 *   }
 * };
 * 
 * // Crear todos los roles
 * async function setupRoleSystem() {
 *   for (const [key, config] of Object.entries(ROLE_REGISTRY)) {
 *     await qb.createRoles(config.name, {
 *       comment: config.description
 *     }).execute();
 *     
 *     console.log(`✅ Rol creado: ${config.name}`);
 *   }
 * }
 * 
 * @example
 * // 10. Auditoría de roles existentes
 * async function auditarRoles() {
 *   // PostgreSQL
 *   const roles = await qb.raw(`
 *     SELECT 
 *       rolname as nombre,
 *       rolsuper as es_superuser,
 *       rolinherit as hereda_permisos,
 *       rolcreaterole as puede_crear_roles,
 *       rolcreatedb as puede_crear_db,
 *       rolcanlogin as puede_login,
 *       rolconnlimit as limite_conexiones,
 *       rolvaliduntil as valido_hasta,
 *       oid
 *     FROM pg_roles
 *     WHERE rolname NOT LIKE 'pg_%'
 *     ORDER BY rolname
 *   `).execute();
 *   
 *   console.log('=== ROLES EN EL SISTEMA ===');
 *   
 *   for (const rol of roles) {
 *     console.log(`\nRol: ${rol.nombre}`);
 *     console.log(`  - Superuser: ${rol.es_superuser ? 'Sí' : 'No'}`);
 *     console.log(`  - Puede login: ${rol.puede_login ? 'Sí' : 'No'}`);
 *     console.log(`  - Puede crear roles: ${rol.puede_crear_roles ? 'Sí' : 'No'}`);
 *     console.log(`  - Puede crear DB: ${rol.puede_crear_db ? 'Sí' : 'No'}`);
 *     
 *     if (rol.valido_hasta) {
 *       console.log(`  - Válido hasta: ${rol.valido_hasta}`);
 *     }
 *     
 *     // Miembros del rol
 *     const miembros = await qb.raw(`
 *       SELECT r.rolname
 *       FROM pg_auth_members m
 *       JOIN pg_roles r ON r.oid = m.member
 *       WHERE m.roleid = $1
 *     `, [rol.oid]).execute();
 *     
 *     if (miembros.length > 0) {
 *       console.log(`  - Miembros: ${miembros.map(m => m.rolname).join(', ')}`);
 *     }
 *   }
 * }
 * 
 * @see {@link types.createRolesOptions} - Para opciones al crear roles
 * @see {@link types.grantRolesOptions} - Para opciones al asignar roles
 * @see {@link QueryBuilder#createRoles} - Para crear roles
 * @see {@link QueryBuilder#grantRoles} - Para asignar roles a usuarios
 * @see {@link QueryBuilder#revokeRoles} - Para revocar roles de usuarios
 * @see {@link QueryBuilder#dropRoles} - Para eliminar roles
 */

/**
 * Nombre de un usuario de base de datos.
 * 
 * Los usuarios son las entidades que se conectan a la base de datos y ejecutan
 * operaciones. Representan cuentas individuales o de aplicación con credenciales
 * y permisos específicos.
 * 
 * **¿QUÉ ES UN USUARIO?**
 * 
 * Un usuario es una identidad autenticable que puede:
 * - Conectarse a la base de datos (con credenciales)
 * - Ejecutar consultas y comandos
 * - Poseer objetos (tablas, vistas, etc.)
 * - Tener permisos directos o heredados de roles
 * - Representar una persona, aplicación o servicio
 * 
 * **DIFERENCIAS ENTRE SGBDS:**
 * 
 * **PostgreSQL:**
 * - NO hay distinción entre usuario y rol desde versión 8.1
 * - "Usuario" es simplemente un rol con permiso LOGIN
 * - Todo es un rol internamente
 * ```sql
 * -- Estas dos son equivalentes:
 * CREATE USER juan WITH PASSWORD 'secret';
 * CREATE ROLE juan WITH LOGIN PASSWORD 'secret';
 * ```
 * 
 * **MySQL:**
 * - Usuarios son distintos de roles (hasta MySQL 8.0)
 * - Usuario = cuenta con credenciales
 * - Rol = conjunto de permisos (desde MySQL 8.0+)
 * - Usuarios SIEMPRE incluyen componente de host: `'usuario'@'host'`
 * ```sql
 * CREATE USER 'juan'@'localhost' IDENTIFIED BY 'secret';
 * CREATE USER 'juan'@'%' IDENTIFIED BY 'secret';  -- Desde cualquier host
 * ```
 * 
 * **SQL Server:**
 * - Usuarios y logins son conceptos separados
 * - **Login**: Autenticación nivel servidor
 * - **Usuario**: Entidad nivel base de datos (mapeada a login)
 * ```sql
 * -- Crear login (nivel servidor)
 * CREATE LOGIN juan WITH PASSWORD = 'secret';
 * 
 * -- Crear usuario (nivel base de datos)
 * CREATE USER juan FOR LOGIN juan;
 * ```
 * 
 * **Oracle:**
 * - Usuario = esquema (namespace de objetos)
 * - Cada usuario tiene su propio esquema por defecto
 * - Usuario posee objetos en su esquema
 * ```sql
 * CREATE USER juan IDENTIFIED BY secret
 * DEFAULT TABLESPACE users
 * TEMPORARY TABLESPACE temp;
 * ```
 * 
 * **FORMATO POR SGBD:**
 * 
 * **PostgreSQL:**
 * - Formato: `nombre_usuario`
 * - Case-insensitive (sin comillas → lowercase)
 * - Con comillas preserva case: `"Usuario"`
 * - Ejemplos: `app_user`, `admin`, `readonly_user`
 * 
 * **MySQL:**
 * - Formato: `'usuario'@'host'`
 * - Componentes:
 *   * Usuario: nombre de la cuenta
 *   * Host: desde dónde puede conectarse
 * - Ejemplos:
 *   * `'app_user'@'localhost'`: Solo localhost
 *   * `'app_user'@'%'`: Desde cualquier host
 *   * `'app_user'@'192.168.1.%'`: Desde subnet
 *   * `'app_user'@'app-server.com'`: Host específico
 * 
 * **SQL Server:**
 * - Formato servidor: `dominio\usuario` o solo `usuario`
 * - Autenticación Windows: `DOMAIN\username`
 * - Autenticación SQL: `username`
 * - Ejemplos:
 *   * `sa`: Usuario sistema
 *   * `COMPANY\john_doe`: Usuario Windows
 *   * `app_user`: Usuario SQL
 * 
 * **Oracle:**
 * - Formato: `USUARIO` (uppercase por defecto)
 * - Sin comillas → uppercase automático
 * - Con comillas preserva case
 * - Ejemplos: `APP_USER`, `SCOTT`, `HR`
 * 
 * **CONVENCIONES DE NOMBRES:**
 * 
 * **Usuarios de aplicación:**
 * - `app_user`: Usuario genérico de aplicación
 * - `api_user`: Usuario para API/servicios
 * - `readonly_user`: Usuario solo lectura
 * - `admin_user`: Usuario administrativo
 * - `batch_user`: Usuario para procesos batch
 * - `etl_user`: Usuario para ETL
 * 
 * **Usuarios por entorno:**
 * - `dev_user`: Desarrollo
 * - `test_user`: Testing
 * - `staging_user`: Staging
 * - `prod_user`: Producción
 * 
 * **Usuarios por función:**
 * - `backup_user`: Backups
 * - `monitor_user`: Monitoreo
 * - `reporting_user`: Reportes
 * - `migration_user`: Migraciones
 * 
 * **Usuarios personales:**
 * - `john_doe`: Formato nombre_apellido
 * - `jdoe`: Iniciales
 * - `juan.perez`: Formato punto
 * - Generalmente evitar en producción (usar roles)
 * 
 * **RESTRICCIONES DE NOMBRES:**
 * 
 * **Caracteres permitidos:**
 * - Letras: a-z, A-Z
 * - Números: 0-9 (generalmente no al inicio)
 * - Caracteres especiales: _ (guión bajo)
 * - Algunos SGBDs: $ @ # (con restricciones)
 * 
 * **Longitud máxima:**
 * - PostgreSQL: 63 caracteres
 * - MySQL: 32 caracteres (usuario) + host separado
 * - SQL Server: 128 caracteres
 * - Oracle: 30 caracteres (hasta 11g) / 128 caracteres (12c+)
 * 
 * **Nombres reservados (evitar):**
 * - `root`: Superusuario MySQL
 * - `postgres`: Superusuario PostgreSQL
 * - `sa`: Administrador SQL Server
 * - `SYSTEM`, `SYS`: Usuarios sistema Oracle
 * - `PUBLIC`: Pseudo-usuario (todos)
 * - `CURRENT_USER`, `SESSION_USER`: Palabras clave SQL
 * 
 * **USUARIOS ESPECIALES / SISTEMA:**
 * 
 * **PostgreSQL:**
 * - `postgres`: Superusuario por defecto
 * - `PUBLIC`: Pseudo-rol (todos los usuarios)
 * - Usuarios del sistema: `pg_monitor`, `pg_read_all_stats`, etc.
 * 
 * **MySQL:**
 * - `root`: Superusuario
 * - `mysql.sys`: Usuario sistema
 * - `mysql.session`: Sesiones internas
 * - `mysql.infoschema`: Sistema information_schema
 * 
 * **SQL Server:**
 * - `sa`: System Administrator (autenticación SQL)
 * - `NT AUTHORITY\SYSTEM`: Usuario sistema Windows
 * - `dbo`: Database Owner (usuario especial)
 * - `guest`: Usuario invitado (generalmente deshabilitado)
 * 
 * **Oracle:**
 * - `SYS`: Superusuario sistema
 * - `SYSTEM`: Administrador sistema
 * - `SCOTT`: Usuario demo clásico
 * - `HR`: Usuario demo recursos humanos
 * 
 * **SEGURIDAD Y MEJORES PRÁCTICAS:**
 * 
 * **1. Principio de mínimo privilegio:**
 * - Usuario solo con permisos necesarios
 * - Evitar superusuarios para aplicaciones
 * - Usar roles en vez de permisos directos
 * 
 * **2. Usuarios de aplicación:**
 * - Un usuario por aplicación/servicio
 * - Credenciales en variables de entorno
 * - Rotar credenciales periódicamente
 * - Auditar accesos
 * 
 * **3. Usuarios personales:**
 * - Solo para desarrollo/administración
 * - NUNCA hardcodear en código
 * - Usar autenticación SSO cuando sea posible
 * - Deshabilitar cuando empleado se va
 * 
 * **4. Naming y organización:**
 * - Prefijos consistentes (`app_`, `service_`)
 * - Indicar propósito en el nombre
 * - Documentar propósito de cada usuario
 * - Inventario actualizado
 * 
 * **5. Credenciales:**
 * - Contraseñas fuertes y únicas
 * - No reutilizar entre usuarios
 * - Almacenar en gestores de secretos
 * - Caducidad periódica (compliance)
 * 
 * **6. Control de acceso por host (MySQL):**
 * - Restringir IPs permitidas
 * - Evitar '%' (cualquier host) en producción
 * - Usar subnets específicas
 * - Firewall adicional
 * 
 * **VALIDACIÓN DE NOMBRES:**
 * 
 * ```javascript
 * function validarNombreUsuario(nombre, sgbd = 'postgresql') {
 *   const limits = {
 *     postgresql: 63,
 *     mysql: 32,
 *     sqlserver: 128,
 *     oracle: 128
 *   };
 *   
 *   const maxLength = limits[sgbd] || 63;
 *   
 *   // Longitud
 *   if (nombre.length === 0 || nombre.length > maxLength) {
 *     throw new Error(`Nombre debe tener entre 1 y ${maxLength} caracteres`);
 *   }
 *   
 *   // Caracteres válidos
 *   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(nombre)) {
 *     throw new Error('Nombre inválido. Use letras, números y _');
 *   }
 *   
 *   // Usuarios reservados
 *   const reservados = ['root', 'postgres', 'sa', 'admin', 'SYSTEM', 'SYS', 'PUBLIC'];
 *   if (reservados.includes(nombre.toLowerCase())) {
 *     throw new Error(`"${nombre}" es un usuario reservado del sistema`);
 *   }
 *   
 *   return true;
 * }
 * ```
 * 
 * **FORMATO MYSQL CON HOST:**
 * 
 * En MySQL, el usuario completo incluye el host de conexión:
 * 
 * ```javascript
 * function formatoUsuarioMySQL(usuario, host = 'localhost') {
 *   // Validar host
 *   const hostsValidos = ['localhost', '127.0.0.1', '%'];
 *   const esIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
 *   const esSubnet = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\%$/.test(host);
 *   const esDominio = /^[a-zA-Z0-9.-]+$/.test(host);
 *   
 *   if (!hostsValidos.includes(host) && !esIP && !esSubnet && !esDominio) {
 *     throw new Error('Host inválido');
 *   }
 *   
 *   // Formato: 'usuario'@'host'
 *   return `'${usuario}'@'${host}'`;
 * }
 * 
 * console.log(formatoUsuarioMySQL('app_user', 'localhost'));
 * // 'app_user'@'localhost'
 * 
 * console.log(formatoUsuarioMySQL('app_user', '%'));
 * // 'app_user'@'%'
 * 
 * console.log(formatoUsuarioMySQL('app_user', '192.168.1.100'));
 * // 'app_user'@'192.168.1.100'
 * ```
 * 
 * @global
 * @typedef {string} types.user
 * 
 * @example
 * // 1. Usuario simple (PostgreSQL)
 * qb.grantRoles('VENDEDOR', 'juan_perez');
 * // Genera: GRANT VENDEDOR TO juan_perez;
 * 
 * @example
 * // 2. Múltiples usuarios
 * qb.grantRoles('READONLY', ['consultor1', 'consultor2', 'analista']);
 * // Genera: GRANT READONLY TO consultor1, consultor2, analista;
 * 
 * @example
 * // 3. Usuario con host específico (MySQL)
 * qb.grantRoles('APP_ROLE', 'app_user', { host: 'localhost' });
 * // Genera (MySQL): GRANT APP_ROLE TO 'app_user'@'localhost';
 * 
 * @example
 * // 4. Crear usuario de aplicación
 * async function crearUsuarioAplicacion(nombre, entorno) {
 *   const nombreCompleto = `${nombre}_${entorno}`;
 *   
 *   // 1. Crear usuario
 *   await qb.raw(`
 *     CREATE USER ${nombreCompleto} WITH PASSWORD 'temp_password_change_me'
 *   `).execute();
 *   
 *   console.log(`✅ Usuario ${nombreCompleto} creado`);
 *   
 *   // 2. Asignar rol apropiado
 *   const rol = entorno === 'prod' ? 'APP_READONLY' : 'APP_FULL';
 *   await qb.grantRoles(rol, nombreCompleto).execute();
 *   
 *   console.log(`✅ Rol ${rol} asignado a ${nombreCompleto}`);
 *   
 *   // 3. Configurar límites de conexión
 *   await qb.raw(`
 *     ALTER USER ${nombreCompleto} CONNECTION LIMIT 10
 *   `).execute();
 *   
 *   console.log(`⚠️  IMPORTANTE: Cambiar contraseña de ${nombreCompleto}`);
 *   
 *   return nombreCompleto;
 * }
 * 
 * @example
 * // 5. Sistema de usuarios por servicio
 * const USUARIOS_SISTEMA = {
 *   API: 'api_service',
 *   WEB: 'web_service',
 *   BATCH: 'batch_service',
 *   ETL: 'etl_service',
 *   REPORTING: 'reporting_service',
 *   MONITORING: 'monitor_service'
 * };
 * 
 * async function setupServiceUsers() {
 *   for (const [servicio, usuario] of Object.entries(USUARIOS_SISTEMA)) {
 *     // Crear usuario
 *     await qb.raw(`
 *       CREATE USER ${usuario} WITH PASSWORD '${generateSecurePassword()}'
 *     `).execute();
 *     
 *     // Asignar rol específico del servicio
 *     const rol = `ROL_${servicio}`;
 *     await qb.grantRoles(rol, usuario).execute();
 *     
 *     console.log(`✅ Usuario ${usuario} creado para servicio ${servicio}`);
 *   }
 * }
 * 
 * @example
 * // 6. Usuarios con expiración (temporal)
 * async function crearUsuarioTemporal(nombre, dias_valido) {
 *   const fechaExpiracion = new Date();
 *   fechaExpiracion.setDate(fechaExpiracion.getDate() + dias_valido);
 *   
 *   // PostgreSQL: Usuario con fecha de expiración
 *   await qb.raw(`
 *     CREATE USER ${nombre} 
 *     WITH PASSWORD 'temp_pass'
 *     VALID UNTIL '${fechaExpiracion.toISOString()}'
 *   `).execute();
 *   
 *   // Asignar rol temporal
 *   await qb.grantRoles('TEMPORAL_ACCESS', nombre).execute();
 *   
 *   console.log(`✅ Usuario temporal ${nombre} creado`);
 *   console.log(`⏰ Expira: ${fechaExpiracion}`);
 *   
 *   return {
 *     usuario: nombre,
 *     expira: fechaExpiracion
 *   };
 * }
 * 
 * @example
 * // 7. Auditoría de usuarios
 * async function auditarUsuarios() {
 *   // PostgreSQL
 *   const usuarios = await qb.raw(`
 *     SELECT 
 *       usename as nombre,
 *       usesuper as es_superuser,
 *       usecreatedb as puede_crear_db,
 *       useconfig as configuracion,
 *       valuntil as valido_hasta,
 *       (SELECT array_agg(rolname)
 *        FROM pg_roles r
 *        JOIN pg_auth_members m ON r.oid = m.roleid
 *        WHERE m.member = u.usesysid) as roles
 *     FROM pg_user u
 *     WHERE usename NOT LIKE 'pg_%'
 *     ORDER BY usename
 *   `).execute();
 *   
 *   console.log('=== AUDITORÍA DE USUARIOS ===\n');
 *   
 *   for (const user of usuarios) {
 *     console.log(`Usuario: ${user.nombre}`);
 *     console.log(`  - Superuser: ${user.es_superuser ? '⚠️  Sí' : 'No'}`);
 *     console.log(`  - Puede crear DB: ${user.puede_crear_db ? 'Sí' : 'No'}`);
 *     
 *     if (user.valido_hasta) {
 *       const expira = new Date(user.valido_hasta);
 *       const hoy = new Date();
 *       const diasRestantes = Math.floor((expira - hoy) / (1000 * 60 * 60 * 24));
 *       
 *       if (diasRestantes < 0) {
 *         console.log(`  - ❌ EXPIRADO hace ${Math.abs(diasRestantes)} días`);
 *       } else if (diasRestantes < 30) {
 *         console.log(`  - ⚠️  Expira en ${diasRestantes} días`);
 *       } else {
 *         console.log(`  - Válido hasta: ${expira.toLocaleDateString()}`);
 *       }
 *     }
 *     
 *     if (user.roles && user.roles.length > 0) {
 *       console.log(`  - Roles: ${user.roles.join(', ')}`);
 *     } else {
 *       console.log(`  - ⚠️  Sin roles asignados`);
 *     }
 *     
 *     console.log();
 *   }
 * }
 * 
 * @example
 * // 8. Gestión de usuarios MySQL con hosts
 * async function gestionarUsuarioMySQL(usuario, hosts_permitidos) {
 *   // Crear usuario para cada host
 *   for (const host of hosts_permitidos) {
 *     const usuarioCompleto = `'${usuario}'@'${host}'`;
 *     
 *     await qb.raw(`
 *       CREATE USER ${usuarioCompleto} IDENTIFIED BY '${generatePassword()}'
 *     `).execute();
 *     
 *     // Asignar rol
 *     await qb.grantRoles('app_role', usuario, { host }).execute();
 *     
 *     console.log(`✅ Usuario ${usuarioCompleto} creado`);
 *   }
 * }
 * 
 * // Crear usuario con acceso desde múltiples hosts
 * await gestionarUsuarioMySQL('app_user', [
 *   'localhost',
 *   '192.168.1.%',    // Subnet oficina
 *   '10.0.0.100'      // Servidor aplicación
 * ]);
 * 
 * @example
 * // 9. Cleanup de usuarios inactivos
 * async function cleanupUsuariosInactivos(dias_inactividad = 90) {
 *   // PostgreSQL: Encontrar usuarios sin conexiones recientes
 *   const inactivos = await qb.raw(`
 *     SELECT 
 *       usename,
 *       COALESCE(MAX(backend_start), '1970-01-01'::timestamp) as ultima_conexion,
 *       NOW() - COALESCE(MAX(backend_start), '1970-01-01'::timestamp) as dias_inactivo
 *     FROM pg_user u
 *     LEFT JOIN pg_stat_activity a ON u.usename = a.usename
 *     WHERE u.usename NOT LIKE 'pg_%'
 *       AND u.usename != 'postgres'
 *     GROUP BY u.usename
 *     HAVING NOW() - COALESCE(MAX(backend_start), '1970-01-01'::timestamp) > interval '${dias_inactividad} days'
 *   `).execute();
 *   
 *   console.log(`Encontrados ${inactivos.length} usuarios inactivos > ${dias_inactividad} días\n`);
 *   
 *   for (const user of inactivos) {
 *     const dias = Math.floor(user.dias_inactivo.days);
 *     console.log(`Usuario: ${user.usename}`);
 *     console.log(`  - Última conexión: ${user.ultima_conexion}`);
 *     console.log(`  - Días inactivo: ${dias}`);
 *     
 *     // Revocar todos los roles
 *     const roles = await qb.raw(`
 *       SELECT rolname
 *       FROM pg_roles r
 *       JOIN pg_auth_members m ON r.oid = m.roleid
 *       JOIN pg_user u ON u.usesysid = m.member
 *       WHERE u.usename = $1
 *     `, [user.usename]).execute();
 *     
 *     for (const rol of roles) {
 *       await qb.revokeRoles(rol.rolname, user.usename).execute();
 *       console.log(`  - Revocado rol: ${rol.rolname}`);
 *     }
 *     
 *     console.log(`  - ✅ Usuario ${user.usename} limpiado\n`);
 *   }
 * }
 * 
 * @example
 * // 10. Verificar permisos efectivos de un usuario
 * async function verificarPermisosUsuario(usuario) {
 *   // PostgreSQL: Permisos directos + heredados de roles
 *   const permisos = await qb.raw(`
 *     WITH RECURSIVE role_tree AS (
 *       -- Roles directos del usuario
 *       SELECT 
 *         r.rolname,
 *         0 as nivel
 *       FROM pg_user u
 *       JOIN pg_auth_members m ON u.usesysid = m.member
 *       JOIN pg_roles r ON r.oid = m.roleid
 *       WHERE u.usename = $1
 *       
 *       UNION ALL
 *       
 *       -- Roles heredados (recursivo)
 *       SELECT 
 *         r2.rolname,
 *         rt.nivel + 1
 *       FROM role_tree rt
 *       JOIN pg_auth_members m ON m.member = (
 *         SELECT oid FROM pg_roles WHERE rolname = rt.rolname
 *       )
 *       JOIN pg_roles r2 ON r2.oid = m.roleid
 *     )
 *     SELECT DISTINCT
 *       schemaname,
 *       tablename,
 *       privilege_type,
 *       grantee,
 *       is_grantable
 *     FROM (
 *       -- Permisos del usuario
 *       SELECT * FROM information_schema.table_privileges
 *       WHERE grantee = $1
 *       
 *       UNION
 *       
 *       -- Permisos de roles
 *       SELECT * FROM information_schema.table_privileges
 *       WHERE grantee IN (SELECT rolname FROM role_tree)
 *     ) permisos
 *     ORDER BY schemaname, tablename, privilege_type
 *   `, [usuario]).execute();
 *   
 *   console.log(`=== PERMISOS EFECTIVOS DE ${usuario} ===\n`);
 *   
 *   // Agrupar por tabla
 *   const porTabla = {};
 *   for (const perm of permisos) {
 *     const key = `${perm.schemaname}.${perm.tablename}`;
 *     if (!porTabla[key]) {
 *       porTabla[key] = [];
 *     }
 *     porTabla[key].push({
 *       permiso: perm.privilege_type,
 *       origen: perm.grantee,
 *       puede_otorgar: perm.is_grantable === 'YES'
 *     });
 *   }
 *   
 *   for (const [tabla, perms] of Object.entries(porTabla)) {
 *     console.log(`Tabla: ${tabla}`);
 *     for (const p of perms) {
 *       const grant = p.puede_otorgar ? ' [WITH GRANT OPTION]' : '';
 *       console.log(`  - ${p.permiso} (vía ${p.origen})${grant}`);
 *     }
 *     console.log();
 *   }
 * }
 * 
 * @see {@link types.roles} - Para nombres de roles
 * @see {@link types.grantRolesOptions} - Para opciones al asignar roles
 * @see {@link QueryBuilder#grantRoles} - Para asignar roles a usuarios
 * @see {@link QueryBuilder#revokeRoles} - Para revocar roles de usuarios
 */

/**
 * Opciones de configuración para la cláusula SELECT.
 * 
 * SELECT es el comando fundamental de SQL para consultar y recuperar datos
 * de una o más tablas. Estas opciones controlan aspectos como eliminación
 * de duplicados, selección de todas las filas, y otras características
 * específicas de SGBDs.
 * 
 * **SINTAXIS BÁSICA SQL:**
 * ```sql
 * SELECT [DISTINCT | ALL] columnas
 * FROM tabla
 * WHERE condiciones
 * GROUP BY agrupación
 * HAVING filtro_grupos
 * ORDER BY ordenamiento
 * LIMIT cantidad OFFSET inicio;
 * ```
 * 
 * **ARQUITECTURA DE UNA CONSULTA:**
 * 
 * 1. **SELECT**: Qué columnas recuperar
 * 2. **FROM**: De qué tabla(s)
 * 3. **WHERE**: Filtrado de filas
 * 4. **GROUP BY**: Agrupación
 * 5. **HAVING**: Filtrado de grupos
 * 6. **ORDER BY**: Ordenamiento
 * 7. **LIMIT/OFFSET**: Paginación
 * 
 * **OPCIONES DE SELECT:**
 * 
 * Las opciones controlan modificadores que van entre SELECT y las columnas:
 * - `DISTINCT`: Elimina duplicados
 * - `ALL`: Mantiene duplicados (por defecto)
 * - Otras específicas por SGBD
 * 
 * **COMPATIBILIDAD:**
 * - **SQL estándar**: ✅ SELECT definido en SQL-86 y posteriores
 * - **PostgreSQL**: ✅ Soporte completo + extensiones
 * - **MySQL**: ✅ Soporte completo + extensiones
 * - **SQL Server**: ✅ Soporte completo + TOP, FOR XML
 * - **Oracle**: ✅ Soporte completo + ROWNUM, FOR UPDATE
 * - **SQLite**: ✅ Soporte estándar SQL
 * - **MongoDB**: ⚠️ find() (similar pero diferente sintaxis)
 * 
 * @global
 * @typedef {Object} types.SelectOptions
 * 
 * @property {boolean} [distinct=false] - Elimina filas duplicadas del resultado.
 * 
 * Cuando es `true`, añade la palabra clave DISTINCT después de SELECT,
 * eliminando todas las filas duplicadas del conjunto de resultados.
 * 
 * **Comportamiento:**
 * - `false` o no especificado: Devuelve todas las filas, incluyendo duplicados (ALL)
 * - `true`: Elimina filas duplicadas, devuelve solo valores únicos
 * 
 * **¿Cuándo es una fila duplicada?**
 * Dos filas son duplicadas cuando TODOS los valores de TODAS las columnas
 * seleccionadas son idénticos.
 * 
 * **Sintaxis generada:**
 * ```sql
 * SELECT DISTINCT columnas FROM tabla;
 * ```
 * 
 * **Casos de uso principales:**
 * 
 * 1. **Valores únicos de una columna:**
 * ```javascript
 * // Obtener lista de países únicos
 * qb.select('pais', { distinct: true }).from('clientes');
 * // SELECT DISTINCT pais FROM clientes;
 * ```
 * 
 * 2. **Combinaciones únicas:**
 * ```javascript
 * // Pares únicos ciudad-estado
 * qb.select(['ciudad', 'estado'], { distinct: true }).from('direcciones');
 * // SELECT DISTINCT ciudad, estado FROM direcciones;
 * ```
 * 
 * 3. **Eliminar duplicados en JOINs:**
 * ```javascript
 * // Clientes que han hecho al menos un pedido (sin repetir)
 * qb.select('c.nombre', { distinct: true })
 *   .from('clientes c')
 *   .join('pedidos p', 'c.id', 'p.cliente_id');
 * // SELECT DISTINCT c.nombre FROM clientes c JOIN pedidos p ON c.id = p.cliente_id;
 * ```
 * 
 * **⚠️ CONSIDERACIONES DE RENDIMIENTO:**
 * 
 * DISTINCT es una operación costosa que puede afectar el rendimiento:
 * 
 * 1. **Requiere ordenamiento o hashing:**
 *    - Base de datos debe comparar todas las filas
 *    - Puede crear tabla temporal interna
 *    - Uso intensivo de memoria
 * 
 * 2. **Impide uso eficiente de índices:**
 *    - Dificulta optimización de consultas
 *    - Puede forzar full table scan
 * 
 * 3. **Alternativas más eficientes:**
 * 
 * **En vez de DISTINCT, considerar:**
 * 
 * ```javascript
 * // ❌ LENTO: DISTINCT con JOIN
 * qb.select('cliente_id', { distinct: true })
 *   .from('pedidos')
 *   .where('fecha', '>', '2024-01-01');
 * 
 * // ✅ RÁPIDO: EXISTS (mejor rendimiento)
 * qb.select('id')
 *   .from('clientes c')
 *   .whereExists(
 *     qb.select('1')
 *       .from('pedidos p')
 *       .whereRaw('p.cliente_id = c.id')
 *       .where('p.fecha', '>', '2024-01-01')
 *   );
 * 
 * // ✅ RÁPIDO: GROUP BY (si aplica)
 * qb.select('cliente_id')
 *   .from('pedidos')
 *   .where('fecha', '>', '2024-01-01')
 *   .groupBy('cliente_id');
 * ```
 * 
 * **Mejores prácticas:**
 * 
 * 1. **Usar DISTINCT solo cuando sea necesario**
 * 2. **Preferir WHERE/JOIN correctos en vez de DISTINCT**
 * 3. **Considerar GROUP BY como alternativa**
 * 4. **Limitar columnas seleccionadas al mínimo**
 * 5. **Crear índices apropiados**
 * 6. **Analizar plan de ejecución**
 * 
 * **DISTINCT vs GROUP BY:**
 * 
 * ```sql
 * -- Estas dos son funcionalmente equivalentes:
 * SELECT DISTINCT pais FROM clientes;
 * SELECT pais FROM clientes GROUP BY pais;
 * 
 * -- Pero GROUP BY permite agregaciones:
 * SELECT pais, COUNT(*) as total FROM clientes GROUP BY pais;
 * ```
 * 
 * **DISTINCT con múltiples columnas:**
 * ```javascript
 * // Combinaciones únicas (todas las columnas deben coincidir)
 * qb.select(['nombre', 'email', 'ciudad'], { distinct: true })
 *   .from('usuarios');
 * 
 * // Fila 1: ('Juan', 'juan@mail.com', 'Madrid')
 * // Fila 2: ('Juan', 'juan@mail.com', 'Madrid')  <- ELIMINADA (duplicado)
 * // Fila 3: ('Juan', 'juan@mail.com', 'Barcelona')  <- MANTENIDA (ciudad diferente)
 * // Fila 4: ('Juan', 'otro@mail.com', 'Madrid')  <- MANTENIDA (email diferente)
 * ```
 * 
 * **NULL y DISTINCT:**
 * 
 * ```javascript
 * // NULL se considera valor único
 * qb.select('telefono', { distinct: true }).from('contactos');
 * 
 * // Resultado:
 * // '555-1234'
 * // '555-5678'
 * // NULL         <- Solo un NULL en resultado, aunque haya múltiples
 * ```
 * 
 * **Compatibilidad:**
 * - PostgreSQL ✅ (soporte completo + DISTINCT ON)
 * - MySQL ✅
 * - SQL Server ✅
 * - Oracle ✅
 * - SQLite ✅
 * - MongoDB ⚠️ (distinct() como método separado)
 * 
 * @property {boolean} [all=false] - Especifica explícitamente mantener duplicados.
 * 
 * ALL es el comportamiento por defecto de SELECT. Especificarlo explícitamente
 * es redundante pero puede usarse para claridad del código.
 * 
 * **Comportamiento:**
 * - `false` o no especificado: Comportamiento estándar (mantiene duplicados)
 * - `true`: Añade palabra clave ALL explícitamente
 * 
 * **Sintaxis generada:**
 * ```sql
 * SELECT ALL columnas FROM tabla;
 * ```
 * 
 * **Relación con DISTINCT:**
 * - ALL y DISTINCT son mutuamente excluyentes
 * - Si ambos se especifican, DISTINCT tiene prioridad
 * - ALL es el comportamiento por defecto
 * 
 * **Cuándo usar ALL explícitamente:**
 * 
 * 1. **Claridad del código:**
 * ```javascript
 * // Hacer explícito que queremos duplicados
 * qb.select('producto_id', { all: true })
 *   .from('compras');
 * // Documenta la intención
 * ```
 * 
 * 2. **Generación dinámica de consultas:**
 * ```javascript
 * function generarConsulta(eliminarDuplicados) {
 *   return qb.select('categoria', {
 *     distinct: eliminarDuplicados,
 *     all: !eliminarDuplicados  // Explícito
 *   }).from('productos');
 * }
 * ```
 * 
 * 3. **Documentación en vistas:**
 * ```sql
 * -- Vista que documenta que duplicados son intencionales
 * CREATE VIEW todas_las_ventas AS
 * SELECT ALL producto_id, fecha, cantidad
 * FROM ventas;
 * ```
 * 
 * **Nota:** En la práctica, ALL raramente se usa ya que es el comportamiento
 * por defecto. Omitirlo es más común y conciso.
 * 
 * Compatibilidad:
 * - PostgreSQL ✅
 * - MySQL ✅
 * - SQL Server ✅
 * - Oracle ✅
 * - SQLite ✅
 * 
 * @example
 * // 1. SELECT básico sin opciones
 * qb.select('*').from('usuarios');
 * // Genera: SELECT * FROM usuarios;
 * 
 * @example
 * // 2. SELECT con DISTINCT
 * qb.select('pais', { distinct: true }).from('clientes');
 * // Genera: SELECT DISTINCT pais FROM clientes;
 * 
 * @example
 * // 3. DISTINCT con múltiples columnas
 * qb.select(['ciudad', 'estado'], { distinct: true })
 *   .from('direcciones');
 * // Genera: SELECT DISTINCT ciudad, estado FROM direcciones;
 * 
 * @example
 * // 4. Valores únicos con ordenamiento
 * qb.select('categoria', { distinct: true })
 *   .from('productos')
 *   .orderBy('categoria');
 * // Genera: SELECT DISTINCT categoria FROM productos ORDER BY categoria;
 * 
 * @example
 * // 5. DISTINCT en JOIN (eliminar duplicados)
 * qb.select('c.nombre', { distinct: true })
 *   .from('clientes c')
 *   .join('pedidos p', 'c.id', 'p.cliente_id')
 *   .where('p.total', '>', 1000);
 * // Genera: SELECT DISTINCT c.nombre 
 * //         FROM clientes c 
 * //         JOIN pedidos p ON c.id = p.cliente_id 
 * //         WHERE p.total > 1000;
 * 
 * @example
 * // 6. Contar valores únicos
 * async function contarValoresUnicos(tabla, columna) {
 *   // Método 1: DISTINCT
 *   const result1 = await qb
 *     .select(columna, { distinct: true })
 *     .from(tabla)
 *     .execute();
 *   console.log(`Valores únicos (DISTINCT): ${result1.length}`);
 *   
 *   // Método 2: COUNT(DISTINCT) - más eficiente
 *   const result2 = await qb
 *     .select(qb.raw(`COUNT(DISTINCT ${columna}) as total`))
 *     .from(tabla)
 *     .execute();
 *   console.log(`Valores únicos (COUNT): ${result2[0].total}`);
 * }
 * 
 * @example
 * // 7. Lista de valores únicos con filtro
 * async function obtenerCategoriasActivas() {
 *   return await qb
 *     .select('categoria', { distinct: true })
 *     .from('productos')
 *     .where('activo', '=', true)
 *     .where('stock', '>', 0)
 *     .orderBy('categoria')
 *     .execute();
 * }
 * 
 * @example
 * // 8. DISTINCT vs GROUP BY - comparación de rendimiento
 * async function compararRendimiento() {
 *   console.time('DISTINCT');
 *   const resultDistinct = await qb
 *     .select('categoria', { distinct: true })
 *     .from('productos')
 *     .execute();
 *   console.timeEnd('DISTINCT');
 *   
 *   console.time('GROUP BY');
 *   const resultGroupBy = await qb
 *     .select('categoria')
 *     .from('productos')
 *     .groupBy('categoria')
 *     .execute();
 *   console.timeEnd('GROUP BY');
 *   
 *   // GROUP BY suele ser más rápido con índices adecuados
 * }
 * 
 * @example
 * // 9. DISTINCT con funciones de agregación (incorrecto)
 * // ❌ ESTO NO FUNCIONA COMO ESPERADO:
 * qb.select(['categoria', 'COUNT(*) as total'], { distinct: true })
 *   .from('productos');
 * // DISTINCT aplicará a la fila completa (categoria + total)
 * 
 * // ✅ USAR GROUP BY EN SU LUGAR:
 * qb.select(['categoria', qb.raw('COUNT(*) as total')])
 *   .from('productos')
 *   .groupBy('categoria');
 * 
 * @example
 * // 10. Paginación con DISTINCT
 * async function obtenerPaginaDistinct(pagina, porPagina) {
 *   const offset = (pagina - 1) * porPagina;
 *   
 *   // Obtener total de valores únicos primero
 *   const totalResult = await qb
 *     .select(qb.raw('COUNT(DISTINCT categoria) as total'))
 *     .from('productos')
 *     .execute();
 *   
 *   const total = totalResult[0].total;
 *   
 *   // Obtener página de valores únicos
 *   const datos = await qb
 *     .select('categoria', { distinct: true })
 *     .from('productos')
 *     .orderBy('categoria')
 *     .limit(porPagina)
 *     .offset(offset)
 *     .execute();
 *   
 *   return {
 *     datos,
 *     pagina,
 *     porPagina,
 *     total,
 *     totalPaginas: Math.ceil(total / porPagina)
 *   };
 * }
 * 
 * @example
 * // 11. DISTINCT con subconsulta
 * qb.select('email', { distinct: true })
 *   .from(
 *     qb.select(['email', 'fecha_registro'])
 *       .from('usuarios')
 *       .where('activo', '=', true)
 *       .as('usuarios_activos')
 *   );
 * // Genera: SELECT DISTINCT email 
 * //         FROM (SELECT email, fecha_registro 
 * //               FROM usuarios 
 * //               WHERE activo = true) AS usuarios_activos;
 * 
 * @example
 * // 12. Análisis de rendimiento de DISTINCT
 * async function analizarDistinct(tabla, columna) {
 *   // Plan de ejecución con DISTINCT
 *   const planDistinct = await qb.raw(`
 *     EXPLAIN ANALYZE
 *     SELECT DISTINCT ${columna} FROM ${tabla}
 *   `).execute();
 *   
 *   console.log('Plan DISTINCT:', planDistinct);
 *   
 *   // Plan de ejecución con GROUP BY
 *   const planGroupBy = await qb.raw(`
 *     EXPLAIN ANALYZE
 *     SELECT ${columna} FROM ${tabla} GROUP BY ${columna}
 *   `).execute();
 *   
 *   console.log('Plan GROUP BY:', planGroupBy);
 *   
 *   // Comparar costos y tiempos
 * }
 * 
 * @example
 * // 13. DISTINCT con UNION (eliminar duplicados entre consultas)
 * const consulta1 = qb
 *   .select('email')
 *   .from('clientes')
 *   .where('tipo', '=', 'premium');
 * 
 * const consulta2 = qb
 *   .select('email')
 *   .from('clientes')
 *   .where('activo', '=', true);
 * 
 * // UNION ya elimina duplicados por defecto (equivale a DISTINCT)
 * const resultadoUnion = consulta1.union(consulta2);
 * 
 * // UNION ALL mantiene duplicados
 * const resultadoUnionAll = consulta1.unionAll(consulta2);
 * 
 * // DISTINCT adicional sobre UNION (redundante)
 * qb.select('email', { distinct: true })
 *   .from(resultadoUnion.as('emails_combinados'));
 * 
 * @example
 * // 14. Sistema de filtros dinámicos con DISTINCT
 * async function buscarConFiltros(filtros) {
 *   let query = qb.select('nombre', 'email');
 *   
 *   // Aplicar filtros dinámicos
 *   if (filtros.categoria) {
 *     query = query.where('categoria', '=', filtros.categoria);
 *   }
 *   
 *   if (filtros.activo !== undefined) {
 *     query = query.where('activo', '=', filtros.activo);
 *   }
 *   
 *   // Si hay JOINs, puede haber duplicados
 *   if (filtros.conPedidos) {
 *     query = query
 *       .join('pedidos', 'usuarios.id', 'pedidos.usuario_id')
 *       .select('nombre', 'email', { distinct: true }); // Eliminar duplicados
 *   }
 *   
 *   query = query.from('usuarios');
 *   
 *   return await query.execute();
 * }
 * 
 * @see {@link QueryBuilder#select} - Método para crear consultas SELECT
 * @see {@link QueryBuilder#from} - Especificar tabla(s) de origen
 * @see {@link QueryBuilder#where} - Filtrar resultados
 * @see {@link QueryBuilder#groupBy} - Agrupar resultados (alternativa a DISTINCT)
 */

/**
 * Nombre de una tabla o vista de base de datos.
 * 
 * Las tablas son las estructuras fundamentales para almacenar datos en bases de datos
 * relacionales. Este tipo representa el nombre de una tabla o vista que puede ser
 * consultada o manipulada mediante SQL.
 * 
 * **¿QUÉ ES UNA TABLA?**
 * 
 * Una tabla es una colección estructurada de datos organizados en filas y columnas:
 * - **Filas (registros)**: Cada fila representa una instancia de datos
 * - **Columnas (campos)**: Cada columna representa un atributo específico
 * - **Celdas**: Intersección de fila y columna (un valor)
 * 
 * **FORMATO COMPLETO DE NOMBRES:**
 * 
 * Los nombres de tabla pueden especificarse en varios formatos según el contexto:
 * 
 * 1. **Nombre simple:**
 *    ```javascript
 *    'usuarios'
 *    'productos'
 *    'pedidos'
 *    ```
 * 
 * 2. **Con esquema/base de datos:**
 *    ```javascript
 *    'public.usuarios'         // PostgreSQL
 *    'mibd.productos'          // MySQL
 *    'dbo.pedidos'             // SQL Server
 *    'HR.EMPLOYEES'            // Oracle
 *    ```
 * 
 * 3. **Formato completo (catálogo.esquema.tabla):**
 *    ```javascript
 *    'database.schema.table'   // SQL Server
 *    'catalog.schema.table'    // Algunos SGBDs
 *    ```
 * 
 * **CONVENCIONES DE NOMBRES:**
 * 
 * **Estilo singular vs plural:**
 * - **Plural**: `usuarios`, `productos`, `pedidos` (más común)
 * - **Singular**: `usuario`, `producto`, `pedido` (ORM como Rails)
 * 
 * **Casos de escritura:**
 * - **snake_case**: `orden_detalle`, `cliente_direccion` (recomendado SQL)
 * - **PascalCase**: `OrdenDetalle`, `ClienteDireccion` (SQL Server)
 * - **camelCase**: `ordenDetalle`, `clienteDireccion` (menos común)
 * - **lowercase**: `ordendetalle`, `clientedireccion` (PostgreSQL sin comillas)
 * 
 * **Prefijos comunes:**
 * - `tbl_`: `tbl_usuarios`, `tbl_productos` (legacy)
 * - `t_`: `t_usuarios`, `t_productos` (legacy)
 * - Sin prefijo: `usuarios`, `productos` (moderno, recomendado)
 * 
 * **Sufijos por tipo:**
 * - `_log`: `usuarios_log`, `pedidos_log` (tablas de auditoría)
 * - `_tmp`: `datos_tmp`, `proceso_tmp` (tablas temporales)
 * - `_backup`: `usuarios_backup` (backups)
 * - `_staging`: `datos_staging` (ETL/staging)
 * - `_history`: `pedidos_history` (históricos)
 * 
 * **RESTRICCIONES DE NOMBRES:**
 * 
 * **Caracteres permitidos:**
 * - Letras: a-z, A-Z
 * - Números: 0-9 (generalmente no al inicio)
 * - Guión bajo: _ (separador recomendado)
 * - Algunos SGBDs: $ # @ (con restricciones)
 * 
 * **Longitud máxima:**
 * - PostgreSQL: 63 caracteres
 * - MySQL: 64 caracteres
 * - SQL Server: 128 caracteres
 * - Oracle: 30 caracteres (hasta 11g) / 128 caracteres (12c+)
 * - SQLite: Sin límite práctico
 * 
 * **Caracteres a evitar:**
 * - Espacios (requieren delimitadores)
 * - Guiones: `-` (se interpreta como operador resta)
 * - Caracteres especiales: `@`, `#`, `$` (problemas compatibilidad)
 * - Acentos y ñ (problemas de encoding)
 * 
 * **Palabras reservadas SQL (evitar):**
 * - `SELECT`, `INSERT`, `UPDATE`, `DELETE`
 * - `FROM`, `WHERE`, `JOIN`, `ORDER`
 * - `TABLE`, `VIEW`, `INDEX`
 * - `USER`, `GROUP`, `ROLE`
 * - Si se necesita usar, delimitar con comillas
 * 
 * **CASE SENSITIVITY:**
 * 
 * **PostgreSQL:**
 * - Sin comillas → convierte a minúsculas
 * - Con comillas → preserva case exacto
 * ```sql
 * CREATE TABLE Usuarios (...);    -- Se crea como "usuarios"
 * CREATE TABLE "Usuarios" (...);  -- Se crea como "Usuarios"
 * SELECT * FROM usuarios;         -- Funciona
 * SELECT * FROM Usuarios;         -- Funciona (se convierte a minúsculas)
 * SELECT * FROM "Usuarios";       -- Solo funciona si se creó con comillas
 * ```
 * 
 * **MySQL:**
 * - Depende del sistema operativo:
 *   * Linux: Case-sensitive
 *   * Windows/Mac: Case-insensitive
 * - Variable: `lower_case_table_names`
 * 
 * **SQL Server:**
 * - Case-insensitive por defecto (depende de collation)
 * 
 * **Oracle:**
 * - Sin comillas → UPPERCASE
 * - Con comillas → preserva case
 * 
 * **SQLite:**
 * - Case-insensitive
 * 
 * **TIPOS DE TABLAS:**
 * 
 * **1. Tablas permanentes:**
 * - Almacenamiento persistente
 * - Se mantienen entre sesiones
 * - La mayoría de tablas son permanentes
 * 
 * **2. Tablas temporales:**
 * ```sql
 * -- PostgreSQL/MySQL
 * CREATE TEMPORARY TABLE temp_datos (...);
 * 
 * -- SQL Server
 * CREATE TABLE #temp_datos (...);    -- Local temporal
 * CREATE TABLE ##temp_datos (...);   -- Global temporal
 * ```
 * 
 * **3. Tablas en memoria:**
 * ```sql
 * -- MySQL
 * CREATE TABLE cache_data (...) ENGINE=MEMORY;
 * ```
 * 
 * **4. Vistas:**
 * - Consultas guardadas que se comportan como tablas
 * - No almacenan datos (virtual)
 * - Pueden usarse igual que tablas en FROM
 * 
 * **5. Vistas materializadas:**
 * - Almacenan resultados físicamente
 * - Mejor rendimiento que vistas normales
 * - Requieren refresco periódico
 * 
 * **6. CTEs (Common Table Expressions):**
 * - Tablas temporales dentro de una consulta
 * - Con WITH clause
 * 
 * **ESQUEMAS Y NAMESPACES:**
 * 
 * **PostgreSQL:**
 * - Esquema por defecto: `public`
 * - Crear esquemas: `CREATE SCHEMA ventas;`
 * - Usar tabla: `ventas.pedidos`
 * - Search path: `SET search_path TO ventas, public;`
 * 
 * **MySQL:**
 * - "Schema" = "Database" (sinónimos)
 * - Cambiar base datos: `USE nombre_bd;`
 * - Especificar BD: `nombre_bd.tabla`
 * 
 * **SQL Server:**
 * - Esquema por defecto: `dbo`
 * - Esquemas organizan objetos en base de datos
 * - Formato: `esquema.tabla` o `bd.esquema.tabla`
 * 
 * **Oracle:**
 * - Usuario = esquema automáticamente
 * - Cada usuario tiene su esquema
 * - Acceso: `USUARIO.TABLA`
 * 
 * **VALIDACIÓN DE NOMBRES:**
 * 
 * ```javascript
 * function validarNombreTabla(nombre, sgbd = 'postgresql') {
 *   const limits = {
 *     postgresql: 63,
 *     mysql: 64,
 *     sqlserver: 128,
 *     oracle: 128,
 *     sqlite: Infinity
 *   };
 *   
 *   const maxLength = limits[sgbd] || 63;
 *   
 *   // Longitud
 *   if (nombre.length === 0 || nombre.length > maxLength) {
 *     throw new Error(`Nombre debe tener entre 1 y ${maxLength} caracteres`);
 *   }
 *   
 *   // Caracteres válidos (sin esquema)
 *   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(nombre.split('.').pop())) {
 *     throw new Error('Nombre inválido. Use letras, números y _');
 *   }
 *   
 *   // Palabras reservadas
 *   const reservadas = ['select', 'from', 'where', 'table', 'view', 'user', 'group'];
 *   if (reservadas.includes(nombre.toLowerCase())) {
 *     console.warn(`"${nombre}" es palabra reservada. Considere usar comillas.`);
 *   }
 *   
 *   return true;
 * }
 * ```
 * 
 * **MEJORES PRÁCTICAS:**
 * 
 * 1. **Nombres descriptivos**: `pedidos` mejor que `ped` o `p`
 * 2. **Consistencia**: Misma convención en toda la BD
 * 3. **Plural para colecciones**: `usuarios`, `productos`
 * 4. **snake_case minúsculas**: Máxima compatibilidad
 * 5. **Evitar palabras reservadas**: Sin `order`, `user`, `group`
 * 6. **Sin prefijos tipo**: No `tbl_`, `t_` (redundante)
 * 7. **Especificar esquema en ambigüedades**: `public.usuarios`
 * 8. **Documentar propósito**: Comentarios en tablas
 * 
 * @global
 * @typedef {string} types.tableName
 * 
 * @example
 * // 1. Nombre simple
 * qb.select('*').from('usuarios');
 * // Genera: SELECT * FROM usuarios;
 * 
 * @example
 * // 2. Con esquema
 * qb.select('*').from('public.productos');
 * // Genera: SELECT * FROM public.productos;
 * 
 * @example
 * // 3. Múltiples tablas
 * qb.select('*').from(['usuarios', 'pedidos', 'productos']);
 * 
 * @example
 * // 4. Tabla con alias
 * qb.select('u.nombre', 'u.email')
 *   .from('usuarios', 'u');
 * // Genera: SELECT u.nombre, u.email FROM usuarios AS u;
 * 
 * @example
 * // 5. JOIN entre tablas
 * qb.select('u.nombre', 'p.titulo')
 *   .from('usuarios', 'u')
 *   .join('pedidos p', 'u.id', 'p.usuario_id');
 * 
 * @example
 * // 6. Validar y normalizar nombre de tabla
 * function normalizarNombreTabla(nombre) {
 *   // Convertir a lowercase y reemplazar espacios
 *   let normalizado = nombre.toLowerCase().replace(/\s+/g, '_');
 *   
 *   // Remover caracteres inválidos
 *   normalizado = normalizado.replace(/[^a-z0-9_.]/g, '');
 *   
 *   // Asegurar que no empieza con número
 *   if (/^\d/.test(normalizado)) {
 *     normalizado = 'table_' + normalizado;
 *   }
 *   
 *   // Truncar si es muy largo (PostgreSQL: 63)
 *   if (normalizado.length > 63) {
 *     normalizado = normalizado.substring(0, 63);
 *   }
 *   
 *   return normalizado;
 * }
 * 
 * const tabla1 = normalizarNombreTabla('Tabla de Usuarios');
 * console.log(tabla1); // "tabla_de_usuarios"
 * 
 * const tabla2 = normalizarNombreTabla('123 Datos');
 * console.log(tabla2); // "table_123_datos"
 * 
 * @example
 * // 7. Sistema de nombres por módulo
 * const TABLAS = {
 *   // Módulo de usuarios
 *   USUARIOS: 'usuarios',
 *   USUARIOS_ROLES: 'usuarios_roles',
 *   USUARIOS_PERMISOS: 'usuarios_permisos',
 *   
 *   // Módulo de productos
 *   PRODUCTOS: 'productos',
 *   CATEGORIAS: 'categorias',
 *   INVENTARIO: 'inventario',
 *   
 *   // Módulo de ventas
 *   PEDIDOS: 'pedidos',
 *   PEDIDOS_DETALLE: 'pedidos_detalle',
 *   FACTURAS: 'facturas',
 *   
 *   // Auditoría
 *   USUARIOS_LOG: 'usuarios_log',
 *   PEDIDOS_LOG: 'pedidos_log'
 * };
 * 
 * // Uso
 * qb.select('*').from(TABLAS.USUARIOS);
 * 
 * @example
 * // 8. Tablas con esquemas múltiples
 * async function consultarMultiEsquema() {
 *   // Tabla en esquema público
 *   const publicos = await qb
 *     .select('*')
 *     .from('public.usuarios')
 *     .execute();
 *   
 *   // Tabla en esquema de ventas
 *   const ventas = await qb
 *     .select('*')
 *     .from('ventas.pedidos')
 *     .execute();
 *   
 *   // Tabla en esquema de auditoría
 *   const logs = await qb
 *     .select('*')
 *     .from('auditoria.logs')
 *     .execute();
 *   
 *   return { publicos, ventas, logs };
 * }
 * 
 * @example
 * // 9. Verificar existencia de tabla
 * async function tablaExiste(nombreTabla) {
 *   // PostgreSQL
 *   const result = await qb.raw(`
 *     SELECT EXISTS (
 *       SELECT FROM information_schema.tables 
 *       WHERE table_schema = 'public'
 *         AND table_name = $1
 *     ) as existe
 *   `, [nombreTabla]).execute();
 *   
 *   return result[0].existe;
 * }
 * 
 * if (await tablaExiste('usuarios')) {
 *   console.log('✅ Tabla usuarios existe');
 * } else {
 *   console.log('❌ Tabla usuarios NO existe');
 * }
 * 
 * @example
 * // 10. Listar todas las tablas de la base de datos
 * async function listarTablas() {
 *   // PostgreSQL
 *   const tablas = await qb.raw(`
 *     SELECT 
 *       table_schema as esquema,
 *       table_name as tabla,
 *       table_type as tipo
 *     FROM information_schema.tables
 *     WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
 *     ORDER BY table_schema, table_name
 *   `).execute();
 *   
 *   console.log('=== TABLAS EN LA BASE DE DATOS ===\n');
 *   
 *   const porEsquema = {};
 *   for (const t of tablas) {
 *     if (!porEsquema[t.esquema]) {
 *       porEsquema[t.esquema] = [];
 *     }
 *     porEsquema[t.esquema].push({
 *       nombre: t.tabla,
 *       tipo: t.tipo
 *     });
 *   }
 *   
 *   for (const [esquema, tables] of Object.entries(porEsquema)) {
 *     console.log(`Esquema: ${esquema} (${tables.length} tablas)`);
 *     for (const t of tables) {
 *       const icono = t.tipo === 'BASE TABLE' ? '📋' : '👁️';
 *       console.log(`  ${icono} ${t.nombre} [${t.tipo}]`);
 *     }
 *     console.log();
 *   }
 * }
 * 
 * @see {@link types.alias} - Para alias de tablas
 * @see {@link QueryBuilder#from} - Para especificar tabla(s) de origen
 * @see {@link QueryBuilder#join} - Para unir tablas
 * @see {@link QueryBuilder#createTable} - Para crear tablas
 */

/**
 * Alias o nombre alternativo para una tabla en consultas SQL.
 * 
 * Los alias permiten referenciar tablas con nombres cortos o alternativos,
 * facilitando la escritura de consultas complejas y resolviendo ambigüedades
 * cuando hay múltiples tablas con columnas del mismo nombre.
 * 
 * **¿QUÉ ES UN ALIAS?**
 * 
 * Un alias es un nombre temporal asignado a una tabla dentro del contexto
 * de una consulta específica. No cambia el nombre real de la tabla en la
 * base de datos.
 * 
 * **SINTAXIS SQL:**
 * ```sql
 * SELECT * FROM tabla AS alias;
 * SELECT * FROM tabla alias;        -- AS es opcional
 * ```
 * 
 * **CUÁNDO USAR ALIAS:**
 * 
 * 1. **JOINs con múltiples tablas:**
 * ```sql
 * SELECT u.nombre, p.titulo
 * FROM usuarios u
 * JOIN pedidos p ON u.id = p.usuario_id;
 * ```
 * 
 * 2. **Nombres de tabla largos:**
 * ```sql
 * SELECT c.*
 * FROM configuracion_sistema_parametros c
 * WHERE c.activo = true;
 * ```
 * 
 * 3. **Auto-JOIN (tabla consigo misma):**
 * ```sql
 * SELECT e1.nombre, e2.nombre AS supervisor
 * FROM empleados e1
 * JOIN empleados e2 ON e1.supervisor_id = e2.id;
 * ```
 * 
 * 4. **Subconsultas:**
 * ```sql
 * SELECT *
 * FROM (SELECT * FROM usuarios WHERE activo = true) u
 * WHERE u.edad > 18;
 * ```
 * 
 * 5. **Resolver ambigüedades:**
 * ```sql
 * -- Ambiguo (ambas tablas tienen columna 'id')
 * SELECT id FROM usuarios, pedidos;  -- ❌ Error
 * 
 * -- Claro con alias
 * SELECT u.id, p.id FROM usuarios u, pedidos p;  -- ✅ Correcto
 * ```
 * 
 * **CONVENCIONES DE NOMBRES:**
 * 
 * **Abreviaciones comunes:**
 * - Primera letra: `u` para `usuarios`, `p` para `productos`
 * - Iniciales: `usr` para `usuarios`, `prod` para `productos`
 * - Números: `t1`, `t2`, `t3` (genérico, poco descriptivo)
 * - Descriptivos cortos: `user`, `prod`, `ord`
 * 
 * **Ejemplos por tipo:**
 * ```javascript
 * // Una letra (tablas simples, JOINs cortos)
 * .from('usuarios', 'u')
 * .from('productos', 'p')
 * 
 * // Abreviación (claridad vs brevedad)
 * .from('clientes', 'cli')
 * .from('pedidos', 'ped')
 * .from('facturas', 'fac')
 * 
 * // Descriptivos (auto-joins, claridad)
 * .from('empleados', 'empleado')
 * .from('empleados', 'supervisor')  // Segunda instancia
 * 
 * // Con números (múltiples instancias)
 * .from('categorias', 'cat1')
 * .from('categorias', 'cat2')
 * ```
 * 
 * **REGLAS Y RESTRICCIONES:**
 * 
 * 1. **Scope del alias:**
 *    - Solo válido en la consulta donde se define
 *    - No persiste entre consultas
 *    - No modifica estructura de la base de datos
 * 
 * 2. **Unicidad:**
 *    - Cada alias debe ser único en la consulta
 *    - No puede haber dos alias iguales
 *    - Puede coincidir con nombre real de otra tabla
 * 
 * 3. **Obligatoriedad:**
 *    - Opcional en consultas simples
 *    - Requerido en auto-joins
 *    - Recomendado en consultas complejas
 * 
 * 4. **Case sensitivity:**
 *    - Mismas reglas que nombres de tabla
 *    - PostgreSQL: minúsculas sin comillas
 *    - MySQL: depende de configuración
 *    - SQL Server: case-insensitive generalmente
 * 
 * 5. **Caracteres permitidos:**
 *    - Mismos que nombres de tabla
 *    - Letras, números, guión bajo
 *    - Debe empezar con letra o guión bajo
 * 
 * **USO CON COLUMNAS:**
 * 
 * Una vez definido el alias, DEBE usarse para referenciar columnas:
 * 
 * ```sql
 * -- ❌ Incorrecto después de definir alias
 * SELECT * FROM usuarios AS u WHERE usuarios.activo = true;
 * 
 * -- ✅ Correcto
 * SELECT * FROM usuarios AS u WHERE u.activo = true;
 * ```
 * 
 * **ALIAS EN DIFERENTES CONTEXTOS:**
 * 
 * **FROM:**
 * ```sql
 * SELECT * FROM usuarios u;
 * ```
 * 
 * **JOIN:**
 * ```sql
 * SELECT u.*, p.*
 * FROM usuarios u
 * JOIN pedidos p ON u.id = p.usuario_id;
 * ```
 * 
 * **Subconsulta:**
 * ```sql
 * SELECT activos.*
 * FROM (SELECT * FROM usuarios WHERE activo = true) activos;
 * ```
 * 
 * **WITH (CTE):**
 * ```sql
 * WITH usuarios_activos AS (
 *   SELECT * FROM usuarios WHERE activo = true
 * )
 * SELECT * FROM usuarios_activos ua;
 * ```
 * 
 * **MEJORES PRÁCTICAS:**
 * 
 * 1. **Consistencia**: Usar misma convención en toda la aplicación
 * 2. **Claridad**: Preferir descriptivos en código complejo
 * 3. **Brevedad**: Una letra OK en consultas simples
 * 4. **Significado**: Alias debe reflejar propósito de la tabla
 * 5. **Documentar**: Comentar alias no obvios
 * 6. **Evitar confusión**: No usar alias igual a nombre de otra tabla
 * 7. **Auto-joins**: Usar alias descriptivos (empleado/supervisor)
 * 
 * @global
 * @typedef {string} types.alias
 * 
 * @example
 * // 1. Alias simple
 * qb.select('u.nombre', 'u.email')
 *   .from('usuarios', 'u');
 * // Genera: SELECT u.nombre, u.email FROM usuarios AS u;
 * 
 * @example
 * // 2. JOIN con alias
 * qb.select('u.nombre', 'p.titulo', 'p.total')
 *   .from('usuarios', 'u')
 *   .join('pedidos p', 'u.id', 'p.usuario_id');
 * // Genera: SELECT u.nombre, p.titulo, p.total
 * //         FROM usuarios AS u
 * //         JOIN pedidos AS p ON u.id = p.usuario_id;
 * 
 * @example
 * // 3. Auto-JOIN con alias descriptivos
 * qb.select('empleado.nombre', 'supervisor.nombre AS supervisor')
 *   .from('empleados', 'empleado')
 *   .join('empleados supervisor', 'empleado.supervisor_id', 'supervisor.id');
 * // Genera: SELECT empleado.nombre, supervisor.nombre AS supervisor
 * //         FROM empleados AS empleado
 * //         JOIN empleados AS supervisor ON empleado.supervisor_id = supervisor.id;
 * 
 * @example
 * // 4. Múltiples tablas con alias
 * qb.select('u.nombre', 'p.titulo', 'c.nombre AS categoria')
 *   .from('usuarios', 'u')
 *   .join('productos p', 'p.usuario_id', 'u.id')
 *   .join('categorias c', 'c.id', 'p.categoria_id');
 * 
 * @example
 * // 5. Subconsulta con alias
 * const subquery = qb
 *   .select('usuario_id', qb.raw('COUNT(*) as total'))
 *   .from('pedidos')
 *   .groupBy('usuario_id')
 *   .as('stats');
 * 
 * qb.select('u.nombre', 's.total')
 *   .from('usuarios', 'u')
 *   .join(subquery, 'u.id', 's.usuario_id');
 * 
 * @example
 * // 6. Alias con esquema
 * qb.select('v.nombre', 'v.precio')
 *   .from('ventas.productos', 'v')
 *   .join('inventario.stock s', 'v.id', 's.producto_id');
 * 
 * @example
 * // 7. Sistema de alias consistente
 * const ALIAS = {
 *   USUARIOS: 'u',
 *   PRODUCTOS: 'p',
 *   PEDIDOS: 'ped',
 *   CATEGORIAS: 'cat',
 *   DIRECCIONES: 'dir',
 *   FACTURAS: 'fac'
 * };
 * 
 * // Uso consistente en la aplicación
 * function consultarPedidos() {
 *   return qb
 *     .select(`${ALIAS.USUARIOS}.nombre`, `${ALIAS.PEDIDOS}.total`)
 *     .from('usuarios', ALIAS.USUARIOS)
 *     .join(`pedidos ${ALIAS.PEDIDOS}`, 
 *       `${ALIAS.USUARIOS}.id`, 
 *       `${ALIAS.PEDIDOS}.usuario_id`);
 * }
 * 
 * @example
 * // 8. Consulta compleja con múltiples alias
 * async function reporteVentasCompleto() {
 *   return await qb
 *     .select(
 *       'u.nombre AS usuario',
 *       'p.titulo AS producto',
 *       'ped.fecha',
 *       'ped.total',
 *       'cat.nombre AS categoria',
 *       'dir.ciudad'
 *     )
 *     .from('usuarios', 'u')
 *     .join('pedidos ped', 'u.id', 'ped.usuario_id')
 *     .join('pedidos_detalle pd', 'ped.id', 'pd.pedido_id')
 *     .join('productos p', 'pd.producto_id', 'p.id')
 *     .join('categorias cat', 'p.categoria_id', 'cat.id')
 *     .join('direcciones dir', 'u.id', 'dir.usuario_id')
 *     .where('ped.fecha', '>=', '2024-01-01')
 *     .orderBy('ped.fecha', 'desc')
 *     .execute();
 * }
 * 
 * @example
 * // 9. Jerarquía organizacional con auto-join
 * async function obtenerJerarquia() {
 *   return await qb
 *     .select(
 *       'emp.id',
 *       'emp.nombre AS empleado',
 *       'emp.puesto',
 *       'sup.nombre AS supervisor',
 *       'dir.nombre AS director'
 *     )
 *     .from('empleados', 'emp')
 *     .leftJoin('empleados sup', 'emp.supervisor_id', 'sup.id')
 *     .leftJoin('empleados dir', 'sup.supervisor_id', 'dir.id')
 *     .orderBy('emp.nombre')
 *     .execute();
 * }
 * 
 * @example
 * // 10. Validación de alias
 * function validarAlias(alias) {
 *   // Debe empezar con letra o guión bajo
 *   if (!/^[a-zA-Z_]/.test(alias)) {
 *     throw new Error('Alias debe empezar con letra o _');
 *   }
 *   
 *   // Solo letras, números y guión bajo
 *   if (!/^[a-zA-Z0-9_]+$/.test(alias)) {
 *     throw new Error('Alias solo puede contener letras, números y _');
 *   }
 *   
 *   // No debe ser palabra reservada
 *   const reservadas = ['select', 'from', 'where', 'join', 'table'];
 *   if (reservadas.includes(alias.toLowerCase())) {
 *     throw new Error(`"${alias}" es palabra reservada SQL`);
 *   }
 *   
 *   // Longitud razonable
 *   if (alias.length > 30) {
 *     console.warn('Alias muy largo, considere abreviarlo');
 *   }
 *   
 *   return true;
 * }
 * 
 * @see {@link types.tabla} - Para nombres de tablas
 * @see {@link QueryBuilder#from} - Para especificar tabla con alias
 * @see {@link QueryBuilder#join} - Para unir tablas con alias
 * @see {@link QueryBuilder#as} - Para asignar alias a subconsultas
 */

/**
 * Expresión de condición o predicado SQL para cláusulas WHERE, HAVING y condicionales.
 * 
 * Un predicado es una expresión que evalúa a verdadero (TRUE), falso (FALSE) o
 * desconocido (NULL) y se utiliza para filtrar filas en consultas SQL. Es el
 * componente fundamental de las cláusulas WHERE, HAVING, JOIN ON, y CASE WHEN.
 * 
 * **¿QUÉ ES UN PREDICADO?**
 * 
 * Un predicado es una expresión booleana que compara valores y determina qué
 * filas incluir o excluir del resultado. Puede ser:
 * - Una comparación simple: `'edad > 18'`
 * - Múltiples condiciones: `'edad > 18 AND activo = true'`
 * - Subconsultas: `'id IN (SELECT ...)'`
 * - Expresiones complejas: `'(precio * cantidad) > 1000'`
 * 
 * **TIPOS DE PREDICADOS:**
 * 
 * **1. Comparación:**
 * ```sql
 * edad = 25
 * salario > 50000
 * precio <= 100
 * nombre != 'Admin'
 * codigo <> 'TEMP'
 * ```
 * 
 * **2. Rangos:**
 * ```sql
 * edad BETWEEN 18 AND 65
 * fecha BETWEEN '2024-01-01' AND '2024-12-31'
 * precio NOT BETWEEN 100 AND 500
 * ```
 * 
 * **3. Conjuntos (IN):**
 * ```sql
 * estado IN ('activo', 'pendiente', 'procesando')
 * id IN (1, 2, 3, 4, 5)
 * categoria IN (SELECT id FROM categorias_permitidas)
 * pais NOT IN ('US', 'CA', 'MX')
 * ```
 * 
 * **4. Patrones (LIKE):**
 * ```sql
 * nombre LIKE 'Juan%'           -- Empieza con Juan
 * email LIKE '%@gmail.com'      -- Termina con @gmail.com
 * codigo LIKE 'PRD_%'           -- Patrón específico
 * texto LIKE '%buscar%'         -- Contiene palabra
 * nombre NOT LIKE 'Admin%'      -- No empieza con Admin
 * ```
 * 
 * **5. Expresiones regulares (algunos SGBDs):**
 * ```sql
 * -- PostgreSQL
 * email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
 * codigo ~* '^PRD-\d{4}$'       -- Case insensitive
 * 
 * -- MySQL
 * nombre REGEXP '^[A-Z][a-z]+'
 * ```
 * 
 * **6. NULL:**
 * ```sql
 * telefono IS NULL
 * email IS NOT NULL
 * COALESCE(telefono, '') != ''
 * ```
 * 
 * **7. Existencia (EXISTS):**
 * ```sql
 * EXISTS (SELECT 1 FROM pedidos WHERE usuario_id = usuarios.id)
 * NOT EXISTS (SELECT 1 FROM suspensiones WHERE usuario_id = usuarios.id)
 * ```
 * 
 * **8. Lógicos (AND, OR, NOT):**
 * ```sql
 * edad > 18 AND activo = true
 * categoria = 'premium' OR puntos > 1000
 * NOT (estado = 'suspendido' OR eliminado = true)
 * (precio > 100 AND stock > 0) OR destacado = true
 * ```
 * 
 * **9. Comparación de cadenas:**
 * ```sql
 * nombre = 'Juan'
 * LOWER(email) = 'admin@example.com'
 * UPPER(codigo) LIKE 'PRD%'
 * LENGTH(password) >= 8
 * ```
 * 
 * **10. Comparación de fechas:**
 * ```sql
 * fecha_creacion > '2024-01-01'
 * fecha_expiracion < NOW()
 * EXTRACT(YEAR FROM fecha) = 2024
 * DATE_PART('month', fecha) = 12
 * edad_en_dias > CURRENT_DATE - INTERVAL '30 days'
 * ```
 * 
 * **11. Matemáticos:**
 * ```sql
 * (precio * cantidad) > 1000
 * descuento BETWEEN 10 AND 50
 * MOD(id, 2) = 0                -- IDs pares
 * ROUND(precio, 2) = 99.99
 * ```
 * 
 * **12. Subconsultas:**
 * ```sql
 * id IN (SELECT usuario_id FROM pedidos WHERE total > 1000)
 * precio > (SELECT AVG(precio) FROM productos)
 * stock < (SELECT MIN(stock_minimo) FROM configuracion)
 * ```
 * 
 * **OPERADORES DE COMPARACIÓN:**
 * 
 * - `=`: Igual
 * - `!=` o `<>`: Diferente
 * - `>`: Mayor que
 * - `<`: Menor que
 * - `>=`: Mayor o igual
 * - `<=`: Menor o igual
 * - `BETWEEN ... AND ...`: En rango
 * - `IN (...)`: En conjunto
 * - `LIKE`: Patrón de texto
 * - `IS NULL`: Es nulo
 * - `IS NOT NULL`: No es nulo
 * - `EXISTS`: Existe subconsulta
 * 
 * **OPERADORES LÓGICOS:**
 * 
 * - `AND`: Ambas condiciones verdaderas
 * - `OR`: Al menos una condición verdadera
 * - `NOT`: Negación
 * - `XOR`: Una u otra pero no ambas (MySQL)
 * 
 * **PRECEDENCIA DE OPERADORES:**
 * 
 * De mayor a menor precedencia:
 * 1. Paréntesis `()`
 * 2. Comparación: `=`, `!=`, `<`, `>`, `<=`, `>=`
 * 3. `NOT`
 * 4. `AND`
 * 5. `OR`
 * 
 * ```sql
 * -- Sin paréntesis (AND tiene mayor precedencia)
 * estado = 'activo' OR categoria = 'premium' AND puntos > 1000
 * -- Equivale a: estado = 'activo' OR (categoria = 'premium' AND puntos > 1000)
 * 
 * -- Con paréntesis (forzar precedencia)
 * (estado = 'activo' OR categoria = 'premium') AND puntos > 1000
 * ```
 * 
 * **LÓGICA DE TRES VALORES (NULL):**
 * 
 * SQL usa lógica de tres valores: TRUE, FALSE, UNKNOWN (NULL)
 * 
 * ```
 * TRUE AND NULL = NULL
 * FALSE AND NULL = FALSE
 * TRUE OR NULL = TRUE
 * FALSE OR NULL = NULL
 * NOT NULL = NULL
 * ```
 * 
 * **Implicaciones:**
 * ```sql
 * -- edad puede ser NULL
 * SELECT * FROM usuarios WHERE edad > 18;
 * -- No incluye filas donde edad IS NULL
 * 
 * -- Para incluir NULL:
 * SELECT * FROM usuarios WHERE edad > 18 OR edad IS NULL;
 * 
 * -- Comparación con NULL siempre da NULL (no FALSE)
 * SELECT * FROM usuarios WHERE edad = NULL;  -- ❌ NO funciona
 * SELECT * FROM usuarios WHERE edad IS NULL; -- ✅ Correcto
 * ```
 * 
 * **OPTIMIZACIÓN DE PREDICADOS:**
 * 
 * **1. Usar índices:**
 * ```sql
 * -- ✅ Puede usar índice en columna_indexada
 * WHERE columna_indexada = 'valor'
 * 
 * -- ❌ NO puede usar índice (función en columna)
 * WHERE UPPER(columna_indexada) = 'VALOR'
 * 
 * -- ✅ Mejor: índice funcional o transformar valor
 * WHERE columna_indexada = LOWER('VALOR')
 * ```
 * 
 * **2. Selectividad:**
 * ```sql
 * -- ✅ Alta selectividad primero (AND)
 * WHERE id = 12345 AND categoria = 'premium'
 * 
 * -- ❌ Baja selectividad primero
 * WHERE categoria = 'premium' AND id = 12345
 * ```
 * 
 * **3. Evitar funciones en columnas:**
 * ```sql
 * -- ❌ LENTO: función impide uso de índice
 * WHERE YEAR(fecha_creacion) = 2024
 * 
 * -- ✅ RÁPIDO: puede usar índice en fecha_creacion
 * WHERE fecha_creacion >= '2024-01-01' 
 *   AND fecha_creacion < '2025-01-01'
 * ```
 * 
 * **4. IN vs OR:**
 * ```sql
 * -- ✅ Generalmente más eficiente
 * WHERE id IN (1, 2, 3, 4, 5)
 * 
 * -- ❌ Menos eficiente (pero equivalente)
 * WHERE id = 1 OR id = 2 OR id = 3 OR id = 4 OR id = 5
 * ```
 * 
 * **5. EXISTS vs IN con subconsultas:**
 * ```sql
 * -- ✅ Más eficiente (se detiene al encontrar primera coincidencia)
 * WHERE EXISTS (SELECT 1 FROM pedidos WHERE usuario_id = usuarios.id)
 * 
 * -- ⚠️ Puede ser más lento (materializa resultados)
 * WHERE id IN (SELECT usuario_id FROM pedidos)
 * ```
 * 
 * **MEJORES PRÁCTICAS:**
 * 
 * 1. **Usar parámetros, no concatenación:**
 * ```javascript
 * // ❌ PELIGROSO: SQL Injection
 * qb.where(`nombre = '${nombreUsuario}'`)
 * 
 * // ✅ SEGURO: Parámetros preparados
 * qb.where('nombre = ?', [nombreUsuario])
 * ```
 * 
 * 2. **Claridad con paréntesis:**
 * ```javascript
 * // Explícito
 * qb.where('(estado = "activo" OR estado = "pendiente") AND fecha > "2024-01-01"')
 * ```
 * 
 * 3. **Condiciones indexables:**
 * ```javascript
 * // Preferir condiciones que usen índices
 * qb.where('email = ?', [email])  // Usa índice en email
 * ```
 * 
 * 4. **Evitar LIKE con % al inicio:**
 * ```javascript
 * // ❌ No puede usar índice
 * qb.where("nombre LIKE '%Smith'")
 * 
 * // ✅ Puede usar índice
 * qb.where("nombre LIKE 'Smith%'")
 * 
 * // ✅ Para búsqueda completa: índice full-text
 * qb.whereRaw("MATCH(nombre) AGAINST(? IN BOOLEAN MODE)", ['Smith'])
 * ```
 * 
 * 5. **IS NULL vs = NULL:**
 * ```javascript
 * // ❌ Incorrecto
 * qb.where('telefono = NULL')
 * 
 * // ✅ Correcto
 * qb.where('telefono IS NULL')
 * ```
 * 
 * **PREDICADOS CON QueryBuilder:**
 * 
 * Los predicados también pueden ser instancias de QueryBuilder para crear
 * condiciones dinámicas y complejas de forma programática:
 * 
 * **1. Métodos auxiliares de QueryBuilder:**
 * ```javascript
 * // eq (igual)
 * qb.where(qb.eq('edad', 18))
 * // Genera: WHERE edad = 18
 * 
 * // gt (mayor que)
 * qb.where(qb.gt('precio', 100))
 * // Genera: WHERE precio > 100
 * 
 * // lt (menor que)
 * qb.where(qb.lt('stock', 10))
 * // Genera: WHERE stock < 10
 * 
 * // gte (mayor o igual)
 * qb.where(qb.gte('edad', 18))
 * // Genera: WHERE edad >= 18
 * 
 * // lte (menor o igual)
 * qb.where(qb.lte('descuento', 50))
 * // Genera: WHERE descuento <= 50
 * 
 * // ne (no igual)
 * qb.where(qb.ne('estado', 'inactivo'))
 * // Genera: WHERE estado != 'inactivo'
 * ```
 * 
 * **2. Operadores lógicos:**
 * ```javascript
 * // AND
 * qb.where(qb.and(
 *   qb.eq('activo', true),
 *   qb.gt('edad', 18)
 * ))
 * // Genera: WHERE (activo = true AND edad > 18)
 * 
 * // OR
 * qb.where(qb.or(
 *   qb.eq('categoria', 'premium'),
 *   qb.gt('puntos', 1000)
 * ))
 * // Genera: WHERE (categoria = 'premium' OR puntos > 1000)
 * 
 * // NOT
 * qb.where(qb.not(qb.eq('eliminado', true)))
 * // Genera: WHERE NOT (eliminado = true)
 * ```
 * 
 * **3. Condiciones anidadas:**
 * ```javascript
 * qb.where(qb.and(
 *   qb.or(
 *     qb.eq('categoria', 'premium'),
 *     qb.gt('puntos', 1000)
 *   ),
 *   qb.eq('activo', true),
 *   qb.gte('edad', 18)
 * ))
 * // Genera: WHERE ((categoria = 'premium' OR puntos > 1000) 
 * //               AND activo = true 
 * //               AND edad >= 18)
 * ```
 * 
 * **4. Subconsultas como predicados:**
 * ```javascript
 * const subconsulta = qb
 *   .select('usuario_id')
 *   .from('pedidos')
 *   .where('total > 1000');
 * 
 * qb.select('*')
 *   .from('usuarios')
 *   .where(`id IN (${subconsulta})`);
 * // Genera: SELECT * FROM usuarios 
 * //         WHERE id IN (SELECT usuario_id FROM pedidos WHERE total > 1000)
 * ```
 * 
 * **5. Predicados dinámicos:**
 * ```javascript
 * function crearFiltro(campo, operador, valor) {
 *   switch(operador) {
 *     case '=': return qb.eq(campo, valor);
 *     case '>': return qb.gt(campo, valor);
 *     case '<': return qb.lt(campo, valor);
 *     case '>=': return qb.gte(campo, valor);
 *     case '<=': return qb.lte(campo, valor);
 *     case '!=': return qb.ne(campo, valor);
 *     default: throw new Error('Operador no soportado');
 *   }
 * }
 * 
 * // Uso
 * qb.where(crearFiltro('edad', '>=', 18));
 * ```
 * 
 * **VENTAJAS DE QueryBuilder en predicados:**
 * 
 * 1. **Type-safe**: Menos errores de sintaxis SQL
 * 2. **Composición**: Reutilizar predicados complejos
 * 3. **Validación**: QueryBuilder valida parámetros
 * 4. **Legibilidad**: Más claro en condiciones complejas
 * 5. **Mantenibilidad**: Más fácil de refactorizar
 * 6. **Testing**: Más fácil de testear unitariamente
 * 
 * @global
 * @typedef {string|QueryBuilder} types.predicado
 * 
 * @example
 * // 1. Comparación simple
 * qb.select('*').from('usuarios').where('edad > 18');
 * // Genera: SELECT * FROM usuarios WHERE edad > 18;
 * 
 * @example
 * // 2. Múltiples condiciones con AND
 * qb.select('*')
 *   .from('productos')
 *   .where('precio > 100')
 *   .where('stock > 0');
 * // Genera: SELECT * FROM productos WHERE precio > 100 AND stock > 0;
 * 
 * @example
 * // 3. Condiciones con OR
 * qb.select('*')
 *   .from('usuarios')
 *   .where('(estado = "activo" OR estado = "pendiente")');
 * 
 * @example
 * // 4. IN con lista de valores
 * qb.select('*')
 *   .from('productos')
 *   .where("categoria IN ('electronica', 'computadoras', 'telefonos')");
 * 
 * @example
 * // 5. BETWEEN para rangos
 * qb.select('*')
 *   .from('ventas')
 *   .where("fecha BETWEEN '2024-01-01' AND '2024-12-31'")
 *   .where('total BETWEEN 100 AND 1000');
 * 
 * @example
 * // 6. LIKE para patrones
 * qb.select('*')
 *   .from('clientes')
 *   .where("nombre LIKE 'Juan%'")
 *   .where("email LIKE '%@gmail.com'");
 * 
 * @example
 * // 7. IS NULL y IS NOT NULL
 * qb.select('*')
 *   .from('usuarios')
 *   .where('telefono IS NOT NULL')
 *   .where('fecha_eliminacion IS NULL');
 * 
 * @example
 * // 8. Subconsulta con IN
 * qb.select('*')
 *   .from('usuarios')
 *   .where('id IN (SELECT usuario_id FROM pedidos WHERE total > 1000)');
 * 
 * @example
 * // 9. EXISTS con subconsulta
 * qb.select('*')
 *   .from('usuarios u')
 *   .where('EXISTS (SELECT 1 FROM pedidos p WHERE p.usuario_id = u.id)');
 * 
 * @example
 * // 10. Condiciones complejas con paréntesis
 * qb.select('*')
 *   .from('productos')
 *   .where('((precio > 100 AND stock > 0) OR destacado = true) AND activo = true');
 * 
 * @example
 * // 11. Funciones en predicados
 * qb.select('*')
 *   .from('usuarios')
 *   .where("LOWER(email) = 'admin@example.com'")
 *   .where('LENGTH(password) >= 8');
 * 
 * @example
 * // 12. Fechas y timestamps
 * qb.select('*')
 *   .from('logs')
 *   .where("fecha > NOW() - INTERVAL '7 days'")
 *   .where("EXTRACT(HOUR FROM timestamp) BETWEEN 9 AND 17");
 * 
 * @example
 * // 13. Expresiones matemáticas
 * qb.select('*')
 *   .from('pedidos')
 *   .where('(precio * cantidad) > 1000')
 *   .where('descuento BETWEEN 10 AND 50');
 * 
 * @example
 * // 14. WHERE dinámico seguro
 * async function buscarProductos(filtros) {
 *   let query = qb.select('*').from('productos');
 *   
 *   if (filtros.categoria) {
 *     query = query.where('categoria = ?', [filtros.categoria]);
 *   }
 *   
 *   if (filtros.precioMin) {
 *     query = query.where('precio >= ?', [filtros.precioMin]);
 *   }
 *   
 *   if (filtros.precioMax) {
 *     query = query.where('precio <= ?', [filtros.precioMax]);
 *   }
 *   
 *   if (filtros.enStock) {
 *     query = query.where('stock > 0');
 *   }
 *   
 *   if (filtros.busqueda) {
 *     query = query.where('nombre LIKE ?', [`%${filtros.busqueda}%`]);
 *   }
 *   
 *   return await query.execute();
 * }
 * 
 * @example
 * // 15. Optimización: condición indexable
 * // ❌ No usa índice (función en columna)
 * qb.select('*')
 *   .from('usuarios')
 *   .where("YEAR(fecha_registro) = 2024");
 * 
 * // ✅ Usa índice en fecha_registro
 * qb.select('*')
 *   .from('usuarios')
 *   .where("fecha_registro >= '2024-01-01'")
 *   .where("fecha_registro < '2025-01-01'");
 * 
 * @example
 * // 16. Predicados con QueryBuilder - Métodos auxiliares
 * qb.select('*')
 *   .from('usuarios')
 *   .where(qb.eq('activo', true))
 *   .where(qb.gt('edad', 18));
 * // Genera: SELECT * FROM usuarios WHERE activo = true AND edad > 18;
 * 
 * @example
 * // 17. Operadores lógicos con QueryBuilder
 * qb.select('*')
 *   .from('usuarios')
 *   .where(qb.and(
 *     qb.eq('activo', true),
 *     qb.gt('edad', 18)
 *   ));
 * // Genera: SELECT * FROM usuarios WHERE (activo = true AND edad > 18);
 * 
 * @example
 * // 18. OR con QueryBuilder
 * qb.select('*')
 *   .from('usuarios')
 *   .where(qb.or(
 *     qb.eq('categoria', 'premium'),
 *     qb.gt('puntos', 1000)
 *   ));
 * // Genera: SELECT * FROM usuarios WHERE (categoria = 'premium' OR puntos > 1000);
 * 
 * @example
 * // 19. Condiciones anidadas complejas
 * qb.select('*')
 *   .from('productos')
 *   .where(qb.and(
 *     qb.or(
 *       qb.eq('categoria', 'premium'),
 *       qb.gt('puntos', 1000)
 *     ),
 *     qb.eq('activo', true),
 *     qb.gte('edad', 18)
 *   ));
 * // Genera: SELECT * FROM productos 
 * //         WHERE ((categoria = 'premium' OR puntos > 1000) 
 * //                AND activo = true 
 * //                AND edad >= 18);
 * 
 * @example
 * // 20. Sistema de filtros con QueryBuilder
 * class FiltroProductos {
 *   constructor() {
 *     this.condiciones = [];
 *   }
 *   
 *   conPrecioEntre(min, max) {
 *     this.condiciones.push(qb.and(
 *       qb.gte('precio', min),
 *       qb.lte('precio', max)
 *     ));
 *     return this;
 *   }
 *   
 *   enCategoria(categoria) {
 *     this.condiciones.push(qb.eq('categoria', categoria));
 *     return this;
 *   }
 *   
 *   activo() {
 *     this.condiciones.push(qb.eq('activo', true));
 *     return this;
 *   }
 *   
 *   construir() {
 *     if (this.condiciones.length === 0) {
 *       return null;
 *     }
 *     return this.condiciones.length === 1
 *       ? this.condiciones[0]
 *       : qb.and(...this.condiciones);
 *   }
 * }
 * 
 * // Uso
 * const filtro = new FiltroProductos()
 *   .conPrecioEntre(100, 500)
 *   .enCategoria('electronica')
 *   .activo()
 *   .construir();
 * 
 * qb.select('*').from('productos').where(filtro);
 * 
 * @see {@link QueryBuilder#where} - Para aplicar predicados en WHERE
 * @see {@link QueryBuilder#having} - Para aplicar predicados en HAVING
 * @see {@link QueryBuilder#whereRaw} - Para predicados SQL raw
 * @see {@link QueryBuilder#orWhere} - Para condiciones OR
 * @see {@link QueryBuilder#andWhere} - Para condiciones AND explícitas
 * @see {@link QueryBuilder#eq} - Método auxiliar para igualdad
 * @see {@link QueryBuilder#gt} - Método auxiliar para mayor que
 * @see {@link QueryBuilder#lt} - Método auxiliar para menor que
 * @see {@link QueryBuilder#and} - Método auxiliar para AND
 * @see {@link QueryBuilder#or} - Método auxiliar para OR
 */

/**
 * Nombre de un cursor SQL declarado previamente.
 * 
 * Se utiliza en la cláusula WHERE CURRENT OF para realizar actualizaciones o eliminaciones
 * posicionadas. Esta cláusula permite modificar o eliminar la fila actual sobre la cual
 * está posicionado un cursor abierto, sin necesidad de especificar condiciones WHERE
 * tradicionales basadas en valores de columna.
 * 
 * **WHERE CURRENT OF** es especialmente útil para:
 * - Operaciones que requieren modificar filas mientras se recorren con un cursor
 * - Evitar condiciones WHERE complejas en actualizaciones posicionadas
 * - Garantizar que se modifica exactamente la fila actual del cursor
 * - Operaciones que requieren lógica secuencial fila por fila
 * 
 * **Ciclo de vida del cursor:**
 * 1. DECLARE: Declarar cursor con FOR UPDATE si se va a modificar
 * 2. OPEN: Abrir el cursor
 * 3. FETCH: Obtener fila actual
 * 4. UPDATE/DELETE con WHERE CURRENT OF: Modificar fila actual
 * 5. CLOSE: Cerrar cursor
 * 
 * @global
 * @typedef {string} types.cursorName
 * 
 * @description
 * **Restricciones de nombres:**
 * - Debe coincidir con un cursor declarado previamente
 * - El cursor debe estar abierto (OPEN) antes de usar WHERE CURRENT OF
 * - El cursor debe haber ejecutado al menos un FETCH
 * - Para UPDATE: cursor debe declararse con FOR UPDATE
 * - Sensible a mayúsculas/minúsculas según el SGBD
 * - No se admiten cursores anidados en la cláusula
 * 
 * **Compatibilidad WHERE CURRENT OF:**
 * | SGBD         | WHERE CURRENT OF | FOR UPDATE | Notas                                    |
 * |------------- |------------------|------------|------------------------------------------|
 * | PostgreSQL   | ✅ Soportado     | ✅ Sí      | Requiere cursor declarado con FOR UPDATE |
 * | MySQL        | ❌ No soportado  | ❌ No      | Usar WHERE con valores específicos       |
 * | Oracle       | ✅ Soportado     | ✅ Sí      | Soporta cursores explícitos e implícitos |
 * | SQL Server   | ✅ Soportado     | ✅ Sí      | Requiere cursor con UPDATABLE option     |
 * | MariaDB      | ❌ No soportado  | ❌ No      | Similar a MySQL                          |
 * | SQLite       | ❌ No soportado  | ❌ No      | No soporta cursores explícitos           |
 * | DB2          | ✅ Soportado     | ✅ Sí      | Soporte completo de cursores             |
 * 
 * @example
 * // Ejemplo 1: UPDATE posicionado básico
 * // Declarar cursor
 * qb.raw(`DECLARE CD_4 CURSOR FOR 
 *   SELECT * FROM INVENTARIO_CD 
 *   WHERE A_LA_MANO < 10 
 *   FOR UPDATE`);
 * 
 * // Abrir cursor
 * qb.raw('OPEN CD_4');
 * 
 * // Obtener fila
 * qb.raw('FETCH CD_4 INTO :CD, :Categoria, :Precio, :A_la_mano');
 * 
 * // Actualizar fila actual del cursor
 * qb.update('INVENTARIO_CD', { 
 *   A_LA_MANO: ':A_la_mano * 2' 
 * }).whereCursor('CD_4');
 * // SQL: UPDATE INVENTARIO_CD SET A_LA_MANO = :A_la_mano * 2 WHERE CURRENT OF CD_4
 * 
 * // Cerrar cursor
 * qb.raw('CLOSE CD_4');
 * 
 * @example
 * // Ejemplo 2: DELETE posicionado
 * // Cursor ya declarado y abierto
 * qb.raw('FETCH CD_4 INTO :CD, :Categoria, :Precio, :A_la_mano');
 * 
 * // Eliminar fila actual
 * qb.delete('INVENTARIO_CD')
 *   .whereCursor('CD_4');
 * // SQL: DELETE FROM INVENTARIO_CD WHERE CURRENT OF CD_4
 * 
 * @example
 * // Ejemplo 3: Procesar múltiples filas con cursor
 * // Declarar cursor para productos obsoletos
 * qb.raw(`DECLARE productos_obsoletos CURSOR FOR 
 *   SELECT * FROM PRODUCTOS 
 *   WHERE FECHA_VENCIMIENTO < CURRENT_DATE 
 *   FOR UPDATE`);
 * 
 * qb.raw('OPEN productos_obsoletos');
 * 
 * // Loop: FETCH y UPDATE
 * qb.raw('FETCH productos_obsoletos INTO :id, :nombre, :precio, :fecha');
 * qb.update('PRODUCTOS', { 
 *   PRECIO: 'PRECIO * 0.5',
 *   ESTADO: "'DESCUENTO'" 
 * }).whereCursor('productos_obsoletos');
 * 
 * // Repetir FETCH y UPDATE para cada fila...
 * 
 * qb.raw('CLOSE productos_obsoletos');
 * 
 * @example
 * // Ejemplo 4: Múltiples cursores en misma sesión
 * // Cursor para clientes VIP
 * qb.raw(`DECLARE cur_vip CURSOR FOR 
 *   SELECT * FROM CLIENTES 
 *   WHERE TIPO = 'VIP' 
 *   FOR UPDATE`);
 * 
 * // Cursor para pedidos pendientes
 * qb.raw(`DECLARE cur_pedidos CURSOR FOR 
 *   SELECT * FROM PEDIDOS 
 *   WHERE ESTADO = 'PENDIENTE' 
 *   FOR UPDATE`);
 * 
 * qb.raw('OPEN cur_vip');
 * qb.raw('OPEN cur_pedidos');
 * 
 * // Actualizar cliente VIP
 * qb.raw('FETCH cur_vip INTO :id, :nombre, :tipo');
 * qb.update('CLIENTES', { 
 *   DESCUENTO: 0.15 
 * }).whereCursor('cur_vip');
 * 
 * // Actualizar pedido pendiente
 * qb.raw('FETCH cur_pedidos INTO :pedido_id, :cliente_id, :estado');
 * qb.update('PEDIDOS', { 
 *   ESTADO: "'PROCESANDO'" 
 * }).whereCursor('cur_pedidos');
 * 
 * qb.raw('CLOSE cur_vip');
 * qb.raw('CLOSE cur_pedidos');
 * 
 * @example
 * // Ejemplo 5: UPDATE condicional con cursor (PostgreSQL)
 * qb.raw(`DECLARE actualizar_precios CURSOR FOR 
 *   SELECT * FROM ARTICULOS 
 *   WHERE CATEGORIA = 'ELECTRONICA' 
 *   FOR UPDATE`);
 * 
 * qb.raw('OPEN actualizar_precios');
 * 
 * // FETCH primera fila
 * qb.raw('FETCH actualizar_precios INTO :art_id, :precio, :stock');
 * 
 * // Actualizar solo si stock > 0
 * qb.update('ARTICULOS', { 
 *   PRECIO: 'PRECIO * 1.1',
 *   ULTIMA_ACTUALIZACION: 'NOW()' 
 * }).whereCursor('actualizar_precios');
 * 
 * qb.raw('CLOSE actualizar_precios');
 * 
 * @example
 * // Ejemplo 6: DELETE condicional con lógica de negocio
 * qb.raw(`DECLARE limpiar_logs CURSOR FOR 
 *   SELECT * FROM LOGS 
 *   WHERE FECHA < CURRENT_DATE - INTERVAL '30 days' 
 *   FOR UPDATE`);
 * 
 * qb.raw('OPEN limpiar_logs');
 * qb.raw('FETCH limpiar_logs INTO :log_id, :fecha, :nivel');
 * 
 * // Eliminar logs antiguos de bajo nivel
 * qb.delete('LOGS')
 *   .whereCursor('limpiar_logs');
 * // SQL: DELETE FROM LOGS WHERE CURRENT OF limpiar_logs
 * 
 * qb.raw('CLOSE limpiar_logs');
 * 
 * @example
 * // Ejemplo 7: Actualización en lote con cursor (Oracle)
 * qb.raw(`DECLARE ajustar_inventario CURSOR FOR 
 *   SELECT * FROM INVENTARIO 
 *   WHERE CANTIDAD < MINIMO_STOCK 
 *   FOR UPDATE`);
 * 
 * qb.raw('OPEN ajustar_inventario');
 * 
 * // Loop de actualizaciones
 * qb.raw('FETCH ajustar_inventario INTO :prod_id, :cantidad, :minimo');
 * qb.update('INVENTARIO', { 
 *   CANTIDAD: 'MINIMO_STOCK * 2',
 *   FECHA_REPOSICION: 'SYSDATE',
 *   ESTADO: "'REORDENADO'" 
 * }).whereCursor('ajustar_inventario');
 * 
 * qb.raw('CLOSE ajustar_inventario');
 * 
 * @example
 * // Ejemplo 8: UPDATE con JOIN implícito vía cursor (SQL Server)
 * qb.raw(`DECLARE actualizar_empleados CURSOR FOR 
 *   SELECT e.* FROM EMPLEADOS e
 *   INNER JOIN DEPARTAMENTOS d ON e.DEPT_ID = d.ID
 *   WHERE d.NOMBRE = 'VENTAS'
 *   FOR UPDATE OF e`);
 * 
 * qb.raw('OPEN actualizar_empleados');
 * qb.raw('FETCH actualizar_empleados INTO :emp_id, :nombre, :salario');
 * 
 * qb.update('EMPLEADOS', { 
 *   SALARIO: 'SALARIO * 1.05',
 *   COMISION: 0.02 
 * }).whereCursor('actualizar_empleados');
 * 
 * qb.raw('CLOSE actualizar_empleados');
 * 
 * @example
 * // Ejemplo 9: Manejo de errores y cierre de cursores
 * try {
 *   qb.raw(`DECLARE mi_cursor CURSOR FOR 
 *     SELECT * FROM PEDIDOS 
 *     WHERE ESTADO = 'NUEVO' 
 *     FOR UPDATE`);
 *   
 *   qb.raw('OPEN mi_cursor');
 *   qb.raw('FETCH mi_cursor INTO :pedido_id, :cliente_id, :total');
 *   
 *   qb.update('PEDIDOS', { 
 *     ESTADO: "'PROCESADO'",
 *     FECHA_PROCESO: 'NOW()' 
 *   }).whereCursor('mi_cursor');
 *   
 * } catch (error) {
 *   console.error('Error en operación con cursor:', error);
 * } finally {
 *   // SIEMPRE cerrar cursor
 *   qb.raw('CLOSE mi_cursor');
 * }
 * 
 * @example
 * // Ejemplo 10: DELETE con múltiples tablas relacionadas
 * qb.raw(`DECLARE eliminar_antiguos CURSOR FOR 
 *   SELECT c.* FROM CLIENTES c
 *   LEFT JOIN PEDIDOS p ON c.ID = p.CLIENTE_ID
 *   WHERE p.ID IS NULL 
 *   AND c.FECHA_REGISTRO < CURRENT_DATE - INTERVAL '1 year'
 *   FOR UPDATE OF c`);
 * 
 * qb.raw('OPEN eliminar_antiguos');
 * qb.raw('FETCH eliminar_antiguos INTO :cliente_id, :nombre, :fecha_reg');
 * 
 * // Primero eliminar registros relacionados en otras tablas
 * qb.delete('DIRECCIONES')
 *   .where('CLIENTE_ID', '=', ':cliente_id');
 * 
 * // Luego eliminar cliente usando cursor
 * qb.delete('CLIENTES')
 *   .whereCursor('eliminar_antiguos');
 * 
 * qb.raw('CLOSE eliminar_antiguos');
 * 
 * @example
 * // Ejemplo 11: Convenciones de nomenclatura
 * // ✅ BUENAS PRÁCTICAS:
 * 'cursor_actualizar_precios'  // Descriptivo, snake_case
 * 'CUR_EMPLEADOS'              // Prefijo CUR, UPPERCASE
 * 'cd_inventario_bajo'         // Prefijo cd (cursor data)
 * 'proc_pedidos_pendientes'    // Indica procesamiento
 * 
 * // ❌ EVITAR:
 * 'c'                          // Demasiado corto
 * 'cursor123'                  // No descriptivo
 * 'el_cursor_que_actualiza_los_precios_de_los_productos'  // Demasiado largo
 * 
 * @example
 * // Ejemplo 12: Cursor con validación previa
 * // Verificar que cursor existe antes de usar
 * const cursorExists = await qb.raw(`
 *   SELECT COUNT(*) 
 *   FROM information_schema.cursors 
 *   WHERE cursor_name = 'mi_cursor'
 * `);
 * 
 * if (cursorExists[0].count > 0) {
 *   qb.update('PRODUCTOS', { PRECIO: 'PRECIO * 1.1' })
 *     .whereCursor('mi_cursor');
 * } else {
 *   console.error('Cursor no encontrado');
 * }
 * 
 * @example
 * // Ejemplo 13: UPDATE con múltiples columnas y cálculos
 * qb.raw(`DECLARE ajustar_comisiones CURSOR FOR 
 *   SELECT * FROM VENDEDORES 
 *   WHERE VENTAS_MENSUALES > 10000 
 *   FOR UPDATE`);
 * 
 * qb.raw('OPEN ajustar_comisiones');
 * qb.raw('FETCH ajustar_comisiones INTO :id, :nombre, :ventas, :comision');
 * 
 * qb.update('VENDEDORES', { 
 *   COMISION: 'VENTAS_MENSUALES * 0.15',
 *   NIVEL: "'SENIOR'",
 *   BONUS: '1000',
 *   FECHA_UPGRADE: 'CURRENT_TIMESTAMP' 
 * }).whereCursor('ajustar_comisiones');
 * 
 * qb.raw('CLOSE ajustar_comisiones');
 * 
 * @example
 * // Ejemplo 14: PostgreSQL - Cursor con SCROLL
 * qb.raw(`DECLARE scroll_cursor SCROLL CURSOR FOR 
 *   SELECT * FROM FACTURAS 
 *   WHERE ESTADO = 'PENDIENTE' 
 *   FOR UPDATE`);
 * 
 * qb.raw('OPEN scroll_cursor');
 * 
 * // Navegar hacia adelante
 * qb.raw('FETCH NEXT FROM scroll_cursor INTO :id, :monto');
 * qb.update('FACTURAS', { ESTADO: "'REVISADO'" })
 *   .whereCursor('scroll_cursor');
 * 
 * // Navegar hacia atrás
 * qb.raw('FETCH PRIOR FROM scroll_cursor INTO :id, :monto');
 * 
 * qb.raw('CLOSE scroll_cursor');
 * 
 * @example
 * // Ejemplo 15: SQL Server - Cursor con opciones avanzadas
 * qb.raw(`DECLARE opt_cursor CURSOR 
 *   LOCAL FAST_FORWARD 
 *   FOR SELECT * FROM CLIENTES 
 *   WHERE ACTIVO = 1 
 *   FOR UPDATE OF ULTIMA_VISITA`);
 * 
 * qb.raw('OPEN opt_cursor');
 * qb.raw('FETCH NEXT FROM opt_cursor INTO @id, @nombre');
 * 
 * qb.update('CLIENTES', { 
 *   ULTIMA_VISITA: 'GETDATE()',
 *   CONTADOR_VISITAS: 'CONTADOR_VISITAS + 1' 
 * }).whereCursor('opt_cursor');
 * 
 * qb.raw('CLOSE opt_cursor');
 * qb.raw('DEALLOCATE opt_cursor');
 * 
 * @see {@link QueryBuilder#whereCursor} - Define WHERE CURRENT OF en UPDATE/DELETE
 * @see {@link QueryBuilder#update} - Actualización de registros
 * @see {@link QueryBuilder#delete} - Eliminación de registros
 * @see {@link QueryBuilder#raw} - Para ejecutar comandos DECLARE/OPEN/FETCH/CLOSE
 */

/**
 * Variables de host para almacenar resultados de operaciones FETCH en cursores.
 * 
 * Las host variables (o variables host) son variables del lenguaje de programación
 * que reciben los valores recuperados de un cursor mediante operaciones FETCH.
 * Se utilizan principalmente en programación embedded SQL o cuando se trabaja
 * con cursores explícitos en procedimientos almacenados.
 * 
 * **Formatos soportados:**
 * - **Array de strings**: Lista de nombres de variables para múltiples columnas
 * - **String**: Nombre de variable única o lista separada por comas
 * 
 * **Convenciones de nomenclatura:**
 * - Prefijo `:` en SQL estándar (ej: `:miVariable`)
 * - Prefijo `@` en SQL Server (ej: `@miVariable`)
 * - Prefijo `v_` común en procedimientos (ej: `v_id`, `v_nombre`)
 * - Sin prefijo en el código (el QueryBuilder lo agrega automáticamente)
 * 
 * @global
 * @typedef {Array<string>|string} hostVars
 * 
 * @example
 * // 1. Array de variables para múltiples columnas
 * const vars = ['id', 'nombre', 'email', 'created_at'];
 * cursor.fetch(vars);
 * // SQL: FETCH cursor_name INTO :id, :nombre, :email, :created_at
 * 
 * @example
 * // 2. String con lista separada por comas
 * cursor.fetch(':id, :nombre, :email');
 * // SQL: FETCH cursor_name INTO :id, :nombre, :email
 * 
 * @example
 * // 3. Variable única (string)
 * cursor.fetch('total_registros');
 * // SQL: FETCH cursor_name INTO :total_registros
 * 
 * @example
 * // 4. Variables con prefijo en procedimiento almacenado
 * const procedureVars = ['v_producto_id', 'v_precio', 'v_stock'];
 * cursor.fetchNext(procedureVars);
 * // SQL: FETCH NEXT FROM cursor_name INTO :v_producto_id, :v_precio, :v_stock
 * 
 * @example
 * // 5. FETCH con diferentes direcciones
 * const vars = ['id', 'nombre', 'salario'];
 * 
 * cursor.fetchNext(vars);      // FETCH NEXT ... INTO :id, :nombre, :salario
 * cursor.fetchPrior(vars);     // FETCH PRIOR ... INTO :id, :nombre, :salario
 * cursor.fetchFirst(vars);     // FETCH FIRST ... INTO :id, :nombre, :salario
 * cursor.fetchLast(vars);      // FETCH LAST ... INTO :id, :nombre, :salario
 * cursor.fetchAbsolute(5, vars);   // FETCH ABSOLUTE 5 ... INTO :id, :nombre, :salario
 * cursor.fetchRelative(-2, vars);  // FETCH RELATIVE -2 ... INTO :id, :nombre, :salario
 * 
 * @example
 * // 6. PostgreSQL - Uso en función PL/pgSQL
 * // CREATE FUNCTION procesar_empleados() RETURNS void AS $$
 * // DECLARE
 * //   v_id INTEGER;
 * //   v_nombre VARCHAR(100);
 * //   v_salario DECIMAL(10,2);
 * //   emp_cursor CURSOR FOR SELECT id, nombre, salario FROM empleados;
 * // BEGIN
 * //   OPEN emp_cursor;
 * //   FETCH emp_cursor INTO v_id, v_nombre, v_salario;
 * //   -- Procesar...
 * //   CLOSE emp_cursor;
 * // END;
 * // $$ LANGUAGE plpgsql;
 * 
 * const vars = ['v_id', 'v_nombre', 'v_salario'];
 * cursor.fetch(vars);
 * 
 * @example
 * // 7. Oracle - Variables de bind
 * // Variables en bloque PL/SQL
 * const oracleVars = ['emp_id', 'emp_name', 'emp_dept'];
 * cursor.fetch(oracleVars);
 * // FETCH cursor_name INTO :emp_id, :emp_name, :emp_dept
 * 
 * @example
 * // 8. SQL Server - Variables locales
 * // DECLARE @id INT, @nombre NVARCHAR(100), @activo BIT
 * const sqlServerVars = ['@id', '@nombre', '@activo'];
 * cursor.fetch(sqlServerVars);
 * // FETCH NEXT FROM cursor_name INTO @id, @nombre, @activo
 * 
 * @example
 * // 9. Validación de correspondencia columnas-variables
 * // ❌ ERROR: Número de variables no coincide
 * qb.raw('DECLARE cur CURSOR FOR SELECT id, nombre, email FROM usuarios');
 * cursor.fetch(['id', 'nombre']);  // Faltan variables!
 * 
 * // ✅ CORRECTO: Número de variables coincide
 * cursor.fetch(['id', 'nombre', 'email']);
 * 
 * @example
 * // 10. Uso en loop de procesamiento
 * const vars = ['producto_id', 'precio', 'stock'];
 * 
 * qb.raw('DECLARE productos_cursor CURSOR FOR SELECT id, precio, stock FROM productos');
 * qb.raw('OPEN productos_cursor');
 * 
 * // Loop de fetch (pseudocódigo)
 * let hasRows = true;
 * while (hasRows) {
 *   const result = cursor.fetch(vars);
 *   if (result) {
 *     // Procesar :producto_id, :precio, :stock
 *   } else {
 *     hasRows = false;
 *   }
 * }
 * 
 * qb.raw('CLOSE productos_cursor');
 * 
 * @example
 * // 11. Nombres descriptivos vs abreviados
 * // ✅ RECOMENDADO: Nombres descriptivos
 * ['cliente_id', 'cliente_nombre', 'cliente_email', 'fecha_registro']
 * 
 * // ⚠️ ACEPTABLE: Nombres cortos si el contexto es claro
 * ['id', 'name', 'email', 'created']
 * 
 * // ❌ EVITAR: Nombres muy cortos o confusos
 * ['c1', 'c2', 'c3', 'c4']
 * 
 * @example
 * // 12. Compatibilidad entre SGBDs
 * // PostgreSQL: Usa : para variables
 * cursor.fetch(['id', 'nombre']);
 * // FETCH ... INTO :id, :nombre
 * 
 * // SQL Server: Usa @ para variables locales
 * cursor.fetch(['@id', '@nombre']);
 * // FETCH ... INTO @id, @nombre
 * 
 * // Oracle: Usa : para bind variables
 * cursor.fetch(['id', 'nombre']);
 * // FETCH ... INTO :id, :nombre
 * 
 * @see {@link Cursor#fetch} - Método fetch básico
 * @see {@link Cursor#fetchNext} - Fetch siguiente fila
 * @see {@link Cursor#fetchPrior} - Fetch fila anterior
 * @see {@link Cursor#fetchFirst} - Fetch primera fila
 * @see {@link Cursor#fetchLast} - Fetch última fila
 * @see {@link Cursor#fetchAbsolute} - Fetch posición absoluta
 * @see {@link Cursor#fetchRelative} - Fetch posición relativa
 * @see {@link createCursorOptions} - Opciones para crear cursores
 * @see {@link types.cursorName} - Nombres de cursores
 */

/**
 * Nombre de una columna en una tabla de base de datos.
 * 
 * Los nombres de columna se utilizan en múltiples operaciones SQL para especificar
 * qué campos de una tabla se van a leer, modificar, filtrar u ordenar. Pueden ser
 * nombres simples (ej: "id", "nombre"), incluir prefijos de tabla/alias para
 * desambiguar en operaciones JOIN, o ser objetos Column para mayor control.
 * 
 * **Usos principales:**
 * - Cláusula SELECT: Especificar columnas a recuperar
 * - Cláusula USING: Columnas comunes en JOIN
 * - Cláusula ORDER BY: Ordenar resultados
 * - Cláusula GROUP BY: Agrupar resultados
 * - Cláusula WHERE: Filtrar por columnas
 * - UPDATE: Columnas a modificar
 * - INSERT: Columnas a insertar
 * - INDEX: Columnas para índices
 * 
 * @global
 * @typedef {string|Column} types.columnName
 * 
 * @description
 * **Formatos válidos de nombres de columna:**
 * 
 * 1. **Nombre simple (string):**
 *    - `"id"`, `"nombre"`, `"email"`
 *    - Formato estándar sin calificadores
 * 
 * 2. **Con prefijo de tabla (string):**
 *    - `"usuarios.id"`, `"productos.precio"`
 *    - Desambigua en JOINs
 * 
 * 3. **Con alias de tabla (string):**
 *    - `"u.nombre"`, `"p.categoria"`
 *    - Usa alias definidos en FROM/JOIN
 * 
 * 4. **Objeto Column (con qb.col()):**
 *    - `qb.col('nombre', 'usuarios')`
 *    - Mayor control: permite .as(), .cast(), .from()
 *    - Soporta subconsultas y expresiones
 * 
 * 5. **Con comillas (identificadores especiales):**
 *    - `"\"Order\""`, `"\"User Name\""`
 *    - Para nombres con espacios o palabras reservadas
 * 
 * 6. **Comodín:**
 *    - `"*"` - Todas las columnas
 *    - `"tabla.*"` - Todas las columnas de una tabla
 * 
 * **Restricciones de nomenclatura (varía según SGBD):**
 * 
 * | Característica          | PostgreSQL | MySQL   | Oracle  | SQL Server |
 * |-------------------------|-----------|---------|---------|------------|
 * | Max longitud            | 63 chars  | 64      | 30      | 128        |
 * | Sensible mayúsculas     | No*       | Depende | No*     | No*        |
 * | Espacios permitidos     | Con ""    | Con ``  | Con ""  | Con []     |
 * | Números al inicio       | ❌ No     | ❌ No   | ❌ No   | ❌ No      |
 * | Guiones bajos           | ✅ Sí     | ✅ Sí   | ✅ Sí   | ✅ Sí      |
 * | Caracteres especiales   | Con ""    | Con ``  | Con ""  | Con []     |
 * 
 * * Plegado automático: convierte a minúsculas (PostgreSQL) o mayúsculas (Oracle) a menos que se use comillas.
 * 
 * **Compatibilidad USING:**
 * | SGBD         | USING Soportado | Sintaxis              | Notas                          |
 * |------------- |----------------|----------------------|--------------------------------|
 * | PostgreSQL   | ✅ Sí           | USING (col)          | Estándar SQL                   |
 * | MySQL        | ✅ Sí           | USING (col)          | Versión 5.0+                   |
 * | MariaDB      | ✅ Sí           | USING (col)          | Compatible con MySQL           |
 * | Oracle       | ✅ Sí           | USING (col)          | Desde Oracle 9i                |
 * | SQL Server   | ❌ No           | Usar ON en su lugar  | No soporta cláusula USING      |
 * | SQLite       | ✅ Sí           | USING (col)          | Desde versión 3.0              |
 * | DB2          | ✅ Sí           | USING (col)          | Soporte completo               |
 * 
 * @example
 * // Ejemplo 1: SELECT con columnas específicas (strings)
 * qb.select(['id', 'nombre', 'email'])
 *   .from('usuarios');
 * // SQL: SELECT id, nombre, email FROM usuarios
 * 
 * @example
 * // Ejemplo 2: SELECT con objetos Column
 * qb.select([
 *     qb.col('id'),
 *     qb.col('nombre').as('nombre_completo'),
 *     qb.col('email')
 *   ])
 *   .from('usuarios');
 * // SQL: SELECT id, nombre AS nombre_completo, email FROM usuarios
 * 
 * @example
 * // Ejemplo 3: SELECT con comodín
 * qb.select('*')
 *   .from('productos');
 * // SQL: SELECT * FROM productos
 * 
 * @example
 * // Ejemplo 4: SELECT con alias de tabla usando Column
 * qb.select([qb.col('nombre', 'u'), qb.col('email', 'u')])
 *   .from(['usuarios', 'u']);
 * // SQL: SELECT u.nombre, u.email FROM usuarios u
 * 
 * @example
 * // Ejemplo 5: USING con columna única en JOIN (string)
 * qb.select(['TITULO_CD', 's.TIPO_CD', 'c.MENUDEO'])
 *   .join(['TITULOS_EN_EXISTENCIA', 's'], ['COSTOS_TITULO', 'c'])
 *   .using('TITULO_CD')
 *   .where(qb.gt(qb.col('INVENTARIO', 's'), 15));
 * // SQL: SELECT TITULO_CD, s.TIPO_CD, c.MENUDEO
 * //      FROM TITULOS_EN_EXISTENCIA s
 * //      JOIN COSTOS_TITULO c
 * //      USING (TITULO_CD)
 *   
 * @example
 * // Ejemplo 6: USING con objeto Column
 * qb.select([qb.col('TITULO_CD'), qb.col('TIPO_CD', 's'), qb.col('MENUDEO', 'c')])
 *   .join(['TITULOS_EN_EXISTENCIA', 's'], ['COSTOS_TITULO', 'c'])
 *   .using(qb.col('TITULO_CD'))
 *   .where(qb.gt(qb.col('INVENTARIO', 's'), 15));
 * // SQL: SELECT TITULO_CD, s.TIPO_CD, c.MENUDEO
 * //      FROM TITULOS_EN_EXISTENCIA s
 * //      JOIN COSTOS_TITULO c
 * //      USING (TITULO_CD)
 * //      WHERE s.INVENTARIO > 15
 * 
 * @example
 * // Ejemplo 7: USING con múltiples columnas (strings)
 * qb.select('*')
 *   .from(['pedidos', 'p'])
 *   .innerJoin(['detalles_pedido', 'd'])
 *   .using(['ID', 'CODIGO', 'TIPO']);
 * // SQL: SELECT * FROM pedidos p
 * //      INNER JOIN detalles_pedido d
 * //      USING (ID, CODIGO, TIPO)
 * 
 * @example
 * // Ejemplo 8: USING con múltiples objetos Column
 * qb.select('*')
 *   .from(['pedidos', 'p'])
 *   .innerJoin(['detalles_pedido', 'd'])
 *   .using([qb.col('ID'), qb.col('CODIGO'), qb.col('TIPO')]);
 * // SQL: SELECT * FROM pedidos p
 * //      INNER JOIN detalles_pedido d
 * //      USING (ID, CODIGO, TIPO)
 * 
 * @example
 * // Ejemplo 9: USING simplifica ON en columnas con mismo nombre
 * // Equivalencias:
 * 
 * // Con USING (más conciso):
 * qb.select('*')
 *   .from('empleados')
 *   .join('departamentos')
 *   .using('DEPT_ID');
 * // SQL: SELECT * FROM empleados
 * //      JOIN departamentos
 * //      USING (DEPT_ID)
 * 
 * // Con ON (más verboso):
 * qb.select('*')
 *   .from('empleados')
 *   .join('departamentos')
 *   .on('empleados.DEPT_ID = departamentos.DEPT_ID');
 * // SQL: SELECT * FROM empleados
 * //      JOIN departamentos
 * //      ON empleados.DEPT_ID = departamentos.DEPT_ID
 * 
 * @example
 * // Ejemplo 10: ORDER BY con nombre de columna (string)
 * qb.select(['id', 'nombre', 'fecha_creacion'])
 *   .from('articulos')
 *   .orderBy('fecha_creacion', 'DESC');
 * // SQL: SELECT id, nombre, fecha_creacion
 * //      FROM articulos
 * //      ORDER BY fecha_creacion DESC
 * 
 * @example
 * // Ejemplo 11: ORDER BY con objeto Column
 * qb.select([qb.col('id'), qb.col('nombre'), qb.col('fecha_creacion')])
 *   .from('articulos')
 *   .orderBy(qb.col('fecha_creacion'), 'DESC');
 * // SQL: SELECT id, nombre, fecha_creacion
 * //      FROM articulos
 * //      ORDER BY fecha_creacion DESC
 * 
 * @example
 * // Ejemplo 12: GROUP BY con nombre de columna (string)
 * qb.select(['categoria', qb.raw('COUNT(*) as total')])
 *   .from('productos')
 *   .groupBy('categoria');
 * // SQL: SELECT categoria, COUNT(*) as total
 * //      FROM productos
 * //      GROUP BY categoria
 * 
 * @example
 * // Ejemplo 13: GROUP BY con objeto Column
 * qb.select([qb.col('categoria'), qb.raw('COUNT(*) as total')])
 *   .from('productos')
 *   .groupBy(qb.col('categoria'));
 * // SQL: SELECT categoria, COUNT(*) as total
 * //      FROM productos
 * //      GROUP BY categoria
 * 
 * @example
 * // Ejemplo 14: WHERE con nombre de columna
 * qb.select('*')
 *   .from('clientes')
 *   .where('estado', '=', 'activo')
 *   .andWhere('pais', '=', 'México');
 * // SQL: SELECT * FROM clientes
 * //      WHERE estado = 'activo'
 * //      AND pais = 'México'
 * 
 * @example
 * // Ejemplo 15: INSERT con nombres de columna
 * qb.insert('usuarios', {
 *   nombre: 'Juan',
 *   email: 'juan@example.com',
 *   edad: 30
 * });
 * // SQL: INSERT INTO usuarios (nombre, email, edad)
 * //      VALUES ('Juan', 'juan@example.com', 30)
 * 
 * @example
 * // Ejemplo 16: UPDATE con nombres de columna
 * qb.update('productos', {
 *   precio: 'precio * 1.1',
 *   stock: 'stock - 5',
 *   ultima_actualizacion: 'NOW()'
 * })
 * .where('categoria', '=', 'electronica');
 * // SQL: UPDATE productos
 * //      SET precio = precio * 1.1,
 * //          stock = stock - 5,
 * //          ultima_actualizacion = NOW()
 * //      WHERE categoria = 'electronica'
 * 
 * @example
 * // Ejemplo 17: Columnas con prefijo de tabla en JOIN
 * qb.select([
 *     'usuarios.nombre',
 *     'pedidos.fecha',
 *     'pedidos.total'
 *   ])
 *   .from('usuarios')
 *   .join('pedidos')
 *   .on('usuarios.id = pedidos.usuario_id');
 * // SQL: SELECT usuarios.nombre, pedidos.fecha, pedidos.total
 * //      FROM usuarios
 * //      JOIN pedidos
 * //      ON usuarios.id = pedidos.usuario_id
 * 
 * @example
 * // Ejemplo 18: Columnas con alias en múltiples JOINs usando Column
 * qb.select([
 *     qb.col('nombre', 'u'),
 *     qb.col('titulo', 'p'),
 *     qb.col('categoria', 'c')
 *   ])
 *   .from(['usuarios', 'u'])
 *   .join(['publicaciones', 'p'])
 *   .on('u.id = p.usuario_id')
 *   .join(['categorias', 'c'])
 *   .on('p.categoria_id = c.id');
 * // SQL: SELECT u.nombre, p.titulo, c.categoria
 * //      FROM usuarios u
 * //      JOIN publicaciones p ON u.id = p.usuario_id
 * //      JOIN categorias c ON p.categoria_id = c.id
 * 
 * @example
 * // Ejemplo 19: Columnas con identificadores especiales (palabras reservadas)
 * // PostgreSQL usa comillas dobles:
 * qb.select(['"Order"', '"User"', '"Select"'])
 *   .from('"Table"');
 * // SQL: SELECT "Order", "User", "Select" FROM "Table"
 * 
 * // MySQL usa backticks:
 * qb.select(['`Order`', '`User`', '`Select`'])
 *   .from('`Table`');
 * // SQL: SELECT `Order`, `User`, `Select` FROM `Table`
 * 
 * // SQL Server usa corchetes:
 * qb.select(['[Order]', '[User]', '[Select]'])
 *   .from('[Table]');
 * // SQL: SELECT [Order], [User], [Select] FROM [Table]
 * 
 * @example
 * // Ejemplo 20: Columnas con espacios en nombre
 * qb.select(['"Nombre Completo"', '"Correo Electrónico"'])
 *   .from('"Usuarios Registrados"');
 * // SQL: SELECT "Nombre Completo", "Correo Electrónico"
 * //      FROM "Usuarios Registrados"
 * 
 * @example
 * // Ejemplo 21: USING con LEFT JOIN y múltiples columnas
 * qb.select([
 *     'c.nombre_cliente',
 *     'p.fecha_pedido',
 *     'p.estado'
 *   ])
 *   .from(['clientes', 'c'])
 *   .leftJoin(['pedidos', 'p'])
 *   .using(['cliente_id', 'sucursal_id']);
 * // SQL: SELECT c.nombre_cliente, p.fecha_pedido, p.estado
 * //      FROM clientes c
 * //      LEFT JOIN pedidos p
 * //      USING (cliente_id, sucursal_id)
 * 
 * @example
 * // Ejemplo 22: Todas las columnas de una tabla específica en JOIN
 * qb.select(['usuarios.*', 'perfil.biografia', 'perfil.avatar'])
 *   .from('usuarios')
 *   .leftJoin('perfil')
 *   .on('usuarios.id = perfil.usuario_id');
 * // SQL: SELECT usuarios.*, perfil.biografia, perfil.avatar
 * //      FROM usuarios
 * //      LEFT JOIN perfil ON usuarios.id = perfil.usuario_id
 * 
 * @example
 * // Ejemplo 23: USING con RIGHT JOIN
 * qb.select(['d.nombre_departamento', 'e.nombre_empleado'])
 *   .from(['departamentos', 'd'])
 *   .rightJoin(['empleados', 'e'])
 *   .using('departamento_id');
 * // SQL: SELECT d.nombre_departamento, e.nombre_empleado
 * //      FROM departamentos d
 * //      RIGHT JOIN empleados e
 * //      USING (departamento_id)
 * 
 * @example
 * // Ejemplo 24: Columnas calculadas con alias usando Column
 * qb.select([
 *     qb.col('id'),
 *     qb.col('nombre'),
 *     qb.raw('precio * cantidad').as('total'),
 *     qb.raw('fecha_fin - fecha_inicio').as('duracion')
 *   ])
 *   .from('facturas');
 * // SQL: SELECT id, nombre,
 * //             precio * cantidad AS total,
 * //             fecha_fin - fecha_inicio AS duracion
 * //      FROM facturas
 * 
 * @example
 * // Ejemplo 20: USING vs ON - Diferencia en resultado
 * // Con USING: columna aparece una sola vez
 * qb.select('*')
 *   .from('tabla1')
 *   .join('tabla2')
 *   .using('id');
 * // Resultado: id, tabla1.col1, tabla1.col2, tabla2.col3, tabla2.col4
 * // (id aparece solo una vez)
 * 
 * // Con ON: columnas de ambas tablas
 * qb.select('*')
 *   .from('tabla1')
 *   .join('tabla2')
 *   .on('tabla1.id = tabla2.id');
 * // Resultado: tabla1.id, tabla1.col1, tabla1.col2, tabla2.id, tabla2.col3, tabla2.col4
 * // (id aparece dos veces: tabla1.id y tabla2.id)
 * 
 * @example
 * // Ejemplo 25: Column con cast() - Conversión de tipo
 * qb.select([
 *     qb.col('id'),
 *     qb.col('precio').cast('NUMERIC(10,2)'),
 *     qb.col('fecha').cast('DATE')
 *   ])
 *   .from('productos');
 * // SQL: SELECT id, 
 * //             CAST(precio AS NUMERIC(10,2)), 
 * //             CAST(fecha AS DATE)
 * //      FROM productos
 * 
 * @example
 * // Ejemplo 26: Convenciones de nomenclatura
 * // ✅ BUENAS PRÁCTICAS:
 * 'id'                    // Simple, claro
 * 'usuario_id'            // Snake_case (PostgreSQL, MySQL)
 * 'fecha_creacion'        // Descriptivo
 * 'precio_total'          // Autoexplicativo
 * 'nombre_completo'       // Compuesto claro
 * 
 * // ❌ EVITAR:
 * 'col1'                  // No descriptivo
 * 'x'                     // Muy corto
 * 'el_nombre_completo_del_usuario_registrado'  // Demasiado largo
 * 'usuarioId'             // CamelCase en SQL
 * 'NOMBRE'                // Todo mayúsculas puede causar problemas
 * 
 * @example
 * // Ejemplo 27: CREATE INDEX con nombres de columna
 * qb.raw('CREATE INDEX idx_usuarios_email ON usuarios (email)');
 * qb.raw('CREATE INDEX idx_pedidos_fecha_cliente ON pedidos (fecha, cliente_id)');
 * // Índices sobre columnas específicas para optimizar búsquedas
 * 
 * @example
 * // Ejemplo 28: DISTINCT sobre columnas específicas (PostgreSQL)
 * qb.select('estado', { distinct: true })
 *   .from('clientes');
 * // SQL: SELECT DISTINCT estado FROM clientes
 * 
 * qb.select(['ciudad', 'pais'], { distinct: true })
 *   .from('direcciones');
 * // SQL: SELECT DISTINCT ciudad, pais FROM direcciones
 * 
 * @example
 * // Ejemplo 29: Columnas en subquerys con USING
 * qb.select(['p.nombre', 'c.categoria'])
 *   .from(['productos', 'p'])
 *   .join(
 *     qb.select(['id', 'categoria']).from('categorias_activas'),
 *     'c'
 *   )
 *   .using('id');
 * // SQL: SELECT p.nombre, c.categoria
 * //      FROM productos p
 * //      JOIN (SELECT id, categoria FROM categorias_activas) c
 * //      USING (id)
 * 
 * @example
 * // Ejemplo 30: Validación de nombres de columna
 * const validarNombreColumna = (nombre) => {
 *   // Reglas generales:
 *   // - No empezar con número
 *   // - Solo letras, números, guiones bajos
 *   // - Max 63 caracteres (PostgreSQL)
 *   const regex = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;
 *   return regex.test(nombre);
 * };
 * 
 * console.log(validarNombreColumna('nombre'));      // ✅ true
 * console.log(validarNombreColumna('usuario_id'));  // ✅ true
 * console.log(validarNombreColumna('123columna'));  // ❌ false - empieza con número
 * console.log(validarNombreColumna('col-1'));       // ❌ false - contiene guion
 * 
 * @see {@link QueryBuilder#select} - Seleccionar columnas en consultas
 * @see {@link QueryBuilder#using} - Especificar columnas comunes en JOIN
 * @see {@link QueryBuilder#col} - Crear referencia a columna con alias de tabla (retorna Column)
 * @see {@link QueryBuilder#orderBy} - Ordenar resultados por columna
 * @see {@link QueryBuilder#groupBy} - Agrupar resultados por columna
 * @see {@link QueryBuilder#where} - Filtrar por columna
 * @see {@link QueryBuilder#insert} - Insertar valores en columnas
 * @see {@link QueryBuilder#update} - Actualizar valores de columnas
 * @see {@link Column} - Clase Column para mayor control sobre columnas
 * @see {@link types.tabla} - Definición de nombre de tabla
 * @see {@link types.alias} - Definición de alias
 */

/**
 * Condición de unión para cláusulas JOIN en consultas SQL.
 * Define cómo se combinan las filas de dos o más tablas basándose en 
 * una relación lógica entre columnas. Las condiciones pueden ser simples 
 * comparaciones de igualdad o expresiones complejas con múltiples predicados.
 * 
 * La cláusula ON es fundamental para JOINs y especifica la columna o columnas 
 * que relacionan las tablas. A diferencia de USING, ON permite condiciones 
 * más flexibles incluyendo desigualdades, funciones y expresiones complejas.
 * 
 * @global
 * @typedef {string|QueryBuilder|Array<string>} types.condition
 * 
 * @property {string} condition - Expresión SQL que define la condición de unión.
 * Puede incluir comparaciones (=, !=, <, >, <=, >=), operadores lógicos (AND, OR, NOT),
 * funciones SQL y referencias a columnas con notación tabla.columna.
 * 
 * @property {QueryBuilder} condition - Subconsulta que genera una condición dinámica.
 * Permite usar el resultado de una consulta como parte de la condición ON.
 * 
 * @property {Array<string>} condition - Array de múltiples condiciones.
 * Cada elemento del array se unirá con saltos de línea para formar 
 * una condición compuesta multi-línea.
 * 
 * @example
 * // Ejemplo 1: Condición de igualdad simple
 * qb.select(['u.nombre', 'p.titulo'])
 *   .from(['usuarios', 'u'])
 *   .innerJoin(['posts', 'p'])
 *   .on('u.id = p.usuario_id');
 * // SQL: SELECT u.nombre, p.titulo
 * //      FROM usuarios u INNER JOIN posts p
 * //      ON u.id = p.usuario_id
 * 
 * @example
 * // Ejemplo 2: Condición con múltiples comparaciones (AND)
 * qb.select(['e.nombre', 'd.nombre_depto'])
 *   .from(['empleados', 'e'])
 *   .join(['departamentos', 'd'])
 *   .on('e.departamento_id = d.id AND e.activo = 1');
 * // SQL: SELECT e.nombre, d.nombre_depto
 * //      FROM empleados e JOIN departamentos d
 * //      ON e.departamento_id = d.id AND e.activo = 1
 * 
 * @example
 * // Ejemplo 3: Condición con OR lógico
 * qb.select(['c.nombre', 'p.numero'])
 *   .from(['clientes', 'c'])
 *   .leftJoin(['pedidos', 'p'])
 *   .on('c.id = p.cliente_id OR c.id = p.facturar_a_id');
 * // SQL: SELECT c.nombre, p.numero
 * //      FROM clientes c LEFT JOIN pedidos p
 * //      ON c.id = p.cliente_id OR c.id = p.facturar_a_id
 * 
 * @example
 * // Ejemplo 4: Condición con desigualdad
 * qb.select(['v1.producto', 'v2.producto'])
 *   .from(['ventas', 'v1'])
 *   .join(['ventas', 'v2'])
 *   .on('v1.id != v2.id AND v1.fecha = v2.fecha');
 * // SQL: SELECT v1.producto, v2.producto
 * //      FROM ventas v1 JOIN ventas v2
 * //      ON v1.id != v2.id AND v1.fecha = v2.fecha
 * 
 * @example
 * // Ejemplo 5: Condición con operadores de comparación
 * qb.select(['m.nombre', 'a.nombre'])
 *   .from(['mentores', 'm'])
 *   .join(['aprendices', 'a'])
 *   .on('m.experiencia > a.experiencia');
 * // SQL: SELECT m.nombre, a.nombre
 * //      FROM mentores m JOIN aprendices a
 * //      ON m.experiencia > a.experiencia
 * 
 * @example
 * // Ejemplo 6: Condición con rangos (BETWEEN implícito)
 * qb.select(['p.nombre', 'c.categoria'])
 *   .from(['productos', 'p'])
 *   .join(['categorias', 'c'])
 *   .on('p.precio >= c.precio_min AND p.precio <= c.precio_max');
 * // SQL: SELECT p.nombre, c.categoria
 * //      FROM productos p JOIN categorias c
 * //      ON p.precio >= c.precio_min AND p.precio <= c.precio_max
 * 
 * @example
 * // Ejemplo 7: Condición con NOT
 * qb.select(['u.username', 'b.ip'])
 *   .from(['usuarios', 'u'])
 *   .join(['bloqueados', 'b'])
 *   .on('u.ip = b.ip AND NOT b.desbloqueado');
 * // SQL: SELECT u.username, b.ip
 * //      FROM usuarios u JOIN bloqueados b
 * //      ON u.ip = b.ip AND NOT b.desbloqueado
 * 
 * @example
 * // Ejemplo 8: Condición con funciones SQL
 * qb.select(['c.nombre', 't.descripcion'])
 *   .from(['clientes', 'c'])
 *   .join(['tickets', 't'])
 *   .on('c.id = t.cliente_id AND YEAR(t.fecha) = YEAR(CURRENT_DATE)');
 * // SQL: SELECT c.nombre, t.descripcion
 * //      FROM clientes c JOIN tickets t
 * //      ON c.id = t.cliente_id AND YEAR(t.fecha) = YEAR(CURRENT_DATE)
 * 
 * @example
 * // Ejemplo 9: Condición con UPPER/LOWER para case-insensitive
 * qb.select(['u.nombre', 'r.rol'])
 *   .from(['usuarios', 'u'])
 *   .join(['roles', 'r'])
 *   .on('UPPER(u.rol_nombre) = UPPER(r.nombre)');
 * // SQL: SELECT u.nombre, r.rol
 * //      FROM usuarios u JOIN roles r
 * //      ON UPPER(u.rol_nombre) = UPPER(r.nombre)
 * 
 * @example
 * // Ejemplo 10: Condición con CONCAT
 * qb.select(['p.nombre', 'i.ruta'])
 *   .from(['productos', 'p'])
 *   .join(['imagenes', 'i'])
 *   .on("CONCAT('producto_', p.id) = i.codigo");
 * // SQL: SELECT p.nombre, i.ruta
 * //      FROM productos p JOIN imagenes i
 * //      ON CONCAT('producto_', p.id) = i.codigo
 * 
 * @example
 * // Ejemplo 11: Condición con COALESCE
 * qb.select(['e.nombre', 'c.nombre'])
 *   .from(['empleados', 'e'])
 *   .join(['contactos', 'c'])
 *   .on('COALESCE(e.email_trabajo, e.email_personal) = c.email');
 * // SQL: SELECT e.nombre, c.nombre
 * //      FROM empleados e JOIN contactos c
 * //      ON COALESCE(e.email_trabajo, e.email_personal) = c.email
 * 
 * @example
 * // Ejemplo 12: Condición con múltiples columnas
 * qb.select(['o.numero', 'd.descripcion'])
 *   .from(['ordenes', 'o'])
 *   .join(['detalles', 'd'])
 *   .on('o.id = d.orden_id AND o.almacen = d.almacen');
 * // SQL: SELECT o.numero, d.descripcion
 * //      FROM ordenes o JOIN detalles d
 * //      ON o.id = d.orden_id AND o.almacen = d.almacen
 * 
 * @example
 * // Ejemplo 13: Condición con paréntesis para precedencia
 * qb.select(['p.nombre', 'v.cantidad'])
 *   .from(['productos', 'p'])
 *   .join(['ventas', 'v'])
 *   .on('p.id = v.producto_id AND (v.estado = "completada" OR v.estado = "pendiente")');
 * // SQL: SELECT p.nombre, v.cantidad
 * //      FROM productos p JOIN ventas v
 * //      ON p.id = v.producto_id AND (v.estado = "completada" OR v.estado = "pendiente")
 * 
 * @example
 * // Ejemplo 14: Condición con DATE_ADD/DATE_SUB
 * qb.select(['s.nombre', 'r.fecha'])
 *   .from(['suscripciones', 's'])
 *   .join(['renovaciones', 'r'])
 *   .on('s.id = r.suscripcion_id AND r.fecha >= DATE_ADD(s.inicio, INTERVAL 1 YEAR)');
 * // SQL: SELECT s.nombre, r.fecha
 * //      FROM suscripciones s JOIN renovaciones r
 * //      ON s.id = r.suscripcion_id AND r.fecha >= DATE_ADD(s.inicio, INTERVAL 1 YEAR)
 * 
 * @example
 * // Ejemplo 15: Condición con LIKE
 * qb.select(['c.nombre', 't.etiqueta'])
 *   .from(['contenidos', 'c'])
 *   .join(['tags', 't'])
 *   .on("c.categorias LIKE CONCAT('%', t.etiqueta, '%')");
 * // SQL: SELECT c.nombre, t.etiqueta
 * //      FROM contenidos c JOIN tags t
 * //      ON c.categorias LIKE CONCAT('%', t.etiqueta, '%')
 * 
 * @example
 * // Ejemplo 16: Condición con IN (valores literales)
 * qb.select(['u.nombre', 'g.grupo'])
 *   .from(['usuarios', 'u'])
 *   .join(['grupos', 'g'])
 *   .on('u.grupo_id = g.id AND g.tipo IN ("admin", "moderador")');
 * // SQL: SELECT u.nombre, g.grupo
 * //      FROM usuarios u JOIN grupos g
 * //      ON u.grupo_id = g.id AND g.tipo IN ("admin", "moderador")
 * 
 * @example
 * // Ejemplo 17: Condición con IS NULL / IS NOT NULL
 * qb.select(['p.titulo', 'c.comentario'])
 *   .from(['posts', 'p'])
 *   .leftJoin(['comentarios', 'c'])
 *   .on('p.id = c.post_id AND c.eliminado IS NULL');
 * // SQL: SELECT p.titulo, c.comentario
 * //      FROM posts p LEFT JOIN comentarios c
 * //      ON p.id = c.post_id AND c.eliminado IS NULL
 * 
 * @example
 * // Ejemplo 18: Condición con CAST para conversión de tipos
 * qb.select(['p.nombre', 'a.valor'])
 *   .from(['productos', 'p'])
 *   .join(['atributos', 'a'])
 *   .on('p.id = CAST(a.producto_codigo AS INTEGER)');
 * // SQL: SELECT p.nombre, a.valor
 * //      FROM productos p JOIN atributos a
 * //      ON p.id = CAST(a.producto_codigo AS INTEGER)
 * 
 * @example
 * // Ejemplo 19: Condición con subcadenas (SUBSTRING)
 * qb.select(['u.nombre', 'p.pais'])
 *   .from(['usuarios', 'u'])
 *   .join(['paises', 'p'])
 *   .on('SUBSTRING(u.codigo_postal, 1, 2) = p.codigo');
 * // SQL: SELECT u.nombre, p.pais
 * //      FROM usuarios u JOIN paises p
 * //      ON SUBSTRING(u.codigo_postal, 1, 2) = p.codigo
 * 
 * @example
 * // Ejemplo 20: Condición con operación aritmética
 * qb.select(['p.nombre', 'd.descuento'])
 *   .from(['productos', 'p'])
 *   .join(['descuentos', 'd'])
 *   .on('p.precio * (1 - d.porcentaje / 100) >= d.precio_minimo');
 * // SQL: SELECT p.nombre, d.descuento
 * //      FROM productos p JOIN descuentos d
 * //      ON p.precio * (1 - d.porcentaje / 100) >= d.precio_minimo
 * 
 * @example
 * // Ejemplo 21: Array de condiciones (multi-línea)
 * qb.select(['o.numero', 'c.nombre'])
 *   .from(['ordenes', 'o'])
 *   .join(['clientes', 'c'])
 *   .on([
 *     'o.cliente_id = c.id',
 *     'AND o.estado != "cancelada"',
 *     'AND c.activo = 1'
 *   ]);
 * // SQL: SELECT o.numero, c.nombre
 * //      FROM ordenes o JOIN clientes c
 * //      ON o.cliente_id = c.id
 * //      AND o.estado != "cancelada"
 * //      AND c.activo = 1
 * 
 * @example
 * // Ejemplo 22: Array con condiciones complejas organizadas
 * qb.select(['p.nombre', 'i.stock'])
 *   .from(['productos', 'p'])
 *   .join(['inventario', 'i'])
 *   .on([
 *     'p.id = i.producto_id',
 *     'AND (',
 *     '  i.almacen = "principal"',
 *     '  OR (i.almacen = "secundario" AND i.stock > 0)',
 *     ')'
 *   ]);
 * // SQL: SELECT p.nombre, i.stock
 * //      FROM productos p JOIN inventario i
 * //      ON p.id = i.producto_id
 * //      AND (
 * //        i.almacen = "principal"
 * //        OR (i.almacen = "secundario" AND i.stock > 0)
 * //      )
 * 
 * @example
 * // Ejemplo 23: Self-join con condición
 * qb.select(['e1.nombre', 'e2.nombre AS jefe'])
 *   .from(['empleados', 'e1'])
 *   .leftJoin(['empleados', 'e2'])
 *   .on('e1.jefe_id = e2.id');
 * // SQL: SELECT e1.nombre, e2.nombre AS jefe
 * //      FROM empleados e1 LEFT JOIN empleados e2
 * //      ON e1.jefe_id = e2.id
 * 
 * @example
 * // Ejemplo 24: Condición con MOD para paridad
 * qb.select(['n1.valor', 'n2.valor'])
 *   .from(['numeros', 'n1'])
 *   .join(['numeros', 'n2'])
 *   .on('MOD(n1.valor, 2) = MOD(n2.valor, 2) AND n1.id != n2.id');
 * // SQL: SELECT n1.valor, n2.valor
 * //      FROM numeros n1 JOIN numeros n2
 * //      ON MOD(n1.valor, 2) = MOD(n2.valor, 2) AND n1.id != n2.id
 * 
 * @example
 * // Ejemplo 25: Condición con DATE para comparar solo fechas
 * qb.select(['e.nombre', 'a.tipo'])
 *   .from(['eventos', 'e'])
 *   .join(['asistencias', 'a'])
 *   .on('e.id = a.evento_id AND DATE(a.timestamp) = DATE(e.fecha)');
 * // SQL: SELECT e.nombre, a.tipo
 * //      FROM eventos e JOIN asistencias a
 * //      ON e.id = a.evento_id AND DATE(a.timestamp) = DATE(e.fecha)
 * 
 * @example
 * // Ejemplo 26: Condición con TRIM
 * qb.select(['c.nombre', 'p.provincia'])
 *   .from(['ciudades', 'c'])
 *   .join(['provincias', 'p'])
 *   .on('TRIM(c.provincia_nombre) = TRIM(p.nombre)');
 * // SQL: SELECT c.nombre, p.provincia
 * //      FROM ciudades c JOIN provincias p
 * //      ON TRIM(c.provincia_nombre) = TRIM(p.nombre)
 * 
 * @example
 * // Ejemplo 27: Condición con CASE
 * qb.select(['p.nombre', 'c.descuento'])
 *   .from(['productos', 'p'])
 *   .join(['cupones', 'c'])
 *   .on('p.categoria_id = CASE WHEN c.tipo = "general" THEN 0 ELSE c.categoria_id END');
 * // SQL: SELECT p.nombre, c.descuento
 * //      FROM productos p JOIN cupones c
 * //      ON p.categoria_id = CASE WHEN c.tipo = "general" THEN 0 ELSE c.categoria_id END
 * 
 * @example
 * // Ejemplo 28: Condición con LENGTH
 * qb.select(['u.username', 'p.password_hash'])
 *   .from(['usuarios', 'u'])
 *   .join(['passwords', 'p'])
 *   .on('u.id = p.usuario_id AND LENGTH(p.password_hash) >= 60');
 * // SQL: SELECT u.username, p.password_hash
 * //      FROM usuarios u JOIN passwords p
 * //      ON u.id = p.usuario_id AND LENGTH(p.password_hash) >= 60
 * 
 * @example
 * // Ejemplo 29: Condición con NULLIF
 * qb.select(['p.nombre', 'v.precio'])
 *   .from(['productos', 'p'])
 *   .join(['versiones', 'v'])
 *   .on('p.id = v.producto_id AND NULLIF(v.descontinuado, 0) IS NULL');
 * // SQL: SELECT p.nombre, v.precio
 * //      FROM productos p JOIN versiones v
 * //      ON p.id = v.producto_id AND NULLIF(v.descontinuado, 0) IS NULL
 * 
 * @example
 * // Ejemplo 30: Compatibilidad entre SGBDs
 * // ✅ MySQL/MariaDB: Soporta todas las funciones y operadores mencionados
 * // ✅ PostgreSQL: Soporta todas las condiciones ON, prefiere usar || para concatenar
 * // ✅ SQL Server: Soporta ON, usa + para concatenación en lugar de CONCAT
 * // ✅ Oracle: Soporta ON, usa || para concatenación
 * // ✅ SQLite: Soporta ON pero tiene funciones limitadas (sin DATE_ADD)
 * // ❌ MongoDB: No tiene JOINs nativos, usa $lookup en agregaciones con pipeline
 * // 
 * // IMPORTANTE: 
 * // - Las condiciones ON son obligatorias para INNER, LEFT, RIGHT JOIN
 * // - No se usan con CROSS JOIN (producto cartesiano sin condición)
 * // - No se usan con NATURAL JOIN (automático por columnas del mismo nombre)
 * // - Para igualdad simple en columnas del mismo nombre, considere usar USING
 * 
 * @see {@link QueryBuilder#on} - Especificar condición para JOIN
 * @see {@link QueryBuilder#join} - JOIN básico (equivalente a INNER JOIN)
 * @see {@link QueryBuilder#innerJoin} - INNER JOIN explícito
 * @see {@link QueryBuilder#leftJoin} - LEFT OUTER JOIN
 * @see {@link QueryBuilder#rightJoin} - RIGHT OUTER JOIN
 * @see {@link QueryBuilder#fullJoin} - FULL OUTER JOIN
 * @see {@link QueryBuilder#using} - Alternativa simple a ON para igualdad de columnas
 * @see {@link QueryBuilder#where} - Condiciones de filtrado (diferente de JOIN)
 * @see {@link types.columnName} - Definición de nombre de columna
 * @see {@link types.tabla} - Definición de nombre de tabla
 */

/**
 * Consulta SELECT individual que puede ser combinada con otras consultas mediante 
 * operaciones de conjunto como UNION, UNION ALL, INTERSECT o EXCEPT.
 * 
 * Una selectList representa una consulta completa que retorna un conjunto de resultados
 * compatible con otras consultas para operaciones de conjunto. Todas las consultas 
 * combinadas deben tener el mismo número de columnas con tipos de datos compatibles
 * en el mismo orden.
 * 
 * Los operadores de conjunto combinan los resultados de múltiples consultas SELECT:
 * - UNION: Combina resultados eliminando duplicados
 * - UNION ALL: Combina resultados manteniendo duplicados (más rápido)
 * - INTERSECT: Retorna solo filas que aparecen en ambas consultas
 * - EXCEPT: Retorna filas de la primera consulta que NO están en la segunda
 * 
 * @global
 * @typedef {string|QueryBuilder} types.selectList
 * 
 * @property {string} selectList - Consulta SELECT completa como string SQL.
 * Debe incluir al menos SELECT y FROM. La consulta debe estar completa 
 * y ser sintácticamente válida por sí misma.
 * 
 * @property {QueryBuilder} selectList - Instancia de QueryBuilder que genera una consulta SELECT.
 * El QueryBuilder construye la consulta mediante encadenamiento fluido de métodos.
 * Se convierte automáticamente a SQL cuando se procesa la operación de conjunto.
 * 
 * @example
 * // Ejemplo 1: UNION básico con QueryBuilder
 * qb.union(
 *   qb.select('nombre').from('empleados'),
 *   qb.select('nombre').from('clientes')
 * );
 * // SQL: SELECT nombre FROM empleados
 * //      UNION
 * //      SELECT nombre FROM clientes
 * 
 * @example
 * // Ejemplo 2: UNION con strings
 * qb.union(
 *   'SELECT id, nombre FROM usuarios',
 *   'SELECT id, nombre FROM administradores'
 * );
 * // SQL: SELECT id, nombre FROM usuarios
 * //      UNION
 * //      SELECT id, nombre FROM administradores
 * 
 * @example
 * // Ejemplo 3: UNION ALL (mantiene duplicados)
 * qb.unionAll(
 *   qb.select(['producto', 'precio']).from('ventas_2023'),
 *   qb.select(['producto', 'precio']).from('ventas_2024')
 * );
 * // SQL: SELECT producto, precio FROM ventas_2023
 * //      UNION ALL
 * //      SELECT producto, precio FROM ventas_2024
 * 
 * @example
 * // Ejemplo 4: Mix de QueryBuilder y strings
 * qb.unionAll(
 *   qb.select('email').from('usuarios'),
 *   'SELECT email FROM contactos',
 *   qb.select('email').from('suscriptores')
 * );
 * // SQL: SELECT email FROM usuarios
 * //      UNION ALL
 * //      SELECT email FROM contactos
 * //      UNION ALL
 * //      SELECT email FROM suscriptores
 * 
 * @example
 * // Ejemplo 5: UNION con WHERE en cada consulta
 * qb.union(
 *   qb.select('nombre').from('productos').where('activo = 1'),
 *   qb.select('nombre').from('servicios').where('disponible = 1')
 * );
 * // SQL: SELECT nombre FROM productos WHERE activo = 1
 * //      UNION
 * //      SELECT nombre FROM servicios WHERE disponible = 1
 * 
 * @example
 * // Ejemplo 6: UNION con ORDER BY global
 * qb.union(
 *   qb.select(['id', 'nombre']).from('tabla1'),
 *   qb.select(['id', 'nombre']).from('tabla2')
 * ).orderBy('nombre');
 * // SQL: SELECT id, nombre FROM tabla1
 * //      UNION
 * //      SELECT id, nombre FROM tabla2
 * //      ORDER BY nombre
 * 
 * @example
 * // Ejemplo 7: UNION con aliases de columnas consistentes
 * qb.union(
 *   qb.select(['id', 'nombre AS persona']).from('empleados'),
 *   qb.select(['id', 'razon_social AS persona']).from('empresas')
 * );
 * // SQL: SELECT id, nombre AS persona FROM empleados
 * //      UNION
 * //      SELECT id, razon_social AS persona FROM empresas
 * 
 * @example
 * // Ejemplo 8: UNION con múltiples columnas
 * qb.union(
 *   qb.select(['id', 'nombre', 'email', 'tipo']).from('usuarios_activos'),
 *   qb.select(['id', 'nombre', 'email', 'tipo']).from('usuarios_inactivos')
 * );
 * // SQL: SELECT id, nombre, email, tipo FROM usuarios_activos
 * //      UNION
 * //      SELECT id, nombre, email, tipo FROM usuarios_inactivos
 * 
 * @example
 * // Ejemplo 9: UNION con JOINs
 * qb.union(
 *   qb.select(['u.nombre', 'p.titulo'])
 *     .from(['usuarios', 'u'])
 *     .join(['posts', 'p']).on('u.id = p.usuario_id'),
 *   qb.select(['a.nombre', 'a.titulo'])
 *     .from('articulos_archivo', 'a')
 * );
 * // SQL: SELECT u.nombre, p.titulo
 * //      FROM usuarios u JOIN posts p ON u.id = p.usuario_id
 * //      UNION
 * //      SELECT a.nombre, a.titulo FROM articulos_archivo a
 * 
 * @example
 * // Ejemplo 10: UNION con subconsultas
 * qb.union(
 *   qb.select('*').from(
 *     qb.select(['id', 'nombre']).from('tabla1').where('activo = 1'),
 *     'sub1'
 *   ),
 *   qb.select('*').from('tabla2')
 * );
 * // SQL: SELECT * FROM (SELECT id, nombre FROM tabla1 WHERE activo = 1) sub1
 * //      UNION
 * //      SELECT * FROM tabla2
 * 
 * @example
 * // Ejemplo 11: UNION con GROUP BY
 * qb.union(
 *   qb.select(['categoria', 'COUNT(*) AS total'])
 *     .from('productos')
 *     .groupBy('categoria'),
 *   qb.select(['tipo AS categoria', 'COUNT(*) AS total'])
 *     .from('servicios')
 *     .groupBy('tipo')
 * );
 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos GROUP BY categoria
 * //      UNION
 * //      SELECT tipo AS categoria, COUNT(*) AS total FROM servicios GROUP BY tipo
 * 
 * @example
 * // Ejemplo 12: UNION con HAVING
 * qb.union(
 *   qb.select(['departamento', 'AVG(salario) AS promedio'])
 *     .from('empleados_sede1')
 *     .groupBy('departamento')
 *     .having('AVG(salario) > 50000'),
 *   qb.select(['departamento', 'AVG(salario) AS promedio'])
 *     .from('empleados_sede2')
 *     .groupBy('departamento')
 *     .having('AVG(salario) > 50000')
 * );
 * 
 * @example
 * // Ejemplo 13: INTERSECT - solo registros en ambas consultas
 * qb.intersect(
 *   qb.select('email').from('lista_marketing'),
 *   qb.select('email').from('clientes_activos')
 * );
 * // SQL: SELECT email FROM lista_marketing
 * //      INTERSECT
 * //      SELECT email FROM clientes_activos
 * 
 * @example
 * // Ejemplo 14: EXCEPT - registros en primera consulta pero no en segunda
 * qb.except(
 *   qb.select('id').from('todos_usuarios'),
 *   qb.select('id').from('usuarios_bloqueados')
 * );
 * // SQL: SELECT id FROM todos_usuarios
 * //      EXCEPT
 * //      SELECT id FROM usuarios_bloqueados
 * 
 * @example
 * // Ejemplo 15: UNION con LIMIT global
 * qb.union(
 *   qb.select('nombre').from('tabla1'),
 *   qb.select('nombre').from('tabla2')
 * ).limit(10);
 * // SQL: SELECT nombre FROM tabla1
 * //      UNION
 * //      SELECT nombre FROM tabla2
 * //      LIMIT 10
 * 
 * @example
 * // Ejemplo 16: Tres o más consultas en UNION
 * qb.union(
 *   qb.select('nombre').from('empleados'),
 *   qb.select('nombre').from('contratistas'),
 *   qb.select('nombre').from('freelancers')
 * );
 * // SQL: SELECT nombre FROM empleados
 * //      UNION
 * //      SELECT nombre FROM contratistas
 * //      UNION
 * //      SELECT nombre FROM freelancers
 * 
 * @example
 * // Ejemplo 17: UNION con valores literales
 * qb.union(
 *   qb.select(['nombre', "'empleado' AS tipo"]).from('empleados'),
 *   qb.select(['nombre', "'cliente' AS tipo"]).from('clientes')
 * );
 * // SQL: SELECT nombre, 'empleado' AS tipo FROM empleados
 * //      UNION
 * //      SELECT nombre, 'cliente' AS tipo FROM clientes
 * 
 * @example
 * // Ejemplo 18: UNION con funciones agregadas
 * qb.union(
 *   qb.select(['SUM(ventas) AS total', "'2023' AS año"]).from('ventas_2023'),
 *   qb.select(['SUM(ventas) AS total', "'2024' AS año"]).from('ventas_2024')
 * );
 * // SQL: SELECT SUM(ventas) AS total, '2023' AS año FROM ventas_2023
 * //      UNION
 * //      SELECT SUM(ventas) AS total, '2024' AS año FROM ventas_2024
 * 
 * @example
 * // Ejemplo 19: UNION con DISTINCT explícito en subconsultas
 * qb.union(
 *   qb.select('DISTINCT email').from('lista1'),
 *   qb.select('DISTINCT email').from('lista2')
 * );
 * // SQL: SELECT DISTINCT email FROM lista1
 * //      UNION
 * //      SELECT DISTINCT email FROM lista2
 * 
 * @example
 * // Ejemplo 20: UNION con CASE en columnas
 * qb.union(
 *   qb.select([
 *     'id',
 *     "CASE WHEN activo = 1 THEN 'SI' ELSE 'NO' END AS estado"
 *   ]).from('tabla1'),
 *   qb.select(['id', "'PENDIENTE' AS estado"]).from('tabla2')
 * );
 * 
 * @example
 * // Ejemplo 21: UNION con LEFT JOIN
 * qb.union(
 *   qb.select(['c.nombre', 'p.total'])
 *     .from(['clientes', 'c'])
 *     .leftJoin(['pedidos', 'p']).on('c.id = p.cliente_id'),
 *   qb.select(['nombre', 'NULL AS total'])
 *     .from('prospectos')
 * );
 * // SQL: SELECT c.nombre, p.total
 * //      FROM clientes c LEFT JOIN pedidos p ON c.id = p.cliente_id
 * //      UNION
 * //      SELECT nombre, NULL AS total FROM prospectos
 * 
 * @example
 * // Ejemplo 22: UNION anidado (con paréntesis)
 * const union1 = qb.union(
 *   qb.select('id').from('tabla1'),
 *   qb.select('id').from('tabla2')
 * );
 * qb.union(
 *   union1,
 *   qb.select('id').from('tabla3')
 * );
 * // SQL: (SELECT id FROM tabla1 UNION SELECT id FROM tabla2)
 * //      UNION
 * //      SELECT id FROM tabla3
 * 
 * @example
 * // Ejemplo 23: UNION con fechas
 * qb.union(
 *   qb.select(['fecha', 'monto']).from('ingresos'),
 *   qb.select(['fecha', '-monto AS monto']).from('egresos')
 * ).orderBy('fecha');
 * // SQL: SELECT fecha, monto FROM ingresos
 * //      UNION
 * //      SELECT fecha, -monto AS monto FROM egresos
 * //      ORDER BY fecha
 * 
 * @example
 * // Ejemplo 24: UNION con COALESCE
 * qb.union(
 *   qb.select(['id', "COALESCE(email, 'sin email') AS contacto"])
 *     .from('usuarios'),
 *   qb.select(['id', "COALESCE(telefono, 'sin teléfono') AS contacto"])
 *     .from('contactos')
 * );
 * 
 * @example
 * // Ejemplo 25: UNION con CONCAT
 * qb.union(
 *   qb.select(["CONCAT(nombre, ' ', apellido) AS nombre_completo"])
 *     .from('tabla1'),
 *   qb.select(["CONCAT(first_name, ' ', last_name) AS nombre_completo"])
 *     .from('tabla2')
 * );
 * 
 * @example
 * // Ejemplo 26: UNION con TOP/LIMIT en subconsultas
 * qb.union(
 *   qb.select('nombre').from('ventas_altas').orderBy('monto DESC').limit(10),
 *   qb.select('nombre').from('ventas_bajas').orderBy('monto ASC').limit(10)
 * );
 * // SQL: (SELECT nombre FROM ventas_altas ORDER BY monto DESC LIMIT 10)
 * //      UNION
 * //      (SELECT nombre FROM ventas_bajas ORDER BY monto ASC LIMIT 10)
 * 
 * @example
 * // Ejemplo 27: UNION con BETWEEN
 * qb.union(
 *   qb.select(['id', 'fecha']).from('eventos')
 *     .where("fecha BETWEEN '2024-01-01' AND '2024-06-30'"),
 *   qb.select(['id', 'fecha']).from('eventos_historicos')
 *     .where("fecha BETWEEN '2024-01-01' AND '2024-06-30'")
 * );
 * 
 * @example
 * // Ejemplo 28: UNION con IN
 * qb.union(
 *   qb.select('nombre').from('productos')
 *     .where("categoria IN ('electrónica', 'hogar')"),
 *   qb.select('nombre').from('servicios')
 *     .where("tipo IN ('mantenimiento', 'instalación')")
 * );
 * 
 * @example
 * // Ejemplo 29: UNION con NOT IN
 * qb.union(
 *   qb.select('id').from('todos_items')
 *     .where("id NOT IN (SELECT item_id FROM descontinuados)"),
 *   qb.select('id').from('nuevos_items')
 * );
 * 
 * @example
 * // Ejemplo 30: Compatibilidad entre SGBDs
 * // ✅ MySQL/MariaDB: UNION, UNION ALL, soporte completo
 * // ✅ PostgreSQL: UNION, UNION ALL, INTERSECT, EXCEPT (no MINUS)
 * // ✅ SQL Server: UNION, UNION ALL, INTERSECT, EXCEPT (no MINUS)
 * // ✅ Oracle: UNION, UNION ALL, INTERSECT, MINUS (equivalente a EXCEPT)
 * // ✅ SQLite: UNION, UNION ALL, INTERSECT, EXCEPT
 * // ⚠️ MongoDB: $unionWith (agregación) - sintaxis completamente diferente
 * // 
 * // REGLAS IMPORTANTES:
 * // - Todas las consultas deben retornar el mismo número de columnas
 * // - Las columnas correspondientes deben tener tipos compatibles
 * // - Los nombres de columnas se toman de la primera consulta
 * // - ORDER BY solo se puede aplicar al resultado final completo
 * // - UNION elimina duplicados (más lento), UNION ALL los mantiene (más rápido)
 * // - Para mejor performance, use UNION ALL cuando no haya riesgo de duplicados
 * 
 * @see {@link QueryBuilder#union} - Combinar consultas eliminando duplicados
 * @see {@link QueryBuilder#unionAll} - Combinar consultas manteniendo duplicados
 * @see {@link QueryBuilder#intersect} - Intersección de resultados
 * @see {@link QueryBuilder#except} - Diferencia de resultados
 * @see {@link QueryBuilder#select} - Construir consultas SELECT
 * @see {@link QueryBuilder#from} - Especificar tabla origen
 * @see {@link QueryBuilder#where} - Filtrar resultados
 * @see {@link QueryBuilder#orderBy} - Ordenar resultado final
 * @see {@link QueryBuilder#limit} - Limitar número de resultados
 */

/**
 * Valor o expresión SQL que puede usarse en consultas, comparaciones y predicados.
 * Representa cualquier entidad que produce un valor en una expresión SQL: columnas,
 * valores literales, subconsultas, funciones, operaciones aritméticas, etc.
 * 
 * sqlValue es el tipo más versátil en QueryBuilder, usado en predicados (WHERE, HAVING),
 * comparaciones (=, >, <), funciones agregadas, y cualquier contexto que requiera
 * un valor evaluable. Permite construcción flexible de consultas dinámicas donde
 * los valores pueden venir de múltiples fuentes.
 * 
 * Los valores pueden ser:
 * - Primitivos: strings, números, booleanos, null
 * - Objetos especiales: Column, QueryBuilder
 * - Expresiones: funciones SQL, operaciones aritméticas
 * - Colecciones: arrays para operadores IN o múltiples valores
 * 
 * @global
 * @typedef {string|number|boolean|null|Column|QueryBuilder|Array<string|number>} types.sqlValue
 * 
 * @property {string} sqlValue - Valor string que puede ser:
 * - Nombre de columna: "id", "nombre", "usuarios.email"
 * - Valor literal string: "'texto'", "'2024-01-01'"
 * - Expresión SQL: "UPPER(nombre)", "precio * cantidad"
 * - Función SQL: "COUNT(*)", "SUM(monto)", "COALESCE(email, 'sin email')"
 * 
 * @property {number} sqlValue - Valor numérico literal:
 * - Enteros: 1, 42, -5, 0
 * - Decimales: 3.14, -0.5, 99.99
 * - Usados en comparaciones, operaciones aritméticas, LIMIT, OFFSET
 * 
 * @property {boolean} sqlValue - Valor booleano:
 * - true/false para columnas booleanas
 * - Convertido a 1/0 en algunos SGBDs
 * 
 * @property {null} sqlValue - Valor NULL:
 * - Representa ausencia de valor en SQL
 * - Usado con IS NULL, IS NOT NULL, COALESCE
 * 
 * @property {Column} sqlValue - Objeto Column con metadata:
 * - Referencia a columna con tabla, alias, cast
 * - Permite operaciones tipadas y validadas
 * 
 * @property {QueryBuilder} sqlValue - Subconsulta que retorna valor(es):
 * - Subconsulta escalar (retorna un solo valor)
 * - Subconsulta de lista (para IN, ANY, ALL)
 * - Subconsulta correlacionada
 * 
 * @property {Array} sqlValue - Array de valores:
 * - Para operador IN: ["valor1", "valor2", "valor3"]
 * - Para múltiples columnas NULL: ["col1", "col2", "col3"]
 * - Para funciones que aceptan múltiples argumentos
 * 
 * @example
 * // Ejemplo 1: String como nombre de columna
 * qb.select('*').from('usuarios').where(qb.isNull('email'));
 * // SQL: SELECT * FROM usuarios WHERE email IS NULL
 * 
 * @example
 * // Ejemplo 2: String como expresión SQL
 * qb.select('*').from('productos')
 *   .where(qb.gt('precio * cantidad', 1000));
 * // SQL: SELECT * FROM productos WHERE precio * cantidad > 1000
 * 
 * @example
 * // Ejemplo 3: Número en comparación
 * qb.select('*').from('usuarios').where(qb.gte('edad', 18));
 * // SQL: SELECT * FROM usuarios WHERE edad >= 18
 * 
 * @example
 * // Ejemplo 4: Número en LIMIT
 * qb.select('*').from('posts').limit(10);
 * // SQL: SELECT * FROM posts LIMIT 10
 * 
 * @example
 * // Ejemplo 5: Boolean en filtro
 * qb.select('*').from('usuarios').where(qb.eq('activo', true));
 * // SQL: SELECT * FROM usuarios WHERE activo = 1
 * 
 * @example
 * // Ejemplo 6: NULL explícito
 * qb.select('*').from('pedidos').where(qb.eq('cancelado_at', null));
 * // SQL: SELECT * FROM pedidos WHERE cancelado_at IS NULL
 * 
 * @example
 * // Ejemplo 7: Column object
 * qb.select('*').from('usuarios')
 *   .where(qb.isNull(qb.col('ultimo_login')));
 * // SQL: SELECT * FROM usuarios WHERE ultimo_login IS NULL
 * 
 * @example
 * // Ejemplo 8: QueryBuilder como subconsulta escalar
 * qb.select('*').from('empleados')
 *   .where(qb.gt('salario', qb.select('AVG(salario)').from('empleados')));
 * // SQL: SELECT * FROM empleados 
 * //      WHERE salario > (SELECT AVG(salario) FROM empleados)
 * 
 * @example
 * // Ejemplo 9: QueryBuilder en IN
 * qb.select('*').from('usuarios')
 *   .where(qb.in('id', qb.select('usuario_id').from('pedidos')));
 * // SQL: SELECT * FROM usuarios 
 * //      WHERE id IN (SELECT usuario_id FROM pedidos)
 * 
 * @example
 * // Ejemplo 10: Array en IN
 * qb.select('*').from('productos')
 *   .where(qb.in('categoria', ['electrónica', 'hogar', 'deportes']));
 * // SQL: SELECT * FROM productos 
 * //      WHERE categoria IN ('electrónica', 'hogar', 'deportes')
 * 
 * @example
 * // Ejemplo 11: Array para múltiples columnas NULL
 * qb.select('*').from('usuarios')
 *   .where(qb.isNull(['email', 'telefono', 'direccion']));
 * // SQL: SELECT * FROM usuarios 
 * //      WHERE email IS NULL AND telefono IS NULL AND direccion IS NULL
 * 
 * @example
 * // Ejemplo 12: Función SQL COUNT
 * qb.select(['categoria', 'COUNT(*) AS total'])
 *   .from('productos')
 *   .groupBy('categoria')
 *   .having(qb.gt('COUNT(*)', 10));
 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos 
 * //      GROUP BY categoria HAVING COUNT(*) > 10
 * 
 * @example
 * // Ejemplo 13: Función SQL SUM
 * qb.select(['cliente_id', 'SUM(monto) AS total'])
 *   .from('ventas')
 *   .groupBy('cliente_id')
 *   .having(qb.gte('SUM(monto)', 5000));
 * 
 * @example
 * // Ejemplo 14: Función SQL UPPER
 * qb.select('*').from('usuarios')
 *   .where(qb.eq('UPPER(email)', "'ADMIN@EXAMPLE.COM'"));
 * // SQL: SELECT * FROM usuarios WHERE UPPER(email) = 'ADMIN@EXAMPLE.COM'
 * 
 * @example
 * // Ejemplo 15: Función SQL COALESCE
 * qb.select('*').from('clientes')
 *   .where(qb.isNotNull("COALESCE(email, telefono)"));
 * // SQL: SELECT * FROM clientes WHERE COALESCE(email, telefono) IS NOT NULL
 * 
 * @example
 * // Ejemplo 16: Operación aritmética simple
 * qb.select('*').from('productos')
 *   .where(qb.lt('precio * 0.8', 100));
 * // SQL: SELECT * FROM productos WHERE precio * 0.8 < 100
 * 
 * @example
 * // Ejemplo 17: Operación aritmética compleja
 * qb.select('*').from('ventas')
 *   .where(qb.gte('(precio - descuento) * cantidad', 500));
 * // SQL: SELECT * FROM ventas WHERE (precio - descuento) * cantidad >= 500
 * 
 * @example
 * // Ejemplo 18: Concatenación de strings
 * qb.select('*').from('usuarios')
 *   .where(qb.like("CONCAT(nombre, ' ', apellido)", "'%Smith%'"));
 * // SQL: SELECT * FROM usuarios WHERE CONCAT(nombre, ' ', apellido) LIKE '%Smith%'
 * 
 * @example
 * // Ejemplo 19: CASE expression
 * qb.select('*').from('pedidos')
 *   .where(qb.eq(
 *     "CASE WHEN total > 1000 THEN 'premium' ELSE 'regular' END",
 *     "'premium'"
 *   ));
 * 
 * @example
 * // Ejemplo 20: Subconsulta correlacionada
 * qb.select('*').from(['empleados', 'e'])
 *   .where(qb.gt(
 *     'e.salario',
 *     qb.select('AVG(salario)')
 *       .from(['empleados', 'e2'])
 *       .where('e2.departamento = e.departamento')
 *   ));
 * // SQL: SELECT * FROM empleados e
 * //      WHERE e.salario > (
 * //        SELECT AVG(salario) FROM empleados e2 
 * //        WHERE e2.departamento = e.departamento
 * //      )
 * 
 * @example
 * // Ejemplo 21: EXISTS con subconsulta
 * qb.select('*').from('clientes')
 *   .where(qb.exists(
 *     qb.select('1').from('pedidos').where('pedidos.cliente_id = clientes.id')
 *   ));
 * // SQL: SELECT * FROM clientes 
 * //      WHERE EXISTS (SELECT 1 FROM pedidos WHERE pedidos.cliente_id = clientes.id)
 * 
 * @example
 * // Ejemplo 22: ANY con subconsulta
 * qb.select('*').from('productos')
 *   .where(qb.gt('precio', 
 *     qb.any(qb.select('precio').from('productos_competencia'))
 *   ));
 * // SQL: SELECT * FROM productos 
 * //      WHERE precio > ANY (SELECT precio FROM productos_competencia)
 * 
 * @example
 * // Ejemplo 23: ALL con subconsulta
 * qb.select('*').from('estudiantes')
 *   .where(qb.gte('nota', 
 *     qb.all(qb.select('nota_minima').from('requisitos'))
 *   ));
 * // SQL: SELECT * FROM estudiantes 
 * //      WHERE nota >= ALL (SELECT nota_minima FROM requisitos)
 * 
 * @example
 * // Ejemplo 24: BETWEEN con números
 * qb.select('*').from('productos')
 *   .where(qb.between('precio', 10, 100));
 * // SQL: SELECT * FROM productos WHERE precio BETWEEN 10 AND 100
 * 
 * @example
 * // Ejemplo 25: BETWEEN con fechas (strings)
 * qb.select('*').from('eventos')
 *   .where(qb.between('fecha', "'2024-01-01'", "'2024-12-31'"));
 * // SQL: SELECT * FROM eventos WHERE fecha BETWEEN '2024-01-01' AND '2024-12-31'
 * 
 * @example
 * // Ejemplo 26: IS NULL con Column tipado
 * const emailCol = qb.col('email', 'usuarios');
 * qb.select('*').from('usuarios').where(qb.isNull(emailCol));
 * // SQL: SELECT * FROM usuarios WHERE usuarios.email IS NULL
 * 
 * @example
 * // Ejemplo 27: Comparación con valor calculado
 * qb.select('*').from('inventario')
 *   .where(qb.lte('stock', 'stock_minimo * 1.5'));
 * // SQL: SELECT * FROM inventario WHERE stock <= stock_minimo * 1.5
 * 
 * @example
 * // Ejemplo 28: Función DATE con comparación
 * qb.select('*').from('registros')
 *   .where(qb.eq('DATE(created_at)', "'2024-10-20'"));
 * // SQL: SELECT * FROM registros WHERE DATE(created_at) = '2024-10-20'
 * 
 * @example
 * // Ejemplo 29: CAST para conversión de tipos
 * qb.select('*').from('datos')
 *   .where(qb.gt('CAST(valor_texto AS INTEGER)', 100));
 * // SQL: SELECT * FROM datos WHERE CAST(valor_texto AS INTEGER) > 100
 * 
 * @example
 * // Ejemplo 30: Combinación compleja en predicado
 * qb.select('*').from('transacciones')
 *   .where(qb.and(
 *     qb.gte('monto', 1000),
 *     qb.eq('estado', "'completada'"),
 *     qb.isNotNull('usuario_id'),
 *     qb.gt('YEAR(fecha)', 2023)
 *   ));
 * // SQL: SELECT * FROM transacciones 
 * //      WHERE monto >= 1000 
 * //      AND estado = 'completada' 
 * //      AND usuario_id IS NOT NULL 
 * //      AND YEAR(fecha) > 2023
 * 
 * @see {@link QueryBuilder#isNull} - Verificar si valor es NULL
 * @see {@link QueryBuilder#isNotNull} - Verificar si valor no es NULL
 * @see {@link QueryBuilder#eq} - Comparación de igualdad (=)
 * @see {@link QueryBuilder#ne} - Comparación de desigualdad (<>)
 * @see {@link QueryBuilder#gt} - Mayor que (>)
 * @see {@link QueryBuilder#gte} - Mayor o igual que (>=)
 * @see {@link QueryBuilder#lt} - Menor que (<)
 * @see {@link QueryBuilder#lte} - Menor o igual que (<=)
 * @see {@link QueryBuilder#between} - Valor entre dos límites
 * @see {@link QueryBuilder#in} - Valor en lista o subconsulta
 * @see {@link QueryBuilder#exists} - Verificar existencia en subconsulta
 * @see {@link QueryBuilder#any} - Comparar con cualquier valor de subconsulta
 * @see {@link QueryBuilder#all} - Comparar con todos los valores de subconsulta
 * @see {@link QueryBuilder#like} - Coincidencia de patrón
 * @see {@link QueryBuilder#col} - Crear objeto Column
 * @see {@link Column} - Clase Column para referencias tipadas
 * @see {@link types.columnName} - Nombres de columna
 */

/**
 * Objeto de contexto para el encadenamiento fluido de métodos QueryBuilder.
 * Mantiene el estado de la consulta SQL mientras se construye progresivamente.
 * Este objeto es gestionado internamente por el Proxy de QueryBuilder y 
 * permite que los métodos mantengan contexto entre llamadas encadenadas.
 * 
 * @global
 * @typedef {Object} types.next
 * 
 * @property {Array<String>} q - Array que contiene las partes de la consulta SQL siendo construida.
 * Cada elemento representa un fragmento SQL que será unido para formar la consulta completa.
 * 
 * @property {String|null} [last=null] - Nombre del último comando SQL ejecutado exitosamente.
 * Se usa para validar el orden correcto de los comandos (ej: FROM debe seguir a SELECT).
 * 
 * @property {String} [prop] - Nombre del comando actual siendo procesado.
 * Identificador del método que está siendo ejecutado en la cadena fluida.
 * 
 * @property {Array<String>} [callStack=[]] - Historial ordenado de comandos ejecutados.
 * Rastrea la secuencia completa de métodos llamados para validación y depuración.
 * 
 * @property {Error|String|null} [error=null] - Error capturado durante la construcción de la consulta.
 * Puede ser un objeto Error o un mensaje de error como string.
 * 
 * @property {Boolean} [isQB=false] - Indica si el valor actual contiene una instancia de QueryBuilder.
 * Se activa cuando se detectan subconsultas o QueryBuilders anidados.
 * 
 * @example
 * // Evolución del objeto next durante una consulta típica:
 * 
 * // 1. Después de qb.select('*')
 * {
 *   q: ["SELECT *"],
 *   last: null,
 *   prop: "select",
 *   callStack: ["select"],
 *   error: null,
 *   isQB: false
 * }
 * 
 * // 2. Después de .from('users')
 * {
 *   q: ["SELECT *", "FROM users"],
 *   last: "select",
 *   prop: "from",
 *   callStack: ["select", "from"],
 *   error: null,
 *   isQB: false
 * }
 * 
 * // 3. Después de .where('active = 1')
 * {
 *   q: ["SELECT *", "FROM users", "WHERE active = 1"],
 *   last: "from",
 *   prop: "where",
 *   callStack: ["select", "from", "where"],
 *   error: null,
 *   isQB: false
 * }
 * 
 * // 4. Con subconsulta
 * {
 *   q: ["SELECT *", "FROM users", "WHERE id IN", "(SELECT user_id FROM orders)"],
 *   last: "where",
 *   prop: "where",
 *   callStack: ["select", "from", "where"],
 *   error: null,
 *   isQB: true  // ← Indica presencia de subconsulta
 * }
 * 
 * // 5. Con error
 * {
 *   q: ["SELECT *"],
 *   last: "select",
 *   prop: "from",
 *   callStack: ["select"],
 *   error: "No es posible usar FROM sin SELECT previo",
 *   isQB: false
 * }
 */

/**
 * Opciones de configuración para la instancia QueryBuilder.
 * Define comportamientos, adaptadores y configuraciones específicas del entorno.
 * 
 * @global
 * @typedef {Object} queryBuilderOptions
 * 
 * @property {String} [typeIdentificator="regular"] - Identificador del tipo de datos a usar.
 * Determina cómo se manejan los tipos de datos y validaciones.
 * Valores posibles: "regular", "strict", "loose".
 * 
 * @property {String} [mode] - Modo de operación del QueryBuilder.
 * - "TEST": Suprime errores y permite testing
 * - "PRODUCTION": Modo estricto con validación completa
 * - "DEVELOPMENT": Modo con logging extendido
 * 
 * @property {Object} [logging] - Configuración de logging y depuración.
 * @property {Boolean} [logging.enabled=false] - Habilita/deshabilita logging
 * @property {String} [logging.level="info"] - Nivel de logging ("debug", "info", "warn", "error")
 * 
 * @property {Object} [connection] - Configuración de conexión a base de datos.
 * @property {String} [connection.host] - Host del servidor de base de datos
 * @property {Number} [connection.port] - Puerto de conexión
 * @property {String} [connection.database] - Nombre de la base de datos
 * @property {String} [connection.user] - Usuario para autenticación
 * @property {String} [connection.password] - Contraseña para autenticación
 * 
 * @example
 * // Configuración básica
 * const options = {
 *   typeIdentificator: "strict",
 *   mode: "DEVELOPMENT"
 * };
 * 
 * // Configuración completa
 * const fullOptions = {
 *   typeIdentificator: "regular",
 *   mode: "PRODUCTION",
 *   logging: {
 *     enabled: true,
 *     level: "warn"
 *   },
 *   connection: {
 *     host: "localhost",
 *     port: 5432,
 *     database: "myapp",
 *     user: "dbuser",
 *     password: "secret"
 *   }
 * };
 * 
 * const qb = new QueryBuilder(PostgreSQL, fullOptions);
 */

/**
 * Datos de resultado después de ejecutar una consulta SQL.
 * Contiene información sobre la ejecución y los datos devueltos.
 * 
 * @global
 * @typedef {Object} ResultData
 * 
 * @property {Array<Object>} [rows=[]] - Array de objetos con las filas devueltas por la consulta.
 * Cada objeto representa una fila con propiedades nombradas según las columnas.
 * 
 * @property {Number} [rowCount=0] - Número total de filas afectadas o devueltas.
 * Para SELECT: número de filas en el resultado.
 * Para INSERT/UPDATE/DELETE: número de filas afectadas.
 * 
 * @property {Array<Object>} [fields=[]] - Metadatos de las columnas devueltas.
 * @property {String} fields[].name - Nombre de la columna
 * @property {String} fields[].type - Tipo de datos de la columna
 * @property {Boolean} fields[].nullable - Si la columna acepta NULL
 * 
 * @property {String} [query] - La consulta SQL que fue ejecutada.
 * Útil para logging y depuración.
 * 
 * @property {Number} [executionTime] - Tiempo de ejecución en milisegundos.
 * 
 * @property {Boolean} [success=true] - Indica si la consulta fue exitosa.
 * 
 * @property {String|null} [error=null] - Mensaje de error si la consulta falló.
 * 
 * @example
 * // Resultado de SELECT
 * {
 *   rows: [
 *     { id: 1, name: "John", email: "john@example.com" },
 *     { id: 2, name: "Jane", email: "jane@example.com" }
 *   ],
 *   rowCount: 2,
 *   fields: [
 *     { name: "id", type: "integer", nullable: false },
 *     { name: "name", type: "varchar", nullable: false },
 *     { name: "email", type: "varchar", nullable: true }
 *   ],
 *   query: "SELECT id, name, email FROM users WHERE active = 1",
 *   executionTime: 15,
 *   success: true,
 *   error: null
 * }
 * 
 * // Resultado de INSERT/UPDATE/DELETE
 * {
 *   rows: [],
 *   rowCount: 3,
 *   fields: [],
 *   query: "UPDATE users SET active = 1 WHERE created_at < '2023-01-01'",
 *   executionTime: 8,
 *   success: true,
 *   error: null
 * }
 * 
 * // Resultado con error
 * {
 *   rows: [],
 *   rowCount: 0,
 *   fields: [],
 *   query: "SELECT * FROM non_existent_table",
 *   executionTime: 2,
 *   success: false,
 *   error: "Table 'non_existent_table' doesn't exist"
 * }
 */

/**
 * Opciones de configuración para la cláusula GROUP BY en consultas SQL.
 * Define comportamientos avanzados de agrupación como subtotales jerárquicos (ROLLUP)
 * y combinaciones completas de agrupación (CUBE).
 * 
 * **Compatibilidad entre motores:**
 * | Característica | MySQL 5.7+ | PostgreSQL 9.5+ | SQL Server 2008+ | Oracle 11g+ | SQLite |
 * |---------------|-----------|-----------------|------------------|-------------|---------|
 * | rollup        | ✅ Sí     | ✅ Sí           | ✅ Sí            | ✅ Sí       | ❌ No   |
 * | cube          | ❌ No     | ✅ Sí           | ✅ Sí            | ✅ Sí       | ❌ No   |
 * | groupingSets  | ❌ No     | ✅ Sí           | ✅ Sí            | ✅ Sí       | ❌ No   |
 * 
 * @global
 * @typedef {Object} types.groupByOptions
 * 
 * @property {Array<columnName>} [rollup] - Lista de columnas para agrupación jerárquica con subtotales.
 * Genera filas de resumen para cada nivel de la jerarquía desde el más específico al total general.
 * 
 * @property {Array<columnName>} [cube] - Lista de columnas para agrupación multidimensional completa.
 * Genera todas las combinaciones posibles de subtotales para las columnas especificadas.
 * Solo disponible en PostgreSQL, SQL Server y Oracle.
 * 
 * @property {Array<Array<columnName>>} [groupingSets] - Conjuntos personalizados de agrupación.
 * Permite especificar exactamente qué combinaciones de columnas incluir en los subtotales.
 * Ofrece máximo control sobre las agrupaciones generadas.
 * 
 * @example
 * // Ejemplo 1: ROLLUP básico - Subtotales jerárquicos
 * qb.select(['region', 'ciudad', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .groupBy({ rollup: ['region', 'ciudad'] });
 * // SQL: SELECT region, ciudad, SUM(ventas) AS total 
 * //      FROM ventas 
 * //      GROUP BY ROLLUP(region, ciudad)
 * // Resultados incluyen:
 * // - Total por región y ciudad
 * // - Subtotal por región
 * // - Total general
 * 
 * @example
 * // Ejemplo 2: ROLLUP con tres niveles
 * qb.select(['año', 'trimestre', 'mes', 'SUM(ingresos) AS total'])
 *   .from('finanzas')
 *   .groupBy({ rollup: ['año', 'trimestre', 'mes'] });
 * // SQL: GROUP BY ROLLUP(año, trimestre, mes)
 * // Genera subtotales para:
 * // - año + trimestre + mes
 * // - año + trimestre
 * // - año
 * // - total general
 * 
 * @example
 * // Ejemplo 3: CUBE - Todas las combinaciones (PostgreSQL)
 * qb.select(['categoria', 'subcategoria', 'COUNT(*) AS total'])
 *   .from('productos')
 *   .groupBy({ cube: ['categoria', 'subcategoria'] });
 * // SQL: GROUP BY CUBE(categoria, subcategoria)
 * // Genera subtotales para:
 * // - categoria + subcategoria
 * // - solo categoria
 * // - solo subcategoria
 * // - total general
 * 
 * @example
 * // Ejemplo 4: CUBE con tres dimensiones (PostgreSQL)
 * qb.select(['pais', 'region', 'ciudad', 'SUM(poblacion) AS total'])
 *   .from('demografia')
 *   .groupBy({ cube: ['pais', 'region', 'ciudad'] });
 * // SQL: GROUP BY CUBE(pais, region, ciudad)
 * // Genera 8 combinaciones (2^3) de subtotales
 * 
 * @example
 * // Ejemplo 5: GROUPING SETS personalizado (PostgreSQL)
 * qb.select(['año', 'categoria', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .groupBy({ 
 *     groupingSets: [
 *       ['año', 'categoria'],
 *       ['año'],
 *       []
 *     ]
 *   });
 * // SQL: GROUP BY GROUPING SETS ((año, categoria), (año), ())
 * // Solo genera subtotales específicos solicitados
 * 
 * @example
 * // Ejemplo 6: ROLLUP con HAVING
 * qb.select(['departamento', 'puesto', 'AVG(salario) AS promedio'])
 *   .from('empleados')
 *   .groupBy({ rollup: ['departamento', 'puesto'] })
 *   .having(qb.gt('AVG(salario)', 50000));
 * // SQL: GROUP BY ROLLUP(departamento, puesto) 
 * //      HAVING AVG(salario) > 50000
 * 
 * @example
 * // Ejemplo 7: CUBE con ORDER BY (PostgreSQL)
 * qb.select(['marca', 'modelo', 'SUM(unidades) AS vendidas'])
 *   .from('ventas_autos')
 *   .groupBy({ cube: ['marca', 'modelo'] })
 *   .orderBy('vendidas DESC');
 * // SQL: GROUP BY CUBE(marca, modelo) ORDER BY vendidas DESC
 * 
 * @example
 * // Ejemplo 8: ROLLUP con funciones agregadas múltiples
 * qb.select([
 *     'categoria',
 *     'subcategoria',
 *     'COUNT(*) AS cantidad',
 *     'SUM(precio) AS total',
 *     'AVG(precio) AS promedio'
 *   ])
 *   .from('productos')
 *   .groupBy({ rollup: ['categoria', 'subcategoria'] });
 * 
 * @example
 * // Ejemplo 9: GROUPING SETS con conjuntos vacíos (PostgreSQL)
 * qb.select(['region', 'trimestre', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .groupBy({ 
 *     groupingSets: [
 *       ['region', 'trimestre'],
 *       ['region'],
 *       ['trimestre'],
 *       []  // Total general
 *     ]
 *   });
 * 
 * @example
 * // Ejemplo 10: ROLLUP combinado con columnas normales
 * qb.select(['año', 'pais', 'ciudad', 'SUM(ventas) AS total'])
 *   .from('ventas_internacionales')
 *   .groupBy(['año', { rollup: ['pais', 'ciudad'] }]);
 * // SQL: GROUP BY año, ROLLUP(pais, ciudad)
 * // Subtotales por año, luego rollup dentro de cada año
 * 
 * @example
 * // Ejemplo 11: CUBE con filtros WHERE previos
 * qb.select(['genero', 'rango_edad', 'COUNT(*) AS total'])
 *   .from('usuarios')
 *   .where(qb.eq('activo', 1))
 *   .groupBy({ cube: ['genero', 'rango_edad'] });
 * // SQL: WHERE activo = 1 GROUP BY CUBE(genero, rango_edad)
 * 
 * @example
 * // Ejemplo 12: ROLLUP con JOIN
 * qb.select(['c.pais', 'c.ciudad', 'SUM(v.monto) AS total'])
 *   .from(['ventas', 'v'])
 *   .join(['clientes', 'c'], 'v.cliente_id = c.id')
 *   .groupBy({ rollup: ['c.pais', 'c.ciudad'] });
 * 
 * @example
 * // Ejemplo 13: GROUPING SETS sin duplicados (PostgreSQL)
 * qb.select(['tipo', 'estado', 'COUNT(*) AS total'])
 *   .from('tickets')
 *   .groupBy({ 
 *     groupingSets: [
 *       ['tipo', 'estado'],
 *       ['tipo']
 *     ]
 *   });
 * // Evita duplicados que ROLLUP generaría automáticamente
 * 
 * @example
 * // Ejemplo 14: CUBE con columnas calculadas (PostgreSQL)
 * qb.select([
 *     'YEAR(fecha) AS año',
 *     'MONTH(fecha) AS mes',
 *     'SUM(cantidad) AS total'
 *   ])
 *   .from('pedidos')
 *   .groupBy({ cube: ['YEAR(fecha)', 'MONTH(fecha)'] });
 * 
 * @example
 * // Ejemplo 15: ROLLUP con DISTINCT
 * qb.select([
 *     'categoria',
 *     'marca',
 *     'COUNT(DISTINCT producto_id) AS productos_unicos'
 *   ])
 *   .from('inventario')
 *   .groupBy({ rollup: ['categoria', 'marca'] });
 * 
 * @example
 * // Ejemplo 16: GROUPING SETS con alias (PostgreSQL)
 * qb.select(['region AS zona', 'ciudad', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .groupBy({ 
 *     groupingSets: [
 *       ['zona', 'ciudad'],
 *       ['zona']
 *     ]
 *   });
 * 
 * @example
 * // Ejemplo 17: CUBE para análisis multidimensional (PostgreSQL)
 * qb.select([
 *     'producto',
 *     'canal',
 *     'temporada',
 *     'SUM(ingresos) AS ingresos_totales'
 *   ])
 *   .from('ventas')
 *   .groupBy({ cube: ['producto', 'canal', 'temporada'] });
 * // Genera 8 niveles de agregación diferentes
 * 
 * @example
 * // Ejemplo 18: ROLLUP con NULLS FIRST/LAST
 * qb.select(['departamento', 'equipo', 'SUM(presupuesto) AS total'])
 *   .from('proyectos')
 *   .groupBy({ rollup: ['departamento', 'equipo'] })
 *   .orderBy('departamento NULLS LAST');
 * // Subtotales al final gracias a NULLS LAST
 * 
 * @example
 * // Ejemplo 19: GROUPING SETS para comparaciones directas (PostgreSQL)
 * qb.select(['año_actual', 'año_anterior', 'SUM(diferencia) AS cambio'])
 *   .from('comparativa')
 *   .groupBy({ 
 *     groupingSets: [
 *       ['año_actual'],
 *       ['año_anterior']
 *     ]
 *   });
 * 
 * @example
 * // Ejemplo 20: ROLLUP con subconsulta
 * qb.select(['categoria', 'SUM(total_ventas) AS ventas'])
 *   .from(
 *     qb.select(['categoria', 'producto_id', 'SUM(cantidad) AS total_ventas'])
 *       .from('ventas')
 *       .groupBy(['categoria', 'producto_id'])
 *       .as('subquery')
 *   )
 *   .groupBy({ rollup: ['categoria'] });
 * 
 * @example
 * // Ejemplo 21: CUBE con FILTER WHERE (PostgreSQL 9.4+)
 * qb.select([
 *     'region',
 *     'producto',
 *     'SUM(cantidad) FILTER (WHERE año = 2024) AS ventas_2024'
 *   ])
 *   .from('ventas')
 *   .groupBy({ cube: ['region', 'producto'] });
 * 
 * @example
 * // Ejemplo 22: GROUPING SETS para totales parciales específicos (PostgreSQL)
 * qb.select(['pais', 'ciudad', 'tienda', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .groupBy({ 
 *     groupingSets: [
 *       ['pais', 'ciudad', 'tienda'],  // Detalle completo
 *       ['pais'],                       // Solo por país
 *       []                               // Total general
 *     ]
 *   });
 * // Salta el nivel "ciudad" en los subtotales
 * 
 * @example
 * // Ejemplo 23: ROLLUP con CASE en SELECT
 * qb.select([
 *     'tipo',
 *     'subtipo',
 *     "SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) AS activos"
 *   ])
 *   .from('registros')
 *   .groupBy({ rollup: ['tipo', 'subtipo'] });
 * 
 * @example
 * // Ejemplo 24: CUBE con funciones de ventana (PostgreSQL)
 * qb.select([
 *     'categoria',
 *     'subcategoria',
 *     'SUM(ventas) AS total',
 *     'RANK() OVER (ORDER BY SUM(ventas) DESC) AS ranking'
 *   ])
 *   .from('productos')
 *   .groupBy({ cube: ['categoria', 'subcategoria'] });
 * 
 * @example
 * // Ejemplo 25: GROUPING SETS mixto con columnas individuales (PostgreSQL)
 * qb.select(['año', 'trimestre', 'mes', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .groupBy({ 
 *     groupingSets: [
 *       ['año', 'trimestre', 'mes'],
 *       ['año', 'trimestre'],
 *       ['año']
 *     ]
 *   });
 * 
 * @example
 * // Ejemplo 26: ROLLUP con expresiones complejas
 * qb.select([
 *     'EXTRACT(YEAR FROM fecha) AS año',
 *     'EXTRACT(QUARTER FROM fecha) AS trimestre',
 *     'SUM(monto) AS total'
 *   ])
 *   .from('transacciones')
 *   .groupBy({ 
 *     rollup: [
 *       'EXTRACT(YEAR FROM fecha)',
 *       'EXTRACT(QUARTER FROM fecha)'
 *     ]
 *   });
 * 
 * @example
 * // Ejemplo 27: CUBE para matriz de correlación (PostgreSQL)
 * qb.select([
 *     'variable_x',
 *     'variable_y',
 *     'AVG(valor) AS promedio',
 *     'STDDEV(valor) AS desviacion'
 *   ])
 *   .from('mediciones')
 *   .groupBy({ cube: ['variable_x', 'variable_y'] });
 * 
 * @example
 * // Ejemplo 28: GROUPING SETS para períodos no consecutivos (PostgreSQL)
 * qb.select(['año', 'mes', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .where(qb.in('mes', [1, 6, 12]))  // Solo Enero, Junio, Diciembre
 *   .groupBy({ 
 *     groupingSets: [
 *       ['año', 'mes'],
 *       ['año']
 *     ]
 *   });
 * 
 * @example
 * // Ejemplo 29: ROLLUP con COALESCE para etiquetas
 * qb.select([
 *     "COALESCE(region, 'TOTAL') AS region",
 *     "COALESCE(ciudad, 'Subtotal') AS ciudad",
 *     'SUM(ventas) AS total'
 *   ])
 *   .from('ventas')
 *   .groupBy({ rollup: ['region', 'ciudad'] });
 * // NULLs de ROLLUP reemplazados por etiquetas descriptivas
 * 
 * @example
 * // Ejemplo 30: CUBE completo con múltiples métricas (PostgreSQL)
 * qb.select([
 *     'producto',
 *     'region',
 *     'canal',
 *     'COUNT(*) AS transacciones',
 *     'SUM(monto) AS ingresos',
 *     'AVG(monto) AS ticket_promedio',
 *     'MAX(monto) AS venta_maxima',
 *     'MIN(monto) AS venta_minima'
 *   ])
 *   .from('ventas')
 *   .groupBy({ cube: ['producto', 'region', 'canal'] })
 *   .having(qb.gt('SUM(monto)', 10000))
 *   .orderBy('ingresos DESC');
 * // Análisis multidimensional completo con 8 niveles de agregación
 * 
 * @see {@link QueryBuilder#groupBy} - Método que usa estas opciones
 * @see {@link types.columnName} - Tipo de columna aceptado
 * @see {@link QueryBuilder#having} - Filtrar grupos después de GROUP BY
 * @see {@link QueryBuilder#orderBy} - Ordenar resultados agrupados
 */

/**
 * Especificación para ordenar resultados en consultas SQL con ORDER BY.
 * Define cómo ordenar filas por una o más columnas en orden ascendente o descendente.
 * 
 * **Compatibilidad entre motores:**
 * | Motor         | ASC/DESC | NULLS FIRST/LAST | Expresiones | Índice posicional |
 * |---------------|----------|------------------|-------------|-------------------|
 * | PostgreSQL    | ✅ Sí    | ✅ Sí            | ✅ Sí       | ✅ Sí (1, 2, 3)   |
 * | MySQL         | ✅ Sí    | ❌ No            | ✅ Sí       | ✅ Sí             |
 * | SQL Server    | ✅ Sí    | ❌ No (workaround) | ✅ Sí     | ✅ Sí             |
 * | Oracle        | ✅ Sí    | ✅ Sí            | ✅ Sí       | ✅ Sí             |
 * | SQLite        | ✅ Sí    | ❌ No            | ✅ Sí       | ✅ Sí             |
 * | MongoDB       | ⚠️ sort() | ⚠️ N/A          | ⚠️ $sort    | ⚠️ N/A            |
 * 
 * @global
 * @typedef {string|columnName|Column|Object} types.orderBySpec
 * 
 * Cuando es **string**: Columna con dirección opcional:
 * - Formato: `"columna"` (ASC por defecto) o `"columna ASC"` / `"columna DESC"`
 * - Ejemplos: `"nombre"`, `"edad DESC"`, `"precio ASC"`
 * 
 * Cuando es **columnName/Column**: Objeto Column para ordenamiento:
 * - Se ordena ascendente por defecto
 * - Ejemplo: `qb.col('nombre', 'usuarios')`
 * 
 * Cuando es **Object**: Especificación detallada con propiedades:
 * @property {columnName} col - Nombre de la columna o expresión por la cual ordenar
 * @property {"ASC"|"DESC"} [order="ASC"] - Dirección del ordenamiento:
 * - `"ASC"`: Ascendente (menor a mayor, A-Z) - valor por defecto
 * - `"DESC"`: Descendente (mayor a menor, Z-A)
 * 
 * @example
 * // Ejemplo 1: String simple - orden ascendente por defecto
 * qb.select('*').from('usuarios').orderBy('nombre');
 * // SQL: SELECT * FROM usuarios ORDER BY nombre ASC
 * 
 * @example
 * // Ejemplo 2: String con dirección DESC
 * qb.select('*').from('productos').orderBy('precio DESC');
 * // SQL: SELECT * FROM productos ORDER BY precio DESC
 * 
 * @example
 * // Ejemplo 3: Array de strings
 * qb.select('*').from('empleados')
 *   .orderBy(['departamento ASC', 'salario DESC']);
 * // SQL: SELECT * FROM empleados ORDER BY departamento ASC, salario DESC
 * 
 * @example
 * // Ejemplo 4: Objeto con col y order
 * qb.select('*').from('ventas')
 *   .orderBy({ col: 'fecha', order: 'DESC' });
 * // SQL: SELECT * FROM ventas ORDER BY fecha DESC
 * 
 * @example
 * // Ejemplo 5: Array de objetos
 * qb.select('*').from('productos')
 *   .orderBy([
 *     { col: 'categoria', order: 'ASC' },
 *     { col: 'precio', order: 'DESC' }
 *   ]);
 * // SQL: SELECT * FROM productos ORDER BY categoria ASC, precio DESC
 * 
 * @example
 * // Ejemplo 6: Column object
 * qb.select('*').from(['usuarios', 'u'])
 *   .orderBy(qb.col('fecha_registro', 'u'));
 * // SQL: SELECT * FROM usuarios u ORDER BY u.fecha_registro ASC
 * 
 * @example
 * // Ejemplo 7: Array de Column objects
 * qb.select('*').from(['empleados', 'e'])
 *   .orderBy([
 *     qb.col('apellido', 'e'),
 *     qb.col('nombre', 'e')
 *   ]);
 * // SQL: SELECT * FROM empleados e ORDER BY e.apellido, e.nombre
 * 
 * @example
 * // Ejemplo 8: Ordenar por expresión COUNT
 * qb.select(['categoria', 'COUNT(*) AS total'])
 *   .from('productos')
 *   .groupBy('categoria')
 *   .orderBy('COUNT(*) DESC');
 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos
 * //      GROUP BY categoria ORDER BY COUNT(*) DESC
 * 
 * @example
 * // Ejemplo 9: Ordenar por alias de columna
 * qb.select(['nombre', 'precio * cantidad AS total'])
 *   .from('ventas')
 *   .orderBy('total DESC');
 * // SQL: SELECT nombre, precio * cantidad AS total FROM ventas
 * //      ORDER BY total DESC
 * 
 * @example
 * // Ejemplo 10: Ordenar por función UPPER
 * qb.select('*').from('usuarios')
 *   .orderBy('UPPER(nombre) ASC');
 * // SQL: SELECT * FROM usuarios ORDER BY UPPER(nombre) ASC
 * 
 * @example
 * // Ejemplo 11: Ordenar por índice posicional
 * qb.select(['nombre', 'edad', 'ciudad'])
 *   .from('usuarios')
 *   .orderBy('2 DESC');  // Ordenar por segunda columna (edad)
 * // SQL: SELECT nombre, edad, ciudad FROM usuarios ORDER BY 2 DESC
 * 
 * @example
 * // Ejemplo 12: Ordenar con NULLS LAST (PostgreSQL/Oracle)
 * qb.select('*').from('clientes')
 *   .orderBy('email ASC NULLS LAST');
 * // SQL: SELECT * FROM clientes ORDER BY email ASC NULLS LAST
 * 
 * @example
 * // Ejemplo 13: Ordenar por fecha descendente
 * qb.select('*').from('pedidos')
 *   .orderBy({ col: 'fecha_pedido', order: 'DESC' });
 * // SQL: SELECT * FROM pedidos ORDER BY fecha_pedido DESC
 * 
 * @example
 * // Ejemplo 14: Múltiples columnas con diferentes direcciones
 * qb.select('*').from('empleados')
 *   .orderBy([
 *     { col: 'departamento', order: 'ASC' },
 *     { col: 'puesto', order: 'ASC' },
 *     { col: 'salario', order: 'DESC' }
 *   ]);
 * // SQL: SELECT * FROM empleados 
 * //      ORDER BY departamento ASC, puesto ASC, salario DESC
 * 
 * @example
 * // Ejemplo 15: Ordenar por CASE expression
 * qb.select('*').from('tareas')
 *   .orderBy("CASE prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END");
 * // SQL: SELECT * FROM tareas 
 * //      ORDER BY CASE prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END
 * 
 * @example
 * // Ejemplo 16: Ordenar por función de fecha
 * qb.select('*').from('eventos')
 *   .orderBy('YEAR(fecha) DESC, MONTH(fecha) DESC');
 * // SQL: SELECT * FROM eventos ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC
 * 
 * @example
 * // Ejemplo 17: Ordenar con función agregada y HAVING
 * qb.select(['vendedor', 'SUM(ventas) AS total'])
 *   .from('ventas')
 *   .groupBy('vendedor')
 *   .having(qb.gt('SUM(ventas)', 10000))
 *   .orderBy('SUM(ventas) DESC');
 * // SQL: SELECT vendedor, SUM(ventas) AS total FROM ventas
 * //      GROUP BY vendedor HAVING SUM(ventas) > 10000
 * //      ORDER BY SUM(ventas) DESC
 * 
 * @example
 * // Ejemplo 18: Ordenar por campo JSON (PostgreSQL)
 * qb.select('*').from('usuarios')
 *   .orderBy("datos->>'edad' DESC");
 * // SQL: SELECT * FROM usuarios ORDER BY datos->>'edad' DESC
 * 
 * @example
 * // Ejemplo 19: Ordenar por LENGTH de string
 * qb.select('*').from('productos')
 *   .orderBy([
 *     { col: 'LENGTH(nombre)', order: 'DESC' },
 *     { col: 'nombre', order: 'ASC' }
 *   ]);
 * // SQL: SELECT * FROM productos ORDER BY LENGTH(nombre) DESC, nombre ASC
 * 
 * @example
 * // Ejemplo 20: Ordenar por COALESCE
 * qb.select('*').from('contactos')
 *   .orderBy("COALESCE(apellido, nombre) ASC");
 * // SQL: SELECT * FROM contactos ORDER BY COALESCE(apellido, nombre) ASC
 * 
 * @example
 * // Ejemplo 21: Ordenar con expresión matemática
 * qb.select(['nombre', 'precio', 'descuento'])
 *   .from('productos')
 *   .orderBy('(precio - descuento) DESC');
 * // SQL: SELECT nombre, precio, descuento FROM productos
 * //      ORDER BY (precio - descuento) DESC
 * 
 * @example
 * // Ejemplo 22: Ordenar por RANDOM (diferentes sintaxis)
 * // PostgreSQL: qb.select('*').from('usuarios').orderBy('RANDOM()');
 * // MySQL: qb.select('*').from('usuarios').orderBy('RAND()');
 * // SQL Server: qb.select('*').from('usuarios').orderBy('NEWID()');
 * // SQLite: qb.select('*').from('usuarios').orderBy('RANDOM()');
 * 
 * @example
 * // Ejemplo 23: Ordenar con DISTINCT
 * qb.select('DISTINCT categoria').from('productos')
 *   .orderBy('categoria ASC');
 * // SQL: SELECT DISTINCT categoria FROM productos ORDER BY categoria ASC
 * 
 * @example
 * // Ejemplo 24: Ordenar en subconsulta
 * const subquery = qb.select('*')
 *   .from('empleados')
 *   .orderBy('salario DESC')
 *   .limit(10);
 * qb.select('*').from(subquery.as('top_earners'))
 *   .orderBy('nombre ASC');
 * 
 * @example
 * // Ejemplo 25: Ordenar por tabla cualificada en JOIN
 * qb.select(['u.nombre', 'p.titulo'])
 *   .from(['usuarios', 'u'])
 *   .join(['posts', 'p'], 'u.id = p.usuario_id')
 *   .orderBy([
 *     { col: 'u.nombre', order: 'ASC' },
 *     { col: 'p.fecha', order: 'DESC' }
 *   ]);
 * // SQL: SELECT u.nombre, p.titulo FROM usuarios u
 * //      JOIN posts p ON u.id = p.usuario_id
 * //      ORDER BY u.nombre ASC, p.fecha DESC
 * 
 * @example
 * // Ejemplo 26: Ordenar con COLLATE (ordenamiento específico de idioma)
 * qb.select('*').from('nombres')
 *   .orderBy('nombre COLLATE utf8_spanish_ci ASC');
 * // SQL: SELECT * FROM nombres ORDER BY nombre COLLATE utf8_spanish_ci ASC
 * 
 * @example
 * // Ejemplo 27: Ordenar por booleano
 * qb.select('*').from('tareas')
 *   .orderBy([
 *     { col: 'completada', order: 'ASC' },  // false primero, true después
 *     { col: 'prioridad', order: 'DESC' }
 *   ]);
 * // SQL: SELECT * FROM tareas ORDER BY completada ASC, prioridad DESC
 * 
 * @example
 * // Ejemplo 28: Ordenar con función CONCAT
 * qb.select('*').from('personas')
 *   .orderBy("CONCAT(apellido, ', ', nombre) ASC");
 * // SQL: SELECT * FROM personas ORDER BY CONCAT(apellido, ', ', nombre) ASC
 * 
 * @example
 * // Ejemplo 29: Ordenar por distancia calculada (geospacial)
 * qb.select(['nombre', 'ST_Distance(ubicacion, punto) AS distancia'])
 *   .from('lugares')
 *   .orderBy('ST_Distance(ubicacion, punto) ASC');
 * // SQL: SELECT nombre, ST_Distance(ubicacion, punto) AS distancia FROM lugares
 * //      ORDER BY ST_Distance(ubicacion, punto) ASC
 * 
 * @example
 * // Ejemplo 30: Ordenar mezclando todos los formatos
 * qb.select(['categoria', 'nombre', 'precio', 'stock'])
 *   .from(['productos', 'p'])
 *   .orderBy([
 *     'categoria ASC',                           // String con dirección
 *     { col: 'precio', order: 'DESC' },          // Objeto
 *     qb.col('stock', 'p'),                      // Column object
 *     'LOWER(nombre) ASC'                        // Expresión
 *   ]);
 * // SQL: SELECT categoria, nombre, precio, stock FROM productos p
 * //      ORDER BY categoria ASC, precio DESC, p.stock, LOWER(nombre) ASC
 * 
 * @see {@link QueryBuilder#orderBy} - Método que usa esta especificación
 * @see {@link types.columnName} - Tipo de nombre de columna
 * @see {@link Column} - Clase Column para referencias tipadas
 * @see {@link QueryBuilder#select} - Debe usarse antes de ORDER BY
 * @see {@link QueryBuilder#groupBy} - Ordenar resultados agrupados
 * @see {@link QueryBuilder#having} - Filtrar antes de ordenar
 * @see {@link QueryBuilder#limit} - Limitar resultados ordenados
 * @see {@link QueryBuilder#offset} - Saltar filas en resultados ordenados
 */

/**
 * Opciones para la creación de cursores SQL.
 * 
 * Los cursores permiten navegar por los resultados de una consulta fila por fila,
 * especialmente útil para procesar grandes volúmenes de datos sin cargar todo en memoria.
 * 
 * @global
 * @typedef {Object} createCursorOptions
 * 
 * @property {boolean} [scroll] - Si es true, permite navegación bidireccional (SCROLL).
 * Por defecto, los cursores solo permiten avanzar (NO SCROLL).
 * - **true**: Cursor SCROLL - puede moverse hacia adelante y atrás (FETCH PRIOR, FETCH FIRST, etc.)
 * - **false**: Cursor NO SCROLL - solo puede avanzar (FETCH NEXT)
 * 
 * @property {string} [sensitivity] - Sensibilidad del cursor a cambios en los datos ('SENSITIVE', 'INSENSITIVE', 'ASENSITIVE').
 * - **'INSENSITIVE'**: El cursor usa una copia de los datos, no refleja cambios posteriores
 * - **'SENSITIVE'**: El cursor refleja cambios en los datos subyacentes
 * - **'ASENSITIVE'**: El cursor puede o no reflejar cambios (por defecto en muchos SGBDs)
 * 
 * @property {boolean} [hold] - Si es true, mantiene el cursor abierto después de COMMIT (WITH HOLD).
 * Por defecto, los cursores se cierran automáticamente al finalizar la transacción.
 * - **true**: WITH HOLD - cursor permanece abierto después de COMMIT
 * - **false**: WITHOUT HOLD - cursor se cierra al hacer COMMIT (comportamiento por defecto)
 * 
 * @property {string} [updateMode] - Modo de actualización ('READ ONLY', 'UPDATE').
 * - **'READ ONLY'**: Cursor de solo lectura, no permite actualizar datos
 * - **'UPDATE'**: Cursor permite actualizar filas (FOR UPDATE)
 * 
 * @example
 * // Cursor básico (solo lectura, avance secuencial)
 * const options = {};
 * 
 * @example
 * // Cursor con scroll (navegación bidireccional)
 * const options = {
 *   scroll: true
 * };
 * 
 * @example
 * // Cursor insensible que persiste después de commit
 * const options = {
 *   sensitivity: 'INSENSITIVE',
 *   hold: true
 * };
 * 
 * @example
 * // Cursor para actualizaciones
 * const options = {
 *   scroll: true,
 *   updateMode: 'UPDATE'
 * };
 * 
 * @see {@link QueryBuilder#createCursor} - Método que usa estas opciones
 * @see {@link Cursor} - Clase Cursor que implementa la funcionalidad
 */

/**
 * Opciones para configurar transacciones SQL.
 * 
 * Las transacciones permiten agrupar múltiples operaciones SQL en una unidad atómica,
 * garantizando consistencia de datos mediante COMMIT o ROLLBACK.
 * 
 * @global
 * @typedef {Object} transactionOptions
 * 
 * @property {string} [isolationLevel] - Nivel de aislamiento de la transacción.
 * Controla cómo las transacciones concurrentes interactúan entre sí.
 * - **'READ UNCOMMITTED'**: Permite lecturas sucias (dirty reads). Menor aislamiento.
 * - **'READ COMMITTED'**: Solo lee datos confirmados. Previene lecturas sucias.
 * - **'REPEATABLE READ'**: Garantiza lecturas consistentes. Previene lecturas no repetibles.
 * - **'SERIALIZABLE'**: Máximo aislamiento. Las transacciones se ejecutan como si fueran seriales.
 * 
 * Niveles soportados varían según el SGBD:
 * - PostgreSQL: Todos los niveles
 * - MySQL/MariaDB: Todos los niveles
 * - SQL Server: Todos los niveles + SNAPSHOT
 * - SQLite: Solo SERIALIZABLE (implícito)
 * 
 * @property {boolean} [readOnly] - Si es true, la transacción es de solo lectura.
 * Las transacciones de solo lectura pueden optimizar el rendimiento.
 * - **true**: READ ONLY - no permite INSERT, UPDATE, DELETE
 * - **false**: READ WRITE - permite todas las operaciones (por defecto)
 * 
 * @property {boolean} [deferrable] - Si es true, la transacción puede diferirse (solo PostgreSQL).
 * Permite que transacciones SERIALIZABLE READ ONLY se ejecuten sin bloqueos.
 * - **true**: DEFERRABLE - puede esperar a que otras transacciones finalicen
 * - **false**: NOT DEFERRABLE - se ejecuta inmediatamente (por defecto)
 * 
 * @property {string} [mode] - Modo de acceso de la transacción ('READ WRITE', 'READ ONLY').
 * Alternativa a la propiedad `readOnly`.
 * 
 * @example
 * // Transacción básica (valores por defecto)
 * const options = {};
 * 
 * @example
 * // Transacción con nivel de aislamiento máximo
 * const options = {
 *   isolationLevel: 'SERIALIZABLE'
 * };
 * 
 * @example
 * // Transacción de solo lectura para consultas
 * const options = {
 *   isolationLevel: 'READ COMMITTED',
 *   readOnly: true
 * };
 * 
 * @example
 * // Transacción diferible en PostgreSQL
 * const options = {
 *   isolationLevel: 'SERIALIZABLE',
 *   readOnly: true,
 *   deferrable: true
 * };
 * 
 * @see {@link QueryBuilder#setTransaction} - Método que usa estas opciones
 * @see {@link Transaction} - Clase Transaction que implementa la funcionalidad
 * @see {@link QueryBuilder#commit} - Confirmar transacción
 * @see {@link QueryBuilder#rollback} - Revertir transacción
 */

/**
 * Tipo de modo para establecer restricciones en transacciones SQL.
 * 
 * Define cuándo se verifican las restricciones de integridad (FOREIGN KEY, CHECK, etc.)
 * durante una transacción.
 * 
 * @global
 * @typedef {string} constraintMode
 * 
 * @description
 * Valores permitidos:
 * 
 * - **'DEFERRED'**: Las restricciones se verifican al final de la transacción (COMMIT).
 *   Permite operaciones intermedias que violarían temporalmente las restricciones.
 *   Útil para operaciones complejas que deben completarse antes de validar integridad.
 *   
 * - **'IMMEDIATE'**: Las restricciones se verifican inmediatamente después de cada statement.
 *   Es el comportamiento por defecto en la mayoría de los SGBDs.
 *   Garantiza integridad constante durante toda la transacción.
 * 
 * **Soporte por SGBD:**
 * - PostgreSQL: ✅ Soporta ambos modos completamente
 * - Oracle: ✅ Soporta ambos modos completamente
 * - SQL Server: ❌ No soporta SET CONSTRAINTS (usa CHECK con NOCHECK)
 * - MySQL/MariaDB: ❌ No soporta SET CONSTRAINTS
 * - SQLite: ⚠️ Soporte limitado (solo para FOREIGN KEYS con PRAGMA)
 * 
 * **Consideraciones:**
 * - Solo afecta a restricciones DEFERRABLE (deben declararse como DEFERRABLE al crearlas)
 * - Las restricciones NOT DEFERRABLE siempre se verifican IMMEDIATE
 * - DEFERRED es útil para evitar deadlocks en operaciones complejas
 * - IMMEDIATE detecta errores más temprano, facilitando debugging
 * 
 * @example
 * // Diferir todas las restricciones hasta el COMMIT
 * qb.setConstraints(['fk_usuario_rol', 'fk_rol_permiso'], 'DEFERRED');
 * // SQL: SET CONSTRAINTS fk_usuario_rol, fk_rol_permiso DEFERRED
 * 
 * @example
 * // Verificar restricciones inmediatamente
 * qb.setConstraints(['ALL'], 'IMMEDIATE');
 * // SQL: SET CONSTRAINTS ALL IMMEDIATE
 * 
 * @see {@link QueryBuilder#setConstraints} - Método que usa este tipo
 * @see {@link types.constraintOptions} - Para crear restricciones
 * @see {@link QueryBuilder#setTransaction} - Para manejar transacciones
 */

/**
 * Especifica qué restricciones se verán afectadas por el comando SET CONSTRAINTS.
 * 
 * Permite seleccionar restricciones individuales, múltiples o todas a la vez
 * para cambiar su modo de verificación en una transacción.
 * 
 * @global
 * @typedef {string|Array<string>} constraintNames
 * 
 * @description
 * Formatos permitidos:
 * 
 * **String único:**
 * - Nombre de una restricción específica (ej: 'fk_usuario_rol')
 * - 'ALL' - Afecta a todas las restricciones DEFERRABLE de la transacción
 * 
 * **Array de strings:**
 * - Lista de nombres de restricciones específicas
 * - Permite aplicar el mismo modo a múltiples restricciones
 * - Ejemplo: ['fk_usuario_rol', 'fk_rol_permiso', 'check_edad_valida']
 * 
 * **Consideraciones:**
 * - Los nombres de restricciones deben corresponder a constraints existentes
 * - Solo afecta a restricciones declaradas como DEFERRABLE
 * - Los nombres pueden estar calificados con el esquema (schema.nombre_constraint)
 * - Usar 'ALL' es útil para cambiar el modo de todas las restricciones a la vez
 * - Los nombres son case-sensitive en algunos SGBDs (PostgreSQL si están entre comillas)
 * 
 * **Soporte por SGBD:**
 * - PostgreSQL: ✅ Soporta nombres individuales, arrays y 'ALL'
 * - Oracle: ✅ Soporta nombres individuales y 'ALL'
 * - SQL Server: ❌ No soporta SET CONSTRAINTS
 * - MySQL/MariaDB: ❌ No soporta SET CONSTRAINTS
 * - SQLite: ⚠️ Soporte limitado
 * 
 * @example
 * // Una sola restricción
 * const restrictions = 'fk_usuario_rol';
 * 
 * @example
 * // Múltiples restricciones
 * const restrictions = ['fk_usuario_rol', 'fk_rol_permiso', 'check_edad'];
 * 
 * @example
 * // Todas las restricciones
 * const restrictions = 'ALL';
 * 
 * @example
 * // Restricción con esquema calificado
 * const restrictions = 'public.fk_orders_customers';
 * 
 * @see {@link QueryBuilder#setConstraints} - Método que usa este tipo
 * @see {@link constraintMode} - Modo de verificación a aplicar
 * @see {@link types.constraintOptions} - Para crear restricciones DEFERRABLE
 */

/**
 * Especificación de usuario para operaciones de base de datos
 * 
 * @global
 * @typedef {string|Object} userSpec
 * 
 * @description
 * Define las formas de especificar un usuario en operaciones SQL:
 * 
 * **String simple:**
 * - Nombre de usuario sin host (ej: 'usuario1')
 * - Formato completo 'usuario@host' (ej: 'admin@localhost')
 * 
 * **Objeto con propiedades:**
 * - `user` {string} - Nombre del usuario (requerido)
 * - `host` {string} - Host del usuario (opcional, por defecto '%')
 * 
 * **Consideraciones:**
 * - Si no se especifica host, se usa '%' (cualquier host) en la mayoría de SGBDs
 * - MySQL/MariaDB: El host es significativo para permisos
 * - PostgreSQL: Usa roles, no host; el campo host se ignora
 * - El formato 'usuario@host' es específico de MySQL/MariaDB
 * 
 * **Soporte por SGBD:**
 * - MySQL/MariaDB: ✅ Soporta usuario@host completamente
 * - PostgreSQL: ⚠️ Solo usuario (roles), ignora host
 * - Oracle: ⚠️ Solo usuario, ignora host
 * - SQL Server: ⚠️ Solo usuario, ignora host
 * 
 * @example
 * // String simple - usuario sin host específico
 * const user = 'miusuario';
 * 
 * @example
 * // String con formato completo
 * const user = 'admin@localhost';
 * 
 * @example
 * // Objeto con usuario y host
 * const user = {
 *   user: 'miusuario',
 *   host: '192.168.1.%'
 * };
 * 
 * @example
 * // Objeto solo con usuario (host por defecto '%')
 * const user = {
 *   user: 'readonly_user'
 * };
 * 
 * @see {@link QueryBuilder#getAccount} - Método que usa este tipo
 */

/**
 * Información sobre funciones disponibles en QueryBuilder
 * 
 * @global
 * @typedef {Object} availableFunctions
 * @property {number} total - Número total de funciones disponibles
 * @property {Array<string>} functions - Lista ordenada alfabéticamente de todas las funciones disponibles
 * @property {Array<string>} basic - Lista de funciones básicas disponibles (SELECT, FROM, WHERE, JOIN, etc.)
 * @property {Array<string>} extended - Lista de funciones extendidas disponibles (cursores, strings, utilidades, etc.)
 * 
 * @description
 * Este objeto proporciona información completa sobre las funciones disponibles
 * en una instancia de QueryBuilder, categorizadas por tipo.
 * 
 * **Funciones básicas incluyen:**
 * - Consultas: select, from, where, orderBy, groupBy, having
 * - Operadores: eq, ne, gt, gte, lt, lte, like, in, between
 * - Lógicos: and, or, not, exists, isNull, isNotNull
 * - JOINs: innerJoin, leftJoin, rightJoin, fullJoin, crossJoin, on
 * - Agregación: count, sum, avg, min, max
 * - Modificación: insert, update, delete, createTable, dropTable
 * - Utilidad: dropQuery, toString, execute
 * 
 * **Funciones extendidas incluyen:**
 * - Strings: concat, coalesce, nullif, trim, ltrim, rtrim, length
 * - CASE: when, then, else, end
 * - Cursores: fetch, createCursor, openCursor, closeCursor
 * - Transacciones: setTransaction, setConstraints
 * - Consultas: queryJoin
 * - Usuarios: getAccount
 * - Helpers: insertInto, limitOffset
 * 
 * **Nota sobre transacciones:**
 * - Las funciones de transacciones se manejan a través de la clase Transaction
 * - Use `qb.setTransaction()` para obtener una instancia de Transaction
 * - Los métodos de Transaction incluyen: start, commit, rollback, setSavePoint, clearSavePoint
 * - Para generar SQL de transacciones sin ejecutar, use `qb.language.startTransaction()`, etc.
 * 
 * @example
 * const info = qb.getAvailableFunctions();
 * console.log(`Total de funciones: ${info.total}`);
 * console.log(`Funciones básicas: ${info.basic.length}`);
 * console.log(`Funciones extendidas: ${info.extended.length}`);
 * 
 * @example
 * // Verificar si una función existe
 * const info = qb.getAvailableFunctions();
 * if (info.functions.includes('concat')) {
 *   console.log('La función concat está disponible');
 * }
 * 
 * @see {@link QueryBuilder#getAvailableFunctions} - Método que retorna este tipo
 * @see {@link Transaction} - Clase para manejo de transacciones
 */
