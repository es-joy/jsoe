function cov_1u5uhk019l(){var path="/Users/brett/jsoe/src/formats.js";var hash="74115d89f069c1be082e39a52d04f7a51a6e9a99";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"/Users/brett/jsoe/src/formats.js",statementMap:{"0":{start:{line:136,column:4},end:{line:142,column:7}},"1":{start:{line:153,column:4},end:{line:161,column:9}},"2":{start:{line:170,column:4},end:{line:172,column:6}},"3":{start:{line:180,column:4},end:{line:180,column:41}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:109,column:2},end:{line:109,column:3}},loc:{start:{line:109,column:17},end:{line:143,column:3}},line:109},"1":{name:"(anonymous_1)",decl:{start:{line:152,column:2},end:{line:152,column:3}},loc:{start:{line:152,column:71},end:{line:162,column:3}},line:152},"2":{name:"(anonymous_2)",decl:{start:{line:167,column:2},end:{line:167,column:3}},loc:{start:{line:169,column:4},end:{line:173,column:3}},line:169},"3":{name:"(anonymous_3)",decl:{start:{line:179,column:2},end:{line:179,column:3}},loc:{start:{line:179,column:30},end:{line:181,column:3}},line:179}},branchMap:{},s:{"0":0,"1":0,"2":0,"3":0},f:{"0":0,"1":0,"2":0,"3":0},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"74115d89f069c1be082e39a52d04f7a51a6e9a99"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_1u5uhk019l=function(){return actualCoverage;};}return actualCoverage;}cov_1u5uhk019l();import indexedDBKey from'./formats/indexedDBKey.js';import json from'./formats/json.js';import structuredCloning from'./formats/structuredCloning.js';import arbitraryJS from'./formats/arbitraryJS.js';import schema from'./formats/schema.js';/**
 * An arbitrary Structured Clone, JSON, etc. value.
 * @typedef {any} StructuredCloneValue
 *//**
 * @callback GetTypesAndSchemasForFormatAndState
 * @param {import('./types.js').default} types
 * @param {AvailableFormat} format
 * @param {string} [state]
 * @param {import('./formatAndTypeChoices.js').ZodexSchema|
 *   undefined} [schemaObject]
 * @param {import('./formatAndTypeChoices.js').ZodexSchema|
 *   undefined} [schemaOriginal]
 * @returns {TypesAndSchemaObjects|undefined}
 *//* schema:
export const getTypeForFormatStateAndValue = ({format, state, value}) => {
  const valType = new Typeson().register(
    structuredCloningForStorage
  ).rootTypeName(value);
  return canonicalToAvailableType(format, state, valType, value);
};
*//**
 * @typedef {"indexedDBKey"|"json"|"structuredCloning"
 *   |"arbitraryJS"|"schema"} AvailableFormat
 *//**
 * @typedef {{
 *   types: (import('./types.js').AvailableArbitraryType)[],
 *   schemaObjects: import('./formats/schema.js').ZodexSchema[]
 * }} TypesAndSchemaObjects
 *//**
 * Responsible for traversing over data (along with state information) to build
 *   and return a relevant UI element.
 * @callback FormatIterator
 * @param {StructuredCloneValue} records
 * @param {import('./types.js').StateObject} stateObj
 * @returns {Promise<Required<import('./types.js').StateObject>>}
 *//**
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
 *//**
 * Class for processing multiple formats.
 */class Formats{/**
   *
   */constructor(){cov_1u5uhk019l().f[0]++;cov_1u5uhk019l().s[0]++;// Can enable later (and add tests)
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
this.availableFormats=/** @type {{[key: string]: Format}} */{indexedDBKey,json,structuredCloning,arbitraryJS,schema};}/**
   * @param {import('./types.js').default} types
   * @param {AvailableFormat} format
   * @param {StructuredCloneValue} record
   * @param {import('./types.js').StateObject} [stateObj]
   * @returns {Promise<Required<import('./types.js').StateObject>>}
   */async getControlsForFormatAndValue(types,format,record,stateObj){cov_1u5uhk019l().f[1]++;cov_1u5uhk019l().s[1]++;return await this.availableFormats[format].iterate(record,{...stateObj,types,formats:this,// This had been before `stateObj` but should apparently have precedence
//   or just avoid passing `format` to this function
format});}/**
   * @type {GetTypesAndSchemasForFormatAndState}
   */getTypesAndSchemasForFormatAndState(types,format,state,schemaObject,schemaOriginal){cov_1u5uhk019l().f[2]++;cov_1u5uhk019l().s[2]++;return this.availableFormats[format].getTypesAndSchemasForState(types,state,schemaObject,schemaOriginal);}/**
   * @param {AvailableFormat} format
   * @returns {Format}
   */getAvailableFormat(format){cov_1u5uhk019l().f[3]++;cov_1u5uhk019l().s[3]++;return this.availableFormats[format];}}export default Formats;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXU1dWhrMDE5bCIsImFjdHVhbENvdmVyYWdlIiwiaW5kZXhlZERCS2V5IiwianNvbiIsInN0cnVjdHVyZWRDbG9uaW5nIiwiYXJiaXRyYXJ5SlMiLCJzY2hlbWEiLCJGb3JtYXRzIiwiY29uc3RydWN0b3IiLCJmIiwicyIsImF2YWlsYWJsZUZvcm1hdHMiLCJnZXRDb250cm9sc0ZvckZvcm1hdEFuZFZhbHVlIiwidHlwZXMiLCJmb3JtYXQiLCJyZWNvcmQiLCJzdGF0ZU9iaiIsIml0ZXJhdGUiLCJmb3JtYXRzIiwiZ2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGUiLCJzdGF0ZSIsInNjaGVtYU9iamVjdCIsInNjaGVtYU9yaWdpbmFsIiwiZ2V0VHlwZXNBbmRTY2hlbWFzRm9yU3RhdGUiLCJnZXRBdmFpbGFibGVGb3JtYXQiXSwic291cmNlcyI6WyJmb3JtYXRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbmRleGVkREJLZXkgZnJvbSAnLi9mb3JtYXRzL2luZGV4ZWREQktleS5qcyc7XG5pbXBvcnQganNvbiBmcm9tICcuL2Zvcm1hdHMvanNvbi5qcyc7XG5pbXBvcnQgc3RydWN0dXJlZENsb25pbmcgZnJvbSAnLi9mb3JtYXRzL3N0cnVjdHVyZWRDbG9uaW5nLmpzJztcbmltcG9ydCBhcmJpdHJhcnlKUyBmcm9tICcuL2Zvcm1hdHMvYXJiaXRyYXJ5SlMuanMnO1xuaW1wb3J0IHNjaGVtYSBmcm9tICcuL2Zvcm1hdHMvc2NoZW1hLmpzJztcblxuLyoqXG4gKiBBbiBhcmJpdHJhcnkgU3RydWN0dXJlZCBDbG9uZSwgSlNPTiwgZXRjLiB2YWx1ZS5cbiAqIEB0eXBlZGVmIHthbnl9IFN0cnVjdHVyZWRDbG9uZVZhbHVlXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgR2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGVcbiAqIEBwYXJhbSB7aW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdH0gdHlwZXNcbiAqIEBwYXJhbSB7QXZhaWxhYmxlRm9ybWF0fSBmb3JtYXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RhdGVdXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4U2NoZW1hfFxuICogICB1bmRlZmluZWR9IFtzY2hlbWFPYmplY3RdXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4U2NoZW1hfFxuICogICB1bmRlZmluZWR9IFtzY2hlbWFPcmlnaW5hbF1cbiAqIEByZXR1cm5zIHtUeXBlc0FuZFNjaGVtYU9iamVjdHN8dW5kZWZpbmVkfVxuICovXG5cbi8qIHNjaGVtYTpcbmV4cG9ydCBjb25zdCBnZXRUeXBlRm9yRm9ybWF0U3RhdGVBbmRWYWx1ZSA9ICh7Zm9ybWF0LCBzdGF0ZSwgdmFsdWV9KSA9PiB7XG4gIGNvbnN0IHZhbFR5cGUgPSBuZXcgVHlwZXNvbigpLnJlZ2lzdGVyKFxuICAgIHN0cnVjdHVyZWRDbG9uaW5nRm9yU3RvcmFnZVxuICApLnJvb3RUeXBlTmFtZSh2YWx1ZSk7XG4gIHJldHVybiBjYW5vbmljYWxUb0F2YWlsYWJsZVR5cGUoZm9ybWF0LCBzdGF0ZSwgdmFsVHlwZSwgdmFsdWUpO1xufTtcbiovXG5cbi8qKlxuICogQHR5cGVkZWYge1wiaW5kZXhlZERCS2V5XCJ8XCJqc29uXCJ8XCJzdHJ1Y3R1cmVkQ2xvbmluZ1wiXG4gKiAgIHxcImFyYml0cmFyeUpTXCJ8XCJzY2hlbWFcIn0gQXZhaWxhYmxlRm9ybWF0XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICB0eXBlczogKGltcG9ydCgnLi90eXBlcy5qcycpLkF2YWlsYWJsZUFyYml0cmFyeVR5cGUpW10sXG4gKiAgIHNjaGVtYU9iamVjdHM6IGltcG9ydCgnLi9mb3JtYXRzL3NjaGVtYS5qcycpLlpvZGV4U2NoZW1hW11cbiAqIH19IFR5cGVzQW5kU2NoZW1hT2JqZWN0c1xuICovXG5cbi8qKlxuICogUmVzcG9uc2libGUgZm9yIHRyYXZlcnNpbmcgb3ZlciBkYXRhIChhbG9uZyB3aXRoIHN0YXRlIGluZm9ybWF0aW9uKSB0byBidWlsZFxuICogICBhbmQgcmV0dXJuIGEgcmVsZXZhbnQgVUkgZWxlbWVudC5cbiAqIEBjYWxsYmFjayBGb3JtYXRJdGVyYXRvclxuICogQHBhcmFtIHtTdHJ1Y3R1cmVkQ2xvbmVWYWx1ZX0gcmVjb3Jkc1xuICogQHBhcmFtIHtpbXBvcnQoJy4vdHlwZXMuanMnKS5TdGF0ZU9iamVjdH0gc3RhdGVPYmpcbiAqIEByZXR1cm5zIHtQcm9taXNlPFJlcXVpcmVkPGltcG9ydCgnLi90eXBlcy5qcycpLlN0YXRlT2JqZWN0Pj59XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBGb3JtYXRcbiAqIEBwcm9wZXJ0eSB7KCkgPT4gKFxuICogICBpbXBvcnQoJy4vdHlwZXMuanMnKS5BdmFpbGFibGVBcmJpdHJhcnlUeXBlXG4gKiApW119IHR5cGVzIFJldHVybnMgbGlzdFxuICogICBvZiB0eXBlcyBnZW5lcmFsbHkgYXZhaWxhYmxlIHRvIHN0cnVjdHVyZWQgY2xvbmluZy4gU2VlXG4gKiAgIHtAbGluayBnZXRUeXBlc0FuZFNjaGVtYXNGb3JTdGF0ZX0gZm9yIGNvbnRleHQtZGVwZW5kZW50IG1ldGhvZC5cbiAqIEBwcm9wZXJ0eSB7Rm9ybWF0SXRlcmF0b3J9IGl0ZXJhdGUgVHJhdmVyc2VzIG92ZXIgZGF0YSB0byBidWlsZCBhbmQgcmV0dXJuXG4gKiAgIGEgcmVsZXZhbnQgVUkgZWxlbWVudC5cbiAqIEBwcm9wZXJ0eSB7KFxuICogICB0eXBlczogaW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdCxcbiAqICAgc3RhdGU/OiBzdHJpbmcsXG4gKiAgIHNjaGVtYU9iamVjdD86IGltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4U2NoZW1hfFxuICogICAgIHVuZGVmaW5lZCxcbiAqICAgc2NoZW1hT3JpZ2luYWw/OiBpbXBvcnQoJy4vZm9ybWF0QW5kVHlwZUNob2ljZXMuanMnKS5ab2RleFNjaGVtYXxcbiAqICAgICB1bmRlZmluZWRcbiAqICkgPT4gVHlwZXNBbmRTY2hlbWFPYmplY3RzfHVuZGVmaW5lZH0gZ2V0VHlwZXNBbmRTY2hlbWFzRm9yU3RhdGUgR2V0cyB0aGVcbiAqICAgc3BlY2lmaWMgdHlwZXMgKGFuZCBzY2hlbWFzKSByZWxldmFudCB0byBhIGdpdmVuIHN0YXRlLlxuICogQHByb3BlcnR5IHsoXG4gKiAgICAgbmV3VHlwZTogc3RyaW5nLCB2YWx1ZTogRGF0ZXxBcnJheTxTdHJ1Y3R1cmVkQ2xvbmVWYWx1ZT5cbiAqICAgKSA9PiBib29sZWFufHVuZGVmaW5lZH0gW3Rlc3RJbnZhbGlkXVxuICogQHByb3BlcnR5IHsoXG4gKiAgIHR5cGVzb25UeXBlOiBpbXBvcnQoJy4vdHlwZXMuanMnKS5BdmFpbGFibGVBcmJpdHJhcnlUeXBlLFxuICogICB0eXBlczogaW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdCxcbiAqICAgdj86IGltcG9ydCgnLi9mb3JtYXRzLmpzJykuU3RydWN0dXJlZENsb25lVmFsdWUsXG4gKiAgIGFycmF5T3JPYmplY3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmcsXG4gKiAgIHBhcmVudFNjaGVtYT86IFtcbiAqICAgICBpbXBvcnQoJ3pvZGV4eScpLlN6VHlwZSxcbiAqICAgICBudW1iZXJ8dW5kZWZpbmVkXG4gKiAgIF18dW5kZWZpbmVkLFxuICogICBzdGF0ZU9iaj86IGltcG9ydCgnLi90eXBlcy5qcycpLlN0YXRlT2JqZWN0LFxuICogKSA9PiB7XG4gKiAgIHR5cGU6IGltcG9ydCgnLi90eXBlcy5qcycpLkF2YWlsYWJsZUFyYml0cmFyeVR5cGV8dW5kZWZpbmVkXG4gKiAgIHNjaGVtYT86IGltcG9ydCgnem9kZXh5JykuU3pUeXBlfHVuZGVmaW5lZCxcbiAqICAgbXVzdEJlT3B0aW9uYWw/OiBib29sZWFuLFxuICogICBzY2hlbWFJZHg/OiBudW1iZXJcbiAqIH19IFtjb252ZXJ0RnJvbVR5cGVzb25dXG4gKiBAcHJvcGVydHkgeyhcbiAqICAgdHlwZXM6IGltcG9ydCgnLi90eXBlcy5qcycpLmRlZmF1bHQsXG4gKiAgIHNjaGVtYU9iamVjdDogaW1wb3J0KCcuL2Zvcm1hdEFuZFR5cGVDaG9pY2VzLmpzJykuWm9kZXhTY2hlbWEsXG4gKiAgIHZhbHVlOiBTdHJ1Y3R1cmVkQ2xvbmVWYWx1ZVxuICogKSA9PiB7dmFsaWQ6IGJvb2xlYW4sIG1lc3NhZ2U/OiBzdHJpbmcsXG4gKiAgIHNjaGVtYT86IGltcG9ydCgnLi9mb3JtYXRzL3NjaGVtYS5qcycpLlpvZGV4U2NoZW1hfX0gW3ZhbGlkYXRlVmFsdWVdXG4gKiBAcHJvcGVydHkgeyhcbiAqICAgc2NoZW1hT2JqZWN0OiBpbXBvcnQoJy4vZm9ybWF0cy9zY2hlbWEuanMnKS5ab2RleFNjaGVtYVxuICogKSA9PiBib29sZWFufSBbaXNWYWx1ZVZhbGlkYXRpb25SZXF1aXJlZF1cbiAqL1xuXG4vKipcbiAqIENsYXNzIGZvciBwcm9jZXNzaW5nIG11bHRpcGxlIGZvcm1hdHMuXG4gKi9cbmNsYXNzIEZvcm1hdHMge1xuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDYW4gZW5hYmxlIGxhdGVyIChhbmQgYWRkIHRlc3RzKVxuICAgIC8vIGlmIChmb3JtYXRzKSB7XG4gICAgLy8gICB0aGlzLmF2YWlsYWJsZUZvcm1hdHMgPSB7fTtcbiAgICAvLyAgIGZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgLy8gICAgIGxldCBmb3JtYXRWYWx1ZTtcbiAgICAvLyAgICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAvLyAgICAgY2FzZSAnaW5kZXhlZERCS2V5JzpcbiAgICAvLyAgICAgICBmb3JtYXRWYWx1ZSA9IGluZGV4ZWREQktleTtcbiAgICAvLyAgICAgICBicmVhaztcbiAgICAvLyAgICAgY2FzZSAnanNvbic6XG4gICAgLy8gICAgICAgZm9ybWF0VmFsdWUgPSBqc29uO1xuICAgIC8vICAgICAgIGJyZWFrO1xuICAgIC8vICAgICBjYXNlICdzdHJ1Y3R1cmVkQ2xvbmluZyc6XG4gICAgLy8gICAgICAgZm9ybWF0VmFsdWUgPSBzdHJ1Y3R1cmVkQ2xvbmluZztcbiAgICAvLyAgICAgICBicmVhaztcbiAgICAvLyAgICAgY2FzZSAnYXJiaXRyYXJ5SlMnOlxuICAgIC8vICAgICAgIGZvcm1hdFZhbHVlID0gYXJiaXRyYXJ5SlM7XG4gICAgLy8gICAgICAgYnJlYWs7XG4gICAgLy8gICAgIGRlZmF1bHQ6XG4gICAgLy8gICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGZvcm1hdCcpO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIHRoaXMuYXZhaWxhYmxlRm9ybWF0c1tmb3JtYXRdID0gZm9ybWF0VmFsdWU7XG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHJldHVybjtcbiAgICAvLyB9XG4gICAgLy8gVXNpbmcgbWV0aG9kcyBlbnN1cmUgd2UgaGF2ZSBmcmVzaCBjb3BpZXNcbiAgICB0aGlzLmF2YWlsYWJsZUZvcm1hdHMgPSAvKiogQHR5cGUge3tba2V5OiBzdHJpbmddOiBGb3JtYXR9fSAqLyAoe1xuICAgICAgaW5kZXhlZERCS2V5LFxuICAgICAganNvbixcbiAgICAgIHN0cnVjdHVyZWRDbG9uaW5nLFxuICAgICAgYXJiaXRyYXJ5SlMsXG4gICAgICBzY2hlbWFcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2ltcG9ydCgnLi90eXBlcy5qcycpLmRlZmF1bHR9IHR5cGVzXG4gICAqIEBwYXJhbSB7QXZhaWxhYmxlRm9ybWF0fSBmb3JtYXRcbiAgICogQHBhcmFtIHtTdHJ1Y3R1cmVkQ2xvbmVWYWx1ZX0gcmVjb3JkXG4gICAqIEBwYXJhbSB7aW1wb3J0KCcuL3R5cGVzLmpzJykuU3RhdGVPYmplY3R9IFtzdGF0ZU9ial1cbiAgICogQHJldHVybnMge1Byb21pc2U8UmVxdWlyZWQ8aW1wb3J0KCcuL3R5cGVzLmpzJykuU3RhdGVPYmplY3Q+Pn1cbiAgICovXG4gIGFzeW5jIGdldENvbnRyb2xzRm9yRm9ybWF0QW5kVmFsdWUgKHR5cGVzLCBmb3JtYXQsIHJlY29yZCwgc3RhdGVPYmopIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdmFpbGFibGVGb3JtYXRzW2Zvcm1hdF0uXG4gICAgICBpdGVyYXRlKHJlY29yZCwge1xuICAgICAgICAuLi5zdGF0ZU9iaixcbiAgICAgICAgdHlwZXMsXG4gICAgICAgIGZvcm1hdHM6IHRoaXMsXG4gICAgICAgIC8vIFRoaXMgaGFkIGJlZW4gYmVmb3JlIGBzdGF0ZU9iamAgYnV0IHNob3VsZCBhcHBhcmVudGx5IGhhdmUgcHJlY2VkZW5jZVxuICAgICAgICAvLyAgIG9yIGp1c3QgYXZvaWQgcGFzc2luZyBgZm9ybWF0YCB0byB0aGlzIGZ1bmN0aW9uXG4gICAgICAgIGZvcm1hdFxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge0dldFR5cGVzQW5kU2NoZW1hc0ZvckZvcm1hdEFuZFN0YXRlfVxuICAgKi9cbiAgZ2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGUgKFxuICAgIHR5cGVzLCBmb3JtYXQsIHN0YXRlLCBzY2hlbWFPYmplY3QsIHNjaGVtYU9yaWdpbmFsXG4gICkge1xuICAgIHJldHVybiB0aGlzLmF2YWlsYWJsZUZvcm1hdHNbZm9ybWF0XS5nZXRUeXBlc0FuZFNjaGVtYXNGb3JTdGF0ZShcbiAgICAgIHR5cGVzLCBzdGF0ZSwgc2NoZW1hT2JqZWN0LCBzY2hlbWFPcmlnaW5hbFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtBdmFpbGFibGVGb3JtYXR9IGZvcm1hdFxuICAgKiBAcmV0dXJucyB7Rm9ybWF0fVxuICAgKi9cbiAgZ2V0QXZhaWxhYmxlRm9ybWF0IChmb3JtYXQpIHtcbiAgICByZXR1cm4gdGhpcy5hdmFpbGFibGVGb3JtYXRzW2Zvcm1hdF07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRm9ybWF0cztcbiJdLCJtYXBwaW5ncyI6Im81Q0FlWTtBQUFBQSxjQUFBLFNBQUFBLENB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