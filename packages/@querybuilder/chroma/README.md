# @querybuilder/chroma

Adaptador ChromaDB para QueryBuilder - Base de datos vectorial para aplicaciones de IA y Machine Learning.

## 📦 Instalación

```bash
# Instalar el paquete ChromaDB
npm install @querybuilder/core @querybuilder/chroma

# Instalar cliente ChromaDB
npm install chromadb
```

## 🐳 Servidor ChromaDB

```bash
# Opción 1: Docker (recomendado)
docker run -p 8000:8000 chromadb/chroma

# Opción 2: Python (local)
pip install chromadb
chroma run --host localhost --port 8000 --path ./chroma_data
```

## 🚀 Uso Básico

```javascript
import { ChromaClient } from 'chromadb';

// Conectar a ChromaDB
const client = new ChromaClient({
  path: 'http://localhost:8000'
});

// Crear colección
const collection = await client.getOrCreateCollection({
  name: 'documents',
  metadata: { description: 'Document embeddings' }
});

// Agregar documentos
await collection.add({
  ids: ['doc1', 'doc2', 'doc3'],
  documents: [
    'ChromaDB is a vector database for AI',
    'Machine learning needs efficient search',
    'Embeddings represent data as vectors'
  ]
});

// Buscar similares
const results = await collection.query({
  queryTexts: ['What is a vector database?'],
  nResults: 2
});

console.log(results.documents[0]);
```

## 📊 Operaciones de Colección

### ✅ Crear y Gestionar Colecciones
```javascript
import { ChromaClient } from 'chromadb';

const client = new ChromaClient({ path: 'http://localhost:8000' });

// Crear colección nueva
const collection = await client.createCollection({
  name: 'my_collection',
  metadata: {
    description: 'My first collection',
    created: new Date().toISOString()
  }
});

// Obtener colección existente
const existing = await client.getCollection({ name: 'my_collection' });

// Obtener o crear (idempotente)
const collection2 = await client.getOrCreateCollection({
  name: 'documents'
});

// Listar todas las colecciones
const collections = await client.listCollections();
console.log('Colecciones:', collections.map(c => c.name));

// Eliminar colección
await client.deleteCollection({ name: 'old_collection' });
```

### ✅ Información de Colección
```javascript
// Contar documentos
const count = await collection.count();
console.log(`Total documentos: ${count}`);

// Ver muestra de documentos
const sample = await collection.peek({ limit: 5 });
console.log('Muestra:', sample);

// Obtener metadata de la colección
console.log('Metadata:', collection.metadata);
console.log('Nombre:', collection.name);
```

## 📝 Operaciones CRUD

### ✅ ADD - Agregar Documentos
```javascript
// Agregar documentos básicos
await collection.add({
  ids: ['id1', 'id2', 'id3'],
  documents: [
    'First document text',
    'Second document text',
    'Third document text'
  ]
});

// Agregar con metadata
await collection.add({
  ids: ['doc1', 'doc2'],
  documents: [
    'ChromaDB stores vector embeddings',
    'Vector search enables semantic similarity'
  ],
  metadatas: [
    { category: 'database', author: 'Alice', tags: ['vectors', 'db'] },
    { category: 'ml', author: 'Bob', tags: ['search', 'ai'] }
  ]
});

// Agregar con embeddings personalizados
await collection.add({
  ids: ['custom1'],
  documents: ['Custom embedding document'],
  embeddings: [[0.1, 0.2, 0.3, 0.4, 0.5]]  // Vector de 5 dimensiones
});

// Agregar múltiples documentos
const largeData = {
  ids: Array.from({ length: 100 }, (_, i) => `doc_${i}`),
  documents: Array.from({ length: 100 }, (_, i) => `Document ${i} content`),
  metadatas: Array.from({ length: 100 }, (_, i) => ({ index: i, batch: 1 }))
};

await collection.add(largeData);
```

