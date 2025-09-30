#!/usr/bin/env node

/**
 * 🧪 Test Local QueryBuilder Installation
 * =====================================
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const TEST_DIR = path.join(ROOT_DIR, 'test-local-install');

async function createTestProject() {
  console.log('🧪 Creating test project for local QueryBuilder...');
  console.log('================================================');

  if (await fs.pathExists(TEST_DIR)) {
    console.log('🧹 Cleaning existing test project...');
    await fs.remove(TEST_DIR);
  }

  await fs.ensureDir(TEST_DIR);
  console.log(`📁 Created test directory: ${TEST_DIR}`);

  const testPackageJson = {
    name: "querybuilder-local-test",
    version: "1.0.0",
    description: "Test project for local QueryBuilder packages",
    type: "module",
    main: "test.js",
    scripts: {
      test: "node test.js"
    },
    dependencies: {}
  };

  await fs.writeJson(path.join(TEST_DIR, 'package.json'), testPackageJson, { spaces: 2 });
  console.log('✅ Created package.json');

  const testCode = `console.log('🧪 Testing local QueryBuilder installation...');

async function main() {
  try {
    const { QueryBuilder } = await import('@querybuilder/core');
    console.log('✅ Core imported successfully');
    
    const { MySQL } = await import('@querybuilder/mysql');
    console.log('✅ MySQL imported successfully');
    
    const { PostgreSQL } = await import('@querybuilder/postgresql');
    console.log('✅ PostgreSQL imported successfully');
    
    const { MongoDB } = await import('@querybuilder/mongodb');
    console.log('✅ MongoDB imported successfully');
    
    console.log('\\n🎉 All packages working correctly!');
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();`;

  await fs.writeFile(path.join(TEST_DIR, 'test.js'), testCode);
  console.log('✅ Created test.js');

  const readmeContent = `# QueryBuilder Local Test

Test project for local QueryBuilder installation.

## Setup

1. Build distribution: \`node ../build-npm-dist.js\`
2. Link packages: \`node ../link-local.js\`  
3. Link in this project: \`npm link @querybuilder/core @querybuilder/mysql @querybuilder/postgresql @querybuilder/mongodb\`

## Test

\`npm test\`
`;

  await fs.writeFile(path.join(TEST_DIR, 'README.md'), readmeContent);
  console.log('✅ Created README.md');

  return TEST_DIR;
}

async function main() {
  try {
    const testDir = await createTestProject();

    console.log('\n🎯 Test project ready!');
    console.log('=====================');
    console.log(`📁 Location: ${testDir}`);
    console.log('📋 Next steps:');
    console.log('   1. cd test-local-install');
    console.log('   2. npm test');

  } catch (error) {
    console.error('❌ Test project creation failed:', error.message);
    process.exit(1);
  }
}

main();