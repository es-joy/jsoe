import {$e, $$e} from '../utils/templateUtils.js';
import {jml, toStringTag} from '../vendor-imports.js';
import dialogs from '../utils/dialogs.js';

/**
 * Integer value of a numeric form field, matching the `parseInt` behavior this
 *   replaced: a blank field is `NaN` (so comparisons against it stay false),
 *   not `0` as `Number('')` / `Math.trunc(Number(''))` would give.
 * @param {string} str
 */
const toInteger = (str) => {
  if (str.trim() === '') {
    return NaN;
  }
  return Math.trunc(Number(str));
};

const dataViewMethods = /** @type {const} */ ([
  'setInt8',
  'setUint8',
  'setInt16',
  'setUint16',
  'setInt32',
  'setUint32',
  'setFloat32',
  'setFloat64',
  'setBigInt64',
  'setBigUint64'
]);

const typedArrays = /** @type {const} */ ([
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
  'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
  'Float64Array', 'BigInt64Array', 'BigUint64Array'
]);

/**
 * @param {TypedArray} typedArray
 * @returns {{min: number, max: number}}
 */
const getMinMaxForTypedArray = (typedArray) => {
  switch (typedArray) {
  case 'Int8Array':
    return {min: -128, max: 127};
  case 'Uint8Array':
    return {min: 0, max: 255};
  case 'Uint8ClampedArray':
    return {min: 0, max: 255};
  case 'Int16Array':
    return {min: -32768, max: 32767};
  case 'Uint16Array':
    return {min: 0, max: 65535};
  case 'Int32Array':
    return {min: -2147483648, max: 2147483647};
  case 'Uint32Array':
    return {min: 0, max: 4294967295};
  case 'Float32Array':
    return {min: -3.4e38, max: 3.4e38};
  case 'Float64Array':
    // eslint-disable-next-line no-loss-of-precision -- Inevitable?
    return {min: -1.8e308, max: 1.8e308};
  case 'BigInt64Array':
    return {min: -(2 ** 63), max: (2 ** 63) - 1};
  case 'BigUint64Array':
    return {min: 0, max: (2 ** 64) - 1};
  /* istanbul ignore next -- Guard */
  default:
    /* istanbul ignore next -- Guard */
    throw new Error('Unexpected typed array type');
  }
};

/**
 * @typedef {"Int8Array"|"Uint8Array"|"Uint8ClampedArray"|
 *   "Int16Array"|"Uint16Array"|"Int32Array"|"Uint32Array"|
 *   "Float32Array"|"Float64Array"|"BigInt64Array"|
 *   "BigUint64Array"} TypedArray
 */

/**
 * @typedef {Int8Array|Uint8Array|Uint8ClampedArray|
 *   Int16Array|Uint16Array|Int32Array|Uint32Array|
 *   Float32Array|Float64Array|BigInt64Array|
 *   BigUint64Array} TypedArrayInstance
 */

/**
 * @param {TypedArray} prop
 * @returns {Int8ArrayConstructor|Uint8ArrayConstructor|
 *   Uint8ClampedArrayConstructor|Int16ArrayConstructor|
 *   Uint16ArrayConstructor|Int32ArrayConstructor|Uint32ArrayConstructor|
 *   Float32ArrayConstructor|Float64ArrayConstructor|
 *   BigInt64ArrayConstructor|BigUint64ArrayConstructor}
 */
const getTypedArray = (prop) => {
  switch (prop) {
  case 'Int8Array':
    return Int8Array;
  case 'Uint8Array':
    return Uint8Array;
  case 'Uint8ClampedArray':
    return Uint8ClampedArray;
  case 'Int16Array':
    return Int16Array;
  case 'Uint16Array':
    return Uint16Array;
  case 'Int32Array':
    return Int32Array;
  case 'Uint32Array':
    return Uint32Array;
  case 'Float32Array':
    return Float32Array;
  case 'Float64Array':
    return Float64Array;
  case 'BigInt64Array':
    return BigInt64Array;
  case 'BigUint64Array':
    return BigUint64Array;
  /* istanbul ignore next -- Guard */
  default:
    /* istanbul ignore next -- Guard */
    throw new Error('Unexpected type');
  }
};

const bufferSourceClasses = new Set([
  'ArrayBuffer', 'DataView',
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
  'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array',
  'BigUint64Array'
]);

let idx = 0;

/**
 * @type {import('../types.js').SuperTypeObject}
 */
