export const TIPOS_MUSICA = {
	ID_TIPO: "INT",
	NOMBRE_TIPO: { type: "VARCHAR(20)", values: ["not null"] },
};
export const ARTISTAS = {
	ID_ARTISTA: "INT",
	NOMBRE_ARTISTA: { type: "VARCHAR(60)", values: ["not null"] },
	LUGAR_DE_NACIMIENTO: {
		type: "VARCHAR(60)",
	},
};
export const DISQUERAS_CD = {
	ID_DISQUERA: "INT",
	NOMBRE_DISCOGRAFICA: {
		type: "VARCHAR(60)",
		default: "Independiente",
		values: ["not null"],
	},
};

export const TITULOS_CD = {
	ID_DISCO_COMPACTO: "INT",
	TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
	EN_EXISTENCIA: { type: "INT", values: ["NOT NULL"] },
};

export const DISCOS_COMPACTOS = {
	ID_DISCO_COMPACTO: "INT",
	TITULO_CD: { type: "varchar(60)", values: ["not null"] },
	ID_DISQUERA: {
		type: "INT",
		values: ["NOT NULL"],
	},
};

export const TIPOS_DISCO_COMPACTO = {
	ID_DISCO_COMPACTO: "INT",
	ID_TIPO_MUSICA: "INT",
};
export const CDS_ARTISTA = {
	ID_ARTISTA: "INT",
	ID_DISCO_COMPACTO: "INT",
};

export const INVENTARIO_CD = {
	NOMBRE_CD: { type: "varchar(60)", values: ["NOT NULL"] },
	TIPO_MUSICA: "VARCHAR(15)",
	EDITOR: {
		type: "varchar(50)",
		default: "Independiente",
		values: ["not null"],
	},
	EN_EXISTENCIA: { type: "int", values: ["not null"] },
};

export const cds_a_la_mano = {
	TITULO_CD: "varchar(60)",
	DERECHOSDEAUTOR: "INT",
	PRECIO_MENUDEO: "NUMERIC(5,2)",
	INVENTARIO: "INT",
};

export const menudeo_cd = {
	NOMBRE_CD: "VARCHAR(60)",
	MENUDEO: "NUMERIC(5,2)",
	EN_EXISTENCIA: "INT",
};
export const rebaja_cd = {
	TITULO: "VARCHAR(60)",
	VENTA: "NUMERIC(5,2)",
};

export const cdsVendidos = {
	NOMBRE_ARTISTA: "VARCHAR(60)",
	NOMBRE_CD: "VARCHAR(60)",
	VENDIDOS: "INT",
};
