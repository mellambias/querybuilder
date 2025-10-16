/**
 * @fileoverview MongoDB QueryBuilder - Implementa las variaciones NoSQL para MongoDB
 * @description Clase especializada para MongoDB que extiende Core con funcionalidades específicas del SGBD NoSQL.
 * Incluye soporte para operaciones CRUD, agregaciones, índices, colecciones y características específicas de MongoDB.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * // Crear instancia MongoDB
 * const qb = new QueryBuilder();
 * const mongo = new MongoDB(qb);
 * 
 * // Crear base de datos MongoDB
 * const createDb = await mongo.createDatabase('myapp_db');
 * 
 * // Crear colección con opciones
 * const createCollection = mongo.createTable('users', {
 *   validator: {
 *     $jsonSchema: {
 *       bsonType: 'object',
 *       required: ['name', 'email'],
 *       properties: {
 *         name: { bsonType: 'string' },
 *         email: { bsonType: 'string' }
 *       }
 *     }
 *   }
 * });
 */
import Core from "../core/core.js";
import mongo from "./comandos/mongoDB.js";
import Command from "./Command.js";
import QueryBuilder from "../core/querybuilder.js";

/**
 * Clase MongoDB QueryBuilder para operaciones específicas de MongoDB
 * @class MongoDB
 * @extends Core
 * @description Implementa las operaciones NoSQL específicas de MongoDB.
 * Incluye soporte para documentos, colecciones, agregaciones, índices y características de MongoDB.
 * @since 1.0.0
 */
class MongoDB extends Core {
	/**
	 * Constructor de la clase MongoDB
	 * @description Inicializa una nueva instancia del QueryBuilder para MongoDB
	 * @constructor
	 * @param {QueryBuilder} qbuilder - Instancia del QueryBuilder principal
	 * @since 1.0.0
	 * @example
	 * const qb = new QueryBuilder();
	 * const mongo = new MongoDB(qb);
	 * console.log(mongo.dataType); // 'mongobd'
	 */
	constructor(qbuilder) {
		super();
		/**
		 * Tipo de base de datos - siempre 'mongobd'
		 * @type {string}
		 */
		this.dataType = "mongobd"; // especifica el tipo de datos usado
		/**
		 * Referencia al QueryBuilder principal
		 * @type {QueryBuilder}
		 */
		this.qb = qbuilder;
	}

	/**
	 * Generar statement MongoDB
	 * @method getStatement
	 * @override
	 * @param {Object} scheme - Esquema de comandos MongoDB
	 * @param {Object} params - Parámetros para el comando
	 * @returns {Object} Comando MongoDB construido
	 * @since 1.0.0
	 * @description Construye comandos MongoDB siguiendo el esquema definido
	 */
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
	/**
	 * Crear base de datos MongoDB
	 * @method createDatabase
	 * @override
	 * @async
	 * @param {string} name - Nombre de la base de datos
	 * @param {Object} [options] - Opciones adicionales
	 * @returns {Promise<Command>} Comando para crear la base de datos
	 * @since 1.0.0
	 * @description MongoDB crea la base de datos automáticamente cuando insertas el primer documento.
	 * Este método establece el nombre de la base de datos y crea el esquema inicial.
	 * @example
	 * const createDbCmd = await mongo.createDatabase('myapp_db');
	 */
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
		console.log("[addColumn] alterTable value", alterTable);
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
		 * Crea una vista MongoDB usando aggregation pipelines
		 * viewOn: The name of the source collection or view from which to create the view. 
		 * pipeline: array - An array that consists of the aggregation pipeline stage(s).
		 * 
		 * @param {string} name - Nombre de la vista a crear
		 * @param {Object} options - Opciones de la vista
		 * @param {string} options.viewOn - Colección base para la vista
		 * @param {Array} options.pipeline - Pipeline de agregación
		 * @param {QueryBuilder} [options.select] - QueryBuilder con SELECT para generar pipeline automáticamente
		 * @param {Object} [options.collation] - Configuración de collation
		 * @returns {Command} Comando MongoDB para crear la vista
		 * 
		 * @example
		 * // Crear vista con pipeline manual
		 * createView('active_users', {
		 *   viewOn: 'users',
		 *   pipeline: [{ $match: { active: true } }]
		 * })
		 * 
		 * @example
		 * // Crear vista desde QueryBuilder SELECT
		 * const qb = new QueryBuilder()
		 *   .select(['name', 'email'])
		 *   .from('users')
		 *   .where({active: true})
		 * createView('active_users', {
		 *   viewOn: 'users',
		 *   select: qb
		 * })
		 */
		if (!options || !options.viewOn) {
			throw new Error('createView requiere options.viewOn (colección base)');
		}

		let pipeline = [];

		// Si se proporciona un QueryBuilder SELECT, convertirlo a pipeline
		if (options.select) {
			const selectCommand = options.select;

			// Verificar si es un QueryBuilder válido
			if (selectCommand && typeof selectCommand === 'object') {
				// Construir pipeline desde el SELECT
				pipeline = this.buildPipelineFromSelect(selectCommand, options.viewOn);
			}
		}
		// Si se proporciona pipeline directo
		else if (options.pipeline && Array.isArray(options.pipeline)) {
			pipeline = [...options.pipeline];
		}
		// Si no hay pipeline, crear vista básica (todos los documentos)
		else {
			pipeline = []; // Vista sin filtros
		}

		// Crear comando de vista MongoDB
		const viewCommand = {
			create: name,
			viewOn: options.viewOn,
			pipeline: pipeline
		};

		// Agregar opciones adicionales si están presentes
		if (options.collation) {
			viewCommand.collation = options.collation;
		}

		const createView = new Command(viewCommand);

		// Registrar la vista en el esquema metadata
		createView.add({
			update: "esquema",
			updates: [
				{
					q: { _id: "table" },
					u: {
						$addToSet: {
							tables: {
								name,
								type: "view",
								viewOn: options.viewOn,
								pipeline: pipeline,
								cols: [] // Las columnas se determinan dinámicamente
							},
						},
					},
				},
			],
		});

