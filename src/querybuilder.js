import { Types, check } from "./utils/utils.js";
import Column from "./column.js";
import Cursor from "./cursor.js";
import Expresion from "./expresion.js";
class QueryBuilder {
	constructor(language, options = {}) {
		this.languageClass = language;
		this.options = options;
		this.language = new language();
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
		this.prevInstance = null;
	}

	driver(driverClass, params) {
		this.driverDB = new driverClass(params);
		this.params = params;
		return this;
	}
	use(database) {
		this.commandStack.push("use");
		const command = this.language.use(database);
		if (command === null) {
			if (this.driverDB !== undefined) {
				this.driverDB.use(database);
			}
		} else {
			this.query.push(command);
		}
		return this;
	}
	/** 
	@param {string} name - Nombre de la base de datos
 */
	createDatabase(name, options) {
		this.commandStack.push("createDatabase");
		try {
			this.query.push(
				`${this.language.createDatabase(name.validSqlId(), options)}`,
			);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	dropDatabase(name, options) {
		this.commandStack.push("dropDatabase");
		this.query.push(`${this.language.dropDatabase(name, options)}`);
		return this;
	}
	createSchema(name, options) {
		this.commandStack.push("createSchema");
		try {
			this.query.push(
				`${this.language.createSchema(name.validSqlId(), options)}`,
			);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	dropSchema(name, options) {
		this.commandStack.push("dropSchema");
		this.query.push(`${this.language.dropSchema(name, options)}`);
		return this;
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
	createTable(name, options) {
		this.commandStack.push("createTable");
		try {
			if (options?.cols === undefined) {
				this.error = "Tiene que especificar como mínimo una columna";
			}
			const sql = `${this.language.createTable(name.validSqlId(), options)}`;
			this.query.push(sql);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	alterTable(name) {
		this.commandStack = ["alterTable"];
		if (this.alterTableCommand?.length > 0) {
			this.query.push(this.alterTableCommand);
			this.alterTableCommand = undefined;
		}
		this.alterTableCommand = this.language.alterTable(name);
		this.alterTableStack = [];
		this.alterTableComands();
		return this;
	}

	alterTableComands() {
		const comands = ["addColumn", "alterColumn", "dropColumn", "addConstraint"];
		for (const comand of comands) {
			this[comand] = (name, options) => {
				this.commandStack.push(comand);
				const alterTablePos = this.commandStack.indexOf("alterTable");
				if (alterTablePos !== -1) {
					this.alterTableStack.push(
						`${this.alterTableCommand}${this.language[comand](name, options)}`,
					);
					return this;
				}
				this.error = `No se pueden añadir columnas sin un 'ALTER TABLE'`;
			};
		}
		const alterColums = ["setDefault", "dropDefault"];
		for (const comand of alterColums) {
			this[comand] = (value) => {
				const alterColumnPos = this.commandStack.lastIndexOf("alterColumn");
				if (alterColumnPos !== -1) {
					this.alterTableStack[alterColumnPos - 1] +=
						this.language[comand](value);
				} else {
					this.error = "No es posible aplicar, falta el comando 'alterColumn'";
				}
				return this;
			};
		}
	}

	dropTable(name, option) {
		this.commandStack.push("dropTable");
		this.query.push(`${this.language.dropTable(name, option)}`);
		return this;
	}
	createType(name, options) {
		this.commandStack.push("createType");
		try {
			this.query.push(
				`${this.language.createType(name.validSqlId(), options)}`,
			);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	createAssertion(name, assertion) {
		this.commandStack.push("createAssertion");
		try {
			this.query.push(
				`${this.language.createAssertion(name.validSqlId(), assertion)}`,
			);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	createDomain(name, options) {
		this.commandStack.push("createDomain");
		try {
			this.query.push(
				`${this.language.createDomain(name.validSqlId(), options)}`,
			);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	createView(name, options) {
		this.commandStack.push("createView");
		try {
			this.query.push(
				`${this.language.createView(name.validSqlId(), options)}`,
			);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	dropView(name) {
		this.commandStack.push("dropView");
		try {
			this.query.push(`${this.language.dropView(name)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	// Seguridad

	createRoles(names, options) {
		this.commandStack.push("createRoles");
		try {
			this.query.push(`${this.language.createRoles(names, options)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	dropRoles(names, options) {
		this.commandStack.push("dropRoles");
		try {
			this.query.push(`${this.language.dropRoles(names, options)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	grant(privilegios, on, to, options) {
		this.commandStack.push("grant");
		try {
			this.query.push(`${this.language.grant(privilegios, on, to, options)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	revoke(privilegios, on, from, options) {
		this.commandStack.push("revoke");
		try {
			this.query.push(
				`${this.language.revoke(privilegios, on, from, options)}`,
			);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	grantRoles(roles, users, options) {
		this.commandStack.push("grantRoles");
		try {
			this.query.push(`${this.language.grantRoles(roles, users, options)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	revokeRoles(roles, from, options) {
		this.commandStack.push("revokeRoles");
		try {
			this.query.push(`${this.language.revokeRoles(roles, from, options)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	//Consulta de datos SQL
	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options) {
		try {
			if (/^(union)$/i.test(this.commandStack[0])) {
				this.selectCommand += this.language.select(columns, options);
				this.commandStack.push("select");
				return this;
			}
			const nuevoSelect = new QueryBuilder(this.languageClass, this.options);
			nuevoSelect.selectCommand = nuevoSelect.language.select(columns, options);
			nuevoSelect.commandStack.push("select");
			nuevoSelect.prevInstance = this;
			nuevoSelect.driverDB = this?.driverDB;
			return nuevoSelect;
		} catch (error) {
			this.error = error.message;
		}
	}

	checkFrom(tables, alias) {
		const error = check("checkFrom(tables:string|array, alias:array)", [
			tables,
			alias,
		]);
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
	from(tables, alias) {
		this.checkFrom(tables, alias);
		this.commandStack.push("from");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.from(tables, alias));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select'";
		}
		return this;
	}

	joins() {
		const joinTypes = [
			"crossJoin",
			"naturalJoin",
			"colJoin",
			"innerJoin",
			"join",
			"leftJoin",
			"rightJoin",
			"fullJoin",
		];
		for (const join of joinTypes) {
			this[join] = (tables, alias, using) => {
				this.commandStack.push(join);
				this.checkFrom(tables, alias);
				if (this.selectCommand?.length > 0) {
					this.selectStack.push(this.language[join](tables, alias, using));
				} else {
					this.error = "No es posible aplicar, falta el comando 'select'";
				}
				return this;
			};
		}
	}

	union(option) {
		const next = new QueryBuilder(this.languageClass, this.options);
		next.commandStack.push("union");
		this.language.union(this, next, option);
		return next;
	}
	where(predicados) {
		this.commandStack.push("where");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.where(predicados));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select|delete'";
		}
		return this;
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
			"distinct",
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

		const logicos = ["and", "or", "not"];
		for (const operTwo of operTwoCols) {
			this[operTwo] = (a, b) => this.language[operTwo](a, b);
		}
		for (const operOne of operOneCol) {
			this[operOne] = (a) => this.language[operOne](a);
		}
		for (const operTree of operTreeArg) {
			this[operTree] = (a, b, c) => this.language[operTree](a, b, c);
		}

		for (const oper of logicos) {
			this[oper] = (...predicados) => this.language[oper](...predicados);
		}
	}

	in(columna, ...values) {
		this.commandStack.push("in");
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
		const error = check("col(name:string, table:string)", [name, table]);
		if (error) {
			throw new Error(error);
		}
		this.commandStack.push("col");
		return new Column(name, table);
	}
	/**
	 * Es igual a col salvo el orden de los parametros
	 * @param {string} table - nombre de la tabla
	 * @param {string} name - nombre de la columna
	 * @returns {Column}
	 */
	coltn(table, name) {
		const error = check("col(name:string, table:string)", [name, table]);
		if (error) {
			throw new Error(error);
		}
		this.commandStack.push("coltn");
		return new Column(name, table);
	}

	exp(expresion) {
		return new Expresion(expresion);
	}

	groupBy(columns, options) {
		this.commandStack.push("groupBy");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.groupBy(columns, options));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select'";
		}
		return this;
	}
	having(predicado, options) {
		this.commandStack.push("having");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.having(predicado, options));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select'";
		}
		return this;
	}
	orderBy(columns) {
		this.commandStack.push("orderBy");
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.orderBy(columns));
		} else {
			this.error = "No es posible aplicar, falta el comando 'select'";
		}
		return this;
	}
	// Mofificacion de Datos
	/**
	 *
	 * @param {string} table - nombre de la tabla
	 * @param {array} cols - columnas a insertar
	 * @param {array} values - Array de Arrays con los valores
	 * @returns
	 */
	insert(table, cols, values) {
		const error = check("insert(table:string, cols:array, values:array)", [
			table,
			cols,
			values,
		]);
		if (error) {
			throw new Error(error);
		}

		this.commandStack.push("insert");
		try {
			this.query.push(this.language.insert(table, cols, values));
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	update(table, sets) {
		this.commandStack.push("update");
		try {
			if (Array.isArray(sets)) {
				this.error = "El argumento debe ser un objeto JSON";
			}
			if (this.selectCommand?.length > 0) {
				if (this.selectStack.length) {
					this.selectCommand += `\n${this.selectStack.join("\n")}`;
					this.selectStack = [];
				}
				this.query.push(this.selectCommand);
			}
			this.selectCommand = this.language.update(table, sets);
		} catch (error) {
			this.error = error.message;
		}
		return this;
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
			this[name] = (column, alias) => this.language[name](column, alias);
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

	// transacciones
	setTransaction(config) {
		this.commandStack.push("setTransaction");
		try {
			this.query.push(`${this.language.setTransaction(config)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	startTransaction(config) {
		this.commandStack.push("startTransaction");
		try {
			this.query.push(`${this.language.startTransaction(config)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
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
	setSavePoint(name) {
		this.commandStack.push("setSavePoint");
		try {
			this.query.push(`${this.language.setSavePoint(name)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	clearSavePoint(name) {
		this.commandStack.push("clearSavePoint");
		try {
			this.query.push(`${this.language.clearSavePoint(name)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	commit() {
		this.commandStack.push("commit");
		try {
			this.query.push(`${this.language.commit()}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}
	rollback(savepoint) {
		this.commandStack.push("rollback");
		try {
			this.query.push(`${this.language.rollback(savepoint)}`);
		} catch (error) {
			this.error = error.message;
		}
		return this;
	}

	queryJoin(options) {
		if (/^(subselect)$/i.test(options?.as) === false) {
			if (this.prevInstance !== null) {
				const prevQuery = this.prevInstance.queryJoin(options);
				if (prevQuery !== null) {
					this.query.unshift(prevQuery);
				}
				this.prevInstance = null;
			}
		}
		if (this.alterTableCommand?.length > 0) {
			this.alterTableCommand = this.alterTableStack.join(";\n");
			this.query.push(this.alterTableCommand);
			this.alterTableCommand = undefined;
			this.alterTableStack = [];
		}
		if (this.selectCommand?.length > 0) {
			if (this.selectStack.length > 0) {
				this.selectCommand += `\n${this.selectStack.join("\n")}`;
			}
			this.query.push(this.selectCommand);
			this.selectCommand = undefined;
			this.selectStack = [];
		}

		if (this.query.length > 0) {
			const send = this.query.join(";\n").concat(";").replace(";;", ";");
			return `${send}`;
		}
		return null;
	}
	toString(options) {
		let joinQuery = this.queryJoin(options);
		if (/^(subselect)$/i.test(options?.as)) {
			joinQuery = joinQuery.replace(/;$/, "");
		}
		this.dropQuery();
		return joinQuery;
	}
	dropQuery() {
		this.query = [];
		this.selectCommand = undefined;
		this.selectStack = [];
		this.alterTableCommand = undefined;
		this.alterTableStack = [];
		return this;
	}
	async execute() {
		if (!this.driverDB) {
			throw new Error("No ha establecido un driver.");
		}

		try {
			const send = this.queryJoin();
			await this.driverDB.execute(send);
			this.result = this.driverDB.response();
			this.error = undefined;
			this.commandStack.push("execute");
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
