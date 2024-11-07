class Column {
	constructor(name, table, type) {
		this.name = name;
		this.table = table;
		this.type = type;
	}
	toString() {
		const [table, name] = this.name.split(".");
		if (name !== undefined) {
			this.name = name;
			this.table = table;
		}
		if (typeof this.table !== "undefined") {
			return `${this.table}.${this.name}`;
		}
		return `${this.name}`;
	}
}
export default Column;
