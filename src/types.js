import Formats from './formats.js';

import {
  // jamilih
  jml,
  // typeson-registry
  Typeson, getJSONType, structuredCloningThrowing
} from './vendor-imports.js';

import {$e, $$e} from './utils/templateUtils.js';

import nullType from './fundamentalTypes/nullType.js';
import trueType from './subTypes/trueType.js';
import falseType from './subTypes/falseType.js';
import nanType from './fundamentalTypes/nanType.js';
import blobHTMLType from './subTypes/blobHTMLType.js';
import booleanType from './fundamentalTypes/booleanType.js';
import numberType from './fundamentalTypes/numberType.js';
import bigintType from './fundamentalTypes/bigintType.js';
import stringType from './fundamentalTypes/stringType.js';
import arrayReferenceType from './fundamentalTypes/arrayReferenceType.js';
import objectReferenceType from './fundamentalTypes/objectReferenceType.js';
import arrayType from './fundamentalTypes/arrayType.js';
import tupleType from './fundamentalTypes/tupleType.js';
import objectType from './fundamentalTypes/objectType.js';
import recordType from './fundamentalTypes/recordType.js';
import dateType from './fundamentalTypes/dateType.js';
import setType from './fundamentalTypes/setType.js';
import mapType from './fundamentalTypes/mapType.js';
import undefinedType from './fundamentalTypes/undefinedType.js';
import voidType from './fundamentalTypes/voidType.js';
import regexpType from './fundamentalTypes/regexpType.js';
import BooleanObjectType from './fundamentalTypes/BooleanObjectType.js';
import NumberObjectType from './fundamentalTypes/NumberObjectType.js';
import StringObjectType from './fundamentalTypes/StringObjectType.js';
// import sparseUndefinedType from './fundamentalTypes/sparseUndefinedType.js';
import SpecialRealNumberSuperType from
  './superTypes/SpecialRealNumberType.js';
import SpecialNumberSuperType from './superTypes/SpecialNumberType.js';
import errorType from './fundamentalTypes/errorType.js';
import errorsSpecialType from './superTypes/errorsSpecialType.js';
import fileType from './fundamentalTypes/fileType.js';
import filelistType from './fundamentalTypes/filelistType.js';
import blobType from './fundamentalTypes/blobType.js';
import domexceptionType from './fundamentalTypes/domexceptionType.js';
import domrectType from './superTypes/domrectType.js';
import dompointType from './superTypes/dompointType.js';
import dommatrixType from './superTypes/dommatrixType.js';
import buffersourceType from './superTypes/buffersourceType.js';
import noneditableType from './fundamentalTypes/noneditableType.js';

/**
 * Utility to retrieve the property value given a legend element.
 * @param {HTMLLegendElement} legend
 * @returns {string}
 */
export const getPropertyValueFromLegend = (legend) => {
  const propElem = $e(legend, '*[data-prop="true"]');
  if (!propElem) {
    throw new Error(
      'No property on the supplied legend element'
    );
  }
  if (propElem.nodeName.toLowerCase() === 'input') {
    return /** @type {HTMLInputElement} */ (propElem).value;
  }
  if (!propElem.textContent) {
    throw new Error(
      'No property with text present on the supplied legend element'
    );
  }
  // 1-based to 0-based
  return String(Number.parseInt(propElem.textContent) - 1);
};

/**
 * Any other possibilities than `div`?
 * @typedef {HTMLDivElement} RootElement
 */

/**
 * Utility to retrieve the type out of a type root element.
 * @callback GetTypeForRoot
 * @param {?RootElement} root
 * @returns {string} Why would it not exist?
 */

/**
 * Utility to get the value out of a type root element with a given
 *   state and path.
 * @callback GetValueForRoot
 * @param {RootElement} root
 * @param {StateObject} [stateObj]
 * @param {string} [currentPath]
 * @returns {StructuredCloneValue}
 */

/**
 * Utility to get the form control (e.g., input element) for a root.
 * @callback GetFormControlForRoot
 * @param {RootElement} root
 * @returns {null|
 *   HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|HTMLButtonElement}
 */

