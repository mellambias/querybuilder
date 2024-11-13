export function tableFormat(columns, rows, responses, query) {
	try {
		console.log(`${textCenter("SOLICITUD", 60, " +")}\n\n${query}`);
		console.log("");
		const queryList = query.split(";");
		if (responses.length) {
			console.log(`${textCenter("RESPUESTAS", 60, " -")}`);
			for (let i = 0; i < responses.length; i++) {
				console.log(
					"\nComando_%s:\n%s;\n\n%o",
					i + 1,
					queryList[i],
					responses[i],
				);
			}
		}

		if (!rows.length) {
			return;
		}
		console.log("");
		const header = [];
		const grid = [];
		let maxTable = 10;
		for (const field of columns) {
			header.push(field.name);
			maxTable += field.name.length;
		}
		let i = 0;
		for (const row of rows) {
			grid[i] = [];
			for (let j = 0; j < header.length; j++) {
				const valor = String(row[header[j].trim()]);
				if (header[j].length < valor.length) {
					maxTable -= header[j].length;
					header[j] = textCenter(header[j], valor.length, " ");
					maxTable += header[j].length;
					// recalcula anteriores
					for (let k = i - 1; k >= 0; k--) {
						grid[k][j] = justifica(grid[k][j], valor.length, " ");
					}
				}
				grid[i].push(justifica(valor, header[j].length, " "));
			}
			i++;
		}
		// imprime en consola
		console.log(`${textCenter("FILAS", maxTable, " *")}\n\n`);
		console.log(header.join(" | "));
		console.log(header.map((col) => "-".repeat(col.length)).join(" | "));
		for (const row of grid) {
			console.log(row.join(" | "));
		}
		console.log(header.map((col) => "-".repeat(col.length)).join(" | "));
		console.log(`registros/filas: ${i}\n`);
		console.log("\n");
	} catch (error) {
		console.log(`[tableFormat] ${error}`);
	}
}

function textCenter(text, width, fill) {
	const paddingTotal = width - text.length;
	const paddingStart = Math.floor(paddingTotal / 2);
	return text.padStart(text.length + paddingStart, fill).padEnd(width, fill);
}

function justifica(valor, width, fill) {
	if (Number.isNaN(valor.trim() * 1)) {
		return valor.padEnd(width, fill);
	}
	return valor.padStart(width, fill);
}

export function showResults(datos) {
	console.log("Comando:%o\n", datos?.error ? datos?.error : "OK");
	if (datos?.result) {
		const { response, columns, rows } = datos.result;
		tableFormat(columns, rows, response, datos.queryJoin());
	}
}
