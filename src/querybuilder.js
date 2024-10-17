import { Types } from "./utils/utils.js";
import Column from "./column.js";
import Cursor from "./cursor.js";
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
	}

	driver(driverClass, params) {
		this.driverDB = new driverClass(params);
		this.params = params;
		return this;
	}
	use(database) {
		const command = this.language.use(database);
		if (command === null) {
			if (this.driverDB !== undefined) {
				this.driverDB.use(database);
			}
		} else {
			this.query.push(command);
		}
		this.commandStack.push("use");
		return this;
	}
	async execute() {
		if (!this.driverDB) {
			throw new Error("No ha establecido un driver.");
		}
		try {
			await this.driverDB.execute(this.toString());
			this.queryResult = this.driverDB.response();
			this.queryResultError = "";
			this.commandStack.push("execute");
			return this;
		} catch (error) {
			this.queryResultError = error;
			this.queryResult = "";
			throw new Error(this.error);
		}
	}

	createDatabase(name, options) {
		try {
			this.query.push(
				`${this.language.createDatabase(name.validSqlId(), options)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createDatabase");
		return this;
	}
	dropDatabase(name, options) {
		this.query.push(`${this.language.dropDatabase(name, options)}`);
		this.commandStack.push("dropDatabase");
		return this;
	}
	createSchema(name, options) {
		try {
			this.query.push(
				`${this.language.createSchema(name.validSqlId(), options)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createSchema");
		return this;
	}

	dropSchema(name, options) {
		this.query.push(`${this.language.dropSchema(name, options)}`);
		this.commandStack.push("dropSchema");
		return this;
	}
	createTable(name, options) {
		try {
			this.query.push(
				`${this.language.createTable(name.validSqlId(), options)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createTable");
		return this;
	}
	alterTable(name) {
		if (this.alterTableCommand?.length > 0) {
			this.query.push(this.alterTableCommand);
			this.alterTableCommand = undefined;
		}
		this.alterTableCommand = this.language.alterTable(name);
		this.alterTableStack = [];
		this.commandStack.push("alterTable");
		return this;
	}
	addColumn(name, options) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableCommand += this.language.addColumn(name, options);
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		this.commandStack.push("addColumn");
		return this;
	}
	alterColumn(name) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack.push(this.language.alterColumn(name));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		this.commandStack.push("alterColumn");
		return this;
	}

	dropColumn(name, option) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack.push(this.language.dropColumn(name, option));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		this.commandStack.push("dropColumn");
		return this;
	}

	setDefault(value) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack[this.alterTableStack.length - 1] +=
				this.language.setDefault(value);
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		this.commandStack.push("setDefault");
		return this;
	}
	dropDefault() {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack[this.alterTableStack.length - 1] +=
				this.language.dropDefault();
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		this.commandStack.push("dropDefault");
		return this;
	}

	addConstraint(name, option) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableCommand += this.language.addConstraint(name, option);
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		return this;
	}

	dropTable(name, option) {
		this.query.push(`${this.language.dropTable(name, option)}`);
		this.commandStack.push("dropTable");
		return this;
	}
	createType(name, options) {
		try {
			this.query.push(
				`${this.language.createType(name.validSqlId(), options)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createType");
		return this;
	}

	createAssertion(name, assertion) {
		try {
			this.query.push(
				`${this.language.createAssertion(name.validSqlId(), assertion)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createAssertion");
		return this;
	}

	createDomain(name, options) {
		try {
			this.query.push(
				`${this.language.createDomain(name.validSqlId(), options)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createDomain");
		return this;
	}

	createView(name, options) {
		try {
			this.query.push(
				`${this.language.createView(name.validSqlId(), options)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createView");
		return this;
	}
	dropView(name) {
		try {
			this.query.push(`${this.language.dropView(name)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("dropView");
		return this;
	}

	// Seguridad

	createRole(name, options) {
		try {
			this.query.push(`${this.language.createRole(name, options)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		return this;
	}
	dropRoles(names) {
		try {
			this.query.push(`${this.language.dropRoles(names)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("dropRoles");
		return this;
	}

	grant(privilegios, on, to, options) {
		try {
			this.query.push(`${this.language.grant(privilegios, on, to, options)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("grant");
		return this;
	}

	revoke(privilegios, on, from, options) {
		try {
			this.query.push(
				`${this.language.revoke(privilegios, on, from, options)}`,
			);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("revoke");
		return this;
	}

	grantRoles(roles, users, options) {
		try {
			this.query.push(`${this.language.grantRoles(roles, users, options)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("grantRoles");
		return this;
	}
	revokeRoles(roles, from, options) {
		try {
			this.query.push(`${this.language.revokeRoles(roles, from, options)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("revokeRoles");
		return this;
	}
	//Consulta de datos SQL
	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options) {
		try {
			if (this.commandStack[0] === "union") {
				this.selectCommand += this.language.select(columns, options);
				this.commandStack = ["select"];
				return this;
			}
			const nuevoSelect = new QueryBuilder(this.languageClass, this.options);
			nuevoSelect.selectCommand = nuevoSelect.language.select(columns, options);
			return nuevoSelect;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	subSelect(columns, options) {
		const sub = new QueryBuilder(this.languageClass, this.options);
		this.commandStack.push("subSelect");
		return sub.select(columns, options);
	}
	from(tables, alias) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.from(tables, alias));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		this.commandStack.push("from");
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
				if (this.selectCommand?.length > 0) {
					this.selectStack.push(this.language[join](tables, alias, using));
				} else {
					throw new Error("No es posible aplicar, falta el comando 'select'");
				}
				this.commandStack.push(join);
				return this;
			};
		}
	}

	union(option) {
		const next = new QueryBuilder(this.languageClass, this.options);
		this.language.union(this, next, option);
		next.commandStack.push("union");
		return next;
	}
	where(predicados) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.where(predicados));
		} else {
			throw new Error(
				"No es posible aplicar, falta el comando 'select|delete'",
			);
		}
		this.commandStack.push("where");
		return this;
	}
	whereCursor(cursorName) {
		if (this.cursores?.[cursorName] === undefined) {
			throw new Error(`El cursor '${cursorName}' no ha sido definido`);
		}
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.whereCursor(cursorName));
		} else {
			throw new Error(
				"No es posible aplicar, falta el comando 'select|delete'",
			);
		}
		this.commandStack.push("whereCursor");
		return this;
	}
	on(predicados) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.on(predicados));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'FROM'");
		}
		this.commandStack.push("on");
		return this;
	}

	// Predicados

	predicados() {
		const operTwoCols = [
			"eq",
			"ne",
			"gt",
			"gte",
			"lt",
			"lte",
			"between",
			"like",
			"notLike",
		];
		const operOneCol = [
			"isNull",
			"isNotNull",
			"exists",
			"notExists",
			"any",
			"some",
			"all",
		];
		const logicos = ["and", "or", "not"];
		for (const operTwo of operTwoCols) {
			this[operTwo] = (a, b) => this.language[operTwo](a, b);
		}
		for (const operOne of operOneCol) {
			this[operOne] = (a) => this.language[operOne](a);
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

	col(name, table) {
		return new Column(name, table);
	}
	groupBy(columns, options) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.groupBy(columns, options));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		this.commandStack.push("groupBy");
		return this;
	}
	having(predicado, options) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.having(predicado, options));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		this.commandStack.push("having");
		return this;
	}
	orderBy(columns) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.orderBy(columns));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		this.commandStack.push("orderBy");
		return this;
	}
	// Mofificacion de Datos
	insert(table, cols, values) {
		try {
			this.query.push(this.language.insert(table, cols, values));
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("insert");
		return this;
	}
	update(table, sets) {
		try {
			if (Array.isArray(sets)) {
				throw new Error("El argumento debe ser un objeto JSON");
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
			throw new Error(error.message);
		}
		this.commandStack.push("update");
		return this;
	}
	delete(from) {
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
			throw new Error(error.message);
		}
		this.commandStack.push("delete");
		return this;
	}
	// funciones SET
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
		try {
			this.cursores[name] = new Cursor(name, expresion, options, this);
			this.query.push(this.cursores[name].toString().replace(";", ""));
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("createCursor");
		return this.cursores[name];
	}
	openCursor(name) {
		try {
			this.commandStack.push("openCursor");
			this.cursores[name].open();
			return this.cursores[name];
		} catch (error) {
			throw new Error(error.message);
		}
	}
	closeCursor(name) {
		try {
			this.commandStack.push("closeCursor");
			this.cursores[name].close();
			return this;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// transacciones
	setTransaction(config) {
		try {
			this.query.push(`${this.language.setTransaction(config)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("setTransaction");
		return this;
	}
	startTransaction(config) {
		try {
			this.query.push(`${this.language.startTransaction(config)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("startTransaction");
		return this;
	}
	setConstraints(restrictions, type) {
		try {
			this.query.push(`${this.language.setConstraints(restrictions, type)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("setConstraints");
		return this;
	}
	setSavePoint(name) {
		try {
			this.query.push(`${this.language.setSavePoint(name)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("setSavePoint");
		return this;
	}
	clearSavePoint(name) {
		try {
			this.query.push(`${this.language.clearSavePoint(name)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("clearSavePoint");
		return this;
	}
	commit() {
		try {
			this.query.push(`${this.language.commit()}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("commit");
		return this;
	}
	rollback(savepoint) {
		try {
			this.query.push(`${this.language.rollback(savepoint)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		this.commandStack.push("rollback");
		return this;
	}
	toString() {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableCommand += this.alterTableStack.join(",\n");
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
		const send = this.query.join(";\n");
		this.query = [];
		return `${send}${/(;)$/.test(send) ? "" : ";"}`;
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
}
export default QueryBuilder;
