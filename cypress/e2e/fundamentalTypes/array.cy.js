describe('Array spec', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('creates sparse arrays', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'arrayNonindexKeys'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open] > .submit > button:nth-child(1)').click();
    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(
      sel + '.arrayContents .arrayContents input[type="number"]', '4'
    );

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.clearAndType(
      sel +
        '.arrayItems .arrayItems input.propertyName-demo-keypath-not-expected',
      '1'
    );

    cy.get(
      sel +
        '.arrayItems .arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('true');
  });

  it('creates sparse array items with + button', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'arrayNonindexKeys'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open] > .submit > button:nth-child(1)').click();

    cy.clearAndType(
      sel + 'input.propertyName-demo-keypath-not-expected',
      'aaa'
    );

    cy.get(
      sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(
      sel + '.arrayContents .arrayContents input[type="number"]', '4'
    );

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    // Todo: Seems to be a bug with the `+` button when no item; adds
    //        to properties instead of array
    cy.get(
      sel + '.arrayContents div[data-type="arrayNonindexKeys"] ' +
      '.arrayItems > fieldset > button:nth-of-type(1)'
    ).contains('+').click();

    cy.get(
      sel + '.arrayContents div[data-type="arrayNonindexKeys"] ' +
      'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '0');

    cy.get(
      sel + '.arrayContents div[data-type="arrayNonindexKeys"] ' +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '1');
  });

  it('resorts sparse array upon deletion', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'arrayNonindexKeys'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open] > .submit > button:nth-child(1)').click();

    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(
      sel + '.arrayItems .arrayContents input[type="number"]', '4'
    );

    cy.get(
      sel + 'div[data-type="arrayNonindexKeys"] ' +
        '.arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel + 'div[data-type="arrayNonindexKeys"] ' +
        '.arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel + 'div[data-type="arrayNonindexKeys"] ' +
      'fieldset:nth-of-type(1) button:nth-of-type(2)'
    ).contains('x').click();

    cy.get(
      sel + '.arrayItems .arrayItems ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '1');
  });

  it('resorts properties of sparse array upon property rename', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'arrayNonindexKeys'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open] > .submit > button:nth-child(1)').click();

    cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

    cy.get(
      sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(
      sel + '.arrayContents .arrayContents input[type="number"]', '4'
    );

    cy.get(
      sel + 'div[data-type="arrayNonindexKeys"] ' +
        '.arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.typeAndBlur(
      sel +
      '.arrayItems .arrayItems fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected',
      'zab'
    );

    cy.get(
      sel +
      '.arrayItems .arrayItems fieldset:nth-of-type(1) ' +
      'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '1');
  });

  it('shows invalid length if not extending array', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'arrayNonindexKeys'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open] > .submit > button:nth-child(1)').click();

    cy.get(
      sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('number');

    cy.clearAndType(
      sel + 'input[name="demo-keypath-not-expected-number"]',
      '3'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open] > .submit > button:nth-child(1)').click();

    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('number');

    cy.clearTypeAndBlur(
      sel +
        '.arrayItems > fieldset:nth-of-type(2) ' +
          'input.propertyName-demo-keypath-not-expected',
      '4'
    );

    cy.get(
      'dialog[open]:not(.addRecordDialog) .submit button:nth-of-type(2)'
    ).click();

    cy.get(
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).then(($button) => {
      expect(/** @type {HTMLButtonElement} */ (
        $button[0]
      ).validationMessage).to.eq(
        'Invalid length'
      );
    });
  });

  it('ignores extra last item removal click', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'arrayNonindexKeys'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get('dialog[open] > .submit > button:nth-child(1)').click();

    cy.get('input.propertyName-demo-keypath-not-expected').type('aaa');
    cy.get(
      '.arrayItems select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');
    cy.clearTypeAndBlur(
      sel +
      '.arrayContents .arrayContents input[type="number"]', '4'
    );

    // Check removal of last item
    cy.get(
      'div[data-type="arrayNonindexKeys"] .arrayContents button:nth-of-type(2)'
    ).contains('- Last item').click();

    cy.get(
      '.arrayItems .arrayItems select.typeChoices-demo-keypath-not-expected'
    ).should('not.exist');
  });

  it('builds and manipulates a JSON array', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(sel + 'select.formatChoices').select('json');

    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'array'
    );

    cy.get(
      sel + 'div[data-type="array"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel + '.arrayItems ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    // Check removal of last item
    cy.get(
      sel + 'div[data-type="array"] .arrayContents button:nth-of-type(2)'
    ).contains('- Last item').click();
    cy.get(
      sel + '.arrayItems .arrayItems ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).should('not.exist');

    // Add multiple items (to check removal)
    cy.get(
      sel + 'div[data-type="array"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();
    cy.get(
      sel + 'div[data-type="array"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel + '.arrayItems ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).should('exist');

    // Check removal of all items
    cy.get(
      sel + 'div[data-type="array"] .arrayContents button:nth-of-type(3)'
    ).contains('x All').click();
    cy.get(
      sel + '.arrayItems ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).should('not.exist');

    cy.get(
      sel + 'div[data-type="array"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();
    cy.get(
      sel + 'div[data-type="array"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();
    cy.get(
      sel + 'div[data-type="array"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(1) select.typeChoices-demo-keypath-not-expected'
    ).select('null');
    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(2) select.typeChoices-demo-keypath-not-expected'
    ).select('true');
    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(3) select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(2) ' +
      '.arrayItem-arrowHolder-demo-keypath-not-expected > button:nth-of-type(1)'
    ).contains('↑').click();
    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(2) ' +
      '.arrayItem-arrowHolder-demo-keypath-not-expected > button:nth-of-type(2)'
    ).contains('↓').click();

    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(1) select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'true');
    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(2) select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'false');
    cy.get(
      sel + 'div[data-type="array"] ' +
      'fieldset:nth-of-type(3) select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'null');
  });

  it('truncates an array', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');
    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(1) select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(2) select.typeChoices-demo-keypath-not-expected'
    ).select('null');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(3) select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(4) select.typeChoices-demo-keypath-not-expected'
    ).select('undef');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '2');
    cy.get('dialog[open] .submit button').contains('Ok').click();

    cy.get(
      sel + '.arrayItems ' +
      'fieldset:nth-of-type(1) select.typeChoices-demo-keypath-not-expected'
    ).should('exist');
    cy.get(
      sel + '.arrayItems ' +
      'fieldset:nth-of-type(2) select.typeChoices-demo-keypath-not-expected'
    ).should('exist');
    cy.get(
      sel + '.arrayItems ' +
      'fieldset:nth-of-type(3) select.typeChoices-demo-keypath-not-expected'
    ).should('not.exist');
    cy.get(
      sel + '.arrayItems ' +
      'fieldset:nth-of-type(4) select.typeChoices-demo-keypath-not-expected'
    ).should('not.exist');
  });

  it('cancels truncatating an array', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');
    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(1) select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(2) select.typeChoices-demo-keypath-not-expected'
    ).select('null');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(3) select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(4) select.typeChoices-demo-keypath-not-expected'
    ).select('undef');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '2');

    cy.get(
      'dialog[open]:not(.addRecordDialog) .submit button:nth-of-type(2)'
    ).contains('Cancel').click();

    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(1) select.typeChoices-demo-keypath-not-expected'
    ).should('exist');
    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(2) select.typeChoices-demo-keypath-not-expected'
    ).should('exist');
    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(3) select.typeChoices-demo-keypath-not-expected'
    ).should('exist');
    cy.get(
      sel +
      '.arrayItems ' +
      'fieldset:nth-of-type(4) select.typeChoices-demo-keypath-not-expected'
    ).should('exist');
  });

  it('sorts by array index, but only numerical', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.clearAndType(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected',
      'abc'
    );

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    // New item 0 will be sorted as first item, so edit it instead of "abc" item
    cy.clearAndType(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected',
      '2'
    );

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    // Creates item 3 (auto-incrementing) but in position 2
    cy.clearTypeAndBlur(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'input.propertyName-demo-keypath-not-expected',
      '1'
    );

    // Rearranged now
    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '1');
    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '2');
    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(3) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'abc');
  });

  it('swaps mixed alphabetic/numeric indexed array values', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.clearTypeAndBlur(
      sel +
      'input.propertyName-demo-keypath-not-expected',
      'abc'
    );

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    // Inserted above existing, so use 1st again
    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] ' +
      'fieldset:nth-of-type(2) ' +
      '.arrayNonindexKeysItem-arrowHolder-demo-keypath-not-expected > ' +
        'button:nth-of-type(1)'
    ).contains('↑').click();

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'true');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'false');

    cy.get(
      sel +
      'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '0');
    cy.get(
      sel +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'abc');
  });

  it('swaps alphabetically indexed array values', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.clearTypeAndBlur(
      sel +
      'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected',
      'abc'
    );

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    // Inserted above existing, so use 1st again
    cy.clearTypeAndBlur(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected',
      'def'
    );

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] ' +
      'fieldset:nth-of-type(2) ' +
      '.arrayNonindexKeysItem-arrowHolder-demo-keypath-not-expected > ' +
      'button:nth-of-type(1)'
    ).contains('↑').click();

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'true');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'false');

    cy.get(
      sel +
      'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'abc');
    cy.get(
      sel +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'def');
  });

  it('swaps numerically indexed array values', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] ' +
      'fieldset:nth-of-type(2) ' +
      '.arrayNonindexKeysItem-arrowHolder-demo-keypath-not-expected > ' +
        'button:nth-of-type(1)'
    ).contains('↑').click();

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'false');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'true');

    cy.get(
      sel +
      'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '0');
    cy.get(
      sel +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '1');
  });

  it('appends empty item if working on alphabetic array index', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.clearTypeAndBlur(
      sel +
      'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected',
      'abc'
    );

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(
      sel + 'div[data-type="arrayNonindexKeys"] ' +
      '.arrayItems > fieldset > button:nth-of-type(1)'
    ).contains('+').click();

    cy.clearTypeAndBlur(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
        'input.propertyName-demo-keypath-not-expected',
      'def'
    );

    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'true');

    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'false');

    cy.get(
      sel + 'fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'abc');
    cy.get(
      sel + 'fieldset:nth-of-type(2) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'def');
  });

  it('decrements array index when non-numeric properties present', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.clearTypeAndBlur(
      sel +
      'input.propertyName-demo-keypath-not-expected',
      'abc'
    );

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('true');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    // Inserted above existing, so use 1st again
    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('false');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('null');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] ' +
      'fieldset:nth-of-type(1) button:nth-of-type(2)'
    ).contains('x').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).select('undef');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(1) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'null');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(2) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'undef');

    cy.get(
      sel +
      '.arrayItems fieldset:nth-of-type(3) ' +
        'select.typeChoices-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'true');

    cy.get(
      sel +
      'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '1');
    cy.get(
      sel +
      'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '2');
    cy.get(
      sel +
      'fieldset:nth-of-type(3) input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', 'abc');
  });

  it('resorts numeric up to nearest non-numeric', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.clearTypeAndBlur(
      sel + '.arrayItems fieldset:nth-of-type(3) ' +
        'input.propertyName-demo-keypath-not-expected',
      'xyz'
    );
    cy.clearTypeAndBlur(
      sel + '.arrayItems fieldset:nth-of-type(3) ' +
        'input.propertyName-demo-keypath-not-expected',
      'abc'
    );

    cy.clearTypeAndBlur(
      sel + '.arrayItems fieldset:nth-of-type(1) ' +
        'input.propertyName-demo-keypath-not-expected',
      '3'
    );

    cy.get(
      sel + '.arrayItems fieldset:nth-of-type(2) ' +
        'input.propertyName-demo-keypath-not-expected'
    ).invoke('val').should('eq', '3');
  });

  it('Removes all array items', function () {
    const sel = '#formatAndTypeChoices ';

    cy.get(
      sel + 'select.typeChoices-demo-keypath-not-expected'
    ).select('arrayNonindexKeys');

    cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button:nth-of-type(3)'
    ).contains('x All').click();

    cy.get(
      sel +
      'div[data-type="arrayNonindexKeys"] .arrayContents button.addArrayElement'
    ).contains('+ Item').click();

    cy.get(
      sel +
      '.arrayItems fieldset:last-child input'
    ).should(($input) => {
      expect($input.val()).to.equal('0');
    });
  });

  describe('getInput()', function () {
    it('Shows the array root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('arrayNonindexKeys');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="arrayNonindexKeys"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="arrayNonindexKeys"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.not.equal('red');
      });
    });

    it('Shows the object root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('object');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="object"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.equal('red');
      });
    });
  });

  describe('getValue()', function () {
    it('Gets value of non-sparse array', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(sel + 'select.formatChoices').select('indexedDBKey');

      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'array'
      );

      cy.get(
        sel + 'div[data-type="array"] .arrayContents button.addArrayElement'
      ).contains('+ Item').click();

      cy.get(
        sel + '.arrayItems ' +
          'select.typeChoices-demo-keypath-not-expected'
      ).select('string');

      cy.typeAndBlur(
        'textarea[name="demo-keypath-not-expected-string"]',
        'abc'
      );

      cy.get('button#logValue').click();
      cy.get('@consoleLog').should('be.calledWith', ['abc']);
    });
  });

  describe('toValue()', function () {
    it('Converts string to simple array', function () {
      cy.typeAndBlur('#getValueForString', '[]');

      cy.get('@consoleLog').should('be.calledWith', []);
    });

    it('Converts string to array', function () {
      cy.typeAndBlur('#getValueForString', '["abc", [3], 45]');

      cy.get('@consoleLog').should('be.calledWith', ['abc', [3], 45]);
    });

    it('Converts string to nested array', function () {
      cy.typeAndBlur('#getValueForString', '[[]]');

      cy.get('@consoleLog').should('be.calledWith', [[]]);
    });

    it('Converts incomplete string to array', function () {
      cy.typeAndBlur('#getValueForString', '[');

      cy.get('@consoleLog').should('be.calledWith', []);
    });

    it('Converts incomplete string (sparse) to array', function () {
      cy.typeAndBlur('#getValueForString', '[,,');

      // eslint-disable-next-line no-sparse-arrays -- Testing
      cy.get('@consoleLog').should('be.calledWith', [,,]);
    });

    it('Converts string to sparse array', function () {
      cy.typeAndBlur('#getValueForString', '["abc", ,]');

      // eslint-disable-next-line no-sparse-arrays -- Testing
      cy.get('@consoleLog').should('be.calledWith', ['abc', ,]);
    });

    it('Converts string to array (indexedDBKey)', function () {
      cy.get('#useIndexedDBKey').click();
      cy.typeAndBlur('#getValueForString', '["abc", 45]');

      cy.get('@consoleLog').should('be.calledWith', ['abc', 45]);
    });

    it('Converts string to simple object', function () {
      cy.typeAndBlur('#getValueForString', '{}');

      cy.get('@consoleLog').should('be.calledWith', {});
    });

    it('Converts string to object', function () {
      // Note: this uses a special escape for the initial bracket
      cy.typeAndBlur('#getValueForString', '{{}a: 1, b: 2, "c": ""}');

      cy.get('@consoleLog').should('be.calledWith', {a: 1, b: 2, c: ''});
    });

    it('Converts incomplete string to object', function () {
      // Note: this uses a special escape for the initial bracket
      cy.typeAndBlur('#getValueForString', '{{}');

      cy.get('@consoleLog').should('be.calledWith', {});
    });

    it('Converts incomplete string (with property) to object', function () {
      // Note: this uses a special escape for the initial bracket
      cy.typeAndBlur('#getValueForString', '{{}abc:');

      cy.get('@consoleLog').should('be.calledWith', {});
    });

    it('Converts string to nested object', function () {
      // Note: this uses a special escape for the initial bracket
      cy.typeAndBlur('#getValueForString', '{{}a:{{}}}');

      cy.get('@consoleLog').should('be.calledWith', {a: {}});
    });
  });

  describe('View UI', function () {
    it('Generates UI for array', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'arrayNonindexKeys'
      );

      cy.get('button#viewUI').click();
      cy.get(
        '#viewUIResults div[data-type="arrayNonindexKeys"]'
      ).should('exist');
    });

    it('Generates UI for array with children', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'arrayNonindexKeys'
      );

      cy.clearTypeAndBlur(sel + '.arrayContents input[type="number"]', '4');

      cy.get(
        sel +
        'div[data-type="arrayNonindexKeys"] .arrayContents ' +
          'button.addArrayElement'
      ).contains('+ Item').click();

      cy.get(
        sel +
        '.arrayItems ' +
        'fieldset:nth-of-type(1) select.typeChoices-demo-keypath-not-expected'
      ).select('true');

      cy.get(
        sel +
        'div[data-type="arrayNonindexKeys"] ' +
          '.arrayContents button.addArrayElement'
      ).contains('+ Item').click();

      cy.get(
        sel +
        '.arrayItems ' +
        'fieldset:nth-of-type(2) select.typeChoices-demo-keypath-not-expected'
      ).select('null');

      cy.get('button#viewUI').click();
      cy.get(
        '#viewUIResults div[data-type="arrayNonindexKeys"]'
      ).should('exist');

      cy.get(
        '#viewUIResults .arrayItems > fieldset:nth-of-type(1) i[data-type=true]'
      ).should('have.text', 'true');
      cy.get(
        '#viewUIResults .arrayItems > fieldset:nth-of-type(2) i[data-type=null]'
      ).should('have.text', 'null');
      cy.get(
        '#viewUIResults .arrayItems > fieldset:nth-of-type(3) ' +
          'i[data-type=undef]'
      ).should('have.text', 'undefined');
      cy.get(
        '#viewUIResults .arrayItems > fieldset:nth-of-type(4) ' +
          'i[data-type=undef]'
      ).should('have.text', 'undefined');

      // Hide array view contents
      cy.get(
        '#viewUIResults div[data-type=arrayNonindexKeys] > button'
      ).click();

      cy.get(
        '#viewUIResults .arrayItems > fieldset:nth-of-type(4) ' +
          'i[data-type=undef]'
      ).should('be.hidden');

      cy.get(
        '#viewUIResults div[data-type=arrayNonindexKeys] > button'
      ).click();

      cy.get(
        '#viewUIResults .arrayItems > fieldset:nth-of-type(4) ' +
          'i[data-type=undef]'
      ).should('not.be.hidden');
    });

    it('Generates UI for object', function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'object'
      );

      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');
      cy.get(
        sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
      ).select('null');

      cy.get('button#viewUI').click();
      cy.get(
        '#viewUIResults div[data-type="object"]'
      ).should('exist');

      cy.get(
        '#viewUIResults .arrayItems > fieldset:nth-of-type(1) i[data-type=null]'
      ).should('have.text', 'null');
    });
  });

  describe('Objects', function () {
    it('builds and manipulates an object', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('object');

      cy.get(sel + 'button.addArrayElement').click();

      // Add and remove item
      cy.get(
        sel + '.arrayItems > fieldset > button:nth-of-type(1)'
      ).contains('+').click();

      cy.get(
        sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
      ).should('exist');

      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(2) > button:nth-of-type(2)'
      ).contains('x').click();
      cy.get(
        sel +
        '.arrayItems .arrayItems select.typeChoices-demo-keypath-not-expected'
      ).should('not.exist');
    });

    it('collapses an object', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('object');

      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');
      cy.get(
        sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
      ).select('null');

      cy.get(sel + 'div[data-type="object"] > button').contains('-').click();

      cy.get(
        sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
      ).should('be.hidden');

      cy.get(sel + 'div[data-type="object"] > button').contains('+').click();

      cy.get(
        sel + '.arrayItems select.typeChoices-demo-keypath-not-expected'
      ).should('not.be.hidden');
    });

    it('reports duplicate property names', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('object');

      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

      cy.get(sel + 'button.addArrayElement').click();
      cy.typeAndBlur(
        sel +
        'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected',
        'aaa'
      );

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needs time
      cy.wait(1000);

      cy.get(
        sel +
        'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
      ).then(($button) => {
        expect(/** @type {HTMLButtonElement} */ (
          $button[0]
        ).validationMessage).to.eq(
          'Duplicate property name'
        );
      });
    });

    it('reports only duplicate property names', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('object');

      cy.get(sel + 'button.addArrayElement').click();
      cy.get(sel + 'input.propertyName-demo-keypath-not-expected').type('aaa');

      cy.get(sel + 'button.addArrayElement').click();
      cy.typeAndBlur(
        sel +
        'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected',
        'bbb'
      );

      cy.get(sel + 'button.addArrayElement').click();
      cy.typeAndBlur(
        sel +
        'fieldset:nth-of-type(3) input.propertyName-demo-keypath-not-expected',
        'aaa'
      );

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needs time
      cy.wait(1000);

      cy.get(
        sel +
        'fieldset:nth-of-type(1) input.propertyName-demo-keypath-not-expected'
      ).then(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).validity.valid).to.eq(
          false
        );
      });

      cy.get(
        sel +
        'fieldset:nth-of-type(2) input.propertyName-demo-keypath-not-expected'
      ).then(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).validity.valid).to.eq(
          true
        );
      });

      cy.get(
        sel +
        'fieldset:nth-of-type(3) input.propertyName-demo-keypath-not-expected'
      ).then(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).validity.valid).to.eq(
          false
        );
      });
    });

    it('adds empty object with `requireObject`', function () {
      const sel = '#requireObject ';
      cy.get(sel + '[data-type="object"').should('exist');
    });
  });
});

