import {jml, nbsp} from '../vendor-imports.js';

import {getPropertyValueFromLegend} from '../types.js';
import {$e, $$e, U, DOM} from '../utils/templateUtils.js';
import dialogs from '../utils/dialogs.js';
import {
  resolveJSONPointer, getJSONPointerParts, reduceJSONPointerParts
} from '../utils/jsonPointer.js';
import FileList from '../utils/FileList.js';

let optionalPropertyId = 0;

/**
 * @callback AddAndSetArrayElement
 * @param {{
 *   propName: string,
 *   type: import('../types.js').AvailableType,
 *   value: import('../formats.js').StructuredCloneValue,
 *   bringIntoFocus: boolean,
 *   schemaContent: import('../formats/schema.js').ZodexSchema,
 * }} cfg
 * @returns {Element}
 */

/**
 * @typedef {number} Integer
 */
/**
 * @callback ParseInt
 * @this {HTMLInputElement}
 * @returns {false|Integer}
 */
/**
 * @typedef {() => HTMLInputElement[]} InputsExceedingLength
 */
/**
 * @typedef {() => (HTMLSelectElement & {
 *   $getValue: import('../typeChoices.js').GetValue
 * })[]} GetMapKeySelects
 */
/**
 * @typedef {() => void} ValidateMapKey
 */
/**
 * @callback GetPropertyInputs
 * @returns {HTMLInputElement[]}
 */

/**
 * @callback RedrawMoveArrows
 * @returns {void}
 */
/**
 * @typedef {() => HTMLDivElement & {
 *   $inputsExceedingLength: InputsExceedingLength,
 *   $getPropertyInputs: GetPropertyInputs,
 *   $redrawMoveArrows: RedrawMoveArrows,
 *   $getMapKeySelects: GetMapKeySelects
 * }} GetArrayItems
 */
/**
 * @typedef {() => Promise<void>} Validate
 */

/**
 * @callback Resort
 * @param {{alwaysFocus?: true}} cfg
 * @returns {void}
 */

/**
 * @typedef {() => HTMLInputElement|undefined} GetPropertyInput
 */

/**
 * @typedef {any} AnyValue
 */

/**
 * Algorithm used for checking key identity in `Map`'s.
 * @param {AnyValue} x
 * @param {AnyValue} y
 * @returns {boolean}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality
 */
function sameValueZero (x, y) {
  if (typeof x === 'number' && typeof y === 'number') {
    // x and y are equal (may be -0 and 0) or they are both NaN
    // eslint-disable-next-line no-self-compare -- Not pointless with -0
    return x === y || (x !== x && y !== y);
  }
  return x === y;
}

/**
 * @type {import('../types.js').TypeObject & {sparse?: boolean|undefined}}
 */
