import {
  getTypesonTextForValue, getValueForTypesonText, getValueForEvalText,
  getEvalSeedTextForValue, commitValueToContainer
} from '#jsoe/utils/rawTypesonEditor.js';
import Types from '#jsoe/types.js';

/**
 * Builds a real, appended object control, for tests that need to interact
 *   with the real, rendered control rather than calling
 *   `rawTypesonEditor.js` functions directly.
 *
 *   These tests never call `cy.visit()` (matching this directory's other
 *   specs, e.g. `dialogs.cy.js`, which import `src/utils/*.js` directly);
 *   with no page visited, `cy.get(cssSelector)` has no application document
 *   to search and can never find anything appended via a plain
 *   `document.body.append(...)` here. So callers must hold onto the actual
 *   element reference this yields (e.g. via `.as('root')`) and use
 *   `cy.wrap(root).find(...)`/`.should(...)` — which operate on that
 *   specific element's own subtree directly — instead of `cy.get(...)`.
 * @param {InstanceType<typeof Types>} types
 * @param {string} testId
 * @param {{[key: string]: unknown}} [value]
 * @returns {Cypress.Chainable<JQuery<HTMLDivElement>>}
 */
const buildAppendedObjectControl = (types, testId, value) => {
  const objectValue = value ?? {d: new Date(0)};
  return cy.wrap(null).then(() => {
    return types.getControlsForFormatAndValue(
      'structuredCloning', objectValue, {typeNamespace: testId}
    );
  // A `.then()` callback returning a raw DOM element is auto-wrapped by
  //   Cypress into a jQuery-like collection for the next step; unwrap it.
  }).then((rootUI) => {
    const root = /** @type {ArrayLike<HTMLDivElement>} */ (
      /** @type {unknown} */ (rootUI)
    )[0];
    document.body.append(root);
    return root;
  });
};

