class Cursor {
	constructor(name, expresion, options, builder) {
		this.name = name;
		this.expresion = expresion;
		this.options = options;
		this.builder = builder;
		this.cursor = this.builder.language.createCursor(name, expresion, options);
		this.status = "declared";
		if (/^(SCROLL)$/i.test(this.options?.cursor)) {
			this.fetches();
		}
	}

	open() {
		this.status = "opened";
		this.builder.query.push(this.builder.language.openCursor(this.name));
		return this;
	}
	close() {
		this.status = "closed";
		const response = this.builder.language.closeCursor(this.name);
		if (this.builder.selectStack.length > 0) {
			this.builder.selectStack.push(response);
		} else {
			this.builder.query.push(response);
		}
		return this;
	}
	fetches() {
		const directions = ["NEXT", "PRIOR", "FIRST", "LAST"];
		const directionsWithValue = ["ABSOLUTE", "RELATIVE"];
		for (const comand of directions) {
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (hostVars) => {
				if (this.status === "opened") {
					this.cursor = this.builder.language[comandName](
						this.name,
						comand,
						hostVars,
					);
					this.builder.query.push(this.cursor);
					return this.cursor;
				}
				throw new Error("El cursor debe estar abierdo");
			};
		}
		for (const comand of directionsWithValue) {
			const comandName = `fetch${comand.toCapital()}`;
			this[comandName] = (filas, hostVars) => {
				if (this.status === "opened") {
					this.cursor = this.builder.language[comandName](
						this.name,
						comand,
						filas,
						hostVars,
					);
					this.builder.query.push(this.cursor);
					return this.cursor;
				}
				throw new Error("El cursor debe estar abierdo");
			};
		}
	}

	fetch(hostVars) {
		if (this.status === "opened") {
			this.cursor = this.builder.language.fetch(this.name, hostVars);
			this.builder.query.push(this.cursor);
			return this.cursor;
		}
		throw new Error("El cursor debe estar abierdo");
	}

	toString() {
		return `${this.cursor};`;
	}
	execute() {
		return this.builder.execute();
	}
}
export default Cursor;
