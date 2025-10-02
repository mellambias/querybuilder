/*
Chroma QueryBuilder - Implementa operaciones vectoriales para AI/ML
Chroma es una base de datos vectorial especializada en embeddings y búsqueda por similitud
*/
import Core from "../core/core.js";

/**
 * Chroma QueryBuilder - Implementación para base de datos vectorial
 * @class Chroma  
 * @extends Core
 */
class Chroma extends Core {
	constructor() {
		super();
		this.dataType = "chroma";
		this.version = "1.8+";
		this.embeddingFunction = null;
		this.client = null;
	}

	// ================================
	// Connection & Client Management
	// ================================

	/**
	 * Inicializa cliente Chroma
	 * 
	 * @param {Object} options - Opciones de conexión
	 * @returns {Object} - Configuración del cliente
	 */
	createClient(options = {}) {
		const config = {
			path: options.path || "http://localhost:8000",
			auth: options.auth || null,
			tenant: options.tenant || "default_tenant",
			database: options.database || "default_database"
		};

		return {
			type: "ChromaClient",
			config: config,
			command: `new ChromaClient(${JSON.stringify(config)})`
		};
	}

	// ================================
	// Collection Management (DDL)
	// ================================

	/**
	 * Crea una colección vectorial
	 * 
	 * @param {string} name - Nombre de la colección
	 * @param {Object} options - Opciones de la colección
	 * @returns {Object} - Comando para crear colección
	 * 
	 * @example
	 * createCollection('documents', {
	 *   metadata: { description: 'Document embeddings' },
	 *   embeddingFunction: 'DefaultEmbeddingFunction'
	 * })
	 */
	createCollection(name, options = {}) {
		return {
			operation: "createCollection",
			name: name,
			metadata: options.metadata || {},
			embeddingFunction: options.embeddingFunction || null,
			command: `client.createCollection({
	name: "${name}",
	metadata: ${JSON.stringify(options.metadata || {})},
	${options.embeddingFunction ? `embeddingFunction: ${options.embeddingFunction}` : ''}
})`
		};
	}

	/**
	 * Obtiene una colección existente
	 * 
	 * @param {string} name - Nombre de la colección
	 * @param {Object} options - Opciones adicionales
	 * @returns {Object} - Comando para obtener colección
	 */
	getCollection(name, options = {}) {
		return {
			operation: "getCollection",
			name: name,
			embeddingFunction: options.embeddingFunction || null,
			command: `client.getCollection({
	name: "${name}",
	${options.embeddingFunction ? `embeddingFunction: ${options.embeddingFunction}` : ''}
})`
		};
	}

	/**
	 * Obtiene o crea una colección
	 * 
	 * @param {string} name - Nombre de la colección
	 * @param {Object} options - Opciones de la colección
	 * @returns {Object} - Comando para obtener o crear
	 */
	getOrCreateCollection(name, options = {}) {
		return {
			operation: "getOrCreateCollection",
			name: name,
			metadata: options.metadata || {},
			embeddingFunction: options.embeddingFunction || null,
			command: `client.getOrCreateCollection({
	name: "${name}",
	metadata: ${JSON.stringify(options.metadata || {})},
	${options.embeddingFunction ? `embeddingFunction: ${options.embeddingFunction}` : ''}
})`
		};
	}

	/**
	 * Elimina una colección
	 * 
	 * @param {string} name - Nombre de la colección
	 * @returns {Object} - Comando para eliminar colección
	 */
	deleteCollection(name) {
		return {
			operation: "deleteCollection",
			name: name,
			command: `client.deleteCollection({ name: "${name}" })`
		};
	}

	/**
	 * Lista todas las colecciones
	 * 
	 * @returns {Object} - Comando para listar colecciones
	 */
	listCollections() {
		return {
			operation: "listCollections",
			command: "client.listCollections()"
		};
	}

	// ================================
	// Data Operations (DML)
	// ================================

	/**
	 * Añade documentos con embeddings a la colección
	 * 
	 * @param {Object} data - Datos a añadir
	 * @returns {Object} - Comando para añadir datos
	 * 
	 * @example
	 * add({
	 *   ids: ['doc1', 'doc2'],
	 *   documents: ['Text 1', 'Text 2'],
	 *   metadatas: [{source: 'web'}, {source: 'book'}],
	 *   embeddings: [[0.1, 0.2], [0.3, 0.4]]
	 * })
	 */
	add(data) {
		const params = this._validateAndPrepareData(data);
		
		return {
			operation: "add",
			data: params,
			command: `collection.add({
	ids: ${JSON.stringify(params.ids)},
	${params.documents ? `documents: ${JSON.stringify(params.documents)},` : ''}
	${params.metadatas ? `metadatas: ${JSON.stringify(params.metadatas)},` : ''}
	${params.embeddings ? `embeddings: ${JSON.stringify(params.embeddings)},` : ''}
	${params.uris ? `uris: ${JSON.stringify(params.uris)}` : ''}
})`
		};
	}

