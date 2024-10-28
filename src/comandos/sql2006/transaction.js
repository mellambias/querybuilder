export const setTransaction = {
	access: (access) =>
		/^(READ ONLY|READ WRITE)$/i.test(access) ? access.toUpperCase() : undefined,
	isolation: (isolation) =>
		/^(READ UNCOMMITTED|READ COMMITTED|REPEATABLE READ|SERIALIZABLE)$/i.test(
			isolation,
		)
			? `ISOLATION LEVEL ${isolation.toUpperCase()}`
			: undefined,
	diagnostic: (diagnostic) => `DIAGNOSTICS SIZE ${diagnostic}`,
	orden: ["access", "isolation", diagnostic],
};
