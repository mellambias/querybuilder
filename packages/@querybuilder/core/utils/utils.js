/**
 * @fileoverview Utilidades centrales para QueryBuilder
 * @description Funciones de utilidad, extensiones de String.prototype, validaciones de tipos,
 * formateo de fechas y funciones auxiliares para el funcionamiento del QueryBuilder.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * import { dataTypes, Types, check, formatDate, log } from './utils.js';
 * 
 * // Convertir tipo de datos
 * const postgresType = 'VARCHAR(255)'.toDataType('postgresql');
 * 
 * // Validar palabra reservada
 * const isReserved = 'SELECT'.isReserved(); // true
 * 
 * // Formatear fecha
 * const formatted = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
 */
import { dataTypes } from "../types/dataTypes.js";
import Types from "../types/Type.js";
import sqlReservedWords from "../types/reservedWords.js";
import { privilegios, objectTypes } from "../types/privilegios.js";
import QueryBuilder from "../querybuilder.js";

/**
 * Divide un comando SQL extrayendo la parte principal y los parámetros
 * @function splitCommand
 * @param {string} value - Comando SQL con posibles parámetros entre paréntesis
 * @returns {Array<string>} Array con [comando_principal, parámetros_completos]
 * @since 1.0.0
 * @example
 * const [command, params] = splitCommand('VARCHAR(255)');
 * // command: 'VARCHAR', params: 'VARCHAR(255)'
 */
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
 * Convierte un tipo de datos a su equivalente en el lenguaje especificado
 * @function String.prototype.toDataType
 * @param {string} target - Nombre del lenguaje objetivo ('mysql', 'postgresql', 'mongodb', etc.)
 * @returns {string|Error} Tipo de datos convertido o Error si no se encuentra
 * @since 1.0.0
 * @description Extensión de String que permite convertir tipos de datos SQL estándar
 * a sus equivalentes específicos de cada SGBD.
 * @example
 * const mysqlType = 'VARCHAR(255)'.toDataType('mysql');
 * const postgresType = 'INTEGER'.toDataType('postgresql'); 
 * const mongoType = 'STRING'.toDataType('mongodb');
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

	// Try exact key first, then lowercase key
	const exactKey = dataTypes[sqlKey] && dataTypes[sqlKey][target.toLowerCase()];
	const lowerKey = dataTypes[sqlKey.toLowerCase()] && dataTypes[sqlKey.toLowerCase()][target.toLowerCase()];

	if (exactKey !== undefined) {
		return this.toString().replace(command, exactKey);
	}
	if (lowerKey !== undefined) {
		return this.toString().replace(command, lowerKey);
	}
	return new Error(
		`El dataType '${command}' no se corresponde a ningun tipo declarado de ${target}`,
	);
};

/**
 * Verifica si una palabra es reservada en SQL
 * @function String.prototype.isReserved
 * @returns {boolean} true si la palabra es reservada, false en caso contrario
 * @since 1.0.0
 * @description Extensión de String que verifica si una cadena es una palabra reservada SQL.
 * La verificación es case-insensitive.
 * @example
 * const isReserved1 = 'SELECT'.isReserved(); // true
 * const isReserved2 = 'mycolumn'.isReserved(); // false
 * const isReserved3 = 'where'.isReserved(); // true
 */
String.prototype.isReserved = function () {
	const wordToSearch = this.toString().toUpperCase();
	return (
		sqlReservedWords.find((word) => word === wordToSearch) === wordToSearch
	);
};

/**
 * Convierte la primera letra a mayúscula y el resto a minúscula
 * @function String.prototype.toCapital
 * @returns {string} Cadena con formato Capital Case
 * @since 1.0.0
 * @description Extensión de String para formatear texto en Capital Case.
 * @example
 * const formatted1 = 'hello world'.toCapital(); // 'Hello world'
 * const formatted2 = 'JAVASCRIPT'.toCapital(); // 'Javascript'
 */
String.prototype.toCapital = function () {
	return `${this.toString().charAt(0).toUpperCase()}${this.toString().slice(1).toLowerCase()}`;
};
/**
 * Valida tipos de datos según un formato específico
 * @function check
 * @param {string} format - Formato de validación con sintaxis especial
 * @param {Array} values - Valores a validar
 * @returns {boolean} true si todos los valores cumplen el formato, false en caso contrario
 * @since 1.0.0
 * @description Función de validación que verifica que los valores proporcionados
 * cumplan con los tipos especificados en el formato.
 * @example
 * const isValid = check('(name:String, age:Number, items:Array)', ['John', 25, [1,2,3]]);
 * // Valida que el primer valor sea String, segundo Number, tercero Array
 */
