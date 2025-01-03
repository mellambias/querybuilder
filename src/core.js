/*
@description Implementa el SQL 2006
*/
import QueryBuilder from "./querybuilder.js";
import sql2006 from "./comandos/sql2006.js";
import Expresion from "./expresion.js";
import Column from "./column.js";
import { log } from "./utils/utils.js";

class Core {
	constructor() {
		this.dataType = "sql2006";
		this.predicados();
		this.functionOneParam();
		this.functionDate();
		this.joins();
		this.fetches();
		this.currentDatabase = null;
	}

	getStatement(command, scheme, params, charJoin = "\n") {
		const values = params?.options ? { ...params, ...params.options } : params;
		scheme._options = { ...params?.options };
		scheme._values = { ...values };
		const defaultOptions = Object.keys(scheme?.defaults || {});
		const commandArray = scheme?.orden
			.filter(
				(key) =>
					values[key] !== undefined || defaultOptions.indexOf(key) !== -1,
			)
			.map((key) => {
				if (typeof scheme[key] !== "function") {
					throw new Error(
						`${key} tiene que ser una funcion ${typeof scheme[key]}`,
					);
				}
				const callFunction = scheme[key].bind(this);
				if (values[key] !== undefined) {
					const respuesta = callFunction(values[key], scheme);
					return respuesta;
				}
				return callFunction(scheme.defaults[key], scheme);
			})
			.filter((result) => result !== undefined)
			.join(charJoin)
			.replaceAll(" \n", "\n")
			.trim();
		return `${command ? `${command} ` : ""}${commandArray}`;
	}

	getAccount(userOrRole, host = "%") {
		if (typeof userOrRole === "string") {
			return `'${userOrRole}'${host !== undefined ? `@'${host}'` : ""}`;
		}
		if (typeof userOrRole === "object") {
			return `'${userOrRole?.name}'${userOrRole?.host !== undefined ? `@'${userOrRole.host}'` : `@'${host}'`}`;
		}
	}

	// DDL
	createDatabase(name, options) {
		let query = `CREATE DATABASE ${name}`;
		for (const option in options) {
			query += `\n ${option} ${option[option]}`;
		}
		return query;
	}
	dropDatabase(name, options) {
		this.useDatabase = null;
		const query = `DROP DATABASE ${name}`;
		return query;
	}

	use(database) {
		this.useDatabase = database;
		return `USE ${database}`;
	}
	set useDatabase(value) {
		this.currentDatabase = value;
	}
	get useDatabase() {
		return this.currentDatabase;
	}
	createSchema(name, options) {
		return this.getStatement("CREATE SCHEMA", sql2006.createSchema, {
			name,
			options,
		});
	}
	dropSchema(name, options) {
		return this.getStatement("DROP SCHEMA", sql2006.dropSchema, {
			name,
			options,
		});
	}

	/*
	CREATE [ {GLOBAL | LOCAL} TEMPORARY ] TABLE <nombre de la tabla>
( <elemento de la tabla> [ {, <elemento de la tabla> }... ] )
[ ON COMMIT { PRESERVE | DELETE } ROWS ]
 */
	createTable(name, options) {
		return this.getStatement("CREATE", sql2006.createTable, {
			name,
			options,
		});
	}
	column(name, options) {
		const resultado = this.getStatement(
			"",
			sql2006.column,
			{ name, options },
			" ",
		).trim();
		return resultado;
	}

	tableConstraints(restricciones) {
		const command = [];
		for (const restriccion of restricciones) {
			command.push(
				this.getStatement("CONSTRAINT", sql2006.constraint, restriccion, " "),
			);
		}
		return command.join(",\n ");
	}
	alterTable(name) {
		return `ALTER TABLE ${name}`;
	}
	addColumn(name, options) {
		return `ADD COLUMN ${this.column(name, options)}`;
	}
	alterColumn(name) {
		return `ALTER COLUMN ${name}`;
	}

