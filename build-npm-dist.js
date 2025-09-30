#!/usr/bin/env node

/**
 * 📦 NPM Distribution Builder for QueryBuilder
 * ============================================
 * 
 * Crea una distribución limpia para publicar en NPM
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages', '@querybuilder');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('🏗️ Building NPM Distribution for QueryBuilder');
console.log('==============================================');

// 🎯 **FUNCIÓN PARA EJECUTAR ROLLUP BUILD**
async function runRollupBuild() {
  console.log('🚀 Running Rollup optimization...');
  try {
    execSync('npx rollup -c', {
      stdio: 'inherit',
      cwd: ROOT_DIR
    });
    console.log('✅ Rollup build completed successfully');
  } catch (error) {
    console.error('❌ Rollup build failed:', error.message);
    throw error;
  }
}

// 🧹 **FUNCIÓN PARA LIMPIAR ARCHIVOS NO MINIFICADOS**
async function cleanupNonMinifiedFiles() {
  console.log('\n🧹 Removing non-minified files from distribution...');

  const filesToRemove = [
    // Core - archivos originales
    'dist/@querybuilder/core/querybuilder.js',
    'dist/@querybuilder/core/core.js',
    'dist/@querybuilder/core/column.js',
    'dist/@querybuilder/core/expresion.js',
    'dist/@querybuilder/core/cursor.js',
    'dist/@querybuilder/core/transaction.js',
    'dist/@querybuilder/core/value.js',
    'dist/@querybuilder/core/proxy.js',
    'dist/@querybuilder/core/drivers/Driver.js',
    'dist/@querybuilder/core/results/Result.js',
    'dist/@querybuilder/core/utils/utils.js',
    'dist/@querybuilder/core/types/dataTypes.js',
    'dist/@querybuilder/core/types/privilegios.js',
    'dist/@querybuilder/core/types/reservedWords.js',
    'dist/@querybuilder/core/types/Type.js',

    // MySQL - archivos originales
    'dist/@querybuilder/mysql/MySQL.js',
    'dist/@querybuilder/mysql/drivers/MySqlDriver.js',

    // PostgreSQL - archivos originales
    'dist/@querybuilder/postgresql/PostgreSQL.js',
    'dist/@querybuilder/postgresql/postgresql-extended.js',
    'dist/@querybuilder/postgresql/drivers/PostgreSQLDriver.js',

    // MongoDB - archivos originales
    'dist/@querybuilder/mongodb/MongoDB.js',
    'dist/@querybuilder/mongodb/Command.js',
    'dist/@querybuilder/mongodb/mongoUtils.js',
    'dist/@querybuilder/mongodb/drivers/MongodbDriver.js'
  ];

  let removedCount = 0;
  for (const file of filesToRemove) {
    const filePath = path.join(ROOT_DIR, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      console.log(`  🗑️  Removed ${file.replace('dist/@querybuilder/', '')}`);
      removedCount++;
    }
  }

  console.log(`✅ Cleanup completed: ${removedCount} non-minified files removed`);
}

async function main() {
  try {
    // Limpiar directorio dist
    console.log('🧹 Cleaning dist directory...');
    await fs.remove(DIST_DIR);
    await fs.ensureDir(DIST_DIR);

    // 🚀 EJECUTAR ROLLUP PARA OPTIMIZACIÓN COMPLETA
    await runRollupBuild();

    // Build cada paquete con archivos adicionales
    await buildCore();
    await buildMySQL();
    await buildPostgreSQL();
    await buildMongoDB();

    // 🧹 LIMPIAR ARCHIVOS NO MINIFICADOS
    await cleanupNonMinifiedFiles();

    console.log('\n✅ Distribution build completed successfully!');
    console.log(`📁 Output directory: ${DIST_DIR}`);
    console.log('\n📊 Generated files per package:');
    console.log('├── {package}.min.js     - Production version (optimized)');
    console.log('├── {package}.bundle.min.js - CDN bundle (UMD format)');
    console.log('├── *.min.js             - All auxiliary files minified');
    console.log('└── *.map               - Source maps for debugging');
    console.log('\n🎯 Distribution contains ONLY minified files for maximum optimization');
    console.log('\n🚀 Next steps:');
    console.log('1. Review generated files in dist/');
    console.log('2. Test installation: npm run test:dist');
    console.log('3. Publish to NPM: npm run publish:all');

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

async function buildCore() {
  console.log('\n📦 Building @querybuilder/core...');

  const sourceDir = path.join(PACKAGES_DIR, 'core');
  const distDir = path.join(DIST_DIR, '@querybuilder', 'core');

  await fs.ensureDir(distDir);

  // Copiar archivos esenciales
  const filesToCopy = [
    'querybuilder.js',
    'core.js',
    'column.js',
    'expresion.js',
    'cursor.js',
    'transaction.js',
    'value.js',
    'proxy.js',
    'drivers/',
    'results/',
    'types/',
    'utils/'
    // 'src/' - Removed: legacy directory excluded from distribution
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(distDir, file);

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath);
      console.log(`  ✅ Copied ${file}`);
    }
  }

  // Generar package.json limpio con exports optimizados
  const packageJson = {
    name: "@querybuilder/core",
    version: "1.0.0",
    description: "Universal QueryBuilder for SQL and NoSQL databases",
    type: "module",
    main: "./core.min.js",
    module: "./core.min.js",
    browser: "./core.min.js",
    unpkg: "./core.bundle.min.js",
    exports: {
      ".": "./core.min.js",
      "./bundle": "./core.bundle.min.js",
      "./drivers": "./drivers/Driver.js",
      "./results": "./results/Result.js",
      "./types": "./types/dataTypes.js"
    },
    files: [
      "core.min.js",
      "core.bundle.min.js",
      "*.map",
      "querybuilder.js",
      "column.js",
      "expresion.js",
      "cursor.js",
      "transaction.js",
      "value.js",
      "proxy.js",
      "drivers/",
      "results/",
      "types/",
      "utils/"
    ],
    keywords: ["querybuilder", "sql", "nosql", "database", "orm", "mysql", "postgresql", "mongodb"],
    author: "mellambias",
    license: "PROPRIETARY",
    repository: {
      type: "git",
      url: "https://github.com/mellambias/querybuilder.git"
    },
    organization: "mellambias",
    engines: {
      node: ">=16.0.0"
    },
    sideEffects: false
  };

  await fs.writeJson(path.join(distDir, 'package.json'), packageJson, { spaces: 2 });
  console.log('  ✅ Generated clean package.json');
}

async function buildMySQL() {
  console.log('\n📦 Building @querybuilder/mysql...');

  const sourceDir = path.join(PACKAGES_DIR, 'mysql');
  const distDir = path.join(DIST_DIR, '@querybuilder', 'mysql');

  await fs.ensureDir(distDir);

  // Copiar archivos esenciales
  const filesToCopy = [
    'MySQL.js',
    'drivers/',
    'results/',
    'comandos/'
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(distDir, file);

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath);
      console.log(`  ✅ Copied ${file}`);
    }
  }

  // Crear index.js
  const indexContent = `// MySQL QueryBuilder Module
export { default as MySQL } from './MySQL.js';
export { default as MySqlDriver } from './drivers/MySqlDriver.js';
export { default as MysqlResult } from './results/MysqlResult.js';
`;

  await fs.writeFile(path.join(distDir, 'index.js'), indexContent);
  console.log('  ✅ Generated index.js');

  // Generar package.json optimizado
  const packageJson = {
    name: "@querybuilder/mysql",
    version: "1.0.0",
    description: "MySQL adapter for QueryBuilder",
    type: "module",
    main: "./mysql.min.js",
    module: "./mysql.min.js",
    browser: "./mysql.min.js",
    unpkg: "./mysql.bundle.min.js",
    exports: {
      ".": "./mysql.min.js",
      "./bundle": "./mysql.bundle.min.js"
    },
    files: [
      "mysql.min.js",
      "mysql.bundle.min.js",
      "*.map",
      "index.js",
      "MySQL.js",
      "drivers/",
      "results/",
      "comandos/"
    ],
    dependencies: {
      "@querybuilder/core": "^1.0.0",
      "mysql2": "^3.0.0"
    },
    keywords: ["querybuilder", "mysql", "sql", "database", "orm"],
    author: "mellambias",
    license: "PROPRIETARY",
    repository: {
      type: "git",
      url: "https://github.com/mellambias/querybuilder.git"
    },
    organization: "mellambias",
    engines: {
      node: ">=16.0.0"
    },
    sideEffects: false
  };

  await fs.writeJson(path.join(distDir, 'package.json'), packageJson, { spaces: 2 });
  console.log('  ✅ Generated package.json with core dependency');
}

async function buildPostgreSQL() {
  console.log('\n📦 Building @querybuilder/postgresql...');

  const sourceDir = path.join(PACKAGES_DIR, 'postgresql');
  const distDir = path.join(DIST_DIR, '@querybuilder', 'postgresql');

  await fs.ensureDir(distDir);

  // Copiar archivos esenciales
  const filesToCopy = [
    'PostgreSQL.js',
    'postgresql-extended.js',
    'drivers/',
    'comandos/',
    'types.js',
    'operators.js',
    'functions.js'
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(distDir, file);

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath);
      console.log(`  ✅ Copied ${file}`);
    }
  }

  // Crear index.js
  const indexContent = `// PostgreSQL QueryBuilder Module
export { default as PostgreSQL } from './PostgreSQL.js';
export { default as PostgreSQLDriver } from './drivers/PostgreSQLDriver.js';
export { default as PostgreSQLExtended } from './postgresql-extended.js';
`;

  await fs.writeFile(path.join(distDir, 'index.js'), indexContent);
  console.log('  ✅ Generated index.js');

  // Generar package.json optimizado
  const packageJson = {
    name: "@querybuilder/postgresql",
    version: "1.0.0",
    description: "PostgreSQL adapter for QueryBuilder with advanced features",
    type: "module",
    main: "./postgresql.min.js",
    module: "./postgresql.min.js",
    browser: "./postgresql.min.js",
    unpkg: "./postgresql.bundle.min.js",
    exports: {
      ".": "./postgresql.min.js",
      "./bundle": "./postgresql.bundle.min.js",
      "./extended": "./postgresql-extended.js"
    },
    files: [
      "postgresql.min.js",
      "postgresql.bundle.min.js",
      "*.map",
      "index.js",
      "PostgreSQL.js",
      "postgresql-extended.js",
      "drivers/",
      "comandos/",
      "types.js",
      "operators.js",
      "functions.js"
    ],
    dependencies: {
      "@querybuilder/core": "^1.0.0",
      "pg": "^8.0.0"
    },
    keywords: ["querybuilder", "postgresql", "postgres", "sql", "database", "jsonb", "orm"],
    author: "mellambias",
    license: "PROPRIETARY",
    repository: {
      type: "git",
      url: "https://github.com/mellambias/querybuilder.git"
    },
    organization: "mellambias",
    engines: {
      node: ">=16.0.0"
    },
    sideEffects: false
  };

  await fs.writeJson(path.join(distDir, 'package.json'), packageJson, { spaces: 2 });
  console.log('  ✅ Generated package.json with core dependency');
}

async function buildMongoDB() {
  console.log('\n📦 Building @querybuilder/mongodb...');

  const sourceDir = path.join(PACKAGES_DIR, 'mongodb');
  const distDir = path.join(DIST_DIR, '@querybuilder', 'mongodb');

  await fs.ensureDir(distDir);

  // Copiar archivos esenciales
  const filesToCopy = [
    'MongoDB.js',
    'Command.js',
    'mongoUtils.js',
    'drivers/',
    'comandos/'
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(distDir, file);

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath);
      console.log(`  ✅ Copied ${file}`);
    }
  }

  // Crear index.js
  const indexContent = `// MongoDB QueryBuilder Module
export { default as MongoDB } from './MongoDB.js';
export { default as MongodbDriver } from './drivers/MongodbDriver.js';
export { default as Command } from './Command.js';
export * from './mongoUtils.js';
`;

  await fs.writeFile(path.join(distDir, 'index.js'), indexContent);
  console.log('  ✅ Generated index.js');

  // Generar package.json optimizado
  const packageJson = {
    name: "@querybuilder/mongodb",
    version: "1.0.0",
    description: "MongoDB adapter for QueryBuilder with NoSQL features",
    type: "module",
    main: "./mongodb.min.js",
    module: "./mongodb.min.js",
    browser: "./mongodb.min.js",
    unpkg: "./mongodb.bundle.min.js",
    exports: {
      ".": "./mongodb.min.js",
      "./bundle": "./mongodb.bundle.min.js",
      "./utils": "./mongoUtils.js"
    },
    files: [
      "mongodb.min.js",
      "mongodb.bundle.min.js",
      "*.map",
      "index.js",
      "MongoDB.js",
      "Command.js",
      "mongoUtils.js",
      "drivers/",
      "comandos/"
    ],
    dependencies: {
      "@querybuilder/core": "^1.0.0",
      "mongodb": "^6.0.0"
    },
    keywords: ["querybuilder", "mongodb", "nosql", "database", "document", "orm"],
    author: "mellambias",
    license: "PROPRIETARY",
    repository: {
      type: "git",
      url: "https://github.com/mellambias/querybuilder.git"
    },
    organization: "mellambias",
    engines: {
      node: ">=16.0.0"
    },
    sideEffects: false
  };

  await fs.writeJson(path.join(distDir, 'package.json'), packageJson, { spaces: 2 });
  console.log('  ✅ Generated package.json with core dependency');
}

// Ejecutar build
main();
