import QueryBuilder from "./querybuilder.js";
import { log } from "./utils/utils.js";
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

	open() {
		this.status = "opened";
		this.cursor.push(this.lang.openCursor(this.name));
		return this;
	}
	close(next) {
		this.status = "closed";
		if (next?.q) {
			this.cursor = [next?.q.join("\n")];
		}
		const response = this.lang.closeCursor(this.name);
		this.cursor.push(response);
		return this;
	}
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

	fetch(hostVars) {
		if (this.status === "opened") {
			const fetch = this.lang.fetch(this.name, hostVars);
			this.cursor.push(fetch);
			return fetch;
		}
		throw new Error("El cursor debe estar abierto");
	}

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
	execute() {
		return this.builderExecute();
	}
}
export default Cursor;
