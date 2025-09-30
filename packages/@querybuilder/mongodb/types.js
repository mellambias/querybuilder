/**
 * Tipos de datos específicos de MongoDB
 * Incluye tipos BSON y validaciones específicas
 */

/**
 * Tipos BSON básicos de MongoDB
 */
export const BSONTypes = {
  DOUBLE: 'double',
  STRING: 'string',
  OBJECT: 'object',
  ARRAY: 'array',
  BINARY_DATA: 'binData',
  UNDEFINED: 'undefined', // Deprecated
  OBJECT_ID: 'objectId',
  BOOLEAN: 'bool',
  DATE: 'date',
  NULL: 'null',
  REGULAR_EXPRESSION: 'regex',
  DB_POINTER: 'dbPointer', // Deprecated
  JAVASCRIPT: 'javascript',
  SYMBOL: 'symbol', // Deprecated
  JAVASCRIPT_WITH_SCOPE: 'javascriptWithScope', // Deprecated
  INT_32: 'int',
  TIMESTAMP: 'timestamp',
  INT_64: 'long',
  DECIMAL_128: 'decimal',
  MIN_KEY: 'minKey',
  MAX_KEY: 'maxKey'
};

/**
 * Alias numéricos de tipos BSON
 */
export const BSONTypeNumbers = {
  DOUBLE: 1,
  STRING: 2,
  OBJECT: 3,
  ARRAY: 4,
  BINARY_DATA: 5,
  UNDEFINED: 6, // Deprecated
  OBJECT_ID: 7,
  BOOLEAN: 8,
  DATE: 9,
  NULL: 10,
  REGULAR_EXPRESSION: 11,
  DB_POINTER: 12, // Deprecated
  JAVASCRIPT: 13,
  SYMBOL: 14, // Deprecated
  JAVASCRIPT_WITH_SCOPE: 15, // Deprecated
  INT_32: 16,
  TIMESTAMP: 17,
  INT_64: 18,
  DECIMAL_128: 19,
  MIN_KEY: -1,
  MAX_KEY: 127
};

/**
 * Tipos de datos comunes en esquemas de MongoDB
 */
export const MongoDBSchemaTypes = {
  // Tipos básicos
  STRING: String,
  NUMBER: Number,
  BOOLEAN: Boolean,
  DATE: Date,
  ARRAY: Array,
  OBJECT: Object,

  // Tipos específicos de MongoDB
  OBJECT_ID: 'ObjectId',
  MIXED: 'Mixed',
  BUFFER: Buffer,
  DECIMAL_128: 'Decimal128',
  MAP: Map,

  // Para Mongoose
  MONGOOSE_OBJECT_ID: 'mongoose.Schema.Types.ObjectId',
  MONGOOSE_MIXED: 'mongoose.Schema.Types.Mixed',
  MONGOOSE_DECIMAL_128: 'mongoose.Schema.Types.Decimal128'
};

/**
 * Tipos de índices en MongoDB
 */
export const IndexTypes = {
  SINGLE_FIELD: 'single',
  COMPOUND: 'compound',
  MULTIKEY: 'multikey',
  TEXT: 'text',
  GEOSPATIAL_2D: '2d',
  GEOSPATIAL_2DSPHERE: '2dsphere',
  HASHED: 'hashed',
  WILDCARD: 'wildcard',
  PARTIAL: 'partial',
  SPARSE: 'sparse',
  UNIQUE: 'unique',
  TTL: 'ttl'
};

/**
 * Tipos de validación de documentos
 */
export const ValidationTypes = {
  // Validadores básicos
  REQUIRED: 'required',
  TYPE: 'type',
  ENUM: 'enum',
  MIN: 'min',
  MAX: 'max',
  MIN_LENGTH: 'minlength',
  MAX_LENGTH: 'maxlength',
  MATCH: 'match',
  VALIDATE: 'validate',

  // JSON Schema
  JSON_SCHEMA: '$jsonSchema',
  BSON_TYPE: 'bsonType',
  PROPERTIES: 'properties',
  ADDITIONAL_PROPERTIES: 'additionalProperties',
  PATTERN_PROPERTIES: 'patternProperties',
  DEPENDENCIES: 'dependencies'
};

/**
 * Tipos de agregación
 */
export const AggregationTypes = {
  // Tipos de pipeline
  PIPELINE: 'pipeline',
  STAGE: 'stage',
  EXPRESSION: 'expression',

  // Tipos de operadores de agregación
  FIELD_PATH: 'fieldPath',
  LITERAL: 'literal',
  SYSTEM_VARIABLE: 'systemVariable',
  USER_VARIABLE: 'userVariable'
};

/**
 * Tipos geoespaciales
 */
export const GeospatialTypes = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon',
  GEOMETRY_COLLECTION: 'GeometryCollection'
};

