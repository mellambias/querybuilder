/*
Implementa las variaciones al SQL2006 propias de los NoSQL
*/
import Core from "../core.js";
import Command from "./Command.js";
import QueryBuilder from "../querybuilder.js";
class MongoDB extends Core {
	constructor(qbuilder) {
		super();
		this.dataType = "mongobd"; // especifica el tipo de datos usado
		this.qb = qbuilder;
	}
	async createDatabase(name, options) {
		/**
		 * MongoDB crea la base de datos automáticamente cuando insertas el primer documento en una colección.
		 */
		// Establece el nombre de la base de datos
		this.qb.driverDB.use(name);
		//comandos para poblar la base de datos
		const createDatabase = new Command({ create: "esquema" });
		createDatabase.add({
			insert: "esquema",
			documents: [
				{
					_id: "table",
					tables: [],
				},
				{
					_id: "userType",
					types: [],
				},
			],
		});
		return createDatabase;
	}
	dropDatabase(name, options) {
		this.qb.driverDB.use(name);
		const dropDatabase = new Command({ dropDatabase: 1 });
		return dropDatabase;
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

		// Añadiremos la definición al documento 'table' de la coleccion 'esquema'
		const columns = [];
		for (const col in options.cols) {
			if (typeof options.cols[col] !== "object") {
				options.cols[col] = { type: options.cols[col] };
			}
			options.cols[col] = { name: col, ...options.cols[col] };
			columns.push(options.cols[col]);
		}
		const tableDef = new Command({
			update: "esquema",
			updates: [
				{
					q: { _id: "table" },
					u: {
						$addToSet: {
							tables: {
								name,
								cols: columns,
								constraints: options.constraints,
							},
						},
					},
				},
			],
		});
		// creamos la colección
		tableDef.add({ create: name, ...fieldOptions });

		return tableDef;
	}
	column(name, options) {
		return null;
	}

	tableConstraints(restricciones) {
		return null;
	}
	alterTable(name) {
		this._currentTable = name;
		console.log("[MongoDB][alterTable]");
		const alterTable = new Command({
			update: "esquema",
			updates: [],
		});
		return alterTable;
	}
	addColumn(name, options, alterTable) {
		const { updates } = alterTable.commands[0];
		updates.push({
			q: { "tables.name": this._currentTable },
			u: {
				$addToSet: {
					"tables.$[elem].cols": { name, ...options },
				},
			},
			arrayFilters: [{ "elem.name": this._currentTable }],
		});
		return alterTable;
	}
	alterColumn(name, options, alterTable) {
		this._currentColumn = name;
		if (options !== undefined) {
			const { updates } = alterTable.commands[0];
			const fieldsToUpdate = {};
			for (const option in options) {
				fieldsToUpdate[`tables.$[table].cols.$[field].${option}`] =
					options[option];
			}

			updates.push({
				q: { "tables.name": this._currentTable },
				u: {
					$set: fieldsToUpdate,
				},
				arrayFilters: [
					{ "table.name": this._currentTable },
					{ "field.name": name },
				],
			});
		}
		return alterTable;
	}

	dropColumn(name, option, alterTable) {
		const { updates } = alterTable.commands[0];
		updates.push({
			q: { "tables.name": this._currentTable },
			u: {
				$pull: { "tables.$[table].cols.$[field]": name },
			},
			arrayFilters: [
				{ "table.name": this._currentTable },
				{ "field.name": name },
			],
		});
		return alterTable;
	}
	setDefault(value, alterTable) {
		if (this._currentColumn === undefined) {
			return alterTable;
		}
		const { updates } = alterTable.commands[0];
		updates.push({
			q: { "tables.name": this._currentTable },
			u: {
				$set: { "tables.$[table].cols.$[field].default": value },
			},
			arrayFilters: [
				{ "table.name": this._currentTable },
				{ "field.name": this._currentColumn },
			],
		});
		return alterTable;
	}

	dropDefault() {
		if (this._currentColumn === undefined) {
			return alterTable;
		}
		const { updates } = alterTable.commands[0];
		updates.push({
			q: { "tables.name": this._currentTable },
			u: {
				$unset: { "tables.$[table].cols.$[field].default": "" },
			},
			arrayFilters: [
				{ "table.name": this._currentTable },
				{ "field.name": this._currentColumn },
			],
		});
		return alterTable;
	}

	addConstraint(name, options, alterTable) {
		const { updates } = alterTable.commands[0];
		updates.push({
			q: { "tables.name": this._currentTable },
			u: {
				$addToSet: { "tables.$[table].constraints": { name, ...options } },
			},
			arrayFilters: [{ "table.name": this._currentTable }],
		});
		return alterTable;
	}

