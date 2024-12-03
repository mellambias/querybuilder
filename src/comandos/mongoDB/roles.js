/**
 * Comandos relacionados con los roles
 * para la base de datos MongoDB
 */
import { splitCommand } from "../../utils/utils.js";

function resource(database, table) {
	return {
		db: database,
		collection: table,
	};
} /**
 * https://www.mongodb.com/docs/manual/reference/privilege-actions/
 * @param {Array|String} dataArray - Contiene las acciones
 * @returns {Array} - cada elemento corresponde al equivalente en MongoDB
 */
function actions(dataArray) {
	const sqlToMongo = {
		select: "find",
		insert: "insert",
		delete: "remove",
		update: "update",
	};
	if (Array.isArray(dataArray)) {
		return dataArray.map((item) => {
			const [command] = splitCommand(item);
			return sqlToMongo[command.toLowerCase()] || command.toLowerCase();
		});
	}
	return [sqlToMongo[dataArray.toLowerCase()] || dataArray.toLowerCase()];
}

export const createRoles = {
	name: (name) => ({
		createRole: name,
	}),
	privileges: function (dataArray) {
		const database = this.qb.driverDB.database;
		return {
			privileges: dataArray.map((privilege) => ({
				resource: resource(database, privilege?.on ? privilege.on : ""),
				actions: actions(privilege.actions),
			})),
		};
	},
	roles: (dataArray) => ({ roles: dataArray }),
	grantedIPs: (dataArray) => ({ authenticationRestrictions: dataArray }),
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (dataArray) => ({ comment: dataArray }),
	defaults: { privileges: [], roles: [] },
	orden: [
		"name",
		"privileges",
		"roles",
		"grantedIPs",
		"writeConcern",
		"comment",
	],
};
export const dropRoles = {
	name: (name) => ({ dropRole: name }),
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (any) => ({ comment: any }),
	orden: ["name", "writeConcern", "comment"],
};
//commands,on,to,options,
export const grant = {
	on: (table, self) => {
		self._table = table;
	},
	commands: function (dataArray, self) {
		const database = this.qb.driverDB.database;
		return {
			privileges: [
				{
					resource: resource(database, self._table),
					actions: actions(dataArray),
				},
			],
		};
	},
	to: (roleName) => ({ grantPrivilegesToRole: roleName }),
	writeConcern: (document) => ({ writeConcern: document }),
	comment: (any) => ({ comment: any }),
	orden: ["to", "on", "commands", "writeConcern", "comment"],
};
