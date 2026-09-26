import enumSearchType from '#jsoe/search/fundamentalTypes/enumSearchType.js';

describe('enumSearchType', () => {
  it(
    'labels a native enum\'s options as "value (key)" when key and value differ',
    () => {
      const [, , children] = /** @type {[string, object, any[]]} */ (
        /** @type {unknown} */ (
          enumSearchType.buildUI({
            schemaObject: /** @type {import('zodexy').SzEnum} */ ({
              type: 'enum',
              values: {Red: 'red', Green: 'green'}
            }),
            path: '#/nativeEnum',
            typeNamespace: 'native-enum-test'
          })
        )
      );
      const [, , optionsArr] = /** @type {[string, object, any[]]} */ (
        children.find((el) => Array.isArray(el) && el[0] === 'select')
      );
      const labels = optionsArr.map(([, , [label]]) => label);
      expect(labels).to.deep.equal(['red (Red)', 'green (Green)']);
    }
  );
});
