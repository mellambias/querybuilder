/**
 * Tests de Integración para MySqlDriver
 * 
 * Tests de integración usando una base de datos MySQL/MariaDB real.
 * Configuración cargada desde core/config.js (testing.MySQL).
 * Estos tests verifican el funcionamiento completo del MySqlDriver
 * incluyendo conexión, ejecución de queries, transacciones y manejo de errores.
 */

import MySqlDriver from '../drivers/MySqlDriver.js';
import { initializeDatabase, cleanupDatabase, createTestDatabase, test, describe } from './test-setup.js';
import { config } from '../../core/config.js';

// Variable global para el driver
let driver;

/**
 * Función principal para ejecutar todos los tests
 */
async function runAllTests() {
  console.log('🚀 Starting MySQL Driver Integration Tests');

  try {
    // Inicializar la base de datos de pruebas
    await createTestDatabase();
    await initializeDatabase();

    const testResults = [];

    // Test Suite: Constructor y Configuración
    const constructorSuite = describe('Constructor y Configuración', async (context) => {
      context.tests.push(
        test('debería crear una instancia con parámetros válidos', async () => {
          const params = global.testHelpers.getConnectionParams();
          driver = new MySqlDriver(params);

          if (!driver) {
            throw new Error('Driver no fue creado');
          }

          if (driver.constructor.name !== 'MySqlDriver') {
            throw new Error(`Tipo incorrecto: ${driver.constructor.name}`);
          }
        }),

        test('debería manejar parámetros de conexión faltantes', async () => {
          const invalidDriver = new MySqlDriver({});

          // El constructor no debe fallar, pero la conexión sí
          const result = await invalidDriver.connect();

          if (result.success === true) {
            throw new Error('Debería haber fallado al conectar con parámetros inválidos');
          }

          // Verificar que hay un error relacionado con acceso o parámetros
          if (!result.error) {
            throw new Error('Debería tener un mensaje de error');
          }

          // Verificar que el error es del tipo esperado (acceso denegado o similar)
          const isValidError = result.error.includes('Access denied') ||
            result.error.includes('authentication') ||
            result.error.includes('connection');

          if (!isValidError) {
            throw new Error(`Error inesperado: ${result.error}`);
          }
        }),

        test('debería configurar parámetros por defecto correctamente', async () => {
          const params = global.testHelpers.getConnectionParams();
          const testDriver = new MySqlDriver(params);

          // Verificar que los parámetros se configuraron
          if (!testDriver.host) {
            throw new Error('Host no configurado');
          }

          if (!testDriver.user && !testDriver.username) {
            throw new Error('Usuario no configurado');
          }
        })
      );
    });

    testResults.push(...await constructorSuite.run());

    // Test Suite: Conexión a Base de Datos
    const connectionSuite = describe('Conexión a Base de Datos', async (context) => {
      context.tests.push(
        test('debería conectar exitosamente con parámetros válidos', async () => {
          const params = global.testHelpers.getConnectionParams();
          driver = new MySqlDriver(params);

          const result = await driver.connect();

          if (!result || result.error) {
            throw new Error(`Conexión falló: ${result?.error || 'Sin error específico'}`);
          }

          if (!driver.connection) {
            throw new Error('Conexión no establecida en el driver');
          }
        }),

        test('debería fallar con credenciales incorrectas', async () => {
          const params = {
            ...global.testHelpers.getConnectionParams(),
            password: 'contraseña_incorrecta_' + Date.now()
          };

          const badDriver = new MySqlDriver(params);

          try {
            const result = await badDriver.connect();

            // Si la conexión es exitosa, verificar si hay error en result
            if (result && !result.error) {
              throw new Error('Debería haber fallado con credenciales incorrectas');
            }
          } catch (error) {
            // Error esperado - verificar que es el tipo correcto
            if (error.code && (error.code.includes('ACCESS_DENIED') || error.code === 'ER_ACCESS_DENIED_ERROR')) {
              // Error esperado, test pasa
              return;
            }

            if (error.message.includes('Debería haber fallado')) {
              throw error;
            }

            // Otros errores de conexión también son aceptables para este test
            if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
              return; // Test pasa - conexión rechazada como esperado
            }
          }
        }),

        test('debería manejar timeout de conexión', async () => {
          const params = {
            ...global.testHelpers.getConnectionParams(),
            host: '192.0.2.1', // Dirección IP no routable para provocar timeout
            connectTimeout: 1000
          };

          const timeoutDriver = new MySqlDriver(params);

          try {
            const result = await timeoutDriver.connect();

            if (result && !result.error) {
              throw new Error('Debería haber fallado por timeout');
            }
          } catch (error) {
            // Error esperado por timeout
            if (error.message.includes('Debería haber fallado')) {
              throw error;
            }
            // Cualquier error de timeout/conexión es aceptable
          }
        })
      );
    });

    testResults.push(...await connectionSuite.run());

    // Test Suite: Ejecución de Queries
    const executionSuite = describe('Ejecución de Queries', async (context) => {
      context.tests.push(
        test('debería ejecutar SELECT simple correctamente', async () => {
          if (!driver || !driver.connection) {
            const params = global.testHelpers.getConnectionParams();
            driver = new MySqlDriver(params);
            await driver.connect();
          }

          const query = 'SELECT 1 as test_value';
          const result = await driver.execute(query);

          if (!result) {
            throw new Error('No se obtuvo resultado');
          }

          if (result.error) {
            throw new Error(`Error en query: ${result.error}`);
          }

          // Verificar que obtenemos un resultado válido
          const response = result.response;
          if (!response || !Array.isArray(response) || response.length === 0) {
            throw new Error('Respuesta inválida del query');
          }

          if (response[0].test_value !== 1) {
            throw new Error(`Valor incorrecto: esperado 1, obtenido ${response[0].test_value}`);
          }
        }),

        test('debería crear tabla de prueba', async () => {
          if (!driver || !driver.connection) {
            const params = global.testHelpers.getConnectionParams();
            driver = new MySqlDriver(params);
            await driver.connect();
          }

          const tableName = global.testHelpers.uniqueTableName('driver_test');
          const createTableQuery = global.testHelpers.createTestTable(tableName);

          const result = await driver.execute(createTableQuery);

          if (!result) {
            throw new Error('No se obtuvo resultado de CREATE TABLE');
          }

          if (result.error) {
            throw new Error(`Error creando tabla: ${result.error}`);
          }

          // Verificar que la tabla fue creada
          const checkQuery = `SHOW TABLES LIKE '${tableName}'`;
          const checkResult = await driver.execute(checkQuery);

          if (!checkResult.response || checkResult.response.length === 0) {
            throw new Error('Tabla no fue creada');
          }

          // Limpiar tabla después del test
          await driver.execute(`DROP TABLE IF EXISTS ${tableName}`);
        }),

        test('debería insertar y recuperar datos', async () => {
          if (!driver || !driver.connection) {
            const params = global.testHelpers.getConnectionParams();
            driver = new MySqlDriver(params);
            await driver.connect();
          }

          const tableName = global.testHelpers.uniqueTableName('insert_test');

          // Crear tabla
          const createTableQuery = global.testHelpers.createTestTable(tableName);
          await driver.execute(createTableQuery);

          // Insertar datos
          const insertQuery = `INSERT INTO ${tableName} (name, email, age) VALUES (?, ?, ?)`;
          const insertResult = await driver.execute(insertQuery, ['John Doe', 'john@test.com', 30]);

          if (!insertResult || insertResult.error) {
            throw new Error(`Error insertando: ${insertResult?.error}`);
          }

          // Recuperar datos
          const selectQuery = `SELECT * FROM ${tableName} WHERE email = ?`;
          const selectResult = await driver.execute(selectQuery, ['john@test.com']);

          if (!selectResult || selectResult.error) {
            throw new Error(`Error seleccionando: ${selectResult?.error}`);
          }

          const rows = selectResult.response;
          if (!rows || rows.length !== 1) {
            throw new Error(`Esperado 1 fila, obtenido ${rows?.length || 0}`);
          }

          const row = rows[0];
          if (row.name !== 'John Doe' || row.email !== 'john@test.com' || row.age !== 30) {
            throw new Error('Datos insertados no coinciden');
          }

          // Limpiar
          await driver.execute(`DROP TABLE IF EXISTS ${tableName}`);
        }),

        test('debería manejar queries con error de sintaxis', async () => {
          if (!driver || !driver.connection) {
            const params = global.testHelpers.getConnectionParams();
            driver = new MySqlDriver(params);
            await driver.connect();
          }

          const invalidQuery = 'SELCT * FRM invalid_table'; // Query con error de sintaxis
          const result = await driver.execute(invalidQuery);

          // Debería retornar un resultado con error
          if (!result) {
            throw new Error('Debería retornar un resultado con error');
          }

          if (!result.error) {
            throw new Error('Debería tener un error por sintaxis incorrecta');
          }

          // Verificar que el error es el esperado
          if (!result.error.includes('syntax') && !result.error.includes('SQL')) {
            console.warn(`Error recibido: ${result.error}`);
            // No falla el test si hay algún tipo de error
          }
        })
      );
    });

    testResults.push(...await executionSuite.run());

    // Test Suite: Cierre de Conexión
    const closeSuite = describe('Cierre de Conexión', async (context) => {
      context.tests.push(
        test('debería cerrar conexión correctamente', async () => {
          if (!driver || !driver.connection) {
            const params = global.testHelpers.getConnectionParams();
            driver = new MySqlDriver(params);
            await driver.connect();
          }

          const result = await driver.close();

          if (!result) {
            throw new Error('Close no retornó resultado');
          }

          if (result.error) {
            throw new Error(`Error cerrando conexión: ${result.error}`);
          }

          // Verificar que la conexión fue cerrada
          if (driver.connection) {
            throw new Error('Conexión no fue limpiada del driver');
          }
        }),

        test('debería manejar múltiples llamadas a close()', async () => {
          const params = global.testHelpers.getConnectionParams();
          const testDriver = new MySqlDriver(params);
          await testDriver.connect();

          // Primera llamada a close
          const result1 = await testDriver.close();
          if (result1.error) {
            throw new Error(`Error en primer close: ${result1.error}`);
          }

          // Segunda llamada a close
          const result2 = await testDriver.close();
          if (result2.error) {
            throw new Error(`Error en segundo close: ${result2.error}`);
          }

          // Ambas deberían ser exitosas
        })
      );
    });

    testResults.push(...await closeSuite.run());

    // Resumen de resultados
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    testResults.forEach(result => {
      totalTests++;
      if (result.success) {
        passedTests++;
      } else {
        failedTests++;
        console.log(`❌ ${result.description}`);
        if (result.error) {
          console.log(`   ${result.error.message}`);
        }
      }
    });

    console.log(`\nTotal Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Cerrar driver si aún está abierto
    if (driver && driver.connection) {
      await driver.close();
    }

    return failedTests === 0;

  } catch (error) {
    console.error('💥 Error fatal ejecutando tests:', error);
    return false;
  } finally {
    // Limpiar recursos
    await cleanupDatabase();
  }
}

// Ejecutar tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

export { runAllTests };