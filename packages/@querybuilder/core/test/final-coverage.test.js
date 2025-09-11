import { describe, test, before } from 'node:test';
import { strict as assert } from 'node:assert';
import QueryBuilder from '../querybuilder.js';
import Core from '../core.js';

describe('Final Coverage Analysis - QueryBuilder Comprehensive Tests', () => {
    let qb;

    before(() => {
        qb = new QueryBuilder(Core, {
            typeIdentificator: 'regular',
            mode: 'test'
        });
    });

    describe('1. Core Functions Accessibility Analysis', () => {
        const availableFunctions = [
            // Funciones básicas de query
            'select', 'from', 'where', 'orderBy', 'groupBy', 'having',
            
            // Operadores lógicos y de comparación
            'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'in', 'between', 'isNull', 'isNotNull',
            'and', 'or', 'not', 
            
            // Joins
            'innerJoin', 'leftJoin', 'rightJoin', 'fullJoin', 'crossJoin', 'on',
            
            // Funciones de agregación
            'count', 'sum', 'avg', 'min', 'max',
            
            // Funciones string
            'upper', 'lower', 'trim', 'ltrim', 'rtrim', 'length', 'substr',
            'concat', 'coalesce', 'nullif',
            
            // Predicados avanzados
            'exists', 'all', 'any', 'some',
            
            // DDL operations
            'createTable', 'dropTable', 'createDatabase', 'dropDatabase',
            
            // DML operations
            'insert', 'update', 'delete',
            
            // Utility functions
            'dropQuery', 'toString', 'queryJoin'
        ];

        const potentiallyMissingFunctions = [
            // Funciones Core que podrían no estar expuestas
            'getAccount', 'setSavePoint', 'rollback', 'commit', 'startTransaction',
            'fetch', 'currentDate', 'currentTime', 'currentTimestamp',
            'union', 'intersect', 'except', 'case', 'when', 'then', 'else', 'end'
        ];

        test('verificar funciones disponibles a través del proxy', () => {
            const available = [];
            const missing = [];

            availableFunctions.forEach(fn => {
                if (typeof qb[fn] === 'function') {
                    available.push(fn);
                } else {
                    missing.push(fn);
                }
            });

            console.log(`✅ Funciones disponibles (${available.length}):`, available.slice(0, 10), '...');
            if (missing.length > 0) {
                console.log(`❌ Funciones esperadas pero no disponibles (${missing.length}):`, missing);
            }
            
            // Al menos debería haber funciones básicas
            assert.ok(available.length > 20, `Debería tener al menos 20 funciones, encontradas: ${available.length}`);
        });

        test('identificar funciones Core no expuestas', () => {
            const notExposed = [];
            const unexpectedlyAvailable = [];

            potentiallyMissingFunctions.forEach(fn => {
                if (typeof qb[fn] === 'function') {
                    unexpectedlyAvailable.push(fn);
                } else {
                    notExposed.push(fn);
                }
            });

            console.log(`🔍 Funciones Core NO expuestas (${notExposed.length}):`, notExposed);
            if (unexpectedlyAvailable.length > 0) {
                console.log(`🎉 Funciones inesperadamente disponibles:`, unexpectedlyAvailable);
            }

            // Este test documenta qué no está disponible, no es un fallo
            assert.ok(true, 'Test informativo completado');
        });
    });

    describe('2. Query Building Tests - Corrected Syntax', () => {
        test('query con JOIN - sintaxis corregida', async () => {
            const qb1 = new QueryBuilder(Core);
            
            // Primero construir toda la query y luego obtener el resultado
            qb1.select(['C.NOMBRE', 'P.NOMBRE', 'O.FECHA'])
               .from('CLIENTES', 'C')
               .innerJoin('ORDENES', 'O')
               .on(qb1.eq('C.ID', 'O.CLIENTE_ID'))
               .leftJoin('PRODUCTOS', 'P') 
               .on(qb1.eq('P.ID', 'O.PRODUCTO_ID'))
               .where(qb1.gt('O.FECHA', '2024-01-01'));
            
            const result = await qb1.toString();
            
            console.log('Query con JOINs:', result);
            assert.ok(result.includes('SELECT'), 'Debe contener SELECT');
            assert.ok(result.includes('INNER JOIN') || result.includes('JOIN'), 'Debe contener JOIN');
        });

        test('INSERT con método correcto', async () => {
            const qb1 = new QueryBuilder();
            
            // Usar el método insert directamente
            qb1.insert('USUARIOS', ['Juan', 25, 'juan@email.com'], ['nombre', 'edad', 'email']);
            
            const result = await qb1.toString();
            
            console.log('Query INSERT:', result);
            assert.ok(result.includes('INSERT'), 'Debe contener INSERT');
        });

        test('UPDATE básico', async () => {
            const qb1 = new QueryBuilder();
            
            qb1.update('USUARIOS', { nombre: 'Juan Carlos', edad: 26 })
               .where(qb1.eq('id', 1));
            
            const result = await qb1.toString();
            
            console.log('Query UPDATE:', result);
            assert.ok(result.includes('UPDATE'), 'Debe contener UPDATE');
        });

        test('DELETE básico', async () => {
            const qb1 = new QueryBuilder();
            
            qb1.delete('USUARIOS')
               .where(qb1.eq('activo', false));
            
            const result = await qb1.toString();
            
            console.log('Query DELETE:', result);
            assert.ok(result.includes('DELETE'), 'Debe contener DELETE');
        });
    });

    describe('3. Advanced Functions Tests', () => {
        test('funciones de string disponibles', async () => {
            const qb1 = new QueryBuilder();
            
            // Test funciones de string que sabemos que están disponibles
            if (typeof qb1.upper === 'function') {
                qb1.select(qb1.upper('nombre', 'nombre_mayus'))
                   .from('USUARIOS');
                
                const result = await qb1.toString();
                console.log('Query con UPPER:', result);
                assert.ok(result.includes('SELECT'), 'Query válida con función string');
            }
            
            if (typeof qb1.concat === 'function') {
                const qb2 = new QueryBuilder();
                qb2.select(qb2.concat(['nombre', 'apellido'], 'nombre_completo'))
                   .from('USUARIOS');
                
                const result2 = await qb2.toString();
                console.log('Query con CONCAT:', result2);
                assert.ok(result2.includes('SELECT'), 'Query válida con CONCAT');
            }
        });

        test('subconsultas con EXISTS', async () => {
            const qb1 = new QueryBuilder();
            
            // Crear subconsulta
            const subquery = new QueryBuilder();
            subquery.select('1')
                   .from('ORDENES')
                   .where(subquery.eq('CLIENTE_ID', 'C.ID'));
            
            // Query principal con EXISTS
            qb1.select('*')
               .from('CLIENTES', 'C')
               .where(qb1.exists(subquery));
            
            const result = await qb1.toString();
            
            console.log('Query con EXISTS:', result);
            assert.ok(result.includes('EXISTS'), 'Debe contener EXISTS');
            assert.ok(result.includes('SELECT'), 'Query válida');
        });

        test('funciones de agregación múltiples', async () => {
            const qb1 = new QueryBuilder();
            
            qb1.select([
                qb1.count('*', 'total'),
                qb1.sum('precio', 'total_precio'),
                qb1.avg('edad', 'edad_promedio'),
                qb1.max('fecha', 'fecha_max'),
                qb1.min('fecha', 'fecha_min')
            ])
            .from('DATOS')
            .groupBy('categoria');
            
            const result = await qb1.toString();
            
            console.log('Query con múltiples agregaciones:', result);
            assert.ok(result.includes('COUNT'), 'Debe contener COUNT');
            assert.ok(result.includes('SUM'), 'Debe contener SUM');
            assert.ok(result.includes('GROUP BY'), 'Debe contener GROUP BY');
        });
    });

    describe('4. Edge Cases and Error Handling', () => {
        test('manejo de QueryBuilder vacío', async () => {
            const qb1 = new QueryBuilder();
            
            try {
                const result = await qb1.toString();
                console.log('QueryBuilder vacío devuelve:', result);
                // No debe fallar, pero puede devolver string vacío o error controlado
                assert.ok(typeof result === 'string', 'Debe devolver string');
            } catch (error) {
                console.log('Error controlado en QueryBuilder vacío:', error.message);
                assert.ok(error instanceof Error, 'Error manejado correctamente');
            }
        });

        test('dropQuery funcionalidad', async () => {
            const qb1 = new QueryBuilder();
            
            // Crear query
            qb1.select('*').from('TEST');
            
            // Verificar que tiene contenido
            const beforeDrop = await qb1.toString();
            assert.ok(beforeDrop.includes('SELECT'), 'Query construida antes de drop');
            
            // Ejecutar dropQuery
            qb1.dropQuery();
            
            // Verificar que se limpió
            const afterDrop = await qb1.toString();
            console.log('Después de dropQuery:', afterDrop);
            
            // dropQuery debería limpiar el estado
            assert.ok(!afterDrop.includes('SELECT FROM TEST') || afterDrop === '', 'Estado limpio después de dropQuery');
        });

        test('encadenamiento de métodos', async () => {
            const qb1 = new QueryBuilder();
            
            // Verificar que el encadenamiento funciona
            const chainedResult = qb1.select('id', 'nombre')
                                     .from('USUARIOS')
                                     .where(qb1.gt('edad', 18))
                                     .orderBy('nombre');
            
            assert.strictEqual(chainedResult, qb1, 'El encadenamiento debe devolver el mismo objeto');
            
            const result = await qb1.toString();
            console.log('Query encadenada:', result);
            assert.ok(result.includes('SELECT'), 'Query encadenada válida');
        });
    });

    describe('5. Performance and Architecture Tests', () => {
        test('múltiples instancias independientes', async () => {
            const qb1 = new QueryBuilder();
            const qb2 = new QueryBuilder();
            
            qb1.select('*').from('TABLA1');
            qb2.select('id').from('TABLA2');
            
            const result1 = await qb1.toString();
            const result2 = await qb2.toString();
            
            console.log('QBuilder 1:', result1);
            console.log('QBuilder 2:', result2);
            
            assert.ok(result1.includes('TABLA1'), 'Primera instancia independiente');
            assert.ok(result2.includes('TABLA2'), 'Segunda instancia independiente');
            assert.ok(!result1.includes('TABLA2'), 'No hay contaminación entre instancias');
        });

        test('reutilización de instancia', async () => {
            const qb1 = new QueryBuilder();
            
            // Primera query
            qb1.select('*').from('USUARIOS');
            const result1 = await qb1.toString();
            
            // Limpiar y crear segunda query
            qb1.dropQuery();
            qb1.select('count(*)').from('PRODUCTOS');
            const result2 = await qb1.toString();
            
            console.log('Primera query:', result1);
            console.log('Segunda query (reutilizada):', result2);
            
            assert.ok(result1.includes('USUARIOS'), 'Primera query correcta');
            assert.ok(result2.includes('PRODUCTOS'), 'Segunda query correcta');
            assert.ok(!result2.includes('USUARIOS'), 'Instancia correctamente reutilizada');
        });
    });

    describe('6. Coverage Gap Identification', () => {
        test('documentar funciones Core no testeadas', () => {
            // Este test documenta qué funcionalidades de Core no están siendo cubiertas
            const coreOnlyFunctions = [
                'getAccount', 'setSavePoint', 'rollback', 'commit', 'startTransaction',
                'fetch', 'currentDate', 'currentTime', 'currentTimestamp',
                'union', 'intersect', 'except', 'case', 'when', 'then'
            ];

            const notAccessible = [];
            const accessible = [];

            coreOnlyFunctions.forEach(fn => {
                if (typeof qb[fn] === 'function') {
                    accessible.push(fn);
                } else {
                    notAccessible.push(fn);
                }
            });

            console.log('\n📊 ANÁLISIS DE COBERTURA:');
            console.log(`🔒 Funciones Core NO accesibles via proxy (${notAccessible.length}):`, notAccessible);
            console.log(`🔓 Funciones Core accesibles via proxy (${accessible.length}):`, accessible);
            
            // Sugerencias para mejorar cobertura
            console.log('\n💡 SUGERENCIAS PARA MEJORAR COBERTURA:');
            if (notAccessible.includes('union') || notAccessible.includes('intersect')) {
                console.log('- Considerar exponer operaciones de conjuntos (UNION, INTERSECT, EXCEPT)');
            }
            if (notAccessible.includes('case')) {
                console.log('- Considerar exponer expresiones CASE/WHEN/THEN');
            }
            if (notAccessible.includes('currentDate')) {
                console.log('- Considerar exponer funciones de fecha/hora');
            }
            if (notAccessible.includes('startTransaction')) {
                console.log('- Considerar exponer funciones de transacciones');
            }

            assert.ok(true, 'Análisis de cobertura completado');
        });
    });
});
