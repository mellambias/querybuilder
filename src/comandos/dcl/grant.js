import { privilegios, objectTypes, splitCommand } from "../../utils/utils.js";
export const grant = {
	checkPrivilegio: (name) => {
		const nameUppercase = name.toUpperCase();
		const [command, length] = splitCommand(nameUppercase);
		return privilegios.find((item) => item === command);
	},
	checkObjectType: (name) => {
		const nameUppercase = name.toUpperCase();
		return objectTypes.find((item) => item === nameUppercase);
	},
	commands: (commands) => {
		if (typeof commands === "string") {
			if (/^(ALL PRIVILEGES|ALL)$/i.test(commands)) {
				return "ALL PRIVILEGES";
			}
			return "";
		}
		return `${commands.filter((name) => grant.checkPrivilegio(name)).join(", ")}`;
	},
	on: (on) => {
		if (typeof on === "string") {
			return `ON TABLE ${on}`;
		}
		if (on?.objectType !== undefined) {
			return `ON ${grant.checkObjectType(on.objectType)} ${on.name}`;
		}
		if (on?.objectType === undefined) {
			return `ON TABLE ${on.name}`;
		}
		throw new Error("El atributo 'objectType' no es correcto");
	},
	to: (to) =>
		typeof to === "string"
			? /^(PUBLIC|ALL)$/i.test(to)
				? "TO PUBLIC"
				: undefined
			: `TO ${to.join(", ")}`,
	withGrant: (withGrant) =>
		withGrant === true ? "WITH GRANT OPTION" : undefined,
	grantBy: (grantBy) =>
		/^(CURRENT_USER|CURRENT_ROLE)$/i.test(grantBy)
			? `GRANTED BY ${grantBy.toUpperCase()}`
			: undefined,
	orden: ["commands", "on", "to", "withGrant", "grantBy"],
};

export const grantRoles = {
	roles: (roles) => (typeof roles === "string" ? roles : roles.join(", ")),
	users: (users) =>
		typeof users === "string" ? `TO ${users}` : `TO ${users.join(", ")}`,
	admin: (admin) => (admin ? "WITH ADMIN OPTION" : undefined),
	granted: (granted) => grant.grantBy(granted),
	orden: ["roles", "users", "admin", "granted"],
};
