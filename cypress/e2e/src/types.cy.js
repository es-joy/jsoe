import Types, {
  getPropertyValueFromLegend
} from '#jsoe/types.js';

describe('`getPropertyValueFromLegend`', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });
  it('throws if no property on supplied element', function () {
    const legend = document.createElement('legend');
    document.body.append(legend);

    expect(() => {
      getPropertyValueFromLegend(legend);
    }).to.throw('No property on the supplied legend element');
  });

  it('throws if no property text content is found', function () {
    const legend = document.createElement('legend');
    const span = document.createElement('span');
    span.dataset.prop = 'true';
    legend.append(span);
    document.body.append(legend);
    expect(() => {
      getPropertyValueFromLegend(legend);
    }).to.throw('No property with text present on the supplied legend element');
  });
});

describe('`Types.getTypeForRoot`', function () {
  it('`getTypeForRoot` with null root', function () {
    expect(Types.getTypeForRoot(null)).to.equal('null');
  });
});

describe('`Types.getFormControlFromRootAncestor`', function () {
  it('`getFormControlFromRootAncestor` with non-root ancestor', function () {
    const types = new Types();
    expect(types.getFormControlFromRootAncestor(
      'missing'
    )).to.be.null;
  });
});

describe('`Types.validate` zodexy error messages', function () {
  /**
   * @param {Types} types
   * @returns {HTMLInputElement}
   */
  function getInvalidNumberInput (types) {
    const root = /** @type {HTMLDivElement} */ (types.getUIForModeAndType({
      readonly: false,
      typeNamespace: 'zodexy-error',
      type: 'number',
      format: 'schema',
      value: undefined,
      hasValue: false,
      specificSchemaObject: {
        type: 'number',
        error: 'Schema validation message'
      }
    }));
    document.body.append(root);
    types.validate({type: 'number', root, avoidReport: true});
    return /** @type {HTMLInputElement} */ (root.querySelector('input'));
  }

  /**
   * @param {Types} types
   * @returns {HTMLTextAreaElement}
   */
  function getInvalidStringInput (types) {
    const root = types.getUIForModeAndType({
      readonly: false,
      typeNamespace: 'zodexy-string-error',
      type: 'string',
      format: 'schema',
      value: 'invalid',
      hasValue: true,
      specificSchemaObject: {
        type: 'string',
        startsWith: 'valid',
        error: 'Schema string message'
      }
    });
    document.body.append(root);
    const textarea = /** @type {HTMLTextAreaElement} */ (
      root.querySelector('textarea')
    );
    textarea.dispatchEvent(new Event('change'));
    return textarea;
  }

  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('uses default validation messages by default', function () {
    const input = getInvalidNumberInput(new Types());
    expect(input.validationMessage).to.equal('Not a valid (finite) number');
  });

  it('uses a zodexy error when enabled', function () {
    const input = getInvalidNumberInput(new Types({
      useZodexyErrorMessages: true
    }));
    expect(input.validationMessage).to.equal('Schema validation message');
  });

  it('overrides schema validation messages set within a type', function () {
    const types = new Types({
      useZodexyErrorMessages: true,
      useZodexyErrorMessagesInTypes: true
    });
    const textarea = getInvalidStringInput(types);
    expect(textarea.validationMessage).to.equal('Schema string message');

    textarea.value = 'valid value';
    textarea.dispatchEvent(new Event('change'));
    expect(textarea.validationMessage).to.equal('');
  });

  it('disables zodexy errors set within types by default', function () {
    const types = new Types({
      useZodexyErrorMessages: true
    });
    expect(getInvalidNumberInput(types).validationMessage).to.equal(
      'Schema validation message'
    );
    expect(getInvalidStringInput(types).validationMessage).to.equal(
      `Value doesn't start with expected: valid`
    );
  });
});

describe('`Types.getTypeOptionsForFormatAndState`', function () {
  it(
    '`getTypeOptionsForFormatAndState` with bad states for format',
    function () {
      expect(() => {
        const types = new Types();
        types.getTypeOptionsForFormatAndState(
          'json', 'nonexistent'
        );
      }).to.throw('Unexpected type for format and state');

      expect(() => {
        const types = new Types();
        types.getTypeOptionsForFormatAndState(
          'indexedDBKey', 'nonexistent'
        );
      }).to.throw('Unexpected type for format and state');
    }
  );

  it(
    '`getTypeOptionsForFormatAndState` with schema format and no schema',
    function () {
      expect(() => {
        const types = new Types();
        types.getTypeOptionsForFormatAndState(
          'schema'
        );
      }).to.throw('Missing schema object');
    }
  );
});

describe('`Types.getValueForString`', function () {
  it('`getValueForString` throws with bad state for format', function () {
    expect(() => {
      const types = new Types();
      types.getValueForString('test', {
        format: 'json',
        state: 'badFormat',
        parent: {},
        parentPath: '',
        // @ts-expect-error -- Bad argument
        schemaObject: {},
        // @ts-expect-error -- Bad argument
        schemaOriginal: {}
      });
    }).to.throw('Could not get types for format and state');
  });
});
