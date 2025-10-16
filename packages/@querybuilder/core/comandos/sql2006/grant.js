/**
 * @fileoverview Comandos para otorgar permisos (GRANT).
 * @module comandos/sql2006/grant
 * @description Módulo que implementa el comando GRANT del estándar SQL2006 (ISO/IEC 9075).
 * Permite otorgar permisos y roles a usuarios o roles en una base de datos.
 * @version 2.0.0
 * 
 */
import { privilegios, objectTypes, splitCommand } from "../../utils/utils.js";

/**
 * Comando para otorgar permisos (GRANT)
 * @namespace grant
 * @description Objeto que representa el comando GRANT del estándar SQL2006.
 * Permite construir sentencias SQL para otorgar permisos y roles a usuarios o roles en una base de datos.
 * @property {String|Array<String>} [commands=ALL PRIVILEGES|ALL] - Privilegios a otorgar.
 * @property {String|Object.<name:String, objectType:String>} on - Objeto/s sobre el/los que se otorgan los privilegios.
 * @property {String|Array<String>} [to=PUBLIC|ALL] - Los destinatarios de los privilegios.
 * @property {boolean} withGrant - opción WITH GRANT OPTION.
 * @property {String} [grantBy=CURRENT_USER|CURRENT_ROLE] - Usuario que otorga los permisos.
 */
export const grant = {
	checkPrivilegio: (name) => {
		const nameUppercase = name.toUpperCase();
		const [command, length] = splitCommand(nameUppercase);
		return privilegios.find((item) => item === command);
	},
	checkObjectType: (name) => {
		const nameUppercase = name.toUpperCase();
		return objectTypes.find((item) => item === nameUppercase);
	},
	commands: (commands, self) => {
		if (typeof commands === "string") {
			if (/^(ALL PRIVILEGES|ALL)$/i.test(commands)) {
				return "ALL PRIVILEGES";
			}
			return `${self.checkPrivilegio(commands)}`;
		}
		return `${commands.filter((name) => self.checkPrivilegio(name)).join(", ")}`;
	},
	on: (on, self) => {
		if (typeof on === "string") {
			return `ON TABLE ${on}`;
		}
		if (on?.objectType !== undefined) {
			return `ON ${self.checkObjectType(on.objectType)} ${on.name}`;
		}
		if (on?.objectType === undefined) {
			return `ON TABLE ${on.name}`;
		}
		throw new Error("El atributo 'objectType' no es correcto");
	},
	to: (to) =>
		typeof to === "string"
			? /^(PUBLIC|ALL)$/i.test(to)
				? "TO PUBLIC"
				: `TO ${to}`
			: `TO ${to.join(", ")}`,
	withGrant: (withGrant) =>
		withGrant === true ? "WITH GRANT OPTION" : undefined,
	grantBy: (grantBy) =>
		/^(CURRENT_USER|CURRENT_ROLE)$/i.test(grantBy)
			? `GRANTED BY ${grantBy.toUpperCase()}`
			: undefined,
	orden: ["commands", "on", "to", "withGrant", "grantBy"],
};

/** Comando para otorgar roles (GRANT ROLE)
 * @namespace grantRoles
 * @description Objeto que representa el comando GRANT ROLE del estándar SQL2006.
 * Permite construir sentencias SQL para otorgar roles a usuarios o roles en una base de datos.
 * Incluye funciones para especificar los roles a otorgar, los destinatarios,
 * opciones adicionales como WITH ADMIN OPTION y el usuario que otorga los roles.
 * Cada función devuelve una cadena con la parte correspondiente de la sentencia SQL.
 * Es utilizado por {@link getStatement} para construir sentencias SQL.
 * @property {String|Array<String>} roles - Los roles a otorgar.
 * @property {String|Array<String>} users - Los destinatarios de los roles.
 * @property {Boolean} admin - La opción WITH ADMIN OPTION.
 * @property {String} granted - El usuario que otorga los roles.
 */
export const grantRoles = {
	roles: (roles) => (typeof roles === "string" ? roles : roles.join(", ")),
	users: (users) =>
		typeof users === "string" ? `TO ${users}` : `TO ${users.join(", ")}`,
	admin: (admin) => (admin ? "WITH ADMIN OPTION" : undefined),
	granted: (granted) => grant.grantBy(granted),
	orden: ["roles", "users", "admin", "granted"],
};
