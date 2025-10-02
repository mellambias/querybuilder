/*/*

Comandos específicos de SQLite - Implementa las operaciones DDL/DML/DQL específicasComandos específicos de SQLite 3

Basado en SQLite 3.40+ con soporte para JSON, Window Functions y másImplementa las variaciones y características únicas de SQLite

*/*/



const sqliteCommands = {
  const Sqlite3Commands = {

    // ================================  /**

    // DDL Commands   * CREATE TABLE para SQLite con características específicas

    // ================================   */

    createTable: {

	/**    CREATE: {

	 * Comando para crear tabla con opciones SQLite específicas      keyword: "CREATE",

	 */      required: true

	createTable: {},

      template: "CREATE TABLE{ifNotExists} {tableName} ({columns}){options}", TEMPORARY: {

        process: (params) => {
          keyword: "TEMPORARY",

            let result = params.template; required: false,

              condition: (params) => params.options?.temporary === true

          result = result.replace('{ifNotExists}', params.ifNotExists ? ' IF NOT EXISTS' : '');
        },

        result = result.replace('{tableName}', params.tableName); TABLE: {

          result = result.replace('{columns}', params.columns); keyword: "TABLE",

          result = result.replace('{options}', params.options || ''); required: true

        },

        return result; IF_NOT_EXISTS: {

        }      keyword: "IF NOT EXISTS",

      }, required: false,

      condition: (params) => params.options?.ifNotExists === true

	/**    },

	 * Comando para alterar tabla (limitado en SQLite)    NAME: {

	 */      keyword: "",

      alterTable: {
        required: true,

        template: "ALTER TABLE {tableName} {action}", value: (params) => params.name

		actions: {},

        addColumn: "ADD COLUMN {columnDefinition}", COLUMNS: {

          renameTable: "RENAME TO {newName}", keyword: "",

          renameColumn: "RENAME COLUMN {oldName} TO {newName}", required: true,

          dropColumn: "DROP COLUMN {columnName}" // Solo SQLite 3.35+      value: (params) => {

        }        if(!params.options?.cols) {

        },          throw new Error("Table columns are required");

        }

	/**

	 * Comando para crear índice        const columns = [];

	 */        for (const [colName, colDef] of Object.entries(params.options.cols)) {

  createIndex: {
    let columnSql = `${colName}`;

    template: "CREATE{unique} INDEX{ifNotExists} {indexName} ON {tableName} ({columns}){where}",

      process: (params) => {          // Tipo de datos

        let result = params.template; if (typeof colDef === 'string') {

          columnSql += ` ${colDef}`;

          result = result.replace('{unique}', params.unique ? ' UNIQUE' : '');
        } else if (colDef.type) {

          result = result.replace('{ifNotExists}', params.ifNotExists ? ' IF NOT EXISTS' : ''); columnSql += ` ${colDef.type}`;

          result = result.replace('{indexName}', params.indexName);
        }

        result = result.replace('{tableName}', params.tableName);

        result = result.replace('{columns}', params.columns);          // PRIMARY KEY

        result = result.replace('{where}', params.where ? ` WHERE ${params.where}` : ''); if (colDef.primaryKey === true) {

          columnSql += " PRIMARY KEY";

          return result;

        }            // AUTOINCREMENT (solo para INTEGER PRIMARY KEY)

      },            if (colDef.autoIncrement === true) {

        if (colDef.type?.toUpperCase() === 'INTEGER') {

	/**                columnSql += " AUTOINCREMENT";

	 * Comando para crear trigger              }

	 */            }

        createTrigger: { }

        template: "CREATE{temp} TRIGGER{ifNotExists} {triggerName} {timing} {event} ON {tableName}{forEachRow}{when} BEGIN {statements} END",

          timings: ['BEFORE', 'AFTER', 'INSTEAD OF'],          // NOT NULL

            events: ['INSERT', 'UPDATE', 'DELETE'],          if (colDef.notNull === true) {

              process: (params) => {
                columnSql += " NOT NULL";

                let result = params.template;
              }



              result = result.replace('{temp}', params.temp ? ' TEMP' : '');          // UNIQUE

              result = result.replace('{ifNotExists}', params.ifNotExists ? ' IF NOT EXISTS' : ''); if (colDef.unique === true) {

                result = result.replace('{triggerName}', params.triggerName); columnSql += " UNIQUE";

                result = result.replace('{timing}', params.timing);
              }

              result = result.replace('{event}', params.event);

              result = result.replace('{tableName}', params.tableName);          // DEFAULT

              result = result.replace('{forEachRow}', params.forEachRow ? ' FOR EACH ROW' : ''); if (colDef.default !== undefined) {

                result = result.replace('{when}', params.when ? ` WHEN ${params.when}` : ''); if (typeof colDef.default === 'string') {

                  result = result.replace('{statements}', params.statements); columnSql += ` DEFAULT '${colDef.default}'`;

                } else {

                  return result; columnSql += ` DEFAULT ${colDef.default}`;

                }
              }

            },
      }



    // ================================          // CHECK constraint

    // DML Commands          if (colDef.check) {

    // ================================            columnSql += ` CHECK (${colDef.check})`;

  }

	/**

	 * INSERT con opciones específicas de SQLite          // REFERENCES (Foreign Key)

	 */          if (colDef.references) {

    insert: {
      columnSql += ` REFERENCES ${colDef.references.table}(${colDef.references.column})`;

      template: "INSERT{orAction} INTO {tableName}{columns} VALUES {values}",

        orActions: ['OR ABORT', 'OR FAIL', 'OR IGNORE', 'OR REPLACE', 'OR ROLLBACK'],            if (colDef.references.onDelete) {

          process: (params) => {
            columnSql += ` ON DELETE ${colDef.references.onDelete}`;

            let result = params.template;
          }



          result = result.replace('{orAction}', params.orAction ? ` ${params.orAction}` : ''); if (colDef.references.onUpdate) {

            result = result.replace('{tableName}', params.tableName); columnSql += ` ON UPDATE ${colDef.references.onUpdate}`;

            result = result.replace('{columns}', params.columns ? ` (${params.columns})` : '');
          }

          result = result.replace('{values}', params.values);
        }



      return result; columns.push(columnSql);

    }
  }

},

        // Table constraints

	/**        if (params.options.constraints) {

	 * UPDATE con JOIN (SQLite 3.33+)          for (const constraint of params.options.constraints) {

	 */            columns.push(constraint);

update: { }

template: "UPDATE{orAction} {tableName} SET {assignments}{from}{where}",        }

process: (params) => {

  let result = params.template; return `(${columns.join(", ")})`;

}

result = result.replace('{orAction}', params.orAction ? ` ${params.orAction}` : '');    },

result = result.replace('{tableName}', params.tableName); WITHOUT_ROWID: {

  result = result.replace('{assignments}', params.assignments); keyword: "WITHOUT ROWID",

    result = result.replace('{from}', params.from ? ` FROM ${params.from}` : ''); required: false,

      result = result.replace('{where}', params.where ? ` WHERE ${params.where}` : ''); condition: (params) => params.options?.withoutRowid === true

},

return result; STRICT: {

} keyword: "STRICT",

	}, required: false,

  condition: (params) => params.options?.strict === true

