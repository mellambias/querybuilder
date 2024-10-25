# QUERYBUILDER

## RDBMS

Aquí tienes una tabla con algunos de los sistemas de gestión de bases de datos relacionales (RDBMS) más utilizados:

|RDBMS| Descripción| Uso Común|
|-----|-----------|---------|
|**MySQL**| Uno de los RDBMS más populares, conocido por ser de código abierto.| Web, aplicaciones empresariales, CMS.|
|**PostgreSQL**| RDBMS de código abierto, muy robusto y con soporte avanzado de SQL.| Aplicaciones empresariales, análisis de datos.|
|**Microsoft SQL Server**| RDBMS propietario de Microsoft, usado en muchos entornos corporativos.| Aplicaciones empresariales, Windows servers.|
|**Oracle Database**|RDBMS comercial líder, usado en grandes organizaciones por su escalabilidad.| Grandes empresas, aplicaciones críticas.|
|**SQLite**| Base de datos ligera y embebida, sin necesidad de servidor.| Aplicaciones móviles, desarrollo, prototipos.|
|**MariaDB**| Fork de MySQL, enfocado en ser completamente abierto y compatible.| Aplicaciones web y empresariales.|
|**IBM Db2**| Base de datos de IBM, orientada a aplicaciones empresariales y de misión crítica.| Grandes empresas, análisis de datos.|

### RDBMS POR USOS

- **MySQL**, **MariaDB** y **PostgreSQL** son las opciones más comunes en entornos de desarrollo y producción abiertos.
- **Microsoft SQL Server** y **Oracle** son muy usados en entornos corporativos grandes.
- **SQLite** es ideal para aplicaciones embebidas o de escritorio.

## DBMS NoSQL

Aquí tienes una tabla con algunos de los sistemas de bases de datos NoSQL más utilizados:

| **NoSQL**        | **Descripción**                                                             | **Modelo de Datos**              | **Uso Común**                                    |
|------------------|-----------------------------------------------------------------------------|----------------------------------|--------------------------------------------------|
| **MongoDB**      | Base de datos NoSQL orientada a documentos (JSON). Muy popular y escalable.  | Documentos (JSON/BSON)           | Aplicaciones web, big data, almacenamiento flexible. |
| **Cassandra**    | Base de datos NoSQL distribuida, diseñada para manejar grandes volúmenes de datos. | Columnar distribuido             | Big data, alta disponibilidad, escalabilidad horizontal. |
| **Redis**        | Base de datos NoSQL en memoria, extremadamente rápida, usada como caché o almacenamiento clave-valor. | Clave-Valor                      | Caché, sesiones, contadores, colas en tiempo real.  |
| **CouchDB**      | Base de datos NoSQL orientada a documentos que utiliza JSON para almacenar datos. | Documentos (JSON)                | Aplicaciones web, sincronización offline-online.    |
| **DynamoDB**     | Base de datos NoSQL de Amazon Web Services (AWS), completamente gestionada y de alta disponibilidad. | Clave-Valor, Documentos          | Aplicaciones en la nube, IoT, escalabilidad global. |
| **Neo4j**        | Base de datos NoSQL orientada a grafos, diseñada para manejar relaciones complejas. | Grafo                           | Análisis de redes, recomendaciones, análisis de relaciones complejas. |
| **HBase**        | Base de datos distribuida de Google Bigtable, diseñada para grandes volúmenes de datos. | Columnar                         | Big data, procesamiento de grandes volúmenes de datos. |
| **Elasticsearch**| Motor de búsqueda basado en NoSQL, usado para análisis de datos y búsquedas complejas. | Clave-Valor, Documentos          | Búsqueda, análisis de logs, motores de búsqueda.    |

### NoSQL POR USOS

- **MongoDB** y **CouchDB** se enfocan en modelos de datos orientados a documentos.
- **Cassandra** y **HBase** son opciones para manejar grandes volúmenes de datos distribuidos.
- **Redis** y **DynamoDB** destacan por su velocidad y uso en tiempo real.
- **Neo4j** es ideal para aplicaciones que requieren la gestión de relaciones complejas.
- **Elasticsearch** se usa principalmente para búsqueda y análisis en tiempo real.

Cada base de datos NoSQL tiene un propósito específico dependiendo del tipo de datos y la escalabilidad requerida.

## Entorno SQL

Un **identificador** se puede asignar a cualquier objeto que se crea con instrucciones SQL, tales como dominios, tablas, columnas, vistas o esquemas

- **Los identificadores regulares** son bastante restrictivos y deben seguir convenios específicos:

  - Los nombres no se distinguen entre mayúsculas y minúsculas. Por ejemplo, Nombres_Artista es lo mismo que NOMBRES_ARTISTA y nombres_artista.
  - Sólo se permiten letras, dígitos y guiones. Por ejemplo, se pueden crear identificadores tales como Primer_Nombre, 1erNombre o PRIMER_NOMBRE. Observe que el guión bajo es el único carácter válido que se usa como separador entre palabras.
  - Los espacios no son aceptables ni tampoco guiones
  - No se puede utilizar palabras clave reservadas en SQL.

- **Los idenfificadores delimitados** deben seguir convenios específicos:

  - El identificador debe estar incluido en un conjunto de comillas dobles, como el identificador “NombresArtista”
  - Las comillas no se almacenan en la base de datos, pero todos los demás caracteres se almacenan como aparecen en la instrucción SQL
  - Los nombres son sensibles a mayúsculas y minúsculas.
  - La mayoría de los caracteres están permitidos, incluyendo espacios.
  - Se pueden utilizar palabras clave reservadas a SQL

