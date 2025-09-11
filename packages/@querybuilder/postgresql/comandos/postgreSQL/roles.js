export const createRoles = {
	// secure: (secure) => (secure === true ? "IF NOT EXISTS" : undefined),
	names: (name) => {
		return name;
	},
	with: (value, self) => {
		const incluye = Object.keys(self._options).some((key) =>
			self.orden.includes(key),
		);
		return incluye ? "WITH" : undefined;
	},
	super: (value) => (value ? "SUPERUSER" : "NOSUPERUSER"),
	createDB: (value) => (value ? "CREATEDB" : "NOCREATEDB"),
	createRole: (value) => (value ? "CREATEROLE" : "NOCREATEROLE"),
	inherit: (value) => (value ? "INHERIT" : "NOINHERIT"),
	login: (value) => (value ? "LOGIN" : "NOLOGIN"),
	replication: (value) => (value ? "REPLICATION" : "NOREPLICATION"),
	bypass: (value) => (value ? "BYPASSRLS" : "NOBYPASSRLS"),
	limit: (connlimit) =>
		connlimit ? `CONNECTION LIMIT ${connlimit}` : undefined,
	password: (password) => (password ? `PASSWORD ${password}` : undefined),
	valid: (timestamp) => (timestamp ? `VALID UNTIL ${timestamp}` : undefined),
	inRole: (roleName) => (roleName ? `IN ROLE ${roleName}` : undefined),
	role: (roleName) => (roleName ? `ROLE ${roleName}` : undefined),
	admin: (roleName) => (roleName ? `ADMIN ${roleName}` : undefined),
	defaults: { with: "option" },
	orden: [
		"names",
		"with",
		"super",
		"createDB",
		"createRole",
		"inherit",
		"login",
		"replication",
		"bypass",
		"limit",
		"password",
		"valid",
		"inRole",
		"role",
	],
};
