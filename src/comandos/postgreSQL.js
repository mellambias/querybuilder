import { createType, createTable } from "./postgreSQL/create.js";
import { dropType } from "./postgreSQL/drop.js";
import { column } from "./postgreSQL/column.js";

const postgreSQL = {
	createType,
	dropType,
	createTable,
	column,
};
export default postgreSQL;
