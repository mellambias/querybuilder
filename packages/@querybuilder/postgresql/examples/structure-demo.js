/**
 * Demostración de la nueva estructura optimizada del módulo PostgreSQL
 * Muestra cómo usar tanto la versión básica como la extendida
 */

// Ejemplo 1: Uso básico compatible con estándar SQL2006
import PostgreSQL from '@querybuilder/postgresql';

console.log('=== PostgreSQL Básico (Compatible con Core) ===');

const basicConfig = {
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  user: 'postgres',
  password: 'password'
};

const qb = new PostgreSQL(basicConfig);

// Métodos estándar que deben funcionar
async function basicExamples() {
  try {
    // Crear tabla con tipos estándar
    await qb.createTable('users', {
      id: 'SERIAL PRIMARY KEY',
      name: 'VARCHAR(100) NOT NULL',
      email: 'VARCHAR(255) UNIQUE',
      active: 'BOOLEAN DEFAULT true',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    });

    // Operaciones CRUD básicas
    await qb.insertInto('users', {
      name: 'John Doe',
      email: 'john@example.com'
    });

    const users = await qb.select(['name', 'email'])
      .from('users')
      .where('active', true)
      .limit(10)
      .get();

    console.log('Usuarios encontrados:', users);

    // Crear índices
    await qb.createIndex('users', 'email');

    // Crear roles básicos
    await qb.createRoles('app_user', ['SELECT', 'INSERT', 'UPDATE']);

  } catch (error) {
    console.error('Error en ejemplos básicos:', error.message);
  }
}

// Ejemplo 2: Uso de módulos específicos de forma granular
import * as PostgreSQLTypes from '@querybuilder/postgresql/types';
import * as PostgreSQLOperators from '@querybuilder/postgresql/operators';
import * as PostgreSQLFunctions from '@querybuilder/postgresql/functions';

console.log('\n=== Uso Granular de Módulos ===');

function granularExamples() {
  // Usando tipos específicos
  const jsonType = PostgreSQLTypes.JsonTypes.jsonb();
  const serialType = PostgreSQLTypes.SerialTypes.bigserial();
  const arrayType = PostgreSQLTypes.ArrayTypes.textArray();

  console.log('Tipos disponibles:', {
    json: jsonType,
    serial: serialType,
    array: arrayType
  });

  // Usando operadores específicos
  const jsonOps = PostgreSQLOperators.JsonOperators;
  const arrayOps = PostgreSQLOperators.ArrayOperators;

  console.log('Operadores JSON:', Object.keys(jsonOps));
  console.log('Operadores Array:', Object.keys(arrayOps));

  // Usando funciones específicas
  const jsonFunctions = PostgreSQLFunctions.JsonFunctions;
  const windowFunctions = PostgreSQLFunctions.WindowFunctions;

  console.log('Funciones JSON disponibles:', Object.keys(jsonFunctions));
  console.log('Funciones Window disponibles:', Object.keys(windowFunctions));
}

// Ejemplo 3: Uso avanzado con PostgreSQL Extended
import PostgreSQLExtended from '@querybuilder/postgresql/extended';

console.log('\n=== PostgreSQL Extendido (Características Avanzadas) ===');

const extendedQb = new PostgreSQLExtended(basicConfig);