/**
 * Utility to get the value for a root using its ancestor and state.
 * @callback GetValueFromRootAncestor
 * @param {string|HTMLElement} selOrEl
 * @param {StateObject} [stateObj]
 * @returns {StructuredCloneValue}
 */

/**
 * @callback GetFormControlFromRootAncestor
 * @param {string|HTMLElement} selOrEl
 * @returns {null|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|
 *   HTMLButtonElement}
 */

/**
 * @callback GetOptionForType
 * @param {AvailableType} type
 * @returns {[string, {value: AvailableType, title?: string}]}
 */

/**
 * @callback GetTypeOptionsForFormatAndState
 * @param {import('./formats.js').AvailableFormat} format
 * @param {string} [parserState]
 * @param {import('./formatAndTypeChoices.js').ZodexSchema|
 *   undefined} [schemaContent]
 * @returns {[string, {value: AvailableType, title?: string}][]}
 */

/**
 * @typedef {(
*   keypath: string,
*   parentPath: string,
*   arrayOrObjectPropertyName: string,
*   valueType: string
* ) => StateObject} GetPossibleSchemasForPathAndType
*/

/**
* @typedef {{
*   typeNamespace?: string,
*   "readonly"?: boolean,
*   format?: import('./formats.js').AvailableFormat,
*   formats?: import('./formats.js').default,
*   types?: Types,
*   error?: Error,
*   rootUI?: Element,
*   schema?: string,
*   schemaContent?: object,
*   getPossibleSchemasForPathAndType?: GetPossibleSchemasForPathAndType,
*   paths?: {[currentPath: string]: {
*     referentPath: string,
*     expectArrayReferent: boolean
*   }},
*   handlingReference?: boolean
* }} StateObject
*/

/* eslint-disable jsdoc/valid-types -- readonly reserved */
/**
 * @typedef {(cfg: {
 *   readonly?: boolean,
 *   resultType?: "both"|"keys"|"values",
 *   typeNamespace?: string,
 *   type: AvailableType,
 *   topRoot?: RootElement,
 *   bringIntoFocus?: boolean|undefined,
 *   buildTypeChoices?: import('./typeChoices.js').BuildTypeChoices,
 *   format: import('./formats.js').AvailableFormat,
 *   schemaContent?: object
 *   schemaState?: GetPossibleSchemasForPathAndType,
 *   value: StructuredCloneValue,
 *   hasValue: boolean,
 *   replaced?: StructuredCloneValue,
 * }) => HTMLElement} GetUIForModeAndType
 */
/* eslint-enable jsdoc/valid-types -- readonly reserved */

/**
 * @typedef {(cfg: {
 *   form: HTMLFormElement,
 *   typeNamespace?: string,
 *   keySelectClass?: string,
 * }) => boolean} ValidValuesSet
 */

/**
 * @typedef {(cfg: {
 *   topRoot: RootElement
 * }) => void} ValidateAllReferences
 */

/**
 * @typedef {(cfg: {
 *   type: AvailableType,
 *   root: RootElement,
 *   topRoot?: RootElement
 * }) => boolean} Validate
 */

/**
 * @typedef {(cfg: {
 *   type: AvailableType,
 *   root: RootElement,
 *   value: StructuredCloneValue,
 * }) => void} SetValue
 */

/**
 * @typedef {(s: string, cfg: {
 *   format: import('./formats.js').AvailableFormat,
 *   state?: string,
 *   endMatchTypeObjs?: TypeObject[]
 *   firstRun?: boolean,
 *   rootHolder?: [
 *     type: string,
 *     parent: {[key: string]: any}|undefined,
 *     parentPath: string|number|undefined,
 *     path: string
 *   ][],
 *   parent?: {[key: string]: any},
 *   parentPath?: string|number,
 *   schemaObject?: import('./formatAndTypeChoices.js').ZodexSchema|undefined
 * }) => [
*   value: StructuredCloneValue,
*   remnant: string,
*   beginOnly: boolean,
*   assign: boolean
* ]} GetValueForString
*/