/**    }

 * DELETE con JOIN  },

 */

delete: {  /**

		template: "DELETE FROM {tableName}{using}{where}",   * DROP TABLE para SQLite

		process: (params) => {   */

  let result = params.template; dropTable: {

    DROP: {

      result = result.replace('{tableName}', params.tableName); keyword: "DROP",

        result = result.replace('{using}', params.using ? ` USING ${params.using}` : ''); required: true

      result = result.replace('{where}', params.where ? ` WHERE ${params.where}` : '');
    },

    TABLE: {

      return result; keyword: "TABLE",

		} required: true

  },
},

IF_EXISTS: {

  // ================================      keyword: "IF EXISTS",

  // DQL Commands      required: false,

  // ================================      condition: (params) => params.options?.ifExists === true

},

	/**    NAME: {

	 * SELECT con todas las características de SQLite      keyword: "",

	 */      required: true,

  select: {
    value: (params) => params.name

  template: "{with}SELECT{distinct} {columns} FROM {tables}{joins}{where}{groupBy}{having}{orderBy}{limit}",    }

process: (params) => { },

  let result = params.template;

/**

result = result.replace('{with}', params.with ? `${params.with} ` : '');   * CREATE VIEW para SQLite

result = result.replace('{distinct}', params.distinct ? ' DISTINCT' : '');   */

