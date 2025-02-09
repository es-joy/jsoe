import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const neverType = {
  stringRegex: /^never$/u,
  option: ['Never'],
  /* istanbul ignore next -- Back-up in case shows */
  valueMatch () {
    /* istanbul ignore next -- Back-up in case shows */
    return false;
  },
  toValue (/* _s */) {
    throw new Error('Cannot convert to value');
  },
  getValue () {
    return /** @type {import('../types.js').ToValue} */ (
      this.toValue
    )('');
  },
  /* istanbul ignore next -- Back-up in case shows */
  viewUI ({specificSchemaObject}) {
    /* istanbul ignore next -- Back-up in case shows */
    return ['i', {
      dataset: {type: 'never'},
      title: specificSchemaObject?.description ?? '(a `never`)'
    }, ['never']];
  },
  /* istanbul ignore next -- No dupe keys, array refs, or validation */
  getInput ({root}) {
    /* istanbul ignore next -- Back-up in case shows */
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  editUI ({typeNamespace}) {
    return ['div', {dataset: {type: 'never'}}, [
      ['label', [
        'Never (no value present here)',
        ['input', {
          type: 'checkbox',
          name: `${typeNamespace}-never`,
          hidden: true
        }]
      ]]
    ]];
  }
};

export default neverType;
