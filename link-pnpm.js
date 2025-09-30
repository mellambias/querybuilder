#!/usr/bin/env node

/**
 * 🔗 PNPM Local Package Linker for QueryBuilder
 * =============================================
 * 
 * Usa pnpm para crear enlaces locales optimizados
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
 * 🔗 Crear enlaces locales usando pnpm workspace
 */
async function linkWithPnpm() {
  console.log('🔗 Creating PNPM local package links for QueryBuilder...');
  console.log('===================================================');

  // Verificar que dist existe
  if (!await fs.pathExists(DIST_DIR)) {
    console.error('❌ Distribution not found. Run "npm run build:dist" first');
    process.exit(1);
  }

  // Verificar que pnpm está disponible
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
  } catch (e) {
    console.error('❌ PNPM not found. Install with: npm install -g pnpm');
    process.exit(1);
  }

  const packages = ['core', 'mysql', 'postgresql', 'mongodb'];
  const linkedPackages = [];

  // Crear enlaces usando pnpm con store local
  for (const pkg of packages) {
    const packagePath = path.join(DIST_DIR, '@querybuilder', pkg);

    if (await fs.pathExists(packagePath)) {
      try {
        console.log(`🔗 Linking @querybuilder/${pkg} with PNPM...`);

        // Para PNPM, intentamos primero con global, si falla usamos local
        try {
          execSync('pnpm link --global', {
            cwd: packagePath,
            stdio: 'pipe'
          });

          linkedPackages.push({
            name: `@querybuilder/${pkg}`,
            manager: 'pnpm-global'
          });
          console.log(`   ✅ Linked @querybuilder/${pkg} globally`);

        } catch (globalError) {
          // Si falla global, intentar con link local al workspace
          console.log(`   ⚠️  Global link failed, trying workspace link...`);

          // Crear enlace en el workspace actual
          const workspacePkgDir = path.join(ROOT_DIR, 'node_modules', '@querybuilder');
          await fs.ensureDir(workspacePkgDir);

          const symlinkTarget = path.join(workspacePkgDir, pkg);
          if (await fs.pathExists(symlinkTarget)) {
            await fs.remove(symlinkTarget);
          }

          // Crear enlace simbólico
          await fs.ensureSymlink(packagePath, symlinkTarget, 'junction');

          linkedPackages.push({
            name: `@querybuilder/${pkg}`,
            manager: 'pnpm-workspace'
          });
          console.log(`   ✅ Linked @querybuilder/${pkg} in workspace`);
        }

      } catch (error) {
        console.error(`   ❌ Failed to link @querybuilder/${pkg}:`, error.message);
      }
    } else {
      console.warn(`   ⚠️  Package not found: @querybuilder/${pkg}`);
    }
  }

  if (linkedPackages.length > 0) {
    console.log(`\n✅ Successfully linked ${linkedPackages.length} packages with PNPM!`);

    console.log('\n📋 To use in other projects with PNPM:');
    console.log('────────────────────────────────────────');
    console.log('cd your-project');

    const hasGlobal = linkedPackages.some(p => p.manager === 'pnpm-global');
    const hasWorkspace = linkedPackages.some(p => p.manager === 'pnpm-workspace');

    if (hasGlobal) {
      console.log('\n🌐 For globally linked packages:');
      linkedPackages.filter(p => p.manager === 'pnpm-global').forEach(pkg => {
        console.log(`pnpm link --global ${pkg.name}`);
      });
    }

    if (hasWorkspace) {
      console.log('\n🔗 For workspace linked packages:');
      console.log('Add to your project\'s package.json:');
      console.log('"dependencies": {');
      linkedPackages.filter(p => p.manager === 'pnpm-workspace').forEach(pkg => {
        console.log(`  "${pkg.name}": "workspace:*",`);
      });
      console.log('}');
      console.log('\nOr use file: protocol:');
      linkedPackages.filter(p => p.manager === 'pnpm-workspace').forEach(pkg => {
        const relativePath = path.relative(process.cwd(), path.join(DIST_DIR, '@querybuilder', pkg.name.split('/')[1]));
        console.log(`  "${pkg.name}": "file:${relativePath}"`);
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

    console.log('\n🗑️ To remove links: node unlink-pnpm.js');
  } else {
    console.error('\n❌ No packages were linked successfully');
    process.exit(1);
  }
}

// Ejecutar
linkWithPnpm().catch(error => {
  console.error('❌ PNPM linking failed:', error.message);
  process.exit(1);
});