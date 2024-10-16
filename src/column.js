class Column {
	constructor(name, table, type) {
		this.name = name;
		this.table = table;
		this.type = type;
	}
	toString() {
		if (typeof this.table !== "undefined") {
			return `${this.table}.${this.name}`;
		}
		return `${this.name}`;
	}
}
export default Column;
