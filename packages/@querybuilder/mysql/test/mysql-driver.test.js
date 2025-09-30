/**
 * Tests para MySqlDriver
 * 
 * Este archivo contiene tests comprehensivos para la clase MySqlDriver,
 * incluyendo conexión, ejecución de queries, manejo de transacciones,
 * gestión de errores y cierre de conexiones.
 */

import { jest } from '@jest/globals';
import MySqlDriver from '../drivers/MySqlDriver.js';
import MysqlResult from '../results/MysqlResult.js';

// Mock de mysql2/promise
const mockMysql = {
  createConnection: jest.fn(),
};

// Mock de la conexión MySQL
const mockConnection = {
  query: jest.fn(),
  close: jest.fn(),
};

// Mock de MysqlResult
jest.mock('../results/MysqlResult.js', () => {
  return jest.fn().mockImplementation((query, response) => ({
    query,
    response,
    info: '',
    error: '',
    errorStatus: 0,
    affectedRows: 0,
    serverStatus: 0,
    warningStatus: 0
  }));
});

jest.mock('mysql2/promise', () => mockMysql);

describe('MySqlDriver', () => {
  let driver;
  let connectionParams;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
    
    // Parámetros de conexión de prueba
    connectionParams = {
      host: 'localhost',
      port: 3306,
      username: 'testuser',
      password: 'testpass',
      database: 'testdb'
    };

    // Configurar mock de conexión
    mockMysql.createConnection.mockResolvedValue(mockConnection);
    mockConnection.query.mockResolvedValue([[], []]);
    mockConnection.close.mockResolvedValue();
    
    // Crear instancia del driver
    driver = new MySqlDriver(connectionParams);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    test('debe crear una instancia con parámetros correctos', () => {
      expect(driver).toBeInstanceOf(MySqlDriver);
      expect(driver.host).toBe('localhost');
      expect(driver.port).toBe(3306);
      expect(driver.username).toBe('testuser');
      expect(driver.password).toBe('testpass');
      expect(driver.connection).toBeNull();
      expect(driver.queyResult).toEqual([]);
      expect(driver.query).toBeNull();
      expect(driver.serverResponse).toBeNull();
    });

    test('debe heredar de Driver correctamente', () => {
      expect(driver.library).toBe(mockMysql);
    });

    test('debe manejar parámetros opcionales', () => {
      const minimalParams = {
        host: 'localhost',
        username: 'user'
      };
      const minimalDriver = new MySqlDriver(minimalParams);
      
      expect(minimalDriver.host).toBe('localhost');
      expect(minimalDriver.username).toBe('user');
      expect(minimalDriver.port).toBeUndefined();
      expect(minimalDriver.password).toBeUndefined();
    });
  });

  describe('connect()', () => {
    test('debe conectar exitosamente con parámetros válidos', async () => {
      const result = await driver.connect();
      
      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: 'localhost',
        port: 3306,
        user: 'testuser',
        password: 'testpass',
        database: 'testdb',
        multipleStatements: true,
        decimalNumbers: true
      });
      
      expect(driver.connection).toBe(mockConnection);
      expect(result).toBe(driver); // Debe retornar this para chaining
    });

    test('debe usar string vacío como database por defecto', async () => {
      const paramsWithoutDb = { ...connectionParams };
      delete paramsWithoutDb.database;
      
      const driverWithoutDb = new MySqlDriver(paramsWithoutDb);
      await driverWithoutDb.connect();
      
      expect(mockMysql.createConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          database: ''
        })
      );
    });

    test('debe propagar errores de conexión', async () => {
      const connectionError = new Error('Connection failed');
      mockMysql.createConnection.mockRejectedValue(connectionError);
      
      await expect(driver.connect()).rejects.toThrow('Connection failed');
    });

    test('debe configurar multipleStatements y decimalNumbers', async () => {
      await driver.connect();
      
      expect(mockMysql.createConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          multipleStatements: true,
          decimalNumbers: true
        })
      );
    });
  });

  describe('execute()', () => {
    beforeEach(async () => {
      // Configurar conexión para tests de execute
      await driver.connect();
    });

    test('debe ejecutar una consulta simple exitosamente', async () => {
      const query = 'SELECT * FROM users;';
      const mockServerResponse = [
        [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
        [{ name: 'id' }, { name: 'name' }]
      ];
      
      mockConnection.query.mockResolvedValue(mockServerResponse);
      
      const result = await driver.execute(query);
      
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users;');
      expect(MysqlResult).toHaveBeenCalledWith('SELECT * FROM users;', mockServerResponse);
      expect(result).toBe(driver);
      expect(driver.queyResult).toHaveLength(1);
    });

    test('debe ejecutar múltiples consultas separadas por punto y coma', async () => {
      const query = 'SELECT * FROM users; INSERT INTO users (name) VALUES ("Test"); UPDATE users SET name = "Updated" WHERE id = 1;';
      
      const result = await driver.execute(query);
      
      expect(mockConnection.query).toHaveBeenCalledTimes(3);
      expect(mockConnection.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM users;');
      expect(mockConnection.query).toHaveBeenNthCalledWith(2, 'INSERT INTO users (name) VALUES ("Test");');
      expect(mockConnection.query).toHaveBeenNthCalledWith(3, 'UPDATE users SET name = "Updated" WHERE id = 1;');
      expect(driver.queyResult).toHaveLength(3);
    });

    test('debe filtrar consultas vacías o muy cortas', async () => {
      const query = 'SELECT * FROM users; ; ;   ; INSERT INTO users (name) VALUES ("Test");';
      
      await driver.execute(query);
      
      expect(mockConnection.query).toHaveBeenCalledTimes(2);
      expect(driver.queyResult).toHaveLength(2);
    });

    test('debe conectar automáticamente si no hay conexión', async () => {
      driver.connection = null;
      const query = 'SELECT * FROM users;';
      
      await driver.execute(query);
      
      expect(mockMysql.createConnection).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users;');
    });

    test('debe cerrar conexión automáticamente por defecto', async () => {
      const query = 'SELECT * FROM users;';
      
      await driver.execute(query);
      
      expect(mockConnection.close).toHaveBeenCalled();
      expect(driver.connection).toBeNull();
    });

    test('no debe cerrar conexión en modo transacción', async () => {
      const query = 'SELECT * FROM users;';
      const options = { transaction: true };
      
      await driver.execute(query, options);
      
      expect(mockConnection.close).not.toHaveBeenCalled();
      expect(driver.connection).toBe(mockConnection);
    });

    test('debe manejar errores de ejecución correctamente', async () => {
      const query = 'INVALID SQL;';
      const sqlError = new Error('SQL syntax error');
      sqlError.sqlMessage = 'Syntax error; Invalid SQL statement';
      
      mockConnection.query.mockRejectedValue(sqlError);
      
      const result = await driver.execute(query);
      
      expect(mockConnection.close).toHaveBeenCalled();
      expect(driver.queyResult).toHaveLength(1);
      
      // Verificar que se creó un MysqlResult con error
      const lastCallArgs = MysqlResult.mock.calls[MysqlResult.mock.calls.length - 1];
      expect(lastCallArgs[0]).toBe('INVALID SQL;');
      
      expect(result).toBe(driver);
    });

    test('debe limpiar resultados anteriores en cada ejecución', async () => {
      // Primera ejecución
      await driver.execute('SELECT 1;');
      expect(driver.queyResult).toHaveLength(1);
      
      // Segunda ejecución
      await driver.execute('SELECT 2;');
      expect(driver.queyResult).toHaveLength(1); // Debe ser 1, no 2
    });

    test('debe manejar respuestas undefined del servidor', async () => {
      const query = 'SELECT * FROM users;';
      mockConnection.query.mockResolvedValue(undefined);
      
      await driver.execute(query);
      
      expect(MysqlResult).toHaveBeenCalledWith('SELECT * FROM users;', undefined);
    });
  });

  describe('response()', () => {
    test('debe retornar respuesta con formato correcto', async () => {
      // Ejecutar una consulta primero para tener resultados
      await driver.execute('SELECT * FROM users;');
      
      const response = driver.response();
      
      expect(response).toHaveProperty('res');
      expect(response).toHaveProperty('count');
      expect(response.res).toBe(driver.queyResult);
      expect(response.count).toBe(driver.queyResult.length);
    });

    test('debe retornar count correcto para múltiples consultas', async () => {
      await driver.execute('SELECT * FROM users; INSERT INTO users (name) VALUES ("Test"); UPDATE users SET active = 1;');
      
      const response = driver.response();
      
      expect(response.count).toBe(3);
      expect(response.res).toHaveLength(3);
    });

    test('debe retornar count 0 cuando no hay resultados', () => {
      const response = driver.response();
      
      expect(response.count).toBe(0);
      expect(response.res).toEqual([]);
    });
  });

  describe('close()', () => {
    test('debe cerrar conexión existente correctamente', async () => {
      await driver.connect();
      
      const result = await driver.close();
      
      expect(mockConnection.close).toHaveBeenCalled();
      expect(driver.connection).toBeNull();
      expect(result).toBe(driver); // Debe retornar this para chaining
    });

    test('debe manejar correctamente cuando no hay conexión', async () => {
      driver.connection = null;
      
      const result = await driver.close();
      
      expect(mockConnection.close).not.toHaveBeenCalled();
      expect(result).toBe(driver);
    });

    test('debe propagar errores de cierre de conexión', async () => {
      await driver.connect();
      const closeError = new Error('Close connection failed');
      mockConnection.close.mockRejectedValue(closeError);
      
      await expect(driver.close()).rejects.toThrow('Close connection failed');
    });

    test('debe ser idempotente (llamar múltiples veces no debe fallar)', async () => {
      await driver.connect();
      
      await driver.close();
      await driver.close(); // Segunda llamada no debe fallar
      
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integración - Flujo completo', () => {
    test('debe manejar un flujo completo de conexión-ejecución-cierre', async () => {
      const query = 'SELECT * FROM users WHERE active = 1;';
      
      // Ejecutar consulta (debe conectar automáticamente)
      await driver.execute(query);
      
      // Verificar que se conectó, ejecutó y cerró
      expect(mockMysql.createConnection).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith(query);
      expect(mockConnection.close).toHaveBeenCalled();
      
      // Verificar respuesta
      const response = driver.response();
      expect(response.count).toBe(1);
    });

    test('debe manejar múltiples ejecuciones consecutivas', async () => {
      await driver.execute('SELECT * FROM users;');
      await driver.execute('SELECT * FROM products;');
      await driver.execute('SELECT * FROM orders;');
      
      // Cada ejecución debe haber conectado y cerrado
      expect(mockMysql.createConnection).toHaveBeenCalledTimes(3);
      expect(mockConnection.close).toHaveBeenCalledTimes(3);
      
      // Solo debe tener los resultados de la última ejecución
      const response = driver.response();
      expect(response.count).toBe(1);
    });

    test('debe manejar transacciones sin cerrar conexión', async () => {
      // Iniciar transacción
      await driver.execute('START TRANSACTION;', { transaction: true });
      await driver.execute('INSERT INTO users (name) VALUES ("Test");', { transaction: true });
      await driver.execute('UPDATE users SET active = 1 WHERE name = "Test";', { transaction: true });
      await driver.execute('COMMIT;'); // Sin transaction: true, debe cerrar
      
      // Solo debe haber cerrado al final
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(mockMysql.createConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Casos extremos y robustez', () => {
    test('debe manejar consultas con solo espacios en blanco', async () => {
      const query = '   ;   ;   ';
      
      await driver.execute(query);
      
      expect(mockConnection.query).not.toHaveBeenCalled();
      expect(driver.queyResult).toHaveLength(0);
    });

    test('debe manejar consultas sin punto y coma final', async () => {
      const query = 'SELECT * FROM users';
      
      await driver.execute(query);
      
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users;');
    });

    test('debe manejar múltiples espacios y saltos de línea', async () => {
      const query = `
        SELECT * FROM users
        WHERE active = 1;
        
        INSERT INTO logs (action) 
        VALUES ('test');
      `;
      
      await driver.execute(query);
      
      expect(mockConnection.query).toHaveBeenCalledTimes(2);
    });

    test('debe manejar error sin sqlMessage', async () => {
      const query = 'INVALID SQL;';
      const sqlError = new Error('Generic error');
      // No tiene sqlMessage
      
      mockConnection.query.mockRejectedValue(sqlError);
      
      await expect(driver.execute(query)).rejects.toThrow();
    });

    test('debe manejar parámetros de conexión inválidos', async () => {
      const invalidDriver = new MySqlDriver({});
      const connectionError = new Error('Invalid connection parameters');
      mockMysql.createConnection.mockRejectedValue(connectionError);
      
      await expect(invalidDriver.execute('SELECT 1;')).rejects.toThrow('Invalid connection parameters');
    });
  });

  describe('Rendimiento y memoria', () => {
    test('debe limpiar referencias después de ejecución', async () => {
      await driver.execute('SELECT * FROM large_table;');
      
      // Verificar que se limpian los arrays
      expect(driver.queryFields).toEqual([]);
      expect(driver.results).toEqual([]);
    });

    test('debe poder ejecutar muchas consultas secuenciales', async () => {
      const queries = Array.from({ length: 100 }, (_, i) => `SELECT ${i};`);
      
      for (const query of queries) {
        await driver.execute(query);
      }
      
      // Debe funcionar sin problemas de memoria
      expect(mockConnection.query).toHaveBeenCalledTimes(100);
    });
  });
});

/**
 * Tests de integración con base de datos real (comentados por defecto)
 * Descomentar solo cuando se tenga una base de datos MySQL disponible para testing
 */

/*
describe.skip('MySqlDriver - Integration Tests', () => {
  let driver;
  
  beforeAll(async () => {
    driver = new MySqlDriver({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_TEST_DB || 'test'
    });
  });

  afterAll(async () => {
    await driver.close();
  });

  test('debe conectar a base de datos real', async () => {
    await driver.connect();
    expect(driver.connection).not.toBeNull();
  });

  test('debe ejecutar consulta SELECT real', async () => {
    await driver.execute('SELECT 1 as test_value;');
    const response = driver.response();
    
    expect(response.count).toBe(1);
    expect(response.res[0]).toBeInstanceOf(MysqlResult);
  });

  test('debe manejar errores de SQL real', async () => {
    await driver.execute('SELECT * FROM non_existent_table;');
    const response = driver.response();
    
    expect(response.count).toBe(1);
    expect(response.res[0].errorStatus).toBe(1);
  });
});
*/

export default MySqlDriver;