/*
Implementa las variaciones al SQL2006 propias de los NoSQL
*/
import Core from "../core.js";
class MongoDB extends Core {
	constructor(qbuilder) {
		super();
		this.dataType = "mongobd"; // especifica el tipo de datos usado
		this.qb = qbuilder;
	}
	createDatabase(name, options) {
		/**
		 * MongoDB crea la base de datos automáticamente cuando insertas el primer documento en una colección.
		 */
		return null;
	}
	use(database) {
		// devuelve null
		return null;
	}
	createTable(name, options) {
		/**
		 * https://www.mongodb.com/docs/manual/reference/command/create/#mongodb-dbcommand-dbcmd.create
		 */
		const fields = [
			"capped",
			"timeseries",
			"expireAfterSeconds",
			"clusteredIndex",
			"changeStreamPreAndPostImages",
			"autoIndexId",
			"size",
			"max",
			"storageEngine",
			"validator",
			"validationLevel",
			"validationAction",
			"indexOptionDefaults",
			"viewOn",
			"pipeline",
			"collation",
			"writeConcern",
			"encryptedFields",
			"comment",
		];
		const fieldOptions = this.checkOptions(options, fields);

		const tableDef = JSON.stringify({
			insert: "tableDef",
			documents: [
				{
					tableName: name,
					fields: Object.keys(options.cols),
					types: Object.values(options.cols),
				},
			],
		});
		const createTable = JSON.stringify({ create: name, ...fieldOptions });

		return `${createTable};${tableDef}`;
	}

	async dropTable(name, options) {
		const fields = ["writeConcern", "comment"];
		const fieldOptions = this.checkOptions(options, fields);
		if (options?.secure) {
			const response = await this.qb.driverDB.getTable(name);
			if (response.length) {
				return JSON.stringify({ drop: name, ...fieldOptions });
			}
			return null;
		}
		return JSON.stringify({ drop: name, ...fieldOptions });
	}

	checkOptions(options, fields) {
		return Object.keys(options)
			.filter((key) => fields.includes(key))
			.reduce((acc, key) => {
				acc[key] = options[key];
				return acc;
			}, {});
	}
}
export default MongoDB;
