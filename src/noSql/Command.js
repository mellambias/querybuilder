import QueryBuilder from "../querybuilder.js";
class Command {
	constructor(command) {
		this._commands = command !== undefined ? [command] : [];
		this.from = undefined;
		this.where = undefined;
	}

	async execute(driver) {
		try {
			await driver.execute(this);
			const response = driver.response();
			return response;
		} catch (error) {
			console.error("[Command][execute]", error);
		}
	}
	set(value) {
		if (value !== undefined) {
			this._commands = [value];
		}
		return this;
	}
	get commands() {
		return this._commands.map((command) => {
			this.evalCommand(command);
			return command;
		});
	}
	add(value) {
		if (value !== undefined) {
			this._commands.push(value);
		}
		return this;
	}

	toString() {
		return this._commands
			.map((command) => {
				// console.log("comando", command);
				this.evalCommand(command);
				if (command instanceof Command) {
					// console.log("es un comando", command);
				}
				// console.log("typeof", typeof command);
				return JSON.stringify(command);
			})
			.join(";");
	}
	toJson() {
		return this._commands.map((command) => {
			this.evalCommand(command);
			return command;
		});
	}
	evalCommand(command) {
		for (const item in command) {
			if (typeof command[item] === "object") {
				if (Array.isArray(command[item])) {
					this.evalCommand(command[item]);
				} else if (command[item] instanceof QueryBuilder) {
					const [subselect] = command[item].selectCommand.toJson();
					console.log("[Command][evalCommand]El subselect es %o", subselect);
					command[item] = `${item}`;
				} else {
					this.evalCommand(command[item]);
				}
			}
			if (typeof command[item] === "function") {
				command[item] = command[item](this);
			}
		}
		return command;
	}
}
export default Command;
