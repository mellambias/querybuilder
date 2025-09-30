/**
 * Operadores específicos de MongoDB
 * Incluye operadores de consulta, actualización, agregación, etc.
 */

/**
 * Operadores de comparación de MongoDB
 */
export const ComparisonOperators = {
  EQUALS: '$eq',
  NOT_EQUALS: '$ne',
  GREATER_THAN: '$gt',
  GREATER_THAN_OR_EQUAL: '$gte',
  LESS_THAN: '$lt',
  LESS_THAN_OR_EQUAL: '$lte',
  IN: '$in',
  NOT_IN: '$nin'
};

/**
 * Operadores lógicos de MongoDB
 */
export const LogicalOperators = {
  AND: '$and',
  OR: '$or',
  NOT: '$not',
  NOR: '$nor'
};

/**
 * Operadores de elemento de MongoDB
 */
export const ElementOperators = {
  EXISTS: '$exists',
  TYPE: '$type'
};

/**
 * Operadores de evaluación de MongoDB
 */
export const EvaluationOperators = {
  MOD: '$mod',
  REGEX: '$regex',
  TEXT: '$text',
  WHERE: '$where',
  EXPR: '$expr',
  JSON_SCHEMA: '$jsonSchema'
};

/**
 * Operadores geoespaciales de MongoDB
 */
export const GeospatialOperators = {
  GEO_INTERSECTS: '$geoIntersects',
  GEO_WITHIN: '$geoWithin',
  NEAR: '$near',
  NEAR_SPHERE: '$nearSphere',
  BOX: '$box',
  CENTER: '$center',
  CENTER_SPHERE: '$centerSphere',
  GEOMETRY: '$geometry',
  MAX_DISTANCE: '$maxDistance',
  MIN_DISTANCE: '$minDistance'
};

/**
 * Operadores de array de MongoDB
 */
export const ArrayOperators = {
  ALL: '$all',
  ELEM_MATCH: '$elemMatch',
  SIZE: '$size'
};

/**
 * Operadores de bits de MongoDB
 */
export const BitwiseOperators = {
  BITS_ALL_CLEAR: '$bitsAllClear',
  BITS_ALL_SET: '$bitsAllSet',
  BITS_ANY_CLEAR: '$bitsAnyClear',
  BITS_ANY_SET: '$bitsAnySet'
};

/**
 * Operadores de comentario de MongoDB
 */
export const CommentOperators = {
  COMMENT: '$comment'
};

/**
 * Operadores de actualización de campo de MongoDB
 */
export const FieldUpdateOperators = {
  CURRENT_DATE: '$currentDate',
  INC: '$inc',
  MIN: '$min',
  MAX: '$max',
  MUL: '$mul',
  RENAME: '$rename',
  SET: '$set',
  SET_ON_INSERT: '$setOnInsert',
  UNSET: '$unset'
};

/**
 * Operadores de actualización de array de MongoDB
 */
export const ArrayUpdateOperators = {
  ADD_TO_SET: '$addToSet',
  POP: '$pop',
  PULL: '$pull',
  PUSH: '$push',
  PULL_ALL: '$pullAll',
  EACH: '$each',
  POSITION: '$position',
  SLICE: '$slice',
  SORT: '$sort'
};

/**
 * Operadores de actualización con modificadores de MongoDB
 */
export const UpdateModifiers = {
  POSITIONAL: '$',
  POSITIONAL_ALL: '$[]',
  POSITIONAL_FILTERED: '$[<identifier>]'
};

/**
 * Operadores de agregación - Stage operators
 */
export const AggregationStageOperators = {
  // Pipeline Stages
  ADD_FIELDS: '$addFields',
  BUCKET: '$bucket',
  BUCKET_AUTO: '$bucketAuto',
  CHANGE_STREAM: '$changeStream',
  COLL_STATS: '$collStats',
  COUNT: '$count',
  FACET: '$facet',
  GEO_NEAR: '$geoNear',
  GRAPH_LOOKUP: '$graphLookup',
  GROUP: '$group',
  INDEX_STATS: '$indexStats',
  LIMIT: '$limit',
  LIST_SESSIONS: '$listSessions',
  LOOKUP: '$lookup',
  MATCH: '$match',
  MERGE: '$merge',
  OUT: '$out',
  PLAN_CACHE_STATS: '$planCacheStats',
  PROJECT: '$project',
  REDACT: '$redact',
  REPLACE_ROOT: '$replaceRoot',
  REPLACE_WITH: '$replaceWith',
  SAMPLE: '$sample',
  SET: '$set',
  SKIP: '$skip',
  SORT: '$sort',
  SORT_BY_COUNT: '$sortByCount',
  UNION_WITH: '$unionWith',
  UNSET: '$unset',
  UNWIND: '$unwind'
};

