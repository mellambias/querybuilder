/**
 * @description Clase que representa una columna en una consulta SQL.
 * @author Miguel E. LLambias <mellambias@gmail.com>
 */

import QueryBuilder from "./querybuilder.js";
import Expresion from "./expresion.js";

/**
 * Clase que representa una columna en una consulta SQL.
 * @class	Column
 * @param	{string|QueryBuilder} name - Nombre de la columna o una instancia de QueryBuilder para subconsultas.
 * @param	{string} [table] - Nombre de la tabla a la que pertenece la columna.
 * @param	{string} [dataType] - Tipo de dato de la columna.
 * @param	{string} [type] - Tipo de dato específico.
 * @example
 * const col1 = new Column('id', 'users', 'integer');
 * const col2 = new Column('name', 'users', 'string').as('username');
 * const subquery = new QueryBuilder().select('id').from('orders').where('user_id', '=', 1);
 * const col3 = new Column(subquery, null, 'integer').as('order_id');
 */
class Column {
	constructor(name, table, dataType, type) {
		this.name = name; // string  | QueryBuilder
		this._table = table;
		this.dataType = dataType;
		this._type = type;
		this._alias = undefined;
		this._cast = undefined;
		this._qb = name instanceof QueryBuilder;
	}
	/**
	 * Devuelve el nombre de la columna
	 * @returns {string} Nombre de la columna con su alias si existe
	 */
	toString() {
		if (this._qb) {
			if (this._alias === undefined) {
				throw new Error("El campo subselect tiene que usar un alias AS");
			}
			return `(${this.name}) AS ${this._alias}`;
		}
		if (typeof this.name === "string") {
			const [table, name] = this.name.split(".");
			if (name !== undefined) {
				this.name = name;
				this._table = table;
			}
			if (this._cast !== undefined) {
				return `CAST(${this.name} AS ${this._cast}) ${this._alias !== undefined ? `AS ${this._alias}` : ""}`;
			}
			if (typeof this._table !== "undefined") {
				return `${this._table}.${this.name}${this._alias !== undefined ? ` AS ${this._alias}` : ""}`;
			}
			return `${this.name}${this._alias !== undefined ? ` AS ${this._alias}` : ""}`;
		}

		if (this.name instanceof Expresion) {
			return `${this.name} AS ${this._alias}`;
		}
	}
	/**
	 * Establece el alias de la columna
	 * @method as
	 * @memberof Column
	 * @param {string} alias - alias de la columna
	 * @returns {Column} para encadenamiento
	 * @throws {Error} String - Si el alias no es un identificador SQL válido
	 * @example
	 * const col = new Column('name').as('username');
	 */
	as(alias) {
		if (alias.validSqlId()) {
			this._alias = alias;
		} else {
			return new Error(`❌El alias '${alias}' no es un identificador valido`);
		}
		return this;
	}
	/**
	 * Establece el tipo de dato de la columna
	 * @param {string} value - typo de dato
	 * @returns {Column}
	 */
	type(value) {
		this._type = value.toDataType(this.dataType);
		return this;
	}
	/**
	 * Establece el nombre de la tabla asociada al campo
	 * @param {string} table
	 * @returns {Column}
	 */
	from(table) {
		this._table = table;
		return this;
	}
	/**
	 * Establece un cambio de type para la columna
	 * @param {string} value - nuevo tipo
	 * @returns {Column} La instancia actual de Column para encadenamiento
	 */
	cast(value) {
		this._cast = value.toDataType(this.dataType);
		return this;
	}

	/**
	 * Convierte el valor de la columna a mayúsculas
	 * @returns {string} El valor de la columna en mayúsculas
	 */
	toUpperCase() {
		return this.toString().toUpperCase();
	}

	/**
	 * Convierte el valor de la columna a minúsculas
	 * @returns {string} El valor de la columna en minúsculas
	 */
	toLowerCase() {
		return this.toString().toLowerCase();
	}
}
export default Column;
