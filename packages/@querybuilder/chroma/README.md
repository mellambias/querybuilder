# @querybuilder/chroma# @querybuilder/chroma



Adaptador ChromaDB para QueryBuilder - Base de datos vectorial de código abierto para aplicaciones de IA y Machine Learning.Adaptador ChromaDB para QueryBuilder - Base de datos vectorial para aplicaciones de IA y Machine Learning.



## 📦 Instalación## 📦 Instalación



```bash```bash

# Instalar el paquete ChromaDB# Instalar el paquete ChromaDB

npm install @querybuilder/core @querybuilder/chromanpm install @querybuilder/core @querybuilder/chroma



# Instalar cliente ChromaDB# Instalar cliente ChromaDB

npm install chromadbnpm install chromadb

``````



## 🐳 Servidor ChromaDB## 🐳 Servidor ChromaDB



```bash```bash

# Opción 1: Docker (recomendado)# Opción 1: Docker (recomendado)

docker run -p 8000:8000 chromadb/chromadocker run -p 8000:8000 chromadb/chroma



# Opción 2: Python local# Opción 2: Python (local)

pip install chromadbpip install chromadb

chroma run --host localhost --port 8000 --path ./chroma_datachroma run --host localhost --port 8000 --path ./chroma_data

```

# Opción 3: Modo embebido (solo Python)

# No requiere servidor separado## 🚀 Uso Básico

```

```javascript

## 🚀 Uso Básicoimport { ChromaClient } from 'chromadb';



```javascript// Conectar a ChromaDB

