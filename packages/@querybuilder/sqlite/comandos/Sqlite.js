/**
 * @fileoverview Comandos específicos de SQLite
 * @description Implementa las operaciones DDL/DML/DQL específicas de SQLite 3
 * @module sqlite/comandos/Sqlite
 */

/**
 * Comandos específicos de SQLite con sus estructuras y opciones
 * @namespace Sqlite3Commands
 */
const Sqlite3Commands = {

  /**
   * CREATE TABLE para SQLite con características específicas
   * @type {Object}
   */
  createTable: {
    CREATE: {
      keyword: "CREATE",
      required: true
    },
    TABLE: {
      keyword: "TABLE",
      required: true
    },
    NAME: {
      keyword: "",
      required: true,
      value: (params) => params.name
    }
  },

  /**
   * DROP TABLE para SQLite
   * @type {Object}
   */
  dropTable: {
    DROP: {
      keyword: "DROP",
      required: true
    },
    TABLE: {
      keyword: "TABLE",
      required: true
    },
    NAME: {
      keyword: "",
      required: true,
      value: (params) => params.name
    }
  }
};

export default Sqlite3Commands;