	/**
	 * Actualiza documentos existentes (upsert)
	 * 
	 * @param {Object} data - Datos a actualizar
	 * @returns {Object} - Comando para actualizar datos
	 */
	upsert(data) {
		const params = this._validateAndPrepareData(data);
		
		return {
			operation: "upsert", 
			data: params,
			command: `collection.upsert({
	ids: ${JSON.stringify(params.ids)},
	${params.documents ? `documents: ${JSON.stringify(params.documents)},` : ''}
	${params.metadatas ? `metadatas: ${JSON.stringify(params.metadatas)},` : ''}
	${params.embeddings ? `embeddings: ${JSON.stringify(params.embeddings)},` : ''}
	${params.uris ? `uris: ${JSON.stringify(params.uris)}` : ''}
})`
		};
	}

	/**
	 * Actualiza documentos específicos
	 * 
	 * @param {Object} data - Datos a actualizar
	 * @returns {Object} - Comando para actualizar
	 */
	update(data) {
		const params = this._validateAndPrepareData(data);
		
		return {
			operation: "update",
			data: params,
			command: `collection.update({
	ids: ${JSON.stringify(params.ids)},
	${params.documents ? `documents: ${JSON.stringify(params.documents)},` : ''}
	${params.metadatas ? `metadatas: ${JSON.stringify(params.metadatas)},` : ''}
	${params.embeddings ? `embeddings: ${JSON.stringify(params.embeddings)}` : ''}
})`
		};
	}

	/**
	 * Elimina documentos de la colección
	 * 
	 * @param {Object} criteria - Criterios de eliminación
	 * @returns {Object} - Comando para eliminar
	 * 
	 * @example
	 * delete({ ids: ['doc1', 'doc2'] })
	 * delete({ where: { source: 'temp' } })
	 */
	delete(criteria) {
		return {
			operation: "delete",
			criteria: criteria,
			command: `collection.delete({
	${criteria.ids ? `ids: ${JSON.stringify(criteria.ids)},` : ''}
	${criteria.where ? `where: ${JSON.stringify(criteria.where)},` : ''}
	${criteria.whereDocument ? `whereDocument: ${JSON.stringify(criteria.whereDocument)}` : ''}
})`
		};
	}

	// ================================
	// Query Operations (DQL)
	// ================================

	/**
	 * Búsqueda por similitud vectorial
	 * 
	 * @param {Object} params - Parámetros de búsqueda
	 * @returns {Object} - Comando de búsqueda
	 * 
	 * @example
	 * query({
	 *   queryTexts: ['Find similar documents'],
	 *   nResults: 5,
	 *   where: { source: 'web' },
	 *   include: ['documents', 'metadatas', 'distances']
	 * })
	 */
	query(params) {
		return {
			operation: "query",
			params: params,
			command: `collection.query({
	${params.queryTexts ? `queryTexts: ${JSON.stringify(params.queryTexts)},` : ''}
	${params.queryEmbeddings ? `queryEmbeddings: ${JSON.stringify(params.queryEmbeddings)},` : ''}
	${params.nResults ? `nResults: ${params.nResults},` : ''}
	${params.where ? `where: ${JSON.stringify(params.where)},` : ''}
	${params.whereDocument ? `whereDocument: ${JSON.stringify(params.whereDocument)},` : ''}
	${params.include ? `include: ${JSON.stringify(params.include)}` : ''}
})`
		};
	}

	/**
	 * Obtiene documentos específicos
	 * 
	 * @param {Object} params - Parámetros de obtención
	 * @returns {Object} - Comando para obtener documentos
	 */
	get(params = {}) {
		return {
			operation: "get",
			params: params,
			command: `collection.get({
	${params.ids ? `ids: ${JSON.stringify(params.ids)},` : ''}
	${params.where ? `where: ${JSON.stringify(params.where)},` : ''}
	${params.whereDocument ? `whereDocument: ${JSON.stringify(params.whereDocument)},` : ''}
	${params.include ? `include: ${JSON.stringify(params.include)},` : ''}
	${params.limit ? `limit: ${params.limit},` : ''}
	${params.offset ? `offset: ${params.offset}` : ''}
})`
		};
	}

