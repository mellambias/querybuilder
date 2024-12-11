/*
Implementa las variaciones al SQL2006 propias de los NoSQL
*/
import Core from "../core.js";
import mongo from "../comandos/mongoDB.js";
import Command from "./Command.js";
import QueryBuilder from "../querybuilder.js";

class MongoDB extends Core {
	constructor(qbuilder) {
		super();
		this.dataType = "mongobd"; // especifica el tipo de datos usado
		this.qb = qbuilder;
	}

	getStatement(scheme, params) {
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
			.reduce((comand, objResult) => {
				const key = Object.keys(objResult);
				comand[key] = objResult[key];
				return comand;
			}, {});
		return commandArray;
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
		// devuelve null, para usar el metodo del Driver
		return null;
	}
	createSchema(name, options) {
		return this.createTable(name, options);
	}
	dropSchema(name, options) {
		return this.dropTable(name, options);
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
		const alterTable = new Command({
			update: "esquema",
			updates: [],
		});
		return alterTable;
	}
	addColumn(name, options, alterTable) {
		const { updates } = alterTable.commands[0];
		let colDef = {};
		if (typeof options === "string") {
			colDef = {
				name,
				type: options.toDataType(this.dataType),
			};
		} else {
			colDef = {
				name,
				...options,
				type: options?.type.toDataType(this.dataType),
			};
		}
		updates.push({
			q: { "tables.name": this._currentTable },
			u: {
				$addToSet: {
					"tables.$[elem].cols": colDef,
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
	// implementar cuando tengamos el select
	createView(name, options) {
		/**
		 * viewOn The name of the source collection or view from which to create the view. The name is not the full namespace of the collection or view; i.e. does not include the database name and implies the same database as the view to create. You must create views in the same database as the source collection. See also db.createView().
		 * pipeline	array
An array that consists of the aggregation pipeline stage(s). create creates the view by applying the specified pipeline to the viewOn collection or view.
A view definition pipeline cannot include the $out or the $merge stage. This restriction also applies to embedded pipelines, such as pipelines used in $lookup or $facet stages.
The view definition is public; i.e. db.getCollectionInfos() and explain operations on the view will include the pipeline that defines the view. As such, avoid referring directly to sensitive fields and values in view definitions.
		*/
		return null;
	}

	dropView(name) {
		return null;
	}
	// Seguridad

	createRoles(names, options) {
		const result = new Command();
		if (Array.isArray(names)) {
			for (const name of names) {
				result.add(
					this.getStatement(mongo.createRoles, { name: name, options }),
				);
			}
			return result;
		}
		result.set(this.getStatement(mongo.createRoles, { name: names, options }));
		return result;
	}
	dropRoles(names, options) {
		const result = new Command();
		if (Array.isArray(names)) {
			for (const name of names) {
				result.add(this.getStatement(mongo.dropRoles, { name: name, options }));
			}
			return result;
		}
		result.set(this.getStatement(mongo.dropRoles, { name: names, options }));
		return result;
	}

	grant(commands, on, to, options) {
		const result = new Command();
		if (Array.isArray(to)) {
			for (const rol of to) {
				result.add(
					this.getStatement(mongo.grant, {
						commands,
						on,
						to: rol,
						options,
					}),
				);
			}
			return result;
		}
		result.set(this.getStatement(mongo.grant, { commands, on, to, options }));

		return result;
	}
	/**
	 * Elimina privilegios de uno o valios roles
	 * @param {String|Array<String>} commands - privilegios a eliminar
	 * @param {String} on - tabla
	 * @param {String} from - rol sobre el que se actua
	 * @param {object} options - opciones propias del lenguaje
	 * @returns
	 */
	revoke(commands, on, from, options) {
		const result = new Command();
		if (Array.isArray(from)) {
			for (const rol of from) {
				result.add(
					this.getStatement(mongo.revoke, {
						commands,
						on,
						from: rol,
						options,
					}),
				);
			}
			return result;
		}
		result.set(
			this.getStatement(mongo.revoke, { commands, on, from, options }),
		);

		return result;
	}
	grantRoles(roles, users, options) {
		const result = new Command();
		if (Array.isArray(users)) {
			for (const user of users) {
				result.add(
					this.getStatement(mongo.grantRoles, {
						roles,
						user,
						options,
					}),
				);
			}
			return result;
		}
		result.set(
			this.getStatement(mongo.grantRoles, { roles, user: users, options }),
		);
		return result;
	}
	revokeRoles(roles, from, options) {
		const result = new Command(
			this.getStatement(mongo.revokeRoles, { roles, from, options }),
		);
		return result;
	}

	//Comandos DQL
	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options) {
		const selectCommand = new Command();
		const select = {
			find: (ref) => ref.from,
			filter: (ref) => ref.where,
		};
		let projection;
		const cols = [];
		const agregaciones = [];
		if (!/^(\*|all)$/i.test(columns)) {
			if (Array.isArray(columns)) {
				projection = columns.reduce(
					(fields, col) => {
						if (typeof col === "object") {
							const [key] = Object.keys(col);
							fields[key] = 1;
							agregaciones.push(col[key]);
							cols.push(key);
						} else {
							fields[col] = 1;
							cols.push(col);
						}
						return fields;
					},
					{ _id: 0 },
				);
			} else {
				if (typeof columns === "object") {
					const [key] = Object.keys(columns);
					projection = { _id: 0, [key]: 1 };
					agregaciones.push(columns[key]);
					cols.push(key);
				} else {
					projection = { _id: 0, [columns]: 1 };
					cols.push(columns);
				}
			}
			select.projection = projection;
			select.results = { cols, agregaciones };
		}

		selectCommand.set(select);
		return selectCommand;
	}
	from(tables, alias, selectCommand) {
		selectCommand.from = tables;
		return selectCommand;
	}
	where(predicados, selectCommand) {
		// console.log("[MongoDB][where]predicados", predicados);
		if (Array.isArray(predicados)) {
			throw new Error("La clausula where esta mal formada");
		}
		selectCommand.where = predicados;
		return selectCommand;
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
						return {
							[`${a}`]: {
								[`${operadores[oper]}`]: b.toString({ as: "subselect" }),
							},
						};
					}
					if (Array.isArray(b)) {
						return { [`${a}`]: { [`${operadores[oper]}`]: b.join(", ") } };
					}
					return {
						[`${a}`]: {
							[`${operadores[oper]}`]: b,
						},
					};
				}
				if (Array.isArray(a)) {
					return `${a.join(` ${operadores[oper]}\nAND `)} ${operadores[oper]}`;
				}
				return { [`${operadores[oper]}`]: a };
			};
		}
		const logicos = {
			and: "$and",
			or: "$or",
			not: "$not",
			like: "$regex",
			notLike: "$regex",
			distinct: "$nor",
		};
		for (const oper in logicos) {
			if (/^(and|or)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return {
							[`${logicos[oper]}`]: predicados,
						};
					}
					return { [`${logicos[oper]}`]: predicados };
				};
			}
			if (/^(not)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return {
							[`${predicados[0]}`]: { [`${logicos[oper]}`]: predicados[1] },
						};
					}
					return { [`${logicos[oper]}`]: predicados };
				};
			}

			if (/^(like)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					const expresion = this.likeToRegex(predicados[1]);
					return {
						[predicados[0]]: {
							[logicos[oper]]: this.likeToRegex(predicados[1]),
						},
					};
				};
			}
			if (/^(|notLike)$/i.test(oper)) {
				this[oper] = (...predicados) => ({
					[predicados[0]]: {
						$not: {
							[logicos[oper]]: this.likeToRegex(predicados[1]),
						},
					},
				});
			}
			if (/^(distinct)$/i.test(oper)) {
				this[oper] = (...predicados) => {
					return { [`${logicos[oper]}`]: predicados };
				};
			}
		}
		const operTreeArg = { between: "BETWEEN", notBetween: "NOT BETWEEN" };
		for (const oper in operTreeArg) {
			if (/^(between)$/i.test(oper)) {
				this[oper] = (campo, min, max) => ({
					[campo]: { $gte: min, $lte: max },
				});
			}
			if (/^(notBetween)$/i.test(oper)) {
				this[oper] = (campo, min, max) => ({
					$or: [{ [campo]: { $lt: min } }, { [campo]: { $gt: max } }],
				});
			}
		}
	}

	likeToRegex(likePattern) {
		// Escapar caracteres especiales de regex
		const escaped = likePattern.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");

		// Reemplazar los caracteres especiales de LIKE con los de regex
		const regexPattern = escaped
			.replace(/%/g, ".*") // % en LIKE equivale a .* en regex
			.replace(/_/g, "."); // _ en LIKE equivale a . en regex

		// Retornar el patrón como una expresión regular
		return new RegExp(`^${regexPattern}$`, "i"); // ^ y $ aseguran coincidencia exacta
	}

	in(columna, ...values) {
		return { [`${columna}`]: { $in: [values] } };
	}
	notIn(columna, ...values) {
		return { [`${columna}`]: { $nin: [values] } };
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
	async getTableDef(table) {
		const { rows } = await new Command({
			find: "esquema",
			filter: { _id: "table" },
		}).execute(this.qb.driverDB);
		const [findTable] = rows[0];
		const tableDef = findTable.tables.find((item) => item.name === table);
		if (tableDef) {
			if (tableDef?.constraints) {
				// se aplican las "constraints" a los campos
				for (const rule of tableDef.constraints) {
					const column = tableDef.cols.find((col) =>
						rule.cols.includes(col.name),
					);
					column.constraint = rule;
				}
			}
			console.log("La tabla '%s' esta definida como:\n%o", table, tableDef);
			return tableDef;
		}
		return { rows: [] };
	}

	apliConstraints(field, val) {
		let value = val;
		const errorStack = [];
		if (field === undefined) {
			errorStack.push("El identificador no es un campo de la tabla");
			return errorStack;
		}
		const { name, type } = field;
		if (value === undefined) {
			value = field?.default || null;
		}
		if (field?.values) {
			if (
				field.values.some((item) => /^(not null)$/i.test(item)) &&
				value === null
			) {
				errorStack.push(
					`[Regla 'NOT NULL'] El campo '${name}' no puede ser 'null'`,
				);
			}
			if (field.values.some((item) => /^(primary key)$/i.test(item))) {
				field._id = value;
			}
		}
		if (field?.constraint) {
			if (/^(PRIMARY KEY)$/i.test(field.constraint.type)) {
				field._id = value;
			}
		}
		// tipo de valor compatible
		if (!type.toDataType(this.dataType).startsWith(typeof value)) {
			errorStack.push(
				`El tipo: '${typeof value}' del campo '${name}' no es compatible con '${type.toDataType(this.dataType)}'`,
			);
		}
		return { error: errorStack, updatedField: field, currentValue: value };
	}
	async insert(table, columns, datas) {
		// Primero recuperar la definicion de la tabla
		const { cols } = await this.getTableDef(table);
		if (!cols) {
			throw new Error("No se puede insertar documentos sin una colección");
		}
		const fields = columns.length > 0 ? columns : cols.map((item) => item.name);
		let values = Array.isArray(datas[0]) ? datas : [datas];
		if (datas instanceof QueryBuilder) {
			// console.log("Debemos resolver la subquery");
			const { rows } = await datas.selectCommand.execute(datas.driverDB);
			values = rows[0].map((row) => {
				const values = Object.values(row);
				if (values.length > 1) {
					return values;
				}
				return values[0];
			});
		}
		const documents = values.map((item, rowNumber) =>
			item.reduce((row, val, index, elements) => {
				const field = cols.find((item) => item.name === fields[index]);
				const { updatedField, currentValue, error } = this.apliConstraints(
					field,
					val,
				);
				if (error?.length > 0) {
					throw new Error(
						`❌ En ${values[rowNumber]} el valor '${elements[index]}'`,
						{
							cause: error,
						},
					);
				}
				const { name } = field;
				if (updatedField?._id) {
					row._id = updatedField._id;
				}
				row[name] = currentValue;
				return row;
			}, {}),
		);
		//creamos un comando para insertar los documentos
		const insertMany = new Command({
			insert: table,
			documents,
		});

		return insertMany;
	}
	update(table, sets) {
		const setStatements = Object.keys(sets).reduce((arrayData, field) => {
			arrayData.push({
				$set: { [field]: sets[field] },
			});
			return arrayData;
		}, []);
		const updateCommand = new Command({
			update: table,
			updates: [{ q: (ref) => ref.where || {}, u: setStatements, multi: true }],
		});
		// console.log(updateCommand._commands[0]);
		return updateCommand;
	}
	delete(from) {
		const deleteCommand = new Command({
			delete: from,
			deletes: [{ q: (ref) => ref.where || {}, limit: 0 }],
		});
		return deleteCommand;
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
			this[name] = (column, alias) => {
				const aggregate = new Command(
					{
						aggregate: (ref) => ref.from,
						pipeline: [
							{
								$group: {
									_id: null, // Agrupación global (sin separar por grupos)
									[alias || column]: {
										[`$${name.toLowerCase()}`]: `$${column}`,
									},
								},
							},
							{
								$project: {
									_id: 0,
								},
							},
						],
						cursor: {},
					},
					this.qb.driverDB,
				);
				return { [alias || column]: aggregate };
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
