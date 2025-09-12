/**
 * 🔧 MEJORAS AL PROXY - Extensiones para QueryBuilder
 * 
 * Este archivo contiene las extensiones al proxy de QueryBuilder para exponer
 * funciones adicionales de Core que actualmente no están disponibles.
 */

/**
 * Extiende el QueryBuilder con funciones adicionales de transacciones y strings
 * @param {QueryBuilder} QueryBuilderClass - Clase QueryBuilder a extender
 * @param {Core} CoreClass - Clase Core con las implementaciones
 */
export function extendQueryBuilderProxy(QueryBuilderClass, CoreClass) {

    // ✅ 1. Funciones de Transacciones
    QueryBuilderClass.prototype.startTransaction = function (options, next) {
        try {
            const command = this.language.startTransaction(options);
            return this.toNext([command, next], ";");
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.commit = function (next) {
        try {
            const command = this.language.commit();
            return this.toNext([command, next], ";");
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.rollback = function (savepoint, next) {
        try {
            const command = this.language.rollback(savepoint);
            return this.toNext([command, next], ";");
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.setSavePoint = function (name, next) {
        try {
            const command = this.language.setSavePoint(name);
            return this.toNext([command, next], ";");
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 2. Funciones String Avanzadas
    QueryBuilderClass.prototype.concat = function (columns, alias, next) {
        try {
            const command = this.language.concat(columns, alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.coalesce = function (columns, alias, next) {
        try {
            const command = this.language.coalesce(columns, alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.nullif = function (expr1, expr2, alias, next) {
        try {
            const command = this.language.nullif(expr1, expr2, alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 3. Funciones CASE mejoradas
    QueryBuilderClass.prototype.when = function (condition, result, next) {
        try {
            const command = this.language.when(condition, result, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.then = function (result, next) {
        try {
            const command = this.language.then(result, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.else = function (defaultValue, next) {
        try {
            const command = this.language.else(defaultValue, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.end = function (alias, next) {
        try {
            const command = this.language.end(alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 4. Funciones de Cursor mejoradas
    QueryBuilderClass.prototype.fetch = function (cursorName, variables, next) {
        try {
            const command = this.language.fetch(cursorName, variables, next);
            return this.toNext([command, next], ";");
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 5. Función getAccount para manejo de usuarios
    QueryBuilderClass.prototype.getAccount = function (userSpec, next) {
        try {
            const command = this.language.getAccount(userSpec, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 6. Funciones adicionales útiles
    QueryBuilderClass.prototype.trim = function (column, chars, alias, next) {
        try {
            const command = this.language.trim(column, chars, alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.ltrim = function (column, chars, alias, next) {
        try {
            const command = this.language.ltrim(column, chars, alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.rtrim = function (column, chars, alias, next) {
        try {
            const command = this.language.rtrim(column, chars, alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    QueryBuilderClass.prototype.length = function (column, alias, next) {
        try {
            const command = this.language.length(column, alias, next);
            return this.toNext([command, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 7. Mejorar limitaciones de UNION/INTERSECT/EXCEPT
    const originalUnion = QueryBuilderClass.prototype.union;
    QueryBuilderClass.prototype.union = function (...selects) {
        const next = selects[selects.length - 1];

        try {
            if (selects.length < 2) {
                throw new Error("UNION necesita mínimo dos instrucciones SELECT");
            }

            // Si hay solo una query y el contexto actual, usar la query actual como primera
            if (selects.length === 2 && typeof next === 'object') {
                const otherQuery = selects[0];
                const response = this.language.union([this, otherQuery], next, { all: false });
                return this.toNext([response, next]);
            }

            // Usar implementación original para múltiples queries
            return originalUnion.apply(this, selects);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 8. Agregar método insertInto como alias de insert
    QueryBuilderClass.prototype.insertInto = function (table, values, cols, next) {
        return this.insert(table, values, cols, next);
    };

    // ✅ 9. Mejorar manejo de LIMIT con OFFSET
    QueryBuilderClass.prototype.limitOffset = function (limit, offset, next) {
        try {
            if (!Number.isInteger(limit) || limit <= 0) {
                throw new Error("LIMIT debe ser un entero positivo");
            }
            if (!Number.isInteger(offset) || offset < 0) {
                throw new Error("OFFSET debe ser un entero no negativo");
            }

            const limitCmd = this.language.limit(limit);
            const offsetCmd = this.language.offset(offset);

            return this.toNext([limitCmd + " " + offsetCmd, next]);
        } catch (error) {
            next.error = error.message;
            return this.toNext([null, next]);
        }
    };

    // ✅ 10. Función de utilidad para verificar disponibilidad de funciones
    QueryBuilderClass.prototype.getAvailableFunctions = function () {
        const functions = [];
        const instance = this;

        // Funciones básicas
        const basicFunctions = [
            'select', 'from', 'where', 'orderBy', 'groupBy', 'having',
            'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'in', 'between',
            'isNull', 'isNotNull', 'and', 'or', 'not', 'exists',
            'innerJoin', 'leftJoin', 'rightJoin', 'fullJoin', 'crossJoin', 'on',
            'count', 'sum', 'avg', 'min', 'max',
            'insert', 'update', 'delete', 'createTable', 'dropTable',
            'dropQuery', 'toString'
        ];

        // Funciones extendidas
        const extendedFunctions = [
            'startTransaction', 'commit', 'rollback', 'setSavePoint',
            'concat', 'coalesce', 'nullif', 'when', 'then', 'else', 'end',
            'fetch', 'getAccount', 'trim', 'ltrim', 'rtrim', 'length',
            'insertInto', 'limitOffset'
        ];

        [...basicFunctions, ...extendedFunctions].forEach(fn => {
            if (typeof instance[fn] === 'function') {
                functions.push(fn);
            }
        });

        return {
            total: functions.length,
            functions: functions.sort(),
            basic: basicFunctions.filter(fn => typeof instance[fn] === 'function'),
            extended: extendedFunctions.filter(fn => typeof instance[fn] === 'function')
        };
    };

    console.log('✅ QueryBuilder proxy extendido con funciones adicionales');
    return QueryBuilderClass;
}

// Para uso directo si se importa el módulo
export default extendQueryBuilderProxy;
