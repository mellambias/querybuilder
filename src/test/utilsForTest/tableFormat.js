export function tableFormat(columns, rows, query) {
	try {
		if (columns.length === 0) {
			console.log(`${textCenter("RESULTADOS", 60, "* ")}\n${query}\n\n`);
			console.log("columns %o\nrows %o\n\n", columns, rows);
			return;
		}

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
						grid[k][j] = grid[k][j].padStart(valor.length, " ");
					}
				}
				grid[i].push(valor.padStart(header[j].length, " "));
			}
			i++;
		}
		// imprime en consola
		console.log(`${textCenter("RESULTADOS", maxTable, "* ")}\n${query}\n\n`);
		console.log(header.join(" | "));
		console.log(header.map((col) => "-".repeat(col.length)).join(" | "));
		for (const row of grid) {
			console.log(row.join(" | "));
		}
		console.log(header.map((col) => "-".repeat(col.length)).join(" | "));
		console.log("\n");
	} catch (error) {
		console.log(`[tableFormat] ${error}`);
	}
}

function textCenter(text, width, fill) {
	const paddingTotal = width - text.length;
	const paddingStart = Math.floor(paddingTotal / 2);
	const paddingEnd = paddingTotal - paddingStart;

	return text.padStart(text.length + paddingStart, fill).padEnd(width, fill);
}