describe('Object spec (schema)', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('Generates UI for empty object', function () {
    cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Object (An object)'
    );

    cy.get('button#viewUI').click();
    cy.get(
      '#viewUIResults div[data-type="object"]'
    ).should('exist');

    cy.get(
      '#viewUIResults div[data-type="object"] > span'
    ).then((elem) => {
      expect(elem.attr('title')).to.equal('An object');
    });
  });

  it('Generates UI for object with required properties', function () {
    cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'Object (With properties)'
    );

    cy.get(sel + '.objectItem').then((elem) => {
      expect(elem.text()).to.equal('Abc');
      expect(elem.attr('title')).to.equal('abc');
    });

    cy.get(sel + '.typeContainer .typeContainer .objectItem').then((elem) => {
      expect(elem.text()).to.equal('A count');
      expect(elem.attr('title')).to.equal('def');
    });

    cy.clearTypeAndBlur(
      sel + 'input[name="demo-keypath-not-expected-number"]',
      '123'
    );

    cy.get('button#viewUI').click();
    cy.get(
      '#viewUIResults div[data-type="object"]'
    ).should('exist');

    cy.get(
      '#viewUIResults span[class^="propertyName-"][title="abc"]'
    ).then((elem) => {
      expect(elem.text()).to.equal('Abc');
      expect(elem.attr('title')).to.equal('abc');
    });

    cy.get(
      '#viewUIResults fieldset > .arrayHolder span[class^="propertyName-"]'
    ).then((elem) => {
      expect(elem.text()).to.equal('A count');
      expect(elem.attr('title')).to.equal('def');
    });

    // Cover adding of property through `+` button.
    cy.get(
      sel + '.arrayItems > fieldset > button:nth-of-type(1)'
    ).contains('+').click();

    cy.clearTypeAndBlur(
      sel + 'fieldset:nth-of-type(2) ' +
        'input[data-prop="true"]',
      'abc'
    );

    cy.get(
      sel + 'fieldset:nth-of-type(2) ' +
        'select'
    ).select('Boolean');
  });

  it(
    'Generates UI for object with required and optional property',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Object (With optional property)'
      );

      cy.get(sel + '.objectItem').then((elem) => {
        expect(elem.text()).to.equal('Required');
        expect(elem.attr('title')).to.equal('requiredProperty');
      });

      cy.clearTypeAndBlur(
        sel + 'input[name="demo-keypath-not-expected-number"]',
        '123'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearTypeAndBlur(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]',
        'okProperty'
      );
      cy.clearTypeAndBlur(
        sel + 'div[data-type="string"] > textarea', 'test456'
      );

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults div[data-type="object"]'
      ).should('exist');

      cy.get(
        '#viewUIResults span[class^="propertyName-"][title="requiredProperty"]'
      ).then((elem) => {
        expect(elem.text()).to.equal('Required');
        expect(elem.attr('title')).to.equal('requiredProperty');
      });

      cy.get(
        '#viewUIResults span[class^="propertyName-"][title="okProperty"]'
      ).then((elem) => {
        expect(elem.text()).to.equal('Ok');
        expect(elem.attr('title')).to.equal('okProperty');
      });

      cy.get('#viewUIResults i[data-type="number"][title="Required"]').should(
        'have.text', '123'
      );
      cy.get(
        '#viewUIResults span[data-type="string"][title="Ok"]'
      ).should(
        'have.text', 'test456'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearTypeAndBlur(
        sel + 'fieldset:nth-of-type(3) ' +
        'input[class^="propertyName-"][list^="optionalProperties_"]',
        'asdf'
      );

      cy.get(
        sel + 'fieldset:nth-of-type(3) ' +
        'select[class^="typeChoices-demo-keypath-not-expected"]'
      ).select(
        'boolean'
      );

      cy.get('button#viewUI').click();
      // With a custom property, will now not be recognizable

      cy.get(
        '#viewUIResults fieldset:nth-of-type(1) span[class^="propertyName-"]'
      ).should(
        'have.text', 'requiredProperty'
      );
      cy.get(
        '#viewUIResults fieldset:nth-of-type(2) span[class^="propertyName-"]'
      ).should(
        'have.text', 'okProperty'
      );
      cy.get(
        '#viewUIResults fieldset:nth-of-type(3) span[class^="propertyName-"]'
      ).should(
        'have.text', 'asdf'
      );

      cy.get(
        '#viewUIResults fieldset:nth-of-type(1) i[data-type="number"]'
      ).should(
        'have.text', '123'
      );
      cy.get(
        '#viewUIResults fieldset:nth-of-type(2) span[data-type="string"]'
      ).should(
        'have.text', 'test456'
      );
      cy.get(
        '#viewUIResults fieldset:nth-of-type(3) i[data-type="true"]'
      ).should(
        'have.text', 'true'
      );
    }
  );

  it(
    'Prevents UI for object with never property',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Object (With never property)'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearTypeAndBlur(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]',
        'okProperty'
      );

      cy.get(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]'
      ).should(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).checkValidity()).to.equal(true);
      });

      cy.clearTypeAndBlur(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]',
        'badProperty'
      );

      cy.get(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]'
      ).should(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).checkValidity()).to.equal(false);
      });
    }
  );

  it(
    'Generates UI for object with unknown keys strict',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Object (With unknown keys strict)'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearTypeAndBlur(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]',
        'okProperty'
      );

      cy.get(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]'
      ).should(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).checkValidity()).to.equal(true);
      });

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearTypeAndBlur(
        sel + 'fieldset:nth-of-type(2) ' +
          'input[class^="propertyName-"][list^="optionalProperties_"]',
        'unknownProperty'
      );

      cy.get(
        sel + 'fieldset:nth-of-type(2) ' +
          'input[class^="propertyName-"][list^="optionalProperties_"]'
      ).should(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).checkValidity()).to.equal(false);
      });

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults fieldset:nth-of-type(1) span[class^="propertyName-"]'
      ).should(
        'have.text', 'OK property'
      );

      cy.get(
        '#viewUIResults fieldset:nth-of-type(2) span[class^="propertyName-"]'
      ).should('not.exist');
    }
  );

  it(
    'Generates UI for object with catchall schema',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Object (With catchall schema)'
      );

      cy.get(sel + '.objectItem').should('have.text', 'requiredProperty');

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearTypeAndBlur(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]',
        'okProperty'
      );

      cy.get(
        sel + 'input[class^="propertyName-"][list^="optionalProperties_"]'
      ).should(($input) => {
        expect(/** @type {HTMLInputElement} */ (
          $input[0]
        ).checkValidity()).to.equal(true);
      });

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearTypeAndBlur(
        sel + 'fieldset:nth-of-type(3) ' +
          'input[class^="propertyName-"][list^="optionalProperties_"]',
        'unknownProperty'
      );

      cy.clearTypeAndBlur(
        sel + 'fieldset:nth-of-type(3) ' +
          'div[data-type="number"] > input',
        '123'
      );

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults fieldset:nth-of-type(1) span[class^="propertyName-"]'
      ).should(
        'have.text', 'requiredProperty'
      );

      cy.get(
        '#viewUIResults fieldset:nth-of-type(2) span[class^="propertyName-"]'
      ).should(
        'have.text', 'okProperty'
      );

      cy.get(
        '#viewUIResults fieldset:nth-of-type(3) span[class^="propertyName-"]'
      ).should(
        'have.text', 'unknownProperty'
      );
    }
  );
});

