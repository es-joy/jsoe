import indexedDBKey from './formats/indexedDBKey.js';
import json from './formats/json.js';
import structuredCloning from './formats/structuredCloning.js';
import arbitraryJS from './formats/arbitraryJS.js';
import schema from './formats/schema.js';

/**
 * An arbitrary Structured Clone, JSON, etc. value.
 * @typedef {any} StructuredCloneValue
 */

/**
 * @callback GetTypesAndSchemasForFormatAndState
 * @param {import('./types.js').default} types
 * @param {AvailableFormat} format
 * @param {string} [state]
 * @param {import('./formatAndTypeChoices.js').ZodexSchema|
 *   undefined} [schemaObject]
 * @param {import('./formatAndTypeChoices.js').ZodexSchema|
 *   undefined} [schemaOriginal]
 * @returns {TypesAndSchemaObjects|undefined}
 */

/* schema:
export const getTypeForFormatStateAndValue = ({format, state, value}) => {
  const valType = new Typeson().register(
    structuredCloningForStorage
  ).rootTypeName(value);
  return canonicalToAvailableType(format, state, valType, value);
};
*/

/**
 * @typedef {"indexedDBKey"|"json"|"structuredCloning"
 *   |"arbitraryJS"|"schema"} AvailableFormat
 */

/**
 * @typedef {{
 *   types: (import('./types.js').AvailableArbitraryType)[],
 *   schemaObjects: import('./formats/schema.js').ZodexSchema[]
 * }} TypesAndSchemaObjects
 */

/**
 * Responsible for traversing over data (along with state information) to build
 *   and return a relevant UI element.
 * @callback FormatIterator
 * @param {StructuredCloneValue} records
 * @param {import('./types.js').StateObject} stateObj
 * @returns {Promise<Required<import('./types.js').StateObject>>}
 */

/**
 * @typedef {object} Format
 * @property {() => (
 *   import('./types.js').AvailableArbitraryType
 * )[]} types Returns list
 *   of types generally available to structured cloning. See
 *   {@link getTypesAndSchemasForState} for context-dependent method.
 * @property {FormatIterator} iterate Traverses over data to build and return
 *   a relevant UI element.
 * @property {(
 *   types: import('./types.js').default,
 *   state?: string,
 *   schemaObject?: import('./formatAndTypeChoices.js').ZodexSchema|
 *     undefined,
 *   schemaOriginal?: import('./formatAndTypeChoices.js').ZodexSchema|
 *     undefined
 * ) => TypesAndSchemaObjects|undefined} getTypesAndSchemasForState Gets the
 *   specific types (and schemas) relevant to a given state.
 * @property {(
 *     newType: string, value: Date|Array<StructuredCloneValue>
 *   ) => boolean|undefined} [testInvalid]
 * @property {(
 *   typesonType: import('./types.js').AvailableArbitraryType,
 *   types: import('./types.js').default,
 *   v?: import('./formats.js').StructuredCloneValue,
 *   arrayOrObjectPropertyName?: string,
 *   parentSchema?: [
 *     import('zodexy').SzType,
 *     number|undefined
 *   ]|undefined,
 *   stateObj?: import('./types.js').StateObject,
 * ) => {
 *   type: import('./types.js').AvailableArbitraryType|undefined
 *   schema?: import('zodexy').SzType|undefined,
 *   mustBeOptional?: boolean,
 *   schemaIdx?: number
 * }} [convertFromTypeson]
 * @property {(
 *   types: import('./types.js').default,
 *   schemaObject: import('./formatAndTypeChoices.js').ZodexSchema,
 *   value: StructuredCloneValue
 * ) => {valid: boolean, message?: string,
 *   schema?: import('./formats/schema.js').ZodexSchema}} [validateValue]
 * @property {(
 *   schemaObject: import('./formats/schema.js').ZodexSchema
 * ) => boolean} [isValueValidationRequired]
 */

/**
 * Class for processing multiple formats.
 */
class Formats {
  /**
   *
   */
  constructor () {
    // Can enable later (and add tests)
    // if (formats) {
    //   this.availableFormats = {};
    //   formats.forEach((format) => {
    //     let formatValue;
    //     switch (format) {
    //     case 'indexedDBKey':
    //       formatValue = indexedDBKey;
    //       break;
    //     case 'json':
    //       formatValue = json;
    //       break;
    //     case 'structuredCloning':
    //       formatValue = structuredCloning;
    //       break;
    //     case 'arbitraryJS':
    //       formatValue = arbitraryJS;
    //       break;
    //     default:
    //       throw new Error('Unknown format');
    //     }
    //     this.availableFormats[format] = formatValue;
    //   });
    //   return;
    // }
    // Using methods ensure we have fresh copies
    this.availableFormats = /** @type {{[key: string]: Format}} */ ({
      indexedDBKey,
      json,
      structuredCloning,
      arbitraryJS,
      schema
    });
  }

  /**
   * @param {import('./types.js').default} types
   * @param {AvailableFormat} format
   * @param {StructuredCloneValue} record
   * @param {import('./types.js').StateObject} stateObj
   * @returns {Promise<Required<import('./types.js').StateObject>>}
   */
  async getControlsForFormatAndValue (types, format, record, stateObj) {
    return await this.availableFormats[format].
      iterate(record, {
        ...stateObj,
        types,
        formats: this,
        // This had been before `stateObj` but should apparently have precedence
        //   or just avoid passing `format` to this function
        format
      });
  }

  /**
   * @type {GetTypesAndSchemasForFormatAndState}
   */
  getTypesAndSchemasForFormatAndState (
    types, format, state, schemaObject, schemaOriginal
  ) {
    return this.availableFormats[format].getTypesAndSchemasForState(
      types, state, schemaObject, schemaOriginal
    );
  }

  /**
   * @param {AvailableFormat} format
   * @returns {Format}
   */
  getAvailableFormat (format) {
    return this.availableFormats[format];
  }
}

export default Formats;
