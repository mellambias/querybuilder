/*
@description Implementa el SQL 2006
*/
import QueryBuilder from "./querybuilder.js";
import {
	grant,
	grantRoles,
	revoke,
	revokeRoles,
	createRole,
	dropRoles,
} from "./comandos/dcl.js";
import {
	createSchema,
	createTable,
	createType,
	createDomain,
	createView,
	dropSchema,
	column,
	constraint,
	dropColumn,
	dropTable,
} from "./comandos/ddl.js";
import { select } from "./comandos/dql.js";

class Core {
	constructor() {
		this.dataType = "sql2006";
		this.predicados();
		this.functionOneParam();
		this.functionDate();
		this.joins();
		this.fetches();
	}

	getStatement(command, scheme, params, charJoin = "\n") {
		const values = params?.options ? { ...params, ...params.options } : params;
		scheme._options = params.options || {};
		scheme._values = values || {};
		const defaultOptions = Object.keys(scheme?.defaults || {});

		return `${command ? `${command} ` : ""}${scheme?.orden
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
					return callFunction(values[key]);
				}
				return callFunction(scheme.defaults[key]);
			})
			.filter((result) => result !== undefined)
			.join(charJoin)
			.trim()}`;
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
		const query = `DROP DATABASE ${name}`;
		return query;
	}

