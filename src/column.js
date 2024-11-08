class Column {
	constructor(name, table, type) {
		this.name = name;
		this._table = table;
		this._type = type;
		this._alias = undefined;
	}
	toString() {
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
