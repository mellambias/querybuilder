import { splitCommand } from "../../utils/utils.js";

export const sqlToMongo = {
	select: "find",
	insert: "insert",
	delete: "remove",
	update: "update",
};

/**
 * https://www.mongodb.com/docs/manual/reference/privilege-actions/
 * @param {Array|String} dataArray - Contiene las acciones
 * @returns {Array} - cada elemento corresponde al equivalente en MongoDB
 */
export function actions(dataArray) {
	if (Array.isArray(dataArray)) {
		return dataArray.map((item) => {
			const [command] = splitCommand(item);
			return sqlToMongo[command.toLowerCase()] || command.toLowerCase();
		});
	}
	return [sqlToMongo[dataArray.toLowerCase()] || dataArray.toLowerCase()];
}
