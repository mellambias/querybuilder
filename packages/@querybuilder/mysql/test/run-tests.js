#!/usr/bin/env node

/**
 * MySQL Driver Test Runner - Real Database Tests
 * 
 * Script utilitario para ejecutar tests de integración del MySqlDriver 
 * usando una base de datos MySQL real en lugar de mocks.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, cleanupDatabase, createTestDatabase } from './test-setup.js';
import { config } from '../../core/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  constructor() {
    this.testDir = __dirname;
    this.rootDir = path.resolve(__dirname, '..');
    this.colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
  }

  log(message, color = 'white') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`);
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  /**
   * Verificar configuración del entorno de testing
   */
  checkEnvironment() {
    this.info('Verificando configuración del entorno...');

    // Obtener configuración de test desde core/config.js
    const testConfig = config.testing.MySQL;

    this.info('Configuración desde core/config.js:');
    console.log(`  Host: ${testConfig.params.host}`);
    console.log(`  Puerto: ${testConfig.params.port}`);
    console.log(`  Usuario: ${testConfig.params.username}`);
    console.log(`  Base de datos: ${testConfig.params.database}`);
    console.log(`  Driver: MariaDB (puerto 3306)`);

    // Verificar que la configuración esté completa
    if (!testConfig.params.password) {
      this.error('Password no configurado en core/config.js testing.MySQL.params.password');
      return false;
    }

    this.success('Configuración cargada correctamente desde core/config.js'); return true;
  }

  /**
   * Verificar que los archivos de test existan
   */
  checkTestFiles() {
    this.info('Verificando archivos de test...');

    const testFiles = [
      'mysql-driver.test.js',
      'test-setup.js'
    ];

    let hasErrors = false;

    for (const testFile of testFiles) {
      const filePath = path.join(this.testDir, testFile);
      if (!existsSync(filePath)) {
        this.error(`Archivo de test no encontrado: ${testFile}`);
        hasErrors = true;
      } else {
        this.success(`Encontrado: ${testFile}`);
      }
    }

    return !hasErrors;
  }

  /**
   * Probar conectividad con la base de datos
   */
  async testDatabaseConnectivity() {
    this.info('Probando conectividad con la base de datos...');

    try {
      await createTestDatabase();
      this.success('Base de datos de pruebas disponible');

      await initializeDatabase();
      this.success('Conexión a base de datos establecida');

      await cleanupDatabase();
      this.success('Limpieza de conexiones completada');

      return true;
    } catch (error) {
      this.error(`Error de conectividad: ${error.message}`);
      this.info('Sugerencias para resolver problemas de conectividad:');
      console.log('  1. Verificar que MySQL esté ejecutándose');
      console.log('  2. Verificar credenciales de acceso');
      console.log('  3. Verificar que el usuario tenga permisos para crear bases de datos');
      console.log('  4. Verificar configuración de red y firewall');
      return false;
    }
  }

  /**
   * Ejecutar archivo de test específico
   */
  async runTestFile(testFile) {
    this.info(`Ejecutando: ${testFile}`);

    try {
      const testPath = path.join(this.testDir, testFile);

      if (!existsSync(testPath)) {
        throw new Error(`Archivo de test no encontrado: ${testFile}`);
      }

      // Ejecutar el test usando Node.js directamente
      const result = execSync(`node "${testPath}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env },
        cwd: this.testDir
      });

      this.success(`Completado: ${testFile}`);
      return { success: true, output: result };

    } catch (error) {
      this.error(`Error en ${testFile}: ${error.message}`);

      // Mostrar output del error si está disponible
      if (error.stdout) {
        console.log('STDOUT:', error.stdout);
      }
      if (error.stderr) {
        console.log('STDERR:', error.stderr);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Ejecutar todos los tests
   */
  async runAllTests() {
    this.log('\n🧪 MySQL QueryBuilder - Test Runner', 'cyan');
    this.log('==================================', 'cyan');

    // Verificaciones previas
    if (!this.checkEnvironment()) {
      return false;
    }

    if (!this.checkTestFiles()) {
      return false;
    }

    if (!await this.testDatabaseConnectivity()) {
      return false;
    }

    // Ejecutar tests
    this.log('\n🚀 Ejecutando tests de integración...', 'blue');

    const testFiles = [
      'mysql-driver.test.js'
    ];

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    for (const testFile of testFiles) {
      const result = await this.runTestFile(testFile);
      totalTests++;

      if (result.success) {
        passedTests++;
      } else {
        failedTests++;
      }
    }

    // Resumen final
    this.log('\n📊 Resumen de Tests', 'cyan');
    this.log('==================', 'cyan');
    console.log(`Total de archivos: ${totalTests}`);
    console.log(`✅ Exitosos: ${passedTests}`);
    console.log(`❌ Fallidos: ${failedTests}`);

    if (failedTests === 0) {
      this.success('🎉 Todos los tests pasaron correctamente!');
      return true;
    } else {
      this.error(`💥 ${failedTests} test(s) fallaron`);
      return false;
    }
  }

  /**
   * Mostrar ayuda de uso
   */
  showHelp() {
    console.log(`
🧪 MySQL QueryBuilder Test Runner

Uso:
  node run-tests.js [opciones]

Opciones:
  --help, -h          Mostrar esta ayuda
  --driver           Ejecutar solo tests del driver
  --check-env        Solo verificar configuración del entorno
  --check-db         Solo probar conectividad de base de datos

Configuración:
  La configuración se carga desde: packages/@querybuilder/core/config.js
  Sección utilizada: config.testing.MySQL
  Base de datos: MariaDB (puerto 3306)
  Base de datos de test: querybuilder_test

Nota:
  Ya no se requieren variables de entorno.
  Toda la configuración está centralizada en core/config.js

Ejemplos:
  node run-tests.js
  node run-tests.js --driver
  node run-tests.js --check-env
`);
  }
}

/**
 * Función principal
 */
async function main() {
  const runner = new TestRunner();
  const args = process.argv.slice(2);

  // Procesar argumentos
  if (args.includes('--help') || args.includes('-h')) {
    runner.showHelp();
    process.exit(0);
  }

  if (args.includes('--check-env')) {
    const envOk = runner.checkEnvironment();
    process.exit(envOk ? 0 : 1);
  }

  if (args.includes('--check-db')) {
    try {
      const dbOk = await runner.testDatabaseConnectivity();
      process.exit(dbOk ? 0 : 1);
    } catch (error) {
      runner.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  if (args.includes('--driver')) {
    try {
      const result = await runner.runTestFile('mysql-driver.test.js');
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      runner.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  // Ejecutar todos los tests por defecto
  try {
    const success = await runner.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    runner.error(`Error fatal: ${error.message}`);
    process.exit(1);
  }
}

// Manejo de señales para limpieza
process.on('SIGINT', async () => {
  console.log('\n🛑 Interrumpido por usuario...');
  await cleanupDatabase();
  process.exit(130);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Terminando...');
  await cleanupDatabase();
  process.exit(143);
});

// Ejecutar si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}