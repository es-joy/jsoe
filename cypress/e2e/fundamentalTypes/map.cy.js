describe('Map spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('map');
    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + '.mapKeyHolder > .typeChoices-key-type-choices-only'
    ).select('null');

    cy.get(
      sel + '.arrayItems .typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + 'fieldset:nth-of-type(2) .mapKeyHolder > ' +
      '.typeChoices-key-type-choices-only'
    ).select('false');

    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
      '.typeChoices-demo-keypath-not-expected'
    ).select('string');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults > div[data-type="map"] > div').should('exist');
    cy.get(
      '#viewUIResults > div[data-type="map"] > div'
    ).should('contain', 'Map size');
    cy.get('#viewUIResults i[data-type="null"]').should('exist');
    cy.get('#viewUIResults i[data-type="null"]').should('contain', 'null');
  });

  it('creates form control (nested map value)', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('object');
    cy.get(sel + '.addArrayElement').click();

    cy.get(sel + '.propertyName-demo-keypath-not-expected').type(
      'aaa'
    );

    cy.get(
      sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('map');
    cy.get(
      sel + '.arrayItems .addArrayElement'
    ).click();

    cy.get(
      sel + '.mapKeyHolder > .typeChoices-key-type-choices-only'
    ).select('true');

    cy.get(
      sel + '.arrayItems .arrayItems .typeChoices-demo-keypath-not-expected'
    ).select('BooleanObject');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults > div[data-type="object"]').should('exist');
    cy.get(
      '#viewUIResults > div[data-type="object"]'
    ).should('contain', 'Object');
    const innerArrayHolder = '#viewUIResults > .arrayHolder > ' +
      '.arrayContents > .arrayItems > ' +
      'fieldset > .arrayHolder';
    cy.get(
      innerArrayHolder
    ).should('contain', 'Map');

    cy.get(
      innerArrayHolder + ' .arrayContents > .arrayItems > ' +
      'fieldset > fieldset:nth-of-type(1) > legend'
    ).should('contain', 'Key');

    cy.get(
      innerArrayHolder + ' .arrayContents > .arrayItems > ' +
      'fieldset > fieldset:nth-of-type(1) > i'
    ).should('contain', 'true');

    cy.get(
      innerArrayHolder + ' .arrayContents > .arrayItems > ' +
      'fieldset > fieldset:nth-of-type(2) > legend'
    ).should('contain', 'Value');

    cy.get(
      innerArrayHolder + ' .arrayContents > .arrayItems > ' +
      'fieldset > fieldset:nth-of-type(2) > i'
    ).should('contain', 'Boolean(true)');
  });

  it('creates form control (nested map key)', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('map');
    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + '.mapKeyHolder > .typeChoices-key-type-choices-only'
    ).select('map');

    cy.get(sel + '.mapKeyHolder .addArrayElement').click();

    cy.get(
      sel + '.arrayItems .arrayItems .mapKeyHolder > ' +
      '.typeChoices-key-type-choices-only'
    ).select('false');

    cy.get(
      sel + '.arrayItems .arrayItems fieldset > ' +
      '.typeChoices-key-type-choices-only'
    ).select('BooleanObject');

    cy.get(
      sel + '.arrayItems .typeChoices-demo-keypath-not-expected'
    ).select('null');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults > div[data-type="map"]').should('exist');
    cy.get(
      '#viewUIResults > div[data-type="map"]'
    ).should('contain', 'Map');

    cy.get(
      '#viewUIResults .arrayItems .arrayItems fieldset ' +
      'fieldset:nth-of-type(1) i'
    ).should('contain', 'false');

    cy.get(
      '#viewUIResults .arrayItems .arrayItems fieldset ' +
      'fieldset:nth-of-type(2) i'
    ).should('contain', 'Boolean(true)');

    cy.get(
      '#viewUIResults > .arrayHolder > .arrayContents > .arrayItems ' +
      'fieldset > ' +
      'fieldset:nth-of-type(2) i'
    ).should('contain', 'null');
  });

  it('gets warning for duplicate keys (null and null)', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('map');
    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + '.mapKeyHolder > .typeChoices-key-type-choices-only'
    ).select('null');

    cy.get(
      sel + '.arrayItems .typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + 'fieldset:nth-of-type(2) .mapKeyHolder > ' +
      '.typeChoices-key-type-choices-only'
    ).select('null');

    // Why isn't this working?
    // // eslint-disable-next-line promise/catch-or-return -- Cypress
    // cy.get(
    //   sel +
    //   'fieldset:nth-of-type(2) select.typeChoices-key-type-choices-only'
    // // eslint-disable-next-line promise/always-return, promise/prefer-await-to-then
    // ).then(($select) => {
    //   expect(/** @type {HTMLSelectElement} */ (
    //     $select[0]
    //   ).validationMessage).to.eq(
    //     'Duplicate Map key value'
    //   );
    // });

    cy.get('#isValid').click();
    cy.get('dialog[open]').should('include.text', 'false');
  });

  it('gets warning for duplicate keys (-0 and 0)', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('map');
    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + '.mapKeyHolder > .typeChoices-key-type-choices-only'
    ).select('number');

    cy.clearAndType(
      sel + 'input[name="key-type-choices-only-number"]',
      '0'
    );

    cy.get(
      sel + '.arrayItems .typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + 'fieldset:nth-of-type(2) .mapKeyHolder > ' +
      '.typeChoices-key-type-choices-only'
    ).select('SpecialNumber');

    cy.get(
      sel + 'select[name="key-type-choices-only-SpecialNumber"]'
    ).select('-0');

    // Why isn't this working?
    // // eslint-disable-next-line promise/catch-or-return -- Cypress
    // cy.get(
    //   sel +
    //   'fieldset:nth-of-type(2) select.typeChoices-key-type-choices-only'
    // // eslint-disable-next-line promise/always-return, promise/prefer-await-to-then
    // ).then(($select) => {
    //   expect(/** @type {HTMLSelectElement} */ (
    //     $select[0]
    //   ).validationMessage).to.eq(
    //     'Duplicate Map key value'
    //   );
    // });

    cy.get('#isValid').click();
    cy.get('dialog[open]').should('include.text', 'false');
  });

  it('gets warning for duplicate keys (NaN and NaN)', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('map');
    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + '.mapKeyHolder > .typeChoices-key-type-choices-only'
    ).select('SpecialNumber');

    cy.get(
      sel + '.arrayItems .typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(sel + '.addArrayElement').click();

    cy.get(
      sel + 'fieldset:nth-of-type(2) .mapKeyHolder > ' +
      '.typeChoices-key-type-choices-only'
    ).select('SpecialNumber');

    // Why isn't this working?
    // // eslint-disable-next-line promise/catch-or-return -- Cypress
    // cy.get(
    //   sel +
    //   'fieldset:nth-of-type(2) select.typeChoices-key-type-choices-only'
    // // eslint-disable-next-line promise/always-return, promise/prefer-await-to-then
    // ).then(($select) => {
    //   expect(/** @type {HTMLSelectElement} */ (
    //     $select[0]
    //   ).validationMessage).to.eq(
    //     'Duplicate Map key value'
    //   );
    // });

    cy.get('#isValid').click();
    cy.get('dialog[open]').should('include.text', 'false');
  });

  it('shows form control from root ancestor (for a map)', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('map');

    cy.get('#showFormControlFromRootAncestor').click();

    cy.get(
      '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
      'div[data-type="map"] > button'
    ).should(($button) => {
      expect($button[0].style.backgroundColor).to.equal('red');
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
    cy.wait(3000);

    cy.get(
      '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
      'div[data-type="map"] > button'
    ).should(($button) => {
      expect($button[0].style.backgroundColor).to.not.equal('red');
    });
  });

  it('converts a string to a Map', function () {
    cy.typeAndBlur('#getValueForString', 'Map([3, "abc"])');
    cy.get('@consoleLog').should('be.calledWith', new Map([[3, 'abc']]));
  });
});

