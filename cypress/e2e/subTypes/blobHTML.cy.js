describe('blobHTML spec', () => {
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
      'blobHTML'
    );
    cy.get('textarea[name="demo-keypath-not-expected-blobHTML"]').should(
      'exist'
    );
  });

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blobHTML'
    );

    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Waiting on sceditor
    cy.wait(1000);

    cy.window().then((win) => {
      const textarea = /** @type {HTMLTextAreaElement} */ (
        win.document.querySelector(
          'textarea[name="demo-keypath-not-expected-blobHTML"]'
        )
      );
      const sceinstance = win.sceditor.instance(textarea);
      sceinstance.val('<b>ggg</b>');
    });

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'blobHTML');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blobHTML'
    );
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Waiting on sceditor
    cy.wait(1000);

    cy.window().then((win) => {
      const textarea = /** @type {HTMLTextAreaElement} */ (
        win.document.querySelector(
          'textarea[name="demo-keypath-not-expected-blobHTML"]'
        )
      );
      const sceinstance = win.sceditor.instance(textarea);
      sceinstance.val('<b>ggg</b>');
    });
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  // Not triggered
  // it.skip('throws if retrieving too early', function () {
  //   const sel = '#formatAndTypeChoices ';
  //   cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
  //     'blobHTML'
  //   );

  //   cy.get('button#logValue').click();
  // });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blobHTML'
    );
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Waiting on sceditor
    cy.wait(1000);

    cy.window().then((win) => {
      const textarea = /** @type {HTMLTextAreaElement} */ (
        win.document.querySelector(
          'textarea[name="demo-keypath-not-expected-blobHTML"]'
        )
      );
      const sceinstance = win.sceditor.instance(textarea);
      sceinstance.val('<b>test123</b>');
    });

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should(
      'be.calledWith',
      new Blob(['<b>test123</b>'], {type: 'text/html'})
    );
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blobHTML'
    );
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Waiting on sceditor
    cy.wait(1000);

    cy.window().then((win) => {
      const textarea = /** @type {HTMLTextAreaElement} */ (
        win.document.querySelector(
          'textarea[name="demo-keypath-not-expected-blobHTML"]'
        )
      );
      const sceinstance = win.sceditor.instance(textarea);
      sceinstance.val('<b>test123</b>');
    });

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults button').click();
    cy.get('textarea.view-source').should(
      'contain', '<b>test123</b>'
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', 'data:text/html,<b>test123</b>');
    cy.get('@consoleLog').should(
      'be.calledWith',
      new Blob(['<b>test123</b>'], {type: 'text/html'})
    );
  });

  it('gets value (base64)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString', 'data:text/html;base64,' + btoa('<b>test123</b>')
    );
    cy.get('@consoleLog').should(
      'be.calledWith',
      new Blob(['<b>test123</b>'], {type: 'text/html'})
    );
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Waiting on sceditor
    cy.wait(1500);

    cy.window().then((win) => {
      const textarea = /** @type {HTMLTextAreaElement} */ (
        win.document.querySelector(
          'textarea[name="demo-type-choices-only-initial-value-blobHTML"]'
        )
      );
      const sceinstance = win.sceditor.instance(textarea);
      expect(sceinstance.val()).to.equal('<b>Testing</b>');
    });
  });
});

describe('blobHTML spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 3');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'blobHTML'
    );
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Waiting on sceditor
    cy.wait(1000);

    cy.window().then((win) => {
      const textarea = /** @type {HTMLTextAreaElement} */ (
        win.document.querySelector(
          'textarea[name="demo-keypath-not-expected-blobHTML"]'
        )
      );
      const sceinstance = win.sceditor.instance(textarea);
      sceinstance.val('<b>test123</b>');
    });

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults button').click();
    cy.get('#viewUIResults div[data-type="blobHTML"]').then((elem) => {
      expect(elem.attr('title')).to.equal('HTML');
    });
  });
});
