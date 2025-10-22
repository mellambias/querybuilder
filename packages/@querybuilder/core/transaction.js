import QueryBuilder from "./querybuilder.js";
import { log } from "./utils/utils.js";

/**
 * Clase para manejar transacciones SQL.
 * 
 * Permite agrupar múltiples operaciones SQL en una unidad atómica que se puede
 * confirmar (COMMIT) o revertir (ROLLBACK) como un todo. Soporta savepoints
 * para control de transacciones más granular.
 * 
 * Utiliza un Proxy para encadenar operaciones de manera fluida y ejecutarlas
 * secuencialmente cuando se invoca `start()`.
 * 
 * @class Transaction
 * @param {QueryBuilder} builder - Instancia del QueryBuilder.
 * @param {transactionOptions} [options] - Opciones de configuración de la transacción.
 * 
 * @example
 * // Transacción básica
 * const tx = qb.transaction();
 * tx.add(
 *   qb.insert('usuarios', ['Juan', 'juan@email.com']),
 *   qb.insert('perfiles', [1, 'admin'])
 * );
 * await tx.start();
 * 
 * @example
 * // Transacción con nivel de aislamiento
 * const tx = qb.transaction({ isolationLevel: 'SERIALIZABLE' });
 * tx.add(query1, query2, query3);
 * await tx.start();
 * 
 * @example
 * // Transacción con savepoints
 * const tx = qb.transaction();
 * tx.add(query1)
 *   .setSavePoint('sp1')
 *   .add(query2)
 *   .rollback('sp1')  // Revertir hasta sp1
 *   .add(query3)
 *   .commit();
 * await tx.start();
 */
class Transaction {
	constructor(builder, options = {}) {
		this.options = options;
		this.builder = builder;
		this.driver = builder?.driverDB;
		this.error = [];
		this.promise = Promise.resolve({ commandStack: [], stack: [], error: [] });
		this.returnOriginal = [...builder.returnOriginal, "start", "connect"];
		this.handler = {
			get(target, prop, receiver) {
				const original = Reflect.get(target, prop, receiver);
				if (typeof original === "function") {
					if (target.returnOriginal.indexOf(prop) >= 0) {
						return original;
					}
					return (...args) => {
						// añade la función a la cadena de promesas
						target.promise = target.promise.then((next) => {
							// iguala el numero de argumentos que recibe la función
							while (args.length < original.length - 1) {
								args.push(undefined);
							}
							// pasa 'next' como ultimo argumento de la función original
							args.push({ ...next });
							// ejecuta la funcion
							const response = original.apply(receiver, args);
							return response;
						});
						return receiver;
					};
				}
				return original;
			},
		};
		// biome-ignore lint/correctness/noConstructorReturn: <explanation>
		return new Proxy(this, this.handler);
	}

	/**
	 * Configura las opciones iniciales de la transacción.
	 * @method setUpTransaction
	 * @memberof Transaction
	 * @private
	 * @param {next} next - Objeto de estado interno inyectado por el Proxy.
	 * @returns {next} Objeto next actualizado.
	 */
	setUpTransaction(next) {
		if (this.options !== undefined) {
			next.commandStack = [
				`${this.builder.language.setTransaction(this.options)};`,
			];
			return next;
		}
	}

	/**
	 * Valida que la transacción tenga consultas antes de conectar.
	 * @method connect
	 * @memberof Transaction
	 * @private
	 * @param {next} next - Objeto de encadenamiento.
	 * @returns {Promise<next>} Promesa con objeto next validado.
	 * @throws {Error} Si no hay consultas en la transacción.
	 */
	async connect(next) {
		if (next.stack.length === 0) {
			next.error.push(
				new Error("Para iniciar una transacción es necesario tener consultas"),
			);
		}
		return next;
	}

