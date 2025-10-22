#!/usr/bin/env node

/**
 * Resumen Final de Integración
 * Ejecuta todos los tests y muestra un resumen consolidado
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 RESUMEN FINAL DE INTEGRACIÓN');
console.log('='.repeat(50));

async function runFinalSummary() {
  const results = [];

  try {
    // MySqlDriver Tests
    console.log('\n📊 Ejecutando MySqlDriver Tests...');
    const mysqlTest = await execAsync('node mysql-driver.test.js', {
      cwd: process.cwd(),
      timeout: 30000
    });

    const mysqlMatch = mysqlTest.stdout.match(/Success Rate: ([\d.]+)%/);
    const mysqlSuccess = mysqlMatch ? mysqlMatch[1] : 'Unknown';
    results.push({
      test: 'MySqlDriver Tests',
      status: mysqlSuccess === '100.0' ? '✅' : '❌',
      result: `${mysqlSuccess}% success`
    });

    // Complete Integration
    console.log('📊 Ejecutando Complete Integration Tests...');
    const integrationTest = await execAsync('node complete-integration.test.js', {
      cwd: process.cwd(),
      timeout: 30000
    });

    const integrationSuccess = integrationTest.stdout.includes('TODOS LOS TESTS PASARON');
    results.push({
      test: 'Complete Integration',
      status: integrationSuccess ? '✅' : '❌',
      result: integrationSuccess ? 'All tests passed' : 'Some tests failed'
    });

    // Import Validation
    console.log('📊 Ejecutando Import Validation...');
    const importTest = await execAsync('node validate-imports.js', {
      cwd: process.cwd(),
      timeout: 15000
    });

    const importMatch = importTest.stdout.match(/Success rate: ([\d.]+)%/);
    const importSuccess = importMatch ? importMatch[1] : 'Unknown';
    results.push({
      test: 'Import Validation',
      status: importSuccess === '100.0' ? '✅' : '❌',
      result: `${importSuccess}% success`
    });

  } catch (error) {
    results.push({
      test: 'Test execution',
      status: '❌',
      result: `Error: ${error.message}`
    });
  }

  // Display results
  console.log('\n🎯 RESULTADOS FINALES:');
  console.log('='.repeat(50));

  results.forEach(result => {
    console.log(`${result.status} ${result.test}: ${result.result}`);
  });

  const allSuccess = results.every(r => r.status === '✅');

  console.log('\n' + '='.repeat(50));
  if (allSuccess) {
    console.log('🎉 INTEGRACIÓN 100% EXITOSA');
    console.log('✅ Configuración centralizada funcionando');
    console.log('✅ MySqlDriver completamente operativo');
    console.log('✅ Tests al 100% de éxito');
    console.log('✅ Imports y paths validados');
    console.log('✅ Sistema listo para producción');
  } else {
    console.log('⚠️  INTEGRACIÓN PARCIAL');
    console.log('Revisar tests fallidos arriba');
  }

  return allSuccess;
}

runFinalSummary()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Error en resumen final:', error);
    process.exit(1);
  });
