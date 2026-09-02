// import {z} from 'zod';
import {dezerialize} from 'zodexy';
import deepEqual from 'fast-deep-equal/es6/index.js';

import structuredCloning from './structuredCloning.js';

import {resolveJSONPointer} from '../utils/jsonPointer.js';
import {copyObject} from '../utils/objects.js';
import {isUnionLike} from '../utils/types.js';
import FileList from '../utils/FileList.js';

/**
 * @typedef {T[keyof T]} ValueOf<T>
 * @template T
 */

/**
 * @typedef {ValueOf<
 *   Pick<import('zodexy').SzType, "type">
 * >} AvailableZodexType
 */

/**
 * @type {Map<
 *   AvailableZodexType,
 *   import('../types.js').AvailableArbitraryType
 * >
 * }
 */
const zodexToStructuredCloningTypeMap = new Map([
  ['boolean', 'boolean'],
  ['number', 'number'],
  ['nan', 'nan'],
  ['bigInt', 'bigint'],
  ['string', 'string'],
  ['date', 'date'],
  ['file', 'file'],
  ['undefined', 'undef'],
  ['void', 'undef'],
  ['null', 'null'],

  // ['array', 'array'],
  ['array', 'arrayNonindexKeys'],

  ['object', 'object'],

  ['tuple', 'array'],
  ['record', 'object'],
  ['looseRecord', 'object'],
  ['map', 'map'],
  ['set', 'set'],

  // Todo: Filter out for cloning-only
  ['promise', 'promise'],
  ['function', 'function']
]);

/**
 * @param {unknown} value
 * @returns {import('../types.js').AvailableArbitraryType|undefined}
 */
function getValueType (value) {
  if (value === null) {
    return 'null';
  }
  switch (typeof value) {
  case 'undefined':
    return 'undef';
  case 'bigint':
    return 'bigint';
  case 'boolean':
    return 'boolean';
  case 'number':
    return 'number';
  case 'string':
    return 'string';
  default:
    return undefined;
  }
}

/**
 * @param {import('zodexy').SzLiteral<any>|import('zodexy').SzEnum<any>} schema
 * @returns {Set<ZodexSchema>}
 */
function splitConstrainedSchema (schema) {
  const values = /** @type {unknown[]} */ (schema.type === 'literal'
    ? schema.values
    : Object.values(schema.values));
  const valueTypes = new Set(values.map((value) => getValueType(value)));
  return new Set([...valueTypes].flatMap((type) => {
    if (!type) {
      return [];
    }
    const typeValues = values.filter((value) => {
      return getValueType(value) === type;
    });
    const {defaultValue} = schema;
    return [{
      ...schema,
      values: schema.type === 'literal'
        ? typeValues
        : Object.fromEntries(Object.entries(schema.values).filter(([, value]) => {
          return getValueType(value) === type;
        })),
      defaultValue: typeValues.includes(defaultValue)
        ? defaultValue
        : typeValues[0]
    }];
  }));
}

/**
 * @param {ZodexSchema} schemaObject
 * @returns {import('../types.js').AvailableType|undefined}
 */
function getCheckedType (schemaObject) {
  return /** @type {import('../types.js').AvailableType|undefined} */ (
    schemaObject.checks?.[0]?.name
  );
}

/**
 * `z.stringbool()` serializes as a `pipe` (a string -> boolean codec) whose
 * `inner` is a plain string, `outer` is a boolean, and which carries the
 * `truthy`/`falsy`/`case` options on the pipe itself. jsoe edits the encoded
 * (string) side, so this is treated as a refinement of the String type -
 * a `kind` of string - rather than its own type or a boolean.
 * @param {ZodexSchema} schemaObject
 * @returns {boolean}
 */
function isStringboolSchema (schemaObject) {
  return schemaObject.type === 'pipe' &&
    schemaObject.inner?.type === 'string' &&
    schemaObject.outer?.type === 'boolean' &&
    'case' in schemaObject &&
    'falsy' in schemaObject &&
    'truthy' in schemaObject;
}

/**
 * @param {ZodexSchema} schemaObject
 * @returns {import('../types.js').AvailableArbitraryType|undefined}
 */
