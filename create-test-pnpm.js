#!/usr/bin/env node

/**
 * 🧪 Test PNPM Local QueryBuilder Installation
 * ===========================================
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const TEST_DIR = path.join(ROOT_DIR, 'test-pnpm-install');

async function createTestProjectPnpm() {
  console.log('🧪 Creating PNPM test project for local QueryBuilder...');
  console.log('====================================================');

  if (await fs.pathExists(TEST_DIR)) {
    console.log('🧹 Cleaning existing test project...');
    await fs.remove(TEST_DIR);
  }

  await fs.ensureDir(TEST_DIR);
  console.log(`📁 Created test directory: ${TEST_DIR}`);

  // Crear package.json con referencias file:
  const testPackageJson = {
    name: "querybuilder-pnpm-test",
    version: "1.0.0",
    description: "PNPM test project for local QueryBuilder packages",
    type: "module",
    main: "test.js",
    scripts: {
      test: "node test.js"
    },
    dependencies: {
      "@querybuilder/core": `file:../dist/@querybuilder/core`,
      "@querybuilder/mysql": `file:../dist/@querybuilder/mysql`,
      "@querybuilder/postgresql": `file:../dist/@querybuilder/postgresql`,
      "@querybuilder/mongodb": `file:../dist/@querybuilder/mongodb`
    }
  };

  await fs.writeJson(path.join(TEST_DIR, 'package.json'), testPackageJson, { spaces: 2 });
  console.log('✅ Created package.json with file: dependencies');

  const testCode = `console.log('🧪 Testing PNPM local QueryBuilder installation...');

async function main() {
  try {
    console.log('📦 Importing @querybuilder/core...');
    const { QueryBuilder } = await import('@querybuilder/core');
    console.log('✅ Core imported successfully');
    console.log('   Type:', typeof QueryBuilder);
    
    console.log('\\n📦 Importing @querybuilder/mysql...');
    const { MySQL } = await import('@querybuilder/mysql');
    console.log('✅ MySQL imported successfully');
    console.log('   Type:', typeof MySQL);
    
    console.log('\\n📦 Importing @querybuilder/postgresql...');
    const { PostgreSQL } = await import('@querybuilder/postgresql');
    console.log('✅ PostgreSQL imported successfully');
    console.log('   Type:', typeof PostgreSQL);
    
    console.log('\\n📦 Importing @querybuilder/mongodb...');
    const { MongoDB } = await import('@querybuilder/mongodb');
    console.log('✅ MongoDB imported successfully');
    console.log('   Type:', typeof MongoDB);
    
    console.log('\\n🎉 All PNPM packages working correctly!');
    
    // Probar instanciación básica
    console.log('\\n🔧 Testing basic instantiation...');
    const mysql = new MySQL();
    console.log('✅ MySQL instance created');
    
    const postgres = new PostgreSQL();
    console.log('✅ PostgreSQL instance created');
    
    const mongo = new MongoDB();
    console.log('✅ MongoDB instance created');
    
    console.log('\\n🎯 PNPM local installation test PASSED! 🎯');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();`;

  await fs.writeFile(path.join(TEST_DIR, 'test.js'), testCode);
  console.log('✅ Created test.js');

  const readmeContent = `# QueryBuilder PNPM Local Test

PNPM test project for local QueryBuilder installation.

## Setup

1. Build distribution: \`npm run build:dist\`
2. Link packages: \`npm run link:pnpm\`  
3. Install dependencies: \`pnpm install\`

## Test

\`pnpm test\`

## Notes

Uses \`file:\` protocol for local dependencies, which is the recommended approach for PNPM workspaces.
`;

  await fs.writeFile(path.join(TEST_DIR, 'README.md'), readmeContent);
  console.log('✅ Created README.md');

  return TEST_DIR;
}

async function main() {
  try {
    const testDir = await createTestProjectPnpm();

    console.log('\n🎯 PNPM Test project ready!');
    console.log('==========================');
    console.log(`📁 Location: ${testDir}`);
    console.log('📋 Next steps:');
    console.log('   1. cd test-pnpm-install');
    console.log('   2. pnpm install');
    console.log('   3. pnpm test');

  } catch (error) {
    console.error('❌ PNPM test project creation failed:', error.message);
    process.exit(1);
  }
}

main();