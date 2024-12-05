import QueryBuilder from "../querybuilder.js";
class Command {
	constructor(command) {
		this._commands = command !== undefined ? [command] : [];
		this.from = undefined;
		this.where = undefined;
	}

	async execute(driver) {
		await driver.execute(this);
		const { response } = driver.response();
		return response;
	}
	set(value) {
		if (value !== undefined) {
			this._commands = [value];
		}
		return this;
	}
	get commands() {
		return this._commands;
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
				this.evalCommand(command);
				return JSON.stringify(command);
			})
			.join(";");
	}
	evalCommand(command) {
		for (const item in command) {
			if (typeof command[item] === "object") {
				if (Array.isArray(command[item])) {
					this.evalCommand(command[item]);
				} else if (command[item] instanceof QueryBuilder) {
					console.log("'%s es un objeto QueyBuilder", item);
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