describe('Array spec (schema)', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it(
    'Generates UI for array with `minLength` and `maxLength`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Array (An array with mins and maxes)'
      );

      cy.get(
        sel + 'fieldset:nth-of-type(1) > legend[data-type="string"]'
      ).should('contain', 'Cat');
      cy.get(
        sel + 'fieldset:nth-of-type(2) > legend[data-type="string"]'
      ).should('contain', 'Cat');
      cy.get(
        sel + 'fieldset:nth-of-type(3) > legend[data-type="string"]'
      ).should('not.exist');

      cy.clearTypeAndBlur(sel + '.arrayLength', '4');
      cy.get(sel + '.arrayLength').should('have.value', '4');

      cy.clearTypeAndBlur(sel + '.arrayLength', '5');
      cy.get(sel + '.arrayLength').should('have.value', '4');

      cy.get('dialog[open]').should(
        'contain',
        'You cannot add beyond the `maxLength` of the array'
      );

      cy.get('dialog[open] .submit > button').click();

      cy.get(sel + 'button.addArrayElement').click();

      cy.get('dialog[open]').should(
        'contain',
        'You cannot add beyond the `maxLength` of the array'
      );

      cy.get('dialog[open] .submit > button').click();

      cy.clearTypeAndBlur(sel + 'fieldset:nth-of-type(1) textarea', 'abc123');

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults .arrayItems ' +
          'fieldset:nth-of-type(1) > legend'
      ).should('contain', 'Cat');

      cy.get(
        '#viewUIResults .arrayItems ' +
          'fieldset:nth-of-type(1) [data-type="string"]'
      ).should('have.text', 'abc123');

      // Set array to delete non-required items
      cy.get(
        sel + 'fieldset:nth-of-type(3) > legend[data-type="string"]'
      ).should('exist');
      cy.clearTypeAndBlur(sel + '.arrayLength', '1');
      cy.get('dialog[open]').should(
        'contain',
        'Your new length will truncate the array causing ' +
          'items to be removed. Continue?'
      );
      cy.get('dialog[open] .submit > button:first').click();
      cy.get(
        sel + 'fieldset:nth-of-type(2) > legend[data-type="string"]'
      ).should('exist');
      cy.get(
        sel + 'fieldset:nth-of-type(3) > legend[data-type="string"]'
      ).should('not.exist');
    }
  );

  it(
    'Generates UI for array with undefined elements',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 9');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Array (An array with undefined elements)'
      );
      // The additional items won't be listed as this is a sparse array
      cy.clearTypeAndBlur(sel + '.arrayLength', '4');
      cy.get(sel + 'button.addArrayElement').click();
    }
  );

  it(
    'Generates UI for array with `never`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Array (With never)'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get('dialog[open]').should(
        'contain',
        'Array has type "never", so one cannot add to it.'
      );
      cy.get('dialog[open] .submit > button').click();

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults .arrayContents > div '
      ).should('contain', 'With never length:');
    }
  );
});

