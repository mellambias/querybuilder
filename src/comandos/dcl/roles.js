export const createRole = {
	names: (names) => `ROLE ${Array.isArray(names) ? names.join(", ") : names}`,
	admin: (admin) =>
		/^(CURRENT_USER|CURRENT_ROLE)$/i.test(admin)
			? `WITH ADMIN ${admin}`
			: undefined,
	orden: ["names", "admin"],
};
export const dropRoles = {
	stack: [],
	names: function (names) {
		if (typeof names === "string") {
			return `DROP ROLE ${names}`;
		}
		if (Array.isArray(names)) {
			for (const name of names) {
				dropRoles.stack.push(this.dropRoles(name));
			}
			return dropRoles.stack.join(";\n");
		}
		throw new Error(
			"Error en la firma 'dropRoles(names:string | [strings], options?:{})'",
		);
	},
	orden: ["names"],
};
