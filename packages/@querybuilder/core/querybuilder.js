import { Types, check, isJSObject, log } from "./utils/utils.js";
import Column from "./column.js";
import Cursor from "./cursor.js";
import Transaction from "./transaction.js";
import Expresion from "./expresion.js";
import Value from "./value.js";
import Command from "./noSql/Command.js";

/**
 * @fileoverview QueryBuilder Core Package - API fluida para construir y ejecutar consultas de base de datos
 * @version 2.0.0
 * @author Miguel E. Llambías Llansó
 * @license MPL-2.0
 */

/**
 * @fileoverview QueryBuilder Core Package
 * @description
 * Paquete principal @QueryBuilder que proporciona una API fluida para construir y ejecutar consultas de base de datos.
 * El core es **obligatorio** y contiene toda la funcionalidad base para SQL estándar.
 * Los adaptadores de base de datos específicos (MySQL, PostgreSQL, MongoDB, etc.) son **opcionales**.
 * 
 * **Estructura del paquete:**
 * - `@querybuilder/core` - **[OBLIGATORIO]** Funcionalidad base y API principal
 * - `@querybuilder/mysql` - **[OPCIONAL]** Adaptador para MySQL
 * - `@querybuilder/postgresql` - **[OPCIONAL]** Adaptador para PostgreSQL  
 * - `@querybuilder/mongodb` - **[OPCIONAL]** Adaptador para MongoDB
 * - `@querybuilder/sqlite` - **[OPCIONAL]** Adaptador para SQLite
 * - `@querybuilder/redis` - **[OPCIONAL]** Adaptador para Redis
 * - `@querybuilder/cassandra` - **[OPCIONAL]** Adaptador para Cassandra
 * - `@querybuilder/chroma` - **[OPCIONAL]** Adaptador para ChromaDB
 * 
 * @example
 * // Instalación básica (solo core)
 * npm install @querybuilder/core
 * 
 * // Con adaptador específico
 * npm install @querybuilder/core @querybuilder/mysql
 * 
 * // Uso básico
 * import QueryBuilder from '@querybuilder/core';
 * import MySQL from '@querybuilder/mysql';
 * 
 * const qb = new QueryBuilder(MySQL);
 * qb.select('*').from('users').where('active = 1');
 */

/**
 * Clase principal QueryBuilder que proporciona una API fluida para construir y ejecutar consultas de base de datos.
 * Delega la sintaxis SQL/NoSQL a adaptadores de lenguaje (MySQL, PostgreSQL, MongoDB, etc.) derivados de la clase Core.
 * Soporta construcción y ejecución de consultas, gestión de conexiones, transacciones y cursores usando clases drivers derivadas de la clase Driver.
 * Soporta múltiples paradigmas de base de datos (SQL, NoSQL, Vector, En-Memoria).
 * @class QueryBuilder
 * @param {Core} language - Clase de lenguaje (adaptador SQL/NoSQL) derivada de Core
 * @param {queryBuilderOptions} [options] - Opciones de configuración para QueryBuilder
 * @returns {QueryBuilder} Instancia de QueryBuilder para encadenar métodos
 */
class QueryBuilder {
	constructor(language, options = {}) {
		this.languageClass = language;
		this.options = options;
		this.language = new language(this);
		if (this.options?.typeIdentificator) {
			Types.identificador.set(this.options.typeIdentificator);
		} else {
			Types.identificador.set("regular");
		}
		this.queryResult = undefined;
		this.queryResultError = undefined;
		this.cursores = {};
		this.driverDB = undefined;
		this.predicados();
		this.functionOneParam();
		this.functionDate();
		this.joins();
		this.alterTableComands();
		this.threads = new Map();
		this.currentId;
		this.promise = Promise.resolve({});
		this.returnOriginal = [
			"getAll",
			"execute",
			"toString",
			"queryJoin",
			"toNext",
			"checkFrom",
			"openCursor",
			"valueOf",
			"exp",
			"col",
			"coltn",
			"lastStatementIn",
			"setTransaction",
			"thread",
			"initThread",
			"getAvailableFunctions",
		];
		this.returnPromise = ["createCursor", "closeCursor"];
		this.handler = {
			get(target, prop, receiver) {
				if (prop === "catch") {
					// Permite registrar un manejador de errores
					return (handler) => {
						errorHandler = handler;
						return receiver; // Para encadenar
					};
				}
				const original = Reflect.get(target, prop, receiver);

				/**
				 * Cuando se llama a una funcion
				 */
				if (typeof original === "function") {
					if (target.returnOriginal.indexOf(prop) >= 0) {
						return original;
					}

					return (...args) => {
						log("Proxy", "Se ha llamado a la funcion %o", prop);
						target.promise = target.promise.then((next) => {
							let nextValue = next;
							let isOfType = "una instancia de ";
							switch (true) {
								case next instanceof QueryBuilder:
									isOfType += "QueryBuilder";
									break;
								case next instanceof Command:
									isOfType += "Command";
									break;
								case next instanceof Cursor:
									isOfType += "Cursor";
									nextValue = { q: [next.toString()] };
									break;
								default:
									isOfType = next;
									break;
							}
							log(["Proxy", "get", "then", "%o"], "recibe:%o", prop, isOfType);
							nextValue.last = nextValue?.prop || null;
							if (nextValue?.callStack) {
								nextValue.callStack.push(prop);
							} else {
								nextValue.callStack = [prop];
							}

							// iguala el numero de argumentos que recibe la función
							while (args.length < original.length - 1) {
								args.push(undefined);
							}
							// añade el argumento a la función
							args.push({ ...nextValue, prop });
							const response = original.apply(receiver, args); // ejecución del comando
							return response;
						});
						if (target.returnPromise.indexOf(prop) >= 0) {
							return target.promise;
						}
						return receiver; // Para encadenar llamadas
					};
				}

				// Si no es una función, simplemente devolvemos la propiedad
				return original;
			},
		};
		// biome-ignore lint/correctness/noConstructorReturn: <explanation>
		return new Proxy(this, this.handler);
	}

	/**
	 * @method thread
	 * @category Utilities
	 * @memberof QueryBuilder
	 * @description
	 * Gestiona la ejecución de hilos para operaciones de consulta concurrentes
	 * Cambia entre diferentes hilos de ejecución de consultas por ID
	 * Permite crear distintos hilos usando una instancia de QueryBuilder
	 * Evita tener que crear instancias múltiples
	 * @param {string|number} id - Identificador del hilo al cual cambiar o crear
	 * @returns {QueryBuilder} Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * // Crear o cambiar al hilo 'main'
	 * qb.thread('main').select('*').from('users');
	 * 
	 * // Cambiar a un hilo diferente
	 * qb.thread('secondary').select('count(*)').from('orders');

	 */
	thread(id) {
		if (this.currentId !== undefined) {
			// console.log("[setThread] actualiza ", this.id, this.promise);
			this.threads.set(this.currentId, this.promise);
		}
		if (this.threads.has(id)) {
			this.promise = this.threads.get(id);
			this.currentId = id;
			// console.log("[setThread] Cambiando de hilo", this.id, this.promise);
		} else {
			this.promise = Promise.resolve({});
			this.threads.set(id, this.promise);
			this.currentId = id;
		}
		return this;
	}

	/**
	 * @method toNext
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Método interno para encadenar componentes de consulta y gestionar el estado de la consulta
	 * Maneja la API fluida procesando partes de consulta y manteniendo el contexto de encadenamiento
	 * 
	 * @param {Array<any,next>|QueryBuilder|next} data - Datos de consulta como array [value, next] o instancia QueryBuilder
	 * @param {string} [stringJoin=""] - Cadena para unir partes de consulta (ej., ";", "\n")
	 * @param {boolean} [firstCommand=false] - Si este es el primer comando en la cadena
	 * @returns {next} Objeto Next actualizado para el siguiente comando en la cadena
	 * @private
	 * @example

	 * // Uso interno - no llamado directamente por usuarios
	 * this.toNext([command, next], ";", true);
	 * 
	 * // El método procesa diferentes tipos de entrada:
	 * this.toNext(["SELECT *", { q: [], last: null, prop: "select" }]);
	 * this.toNext([columnInstance, next]);
	 * this.toNext([cursorInstance, next]);
	 * this.toNext([expresionInstance, next]);

	 */
	toNext(data, stringJoin = "", firstCommand = false) {
		if (Array.isArray(data)) {
			let [valor, next] = data;
			if (next?.q?.length > 0 && firstCommand) {
				// Siendo un comando inicial el anterior debe acabar en ';'
				const previusItem = next.q[next.q.length - 1];
				if (typeof previusItem === "string") {
					next.q[next.q.length - 1] += previusItem.endsWith(";") ? "" : ";";
				}
			}
			if (valor === null) {
				return next;
			}

			if (isJSObject(valor)) {
				if (valor instanceof Column) {
					log("toNext", "Recibe un objeto Column");
				} else if (valor instanceof Cursor) {
					log("toNext", "Devuelve un cursor");
					return { q: [valor] };
				} else if (valor instanceof Expresion) {
					log("toNext", "Es una expresion %s", valor);
					next.q.push(valor);
					return next;
				} else {
					valor = Object.keys(valor).reduce((obj, key) => {
						if (valor[key] instanceof QueryBuilder) {
							obj[key] = next.q.shift();
						} else {
							obj[key] = valor[key];
						}
						return obj;
					}, {});
				}
			}

			if (next?.isQB) {
				log(
					"toNext",
					"El argumento de %o es una llamada a QB.\n valor recibido %o",
					next.prop,
					valor,
				);
				next.q.push(valor);
				log("toNext", "QB devuelve", next);
				return next;
			}
			log(
				"toNext",
				"Procesar otros valores: %o\n next:%o\n usando %o",
				valor,
				next,
				stringJoin,
			);
			if (next?.q === undefined) {
				if (typeof valor === "string") {
					return { ...next, q: [valor.concat(stringJoin)] };
				}
				return { ...next, q: [valor] };
			}
			const { q, ...resto } = next;
			if (Array.isArray(q)) {
				if (typeof valor === "string") {
					q.push(valor.concat(stringJoin));
				} else {
					q.push(valor);
				}
				return {
					q,
					...resto,
				};
			}
			if (typeof valor === "string") {
				return { q: [valor.concat(stringJoin)], ...resto };
			}
			return { q: [valor], ...resto };
		}
		if (data instanceof QueryBuilder) {
			log("[QueryBuilder][toNext]", "El objeto actual es una llamada interna ");
			return {};
		}
		return data;
	}

	lastStatementIn(command, list) {
		return list.findLastIndex(
			(item) =>
				item.toUpperCase().startsWith(command.toUpperCase()) ||
				item.toUpperCase().includes(command.toUpperCase()),
		);
	}

	/**
	 * @method driver
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Instancia y configura el Driver para la base de datos que ejecutara los comandos
	 * 
	 * @param {Driver} driverClass - Clase del controlador de base de datos (MySqlDriver, PostgreSQLDriver, etc.)
	 * @param {DatabaseConfig} params - Parámetros de conexión y configuración del controlador
	 * @returns {next} next - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * import MySQL from '@querybuilder/mysql';
	 * import config from './config.js';
	 * const mysql= config.MYSQL; // importa configuración de la base de datos
	 * const qb = new QueryBuilder(MySQL); // creación de instancia QueryBuilder
	 * qb.driver(mysql.driver, mysql.params); // configuración del driver
	 * //Prueba de la conexión
	 * qb.driver(mysql.driver, mysql.params)
	 *   .testConnection()
	 * 	.then((res) => console.log('Conexión exitosa:', res))
	 */
	driver(driverClass, params, next) {
		this.driverDB = new driverClass(params);
		this.params = params;
		this.close = async () => this.driverDB.close();
		return next;
	}

