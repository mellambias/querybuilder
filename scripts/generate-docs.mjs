#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

/**
 * Genera documentación desde JSDoc y la limpia para VitePress
 */
function generateCleanDocs() {
  const timestamp = new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  console.log('🔄 Generando documentación desde JSDoc...');
  
  try {
    // Lista de archivos para procesar JSDoc
    const sourceFiles = [
      'src/querybuilder.js',
      'src/core.js',
      'src/column.js',
      'src/cursor.js',
      'src/transaction.js',
      'src/value.js',
      'src/expresion.js',
      'src/proxy.js'
    ];
    
    // Verificar qué archivos existen y tienen JSDoc
    const existingFiles = sourceFiles.filter(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('/**') || content.includes('* @');
      } catch {
        return false;
      }
    });
    
    let docContent = `# API Reference - QueryBuilder

Esta documentación se genera automáticamente desde los comentarios JSDoc del código fuente.

::: tip Actualización Automática
Esta página se regenera automáticamente cuando cambias código con comentarios JSDoc.
Para forzar la actualización: \`npm run docs:update\`
:::

`;

    if (existingFiles.length > 0) {
      try {
        // Intentar generar con jsdoc2md
        const rawOutput = execSync(`npx jsdoc2md ${existingFiles.join(' ')}`, { 
          encoding: 'utf8',
          cwd: process.cwd()
        });
        
        if (rawOutput && rawOutput.trim()) {
          // Limpiar el markdown para VitePress
          const cleanOutput = rawOutput
            // Eliminar todos los tags HTML problemáticos
            .replace(/<[^>]*>/g, '')
            // Reemplazar entidades HTML
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            // Limpiar espacios extra y saltos de línea
            .replace(/\n\s*\n\s*\n/g, '\n\n');
            
          docContent += cleanOutput;
        } else {
          docContent += generateFallbackContent(existingFiles);
        }
      } catch (jsdocError) {
        console.log('⚠️  jsdoc2md falló, generando contenido básico...');
        docContent += generateFallbackContent(existingFiles);
      }
    } else {
      docContent += `## Estado Actual

No se encontraron archivos con comentarios JSDoc válidos en las siguientes ubicaciones:
${sourceFiles.map(f => `- \`${f}\``).join('\n')}

### Para añadir documentación:

1. Agrega comentarios JSDoc a tus funciones:
   \`\`\`javascript
   /**
    * Descripción de la función
    * @param {string} param1 - Descripción del parámetro
    * @returns {Object} Descripción del retorno
    */
   function myFunction(param1) {
     // implementación
   }
   \`\`\`

2. Ejecuta: \`npm run docs:update\`
`;
    }

    docContent += `\n\n---

*Documentación generada automáticamente - ${timestamp}*`;

    // Escribir archivo limpio
    fs.writeFileSync('docs-vitepress/api/generated.md', docContent, 'utf8');
    console.log('✅ Documentación generada correctamente en docs-vitepress/api/generated.md');
    
  } catch (error) {
    console.error('❌ Error generando documentación:', error.message);
    process.exit(1);
  }
}

/**
 * Genera contenido de fallback cuando jsdoc2md falla
 */
function generateFallbackContent(existingFiles) {
  return `## Archivos con JSDoc Detectados

Se encontraron comentarios JSDoc en los siguientes archivos:
${existingFiles.map(f => `- \`${f}\``).join('\n')}

::: warning Generación Automática
La generación automática con jsdoc2md encontró un problema. 
La documentación se está procesando manualmente.
:::

### Archivos Disponibles

${existingFiles.map(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const functions = content.match(/\/\*\*[\s\S]*?\*\/[\s\S]*?function\s+(\w+)/g) || [];
    const classes = content.match(/\/\*\*[\s\S]*?\*\/[\s\S]*?class\s+(\w+)/g) || [];
    
    return `#### \`${file}\`
${functions.length > 0 ? `- **Funciones:** ${functions.length} detectadas` : ''}
${classes.length > 0 ? `- **Clases:** ${classes.length} detectadas` : ''}
`;
  } catch {
    return `#### \`${file}\`
- Archivo disponible para análisis
`;
  }
}).join('\n')}

### Siguiente Paso

Para ver la documentación completa, asegúrate de que los comentarios JSDoc estén en el formato correcto y ejecuta:

\`\`\`bash
npm run docs:update
\`\`\`
`;
}

generateCleanDocs();