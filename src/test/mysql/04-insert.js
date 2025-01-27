import { test, suite, afterEach, beforeEach } from "node:test";
import QueryBuilder from "../../querybuilder.js";
import MySQL from "../../sql/MySQL.js";
import { config } from "../../../config.js";
import { checkRows } from "../utilsForTest/resultUtils.js";

//SEPUP
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);

const queryBuilder = new QueryBuilder(MySQL, {
	typeIdentificator: "regular",
	mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);
const current = { databaseTest, dataBase: "inventario" };
// crea funciones que al ser llamadas usa como 'this' el valor pasado a 'bind'
const rowsInTableExist = checkRows.bind(current);

suite("insertar registros en la base de datos", async () => {
	beforeEach(async () => {
		qb = qb.use("INVENTARIO");
	});
	afterEach(async () => {
		qb.dropQuery();
	});

	test("insertar registros en 'TIPOS_MUSICA'", async () => {
		const table = "TIPOS_MUSICA";
		const rows = [
			[11, "Blues"],
			[12, "Jazz"],
			[13, "Pop"],
			[14, "Rock"],
			[15, "Classical"],
			[16, "New Age"],
			[17, "Country"],
			[18, "Folk"],
			[19, "International"],
			[20, "Soundtracks"],
			[21, "Christmas"],
		];

		await qb.insert(table, rows).execute();
		await rowsInTableExist(table, rows);
	});
	//fin
	test("insertar registros en 'DISQUERAS_CD'", async () => {
		const table = "DISQUERAS_CD";
		const disqueras_cd = [
			[827, "Private Music"],
			[828, "Reprise Records"],
			[829, "Asylum Records"],
			[830, "Windham Hill Records"],
			[831, "Geffen"],
			[832, "MCA Records"],
			[833, "Decca Record Company"],
			[834, "CBS Records"],
			[835, "Capitol Records"],
			[836, "Sarabande Records"],
		];
		await qb.insert("DISQUERAS_CD", disqueras_cd).execute();
		await rowsInTableExist(table, disqueras_cd);
	});
	//fin
	test("insertar registros en 'DISCOS_COMPACTOS'", async () => {
		// Dependen de las discograficas 'DISQUERAS_CD'
		const discos_compactos = [
			[101, "Famous Blue Raincoat", 827, 13],
			[102, "Blue", 828, 42],
			[103, "Court and Spark", 829, 22],
			[104, "Past Light", 830, 17],
			[105, "Kojiki", 831, 6],
			[106, "That Christmas Feeling", 832, 8],
			[107, "Patsy Cline: 12 Greatest Hits", 832, 32],
			[108, "Carreras Domingo Pavarotti in Concert", 833, 27],
			[109, "After the Rain: The Soft Sounds of Erik Satie", 833, 21],
			[110, "Out of Africa", 832, 29],
			[111, "Leonard Cohen The Best Of", 834, 12],
			[112, "Fundamental", 835, 34],
			[113, "Bob Seger and the Silver Bullet Band Greatest Hits", 835, 16],
			[114, "Blues on the Bayou", 832, 27],
			[115, "Orlando", 836, 5],
		];
		await qb.insert("DISCOS_COMPACTOS", discos_compactos).execute();
		await rowsInTableExist("DISCOS_COMPACTOS", discos_compactos);
	});
	//fin
	test("insertar registros en 'TIPOS_DISCO_COMPACTO'", async () => {
		// Dependen de 'TIPOS_MUSICA' y de 'DISCOS_COMPACTOS'
		const table = "TIPOS_DISCO_COMPACTO";
		const rows = [
			[101, 18],
			[101, 13],
			[102, 11],
			[102, 18],
			[102, 13],
			[103, 18],
			[103, 13],
			[104, 16],
			[105, 16],
			[106, 21],
			[107, 13],
			[107, 17],
			[108, 13],
			[108, 15],
			[109, 15],
			[110, 20],
			[111, 13],
			[111, 18],
			[112, 11],
			[112, 13],
			[113, 13],
			[113, 14],
			[114, 11],
			[115, 20],
		];
		await qb.insert(table, rows).execute();
		await rowsInTableExist(table, rows);
	});
	//fin
	test("insertar registros en 'ARTISTAS'", async () => {
		const table = "ARTISTAS";
		const rows = [
			[2001, "Jennifer Warnes", "Seattle, Washington, Estados Unidos"],
			[2002, "Joni Mitchell", "Fort MacLeod, Alberta, Canadá"],
			[2003, "William Ackerman", "Alemania"],
			[2004, "Kitaro", "Toyohashi, Japón"],
			[2005, "Bing Crosby", "Tacoma, Washington, Estados Unidos"],
			[2006, "Patsy Cline", "Winchester, Virginia, Estados Unidos"],
			[2007, "Jose Carreras", "Barcelona, España"],
			[2008, "Luciano Pavarotti", "Modena, Italia"],
			[2009, "Placido Domingo", "Madrid, España"],
			[2010, "Pascal Roge", qb.exp(null)],
			[2011, "John Barry", qb.exp(null)],
			[2012, "Leonard Cohen", "Montreal, Quebec, Canadá"],
			[2013, "Bonnie Raitt", "Burbank, California, Estados Unidos"],
			[2014, "Bob Seger", "Dearborn, Michigan, Estados Unidos"],
			[2015, "Silver Bullet Band", "No aplica"],
			[2016, "B.B. King", "Indianola, Mississippi, Estados Unidos"],
			[2017, "David Motion", qb.exp(null)],
			[2018, "Sally Potter", qb.exp(null)],
		];
		await qb.insert(table, rows).execute();
		await rowsInTableExist(table, rows);
	});
	//fin
	test("insertar registros en 'CDS_ARTISTA'", async () => {
		// Depende de 'ARTISTAS' y 'DISCOS_COMPACTOS'
		const table = "CDS_ARTISTA";
		const rows = [
			[2001, 101],
			[2002, 102],
			[2002, 103],
			[2003, 104],
			[2004, 105],
			[2005, 106],
			[2006, 107],
			[2007, 108],
			[2008, 108],
			[2009, 108],
			[2010, 109],
			[2011, 110],
			[2012, 111],
			[2013, 112],
			[2014, 113],
			[2015, 113],
			[2016, 114],
			[2017, 115],
			[2018, 115],
		];
		await qb.insert(table, rows).execute();
		await rowsInTableExist(table, rows);
	});
	//fin
});
