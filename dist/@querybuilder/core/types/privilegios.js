const privilegios = [
	"SELECT",
	"INSERT",
	"UPDATE",
	"DELETE",
	"REFERENCES",
	"TRIGGER",
	"ALTER",
	"CREATE VIEW",
	"CREATE",
	"DROP",
	"GRANT OPTION",
	"INDEX",
	"SHOW VIEW",
];

const objectTypes = [
	"TABLE",
	"DOMAIN",
	"COLLATION",
	"CHARACTER SET",
	"TRANSLATION",
	"TYPE",
	"SEQUENCE",
];

export { privilegios, objectTypes };
