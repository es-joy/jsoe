import {$e} from '../utils/templateUtils.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const catchType = {
  option: ['Catch'],
  stringRegex: /^catch\((.*)\)$/u,
  valueMatch (x) {
    // Todo: Should expand types here and in `toValue`
    return ['number', 'string'].includes(typeof x);
  },
  toValue (s) {
    const value = s.charAt(0) === '"' ? s.slice(1, -1) : Number(s);
    return {value};
  },
  getInput ({root}) {
    return /** @type {HTMLTextAreaElement} */ (
      $e(root, 'input,textarea')
    );
  },
  setValue ({root, value}) {
    // input/textarea hasn't yet been added, so set timeout
    setTimeout(() => {
      this.getInput({root}).value = value;
    }, 0);
  },
  getValue ({root}) {
    return this.getInput({root}).value;
  },
  viewUI ({
    specificSchemaObject, types,
    resultType, typeNamespace, topRoot, format,
    bringIntoFocus, buildTypeChoices, // schemaContent,
    replaced, value
  }) {
    return ['span', {
      dataset: {type: 'catch'},
      title: specificSchemaObject?.description ?? '(a catch)'
    }, [
      ['b', ['Catch']],
      ['br'],
      'Default value',
      ['br'],
      ['div', {
        class: 'defaultValue'
      }, [
        types.getUIForModeAndType({
          readonly: true,
          specificSchemaObject: /** @type {import('zodexy').SzCatch} */ (
            specificSchemaObject
          )?.innerType,
          hasValue: true,
          value,
          resultType, typeNamespace,
          type: /** @type {import('../types.js').AvailableType} */ (
            /** @type {import('zodexy').SzCatch} */ (
              specificSchemaObject
            )?.innerType?.type
          ),
          topRoot, bringIntoFocus,
          buildTypeChoices, format,
          // schemaContent,
          replaced
        })
      ]],
      'Catch value',
      ['br'],
      ['div', {
        class: 'catchValue'
      }, [
        types.getUIForModeAndType({
          readonly: true,
          specificSchemaObject: {
            ...(/** @type {import('zodexy').SzCatch} */ (
              specificSchemaObject
            )?.innerType),
            description: '(catch value)'
          },
          hasValue: true,
          value: /** @type {import('zodexy').SzCatch} */ (
            specificSchemaObject
          ).value,
          resultType, typeNamespace,
          type: /** @type {import('../types.js').AvailableType} */ (
            /** @type {import('zodexy').SzCatch} */ (
              specificSchemaObject
            )?.innerType?.type
          ),
          topRoot, bringIntoFocus,
          buildTypeChoices, format,
          // schemaContent,
          replaced
        })
      ]]
    ]];
  },
  editUI ({
    format, type, buildTypeChoices, specificSchemaObject,
    topRoot, schemaContent, typeNamespace, value
  }) {
    const schemaValue =
      /** @type {import('zodexy').SzCatch} */ (
        specificSchemaObject
      )?.value;
    return ['div', {
      dataset: {type: 'catch'},
      title: specificSchemaObject?.description ?? '(a `catch`)'
    }, [
      ['label', [
        ['b', {
          title: String(schemaValue)
        }, ['Value']],
        ' ',
        ...(/** @type {import('../typeChoices.js').BuildTypeChoices} */ (
          buildTypeChoices
        )({
          // resultType,
          topRoot: /** @type {HTMLDivElement} */ (topRoot),
          format: /** @type {import('../formats.js').AvailableFormat} */ (
            format
          ),
          setValue: true,
          value: value ?? schemaValue,
          schemaOriginal: schemaContent,
          schemaContent: /** @type {import('zodexy').SzCatch} */ (
            specificSchemaObject
          )?.innerType,
          state: type,
          // itemIndex,
          typeNamespace
        }).domArray)
      ]]
    ]];
  }
};

export default catchType;
