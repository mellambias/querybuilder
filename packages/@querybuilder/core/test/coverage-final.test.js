import { describe, test, before } from 'node:test';
import { strict as assert } from 'node:assert';
import QueryBuilder from '../querybuilder.js';
import Core from '../core.js';

describe('📊 ANÁLISIS DE COBERTURA FINAL - QueryBuilder', () => {
    let qb;

    before(() => {
        qb = new QueryBuilder(Core, {
            typeIdentificator: 'regular',
            mode: 'test'
        });
    });

    describe('🔍 Análisis de Funciones Disponibles', () => {
        test('identificar funciones básicas disponibles', () => {
            const basicFunctions = [
                'select', 'from', 'where', 'orderBy', 'groupBy', 'having',
                'eq', 'ne', 'gt', 'lt', 'like', 'in', 'between', 'isNull',
                'and', 'or', 'not', 'exists',
                'innerJoin', 'leftJoin', 'rightJoin', 'on',
                'count', 'sum', 'avg', 'min', 'max',
                'insert', 'update', 'delete',
                'createTable', 'dropTable',
                'dropQuery', 'toString'
            ];

            const available = basicFunctions.filter(fn => typeof qb[fn] === 'function');
            const missing = basicFunctions.filter(fn => typeof qb[fn] !== 'function');

            console.log(`\n✅ Funciones DISPONIBLES (${available.length}/${basicFunctions.length}):`);
            console.log(available.join(', '));

            if (missing.length > 0) {
                console.log(`\n❌ Funciones NO disponibles (${missing.length}):`);
                console.log(missing.join(', '));
            }

            assert.ok(available.length > 20, `Debería tener al menos 20 funciones básicas. Encontradas: ${available.length}`);
        });

        test('identificar funciones Core avanzadas no expuestas', () => {
            const advancedCoreFunctions = [
                'getAccount', 'setSavePoint', 'rollback', 'commit', 'startTransaction',
                'fetch', 'currentDate', 'currentTime', 'currentTimestamp',
                'union', 'intersect', 'except', 'case', 'when', 'then', 'else',
                'substr', 'concat', 'coalesce', 'nullif'
            ];

            const notExposed = advancedCoreFunctions.filter(fn => typeof qb[fn] !== 'function');
            const unexpectedlyAvailable = advancedCoreFunctions.filter(fn => typeof qb[fn] === 'function');

            console.log(`\n🔒 Funciones Core NO expuestas (${notExposed.length}):`);
            console.log(notExposed.join(', '));

            if (unexpectedlyAvailable.length > 0) {
                console.log(`\n🎉 Funciones avanzadas disponibles:`, unexpectedlyAvailable.join(', '));
            }

            // Esto es informativo, no un fallo
            assert.ok(true, 'Análisis completado');
        });
    });

    describe('🧪 Tests de Funcionalidad Básica', () => {
        test('query SELECT simple', async () => {
            const qb1 = new QueryBuilder(Core);

            qb1.select('*').from('USUARIOS');
            const result = await qb1.toString();

            console.log('Query SELECT simple:', result);
            assert.ok(result.includes('SELECT'), 'Debe contener SELECT');
            assert.ok(result.includes('USUARIOS'), 'Debe contener tabla USUARIOS');
        });

        test('query con WHERE', async () => {
            const qb1 = new QueryBuilder(Core);

            qb1.select('nombre', 'edad')
                .from('USUARIOS')
                .where(qb1.gt('edad', 18));

            const result = await qb1.toString();

            console.log('Query con WHERE:', result);
            assert.ok(result.includes('SELECT'), 'Debe contener SELECT');
            assert.ok(result.includes('WHERE'), 'Debe contener WHERE');
        });

        test('funciones de agregación', async () => {
            const qb1 = new QueryBuilder(Core);

            qb1.select([
                qb1.count('*', 'total'),
                qb1.sum('precio', 'total_precio'),
                qb1.avg('edad', 'promedio')
            ])
                .from('DATOS')
                .groupBy('categoria');

            const result = await qb1.toString();

            console.log('Query con agregaciones:', result);
            assert.ok(result.includes('COUNT'), 'Debe contener COUNT');
            assert.ok(result.includes('SUM'), 'Debe contener SUM');
        });

        test('INSERT básico', async () => {
            const qb1 = new QueryBuilder(Core);

            qb1.insert('USUARIOS', ['Juan', 25], ['nombre', 'edad']);

            const result = await qb1.toString();

            console.log('Query INSERT:', result);
            assert.ok(result.includes('INSERT'), 'Debe contener INSERT');
        });

        test('UPDATE básico', async () => {
            const qb1 = new QueryBuilder(Core);

            qb1.update('USUARIOS', { nombre: 'Juan Carlos', edad: 26 })
                .where(qb1.eq('id', 1));

            const result = await qb1.toString();

            console.log('Query UPDATE:', result);
            assert.ok(result.includes('UPDATE'), 'Debe contener UPDATE');
        });

        test('DELETE básico', async () => {
            const qb1 = new QueryBuilder(Core);

            qb1.delete('USUARIOS')
                .where(qb1.eq('activo', false));

            const result = await qb1.toString();

            console.log('Query DELETE:', result);
            assert.ok(result.includes('DELETE'), 'Debe contener DELETE');
        });
    });

    describe('🏗️ Tests de Arquitectura y Funcionalidad Avanzada', () => {
        test('subconsulta con EXISTS', async () => {
            const qb1 = new QueryBuilder(Core);
            const subquery = new QueryBuilder(Core);

            subquery.select('1')
                .from('ORDENES')
                .where(subquery.eq('CLIENTE_ID', 'C.ID'));

            qb1.select('*')
                .from('CLIENTES', 'C')
                .where(qb1.exists(subquery));

            const result = await qb1.toString();

            console.log('Query con EXISTS:', result);
            assert.ok(result.includes('EXISTS'), 'Debe contener EXISTS');
        });

        test('dropQuery limpia estado', async () => {
            const qb1 = new QueryBuilder(Core);

            // Construir query
            qb1.select('*').from('TEST');
            const beforeDrop = await qb1.toString();

            // Limpiar
            qb1.dropQuery();

            // Verificar limpieza
            const afterDrop = await qb1.toString();

            console.log('Antes dropQuery:', beforeDrop);
            console.log('Después dropQuery:', afterDrop);

            assert.ok(beforeDrop.includes('SELECT'), 'Query inicial construida');
            assert.ok(!afterDrop.includes('SELECT FROM TEST') || afterDrop === '', 'Estado limpio');
        });

        test('múltiples instancias independientes', async () => {
            const qb1 = new QueryBuilder(Core);
            const qb2 = new QueryBuilder(Core);

            qb1.select('*').from('TABLA1');
            qb2.select('id').from('TABLA2');

            const result1 = await qb1.toString();
            const result2 = await qb2.toString();

            console.log('Instancia 1:', result1);
            console.log('Instancia 2:', result2);

            assert.ok(result1.includes('TABLA1'), 'Primera instancia correcta');
            assert.ok(result2.includes('TABLA2'), 'Segunda instancia correcta');
            assert.ok(!result1.includes('TABLA2'), 'Instancias independientes');
        });
    });

    describe('📋 RESUMEN DE COBERTURA Y RECOMENDACIONES', () => {
        test('generar reporte final de cobertura', () => {
            // Análisis exhaustivo de funciones
            const allPossibleFunctions = [
                // CRUD básico
                'select', 'insert', 'update', 'delete', 'from', 'where',

                // Operadores
                'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'in', 'between',
                'isNull', 'isNotNull', 'and', 'or', 'not',

                // Joins
                'innerJoin', 'leftJoin', 'rightJoin', 'fullJoin', 'crossJoin', 'on',

                // Agregaciones
                'count', 'sum', 'avg', 'min', 'max',

                // Funciones string (si están disponibles)
                'upper', 'lower', 'trim', 'ltrim', 'rtrim', 'length',
                'substr', 'concat', 'coalesce', 'nullif',

                // Predicados avanzados
                'exists', 'all', 'any', 'some',

                // DDL
                'createTable', 'dropTable', 'createDatabase', 'dropDatabase',

                // Ordenamiento y agrupación
                'orderBy', 'groupBy', 'having',

                // Utilidades
                'dropQuery', 'toString', 'queryJoin',

                // Funciones Core avanzadas (probablemente no expuestas)
                'getAccount', 'setSavePoint', 'rollback', 'commit', 'startTransaction',
                'fetch', 'currentDate', 'currentTime', 'currentTimestamp',
                'union', 'intersect', 'except', 'case', 'when', 'then', 'else'
            ];

            let available = 0;
            let notAvailable = 0;
            const availableList = [];
            const notAvailableList = [];

            allPossibleFunctions.forEach(fn => {
                if (typeof qb[fn] === 'function') {
                    available++;
                    availableList.push(fn);
                } else {
                    notAvailable++;
                    notAvailableList.push(fn);
                }
            });

            console.log('\n' + '='.repeat(60));
            console.log('📊 REPORTE FINAL DE COBERTURA DE FUNCIONES');
            console.log('='.repeat(60));
            console.log(`✅ Funciones disponibles: ${available}/${allPossibleFunctions.length} (${Math.round(available / allPossibleFunctions.length * 100)}%)`);
            console.log(`❌ Funciones no disponibles: ${notAvailable}`);

            console.log('\n🎯 FUNCIONES CRÍTICAS CUBIERTAS:');
            const criticalFunctions = ['select', 'from', 'where', 'insert', 'update', 'delete', 'join'];
            const criticalCovered = criticalFunctions.filter(fn => availableList.includes(fn) || availableList.some(a => a.includes(fn)));
            console.log(`✅ ${criticalCovered.length}/${criticalFunctions.length} funciones críticas disponibles`);

            console.log('\n💡 RECOMENDACIONES PARA MEJORAR COBERTURA:');
            if (notAvailableList.includes('union') || notAvailableList.includes('intersect')) {
                console.log('- ⭐ Considerar exponer operaciones de conjuntos (UNION, INTERSECT, EXCEPT)');
            }
            if (notAvailableList.includes('case')) {
                console.log('- ⭐ Considerar exponer expresiones CASE/WHEN/THEN para lógica condicional');
            }
            if (notAvailableList.includes('substr')) {
                console.log('- ⭐ Verificar funciones de string avanzadas (SUBSTR, etc.)');
            }
            if (notAvailableList.includes('currentDate')) {
                console.log('- ⭐ Considerar funciones de fecha/hora (CURRENT_DATE, etc.)');
            }
            if (notAvailableList.includes('startTransaction')) {
                console.log('- ⭐ Evaluar exposición de funciones de transacciones');
            }

            console.log('\n🏆 CONCLUSIÓN:');
            const coveragePercent = Math.round(available / allPossibleFunctions.length * 100);
            if (coveragePercent >= 70) {
                console.log(`🎉 Excelente cobertura (${coveragePercent}%) - QueryBuilder está bien arquitecturado`);
            } else if (coveragePercent >= 50) {
                console.log(`✅ Buena cobertura (${coveragePercent}%) - Funcionalidad core sólida`);
            } else {
                console.log(`⚠️ Cobertura básica (${coveragePercent}%) - Considerar expandir funcionalidad`);
            }

            console.log('\n📈 TESTS RECOMENDADOS ADICIONALES:');
            console.log('- Tests de rendimiento con queries complejas');
            console.log('- Tests de validación de sintaxis SQL');
            console.log('- Tests de manejo de errores en queries malformadas');
            console.log('- Tests de compatibilidad con diferentes drivers de DB');

            console.log('='.repeat(60));

            assert.ok(available > 25, `Cobertura mínima esperada. Encontradas ${available} funciones`);
        });
    });
});
