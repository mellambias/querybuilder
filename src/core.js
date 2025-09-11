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
		this.q = []; // Initialize the query array
		this.id = Math.random(); // Debug: unique id for each instance
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
					log(
						["Core", "getStatement", "%o"],
						"llamar funcion parametros:values[key]\n%o",
						key,
						typeof values[key],
					);
					const respuesta = callFunction(values[key], scheme);
					log(["Core", "getStatement", "%o"], "respuesta", key, respuesta);
					return respuesta;
				}
				const respuesta = callFunction(scheme.defaults[key], scheme);
				log(
					["Core", "getStatement", "%o"],
					"respuesta de %o",
					key,
					scheme.defaults,
					respuesta,
				);
				return respuesta;
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
	/**
	 * Devuelve un array con el select o el último valor resuelto
	 * @param {Object} next valor que contiene el array con las resoluciones
	 * @param {boolean} all true incluye tambien primer select
	 * @returns
	 */
	getSubselect(next, all = false) {
		try {
			const start = next.q.findLastIndex(
				(item) =>
					item.toUpperCase().startsWith("SELECT") ||
					item.toUpperCase().includes("SELECT"),
			);
			log(["Core", "getSubselect"], "start", start, next.q);
			if (start === -1 || (start === 1 && !all)) {
				log(["Core", "getSubselect"], "No encuentra el SubSelect next:", next);
				const lastItem = next.q.pop();
				log(
					["Core", "getSubselect"],
					"(%o) No existe un 'SELECT', devuelve el ultimo item %o",
					start,
					lastItem,
				);
				return lastItem;
			}
			const subSelect = next.q.splice(start, next.q.length - start);
			log(
				["Core", "getSubselect"],
				"Modifica next:\n%o\n subSelect:\n%o",
				next,
				subSelect,
			);
			return subSelect;
		} catch (error) {
			log(["Core", "getSubselect", "ERROR"], "Error", error);
		}
	}

	getListValues(values, next) {
		log(["Core", "getListValues(values, next)"], "next", next);
		log(
			["Core", "getListValues(values, next)"],
			"typeof values",
			typeof values,
		);
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

					// Check if we have a DELETE/UPDATE command that needs special handling
					const hasDeleteUpdateCommand = next.q.some(item =>
						typeof item === 'string' &&
						(item.trim().toLowerCase().startsWith('delete') || item.trim().toLowerCase().startsWith('update'))
					);

					if (hasDeleteUpdateCommand) {
						// Find SELECT and take everything from there for DELETE/UPDATE subconsulta context
						const selectIndex = next.q.findIndex(item =>
							typeof item === 'string' &&
							(item.toUpperCase().startsWith('SELECT') || item.toUpperCase().includes('SELECT'))
						);

						if (selectIndex !== -1) {
							// Get all elements from SELECT onwards
							const subquery = next.q.slice(selectIndex);
							// Remove the subquery parts from next.q to prevent contamination
							next.q.splice(selectIndex);
							return subquery.join('\n');
						}
					}

					return this.getSubselect(next);
				}
				return value;
			});
		} else {
			if (values instanceof QueryBuilder) {
				log(["Core", "getListValues(values, next)"], "Es un QB next", next);
				const resolve = this.getSubselect(next);
				return Array.isArray(resolve) ? resolve.join("\n") : resolve;
			}
			arrayValues = [values];
		}
		return arrayValues
			.map((item) => {
				if (typeof item === "string") {
					// Check if this string looks like a SQL subquery
					if (item.toUpperCase().includes('SELECT') && item.includes('\n')) {
						// This is a SQL subquery, don't add quotes
						return item;
					} else {
						// This is a regular string value, add quotes
						return `'${item}'`;
					}
				}
				if (Array.isArray(item)) {
					return item.join("\n");
				}
				return item;
			})
			.join(", ");
	}

	/************************************************************************
	 * utility
	 * Comandos auxiliares para gestión y mantenimiento de la base de datos.
	 ************************************************************************/

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

	/***************************************************************
	 * DDL
	 * Definen y modifican la estructura de la base de datos.
	 ***************************************************************/
	createDatabase(name, options) {
		let query = `CREATE DATABASE ${name}`;
		for (const option in options) {
			query += `\n ${option} ${option[option]}`;
		}
		return query;
	}
	dropDatabase(name, options) {
		this.useDatabase = null;
		options?.secure;
		const query = "DROP DATABASE".concat(
			options?.secure === true ? " IF EXISTS " : " ",
			name,
		);
		return query;
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
		return `SET DEFAULT ${typeof value === "string" ? `'${value}'` : value}`;
	}

	dropDefault() {
		return "DROP DEFAULT";
	}

	addConstraint(name, option, next) {
		const constraint = [
			{
				name,
				check: option.check,
				next,
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

	/********************************************************
	 * DCL
	 * Controlan el acceso y permisos en la base de datos.
	 ********************************************************/

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

	/**************************************************************************
	 * DQL
	 * Consultan y recuperan datos de una o varias tablas.
	 **************************************************************************/

	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options, next) {
		log(["Core", "select"], "next", next);
		const result = this.getStatement(
			"SELECT",
			sql2006.select,
			{
				columns,
				options,
				next,
			},
			" ",
		);
		log(["Core", "select"], "result", result);
		return result;
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
	where(predicados, next) {
		const sql = "WHERE";
		if (predicados instanceof QueryBuilder) {
			const values = next.q.pop();
			return `${sql} ${values}`;
		}
		if (Array.isArray(predicados)) {
			return `${sql} ${predicados
				.map((item) => {
					if (item instanceof QueryBuilder) {
						return next.q.pop();
					}
					return item;
				})
				.join(", ")}`;
		}
		return `${sql} ${predicados}`;
	}

	whereCursor(cursorName) {
		return `WHERE CURRENT OF ${cursorName}`;
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
					`[core:442] la funcion ${join}(tables,alias,using) => ${join}(${tables}, ${alias}, ${using})`,
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
	/**
	 * Recibe una lista de select y los encadena usando el valor de optios.command
	 * @param {Array<string|QueryBuilder>} selects - lista de selects
	 * @param {string} options.command - comando de union
	 * @param {boolean} options.all - true añade ALL al comando de union
	 * @param {*} next
	 * @returns
	 */
	multiTabla(selects, next, options) {
		let command = `\n${options.command}\n`;
		const sql = [];
		const qbSelect = [];
		for (const select of selects) {
			if (select instanceof QueryBuilder) {
				const resolve = this.getSubselect(next);
				qbSelect.push(Array.isArray(resolve) ? resolve.join("\n") : resolve);
				sql.push("QB");
			}
			if (typeof select === "string") {
				sql.push(select);
			}
		}
		const result = sql.map((item) => {
			if (item === "QB") {
				return qbSelect.pop();
			}
			return item;
		});
		if (options?.all) {
			command = `\n${options.command} ALL\n`;
		}
		return `${result.join(command)}`;
	}
	union(selects, next, options) {
		options.command = "UNION";
		return this.multiTabla(selects, next, options);
	}
	intersect(selects, next, options) {
		options.command = "INTERSECT";
		return this.multiTabla(selects, next, options);
	}
	except(selects, next, options) {
		options.command = "EXCEPT";
		return this.multiTabla(selects, next, options);
	}

	on(predicado, next) {
		const sql = "ON";
		if (typeof predicado === "string") {
			return `${sql} ${predicado}`;
		}
		if (predicado instanceof QueryBuilder) {
			const valor = next.q.pop();
			return `${sql} ${valor}`;
		}
		return `${sql} ${predicado.join("\n")}`;
	}

	// Predicados
	predicados() {
		//operaciones con un argumento
		const operOneCol = {
			isNull: "IS NULL",
			isNotNull: "IS NOT NULL",
		};
		//operaciones con dos argumentos
		const operTwoCols = {
			eq: "=",
			ne: "<>",
			gt: ">",
			gte: ">=",
			lt: "<",
			lte: "<=",
		};

		//operaciones con tres argumentos
		const operThreeArg = { between: "BETWEEN", notBetween: "NOT BETWEEN" };

		//operaciones con n-argumentos
		const logicos = {
			and: "AND",
			or: "OR",
			not: "NOT",
			like: "LIKE",
			notLike: "NOT LIKE",
			distinct: "DISTINCT",
		};

		// Operaciones con un argumento
		for (const operOne in operOneCol) {
			if (typeof this[operOne] === "function") {
				continue;
			}
			this[operOne] = (a, next) => {
				if (a instanceof QueryBuilder) {
					return `${next.q.pop()} ${operOneCol[operOne]}`;
				}
				return `${a} ${operOneCol[operOne]}`;
			};
		}

		// Operaciones con dos argumentos
		for (const oper in operTwoCols) {
			if (typeof this[oper] === "function") {
				continue;
			}
			this[oper] = (a, b, next) => {
				let valorDeA = a;
				let valorDeB = b;
				if (b instanceof QueryBuilder) {
					valorDeB = this.getSubselect(next);
					if (Array.isArray(valorDeB)) {
						valorDeB = valorDeB.join("\n");
					}
				}

				if (a instanceof QueryBuilder) {
					valorDeA = this.getSubselect(next);
					if (Array.isArray(valorDeA)) {
						valorDeA = valorDeA.join("\n");
					}
				}
				if (b !== undefined) {
					if (typeof b === "string") {
						if (/^(ANY|SOME|ALL)$/.test(b.match(/^\w+/)[0])) {
							valorDeB = b;
						}
						valorDeB = `'${b}'`;
					}
				}
				if (valorDeB !== undefined) {
					if (typeof valorDeB === "string") {
						if (valorDeB.startsWith("SELECT")) {
							valorDeB = `( ${valorDeB} )`;
						}
					}
					return `${valorDeA} ${operTwoCols[oper]} ${valorDeB}`;
				}
				if (Array.isArray(valorDeA)) {
					return `${valorDeA.join(` ${operTwoCols[oper]}\nAND `)} ${operTwoCols[oper]}`;
				}
				return `${valorDeA} ${operTwoCols[oper]}`;
			};
		}

		// Operaciones logicas con n-argumentos
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
				this[oper] = (...predicados) => {
					const next = predicados.pop();
					let [a, b] = predicados;
					if (b instanceof QueryBuilder) {
						b = next.q.pop();
					}
					if (a instanceof QueryBuilder) {
						a = next.q.pop();
					}
					return `${a} ${logicos[oper].toUpperCase()} ('${b}')`;
				};
			}
			if (/^(distinct)$/i.test(oper)) {
				this[oper] = (...predicados) =>
					`${logicos[oper].toUpperCase()} ${predicados}`;
			}
		}

		// Operaciones con tres argumentos
		for (const oper in operThreeArg) {
			if (/^(between|notBetween)$/i.test(oper)) {
				this[oper] = (campo, min, max) => {
					return `${campo} ${operThreeArg[oper].toUpperCase()} ${min} AND ${max}`;
				};
			}
		}
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
		const response = this.getListValues(subSelect, next);
		return `NOT EXISTS ( ${response} )`;
	}

	any(subSelect, next) {
		const response = this.getListValues(subSelect, next);
		return `ANY ( ${response} )`;
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

	/*******************************************************************************
	 * DML
	 * Manipulan los datos almacenados en las tablas.
	 ******************************************************************************/
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
										log(
											["Core", "insert"],
											"El primer elemento es un Array Recibe next:",
											next,
										);
										const resolve = this.getSubselect(next);
										return Array.isArray(resolve)
											? resolve.join("\n")
											: resolve;
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
						log(
							["Core", "insert"],
							"El primer elemento no es un Array. Recibe next:",
							next,
						);
						const resolve = this.getSubselect(next, true);
						return Array.isArray(resolve)
							? `( ${resolve.join("\n")} )`
							: resolve;
					}
					return value;
				})
				.join(", ")} )`;
		}
		if (values instanceof QueryBuilder) {
			const resolve = this.getSubselect(next);
			sql = `${sql}\n${Array.isArray(resolve) ? resolve.join("\n") : resolve}`;
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
				const subSelect = this.getSubselect(next);
				log(["Core", "update"], "el SubSelect es", subSelect);
				setStack.push(
					`${col} =\n( ${Array.isArray(subSelect) ? subSelect.join("\n") : subSelect} )`,
				);
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
			this[name] = (column, alias, next) => {
				let colName = column;
				if (column instanceof QueryBuilder) {
					colName = next.q.pop();
				}

				return `${name.toUpperCase()}(${colName})${typeof alias !== "undefined" ? ` AS ${alias}` : ""}`;
			};
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
	 * Este metodo tiene dos firmas:
	 * case(column, casos, defecto,next)
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - nombre de la columna AS
	 * @param {Array<Casos>} Casos - Array<column,string> => [ [condicion, resultado],...]
	 * @param {string} defecto - Caso else
	 *
	 * @returns {Expresion} - instancia de Expresion
	 * case(casos,defecto,next)
	 * @param {Array<column,string>} casos - {Array<Casos>} Casos  Array<column,string> => [ [condicion, resultado],...]
	 * @param {string} defecto - Caso else
	 *
	 * @returns {Expresion} - instancia de Expresion
	 */
	case(column, casos, defecto, next) {
		log(["Core", "case"], "Recibe", next);
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

		next.q.reverse(); // invierte el array para que los resultados esten en el orden correcto
		command += items
			.reverse()
			.map((item) => {
				let [caso, resultado] = item;
				if (caso instanceof QueryBuilder) {
					caso = next.q.shift();
				}
				return `WHEN ${caso} THEN ${resultado}`;
			})
			.reverse()
			.join("\n");
		command += `\n${lastChance !== undefined ? `ELSE ${lastChance}\n` : ""}`;
		command += `${Array.isArray(column) ? "END" : `END AS ${column}`}`;
		next.q.reverse(); // devuelve el orden inicial
		return new Expresion(command);
	}
	// cursores
	createCursor(name, expresion, options, next) {
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
				next,
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
