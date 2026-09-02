import {jml} from './vendor-imports.js';
import Formats from './formats.js';
import Types from './types.js';

import {$e, DOM} from './utils/templateUtils.js';
import {isUnionLike} from './utils/types.js';
import {getXorBranchMatchInfo} from './formats/schema.js';
import dialogs from './utils/dialogs.js';
import deepEqual from 'fast-deep-equal/es6/index.js';

// This is technically just `import('./index.js').SetType`, but our
//   redirect file causes problems, so we redefine here
/**
 * @typedef {(cfg: {
 *   type: string,
 *   baseValue?: import('./formats.js').StructuredCloneValue,
 *   bringIntoFocus?: boolean,
 *   avoidReport?: boolean,
 *   specificSchema?: import('zodexy').SzType
 * }) => void} SetType
 */

/**
 * @typedef {(info: {
 *   type: string,
 *   specificSchema?: import('zodexy').SzType
 * }) => void} SetTypeNoEditUI
 */
/**
 * @callback Validate
 * @param {{avoidReport?: boolean}} cfg
 * @returns {boolean}
 */
/**
 * @typedef {() => false|null|HTMLElement} GetTypeRoot
 */

/**
 * @typedef {(info: {
 *   type: string,
 *   editUI: HTMLElement,
 *   specificSchema?: import('zodexy').SzType
 * }) => void} AddTypeAndEditUI
 */

/**
 * @typedef {(info?: {
 *   baseValue?: import('./formats.js').StructuredCloneValue,
 *   bringIntoFocus?: boolean,
 *   schemaObject?: import('./formatAndTypeChoices.js').ZodexSchema,
 *   avoidReport?: boolean
 * }) => void} AddAndValidateEditUI
 */

/**
 * @typedef {() => void} SetStyles
 */

/**
 * @typedef {(info: {editUI: HTMLElement}) => void} AddEditUI
 */

/**
 * @typedef {HTMLSelectElement & {
 *   $addAndValidateEditUI: AddAndValidateEditUI,
 *   $setStyles: SetStyles,
 *   $getTypeRoot: GetTypeRoot,
 *   $getContainer: () => HTMLElement,
 *   $getTopRoot: () => HTMLDivElement,
 *   $addEditUI: AddEditUI,
 *   $validate: Validate,
 *   $setTypeNoEditUI: SetTypeNoEditUI
 * }} TypeChoicesElementAPI
 */

/**
 * @callback GetValue
 * @param {import('./types.js').StateObject} [stateObj] Will
 *   auto-set `typeNamespace` and `format`
 * @param {string} [currentPath]
 * @returns {import('./formats.js').StructuredCloneValue}
 */

/**
 * @callback GetType
 * @returns {string}
 */

/**
 * @callback ValidValuesSet
 * @returns {boolean}
 */

/**
 * @callback SetValue
 * @param {import('./formats.js').StructuredCloneValue} value
 * @param {import('./types.js').StateObject} stateObj
 * @returns {Promise<void>}
 */

/**
 * @callback BuildTypeChoices
 * @param {{
 *   autoTrigger?: boolean,
 *   format: import('./formats.js').AvailableFormat,
 *   typeNamespace?: string,
 *   value?: import('./formats.js').StructuredCloneValue,
 *   setValue?: boolean,
 *   state?: string,
 *   forcedState?: string,
 *   keySelectClass?: string,
 *   requireObject?: boolean,
 *   objectHasValue?: boolean,
 *   topRoot?: import('./types.js').RootElement,
 *   formats?: import('./formats.js').default
 *   types?: import('./types.js').default
 *   schema?: string,
 *   schemaIdx?: number,
 *   schemaOriginal?: import('./formatAndTypeChoices.js').ZodexSchema,
 *   schemaContent?: import('./formatAndTypeChoices.js').ZodexSchema,
 * }} cfg
 * @returns {{
 *   domArray: [select: HTMLElement, typeContainer: HTMLElement],
 *   getValue: GetValue,
 *   getType: GetType,
 *   validValuesSet: ValidValuesSet,
 *   setValue: SetValue
 * }}
 */

