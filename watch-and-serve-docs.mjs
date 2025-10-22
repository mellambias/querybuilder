#!/usr/bin/env node
/**
 * Script para modo desarrollo de documentación
 * - Regenera JSDoc cuando cambian archivos
 * - Sirve la documentación en http://localhost:3000
 * 
 * Uso: node watch-and-serve-docs.mjs
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║  📚 QueryBuilder - Modo Desarrollo de Documentación       ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// Proceso 1: Servidor HTTP
console.log('🌐 Iniciando servidor HTTP...');
const server = spawn('node', ['serve-docs-jsdoc.mjs'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Proceso 2: Watcher de JSDoc
console.log('👁️  Iniciando watcher de archivos...');
console.log('');
const watcher = spawn('pnpm', [
  'exec', 'nodemon',
  '--watch', 'packages/@querybuilder',
  '--ext', 'js',
  '--exec', 'node scripts/generate-jsdoc-docdash.mjs'
], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Manejar errores
server.on('error', (err) => {
  console.error('❌ Error en el servidor:', err);
});

watcher.on('error', (err) => {
  console.error('❌ Error en el watcher:', err);
});

// Manejar cierre
const cleanup = () => {
  console.log('\n\n🛑 Deteniendo procesos...');
  server.kill();
  watcher.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Servidor cerrado con código ${code}`);
    watcher.kill();
    process.exit(code);
  }
});

watcher.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Watcher cerrado con código ${code}`);
    server.kill();
    process.exit(code);
  }
});
