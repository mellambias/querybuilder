import { grant } from "./grant.js";
export const revoke = {
	...grant,
	secure: (value) => (value === true ? "IF EXISTS" : undefined),
	from: (from, self) => self.to(from, self).replace("TO", "FROM"),
	orden: ["host", "secure", "commands", "on", "from"],
};
