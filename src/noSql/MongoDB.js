/*
Implementa las variaciones al SQL2006 propias de los NoSQL
*/
import Core from "../core.js";
class MongoDB extends Core {
	constructor(qbuilder) {
		super();
		this.dataType = "mongobd"; // especifica el tipo de datos usado
		this.qb = qbuilder;
	}
	createDatabase(name, options) {
		/**
		 * MongoDB crea la base de datos automáticamente cuando insertas el primer documento en una colección.
		 */
		return null;
	}
	dropDatabase(name, options) {
		return null;
	}
	use(database) {
		// devuelve null
		return null;
	}
	createSchema(name, options) {
		return null;
	}
	dropSchema(name, options) {
		return null;
	}
	createTable(name, options) {
		/**
		 * https://www.mongodb.com/docs/manual/reference/command/create/#mongodb-dbcommand-dbcmd.create
		 */
		const fields = [
			"capped",
			"timeseries",
			"expireAfterSeconds",
			"clusteredIndex",
			"changeStreamPreAndPostImages",
			"autoIndexId",
			"size",
			"max",
			"storageEngine",
			"validator",
			"validationLevel",
			"validationAction",
			"indexOptionDefaults",
			"viewOn",
			"pipeline",
			"collation",
			"writeConcern",
			"encryptedFields",
			"comment",
		];
		const fieldOptions = this.checkOptions(options, fields);

		const tableDef = JSON.stringify({
			insert: "tableDef",
			documents: [
				{
					tableName: name,
					fields: Object.keys(options.cols),
					types: Object.values(options.cols),
				},
			],
		});
		const createTable = JSON.stringify({ create: name, ...fieldOptions });

		return `${createTable};${tableDef}`;
	}
	column(name, options) {
		return null;
	}

	tableConstraints(restricciones) {
		return null;
	}
	alterTable(name) {
		return null;
	}
	addColumn(name, options) {
		return null;
	}
	alterColumn(name) {
		return null;
	}

	dropColumn(name, option) {
		return null;
	}
	setDefault(value) {
		return null;
	}

	dropDefault() {
		return null;
	}

	addConstraint(name, option) {
		return null;
	}

	async dropTable(name, options) {
		const fields = ["writeConcern", "comment"];
		const fieldOptions = this.checkOptions(options, fields);
		if (options?.secure) {
			const response = await this.qb.driverDB.getTable(name);
			if (response.length) {
				return JSON.stringify({ drop: name, ...fieldOptions });
			}
			return null;
		}
		return JSON.stringify({ drop: name, ...fieldOptions });
	}
	createType(name, options) {
		return null;
	}
	dropType(name, options) {
		return null;
	}
	createAssertion(name, assertion) {
		return null;
	}
	createDomain(name, options) {
		return null;
	}
	createView(name, options) {
		return null;
	}

	dropView(name) {
		return null;
	}
	// Seguridad

	createRoles(names, options) {
		return null;
	}
	dropRoles(names, options) {
		return null;
	}

	grant(commands, on, to, options) {
		return null;
	}
	revoke(commands, on, from, options) {
		return null;
	}
	grantRoles(roles, users, options) {
		return null;
	}
	revokeRoles(roles, from, options) {
		return null;
	}

	//Comandos DQL
	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options) {
		return null;
	}
	from(tables, alias) {
		return null;
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
				return null;
			};
		}
	}

	using(columnsInCommon) {
		return null;
	}

	union(...selects) {
		return null;
	}
	where(predicados) {
		return null;
	}

	whereCursor(cursorName) {
		return null;
	}

	on(predicados) {
		return null;
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

			if (/^(LIKE|NOT LIKE)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) =>
					`${predicados[0]} ${logicos[oper].toUpperCase()} ('${predicados[1]}')`;
			}
			if (/^(DISTINCT)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) =>
					`${logicos[oper].toUpperCase()} ${predicados}`;
			}
		}
		const operTreeArg = { between: "BETWEEN", notBetween: "NOT BETWEEN" };
		for (const oper in operTreeArg) {
			if (/^(BETWEEN|NOT BETWEEN)$/i.test(operTreeArg[oper])) {
				this[oper] = (campo, min, max) => {
					return `${campo} ${operTreeArg[oper].toUpperCase()} ${min} AND ${max}`;
				};
			}
		}
	}

	in(columna, ...values) {
		return null;
	}
	notIn(columna, ...values) {
		return null;
	}
	exists(subSelect) {
		return null;
	}
	notExists(subSelect) {
		return null;
	}

	any(subSelect) {
		return null;
	}
	some(subSelect) {
		return null;
	}
	all(subSelect) {
		return null;
	}

	groupBy(columns, options) {
		return null;
	}
	having(predicado, options) {
		return `HAVING ${predicado}`;
	}
	orderBy(columns) {
		return null;
	}

	// Mofificacion de Datos
	insert(table, cols, values) {
		return null;
	}
	update(table, sets) {
		return null;
	}
	delete(from) {
		return null;
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
		return null;
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
		return null;
	}
	// cursores
	createCursor(name, expresion, options) {
		return null;
	}
	openCursor(name) {
		return null;
	}
	closeCursor(name) {
		return null;
	}
	fetch(cursorName, hostVars) {
		return null;
	}
	fetches() {
		return null;
	}
	// Transacciones
	setTransaction(config) {
		return null;
	}
	startTransaction(config) {
		return null;
	}
	setConstraints(restrictions, type) {
		return null;
	}
	setSavePoint(name) {
		return null;
	}
	clearSavePoint(name) {
		return null;
	}
	commit(name) {
		return null;
	}
	rollback(savepoint) {
		return null;
	}
	/**
	 * Metodos auxiliares
	 */
	/**
	 *
	 * @param {*} options
	 * @param {*} fields
	 * @returns
	 */
	checkOptions(options, fields) {
		return Object.keys(options)
			.filter((key) => fields.includes(key))
			.reduce((acc, key) => {
				acc[key] = options[key];
				return acc;
			}, {});
	}
}
export default MongoDB;