/**
 * Operadores de expresión de agregación de MongoDB
 */
export const AggregationExpressionOperators = {
  // Arithmetic
  ABS: '$abs',
  ADD: '$add',
  CEIL: '$ceil',
  DIVIDE: '$divide',
  EXP: '$exp',
  FLOOR: '$floor',
  LN: '$ln',
  LOG: '$log',
  LOG10: '$log10',
  MOD: '$mod',
  MULTIPLY: '$multiply',
  POW: '$pow',
  ROUND: '$round',
  SQRT: '$sqrt',
  SUBTRACT: '$subtract',
  TRUNC: '$trunc',

  // Array
  ARRAY_ELEM_AT: '$arrayElemAt',
  ARRAY_TO_OBJECT: '$arrayToObject',
  CONCAT_ARRAYS: '$concatArrays',
  FILTER: '$filter',
  FIRST: '$first',
  IN: '$in',
  INDEX_OF_ARRAY: '$indexOfArray',
  IS_ARRAY: '$isArray',
  LAST: '$last',
  MAP: '$map',
  OBJECT_TO_ARRAY: '$objectToArray',
  RANGE: '$range',
  REDUCE: '$reduce',
  REVERSE_ARRAY: '$reverseArray',
  SIZE: '$size',
  SLICE: '$slice',
  ZIP: '$zip',

  // Boolean
  AND: '$and',
  NOT: '$not',
  OR: '$or',

  // Comparison
  CMP: '$cmp',
  EQ: '$eq',
  GT: '$gt',
  GTE: '$gte',
  LT: '$lt',
  LTE: '$lte',
  NE: '$ne',

  // Conditional
  COND: '$cond',
  IF_NULL: '$ifNull',
  SWITCH: '$switch',

  // Date
  DATE_FROM_PARTS: '$dateFromParts',
  DATE_FROM_STRING: '$dateFromString',
  DATE_TO_PARTS: '$dateToParts',
  DATE_TO_STRING: '$dateToString',
  DAY_OF_MONTH: '$dayOfMonth',
  DAY_OF_WEEK: '$dayOfWeek',
  DAY_OF_YEAR: '$dayOfYear',
  HOUR: '$hour',
  ISO_DAY_OF_WEEK: '$isoDayOfWeek',
  ISO_WEEK: '$isoWeek',
  ISO_WEEK_YEAR: '$isoWeekYear',
  MILLISECOND: '$millisecond',
  MINUTE: '$minute',
  MONTH: '$month',
  SECOND: '$second',
  TO_DATE: '$toDate',
  WEEK: '$week',
  YEAR: '$year',

  // Literal
  LITERAL: '$literal',

  // Object
  MERGE_OBJECTS: '$mergeObjects',

  // Set
  ALL_ELEMENTS_TRUE: '$allElementsTrue',
  ANY_ELEMENT_TRUE: '$anyElementTrue',
  SET_DIFFERENCE: '$setDifference',
  SET_EQUALS: '$setEquals',
  SET_INTERSECTION: '$setIntersection',
  SET_IS_SUBSET: '$setIsSubset',
  SET_UNION: '$setUnion',

  // String
  CONCAT: '$concat',
  INDEX_OF_BYTES: '$indexOfBytes',
  INDEX_OF_CP: '$indexOfCP',
  LTRIM: '$ltrim',
  REGEX_FIND: '$regexFind',
  REGEX_FIND_ALL: '$regexFindAll',
  REGEX_MATCH: '$regexMatch',
  REPLACE_ALL: '$replaceAll',
  REPLACE_ONE: '$replaceOne',
  RTRIM: '$rtrim',
  SPLIT: '$split',
  STR_LEN_BYTES: '$strLenBytes',
  STR_LEN_CP: '$strLenCP',
  STRCASECMP: '$strcasecmp',
  SUBSTR: '$substr',
  SUBSTR_BYTES: '$substrBytes',
  SUBSTR_CP: '$substrCP',
  TO_LOWER: '$toLower',
  TO_STRING: '$toString',
  TO_UPPER: '$toUpper',
  TRIM: '$trim',

  // Type
  CONVERT: '$convert',
  IS_NUMBER: '$isNumber',
  TO_BOOL: '$toBool',
  TO_DECIMAL: '$toDecimal',
  TO_DOUBLE: '$toDouble',
  TO_INT: '$toInt',
  TO_LONG: '$toLong',
  TO_OBJECT_ID: '$toObjectId',
  TYPE: '$type'
};

