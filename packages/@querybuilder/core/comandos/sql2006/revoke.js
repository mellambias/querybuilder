/**
 * @fileoverview Comandos para revocar permisos (REVOKE).
 * @module comandos/sql2006/revoke
 * @description Módulo que implementa el comando REVOKE del estándar SQL2006 (ISO/IEC 9075).
 * Permite revocar permisos y roles a usuarios o roles en una base de datos.
 * @version 2.0.0
 */
import { grant } from "./grant.js";

/**
 * @namespace revoke
 * @description Objeto que representa el comando REVOKE del estándar SQL2006.
 * @property {boolean} grantOption - Si es true, incluye "GRANT OPTION FOR"
 * @property {String|Array<String>} from=PUBLIC|ALL - Usuario o usuarios a los que se les revoca el permiso. Si es "PUBLIC" o "ALL", incluye "FROM PUBLIC"
 * @property {boolean} cascade - Si es true, incluye "CASCADE" (a menos que restrict también sea true)
 * @property {boolean} restrict - Si es true, incluye "RESTRICT" (a menos que cascade también sea true)
 */
export const revoke = {
	...grant,

	grantOption: (grantOption) =>
		grantOption === true ? "GRANT OPTION FOR" : undefined,
	from: (from) =>
		typeof from === "string"
			? /^(PUBLIC|ALL)$/i.test(from)
				? "FROM PUBLIC"
				: `FROM ${from}`
			: `FROM ${from.join(", ")}`,
	cascade: (value, self) =>
		value === true && self._options?.restrict === undefined
			? "CASCADE"
			: "RESTRICT",
	restrict: (value, self) =>
		value === true && self._options?.cascade === undefined
			? "RESTRICT"
			: "CASCADE",
	orden: [
		"grantOption",
		"commands",
		"on",
		"from",
		"withGrant",
		"grantBy",
		"cascade",
	],
	_options: {},
	defaults: { cascade: true },
};

/**
 * @namespace revokeRoles
 * @description Objeto que representa el comando REVOKE ROLE del estándar SQL2006.
 * Permite construir sentencias SQL para revocar roles a usuarios o roles en una base de datos.
 * @property {boolean} adminOption - Si es true, incluye "ADMIN OPTION FOR"
 * @property {String|Array<String>} roles - Los roles a otorgar.
 * @property {String|Array<String>} users - Los destinatarios de los roles.
 * @property {String|Array<String>} from=ANY|PUBLIC|ALL - Usuario o usuarios a los que se les revoca el rol. Si es "PUBLIC" o "ALL", incluye "FROM PUBLIC"
 * @property {String} grantBy - El usuario que otorga los roles.
 * @property {boolean} cascade=true - Si es true, incluye "CASCADE" (a menos que restrict también sea true)
 * @property {boolean} restrict - Si es true, incluye "RESTRICT" (a menos que cascade también sea true)
 */
export const revokeRoles = {
	adminOption: (adminOption) => (adminOption ? "ADMIN OPTION FOR" : undefined),
	roles: (roles) => (typeof roles === "string" ? roles : roles.join(", ")),
	from: (from, self) => revoke.from(from, self),
	grantBy: (grantBy, self) => grant.grantBy(grantBy, self),
	cascade: (cascade, self) => revoke.cascade(cascade, self),
	restrict: (restrict, self) => revoke.restrict(restrict, self),
	orden: ["adminOption", "roles", "from", "grantBy", "cascade", "restrict"],
	defaults: { cascade: true },
};
