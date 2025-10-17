import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distPath = join(__dirname, 'docs-vitepress', '.vitepress', 'dist')

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript', 
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
}

// Variables globales para el servidor
let currentServer = null
let currentPort = 3013

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

function serveFile(res, filePath) {
  try {
    const content = readFileSync(filePath)
    const mimeType = getMimeType(filePath)
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache'
    })
    res.end(content)
    return true
  } catch (error) {
    return false
  }
}

function createDocumentationServer(port = 3013) {
  return createServer((req, res) => {
    const now = new Date().toLocaleTimeString('es-ES')
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
    
    let url = req.url.split('?')[0] // Remove query parameters
    if (url === '/') url = '/index.html'
    
    // Try to serve the requested file
    let filePath = join(distPath, url)
    
    if (serveFile(res, filePath)) {
      console.log(`✅ ${now} - GET ${req.url} - 200`)
      return
    }
    
    // Try with .html extension for SPA routing
    if (!url.includes('.')) {
      filePath = join(distPath, url + '.html')
      if (serveFile(res, filePath)) {
        console.log(`✅ ${now} - GET ${req.url} - 200`)
        return
      }
    }
    
    // Try index.html for SPA fallback
    const indexPath = join(distPath, 'index.html')
    if (existsSync(indexPath)) {
      serveFile(res, indexPath)
      console.log(`✅ ${now} - GET ${req.url} - 200 (SPA fallback)`)
      return
    }
    
    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>404 - Página no encontrada</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          h1 { color: #d73a49; }
          a { color: #0969da; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>404 - Página no encontrada</h1>
        <p>La página solicitada no existe.</p>
        <p><a href="/">← Volver al inicio</a></p>
      </body>
      </html>
    `)
    console.log(`❌ ${now} - GET ${req.url} - 404`)
  })
}

function startServer(port = 3013) {
  const server = createDocumentationServer(port)
  
  server.listen(port, () => {
    console.log(`\n🚀 Servidor de Documentación VitePress`)
    console.log(`📁 Sirviendo: ${distPath}`)
    console.log(`🌐 URL: http://localhost:${port}`)
    console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-ES')}`)
    console.log(`\n🔄 Para reiniciar: Ctrl+R`)
    console.log(`⏹️  Para detener: Ctrl+C\n`)
  })
  
  return server
}

function restartServer() {
  if (currentServer) {
    console.log('\n🔄 Reiniciando servidor...')
    currentServer.close(() => {
      currentServer = startServer(currentPort)
    })
  } else {
    currentServer = startServer(currentPort)
  }
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2)
if (args.length > 0) {
  const port = parseInt(args[0])
  if (port && port > 0 && port < 65536) {
    currentPort = port
  }
}

// Manejar señales del sistema
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...')
  process.exit(0)
})

// Manejar Ctrl+R para reiniciar (en algunos terminales)
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.on('data', (key) => {
  if (key.toString('hex') === '12') { // Ctrl+R
    restartServer()
  } else if (key.toString('hex') === '03') { // Ctrl+C
    console.log('\n👋 Cerrando servidor...')
    process.exit(0)
  }
})

// Iniciar servidor
currentServer = startServer(currentPort)

// Exportar función de reinicio para uso externo
export { restartServer }