#!/usr/bin/env node
import fs from 'fs-extra';

const timestamp = new Date().toLocaleString('es-ES');
const changedFile = process.argv[2] || 'archivo desconocido';

console.log('🔄 Detectado cambio en JSDoc');
console.log(`📁 Archivo: ${changedFile}`);
console.log(`⏰ Tiempo: ${timestamp}`);

// Regenerar documentación JSDoc automáticamente
try {
  console.log('🔄 Regenerando documentación JSDoc...');
  const { execSync } = await import('child_process');
  
  execSync('node scripts/generate-docs-auto.mjs', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Documentación JSDoc regenerada automáticamente');
} catch (error) {
  console.error('❌ Error regenerando JSDoc:', error.message);
}

// Crear un archivo de estado actualizado
const statusContent = `---
title: Estado del Sistema JSDoc
description: Última actualización del sistema de documentación
---

# Estado del Sistema JSDoc

## ✅ Sistema Activo

**Última detección de cambios**: ${timestamp}  
**Archivo modificado**: \`${changedFile}\`  
**Estado**: ✅ Documentación regenerada automáticamente  

## 🔄 Proceso Automático

1. **Detección**: Cambio detectado en archivo JSDoc
2. **Regeneración**: Documentación actualizada automáticamente  
3. **Disponibilidad**: Nueva documentación lista en segundos

## 📋 Archivos Monitoreados

- \`src/querybuilder.js\` - Clase principal
- \`src/core.js\` - Funcionalidades centrales  
- \`src/column.js\` - Gestión de columnas
- \`packages/@querybuilder/*/src/\` - Módulos específicos

## 🎯 Sistema Operacional

El sistema de monitoreo está detectando cambios y **regenerando automáticamente** la documentación JSDoc.

**Para ver la documentación actualizada**: http://localhost:3000

---

*Actualizado automáticamente: ${timestamp}*
`;

try {
  await fs.ensureDir('docs-vitepress/api');
  await fs.writeFile('docs-vitepress/api/jsdoc-status.md', statusContent);
  console.log('✅ Archivo de estado actualizado');
  console.log('📖 Disponible en: http://localhost:3000/api/jsdoc-status');
} catch (error) {
  console.error('❌ Error actualizando estado:', error.message);
}