/**
 * @typedef {(
 *   info: {topRoot: HTMLDivElement}
 * ) => void} CustomValidateAllReferences
 */

/**
 * @typedef {import('./formats.js').StructuredCloneValue} StructuredCloneValue
 */

/**
 * @typedef {import('jamilih').JamilihArray} JamilihArray
 */

/**
 * @typedef {{
 *   format: import('./formats.js').AvailableFormat,
 *   match: boolean|RegExpMatchArray|null
 *   endMatchTypeObjs: TypeObject[],
 *   remnant: string,
 *   rootHolder: [
 *     type: string,
 *     parent: object|undefined,
 *     parentPath: string|number|undefined,
 *     path: string
 *   ][],
 *   parent?: object,
 *   parentPath?: string|number,
 *   types?: Types
 *   schemaObject?: import('./formatAndTypeChoices.js').ZodexSchema|undefined
 * }} RootInfo
 */

/**
 * @typedef {(
 *   info: {
*     root: HTMLDivElement,
*     value: StructuredCloneValue
*   }
* ) => void} TypeObjectSetValue
 */

/**
 * @typedef {(
 *   s: string, info?: RootInfo
 * ) => {
 *   value?: StructuredCloneValue,
 *   remnant?: string,
 *   assign?: false
 * }} ToValue
 */

/**
 * @typedef {object} TypeObject
 * @property {[
 *   string, {value?: AvailableType, title?: string}?
 * ]} option Creates the option HTML. May set an option `title` or `value`
 * @property {boolean} [array] Private context variable. Whether or not
 *   it is an array. Do not use in other types.
 * @property {boolean} [map] Private context variable. Whether or not
 *   it is a `Map`. Do not use in other types.
 * @property {boolean} [set] Private context variable. Whether or not
 *   it is a `Set`. Do not use in other types.
 * @property {boolean} [record] Private context variable. Whether or not
 *   it is a `Record`. Do not use in other types.
 * @property {boolean} [tuple] Private context variable. Whether or not
 *   it is a tuple type. Do not use in other types.
 * @property {boolean} [filelist] Private context variable. Whether or not
 *   it is a `FileList` type. Do not use in other types.
 * @property {boolean} [sparse] Private context variable. Whether or not
 *   it is a sparse array. Do not use in other types.
 * @property {boolean} [valid] Private context variable. Whether or not
 *   it is a valid date. Do not use in other types.
 * @property {string[]} [regexEndings] Used for string parsing.
 * @property {RegExp|((nonGrouping?: boolean) => RegExp)} [stringRegex] Used
 *   for string parsing. If not present, use `stringRegexBegin` and
 *   `stringRegexEnd`.
 * @property {RegExp} [stringRegexBegin] Used for string parsing. If not
 *   present, use `stringRegex`
 * @property {RegExp} [stringRegexEnd] Used for string parsing. If not
 *   present, use `stringRegex`
 * @property {(v: StructuredCloneValue) => boolean} [valueMatch] Function to
 *   check whether this subtype matches
 * @property {string} [superType] The greater fundamental type to which
 *   the type belongs
 * @property {ToValue} [toValue] Converts from string to value. May use
 *   `stringRegex` to find components.
 * @property {(info: {
 *   root: HTMLDivElement,
 *   stateObj?: StateObject,
 *   currentPath?: string
 * }) =>
 *  StructuredCloneValue
 * } getValue Gets the value for the type
 * @property {TypeObjectSetValue} [setValue] Should set the value of the
 *   form's `getInput` element
 * @property {(info: {
 *   value?: StructuredCloneValue,
 *   typeNamespace?: string,
 *   type?: AvailableType,
 *   topRoot?: HTMLDivElement,
 *   resultType?: "keys"|"values"|"both",
 *   format: import('./formats.js').AvailableFormat,
 *   types: Types
 * }) => JamilihArray} viewUI
 * @property {(info: {
 *   value?: StructuredCloneValue,
 *   typeNamespace?: string,
 *   bringIntoFocus?: boolean,
 *   format?: import('./formats.js').AvailableFormat,
 *   formats?: import('./formats.js').default,
 *   types: Types,
 *   resultType?: "keys"|"values"|"both",
 *   type?: AvailableType,
 *   arrayState?: string,
 *   buildTypeChoices?: import('./typeChoices.js').BuildTypeChoices,
 *   topRoot?: HTMLDivElement
 * }) => JamilihArray} editUI
 * @property {(info: {root: HTMLDivElement}) =>
 *   HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|
 *   HTMLButtonElement} getInput Gets the form control (with `value`)
 * @property {(
 *   info: {root: HTMLDivElement}
 * ) => HTMLSelectElement} [getSelect]
 * @property {(path: string, value: StructuredCloneValue) =>
 *   StructuredCloneValue} [resolveReference] Gets the reference. For array
 *   and object references types only
 * @property {(info: {root: HTMLDivElement, topRoot?: HTMLDivElement}) => {
 *   message?: string,
 *   valid: boolean
 * }} [validate] Message will be used if validity is false.
 * @property {(info: {
 *   topRoot: HTMLDivElement,
 *   types: Types
 * }) => void} [validateAll] For
 *   validation of array and object references only.
 * @property {{
 *   structuredCloning: {
 *     after: AvailableType,
 *     contexts: string[]
 *   }
 * }} [stateDependent] The type after which it should be placed and its
 *   context types
 */

