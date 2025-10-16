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
 * @class Result
 * @description Clase que representa el resultado de una consulta SQL.
 * Permite almacenar y acceder a información sobre la consulta ejecutada,
 * como el número de filas afectadas, las filas devueltas, las columnas,
 * mensajes de error y advertencias.
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
	/**
	 * GETTERS
	 */
	/**
	 * @method getGroup
	 * @memberof Result
	 * @private
	 * @description Devuelve el grupo al que pertenece un comando SQL.
	 * @param {String} sql - El comando SQL a evaluar.
	 * @returns {String} El grupo al que pertenece el comando SQL.
	 */

	getGroup(sql) {
		return commandToGroup(sql);
	}

	get query() {
		return this._query;
	}

	get command() {
		return this._command;
	}

	get affectedRows() {
		return this._affectedRows;
	}

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

	get rows() {
		return this._rows;
	}
	get rowsToJson() {
		return this._rowsToJson;
	}

	get jsonToRows() {
		return this._jsonToRows;
	}

	get rowCount() {
		return this._rowCount;
	}

	get columns() {
		return this._columns;
	}

	get fieldCount() {
		return this._fieldCount;
	}

	get info() {
		return this._info;
	}
	get serverStatus() {
		return this._serverStatus;
	}

	get warningStatus() {
		return this._warningStatus;
	}

	get errorStatus() {
		return this._errorStatus;
	}

	get error() {
		return this._error;
	}
	/**
	 * SETTERS
	 */

	set query(value) {
		this._query = value;
	}

	set queryResult(value) {
		this._queryResult = value;
	}

	set command(value) {
		this._command = value;
	}
	set affectedRows(value) {
		this._affectedRows = value;
	}

	set rows(value) {
		this._rows = value;
	}

	set rowsToJson(dao) {
		this._rowsToJson = dao;
	}

	set jsonToRows(dao) {
		this._jsonToRows = dao;
	}

	set rowCount(value) {
		this._rowCount = value;
	}

	set columns(value) {
		this._columns = value;
	}

	set fieldCount(value) {
		this._fieldCount = value;
	}

	set info(value) {
		this._info = value;
	}

	set serverStatus(value) {
		this._serverStatus = value;
	}

	set warningStatus(value) {
		this._warningStatus = value;
	}

	set errorStatus(value) {
		this._errorStatus = value;
	}

	set error(value) {
		this._error = value;
	}
	/**
	 * METHODS
	 */

	/**
	 * @method valueOf
	 * @memberof Result
	 * @description Devuelve un objeto con el estado del resultado de la consulta.
	 * Incluye el estado, las filas y las columnas.
	 * @returns {ResultData} ResultData El estado del resultado de la consulta.

	 */
	valueOf() {
		return { status: this.status, rows: this.rows, columns: this.columns };
	}
	/**
	 * @method toString
	 * @memberof Result
	 * @private
	 * @description Devuelve una representación en cadena del resultado de la consulta.
	 * @returns {String} La representación en cadena del resultado de la consulta.
	 */
	toString() {
		return this.valueOf();
	}
	/**
	 * @method toJson
	 * @memberof Result
	 * @description Convierte el resultado de la consulta a formato JSON.
	 * @param {Object} dao - Un objeto que mapea los nombres de las columnas a sus valores.
	 * @returns {Object} Un objeto que representa el resultado de la consulta en formato JSON.
	 * @example
	 * //Cada clave en el objeto corresponde a un nombre de columna y su valor asociado.
	 * //Si una columna no tiene un mapeo en el objeto dao, se omite en el resultado JSON.
	 * original row = { id: 1, name: 'John Doe', age: 30 }
	 * dao = { id: 'userId', name: 'userName' }
	 * result = { userId: 1, userName: 'John Doe' }
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
