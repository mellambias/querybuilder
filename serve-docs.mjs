#!/usr/bin/env node

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.argv[2] || 3000;
const staticDir = join(__dirname, 'docs-vitepress', '.vitepress', 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
  try {
    let filePath = req.url.split('?')[0]; // Remove query parameters
    
    // Default to index.html if no file specified
    if (filePath === '/') {
      filePath = '/index.html';
    }
    
    const fullPath = join(staticDir, filePath);
    const ext = extname(fullPath);
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    const content = await readFile(fullPath);
    
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
    
    console.log(`✅ ${new Date().toLocaleTimeString()} - GET ${filePath} - 200`);
    
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>404 - Not Found</title></head>
        <body>
          <h1>404 - File Not Found</h1>
          <p>The requested file <code>${req.url}</code> was not found.</p>
          <p><a href="/">← Back to home</a></p>
        </body>
      </html>
    `);
    console.log(`❌ ${new Date().toLocaleTimeString()} - GET ${req.url} - 404`);
  }
});

server.listen(port, () => {
  console.log(`
🚀 VitePress Documentation Server
📁 Serving: ${staticDir}
🌐 URL: http://localhost:${port}
⏰ Started: ${new Date().toLocaleString()}

Press Ctrl+C to stop
  `);
});