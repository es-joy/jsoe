function cov_1u5uhk019l(){var path="/Users/brett/jsoe/src/formats.js";var hash="90d64de5746c4dd6c90d7abb2d94813db81fe0a9";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"/Users/brett/jsoe/src/formats.js",statementMap:{"0":{start:{line:132,column:4},end:{line:138,column:7}},"1":{start:{line:149,column:4},end:{line:157,column:9}},"2":{start:{line:166,column:4},end:{line:168,column:6}},"3":{start:{line:176,column:4},end:{line:176,column:41}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:105,column:2},end:{line:105,column:3}},loc:{start:{line:105,column:17},end:{line:139,column:3}},line:105},"1":{name:"(anonymous_1)",decl:{start:{line:148,column:2},end:{line:148,column:3}},loc:{start:{line:148,column:71},end:{line:158,column:3}},line:148},"2":{name:"(anonymous_2)",decl:{start:{line:163,column:2},end:{line:163,column:3}},loc:{start:{line:165,column:4},end:{line:169,column:3}},line:165},"3":{name:"(anonymous_3)",decl:{start:{line:175,column:2},end:{line:175,column:3}},loc:{start:{line:175,column:30},end:{line:177,column:3}},line:175}},branchMap:{},s:{"0":0,"1":0,"2":0,"3":0},f:{"0":0,"1":0,"2":0,"3":0},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"90d64de5746c4dd6c90d7abb2d94813db81fe0a9"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
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
    structuredCloningThrowing
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
 * ) => {valid: boolean, message?: string}} [validateValue]
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
   * @param {import('./types.js').StateObject} stateObj
   * @returns {Promise<Required<import('./types.js').StateObject>>}
   */async getControlsForFormatAndValue(types,format,record,stateObj){cov_1u5uhk019l().f[1]++;cov_1u5uhk019l().s[1]++;return await this.availableFormats[format].iterate(record,{...stateObj,types,formats:this,// This had been before `stateObj` but should apparently have precedence
//   or just avoid passing `format` to this function
format});}/**
   * @type {GetTypesAndSchemasForFormatAndState}
   */getTypesAndSchemasForFormatAndState(types,format,state,schemaObject,schemaOriginal){cov_1u5uhk019l().f[2]++;cov_1u5uhk019l().s[2]++;return this.availableFormats[format].getTypesAndSchemasForState(types,state,schemaObject,schemaOriginal);}/**
   * @param {AvailableFormat} format
   * @returns {Format}
   */getAvailableFormat(format){cov_1u5uhk019l().f[3]++;cov_1u5uhk019l().s[3]++;return this.availableFormats[format];}}export default Formats;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXU1dWhrMDE5bCIsImFjdHVhbENvdmVyYWdlIiwiaW5kZXhlZERCS2V5IiwianNvbiIsInN0cnVjdHVyZWRDbG9uaW5nIiwiYXJiaXRyYXJ5SlMiLCJzY2hlbWEiLCJGb3JtYXRzIiwiY29uc3RydWN0b3IiLCJmIiwicyIsImF2YWlsYWJsZUZvcm1hdHMiLCJnZXRDb250cm9sc0ZvckZvcm1hdEFuZFZhbHVlIiwidHlwZXMiLCJmb3JtYXQiLCJyZWNvcmQiLCJzdGF0ZU9iaiIsIml0ZXJhdGUiLCJmb3JtYXRzIiwiZ2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGUiLCJzdGF0ZSIsInNjaGVtYU9iamVjdCIsInNjaGVtYU9yaWdpbmFsIiwiZ2V0VHlwZXNBbmRTY2hlbWFzRm9yU3RhdGUiLCJnZXRBdmFpbGFibGVGb3JtYXQiXSwic291cmNlcyI6WyJmb3JtYXRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbmRleGVkREJLZXkgZnJvbSAnLi9mb3JtYXRzL2luZGV4ZWREQktleS5qcyc7XG5pbXBvcnQganNvbiBmcm9tICcuL2Zvcm1hdHMvanNvbi5qcyc7XG5pbXBvcnQgc3RydWN0dXJlZENsb25pbmcgZnJvbSAnLi9mb3JtYXRzL3N0cnVjdHVyZWRDbG9uaW5nLmpzJztcbmltcG9ydCBhcmJpdHJhcnlKUyBmcm9tICcuL2Zvcm1hdHMvYXJiaXRyYXJ5SlMuanMnO1xuaW1wb3J0IHNjaGVtYSBmcm9tICcuL2Zvcm1hdHMvc2NoZW1hLmpzJztcblxuLyoqXG4gKiBBbiBhcmJpdHJhcnkgU3RydWN0dXJlZCBDbG9uZSwgSlNPTiwgZXRjLiB2YWx1ZS5cbiAqIEB0eXBlZGVmIHthbnl9IFN0cnVjdHVyZWRDbG9uZVZhbHVlXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgR2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGVcbiAqIEBwYXJhbSB7aW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdH0gdHlwZXNcbiAqIEBwYXJhbSB7QXZhaWxhYmxlRm9ybWF0fSBmb3JtYXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RhdGVdXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4U2NoZW1hfFxuICogICB1bmRlZmluZWR9IFtzY2hlbWFPYmplY3RdXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4U2NoZW1hfFxuICogICB1bmRlZmluZWR9IFtzY2hlbWFPcmlnaW5hbF1cbiAqIEByZXR1cm5zIHtUeXBlc0FuZFNjaGVtYU9iamVjdHN8dW5kZWZpbmVkfVxuICovXG5cbi8qIHNjaGVtYTpcbmV4cG9ydCBjb25zdCBnZXRUeXBlRm9yRm9ybWF0U3RhdGVBbmRWYWx1ZSA9ICh7Zm9ybWF0LCBzdGF0ZSwgdmFsdWV9KSA9PiB7XG4gIGNvbnN0IHZhbFR5cGUgPSBuZXcgVHlwZXNvbigpLnJlZ2lzdGVyKFxuICAgIHN0cnVjdHVyZWRDbG9uaW5nVGhyb3dpbmdcbiAgKS5yb290VHlwZU5hbWUodmFsdWUpO1xuICByZXR1cm4gY2Fub25pY2FsVG9BdmFpbGFibGVUeXBlKGZvcm1hdCwgc3RhdGUsIHZhbFR5cGUsIHZhbHVlKTtcbn07XG4qL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtcImluZGV4ZWREQktleVwifFwianNvblwifFwic3RydWN0dXJlZENsb25pbmdcIlxuICogICB8XCJhcmJpdHJhcnlKU1wifFwic2NoZW1hXCJ9IEF2YWlsYWJsZUZvcm1hdFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgdHlwZXM6IChpbXBvcnQoJy4vdHlwZXMuanMnKS5BdmFpbGFibGVBcmJpdHJhcnlUeXBlKVtdLFxuICogICBzY2hlbWFPYmplY3RzOiBpbXBvcnQoJy4vZm9ybWF0cy9zY2hlbWEuanMnKS5ab2RleFNjaGVtYVtdXG4gKiB9fSBUeXBlc0FuZFNjaGVtYU9iamVjdHNcbiAqL1xuXG4vKipcbiAqIFJlc3BvbnNpYmxlIGZvciB0cmF2ZXJzaW5nIG92ZXIgZGF0YSAoYWxvbmcgd2l0aCBzdGF0ZSBpbmZvcm1hdGlvbikgdG8gYnVpbGRcbiAqICAgYW5kIHJldHVybiBhIHJlbGV2YW50IFVJIGVsZW1lbnQuXG4gKiBAY2FsbGJhY2sgRm9ybWF0SXRlcmF0b3JcbiAqIEBwYXJhbSB7U3RydWN0dXJlZENsb25lVmFsdWV9IHJlY29yZHNcbiAqIEBwYXJhbSB7aW1wb3J0KCcuL3R5cGVzLmpzJykuU3RhdGVPYmplY3R9IHN0YXRlT2JqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxSZXF1aXJlZDxpbXBvcnQoJy4vdHlwZXMuanMnKS5TdGF0ZU9iamVjdD4+fVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gRm9ybWF0XG4gKiBAcHJvcGVydHkgeygpID0+IChcbiAqICAgaW1wb3J0KCcuL3R5cGVzLmpzJykuQXZhaWxhYmxlQXJiaXRyYXJ5VHlwZVxuICogKVtdfSB0eXBlcyBSZXR1cm5zIGxpc3RcbiAqICAgb2YgdHlwZXMgZ2VuZXJhbGx5IGF2YWlsYWJsZSB0byBzdHJ1Y3R1cmVkIGNsb25pbmcuIFNlZVxuICogICB7QGxpbmsgZ2V0VHlwZXNBbmRTY2hlbWFzRm9yU3RhdGV9IGZvciBjb250ZXh0LWRlcGVuZGVudCBtZXRob2QuXG4gKiBAcHJvcGVydHkge0Zvcm1hdEl0ZXJhdG9yfSBpdGVyYXRlIFRyYXZlcnNlcyBvdmVyIGRhdGEgdG8gYnVpbGQgYW5kIHJldHVyblxuICogICBhIHJlbGV2YW50IFVJIGVsZW1lbnQuXG4gKiBAcHJvcGVydHkgeyhcbiAqICAgdHlwZXM6IGltcG9ydCgnLi90eXBlcy5qcycpLmRlZmF1bHQsXG4gKiAgIHN0YXRlPzogc3RyaW5nLFxuICogICBzY2hlbWFPYmplY3Q/OiBpbXBvcnQoJy4vZm9ybWF0QW5kVHlwZUNob2ljZXMuanMnKS5ab2RleFNjaGVtYXxcbiAqICAgICB1bmRlZmluZWQsXG4gKiAgIHNjaGVtYU9yaWdpbmFsPzogaW1wb3J0KCcuL2Zvcm1hdEFuZFR5cGVDaG9pY2VzLmpzJykuWm9kZXhTY2hlbWF8XG4gKiAgICAgdW5kZWZpbmVkXG4gKiApID0+IFR5cGVzQW5kU2NoZW1hT2JqZWN0c3x1bmRlZmluZWR9IGdldFR5cGVzQW5kU2NoZW1hc0ZvclN0YXRlIEdldHMgdGhlXG4gKiAgIHNwZWNpZmljIHR5cGVzIChhbmQgc2NoZW1hcykgcmVsZXZhbnQgdG8gYSBnaXZlbiBzdGF0ZS5cbiAqIEBwcm9wZXJ0eSB7KFxuICogICAgIG5ld1R5cGU6IHN0cmluZywgdmFsdWU6IERhdGV8QXJyYXk8U3RydWN0dXJlZENsb25lVmFsdWU+XG4gKiAgICkgPT4gYm9vbGVhbnx1bmRlZmluZWR9IFt0ZXN0SW52YWxpZF1cbiAqIEBwcm9wZXJ0eSB7KFxuICogICB0eXBlc29uVHlwZTogaW1wb3J0KCcuL3R5cGVzLmpzJykuQXZhaWxhYmxlQXJiaXRyYXJ5VHlwZSxcbiAqICAgdHlwZXM6IGltcG9ydCgnLi90eXBlcy5qcycpLmRlZmF1bHQsXG4gKiAgIHY/OiBpbXBvcnQoJy4vZm9ybWF0cy5qcycpLlN0cnVjdHVyZWRDbG9uZVZhbHVlLFxuICogICBhcnJheU9yT2JqZWN0UHJvcGVydHlOYW1lPzogc3RyaW5nLFxuICogICBwYXJlbnRTY2hlbWE/OiBbXG4gKiAgICAgaW1wb3J0KCd6b2RleHknKS5TelR5cGUsXG4gKiAgICAgbnVtYmVyfHVuZGVmaW5lZFxuICogICBdfHVuZGVmaW5lZCxcbiAqICAgc3RhdGVPYmo/OiBpbXBvcnQoJy4vdHlwZXMuanMnKS5TdGF0ZU9iamVjdCxcbiAqICkgPT4ge1xuICogICB0eXBlOiBpbXBvcnQoJy4vdHlwZXMuanMnKS5BdmFpbGFibGVBcmJpdHJhcnlUeXBlfHVuZGVmaW5lZFxuICogICBzY2hlbWE/OiBpbXBvcnQoJ3pvZGV4eScpLlN6VHlwZXx1bmRlZmluZWQsXG4gKiAgIG11c3RCZU9wdGlvbmFsPzogYm9vbGVhbixcbiAqICAgc2NoZW1hSWR4PzogbnVtYmVyXG4gKiB9fSBbY29udmVydEZyb21UeXBlc29uXVxuICogQHByb3BlcnR5IHsoXG4gKiAgIHR5cGVzOiBpbXBvcnQoJy4vdHlwZXMuanMnKS5kZWZhdWx0LFxuICogICBzY2hlbWFPYmplY3Q6IGltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4U2NoZW1hLFxuICogICB2YWx1ZTogU3RydWN0dXJlZENsb25lVmFsdWVcbiAqICkgPT4ge3ZhbGlkOiBib29sZWFuLCBtZXNzYWdlPzogc3RyaW5nfX0gW3ZhbGlkYXRlVmFsdWVdXG4gKi9cblxuLyoqXG4gKiBDbGFzcyBmb3IgcHJvY2Vzc2luZyBtdWx0aXBsZSBmb3JtYXRzLlxuICovXG5jbGFzcyBGb3JtYXRzIHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ2FuIGVuYWJsZSBsYXRlciAoYW5kIGFkZCB0ZXN0cylcbiAgICAvLyBpZiAoZm9ybWF0cykge1xuICAgIC8vICAgdGhpcy5hdmFpbGFibGVGb3JtYXRzID0ge307XG4gICAgLy8gICBmb3JtYXRzLmZvckVhY2goKGZvcm1hdCkgPT4ge1xuICAgIC8vICAgICBsZXQgZm9ybWF0VmFsdWU7XG4gICAgLy8gICAgIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgLy8gICAgIGNhc2UgJ2luZGV4ZWREQktleSc6XG4gICAgLy8gICAgICAgZm9ybWF0VmFsdWUgPSBpbmRleGVkREJLZXk7XG4gICAgLy8gICAgICAgYnJlYWs7XG4gICAgLy8gICAgIGNhc2UgJ2pzb24nOlxuICAgIC8vICAgICAgIGZvcm1hdFZhbHVlID0ganNvbjtcbiAgICAvLyAgICAgICBicmVhaztcbiAgICAvLyAgICAgY2FzZSAnc3RydWN0dXJlZENsb25pbmcnOlxuICAgIC8vICAgICAgIGZvcm1hdFZhbHVlID0gc3RydWN0dXJlZENsb25pbmc7XG4gICAgLy8gICAgICAgYnJlYWs7XG4gICAgLy8gICAgIGNhc2UgJ2FyYml0cmFyeUpTJzpcbiAgICAvLyAgICAgICBmb3JtYXRWYWx1ZSA9IGFyYml0cmFyeUpTO1xuICAgIC8vICAgICAgIGJyZWFrO1xuICAgIC8vICAgICBkZWZhdWx0OlxuICAgIC8vICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBmb3JtYXQnKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICB0aGlzLmF2YWlsYWJsZUZvcm1hdHNbZm9ybWF0XSA9IGZvcm1hdFZhbHVlO1xuICAgIC8vICAgfSk7XG4gICAgLy8gICByZXR1cm47XG4gICAgLy8gfVxuICAgIC8vIFVzaW5nIG1ldGhvZHMgZW5zdXJlIHdlIGhhdmUgZnJlc2ggY29waWVzXG4gICAgdGhpcy5hdmFpbGFibGVGb3JtYXRzID0gLyoqIEB0eXBlIHt7W2tleTogc3RyaW5nXTogRm9ybWF0fX0gKi8gKHtcbiAgICAgIGluZGV4ZWREQktleSxcbiAgICAgIGpzb24sXG4gICAgICBzdHJ1Y3R1cmVkQ2xvbmluZyxcbiAgICAgIGFyYml0cmFyeUpTLFxuICAgICAgc2NoZW1hXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtpbXBvcnQoJy4vdHlwZXMuanMnKS5kZWZhdWx0fSB0eXBlc1xuICAgKiBAcGFyYW0ge0F2YWlsYWJsZUZvcm1hdH0gZm9ybWF0XG4gICAqIEBwYXJhbSB7U3RydWN0dXJlZENsb25lVmFsdWV9IHJlY29yZFxuICAgKiBAcGFyYW0ge2ltcG9ydCgnLi90eXBlcy5qcycpLlN0YXRlT2JqZWN0fSBzdGF0ZU9ialxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxSZXF1aXJlZDxpbXBvcnQoJy4vdHlwZXMuanMnKS5TdGF0ZU9iamVjdD4+fVxuICAgKi9cbiAgYXN5bmMgZ2V0Q29udHJvbHNGb3JGb3JtYXRBbmRWYWx1ZSAodHlwZXMsIGZvcm1hdCwgcmVjb3JkLCBzdGF0ZU9iaikge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmF2YWlsYWJsZUZvcm1hdHNbZm9ybWF0XS5cbiAgICAgIGl0ZXJhdGUocmVjb3JkLCB7XG4gICAgICAgIC4uLnN0YXRlT2JqLFxuICAgICAgICB0eXBlcyxcbiAgICAgICAgZm9ybWF0czogdGhpcyxcbiAgICAgICAgLy8gVGhpcyBoYWQgYmVlbiBiZWZvcmUgYHN0YXRlT2JqYCBidXQgc2hvdWxkIGFwcGFyZW50bHkgaGF2ZSBwcmVjZWRlbmNlXG4gICAgICAgIC8vICAgb3IganVzdCBhdm9pZCBwYXNzaW5nIGBmb3JtYXRgIHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgZm9ybWF0XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7R2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGV9XG4gICAqL1xuICBnZXRUeXBlc0FuZFNjaGVtYXNGb3JGb3JtYXRBbmRTdGF0ZSAoXG4gICAgdHlwZXMsIGZvcm1hdCwgc3RhdGUsIHNjaGVtYU9iamVjdCwgc2NoZW1hT3JpZ2luYWxcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuYXZhaWxhYmxlRm9ybWF0c1tmb3JtYXRdLmdldFR5cGVzQW5kU2NoZW1hc0ZvclN0YXRlKFxuICAgICAgdHlwZXMsIHN0YXRlLCBzY2hlbWFPYmplY3QsIHNjaGVtYU9yaWdpbmFsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0F2YWlsYWJsZUZvcm1hdH0gZm9ybWF0XG4gICAqIEByZXR1cm5zIHtGb3JtYXR9XG4gICAqL1xuICBnZXRBdmFpbGFibGVGb3JtYXQgKGZvcm1hdCkge1xuICAgIHJldHVybiB0aGlzLmF2YWlsYWJsZUZvcm1hdHNbZm9ybWF0XTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGb3JtYXRzO1xuIl0sIm1hcHBpbmdzIjoibzVDQWVZO0FBQUFBLGNBQUEsU0FBQUEsQ0FBQSxTQUFBQyxjQUFBLFdBQUFBLGNBQUEsRUFBQUQsY0FBQSxHQWZaLE1BQU8sQ0FBQUUsWUFBWSxLQUFNLDJCQUEyQixDQUNwRCxNQUFPLENBQUFDLElBQUksS0FBTSxtQkFBbUIsQ0FDcEMsTUFBTyxDQUFBQyxpQkFBaUIsS0FBTSxnQ0FBZ0MsQ0FDOUQsTUFBTyxDQUFBQyxXQUFXLEtBQU0sMEJBQTBCLENBQ2xELE1BQU8sQ0FB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