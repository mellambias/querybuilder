import QueryBuilder from "./querybuilder.js";
import Expresion from "./expresion.js";

class Column {
	constructor(name, table, dataType, type) {
		this.name = name; // string  | QueryBuilder
		this._table = table;
		this.dataType = dataType;
		this._type = type;
		this._alias = undefined;
		this._cast = undefined;
	}
	toString() {
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
		if (this.name instanceof QueryBuilder) {
			if (this._alias === undefined) {
				throw new Error("El campo subselect tiene que usar un alias AS");
			}
			return `( ${this.name.toString({ as: "subselect" })} ) AS ${this._alias}`;
		}
		if (this.name instanceof Expresion) {
			return `${this.name} AS ${this._alias}`;
		}
	}
	/**
	 * Establece el alias de la columna
	 * @param {string} alias - alias de la columna
	 * @returns {Column}
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
	 * @returns
	 */
	cast(value) {
		this._cast = value.toDataType(this.dataType);
		return this;
	}
	toUpperCase() {
		return this.toString().toUpperCase();
	}
	toLowerCase() {
		return this.toString().toLowerCase();
	}
}
export default Column;
