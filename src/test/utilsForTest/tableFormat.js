export function tableFormat(columns, rows) {
	const header = [];
	const grid = [];
	for (const field of columns) {
		header.push(field.name);
	}
	let i = 0;
	for (const row of rows) {
		grid[i] = [];
		for (let j = 0; j < header.length; j++) {
			const valor = String(row[header[j].trim()]);
			if (header[j].length < valor.length) {
				header[j] = textCenter(header[j], valor.length, " ");
				// recalcula anteriores
				for (let k = i - 1; k >= 0; k--) {
					grid[k][j] = grid[k][j].padStart(valor.length, " ");
				}
			}
			grid[i].push(valor.padStart(header[j].length, " "));
		}
		i++;
	}

	console.log(header.join(" | "));
	for (const row of grid) {
		console.log(row.join(" | "));
	}
}

function textCenter(text, width, fill) {
	const paddingTotal = width - text.length;
	const paddingStart = Math.floor(paddingTotal / 2);
	const paddingEnd = paddingTotal - paddingStart;

	return text.padStart(text.length + paddingStart, fill).padEnd(width, fill);
}
