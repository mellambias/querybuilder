/**
 * @fileoverview MySQL QueryBuilder Package - Punto de entrada principal
 * @module @querybuilder/mysql
 * @description Adaptador MySQL para QueryBuilder con soporte completo para características
 * específicas de MySQL incluyendo tipos de datos nativos, funciones, operadores y comandos SQL.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MPL-2.0
 * @since 1.0.0
 * 
 * @example
 * // Importar el adaptador MySQL
 * import { MySQL } from '@querybuilder/mysql';
 * import QueryBuilder from '@querybuilder/core';
 * 
 * // Crear instancia con MySQL
 * const qb = new QueryBuilder(MySQL);
 * 
 * @example
 * // Usar características específicas de MySQL
 * const query = qb
 *   .select('*')
 *   .from('users')
 *   .where('email', 'LIKE', '%@example.com')
 *   .orderBy('created_at', 'DESC')
 *   .limit(10);
 */

// MySQL QueryBuilder exports
export { default as MySQL } from '../MySQL.js';

// Re-export core functionality
export {
  QueryBuilder,
  Core,
  Column,
  Expresion,
  Value,
  Transaction,
  Cursor,
  SQL2006
} from '@querybuilder/core';
