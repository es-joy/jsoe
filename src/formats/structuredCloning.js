import {
  Typeson, unescapeKeyPathComponent, structuredCloningThrowing,
  resurrectable as noneditable, toStringTag
} from '../vendor-imports.js';

import {buildTypeChoices} from '../typeChoices.js';
import {
  typesonPathToJSONPointer
} from '../utils/jsonPointer.js';

import json from './json.js';

// We modify resurrectable in hopes an including application doesn't need it
/** @type {import('typeson').TypeSpecSet} */ (
  noneditable.resurrectable
).test = /** @type {import('typeson').Tester} */ (x) => {
  return x && typeof x === 'object' && !Array.isArray(x) &&
          // Could be a user object with a string tag, but we can't tell
          toStringTag(x) !== 'Object';
};

/**
 * @typedef {(info: {
 *   propName: string,
 *   type: import('../types.js').AvailableType,
 *   value: import('../formats.js').StructuredCloneValue,
 *   bringIntoFocus?: boolean,
 *   setAValue?: boolean,
 *   schemaContent?: object,
 *   schemaState?: import('../types.js').GetPossibleSchemasForPathAndType
 * }) => HTMLElement|null} AddAndSetArrayElement
 */

/**
 * @typedef {import('typeson-registry').EncapsulateObserver} EncapsulateObserver
 */

/**
 * @param {import('../types.js').StateObject} stateObj
 * @returns {EncapsulateObserver}
 */