### ✅ GET - Obtener Documentos
```javascript
// Obtener por IDs
const docs = await collection.get({
  ids: ['doc1', 'doc2']
});

console.log('Documentos:', docs.documents);
console.log('Metadatas:', docs.metadatas);
console.log('Embeddings:', docs.embeddings);

// Obtener con filtro de metadata
const filtered = await collection.get({
  where: { category: 'ml' }
});

// Obtener con múltiples filtros
const complex = await collection.get({
  where: {
    $and: [
      { category: 'database' },
      { author: { $ne: 'Alice' } }
    ]
  },
  limit: 10
});

// Obtener con filtro de contenido
const docFiltered = await collection.get({
  whereDocument: { $contains: 'vector' }
});

// Obtener todos (con límite)
const all = await collection.get({
  limit: 100,
  offset: 0
});
```

### ✅ UPDATE - Actualizar Documentos
```javascript
// Actualizar documento completo
await collection.update({
  ids: ['doc1'],
  documents: ['Updated document text'],
  metadatas: [{ category: 'database', updated: true }]
});

// Actualizar solo metadata
await collection.update({
  ids: ['doc2'],
  metadatas: [{ views: 100, last_modified: new Date().toISOString() }]
});

// Actualizar solo documento (mantiene metadata)
await collection.update({
  ids: ['doc3'],
  documents: ['New content only']
});

// Actualizar embeddings personalizados
await collection.update({
  ids: ['custom1'],
  embeddings: [[0.2, 0.3, 0.4, 0.5, 0.6]]
});

// Actualizar múltiples
await collection.update({
  ids: ['doc1', 'doc2', 'doc3'],
  metadatas: [
    { status: 'reviewed' },
    { status: 'reviewed' },
    { status: 'pending' }
  ]
});
```

### ✅ UPSERT - Actualizar o Insertar
```javascript
// Upsert (actualiza si existe, inserta si no)
await collection.upsert({
  ids: ['doc1', 'new_doc', 'doc2'],
  documents: [
    'Updated doc1',
    'Brand new document',
    'Updated doc2'
  ],
  metadatas: [
    { version: 2 },
    { version: 1 },
    { version: 2 }
  ]
});

// Upsert masivo
const upsertData = {
  ids: Array.from({ length: 50 }, (_, i) => `doc_${i}`),
  documents: Array.from({ length: 50 }, (_, i) => `Content for doc ${i}`),
  metadatas: Array.from({ length: 50 }, (_, i) => ({ 
    index: i, 
    updated: new Date().toISOString() 
  }))
};

await collection.upsert(upsertData);
```

### ✅ DELETE - Eliminar Documentos
```javascript
// Eliminar por IDs
await collection.delete({
  ids: ['doc1', 'doc2']
});

// Eliminar con filtro
await collection.delete({
  where: { status: 'obsolete' }
});

// Eliminar por contenido
await collection.delete({
  whereDocument: { $contains: 'deprecated' }
});

// Eliminar con filtros complejos
await collection.delete({
  where: {
    $and: [
      { category: 'temp' },
      { created_at: { $lt: '2024-01-01' } }
    ]
  }
});
```

## 🔍 Búsqueda Semántica

### ✅ Query - Búsqueda por Similitud
```javascript
// Búsqueda básica
const results = await collection.query({
  queryTexts: ['machine learning algorithms'],
  nResults: 5
});

console.log('Documentos:', results.documents[0]);
console.log('Distancias:', results.distances[0]);
console.log('Metadatas:', results.metadatas[0]);

// Búsqueda con filtro de metadata
const filtered = await collection.query({
  queryTexts: ['database technology'],
  nResults: 10,
  where: { category: 'database' }
});

// Búsqueda con filtros complejos
const advanced = await collection.query({
  queryTexts: ['artificial intelligence'],
  nResults: 5,
  where: {
    $and: [
      { category: { $in: ['ml', 'ai', 'nlp'] } },
      { author: { $ne: 'Anonymous' } },
      { year: { $gte: 2023 } }
    ]
  }
});

// Búsqueda con filtro de documento
const contentFilter = await collection.query({
  queryTexts: ['vector search'],
  nResults: 3,
  whereDocument: { $contains: 'embedding' }
});

// Múltiples consultas simultáneas
const multiQuery = await collection.query({
  queryTexts: [
    'machine learning',
    'data science',
    'neural networks'
  ],
  nResults: 3
});

// Acceder resultados de cada consulta
multiQuery.documents.forEach((docs, i) => {
  console.log(`Resultados para consulta ${i + 1}:`, docs);
});
```

