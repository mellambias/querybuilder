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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages', '@querybuilder');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('🏗️ Building NPM Distribution for QueryBuilder');
console.log('==============================================');

async function main() {
  try {
    // Limpiar directorio dist
    console.log('🧹 Cleaning dist directory...');
    await fs.remove(DIST_DIR);
    await fs.ensureDir(DIST_DIR);

    // Build cada paquete
    await buildCore();
    await buildMySQL();
    await buildPostgreSQL();
    await buildMongoDB();

    console.log('\n✅ Distribution build completed successfully!');
    console.log(`📁 Output directory: ${DIST_DIR}`);
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
    'utils/',
    'src/'
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(distDir, file);

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath);
      console.log(`  ✅ Copied ${file}`);
    }
  }

  // Generar package.json limpio
  const packageJson = {
    name: "@querybuilder/core",
    version: "1.0.0",
    description: "Universal QueryBuilder for SQL and NoSQL databases",
    type: "module",
    main: "./src/index.js",
    exports: {
      ".": "./src/index.js",
      "./drivers": "./drivers/Driver.js",
      "./results": "./results/Result.js",
      "./types": "./types/dataTypes.js"
    },
    files: [
      "src/",
      "querybuilder.js",
      "core.js",
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
    keywords: ["querybuilder", "sql", "nosql", "database", "orm"],
    license: "MIT",
    repository: {
      type: "git",
      url: "https://github.com/your-org/querybuilder.git"
    },
    engines: {
      node: ">=16.0.0"
    }
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

  // Generar package.json
  const packageJson = {
    name: "@querybuilder/mysql",
    version: "1.0.0",
    description: "MySQL adapter for QueryBuilder",
    type: "module",
    main: "./index.js",
    files: [
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
    keywords: ["querybuilder", "mysql", "sql", "database"],
    license: "MIT",
    engines: {
      node: ">=16.0.0"
    }
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

  // Generar package.json
  const packageJson = {
    name: "@querybuilder/postgresql",
    version: "1.0.0",
    description: "PostgreSQL adapter for QueryBuilder with advanced features",
    type: "module",
    main: "./index.js",
    files: [
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
    keywords: ["querybuilder", "postgresql", "postgres", "sql", "database", "jsonb"],
    license: "MIT",
    engines: {
      node: ">=16.0.0"
    }
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

  // Generar package.json
  const packageJson = {
    name: "@querybuilder/mongodb",
    version: "1.0.0",
    description: "MongoDB adapter for QueryBuilder with NoSQL features",
    type: "module",
    main: "./index.js",
    files: [
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
    keywords: ["querybuilder", "mongodb", "nosql", "database", "document"],
    license: "MIT",
    engines: {
      node: ">=16.0.0"
    }
  };

  await fs.writeJson(path.join(distDir, 'package.json'), packageJson, { spaces: 2 });
  console.log('  ✅ Generated package.json with core dependency');
}

// Ejecutar build
main();