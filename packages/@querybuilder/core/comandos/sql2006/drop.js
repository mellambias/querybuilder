/**
 * @fileoverview Comandos para eliminar objetos (DROP).
 * @module comandos/sql2006/drop
 * @description Módulo que implementa comandos DROP del estándar SQL2006 (ISO/IEC 9075).
 * Permite eliminar esquemas, tablas, tipos de datos, dominios y vistas en una base de datos.
 * @version 2.0.0
 */

/**
 * @name dropSchema
 * @description Objeto que representa el comando DROP SCHEMA del estándar SQL2006.
 * @property {String} name - Nombre del esquema a eliminar.
 * @property {String} [drop=CASCADE|RESTRICT] - La opción CASCADE o RESTRICT.
 */
export const dropSchema = {
	name: (name) => name,
	drop: (drop) =>
		/^(CASCADE|RESTRICT)$/i.test(drop)
			? `${query} ${drop.toUpperCase()}`
			: undefined,
	orden: ["name", "drop"],
};
/**
 * @name dropColumn
 * @description Objeto que representa el comando DROP COLUMN del estándar SQL2006.
 * @property {String} name - Nombre de la columna a eliminar.
 * @property {String} [option=CASCADE|RESTRICT] - La opción CASCADE o RESTRICT.
 */

export const dropColumn = {
	name: (name) => `COLUMN ${name}`,
	option: (option) =>
		/^(CASCADE|RESTRICT)$/i.test(option)
			? `${option.toUpperCase()}`
			: undefined,
	orden: ["name", "option"],
};

/**
 * @name dropTable
 * @description Objeto que representa el comando DROP TABLE del estándar SQL2006.
 * @property {String} name - Nombre de la tabla a eliminar.
 * @property {String} [option=CASCADE|RESTRICT] - La opción CASCADE o RESTRICT.
 */
export const dropTable = {
	name: (name) => `TABLE ${name}`,
	option: (option) =>
		/^(CASCADE|RESTRICT)$/i.test(option)
			? `${option.toUpperCase()}`
			: undefined,
	orden: ["name", "option"],
};

/**
 * @name dropType
 * @description Objeto que representa el comando DROP TYPE del estándar SQL2006.
 * @property {String} name - Nombre del tipo de dato a eliminar.
 */
export const dropType = {
	name: (name) => name,
	orden: ["name"],
};

/**
 * @name dropDomain
 * @description Objeto que representa el comando DROP DOMAIN del estándar SQL2006.
 * @property {String} name - Nombre del dominio a eliminar.
 * @property {String} [option=CASCADE|RESTRICT] - La opción CASCADE o RESTRICT.
 */

export const dropDomain = {
	name: (name) => `DOMAIN ${name}`,
	option: (option) =>
		/^(CASCADE|RESTRICT)$/i.test(option)
			? `${option.toUpperCase()}`
			: undefined,
	orden: ["name", "option"],
};
/**
 * @name dropView
 * @description Objeto que representa el comando DROP VIEW del estándar SQL2006.
 * @property {String} name - Nombre de la vista a eliminar.
 * @property {String} [option=CASCADE|RESTRICT] - La opción CASCADE o RESTRICT.
 */
export const dropView = {
	name: (name) => `DROP VIEW ${name}`,
	option: (option) =>
		/^(CASCADE|RESTRICT)$/i.test(option)
			? `${option.toUpperCase()}`
			: undefined,
	orden: ["name", "option"],
};