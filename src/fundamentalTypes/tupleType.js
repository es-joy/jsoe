import arrayType from './arrayType.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const tupleType = {
  option: ['Tuple'],
  array: true,
  regexEndings: [',', ']'],
  stringRegexBegin: /^Tuple\[/u,
  stringRegexEnd: /^\]/u,
  tuple: true,
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
      ...args, type: 'array'
    });
  }
};

export default tupleType;
