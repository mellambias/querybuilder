# Chroma Vector Database Integration

Integración completa de Chroma vector database con QueryBuilder, proporcionando operaciones de embeddings, búsqueda semántica y análisis de similitud vectorial.

## 🔥 Características Principales

- **Búsqueda Semántica Avanzada**: Encuentra documentos similares usando procesamiento de lenguaje natural
- **Embeddings Automáticos**: Generación automática de vectores usando múltiples modelos
- **Filtrado Inteligente**: Combina búsqueda vectorial con filtros tradicionales
- **Múltiples Modelos**: Soporte para OpenAI, HuggingFace, Cohere, Google y más
- **API Consistente**: Mantiene la misma metodología que otros drivers de QueryBuilder
- **Operaciones en Lote**: Procesamiento eficiente de grandes volúmenes de datos
- **TypeScript Ready**: Tipado completo para mejor experiencia de desarrollo

## 📦 Instalación

```bash
# Instalar el paquete
npm install @querybuilder/chroma

# O con pnpm
pnpm add @querybuilder/chroma

# También necesitas el cliente oficial de Chroma
npm install chromadb
```

## 🚀 Configuración Inicial

### Servidor Chroma Local

```bash
# Usando Docker (recomendado)
docker run -p 8000:8000 chromadb/chroma

# O instalación local
pip install chromadb
chroma run --host localhost --port 8000
```

### Cliente Básico

```javascript
import Chroma from '@querybuilder/chroma';

const chroma = new Chroma({
	path: 'http://localhost:8000',
	tenant: 'default_tenant',
	database: 'default_database'
});
```

## 🎯 Casos de Uso

### 1. Búsqueda Semántica en Documentos

```javascript
// Crear colección para documentos
const collection = await chroma.createCollection({
	name: 'company_docs',
	metadata: { 
		description: 'Documentos internos de la empresa',
		model: 'sentence-transformers'
	}
});

// Añadir documentos
await chroma.add({
	collection: 'company_docs',
	ids: ['policy_1', 'manual_2', 'guide_3'],
	documents: [
		'Política de recursos humanos y beneficios para empleados',
		'Manual técnico de arquitectura de software',
		'Guía de mejores prácticas para desarrollo'
	],
	metadatas: [
		{ type: 'policy', department: 'hr', priority: 'high' },
		{ type: 'manual', department: 'tech', priority: 'medium' },
		{ type: 'guide', department: 'tech', priority: 'low' }
	]
});

// Búsqueda semántica
const results = await chroma.query({
	collection: 'company_docs',
	queryTexts: ['información sobre beneficios de empleados'],
	nResults: 5,
	where: { department: 'hr' }
});

console.log('Documentos encontrados:', results.documents[0]);
console.log('Puntuaciones de similitud:', results.distances[0]);
```

### 2. Sistema de Recomendaciones

```javascript
// Colección de productos
await chroma.createCollection({
	name: 'products',
	metadata: { purpose: 'product recommendations' }
});

// Añadir productos con descripciones
await chroma.add({
	collection: 'products',
	ids: ['prod_1', 'prod_2', 'prod_3'],
	documents: [
		'Smartphone con cámara de alta resolución y batería de larga duración',
		'Laptop para gaming con procesador de última generación',
		'Auriculares inalámbricos con cancelación de ruido'
	],
	metadatas: [
		{ category: 'electronics', price: 599, brand: 'TechCorp' },
		{ category: 'computers', price: 1299, brand: 'GameTech' },
		{ category: 'audio', price: 199, brand: 'SoundPro' }
	]
});

// Encontrar productos similares
const recommendations = await chroma.query({
	collection: 'products',
	queryTexts: ['dispositivo móvil con buena cámara'],
	nResults: 3,
	where: { price: { $lt: 1000 } }
});
```

### 3. Análisis de Sentimientos y Contenido

```javascript
// Sistema de análisis de feedback
await chroma.createCollection({
	name: 'customer_feedback',
	embeddingFunction: 'openai' // Usar embeddings de OpenAI
});

// Procesar feedback de clientes
const feedbacks = [
	'El producto es excelente, muy satisfecho con la compra',
	'Servicio al cliente muy lento, necesita mejorar',
	'Calidad precio muy buena, lo recomiendo',
	'Entrega tardía pero producto de calidad'
];

await chroma.add({
	collection: 'customer_feedback',
	ids: feedbacks.map((_, i) => `feedback_${i}`),
	documents: feedbacks,
	metadatas: feedbacks.map((text, i) => ({
		sentiment: analyzeSentiment(text), // Función externa
		length: text.length,
		date: new Date().toISOString()
	}))
});

// Encontrar feedback similar
const similarFeedback = await chroma.query({
	collection: 'customer_feedback',
	queryTexts: ['problemas con el servicio'],
	nResults: 5,
	where: { sentiment: 'negative' }
});
```

