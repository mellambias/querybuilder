// 🚀 **ROLLUP CONFIGURATION - MINIFICACIÓN COMPLETA**
// Configuración para minificar TODOS los archivos de QueryBuilder

import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import filesize from 'rollup-plugin-filesize';

// 📦 **CONFIGURACIÓN DE OPTIMIZACIÓN AGRESIVA**
const terserConfig = {
  compress: {
    drop_console: false,        // Mantener console.log para debugging
    drop_debugger: true,        // Remover debugger statements
    pure_funcs: ['console.debug', 'console.trace'],
    unsafe_arrows: true,        // Optimizar arrow functions
    unsafe_methods: true,       // Optimizar métodos
    unsafe_proto: true,         // Optimizar prototipos
    passes: 3,                  // Múltiples pasadas de optimización
    dead_code: true,            // Eliminar código muerto
    collapse_vars: true,        // Colapsar variables
    reduce_vars: true,          // Reducir variables
    computed_props: true,       // Optimizar propiedades computadas
    hoist_funs: true,          // Hoisting de funciones
    hoist_vars: true,          // Hoisting de variables
    if_return: true,           // Optimizar if-return
    join_vars: true,           // Unir declaraciones de variables
    sequences: true,           // Crear secuencias
    side_effects: false,       // Asumir código sin efectos secundarios
    warnings: false            // Suprimir warnings de minificación
  },
  mangle: {
    properties: {
      regex: /^_/,             // Minificar propiedades privadas (_prop)
      reserved: []             // No reservar propiedades específicas
    },
    keep_fnames: false,        // Minificar nombres de función
    safari10: true,            // Compatibilidad Safari 10
    reserved: [                // ⚠️ NO MINIFICAR APIs PÚBLICAS
      // Core Classes
      'QueryBuilder', 'Driver', 'Result', 'Column', 'Cursor', 'Expression', 'Value', 'Transaction',

      // Database Drivers
      'MySQL', 'PostgreSQL', 'MongoDB', 'MySqlDriver', 'PostgreSQLDriver', 'MongodbDriver',

      // Results
      'MySqlResult', 'PostgreSQLResult', 'MongoResult',

      // Public Methods (mantenemos APIs)
      'select', 'insert', 'update', 'delete', 'from', 'where', 'join', 'orderBy', 'groupBy', 'having',
      'limit', 'offset', 'execute', 'first', 'get', 'count', 'exists', 'raw', 'toSQL',

      // Utility Methods
      'connect', 'disconnect', 'transaction', 'commit', 'rollback'
    ]
  },
  format: {
    comments: function (node, comment) {
      // Mantener solo comentarios importantes (licencia, JSDoc públicos)
      const text = comment.value;
      return text.includes('@license') ||
        text.includes('@copyright') ||
        text.includes('PROPRIETARY') ||
        text.includes('@public') ||
        text.includes('@api');
    },
    preserve_annotations: true,  // Mantener anotaciones importantes
    safari10: true              // Compatibilidad Safari 10
  },
  sourceMap: true,              // Generar source maps
  keep_classnames: true,        // Mantener nombres de clase para debugging
  toplevel: false               // No minificar scope global
};

// 🧹 **CONFIGURACIÓN DE LIMPIEZA DE CÓDIGO**
const cleanupConfig = {
  comments: ['some', /^!/],     // Mantener comentarios importantes
  compactComments: true,        // Compactar comentarios
  maxEmptyLines: 1,            // Máximo 1 línea vacía
  extensions: ['js'],          // Solo archivos JS
  include: ['**/*.js'],        // Incluir todos los JS
  exclude: ['node_modules/**'] // Excluir node_modules
};

// 📊 **CONFIGURACIÓN DE REPORTE DE TAMAÑOS**
const filesizeConfig = {
  showMinifiedSize: true,       // Mostrar tamaño minificado
  showGzippedSize: true,       // Mostrar tamaño gzipped
  showBrotliSize: true,        // Mostrar tamaño brotli
  theme: 'dark'                // Tema oscuro para reportes
};

// 🎯 **FUNCIÓN PARA CREAR CONFIGURACIÓN DE PAQUETE PRINCIPAL**
function createPackageConfig(packageName, inputFile, outputDir) {
  const baseName = packageName.replace('@querybuilder/', '');

  return [
    // 🚀 Versión PRODUCTION ÚNICA (minificada, optimizada)
    {
      input: inputFile,
      output: {
        file: `${outputDir}/${baseName}.min.js`,
        format: 'es',
        sourcemap: true,
        generatedCode: 'es2015'
      },
      plugins: [
        nodeResolve({
          preferBuiltins: false,
          browser: true
        }),
        commonjs(),
        cleanup(cleanupConfig),
        terser(terserConfig),
        filesize(filesizeConfig)
      ],
      external: [
        '@querybuilder/core',
        '@querybuilder/mysql',
        '@querybuilder/postgresql',
        '@querybuilder/mongodb'
      ]
    },

    // 📱 Versión BUNDLE (todo incluido, para CDN)
    {
      input: inputFile,
      output: {
        file: `${outputDir}/${baseName}.bundle.min.js`,
        format: 'umd',
        name: `QueryBuilder${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`,
        sourcemap: true,
        generatedCode: 'es2015'
      },
      plugins: [
        nodeResolve({
          preferBuiltins: false,
          browser: true
        }),
        commonjs(),
        cleanup(cleanupConfig),
        terser(terserConfig),
        filesize(filesizeConfig)
      ]
      // Sin external - bundlea todo
    }
  ];
}

