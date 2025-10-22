#!/usr/bin/env node
/**
 * Servidor HTTP simple para la documentación JSDoc
 * Sirve los archivos HTML generados por JSDoc + Docdash
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DOCS_DIR = path.join(__dirname, 'docs', 'jsdoc');

// Tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Decodificar URL y remover query strings
  let filePath = decodeURIComponent(req.url.split('?')[0]);
  
  // Si termina en /, añadir index.html
  if (filePath === '/') {
    filePath = '/index.html';
  } else if (filePath.endsWith('/')) {
    filePath += 'index.html';
  }
  
  // Ruta completa al archivo
  const fullPath = path.join(DOCS_DIR, filePath);
  
  // Verificar que el archivo está dentro del directorio de documentación (seguridad)
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(DOCS_DIR)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }
  
  // Leer el archivo
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
      return;
    }
    
    // Determinar tipo MIME
    const ext = path.extname(fullPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║  📚 QueryBuilder - Documentación JSDoc                     ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📁 Directorio docs: ${DOCS_DIR}`);
  console.log('');
  console.log('📖 Accede a la documentación en:');
  console.log(`   → http://localhost:${PORT}/index.html`);
  console.log('');
  console.log('⌨️  Presiona Ctrl+C para detener el servidor');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
    console.error('   Cierra el proceso que está usando el puerto o cambia el puerto en este script');
  } else {
    console.error('❌ Error del servidor:', err);
  }
  process.exit(1);
});
