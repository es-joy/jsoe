import Types, {
  getPropertyValueFromLegend
} from '../../../instrumented/types.js';
// import Types, {
//   getPropertyValueFromLegend
// } from '../../../src/types.js'; // Test Cypress TS

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
