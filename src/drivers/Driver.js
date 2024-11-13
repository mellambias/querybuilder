/*
clase base para los drivers/connectores a bases de datos
*/

class Driver {
	constructor(library, params) {
		this.library = library;
		this.host = params?.host;
		this.port = params?.port;
		this.username = params?.username;
		this.password = params?.password;
	}

	async connect() {
		console.log("conecta con la base de datos");
	}
	async use(database) {
		console.log("Cambia de base de datos");
		this.database = database;
	}
	async execute(query, options) {
		console.log("envia la consulta a la base de datos");
	}

	response() {
		console.log("devuelve la respuesta del servidor");
	}

	async close() {
		console.log("cierra la conexión");
	}
}

export default Driver;
