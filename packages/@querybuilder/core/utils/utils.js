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
				`❌  El tipo de dato para '${item}' no coincide con el esperado '${type}' (${value}})`,
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

const showLogs = false;
function log(command, text = "", ...data) {
	if (!showLogs) {
		return;
	}
	if (Array.isArray(command)) {
		const commandList = command.map((item) => `[${item}]`).join("");
		return console.log(`${commandList} ${text}`, ...data);
	}
	return console.log(`[${command}] ${text}`, ...data);
}

function formatDate(date, format) {
	//'padStart' agrega a la izquierda si tiene menos de dos dígitos.
	const components = {
		YYYY: date.getFullYear(), // Año completo (ej: 2025)
		YY: String(date.getFullYear()).slice(-2), // Últimos dos dígitos del año (ej: 25)
		MMMM: date.toLocaleString("default", { month: "long" }), // Nombre completo del mes (ej: December)
		MMM: date.toLocaleString("default", { month: "short" }), // Nombre corto del mes (ej: Dec)
		MM: String(date.getMonth() + 1).padStart(2, "0"), // Mes con 2 dígitos (ej: 12)
		M: String(date.getMonth() + 1), // Mes sin ceros iniciales (ej: 12)
		DD: String(date.getDate()).padStart(2, "0"), // Día con 2 dígitos (ej: 09)
		D: String(date.getDate()), // Día sin ceros iniciales (ej: 9)
		dddd: date.toLocaleString("default", { weekday: "long" }), // Nombre completo del día (ej: Sunday)
		ddd: date.toLocaleString("default", { weekday: "short" }), // Nombre corto del día (ej: Sun)
		HH: String(date.getHours()).padStart(2, "0"), // Hora en formato 24h con 2 dígitos (ej: 08)
		H: String(date.getHours()), // Hora en formato 24h sin ceros iniciales (ej: 8)
		hh: String(date.getHours() % 12 || 12).padStart(2, "0"), // Hora en formato 12h con 2 dígitos (ej: 08)
		h: String(date.getHours() % 12 || 12), // Hora en formato 12h sin ceros iniciales (ej: 8)
		mm: String(date.getMinutes()).padStart(2, "0"), // Minutos con 2 dígitos (ej: 05)
		m: String(date.getMinutes()), // Minutos sin ceros iniciales (ej: 5)
		ss: String(date.getSeconds()).padStart(2, "0"), // Segundos con 2 dígitos (ej: 09)
		s: String(date.getSeconds()), // Segundos sin ceros iniciales (ej: 9)
		A: date.getHours() < 12 ? "AM" : "PM", // AM o PM
		a: date.getHours() < 12 ? "am" : "pm", // am o pm
		Z: Intl.DateTimeFormat().resolvedOptions().timeZone, // Zona horaria (ej: America/New_York)
	};

	return format.replace(
		/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A|a|Z/g,
		(match) => components[match],
	);
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
	formatDate,
};
