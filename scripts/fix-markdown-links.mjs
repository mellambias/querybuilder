#!/usr/bin/env node

/**
 * Script para actualizar enlaces de archivos .md a .html en la documentación JSDoc
 * Transforma: [texto](archivo.md) → [texto](archivo.html)
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs', 'jsdoc');

// Lista de archivos HTML donde buscar enlaces
const htmlFiles = [
    'index.html',
];

// Lista de archivos markdown que tienen versión HTML
const markdownFiles = [
    'CONFIG',
    'CONTRIBUTING',
    'CODE_OF_CONDUCT',
    'LOCAL_PUBLISHING',
    'PNPM_LOCAL_SETUP',
    'CLEANUP-VITEPRESS'
];

console.log('🔗 Actualizando enlaces de Markdown en documentación...\n');

let totalUpdated = 0;

for (const htmlFile of htmlFiles) {
    const filePath = path.join(docsDir, htmlFile);
    
    if (!await fs.pathExists(filePath)) {
        console.log(`  ⚠️  Archivo no encontrado: ${htmlFile}`);
        continue;
    }
    
    let content = await fs.readFile(filePath, 'utf8');
    let updated = false;
    let fileUpdates = 0;
    
    // Actualizar enlaces href="archivo.md" → href="archivo.html"
    for (const mdFile of markdownFiles) {
        // Pattern: href="CONFIG.md" → href="CONFIG.html"
        const pattern1 = new RegExp(`href="${mdFile}\\.md"`, 'g');
        if (pattern1.test(content)) {
            content = content.replace(pattern1, `href="${mdFile}.html"`);
            updated = true;
            fileUpdates++;
        }
        
        // Pattern: href='CONFIG.md' → href='CONFIG.html'
        const pattern2 = new RegExp(`href='${mdFile}\\.md'`, 'g');
        if (pattern2.test(content)) {
            content = content.replace(pattern2, `href='${mdFile}.html'`);
            updated = true;
            fileUpdates++;
        }
        
        // Pattern: ](CONFIG.md) → ](CONFIG.html) (enlaces markdown en código)
        const pattern3 = new RegExp(`\\]\\(${mdFile}\\.md\\)`, 'g');
        if (pattern3.test(content)) {
            content = content.replace(pattern3, `](${mdFile}.html)`);
            updated = true;
            fileUpdates++;
        }
    }
    
    if (updated) {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`  ✓ Actualizado: ${htmlFile} (${fileUpdates} enlaces)`);
        totalUpdated++;
    } else {
        console.log(`  - Sin cambios: ${htmlFile}`);
    }
}

console.log(`\n✅ Proceso completado: ${totalUpdated} archivo(s) actualizado(s)\n`);
