/**
 * Comandos ALTER TABLE específicos para PostgreSQL
 * Implementa funcionalidades de modificación de tablas
 */

/**
 * Comando ALTER TABLE genérico
 * @param {object} params - Parámetros del comando
 * @param {string} params.name - Nombre de la tabla
 * @returns {string} SQL base para ALTER TABLE
 */
export const alterTable = {
  name: (name) => `ALTER TABLE ${name}`,
  orden: ["name"],
};

/**
 * Agrega una columna a una tabla existente
 */
export const addColumn = {
  table: (table) => `ALTER TABLE ${table}`,
  name: (name, self) => {
    const definition = self._options?.definition || 'TEXT';
    let columnDef;

    if (typeof definition === 'string') {
      columnDef = definition;
    } else if (typeof definition === 'object') {
      columnDef = definition.type || 'TEXT';

      if (definition.notNull) {
        columnDef += ' NOT NULL';
      }
      if (definition.default !== undefined) {
        columnDef += ` DEFAULT ${definition.default}`;
      }
      if (definition.unique) {
        columnDef += ' UNIQUE';
      }
    }

    return `ADD COLUMN ${name} ${columnDef}`;
  },
  orden: ["table", "name"],
};

/**
 * Elimina una columna de una tabla
 */
export const dropColumn = {
  table: (table) => `ALTER TABLE ${table}`,
  name: (name, self) => {
    const options = self._options?.options || {};
    let sql = `DROP COLUMN ${name}`;

    if (options.cascade) {
      sql += ' CASCADE';
    } else if (options.restrict) {
      sql += ' RESTRICT';
    }

    return sql;
  },
  orden: ["table", "name"],
};