	/**
	 * Agrega una o más consultas a la transacción.
	 * 
	 * Acepta instancias de QueryBuilder o strings SQL. Las consultas se ejecutarán
	 * en orden cuando se invoque `start()`.
	 * 
	 * @method add
	 * @memberof Transaction
	 * @param {...(QueryBuilder|string)} querys - Una o más consultas a agregar.
	 * @returns {Transaction} La instancia de Transaction para encadenamiento.
	 * 
	 * @example
	 * // Agregar múltiples QueryBuilders
	 * tx.add(
	 *   qb.insert('usuarios', ['Ana']),
	 *   qb.update('perfiles', { activo: true })
	 * );
	 * 
	 * @example
	 * // Agregar SQL directo
	 * tx.add(
	 *   'INSERT INTO logs VALUES (1, NOW())',
	 *   'UPDATE contadores SET valor = valor + 1'
	 * );
	 * 
	 * @example
	 * // Mezclar QueryBuilder y SQL
	 * tx.add(
	 *   qb.select('*').from('usuarios'),
	 *   'DELETE FROM temp_data'
	 * );
	 */
	async add(...querys) {
		const next = querys.pop();
		for (const query of querys) {
			if (query instanceof QueryBuilder) {
				const resolve = await query.promise;
				const lastIndex = resolve.q.length - 1;
				resolve.q[lastIndex] += !resolve.q[lastIndex].endsWith(";") ? ";" : "";
				const endCommandIndex = resolve.q.findIndex((item) =>
					item.endsWith(";"),
				);
				const command = resolve.q.splice(0, endCommandIndex + 1);
				next.stack.push(command.join("\n"));
			} else {
				next.stack.push(query.endsWith(";") ? query : query.concat(";"));
			}
		}
		return next;
	}

	/**
	 * Inicia la ejecución de la transacción.
	 * 
	 * Ejecuta todas las consultas agregadas dentro de una transacción SQL.
	 * Si ocurre un error, automáticamente ejecuta ROLLBACK. Si todas las
	 * operaciones tienen éxito, ejecuta COMMIT automáticamente.
	 * 
	 * @method start
	 * @memberof Transaction
	 * @param {Object} [options] - Opciones de inicio.
	 * @param {boolean} [options.debug=false] - Si es true, no ejecuta y solo retorna el objeto.
	 * @returns {Promise<Transaction>} Promesa que resuelve la instancia de Transaction.
	 * @throws {Error} Si hay problemas durante la ejecución de la transacción.
	 * 
	 * @example
	 * // Iniciar transacción normal
	 * const tx = qb.transaction();
	 * tx.add(query1, query2);
	 * await tx.start();
	 * console.log(tx.result); // Resultados de las consultas
	 * 
	 * @example
	 * // Modo debug (no ejecuta)
	 * const tx = qb.transaction();
	 * tx.add(query1, query2);
	 * const txObj = await tx.start({ debug: true });
	 * const sql = await txObj.toString(); // Ver SQL sin ejecutar
	 * 
	 * @example
	 * // Manejo de errores
	 * try {
	 *   const tx = qb.transaction();
	 *   tx.add(query1, query2);
	 *   await tx.start();
	 *   console.log('Transacción exitosa');
	 * } catch (error) {
	 *   console.error('Rollback automático:', error);
	 * }
	 */
	async start(options) {
		let next = await this.promise;
		next = await this.connect(next);
		if (next.error.length) {
			throw new Error("Problemas con la transaccion", { cause: next.error });
		}
		try {
			next.commandStack.push(
				`${this.builder.language.startTransaction(options)};`,
			);
			const transaction = await this.toString();
			if (options?.debug) {
				return this;
			}
			if (this.driver) {
				await this.driver.execute(transaction, {
					transaction: true,
				});
				this.result = this.driver.response();
				this.error = [];
				await this.driver.execute("COMMIT;");
				return this;
			}
		} catch (error) {
			next.error.push(
				`Capture on Transaction [start-rollback] ${error.message}`,
			);
			this.error = next.error;
			this.result = undefined;
			await this.driver.execute("ROLLBACK;");
			throw new Error(`[Transaction][startTransaction] ${next.error}`, {
				cause: next.error,
			});
		}
	}

