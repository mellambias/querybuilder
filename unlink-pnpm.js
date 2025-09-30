#!/usr/bin/env node

/**
 * 🗑️ PNPM Local Package Unlinker for QueryBuilder
 * ===============================================
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;

/**
 * 🗑️ Remover enlaces pnpm
 */
async function unlinkWithPnpm() {
  console.log('🗑️ Removing PNPM QueryBuilder package links...');
  console.log('==============================================');

  // Verificar que pnpm está disponible
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
  } catch (e) {
    console.error('❌ PNPM not found');
    process.exit(1);
  }

  const packages = ['core', 'mysql', 'postgresql', 'mongodb'];
  let removedCount = 0;

  console.log('Using PNPM...');

  // Remover enlaces globales
  for (const pkg of packages) {
    try {
      console.log(`🗑️ Unlinking global @querybuilder/${pkg}...`);

      execSync(`pnpm unlink --global @querybuilder/${pkg}`, { stdio: 'pipe' });
      console.log(`   ✅ Unlinked global @querybuilder/${pkg}`);
      removedCount++;

    } catch (error) {
      console.log(`   ⚠️ @querybuilder/${pkg} was not globally linked`);
    }
  }

  // Remover enlaces del workspace
  const workspacePkgDir = path.join(ROOT_DIR, 'node_modules', '@querybuilder');
  if (await fs.pathExists(workspacePkgDir)) {
    try {
      console.log('🗑️ Removing workspace symlinks...');
      await fs.remove(workspacePkgDir);
      console.log('   ✅ Removed workspace symlinks');
      removedCount++;
    } catch (error) {
      console.log('   ⚠️ Could not remove workspace symlinks:', error.message);
    }
  }

  if (removedCount > 0) {
    console.log(`\n✅ Removed ${removedCount} PNPM package links`);
  } else {
    console.log('\n💡 No QueryBuilder packages were linked with PNPM');
  }

  console.log('\n📋 To link again: node link-pnpm.js');
}

// Ejecutar
unlinkWithPnpm().catch(error => {
  console.error('❌ PNPM unlinking failed:', error.message);
  process.exit(1);
});