## 🛠️ API Completa

### Gestión de Colecciones

```javascript
// Crear colección
const collection = await chroma.createCollection({
	name: 'my_collection',
	metadata: { version: '1.0' },
	embeddingFunction: 'default' // o 'openai', 'huggingface', etc.
});

// Obtener colección existente
const existing = await chroma.getCollection('my_collection');

// Obtener o crear (idempotente)
const collection = await chroma.getOrCreateCollection({
	name: 'my_collection',
	metadata: { created_at: new Date().toISOString() }
});

// Listar colecciones
const collections = await chroma.listCollections();

// Eliminar colección
await chroma.deleteCollection('my_collection');
```

### Operaciones CRUD

```javascript
// CREATE - Añadir documentos
await chroma.add({
	collection: 'docs',
	ids: ['doc1', 'doc2'],
	documents: ['Texto 1', 'Texto 2'],
	metadatas: [{ tag: 'info' }, { tag: 'data' }],
	embeddings: [[0.1, 0.2, ...], [0.3, 0.4, ...]] // Opcional
});

// READ - Obtener documentos
const docs = await chroma.get({
	collection: 'docs',
	ids: ['doc1'], // Opcional
	where: { tag: 'info' }, // Opcional
	limit: 10,
	offset: 0,
	include: ['documents', 'metadatas', 'embeddings']
});

// UPDATE - Actualizar documentos
await chroma.update({
	collection: 'docs',
	ids: ['doc1'],
	documents: ['Texto actualizado'],
	metadatas: [{ tag: 'info', updated: true }]
});

// DELETE - Eliminar documentos
await chroma.delete({
	collection: 'docs',
	ids: ['doc2'], // O usar where para eliminar por condiciones
	where: { tag: 'obsolete' }
});

// UPSERT - Insertar o actualizar
await chroma.upsert({
	collection: 'docs',
	ids: ['doc3'],
	documents: ['Nuevo o actualizado'],
	metadatas: [{ status: 'active' }]
});
```

### Búsquedas y Consultas

```javascript
// Búsqueda por similitud de texto
const results = await chroma.query({
	collection: 'docs',
	queryTexts: ['buscar documentos similares'],
	nResults: 10,
	where: { status: 'active' },
	whereDocument: { $contains: 'importante' },
	include: ['documents', 'metadatas', 'distances']
});

// Búsqueda por vectores
const vectorResults = await chroma.query({
	collection: 'docs',
	queryEmbeddings: [[0.1, 0.2, 0.3, ...]],
	nResults: 5,
	where: { category: 'technical' }
});

// Búsqueda híbrida (texto + filtros)
const hybridResults = await chroma.hybridSearch({
	collection: 'docs',
	queryTexts: ['machine learning'],
	nResults: 15,
	where: { 
		$and: [
			{ domain: 'AI' },
			{ year: { $gte: 2020 } }
		]
	}
});

// Contar documentos
const count = await chroma.count({ collection: 'docs' });

// Vista previa de la colección
const preview = await chroma.peek({ 
	collection: 'docs', 
	limit: 5 
});
```

### Filtros Avanzados

```javascript
// Operadores de comparación
const filters = {
	// Igualdad
	exact: { field: { $eq: 'value' } },
	notEqual: { field: { $ne: 'value' } },
	
	// Comparaciones numéricas
	greater: { score: { $gt: 0.8 } },
	greaterEqual: { score: { $gte: 0.8 } },
	less: { score: { $lt: 0.5 } },
	lessEqual: { score: { $lte: 0.5 } },
	
	// Operadores de conjunto
	inList: { category: { $in: ['tech', 'science'] } },
	notInList: { status: { $nin: ['deleted', 'archived'] } },
	
	// Operadores lógicos
	andCondition: {
		$and: [
			{ category: 'tech' },
			{ score: { $gt: 0.7 } }
		]
	},
	orCondition: {
		$or: [
			{ priority: 'high' },
			{ urgent: true }
		]
	},
	notCondition: {
		$not: { status: 'inactive' }
	}
};

// Filtros de documento
const documentFilters = {
	contains: { $contains: 'keyword' },
	notContains: { $not_contains: 'spam' }
};
```