	/**
	 * Obtiene una muestra de documentos
	 * 
	 * @param {Object} params - Parámetros de muestra
	 * @returns {Object} - Comando para obtener muestra
	 */
	peek(params = {}) {
		return {
			operation: "peek",
			params: params,
			command: `collection.peek({
	${params.limit ? `limit: ${params.limit}` : ''}
})`
		};
	}

	/**
	 * Cuenta documentos en la colección
	 * 
	 * @returns {Object} - Comando para contar
	 */
	count() {
		return {
			operation: "count",
			command: "collection.count()"
		};
	}

	// ================================
	// Advanced Vector Operations
	// ================================

	/**
	 * Búsqueda híbrida (vectorial + texto)
	 * 
	 * @param {Object} params - Parámetros de búsqueda híbrida
	 * @returns {Object} - Comando de búsqueda híbrida
	 */
	hybridSearch(params) {
		return {
			operation: "hybridSearch",
			params: params,
			command: `collection.query({
	queryTexts: ${JSON.stringify(params.queryTexts || [])},
	queryEmbeddings: ${JSON.stringify(params.queryEmbeddings || [])},
	nResults: ${params.nResults || 10},
	where: ${JSON.stringify(params.where || {})},
	whereDocument: ${JSON.stringify(params.whereDocument || {})},
	include: ['documents', 'metadatas', 'distances', 'embeddings']
})`
		};
	}

	/**
	 * Búsqueda por proximidad de embeddings
	 * 
	 * @param {Array} embedding - Vector de embedding
	 * @param {Object} options - Opciones de búsqueda
	 * @returns {Object} - Comando de búsqueda por proximidad
	 */
	nearestNeighbors(embedding, options = {}) {
		return {
			operation: "nearestNeighbors",
			embedding: embedding,
			options: options,
			command: `collection.query({
	queryEmbeddings: [${JSON.stringify(embedding)}],
	nResults: ${options.nResults || 5},
	${options.where ? `where: ${JSON.stringify(options.where)},` : ''}
	include: ['documents', 'metadatas', 'distances']
})`
		};
	}

	/**
	 * Búsqueda semántica usando texto
	 * 
	 * @param {string} text - Texto de búsqueda
	 * @param {Object} options - Opciones de búsqueda
	 * @returns {Object} - Comando de búsqueda semántica
	 */
	semanticSearch(text, options = {}) {
		return {
			operation: "semanticSearch",
			text: text,
			options: options,
			command: `collection.query({
	queryTexts: ["${text}"],
	nResults: ${options.nResults || 10},
	${options.where ? `where: ${JSON.stringify(options.where)},` : ''}
	${options.whereDocument ? `whereDocument: ${JSON.stringify(options.whereDocument)},` : ''}
	include: ['documents', 'metadatas', 'distances']
})`
		};
	}

	// ================================
	// Metadata Operations
	// ================================

	/**
	 * Filtra por metadatos (equivalente a WHERE en SQL)
	 * 
	 * @param {Object} conditions - Condiciones de filtro
	 * @returns {Object} - Filtro de metadatos
	 */
	where(conditions) {
		return {
			operation: "where",
			conditions: conditions,
			filter: conditions
		};
	}

	/**
	 * Filtra por contenido de documentos
	 * 
	 * @param {Object} conditions - Condiciones de filtro de documentos
	 * @returns {Object} - Filtro de documentos
	 */
	whereDocument(conditions) {
		return {
			operation: "whereDocument", 
			conditions: conditions,
			filter: conditions
		};
	}

	// ================================
	// Embedding Functions
	// ================================

	/**
	 * Configura función de embedding por defecto
	 * 
	 * @returns {Object} - Configuración de embedding
	 */
	defaultEmbeddingFunction() {
		return {
			type: "DefaultEmbeddingFunction",
			command: "new DefaultEmbeddingFunction()"
		};
	}

	/**
	 * Configura función de embedding de OpenAI
	 * 
	 * @param {string} apiKey - Clave API de OpenAI
	 * @param {Object} options - Opciones adicionales
	 * @returns {Object} - Configuración de embedding OpenAI
	 */
	openAIEmbeddingFunction(apiKey, options = {}) {
		return {
			type: "OpenAIEmbeddingFunction",
			apiKey: apiKey,
			model: options.model || "text-embedding-ada-002",
			command: `new OpenAIEmbeddingFunction({
	openAIApiKey: "${apiKey}",
	model: "${options.model || "text-embedding-ada-002"}"
})`
		};
	}

