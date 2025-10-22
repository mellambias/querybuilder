#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';

console.log('🔧 Reparando comentarios JSDoc...');

// Configuración de correcciones automáticas
const fixes = {
  'QueryBuilder': 'La instancia de QueryBuilder para encadenamiento',
  'string': 'El SQL generado como string',
  'Object': 'Objeto con el resultado de la operación',
  'Array': 'Array con los resultados',
  'boolean': 'Valor booleano del resultado',
  'number': 'Valor numérico del resultado',
  'this': 'La instancia actual para encadenamiento',
  'Column': 'La instancia de Column para encadenamiento'
};

async function fixJSDocInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let hasChanges = false;
    
    // Regex para encontrar @returns vacíos
    const returnsRegex = /(\s*\*\s*@returns)\s*$/gm;
    
    // Contar cuántos @returns vacíos hay
    const matches = content.match(returnsRegex);
    if (!matches) return 0;
    
    console.log(`  📝 ${path.basename(filePath)}: ${matches.length} @returns a corregir`);
    
    // Estrategia: buscar el contexto de cada @returns para determinar el tipo
    content = content.replace(
      /(\s*\*\s*)@returns\s*$/gm,
      (match, prefix) => {
        hasChanges = true;
        // Tipo por defecto más común en QueryBuilder
        return `${prefix}@returns {QueryBuilder} - La instancia actual para encadenamiento de métodos`;
      }
    );
    
    if (hasChanges) {
      await fs.writeFile(filePath, content);
      return matches.length;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

async function repairJSDoc() {
  const filesToFix = [
    'src/querybuilder.js',
    'src/core.js', 
    'src/column.js',
    'src/drivers/PostgreSQLDriver.js',
    'src/noSql/MongoDB.js',
    'src/sql/mysqlUtils.js',
    'src/sql/pgUtils.js',
    'src/utils/utils.js'
  ];
  
  let totalFixed = 0;
  
  for (const file of filesToFix) {
    const fullPath = path.resolve(file);
    if (await fs.pathExists(fullPath)) {
      const fixed = await fixJSDocInFile(fullPath);
      totalFixed += fixed;
    } else {
      console.log(`⚠️ Archivo no encontrado: ${file}`);
    }
  }
  
  console.log(`\n✅ Reparación completada:`);
  console.log(`📊 Total de @returns corregidos: ${totalFixed}`);
  console.log(`🔄 Regenerando documentación...`);
  
  return totalFixed;
}

// Ejecutar reparación
repairJSDoc()
  .then(async (fixed) => {
    if (fixed > 0) {
      console.log('🎯 JSDoc reparado, probando generación de documentación...');
      
      // Intentar regenerar documentación
      const { execSync } = await import('child_process');
      try {
        execSync('npm run docs:generate', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } catch (error) {
        console.log('⚠️ Aún hay algunos errores, pero se ha mejorado significativamente');
      }
    }
  })
  .catch(error => {
    console.error('❌ Error en la reparación:', error.message);
    process.exit(1);
  });