export const dropSchema = {
	name: (name) => name,
	drop: (drop) =>
		/^(CASCADE|RESTRICT)$/i.test(drop)
			? `${query} ${drop.toUpperCase()}`
			: undefined,
	orden: ["name", "drop"],
};
