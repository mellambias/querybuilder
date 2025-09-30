#!/usr/bin/env node

/**
 * MySQL Driver Test Runner
 * 
 * Script utilitario para ejecutar tests del MySqlDriver con diferentes configuraciones
 * y opciones de testing.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

  checkDependencies() {
    this.info('Checking dependencies...');
    
    const requiredFiles = [
      'mysql-driver.test.js',
      'test-setup.js',
      'package.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.testDir, file);
      if (!existsSync(filePath)) {
        this.error(`Required file not found: ${file}`);
        return false;
      }
    }

    this.success('All required files found');
    return true;
  }

  installDependencies() {
    this.info('Installing test dependencies...');
    
    try {
      execSync('npm install', {
        cwd: this.testDir,
        stdio: 'pipe'
      });
      this.success('Dependencies installed successfully');
      return true;
    } catch (error) {
      this.error(`Failed to install dependencies: ${error.message}`);
      return false;
    }
  }

  runTests(options = {}) {
    const {
      testFile = '',
      coverage = false,
      watch = false,
      verbose = true,
      bail = false,
      pattern = ''
    } = options;

    let command = 'npx jest';
    
    if (testFile) {
      command += ` ${testFile}`;
    }
    
    if (pattern) {
      command += ` --testNamePattern="${pattern}"`;
    }
    
    if (coverage) {
      command += ' --coverage';
    }
    
    if (watch) {
      command += ' --watch';
    }
    
    if (verbose) {
      command += ' --verbose';
    }
    
    if (bail) {
      command += ' --bail';
    }

    this.info(`Running command: ${command}`);
    
    try {
      execSync(command, {
        cwd: this.testDir,
        stdio: 'inherit'
      });
      this.success('Tests completed successfully');
      return true;
    } catch (error) {
      this.error('Tests failed');
      return false;
    }
  }

  runDriverTests() {
    this.log('🧪 Running MySqlDriver Tests', 'cyan');
    return this.runTests({ testFile: 'mysql-driver.test.js' });
  }

  runAllTests() {
    this.log('🧪 Running All MySQL Tests', 'cyan');
    return this.runTests();
  }

  runTestsWithCoverage() {
    this.log('📊 Running Tests with Coverage', 'cyan');
    return this.runTests({ coverage: true });
  }

  runTestsInWatchMode() {
    this.log('👀 Running Tests in Watch Mode', 'cyan');
    return this.runTests({ watch: true });
  }

  runSpecificTest(testName) {
    this.log(`🎯 Running Specific Test: ${testName}`, 'cyan');
    return this.runTests({ pattern: testName });
  }

  showHelp() {
    console.log(`
${this.colors.cyan}MySQL Driver Test Runner${this.colors.reset}

Usage: node run-tests.js [command] [options]

Commands:
  driver                Run only MySqlDriver tests
  all                   Run all MySQL tests
  coverage              Run tests with coverage report
  watch                 Run tests in watch mode
  specific <pattern>    Run tests matching pattern
  install               Install test dependencies
  check                 Check dependencies and setup
  help                  Show this help message

Examples:
  node run-tests.js driver
  node run-tests.js coverage
  node run-tests.js specific "should connect"
  node run-tests.js watch

Environment Variables:
  MYSQL_TEST_HOST       MySQL test server host (default: localhost)
  MYSQL_TEST_PORT       MySQL test server port (default: 3306)
  MYSQL_TEST_USER       MySQL test user (default: test_user)
  MYSQL_TEST_PASSWORD   MySQL test password (default: test_password)
  MYSQL_TEST_DATABASE   MySQL test database (default: test_db)

${this.colors.yellow}Note: Make sure you have a MySQL server running for integration tests${this.colors.reset}
    `);
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const option = args[1];

    this.log('🚀 MySQL QueryBuilder Test Runner', 'magenta');
    console.log('─'.repeat(50));

    switch (command) {
      case 'check':
        return this.checkDependencies();

      case 'install':
        if (!this.checkDependencies()) return false;
        return this.installDependencies();

      case 'driver':
        if (!this.checkDependencies()) return false;
        return this.runDriverTests();

      case 'all':
        if (!this.checkDependencies()) return false;
        return this.runAllTests();

      case 'coverage':
        if (!this.checkDependencies()) return false;
        return this.runTestsWithCoverage();

      case 'watch':
        if (!this.checkDependencies()) return false;
        return this.runTestsInWatchMode();

      case 'specific':
        if (!option) {
          this.error('Please provide a test pattern');
          return false;
        }
        if (!this.checkDependencies()) return false;
        return this.runSpecificTest(option);

      case 'help':
      default:
        this.showHelp();
        return true;
    }
  }
}

// Ejecutar si el archivo se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  
  runner.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

export default TestRunner;