## Nombres calificados

Todos los identificadores de esquema de objeto se califican por la forma lógica en la que encajan
en la estructura jerárquica del entorno SQL. Un nombre completo calificado incluye el **nombre del
catálogo**, el **nombre del esquema** y el **nombre del objeto de esquema**, cada uno separado por un
punto

## Crear una Base de datos o un esquema

### EN **MySQL** y **MariaDB**

`CREATE DATABASE` y `CREATE SCHEMA` son equivalentes

```sql
CREATE SCHEMA <nombre de la cláusula>
[ <conjunto de caracteres o ruta> ]
[ <elementos del esquema> ]
```

- nombre de la cláusula: `nombre esquema` y opcionalmente **AUTHORIZATION** `idendificador de autorizacion`

#### Connectores

Librerias de Node.js para conectarse a la base de datos

- [mysql2](https://sidorares.github.io/node-mysql2/docs/documentation)
- [@mysql/xdevapi](https://dev.mysql.com/doc/x-devapi-userguide/en/)
  Es una libreria que utiliza el protocolo X para el acceso a bases de datos documentales

- [MySQL Shell API](https://dev.mysql.com/doc/dev/mysqlsh-api-javascript/9.0/)
  - **X DevAPI** - NoSQL Database API for MySQL and the MySQL Document Store.
  - **ShellAPI** - Shell API and backward compatibility API for MySQL Servers not supporting the X DevAPI.
  - **AdminAPI** - API for setting up and managing InnoDB Clusters, InnoDB ReplicaSets, and InnoDB ClusterSets.

### PostgresSQL

**psql** es el CLI de postgresSql
  -U username
  -W password

- **pgAdmin**, a graphical tool for managing and developing your databases
- **StackBuilder**, a package manager for downloading and installing additional PostgreSQL tools and drivers. Stackbuilder includes management, integration, migration, replication, geospatial, connectors and other tools.

usaremos [node-postgres](https://node-postgres.com/) como libreria de node

La estructura de posgresSQL permite crear bases de datos y dentro de estas, Esquemas que permiten separar los objetos de la base de datos

- Base de datos
  - Schema

## TIPOS DE COMANDOS SQL

- **DDL**
  - Create
  - Drop
  - Alter
  - Truncate
- **DCL**
  - Grant
  - Revoke
- **DML**
  - Insert
  - Update
  - Delete
- **TCL**
  - Commit
  - Rollback
  - SavePoint
- **DQL**
  - Select

## Creacion de Tablas

### SQL2006

- Tipos de tabla
  - **Tablas base persistentes** Un objeto de esquema nombrado definido por la definición de una
tabla en la instrucción `CREATE TABLE`. Las tablas base persistentes tienen los datos de SQL
que se almacenan en la base de datos. Éste es el tipo más común de tabla base y es a menudo a
lo que se refiere la gente cuando menciona tablas base o tablas. Una tabla base persistente existe
desde que la definición de tabla existe, y se puede llamar desde cualquier sesión de SQL.

- **Tablas temporales globales** Un objeto de esquema nombrado definido por una definición de
tabla en la instrucción `CREATE GLOBAL TEMPORARY TABLE`. Aunque la definición
de la tabla es parte del esquema, la tabla actual existe sólo cuando se hace referencia dentro
del contexto de la sesión SQL en la cual se creó. Cuando la sesión termina, la tabla ya no existe.
No se puede acceder a una tabla temporal global creada en una sesión desde otra sesión de
SQL. Los contenidos son distintos en cada sesión de SQL.

- **Tablas temporales locales creadas** Un objeto de esquema nombrado definido por una definición
de tabla en la instrucción `CREATE LOCAL TEMPORARY TABLE`. Al igual que una
tabla temporal global, sólo se puede hacer referencia a una tabla temporal local creada dentro
del contexto de la sesión de SQL en la cual se creó, y no se puede acceder desde otra sesión
de SQL. Sin embargo, se puede acceder a una tabla global desde cualquier lugar dentro de una
sesión asociada de SQL, mientras que en una tabla temporal local sólo se podrá acceder dentro
del módulo asociado. Los contenidos son distintos dentro de ese módulo.

- **Tablas temporales locales declaradas** Una tabla declarada como parte de un procedimiento
en un módulo. La definición de la tabla no se incluye en el esquema y no existe hasta que ese
procedimiento se ejecuta. Al igual que otras tablas temporales, sólo se hace referencia a una
tabla temporal local declarada dentro del contexto de la sesión SQL en la cual se creó.

```sql
CREATE [ {GLOBAL | LOCAL} TEMPORARY ] TABLE <nombre de la tabla>
( <elemento de la tabla> [ {, <elemento de la tabla> }... ] )
[ ON COMMIT { PRESERVE | DELETE } ROWS ]
```

- Definir una columna

```sql
<nombre de columna> { <tipo de datos> | <dominio> }
[ <cláusula predeterminada> ] [ <restricción de columna> ] [ COLLATE
<nombre de cotejo> ]
```

## TIPOS DE DATOS

|Tipo de dato| Descripción/ejemplo|
|---|----|
|CHARACTER |Especifica el número exacto de caracteres (que debe ser de un conjunto de caracteres) que se almacenará por cada valor. Por ejemplo, si se define el número de caracteres como 10, pero el valor contiene sólo seis caracteres, los cuatro caracteres restantes serán espacios. El tipo de dato puede abreviarse como CHAR. Ejemplo: NOMBRE_ARTISTA CHAR(60)|
|CHARACTER VARYING|Especifica el mayor número de caracteres (que debe ser de un conjunto de caracteres) que se incluyen en un valor. El número de caracteres almacenados es exactamente el mismo número que el valor introducido; por lo tanto, no se agregan espacios al valor. El tipo de dato puede abreviarse como CHAR VARYING o VARCHAR. Ejemplo: NOMBRE_ARTISTA VARCHAR(60)|
|CHARACTER LARGE OBJECT|Almacena grandes grupos de caracteres, hasta la cantidad especificada. El número de caracteres almacenados es exactamente el mismo número que el valor introducido; por lo tanto, no se agregan espacios al valor. El tipo de dato puede abreviarse como CLOB. Ejemplo: BIO_ARTISTA CLOB(200K)|
|NATIONAL CHARACTER| Funciona igual que el tipo de dato CHARACTER, excepto que se basa en una aplicación definida de un conjunto de caracteres. El tipo de dato puede abreviarse como NATIONAL CHAR y NCHAR. Ejemplo: NOMBRE_ARTISTA NCHAR(60)|
|NATIONAL CHARACTER VARYING| Funciona igual que el tipo de dato CHARACTER VARYING, excepto que se basa en una aplicación definida de un conjunto de caracteres. El tipo de dato puede abreviarse como NATIONAL CHAR VARYING o NCHAR VARYING. Ejemplo: NOMBRE_ARTISTA NCHAR VARYING(60)|
|NATIONAL CHARACTER LARGE OBJECT|Funciona igual que el tipo de dato CHARACTER LARGE OBJECT, excepto que se basa en una aplicación definida de un conjunto de caracteres. El tipo de dato puede abreviarse como NCHAR LARGE OBJECT o NCLOB. Ejemplo: BIO_ARTISTA NCLOB(200K)|
|BIT| Especifica el número exacto de bits que pueden almacenarse para cada carácter. Por ejemplo, si se define el número de bits como 2, pero el valor contiene sólo 1 bit, el bit restante será un espacio. Si el número de bits no se especifica, 1 bit se almacena. Ejemplo: EN_EXISTENCIA BIT|
|BIT VARYING| Especifica el mayor número de bits que pueden incluirse en un valor. El número de bits almacenados es exactamente el mismo número que el valor introducido; por lo tanto, no se agregan espacios al valor. Ejemplo: EN_EXISTENCIA BIT VARYING(2)|
|BINARY LARGE OBJECT|Almacena grandes grupos de bytes hasta la cantidad especificada. El número de bytes almacenados es exactamente el mismo número que el valor introducido; por lo tanto, no se agregan espacios al valor. El tipo de dato también puede remitirse como BLOB. Ejemplo: IMG_ARTISTA BLOB(1M)|
|XML| El lenguaje de marcado extensible (XML) es un lenguaje de marcado para fines generales utilizado para describir documentos en un formato que es conveniente para la visualización de páginas web y para intercambiar datos entre diferentes partes. Las especificaciones para almacenar datos XML en bases de datos SQL se añaden al estándar SQL en SQL:2003.Ejemplo: BIO_ARTISTA XML(DOCUMENT(UNTYPED))|

## SEGURIDAD

### Identificadores

SQL respalda dos tipos de identificadores de autorización: identificadores de usuario (o usuarios)
y nombres de rol (o roles)

#### Un identificador de usuario

Es una cuenta de seguridad individual que puede representar a una persona, una aplicación o un servicio del sistema (de los cuales todos
se consideran como usuarios de la base de datos).

El estándar SQL no especifica cómo una aplicación
de SQL puede crear a un identificador de usuario. El identificador puede estar vinculado al
sistema operativo en el que se ejecuta el sistema de gestión de base de datos relacional (RDBMS),
o puede estar creado explícitamente en el entorno RDBMS.

#### Un nombre de rol

Es un conjunto de privilegios definidos que se pueden asignar a un usuario o a otro rol.

Si a un nombre de rol se le concede acceder a un objeto de esquema, entonces todos los
identificadores de usuario y los nombres de rol que se asignaron al nombre del rol específico se les
concede acceder a ese objeto siempre y cuando el nombre de rol sea el del identificador de autorización
actual

Los nombres de rol se utilizan comúnmente como un mecanismo para la concesión de un conjunto
uniforme de privilegios a los identificadores de autorización que deben tener los mismos privilegios,
como las personas que trabajan en el mismo departamento. También tienen la ventaja de
la existencia independiente de los identificadores de usuario, lo que significa que se pueden crear
antes que los identificadores de usuario, y persisten incluso después de que los identificadores de
usuario suprimen las referencias. Esto es muy útil a la hora de administrar los privilegios para un
trabajo fluido.

#### identificador de autorización especial PUBLIC

Que incluye a todos los que utilizan la base de datos. Al igual que con cualquier otro identificador de autorización, se pueden conceder
privilegios de acceso a la cuenta `PUBLIC`.

### Sesiones SQL

Cada sesión SQL se asocia con un `identificador de usuario` y un `nombre de rol`.

>Una sesión SQL es la conexión entre algún tipo de aplicación de cliente y la base de datos.

La sesión proporciona el
contexto en el que el identificador de autorización ejecuta las instrucciones SQL durante una sola
conexión. A través de esta conexión, la sesión SQL mantiene la asociación con el par **identificador de usuario/nombre de rol** .

cada vez que la base de datos de SQL inicie y establezca una sesión, el identificador de usuario inicial
siempre será el identificador de usuario de la sesión SQL y el nombre de rol siempre será un valor
nulo

Solo puede existir un valor en el identificador o en el rol (el otro siempre será nulo), con cada llamada, el autorizado actual puede variar y los pares son almacenados en una **pila de autorizacion**.

### Acceder a los objetos de base de datos

Acceder a los datos en una base de datos se basa en la posibilidad de acceder
a los objetos que contienen los datos. Por ejemplo, puede conceder a algunos usuarios el acceso a
un conjunto específico de tablas, mientras que otros usuarios pueden acceder sólo a columnas específicas
dentro de una tabla. SQL permite definir los privilegios de acceso a los siguientes objetos
de esquema:

- Tablas base
- Vistas
- Columnas
- Dominios
- Conjunto de caracteres
- Cotejos
- Traducciones
- Tipos de usuario definidos
- Secuencias
- Activadores
- Rutinas invocadas SQL

Para cada tipo de objeto se pueden asignar determinados tipos de privilegios que varían según
el tipo de objeto. Estos privilegios asignados se asocian con identificadores de autorización
específicos.

>Se pueden asignar uno o más de los privilegios de un objeto a uno o más identificadores de autorización

Los privilegios se conceden en las bases de datos objetos utilizando la instrucción **GRANT**
para especificar los objetos así como los identificadores de autorización que adquieren los privile-

|Privilegio| Descripción| Objetos|
|----------|-----------|---------|
|SELECT |Permite que identificadores de autorización específicos consulten datos en el objeto. Por ejemplo, si al UsuarioA se le concede el privilegio SELECT en la tabla CD_ARTISTAS, el usuario puede ver los datos de esa tabla.|Tablas Vistas Columnas Métodos (en tipos estructurados)|
|INSERT |Permite que identificadores de autorización específicos inserten datos en el objeto. Por ejemplo, si al UsuarioA se le concede el privilegio INSERT en la tabla CD_ARTISTAS, el usuario puede añadir datos a esa tabla.|Tablas, Vistas, Columnas|
|UPDATE| Permite que identificadores de autorización específicos actualicen datos en el objeto. Por ejemplo, si al Usuario A se le concede el privilegio UPDATE en la tabla CD_ARTISTAS, el usuario puede modificar datos a esa tabla. Sin embargo, este privilegio no le permite al usuario cambiar la definición de la tabla.|Tablas, Vistas, Columnas|
|DELETE| Permite que identificadores de autorización específicos eliminen datos del objeto. Por ejemplo, si al Usuario A se le concede el privilegio DELETE en la tabla CD_ARTISTAS, el usuario puede eliminar datos de esa tabla. Sin embargo, este privilegio no le permite al usuario eliminar la definición de la tabla de la base de datos.|Tablas, Vistas|
|REFERENCES|Permite que identificadores de autorización específicos definan los objetos (como limitaciones referenciales) que hacen referencia a la tabla configurada con el privilegio REFERENCES. Por ejemplo, si al Usuario A se le concede el privilegio REFERENCES en la tabla CD_ARTISTAS, el usuario puede crear otros objetos que hagan referencia a la tabla CD_ARTISTAS, como sería el caso con claves foráneas. (Note que el Usuario A también debe tener la autorización para crear otros objetos.)|Tablas, Vistas, Columnas|
|TRIGGER| Permite que identificadores de autorización específicos generen activadores en la tabla. Por ejemplo, si al UsuarioA se le concede el privilegio TRIGGER en la tabla CD_ARTISTAS, el usuario puede crear activadores en esa tabla.|Tablas|
|USAGE| Permite que los identificadores de autorización específicos utilicen el objeto en una definición de columna. Por ejemplo, si al Usuario A se le concede el privilegio USAGE en el dominio DINERO, el usuario puede incluir el dominio en la definición de columna cuando se crea una tabla. (Note que el UsuarioA también debe tener la autorización para crear una tabla.)|Dominios, Conjunto de caracteres, Cotejos, Traducciones, Tipos definidos por el usuario, Secuencias|
|EXECUTE| Permite que los identificadores de autorización específicos invoquen una rutina SQL invocada. Por ejemplo, si al UsuarioA se le concede el privilegio EXECUTE en el procedimiento almacenado LISTA_CD_ACTUALIZADA, el usuario sería capaz de invocar ese procedimiento almacenado.|Rutinas invocadas SQL|
|UNDER| Permite que los identificadores de autorización específicos definan un subtipo directo en un tipo estructurado. Un subtipo directo es un tipo estructurado que se asocia con otro tipo estructurado como un objeto secundario de ese tipo. Por ejemplo, si al UsuarioA se le concede el privilegio UNDER en el tipo estructurado EMPLEADO, el usuario puede definir subtipos directos tales como ADMINISTRADOR o SUPERVISOR.|Tipos estructurados|

También se pueden revocar privilegios usando la instrucción **REVOKE**

### Crear y eliminar Roles

```sql
CREATE ROLE <nombre del rol>
[ WITH ADMIN { CURRENT_USER | CURRENT_ROLE } ]
```

```sql
GRANT { ALL PRIVILEGES | <lista de privilegios> }
ON <tipo de objeto> <nombre del objeto>
TO { PUBLIC | <lista de identificador de autorización>} [WITH GRANT OPTION]
[GRANTED BY { CURRENT_USER | CURRENT_ROLE }]
```

```sql
REVOKE [ GRANT OPTION FOR ] {ALL PRIVILEGES | <lista de privilegios>}
ON <tipo de objeto> <nombre del objeto>
FROM { PUBLIC | <lista de identificador de autorización>
[GRANTED BY {CURRENT_USER | CURRENT_ROLE }]
{RESTRICT | CASCADE}
```

### crear role

```sql
GRANT <lista de nombres de rol>
TO { PUBLIC | <lista de identificador de autorización> }[ WITH ADMIN OPTION ]
[ GRANTED BY { CURRENT_USER | CURRENT_ROLE } ]
```

revocar un role

```sql
REVOKE [ ADMIN OPTION FOR ] <lista de nombres de rol>
FROM { PUBLIC | <lista de identificador de autorización> }
[ GRANTED BY { CURRENT_USER | CURRENT_ROLE } ]
{ RESTRICT | CASCADE }
```

## Acceso y modificacion de datos

### Consulta de datos SQL

- Utilice la instrucción **SELECT** para la recuperación de datos
- Utilice la cláusula **WHERE** para definir condiciones de búsqueda
- Utilice la cláusula **GROUP BY** para agrupar los resultados de una consulta
- Utilice la cláusula **HAVING** para especificar un grupo de condiciones de búsqueda
- Utilice la cláusula **ORDER BY** para ordenar los resultados de una consulta

La sintaxis básica para la instrucción **SELECT** puede dividirse en varias cláusulas específicas, cada una de las cuales ayuda a refinar la consulta para que sólo se devuelvan los datos requeridos.

```sql
SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
FROM <tabla de referencia> [ {, <tabla de referencia> }... ]
[ WHERE <condición de búsqueda> ]
[ GROUP BY <especificación de agrupación> ]
[ HAVING <condición de búsqueda> ]
[ ORDER BY <condición de orden> ]
```

#### Orden de evaluacion

FROM -> [WHERE] -> [GROUP BY] -> [HAVING] -> SELECT -> [ORDER BY]

1- Crea una tabla virtual a partir de las tablas de **FROM**
2- Filtra las filas que coinciden con los predicados de **WHERE**
3- Crea un resumen con los valores coincidentes de una o varias columnas de **GROUP BY**
4- Filtra las filas cuyos valores de columna coinciden con los predicados de **HAVING** creando datos agrupados
5- Crea una proyección sobre las columnas de la tabla virtual que coincida con **SELECT**
6- Ordena las filas según los valores de una o varias columnas de **GROUP BY**

#### WHERE

- **AND** true AND true
- **OR** true OR true
- **NOT** NOMBRE_INTERPRETE = 'Joni Mitchell' OR NOT NOMBRE_INTERPRETE ='Kitaro'
- **IS TRUE** (name="jon" AND surname="done") IS TRUE
- **IS FALSE** (name="jon" AND surname="done") IS FALSE
- **IS UNKNOWN** (name="jon" AND surname="done") IS UNKNOWN

>Los SGDBS suelen evaluar los AND antes que los OR. Es importante el uso de parentesis.

#### GROUP BY

```sql
[ GROUP BY <especificaciones de grupo> ]

<nombre de columna>[ {,<nombre de columna> }... ]
|{ ROLLUP | CUBE }( <nombre de columna> [ { , <nombre de columna> }... ] )
```

- Se especifican uno o más nombres de columna que contengan valores que se agrupan juntos.Esto normalmente aplica a columnas
que representan algunos tipos de categorías cuyos valores se repiten dentro de la tabla
- se puede especificar la segunda línea en lugar de la primera. En
este caso, se puede usar la palabra clave ROLLUP o CUBE, junto con el listado de los nombres
de columna, entre paréntesis

#### HAVING

La cláusula **HAVING** es similar a la cláusula WHERE ya que define una condición de búsqueda.
Sin embargo, a diferencia de la cláusula WHERE, la cláusula HAVING se refiere a grupos, no a
filas individuales:

- Si se especifica la cláusula **GROUP BY**
  la cláusula **HAVING** se aplica a los `grupos creados por la cláusula GROUP BY`
- Si se especifica la cláusula **WHERE** y no se especifica la cláusula **GROUP BY**
  la cláusula **HAVING** se aplica a `la salida de la cláusula WHERE y se trata esa salida como un grupo`.
- Si no se especifica la cláusula **WHERE** ni la cláusula **GROUP BY**
  la cláusula **HAVING** se aplica a `la salida de la cláusula FROM y se trata esa salida como un grupo`.

En su mayor parte, probablemente encuentre que utilizará la cláusula HAVING en conjunto
con la cláusula GROUP BY. Mediante el uso de estos dos se pueden agrupar datos relevantes y filtrar
los datos para refinar su búsqueda aún más. La cláusula HAVING también tiene la ventaja de
permitir el uso de funciones establecidas tales como AVG o SUM, que no se pueden utilizar en la
cláusula WHERE a menos que se coloquen dentro de una subconsulta. Los puntos importantes que
deben tenerse en cuenta con la cláusula HAVING es que es la última cláusula en la expresión de
tabla que debe aplicarse, y que se trata de datos agrupados en lugar de filas individuales.

### MODIFICAR DATOS SQL

- Insertar datos
- Actualizar datos
- Eliminar datos

#### Insertar datos sql

la instrucción **INSERT** permite agregar datos a las diferentes tablas en una base de datos

```sql
INSERT INTO <nombre de la tabla>
[ ( <nombre de la columna> ) [ { , <nombre de la columna> }... ] ) ]
VALUES ( <valor> [ { , <valor> }... ] )
```

los valores deben cumplir los siguientes requisitos:

- Si los nombres de columna no se especifican en la cláusula INSERT INTO, entonces deberá
haber un valor por cada columna en la tabla y los valores deberán estar en el mismo orden en
el que están definidos en la tabla.

- Si los nombres de columna se especifican en la cláusula INSERT INTO, entonces deberá
haber exactamente un valor por cada columna especificada y esos valores deberán estar en el
mismo orden en el que están definidos en la cláusula INSERT INTO. Sin embargo, los nombres
y valores de columna no tienen que estar en el mismo orden que las columnas en la definición
de la tabla.

- Se debe proporcionar un valor por cada columna en la tabla excepto para las columnas que
permiten valores nulos o que tienen un valor definido por defecto.

- Cada valor con un carácter del tipo de datos de cadena debe estar encerrado en `comillas sencillas`.

- Se puede utilizar la palabra clave `NULL` (o `null`) como el valor de los datos en la cláusula **VALUES**
para asignar un valor nulo a cualquier columna que permita valores nulos.

#### Actualizar datos

Con la instrucción UPDATE se pueden modificar datos en una o más filas para una o más
columnas

```sql
UPDATE <nombre de la tabla>
SET <determinar expresión de la cláusula> [ {, <determinar expresión de la cláusula> }... ]
[ WHERE <condición de búsqueda> ]
```

#### Eliminar datos

```sql
DELETE FROM <nombre de la tabla>
[ WHERE <condición de búsqueda> ]
```

### UTILIZAR PREDICADOS

#### Comparar datos SQL

El primer tipo de predicado que se planea analizar es el tipo de aquellos que comparan datos. Estos
predicados, como cualquier predicado, están incluidos en la cláusula WHERE. Se puede incluir
una cláusula WHERE en una instrucción SELECT, UPDATE o DELETE, y en cada caso la cláusula
puede contener uno o más predicados de comparación.

- Arrojar valores nulos
- Arrojar valores similares
- Hacer referencia a fuentes adicionales de datos
- Determinar la cantidad de predicados de comparación

### Capitulo 10 TRABAJAR CON FUNCIONES Y EXPRESIONES DE VALOR

- Utilizar funciones Set
  - **COUNT** cuenta el número de filas en una tabla o el número de valores en una columna
  Cuando se utiliza la función COUNT, se debe especificar
un nombre de columna para contar el número de valores que no sean nulos en una columna, o
un asterisco para contar todas las filas en una tabla independientemente de los valores nulos
  - **MAX y MIN**
  - **SUM** la función SUM agrupa valores de columna. Esto es particularmente útil cuando se
necesita encontrar los totales para datos agrupados (a pesar de que la función SUM, al igual que
cualquier otra función set, trata a la tabla entera como un grupo único si ningún dato ha sido explícitamente
agrupado)
  - **AVG** promedia los valores en una columna especificada.
Al igual que la función SUM, es más efectiva cuando se utiliza junto con una cláusula
GROUP BY
- Utilizar funciones de valor
  - funciones de valor de cadena
    Una función de valor de cadena permite manipular datos de cadenas de caracteres para producir
un valor preciso que esté basado en la cadena de caracteres original
    - **SUBSTRING**
    - **UPPER**
    - **LOWER**
  - funciones de valor fecha y hora

- Utilizar expresiones de valor
- Utilizar valores especiales

## ACCESO A MULTIPLES TABLAS (CAPITULO 11)

- Realizar operaciones básicas join
  tabla de producto cartesiano que es una lista de cada fila en una tabla,
unida con cada una de las filas en la otra tabla
- Unir tablas con nombres de columna compartidos
- Utilizar el método join de condición
- Realizar operaciones de unión

- **CROSS join**
- **SELF-JOIN**
- **join natural**
El método join natural hace coincidir automáticamente las filas de aquellas columnas con el
mismo nombre. No es necesario especificar ningún tipo de condición equi-join para los joins naturales.

utilizando una operación join de columna nombrada, que
permite especificar qué columnas coincidentes serán agregadas
Por ejemplo, supongamos que
se quiere incluir solamente TITULO_CD en la condición join. Se puede modificar el ejemplo anterior
de esta manera:

```sql
SELECT TITULO_CD, s.TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s JOIN COSTOS_TITULO c
USING (TITULO_CD)
WHERE s.INVENTARIO > 15;
```

El join de condición realiza un método diferente. En un join de condición, la condición equi-join está definida en la cláusula ON, que
funciona de manera muy similar a la cláusula WHERE. Sin embargo, a pesar de utilizar la cláusula
ON, una condición básica join es similar de muchas maneras a las operaciones join previas que
se han visto, excepto que, a diferencia de las join naturales y de las join de columna nombrada, la
condición join permite hacer coincidir cualquier columna compatible de una tabla con cualquier
otra de otra tabla Los nombres de columna no necesitan ser iguales.

>La join de condición es la
sintaxis preferida por la mayoría de los programadores SQL debido a su claridad, flexibilidad y
amplio soporte entre todas las implementaciones SQL.

Una join de condición puede ser separada en dos tipos de uniones: **inner joins** y **outer joins**.
La diferencia entre estas dos uniones es la cantidad de datos arrojados por la consulta.

- Una **inner join** arroja solamente aquellas filas que coinciden con la condición **equi-join** definida en la instrucción
**SELECT**. En otras palabras, la inner join arroja solamente filas coincidentes. Ésta era la join
original disponible en SQL, y por lo tanto algunos programadores la llaman “join estándar”, a pesar
de que esto es un error debido a que todas las joins presentadas en este capítulo están descritas
en el estándar SQL.
- Una **outer join**, por otro lado, arroja las filas coincidentes y alguna o todas las
filas no coincidentes, dependiendo del tipo de outer join.

Una INNER JOIN

```sql
SELECT t.TITULO, ta.ID_ARTISTA
FROM TITULO_CDS t INNER JOIN ARTISTAS_TITULOS ta
ON t.ID_TITULO = ta.ID_TITULO
WHERE t.TITULO LIKE ('%Blue%');
```

Una OUTER JOIN

- **LEFT** Arroja todas las filas coincidentes y todas las filas no coincidentes de la tabla de la izquierda
(la tabla a la izquierda de la palabra clave JOIN).
- **Right** Arroja todas las filas coincidentes y todas las filas no coincidentes de la tabla de la
derecha (la tabla a la derecha de la palabra clave JOIN).
- **Full** Arroja todas las filas coincidentes y todas las filas no coincidentes de ambas tablas

### UNION

El operador **UNION** es un método que puede utilizarse para combinar los resultados de múltiples
instrucciones **SELECT** en un solo conjunto de resultados, esencialmente uniendo filas de una
consulta con filas de otra. A diferencia de las operaciones join, que agregan columnas desde múltiples
tablas y las colocan lado a lado, las operaciones de unión `agregan filas al final del conjunto
de resultados`.

Para poder utilizar un operador UNION

- Cada instrucción SELECT debe producir columnas compatibles lo que significa que cada una debe producir
  - el mismo número de columnas, y
  - las columnas correspondientes deben tener tipos de datos compatibles

## USO DE SUBCONSULTAS PARA ACCEDER Y MODIFICAR DATOS (CAPITULO 12)

- Crear subconsultas que arrojen múltiples filas
- Crear subconsultas que arrojen un solo valor
- Trabajar con subconsultas correlacionadas
- Utilizar subconsultas anidadas
- Utilizar subconsultas para modificar datos

Una subconsulta puede agregarse a una instrucción SELECT,
INSERT, UPDATE o DELETE

## UTILIZAR CURSORES SQL (TEMA 15) p351

- Entender los cursores SQL
- Declarar un cursor
- Abrir y cerrar un cursor
- Recuperar datos desde un cursor
- Utilizar instrucciones UPDATE y DELETE posicionadas

Una de las características que definen a SQL es el hecho de que los datos en una base de datos SQL
pueden ser manejados en conjuntosCada uno de estos
conjuntos de resultados está conformado por una o más filas extraídas desde una o más tablas

Si el tamaño de
los resultados es demasiado extenso para desplazarse fácilmente, es posible hacer más preciso el
enfoque de la expresión de búsqueda para arrojar un conjunto de resultados más manejable

Uno de los métodos más comunes, el SQL incrustado, accede a los datos a través de instrucciones
SQL incrustadas en un programa de aplicación. Los elementos de datos arrojados por las
instrucciones SQL son utilizados por un lenguaje de programación externo (el lenguaje host) para
soportar procesos de aplicación específicos.

Un cursor funciona como un señalador que permite al lenguaje de programación de aplicación
tratar a los resultados de la consulta una fila a la vez, de manera muy parecida a la que estos
lenguajes de programación manejan los registros desde archivos de datos tradicionales (planos).
A pesar de que el cursor puede recorrer todas las filas de los resultados de la consulta, se enfoca
solamente en una fila a la vez

### DECLARAR UN CURSOS

```sql
DECLARE <nombre del cursor>
[ SENSITIVE | INSENSITIVE | ASENSITIVE ]
[ SCROLL | NO SCROLL ] CURSOR
[ WITH HOLD | WITHOUT HOLD ]
[ WITH RETURN | WITHOUT RETURN ]
FOR <expresión de consulta>
[ ORDER BY <especificación del tipo> ]
[ FOR { READ ONLY | UPDATE [ OF <lista de la columna> ] } ]
```

```js
options = {
    changes: "SENSITIVE | INSENSITIVE | ASENSITIVE",
    cursor: "SCROLL | NO SCROLL",
    hold: "true | false",
    return: "true | false",
    orderBy: "<especificación del tipo>",
    readOnly: "true | false",
    update: ["<lista de la columna>"],
   };
```

Como se puede ver en la sintaxis, SQL soporta tres opciones de sensibilidad del cursor:

- **SENSITIVE** Cambios significativos hechos por las instrucciones fuera del cursor afectan
inmediatamente a los resultados de la consulta dentro del cursor.
- **INSENSITIVE** Cambios significativos hechos por las instrucciones fuera del cursor no
afectan a los resultados de la consulta dentro del cursor.
- **ASENSITIVE** La sensibilidad del cursor es definida por la implementación. Los cambios
significativos pueden o no ser captados dentro del cursor

### OBTENER DATOS

Una o más instrucciones **FETCH** pueden ser ejecutadas mientras un cursor está abierto. Cada
instrucción apunta a una fila específica en los resultados de la consulta, y los valores son entonces
extraídos de esas filas. La siguiente sintaxis muestra los elementos básicos que conforman la instrucción
FETCH:

```sql
FETCH [ [ <orientación para búsqueda> ] FROM ]
<nombre del cursor> INTO <variables host>
```

NEXT|PRIOR|FIRST|LAST|ABSOLUTE valor|RELATIVE valor

### UPDATE POSICIONADO

```sql
DECLARE CD_5 CURSOR
FOR
SELECT *
FROM INVENTARIO_CD
FOR UPDATE OF DISCO_COMPACTO;

OPEN CD_5;

FETCH CD_5
INTO :CD, :Categoria, :Precio, :A_la_mano;

UPDATE INVENTARIO_CD
SET A_LA_MANO = :A_la_mano * 2
WHERE CURRENT OF CD_5;

CLOSE CD_5;
```

### DELETE POSICIONADO p370

La instrucción DELETE posicionada, al igual que la instrucción UPDATE posicionada, requiere
una cláusula WHERE que debe incluir la opción CURRENT OF. (Una instrucción DELETE regular,
como puede recordarse, no requiere de una cláusula WHERE.) Una instrucción DELETE
posicionada utiliza la siguiente sintaxis:

```sql
DELETE <nombre de la tabla>
WHERE CURRENT OF <nombre del cursor>
```

## TRANSACCIONES SQL p377

- Entender las transacciones SQL
- Configurar las propiedades de la transacción
- Iniciar una transacción
- Determinar el aplazamiento de una restricción
- Crear puntos de recuperación en una transacción
- Finalizar una transacción

Una transacción es una unidad de trabajo que
se compone de una o más instrucciones SQL que realizan un conjunto de acciones relacionadas.

Para que un conjunto de acciones califique como una transacción, debe pasar la prueba ACID.
ACID es el acrónimo comúnmente utilizado para referirse a los nombres en inglés de las cuatro
características de una transacción

- **Atómica** Esta característica se refiere a la naturaleza todo-o-nada de una transacción. Se realizan
ya sea todas las operaciones en una transacción, o ninguna de ellas. Aunque algunas instrucciones
sean ejecutadas, los resultados de éstas regresan a su punto inicial si la transacción
falla en cualquier punto antes de ser completada. Solamente cuando todas las instrucciones se
ejecutan apropiadamente y todas las acciones se realizan, se considera completa una transacción
y sus resultados se aplican a la base de datos.

- **Consistente** La base de datos debe ser consistente al inicio y al final de la transacción. De
hecho, se puede considerar una transacción como un conjunto de acciones que lleva a la base
de datos de un estado consistente a otro. Todas las reglas que definen y limitan los datos deben
ser aplicadas a esos datos como resultado de cualquier cambio que ocurra durante la transacción.
Además, todas las estructuras dentro de la base de datos deben estar correctas al final de
la transacción.

- **Aislada (Isolated)** Los datos que pudieran encontrarse en un estado inconsistente temporalmente
durante una transacción no deberán estar disponibles a otras transacciones hasta que los
datos sean consistentes una vez más. En otras palabras, ningún usuario deberá ser capaz de acceder
a los datos inconsistentes durante una transacción implementada por otro usuario cuando
los datos impactados por esa transacción están en un estado inconsistente. Además, cuando
una transacción se encuentra aislada, ninguna otra transacción puede afectarla.

- **Durable** Una vez que los cambios hechos en una transacción sean completados, esos cambios
deberán ser preservados, y los datos deberán estar en un estado confiable y consistente,
incluso si ocurren errores de aplicación o de hardware.

### El estándar SQL:2006 define siete instrucciones relacionadas al proceso de transacción (p380)

- **SET TRANSACTION** Configura las propiedades de la siguiente transacción que deberá ser
ejecutada.

- **START TRANSACTION** Configura las propiedades de una transacción e inicia esa transacción.

- **SET CONSTRAINTS** Determina el modo de restricción dentro de una transacción actual.
El modo de restricción se refiere a si una restricción es aplicada inmediatamente a los datos
cuando éstos son modificados o si la aplicación de la restricción es aplazada hasta un punto
posterior en la transacción.

- **SAVEPOINT** Crea un punto de recuperación dentro de una transacción. Un punto de recuperación
marca una zona dentro de la transacción que actúa como un punto para detenerse
cuando una transacción tiene que regresar a su punto inicial.

- **RELEASE SAVEPOINT** Libera un punto de recuperación.

- **ROLLBACK** Finaliza una transacción y reinvierte todos los cambios al comienzo de la
transacción o a un punto de recuperación.
- **COMMIT** Finaliza una transacción y permite completar todos los cambios a la base de datos.

- SET TRANSACTION

```sql
SET [ LOCAL ] TRANSACTION <modo> [ { , <modo> } ... ]
```

modos de transacción que se pueden especificar:

- Nivel de acceso: READ ONLY|READ WRITE
- Nivel de aislamiento: READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE
- Tamaño de diagnóstico

|Nivel de aislamiento| Lectura sucia |Lectura no repetible |Lectura fantasma|
|--|--|--|--|
|READ UNCOMMITTED| Sí| Sí| Sí|
|READ COMMITTED| No| Sí| Sí|
|REPEATABLE READ| No| No| Sí|
|SERIALIZABLE| No| No| No|

- Iniciar una transaccion

```sql
START TRANSACTION <modo> [ { , <modo> } ... ]
```

### Aplazar restricciones en una transaccion

```sql
SET CONSTRAINTS { ALL | <nombres de las restricciones> }
{ DEFERRED | IMMEDIATE }
```

puede usarse la palabra clave **ALL**; o se deberán listar los nombres de las restricciones, separados
por una columna
aplazar: DEFERRED|IMMEDIATE

Normalmente, se utilizará la instrucción **SET CONSTRAINTS** en conjuntos por pares: una
instrucción para aplazar las restricciones y otra para aplicarlas.

Sin embargo, realmente no se necesita
utilizar la instrucción **SET CONSTRAINTS** para aplicarlas debido a que todas las restricciones
se aplican antes de que se complete la transacción, hayan sido las restricciones aplicadas explícitamente
o no.

### Crear puntos de restauración

``sql
SAVEPOINT <nombre del punto de recuperación>
RELEASE SAVEPOINT <nombre del punto de recuperación>
´´´

### Finalizar una transaccion

```sql
COMMIT [ WORK ] [ AND [ NO ] CHAIN ]
```

```sql
ROLLBACK [ WORK ] [ AND [ NO ] CHAIN ]
[ TO SAVEPOINT <nombre del punto de recuperación> ]
```

Plantilla

```js
const commandFormat = {
   name: (name) => `${name}`,
   orden: ["name"],
  };
  return this.getStatement("CREATE", commandFormat, { name, options });
    ```
