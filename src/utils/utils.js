import { dataTypes } from "../types/dataTypes.js";
import Types from "../types/Type.js";
import sqlReservedWords from "../types/reservedWords.js";
import { privilegios, objectTypes } from "../types/privilegios.js";

function splitCommand(value) {
	const match = value.match(/\(([^)]+)\)/);
	let length = "";
	if (match) {
		length = `${match}(${match[1]})`;
	}
	const commandToFind = value.replace(/\(([^)]+)\)/gi, "").trim();

	return [commandToFind, length];
}
String.prototype.toDataType = function (target) {
	const [command] = splitCommand(this.toString());
	const sqlKey = command.toUpperCase();
	if (/^(sql|sql2006)$/i.test(target)) {
		const keys = Object.keys(dataTypes);
		const exist = keys.find((key) => key === sqlKey);
		if (exist) {
			return this.toString().replace(command, exist);
		}
		return this.toString().replace(
			command,
			keys.find((key) => {
				return Object.values(dataTypes[key]).find((value) => {
					return new RegExp(`\\b^(${value})$\\b`, "i").test(command);
				});
			}),
		);
	}

	if (dataTypes[sqlKey]) {
		return this.toString().replace(
			command,
			dataTypes[sqlKey][target.toLowerCase()],
		);
	}
	return `El dataType '${command}' no se corresponde a ningun tipo declarado de ${target}`;
};

String.prototype.isReserved = function () {
	const wordToSearch = this.toString().toUpperCase();
	return (
		sqlReservedWords.find((word) => word === wordToSearch) === wordToSearch
	);
};

String.prototype.toCapital = function () {
	return `${this.toString().charAt(0).toUpperCase()}${this.toString().slice(1).toLowerCase()}`;
};

export { dataTypes, Types, privilegios, objectTypes, splitCommand };