const arrayType = {
  option: ['Array'],
  array: true,
  // sparse: undefined, // Don't add as will be copied
  regexEndings: [',', ']'],
  stringRegexBegin: /^\[/u,
  stringRegexEnd: /^\]/u,
  valueMatch (x) {
    return Array.isArray(x);
  },
  toValue (s, info) {
    const {
      /* istanbul ignore next -- Just a guard */
      endMatchTypeObjs = [],
      remnant: innerContents,
      rootHolder,
      schemaObject
    } = /** @type {import('../types.js').RootInfo} */ (info);
    // eslint-disable-next-line prefer-destructuring -- TS
    const format = /** @type {import('../types.js').RootInfo} */ (info).format;
    // eslint-disable-next-line prefer-destructuring -- TS
    const types = /** @type {import('../types.js').default} */ (
      /** @type {import('../types.js').RootInfo} */ (info).types
    );
    const {sparse} = this;
    const state = sparse
      ? 'arrayNonindexKeys'
    // ? 'sparseArrays'
      : (this.array ? 'array' : 'object');
    /** @type {{[key: (string|number)]: any}} */
    const retObj = this.array ? [] : {};
    /* istanbul ignore next -- Unreachable? */
    let stringVal = innerContents;

    /**
     * @param {boolean} beginOnly
     * @returns {boolean}
     */
    const checkEnd = (beginOnly) => {
      if (beginOnly && endMatchTypeObjs.length) {
        const endMatch = stringVal.match(
          /** @type {RegExp} */ (
            /** @type {import('../types.js').TypeObject} */ (
              endMatchTypeObjs.at(-1)
            ).stringRegexEnd
          )
        );
        if (endMatch) {
          endMatchTypeObjs.pop(); // Safe now to extract
          stringVal = stringVal.slice(endMatch[0].length);
          return true;
        }
      }
      return false;
    };
    if (this.array) {
      let idx = 0;
      const parse = () => {
        if (!stringVal) {
          return;
        }
        const sparseEntriesOrSpaces = stringVal.match(sparse ? /^[,\s]+/u : /^\s*,?\s*/u);
        if (sparseEntriesOrSpaces) {
          const ws = sparseEntriesOrSpaces[0].match(/\s/gu);
          idx += sparseEntriesOrSpaces[0].length - (ws ? ws.length : 0);
          stringVal = stringVal.slice(sparseEntriesOrSpaces[0].length);
          if (!stringVal) {
            return;
          }
        }
        let v, beginOnly, assign;
        try {
          [v, stringVal, beginOnly, assign] = types.getValueForString(
            stringVal,
            {
              firstRun: false,
              format,
              state,
              schemaObject,
              endMatchTypeObjs, rootHolder, parent: retObj, parentPath: idx
            }
          );
        } catch (err) {
          console.log('e', err);
          return;
        }
        if (assign) {
          retObj[idx] = v;
        }
        if (checkEnd(beginOnly)) {
          return;
        }
        parse();
      };
      parse();
      if (sparse && idx && idx > retObj.length - 1) {
        retObj.length = idx + 1;
      }
      return {
        value: this.set && Array.isArray(retObj)
          ? new Set(retObj)
          : this.map
            ? new Map(/** @type {Array<any>} */ (retObj))
            : this.filelist
              // @ts-expect-error -- Virtual API
              ? new FileList(retObj)
              : retObj,
        remnant: stringVal
      };
    }

    /**
     * @param {boolean} [notFirstRun]
     * @returns {void}
     */
    const parse = (notFirstRun) => {
      if (!stringVal) {
        return;
      }
      if (notFirstRun && stringVal[0] === ',') {
        stringVal = stringVal.slice(1);
      }
      const propAndColon = stringVal.match(/^\s*(?:([^:"}]+)|"((?:[^\\"]|\\\\|\\")*)")(\s*:\s*)/u); // Todo (low): Use some identifier production
      if (!propAndColon) { // End of object
        return;
      }
      const [, prop, propHadQuotes] = propAndColon;
      const pr = prop !== '' ? prop : propHadQuotes;
      stringVal = stringVal.slice(propAndColon[0].length);
      let v, beginOnly, assign;
      try {
        [v, stringVal, beginOnly, assign] = types.getValueForString(
          stringVal,
          {
            firstRun: false, format, state, schemaObject,
            endMatchTypeObjs, rootHolder, parent: retObj, parentPath: pr
          }
        );
      } catch {
        // console.log(
        //   'errrrr', stringVal,
        //   JSON.stringify(endMatchTypeObjs)
        // );
        return;
      }
      // console.log('vvv', stringVal, beginOnly, v);
      if (assign) {
        /** @type {{[key: string]: import('../formats.js').StructuredCloneValue}} */ (
          retObj
        )[pr] = v;
      }
      if (checkEnd(beginOnly)) {
        return;
      }
      parse(true);
    };
    parse();
    return {value: retObj, remnant: stringVal};
  },
  getValue ({root, stateObj, currentPath = ''}) {
    /* istanbul ignore if */
    if (!stateObj) {
      throw new Error('TS guard'); // TS guard
    }
    // eslint-disable-next-line prefer-destructuring -- TS
    const types = /** @type {import('../types.js').default} */ (stateObj.types);
    const top = currentPath === '';
    const arrayItems =
      /**
       * @type {HTMLElement & {
       *   $getMapKeySelects: GetMapKeySelects
       * }}
       */ ($e(root, '.arrayItems'));
    /* istanbul ignore if -- Async guard */
    if (!arrayItems) {
      // The `.arrayItems` container may not exist yet if `getValue` is
      //   reached (e.g. via a synchronous `validate`) before an async
      //   `setValue` has finished building the UI.
      throw new Error('Not yet instantiated');
    }
    const fieldsets = [...arrayItems.children];

    // A `record` schema renders through the `object` type but, like a `Map`,
    //   builds its entries from key-type selectors; it is flagged on the root.
    const isRecord = root.dataset.record === 'true';

    /**
     * @type {({[key: string]: any})|any[]}
     */
    const ret = !isRecord && root.dataset.type === 'object'
      ? {}
      : !this.sparse
        ? []
        : Array.from({length: Math.trunc(Number(
          /** @type {HTMLInputElement} */ (DOM.filterChildElements(
            root,
            ['div', 'div', 'label', 'input']
          )[0]).value
        ))});

    // Todo: Should this be renamed per return arguments to
    //   `getRefOrVal` or is it ok?

    /**
     * @param {HTMLDivElement} root
     * @param {string} currentPathPart
     * @returns {[boolean, any?]}
     */
    const getValOrRef = (root, currentPathPart) => {
      const value = types.getValueForRoot(
        root, stateObj, currentPath + '/' + currentPathPart
      );
      if ('handlingReference' in stateObj && stateObj.handlingReference) {
        // We deal with references later once object is fully constructed
        stateObj.handlingReference = false;
        return [false];
      }
      return [true, value];
    };
    fieldsets.forEach((fieldset) => {
      const legend = /** @type {HTMLLegendElement} */ (
        fieldset.firstElementChild
      );
      const propVal = getPropertyValueFromLegend(legend);
      const root = /** @type {HTMLDivElement} */ (
        DOM.filterChildElements(
          /** @type {HTMLFieldSetElement} */
          (fieldset),
          [
            '.typeContainer',
            'div[data-type]'
          ]
        )[0] || DOM.filterChildElements(
          /** @type {HTMLFieldSetElement} */
          (fieldset),
          [
            '[class^=optionalProperties-placeholder]',
            '.typeContainer',
            'div[data-type]'
          ]
        )[0]
      );
      /* istanbul ignore if -- Should err first? */
      if (!root) {
        return;
      }

      const objectProperty = DOM.filterChildElements(legend, ['input']);
      const [isVal, value] = getValOrRef(
        root,
        propVal
      );
      if (isVal) {
        if (objectProperty.length) {
          /** @type {{[key: string]: any}} */ (ret)[propVal] = value;
        } else {
          ret.push(value);
        }
      }
    });
    if (top) {
      Object.entries(stateObj.paths || []).forEach(
        ([referencePath, {referentPath /* , expectArrayReferent */}]) => {
          const referentObj = referentPath === ''
            ? ret
            : resolveJSONPointer({
              path: referentPath,
              obj: ret
            });
          const referencePathJsonPtr = getJSONPointerParts(referencePath);
          const referenceFinalPathPart = referencePathJsonPtr.pop();
          const referenceParentObj = referencePathJsonPtr.reduce(
            (obj, pathPart) => {
              return reduceJSONPointerParts(obj, pathPart);
            },
            ret
          );
          /** @type {{[key: string]: any}} */ (referenceParentObj)[
            /** @type {string} */ (referenceFinalPathPart)
          ] = referentObj;
        }
      );
    }
    return this.filelist
      // @ts-expect-error -- Virtual API
      ? new FileList(ret)
      : this.set && Array.isArray(ret)
        ? new Set(ret)
        : this.map
          ? new Map(arrayItems.$getMapKeySelects().map((select, idx) => {
            const key = select.$getValue();
            return [key, /** @type {any[]} */ (ret)[idx]];
          }))
          : isRecord
            ? arrayItems.$getMapKeySelects().reduce((obj, select, idx) => {
              const key = select.$getValue();
              obj[key] = /** @type {any[]} */ (ret)[idx];
              // Todo: Reenable for native enums
              // if (typeof val === 'number') {
              //   obj[val] = key;
              // }
              return obj;
            }, /** @type {{[key: string]: any}} */ ({}))
            : ret;
  },

  // Try to keep in sync with basic structure of `editUI`
  viewUI ({
    typeNamespace, type, types, value, topRoot, resultType, format,
    specificSchemaObject
  }) {
    // const {sparse} = this;
    let itemIndex = -1;

    const parentType = type;

    // `record`/`tuple` are not distinct types; they are `object`/`array` whose
    //   associated schema refines them. Detect the refinement from the schema.
    const recordMode = specificSchemaObject?.type === 'record' ||
      specificSchemaObject?.type === 'looseRecord';
    const tupleMode = specificSchemaObject?.type === 'tuple';

    /**
     * @param {{
     *   itemIndex: number,
     *   typeNamespace?: string,
     *   propName?: string
     * }} cfg
     * @returns {import('jamilih').JamilihArray}
     */
    const buildLegend = ({
      /* className, type, arrayItems, */
      itemIndex, typeNamespace, propName
    }) => {
      const tupleItem = /** @type {import('zodexy').SzTuple} */ (
        specificSchemaObject
      )?.items?.[itemIndex];
      const restItem = /** @type {import('zodexy').SzTuple} */ (
        specificSchemaObject
      )?.rest;
      return ['legend', [
        !recordMode && this.array
          ? /** @type {import('zodexy').SzArray} */ (
            specificSchemaObject
          )?.element?.description ??
            ((type === 'set' && /** @type {import('zodexy').SzSet} */ (
              specificSchemaObject
            )?.value?.description)
              ? /** @type {import('zodexy').SzSet} */ (
                specificSchemaObject
              )?.value?.description
              : (
                tupleItem?.description ?? restItem?.description
              )) ?? 'Item'
          : specificSchemaObject ? '' : 'Property',
        specificSchemaObject ? '' : ':',
        nbsp.repeat(2),
        ['span', {
          class: `propertyName-${typeNamespace}`,
          title: recordMode && /** @type {import('zodexy').SzRecord} */ (
            specificSchemaObject
          )?.key?.description
            ? /** @type {import('zodexy').SzRecord} */ (
              specificSchemaObject
            )?.key?.description
            : specificSchemaObject ? propName : undefined
        }, [
          propName !== undefined
            ? /** @type {import('zodexy').SzObject} */ (
              specificSchemaObject
            )?.properties?.[propName]?.description ?? propName
            /* istanbul ignore next -- Won't reach here as typeson will always give keypath? */
            : itemIndex
        ]]
      ]];
    };

    /**
     * @typedef {HTMLDivElement & {
     *   $addAndSetArrayElement: AddAndSetArrayElement,
     *   $addMapElement: () => HTMLFieldSetElement,
     *   $addArrayElement: (cfg: {propName: string}) => HTMLFieldSetElement,
     *   $getArrayItems: () => HTMLElement,
     *   _lastFieldset?: HTMLFieldSetElement|null
     * }} ArrayHolder
     */

    /**
     * @callback AddMapElement
     * @returns {HTMLFieldSetElement}
     */

    const div = jml('div', {
      class: 'arrayHolder',
      // `record`/`tuple` render through `object`/`array`; flag the refinement
      //   for `getValue` (which has no schema in scope) and for styling/tests.
      dataset: {
        type,
        ...(recordMode ? {record: 'true'} : {}),
        ...(tupleMode ? {tuple: 'true'} : {})
      },
      $custom: {
        /**
         * @this {ArrayHolder}
         * @param {Parameters<AddAndSetArrayElement>[0]} cfg
         */
        $addAndSetArrayElement (cfg) {
          const {
            propName, type, value, bringIntoFocus,
            schemaContent
          } = cfg;
          if (parentType === 'map') {
            const root = types.getUIForModeAndType({
              resultType,
              readonly: true,
              typeNamespace, type, topRoot,
              bringIntoFocus,
              format, schemaContent,
              value,
              hasValue: true // type === 'sparseArrays' && value
            });
            if (propName === '0') {
              const fieldset = this.$addMapElement();
              this._lastFieldset = fieldset;
              const keyFieldset = jml(
                'fieldset', [
                  ['legend', {
                    title: /** @type {import('zodexy').SzMap<any, any>} */ (
                      specificSchemaObject
                    )?.key?.description
                      ? '(map key)'
                      : undefined
                  }, [
                    /** @type {import('zodexy').SzMap<any, any>} */ (
                      specificSchemaObject
                    )?.key?.description ?? 'Key'
                  ]]
                ], fieldset
              );
              jml(root, keyFieldset);
            } else { // propName === '1'
              const valueFieldset = jml(
                'fieldset', [
                  ['legend', {
                    title: /** @type {import('zodexy').SzMap<any, any>} */ (
                      specificSchemaObject
                    )?.value?.description
                      ? '(map value)'
                      : undefined
                  }, [
                    /** @type {import('zodexy').SzMap<any, any>} */ (
                      specificSchemaObject
                    )?.value?.description ??
                    'Value'
                  ]]
                ], this._lastFieldset
              );
              this._lastFieldset = null;
              jml(root, valueFieldset);
            }
            return root;
          }

          const fieldset = this.$addArrayElement({propName});
          const root = types.getUIForModeAndType({
            resultType,
            readonly: true,
            typeNamespace, type, topRoot,
            bringIntoFocus,
            format,
            schemaContent,
            specificSchemaObject: schemaContent,
            value,
            hasValue: true // type === 'sparseArrays' && value
          });
          jml(root, fieldset);
          return root;
        },
        /**
         * @this {ArrayHolder}
         * @type {AddMapElement}
         */
        $addMapElement () {
          itemIndex++;
          const arrayItems = this.$getArrayItems();
          // const className = `${type}Item`;
          const fieldset = jml('fieldset', [
            buildLegend({
              // className,
              // type,
              // arrayItems,
              itemIndex,
              typeNamespace,
              propName: undefined
            })
          ], arrayItems);
          return fieldset;
        },
        /**
         * @this {ArrayHolder}
         * @param {{propName: string}} cfg
         * @returns {HTMLFieldSetElement}
         */
        $addArrayElement (cfg) {
          const {propName} = cfg;
          itemIndex++;
          const arrayItems = this.$getArrayItems();
          // const className = `${type}Item`;
          const fieldset = jml('fieldset', [
            buildLegend({
              // className,
              // type,
              // arrayItems,
              itemIndex,
              typeNamespace,
              propName
            })
          ], arrayItems);
          return fieldset;
        },
        /**
         * @this {ArrayHolder}
         * @returns {HTMLElement}
         */
        $getArrayItems () {
          return /** @type {HTMLElement} */ (
            /** @type {Element} */ (this.lastElementChild).lastElementChild
          );
        }
      }
    }, [
      ['span', {
        title: specificSchemaObject?.description
      }, [
        specificSchemaObject
          ? '—'
          : DOM.initialCaps(/** @type {import('../types.js').AvailableType} */ (
            type
          )).replace(/s$/u, '')
      ]],
      nbsp.repeat(2),
      ['button', {$on: {click (/** @type {Event} */ e) {
        e.preventDefault();
        const {target} = e;
        const arrayContents = /** @type {HTMLDivElement} */ ($e(
          /** @type {HTMLElement} */
          (/** @type {HTMLElement} */ (target).closest('.arrayHolder')),
          '.arrayContents'
        ));
        arrayContents.hidden = !arrayContents.hidden;
        /** @type {HTMLElement} */ (
          target
        ).textContent = arrayContents.hidden ? '+' : '-';
      }}}, ['-']],
      ['div', {class: 'arrayContents'}, [
        !recordMode && this.array
          ? ['div', {
            title: specificSchemaObject
              ? (type === 'filelist'
                ? '(a FileList)'
                : type === 'set'
                  ? '(a Set)'
                  : type === 'map'
                    ? '(a Map)'
                    : tupleMode
                      ? '(a tuple)'
                      : '(an Array)')
              : undefined
          }, [
            type === 'filelist'
              ? (specificSchemaObject?.description ?? 'FileList') + ' length: '
              : type === 'set'
                ? (specificSchemaObject?.description ?? 'Set') + ' size: '
                : type === 'map'
                  ? (specificSchemaObject?.description ?? 'Map') + ' size: '
                  : (specificSchemaObject?.description ?? 'Array') +
                    ' length: ',
            ['span', [
              (value && (type === 'set' || type === 'map')
                ? value.size
                : value.length) || 0
            ]]
          ]]
          : (recordMode
            ? specificSchemaObject?.description ?? 'Record'
            : ''),
        ['div', {
          class: 'arrayItems'
        }]
      ]]
    ]);
    return [div];
  },
  getInput ({root}) {
    // One element we are guaranteed to have for adding validation
    return /** @type {HTMLButtonElement} */ ($e(root, 'button'));
  },
  // Unlike other items, we don't use the `value`, as it wil always be
  //    an array (or object if called by that method) and we handle the
  //    population of the array in the callback
  editUI ({
    typeNamespace, buildTypeChoices, format, // resultType,
    formats, types, specificSchemaObject, schemaFallingBack, schemaContent,
    type, forcedState, topRoot, value: objectValue, bringIntoFocus = true
  }) {
    const {sparse} = this;
    // eslint-disable-next-line consistent-this -- Clearer
    const parentTypeObject = this;

    // `record`/`tuple` are not distinct types; they are `object`/`array` whose
    //   associated schema refines them (map-style key/value controls for a
    //   record, positional `items`/`rest` for a tuple). Detect the refinement
    //   from the schema.
    const recordMode = specificSchemaObject?.type === 'record' ||
      specificSchemaObject?.type === 'looseRecord';
    const tupleMode = specificSchemaObject?.type === 'tuple';

    // A `record` refines `object` but, for legend numbering/reordering, behaves
    //   like the array-based types did when it was its own (`array: true`) type.
    const parentIsArrayLike = parentTypeObject.array || recordMode;

    // Keep the historical per-item CSS class names (`recordItem`, `tupleItem`)
    //   even though the root type is now `object`/`array`.
    const itemType = recordMode ? 'record' : tupleMode ? 'tuple' : type;

    const itemAdjust = type === 'object' ? 1 : 0;
    let itemIndex = itemAdjust - 1;
    const editableProperties = type !== 'array' &&
      type !== 'set' && type !== 'map' && type !== 'filelist' &&
      !tupleMode && !recordMode; // arrayNonindexKeys and object?
    const mapProperties = type === 'map' || recordMode;

    /**
     * @param {string} message
     * @returns {string}
     */
    const getSchemaValidationMessage = (message) => {
      return types.getValidationMessage({
        message,
        schema: specificSchemaObject,
        typeSpecific: true
      }) ?? message;
    };

    const elementDesc = /** @type {import('zodexy').SzArray} */ (
      specificSchemaObject
    )?.element?.description ?? (type === 'set'
      ? /** @type {import('zodexy').SzSet} */ (
        specificSchemaObject
      )?.value?.description
      : type === 'filelist'
        ? /** @type {import('zodexy').SzArray} */ (
          /** @type {import('zodexy').SzCodec} */ (
            specificSchemaObject
          ).output
        ).element.description
        : undefined);

    /**
     * @param {HTMLInputElement} input
     * @param {true|undefined} alwaysFocus
     * @returns {void}
     */
    const bringFocus = (input, alwaysFocus) => {
      if (!(bringIntoFocus || alwaysFocus)) {
        return;
      }

      input.scrollIntoView();
      input.focus();
    };

    /**
     * @callback SwapGroup
     * @param {Element} holder
     * @param {"up"|"down"} direction
     * @returns {void}
     */

    /**
     * @type {SwapGroup}
     * @this {HTMLDivElement}
     */
    const $swapGroup = function (holder, direction) {
      const group = /** @type {HTMLElement} */ (holder.parentElement);
      const swapGroup = /** @type {HTMLElement} */ (group[
        (direction === 'up' ? 'previousElementSibling' : 'nextElementSibling')
      ]);
      /* istanbul ignore if -- Just a guard */
      if (!swapGroup || swapGroup.nodeName.toLowerCase() !== 'fieldset') {
        return;
      }
      if (!sparse && (!specificSchemaObject || parentIsArrayLike)) {
        const swapCountElem = DOM.filterChildElements(
          swapGroup, ['legend', 'span', `.${itemType}Item`]
        )[0];
        const baseCountElem = DOM.filterChildElements(group, [
          'legend', 'span', `.${itemType}Item`
        ])[0];

        const swap = swapCountElem.textContent;
        const base = baseCountElem.textContent;
        swapCountElem.textContent = base;
        baseCountElem.textContent = swap;
      } else {
        const swapCountElem = /** @type {HTMLInputElement & {$parseInt: ParseInt}} */
          (/**
            * @type {HTMLFieldSetElement & {$getPropertyInput: GetPropertyInput}}
            */ (
              group
            ).$getPropertyInput());
        const baseCountElem = /** @type {HTMLInputElement & {$parseInt: ParseInt}} */
          (/**
            * @type {HTMLFieldSetElement & {$getPropertyInput: GetPropertyInput}}
            */ (
              swapGroup
            ).$getPropertyInput());
        if (typeof swapCountElem.$parseInt() === 'number' ||
          typeof baseCountElem.$parseInt() === 'number'
        ) {
          const swap = swapCountElem.value;
          const base = baseCountElem.value;
          swapCountElem.value = base;
          baseCountElem.value = swap;
        }
      }
      /*
      const baseID = group.id;
      const swapID = swapGroup.id;
      swapGroup.id = baseID;
      group.id = swapID;
      */
      if (direction === 'up') {
        swapGroup.before(group);
      } else {
        group.before(swapGroup);
      }
      types.validateAllReferences({
        topRoot: /** @type {HTMLDivElement} */ (topRoot)
      }); // Needed

      /** @type {HTMLDivElement & {$redrawMoveArrows: RedrawMoveArrows}} */ (
        this
      ).$redrawMoveArrows();
    };

    /**
     * @type {RedrawMoveArrows}
     * @this {HTMLDivElement & {$swapGroup: SwapGroup}}
     */
    const $redrawMoveArrows = function () {
      if (tupleMode) { // Don't want to move non-rest items at least
        return;
      }
      DOM.filterChildElements(this, [
        'fieldset', `.${itemType}Item-arrowHolder-${typeNamespace}`
      ]).forEach((holder, j, arr) => {
        DOM.removeChildren(holder);
        if (arr.length === 1) { // Nowhere to move
          return;
        }

        let up = true, down = true;
        if (j === 0) {
          up = false;
        } else if (j === arr.length - 1) {
          down = false;
        }
        if (up) {
          jml('button', {$on: {click: () => {
            this.$swapGroup(holder, 'up');
          }}}, [U.upArrow], holder);
        }
        if (down) {
          jml('button', {$on: {click: () => {
            this.$swapGroup(holder, 'down');
          }}}, [U.downArrow], holder);
        }
      });
    };

    /**
     * @typedef {() => void} ValidateLegend
     */

    /**
     * @type {ValidateLegend}
     * @this {HTMLInputElement & {
     *   $arrayItems: HTMLDivElement & {
     *     $getPropertyInputs: GetPropertyInputs
     *   }
     * }}
     */
    const $validateLegend = function () {
      const propertyNameInputs = this.$arrayItems.$getPropertyInputs();
      const invalidStr = propertyNameInputs.some((input) => {
        return this !== input && input.value === this.value;
      })
        ? 'Duplicate property name'
        : '';

      // Don't validate if erring previously for other reason
      if (invalidStr) {
        this.setCustomValidity(
          invalidStr
        );
        this.reportValidity();
      }

      // Others may be ok (or problematic) now too

      // eslint-disable-next-line unicorn/no-unused-array-method-return -- Short-circuiting
      propertyNameInputs.some((input, /* typeNamespace, */ _i, arr) => {
        const invalidStr = arr.some((item) => {
          return input !== item && input.value === item.value;
        })
          ? 'Duplicate property name'
          : '';

        if (input.validity.valid ||
          // If we just found it had an invalid length, don't
          //   make it valid now
          /* istanbul ignore next -- How to replicate? */
          input.validationMessage !== 'Invalid length'
        ) {
          input.setCustomValidity(
            invalidStr
          );
          if (invalidStr) {
            // Might not want this as changes focus; if ok, will hopefully be
            //   marked as such elsewhere
            input.reportValidity();
          }
        }
        return invalidStr; // Don't give a chance to become valid
      });
    };

    /**
     * @typedef {HTMLDivElement & {
     *   $inputsExceedingLength: InputsExceedingLength,
     *   $getPropertyInputs: GetPropertyInputs,
     *   $redrawMoveArrows: RedrawMoveArrows
     *   $getMapKeySelects: GetMapKeySelects
     * }} ArrayItems
     */

    /**
     * @param {{
     *   className: string,
     *   splice: "append"|number|undefined,
     *   itemIndex: number,
     *   typeNamespace: string|undefined,
     *   arrayItems: ArrayItems,
     *   propName: string|undefined,
     *   required?: boolean,
     *   schema?: import('zodexy').SzType
     * }} cfg
     * @returns {import('jamilih').JamilihArray}
     */
    const buildLegend = ({
      className, splice, itemIndex, /* type, */ typeNamespace,
      arrayItems, propName, required, schema
    }) => {
      if (mapProperties) {
        const keyTypeSelection =
          /** @type {import('../typeChoices.js').BuildTypeChoices} */ (
            buildTypeChoices
          )({
            value: propName !== undefined && recordMode
              ? propName
              : undefined,
            setValue: propName !== undefined && recordMode,
            // Needed as false when map value supplied
            autoTrigger: propName === undefined || recordMode,
            format: /** @type {import('../formats.js').AvailableFormat} */ (
              format
            ),
            schemaOriginal: schemaContent,
            // Can also be a `Record`
            schemaContent: /** @type {import('zodexy').SzMap<any, any>} */ (
              specificSchemaObject
            )?.key,
            typeNamespace: 'key-type-choices-only'
          });
        return ['legend', [
          ['span', {
            class: 'mapKey',
            title: (
              type === 'map' &&
              /** @type {import('zodexy').SzMap<any, any>} */ (
                specificSchemaObject
              )?.key?.description
            )
              ? '(map key)'
              : recordMode &&
              /** @type {import('zodexy').SzRecord} */ (
                specificSchemaObject
              )?.key?.description
                ? '(record key)'
                : undefined
          }, [
            type === 'map'
              ? /** @type {import('zodexy').SzMap<any, any>} */ (
                specificSchemaObject
              )?.key?.description ?? 'Map key'
              : /** @type {import('zodexy').SzRecord} */ (
                specificSchemaObject
              )?.key?.description ?? 'Record key',
            ' '
          ]],
          ['span', {
            dataset: {prop: 'true'},
            className
          }, [String(itemIndex)]],
          ':',
          nbsp.repeat(2),

          ['span', {
            class: 'mapKeyHolder',
            $on: {
              change: [function () {
                /**
                 * @type {HTMLSpanElement & {
                 *   $validateMapKey: ValidateMapKey
                 * }}
                 */
                (this).$validateMapKey();

                // Needed?
                types.validateAllReferences({
                  topRoot: /** @type {HTMLDivElement} */ (topRoot)
                });
              }, true]
            },
            $custom: {
              /** @type {ValidateMapKey} */
              $validateMapKey () {
                const selects = arrayItems.$getMapKeySelects();

                setTimeout(() => {
                  const values = selects.map((select) => {
                    return select.$getValue();
                  });

                  const dupeIndex = values.findLastIndex((value, idx) => {
                    return values.some((val, index) => {
                      return idx !== index && sameValueZero(value, val);
                    });
                  });

                  if (dupeIndex === -1) {
                    return;
                  }
                  const select = selects[dupeIndex];
                  /* istanbul ignore if -- Should exist */
                  if (!select) {
                    return;
                  }

                  const control = select.hidden
                    ? /** @type {HTMLInputElement|HTMLTextAreaElement} */ ($e(
                      /** @type {HTMLDivElement} */ (
                        select.nextElementSibling
                      ), 'input,textarea'
                    ))
                    : select;

                  control.setCustomValidity(
                    `Duplicate ${type === 'map' ? 'Map' : 'Record'} key value`
                  );
                  control.reportValidity();
                }, 0);
              }
            }
          }, keyTypeSelection.domArray]
        ]];
      }

      /**
       * @callback ValidateLength
       * @param {boolean} [avoidDialog]
       * @returns {Promise<void>}
       */

      /**
       * @type {ValidateLength}
       * @this {HTMLInputElement & {
       *   $validateLength: ValidateLength
       * }}
       */
      const $validateLength = async function (avoidDialog) {
        if (!sparse) {
          return;
        }
        const inputsExceedingLength = arrayItems.$inputsExceedingLength();
        const exceedsLength = inputsExceedingLength.length;
        if (avoidDialog || !exceedsLength || !(/^\d+$/u).test(this.value)) {
          return;
        }
        await dialogs.confirm({
          message: 'You are attempting to add an (integer-based) ' +
            'array item beyond the length. Click "Ok" to allow to ' +
            'permit and extend the array length or "Cancel" otherwise.'
        });
        const arrLengthInput =
          /** @type {HTMLInputElement & {$oldvalue: string}} */ (
            $e(
              /** @type {HTMLElement} */ (arrayItems.previousElementSibling),
              'input'
            )
          );
        const highest = Math.max(...inputsExceedingLength.map(
          (i) => Math.trunc(Number(i.value))
        ));
        arrLengthInput.value = String(highest + 1);
        arrLengthInput.$oldvalue = String(highest + 1);
        // Does have potential side effects calling `$inputsExceedingLength`
        this.$validateLength(true);
      };

      if (editableProperties) {
        // console.log('PROPNAME', propName, schema, specificSchemaObject);
        const description = /** @type {import('zodexy').SzObject} */ (
          specificSchemaObject
        )?.properties?.[/** @type {string} */ (propName)]?.description;
        const optionalProperties = Object.entries(
          /** @type {import('zodexy').SzObject} */ (
            specificSchemaObject
          )?.properties ?? {}
        ).map(([prop, val]) => {
          if (!val.isOptional) {
            return null;
          }
          return prop;
        }).filter(Boolean);
        optionalPropertyId++;
        const initialValue = sparse
          ? (
            splice === 'append'
              ? ''
              : (propName !== undefined ? propName : itemIndex)
          )
          : propName || '';
        return /** @type {import('jamilih').JamilihArray} */ (['legend', [
          sparse
            ? elementDesc ?? 'Item'
            : {'#': required
              ? [
                ['b', {
                  className,
                  title: (elementDesc ?? description) ? propName : undefined
                }, [
                  elementDesc ?? description ?? propName
                ]]
              ]
              : [
                ['span', {
                  className: `${className}_propertyHolder${optionalPropertyId}`
                }, [
                  ...(specificSchemaObject && propName) // Optional but has name
                    ? [
                      ['b', [
                        (() => {
                          const propSchema =
                            /** @type {import('zodexy').SzObject} */ (
                              specificSchemaObject
                            )?.properties?.[propName];
                          return propSchema
                            ? propSchema.description ?? propName
                            : /** @type {import('zodexy').SzObject} */ (
                              specificSchemaObject
                            /* istanbul ignore next -- Guard */
                            )?.catchall?.description ?? propName;
                        })()
                      ]]
                    ]
                    : [
                      'Property ',
                      ['span', {className}, [String(itemIndex)]],
                      ':'
                    ]
                ]]
              ]},
          nbsp.repeat(2),
          specificSchemaObject && !required
            ? ['datalist', {
              id: `optionalProperties_${optionalPropertyId}`
            }, optionalProperties.map((optionalProperty) => {
              return ['option', {value: optionalProperty}];
            })]
            : '',
          ['input', {
            list: specificSchemaObject && !required
              ? `optionalProperties_${optionalPropertyId}`
              : undefined,
            style: {
              display: required && type !== 'arrayNonindexKeys'
                ? 'none'
                : 'block'
            },
            disabled: required && type === 'arrayNonindexKeys',
            value: initialValue,
            dataset: {prop: true, object: true, optionalPropertyId},
            /*
            // Works but we do want to let the user input non-integer
            type: sparse ? 'number' : 'text',
            step: sparse ? 1 : null,
            pattern: sparse ? '\\d' : '',
            */
            $custom: {
              /**
               * @this {HTMLInputElement & {
               *   $validateLength: ValidateLength,
               *   $validateLegend: ValidateLegend
               * }}
               * @type {Validate}
               */
              async $validate () {
                try {
                  try {
                    await this.$validateLength();
                  } catch {
                    // Give chance for other validations if cancelled
                  }
                  // Don't give chance to validate positively if failed
                  /* await */ this.$validateLegend();
                  // Todo (low): We could make this more efficient by waiting
                  //   until all added (when pre-populating)
                  types.validateAllReferences({
                    topRoot: /** @type {HTMLDivElement} */ (topRoot)
                  }); // Needed
                } catch {}
              },

              /**
               * @type {ParseInt}
               * @this {HTMLInputElement}
               */
              $parseInt () {
                if (!(/^\d+$/u).test(this.value)) {
                  return false;
                }
                return Math.trunc(Number(this.value));
              },
              $validateLegend,
              $arrayItems: arrayItems,
              $validateLength,
              /**
               * @this {HTMLInputElement}
               * @param {Parameters<Resort>[0]} cfg
               */
              $resort (cfg) {
                const {alwaysFocus} = cfg;
                const inputs = /**
                                * @type {(HTMLInputElement & {
                                *   $parseInt: ParseInt
                                * })[]}
                                */
                  (/**
                    * @type {HTMLInputElement & {
                    *   $arrayItems: HTMLDivElement & {
                    *     $getPropertyInputs: GetPropertyInputs
                    *   }
                    * }}
                    */ (
                      this
                    ).$arrayItems.$getPropertyInputs());
                if (inputs.length === 1) {
                  return;
                }
                /**
                 * @param {Element} el
                 * @returns {Element}
                 */
                const getFieldset = (el) => /** @type {HTMLFieldSetElement} */ (
                  el.closest('fieldset')
                );
                const thisFieldset = getFieldset(this);
                const intVal = /** @type {HTMLInputElement & {$parseInt: ParseInt}} */ (
                  this
                ).$parseInt();
                if (intVal === false) {
                  inputs.reverse();
                  // eslint-disable-next-line unicorn/no-unused-array-method-return -- Short-circuiting
                  inputs.some((input) => {
                    if (input === this) { // No need to search further
                      return true;
                    }
                    const intValOlder =
                      /** @type {HTMLInputElement & {$parseInt: ParseInt}} */ (
                        input
                      ).$parseInt();
                    // Not sorting non-integers
                    if (typeof intValOlder !== 'number') {
                      return false;
                    }
                    getFieldset(input).after(thisFieldset);
                    bringFocus(this, alwaysFocus);
                    arrayItems.$redrawMoveArrows();
                    return true;
                  });
                  return;
                }

                /**
                 * @param {boolean} [latest]
                 * @returns {boolean}
                 */
                const getNearest = (latest) => {
                  /**
                   * @type {HTMLInputElement|undefined}
                   */
                  let nearest;

                  // eslint-disable-next-line unicorn/no-unused-array-method-return -- Short-circuiting
                  inputs.some((input) => {
                    if (input === this) {
                      return false;
                    }
                    const intValOlder = input.$parseInt();
                    if (typeof intValOlder !== 'number') {
                      if (!nearest) {
                        // May be no other higher ints or
                        //   no other ints at all (but some others)
                        nearest = input;
                      }
                      return false;
                    }

                    /**
                     * @param {Integer} a
                     * @param {Integer} b
                     * @returns {boolean}
                     */
                    const cmp = (a, b) => {
                      return latest ? a > b : a < b;
                    };
                    if (cmp(intVal, intValOlder) &&
                      (!nearest || cmp(
                        intValOlder, Math.trunc(Number(nearest.value))
                      ))
                    ) {
                      nearest = input;
                      return (intVal + (latest ? -1 : 1)) === intValOlder;
                    }
                    return false;
                  });
                  if (!nearest) {
                    return false;
                  }
                  const method = latest ? 'after' : 'before';
                  // Ensure move *after* splice that will occur after this
                  setTimeout(() => {
                    /* istanbul ignore if */
                    if (!nearest) {
                      return;
                    }
                    getFieldset(nearest)[method](thisFieldset);
                    bringFocus(this, alwaysFocus);
                    arrayItems.$redrawMoveArrows();
                  }, 0);
                  return true;
                };
                if (!getNearest()) {
                  getNearest(true);
                }
              }
            },
            $on: {
              /**
               * @this {HTMLInputElement}
               */
              input () {
                if (!specificSchemaObject && !schema) {
                  return;
                }
                const propHolder = /** @type {HTMLElement} */ (
                  $e(arrayItems, `.${className}_propertyHolder${
                    this.dataset.optionalPropertyId
                  }`)
                );
                DOM.removeChildren(propHolder);
                const propSchema = /** @type {import('zodexy').SzObject} */ (
                  specificSchemaObject
                )?.properties?.[this.value];
                jml('b', [
                  propSchema
                    ? propSchema.description ?? this.value
                    : /** @type {import('zodexy').SzObject} */ (
                      specificSchemaObject
                    )?.catchall?.description ?? this.value
                ], propHolder);
              },
              /**
               * @param {Event} e
               * @this {HTMLInputElement & {
               *   $validate: Validate,
               *   $resort: Resort
               * }}
               */
              change (e) {
                const neverProperty = /** @type {import('zodexy').SzObject} */ (
                  specificSchemaObject
                )?.properties?.[
                /** @type {string} */ (this.value)
                ]?.type === 'never';

                let invalid = false;
                if (neverProperty) {
                  this.setCustomValidity('Never value');
                  this.reportValidity();
                  this.style.backgroundColor = 'pink';

                  invalid = true;
                } else if (this.list && !parentTypeObject.array) {
                  const dataListValues = [
                    ...this.list.options
                  ].map(({value}) => value);

                  if (
                    !dataListValues.includes(this.value) &&
                    /** @type {import('zodexy').SzObject} */ (
                      specificSchemaObject
                    ).catchall?.type === 'never'
                  ) {
                    this.setCustomValidity('Bad value');
                    this.reportValidity();
                    this.style.backgroundColor = 'pink';
                    invalid = true;
                  } else {
                    this.style.backgroundColor = 'revert-layer';
                    this.setCustomValidity('');
                    this.reportValidity();
                    const {optionalPropertyId} = this.dataset;
                    let placeholder = /** @type {HTMLElement} */ (
                      $e(
                        arrayItems,
                        `.optionalProperties-placeholder${optionalPropertyId}`
                      )
                    );
                    if (!placeholder) {
                      placeholder = /** @type {HTMLElement} */ ($e(
                        /** @type {HTMLElement} */
                        (this.parentElement?.parentElement),
                        `.property-placeholder`
                      )?.previousElementSibling);
                      // Remove extra select element too
                      placeholder.previousElementSibling?.remove();
                    }
                    placeholder.replaceWith(
                      jml('div', {
                        className:
                          `optionalProperties-placeholder${optionalPropertyId}`
                      }, [
                        ...buildTypeChoicesForProperty({
                          propName: this.value,
                          schema:
                          /** @type {import('zodexy').SzObject} */
                          (specificSchemaObject)?.properties?.[this.value] ??
                          /** @type {import('zodexy').SzObject} */ (
                            specificSchemaObject
                          )?.catchall ??
                          {type: 'any'}
                        })
                      ])
                    );
                  }
                }

                if (invalid) {
                  const placeholder = /** @type {HTMLElement} */ (
                    $e(
                      arrayItems,
                      `.optionalProperties-placeholder${optionalPropertyId}`
                    )
                  );
                  DOM.removeChildren(placeholder);
                } else {
                  // Should this be awaited or awaited after stopPropagation?
                  this.$validate();
                }
                // We don't want form `onchange` to run
                //   `$checkForKeyDuplicates` again
                e.stopPropagation();
                this.$resort({alwaysFocus: true});
              }
            },
            class: `propertyName-${typeNamespace}`
          }]
        ]]);
      }

      const fileDesc = type === 'filelist'
        ? specificSchemaObject?.description
        : undefined;

      return /** @type {import('jamilih').JamilihArray} */ (['legend', [
        elementDesc
          ? ''
          : fileDesc
            ? `${fileDesc} `
            : schema?.description
              ? `${schema?.description} `
              : tupleMode && /** @type {import('zodexy').SzTuple} */ (
                specificSchemaObject
              )?.rest?.description
                ? `${/** @type {import('zodexy').SzTuple} */ (
                  specificSchemaObject
                )?.rest?.description} `
                : 'Item ',
        ['span', {
          dataset: {prop: true, array: true},
          className
        }, [
          elementDesc
            ? `${elementDesc} ${itemIndex + 1}`
            : propName !== undefined
              ? propName
              : String(itemIndex)
        ]]
      ]]);
    };

    /**
     * @param {HTMLDivElement & {
     *   $getPropertyInputs: GetPropertyInputs
     * }} arrayItems
     * @returns {void}
     */
    const decrementItemIndex = (arrayItems) => {
      if (sparse) {
        itemIndex = /** @type {(HTMLInputElement & {$parseInt: ParseInt})[]} */ (
          arrayItems.$getPropertyInputs()
        ).reduce(
          (highest, input) => {
            const intVal = input.$parseInt();
            return intVal !== false && intVal > highest ? intVal : highest;
          },
          -1
        );
      } else {
        itemIndex--;
      }
    };

    /**
     * Resolves the schema to use for a child (property/item) type-chooser.
     * @param {string|undefined} propName
     * @param {import('zodexy').SzType|undefined} schema Per-item schema (tuples)
     * @returns {import('zodexy').SzType|undefined}
     */
    const getChildSchema = (propName, schema) => {
      if (schema) {
        return schema;
      }
      if (tupleMode) {
        return /** @type {import('zodexy').SzTuple} */ (
          specificSchemaObject
        ).rest;
      }
      if (recordMode) {
        return /** @type {import('zodexy').SzRecord<any, any>} */ (
          specificSchemaObject
        )?.value;
      }
      if (mapProperties) {
        return /** @type {import('zodexy').SzMap<any, any>} */ (
          specificSchemaObject
        )?.value;
      }
      if (type === 'set') {
        return /** @type {import('zodexy').SzSet} */ (
          specificSchemaObject
        )?.value;
      }
      // This is a hack specifically for filelist; for the desired solution,
      //   see: https://github.com/colinhacks/zod/issues/6413
      if (type === 'filelist') {
        return /** @type {import('zodexy').SzArray} */ (
          /** @type {import('zodexy').SzCodec} */ (
            specificSchemaObject
          ).output
        ).element;
      }
      if (type === 'array' || type === 'arrayNonindexKeys') {
        return /** @type {import('zodexy').SzArray} */ (
          specificSchemaObject
        )?.element;
      }
      return /** @type {import('zodexy').SzObject} */ (
        specificSchemaObject
      )?.properties?.[/** @type {string} */ (propName)];
    };

    /**
     * @param {{
     *   propName: string|undefined,
     *   schema?: import('zodexy').SzType,
     *   schemaIdx?: number,
     *   autoTrigger?: boolean
     * }} cfg
     */
    const buildTypeChoicesForProperty = ({
      propName, schema, schemaIdx, autoTrigger
    }) => {
      return /** @type {import('../typeChoices.js').BuildTypeChoices} */ (
        buildTypeChoices
      )({
        autoTrigger,
        // resultType,
        topRoot: /** @type {HTMLDivElement} */ (topRoot),
        format: /** @type {import('../formats.js').AvailableFormat} */ (format),
        schemaOriginal: schemaContent,
        schemaIdx,
        schemaContent: getChildSchema(propName, schema),
        state: parentTypeObject.filelist
          ? 'filelistArray'
          : forcedState ?? type,
        // itemIndex,
        typeNamespace
      }).domArray;
    };

    /**
     * @param {Integer} [offset]
     * @returns {boolean}
     */
    function preventAdding (offset = 0) {
      if (tupleMode) {
        if (/** @type {import('zodexy').SzTuple} */ (
          specificSchemaObject
        )?.rest?.type === 'never') {
          dialogs.alert(
            getSchemaValidationMessage(
              'Tuple has rest type "never", so one cannot add to it.'
            )
          );
          return true;
        }
        if (
          /** @type {import('zodexy').SzTuple} */ (
            specificSchemaObject
          )?.items?.[0]?.type === 'never'
        ) {
          dialogs.alert(
            getSchemaValidationMessage(
              'Tuple has items type "never", so one cannot add to it.'
            )
          );
          return true;
        }
        return false;
      }
      switch (type) {
      case 'set': {
        if (/** @type {import('zodexy').SzSet} */ (
          specificSchemaObject
        )?.value?.type === 'never') {
          dialogs.alert(getSchemaValidationMessage(
            'Set has type "never", so one cannot add to it.'
          ));
          return true;
        }

        const {maxSize} = /** @type {import('zodexy').SzSet} */ (
          specificSchemaObject
        ) ?? {};
        if (maxSize !== undefined &&
          [...arrayItems.children].length + offset > maxSize
        ) {
          dialogs.alert(getSchemaValidationMessage(
            `You cannot add beyond the \`maxSize\` of the Set`
          ));
          return true;
        }
        break;
      } case 'map': {
        const {max} = /** @type {import('zodexy').SzMap<any, any>} */ (
          specificSchemaObject
        ) ?? {};
        if (max !== undefined &&
          [...arrayItems.children].length + offset > max
        ) {
          dialogs.alert(getSchemaValidationMessage(
            `You cannot add beyond the \`max\` of the Map`
          ));
          return true;
        }
        break;
      } case 'array': case 'arrayNonindexKeys': {
        if (/** @type {import('zodexy').SzArray} */ (
          specificSchemaObject
        )?.element?.type === 'never') {
          dialogs.alert(getSchemaValidationMessage(
            'Array has type "never", so one cannot add to it.'
          ));
          return true;
        }

        const {maxLength} = /** @type {import('zodexy').SzArray} */ (
          specificSchemaObject
        ) ?? {};

        if (maxLength !== undefined &&
          arrayItems.$getArrayLength() + offset > maxLength
        ) {
          dialogs.alert(getSchemaValidationMessage(
            `You cannot add beyond the \`maxLength\` of the array`
          ));
          return true;
        }
        break;
      } default:
        break;
      }

      return false;
    }

    /**
     * @callback AddArrayElement
     * @param {{
     *   propName?: string,
     *   splice?: "append"|number,
     *   alwaysFocus?: true
     *   required?: boolean
     *   autoTrigger?: boolean,
     *   schema?: import('zodexy').SzType,
     *   schemaIdx?: number
     * }} cfg
     * @returns {void}
     */

    /**
     * @type {AddArrayElement}
     * @this {HTMLElement & {
     *   $getArrayItems: GetArrayItems,
     *   $addArrayElement: AddArrayElement,
     *   $getMapKeySelects?: GetMapKeySelects
     * }}
     */
    const $addArrayElement = function ({
      propName, splice, alwaysFocus, required, schema, schemaIdx, autoTrigger
    }) {
      const arrayItems = this.$getArrayItems();
      if (sparse) {
        if (propName) {
          const intVal = propName.match(/^\d+$/u) && Math.trunc(Number(propName));
          if (typeof intVal === 'number') {
            itemIndex = intVal;
          }
        } else if (typeof splice === 'number') {
          itemIndex = splice + 1;
        } else if (typeof splice !== 'string') {
          itemIndex = /** @type {(HTMLInputElement & {$parseInt: ParseInt})[]} */ (
            /** @type {HTMLDivElement & {$getPropertyInputs: GetPropertyInputs}} */
            (arrayItems).$getPropertyInputs()
          ).reduce(
            (highest, input) => {
              const intVal = input.$parseInt();
              return intVal !== false && intVal > highest ? intVal : highest;
            },
            -1
          ) + 1;
        }
      } else {
        itemIndex++;
      }
      const thisButton = this; // eslint-disable-line consistent-this -- Clarity
      const className = `${itemType}Item`;
      const fieldset = jml('fieldset',
        {
          dataset: required ? {required: 'required'} : {},
          $on: {
            change: [() => {
              if (type !== 'set') {
                return;
              }
              setTimeout(() => {
                const root = div;
                const values = /** @type {any[]} */ (
                  parentTypeObject.getValue.call({
                    ...parentTypeObject,
                    set: false
                  }, {
                    root,
                    stateObj: {
                      types,
                      formats:
                      /** @type {import('../formats.js').default} */ (
                        formats
                      )
                    }
                  })
                );
                // console.log('values', values);

                const dupeIndex = values.findLastIndex((value, idx) => {
                  return values.some((val, index) => {
                    return idx !== index && value === val;
                  });
                });

                if (dupeIndex === -1) {
                  return;
                }
                const fieldsets = arrayItems.children;
                const controls = [...fieldsets].map((fieldset) => {
                  const root = /** @type {HTMLDivElement} */ (
                    $e(fieldset, 'div[data-type]')
                  );
                  /* istanbul ignore if -- Should err first? */
                  if (!root) {
                    return null;
                  }
                  return types.getFormControlForRoot(root);
                });

                const control = controls[dupeIndex];
                /* istanbul ignore if -- Should exist */
                if (!control) {
                  return;
                }

                control.setCustomValidity(
                  'Duplicate Set value'
                );
                control.reportValidity();
              }, 10);
            }, true]
          },
          $custom: {
            /** @type {GetPropertyInput} */
            $getPropertyInput () {
              return /** @type {HTMLInputElement} */ (
                DOM.filterChildElements(
                  /**
                   * @type {HTMLFieldSetElement & {
                   *   $getPropertyInput: GetPropertyInput
                   * }}
                   */ (this),
                  ['legend', `input.propertyName-${typeNamespace}`]
                ).pop()
              );
            }
          }
        },
        [
          buildLegend({
            className,
            splice,
            itemIndex,
            // type,
            typeNamespace,
            arrayItems,
            propName,
            required,
            schema
          })
        ],
        arrayItems);

      // We must ensure fieldset is built before passing it
      jml({'#': [
        ['span', {
          class: 'mapValue',
          title: type === 'map' &&
          /** @type {import('zodexy').SzMap<any, any>} */ (
            specificSchemaObject
          )?.value?.description
            ? '(map value)'
            : recordMode &&
            /** @type {import('zodexy').SzRecord} */ (
              specificSchemaObject
            )?.value?.description
              ? '(record value)'
              : undefined
        }, [
          type === 'map'
            ? /** @type {import('zodexy').SzMap<any, any>} */ (
              specificSchemaObject
            )?.value?.description ?? 'Map value'
            : recordMode
              ? /** @type {import('zodexy').SzRecord} */ (
                specificSchemaObject
              )?.value?.description ?? 'Record value'
              : '',
          ' '
        ]],
        ...(specificSchemaObject && !propName && !parentIsArrayLike
          ? [jml('span', {
            className: `optionalProperties-placeholder${optionalPropertyId}`
          })]
          : buildTypeChoicesForProperty({
            propName, schema, schemaIdx, autoTrigger
          })),
        ['span', {className: 'property-placeholder'}],
        nbsp.repeat(2),
        ['button', {
          disabled: tupleMode && required &&
            // The last item of a tuple can have content after it, but earlier
            //   items cannot
            /** @type {import('zodexy').SzTuple} */
            (specificSchemaObject)?.items?.length - 1 > itemIndex,
          $on: {click (/** @type {Event} */ e) {
            e.preventDefault();
            // e.stopPropagation();

            if (preventAdding(1)) {
              return;
            }

            /** @type {number | "append" | undefined} */
            let splice;
            if (sparse) {
              const prevInputVal =
                /**
                 * @type {HTMLInputElement & {
                 *   $parseInt: ParseInt
                 * }}
                 */ (
                  /**
                   * @type {HTMLFieldSetElement & {
                   *   $getPropertyInput: GetPropertyInput
                   * }}
                   */ (
                    fieldset
                  ).$getPropertyInput()).$parseInt();
              splice = prevInputVal === false ? 'append' : prevInputVal;
            }
            thisButton.$addArrayElement({
              splice, alwaysFocus: true, schema
            });
            const newArrayFieldset =
              /** @type {Element & {$getPropertyInput: GetPropertyInput}} */ (
                arrayItems.lastElementChild
              );
            fieldset.after(newArrayFieldset);
            if (sparse || (
              // Because schemas (with descriptions?) don't use className for
              //   property count (and the else block will rewrite the
              //   property name)
              !parentIsArrayLike &&
              (specificSchemaObject || schema)
            )) {
              const newPrevInput = /** @type {HTMLInputElement} */ (
                newArrayFieldset.$getPropertyInput()
              );
              bringFocus(newPrevInput, true);
            } else {
              DOM.filterChildElements(
                arrayItems, [
                  'fieldset', 'legend', '.' + className
                ]
              ).forEach((span, i) => {
                span.textContent = elementDesc
                  ? `${elementDesc} ${i + itemAdjust + 1}`
                  : String(i + itemAdjust);
              });
            }
            // Maybe not needed as addition (without renumbering)
            //   wouldn't yet add type
            types.validateAllReferences({
              topRoot: /** @type {HTMLDivElement} */ (topRoot)
            });
            arrayItems.$redrawMoveArrows();
          }}
        }, ['+']],
        [
          'button',
          {
            disabled: required,
            $on: {
              click (/** @type {Event} */ e) {
                e.preventDefault();
                // e.stopPropagation();
                fieldset.remove();
                decrementItemIndex(arrayItems);
                if (!sparse &&
                  (!specificSchemaObject || parentIsArrayLike)
                ) {
                  DOM.filterChildElements(arrayItems, [
                    'fieldset', 'legend', '.' + className
                  ]).forEach((span, i) => {
                    span.textContent = elementDesc
                      ? `${elementDesc} ${i + itemAdjust + 1}`
                      : String(i + itemAdjust);
                  });
                }
                // Maybe not needed as removal would remove circular
                types.validateAllReferences({
                  topRoot: /** @type {HTMLDivElement} */ (topRoot)
                });

                /**
                 * @type {HTMLDivElement & {
                 *   $redrawMoveArrows: RedrawMoveArrows
                 * }}
                 */
                (arrayItems).$redrawMoveArrows();
              }
            }
          }, ['x']
        ],
        ['span', {
          class: `${itemType}Item-arrowHolder-${typeNamespace}`
        }, []]
      ]}, fieldset);

      // Need to validate if adding more than one property (in
      //   case two have empty string)
      if (editableProperties) {
        const pns = arrayItems.$getPropertyInputs();
        /* istanbul ignore else -- Just a guard */
        if (pns.length) {
          const input =
            /**
             * @type {HTMLInputElement & {
             *   $validate: Validate,
             *   $resort: Resort
             * }}
             */
            (pns.pop());
          input.$validate();
          input.$resort({alwaysFocus});
          bringFocus(input, alwaysFocus);
        }
      }
      arrayItems.$redrawMoveArrows();
    };

    /**
     * @callback GetArrayLength
     * @returns {number}
     */

    /**
     * @type {GetArrayLength}
     * @this {HTMLDivElement}
     */
    const $getArrayLength = function () {
      return Number(/** @type {HTMLInputElement} */ (
        $e(/** @type {HTMLElement} */ (this.previousElementSibling), 'input')
      ).value);
    };

    /**
     * @type {InputsExceedingLength}
     * @this {HTMLDivElement & {
     *   $getArrayLength: GetArrayLength,
     *   $getPropertyInputs: GetPropertyInputs
     * }}
     */
    const $inputsExceedingLength = function () {
      const highestExpectedIndex = this.$getArrayLength() - 1;
      return this.$getPropertyInputs().filter(
        (input) => input.value.match(/^\d+$/u)
      ).filter((input) => {
        // We cycle through all elements to set the proper validity on them
        const val = Math.trunc(Number(input.value));
        const exceedsLength = val > highestExpectedIndex;
        input.setCustomValidity(
          exceedsLength
            ? 'Invalid length'
            : ''
        );
        input.reportValidity(); // Is this having an effect now?
        return exceedsLength;
      });
    };
    const addArrayElement = /** @type {import('jamilih').JamilihArray} */ (
      ['button', {
        class: 'addArrayElement',
        // is: 'add-array-element',
        $custom: {
          $addArrayElement,
          /**
           * @type {GetArrayItems}
           * @this {HTMLDivElement}
           */
          $getArrayItems () {
            const prevSibling = /**
                                 * @type {HTMLDivElement & {
                                 *   $inputsExceedingLength: InputsExceedingLength,
                                 *   $getPropertyInputs: GetPropertyInputs,
                                 *   $redrawMoveArrows: RedrawMoveArrows,
                                 *   $getMapKeySelects: GetMapKeySelects
                                 * }}
                                 */ (this.previousElementSibling);
            return prevSibling;
          }
        },
        $on: {click () {
          if (preventAdding(1)) {
            return;
          }

          // Todo: Should really check if all object properties have been used,
          //        and stop and warn if so
          /**
           * @type {HTMLButtonElement & {
           *   $addArrayElement: AddArrayElement,
           *   $getArrayItems: GetArrayItems
           * }}
           */
          (this).$addArrayElement({alwaysFocus: true});
          // Maybe not needed as addition (without renumbering)
          //   wouldn't yet add type
          types.validateAllReferences({
            topRoot: /** @type {HTMLDivElement} */ (topRoot)
          });
        }}
      }, ['+ Item']]
    );

    const arrayContentsFirstChild = sparse
      ? ['div', [
        ['label', [
          'Array length: ',
          ['input', {
            type: 'number',
            value: (objectValue && objectValue.length) || 0,
            step: 1,
            size: 4,
            class: 'arrayLength',
            pattern: String.raw`\d`,
            $on: {
              /**
               * @this {HTMLInputElement & {
               *   $oldvalue: string
               * }}
               * @returns {Promise<void>}
               */
              async change () {
                if (preventAdding()) {
                  /* istanbul ignore next -- Just a guard */
                  this.value = this.$oldvalue ?? this.defaultValue;
                  return;
                }

                const arrayItems = $e(
                  /** @type {HTMLElement} */ (
                    this.closest('.arrayContents')
                  ),
                  '.arrayItems'
                );
                const propInputsBeyondLength =
                  /**
                   * @type {HTMLElement & {
                   *   $inputsExceedingLength: InputsExceedingLength
                   * }}
                   */
                  (arrayItems).$inputsExceedingLength();
                try {
                  if (propInputsBeyondLength.length) {
                    await dialogs.confirm({
                      message: 'Your new length will truncate the ' +
                        'array causing items to be removed. Continue?'
                    });
                    propInputsBeyondLength.forEach((input) => {
                      const fieldset = /** @type {HTMLFieldSetElement} */ (
                        input.closest('fieldset')
                      );
                      if (!fieldset.matches('[data-required]')) {
                        fieldset.remove();
                      } else {
                        // If not truncating the array, put the length back
                        const arrayLengthInput =
                          /**
                           * @type {HTMLInputElement & {
                           *   $oldvalue: string
                           * }}
                           */ (
                            $e(div, '.arrayLength')
                          );
                        arrayLengthInput.value = String(Math.trunc(Number(arrayLengthInput.value)) + 1);
                      }
                    });
                    // Maybe not needed as removal would remove circular
                    types.validateAllReferences({
                      topRoot: /** @type {HTMLDivElement} */ (topRoot)
                    });
                  } else {
                    const element = /** @type {import('zodexy').SzArray} */ (
                      specificSchemaObject
                    )?.element;
                    if (!['void', 'undefined'].includes(
                      element?.type
                    ) && (
                      element?.type !== 'union' ||
                      /** @type {import('zodexy').SzUnion} */
                      (element)?.options?.every((option) => {
                        return !['void', 'undefined'].includes(option.type);
                      })
                    )) {
                      const diff = Math.trunc(Number(this.value)) -
                        Math.trunc(Number(this.$oldvalue ?? this.defaultValue));
                      for (let i = 0; i < diff; i++) {
                        // Timeout needed by Cypress at least or will get
                        //   validation triggered which prevents moving forward
                        setTimeout(() => {
                          div.$addArrayElement({});
                        }, 0);
                      }
                    }
                  }
                  this.$oldvalue = this.value;
                } catch {
                  this.value = this.$oldvalue; // Revert
                }
              }
            }
          }]
        ]]
      ]]
      : '';

    const arrayItems =
      /** @type {HTMLDivElement & {$getArrayLength: GetArrayLength}} */ (
        jml('div', {
          class: 'arrayItems',
          $custom: {
            $swapGroup, $redrawMoveArrows, $getArrayLength,
            $inputsExceedingLength,

            /**
             * Only relevant for maps.
             * @type {GetMapKeySelects}
             * @this {HTMLDivElement}
             */
            $getMapKeySelects () {
              const selects =
                /**
                 * @type {(HTMLSelectElement & {
                 *   $getValue: import('../typeChoices.js').GetValue}
                 * )[]}
                 */ (DOM.filterChildElements(
                  this,
                  [
                    'fieldset',
                    'legend:first-child',
                    'span.mapKeyHolder',
                    'select.typeChoices-key-type-choices-only'
                  ]
                ));
              return selects;
            },

            /**
             * @type {GetPropertyInputs}
             * @this {HTMLDivElement}
             */
            $getPropertyInputs () {
              return /** @type {HTMLInputElement[]} */ (DOM.filterChildElements(
                this,
                ['fieldset', 'legend', `input.propertyName-${typeNamespace}`]
              ));
            }
          }
        })
      );

    const minusButton = ['button', {$on: {click (/** @type {Event} */ e) {
      e.preventDefault();
      const {target} = e;
      const arrayContents = /** @type {HTMLDivElement} */ (
        $e(div, '.arrayContents')
      );
      arrayContents.hidden = !arrayContents.hidden;
      /** @type {Element} */ (
        target
      ).textContent = arrayContents.hidden ? '+' : '-';
    }}}, ['-']];

    const arrayContents = /** @type {import('jamilih').JamilihArray} */ (
      ['div', {class: 'arrayContents'}, [
        arrayContentsFirstChild,
        arrayItems,
        addArrayElement,
        ['button', {$on: {click () {
          const arrayContents = /** @type {HTMLElement} */ (
            this.closest('.arrayContents')
          );
          const arrayItems =
            /** @type {HTMLDivElement & {$getPropertyInputs: GetPropertyInputs;}} */ (
              $e(/** @type {HTMLElement} */ (arrayContents), '.arrayItems')
            );
          const lastElement = arrayItems.lastElementChild;
          if (lastElement && !lastElement.matches('[data-required]')) {
            lastElement.remove();
            decrementItemIndex(arrayItems);
            /** @type {HTMLDivElement & {$redrawMoveArrows: RedrawMoveArrows}} */ (
              $e(/** @type {HTMLElement} */ (arrayContents), '.arrayItems')
            ).$redrawMoveArrows();
          }
          // Maybe not needed as removal would remove circular
          types.validateAllReferences({
            topRoot: /** @type {HTMLDivElement} */ (topRoot)
          });
        }}}, ['- Last item']],
        // We could only add this when there was more than one
        ['button', {$on: {click () {
          const arrayContents = /** @type {HTMLElement} */ (
            /** @type {HTMLElement} */ (this).closest('.arrayContents')
          );
          const arrayItems =
            /** @type {HTMLDivElement & {$getPropertyInputs: GetPropertyInputs}} */ ($e(
              arrayContents,
              '.arrayItems'
            ));

          const optionalFieldsetItems = $$e(
            arrayContents,
            '.arrayItems > fieldset:not([data-required])'
          );

          for (const optionalFieldsetItem of optionalFieldsetItems) {
            optionalFieldsetItem.remove();
          }

          if (sparse) {
            decrementItemIndex(arrayItems);
          } else {
            itemIndex = -1;
          }
          // Maybe not needed as removal would remove circular
          types.validateAllReferences({
            topRoot: /** @type {HTMLDivElement} */ (topRoot)
          });
        }}}, ['x All']]
      ]]
    );

    const parentType = type;

    /**
     * @typedef {() => HTMLElement} GetAddArrayElement
     */

    /**
     * @typedef {HTMLDivElement & {
     *   $addAndSetArrayElement:
     *     import('../formats/structuredCloning.js').AddAndSetArrayElement,
     *   $addArrayElement: AddArrayElement,
     *   $getArrayItems: () => HTMLElement,
     *   $getAddArrayElement: GetAddArrayElement,
     *   $getTypeChoices: () => HTMLSelectElement & {
     *     $setType: import('../typeChoices.js').SetType,
     *     $getTypeRoot: import('../formatAndTypeChoices.js').TypeRootGetter
     *   }
     * }} DivArrayOrObjectHolder
     */

    const div =
      /**
       * @type {DivArrayOrObjectHolder}
       */ (
        jml('div', {
          // `record`/`tuple` render through `object`/`array`; flag the
          //   refinement for `getValue` (no schema in scope) and styling/tests.
          dataset: {
            type,
            ...(recordMode ? {record: 'true'} : {}),
            ...(tupleMode ? {tuple: 'true'} : {})
          },
          // is: 'array-or-object-editor',
          $custom: {
            /**
             * @this {DivArrayOrObjectHolder}
             * @param {Parameters<
             *   import('../formats/structuredCloning.js').AddAndSetArrayElement
             * >[0]} cfg
             */
            $addAndSetArrayElement (cfg) {
              const {
                propName, type, value, bringIntoFocus, setAValue,
                schemaContent: schema, schemaIdx, mustBeOptional
              } = cfg;
              if (parentType === 'map') {
                if (propName === '0') {
                  this.$addArrayElement({
                    propName,
                    // At least needed when value supplied
                    autoTrigger: false
                  });
                  const arrayItems = this.$getArrayItems();
                  const keyTypeChoices = /**
                                          * @type {HTMLSelectElement & {
                                          *   $setType: import('../typeChoices.js').SetType,
                                          *   $getTypeRoot: import('../formatAndTypeChoices.js').
                                          *     TypeRootGetter
                                          * }}
                                          */ (DOM.filterChildElements(
                      arrayItems,
                      [
                        'fieldset:last-of-type', 'legend',
                        '.mapKeyHolder', 'select'
                      ]
                    )[0]);
                  keyTypeChoices.$setType({
                    type, baseValue: value, bringIntoFocus,
                    avoidReport: true
                  });

                  // The key may itself be a map, etc.
                  return keyTypeChoices.$getTypeRoot();
                }
              } else if (recordMode) {
                this.$addArrayElement({
                  propName, autoTrigger: false,
                  required: false
                });
              } else {
                // console.log('SCHEMA123', schema);
                this.$addArrayElement({
                  propName, schema, autoTrigger: false,
                  schemaIdx,
                  required: !mustBeOptional && schema && !schema.isOptional &&
                    schema.type !== 'never'
                });
              }
              const typeChoices = this.$getTypeChoices();
              typeChoices.$setType({
                type, baseValue: value, bringIntoFocus,
                specificSchema:
                  schemaIdx !== undefined && schema?.type === 'union'
                    ? schema.options[schemaIdx]
                    : schema,
                avoidReport: true
              });
              const root = typeChoices.$getTypeRoot();
              // If run for all, causes problems with running `Error.cause`
              //   type twice and is inefficient;
              //   currently put behind `setAValue` as we need to set a value
              //   from `errorsSpecialType` (and `filelistType`)
              if (setAValue) {
                const typeObj =
                  /** @type {import('../types.js').TypeObject} */ (
                    types.getTypeObject(type)
                  );
                if (typeObj.setValue) {
                  typeObj.setValue({
                    root: /** @type {HTMLDivElement} */ (root), value
                  });
                }
              }
              types.validate({
                type, root: /** @type {HTMLDivElement} */ (root), topRoot,
                // We don't want focus when values auto-added
                avoidReport: true
              });
              return root;
            },

            /**
             * @this {DivArrayOrObjectHolder}
             * @type {GetAddArrayElement}
             */
            $getAddArrayElement () {
              const el = /** @type {Element} */ (
                /** @type {Element} */ (
                  this.lastElementChild
                ).firstElementChild
              ).nextElementSibling;
              return /** @type {HTMLElement} */ (
                sparse ? el?.nextElementSibling : el
              );
            },
            /**
             * @this {DivArrayOrObjectHolder}
             * @param {Parameters<AddArrayElement>[0]} cfg
             */
            $addArrayElement (cfg) {
              const {
                propName, splice, alwaysFocus, required, schema, schemaIdx,
                autoTrigger
              } = cfg;
              const addArrayElement = this.$getAddArrayElement();
              /**
               * @type {HTMLButtonElement & {
               *   $addArrayElement: AddArrayElement,
               *   $getArrayItems: GetArrayItems
               * }}
               */
              (addArrayElement).$addArrayElement({
                propName, splice, alwaysFocus, required, schema,
                schemaIdx,
                autoTrigger
              });
            },
            /**
             * @this {DivArrayOrObjectHolder}
             * @returns {HTMLElement}
             */
            $getArrayItems () {
              return /** @type {HTMLElement} */ (
                this.$getAddArrayElement().previousElementSibling
              );
            },
            /**
             * @this {DivArrayOrObjectHolder}
             * @returns {HTMLSelectElement & {
             *   $setType: import('../typeChoices.js').SetType,
             *   $getTypeRoot: import('../formatAndTypeChoices.js').TypeRootGetter
             * }}
             */
            $getTypeChoices () {
              const arrayItems = this.$getArrayItems();
              const typeChoices =
                /**
                 * @type {HTMLSelectElement & {
                 *   $setType: import('../typeChoices.js').SetType,
                 *   $getTypeRoot: import('../formatAndTypeChoices.js').
                 *     TypeRootGetter
                 * }}
                 */ ($e(
                  /** @type {Element} */ (arrayItems.lastElementChild),
                  `fieldset > .typeChoices-${typeNamespace}` // Avoid keys
                ));
              return typeChoices;
            }
          },
          $on: {
            click (ev) {
              const e = /** @type {Event} */ (ev);
              // eslint-disable-next-line prefer-destructuring -- TS
              const target = /** @type {HTMLInputElement} */ (e.target);

              // We needed to stop preventing the default for the
              //    invalid date checkbox; is this sufficient to prevent
              //    other stray clicks apparently meant for the array
              //    and object reference checking?
              if (![
                'checkbox', 'radio', 'file',
                'datetime-local',
                // For label radio clicks
                undefined
              ].includes(target.type)) {
                e.preventDefault();
              }
            }
          }
        }, /** @type {import('jamilih').JamilihChildren} */ ([
          [specificSchemaObject ? 'span' : 'b', {
            title: specificSchemaObject?.description ?? (DOM.initialCaps(
              /** @type {import('../types.js').AvailableType} */
              (type)
            ).replace(/s$/u, ''))
          }, [
            specificSchemaObject
              ? '—'
              : DOM.initialCaps(
                /** @type {import('../types.js').AvailableType} */
                (type)
              ).replace(/s$/u, '')
          ]],
          nbsp.repeat(2),
          type === 'filelist'
            ? ['input', {
              name: typeNamespace + '-filelist',
              multiple: true,
              type: 'file',
              $on: {
                /**
                 * @this {HTMLInputElement}
                 */
                change () {
                  /* istanbul ignore if */
                  if (!this.files) {
                    return;
                  }
                  for (let i = 0; i < this.files.length; i++) {
                    const file = this.files.item(i);

                    div.$addAndSetArrayElement({
                      propName: String(i),
                      type: 'file',
                      value: file,
                      bringIntoFocus: false,
                      setAValue: true
                    });
                  }
                }
              }
            }]
            : '',
          minusButton,
          arrayContents
        ]))
      );
    topRoot ||= div;

    if (!objectValue && specificSchemaObject && tupleMode) {
      // See comment referencing `arrayType.js` in `typeChoices.js`
      if (!schemaFallingBack) {
        const specificSchemaObj = /** @type {import('zodexy').SzTuple} */ (
          specificSchemaObject
        );
        if (specificSchemaObj?.items?.[0]?.type !== 'never') {
          for (const schema of specificSchemaObj.items) {
            div.$addArrayElement({schema, required: true});
          }
        }
      }
    } else if (!objectValue && specificSchemaObject) {
      switch (type) {
      case 'object': {
        // See comment referencing `arrayType.js` in `typeChoices.js`
        if (!schemaFallingBack) {
          for (const [prop, val] of
            // eslint-disable-next-line unicorn/no-unreadable-for-of-expression -- Convenient
            Object.entries(
              /** @type {import('zodexy').SzObject} */ (
                specificSchemaObject
              /* istanbul ignore next -- Should always have `properties` */
              ).properties ?? {}
            )
          ) {
            if (!val.isOptional && val.type !== 'never') {
              div.$addArrayElement({propName: prop, required: true});
            }
          }
        }
        break;
      }
      // case 'array': // None with schemas?
      case 'arrayNonindexKeys': {
        const {minLength = 0} = /** @type {import('zodexy').SzArray} */ (
          specificSchemaObject
        );
        const arrayLengthInput =
          /** @type {HTMLInputElement & {$oldvalue: string}} */ (
            $e(div, '.arrayLength')
          );
        arrayLengthInput.value = String(minLength);
        arrayLengthInput.$oldvalue = String(minLength);

        for (let i = 0; i < minLength; i++) {
          div.$addArrayElement({required: true});
        }
        break;
      } case 'set': {
        // See comment referencing `arrayType.js` in `typeChoices.js`
        if (!schemaFallingBack) {
          const {minSize = 0} = /** @type {import('zodexy').SzSet} */ (
            specificSchemaObject
          );
          for (let i = 0; i < minSize; i++) {
            div.$addArrayElement({required: true});
          }
        }
        break;
      } case 'map': {
        if (!schemaFallingBack) {
          const {min = 0} = /** @type {import('zodexy').SzMap<any, any>} */ (
            specificSchemaObject
          );
          for (let i = 0; i < min; i++) {
            div.$addArrayElement({required: true});
          }
        }
        break;
      } default:
        break;
      }
    }

    return [div];
  }
};

export default arrayType;