function getSchemaType (schemaObject) {
  if (isStringboolSchema(schemaObject)) {
    return 'string';
  }
  if (schemaObject.type === 'codec' && schemaObject.name === 'filelist') {
    return 'filelist';
  }
  if (schemaObject.type === 'instanceof') {
    return /** @type {import('../types.js').AvailableArbitraryType} */ (
      schemaObject.name
    );
  }
  if (schemaObject.type === 'literal') {
    return getValueType(schemaObject.values[0]);
  }
  if (schemaObject.type === 'enum') {
    return getValueType(Object.values(schemaObject.values)[0]);
  }
  if (schemaObject.type === 'templateLiteral') {
    return 'string';
  }
  return (
    getCheckedType(schemaObject) ??
      zodexToStructuredCloningTypeMap.get(schemaObject.type)
  );
}

const dezerializerInstances = {filelist: FileList};
const dezerializerCodecs = {
  filelist: {
    /**
     * @param {FileList} value
     * @returns {File[]}
     */
    decode (value) {
      return Array.from({length: value.length}, (_, idx) => value.item(idx));
    },
    /**
     * @param {File[]} value
     * @returns {FileList}
     */
    encode (value) {
      return new FileList(value);
    }
  }
};

/**
 * @param {InstanceType<typeof import('../types.js').default>} types
 * @param {ZodexSchema} schemaObject
 * @param {ZodexSchema} originalShape
 * @param {unknown} value
 * @returns {ReturnType<ReturnType<typeof dezerialize>['safeParse']>}
 */
function parseValue (types, schemaObject, originalShape, value) {
  return dezerialize(schemaObject, {
    checks: getChecks(types),
    codecs: dezerializerCodecs,
    instances: dezerializerInstances,
    originalShape
  }).safeParse(value);
}

/**
 * @param {InstanceType<typeof import('../types.js').default>} types
 * @param {ZodexSchema} schemaObject
 * @param {ZodexSchema} originalShape
 * @param {unknown} value
 * @returns {ZodexSchema|undefined}
 */
function getInvalidIntersectionBranch (
  types, schemaObject, originalShape, value
) {
  if (schemaObject.type === 'intersection') {
    return getInvalidIntersectionBranch(
      types, schemaObject.left, originalShape, value
    ) ?? getInvalidIntersectionBranch(
      types, schemaObject.right, originalShape, value
    );
  }
  return parseValue(types, schemaObject, originalShape, value).success
    ? undefined
    : schemaObject;
}

/**
 * Checks whether a record property name satisfies the record's `key` schema.
 *
 * For a strict `record` every key must conform, so the distinction is
 * irrelevant. For a `looseRecord`, Zod validates the `value` schema only
 * against entries whose key conforms; entries with a non-conforming key are
 * passed through untyped. Both the child-schema resolver in `arrayType.js` and
 * `convertFromTypeson` below use this to avoid imposing the `value` schema on
 * those pass-through entries.
 * @param {InstanceType<typeof import('../types.js').default>} types
 * @param {ZodexSchema|undefined} keySchema
 * @param {string|number|undefined} key
 * @returns {boolean}
 */
export function recordKeyConforms (types, keySchema, key) {
  if (!keySchema || key === undefined) {
    return true;
  }
  if (parseValue(types, keySchema, keySchema, key).success) {
    return true;
  }
  // Mirror Zod's numeric-string key fallback: an object property name is always
  //   a string, so a `number`/`bigInt`/`nan` key schema is retried against the
  //   coerced value.
  return typeof key === 'string' && key.trim() !== '' &&
    Number.isFinite(Number(key)) &&
    parseValue(types, keySchema, keySchema, Number(key)).success;
}

/**
 * Count how many branches of an `xor` (exclusive union) the value satisfies.
 * `xor` is valid only when exactly one matches; the count drives the editor's
 * live match indicator so an ambiguous value reads as a rule, not a glitch.
 * @param {InstanceType<typeof import('../types.js').default>} types
 * @param {import('zodexy').SzUnion} xorSchema
 * @param {unknown} value
 * @returns {{matched: number, total: number}}
 */
