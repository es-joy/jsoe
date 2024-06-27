import {pointer} from '../vendor-imports.js';
import structuredCloning from './structuredCloning.js';

// Todo: After updating Zodex, switch to this type: `import('zodex').SzType`

/**
 * @typedef {any} ArbitraryObject
 */

/**
 * @typedef {import('zodex').SzType} ZodexSchema
 */

/**
 * @typedef {{[key: string]: string|NestedObject}} NestedObject
 */

/**
 * @param {ArbitraryObject} obj
 * @returns {ArbitraryObject}
 */
function copyObject (obj) {
  /** @type {NestedObject} */
  const newObj = {};
  for (const [prop, val] of Object.entries(obj)) {
    newObj[prop] = val && typeof val === 'object' ? copyObject(val) : val;
  }
  return newObj;
}

/**
 * @param {ZodexSchema} leftItem
 * @param {ZodexSchema} rightItem
 * @throws {Error}
 * @returns {ZodexSchema}
 */
function mergeSchema (leftItem, rightItem) {
  if (leftItem.type !== 'object') {
    console.log('leftItem', leftItem);
    throw new Error('Unexpected leftItem of type ' + leftItem.type);
  }
  if (rightItem.type !== 'object') {
    console.log('rightItem', rightItem);
    throw new Error('Unexpected rightItem of type ' + rightItem.type);
  }

  const newLeftObj = copyObject(leftItem);

  for (const [prop, val] of Object.entries(rightItem)) {
    if (prop !== 'type' && prop !== 'properties') {
      if (prop === 'description') {
        newLeftObj[prop] = newLeftObj[prop]
          ? newLeftObj[prop] + ' and ' + val
          : val;
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
    )[prop] = val && typeof val === 'object'
      ? copyObject(val)
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
function getTypesForSchema (schemaObject, originalJSON) {
  switch (schemaObject.type) {
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
  } default: {
    if ('$ref' in schemaObject) {
      const refObj = pointer(
        originalJSON,
        // todo: When Zodex updated, switch to `import('zodex').SzRef`
        /** @type {{$ref: string}} */ (schemaObject).$ref.slice(1)
      );
      return getTypesForSchema(refObj, originalJSON);
    }
    return new Set([schemaObject]);
  }
  }
}

/** @type {import('../formats.js').Format} */
const schema = {
  iterate (records, stateObj) {
    console.log('records', records, stateObj);
    stateObj.format = 'schema';
    return structuredCloning.iterate(records, stateObj);
  },

  types () {
    return structuredCloning.types();
  },

  getTypesAndSchemasForState (types, state, schemaObject) {
    if (!schemaObject) {
      throw new Error('Missing schema object');
    }
    // alert(JSON.stringify(schemaObject));
    const schemaObjects = [...getTypesForSchema(schemaObject, schemaObject)];
    console.log(
      schemaObjects
    );

    /* eslint-disable jsdoc/valid-types -- https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/147 */
    /**
     * @typedef {T[keyof T]} ValueOf<T>
     * @template T
     */
    /* eslint-enable jsdoc/valid-types -- https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/147 */

    /**
     * @typedef {ValueOf<
     *   Pick<import('zodex').SzType, "type">
     * >} AvailableZodexType
     */

    // Note: Zod does not support array/object references

    // Todo: implement schema restrictions like tuple on array, record on object
    // Todo: Fix `iterate` for schemas (e.g., inject a value method in demo)

    // Todo: Allow non-cloning version to return these too
    // const nonStructuredCloning = [
    //   'symbol',
    //   'function',
    //   'promise'
    // ];

    /** @type {Map<AvailableZodexType, import('../types.js').AvailableType>} */
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
      ['array', 'array'],
      ['object', 'object'],

      ['tuple', 'tuple'],
      ['record', 'record'],
      ['map', 'map'],
      ['set', 'set']
    ]);

    /** @type {AvailableZodexType[]} */
    const typeArray = schemaObjects.map(({type}) => {
      return type;
    });

    return {
      schemaObjects,
      types: typeArray.map((item) => {
        return /** @type {import('../types.js').AvailableType} */ (
          zodexToStructuredCloningTypeMap.get(item)
        );
      })
    };
  }
};

export default schema;
