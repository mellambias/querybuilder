/*
@description Implementa el SQL 2006
*/
import QueryBuilder from "./querybuilder.js";
import Column from "./column.js";
import { privilegios, objectTypes, splitCommand } from "./utils/utils.js";
class Core {
	constructor() {
		this.dataType = "sql2006";
		this.predicados();
		this.functionOneParam();
		this.functionDate();
		this.joins();
	}

	createDatabase(name, options) {
		let query = `CREATE DATABASE ${name}`;
		for (const option in options) {
			query += `\n ${option} ${option[option]}`;
		}
		return query;
	}
	dropDatabase(name, options) {
		const query = `DROP DATABASE ${name}`;
		return query;
	}

	use(database) {
		return `USE ${database}`;
	}
	createSchema(name, options) {
		let query = `CREATE SCHEMA ${name}`;
		if (options?.authorization) {
			query += ` AUTHORIZATION ${options.authorization}`;
		}
		if (options?.charset) {
			query += `\n DEFAULT CHARACTER SET ${options?.charset}`;
		}
		return query;
	}
	dropSchema(name, options) {
		const query = `DROP SCHEMA ${name}`;
		if (/^(CASCADE|RESTRICT)$/i.test(options?.drop)) {
			return `${query} ${options.drop.toUpperCase()}`;
		}
		return query;
	}

	/*
	CREATE [ {GLOBAL | LOCAL} TEMPORARY ] TABLE <nombre de la tabla>
( <elemento de la tabla> [ {, <elemento de la tabla> }... ] )
[ ON COMMIT { PRESERVE | DELETE } ROWS ]
 */
	createTable(name, options) {
		try {
			let sql = "CREATE";
			if (/^(GLOBAL|LOCAL)$/i.test(options?.temporary)) {
				sql += ` ${options.temporary.toUpperCase()} TEMPORARY`;
			}
			sql += ` TABLE ${name}`;
			if (options?.cols) {
				const columns = Object.keys(options.cols).map((key) => {
					return this.column(key, options.cols[key]);
				});

				if (options?.constraints) {
					columns.push(this.tableConstraints(options.constraints));
				}

				sql += `\n ( ${columns.join(",\n ")} )`;
			}
			if (
				options?.temporary &&
				/^(PRESERVE|DELETE)$/i.test(options?.onCommit)
			) {
				sql += `\n ON COMMIT ${options?.onCommit.toUpperCase()} ROWS`;
			}
			return sql;
		} catch (error) {
			throw new Error(error.message);
		}
	}
	column(name, options) {
		let command = "";
		if (typeof options === "string") {
			const dataType = options.toDataType(this.dataType);
			command = `${name.validSqlId()} ${dataType}`;
		}
		if (options?.type) {
			command = `${name.validSqlId()} ${options.type.toDataType(this.dataType)}`;
		}
		// Restricciones de tabla
		if (options?.values) {
			for (const value of options.values) {
				switch (value.toUpperCase()) {
					case "NOT NULL":
						command += " NOT NULL";
						break;
					case "UNIQUE":
						command += " UNIQUE";
						break;
					case "PRIMARY KEY":
						command += " PRIMARY KEY";
						break;
				}
			}
		}
		// valor por defecto
		if (options?.default !== undefined) {
			command += ` DEFAULT ${typeof options.default === "string" ? `'${options.default}'` : options.default}`;
		}
		if (options?.foreingKey) {
			const { table, column, match } = options.foreingKey;
			command += `\nREFERENCES ${table}`;
			if (column) {
				command += ` (${column})`;
			}
			if (/^(FULL|PARTIAL|SIMPLE)$/i.test(match)) {
				command += `\nMATCH ${match.toUpperCase()}`;
			}
		}
		if (options?.check) {
			command += ` CHECK ( ${options.check} )`;
		}
		return command;
	}