export function getXorBranchMatchInfo (types, xorSchema, value) {
  const options = /** @type {ZodexSchema[]} */ (xorSchema.options ?? []);
  let matched = 0;
  for (const option of options) {
    if (parseValue(types, option, xorSchema, value).success) {
      matched++;
    }
  }
  return {matched, total: options.length};
}

/**
 * Whether a value satisfies a single (already-flattened) schema branch. Used
 * to check the value against the specific `xor` branch the user chose, not
 * merely against some branch.
 * @param {InstanceType<typeof import('../types.js').default>} types
 * @param {ZodexSchema} schema
 * @param {unknown} value
 * @returns {boolean}
 */
export function valueMatchesSchema (types, schema, value) {
  return parseValue(types, schema, schema, value).success;
}

/**
 * @param {InstanceType<typeof import('../types.js').default>} types
 * @returns {NonNullable<
 *   import('zodexy').DezerializerOptions['checks']
 * >}
 */
function getChecks (types) {
  return Object.fromEntries(Object.entries(types.availableTypes).map(([
    name, typeObject
  ]) => {
    return [name, (payload) => {
      if (!Array.isArray(typeObject) && typeObject.valueMatch &&
          !typeObject.valueMatch(payload.value)) {
        payload.issues.push({
          code: 'custom',
          input: payload.value,
          message: `Value does not match ${name}`
        });
      }
    }];
  }));
}

/**
 * @typedef {import('zodexy').SzType} ZodexSchema
 */
/**
 * @typedef {import('../utils/objects.js').NestedObject} NestedObject
 */

/** @type {WeakMap<ZodexSchema, ZodexSchema>} */
const intersectionSchemas = new WeakMap();

/**
 * @param {ZodexSchema} schemaObject
 * @returns {ZodexSchema}
 */
export function getValidationSchema (schemaObject) {
  return intersectionSchemas.get(schemaObject) ?? schemaObject;
}

/**
 * @param {ZodexSchema['type']} type
 * @param {any} value
 * @returns {any}
 */
function getComparableConstraint (type, value) {
  return type === 'bigInt' ? BigInt(value) : value;
}

/**
 * Merge a serialized schema's `meta` bag from a wrapping or intersecting
 * schema into an inner one. `title`/`description` concatenate with `" and "`
 * (mirroring how a bare `description` is merged), skipping Zodexy's
 * `"Modifiers"` sentinel; any other key is taken from the source only when the
 * target lacks it.
 * @param {{[key: string]: any}|undefined} target
 * @param {{[key: string]: any}} source
 * @returns {{[key: string]: any}}
 */
function mergeMeta (target, source) {
  const merged = {...target};
  for (const [key, val] of Object.entries(source)) {
    if (key === 'title' || key === 'description') {
      if (typeof val === 'string' && val !== 'Modifiers') {
        merged[key] = typeof merged[key] === 'string' &&
            merged[key] !== 'Modifiers'
          ? merged[key] + ' and ' + val
          : val;
      }
    } else if (!Object.hasOwn(merged, key)) {
      merged[key] = val && typeof val === 'object' ? copyObject(val) : val;
    }
  }
  return merged;
}

/**
 * @param {ZodexSchema} leftItem
 * @param {ZodexSchema} rightItem
 * @throws {Error}
 * @returns {ZodexSchema}
 */