describe('rawTypesonEditor', function () {
  describe('`getTypesonTextForValue`/`getValueForTypesonText`', function () {
    it('round-trips a plain object with a string value', async function () {
      const value = {a: 1, b: 'hello'};
      const text = await getTypesonTextForValue(value);
      // The string value must be quoted (a bug in the `json-6` dependency's
      //   own `stringify` would otherwise emit `b: hello`, an unquoted
      //   bareword that is not even re-parseable); this module hand-rolls
      //   its own minimal stringifier to avoid that bug (see comments in
      //   `src/utils/rawTypesonEditor.js`).
      expect(text).to.contain('"hello"');
      expect(text).not.to.match(/\bhello\b(?!")/u);
      const revived = await getValueForTypesonText(text);
      expect(revived).to.deep.equal(value);
    });

    it('round-trips Date/RegExp/Map/Set', async function () {
      const value = {
        d: new Date('2024-01-01T00:00:00.000Z'),
        r: (/foo/gu),
        m: new Map([['x', 1], ['y', 2]]),
        s: new Set([1, 2, 3])
      };
      const text = await getTypesonTextForValue(value);
      const revived = /** @type {typeof value} */ (
        await getValueForTypesonText(text)
      );
      expect(revived.d).to.be.instanceOf(Date);
      expect(revived.d.toISOString()).to.equal(value.d.toISOString());
      expect(revived.r).to.be.instanceOf(RegExp);
      expect(revived.r.toString()).to.equal(value.r.toString());
      expect(revived.m).to.be.instanceOf(Map);
      // Not using `Iterator#toArray()`: not yet baseline-widely-available
      // eslint-disable-next-line unicorn/prefer-iterator-to-array -- Above
      expect([...revived.m.entries()]).to.deep.equal([...value.m.entries()]);
      expect(revived.s).to.be.instanceOf(Set);
      // eslint-disable-next-line unicorn/prefer-iterator-to-array -- As above
      expect([...revived.s.values()]).to.deep.equal([...value.s.values()]);
    });

    it('emits unquoted object keys where safe, quoted otherwise', async function () {
      const text = await getTypesonTextForValue({
        plainKey: 1, 'not-an-identifier': 2
      });
      expect(text).to.contain('plainKey:');
      expect(text).to.contain('"not-an-identifier":');
    });

    it('accepts hand-edited JSON6 syntax back (comments, unquoted keys)',
      async function () {
        const revived = await getValueForTypesonText(
          '{\n// a comment\nfoo: 1,\nbar: "baz",\n}'
        );
        expect(revived).to.deep.equal({foo: 1, bar: 'baz'});
      });
  });

  describe('`getValueForEvalText`/`getEvalSeedTextForValue`', function () {
    it('round-trips a plain value through eval, unlike Typeson text', async function () {
      const value = {a: 1, b: 'hello', c: new Date('2024-01-01T00:00:00.000Z')};
      const seed = await getEvalSeedTextForValue(value);
      const evaled = /** @type {typeof value} */ (getValueForEvalText(seed));
      expect(evaled.a).to.equal(1);
      expect(evaled.b).to.equal('hello');
      expect(evaled.c).to.be.instanceOf(Date);
      expect(evaled.c.toISOString()).to.equal(value.c.toISOString());
    });

    it('preserves the sign of -0 through eval, unlike plain String(value)', async function () {
      const seed = await getEvalSeedTextForValue(-0);
      expect(seed).to.equal('-0');
      const evaled = getValueForEvalText(seed);
      expect(Object.is(evaled, -0)).to.equal(true);
    });

    it('emits real constructor source, not Typeson-tagged data', async function () {
      const seed = await getEvalSeedTextForValue({d: new Date(0)});
      expect(seed).to.contain('new Date(');
      expect(seed).not.to.contain('$types');
    });

    it('round-trips Map/Set/RegExp through eval', async function () {
      const value = {
        m: new Map([['x', 1]]),
        s: new Set([1, 2]),
        r: (/foo/gu)
      };
      const seed = await getEvalSeedTextForValue(value);
      const evaled = /** @type {typeof value} */ (getValueForEvalText(seed));
      expect(evaled.m).to.be.instanceOf(Map);
      // Not using `Iterator#toArray()`: not yet baseline-widely-available
      // eslint-disable-next-line unicorn/prefer-iterator-to-array -- Above
      expect([...evaled.m.entries()]).to.deep.equal([...value.m.entries()]);
      expect(evaled.s).to.be.instanceOf(Set);
      // eslint-disable-next-line unicorn/prefer-iterator-to-array -- As above
      expect([...evaled.s.values()]).to.deep.equal([...value.s.values()]);
      expect(evaled.r.toString()).to.equal(value.r.toString());
    });

    it('round-trips a File through eval as real binary content', async function () {
      const file = new File(['hello world'], 'greeting.txt', {
        type: 'text/plain',
        lastModified: 1700000000000
      });
      const seed = await getEvalSeedTextForValue(file);
      expect(seed).to.contain('new File(');
      expect(seed).not.to.contain('$types');
      const evaled = /** @type {File} */ (getValueForEvalText(seed));
      expect(evaled).to.be.instanceOf(File);
      expect(evaled.name).to.equal('greeting.txt');
      expect(evaled.type).to.equal('text/plain');
      expect(evaled.lastModified).to.equal(1700000000000);
      const text = await evaled.text();
      expect(text).to.equal('hello world');
    });

    it('round-trips a plain Blob through eval as real binary content', async function () {
      const blob = new Blob(['blob content'], {type: 'text/plain'});
      const seed = await getEvalSeedTextForValue(blob);
      expect(seed).to.contain('new Blob(');
      const evaled = /** @type {Blob} */ (getValueForEvalText(seed));
      expect(evaled).to.be.instanceOf(Blob);
      expect(evaled.type).to.equal('text/plain');
      const text = await evaled.text();
      expect(text).to.equal('blob content');
    });

    it('throws a clear error for a cyclic value rather than hanging', async function () {
      const cyclic = /** @type {{self?: unknown}} */ ({});
      cyclic.self = cyclic;
      let error;
      try {
        await getEvalSeedTextForValue(cyclic);
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceOf(Error);
      expect(/** @type {Error} */ (error).message).to.match(/cyclic/u);
    });

    it('round-trips a Symbol (plain and registered) through eval', async function () {
      const plain = Symbol('a description');
      const plainSeed = await getEvalSeedTextForValue(plain);
      const plainEvaled = /** @type {symbol} */ (getValueForEvalText(plainSeed));
      expect(typeof plainEvaled).to.equal('symbol');
      expect(plainEvaled.toString()).to.equal(plain.toString());

      const registered = Symbol.for('registered-key');
      const registeredSeed = await getEvalSeedTextForValue(registered);
      expect(registeredSeed).to.equal('Symbol.for("registered-key")');
      const registeredEvaled = getValueForEvalText(registeredSeed);
      expect(registeredEvaled).to.equal(registered);
    });

    it('round-trips boxed String/Number/Boolean/BigInt through eval', async function () {
      const value = {
        // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing the boxed form
        s: new String('abc'),
        // eslint-disable-next-line no-new-wrappers,unicorn/new-for-builtins -- Testing the boxed form
        n: new Number(5),
        // eslint-disable-next-line no-new-wrappers,unicorn/new-for-builtins -- Testing the boxed form
        b: new Boolean(true),
        big: new Object(5n)
      };
      const seed = await getEvalSeedTextForValue(value);
      const evaled = /** @type {typeof value} */ (getValueForEvalText(seed));
      expect(typeof evaled.s).to.equal('object');
      expect(evaled.s.valueOf()).to.equal('abc');
      expect(evaled.n.valueOf()).to.equal(5);
      expect(evaled.b.valueOf()).to.equal(true);
      expect(evaled.big.valueOf()).to.equal(5n);
    });

    it('round-trips Error/TypeError/AggregateError (with cause) through eval', async function () {
      const value = {
        err: new TypeError('bad type', {cause: 'root cause'}),
        agg: new AggregateError([new Error('a'), new Error('b')], 'agg msg')
      };
      const seed = await getEvalSeedTextForValue(value);
      const evaled = /** @type {typeof value} */ (getValueForEvalText(seed));
      expect(evaled.err).to.be.instanceOf(TypeError);
      expect(evaled.err.message).to.equal('bad type');
      expect(evaled.err.cause).to.equal('root cause');
      expect(evaled.agg).to.be.instanceOf(AggregateError);
      expect(evaled.agg.message).to.equal('agg msg');
      expect(evaled.agg.errors.map((e) => e.message)).to.deep.equal(['a', 'b']);
    });

    it('round-trips DOMException/DOMRect/DOMPoint/DOMMatrix through eval', async function () {
      const value = {
        exc: new DOMException('bad state', 'InvalidStateError'),
        rect: new DOMRect(1, 2, 3, 4),
        point: new DOMPoint(1, 2, 3, 4),
        matrix: new DOMMatrix([1, 0, 0, 1, 5, 6])
      };
      const seed = await getEvalSeedTextForValue(value);
      const evaled = /** @type {typeof value} */ (getValueForEvalText(seed));
      expect(evaled.exc).to.be.instanceOf(DOMException);
      expect(evaled.exc.message).to.equal('bad state');
      expect(evaled.exc.name).to.equal('InvalidStateError');
      expect(evaled.rect).to.be.instanceOf(DOMRect);
      expect([evaled.rect.x, evaled.rect.y, evaled.rect.width, evaled.rect.height]).
        to.deep.equal([1, 2, 3, 4]);
      expect(evaled.point).to.be.instanceOf(DOMPoint);
      expect(evaled.matrix).to.be.instanceOf(DOMMatrix);
      expect(evaled.matrix.is2D).to.equal(true);
      expect(evaled.matrix.e).to.equal(5);
    });

    it('round-trips ArrayBuffer/DataView/typed arrays through eval', async function () {
      const bytes = new Uint8Array([1, 2, 3, 4]);
      const value = {
        buf: bytes.buffer,
        view: new DataView(bytes.buffer),
        typed: new Int8Array([5, 6, 7]),
        typed16: new Float16Array([1.5, 2.5])
      };
      const seed = await getEvalSeedTextForValue(value);
      const evaled = /** @type {typeof value} */ (getValueForEvalText(seed));
      expect(evaled.buf).to.be.instanceOf(ArrayBuffer);
      expect([...new Uint8Array(evaled.buf)]).to.deep.equal([1, 2, 3, 4]);
      expect(evaled.view).to.be.instanceOf(DataView);
      expect(evaled.view.getUint8(0)).to.equal(1);
      expect(evaled.typed).to.be.instanceOf(Int8Array);
      expect([...evaled.typed]).to.deep.equal([5, 6, 7]);
      expect(evaled.typed16).to.be.instanceOf(Float16Array);
      expect([...evaled.typed16]).to.deep.equal([1.5, 2.5]);
    });

    it('round-trips a FileList as a plain array of Files through eval', async function () {
      const dt = new DataTransfer();
      dt.items.add(new File(['a'], 'a.txt', {type: 'text/plain'}));
      dt.items.add(new File(['b'], 'b.txt', {type: 'text/plain'}));
      const seed = await getEvalSeedTextForValue(dt.files);
      expect(seed).to.match(/^\[.*\]$/u);
      const evaled = /** @type {File[]} */ (getValueForEvalText(seed));
      expect(evaled).to.have.length(2);
      expect(evaled[0]).to.be.instanceOf(File);
      expect(evaled.map((f) => f.name)).to.deep.equal(['a.txt', 'b.txt']);
    });

    it('throws instead of silently emitting {} for a Promise', async function () {
      let error;
      try {
        await getEvalSeedTextForValue(Promise.resolve(1));
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceOf(Error);
      expect(/** @type {Error} */ (error).message).to.match(/Promise/u);
    });

    it('throws instead of silently emitting {} for an unrecognized class instance', async function () {
      /**
       *
       */
      class Whatever {}
      let error;
      try {
        await getEvalSeedTextForValue(new Whatever());
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceOf(Error);
      expect(/** @type {Error} */ (error).message).to.match(/Whatever/u);
    });
  });

  describe('`commitValueToContainer`', function () {
    it(
      'resets item numbering so a later manual "+ Item" is not ' +
        'mis-numbered from before the replace',
      function () {
        const types = new Types();
        const typeNamespace = 'reset-item-index-test';
        // `object` (not e.g. `arrayNonindexKeys`) is the type that actually
        //   exercises the bug: `arrayNonindexKeys` is sparse, and its
        //   `itemIndex` self-heals — a manual "+ Item" click there
        //   recomputes it fresh from the live property inputs currently in
        //   the DOM, regardless of any staleness. Plain `object` (and plain
        //   `array`) are non-sparse, where "+ Item" instead just does
        //   `itemIndex++` on the closed-over counter — the one that goes
        //   stale without the `$resetItemIndex` fix.
        const type = 'object';
        buildAppendedObjectControl(
          types, typeNamespace, {a: 1, b: 2, c: 3}
        ).as('root');

        // The 3-property object is built asynchronously; `cy` retries.
        cy.get('@root').find('> .arrayContents > .arrayItems > fieldset').
          should('have.length', 3);

        cy.get('@root').then((rootUI) => {
          const root = /** @type {ArrayLike<HTMLDivElement>} */ (
            /** @type {unknown} */ (rootUI)
          )[0];
          return commitValueToContainer({
            types,
            format: 'structuredCloning',
            type,
            root,
            topRoot: root,
            typeNamespace,
            specificSchemaObject: undefined,
            value: {x: 1}
          });
        });

        cy.get('@root').find('> .arrayContents > .arrayItems > fieldset').
          should('have.length', 1).
          as('xFieldset');
        cy.get('@xFieldset').find('input[class*="propertyName"]').
          should('have.value', 'x');
        // The repopulated property is numbered exactly as a fresh
        //   single-property object's only property would be ("1"), not
        //   continuing from the original 3-property object's count.
        cy.get('@xFieldset').find('legend span.objectItem').
          should('have.text', '1');

        // Manually add a blank property, as a user would via "+ Item" after
        //   saving a raw edit. Without the `$resetItemIndex` fix, `itemIndex`
        //   would still reflect the original 3-property object (it was left
        //   at 2 after building properties "a"/"b"/"c") and this new blank
        //   property's placeholder legend would read "3" instead of "2".
        cy.get('@root').find('> .arrayContents > .addArrayElement').
          contains('+ Item').invoke('click');

        cy.get('@root').find('> .arrayContents > .arrayItems > fieldset').
          should('have.length', 2).
          last().
          find('legend span.objectItem').
          should('have.text', '2');

        cy.get('@root').then((rootUI) => {
          /** @type {ArrayLike<HTMLDivElement>} */ (
            /** @type {unknown} */ (rootUI)
          )[0].remove();
        });
      }
    );

    it(
      'keeps an existing property’s legend number unchanged when a ' +
        'raw edit only changes its value, not the property count',
      function () {
        const types = new Types();
        const typeNamespace = 'reset-item-index-value-only-test';
        buildAppendedObjectControl(types, typeNamespace, {}).as('root');

        // Manually add the object's first (and only) property, exactly as
        //   the reported regression scenario did: a brand-new object's
        //   first "+ Item" click is numbered "1".
        cy.get('@root').find('> .arrayContents > .addArrayElement').
          contains('+ Item').invoke('click');
        cy.get('@root').find('> .arrayContents > .arrayItems > fieldset').
          should('have.length', 1).
          as('fieldset');
        cy.get('@fieldset').find('legend span.objectItem').
          should('have.text', '1');

        // Read the live value exactly as `openRawEditorDialog` does, then
        //   write back the *same* key with a different value — mirroring a
        //   user opening "Edit raw", changing only the value in eval/JSON6
        //   text, and saving.
        cy.get('@root').then((rootUI) => {
          const root = /** @type {ArrayLike<HTMLDivElement>} */ (
            /** @type {unknown} */ (rootUI)
          )[0];
          const value = /** @type {{[key: string]: unknown}} */ (
            types.getValueForRoot(
              /** @type {any} */ (root),
              /** @type {any} */ ({
                typeNamespace, formats: types.formats,
                format: 'structuredCloning', types
              }),
              ''
            )
          );
          const [key] = Object.keys(value);
          return commitValueToContainer({
            types,
            format: 'structuredCloning',
            type: 'object',
            root,
            topRoot: root,
            typeNamespace,
            specificSchemaObject: undefined,
            value: {[key]: 'a new value'}
          });
        });

        // The property's own legend must still read "1" — not "0" — since
        //   nothing about the object's property count or order changed,
        //   only its value.
        cy.get('@root').find('> .arrayContents > .arrayItems > fieldset').
          should('have.length', 1).
          find('legend span.objectItem').
          should('have.text', '1');

        cy.get('@root').then((rootUI) => {
          /** @type {ArrayLike<HTMLDivElement>} */ (
            /** @type {unknown} */ (rootUI)
          )[0].remove();
        });
      }
    );
  });

  // The raw-editor dialog (built by `dialogs.js`) is appended to the same
  //   "wrong-relative-to-the-AUT-frame" document as the rest of these
  //   no-`cy.visit()` tests' elements (see `buildAppendedObjectControl`'s
  //   comment) — so it's located the same way: a plain `document` query,
  //   retried via `cy.wrap(null).should(...)` until it appears, rather than
  //   `cy.get('dialog[open]')`.
  const getOpenDialog = () => {
    return cy.wrap(null).should(() => {
      expect(document.querySelector('dialog[open]')).to.exist;
    }).then(() => {
      return /** @type {HTMLDialogElement} */ (
        document.querySelector('dialog[open]')
      );
    });
  };

  describe('`allowUnsafeEval` gating (via the "Edit raw" button)', function () {
    it('hides the eval-mode selector by default', function () {
      const types = new Types();
      buildAppendedObjectControl(types, 'allow-unsafe-eval-default-off').
        as('root');

      // The `d` property is built asynchronously; wait for it so the
      //   control's read value isn't a still-empty `{}`.
      cy.get('@root').find('> .arrayContents > .arrayItems > fieldset').
        should('have.length', 1);
      cy.get('@root').find('.editRawTypeson').invoke('click');
      getOpenDialog().as('dialog');

      cy.get('@dialog').find('.jsoe-raw-editor .cm-content').should('exist');
      cy.get('@dialog').find('select.jsoe-raw-editor-mode').
        should('not.exist');
      // Only mode available is Typeson/JSON6, so the Date shows tagged.
      cy.get('@dialog').find('.jsoe-raw-editor .cm-content').
        invoke('text').should('include', '$types');

      cy.get('@dialog').find('> .submit > .cancel').invoke('click');
      cy.get('@root').then((rootUI) => {
        /** @type {ArrayLike<HTMLDivElement>} */ (
          /** @type {unknown} */ (rootUI)
        )[0].remove();
      });
    });

    it(
      'shows the eval-mode selector when allowUnsafeEval is true, and ' +
        'switching to it reseeds with real JS source instead of Typeson data',
      function () {
        const types = new Types({allowUnsafeEval: true});
        buildAppendedObjectControl(types, 'allow-unsafe-eval-on').as('root');

        // The `d` property is built asynchronously; wait for it so the
        //   control's read value isn't a still-empty `{}`.
        cy.get('@root').find('> .arrayContents > .arrayItems > fieldset').
          should('have.length', 1);
        cy.get('@root').find('.editRawTypeson').invoke('click');
        getOpenDialog().as('dialog');

        cy.get('@dialog').find('.jsoe-raw-editor .cm-content').
          should('exist');
        cy.get('@dialog').find('select.jsoe-raw-editor-mode').
          should('exist').
          find('option').should('have.length', 2);

        // Starts in Typeson mode: the Date is tagged, not a real `new Date`.
        cy.get('@dialog').find('.jsoe-raw-editor .cm-content').
          invoke('text').should('include', '$types');

        // `cy.select()` is an action command requiring the element be
        //   within cypress's own (unused, blank) AUT viewport; set the
        //   value and dispatch `change` directly instead, as with `click`
        //   above.
        cy.get('@dialog').find('select.jsoe-raw-editor-mode').then(($select) => {
          const select = /** @type {HTMLSelectElement} */ ($select[0]);
          select.value = 'eval';
          select.dispatchEvent(new Event('change', {bubbles: true}));
        });

        // After switching, the same Date value is reseeded as real JS
        //   constructor source, with no Typeson tagging at all.
        cy.get('@dialog').find('.jsoe-raw-editor .cm-content').
          invoke('text').
          should('include', 'new Date(').
          and('not.include', '$types');

        cy.get('@dialog').find('> .submit > .cancel').invoke('click');
        cy.get('@root').then((rootUI) => {
          /** @type {ArrayLike<HTMLDivElement>} */ (
            /** @type {unknown} */ (rootUI)
          )[0].remove();
        });
      }
    );
  });
});
