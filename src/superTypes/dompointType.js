import {$e} from '../utils/templateUtils.js';
import {toStringTag} from '../vendor-imports.js';

let idx = 0;

/**
 * @type {import('../types.js').SuperTypeObject}
 */
const dompointType = {
  option: ['DOMPoint'],
  childTypes: ['dompointreadonly'],
  stringRegex: /^(?<domPointClass>DOMPoint|DOMPointReadOnly)\((?<innerContent>.*)\)$/u,
  valueMatch (x) {
    return ['DOMPoint', 'DOMPointReadOnly'].includes(toStringTag(x));
  },
  toValue (s, rootInfo) {
    /* istanbul ignore next -- Should always be found */
    const {groups: {
      domPointClass
    /* istanbul ignore next -- Should always be found */
    } = {}} = /** @type {RegExpMatchArray} */ (
      /** @type {import('../types.js').RootInfo} */ (rootInfo).match
    );
    const {x, y, z, w} = JSON.parse(s);
    return {value: new (
      domPointClass === 'DOMPoint' ? DOMPoint : DOMPointReadOnly
    )(x, y, z, w)};
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  setValue ({root, value}) {
    /** @type {HTMLInputElement} */ (
      $e(root, '.x')
    ).value = String(value.x);
    /** @type {HTMLInputElement} */ (
      $e(root, '.y')
    ).value = String(value.y);
    /** @type {HTMLInputElement} */ (
      $e(root, '.z')
    ).value = String(value.z);
    /** @type {HTMLInputElement} */ (
      $e(root, '.w')
    ).value = String(value.w);

    if (toStringTag(value) === 'DOMPoint') {
      /** @type {HTMLInputElement} */ (
        $e(root, '.dompoint-readonly-readwrite')
      ).checked = true;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, '.dompoint-readonly-readonly')
      ).checked = true;
    }
  },
  getValue ({root}) {
    const x = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.x')
    ).value);
    const y = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.y')
    ).value);
    const z = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.z')
    ).value);
    const w = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.w')
    ).value);

    const isReadWrite = /** @type {HTMLInputElement} */ (
      $e(root, '.dompoint-readonly-readwrite')
    ).checked;
    return new (isReadWrite ? DOMPoint : DOMPointReadOnly)(x, y, z, w);
  },
  viewUI ({value, specificSchemaObject}) {
    const isReadWrite = toStringTag(value) === 'DOMPoint';
    return ['div', {
      dataset: {type: 'dompoint'},
      title: specificSchemaObject?.description
        ? `(a \`${(isReadWrite ? 'DOMPoint' : 'DOMPointReadOnly')}\`)`
        : undefined
    }, [
      ['b', {class: 'emphasis'}, [
        specificSchemaObject?.description ??
          (isReadWrite ? 'DOMPoint' : 'DOMPointReadOnly')
      ]],
      ['br'],
      ['b', ['x ']],
      value.x,
      ['br'],
      ['b', ['y ']],
      value.y,
      ['br'],
      ['b', ['z ']],
      value.z,
      ['br'],
      ['b', ['w ']],
      value.w
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value = {
    x: '',
    y: '',
    z: '',
    w: ''
  }}) {
    idx++;
    const step = 'any'; // Proper step?
    return ['div', {
      dataset: {type: 'dompoint'},
      title: specificSchemaObject?.description ?? 'DOMPoint'
    }, [
      ['div', [
        ['label', [
          ['input', {
            type: 'radio',
            class: 'dompoint-readonly-readwrite',
            name: `${typeNamespace}-dompoint-readonly-${idx}`,
            value: 'readwrite',
            checked: toStringTag(value) !== 'DOMPointReadOnly'
          }],
          'Readwrite'
        ]],
        ' ',
        ['label', [
          ['input', {
            type: 'radio',
            class: 'dompoint-readonly-readonly',
            name: `${typeNamespace}-dompoint-readonly-${idx}`,
            value: 'readonly',
            checked: toStringTag(value) === 'DOMPointReadOnly'
          }],
          'Read-only'
        ]]
      ]],
      ['label', [
        'x: ',
        ['input', {
          type: 'number',
          step,
          class: 'x',
          name: `${typeNamespace}-dompoint-x`, value: value.x
        }]
      ]],
      ['br'],
      ['label', [
        'y: ',
        ['input', {
          type: 'number',
          step,
          class: 'y',
          name: `${typeNamespace}-dompoint-y`, value: value.y
        }]
      ]],
      ['br'],
      ['label', [
        'z: ',
        ['input', {
          type: 'number',
          step,
          class: 'z',
          name: `${typeNamespace}-dompoint-z`, value: value.z
        }]
      ]],
      ['br'],
      ['label', [
        'w: ',
        ['input', {
          type: 'number',
          step,
          class: 'w',
          name: `${typeNamespace}-dompoint-w`, value: value.w
        }]
      ]]
    ]];
  }
};

export default dompointType;
