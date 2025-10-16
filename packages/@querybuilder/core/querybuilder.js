import { Types, check, isJSObject, log } from "./utils/utils.js";
import Column from "./column.js";
import Cursor from "./cursor.js";
import Transaction from "./transaction.js";
import Expresion from "./expresion.js";
import Value from "./value.js";
import Command from "./noSql/Command.js";


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
	 * @memberof QueryBuilder
	 * @description
	 * Método interno para encadenar componentes de consulta y gestionar el estado de la consulta
	 * Maneja la API fluida procesando partes de consulta y manteniendo el contexto de encadenamiento
	 * 
	 * @param {Array|QueryBuilder} data - Datos de consulta como array [value, next] o instancia QueryBuilder
	 * @param {string} [stringJoin=""] - Cadena para unir partes de consulta (ej., ";", "\n")
	 * @param {boolean} [firstCommand=false] - Si este es el primer comando en la cadena
	 * @returns {QueryBuilder} Instancia QueryBuilder para continuar el encadenamiento
	 * @private
	 * @example

	 * // Uso interno - no llamado directamente por usuarios
	 * this.toNext([command, next], ";", true);

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
	 * @memberof QueryBuilder
	 * @description
	 * Instancia y configura el Driver para la base de datos que ejecutara los comandos
	 * 
	 * @param {Driver} driverClass - Clase del controlador de base de datos (MySqlDriver, PostgreSQLDriver, etc.)
	 * @param {Object} params - Parámetros de conexión y configuración del controlador
	 * @param {QueryBuilder} qb - Instancia de QueryBuilder
	 * @returns {QueryBuilder} qb - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * import MySQL from '@querybuilder/mysql';
	 * import config from './config.js';
	 * const mysql= config.MYSQL;
	 * const qb = new QueryBuilder(MySQL);
	 * qb.driver(mysql.driver, mysql.params);

	 */
	driver(driverClass, params, qb) {
		this.driverDB = new driverClass(params);
		this.params = params;
		this.close = async () => this.driverDB.close();
		return qb;
	}

	/************************************************************************
	 * Comandos auxiliares para gestión y mantenimiento de la base de datos.
	 **************************************************************************/
	/**
	 * @method use
	 * @memberof QueryBuilder
	 * @description
	 *	Gestiona el cambio de base de datos dentro del mismo servidor (SGBD)
	 * @param {string} database - Nombre de la base de datos
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 *	Crea una base de datos dentro del servidor (SGBD)
	 *	@param {string} name - Nombre de la base de datos
	 *	@param {Object} options - Opciones para la creacion de datos
	 *	@param {object} next - Objeto recibido por el comando anterior
	 *  @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Elimina una base de datos del servidor (SGBD)
	 * @param {string} name - nombre de la base de datos
	 * @param {Object} options - Opciones
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
	 * @memberof QueryBuilder
	 * @description
	 * Crea un "esquema" o "tabla" de nombres para organizar objetos de base de datos
	 * @param {string} name - nombre del esquema
	 * @param {Object} options - Opciones
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description	
	 * Elimina un esquema de la base de datos
	 * @param {string} name - nombre del esquema
	 * @param {Object} options - Opciones
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 */
	dropSchema(name, options, next) {
		const command = this.language.dropSchema(name, options);
		return this.toNext([command, next]);
	}

	/**
	 * @method createTable
	 * @memberof QueryBuilder
	 * @description
	 * Crea una nueva tabla con el nombre y las opciones especificadas en la base de datos actual.
	 *
	 * @param {string} name - El nombre de la tabla.
	 * @param {Object} options - Opciones de configuración para la tabla.
	 * @param {Object} options.cols - Objeto donde cada clave es el nombre de la columna.
	 * @param {type|column} options.cols[].column - columna name:<string|column>
	 * @param {GLOBAL|LOCAL} [options.temporary] - GLOBAL|LOCAL.
	 * @param {PRESERVE|DELETE} [options.onCommit] - ON COMMIT PRESERVE|DELETE
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 *@method alterTable
	 * @memberof QueryBuilder
	 * @description
	 * Modifica una tabla existente
	 * @param {string} name - Nombre de la tabla
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * qb.alterTable('mytable', { addColumn: 'new_column' });

	 */
	alterTable(name, next) {
		const command = this.language.alterTable(name);
		log("alterTable", "responde con %o", command);
		return this.toNext([command, next]);
	}
	/**
	 * @method alterTableComands
	 * @memberof QueryBuilder
	 * @description
	 * Define los comandos que modifican la estructura de las columnas de la tabla actual.
	 * "addColumn" añade una columna
	 * "alterColumn" modifica una columna existente
	 * "dropColumn" elimina una columna
	 * y "addConstraint" añade una restricción
	 * Estos comandos deben ser llamados después de un "alterTable" donde se especifica la tabla a modificar.
	 * cada uno recibe tres parametros:
	 * @param {string} name - nombre de la columna
	 * @param {Object} options - opciones aplicables
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * 	qb.alterTable('mytable')
	 *   .addColumn('new_column', { type: 'VARCHAR(255)', notNull: true })
	 *   .alterColumn('existing_column', { type: 'INT' })
	 *   .dropColumn('old_column')
	 *   .addConstraint('pk_mytable', { type: 'PRIMARY KEY', columns: ['id'] });

	 **/
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
	 * @memberof QueryBuilder
	 * @description
	 * Elimina una tabla de la base de datos actual
	 * @param {string} name - nombre de la tabla
	 * @param {object} option - opciones aplicables
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * qb.dropTable('mytable', { ifExists: true });

	 */
	dropTable(name, option, next) {
		const command = this.language.dropTable(name, option);
		return this.toNext([command, next], ";");
	}
	/**
	 * @method createType
	 * @memberof QueryBuilder
	 * @description
	 * Crea un tipo definido por el usuario en la base de datos actual
	 * @param {string} name - nombre del tipo
	 * @param {object} option - opciones aplicables
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Elimina un tipo definido por el usuario
	 * @param {string} name - nombre del tipo
	 * @param {object} option - opciones aplicables
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param {object} assertion - opciones aplicables
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Permite definir tipos de datos personalizados con restricciones.
	 * Es útil para reutilizar reglas de validación en múltiples tablas sin repetir código.
	 * - SQL estándar	✅
	 * - PostgreSQL		✅
	 * - MySQL				❌
	 * @param {string} name - Nombre del dominio
	 * @param {Object} options - Opciones aplicables
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param {object} options - opciones aplicables {cols:Array<string>, as:Select, check:boolean}
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Elimina una vista creada previamente
	 * - PostgreSQL	✅
	 * - MySQL			✅
	 * @param {string} name - Nombre de la vista
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	} /********************************************************
	 * DCL
	 * Controlan el acceso y permisos en la base de datos.
	 ********************************************************/

	/**
	 * @method createRoles
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
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.admin - WITH ADMIN
	 * @param {boolean} options.ifNotExists - IF NOT EXISTS
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Elimina el rol o roles especificados de la base de datos.
	 *- PostgreSQL	✅
	 *- MySQL				✅ (Desde 8.0)
	 * @param {string|Array<string>} names - uno o varios roles a eliminar
	 * @param {?object} options - opciones aplicables
	 * @param {boolean} options.ifExists - IF EXISTS
	 * @param {boolean} options.cascade - "CASCADE"/"RESTRICT"
	 * @param {boolean} options.restrict - "RESTRICT"/"CASCADE"
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param {string|object} on - Objeto sobre el que se otorga
	 * @param {objectTypes} on.objectType - Especifica el tipo sobre el que se aplica 'types/privilevios.js'
	 * @param {"PUBLIC"|"ALL"|string|Array<string>} to - usuarios o roles a los que se otorga
	 * @param {boolean} options.withGrant - WITH GRANT OPTION
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.grantBy - GRANTED BY
	 * @param {*} options.role - rol desde el que se otorga
	 * @param {*} options.admin - true (WITH ADMIN OPTION)
	 * @param {boolean} options.cascade - "CASCADE"/"RESTRICT"
	 * @param {boolean} options.restrict - "RESTRICT"/"CASCADE"
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param {string|object} on - Objeto sobre el que se otorga
	 * @param {objectTypes} on.objectType - Especifica el tipo sobre el que se aplica 'types/privilevios.js'
	 * @param {"PUBLIC"|"ALL"|Array<string>} from - A quien se le retira
	 * @param {boolean} options.withGrant - WITH GRANT OPTION
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.grantBy - GRANTED BY
	 * @param {boolean} options.cascade - "CASCADE"/"RESTRICT"
	 * @param {boolean} options.restrict - "RESTRICT"/"CASCADE"
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Como grant pero solo para roles
	 * @param {string|Array<string>} roles - rol o roles para asignar
	 * @param {string|Array<string>} users - usuario o usuarios a los que se conceden
	 * @param {boolean} options.admin- true (WITH ADMIN OPTION)
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.granted - GRANTED BY
	 * @param {boolean} options.cascade - "CASCADE"/"RESTRICT"
	 * @param {boolean} options.restrict - "RESTRICT"/"CASCADE"
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Como revoke, pero para roles
	 * @param {string|Array<string>} roles - roles a eliminar
	 * @param {"PUBLIC"|"ALL"|Array<string>} from - A quien se le retira
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.grantBy - GRANTED BY
	 * @param {boolean} options.cascade - "CASCADE"/"RESTRICT"
	 * @param {boolean} options.restrict - "RESTRICT"/"CASCADE"
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @memberof utilidades
	 * @description
	 * Crea declaración SELECT para recuperación de datos
	 * Genera cláusula SQL SELECT con columnas y opciones especificadas
	 * SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	 * @param {string|Column|Array<string>|Array<Column>} columns - Columnas seleccionadas
	 * @param {object} options - opciones
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Comprueba en tiempo de ejecucion que los tipos de "tables" corresponden con los de "alias"
	 * y que la longitud de los arrays sea la correcta.
	 * @param {string|Array<string>} tables - tabla o lista de tablas
	 * @param {string|Array<string>} alias - alias o lista de alias
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
	 * @memberof QueryBuilder
	 * @description
	 * Especifica la tabla o vista de donde se van a obtener los datos.
	 * @param {string|Array<string>} tables - tabla o tablas de donde obtener los datos
	 * @param {string|Array<string>} alias - alias o lista de alias correspondiente a las tablas
	 * @param {object} next
	 * @returns {QueryBuilder} Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Define la condición WHERE para filtrar registros en una consulta SQL.
	 * Soporta cadenas SQL, instancias de QueryBuilder o arrays de condiciones.
	 * Filtrar registros en una consulta, seleccionando solo aquellos que cumplen con una condición específica.
	 * Es una parte esencial en las sentencias SELECT, UPDATE, DELETE, etc., ya que permite limitar los resultados
	 * o modificar solo las filas que cumplen con ciertos criterios.
	 * @param {string|QueryBuilder|Array<string|QueryBuilder>} predicados - Condiciones del WHERE (cadena, expresión QB o array)
	 * @param {object} next - Instancia de QueryBuilder para el contexto de encadenamiento de métodos
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * Define la condición "WHERE CURRENT OF" para un cursor específico.
	 * Esta cláusula se utiliza en sentencias SQL para referirse a la fila actual apuntada por un cursor.
	 * Es especialmente útil en operaciones de actualización o eliminación donde se desea modificar o eliminar
	 * la fila actual del conjunto de resultados manejado por el cursor.
	 * @param {string} cursorName - Nombre del cursor
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param {string|Array<string>} tables - tabla o lista de tablas a unir
	 * @param {string|Array<string>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * qb.joins('tabla1', 'tabla2', 'miCursor');
	 * qb.joins(['tabla1', 'tabla2'], ['t1', 't2'], 'miCursor');
	 * // Errores
	 * qb.joins('tabla1', ['t1', 't2'], 'miCursor'); // Error

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
	 * @memberof QueryBuilder
	 * @description
	 * El comando USING se utiliza en SQL para especificar las columnas que se van a utilizar para combinar dos tablas en una operación JOIN.
	 * A diferencia de la cláusula ON, que requiere una condición explícita, USING simplifica la sintaxis al asumir que las columnas mencionadas tienen el mismo nombre en ambas tablas.
	 * Se usa principalmente en consultas SQL para especificar columnas en operaciones de JOIN.
	 * Es especialmente útil cuando las columnas que se van a combinar tienen el mismo nombre en ambas tablas.
	 * @param {string} columnsInCommon - Columna en comun
	 * @param {object} next
	 * @returns	 {QueryBuilder} Instancia de QueryBuilder para el encadenamiento de métodos
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
	 * @memberof QueryBuilder
	 * @description
	 * Especifica la condición de unión para un JOIN.
	 * Se utiliza para definir cómo se combinan las filas de dos tablas en una operación JOIN.
	 * @param {string} condition - Condición de unión
	 * @param {object} next
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Si el comando previo no es un JOIN válido
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
	 * @memberof QueryBuilder
	 * @description
	 * SQL Server	✅ Sí	Soporta ambas opciones UNION y UNION ALL.
	 * Oracle			✅ Sí	Permite UNION y UNION ALL para combinar resultados de varias consultas.
	 * SQLite			✅ Sí	Soporta UNION y UNION ALL en consultas SELECT.
	 * MongoDB	$unionWith	Permite combinar los resultados de dos colecciones en una agregación.
	 * @param  {...string|QueryBuilder} selects - Selects a unir
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Combinar los resultados de dos o más consultas SELECT.
	 * Incluyendo duplicados.
	 * @param  {...string|QueryBuilder} selects - Selects a unir por UNION ALL
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param  {...string|QueryBuilder} selects - Selects
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param  {...string|QueryBuilder} selects - Selects
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param  {...string|QueryBuilder} selects - Selects
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param  {...string|QueryBuilder} selects
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Operaciones de JOIN para especificar las condiciones de cómo se deben combinar las tablas.
	 * Define las columnas o condiciones que se deben cumplir para que filas de diferentes tablas sean combinadas.
	 * @param {string|QueryBuilder} predicado
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @param {any|QueryBuilder} a - columna o valor
	 * operadores binarios
	 * @param {any|QueryBuilder} a - columna o valor
	 * @param {any|QueryBuilder} b - columna o valor
	 * operadores ternarios
	 * @param {any|QueryBuilder} a - columna o valor
	 * @param {any|QueryBuilder} b - columna o valor
	 * @param {any|QueryBuilder} c - columna o valor
	 * logicos
	 * @param {...any|QueryBuilder} - predicados
	 *
	 * @example
	 * isNull("columna") // columna IS NULL
	 * eq("columna",20) // columna = 20
	 * between("columna",10,15) // columna BETWEEN 10 AND 15
	 * and("columna1","columna2","columna3") // columna1 AND columna2 AND columna3
	 ******************************************************************************/

	/**
	 * 
	 * @method predicados
	 * @memberof QueryBuilder
	 * @private
	 * @description 
	 * Crea dinámicamente métodos de predicado para construir condiciones WHERE
	 * Genera funciones de comparación, lógicas y predicados específicos de SQL
	 * Crea métodos para:
	 * ne(a, b) a <> b
	 * gte(a, b) a >= b
	 * lte(a, b) a <= b
	 * eq(a, b) a = b
	 * gt(a, b) a > b
	 * lt(a, b) a < b
	 * and(...predicates) a AND b AND c
	 * not(...predicates) NOT a
	 * or(...predicates) a OR b OR c
	 * between(a, b, c) a BETWEEN b AND c
	 * notBetween(a,b,c) a NOT BETWEEN b AND c
	 * isNull(a) a IS NULL
	 * isNotNull(a) a IS NOT NULL
	 * like(a, b) a LIKE b
	 * notLike(a, b) a NOT LIKE b
	 * exists(a) a EXISTS
	 * notExists(a) a NOT EXISTS
	 * any(a) a ANY
	 * some(a) a SOME
	 * all(a) a ALL
	 * These methods are available on QueryBuilder instances for building complex queries
	 * @example

	 * // Generated methods usage:
	 * qb.eq('name', 'John')     // name = 'John'
	 * qb.gt('age', 18)          // age > 18
	 * qb.between('price', 10, 100)  // price BETWEEN 10 AND 100
	 * qb.and(qb.eq('active', 1), qb.gt('age', 18))  // active = 1 AND age > 18

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
	 * @memberof QueryBuilder
	 * @description
	 * El operador IN en SQL se utiliza para comprobar si un valor está presente dentro de un conjunto de valores.
	 * Es útil cuando se necesita realizar comparaciones múltiples sin tener que escribir múltiples condiciones OR.
	 * @param {string|column} columna - nombre de la columna cuyo valor esta contenido el los valores, puede un string o un objeto Column
	 * @param  {Array<string|QueryBuilder>|...values} values - Puede ser un array o una lista de strings u objetos QueryBuilder
	 * @param {object} next - Objeto recibido por el comando anterior siempre es el ultimo parametro añadido por el Proxy
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * qb.where(in("columna1",valor1, valor2, valor3)) // WHERE columna1 IN (valor1, valor2, valor3);

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
	 * @memberof QueryBuilder
	 * @description
	 * El operador NOT IN en SQL se utiliza para filtrar registros cuyo valor NO está presente en un conjunto de valores especificados.
	 * Permite excluir múltiples valores en una sola condición, siendo la negación del operador IN.
	 * Filtrar registros cuyo valor NO está en una lista de valores o en el resultado de una subconsulta.
	 * Es la negación de IN y permite excluir múltiples valores en una sola condición.
	 * @param {string|column} columna - nombre de la columna cuyo valor no esta contenido el los valores, puede un string o un objeto Column
	 * @param  {Array<string|QueryBuilder>|...values} values
	 * @param {object} next - Objeto recibido por el comando anterior siempre es el ultimo parametro añadido por el Proxy
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * qb.where(notIn("columna1",valor1, valor2, valor3)) // WHERE columna1 NOT IN (valor1, valor2, valor3);

	 */
	notIn(columna, ...values) {
		const next = values.pop();
		const result = this.language.notIn(columna, values, next);
		return this.toNext([result, next]);
	}

	/**
	 * @method col
	 * @memberof QueryBuilder
	 * @description
	 * Crea una instancia de Column para referenciar columnas en consultas SQL.
	 * Permite especificar el nombre de la columna y opcionalmente el nombre o alias de la tabla.
	 * Facilita la construcción de consultas SQL tipadas y con contexto de tabla.
	 * @param {string|QueryBuilder|Expresion} name - Puede ser el nombre de la columna, una subconsulta o una expresion
	 * @param {string} [table] - Nombre de la tabla o alias para la columna
	 * @returns {Column} Instancia de Column para su uso en consultas
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example

	 * // Referencia simple de columna
	 * const userCol = qb.col('name', 'users'); // users.name
	 * 
	 * // Use in queries
	 * qb.select([qb.col('name', 'u'), qb.col('email', 'u')]) // SELECT u.name, u.email
	 *   .from('users', 'u')
	 *   .where(qb.eq(qb.col('active', 'u'), 1)); // WHERE u.active = 1
	 * // Subconsulta como columna
	 * const subQb = new QueryBuilder().select('COUNT(*)').from('orders').where(qb.eq(qb.col('user_id'), qb.col('id', 'u')));
	 * const orderCountCol = qb.col(subQb, 'u'); // (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count

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
	 * @memberof QueryBuilder
	 * @description
	 * Crea una instancia de Column con el nombre de la tabla primero y luego el nombre de la columna.
	 * Es igual a col cambiando el orden de los parametros
	 * @param {string} table - nombre de la tabla
	 * @param {string} name - nombre de la columna
	 * @returns {Column}	 Instancia de Column para su uso en consultas
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example

	 * // Referencia simple de columna
	 * const userCol = qb.coltn('users', 'name'); // users.name
	 * 
	 * // Usar en consultas
	 * qb.select([qb.coltn('u', 'name'), qb.coltn('u', 'email')]) // SELECT u.name, u.email
	 *   .from('users', 'u')
	 *   .where(qb.eq(qb.coltn('u', 'active'), 1)); // WHERE u.active = 1
	 * // Subconsulta como columna
	 * const subQb = new QueryBuilder().select('COUNT(*)').from('orders').where(qb.eq(qb.coltn('', 'user_id'), qb.coltn('u', 'id')));
	 * const orderCountCol = qb.coltn('u', subQb); // (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count

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
	 * @memberof QueryBuilder
	 * @description
	 * Crea una instancia de expresion para usar en consultas SQL.
	 * Permite incluir expresiones SQL complejas o funciones agregadas en consultas.
	 * Facilita la construcción de consultas SQL dinámicas y avanzadas.
	 * usando el metodo as() de la clase Expresion se puede asignar un alias a la expresion
	 * @param {any} expresion
	 * @returns {Expresion} expresion.value = expresion
	 * @example
	 * ´´javascript
	 * let qb = new QueryBuilder()
	 * qb.exp("count(*)") // count(*)
	 * qb.exp("count(*)").as("Total") // count(*) AS Total
	 * qb.exp("sum(*)").as("Total") // sum(*) AS Total
	 * qb.exp("avg(*)").as("Total") // avg(*) AS Total

	 */
	exp(expresion) {
		return new Expresion(expresion);
	}
	/**
	 * @method groupBy
	 * @memberof QueryBuilder
	 * @description
	 * El comando GROUP BY en SQL se utiliza para agrupar filas que tienen el mismo valor en una o más columnas,
	 * permitiendo realizar cálculos agregados (COUNT, SUM, AVG, MAX, MIN, etc.) sobre cada grupo.
	 * PostgreSQL	✅ Sí	Soporta GROUP BY con múltiples columnas y funciones agregadas.
	 * MySQL			✅ Sí	Compatible con GROUP BY, pero en versiones antiguas permitía resultados ambiguos sin ONLY_FULL_GROUP_BY.
	 * SQL Server	✅ Sí	Funciona con agregaciones y permite GROUPING SETS.
	 * Oracle			✅ Sí	Compatible y soporta extensiones como ROLLUP y CUBE.
	 * SQLite			✅ Sí	Soporta GROUP BY, pero con ciertas limitaciones en comparación con otras bases de datos.
	 * MongoDB	$group	En el pipeline de agregación, $group permite agrupar documentos y aplicar operaciones agregadas.
	 * @param {string|Array<string>|Object} columns - Una columna o varias
	 * @param {Array<Column>} columns.rollup ROLLUP ( ...column )
	 * @param {Array<Column>} columns.cube CUBE (...column )
	 * @param {*} options - opciones
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando no hay un comando SELECT previo
	 * @example

	 * qb.select('columna1, columna2, COUNT(*) as total')
	 *   .from('tabla')
	 *  .groupBy(['columna1', 'columna2']);
	 * // Resultado: SELECT columna1, columna2, COUNT(*) as total FROM tabla GROUP BY columna1, columna2;
	 * 
	 * // Usando ROLLUP
	 * qb.select('columna1, columna2, SUM(columna3) as total')
	 *   .from('tabla')
	 *   .groupBy({ rollup: [qb.col('columna1'), qb.col('columna2')] });
	 * // Resultado: SELECT columna1, columna2, SUM(columna3) as total FROM tabla GROUP BY ROLLUP (columna1, columna2);
	 * 
	 * // Usando CUBE
	 * qb.select('columna1, columna2, AVG(columna3) as promedio')
	 *   .from('tabla')
	 *   .groupBy({ cube: [qb.col('columna1'), qb.col('columna2')] });
	 * // Resultado: SELECT columna1, columna2, AVG(columna3) as promedio FROM tabla GROUP BY CUBE (columna1, columna2);

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
	 * @memberof QueryBuilder
	 * @description
	 * El comando HAVING en SQL se usa para filtrar los resultados después de aplicar GROUP BY,
	 * permitiendo restringir los grupos basados en condiciones sobre funciones agregadas
	 * (COUNT, SUM, AVG, MAX, MIN, etc.).
	 * PostgreSQL	✅ Sí	Funciona con GROUP BY para filtrar resultados agrupados.
	 * MySQL			✅ Sí	Compatible con todas las versiones, usado para restricciones en funciones agregadas.
	 * SQL Server	✅ Sí	Soporta HAVING con agregaciones y expresiones condicionales.
	 * Oracle			✅ Sí	Funciona de la misma manera que en SQL estándar.
	 * SQLite			✅ Sí	Compatible con HAVING, pero con algunas limitaciones en expresiones más avanzadas.
	 * MongoDB	$group seguido de $match.	Primero se agrupan los documentos con $group, luego se filtran los resultados con $match.
	 * @param {strict|QueryBuilder} predicado - expresion que utiliza el having
	 * @param {object} options - opciones
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando no hay un comando SELECT previo
	 * @example

	 * // Cláusula HAVING simple
	 * let qb = new QueryBuilder()
	 * qb.having(qb.and(qb.gt(qb.sum("Columna3"),100)),qb.gt(qb.count("*"),2))
	 * HAVING SUM(columna3) > 100 AND COUNT(*) > 2;
	 * 
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
	 * @memberof QueryBuilder
	 * @description
	 * El comando ORDER BY en SQL se utiliza para ordenar los resultados de una consulta según una o más columnas,
	 * en orden ascendente (ASC) o descendente (DESC).
	 * PostgreSQL	✅ Sí	Soporta ORDER BY con múltiples columnas y direcciones de ordenamiento.
	 * MySQL			✅ Sí	Permite ordenar por columnas, expresiones y alias definidos en SELECT.
	 * SQL Server	✅ Sí	Compatible con funciones como TOP y OFFSET FETCH.
	 * Oracle			✅ Sí	Soporta ORDER BY junto con ROWNUM y FETCH FIRST.
	 * SQLite			✅ Sí	Compatible, pero puede tener restricciones en combinaciones avanzadas.
	 * MongoDB	sort() o $sort	sort() se usa en consultas, y $sort en pipelines de agregación.

	 * @param {Column|Array<string>|object} columns - columna, lista de columnas o un objeto sobre la que ordenar
	 * @param {string} columns.col - columna sobre la que ordenar
	 * @param {"ASC"|"DESC"} columns.order - tipo de orden
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando no hay un comando SELECT previo
	 * @example

	 * // Ordenamiento simple
	 * qb.select('*').from('users').orderBy([{col: 'name', order: 'ASC'}]);
	 * 
	 * // Ordenamiento de múltiples columnas
	 * qb.select('*').from('users').orderBy([
	 *   {col: 'department', order: 'ASC'}, 
	 *   {col: 'salary', order: 'DESC'}
	 * ]);

	 */

	/**
	 * @method orderBy
	 * @memberof QueryBuilder
	 * @description
	 * El comando ORDER BY en SQL se utiliza para ordenar los resultados de una consulta según una o más columnas,
	 * en orden ascendente (ASC) o descendente (DESC).
	 * PostgreSQL	✅ Sí	Soporta ORDER BY con múltiples columnas y direcciones de ordenamiento.	
	 * MySQL			✅ Sí	Permite ordenar por columnas, expresiones y alias definidos en SELECT.
	 * SQL Server	✅ Sí	Compatible con funciones como TOP y OFFSET FETCH.
	 * Oracle			✅ Sí	Soporta ORDER BY junto con ROWNUM y FETCH FIRST.
	 * SQLite			✅ Sí	Compatible, pero puede tener restricciones en combinaciones avanzadas.
	 * MongoDB	sort() o $sort	sort() se usa en consultas, y $sort en pipelines de agregación.
	 * @param {Array<Object>|string} columns - Column specification(s) for ordering
	 * @param {string} columns.col - Nombre de la columna por la cual ordenar
	 * @param {"ASC"|"DESC"} columns.order - Orden de clasificación (ascendente o descendente)
	 * @param {object} next - Objeto que retorna promesa para el contexto de encadenamiento
	 * @returns {QueryBuilder} Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando se llama sin una sentencia SELECT previa
	 * @example

	 * // Ordenamiento simple
	 * qb.select('*').from('users').orderBy([{col: 'name', order: 'ASC'}]);
	 * 
	 * // Ordenamiento de múltiples columnas
	 * qb.select('*').from('users').orderBy([
	 *   {col: 'department', order: 'ASC'}, 
	 *   {col: 'salary', order: 'DESC'}
	 * ]);

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
	 * @memberof QueryBuilder
	 * @description
	 * Se usa para restringir la cantidad de filas devueltas por una consulta.
	 * Es útil para paginación y optimización de rendimiento cuando solo se necesitan un número específico de registros.
	 * PostgreSQL	✅ Sí	LIMIT y OFFSET funcionan para paginación.
	 * MySQL			✅ Sí	Soporta LIMIT con OFFSET para paginación.
	 * SQL Server	❌ No	Se usa TOP n o OFFSET FETCH NEXT en su lugar.
	 * Oracle			❌ No	Usa FETCH FIRST n ROWS ONLY para limitar resultados.
	 * SQLite			✅ Sí	Compatible con LIMIT y OFFSET.
	 * MongoDB	limit(n)	Se usa junto con skip(n) para paginación, similar a LIMIT ... OFFSET.
	 * @param {number} limit - numero de elementos a mostrar
	 * @param {object} next - objeto para el contexto de encadenamiento
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando limit no es un entero positivo o no existe una instrucción SELECT
	 * @example

	 * // Obtener los primeros 10 usuarios
	 * qb.select('*').from('users').limit(10);
	 * // Resultado: SELECT * FROM users LIMIT 10;

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
	 * @memberof QueryBuilder
	 * @description
	 * Se usa para omitir un número específico de filas antes de comenzar a devolver resultados.
	 * Se suele combinar con LIMIT para implementar paginación.
	 * PostgreSQL	✅ Sí	OFFSET y LIMIT permiten paginación eficiente.
	 * MySQL			✅ Sí	Se usa LIMIT ... OFFSET.
	 * SQL Server	✅ Sí	Usa OFFSET ... FETCH NEXT para paginación.
	 * Oracle			✅ Sí	Usa OFFSET ... FETCH NEXT en lugar de LIMIT.
	 * SQLite			✅ Sí	Compatible con LIMIT y OFFSET.
	 * MongoDB	skip(n)	Se usa junto con limit(n) para paginación, similar a OFFSET ... LIMIT.
	 * @param {number} offset - numero de filas que se deben omitir
	 * @param {object} next - objeto para el contexto de encadenamiento
	 * @throws {Error} Cuando offset no es un entero positivo o no existe una instrucción SELECT
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * // Obtener los usuarios a partir del usuario 21
	 * qb.select('*').from('users').offset(20);
	 * // Resultado: SELECT * FROM users OFFSET 20;

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
	 * @memberof QueryBuilder
	 * @description
	 * Inserta datos en una tabla especificada.
	 * Crea una instrucción INSERT INTO con valores y especificación opcional de columnas.
	 * Se usa para agregar nuevas filas en una tabla.
	 * Puede insertar valores manualmente o desde el resultado de otra consulta.
	 * PostgreSQL	✅ Sí	Soporta INSERT ... RETURNING para obtener valores insertados.
	 * MySQL			✅ Sí	Permite INSERT IGNORE y ON DUPLICATE KEY UPDATE para manejar duplicados.
	 * SQL Server	✅ Sí	Compatible con INSERT INTO ... OUTPUT.
	 * Oracle			✅ Sí	Usa INSERT ... RETURNING INTO para recuperar valores insertados.
	 * SQLite			✅ Sí	Admite INSERT OR REPLACE y INSERT OR IGNORE.
	 * MongoDB	insertOne(), insertMany()	insertOne() agrega un solo documento, insertMany() varios a la vez.
	 * @param {string} table - nombre de la tabla
	 * @param {array<array<Value>>} values - Array de Arrays con los valores
	 * @param {array<Column>} cols - columnas correspondientes al orden de los valores o vacio para el orden por defecto
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example

	 * // Inserción simple
	 * await qb.insert('users', [
	 *   ['Alice', 'alice@example.com'],
	 *   ['Bob', 'bob@example.com']
	 * ]);
	 * // Inserción con columnas especificadas
	 * await qb.insert('users', [
	 *   ['Charlie', 'charlie@example.com']
	 * ], ['name', 'email']);

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

	// Tiene sentido que update sea asincrona cuando devuelve un texto?

	/**
	 * @method update
	 * @memberof QueryBuilder
	 * @description
	 * Crea la sentencia UPDATE con cláusula SET para la tabla especificada
	 * @param {string} table - Nombre de la tabla objetivo para actualizar
	 * @param {Object} sets - Objeto con pares columna-valor para actualizar
	 * @param {object} next - Objeto que retorna promesa para el contexto de encadenamiento
	 * @returns {Promise<QueryBuilder>} Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example

	 * // Actualización simple
	 * qb.update('users', { status: 'active', last_login: new Date() })
	 *         .where('id = 1')
	 *			 .toString(); // UPDATE users SET status = 'active', last_login = '2023-10-05 12:34:56' WHERE id = 1;
	 * 
	 * // Actualizar con condiciones
	 * qb.update('products', { price: 19.99, discount: 10 })
	 *         .where('category = "electronics"')
	 *         .toString(); // UPDATE products SET price = 19.99, discount = 10 WHERE category = 'electronics';

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
	 * @memberof QueryBuilder
	 * @description
	 * Crea la sentencia DELETE FROM para eliminar datos
	 * @param {string} from - Nombre de la tabla de la cual eliminar registros
	 * @param {object} next - Objeto que retorna promesa para el contexto de encadenamiento
	 * @returns {QueryBuilder} Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * // Eliminar registros específicos
	 * qb.delete('users')
	 *         .where('active = 0')
	 *         .toString(); // DELETE FROM users WHERE active = 0;
	 * 
	 * // Eliminar con condiciones complejas
	 * qb.delete('logs')
	 *         .where('created_at < "2023-01-01"')
	 *         .toString(); // DELETE FROM logs WHERE created_at < '2023-01-01';

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
	* @memberof QueryBuilder
	* @private
	* @description Crea métodos para funciones SQL comunes que toman un parámetro
	* Crea dinámicamente funciones agregadas y escalares con un solo parámetro
	* Genera funciones SQL como COUNT, MAX, MIN, SUM, AVG, UPPER, LOWER
	* @param {string|Column} funcion - argumento o columna sobre la que opera la función SQL
	* @param {string} alias - nombre AS
	* @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @example

	 * // Uso de funciones generadas:
	 * qb.count('*')           // COUNT(*)
	 * qb.max('salary')        // MAX(salary)
	 * qb.min('age')           // MIN(age)
	 * qb.sum('amount')        // SUM(amount)
	 * qb.avg('score')         // AVG(score)
	 * qb.upper('name')        // UPPER(name)
	 * qb.lower('email')       // LOWER(email)

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
		 * @method substr
		 * @memberof QueryBuilder
		 * @description
		 * Crea una función SQL SUBSTR para extraer una subcadena de una cadena dada.
		 * Permite especificar la columna, posición inicial y longitud opcional de la subcadena.
		 * Útil para manipulación de cadenas en consultas SQL.
		 * @param {string|Column} column - columna sobre la que se aplica la función
		 * @param {number} inicio - posición inicial de la subcadena
		 * @param {number} [longitud] - longitud de la subcadena (opcional)
		 * @param {object} next - objeto recibido por el comando anterior
		 * @returns {QueryBuilder} - objeto QueryBuilder pasado al siguiente comando para encadenar
		 * @example
	
		 * qb.substr('nombre', 1, 3) // SUBSTR(nombre, 1, 3)
	
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
	 * @memberof QueryBuilder
	 * @description
	 * Crea un nuevo cursor para la consulta actual.
	 * @param {string} name - Nombre del cursor
	 * @param {string} expresion - Expresión SQL para el cursor
	 * @param {object} options - Opciones adicionales para el cursor
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example

	 * qb.createCursor('myCursor', 'SELECT * FROM users', {}, {});
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
	 * @memberof QueryBuilder
	 * @description
	 * Abre un cursor existente.
	 * @param {string} name - Nombre del cursor
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando el cursor no existe o no se puede abrir
	 * @example

	 * qb.openCursor('myCursor', {});

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
	 * @memberof QueryBuilder
	 * @description
	 * Cierra un cursor existente.
	 * @param {string} name - Nombre del cursor
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
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
	 * @memberof QueryBuilder
	 * @description
	 * Crea una nueva transacción para agrupar múltiples operaciones SQL.
	 * Permite iniciar, confirmar o revertir transacciones.
	 * @param {object} options - Opciones para la transacción
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
	 * @memberof QueryBuilder
	 * @description
	 * Establece restricciones o reglas en la base de datos.
	 * Permite definir restricciones como UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, etc.
	 * @param {Array<Object>} restrictions - Array de objetos que definen las restricciones
	 * @param {string} type - Tipo de restricción (e.g., 'UNIQUE', 'PRIMARY KEY', etc.)
	 * @param {object} next - Objeto recibido por el comando anterior
	 * @returns {QueryBuilder} - Objeto QueryBuilder pasado al siguiente comando para encadenar
	 * @throws {Error} Cuando los parámetros no coinciden con los tipos esperados
	 * @example

	 * // Add a UNIQUE constraint
	 * qb.setConstraints([{ column: 'email' }], 'UNIQUE', {});

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
	 * @memberof QueryBuilder
	 * @async
	 * @private
	 * @param {Object} options - Opciones para la unión
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
	 * @memberof QueryBuilder
	 * @private
	 * @description
	 * Reinicia el estado actual de la consulta.
	 * Limpia la promesa y prepara para una nueva consulta.
	 * @returns {QueryBuilder} Instancia de QueryBuilder para encadenamiento
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
	 * @memberof QueryBuilder
	 * @async
	 * @description
	 * Genera la cadena de consulta SQL completa desde la consulta construida
	 * Útil para depuración, registro, copia, etc. del comando SQL final
	 * @param {Object} [options] - Opciones de formato para la salida
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
	 * 
	 * @method execute
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

	/** Getter y setter para querybuilder */

	set result(value) {
		this.queryResult = value;
	}
	get result() {
		return this.queryResult;
	}

	get error() {
		return this.queryResultError;
	}
	set error(error) {
		this.queryResultError = error;
		if (!/^(TEST)$/i.test(this.options?.mode)) {
			throw new Error(this.queryResultError);
		}
	}


	/************************************************************************
	 * 🔧 EXTENSIONES INTEGRADAS - Funciones Adicionales
	 * Estas funciones extienden la funcionalidad de QueryBuilder con 
	 * capacidades adicionales del Core que no estaban expuestas anteriormente.
	 ************************************************************************/

	// ✅ 1. Funciones de Transacciones
	startTransaction(options, next) {
		try {
			const command = this.language.startTransaction(options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	commit(next) {
		try {
			const command = this.language.commit();
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	rollback(savepoint, next) {
		try {
			const command = this.language.rollback(savepoint);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	setSavePoint(name, next) {
		try {
			const command = this.language.setSavePoint(name);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// ✅ 2. Funciones String Avanzadas
	concat(columns, alias, next) {
		try {
			const command = this.language.concat(columns, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	coalesce(columns, alias, next) {
		try {
			const command = this.language.coalesce(columns, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

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
	when(condition, result, next) {
		try {
			const command = this.language.when(condition, result, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	then(result, next) {
		try {
			const command = this.language.then(result, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	else(defaultValue, next) {
		try {
			const command = this.language.else(defaultValue, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

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
	trim(column, chars, alias, next) {
		try {
			const command = this.language.trim(column, chars, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	ltrim(column, chars, alias, next) {
		try {
			const command = this.language.ltrim(column, chars, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	rtrim(column, chars, alias, next) {
		try {
			const command = this.language.rtrim(column, chars, alias, next);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

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
	insertInto(table, values, cols, next) {
		return this.insert(table, values, cols, next);
	}

	// ✅ 8. Mejorar manejo de LIMIT con OFFSET
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
			'dropQuery', 'toString'
		];

		// Funciones extendidas
		const extendedFunctions = [
			'startTransaction', 'commit', 'rollback', 'setSavePoint',
			'concat', 'coalesce', 'nullif', 'when', 'then', 'else', 'end',
			'fetch', 'getAccount', 'trim', 'ltrim', 'rtrim', 'length',
			'insertInto', 'limitOffset'
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
// Exportaciones
export default QueryBuilder;
export { QueryBuilder };