import { ChromaClient } from 'chromadb';const client = new ChromaClient({

  path: 'http://localhost:8000'

// Conectar a ChromaDB});

const client = new ChromaClient({

  path: 'http://localhost:8000'// Crear colección

});const collection = await client.getOrCreateCollection({

  name: 'documents',

// Crear o obtener colección  metadata: { description: 'Document embeddings' }

const collection = await client.getOrCreateCollection({});

  name: 'documents',

  metadata: { description: 'Document embeddings' }// Agregar documentos

});await collection.add({

  ids: ['doc1', 'doc2', 'doc3'],

// Agregar documentos (embeddings automáticos)  documents: [

await collection.add({    'ChromaDB is a vector database for AI',

  ids: ['doc1', 'doc2', 'doc3'],    'Machine learning needs efficient search',

  documents: [    'Embeddings represent data as vectors'

    'ChromaDB is a vector database for AI',  ]

    'Machine learning needs efficient search',});

    'Embeddings represent data as vectors'

  ]// Buscar similares

});const results = await collection.query({

  queryTexts: ['What is a vector database?'],

// Buscar documentos similares  nResults: 2

const results = await collection.query({});

  queryTexts: ['What is a vector database?'],

  nResults: 3console.log(results.documents[0]);

});```



console.log('Resultados:', results.documents[0]);## 📊 Operaciones de Colección

```

### ✅ Crear y Gestionar Colecciones

## 🔧 Gestión de Colecciones```javascript

import { ChromaClient } from 'chromadb';

### ✅ Crear Colecciones

```javascriptconst client = new ChromaClient({ path: 'http://localhost:8000' });

import { ChromaClient } from 'chromadb';

// Crear colección nueva

const client = new ChromaClient({ path: 'http://localhost:8000' });const collection = await client.createCollection({

  name: 'my_collection',

// Crear colección simple  metadata: {

const collection = await client.createCollection({    description: 'My first collection',

  name: 'my_collection'    created: new Date().toISOString()

});  }

});

// Crear con metadata

const collectionWithMeta = await client.createCollection({// Obtener colección existente

  name: 'articles',const existing = await client.getCollection({ name: 'my_collection' });

  metadata: {

    description: 'News articles embeddings',// Obtener o crear (idempotente)

    type: 'text',const collection2 = await client.getOrCreateCollection({

    model: 'sentence-transformers'  name: 'documents'

  }});

});

// Listar todas las colecciones

// Get or Create (no falla si existe)const collections = await client.listCollections();

const existingOrNew = await client.getOrCreateCollection({console.log('Colecciones:', collections.map(c => c.name));

  name: 'documents',

  metadata: { version: '1.0' }// Eliminar colección

});await client.deleteCollection({ name: 'old_collection' });

``````



### ✅ Listar y Obtener Colecciones### ✅ Información de Colección

```javascript```javascript

// Listar todas las colecciones// Contar documentos

const collections = await client.listCollections();const count = await collection.count();

console.log('Colecciones:', collections.map(c => c.name));console.log(`Total documentos: ${count}`);



// Obtener colección específica// Ver muestra de documentos

const collection = await client.getCollection({ name: 'documents' });const sample = await collection.peek({ limit: 5 });

console.log('Colección:', collection.name);console.log('Muestra:', sample);



// Contar documentos en colección// Obtener metadata de la colección

const count = await collection.count();console.log('Metadata:', collection.metadata);

console.log('Total documentos:', count);console.log('Nombre:', collection.name);

``````



### ✅ Modificar y Eliminar Colecciones## 📝 Operaciones CRUD

```javascript

// Modificar metadata de colección### ✅ ADD - Agregar Documentos

await collection.modify({```javascript

  name: 'documents',// Agregar documentos básicos

  metadata: { version: '2.0', updated: new Date().toISOString() }await collection.add({

});  ids: ['id1', 'id2', 'id3'],

  documents: [

// Eliminar colección    'First document text',

await client.deleteCollection({ name: 'old_collection' });    'Second document text',

    'Third document text'

// Limpiar colección (eliminar todos los documentos)  ]

const collection = await client.getCollection({ name: 'temp' });});

const allIds = (await collection.get()).ids;

await collection.delete({ ids: allIds });// Agregar con metadata

```await collection.add({

  ids: ['doc1', 'doc2'],

## 📊 Operaciones con Documentos  documents: [

    'ChromaDB stores vector embeddings',

### ✅ Agregar Documentos    'Vector search enables semantic similarity'

```javascript  ],

// Add básico con documentos  metadatas: [

await collection.add({    { category: 'database', author: 'Alice', tags: ['vectors', 'db'] },

  ids: ['id1', 'id2', 'id3'],    { category: 'ml', author: 'Bob', tags: ['search', 'ai'] }

  documents: [  ]

    'First document about AI',});

    'Second document about ML',

    'Third document about data science'// Agregar con embeddings personalizados

  ]await collection.add({

});  ids: ['custom1'],

  documents: ['Custom embedding document'],

// Add con metadatos  embeddings: [[0.1, 0.2, 0.3, 0.4, 0.5]]  // Vector de 5 dimensiones

await collection.add({});

  ids: ['doc1', 'doc2'],

  documents: [// Agregar múltiples documentos

    'ChromaDB stores vector embeddings',const largeData = {

    'Vector search enables semantic similarity'  ids: Array.from({ length: 100 }, (_, i) => `doc_${i}`),

  ],  documents: Array.from({ length: 100 }, (_, i) => `Document ${i} content`),

  metadatas: [  metadatas: Array.from({ length: 100 }, (_, i) => ({ index: i, batch: 1 }))

    { category: 'database', year: 2023 },};

    { category: 'search', year: 2024 }

  ]await collection.add(largeData);

});```



// Add con embeddings personalizados (si tienes tus propios vectores)### ✅ GET - Obtener Documentos

await collection.add({```javascript

  ids: ['custom1'],// Obtener por IDs

  embeddings: [[0.1, 0.2, 0.3, 0.4, 0.5]], // Tu embedding pre-calculadoconst docs = await collection.get({

  documents: ['Document with custom embedding'],  ids: ['doc1', 'doc2']

  metadatas: [{ source: 'custom' }]});

});

console.log('Documentos:', docs.documents);

// Add múltiples documentos eficientementeconsole.log('Metadatas:', docs.metadatas);

const batchSize = 1000;console.log('Embeddings:', docs.embeddings);

const ids = Array.from({ length: batchSize }, (_, i) => `doc_${i}`);

const docs = Array.from({ length: batchSize }, (_, i) => `Document ${i} content`);// Obtener con filtro de metadata

const metas = Array.from({ length: batchSize }, (_, i) => ({ index: i }));const filtered = await collection.get({

  where: { category: 'ml' }

await collection.add({});

  ids: ids,

  documents: docs,// Obtener con múltiples filtros

  metadatas: metasconst complex = await collection.get({

});  where: {

```    $and: [

      { category: 'database' },

### ✅ Obtener Documentos      { author: { $ne: 'Alice' } }

```javascript    ]

// Get por IDs  },

const results = await collection.get({  limit: 10

  ids: ['doc1', 'doc2']});

});

// Obtener con filtro de contenido

console.log('Documentos:', results.documents);const docFiltered = await collection.get({

console.log('Metadatos:', results.metadatas);  whereDocument: { $contains: 'vector' }

console.log('Embeddings:', results.embeddings);});



// Get todos los documentos (usar con cuidado)// Obtener todos (con límite)

const all = await collection.get();const all = await collection.get({

console.log('Total:', all.ids.length);  limit: 100,

  offset: 0

// Get con filtro de metadata});

const filtered = await collection.get({```

  where: { category: 'database' }

});### ✅ UPDATE - Actualizar Documentos

```javascript

// Get con límite// Actualizar documento completo

const limited = await collection.get({await collection.update({

  limit: 10  ids: ['doc1'],

});  documents: ['Updated document text'],

  metadatas: [{ category: 'database', updated: true }]

// Get con offset (paginación)});

const page2 = await collection.get({

  limit: 10,// Actualizar solo metadata

  offset: 10await collection.update({

});  ids: ['doc2'],

  metadatas: [{ views: 100, last_modified: new Date().toISOString() }]

// Get solo IDs y metadatos (sin embeddings)});

const idsAndMeta = await collection.get({

  include: ['metadatas']  // No incluye embeddings ni documents// Actualizar solo documento (mantiene metadata)

});await collection.update({

```  ids: ['doc3'],

  documents: ['New content only']

### ✅ Actualizar Documentos});

```javascript

// Update documentos// Actualizar embeddings personalizados

await collection.update({await collection.update({

  ids: ['doc1', 'doc2'],  ids: ['custom1'],

  documents: [  embeddings: [[0.2, 0.3, 0.4, 0.5, 0.6]]

    'Updated first document',});

    'Updated second document'

  ]// Actualizar múltiples

});await collection.update({

  ids: ['doc1', 'doc2', 'doc3'],

// Update metadatos  metadatas: [

await collection.update({    { status: 'reviewed' },

  ids: ['doc1'],    { status: 'reviewed' },

  metadatas: [{ category: 'updated', modified: new Date().toISOString() }]    { status: 'pending' }

});  ]

});

// Update con nuevos embeddings```

await collection.update({

  ids: ['doc1'],### ✅ UPSERT - Actualizar o Insertar

  embeddings: [[0.5, 0.6, 0.7, 0.8, 0.9]],```javascript

  documents: ['Updated with new embedding']// Upsert (actualiza si existe, inserta si no)

});await collection.upsert({

```  ids: ['doc1', 'new_doc', 'doc2'],

  documents: [

### ✅ Upsert (Update o Insert)    'Updated doc1',

```javascript    'Brand new document',

// Upsert - actualiza si existe, inserta si no existe    'Updated doc2'

await collection.upsert({  ],

  ids: ['doc1', 'doc_new'],  metadatas: [

  documents: [    { version: 2 },

    'Updated or new document 1',    { version: 1 },

    'Brand new document'    { version: 2 }

  ],  ]

  metadatas: [});

    { status: 'upserted' },

    { status: 'new' }// Upsert masivo

  ]const upsertData = {

});  ids: Array.from({ length: 50 }, (_, i) => `doc_${i}`),

```  documents: Array.from({ length: 50 }, (_, i) => `Content for doc ${i}`),

  metadatas: Array.from({ length: 50 }, (_, i) => ({ 

### ✅ Eliminar Documentos    index: i, 

```javascript    updated: new Date().toISOString() 

// Delete por IDs  }))

await collection.delete({};

  ids: ['doc1', 'doc2', 'doc3']

});await collection.upsert(upsertData);

```

// Delete con filtro de metadata

await collection.delete({### ✅ DELETE - Eliminar Documentos

  where: { category: 'obsolete' }```javascript

});// Eliminar por IDs

await collection.delete({

// Delete múltiples con condición compleja  ids: ['doc1', 'doc2']

await collection.delete({});

  where: {

    $and: [// Eliminar con filtro

      { year: { $lt: 2020 } },await collection.delete({

      { category: 'old' }  where: { status: 'obsolete' }

    ]});

  }

});// Eliminar por contenido

```await collection.delete({

  whereDocument: { $contains: 'deprecated' }

## 🔍 Búsqueda Semántica});



### ✅ Query Básico// Eliminar con filtros complejos

```javascriptawait collection.delete({

// Búsqueda simple  where: {

const results = await collection.query({    $and: [

  queryTexts: ['machine learning algorithms'],      { category: 'temp' },

  nResults: 5      { created_at: { $lt: '2024-01-01' } }

});    ]

  }

console.log('Documentos encontrados:');});

results.documents[0].forEach((doc, i) => {```

  console.log(`${i + 1}. ${doc}`);

  console.log(`   Distancia: ${results.distances[0][i]}`);## 🔍 Búsqueda Semántica

});

### ✅ Query - Búsqueda por Similitud

// Múltiples queries simultáneas```javascript

const multiResults = await collection.query({// Búsqueda básica

  queryTexts: [const results = await collection.query({

    'deep learning',  queryTexts: ['machine learning algorithms'],

    'natural language processing',  nResults: 5

    'computer vision'});

  ],

  nResults: 3console.log('Documentos:', results.documents[0]);

});console.log('Distancias:', results.distances[0]);

console.log('Metadatas:', results.metadatas[0]);

// Cada query tiene sus propios resultados

multiResults.documents.forEach((docs, queryIndex) => {// Búsqueda con filtro de metadata

  console.log(`\nResultados para query ${queryIndex + 1}:`);const filtered = await collection.query({

  docs.forEach(doc => console.log('  -', doc));  queryTexts: ['database technology'],

});  nResults: 10,

```  where: { category: 'database' }

});

### ✅ Query con Embeddings Personalizados

```javascript// Búsqueda con filtros complejos

// Si ya tienes el embedding del queryconst advanced = await collection.query({

const queryEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]; // Tu embedding  queryTexts: ['artificial intelligence'],

  nResults: 5,

const results = await collection.query({  where: {

  queryEmbeddings: [queryEmbedding],    $and: [

  nResults: 10      { category: { $in: ['ml', 'ai', 'nlp'] } },

});      { author: { $ne: 'Anonymous' } },

```      { year: { $gte: 2023 } }

    ]

### ✅ Filtros de Metadata  }

```javascript});

// Filtro simple

const results = await collection.query({// Búsqueda con filtro de documento

  queryTexts: ['artificial intelligence'],const contentFilter = await collection.query({

  nResults: 5,  queryTexts: ['vector search'],

  where: { category: 'ai' }  nResults: 3,

});  whereDocument: { $contains: 'embedding' }

});

// Filtro con operadores

const advancedResults = await collection.query({// Múltiples consultas simultáneas

  queryTexts: ['recent developments'],const multiQuery = await collection.query({

  nResults: 10,  queryTexts: [

  where: {    'machine learning',

    $and: [    'data science',

      { year: { $gte: 2023 } },    'neural networks'

      { category: { $in: ['ai', 'ml', 'dl'] } }  ],

    ]  nResults: 3

  }});

});

// Acceder resultados de cada consulta

// Operadores disponiblesmultiQuery.documents.forEach((docs, i) => {

const withOperators = await collection.query({  console.log(`Resultados para consulta ${i + 1}:`, docs);

  queryTexts: ['technology'],});

  nResults: 5,```

  where: {

    year: { $gt: 2020, $lt: 2024 },      // Mayor que, menor que### ✅ Query con Embeddings Personalizados

    score: { $gte: 0.8, $lte: 1.0 },     // Mayor o igual, menor o igual```javascript

    category: { $ne: 'deprecated' },      // No igual// Buscar usando vector directo

    tags: { $in: ['popular', 'trending'] } // En listaconst vectorResults = await collection.query({

  }  queryEmbeddings: [[0.1, 0.2, 0.3, 0.4, 0.5]],

});  nResults: 5

});

// Operadores lógicos

const logicalResults = await collection.query({// Múltiples vectores

  queryTexts: ['database systems'],const multiVector = await collection.query({

  nResults: 5,  queryEmbeddings: [

  where: {    [0.1, 0.2, 0.3, 0.4, 0.5],

    $or: [    [0.2, 0.3, 0.4, 0.5, 0.6],

      { category: 'database' },    [0.3, 0.4, 0.5, 0.6, 0.7]

      { tags: { $in: ['storage', 'query'] } }  ],

    ]  nResults: 3

  }});

});```

```

## 🎯 Filtros Avanzados

### ✅ Filtros de Documentos

```javascript### Operadores de Metadata

// Filtrar por contenido del documento```javascript

const results = await collection.query({// $eq - Igual

  queryTexts: ['search query'],await collection.query({

  nResults: 10,  queryTexts: ['search query'],

  whereDocument: {  where: { category: { $eq: 'ml' } }

    $contains: 'vector'  // Documentos que contienen "vector"});

  }

});// $ne - No igual

await collection.query({

// Combinación de filtros  queryTexts: ['search query'],

const combinedResults = await collection.query({  where: { status: { $ne: 'deleted' } }

  queryTexts: ['AI applications'],});

  nResults: 5,

  where: { category: 'ai' },// $gt, $gte - Mayor que, mayor o igual

  whereDocument: {await collection.query({

    $and: [  queryTexts: ['search query'],

      { $contains: 'machine learning' },  where: { views: { $gte: 100 } }

      { $not_contains: 'deprecated' }});

    ]

  }// $lt, $lte - Menor que, menor o igual

});await collection.query({

```  queryTexts: ['search query'],

  where: { priority: { $lt: 5 } }

### ✅ Controlar Resultados});

```javascript

// Incluir/excluir campos// $in - En lista

const results = await collection.query({await collection.query({

  queryTexts: ['search query'],  queryTexts: ['search query'],

  nResults: 5,  where: { category: { $in: ['ml', 'ai', 'nlp'] } }

  include: ['documents', 'metadatas', 'distances']  // No incluir embeddings});

});

// $nin - No en lista

// Solo IDs y distancias (más rápido)await collection.query({

const minimalResults = await collection.query({  queryTexts: ['search query'],

  queryTexts: ['query'],  where: { status: { $nin: ['deleted', 'archived'] } }

  nResults: 10,});

  include: ['distances']

});// $and - Y lógico

```await collection.query({

  queryTexts: ['search query'],

## 🎯 Funciones de Embedding  where: {

    $and: [

### ✅ Embedding Function por Defecto      { category: 'ml' },

```javascript      { views: { $gte: 100 } }

// ChromaDB usa all-MiniLM-L6-v2 por defecto    ]

const collection = await client.createCollection({  }

  name: 'default_embeddings'});

});

// Genera embeddings automáticamente al agregar documentos// $or - O lógico

```await collection.query({

  queryTexts: ['search query'],

### ✅ OpenAI Embeddings  where: {

```javascript    $or: [

import { OpenAIEmbeddingFunction } from 'chromadb';      { category: 'ml' },

      { category: 'ai' }

const embedder = new OpenAIEmbeddingFunction({    ]

  openai_api_key: process.env.OPENAI_API_KEY,  }

  openai_model: 'text-embedding-ada-002'});

});```



const collection = await client.createCollection({### Operadores de Documento

  name: 'openai_embeddings',```javascript

  embeddingFunction: embedder// $contains - Contiene texto

});await collection.query({

  queryTexts: ['search query'],

await collection.add({  whereDocument: { $contains: 'machine learning' }

  ids: ['doc1'],});

  documents: ['This will use OpenAI embeddings']

});// $not_contains - No contiene

```await collection.query({

  queryTexts: ['search query'],

### ✅ Cohere Embeddings  whereDocument: { $not_contains: 'deprecated' }

```javascript});

import { CohereEmbeddingFunction } from 'chromadb';

// Combinación con metadata

const embedder = new CohereEmbeddingFunction({await collection.query({

  cohere_api_key: process.env.COHERE_API_KEY  queryTexts: ['AI applications'],

});  where: { category: 'ml' },

  whereDocument: { $contains: 'neural network' }

const collection = await client.createCollection({});

  name: 'cohere_embeddings',```

  embeddingFunction: embedder

});## 🧠 Funciones de Embedding

```

### ✅ Embedding Functions Integradas

### ✅ Google PaLM Embeddings```javascript

```javascriptimport { 

import { GooglePalmEmbeddingFunction } from 'chromadb';  OpenAIEmbeddingFunction,

  CohereEmbeddingFunction,

const embedder = new GooglePalmEmbeddingFunction({  HuggingFaceEmbeddingFunction,

  googleApiKey: process.env.GOOGLE_API_KEY  GoogleGenerativeAiEmbeddingFunction

});} from 'chromadb';



const collection = await client.createCollection({// OpenAI Embeddings

  name: 'palm_embeddings',const openaiEf = new OpenAIEmbeddingFunction({

  embeddingFunction: embedder  openai_api_key: process.env.OPENAI_API_KEY,

});  model_name: 'text-embedding-3-small'

```});



### ✅ HuggingFace Embeddingsconst openaiCollection = await client.createCollection({

```javascript  name: 'openai_docs',

import { HuggingFaceEmbeddingFunction } from 'chromadb';  embeddingFunction: openaiEf

});

const embedder = new HuggingFaceEmbeddingFunction({

  api_key: process.env.HUGGINGFACE_API_KEY,// Cohere Embeddings

  model_name: 'sentence-transformers/all-mpnet-base-v2'const cohereEf = new CohereEmbeddingFunction({

});  cohere_api_key: process.env.COHERE_API_KEY,

  model: 'embed-english-v3.0'

const collection = await client.createCollection({});

  name: 'huggingface_embeddings',

  embeddingFunction: embedderconst cohereCollection = await client.createCollection({

});  name: 'cohere_docs',

```  embeddingFunction: cohereEf

});

## 📖 Casos de Uso Prácticos

// HuggingFace Embeddings

### RAG (Retrieval Augmented Generation)const hfEf = new HuggingFaceEmbeddingFunction({

```javascript  huggingface_api_key: process.env.HF_API_KEY,

import { ChromaClient } from 'chromadb';  model_name: 'sentence-transformers/all-MiniLM-L6-v2'

import { Configuration, OpenAIApi } from 'openai';});



const chroma = new ChromaClient({ path: 'http://localhost:8000' });const hfCollection = await client.createCollection({

const collection = await chroma.getOrCreateCollection({ name: 'knowledge_base' });  name: 'hf_docs',

  embeddingFunction: hfEf

// 1. Agregar documentos a la base de conocimiento});

await collection.add({

  ids: ['kb1', 'kb2', 'kb3'],// Google Generative AI Embeddings

  documents: [const googleEf = new GoogleGenerativeAiEmbeddingFunction({

    'ChromaDB is a vector database designed for AI applications.',  google_api_key: process.env.GOOGLE_API_KEY,

    'Vector embeddings represent semantic meaning of text.',  model_name: 'models/embedding-001'

    'Similarity search finds related content efficiently.'});

  ]

});const googleCollection = await client.createCollection({

  name: 'google_docs',

// 2. Buscar contexto relevante  embeddingFunction: googleEf

async function getRelevantContext(query, nResults = 3) {});

  const results = await collection.query({```

    queryTexts: [query],

    nResults: nResults## 📖 Patrones Comunes

  });

  return results.documents[0].join('\n\n');### RAG (Retrieval Augmented Generation)

}```javascript

import { ChromaClient } from 'chromadb';

// 3. Generar respuesta con contextoimport OpenAI from 'openai';

async function answerWithRAG(question) {

  const context = await getRelevantContext(question);const chroma = new ChromaClient({ path: 'http://localhost:8000' });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const openai = new OpenAIApi(new Configuration({

    apiKey: process.env.OPENAI_API_KEY// Preparar base de conocimiento

  }));const knowledge = await chroma.getOrCreateCollection({ name: 'knowledge_base' });

  

  const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;await knowledge.add({

    ids: ['k1', 'k2', 'k3'],

  const response = await openai.createCompletion({  documents: [

    model: 'text-davinci-003',    'ChromaDB is an open-source vector database for AI applications',

    prompt: prompt,    'Vector embeddings represent text as numerical vectors',

    max_tokens: 200    'Semantic search finds similar content based on meaning'

  });  ]

  });

  return response.data.choices[0].text.trim();

}// Función RAG

async function ragQuery(question) {

// Uso  // 1. Buscar contexto relevante

const answer = await answerWithRAG('What is ChromaDB?');  const searchResults = await knowledge.query({

console.log('Answer:', answer);    queryTexts: [question],

```    nResults: 3

  });