/**
 * @typedef {"null"|"true"|"false"|"number"|"bigint"|"string"|"arrayReference"|
 *   "objectReference"|"array"|"object"|"date"|"userObject"|"undef"|
 *   "SpecialRealNumber"|"SpecialNumber"|"regexp"|"BooleanObject"|
 *   "NumberObject"|"StringObject"|"map"|"set"|"file"|"filelist"|"blobHTML"|
 *   "buffersource"|"dataview"|"imagedata"|"imagebitmap"|
 *   "int8array"|"uint8array"|"uint8clampedarray"|"int16array"|"uint16array"|
 *   "int32array"|"uint32array"|"float32array"|"float64array"|"ValidDate"|
 *   "arrayNonindexKeys"|"error"|"errors"|"blob"|"domexception"|"domrect"|
 *   "dompoint"|"dommatrix"|"resurrectable"|"boolean"|"nan"|"tuple"|
 *   "record"|"void"} AvailableType
 */

/**
 * @typedef {TypeObject & {
*   childTypes: string[]
* }} SuperTypeObject
*/

/**
 *
 */
class Types {
  /**
   *
   */
  constructor () {
    this.formats = new Formats(); // Todo: Make customizable and test

    /** @type {CustomValidateAllReferences|undefined} */
    this.customValidateAllReferences = undefined;
    /**
     * @type {{
     *   [key in AvailableType]: Partial<TypeObject>|string[]
     * }}
     */
    this.availableTypes = {
      null: nullType,
      true: trueType,
      false: falseType,
      nan: nanType, // Schema type
      boolean: booleanType, // Schema type
      number: numberType,
      bigint: bigintType,
      string: stringType,
      arrayReference: arrayReferenceType,
      objectReference: objectReferenceType,
      array: arrayType,
      tuple: tupleType, // Schema type
      // Note: We don't do for BooleanObject/NumberObject/StringObject, date,
      //   regexp, as added properties on them are not being cloned (in Chrome
      //   at least)
      object: objectType,
      record: recordType, // Schema type
      date: dateType,

      // This type is only for throwing upon cloning errors:
      // 'checkDataCloneException'
      // This type might be supported by evaluable JS or config
      //   passed in:
      userObject: ['User objects'],
      undef: undefinedType,
      void: voidType,
      SpecialRealNumber: SpecialRealNumberSuperType,
      SpecialNumber: SpecialNumberSuperType,

      error: errorType,
      errors: errorsSpecialType,

      regexp: regexpType,
      BooleanObject: BooleanObjectType,
      NumberObject: NumberObjectType,
      StringObject: StringObjectType,

      map: mapType,
      set: setType,

      file: fileType,
      filelist: filelistType,
      blob: blobType,
      blobHTML: blobHTMLType,

      domexception: domexceptionType,
      domrect: domrectType,
      dompoint: dompointType,
      dommatrix: dommatrixType,

      resurrectable: noneditableType,

      buffersource: buffersourceType,
      dataview: {
        option: ['DataView']
      },
      imagedata: {
        option: ['ImageData']
      },
      imagebitmap: {
        option: ['ImageBitmap']
      },

      // Typed Arrays
      int8array: {
        option: ['Int8Array']
      },
      uint8array: {
        option: ['Uint8Array']
      },
      uint8clampedarray: {
        option: ['Uint8ClampedArray']
      },
      int16array: {
        option: ['Int16Array']
      },
      uint16array: {
        option: ['Uint16Array']
      },
      int32array: {
        option: ['Int32Array']
      },
      uint32array: {
        option: ['Uint32Array']
      },
      float32array: {
        option: ['Float32Array']
      },
      float64array: {
        option: ['Float64Array']
      },

      // We're catching this instead of using this
      // sparseUndefined: sparseUndefinedType,

      ValidDate: {
        valid: true
      },
      /*
      sparseArrays: {
          sparse: true
      },
      */
      arrayNonindexKeys: {
        sparse: true
      }
    };

    /**
     * @param {[
     *   copyFrom: AvailableType, copyTo: AvailableType
     * ][]} replacements
     * @returns {void}
     */
    const copyTypeObjs = (replacements) => {
      replacements.forEach(([copyFrom, copyTo]) => {
        Object.assign(this.availableTypes[
          /** @type {AvailableType} */
          (copyTo)
        ], this.availableTypes[
          /** @type {AvailableType} */
          (copyFrom)
        ]);
      });
    };

    copyTypeObjs(
      [
        /** @type {[AvailableType, AvailableType]} */ (
          ['date', 'ValidDate']
        ),
        // 'sparseArrays'
        /** @type {[AvailableType, AvailableType]} */ (
          ['array', 'arrayNonindexKeys']
        )
      ]
    );

    /**
     * @type {{
     *   [key: string]: {
     *     [key: string]: {type: AvailableType, after: AvailableType}[]
     *   }
     * }}
     */
    this.contexts = {};
    Object.entries(this.availableTypes).forEach(([typ, typeObj]) => {
      const type = /** @type {AvailableType} */ (typ);
      const {stateDependent} = /** @type {TypeObject} */ (typeObj);
      if (stateDependent) {
        Object.entries(stateDependent).forEach(([
          format, formatStateDependent
        ]) => {
          if (!this.contexts[format]) {
            this.contexts[format] = {};
          }
          const {contexts, after} = formatStateDependent;
          contexts.forEach((context) => {
            if (!this.contexts[format][context]) {
              this.contexts[format][context] = [];
            }
            this.contexts[format][context].push({type, after});
          });
        });
      }
    });
  }

