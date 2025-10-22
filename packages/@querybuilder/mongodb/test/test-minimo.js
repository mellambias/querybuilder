/**
 * Test Mínimo: Verificar qué devuelve groupBy
 */

import { MongoDB } from '../MongoDB.js';
import Command from '../Command.js';

async function testMinimo() {
  console.log('🔍 Test Mínimo\n');

  try {
    const mongodb = new MongoDB();

    // Crear comando manualmente
    const cmd = new Command();
    console.log('Comando creado:', typeof cmd, cmd.constructor.name);

    // Llamar groupBy directamente
    console.log('\nLlamando groupBy...');
    const result = mongodb.groupBy('category', { total: { $count: {} } }, cmd);

    console.log('Resultado tipo:', typeof result);
    console.log('Resultado es null:', result === null);
    console.log('Resultado es cmd:', result === cmd);
    console.log('Resultado:', result);

    if (result) {
      console.log('result.groupBy:', result.groupBy);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  }
}

testMinimo().catch(console.error);
