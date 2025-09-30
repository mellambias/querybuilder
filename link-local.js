#!/usr/bin/env node

/**
 * 🔗 Local Package Linker for QueryBuilder
 * =======================================
 * 
 * Crea enlaces locales para usar QueryBuilder en otros proyectos sin publicar en NPM
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');

/**
 * 🔗 Crear enlaces locales de todos los paquetes para desarrollo
 */
async function linkPackagesLocally() {
  console.log('🔗 Creating local package links for QueryBuilder...');
  console.log('================================================');

  // Verificar que dist existe
  if (!await fs.pathExists(DIST_DIR)) {
    console.error('❌ Distribution not found. Run "node build-npm-dist.js" first');
    process.exit(1);
  }

  const packages = ['core', 'mysql', 'postgresql', 'mongodb'];
  const linkedPackages = [];

  for (const pkg of packages) {
    const packagePath = path.join(DIST_DIR, '@querybuilder', pkg);

    if (await fs.pathExists(packagePath)) {
      try {
        console.log(`🔗 Linking @querybuilder/${pkg}...`);

        // Detectar gestor de paquetes disponible - USAR PNPM con configuración específica
        let linkCommand = 'npm link';
        let packageManager = 'npm';

        try {
          execSync('pnpm --version', { stdio: 'ignore' });
          // Para pnpm, usar un approach diferente sin --global para evitar store conflicts
          linkCommand = 'pnpm link --dir ../../../../';
          packageManager = 'pnpm';
        } catch (e) {
          try {
            execSync('yarn --version', { stdio: 'ignore' });
            linkCommand = 'yarn link';
            packageManager = 'yarn';
          } catch (e) {
            // Usar npm por defecto
          }
        }

        console.log(`   Using ${packageManager}...`);
        execSync(linkCommand, {
          cwd: packagePath,
          stdio: 'pipe'
        });

        linkedPackages.push({
          name: `@querybuilder/${pkg}`,
          manager: packageManager
        });
        console.log(`   ✅ Linked @querybuilder/${pkg}`);

      } catch (error) {
        console.error(`   ❌ Failed to link @querybuilder/${pkg}:`, error.message);
      }
    } else {
      console.warn(`   ⚠️  Package not found: @querybuilder/${pkg}`);
    }
  }

  if (linkedPackages.length > 0) {
    console.log(`\n✅ Successfully linked ${linkedPackages.length} packages!`);

    console.log('\n📋 To use in other projects:');
    console.log('──────────────────────────────');

    const manager = linkedPackages[0].manager;
    console.log(`cd your-project`);

    if (manager === 'pnpm') {
      linkedPackages.forEach(pkg => {
        console.log(`pnpm link --global ${pkg.name}`);
      });
    } else if (manager === 'yarn') {
      linkedPackages.forEach(pkg => {
        console.log(`yarn link ${pkg.name}`);
      });
    } else {
      linkedPackages.forEach(pkg => {
        console.log(`npm link ${pkg.name}`);
      });
    }

    console.log('\n💡 Example usage:');
    console.log('──────────────────');
    console.log('```javascript');
    console.log('import { QueryBuilder } from "@querybuilder/core";');
    console.log('import { MySQL } from "@querybuilder/mysql";');
    console.log('import { PostgreSQL } from "@querybuilder/postgresql";');
    console.log('import { MongoDB } from "@querybuilder/mongodb";');
    console.log('```');

    console.log('\n🗑️ To remove links later: node unlink-local.js');
  } else {
    console.error('\n❌ No packages were linked successfully');
    process.exit(1);
  }
}

// Ejecutar
linkPackagesLocally().catch(error => {
  console.error('❌ Linking failed:', error.message);
  process.exit(1);
});