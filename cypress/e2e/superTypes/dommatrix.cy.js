/**
 * @param {string} sel
 * @returns {void}
 */
function input3dMatrix (sel) {
  [
    'm11', 'm12', 'm13', 'm14',
    'm21', 'm22', 'm23', 'm24',
    'm31', 'm32', 'm33', 'm34',
    'm41', 'm42', 'm43', 'm44'
  ].forEach((prop, i) => {
    cy.clearTypeAndBlur(
      `${sel}input[name="demo-keypath-not-expected-dommatrix-${prop}"]`,
      String(i % 4)
    );
  });
}

/**
 * @param {string} sel
 * @returns {void}
 */
function input2dMatrix (sel) {
  cy.clearTypeAndBlur(
    sel +
    'input[name="demo-keypath-not-expected-dommatrix-a"]',
    '1'
  );
  cy.clearTypeAndBlur(
    sel +
    'input[name="demo-keypath-not-expected-dommatrix-b"]',
    '2'
  );
  cy.clearTypeAndBlur(
    sel +
    'input[name="demo-keypath-not-expected-dommatrix-c"]',
    '3'
  );
  cy.clearTypeAndBlur(
    sel +
    'input[name="demo-keypath-not-expected-dommatrix-d"]',
    '4'
  );
  cy.clearTypeAndBlur(
    sel +
    'input[name="demo-keypath-not-expected-dommatrix-e"]',
    '5'
  );
  cy.clearTypeAndBlur(
    sel +
    'input[name="demo-keypath-not-expected-dommatrix-f"]',
    '6'
  );
}
describe('DOMMatrix spec', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control', () => {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get('input[name="demo-keypath-not-expected-dommatrix-a"]').should(
      'exist'
    );
  });

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'dommatrix');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMMatrix([1, 2, 3, 4, 5, 6])
    );
  });

  it('logs value (readonly)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get('[name="demo-keypath-not-expected-dommatrix-readonly-4"]').check(
      'readonly'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMMatrixReadOnly([1, 2, 3, 4, 5, 6])
    );
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', 'DOMMatrix'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '1'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '2'
    );
  });

  it('views UI (readonly)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get('[name="demo-keypath-not-expected-dommatrix-readonly-4"]').check(
      'readonly'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', 'DOMMatrixReadOnly'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '1'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '2'
    );
  });

  it('views UI (3d)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get(sel + '.d3').click();
    input3dMatrix(sel);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', 'DOMMatrix'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '1'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '2'
    );
  });

  it('views UI (3d) (readonly)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get('[name="demo-keypath-not-expected-dommatrix-readonly-4"]').check(
      'readonly'
    );
    cy.get(sel + '.d3').click();
    input3dMatrix(sel);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', 'DOMMatrixReadOnly'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '1'
    );
    cy.get('#viewUIResults div[data-type="dommatrix"]').should(
      'contain', '2'
    );
  });

  describe('getInput()', function () {
    it('Shows the DOMMatrix root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('dommatrix');
      cy.get(sel + '.d2').click();
      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="dommatrix"] input'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="dommatrix"] input'
      ).should(($input) => {
        expect($input[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });

  it('gets value', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'DOMMatrix({{}"a":1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMMatrix([1, 2, 3, 4, 5, 6])
    );
  });

  it('gets value (readonly)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'DOMMatrixReadOnly({{}"a":1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMMatrixReadOnly([1, 2, 3, 4, 5, 6])
    );
  });

  it('gets value (3d)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'DOMMatrix({{}"m11":1, "m12": 2, "m13": 3, "m14": 4, ' +
      '"m21": 1, "m22": 2, "m23": 3, "m24": 4, ' +
      '"m31": 1, "m32": 2, "m33": 3, "m34": 4, ' +
      '"m41": 1, "m42": 2, "m43": 3, "m44": 4' +
      '})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMMatrix([1, 2, 3, 4, 5, 6])
    );
  });

  it('gets value (3d) (readonly)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'DOMMatrixReadOnly({{}"m11":1, "m12": 2, "m13": 3, "m14": 4, ' +
      '"m21": 1, "m22": 2, "m23": 3, "m24": 4, ' +
      '"m31": 1, "m32": 2, "m33": 3, "m34": 4, ' +
      '"m41": 1, "m42": 2, "m43": 3, "m44": 4' +
      '})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new DOMMatrixReadOnly([1, 2, 3, 4, 5, 6])
    );
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'input[name="demo-type-choices-only-initial-value-dommatrix-a"]'
    ).should(($input) => {
      expect($input.val()).to.equal('1');
    });
  });
});

describe('DOMMatrix spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="dommatrix"] .emphasis').then(
      (elem) => {
        expect(elem.attr('title')).to.equal('(a `DOMMatrix`)');
      }
    );
  });

  it('views UI (readonly)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'dommatrix'
    );
    cy.get('[name="demo-keypath-not-expected-dommatrix-readonly-1"]').check(
      'readonly'
    );
    cy.get(sel + '.d2').click();
    input2dMatrix(sel);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="dommatrix"] .emphasis').then(
      (elem) => {
        expect(elem.attr('title')).to.equal('(a `DOMMatrixReadOnly`)');
      }
    );
  });
});