	/************************************************************************
	 * Comandos auxiliares para gestión y mantenimiento de la base de datos.
	 **************************************************************************/
	/**
	 * @method use
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 *	Gestiona el cambio de base de datos dentro del mismo servidor (SGBD)
	 * @param {string} database - Nombre de la base de datos
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 */
	use(database, next) {
		const command = this.language.use(database);
		if (command === null) {
			if (this.driverDB !== undefined) {
				this.driverDB.use(database);
			} else {
				return this.toNext([command, next], ";");
			}
		}
		return this.toNext([command, next], ";");
	}
	/*************************************************************
		Definen y modifican la estructura de la base de datos.
	**************************************************************/
	/**
	 * @method createDatabase
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 *	Crea una base de datos dentro del servidor (SGBD)
	 *	@param {string} name - Nombre de la base de datos
	 *	@param {createDatabaseOptions} options - Opciones para la creacion de datos
	 *  @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example

	 * qb.createDatabase('mydb', { ifNotExists: true });
	 * 	// Resultado esperado: { success: true, database: 'mydb' }

	 */
	createDatabase(name, options, next) {
		try {
			const command = this.language.createDatabase(name.validSqlId(), options);
			return this.toNext([command, next], ";", true);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * @method dropDatabase
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Elimina una base de datos del servidor (SGBD)
	 * @param {string} name - nombre de la base de datos
	 * @param {DropDatabaseOptions} options - Opciones
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * qb.dropDatabase('mydb');
	 * 	// Resultado esperado: { success: true, database: 'mydb' }

	 */
	dropDatabase(name, options, next) {
		try {
			const command = this.language.dropDatabase(name, options);
			return this.toNext([command, next], ";", true);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method createSchema
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Crea un "esquema" o "tabla" de nombres para organizar objetos de base de datos
	 * @param {string} name - nombre del esquema
	 * @param {createSchemaOptions} options - Opciones
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example

	 * qb.createSchema('myschema', { ifNotExists: true });

	 */
	createSchema(name, options, next) {
		try {
			const command = this.language.createSchema(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * @method dropSchema
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description	
	 * Elimina un esquema de la base de datos
	 * @param {string} name - nombre del esquema
	 * @param {dropSchemaOptions} options - Opciones
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 */
	dropSchema(name, options, next) {
		const command = this.language.dropSchema(name, options);
		return this.toNext([command, next]);
	}

	/**
	 * @method createTable
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Crea una nueva tabla con el nombre y las opciones especificadas en la base de datos actual.
	 *
	 * @param {string} name - El nombre de la tabla.
	 * @param {createTableOptions} options - Opciones de configuración para la tabla.
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 */
	createTable(name, options, next) {
		try {
			if (options?.cols === undefined) {
				throw new Error(`createTable ${name}`, {
					reason: "Tiene que especificar como mínimo una columna",
				});
			}
			const command = this.language.createTable(name.validSqlId(), options);
			return this.toNext([command, next], ";", true);
		} catch (error) {
			next.error = error;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method alterTable
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Modifica una tabla existente
	 * @param {string} name - Nombre de la tabla
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example

	 * qb.alterTable('mytable', { addColumn: 'new_column' });

	 */
	alterTable(name, next) {
		const command = this.language.alterTable(name);
		log("alterTable", "responde con %o", command);
		return this.toNext([command, next]);
	}
	/**
	 * @method addColumn
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Añade, modifica o elimina columnas en una tabla existente.
	 * Estos comandos deben ser llamados después de un comando `alterTable`
	 * @param {string} name - Nombre de la columna
	 * @param {columnOptions} options - Opciones para la columna
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.alterTable('mytable')
	 *   .addColumn('new_column', { type: 'VARCHAR(255)', notNull: true });
	 */
	/**
	 * @method alterColumn
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Añade, modifica o elimina columnas en una tabla existente.
	 * Estos comandos deben ser llamados después de un comando `alterTable`
	 * @param {string} name - Nombre de la columna
	 * @param {columnOptions} options - Opciones para la columna
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.alterTable('mytable')
	 *   .alterColumn('existing_column', { type: 'INT', default: 0 });
	 */
	/**
	 * @method dropColumn
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Añade, modifica o elimina columnas en una tabla existente.
	 * Estos comandos deben ser llamados después de un comando `alterTable`
	 * @param {string} name - Nombre de la columna
	 * @param {columnOptions} options - Opciones para la columna
	 * @return {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.alterTable('mytable')
	 *   .dropColumn('old_column');
	 */
	/**
	 * @method addConstraint
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Añade, modifica o elimina columnas en una tabla existente.
	 * Estos comandos deben ser llamados después de un comando `alterTable`
	 * @param {string} name - Nombre de la restricción
	 * @param {constraintOptions} options - Opciones para la restricción
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.alterTable('mytable')
	 *   .addConstraint('unique_constraint', { type: 'UNIQUE', columns: ['col1', 'col2'] });
	 */
	alterTableComands() {
		const comands = ["addColumn", "alterColumn", "dropColumn", "addConstraint"];
		for (const comand of comands) {
			this[comand] = (name, options, next) => {
				const alterTableIndex = this.lastStatementIn(
					"alterTable",
					next.callStack,
				);
				if (alterTableIndex) {
					const response = this.language[comand](name, options, next);
					if (alterTableIndex !== next.q.length - 1) {
						next.q.push(next.q[alterTableIndex]);
					}
					return this.toNext([response, next], ";");
				}
				next.error = `No se pueden añadir columnas sin un 'ALTER TABLE'`;
				return this.toNext([null, next]);
			};
		}
		const alterColums = ["setDefault", "dropDefault"];
		for (const comand of alterColums) {
			this[comand] = (value, next) => {
				if (this.lastStatementIn("alterColumn", next.callStack)) {
					const columnIndex = next.q.length - 1;
					const columName = next.q[columnIndex]
						.split(" ")
						.splice(2)[0]
						.split(";")[0];
					const command = this.language[comand](value, columName);
					next.q[columnIndex] = next.q[columnIndex]
						.replaceAll(";", "")
						.concat(" ", command, ";");
					return next;
				}
				this.error = "No es posible aplicar, falta el comando 'alterColumn'";
				return this.toNext([null, next]);
			};
		}
	}
	/**
	 * @method dropTable
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Elimina una tabla de la base de datos actual
	 * @param {string} name - nombre de la tabla
	 * @param {dropTableOptions} option - opciones aplicables
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.dropTable('mytable', { ifExists: true });
	 */
	dropTable(name, option, next) {
		const command = this.language.dropTable(name, option);
		return this.toNext([command, next], ";");
	}
	/**
	 * @method createType
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Crea un tipo definido por el usuario en la base de datos actual
	 * @param {string} name - nombre del tipo
	 * @param {createTypeOptions} option - opciones aplicables
	 * @returns {next} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 *
	 * @example
	 * qb.createType('mytype', { ... });
	 */
	createType(name, options, next) {
		try {
			const command = this.language.createType(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method dropType
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Elimina un tipo definido por el usuario
	 * @param {string} name - nombre del tipo
	 * @param {dropTypeOptions} option - opciones aplicables
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.dropType('mytype', { ifExists: true });
	 */
	dropType(name, options, next) {
		try {
			const command = this.language.dropType(name, options);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method createAssertion
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Permite crear una restricción a nivel de base de datos.
	 * Es una característica del
	 * SQL estándar (SQL-92 y SQL:2006) que permite definir restricciones a nivel de base de datos.
	 * Sirve para imponer condiciones que no pueden expresarse fácilmente con restricciones en columnas (CHECK) o en tablas (FOREIGN KEY).
	 * No está implementado en MySQL ni en PostgreSQL.
	 * - SQL estándar	✅
	 * - PostgreSQL		❌
	 * - MySQL				❌
	 * En su lugar, se pueden usar triggers (BEFORE INSERT/UPDATE/DELETE) o funciones con restricciones CHECK a nivel de tabla.
	 * @param {string} name - nombre
	 * @param {assertionOptions} assertion - opciones aplicables
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example

	 * qb.createAssertion('positive_balance', {
	 *   check: 'balance > 0'
	 * });

	 */
	createAssertion(name, assertion, next) {
		try {
			const command = this.language.createAssertion(
				name.validSqlId(),
				assertion,
			);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method createDomain
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Permite definir tipos de datos personalizados con restricciones.
	 * Es útil para reutilizar reglas de validación en múltiples tablas sin repetir código.
	 * - SQL estándar	✅
	 * - PostgreSQL		✅
	 * - MySQL				❌
	 * @param {string} name - Nombre del dominio
	 * @param {createDomainOptions} options - Opciones aplicables
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.createDomain('mydomain', {
	 *   type: 'text',
	 *   constraints: {
	 *     notNull: true
	 *   }
	 * });
	 */
	createDomain(name, options, next) {
		try {
			const command = this.language.createDomain(name.validSqlId(), options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method createView
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Permite definir una consulta almacenada como un objeto de la base de datos.
	 * Se comporta como una 'tabla virtual', mostrando datos obtenidos de una o varias tablas sin duplicarlos.
	 *
	 * - PostgreSQL	✅	Soporta vistas materializadas con "REFRESH MATERIALIZED VIEW"
	 * - MySQL			✅	Soporta vistas pero no vistas materializadas
	 * - SQL Server	✅	Soporta vistas indexadas para mejorar rendimiento
	 * - SQLite			❌	No permite vistas materializadas ni indexadas
	 * - Oracle			✅	Soporta vistas normales y materializadas
	 * @param {string} name - nombre de la vista
	 * @param {createViewOptions} options - opciones aplicables {cols:Array<string>, as:Select, check:boolean}
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.createView('myview', {
	 *   cols: ['id', 'name'],
	 *   as: qb.select().from('mytable'),
	 *   check: true
	 * });
	 */
	createView(name, options, next) {
		try {
			const command = this.language.createView(
				name.validSqlId(),
				options
			);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method dropView
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Elimina una vista creada previamente
	 * - PostgreSQL	✅
	 * - MySQL			✅
	 * @param {string} name - Nombre de la vista
	 * @param {dropViewOptions} options - Opciones aplicables
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.dropView('myview');
	 */
	dropView(name, options, next) {
		try {
			const command = this.language.dropView(name, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/********************************************************
	 * DCL
	 * Controlan el acceso y permisos en la base de datos.
	 ********************************************************/

	/**
	 * @method createRoles
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Crear un nuevo rol en la base de datos.
	 * Un rol es una entidad que puede representar a un usuario o un grupo de usuarios y
	 * puede recibir permisos para acceder a ciertos recursos.
	 *- PostgreSQL	✅ Maneja roles en lugar de usuarios individuales
	 *- MySQL				✅ (Desde 8.0)	Se complementa con "GRANT" para asignar permisos
	 *- SQL Server	✅ Se usa "CREATE ROLE" pero los usuarios son "entidades separadas"
	 *- SQLite			❌ No soporta roles ni usuarios
	 *- Oracle			✅ Soporta roles con permisos avanzados
	 *- MongoDB			✅	Usando "createRole" y "db.createUser"
	 * @param {string|Array<string>} names - nombre o nombres de roles a crear
	 * @param {createRolesOptions} options - WITH ADMIN
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.createRoles(['admin', 'editor'], { ifNotExists: true });
	 * // Resultado esperado: { success: true, roles: ['admin', 'editor'] }
	 */
	createRoles(names, options, next) {
		try {
			const command = this.language.createRoles(names, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method dropRoles
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Elimina el rol o roles especificados de la base de datos.
	 *- PostgreSQL	✅
	 *- MySQL				✅ (Desde 8.0)
	 * @param {string|Array<string>} names - uno o varios roles a eliminar
	 * @param {dropRolesOptions} options - opciones aplicables
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.dropRoles(['admin', 'editor'], { ifExists: true });
	 * // Resultado esperado: { success: true, dropped: ['admin', 'editor'] }
	 */
	dropRoles(names, options, next) {
		try {
			const command = this.language.dropRoles(names, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method grant
	 * @category DCL
	 * @memberof QueryBuilder
	 * @description
	 * Otorga permisos a usuarios o roles sobre objetos de la base de datos.
	 * Permite asignar permisos a usuarios.
	 *- PostgreSQL	✅	Permite permisos detallados a nivel de columna, tabla y esquema.
	 *- MySQL				✅	Usa GRANT junto con WITH GRANT OPTION para permitir reasignar permisos.
	 *- SQL Server	✅	También usa DENY y REVOKE para revocar permisos.
	 *- Oracle			✅	Soporta permisos sobre tablas, roles, procedimientos y secuencias.
	 *- SQLite			❌ No maneja usuarios ni permisos a nivel SQL.
	 *- MongoDB			✅	grantRolesToUser()	Permite asignar roles con permisos específicos.
	 * @param {string|Array<string>} privilegios - Permisos a conceder
	 * @param {string|objectTypes} on - Objeto sobre el que se otorga
	 * @param {toOptions} to - usuarios o roles a los que se otorga
	 * @param {grantOptions} options - Opciones adicionales
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example 
	 * qb.revoke('SELECT', 'users', 'admin');
	 * // Resultado esperado: { success: true, granted: 'SELECT', on: 'users', to: 'admin' }
	 */
	grant(privilegios, on, to, options, next) {
		try {
			const command = this.language.grant(privilegios, on, to, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method revoke
	 * @category DCL
	 * @memberof QueryBuilder
	 * @description
	 * Revoca permisos previamente otorgados a usuarios o roles sobre objetos de la base de datos.
	 * Se utiliza para eliminar permisos previamente otorgados a usuarios,
	 * restringiendo el acceso a objetos como tablas, vistas y esquemas.
	 *- PostgreSQL	✅ Sí	Permite revocar permisos de usuarios y roles sobre tablas, esquemas y columnas.
	 *- MySQL				✅ Sí	Se usa junto con GRANT para administrar permisos.
	 *- SQL Server	✅ Sí	Además, permite DENY para bloquear permisos específicos.
	 *- Oracle			✅ Sí	Puede revocar permisos de usuarios y roles sobre objetos de la base de datos.
	 *- SQLite			❌ No	No maneja usuarios ni permisos a nivel SQL.
	 *- MongoDB			✅	revokeRolesFromUser()	Permite eliminar roles previamente asignados a un usuario.
	 * @param {string|Array<string>} privilegios - Permisos a conceder
	 * @param {string|objectTypes} on - Objeto sobre el que se otorga
	 * @param {fromOptions} from - A quien se le retira
	 * @param {revokeOptions} options - Opciones adicionales
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.revoke('SELECT', 'users', 'admin');
	 * // Resultado esperado: { success: true, revoked: 'SELECT', on: 'users', from: 'admin' }
	 */

	revoke(privilegios, on, from, options, next) {
		try {
			const command = this.language.revoke(privilegios, on, from, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * @method grantRoles
	 * @category DCL
	 * @memberof QueryBuilder
	 * @description
	 * Como grant pero solo para roles
	 * @param {roles|Array<roles>} roles - rol o roles para asignar
	 * @param {user|Array<user>} users - usuario o usuarios a los que se conceden
	 * @param {grantRolesOptions} options - opciones adicionales
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.grantRoles('editor', 'john_doe');
	 * // Resultado esperado: { success: true, granted: 'editor', to: 'john_doe' }
	 */
	grantRoles(roles, users, options, next) {
		try {
			const command = this.language.grantRoles(roles, users, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method revokeRoles
	 * @category DCL
	 * @memberof QueryBuilder
	 * @description
	 * Como revoke, pero para roles
	 * @param {roles|Array<roles>} roles - roles a eliminar
	 * @param {fromOptions} from - A quien se le retira
	 * @param {revokeOptions} options - opciones adicionales
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.revokeRoles('editor', 'john_doe');
	 * // Resultado esperado: { success: true, revoked: 'editor', from: 'john_doe' }
	 */
	revokeRoles(roles, from, options, next) {
		try {
			const command = this.language.revokeRoles(roles, from, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**************************************************************************
	 * DQL
	 * Consultan y recuperan datos de una o varias tablas.
	 **************************************************************************/

	/**
	 * @method select
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Crea declaración SELECT para recuperación de datos
	 * Genera cláusula SQL SELECT con columnas y opciones especificadas
	 * SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	 * @param {string|Column|Array<string>|Array<Column>} columns - Columnas seleccionadas
	 * @param {SelectOptions} options - opciones
	 * @returns {next} Objeto pasado al siguiente comando para encadenar
	 * @example 
	 * SELECT columna1, columna2 FROM tabla;
	 * // Seleccionar todas las columnas
	 * qb.select('*').from('users');
	 * 
	 * // Seleccionar columnas específicas
	 * qb.select(['name', 'email']).from('users');
	 * 
	 * // Seleccionar con DISTINCT
	 * qb.select('category', { distinct: true }).from('products');

	 */
	select(columns, options, next) {
		try {
			const command = this.language.select(columns, options, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
		}
		return this.toNext([null, next]);
	}
	/**
	 * @method checkFrom
	 * @private
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Comprueba en tiempo de ejecucion que los tipos de "tables" corresponden con los de "alias"
	 * y que la longitud de los arrays sea la correcta.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas
	 * @param {alias|Array<alias>} alias - alias o lista de alias
	 * @throws {Error} Si los tipos o longitudes no coinciden
	 * @example
	 * checkFrom("tabla", "t");
	 * checkFrom(["tabla1", "tabla2"], ["t1", "t2"]);
	 * checkFrom("tabla", ["t1", "t2"]); // Error
	 * checkFrom(["tabla1", "tabla2"], "t1"); // Error
	 * checkFrom(["tabla1", "tabla2"], ["t1"]); // Error
	 * checkFrom("tabla", "t1", "t2"); // Error
	 * checkFrom(["tabla1", "tabla2"], ["t1", "t2", "t3"]); // Válido
	 */
	checkFrom(tables, alias) {
		// biome-ignore lint/style/noArguments: <explanation>
		const args = [...arguments];
		const error = check(
			"checkFrom(tables:string|array, alias:string|array)",
			args,
		);
		if (error) {
			throw new Error(error);
		}
		if (alias !== undefined) {
			if (typeof tables !== typeof alias) {
				throw new Error("Deben de ser del mismo tipo", {
					cause: `${typeof tables} !== ${typeof alias}`,
				});
			}
			if (Array.isArray(tables) && alias.length < tables.length) {
				throw new Error(
					"la lista de 'Alias' deben tener como mínimo el mismo numero de elementos que 'tablas'",
				);
			}
		}
	}
	/**
	 * @method from
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Especifica la tabla o vista de donde se van a obtener los datos.
	 * @param {tabla|Array<tabla>} tables - tabla o tablas de donde obtener los datos
	 * @param {alias|Array<alias>} alias - alias o lista de alias correspondiente a las tablas
	 * @returns {next} Objeto pasado al siguiente comando para encadenar
	 * @example
	 * // Ejemplos válidos
	 * qb.from("users", "u");
	 * qb.from(["users", "orders"], ["u", "o"]);
	 * qb.from("users");
	 * qb.from(["users", "orders"]);
	 * // Errores
	 * qb.from("users", ["u", "o"]); // Error
	 * qb.from(["users", "orders"], "u"); // Error
	 * qb.from(["users", "orders"], ["u"]); // Error
	 * qb.from("users", "u", "o"); // Error
	 * qb.from(["users", "orders"], ["u", "o", "x"]); // Válido
	 */
	from(tablas, alias, next) {
		try {
			log(["QB", "from(tablas, alias, next)"], "Recibe: next", next);
			if (next.last !== "select") {
				throw new Error(
					"[from] No es posible usar 'FROM', falta el comando 'select'",
					{ cause: `${next.last} !== "select"` },
				);
			}
			this.checkFrom(tablas, alias);
			const command = this.language.from(tablas, alias);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method where
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Define la condición WHERE para filtrar registros en una consulta SQL.
	 * Soporta cadenas SQL, instancias de QueryBuilder o arrays de condiciones.
	 * Filtrar registros en una consulta, seleccionando solo aquellos que cumplen con una condición específica.
	 * Es una parte esencial en las sentencias SELECT, UPDATE, DELETE, etc., ya que permite limitar los resultados
	 * o modificar solo las filas que cumplen con ciertos criterios.
	 * @param {predicado|Array<predicado>} predicados - Condiciones del WHERE (cadena, expresión QB o array)
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
		* @example

	 * qb.select('*').from('users').where('age > 18');
	 * qb.select('*').from('users').where(qb.and(qb.eq('active', 1), qb.gt('age', 18)));
	 * qb.update('users', { status: 'inactive' }).where('last_login < "2023-01-01"');

	 */

	where(predicados, next) {
		next.isQB = predicados instanceof QueryBuilder || false;

		// Special handling only for specific cases like DELETE subconsulta pattern
		// Only apply when we have a QueryBuilder predicate in a DELETE/UPDATE context
		if (predicados instanceof QueryBuilder && (!next.q || next.q.length === 0)) {
			// Check if this is really a DELETE/UPDATE scenario that needs special handling
			const hasDeleteUpdateContext = next.q && next.q.some(item =>
				typeof item === 'string' &&
				(item.trim().toLowerCase().startsWith('delete') || item.trim().toLowerCase().startsWith('update'))
			);

			if (hasDeleteUpdateContext) {
				// This handles the DELETE subconsulta case we fixed before
				return predicados.toString().then(predicadoSQL => {
					const cleanSQL = predicadoSQL.replace(/;$/, '');
					const whereSQL = `WHERE ${cleanSQL}`;
					return this.toNext([whereSQL, next]);
				});
			}
		}

		const command = this.language.where(predicados, next);
		log("where", "command %o", command);
		return this.toNext([command, next]);
	}
	/**
	 * @method whereCursor
	 * @category DQL
	 * @memberof QueryBuilder
	 * Define la condición "WHERE CURRENT OF" para un cursor específico.
	 * Esta cláusula se utiliza en sentencias SQL para referirse a la fila actual apuntada por un cursor.
	 * Es especialmente útil en operaciones de actualización o eliminación donde se desea modificar o eliminar
	 * la fila actual del conjunto de resultados manejado por el cursor.
	 * @param {cursorName} cursorName - Nombre del cursor
	 * @returns {next} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example
	 * qb.whereCursor('miCursor');
	 */
	whereCursor(cursorName, next) {
		if (this.cursores?.[cursorName] === undefined) {
			next.error = `El cursor '${cursorName}' no ha sido definido`;
			return this.toNext([null, next]);
		}
		const response = this.language.whereCursor(cursorName);
		log(
			["QB", "whereCursor"],
			"next %o cursor",
			next,
			this.cursores?.[cursorName].cursor,
		);
		return this.toNext([response, next]);
	}

	/**
	 * @method joins
	 * @private
	 * @category DQL
	 * @memberof QueryBuilder
	 * Define las funciones de JOIN entre tablas
	 * Tipos de JOIN soportados:
	 * - CROSS JOIN: Combina todas las filas de dos tablas, produciendo el producto cartesiano.
	 * - NATURAL JOIN: Realiza un JOIN basado en todas las columnas con el mismo nombre en ambas tablas.
	 * - INNER JOIN: Devuelve solo las filas que tienen coincidencias en ambas tablas.
	 * - LEFT JOIN: Devuelve todas las filas de la tabla izquierda y las filas coincidentes de la tabla derecha.
	 * - RIGHT JOIN: Devuelve todas las filas de la tabla derecha y las filas coincidentes de la tabla izquierda.
	 * - FULL JOIN: Devuelve filas cuando hay una coincidencia en una de las tablas.
	 * cada funcion recibe tres parametros
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.joins('tabla1', 'tabla2', 'miCursor');
	 * qb.joins(['tabla1', 'tabla2'], ['t1', 't2'], 'miCursor');
	 * // Errores
	 * qb.joins('tabla1', ['t1', 't2'], 'miCursor'); // Error
	 */
	/**
	 * @method crossJoin
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Realiza un CROSS JOIN entre tablas.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.crossJoin('tabla1', 'tabla2');
	 */
	/**
	 * @method naturalJoin
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Realiza un NATURAL JOIN entre tablas.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.naturalJoin('tabla1', 'tabla2');
	 */
	/**
	 * @method innerJoin
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Realiza un INNER JOIN entre tablas.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.innerJoin('tabla1', 'tabla2');
	 */
	/**
	 * @method join
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Realiza un JOIN entre tablas.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.join('tabla1', 'tabla2');
	 */
	/**
	 * @method leftJoin
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Realiza un LEFT JOIN entre tablas.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.leftJoin('tabla1', 'tabla2');
	 */
	/**
	 * @method rightJoin
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Realiza un RIGHT JOIN entre tablas.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.rightJoin('tabla1', 'tabla2');
	 */
	/**
	 * @method fullJoin
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Realiza un FULL JOIN entre tablas.
	 * @param {tabla|Array<tabla>} tables - tabla o lista de tablas a unir
	 * @param {alias|Array<alias>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.fullJoin('tabla1', 'tabla2');
	 */
	joins() {
		const joinTypes = [
			"crossJoin",
			"naturalJoin",
			"innerJoin",
			"join",
			"leftJoin",
			"rightJoin",
			"fullJoin",
		];
		for (const join of joinTypes) {
			this[join] = (tables, alias, next) => {
				this.checkFrom(tables, alias);
				log(["QB", "joins", "%o"], " Recibe el objeto next", join, next);
				// Fix: Allow JOIN after FROM, not just SELECT or ON
				if (["select", "on", "from"].includes(next?.last)) {
					const result = this.language[join](tables, alias);
					if (result instanceof Error) {
						next.error = result;
						return this.toNext([null, next]);
					}
					return this.toNext([result, next]);
				}
				next.error =
					"No es posible aplicar, falta un comando previo 'select', 'from' u 'on'";
				return this.toNext([null, next]);
			};
		}
		//Añade comandos con distinto nombre e identica funcion
		const sinonimos = {
			leftOuterJoin: this.leftJoin,
			rightOuterJoin: this.rightJoin,
			fullOuterJoin: this.fullJoin,
		};
		for (const otros in sinonimos) {
			this[otros] = sinonimos[otros];
		}
	}
	/**
	 * @method using
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * El comando USING se utiliza en SQL para especificar las columnas que se van a utilizar para combinar dos tablas en una operación JOIN.
	 * A diferencia de la cláusula ON, que requiere una condición explícita, USING simplifica la sintaxis al asumir que las columnas mencionadas tienen el mismo nombre en ambas tablas.
	 * Se usa principalmente en consultas SQL para especificar columnas en operaciones de JOIN.
	 * Es especialmente útil cuando las columnas que se van a combinar tienen el mismo nombre en ambas tablas.
	 * @param {columnName|Array<columnName>} columnsInCommon - Columna o array de columnas en comun
	 * @returns	 {next} Instancia para el encadenamiento de métodos
	 * @throws {Error} Si el comando previo no es un JOIN válido
	 * @example
	 * qb.select('*').from('tabla1').join('tabla2').using('columna_comun');
	 * qb.select('*').from('tabla1').innerJoin('tabla2').using('columna_comun');
	 * // Errores
	 * qb.select('*').from('tabla1').where('condicion').using('columna_comun'); // Error
	 */
	using(columnsInCommon, next) {
		// solo se puede aplicar si el ultimo comando es un join del tipo incluido en el array
		if (["innerJoin", "join", "leftJoin", "rightJoin"].includes(next.last)) {
			const response = this.language.using(columnsInCommon);
			return this.toNext([response, next]);
		}
		next.error = `No es posible aplicar 'USING' a un join de tipo: "${next.last}"`;
		return this.toNext([null, next]);
	}
	/**
	 * @method on
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Especifica la condición de unión para un JOIN.
	 * Se utiliza para definir cómo se combinan las filas de dos tablas en una operación JOIN.
	 * @param {condition} condition - Condición de unión
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 * @example
	 * qb.select('*').from('tabla1').join('tabla2').on('tabla1.id = tabla2.id');
	 * qb.select('*').from('tabla1').innerJoin('tabla2').on('tabla1.id = tabla2.id');
	 * // Errores
	 * qb.select('*').from('tabla1').where('condicion').on('tabla1.id = tabla2.id'); // Error
	 */
	on(condition, next) {
		// solo se puede aplicar si el ultimo comando es un join del tipo incluido en el array
		if (["innerJoin", "join", "leftJoin", "rightJoin"].includes(next.last)) {
			const response = this.language.on(condition);
			return this.toNext([response, next]);
		}
		next.error = `No es posible aplicar 'ON' a un join de tipo: "${next.last}"`;
		return this.toNext([null, next]);
	}
	/**
	 * @method union
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * SQL Server	✅ Sí	Soporta ambas opciones UNION y UNION ALL.
	 * Oracle			✅ Sí	Permite UNION y UNION ALL para combinar resultados de varias consultas.
	 * SQLite			✅ Sí	Soporta UNION y UNION ALL en consultas SELECT.
	 * MongoDB	$unionWith	Permite combinar los resultados de dos colecciones en una agregación.
	 * @param  {...selectList} selects - Lista de sentencias select o QueryBuilders a unir como mínimo dos.
	 * @returns {next} - Objeto pasado al siguiente comando para encadenar
	 */
	union(...selects) {
		// When called on fresh QB instance, all parameters are queries to union
		if (selects.length < 2) {
			const error = "UNION necesita al menos dos instrucciones SELECT";
			return this.toNext([null, { error }]);
		}

		// Create a new next object for this operation
		const next = {
			last: null,
			callStack: ['union'],
			prop: 'union'
		};

		const response = this.language.union(selects, next, { all: false });
		return this.toNext([response, next]);
	}
	/**
	 * @method unionAll
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Combinar los resultados de dos o más consultas SELECT.
	 * Incluyendo duplicados.
	 * @param  {...selectList} selects - Lista de sentencias select o QueryBuilders usando UNION ALL
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * qb.unionAll(select1, select2);
	 */
	unionAll(...selects) {
		log(["QB", "unionAll"], "recibe selects", selects);
		// When called on fresh QB instance, all parameters are queries to union
		if (selects.length < 2) {
			const error = "UNION ALL necesita al menos dos instrucciones SELECT";
			return this.toNext([null, { error }]);
		}

		// Create a new next object for this operation
		const next = {
			last: null,
			callStack: ['unionAll'],
			prop: 'unionAll'
		};

		const response = this.language.union(selects, next, { all: true });
		return this.toNext([response, next]);
	}
	/**
	 * @method intersect
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * El comando INTERSECT se utiliza en SQL para obtener los registros comunes entre dos consultas SELECT.
	 * Retorna solo las filas que existen en ambas consultas, eliminando duplicados.
	 * PostgreSQL	✅ 	Soporta INTERSECT para obtener los registros comunes entre dos consultas.
	 * MySQL			❌ 	No soporta INTERSECT, pero puede emularse con JOIN o IN.
	 * SQL Server	❌ 	No soporta INTERSECT ALL, pero se puede simular con GROUP BY y HAVING.
	 * Oracle			✅ 	Soporta INTERSECT en consultas SQL.
	 * SQLite			❌ 	No tiene soporte nativo para INTERSECT, pero puede simularse con JOIN.
	 * MongoDB	$lookup con $match	Se puede utilizar una combinación de lookup para unir colecciones y luego filtrar los resultados comunes con $match.
	 * @param  {...selectList} selects - Lista de sentencias select o QueryBuilders a intersectar como mínimo dos.
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example

	 * qb.intersect(select1, select2);

	 */
	intersect(...selects) {
		const next = selects.pop();
		log(["QB", "intersect"], "recibe next", next);
		if (selects.length < 2) {
			next.error = "INTERSECT necesita mínimo dos instrucciones SELECT";
			return this.toNext([null, next]);
		}
		const response = this.language.intersect(selects, next, { all: false });
		return this.toNext([response, next]);
	}
	/**
	 * @method intersectAll
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * El comando INTERSECT ALL es similar a INTERSECT, pero mantiene los duplicados en el resultado.
	 * A diferencia de INTERSECT, que elimina los duplicados,
	 * INTERSECT ALL retiene las filas comunes que aparecen en ambas consultas, incluyendo todas las repeticiones de esas filas.
	 *
	 * PostgreSQL	✅ 	Soporta INTERSECT para obtener los registros comunes entre dos consultas.
	 * MySQL			❌ 	No soporta INTERSECT, pero puede emularse con JOIN o IN.
	 * SQL Server	✅ 	Soporta INTERSECT para encontrar intersecciones entre dos conjuntos de resultados.
	 * Oracle			✅ 	Soporta INTERSECT en consultas SQL.
	 * SQLite			❌ 	No tiene soporte nativo para INTERSECT, pero puede simularse con JOIN.
	 * MongoDB	$lookup con $group	Se pueden combinar colecciones y luego agrupar los resultados para mantener duplicados.
	 * @param  {...selectList} selects - Lista de sentencias select o QueryBuilders a intersectar como mínimo dos.
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example

	 * qb.intersectAll(select1, select2);

	 */
	intersectAll(...selects) {
		const next = selects.pop();
		log(["QB", "intersectAll"], "recibe next", next);
		if (selects.length < 2) {
			next.error = "INTERSECT necesita mínimo dos instrucciones SELECT";
			return this.toNext([null, next]);
		}
		const response = this.language.intersect(selects, next, { all: true });
		return this.toNext([response, next]);
	}
	/**
	 * @method except
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * El comando EXCEPT se utiliza para obtener los registros que están en la primera consulta, pero no en la segunda.
	 * Este comando elimina los duplicados por defecto, retornando solo los registros únicos que existen
	 * en la primera consulta y no en la segunda.
	 * PostgreSQL	✅ Soporta EXCEPT para obtener registros de la primera consulta que no estén en la segunda.
	 * MySQL			❌ No soporta EXCEPT, pero se puede emular utilizando LEFT JOIN o NOT EXISTS.
	 * SQL Server	✅ Soporta EXCEPT para obtener diferencias entre dos conjuntos de resultados.
	 * Oracle			✅ Soporta EXCEPT para encontrar registros que están en la primera consulta pero no en la segunda.
	 * SQLite			❌ No tiene soporte nativo para EXCEPT, pero se puede simular con LEFT JOIN o NOT EXISTS.
	 * MongoDB	$lookup con $match y $project	Se puede emular EXCEPT mediante un lookup para combinar colecciones y luego excluir los registros coincidentes.
	 * @param  {...selectList} selects - Lista de sentencias select o QueryBuilders a excluir como mínimo dos.
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * qb.except(select1, select2);
	 */
	except(...selects) {
		const next = selects.pop();
		log(["QB", "except"], "recibe next", next);
		if (selects.length < 2) {
			next.error = "EXCEPT necesita mínimo dos instrucciones SELECT";
			return this.toNext([null, next]);
		}
		const response = this.language.except(selects, next, { all: false });
		return this.toNext([response, next]);
	}
	/**
	 * @method exceptAll
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * El comando EXCEPT ALL es una variante de EXCEPT que, a diferencia de EXCEPT,
	 * mantiene los duplicados en el resultado.
	 * Es decir, devuelve todas las filas que están en la primera consulta, pero no en la segunda, y mantiene las repeticiones de esas filas.
	 * PostgreSQL	✅ Soporta EXCEPT ALL para obtener las filas que están en la primera consulta, pero no en la segunda, manteniendo duplicados.
	 * MySQL			❌ No soporta EXCEPT ALL, pero puede emularse utilizando LEFT JOIN o NOT EXISTS.
	 * SQL Server	❌ No soporta EXCEPT ALL, aunque se puede simular con GROUP BY y HAVING.
	 * Oracle			❌ No tiene soporte nativo para EXCEPT ALL.
	 * SQLite			❌ No soporta EXCEPT ALL, pero puede emularse con LEFT JOIN o NOT EXISTS.
	 * MongoDB	$lookup con $group y $match	Se pueden combinar colecciones y luego filtrar los resultados para mantener duplicados.
	 * @param  {...selectList} selects - Lista de sentencias select o QueryBuilders a excluir como mínimo dos.
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * qb.exceptAll(select1, select2);
	 */
	exceptAll(...selects) {
		const next = selects.pop();
		log(["QB", "exceptAll"], "recibe next", next);
		if (selects.length < 2) {
			next.error = "EXCEPT ALL necesita mínimo dos instrucciones SELECT";
			return this.toNext([null, next]);
		}
		const response = this.language.except(selects, next, { all: true });
		return this.toNext([response, next]);
	}
	/**
	 * @method on
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Operaciones de JOIN para especificar las condiciones de cómo se deben combinar las tablas.
	 * Define las columnas o condiciones que se deben cumplir para que filas de diferentes tablas sean combinadas.
	 * @param {predicado} predicado - Condición de unión
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * SELECT columna1, columna2
	 * FROM tabla1
	 * JOIN tabla2
	 * ON tabla1.columna = tabla2.columna;
	 */
	on(predicado, next) {
		log(["QB", "on"], "Recibe next", next);
		if (
			["innerJoin", "join", "leftJoin", "rightJoin", "fullJoin"].some((item) =>
				next.callStack.includes(item),
			)
		) {
			const response = this.language.on(predicado, next);
			return this.toNext([response, next]);
		}
		next.error = "No es posible aplicar 'on', falta un comando tipo 'join'";
		return this.toNext([null, next]);
	}
	/*****************************************************************************
	 * PREDICADOS
	 * Son expresiones que devuelven un valor booleano (TRUE, FALSE o NULL).
	 * Se utilizan en cláusulas WHERE, HAVING y ON para filtrar registros basados en condiciones específicas.
	 * Permiten realizar comparaciones, verificaciones de existencia, rangos y combinaciones lógicas.
	 * Son fundamentales para construir consultas SQL dinámicas y complejas.
	 * operadores unarios
	 ******************************************************************************/

	/**
	 * 
	 * @method predicados
	 * @private
	 * @category General
	 * @memberof QueryBuilder
	 * @private
	 * @description 
	 * Crea dinámicamente métodos de predicado para construir condiciones WHERE
	 * Genera funciones de comparación, lógicas y predicados específicos de SQL
	 * @param {string} methodName - Nombre del método a crear
	 * @param {Function} implementation - Implementación de la función
	 */

	/**
	 * @method isNull
	 * @description Verifica si un valor es NULL
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue|Array<sqlValue>} a - Columna, expresión o array de columnas a verificar si son NULL
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Verificar una columna
	 * qb.select('*').from('usuarios').where(qb.isNull('email'));
	 * // SQL: SELECT * FROM usuarios WHERE email IS NULL
	 */
	/**
	 * @method isNotNull
	 * @description Verifica si un valor no es NULL
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue|Array<sqlValue>} a - Columna, expresión o array de columnas a verificar si no son NULL
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Verificar una columna
	 * qb.select('*').from('usuarios').where(qb.isNotNull('email'));
	 * // SQL: SELECT * FROM usuarios WHERE email IS NOT NULL
	 */
	/**
	 * @method exists
	 * @description Verifica si una subconsulta devuelve resultados
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {QueryBuilder} subquery - Subconsulta a evaluar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar	
	 * @example
	 * // Verificar existencia de registros en una subconsulta
	 * const subquery = qb.select('id').from('ordenes').where(qb.eq('usuario_id', 'usuarios.id'));
	 */
	/**
	 * @method notExists
	 * @description Verifica si una subconsulta no devuelve resultados
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {QueryBuilder} subquery - Subconsulta a evaluar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Verificar inexistencia de registros en una subconsulta
	 * const subquery = qb.select('id').from('ordenes').where(qb.eq('usuario_id', 'usuarios.id'));
	 */
	/**
	 * @method any
	 * @description Compara un valor con cualquier valor devuelto por una subconsulta
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Valor a comparar
	 * @param {QueryBuilder} subquery - Subconsulta que devuelve valores para la comparación
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar un valor con cualquier valor de una subconsulta
	 * const subquery = qb.select('edad').from('usuarios').where(qb.gt('edad', 18));
	 */
	/**
	 * @method some
	 * @description Compara un valor con algunos valores devueltos por una subconsulta
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Valor a comparar
	 * @param {QueryBuilder} subquery - Subconsulta que devuelve valores para la comparación
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar un valor con algunos valores de una subconsulta
	 * const subquery = qb.select('salario').from('empleados').where(qb.gt('salario', 50000));
	 */
	/**
	 * @method all
	 * @description Compara un valor con todos los valores devueltos por una subconsulta
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Valor a comparar
	 * @param {QueryBuilder} subquery - Subconsulta que devuelve valores para la comparación
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar un valor con todos los valores de una subconsulta
	 * const subquery = qb.select('puntaje').from('estudiantes').where(qb.gt('puntaje', 70));
	 */
	/**
	 * @method eq
	 * @description Compara si dos valores son iguales
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Primer valor a comparar
	 * @param {sqlValue} b - Segundo valor a comparar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar igualdad entre dos valores
	 * qb.select('*').from('productos').where(qb.eq('categoria', 'Electrónica'));
	 * // SQL: SELECT * FROM productos WHERE categoria = 'Electrónica'
	 */
	/**
	 * @method ne
	 * @description Compara si dos valores son diferentes
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Primer valor a comparar
	 * @param {sqlValue} b - Segundo valor a comparar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar desigualdad entre dos valores
	 * qb.select('*').from('empleados').where(qb.ne('departamento', 'Ventas'));
	 * // SQL: SELECT * FROM empleados WHERE departamento <> 'Ventas'
	 */
	/**
	 * @method gt
	 * @description Compara si un valor es mayor que otro
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Primer valor a comparar
	 * @param {sqlValue} b - Segundo valor a comparar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar si un valor es mayor que otro
	 * qb.select('*').from('productos').where(qb.gt('precio', 100));
	 * // SQL: SELECT * FROM productos WHERE precio > 100
	 */
	/**
	 * @method gte
	 * @description Compara si un valor es mayor o igual que otro
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Primer valor a comparar
	 * @param {sqlValue} b - Segundo valor a comparar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar si un valor es mayor o igual que otro
	 * qb.select('*').from('productos').where(qb.gte('precio', 100));
	 * // SQL: SELECT * FROM productos WHERE precio >= 100
	 */
	/**
	 * @method lt
	 * @description Compara si un valor es menor que otro
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Primer valor a comparar
	 * @param {sqlValue} b - Segundo valor a comparar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar si un valor es menor que otro
	 * qb.select('*').from('productos').where(qb.lt('precio', 100));
	 * // SQL: SELECT * FROM productos WHERE precio < 100
	 */
	/**
	 * @method lte
	 * @description Compara si un valor es menor o igual que otro
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Primer valor a comparar
	 * @param {sqlValue} b - Segundo valor a comparar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar si un valor es menor o igual que otro
	 * qb.select('*').from('productos').where(qb.lte('precio', 100));
	 * // SQL: SELECT * FROM productos WHERE precio <= 100
	 */
	/**
	 * 	 * @method like
		 * @description Compara si un valor coincide con un patrón utilizando comodines
		 * @category Predicates
		 * @memberof QueryBuilder
		 * @param {sqlValue} a - Valor a comparar
		 * @param {string} b - Patrón con comodines para la comparación
		 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
		 * @example
		 * // Comparar si un valor coincide con un patrón
		 * qb.select('*').from('usuarios').where(qb.like('nombre', 'J%n%'));
		 * // SQL: SELECT * FROM usuarios WHERE nombre LIKE 'J%n%'
		 */
	/**
	 * @method notLike
	 * @description Compara si un valor no coincide con un patrón utilizando comodines
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Valor a comparar
	 * @param {string} b - Patrón con comodines para la comparación
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Comparar si un valor no coincide con un patrón
	 * qb.select('*').from('usuarios').where(qb.notLike('nombre', 'J%n%'));
	 * // SQL: SELECT * FROM usuarios WHERE nombre NOT LIKE 'J%n%'
	 */
	/**
	 * @method between
	 * @description Verifica si un valor está dentro de un rango especificado
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Valor a comparar
	 * @param {sqlValue} b - Límite inferior del rango
	 * @param {sqlValue} c - Límite superior del rango
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Verificar si un valor está dentro de un rango
	 * qb.select('*').from('productos').where(qb.between('precio', 50, 150));
	 * // SQL: SELECT * FROM productos WHERE precio BETWEEN 50 AND 150
	 */
	/**
	 * @method notBetween
	 * @description Verifica si un valor está fuera de un rango especificado
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} a - Valor a comparar
	 * @param {sqlValue} b - Límite inferior del rango
	 * @param {sqlValue} c - Límite superior del rango
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Verificar si un valor está fuera de un rango
	 * qb.select('*').from('productos').where(qb.notBetween('precio', 50, 150));
	 * // SQL: SELECT * FROM productos WHERE precio NOT BETWEEN 50 AND 150
	 */
	/**
	 * @method and
	 * @description Combina múltiples condiciones con un operador lógico AND
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {...sqlValue} condiciones - Condiciones a combinar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Combinar condiciones con AND
	 * qb.select('*').from('usuarios').where(qb.and(qb.eq('activo', true), qb.gt('edad', 18)));
	 * // SQL: SELECT * FROM usuarios WHERE activo = true AND edad > 18
	 */
	/**
	 * @method or
	 * @description Combina múltiples condiciones con un operador lógico OR
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {...sqlValue} condiciones - Condiciones a combinar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Combinar condiciones con OR
	 * qb.select('*').from('usuarios').where(qb.or(qb.eq('rol', 'admin'), qb.eq('rol', 'moderador')));
	 * // SQL: SELECT * FROM usuarios WHERE rol = 'admin' OR rol = 'moderador'
	 */
	/**
	 * @method not
	 * @description Niega una condición
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @param {sqlValue} condicion - Condición a negar
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Negar una condición
	 * qb.select('*').from('productos').where(qb.not(qb.lt('stock', 10)));
	 * // SQL: SELECT * FROM productos WHERE NOT (stock < 10)
	 */
	/**
	 * @method distinct
	 * @description Aplica el modificador DISTINCT a una consulta para eliminar duplicados
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Aplicar DISTINCT a una consulta
	 * qb.select('categoria').from('productos').distinct();
	 * // SQL: SELECT DISTINCT categoria FROM productos
	 */
	predicados() {
		const operOneCol = [
			"isNull",
			"isNotNull",
			"exists",
			"notExists",
			"any",
			"some",
			"all",
		];

		const operTwoCols = [
			"eq",
			"ne",
			"gt",
			"gte",
			"lt",
			"lte",
			"like",
			"notLike",
		];
		const operThreeArg = ["between", "notBetween"];
		const logicos = ["and", "or", "not", "distinct"];

		for (const operOne of operOneCol) {
			this[operOne] = (a, next) => {
				const response = this.language[operOne](a, next);
				log(["QB", "predicados", "%o"], "respuesta", operOne, response);
				return this.toNext([response, next]);
			};
		}
		for (const operTwo of operTwoCols) {
			this[operTwo] = (a, b, next) => {
				log(
					["QueryBuilder", "operTwoCols", "%s"],
					"a:%o, b:%o next:%o",
					operTwo,
					a instanceof QueryBuilder ? "QB" : a,
					b instanceof QueryBuilder ? "QB" : b,
					next,
				);
				const result = this.language[operTwo](a, b, next);
				const nextObj = this.toNext([result, next]);
				return nextObj;
			};
		}

		//"between", "notBetween"
		for (const operThree of operThreeArg) {
			this[operThree] = (a, b, c, next) =>
				this.toNext([this.language[operThree](a, b, c, next), next]);
		}
		// "and", "or", "not", "distinct"
		for (const oper of logicos) {
			this[oper] = (...predicados) => {
				const next = predicados.pop();
				log(["QueryBuilder", "predicados"], "[%s] next:", oper, next);
				const valores = predicados
					.reduce((acc, curr) => {
						if (curr instanceof QueryBuilder) {
							acc.push(next.q.pop());
						} else {
							acc.push(curr);
						}
						return acc;
					}, [])
					.reverse();
				const command = this.language[oper](...valores);
				return this.toNext([command, next]);
			};
		}
	}

	/**
	 * @method in
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * El operador IN en SQL se utiliza para comprobar si un valor está presente dentro de un conjunto de valores.
	 * Es útil cuando se necesita realizar comparaciones múltiples sin tener que escribir múltiples condiciones OR.
	 * Acepta valores individuales, arrays o subconsultas.
	 * @param {columnName} columna - Nombre de la columna a verificar si está en la lista de valores. Puede ser un string o un objeto Column.
	 * @param {...sqlValue|QueryBuilder} values - Lista de valores o subconsulta. Puede ser:
	 * - Valores individuales separados por comas: `in('categoria', 'A', 'B', 'C')`
	 * - Array de valores: `in('id', [1, 2, 3, 4, 5])`
	 * - Subconsulta QueryBuilder: `in('usuario_id', qb.select('id').from('usuarios_activos'))`
	 * El último parámetro es siempre el objeto `next` (añadido automáticamente por el Proxy).
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Con valores individuales
	 * qb.select('*').from('productos')
	 *   .where(qb.in('categoria', 'electrónica', 'hogar', 'deportes'));
	 * // SQL: SELECT * FROM productos WHERE categoria IN ('electrónica', 'hogar', 'deportes')
	 * 
	 * @example
	 * // Con array de valores
	 * qb.select('*').from('usuarios')
	 *   .where(qb.in('id', [1, 2, 3, 4, 5]));
	 * // SQL: SELECT * FROM usuarios WHERE id IN (1, 2, 3, 4, 5)
	 * 
	 * @example
	 * // Con subconsulta QueryBuilder
	 * qb.select('*').from('posts')
	 *   .where(qb.in('autor_id', qb.select('id').from('usuarios_activos')));
	 * // SQL: SELECT * FROM posts WHERE autor_id IN (SELECT id FROM usuarios_activos)
	 * 
	 * @example
	 * // Con objeto Column
	 * qb.select('*').from('ventas')
	 *   .where(qb.in(qb.col('producto_id'), [10, 20, 30]));
	 * // SQL: SELECT * FROM ventas WHERE producto_id IN (10, 20, 30)
	 */
	in(columna, ...values) {
		log(["QB", "in"], "columna %o values %o", columna, values);
		const next = values.pop();
		const result = this.language.in(columna, values, next);
		log(["QB", "in"], "valor resultado %o", result);
		return this.toNext([result, next]);
	}
	/**
	 * @method notIn
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * El operador NOT IN en SQL se utiliza para filtrar registros cuyo valor NO está presente en un conjunto de valores especificados.
	 * Permite excluir múltiples valores en una sola condición, siendo la negación del operador IN.
	 * Es útil para filtrar datos excluyendo categorías, IDs específicos o resultados de subconsultas.
	 * @param {columnName} columna - Nombre de la columna a verificar que NO esté en la lista de valores. Puede ser un string o un objeto Column.
	 * @param {...sqlValue|QueryBuilder} values - Lista de valores a excluir o subconsulta. Puede ser:
	 * - Valores individuales separados por comas: `notIn('estado', 'cancelado', 'rechazado')`
	 * - Array de valores: `notIn('id', [1, 2, 3])`
	 * - Subconsulta QueryBuilder: `notIn('usuario_id', qb.select('id').from('bloqueados'))`
	 * El último parámetro es siempre el objeto `next` (añadido automáticamente por el Proxy).
	 * @returns {next} - Objeto next pasado al siguiente comando para encadenar
	 * @example
	 * // Con valores individuales
	 * qb.select('*').from('pedidos')
	 *   .where(qb.notIn('estado', 'cancelado', 'rechazado', 'devuelto'));
	 * // SQL: SELECT * FROM pedidos WHERE estado NOT IN ('cancelado', 'rechazado', 'devuelto')
	 * 
	 * @example
	 * // Con array de valores
	 * qb.select('*').from('productos')
	 *   .where(qb.notIn('categoria_id', [5, 7, 9]));
	 * // SQL: SELECT * FROM productos WHERE categoria_id NOT IN (5, 7, 9)
	 * 
	 * @example
	 * // Con subconsulta QueryBuilder
	 * qb.select('*').from('usuarios')
	 *   .where(qb.notIn('id', qb.select('usuario_id').from('bloqueados')));
	 * // SQL: SELECT * FROM usuarios WHERE id NOT IN (SELECT usuario_id FROM bloqueados)
	 * 
	 * @example
	 * // Con objeto Column
	 * qb.select('*').from(['ventas', 'v'])
	 *   .where(qb.notIn(qb.col('producto_id', 'v'), [100, 200, 300]));
	 * // SQL: SELECT * FROM ventas v WHERE v.producto_id NOT IN (100, 200, 300)
	 */
	notIn(columna, ...values) {
		const next = values.pop();
		const result = this.language.notIn(columna, values, next);
		return this.toNext([result, next]);
	}

	/**
	 * @method col
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Crea una instancia de Column para referenciar columnas en consultas SQL.
	 * Permite especificar el nombre de la columna y opcionalmente el nombre o alias de la tabla.
	 * Facilita la construcción de consultas SQL tipadas y con contexto de tabla, permitiendo
	 * operaciones como alias, casting de tipos y referencias cualificadas con tabla.
	 * 
	 * Un objeto Column proporciona métodos adicionales como `.as()` para alias, `.cast()` para
	 * conversión de tipos, y `.from()` para especificar la tabla origen.
	 * 
	 * @param {String|QueryBuilder|Expresion} name - Nombre de la columna, subconsulta o expresión:
	 * - String: Nombre simple de columna como `"id"`, `"nombre"`, `"email"`
	 * - QueryBuilder: Subconsulta que retorna un valor para usar como columna derivada
	 * - Expresion: Expresión SQL compleja como función agregada o cálculo
	 * @param {tabla|alias} [table] - Nombre de la tabla o alias de tabla. Si se proporciona, se genera una
	 * referencia cualificada como `tabla.columna` o `alias.columna`. Opcional para columnas sin ambigüedad.
	 * @returns {Column} Instancia de Column con métodos adicionales para manipulación:
	 * - `.as(alias)`: Asignar alias a la columna
	 * - `.cast(type)`: Convertir tipo de dato
	 * - `.from(table)`: Especificar tabla origen
	 * - `.toString()`: Generar SQL de la columna
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example
	 * // Columna simple sin tabla
	 * const idCol = qb.col('id');
	 * // Uso: SELECT id FROM usuarios
	 * 
	 * @example
	 * // Columna con tabla/alias
	 * const emailCol = qb.col('email', 'u');
	 * qb.select([emailCol]).from(['usuarios', 'u']);
	 * // SQL: SELECT u.email FROM usuarios u
	 * 
	 * @example
	 * // Múltiples columnas con alias de tabla
	 * qb.select([
	 *   qb.col('nombre', 'u'),
	 *   qb.col('email', 'u'),
	 *   qb.col('fecha_registro', 'u')
	 * ]).from(['usuarios', 'u']);
	 * // SQL: SELECT u.nombre, u.email, u.fecha_registro FROM usuarios u
	 * 
	 * @example
	 * // Con alias de columna usando .as()
	 * qb.select([
	 *   qb.col('nombre', 'u').as('nombre_usuario'),
	 *   qb.col('email', 'u').as('correo')
	 * ]).from(['usuarios', 'u']);
	 * // SQL: SELECT u.nombre AS nombre_usuario, u.email AS correo FROM usuarios u
	 * 
	 * @example
	 * // En cláusula WHERE con predicados
	 * qb.select('*')
	 *   .from(['usuarios', 'u'])
	 *   .where(qb.eq(qb.col('activo', 'u'), 1));
	 * // SQL: SELECT * FROM usuarios u WHERE u.activo = 1
	 * 
	 * @example
	 * // En JOIN con columnas cualificadas
	 * qb.select([qb.col('nombre', 'u'), qb.col('titulo', 'p')])
	 *   .from(['usuarios', 'u'])
	 *   .join(['posts', 'p'])
	 *   .on(qb.eq(qb.col('id', 'u'), qb.col('usuario_id', 'p')));
	 * // SQL: SELECT u.nombre, p.titulo FROM usuarios u 
	 * //      JOIN posts p ON u.id = p.usuario_id
	 * 
	 * @example
	 * // Con casting de tipo
	 * qb.select([qb.col('precio', 'p').cast('DECIMAL(10,2)')])
	 *   .from(['productos', 'p']);
	 * // SQL: SELECT CAST(p.precio AS DECIMAL(10,2)) FROM productos p
	 * 
	 * @example
	 * // Subconsulta como columna derivada
	 * const totalPedidos = qb.col(
	 *   qb.select('COUNT(*)')
	 *     .from('pedidos')
	 *     .where('pedidos.usuario_id = u.id')
	 * );
	 * qb.select(['u.nombre', totalPedidos.as('total_pedidos')])
	 *   .from(['usuarios', 'u']);
	 * // SQL: SELECT u.nombre, 
	 * //      (SELECT COUNT(*) FROM pedidos WHERE pedidos.usuario_id = u.id) AS total_pedidos
	 * //      FROM usuarios u
	 * 
	 * @example
	 * // En ORDER BY
	 * qb.select('*')
	 *   .from(['productos', 'p'])
	 *   .orderBy([qb.col('precio', 'p'), qb.col('nombre', 'p')]);
	 * // SQL: SELECT * FROM productos p ORDER BY p.precio, p.nombre
	 * 
	 * @example
	 * // En GROUP BY con función agregada
	 * qb.select([qb.col('categoria', 'p'), 'COUNT(*) AS total'])
	 *   .from(['productos', 'p'])
	 *   .groupBy([qb.col('categoria', 'p')]);
	 * // SQL: SELECT p.categoria, COUNT(*) AS total FROM productos p GROUP BY p.categoria
	 * 
	 * @example
	 * // En USING para JOINs
	 * qb.select('*')
	 *   .from(['tabla1', 't1'])
	 *   .join(['tabla2', 't2'])
	 *   .using(qb.col('id'));
	 * // SQL: SELECT * FROM tabla1 t1 JOIN tabla2 t2 USING (id)
	 * 
	 * @example
	 * // Comparación entre columnas de diferentes tablas
	 * qb.select('*')
	 *   .from(['empleados', 'e'])
	 *   .where(qb.gt(qb.col('salario', 'e'), qb.col('salario_minimo', 'e')));
	 * // SQL: SELECT * FROM empleados e WHERE e.salario > e.salario_minimo
	 * 
	 * @see {@link Column} - Clase Column con todos los métodos disponibles
	 * @see {@link QueryBuilder#coltn} - Versión alternativa con orden de parámetros invertido
	 * @see {@link QueryBuilder#select} - Seleccionar columnas en consultas
	 * @see {@link QueryBuilder#where} - Usar columnas en condiciones WHERE
	 * @see {@link QueryBuilder#orderBy} - Ordenar por columnas
	 * @see {@link QueryBuilder#groupBy} - Agrupar por columnas
	 * @see {@link types.columnName} - Typedef para nombres de columna
	 */
	col(name, table) {
		// biome-ignore lint/style/noArguments: <explanation>
		const args = [...arguments];
		const error = check(
			"col(name:string|QueryBuilder|Expresion, table:string)",
			args,
		);
		if (error) {
			throw new Error(error);
		}
		const columna = new Column(name, table, this.language.dataType);
		return columna;
	}
	/**
	 * @method coltn
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Crea una instancia de Column especificando primero la tabla y luego el nombre de la columna.
	 * Es una versión alternativa de `col()` con el orden de parámetros invertido, útil cuando
	 * se prefiere pensar en "tabla.columna" de forma más natural o cuando se trabaja con múltiples
	 * columnas de la misma tabla.
	 * 
	 * Funcionalmente equivalente a `col(name, table)`, pero con sintaxis `coltn(table, name)`.
	 * Ambos métodos retornan objetos Column idénticos con los mismos métodos disponibles.
	 * 
	 * @param {tabla|alias} table - Nombre de la tabla o alias de tabla. Se especifica primero
	 * para crear una referencia cualificada como `tabla.columna` o `alias.columna`.
	 * @param {string|QueryBuilder|Expresion} name - Nombre de la columna, subconsulta o expresión:
	 * - String: Nombre simple de columna como `"id"`, `"nombre"`, `"email"`
	 * - QueryBuilder: Subconsulta que retorna un valor para usar como columna derivada
	 * - Expresion: Expresión SQL compleja como función agregada o cálculo
	 * @returns {Column} Instancia de Column con métodos adicionales para manipulación:
	 * - `.as(alias)`: Asignar alias a la columna
	 * - `.cast(type)`: Convertir tipo de dato
	 * - `.from(table)`: Especificar tabla origen
	 * - `.toString()`: Generar SQL de la columna
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example
	 * // Sintaxis tabla-primero (coltn)
	 * const emailCol = qb.coltn('users', 'email'); // users.email
	 * 
	 * @example
	 * // Comparación: coltn vs col
	 * qb.coltn('u', 'nombre');  // tabla primero
	 * qb.col('nombre', 'u');    // columna primero
	 * // Ambos generan: u.nombre
	 * 
	 * @example
	 * // Múltiples columnas de la misma tabla
	 * qb.select([
	 *   qb.coltn('u', 'id'),
	 *   qb.coltn('u', 'nombre'),
	 *   qb.coltn('u', 'email'),
	 *   qb.coltn('u', 'fecha_registro')
	 * ]).from(['usuarios', 'u']);
	 * // SQL: SELECT u.id, u.nombre, u.email, u.fecha_registro FROM usuarios u
	 * 
	 * @example
	 * // Con alias de columna
	 * qb.select([
	 *   qb.coltn('u', 'nombre').as('nombre_usuario'),
	 *   qb.coltn('u', 'email').as('correo_electronico')
	 * ]).from(['usuarios', 'u']);
	 * // SQL: SELECT u.nombre AS nombre_usuario, u.email AS correo_electronico FROM usuarios u
	 * 
	 * @example
	 * // En WHERE con predicados
	 * qb.select('*')
	 *   .from(['productos', 'p'])
	 *   .where(qb.gte(qb.coltn('p', 'precio'), 100));
	 * // SQL: SELECT * FROM productos p WHERE p.precio >= 100
	 * 
	 * @example
	 * // En JOIN comparando columnas
	 * qb.select([qb.coltn('u', 'nombre'), qb.coltn('p', 'titulo')])
	 *   .from(['usuarios', 'u'])
	 *   .join(['posts', 'p'])
	 *   .on(qb.eq(qb.coltn('u', 'id'), qb.coltn('p', 'usuario_id')));
	 * // SQL: SELECT u.nombre, p.titulo FROM usuarios u
	 *        JOIN posts p ON u.id = p.usuario_id
	 * 
	 * @example
	 * // Con casting de tipo
	 * qb.select([qb.coltn('ventas', 'total').cast('DECIMAL(10,2)')])
	 *   .from('ventas');
	 * // SQL: SELECT CAST(ventas.total AS DECIMAL(10,2)) FROM ventas
	 * 
	 * @example
	 * // En ORDER BY con tabla
	 * qb.select('*')
	 *   .from(['empleados', 'e'])
	 *   .orderBy([qb.coltn('e', 'apellido'), qb.coltn('e', 'nombre')]);
	 * // SQL: SELECT * FROM empleados e ORDER BY e.apellido, e.nombre
	 * 
	 * @example
	 * // En GROUP BY
	 * qb.select([qb.coltn('p', 'categoria'), 'COUNT(*) AS total'])
	 *   .from(['productos', 'p'])
	 *   .groupBy([qb.coltn('p', 'categoria')]);
	 * // SQL: SELECT p.categoria, COUNT(*) AS total FROM productos p GROUP BY p.categoria
	 * 
	 * @example
	 * // Subconsulta como columna derivada
	 * const totalPedidos = qb.coltn('u', 
	 *   qb.select('COUNT(*)')
	 *     .from('pedidos')
	 *     .where('pedidos.usuario_id = u.id')
	 * );
	 * qb.select(['u.nombre', totalPedidos.as('total_pedidos')])
	 *   .from(['usuarios', 'u']);
	 * // SQL: SELECT u.nombre,
	 * //      (SELECT COUNT(*) FROM pedidos WHERE pedidos.usuario_id = u.id) AS total_pedidos
	 * //      FROM usuarios u
	 * 
	 * @see {@link Column} - Clase Column con todos los métodos disponibles
	 * @see {@link QueryBuilder#col} - Versión con orden de parámetros (columna, tabla)
	 * @see {@link QueryBuilder#select} - Seleccionar columnas en consultas
	 * @see {@link QueryBuilder#where} - Usar columnas en condiciones WHERE
	 * @see {@link QueryBuilder#orderBy} - Ordenar por columnas
	 * @see {@link QueryBuilder#groupBy} - Agrupar por columnas
	 * @see {@link types.tabla} - Typedef para nombres de tabla
	 * @see {@link types.alias} - Typedef para alias de tabla
	 */
	coltn(table, name) {
		// biome-ignore lint/style/noArguments: <explanation>
		const args = [...arguments];
		const error = check(
			"col(name:string|QueryBuilder|Expresion, table:string)",
			args,
		);
		if (error) {
			throw new Error(error);
		}
		return new Column(name, table, this.language.dataType);
	}
	/**
	 * @method exp
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Crea una instancia de Expresion para usar expresiones SQL complejas en consultas.
	 * Permite incluir funciones agregadas (COUNT, SUM, AVG, MAX, MIN), operaciones aritméticas,
	 * funciones de cadena, funciones de fecha y cualquier expresión SQL válida.
	 * 
	 * Las expresiones creadas con `exp()` pueden usar el método `.as()` para asignar un alias,
	 * lo que es especialmente útil en cláusulas SELECT para nombrar columnas calculadas.
	 * Es la forma recomendada de incluir SQL crudo cuando se necesita funcionalidad que no
	 * tiene un método dedicado en QueryBuilder.
	 * 
	 * @param {string} expresion - Expresión SQL válida. Puede ser:
	 * - Función agregada: `"COUNT(*)"`, `"SUM(precio)"`, `"AVG(edad)"`
	 * - Operación aritmética: `"precio * cantidad"`, `"(total - descuento)"`
	 * - Función de cadena: `"UPPER(nombre)"`, `"CONCAT(nombre, ' ', apellido)"`
	 * - Función de fecha: `"YEAR(fecha_registro)"`, `"DATE(created_at)"`
	 * - Expresión CASE: `"CASE WHEN activo = 1 THEN 'SI' ELSE 'NO' END"`
	 * - Cualquier SQL válido que retorne un valor
	 * @returns {Expresion} Instancia de Expresion con métodos:
	 * - `.as(alias)`: Asignar alias a la expresión
	 * - `.toString()`: Generar SQL de la expresión
	 * - `.value`: Acceder al valor original de la expresión
	 * @example
	 * // Función agregada COUNT
	 * qb.select([qb.exp('COUNT(*)')]).from('usuarios');
	 * // SQL: SELECT COUNT(*) FROM usuarios
	 * 
	 * @example
	 * // Función agregada con alias
	 * qb.select([qb.exp('COUNT(*)').as('total_usuarios')]).from('usuarios');
	 * // SQL: SELECT COUNT(*) AS total_usuarios FROM usuarios
	 * 
	 * @example
	 * // Función SUM con alias
	 * qb.select([qb.exp('SUM(monto)').as('total_ventas')])
	 *   .from('ventas')
	 *   .where(qb.eq('estado', "'completada'"));
	 * // SQL: SELECT SUM(monto) AS total_ventas FROM ventas WHERE estado = 'completada'
	 * 
	 * @example
	 * // Función AVG con alias
	 * qb.select([
	 *   'categoria',
	 *   qb.exp('AVG(precio)').as('precio_promedio')
	 * ])
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, AVG(precio) AS precio_promedio 
	 * //      FROM productos GROUP BY categoria
	 * 
	 * @example
	 * // Operación aritmética
	 * qb.select([
	 *   'producto',
	 *   qb.exp('precio * cantidad').as('subtotal')
	 * ]).from('detalles_pedido');
	 * // SQL: SELECT producto, precio * cantidad AS subtotal FROM detalles_pedido
	 * 
	 * @example
	 * // Función UPPER con concatenación
	 * qb.select([
	 *   qb.exp("UPPER(CONCAT(nombre, ' ', apellido))").as('nombre_completo')
	 * ]).from('empleados');
	 * // SQL: SELECT UPPER(CONCAT(nombre, ' ', apellido)) AS nombre_completo FROM empleados
	 * 
	 * @example
	 * // Función de fecha YEAR
	 * qb.select([
	 *   qb.exp('YEAR(fecha_registro)').as('año'),
	 *   qb.exp('COUNT(*)').as('registros')
	 * ])
	 *   .from('usuarios')
	 *   .groupBy('YEAR(fecha_registro)');
	 * // SQL: SELECT YEAR(fecha_registro) AS año, COUNT(*) AS registros
	 * //      FROM usuarios GROUP BY YEAR(fecha_registro)
	 * 
	 * @example
	 * // Expresión CASE
	 * qb.select([
	 *   'nombre',
	 *   qb.exp("CASE WHEN edad >= 18 THEN 'Mayor' ELSE 'Menor' END").as('tipo')
	 * ]).from('personas');
	 * // SQL: SELECT nombre, CASE WHEN edad >= 18 THEN 'Mayor' ELSE 'Menor' END AS tipo
	 * //      FROM personas
	 * 
	 * @example
	 * // Múltiples funciones agregadas
	 * qb.select([
	 *   'departamento',
	 *   qb.exp('COUNT(*)').as('empleados'),
	 *   qb.exp('AVG(salario)').as('salario_promedio'),
	 *   qb.exp('MAX(salario)').as('salario_maximo'),
	 *   qb.exp('MIN(salario)').as('salario_minimo')
	 * ])
	 *   .from('empleados')
	 *   .groupBy('departamento');
	 * 
	 * @example
	 * // COALESCE con expresión
	 * qb.select([
	 *   'nombre',
	 *   qb.exp("COALESCE(email, 'sin email')").as('contacto')
	 * ]).from('usuarios');
	 * // SQL: SELECT nombre, COALESCE(email, 'sin email') AS contacto FROM usuarios
	 * 
	 * @example
	 * // Cálculo con porcentaje
	 * qb.select([
	 *   'producto',
	 *   'precio',
	 *   qb.exp('precio * 0.8').as('precio_con_descuento')
	 * ]).from('productos');
	 * // SQL: SELECT producto, precio, precio * 0.8 AS precio_con_descuento FROM productos
	 * 
	 * @example
	 * // SUBSTRING con expresión
	 * qb.select([
	 *   qb.exp("SUBSTRING(codigo, 1, 3)").as('prefijo'),
	 *   'nombre'
	 * ]).from('productos');
	 * // SQL: SELECT SUBSTRING(codigo, 1, 3) AS prefijo, nombre FROM productos
	 * 
	 * @example
	 * // DISTINCT COUNT
	 * qb.select([
	 *   qb.exp('COUNT(DISTINCT categoria)').as('total_categorias')
	 * ]).from('productos');
	 * // SQL: SELECT COUNT(DISTINCT categoria) AS total_categorias FROM productos
	 * 
	 * @example
	 * // Expresión compleja con múltiples operaciones
	 * qb.select([
	 *   'nombre',
	 *   qb.exp('ROUND((precio - costo) / precio * 100, 2)').as('margen_porcentaje')
	 * ]).from('productos');
	 * // SQL: SELECT nombre, ROUND((precio - costo) / precio * 100, 2) AS margen_porcentaje
	 * //      FROM productos
	 * 
	 * @see {@link Expresion} - Clase Expresion con todos los métodos disponibles
	 * @see {@link QueryBuilder#select} - Usar expresiones en SELECT
	 * @see {@link QueryBuilder#where} - Usar expresiones en WHERE
	 * @see {@link QueryBuilder#groupBy} - Agrupar por expresiones
	 * @see {@link QueryBuilder#having} - Filtrar grupos con expresiones
	 * @see {@link QueryBuilder#orderBy} - Ordenar por expresiones
	 * @see {@link QueryBuilder#col} - Crear referencias de columnas simples
	 */
	exp(expresion) {
		return new Expresion(expresion);
	}

	/**
	 * @method groupBy
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Agrupa filas que tienen el mismo valor en una o más columnas, permitiendo realizar
	 * cálculos agregados (COUNT, SUM, AVG, MAX, MIN, etc.) sobre cada grupo.
	 * 
	 * GROUP BY es esencial para análisis de datos y reportes, permitiendo resumir información
	 * en categorías o períodos. Debe usarse junto con funciones agregadas en SELECT.
	 * Soporta extensiones avanzadas como ROLLUP y CUBE para subtotales y análisis multidimensional.
	 * 
	 * **Compatibilidad:**
	 * - ✅ PostgreSQL: Soporta GROUP BY con múltiples columnas, ROLLUP, CUBE y GROUPING SETS
	 * - ✅ MySQL: Compatible con GROUP BY (requiere ONLY_FULL_GROUP_BY en versiones modernas)
	 * - ✅ SQL Server: Funciona con agregaciones, ROLLUP, CUBE y GROUPING SETS
	 * - ✅ Oracle: Compatible con GROUP BY, ROLLUP y CUBE
	 * - ✅ SQLite: Soporta GROUP BY básico con algunas limitaciones
	 * - ⚠️ MongoDB: Usa `$group` en pipeline de agregación
	 * 
	 * @param {columnName|Array<columnName>|groupByOptions} columns - Columna(s) por las que agrupar:
	 * - String: Una sola columna como `"categoria"`
	 * - Array: Múltiples columnas como `["categoria", "subcategoria"]`
	 * - Object con rollup: `{ rollup: [col1, col2] }` para subtotales jerárquicos
	 * - Object con cube: `{ cube: [col1, col2] }` para todas las combinaciones de subtotales
	 * @param {groupByOptions} [options] - Opciones adicionales para GROUP BY (reservado para uso futuro)
	 * @returns {QueryBuilder} Instancia de QueryBuilder para continuar el encadenamiento fluido
	 * @example
	 * // GROUP BY con una sola columna
	 * qb.select(['categoria', 'COUNT(*) AS total'])
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos GROUP BY categoria
	 * 
	 * @example
	 * // GROUP BY con múltiples columnas
	 * qb.select(['categoria', 'subcategoria', 'COUNT(*) AS total'])
	 *   .from('productos')
	 *   .groupBy(['categoria', 'subcategoria']);
	 * // SQL: SELECT categoria, subcategoria, COUNT(*) AS total
	 * //      FROM productos GROUP BY categoria, subcategoria
	 * 
	 * @example
	 * // GROUP BY con SUM
	 * qb.select(['cliente_id', 'SUM(monto) AS total_ventas'])
	 *   .from('ventas')
	 *   .groupBy('cliente_id');
	 * // SQL: SELECT cliente_id, SUM(monto) AS total_ventas
	 * //      FROM ventas GROUP BY cliente_id
	 * 
	 * @example
	 * // GROUP BY con AVG
	 * qb.select(['departamento', 'AVG(salario) AS salario_promedio'])
	 *   .from('empleados')
	 *   .groupBy('departamento');
	 * // SQL: SELECT departamento, AVG(salario) AS salario_promedio
	 * //      FROM empleados GROUP BY departamento
	 * 
	 * @example
	 * // GROUP BY con MAX y MIN
	 * qb.select([
	 *   'categoria',
	 *   'MAX(precio) AS precio_max',
	 *   'MIN(precio) AS precio_min'
	 * ])
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, MAX(precio) AS precio_max, MIN(precio) AS precio_min
	 * //      FROM productos GROUP BY categoria
	 * 
	 * @example
	 * // GROUP BY con objeto Column
	 * qb.select([qb.col('categoria', 'p'), 'COUNT(*) AS total'])
	 *   .from(['productos', 'p'])
	 *   .groupBy(qb.col('categoria', 'p'));
	 * // SQL: SELECT p.categoria, COUNT(*) AS total
	 * //      FROM productos p GROUP BY p.categoria
	 * 
	 * @example
	 * // GROUP BY con expresión de fecha
	 * qb.select([
	 *   qb.exp('YEAR(fecha)').as('año'),
	 *   qb.exp('MONTH(fecha)').as('mes'),
	 *   'COUNT(*) AS registros'
	 * ])
	 *   .from('ventas')
	 *   .groupBy(['YEAR(fecha)', 'MONTH(fecha)']);
	 * // SQL: SELECT YEAR(fecha) AS año, MONTH(fecha) AS mes, COUNT(*) AS registros
	 * //      FROM ventas GROUP BY YEAR(fecha), MONTH(fecha)
	 * 
	 * @example
	 * // GROUP BY con HAVING
	 * qb.select(['categoria', 'COUNT(*) AS total'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having(qb.gt('COUNT(*)', 10));
	 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos
	 * //      GROUP BY categoria HAVING COUNT(*) > 10
	 * 
	 * @example
	 * // GROUP BY con ROLLUP para subtotales jerárquicos
	 * qb.select(['año', 'mes', 'SUM(ventas) AS total'])
	 *   .from('ventas_mensuales')
	 *   .groupBy({ rollup: [qb.col('año'), qb.col('mes')] });
	 * // SQL: SELECT año, mes, SUM(ventas) AS total
	 * //      FROM ventas_mensuales GROUP BY ROLLUP (año, mes)
	 * // Genera subtotales por año y total general
	 * 
	 * @example
	 * // GROUP BY con CUBE para todas las combinaciones
	 * qb.select(['region', 'categoria', 'SUM(ventas) AS total'])
	 *   .from('ventas')
	 *   .groupBy({ cube: [qb.col('region'), qb.col('categoria')] });
	 * // SQL: SELECT region, categoria, SUM(ventas) AS total
	 * //      FROM ventas GROUP BY CUBE (region, categoria)
	 * // Genera subtotales por región, categoría, ambos y total general
	 * 
	 * @example
	 * // GROUP BY con ORDER BY
	 * qb.select(['categoria', 'COUNT(*) AS total'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .orderBy('COUNT(*) DESC');
	 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos
	 * //      GROUP BY categoria ORDER BY COUNT(*) DESC
	 * 
	 * @example
	 * // GROUP BY con múltiples agregaciones
	 * qb.select([
	 *   'vendedor_id',
	 *   'COUNT(*) AS num_ventas',
	 *   'SUM(monto) AS total_ventas',
	 *   'AVG(monto) AS venta_promedio',
	 *   'MAX(monto) AS venta_maxima'
	 * ])
	 *   .from('ventas')
	 *   .groupBy('vendedor_id');
	 * 
	 * @see {@link QueryBuilder#select} - Debe usarse antes de GROUP BY
	 * @see {@link QueryBuilder#having} - Filtrar grupos después de GROUP BY
	 * @see {@link QueryBuilder#orderBy} - Ordenar resultados agrupados
	 * @see {@link QueryBuilder#exp} - Crear expresiones para agrupar (ej: funciones de fecha)
	 * @see {@link QueryBuilder#col} - Crear referencias de columnas
	 * @see {@link types.columnName} - Typedef para nombres de columna
	 */
	groupBy(columns, options, next) {
		if (this.lastStatementIn("select", next.q) !== -1) {
			const command = this.language.groupBy(columns, options);
			return this.toNext([command, next]);
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	/**
	 * @method having
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Filtra los resultados agrupados después de aplicar GROUP BY. HAVING es similar a WHERE,
	 * pero opera sobre grupos de filas en lugar de filas individuales. Se usa principalmente
	 * para aplicar condiciones sobre funciones agregadas (COUNT, SUM, AVG, MAX, MIN, etc.).
	 * 
	 * Mientras WHERE filtra filas antes de agrupar, HAVING filtra grupos después de agrupar.
	 * Es esencial para análisis de datos donde necesitas excluir grupos que no cumplen criterios
	 * específicos basados en cálculos agregados.
	 * 
	 * **Compatibilidad entre motores:**
	 * | Motor         | Soporte | Notas |
	 * |---------------|---------|-------|
	 * | PostgreSQL    | ✅ Sí   | Soporta HAVING con expresiones complejas y subconsultas |
	 * | MySQL         | ✅ Sí   | Compatible con funciones agregadas y alias de columna |
	 * | SQL Server    | ✅ Sí   | Funciona con agregaciones y expresiones condicionales |
	 * | Oracle        | ✅ Sí   | Soporta HAVING según estándar SQL |
	 * | SQLite        | ✅ Sí   | Compatible, con algunas limitaciones en expresiones avanzadas |
	 * | MongoDB       | ⚠️ $match | Usa `$group` seguido de `$match` en pipeline de agregación |
	 * 
	 * @param {string|QueryBuilder} predicado - Condición para filtrar grupos. Puede ser:
	 * - String: Expresión SQL con función agregada como `"COUNT(*) > 5"` o `"SUM(precio) >= 1000"`
	 * - QueryBuilder: Resultado de métodos predicado como `qb.gt('COUNT(*)', 10)`
	 * @param {Object} [options] - Opciones adicionales para HAVING (reservado para uso futuro)
	 * @returns {next} Objeto next para continuar el encadenamiento fluido
	 * @throws {Error} Cuando no hay un comando SELECT previo
	 * @example
	 * // HAVING con COUNT simple
	 * qb.select(['categoria', 'COUNT(*) AS total'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having('COUNT(*) > 10');
	 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos
	 * //      GROUP BY categoria HAVING COUNT(*) > 10
	 * 
	 * @example
	 * // HAVING con predicado gt()
	 * qb.select(['departamento', 'COUNT(*) AS empleados'])
	 *   .from('empleados')
	 *   .groupBy('departamento')
	 *   .having(qb.gt('COUNT(*)', 5));
	 * // SQL: SELECT departamento, COUNT(*) AS empleados FROM empleados
	 * //      GROUP BY departamento HAVING COUNT(*) > 5
	 * 
	 * @example
	 * // HAVING con SUM
	 * qb.select(['cliente_id', 'SUM(monto) AS total_ventas'])
	 *   .from('ventas')
	 *   .groupBy('cliente_id')
	 *   .having(qb.gte('SUM(monto)', 10000));
	 * // SQL: SELECT cliente_id, SUM(monto) AS total_ventas FROM ventas
	 * //      GROUP BY cliente_id HAVING SUM(monto) >= 10000
	 * 
	 * @example
	 * // HAVING con AVG
	 * qb.select(['categoria', 'AVG(precio) AS precio_promedio'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having(qb.lt('AVG(precio)', 100));
	 * // SQL: SELECT categoria, AVG(precio) AS precio_promedio FROM productos
	 * //      GROUP BY categoria HAVING AVG(precio) < 100
	 * 
	 * @example
	 * // HAVING con MAX
	 * qb.select(['vendedor_id', 'MAX(comision) AS comision_maxima'])
	 *   .from('ventas')
	 *   .groupBy('vendedor_id')
	 *   .having(qb.gt('MAX(comision)', 5000));
	 * // SQL: SELECT vendedor_id, MAX(comision) AS comision_maxima FROM ventas
	 * //      GROUP BY vendedor_id HAVING MAX(comision) > 5000
	 * 
	 * @example
	 * // HAVING con MIN
	 * qb.select(['categoria', 'MIN(stock) AS stock_minimo'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having(qb.lte('MIN(stock)', 10));
	 * // SQL: SELECT categoria, MIN(stock) AS stock_minimo FROM productos
	 * //      GROUP BY categoria HAVING MIN(stock) <= 10
	 * 
	 * @example
	 * // HAVING con múltiples condiciones usando AND
	 * qb.select(['ciudad', 'COUNT(*) AS total', 'AVG(edad) AS edad_promedio'])
	 *   .from('usuarios')
	 *   .groupBy('ciudad')
	 *   .having(qb.and(
	 *     qb.gt('COUNT(*)', 100),
	 *     qb.gte('AVG(edad)', 25)
	 *   ));
	 * // SQL: SELECT ciudad, COUNT(*) AS total, AVG(edad) AS edad_promedio FROM usuarios
	 * //      GROUP BY ciudad HAVING COUNT(*) > 100 AND AVG(edad) >= 25
	 * 
	 * @example
	 * // HAVING con OR
	 * qb.select(['region', 'SUM(ventas) AS total'])
	 *   .from('ventas_regionales')
	 *   .groupBy('region')
	 *   .having(qb.or(
	 *     qb.gt('SUM(ventas)', 100000),
	 *     qb.gt('COUNT(*)', 50)
	 *   ));
	 * // SQL: SELECT region, SUM(ventas) AS total FROM ventas_regionales
	 * //      GROUP BY region HAVING SUM(ventas) > 100000 OR COUNT(*) > 50
	 * 
	 * @example
	 * // HAVING con BETWEEN
	 * qb.select(['año', 'AVG(temperatura) AS temp_promedio'])
	 *   .from('mediciones')
	 *   .groupBy('año')
	 *   .having(qb.between('AVG(temperatura)', 15, 25));
	 * // SQL: SELECT año, AVG(temperatura) AS temp_promedio FROM mediciones
	 * //      GROUP BY año HAVING AVG(temperatura) BETWEEN 15 AND 25
	 * 
	 * @example
	 * // HAVING con COUNT DISTINCT
	 * qb.select(['categoria', 'COUNT(DISTINCT marca) AS marcas_unicas'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having('COUNT(DISTINCT marca) >= 3');
	 * // SQL: SELECT categoria, COUNT(DISTINCT marca) AS marcas_unicas FROM productos
	 * //      GROUP BY categoria HAVING COUNT(DISTINCT marca) >= 3
	 * 
	 * @example
	 * // HAVING con expresión calculada
	 * qb.select(['vendedor', 'SUM(ventas) AS total', 'COUNT(*) AS operaciones'])
	 *   .from('ventas')
	 *   .groupBy('vendedor')
	 *   .having('SUM(ventas) / COUNT(*) > 1000');
	 * // SQL: SELECT vendedor, SUM(ventas) AS total, COUNT(*) AS operaciones FROM ventas
	 * //      GROUP BY vendedor HAVING SUM(ventas) / COUNT(*) > 1000
	 * 
	 * @example
	 * // HAVING con STRING_AGG o GROUP_CONCAT
	 * qb.select(['categoria', 'COUNT(*) AS productos'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having(qb.gt('COUNT(*)', 5))
	 *   .orderBy('COUNT(*) DESC');
	 * // SQL: SELECT categoria, COUNT(*) AS productos FROM productos
	 * //      GROUP BY categoria HAVING COUNT(*) > 5 ORDER BY COUNT(*) DESC
	 * 
	 * @see {@link QueryBuilder#groupBy} - Debe usarse antes de HAVING
	 * @see {@link QueryBuilder#where} - Filtrar antes de agrupar
	 * @see {@link QueryBuilder#select} - Debe incluir funciones agregadas
	 * @see {@link QueryBuilder#orderBy} - Ordenar grupos filtrados
	 * @see {@link QueryBuilder#gt} - Mayor que para predicados
	 * @see {@link QueryBuilder#gte} - Mayor o igual para predicados
	 * @see {@link QueryBuilder#lt} - Menor que para predicados
	 * @see {@link QueryBuilder#lte} - Menor o igual para predicados
	 * @see {@link QueryBuilder#between} - Rango de valores en predicados
	 * @see {@link QueryBuilder#and} - Combinar múltiples condiciones
	 * @see {@link QueryBuilder#or} - Condiciones alternativas
	 */
	having(predicado, options, next) {
		if (this.lastStatementIn("select", next.q) !== -1) {
			const command = this.language.having(predicado, options);
			return this.toNext([command, next]);
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	/**
	 * @method orderBy
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Ordena los resultados de una consulta según una o más columnas en orden ascendente (ASC)
	 * o descendente (DESC). ORDER BY se aplica después de WHERE, GROUP BY y HAVING, determinando
	 * el orden final de las filas en el resultado.
	 * 
	 * Es esencial para presentar datos de forma organizada, permitiendo ordenamientos simples
	 * por una columna, complejos por múltiples columnas con diferentes direcciones, o por
	 * expresiones calculadas y funciones agregadas.
	 * 
	 * **Compatibilidad entre motores:**
	 * | Motor         | ASC/DESC | NULLS FIRST/LAST | Expresiones | Índice posicional |
	 * |---------------|----------|------------------|-------------|-------------------|
	 * | PostgreSQL    | ✅ Sí    | ✅ Sí            | ✅ Sí       | ✅ Sí (1, 2, 3)   |
	 * | MySQL         | ✅ Sí    | ❌ No            | ✅ Sí       | ✅ Sí             |
	 * | SQL Server    | ✅ Sí    | ⚠️ Workaround    | ✅ Sí       | ✅ Sí             |
	 * | Oracle        | ✅ Sí    | ✅ Sí            | ✅ Sí       | ✅ Sí             |
	 * | SQLite        | ✅ Sí    | ❌ No            | ✅ Sí       | ✅ Sí             |
	 * | MongoDB       | ⚠️ sort()| ⚠️ N/A           | ⚠️ $sort    | ⚠️ N/A            |
	 * 
	 * @param {orderBySpec|Array<orderBySpec>} columns - Especificación de ordenamiento:
	 * - String: Columna con dirección opcional como `"nombre"` (ASC) o `"precio DESC"`
	 * - Object: `{col: "columna", order: "ASC|DESC"}` para control detallado
	 * - Column: Objeto Column creado con `qb.col()`
	 * - Array: Múltiples especificaciones para ordenamiento multinivel
	 * @returns {next} Objeto next para continuar el encadenamiento fluido
	 * @throws {Error} Cuando no hay un comando SELECT previo
	 * @example
	 * // Ordenamiento simple ascendente
	 * qb.select('*').from('usuarios').orderBy('nombre');
	 * // SQL: SELECT * FROM usuarios ORDER BY nombre ASC
	 * 
	 * @example
	 * // Ordenamiento descendente
	 * qb.select('*').from('productos').orderBy('precio DESC');
	 * // SQL: SELECT * FROM productos ORDER BY precio DESC
	 * 
	 * @example
	 * // Múltiples columnas con array de strings
	 * qb.select('*').from('empleados')
	 *   .orderBy(['departamento ASC', 'salario DESC']);
	 * // SQL: SELECT * FROM empleados ORDER BY departamento ASC, salario DESC
	 * 
	 * @example
	 * // Objeto con col y order
	 * qb.select('*').from('ventas')
	 *   .orderBy({ col: 'fecha', order: 'DESC' });
	 * // SQL: SELECT * FROM ventas ORDER BY fecha DESC
	 * 
	 * @example
	 * // Array de objetos para control detallado
	 * qb.select('*').from('productos')
	 *   .orderBy([
	 *     { col: 'categoria', order: 'ASC' },
	 *     { col: 'precio', order: 'DESC' },
	 *     { col: 'nombre', order: 'ASC' }
	 *   ]);
	 * // SQL: SELECT * FROM productos 
	 * //      ORDER BY categoria ASC, precio DESC, nombre ASC
	 * 
	 * @example
	 * // Con objeto Column
	 * qb.select('*').from(['usuarios', 'u'])
	 *   .orderBy(qb.col('fecha_registro', 'u'));
	 * // SQL: SELECT * FROM usuarios u ORDER BY u.fecha_registro
	 * 
	 * @example
	 * // Ordenar por alias de columna calculada
	 * qb.select(['nombre', 'precio * cantidad AS total'])
	 *   .from('ventas')
	 *   .orderBy('total DESC');
	 * // SQL: SELECT nombre, precio * cantidad AS total FROM ventas
	 * //      ORDER BY total DESC
	 * 
	 * @example
	 * // Ordenar por función agregada
	 * qb.select(['categoria', 'COUNT(*) AS total'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .orderBy('COUNT(*) DESC');
	 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos
	 * //      GROUP BY categoria ORDER BY COUNT(*) DESC
	 * 
	 * @example
	 * // Ordenar por expresión UPPER
	 * qb.select('*').from('usuarios')
	 *   .orderBy('UPPER(nombre) ASC');
	 * // SQL: SELECT * FROM usuarios ORDER BY UPPER(nombre) ASC
	 * 
	 * @example
	 * // Ordenar por índice posicional
	 * qb.select(['nombre', 'edad', 'ciudad'])
	 *   .from('usuarios')
	 *   .orderBy('2 DESC');  // Ordenar por segunda columna (edad)
	 * // SQL: SELECT nombre, edad, ciudad FROM usuarios ORDER BY 2 DESC
	 * 
	 * @example
	 * // Con HAVING antes de ORDER BY
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
	 * // NULLS LAST en PostgreSQL/Oracle
	 * qb.select('*').from('clientes')
	 *   .orderBy('email ASC NULLS LAST');
	 * // SQL: SELECT * FROM clientes ORDER BY email ASC NULLS LAST
	 * 
	 * @example
	 * // Ordenar en JOIN con columnas cualificadas
	 * qb.select(['u.nombre', 'p.titulo', 'p.fecha'])
	 *   .from(['usuarios', 'u'])
	 *   .join(['posts', 'p'], 'u.id = p.usuario_id')
	 *   .orderBy([
	 *     { col: 'u.nombre', order: 'ASC' },
	 *     { col: 'p.fecha', order: 'DESC' }
	 *   ]);
	 * // SQL: SELECT u.nombre, p.titulo, p.fecha FROM usuarios u
	 * //      JOIN posts p ON u.id = p.usuario_id
	 * //      ORDER BY u.nombre ASC, p.fecha DESC
	 * 
	 * @example
	 * // Ordenar por CASE para prioridad personalizada
	 * qb.select('*').from('tareas')
	 *   .orderBy("CASE prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END");
	 * // SQL: SELECT * FROM tareas 
	 * //      ORDER BY CASE prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END
	 * 
	 * @see {@link types.orderBySpec} - Especificación completa de ordenamiento
	 * @see {@link QueryBuilder#select} - Debe usarse antes de ORDER BY
	 * @see {@link QueryBuilder#groupBy} - Agrupar antes de ordenar
	 * @see {@link QueryBuilder#having} - Filtrar grupos antes de ordenar
	 * @see {@link QueryBuilder#limit} - Limitar resultados ordenados
	 * @see {@link QueryBuilder#offset} - Saltar filas en resultados ordenados
	 * @see {@link QueryBuilder#col} - Crear objetos Column para ordenar
	 */
	orderBy(columns, next) {
		if (this.lastStatementIn("select", next.q) !== -1) {
			const command = this.language.orderBy(columns);
			return this.toNext([command, next]);
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	/**
	 * @method limit
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Limita el número de filas devueltas por una consulta SELECT. Es fundamental para
	 * paginación, optimización de rendimiento y obtener muestras de datos. LIMIT restringe
	 * el conjunto de resultados a un número específico de filas, procesando solo lo necesario.
	 * 
	 * Se usa típicamente con ORDER BY para resultados determinísticos y con OFFSET para
	 * implementar paginación completa. El orden de ejecución SQL es: WHERE → GROUP BY →
	 * HAVING → ORDER BY → LIMIT → OFFSET.
	 * 
	 * **Compatibilidad entre motores:**
	 * | Motor         | Sintaxis LIMIT | OFFSET | Alternativa |
	 * |---------------|----------------|--------|-------------|
	 * | PostgreSQL    | ✅ LIMIT n     | ✅ Sí  | FETCH FIRST n ROWS ONLY |
	 * | MySQL         | ✅ LIMIT n     | ✅ Sí  | - |
	 * | SQL Server    | ❌ No          | ✅ Sí  | TOP n, OFFSET...FETCH NEXT |
	 * | Oracle        | ❌ No          | ✅ Sí  | FETCH FIRST n ROWS ONLY |
	 * | SQLite        | ✅ LIMIT n     | ✅ Sí  | - |
	 * | MongoDB       | ⚠️ .limit(n)   | ⚠️ .skip(n) | Pipeline $limit |
	 * 
	 * @param {number} limit - Número entero positivo de filas a devolver. Debe ser mayor que 0.
	 * @returns {next} Objeto next para continuar el encadenamiento fluido
	 * @throws {Error} Cuando limit no es un entero, es negativo/cero, o falta SELECT previo
	 * @example
	 * // Limitar a 10 resultados
	 * qb.select('*').from('usuarios').limit(10);
	 * // SQL: SELECT * FROM usuarios LIMIT 10
	 * 
	 * @example
	 * // Top 5 productos más caros
	 * qb.select('*').from('productos')
	 *   .orderBy('precio DESC')
	 *   .limit(5);
	 * // SQL: SELECT * FROM productos ORDER BY precio DESC LIMIT 5
	 * 
	 * @example
	 * // Paginación: Primera página (10 items)
	 * qb.select('*').from('articulos')
	 *   .orderBy('fecha_publicacion DESC')
	 *   .limit(10);
	 * // SQL: SELECT * FROM articulos ORDER BY fecha_publicacion DESC LIMIT 10
	 * 
	 * @example
	 * // Con WHERE antes de LIMIT
	 * qb.select('*').from('pedidos')
	 *   .where(qb.eq('estado', "'completado'"))
	 *   .orderBy('fecha DESC')
	 *   .limit(20);
	 * // SQL: SELECT * FROM pedidos WHERE estado = 'completado'
	 * //      ORDER BY fecha DESC LIMIT 20
	 * 
	 * @example
	 * // Con JOIN y LIMIT
	 * qb.select(['u.nombre', 'p.titulo'])
	 *   .from(['usuarios', 'u'])
	 *   .join(['posts', 'p'], 'u.id = p.usuario_id')
	 *   .orderBy('p.fecha DESC')
	 *   .limit(15);
	 * // SQL: SELECT u.nombre, p.titulo FROM usuarios u
	 * //      JOIN posts p ON u.id = p.usuario_id
	 * //      ORDER BY p.fecha DESC LIMIT 15
	 * 
	 * @example
	 * // Con GROUP BY y HAVING
	 * qb.select(['categoria', 'COUNT(*) AS total'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having(qb.gt('COUNT(*)', 10))
	 *   .orderBy('COUNT(*) DESC')
	 *   .limit(5);
	 * // SQL: SELECT categoria, COUNT(*) AS total FROM productos
	 * //      GROUP BY categoria HAVING COUNT(*) > 10
	 * //      ORDER BY COUNT(*) DESC LIMIT 5
	 * 
	 * @example
	 * // Muestra aleatoria de datos
	 * qb.select('*').from('preguntas')
	 *   .orderBy('RANDOM()')  // PostgreSQL/SQLite
	 *   .limit(10);
	 * // SQL: SELECT * FROM preguntas ORDER BY RANDOM() LIMIT 10
	 * 
	 * @example
	 * // Validación de datos - muestra pequeña
	 * qb.select('*').from('importacion_datos')
	 *   .limit(100);
	 * // SQL: SELECT * FROM importacion_datos LIMIT 100
	 * 
	 * @example
	 * // Top ventas del mes
	 * qb.select(['producto', 'SUM(cantidad) AS total_vendido'])
	 *   .from('ventas')
	 *   .where(qb.gte('fecha', "'2024-01-01'"))
	 *   .groupBy('producto')
	 *   .orderBy('SUM(cantidad) DESC')
	 *   .limit(10);
	 * // SQL: SELECT producto, SUM(cantidad) AS total_vendido FROM ventas
	 * //      WHERE fecha >= '2024-01-01' GROUP BY producto
	 * //      ORDER BY SUM(cantidad) DESC LIMIT 10
	 * 
	 * @example
	 * // Últimas notificaciones
	 * qb.select(['titulo', 'mensaje', 'created_at'])
	 *   .from('notificaciones')
	 *   .where(qb.eq('leido', 0))
	 *   .orderBy('created_at DESC')
	 *   .limit(25);
	 * // SQL: SELECT titulo, mensaje, created_at FROM notificaciones
	 * //      WHERE leido = 0 ORDER BY created_at DESC LIMIT 25
	 * 
	 * @see {@link QueryBuilder#offset} - Saltar filas para paginación
	 * @see {@link QueryBuilder#orderBy} - Ordenar antes de limitar
	 * @see {@link QueryBuilder#select} - Debe usarse antes de LIMIT
	 * @see {@link QueryBuilder#where} - Filtrar antes de limitar
	 * @see {@link QueryBuilder#groupBy} - Agrupar antes de limitar
	 * @see {@link QueryBuilder#having} - Filtrar grupos antes de limitar
	 */
	limit(limit, next) {
		try {
			switch (false) {
				case Number.isInteger(limit):
					throw new Error("valor de no valido", {
						cause: "limit debe ser entero",
					});
				case limit > 0:
					throw new Error("valor de no valido", {
						cause: "limit debe ser positivo",
					});
				case this.lastStatementIn("select", next.q):
					throw new Error("limit necesita un SELECT", {
						cause: "falta un SELECT",
					});
			}

			const command = this.language.limit(limit);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method offset
	 * @category DQL
	 * @memberof QueryBuilder
	 * @description
	 * Omite un número específico de filas antes de comenzar a devolver resultados. Es esencial
	 * para implementar paginación eficiente en combinación con LIMIT. OFFSET salta las primeras
	 * N filas del resultado y devuelve las siguientes.
	 * 
	 * El uso típico es para paginación: página 1 usa OFFSET 0, página 2 usa OFFSET 10 (si
	 * LIMIT es 10), página 3 usa OFFSET 20, etc. La fórmula general es: OFFSET = (página - 1) * tamaño_página.
	 * 
	 * **Nota de rendimiento:** OFFSET debe procesar y descartar todas las filas saltadas,
	 * lo que puede ser lento con valores grandes. Para grandes conjuntos de datos, considere
	 * paginación basada en cursor (WHERE id > último_id).
	 * 
	 * **Compatibilidad entre motores:**
	 * | Motor         | Sintaxis OFFSET | Con LIMIT | Alternativa |
	 * |---------------|-----------------|-----------|-------------|
	 * | PostgreSQL    | ✅ OFFSET n     | ✅ Sí     | - |
	 * | MySQL         | ✅ OFFSET n     | ✅ Sí     | LIMIT offset, count |
	 * | SQL Server    | ✅ OFFSET n ROWS| ✅ FETCH NEXT | Requiere ORDER BY |
	 * | Oracle        | ✅ OFFSET n ROWS| ✅ FETCH NEXT | Requiere ORDER BY |
	 * | SQLite        | ✅ OFFSET n     | ✅ Sí     | - |
	 * | MongoDB       | ⚠️ .skip(n)     | ⚠️ .limit() | Pipeline $skip |
	 * 
	 * @param {number} offset - Número entero no negativo de filas a omitir. Debe ser >= 0.
	 * @returns {next} Objeto next para continuar el encadenamiento fluido
	 * @throws {Error} Cuando offset no es un entero, es negativo, o falta SELECT previo
	 * @example
	 * // Saltar las primeras 20 filas
	 * qb.select('*').from('usuarios').offset(20);
	 * // SQL: SELECT * FROM usuarios OFFSET 20
	 * 
	 * @example
	 * // Paginación completa: Página 1 (items 1-10)
	 * qb.select('*').from('productos')
	 *   .orderBy('nombre ASC')
	 *   .limit(10)
	 *   .offset(0);
	 * // SQL: SELECT * FROM productos ORDER BY nombre ASC LIMIT 10 OFFSET 0
	 * 
	 * @example
	 * // Paginación: Página 2 (items 11-20)
	 * qb.select('*').from('productos')
	 *   .orderBy('nombre ASC')
	 *   .limit(10)
	 *   .offset(10);
	 * // SQL: SELECT * FROM productos ORDER BY nombre ASC LIMIT 10 OFFSET 10
	 * 
	 * @example
	 * // Paginación: Página 3 (items 21-30)
	 * qb.select('*').from('productos')
	 *   .orderBy('nombre ASC')
	 *   .limit(10)
	 *   .offset(20);
	 * // SQL: SELECT * FROM productos ORDER BY nombre ASC LIMIT 10 OFFSET 20
	 * 
	 * @example
	 * // Función de paginación reutilizable
	 * function obtenerPagina(pagina, porPagina) {
	 *   return qb.select('*').from('articulos')
	 *     .orderBy('fecha_publicacion DESC')
	 *     .limit(porPagina)
	 *     .offset((pagina - 1) * porPagina);
	 * }
	 * // Página 1: offset = 0, Página 2: offset = 10, Página 3: offset = 20
	 * 
	 * @example
	 * // Con filtros WHERE
	 * qb.select('*').from('pedidos')
	 *   .where(qb.eq('estado', "'enviado'"))
	 *   .orderBy('fecha DESC')
	 *   .limit(15)
	 *   .offset(30);
	 * // SQL: SELECT * FROM pedidos WHERE estado = 'enviado'
	 * //      ORDER BY fecha DESC LIMIT 15 OFFSET 30
	 * 
	 * @example
	 * // Con JOIN y paginación
	 * qb.select(['u.nombre', 'u.email', 'COUNT(p.id) AS num_posts'])
	 *   .from(['usuarios', 'u'])
	 *   .leftJoin(['posts', 'p'], 'u.id = p.usuario_id')
	 *   .groupBy(['u.nombre', 'u.email'])
	 *   .orderBy('COUNT(p.id) DESC')
	 *   .limit(20)
	 *   .offset(40);
	 * // SQL: SELECT u.nombre, u.email, COUNT(p.id) AS num_posts
	 * //      FROM usuarios u LEFT JOIN posts p ON u.id = p.usuario_id
	 * //      GROUP BY u.nombre, u.email ORDER BY COUNT(p.id) DESC
	 * //      LIMIT 20 OFFSET 40
	 * 
	 * @example
	 * // Saltar resultados sin LIMIT (obtener todo después de N filas)
	 * qb.select('*').from('logs')
	 *   .orderBy('timestamp DESC')
	 *   .offset(100);
	 * // SQL: SELECT * FROM logs ORDER BY timestamp DESC OFFSET 100
	 * 
	 * @example
	 * // Paginación con búsqueda
	 * qb.select('*').from('usuarios')
	 *   .where(qb.like('nombre', "'%garcia%'"))
	 *   .orderBy('nombre ASC')
	 *   .limit(25)
	 *   .offset(50);
	 * // SQL: SELECT * FROM usuarios WHERE nombre LIKE '%garcia%'
	 * //      ORDER BY nombre ASC LIMIT 25 OFFSET 50
	 * 
	 * @example
	 * // Con agregaciones y paginación
	 * qb.select(['categoria', 'COUNT(*) AS total', 'AVG(precio) AS promedio'])
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .having(qb.gt('COUNT(*)', 5))
	 *   .orderBy('COUNT(*) DESC')
	 *   .limit(10)
	 *   .offset(10);
	 * // SQL: SELECT categoria, COUNT(*) AS total, AVG(precio) AS promedio
	 * //      FROM productos GROUP BY categoria HAVING COUNT(*) > 5
	 * //      ORDER BY COUNT(*) DESC LIMIT 10 OFFSET 10
	 * 
	 * @see {@link QueryBuilder#limit} - Limitar número de resultados
	 * @see {@link QueryBuilder#orderBy} - Debe ordenar para resultados consistentes
	 * @see {@link QueryBuilder#select} - Debe usarse antes de OFFSET
	 * @see {@link QueryBuilder#where} - Filtrar antes de paginar
	 * @see {@link QueryBuilder#groupBy} - Agrupar antes de paginar
	 * @see {@link QueryBuilder#having} - Filtrar grupos antes de paginar
	 */
	offset(offset, next) {
		try {
			switch (false) {
				case Number.isInteger(offset):
					throw new Error("valor de no valido", {
						cause: "offset debe ser entero",
					});
				case offset > 0:
					throw new Error("valor de no valido", {
						cause: "offset debe ser positivo",
					});
				case this.lastStatementIn("select", next.q):
					throw new Error("offset necesita un SELECT", {
						cause: "falta un SELECT",
					});
			}
			const command = this.language.offset(offset);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error;
			return this.toNext([null, next]);
		}
	}

	/*******************************************************************************
	 * DML
	 * Manipulan los datos almacenados en las tablas.
	 ******************************************************************************/

	/**
	 * @method insert
	 * @category DML
	 * @memberof QueryBuilder
	 * @description
	 * Inserta una o más filas de datos en una tabla especificada. Genera una instrucción
	 * INSERT INTO que puede incluir especificación explícita de columnas o usar el orden
	 * por defecto de la tabla. Soporta inserción de valores literales y desde subconsultas.
	 * 
	 * Es el método fundamental para agregar nuevos registros a una tabla. Permite inserción
	 * simple de una fila, inserción masiva de múltiples filas, e inserción desde resultados
	 * de otra consulta (INSERT INTO ... SELECT).
	 * 
	 * **Compatibilidad entre motores:**
	 * | Motor         | INSERT básico | RETURNING | ON CONFLICT | Batch insert |
	 * |---------------|---------------|-----------|-------------|--------------|
	 * | PostgreSQL    | ✅ Sí         | ✅ RETURNING | ✅ ON CONFLICT | ✅ Sí      |
	 * | MySQL         | ✅ Sí         | ❌ No     | ✅ ON DUPLICATE KEY | ✅ Sí   |
	 * | SQL Server    | ✅ Sí         | ✅ OUTPUT | ⚠️ MERGE    | ✅ Sí         |
	 * | Oracle        | ✅ Sí         | ✅ RETURNING INTO | ⚠️ MERGE | ✅ Sí      |
	 * | SQLite        | ✅ Sí         | ✅ RETURNING | ✅ OR REPLACE | ✅ Sí      |
	 * | MongoDB       | ⚠️ insertOne()| ⚠️ N/A    | ⚠️ upsert   | ⚠️ insertMany() |
	 * 
	 * @param {tabla} table - Nombre de la tabla donde insertar los datos
	 * @param {Array<Array<*>>|Array<*>} values - Valores a insertar:
	 * - Array de arrays: Múltiples filas como `[[val1, val2], [val3, val4]]`
	 * - Array simple: Una sola fila como `[val1, val2, val3]`
	 * - Cada valor puede ser: string, number, boolean, null, o QueryBuilder (subconsulta)
	 * @param {Array<columnName>} [cols] - Array con nombres de columnas en orden correspondiente
	 * a los valores. Si se omite, se usa el orden por defecto de la tabla.
	 * @returns {next} Objeto next para continuar el encadenamiento fluido
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados o falta la tabla
	 * @example
	 * // Inserción simple de una fila sin especificar columnas
	 * qb.insert('usuarios', ['Juan', 'juan@example.com', 25]);
	 * // SQL: INSERT INTO usuarios VALUES ('Juan', 'juan@example.com', 25)
	 * 
	 * @example
	 * // Inserción con columnas especificadas
	 * qb.insert('usuarios', ['María', 'maria@example.com'], ['nombre', 'email']);
	 * // SQL: INSERT INTO usuarios (nombre, email) VALUES ('María', 'maria@example.com')
	 * 
	 * @example
	 * // Inserción múltiple (batch insert)
	 * qb.insert('productos', [
	 *   ['Laptop', 999.99, 10],
	 *   ['Mouse', 29.99, 50],
	 *   ['Teclado', 79.99, 30]
	 * ], ['nombre', 'precio', 'stock']);
	 * // SQL: INSERT INTO productos (nombre, precio, stock)
	 * //      VALUES ('Laptop', 999.99, 10),
	 * //             ('Mouse', 29.99, 50),
	 * //             ('Teclado', 79.99, 30)
	 * 
	 * @example
	 * // Inserción con valores NULL
	 * qb.insert('clientes', ['Pedro', null, 'pedro@example.com'], 
	 *   ['nombre', 'telefono', 'email']);
	 * // SQL: INSERT INTO clientes (nombre, telefono, email)
	 * //      VALUES ('Pedro', NULL, 'pedro@example.com')
	 * 
	 * @example
	 * // Inserción con números y booleanos
	 * qb.insert('configuracion', ['tema_oscuro', true, 1], 
	 *   ['clave', 'valor_bool', 'usuario_id']);
	 * // SQL: INSERT INTO configuracion (clave, valor_bool, usuario_id)
	 * //      VALUES ('tema_oscuro', true, 1)
	 * 
	 * @example
	 * // Inserción desde subconsulta
	 * const subconsulta = qb.select(['nombre', 'email'])
	 *   .from('usuarios_temporales')
	 *   .where(qb.eq('validado', 1));
	 * qb.insert('usuarios', subconsulta, ['nombre', 'email']);
	 * // SQL: INSERT INTO usuarios (nombre, email)
	 * //      SELECT nombre, email FROM usuarios_temporales WHERE validado = 1
	 * 
	 * @example
	 * // Inserción con fecha actual (string SQL)
	 * qb.insert('logs', ['usuario_login', 'NOW()'], ['evento', 'fecha']);
	 * // SQL: INSERT INTO logs (evento, fecha) VALUES ('usuario_login', NOW())
	 * 
	 * @example
	 * // Inserción masiva de registros generados
	 * const nuevosProductos = [
	 *   ['Producto A', 10.99, 'Categoría 1'],
	 *   ['Producto B', 15.99, 'Categoría 2'],
	 *   ['Producto C', 20.99, 'Categoría 1']
	 * ];
	 * qb.insert('productos', nuevosProductos, ['nombre', 'precio', 'categoria']);
	 * 
	 * @example
	 * // Inserción con todos los tipos de datos
	 * qb.insert('registros', [
	 *   'texto', 123, 45.67, true, null, 'CURRENT_TIMESTAMP'
	 * ], ['campo_texto', 'entero', 'decimal', 'booleano', 'nullable', 'timestamp']);
	 * 
	 * @example
	 * // Inserción para auditoría
	 * qb.insert('auditoria', [
	 *   'UPDATE', 'usuarios', 5, 'admin', 'NOW()'
	 * ], ['operacion', 'tabla', 'registro_id', 'usuario', 'fecha']);
	 * // SQL: INSERT INTO auditoria (operacion, tabla, registro_id, usuario, fecha)
	 * //      VALUES ('UPDATE', 'usuarios', 5, 'admin', NOW())
	 * 
	 * @see {@link QueryBuilder#select} - Para usar con INSERT INTO ... SELECT
	 * @see {@link QueryBuilder#update} - Actualizar datos existentes
	 * @see {@link QueryBuilder#delete} - Eliminar datos
	 * @see {@link types.tabla} - Tipo de nombre de tabla
	 * @see {@link types.columnName} - Tipo de nombre de columna
	 */
	insert(table, values, cols, next) {
		try {
			// biome-ignore lint/style/noArguments: <explanation>
			const args = [...arguments];
			const error = check(
				"insert(table:string, values:array|QueryBuilder, cols:array)",
				args,
			);
			if (error) {
				throw new Error(error, { cause: "check" });
			}
			next.isQB = values instanceof QueryBuilder;
			const command = this.language.insert(table, cols, values, next);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error;
			return this.toNext([null, next]);
		}
	}

	/**
	 * @method update
	 * @category DML
	 * @memberof QueryBuilder
	 * @description
	 * Actualiza datos existentes en una tabla mediante una cláusula SET. Modifica valores
	 * de columnas específicas para filas que cumplan condiciones opcionales (usando WHERE).
	 * Es fundamental para mantener datos actualizados sin necesidad de eliminar y reinsertar.
	 * 
	 * UPDATE modifica filas existentes estableciendo nuevos valores para columnas especificadas.
	 * Debe usarse con WHERE para evitar actualizar todas las filas de la tabla. Sin WHERE,
	 * UPDATE afecta todas las filas, lo que puede ser peligroso en producción.
	 * 
	 * **Advertencia:** UPDATE sin WHERE actualiza TODAS las filas de la tabla. Siempre
	 * verifique su condición WHERE antes de ejecutar en producción.
	 * 
	 * **Compatibilidad entre motores:**
	 * | Motor         | UPDATE básico | FROM/JOIN | RETURNING | LIMIT |
	 * |---------------|---------------|-----------|-----------|-------|
	 * | PostgreSQL    | ✅ Sí         | ✅ FROM   | ✅ RETURNING | ❌ No |
	 * | MySQL         | ✅ Sí         | ✅ JOIN   | ❌ No     | ✅ LIMIT |
	 * | SQL Server    | ✅ Sí         | ✅ FROM   | ✅ OUTPUT | ✅ TOP |
	 * | Oracle        | ✅ Sí         | ⚠️ Subconsulta | ✅ RETURNING | ❌ No |
	 * | SQLite        | ✅ Sí         | ⚠️ Limitado | ✅ RETURNING | ❌ No |
	 * | MongoDB       | ⚠️ updateOne()| ⚠️ N/A    | ⚠️ findAndModify | ⚠️ N/A |
	 * 
	 * @param {tabla} table - Nombre de la tabla donde actualizar los datos
	 * @param {Object} sets - Objeto con pares clave-valor donde la clave es el nombre de
	 * la columna y el valor es el nuevo dato. Formato: `{columna1: valor1, columna2: valor2}`
	 * @returns {next} Objeto next para continuar el encadenamiento fluido (típicamente con WHERE)
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example
	 * // Actualización simple con WHERE
	 * qb.update('usuarios', { activo: true, ultimo_login: 'NOW()' })
	 *   .where(qb.eq('id', 5));
	 * // SQL: UPDATE usuarios SET activo = true, ultimo_login = NOW() WHERE id = 5
	 * 
	 * @example
	 * // Actualizar múltiples columnas
	 * qb.update('productos', { 
	 *   precio: 99.99, 
	 *   stock: 50, 
	 *   actualizado_at: 'CURRENT_TIMESTAMP' 
	 * }).where(qb.eq('id', 10));
	 * // SQL: UPDATE productos 
	 * //      SET precio = 99.99, stock = 50, actualizado_at = CURRENT_TIMESTAMP
	 * //      WHERE id = 10
	 * 
	 * @example
	 * // Actualizar con condición múltiple
	 * qb.update('pedidos', { estado: 'enviado', fecha_envio: '2024-10-20' })
	 *   .where(qb.and(
	 *     qb.eq('estado', "'pendiente'"),
	 *     qb.lt('fecha_pedido', "'2024-10-01'")
	 *   ));
	 * // SQL: UPDATE pedidos SET estado = 'enviado', fecha_envio = '2024-10-20'
	 * //      WHERE estado = 'pendiente' AND fecha_pedido < '2024-10-01'
	 * 
	 * @example
	 * // Actualizar con valor NULL
	 * qb.update('empleados', { fecha_baja: null })
	 *   .where(qb.eq('id', 15));
	 * // SQL: UPDATE empleados SET fecha_baja = NULL WHERE id = 15
	 * 
	 * @example
	 * // Incrementar valor numérico
	 * qb.update('productos', { stock: 'stock + 10' })
	 *   .where(qb.eq('id', 20));
	 * // SQL: UPDATE productos SET stock = stock + 10 WHERE id = 20
	 * 
	 * @example
	 * // Actualizar con cálculo
	 * qb.update('ventas', { total: 'precio * cantidad * (1 - descuento)' })
	 *   .where(qb.isNull('total'));
	 * // SQL: UPDATE ventas SET total = precio * cantidad * (1 - descuento)
	 * //      WHERE total IS NULL
	 * 
	 * @example
	 * // Actualizar con función UPPER
	 * qb.update('usuarios', { email: 'UPPER(email)' })
	 *   .where(qb.like('email', "'%@EXAMPLE.COM'"));
	 * // SQL: UPDATE usuarios SET email = UPPER(email)
	 * //      WHERE email LIKE '%@EXAMPLE.COM'
	 * 
	 * @example
	 * // Actualizar estado en lote
	 * qb.update('tareas', { completada: true, fecha_completado: 'NOW()' })
	 *   .where(qb.in('id', [1, 2, 3, 4, 5]));
	 * // SQL: UPDATE tareas SET completada = true, fecha_completado = NOW()
	 * //      WHERE id IN (1, 2, 3, 4, 5)
	 * 
	 * @example
	 * // Actualizar con subconsulta (valor desde otra tabla)
	 * qb.update('pedidos', { 
	 *   cliente_nombre: '(SELECT nombre FROM clientes WHERE clientes.id = pedidos.cliente_id)' 
	 * }).where(qb.isNull('cliente_nombre'));
	 * // SQL: UPDATE pedidos 
	 * //      SET cliente_nombre = (SELECT nombre FROM clientes WHERE clientes.id = pedidos.cliente_id)
	 * //      WHERE cliente_nombre IS NULL
	 * 
	 * @example
	 * // Actualizar por categoría
	 * qb.update('productos', { descuento: 0.15 })
	 *   .where(qb.eq('categoria', "'electrónica'"));
	 * // SQL: UPDATE productos SET descuento = 0.15 WHERE categoria = 'electrónica'
	 * 
	 * @example
	 * // Resetear intentos de login
	 * qb.update('usuarios', { intentos_login: 0, bloqueado: false })
	 *   .where(qb.and(
	 *     qb.eq('bloqueado', true),
	 *     qb.lt('fecha_bloqueo', "'2024-01-01'")
	 *   ));
	 * // SQL: UPDATE usuarios SET intentos_login = 0, bloqueado = false
	 * //      WHERE bloqueado = true AND fecha_bloqueo < '2024-01-01'
	 * 
	 * @see {@link QueryBuilder#where} - Especificar qué filas actualizar (CRÍTICO)
	 * @see {@link QueryBuilder#select} - Consultar datos antes de actualizar
	 * @see {@link QueryBuilder#insert} - Insertar nuevos datos
	 * @see {@link QueryBuilder#delete} - Eliminar datos
	 * @see {@link types.tabla} - Tipo de nombre de tabla
	 */
	update(table, sets, next) {
		try {
			// biome-ignore lint/style/noArguments: <explanation>
			const args = [...arguments];
			const error = check("update(table:string, sets:json)", args);
			if (error) {
				this.error = error;
				throw new Error(error);
			}
			const updateCommand = this.language.update(table, sets, next);
			return this.toNext([updateCommand, next], "", true);
		} catch (error) {
			this.error = error.message;
		}
	}

	/**
	 * @method delete
	 * @category DML
	 * @memberof QueryBuilder
	 * @description
	 * Elimina filas de una tabla especificada. Genera una instrucción DELETE FROM que
	 * debe usarse con WHERE para eliminar filas específicas. Sin WHERE, DELETE elimina
	 * TODAS las filas de la tabla (equivalente a TRUNCATE pero más lento).
	 * 
	 * DELETE es una operación destructiva que remueve permanentemente datos. A diferencia
	 * de TRUNCATE, DELETE permite condiciones WHERE, dispara triggers, y puede ser parte
	 * de transacciones con ROLLBACK. Use con extrema precaución en producción.
	 * 
	 * **Advertencia CRÍTICA:** DELETE sin WHERE elimina TODAS las filas de la tabla.
	 * Siempre verifique dos veces su condición WHERE antes de ejecutar en producción.
	 * Considere hacer SELECT primero para verificar qué se eliminará.
	 * 
	 * **Compatibilidad entre motores:**
	 * | Motor         | DELETE básico | USING/JOIN | RETURNING | LIMIT |
	 * |---------------|---------------|------------|-----------|-------|
	 * | PostgreSQL    | ✅ Sí         | ✅ USING   | ✅ RETURNING | ❌ No |
	 * | MySQL         | ✅ Sí         | ✅ JOIN    | ❌ No     | ✅ LIMIT |
	 * | SQL Server    | ✅ Sí         | ✅ FROM    | ✅ OUTPUT | ✅ TOP |
	 * | Oracle        | ✅ Sí         | ⚠️ Subconsulta | ✅ RETURNING | ❌ No |
	 * | SQLite        | ✅ Sí         | ❌ No      | ✅ RETURNING | ❌ No |
	 * | MongoDB       | ⚠️ deleteOne()| ⚠️ N/A     | ⚠️ findAndDelete | ⚠️ N/A |
	 * 
	 * @param {tabla} from - Nombre de la tabla de la cual eliminar registros
	 * @returns {next} Objeto next para continuar el encadenamiento fluido (típicamente con WHERE)
	 * @throws {Error} Cuando el parámetro no es una tabla válida
	 * @example
	 * // Eliminar un registro específico
	 * qb.delete('usuarios').where(qb.eq('id', 5));
	 * // SQL: DELETE FROM usuarios WHERE id = 5
	 * 
	 * @example
	 * // Eliminar registros inactivos
	 * qb.delete('usuarios').where(qb.eq('activo', false));
	 * // SQL: DELETE FROM usuarios WHERE activo = false
	 * 
	 * @example
	 * // Eliminar registros antiguos
	 * qb.delete('logs')
	 *   .where(qb.lt('created_at', "'2024-01-01'"));
	 * // SQL: DELETE FROM logs WHERE created_at < '2024-01-01'
	 * 
	 * @example
	 * // Eliminar con múltiples condiciones
	 * qb.delete('pedidos')
	 *   .where(qb.and(
	 *     qb.eq('estado', "'cancelado'"),
	 *     qb.lt('fecha', "'2023-01-01'")
	 *   ));
	 * // SQL: DELETE FROM pedidos WHERE estado = 'cancelado' AND fecha < '2023-01-01'
	 * 
	 * @example
	 * // Eliminar por lista de IDs
	 * qb.delete('productos')
	 *   .where(qb.in('id', [10, 20, 30, 40]));
	 * // SQL: DELETE FROM productos WHERE id IN (10, 20, 30, 40)
	 * 
	 * @example
	 * // Eliminar registros duplicados (manteniendo uno)
	 * qb.delete('contactos')
	 *   .where("id NOT IN (SELECT MIN(id) FROM contactos GROUP BY email)");
	 * // SQL: DELETE FROM contactos 
	 * //      WHERE id NOT IN (SELECT MIN(id) FROM contactos GROUP BY email)
	 * 
	 * @example
	 * // Eliminar registros sin referencias
	 * qb.delete('categorias')
	 *   .where("NOT EXISTS (SELECT 1 FROM productos WHERE productos.categoria_id = categorias.id)");
	 * // SQL: DELETE FROM categorias
	 * //      WHERE NOT EXISTS (SELECT 1 FROM productos WHERE productos.categoria_id = categorias.id)
	 * 
	 * @example
	 * // Eliminar sesiones expiradas
	 * qb.delete('sesiones')
	 *   .where(qb.lt('expira_at', 'NOW()'));
	 * // SQL: DELETE FROM sesiones WHERE expira_at < NOW()
	 * 
	 * @example
	 * // Eliminar con OR (cuidado con la lógica)
	 * qb.delete('notificaciones')
	 *   .where(qb.or(
	 *     qb.eq('leida', true),
	 *     qb.lt('created_at', "'2024-01-01'")
	 *   ));
	 * // SQL: DELETE FROM notificaciones 
	 * //      WHERE leida = true OR created_at < '2024-01-01'
	 * 
	 * @example
	 * // Eliminar registros con valor NULL
	 * qb.delete('clientes')
	 *   .where(qb.isNull('email'));
	 * // SQL: DELETE FROM clientes WHERE email IS NULL
	 * 
	 * @example
	 * // Eliminar por patrón LIKE
	 * qb.delete('archivos_temp')
	 *   .where(qb.like('nombre', "'%_temp.txt'"));
	 * // SQL: DELETE FROM archivos_temp WHERE nombre LIKE '%_temp.txt'
	 * 
	 * @example
	 * // Práctica recomendada: SELECT antes de DELETE
	 * // Primero verificar qué se eliminará:
	 * qb.select('*').from('usuarios').where(qb.eq('activo', false));
	 * // Luego eliminar:
	 * qb.delete('usuarios').where(qb.eq('activo', false));
	 * 
	 * @see {@link QueryBuilder#where} - Especificar qué filas eliminar (CRÍTICO)
	 * @see {@link QueryBuilder#select} - Verificar datos antes de eliminar
	 * @see {@link QueryBuilder#update} - Actualizar en lugar de eliminar
	 * @see {@link QueryBuilder#insert} - Insertar nuevos datos
	 * @see {@link types.tabla} - Tipo de nombre de tabla
	 */
	delete(from, next) {
		try {
			const deleteCommand = this.language.delete(from);
			return this.toNext([deleteCommand, next], "", true);
		} catch (error) {
			this.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/*******************************************************************************
	 * Funciones SQL
	 * Funciones comunes de SQL
	 ******************************************************************************/
	/**
	 * @method functionOneParam
	 * @category General
	 * @memberof QueryBuilder
	 * @private
	 * @description
	 * Método interno que genera dinámicamente funciones SQL agregadas y escalares
	 * que aceptan un solo parámetro. Este método se ejecuta durante la inicialización
	 * de QueryBuilder para crear los siguientes métodos:
	 * 
	 * **Funciones agregadas generadas:**
	 * - `count(column, alias)` - COUNT: Cuenta filas o valores no NULL
	 * - `max(column, alias)` - MAX: Encuentra el valor máximo
	 * - `min(column, alias)` - MIN: Encuentra el valor mínimo
	 * - `sum(column, alias)` - SUM: Suma valores numéricos
	 * - `avg(column, alias)` - AVG: Calcula el promedio
	 * 
	 * **Funciones escalares generadas:**
	 * - `upper(column, alias)` - UPPER: Convierte a mayúsculas
	 * - `lower(column, alias)` - LOWER: Convierte a minúsculas
	 * 
	 * Cada función generada acepta una columna y un alias opcional, retornando
	 * la expresión SQL correspondiente que puede usarse en SELECT, WHERE, HAVING, etc.
	 * 
	 * @returns {void} No retorna valor, modifica la instancia agregando métodos dinámicamente
	 * @example
	 * // Este método se llama internamente durante la construcción de QueryBuilder
	 * // Los usuarios utilizan los métodos generados directamente:
	 * 
	 * qb.select(qb.count('*').as('total')).from('usuarios');
	 * // SQL: SELECT COUNT(*) AS total FROM usuarios
	 * 
	 * qb.select(qb.max('precio')).from('productos');
	 * // SQL: SELECT MAX(precio) FROM productos
	 * 
	 * qb.select(qb.upper('nombre')).from('clientes');
	 * // SQL: SELECT UPPER(nombre) FROM clientes
	 */
	functionOneParam() {
		const names = ["count", "max", "min", "sum", "avg", "upper", "lower"];
		for (const name of names) {
			this[name] = (column, alias, next) => {
				const command = this.language[name](column, alias, next);
				log(
					["functionOneParam", " %s"],
					"next %o Resultado: %o",
					name,
					next,
					command,
				);
				return this.toNext([command, next]);
			};
		}
	}

	/**
	 * @method count
	 * @category Aggregate Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función agregada COUNT() de SQL para contar filas o valores no NULL.
	 * COUNT(*) cuenta todas las filas, mientras que COUNT(columna) cuenta solo valores no NULL.
	 * Esta función se usa comúnmente en SELECT, HAVING y subconsultas para obtener 
	 * totales, verificar existencias o calcular estadísticas.
	 * 
	 * **Características principales:**
	 * - COUNT(*): Cuenta todas las filas incluyendo NULL
	 * - COUNT(columna): Cuenta solo valores no NULL
	 * - COUNT(DISTINCT columna): Cuenta valores únicos
	 * - Compatible con GROUP BY para conteos por categoría
	 * - Puede usarse en HAVING para filtrar grupos
	 * - Funciona en subconsultas para verificaciones de existencia
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | COUNT(*) | COUNT(col) | COUNT(DISTINCT) | Notas |
	 * |---------------|----------|------------|-----------------|-------|
	 * | PostgreSQL    | ✅       | ✅         | ✅              | Soporta ALL, filtros |
	 * | MySQL         | ✅       | ✅         | ✅              | Optimizado para MyISAM |
	 * | SQL Server    | ✅       | ✅         | ✅              | COUNT_BIG para grandes volúmenes |
	 * | Oracle        | ✅       | ✅         | ✅              | Puede usar hint PARALLEL |
	 * | SQLite        | ✅       | ✅         | ✅              | Limitado en optimización |
	 * | MariaDB       | ✅       | ✅         | ✅              | Igual que MySQL |
	 * 
	 * @param {sqlValue} column - La columna a contar, '*' para todas las filas, 
	 *                                 o expresión como 'DISTINCT columna'
	 * @param {string} alias - Alias para el resultado de COUNT
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. COUNT(*) - Contar todas las filas de una tabla
	 * qb.select(qb.count('*', 'total'))
	 *   .from('usuarios');
	 * // SQL: SELECT COUNT(*) AS total FROM usuarios
	 * 
	 * @example
	 * // 2. COUNT(columna) - Contar valores no NULL
	 * qb.select(qb.count('email','con_email'))
	 *   .from('usuarios');
	 * // SQL: SELECT COUNT(email) AS con_email FROM usuarios
	 * // Solo cuenta usuarios que tienen email (no NULL)
	 * 
	 * @example
	 * // 3. COUNT(DISTINCT) - Contar valores únicos
	 * qb.select(qb.count('DISTINCT pais','paises'))
	 *   .from('clientes');
	 * // SQL: SELECT COUNT(DISTINCT pais) AS paises FROM clientes
	 * 
	 * @example
	 * // 4. COUNT con GROUP BY - Contar por categoría
	 * qb.select('categoria', qb.count('*','productos'))
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, COUNT(*) AS productos 
	 * //      FROM productos 
	 * //      GROUP BY categoria
	 * 
	 * @example
	 * // 5. COUNT en HAVING - Filtrar grupos por conteo
	 * qb.select('ciudad', qb.count('*','total'))
	 *   .from('clientes')
	 *   .groupBy('ciudad')
	 *   .having('COUNT(*) > 10');
	 * // SQL: SELECT ciudad, COUNT(*) AS total 
	 * //      FROM clientes 
	 * //      GROUP BY ciudad 
	 * //      HAVING COUNT(*) > 10
	 * 
	 * @example
	 * // 6. COUNT con múltiples columnas
	 * qb.select(
	 *   qb.count('*','total'),
	 *   qb.count('telefono','con_telefono'),
	 *   qb.count('email','con_email')
	 * ).from('contactos');
	 * // SQL: SELECT COUNT(*) AS total, 
	 * //             COUNT(telefono) AS con_telefono,
	 * //             COUNT(email) AS con_email
	 * //      FROM contactos
	 * 
	 * @example
	 * // 7. COUNT en subconsulta WHERE - Verificar existencia
	 * qb.select('*')
	 *   .from('categorias')
	 *   .where('(SELECT COUNT(*) FROM productos WHERE categoria_id = categorias.id) > 0');
	 * // SQL: SELECT * FROM categorias 
	 * //      WHERE (SELECT COUNT(*) FROM productos 
	 * //             WHERE categoria_id = categorias.id) > 0
	 * 
	 * @example
	 * // 8. COUNT con JOIN - Contar relaciones
	 * qb.select('c.nombre', qb.count('p.id','num_productos'))
	 *   .from('categorias', 'c')
	 *   .leftJoin('productos', 'p', 'p.categoria_id = c.id')
	 *   .groupBy('c.id', 'c.nombre');
	 * // SQL: SELECT c.nombre, COUNT(p.id) AS num_productos
	 * //      FROM categorias c
	 * //      LEFT JOIN productos p ON p.categoria_id = c.id
	 * //      GROUP BY c.id, c.nombre
	 * 
	 * @example
	 * // 9. COUNT con CASE - Conteos condicionales
	 * qb.select(
	 *   qb.count('CASE WHEN activo = true THEN 1 END','activos'),
	 *   qb.count('CASE WHEN activo = false THEN 1 END','inactivos')
	 * ).from('usuarios');
	 * // SQL: SELECT COUNT(CASE WHEN activo = true THEN 1 END) AS activos,
	 * //             COUNT(CASE WHEN activo = false THEN 1 END) AS inactivos
	 * //      FROM usuarios
	 * 
	 * @example
	 * // 10. COUNT con filtro WHERE - Contar registros específicos
	 * qb.select('departamento', qb.count('*','empleados'))
	 *   .from('empleados')
	 *   .where('salario > 50000')
	 *   .groupBy('departamento');
	 * // SQL: SELECT departamento, COUNT(*) AS empleados
	 * //      FROM empleados
	 * //      WHERE salario > 50000
	 * //      GROUP BY departamento
	 * 
	 * @example
	 * // 11. COUNT(*) vs COUNT(columna) - Diferencia con NULL
	 * qb.select(
	 *   qb.count('*','total_filas'),
	 *   qb.count('direccion','con_direccion')
	 * ).from('clientes');
	 * // SQL: SELECT COUNT(*) AS total_filas, 
	 * //             COUNT(direccion) AS con_direccion
	 * //      FROM clientes
	 * // Si hay NULLs: total_filas > con_direccion
	 * 
	 * @example
	 * // 12. COUNT con ORDER BY - Ordenar por conteo
	 * qb.select('pais', qb.count('*','clientes'))
	 *   .from('clientes')
	 *   .groupBy('pais')
	 *   .orderBy('COUNT(*) DESC')
	 *   .limit(5);
	 * // SQL: SELECT pais, COUNT(*) AS clientes
	 * //      FROM clientes
	 * //      GROUP BY pais
	 * //      ORDER BY COUNT(*) DESC
	 * //      LIMIT 5
	 * // Top 5 países con más clientes
	 * 
	 * @see {@link max} para encontrar el valor máximo
	 * @see {@link min} para encontrar el valor mínimo
	 * @see {@link sum} para sumar valores numéricos
	 * @see {@link avg} para calcular promedios
	 * @see {@link groupBy} para agrupar resultados antes de contar
	 * @see {@link having} para filtrar grupos por conteo
	 */

	/**
	 * @method max
	 * @category Aggregate Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función agregada MAX() de SQL para encontrar el valor máximo de una columna.
	 * Útil para encontrar precios más altos, fechas más recientes, valores superiores, etc.
	 * Ignora valores NULL automáticamente. Puede combinarse con GROUP BY para encontrar
	 * máximos por categoría.
	 * 
	 * **Características principales:**
	 * - Encuentra el valor más alto en una columna
	 * - Ignora valores NULL automáticamente
	 * - Funciona con números, fechas, cadenas (orden alfabético)
	 * - Compatible con GROUP BY para máximos por grupo
	 * - Puede usarse en SELECT, HAVING y subconsultas
	 * - Soporta expresiones y cálculos
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | Numérico | Fechas | Cadenas | DISTINCT | Notas |
	 * |---------------|----------|--------|---------|----------|-------|
	 * | PostgreSQL    | ✅       | ✅     | ✅      | ✅       | Orden según collation |
	 * | MySQL         | ✅       | ✅     | ✅      | ✅       | Case-sensitive según collation |
	 * | SQL Server    | ✅       | ✅     | ✅      | ✅       | Ignora índices NULL |
	 * | Oracle        | ✅       | ✅     | ✅      | ✅       | Soporta KEEP DENSE_RANK |
	 * | SQLite        | ✅       | ✅     | ✅      | ✅       | Comparación básica |
	 * | MariaDB       | ✅       | ✅     | ✅      | ✅       | Igual que MySQL |
	 * 
	 * @param {sqlValue} column - La columna de la que obtener el valor máximo
	 * @param {string} alias - Alias para el resultado de MAX
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. MAX simple - Encontrar el precio más alto
	 * qb.select(qb.max('precio', 'precio_maximo'))
	 *   .from('productos');
	 * // SQL: SELECT MAX(precio) AS precio_maximo FROM productos
	 * 
	 * @example
	 * // 2. MAX con GROUP BY - Precio más alto por categoría
	 * qb.select('categoria', qb.max('precio', 'max_precio'))
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, MAX(precio) AS max_precio
	 * //      FROM productos
	 * //      GROUP BY categoria
	 * 
	 * @example
	 * // 3. MAX con fechas - Última fecha de compra
	 * qb.select('cliente_id', qb.max('fecha_compra', 'ultima_compra'))
	 *   .from('pedidos')
	 *   .groupBy('cliente_id');
	 * // SQL: SELECT cliente_id, MAX(fecha_compra) AS ultima_compra
	 * //      FROM pedidos
	 * //      GROUP BY cliente_id
	 * 
	 * @example
	 * // 4. MAX con cadenas - Último nombre alfabéticamente
	 * qb.select(qb.max('nombre', 'ultimo_nombre'))
	 *   .from('clientes');
	 * // SQL: SELECT MAX(nombre) AS ultimo_nombre FROM clientes
	 * // Resultado: 'Zacarías' > 'Ana' alfabéticamente
	 * 
	 * @example
	 * // 5. MAX en HAVING - Filtrar por precio máximo
	 * qb.select('marca', qb.max('precio', 'max_precio'))
	 *   .from('productos')
	 *   .groupBy('marca')
	 *   .having('MAX(precio) > 1000');
	 * // SQL: SELECT marca, MAX(precio) AS max_precio
	 * //      FROM productos
	 * //      GROUP BY marca
	 * //      HAVING MAX(precio) > 1000
	 * 
	 * @example
	 * // 6. MAX con múltiples agregaciones
	 * qb.select(
	 *   'departamento',
	 *   qb.max('salario', 'salario_maximo'),
	 *   qb.min('salario', 'salario_minimo'),
	 *   qb.avg('salario', 'salario_promedio')
	 * ).from('empleados')
	 *   .groupBy('departamento');
	 * // SQL: SELECT departamento, 
	 * //             MAX(salario) AS salario_maximo,
	 * //             MIN(salario) AS salario_minimo,
	 * //             AVG(salario) AS salario_promedio
	 * //      FROM empleados
	 * //      GROUP BY departamento
	 * 
	 * @example
	 * // 7. MAX en subconsulta - Productos con precio máximo
	 * qb.select('*')
	 *   .from('productos')
	 *   .where('precio = (SELECT MAX(precio) FROM productos)');
	 * // SQL: SELECT * FROM productos
	 * //      WHERE precio = (SELECT MAX(precio) FROM productos)
	 * 
	 * @example
	 * // 8. MAX con expresión - Máximo de un cálculo
	 * qb.select(qb.max('precio * cantidad', 'venta_maxima'))
	 *   .from('ventas');
	 * // SQL: SELECT MAX(precio * cantidad) AS venta_maxima FROM ventas
	 * 
	 * @example
	 * // 9. MAX con JOIN - Máximo en relaciones
	 * qb.select('c.nombre', qb.max('p.precio', 'producto_mas_caro'))
	 *   .from('categorias', 'c')
	 *   .innerJoin('productos', 'p', 'p.categoria_id = c.id')
	 *   .groupBy('c.id', 'c.nombre');
	 * // SQL: SELECT c.nombre, MAX(p.precio) AS producto_mas_caro
	 * //      FROM categorias c
	 * //      INNER JOIN productos p ON p.categoria_id = c.id
	 * //      GROUP BY c.id, c.nombre
	 * 
	 * @example
	 * // 10. MAX con DISTINCT - Máximo de valores únicos
	 * qb.select(qb.max('DISTINCT precio', 'max_precio_unico'))
	 *   .from('productos');
	 * // SQL: SELECT MAX(DISTINCT precio) AS max_precio_unico FROM productos
	 * // Útil si hay duplicados exactos
	 * 
	 * @example
	 * // 11. MAX con WHERE - Máximo filtrado
	 * qb.select('categoria', qb.max('precio', 'max_precio'))
	 *   .from('productos')
	 *   .where('activo = true')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, MAX(precio) AS max_precio
	 * //      FROM productos
	 * //      WHERE activo = true
	 * //      GROUP BY categoria
	 * 
	 * @example
	 * // 12. MAX con ORDER BY - Ordenar por máximo
	 * qb.select('vendedor', qb.max('monto', 'venta_maxima'))
	 *   .from('ventas')
	 *   .groupBy('vendedor')
	 *   .orderBy('MAX(monto) DESC')
	 *   .limit(3);
	 * // SQL: SELECT vendedor, MAX(monto) AS venta_maxima
	 * //      FROM ventas
	 * //      GROUP BY vendedor
	 * //      ORDER BY MAX(monto) DESC
	 * //      LIMIT 3
	 * // Top 3 vendedores con venta máxima más alta
	 * 
	 * @see {@link min} para encontrar el valor mínimo
	 * @see {@link avg} para calcular promedios
	 * @see {@link sum} para sumar valores
	 * @see {@link count} para contar registros
	 * @see {@link groupBy} para agrupar antes de calcular máximos
	 */

	/**
	 * @method min
	 * @category Aggregate Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función agregada MIN() de SQL para encontrar el valor mínimo de una columna.
	 * Útil para encontrar precios más bajos, fechas más antiguas, valores menores, etc.
	 * Ignora valores NULL automáticamente. Puede combinarse con GROUP BY para encontrar
	 * mínimos por categoría.
	 * 
	 * **Características principales:**
	 * - Encuentra el valor más bajo en una columna
	 * - Ignora valores NULL automáticamente
	 * - Funciona con números, fechas, cadenas (orden alfabético)
	 * - Compatible con GROUP BY para mínimos por grupo
	 * - Puede usarse en SELECT, HAVING y subconsultas
	 * - Soporta expresiones y cálculos
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | Numérico | Fechas | Cadenas | DISTINCT | Notas |
	 * |---------------|----------|--------|---------|----------|-------|
	 * | PostgreSQL    | ✅       | ✅     | ✅      | ✅       | Orden según collation |
	 * | MySQL         | ✅       | ✅     | ✅      | ✅       | Case-sensitive según collation |
	 * | SQL Server    | ✅       | ✅     | ✅      | ✅       | Ignora índices NULL |
	 * | Oracle        | ✅       | ✅     | ✅      | ✅       | Soporta KEEP DENSE_RANK |
	 * | SQLite        | ✅       | ✅     | ✅      | ✅       | Comparación básica |
	 * | MariaDB       | ✅       | ✅     | ✅      | ✅       | Igual que MySQL |
	 * 
	 * @param {sqlValue} column - La columna de la que obtener el valor mínimo
	 * @param {string} alias - Alias para el resultado de MIN
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. MIN simple - Encontrar el precio más bajo
	 * qb.select(qb.min('precio', 'precio_minimo'))
	 *   .from('productos');
	 * // SQL: SELECT MIN(precio) AS precio_minimo FROM productos
	 * 
	 * @example
	 * // 2. MIN con GROUP BY - Precio más bajo por categoría
	 * qb.select('categoria', qb.min('precio', 'min_precio'))
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, MIN(precio) AS min_precio
	 * //      FROM productos
	 * //      GROUP BY categoria
	 * 
	 * @example
	 * // 3. MIN con fechas - Primera fecha de registro
	 * qb.select('pais', qb.min('fecha_registro').as('primer_registro'))
	 *   .from('usuarios')
	 *   .groupBy('pais');
	 * // SQL: SELECT pais, MIN(fecha_registro) AS primer_registro
	 * //      FROM usuarios
	 * //      GROUP BY pais
	 * 
	 * @example
	 * // 4. MIN con cadenas - Primer nombre alfabéticamente
	 * qb.select(qb.min('apellido').as('primer_apellido'))
	 *   .from('empleados');
	 * // SQL: SELECT MIN(apellido) AS primer_apellido FROM empleados
	 * // Resultado: 'Álvarez' < 'Zapata' alfabéticamente
	 * 
	 * @example
	 * // 5. MIN en HAVING - Filtrar por precio mínimo
	 * qb.select('proveedor', qb.min('precio').as('min_precio'))
	 *   .from('productos')
	 *   .groupBy('proveedor')
	 *   .having('MIN(precio) < 10');
	 * // SQL: SELECT proveedor, MIN(precio) AS min_precio
	 * //      FROM productos
	 * //      GROUP BY proveedor
	 * //      HAVING MIN(precio) < 10
	 * 
	 * @example
	 * // 6. MIN con múltiples agregaciones - Análisis completo
	 * qb.select(
	 *   'departamento',
	 *   qb.min('salario').as('salario_minimo'),
	 *   qb.max('salario').as('salario_maximo'),
	 *   qb.avg('salario').as('salario_promedio')
	 * ).from('empleados')
	 *   .groupBy('departamento');
	 * // SQL: SELECT departamento,
	 * //             MIN(salario) AS salario_minimo,
	 * //             MAX(salario) AS salario_maximo,
	 * //             AVG(salario) AS salario_promedio
	 * //      FROM empleados
	 * //      GROUP BY departamento
	 * 
	 * @example
	 * // 7. MIN en subconsulta - Productos con precio mínimo
	 * qb.select('*')
	 *   .from('productos')
	 *   .where('precio = (SELECT MIN(precio) FROM productos)');
	 * // SQL: SELECT * FROM productos
	 * //      WHERE precio = (SELECT MIN(precio) FROM productos)
	 * 
	 * @example
	 * // 8. MIN con expresión - Mínimo de un cálculo
	 * qb.select(qb.min('precio - descuento').as('precio_neto_minimo'))
	 *   .from('ofertas');
	 * // SQL: SELECT MIN(precio - descuento) AS precio_neto_minimo FROM ofertas
	 * 
	 * @example
	 * // 9. MIN con JOIN - Mínimo en relaciones
	 * qb.select('c.nombre', qb.min('p.precio').as('producto_mas_barato'))
	 *   .from('categorias', 'c')
	 *   .innerJoin('productos', 'p', 'p.categoria_id = c.id')
	 *   .groupBy('c.id', 'c.nombre');
	 * // SQL: SELECT c.nombre, MIN(p.precio) AS producto_mas_barato
	 * //      FROM categorias c
	 * //      INNER JOIN productos p ON p.categoria_id = c.id
	 * //      GROUP BY c.id, c.nombre
	 * 
	 * @example
	 * // 10. MIN con DISTINCT - Mínimo de valores únicos
	 * qb.select(qb.min('DISTINCT costo').as('min_costo_unico'))
	 *   .from('servicios');
	 * // SQL: SELECT MIN(DISTINCT costo) AS min_costo_unico FROM servicios
	 * 
	 * @example
	 * // 11. MIN con WHERE - Mínimo filtrado
	 * qb.select('categoria', qb.min('precio').as('min_precio'))
	 *   .from('productos')
	 *   .where('stock > 0')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, MIN(precio) AS min_precio
	 * //      FROM productos
	 * //      WHERE stock > 0
	 * //      GROUP BY categoria
	 * // Solo productos en stock
	 * 
	 * @example
	 * // 12. MIN para encontrar antigüedad - Empleado más antiguo
	 * qb.select('departamento', qb.min('fecha_contratacion').as('empleado_mas_antiguo'))
	 *   .from('empleados')
	 *   .groupBy('departamento')
	 *   .orderBy('MIN(fecha_contratacion) ASC');
	 * // SQL: SELECT departamento, MIN(fecha_contratacion) AS empleado_mas_antiguo
	 * //      FROM empleados
	 * //      GROUP BY departamento
	 * //      ORDER BY MIN(fecha_contratacion) ASC
	 * 
	 * @see {@link max} para encontrar el valor máximo
	 * @see {@link avg} para calcular promedios
	 * @see {@link sum} para sumar valores
	 * @see {@link count} para contar registros
	 * @see {@link groupBy} para agrupar antes de calcular mínimos
	 */

	/**
	 * @method sum
	 * @category Aggregate Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función agregada SUM() de SQL para sumar valores numéricos de una columna.
	 * Calcula la suma total de todos los valores no NULL. Útil para totales de ventas,
	 * cantidades, importes, etc. Puede combinarse con GROUP BY para calcular totales
	 * por categoría.
	 * 
	 * **Características principales:**
	 * - Suma todos los valores numéricos de una columna
	 * - Ignora valores NULL automáticamente
	 * - Solo funciona con tipos numéricos
	 * - Compatible con GROUP BY para totales por grupo
	 * - Puede usarse en SELECT, HAVING y subconsultas
	 * - Soporta expresiones y cálculos (precio * cantidad)
	 * - Retorna NULL si no hay filas o todos los valores son NULL
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | Enteros | Decimales | DISTINCT | Expresiones | Notas |
	 * |---------------|---------|-----------|----------|-------------|-------|
	 * | PostgreSQL    | ✅      | ✅        | ✅       | ✅          | Tipo resultado según input |
	 * | MySQL         | ✅      | ✅        | ✅       | ✅          | Overflow retorna error |
	 * | SQL Server    | ✅      | ✅        | ✅       | ✅          | Usa BIGINT para enteros |
	 * | Oracle        | ✅      | ✅        | ✅       | ✅          | Soporta KEEP DENSE_RANK |
	 * | SQLite        | ✅      | ✅        | ✅       | ✅          | Conversión automática |
	 * | MariaDB       | ✅      | ✅        | ✅       | ✅          | Igual que MySQL |
	 * 
	 * @param {sqlValue} column - La columna numérica a sumar o expresión
	 * @param {string} alias - Alias para el resultado de SUM
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. SUM simple - Total de ventas
	 * qb.select(qb.sum('monto').as('total_ventas'))
	 *   .from('ventas');
	 * // SQL: SELECT SUM(monto) AS total_ventas FROM ventas
	 * 
	 * @example
	 * // 2. SUM con GROUP BY - Total por categoría
	 * qb.select('categoria', qb.sum('precio').as('total'))
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, SUM(precio) AS total
	 * //      FROM productos
	 * //      GROUP BY categoria
	 * 
	 * @example
	 * // 3. SUM con expresión - Calcular ingresos (precio * cantidad)
	 * qb.select(qb.sum('precio * cantidad').as('ingresos_totales'))
	 *   .from('detalle_pedidos');
	 * // SQL: SELECT SUM(precio * cantidad) AS ingresos_totales 
	 * //      FROM detalle_pedidos
	 * 
	 * @example
	 * // 4. SUM en HAVING - Filtrar grupos por total
	 * qb.select('cliente_id', qb.sum('total').as('compras'))
	 *   .from('pedidos')
	 *   .groupBy('cliente_id')
	 *   .having('SUM(total) > 1000');
	 * // SQL: SELECT cliente_id, SUM(total) AS compras
	 * //      FROM pedidos
	 * //      GROUP BY cliente_id
	 * //      HAVING SUM(total) > 1000
	 * 
	 * @example
	 * // 5. SUM con múltiples agregaciones
	 * qb.select(
	 *   'vendedor',
	 *   qb.sum('monto').as('total_ventas'),
	 *   qb.count('*').as('num_ventas'),
	 *   qb.avg('monto').as('venta_promedio')
	 * ).from('ventas')
	 *   .groupBy('vendedor');
	 * // SQL: SELECT vendedor,
	 * //             SUM(monto) AS total_ventas,
	 * //             COUNT(*) AS num_ventas,
	 * //             AVG(monto) AS venta_promedio
	 * //      FROM ventas
	 * //      GROUP BY vendedor
	 * 
	 * @example
	 * // 6. SUM con WHERE - Total filtrado
	 * qb.select(qb.sum('precio').as('total_activos'))
	 *   .from('productos')
	 *   .where('activo = true');
	 * // SQL: SELECT SUM(precio) AS total_activos
	 * //      FROM productos
	 * //      WHERE activo = true
	 * 
	 * @example
	 * // 7. SUM en subconsulta - Clientes con compras sobre promedio
	 * qb.select('*')
	 *   .from('clientes')
	 *   .where('(SELECT SUM(total) FROM pedidos WHERE cliente_id = clientes.id) > 5000');
	 * // SQL: SELECT * FROM clientes
	 * //      WHERE (SELECT SUM(total) FROM pedidos 
	 * //             WHERE cliente_id = clientes.id) > 5000
	 * 
	 * @example
	 * // 8. SUM con JOIN - Total de ventas por producto
	 * qb.select('p.nombre', qb.sum('v.cantidad').as('total_vendido'))
	 *   .from('productos', 'p')
	 *   .leftJoin('ventas', 'v', 'v.producto_id = p.id')
	 *   .groupBy('p.id', 'p.nombre');
	 * // SQL: SELECT p.nombre, SUM(v.cantidad) AS total_vendido
	 * //      FROM productos p
	 * //      LEFT JOIN ventas v ON v.producto_id = p.id
	 * //      GROUP BY p.id, p.nombre
	 * 
	 * @example
	 * // 9. SUM con DISTINCT - Suma de valores únicos
	 * qb.select(qb.sum('DISTINCT precio').as('suma_precios_unicos'))
	 *   .from('productos');
	 * // SQL: SELECT SUM(DISTINCT precio) AS suma_precios_unicos FROM productos
	 * // Evita sumar el mismo precio múltiples veces
	 * 
	 * @example
	 * // 10. SUM con CASE - Suma condicional
	 * qb.select(
	 *   qb.sum('CASE WHEN tipo = "ingreso" THEN monto ELSE 0 END').as('ingresos'),
	 *   qb.sum('CASE WHEN tipo = "egreso" THEN monto ELSE 0 END').as('egresos')
	 * ).from('transacciones');
	 * // SQL: SELECT SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
	 * //             SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) AS egresos
	 * //      FROM transacciones
	 * 
	 * @example
	 * // 11. SUM con ORDER BY - Ordenar por total
	 * qb.select('categoria', qb.sum('precio').as('total'))
	 *   .from('productos')
	 *   .groupBy('categoria')
	 *   .orderBy('SUM(precio) DESC')
	 *   .limit(5);
	 * // SQL: SELECT categoria, SUM(precio) AS total
	 * //      FROM productos
	 * //      GROUP BY categoria
	 * //      ORDER BY SUM(precio) DESC
	 * //      LIMIT 5
	 * 
	 * @example
	 * // 12. SUM con cálculo complejo - Descuentos aplicados
	 * qb.select(
	 *   qb.sum('precio * cantidad * (1 - descuento/100)').as('total_con_descuento')
	 * ).from('detalle_pedidos');
	 * // SQL: SELECT SUM(precio * cantidad * (1 - descuento/100)) AS total_con_descuento
	 * //      FROM detalle_pedidos
	 * 
	 * @see {@link avg} para calcular promedios en lugar de totales
	 * @see {@link count} para contar en lugar de sumar
	 * @see {@link max} para encontrar el valor máximo
	 * @see {@link min} para encontrar el valor mínimo
	 * @see {@link groupBy} para agrupar antes de sumar
	 */

	/**
	 * @method avg
	 * @category Aggregate Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función agregada AVG() de SQL para calcular el promedio (media aritmética) 
	 * de valores numéricos. Suma todos los valores no NULL y divide por el conteo.
	 * Útil para promedios de precios, calificaciones, salarios, métricas, etc.
	 * 
	 * **Características principales:**
	 * - Calcula la media aritmética de valores numéricos
	 * - Ignora valores NULL automáticamente
	 * - Solo funciona con tipos numéricos
	 * - Compatible con GROUP BY para promedios por grupo
	 * - Puede usarse en SELECT, HAVING y subconsultas
	 * - Soporta expresiones y cálculos
	 * - Retorna NULL si no hay filas o todos los valores son NULL
	 * - El resultado es generalmente DECIMAL/FLOAT
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | Enteros | Decimales | DISTINCT | Expresiones | Tipo Resultado |
	 * |---------------|---------|-----------|----------|-------------|----------------|
	 * | PostgreSQL    | ✅      | ✅        | ✅       | ✅          | NUMERIC        |
	 * | MySQL         | ✅      | ✅        | ✅       | ✅          | DOUBLE         |
	 * | SQL Server    | ✅      | ✅        | ✅       | ✅          | Según tipo input |
	 * | Oracle        | ✅      | ✅        | ✅       | ✅          | NUMBER         |
	 * | SQLite        | ✅      | ✅        | ✅       | ✅          | REAL           |
	 * | MariaDB       | ✅      | ✅        | ✅       | ✅          | DOUBLE         |
	 * 
	 * @param {sqlValue} column - La columna numérica para calcular el promedio
	 * @param {string} alias - Alias para el resultado de AVG
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. AVG simple - Precio promedio de productos
	 * qb.select(qb.avg('precio').as('precio_promedio'))
	 *   .from('productos');
	 * // SQL: SELECT AVG(precio) AS precio_promedio FROM productos
	 * 
	 * @example
	 * // 2. AVG con GROUP BY - Promedio por categoría
	 * qb.select('categoria', qb.avg('precio').as('precio_promedio'))
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, AVG(precio) AS precio_promedio
	 * //      FROM productos
	 * //      GROUP BY categoria
	 * 
	 * @example
	 * // 3. AVG con expresión - Promedio de cálculo
	 * qb.select(qb.avg('precio * cantidad').as('venta_promedio'))
	 *   .from('detalle_pedidos');
	 * // SQL: SELECT AVG(precio * cantidad) AS venta_promedio
	 * //      FROM detalle_pedidos
	 * 
	 * @example
	 * // 4. AVG en HAVING - Filtrar grupos por promedio
	 * qb.select('departamento', qb.avg('salario').as('salario_promedio'))
	 *   .from('empleados')
	 *   .groupBy('departamento')
	 *   .having('AVG(salario) > 50000');
	 * // SQL: SELECT departamento, AVG(salario) AS salario_promedio
	 * //      FROM empleados
	 * //      GROUP BY departamento
	 * //      HAVING AVG(salario) > 50000
	 * 
	 * @example
	 * // 5. AVG con múltiples agregaciones - Análisis completo
	 * qb.select(
	 *   'producto_id',
	 *   qb.avg('calificacion').as('promedio'),
	 *   qb.count('*').as('total_reviews'),
	 *   qb.max('calificacion').as('mejor'),
	 *   qb.min('calificacion').as('peor')
	 * ).from('reviews')
	 *   .groupBy('producto_id');
	 * // SQL: SELECT producto_id,
	 * //             AVG(calificacion) AS promedio,
	 * //             COUNT(*) AS total_reviews,
	 * //             MAX(calificacion) AS mejor,
	 * //             MIN(calificacion) AS peor
	 * //      FROM reviews
	 * //      GROUP BY producto_id
	 * 
	 * @example
	 * // 6. AVG con WHERE - Promedio filtrado
	 * qb.select(qb.avg('nota').as('promedio_aprobados'))
	 *   .from('examenes')
	 *   .where('nota >= 60');
	 * // SQL: SELECT AVG(nota) AS promedio_aprobados
	 * //      FROM examenes
	 * //      WHERE nota >= 60
	 * 
	 * @example
	 * // 7. AVG en subconsulta - Comparar con promedio
	 * qb.select('nombre', 'salario')
	 *   .from('empleados')
	 *   .where('salario > (SELECT AVG(salario) FROM empleados)');
	 * // SQL: SELECT nombre, salario FROM empleados
	 * //      WHERE salario > (SELECT AVG(salario) FROM empleados)
	 * // Empleados con salario sobre el promedio
	 * 
	 * @example
	 * // 8. AVG con JOIN - Promedio en relaciones
	 * qb.select('c.nombre', qb.avg('p.precio').as('precio_promedio'))
	 *   .from('categorias', 'c')
	 *   .innerJoin('productos', 'p', 'p.categoria_id = c.id')
	 *   .groupBy('c.id', 'c.nombre');
	 * // SQL: SELECT c.nombre, AVG(p.precio) AS precio_promedio
	 * //      FROM categorias c
	 * //      INNER JOIN productos p ON p.categoria_id = c.id
	 * //      GROUP BY c.id, c.nombre
	 * 
	 * @example
	 * // 9. AVG con DISTINCT - Promedio de valores únicos
	 * qb.select(qb.avg('DISTINCT precio').as('promedio_precios_unicos'))
	 *   .from('productos');
	 * // SQL: SELECT AVG(DISTINCT precio) AS promedio_precios_unicos FROM productos
	 * // Útil cuando hay duplicados exactos
	 * 
	 * @example
	 * // 10. AVG con ROUND - Redondear promedio
	 * qb.select('categoria', 'ROUND(AVG(precio), 2) AS precio_promedio')
	 *   .from('productos')
	 *   .groupBy('categoria');
	 * // SQL: SELECT categoria, ROUND(AVG(precio), 2) AS precio_promedio
	 * //      FROM productos
	 * //      GROUP BY categoria
	 * // Promedio redondeado a 2 decimales
	 * 
	 * @example
	 * // 11. AVG vs SUM/COUNT - Equivalencia
	 * qb.select(
	 *   qb.avg('monto').as('promedio_avg'),
	 *   'SUM(monto) / COUNT(monto) AS promedio_manual'
	 * ).from('ventas');
	 * // SQL: SELECT AVG(monto) AS promedio_avg,
	 * //             SUM(monto) / COUNT(monto) AS promedio_manual
	 * //      FROM ventas
	 * // Ambos métodos dan el mismo resultado
	 * 
	 * @example
	 * // 12. AVG con ORDER BY - Ordenar por promedio
	 * qb.select('vendedor', qb.avg('monto').as('venta_promedio'))
	 *   .from('ventas')
	 *   .groupBy('vendedor')
	 *   .orderBy('AVG(monto) DESC')
	 *   .limit(10);
	 * // SQL: SELECT vendedor, AVG(monto) AS venta_promedio
	 * //      FROM ventas
	 * //      GROUP BY vendedor
	 * //      ORDER BY AVG(monto) DESC
	 * //      LIMIT 10
	 * // Top 10 vendedores por venta promedio
	 * 
	 * @see {@link sum} para sumar en lugar de promediar
	 * @see {@link count} para contar registros
	 * @see {@link max} para encontrar el valor máximo
	 * @see {@link min} para encontrar el valor mínimo
	 * @see {@link groupBy} para agrupar antes de calcular promedios
	 */

	/**
	 * @method upper
	 * @category String Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función SQL UPPER() (o UCASE() en algunos sistemas) para convertir
	 * una cadena de texto a mayúsculas. Útil para normalizar datos, comparaciones
	 * insensibles a mayúsculas/minúsculas, y formateo de salida.
	 * 
	 * **Características principales:**
	 * - Convierte todas las letras a mayúsculas
	 * - No afecta números, símbolos o espacios
	 * - Respeta caracteres Unicode en la mayoría de sistemas
	 * - NULL retorna NULL
	 * - Puede usarse en SELECT, WHERE, ORDER BY, GROUP BY
	 * - Útil para comparaciones case-insensitive
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | Soporte | Unicode | Alias   | Notas |
	 * |---------------|---------|---------|---------|-------|
	 * | PostgreSQL    | ✅      | ✅      | -       | Respeta locale |
	 * | MySQL         | ✅      | ✅      | UCASE() | Según charset |
	 * | SQL Server    | ✅      | ✅      | -       | Según collation |
	 * | Oracle        | ✅      | ✅      | -       | Soporta NLS_UPPER |
	 * | SQLite        | ✅      | Limitado| -       | Solo ASCII por defecto |
	 * | MariaDB       | ✅      | ✅      | UCASE() | Igual que MySQL |
	 * 
	 * @param {sqlValue} column - La columna o expresión de texto a convertir
	 * @param {string} alias - Alias para el resultado
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. UPPER simple - Convertir nombre a mayúsculas
	 * qb.select(qb.upper('nombre').as('nombre_mayusculas'))
	 *   .from('usuarios');
	 * // SQL: SELECT UPPER(nombre) AS nombre_mayusculas FROM usuarios
	 * 
	 * @example
	 * // 2. UPPER en WHERE - Comparación insensible a mayúsculas
	 * qb.select('*')
	 *   .from('productos')
	 *   .where("UPPER(nombre) = 'LAPTOP'");
	 * // SQL: SELECT * FROM productos WHERE UPPER(nombre) = 'LAPTOP'
	 * // Encuentra 'Laptop', 'laptop', 'LAPTOP', etc.
	 * 
	 * @example
	 * // 3. UPPER con concatenación - Formato nombre completo
	 * qb.select("UPPER(nombre || ' ' || apellido) AS nombre_completo")
	 *   .from('empleados');
	 * // SQL: SELECT UPPER(nombre || ' ' || apellido) AS nombre_completo
	 * //      FROM empleados
	 * // PostgreSQL: "JUAN PÉREZ"
	 * 
	 * @example
	 * // 4. UPPER en GROUP BY - Agrupar ignorando mayúsculas
	 * qb.select(qb.upper('ciudad').as('ciudad'), qb.count('*').as('total'))
	 *   .from('clientes')
	 *   .groupBy('UPPER(ciudad)');
	 * // SQL: SELECT UPPER(ciudad) AS ciudad, COUNT(*) AS total
	 * //      FROM clientes
	 * //      GROUP BY UPPER(ciudad)
	 * // Agrupa 'Madrid', 'madrid', 'MADRID' juntos
	 * 
	 * @example
	 * // 5. UPPER en ORDER BY - Ordenar ignorando mayúsculas
	 * qb.select('nombre', 'email')
	 *   .from('usuarios')
	 *   .orderBy('UPPER(nombre) ASC');
	 * // SQL: SELECT nombre, email FROM usuarios ORDER BY UPPER(nombre) ASC
	 * 
	 * @example
	 * // 6. UPPER con LIKE - Búsqueda case-insensitive
	 * qb.select('*')
	 *   .from('productos')
	 *   .where("UPPER(descripcion) LIKE '%OFERTA%'");
	 * // SQL: SELECT * FROM productos 
	 * //      WHERE UPPER(descripcion) LIKE '%OFERTA%'
	 * 
	 * @example
	 * // 7. UPPER vs LOWER - Normalización bidireccional
	 * qb.select(
	 *   'nombre',
	 *   qb.upper('nombre').as('mayusculas'),
	 *   qb.lower('nombre').as('minusculas')
	 * ).from('categorias');
	 * // SQL: SELECT nombre,
	 * //             UPPER(nombre) AS mayusculas,
	 * //             LOWER(nombre) AS minusculas
	 * //      FROM categorias
	 * 
	 * @example
	 * // 8. UPPER con COALESCE - Manejar NULL
	 * qb.select(qb.upper('COALESCE(apodo, nombre)').as('identificador'))
	 *   .from('usuarios');
	 * // SQL: SELECT UPPER(COALESCE(apodo, nombre)) AS identificador
	 * //      FROM usuarios
	 * 
	 * @example
	 * // 9. UPPER en UPDATE - Normalizar datos existentes
	 * qb.update('productos')
	 *   .set('codigo = UPPER(codigo)')
	 *   .where('codigo IS NOT NULL');
	 * // SQL: UPDATE productos SET codigo = UPPER(codigo) 
	 * //      WHERE codigo IS NOT NULL
	 * 
	 * @example
	 * // 10. UPPER con DISTINCT - Valores únicos normalizados
	 * qb.select('DISTINCT UPPER(pais) AS pais')
	 *   .from('clientes')
	 *   .orderBy('1');
	 * // SQL: SELECT DISTINCT UPPER(pais) AS pais 
	 * //      FROM clientes 
	 * //      ORDER BY 1
	 * 
	 * @example
	 * // 11. UPPER con JOIN - Unir ignorando mayúsculas
	 * qb.select('u.*', 'p.nombre')
	 *   .from('usuarios', 'u')
	 *   .innerJoin('perfiles', 'p', 'UPPER(u.username) = UPPER(p.username)');
	 * // SQL: SELECT u.*, p.nombre FROM usuarios u
	 * //      INNER JOIN perfiles p ON UPPER(u.username) = UPPER(p.username)
	 * 
	 * @example
	 * // 12. UPPER en validación - Verificar formato
	 * qb.select('codigo', 'nombre')
	 *   .from('productos')
	 *   .where('codigo != UPPER(codigo)');
	 * // SQL: SELECT codigo, nombre FROM productos 
	 * //      WHERE codigo != UPPER(codigo)
	 * // Encuentra códigos que no están en mayúsculas
	 * 
	 * @see {@link lower} para convertir a minúsculas
	 * @see {@link substr} para extraer subcadenas
	 */

	/**
	 * @method lower
	 * @category String Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función SQL LOWER() (o LCASE() en algunos sistemas) para convertir
	 * una cadena de texto a minúsculas. Útil para normalizar datos, comparaciones
	 * insensibles a mayúsculas/minúsculas, y formateo de salida.
	 * 
	 * **Características principales:**
	 * - Convierte todas las letras a minúsculas
	 * - No afecta números, símbolos o espacios
	 * - Respeta caracteres Unicode en la mayoría de sistemas
	 * - NULL retorna NULL
	 * - Puede usarse en SELECT, WHERE, ORDER BY, GROUP BY
	 * - Útil para normalización de emails, usernames, códigos
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | Soporte | Unicode | Alias   | Notas |
	 * |---------------|---------|---------|---------|-------|
	 * | PostgreSQL    | ✅      | ✅      | -       | Respeta locale |
	 * | MySQL         | ✅      | ✅      | LCASE() | Según charset |
	 * | SQL Server    | ✅      | ✅      | -       | Según collation |
	 * | Oracle        | ✅      | ✅      | -       | Soporta NLS_LOWER |
	 * | SQLite        | ✅      | Limitado| -       | Solo ASCII por defecto |
	 * | MariaDB       | ✅      | ✅      | LCASE() | Igual que MySQL |
	 * 
	 * @param {sqlValue} column - La columna o expresión de texto a convertir
	 * @param {string} alias - Alias para el resultado
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. LOWER simple - Convertir email a minúsculas
	 * qb.select(qb.lower('email').as('email_normalizado'))
	 *   .from('usuarios');
	 * // SQL: SELECT LOWER(email) AS email_normalizado FROM usuarios
	 * 
	 * @example
	 * // 2. LOWER en WHERE - Comparación insensible a mayúsculas
	 * qb.select('*')
	 *   .from('usuarios')
	 *   .where("LOWER(email) = 'usuario@example.com'");
	 * // SQL: SELECT * FROM usuarios WHERE LOWER(email) = 'usuario@example.com'
	 * // Encuentra 'Usuario@Example.COM', 'USUARIO@EXAMPLE.COM', etc.
	 * 
	 * @example
	 * // 3. LOWER en INSERT - Normalizar al insertar
	 * qb.insert('usuarios')
	 *   .values({
	 *     username: 'LOWER("JuanPerez")',
	 *     email: 'LOWER("Juan.Perez@Example.COM")'
	 *   });
	 * // SQL: INSERT INTO usuarios (username, email) 
	 * //      VALUES (LOWER('JuanPerez'), LOWER('Juan.Perez@Example.COM'))
	 * // Resultado: 'juanperez', 'juan.perez@example.com'
	 * 
	 * @example
	 * // 4. LOWER en GROUP BY - Agrupar ignorando mayúsculas
	 * qb.select(qb.lower('categoria').as('categoria'), qb.count('*').as('total'))
	 *   .from('productos')
	 *   .groupBy('LOWER(categoria)');
	 * // SQL: SELECT LOWER(categoria) AS categoria, COUNT(*) AS total
	 * //      FROM productos
	 * //      GROUP BY LOWER(categoria)
	 * 
	 * @example
	 * // 5. LOWER en ORDER BY - Ordenar alfabéticamente normalizado
	 * qb.select('nombre', 'apellido')
	 *   .from('contactos')
	 *   .orderBy('LOWER(apellido) ASC, LOWER(nombre) ASC');
	 * // SQL: SELECT nombre, apellido FROM contactos 
	 * //      ORDER BY LOWER(apellido) ASC, LOWER(nombre) ASC
	 * 
	 * @example
	 * // 6. LOWER con LIKE - Búsqueda flexible
	 * qb.select('*')
	 *   .from('productos')
	 *   .where("LOWER(nombre) LIKE '%laptop%'");
	 * // SQL: SELECT * FROM productos WHERE LOWER(nombre) LIKE '%laptop%'
	 * // Encuentra 'Laptop', 'LAPTOP Gaming', 'Mi Laptop', etc.
	 * 
	 * @example
	 * // 7. LOWER con TRIM - Limpiar y normalizar
	 * qb.select(qb.lower('TRIM(email)').as('email_limpio'))
	 *   .from('usuarios');
	 * // SQL: SELECT LOWER(TRIM(email)) AS email_limpio FROM usuarios
	 * // Elimina espacios y convierte a minúsculas
	 * 
	 * @example
	 * // 8. LOWER en validación UNIQUE - Evitar duplicados
	 * qb.select('*')
	 *   .from('usuarios')
	 *   .where("LOWER(username) = LOWER('NuevoUser')")
	 *   .limit(1);
	 * // SQL: SELECT * FROM usuarios 
	 * //      WHERE LOWER(username) = LOWER('NuevoUser') 
	 * //      LIMIT 1
	 * // Verificar si username ya existe (case-insensitive)
	 * 
	 * @example
	 * // 9. LOWER con REPLACE - Normalización compleja
	 * qb.select("LOWER(REPLACE(nombre, ' ', '_')) AS slug")
	 *   .from('articulos');
	 * // SQL: SELECT LOWER(REPLACE(nombre, ' ', '_')) AS slug 
	 * //      FROM articulos
	 * // "Mi Artículo" → "mi_artículo"
	 * 
	 * @example
	 * // 10. LOWER en UPDATE - Normalizar datos existentes
	 * qb.update('usuarios')
	 *   .set('email = LOWER(email)', 'username = LOWER(username)')
	 *   .where('email != LOWER(email) OR username != LOWER(username)');
	 * // SQL: UPDATE usuarios 
	 * //      SET email = LOWER(email), username = LOWER(username)
	 * //      WHERE email != LOWER(email) OR username != LOWER(username)
	 * 
	 * @example
	 * // 11. LOWER con DISTINCT - Valores únicos normalizados
	 * qb.select('DISTINCT LOWER(dominio) AS dominio')
	 *   .from('emails')
	 *   .orderBy('1');
	 * // SQL: SELECT DISTINCT LOWER(dominio) AS dominio 
	 * //      FROM emails 
	 * //      ORDER BY 1
	 * 
	 * @example
	 * // 12. LOWER en índice funcional (comentario)
	 * qb.select('*')
	 *   .from('usuarios')
	 *   .where("LOWER(email) = 'test@example.com'");
	 * // SQL: SELECT * FROM usuarios WHERE LOWER(email) = 'test@example.com'
	 * // Nota: Crear índice: CREATE INDEX idx_email_lower ON usuarios(LOWER(email))
	 * // para mejorar rendimiento en búsquedas case-insensitive
	 * 
	 * @see {@link upper} para convertir a mayúsculas
	 * @see {@link substr} para extraer subcadenas
	 */

	/**
	 * @method substr
	 * @category String Functions
	 * @memberof QueryBuilder
	 * @description
	 * Genera la función SQL SUBSTR() o SUBSTRING() para extraer una porción de una cadena.
	 * Permite especificar la posición inicial y opcionalmente la longitud de caracteres
	 * a extraer. Útil para parsear códigos, extraer prefijos/sufijos, formatear salidas.
	 * 
	 * **Características principales:**
	 * - Extrae subcadena desde una posición específica
	 * - Longitud opcional (si se omite, extrae hasta el final)
	 * - Posición puede ser positiva o negativa (desde el final)
	 * - NULL retorna NULL
	 * - Puede usarse en SELECT, WHERE, ORDER BY
	 * - Soporta expresiones como entrada
	 * 
	 * **Compatibilidad:**
	 * | Base de Datos | SUBSTR | SUBSTRING | Pos. Negativa | Índice Base | Notas |
	 * |---------------|--------|-----------|---------------|-------------|-------|
	 * | PostgreSQL    | ✅     | ✅        | ❌            | 1           | SUBSTRING preferido |
	 * | MySQL         | ✅     | ✅        | ✅            | 1           | Ambos soportados |
	 * | SQL Server    | ❌     | ✅        | ❌            | 1           | Solo SUBSTRING |
	 * | Oracle        | ✅     | ❌        | ✅            | 1           | Solo SUBSTR |
	 * | SQLite        | ✅     | ✅        | ❌            | 1           | Ambos soportados |
	 * | MariaDB       | ✅     | ✅        | ✅            | 1           | Igual que MySQL |
	 * 
	 * @param {sqlValue} column - La columna o expresión de texto de la que extraer
	 * @param {number} inicio - Posición inicial (base 1). Negativo cuenta desde el final
	 * @param {number} [longitud] - Número de caracteres a extraer (opcional, hasta el final si se omite)
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * 
	 * @example
	 * // 1. SUBSTR básico - Primeros 3 caracteres
	 * qb.select(qb.substr('nombre', 1, 3).as('iniciales'))
	 *   .from('usuarios');
	 * // SQL: SELECT SUBSTR(nombre, 1, 3) AS iniciales FROM usuarios
	 * // "Juan Pérez" → "Jua"
	 * 
	 * @example
	 * // 2. SUBSTR sin longitud - Desde posición hasta el final
	 * qb.select(qb.substr('codigo', 4).as('sufijo'))
	 *   .from('productos');
	 * // SQL: SELECT SUBSTR(codigo, 4) AS sufijo FROM productos
	 * // "ABC-12345" → "-12345" (desde posición 4 hasta el final)
	 * 
	 * @example
	 * // 3. SUBSTR con posición negativa - Últimos caracteres (MySQL/Oracle)
	 * qb.select(qb.substr('telefono', -4).as('extension'))
	 *   .from('contactos');
	 * // SQL: SELECT SUBSTR(telefono, -4) AS extension FROM contactos
	 * // "555-1234" → "1234" (últimos 4 caracteres)
	 * // ⚠️ No funciona en PostgreSQL/SQL Server
	 * 
	 * @example
	 * // 4. SUBSTR para extraer año de fecha como string
	 * qb.select(qb.substr('fecha::text', 1, 4).as('anio'))
	 *   .from('eventos');
	 * // SQL: SELECT SUBSTR(fecha::text, 1, 4) AS anio FROM eventos
	 * // "2024-05-15" → "2024"
	 * 
	 * @example
	 * // 5. SUBSTR en WHERE - Buscar por prefijo
	 * qb.select('*')
	 *   .from('productos')
	 *   .where("SUBSTR(codigo, 1, 3) = 'ABC'");
	 * // SQL: SELECT * FROM productos WHERE SUBSTR(codigo, 1, 3) = 'ABC'
	 * // Productos cuyo código empieza con "ABC"
	 * 
	 * @example
	 * // 6. SUBSTR con GROUP BY - Agrupar por prefijo
	 * qb.select(qb.substr('codigo', 1, 2).as('categoria'), qb.count('*').as('total'))
	 *   .from('articulos')
	 *   .groupBy('SUBSTR(codigo, 1, 2)');
	 * // SQL: SELECT SUBSTR(codigo, 1, 2) AS categoria, COUNT(*) AS total
	 * //      FROM articulos
	 * //      GROUP BY SUBSTR(codigo, 1, 2)
	 * 
	 * @example
	 * // 7. SUBSTR anidado con UPPER - Iniciales en mayúsculas
	 * qb.select("UPPER(SUBSTR(nombre, 1, 1)) || UPPER(SUBSTR(apellido, 1, 1)) AS iniciales")
	 *   .from('empleados');
	 * // SQL: SELECT UPPER(SUBSTR(nombre, 1, 1)) || UPPER(SUBSTR(apellido, 1, 1)) AS iniciales
	 * //      FROM empleados
	 * // "Juan Pérez" → "JP"
	 * 
	 * @example
	 * // 8. SUBSTR para máscarar datos - Ocultar dígitos de tarjeta
	 * qb.select("'****-****-****-' || SUBSTR(tarjeta, -4) AS tarjeta_enmascarada")
	 *   .from('pagos');
	 * // SQL: SELECT '****-****-****-' || SUBSTR(tarjeta, -4) AS tarjeta_enmascarada
	 * //      FROM pagos
	 * // "1234-5678-9012-3456" → "****-****-****-3456"
	 * 
	 * @example
	 * // 9. SUBSTR con CASE - Extracción condicional
	 * qb.select(`
	 *   CASE 
	 *     WHEN LENGTH(descripcion) > 50 
	 *     THEN SUBSTR(descripcion, 1, 50) || '...' 
	 *     ELSE descripcion 
	 *   END AS resumen
	 * `).from('articulos');
	 * // SQL: Truncar descripciones largas con elipsis
	 * 
	 * @example
	 * // 10. SUBSTR para parsing - Extraer dominio de email
	 * qb.select(qb.substr("email, POSITION('@' IN email) + 1").as('dominio'))
	 *   .from('usuarios');
	 * // SQL: SELECT SUBSTR(email, POSITION('@' IN email) + 1) AS dominio
	 * //      FROM usuarios
	 * // "usuario@example.com" → "example.com"
	 * 
	 * @example
	 * // 11. SUBSTR en ORDER BY - Ordenar por sufijo
	 * qb.select('codigo', 'nombre')
	 *   .from('productos')
	 *   .orderBy('SUBSTR(codigo, 4) ASC');
	 * // SQL: SELECT codigo, nombre FROM productos 
	 * //      ORDER BY SUBSTR(codigo, 4) ASC
	 * 
	 * @example
	 * // 12. SUBSTR con LENGTH - Extraer caracteres del medio
	 * qb.select("SUBSTR(nombre, 3, LENGTH(nombre) - 4) AS medio")
	 *   .from('palabras');
	 * // SQL: SELECT SUBSTR(nombre, 3, LENGTH(nombre) - 4) AS medio
	 * //      FROM palabras
	 * // "Hola" → "ol" (quita primer y último carácter)
	 * 
	 * @see {@link upper} para convertir resultado a mayúsculas
	 * @see {@link lower} para convertir resultado a minúsculas
	 */
	substr(column, inicio, ...options) {
		const next = options.pop();
		return this.toNext([
			this.language.substr(column, inicio, ...options),
			next,
		]);
	}

	/**
	 * @method case
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Crea una expresión SQL CASE para evaluaciones condicionales.
	 * Permite definir múltiples condiciones y resultados, con un caso por defecto opcional.
	 * Útil para lógica condicional directamente en consultas SQL.
	 * Sintaxis:
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - columna
	 * @param {Array<column,string>} casos - [condicion, resultado]
	 * @param {string} defecto - Caso else
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * // Expresión CASE simple
	 * qb.case('status', [
	 *   [1, 'Active'],
	 *   [0, 'Inactive']
	 * ], 'Unknown'); // CASE status WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' ELSE 'Unknown' END
	 * 
	 * // Using Column objects
	 * qb.case(column('status'), [
	 *   [1, 'Active'],
	 *   [0, 'Inactive']
	 * ], 'Unknown'); // CASE status WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' ELSE 'Unknown' END
	 * 
	 * // Complex conditions
	 * qb.case(null, [
	 *   [qb.eq('age', 18), 'Adult'],
	 *   [qb.lt('age', 18), 'Minor']
	 * ], 'Unknown'); // CASE WHEN age = 18 THEN 'Adult' WHEN age < 18 THEN 'Minor' ELSE 'Unknown' END
	 */
	case(column, casos, defecto, next) {
		const response = this.language.case(column, casos, defecto, next);
		return this.toNext([response, next]);
	}

	/**
	 * @method functionDate
	 * @category General
	 * @memberof QueryBuilder
	 * @description
	 * Crea métodos para funciones comunes de fecha y hora en SQL.
	 * Genera funciones como CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP, LOCALTIME, LOCALTIMESTAMP.
	 * Útil para obtener marcas de tiempo y fechas actuales en consultas SQL.
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * qb.currentDate(); // CURRENT_DATE
	 * qb.currentTime(); // CURRENT_TIME
	 * qb.currentTimestamp(); // CURRENT_TIMESTAMP
	 * qb.localTime(); // LOCALTIME
	 * qb.localTimestamp(); // LOCALTIMESTAMP

	 */
	/**
	 * @method currentDate
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * @example
	 * qb.currentDate(); // CURRENT_DATE
	 */
	/**
	 * @method currentTime
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * @example
	 * qb.currentTime(); // CURRENT_TIME
	 */
	/**
	 * @method currentTimestamp
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * @example
	 * qb.currentTimestamp(); // CURRENT_TIMESTAMP
	 */
	/**
	 * @method localTime
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * @example
	 * qb.localTime(); // LOCALTIME
	 */
	/**
	 * @method localTimestamp
	 * @returns {next} Objeto QueryBuilder para encadenar comandos
	 * @example
	 * qb.localTimestamp(); // LOCALTIMESTAMP
	 */
	functionDate() {
		const names = [
			"currentDate",
			"currentTime",
			"currentTimestamp",
			"localTime",
			"localTimestamp",
		];
		for (const name of names) {
			this[name] = (next) => this.toNext([this.language[name](), next], ";");
		}
	}

	/**
	 * @method createCursor
	 * @category DDL
	 * @memberof QueryBuilder
	 * @description
	 * Crea un nuevo cursor para la consulta actual.
	 * @param {string} name - Nombre del cursor
	 * @param {Expresion} expresion - Expresión SQL para el cursor
	 * @param {createCursorOptions} options - Opciones adicionales para el cursor
	 * @returns {next} Objeto pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example
	 * qb.createCursor('myCursor', 'SELECT * FROM users', {});
	 * // Resultado: DECLARE myCursor CURSOR FOR SELECT * FROM users;
	 */
	createCursor(name, expresion, options, next) {
		try {
			this.cursores[name] = new Cursor(name, expresion, options, this, next);
			this.toNext([this.cursores[name].toString(), next]);
			return this.cursores[name];
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * @method openCursor
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * Abre un cursor existente.
	 * @param {string} name - Nombre del cursor
	 * @returns {next} Objeto pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando el cursor no existe o no se puede abrir
	 * @example
	 * qb.openCursor('myCursor');
	 */
	openCursor(name, next) {
		try {
			this.cursores[name].open();
			return this.cursores[name];
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * @method closeCursor
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * Cierra un cursor existente.
	 * @param {string} name - Nombre del cursor
	 * @returns {next} Objeto pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando el cursor no existe o no se puede cerrar
	 * @example
	 * qb.closeCursor('myCursor', {});
	 */
	closeCursor(name, next) {
		try {
			this.cursores[name].close(next);
			return this.cursores[name];
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method setTransaction
	 * @category Transactions
	 * @memberof QueryBuilder
	 * @description
	 * Crea una nueva transacción para agrupar múltiples operaciones SQL.
	 * Permite iniciar, confirmar o revertir transacciones.
	 * @param {transactionOptions} [options] - Opciones para la transacción
	 * @returns {Transaction} - Objeto Transaction para manejar la transacción
	 * @example
	 * const transaction = qb.setTransaction({ isolationLevel: 'SERIALIZABLE' });
	 */
	setTransaction(options) {
		const transaction = new Transaction(this, options);
		transaction.setUpTransaction();
		return transaction;
	}
	/**
	 * @method setConstraints
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @description
	 * Establece el modo de verificación de restricciones en una transacción.
	 * Controla cuándo se verifican las restricciones de integridad (DEFERRED o IMMEDIATE).
	 * Solo afecta a restricciones declaradas como DEFERRABLE.
	 * @param {constraintNames} restrictions - Nombre(s) de las restricciones a configurar, o 'ALL' para todas
	 * @param {constraintMode} type - Modo de verificación: 'DEFERRED' o 'IMMEDIATE'
	 * @returns {next} Objeto pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example

	 * // Diferir verificación de restricciones específicas
	 * qb.setConstraints(['fk_usuario_rol', 'fk_rol_permiso'], 'DEFERRED');

	 */
	setConstraints(restrictions, type, next) {
		try {
			const response = this.language.setConstraints(restrictions, type);
			return this.toNext([response, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * @method queryJoin
	 * @category DQL
	 * @memberof QueryBuilder
	 * @async
	 * @private
	 * @param {Object} [options] - Opciones para la unión
	 * @param {string} [options.as] - Tipo de consulta ('subselect' para subconsultas)
	 * @returns {Promise<string>} - String con la consulta SQL resultante
	 * @description
	 * Une las partes de la consulta y devuelve la representación SQL completa.
	 * Maneja errores y formatea la consulta según las opciones proporcionadas.
	 * @throws {Error} Cuando la promesa de la consulta contiene un error
	 * @example

	 * const sql = await qb.select('*').from('users').where('active = 1').queryJoin();
	 */
	async queryJoin(options) {
		let joinQuery = await this.promise;
		log(["QB", "queryJoin"], "Promesa resuelta", joinQuery);
		if (joinQuery?.error) {
			throw new Error(joinQuery.error);
		}
		if (Array.isArray(joinQuery.q)) {
			joinQuery = joinQuery.q.join("\n");
			if (/^(subselect)$/i.test(options?.as) === false) {
				joinQuery = joinQuery.concat(";").replace(";;", ";");
			}
			joinQuery = joinQuery.replaceAll("\n\n", "\n");
			log(["QB", "queryJoin"], "devuelve\n%s", joinQuery);
		} else {
			log(["QB", "queryJoin"], "No es un array ", joinQuery.q);
		}
		return joinQuery;
	}

	/**
	 * @method dropQuery
	 * @category DDL
	 * @memberof QueryBuilder
	 * @private
	 * @description
	 * Reinicia el estado actual de la consulta.
	 * Limpia la promesa y prepara para una nueva consulta.
	 * @returns {next} Instancia de QueryBuilder para encadenamiento
	 * @example

	 * // Después de ejecutar una consulta, reiniciar para una nueva
	 * await qb.select('*').from('users').where('active = 1').execute();
	 * qb.dropQuery();

	 */
	dropQuery() {
		this.promise = Promise.resolve({});
		return this.toNext([this.promise, {}]);
	}

	/**
	 * @method toString
	 * @category Predicates
	 * @memberof QueryBuilder
	 * @async
	 * @description
	 * Genera la cadena de consulta SQL completa desde la consulta construida
	 * Útil para depuración, registro, copia, etc. del comando SQL final
	 * @param {Object} [options] - Opciones de formato para la salida
	 * @param {string} [options.as] - Tipo de consulta ('subselect' para subconsultas)
	 * @returns {Promise<string>} La cadena de consulta SQL completa
	 * @example

	 * // Construir y obtener cadena de consulta
	 * const sql = await qb.select('*').from('users').where('active = 1').toString();
	 * console.log(sql); // "SELECT * FROM users WHERE active = 1"
	 * 
	 * // Consulta compleja con joins
	 * const complexSql = await qb
	 *   .select(['u.name', 'p.title'])
	 *   .from('users', 'u')
	 *   .join('posts', 'p', 'u.id = p.user_id')
	 *   .where('u.active = 1')
	 *   .toString();

	 */
	//toString function on Object QueryBuilder
	async toString(options) {
		const joinQuery = await this.queryJoin(options);
		this.dropQuery();
		return joinQuery;
	}
	/**
	 * @method execute
	 * @category General
	 * @memberof QueryBuilder
	 * @async
	 * @description
	 * Ejecuta la consulta construida contra el controlador de base de datos configurado
	 * Envía la consulta a la base de datos y retorna resultados o errores
	 * Si testOnly es true, retorna la cadena de consulta sin ejecutar
	 * @param {boolean} [testOnly=false] - Si es true, retorna la cadena de consulta sin ejecutar
	 * @returns {Promise<QueryBuilder>} Instancia de QueryBuilder con resultados o errores
	 * @throws {Error} Cuando no hay controlador de base de datos configurado
	 * @example

	 * // Ejecutar consulta y obtener resultados
	 * const result = await qb.select('*').from('users').where('active = 1').execute();

	 */
	async execute(testOnly = false) {
		if (testOnly) {
			return await this.toString();
		}
		if (!this.driverDB) {
			throw new Error("No ha establecido un driver.");
		}

		try {
			const joinQuery = await this.queryJoin(); // Espera a que la promesa se resuelva y obtén la consulta SQL completa
			log(["QB", "execute"], "Ejecutar\n%s\n==========", joinQuery);
			await this.driverDB.execute(joinQuery); // Delega la ejecución al driver y espera la respuesta
			this.result = this.driverDB.response(); // Obtiene la respuesta del driver y la asigna a result
			this.error = undefined; // Limpia cualquier error previo
			return this;
		} catch (error) {
			log(["QB", "execute"], "Se ha producido un error", error.message);
			this.error = error.message;
			this.result = undefined;
			this.dropQuery();
			return this;
		}
	}

	/**
	 * Establece o obtiene el resultado de la última consulta ejecutada
	 * @type {*}
	 */
	set result(value) {
		this.queryResult = value;
	}

	/**
	 * Obtiene el resultado de la última consulta ejecutada
	 * @type {*}
	 * @returns {*} El resultado de la ejecución de la consulta
	 */
	get result() {
		return this.queryResult;
	}

	/**
	 * Obtiene el error de la última consulta ejecutada
	 * @type {string|undefined}
	 * @returns {string|undefined} El mensaje de error si existe
	 */
	get error() {
		return this.queryResultError;
	}

	/**
	 * Establece el error de la consulta. Si no está en modo TEST, lanza una excepción
	 * @type {string}
	 * @throws {Error} Lanza el error si no está en modo TEST
	 */
	set error(error) {
		this.queryResultError = error;
		if (!/^(TEST)$/i.test(this.options?.mode)) {
			throw new Error(this.queryResultError);
		}
	}

	// ✅ 2. Funciones String Avanzadas

	/**
	 * Concatena múltiples columnas o valores en una sola cadena
	 * @method concat
	 * @param {columnName|Array<columnName>} columns - Columnas o valores a concatenar (string, Column o array de ambos)
	 * @param {alias} [alias] - Alias opcional para el resultado
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * // Con strings
	 * qb.select().concat(['nombre', 'apellido'], 'nombre_completo')
	 * // SQL: SELECT CONCAT(nombre, apellido) AS nombre_completo
	 * 
	 * @example
	 * // Con objetos Column
	 * const col1 = new Column('nombre');
	 * const col2 = new Column('apellido');
	 * qb.select().concat([col1, col2], 'nombre_completo')
	 */
	concat(columns, alias, next) {
		try {
			const command = this.language.concat(columns, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Retorna el primer valor no nulo de una lista de expresiones
	 * @method coalesce
	 * @param {columnName|Array<columnName>} columns - Lista de columnas o valores a evaluar (string, Column o array de ambos)
	 * @param {alias} [alias] - Alias opcional para el resultado
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * // Con strings
	 * qb.select().coalesce(['email_principal', 'email_secundario', '"sin_email"'], 'email')
	 * // SQL: SELECT COALESCE(email_principal, email_secundario, 'sin_email') AS email
	 * 
	 * @example
	 * // Con objetos Column
	 * const emailPrimario = new Column('email_principal');
	 * const emailSecundario = new Column('email_secundario');
	 * qb.select().coalesce([emailPrimario, emailSecundario], 'email')
	 */
	coalesce(columns, alias, next) {
		try {
			const command = this.language.coalesce(columns, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Retorna NULL si las dos expresiones son iguales, de lo contrario retorna la primera expresión
	 * @method nullif
	 * @param {columnName} expr1 - Primera expresión a comparar (string o Column)
	 * @param {columnName} expr2 - Segunda expresión a comparar (string o Column)
	 * @param {alias} [alias] - Alias opcional para el resultado
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * // Con strings
	 * qb.select().nullif('cantidad', '0', 'cantidad_valida')
	 * 
	 * @example
	 * // Con objetos Column
	 * const cantidad = new Column('cantidad');
	 * qb.select().nullif(cantidad, '0', 'cantidad_valida')
	 */
	nullif(expr1, expr2, alias, next) {
		try {
			const command = this.language.nullif(expr1, expr2, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// ✅ 3. Funciones CASE mejoradas

	/**
	 * Inicia una cláusula WHEN en una expresión CASE
	 * @method when
	 * @param {string} condition - Condición a evaluar
	 * @param {string} result - Resultado si la condición es verdadera
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().case('estado').when('A', 'Activo').when('I', 'Inactivo').else('Desconocido').end('estado_desc')
	 */
	when(condition, result, next) {
		try {
			const command = this.language.when(condition, result, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Especifica el resultado de una condición WHEN en una expresión CASE
	 * @method then
	 * @param {string} result - Resultado cuando la condición es verdadera
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().case().when('precio > 100').then('Caro').when('precio > 50').then('Medio').else('Barato').end()
	 */
	then(result, next) {
		try {
			const command = this.language.then(result, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Define el valor por defecto en una expresión CASE cuando ninguna condición es verdadera
	 * @method else
	 * @param {string} defaultValue - Valor por defecto a retornar
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().case('tipo').when('1', 'Tipo A').when('2', 'Tipo B').else('Otro tipo').end('tipo_desc')
	 */
	else(defaultValue, next) {
		try {
			const command = this.language.else(defaultValue, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Finaliza una expresión CASE
	 * @method end
	 * @param {alias} [alias] - Alias opcional para el resultado de la expresión CASE
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().case('categoria').when('A', 'Alta').when('B', 'Media').else('Baja').end('categoria_nombre')
	 */
	end(alias, next) {
		try {
			const command = this.language.end(alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// ✅ 4. Funciones de Cursor mejoradas

	/**
	 * Obtiene la siguiente fila de un cursor SQL y la asigna a variables
	 * @method fetch
	 * @param {string} cursorName - Nombre del cursor del cual obtener datos
	 * @param {string|Array<string>} variables - Variable o lista de variables donde almacenar los valores
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.fetch('mi_cursor', ['@nombre', '@edad', '@ciudad'])
	 */
	fetch(cursorName, variables, next) {
		try {
			const command = this.language.fetch(cursorName, variables, next);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// ✅ 5. Función getAccount para manejo de usuarios

	/**
	 * Obtiene la especificación de cuenta de usuario en formato 'usuario@host'
	 * @method getAccount
	 * @param {userSpec} userSpec - Especificación del usuario (string simple, 'usuario@host', u objeto con user/host)
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * // String simple
	 * qb.getAccount('miusuario')
	 * 
	 * @example
	 * // Con host específico
	 * qb.getAccount('admin@localhost')
	 * 
	 * @example
	 * // Objeto con propiedades
	 * qb.getAccount({ user: 'readonly', host: '192.168.1.%' })
	 */
	getAccount(userSpec, next) {
		try {
			const command = this.language.getAccount(userSpec, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// ✅ 6. Funciones adicionales útiles

	/**
	 * Elimina espacios en blanco (u otros caracteres) del inicio y final de una cadena
	 * @method trim
	 * @param {string} column - Columna o expresión a procesar
	 * @param {string} [chars] - Caracteres a eliminar (opcional, por defecto espacios en blanco)
	 * @param {alias} [alias] - Alias para el resultado
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().trim('nombre', null, 'nombre_limpio')
	 */
	trim(column, chars, alias, next) {
		try {
			const command = this.language.trim(column, chars, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Elimina espacios en blanco (u otros caracteres) del inicio de una cadena
	 * @method ltrim
	 * @param {string} column - Columna o expresión a procesar
	 * @param {string} [chars] - Caracteres a eliminar (opcional, por defecto espacios en blanco)
	 * @param {alias} [alias] - Alias para el resultado
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().ltrim('codigo', '0', 'codigo_sin_ceros')
	 */
	ltrim(column, chars, alias, next) {
		try {
			const command = this.language.ltrim(column, chars, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Elimina espacios en blanco (u otros caracteres) del final de una cadena
	 * @method rtrim
	 * @param {string} column - Columna o expresión a procesar
	 * @param {string} [chars] - Caracteres a eliminar (opcional, por defecto espacios en blanco)
	 * @param {alias} [alias] - Alias para el resultado
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().rtrim('descripcion', null, 'descripcion_limpia')
	 */
	rtrim(column, chars, alias, next) {
		try {
			const command = this.language.rtrim(column, chars, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	/**
	 * Retorna la longitud de una cadena en número de caracteres
	 * @method length
	 * @param {string} column - Columna o expresión de la cual obtener la longitud
	 * @param {alias} [alias] - Alias para el resultado
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.select().length('nombre', 'longitud_nombre')
	 */
	length(column, alias, next) {
		try {
			const command = this.language.length(column, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// ✅ 7. Agregar método insertInto como alias de insert

	/**
	 * Alias de insert() - Inserta datos en una tabla
	 * @method insertInto
	 * @param {string} table - Nombre de la tabla donde insertar
	 * @param {Object|Array<Object>} values - Valores a insertar (objeto o array de objetos)
	 * @param {Array<string>} [cols] - Columnas específicas (opcional, se infiere de values)
	 * @returns {next} Objeto next para encadenar operaciones
	 * @example
	 * qb.insertInto('usuarios', { nombre: 'Juan', edad: 30 })
	 * 
	 * @see {@link QueryBuilder#insert} - Método original
	 */
	insertInto(table, values, cols, next) {
		return this.insert(table, values, cols, next);
	}

	// ✅ 8. Mejorar manejo de LIMIT con OFFSET

	/**
	 * Aplica límite y desplazamiento a una consulta SELECT en una sola operación
	 * @method limitOffset
	 * @param {number} limit - Número máximo de filas a retornar (debe ser entero positivo)
	 * @param {number} offset - Número de filas a saltar (debe ser entero no negativo)
	 * @returns {next} Objeto next para encadenar operaciones
	 * @throws {Error} Si limit no es un entero positivo
	 * @throws {Error} Si offset no es un entero no negativo
	 * @example
	 * // Página 2 de resultados, 10 por página
	 * qb.select('*').from('productos').limitOffset(10, 10)
	 * 
	 * @example
	 * // Primeros 20 resultados
	 * qb.select('*').from('usuarios').limitOffset(20, 0)
	 */
	limitOffset(limit, offset, next) {
		try {
			if (!Number.isInteger(limit) || limit <= 0) {
				throw new Error("LIMIT debe ser un entero positivo");
			}
			if (!Number.isInteger(offset) || offset < 0) {
				throw new Error("OFFSET debe ser un entero no negativo");
			}

			const limitCmd = this.language.limit(limit);
			const offsetCmd = this.language.offset(offset);

			return this.toNext([limitCmd + " " + offsetCmd, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// ✅ 9. Función de utilidad para verificar disponibilidad de funciones

	/**
	 * Obtiene información sobre todas las funciones disponibles en esta instancia de QueryBuilder
	 * @method getAvailableFunctions
	 * @returns {availableFunctions} Objeto con información sobre funciones disponibles
	 * @description
	 * Este método es útil para:
	 * - Debugging y desarrollo
	 * - Verificar compatibilidad de funciones
	 * - Documentación dinámica
	 * - Testing y validación
	 * 
	 * Las funciones se categorizan en dos grupos:
	 * - **basic**: Funciones SQL estándar (SELECT, FROM, WHERE, JOIN, etc.)
	 * - **extended**: Funciones avanzadas (cursores, strings, utilidades, etc.)
	 * 
	 * @example
	 * const info = qb.getAvailableFunctions();
	 * console.log(`Funciones disponibles: ${info.total}`);
	 * console.log('Todas las funciones:', info.functions);
	 * 
	 * @example
	 * // Verificar disponibilidad de una función específica
	 * const info = qb.getAvailableFunctions();
	 * if (info.functions.includes('limitOffset')) {
	 *   qb.select('*').from('users').limitOffset(10, 0);
	 * }
	 * 
	 * @example
	 * // Obtener solo funciones extendidas
	 * const info = qb.getAvailableFunctions();
	 * console.log('Funciones avanzadas:', info.extended);
	 */
	getAvailableFunctions() {
		const functions = [];
		const instance = this;

		// Funciones básicas
		const basicFunctions = [
			'select', 'from', 'where', 'orderBy', 'groupBy', 'having',
			'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'in', 'between',
			'isNull', 'isNotNull', 'and', 'or', 'not', 'exists',
			'innerJoin', 'leftJoin', 'rightJoin', 'fullJoin', 'crossJoin', 'on',
			'count', 'sum', 'avg', 'min', 'max',
			'insert', 'update', 'delete', 'createTable', 'dropTable',
			'dropQuery', 'toString', 'execute'
		];

		// Funciones extendidas
		const extendedFunctions = [
			'concat', 'coalesce', 'nullif', 'when', 'then', 'else', 'end',
			'fetch', 'getAccount', 'trim', 'ltrim', 'rtrim', 'length',
			'insertInto', 'limitOffset', 'createCursor', 'openCursor', 'closeCursor',
			'setTransaction', 'setConstraints', 'queryJoin'
		];

		[...basicFunctions, ...extendedFunctions].forEach(fn => {
			if (typeof instance[fn] === 'function') {
				functions.push(fn);
			}
		});

		return {
			total: functions.length,
			functions: functions.sort(),
			basic: basicFunctions.filter(fn => typeof instance[fn] === 'function'),
			extended: extendedFunctions.filter(fn => typeof instance[fn] === 'function')
		};
	}
}

export default QueryBuilder;
