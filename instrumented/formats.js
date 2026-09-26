function cov_1u5uhk019l(){var path="/Users/brett/jsoe/src/formats.js";var hash="74115d89f069c1be082e39a52d04f7a51a6e9a99";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"/Users/brett/jsoe/src/formats.js",statementMap:{"0":{start:{line:136,column:4},end:{line:142,column:7}},"1":{start:{line:153,column:4},end:{line:161,column:9}},"2":{start:{line:170,column:4},end:{line:172,column:6}},"3":{start:{line:180,column:4},end:{line:180,column:41}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:109,column:2},end:{line:109,column:3}},loc:{start:{line:109,column:17},end:{line:143,column:3}},line:109},"1":{name:"(anonymous_1)",decl:{start:{line:152,column:2},end:{line:152,column:3}},loc:{start:{line:152,column:71},end:{line:162,column:3}},line:152},"2":{name:"(anonymous_2)",decl:{start:{line:167,column:2},end:{line:167,column:3}},loc:{start:{line:169,column:4},end:{line:173,column:3}},line:169},"3":{name:"(anonymous_3)",decl:{start:{line:179,column:2},end:{line:179,column:3}},loc:{start:{line:179,column:30},end:{line:181,column:3}},line:179}},branchMap:{},s:{"0":0,"1":0,"2":0,"3":0},f:{"0":0,"1":0,"2":0,"3":0},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"74115d89f069c1be082e39a52d04f7a51a6e9a99"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_1u5uhk019l=function(){return actualCoverage;};}return actualCoverage;}cov_1u5uhk019l();import indexedDBKey from'./formats/indexedDBKey.js';import json from'./formats/json.js';import structuredCloning from'./formats/structuredCloning.js';import arbitraryJS from'./formats/arbitraryJS.js';import schema from'./formats/schema.js';/**
 * An arbitrary Structured Clone, JSON, etc. value.
 * @typedef {any} StructuredCloneValue
 *//**
 * @callback GetTypesAndSchemasForFormatAndState
 * @param {import('./types.js').default} types
 * @param {AvailableFormat} format
 * @param {string} [state]
 * @param {import('./formatAndTypeChoices.js').ZodexySchema|
 *   undefined} [schemaObject]
 * @param {import('./formatAndTypeChoices.js').ZodexySchema|
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
 *   schemaObjects: import('./formats/schema.js').ZodexySchema[]
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
 *   schemaObject?: import('./formatAndTypeChoices.js').ZodexySchema|
 *     undefined,
 *   schemaOriginal?: import('./formatAndTypeChoices.js').ZodexySchema|
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
 *   schemaObject: import('./formatAndTypeChoices.js').ZodexySchema,
 *   value: StructuredCloneValue
 * ) => {valid: boolean, message?: string,
 *   schema?: import('./formats/schema.js').ZodexySchema}} [validateValue]
 * @property {(
 *   schemaObject: import('./formats/schema.js').ZodexySchema
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXU1dWhrMDE5bCIsImFjdHVhbENvdmVyYWdlIiwiaW5kZXhlZERCS2V5IiwianNvbiIsInN0cnVjdHVyZWRDbG9uaW5nIiwiYXJiaXRyYXJ5SlMiLCJzY2hlbWEiLCJGb3JtYXRzIiwiY29uc3RydWN0b3IiLCJmIiwicyIsImF2YWlsYWJsZUZvcm1hdHMiLCJnZXRDb250cm9sc0ZvckZvcm1hdEFuZFZhbHVlIiwidHlwZXMiLCJmb3JtYXQiLCJyZWNvcmQiLCJzdGF0ZU9iaiIsIml0ZXJhdGUiLCJmb3JtYXRzIiwiZ2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGUiLCJzdGF0ZSIsInNjaGVtYU9iamVjdCIsInNjaGVtYU9yaWdpbmFsIiwiZ2V0VHlwZXNBbmRTY2hlbWFzRm9yU3RhdGUiLCJnZXRBdmFpbGFibGVGb3JtYXQiXSwic291cmNlcyI6WyJmb3JtYXRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbmRleGVkREJLZXkgZnJvbSAnLi9mb3JtYXRzL2luZGV4ZWREQktleS5qcyc7XG5pbXBvcnQganNvbiBmcm9tICcuL2Zvcm1hdHMvanNvbi5qcyc7XG5pbXBvcnQgc3RydWN0dXJlZENsb25pbmcgZnJvbSAnLi9mb3JtYXRzL3N0cnVjdHVyZWRDbG9uaW5nLmpzJztcbmltcG9ydCBhcmJpdHJhcnlKUyBmcm9tICcuL2Zvcm1hdHMvYXJiaXRyYXJ5SlMuanMnO1xuaW1wb3J0IHNjaGVtYSBmcm9tICcuL2Zvcm1hdHMvc2NoZW1hLmpzJztcblxuLyoqXG4gKiBBbiBhcmJpdHJhcnkgU3RydWN0dXJlZCBDbG9uZSwgSlNPTiwgZXRjLiB2YWx1ZS5cbiAqIEB0eXBlZGVmIHthbnl9IFN0cnVjdHVyZWRDbG9uZVZhbHVlXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgR2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGVcbiAqIEBwYXJhbSB7aW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdH0gdHlwZXNcbiAqIEBwYXJhbSB7QXZhaWxhYmxlRm9ybWF0fSBmb3JtYXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc3RhdGVdXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4eVNjaGVtYXxcbiAqICAgdW5kZWZpbmVkfSBbc2NoZW1hT2JqZWN0XVxuICogQHBhcmFtIHtpbXBvcnQoJy4vZm9ybWF0QW5kVHlwZUNob2ljZXMuanMnKS5ab2RleHlTY2hlbWF8XG4gKiAgIHVuZGVmaW5lZH0gW3NjaGVtYU9yaWdpbmFsXVxuICogQHJldHVybnMge1R5cGVzQW5kU2NoZW1hT2JqZWN0c3x1bmRlZmluZWR9XG4gKi9cblxuLyogc2NoZW1hOlxuZXhwb3J0IGNvbnN0IGdldFR5cGVGb3JGb3JtYXRTdGF0ZUFuZFZhbHVlID0gKHtmb3JtYXQsIHN0YXRlLCB2YWx1ZX0pID0+IHtcbiAgY29uc3QgdmFsVHlwZSA9IG5ldyBUeXBlc29uKCkucmVnaXN0ZXIoXG4gICAgc3RydWN0dXJlZENsb25pbmdGb3JTdG9yYWdlXG4gICkucm9vdFR5cGVOYW1lKHZhbHVlKTtcbiAgcmV0dXJuIGNhbm9uaWNhbFRvQXZhaWxhYmxlVHlwZShmb3JtYXQsIHN0YXRlLCB2YWxUeXBlLCB2YWx1ZSk7XG59O1xuKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7XCJpbmRleGVkREJLZXlcInxcImpzb25cInxcInN0cnVjdHVyZWRDbG9uaW5nXCJcbiAqICAgfFwiYXJiaXRyYXJ5SlNcInxcInNjaGVtYVwifSBBdmFpbGFibGVGb3JtYXRcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHR5cGVzOiAoaW1wb3J0KCcuL3R5cGVzLmpzJykuQXZhaWxhYmxlQXJiaXRyYXJ5VHlwZSlbXSxcbiAqICAgc2NoZW1hT2JqZWN0czogaW1wb3J0KCcuL2Zvcm1hdHMvc2NoZW1hLmpzJykuWm9kZXh5U2NoZW1hW11cbiAqIH19IFR5cGVzQW5kU2NoZW1hT2JqZWN0c1xuICovXG5cbi8qKlxuICogUmVzcG9uc2libGUgZm9yIHRyYXZlcnNpbmcgb3ZlciBkYXRhIChhbG9uZyB3aXRoIHN0YXRlIGluZm9ybWF0aW9uKSB0byBidWlsZFxuICogICBhbmQgcmV0dXJuIGEgcmVsZXZhbnQgVUkgZWxlbWVudC5cbiAqIEBjYWxsYmFjayBGb3JtYXRJdGVyYXRvclxuICogQHBhcmFtIHtTdHJ1Y3R1cmVkQ2xvbmVWYWx1ZX0gcmVjb3Jkc1xuICogQHBhcmFtIHtpbXBvcnQoJy4vdHlwZXMuanMnKS5TdGF0ZU9iamVjdH0gc3RhdGVPYmpcbiAqIEByZXR1cm5zIHtQcm9taXNlPFJlcXVpcmVkPGltcG9ydCgnLi90eXBlcy5qcycpLlN0YXRlT2JqZWN0Pj59XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBGb3JtYXRcbiAqIEBwcm9wZXJ0eSB7KCkgPT4gKFxuICogICBpbXBvcnQoJy4vdHlwZXMuanMnKS5BdmFpbGFibGVBcmJpdHJhcnlUeXBlXG4gKiApW119IHR5cGVzIFJldHVybnMgbGlzdFxuICogICBvZiB0eXBlcyBnZW5lcmFsbHkgYXZhaWxhYmxlIHRvIHN0cnVjdHVyZWQgY2xvbmluZy4gU2VlXG4gKiAgIHtAbGluayBnZXRUeXBlc0FuZFNjaGVtYXNGb3JTdGF0ZX0gZm9yIGNvbnRleHQtZGVwZW5kZW50IG1ldGhvZC5cbiAqIEBwcm9wZXJ0eSB7Rm9ybWF0SXRlcmF0b3J9IGl0ZXJhdGUgVHJhdmVyc2VzIG92ZXIgZGF0YSB0byBidWlsZCBhbmQgcmV0dXJuXG4gKiAgIGEgcmVsZXZhbnQgVUkgZWxlbWVudC5cbiAqIEBwcm9wZXJ0eSB7KFxuICogICB0eXBlczogaW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdCxcbiAqICAgc3RhdGU/OiBzdHJpbmcsXG4gKiAgIHNjaGVtYU9iamVjdD86IGltcG9ydCgnLi9mb3JtYXRBbmRUeXBlQ2hvaWNlcy5qcycpLlpvZGV4eVNjaGVtYXxcbiAqICAgICB1bmRlZmluZWQsXG4gKiAgIHNjaGVtYU9yaWdpbmFsPzogaW1wb3J0KCcuL2Zvcm1hdEFuZFR5cGVDaG9pY2VzLmpzJykuWm9kZXh5U2NoZW1hfFxuICogICAgIHVuZGVmaW5lZFxuICogKSA9PiBUeXBlc0FuZFNjaGVtYU9iamVjdHN8dW5kZWZpbmVkfSBnZXRUeXBlc0FuZFNjaGVtYXNGb3JTdGF0ZSBHZXRzIHRoZVxuICogICBzcGVjaWZpYyB0eXBlcyAoYW5kIHNjaGVtYXMpIHJlbGV2YW50IHRvIGEgZ2l2ZW4gc3RhdGUuXG4gKiBAcHJvcGVydHkgeyhcbiAqICAgICBuZXdUeXBlOiBzdHJpbmcsIHZhbHVlOiBEYXRlfEFycmF5PFN0cnVjdHVyZWRDbG9uZVZhbHVlPlxuICogICApID0+IGJvb2xlYW58dW5kZWZpbmVkfSBbdGVzdEludmFsaWRdXG4gKiBAcHJvcGVydHkgeyhcbiAqICAgdHlwZXNvblR5cGU6IGltcG9ydCgnLi90eXBlcy5qcycpLkF2YWlsYWJsZUFyYml0cmFyeVR5cGUsXG4gKiAgIHR5cGVzOiBpbXBvcnQoJy4vdHlwZXMuanMnKS5kZWZhdWx0LFxuICogICB2PzogaW1wb3J0KCcuL2Zvcm1hdHMuanMnKS5TdHJ1Y3R1cmVkQ2xvbmVWYWx1ZSxcbiAqICAgYXJyYXlPck9iamVjdFByb3BlcnR5TmFtZT86IHN0cmluZyxcbiAqICAgcGFyZW50U2NoZW1hPzogW1xuICogICAgIGltcG9ydCgnem9kZXh5JykuU3pUeXBlLFxuICogICAgIG51bWJlcnx1bmRlZmluZWRcbiAqICAgXXx1bmRlZmluZWQsXG4gKiAgIHN0YXRlT2JqPzogaW1wb3J0KCcuL3R5cGVzLmpzJykuU3RhdGVPYmplY3QsXG4gKiApID0+IHtcbiAqICAgdHlwZTogaW1wb3J0KCcuL3R5cGVzLmpzJykuQXZhaWxhYmxlQXJiaXRyYXJ5VHlwZXx1bmRlZmluZWRcbiAqICAgc2NoZW1hPzogaW1wb3J0KCd6b2RleHknKS5TelR5cGV8dW5kZWZpbmVkLFxuICogICBtdXN0QmVPcHRpb25hbD86IGJvb2xlYW4sXG4gKiAgIHNjaGVtYUlkeD86IG51bWJlclxuICogfX0gW2NvbnZlcnRGcm9tVHlwZXNvbl1cbiAqIEBwcm9wZXJ0eSB7KFxuICogICB0eXBlczogaW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdCxcbiAqICAgc2NoZW1hT2JqZWN0OiBpbXBvcnQoJy4vZm9ybWF0QW5kVHlwZUNob2ljZXMuanMnKS5ab2RleHlTY2hlbWEsXG4gKiAgIHZhbHVlOiBTdHJ1Y3R1cmVkQ2xvbmVWYWx1ZVxuICogKSA9PiB7dmFsaWQ6IGJvb2xlYW4sIG1lc3NhZ2U/OiBzdHJpbmcsXG4gKiAgIHNjaGVtYT86IGltcG9ydCgnLi9mb3JtYXRzL3NjaGVtYS5qcycpLlpvZGV4eVNjaGVtYX19IFt2YWxpZGF0ZVZhbHVlXVxuICogQHByb3BlcnR5IHsoXG4gKiAgIHNjaGVtYU9iamVjdDogaW1wb3J0KCcuL2Zvcm1hdHMvc2NoZW1hLmpzJykuWm9kZXh5U2NoZW1hXG4gKiApID0+IGJvb2xlYW59IFtpc1ZhbHVlVmFsaWRhdGlvblJlcXVpcmVkXVxuICovXG5cbi8qKlxuICogQ2xhc3MgZm9yIHByb2Nlc3NpbmcgbXVsdGlwbGUgZm9ybWF0cy5cbiAqL1xuY2xhc3MgRm9ybWF0cyB7XG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENhbiBlbmFibGUgbGF0ZXIgKGFuZCBhZGQgdGVzdHMpXG4gICAgLy8gaWYgKGZvcm1hdHMpIHtcbiAgICAvLyAgIHRoaXMuYXZhaWxhYmxlRm9ybWF0cyA9IHt9O1xuICAgIC8vICAgZm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAvLyAgICAgbGV0IGZvcm1hdFZhbHVlO1xuICAgIC8vICAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIC8vICAgICBjYXNlICdpbmRleGVkREJLZXknOlxuICAgIC8vICAgICAgIGZvcm1hdFZhbHVlID0gaW5kZXhlZERCS2V5O1xuICAgIC8vICAgICAgIGJyZWFrO1xuICAgIC8vICAgICBjYXNlICdqc29uJzpcbiAgICAvLyAgICAgICBmb3JtYXRWYWx1ZSA9IGpzb247XG4gICAgLy8gICAgICAgYnJlYWs7XG4gICAgLy8gICAgIGNhc2UgJ3N0cnVjdHVyZWRDbG9uaW5nJzpcbiAgICAvLyAgICAgICBmb3JtYXRWYWx1ZSA9IHN0cnVjdHVyZWRDbG9uaW5nO1xuICAgIC8vICAgICAgIGJyZWFrO1xuICAgIC8vICAgICBjYXNlICdhcmJpdHJhcnlKUyc6XG4gICAgLy8gICAgICAgZm9ybWF0VmFsdWUgPSBhcmJpdHJhcnlKUztcbiAgICAvLyAgICAgICBicmVhaztcbiAgICAvLyAgICAgZGVmYXVsdDpcbiAgICAvLyAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZm9ybWF0Jyk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgdGhpcy5hdmFpbGFibGVGb3JtYXRzW2Zvcm1hdF0gPSBmb3JtYXRWYWx1ZTtcbiAgICAvLyAgIH0pO1xuICAgIC8vICAgcmV0dXJuO1xuICAgIC8vIH1cbiAgICAvLyBVc2luZyBtZXRob2RzIGVuc3VyZSB3ZSBoYXZlIGZyZXNoIGNvcGllc1xuICAgIHRoaXMuYXZhaWxhYmxlRm9ybWF0cyA9IC8qKiBAdHlwZSB7e1trZXk6IHN0cmluZ106IEZvcm1hdH19ICovICh7XG4gICAgICBpbmRleGVkREJLZXksXG4gICAgICBqc29uLFxuICAgICAgc3RydWN0dXJlZENsb25pbmcsXG4gICAgICBhcmJpdHJhcnlKUyxcbiAgICAgIHNjaGVtYVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7aW1wb3J0KCcuL3R5cGVzLmpzJykuZGVmYXVsdH0gdHlwZXNcbiAgICogQHBhcmFtIHtBdmFpbGFibGVGb3JtYXR9IGZvcm1hdFxuICAgKiBAcGFyYW0ge1N0cnVjdHVyZWRDbG9uZVZhbHVlfSByZWNvcmRcbiAgICogQHBhcmFtIHtpbXBvcnQoJy4vdHlwZXMuanMnKS5TdGF0ZU9iamVjdH0gW3N0YXRlT2JqXVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxSZXF1aXJlZDxpbXBvcnQoJy4vdHlwZXMuanMnKS5TdGF0ZU9iamVjdD4+fVxuICAgKi9cbiAgYXN5bmMgZ2V0Q29udHJvbHNGb3JGb3JtYXRBbmRWYWx1ZSAodHlwZXMsIGZvcm1hdCwgcmVjb3JkLCBzdGF0ZU9iaikge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmF2YWlsYWJsZUZvcm1hdHNbZm9ybWF0XS5cbiAgICAgIGl0ZXJhdGUocmVjb3JkLCB7XG4gICAgICAgIC4uLnN0YXRlT2JqLFxuICAgICAgICB0eXBlcyxcbiAgICAgICAgZm9ybWF0czogdGhpcyxcbiAgICAgICAgLy8gVGhpcyBoYWQgYmVlbiBiZWZvcmUgYHN0YXRlT2JqYCBidXQgc2hvdWxkIGFwcGFyZW50bHkgaGF2ZSBwcmVjZWRlbmNlXG4gICAgICAgIC8vICAgb3IganVzdCBhdm9pZCBwYXNzaW5nIGBmb3JtYXRgIHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgZm9ybWF0XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7R2V0VHlwZXNBbmRTY2hlbWFzRm9yRm9ybWF0QW5kU3RhdGV9XG4gICAqL1xuICBnZXRUeXBlc0FuZFNjaGVtYXNGb3JGb3JtYXRBbmRTdGF0ZSAoXG4gICAgdHlwZXMsIGZvcm1hdCwgc3RhdGUsIHNjaGVtYU9iamVjdCwgc2NoZW1hT3JpZ2luYWxcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuYXZhaWxhYmxlRm9ybWF0c1tmb3JtYXRdLmdldFR5cGVzQW5kU2NoZW1hc0ZvclN0YXRlKFxuICAgICAgdHlwZXMsIHN0YXRlLCBzY2hlbWFPYmplY3QsIHNjaGVtYU9yaWdpbmFsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0F2YWlsYWJsZUZvcm1hdH0gZm9ybWF0XG4gICAqIEByZXR1cm5zIHtGb3JtYXR9XG4gICAqL1xuICBnZXRBdmFpbGFibGVGb3JtYXQgKGZvcm1hdCkge1xuICAgIHJldHVybiB0aGlzLmF2YWlsYWJsZUZvcm1hdHNbZm9ybWF0XTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGb3JtYXRzO1xuIl0sIm1hcHBpbmdzIjoibzVDQWVZO0FBQUFBLGNBQUEs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