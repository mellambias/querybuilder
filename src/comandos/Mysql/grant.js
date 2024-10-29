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
GRANT
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON [object_type] priv_level
    TO user_or_role [, user_or_role] ...
    [WITH GRANT OPTION]
    [AS user
      [WITH ROLE
        DEFAULT
        | NONE
        | ALL
        | ALL EXCEPT role [, role ] ...
        | role [, role ] ...
      ]
    ]
}
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
	commands: (commands) => {
		if (typeof commands === "string") {
			if (/^(ALL PRIVILEGES|ALL)$/i.test(commands)) {
				return "ALL";
			}
			return `${grant.checkPrivilegio(commands)}`;
		}
		return `${commands.filter((name) => grant.checkPrivilegio(name)).join(", ")}`;
	},
	host: (host) => {
		grant._options.host = host;
		return undefined;
	},
	on: function (on) {
		if (/^(global)$/i.test(on)) {
			return "ON *.*";
		}
		const globalPrivilegesOnCommands = grant.checkGlobalPrivilegio(
			grant._values.commands,
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
	to: (to) =>
		Array.isArray(to)
			? `TO ${to
					.map(
						(user) =>
							`'${user}'${grant._options?.host ? `@'${grant._options.host}'` : ""}`,
					)
					.join(", ")}`
			: `TO '${to}'${grant._options.host ? `@'${grant._options.host}'` : ""}`,

	defaults: { host: "%" },
	orden: ["host", "commands", "on", "to"],
};

export const grantRoles = {
	roles: (roles) => (typeof roles === "string" ? roles : roles.join(", ")),
	users: (users) =>
		typeof users === "string" ? `TO ${users}` : `TO ${users.join(", ")}`,
	admin: (admin) => (admin ? "WITH ADMIN OPTION" : undefined),
	granted: (granted) => grant.grantBy(granted),
	orden: ["roles", "users", "admin", "granted"],
};
