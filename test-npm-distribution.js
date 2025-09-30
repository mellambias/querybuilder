#!/usr/bin/env node

/**
 * 🧪 NPM Distribution Tester
 * ==========================
 * 
 * Prueba la distribución NPM antes de publicar
 */

import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const TEST_DIR = path.join(ROOT_DIR, 'test-npm-install');

console.log('🧪 Testing NPM Distribution');
console.log('============================');

async function main() {
  try {
    // Verificar que existe la distribución
    if (!await fs.pathExists(DIST_DIR)) {
      throw new Error('Distribution not found. Run "npm run build:dist" first.');
    }

    // Limpiar directorio de test
    console.log('🧹 Cleaning test directory...');
    await fs.remove(TEST_DIR);
    await fs.ensureDir(TEST_DIR);

    // Crear package.json de test
    await createTestPackage();

    // Empaquetar distribución
    console.log('\n📦 Packing distribution...');
    await packDistribution();

    // Instalar paquetes locales
    console.log('\n📥 Installing local packages...');
    await installLocalPackages();

    // Probar imports
    console.log('\n🧪 Testing imports...');
    await testImports();

    // Probar funcionalidad
    console.log('\n⚡ Testing functionality...');
    await testFunctionality();

    console.log('\n✅ Distribution test completed successfully!');
    console.log('🚀 Distribution is ready for NPM publishing.');

  } catch (error) {
    console.error('❌ Distribution test failed:', error.message);
    process.exit(1);
  }
}

async function createTestPackage() {
  const packageJson = {
    name: "querybuilder-test",
    version: "1.0.0",
    type: "module",
    private: true
  };

  await fs.writeJson(path.join(TEST_DIR, 'package.json'), packageJson, { spaces: 2 });
  console.log('✅ Created test package.json');
}

async function packDistribution() {
  const packages = ['core', 'mysql', 'postgresql', 'mongodb'];

  for (const pkg of packages) {
    const pkgDir = path.join(DIST_DIR, '@querybuilder', pkg);
    console.log(`  📦 Packing @querybuilder/${pkg}...`);

    await runCommand('npm', ['pack'], { cwd: pkgDir });
  }
}

async function installLocalPackages() {
  // Instalar core primero
  const corePkg = path.join(DIST_DIR, '@querybuilder', 'core', 'querybuilder-core-1.0.0.tgz');
  await runCommand('npm', ['install', corePkg], { cwd: TEST_DIR });
  console.log('  ✅ Installed @querybuilder/core');

  // Instalar módulos de DB
  const dbPackages = [
    { name: 'mysql', file: 'querybuilder-mysql-1.0.0.tgz' },
    { name: 'postgresql', file: 'querybuilder-postgresql-1.0.0.tgz' },
    { name: 'mongodb', file: 'querybuilder-mongodb-1.0.0.tgz' }
  ];

  for (const pkg of dbPackages) {
    const pkgFile = path.join(DIST_DIR, '@querybuilder', pkg.name, pkg.file);
    await runCommand('npm', ['install', pkgFile], { cwd: TEST_DIR });
    console.log(`  ✅ Installed @querybuilder/${pkg.name}`);
  }
}

async function testImports() {
  const testFile = path.join(TEST_DIR, 'test-imports.js');

  const testCode = `
// Test NPM-style imports
try {
    console.log('Testing @querybuilder/core imports...');
    const { QueryBuilder, Driver, Result } = await import('@querybuilder/core');
    console.log('  ✅ Core imports working:', {
        QueryBuilder: typeof QueryBuilder,
        Driver: typeof Driver,
        Result: typeof Result
    });

    console.log('Testing @querybuilder/mysql imports...');
    const { MySQL, MySqlDriver } = await import('@querybuilder/mysql');
    console.log('  ✅ MySQL imports working:', {
        MySQL: typeof MySQL,
        MySqlDriver: typeof MySqlDriver
    });

    console.log('Testing @querybuilder/postgresql imports...');
    const { PostgreSQL, PostgreSQLDriver } = await import('@querybuilder/postgresql');
    console.log('  ✅ PostgreSQL imports working:', {
        PostgreSQL: typeof PostgreSQL,
        PostgreSQLDriver: typeof PostgreSQLDriver
    });

    console.log('Testing @querybuilder/mongodb imports...');
    const { MongoDB, MongodbDriver } = await import('@querybuilder/mongodb');
    console.log('  ✅ MongoDB imports working:', {
        MongoDB: typeof MongoDB,
        MongodbDriver: typeof MongodbDriver
    });

    console.log('\\n🎉 All imports successful!');
} catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
}
`;

  await fs.writeFile(testFile, testCode);
  await runCommand('node', ['test-imports.js'], { cwd: TEST_DIR });
}

async function testFunctionality() {
  const testFile = path.join(TEST_DIR, 'test-functionality.js');

  const testCode = `
// Test basic functionality
try {
    console.log('Testing QueryBuilder instantiation...');
    const { QueryBuilder } = await import('@querybuilder/core');
    const { MySQL } = await import('@querybuilder/mysql');
    
    const qb = new QueryBuilder(MySQL);
    console.log('  ✅ QueryBuilder instance created');
    
    // Test method chaining
    const query = qb.select('*').from('users').where('id', 1);
    console.log('  ✅ Method chaining working');
    
    // Test toString
    const sql = query.toString();
    console.log('  ✅ Query generation:', sql);
    
    console.log('\\n🎉 Basic functionality test passed!');
} catch (error) {
    console.error('❌ Functionality test failed:', error.message);
    process.exit(1);
}
`;

  await fs.writeFile(testFile, testCode);
  await runCommand('node', ['test-functionality.js'], { cwd: TEST_DIR });
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

// Ejecutar test
main();