const encapsulateObserver = (stateObj) => {
  const {
    typeNamespace, readonly, format: frmt, schemaContent,
    formats,
    types,
    getPossibleSchemasForPathAndType
  } = stateObj;

  const format = /** @type {import('../formats.js').AvailableFormat} */ (frmt);

  /**
   * @type {{[key: string]: HTMLElement & {
   *   $addAndSetArrayElement: AddAndSetArrayElement
   * }}}
   */
  const parents = {};

  /** @type {string[]} */
  const mapPaths = [];

  return (observerObj) => {
    const {
      type,
      cyclic,
      keypath,
      value,
      replaced,
      cyclicKeypath,
      endIterateIn,
      endIterateOwn,
      endIterateUnsetNumeric,
      clone
    } = observerObj;
    if ('replaced' in observerObj) {
      return;
    }
    if (cyclic === 'readonly' && !Array.isArray(observerObj.value)) {
      return;
    }
    if (cyclic === 'readonly' && (type === 'set' || type === 'filelist')) {
      return;
    }
    if (endIterateIn || endIterateOwn) {
      return;
    }
    if (endIterateUnsetNumeric || (
      clone === undefined && cyclicKeypath === undefined && Array.isArray(value)
    )) {
      return;
    }

    // What other situations is this firing twice, and it
    //   shouldn't reach here?
    if (observerObj.replacing && type === 'negativeZero') {
      return;
    }

    /* istanbul ignore if -- Not part of format */
    if (type === 'sparseUndefined') { // We'll handle otherwise
      return;
    }

    /** @type {import('../types.js').AvailableType} */
    let newType;
    let newValue = value;

    /* schema: || format.startsWith('schema-') */
    const state = format === 'structuredCloning'
      ? 'arrayNonindexKeys'
    // ? 'sparseArrays'
      : 'array';
    if (typeof cyclicKeypath === 'string') {
      newValue = typesonPathToJSONPointer(cyclicKeypath);
      newType = type === 'array' ? 'arrayReference' : 'objectReference';
      newType = canonicalToAvailableType(
        /** @type {import('../types.js').default} */ (types),
        /** @type {import('../formats.js').default} */ (formats),
        format, state, newType, value
      ); // Todo (low): Add accurate state for second argument
    } else {
      try {
        newType = canonicalToAvailableType(
          /** @type {import('../types.js').default} */ (types),
          /** @type {import('../formats.js').default} */ (formats),
          format,
          state,
          /**
           * @type {import('../types.js').AvailableType}
           */
          (type),
          value
        ); // Todo (low): Add state for second argument
      } catch (err) {
        console.log('err', type, err);
        stateObj.error = /** @type {Error} */ (err);
        return;
      }
    }

    const li = keypath.lastIndexOf('.');
    const arrayOrObjectPropertyName =
      unescapeKeyPathComponent(keypath.slice(li + 1));
    const parentPath = li === -1 ? '' : keypath.slice(0, li);

    const hasChildren = [
      'array', 'object', 'set', 'map',
      // 'sparseArrays',
      'arrayNonindexKeys'
    ].includes(newType);

    // Maps are followed up by arrays which we don't want as such;
    //  we track the paths to avoid reporting these child arrays
    const mapType = type === 'map' &&
      Object.prototype.toString.call(value) === '[object Map]';
    if (mapType) {
      mapPaths.push(keypath);
    }

    if (!stateObj.rootUI) {
      // console.log('vvvv0', newType, newValue);
      stateObj.rootUI = types?.getUIForModeAndType({
        readonly,
        typeNamespace,
        type: newType,
        bringIntoFocus: false,
        buildTypeChoices,
        format,
        schemaContent,
        schemaState: getPossibleSchemasForPathAndType,
        /* schema:
        &&
        getPossibleSchemasForPathAndType({
          keypath,
          parentPath: '',
          valueType: newType
        }),
        */
        value: newValue,
        hasValue: true,
        // Not currently in use but may be convenient for a
        //     type wanting the serialized data
        replaced
      });
      parents[''] = /**
      * @type {HTMLElement &
      *   {$addAndSetArrayElement: AddAndSetArrayElement}}
      */ (stateObj.rootUI);

      // Since we're skipping the array elements, we need to add the
      //   map element to the array index where the array children
      //   will be found (which we do want)
      if (mapType) {
        /** @type {Map<any, any>} */ [...value].forEach((_, i) => {
          parents[i] = /**
          * @type {HTMLElement &
          *   {$addAndSetArrayElement: AddAndSetArrayElement}}
          */ (stateObj.rootUI);
        });
      }
      return;
    }

    // Todo (low): If could be async, use async encapsulate method
    // Todo (low): Handle `awaitingTypesonPromise` with place-holder
    // Todo (low): Handle `resolvingTypesonPromise` to replace place-holder
    setTimeout(() => {
      const ui = parents[parentPath];
      // These errors occur, e.g., if `replacing` not first added and then
      //   a converted object gets treated as the root UI (e.g., for `regexp`
      //   or `blobHTML` at root)
      // If there isn't a problem in Typeson with transmitting the `readonly`
      //   status recursively down the object (should be no need to check
      //   for circulars there?), could change Typeson to report `readonly`
      //   for the nested items, in which case, we could block out `readonly`
      //   instead of doing this here
      if (!ui || !('$addAndSetArrayElement' in ui)) {
        return;
      }

      // Skip the array structures immediately following the Map,
      //   as map needs to handle
      if (!mapType && mapPaths.some((mapPath) => {
        if (mapPath === keypath ||
          (mapPath === '' && (/^\d+$/u).test(keypath))) {
          return true;
        }
        const trailingIndex = keypath.match(/\.\d+$/u);
        return (trailingIndex && mapPath !== '' &&
          keypath.slice(0, -trailingIndex[0].length) === mapPath);
      })) {
        return;
      }

      // console.log('vvvv', newType, '::', newValue, '::', newValue?.cause);

      const root = ui.$addAndSetArrayElement({
        propName: arrayOrObjectPropertyName,
        type: newType,
        value: newValue,
        bringIntoFocus: false,
        schemaContent,
        schemaState: getPossibleSchemasForPathAndType
        /* schema:
          && getPossibleSchemasForPathAndType({
            keypath,
            parentPath,
            arrayOrObjectPropertyName,
            valueType: newType
          })
        */
      });

      /* istanbul ignore if -- Guard for `null` return */
      if (!root) {
        return;
      }

      if (!readonly) {
        types?.setValue({
          type: newType,
          // eslint-disable-next-line object-shorthand -- TS
          root: /** @type {HTMLDivElement} */ (root),
          value: newValue
        });
        types?.validate({
          type: newType,
          // eslint-disable-next-line object-shorthand -- TS
          root: /** @type {HTMLDivElement} */ (root),
          topRoot: /** @type {HTMLDivElement} */ (stateObj.rootUI)
        });
      }

      if (hasChildren) {
        parents[keypath] = /**
          * @type {HTMLElement &
          *   {$addAndSetArrayElement: AddAndSetArrayElement}}
          */ (
            root
          );

        // Since we're skipping the array elements, we need to add the
        //   map element to the array index where the array children
        //   will be found (which we do want)
        if (mapType) {
          /** @type {Map<any, any>} */ [...value].forEach((_, i) => {
            parents[`${keypath}.${i}`] = /**
            * @type {HTMLElement &
            *   {$addAndSetArrayElement: AddAndSetArrayElement}}
            */ (root);
          });
        }
      }
    });
  };
};

