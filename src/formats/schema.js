// import {z} from 'zod';
import {dezerialize} from 'zodex';

import structuredCloning from './structuredCloning.js';

import {resolveJSONPointer} from '../utils/jsonPointer.js';
import {copyObject} from '../utils/objects.js';

/**
 * @typedef {T[keyof T]} ValueOf<T>
 * @template T
 */

/**
 * @typedef {ValueOf<
*   Pick<import('zodex').SzType, "type">
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
  ['symbol', 'symbol'],
  ['promise', 'promise'],
  // ['function', 'function'],

  ['catch', 'catch']
  // ['nativeEnum', 'nativeEnum']
]);

/**
 * @typedef {import('zodex').SzType} ZodexSchema
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
          newLeftObj[prop] = newLeftObj[prop]
            ? newLeftObj[prop] + ' and ' + val
            : val;
        }
      } else { // catchall, unknownKeys
        if (prop in newLeftObj) {
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
        prop in newLeftObj.properties) {
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
        unknownKeys: 'passthrough'
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
        path: /** @type {import('zodex').SzRef} */ (
          schemaObject
        ).$ref
      });
      return getTypesForSchema(refObj, originalJSON);
    }
    return new Set([schemaObject]);
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
      currentSchema = /** @type {import('zodex').SzObject} */ (
        parentSchema
      ).properties[
        /** @type {string} */ (arrayOrObjectPropertyName)
      ];
      if (!currentSchema) {
        currentSchema = /** @type {import('zodex').SzObject} */ (
          parentSchema
        ).catchall;
        mustBeOptional = true;
      }
      break;
    case 'array':
      currentSchema = /** @type {import('zodex').SzArray} */ (
        parentSchema
      ).element;
      break;
    case 'set':
      currentSchema = /** @type {import('zodex').SzSet} */ (
        parentSchema
      ).value;
      break;
    // Todo: Replace
    // case 'effect':
    //   currentSchema = /** @type {import('zodex').SzEffect} */ (
    //     parentSchema
    //   ).inner;
    //   break;
    // eslint-disable-next-line sonarjs/no-duplicated-branches -- Maintenance
    case 'promise':
      currentSchema = /** @type {import('zodex').SzPromise} */ (
        parentSchema
      ).value;
      break;
    case 'tuple':
      currentSchema = /** @type {import('zodex').SzTuple} */ (
        parentSchema
      ).items[Number(arrayOrObjectPropertyName)] ??
      /** @type {import('zodex').SzTuple} */ (
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
      /** @type {import('zodex').SzType} */ (currentSchema),
      /** @type {import('zodex').SzType} */ (
        stateObj.schemaContent
      )
    )];
    // console.log(
    //   'vvv', v, currentSchema,
    //   arrayOrObjectPropertyName, parentSchema, schemaObjects
    // );
    // console.log('schemaObjects', schemaObjects);
    for (const [schemaIdx, schema] of schemaObjects.entries()) {
      let unknownKeys;
      if (schema.type === 'object') {
        ({unknownKeys} = schema);
        // We don't want to eagerly match, e.g., if there are other objects
        //  which include the optional properties; this could cause a problem,
        //  however, if the tested object has extra non-standard properties
        schema.unknownKeys = 'strict';
      }
      const dezSchema = dezerialize(schema, {
        originalShape: stateObj.schemaContent
      });
      const parsed = dezSchema.safeParse(v);

      if (schema.type === 'object') {
        schema.unknownKeys = unknownKeys;
      }
      // console.log('parsed', parsed.success, v, schema);
      if (parsed.success) {
        const type = zodexToStructuredCloningTypeMap.get(schema.type);

        // Todo: Replace
        // if (!type && schema.type === 'effect') {
        //   type = /** @type {import('../types.js').AvailableType} */ (
        //     schema.effects[0].name
        //   );
        // }

        const typeObject =
          /** @type {Required<import('../types.js').TypeObject>} */ (
            types.getTypeObject(
              /** @type {import('../types.js').AvailableType} */ (type)
            )
          );

        if (typeObject.valueMatch && typeObject.valueMatch(v)) {
          // console.log(
          //   'matched', v, v?.length, type, schema, schemaIdx, schemaObjects
          // );
          // console.log('ssss', !stateObj.rootUI ||
          //   (stateObj.readonly || schemaObjects.length === 1),
          //    schema, schemaObjects);
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
      /** @type {import('zodex').SzType} */ (
        schemaOriginal
      ) ?? schemaObject
    )];

    // Note: Zod does not support array/object references

    // Todo: implement schema restrictions like tuple on array, record on object
    // Todo: Fix `iterate` for schemas (e.g., inject a value method in demo)

    /** @type {AvailableZodexType[]} */
    const typeArray = schemaObjects.map(({type}) => {
      return type;
    });

    return {
      schemaObjects,
      types: typeArray.map((item /* , idx */) => {
        // Todo: Replace
        // if (item === 'effect') {
        //   return /** @type {import('../types.js').AvailableType} */ (
        //     /** @type {import('zodex').SzEffect} */ (
        //       schemaObjects[idx]
        //     ).effects[0].name
        //   );
        // }
        return /** @type {import('../types.js').AvailableType} */ (
          zodexToStructuredCloningTypeMap.get(item)
        );
      })
    };
  }
};

export default schema;
