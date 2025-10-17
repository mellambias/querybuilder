/**
 * @fileoverview SQLite QueryBuilder - Implementa las variaciones específicas de SQLite
 * @description Clase especializada para SQLite que extiende Core con funcionalidades específicas del SGBD SQLite.
 * Incluye soporte para operaciones básicas y características específicas de SQLite.
 * @version 2.0.0
 * @author QueryBuilder Team
 * @license MIT
 * @since 1.0.0
 */

/**
 * @namespace QueryBuilder.Adapters.SQLite
 * @description Adaptador SQLite que extiende QueryBuilder con funcionalidades específicas de SQLite
 * @memberof QueryBuilder.Adapters
 * @example
 * // Instalación del adaptador SQLite
 * npm install @querybuilder/core @querybuilder/sqlite
 * 
 * // Uso del adaptador SQLite
 * import QueryBuilder from '@querybuilder/core';
 * import SQLite from '@querybuilder/sqlite';
 * 
 * const qb = new QueryBuilder(SQLite);
 * qb.select('*').from('users').where('active = 1');
 */

/**
 * Clase SQLite QueryBuilder para operaciones específicas de SQLite
 * @class SQLite
 * @memberof QueryBuilder.Adapters.SQLite
 * @description Implementa las variaciones específicas de SQLite.
 * Incluye soporte para operaciones básicas y características específicas de SQLite.
 * @since 1.0.0
 */
class SQLite { constructor() { this.dataType = "sqlite"; } createDatabase(name, options = {}) { return `-- Creating ${name}`; } createTable(name, options = {}) { return `CREATE TABLE ${options.ifNotExists ? "IF NOT EXISTS " : ""}${name} (...)`; } union(q1, q2) { return `${q1} UNION ${q2}`; } substr(str, start, len, alias) { return `SUBSTR(${str}, ${start}, ${len})${alias ? " AS " + alias : ""}`; } } export default SQLite;
