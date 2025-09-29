/**
 * Operadores específicos de MySQL
 * Incluye operadores aritméticos, de comparación, lógicos, de cadena, etc.
 */

/**
 * Operadores aritméticos de MySQL
 */
export const ArithmeticOperators = {
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  MODULO: '%',
  DIV: 'DIV',  // División entera
  MOD: 'MOD'   // Módulo alternativo
};

/**
 * Operadores de comparación de MySQL
 */
export const ComparisonOperators = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  NOT_EQUALS_ALT: '<>',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
  SPACESHIP: '<=>',  // NULL-safe equality

  // Pattern matching
  LIKE: 'LIKE',
  NOT_LIKE: 'NOT LIKE',
  REGEXP: 'REGEXP',
  RLIKE: 'RLIKE',
  NOT_REGEXP: 'NOT REGEXP',
  NOT_RLIKE: 'NOT RLIKE',

  // Range operators
  BETWEEN: 'BETWEEN',
  NOT_BETWEEN: 'NOT BETWEEN',

  // Set membership
  IN: 'IN',
  NOT_IN: 'NOT IN',

  // NULL checking
  IS_NULL: 'IS NULL',
  IS_NOT_NULL: 'IS NOT NULL'
};

/**
 * Operadores lógicos de MySQL
 */
export const LogicalOperators = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  XOR: 'XOR'
};

/**
 * Operadores de asignación de MySQL
 */
export const AssignmentOperators = {
  ASSIGN: ':=',
  EQUALS: '='
};

/**
 * Operadores de bits de MySQL
 */
export const BitwiseOperators = {
  AND: '&',
  OR: '|',
  XOR: '^',
  NOT: '~',
  LEFT_SHIFT: '<<',
  RIGHT_SHIFT: '>>'
};

/**
 * Operadores JSON de MySQL
 */
export const JsonOperators = {
  EXTRACT: '->',        // JSON extract
  UNQUOTE_EXTRACT: '->>' // JSON extract and unquote
};

/**
 * Operadores de cadena de MySQL
 */
export const StringOperators = {
  CONCAT: 'CONCAT',
  LIKE: 'LIKE',
  NOT_LIKE: 'NOT LIKE',
  REGEXP: 'REGEXP',
  NOT_REGEXP: 'NOT REGEXP',
  BINARY: 'BINARY',
  COLLATE: 'COLLATE'
};

/**
 * Operadores de fecha y hora de MySQL
 */
export const DateTimeOperators = {
  DATE_ADD: '+',
  DATE_SUB: '-',
  INTERVAL: 'INTERVAL'
};

/**
 * Operadores de subquery de MySQL
 */
export const SubqueryOperators = {
  EXISTS: 'EXISTS',
  NOT_EXISTS: 'NOT EXISTS',
  ALL: 'ALL',
  ANY: 'ANY',
  SOME: 'SOME'
};

/**
 * Operadores de conjunto de MySQL
 */
export const SetOperators = {
  UNION: 'UNION',
  UNION_ALL: 'UNION ALL',
  INTERSECT: 'INTERSECT',  // MySQL 8.0.31+
  EXCEPT: 'EXCEPT'         // MySQL 8.0.31+
};

/**
 * Prioridad de operadores en MySQL (de mayor a menor)
 */
export const OperatorPrecedence = [
  ['INTERVAL'],
  ['BINARY', 'COLLATE'],
  ['!'],
  ['-', '+'],  // unary minus and plus
  ['~'],       // bitwise NOT
  ['^'],       // bitwise XOR
  ['*', '/', 'DIV', '%', 'MOD'],
  ['-', '+'],  // binary minus and plus
  ['<<', '>>'], // shift operators
  ['&'],       // bitwise AND
  ['|'],       // bitwise OR
  ['=', '<=>', '>=', '>', '<=', '<', '<>', '!=', 'IS', 'LIKE', 'REGEXP', 'IN'],
  ['BETWEEN', 'CASE', 'WHEN', 'THEN', 'ELSE'],
  ['NOT'],
  ['AND', '&&'],
  ['XOR'],
  ['OR', '||'],
  [':=']       // assignment
];

/**
 * Todos los operadores de MySQL organizados por categoría
 */
