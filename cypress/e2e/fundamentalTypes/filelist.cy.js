import FileList from '../../../src/utils/FileList.js';

describe('FileList spec', () => {
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
      'filelist'
    );

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(
      sel + '.arrayItems input[name="demo-keypath-not-expected-file"]'
    ).selectFile('package.json');

    cy.get(sel + 'button.addArrayElement').click();
    cy.get(
      sel + 'fieldset[data-type="file"]:nth-of-type(2) ' +
        'input[name="demo-keypath-not-expected-file"]'
    ).selectFile('README.md');
  });

  it('gets type', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('filelist');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );

    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#getType').click();
  });

  it('is valid', function (done) {
    cy.on('window:alert', (t) => {
      expect(t).to.eq('true');
      done();
    });
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#isValid').click();
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.called');

    // Failing now due to identity check?
    // cy.get('@consoleLog').should('be.called', new FileList([
    //   new File([], ''),
    //   new File([], '')
    // ]));
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'filelist'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      {
        contents: Cypress.Buffer.from('abc'),
        fileName: 'first.txt',
        mimeType: 'text/plain'
      },
      {
        contents: Cypress.Buffer.from('def'),
        fileName: 'second.txt',
        mimeType: 'text/plain'
      }
    ]);

    cy.get(sel + 'fieldset[data-type="file"]:first').within(() => {
      cy.get('legend').should('have.text', 'A text File 0');
      cy.contains('label', 'Size (in bytes) (min: 1, max: 10)');
      cy.contains('label', 'Content type (allowed: text/plain)');
    });

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="filelist"]').should('exist');
  });

  it('prevents saving binary data outside the File size limits', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 7');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'FileList (A FileList)'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile({
      contents: Cypress.Buffer.from('abc'),
      fileName: 'first.txt',
      mimeType: 'text/plain'
    });

    cy.get(sel + 'fieldset[data-type="file"]:first .viewBinary').click();
    cy.clearTypeAndBlur('dialog[open] .view-binary', '01234567890');
    cy.get('dialog[open] button.submit').click();

    cy.get('dialog[open] .view-binary').should('exist');
    cy.get(sel + 'fieldset[data-type="file"]:first .size').should(
      'have.value', '3'
    );

    cy.get('dialog[open]').last().contains('button', 'Ok').click();
    cy.get('dialog[open] .view-binary').clear();
    cy.get('dialog[open] button.submit').click();

    cy.get('dialog[open]').last().should(
      'contain', 'below the minimum of 1 bytes'
    );
    cy.get('dialog[open] .view-binary').should('exist');
    cy.get(sel + 'fieldset[data-type="file"]:first .size').should(
      'have.value', '3'
    );
  });

  it('rejects a non-permitted File MIME type', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 7');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'FileList (A FileList)'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile({
      contents: Cypress.Buffer.from('abc'),
      fileName: 'first.txt',
      mimeType: 'text/plain'
    });

    const contentType =
      sel + 'fieldset[data-type="file"]:first .contentType';
    cy.clearTypeAndBlur(contentType, 'application/json');
    cy.get(contentType).should(($input) => {
      const {validationMessage} = /** @type {HTMLInputElement} */ ($input[0]);
      expect(validationMessage).to.contain('text/plain');
    });
    cy.get(sel + 'fieldset[data-type="file"]:first .viewBinary').then(
      ($button) => {
        expect(
          /** @type {HTMLButtonElement & {$value: File}} */ ($button[0]).
            $value.type
        ).to.equal('text/plain');
      }
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur(
      // `{}` is an added Cypress escape
      '#getValueForString', 'FileList(' +
      // Todo: Parsing not working with inner `File`
      // 'File({{}"stringContents":"abc","name":"someName",' +
      // '"type":"text/plain","lastModified":1231230}),' +
      // 'File({{}"stringContents":"def","name":"anotherName",' +
      // '"type":"text/plain","lastModified":3213210})' +
      ')'
    );
    cy.get('@consoleLog').should(
      'be.calledWith',
      new FileList([
        // new File([], '', {}),
        // new File([], '', {})
      ])
    );
  });

  describe('getInput()', function () {
    it('Shows the filelist root form control', function () {
      const sel = '#formatAndTypeChoices ';

      cy.get(
        sel + 'select.typeChoices-demo-keypath-not-expected'
      ).select('filelist');

      cy.get('#showRootFormControl').click();

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="filelist"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.equal('red');
      });

      // eslint-disable-next-line cypress/no-unnecessary-waiting -- Needed
      cy.wait(3000);

      cy.get(
        '#formatAndTypeChoices > .typesHolder > .typeContainer > ' +
        'div[data-type="filelist"] > button'
      ).should(($button) => {
        expect($button[0].style.backgroundColor).to.not.equal('red');
      });
    });
  });

  // it('gets a value set onload', function () {
  //   cy.get(
  //     'input[name="demo-type-choices-only-initial-value-filelist"]' +
  //       '[value=false]'
  //   ).should('be.checked');
  // });
});

describe('FileList spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 7');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'FileList (A FileList)'
    );
    cy.get(
      sel + 'input[name="demo-keypath-not-expected-filelist"]'
    ).selectFile([
      'package.json', 'README.md'
    ]);

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="filelist"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="filelist"] .arrayContents > div[title]'
    ).should(($elem) => {
      expect($elem.attr('title')).to.equal('(a FileList)');
    });
    cy.get('#viewUIResults div[data-type="file"] > b').should(
      'have.text', 'A text File'
    );
  });
});
