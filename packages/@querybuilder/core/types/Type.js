/**
 * @fileoverview Sistema de tipos y validaciones para QueryBuilder
 * @description Define tipos de datos, validadores de identificadores SQL y configuraciones de charset.
 * Proporciona funcionalidades para validar identificadores SQL regulares y delimitados.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 * @example
 * import Types from './Type.js';
 * 
 * // Configurar validación de identificadores
 * Types.identificador.set('regular');
 * 
 * // Usar extensión de String
 * try {
 *   const validId = 'user_name'.validSqlId(); // 'user_name'
 *   const invalidId = 'SELECT'.validSqlId(); // Throws Error
 * } catch (error) {
 *   console.log(error.message);
 * }
 */

//import isReserved from "./reservedWords.js";

/**
 * Sistema de tipos y validaciones para QueryBuilder
 * @namespace Types
 * @description Objeto que contiene configuraciones de tipos, validadores de identificadores
 * y funciones de validación para diferentes aspectos del QueryBuilder.
 */
const Types = {
	/**
	 * Configuración de validadores de identificadores SQL
	 * @namespace Types.identificador
	 * @description Proporciona validadores para identificadores SQL regulares y delimitados
	 */
	identificador: {
		/**
		 * Establece el tipo de validación de identificadores activo
		 * @method set
		 * @param {string} type - Tipo de validación ('regular' o 'delimitado')
		 * @description Configura la extensión String.prototype.validSqlId según el tipo especificado
		 * @example
		 * Types.identificador.set('regular');
		 * // Ahora todos los strings tienen el método validSqlId para validación regular
		 */
		set: function (type) {
			String.prototype.validSqlId = this[type].isValid;
		},

		/**
		 * Validador para identificadores SQL regulares
		 * @namespace Types.identificador.regular
		 * @description Valida identificadores que siguen las reglas estándar SQL (alfanuméricos, guión bajo, no palabras reservadas)
		 */
		regular: {
			/**
			 * Valida si el string es un identificador SQL regular válido
			 * @method isValid
			 * @returns {string} El identificador si es válido
			 * @throws {Error} Si el identificador no es válido
			 * @description Verifica que el identificador contenga solo caracteres alfanuméricos y guiones bajos,
			 * y que no sea una palabra reservada SQL.
			 * @example
			 * const valid = Types.identificador.regular.isValid.call('user_name'); // 'user_name'
			 * const invalid = Types.identificador.regular.isValid.call('SELECT'); // Throws Error
			 */
			isValid: function () {
				if (
					/^[a-zA-Z0-9_]+$/.test(this.toString()) &&
					!this.toString().isReserved()
				) {
					return this;
				}
				throw new Error(`${this.toString()} no es un identificador valido`);
			},

			/**
			 * Genera mensaje de error específico para identificadores regulares
			 * @method error
			 * @param {string} name - Nombre del identificador inválido
			 * @returns {string} Mensaje de error descriptivo
			 * @description Proporciona mensajes de error específicos dependiendo del tipo de problema
			 * @example
			 * const errorMsg = Types.identificador.regular.error('SELECT');
			 * // 'el identificador SELECT no puede ser una palabra reservada.'
			 */
			error: (name) => {
				if (name.isReserved()) {
					return `el identificador ${name} no puede ser una palabra reservada.`;
				}
				return `el identificador ${name} debe cumplir con los criterios para identificadores regulares'`;
			},
		},

		/**
		 * Validador para identificadores SQL delimitados
		 * @namespace Types.identificador.delimitado
		 * @description Valida identificadores que están delimitados por comillas dobles
		 */
		delimitado: {
			/**
			 * Valida si el string es un identificador SQL delimitado válido
			 * @method isValid
			 * @returns {string} El identificador si es válido
			 * @throws {Error} Si el identificador no está correctamente delimitado
			 * @description Verifica que el identificador esté rodeado por comillas dobles
			 * @example
			 * const valid = Types.identificador.delimitado.isValid.call('"user name"'); // '"user name"'
			 * const invalid = Types.identificador.delimitado.isValid.call('user name'); // Throws Error
			 */
			isValid: function () {
				if (/^".*"$/.test(this.toString())) {
					return this;
				}
				throw new Error(`${this.toString()} no es un identificador valido`);
			},

			/**
			 * Genera mensaje de error para identificadores delimitados
			 * @method error
			 * @param {string} name - Nombre del identificador inválido
			 * @returns {string} Mensaje de error descriptivo
			 * @example
			 * const errorMsg = Types.identificador.delimitado.error('user name');
			 * // 'el identificador 'user name' debe estar entre comillas dobles'
			 */
			error: (name) =>
				`el identificador '${name}' debe estar entre comillas dobles`,
		},
	},

	/**
	 * Configuración de juegos de caracteres
	 * @namespace Types.charset
	 * @description Define mapeos de juegos de caracteres para diferentes bases de datos
	 */
	charset: {
		/**
		 * Charset latino predeterminado
		 * @type {string}
		 */
		latino: "latino1",
	},
};

/**
 * @description Exportación por defecto del sistema de tipos
 * @exports Types
 */
export default Types;