/**
 * The `<select>`-shaped `$`-methods that downstream code invokes on a
 * type-choices control. The `xor` radio group reuses these by reference from
 * the parallel `<select>`.
 * @type {readonly string[]}
 */
const typeChoicesAPIMethods = [
  '$getValue', '$setType', '$setTypeNoEditUI', '$setStyles', '$getTypeRoot',
  '$addAndValidateEditUI', '$addTypeAndEditUI', '$addEditUI', '$getContainer',
  '$getTopRoot', '$validate'
];

/**
 * Human-readable caption for one `xor` branch radio. Prefers the branch's own
 * `description`; otherwise derives something legible from its shape so the
 * branches can be told apart without reading schema.
 * @param {import('zodexy').SzType|undefined} schemaObj
 * @param {string} optText Fallback option text (already e.g. `"string"`)
 * @param {number} idx
 * @returns {string}
 */
function deriveXorBranchLabel (schemaObj, optText, idx) {
  if (schemaObj && 'description' in schemaObj && schemaObj.description) {
    return /** @type {string} */ (schemaObj.description);
  }
  if (schemaObj && schemaObj.type === 'literal') {
    const {values} = /** @type {import('zodexy').SzLiteral<any>} */ (schemaObj);
    if (Array.isArray(values) && values.length) {
      return String(values[0]);
    }
  }
  if (schemaObj && schemaObj.type === 'object') {
    const {properties} = /** @type {import('zodexy').SzObject} */ (schemaObj);
    const keys = properties && typeof properties === 'object'
      ? Object.keys(properties)
      : [];
    if (keys.length) {
      // Todo: when branches share property names, prefer the keys unique to
      //   this branch (symmetric difference against its siblings)
      return keys.length > 3
        ? `${keys.slice(0, 3).join(', ')}, +${keys.length - 3} more`
        : keys.join(', ');
    }
  }
  return optText || `Option ${idx + 1}`;
}

/**
 * Build the `xor` (exclusive union) radio-group control. It renders a
 * labelled radio per branch and shims the `<select>` value surface
 * (`value`, `selectedIndex`, `selectedOptions`), reusing the `$`-methods of
 * the parallel `<select>` in `selectEl` by reference. A live indicator under
 * the radios counts how many branches the current value satisfies, since
 * `xor` requires exactly one and jsoe otherwise validates only the chosen
 * branch's leaf schema.
 * @param {{
 *   typeNamespace: string|undefined,
 *   keySelectClass: string|undefined,
 *   typeOptions: [string, {value?: string, title?: string}?][],
 *   schemaObjs: import('zodexy').SzType[],
 *   types: InstanceType<typeof import('./types.js').default>,
 *   typeContainer: HTMLElement,
 *   xorSchema: import('zodexy').SzUnion|undefined,
 *   selectEl: HTMLSelectElement
 * }} cfg
 * @returns {HTMLSelectElement}
 */