// 🔧 **FUNCIÓN PARA MINIFICAR ARCHIVOS AUXILIARES**
function createAuxiliaryConfig(inputFile, outputFile) {
  return {
    input: inputFile,
    output: {
      file: outputFile,
      format: 'es',
      sourcemap: true,
      generatedCode: 'es2015'
    },
    plugins: [
      cleanup(cleanupConfig),
      terser(terserConfig),
      filesize(filesizeConfig)
    ],
    external: []
  };
}

// 🏗️ **CONFIGURACIONES DE TODOS LOS PAQUETES**
export default [
  // @querybuilder/core - Paquetes principales
  ...createPackageConfig(
    '@querybuilder/core',
    'packages/@querybuilder/core/querybuilder.js',
    'dist/@querybuilder/core'
  ),

  // @querybuilder/mysql  
  ...createPackageConfig(
    '@querybuilder/mysql',
    'packages/@querybuilder/mysql/MySQL.js',
    'dist/@querybuilder/mysql'
  ),

  // @querybuilder/postgresql
  ...createPackageConfig(
    '@querybuilder/postgresql',
    'packages/@querybuilder/postgresql/PostgreSQL.js',
    'dist/@querybuilder/postgresql'
  ),

  // @querybuilder/mongodb
  ...createPackageConfig(
    '@querybuilder/mongodb',
    'packages/@querybuilder/mongodb/MongoDB.js',
    'dist/@querybuilder/mongodb'
  ),

  // 🔧 **ARCHIVOS AUXILIARES MINIFICADOS**

  // Core - Archivos auxiliares
  createAuxiliaryConfig(
    'packages/@querybuilder/core/column.js',
    'dist/@querybuilder/core/column.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/cursor.js',
    'dist/@querybuilder/core/cursor.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/expresion.js',
    'dist/@querybuilder/core/expresion.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/transaction.js',
    'dist/@querybuilder/core/transaction.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/value.js',
    'dist/@querybuilder/core/value.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/proxy.js',
    'dist/@querybuilder/core/proxy.min.js'
  ),

  // Core - Drivers
  createAuxiliaryConfig(
    'packages/@querybuilder/core/drivers/Driver.js',
    'dist/@querybuilder/core/drivers/Driver.min.js'
  ),

  // Core - Results
  createAuxiliaryConfig(
    'packages/@querybuilder/core/results/Result.js',
    'dist/@querybuilder/core/results/Result.min.js'
  ),

  // Core - Utils
  createAuxiliaryConfig(
    'packages/@querybuilder/core/utils/utils.js',
    'dist/@querybuilder/core/utils/utils.min.js'
  ),

  // Core - Types
  createAuxiliaryConfig(
    'packages/@querybuilder/core/types/dataTypes.js',
    'dist/@querybuilder/core/types/dataTypes.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/types/privilegios.js',
    'dist/@querybuilder/core/types/privilegios.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/types/reservedWords.js',
    'dist/@querybuilder/core/types/reservedWords.min.js'
  ),
  createAuxiliaryConfig(
    'packages/@querybuilder/core/types/Type.js',
    'dist/@querybuilder/core/types/Type.min.js'
  ),

  // MySQL - Drivers
  createAuxiliaryConfig(
    'packages/@querybuilder/mysql/drivers/MySqlDriver.js',
    'dist/@querybuilder/mysql/drivers/MySqlDriver.min.js'
  ),

  // PostgreSQL - Drivers
  createAuxiliaryConfig(
    'packages/@querybuilder/postgresql/drivers/PostgreSQLDriver.js',
    'dist/@querybuilder/postgresql/drivers/PostgreSQLDriver.min.js'
  ),

  // PostgreSQL - Extended
  createAuxiliaryConfig(
    'packages/@querybuilder/postgresql/postgresql-extended.js',
    'dist/@querybuilder/postgresql/postgresql-extended.min.js'
  ),

  // MongoDB - Drivers
  createAuxiliaryConfig(
    'packages/@querybuilder/mongodb/drivers/MongodbDriver.js',
    'dist/@querybuilder/mongodb/drivers/MongodbDriver.min.js'
  ),

  // MongoDB - Utils
  createAuxiliaryConfig(
    'packages/@querybuilder/mongodb/mongoUtils.js',
    'dist/@querybuilder/mongodb/mongoUtils.min.js'
  ),

  // MongoDB - Command
  createAuxiliaryConfig(
    'packages/@querybuilder/mongodb/Command.js',
    'dist/@querybuilder/mongodb/Command.min.js'
  )
];