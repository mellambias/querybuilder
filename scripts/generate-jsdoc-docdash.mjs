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
