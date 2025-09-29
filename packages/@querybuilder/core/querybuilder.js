import { Types, check, isJSObject, log } from "./utils/utils.js";
import Column from "./column.js";
import Cursor from "./cursor.js";
import Transaction from "./transaction.js";
import Expresion from "./expresion.js";
import Value from "./value.js";
import Command from "./noSql/Command.js";
/**
 * Clase principal del paquete
 * @constructor
 * @param {Core} language - Clase que implementa los comandos del lenguaje
 * @param {Object} options - {
		typeIdentificator: "regular", - Identifica el tipo de identificadores validos
		mode: "test", - Modo de trabajo
	}
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
	 * Permite crear distintos hilos usando una instancia de QueryBuilder
	 * Evita tener que crear instancias multiples
	 * @param {number|string} id - identificador del hilo puede ser numerico o string
	 * @example
	 *  pg.thread("A1").select("*");
	 *	pg.thread("A2").select("B").from("tablaB");
	 *	pg.thread("A1").from("TABLA A");   // añade from al hilo A1
	 *	pg.thread("A2").where("predicado");// añade from al hilo A2
	 *	console.log("Resuelve A1\n", await pg.thread("A1").toString());
	 *	console.log("Resuelve A2\n", await pg.thread("A2").toString());
	 * Resuelve A1
	 * 	SELECT *
	 * 	FROM TABLA A;
	 * Resuelve A2
	 * 	SELECT B
	 * 	FROM tablaB
	 * 	WHERE predicado;
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
	 * Añade una instancia del controlador para ejecutar los comandos y
	 * enviarlos a una base de datos
	 * @param {Driver} driverClass - Clase que implementa el controlador
	 * @param {Object} params - objeto con los parametros enviados al controlador
	 * @returns
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
	 *	Crea una base de datos
	 *	@param {string} name - Nombre de la base de datos
	 *	@param {Object} options - Opciones para la creacion de datos
	 *	@param {Object} next - Objeto recibido por el comando anterior
	 *  @returns {Object} - Objeto pasado al siguiente comando
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
	 * Elimina una base de datos
	 * @param {string} name - nombre de la base de datos
	 * @param {Object} options - Opciones
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
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
	 * Crea un esquema
	 * @param {string} name - nombre del esquema
	 * @param {Object} options - Opciones
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
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
	 * Elimina un esquema
	 * @param {string} name - nombre del esquema
	 * @param {Object} options - Opciones
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
	 */
	dropSchema(name, options, next) {
		const command = this.language.dropSchema(name, options);
		return this.toNext([command, next]);
	}

	/**
	 * Crea una nueva tabla con el nombre y las opciones especificadas.
	 *
	 * @param {string} name - El nombre de la tabla.
	 * @param {Object} options - Opciones de configuración para la tabla.
	 * @param {Object} options.cols - Objeto donde cada clave es el nombre de la columna.
	 * @param {type|column} options.cols[].column - columna name:<string|column>
	 * @param {GLOBAL|LOCAL} [options.temporary] - GLOBAL|LOCAL.
	 * @param {PRESERVE|DELETE} [options.onCommit] - ON COMMIT PRESERVE|DELETE
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
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
	 *
	 * @param {string} name - Nombre de la tabla
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
	 */
	alterTable(name, next) {
		const command = this.language.alterTable(name);
		log("alterTable", "responde con %o", command);
		return this.toNext([command, next]);
	}
	/**
	 * Define los comandos:
	 * "addColumn", "alterColumn", "dropColumn" y "addConstraint"
	 * cada uno recibe tres parametros:
	 * @param {string} name - nombre de la columna
	 * @param {Object} options - opciones aplicables
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
	 *
	 * "setDefault" y "dropDefault"
	 * @param {string} value - valor por defecto
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
	 *
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
	 * Elimina una tabla
	 * @param {string} name - nombre de la tabla
	 * @param {object} option - opciones aplicables
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
	 */
	dropTable(name, option, next) {
		const command = this.language.dropTable(name, option);
		return this.toNext([command, next], ";");
	}
	/**
	 * Crea un tipo definido por el usuario
	 * @param {string} name - nombre del tipo
	 * @param {object} option - opciones aplicables
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
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
	 * Elimina un tipo definido por el usuario
	 * @param {string} name - nombre del tipo
	 * @param {object} option - opciones aplicables
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
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
	 * SQL estándar (SQL-92 y SQL:2006) que permite definir restricciones a nivel de base de datos.
	 * Sirve para imponer condiciones que no pueden expresarse fácilmente con restricciones en columnas (CHECK) o en tablas (FOREIGN KEY).
	 * No está implementado en MySQL ni en PostgreSQL.
	 * - SQL estándar	✅
	 * - PostgreSQL		❌
	 * - MySQL				❌
	 * En su lugar, se pueden usar triggers (BEFORE INSERT/UPDATE/DELETE) o funciones con restricciones CHECK a nivel de tabla.
	 * @param {string} name - nombre
	 * @param {object} assertion - opciones aplicables
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
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
	 * Permite definir tipos de datos personalizados con restricciones.
	 * Es útil para reutilizar reglas de validación en múltiples tablas sin repetir código.
	 * - SQL estándar	✅
	 * - PostgreSQL		✅
	 * - MySQL				❌
	 * @param {string} name - Nombre del dominio
	 * @param {Object} options - Opciones aplicables
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
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
	 * Permite definir una consulta almacenada como un objeto de la base de datos.
	 * Se comporta como una 'tabla virtual', mostrando datos obtenidos de una o varias tablas sin duplicarlos.
	 *
	 * - PostgreSQL	✅ Sí	Soporta vistas materializadas con REFRESH MATERIALIZED VIEW
	 * - MySQL			✅ Sí	Soporta vistas pero no vistas materializadas
	 * - SQL Server	✅ Sí	Soporta vistas indexadas para mejorar rendimiento
	 * - SQLite			✅ Sí	No permite vistas materializadas ni indexadas
	 * - Oracle			✅ Sí	Soporta vistas normales y materializadas
	 * @param {string} name - nombre de la vista
	 * @param {object} options - opciones aplicables {cols:Array<string>, as:Select, check:boolean}
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
	 */
	createView(name, options, next) {
		try {
			const command = this.language.createView(
				name.validSqlId(),
				options,
				next,
			);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	/**
	 * Elimina una vista
	 * @param {string} name - Nombre de la vista
	 * @param {Object} next - Objeto recibido por el comando anterior
	 * @returns {Object} - Objeto pasado al siguiente comando
	 */
	dropView(name, next) {
		try {
			const command = this.language.dropView(name);
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
	 * Crear un nuevo rol en la base de datos.
	 * Un rol es una entidad que puede representar a un usuario o un grupo de usuarios y
	 * puede recibir permisos para acceder a ciertos recursos.
	 *- PostgreSQL	✅ Maneja roles en lugar de usuarios individuales
	 *- MySQL				✅ (Desde 8.0)	Se complementa con GRANT para asignar permisos
	 *- SQL Server	✅ Se usa CREATE ROLE pero los usuarios son entidades separadas
	 *- SQLite			❌ No soporta roles ni usuarios
	 *- Oracle			✅ Soporta roles con permisos avanzados
	 *- MongoDB			✅	Usando createRole y db.createUser
	 * @param {string|Array<string>} names - nombre o nombres de roles a crear
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.admin - WITH ADMIN
	 * @param {*} next
	 * @returns
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
	 * Elimina el rol o roles
	 * @param {string|Array<string>} names - uno o varios roles a eliminar
	 * @param {?object} options - opciones aplicables
	 * @param {*} next
	 * @returns
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
	 * Permite asignar permisos a usuarios.
	 *- PostgreSQL	✅ Sí	Permite permisos detallados a nivel de columna, tabla y esquema.
	 *- MySQL				✅ Sí	Usa GRANT junto con WITH GRANT OPTION para permitir reasignar permisos.
	 *- SQL Server	✅ Sí	También usa DENY y REVOKE para revocar permisos.
	 *- Oracle			✅ Sí	Soporta permisos sobre tablas, roles, procedimientos y secuencias.
	 *- SQLite			❌ No	No maneja usuarios ni permisos a nivel SQL.
	 *- MongoDB			✅	grantRolesToUser()	Permite asignar roles con permisos específicos.
	 * @param {string|Array<string>} privilegios - Permisos a conceder
	 * @param {string|object} on - Objeto sobre el que se otorga
	 * @param {objectTypes} on.objectType - Especifica el tipo sobre el que se aplica 'types/privilevios.js'
	 * @param {"PUBLIC"|"ALL"|string|Array<string>} to - usuarios o roles a los que se otorga
	 * @param {boolean} options.withGrant - WITH GRANT OPTION
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.grantBy - GRANTED BY
	 * @param {*} next
	 * @returns
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
	 * @param {*} next
	 * @returns
	 * @example REVOKE permiso(s) ON objeto FROM usuario_rol;
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
	 * Como grant pero solo para roles
	 * @param {string|Array<string>} roles - rol o roles para asignar
	 * @param {string|Array<string>} users - usuario o usuarios a los que se conceden
	 * @param {boolean} options.admin- true (WITH ADMIN OPTION)
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.granted - GRANTED BY
	 * @param {*} next
	 * @returns
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
	 * Como revoke, pero para roles
	 * @param {string|Array<string>} roles - roles a eliminar
	 * @param {"PUBLIC"|"ALL"|Array<string>} from - A quien se le retira
	 * @param {"CURRENT_USER"|"CURRENT_ROLE"} options.grantBy - GRANTED BY
	 * @param {boolean} options.cascade - "CASCADE"/"RESTRICT"
	 * @param {boolean} options.restrict - "RESTRICT"/"CASCADE"
	 * @param {*} next
	 * @returns
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
	 * SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	 * @param {string|Column|Array<string>|Array<Column>} columns - Columnas seleccionadas
	 * @param {{[unique:boolean],[ all:boolean]} options - opciones
	 * @returns
	 */
	select(columns, options, next) {
		try {
			const command = this.language.select(columns, options, next);
			console.log("select", "command %o", command);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
		}
		return this.toNext([null, next]);
	}
	/**
	 * Comprueba que los tipos de tables y alias sean del mismo tipo y longitud
	 * @param {string|Array<string>} tables - tabla o lista de tablas
	 * @param {string|Array<string>} alias - alias o lista de alias
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
	 * Especifica la tabla o vista de donde se van a obtener los datos.
	 * @param {string|Array<string>} tables - tabla o tablas de donde obtener los datos
	 * @param {string|Array<string>} alias - alias o lista de alias correspondiente a las tablas
	 * @param {*} next
	 * @returns
	 * @example SELECT columna1, columna2 FROM tabla;
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
	 * Filtrar registros en una consulta, seleccionando solo aquellos que cumplen con una condición específica.
	 * Es una parte esencial en las sentencias SELECT, UPDATE, DELETE, etc., ya que permite limitar los resultados
	 * o modificar solo las filas que cumplen con ciertos criterios.
	 *
	 * @param {QueryBuilder|Array<string|QueryBuilder>} predicados - Elementos admitidos en el where
	 * @param {*} next
	 * @returns
	 */
	where(predicados, next) {
		next.isQB = predicados instanceof QueryBuilder;

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
	 * Establece el valor para WHERE CURRENT OF cursorName
	 * @param {string} cursorName - Nombre del cursor
	 * @param {*} next
	 * @returns
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
	 * Define las funciones de JOIN entre tablas
	 * cada funcion recibe tres parametros
	 * @param {string|Array<string>} tables - tabla o lista de tablas a unir
	 * @param {string|Array<string>} alias - tabla o lista de alias aplicables a las tablas en el mismo orden
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
	 * El comando USING se usa principalmente en consultas SQL para especificar columnas en operaciones de JOIN.
	 * Es especialmente útil cuando las columnas que se van a combinar tienen el mismo nombre en ambas tablas.
	 * PostgreSQL	✅ Sí	Utilizado en JOINs, especialmente cuando las columnas tienen el mismo nombre en ambas tablas.
	 * MySQL			✅ Sí	También soporta USING en JOINs para columnas con el mismo nombre.
	 * SQL Server	❌ No	SQL Server utiliza la cláusula ON para especificar las condiciones de los JOINs.
	 * Oracle			✅ Sí	Soporta USING para simplificar las combinaciones de columnas con el mismo nombre en tablas diferentes.
	 * SQLite			✅ Sí	Permite USING en operaciones JOIN cuando las columnas tienen nombres iguales.
	 * MongoDB	$lookup	Usado en agregaciones para combinar documentos de diferentes colecciones.
	 * @param {string} columnsInCommon - Columna en comun
	 * @param {*} next
	 * @returns
	 * @example SELECT columna1, columna2 FROM tabla1 JOIN tabla2 USING (columna_común);
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
	 * Combinar los resultados de dos o más consultas SELECT.
	 * El UNION elimina los duplicados de los resultados por defecto.
	 * Si se quiere incluir duplicados, se puede usar UNION ALL.
	 * PostgreSQL	✅ Sí	Soporta UNION y UNION ALL para combinar resultados.
	 * MySQL			✅ Sí	Similar a SQL estándar, soporta tanto UNION como UNION ALL.
	 * SQL Server	✅ Sí	Soporta ambas opciones UNION y UNION ALL.
	 * Oracle			✅ Sí	Permite UNION y UNION ALL para combinar resultados de varias consultas.
	 * SQLite			✅ Sí	Soporta UNION y UNION ALL en consultas SELECT.
	 * MongoDB	$unionWith	Permite combinar los resultados de dos colecciones en una agregación.

	 * @param  {...string|QueryBuilder} selects - Selects a unir
	 * @returns
	 */
	union(...selects) {
		const next = selects.pop(); // recupera el ultimo valor introducido en los argumentos
		// Fix: Current QueryBuilder already has one SELECT, so we need at least 1 more
		if (selects.length < 1) {
			next.error = "UNION necesita al menos una instrucción SELECT adicional";
			return this.toNext([null, next]);
		}
		const response = this.language.union(selects, next, { all: false });
		return this.toNext([response, next]);
	}
	/**
	 * Combinar los resultados de dos o más consultas SELECT.
	 * Incluyendo duplicados.
	 * @param  {...string|QueryBuilder} selects - Selects a unir
	 * @returns
	 */
	unionAll(...selects) {
		const next = selects.pop();
		log(["QB", "unionAll"], "recibe next", next);
		// Fix: Current QueryBuilder already has one SELECT, so we need at least 1 more
		if (selects.length < 1) {
			next.error = "UNION ALL necesita al menos una instrucción SELECT adicional";
			return this.toNext([null, next]);
		}
		const response = this.language.union(selects, next, { all: true });
		return this.toNext([response, next]);
	}
	/**
	 * El comando INTERSECT se utiliza en SQL para obtener los registros comunes entre dos consultas SELECT.
	 * Retorna solo las filas que existen en ambas consultas, eliminando duplicados.
	 * PostgreSQL	✅ 	Soporta INTERSECT para obtener los registros comunes entre dos consultas.
	 * MySQL			❌ 	No soporta INTERSECT, pero puede emularse con JOIN o IN.
	 * SQL Server	❌ 	No soporta INTERSECT ALL, pero se puede simular con GROUP BY y HAVING.
	 * Oracle			✅ 	Soporta INTERSECT en consultas SQL.
	 * SQLite			❌ 	No tiene soporte nativo para INTERSECT, pero puede simularse con JOIN.
	 * MongoDB	$lookup con $match	Se puede utilizar una combinación de lookup para unir colecciones y luego filtrar los resultados comunes con $match.
	 * @param  {...string|QueryBuilder} selects - Selects
	 * @returns
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
	 * @returns
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
	 *El comando EXCEPT se utiliza para obtener los registros que están en la primera consulta, pero no en la segunda.
	 *Este comando elimina los duplicados por defecto, retornando solo los registros únicos que existen
	 *en la primera consulta y no en la segunda.
	 * PostgreSQL	✅ Soporta EXCEPT para obtener registros de la primera consulta que no estén en la segunda.
	 * MySQL			❌ No soporta EXCEPT, pero se puede emular utilizando LEFT JOIN o NOT EXISTS.
	 * SQL Server	✅ Soporta EXCEPT para obtener diferencias entre dos conjuntos de resultados.
	 * Oracle			✅ Soporta EXCEPT para encontrar registros que están en la primera consulta pero no en la segunda.
	 * SQLite			❌ No tiene soporte nativo para EXCEPT, pero se puede simular con LEFT JOIN o NOT EXISTS.
	 * MongoDB	$lookup con $match y $project	Se puede emular EXCEPT mediante un lookup para combinar colecciones y luego excluir los registros coincidentes.
	 * @param  {...string|QueryBuilder} selects - Selects
	 * @returns
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
	 * @returns
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
	 * Operaciones de JOIN para especificar las condiciones de cómo se deben combinar las tablas.
	 * Define las columnas o condiciones que se deben cumplir para que filas de diferentes tablas sean combinadas.
	 * @param {string|QueryBuilder} predicado
	 * @param {*} next
	 * @returns
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
	 * operadores unarios
	 * @param {any|QueryBuilder} a
	 * operadores binarios
	 * @param {any|QueryBuilder} a
	 * @param {any|QueryBuilder} b
	 * operadores ternarios
	 * @param {any|QueryBuilder} a
	 * @param {any|QueryBuilder} b
	 * @param {any|QueryBuilder} c
	 * logicos
	 * @param {...any|QueryBuilder} - predicados
	 *
	 * @example
	 * isNull("columna") // columna IS NULL
	 * eq("columna",20) // columna = 20
	 * between("columna",10,15) // columna BETWEEN 10 AND 15
	 * and("columna1","columna2","columna3") // columna1 AND columna2 AND columna3
	 ******************************************************************************/

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
	} /**
	 * El operador IN en SQL se utiliza para comprobar si un valor está presente dentro de un conjunto de valores.
	 * Es útil cuando se necesita realizar comparaciones múltiples sin tener que escribir múltiples condiciones OR.
	 * @param {string|column} columna - nombre de la columna cuyo valor esta contenido el los valores
	 * @param  {Array<string|QueryBuilder>|...values} values - Puede ser un array o una lista de strings u objetos QueryBuilder
	 * @returns next
	 * @example
	 * where(in("columna1",valor1, valor2, valor3)) // WHERE columna1 IN (valor1, valor2, valor3);
	 */
	in(columna, ...values) {
		log(["QB", "in"], "columna %o values %o", columna, values);
		const next = values.pop();
		const result = this.language.in(columna, values, next);
		log(["QB", "in"], "valor resultado %o", result);
		return this.toNext([result, next]);
	}
	/**
	 * Filtrar registros cuyo valor NO está en una lista de valores o en el resultado de una subconsulta.
	 * Es la negación de IN y permite excluir múltiples valores en una sola condición.
	 * @param {string|column} columna
	 * @param  {Array<string|QueryBuilder>|...values} values
	 * @returns
	 */
	notIn(columna, ...values) {
		const next = values.pop();
		const result = this.language.notIn(columna, values, next);
		return this.toNext([result, next]);
	}

	/**
	 * Crea una columna 'name' para la tabla 'table'
	 * @param {string} name - nombre de la columna
	 * @param {string} table - nombre de la tabla
	 * @returns {Column}
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
	 * Es igual a col salvo el orden de los parametros
	 * @param {string} table - nombre de la tabla
	 * @param {string} name - nombre de la columna
	 * @returns {Column}
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
	} /**
	 * Crea una instancia de expresion, que permite añadirle un alias AS al campo
	 * @param {any} expresion
	 * @returns {Expresion} expresion.value = expresion
	 * @example
	 * exp("sum(*)").as("Total") // sum(*) AS Total
	 *
	 */
	exp(expresion) {
		return new Expresion(expresion);
	}
	/**
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
	 * @param {*} options
	 * @param {*} next
	 * @returns
	 */
	groupBy(columns, options, next) {
		if (this.lastStatementIn("select", next.q) !== -1) {
			const command = this.language.groupBy(columns, options);
			return this.toNext([command, next]);
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	} /**
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
	 * @param {*} next
	 * @returns
	 * @example
	 *
	 * let qb = new QueryBuilder()
	 * qb.having(qb.and(qb.gt(qb.sum("Columna3"),100)),qb.gt(qb.count("*"),2))
	 * HAVING SUM(columna3) > 100 AND COUNT(*) > 2;
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
	 * Se usa para ordenar los resultados de una consulta según una o más columnas,
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
	 * @param {*} next
	 * @returns
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
	 * Se usa para restringir la cantidad de filas devueltas por una consulta.
	 * Es útil para paginación y optimización de rendimiento cuando solo se necesitan un número específico de registros.
	 * PostgreSQL	✅ Sí	LIMIT y OFFSET funcionan para paginación.
	 * MySQL			✅ Sí	Soporta LIMIT con OFFSET para paginación.
	 * SQL Server	❌ No	Se usa TOP n o OFFSET FETCH NEXT en su lugar.
	 * Oracle			❌ No	Usa FETCH FIRST n ROWS ONLY para limitar resultados.
	 * SQLite			✅ Sí	Compatible con LIMIT y OFFSET.
	 * MongoDB	limit(n)	Se usa junto con skip(n) para paginación, similar a LIMIT ... OFFSET.
	 * @param {number} limit - numero de elementos a mostrar
	 * @param {*} next
	 * @returns
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
	 * Se usa para omitir un número específico de filas antes de comenzar a devolver resultados.
	 * Se suele combinar con LIMIT para implementar paginación.
	 * PostgreSQL	✅ Sí	OFFSET y LIMIT permiten paginación eficiente.
	 * MySQL			✅ Sí	Se usa LIMIT ... OFFSET.
	 * SQL Server	✅ Sí	Usa OFFSET ... FETCH NEXT para paginación.
	 * Oracle			✅ Sí	Usa OFFSET ... FETCH NEXT en lugar de LIMIT.
	 * SQLite			✅ Sí	Compatible con LIMIT y OFFSET.
	 * MongoDB	skip(n)	Se usa junto con limit(n) para paginación, similar a OFFSET ... LIMIT.
	 * @param {number} offset - numero de filas que se deben omitir
	 * @param {*} next
	 * @returns
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
	 * @returns
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

	async update(table, sets, next) {
		try {
			// biome-ignore lint/style/noArguments: <explanation>
			const args = [...arguments];
			const error = check("update(table:string, sets:json)", args);
			if (error) {
				this.error = error;
				throw new Error(error);
			}
			const updateCommand = await this.language.update(table, sets, next);
			return this.toNext([updateCommand, next], "", true);
		} catch (error) {
			this.error = error.message;
		}
	}
	delete(from, next) {
		try {
			const deleteCommand = this.language.delete(from);
			return this.toNext([deleteCommand, next], "", true);
		} catch (error) {
			this.error = error.message;
			return this.toNext([null, next]);
		}
	}
	// funciones SET

	/**
	 * @param {string|Column} funcion - argumento o columna sobre la que opera la función SQL
	 * @param {string} alias - nombre AS
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

	// funciones VALOR de cadena
	substr(column, inicio, ...options) {
		const next = options.pop();
		return this.toNext([
			this.language.substr(column, inicio, ...options),
			next,
		]);
	}

	/**
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - columna
	 * @param {Array<column,string>} casos - [condicion, resultado]
	 * @param {string} defecto - Caso else
	 * @returns {string}
	 */
	case(column, casos, defecto, next) {
		const response = this.language.case(column, casos, defecto, next);
		return this.toNext([response, next]);
	}

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

	//cursores

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

	openCursor(name, next) {
		try {
			this.cursores[name].open();
			return this.cursores[name];
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	closeCursor(name, next) {
		try {
			this.cursores[name].close(next);
			return this.cursores[name];
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	setTransaction(options) {
		const transaction = new Transaction(this, options);
		transaction.setUpTransaction();
		return transaction;
	}

	setConstraints(restrictions, type, next) {
		try {
			const response = this.language.setConstraints(restrictions, type);
			return this.toNext([response, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

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

	dropQuery() {
		this.promise = Promise.resolve({});
		return this.toNext([this.promise, {}]);
	}
	//toString function on Object QueryBuilder
	async toString(options) {
		const joinQuery = await this.queryJoin(options);
		this.dropQuery();
		return joinQuery;
	}
	/**
	 *
	 * @param {Boolean} testOnly - Si es true no llama al driver
	 * @returns
	 */
	async execute(testOnly = false) {
		if (testOnly) {
			console.log(">[QueryBuilder] [execute] en modo 'solo-test'\n");
			return await this.toString();
		}
		if (!this.driverDB) {
			throw new Error("No ha establecido un driver.");
		}

		try {
			const joinQuery = await this.queryJoin();
			log(["QB", "execute"], "Ejecutar\n%s\n==========", joinQuery);
			await this.driverDB.execute(joinQuery);
			this.result = this.driverDB.response();
			this.error = undefined;
			return this;
		} catch (error) {
			log(["QB", "execute"], "Se ha producido un error", error.message);
			this.error = error.message;
			this.result = undefined;
			this.dropQuery();
			return this;
		}
	}

	// get and set
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
export default QueryBuilder;
