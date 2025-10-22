/**
 * @fileoverview Clase para manejar los resultados de consultas SQL.
 * @description Módulo que implementa la clase Result para manejar los resultados de consultas SQL.
 * Permite almacenar y acceder a información sobre la consulta ejecutada,
 * como el número de filas afectadas, las filas devueltas, las columnas, mensajes de error y advertencias.	
 * 
 * @version 2.0.0
 */

import { commandToGroup } from "../comandos/subconjuntos.js";

/**
 * Clase que representa el resultado de una consulta SQL.
 * 
 * Almacena y proporciona acceso a toda la información relacionada con la ejecución
 * de una consulta SQL: filas devueltas, columnas, filas afectadas, errores,
 * advertencias y estado del servidor.
 * 
 * @class Result
 * @param {string} [query=""] - La consulta SQL ejecutada.
 * 
 * @property {string} _query - Consulta SQL ejecutada
 * @property {*} _queryResult - Resultado crudo de la consulta
 * @property {string} _command - Comando SQL (SELECT, INSERT, UPDATE, etc.)
 * @property {number} _affectedRows - Número de filas afectadas
 * @property {Array<Object>} _rows - Filas devueltas por la consulta
 * @property {number} _rowCount - Número de filas devueltas
 * @property {Array<string>} _columns - Nombres de las columnas
 * @property {number} _fieldCount - Número de columnas
 * @property {string} _info - Información adicional
 * @property {*} _serverStatus - Estado del servidor
 * @property {number} _warningStatus - Número de advertencias
 * @property {number} _errorStatus - Número de errores
 * @property {string} _error - Mensaje de error
 * 
 * @example
 * // Crear un resultado vacío
 * const result = new Result('SELECT * FROM usuarios');
 * 
 * @example
 * // El driver llena el resultado
 * result.rows = [{ id: 1, nombre: 'Juan' }];
 * result.columns = ['id', 'nombre'];
 * result.rowCount = 1;
 * result.fieldCount = 2;
 * 
 * @example
 * // Acceder a los datos
 * console.log(result.status); // Estado completo
 * console.log(result.rows);   // Filas devueltas
 * console.log(result.columns); // Nombres de columnas
 */
class Result {
	constructor(query = "") {
		this._query = query;
		this._queryResult = null;
		this._command = null;
		this._affectedRows = 0;
		this._rows = [];
		this._rowCount = 0;
		this._columns = [];
		this._fieldCount = 0;
		this._info = "";
		this._serverStatus = null;
		this._warningStatus = 0;
		this._errorStatus = 0;
		this._error = "";
	}

	// ==================== GETTERS ====================

	/**
	 * Devuelve el grupo al que pertenece un comando SQL.
	 * @method getGroup
	 * @memberof Result
	 * @private
	 * @param {string} sql - El comando SQL a evaluar.
	 * @returns {string} El grupo al que pertenece el comando (DQL, DML, DDL, etc.).
	 */
	getGroup(sql) {
		return commandToGroup(sql);
	}

	/**
	 * Obtiene la consulta SQL ejecutada.
	 * @type {string}
	 * @readonly
	 */
	get query() {
		return this._query;
	}

	/**
	 * Obtiene el comando SQL (SELECT, INSERT, UPDATE, DELETE, etc.).
	 * @type {string}
	 * @readonly
	 */
	get command() {
		return this._command;
	}

	/**
	 * Obtiene el número de filas afectadas por la consulta.
	 * Útil para INSERT, UPDATE, DELETE.
	 * @type {number}
	 * @readonly
	 */
	get affectedRows() {
		return this._affectedRows;
	}

	/**
	 * Obtiene el estado completo del resultado de la consulta.
	 * @type {Object}
	 * @property {string} query - Consulta SQL ejecutada
	 * @property {number} rowCount - Número de filas devueltas
	 * @property {number} fieldCount - Número de columnas
	 * @property {string} info - Información adicional
	 * @property {number} errors - Número de errores
	 * @property {number} warnings - Número de advertencias
	 * @property {string} [error] - Mensaje de error (si hay errores)
	 * @readonly
	 */
	get status() {
		const status = {
			query: this.query,
			rowCount: this.rowCount,
			fieldCount: this.fieldCount,
			info: this.info,
			errors: this.errorStatus,
			warnings: this.warningStatus,
		};
		if (status.errors) {
			status.error = this.error;
		}
		return status;
	}