		return createView;
	}

	/**
	 * Construye un pipeline de agregación desde un comando SELECT
	 * 
	 * @param {Object} selectCommand - Comando SELECT a convertir
	 * @param {string} baseCollection - Colección base 
	 * @returns {Array} Pipeline de agregación MongoDB
	 */
	buildPipelineFromSelect(selectCommand, baseCollection) {
		const pipeline = [];

		// Obtener referencia interna del comando
		const ref = selectCommand._commands?.[0] || selectCommand;

		// 1. WHERE → $match
		if (ref.where || ref.filter) {
			pipeline.push({
				$match: ref.where || ref.filter
			});
		}

		// 2. JOINs → $lookup + $unwind
		if (selectCommand.joins && selectCommand.joins.length > 0) {
			const joinPipeline = this.buildJoinPipeline(selectCommand.joins);
			pipeline.push(...joinPipeline);
		}

		// 3. GROUP BY → $group
		if (selectCommand.groupBy && selectCommand.groupBy.length > 0) {
			selectCommand.groupBy.forEach(group => {
				pipeline.push(group.stage);
			});
		}

		// 4. HAVING → $match (después de GROUP BY)
		if (selectCommand.having && selectCommand.having.length > 0) {
			selectCommand.having.forEach(having => {
				pipeline.push(having.stage);
			});
		}

		// 5. ORDER BY → $sort
		if (selectCommand.orderBy && selectCommand.orderBy.length > 0) {
			selectCommand.orderBy.forEach(order => {
				pipeline.push(order.stage);
			});
		}

		// 6. Proyección → $project (solo si no es SELECT *)
		if (ref.projection) {
			const aggregationProjection = this.buildAggregationProjection(
				ref.projection,
				selectCommand.joins || []
			);
			pipeline.push({
				$project: aggregationProjection
			});
		}

		// NOTA: LIMIT y OFFSET no se incluyen en vistas ya que las vistas
		// deben ser reutilizables. El LIMIT se aplicaría al consultar la vista.

		return pipeline;
	}

	dropView(name) {
		/**
		 * Elimina una vista MongoDB
		 * 
		 * @param {string} name - Nombre de la vista a eliminar
		 * @returns {Command} Comando MongoDB para eliminar la vista
		 */
		const dropView = new Command({ drop: name });

		// Eliminar la vista del esquema metadata
		dropView.add({
			update: "esquema",
			updates: [
				{
					q: { _id: "table" },
					u: {
						$pull: { tables: { name: name, type: "view" } },
					},
				},
			],
		});

		return dropView;
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
			// Función para construir el comando final considerando JOINs, GROUP BY, etc.
			buildFinalCommand: (ref) => {
				// `ref` es el objeto select, pero necesitamos acceder al comando completo
				// que está en `selectCommand` para obtener groupBy, orderBy, etc.
				const cmd = selectCommand;

				// Verificar si se requiere aggregation pipeline
				const requiresAggregation = (
					(ref.joins && ref.joins.length > 0) ||
					(cmd.groupBy && cmd.groupBy.length > 0) ||
					(cmd.having && cmd.having.length > 0) ||
					(cmd.orderBy && cmd.orderBy.length > 0) ||
					cmd.limit ||
					cmd.offset ||
					cmd.requiresAggregation
				);

				if (requiresAggregation) {
					// Pasar el comando completo en lugar de solo ref
					return this.buildAggregationWithJoins(cmd, columns);
				}

				// Si no se requiere aggregation, usar find normal
				return {
					find: ref.from,
					filter: ref.where || {},
					projection: ref.projection
				};
			}
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
							// Manejar campos con alias de tabla (ej: "u.name", "o.total")
							const fieldName = this.extractFieldName(col);
							fields[fieldName] = 1;
							cols.push(fieldName);
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
					const fieldName = this.extractFieldName(columns);
					projection = { _id: 0, [fieldName]: 1 };
					cols.push(fieldName);
				}
			}
			select.projection = projection;
			select.results = { cols, agregaciones };
		}

		selectCommand.set(select);
		return selectCommand;
	}

	/**
	 * Construye un pipeline de agregación que incluye JOINs
	 * 
	 * @param {Object} ref - Referencia del comando con from, where, joins, etc.
	 * @param {string|Array} columns - Columnas a seleccionar
	 * @returns {Object} Comando de agregación MongoDB
	 */
	/**
	 * Construye un pipeline de agregación completo con JOINs, GROUP BY, HAVING, ORDER BY, LIMIT, etc.
	 * 
	 * @param {Object} cmd - Comando completo con from, where, joins, groupBy, etc.
	 * @param {string|Array} columns - Columnas a seleccionar
	 * @returns {Object} Comando de agregación MongoDB
	 */
	buildAggregationWithJoins(cmd, columns) {
		const pipeline = [];

		// Obtener la referencia del select interno para compatibilidad
		const ref = cmd._commands?.[0] || cmd;

		// 1. Agregar match inicial si hay WHERE (antes de cualquier aggregation)
		if (ref.filter || ref.where) {
			pipeline.push({
				$match: ref.filter || ref.where
			});
		}

		// 2. Agregar JOINs como $lookup y $unwind
		if (cmd.joins && cmd.joins.length > 0) {
			const joinPipeline = this.buildJoinPipeline(cmd.joins);
			pipeline.push(...joinPipeline);
		}

		// 3. Agregar GROUP BY si está configurado
		if (cmd.groupBy && cmd.groupBy.length > 0) {
			// Agregar todos los stages $group
			cmd.groupBy.forEach(group => {
				pipeline.push(group.stage);
			});
		}

		// 4. Agregar HAVING si está configurado (después de GROUP BY)
		if (cmd.having && cmd.having.length > 0) {
			cmd.having.forEach(having => {
				pipeline.push(having.stage);
			});
		}

		// 5. Agregar ORDER BY si está configurado
		if (cmd.orderBy && cmd.orderBy.length > 0) {
			cmd.orderBy.forEach(order => {
				pipeline.push(order.stage);
			});
		}

		// 6. Agregar OFFSET/SKIP si está configurado
		if (cmd.offset) {
			pipeline.push(cmd.offset.stage);
		}

		// 7. Agregar LIMIT si está configurado
		if (cmd.limit) {
			pipeline.push(cmd.limit.stage);
		}

		// 8. Agregar proyección final si no es SELECT * y no hay GROUP BY
		// (GROUP BY ya define las columnas en el _id y agregaciones)
		if (ref.projection && (!cmd.groupBy || cmd.groupBy.length === 0)) {
			const aggregationProjection = this.buildAggregationProjection(ref.projection, cmd.joins || []);
			pipeline.push({
				$project: aggregationProjection
			});
		}

		return {
			aggregate: ref.find || cmd.from,
			pipeline: pipeline,
			cursor: {}
		};
	}

	/**
	 * Construye la proyección para aggregation pipeline considerando JOINs
	 * 
	 * @param {Object} baseProjection - Proyección base del SELECT
	 * @param {Array} joins - Array de JOINs configurados
	 * @returns {Object} Proyección para aggregation
	 */
	buildAggregationProjection(baseProjection, joins) {
		const projection = { ...baseProjection };

		// Agregar campos de las tablas unidas
		for (const join of joins) {
			const alias = join.alias;
			// Incluir todos los campos de la tabla unida con prefijo
			for (const field in baseProjection) {
				if (field.startsWith(`${alias}.`)) {
					const actualField = field.replace(`${alias}.`, '');
					projection[`${alias}.${actualField}`] = `$${alias}.${actualField}`;
				}
			}
		}

		return projection;
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

	/**
	 * Traduce SQL JOIN a MongoDB $lookup aggregation pipeline
	 * Convierte sintaxis SQL familiar a aggregation pipelines nativos de MongoDB
	 * 
	 * @param {string} table - Nombre de la tabla/colección a unir
	 * @param {string} condition - Condición del JOIN en formato SQL (ej: "users.id = orders.user_id")
	 * @param {string} [type='inner'] - Tipo de JOIN: 'inner', 'left', 'right', 'full'
	 * @param {string} [alias] - Alias opcional para la tabla unida
	 * @param {Command} selectCommand - Comando SELECT al que agregar el JOIN
	 * @returns {Command} Comando MongoDB con aggregation pipeline usando $lookup
	 * 
	 * @example
	 * // SQL: SELECT * FROM users u JOIN orders o ON u.id = o.user_id
	 * // Resultado MongoDB:
	 * // db.users.aggregate([
	 * //   { $lookup: { from: "orders", localField: "id", foreignField: "user_id", as: "orders" }},
	 * //   { $unwind: "$orders" } // para INNER JOIN
	 * // ])
	 * 
	 * @example
	 * // SQL: SELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id  
	 * // Resultado MongoDB:
	 * // db.users.aggregate([
	 * //   { $lookup: { from: "orders", localField: "id", foreignField: "user_id", as: "orders" }},
	 * //   { $unwind: { path: "$orders", preserveNullAndEmptyArrays: true }}
	 * // ])
	 */
	join(table, condition, type = 'inner', alias = null, selectCommand) {
		// Inicializar array de joins si no existe
		if (!selectCommand.joins) {
			selectCommand.joins = [];
		}

		// Parsear la condición SQL (ej: "users.id = orders.user_id")
		const joinCondition = this.parseJoinCondition(condition);

		// Crear configuración del lookup
		const lookupConfig = {
			from: table,
			localField: joinCondition.localField,
			foreignField: joinCondition.foreignField,
			as: alias || table
		};

		// Configurar el join según el tipo
		const joinStep = {
			type: type.toLowerCase(),
			lookup: lookupConfig,
			alias: alias || table
		};

		selectCommand.joins.push(joinStep);
		return selectCommand;
	}

	/**
	 * Parsea una condición de JOIN SQL y extrae los campos local y foráneo
	 * 
	 * @param {string} condition - Condición SQL (ej: "users.id = orders.user_id")
	 * @returns {Object} Objeto con localField y foreignField
	 * 
	 * @example
	 * parseJoinCondition("users.id = orders.user_id")
	 * // Returns: { localField: "id", foreignField: "user_id" }
	 */
	parseJoinCondition(condition) {
		// Limpiar espacios y dividir por el operador =
		const cleanCondition = condition.replace(/\s+/g, ' ').trim();
		const parts = cleanCondition.split('=');

		if (parts.length !== 2) {
			throw new Error(`Condición de JOIN inválida: ${condition}. Use formato: 'tabla1.campo1 = tabla2.campo2'`);
		}

		const leftSide = parts[0].trim();
		const rightSide = parts[1].trim();

		// Extraer campos (remover prefijos de tabla/alias)
		const localField = this.extractFieldName(leftSide);
		const foreignField = this.extractFieldName(rightSide);

		return {
			localField,
			foreignField
		};
	}

	/**
	 * Extrae el nombre del campo de una expresión con tabla/alias
	 * 
	 * @param {string} fieldExpression - Expresión como "users.id" o "u.id"
	 * @returns {string} Nombre del campo sin prefijo
	 * 
	 * @example
	 * extractFieldName("users.id") // Returns: "id"
	 * extractFieldName("u.id")     // Returns: "id"
	 * extractFieldName("id")       // Returns: "id"
	 */
	extractFieldName(fieldExpression) {
		const parts = fieldExpression.split('.');
		return parts.length > 1 ? parts[parts.length - 1] : fieldExpression;
	}

	/**
	 * Convierte los JOINs configurados en un pipeline de agregación MongoDB
	 * 
	 * @param {Array} joins - Array de configuraciones de JOIN
	 * @returns {Array} Pipeline de agregación MongoDB
	 */
	buildJoinPipeline(joins) {
		const pipeline = [];

		for (const join of joins) {
			// Agregar etapa $lookup
			pipeline.push({
				$lookup: join.lookup
			});

			// Agregar etapa $unwind según el tipo de JOIN
			switch (join.type) {
				case 'inner':
				case 'join':
					// INNER JOIN: eliminar documentos sin coincidencias
					pipeline.push({
						$unwind: `$${join.alias}`
					});
					break;

				case 'left':
				case 'left outer':
					// LEFT JOIN: preservar documentos sin coincidencias
					pipeline.push({
						$unwind: {
							path: `$${join.alias}`,
							preserveNullAndEmptyArrays: true
						}
					});
					break;

				case 'right':
				case 'right outer':
					// RIGHT JOIN: implementar intercambiando las colecciones
					console.warn('RIGHT JOIN se implementa mejor intercambiando el orden de las tablas en el FROM');
					pipeline.push({
						$unwind: `$${join.alias}`
					});
					break;

				case 'full':
				case 'full outer':
					// FULL OUTER JOIN: complejo, requiere múltiples pipelines
					console.warn('FULL OUTER JOIN no está completamente soportado en esta versión');
					pipeline.push({
						$unwind: {
							path: `$${join.alias}`,
							preserveNullAndEmptyArrays: true
						}
					});
					break;

				default:
					throw new Error(`Tipo de JOIN no soportado: ${join.type}`);
			}
		}

		return pipeline;
	}

	/**
	 * Inicializa métodos de conveniencia para diferentes tipos de JOIN
	 * Crea métodos como innerJoin(), leftJoin(), rightJoin(), etc.
	 */
	joins() {
		const joinTypes = {
			crossJoin: "cross",
			naturalJoin: "natural",
			innerJoin: "inner",
			join: "inner", // JOIN es equivalente a INNER JOIN
			leftJoin: "left",
			leftOuterJoin: "left",
			rightJoin: "right",
			rightOuterJoin: "right",
			fullJoin: "full",
			fullOuterJoin: "full"
		};

		// Crear métodos de conveniencia para cada tipo de JOIN
		for (const [methodName, joinType] of Object.entries(joinTypes)) {
			if (typeof this[methodName] === "function") {
				continue; // Ya existe el método
			}

			/**
			 * Método de conveniencia para JOIN específico
			 * @param {string} table - Tabla a unir
			 * @param {string} condition - Condición del JOIN
			 * @param {string} [alias] - Alias opcional
			 * @param {Command} selectCommand - Comando SELECT
			 * @returns {Command} Comando con JOIN agregado
			 */
			this[methodName] = (table, condition, alias = null, selectCommand) => {
				return this.join(table, condition, joinType, alias, selectCommand);
			};
		}
	}

	/**
	 * Método de conveniencia para INNER JOIN
	 * 
	 * @param {string} table - Nombre de la tabla a unir
	 * @param {string} condition - Condición del JOIN (ej: "users.id = orders.user_id")
	 * @param {string} [alias] - Alias opcional para la tabla
	 * @param {Command} selectCommand - Comando SELECT al que agregar el JOIN
	 * @returns {Command} Comando con INNER JOIN agregado
	 * 
	 * @example
	 * // SQL: SELECT * FROM users u INNER JOIN orders o ON u.id = o.user_id
	 * innerJoin('orders', 'users.id = orders.user_id', 'o', selectCommand)
	 */
	innerJoin(table, condition, alias = null, selectCommand) {
		return this.join(table, condition, 'inner', alias, selectCommand);
	}

	/**
	 * Método de conveniencia para LEFT JOIN
	 * 
	 * @param {string} table - Nombre de la tabla a unir
	 * @param {string} condition - Condición del JOIN (ej: "users.id = orders.user_id")
	 * @param {string} [alias] - Alias opcional para la tabla
	 * @param {Command} selectCommand - Comando SELECT al que agregar el JOIN
	 * @returns {Command} Comando con LEFT JOIN agregado
	 * 
	 * @example
	 * // SQL: SELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id
	 * leftJoin('orders', 'users.id = orders.user_id', 'o', selectCommand)
	 */
	leftJoin(table, condition, alias = null, selectCommand) {
		return this.join(table, condition, 'left', alias, selectCommand);
	}

	/**
	 * Método de conveniencia para RIGHT JOIN
	 * 
	 * @param {string} table - Nombre de la tabla a unir  
	 * @param {string} condition - Condición del JOIN (ej: "users.id = orders.user_id")
	 * @param {string} [alias] - Alias opcional para la tabla
	 * @param {Command} selectCommand - Comando SELECT al que agregar el JOIN
	 * @returns {Command} Comando con RIGHT JOIN agregado
	 * 
	 * @example
	 * // SQL: SELECT * FROM users u RIGHT JOIN orders o ON u.id = o.user_id
	 * rightJoin('orders', 'users.id = orders.user_id', 'o', selectCommand)
	 */
	rightJoin(table, condition, alias = null, selectCommand) {
		return this.join(table, condition, 'right', alias, selectCommand);
	}

	/**
	 * GROUP BY - Agrupa documentos por uno o más campos usando $group aggregation
	 * 
	 * @param {string|string[]} fields - Campo(s) por los que agrupar
	 * @param {Object} [aggregations={}] - Funciones de agregación (COUNT, SUM, AVG, etc.)
	 * @param {Command} [selectCommand] - Comando al que agregar la agrupación
	 * @returns {Command} El comando con la agrupación configurada
	 * 
	 * @example
	 * // SQL: SELECT category, COUNT(*) as total FROM products GROUP BY category
	 * groupBy('category', { total: { $count: {} } }, selectCommand)
	 * 
	 * @example
	 * // SQL: SELECT user_id, status, COUNT(*) as count, SUM(amount) as total
	 * //      FROM orders GROUP BY user_id, status
	 * groupBy(['user_id', 'status'], { 
	 *   count: { $count: {} }, 
	 *   total: { $sum: '$amount' } 
	 * }, selectCommand)
	 */
	groupBy(fields, aggregations = {}, selectCommand) {
		if (!selectCommand) {
			selectCommand = new Command();
		}

		// Asegurar que fields sea un array
		const groupFields = Array.isArray(fields) ? fields : [fields];

		// Construir el _id del $group basado en los campos
		let groupId = {};
		if (groupFields.length === 1) {
			groupId = `$${groupFields[0]}`;
		} else {
			groupFields.forEach(field => {
				groupId[field] = `$${field}`;
			});
		}

		// Construir el stage $group
		const groupStage = {
			$group: {
				_id: groupId,
				...aggregations
			}
		};

		// Agregar metadata de agrupación al comando
		if (!selectCommand.groupBy) {
			selectCommand.groupBy = [];
		}
		selectCommand.groupBy.push({
			fields: groupFields,
			aggregations: aggregations,
			stage: groupStage
		});

		// Marcar que se requiere aggregation pipeline
		selectCommand.requiresAggregation = true;

		return selectCommand;
	}

	/**
	 * HAVING - Filtra grupos después de GROUP BY usando $match después de $group
	 * 
	 * @param {Object} conditions - Condiciones para filtrar grupos
	 * @param {Command} [selectCommand] - Comando al que agregar el filtro
	 * @returns {Command} El comando con el filtro HAVING configurado
	 * 
	 * @example
	 * // SQL: SELECT category, COUNT(*) as total FROM products 
	 * //      GROUP BY category HAVING COUNT(*) > 5
	 * having({ total: { $gt: 5 } }, selectCommand)
	 * 
	 * @example
	 * // SQL: SELECT user_id, SUM(amount) as total FROM orders 
	 * //      GROUP BY user_id HAVING SUM(amount) > 1000
	 * having({ total: { $gt: 1000 } }, selectCommand)
	 */
	having(conditions, selectCommand) {
		if (!selectCommand) {
			throw new Error('HAVING requiere un comando SELECT con GROUP BY');
		}

		if (!selectCommand.groupBy || selectCommand.groupBy.length === 0) {
			throw new Error('HAVING debe usarse después de GROUP BY');
		}

		// Construir el stage $match para HAVING
		const havingStage = {
			$match: conditions
		};

		// Agregar metadata de HAVING al comando
		if (!selectCommand.having) {
			selectCommand.having = [];
		}
		selectCommand.having.push({
			conditions: conditions,
			stage: havingStage
		});

		return selectCommand;
	}

	/**
	 * ORDER BY - Ordena resultados usando $sort
	 * 
	 * @param {string|Object|Array} orderBy - Campo(s) y dirección de ordenamiento
	 * @param {string} [direction='asc'] - Dirección por defecto ('asc' o 'desc')
	 * @param {Command} [selectCommand] - Comando al que agregar el ordenamiento
	 * @returns {Command} El comando con el ordenamiento configurado
	 * 
	 * @example
	 * // SQL: SELECT * FROM users ORDER BY name ASC
	 * orderBy('name', 'asc', selectCommand)
	 * 
	 * @example
	 * // SQL: SELECT * FROM users ORDER BY age DESC, name ASC
	 * orderBy([{ field: 'age', direction: 'desc' }, { field: 'name', direction: 'asc' }], null, selectCommand)
	 * 
	 * @example
	 * // SQL: SELECT * FROM users ORDER BY age DESC, name ASC
	 * orderBy({ age: -1, name: 1 }, null, selectCommand)
	 */
	orderBy(orderBy, direction = 'asc', selectCommand) {
		if (!selectCommand) {
			selectCommand = new Command();
		}

		let sortSpec = {};

		// Procesar diferentes formatos de orderBy
		if (typeof orderBy === 'string') {
			// Formato simple: orderBy('name', 'desc')
			sortSpec[orderBy] = direction === 'desc' ? -1 : 1;
		} else if (Array.isArray(orderBy)) {
			// Formato array: [{ field: 'age', direction: 'desc' }, { field: 'name', direction: 'asc' }]
			orderBy.forEach(item => {
				if (typeof item === 'string') {
					sortSpec[item] = direction === 'desc' ? -1 : 1;
				} else if (item.field) {
					sortSpec[item.field] = (item.direction === 'desc') ? -1 : 1;
				}
			});
		} else if (typeof orderBy === 'object') {
			// Formato objeto MongoDB: { age: -1, name: 1 }
			sortSpec = { ...orderBy };
		}

		// Construir el stage $sort
		const sortStage = {
			$sort: sortSpec
		};

		// Agregar metadata de ordenamiento al comando
		if (!selectCommand.orderBy) {
			selectCommand.orderBy = [];
		}
		selectCommand.orderBy.push({
			spec: sortSpec,
			stage: sortStage
		});

		return selectCommand;
	}

	/**
	 * LIMIT - Limita el número de resultados usando $limit
	 * 
	 * @param {number} count - Número máximo de documentos a retornar
	 * @param {Command} [selectCommand] - Comando al que agregar el límite
	 * @returns {Command} El comando con el límite configurado
	 * 
	 * @example
	 * // SQL: SELECT * FROM users LIMIT 10
	 * limit(10, selectCommand)
	 */
	limit(count, selectCommand) {
		if (!selectCommand) {
			selectCommand = new Command();
		}

		if (typeof count !== 'number' || count < 0) {
			throw new Error('LIMIT debe ser un número positivo');
		}

		// Construir el stage $limit
		const limitStage = {
			$limit: count
		};

		// Agregar metadata de límite al comando
		selectCommand.limit = {
			count: count,
			stage: limitStage
		};

		return selectCommand;
	}

	/**
	 * OFFSET/SKIP - Omite un número de documentos usando $skip
	 * 
	 * @param {number} count - Número de documentos a omitir
	 * @param {Command} [selectCommand] - Comando al que agregar el skip
	 * @returns {Command} El comando con el skip configurado
	 * 
	 * @example
	 * // SQL: SELECT * FROM users OFFSET 20
	 * offset(20, selectCommand)
	 * 
	 * @example
	 * // Para paginación: LIMIT 10 OFFSET 20
	 * offset(20, selectCommand)
	 * limit(10, selectCommand)
	 */
	offset(count, selectCommand) {
		if (!selectCommand) {
			selectCommand = new Command();
		}

		if (typeof count !== 'number' || count < 0) {
			throw new Error('OFFSET debe ser un número positivo');
		}

		// Construir el stage $skip
		const skipStage = {
			$skip: count
		};

		// Agregar metadata de skip al comando
		selectCommand.offset = {
			count: count,
			stage: skipStage
		};

		return selectCommand;
	}

	/**
	 * Alias para offset() - más familiar para desarrolladores SQL
	 */
	skip(count, selectCommand) {
		return this.offset(count, selectCommand);
	}

	using(columnsInCommon) {
		return null;
	}

	union(...selects) {
		/**
		 * Implementa UNION SQL usando $unionWith de MongoDB
		 * Combina los resultados de múltiples consultas eliminando duplicados
		 * 
		 * @param {...(QueryBuilder|string|Object)} selects - Consultas a unir
		 * @returns {Command} Comando MongoDB con $unionWith
		 * 
		 * @example
		 * // UNION de dos tablas
		 * union(
		 *   qb.select('*').from('active_users'),
		 *   qb.select('*').from('inactive_users')
		 * )
		 * 
		 * @example  
		 * // UNION con colecciones directas
		 * union('collection1', 'collection2')
		 */
		if (selects.length === 0) {
			throw new Error('UNION requiere al menos una consulta');
		}

		const unionCommand = new Command();
		const pipeline = [];

		// Procesar cada SELECT/colección en el UNION
		for (let i = 0; i < selects.length; i++) {
			const select = selects[i];

			if (i === 0) {
				// La primera consulta define la colección base
				if (typeof select === 'string') {
					// Si es string, es nombre de colección
					unionCommand.set({
						aggregate: select,
						pipeline: pipeline,
						cursor: {}
					});
				} else if (select && typeof select === 'object') {
					// Si es QueryBuilder, extraer la información
					const ref = select._commands?.[0] || select;
					const basePipeline = this.buildPipelineFromSelect(select, ref.from || ref.find);

					pipeline.push(...basePipeline);

					unionCommand.set({
						aggregate: ref.from || ref.find,
						pipeline: pipeline,
						cursor: {}
					});
				}
			} else {
				// Las siguientes consultas se agregan como $unionWith
				if (typeof select === 'string') {
					// Unión simple con colección
					pipeline.push({
						$unionWith: {
							coll: select
						}
					});
				} else if (select && typeof select === 'object') {
					// Unión con pipeline de QueryBuilder
					const ref = select._commands?.[0] || select;
					const selectPipeline = this.buildPipelineFromSelect(select, ref.from || ref.find);

					pipeline.push({
						$unionWith: {
							coll: ref.from || ref.find,
							pipeline: selectPipeline
						}
					});
				}
			}
		}

		// Agregar $group para eliminar duplicados (comportamiento de UNION, no UNION ALL)
		pipeline.push({
			$group: {
				_id: "$$ROOT", // Agrupa por documento completo
			}
		});

		// Restaurar el documento original
		pipeline.push({
			$replaceRoot: {
				newRoot: "$_id"
			}
		});

		return unionCommand;
	}

	/**
	 * Implementa UNION ALL SQL usando $unionWith de MongoDB
	 * Combina los resultados de múltiples consultas SIN eliminar duplicados
	 * 
	 * @param {...(QueryBuilder|string|Object)} selects - Consultas a unir
	 * @returns {Command} Comando MongoDB con $unionWith
	 */
	unionAll(...selects) {
		/**
		 * Similar a union() pero sin el $group final para eliminar duplicados
		 */
		if (selects.length === 0) {
			throw new Error('UNION ALL requiere al menos una consulta');
		}

		const unionCommand = new Command();
		const pipeline = [];

		// Procesar cada SELECT/colección en el UNION ALL
		for (let i = 0; i < selects.length; i++) {
			const select = selects[i];

			if (i === 0) {
				// La primera consulta define la colección base
				if (typeof select === 'string') {
					unionCommand.set({
						aggregate: select,
						pipeline: pipeline,
						cursor: {}
					});
				} else if (select && typeof select === 'object') {
					const ref = select._commands?.[0] || select;
					const basePipeline = this.buildPipelineFromSelect(select, ref.from || ref.find);

					pipeline.push(...basePipeline);

					unionCommand.set({
						aggregate: ref.from || ref.find,
						pipeline: pipeline,
						cursor: {}
					});
				}
			} else {
				// Las siguientes consultas se agregan como $unionWith
				if (typeof select === 'string') {
					pipeline.push({
						$unionWith: {
							coll: select
						}
					});
				} else if (select && typeof select === 'object') {
					const ref = select._commands?.[0] || select;
					const selectPipeline = this.buildPipelineFromSelect(select, ref.from || ref.find);

					pipeline.push({
						$unionWith: {
							coll: ref.from || ref.find,
							pipeline: selectPipeline
						}
					});
				}
			}
		}

		// NO agregamos $group para eliminar duplicados (UNION ALL mantiene duplicados)
		return unionCommand;
	}

	whereCursor(cursorName) {
		return null;
	}

	on(predicados) {
		/**
		 * Implementa la cláusula ON para JOINs en MongoDB
		 * En MongoDB esto se maneja automáticamente en el $lookup
		 * pero podemos retornar las condiciones para validación o uso posterior
		 * 
		 * @param {Object|string} predicados - Condiciones del JOIN
		 * @returns {Object} Condiciones formateadas para MongoDB
		 */
		if (typeof predicados === 'string') {
			// Si es string, asumir que es una condición de igualdad simple
			// Ej: "users.id = orders.user_id"
			return this.parseJoinCondition(predicados);
		}

		if (typeof predicados === 'object') {
			// Si ya es un objeto, retornarlo tal como está
			return predicados;
		}

		// Retorno por defecto
		return { $eq: ["$_id", "$_id"] };
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
			isNull: "null",
			isNotNull: "null",
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
			if (/^(notLike)$/i.test(oper)) {
				this[oper] = (...predicados) => ({
					[predicados[0]]: {
						$not: {
							[logicos[oper]]: this.likeToRegex(predicados[1]),
						},
					},
				});
			}
			if (/^(isNull)$/i.test(oper)) {
				this[oper] = (campo) => ({
					[campo]: null,
				});
			}
			if (/^(isNotNull)$/i.test(oper)) {
				this[oper] = (campo) => ({
					[campo]: { $ne: null },
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
		/**
		 * Implementa ANY usando $elemMatch o $in según el contexto
		 * 
		 * @param {Array|QueryBuilder} subSelect - Valores o subconsulta
		 * @returns {Object|Command} Expresión MongoDB para ANY
		 * 
		 * @example
		 * // SQL: field = ANY(array_field)
		 * any(['value1', 'value2', 'value3'])
		 * // Resultado: { $in: ['value1', 'value2', 'value3'] }
		 */
		if (Array.isArray(subSelect)) {
			// ANY con array de valores → usar $in
			return {
				$in: subSelect
			};
		}

		if (subSelect instanceof QueryBuilder) {
			// ANY con subconsulta → usar $elemMatch
			const ref = subSelect._commands?.[0] || subSelect;

			// Si tiene condiciones WHERE, usar $elemMatch
			if (ref.where || ref.filter) {
				return {
					$elemMatch: ref.where || ref.filter
				};
			}

			// Si es una consulta más compleja, crear comando de aggregation
			const pipeline = this.buildPipelineFromSelect(subSelect, ref.from || ref.find);

			return new Command({
				aggregate: ref.from || ref.find,
				pipeline: pipeline,
				cursor: {}
			});
		}

		// ANY con valor único
		if (typeof subSelect === 'string' || typeof subSelect === 'number') {
			return {
				$eq: subSelect
			};
		}

		throw new Error('ANY requiere un array, QueryBuilder o valor');
	}

	some(subSelect) {
		/**
		 * SOME es equivalente a ANY en SQL
		 * 
		 * @param {Array|QueryBuilder} subSelect - Valores o subconsulta
		 * @returns {Object|Command} Expresión MongoDB para SOME
		 */
		return this.any(subSelect);
	}

	all(subSelect) {
		/**
		 * Implementa ALL usando $not con $in o lógica específica
		 * ALL requiere que la condición sea verdadera para TODOS los valores
		 * 
		 * @param {Array|QueryBuilder} subSelect - Valores o subconsulta
		 * @returns {Object|Command} Expresión MongoDB para ALL
		 * 
		 * @example
		 * // SQL: field > ALL(SELECT value FROM table)
		 * // Se traduce a: field > max(valores)
		 */
		if (Array.isArray(subSelect)) {
			// ALL con array → el campo debe cumplir la condición con TODOS los valores
			// Esto es complejo en MongoDB, dependería del operador específico
			// Por ahora implementamos un caso básico: NOT IN
			return {
				$nin: subSelect
			};
		}

		if (subSelect instanceof QueryBuilder) {
			// ALL con subconsulta → complejo, requiere agregaciones específicas
			const ref = subSelect._commands?.[0] || subSelect;

			// Crear pipeline para obtener todos los valores
			const pipeline = this.buildPipelineFromSelect(subSelect, ref.from || ref.find);

			// Para ALL, necesitamos una estrategia diferente según el contexto
			// Por ahora retornamos el pipeline básico
			return new Command({
				aggregate: ref.from || ref.find,
				pipeline: [
					...pipeline,
					{
						// Agrupar todos los valores en un array
						$group: {
							_id: null,
							allValues: { $push: "$$ROOT" }
						}
					}
				],
				cursor: {}
			});
		}

		// ALL con valor único (caso trivial)
		return {
			$eq: subSelect
		};
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
	 * Implementa SUBSTRING usando $substrCP de MongoDB
	 * 
	 * @param {string|column} column - Columna o campo
	 * @param {number} inicio - Posición inicial (base 0 en MongoDB)
	 * @param {...any} options - Longitud y/o alias
	 * @returns {Object} - Expresión MongoDB usando $substrCP
	 * 
	 * @example
	 * // SQL: SUBSTRING(name FROM 1 FOR 3) AS prefix
	 * substr('name', 0, 3, 'prefix')
	 * 
	 * @example
	 * // SQL: SUBSTRING(name FROM 1) AS suffix  
	 * substr('name', 0, 'suffix')
	 */
	substr(column, inicio, ...options) {
		let length = null;
		let alias = null;

		// Determinar parámetros basado en tipos
		if (options.length === 1) {
			if (typeof options[0] === 'number') {
				length = options[0];
			} else {
				alias = options[0];
			}
		} else if (options.length === 2) {
			length = options[0];
			alias = options[1];
		}

		// Construir expresión $substrCP
		let substrExpr;
		if (length !== null) {
			// SUBSTRING con longitud específica
			substrExpr = {
				$substrCP: [`$${column}`, inicio, length]
			};
		} else {
			// SUBSTRING desde posición hasta el final
			// MongoDB requiere longitud, usamos $strLenCP para calcular el resto
			substrExpr = {
				$substrCP: [
					`$${column}`,
					inicio,
					{ $subtract: [{ $strLenCP: `$${column}` }, inicio] }
				]
			};
		}

		if (alias) {
			return { [alias]: substrExpr };
		}

		return substrExpr;
	}

	/**
	 * Implementa CONCAT usando $concat de MongoDB
	 * 
	 * @param {Array|string} columns - Columnas a concatenar
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $concat
	 * 
	 * @example
	 * // SQL: CONCAT(first_name, ' ', last_name) AS full_name
	 * concat(['first_name', ' ', 'last_name'], 'full_name')
	 */
	concat(columns, alias = null) {
		let concatArray;

		if (Array.isArray(columns)) {
			// Procesar array de columnas/valores
			concatArray = columns.map(col => {
				if (typeof col === 'string') {
					// Si es string pero no es un nombre de campo válido (contiene espacios, etc.), es un literal
					if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) {
						return col; // Valor literal como ' ', 'texto', etc.
					} else {
						return `$${col}`; // Nombre de campo
					}
				}
				return col;
			});
		} else {
			// Si es un solo valor
			if (typeof columns === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columns)) {
				concatArray = [`$${columns}`];
			} else {
				concatArray = [columns];
			}
		}

		const concatExpr = {
			$concat: concatArray
		};

		if (alias) {
			return { [alias]: concatExpr };
		}

		return concatExpr;
	}

	/**
	 * Implementa TRIM usando $trim de MongoDB
	 * 
	 * @param {string} column - Columna a limpiar
	 * @param {string} [chars] - Caracteres a eliminar (por defecto espacios)
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $trim
	 */
	trim(column, chars = null, alias = null) {
		let trimExpr;

		if (chars) {
			trimExpr = {
				$trim: {
					input: `$${column}`,
					chars: chars
				}
			};
		} else {
			trimExpr = {
				$trim: {
					input: `$${column}`
				}
			};
		}

		if (alias) {
			return { [alias]: trimExpr };
		}

		return trimExpr;
	}

	/**
	 * Implementa LTRIM usando $ltrim de MongoDB
	 * 
	 * @param {string} column - Columna a limpiar
	 * @param {string} [chars] - Caracteres a eliminar por la izquierda
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $ltrim
	 */
	ltrim(column, chars = null, alias = null) {
		let ltrimExpr;

		if (chars) {
			ltrimExpr = {
				$ltrim: {
					input: `$${column}`,
					chars: chars
				}
			};
		} else {
			ltrimExpr = {
				$ltrim: {
					input: `$${column}`
				}
			};
		}

		if (alias) {
			return { [alias]: ltrimExpr };
		}

		return ltrimExpr;
	}

	/**
	 * Implementa RTRIM usando $rtrim de MongoDB
	 * 
	 * @param {string} column - Columna a limpiar
	 * @param {string} [chars] - Caracteres a eliminar por la derecha
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $rtrim
	 */
	rtrim(column, chars = null, alias = null) {
		let rtrimExpr;

		if (chars) {
			rtrimExpr = {
				$rtrim: {
					input: `$${column}`,
					chars: chars
				}
			};
		} else {
			rtrimExpr = {
				$rtrim: {
					input: `$${column}`
				}
			};
		}

		if (alias) {
			return { [alias]: rtrimExpr };
		}

		return rtrimExpr;
	}

	/**
	 * Implementa LENGTH usando $strLenCP de MongoDB
	 * 
	 * @param {string} column - Columna para calcular longitud
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $strLenCP
	 * 
	 * @example
	 * // SQL: LENGTH(name) AS name_length
	 * length('name', 'name_length')
	 */
	length(column, alias = null) {
		const lengthExpr = {
			$strLenCP: `$${column}`
		};

		if (alias) {
			return { [alias]: lengthExpr };
		}

		return lengthExpr;
	}

	/**
	 * Implementa UPPER usando $toUpper de MongoDB
	 * 
	 * @param {string} column - Columna a convertir a mayúsculas
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $toUpper
	 */
	upper(column, alias = null) {
		const upperExpr = {
			$toUpper: `$${column}`
		};

		if (alias) {
			return { [alias]: upperExpr };
		}

		return upperExpr;
	}

	/**
	 * Implementa LOWER usando $toLower de MongoDB
	 * 
	 * @param {string} column - Columna a convertir a minúsculas
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $toLower
	 */
	lower(column, alias = null) {
		const lowerExpr = {
			$toLower: `$${column}`
		};

		if (alias) {
			return { [alias]: lowerExpr };
		}

		return lowerExpr;
	}

	/**
	 * Implementa COALESCE usando $ifNull de MongoDB
	 * Retorna el primer valor no nulo de la lista
	 * 
	 * @param {Array|string} columns - Columnas a evaluar
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $ifNull
	 * 
	 * @example
	 * // SQL: COALESCE(nickname, first_name, 'Unknown') AS display_name
	 * coalesce(['nickname', 'first_name', 'Unknown'], 'display_name')
	 */
	coalesce(columns, alias = null) {
		if (!Array.isArray(columns)) {
			throw new Error('COALESCE requiere un array de columnas/valores');
		}

		if (columns.length < 2) {
			throw new Error('COALESCE requiere al menos 2 valores');
		}

		// Convertir columnas a referencias de campo MongoDB
		const processedColumns = columns.map(col => {
			if (typeof col === 'string') {
				// Verificar si es un nombre de campo válido o un valor literal
				if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col) && !col.includes("'") && !col.includes('"')) {
					// Es un nombre de campo válido
					return `$${col}`;
				} else {
					// Es un valor literal (mantener como está)
					return col;
				}
			}
			return col;
		});

		// Construir expresión $ifNull anidada
		let coalesceExpr = processedColumns[processedColumns.length - 1]; // Último valor como default

		// Iterar desde el penúltimo hacia atrás
		for (let i = processedColumns.length - 2; i >= 0; i--) {
			coalesceExpr = {
				$ifNull: [processedColumns[i], coalesceExpr]
			};
		}

		if (alias) {
			return { [alias]: coalesceExpr };
		}

		return coalesceExpr;
	}

	/**
	 * Implementa NULLIF usando $cond de MongoDB
	 * Retorna null si los dos valores son iguales, sino retorna el primer valor
	 * 
	 * @param {string} expr1 - Primera expresión
	 * @param {string} expr2 - Segunda expresión
	 * @param {string} [alias] - Alias del resultado
	 * @returns {Object} - Expresión MongoDB usando $cond
	 * 
	 * @example
	 * // SQL: NULLIF(status, 'unknown') AS clean_status
	 * nullif('status', 'unknown', 'clean_status')
	 */
	nullif(expr1, expr2, alias = null) {
		// Convertir expresiones a referencias de campo si es necesario
		const processExpr = (expr) => {
			if (typeof expr === 'string') {
				// Verificar si es un nombre de campo válido o un valor literal
				if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr) && !expr.includes("'") && !expr.includes('"')) {
					return `$${expr}`;
				}
			}
			return expr;
		};

		const processedExpr1 = processExpr(expr1);
		const processedExpr2 = processExpr(expr2);

		const nullifExpr = {
			$cond: {
				if: { $eq: [processedExpr1, processedExpr2] },
				then: null,
				else: processedExpr1
			}
		};

		if (alias) {
			return { [alias]: nullifExpr };
		}

		return nullifExpr;
	}

	/**
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - columna
	 * @param {Array<column,string>} casos - [condicion, resultado]
	 * @param {string} defecto - Caso else
	 * @returns {string}
	 */

	functionDate() {
		/**
		 * Implementa funciones de fecha usando expresiones MongoDB nativas
		 * En lugar de strings SQL, usa variables del sistema MongoDB
		 */
		const names = {
			currentDate: () => ({ $dateToString: { format: "%Y-%m-%d", date: "$$NOW" } }),
			currentTime: () => ({ $dateToString: { format: "%H:%M:%S", date: "$$NOW" } }),
			currentTimestamp: () => "$$NOW", // Timestamp actual completo
			localTime: () => ({ $dateToString: { format: "%H:%M:%S", date: "$$NOW", timezone: "$$TZInfo" } }),
			localTimestamp: () => ({ $dateToString: { format: "%Y-%m-%dT%H:%M:%S", date: "$$NOW", timezone: "$$TZInfo" } }),
			now: () => "$$NOW", // Alias para currentTimestamp
			today: () => ({ $dateToString: { format: "%Y-%m-%d", date: "$$NOW" } }), // Alias para currentDate
		};

		for (const name in names) {
			this[name] = names[name];
		}
	} /**
	 * Este metodo tiene dos firmas:
	 * case(column, casos, defecto)
	 * columna = CASE [WHEN condicion THEN resultado,..] ELSE defecto END
	 * @param {string|column} column - nombre de la columna AS
	 * @param {Array<Casos>} Casos - Array<column,string> => [ [condicion, resultado],...]
	 * @param {string} defecto - Caso else
	 *
	 * @returns {Object} - Expresión MongoDB usando $switch o $cond
	 * case(casos,defecto)
	 * @param {Array<column,string>} casos - {Array<Casos>} Casos  Array<column,string> => [ [condicion, resultado],...]
	 * @param {string} defecto - Caso else
	 *
	 * @returns {Object} - Expresión MongoDB usando $switch o $cond
	 * 
	 * @example
	 * // SQL: CASE status WHEN 'active' THEN 1 WHEN 'inactive' THEN 0 ELSE -1 END AS status_code
	 * case('status_code', [
	 *   [{ $eq: ['$status', 'active'] }, 1],
	 *   [{ $eq: ['$status', 'inactive'] }, 0]
	 * ], -1)
	 * 
	 * @example
	 * // SQL: CASE WHEN age > 18 THEN 'adult' WHEN age > 13 THEN 'teen' ELSE 'child' END
	 * case([
	 *   [{ $gt: ['$age', 18] }, 'adult'],
	 *   [{ $gt: ['$age', 13] }, 'teen']
	 * ], 'child')
	 */
	case(column, casos, defecto) {
		let items;
		let defaultValue = "";
		let fieldName = null;

		// Determinar el formato de entrada
		if (Array.isArray(column)) {
			// case(casos, defecto) - sin nombre de campo
			items = column;
			defaultValue = casos || null;
		} else {
			// case(column, casos, defecto) - con nombre de campo
			fieldName = column;
			items = casos;
			defaultValue = defecto || null;
		}

		if (!Array.isArray(items) || items.length === 0) {
			throw new Error('CASE requiere al menos una condición WHEN-THEN');
		}

		// Construir expresión MongoDB
		let caseExpression;

		if (items.length === 1) {
			// Para un solo caso, usar $cond
			const [condition, result] = items[0];
			caseExpression = {
				$cond: {
					if: condition,
					then: result,
					else: defaultValue
				}
			};
		} else {
			// Para múltiples casos, usar $switch
			const branches = items.map(([condition, result]) => ({
				case: condition,
				then: result
			}));

			caseExpression = {
				$switch: {
					branches: branches,
					default: defaultValue
				}
			};
		}

		// Si se especificó un nombre de campo, retornar objeto para $addFields o $project
		if (fieldName) {
			return {
				[fieldName]: caseExpression
			};
		}

		// Si no hay nombre de campo, retornar la expresión directamente
		return caseExpression;
	}

	/**
	 * Método auxiliar para crear condiciones CASE más fácilmente
	 * 
	 * @param {string} field - Campo a evaluar
	 * @param {Object} conditions - Objeto con valores y resultados { valor: resultado }
	 * @param {*} defaultValue - Valor por defecto
	 * @param {string} [alias] - Alias del campo resultado
	 * @returns {Object} Expresión CASE MongoDB
	 * 
	 * @example
	 * // Equivale a: CASE status WHEN 'active' THEN 'Activo' WHEN 'inactive' THEN 'Inactivo' ELSE 'Desconocido' END
	 * caseWhen('status', {
	 *   'active': 'Activo',
	 *   'inactive': 'Inactivo'
	 * }, 'Desconocido', 'estado_descripcion')
	 */
	caseWhen(field, conditions, defaultValue = null, alias = null) {
		const cases = Object.entries(conditions).map(([value, result]) => [
			{ $eq: [`$${field}`, value] },
			result
		]);

		const caseExpr = this.case(cases, defaultValue);

		if (alias) {
			return { [alias]: caseExpr };
		}

		return caseExpr;
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

// Exportaciones
export default MongoDB;
export { MongoDB };