function buildXorTypeChoices ({
  typeNamespace, keySelectClass, typeOptions, schemaObjs, types,
  typeContainer, xorSchema, selectEl
}) {
  const radioName = `typeChoices-${typeNamespace}-xor`;
  const fieldset = jml('fieldset', {
    class: `typeChoices-${typeNamespace} xorTypeChoices${keySelectClass
      ? ' ' + keySelectClass
      : ''
    }`,
    $on: {change (e) {
      e?.stopPropagation();
      const idxAttr =
        /** @type {HTMLElement} */ (e.target)?.dataset?.idx ??
        /** @type {TypeChoicesElementAPI} */ (
          this
        ).selectedOptions[0]?.dataset?.idx;
      /** @type {TypeChoicesElementAPI} */ (this).$addAndValidateEditUI({
        schemaObject: idxAttr === undefined
          ? undefined
          : schemaObjs[Number(idxAttr)]
      });
      /** @type {TypeChoicesElementAPI} */ (this).$setStyles();
      updateMatchStatus();
    }}
  }, [
    ['legend', {class: 'xorTypeChoicesLegend'}, ['Exactly one of']],
    ...typeOptions.map(([optText, optAtts], idx) => {
      return ['label', {class: 'xorTypeChoice'}, [
        ['input', {
          type: 'radio',
          name: radioName,
          value: /** @type {string} */ (optAtts?.value ?? ''),
          dataset: {idx}
        }],
        ['span', {class: 'xorTypeChoiceLabel'}, [
          deriveXorBranchLabel(schemaObjs[idx], optText, idx)
        ]]
      ]];
    }),
    ['div', {class: 'xorMatchStatus', hidden: true}]
  ]);

  const radios = () => /** @type {HTMLInputElement[]} */ (
    [...fieldset.querySelectorAll('input[type="radio"]')]
  );

  const matchStatus = /** @type {HTMLElement} */ (
    $e(fieldset, '.xorMatchStatus')
  );

  /**
   * Re-count how many `xor` branches the assembled value satisfies and
   * reflect it in the indicator, also marking the chosen radio invalid when
   * the count is not exactly one so the form's `checkValidity()` catches it.
   * @returns {void}
   */
  function updateMatchStatus () {
    const checked = radios().find((r) => r.checked);
    if (!xorSchema || !checked || !$e(typeContainer, 'div[data-type]')) {
      matchStatus.hidden = true;
      return;
    }
    let value;
    try {
      value = /** @type {() => unknown} */ (fsAPI.$getValue)();
    } catch {
      // Editor not ready or value not yet parseable
      matchStatus.hidden = true;
      return;
    }
    const {matched, total} = getXorBranchMatchInfo(types, xorSchema, value);
    // Anything but exactly one match is invalid, including a still-empty
    //   branch (zero matches): the form must not be submittable in that
    //   state, so we always show the indicator and set validity once a
    //   branch is chosen.
    const ok = matched === 1;
    matchStatus.hidden = false;
    matchStatus.textContent = ok
      ? `Matches 1 of ${total} options`
      : `Matches ${matched} of ${total} — value must match exactly one`;
    matchStatus.classList.toggle('xorMatchOk', ok);
    matchStatus.classList.toggle('xorMatchErr', !ok);
    checked.setCustomValidity(
      ok ? '' : 'Value must match exactly one option'
    );
  }

  typeContainer.addEventListener('input', updateMatchStatus);
  typeContainer.addEventListener('change', updateMatchStatus);

  const selAPI = /** @type {Record<string, unknown>} */ (
    /** @type {unknown} */ (selectEl)
  );
  const fsAPI = /** @type {Record<string, unknown>} */ (
    /** @type {unknown} */ (fieldset)
  );
  for (const method of typeChoicesAPIMethods) {
    fsAPI[method] = selAPI[method];
  }

  Object.defineProperties(fieldset, {
    value: {
      configurable: true,
      get () {
        return radios().find((r) => r.checked)?.value ?? '';
      },
      set (v) {
        const match = radios().find((r) => r.value === v);
        for (const r of radios()) {
          r.checked = r === match;
        }
      }
    },
    selectedIndex: {
      configurable: true,
      get () {
        const i = radios().findIndex((r) => r.checked);
        return i === -1 ? 0 : i + 1;
      },
      set (i) {
        radios().forEach((r, idx) => {
          r.checked = idx === Number(i) - 1;
        });
      }
    },
    selectedOptions: {
      configurable: true,
      get () {
        const r = radios().find((rd) => rd.checked);
        return r ? [{value: r.value, dataset: {idx: r.dataset.idx}}] : [];
      }
    }
  });

  return /** @type {HTMLSelectElement} */ (/** @type {unknown} */ (fieldset));
}

/**
 * @type {BuildTypeChoices}
 */