async function advancedExamples() {
  try {
    // JSON/JSONB operations
    console.log('--- JSON/JSONB Operations ---');

    // Crear tabla con columnas JSON
    await extendedQb.createTable('products', {
      id: 'SERIAL PRIMARY KEY',
      name: 'VARCHAR(255)',
      metadata: 'JSONB',
      tags: 'TEXT[]',
      created_at: 'TIMESTAMP DEFAULT NOW()'
    });

    // Insertar datos con JSON
    await extendedQb.insertInto('products', {
      name: 'Laptop',
      metadata: JSON.stringify({
        brand: 'Dell',
        specs: { ram: '16GB', storage: '512GB SSD' },
        features: ['bluetooth', 'wifi', 'usb-c']
      }),
      tags: ['electronics', 'computers', 'portable']
    });

    // Búsquedas JSON avanzadas
    const laptops = await extendedQb.select()
      .from('products')
      .jsonContains('metadata', { brand: 'Dell' })
      .jsonExists('metadata->specs->ram')
      .get();

    console.log('Laptops Dell encontrados:', laptops);

    // Array operations
    console.log('\n--- Array Operations ---');

    const productsWithTags = await extendedQb.select()
      .from('products')
      .arrayContains('tags', ['electronics'])
      .get();

    console.log('Productos electrónicos:', productsWithTags);

    // UPSERT operations
    console.log('\n--- UPSERT Operations ---');

    await extendedQb.insertInto('products', {
      name: 'Updated Laptop',
      metadata: JSON.stringify({ brand: 'Dell', model: 'XPS 13' })
    }).onConflict('name')
      .doUpdate({
        metadata: 'excluded.metadata',
        updated_at: 'NOW()'
      });

    // Window Functions
    console.log('\n--- Window Functions ---');

    const rankedProducts = await extendedQb.select([
      'name',
      'created_at',
      extendedQb.rowNumber()
        .over()
        .orderBy('created_at', 'desc')
        .as('row_num'),
      extendedQb.lag('name')
        .over()
        .orderBy('created_at')
        .as('previous_product')
    ]).from('products').get();

    console.log('Productos rankeados:', rankedProducts);

    // Common Table Expressions (CTEs)
    console.log('\n--- Common Table Expressions ---');

    const categoryStats = await extendedQb.with('product_stats',
      extendedQb.select([
        extendedQb.raw("metadata->>'brand' as brand"),
        extendedQb.count('*').as('total_products'),
        extendedQb.raw("array_agg(name) as product_names")
      ]).from('products')
        .groupBy(extendedQb.raw("metadata->>'brand'"))
    ).select().from('product_stats').get();

    console.log('Estadísticas por marca:', categoryStats);

    // Full-text Search
    console.log('\n--- Full-text Search ---');

    const searchResults = await extendedQb.select([
      'name',
      'metadata',
      extendedQb.raw("ts_rank(to_tsvector('english', name), plainto_tsquery('laptop')) as rank")
    ]).from('products')
      .fullTextSearch('name', 'laptop', 'english')
      .orderBy('rank', 'desc')
      .get();

    console.log('Resultados de búsqueda:', searchResults);

  } catch (error) {
    console.error('Error en ejemplos avanzados:', error.message);
  }
}

// Ejemplo 4: Uso de constructores especializados
import { CTEBuilder, UpsertBuilder, WindowBuilder } from '@querybuilder/postgresql/features';

console.log('\n=== Constructores Especializados ===');

function builderExamples() {
  // CTE Builder
  const baseQuery = extendedQb.select(['department', extendedQb.avg('salary').as('avg_salary')])
    .from('employees')
    .groupBy('department');

  const cte = new CTEBuilder('dept_averages', baseQuery);
  console.log('CTE construido:', cte.toString());

  // UPSERT Builder
  const upsertData = { email: 'user@example.com', name: 'John Doe' };
  const upsert = new UpsertBuilder('users', upsertData)
    .onConflict('email')
    .doUpdate({ name: 'excluded.name', updated_at: 'NOW()' });
  console.log('UPSERT construido:', upsert.toString());

  // Window Builder
  const window = new WindowBuilder()
    .partitionBy('department')
    .orderBy('salary', 'desc')
    .rows('UNBOUNDED PRECEDING', 'CURRENT ROW');
  console.log('Window construida:', window.toString());
}

// Ejecutar ejemplos
async function runAllExamples() {
  console.log('🚀 Ejecutando demostraciones de la nueva estructura PostgreSQL...\n');

  // Ejemplos básicos
  await basicExamples();

  // Ejemplos granulares
  granularExamples();

  // Ejemplos avanzados
  await advancedExamples();

  // Ejemplos de constructores
  builderExamples();

  console.log('\n✅ Todas las demostraciones completadas!');
}

// Exportar para uso en otros archivos
export {
  basicExamples,
  granularExamples,
  advancedExamples,
  builderExamples,
  runAllExamples
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}