	dropColumn(name, option) {
		return this.getStatement("DROP", sql2006.dropColumn, { name, option }, " ");
	}
	setDefault(value) {
		return ` SET DEFAULT ${typeof value === "string" ? `'${value}'` : value}`;
	}

	dropDefault() {
		return " DROP DEFAULT";
	}

	addConstraint(name, option) {
		const constraint = [
			{
				name,
				check: option.check,
			},
		];
		return `ADD ${this.tableConstraints(constraint)}`;
	}

	dropTable(name, option) {
		return this.getStatement("DROP", sql2006.dropTable, { name, option }, " ");
	}

	createType(name, options) {
		return this.getStatement(
			"CREATE",
			sql2006.createType,
			{ name, options },
			" ",
		);
	}
	dropType(name, options) {
		return this.getStatement(
			"DROP TYPE",
			sql2006.dropType,
			{ name, options },
			" ",
		);
	}
	createAssertion(name, assertion) {
		return `CREATE ASSERTION ${name} CHECK ( ${assertion} )`;
	}
	createDomain(name, options) {
		return this.getStatement("CREATE DOMAIN", sql2006.createDomain, {
			name,
			options,
		});
	}
	createView(name, options) {
		return this.getStatement("CREATE", sql2006.createView, { name, options });
	}

	dropView(name) {
		return `DROP VIEW ${name}`;
	}
	// Seguridad

	createRoles(names, options) {
		return this.getStatement(
			"CREATE",
			sql2006.createRoles,
			{ names, options },
			" ",
		);
	}
	dropRoles(names, options) {
		return this.getStatement("", sql2006.dropRoles, { names, options });
	}

	grant(commands, on, to, options) {
		return this.getStatement("GRANT", sql2006.grant, {
			commands,
			on,
			to,
			options,
		});
	}
	revoke(commands, on, from, options) {
		return this.getStatement("REVOKE", sql2006.revoke, {
			commands,
			on,
			from,
			options,
		});
	}
	grantRoles(roles, users, options) {
		return this.getStatement(
			"GRANT",
			sql2006.grantRoles,
			{
				roles,
				users,
				options,
			},
			" ",
		);
	}
	revokeRoles(roles, from, options) {
		const sqlStack = [];
		if (typeof from === "string") {
			return this.getStatement(
				"REVOKE",
				sql2006.revokeRoles,
				{
					roles,
					from,
					options,
				},
				" ",
			);
		}
		for (const userId of from) {
			sqlStack.push(`${this.revokeRoles(roles, userId, options)}`);
		}
		return sqlStack.join(";\n");
	}

