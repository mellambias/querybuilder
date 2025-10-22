import QueryBuilder from "./querybuilder.js";
import { log } from "./utils/utils.js";

/**
 * Clase para manejar cursores en consultas SQL.
 * Permite declarar, abrir, cerrar y realizar operaciones de fetch en cursores.
 * Soporta cursores con opciones como SCROLL.
 * Delega la generación de comandos SQL a un objeto de lenguaje pasado como builder.
 * Delega la ejecución de comandos SQL a una función pasada como builder.
 * @class Cursor
 * @param {cursorName} name - Nombre del cursor.
 * @param {Expresion} expresion - Expresión asociada al cursor.
 * @param {createCursorOptions} options - Opciones del cursor.
 * @param {QueryBuilder} builder - Instancia del QueryBuilder.
 * @param {next} next - Objeto next para encadenamiento.
 */
class Cursor {
	constructor(name, expresion, options, builder, next) {
		this.name = name;
		this.expresion = expresion;
		this.options = options;
		this.lang = builder.language;
		this.builderExecute = builder.execute;
		this.toNext = builder.toNext;
		this.cursor = [this.lang.createCursor(name, expresion, options, next)];
		this.status = "declared";
		if (/^(SCROLL)$/i.test(this.options?.cursor)) {
			this.fetches();
		}
	}

	/**
	 * Abre el cursor.
	 * @method open
	 * @memberof Cursor
	 * @returns {Cursor} - La instancia del cursor.
	 */
	open() {
		this.status = "opened";
		this.cursor.push(this.lang.openCursor(this.name));
		return this;
	}
	/**
	 * Cierra el cursor.
	 * @method close
	 * @memberof Cursor
	 * @param {next} next - Objeto next con la propiedad 'q' para agregar comandos adicionales.
	 * @returns {Cursor} - La instancia del cursor.
	 */
	close(next) {
		this.status = "closed";
		if (next?.q) {
			this.cursor = [next?.q.join("\n")];
		}
		const response = this.lang.closeCursor(this.name);
		this.cursor.push(response);
		return this;
	}
	/**
	 * Genera métodos de fetch para diferentes direcciones.
	 * Soporta NEXT, PRIOR, FIRST, LAST, ABSOLUTE y RELATIVE.
	 * @method fetches
	 * @memberof Cursor
	 * @private
	 */
	fetches() {
		const directions = ["NEXT", "PRIOR", "FIRST", "LAST"];
		const directionsWithValue = ["ABSOLUTE", "RELATIVE"];
		for (const comand of directions) {
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (hostVars) => {
				if (this.status === "opened") {
					const fetch = this.lang[comandName](this.name, comand, hostVars);
					this.cursor.push(fetch);
					return fetch;
				}
				throw new Error("El cursor debe estar abierdo");
			};
		}
		for (const comand of directionsWithValue) {
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (filas, hostVars) => {
				if (this.status === "opened") {
					const fetch = this.lang[comandName](
						this.name,
						comand,
						filas,
						hostVars,
					);
					this.cursor.push(fetch);
					return fetch;
				}
				throw new Error("El cursor debe estar abierto");
			};
		}
	}

	/**
	 * Realiza un fetch en el cursor.
	 * @method fetch
	 * @memberof Cursor
	 * @param {hostVars} hostVars - Variables de host para la consulta.
	 * @returns {string} - Comando SQL generado para el fetch.
	 */

	fetch(hostVars) {
		if (this.status === "opened") {
			const fetch = this.lang.fetch(this.name, hostVars);
			this.cursor.push(fetch);
			return fetch;
		}
		throw new Error("El cursor debe estar abierto");
	}
	/** 
	 * Agrega un comando al cursor.
	 * @method add
	 * @memberof Cursor
	 * @param {string|QueryBuilder} command - Comando SQL o instancia de QueryBuilder.
	 * @returns {Cursor} - La instancia del cursor.
	 */
	async add(command) {
		if (this.status === "opened") {
			if (command instanceof QueryBuilder) {
				this.cursor = [await command.toString()];
			} else {
				this.cursor.push(command);
			}
			return this;
		}
		throw new Error("El cursor debe estar abierto");
	}
	/**
	 * Convierte el cursor a una cadena de texto SQL.
	 * @method toString
	 * @memberof Cursor
	 * @returns {string} - Comando SQL completo del cursor.
	 */
	toString() {
		const toText = this.cursor.join(";\n").concat(";").replaceAll(";;", ";");
		log(
			["Cursor", "toString"],
			"Cursor\n %o \nto text\n %s",
			this.cursor,
			toText,
		);
		return toText;
	}
	/**
	 * Ejecuta el cursor utilizando la función de ejecución del builder.
	 * @method execute
	 * @memberof Cursor
	 * @returns {Promise} - Resultado de la ejecución del cursor.
	 */
	execute() {
		return this.builderExecute();
	}
}
export default Cursor;