  /**
   * @param {import('./formats.js').AvailableFormat} format
   * @param {StructuredCloneValue} record
   * @param {StateObject} stateObj
   * @returns {Promise<Element>}
   */
  async getControlsForFormatAndValue (
    format, record, stateObj
  ) {
    return await this.formats.getControlsForFormatAndValue(
      this, format, record, stateObj
    );
  }

  /**
   * @param {import('./formats.js').AvailableFormat} format
   * @param {string} context
   * @returns {{
   *   type: AvailableType
   *   after: AvailableType
   * }[]}
   */
  getContextInfo (format, context) {
    return this.contexts[format][context];
  }

  /** @type {GetValueForRoot} */
  getValueForRoot (root, stateObj, currentPath) {
    const typeObject = /** @type {TypeObject} */ (
      this.availableTypes[
        /** @type {AvailableType} */
        (Types.getTypeForRoot(root))
      ]
    );
    // Ensure `stateObj` remains a reference if present
    return typeObject.getValue({
      root,
      /* istanbul ignore next -- Guard */
      stateObj: stateObj ?? {
        types: this
      },
      currentPath
    });
  }

  /** @type {GetFormControlForRoot} */
  getFormControlForRoot (root) {
    const typeObj = /** @type {TypeObject} */ (this.availableTypes[
      /** @type {AvailableType} */
      (Types.getTypeForRoot(root))
    ]);
    /* istanbul ignore if -- All have except aliases */
    if (!typeObj.getInput) {
      return null;
    }
    return typeObj.getInput({root});
  }

