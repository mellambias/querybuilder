/**
 * @fileoverview Comandos para la gestión de transacciones (SET TRANSACTION).
 * @module comandos/sql2006/transaction
 * @description Módulo que implementa el comando SET TRANSACTION del estándar SQL2006 (ISO/IEC 9075).
 * Permite establecer el nivel de aislamiento y el modo de acceso para las transacciones en una base de datos.
 * @version 2.0.0
 */
/**
 * @namespace setTransaction
 * @description Objeto que representa el comando SET TRANSACTION del estándar SQL2006.
 * Permite construir sentencias SQL para establecer el nivel de aislamiento y el modo de acceso para las transacciones en una base de datos.
 * @property {String} [access=READ ONLY|READ WRITE] - Modo de acceso de la transacción. Puede ser "READ ONLY" o "READ WRITE".
 * @property {String} [isolation=READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE] - Nivel de aislamiento de la transacción. Puede ser "READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ" o "SERIALIZABLE".
 * @property {Number} [diagnostic=0] - Tamaño del área de diagnóstico en bytes.
 */
export const setTransaction = {
	access: (access) =>
		/^(READ ONLY|READ WRITE)$/i.test(access) ? access.toUpperCase() : undefined,
	isolation: (isolation) =>
		/^(READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE)$/i.test(
			isolation,
		)
			? `ISOLATION LEVEL ${isolation.toUpperCase()}`
			: undefined,
	diagnostic: (diagnostic) => `DIAGNOSTICS SIZE ${diagnostic}`,
	orden: ["access", "isolation", "diagnostic"],
};
