/**
 * Ejemplo de funciones avanzadas de MySQL
 * Demuestra Window Functions, CTEs y consultas complejas
 */

import MySQL from '../MySQL.js';
import {
  WindowFunctions,
  StringFunctions,
  DateTimeFunctions,
  MathFunctions
} from '../functions.js';

// Crear instancia de MySQL QueryBuilder
const mysql = new MySQL();

console.log('=== FUNCIONES AVANZADAS DE MYSQL ===\n');

// Ejemplo 1: Window Functions - ROW_NUMBER
console.log('1. Window Functions - ROW_NUMBER:');
const rowNumberQuery = mysql
  .select([
    'id',
    'name',
    'department',
    'salary',
    mysql.func(WindowFunctions.ROW_NUMBER)
      .over()
      .partitionBy('department')
      .orderBy('salary', 'DESC')
      .as('rank_in_dept')
  ])
  .from('employees')
  .toString();

console.log(rowNumberQuery);

// Ejemplo 2: Window Functions - RANK y DENSE_RANK
console.log('\n2. Window Functions - RANK y DENSE_RANK:');
const rankQuery = mysql
  .select([
    'name',
    'salary',
    mysql.func(WindowFunctions.RANK)
      .over()
      .orderBy('salary', 'DESC')
      .as('rank'),
    mysql.func(WindowFunctions.DENSE_RANK)
      .over()
      .orderBy('salary', 'DESC')
      .as('dense_rank'),
    mysql.func(WindowFunctions.PERCENT_RANK)
      .over()
      .orderBy('salary', 'DESC')
      .as('percent_rank')
  ])
  .from('employees')
  .toString();

console.log(rankQuery);

// Ejemplo 3: Window Functions - LAG y LEAD
console.log('\n3. Window Functions - LAG y LEAD:');
const lagLeadQuery = mysql
  .select([
    'name',
    'salary',
    mysql.func(WindowFunctions.LAG, ['salary', 1])
      .over()
      .orderBy('salary')
      .as('previous_salary'),
    mysql.func(WindowFunctions.LEAD, ['salary', 1])
      .over()
      .orderBy('salary')
      .as('next_salary'),
    mysql.raw('salary - LAG(salary, 1) OVER (ORDER BY salary) AS salary_diff')
  ])
  .from('employees')
  .toString();

console.log(lagLeadQuery);

// Ejemplo 4: Window Functions - FIRST_VALUE y LAST_VALUE
console.log('\n4. Window Functions - FIRST_VALUE y LAST_VALUE:');
const firstLastQuery = mysql
  .select([
    'name',
    'department',
    'salary',
    mysql.func(WindowFunctions.FIRST_VALUE, ['salary'])
      .over()
      .partitionBy('department')
      .orderBy('salary', 'DESC')
      .as('highest_in_dept'),
    mysql.func(WindowFunctions.LAST_VALUE, ['salary'])
      .over()
      .partitionBy('department')
      .orderBy('salary', 'DESC')
      .rows('BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING')
      .as('lowest_in_dept')
  ])
  .from('employees')
  .toString();

console.log(firstLastQuery);

// Ejemplo 5: Common Table Expressions (CTE)
console.log('\n5. Common Table Expressions (CTE):');
const cteQuery = mysql
  .with('department_stats', mysql
    .select([
      'department',
      mysql.func('COUNT', ['*']).as('employee_count'),
      mysql.func('AVG', ['salary']).as('avg_salary'),
      mysql.func('MAX', ['salary']).as('max_salary'),
      mysql.func('MIN', ['salary']).as('min_salary')
    ])
    .from('employees')
    .groupBy('department')
  )
  .with('top_employees', mysql
    .select([
      'name',
      'department',
      'salary',
      mysql.func(WindowFunctions.ROW_NUMBER)
        .over()
        .partitionBy('department')
        .orderBy('salary', 'DESC')
        .as('rank')
    ])
    .from('employees')
  )
  .select([
    'te.name',
    'te.department',
    'te.salary',
    'ds.avg_salary',
    'ds.employee_count'
  ])
  .from('top_employees te')
  .join('department_stats ds', 'te.department', '=', 'ds.department')
  .where('te.rank', '<=', 3)
  .orderBy(['te.department', 'te.rank'])
  .toString();

console.log(cteQuery);

// Ejemplo 6: Recursive CTE
console.log('\n6. Recursive CTE:');
const recursiveCteQuery = mysql
  .withRecursive('employee_hierarchy',
    // Anchor query
    mysql
      .select(['id', 'name', 'manager_id', '0 as level'])
      .from('employees')
      .where('manager_id', 'IS NULL'),
    // Recursive query
    mysql
      .select(['e.id', 'e.name', 'e.manager_id', 'eh.level + 1'])
      .from('employees e')
      .join('employee_hierarchy eh', 'e.manager_id', '=', 'eh.id')
  )
  .select(['id', 'name', 'level'])
  .from('employee_hierarchy')
  .orderBy('level', 'name')
  .toString();

