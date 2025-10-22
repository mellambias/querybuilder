#!/usr/bin/env node

/**
 * Test de Validación de Imports y Paths
 * 
 * Este script verifica que todos los imports relativos funcionen correctamente
 * entre los diferentes módulos del sistema.
 */

console.log('🔍 Validando imports y paths del sistema...\n');

async function validateImports() {
  const results = [];

  try {
    // Test 1: Core config
    console.log('📁 Test 1: Importing core config...');
    const { config } = await import('../../core/config.js');
    results.push({
      module: '@querybuilder/core/config.js',
      status: '✅ SUCCESS',
      details: `Config loaded with ${Object.keys(config).length} sections`
    });

    // Test 2: MySqlDriver
    console.log('📁 Test 2: Importing MySqlDriver...');
    const MySqlDriverModule = await import('../drivers/MySqlDriver.js');
    const MySqlDriver = MySqlDriverModule.default;
    const driverInstance = new MySqlDriver(config.testing.MySQL.params);
    results.push({
      module: '@querybuilder/mysql/drivers/MySqlDriver.js',
      status: '✅ SUCCESS',
      details: `Driver instantiated with host: ${driverInstance.host}`
    });

    // Test 3: MySQL language
    console.log('📁 Test 3: Importing MySQL language...');
    const MySQLModule = await import('../MySQL.js');
    const MySQL = MySQLModule.default;
    const mysqlInstance = new MySQL();
    results.push({
      module: '@querybuilder/mysql/MySQL.js',
      status: '✅ SUCCESS',
      details: `Language created with dataType: ${mysqlInstance.dataType}`
    });

    // Test 4: QueryBuilder core
    console.log('📁 Test 4: Importing QueryBuilder...');
    const QueryBuilderModule = await import('../../core/querybuilder.js');
    const QueryBuilder = QueryBuilderModule.default;
    const qbInstance = new QueryBuilder(MySQL);
    results.push({
      module: '@querybuilder/core/querybuilder.js',
      status: '✅ SUCCESS',
      details: `QueryBuilder created with language: ${qbInstance.language.dataType}`
    });

    // Test 5: MysqlResult
    console.log('📁 Test 5: Importing MysqlResult...');
    const MysqlResultModule = await import('../results/MysqlResult.js');
    const MysqlResult = MysqlResultModule.default;
    results.push({
      module: '@querybuilder/mysql/results/MysqlResult.js',
      status: '✅ SUCCESS',
      details: 'MysqlResult class available'
    });

    // Test 6: Core Driver
    console.log('📁 Test 6: Importing core Driver...');
    const DriverModule = await import('../../core/drivers/Driver.js');
    const Driver = DriverModule.default;
    results.push({
      module: '@querybuilder/core/drivers/Driver.js',
      status: '✅ SUCCESS',
      details: 'Core Driver class available'
    });

    // Test 7: Test helpers
    console.log('📁 Test 7: Importing test-setup...');
    const testSetupModule = await import('./test-setup.js');
    results.push({
      module: '@querybuilder/mysql/test/test-setup.js',
      status: '✅ SUCCESS',
      details: `Test helpers: ${Object.keys(testSetupModule).length} functions available`
    });

  } catch (error) {
    results.push({
      module: 'Current test',
      status: '❌ FAILED',
      details: error.message
    });
  }

  // Display results
  console.log('\n📊 IMPORT VALIDATION RESULTS:');
  console.log('='.repeat(70));

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.status} ${result.module}`);
    console.log(`   ${result.details}\n`);
  });

  const successCount = results.filter(r => r.status.includes('SUCCESS')).length;
  const totalCount = results.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);

  console.log(`🎯 IMPORT VALIDATION SUMMARY:`);
  console.log(`   Total modules tested: ${totalCount}`);
  console.log(`   Successful imports: ${successCount}`);
  console.log(`   Failed imports: ${totalCount - successCount}`);
  console.log(`   Success rate: ${successRate}%`);

  if (successCount === totalCount) {
    console.log('\n✅ ALL IMPORTS WORKING CORRECTLY - SYSTEM PATHS VALIDATED');
    return true;
  } else {
    console.log('\n❌ SOME IMPORTS FAILED - SYSTEM NEEDS PATH FIXES');
    return false;
  }
}

validateImports()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 VALIDATION FAILED:', error);
    process.exit(1);
  });