export const MySQLOperators = {
  ...ArithmeticOperators,
  ...ComparisonOperators,
  ...LogicalOperators,
  ...AssignmentOperators,
  ...BitwiseOperators,
  ...JsonOperators,
  ...StringOperators,
  ...DateTimeOperators,
  ...SubqueryOperators,
  ...SetOperators
};

/**
 * Verificar si un operador es válido en MySQL
 * @param {string} operator - Operador a verificar
 * @returns {boolean}
 */
export function isValidMySQLOperator(operator) {
  const upperOp = operator.toUpperCase();
  return Object.values(MySQLOperators).includes(operator) ||
    Object.values(MySQLOperators).includes(upperOp);
}

/**
 * Obtener categoría de un operador MySQL
 * @param {string} operator - Operador MySQL
 * @returns {string}
 */
export function getMySQLOperatorCategory(operator) {
  const upperOp = operator.toUpperCase();

  if (Object.values(ArithmeticOperators).includes(operator) ||
    Object.values(ArithmeticOperators).includes(upperOp)) return 'arithmetic';
  if (Object.values(ComparisonOperators).includes(operator) ||
    Object.values(ComparisonOperators).includes(upperOp)) return 'comparison';
  if (Object.values(LogicalOperators).includes(upperOp)) return 'logical';
  if (Object.values(AssignmentOperators).includes(operator)) return 'assignment';
  if (Object.values(BitwiseOperators).includes(operator)) return 'bitwise';
  if (Object.values(JsonOperators).includes(operator)) return 'json';
  if (Object.values(StringOperators).includes(upperOp)) return 'string';
  if (Object.values(DateTimeOperators).includes(operator) ||
    Object.values(DateTimeOperators).includes(upperOp)) return 'datetime';
  if (Object.values(SubqueryOperators).includes(upperOp)) return 'subquery';
  if (Object.values(SetOperators).includes(upperOp)) return 'set';

  return 'unknown';
}

/**
 * Obtener precedencia de un operador
 * @param {string} operator - Operador MySQL
 * @returns {number} - Nivel de precedencia (menor número = mayor precedencia)
 */
export function getMySQLOperatorPrecedence(operator) {
  const upperOp = operator.toUpperCase();

  for (let i = 0; i < OperatorPrecedence.length; i++) {
    if (OperatorPrecedence[i].includes(operator) ||
      OperatorPrecedence[i].includes(upperOp)) {
      return i;
    }
  }

  return OperatorPrecedence.length; // Precedencia más baja para operadores desconocidos
}

/**
 * Verificar si un operador es binario
 * @param {string} operator - Operador a verificar
 * @returns {boolean}
 */
export function isBinaryOperator(operator) {
  const binaryOps = [
    ...Object.values(ArithmeticOperators),
    ...Object.values(ComparisonOperators).filter(op =>
      !['IS NULL', 'IS NOT NULL'].includes(op)),
    ...Object.values(LogicalOperators).filter(op => op !== 'NOT'),
    ...Object.values(BitwiseOperators).filter(op => op !== '~'),
    ...Object.values(JsonOperators),
    'LIKE', 'NOT LIKE', 'REGEXP', 'NOT REGEXP'
  ];

  const upperOp = operator.toUpperCase();
  return binaryOps.includes(operator) || binaryOps.includes(upperOp);
}

/**
 * Verificar si un operador es unario
 * @param {string} operator - Operador a verificar
 * @returns {boolean}
 */
export function isUnaryOperator(operator) {
  const unaryOps = ['NOT', '!', '-', '+', '~', 'IS NULL', 'IS NOT NULL'];
  const upperOp = operator.toUpperCase();
  return unaryOps.includes(operator) || unaryOps.includes(upperOp);
}

export default {
  ArithmeticOperators,
  ComparisonOperators,
  LogicalOperators,
  AssignmentOperators,
  BitwiseOperators,
  JsonOperators,
  StringOperators,
  DateTimeOperators,
  SubqueryOperators,
  SetOperators,
  OperatorPrecedence,
  MySQLOperators,
  isValidMySQLOperator,
  getMySQLOperatorCategory,
  getMySQLOperatorPrecedence,
  isBinaryOperator,
  isUnaryOperator
};