function mergeSchema (leftItem, rightItem) {
  if (leftItem.type !== rightItem.type) {
    throw new Error(
      'Cannot merge intersection types ' + leftItem.type + ' and ' +
      rightItem.type
    );
  }

  const newLeftObj = copyObject(leftItem);

  for (const [prop, val] of Object.entries(rightItem)) {
    if (prop !== 'type' && prop !== 'properties' && prop !== 'error') {
      if (prop === 'description') {
        if (val !== 'Modifiers') { // A bit cleaner
          const existingDescription = newLeftObj[prop];
          newLeftObj[prop] = existingDescription
            ? existingDescription + ' and ' + val
            : val;
        }
      } else if (prop === 'meta') {
        newLeftObj.meta = mergeMeta(
          /** @type {{[key: string]: any}} */ (newLeftObj.meta),
          /** @type {{[key: string]: any}} */ (val)
        );
      } else if (Object.hasOwn(newLeftObj, prop)) {
        if (newLeftObj[prop] !== val && !deepEqual(newLeftObj[prop], val)) {
          if (leftItem.type === 'object') {
            throw new Error(
              'Duplicate property ' + prop + ' of value ' +
              JSON.stringify(val) + ' and ' +
              JSON.stringify(newLeftObj[prop])
            );
          }
          if (prop === 'min' || prop === 'minLength') {
            const existingConstraint = getComparableConstraint(
              leftItem.type, newLeftObj[prop]
            );
            const rightConstraint = getComparableConstraint(
              rightItem.type, val
            );
            newLeftObj[prop] = existingConstraint > rightConstraint
              ? newLeftObj[prop]
              : val;
          } else if (prop === 'max' || prop === 'maxLength') {
            const existingConstraint = getComparableConstraint(
              leftItem.type, newLeftObj[prop]
            );
            const rightConstraint = getComparableConstraint(
              rightItem.type, val
            );
            newLeftObj[prop] = existingConstraint < rightConstraint
              ? newLeftObj[prop]
              : val;
          }
        }
      } else {
        newLeftObj[prop] = val && typeof val === 'object'
          ? copyObject(val)
          /* istanbul ignore next -- Guard */
          : val;
      }
    }
  }

  if (leftItem.type !== 'object' || rightItem.type !== 'object') {
    delete newLeftObj.error;
    return newLeftObj;
  }

  for (const [prop, val] of Object.entries(rightItem.properties)) {
    if (typeof newLeftObj.properties !== 'string' &&
        Object.hasOwn(newLeftObj.properties, prop)) {
      if (deepEqual(newLeftObj.properties[prop], val)) {
        // Identical property schemas from both intersection branches merge to
        //   themselves; nothing to reconcile
        continue;
      }
      throw new Error(
        'Duplicate property ' + prop + ' of value ' +
        JSON.stringify(val) + ' and ' +
        JSON.stringify(newLeftObj.properties[prop])
      );
    }
    /** @type {NestedObject} */ (
      newLeftObj.properties
    )[prop] = /* istanbul ignore next -- Guard */
      val && typeof val === 'object'
        ? copyObject(val)
        /* istanbul ignore next -- Guard */
        : val;
  }

  return newLeftObj;
}

/**
 * @param {Set<ZodexSchema>} left
 * @param {Set<ZodexSchema>} right
 * @returns {ZodexSchema[]}
 */
function flattenIntersection (left, right) {
  const leftArray = [...left];
  const rightArray = [...right];

  const items = [];
  for (const leftItem of leftArray) {
    for (const rightItem of rightArray) {
      items.push(mergeSchema(leftItem, rightItem));
    }
  }

  return items;
}

let unionGroupID = 0;
/**
 * @param {ZodexSchema} schemaObject
 * @param {(ZodexSchema & {
 *   $unionGroupID?: number, $defaultValue?: any, $readonlyParent?: any
 * })[]} set
 * @returns {void}
 */
function addModifiers (schemaObject, set) {
  if ('defaultValue' in schemaObject) {
    unionGroupID++;
    for (const obj of set) {
      // Todo: Validate that `defaultValue` is possible and allow for
      //        selection of the first schema to validate the `defaultValue`;
      //        also validate things like impossible max/min combos
      obj.$unionGroupID = unionGroupID;
      obj.$defaultValue = schemaObject.defaultValue;
    }
  }

  if (schemaObject.isNullable) {
    set.push({
      type: 'null'
    });
  }

  if (schemaObject.isOptional) {
    for (const obj of set) {
      if (!('isOptional' in obj)) {
        obj.isOptional = schemaObject.isOptional;
      }
    }
  }
  if (schemaObject.readonly) {
    for (const obj of set) {
      if (!('readonly' in obj)) {
        obj.$readonlyParent = schemaObject.readonly;
      }
    }
  }

  if (schemaObject.description) {
    for (const obj of set) {
      obj.description = obj.description
        ? obj.description + ' and ' + schemaObject.description
        : schemaObject.description;
    }
  }

  if (schemaObject.meta && typeof schemaObject.meta === 'object') {
    for (const obj of set) {
      obj.meta = mergeMeta(
        /** @type {{[key: string]: any}} */ (obj.meta),
        /** @type {{[key: string]: any}} */ (schemaObject.meta)
      );
    }
  }
}