## 🤖 Funciones de Embedding

### Configuración de Modelos

```javascript
// Default (modelo local)
const defaultCollection = await chroma.createCollection({
	name: 'default_docs',
	embeddingFunction: 'default'
});

// OpenAI
const openaiCollection = await chroma.createCollection({
	name: 'openai_docs',
	embeddingFunction: 'openai',
	embeddingConfig: {
		apiKey: 'your-openai-api-key',
		model: 'text-embedding-ada-002'
	}
});

// HuggingFace
const hfCollection = await chroma.createCollection({
	name: 'huggingface_docs',
	embeddingFunction: 'huggingface',
	embeddingConfig: {
		model: 'sentence-transformers/all-MiniLM-L6-v2'
	}
});

// Cohere
const cohereCollection = await chroma.createCollection({
	name: 'cohere_docs',
	embeddingFunction: 'cohere',
	embeddingConfig: {
		apiKey: 'your-cohere-api-key',
		model: 'embed-english-v2.0'
	}
});

// Google
const googleCollection = await chroma.createCollection({
	name: 'google_docs',
	embeddingFunction: 'google',
	embeddingConfig: {
		apiKey: 'your-google-api-key',
		taskType: 'RETRIEVAL_DOCUMENT'
	}
});
```

## 🔄 Operaciones Avanzadas

### Operaciones en Lote

```javascript
// Procesar múltiples operaciones
const operations = [
	{
		operation: 'add',
		params: {
			collection: 'batch_docs',
			ids: ['batch_1'],
			documents: ['Documento 1']
		}
	},
	{
		operation: 'update',
		params: {
			collection: 'batch_docs',
			ids: ['existing_doc'],
			documents: ['Documento actualizado']
		}
	}
];

const results = await chroma.batch(operations);
console.log('Resultados del lote:', results);
```

### Búsqueda con Embeddings Personalizados

```javascript
// Usar embeddings pre-calculados
const customEmbeddings = [
	[0.1, 0.2, 0.3, ...], // Vector 384D o dimensión del modelo
	[0.4, 0.5, 0.6, ...]
];

await chroma.add({
	collection: 'custom_embeddings',
	ids: ['custom_1', 'custom_2'],
	documents: ['Documento con embedding personalizado 1', 'Documento 2'],
	embeddings: customEmbeddings
});

// Búsqueda por embedding específico
const similarDocs = await chroma.query({
	collection: 'custom_embeddings',
	queryEmbeddings: [customEmbeddings[0]], // Buscar similares al primero
	nResults: 3
});
```

## 🧪 Testing y Desarrollo

### Configuración de Tests

```javascript
// Archivo: test.config.js
export default {
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};

// setup.js
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
	// Configurar servidor de test
	console.log('Iniciando servidor Chroma para tests...');
});

afterAll(async () => {
	// Limpiar después de tests
	console.log('Limpiando servidor de test...');
});
```

### Tests de Ejemplo

```javascript
import { describe, test, expect } from 'vitest';
import Chroma from '../Chroma.js';

describe('Chroma Integration', () => {
	test('should perform semantic search', async () => {
		const chroma = new Chroma({ path: 'http://localhost:8000' });
		
		await chroma.createCollection({ name: 'test_search' });
		
		await chroma.add({
			collection: 'test_search',
			ids: ['test1'],
			documents: ['Machine learning algorithms']
		});
		
		const results = await chroma.query({
			collection: 'test_search',
			queryTexts: ['AI and ML'],
			nResults: 1
		});
		
		expect(results.ids[0]).toHaveLength(1);
		expect(results.documents[0][0]).toContain('Machine learning');
		
		await chroma.deleteCollection('test_search');
	});
});
```

## 📊 Ejemplos de Performance

### Benchmark de Operaciones

```javascript
// Benchmark de inserción masiva
const benchmarkInsert = async () => {
	const startTime = Date.now();
	const batchSize = 1000;
	
	const ids = Array.from({ length: batchSize }, (_, i) => `bench_${i}`);
	const documents = Array.from({ length: batchSize }, (_, i) => 
		`Documento de benchmark número ${i} con contenido variable`
	);
	
	await chroma.add({
		collection: 'benchmark',
		ids,
		documents
	});
	
	const endTime = Date.now();
	console.log(`Insertados ${batchSize} documentos en ${endTime - startTime}ms`);
};

// Benchmark de búsqueda
const benchmarkSearch = async () => {
	const startTime = Date.now();
	
	const results = await chroma.query({
		collection: 'benchmark',
		queryTexts: ['consulta de prueba'],
		nResults: 100
	});
	
	const endTime = Date.now();
	console.log(`Búsqueda completada en ${endTime - startTime}ms`);
	console.log(`Encontrados ${results.ids[0].length} resultados`);
};
```