	/**
	 * Obtiene las filas devueltas por la consulta.
	 * @type {Array<Object>}
	 * @readonly
	 */
	get rows() {
		return this._rows;
	}

	/**
	 * Obtiene el mapeo de filas a JSON (si se aplicó toJson).
	 * @type {Object}
	 * @readonly
	 */
	get rowsToJson() {
		return this._rowsToJson;
	}

	/**
	 * Obtiene el mapeo inverso de JSON a filas (si se aplicó toJson).
	 * @type {Object}
	 * @readonly
	 */
	get jsonToRows() {
		return this._jsonToRows;
	}

	/**
	 * Obtiene el número de filas devueltas por la consulta.
	 * @type {number}
	 * @readonly
	 */
	get rowCount() {
		return this._rowCount;
	}

	/**
	 * Obtiene los nombres de las columnas devueltas.
	 * @type {Array<string>}
	 * @readonly
	 */
	get columns() {
		return this._columns;
	}

	/**
	 * Obtiene el número de columnas/campos devueltos.
	 * @type {number}
	 * @readonly
	 */
	get fieldCount() {
		return this._fieldCount;
	}

	/**
	 * Obtiene información adicional sobre la ejecución de la consulta.
	 * @type {string}
	 * @readonly
	 */
	get info() {
		return this._info;
	}

	/**
	 * Obtiene el estado del servidor de base de datos.
	 * @type {*}
	 * @readonly
	 */
	get serverStatus() {
		return this._serverStatus;
	}

	/**
	 * Obtiene el número de advertencias generadas.
	 * @type {number}
	 * @readonly
	 */
	get warningStatus() {
		return this._warningStatus;
	}

	/**
	 * Obtiene el número de errores generados.
	 * @type {number}
	 * @readonly
	 */
	get errorStatus() {
		return this._errorStatus;
	}

	/**
	 * Obtiene el mensaje de error (si existe).
	 * @type {string}
	 * @readonly
	 */
	get error() {
		return this._error;
	}

	// ==================== SETTERS ====================

	/**
	 * Establece la consulta SQL ejecutada.
	 * @type {string}
	 */
	set query(value) {
		this._query = value;
	}

	/**
	 * Establece el resultado crudo de la consulta.
	 * @type {*}
	 */
	set queryResult(value) {
		this._queryResult = value;
	}

	/**
	 * Establece el comando SQL.
	 * @type {string}
	 */
	set command(value) {
		this._command = value;
	}

	/**
	 * Establece el número de filas afectadas.
	 * @type {number}
	 */
	set affectedRows(value) {
		this._affectedRows = value;
	}

	/**
	 * Establece las filas devueltas.
	 * @type {Array<Object>}
	 */
	set rows(value) {
		this._rows = value;
	}

	/**
	 * Establece el mapeo de filas a JSON.
	 * @type {Object}
	 */
	set rowsToJson(dao) {
		this._rowsToJson = dao;
	}

	/**
	 * Establece el mapeo inverso de JSON a filas.
	 * @type {Object}
	 */
	set jsonToRows(dao) {
		this._jsonToRows = dao;
	}

	/**
	 * Establece el número de filas devueltas.
	 * @type {number}
	 */
	set rowCount(value) {
		this._rowCount = value;
	}

	/**
	 * Establece los nombres de las columnas.
	 * @type {Array<string>}
	 */
	set columns(value) {
		this._columns = value;
	}

	/**
	 * Establece el número de columnas/campos.
	 * @type {number}
	 */
	set fieldCount(value) {
		this._fieldCount = value;
	}

	/**
	 * Establece la información adicional.
	 * @type {string}
	 */
	set info(value) {
		this._info = value;
	}

	/**
	 * Establece el estado del servidor.
	 * @type {*}
	 */
	set serverStatus(value) {
		this._serverStatus = value;
	}

