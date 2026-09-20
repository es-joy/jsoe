import createJtltExtensions from '#jsoe/jtltExtensions.js';
import Types from '#jsoe/types.js';

/**
 * `JtltExtensionContext#appendOutput` types its argument as `unknown` (it
 * is jtlt's own, format-agnostic context, not specifically jsoe's), so
 * narrowing it back to `Node` here (to hand it to `Node#append`) needs a
 * declared predicate rather than an `instanceof` check (disallowed
 * project-wide) or a type-assertion cast.
 * @param {unknown} value
 * @returns {value is Node}
 */
function isNode (value) {
  return typeof value === 'object' && value !== null && 'nodeType' in value;
}

describe('createJtltExtensions', function () {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it(
    '`generateJsoeEditUI` resolves the value via `this.get(select, false)`' +
    ' and appends an editable control',
    function () {
      const types = new Types();
      const {generateJsoeEditUI} = createJtltExtensions(types);
      /** @type {{select: string|undefined, wrap: boolean}[]} */
      const getCalls = [];
      /** @type {unknown[]} */
      const appended = [];
      const context = {
        /**
         * @param {string|undefined} select
         * @param {boolean} wrap
         */
        get (select, wrap) {
          getCalls.push({select, wrap});
          return 'hello';
        },
        /**
         * @param {unknown} el
         */
        appendOutput (el) {
          appended.push(el);
        }
      };
      return cy.wrap(null).then(() => {
        return generateJsoeEditUI.call(context, {select: '$.record'});
      }).then(() => {
        expect(getCalls).to.deep.equal([{select: '$.record', wrap: false}]);
        expect(appended).to.have.length(1);
        const [firstAppended] = appended;
        if (!isNode(firstAppended)) {
          throw new TypeError('Expected `firstAppended` to be a `Node`');
        }
        document.body.append(firstAppended);
        expect(document.body.querySelector('textarea')).to.not.be.null;
      });
    }
  );

  it(
    '`generateJsoeViewUI` resolves the value via `this.get(select, false)`' +
    ' and appends a readonly control',
    function () {
      const types = new Types();
      const {generateJsoeViewUI} = createJtltExtensions(types);
      /** @type {{select: string|undefined, wrap: boolean}[]} */
      const getCalls = [];
      /** @type {unknown[]} */
      const appended = [];
      const context = {
        /**
         * @param {string|undefined} select
         * @param {boolean} wrap
         */
        get (select, wrap) {
          getCalls.push({select, wrap});
          return 'hello';
        },
        /**
         * @param {unknown} el
         */
        appendOutput (el) {
          appended.push(el);
        }
      };
      return cy.wrap(null).then(() => {
        return generateJsoeViewUI.call(context, {select: '$.record'});
      }).then(() => {
        expect(getCalls).to.deep.equal([{select: '$.record', wrap: false}]);
        expect(appended).to.have.length(1);
        const [firstAppended] = appended;
        if (!isNode(firstAppended)) {
          throw new TypeError('Expected `firstAppended` to be a `Node`');
        }
        document.body.append(firstAppended);
        expect(document.body.querySelector('textarea')).to.be.null;
        expect(document.body.querySelector('[data-type="string"]')).to.not.be.null;
      });
    }
  );

  it('defaults `typeNamespace` to `jtlt`', function () {
    const types = new Types();
    const {generateJsoeEditUI} = createJtltExtensions(types);
    const context = {
      get: () => 'hello',
      /**
       * @param {unknown} el
       */
      appendOutput (el) {
        if (!isNode(el)) {
          throw new TypeError('Expected `el` to be a `Node`');
        }
        document.body.append(el);
      }
    };
    return cy.wrap(null).then(() => {
      return generateJsoeEditUI.call(context, {select: '$.record'});
    }).then(() => {
      expect(document.body.querySelector('[data-type="string"]')).to.not.be.null;
    });
  });

  it(
    'fetches a schema via `getSchemaContent` only when both `db` and' +
    ' `store` are given, and threads it through to' +
    ' `getControlsForFormatAndValue`',
    function () {
      const types = new Types();
      const schemaContent = /** @type {import('zodexy').SzString} */ ({
        type: 'string'
      });
      /** @type {{db: string, store: string}[]} */
      const getSchemaContentCalls = [];
      /**
       * @type {{
       *   format: import('../../../src/formats.js').AvailableFormat,
       *   record: import('../../../src/formats.js').StructuredCloneValue,
       *   stateObj: import('../../../src/types.js').StateObject|undefined
       * }[]}
       */
      const getControlsCalls = [];
      const originalGetControls =
        types.getControlsForFormatAndValue.bind(types);
      types.getControlsForFormatAndValue = (format, record, stateObj) => {
        getControlsCalls.push({format, record, stateObj});
        return originalGetControls(format, record, stateObj);
      };
      const {generateJsoeEditUI} = createJtltExtensions(types, {
        getSchemaContent (db, store) {
          getSchemaContentCalls.push({db, store});
          return Promise.resolve(schemaContent);
        }
      });
      const context = {
        get: () => 'hello',
        /**
         * @param {unknown} el
         */
        appendOutput (el) {
          if (!isNode(el)) {
            throw new TypeError('Expected `el` to be a `Node`');
          }
          document.body.append(el);
        }
      };
      return cy.wrap(null).then(() => {
        return generateJsoeEditUI.call(context, {
          select: '$.record', db: 'myDb', store: 'myStore'
        });
      }).then(() => {
        expect(getSchemaContentCalls).to.deep.equal([
          {db: 'myDb', store: 'myStore'}
        ]);
        expect(getControlsCalls).to.have.length(1);
        const [{format, record, stateObj}] = getControlsCalls;
        expect(format).to.equal('structuredCloning');
        expect(record).to.equal('hello');
        if (!stateObj) {
          throw new TypeError('Expected `stateObj` to be defined');
        }
        expect(stateObj.readonly).to.equal(false);
        expect(stateObj.schemaContent).to.equal(schemaContent);
      });
    }
  );

  it(
    'does not call `getSchemaContent` (and infers type from the value' +
    ' alone) when `db`/`store` are omitted',
    function () {
      const types = new Types();
      /** @type {{db: string, store: string}[]} */
      const getSchemaContentCalls = [];
      const {generateJsoeEditUI} = createJtltExtensions(types, {
        getSchemaContent (db, store) {
          getSchemaContentCalls.push({db, store});
          return Promise.resolve(
            /** @type {import('zodexy').SzString} */ ({type: 'string'})
          );
        }
      });
      const context = {
        get: () => 'hello',
        /**
         * @param {unknown} el
         */
        appendOutput (el) {
          if (!isNode(el)) {
            throw new TypeError('Expected `el` to be a `Node`');
          }
          document.body.append(el);
        }
      };
      return cy.wrap(null).then(() => {
        return generateJsoeEditUI.call(context, {select: '$.record'});
      }).then(() => {
        expect(getSchemaContentCalls).to.deep.equal([]);
        expect(document.body.querySelector('textarea')).to.not.be.null;
      });
    }
  );
});