  /** @type {GetValueFromRootAncestor} */
  getValueFromRootAncestor (selOrEl, stateObj) {
    return this.getValueForRoot(
      /** @type {RootElement} */
      ($e(selOrEl, 'div[data-type]')),
      {
        ...stateObj,
        types: this,
        formats: this.formats
      }
    );
  }

  /** @type {GetFormControlFromRootAncestor} */
  getFormControlFromRootAncestor (selOrEl) {
    const root = /** @type {RootElement} */ ($e(selOrEl, 'div[data-type]'));
    if (!root) {
      return null;
    }
    return this.getFormControlForRoot(root);
  }

  /** @type {GetOptionForType} */
  getOptionForType (type) {
    const availableType = /** @type {TypeObject} */ (
      this.availableTypes[type]
    );
    /** @type {[string, {value?: AvailableType, title?: string}?]} */
    const optInfo = [
      ...availableType.option
    ];
    optInfo[1] = {value: type, ...(optInfo[1])};
    return /** @type {[string, {value: AvailableType, title?: string}]} */ (
      optInfo
    );
  }

  /** @type {GetTypeOptionsForFormatAndState} */
  getTypeOptionsForFormatAndState (format, parserState, schemaContent) {
    const typesForFormatAndState =
      this.formats.getTypesAndSchemasForFormatAndState(
        this, format, parserState, schemaContent
      );
    if (!typesForFormatAndState) {
      throw new Error('Unexpected type for format and state');
    }

    return typesForFormatAndState.types.map((type) => {
      return this.getOptionForType(type);
    });
  }

  /** @type {GetUIForModeAndType} */
  getUIForModeAndType ({
    readonly, resultType, typeNamespace, type, topRoot, bringIntoFocus,
    buildTypeChoices, format, schemaContent, schemaState, value, hasValue,
    replaced
  }) {
    const typeObj = /** @type {TypeObject} */ (this.availableTypes[type]);
    const arg = hasValue
      ? {
        typeNamespace, type, buildTypeChoices,
        format, schemaContent, schemaState,
        resultType, topRoot, bringIntoFocus, value,
        replaced,
        types: this
      }
      : {
        typeNamespace, type, buildTypeChoices,
        format, schemaContent, schemaState,
        resultType, topRoot, bringIntoFocus,
        replaced,
        types: this
      };
    const root = /** @type {HTMLDivElement} */ (jml(
      ...(readonly
        ? typeObj.viewUI(arg)
        : typeObj.editUI(arg))
    ));
    if (!readonly && typeObj.validate) {
      const formControl = typeObj.getInput({root});
      formControl.addEventListener('input', () => {
        this.validate({type, root, topRoot});
      });
    }
    return root;
  }

  /** @type {ValidateAllReferences} */
  validateAllReferences ({topRoot}) {
    /* istanbul ignore if -- Unreachable? */
    if (!topRoot) {
      console.log('No references present');
      return;
    }

    // Could just hard-code arrayReference and objectReference,
    //  but we'll try to avoid depending on specific types
    Object.values(this.availableTypes).forEach((typeObj) => {
      const typeObject = /** @type {TypeObject} */ (typeObj);
      if (typeObject.validateAll) {
        typeObject.validateAll({topRoot, types: this});
      }
    });

    if (this.customValidateAllReferences) {
      this.customValidateAllReferences({topRoot});
    }
  }