/**
 * Tipos de datos especiales para GridFS
 */
export const GridFSTypes = {
  FILE_ID: 'files._id',
  FILENAME: 'files.filename',
  LENGTH: 'files.length',
  CHUNK_SIZE: 'files.chunkSize',
  UPLOAD_DATE: 'files.uploadDate',
  MD5: 'files.md5',
  METADATA: 'files.metadata',
  CHUNKS_ID: 'chunks._id',
  CHUNKS_FILES_ID: 'chunks.files_id',
  CHUNKS_N: 'chunks.n',
  CHUNKS_DATA: 'chunks.data'
};

/**
 * Todos los tipos de MongoDB organizados
 */
export const MongoDBTypes = {
  ...BSONTypes,
  ...MongoDBSchemaTypes,
  ...IndexTypes,
  ...ValidationTypes,
  ...AggregationTypes,
  ...GeospatialTypes,
  ...GridFSTypes
};

/**
 * Verificar si un tipo es válido en MongoDB
 * @param {string} type - Tipo a verificar
 * @returns {boolean}
 */
export function isValidMongoDBType(type) {
  return Object.values(MongoDBTypes).includes(type) ||
    Object.values(BSONTypeNumbers).includes(type);
}

/**
 * Obtener información de un tipo BSON
 * @param {string|number} type - Tipo BSON
 * @returns {object}
 */
export function getBSONTypeInfo(type) {
  // Si es un número, buscar el tipo correspondiente
  if (typeof type === 'number') {
    const typeName = Object.keys(BSONTypeNumbers).find(
      key => BSONTypeNumbers[key] === type
    );
    return {
      name: typeName,
      number: type,
      string: BSONTypes[typeName]
    };
  }

  // Si es un string, buscar el número correspondiente
  const typeUpper = type.toUpperCase();
  const typeNumber = BSONTypeNumbers[typeUpper];

  return {
    name: typeUpper,
    number: typeNumber,
    string: type.toLowerCase()
  };
}

/**
 * Verificar si un tipo es geoespacial
 * @param {string} type - Tipo a verificar
 * @returns {boolean}
 */
export function isGeospatialType(type) {
  return Object.values(GeospatialTypes).includes(type);
}

/**
 * Verificar si un tipo es de índice
 * @param {string} type - Tipo a verificar
 * @returns {boolean}
 */
export function isIndexType(type) {
  return Object.values(IndexTypes).includes(type);
}

/**
 * Obtener validadores aplicables a un tipo
 * @param {string} type - Tipo de dato
 * @returns {Array}
 */
export function getApplicableValidators(type) {
  const validators = ['required', 'validate'];

  switch (type.toLowerCase()) {
    case 'string':
      return [...validators, 'enum', 'minlength', 'maxlength', 'match'];
    case 'number':
    case 'int':
    case 'long':
    case 'double':
    case 'decimal':
      return [...validators, 'min', 'max', 'enum'];
    case 'array':
      return [...validators, 'enum'];
    case 'date':
      return [...validators, 'min', 'max'];
    case 'boolean':
      return validators;
    default:
      return validators;
  }
}

/**
 * Generar esquema JSON Schema para validación
 * @param {object} schemaDefinition - Definición del esquema
 * @returns {object}
 */
export function generateJSONSchema(schemaDefinition) {
  const schema = {
    $jsonSchema: {
      bsonType: 'object',
      properties: {}
    }
  };

  for (const [field, definition] of Object.entries(schemaDefinition)) {
    const fieldSchema = {};

    if (definition.type) {
      fieldSchema.bsonType = definition.type.toLowerCase();
    }

    if (definition.required) {
      if (!schema.$jsonSchema.required) {
        schema.$jsonSchema.required = [];
      }
      schema.$jsonSchema.required.push(field);
    }

    if (definition.enum) {
      fieldSchema.enum = definition.enum;
    }

    if (definition.minLength) {
      fieldSchema.minLength = definition.minLength;
    }

    if (definition.maxLength) {
      fieldSchema.maxLength = definition.maxLength;
    }

    if (definition.minimum) {
      fieldSchema.minimum = definition.minimum;
    }

    if (definition.maximum) {
      fieldSchema.maximum = definition.maximum;
    }

    if (definition.pattern) {
      fieldSchema.pattern = definition.pattern;
    }

    schema.$jsonSchema.properties[field] = fieldSchema;
  }

  return schema;
}

export default {
  BSONTypes,
  BSONTypeNumbers,
  MongoDBSchemaTypes,
  IndexTypes,
  ValidationTypes,
  AggregationTypes,
  GeospatialTypes,
  GridFSTypes,
  MongoDBTypes,
  isValidMongoDBType,
  getBSONTypeInfo,
  isGeospatialType,
  isIndexType,
  getApplicableValidators,
  generateJSONSchema
};