result = result.replace('{columns}', params.columns); createView: {

  result = result.replace('{tables}', params.tables); CREATE: {

    result = result.replace('{joins}', params.joins || ''); keyword: "CREATE",

      result = result.replace('{where}', params.where ? ` WHERE ${params.where}` : ''); required: true

    result = result.replace('{groupBy}', params.groupBy ? ` GROUP BY ${params.groupBy}` : '');
  },

  result = result.replace('{having}', params.having ? ` HAVING ${params.having}` : ''); TEMPORARY: {

    result = result.replace('{orderBy}', params.orderBy ? ` ORDER BY ${params.orderBy}` : ''); keyword: "TEMPORARY",

      result = result.replace('{limit}', params.limit ? ` LIMIT ${params.limit}` : ''); required: false,

        condition: (params) => params.options?.temporary === true

    return result;
  },

} VIEW: {

}, keyword: "VIEW",

  required: true

	/**    },

	 * Common Table Expressions (CTE)    IF_NOT_EXISTS: {

	 */      keyword: "IF NOT EXISTS",

	with: {
  required: false,

    template: "WITH{recursive} {cteDefinitions}", condition: (params) => params.options?.ifNotExists === true

  process: (params) => { },

    let result = params.template; NAME: {

      keyword: "",

        result = result.replace('{recursive}', params.recursive ? ' RECURSIVE' : ''); required: true,

          result = result.replace('{cteDefinitions}', params.cteDefinitions); value: (params) => params.name

    },

  return result; COLUMNS: {

  } keyword: "",

	}, required: false,

  condition: (params) => params.options?.columns && params.options.columns.length > 0,

    // ================================      value: (params) => `(${params.options.columns.join(", ")})`

    // Window Functions    },

    // ================================    AS: {

    keyword: "AS",

	/**      required: true

	 * Funciones de ventana    },

	 */    SELECT: {

  windowFunction: {
    keyword: "",

      template: "{function}({arguments}) OVER ({partition}{orderBy}{frame})", required: true,

        functions: [value: (params) => params.options.select || params.next

			'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'PERCENT_RANK', 'CUME_DIST',    }

  'NTILE', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE'
},

		],

process: (params) => {  /**

			let result = params.template;   * CREATE INDEX para SQLite

			   */

  result = result.replace('{function}', params.function); createIndex: {

    result = result.replace('{arguments}', params.arguments || ''); CREATE: {

      result = result.replace('{partition}', params.partition ? `PARTITION BY ${params.partition} ` : ''); keyword: "CREATE",

        result = result.replace('{orderBy}', params.orderBy ? `ORDER BY ${params.orderBy} ` : ''); required: true

      result = result.replace('{frame}', params.frame || '');
    },

    UNIQUE: {

      return result; keyword: "UNIQUE",

		} required: false,

	}, condition: (params) => params.options?.unique === true

},

	// ================================    INDEX: {

	// JSON Functions      keyword: "INDEX",

	// ================================      required: true

    },

	/**    IF_NOT_EXISTS: {

	 * Funciones JSON específicas de SQLite      keyword: "IF NOT EXISTS",

	 */      required: false,

  jsonFunctions: {
    condition: (params) => params.options?.ifNotExists === true

  json: "JSON({value})",    },