	/**
	 * Establece el número de advertencias.
	 * @type {number}
	 */
	set warningStatus(value) {
		this._warningStatus = value;
	}

	/**
	 * Establece el número de errores.
	 * @type {number}
	 */
	set errorStatus(value) {
		this._errorStatus = value;
	}

	/**
	 * Establece el mensaje de error.
	 * @type {string}
	 */
	set error(value) {
		this._error = value;
	}

	// ==================== METHODS ====================

	/**
	 * Devuelve un objeto con el estado completo del resultado.
	 * 
	 * Combina el estado, las filas y las columnas en un solo objeto
	 * para facilitar el acceso a toda la información del resultado.
	 * 
	 * @method valueOf
	 * @memberof Result
	 * @returns {Object} Objeto con status, rows y columns.
	 * @property {Object} status - Estado del resultado
	 * @property {Array<Object>} rows - Filas devueltas
	 * @property {Array<string>} columns - Nombres de columnas
	 * 
	 * @example
	 * const result = await qb.select('*').from('usuarios').execute();
	 * const data = result.valueOf();
	 * console.log(data.status);  // { query: '...', rowCount: 5, ... }
	 * console.log(data.rows);    // [{ id: 1, nombre: 'Juan' }, ...]
	 * console.log(data.columns); // ['id', 'nombre', 'email']
	 */
	valueOf() {
		return { status: this.status, rows: this.rows, columns: this.columns };
	}

	/**
	 * Convierte el resultado a una representación en cadena.
	 * @method toString
	 * @memberof Result
	 * @returns {Object} El mismo objeto que valueOf().
	 */
	toString() {
		return this.valueOf();
	}

	/**
	 * Transforma las filas del resultado aplicando un mapeo de columnas.
	 * 
	 * Permite renombrar columnas aplicando un objeto de mapeo (DAO - Data Access Object).
	 * Solo las columnas especificadas en el DAO serán incluidas en el resultado.
	 * 
	 * @method toJson
	 * @memberof Result
	 * @param {Object} dao - Objeto que mapea nombres de columnas originales a nuevos nombres.
	 * @returns {Object} Objeto con rows, columns y mapeos bidireccionales.
	 * @property {Array<Object>} rows - Filas transformadas
	 * @property {Array<string>} columns - Nuevos nombres de columnas
	 * @property {Object} [rowsToJson] - Mapeo original → nuevo
	 * @property {Object} [jsonToRows] - Mapeo nuevo → original
	 * 
	 * @example
	 * // Resultado original
	 * result.rows = [{ id: 1, name: 'John Doe', age: 30 }];
	 * result.columns = ['id', 'name', 'age'];
	 * 
	 * // Aplicar mapeo
	 * const dao = { id: 'userId', name: 'userName' };
	 * const transformed = result.toJson(dao);
	 * 
	 * console.log(transformed.rows);
	 * // [{ userId: 1, userName: 'John Doe' }]
	 * // Nota: 'age' se omite porque no está en el DAO
	 * 
	 * console.log(transformed.columns);
	 * // ['id', 'name']
	 * 
	 * console.log(transformed.rowsToJson);
	 * // { id: 'userId', name: 'userName' }
	 * 
	 * console.log(transformed.jsonToRows);
	 * // { id: 'id', name: 'name' }
	 * 
	 * @example
	 * // Sin DAO, retorna datos sin transformar
	 * const original = result.toJson(null);
	 * console.log(original.rows);    // Filas originales
	 * console.log(original.columns); // Columnas originales
	 */
	toJson(dao) {
		if (dao != null && this._rows.length) {
			const keysForDao = Object.keys(dao);
			this._rows = this._rows.map((row) => {
				const newDao = {};
				for (const key of keysForDao) {
					newDao[key] = row[dao[key]];
				}
				return newDao;
			});
			this.fieldCount = keysForDao.length;
			return {
				rows: this.rows,
				columns: keysForDao,
				rowsToJson: dao,
				jsonToRows: this.columns.reduce((json, col, i) => {
					json[col] = keysForDao[i];
					return json;
				}, {}),
			};
		}
		return { rows: this.rows, columns: this.columns };
	}
}

export default Result;
