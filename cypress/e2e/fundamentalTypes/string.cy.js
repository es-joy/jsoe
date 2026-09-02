describe('string spec', () => {
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
      'string'
    );
    cy.get('textarea[name="demo-keypath-not-expected-string"]').should(
      'exist'
    );
  });

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'test123'
    );

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'string');
  });

  it('is valid', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'test123'
    );
    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'test123'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', 'test123');
  });

  it('views UI', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'test123'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should('exist');
    cy.get('#viewUIResults span[data-type="string"]').should(
      'contain', 'test123'
    );
  });

  it('gets value', function () {
    cy.clearTypeAndBlur('#getValueForString', '"test123"');
    cy.get('@consoleLog').should('be.calledWith', 'test123');
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload', function () {
    cy.get(
      'textarea[name="demo-type-choices-only-initial-value-string"]'
    ).should(($textarea) => {
      expect($textarea.val()).to.equal('test123');
    });
  });
});

describe('String spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (A string)'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'hello'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should('exist');
    cy.get('#viewUIResults span[data-type="string"]').should(
      'contain', 'hello'
    );
    cy.get('#viewUIResults span[data-type="string"]').then((elem) => {
      expect(elem.attr('title')).to.equal('A string');
    });
  });
});

describe('String date spec (schemas)', () => {
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
      'String'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-string"]',
      '1999-01-01'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should('exist');
    cy.get('#viewUIResults span[data-type="string"]').should(
      'contain', '1999-01-01'
    );
    cy.get('#viewUIResults span[data-type="string"]').then((elem) => {
      expect(elem.attr('title')).to.equal('(a date string)');
    });
  });
});

describe('String email spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 4');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-string"]',
      'brettz9@yahoo.com'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should('exist');
    cy.get('#viewUIResults span[data-type="string"]').should(
      'contain', 'brettz9@yahoo.com'
    );
    cy.get('#viewUIResults span[data-type="string"]').then((elem) => {
      expect(elem.attr('title')).to.equal('(an email string)');
    });
  });

  it('checks pattern and flags', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 4');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String'
    );
    const input = 'input[name="demo-keypath-not-expected-string"]';
    cy.clearTypeAndBlur(input, 'BRETTZ9@YAHOO.COM').then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });
    cy.clearTypeAndBlur(input, 'other@yahoo.com').then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        String.raw`Value doesn't match email pattern: ^brettz\d@yahoo\.com$ with flags: i`
      );
    });
  });
});

describe('String URL spec (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });

  it('views UI', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 5');

    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String'
    );
    cy.clearTypeAndBlur(
      'input[name="demo-keypath-not-expected-string"]',
      'https://bahai.org'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults span[data-type="string"]').should('exist');
    cy.get('#viewUIResults span[data-type="string"]').should(
      'contain', 'https://bahai.org'
    );
    cy.get('#viewUIResults span[data-type="string"]').then((elem) => {
      expect(elem.attr('title')).to.equal('(a url string)');
    });
  });
});

