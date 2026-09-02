import {
  jml, toStringTag,
  Typeson,
  resurrectable as noneditable, symbol, promise
} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import {tick} from '../utils/timing.js';
import arrayType from './arrayType.js';
import {structuredCloningJsoe, functionSpec} from '../formats/structuredCloning.js';

/**
 *
 */
const getTypeson = () => {
  structuredCloningJsoe.splice(
    // Add after userObjects
    1,
    0,
    noneditable
  );
  return new Typeson().register(
    [
      ...structuredCloningJsoe,
      symbol,
      promise,
      functionSpec
    ]
  );
};

/**
 * @type {import('../types.js').TypeObject}
 */
const promiseType = {
  option: ['Promise'],
  regexEndings: [',', ')'],
  stringRegexBegin: /^Promise\(/u,
  stringRegexEnd: /^\)/u,
  array: true,

  valueMatch (x) {
    return toStringTag(x) === 'Promise';
  },
  toValue (...args) {
    const val = /** @type {import('../types.js').ToValue} */ (
      arrayType.toValue
    ).apply(this, args);

    return {
      value: Promise.resolve(val.value[0]),
      remnant: val.remnant
    };
  },
  getInput ({root}) {
    const childRoot = /** @type {HTMLDivElement} */ (
      $e(root, 'div[data-type]')
    );
    return /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|HTMLButtonElement} */ (
      this.types?.getFormControlForRoot(childRoot)
    );
  },
  setValue ({root, value}) {
    // Need to wait a tick; return a promise that settles once the resolved
    //   value's child editor is built and populated.
    return (async () => {
      await tick();
      const val = await value;
      const typeson = getTypeson();
      const type = /** @type {import('../types.js').AvailableArbitraryType} */ (
        await typeson.rootTypeName(val)
      );

      const select = /** @type {HTMLSelectElement} */ ($e(root, 'select'));
      select.value = type;
      select.dispatchEvent(new Event('change'));

      const childRoot = /** @type {HTMLDivElement} */ (
        $e(root, 'div[data-type]')
      );

      await this.types?.setValue({
        type,
        root: childRoot,
        value: val
      });
      const input = this.types?.getFormControlForRoot(childRoot);
      // Avoid invalid number, etc.
      input?.dispatchEvent(new Event('input'));
      input?.blur();
    })();
  },
  getValue ({root}) {
    const childRoot = /** @type {HTMLDivElement} */ (
      $e(root, 'div[data-type]')
    );
    return Promise.resolve(this.types?.getValueForRoot(childRoot));
  },
  viewUI ({specificSchemaObject, types, value, ...args}) {
    const typeson = getTypeson();

    const span = jml('span');
    const valueHolder = jml('div');

    (async () => {
      const val = await value;
      const type = await typeson.rootTypeName(val);
      span.textContent = type;
      const typeObj = /** @type {import('../types.js').TypeObject} */ (
        types.getTypeObject(
          /** @type {import('../types.js').AvailableArbitraryType} */ (type)
        )
      );
      valueHolder.append(
        jml(...typeObj.viewUI({
          specificSchemaObject, types, value: val, ...args
        }))
      );
    })();

    return ['span', {
      dataset: {type: 'promise'},
      title: specificSchemaObject?.description
    }, [
      'A Promise ',
      span,
      valueHolder
    ]];
  },
  editUI ({
    format, types, type, buildTypeChoices, specificSchemaObject,
    topRoot, schemaContent, typeNamespace, value
  }) {
    this.types = types;

    const div = jml('div', {
      dataset: {type: 'promise'},
      title: specificSchemaObject?.description ?? '(a Promise)'
    }, [
      'Promise ',
      ...(/** @type {import('../typeChoices.js').BuildTypeChoices} */ (
        buildTypeChoices
      )({
        // resultType,
        topRoot: /** @type {HTMLDivElement} */ (topRoot),
        format: /** @type {import('../formats.js').AvailableFormat} */ (format),
        schemaOriginal: schemaContent,
        schemaContent: /** @type {import('zodexy').SzPromise} */ (
          specificSchemaObject
        )?.value ?? {type: 'any'},
        state: type,
        // itemIndex,
        typeNamespace
      }).domArray)
    ]);

    if (value && this.setValue) {
      this.setValue({root: div, value});
    }

    return [div];
  }
};

export default promiseType;