	tableConstraints(constraints) {
		function acction(value) {
			if (/^(CASCADE|SET NULL|SET DEFAULT|RESTRICT|NO ACTION)$/i.test(value)) {
				return value.toUpperCase();
			}
			return "";
		}
		const command = [];
		for (const constraint of constraints) {
			if (/^(NOT NULL|UNIQUE|PRIMARY KEY)$/i.test(constraint.type)) {
				command.push(
					`CONSTRAINT ${constraint.name} ${constraint.type.toUpperCase()} (${constraint.cols.join(", ")})`,
				);
			}
			if (/^(FOREIGN KEY)$/i.test(constraint.type) || constraint?.foreignKey) {
				const { table, cols, match, actions } = constraint.foreignKey;
				let foreignKey = `CONSTRAINT ${constraint.name} FOREIGN KEY (${constraint.cols.join(", ")}) REFERENCES ${table}`;
				if (cols) {
					foreignKey += ` (${cols})`;
				}

				if (/^(FULL|PARTIAL|SIMPLE)$/i.test(match)) {
					foreignKey += ` MATCH ${match.toUpperCase()}`;
				}
				if (actions?.onUpdate) {
					foreignKey += ` ON UPDATE ${acction(actions.onUpdate)}`;
				}
				if (actions?.onDelete) {
					foreignKey += ` ON DELETE ${acction(actions.onDelete)}`;
				}
				command.push(foreignKey);
			}
			if (constraint?.check) {
				command.push(
					`CONSTRAINT ${constraint.name} CHECK ( ${constraint.check} )`,
				);
			}
		}
		return command.join(",\n ");
	}
	alterTable(name, builder) {
		return `ALTER TABLE ${name}\n`;
	}
	addColumn(name, options) {
		return `ADD COLUMN ${this.column(name, options)}`;
	}
	alterColumn(name) {
		return `ALTER COLUMN ${name}`;
	}

	dropColumn(name, option) {
		let sql = `DROP COLUMN ${name}`;
		if (/^(CASCADE|RESTRICT)$/i.test(option)) {
			sql += ` ${option.toUpperCase()}`;
		}
		return sql;
	}
	setDefault(value) {
		return ` SET DEFAULT ${typeof value === "string" ? `'${value}'` : value}`;
	}

	dropDefault() {
		return " DROP DEFAULT";
	}

	addConstraint(name, option) {
		const constraint = [
			{
				name,
				check: option.check,
			},
		];
		return `ADD ${this.tableConstraints(constraint)}`;
	}

	dropTable(name, option) {
		let sql = `DROP TABLE ${name}`;
		if (/^(CASCADE|RESTRICT)$/i.test(option)) {
			sql += ` ${option.toUpperCase()}`;
		}
		return sql;
	}

	createType(name, options) {
		let sql = `CREATE TYPE ${name}`;
		if (options?.as) {
			sql += ` AS ${options.as}`;
		}
		if (options?.final !== undefined) {
			sql += options.final ? "\nFINAL" : "\nNOT FINAL";
		}
		return sql;
	}
	createAssertion(name, assertion) {
		return `CREATE ASSERTION ${name} CHECK ( ${assertion} )`;
	}
	createDomain(name, options) {
		let sql = `CREATE DOMAIN ${name} AS ${options.as}`;
		if (options?.default !== undefined) {
			sql += ` DEFAULT ${options.default}`;
		}
		if (options?.constraint) {
			sql += `\n CONSTRAINT ${options.constraint.name} CHECK ( ${options.constraint.check} )`;
		}
		return sql;
	}
	createView(name, options) {
		let sql = `CREATE VIEW ${name}`;
		if (options?.cols) {
			sql += `\n( ${options.cols.join(", ")} )`;
		}
		sql += ` AS\n${options.as}`;
		if (options?.check === true) {
			sql += " WITH CHECK OPTION";
		}
		return sql;
	}
	dropView(name) {
		return `DROP VIEW ${name}`;
	}
	// Seguridad

