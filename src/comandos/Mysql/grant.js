import { privilegios, objectTypes, splitCommand } from "../../utils/utils.js";

const globalPrivileges = [
	"CREATE TABLESPACE",
	"CREATE USER",
	"FILE, PROCESS",
	"RELOAD",
	"REPLICATION CLIENT",
	"REPLICATION SLAVE",
	"SHOW DATABASES",
	"SHUTDOWN",
	"SUPER",
];
/*
    En una sentencia sole se pueden otorgar privilegios o roles
    ON distingue entre unos y otros
      - Con ON se otorgan privilegios
      - Sin ON se otorgan roles
*/

// Otorga privilegios
export const grant = {
	checkPrivilegio: (name) => {
		const nameUppercase = name.toUpperCase();
		const [command, length] = splitCommand(nameUppercase);
		return [...privilegios, ...globalPrivileges].find(
			(item) => item === command,
		);
	},
	checkGlobalPrivilegio: (name) =>
		(Array.isArray(name) ? name : [name])
			.map((command) => command.toUpperCase())
			.filter((comand) => globalPrivileges.indexOf(comand) !== -1),
	checkObjectType: (name) => {
		const nameUppercase = name.toUpperCase();
		return objectTypes.find((item) => item === nameUppercase);
	},
	commands: (commands, self) => {
		if (typeof commands === "string") {
			if (/^(ALL PRIVILEGES|ALL)$/i.test(commands)) {
				return "ALL";
			}
			return `${self.checkPrivilegio(commands)}`;
		}
		return `${commands.filter((name) => self.checkPrivilegio(name)).join(", ")}`;
	},
	host: (host, self) => {
		self._options.host = host;
		return undefined;
	},
	on: function (on, self) {
		if (/^(global)$/i.test(on)) {
			return "ON *.*";
		}
		const globalPrivilegesOnCommands = self.checkGlobalPrivilegio(
			self._values.commands,
		);

		if (globalPrivilegesOnCommands.length) {
			throw new Error(
				`El privilegio '${globalPrivilegesOnCommands.join(", ")}' solo se puede otorgar de forma global`,
			);
		}

		if (/^(all)$/i.test(on)) {
			return `ON ${this.useDatabase}.*`;
		}
		if (typeof on === "string") {
			return `ON ${this.useDatabase ? `${this.useDatabase}.` : ""}${on}`;
		}
	},
	to: function (to, self) {
		return Array.isArray(to)
			? `TO ${to
					.map((user) => this.getAccount(user, self._options?.host))
					.join(", ")}`
			: `TO ${this.getAccount(to, self._options?.host)}`;
	},

	defaults: { host: "%" },
	orden: ["host", "commands", "on", "to"],
};

export const grantRoles = {
	host: (host, self) => {
		self._options.host = host;
		return undefined;
	},
	roles: (roles) => (typeof roles === "string" ? roles : roles.join(", ")),
	users: function (users, self) {
		return typeof users === "string"
			? `TO ${this.getAccount(users, self._options?.host)}`
			: `TO ${users.map((user) => this.getAccount(user, self._options?.host)).join(", ")}`;
	},
	admin: (admin) => (admin ? "WITH ADMIN OPTION" : undefined),
	defaults: { host: "%" },
	orden: ["host", "roles", "users", "admin", "granted"],
};