export const buildTypeChoices = ({
  autoTrigger = true,
  format,
  typeNamespace,
  value,
  setValue = false,
  state,
  // itemIndex = 0,
  keySelectClass,
  requireObject,
  objectHasValue,
  topRoot,
  formats = new Formats(),
  types = new Types(),
  schema,
  schemaIdx,
  schemaOriginal,
  schemaContent
}) => {
  // console.log('format', format, 'state', state, 'path', typeNamespace);
  const typeAndSchemaInfo = requireObject && !schemaContent
    ? {
      typeOptions: [types.getOptionForType('object')], schemaObjects: undefined
    }
    : types.getTypeOptionsForFormatAndState(
      format, state, schemaContent, schemaOriginal
    );
  const {typeOptions} = typeAndSchemaInfo;
  const schemaObjs = typeAndSchemaInfo.schemaObjects;

  let editUI;

  /** @type {GetValue} */
  const $getValue = (stateObj, currentPath) => {
    const root = /** @type {HTMLDivElement} */ (
      $e(typeContainer, 'div[data-type]')
    );
    return types.getValueForRoot(
      root,
      /** @type {import('./types.js').StateObject} */ ({
        typeNamespace,
        formats,
        format,
        types,
        ...stateObj
      }),
      currentPath
    );
  };
  // Created before the control so the `xor` radio group can bind its live
  //   match indicator to value changes inside it
  const typeContainer = jml('div', {class: 'typeContainer'});

  const selectEl = /** @type {HTMLSelectElement} */ (jml('select', {
    hidden: requireObject || typeOptions.length === 1,
    class: `typeChoices-${typeNamespace}${keySelectClass
      ? ' ' + keySelectClass
      : ''
    }`,
    // is: 'type-choices',
    $custom: {
      $getValue,
      /**
       * @this {TypeChoicesElementAPI}
       * @param {Parameters<SetType>[0]} cfg
       */
      $setType (cfg) {
        const {
          type, baseValue, bringIntoFocus, avoidReport, specificSchema
        } = cfg;
        if (schemaObjs && specificSchema) {
          const idx = schemaObjs.findIndex((obj) => {
            return deepEqual(obj, specificSchema);
          });
          if (idx === -1) {
            this.value = type;
          } else {
            this.selectedIndex = idx + 1;
          }
        } else {
          this.value = type;
        }
        this.$setStyles();
        this.$addAndValidateEditUI({baseValue, bringIntoFocus, avoidReport});
      },
      /**
       * @this {TypeChoicesElementAPI}
       * @param {Parameters<SetTypeNoEditUI>[0]} cfg
       */
      $setTypeNoEditUI (cfg) {
        const {type, specificSchema} = cfg;
        if (schemaObjs && specificSchema) {
          const idx = schemaObjs.findIndex((obj) => {
            return deepEqual(obj, specificSchema);
          });
          this.selectedIndex = idx + 1;
        } else {
          this.value = type;
        }
        this.$setStyles();
      },

      /**
       * @this {TypeChoicesElementAPI}
       * @type {SetStyles}
       */
      $setStyles () {
        const {value: type} = this;
        this.dataset.type = type; // Used for styling
        let ancestorEl = this.parentElement;
        if (!ancestorEl) {
          return;
        }
        if (ancestorEl.nodeName.toLowerCase() !== 'fieldset') {
          // Grandparent check added for optional items placeholder
          ancestorEl = ancestorEl.parentElement;
        }
        if (ancestorEl?.nodeName.toLowerCase() === 'fieldset') {
          ancestorEl.dataset.type = type;
          DOM.filterChildElements(ancestorEl, 'legend').forEach((legend) => {
            legend.dataset.type = type;
          });
        }
      },
      /**
       * @this {TypeChoicesElementAPI}
       * @type {GetTypeRoot}
       */
      $getTypeRoot () {
        const container = this.$getContainer();
        /* istanbul ignore if -- How to replicate? */
        if (!container) {
          return false;
        }
        return $e(container, 'div[data-type]');
      },

      /**
       * @this {TypeChoicesElementAPI}
       * @param {Parameters<AddAndValidateEditUI>[0]} [cfg]
       */
      $addAndValidateEditUI (
        /* istanbul ignore next -- Backup */ cfg = {}
      ) {
        const {
          baseValue, bringIntoFocus, schemaObject, avoidReport
        } = cfg;
        const {value: type} = this;

        if (!type) {
          return;
        }
        let topRoot = this.$getTopRoot();

        // Todo (low): Try to avoid need for `baseValue`
        //    (needed by arrayNonindexKeys for setting an array
        //    length and avoiding errors); could set all
        //    values through here?
        editUI = types.getUIForModeAndType({
          readonly: false,
          typeNamespace,
          type: /** @type {import('./types.js').AvailableArbitraryType} */ (type),
          bringIntoFocus,
          hasValue: type === 'arrayNonindexKeys' && baseValue,
          value: baseValue,
          buildTypeChoices,
          format,
          topRoot,
          schemaContent: schemaOriginal ??
            (schemaIdx !== undefined && isUnionLike(schemaContent?.type)
              ? /** @type {import('zodexy').SzUnion} */ (
                schemaContent
              ).options[schemaIdx]
              : schemaContent),
          // Added `schemaContent` as inner arrays were not getting their
          //   schema info; this apparently allows (actually requires)
          //   commenting out the auto-adding of object content at end of
          //   editUI in arrayType.js; we add `schemaFallingBack` to
          //   distinguish
          specificSchemaObject: schemaObject ??

            // Avoid JSON references by using this by default (or only?)
            (schemaObjs?.[sel.selectedIndex - 1]) ??

            /* istanbul ignore next -- Can probably remove as `schemaObjs` will be set */
            (schemaIdx !== undefined && isUnionLike(schemaContent?.type)
              /* istanbul ignore next -- Can probably remove */
              ? /** @type {import('zodexy').SzUnion} */ (
                schemaContent
              ).options[schemaIdx]
              // This is probably just `undefined` by here
              : schemaContent),
          schemaFallingBack: Boolean(!schemaObject && schemaContent)
        });
        this.$addEditUI({editUI});
        this.$validate({
          avoidReport
        });
        topRoot = this.$getTopRoot(); // May be existing now
        // Needed; Array/object ref somewhere could now be valid or invalid
        types.validateAllReferences({topRoot});
      },

      /**
       * @this {TypeChoicesElementAPI}
       * @param {Parameters<AddTypeAndEditUI>[0]} cfg
       */
      $addTypeAndEditUI (cfg) {
        const {type, editUI, specificSchema} = cfg;
        this.$setTypeNoEditUI({type, specificSchema});
        this.$addEditUI({editUI});
      },
      /**
       * @this {TypeChoicesElementAPI}
       * @param {Parameters<AddEditUI>[0]} cfg
       */
      $addEditUI (cfg) {
        const {editUI} = cfg;
        const container = this.$getContainer();
        DOM.removeChildren(container);
        jml(editUI, container);
      },
      $getContainer () {
        return this.nextElementSibling;
      },
      /**
       * @this {TypeChoicesElementAPI}
       */
      $getTopRoot () {
        return topRoot || this.$getTypeRoot();
      },
      /**
       * @this {TypeChoicesElementAPI}
       * @param {Parameters<Validate>[0]} [cfg]
       */
      $validate (cfg = {}) {
        const {avoidReport} = cfg;
        const {value: type} = this;
        const container = this.$getContainer();
        if (!container.firstElementChild) {
          return false;
        }
        const editUI = /** @type {HTMLDivElement} */ (container.firstElementChild);
        return types.validate({
          type: /** @type {import('./types.js').AvailableArbitraryType} */ (type),
          root: editUI,
          topRoot: this.$getTopRoot(),
          avoidReport
        });
      }
    },
    $on: {change (e) {
      // We don't want form `onchange` to run `$checkForKeyDuplicates`
      //   again (through `addAndValidateEditUI`->`validateAllReferences`)
      e?.stopPropagation();
      /** @type {TypeChoicesElementAPI} */ (this).$addAndValidateEditUI({
        schemaObject: schemaObjs
          ? schemaObjs[Number(
            /** @type {HTMLSelectElement} */
            (e.target).selectedOptions[0].dataset.idx
          )]
          : undefined
      });
      /** @type {TypeChoicesElementAPI} */ (this).$setStyles();
    }}
  }, [
    ['option', {value: ''}, [
      '(Choose a type)'
    ]],

    ...typeOptions.map(
      ([optText, optAtts], idx) => {
        return [
          'option',
          {
            ...optAtts,
            dataset: schemaObjs ? {idx} : {}
          },
          [optText]
        ];
      }
    )
  ]));

  // `xor` (exclusive union): exactly one branch may match. Present it as a
  //   labelled radio group ("choose exactly one of these") rather than the
  //   flat type pull-down; the layout conveys the rule without the reader
  //   needing to know the term. The element still exposes the
  //   `<select>`-shaped surface (`value`, `selectedIndex`, `selectedOptions`,
  //   the `$`-methods) that the rest of the type machinery reads.
  const useXorTypeChoices = Boolean(
    schemaObjs && !requireObject && typeOptions.length > 1 &&
    (schemaContent?.type === 'xor' || schemaOriginal?.type === 'xor')
  );

  const sel = useXorTypeChoices
    ? buildXorTypeChoices({
      typeNamespace, keySelectClass, typeOptions, types, typeContainer,
      schemaObjs: /** @type {import('zodexy').SzType[]} */ (schemaObjs),
      xorSchema: /** @type {import('zodexy').SzUnion} */ (
        schemaContent?.type === 'xor' ? schemaContent : schemaOriginal
      ),
      selectEl
    })
    : selectEl;

  if (autoTrigger && !setValue && typeOptions.length === 1) {
    setTimeout(() => {
      if (!sel.isConnected) {
        return;
      }
      sel.selectedIndex = 1;
      sel.dispatchEvent(new Event('change'));
    }, 0);
  } else if (setValue || (requireObject && !objectHasValue)) {
    setTimeout(async () => {
      if (!sel.isConnected) {
        return;
      }
      if (!setValue) { // if (requireObject && !objectHasValue) {
        // Todo (low): We could auto-populate keypath if has
        //   keypath (and we probably also only want if
        //   not autoincrement)
        value = {};
      }
      try {
        const {
          rootUI: rootEditUI,
          specificSchemas
        } = await formats.getControlsForFormatAndValue(
          types,
          format,
          value,
          {
            readonly: false,
            typeNamespace,
            schema,
            schemaContent,
            formats,
            types
          }
        );
        const type =
          Types.getTypeForRoot(/** @type {HTMLDivElement} */ (
            rootEditUI
          ));
        /** @type {HTMLSelectElement & {$addTypeAndEditUI: AddTypeAndEditUI}} */ (
          sel
        ).$addTypeAndEditUI({
          type,
          editUI: rootEditUI,
          // We do actually want the first one
          specificSchema: specificSchemas?.[0]
        });
      } catch (err) {
        /* istanbul ignore next -- At least some errors handled earlier */
        dialogs.alert({
          message: 'The object to be added had types not supported ' +
            'by the current format.'
        });
        /* istanbul ignore next -- How to trigger? */
        console.log('err', err);
      }
    }, 0);
  }

  return {
    domArray: [
      sel,
      typeContainer
    ],

    /** @type {GetValue} */
    getValue: $getValue,

    /** @type {GetType} */
    getType () {
      const root = /** @type {HTMLDivElement} */ (
        $e(typeContainer, 'div[data-type]')
      );
      return Types.getTypeForRoot(root);
    },

    /** @type {ValidValuesSet} */
    validValuesSet () {
      const root = /** @type {HTMLDivElement|null} */ (
        $e(typeContainer, 'div[data-type]')
      );
      if (!root) {
        // No type/branch chosen yet: nothing valid has been set
        return false;
      }
      const form = /** @type {HTMLFormElement} */ (root.closest('form'));
      return Types.validValuesSet({form, typeNamespace});
    },

    /** @type {SetValue} */
    async setValue (value, stateObj) {
      const rootEditUI = /** @type {HTMLDivElement} */ (
        (await formats.getControlsForFormatAndValue(
          types,
          format, value, stateObj
        )).rootUI
      );
      const type = Types.getTypeForRoot(rootEditUI);
      /** @type {HTMLSelectElement & {$addTypeAndEditUI: AddTypeAndEditUI}} */ (
        sel
      ).$addTypeAndEditUI({type, editUI: rootEditUI});
    }
  };
};