## 🚦 Mejores Prácticas

### 1. Gestión de Colecciones

```javascript
// ✅ Usar nombres descriptivos
const collection = await chroma.createCollection({
	name: 'product_reviews_2024',
	metadata: {
		purpose: 'customer sentiment analysis',
		version: '1.0',
		created: new Date().toISOString()
	}
});

// ✅ Limpiar colecciones de test
if (process.env.NODE_ENV === 'test') {
	await chroma.deleteCollection('test_collection');
}
```

### 2. Optimización de Embeddings

```javascript
// ✅ Reutilizar función de embedding para colecciones relacionadas
const embeddingConfig = {
	embeddingFunction: 'openai',
	embeddingConfig: { 
		apiKey: process.env.OPENAI_API_KEY,
		model: 'text-embedding-ada-002'
	}
};

const docsCollection = await chroma.createCollection({
	name: 'documents',
	...embeddingConfig
});

const commentsCollection = await chroma.createCollection({
	name: 'comments',
	...embeddingConfig
});
```

### 3. Manejo de Errores

```javascript
// ✅ Validación antes de operaciones
const addDocumentsSafely = async (data) => {
	// Validar datos
	const validation = chroma.validateData(data);
	if (!validation.valid) {
		throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
	}
	
	try {
		return await chroma.add(data);
	} catch (error) {
		console.error('Error al añadir documentos:', error);
		throw error;
	}
};

// ✅ Retry logic para operaciones críticas
const retryOperation = async (operation, maxRetries = 3) => {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await operation();
		} catch (error) {
			if (i === maxRetries - 1) throw error;
			await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
		}
	}
};
```

### 4. Búsquedas Eficientes

```javascript
// ✅ Usar filtros para reducir el espacio de búsqueda
const efficientSearch = async (query, filters = {}) => {
	return await chroma.query({
		collection: 'large_collection',
		queryTexts: [query],
		nResults: 20, // Limitar resultados
		where: filters, // Filtrar antes de búsqueda vectorial
		include: ['documents', 'metadatas', 'distances'] // Solo datos necesarios
	});
};

// ✅ Paginar resultados grandes
const paginatedResults = async (query, page = 0, pageSize = 50) => {
	return await chroma.query({
		collection: 'documents',
		queryTexts: [query],
		nResults: pageSize,
		// Nota: Chroma no soporta offset directo en query,
		// usar get() con limit/offset para paginación estricta
	});
};
```

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de Conexión al Servidor**
```bash
# Verificar que Chroma esté corriendo
curl http://localhost:8000/api/v1/heartbeat

# Reiniciar servidor
docker restart chroma-container
```

2. **Problemas de Memoria con Embeddings**
```javascript
// Procesar en lotes pequeños
const processBatches = async (documents, batchSize = 100) => {
	for (let i = 0; i < documents.length; i += batchSize) {
		const batch = documents.slice(i, i + batchSize);
		await chroma.add({
			collection: 'large_dataset',
			ids: batch.map((_, idx) => `doc_${i + idx}`),
			documents: batch
		});
	}
};
```

3. **Embeddings Inconsistentes**
```javascript
// Verificar dimensiones
const validateEmbeddings = (embeddings) => {
	const firstDim = embeddings[0]?.length;
	return embeddings.every(emb => 
		emb.length === firstDim && 
		emb.every(val => typeof val === 'number')
	);
};
```

## 📚 Recursos Adicionales

- [Documentación Oficial de Chroma](https://docs.trychroma.com/)
- [Chroma GitHub Repository](https://github.com/chroma-core/chroma)
- [QueryBuilder Core Documentation](../core/README.md)
- [Ejemplos Avanzados](./examples/)
- [API Reference](./docs/api.md)

## 🤝 Contribución

Para contribuir al desarrollo de esta integración:

1. Fork el repositorio
2. Crear una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -am 'Añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear un Pull Request

## 📄 Licencia

MIT © QueryBuilder Team

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o consulta la documentación completa.