	createRole(name, options) {
		let sql = `CREATE ROLE ${name}`;
		if (/^(CURRENT_USER|CURRENT_ROLE)$/i.test(options?.admin)) {
			sql += ` WITH ADMIN ${options.admin}`;
		}
		return sql;
	}
	dropRoles(names) {
		const stack = [];
		if (typeof names === "string") {
			return `DROP ROLE ${names}`;
		}
		for (const name of names) {
			stack.push(this.dropRoles(name));
		}
		return stack.join(";\n");
	}
	checkPrivilegio(name) {
		const nameUppercase = name.toUpperCase();
		const [command, length] = splitCommand(nameUppercase);
		return privilegios.find((item) => item === command);
	}
	checkObjectType(name) {
		const nameUppercase = name.toUpperCase();
		return objectTypes.find((item) => item === nameUppercase);
	}

	privilegios(names) {
		let sql = "";
		if (typeof names === "string") {
			if (/^(ALL PRIVILEGES|ALL)$/i.test(names)) {
				sql += "ALL PRIVILEGES\n";
			}
		} else {
			sql += `${names.filter((name) => this.checkPrivilegio(name)).join(", ")}\n`;
		}
		return sql;
	}
	onObjects(on) {
		let sql = "";
		if (typeof on === "string") {
			sql += `ON TABLE ${on}`;
		} else {
			if (on?.objectType !== undefined) {
				sql += `ON ${this.checkObjectType(on.objectType)} ${on.name}`;
			} else if (on?.objectType === undefined) {
				sql += `ON TABLE ${on.name}`;
			} else {
				throw new Error("El objectType no es correcto");
			}
		}
		return sql;
	}
	grant(privilegios, on, to, options) {
		let sql = "GRANT ";
		sql += this.privilegios(privilegios);
		sql += this.onObjects(on);
		if (typeof to === "string") {
			if (/^(PUBLIC|ALL)$/i.test(to)) {
				sql += "\nTO PUBLIC ";
			}
		} else {
			sql += `\nTO ${to.join(", ")}`;
		}
		if (options?.withGrant === true) {
			sql += " WITH GRANT OPTION";
		}
		if (options?.grantBy !== undefined) {
			if (/^(CURRENT_USER|CURRENT_ROLE)$/i.test(options.grantBy)) {
				sql += `\nGRANTED BY ${options.grantBy.toUpperCase()}`;
			}
		}
		return sql;
	}
	revoke(privilegios, on, from, options) {
		let sql = "REVOKE ";
		if (options?.grantOption === true) {
			sql += "GRANT OPTION FOR ";
		}
		sql += this.privilegios(privilegios);
		sql += this.onObjects(on);
		if (typeof from === "string") {
			if (/^(PUBLIC|ALL)$/i.test(from)) {
				sql += "\nFROM PUBLIC";
			}
		} else {
			sql += `\nFROM ${from.join(", ")}`;
		}
		if (options?.with !== undefined) {
			sql += " WITH GRANT OPTION";
		}
		if (options?.grantBy !== undefined) {
			if (/^(CURRENT_USER|CURRENT_ROLE)$/i.test(options.grantBy)) {
				sql += `\nGRANTED BY ${options.grantBy.toUpperCase()}`;
			}
		}
		if (options?.restrict !== undefined) {
			sql += " RESTRICT";
		} else {
			sql += " CASCADE";
		}
		return sql;
	}
	grantRoles(roles, users, options) {
		let sql = "GRANT";
		if (typeof roles === "string") {
			sql += ` ${roles}`;
		} else {
			sql += ` ${roles.join(", ")}`;
		}
		if (typeof users === "string") {
			sql += ` TO ${users}`;
		} else {
			sql += ` TO ${users.join(", ")}`;
		}
		if (options?.admin === true) {
			sql += " WITH ADMIN OPTION";
		}
		if (/^(CURRENT_USER|CURRENT_ROLE)$/i.test(options?.granted)) {
			sql += `\nGRANTED BY ${options?.granted.toUpperCase()}`;
		}
		return sql;
	}
	revokeRoles(roles, from, options) {
		let sql = "";
		const sqlStack = [];
		if (typeof from === "string") {
			sql = "REVOKE ";
			if (options?.adminOption === true) {
				sql += "ADMIN OPTION FOR ";
			}
			if (typeof roles === "string") {
				sql += `${roles}`;
			} else {
				sql += `${roles.join(", ")}`;
			}

			if (/^(PUBLIC|ALL)$/i.test(from)) {
				sql += " FROM PUBLIC";
			} else {
				sql += ` FROM ${from}`;
			}
			if (options?.grantBy !== undefined) {
				if (/^(CURRENT_USER|CURRENT_ROLE)$/i.test(options.grantBy)) {
					sql += `\nGRANTED BY ${options.grantBy.toUpperCase()}`;
				}
			}
			if (options?.restrict !== undefined) {
				sql += " RESTRICT";
			} else {
				sql += " CASCADE";
			}
			return sql;
		}
		for (const userId of from) {
			sqlStack.push(`${this.revokeRoles(roles, userId, options)}`);
		}

		return sqlStack.join(";\n");
	}
	//Consulta de datos SQL
	// SELECT [ DISTINCT | ALL ] { * | < selección de lista > }
	select(columns, options) {
		let sql = "SELECT";
		const colStack = [];
		if (options?.unique === true) {
			sql += " DISTINCT";
		}
		if (options?.all === true) {
			sql += " ALL";
		}
		if (typeof columns === "string" || columns instanceof Column) {
			sql += ` ${columns}`;
			return sql;
		}
		for (const column of columns) {
			if (typeof column === "string") {
				colStack.push(`${column}`);
			}
			if (column instanceof Column) {
				colStack.push(`${column}`);
			}
			if (column?.col !== undefined) {
				if (column.as !== undefined) {
					colStack.push(`${column.col} AS ${column.as}`);
				} else {
					colStack.push(`${column.col}`);
				}
			}
		}
		return `${sql} ${colStack.join(", ")}`;
	}
	from(tables, alias) {
		if (typeof tables === "string") {
			return `FROM ${tables}`;
		}
		if (Array.isArray(tables) && Array.isArray(alias)) {
			return `FROM ${tables
				.map((table, index) => `${table} AS ${alias[index]}`)
				.join(", ")}`;
		}
		return `FROM ${tables.join(", ")}`;
	}
	joins() {
		const joinTypes = {
			crossJoin: "CROSS JOIN",
			naturalJoin: "NATURAL JOIN",
			colJoin: "JOIN",
			innerJoin: "INNER JOIN",
			join: "JOIN",
			leftJoin: "LEFT OUTER JOIN",
			rightJoin: "RIGTH OUTER JOIN",
			fullJoin: "FULL OUTER JOIN",
		};
		for (const join in joinTypes) {
			this[join] = (tables, alias, using) => {
				if (typeof tables === "string" && typeof alias === "string") {
					return `${joinTypes[join]} ${tables} ${alias}`;
				}
				if (Array.isArray(tables) && Array.isArray(alias)) {
					return `FROM ${tables
						.map((table, index) => `${table} ${alias[index]}`)
						.join(
							` ${joinTypes[join]} `,
						)}${Array.isArray(using) ? `\nUSING (${using.join(", ")})` : ""}`;
				}
				return `FROM ${tables.join(` ${joinTypes[join]} `)}`;
			};
		}
	}