describe('String spec - Misc. (schemas)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8087/demo/index-schema-instrumented.html', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog');
      }
    });
  });
  it('creates form control (with `defaultValue`)', () => {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 6');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.get('textarea[name="demo-keypath-not-expected-string"]').should(
      'have.value', 'something to default'
    );
  });

  it('sets mins and maxes', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abc'
    ).then((elem) => {
      // todo[cypress@>=17]: See if this is fixed: https://github.com/cypress-io/cypress/issues/1930
      // expect(elem[0].validity.tooShort).to.equal(true);
      expect(elem[0].validity.tooLong).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdefghijklmnop'
    ).then((elem) => {
      expect(elem[0].validity.tooShort).to.equal(false);
      // todo[cypress@>=17]: See if this is fixed: https://github.com/cypress-io/cypress/issues/1930
      // expect(elem[0].validity.tooLong).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdefg'
    ).then((elem) => {
      expect(elem[0].validity.tooShort).to.equal(false);
      expect(elem[0].validity.tooLong).to.equal(false);
    });
  });

  it('sets mins and maxes (length)', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes 2'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abc'
    ).then((elem) => {
      // todo[cypress@>=17]: See if this is fixed: https://github.com/cypress-io/cypress/issues/1930
      // expect(elem[0].validity.tooShort).to.equal(true);
      expect(elem[0].validity.tooLong).to.equal(false);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdefghijklmnop'
    ).then((elem) => {
      expect(elem[0].validity.tooShort).to.equal(false);
      // todo[cypress@>=17]: See if this is fixed: https://github.com/cypress-io/cypress/issues/1930
      // expect(elem[0].validity.tooLong).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdefghij'
    ).then((elem) => {
      expect(elem[0].validity.tooShort).to.equal(false);
      expect(elem[0].validity.tooLong).to.equal(false);
    });
  });

  it('checks startsWith/endsWith and applies transforms', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance mins and maxes 3'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'string'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '   ABC XYZ   '
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abc but not the rest'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        "Value doesn't end with expected: xyz"
      );
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'no beginning but ends with xyz'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        "Value doesn't start with expected: abc"
      );
    });
  });

  it('checks includes and applies transforms', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 1'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdefghijkl'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'GHI'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't include the expected: GHI after position: 5`
      );
    });
  });

  it('checks includes and regex', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 2'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'axcGHI'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'axc'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't include the expected: GHI`
      );
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'GHI'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't match regular expression: a[a-z]c`
      );
    });
  });

  it('checks regex and flags', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 3'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'aXc'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'a3c'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't match regular expression: a[a-z]c with flags: i`
      );
    });
  });

  it('checks time and precision', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 4'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '01:05:17.789'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '01:05:17'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match time/precision.`
      );
    });
  });

  it('checks time', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 5'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '01:05:17.789'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '01:05:17'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcd'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match time/precision.`
      );
    });
  });

  it('checks datetime', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 6'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '1999-01-01T01:05:17.789Z'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '1999-01-01T01:05:17.789+05:00'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcd'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match datetime/precision/offset/local`
      );
    });
  });

  it('checks ip v4', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 7'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '127.0.0.1'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abc:def:ghi'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't match IP v4 pattern.`
      );
    });
  });

  it('checks ip v6', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 8'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '2001:db8:3333:4444:5555:6666:7777:8888'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdefghi'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't match IP v6 pattern.`
      );
    });
  });

  it('checks ip v4 cidr', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 10'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      // eslint-disable-next-line sonarjs/no-hardcoded-ip -- Safe
      '192.168.1.0/24'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '2001:db8::/64'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't match IP v4 cidr pattern.`
      );
    });
  });

  it('checks ip v6 cidr', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 11'
    );
    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '2001:db8::/64'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      // eslint-disable-next-line sonarjs/no-hardcoded-ip -- Safe
      '192.168.1.0/24'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't match IP v6 cidr pattern.`
      );
    });
  });

  it('checks emoji', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (Emoji)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '😊'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'a'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match emoji pattern`
      );
    });
  });

  it('checks credit cards', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (Credit card)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '1234-5678-1234-5678'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '15'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value doesn't match credit card pattern.`
      );
    });
  });

  it('checks uuid', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (UUID)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'e2a32899-c131-4348-91e8-45cc47783718'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdef'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match uuid pattern`
      );
    });
  });

  it('checks a versioned uuid', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (UUID v4)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'e2a32899-c131-4348-91e8-45cc47783718'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'e2a32899-c131-7348-91e8-45cc47783718'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match uuid pattern`
      );
    });
  });

  it('checks jwt with an optional algorithm', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const typeChoices =
      '#formatAndTypeChoices select.typeChoices-demo-keypath-not-expected';
    const input = 'textarea[name="demo-keypath-not-expected-string"]';
    const hs256JWT =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature';
    const rs256JWT =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature';

    cy.get(typeChoices).select('String (JWT)');
    cy.clearTypeAndBlur(input, rs256JWT).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.get(typeChoices).select('String (JWT HS256)');
    cy.clearTypeAndBlur(input, hs256JWT).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });
    cy.clearTypeAndBlur(input, rs256JWT).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match jwt pattern`
      );
    });
  });

  it('checks e164, xid, guid, and ksuid', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const typeChoices =
      '#formatAndTypeChoices select.typeChoices-demo-keypath-not-expected';
    const input = 'textarea[name="demo-keypath-not-expected-string"]';
    const cases = [
      ['E.164', 'e164', '+14155552671'],
      ['XID', 'xid', '9m4e2mr0ui3e8a215n4g'],
      ['GUID', 'guid', 'ffffffff-ffff-ffff-ffff-ffffffffffff'],
      ['KSUID', 'ksuid', '0ujtsYcgvSTl8PAuAdqWYSMnLOv']
    ];

    cases.forEach(([description, kind, validValue]) => {
      cy.get(typeChoices).select(`String (${description})`);
      cy.clearTypeAndBlur(input, validValue).then((elem) => {
        expect(elem[0].checkValidity()).to.equal(true);
      });
      cy.clearTypeAndBlur(input, 'invalid').then((elem) => {
        expect(elem[0].validationMessage).to.equal(
          `Value does not match ${kind} pattern`
        );
      });
    });
  });

  it('checks nanoid', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (Nanoid)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'V1StGXR8_Z5jdHi6B-myT'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdef'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match nanoid pattern`
      );
    });
  });

  it('checks nanoid with length', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (Nanoid with length)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '9ZmikYex506KQYM'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdef'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Nanoid value is not of the expected length: 15`
      );
    });
  });

  it('checks cuid', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (CUID)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'cjld2cjxh0000qzrmn831i7rn'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdef'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match cuid pattern`
      );
    });
  });

  it('checks cuid2', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (CUID2)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'tz4a98xxat96iws9zmbrgj3a'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '---'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match cuid2 pattern`
      );
    });
  });

  it('checks ulid', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (ULID)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      '01ARZ3NDEKTSV4RRFFQ69G5FAV'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdef'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match ulid pattern`
      );
    });
  });

  it('checks duration', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (Duration)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'P3Y6M4DT12H30M5S'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdef'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match duration pattern`
      );
    });
  });

  it('checks base64', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (Base64)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'aGVsbG8='
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'abcdef'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match base64 pattern`
      );
    });
  });

  it('checks base64url', () => {
    cy.get('.formatChoices:first').select(
      'Schema: Zodexy schema instance strings 9'
    );
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'String (Base64 URL)'
    );

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'OTcsOTgsOTksMTAwLDEwMSwxMDI'
    ).then((elem) => {
      expect(elem[0].checkValidity()).to.equal(true);
    });

    cy.clearTypeAndBlur(
      'textarea[name="demo-keypath-not-expected-string"]',
      'ábc'
    ).then((elem) => {
      expect(elem[0].validationMessage).to.equal(
        `Value does not match base64url pattern`
      );
    });
  });
});
