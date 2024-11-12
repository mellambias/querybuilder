import QueryBuilder from "./querybuilder.js";

class Column {
	constructor(name, table, type) {
		this.name = name; // string  | QueryBuilder
		this._table = table;
		this._type = type;
		this._alias = undefined;
	}
	toString() {
		if (typeof this.name === "string") {
			const [table, name] = this.name.split(".");
			if (name !== undefined) {
				this.name = name;
				this._table = table;
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
	}
	as(alias) {
		this._alias = alias;
		return this;
	}
	type(value) {
		this._type = value;
		return this;
	}
	from(table) {
		this._table = table;
		return this;
	}
}
export default Column;
