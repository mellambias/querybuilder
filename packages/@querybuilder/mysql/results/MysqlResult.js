import Result from "../../core/results/Result.js";

class MysqlResult extends Result {
	constructor(query, response) {
		super(query);
		this.queryResult = response;
	}

	isResultSetHeader(data) {
		if (!data || typeof data !== "object") return false;
		const keys = [
			"fieldCount",
			"affectedRows",
			"info",
			"serverStatus",
			"warningStatus",
		];

		return keys.every((key) => key in data);
	}

	parseFields(fields) {
		let campos = [];
		if (Array.isArray(fields)) {
			campos = fields
				.filter((item) => item !== undefined)
				.reduce((prev, item) => {
					prev.push(item.name);
					return prev;
				}, []);
		}

		return campos;
	}

	set queryResult(value) {
		if (value === undefined) {
			return;
		}
		const [result, fields] = value;
		if (this.isResultSetHeader(result)) {
			const { grupo, info } = this.getGroup(this.query)[0];
			this.info = `${grupo}: ${info}`;
			this.affectedRows = result.affectedRows;
			this.serverStatus = result.serverStatus;
			this.warningStatus = result.warningStatus;
			this._queryResult = null;
		} else {
			const { grupo, info } = this.getGroup(this.query)[0];
			this.info = `${grupo}: ${info}`;
			this.rows = result;
			this.rowCount = this.rows.length;
			this.columns = this.parseFields(fields);
			this.fieldCount = this.columns.length;
		}
	}
}

export default MysqlResult;
