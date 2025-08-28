import Types, {getPropertyValueFromLegend} from '../types.js';
import {$e, $$e, DOM} from '../utils/templateUtils.js';
import {
  getJSONPointerParts
} from '../utils/jsonPointer.js';

/**
 * @type {import('../types.js').TypeObject & {type: "array"}}
 */
const arrayReferenceType = {
  option: ['Array reference'],
  type: 'array',
  stringRegex: /^arrayRef\((?:\/[^)]*|)\)$/u,
  toValue (s, info) {
    const {
      rootHolder, parent, parentPath
    } = /** @type {import('../types.js').RootInfo} */ (info);
    const path = s.slice(`${this.type}Ref(`.length, -1);
    rootHolder.push([this.type, parent, parentPath, path]);
    return {assign: false};
  },
  resolveReference (path, value) {
    let parent = value;
    if (path !== '') {
      getJSONPointerParts(path).forEach((pathPart) => {
        parent = parent[pathPart];
        if (!parent) {
          throw new Error('Bad path');
        }
      });
    }
    return parent;
  },
  stateDependent: {
    structuredCloning: {
      // after: 'sparseArrays',
      after: 'arrayNonindexKeys',
      contexts: ['arrayNonindexKeys', 'object', 'set']
      // contexts: ['sparseArrays', 'object']
    }
  },
  getInput ({root}) {
    return /** @type {HTMLInputElement} */ ($e(root, 'input'));
  },
  setValue ({root, value}) {
    this.getInput({root}).value = value;
  },
  getValue ({root, stateObj, currentPath}) {
    const referentPath = this.getInput({root}).value;
    /* istanbul ignore else -- ArrayRef will not be a root, so should have stateObj */
    if (stateObj) {
      if (!stateObj.paths) {
        stateObj.paths = {};
      }
      stateObj.paths[/** @type {string} */ (currentPath)] = {
        referentPath,
        // Todo (low): Should be utilized along with
        //   other validation checking
        expectArrayReferent: this.type === 'array'
      };
      stateObj.handlingReference = true;
    }
    console.log(referentPath);
  },
  validate ({root, topRoot}) {
    const {type} = this;
    const input = this.getInput({root});
    const path = input.value;

    /**
     * @param {string|undefined} message
     * @returns {{valid: false, message: string|undefined}}
     */
    const invalidMessage = (message) => {
      return {valid: false, message};
    };

    if (input.validity.patternMismatch) {
      return invalidMessage(
        'You must use a path beginning with "/" (or the empty string)'
      );
    }
    if ((/~([^01]|$)/u).test(path)) {
      return invalidMessage(
        'You must use a valid JSON Pointer (with ' +
          'tildes followed by 0 or 1)'
      );
    }

    let referent = topRoot ||
      /* istanbul ignore next -- Should always exist? */
      root;
    const isObjectOrArray = () => {
      return [
        'array', 'object',
        'arrayNonindexKeys'
        // 'sparseArrays'
      ].includes(
        Types.getTypeForRoot(referent)
      );
    };
    let message;
    if (path !== '') { // If empty string, referent will be topRoot
      if (getJSONPointerParts(path).some((pathPart, i) => {
        // Todo (low): We should also support `arrayReference` and
        //    `objectReference`, but will need to resolve and bear
        //    in mind that references may need to be added out of
        //    order)
        const legends = DOM.filterChildElements(
          // Ensure we are only getting one array level at a time
          /** @type {HTMLElement} */ ($e(referent, '.arrayItems')),
          ['fieldset', 'legend']
        );
        const childPropertyValues = legends.map(
          (legend) => getPropertyValueFromLegend(
            /** @type {HTMLLegendElement} */ (legend)
          )
        );
        const partMatchIndex = childPropertyValues.indexOf(pathPart);
        if (partMatchIndex === -1) {
          message = "Specified path doesn't exist";
          return true;
        }
        referent = /** @type {HTMLDivElement} */ ($e(
          /** @type {HTMLElement} */ (legends[partMatchIndex].parentElement),
          'div[data-type]'
        ));
        if (referent === root) {
          message = "Can't reference self";
          return true;
        }
        // Condition that path isn't an object/array
        if (!isObjectOrArray()) {
          message = `Referent portion (at segment ${i}) is ` +
            `not an object or array`;
          return true;
        }
        return false;
      })) {
        return invalidMessage(message);
      }
    }
    // Root can only be an object or array unless it is itself
    // else if (!isObjectOrArray()) {
    //   return invalidMessage('Referent is not an object or array');
    // }

    // UI prevents array/object references at root
    // Condition to forbid path to self
    // if (referent === root) {
    //   return invalidMessage("Can't reference self");
    // }

    // Condition to confirm that referenced element is an array or
    //    object (or reference) with the designated `type`
    const referentType = Types.getTypeForRoot(referent);
    const referentBaseType = /** @type {(string|null|undefined)[]} */ ([
      'array',
      'arrayNonindexKeys'
      // 'sparseArrays'
    ]).includes(referentType)
      ? 'array'
      /* istanbul ignore next -- Bad ref should have been caught earlier */
      : (
        /* istanbul ignore next -- Bad ref should have been caught earlier */
        referentType === 'object'
          ? 'object'
          /* istanbul ignore next -- Bad ref should have been caught earlier */
          : null);

    if (referentBaseType !== type) {
      return invalidMessage(
        'Reference must match expected reference type ' +
          '(array or object)'
      );
    }
    return {
      valid: true
    };
  },
  validateAll ({types, topRoot}) {
    const type = /** @type {import('../types.js').AvailableType} */ (
      `${this.type}Reference`
    );
    $$e(topRoot, `div[data-type="${type}"]`).forEach((root) => {
      types.validate({
        type,
        root: /** @type {HTMLDivElement} */ (root),
        topRoot
      });
    });
  },
  viewUI ({value}) {
    return ['i', {
      dataset: {type: `${this.type}Reference`}
    }, [`${this.type}Ref(${value})`]];
  },
  // Note: The `value` here must not be the object itself (the
  //    circular object/array) as the `value` usually should be,
  //    but instead the array/object path
  editUI ({typeNamespace, value = '' /* , topRoot */}) {
    const {type} = this;
    return ['div', {dataset: {type: `${type}Reference`}}, [
      ['label', [
        `JSON Pointer path to ${type} (leave blank for path to root) `,
        ['input', {
          name: `${typeNamespace}-${type}Reference`,
          type: 'text',
          pattern: '^(|/.*)$',
          value
        }]
      ]]
      // Todo (low): Add button to enable mode (supporting
      //    scrolling) for clicking on desired referent element
    ]];
  }
};

export default arrayReferenceType;
