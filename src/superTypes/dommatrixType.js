import {$e} from '../utils/templateUtils.js';
import {toStringTag} from '../vendor-imports.js';

let idx = 0;

/**
 * @type {import('../types.js').SuperTypeObject}
 */
const dommatrixType = {
  option: ['DOMMatrix'],
  childTypes: ['dommatrixreadonly'],
  stringRegex: /^(?<domMatrixClass>DOMMatrix|DOMMatrixReadOnly)\((?<innerContent>.*)\)$/u,
  valueMatch (x) {
    return ['DOMMatrix', 'DOMMatrixReadOnly'].includes(toStringTag(x));
  },
  toValue (s, rootInfo) {
    /* istanbul ignore next -- Should always be found */
    const {groups: {
      domMatrixClass
    /* istanbul ignore next -- Should always be found */
    } = {}} = /** @type {RegExpMatchArray} */ (
      /** @type {import('../types.js').RootInfo} */ (rootInfo).match
    );
    const o = JSON.parse(s);

    const DOMMatrixClass = domMatrixClass === 'DOMMatrix'
      ? DOMMatrix
      : DOMMatrixReadOnly;

    const dommatrix = Object.hasOwn(o, 'a')
      ? new DOMMatrixClass([o.a, o.b, o.c, o.d, o.e, o.f])
      : new DOMMatrixClass([
        o.m11, o.m12, o.m13, o.m14,
        o.m21, o.m22, o.m23, o.m24,
        o.m31, o.m32, o.m33, o.m34,
        o.m41, o.m42, o.m43, o.m44
      ]);

    return {value: dommatrix};
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  setValue ({root, value: o}) {
    const {is2D} = o;
    /** @type {HTMLInputElement} */ ($e(root, '.d2')).checked = is2D;
    /** @type {HTMLInputElement} */ ($e(root, '.d3')).checked = !is2D;

    /** @type {HTMLDivElement} */ (
      $e(root, '.holder2d')
    ).hidden = /** @type {HTMLInputElement} */ !is2D;
    /** @type {HTMLDivElement} */ (
      $e(root, '.holder3d')
    ).hidden = /** @type {HTMLInputElement} */ is2D;

    if (is2D) {
      /** @type {HTMLInputElement} */ (
        $e(root, '.a')
      ).value = o.a;
      /** @type {HTMLInputElement} */ (
        $e(root, '.b')
      ).value = o.b;
      /** @type {HTMLInputElement} */ (
        $e(root, '.c')
      ).value = o.c;
      /** @type {HTMLInputElement} */ (
        $e(root, '.d')
      ).value = o.d;
      /** @type {HTMLInputElement} */ (
        $e(root, '.e')
      ).value = o.e;
      /** @type {HTMLInputElement} */ (
        $e(root, '.f')
      ).value = o.f;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, '.m11')
      ).value = o.m11;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m12')
      ).value = o.m12;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m13')
      ).value = o.m13;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m14')
      ).value = o.m14;

      /** @type {HTMLInputElement} */ (
        $e(root, '.m21')
      ).value = o.m21;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m22')
      ).value = o.m22;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m23')
      ).value = o.m23;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m24')
      ).value = o.m24;

      /** @type {HTMLInputElement} */ (
        $e(root, '.m31')
      ).value = o.m31;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m32')
      ).value = o.m32;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m33')
      ).value = o.m33;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m34')
      ).value = o.m34;

      /** @type {HTMLInputElement} */ (
        $e(root, '.m41')
      ).value = o.m41;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m42')
      ).value = o.m42;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m43')
      ).value = o.m43;
      /** @type {HTMLInputElement} */ (
        $e(root, '.m44')
      ).value = o.m44;
    }

    if (toStringTag(o) === 'DOMMatrix') {
      /** @type {HTMLInputElement} */ (
        $e(root, '.dommatrix-readonly-readwrite')
      ).checked = true;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, '.dommatrix-readonly-readonly')
      ).checked = true;
    }
  },
  getValue ({root}) {
    const isReadWrite = /** @type {HTMLInputElement} */ (
      $e(root, '.dommatrix-readonly-readwrite')
    ).checked;
    const DOMMatrixClass = isReadWrite ? DOMMatrix : DOMMatrixReadOnly;

    const aType = /** @type {HTMLInputElement} */ (
      $e(root, '.a')
    ).value;

    if (aType) {
      const a = Number(aType);
      const b = Number(/** @type {HTMLInputElement} */ (
        $e(root, '.b')
      ).value);
      const c = Number(/** @type {HTMLInputElement} */ (
        $e(root, '.c')
      ).value);
      const d = Number(/** @type {HTMLInputElement} */ (
        $e(root, '.d')
      ).value);
      const e = Number(/** @type {HTMLInputElement} */ (
        $e(root, '.e')
      ).value);
      const f = Number(/** @type {HTMLInputElement} */ (
        $e(root, '.f')
      ).value);
      return new DOMMatrixClass([a, b, c, d, e, f]);
    }

    const m11 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m11')
    ).value);
    const m12 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m12')
    ).value);
    const m13 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m13')
    ).value);
    const m14 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m14')
    ).value);

    const m21 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m21')
    ).value);
    const m22 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m22')
    ).value);
    const m23 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m23')
    ).value);
    const m24 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m24')
    ).value);

    const m31 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m31')
    ).value);
    const m32 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m32')
    ).value);
    const m33 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m33')
    ).value);
    const m34 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m34')
    ).value);

    const m41 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m41')
    ).value);
    const m42 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m42')
    ).value);
    const m43 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m43')
    ).value);
    const m44 = Number(/** @type {HTMLInputElement} */ (
      $e(root, '.m44')
    ).value);

    return new DOMMatrixClass([
      m11, m12, m13, m14,
      m21, m22, m23, m24,
      m31, m32, m33, m34,
      m41, m42, m43, m44
    ]);
  },
  viewUI ({value, specificSchemaObject}) {
    const isReadWrite = toStringTag(value) === 'DOMMatrix';
    return ['div', {dataset: {type: 'dommatrix'}}, [
      ['b', {
        class: 'emphasis',
        title: specificSchemaObject?.description
          ? `(a \`${(isReadWrite ? 'DOMMatrix' : 'DOMMatrixReadOnly')}\`)`
          : undefined
      }, [
        specificSchemaObject?.description ??
          (isReadWrite ? 'DOMMatrix' : 'DOMMatrixReadOnly')
      ]],
      value.is2D
        ? ['div', [
          ['b', ['a ']],
          value.a,
          ['br'],
          ['b', ['b ']],
          value.b,
          ['br'],
          ['b', ['c ']],
          value.c,
          ['br'],
          ['b', ['d ']],
          value.d,
          ['br'],
          ['b', ['e ']],
          value.e,
          ['br'],
          ['b', ['f ']],
          value.f
        ]]
        : ['div', [
          ['b', ['m11 ']],
          value.m11,
          ['br'],
          ['b', ['m12 ']],
          value.m12,
          ['br'],
          ['b', ['m13 ']],
          value.m13,
          ['br'],
          ['b', ['m14 ']],
          value.m14,
          ['br'],

          ['b', ['m21 ']],
          value.m21,
          ['br'],
          ['b', ['m22 ']],
          value.m22,
          ['br'],
          ['b', ['m23 ']],
          value.m23,
          ['br'],
          ['b', ['m24 ']],
          value.m24,
          ['br'],

          ['b', ['m31 ']],
          value.m31,
          ['br'],
          ['b', ['m32 ']],
          value.m32,
          ['br'],
          ['b', ['m33 ']],
          value.m33,
          ['br'],
          ['b', ['m34 ']],
          value.m34,
          ['br'],

          ['b', ['m41 ']],
          value.m41,
          ['br'],
          ['b', ['m42 ']],
          value.m42,
          ['br'],
          ['b', ['m43 ']],
          value.m43,
          ['br'],
          ['b', ['m44 ']],
          value.m44
        ]]
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value = {}}) {
    idx++;
    const {is2D} = value;
    const step = 'any'; // Proper step?

    return ['div', {
      dataset: {type: 'dommatrix'},
      title: specificSchemaObject?.description ?? 'DOMMatrix'
    }, [
      ['div', [
        ['label', [
          ['input', {
            type: 'radio',
            class: 'dommatrix-readonly-readwrite',
            name: `${typeNamespace}-dommatrix-readonly-${idx}`,
            value: 'readwrite',
            checked: toStringTag(value) !== 'DOMMatrixReadOnly'
          }],
          'Readwrite'
        ]],
        ' ',
        ['label', [
          ['input', {
            type: 'radio',
            class: 'dommatrix-readonly-readonly',
            name: `${typeNamespace}-dommatrix-readonly-${idx}`,
            value: 'readonly',
            checked: toStringTag(value) === 'DOMMatrixReadOnly'
          }],
          'Read-only'
        ]]
      ]],
      ['div', {
        $on: {
          click (e) {
            const {target} = e;
            /* istanbul ignore if */
            if (/** @type {HTMLInputElement} */ (target).type !== 'radio') {
              return;
            }
            const parent = /** @type {HTMLDivElement} */ (this.parentElement);
            /** @type {HTMLDivElement} */ (
              $e(parent, '.holder2d')
            ).hidden = /** @type {HTMLInputElement} */ (target).value === '3d';
            /** @type {HTMLDivElement} */ (
              $e(parent, '.holder3d')
            ).hidden = /** @type {HTMLInputElement} */ (target).value === '2d';
          }
        }
      }, [
        ['label', [
          '2d',
          ['input', {
            class: 'd2',
            type: 'radio', name: `${typeNamespace}-dommatrix-dimension-${idx}`,
            value: '2d',
            checked: Boolean(is2D)
          }]
        ]],
        ' ',
        ['label', [
          '3d',
          ['input', {
            class: 'd3',
            type: 'radio', name: `${typeNamespace}-dommatrix-dimension-${idx}`,
            value: '3d',
            checked: !is2D
          }]
        ]]
      ]],
      ['div', {
        class: 'holder2d',
        hidden: !is2D
      }, (['a', 'b', 'c', 'd', 'e', 'f'].flatMap((label) => {
        return [
          ['br'],
          ['label', [
            label + ': ',
            ['input', {
              type: 'number',
              step,
              class: label,
              name: `${typeNamespace}-dommatrix-${label}`,
              value: value[label] ?? ''
            }]
          ]]
        ];
      })).slice(1)],
      ['div', {
        class: 'holder3d',
        hidden: Boolean(is2D)
      }, ([
        'm11', 'm12', 'm13', 'm14',
        'm21', 'm22', 'm23', 'm24',
        'm31', 'm32', 'm33', 'm34',
        'm41', 'm42', 'm43', 'm44'
      ].flatMap((label) => {
        return [
          ['br'],
          ['label', [
            label + ': ',
            ['input', {
              type: 'number',
              step,
              class: label,
              name: `${typeNamespace}-dommatrix-${label}`,
              value: value[label] ?? ''
            }]
          ]]
        ];
      })).slice(1)]
    ]];
  }
};

export default dommatrixType;
