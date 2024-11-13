export const setTransaction = {
	access: (access) =>
		/^(READ ONLY|READ WRITE)$/i.test(access) ? access.toUpperCase() : undefined,
	isolation: (isolation) =>
		/^(READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE)$/i.test(
			isolation,
		)
			? `ISOLATION LEVEL ${isolation.toUpperCase()}`
			: undefined,
	orden: ["access", "isolation"],
};
export const startTransaction = {
	access: (access) =>
		/^(READ ONLY|READ WRITE)$/i.test(access) ? access.toUpperCase() : undefined,
	snapshot: (value) => (value ? "WITH CONSISTENT SNAPSHOT" : undefined),
	orden: ["snapshot", "access"],
};