/**
 * @param {ZodexSchema} schemaObject
 * @param {ZodexSchema} originalJSON
 * @returns {Set<ZodexSchema>}
 */
export function getTypesForSchema (schemaObject, originalJSON) {
  for (;;) {
    if (getCheckedType(schemaObject)) {
      return new Set([schemaObject]);
    }
    switch (schemaObject.type) {
    case 'never':
      return new Set();
    case 'literal':
    case 'enum':
      return splitConstrainedSchema(schemaObject);
    case 'catch': {
      const catchSchema = schemaObject;
      const innerSchemas = [...getTypesForSchema(
        catchSchema.innerType, originalJSON
      )].map((innerSchema) => ({...innerSchema}));
      addModifiers(schemaObject, innerSchemas);
      const fallbackSchemas = [...getTypesForSchema({
        type: 'literal',
        values: [catchSchema.value]
      }, originalJSON)];
      addModifiers(schemaObject, fallbackSchemas);
      return new Set([...innerSchemas, ...fallbackSchemas]);
    }
    case 'object': {
      const set = new Set();
      // const {properties} = schemaObject;
      // if (
      //   'type' in properties && properties.type.type === 'enum' &&
      //   properties.type.values.length === 1
      // ) {
      //   set.add(schemaObject);
      //   set.add(properties.type.defaultValue);
      // }
      // eslint-disable-next-line unicorn/no-immediate-mutation -- May add above
      set.add(schemaObject);
      return set;
    }
    case 'discriminatedUnion':
    case 'xor':
    case 'union': {
      /** @type {(ZodexSchema & {$discriminator?: string})[]} */
      let set = [];
      for (const option of schemaObject.options) {
        set = [...set, ...getTypesForSchema(option, originalJSON)];
      }

      if (schemaObject.type === 'discriminatedUnion') {
        for (const obj of set) {
          // Todo: Use to confirm the object has the discriminator
          obj.$discriminator = schemaObject.discriminator;
        }
      }

      addModifiers(schemaObject, set);
      return new Set(set);
    } case 'intersection': {
      const left = getTypesForSchema(schemaObject.left, originalJSON);
      const right = getTypesForSchema(schemaObject.right, originalJSON);

      const set = flattenIntersection(left, right);
      for (const item of set) {
        intersectionSchemas.set(item, schemaObject);
      }
      addModifiers(schemaObject, set);
      return new Set(set);
    } case 'pipe': {
      if (isStringboolSchema(schemaObject)) {
        // Keep the whole `pipe` as the schema object: `getSchemaType` reports it
        //   as a String, `stringType` reads its `truthy`/`falsy`/`case` to
        //   validate the value, and `dezerialize` still rebuilds
        //   `z.stringbool({truthy, falsy})` for value parsing. Drop the
        //   `description` first so `addModifiers` re-adds it once rather than
        //   concatenating it with itself.
        const stringboolSchema = {...schemaObject};
        delete stringboolSchema.description;
        const set = [stringboolSchema];
        addModifiers(schemaObject, set);
        return new Set(set);
      }
      const set = [...getTypesForSchema(schemaObject.inner, originalJSON)];
      addModifiers(schemaObject, set);
      return new Set(set);
    } case 'any': case 'unknown':
      return new Set([
        {
          type: 'boolean'
        },
        {
          type: 'number'
        },
        {
          type: 'nan'
        },
        {
          type: 'bigInt'
        },
        {
          type: 'string'
        },
        {
          description: 'Email',
          type: 'string',
          kind: 'email'
        },
        {
          description: 'URL',
          type: 'string',
          kind: 'url'
        },
        {
          description: 'Date',
          type: 'string',
          kind: 'date'
        },
        {
          type: 'date'
        },
        // {
        //   type: 'void'
        // },
        {
          type: 'undefined'
        },
        {
          type: 'null'
        },
        {
          type: 'object',
          properties: {},
          catchall: {
            type: 'unknown'
          }
        },

        // Todo: support these types separately
        // {
        //   type: 'symbol'
        // },
        // {
        //   type: 'promise',
        //   value: {
        //     type: 'any'
        //   }
        // },
        // {
        //   type: 'function',
        //   args: {
        //     type: 'tuple',
        //     items: [],
        //     rest: {
        //       type: 'any'
        //     }
        //   },
        //   returns: {
        //     type: 'any'
        //   }
        // },
        {
          type: 'array',
          element: {
            type: 'any'
          }
        },
        {
          type: 'set',
          value: {
            type: 'any'
          }
        },
        {
          type: 'map',
          key: {
            type: 'any'
          },
          value: {
            type: 'any'
          }
        },

        {
          type: 'any',
          checks: [{name: 'regexp'}]
        },
        {
          type: 'any',
          checks: [{name: 'blob'}]
        },
        {
          type: 'any',
          checks: [{name: 'BooleanObject'}]
        },
        {
          type: 'any',
          checks: [{name: 'NumberObject'}]
        },
        {
          type: 'any',
          checks: [{name: 'StringObject'}]
        },
        {
          type: 'any',
          checks: [{name: 'SpecialRealNumber'}]
        },
        {
          type: 'any',
          checks: [{name: 'domexception'}]
        },
        {
          type: 'any',
          checks: [{name: 'error'}]
        },
        {
          type: 'any',
          checks: [{name: 'filelist'}]
        },
        {
          type: 'any',
          checks: [{name: 'file'}]
        },
        {
          type: 'any',
          checks: [{name: 'resurrectable'}] // noneditable
        },
        {
          type: 'any',
          checks: [{name: 'blobHTML'}]
        },
        {
          type: 'any',
          checks: [{name: 'buffersource'}]
        },
        {
          type: 'any',
          checks: [{name: 'dommatrix'}]
        },
        {
          type: 'any',
          checks: [{name: 'dompoint'}]
        },
        {
          type: 'any',
          checks: [{name: 'domrect'}]
        },
        {
          type: 'any',
          checks: [{name: 'errors'}]
        },

        // Todo: Adapt into a widget to drag to point back to another object
        {
          description: 'JSON Reference',
          type: 'object',
          properties: {
            $ref: {
              type: 'string'
            }
          }
        }
      ]);
    default: {
      if ('$ref' in schemaObject) {
        // console.log('originalJSON', originalJSON, schemaObject.$ref);
        const refObj = resolveJSONPointer({
          obj: originalJSON,
          path: /** @type {import('zodexy').SzRef} */ (
            schemaObject
          ).$ref
        });
        schemaObject = refObj;
        // eslint-disable-next-line unicorn/no-break-in-nested-loop -- Intentional, continues the `for` loop
        continue;
      }
      return new Set([schemaObject]);
    }
    }
  }
}