	//Comandos DQL
	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options, next) {
		console.log("[Core][select]next", next);
		return this.getStatement(
			"SELECT",
			sql2006.select,
			{
				columns,
				options,
				next,
			},
			" ",
		);
	}
	from(tables, alias) {
		if (typeof tables === "string") {
			if (typeof alias === "string") {
				return `FROM ${tables} ${alias}`;
			}
			if (Array.isArray(alias) && alias.length === 1) {
				return `FROM ${tables} ${alias[0]}`;
			}
			return `FROM ${tables}`;
		}
		if (Array.isArray(tables) && Array.isArray(alias)) {
			return `FROM ${tables
				.map((table, index) => `${table} AS ${alias[index]}`)
				.join(", ")}`;
		}
		if (Array.isArray(tables) && typeof alias === "string") {
			const [first, ...rest] = tables;
			rest.unshift(`${first} ${alias}`);
			return `FROM ${rest.join(", ")}`;
		}
		return `FROM ${tables.join(", ")}`;
	}
	joins() {
		const joinTypes = {
			crossJoin: "CROSS JOIN",
			naturalJoin: "NATURAL JOIN",
			innerJoin: "INNER JOIN",
			join: "JOIN",
			leftJoin: "LEFT OUTER JOIN",
			rightJoin: "RIGHT OUTER JOIN",
			fullJoin: "FULL OUTER JOIN",
		};
		for (const join in joinTypes) {
			if (typeof this[join] === "function") {
				continue;
			}
			this[join] = (tables, alias) => {
				if (typeof tables === "string" && typeof alias === "string") {
					return `${joinTypes[join]} ${tables} ${alias}`;
				}
				if (Array.isArray(tables) && Array.isArray(alias)) {
					return `FROM ${tables
						.map((table, index) => `${table} ${alias[index]}`)
						.join(` ${joinTypes[join]} `)}`;
				}
				if (join !== "join") {
					return `FROM ${tables.join(` ${joinTypes[join]} `)}`;
				}
				throw new Error(
					`[core:287] la funcion ${join}(tables,alias,using) => ${join}(${tables}, ${alias}, ${using})`,
				);
			};
		}
	}

	using(columnsInCommon) {
		if (Array.isArray(columnsInCommon)) {
			return `USING (${columnsInCommon.join(", ")})`;
		}
		return `USING (${columnsInCommon})`;
	}

	union(...selects) {
		let union = "\nUNION\n";
		const sql = [];
		for (const select of selects) {
			if (select instanceof QueryBuilder) {
				sql.push(select.queryJoin({ as: "subselect" }));
			}
			if (typeof select === "string") {
				sql.push(select);
			}
			if (typeof select === "object") {
				if (select?.all) {
					union = "\nUNION ALL\n";
				}
			}
		}
		return `${sql.join(union).replaceAll(";", "")}`;
	}
	where(predicados) {
		const sql = "WHERE";
		if (Array.isArray(predicados)) {
			return `${sql} ${predicados.join(", ")}`;
		}
		return `${sql} ${predicados}`;
	}

	whereCursor(cursorName) {
		return `WHERE CURRENT OF ${cursorName};`;
	}

	on(predicados) {
		const sql = "ON";
		if (typeof predicados === "string") {
			return `${sql} ${predicados}`;
		}

		return `${sql} ${predicados.join("\n")}`;
	}

	// Predicados
	predicados() {
		const operadores = {
			eq: "=",
			ne: "<>",
			gt: ">",
			gte: ">=",
			lt: "<",
			lte: "<=",
			isNull: "IS NULL",
			isNotNull: "IS NOT NULL",
		};
		for (const oper in operadores) {
			if (typeof this[oper] === "function") {
				continue;
			}
			this[oper] = (a, b) => {
				if (b !== undefined) {
					if (b instanceof QueryBuilder) {
						return `${a} ${operadores[oper]} ( ${b.toString({ as: "subselect" })} )`;
					}
					return `${a} ${operadores[oper]} ${typeof b === "string" ? (/^(ANY|SOME|ALL)$/.test(b.match(/^\w+/)[0]) ? b : `'${b}'`) : b}`;
				}
				if (Array.isArray(a)) {
					return `${a.join(` ${operadores[oper]}\nAND `)} ${operadores[oper]}`;
				}
				console.log("[predicados]", oper);
				return `${a} ${operadores[oper]}`;
			};
		}
		const logicos = {
			and: "AND",
			or: "OR",
			not: "NOT",
			like: "LIKE",
			notLike: "NOT LIKE",
			distinct: "DISTINCT",
		};
		for (const oper in logicos) {
			if (/^(and|or)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `\n${logicos[oper].toUpperCase()} ${predicados}`;
				};
			}
			if (/^(not)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `${logicos[oper].toUpperCase()} (${predicados})`;
				};
			}

			if (/^(like|notLike)$/i.test(oper)) {
				this[oper] = (...predicados) =>
					`${predicados[0]} ${logicos[oper].toUpperCase()} ('${predicados[1]}')`;
			}
			if (/^(distinct)$/i.test(oper)) {
				this[oper] = (...predicados) =>
					`${logicos[oper].toUpperCase()} ${predicados}`;
			}
		}
		const operTreeArg = { between: "BETWEEN", notBetween: "NOT BETWEEN" };
		for (const oper in operTreeArg) {
			if (/^(between|notBetween)$/i.test(oper)) {
				this[oper] = (campo, min, max) => {
					return `${campo} ${operTreeArg[oper].toUpperCase()} ${min} AND ${max}`;
				};
			}
		}
	}

	getSubselect(next) {
		const subSelect = [next.q.pop()];
		while (
			!subSelect[0].toUpperCase().includes("SELECT") &&
			next.q.length > 0
		) {
			subSelect.unshift(next.q.pop());
		}
		return subSelect;
	}

	getListValues(values, next) {
		log(["Core", "getListValues(values, next)"], "next", next);
		log(["Core", "getListValues(values, next)"], "values", values.length);
		let arrayValues = [];
		if (Array.isArray(values[0])) {
			arrayValues = values[0].map((value) => {
				if (value instanceof QueryBuilder) {
					log(["Core", "getListValues(values, next)"], "next", next);
					return this.getSubselect(next);
				}
				return value;
			});
		} else if (Array.isArray(values)) {
			arrayValues = values.map((value) => {
				if (value instanceof QueryBuilder) {
					log(["Core", "getListValues(values, next)"], "next %o", next);
					return this.getSubselect(next);
				}
				return value;
			});
		} else {
			if (values instanceof QueryBuilder) {
				return this.getSubselect(next).join("\n");
			}
			arrayValues = [values];
		}
		return arrayValues
			.map((item) => {
				if (typeof item === "string") {
					return `'${item}'`;
				}
				if (Array.isArray(item)) {
					return item.join("\n");
				}
				return item;
			})
			.join(", ");
	}
	in(columna, values, next) {
		log(["Core", "in(columna, values, next)"], "values", values.length);
		const response = this.getListValues(values, next);
		log(["Core", "in(columna, values, next)"], "respuesta %o", response);
		return `${columna} IN ( ${response} )`;
	}
	notIn(columna, values, next) {
		const response = this.getListValues(values, next);
		return `${columna} NOT IN ( ${response} )`;
	}
	exists(subSelect, next) {
		const response = this.getListValues(subSelect, next);
		return `EXISTS ( ${response} )`;
	}
	notExists(subSelect, next) {
		return `NOT EXISTS ( ${this.getListValues(subSelect, next)} )`;
	}

	async any(subSelect, next) {
		const subselect = await this.getListValues(subSelect, next);
		console.log("any", subselect);
		return `ANY ( ${subselect} )`;
	}
	some(subSelect, next) {
		return `SOME ( ${this.getListValues(subSelect, next)} )`;
	}
	all(subSelect, next) {
		return `ALL ( ${this.getListValues(subSelect, next)} )`;
	}

	groupBy(columns, options) {
		const sql = "GROUP BY";
		if (typeof columns === "string") {
			return `${sql} ${columns}`;
		}
		if (typeof columns === "object") {
			if (columns?.rollup !== undefined) {
				return `${sql} ROLLUP (${columns.rollup.join(", ")})`;
			}
			if (columns?.cube !== undefined) {
				return `${sql} CUBE (${columns.cube.join(", ")})`;
			}
		}
		return `${sql} ${columns.join(", ")}`;
	}
	having(predicado, options) {
		return `HAVING ${predicado}`;
	}
	orderBy(columns) {
		const colStack = [];
		const sql = "ORDER BY";
		if (Array.isArray(columns)) {
			for (const column of columns) {
				colStack.push(this.orderBy(column).replace(sql, "").trim());
			}
			return `${sql} ${colStack.join(", ")}`;
		}
		if (typeof columns === "string" || columns instanceof Column) {
			return `${sql} ${columns}`;
		}
		if (typeof columns === "object") {
			if (columns?.col !== undefined) {
				if (/^(ASC|DESC)/i.test(columns?.order)) {
					return `${sql} ${columns.col} ${columns.order.toUpperCase()}`;
				}
				return `${sql} ${columns.col}`;
			}
			throw new Error(`Falta el atributo 'col'`);
		}
	}

	// Mofificacion de Datos
	insert(table, cols, values, next) {
		let sql = "INSERT INTO";
		if (table !== undefined) {
			sql = `${sql} ${table}`;
		} else {
			throw new Error("Tiene que definir una tabla");
		}
		if (Array.isArray(cols)) {
			if (cols.length > 0) {
				sql = `${sql}\n( ${cols.join(", ")} )`;
			}
		}
		if (Array.isArray(values)) {
			if (Array.isArray(values[0])) {
				return `${sql}\nVALUES\n${values
					.map(
						(value) =>
							`(${value
								.map((item) => {
									if (typeof item === "string") {
										return `'${item}'`;
									}
									if (item instanceof QueryBuilder) {
										console.log("[Core][insert]next", next);
										return `${next.q}`;
									}
									return item;
								})
								.join(", ")})`,
					)
					.join(",\n")}`;
			}
			sql = `${sql}\nVALUES\n( ${values
				.map((value) => {
					if (typeof value === "string") {
						return `'${value}'`;
					}
					if (value instanceof QueryBuilder) {
						return `${next.q}`;
					}
					return value;
				})
				.join(", ")} )`;
		}
		if (values instanceof QueryBuilder) {
			sql = `${sql}\n${next.q}`;
		}
		if (typeof values === "string") {
			sql = `${sql}\n${values}`;
		}
		return sql;
	}
	async update(table, sets, next) {
		const sql = `UPDATE ${table}`;
		const setStack = [];
		for (const col in sets) {
			log(["Core", "update"], "Procesa columna", col);
			if (typeof sets[col] === "string" && /(:)/.test(sets[col]) === false) {
				setStack.push(`${col} = '${sets[col]}'`);
			} else if (sets[col] instanceof QueryBuilder) {
				log(
					["Core", "update"],
					"El valor de la columna %o es un QB recibe: %o",
					col,
					next,
				);
				const subSelect = next.q.join("\n");
				next.q = [];
				setStack.push(`${col} =\n( ${subSelect} )`);
			} else {
				setStack.push(`${col} = ${sets[col]}`);
			}
		}
		return `${sql}\nSET ${setStack.join(",\n")}`;
	}
	delete(from) {
		return `DELETE FROM ${from}`;
	}

	// Funciones SET

	functionOneParam() {
		const names = ["count", "max", "min", "sum", "avg", "upper", "lower"];
		for (const name of names) {
			if (typeof this[name] === "function") {
				continue;
			}
			/**
			 * @argument {string|column} column - Nombre de la columna sobre la funcion
			 * @argument {string} alias - alias de la columna AS
			 */
			this[name] = (column, alias) =>
				`${name.toUpperCase()}(${column})${typeof alias !== "undefined" ? ` AS ${alias}` : ""}`;
		}
	}

	// funciones VALOR de cadena

	/**
	 *
	 * @param {string|column} column - Columna
	 * @param {int} inicio - Valor inicial
	 * @param  {...any} options
	 * @returns {string} - instruccion
	 */
	substr(column, inicio, ...options) {
		if (typeof options[0] === "string") {
			return `SUBSTRING(${column} FROM ${inicio})${typeof options[0] !== "undefined" ? ` AS ${options[0]}` : ""}`;
		}
		return `SUBSTRING(${column} FROM ${inicio}${typeof options[0] !== "undefined" ? ` FOR ${options[0]}` : ""})${typeof options[1] !== "undefined" ? ` AS ${options[1]}` : ""}`;
	}

	/**
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - columna
	 * @param {Array<column,string>} casos - [condicion, resultado]
	 * @param {string} defecto - Caso else
	 * @returns {string}
	 */

	functionDate() {
		const names = {
			currentDate: "CURRENT_DATE",
			currentTime: "CURRENT_TIME",
			currentTimestamp: "CURRENT_TIMESTAMP",
			localTime: "LOCALTIME",
			localTimestamp: "LOCALTIMESTAMP",
		};
		for (const name in names) {
			this[name] = () => names[name];
		}
	} /**
	 * Este metodo tienr dos firmas:
	 * case(column, casos, defecto)
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - nombre de la columna AS
	 * @param {Array<Casos>} Casos - Array<column,string> => [ [condicion, resultado],...]
	 * @param {string} defecto - Caso else
	 *
	 * @returns {Expresion} - instancia de Expresion
	 * case(casos,defecto)
	 * @param {Array<column,string>} casos - {Array<Casos>} Casos  Array<column,string> => [ [condicion, resultado],...]
	 * @param {string} defecto - Caso else
	 *
	 * @returns {Expresion} - instancia de Expresion
	 */
	case(column, casos, defecto) {
		let command = "CASE\n";
		let items;
		let lastChance = "";
		if (Array.isArray(column)) {
			items = column;
			lastChance = casos;
		} else {
			items = casos;
			lastChance = defecto;
		}

		command += items
			.map((item) => {
				return `WHEN ${item[0]} THEN ${item[1]}`;
			})
			.join("\n");
		command += `\n${lastChance !== undefined ? `ELSE ${lastChance}\n` : ""}`;
		command += `${Array.isArray(column) ? "END" : `END AS ${column}`}`;
		return new Expresion(command);
	}
	// cursores
	createCursor(name, expresion, options) {
		if (typeof name !== "string" || typeof name === "undefined") {
			throw new Error("Es necesario un nombre valido para el cursor");
		}

		return this.getStatement(
			"DECLARE",
			sql2006.createCursor,
			{
				name,
				expresion,
				options,
			},
			" ",
		);
	}
	openCursor(name) {
		return `OPEN ${name}`;
	}
	closeCursor(name) {
		return `CLOSE ${name}`;
	}
	fetch(cursorName, hostVars) {
		return `FETCH ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
	}
	fetches() {
		const directions = ["NEXT", "PRIOR", "FIRST", "LAST"];
		const directionsWithValue = ["ABSOLUTE", "RELATIVE"];
		for (const comand of directions) {
			if (typeof this[comand] === "function") {
				continue;
			}
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (cursorName, direction, hostVars) => {
				return `FETCH ${direction.toUpperCase()} FROM ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
			};
		}
		for (const comand of directionsWithValue) {
			const comandName = `fetch${comand.toCapital()}`;
			if (typeof this[comandName] === "function") {
				continue;
			}
			this[comandName] = (cursorName, direction, filas, hostVars) => {
				return `FETCH ${direction.toUpperCase()} ${filas} FROM ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
			};
		}
	}
	// Transacciones
	setTransaction(config) {
		return this.getStatement(
			"SET TRANSACTION",
			sql2006.setTransaction,
			{
				options: config,
			},
			",\n",
		);
	}
	startTransaction(config) {
		return this.setTransaction(config).replace("SET", "START");
	}
	setConstraints(restrictions, type) {
		if (Array.isArray(restrictions)) {
			return `SET CONSTRAINTS ${restrictions.join(", ")} ${/^(DEFERRED|IMMEDIATE)$/i.test(type) ? type.toUpperCase() : ""}`;
		}
		return `SET CONSTRAINTS ${restrictions} ${/^(DEFERRED|IMMEDIATE)$/i.test(type) ? type.toUpperCase() : ""}`;
	}
	setSavePoint(name) {
		return `SAVEPOINT ${name}`;
	}
	clearSavePoint(name) {
		return `RELEASE SAVEPOINT ${name}`;
	}
	commit(name) {
		return "COMMIT";
	}
	rollback(savepoint) {
		if (typeof savepoint === "string") {
			return `ROLLBACK TO SAVEPOINT ${savepoint}`;
		}
		return "ROLLBACK";
	}
}
export default Core;