/**
 * @param {string[]} originTypes
 * @param {[originType: string, replacementType: string][]} replacements
 * @returns {void}
 */
const replaceTypes = (originTypes, replacements) => {
  replacements.forEach(([originType, replacementType]) => {
    originTypes.splice(originTypes.indexOf(originType), 1, replacementType);
  });
};

/**
 * @param {import('../types.js').default} types
 * @param {import('../formats.js').default} formats
 * @param {import('../formats.js').AvailableFormat} format
 * @param {string} state
 * @param {import('../types.js').AvailableType} valType
 * @param {import('../formats.js').StructuredCloneValue} v
 * @throws {Error}
 * @returns {import('../types.js').AvailableType}
 */
const canonicalToAvailableType = (
  types, formats, format, state, valType, v
) => {
  const frmt = formats.getAvailableFormat(format);
  const {getTypesAndSchemasForState, convertFromTypeson, testInvalid} = frmt;
  const allowableTypes = getTypesAndSchemasForState.call(
    frmt, types, state
  )?.types;
  /* istanbul ignore if -- Guard */
  if (!allowableTypes) {
    throw new Error('Unexpected undefined type for state');
  }

  /**
   * @type {import('../types.js').AvailableType|undefined}
   */
  let ret;
  // console.log('format, state, valType, v', format, state, valType, v);

  /**
   * @param {string} newValType
   * @throws {Error}
   * @returns {never}
   */
  const isInvalid = (newValType) => {
    console.log('newValType', newValType);
    const err = new Error('Invalid');
    /** @type {Error & {newValType: string}} */ (err).newValType = newValType;
    throw err;
  };
  if (convertFromTypeson) {
    const newValType = convertFromTypeson(valType);
    if (typeof newValType === 'string') {
      if (testInvalid && testInvalid(newValType, v)) {
        return isInvalid(newValType);
      }
      valType = newValType;
    }
  }

  // console.log('ret', ret);
  allowableTypes.some((allowableType) => {
    // eslint-disable-next-line @stylistic/max-len -- Long
    const typeObj = /** @type {import('../types.js').TypeObject & {childTypes: string[]}} */ (
      types.getTypeObject(allowableType)
    );
    const {
      valueMatch, superType, childTypes
    } = typeObj;
    if (
      (superType && valueMatch &&
        // Currently using for `true` and `false`
        superType === valType && valueMatch(v)) ||
      (childTypes && childTypes.includes(valType))
    ) {
      ret = allowableType;
      return true;
    }

    return false;
  });
  // console.log('ret2', ret);
  if (ret === undefined) {
    // We run this separately from the `childTypes` check above
    //    to ensure `childTypes` have priority regardless of position
    allowableTypes.some((allowableType) => {
      if (allowableType === valType) {
        ret = allowableType;
        return true;
      }
      return false;
    });
    if (ret === undefined) {
      return isInvalid(valType);
    }
  }
  return ret;
};