jsonArray: "JSON_ARRAY({values})", NAME: {

  jsonObject: "JSON_OBJECT({pairs})", keyword: "",

    jsonExtract: "JSON_EXTRACT({json}, {path})", required: true,

      jsonSet: "JSON_SET({json}, {path}, {value})", value: (params) => params.name

  jsonInsert: "JSON_INSERT({json}, {path}, {value})",    },

jsonReplace: "JSON_REPLACE({json}, {path}, {value})", ON: {

  jsonRemove: "JSON_REMOVE({json}, {path})", keyword: "ON",

    jsonPatch: "JSON_PATCH({json}, {patch})", required: true

  jsonValid: "JSON_VALID({json})",    },

jsonType: "JSON_TYPE({json}, {path})", TABLE: {

  jsonArrayLength: "JSON_ARRAY_LENGTH({json}, {path})", keyword: "",

    jsonEach: "JSON_EACH({json})", required: true,

      jsonTree: "JSON_TREE({json})"      value: (params) => params.table

},    },

COLUMNS: {

  // ================================      keyword: "",

  // PRAGMA Commands      required: true,

  // ================================      value: (params) => {

  if (Array.isArray(params.columns)) {

	/**          return `(${params.columns.join(", ")})`;

	 * Comandos PRAGMA específicos de SQLite        }

	 */        return `(${params.columns})`;

    pragma: { }

    // Configuración de base de datos    },

    applicationId: "PRAGMA application_id = {value}", WHERE: {

      userVersion: "PRAGMA user_version = {value}", keyword: "WHERE",

        required: false,

          // Control de transacciones      condition: (params) => params.options?.where,

          journalMode: "PRAGMA journal_mode = {mode}", // DELETE, TRUNCATE, PERSIST, MEMORY, WAL, OFF      value: (params) => params.options.where

            synchronous: "PRAGMA synchronous = {level}", // OFF, NORMAL, FULL, EXTRA    }

		  },

    // Integridad y constraints

    foreignKeys: "PRAGMA foreign_keys = {boolean}",  /**

		checkpointFullfsync: "PRAGMA checkpoint_fullfsync = {boolean}",   * ALTER TABLE para SQLite (limitado)

		   */

      // Optimización  alterTable: {

      cacheSize: "PRAGMA cache_size = {size}", ALTER: {

      tempStore: "PRAGMA temp_store = {mode}", // DEFAULT, FILE, MEMORY      keyword: "ALTER",

        mmapSize: "PRAGMA mmap_size = {size}", required: true

    },

    // Información    TABLE: {

    tableInfo: "PRAGMA table_info({tableName})", keyword: "TABLE",

      indexList: "PRAGMA index_list({tableName})", required: true

    indexInfo: "PRAGMA index_info({indexName})",    },

  foreignKeyList: "PRAGMA foreign_key_list({tableName})", NAME: {

    keyword: "",

      // Mantenimiento      required: true,

      vacuum: "VACUUM", value: (params) => params.name

    reindex: "REINDEX {indexName}",    },

  analyze: "ANALYZE {tableName}", ACTION: {

    keyword: "",

      // Verificación      required: true,

      integrityCheck: "PRAGMA integrity_check", value: (params) => {

        quickCheck: "PRAGMA quick_check"        // SQLite solo soporta RENAME TO, ADD COLUMN, DROP COLUMN (desde 3.35.0)

      },        if (params.action === 'RENAME') {

        return `RENAME TO ${params.newName}`;

        // ================================        } else if (params.action === 'ADD_COLUMN') {

        // ATTACH/DETACH Commands          let columnDef = `ADD COLUMN ${params.column.name} ${params.column.type}`;

        // ================================

        if (params.column.notNull) {

          /**            columnDef += " NOT NULL";
        
           * Comandos para múltiples bases de datos          }
        
           */

          attach: {
            if (params.column.default !== undefined) {

              template: "ATTACH DATABASE '{filename}' AS {schemaName}", columnDef += ` DEFAULT ${params.column.default}`;

              process: (params) => { }

              return params.template

                .replace('{filename}', params.filename)          return columnDef;

				.replace('{schemaName}', params.schemaName);
            } else if (params.action === 'DROP_COLUMN') {

            } return `DROP COLUMN ${params.columnName}`;

          },
        } else if (params.action === 'RENAME_COLUMN') {

          return `RENAME COLUMN ${params.oldName} TO ${params.newName}`;

          detach: { }

          template: "DETACH DATABASE {schemaName}",

            process: (params) => {
              throw new Error(`Unsupported ALTER TABLE action: ${params.action}`);

              return params.template.replace('{schemaName}', params.schemaName);
            }

        }
      }

  },
},