describe('Map spec (schema)', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it(
    'Generates UI for map',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 7');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Map (A map)'
      );
      cy.get(sel + 'button.addArrayElement').click();

      cy.get(sel + '.mapKey').should(($span) => {
        expect($span.text()).to.contain('A map key number');
        expect($span.attr('title')).to.equal('(map key)');
      });

      cy.get(sel + '.mapValue').should(($span) => {
        expect($span.text()).to.contain('A map value string');
        expect($span.attr('title')).to.equal('(map value)');
      });

      cy.clearAndType(
        sel + 'input[name="key-type-choices-only-number"]',
        '123'
      );

      cy.clearAndType(
        sel + 'textarea[name="demo-keypath-not-expected-string"]',
        'abc'
      );

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults > div[data-type="map"] > div'
      ).should('contain', 'A map size');

      cy.get('#viewUIResults i[data-type="number"]').should('contain', '123');
      cy.get(
        '#viewUIResults span[data-type="string"]'
      ).should('contain', 'abc');

      cy.get(
        '#viewUIResults .arrayItems > fieldset > fieldset:nth-of-type(1) ' +
        'legend'
      ).should(($span) => {
        expect($span.text()).to.contain('A map key number');
        expect($span.attr('title')).to.equal('(map key)');
      });

      cy.get(
        '#viewUIResults .arrayItems > fieldset > fieldset:nth-of-type(2) ' +
        'legend'
      ).should(($span) => {
        expect($span.text()).to.contain('A map value string');
        expect($span.attr('title')).to.equal('(map value)');
      });
    }
  );

  it('enforces map `min` and `max` values', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 7');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Map (A map with mins and maxes)'
    );

    cy.get(sel + '.arrayItems > fieldset').should('have.length', 2);
    cy.get(
      sel + '.arrayItems > fieldset > button:nth-of-type(2)'
    ).should('be.disabled');

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(sel + 'button.addArrayElement').click();
    cy.get(sel + '.arrayItems > fieldset').should('have.length', 4);

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open]').should(
      'contain', 'You cannot add beyond the `max` of the Map'
    );
    cy.get('dialog[open] .submit > button').click();

    cy.get(
      sel + '.arrayItems > fieldset > button:nth-of-type(1)'
    ).contains('+').click();
    cy.get('dialog[open]').should(
      'contain', 'You cannot add beyond the `max` of the Map'
    );
    cy.get('dialog[open] .submit > button').click();
    cy.get(sel + '.arrayItems > fieldset').should('have.length', 4);
  });

  it('enforces a map `max` of zero', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 7');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Map (A map with max zero)'
    );

    cy.get(sel + '.arrayItems > fieldset').should('have.length', 0);
    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open]').should(
      'contain', 'You cannot add beyond the `max` of the Map'
    );
    cy.get('dialog[open] .submit > button').click();
    cy.get(sel + '.arrayItems > fieldset').should('have.length', 0);
  });
});