	/**
	 * Configura función de embedding de Hugging Face
	 * 
	 * @param {Object} options - Opciones de Hugging Face
	 * @returns {Object} - Configuración de embedding Hugging Face
	 */
	huggingFaceEmbeddingFunction(options = {}) {
		return {
			type: "HuggingFaceEmbeddingFunction",
			model: options.model || "sentence-transformers/all-MiniLM-L6-v2",
			command: `new HuggingFaceEmbeddingFunction({
	model: "${options.model || "sentence-transformers/all-MiniLM-L6-v2"}"
})`
		};
	}

	// ================================
	// Collection Management
	// ================================

	/**
	 * Modifica metadatos de la colección
	 * 
	 * @param {Object} updates - Actualizaciones a aplicar
	 * @returns {Object} - Comando para modificar colección
	 */
	modifyCollection(updates) {
		return {
			operation: "modifyCollection",
			updates: updates,
			command: `collection.modify({
	${updates.name ? `name: "${updates.name}",` : ''}
	${updates.metadata ? `metadata: ${JSON.stringify(updates.metadata)}` : ''}
})`
		};
	}

	// ================================
	// Utility Functions
	// ================================

	/**
	 * Valida y prepara datos para operaciones
	 * 
	 * @private
	 * @param {Object} data - Datos a validar
	 * @returns {Object} - Datos preparados
	 */
	_validateAndPrepareData(data) {
		if (!data.ids || !Array.isArray(data.ids)) {
			throw new Error('IDs son requeridos y deben ser un array');
		}

		const result = {
			ids: data.ids
		};

		if (data.documents) {
			if (!Array.isArray(data.documents) || data.documents.length !== data.ids.length) {
				throw new Error('Documents debe ser un array del mismo tamaño que IDs');
			}
			result.documents = data.documents;
		}

		if (data.metadatas) {
			if (!Array.isArray(data.metadatas) || data.metadatas.length !== data.ids.length) {
				throw new Error('Metadatas debe ser un array del mismo tamaño que IDs');
			}
			result.metadatas = data.metadatas;
		}

		if (data.embeddings) {
			if (!Array.isArray(data.embeddings) || data.embeddings.length !== data.ids.length) {
				throw new Error('Embeddings debe ser un array del mismo tamaño que IDs');
			}
			result.embeddings = data.embeddings;
		}

		if (data.uris) {
			if (!Array.isArray(data.uris) || data.uris.length !== data.ids.length) {
				throw new Error('URIs debe ser un array del mismo tamaño que IDs');
			}
			result.uris = data.uris;
		}

		return result;
	}

	/**
	 * Genera condiciones de filtro complejas
	 * 
	 * @param {Object} conditions - Condiciones a convertir
	 * @returns {Object} - Condiciones Chroma
	 */
	buildWhereClause(conditions) {
		// Convierte condiciones simples a formato Chroma
		const chromaConditions = {};
		
		for (const [key, value] of Object.entries(conditions)) {
			if (typeof value === 'object' && value !== null) {
				// Operadores complejos: {field: {$eq: value}}
				chromaConditions[key] = value;
			} else {
				// Igualdad simple: {field: value} -> {field: {$eq: value}}
				chromaConditions[key] = { $eq: value };
			}
		}
		
		return chromaConditions;
	}

	/**
	 * Convierte operaciones SQL-like a Chroma equivalents
	 * 
	 * @param {string} operation - Operación SQL
	 * @param {Array} params - Parámetros de la operación
	 * @returns {Object} - Operación Chroma equivalente
	 */
	translateSQLOperation(operation, params) {
		const translations = {
			'SELECT': () => this.get(params[0]),
			'INSERT': () => this.add(params[0]),
			'UPDATE': () => this.update(params[0]),
			'DELETE': () => this.delete(params[0]),
			'WHERE': () => this.where(params[0]),
			'LIKE': () => this.whereDocument({ $contains: params[0] }),
			'COUNT': () => this.count(),
			'LIMIT': (options) => ({ ...options, limit: params[0] })
		};

		return translations[operation.toUpperCase()]?.() || 
			   { error: `Operación ${operation} no soportada en Chroma` };
	}

	// ================================
	// Batch Operations
	// ================================

	/**
	 * Operaciones en lote para mejor rendimiento
	 * 
	 * @param {Array} operations - Array de operaciones
	 * @returns {Object} - Comando de lote
	 */
	batch(operations) {
		return {
			operation: "batch",
			operations: operations,
			command: `// Ejecutar operaciones en lote:
${operations.map(op => op.command).join('\n')}`
		};
	}
}

export default Chroma;