	union(prev, next, option) {
		next.selectCommand = `${prev.toString().replace(";", "")}\nUNION${typeof option === "string" && /^(ALL)$/i.test(option) ? ` ${option.toUpperCase()}` : ""}\n`;
	}
	where(predicados) {
		const sql = "WHERE";
		if (typeof predicados === "string") {
			return `${sql} ${predicados}`;
		}

		return `${sql} ${predicados.join("\n")}`;
	}

	on(predicados) {
		const sql = "ON";
		if (typeof predicados === "string") {
			return `${sql} ${predicados}`;
		}

		return `${sql} ${predicados.join("\n")}`;
	}

	// Predicados
	predicados() {
		const operadores = {
			eq: "=",
			ne: "<>",
			gt: ">",
			gte: ">=",
			lt: "<",
			lte: "<=",
			isNull: "IS NULL",
			isNotNull: "IS NOT NULL",
		};
		for (const oper in operadores) {
			this[oper] = (a, b) => {
				if (b !== undefined) {
					return `${a} ${operadores[oper]} ${typeof b === "string" ? (/^(ANY|SOME|ALL)$/.test(b.match(/^\w+/)[0]) ? b : `'${b}'`) : b}`;
				}
				if (Array.isArray(a)) {
					return `${a.join(` ${operadores[oper]}\nAND `)} ${operadores[oper]}`;
				}
				return `${a} ${operadores[oper]}`;
			};
		}
		const logicos = {
			and: "AND",
			or: "OR",
			not: "NOT",
			between: "BETWEEN",
			like: "LIKE",
			notLike: "NOT LIKE",
		};
		for (const oper in logicos) {
			if (/^(AND|OR)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `\n${logicos[oper].toUpperCase()} ${predicados}`;
				};
			}
			if (/^(NOT)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) => {
					if (predicados.length > 1) {
						return `(${predicados.join(`\n${logicos[oper].toUpperCase()} `)})`;
					}
					return `${logicos[oper].toUpperCase()} (${predicados})`;
				};
			}
			if (/^(BETWEEN)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) =>
					`${logicos[oper].toUpperCase()} ${predicados[0]} AND ${predicados[1]}`;
			}
			if (/^(LIKE|NOT LIKE)$/i.test(logicos[oper])) {
				this[oper] = (...predicados) =>
					`${predicados[0]} ${logicos[oper].toUpperCase()} ('${predicados[1]}')`;
			}
		}
	}

	// logicos() {
	// 	const logicos = {
	// 		and: "and",
	// 	};
	// 	for (const oper in logicos) {
	// 		if (/^(AND|OR|NOT)$/i.test(oper)) {
	// 			this[oper] = (...predicados) => {
	// 				if (predicados.length > 1) {
	// 					return `(${predicados.join(`\n${oper.toUpperCase()} `)})`;
	// 				}
	// 				return `\n${oper.toUpperCase()} ${predicados}`;
	// 			};
	// 		}
	// 		if (/^(BETWEEN)$/i.test(oper)) {
	// 			this[oper] = (...predicados) =>
	// 				`${oper.toUpperCase()} ${predicados[0]} AND ${predicados[1]}`;
	// 		}
	// 		if (/^(LIKE|NOT LIKE)$/i.test(oper)) {
	// 			this[oper] = (...predicados) =>
	// 				`${predicados[0]} ${oper.toUpperCase()} ('${predicados[1]}')`;
	// 		}
	// 		throw new Error(`El operador '${oper}' no esta soportado`);
	// 	}
	// }

	getListValues(...values) {
		let arrayValues = [];
		if (Array.isArray(values[0])) {
			arrayValues = values[0].map((value) =>
				typeof value === "string"
					? `'${value}'`
					: value instanceof QueryBuilder
						? value.toString().replace(";", "")
						: value,
			);
		} else {
			arrayValues = values.map((value) =>
				typeof value === "string"
					? `'${value}'`
					: value instanceof QueryBuilder
						? value.toString().replace(";", "")
						: value,
			);
		}
		return arrayValues;
	}
	in(columna, ...values) {
		return `${columna} IN ( ${this.getListValues(...values).join(", ")} )`;
	}
	notIn(columna, ...values) {
		return `${columna} NOT IN ( ${this.getListValues(...values).join(", ")} )`;
	}
	exists(subSelect) {
		return `EXISTS ( ${this.getListValues(subSelect).join(", ")} )`;
	}
	notExists(subSelect) {
		return `NOT EXISTS ( ${this.getListValues(subSelect).join(", ")} )`;
	}

	any(subSelect) {
		return `ANY ( ${this.getListValues(subSelect).join(", ")} )`;
	}
	some(subSelect) {
		return `SOME ( ${this.getListValues(subSelect).join(", ")} )`;
	}
	all(subSelect) {
		return `ALL ( ${this.getListValues(subSelect).join(", ")} )`;
	}

	groupBy(columns, options) {
		const sql = "GROUP BY";
		if (typeof columns === "string") {
			return `${sql} ${columns}`;
		}
		if (typeof columns === "object") {
			if (columns?.rollup !== undefined) {
				return `${sql} ROLLUP (${columns.rollup.join(", ")})`;
			}
			if (columns?.cube !== undefined) {
				return `${sql} CUBE (${columns.cube.join(", ")})`;
			}
		}
		return `${sql} ${columns.join(", ")}`;
	}
	having(predicado, options) {
		return `HAVING ${predicado}`;
	}
	orderBy(columns) {
		const colStack = [];
		const sql = "ORDER BY";
		if (Array.isArray(columns)) {
			for (const column of columns) {
				colStack.push(this.orderBy(column).replace(sql, "").trim());
			}
			return `${sql} ${colStack.join(", ")}`;
		}
		if (typeof columns === "string") {
			return `${sql} ${columns}`;
		}
		if (typeof columns === "object") {
			if (columns?.col !== undefined) {
				if (/^(ASC|DESC)/i.test(columns?.order)) {
					return `${sql} ${columns.col} ${columns.order.toUpperCase()}`;
				}
				return `${sql} ${columns.col}`;
			}
			throw new Error(`Falta el atributo 'col'`);
		}
	}
	// Mofificacion de Datos
	insert(table, cols, values) {
		let sql = "INSERT INTO";
		if (table !== undefined) {
			sql = `${sql} ${table}`;
		} else {
			throw new Error("Tiene que definir una tabla");
		}
		if (Array.isArray(cols)) {
			if (cols.length > 0) {
				sql = `${sql}\n( ${cols.join(", ")} )`;
			}
		}
		if (Array.isArray(values)) {
			if (Array.isArray(values[0])) {
				return `${sql}\nVALUES\n${values
					.map(
						(value) =>
							`(${value
								.map((item) => {
									if (typeof item === "string") {
										return `'${item}'`;
									}
									return item;
								})
								.join(", ")})`,
					)
					.join(",\n")}`;
			}
			sql = `${sql}\nVALUES ( ${values
				.map((value) => {
					if (typeof value === "string") {
						return `'${value}'`;
					}
					return value;
				})
				.join(", ")} )`;
		}
		if (values instanceof QueryBuilder) {
			sql = `${sql}\n${values.toString().replace(";", "")}`;
		}
		if (typeof values === "string") {
			sql = `${sql}\n${values}`;
		}
		return sql;
	}
	update(table, sets) {
		const sql = `UPDATE ${table}`;
		const setStack = [];
		for (const col in sets) {
			if (typeof sets[col] === "string") {
				setStack.push(`${col} = '${sets[col]}'`);
			} else if (sets[col] instanceof QueryBuilder) {
				setStack.push(`${col} =\n( ${sets[col].toString().replace(";", "")} )`);
			} else {
				setStack.push(`${col} = ${sets[col]}`);
			}
		}
		return `${sql}\nSET ${setStack.join(",\n")}`;
	}
	delete(from) {
		return `DELETE FROM ${from}`;
	}

	// Funciones SET

	functionOneParam() {
		const names = ["count", "max", "min", "sum", "avg", "upper", "lower"];
		for (const name of names) {
			this[name] = (column, alias) =>
				`${name.toUpperCase()}(${column})${typeof alias !== "undefined" ? ` AS ${alias}` : ""}`;
		}
	}
	// funciones VALOR de cadena
	substr(column, inicio, ...options) {
		if (typeof options[0] === "string") {
			return `SUBSTRING(${column} FROM ${inicio})${typeof options[0] !== "undefined" ? ` AS ${options[0]}` : ""}`;
		}
		return `SUBSTRING(${column} FROM ${inicio}${typeof options[0] !== "undefined" ? ` FOR ${options[0]}` : ""})${typeof options[1] !== "undefined" ? ` AS ${options[1]}` : ""}`;
	}
	functionDate() {
		const names = {
			currentDate: "CURRENT_DATE",
			currentTime: "CURRENT_TIME",
			currentTimestamp: "CURRENT_TIMESTAMP",
			localTime: "LOCALTIME",
			localTimestamp: "LOCALTIMESTAMP",
		};
		for (const name in names) {
			this[name] = () => names[name];
		}
	}
}
export default Core;
