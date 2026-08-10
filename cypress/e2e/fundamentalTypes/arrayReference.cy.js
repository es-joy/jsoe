describe('Array reference spec', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('checks for custom reference handling', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('customValidateAllReferences set');
      done();
    });
    cy.get('#setCustomValidateAllReferences').click();

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('null');
  });
  it('creates an array reference', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'object'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.get(
      sel +
      'div[data-type="object"] > .arrayContents > button.addArrayElement'
    ).click();

    cy.get(
      sel +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).type('bbb');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayReference');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).type('/aaa');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).then(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).validationMessage).to.eq(
        ''
      );
    });

    cy.get('button#viewUI').click();

    const viewSel = '#viewUIResults ';

    cy.get(
      viewSel +
      'fieldset:nth-of-type(1) .propertyName-undefined'
    ).contains('aaa');
    cy.get(viewSel + '.arrayHolder .arrayContents').contains(
      'Array length: 0'
    );

    cy.get(
      viewSel +
      'fieldset:nth-of-type(2) .propertyName-undefined'
    ).contains('bbb');
    cy.get(
      viewSel +
      'fieldset:nth-of-type(2) i[data-type="arrayReference"]'
    ).contains('arrayRef(/aaa)');


    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'aaa');
    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'arrayNonindexKeys');

    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'bbb');
    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'arrayReference');
  });

  it('errs with bad array reference path (self-reference)', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'object'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel +
      '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.get(
      sel +
      'div[data-type="object"] > .arrayContents > button.addArrayElement'
    ).click();

    cy.get(
      sel +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).type('bbb');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayReference');

    cy.get(
      sel + 'input[name="demo-keypath-not-expected-arrayReference"]'
    ).type('/bbb');

    cy.get(
      sel + 'input[name="demo-keypath-not-expected-arrayReference"]'
    ).then(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).validationMessage).to.eq(
        `Can't reference self`
      );
    });
  });

  it('errs with bad array reference path (non-array)', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'object'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel +
      '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('null');

    cy.get(
      sel +
      'div[data-type="object"] > .arrayContents > button.addArrayElement'
    ).click();

    cy.get(
      sel +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).type('bbb');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayReference');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).type('/aaa');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).then(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).validationMessage).to.eq(
        'Referent portion (at segment 0) is ' +
        'not an object or array'
      );
    });
  });

  it('errs with bad array reference path (global)', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'object'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel +
      '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayReference');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).then(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).validationMessage).to.eq(
        'Reference must match expected reference type ' +
        '(array or object)'
      );
    });
  });

  it('errs with non-JSON-pointer array reference path', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'object'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel +
      '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayReference');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).type('aaa');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).then(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).validationMessage).to.eq(
        'You must use a path beginning with "/" (or the empty string)'
      );
    });
  });

  it('errs with unescaped JSON-pointer array reference path', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'object'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel +
      '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayReference');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).type('/abc~d');

    cy.get(
      sel +
      'input[name="demo-keypath-not-expected-arrayReference"]'
    ).then(($input) => {
      expect(/** @type {HTMLInputElement} */ (
        $input[0]
      ).validationMessage).to.eq(
        'You must use a valid JSON Pointer (with ' +
        'tildes followed by 0 or 1)'
      );
    });
  });

  describe('`setValue`', function () {
    it('sets a complex value', function () {
      cy.get('#initializeWithComplexValue').click();

      cy.get(
        'legend[data-type="object"] input.propertyName-undefined'
      ).should(($input) => {
        expect($input.val()).to.equal('bbb');
      });

      cy.get(
        'fieldset .typeContainer legend[data-type="objectReference"] ' +
          'input.propertyName-undefined'
      ).should(($input) => {
        expect($input.val()).to.equal('ccc');
      });

      cy.get(
        'fieldset:nth-of-type(2) > legend[data-type="object"] ' +
          'input.propertyName-undefined'
      ).should(($input) => {
        expect($input.val()).to.equal('xxx');
      });

      cy.get(
        'fieldset:nth-of-type(2) > .typeContainer ' +
          'fieldset[data-type="arrayNonindexKeys"] input.propertyName-undefined'
      ).should(($input) => {
        expect($input.val()).to.equal('yyy');
      });

      cy.get(
        'fieldset:nth-of-type(3) > legend[data-type="arrayReference"] ' +
          'input.propertyName-undefined'
      ).should(($input) => {
        expect($input.val()).to.equal('zzz');
      });
    });
  });

  describe('`toValue`', function () {
    it('converts string of array reference to reference', function () {
      // Note: the following escapes `{` for Cypress as `{{}`
      cy.typeAndBlur('#getValueForString', '{{}aaa: [arrayRef(/aaa)]}');
      /**
       * @typedef {SelfReferencingArray[]} SelfReferencingArray
       */
      /** @type {SelfReferencingArray} */
      const aaaArray = [];
      aaaArray[0] = aaaArray;
      cy.get('@consoleLog').should('be.calledWith', {aaa: aaaArray});
    });

    // Todo: Fix `'{{}aaa: objectRef(/aaa)}'!`

    it('converts string of object reference to reference', function () {
      // Note: the following escapes `{` for Cypress as `{{}`
      cy.typeAndBlur('#getValueForString', '{{}aaa: {{}bbb: objectRef(/aaa)}}');
      /**
       * @typedef {{bbb?: SelfReferencingObject}} SelfReferencingObject
       */
      const aaaObject = {
        aaa: /** @type {SelfReferencingObject} */ ({})
      };
      aaaObject.aaa.bbb = aaaObject.aaa;
      cy.get('@consoleLog').should('be.calledWith', aaaObject);
    });

    it(
      'sets up an object reference with escaped JSON path components',
      function () {
        cy.typeAndBlur(
          // Escaping Cypresss' `{` with `{{}`
          '#getValueForString', '{{}b~and/: {{}c: objectRef(/b~0and~1)}}'
        );

        /**
         * @typedef {{c?: SelfReferencingPathObject}} SelfReferencingPathObject
         */
        const obj = {
          'b~and/': /** @type {SelfReferencingPathObject} */ ({})
        };
        obj['b~and/'].c = obj['b~and/'];

        cy.get('@consoleLog').should('be.calledWith', obj);
      }
    );

    it('ignores bad array reference path', function () {
      // Note: the following escapes `{` for Cypress as `{{}`
      cy.typeAndBlur('#getValueForString', '{{}aaa: [arrayRef(/abcd)]}');
      cy.get('@consoleLog').should('be.calledWith', {aaa: []});
    });
  });

  describe('Object references', function () {
    it('adds object reference path', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'object'
      );

      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

      cy.get(
        sel +
        '.arrayItems select.typeChoices-demo-keypath-not-expected'
      ).select('objectReference');

      cy.get('button#viewUI').click();

      const viewSel = '#viewUIResults ';

      cy.get(
        viewSel +
        'fieldset:nth-of-type(1) .propertyName-undefined'
      ).contains('aaa');
      cy.get(
        viewSel +
        'fieldset:nth-of-type(1) i[data-type="objectReference"]'
      ).contains('objectRef()');

      cy.get(
        sel +
        '.arrayItems fieldset:nth-of-type(1) ' +
          'input.propertyName-demo-keypath-not-expected'
      ).invoke('val').should('eq', 'aaa');
      cy.get(
        sel +
        '.arrayItems fieldset:nth-of-type(1) ' +
          'select.typeChoices-demo-keypath-not-expected'
      ).invoke('val').should('eq', 'objectReference');
    });

    it('adds object reference path (longer)', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'object'
      );

      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

      cy.get(
        sel +
        '.arrayItems select.typeChoices-demo-keypath-not-expected'
      ).select('object');

      cy.get(sel + '.arrayItems button.addArrayElement').click();
      cy.get(
        sel +
        '.arrayItems .arrayItems input.propertyName-demo-keypath-not-expected'
      ).type('bbb');

      cy.get(
        sel +
        '.arrayItems .arrayItems select.typeChoices-demo-keypath-not-expected'
      ).select(
        'objectReference'
      );

      cy.get(
        sel +
        'input[name=demo-keypath-not-expected-objectReference]'
      ).type('/aaa');

      cy.get('#logValue').click();
    });
  });
});
