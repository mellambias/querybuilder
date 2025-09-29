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
 * @param {object} params - Parámetros del comando
 * @param {string} params.table - Nombre de la tabla
 * @param {string} params.name - Nombre de la columna
 * @param {string|object} params.definition - Definición de la columna
 * @returns {string} SQL para agregar columna
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

      // Agregar restricciones adicionales
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
 * @param {object} params - Parámetros del comando
 * @param {string} params.table - Nombre de la tabla
 * @param {string} params.name - Nombre de la columna
 * @param {object} params.options - Opciones adicionales
 * @returns {string} SQL para eliminar columna
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

/**
 * Modifica una columna existente
 * @param {object} params - Parámetros del comando
 * @param {string} params.table - Nombre de la tabla
 * @param {string} params.name - Nombre de la columna
 * @param {object} params.changes - Cambios a realizar
 * @returns {string} SQL para modificar columna
 */
export const alterColumn = {
  table: (table) => `ALTER TABLE ${table}`,
  name: (name, self) => {
    const changes = self._options?.changes || {};
    const commands = [];

    // Cambiar tipo de datos
    if (changes.type) {
      let typeCommand = `ALTER COLUMN ${name} TYPE ${changes.type}`;
      if (changes.using) {
        typeCommand += ` USING ${changes.using}`;
      }
      commands.push(typeCommand);
    }

    // Cambiar valor por defecto
    if (changes.default !== undefined) {
      if (changes.default === null) {
        commands.push(`ALTER COLUMN ${name} DROP DEFAULT`);
      } else {
        commands.push(`ALTER COLUMN ${name} SET DEFAULT ${changes.default}`);
      }
    }

    // Cambiar restricción NOT NULL
    if (changes.notNull !== undefined) {
      if (changes.notNull) {
        commands.push(`ALTER COLUMN ${name} SET NOT NULL`);
      } else {
        commands.push(`ALTER COLUMN ${name} DROP NOT NULL`);
      }
    }

    return commands.join(';\n');
  },
  orden: ["table", "name"],
};

/**
 * Agrega una restricción a la tabla
 * @param {object} params - Parámetros del comando
 * @param {string} params.table - Nombre de la tabla
 * @param {string} params.name - Nombre de la restricción
 * @param {string} params.type - Tipo de restricción
 * @param {string|array} params.columns - Columnas afectadas
 * @param {object} params.options - Opciones adicionales
 * @returns {string} SQL para agregar restricción
 */
export const addConstraint = {
  table: (table) => `ALTER TABLE ${table}`,
  name: (name, self) => {
    const { type, columns, options = {} } = self._options || {};

    let sql = `ADD CONSTRAINT ${name}`;

    switch (type?.toLowerCase()) {
      case 'primary key':
      case 'pk':
        const pkColumns = Array.isArray(columns) ? columns.join(', ') : columns;
        sql += ` PRIMARY KEY (${pkColumns})`;
        break;

      case 'foreign key':
      case 'fk':
        const fkColumns = Array.isArray(columns) ? columns.join(', ') : columns;
        sql += ` FOREIGN KEY (${fkColumns}) REFERENCES ${options.references}`;
        if (options.referencedColumns) {
          const refCols = Array.isArray(options.referencedColumns)
            ? options.referencedColumns.join(', ')
            : options.referencedColumns;
          sql += ` (${refCols})`;
        }

        // Opciones de integridad referencial
        if (options.onDelete) {
          sql += ` ON DELETE ${options.onDelete}`;
        }
        if (options.onUpdate) {
          sql += ` ON UPDATE ${options.onUpdate}`;
        }
        break;

      case 'unique':
        const uniqueColumns = Array.isArray(columns) ? columns.join(', ') : columns;
        sql += ` UNIQUE (${uniqueColumns})`;
        break;

      case 'check':
        sql += ` CHECK (${options.expression})`;
        break;

      case 'exclude':
        sql += ` EXCLUDE ${options.expression}`;
        break;

      default:
        throw new Error(`Tipo de restricción no soportado: ${type}`);
    }

    return sql;
  },
  orden: ["table", "name"],
};

/**
 * Elimina una restricción de la tabla
 * @param {object} params - Parámetros del comando
 * @param {string} params.table - Nombre de la tabla
 * @param {string} params.name - Nombre de la restricción
 * @param {object} params.options - Opciones adicionales
 * @returns {string} SQL para eliminar restricción
 */
export const dropConstraint = {
  table: (table) => `ALTER TABLE ${table}`,
  name: (name, self) => {
    const options = self._options?.options || {};

    let sql = `DROP CONSTRAINT ${name}`;

    if (options.cascade) {
      sql += ' CASCADE';
    } else if (options.restrict) {
      sql += ' RESTRICT';
    }

    return sql;
  },
  orden: ["table", "name"],
};

/**
 * Renombra una tabla
 * @param {object} params - Parámetros del comando
 * @param {string} params.oldName - Nombre actual de la tabla
 * @param {string} params.newName - Nuevo nombre de la tabla
 * @returns {string} SQL para renombrar tabla
 */
export const renameTable = {
  oldName: (oldName) => `ALTER TABLE ${oldName}`,
  newName: (newName) => `RENAME TO ${newName}`,
  orden: ["oldName", "newName"],
};

/**
 * Renombra una columna
 * @param {object} params - Parámetros del comando
 * @param {string} params.table - Nombre de la tabla
 * @param {string} params.oldName - Nombre actual de la columna
 * @param {string} params.newName - Nuevo nombre de la columna
 * @returns {string} SQL para renombrar columna
 */
export const renameColumn = {
  table: (table) => `ALTER TABLE ${table}`,
  oldName: (oldName, self) => {
    const newName = self._options?.newName || 'new_column';
    return `RENAME COLUMN ${oldName} TO ${newName}`;
  },
  orden: ["table", "oldName"],
};

/**
 * Establece el esquema propietario de la tabla
 * @param {object} params - Parámetros del comando
 * @param {string} params.table - Nombre de la tabla
 * @param {string} params.schema - Nombre del esquema
 * @returns {string} SQL para establecer esquema
 */
export const setSchema = {
  table: (table) => `ALTER TABLE ${table}`,
  schema: (schema) => `SET SCHEMA ${schema}`,
  orden: ["table", "schema"],
};