	/**
	 * Crea un savepoint (punto de guardado) en la transacción.
	 * 
	 * Los savepoints permiten revertir parcialmente una transacción hasta un
	 * punto específico sin deshacer toda la transacción.
	 * 
	 * @method setSavePoint
	 * @memberof Transaction
	 * @param {string} name - Nombre del savepoint.
	 * @returns {Transaction} La instancia de Transaction para encadenamiento.
	 * 
	 * @example
	 * const tx = qb.transaction();
	 * tx.add(query1)
	 *   .setSavePoint('antes_actualizacion')
	 *   .add(query2)
	 *   .rollback('antes_actualizacion')  // Revierte query2
	 *   .add(query3);
	 * await tx.start();
	 */
	setSavePoint(name, next) {
		try {
			const savePoint = `${this.builder.language.setSavePoint(name)};`;
			next.stack.push(savePoint);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	/**
	 * Libera un savepoint (punto de guardado) eliminándolo.
	 * 
	 * Una vez liberado, ya no se puede hacer rollback a ese savepoint.
	 * 
	 * @method clearSavePoint
	 * @memberof Transaction
	 * @param {string} name - Nombre del savepoint a liberar.
	 * @returns {Transaction} La instancia de Transaction para encadenamiento.
	 * 
	 * @example
	 * const tx = qb.transaction();
	 * tx.add(query1)
	 *   .setSavePoint('sp1')
	 *   .add(query2)
	 *   .clearSavePoint('sp1')  // Ya no se puede hacer rollback a sp1
	 *   .add(query3);
	 * await tx.start();
	 */
	clearSavePoint(name, next) {
		try {
			next.stack.push(`${this.builder.language.clearSavePoint(name)};`);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	/**
	 * Confirma la transacción (COMMIT).
	 * 
	 * Hace permanentes todos los cambios realizados en la transacción.
	 * Generalmente no es necesario llamarlo explícitamente ya que `start()`
	 * lo hace automáticamente si no hay errores.
	 * 
	 * @method commit
	 * @memberof Transaction
	 * @returns {Transaction} La instancia de Transaction para encadenamiento.
	 * 
	 * @example
	 * const tx = qb.transaction();
	 * tx.add(query1, query2)
	 *   .commit();  // Confirmar explícitamente
	 * await tx.start();
	 */
	commit(next) {
		try {
			next.stack.push(`${this.builder.language.commit()};`);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	/**
	 * Revierte la transacción completa o hasta un savepoint.
	 * 
	 * Si se proporciona un savepoint, revierte solo hasta ese punto.
	 * Si no se proporciona, revierte toda la transacción (ROLLBACK completo).
	 * 
	 * @method rollback
	 * @memberof Transaction
	 * @param {string} [savepoint] - Nombre del savepoint hasta donde revertir (opcional).
	 * @returns {Transaction} La instancia de Transaction para encadenamiento.
	 * 
	 * @example
	 * // Rollback completo
	 * const tx = qb.transaction();
	 * tx.add(query1, query2)
	 *   .rollback();  // Revierte todo
	 * await tx.start();
	 * 
	 * @example
	 * // Rollback hasta savepoint
	 * const tx = qb.transaction();
	 * tx.add(query1)
	 *   .setSavePoint('sp1')
	 *   .add(query2)
	 *   .rollback('sp1')  // Solo revierte query2
	 *   .add(query3);
	 * await tx.start();
	 */
	rollback(savepoint, next) {
		try {
			next.stack.push(`${this.builder.language.rollback(savepoint)};`);
		} catch (error) {
			next.error.push(error.message);
		}
		return next;
	}

	/**
	 * Convierte la transacción a una cadena SQL.
	 * 
	 * Genera el SQL completo de la transacción incluyendo BEGIN/START TRANSACTION,
	 * todas las consultas agregadas, y comandos de savepoint/rollback/commit.
	 * 
	 * @method toString
	 * @memberof Transaction
	 * @returns {Promise<string>} Promesa que resuelve el SQL completo de la transacción.
	 * 
	 * @example
	 * const tx = qb.transaction();
	 * tx.add(
	 *   qb.insert('usuarios', ['Pedro']),
	 *   qb.update('contadores', { total: 100 })
	 * );
	 * const sql = await tx.toString();
	 * console.log(sql);
	 * // BEGIN TRANSACTION;
	 * // INSERT INTO usuarios VALUES ('Pedro');
	 * // UPDATE contadores SET total = 100;
	 */
	async toString() {
		const resolve = await this.promise;
		const text = resolve.commandStack
			.join("\n")
			.concat("\n", resolve.stack.filter((item) => item !== null).join("\n"));
		return text;
	}

	/**
	 * Alias de toString() para compatibilidad.
	 * @method queryJoin
	 * @memberof Transaction
	 * @returns {Promise<string>} SQL de la transacción.
	 */
	queryJoin() {
		return this.toString();
	}

	/**
	 * Ejecuta la transacción (retorna this para compatibilidad).
	 * @method execute
	 * @memberof Transaction
	 * @returns {Transaction} La instancia de Transaction.
	 */
	execute() {
		return this;
	}
}

export default Transaction;
