/**
 * @fileoverview Comandos para gestionar roles (CREATE ROLE, DROP ROLE).
 * @module comandos/sql2006/roles
 * @description Módulo que implementa los comandos CREATE ROLE y DROP ROLE del estándar SQL2006 (ISO/IEC 9075).
 * Permite crear y eliminar roles en una base de datos.
 * @version 2.0.0
 */
/**
 * @namespace createRoles
 * @description Objeto que representa el comando CREATE ROLE del estándar SQL2006.
 * Permite construir sentencias SQL para crear roles en una base de datos.
 * @property {String|Array<String>} names - Los nombres de los roles a crear.
 * @property {String} [admin=CURRENT_USER|CURRENT_ROLE] - Opción WITH ADMIN CURRENT_USER o WITH ADMIN CURRENT_ROLE.
 */
export const createRoles = {
	names: (names) => `ROLE ${Array.isArray(names) ? names.join(", ") : names}`,
	admin: (admin) =>
		/^(CURRENT_USER|CURRENT_ROLE)$/i.test(admin)
			? `WITH ADMIN ${admin}`
			: undefined,
	orden: ["names", "admin"],
};
/**
 * @namespace dropRoles
 * @description Objeto que representa el comando DROP ROLE del estándar SQL2006.
 * Permite construir sentencias SQL para eliminar roles en una base de datos.
 * @property {String|Array<String>} names - Los nombres de los roles a eliminar.
 */
export const dropRoles = {
	stack: [],
	names: function (names, self) {
		if (typeof names === "string") {
			return `DROP ROLE ${names}`;
		}
		if (Array.isArray(names)) {
			for (const name of names) {
				self.stack.push(this.dropRoles(name));
			}
			return self.stack.join(";\n");
		}
		throw new Error(
			"Error en la firma 'dropRoles(names:string | [strings], options?:{})'",
		);
	},
	orden: ["names"],
};
