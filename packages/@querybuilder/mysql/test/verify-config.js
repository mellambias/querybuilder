#!/usr/bin/env node

/**
 * Test simple para verificar configuración
 */

import { config } from '../../../../config.js';
import { initializeDatabase, cleanupDatabase, createTestDatabase } from './test-setup.js';

console.log('🔧 Verificando configuración del core...');

try {
  const testConfig = config.testing.MySQL;

  console.log('✅ Configuración cargada desde core/config.js:');
  console.log(`  Host: ${testConfig.params.host}`);
  console.log(`  Puerto: ${testConfig.params.port}`);
  console.log(`  Usuario: ${testConfig.params.username}`);
  console.log(`  Base de datos: ${testConfig.params.database}`);
  console.log(`  Password: ${testConfig.params.password ? '[SET]' : '[NOT SET]'}`);
  console.log(`  Driver: MariaDB`);

  if (!testConfig.params.password) {
    console.error('❌ Password no configurado en config.js');
    process.exit(1);
  }

  console.log('\n🌐 Probando conectividad con la base de datos...');

  // Crear base de datos de test
  await createTestDatabase();
  console.log('✅ Base de datos de test creada/verificada');

  // Inicializar conexión
  await initializeDatabase();
  console.log('✅ Conexión establecida exitosamente');

  // Limpiar
  await cleanupDatabase();
  console.log('✅ Conexiones cerradas correctamente');

  console.log('\n🎉 ¡Configuración y conectividad verificadas correctamente!');
  console.log('   Puedes proceder a ejecutar los tests completos.');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\n💡 Posibles soluciones:');
  console.error('  - Verificar que MariaDB esté ejecutándose');
  console.error('  - Verificar credenciales en core/config.js');
  console.error('  - Verificar permisos del usuario de base de datos');
  process.exit(1);
}