console.log(recursiveCteQuery);

// Ejemplo 7: Funciones de String avanzadas
console.log('\n7. Funciones de String avanzadas:');
const stringQuery = mysql
  .select([
    'name',
    'email',
    mysql.func(StringFunctions.UPPER, ['name']).as('name_upper'),
    mysql.func(StringFunctions.CONCAT, [
      mysql.func(StringFunctions.LEFT, ['name', 1]),
      '". "',
      mysql.func(StringFunctions.SUBSTRING, ['name', mysql.func(StringFunctions.LOCATE, ['" "', 'name']) + 1])
    ]).as('initial_lastname'),
    mysql.func(StringFunctions.REGEXP_REPLACE, [
      'email',
      '@.*$',
      '@company.com'
    ]).as('company_email')
  ])
  .from('employees')
  .toString();

console.log(stringQuery);

// Ejemplo 8: Funciones de fecha avanzadas
console.log('\n8. Funciones de fecha avanzadas:');
const dateQuery = mysql
  .select([
    'name',
    'hire_date',
    mysql.func(DateTimeFunctions.DATEDIFF, [
      mysql.func(DateTimeFunctions.CURDATE),
      'hire_date'
    ]).as('days_employed'),
    mysql.func(DateTimeFunctions.YEAR, [
      mysql.func(DateTimeFunctions.CURDATE)
    ]) + ' - ' + mysql.func(DateTimeFunctions.YEAR, ['hire_date']).as('years_employed'),
    mysql.func(DateTimeFunctions.DATE_FORMAT, [
      'hire_date',
      '%W, %M %e, %Y'
    ]).as('hire_date_formatted'),
    mysql.func(DateTimeFunctions.QUARTER, ['hire_date']).as('hire_quarter')
  ])
  .from('employees')
  .toString();

console.log(dateQuery);

// Ejemplo 9: Análisis de performance con math functions
console.log('\n9. Análisis de performance con math functions:');
const performanceQuery = mysql
  .select([
    'department',
    mysql.func('COUNT', ['*']).as('employee_count'),
    mysql.func('AVG', ['salary']).as('avg_salary'),
    mysql.func(MathFunctions.ROUND, [
      mysql.func('STDDEV', ['salary']), 2
    ]).as('salary_stddev'),
    mysql.func(MathFunctions.ROUND, [
      '(MAX(salary) - MIN(salary)) / AVG(salary) * 100', 2
    ]).as('salary_range_pct'),
    mysql.func('MIN', ['salary']).as('min_salary'),
    mysql.func('MAX', ['salary']).as('max_salary')
  ])
  .from('employees')
  .groupBy('department')
  .having(mysql.func('COUNT', ['*']), '>', 5)
  .orderBy('avg_salary', 'DESC')
  .toString();

console.log(performanceQuery);

// Ejemplo 10: Consulta compleja combinando múltiples técnicas
console.log('\n10. Consulta compleja combinando múltiples técnicas:');
const complexQuery = mysql
  .with('employee_stats', mysql
    .select([
      'id',
      'name',
      'department',
      'salary',
      'hire_date',
      mysql.func(WindowFunctions.ROW_NUMBER)
        .over()
        .partitionBy('department')
        .orderBy('salary', 'DESC')
        .as('salary_rank'),
      mysql.func(WindowFunctions.PERCENT_RANK)
        .over()
        .partitionBy('department')
        .orderBy('salary')
        .as('salary_percentile'),
      mysql.func(DateTimeFunctions.DATEDIFF, [
        mysql.func(DateTimeFunctions.CURDATE),
        'hire_date'
      ]).as('days_employed')
    ])
    .from('employees')
  )
  .select([
    'es.name',
    'es.department',
    mysql.func(StringFunctions.FORMAT, ['es.salary', 2]).as('formatted_salary'),
    'es.salary_rank',
    mysql.func(MathFunctions.ROUND, ['es.salary_percentile * 100', 1]).as('salary_percentile_pct'),
    mysql.func(MathFunctions.ROUND, ['es.days_employed / 365.25', 1]).as('years_employed'),
    mysql.case()
      .when('es.salary_percentile > 0.8', '"Top Performer"')
      .when('es.salary_percentile > 0.6', '"Above Average"')
      .when('es.salary_percentile > 0.4', '"Average"')
      .when('es.salary_percentile > 0.2', '"Below Average"')
      .else('"Needs Improvement"')
      .as('performance_category')
  ])
  .from('employee_stats es')
  .where('es.salary_rank', '<=', 10)
  .orderBy(['es.department', 'es.salary_rank'])
  .toString();

console.log(complexQuery);

export default {
  rowNumberQuery,
  rankQuery,
  lagLeadQuery,
  firstLastQuery,
  cteQuery,
  recursiveCteQuery,
  stringQuery,
  dateQuery,
  performanceQuery,
  complexQuery
};