/**
 * MySQL Driver Test Setup - Real Database Configuration
 * 
 * Configuración para tests de integración usando una base de datos MySQL real
 * usando la configuración centralizada del core.
 */

import mysql from 'mysql2/promise';
import { randomBytes } from 'crypto';
import { config } from '../../../../config.js';

// Configuración de timeout para operaciones de base de datos
const DB_TIMEOUT = 30000;

/**
 * Configuración de la base de datos de pruebas desde config.js
 */
const TEST_CONFIG = config.testing.MySQL;
const DB_CONFIG = {
  host: TEST_CONFIG.params.host,
  port: TEST_CONFIG.params.port,
  user: TEST_CONFIG.params.username,
  password: TEST_CONFIG.params.password,
  database: TEST_CONFIG.params.database,
  multipleStatements: true,
  timezone: '+00:00'
};

// Pool de conexiones global para tests
let globalPool = null;

/**
 * Helper functions para los tests
 */
global.testHelpers = {
  /**
   * Obtener configuración de conexión para tests
   */
  getConnectionParams: () => ({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    username: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database: DB_CONFIG.database
  }),

  /**
   * Crear datos de prueba para ResultSetHeader
   */
  createResultSetHeader: (overrides = {}) => ({
    fieldCount: 0,
    affectedRows: 1,
    insertId: 0,
    serverStatus: 2,
    warningCount: 0,
    message: '',
    protocol41: true,
    changedRows: 0,
    info: '',
    ...overrides
  }),

  /**
   * Sleep function para tests asíncronos
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generar string aleatorio para tests
   */
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generar nombre único para tablas de test
   */
  uniqueTableName: (prefix = 'test_table') => {
    const randomSuffix = randomBytes(4).toString('hex');
    return `${prefix}_${randomSuffix}`;
  },

  /**
   * Crear tabla de prueba
   */
  createTestTable: (name = 'test_table') => `
    CREATE TABLE IF NOT EXISTS ${name} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      age INT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `,

  /**
   * Datos de prueba para insertar
   */
  getTestUsers: () => [
    { name: 'John Doe', email: 'john@example.com', age: 30 },
    { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
    { name: 'Alice Brown', email: 'alice@example.com', age: 28 },
    { name: 'Charlie Wilson', email: 'charlie@example.com', age: 42 }
  ],

  /**
   * Obtener conexión del pool global
   */
  async getConnection() {
    if (!globalPool) {
      throw new Error('Database pool not initialized. Call initializeDatabase() first.');
    }
    return await globalPool.getConnection();
  },

  /**
   * Ejecutar query directamente en la base de datos
   */
  async executeQuery(query, params = []) {
    const connection = await this.getConnection();
    try {
      const [rows, fields] = await connection.execute(query, params);
      return [rows, fields];
    } finally {
      connection.release();
    }
  },

  /**
   * Limpiar tabla específica
   */
  async cleanTable(tableName) {
    await this.executeQuery(`DELETE FROM ${tableName}`);
    await this.executeQuery(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
  },

  /**
   * Verificar si una tabla existe
   */
  async tableExists(tableName) {
    const [rows] = await this.executeQuery(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
      [DB_CONFIG.database, tableName]
    );
    return rows[0].count > 0;
  },

  /**
   * Eliminar tabla si existe
   */
  async dropTableIfExists(tableName) {
    await this.executeQuery(`DROP TABLE IF EXISTS ${tableName}`);
  }
};

/**
 * Inicializar la base de datos de pruebas
 */
export async function initializeDatabase() {
  try {
    // Crear pool de conexiones
    globalPool = mysql.createPool({
      ...DB_CONFIG,
      connectionLimit: 10,
      acquireTimeout: DB_TIMEOUT,
      timeout: DB_TIMEOUT
    });

    // Verificar conexión
    const connection = await globalPool.getConnection();
    await connection.ping();
    connection.release();

    console.log('🧪 MySQL Test Database initialized (MariaDB)');
    console.log(`📊 Test Database: ${DB_CONFIG.database}`);
    console.log(`🏠 Test Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`👤 Test User: ${DB_CONFIG.user}`);
    console.log(`🔧 Using configuration from: @querybuilder/core/config.js`);

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error.message);
    console.error('💡 Make sure MySQL/MariaDB is running and configured correctly:');
    console.error('   - Check core/config.js testing.MySQL configuration');
    console.error('   - Verify MariaDB is running on the configured port');
    console.error('   - Ensure user has permissions to create databases');
    throw error;
  }
}

/**
 * Limpiar y cerrar conexiones de base de datos
 */
export async function cleanupDatabase() {
  if (globalPool) {
    await globalPool.end();
    globalPool = null;
    console.log('🧹 Database connections closed');
  }
}

/**
 * Crear la base de datos de pruebas si no existe
 */
export async function createTestDatabase() {
  const adminConfig = { ...DB_CONFIG };
  delete adminConfig.database;

  const adminConnection = await mysql.createConnection(adminConfig);

  try {
    await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    console.log(`📊 Test database '${DB_CONFIG.database}' created or verified`);
  } finally {
    await adminConnection.end();
  }
}

/**
 * Función simple de testing
 */
export function test(description, testFunction) {
  return {
    description,
    testFunction,
    async run() {
      const startTime = Date.now();
      try {
        await testFunction();
        const duration = Date.now() - startTime;
        console.log(`✅ ${description} (${duration}ms)`);
        return { success: true, duration, error: null };
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${description} (${duration}ms)`);
        console.error(`   Error: ${error.message}`);
        return { success: false, duration, error };
      }
    }
  };
}

/**
 * Función describe para agrupar tests
 */
export function describe(suiteName, suiteFunction) {
  return {
    suiteName,
    suiteFunction,
    async run() {
      console.log(`\n📋 ${suiteName}`);
      const results = [];
      const context = { tests: [] };

      // Ejecutar la función del suite para recopilar tests
      await suiteFunction(context);

      // Ejecutar todos los tests
      for (const test of context.tests) {
        const result = await test.run();
        results.push({ description: test.description, ...result });
      }

      return results;
    }
  };
}

// Configuración de warnings
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'ExperimentalWarning') {
    return; // Ignorar warnings experimentales en tests
  }
  console.warn(warning);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down tests...');
  await cleanupDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down tests...');
  await cleanupDatabase();
  process.exit(0);
});
