import arrayType from './arrayType.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const recordType = {
  option: ['Record'],
  regexEndings: [',', '}'],
  stringRegexBegin: /^Record\{/u,
  stringRegexEnd: /^\}/u,
  record: true,
  toValue (...args) {
    return /** @type {import('../types.js').ToValue} */ (
      arrayType.toValue
    ).apply(this, args);
  },
  getValue (...args) {
    return arrayType.getValue.apply(this, args);
  },
  getInput (...args) {
    return arrayType.getInput.apply(this, args);
  },
  viewUI (...args) {
    return arrayType.viewUI.apply(this, args);
  },
  editUI ({...args}) {
    return arrayType.editUI.call(this, {
      ...args, type: 'object'
    });
  }
};

export default recordType;