### Sistema de Recomendación  

```javascript  const context = searchResults.documents[0].join('\n\n');

import { ChromaClient } from 'chromadb';  

  // 2. Generar respuesta con contexto

const client = new ChromaClient({ path: 'http://localhost:8000' });  const completion = await openai.chat.completions.create({

const collection = await client.getOrCreateCollection({ name: 'products' });    model: 'gpt-4',

    messages: [

// Agregar productos      {

await collection.add({        role: 'system',

  ids: ['prod1', 'prod2', 'prod3', 'prod4'],        content: 'Answer questions based only on the provided context.'

  documents: [      },

    'Laptop with high performance processor and 16GB RAM',      {

    'Wireless mouse ergonomic design with USB-C',        role: 'user',

    'Mechanical keyboard with RGB lighting',        content: `Context:\n${context}\n\nQuestion: ${question}`

    'External SSD 1TB high-speed storage'      }

  ],    ]

  metadatas: [  });

    { category: 'computers', price: 1200 },  

    { category: 'accessories', price: 30 },  return {

    { category: 'accessories', price: 80 },    answer: completion.choices[0].message.content,

    { category: 'storage', price: 150 }    sources: searchResults.documents[0],

  ]    distances: searchResults.distances[0]

});  };

}

// Recomendar productos similares

async function recommendSimilar(productId, nResults = 3) {// Usar RAG

  // Obtener producto originalconst result = await ragQuery('What is ChromaDB?');

  const product = await collection.get({ ids: [productId] });console.log('Answer:', result.answer);

  console.log('Sources:', result.sources);

  // Buscar similares usando el embedding del producto```

  const similar = await collection.query({

    queryEmbeddings: product.embeddings,### Semantic Search Application

    nResults: nResults + 1,  // +1 porque incluye el producto original```javascript

    where: { price: { $lt: 2000 } }  // Filtro de precio// Sistema de búsqueda semántica

  });class SemanticSearchEngine {

    constructor(client, collectionName) {

  // Excluir el producto original    this.client = client;

  return similar.documents[0].slice(1);    this.collectionName = collectionName;

}    this.collection = null;

  }

