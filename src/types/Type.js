import isReserved from "./reservedWords.js";
const Types = {
	identificador: {
		set: function (type) {
			String.prototype.validSqlId = this[type].isValid;
		},
		regular: {
			isValid: function () {
				if (
					/^[a-zA-Z0-9_]+$/.test(this.toString()) &&
					!this.toString().isReserved()
				) {
					return this;
				}
				throw new Error(`${this.toString()} no es un identificador valido`);
			},
			error: (name) => {
				if (name.isReserved()) {
					return `el identificador ${name} no puede ser una palabra reservada.`;
				}
				return `el identificador ${name} debe cumplir con los criterios para identificadores regulares'`;
			},
		},
		delimitado: {
			isValid: function () {
				if (/^".*"$/.test(this.toString())) {
					return this;
				}
				throw new Error(`${this.toString()} no es un identificador valido`);
			},
			error: (name) =>
				`el identificador '${name}' debe estar entre comillas dobles`,
		},
	},
	charset: {
		latino: "latino1",
	},
};
export default Types;