describe('Tuple spec (schema)', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it(
    'Generates UI for tuple with `items` and `rest`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Tuple (A tuple)'
      );

      cy.clearTypeAndBlur(
        'input[name="demo-keypath-not-expected-number"]', '1234'
      );
      cy.clearTypeAndBlur(
        'textarea[name="demo-keypath-not-expected-string"]', 'hello'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults div[data-type="tuple"] > span'
      ).then((elem) => {
        expect(elem.attr('title')).to.equal('A tuple');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] > .arrayContents > div[title]'
      ).then((elem) => {
        expect(elem.text()).to.equal('A tuple length: 3');
        expect(elem.attr('title')).to.equal('(a tuple)');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(1) > legend'
      ).should('contain', 'A number');

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(1) > i'
      ).then((elem) => {
        expect(elem.text()).to.equal('1234');
        expect(elem.attr('title')).to.equal('A number');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(2) > legend'
      ).should('contain', 'A string');

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(2) > span'
      ).then((elem) => {
        expect(elem.text()).to.equal('hello');
        expect(elem.attr('title')).to.equal('A string');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(3) > legend'
      ).should('contain', 'A null');

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(3) > i'
      ).then((elem) => {
        expect(elem.text()).to.equal('null');
        expect(elem.attr('title')).to.equal('A null');
      });
    }
  );

  it(
    'Generates UI for tuple with `items` and never `rest`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 2');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Tuple (With never rest)'
      );

      cy.clearTypeAndBlur(
        'textarea[name="demo-keypath-not-expected-string"]', 'hello'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get('dialog[open]').should(
        'contain',
        'Tuple has rest type "never", so one cannot add to it.'
      );

      cy.get('dialog[open] .submit > button').click();

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults div[data-type="tuple"] > span'
      ).then((elem) => {
        expect(elem.attr('title')).to.equal('With never rest');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] > .arrayContents > div[title]'
      ).then((elem) => {
        expect(elem.text()).to.equal('With never rest length: 1');
        expect(elem.attr('title')).to.equal('(a tuple)');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(1) > legend'
      ).should('contain', 'Item');

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(1) > span'
      ).then((elem) => {
        expect(elem.text()).to.equal('hello');
        expect(elem.attr('title')).to.equal('(a string)');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(2)'
      ).should('not.exist');
    }
  );

  it(
    'Generates UI for tuple with never `items` and no `rest`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 8');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Tuple (With never items and no rest)'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get('dialog[open]').should(
        'contain',
        'Tuple has items type "never", so one cannot add to it.'
      );
    }
  );

  it(
    'Generates UI for tuple with no `items` and never `rest`',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 7');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Tuple (With no items and never rest)'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get('dialog[open]').should(
        'contain',
        'Tuple has rest type "never", so one cannot add to it.'
      );

      cy.get('dialog[open] .submit > button').click();

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults div[data-type="tuple"] > span'
      ).then((elem) => {
        expect(elem.attr('title')).to.equal('With no items and never rest');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] > .arrayContents > div[title]'
      ).then((elem) => {
        expect(elem.text()).to.equal('With no items and never rest length: 0');
        expect(elem.attr('title')).to.equal('(a tuple)');
      });

      cy.get(
        '#viewUIResults div[data-type="tuple"] .arrayItems > ' +
        'fieldset:nth-of-type(1)'
      ).should('not.exist');
    }
  );

  describe('toValue()', function () {
    it('Converts string to simple object', function () {
      // Note: this uses a special escape for the initial bracket
      cy.typeAndBlur('#getValueForString', 'Tuple[3, 4]');

      cy.get('@consoleLog').should('be.calledWith', [3, 4]);
    });
  });

  describe('getInput()', function () {
    it('Shows the record root form control', function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 7');
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('tuple');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="tuple"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="tuple"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });
});


