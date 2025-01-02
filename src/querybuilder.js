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
		this.returnOriginal = ["getAll", "execute", "toString", "toNext"];
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

				if (prop === "promise") {
					/**
					 * Cuando se llama a promise se encadenan las llamadas
					 * en una sola promesa secuencia
					 */

					for (const index in target.promiseStack) {
						const { prop, original, args, numeroArgumentos } =
							target.promiseStack[index];
						console.log("[promise]prop", prop);
						target.promise = target.promise.then((next) => {
							console.log("[Proxy] %o recibe:%o", prop, next);
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
						console.log("[Proxy] Se ha llamado a la funcion %o", prop);
						target.promiseStack.push({
							prop,
							original,
							args,
							numeroArgumentos: original.length,
						});
						return receiver; // Para encadenar
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
	toNext(data, stringJoin = "") {
		if (Array.isArray(data)) {
			let [valor, next] = data;
			if (isJSObject(valor)) {
				valor = Object.keys(valor).reduce((obj, key) => {
					if (valor[key] instanceof QueryBuilder) {
						obj[key] = next.q.shift();
					} else {
						obj[key] = valor[key];
					}
					return obj;
				}, {});
			}
			if (next.isQB) {
				log("toNext", "El argumento de %o es una llamada a QB ", data[1].prop);
				next.q.push(valor);
				log("toNext", "devuelve", next);
				return next;
			}
			log("toNext", "Recibe valor: %o next:%o", valor, next);
			const { q, ...resto } = next;
			if (Array.isArray(q)) {
				q.push(valor.concat(stringJoin));
				log("toNext", "devuelve q", q);
				return {
					q,
					...resto,
				};
			}
			log("toNext", "devuelve 2", { q: [valor.concat(stringJoin)], ...resto });
			return { q: [valor.concat(stringJoin)], ...resto };
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
				return next;
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
			return this.toNext([command, next], ";\n");
		} catch (error) {
			this.error = error.message;
			return next;
		}
	}
	dropDatabase(name, options, next) {
		const command = this.language.dropDatabase(name, options);
		return this.toNext([command, next]);
	}
	createSchema(name, options, next) {
		try {
			const command = this.language.createSchema(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
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
			return this.toNext([command, next], ";\n");
		} catch (error) {
			this.error = error.message;
		}
		return next;
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
					const response = this.language[comand](name, options, "valor");
					log(comand, "response", response);
					return this.toNext([response, next], ";");
				}
				this.error = `No se pueden añadir columnas sin un 'ALTER TABLE'`;
				return next;
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
		return this.toNext([command, next]);
	}
	createType(name, options, next) {
		try {
			const command = this.language.createType(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}
	dropType(name, options, next) {
		try {
			const command = this.language.dropType(name, options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}

	createAssertion(name, assertion, next) {
		try {
			const command = this.language.createAssertion(
				name.validSqlId(),
				assertion,
			);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}

	createDomain(name, options, next) {
		try {
			const command = this.language.createDomain(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}

	createView(name, options, next) {
		try {
			const command = this.language.createView(name.validSqlId(), options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	dropView(name, next) {
		try {
			const command = this.language.dropView(name);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}

	// Seguridad

	createRoles(names, options, next) {
		try {
			const command = this.language.createRoles(names, options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}
	dropRoles(names, options, next) {
		try {
			const command = this.language.dropRoles(names, options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}

	grant(privilegios, on, to, options, next) {
		try {
			const command = this.language.grant(privilegios, on, to, options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}

	revoke(privilegios, on, from, options, next) {
		try {
			const command = this.language.revoke(privilegios, on, from, options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}

	grantRoles(roles, users, options, next) {
		try {
			const command = this.language.grantRoles(roles, users, options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}
	revokeRoles(roles, from, options, next) {
		try {
			const command = this.language.revokeRoles(roles, from, options);
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return next;
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
			return this.toNext([command, next], "\n");
		} catch (error) {
			this.error = error.message;
		}
		return next;
	}
	checkFrom(tables, alias) {
		// biome-ignore lint/style/noArguments: <explanation>
		const args = [...arguments];
		const error = check("From(tables:string|array, alias:string|array)", args);
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
			const select = this.promiseStack.find((item) => item.prop === "select");
			if (select === undefined) {
				this.error =
					"[from] No es posible usar 'FROM', falta el comando 'select'";
				return next;
			}
			this.checkFrom(tables, alias);
			const command = this.language.from(tables, alias);
			return this.toNext([command, next], "\n");
		} catch (error) {
			this.error = error.message;
		}
		return next;
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
			this[join] = (tables, alias) => {
				this.commandStack.push(join);
				this.checkFrom(tables, alias);
				if (this.selectCommand?.length > 0) {
					const result = this.language[join](tables, alias);
					if (result instanceof Error) {
						this.error = result;
					} else {
						this.selectStack.push(result);
					}
				} else {
					this.error = "No es posible aplicar, falta el comando 'select'";
				}
				return this;
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

	using(columnsInCommon) {
		const currentJoin = this.commandStack[this.commandStack.length - 1];
		this.commandStack.push("using");
		if (["innerJoin", "join", "leftJoin", "rightJoin"].includes(currentJoin)) {
			this.selectStack.push(this.language.using(columnsInCommon));
		} else {
			this.error = `No es posible aplicar 'USING' a un ${currentJoin}`;
		}
		return this;
	}

	union(...selects) {
		if (selects.length < 2) {
			this.error = new Error("UNION necesita mínimo dos instrucciones SELECT");
		}
		this.commandStack.push("union");
		this.query.push(this.language.union(...selects));
		return this;
	}
	unionAll(...selects) {
		if (selects.length < 2) {
			this.error = new Error(
				"UNION ALL necesita mínimo dos instrucciones SELECT",
			);
		}
		this.commandStack.push("union");
		this.query.push(this.language.union(...selects, { all: true }));
		return this;
	}
	where(predicados, next) {
		console.log(
			"[where] next:%o ¿Es un QueryBuilder?%s",
			next,
			predicados instanceof QueryBuilder,
		);
		let command;
		if (predicados instanceof QueryBuilder) {
			const { q, values, ...resto } = next;
			const subquery = [q];
			if (values) {
				subquery.push(...values);
			}
			command = this.language.where(
				subquery.filter((item) => item !== undefined),
			);
			return this.toNext([command, resto], "\n");
		}
		command = this.language.where(predicados);
		console.log("[where]command", command);
		return this.toNext([command, next], "\n");
	}
	whereCursor(cursorName) {
		this.commandStack.push("whereCursor");
		if (this.cursores?.[cursorName] === undefined) {
			this.error = `El cursor '${cursorName}' no ha sido definido`;
		}
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.whereCursor(cursorName));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select|delete'";
		}
		return this;
	}
	on(predicados) {
		this.commandStack.push("on");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.on(predicados));
		} else {
			this.error = "No es posible aplicar, falta el comando 'FROM'";
		}
		return this;
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
		const operTreeArg = ["between", "notBetween"];
		const logicos = ["and", "or", "not", "distinct"];

		for (const operTwo of operTwoCols) {
			this[operTwo] = (a, b, next) => {
				console.log(
					"[operTwoCols][%s] a:%o, b:%o next:%o",
					operTwo,
					a,
					b,
					next,
				);
				const result = this.language[operTwo](a, b);
				console.log("[QueryBuilder][%s] result next", operTwo, result, next);
				if (next?.values === undefined) {
					next.values = [];
				}
				next.values.push(result);
				return next;
			};
		}
		for (const operOne of operOneCol) {
			this[operOne] = (a) => this.language[operOne](a);
		}
		for (const operTree of operTreeArg) {
			this[operTree] = (a, b, c) => this.language[operTree](a, b, c);
		}

		for (const oper of logicos) {
			this[oper] = (...predicados) => {
				const next = predicados.pop();
				console.log("[QueryBuilder][predicados][%s] next:", oper, next);
				const valores = predicados
					.reduce((acc, curr, index) => {
						if (curr instanceof QueryBuilder) {
							acc.push(next.values[index]);
						} else {
							acc.push(curr);
						}
						return acc;
					}, [])
					.reverse();
				const { values, ...resto } = next;
				const command = this.language[oper](...valores);
				return this.toNext([command, resto]);
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
		// this.commandStack.push("in");
		return this.language.in(columna, ...values);
	}
	notIn(columna, ...values) {
		this.commandStack.push("notIn");
		return this.language.notIn(columna, ...values);
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
		this.commandStack.push("col");
		return new Column(name, table, this.language.dataType);
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
		this.commandStack.push("coltn");
		return new Column(name, table, this.language.dataType);
	}

	exp(expresion) {
		return new Expresion(expresion);
	}

	groupBy(columns, options, next) {
		const select = this.promiseStack.find((item) => item.prop === "select");
		if (select !== undefined) {
			const command = this.language.groupBy(columns, options);
			return this.toNext([command, next], "\n");
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	having(predicado, options, next) {
		const select = this.promiseStack.find((item) => item.prop === "select");
		if (select !== undefined) {
			const command = this.language.having(predicado, options);
			return this.toNext([command, next], "\n");
		}
		this.error = "No es posible aplicar, falta el comando 'select'";
		return next;
	}
	orderBy(columns, next) {
		const select = this.promiseStack.find((item) => item.prop === "select");
		if (select !== undefined) {
			const command = this.language.orderBy(columns);
			return this.toNext([command, next], "\n");
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
	 * @param {array<Column>} cols - columnas correspondientes al orden de los valores o vacio para el orden por defecto
	 * @param {array<array<Value>>} values - Array de Arrays con los valores
	 * @returns
	 */
	insert(table, cols, values, next) {
		try {
			// biome-ignore lint/style/noArguments: <explanation>
			const args = [...arguments];
			const error = check(
				"insert(table:string, cols:array, values:array|QueryBuilder)",
				args,
			);
			if (error) {
				this.error = error;
				throw new Error(error);
			}
			let command;
			if (values instanceof QueryBuilder) {
				console.log("[insert]QueryBuilder... next", next);
				command = this.language.insert(table, cols, values, next);
				console.log("[insert] command ", command);
				next.q = "";
			} else {
				command = this.language.insert(table, cols, values, next);
			}
			return this.toNext([command, next]);
		} catch (error) {
			this.error = error.message;
		}
		return this;
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
			const updateCommand = await this.language.update(table, sets);
			return this.toNext([updateCommand, next], "\n");
		} catch (error) {
			this.error = error.message;
		}
	}
	delete(from) {
		this.commandStack.push("delete");
		try {
			if (this.selectCommand?.length > 0) {
				if (this.selectStack.length) {
					this.selectCommand += `\n${this.selectStack.join("\n")}`;
					this.selectStack = [];
				}
				this.query.push(this.selectCommand);
			}
			if (this.selectCommand instanceof Command) {
				this.selectCommand.toJson();
				this.query.push(this.selectCommand.toString());
			}
			this.selectCommand = this.language.delete(from);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	// funciones SET

	/**
	 * @param {string|column} funcion - argumento o columna sobre la que opera la función SQL
	 * @param {string} alias - nombre AS
	 */
	functionOneParam() {
		const names = ["count", "max", "min", "sum", "avg", "upper", "lower"];
		for (const name of names) {
			this[name] = (column, alias, next) => {
				console.log("[functionOneParam][%s] next.parent", name, next.parent);
				const command = this.language[name](column, alias);
				if (next.parent === "select") {
					next.column = command;
					return this.toNext([next], "\n");
				}
				return this.toNext([command, next], "\n");
			};
		}
	}

	// funciones VALOR de cadena
	substr(column, inicio, ...options) {
		return this.language.substr(column, inicio, ...options);
	}

	/**
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - columna
	 * @param {Array<column,string>} casos - [condicion, resultado]
	 * @param {string} defecto - Caso else
	 * @returns {string}
	 */
	case(column, casos, defecto) {
		return this.language.case(column, casos, defecto);
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
			this[name] = () => this.language[name]();
		}
	}

	//cursores

	createCursor(name, expresion, options) {
		this.commandStack.push("createCursor");
		try {
			this.cursores[name] = new Cursor(name, expresion, options, this);
			this.query.push(this.cursores[name].toString().replace(";", ""));
		} catch (error) {
			this.error = error.message;
		}
		return this.cursores[name];
	}
	openCursor(name) {
		this.commandStack.push("openCursor");
		try {
			this.cursores[name].open();
			return this.cursores[name];
		} catch (error) {
			this.error = error.message;
		}
	}
	closeCursor(name) {
		this.commandStack.push("closeCursor");
		try {
			this.cursores[name].close();
			return this;
		} catch (error) {
			this.error = error.message;
		}
	}

	setTransaction(options) {
		return new Transaction(this, options);
	}

	setConstraints(restrictions, type) {
		this.commandStack.push("setConstraints");
		try {
			this.query.push(`${this.language.setConstraints(restrictions, type)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	async queryJoin(options) {
		if (/^(subselect)$/i.test(options?.as) === false) {
			if (this.prevInstance !== null) {
				const prevQuery = await this.prevInstance.queryJoin(options);
				if (prevQuery !== null) {
					this.query.unshift(prevQuery);
				}
				this.prevInstance = null;
			}
		}

		if (this.alterTableCommand !== undefined) {
			if (this.alterTableCommand instanceof Promise) {
				this.alterTableCommand = this.alterTableCommand;
			}

			if (this.alterTableCommand instanceof Command) {
				this.query.push(this.alterTableCommand);
				this.alterTableCommand = undefined;
			}
			if (this.alterTableCommand?.length > 0) {
				this.alterTableCommand = this.alterTableStack.join(";\n");
				this.query.push(this.alterTableCommand);
				this.alterTableCommand = undefined;
				this.alterTableStack = [];
			}
		}
		if (this.selectCommand?.length > 0) {
			if (this.selectStack.length > 0) {
				this.selectStack.sort((a, b) => {
					if (/^(LIMIT)/i.test(a) && /^(OFFSET)/i.test(b)) return -1;
					if (/^(OFFSET)/i.test(a) && /^(LIMIT)/i.test(b)) return 1;
					if (/^(LIMIT|OFFSET)/i.test(b)) return -1;
					return 0;
				});
				this.selectCommand += `\n${this.selectStack.join("\n")}`;
			}
			this.query.push(this.selectCommand);
			this.selectCommand = undefined;
			this.selectStack = [];
		}
		if (this.selectCommand instanceof Command) {
			console.log(
				"[queryJoin] el comando select \n>>> %o \n <<<",
				this.selectCommand,
			);
			await this.selectCommand.toJson(); // evaluara el comando
			this.query.push(this.selectCommand);
			this.selectCommand = undefined;
		}

		if (this.query.length > 0) {
			const data = await Promise.all(this.query);
			const send = data
				.filter((item) => item !== null)
				.join(";\n")
				.concat(";")
				.replace(";;", ";");
			if (this.error) {
				throw new Error(`${send}\n> ${this.error}`, { cause: this.error });
			}
			return `${send}`;
		}
		return null;
	}
	async toString(options) {
		let joinQuery = await this.promise;
		joinQuery = joinQuery.q.join("\n");
		log("toString", "joinQuery\n", joinQuery);
		return joinQuery;
	}
	dropQuery() {
		this.query = [];
		this.selectCommand = undefined;
		this.selectStack = [];
		this.alterTableCommand = undefined;
		this.alterTableStack = [];
		this.promiseStack = Promise.resolve({});
		return this;
	}
	/**
	 *
	 * @param {Boolean} testOnly - Si es true no llama al driver
	 * @returns
	 */
	async execute(testOnly = false) {
		if (testOnly) {
			console.log(">[QueryBuilder] [execute] en modo 'solo-test'\n");
			return this.promise;
		}
		if (!this.driverDB) {
			throw new Error("No ha establecido un driver.");
		}

		try {
			const send = await this.promise;
			await this.driverDB.execute(send);
			this.result = this.driverDB.response();
			this.error = undefined;
			// this.commandStack.push("execute");
			return this;
		} catch (error) {
			this.error = `Capture on QueryBuilder [execute] ${error.message} ${this.commandStack.join("->")}`;
			this.result = undefined;
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