/**
 * Operadores de índice de MongoDB
 */
export const IndexOperators = {
  TEXT: 'text',
  GEO_2D: '2d',
  GEO_2DSPHERE: '2dsphere',
  HASHED: 'hashed',
  ASCENDING: 1,
  DESCENDING: -1
};

/**
 * Todos los operadores de MongoDB organizados por categoría
 */
export const MongoDBOperators = {
  ...ComparisonOperators,
  ...LogicalOperators,
  ...ElementOperators,
  ...EvaluationOperators,
  ...GeospatialOperators,
  ...ArrayOperators,
  ...BitwiseOperators,
  ...CommentOperators,
  ...FieldUpdateOperators,
  ...ArrayUpdateOperators,
  ...UpdateModifiers,
  ...AggregationStageOperators,
  ...AggregationExpressionOperators,
  ...IndexOperators
};

/**
 * Verificar si un operador es válido en MongoDB
 * @param {string} operator - Operador a verificar
 * @returns {boolean}
 */
export function isValidMongoDBOperator(operator) {
  return Object.values(MongoDBOperators).includes(operator);
}

/**
 * Obtener categoría de un operador MongoDB
 * @param {string} operator - Operador MongoDB
 * @returns {string}
 */
export function getMongoDBOperatorCategory(operator) {
  if (Object.values(ComparisonOperators).includes(operator)) return 'comparison';
  if (Object.values(LogicalOperators).includes(operator)) return 'logical';
  if (Object.values(ElementOperators).includes(operator)) return 'element';
  if (Object.values(EvaluationOperators).includes(operator)) return 'evaluation';
  if (Object.values(GeospatialOperators).includes(operator)) return 'geospatial';
  if (Object.values(ArrayOperators).includes(operator)) return 'array';
  if (Object.values(BitwiseOperators).includes(operator)) return 'bitwise';
  if (Object.values(FieldUpdateOperators).includes(operator)) return 'field_update';
  if (Object.values(ArrayUpdateOperators).includes(operator)) return 'array_update';
  if (Object.values(AggregationStageOperators).includes(operator)) return 'aggregation_stage';
  if (Object.values(AggregationExpressionOperators).includes(operator)) return 'aggregation_expression';
  if (Object.values(IndexOperators).includes(operator)) return 'index';

  return 'unknown';
}

/**
 * Verificar si un operador es de consulta
 * @param {string} operator - Operador a verificar
 * @returns {boolean}
 */
export function isQueryOperator(operator) {
  const queryCategories = ['comparison', 'logical', 'element', 'evaluation', 'geospatial', 'array', 'bitwise'];
  return queryCategories.includes(getMongoDBOperatorCategory(operator));
}

/**
 * Verificar si un operador es de actualización
 * @param {string} operator - Operador a verificar
 * @returns {boolean}
 */
export function isUpdateOperator(operator) {
  const updateCategories = ['field_update', 'array_update'];
  return updateCategories.includes(getMongoDBOperatorCategory(operator));
}

/**
 * Verificar si un operador es de agregación
 * @param {string} operator - Operador a verificar
 * @returns {boolean}
 */
export function isAggregationOperator(operator) {
  const aggregationCategories = ['aggregation_stage', 'aggregation_expression'];
  return aggregationCategories.includes(getMongoDBOperatorCategory(operator));
}

export default {
  ComparisonOperators,
  LogicalOperators,
  ElementOperators,
  EvaluationOperators,
  GeospatialOperators,
  ArrayOperators,
  BitwiseOperators,
  CommentOperators,
  FieldUpdateOperators,
  ArrayUpdateOperators,
  UpdateModifiers,
  AggregationStageOperators,
  AggregationExpressionOperators,
  IndexOperators,
  MongoDBOperators,
  isValidMongoDBOperator,
  getMongoDBOperatorCategory,
  isQueryOperator,
  isUpdateOperator,
  isAggregationOperator
};