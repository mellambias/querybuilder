import { Types } from "./utils/utils.js";
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
		this.queryResult = undefined;
		this.queryResultError = undefined;
		this.alterTableCommand = undefined;
		this.alterTableStack = [];
		this.selectCommand = undefined;
		this.selectStack = [];
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
		return this;
	}
	dropDatabase(name, options) {
		this.query.push(`${this.language.dropDatabase(name, options)}`);
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
		return this;
	}

	dropSchema(name, options) {
		this.query.push(`${this.language.dropSchema(name, options)}`);
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
		return this;
	}
	alterTable(name) {
		if (this.alterTableCommand?.length > 0) {
			this.query.push(this.alterTableCommand);
			this.alterTableCommand = undefined;
		}
		this.alterTableCommand = this.language.alterTable(name);
		this.alterTableStack = [];
		return this;
	}
	addColumn(name, options) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableCommand += this.language.addColumn(name, options);
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		return this;
	}
	alterColumn(name) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack.push(this.language.alterColumn(name));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		return this;
	}

	dropColumn(name, option) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack.push(this.language.dropColumn(name, option));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		return this;
	}

	setDefault(value) {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack[this.alterTableStack.length - 1] +=
				this.language.setDefault(value);
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
		return this;
	}
	dropDefault() {
		if (this.alterTableCommand?.length > 0) {
			this.alterTableStack[this.alterTableStack.length - 1] +=
				this.language.dropDefault();
		} else {
			throw new Error("No es posible aplicar, falta el comando 'alterTable'");
		}
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
		return this;
	}
	dropView(name) {
		try {
			this.query.push(`${this.language.dropView(name)}`);
		} catch (error) {
			throw new Error(error.message);
		}
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
		return this;
	}

	grant(privilegios, on, to, options) {
		try {
			this.query.push(`${this.language.grant(privilegios, on, to, options)}`);
		} catch (error) {
			throw new Error(error.message);
		}
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
		return this;
	}

	grantRoles(roles, users, options) {
		try {
			this.query.push(`${this.language.grantRoles(roles, users, options)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		return this;
	}
	revokeRoles(roles, from, options) {
		try {
			this.query.push(`${this.language.revokeRoles(roles, from, options)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		return this;
	}
	//Consulta de datos SQL
	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options) {
		try {
			if (this.selectCommand?.length > 0) {
				if (this.selectStack.length) {
					this.selectCommand += `\n${this.selectStack.join("\n")}`;
					this.selectStack = [];
				}
				this.query.push(this.selectCommand);
			}
			this.selectCommand = this.language.select(columns, options);
		} catch (error) {
			throw new Error(error.message);
		}
		return this;
	}
	subSelect(columns, options) {
		const sub = new QueryBuilder(this.languageClass, this.options);
		return sub.select(columns, options);
	}
	from(tables) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.from(tables));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		return this;
	}
	where(predicados) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.where(predicados));
		} else {
			throw new Error(
				"No es posible aplicar, falta el comando 'select|delete'",
			);
		}
		return this;
	}

	// Predicados
	eq(a, b) {
		return this.language.operador("eq", a, b);
	}
	ne(a, b) {
		return this.language.operador("ne", a, b);
	}
	gt(a, b) {
		return this.language.operador("gt", a, b);
	}
	gte(a, b) {
		return this.language.operador("gte", a, b);
	}
	lt(a, b) {
		return this.language.operador("lt", a, b);
	}
	lte(a, b) {
		return this.language.operador("lte", a, b);
	}
	isNull(columnas) {
		return this.language.operador("isNull", columnas);
	}
	isNotNull(columnas) {
		return this.language.operador("isNotNull", columnas);
	}

	in(columna, ...values) {
		return this.language.in(columna, ...values);
	}
	notIn(columna, ...values) {
		return this.language.notIn(columna, ...values);
	}
	exists(subSelect) {
		return this.language.exists(subSelect);
	}
	notExists(subSelect) {
		return this.language.notExists(subSelect);
	}
	any(subSelect) {
		return this.language.any(subSelect);
	}
	some(subSelect) {
		return this.language.some(subSelect);
	}
	all(subSelect) {
		return this.language.all(subSelect);
	}

	and(...predicados) {
		return this.language.logicos("AND", ...predicados);
	}
	or(...predicados) {
		return this.language.logicos("OR", ...predicados);
	}
	not(...predicados) {
		return this.language.logicos("NOT", ...predicados);
	}
	between(a, b) {
		return this.language.logicos("between", a, b);
	}
	like(a, b) {
		return this.language.logicos("like", a, b);
	}
	notLike(a, b) {
		return this.language.logicos("NOT LIKE", a, b);
	}

	groupBy(columns, options) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.groupBy(columns, options));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		return this;
	}
	having(predicado, options) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.having(predicado, options));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		return this;
	}
	orderBy(columns) {
		if (this.selectCommand?.length > 0) {
			this.selectStack.push(this.language.orderBy(columns));
		} else {
			throw new Error("No es posible aplicar, falta el comando 'select'");
		}
		return this;
	}
	// Mofificacion de Datos
	insert(table, cols, values) {
		try {
			this.query.push(`${this.language.insert(table, cols, values)}`);
		} catch (error) {
			throw new Error(error.message);
		}
		return this;
	}
	update(table, sets) {
		try {
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
		return `${send};`;
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
