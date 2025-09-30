import { commandToGroup } from "../comandos/subconjuntos.js";
//response, rows, columns
/**
 * affectedRows	Número de filas afectadas por la consulta (UPDATE, DELETE, etc.).
 * rowCount	Número de filas devueltas.
 * warningStatus	Número de advertencias generadas por la consulta.
 * fieldCount	Número de columnas devueltas (usualmente 0 para operaciones no SELECT).
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

	valueOf() {
		return { status: this.status, rows: this.rows, columns: this.columns };
	}
	toString() {
		return this.valueOf();
	}
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