describe('Record spec (schema)', function () {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it(
    'Generates UI for record with numeric keys',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 7');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Record (A record)'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get(sel + '.mapKey').should(($span) => {
        expect($span.text()).to.contain('A record key number');
        expect($span.attr('title')).to.equal('(record key)');
      });

      cy.get(sel + '.mapValue').should(($span) => {
        expect($span.text()).to.contain('A record value string');
        expect($span.attr('title')).to.equal('(record value)');
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

      // A regular object since we can't distinguish numeric keys
      cy.get('#viewUIResults > div[data-type="object"]').should('exist');

      cy.get('#viewUIResults .arrayItems fieldset > legend').should(
        'contain', 'Property'
      );
      cy.get('#viewUIResults .arrayItems fieldset > legend > span').should(
        'contain', '123'
      );

      cy.get(
        '#viewUIResults .arrayItems fieldset > span[data-type="string"]'
      ).should(
        'contain', 'abc'
      );
    }
  );

  it(
    'Generates UI for record with string keys',
    function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 7');
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'Record'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.get(sel + '.mapKey').should(($span) => {
        expect($span.text()).to.contain('A record key string');
        expect($span.attr('title')).to.equal('(record key)');
      });

      cy.get(sel + '.mapValue').should(($span) => {
        expect($span.text()).to.contain('A record value number');
        expect($span.attr('title')).to.equal('(record value)');
      });

      cy.clearAndType(
        sel + 'textarea[name="key-type-choices-only-string"]',
        'abc'
      );

      cy.clearAndType(
        sel + 'input[name="demo-keypath-not-expected-number"]',
        '123'
      );

      cy.get(sel + 'button.addArrayElement').click();

      cy.clearAndType(
        sel + 'fieldset:nth-of-type(2) ' +
          'input[name="demo-keypath-not-expected-number"]',
        '456'
      );

      cy.clearTypeAndBlur(
        sel + 'fieldset:nth-of-type(2) ' +
          'textarea[name="key-type-choices-only-string"]',
        'abc'
      );

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Validates late
      cy.wait(500);

      cy.get(sel + 'fieldset:nth-of-type(2) ' +
        'textarea[name="key-type-choices-only-string"]').then(($textarea) => {
        expect(/** @type {HTMLTextAreaElement} */ (
          $textarea[0]
        ).validationMessage).to.eq(
          'Duplicate Record key value'
        );
      });

      cy.clearTypeAndBlur(
        sel + 'fieldset:nth-of-type(2) ' +
          'textarea[name="key-type-choices-only-string"]',
        'def'
      );

      cy.get(sel + 'fieldset:nth-of-type(2) ' +
        'textarea[name="key-type-choices-only-string"]').then(($textarea) => {
        expect(/** @type {HTMLTextAreaElement} */ (
          $textarea[0]
        ).validationMessage).to.eq(
          ''
        );
      });

      // Test swapping groups (for records)
      cy.get(
        sel + 'fieldset:nth-of-type(2) ' +
          '[class^="recordItem-arrowHolder-"]'
      ).click();

      cy.get('button#viewUI').click();

      cy.get(
        '#viewUIResults .arrayContents'
      ).should(
        'contain', 'Record'
      );

      cy.get(
        '#viewUIResults .arrayItems legend span'
      ).should(($span) => {
        expect($span.text()).to.contain('abc');
        expect($span.attr('title')).to.equal('A record key string');
      });

      cy.get(
        '#viewUIResults .arrayItems i'
      ).should(($span) => {
        expect($span.text()).to.contain('123');
        expect($span.attr('title')).to.equal('(a number)');
      });

      // Cover adding of property through `+` button.
      cy.get(
        sel + '.arrayItems > fieldset > button:nth-of-type(1)'
      ).contains('+').click();

      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(2) > legend .mapKey'
      ).should('contain', 'A record key string');
      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(2) > legend ' +
          '[data-prop="true"]'
      ).should('have.text', '1');

      // Cover removing of property
      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(2) > button:nth-of-type(2)'
      ).contains('x').click();
      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(2) > legend .mapKey'
      ).should('contain', 'A record key string');
      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(2) > legend ' +
          '[data-prop="true"]'
      ).should('have.text', '1');

      cy.get(
        sel + '.arrayItems > fieldset:nth-of-type(3)'
      ).should('not.exist');
    }
  );

  describe('toValue()', function () {
    it('Converts string to simple object', function () {
      // Note: this uses a special escape for the initial bracket
      cy.typeAndBlur('#getValueForString', 'Record{{}a: 3}');

      cy.get('@consoleLog').should('be.calledWith', {a: 3});
    });
  });

  describe('getInput()', function () {
    it('Shows the record root form control', function () {
      cy.get('.formatChoices:first').select('Schema: Zodex schema instance 7');
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('Record (A record)');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="record"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="record"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });
});