const recommendations = await recommendSimilar('prod1');  

console.log('Productos similares:', recommendations);  async initialize() {

```    this.collection = await this.client.getOrCreateCollection({

      name: this.collectionName,

### Búsqueda Semántica de Documentos      metadata: { description: 'Semantic search engine' }

```javascript    });

import { ChromaClient } from 'chromadb';  }

import fs from 'fs/promises';  

  async indexDocuments(documents) {

const client = new ChromaClient({ path: 'http://localhost:8000' });    const ids = documents.map((_, i) => `doc_${i}`);

const collection = await client.getOrCreateCollection({ name: 'documents' });    const texts = documents.map(d => d.text);

    const metadatas = documents.map(d => ({

// Indexar documentos      title: d.title,

async function indexDocuments(folderPath) {      url: d.url,

  const files = await fs.readdir(folderPath);      category: d.category

      }));

  for (const file of files) {    

    const content = await fs.readFile(`${folderPath}/${file}`, 'utf-8');    await this.collection.add({ ids, documents: texts, metadatas });

      }

    await collection.add({  

      ids: [file],  async search(query, options = {}) {

      documents: [content],    const {

      metadatas: [{      limit = 10,

        filename: file,      category = null,

        indexed_at: new Date().toISOString()      minRelevance = 0.5

      }]    } = options;

    });    

  }    const whereClause = category ? { category } : undefined;

}    

    const results = await this.collection.query({

// Buscar documentos relevantes      queryTexts: [query],

async function searchDocuments(query, nResults = 5) {      nResults: limit,

  const results = await collection.query({      where: whereClause

    queryTexts: [query],    });

    nResults: nResults,    

    include: ['documents', 'metadatas', 'distances']    // Filtrar por relevancia mínima

  });    const filtered = results.documents[0]

        .map((doc, i) => ({

  return results.documents[0].map((doc, i) => ({        document: doc,

    content: doc,        metadata: results.metadatas[0][i],

    filename: results.metadatas[0][i].filename,        relevance: 1 - results.distances[0][i]

    relevance: 1 - results.distances[0][i]  // Convertir distancia a score      }))

  }));      .filter(r => r.relevance >= minRelevance);

}    

    return filtered;

// Uso  }

await indexDocuments('./docs');}

const results = await searchDocuments('machine learning tutorial');

console.log('Documentos encontrados:', results);// Uso

```const engine = new SemanticSearchEngine(client, 'search_engine');

await engine.initialize();

### Deduplicación de Contenido

```javascriptawait engine.indexDocuments([

import { ChromaClient } from 'chromadb';  { 

    text: 'Machine learning enables computers to learn from data',

const client = new ChromaClient({ path: 'http://localhost:8000' });    title: 'ML Basics',

const collection = await client.getOrCreateCollection({ name: 'unique_content' });    url: '/ml-basics',

    category: 'education'

async function addIfUnique(id, document, threshold = 0.95) {  },

  // Buscar contenido similar  {

  const similar = await collection.query({    text: 'Deep neural networks power modern AI',

    queryTexts: [document],    title: 'Deep Learning',

    nResults: 1    url: '/deep-learning',

  });    category: 'advanced'

    }

  // Si no hay resultados o la similitud es baja, agregar]);

  if (similar.documents[0].length === 0 || similar.distances[0][0] > (1 - threshold)) {

    await collection.add({const results = await engine.search('artificial intelligence', {

      ids: [id],  limit: 5,

      documents: [document]  minRelevance: 0.7

    });});

    return { added: true, duplicate: false };```

  }

  ### Document Clustering

  return {```javascript

    added: false,// Agrupar documentos similares

    duplicate: true,async function clusterDocuments(collection, numClusters = 5) {

    duplicateOf: similar.ids[0][0],  // Obtener todos los documentos con embeddings

    similarity: 1 - similar.distances[0][0]  const allDocs = await collection.get({

  };    include: ['documents', 'embeddings', 'metadatas']

}  });

  

// Uso  // Aquí usarías un algoritmo de clustering como K-means

const result1 = await addIfUnique('doc1', 'ChromaDB is a vector database');  // Para simplificar, agrupamos por similitud

console.log(result1); // { added: true, duplicate: false }  const clusters = [];

  

const result2 = await addIfUnique('doc2', 'ChromaDB is a vector database for AI');  for (const doc of allDocs.documents) {

console.log(result2); // { added: false, duplicate: true, ... }    // Buscar documentos similares

```    const similar = await collection.query({

      queryTexts: [doc],

## 🧪 Testing      nResults: 10

    });

```javascript    

import { test } from 'node:test';    clusters.push({

import assert from 'node:assert/strict';      document: doc,

import { ChromaClient } from 'chromadb';      similar: similar.documents[0].slice(1) // Excluir el mismo documento

    });

test('ChromaDB operations', async () => {  }

  const client = new ChromaClient({ path: 'http://localhost:8000' });  

    return clusters;

  // Crear colección de prueba}

  const collection = await client.getOrCreateCollection({```

    name: 'test_collection'

  });## 🔌 Configuración Avanzada

  

  // Test add### Cliente con Autenticación

  await collection.add({```javascript

    ids: ['test1', 'test2'],import { ChromaClient } from 'chromadb';

    documents: ['First test document', 'Second test document']

  });// Cliente con autenticación básica

  const client = new ChromaClient({

  const count = await collection.count();  path: 'http://localhost:8000',

  assert.equal(count, 2);  auth: {

      provider: 'basic',

  // Test query    credentials: 'username:password'

  const results = await collection.query({  }

    queryTexts: ['test document'],});

    nResults: 2

  });// Cliente con token

  const tokenClient = new ChromaClient({

  assert.equal(results.documents[0].length, 2);  path: 'http://localhost:8000',

    auth: {

  // Cleanup    provider: 'token',

  await client.deleteCollection({ name: 'test_collection' });    credentials: 'your-api-token'

});  }

```});

```

## ⚡ Características ChromaDB

### Configuración de Distancia

- **Open Source**: Código abierto y gratuito```javascript

- **Embeddings automáticos**: Genera vectores sin configuración// Diferentes métricas de distancia

- **Multi-modal**: Soporta texto, imágenes y másconst l2Collection = await client.createCollection({

- **Filtros avanzados**: Metadata y document filtering  name: 'l2_metrics',

- **Múltiples backends**: En memoria, persistente, distribuido  metadata: { 

- **Integraciones**: OpenAI, Cohere, HuggingFace, LangChain    'hnsw:space': 'l2'  // Distancia euclidiana (default)

- **API simple**: Fácil de usar y aprender  }

- **Escalable**: Desde prototipo hasta producción});



## 📄 Casos de Uso Idealesconst cosineCollection = await client.createCollection({

  name: 'cosine_metrics',

- **RAG para LLMs**: Retrieval Augmented Generation  metadata: { 

- **Búsqueda semántica**: Documentos, productos, contenido    'hnsw:space': 'cosine'  // Similitud coseno

- **Chatbots**: Búsqueda de respuestas relevantes  }

- **Sistemas de recomendación**: Contenido similar});

- **Análisis de similitud**: Detección de duplicados

- **Clasificación**: Clustering de documentosconst ipCollection = await client.createCollection({

- **Q&A Systems**: Preguntas y respuestas  name: 'ip_metrics',

  metadata: { 

## 📄 Licencia    'hnsw:space': 'ip'  // Producto interno

  }

MPL-2.0});

```

## 🤝 Contribuciones

## 🧪 Testing

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en el repositorio.

```javascript

## 🔗 Enlacesimport { test } from 'node:test';

import assert from 'node:assert/strict';

- [@querybuilder/core](../core/README.md)import { ChromaClient } from 'chromadb';

- [@querybuilder/mongodb](../mongodb/README.md)

- [@querybuilder/redis](../redis/README.md)test('ChromaDB operations', async () => {

- [@querybuilder/cassandra](../cassandra/README.md)  const client = new ChromaClient({ path: 'http://localhost:8000' });

- [ChromaDB Documentation](https://docs.trychroma.com/)  

- [ChromaDB GitHub](https://github.com/chroma-core/chroma)  // Crear colección de prueba

- [LangChain + ChromaDB](https://python.langchain.com/docs/integrations/vectorstores/chroma)  const collection = await client.createCollection({

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