	use(database) {
		return `USE ${database}`;
	}
	createSchema(name, options) {
		return this.getStatement("CREATE SCHEMA", createSchema, {
			name,
			options,
		});
	}
	dropSchema(name, options) {
		return this.getStatement("DROP SCHEMA", dropSchema, {
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
		return this.getStatement("CREATE", createTable, { name, options });
	}
	column(name, options) {
		return this.getStatement("", column, { name, options }, " ").trim();
	}

	tableConstraints(restricciones) {
		const command = [];
		for (const restriccion of restricciones) {
			command.push(
				this.getStatement("CONSTRAINT", constraint, restriccion, " "),
			);
		}
		return command.join(",\n ");
	}
	alterTable(name) {
		return `ALTER TABLE ${name}\n`;
	}
	addColumn(name, options) {
		return `ADD COLUMN ${this.column(name, options)}`;
	}
	alterColumn(name) {
		return `ALTER COLUMN ${name}`;
	}

	dropColumn(name, option) {
		return this.getStatement("DROP", dropColumn, { name, option }, " ");
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
		return this.getStatement("DROP", dropTable, { name, option }, " ");
	}

	createType(name, options) {
		return this.getStatement("CREATE", createType, { name, options }, " ");
	}
	createAssertion(name, assertion) {
		return `CREATE ASSERTION ${name} CHECK ( ${assertion} )`;
	}
	createDomain(name, options) {
		return this.getStatement("CREATE DOMAIN", createDomain, {
			name,
			options,
		});
	}
	createView(name, options) {
		return this.getStatement("CREATE", createView, { name, options });
	}

	dropView(name) {
		return `DROP VIEW ${name}`;
	}
	// Seguridad

	createRoles(names, options) {
		return this.getStatement("CREATE", createRole, { names, options }, " ");
	}
	dropRoles(names, options) {
		return this.getStatement("", dropRoles, { names, options });
	}

	grant(commands, on, to, options) {
		return this.getStatement("GRANT", grant, {
			commands,
			on,
			to,
			options,
		});
	}
	revoke(commands, on, from, options) {
		return this.getStatement("REVOKE", revoke, {
			commands,
			on,
			from,
			options,
		});
	}
	grantRoles(roles, users, options) {
		return this.getStatement(
			"GRANT",
			grantRoles,
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
				revokeRoles,
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
	select(columns, options) {
		return this.getStatement(
			"SELECT",
			select,
			{
				columns,
				options,
			},
			" ",
		);
	}
	from(tables, alias) {
		if (typeof tables === "string") {
			return `FROM ${tables}`;
		}
		if (Array.isArray(tables) && Array.isArray(alias)) {
			return `FROM ${tables
				.map((table, index) => `${table} AS ${alias[index]}`)
				.join(", ")}`;
		}
		return `FROM ${tables.join(", ")}`;
	}
	joins() {
		const joinTypes = {
			crossJoin: "CROSS JOIN",
			naturalJoin: "NATURAL JOIN",
			colJoin: "JOIN",
			innerJoin: "INNER JOIN",
			join: "JOIN",
			leftJoin: "LEFT OUTER JOIN",
			rightJoin: "RIGTH OUTER JOIN",
			fullJoin: "FULL OUTER JOIN",
		};
		for (const join in joinTypes) {
			this[join] = (tables, alias, using) => {
				if (typeof tables === "string" && typeof alias === "string") {
					return `${joinTypes[join]} ${tables} ${alias}`;
				}
				if (Array.isArray(tables) && Array.isArray(alias)) {
					return `FROM ${tables
						.map((table, index) => `${table} ${alias[index]}`)
						.join(
							` ${joinTypes[join]} `,
						)}${Array.isArray(using) ? `\nUSING (${using.join(", ")})` : ""}`;
				}
				return `FROM ${tables.join(` ${joinTypes[join]} `)}`;
			};
		}
	}

	union(prev, next, option) {
		next.selectCommand = `${prev.toString().replace(";", "")}\nUNION${typeof option === "string" && /^(ALL)$/i.test(option) ? ` ${option.toUpperCase()}` : ""}\n`;
	}
	where(predicados) {
		const sql = "WHERE";
		if (typeof predicados === "string") {
			return `${sql} ${predicados}`;
		}

		return `${sql} ${predicados.join("\n")}`;
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
			this[oper] = (a, b) => {
				if (b !== undefined) {
					return `${a} ${operadores[oper]} ${typeof b === "string" ? (/^(ANY|SOME|ALL)$/.test(b.match(/^\w+/)[0]) ? b : `'${b}'`) : b}`;
				}
				if (Array.isArray(a)) {
					return `${a.join(` ${operadores[oper]}\nAND `)} ${operadores[oper]}`;
				}
				return `${a} ${operadores[oper]}`;
			};
		}
		const logicos = {
			and: "AND",
			or: "OR",
			not: "NOT",
			between: "BETWEEN",
			like: "LIKE",
			notLike: "NOT LIKE",
		};
		for (const oper in logicos) {
			if (/^(AND|OR)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `\n${logicos[oper].toUpperCase()} ${predicados}`;
				};
			}
			if (/^(NOT)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `${logicos[oper].toUpperCase()} (${predicados})`;
				};
			}
			if (/^(BETWEEN)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) =>
					`${logicos[oper].toUpperCase()} ${predicados[0]} AND ${predicados[1]}`;
			}
			if (/^(LIKE|NOT LIKE)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) =>
					`${predicados[0]} ${logicos[oper].toUpperCase()} ('${predicados[1]}')`;
			}
		}
	}

	getListValues(...values) {
		let arrayValues = [];
		if (Array.isArray(values[0])) {
			arrayValues = values[0].map((value) =>
				typeof value === "string"
					? `'${value}'`
					: value instanceof QueryBuilder
						? value.toString().replace(";", "")
						: value,
			);
		} else {
			arrayValues = values.map((value) =>
				typeof value === "string"
					? `'${value}'`
					: value instanceof QueryBuilder
						? value.toString().replace(";", "")
						: value,
			);
		}
		return arrayValues;
	}
	in(columna, ...values) {
		return `${columna} IN ( ${this.getListValues(...values).join(", ")} )`;
	}
	notIn(columna, ...values) {
		return `${columna} NOT IN ( ${this.getListValues(...values).join(", ")} )`;
	}
	exists(subSelect) {
		return `EXISTS ( ${this.getListValues(subSelect).join(", ")} )`;
	}
	notExists(subSelect) {
		return `NOT EXISTS ( ${this.getListValues(subSelect).join(", ")} )`;
	}

	any(subSelect) {
		return `ANY ( ${this.getListValues(subSelect).join(", ")} )`;
	}
	some(subSelect) {
		return `SOME ( ${this.getListValues(subSelect).join(", ")} )`;
	}
	all(subSelect) {
		return `ALL ( ${this.getListValues(subSelect).join(", ")} )`;
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
		if (typeof columns === "string") {
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
	insert(table, cols, values) {
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
									return item;
								})
								.join(", ")})`,
					)
					.join(",\n")}`;
			}
			sql = `${sql}\nVALUES ( ${values
				.map((value) => {
					if (typeof value === "string") {
						return `'${value}'`;
					}
					return value;
				})
				.join(", ")} )`;
		}
		if (values instanceof QueryBuilder) {
			sql = `${sql}\n${values.toString().replace(";", "")}`;
		}
		if (typeof values === "string") {
			sql = `${sql}\n${values}`;
		}
		return sql;
	}
	update(table, sets) {
		const sql = `UPDATE ${table}`;
		const setStack = [];
		for (const col in sets) {
			if (typeof sets[col] === "string" && /(:)/.test(sets[col]) === false) {
				setStack.push(`${col} = '${sets[col]}'`);
			} else if (sets[col] instanceof QueryBuilder) {
				setStack.push(`${col} =\n( ${sets[col].toString().replace(";", "")} )`);
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
			this[name] = (column, alias) =>
				`${name.toUpperCase()}(${column})${typeof alias !== "undefined" ? ` AS ${alias}` : ""}`;
		}
	}
	// funciones VALOR de cadena
	substr(column, inicio, ...options) {
		if (typeof options[0] === "string") {
			return `SUBSTRING(${column} FROM ${inicio})${typeof options[0] !== "undefined" ? ` AS ${options[0]}` : ""}`;
		}
		return `SUBSTRING(${column} FROM ${inicio}${typeof options[0] !== "undefined" ? ` FOR ${options[0]}` : ""})${typeof options[1] !== "undefined" ? ` AS ${options[1]}` : ""}`;
	}
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
	}

	// cursores
	createCursor(name, expresion, options) {
		if (typeof name !== "string" || typeof name === "undefined") {
			throw new Error("Es necesario un nombre valido para el cursor");
		}
		let sql = `DECLARE ${name}`;
		// opciones
		if (/^(SENSITIVE|INSENSITIVE|ASENSITIVE)$/i.test(options?.changes)) {
			sql += ` ${options.changes.toUpperCase()}`;
		}
		if (/^(SCROLL|NO SCROLL)$/i.test(options?.cursor)) {
			sql += ` ${options.cursor.toUpperCase()}`;
		}
		if (options?.hold !== undefined) {
			sql += ` ${options.hold === true ? "WITH" : "WITHOUT"} HOLD`;
		}
		if (options?.return !== undefined) {
			sql += ` ${options.return === true ? "WITH" : "WITHOUT"} RETURN`;
		}
		sql += " CURSOR\n";
		if (typeof expresion === "string") {
			sql += `FOR\n${expresion}`;
		} else if (expresion instanceof QueryBuilder) {
			sql += `FOR\n${expresion.toString().replace(";", "")}`;
		} else {
			throw new Error("la expresion no es valida");
		}
		if (options?.orderBy !== undefined) {
			sql += `\nORDER BY ${options.orderBy}`;
		}
		if (options?.readOnly === true) {
			sql += "\nFOR READ ONLY";
		} else if (options?.update !== undefined && options?.update !== false) {
			sql += "\nFOR UPDATE";
			if (Array.isArray(options.update)) {
				sql += ` OF ${options.update.join(", ")}`;
			} else if (typeof options.update === "string") {
				sql += ` OF ${options.update}`;
			}
		}
		return `${sql}`;
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
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (cursorName, direction, hostVars) => {
				return `FETCH ${direction.toUpperCase()} FROM ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
			};
		}
		for (const comand of directionsWithValue) {
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (cursorName, direction, filas, hostVars) => {
				return `FETCH ${direction.toUpperCase()} ${filas} FROM ${cursorName}\nINTO ${Array.isArray(hostVars) ? hostVars.map((col) => `:${col}`).join(", ") : hostVars}`;
			};
		}
	}
	// Transacciones
	setTransaction(config) {
		const sql = "SET TRANSACTION\n";
		const stack = [];
		if (Array.isArray(config)) {
			for (const oneConfig of config) {
				stack.push(this.setTransaction(oneConfig).replace(sql, ""));
			}
			return `${sql}${stack.join(",\n")}`;
		}
		if (/^(READ ONLY|READ WRITE)$/i.test(config?.access)) {
			stack.push(`${config.access.toUpperCase()}`);
		}
		if (
			/^(READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE)$/i.test(
				config?.isolation,
			)
		) {
			stack.push(`ISOLATION LEVEL ${config.isolation.toUpperCase()}`);
		}
		if (typeof config?.diagnostic === "number") {
			stack.push(`DIAGNOSTICS SIZE ${config.diagnostic}`);
		}
		return `${sql}${stack.join(",\n")}`;
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