### ✅ Query con Embeddings Personalizados
```javascript
// Buscar usando vector directo
const vectorResults = await collection.query({
  queryEmbeddings: [[0.1, 0.2, 0.3, 0.4, 0.5]],
  nResults: 5
});

// Múltiples vectores
const multiVector = await collection.query({
  queryEmbeddings: [
    [0.1, 0.2, 0.3, 0.4, 0.5],
    [0.2, 0.3, 0.4, 0.5, 0.6],
    [0.3, 0.4, 0.5, 0.6, 0.7]
  ],
  nResults: 3
});
```

## 🎯 Filtros Avanzados

### Operadores de Metadata
```javascript
// $eq - Igual
await collection.query({
  queryTexts: ['search query'],
  where: { category: { $eq: 'ml' } }
});

// $ne - No igual
await collection.query({
  queryTexts: ['search query'],
  where: { status: { $ne: 'deleted' } }
});

// $gt, $gte - Mayor que, mayor o igual
await collection.query({
  queryTexts: ['search query'],
  where: { views: { $gte: 100 } }
});

// $lt, $lte - Menor que, menor o igual
await collection.query({
  queryTexts: ['search query'],
  where: { priority: { $lt: 5 } }
});

// $in - En lista
await collection.query({
  queryTexts: ['search query'],
  where: { category: { $in: ['ml', 'ai', 'nlp'] } }
});

// $nin - No en lista
await collection.query({
  queryTexts: ['search query'],
  where: { status: { $nin: ['deleted', 'archived'] } }
});

// $and - Y lógico
await collection.query({
  queryTexts: ['search query'],
  where: {
    $and: [
      { category: 'ml' },
      { views: { $gte: 100 } }
    ]
  }
});

// $or - O lógico
await collection.query({
  queryTexts: ['search query'],
  where: {
    $or: [
      { category: 'ml' },
      { category: 'ai' }
    ]
  }
});
```

### Operadores de Documento
```javascript
// $contains - Contiene texto
await collection.query({
  queryTexts: ['search query'],
  whereDocument: { $contains: 'machine learning' }
});

// $not_contains - No contiene
await collection.query({
  queryTexts: ['search query'],
  whereDocument: { $not_contains: 'deprecated' }
});

// Combinación con metadata
await collection.query({
  queryTexts: ['AI applications'],
  where: { category: 'ml' },
  whereDocument: { $contains: 'neural network' }
});
```

## 🧠 Funciones de Embedding

### ✅ Embedding Functions Integradas
```javascript
import { 
  OpenAIEmbeddingFunction,
  CohereEmbeddingFunction,
  HuggingFaceEmbeddingFunction,
  GoogleGenerativeAiEmbeddingFunction
} from 'chromadb';

// OpenAI Embeddings
const openaiEf = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY,
  model_name: 'text-embedding-3-small'
});

const openaiCollection = await client.createCollection({
  name: 'openai_docs',
  embeddingFunction: openaiEf
});

// Cohere Embeddings
const cohereEf = new CohereEmbeddingFunction({
  cohere_api_key: process.env.COHERE_API_KEY,
  model: 'embed-english-v3.0'
});

const cohereCollection = await client.createCollection({
  name: 'cohere_docs',
  embeddingFunction: cohereEf
});

// HuggingFace Embeddings
const hfEf = new HuggingFaceEmbeddingFunction({
  huggingface_api_key: process.env.HF_API_KEY,
  model_name: 'sentence-transformers/all-MiniLM-L6-v2'
});

const hfCollection = await client.createCollection({
  name: 'hf_docs',
  embeddingFunction: hfEf
});

// Google Generative AI Embeddings
const googleEf = new GoogleGenerativeAiEmbeddingFunction({
  google_api_key: process.env.GOOGLE_API_KEY,
  model_name: 'models/embedding-001'
});

const googleCollection = await client.createCollection({
  name: 'google_docs',
  embeddingFunction: googleEf
});
```

