/*
Comandos específicos de Chroma - Vector Database Operations
Operaciones optimizadas para embeddings y búsqueda por similitud
*/

const chromaCommands = {
	// ================================
	// Client & Connection Commands
	// ================================
	
	/**
	 * Inicialización del cliente Chroma
	 */
	client: {
		template: "new ChromaClient({path})",
		defaultOptions: {
			path: "http://localhost:8000",
			auth: null,
			tenant: "default_tenant", 
			database: "default_database"
		},
		process: (params) => {
			return `new ChromaClient({
	path: "${params.path || 'http://localhost:8000'}",
	${params.auth ? `auth: ${JSON.stringify(params.auth)},` : ''}
	tenant: "${params.tenant || 'default_tenant'}",
	database: "${params.database || 'default_database'}"
})`;
		}
	},

	/**
	 * Comandos de colección
	 */
	collection: {
		create: {
			template: "client.createCollection({name, metadata, embeddingFunction})",
			process: (params) => {
				return `client.createCollection({
	name: "${params.name}",
	${params.metadata ? `metadata: ${JSON.stringify(params.metadata)},` : ''}
	${params.embeddingFunction ? `embeddingFunction: ${params.embeddingFunction}` : ''}
})`;
			}
		},
		get: {
			template: "client.getCollection({name, embeddingFunction})",
			process: (params) => {
				return `client.getCollection({
	name: "${params.name}",
	${params.embeddingFunction ? `embeddingFunction: ${params.embeddingFunction}` : ''}
})`;
			}
		},
		getOrCreate: {
			template: "client.getOrCreateCollection({name, metadata, embeddingFunction})",
			process: (params) => {
				return `client.getOrCreateCollection({
	name: "${params.name}",
	${params.metadata ? `metadata: ${JSON.stringify(params.metadata)},` : ''}
	${params.embeddingFunction ? `embeddingFunction: ${params.embeddingFunction}` : ''}
})`;
			}
		},
		delete: {
			template: "client.deleteCollection({name})",
			process: (params) => {
				return `client.deleteCollection({ name: "${params.name}" })`;
			}
		},
		list: {
			template: "client.listCollections()",
			process: () => "client.listCollections()"
		}
	},

	// ================================
	// Data Operations (CRUD)
	// ================================

	/**
	 * Operaciones de datos
	 */
	data: {
		add: {
			template: "collection.add({ids, documents, metadatas, embeddings, uris})",
			process: (params) => {
				const parts = [`ids: ${JSON.stringify(params.ids)}`];
				
				if (params.documents) parts.push(`documents: ${JSON.stringify(params.documents)}`);
				if (params.metadatas) parts.push(`metadatas: ${JSON.stringify(params.metadatas)}`);
				if (params.embeddings) parts.push(`embeddings: ${JSON.stringify(params.embeddings)}`);
				if (params.uris) parts.push(`uris: ${JSON.stringify(params.uris)}`);
				
				return `collection.add({\n\t${parts.join(',\n\t')}\n})`;
			}
		},
		upsert: {
			template: "collection.upsert({ids, documents, metadatas, embeddings, uris})",
			process: (params) => {
				const parts = [`ids: ${JSON.stringify(params.ids)}`];
				
				if (params.documents) parts.push(`documents: ${JSON.stringify(params.documents)}`);
				if (params.metadatas) parts.push(`metadatas: ${JSON.stringify(params.metadatas)}`);
				if (params.embeddings) parts.push(`embeddings: ${JSON.stringify(params.embeddings)}`);
				if (params.uris) parts.push(`uris: ${JSON.stringify(params.uris)}`);
				
				return `collection.upsert({\n\t${parts.join(',\n\t')}\n})`;
			}
		},
		update: {
			template: "collection.update({ids, documents, metadatas, embeddings})",
			process: (params) => {
				const parts = [`ids: ${JSON.stringify(params.ids)}`];
				
				if (params.documents) parts.push(`documents: ${JSON.stringify(params.documents)}`);
				if (params.metadatas) parts.push(`metadatas: ${JSON.stringify(params.metadatas)}`);
				if (params.embeddings) parts.push(`embeddings: ${JSON.stringify(params.embeddings)}`);
				
				return `collection.update({\n\t${parts.join(',\n\t')}\n})`;
			}
		},
		delete: {
			template: "collection.delete({ids, where, whereDocument})",
			process: (params) => {
				const parts = [];
				
				if (params.ids) parts.push(`ids: ${JSON.stringify(params.ids)}`);
				if (params.where) parts.push(`where: ${JSON.stringify(params.where)}`);
				if (params.whereDocument) parts.push(`whereDocument: ${JSON.stringify(params.whereDocument)}`);
				
				return `collection.delete({\n\t${parts.join(',\n\t')}\n})`;
			}
		}
	},

	// ================================
	// Query Operations
	// ================================

	/**
	 * Operaciones de consulta y búsqueda
	 */
	query: {
		similarity: {
			template: "collection.query({queryTexts, queryEmbeddings, nResults, where, whereDocument, include})",
			process: (params) => {
				const parts = [];
				
				if (params.queryTexts) parts.push(`queryTexts: ${JSON.stringify(params.queryTexts)}`);
				if (params.queryEmbeddings) parts.push(`queryEmbeddings: ${JSON.stringify(params.queryEmbeddings)}`);
				if (params.nResults) parts.push(`nResults: ${params.nResults}`);
				if (params.where) parts.push(`where: ${JSON.stringify(params.where)}`);
				if (params.whereDocument) parts.push(`whereDocument: ${JSON.stringify(params.whereDocument)}`);
				if (params.include) parts.push(`include: ${JSON.stringify(params.include)}`);
				
				return `collection.query({\n\t${parts.join(',\n\t')}\n})`;
			}
		},
		get: {
			template: "collection.get({ids, where, whereDocument, include, limit, offset})",
			process: (params) => {
				const parts = [];
				
				if (params.ids) parts.push(`ids: ${JSON.stringify(params.ids)}`);
				if (params.where) parts.push(`where: ${JSON.stringify(params.where)}`);
				if (params.whereDocument) parts.push(`whereDocument: ${JSON.stringify(params.whereDocument)}`);
				if (params.include) parts.push(`include: ${JSON.stringify(params.include)}`);
				if (params.limit) parts.push(`limit: ${params.limit}`);
				if (params.offset) parts.push(`offset: ${params.offset}`);
				
				return parts.length > 0 ? 
					`collection.get({\n\t${parts.join(',\n\t')}\n})` : 
					'collection.get()';
			}
		},
		peek: {
			template: "collection.peek({limit})",
			process: (params) => {
				return params.limit ? 
					`collection.peek({ limit: ${params.limit} })` : 
					'collection.peek()';
			}
		},
		count: {
			template: "collection.count()",
			process: () => "collection.count()"
		}
	},

	// ================================
	// Embedding Functions
	// ================================

	/**
	 * Funciones de embedding
	 */
	embedding: {
		default: {
			template: "new DefaultEmbeddingFunction()",
			process: () => "new DefaultEmbeddingFunction()"
		},
		openai: {
			template: "new OpenAIEmbeddingFunction({openAIApiKey, model})",
			process: (params) => {
				return `new OpenAIEmbeddingFunction({
	openAIApiKey: "${params.apiKey}",
	model: "${params.model || 'text-embedding-ada-002'}"
})`;
			}
		},
		huggingface: {
			template: "new HuggingFaceEmbeddingFunction({model})",
			process: (params) => {
				return `new HuggingFaceEmbeddingFunction({
	model: "${params.model || 'sentence-transformers/all-MiniLM-L6-v2'}"
})`;
			}
		},
		cohere: {
			template: "new CohereEmbeddingFunction({apiKey, model})",
			process: (params) => {
				return `new CohereEmbeddingFunction({
	apiKey: "${params.apiKey}",
	model: "${params.model || 'embed-english-v2.0'}"
})`;
			}
		},
		google: {
			template: "new GoogleGenerativeAiEmbeddingFunction({googleApiKey, taskType})",
			process: (params) => {
				return `new GoogleGenerativeAiEmbeddingFunction({
	googleApiKey: "${params.apiKey}",
	taskType: "${params.taskType || 'RETRIEVAL_DOCUMENT'}"
})`;
			}
		}
	},

	// ================================
	// Advanced Operations
	// ================================

	/**
	 * Operaciones avanzadas y utilidades
	 */
	advanced: {
		hybridSearch: {
			template: "collection.query({queryTexts, queryEmbeddings, nResults, where, whereDocument, include})",
			process: (params) => {
				return `// Búsqueda híbrida (texto + vectores)
collection.query({
	queryTexts: ${JSON.stringify(params.queryTexts || [])},
	queryEmbeddings: ${JSON.stringify(params.queryEmbeddings || [])},
	nResults: ${params.nResults || 10},
	where: ${JSON.stringify(params.where || {})},
	whereDocument: ${JSON.stringify(params.whereDocument || {})},
	include: ['documents', 'metadatas', 'distances', 'embeddings']
})`;
			}
		},
		semanticSearch: {
			template: "collection.query({queryTexts, nResults, where, include})",
			process: (params) => {
				return `// Búsqueda semántica
collection.query({
	queryTexts: ["${params.text}"],
	nResults: ${params.nResults || 10},
	${params.where ? `where: ${JSON.stringify(params.where)},` : ''}
	${params.whereDocument ? `whereDocument: ${JSON.stringify(params.whereDocument)},` : ''}
	include: ['documents', 'metadatas', 'distances']
})`;
			}
		},
		nearestNeighbors: {
			template: "collection.query({queryEmbeddings, nResults, where, include})",
			process: (params) => {
				return `// Vecinos más cercanos
collection.query({
	queryEmbeddings: [${JSON.stringify(params.embedding)}],
	nResults: ${params.nResults || 5},
	${params.where ? `where: ${JSON.stringify(params.where)},` : ''}
	include: ['documents', 'metadatas', 'distances']
})`;
			}
		}
	},

	// ================================
	// Filter Operations
	// ================================

	/**
	 * Operaciones de filtrado
	 */
	filter: {
		where: {
			// Operadores de comparación
			eq: (field, value) => ({ [field]: { $eq: value } }),
			ne: (field, value) => ({ [field]: { $ne: value } }),
			gt: (field, value) => ({ [field]: { $gt: value } }),
			gte: (field, value) => ({ [field]: { $gte: value } }),
			lt: (field, value) => ({ [field]: { $lt: value } }),
			lte: (field, value) => ({ [field]: { $lte: value } }),
			
			// Operadores de conjunto
			in: (field, values) => ({ [field]: { $in: values } }),
			nin: (field, values) => ({ [field]: { $nin: values } }),
			
			// Operadores lógicos
			and: (...conditions) => ({ $and: conditions }),
			or: (...conditions) => ({ $or: conditions }),
			not: (condition) => ({ $not: condition })
		},
		whereDocument: {
			contains: (text) => ({ $contains: text }),
			notContains: (text) => ({ $not_contains: text })
		}
	},

	// ================================
	// Batch Operations
	// ================================

	/**
	 * Operaciones en lote
	 */
	batch: {
		template: "// Ejecutar múltiples operaciones",
		process: (operations) => {
			return operations.map((op, index) => 
				`// Operación ${index + 1}: ${op.operation}\n${op.command}`
			).join('\n\n');
		}
	},

	// ================================
	// Utilities
	// ================================

	/**
	 * Utilidades y helpers
	 */
	utils: {
		/**
		 * Valida formato de embedding
		 */
		validateEmbedding: (embedding) => {
			return Array.isArray(embedding) && embedding.every(v => typeof v === 'number');
		},

		/**
		 * Valida datos para operaciones
		 */
		validateData: (data) => {
			const errors = [];
			
			if (!data.ids || !Array.isArray(data.ids)) {
				errors.push('IDs son requeridos y deben ser un array');
			}
			
			if (data.documents && (!Array.isArray(data.documents) || data.documents.length !== data.ids.length)) {
				errors.push('Documents debe ser un array del mismo tamaño que IDs');
			}
			
			if (data.metadatas && (!Array.isArray(data.metadatas) || data.metadatas.length !== data.ids.length)) {
				errors.push('Metadatas debe ser un array del mismo tamaño que IDs');
			}
			
			if (data.embeddings && (!Array.isArray(data.embeddings) || data.embeddings.length !== data.ids.length)) {
				errors.push('Embeddings debe ser un array del mismo tamaño que IDs');
			}
			
			return { valid: errors.length === 0, errors };
		},

		/**
		 * Genera IDs únicos
		 */
		generateIds: (count, prefix = 'doc') => {
			return Array.from({ length: count }, (_, i) => `${prefix}_${Date.now()}_${i}`);
		},

		/**
		 * Convierte texto a formato de documento
		 */
		textToDocument: (texts) => {
			return texts.map((text, index) => ({
				id: `doc_${index}`,
				document: text,
				metadata: { source: 'text', index }
			}));
		},

		/**
		 * Formatea resultados de query
		 */
		formatQueryResults: (results) => {
			return {
				ids: results.ids,
				documents: results.documents,
				metadatas: results.metadatas,
				distances: results.distances,
				embeddings: results.embeddings,
				count: results.ids?.[0]?.length || 0
			};
		}
	},

	// ================================
	// Examples & Templates
	// ================================

	/**
	 * Ejemplos y plantillas comunes
	 */
	examples: {
		basicSetup: `
// Configuración básica de Chroma
import { ChromaClient } from 'chromadb';

const client = new ChromaClient({
	path: "http://localhost:8000"
});

const collection = await client.getOrCreateCollection({
	name: "my_documents",
	metadata: { description: "Colección de documentos" }
});`,

		addDocuments: `
// Añadir documentos con auto-embedding
await collection.add({
	ids: ['doc1', 'doc2', 'doc3'],
	documents: [
		'Este es el primer documento',
		'Este es el segundo documento',
		'Este es el tercer documento'
	],
	metadatas: [
		{ source: 'manual', category: 'test' },
		{ source: 'manual', category: 'test' },
		{ source: 'manual', category: 'test' }
	]
});`,

		semanticQuery: `
// Búsqueda semántica
const results = await collection.query({
	queryTexts: ['Buscar documentos similares'],
	nResults: 5,
	include: ['documents', 'metadatas', 'distances']
});`,

		vectorQuery: `
// Búsqueda con vectores predefinidos
const results = await collection.query({
	queryEmbeddings: [[0.1, 0.2, 0.3, ...]],
	nResults: 3,
	where: { category: 'important' },
	include: ['documents', 'metadatas', 'distances']
});`,

		filteredQuery: `
// Búsqueda con filtros complejos
const results = await collection.query({
	queryTexts: ['consulta de ejemplo'],
	nResults: 10,
	where: {
		$and: [
			{ source: { $eq: 'web' } },
			{ score: { $gte: 0.8 } }
		]
	},
	whereDocument: { $contains: 'importante' }
});`
	}
};

export default chromaCommands;