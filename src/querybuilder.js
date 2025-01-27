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
		this.query = options?.value || [];
		if (this.options?.typeIdentificator) {
			Types.identificador.set(this.options.typeIdentificator);
		} else {
			Types.identificador.set("regular");
		}
		this.commandStack = [];
		this.queryResult = undefined;
		this.queryResultError = undefined;
		this.alterTableCommand = undefined;
		this.alterTableStack = [];
		this.selectCommand = undefined;
		this.selectStack = [];
		this.cursores = {};
		this.predicados();
		this.functionOneParam();
		this.functionDate();
		this.joins();
		this.alterTableComands();
		this.prevInstance = null;
		this.queue = [];
		this.driverDB = undefined;
		this.promise = Promise.resolve({});
		this.promiseStack = [];
		this.promiseResult = null;
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
		];
		this.returnPromise = ["createCursor", "closeCursor", "setTransaction"];
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

				if (prop === "promise2") {
					/**
					 * Cuando se llama a promise se encadenan las llamadas
					 * en una sola promesa secuencia
					 */

					for (const index in target.promiseStack) {
						const { prop, original, args, numeroArgumentos } =
							target.promiseStack[index];
						target.promise = target.promise.then((next) => {
							log(["Proxy", "promise", "then", "%o"], "recibe:%o", prop, next);
							next.last = next?.prop || null;

							// iguala el numero de argumentos que recibe la función
							while (args.length < numeroArgumentos - 1) {
								args.push(undefined);
							}
							// añade el argumento a la función
							args.push({ ...next, prop });
							const response = original.apply(receiver, args); // ejecución del comando
							return response;
						});
					}
					//Devuelve la promesa final
					return target.promise;
				}

				/**
				 * Cuando se llama a una funcion
				 */
				if (typeof original === "function") {
					if (target.returnOriginal.indexOf(prop) >= 0) {
						return original;
					}

					return (...args) => {
						log("Proxy", "Se ha llamado a la funcion %o", prop);
						target.promiseStack.push({
							prop,
							original,
							args,
							numeroArgumentos: original.length,
						});
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
	cola(operation) {
		this.count++;
		this.queue.push(operation);
		return this; // Permite encadenamiento
	}
	async addTo(valor) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log("Async addTo executed", valor);
		return this;
	}
	getAll() {
		const promise = this.queue.reduce((previusPromise, currentFunction) => {
			const { original, target, args } = currentFunction;
			const nextPromise = previusPromise.then((previusResponse) =>
				original.apply(target, args),
			);
			return nextPromise;
		}, Promise.resolve());
		return promise;
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
					log("toNext", "Es una expresion");
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
	async hello(texto, next) {
		next.isQB = texto instanceof QueryBuilder;
		if (isJSObject(texto)) {
			return this.toNext([texto, next], "\n");
		}
		if (texto instanceof QueryBuilder) {
			const result = next.q.pop();
			return this.toNext([`HELLO: ${result}`, next], "\n");
		}
		const nuevoTexto = `HELLO: ${texto}`;
		return this.toNext([nuevoTexto, next], "\n");
	}
	say(texto, next) {
		console.log(
			"[say] next:%o type:%o isQB:%o",
			next,
			typeof texto,
			texto instanceof QueryBuilder,
		);
		next.isQB = texto instanceof QueryBuilder;
		if (texto instanceof QueryBuilder) {
			const result = next.q.pop();
			return this.toNext([`SAY: ${result}`, next], "\n");
		}
		const nuevoTexto = `SAY: ${texto}`;
		return this.toNext([nuevoTexto, next], "\n");
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

	/**
	 * Selecciona la base de datos
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
	/** 
	@param {string} name - Nombre de la base de datos
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
	dropDatabase(name, options, next) {
		try {
			const command = this.language.dropDatabase(name, options);
			return this.toNext([command, next], ";", true);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	createSchema(name, options, next) {
		try {
			const command = this.language.createSchema(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

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
	 *
	 * @returns {QueryBuilder}
	 */
	createTable(name, options, next) {
		try {
			if (options?.cols === undefined) {
				this.error = "Tiene que especificar como mínimo una columna";
			}
			const command = this.language.createTable(name.validSqlId(), options);
			return this.toNext([command, next], ";", true);
		} catch (error) {
			next.error = error.message;
		}
		return this.toNext([null, next]);
	}
	alterTable(name, next) {
		const command = this.language.alterTable(name);
		log("alterTable", "responde con %o", command);
		return this.toNext([command, next]);
	}

	alterTableComands() {
		const comands = ["addColumn", "alterColumn", "dropColumn", "addConstraint"];
		for (const comand of comands) {
			this[comand] = (name, options, next) => {
				log(comand, "recibe", next);
				const alterTablePos = this.promiseStack.find(
					(item) => item.prop === "alterTable",
				);
				if (alterTablePos !== undefined) {
					const response = this.language[comand](name, options, next);
					log(comand, "response", response);
					return this.toNext([response, next], ";");
				}
				next.error = `No se pueden añadir columnas sin un 'ALTER TABLE'`;
				return this.toNext([null, next]);
			};
		}
		const alterColums = ["setDefault", "dropDefault"];
		for (const comand of alterColums) {
			this[comand] = (value, next) => {
				console.log("[alterColums][%s] value:%o next: %o", comand, value, next);
				const alterColumnPos = this.promiseStack.find(
					(item) => item.prop === "alterColumn",
				);
				if (alterColumnPos !== undefined) {
					const command = this.language[comand](value, alterColumnPos.args[0]);
					return this.toNext([command, next]);
				}
				this.error = "No es posible aplicar, falta el comando 'alterColumn'";
				return next;
			};
		}
	}

	dropTable(name, option, next) {
		const command = this.language.dropTable(name, option);
		return this.toNext([command, next], ";");
	}
	createType(name, options, next) {
		try {
			const command = this.language.createType(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	dropType(name, options, next) {
		try {
			const command = this.language.dropType(name, options);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

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

	createDomain(name, options, next) {
		try {
			const command = this.language.createDomain(name.validSqlId(), options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

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
	dropView(name, next) {
		try {
			const command = this.language.dropView(name);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	// Seguridad

	createRoles(names, options, next) {
		try {
			const command = this.language.createRoles(names, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	dropRoles(names, options, next) {
		try {
			const command = this.language.dropRoles(names, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	grant(privilegios, on, to, options, next) {
		try {
			const command = this.language.grant(privilegios, on, to, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	revoke(privilegios, on, from, options, next) {
		try {
			const command = this.language.revoke(privilegios, on, from, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	grantRoles(roles, users, options, next) {
		try {
			const command = this.language.grantRoles(roles, users, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}
	revokeRoles(roles, from, options, next) {
		try {
			const command = this.language.revokeRoles(roles, from, options);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
			return this.toNext([null, next]);
		}
	}

	//Consulta de datos SQL
	/**
	 * SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	 * @param {string|Column|Array<string>|Array<Column>} columns - Columnas seleccionadas
	 * @param {{[unique:boolean],[ all:boolean]} options - opciones
	 * @returns
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
		if (
			alias !== undefined &&
			Array.isArray(tables) &&
			alias.length < tables.length
		) {
			throw new Error(
				"la lista de 'Alias' deben tener como mínimo el mismo numero de elementos que 'tablas'",
			);
		}
	}
	from(tables, alias, next) {
		try {
			log(["QB", "from(tables, alias, next)"], "Recibe: next", next);
			if (next.last !== "select") {
				this.error =
					"[from] No es posible usar 'FROM', falta el comando 'select'";
				return next;
			}
			this.checkFrom(tables, alias);
			const command = this.language.from(tables, alias);
			return this.toNext([command, next]);
		} catch (error) {
			next.error = error.message;
		}
		return this.toNext([null, next]);
	}

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
				if (["select", "on"].includes(next?.last)) {
					const result = this.language[join](tables, alias);
					if (result instanceof Error) {
						next.error = result;
						return this.toNext([null, next]);
					}
					return this.toNext([result, next]);
				}
				next.error =
					"No es posible aplicar, falta un comando previo 'select' u 'on'";
				return this.toNext([null, next]);
			};
		}
		//Sinonimos
		const sinonimos = {
			leftOuterJoin: this.leftJoin,
			rightOuterJoin: this.rightJoin,
			fullOuterJoin: this.fullJoin,
		};
		for (const otros in sinonimos) {
			this[otros] = sinonimos[otros];
		}
	}

	using(columnsInCommon, next) {
		log(["QB", "using"], "Recibe next", next);
		// solo se puede aplicar si el ultimo comando es un join del tipo incluido en el array
		if (["innerJoin", "join", "leftJoin", "rightJoin"].includes(next.last)) {
			const response = this.language.using(columnsInCommon);
			return this.toNext([response, next]);
		}
		next.error = `No es posible aplicar 'USING' a un join de tipo: "${next.last}"`;
		return this.toNext([null, next]);
	}

	union(...selects) {
		const next = selects.pop();
		if (selects.length < 2) {
			next.error = "UNION ALL necesita mínimo dos instrucciones SELECT";
			return this.toNext([null, next]);
		}
		const response = this.language.union(selects, next, { all: false });
		return this.toNext([response, next]);
	}
	unionAll(...selects) {
		const next = selects.pop();
		log(["QB", "unionAll"], "recibe next", next);
		if (selects.length < 2) {
			next.error = "UNION ALL necesita mínimo dos instrucciones SELECT";
			return this.toNext([null, next]);
		}
		const response = this.language.union(selects, next, { all: true });
		return this.toNext([response, next]);
	}
	where(predicados, next) {
		next.isQB = predicados instanceof QueryBuilder;
		const command = this.language.where(predicados, next);
		log("where", "command %o", command);
		return this.toNext([command, next]);
	}
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
	on(predicados, next) {
		log(["QB", "on"], "Recibe next", next);
		if (
			this.promiseStack.some((item) =>
				["innerJoin", "join", "leftJoin", "rightJoin", "fullJoin"].includes(
					item.prop,
				),
			)
		) {
			const response = this.language.on(predicados, next);
			return this.toNext([response, next]);
		}
		next.error = "No es posible aplicar 'on', falta un comando tipo 'join'";
		return this.toNext([null, next]);
	}

	// Predicados

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
		for (const operOne of operOneCol) {
			this[operOne] = (a, next) => {
				const response = this.language[operOne](a, next);
				log(["QB", "predicados", "%o"], "respuesta", operOne, response);
				return this.toNext([response, next]);
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
	 *
	 * @param {string|column} columna - nombre de la columna cuyo valor esta contenido el los valores
	 * @param  {Array<string|QueryBuilder>|...values} values - Puede ser un array o una lista de strings u objetos QueryBuilder
	 * @returns
	 */

	in(columna, ...values) {
		const next = values.pop();
		const result = this.language.in(columna, values, next);
		log(["QB", "in"], "valor resultado %o", result);
		return this.toNext([result, next]);
	}
	notIn(columna, ...values) {
		const next = values.pop();
		const result = this.language.notIn(columna, values, next);
		return this.toNext([result, next]);
	}

	/**
	 *
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
	}

	exp(expresion) {
		return new Expresion(expresion);
	}

	groupBy(columns, options, next) {
		const select = this.promiseStack.find((item) => item.prop === "select");
		if (select !== undefined) {
			const command = this.language.groupBy(columns, options);
			return this.toNext([command, next]);
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	having(predicado, options, next) {
		const select = this.promiseStack.find((item) => item.prop === "select");
		if (select !== undefined) {
			const command = this.language.having(predicado, options);
			return this.toNext([command, next]);
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	orderBy(columns, next) {
		const select = this.promiseStack.find((item) => item.prop === "select");
		if (select !== undefined) {
			const command = this.language.orderBy(columns);
			return this.toNext([command, next]);
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	//MySQL, PostgreSQL, y SQLite
	limit(limit) {
		this.commandStack.push("limit");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.limit(limit));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select'";
		}
		return this;
	}
	offset(offset) {
		if (!this.commandStack.lastIndexOf("limit")) {
			this.error = "offset se utiliza con limit";
		}
		this.commandStack.push("offset");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.offset(offset));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select'";
		}
		return this;
	}
	//SQL Server y Oracle
	// FETCH FIRST n ROWS ONLY
	//ROWNUM

	// Mofificacion de Datos
	/**
	 *
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
				this.error = error;
				throw new Error(error);
			}
			next.isQB = values instanceof QueryBuilder;
			const command = this.language.insert(table, cols, values, next);
			return this.toNext([command, next], ";");
		} catch (error) {
			next.error = error.message;
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
			this[name] = (next) => this.toNext([this.language[name]()], next);
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

	dropQuery(next) {
		this.query = [];
		this.selectCommand = undefined;
		this.selectStack = [];
		this.alterTableCommand = undefined;
		this.alterTableStack = [];
		this.promise = Promise.resolve({});
		this.promiseStack = [];
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
			throw new Error(this.queryResultError, {
				cause: {
					command: `${this.commandStack[this.commandStack.length - 1]}(...)`,
					stack: `${this.commandStack.join("(...) -> ")}(...)`,
				},
			});
		}
	}
}
export default QueryBuilder;
