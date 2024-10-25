import { privilegios, objectTypes, splitCommand } from "../../utils/utils.js";
export const Grant = {
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
		return `${commands.filter((name) => Grant.checkPrivilegio(name)).join(", ")}`;
	},
	on: (on) => {
		if (typeof on === "string") {
			return `ON TABLE ${on}`;
		}
		if (on?.objectType !== undefined) {
			return `ON ${Grant.checkObjectType(on.objectType)} ${on.name}`;
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