  /** @type {Validate} */
  validate ({type, root, topRoot}) {
    const typeObj = /** @type {TypeObject} */ (this.availableTypes[type]);
    // Todo (low): We limit for now to input boxes which have `validate`
    if (typeObj.validate) {
      const {valid, message} = typeObj.validate({root, topRoot});
      const formControl = typeObj.getInput({root});
      formControl.setCustomValidity(
        valid
          ? ''
          /* istanbul ignore next -- Should always have a message */
          : message || 'Invalid'
      );
      formControl.reportValidity();
      return valid;
    }
    return true;
  }

  /** @type {SetValue} */
  setValue ({type, root, value}) {
    const typeObj = /** @type {TypeObject} */ (this.availableTypes[type]);
    if (typeObj.setValue) {
      typeObj.setValue({root, value});
    }
  }

  // Todo (low): Should really add real parser
  // Todo (low): Implement `getStringForValue` (e.g., to expose feature for
  //          bookmarking object value currently in view); would not be
  //          enough to iterate DOM to get string URL as we'd also like
  //          the ability to have arbitrary JSON/structuredCloning sent to this
  //          URL from other sites/programs (can currently pass in JSON
  //          format to the URL, but that is still expecting our Router
  //          string syntax)

  /** @type {GetValueForString} */
  getValueForString (s, {
    format, state, endMatchTypeObjs = [], firstRun = true,
    rootHolder = [], parent, parentPath, schemaObject
  }) {
    const allowedTypes = this.formats.getTypesAndSchemasForFormatAndState(
      this, format, state, schemaObject
    )?.types;
    if (!allowedTypes) {
      throw new Error('Could not get types for format and state');
    }
    const allowedTypeObjs = Object.entries(
      this.availableTypes
    ).filter(([type]) => {
      return allowedTypes.includes(/** @type {AvailableType} */ (type));
    });
    const allowedTypeObjsVals = allowedTypeObjs.map(([, arr]) => arr);

    const reduced = allowedTypeObjsVals.reduce((array, typObj) => {
      const typeObj = /** @type {TypeObject} */ (typObj);
      let arr = /** @type {string[]} */ (array);
      if (typeObj.regexEndings) {
        arr.push(...typeObj.regexEndings);
        arr = [...new Set(arr)];
      }
      return arr;
    }, []);
    const endings = '|' + /** @type {string[]} */ (
      reduced
    ).map((str) => escapeRegex(str)).join('|');

    /**
     * @type {RegExpMatchArray|boolean|null}
     */
    let match = null;
    let found = allowedTypeObjs.find(([/* _type */, typObj]) => {
      const typeObj = /** @type {TypeObject} */ (typObj);
      let {stringRegex} = typeObj;
      if (typeof typeObj.stringRegex === 'function') {
        stringRegex = typeObj.stringRegex(true);
      }
      stringRegex = stringRegex
        // Strip off terminal (dollar sign) when matching substrings
        ? new RegExp(
          /** @type {RegExp} */ (
            stringRegex
          ).source.slice(0, -1) + '(?=$' + endings + ')',
          'u'
        )
        : stringRegex;
      match = Boolean(stringRegex && s) && s.match(
        /** @type {RegExp} */ (stringRegex)
      );
      return match;
    });

    let beginOnly = false;
    if (found === undefined) {
      found = allowedTypeObjs.find(([/* _type */, typObj]) => {
        const typeObj = /** @type {TypeObject} */ (typObj);
        const {stringRegexBegin} = typeObj;
        match = Boolean(stringRegexBegin && s) && s.match(
          /** @type {RegExp} */ (stringRegexBegin)
        );
        if (match) {
          beginOnly = true;
          endMatchTypeObjs.push(typeObj);
        }
        return match;
      });
    }
    let assign = true;
    if (found !== undefined) {
      // The `found` is evaluated again, so sets `match` to non-null
      const mtch = /** @type {RegExpMatchArray} */ (
        /** @type {unknown} */ (match)
      );
      const [content, innerContent] = mtch;
      let remnant = s.slice(content.length);
      s = s.slice(0, content.length);
      // console.log('s0', s, '::', remnant, match);
      let valObj;
      try {
        const typeObj = /** @type {TypeObject} */ (found[1]);
        /* istanbul ignore if -- TS guard */
        if (!typeObj.toValue) {
          throw new Error('Type has no `toValue` method');
        }
        valObj = typeObj.toValue(
          mtch.groups?.innerContent || innerContent || s, {
            types: this,
            format,
            match,
            endMatchTypeObjs,
            remnant,
            rootHolder,
            parent,
            parentPath,
            schemaObject
          }
        );
      /* istanbul ignore next -- Good regexes should prevent */
      } catch (e) {
        /* istanbul ignore next -- Good regexes should prevent */
        console.log('eee', e);
        /* istanbul ignore next -- Good regexes should prevent */
        throw e;
      }
      if (valObj.assign === false) {
        assign = false;
      }
      const {value} = valObj;
      if (valObj.remnant !== undefined) {
        ({remnant} = valObj);
      }

      if (beginOnly && endMatchTypeObjs.length) {
        const endMatch = remnant.match(
          /** @type {RegExp} */ (/** @type {TypeObject} */ (
            endMatchTypeObjs.at(-1)
          ).stringRegexEnd)
        );
        if (endMatch) {
          endMatchTypeObjs.pop(); // Safe now to extract
          remnant = remnant.slice(endMatch[0].length);
        }
      }
      if (firstRun) {
        const typeson = new Typeson().register(
          structuredCloningThrowing
        );
        try {
          const topRoot = typeson.revive(value);
          rootHolder.forEach(([type, parent, parentPath, path]) => {
            const typeObject = this.availableTypes[
              /** @type {AvailableType} */ (type + 'Reference')
            ];

            // @ts-expect-error Reference method exists
            const val = typeObject.resolveReference(path, topRoot);
            const basicType = getJSONType(val);
            // eslint-disable-next-line @stylistic/max-len -- Long
            /* istanbul ignore else -- Successful reference always an object/array? */
            if (
              ['array', 'object'].includes(type) && basicType === type
            ) {
              /** @type {{[key: string]: any}} */ (
                parent
              )[/** @type {string|number} */ (parentPath)] = val;
            }
          });
          return [topRoot, remnant, beginOnly, assign];
        } catch (err) {
          console.log('failed Typeson revival', err);
        }
      }
      return [value, remnant, beginOnly, assign];
    }
    throw new Error('Bad parsing data');
  }

