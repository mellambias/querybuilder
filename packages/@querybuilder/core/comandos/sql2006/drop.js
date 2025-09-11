export const dropSchema = {
	name: (name) => name,
	drop: (drop) =>
		/^(CASCADE|RESTRICT)$/i.test(drop)
			? `${query} ${drop.toUpperCase()}`
			: undefined,
	orden: ["name", "drop"],
};

export const dropColumn = {
	name: (name) => `COLUMN ${name}`,
	option: (option) =>
		/^(CASCADE|RESTRICT)$/i.test(option)
			? `${option.toUpperCase()}`
			: undefined,
	orden: ["name", "option"],
};

export const dropTable = {
	name: (name) => `TABLE ${name}`,
	option: (option) =>
		/^(CASCADE|RESTRICT)$/i.test(option)
			? `${option.toUpperCase()}`
			: undefined,
	orden: ["name", "option"],
};

export const dropType = {
	name: (name) => name,
	orden: ["name"],
};