/** @type {import('../formats.js').Format} */
const schema = {
  isValueValidationRequired (schemaObject) {
    // `record`/`tuple` refine the `object`/`array` UI, whose structure does not
    //   by itself enforce the key schema, positional item schemas, or `rest`;
    //   so the assembled value must be parsed to surface those failures on the
    //   form control.
    if (['record', 'looseRecord', 'tuple'].includes(schemaObject.type)) {
      return true;
    }
    return schemaObject.type !== 'object' &&
      intersectionSchemas.has(schemaObject);
  },
  validateValue (types, schemaObject, value) {
    const validationSchema = getValidationSchema(schemaObject);
    const parsed = parseValue(
      types, validationSchema, validationSchema, value
    );
    return parsed.success
      ? {valid: true}
      : {
        valid: false,
        message: parsed.error.issues[0]?.message,
        schema: validationSchema.type === 'intersection'
          ? getInvalidIntersectionBranch(
            types, validationSchema, validationSchema, value
          )
          : validationSchema
      };
  },
  iterate (records, stateObj) {
    // console.log('records', records, stateObj);
    stateObj.format = 'schema';
    return structuredCloning.iterate(records, stateObj);
  },

  convertFromTypeson (
    typesonType, types, v, arrayOrObjectPropertyName, parentSchemaInfo, stateObj
  ) {
    // eslint-disable-next-line prefer-const -- Convenient
    let [parentSchema, parentSchemaIdx] = parentSchemaInfo ?? [];
    /* istanbul ignore if -- Guard */
    if (!stateObj) {
      throw new Error('State object expected for schema');
    }
    let currentSchema = stateObj.schemaContent;
    let mustBeOptional = false;
    // console.log('currentSchema', currentSchema);
    // console.log(
    //   'parentSchema', parentSchemaIdx, parentSchema, '::',
    //   arrayOrObjectPropertyName
    // );

    // We shouldn't have to reprocess intersections, etc., as this is our own
    //   union
    if (typeof parentSchemaIdx === 'number' && isUnionLike(parentSchema?.type)) {
      parentSchema = /** @type {import('zodexy').SzUnion} */ (
        parentSchema
      ).options[parentSchemaIdx];
    }

    switch (parentSchema?.type) {
    case 'object':
      currentSchema = /** @type {import('zodexy').SzObject} */ (
        parentSchema
      ).properties[
        /** @type {string} */ (arrayOrObjectPropertyName)
      ];
      if (!currentSchema) {
        currentSchema = /** @type {import('zodexy').SzObject} */ (
          parentSchema
        ).catchall;
        mustBeOptional = true;
      }
      break;
    case 'array':
      currentSchema = /** @type {import('zodexy').SzArray} */ (
        parentSchema
      ).element;
      break;
    case 'set':
      currentSchema = /** @type {import('zodexy').SzSet} */ (
        parentSchema
      ).value;
      break;
    case 'codec':
      if (parentSchema.name === 'filelist' &&
          parentSchema.output.type === 'array') {
        currentSchema = typesonType === 'file'
          ? parentSchema.output.element
          : parentSchema;
      }
      break;
    // No need to handle differently?
    // case 'instanceof':
    //   currentSchema = /** @type {import('zodexy').SzInstanceOf} */ (
    //     parentSchema
    //   );
    //   break;
    // eslint-disable-next-line sonarjs/no-duplicated-branches -- Maintenance
    case 'promise':
      currentSchema = /** @type {import('zodexy').SzPromise} */ (
        parentSchema
      ).value;
      break;
    case 'tuple':
      currentSchema = /** @type {import('zodexy').SzTuple} */ (
        parentSchema
      ).items[Number(arrayOrObjectPropertyName)] ??
      /** @type {import('zodexy').SzTuple} */ (
        parentSchema
      ).rest;
      break;
    case 'record':
      // Every own property of a record shares the single `value` schema; the
      //   `key` schema constrains the property name and is enforced by
      //   value-level validation (`isValueValidationRequired`). Record keys are
      //   dynamic, so no individual property is required.
      currentSchema = /** @type {import('zodexy').SzRecord<any, any>} */ (
        parentSchema
      ).value;
      mustBeOptional = true;
      break;
    case 'looseRecord':
      // As `record`, but only for keys that satisfy the `key` schema. Zod's
      //   loose mode passes non-conforming keys through untyped, so the `value`
      //   schema must not be imposed on them; leaving `currentSchema` unset
      //   falls back to the value's own runtime type (`{type: typesonType}`).
      mustBeOptional = true;
      currentSchema = recordKeyConforms(
        types,
        /** @type {import('zodexy').SzLooseRecord<any, any>} */ (
          parentSchema
        ).key,
        arrayOrObjectPropertyName
      )
        ? /** @type {import('zodexy').SzLooseRecord<any, any>} */ (
          parentSchema
        ).value
        : undefined;
      break;
    // Todo:
    // 'map': key, value
    // 'function': args, returns
    default:
      break;
    }

    // Reached when there is no governing schema for this child: an unschema'd
    //   parent, or a `looseRecord` entry whose key does not satisfy the `key`
    //   schema (Zod's loose mode passes such entries through untyped). Fall back
    //   to the value's own runtime type.
    if (!currentSchema) {
      return {type: typesonType};
    }
    const schemaObjects = [...getTypesForSchema(
      currentSchema,
      /** @type {import('zodexy').SzType} */ (
        stateObj.schemaContent
      )
    )];
    // console.log(
    //   'vvv', v, currentSchema,
    //   arrayOrObjectPropertyName, parentSchema, schemaObjects
    // );
    // console.log('schemaObjects', schemaObjects);

    // When several union options accept the value, the first structural match
    //   is not necessarily the best one: a bare `{type: 'object', properties:
    //   {}}` option strips unrecognized keys, so it parses successfully (with
    //   data loss) even when a sibling option describes the value's actual
    //   shape. Prefer an option that round-trips the value losslessly, then one
    //   that at least parses, and only then one that merely matches the value's
    //   kind. Preserving that last tier matters for a preloaded value that is
    //   the right type but violates a refinement (a `File` whose MIME type is
    //   outside the schema's `mime`, an array shorter than `min`, …): the
    //   control should still carry its schema (and description), with the
    //   violation surfaced by value-level validation, rather than degrading to
    //   an untyped control.
    let fallbackMatch;
    let structuralMatch;
    for (const [schemaIdx, schema] of schemaObjects.entries()) {
      const type = getSchemaType(schema);

      const typeObject =
        /** @type {Required<import('../types.js').TypeObject>} */ (
          types.getTypeObject(
            /** @type {import('../types.js').AvailableType} */ (type)
          )
        );

      if (!typeObject.valueMatch?.(v)) {
        continue;
      }

      const dezSchema = dezerialize(schema, {
        checks: getChecks(types),
        codecs: dezerializerCodecs,
        instances: dezerializerInstances,
        originalShape: stateObj.schemaContent
      });
      const parsed = type === 'promise'
        ? {success: true}
        : dezSchema.safeParse(v);
      // console.log('parsed', parsed.success, v, schema);

      /**
       * @type {{
       *   type: import('../types.js').AvailableArbitraryType|undefined,
       *   schema?: import('zodexy').SzType,
       *   mustBeOptional?: boolean,
       *   schemaIdx?: number
       * }}
       */
      const match = {
        type,
        schemaIdx,
        // For `readonly`, we just want to show the current type (no
        //   pull-down)
        schema: !stateObj.rootUI ||
          (stateObj.readonly || schemaObjects.length === 1)
          ? schema
          // This synthesized schema only drives the type-choices pull-down;
          //   it is deliberately a plain `union` of the flattened leaf
          //   candidates. Exclusive (`xor`) / keyed (`discriminatedUnion`)
          //   enforcement stays with the original schema node, which
          //   `getValidationSchema` passes through untouched to
          //   `validateValue`.
          : {
            type: 'union',
            options: schemaObjects
          },
        mustBeOptional
      };

      if (parsed.success) {
        // console.log(
        //   'matched', v, v?.length, type, schema, schemaIdx, schemaObjects
        // );
        if (
          type === 'promise' ||
          ('data' in parsed && deepEqual(parsed.data, v))
        ) {
          return match;
        }
        fallbackMatch ??= match;
      } else {
        structuralMatch ??= match;
      }
    }
    if (fallbackMatch) {
      return fallbackMatch;
    }
    if (structuralMatch) {
      return structuralMatch;
    }
    return {type: typesonType};
  },

  /* istanbul ignore next -- Not in use */
  types () {
    /* istanbul ignore next -- Not in use */
    return structuredCloning.types();
  },

  getTypesAndSchemasForState (types, state, schemaObject, schemaOriginal) {
    if (!schemaObject) {
      throw new Error('Missing schema object');
    }

    // We don't care about the current schema, as these are inner types
    if (state === 'array') {
      return structuredCloning.getTypesAndSchemasForState(
        types, state, schemaObject, schemaOriginal
      );
    }

    // console.log(JSON.stringify(schemaObject));
    const schemaObjects = [...getTypesForSchema(
      schemaObject,
      /** @type {import('zodexy').SzType} */ (
        schemaOriginal
      ) ?? schemaObject
    )];

    // Note: Zod does not support array/object references

    // `tuple`/`record` restrictions on `array`/`object` are applied via
    //   `getSchemaType` (type mapping) plus `arrayType.js` reading
    //   `specificSchemaObject.type`, and enforced by `isValueValidationRequired`.
    // Todo: Fix `iterate` for schemas (e.g., inject a value method in demo)

    return {
      schemaObjects,
      types: schemaObjects.map((schemaItem) => {
        return /** @type {import('../types.js').AvailableArbitraryType} */ (
          getSchemaType(schemaItem)
        );
      })
    };
  }
};

export default schema;
