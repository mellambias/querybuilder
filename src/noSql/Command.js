class Command {
	constructor(command) {
		this._commands = [command];
	}

	async execute(driver) {
		await driver.execute(this);
		const { response } = driver.response();
		return response;
	}
	set(value) {
		this._commands = [value];
		return this;
	}
	get commands() {
		return this._commands;
	}
	add(value) {
		this._commands.push(value);
		return this;
	}

	toString() {
		return this._commands.map((command) => JSON.stringify(command)).join(";");
	}
}
export default Command;