/**
 * @callback FormatIterator
 * @param {import('../formats.js').StructuredCloneValue} records
 * @param {import('../types.js').StateObject} stateObj
 * @returns {Promise<Element>}
 */

/** @type {import('../formats.js').Format} */
const structuredCloning = {
  iterate (records, stateObj) {
    // console.log('records', records);
    /* istanbul ignore if -- Just a guard */
    if (!stateObj.format) {
      stateObj.format = 'structuredCloning';
    }
    // Todo: Replace this with async typeson?
    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      const structuredCloningFixed = structuredCloningThrowing.filter(
        (typeSpecSet) => {
          return ![
            // Not yet supported within JSOE
            'imagedata',
            'imagebitmap',
            'cryptokey',
            'domquad'
          ].some((prop) => {
            return Object.hasOwn(typeSpecSet, prop);
          });
        }
      );
      structuredCloningFixed.splice(
        // Add after userObjects
        1,
        0,
        noneditable
      );
      const typeson = new Typeson({
        encapsulateObserver: encapsulateObserver(stateObj)
      }).register(structuredCloningFixed);
      typeson.encapsulate(records);
      // Todo (low): We might want to run async encapsulate for
      //   async types (and put this after Promise resolves)
      if (stateObj.error) {
        reject(stateObj.error);
      } else {
        resolve(/** @type {Required<import('../types.js').StateObject>} */ (
          stateObj
        ).rootUI);
      }
    });
  },
  getTypesAndSchemasForState (types, state) {
    if (state && types.getContextInfo('structuredCloning', state)) {
      const typesForFormat = this.getTypesAndSchemasForState(types)?.types ||
        /* istanbul ignore next -- types should be an array */
        [];
      const contextInfo = types.getContextInfo('structuredCloning', state);
      contextInfo.forEach(({type, after}) => {
        const precedingIdx = typesForFormat.indexOf(after);
        typesForFormat.splice(precedingIdx + 1, 0, type);
      });
      return {
        types: typesForFormat,
        schemaObjects: []
      };
    }
    // Todo: Could we implement schemas here by introducing new keys to
    //         `Types.contexts` which could be used rather than manual
    //         handling to determine a delimited group of children
    if (state === 'errorsArray') {
      return {
        types: ['error', 'errors'],
        schemaObjects: []
      };
    }
    if (state === 'filelistArray') {
      return {
        types: ['file'],
        schemaObjects: []
      };
    }
    return {
      types: this.types(),
      schemaObjects: []
    };
    /*
    // Todo (low): These need to specify their own inner contexts
    if (['map', 'set'].includes(state)) {return;}
    if ('int8array', 'uint8array', 'uint8clampedarray',
      'int16array', 'uint16array', 'int32array',
      'uint32array', 'float32array', 'float64array'
    ).includes(state)) {return;}
    */
  },
  types () {
    const jsonTypes = json.types();
    replaceTypes(jsonTypes, [
      [
        'array',
        // 'sparseArrays',
        'arrayNonindexKeys'
      ]
    ]);
    return [
      // This type is only for throwing upon cloning errors:
      // 'checkDataCloneException'
      // This type might be supported by evaluable JS or config passed in:
      // 'userObject'
      ...jsonTypes,
      'undef', // Explicit undefined only
      'bigint',
      'SpecialNumber', // '`NaN`, `Infinity`, `-Infinity`, `-0`
      'date',
      'regexp',
      'BooleanObject',
      'NumberObject',
      'StringObject',
      'error',
      'errors',
      'blob',
      'blobHTML',
      'file',
      'set',
      'map',
      'filelist',
      'domexception',
      'domrect',
      'dompoint',
      'dommatrix',
      'buffersource',
      'resurrectable'

      // Ok, but will need some work and/or decisions on how to present:
      // 'cryptokey',
      // 'domquad',
      // 'imagedata', 'imagebitmap',
    ];
  }
};

export default structuredCloning;
