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

export const fechasVentas = {
	DISCO_COMPACTO: "VARCHAR(60)",
	FECHA_VENTA: "TIMESTAMP",
};

export const rastreoCd = {
	NOMBRE_CD: "VARCHAR(60)",
	CATEGORIA_CD: "CHAR(4)",
	EN_EXISTENCIA: "INT",
	EN_PEDIDO: "INT",
	VENDIDOS: "INT",
};

export const inventarioCD = {
	NOMBRE_CD: "VARCHAR(60)",
	ID_INTER: "INT",
	EN_EXISTENCIA: "INT",
};

export const interpretes = {
	ID_INTER: "INT",
	NOMBRE_INTER: "VARCHAR(60)",
	ID_TIPO: "INT",
};

export const tipoInterprete = {
	ID_TIPO: "INT",
	NOMBRE_TIPO: "CHAR(20)",
};

export const empleados = {
	ID_EMP: "INT",
	NOMBRE_EMP: "VARCHAR(60)",
	ADMIN: "INT",
};

export const TITULOS_EN_EXISTENCIA = {
	TITULO_CD: "VARCHAR(60)",
	TIPO_CD: "CHAR(20)",
	INVENTARIO: "INT",
};
export const COSTOS_TITULO = {
	TITULO_CD: "VARCHAR(60)",
	TIPO_CD: "CHAR(20)",
	MENUDEO: "NUMERIC(5,2)",
};

export const TITULO_CDS = {
	ID_TITULO: "INT",
	TITULO: "VARCHAR(60)",
};
export const ARTISTAS_TITULOS = {
	ID_TITULO: "INT",
	ID_ARTISTA: "INT",
};
export const ARTISTAS_CD = {
	ID_ARTISTA: "INT",
	ARTISTA: "VARCHAR(60)",
};

export const INFO_CD = {
	TITULO: "VARCHAR(60)",
	ID_TIPO: "CHAR(4)",
	EXISTENCIA: "INT",
};
export const TIPO_CD = {
	ID_TIPO: "CHAR(4)",
	NOMBRE_TIPO: "CHAR(20)",
};

export const CDS_CONTINUADOS = {
	NOMBRE_CD: "VARCHAR(60)",
	TIPO_CD: "CHAR(4)",
	EN_EXISTENCIA: "INT",
};
export const CDS_DESCONTINUADOS = {
	NOMBRE_CD: "VARCHAR(60)",
	TIPO_CD: "CHAR(4)",
	EN_EXISTENCIA: "INT",
};

export const EXISTENCIA_CD = {
	TITULO_CD: "VARCHAR(60)",
	EXISTENCIA: "INT",
};

export const ARTISTA = {
	TITULO: "VARCHAR(60)",
	ARTIST_NAME: "VARCHAR(60)",
};

export const PRECIOS_MENUDEO = {
	NOMBRE_CD: "VARCHAR(60)",
	P_MENUDEO: "NUMERIC(5, 2)",
	CANTIDAD: "INT",
};

export const PRECIOS_VENTA = {
	TITULO_CD: "VARCHAR(60)",
	P_VENTA: "NUMERIC(5,2)",
};

export const INVENTARIO_TITULOS = {
	ID_TITULO: "INT",
	TITULO: "VARCHAR(60)",
	EXISTENCIA: "INT",
};

export const TIPOS_TITULO = {
	TITULO_CD: "VARCHAR(60)",
	TIPO_CD: "CHAR(20)",
};