	async dropTable(name, options) {
		const fields = ["writeConcern", "comment"];
		const fieldOptions = this.checkOptions(options, fields);
		const drop = new Command({ drop: name, ...fieldOptions }).add({
			update: "esquema",
			updates: [
				{
					q: { _id: "table" },
					u: {
						$pull: { tables: { name: name } },
					},
				},
			],
		});

		return drop;
	}
	createType(name, options) {
		const tableType = new Command({
			update: "esquema",
			updates: [
				{
					q: { _id: "userType" },
					u: {
						$addToSet: {
							types: {
								name,
								options,
							},
						},
					},
				},
			],
		});
		return tableType;
	}
	async dropType(name, options) {
		const dropType = new Command({
			update: "esquema",
			updates: [
				{
					q: { _id: "userType" },
					u: {
						$pull: { types: { name: name } },
					},
				},
			],
		});
		return dropType;
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
			eq: "$eq",
			ne: "$ne",
			gt: "$gt",
			gte: "$gte",
			lt: "$lt",
			lte: "$lte",
			isNull: "$eg:null",
			isNotNull: "$ne:null",
		};
		for (const oper in operadores) {
			if (typeof this[oper] === "function") {
				continue;
			}
			this[oper] = (a, b) => {
				if (b !== undefined) {
					if (b instanceof QueryBuilder) {
						return `{${a}: {${operadores[oper]}:( ${b.toString({ as: "subselect" })} )}}`;
					}
					if (Array.isArray(b)) {
						return `{ ${a}: {${operadores[oper]}: [ ${b.join(", ")} ] } }`;
					}
					return `{${a}: {${operadores[oper]}:${typeof b === "string" ? (/^(ANY|SOME|ALL)$/.test(b.match(/^\w+/)[0]) ? b : `'${b}'`) : b}}}`;
				}
				if (Array.isArray(a)) {
					return `${a.join(` ${operadores[oper]}\nAND `)} ${operadores[oper]}`;
				}
				return `{ ${operadores[oper]}: ${a} }`;
			};
		}
		const logicos = {
			and: "$and",
			or: "$or",
			not: "$not",
			like: "LIKE",
			notLike: "NOT LIKE",
			distinct: "$nor",
		};
		for (const oper in logicos) {
			if (/^(AND|OR)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `{ ${logicos[oper]}: [ ${predicados.join(", ")} ] }`;
					}
					return `{ ${logicos[oper]}: [ ${predicados} ] }`;
				};
			}
			if (/^(NOT)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `{ ${predicados[0]}: { ${logicos[oper]}: ${predicados[1]} } }`;
					}
					return `{ ${logicos[oper]}: ${predicados} }`;
				};
			}

			if (/^(LIKE|NOT LIKE)$/i.test(oper)) {
				this[oper] = (...predicados) =>
					`${predicados[0]} ${logicos[oper]} ('${predicados[1]}')`;
			}
			if (/^(DISTINCT)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					return `{ ${logicos[oper]}: [ ${predicados.join(", ")} ] }`;
				};
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
		return `{ ${columna}: { $in: [${values}] } }`;
	}
	notIn(columna, ...values) {
		return `{ ${columna}: { $nin: [${values}] } }`;
	}
	exists(subSelect) {
		return this.in(subSelect);
	}
	notExists(subSelect) {
		return this.nin(subSelect);
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
	async insert(table, columns, values) {
		// Primero recuperar la definicion de la tabla
		const [findTable] = await new Command({
			find: "esquema",
			filter: { _id: "table" },
		}).execute(this.qb.driverDB);
		const tableDef = findTable.tables.find((item) => item.name === table);
		console.log(tableDef);
		const { cols, types } = tableDef;
		let fields;
		if (columns.length > 0) {
			console.log("Insertar usando", columns);
			fields = columns;
		} else {
			fields = cols;
		}
		const documents = values.map((item) =>
			item.reduce((row, val, index) => {
				const pos = cols.indexOf(fields[index]);
				const type = types[pos]?.type || types[pos];
				console.log(fields[index], type);
				if (!type.toDataType(this.dataType).startsWith(typeof val)) {
					throw new Error(
						`El tipo: '${typeof val}' del campo '${fields[index]}' no es compatible con '${type.toDataType(this.dataType)}'`,
					);
				}
				if (types[pos]?.values) {
					if (
						types[pos]?.values.includes("not null") &&
						(val === undefined || val === "null") &&
						types[pos]?.default === undefined
					) {
						throw new Error(`El campo '${fields[index]}' no puede ser 'null'`);
					}
					if (types[pos]?.values.includes("primary key")) {
						row._id = val;
						return row;
					}
				}
				row[fields[index]] = val || types[pos]?.default;
				return row;
			}, {}),
		);
		// creamos un comando para insertar los documentos
		const insertMany = new Command({
			insert: table,
			documents,
		});

		return insertMany;
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
		if (options === undefined) {
			return {};
		}
		return Object.keys(options)
			.filter((key) => fields.includes(key))
			.reduce((acc, key) => {
				acc[key] = options[key];
				return acc;
			}, {});
	}
}

export default MongoDB;
