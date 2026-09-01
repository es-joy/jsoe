describe('Set spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('set');
    cy.get(sel + '.addArrayElement').click();
    cy.get('.arrayItems .typeChoices-demo-keypath-not-expected').select('null');
    cy.get(sel + '.addArrayElement').click();
    cy.get(sel + '.arrayItems fieldset:nth-of-type(2) ' +
      '.typeChoices-demo-keypath-not-expected').select('true');
    cy.get('#viewUI').click();

    cy.get('#viewUIResults div[data-type="set"]').should(
      'contain', 'Set'
    );

    cy.get('#viewUIResults i[data-type="null"]').should(
      'contain', 'null'
    );

    cy.get('#viewUIResults i[data-type="true"]').should(
      'contain', 'true'
    );
  });

  it('errs on duplicate set values', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select('set');
    cy.get(sel + '.addArrayElement').click();
    cy.get('.arrayItems .typeChoices-demo-keypath-not-expected').select('true');
    cy.get(sel + '.addArrayElement').click();

    cy.get(sel + '.arrayItems fieldset:nth-of-type(2) ' +
      '.typeChoices-demo-keypath-not-expected').select('true');

    cy.get(
      sel + 'input[name="demo-keypath-not-expected-true2"][value=true]'
    ).should(
      'be.checked'
    );

    cy.get(
      sel + 'input[name="demo-keypath-not-expected-true3"][value=true]'
    ).should(
      'be.checked'
    );

    // Why isn't this working?
    // // eslint-disable-next-line promise/catch-or-return -- Cypress
    // cy.get(
    //   sel + 'input[name="demo-keypath-not-expected-true2"][value=true]'
    // // eslint-disable-next-line promise/always-return, promise/prefer-await-to-then
    // ).then(($radio) => {
    //   expect(/** @type {HTMLInputElement} */ (
    //     $radio[0]
    //   ).validationMessage).to.eq(
    //     'Duplicate Set value'
    //   );
    // });

    cy.get('#isValid').click();
    cy.get('dialog[open]').should('include.text', 'false');
  });

  it('converts a string to a Set', function () {
    cy.typeAndBlur('#getValueForString', 'Set(3, "abc")');
    cy.get('@consoleLog').should('be.calledWith', new Set([3, 'abc']));
  });

  it('shows form control from root ancestor (for a set)', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('set');

    cy.get('#showFormControlFromRootAncestor').click();

    cy.get(
      '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
      'div[data-type="set"] > button'
    ).should(($button) => {
      expect($button[0].style.backgroundColor).to.equal('red');
    });

    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
    cy.wait(3000);

    cy.get(
      '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
      'div[data-type="set"] > button'
    ).should(($button) => {
      expect($button[0].style.backgroundColor).to.not.equal('red');
    });
  });
});


describe('Set spec (schema)', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it(
    'Generates UI for Set with `minSize` and `maxSize`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Set (A set with mins and maxes)'
      );

      cy.get(
        sel + 'fieldset:nth-of-type(1) > legend[data-type="string"]'
      ).should('contain', 'A Set item');

      cy.get(
        sel + 'fieldset:nth-of-type(2) > legend[data-type="string"]'
      ).should('contain', 'A Set item');

      cy.get(
        sel + 'fieldset:nth-of-type(3) > legend[data-type="string"]'
      ).should('not.exist');

      cy.clearTypeAndBlur(sel + 'fieldset:nth-of-type(1) textarea', 'abc123');

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults .arrayItems ' +
          'fieldset:nth-of-type(1) > legend'
      ).should('contain', 'A Set item');

      cy.get(
        '#viewUIResults .arrayItems ' +
          'fieldset:nth-of-type(1) [data-type="string"]'
      ).should('have.text', 'abc123');

      // Test attempt to add beyond `maxSize`
      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'button.addArrayElement').click();
      cy.get('dialog[open]').should(
        'contain',
        'You cannot add beyond the `maxSize` of the Set'
      );
      cy.get('dialog[open] .submit > button').click();

      // Try through `+` button
      cy.get(
        sel + '.arrayItems > fieldset > button:nth-of-type(1)'
      ).contains('+').click();
      cy.get('dialog[open]').should(
        'contain',
        'You cannot add beyond the `maxSize` of the Set'
      );
      cy.get('dialog[open] .submit > button').click();

      // Cover legitimate removal and add
      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(3) > button:nth-of-type(2)'
      ).contains('x').click();
      cy.get(
        sel + '.arrayItems > fieldset > button:nth-of-type(1)'
      ).contains('+').click();
    }
  );

  it(
    'Generates UI for Set with `never`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Set (With never)'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get('dialog[open]').should(
        'contain',
        'Set has type "never", so one cannot add to it.'
      );
      cy.get('dialog[open] .submit > button').click();

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults .arrayContents > div '
      ).should('contain', 'With never size:');
    }
  );
});