  /**
   * @param {AvailableType} type
   * @returns {Partial<TypeObject>|string[]}
   */
  getTypeObject (type) {
    return this.availableTypes[type];
  }
}

/** @type {GetTypeForRoot} */
Types.getTypeForRoot = (root) => {
  return String(root ? root.dataset.type : root);
};

/** @type {ValidValuesSet} */
Types.validValuesSet = ({form, typeNamespace, keySelectClass}) => {
  // If form is hidden, don't list errors by default
  if (!form.offsetParent ||
        // Not an invalid form (bad key or value)
        // May be redundant as re-validating below
        !form.checkValidity()
  ) {
    return false;
  }

  const typeChoices =
    /** @type {(HTMLSelectElement & {$validate: () => boolean})[]} */ (
      $$e(
        form,
        keySelectClass ? `.${keySelectClass}` : `.typeChoices-${typeNamespace}`
      )
    );
  return (
    // Specific value type set if present (any descendant, not
    //   only the first) chosen
    typeChoices.every((sel) => {
      // console.log('sel', sel.value !== '' && sel.$validate());
      // Hidden are ok
      return !sel.offsetParent ||
        // If present, must be valid
        (sel.value !== '' && sel.$validate());
    })
  // Container of a specific type added (should always be present
  //   if typeChoices non-empty)
  // $e(form, '.typeContainer')
  );
};

/**
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegex (str) {
  return String(str).
    replaceAll(/[.\\+*?^[\]$(){}=!<>|:-]/gu, '\\$&');
}

export default Types;