const buffersourceType = {
  option: ['Buffer source (ArrayBuffer, DataView, TypedArrays)'],
  childTypes: [
    'arraybuffer',
    'dataview',
    'int8array', 'uint8array', 'uint8clampedarray', 'int16array',
    'uint16array', 'int32array', 'uint32array', 'float32array',
    'float64array', 'bigint64array', 'biguint64array'
  ],
  stringRegex: /^(?<bufferSourceClass>ArrayBuffer|DataView|(?:Int8|Uint8|Uint8Clamped|Int16|Uint16|Int32|Uint32|Float32|Float64|BigInt64|BigUint64)Array)\((?<innerContent>.*)\)$/u,
  valueMatch (x) {
    return bufferSourceClasses.has(toStringTag(x));
  },
  toValue (s, rootInfo) {
    /* istanbul ignore next -- Should always be found */
    const {groups: {
      bufferSourceClass
    /* istanbul ignore next -- Should always be found */
    } = {}} = /** @type {RegExpMatchArray} */ (
      /** @type {import('../types.js').RootInfo} */ (rootInfo).match
    );

    const o = JSON.parse(s);
    const {
      byteLength, maxByteLength, byteOffset,
      dataViewByteOffset,
      dataViewByteLength, length
    } = o;
    // @ts-expect-error Ok
    const buffer = new ArrayBuffer(byteLength, {maxByteLength});

    let typedArray, TypedArray;
    if (bufferSourceClass.endsWith('Array') || 'typedArray' in o) {
      TypedArray = getTypedArray(
        /** @type {TypedArray} */ (o.typedArray ?? bufferSourceClass)
      );

      typedArray = new TypedArray(buffer, byteOffset, length);

      if ('set' in o) {
        o.set[0].forEach(
          /**
           * @param {string} s
           * @param {number} i
           * @returns {void}
           */
          (s, i) => {
            if (typeof s === 'string') {
              o.set[0][i] = BigInt(s);
            }
          }
        );
        typedArray.set(...(
          /**
           * @type {[
           *   array: Array<bigint> & Array<number>,
           *   offset?: number | undefined
           * ]}
           */ (o.set)));
      }
    }

    /** @type {DataView|undefined} */
    let view;
    if (bufferSourceClass === 'DataView' || dataViewMethods.some((method) => {
      return Object.hasOwn(o, method);
    })) {
      view = new DataView(buffer, dataViewByteOffset, dataViewByteLength);
      dataViewMethods.forEach((prop) => {
        o[prop]?.forEach(
          /**
           * @type {(info: [
           *   byteOffset: number,
           *   value: bigint|number,
           *   littleEndian?: boolean|undefined
           * ]) => void}
           */
          (vals) => {
            if (typeof vals[1] === 'string') {
              vals[1] = BigInt(vals[1]);
            }
            // @ts-expect-error It's ok
            view[prop](...vals);
          }
        );
      });
    }
    return {
      value: bufferSourceClass === 'ArrayBuffer'
        ? buffer
        : bufferSourceClass === 'DataView'
          ? view
          : typedArray
    };
  },
  getInput ({root}) {
    const byteLength =
      /**
       * @type {HTMLInputElement & {
       *   $value: BufferSource
       * }}
       */ ($e(root, '.byteLength'));
    return byteLength;
  },
  setValue ({root, value}) {
    const stringTag = toStringTag(value);
    if (stringTag === 'ArrayBuffer' || stringTag === 'DataView') {
      $e(root, `[value=${stringTag}].buffersource-returnType`)?.click();
    } else {
      $e(root, `[value=TypedArray].buffersource-returnType`)?.click();
      const typedArrays = /** @type {HTMLSelectElement} */ (
        $e(root, '.buffersource-typedArrays')
      );
      typedArrays.value = stringTag;
      typedArrays.dispatchEvent(new Event('change'));
    }

    const byteLength =
      /**
       * @type {HTMLInputElement & {
       *   $value: BufferSource
       * }}
       */ ($e(root, '.byteLength'));

    byteLength.$value = value;

    const buffer = stringTag === 'ArrayBuffer' ? value : value.buffer;
    byteLength.value = buffer.byteLength;
    byteLength.dispatchEvent(new Event('change'));

    const maxByteLength = /** @type {HTMLInputElement} */ (
      $e(root, '.maxByteLength')
    );
    maxByteLength.value = buffer.maxByteLength;
    maxByteLength.dispatchEvent(new Event('change'));

    if (stringTag === 'DataView') {
      const dataViewByteLength = /** @type {HTMLInputElement} */ (
        $e(root, '.dataViewByteLength')
      );
      dataViewByteLength.value = value.byteLength;
      dataViewByteLength.dispatchEvent(new Event('change'));

      const dataViewByteOffset = /** @type {HTMLInputElement} */ (
        $e(root, '.dataViewByteOffset')
      );
      dataViewByteOffset.value = value.byteOffset;
      dataViewByteOffset.dispatchEvent(new Event('change'));
    } else if (stringTag !== 'ArrayBuffer') { // TypedArray
      const typedArrayByteOffset = /** @type {HTMLInputElement} */ (
        $e(root, '.typedArrayByteOffset')
      );
      typedArrayByteOffset.value = value.byteOffset;
      typedArrayByteOffset.dispatchEvent(new Event('change'));

      const typedArrayLength = /** @type {HTMLInputElement} */ (
        $e(root, '.typedArrayLength')
      );
      typedArrayLength.value = value.length;
      typedArrayLength.dispatchEvent(new Event('change'));
    }
  },
  getValue ({root}) {
    return /** @type {HTMLInputElement & {$value: BufferSource}} */ (
      this.getInput({root})
    ).$value;
  },
  viewUI ({value, specificSchemaObject}) {
    const stringTag = toStringTag(value);
    const buffer = stringTag === 'ArrayBuffer' ? value : value.buffer;

    return ['div', {dataset: {type: 'buffersource'}}, [
      ['b', {
        class: 'emphasis',
        title: specificSchemaObject?.description
          ? (/^[aeiou]/iu).test(stringTag)
            ? `(an ${stringTag})`
            : `(a ${stringTag})`
          : undefined
      }, [
        specificSchemaObject?.description ?? stringTag
      ]],
      ['br'],
      ['b', ['Buffer byte length: ']],
      buffer.byteLength,
      ['br'],
      ['b', ['Buffer max byte length: ']],
      buffer.maxByteLength,

      ...stringTag === 'DataView'
        ? [
          ['br'],
          ['b', ['Data View byte length: ']],
          value.byteLength,
          ['br'],
          ['b', ['Data View byte offset: ']],
          value.byteOffset
        ]
        : [''],
      ...(stringTag !== 'DataView' && stringTag !== 'ArrayBuffer') // TypedArray
        ? [
          ['br'],
          ['b', ['Typed Array byte offset: ']],
          value.byteOffset,
          ['br'],
          ['b', ['Typed Array length: ']],
          value.length
        ]
        : [''],
      ['br'],
      ['button', {
        class: 'buffersource-viewData',
        $on: {
          async click (e) {
            e.preventDefault();
            const dialog = await dialogs.makeCancelDialog({
              // @ts-expect-error TS bug
              children: /** @type {import('jamilih').JamilihChildren} */ ([
                ['select', {
                  class: 'buffersource-typedArrays-view',
                  'aria-label': 'Typed Arrays',
                  $on: {
                    change () {
                      const typedArrayVal = /** @type {HTMLSelectElement} */ (
                        this
                      ).value;
                      const TypedArray = getTypedArray(
                        /** @type {TypedArray} */ (typedArrayVal)
                      );
                      const typedArray = new TypedArray(buffer);
                      const typedArrayArea = /** @type {HTMLElement} */ ($e(
                        /** @type {HTMLElement} */
                        (this.parentElement),
                        '.typedArrayArea'
                      ));
                      typedArrayArea.textContent = '';
                      typedArrayArea.append(
                        ...Array.from({
                          length: typedArray.length
                        }, (_v, key) => {
                          const typedArrayValue = typedArray[key];
                          return jml('span', [
                            ['b', [key]],
                            ' ',
                            ['span', [
                              typedArrayValue
                                ? String(typedArrayValue)
                                : '0'
                            ]],
                            ' '
                          ]);
                        })
                      );
                    }
                  }
                }, typedArrays.map((typedArray) => {
                  return ['option', {
                    selected: stringTag === typedArray
                      ? true
                      : undefined
                  }, [typedArray]];
                })],
                ['div', {
                  class: 'typedArrayArea'
                }]
              ])
            });

            /** @type {HTMLSelectElement} */ (
              $e(dialog, '.buffersource-typedArrays-view')
            ).dispatchEvent(
              new Event('change')
            );
            // Todo: We could also add `DataView` get methods here
            //        (and length/byte offset for the typed array) if
            //        there is a demand
          }
        }
      }, ['View data']]
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value}) {
    idx++;

    /**
     * @typedef {() => void} BuildInstances
     */

    const div = jml('div', {
      dataset: {type: 'buffersource'},
      title: specificSchemaObject?.description ?? 'BufferSource'
    }, [
      ['fieldset', {
        class: 'returnType',
        $on: {
          change () {
            /**
             * @type {HTMLFieldSetElement & {
             *   $buildInstances: BuildInstances
             * }}
             */ (this).$buildInstances();
          }
        },
        $custom: {
          /** @type {BuildInstances} */
          $buildInstances () {
            const that = /**
                          * @type {HTMLFieldSetElement & {
                          *   $buildInstances: BuildInstances
                          * }}
                          */ (this);
            const ancestor = /** @type {HTMLDivElement} */ (that.parentElement);
            const {value} = /** @type {HTMLInputElement} */ ($e(
              that, `[name=${typeNamespace}-buffersource-returnType-${idx}]` +
                      `:checked`
            ));

            const byteLength =
              /**
               * @type {HTMLInputElement & {
               *   $value: BufferSource,
               *   $dataView: DataView,
               *   $typedArray: TypedArrayInstance
               * }}
               */ (
                $e(ancestor, '.byteLength')
              );
            const byteLengthVal = toInteger(byteLength.value);
            const maxByteLength = toInteger(
              /** @type {HTMLInputElement} */ (
                $e(ancestor, '.maxByteLength')
              ).value
            );

            const buffer = new ArrayBuffer(
              // @ts-expect-error New ArrayBuffer argument
              byteLengthVal, maxByteLength ? {maxByteLength} : undefined
            );

            const dataViewByteOffsetVal = /** @type {HTMLInputElement} */ ($e(
              ancestor,
              '.dataViewByteOffset'
            )).value;
            const dataViewByteOffset = dataViewByteOffsetVal
              ? toInteger(dataViewByteOffsetVal)
              : 0;

            const dataViewByteLengthVal = /** @type {HTMLInputElement} */ ($e(
              ancestor,
              '.dataViewByteLength'
            )).value;
            const dataViewByteLength = dataViewByteLengthVal
              ? toInteger(dataViewByteLengthVal)
              : undefined;

            const dataView = new DataView(
              buffer, dataViewByteOffset, dataViewByteLength
            );

            const {value: typedArrayValue} = /** @type {HTMLSelectElement} */ (
              $e(ancestor, '.buffersource-typedArrays-init')
            );

            const TypedArray = getTypedArray(
              /** @type {TypedArray} */ (typedArrayValue)
            );
            const typedArrayByteOffsetVal =
              /** @type {HTMLInputElement} */ ($e(
                ancestor,
                '.typedArrayByteOffset'
              )).value;
            const typedArrayByteOffset = typedArrayByteOffsetVal
              ? toInteger(typedArrayByteOffsetVal)
              : 0;

            const typedArrayLengthVal =
              /** @type {HTMLInputElement} */ ($e(
                ancestor,
                '.typedArrayLength'
              )).value;
            const typedArrayLength = typedArrayLengthVal
              ? toInteger(typedArrayLengthVal)
              : byteLengthVal;

            const typedArray = new TypedArray(
              buffer, typedArrayByteOffset, typedArrayLength
            );

            byteLength.$dataView = dataView;
            byteLength.$typedArray = typedArray;

            const typedArrayValues = $$e(
              ancestor, '.typedArrayArea .typedArrayValue'
            ).map((input) => {
              // Don't check dataset, as may be changing to BigInt now
              return TypedArray.name.startsWith('Big')
                ? BigInt(
                  /** @type {HTMLInputElement} */ (input).value
                )
                : Number(
                  /** @type {HTMLInputElement} */ (input).value
                );
            });

            // @ts-expect-error Ok
            byteLength.$typedArray.set(typedArrayValues, 0);

            switch (value) {
            case 'ArrayBuffer':
              byteLength.$value = buffer;
              break;
            case 'DataView': {
              byteLength.$value = dataView;
              break;
            } default: // 'TypedArray'
              byteLength.$value = typedArray;
              break;
            }
          }
        }
      }, [
        ['legend', ['Return type']],
        ['label', {
          $on: {
            click () {
              /** @type {HTMLElement} */ ($e(
                /** @type {HTMLElement} */ (this.parentElement),
                '.buffersource-typedArrays'
              )).hidden = true;
              /** @type {HTMLElement} */ ($e(
                /** @type {HTMLElement} */ (this?.parentElement?.parentElement),
                '.buffersource-typedArrays-init'
              )).hidden = false;
            }
          }
        }, [
          ['input', {
            type: 'radio',
            class: 'buffersource-returnType ' +
              'buffersource-returnType-arraybuffer',
            name: `${typeNamespace}-buffersource-returnType-${idx}`,
            checked: true,
            value: 'ArrayBuffer'
            // checked: toStringTag(value) !== ''
          }],
          'ArrayBuffer'
        ]],
        ' ',
        ['label', {
          $on: {
            click () {
              /** @type {HTMLElement} */ ($e(
                /** @type {HTMLElement} */ (this.parentElement),
                '.buffersource-typedArrays'
              )).hidden = true;
              /** @type {HTMLElement} */ ($e(
                /** @type {HTMLElement} */ (this?.parentElement?.parentElement),
                '.buffersource-typedArrays-init'
              )).hidden = false;
            }
          }
        }, [
          ['input', {
            type: 'radio',
            class: 'buffersource-returnType buffersource-returnType-dataview',
            name: `${typeNamespace}-buffersource-returnType-${idx}`,
            value: 'DataView'
            // checked: toStringTag(value) !== ''
          }],
          'DataView'
        ]],
        ' ',
        ['label', {
          $on: {
            click () {
              /** @type {HTMLElement} */ ($e(
                /** @type {HTMLElement} */ (this.parentElement),
                '.buffersource-typedArrays'
              )).hidden = false;
              /** @type {HTMLElement} */ ($e(
                /** @type {HTMLElement} */ (this?.parentElement?.parentElement),
                '.buffersource-typedArrays-init'
              )).hidden = true;
            }
          }
        }, [
          ['input', {
            type: 'radio',
            class: 'buffersource-returnType buffersource-returnType-typedarray',
            name: `${typeNamespace}-buffersource-returnType-${idx}`,
            value: 'TypedArray'
            // checked: toStringTag(value) !== ''
          }],
          'Typed Array'
        ]],
        ' ',
        ['select', {
          hidden: true, class: 'buffersource-typedArrays',
          'aria-label': 'Typed Arrays',
          $on: {
            change (e) {
              const that = /** @type {HTMLSelectElement} */ (this);
              const ancestor = /** @type {HTMLElement} */ (
                that.parentElement?.parentElement
              );

              const select =
                /**
                 * @type {HTMLSelectElement & {
                 *   $setMinsAndMaxes: SetMinsAndMaxes,
                 *   $checkTypedArrayByteLength: CheckTypedArrayByteLength
                 * }}
                 */
                ($e(
                  ancestor,
                  '.buffersource-typedArrays-init'
                ));

              // Update to reflect current state changes if later revealing
              select.value = /** @type {HTMLSelectElement} */ (this).value;

              const typedArrayLength =
                /**
                 * @type {HTMLInputElement & {
                 *   $checkBufferBounds: CheckBufferBounds
                 * }}
                 */ (
                  $e(ancestor, '.typedArrayLength')
                );
              if (!typedArrayLength.$checkBufferBounds(e)) {
                return;
              }

              select.$setMinsAndMaxes(
                /** @type {TypedArray} */
                (/** @type {HTMLSelectElement} */ (this).value)
              );

              select.$checkTypedArrayByteLength(e);

              const typedArrayByteOffset = $e(
                /** @type {HTMLElement} */
                (this?.parentElement?.parentElement),
                '.typedArrayByteOffset'
              );
              /**
               * @type {HTMLInputElement & {
               *   $checkByteOffsetMultiple: CheckByteOffsetMultiple
               * }}
               */ (typedArrayByteOffset).$checkByteOffsetMultiple(e);
            }
          }
        }, typedArrays.map((typedArray) => {
          return ['option', [typedArray]];
        })]
      ]],
      ['fieldset', {
        $on: {
          change () {
            /**
             * @type {HTMLFieldSetElement & {
             *   $buildInstances: BuildInstances
             * }}
             */ (this.previousElementSibling).$buildInstances();
          }
        }
      }, [
        ['legend', ['Construction options']],
        ['fieldset', [
          ['legend', ['ArrayBuffer']],
          ['label', [
            'Byte length ',
            ['input', {
              class: 'byteLength',
              type: 'number', step: '1', size: '4',
              pattern: String.raw`\d+`,
              min: 0,
              $custom: {
                $value: value ?? new ArrayBuffer(0)
              },
              $on: {
                change (e) {
                  const that = /** @type {HTMLInputElement} */ (
                    this
                  );

                  const ancestor = /** @type {HTMLElement} */ (
                    that.
                      parentElement?.parentElement?.parentElement?.parentElement
                  );
                  const typedArrayLength =
                    /**
                     * @type {HTMLInputElement & {
                     *   $checkBufferBounds: CheckBufferBounds
                     * }}
                     */ (
                      $e(ancestor, '.typedArrayLength')
                    );
                  if (!typedArrayLength.$checkBufferBounds(e)) {
                    return;
                  }

                  const maxByteLength = /** @type {HTMLInputElement} */ ($e(
                    /** @type {HTMLElement} */ (
                      that.parentElement?.parentElement
                    ), '.maxByteLength'
                  ));
                  const val = that.value;

                  if (toInteger(val) > Number.MAX_SAFE_INTEGER) {
                    that.setCustomValidity(
                      'The ArrayBuffer length exceeds the maximum ' +
                      'allowable size'
                    );
                    e.stopPropagation();
                    that.reportValidity();
                    return;
                  }
                  that.setCustomValidity('');
                  that.reportValidity();

                  if (
                    toInteger(val) > toInteger(maxByteLength.value)
                  ) {
                    maxByteLength.value = val;
                  }

                  const greatGrandparent = /** @type {HTMLElement} */
                    (that.parentElement?.parentElement?.parentElement);

                  /**
                   * @type {HTMLInputElement & {
                   *   $checkDataViewByteLength: CheckDataViewByteLength
                   * }}
                   */ ($e(
                    greatGrandparent,
                    '.dataViewByteLength'
                  )).$checkDataViewByteLength(e);

                  /**
                   * @type {HTMLSelectElement & {
                   *   $checkTypedArrayByteLength: CheckTypedArrayByteLength
                   * }}
                   */ ($e(
                    /** @type {HTMLElement} */
                    (greatGrandparent.parentElement),
                    '.buffersource-typedArrays-init'
                  )).$checkTypedArrayByteLength(e);
                }
              }
            }]
          ]],
          ' ',
          ['label', [
            'Max byte length ',
            ['input', {
              class: 'maxByteLength',
              type: 'number', step: '1', size: '4',
              pattern: String.raw`\d+`,
              min: 0,
              $on: {
                change (e) {
                  const that = /** @type {HTMLInputElement} */ (this);
                  const byteLength = /** @type {HTMLInputElement} */ ($e(
                    /** @type {HTMLElement} */ (
                      that.parentElement?.parentElement
                    ), '.byteLength'
                  ));
                  const val = that.value;
                  if (
                    toInteger(val) < toInteger(byteLength.value)
                  ) {
                    // byteLength.value = val;
                    that.setCustomValidity(
                      'The max value cannot be less than the byte length'
                    );
                    e.stopPropagation();
                  } else {
                    that.setCustomValidity('');
                  }
                  that.reportValidity();
                }
              }
            }]
          ]]
        ]],
        ['fieldset', [
          ['legend', ['DataView']],
          ['label', [
            'Byte length ',
            ['input', {
              class: 'dataViewByteLength',
              type: 'number', step: '1', size: '4',
              pattern: String.raw`\d+`,
              min: 0,
              $custom: {
                /**
                 * @typedef {(e: Event) => void} CheckDataViewByteLength
                 */

                /** @type {CheckDataViewByteLength} */
                $checkDataViewByteLength (e) {
                  const that = /**
                                * @type {HTMLInputElement & {
                                *   $checkDataViewByteLength: CheckDataViewByteLength
                                * }}
                                */ (
                      this
                    );
                  const greatGrandparent = /** @type {HTMLElement} */
                    (that.parentElement?.parentElement?.parentElement);

                  const byteOffset = toInteger(
                    /** @type {HTMLInputElement} */ ($e(
                      greatGrandparent,
                      '.dataViewByteOffset'
                    )).value
                  ) || 0;

                  const bufferByteLengthVal = /** @type {HTMLInputElement} */ (
                    $e(
                      greatGrandparent,
                      '.byteLength'
                    )).value;
                  const bufferByteLength = bufferByteLengthVal
                    ? toInteger(bufferByteLengthVal)
                    : 0;

                  const byteLength = that.value
                    ? toInteger(that.value)
                    : bufferByteLength;

                  if (byteOffset + byteLength > bufferByteLength) {
                    that.setCustomValidity(
                      'The DataView byte length and offset exceed ' +
                        'the buffer\'s byte length'
                    );
                    e.stopPropagation();
                  } else {
                    that.setCustomValidity('');
                  }
                  that.reportValidity();
                }
              },
              $on: {
                change (e) {
                  /**
                   * @type {HTMLInputElement & {
                   *   $checkDataViewByteLength: CheckDataViewByteLength
                   * }}
                   */ (
                    this
                  ).$checkDataViewByteLength(e);
                }
              }
            }]
          ]],
          ' ',
          ['label', [
            'Byte offset ',
            ['input', {
              class: 'dataViewByteOffset',
              type: 'number', step: '1', size: '4',
              pattern: String.raw`\d+`,
              min: 0,
              $on: {
                change (e) {
                  const that = /** @type {HTMLInputElement} */ (
                    this
                  );
                  const greatGrandparent = /** @type {HTMLElement} */
                    (that.parentElement?.parentElement?.parentElement);

                  /**
                   * @type {HTMLInputElement & {
                   *   $checkDataViewByteLength: CheckDataViewByteLength
                   * }}
                   */ ($e(
                    greatGrandparent,
                    '.dataViewByteLength'
                  )).$checkDataViewByteLength(e);
                }
              }
            }]
          ]]
        ]],
        ['fieldset', [
          ['legend', ['Typed array']],
          ['label', [
            'Byte offset ',
            ['input', {
              class: 'typedArrayByteOffset',
              type: 'number', step: '1', size: '4',
              pattern: String.raw`\d+`,
              min: 0,
              max: (2 ** 53) - 1,
              $custom: {
                /**
                 * @typedef {(e: Event) => void} CheckByteOffsetMultiple
                 */

                /** @type {CheckByteOffsetMultiple} */
                $checkByteOffsetMultiple (e) {
                  const that = /**
                                * @type {HTMLInputElement & {
                                *   $checkByteOffsetMultiple: CheckByteOffsetMultiple
                                * }}
                                */ (this);
                  const ancestor = /** @type {HTMLElement} */ (
                    that.
                      parentElement?.parentElement?.parentElement?.parentElement
                  );

                  const {value} = /** @type {HTMLSelectElement} */ (
                    $e(ancestor, '.buffersource-typedArrays-init')
                  );

                  const TypedArray = getTypedArray(
                    /** @type {TypedArray} */ (value)
                  );
                  if (
                    toInteger(that.value) % TypedArray.BYTES_PER_ELEMENT
                  ) {
                    that.setCustomValidity(
                      'Byte offset must be a multiple of the typed ' +
                        `array's bytes-per-element size (${
                          TypedArray.BYTES_PER_ELEMENT
                        })`
                    );
                    e.stopPropagation();
                  } else {
                    that.setCustomValidity('');
                  }
                  that.reportValidity();
                }
              },
              $on: {
                change (e) {
                  const that = /** @type {HTMLInputElement} */ (this);
                  const ancestor = /** @type {HTMLElement} */ (
                    that.
                      parentElement?.parentElement?.parentElement?.parentElement
                  );
                  const typedArrayLength =
                    /**
                     * @type {HTMLInputElement & {
                     *   $checkBufferBounds: CheckBufferBounds
                     * }}
                     */ (
                      $e(ancestor, '.typedArrayLength')
                    );
                  if (!typedArrayLength.$checkBufferBounds(e)) {
                    return;
                  }
                  /**
                   * @type {HTMLInputElement & {
                   *   $checkByteOffsetMultiple: CheckByteOffsetMultiple
                   * }}
                   */ (this).$checkByteOffsetMultiple(e);
                }
              }
            }]
          ]]
          // ' ',
          // ['label', [
          //   'Length ',
          //   ['input', {
          //     class: 'typedArrayLength',
          //     type: 'number', step: '1', size: '4', pattern: '\\d+',
          //     min: 0
          //   }]
          // ]]
        ]]
      ]],
      ['fieldset', [
        ['legend', ['Typed Array initialization (optional)']],
        ['select', {
          class: 'buffersource-typedArrays-init',
          'aria-label': 'Typed Arrays',
          $custom: {
            /**
             * @callback SetMinsAndMaxes
             * @param {TypedArray} typedArray
             * @returns {void}
             */

            /** @type {SetMinsAndMaxes} */
            $setMinsAndMaxes (typedArray) {
              const {min, max} = getMinMaxForTypedArray(typedArray);

              /** @type {HTMLInputElement[]} */ (
                $$e(/** @type {HTMLElement} */ (
                  /**
                   * @type {HTMLSelectElement & {
                   *   $setMinsAndMaxes: SetMinsAndMaxes,
                   *   $checkTypedArrayByteLength: CheckTypedArrayByteLength
                   * }}
                   */ (this).parentElement
                ), '.typedArrayValue')
              ).forEach((typedArrayValue) => {
                typedArrayValue.className =
                  'typedArrayValue typedArray-' + typedArray;
                typedArrayValue.min = String(min);
                typedArrayValue.max = String(max);
              });
            },

            /**
             * @typedef {(e: Event) => void} CheckTypedArrayByteLength
             */

            /** @type {CheckTypedArrayByteLength} */
            $checkTypedArrayByteLength (e) {
              const that = /**
                            * @type {HTMLSelectElement & {
                            *   $setMinsAndMaxes: SetMinsAndMaxes,
                            *   $checkTypedArrayByteLength: CheckTypedArrayByteLength
                            * }}
                            */ (this);
              const TypedArray = getTypedArray(
                /** @type {TypedArray} */ (that.value)
              );

              const byteLength = /** @type {HTMLInputElement} */ ($e(
                /** @type {HTMLElement} */
                (that.parentElement?.parentElement),
                '.byteLength'
              ));
              const arrayBufferLength = byteLength.value
                ? toInteger(
                  byteLength.value
                )
                : 0;
              if (arrayBufferLength % TypedArray.BYTES_PER_ELEMENT) {
                byteLength.setCustomValidity(
                  'Array buffer must be a multiple of the typed array\'s ' +
                    `bytes-per-element size (${TypedArray.BYTES_PER_ELEMENT})`
                );
                e.stopPropagation();
              } else {
                byteLength.setCustomValidity('');
              }
              byteLength.reportValidity();
            }
          },
          $on: {
            change (e) {
              const that =
                /**
                 * @type {HTMLSelectElement & {
                 *   $setMinsAndMaxes: SetMinsAndMaxes,
                 *   $checkTypedArrayByteLength: CheckTypedArrayByteLength
                 * }}
                 */ (
                  this
                );

              const ancestor = /** @type {HTMLElement} */ (
                that.
                  parentElement?.parentElement?.parentElement
              );

              // Update to reflect current state changes if later revealing
              /** @type {HTMLSelectElement} */ ($e(
                /** @type {HTMLElement} */
                (this.parentElement?.parentElement),
                '.buffersource-typedArrays'
              )).value = that.value;

              const typedArrayLength =
              /**
               * @type {HTMLInputElement & {
               *   $checkBufferBounds: CheckBufferBounds
               * }}
               */ (
                  $e(ancestor, '.typedArrayLength')
                );
              if (!typedArrayLength.$checkBufferBounds(e)) {
                return;
              }

              that.$checkTypedArrayByteLength(e);

              that.$setMinsAndMaxes(/** @type {TypedArray} */ (that.value));

              const typedArrayByteOffset = $e(
                /** @type {HTMLElement} */
                (that?.parentElement?.parentElement),
                '.typedArrayByteOffset'
              );
              /**
               * @type {HTMLInputElement & {
               *   $checkByteOffsetMultiple: CheckByteOffsetMultiple
               * }}
               */ (typedArrayByteOffset).$checkByteOffsetMultiple(e);

              /**
               * @type {HTMLFieldSetElement & {
               *   $buildInstances: BuildInstances
               * }}
               */ ($e(
                /** @type {HTMLElement} */
                (this.parentElement?.parentElement),
                '.returnType'
              )).$buildInstances();
            }
          }
        }, typedArrays.map((typedArray) => {
          return ['option', [typedArray]];
        })],
        ' ',
        ['label', [
          'Array length: ',
          ['input', {
            class: 'typedArrayLength',
            type: 'number', step: '1', size: '4',
            pattern: String.raw`\d+`,
            min: 0,
            $custom: {
              /**
               * When creating a view from a buffer, the bounds are outside
               * the buffer. In other words, `byteOffset + length *
               * TypedArray.BYTES_PER_ELEMENT > buffer.byteLength`.
               * @typedef {(e: Event) => boolean} CheckBufferBounds
               */

              /** @type {CheckBufferBounds} */
              $checkBufferBounds (e) {
                const that = /**
                              * @type {HTMLInputElement & {
                              *   $checkBufferBounds: CheckBufferBounds,
                              *   $buildTypedArray: BuildTypedArray
                              * }}
                              */ (this);

                const ancestor = /** @type {HTMLElement} */ (
                  that.parentElement?.parentElement?.parentElement
                );
                const bufferByteLengthVal = /** @type {HTMLInputElement} */ (
                  $e(
                    ancestor,
                    '.byteLength'
                  )).value;
                const bufferByteLength = bufferByteLengthVal
                  ? toInteger(
                    bufferByteLengthVal
                  )
                  : 0;

                const length = that.value
                  ? toInteger(that.value)
                  : bufferByteLength;

                const {value} = /** @type {HTMLSelectElement} */ (
                  $e(ancestor, '.buffersource-typedArrays-init')
                );

                const TypedArray = getTypedArray(
                  /** @type {TypedArray} */ (value)
                );

                const typedArrayByteOffsetVal =
                  /** @type {HTMLInputElement} */ ($e(
                    ancestor,
                    '.typedArrayByteOffset'
                  )).value;
                const typedArrayByteOffset = typedArrayByteOffsetVal
                  ? toInteger(typedArrayByteOffsetVal)
                  : 0;

                if (
                  (typedArrayByteOffset +
                    (length * TypedArray.BYTES_PER_ELEMENT)) >
                  bufferByteLength
                ) {
                  that.setCustomValidity(
                    'The byte offset and the length times bytes per element ' +
                    'is greater than the buffer length'
                  );
                  e.stopPropagation();
                  that.reportValidity();
                  return false;
                }

                that.setCustomValidity('');
                that.reportValidity();
                return true;
              },

              /**
               * @typedef {() => void} BuildTypedArray
               */

              /** @type {BuildTypedArray} */
              $buildTypedArray () {
                const that = /**
                              * @type {HTMLInputElement & {
                              *   $checkBufferBounds: CheckBufferBounds,
                              *   $buildTypedArray: BuildTypedArray
                              * }}
                              */ (this);
                const length = toInteger(that.value);
                const grandparent = /** @type {HTMLElement} */ (
                  that.parentElement?.parentElement
                );

                const ancestor = /** @type {HTMLElement} */ (
                  that.parentElement?.parentElement?.parentElement
                );
                const bufferByteLength =
                  /**
                   * @type {HTMLInputElement & {
                   *   $typedArray: TypedArrayInstance
                   * }}
                   */ ($e(
                    ancestor,
                    '.byteLength'
                  ));

                const typedArrayArea = /** @type {HTMLElement} */ ($e(
                  grandparent, '.typedArrayArea'
                ));

                typedArrayArea.addEventListener('change', (e) => {
                  const input = /** @type {HTMLInputElement} */ (e.target);
                  bufferByteLength.$typedArray.set([
                    // @ts-expect-error Ok
                    input.dataset.bigint === 'true'
                      ? BigInt(input.value)
                      : Number(input.value)
                  ], toInteger(
                    /** @type {string} */ (input.dataset.key)
                  ));
                });
                const {value} = /** @type {HTMLSelectElement} */ (
                  $e(grandparent, '.buffersource-typedArrays-init')
                );
                const {min, max} = getMinMaxForTypedArray(
                  /** @type {TypedArray} */ (value)
                );

                typedArrayArea.textContent = '';
                typedArrayArea.append(
                  ...Array.from({length}, (_v, key) => {
                    const typedArrayValue = bufferByteLength.$typedArray[key];
                    return jml('label', [
                      key,
                      ' ',
                      ['input', {
                        class: 'typedArrayValue typedArray-' + value,
                        dataset: {
                          key, bigint: String(value.startsWith('BigInt'))
                        },
                        type: 'number', step: '1',
                        pattern: value.startsWith('Float')
                          ? String.raw`\d+(?:\.\d+)?`
                          : String.raw`\d+`,
                        value: typedArrayValue
                          ? String(typedArrayValue)
                          : '0',
                        min, max
                      }],
                      ' '
                      // !key || key % 9 ? ' ' : ['br']
                    ]);
                  })
                );
              }
            },
            $on: {
              change (e) {
                const that =
                  /**
                   * @type {HTMLInputElement & {
                   *   $checkBufferBounds: CheckBufferBounds,
                   *   $buildTypedArray: BuildTypedArray
                   * }}
                   */ (
                    this
                  );

                if (!that.$checkBufferBounds(e)) {
                  return;
                }

                const grandparent = /** @type {HTMLElement} */ (
                  this.parentElement?.parentElement
                );

                const {value} = /** @type {HTMLSelectElement} */ (
                  $e(grandparent, '.buffersource-typedArrays-init')
                );

                const length = toInteger(that.value);
                try {
                  const TypedArray = getTypedArray(
                    /** @type {TypedArray} */ (value)
                  );
                  // eslint-disable-next-line no-new -- Testing
                  new TypedArray(length);
                } catch {
                  that.setCustomValidity('Typed Array length is too long');
                  e.stopPropagation();
                  that.reportValidity();
                  return;
                }
                that.setCustomValidity('');
                that.reportValidity();

                /**
                 * @type {HTMLFieldSetElement & {
                 *   $buildInstances: BuildInstances
                 * }}
                 */ ($e(
                  /** @type {HTMLElement} */
                  (this.parentElement?.parentElement?.parentElement),
                  '.returnType'
                )).$buildInstances();

                that.$buildTypedArray();
              }
            }
          }],
          ['div', {
            class: 'typedArrayArea'
          }]
        ]]
      ]],
      ['fieldset', [
        ['legend', ['DataView initialization (optional)']],
        ['select', {
          class: 'dataViewMethod',
          'aria-label': 'Data View methods',
          $on: {
            change () {
              const dataViewArea = /** @type {HTMLDivElement} */ ($e(
                /** @type {HTMLElement} */ (this.parentElement), '.dataViewArea'
              ));

              const val = /** @type {HTMLSelectElement} */ (this).value;
              const typedArray = /** @type {TypedArray} */ (
                val.slice(3) + 'Array'
              );

              dataViewArea.textContent = '';
              dataViewArea.append(
                jml(
                  'label', [
                    'Byte offset ',
                    ['input', {
                      type: 'number',
                      class: 'dataViewSetByteOffset',
                      step: '1', size: '4',
                      pattern: String.raw`\d+`
                    }]
                  ]
                ),
                ' ',
                jml(
                  'label', [
                    'Value ',
                    ['input', {
                      type: 'number',
                      step: '1', size: '4',
                      pattern: String.raw`\d+`,
                      class: 'typedArrayValue typedArray-' + typedArray,
                      ...getMinMaxForTypedArray(typedArray)
                    }]
                  ]
                ),
                val === 'setInt8' || val === 'setUint8'
                  ? ''
                  : jml('label', [
                    ['input', {
                      class: 'littleEndian',
                      type: 'checkbox'
                    }],
                    'Little endian'
                  ]),
                ' ',
                jml('button', {
                  $on: {
                    click (e) {
                      e.preventDefault();
                      const ancestor = /** @type {HTMLElement} */ (
                        this.parentElement
                      );
                      const dataViewMethod =
                        /** @type {typeof dataViewMethods[number]} */ (
                          /** @type {HTMLSelectElement} */ (
                            ancestor.previousElementSibling
                          )?.value
                        );

                      const dataViewSetByteOffset =
                        toInteger(/** @type {HTMLInputElement} */ ($e(
                          ancestor,
                          '.dataViewSetByteOffset'
                        )).value);
                      const typedArrayValue =
                        /** @type {HTMLInputElement} */ ($e(
                          ancestor,
                          '.typedArrayValue'
                        )).value;
                      const littleEndian =
                        /** @type {HTMLInputElement|null} */ ($e(
                          ancestor,
                          '.littleEndian'
                        ))?.checked;

                      const byteLength =
                        /**
                         * @type {HTMLInputElement & {
                         *   $dataView: DataView,
                         * }}
                         */ (
                          $e(
                            /** @type {HTMLElement} */
                            (ancestor?.parentElement?.parentElement),
                            '.byteLength'
                          )
                        );

                      if (
                        dataViewMethod === 'setBigInt64' ||
                        dataViewMethod === 'setBigUint64'
                      ) {
                        byteLength.$dataView[dataViewMethod](
                          dataViewSetByteOffset,
                          BigInt(typedArrayValue),
                          littleEndian
                        );
                      } else {
                        byteLength.$dataView[dataViewMethod](
                          dataViewSetByteOffset,
                          Number(typedArrayValue),
                          littleEndian
                        );
                      }

                      const typedArrayLength =
                        /**
                         * @type {HTMLInputElement & {
                         *   $buildTypedArray: BuildTypedArray
                         * }}
                         */ ($e(
                          /** @type {HTMLElement} */
                          (ancestor.parentElement?.parentElement),
                          '.typedArrayLength'
                        ));
                      typedArrayLength.$buildTypedArray();
                    }
                  }
                }, ['Set'])
              );
            }
          }
        }, [
          ['option', {value: ''}, ['(Select a data view method)']],
          ...dataViewMethods.map((dataViewMethod) => {
            return ['option', [dataViewMethod]];
          })
        ]],
        ' ',
        ['div', {class: 'dataViewArea'}]
      ]]
    ]);

    if (value && this.setValue) {
      this.setValue({root: div, value});
    } else {
      const byteLength =
      /**
       * @type {HTMLInputElement & {
       *   $value: BufferSource
       * }}
       */ ($e(div, '.byteLength'));
      byteLength.$value = new ArrayBuffer(0);
    }

    return [div];
  }
};

export default buffersourceType;