// ================================  /**

// BACKUP/RESTORE Commands   * PRAGMA commands específicos de SQLite

// ================================   */

pragma: {

	/**    PRAGMA: {

	 * Comandos de backup      keyword: "PRAGMA",

	 */      required: true

  backup: { },

  template: ".backup {filename}", COMMAND: {

    process: (params) => {
      keyword: "",

			return params.template.replace('{filename}', params.filename); required: true,

		}      value: (params) => {

    },        if (params.value !== undefined) {

      return `${params.pragma} = ${params.value}`;

      restore: { }

      template: ".restore {filename}",        return params.pragma;

      process: (params) => { }

      return params.template.replace('{filename}', params.filename);
    }

  }
},

	},

/**

// ================================   * ATTACH DATABASE para SQLite

// EXPLAIN Commands   */

// ================================  attachDatabase: {

ATTACH: {

	/**      keyword: "ATTACH",

	 * Comandos de explicación de queries      required: true

	 */    },

explain: {
  DATABASE: {

    simple: "EXPLAIN {query}", keyword: "DATABASE",

      queryPlan: "EXPLAIN QUERY PLAN {query}", required: true

    process: (params) => { },

			const template = params.queryPlan ? params.queryPlan : params.simple; FILE: {

      return template.replace('{query}', params.query); keyword: "",

		} required: true,

	}, value: (params) => `'${params.file}'`

},

	// ================================    AS: {

	// Utility Functions      keyword: "AS",

	// ================================      required: true

    },

	/**    ALIAS: {

	 * Utilidades para construcción de queries      keyword: "",

	 */      required: true,

  utils: {
    value: (params) => params.alias

  /**    }

   * Escapa valores para prevenir SQL injection  },

   */

  escapeValue: (value) => {  /**

			if (typeof value === 'string') {   * DETACH DATABASE para SQLite

				return `'${value.replace(/'/g, "''")}'`;   */

  }  detachDatabase: {

    if (value === null || value === undefined) {
      DETACH: {

        return 'NULL'; keyword: "DETACH",

			} required: true

      return value.toString();
    },

  }, DATABASE: {

    keyword: "DATABASE",

		/**      required: false

		 * Escapa identificadores (nombres de tabla, columna, etc.)    },

		 */    ALIAS: {

      escapeIdentifier: (identifier) => {
        keyword: "",

			return `"${identifier.replace(/"/g, '""')}"`; required: true,

		}, value: (params) => params.alias

    }

    /**  }

     * Formatea lista de columnas};

     */

    formatColumns: (columns) => {
      export default Sqlite3Commands;
      if (Array.isArray(columns)) {
        return columns.join(', ');
      }
      return columns;
    },

      /**
       * Formatea condiciones WHERE
       */
      formatWhere: (conditions) => {
        if (Array.isArray(conditions)) {
          return conditions.join(' AND ');
        }
        return conditions;
      },

        /**
         * Genera placeholders para prepared statements
         */
        generatePlaceholders: (count) => {
          return Array(count).fill('?').join(', ');
        }
  }
};

export default sqliteCommands;