function check(format, values) {
	const clasesPosibles = { QueryBuilder };
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

/**
 * Reemplazador JSON personalizado para serializar RegExp
 * @function jsonReplacer
 * @param {string} key - Clave del objeto
 * @param {*} value - Valor a serializar
 * @returns {*} Valor modificado para serialización JSON
 * @since 1.0.0
 * @description Función reemplazadora para JSON.stringify que maneja objetos RegExp
 * convirtiéndolos en objetos serializables.
 * @example
 * const obj = { pattern: /test/gi };
 * const json = JSON.stringify(obj, jsonReplacer);
 */
function jsonReplacer(key, value) {
	if (value instanceof RegExp) {
		return { __regex: true, pattern: value.source, flags: value.flags };
	}
	return value;
}

/**
 * Reviver JSON personalizado para deserializar RegExp
 * @function jsonReviver
 * @param {string} key - Clave del objeto
 * @param {*} value - Valor a deserializar
 * @returns {*} Valor restaurado desde JSON
 * @since 1.0.0
 * @description Función reviver para JSON.parse que restaura objetos RegExp
 * desde su representación serializable.
 * @example
 * const obj = JSON.parse(jsonString, jsonReviver);
 * // Los objetos RegExp son restaurados correctamente
 */
function jsonReviver(key, value) {
	if (value?.__regex) {
		return new RegExp(value.pattern, value.flags);
	}
	return value;
}

/**
 * Verifica si un valor es un objeto JavaScript puro
 * @function isJSObject
 * @param {*} target - Valor a verificar
 * @returns {boolean} true si es un objeto JavaScript puro, false en caso contrario
 * @since 1.0.0
 * @description Determina si un valor es un objeto JavaScript puro (no array, null, etc.)
 * @example
 * const isObj1 = isJSObject({}); // true
 * const isObj2 = isJSObject([]); // false
 * const isObj3 = isJSObject(null); // false
 */
function isJSObject(target) {
	if (typeof target !== "object") {
		return false;
	}
	return Object.prototype.toString(target) === "[object Object]";
}

/**
 * Controla si se muestran los logs de depuración
 * @type {boolean}
 */
const showLogs = false;

/**
 * Función de logging condicional para depuración
 * @function log
 * @param {string|Array<string>} command - Comando o array de comandos para el log
 * @param {string} [text=""] - Texto adicional del log
 * @param {...*} data - Datos adicionales para mostrar
 * @returns {void}
 * @since 1.0.0
 * @description Función de logging que se activa solo cuando showLogs es true.
 * Soporta múltiples comandos en array y formateo especial.
 * @example
 * log('SQL', 'Ejecutando query', { query: 'SELECT * FROM users' });
 * log(['DB', 'CONN'], 'Conectando a base de datos');
 */
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

/**
 * Formatea una fecha según un patrón específico
 * @function formatDate
 * @param {Date} date - Objeto Date a formatear
 * @param {string} format - Patrón de formato con tokens específicos
 * @returns {string} Fecha formateada según el patrón
 * @since 1.0.0
 * @description Formatea fechas usando tokens de reemplazo similares a moment.js.
 * Soporta tokens para año, mes, día, hora, minutos, segundos y zona horaria.
 * @example
 * const formatted1 = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
 * // '2025-10-02 14:30:15'
 * 
 * const formatted2 = formatDate(new Date(), 'DD/MM/YYYY hh:mm A');
 * // '02/10/2025 02:30 PM'
 * 
 * const formatted3 = formatDate(new Date(), 'dddd, MMMM D, YYYY');
 * // 'Wednesday, October 2, 2025'
 * 
 * @description Tokens soportados:
 * - YYYY: Año completo (2025)
 * - YY: Año de 2 dígitos (25)
 * - MMMM: Nombre completo del mes (October)
 * - MMM: Nombre corto del mes (Oct)
 * - MM: Mes con 2 dígitos (10)
 * - M: Mes sin ceros (10)
 * - DD: Día con 2 dígitos (02)
 * - D: Día sin ceros (2)
 * - dddd: Nombre completo del día (Wednesday)
 * - ddd: Nombre corto del día (Wed)
 * - HH: Hora 24h con 2 dígitos (14)
 * - H: Hora 24h sin ceros (14)
 * - hh: Hora 12h con 2 dígitos (02)
 * - h: Hora 12h sin ceros (2)
 * - mm: Minutos con 2 dígitos (30)
 * - m: Minutos sin ceros (30)
 * - ss: Segundos con 2 dígitos (15)
 * - s: Segundos sin ceros (15)
 * - A: AM/PM mayúscula
 * - a: am/pm minúscula
 * - Z: Zona horaria
 */
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