## 📖 Patrones Comunes

### RAG (Retrieval Augmented Generation)
```javascript
import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';

const chroma = new ChromaClient({ path: 'http://localhost:8000' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Preparar base de conocimiento
const knowledge = await chroma.getOrCreateCollection({ name: 'knowledge_base' });

await knowledge.add({
  ids: ['k1', 'k2', 'k3'],
  documents: [
    'ChromaDB is an open-source vector database for AI applications',
    'Vector embeddings represent text as numerical vectors',
    'Semantic search finds similar content based on meaning'
  ]
});

// Función RAG
async function ragQuery(question) {
  // 1. Buscar contexto relevante
  const searchResults = await knowledge.query({
    queryTexts: [question],
    nResults: 3
  });
  
  const context = searchResults.documents[0].join('\n\n');
  
  // 2. Generar respuesta con contexto
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Answer questions based only on the provided context.'
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ]
  });
  
  return {
    answer: completion.choices[0].message.content,
    sources: searchResults.documents[0],
    distances: searchResults.distances[0]
  };
}

// Usar RAG
const result = await ragQuery('What is ChromaDB?');
console.log('Answer:', result.answer);
console.log('Sources:', result.sources);
```

### Semantic Search Application
```javascript
// Sistema de búsqueda semántica
class SemanticSearchEngine {
  constructor(client, collectionName) {
    this.client = client;
    this.collectionName = collectionName;
    this.collection = null;
  }
  
  async initialize() {
    this.collection = await this.client.getOrCreateCollection({
      name: this.collectionName,
      metadata: { description: 'Semantic search engine' }
    });
  }
  
  async indexDocuments(documents) {
    const ids = documents.map((_, i) => `doc_${i}`);
    const texts = documents.map(d => d.text);
    const metadatas = documents.map(d => ({
      title: d.title,
      url: d.url,
      category: d.category
    }));
    
    await this.collection.add({ ids, documents: texts, metadatas });
  }
  
  async search(query, options = {}) {
    const {
      limit = 10,
      category = null,
      minRelevance = 0.5
    } = options;
    
    const whereClause = category ? { category } : undefined;
    
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: limit,
      where: whereClause
    });
    
    // Filtrar por relevancia mínima
    const filtered = results.documents[0]
      .map((doc, i) => ({
        document: doc,
        metadata: results.metadatas[0][i],
        relevance: 1 - results.distances[0][i]
      }))
      .filter(r => r.relevance >= minRelevance);
    
    return filtered;
  }
}

// Uso
const engine = new SemanticSearchEngine(client, 'search_engine');
await engine.initialize();

await engine.indexDocuments([
  { 
    text: 'Machine learning enables computers to learn from data',
    title: 'ML Basics',
    url: '/ml-basics',
    category: 'education'
  },
  {
    text: 'Deep neural networks power modern AI',
    title: 'Deep Learning',
    url: '/deep-learning',
    category: 'advanced'
  }
]);

const results = await engine.search('artificial intelligence', {
  limit: 5,
  minRelevance: 0.7
});
```

### Document Clustering
```javascript
// Agrupar documentos similares
async function clusterDocuments(collection, numClusters = 5) {
  // Obtener todos los documentos con embeddings
  const allDocs = await collection.get({
    include: ['documents', 'embeddings', 'metadatas']
  });
  
  // Aquí usarías un algoritmo de clustering como K-means
  // Para simplificar, agrupamos por similitud
  const clusters = [];
  
  for (const doc of allDocs.documents) {
    // Buscar documentos similares
    const similar = await collection.query({
      queryTexts: [doc],
      nResults: 10
    });
    
    clusters.push({
      document: doc,
      similar: similar.documents[0].slice(1) // Excluir el mismo documento
    });
  }
  
  return clusters;
}
```

