// import {z} from 'zod';
import {dezerialize} from 'zodexy';

import structuredCloning from './structuredCloning.js';

import {resolveJSONPointer} from '../utils/jsonPointer.js';
import {copyObject} from '../utils/objects.js';

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
  ['undefined', 'undef'],
  ['void', 'void'],
  ['null', 'null'],

  // ['array', 'array'],
  ['array', 'arrayNonindexKeys'],

  ['object', 'object'],
  ['enum', 'enum'],
  ['literal', 'literal'],

  ['tuple', 'tuple'],
  ['record', 'record'],
  ['map', 'map'],
  ['set', 'set'],

  ['never', 'never'],

  // Todo: Filter out for cloning-only
  ['promise', 'promise'],
  ['function', 'function'],

  ['catch', 'catch']
]);

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

/**
 * @param {ZodexSchema} leftItem
 * @param {ZodexSchema} rightItem
 * @throws {Error}
 * @returns {ZodexSchema}
 */
function mergeSchema (leftItem, rightItem) {
  /* istanbul ignore if -- Guard */
  if (leftItem.type !== 'object') {
    console.log('leftItem', leftItem);
    throw new Error('Unexpected leftItem of type ' + leftItem.type);
  }
  /* istanbul ignore if -- Guard */
  if (rightItem.type !== 'object') {
    console.log('rightItem', rightItem);
    throw new Error('Unexpected rightItem of type ' + rightItem.type);
  }

  const newLeftObj = copyObject(leftItem);

  for (const [prop, val] of Object.entries(rightItem)) {
    if (prop !== 'type' && prop !== 'properties') {
      if (prop === 'description') {
        if (val !== 'Modifiers') { // A bit cleaner
          const existingDescription = newLeftObj[prop];
          newLeftObj[prop] = existingDescription
            ? existingDescription + ' and ' + val
            : val;
        }
      } else { // catchall
        if (Object.hasOwn(newLeftObj, prop)) {
          throw new Error(
            'Duplicate property ' + prop + ' of value ' +
            JSON.stringify(val) + ' and ' +
            JSON.stringify(newLeftObj[prop])
          );
        }

        newLeftObj[prop] = val && typeof val === 'object'
          ? copyObject(val)
          /* istanbul ignore next -- Guard */
          : val;
      }
    }
  }

  for (const [prop, val] of Object.entries(rightItem.properties)) {
    if (typeof newLeftObj.properties !== 'string' &&
        Object.hasOwn(newLeftObj.properties, prop)) {
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
      addModifiers(schemaObject, set);
      return new Set(set);
    } case 'pipe': {
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
          type: 'never'
        },
        // Todo: Need to convert
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'regexp',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'blob',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'BooleanObject',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'NumberObject',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'StringObject',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'SpecialRealNumber',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'domexception',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'error',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'filelist',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'file',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'resurrectable', // noneditable
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'blobHTML',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'buffersource',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'dommatrix',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'dompoint',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'domrect',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
        // {
        //   type: 'effect',
        //   effects: [
        //     {
        //       name: 'errors',
        //       type: 'refinement'
        //     }
        //   ],
        //   inner: {type: 'any'}
        // },
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
    if (typeof parentSchemaIdx === 'number' && parentSchema?.type === 'union') {
      parentSchema = parentSchema.options[parentSchemaIdx];
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
    // Todo: Replace
    // case 'effect':
    //   currentSchema = /** @type {import('zodexy').SzEffect} */ (
    //     parentSchema
    //   ).inner;
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
    // Todo:
    // 'record': key, value
    // 'map': key, value
    // 'function': args, returns
    default:
      break;
    }

    /* istanbul ignore if -- Guard */
    if (!currentSchema) {
      return {type: typesonType};
    }
    const schemaObjects = [...getTypesForSchema(
      /** @type {import('zodexy').SzType} */ (currentSchema),
      /** @type {import('zodexy').SzType} */ (
        stateObj.schemaContent
      )
    )];
    // console.log(
    //   'vvv', v, currentSchema,
    //   arrayOrObjectPropertyName, parentSchema, schemaObjects
    // );
    // console.log('schemaObjects', schemaObjects);
    for (const [schemaIdx, schema] of schemaObjects.entries()) {
      const type = getCheckedType(schema) ??
        zodexToStructuredCloningTypeMap.get(schema.type);

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
        originalShape: stateObj.schemaContent
      });
      const parsed = type === 'promise'
        ? {success: true}
        : dezSchema.safeParse(v);
      // console.log('parsed', parsed.success, v, schema);
      if (parsed.success) {
        // console.log(
        //   'matched', v, v?.length, type, schema, schemaIdx, schemaObjects
        // );
        return {
          type,
          schemaIdx,
          // For `readonly`, we just want to show the current type (no
          //   pull-down)
          schema: !stateObj.rootUI ||
            (stateObj.readonly || schemaObjects.length === 1)
            ? schema
            : {
              type: 'union',
              options: schemaObjects
            },
          mustBeOptional
        };
      }
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

    // alert(JSON.stringify(schemaObject));
    const schemaObjects = [...getTypesForSchema(
      schemaObject,
      /** @type {import('zodexy').SzType} */ (
        schemaOriginal
      ) ?? schemaObject
    )];

    // Note: Zod does not support array/object references

    // Todo: implement schema restrictions like tuple on array, record on object
    // Todo: Fix `iterate` for schemas (e.g., inject a value method in demo)

    return {
      schemaObjects,
      types: schemaObjects.map((schemaItem) => {
        return getCheckedType(schemaItem) ??
        /** @type {import('../types.js').AvailableType} */ (
          zodexToStructuredCloningTypeMap.get(schemaItem.type)
        );
      })
    };
  }
};

export default schema;
