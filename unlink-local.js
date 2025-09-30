#!/usr/bin/env node

/**
 * 🗑️ Local Package Unlinker for QueryBuilder
 * ==========================================
 * 
 * Remueve enlaces locales de QueryBuilder
 */

import { execSync } from 'child_process';

/**
 * 🗑️ Remover enlaces locales
 */
async function unlinkPackagesLocally() {
  console.log('🗑️ Removing local QueryBuilder package links...');
  console.log('==============================================');

  const packages = ['core', 'mysql', 'postgresql', 'mongodb'];
  let removedCount = 0;

  // Detectar gestor de paquetes - PREFERIR PNPM
  let packageManager = 'npm';
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    packageManager = 'pnpm';
  } catch (e) {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      packageManager = 'yarn';
    } catch (e) {
      // Usar npm por defecto
    }
  }

  console.log(`Using ${packageManager}...`);

  for (const pkg of packages) {
    try {
      console.log(`🗑️ Unlinking @querybuilder/${pkg}...`);

      let unlinkCommand;
      if (packageManager === 'pnpm') {
        unlinkCommand = `pnpm unlink --global @querybuilder/${pkg}`;
      } else if (packageManager === 'yarn') {
        unlinkCommand = `yarn unlink @querybuilder/${pkg}`;
      } else {
        unlinkCommand = `npm unlink -g @querybuilder/${pkg}`;
      }

      execSync(unlinkCommand, { stdio: 'pipe' });
      console.log(`   ✅ Unlinked @querybuilder/${pkg}`);
      removedCount++;

    } catch (error) {
      console.log(`   ⚠️ @querybuilder/${pkg} was not linked or already removed`);
    }
  }

  if (removedCount > 0) {
    console.log(`\n✅ Removed ${removedCount} local package links`);
  } else {
    console.log('\n💡 No QueryBuilder packages were linked locally');
  }

  console.log('\n📋 To link again: node link-local.js');
}

// Ejecutar
unlinkPackagesLocally().catch(error => {
  console.error('❌ Unlinking failed:', error.message);
  process.exit(1);
});