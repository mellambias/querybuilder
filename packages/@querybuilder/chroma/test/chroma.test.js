/*
Tests for Chroma Vector Database Integration
Testing embeddings, similarity search, and vector operations
*/

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Chroma from '../Chroma.js';

describe('Chroma Vector Database Tests', () => {
  let chroma;
  let collection;
  const testCollectionName = 'test_collection';

  beforeEach(async () => {
    chroma = new Chroma({
      path: 'http://localhost:8000',
      tenant: 'test_tenant',
      database: 'test_database'
    });

    // Crear colección de prueba
    collection = await chroma.createCollection({
      name: testCollectionName,
      metadata: { description: 'Test collection for unit tests' }
    });
  });

  afterEach(async () => {
    // Limpiar después de cada test
    try {
      await chroma.deleteCollection(testCollectionName);
    } catch (error) {
      // Ignorar errores si la colección ya fue eliminada
    }
  });

  // ================================
  // Tests de Conexión y Cliente
  // ================================

  describe('Client Connection', () => {
    test('should connect to Chroma server', () => {
      expect(chroma).toBeDefined();
      expect(chroma.client).toBeDefined();
    });

    test('should have correct configuration', () => {
      expect(chroma.config.path).toBe('http://localhost:8000');
      expect(chroma.config.tenant).toBe('test_tenant');
      expect(chroma.config.database).toBe('test_database');
    });
  });

  // ================================
  // Tests de Colecciones
  // ================================

  describe('Collection Management', () => {
    test('should create collection', async () => {
      const newCollection = await chroma.createCollection({
        name: 'new_test_collection',
        metadata: { test: true }
      });

      expect(newCollection).toBeDefined();
      expect(newCollection.name).toBe('new_test_collection');
    });

    test('should get existing collection', async () => {
      const retrievedCollection = await chroma.getCollection(testCollectionName);
      expect(retrievedCollection).toBeDefined();
      expect(retrievedCollection.name).toBe(testCollectionName);
    });

    test('should list collections', async () => {
      const collections = await chroma.listCollections();
      expect(Array.isArray(collections)).toBe(true);
      expect(collections.some(c => c.name === testCollectionName)).toBe(true);
    });

    test('should delete collection', async () => {
      await chroma.createCollection({ name: 'temp_collection' });
      await chroma.deleteCollection('temp_collection');

      const collections = await chroma.listCollections();
      expect(collections.some(c => c.name === 'temp_collection')).toBe(false);
    });
  });

  // ================================
  // Tests de Operaciones CRUD
  // ================================

  describe('CRUD Operations', () => {
    const testDocuments = [
      'This is a test document about machine learning',
      'Another document discussing natural language processing',
      'A third document about vector databases and embeddings'
    ];

    const testIds = ['doc1', 'doc2', 'doc3'];
    const testMetadatas = [
      { category: 'ml', importance: 'high' },
      { category: 'nlp', importance: 'medium' },
      { category: 'db', importance: 'high' }
    ];

    test('should add documents to collection', async () => {
      const result = await chroma.add({
        collection: testCollectionName,
        ids: testIds,
        documents: testDocuments,
        metadatas: testMetadatas
      });

      expect(result.success).toBe(true);
    });

    test('should get documents from collection', async () => {
      // Primero añadir documentos
      await chroma.add({
        collection: testCollectionName,
        ids: testIds,
        documents: testDocuments,
        metadatas: testMetadatas
      });

      // Luego obtenerlos
      const result = await chroma.get({
        collection: testCollectionName,
        ids: ['doc1', 'doc2']
      });

      expect(result.ids).toHaveLength(2);
      expect(result.documents).toHaveLength(2);
      expect(result.metadatas).toHaveLength(2);
    });

    test('should update documents in collection', async () => {
      // Añadir documentos iniciales
      await chroma.add({
        collection: testCollectionName,
        ids: testIds,
        documents: testDocuments,
        metadatas: testMetadatas
      });

      // Actualizar uno de ellos
      const result = await chroma.update({
        collection: testCollectionName,
        ids: ['doc1'],
        documents: ['Updated document about machine learning'],
        metadatas: [{ category: 'ml', importance: 'very_high', updated: true }]
      });

      expect(result.success).toBe(true);

      // Verificar que se actualizó
      const updated = await chroma.get({
        collection: testCollectionName,
        ids: ['doc1']
      });

      expect(updated.documents[0]).toBe('Updated document about machine learning');
      expect(updated.metadatas[0].updated).toBe(true);
    });

    test('should delete documents from collection', async () => {
      // Añadir documentos
      await chroma.add({
        collection: testCollectionName,
        ids: testIds,
        documents: testDocuments,
        metadatas: testMetadatas
      });

      // Eliminar uno
      const result = await chroma.delete({
        collection: testCollectionName,
        ids: ['doc2']
      });

      expect(result.success).toBe(true);

      // Verificar que se eliminó
      const remaining = await chroma.get({
        collection: testCollectionName
      });

      expect(remaining.ids).not.toContain('doc2');
      expect(remaining.ids).toHaveLength(2);
    });

    test('should upsert documents (insert or update)', async () => {
      // Upsert nuevos documentos
      const result = await chroma.upsert({
        collection: testCollectionName,
        ids: ['upsert1', 'upsert2'],
        documents: ['New document 1', 'New document 2'],
        metadatas: [{ type: 'upsert' }, { type: 'upsert' }]
      });

      expect(result.success).toBe(true);

      // Upsert documentos existentes (actualizar)
      const updateResult = await chroma.upsert({
        collection: testCollectionName,
        ids: ['upsert1'],
        documents: ['Updated document 1'],
        metadatas: [{ type: 'upsert', updated: true }]
      });

      expect(updateResult.success).toBe(true);

      // Verificar resultado
      const final = await chroma.get({
        collection: testCollectionName,
        ids: ['upsert1']
      });

      expect(final.documents[0]).toBe('Updated document 1');
      expect(final.metadatas[0].updated).toBe(true);
    });
  });

  // ================================
  // Tests de Búsquedas y Queries
  // ================================

  describe('Search and Query Operations', () => {
    beforeEach(async () => {
      // Preparar datos de prueba para búsquedas
      await chroma.add({
        collection: testCollectionName,
        ids: ['search1', 'search2', 'search3', 'search4'],
        documents: [
          'Machine learning algorithms for data analysis',
          'Natural language processing with transformers',
          'Deep learning neural networks and backpropagation',
          'Computer vision and image recognition systems'
        ],
        metadatas: [
          { domain: 'ml', complexity: 'medium' },
          { domain: 'nlp', complexity: 'high' },
          { domain: 'dl', complexity: 'high' },
          { domain: 'cv', complexity: 'medium' }
        ]
      });
    });

    test('should perform semantic search', async () => {
      const results = await chroma.query({
        collection: testCollectionName,
        queryTexts: ['artificial intelligence and machine learning'],
        nResults: 3
      });

      expect(results.ids).toBeDefined();
      expect(results.documents).toBeDefined();
      expect(results.distances).toBeDefined();
      expect(results.ids[0]).toHaveLength(3); // 3 resultados
    });

    test('should perform filtered search', async () => {
      const results = await chroma.query({
        collection: testCollectionName,
        queryTexts: ['neural networks'],
        nResults: 5,
        where: { complexity: 'high' }
      });

      expect(results.ids[0].length).toBeLessThanOrEqual(5);
      // Todos los resultados deben tener complexity: 'high'
      results.metadatas[0].forEach(metadata => {
        expect(metadata.complexity).toBe('high');
      });
    });

    test('should perform document content filtering', async () => {
      const results = await chroma.query({
        collection: testCollectionName,
        queryTexts: ['algorithms'],
        nResults: 10,
        whereDocument: { $contains: 'learning' }
      });

      expect(results.documents[0].length).toBeGreaterThan(0);
      // Verificar que los documentos contienen 'learning'
      results.documents[0].forEach(doc => {
        expect(doc.toLowerCase()).toContain('learning');
      });
    });

    test('should get nearest neighbors with embeddings', async () => {
      // Primero obtener un embedding de referencia
      const referenceResults = await chroma.get({
        collection: testCollectionName,
        ids: ['search1'],
        include: ['embeddings']
      });

      expect(referenceResults.embeddings).toBeDefined();
      expect(referenceResults.embeddings[0]).toBeDefined();

      // Usar ese embedding para búsqueda de vecinos
      const neighborResults = await chroma.query({
        collection: testCollectionName,
        queryEmbeddings: [referenceResults.embeddings[0]],
        nResults: 3
      });

      expect(neighborResults.ids[0]).toHaveLength(3);
      expect(neighborResults.ids[0][0]).toBe('search1'); // El más similar debe ser él mismo
    });

    test('should count documents in collection', async () => {
      const count = await chroma.count({
        collection: testCollectionName
      });

      expect(count).toBe(4); // 4 documentos añadidos en beforeEach
    });

    test('should peek at collection contents', async () => {
      const peek = await chroma.peek({
        collection: testCollectionName,
        limit: 2
      });

      expect(peek.ids).toHaveLength(2);
      expect(peek.documents).toHaveLength(2);
      expect(peek.metadatas).toHaveLength(2);
    });
  });

  // ================================
  // Tests de Embeddings
  // ================================

  describe('Embedding Functions', () => {
    test('should use default embedding function', async () => {
      const collectionWithEmbedding = await chroma.createCollection({
        name: 'embedding_test',
        embeddingFunction: 'default'
      });

      const result = await chroma.add({
        collection: 'embedding_test',
        ids: ['embed1'],
        documents: ['Test document for embedding']
      });

      expect(result.success).toBe(true);

      // Limpiar
      await chroma.deleteCollection('embedding_test');
    });

    test('should handle custom embeddings', async () => {
      const customEmbedding = new Array(384).fill(0).map(() => Math.random());

      const result = await chroma.add({
        collection: testCollectionName,
        ids: ['custom_embed'],
        documents: ['Document with custom embedding'],
        embeddings: [customEmbedding]
      });

      expect(result.success).toBe(true);

      // Verificar que se guardó correctamente
      const retrieved = await chroma.get({
        collection: testCollectionName,
        ids: ['custom_embed'],
        include: ['embeddings']
      });

      expect(retrieved.embeddings[0]).toHaveLength(384);
    });
  });

  // ================================
  // Tests de Operaciones Avanzadas
  // ================================

  describe('Advanced Operations', () => {
    test('should perform hybrid search', async () => {
      await chroma.add({
        collection: testCollectionName,
        ids: ['hybrid1', 'hybrid2'],
        documents: ['AI and machine learning', 'Deep learning research'],
        metadatas: [{ year: 2023 }, { year: 2024 }]
      });

      const results = await chroma.hybridSearch({
        collection: testCollectionName,
        queryTexts: ['artificial intelligence'],
        nResults: 2,
        where: { year: { $gte: 2023 } }
      });

      expect(results.ids[0]).toHaveLength(2);
      expect(results.metadatas[0].every(m => m.year >= 2023)).toBe(true);
    });

    test('should perform batch operations', async () => {
      const operations = [
        {
          operation: 'add',
          params: {
            collection: testCollectionName,
            ids: ['batch1'],
            documents: ['Batch document 1']
          }
        },
        {
          operation: 'add',
          params: {
            collection: testCollectionName,
            ids: ['batch2'],
            documents: ['Batch document 2']
          }
        }
      ];

      const results = await chroma.batch(operations);
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  // ================================
  // Tests de Validación y Errores
  // ================================

  describe('Validation and Error Handling', () => {
    test('should validate data before operations', () => {
      const invalidData = {
        ids: ['id1'],
        documents: ['doc1', 'doc2'], // Diferente longitud
        metadatas: [{ meta: 1 }]
      };

      const validation = chroma.validateData(invalidData);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing collection error', async () => {
      try {
        await chroma.get({
          collection: 'non_existent_collection'
        });
        expect(false).toBe(true); // No debería llegar aquí
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should validate embedding dimensions', () => {
      const validEmbedding = new Array(384).fill(0.1);
      const invalidEmbedding = ['not', 'numbers'];

      expect(chroma.validateEmbedding(validEmbedding)).toBe(true);
      expect(chroma.validateEmbedding(invalidEmbedding)).toBe(false);
    });
  });

  // ================================
  // Tests de Utilities
  // ================================

  describe('Utility Functions', () => {
    test('should generate unique IDs', () => {
      const ids1 = chroma.generateIds(3, 'test');
      const ids2 = chroma.generateIds(3, 'test');

      expect(ids1).toHaveLength(3);
      expect(ids2).toHaveLength(3);
      expect(ids1[0]).not.toBe(ids2[0]); // Deben ser únicos
    });

    test('should convert text to documents', () => {
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const documents = chroma.textToDocument(texts);

      expect(documents).toHaveLength(3);
      expect(documents[0]).toHaveProperty('id');
      expect(documents[0]).toHaveProperty('document');
      expect(documents[0]).toHaveProperty('metadata');
    });

    test('should format query results', () => {
      const rawResults = {
        ids: [['id1', 'id2']],
        documents: [['doc1', 'doc2']],
        metadatas: [[{ meta: 1 }, { meta: 2 }]],
        distances: [[0.1, 0.2]]
      };

      const formatted = chroma.formatQueryResults(rawResults);

      expect(formatted.count).toBe(2);
      expect(formatted.ids).toBeDefined();
      expect(formatted.documents).toBeDefined();
      expect(formatted.metadatas).toBeDefined();
      expect(formatted.distances).toBeDefined();
    });
  });

  // ================================
  // Tests de Performance
  // ================================

  describe('Performance Tests', () => {
    test('should handle large batch operations', async () => {
      const batchSize = 100;
      const ids = Array.from({ length: batchSize }, (_, i) => `perf_${i}`);
      const documents = Array.from({ length: batchSize }, (_, i) => `Performance test document ${i}`);
      const metadatas = Array.from({ length: batchSize }, (_, i) => ({ index: i, batch: 'performance' }));

      const startTime = Date.now();

      const result = await chroma.add({
        collection: testCollectionName,
        ids,
        documents,
        metadatas
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000); // Menos de 10 segundos

      // Verificar que se añadieron todos
      const count = await chroma.count({
        collection: testCollectionName
      });

      expect(count).toBe(batchSize);
    });

    test('should handle concurrent operations', async () => {
      const concurrentOps = Array.from({ length: 5 }, (_, i) =>
        chroma.add({
          collection: testCollectionName,
          ids: [`concurrent_${i}`],
          documents: [`Concurrent document ${i}`],
          metadatas: [{ index: i, type: 'concurrent' }]
        })
      );

      const results = await Promise.all(concurrentOps);
      expect(results.every(r => r.success)).toBe(true);

      // Verificar que se añadieron todos
      const finalData = await chroma.get({
        collection: testCollectionName,
        where: { type: 'concurrent' }
      });

      expect(finalData.ids).toHaveLength(5);
    });
  });
});

// ================================
// Tests de Integración
// ================================

describe('Integration Tests', () => {
  let chroma;

  beforeEach(() => {
    chroma = new Chroma({
      path: 'http://localhost:8000'
    });
  });

  test('should work with real-world document workflow', async () => {
    const collectionName = 'real_world_test';

    // 1. Crear colección
    await chroma.createCollection({
      name: collectionName,
      metadata: { purpose: 'real-world testing' }
    });

    // 2. Añadir documentos reales
    const documents = [
      'The quick brown fox jumps over the lazy dog',
      'Machine learning is a subset of artificial intelligence',
      'Natural language processing helps computers understand human language',
      'Vector databases are optimized for similarity search',
      'Embeddings convert text into numerical representations'
    ];

    await chroma.add({
      collection: collectionName,
      ids: documents.map((_, i) => `real_${i}`),
      documents,
      metadatas: documents.map((_, i) => ({
        source: 'test',
        length: documents[i].length,
        index: i
      }))
    });

    // 3. Búsqueda semántica
    const searchResults = await chroma.query({
      collection: collectionName,
      queryTexts: ['AI and machine learning'],
      nResults: 3
    });

    expect(searchResults.ids[0]).toHaveLength(3);

    // 4. Filtrar por metadatos
    const filteredResults = await chroma.query({
      collection: collectionName,
      queryTexts: ['computer technology'],
      nResults: 5,
      where: { length: { $gt: 50 } }
    });

    expect(filteredResults.ids[0].length).toBeGreaterThan(0);

    // 5. Actualizar documentos
    await chroma.update({
      collection: collectionName,
      ids: ['real_0'],
      documents: ['The quick brown fox jumps over the lazy dog - updated version'],
      metadatas: [{ source: 'test', length: 58, index: 0, updated: true }]
    });

    // 6. Verificar actualización
    const updated = await chroma.get({
      collection: collectionName,
      ids: ['real_0']
    });

    expect(updated.metadatas[0].updated).toBe(true);

    // 7. Limpiar
    await chroma.deleteCollection(collectionName);
  });
});
