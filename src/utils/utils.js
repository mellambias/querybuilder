import { dataTypes } from "../types/dataTypes.js";
import Types from "../types/Type.js";
import sqlReservedWords from "../types/reservedWords.js";
import { privilegios, objectTypes } from "../types/privilegios.js";
import QueryBuilder from "../querybuilder.js";
import Command from "../noSql/Command.js";

function splitCommand(value) {
	const match = value.match(/\(([^)]+)\)/);
	let length = "";
	if (match) {
		length = `${match}(${match[1]})`;
	}
	const commandToFind = value.replace(/\(([^)]+)\)/gi, "").trim();

	return [commandToFind, length];
}
/**
 * devuelve el tipo de dato correspondiente al lenguaje
 * @param {string} target - nombre del lenguaje
 * @returns
 */
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

	if (dataTypes[sqlKey][target.toLowerCase()] !== undefined) {
		return this.toString().replace(
			command,
			dataTypes[sqlKey][target.toLowerCase()],
		);
	}
	return new Error(
		`El dataType '${command}' no se corresponde a ningun tipo declarado de ${target}`,
	);
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
function check(format, values) {
	const clasesPosibles = { QueryBuilder, Command };
	const ini = format.indexOf("(") + 1;
	const fin = format.indexOf(")");
	const datas = format
		.slice(ini, fin)
		.split(",")
		.reduce((obj, item, index) => {
			const [clave, valor] = item.split(":");
			obj[clave.trim()] = {
				type: valor.trim(),
				value: values[index],
			};
			return obj;
		}, {});
	const errors = [format];
	for (const item of Object.keys(datas)) {
		const { value, type } = datas[item];
		const types = type.split("|");
		const exist = types.some((type) => {
			if (value === undefined) return false;
			if (/^(Array|array)$/i.test(type)) {
				return Array.isArray(value);
			}
			if (/^(String|string)$/i.test(type)) {
				// biome-ignore lint/suspicious/useValidTypeof: <explanation>
				return typeof value === String(type).toLowerCase();
			}
			if (/^(JSON|json)$/i.test(type)) {
				return Object.prototype.toString(value) === "[object Object]";
			}
			if (typeof value === "object") {
				if (Array.isArray(value)) {
					return false;
				}
				return value instanceof clasesPosibles[type];
			}
			return false;
		});
		if (!exist && value !== undefined) {
			errors.push(
				`❌  El tipo de dato para '${item}' no coincide con es esperado '${type}'`,
			);
		}
	}
	return errors.length > 1 ? errors.join("\n") : "";
}

function jsonReplacer(key, value) {
	if (value instanceof RegExp) {
		return { __regex: true, pattern: value.source, flags: value.flags };
	}
	return value;
}
function jsonReviver(key, value) {
	if (value?.__regex) {
		return new RegExp(value.pattern, value.flags);
	}
	return value;
}
function isJSObject(target) {
	if (typeof target !== "object") {
		return false;
	}
	return Object.prototype.toString(target) === "[object Object]";
}

function log(command, text, ...data) {
	return console.log(`[${command}] ${text}`, ...data);
}

export {
	dataTypes,
	Types,
	privilegios,
	objectTypes,
	splitCommand,
	check,
	jsonReplacer,
	jsonReviver,
	isJSObject,
	log,
};