## 🔌 Configuración Avanzada

### Cliente con Autenticación
```javascript
import { ChromaClient } from 'chromadb';

// Cliente con autenticación básica
const client = new ChromaClient({
  path: 'http://localhost:8000',
  auth: {
    provider: 'basic',
    credentials: 'username:password'
  }
});

// Cliente con token
const tokenClient = new ChromaClient({
  path: 'http://localhost:8000',
  auth: {
    provider: 'token',
    credentials: 'your-api-token'
  }
});
```

### Configuración de Distancia
```javascript
// Diferentes métricas de distancia
const l2Collection = await client.createCollection({
  name: 'l2_metrics',
  metadata: { 
    'hnsw:space': 'l2'  // Distancia euclidiana (default)
  }
});

const cosineCollection = await client.createCollection({
  name: 'cosine_metrics',
  metadata: { 
    'hnsw:space': 'cosine'  // Similitud coseno
  }
});

const ipCollection = await client.createCollection({
  name: 'ip_metrics',
  metadata: { 
    'hnsw:space': 'ip'  // Producto interno
  }
});
```

## 🧪 Testing

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ChromaClient } from 'chromadb';

test('ChromaDB operations', async () => {
  const client = new ChromaClient({ path: 'http://localhost:8000' });
  
  // Crear colección de prueba
  const collection = await client.createCollection({
    name: 'test_collection'
  });
  
  try {
    // Test ADD
    await collection.add({
      ids: ['test1', 'test2'],
      documents: ['First test', 'Second test']
    });
    
    const count = await collection.count();
    assert.equal(count, 2);
    
    // Test QUERY
    const results = await collection.query({
      queryTexts: ['test'],
      nResults: 2
    });
    
    assert.equal(results.documents[0].length, 2);
    
    // Test UPDATE
    await collection.update({
      ids: ['test1'],
      documents: ['Updated test']
    });
    
    const updated = await collection.get({ ids: ['test1'] });
    assert.equal(updated.documents[0], 'Updated test');
    
    // Test DELETE
    await collection.delete({ ids: ['test2'] });
    const finalCount = await collection.count();
    assert.equal(finalCount, 1);
    
  } finally {
    // Cleanup
    await client.deleteCollection({ name: 'test_collection' });
  }
});
```

## ⚡ Características ChromaDB

- **Vector Search**: Búsqueda por similitud ultra-rápida
- **Embeddings Automáticos**: Generación automática con múltiples modelos
- **Filtrado Flexible**: Combina búsqueda vectorial con filtros
- **Escalable**: Maneja millones de vectores eficientemente
- **Open Source**: Código abierto y gratuito
- **Multi-modal**: Soporta texto, imágenes y más

## 📄 Casos de Uso

- **RAG Systems**: Sistemas de generación aumentada por recuperación
- **Semantic Search**: Búsqueda por significado, no solo palabras clave
- **Recommendation Systems**: Recomendaciones basadas en similitud
- **Document Clustering**: Agrupación automática de documentos
- **Image Similarity**: Búsqueda de imágenes similares
- **Question Answering**: Sistemas de preguntas y respuestas

## 📄 Licencia

MPL-2.0

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en el repositorio.

## 🔗 Enlaces

- [@querybuilder/core](../core/README.md)
- [@querybuilder/mongodb](../mongodb/README.md)
- [@querybuilder/mysql](../mysql/README.md)
- [@querybuilder/postgresql](../postgresql/README.md)
- [@querybuilder/sqlite](../sqlite/README.md)
- [@querybuilder/redis](../redis/README.md)
- [@querybuilder/cassandra](../cassandra/README.md)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [ChromaDB GitHub](https://github.com/chroma-core/chroma)
