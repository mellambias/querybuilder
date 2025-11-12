import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateDocumentation } from './translate-jsdoc.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CONFIG_FILE = 'jsdoc.config.json';
const OUTPUT_DIR = 'docs/jsdoc';

async function generateJSDoc() {
  try {
    console.log('🔄 Generando documentación JSDoc con Docdash...\n');
    
    // Limpiar directorio anterior
    const outputPath = path.join(rootDir, OUTPUT_DIR);
    if (await fs.pathExists(outputPath)) {
      console.log(`🧹 Limpiando ${OUTPUT_DIR}...`);
      await fs.remove(outputPath);
    }
    
    // Generar documentación
    console.log('📚 Ejecutando JSDoc...');
    execSync(`npx jsdoc -c ${CONFIG_FILE}`, { 
      stdio: 'inherit',
      encoding: 'utf8',
      cwd: rootDir
    });
    
    // Traducir al castellano
    await translateDocumentation();
    
    // Copiar archivos markdown adicionales
    console.log('\n📄 Copiando archivos markdown adicionales...');
    const markdownFiles = [
      'CONFIG.md',
      'CONTRIBUTING.md',
      'CODE_OF_CONDUCT.md',
      'LOCAL_PUBLISHING.md',
      'PNPM_LOCAL_SETUP.md',
      'CLEANUP-VITEPRESS.md'
    ];
    
    for (const mdFile of markdownFiles) {
      const sourcePath = path.join(rootDir, mdFile);
      const destPath = path.join(outputPath, mdFile);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destPath);
        console.log(`  ✓ Copiado: ${mdFile}`);
      }
    }
    
    // Convertir archivos markdown a HTML
    console.log('\n📝 Convirtiendo Markdown a HTML...');
    execSync('node scripts/convert-md-to-html.mjs', {
      stdio: 'inherit',
      encoding: 'utf8',
      cwd: rootDir
    });
    
    // Paso 6: Actualizar enlaces .md → .html en archivos HTML
    console.log('\n🔗 Actualizando enlaces de Markdown...');
    execSync('node scripts/fix-markdown-links.mjs', {
      stdio: 'inherit',
      encoding: 'utf8',
      cwd: rootDir
    });
    
    // Paso 7: Agregar sección de recursos adicionales
    console.log('\n📚 Agregando sección de recursos...');
    execSync('node scripts/add-resources-section.mjs', {
      stdio: 'inherit',
      encoding: 'utf8',
      cwd: rootDir
    });
    
    console.log('\n✅ Documentación JSDoc generada exitosamente');
    console.log(`📁 Ubicación: ${OUTPUT_DIR}/index.html`);
    console.log(`🌐 URL local: http://localhost:3000/index.html`);
    console.log(`\n💡 Para ver la documentación, ejecuta: pnpm run docs:serve\n`);
    
  } catch (error) {
    console.error('❌ Error generando documentación:', error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    process.exit(1);
  }
}

generateJSDoc();
