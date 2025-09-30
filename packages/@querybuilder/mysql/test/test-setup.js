/**
 * Jest Setup File for MySQL QueryBuilder Tests
 * 
 * Este archivo se ejecuta antes de todos los tests y configura
 * el entorno de testing para los módulos MySQL del QueryBuilder.
 */

import { jest } from '@jest/globals';

// Configuración global de timeouts para tests que involucran base de datos
jest.setTimeout(30000);

// Mock global para mysql2/promise si no está disponible
const mockMysql2 = {
  createConnection: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue([[], []]),
    close: jest.fn().mockResolvedValue(),
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue()
  }),
  createPool: jest.fn().mockReturnValue({
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue([[], []]),
      release: jest.fn(),
      close: jest.fn().mockResolvedValue()
    }),
    end: jest.fn().mockResolvedValue()
  })
};

// Variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.MYSQL_TEST_HOST = process.env.MYSQL_TEST_HOST || 'localhost';
process.env.MYSQL_TEST_PORT = process.env.MYSQL_TEST_PORT || '3306';
process.env.MYSQL_TEST_USER = process.env.MYSQL_TEST_USER || 'test_user';
process.env.MYSQL_TEST_PASSWORD = process.env.MYSQL_TEST_PASSWORD || 'test_password';
process.env.MYSQL_TEST_DATABASE = process.env.MYSQL_TEST_DATABASE || 'test_db';

// Configuración global para mocks
global.mockMysql2 = mockMysql2;

// Helper functions para tests
global.testHelpers = {
  /**
   * Crear parámetros de conexión de prueba
   */
  createTestConnectionParams: () => ({
    host: process.env.MYSQL_TEST_HOST,
    port: parseInt(process.env.MYSQL_TEST_PORT),
    username: process.env.MYSQL_TEST_USER,
    password: process.env.MYSQL_TEST_PASSWORD,
    database: process.env.MYSQL_TEST_DATABASE
  }),

  /**
   * Crear datos de prueba para ResultSetHeader
   */
  createMockResultSetHeader: (overrides = {}) => ({
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
   * Crear datos de prueba para SELECT results
   */
  createMockSelectResult: (rows = [], fields = []) => [
    rows,
    fields.map(field => ({
      name: field,
      type: 'VARCHAR',
      length: 255
    }))
  ],

  /**
   * Crear error SQL de prueba
   */
  createMockSqlError: (message = 'Test SQL Error', code = 'ER_SYNTAX_ERROR') => {
    const error = new Error(message);
    error.code = code;
    error.errno = 1064;
    error.sqlState = '42000';
    error.sqlMessage = message;
    return error;
  },

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
    )
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
  ]
};

// Console override para tests (opcional, para reducir ruido en output)
const originalConsole = { ...console };

global.silenceConsole = () => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.info = jest.fn();
};

global.restoreConsole = () => {
  Object.assign(console, originalConsole);
};

// Cleanup function para después de cada test
global.cleanupTest = async () => {
  // Limpiar mocks
  jest.clearAllMocks();
  
  // Restaurar console si fue silenciado
  global.restoreConsole();
  
  // Limpiar variables de entorno específicas de test
  delete process.env.TEST_MYSQL_CONNECTION;
  delete process.env.TEST_QUERY_TIMEOUT;
};

// Auto-cleanup después de cada test
afterEach(async () => {
  await global.cleanupTest();
});

// Configuración de warnings
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'ExperimentalWarning') {
    return; // Ignorar warnings experimentales en tests
  }
  console.warn(warning);
});

console.log('🧪 MySQL QueryBuilder Test Environment initialized');
console.log(`📊 Test Database: ${process.env.MYSQL_TEST_DATABASE}`);
console.log(`🏠 Test Host: ${process.env.MYSQL_TEST_HOST}:${process.env.MYSQL_TEST_PORT}`);