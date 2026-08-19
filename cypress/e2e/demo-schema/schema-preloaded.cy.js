[
  '',
  'Arrays'
].forEach((item) => {
  describe(`Schema-preloaded ${item ? item + ' ' : ''}spec`, () => {
    const arraySels = item
      ? '> .typeContainer > [data-type="arrayNonindexKeys"] > ' +
        '.arrayContents > .arrayItems > fieldset > .typeContainer '
      : '';

    beforeEach(() => {
      cy.visit(`http://127.0.0.1:8087/demo/schema-preloaded${
        item ? '-array' : ''
      }-instrumented.html`, {
        onBeforeLoad (win) {
          cy.stub(win.console, 'log').as('consoleLog');
        }
      });
      const readySel = item
        ? 'form > .typeContainer:nth-of-type(2) > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > ' +
          '.arrayItems > fieldset > .typeContainer:nth-of-type(1) ' +
          '.typeContainer input'
        : 'form > .typeContainer:nth-of-type(2) .typeContainer input';
      cy.get(readySel).should('have.value', '3');
    });
    describe('Group 1', function () {
      it('Selects false', function () {
        const sel = 'section:nth-of-type(1) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(
          sel + 'input[name="demo-type-choices-only-initial-value-boolean1"]'
        ).should('be.checked');
      });

      it('Selects number', function () {
        const sel = 'section:nth-of-type(1) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(
          sel + 'input[name="demo-type-choices-only-initial-value-number"]'
        ).should('have.value', '123');
      });

      it('Selects NaN', function () {
        const sel = 'section:nth-of-type(1) > .innerItem:nth-of-type(3) ' +
          arraySels;
        cy.get(
          sel + 'div[data-type="nan"]'
        ).should('exist');
      });

      it('Selects BigInt', function () {
        const sel = 'section:nth-of-type(1) > .innerItem:nth-of-type(4) ' +
          arraySels;
        cy.get(
          sel + 'input'
        ).should('have.value', '456');
      });

      it('Selects string', function () {
        const sel = 'section:nth-of-type(1) > .innerItem:nth-of-type(5) ' +
          arraySels;
        cy.get(
          sel + 'textarea'
        ).should('have.value', 'a string');
      });
    });

    describe('Group 2', function () {
      it('Selects void', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(
          sel + '[data-type="undef"]'
        ).should('exist');
      });

      it('Selects enum', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(
          sel + '[data-type="string"] ' +
            'select[name="demo-type-choices-only-initial-value-string"] ' +
            'option:selected'
        ).should('have.text', 'ghi');
      });

      it('Selects literal boolean', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(3) ' +
          arraySels;
        cy.get(
          sel + '[data-type="boolean"] input:checked'
        ).should('have.value', 'false');
      });

      it('Selects literal number', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(4) ' +
          arraySels;
        cy.get(
          sel + '[data-type="number"] select'
        ).should('have.value', '135');
      });

      it('Selects literal string', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(5) ' +
          arraySels;
        cy.get(
          sel + '[data-type="string"] select'
        ).should('have.value', 'abcde');
      });

      it('Selects literal BigInt', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(6) ' +
          arraySels;
        cy.get(
          sel + '[data-type="bigint"] select'
        ).should('have.value', '123');
      });

      it('Selects literal null', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(7) ' +
          arraySels;
        cy.get(sel + '[data-type="null"]').should('exist');
      });

      it('Selects literal undefined', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(8) ' +
          arraySels;
        cy.get(sel + '[data-type="undef"]').should('exist');
      });

      it('Selects template literal', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(36) ' +
          arraySels;
        cy.get(
          sel + '[data-type="string"] textarea'
        ).should('have.value', 'item-42');
      });

      it('Selects empty object', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(9) ' +
          arraySels;
        cy.get(
          sel + '[data-type="object"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('An object');
        });
      });

      it('Selects object with property', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(10) ' +
          arraySels;
        cy.get(
          sel + '[data-type="object"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With properties');
        });

        cy.get(sel + 'b.objectItem[title="abc"]').should('have.text', 'Abc');

        cy.get(
          sel + 'b.objectItem[title="def"]'
        ).should('have.text', 'A count');

        cy.get(sel + 'input[type=number]').should('have.value', '595');
      });

      it('Selects object with optional property', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(11) ' +
          arraySels;
        cy.get(
          sel + '[data-type="object"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With optional property');
        });

        cy.get(
          sel + 'b.objectItem[title="requiredProperty"]'
        ).should('have.text', 'Required');

        cy.get(
          sel + 'fieldset:nth-of-type(2) input[data-prop="true"]'
        ).should('have.value', 'okProperty');
        cy.get(
          sel + 'fieldset:nth-of-type(2) legend b'
        ).should('have.text', 'Ok');

        cy.get(
          sel + 'div[data-type="string"][title="Ok"] textarea'
        ).should('have.value', 'okPropValue');

        cy.get(sel + 'input[type=number]').should('have.value', '500');
      });

      // We add this test to ensure coverage of changing an optional
      //   property (set after load)
      it('Allows modification of optional property', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(11) ' +
          arraySels;

        cy.clearTypeAndBlur(
          sel + 'fieldset:nth-of-type(2) input[data-prop="true"]',
          'non-ok property'
        );

        cy.get(
          sel + 'fieldset:nth-of-type(2) select'
        ).should('not.be.hidden');
      });

      it('Selects object with never property', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(12) ' +
          arraySels;
        cy.get(
          sel + '[data-type="object"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With never property');
        });

        cy.get(
          sel + 'fieldset'
        ).should('not.exist');
      });

      it('Selects object with never catchall', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(13) ' +
          arraySels;
        cy.get(
          sel + '[data-type="object"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With never catchall');
        });

        cy.get(
          sel + 'fieldset:nth-of-type(1) input[data-prop="true"]'
        ).should('have.value', 'okProperty');
        cy.get(
          sel + 'fieldset:nth-of-type(1) legend b'
        ).should('have.text', 'OK property');

        cy.get(
          sel + 'div[data-type="string"][title="OK property"] textarea'
        ).should('have.value', 'okPropVal');
      });

      it('Selects object with catchall schema', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(14) ' +
          arraySels;
        cy.get(
          sel + '[data-type="object"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With catchall schema');
        });

        cy.get(
          sel + 'fieldset:nth-of-type(1) input[value="true"]'
        ).should('be.checked');
        cy.get(
          sel + 'fieldset:nth-of-type(1) legend b'
        ).should('have.text', 'requiredProperty');

        cy.get(
          sel + 'fieldset:nth-of-type(2) input[data-prop="true"]'
        ).should('have.value', 'okProperty');
        cy.get(
          sel + 'fieldset:nth-of-type(2) legend b'
        ).should('have.text', 'okProperty');

        cy.get(
          sel + 'fieldset:nth-of-type(3) input[data-prop="true"]'
        ).should('have.value', 'another');
        cy.get(
          sel + 'fieldset:nth-of-type(3) legend b'
        ).should('have.text', 'Catchall number');

        cy.get(
          sel + 'fieldset:nth-of-type(3) div[data-type="number"] input'
        ).should('have.value', '1400');
      });

      it('Selects array (with mins and maxes)', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(15) ' +
          arraySels;
        cy.get(
          sel + '[data-type="arrayNonindexKeys"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('An array with mins and maxes');
        });

        cy.get(
          sel + 'fieldset:nth-of-type(1) input[data-prop="true"]'
        ).should('have.value', '0');
        cy.get(
          sel + 'fieldset:nth-of-type(1) legend'
        ).should('contain', 'Cat');
        cy.get(
          sel + 'fieldset:nth-of-type(1) textarea'
        ).should('have.value', 'abc');

        cy.get(
          sel + 'fieldset:nth-of-type(2) input[data-prop="true"]'
        ).should('have.value', '1');
        cy.get(
          sel + 'fieldset:nth-of-type(2) legend'
        ).should('contain', 'Cat');
        cy.get(
          sel + 'fieldset:nth-of-type(2) textarea'
        ).should('have.value', 'def');

        cy.get(
          sel + 'fieldset:nth-of-type(3) input[data-prop="true"]'
        ).should('have.value', '2');
        cy.get(
          sel + 'fieldset:nth-of-type(3) legend'
        ).should('contain', 'Cat');
        cy.get(
          sel + 'fieldset:nth-of-type(3) textarea'
        ).should('have.value', 'ghi');
      });

      it('Selects array (with never)', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(16) ' +
          arraySels;
        cy.get(
          sel + '[data-type="arrayNonindexKeys"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With never');
        });

        cy.get(
          sel + 'fieldset'
        ).should('not.exist');
      });

      it('Selects a set with mins and maxes', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(17) ' +
          arraySels;
        cy.get(
          sel + '[data-type="set"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('A set with mins and maxes');
        });

        cy.get(
          sel + 'fieldset:nth-of-type(1) legend'
        ).should('contain', 'A Set item 1');
        cy.get(
          sel + 'fieldset:nth-of-type(1) textarea'
        ).should('have.value', 'abc');

        cy.get(
          sel + 'fieldset:nth-of-type(2) legend'
        ).should('contain', 'A Set item 2');
        cy.get(
          sel + 'fieldset:nth-of-type(2) textarea'
        ).should('have.value', 'def');

        cy.get(
          sel + 'fieldset:nth-of-type(3) legend'
        ).should('contain', 'A Set item 3');

        cy.get(
          sel + 'fieldset:nth-of-type(3) textarea'
        ).should('have.value', 'ghi');
      });

      it('Selects Set (with never)', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(18) ' +
          arraySels;
        cy.get(
          sel + '[data-type="set"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With never');
        });

        cy.get(
          sel + 'fieldset'
        ).should('not.exist');
      });

      it('Selects a tuple', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(19) ' +
          arraySels;
        cy.get(
          sel + '[data-type="tuple"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('A tuple');
        });

        cy.get(
          sel + 'fieldset:nth-of-type(1) legend'
        ).should('contain', 'A number 0');
        cy.get(
          sel + 'fieldset:nth-of-type(1) input'
        ).should('have.value', '123');

        cy.get(
          sel + 'fieldset:nth-of-type(2) legend'
        ).should('contain', 'A string 1');
        cy.get(
          sel + 'fieldset:nth-of-type(2) textarea'
        ).should('have.value', 'abc');

        cy.get(
          sel + 'fieldset:nth-of-type(3) legend'
        ).should('contain', 'A null 2');

        cy.get(
          sel + 'fieldset:nth-of-type(4) legend'
        ).should('contain', 'A null 3');
      });

      it('Selects a tuple with never rest', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(20) ' +
          arraySels;
        cy.get(
          sel + '[data-type="tuple"] span'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('With never rest');
        });

        cy.get(
          sel + 'fieldset:nth-of-type(1) legend'
        ).should('have.text', 'Item 0');
        cy.get(
          sel + 'fieldset:nth-of-type(1) textarea'
        ).should('have.value', 'abc');

        cy.get(
          sel + 'fieldset:nth-of-type(2)'
        ).should('not.exist');
      });

      it('Selects a RegExp', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(21) ' +
          arraySels;
        cy.get(
          sel + 'div[data-type="regexp"]'
        ).should(($div) => {
          expect($div.attr('title')).to.equal('A RegExp');
        });

        cy.get(
          sel + '[data-type="regexp"] input'
        ).should('have.value', 'abc');

        cy.get(
          sel + '[data-type="regexp"] select option:selected'
        ).should('have.value', 'u');
      });

      it('Selects a Blob', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(22) ' +
          arraySels;
        cy.get(sel + 'input.size').should('have.value', '3');
        cy.get(sel + 'input.contentType').should('have.value', 'text/plain');
      });

      it('Selects a Boolean Object', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(23) ' +
          arraySels;
        cy.get(sel + 'div[data-type="BooleanObject"]').should(($div) => {
          expect($div.attr('title')).to.equal('A Boolean object');
        });
        cy.get(sel + 'input[value="true"]').should('be.checked');
      });

      it('Selects a Number Object', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(24) ' +
          arraySels;
        cy.get(sel + 'div[data-type="NumberObject"]').should(($div) => {
          expect($div.attr('title')).to.equal('A Number object');
        });
        cy.get(sel + 'input').should('have.value', '100');
      });

      it('Selects a String Object', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(25) ' +
          arraySels;
        cy.get(sel + 'div[data-type="StringObject"]').should(($div) => {
          expect($div.attr('title')).to.equal('A String object');
        });
        cy.get(sel + 'textarea').should('have.value', 'abc');
      });

      it('Selects -0', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(26) ' +
          arraySels;

        cy.get(sel + 'label select option:selected').should('have.value', '-0');
      });

      it('Selects a DOMException', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(27) ' +
          arraySels;
        cy.get(sel + 'div[data-type="domexception"]').should(($div) => {
          expect($div.attr('title')).to.equal('A DOMException');
        });
        cy.get(sel + 'input.name').should('have.value', 'someName');
        cy.get(sel + 'input.message').should('have.value', 'some message');
      });

      it('Selects an Error', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(28) ' +
          arraySels;
        cy.get(sel + 'div[data-type="error"]').should(($div) => {
          expect($div.attr('title')).to.equal('An Error');
        });
        cy.get(
          sel + 'input:not([type=checkbox]).message'
        ).should('have.value', 'a msg');
      });

      it('Selects a File', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(29) ' +
          arraySels;
        cy.get(sel + 'div[data-type="file"]').should(($div) => {
          expect($div.attr('title')).to.equal('A File');
        });
        cy.get(
          sel + 'input.fileName'
        ).should('have.value', 'someName');

        cy.get(
          sel + 'input.contentType'
        ).should('have.value', 'text/plain');
      });

      it('Selects a BufferSource', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(30) ' +
          arraySels;
        cy.get(sel + 'div[data-type="buffersource"]').should(($div) => {
          expect($div.attr('title')).to.equal('A BufferSource');
        });
        cy.get(sel + 'input.byteLength').should('have.value', '8');
      });

      it('Selects a DOMMatrix', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(31) ' +
          arraySels;
        cy.get(sel + 'input.a').should('have.value', '1');
        cy.get(sel + 'input.b').should('have.value', '2');
        cy.get(sel + 'input.c').should('have.value', '3');
        cy.get(sel + 'input.d').should('have.value', '4');
        cy.get(sel + 'input.e').should('have.value', '5');
        cy.get(sel + 'input.f').should('have.value', '6');
      });

      it('Selects a DOMPoint', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(32) ' +
          arraySels;
        cy.get(sel + 'input.x').should('have.value', '1');
        cy.get(sel + 'input.y').should('have.value', '2');
        cy.get(sel + 'input.z').should('have.value', '3');
        cy.get(sel + 'input.w').should('have.value', '4');
      });

      it('Selects a DOMRect', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(33) ' +
          arraySels;
        cy.get(sel + 'input.x').should('have.value', '1');
        cy.get(sel + 'input.y').should('have.value', '2');
        cy.get(sel + 'input.width').should('have.value', '3');
        cy.get(sel + 'input.height').should('have.value', '4');
      });
      it('Selects a TypeError', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(34) ' +
          arraySels;
        cy.get(
          sel + 'select.errorType option:selected'
        ).should('have.value', 'TypeError');
        cy.get(
          sel + 'input:not([type="checkbox"]).message'
        ).should('have.value', 'msg');
      });

      it('Selects a BigInt object', function () {
        const sel = 'section:nth-of-type(2) > .innerItem:nth-of-type(35) ' +
          arraySels;
        cy.get(sel + 'div[data-type="bigintObject"]').should(($div) => {
          expect($div.attr('title')).to.equal('A BigInt object');
        });
        cy.get(sel + 'input').should('have.value', '123');
      });
    });

    describe('Group 3', function () {
      it('Selects a Date', function () {
        const sel = 'section:nth-of-type(3) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="date"]').should(($div) => {
          expect($div.attr('title')).to.equal('A date');
        });
        cy.get(sel + 'input').should('have.value', '1999-01-01T00:00');
      });

      it('Selects a string date', function () {
        const sel = 'section:nth-of-type(3) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal('String');
        });
        cy.get(sel + 'input').should('have.value', '1999-01-01');
      });

      it('Selects a blob HTML', function () {
        const sel = 'section:nth-of-type(3) > .innerItem:nth-of-type(3) ' +
          arraySels;

        cy.get(sel + 'textarea[name$="-blobHTML"]').should(($textarea) => {
          const textarea =
            /**
             * @type {HTMLTextAreaElement & {
             *   sceditorInstance: {val: () => string}
             * }}
             */ ($textarea[0]);
          expect(textarea.sceditorInstance.val()).to.equal('<b>Testing</b>');
        });
      });

      it('Selects a non-editable type', function () {
        const sel = 'section:nth-of-type(3) > .innerItem:nth-of-type(4) ' +
          arraySels;
        cy.get(sel + 'div[data-type="resurrectable"]').should(($div) => {
          expect($div.attr('title')).to.equal('A Non-editable');
        });
        cy.get(sel + '.stringTag').should('have.text', 'NonEditableType');
      });
    });

    describe('Group 4', function () {
      it('Selects a string email', function () {
        const sel = 'section:nth-of-type(4) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal('String');
        });
        cy.get(
          sel + 'input[type="email"]'
        ).should('have.value', 'brettz9@yahoo.com');
      });

      it('Selects undefined', function () {
        const sel = 'section:nth-of-type(4) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="undef"]').should(($div) => {
          expect($div.attr('title')).to.equal('An undefined');
        });
      });
    });

    describe('Group 5', function () {
      it('Selects null', function () {
        const sel = 'section:nth-of-type(5) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="null"]').should(($div) => {
          expect($div.attr('title')).to.equal('A null');
        });
      });

      it('Selects string URL', function () {
        const sel = 'section:nth-of-type(5) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal('String');
        });
        cy.get(sel + 'input').should('have.value', 'https://example.com');
      });
    });

    describe('Group 6', function () {
      it('Selects boolean', function () {
        const sel = 'section:nth-of-type(6) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="boolean"]').should(($div) => {
          expect($div.attr('title')).to.equal('Boolean');
        });
        cy.get(sel + 'input[value="true"]').should('be.checked');
      });

      it('Selects number', function () {
        const sel = 'section:nth-of-type(6) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="number"]').should(($div) => {
          expect($div.attr('title')).to.equal('Number');
        });
        cy.get(sel + 'input').should('have.value', '25');
      });

      it('Selects BigInt', function () {
        const sel = 'section:nth-of-type(6) > .innerItem:nth-of-type(3) ' +
          arraySels;
        cy.get(sel + 'div[data-type="bigint"]').should(($div) => {
          expect($div.attr('title')).to.equal('BigInt');
        });
        cy.get(sel + 'input').should('have.value', '123');
      });

      it('Selects string', function () {
        const sel = 'section:nth-of-type(6) > .innerItem:nth-of-type(4) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal('String');
        });
        cy.get(sel + 'textarea').should('have.value', 'a string');
      });

      it('Selects Date', function () {
        const sel = 'section:nth-of-type(6) > .innerItem:nth-of-type(5) ' +
          arraySels;
        cy.get(sel + 'div[data-type="date"]').should(($div) => {
          expect($div.attr('title')).to.equal('Date');
        });
        cy.get(sel + 'input').should('have.value', '2000-01-01T00:00');
      });
    });

    describe('Group 7', function () {
      it('Selects tuple no items and never rest', function () {
        const sel = 'section:nth-of-type(7) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="tuple"] span').should(($div) => {
          expect($div.attr('title')).to.equal('With no items and never rest');
        });
        cy.get(sel + 'fieldset').should('not.exist');
      });

      it('Selects map', function () {
        const sel = 'section:nth-of-type(7) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="map"] span').should(($div) => {
          expect($div.attr('title')).to.equal('A map');
        });

        cy.get(
          sel + 'fieldset:nth-of-type(1) input[type="number"]'
        ).should('have.value', '3');
        cy.get(
          sel + 'fieldset:nth-of-type(1) textarea'
        ).should('have.value', 'hello');

        cy.get(
          sel + 'fieldset:nth-of-type(2) input[type="number"]'
        ).should('have.value', '4');
        cy.get(
          sel + 'fieldset:nth-of-type(2) textarea'
        ).should('have.value', 'goodbye');
      });

      it('Selects numeric-keyed record', function () {
        const sel = 'section:nth-of-type(7) > .innerItem:nth-of-type(5) ' +
          arraySels;
        cy.get(sel + 'div[data-type="record"] span').should(($div) => {
          expect($div.attr('title')).to.equal('A record');
        });
      });

      it('Selects string-keyed record', function () {
        const sel = 'section:nth-of-type(7) > .innerItem:nth-of-type(6) ' +
          arraySels;
        cy.get(sel + 'div[data-type="record"] span').should(($div) => {
          expect($div.attr('title')).to.equal('Record');
        });

        cy.get(sel + 'fieldset:nth-of-type(1) > legend .mapKey').should(
          'have.text', 'A record key string '
        );
        cy.get(
          sel + 'fieldset:nth-of-type(1) > legend .mapKey'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('(record key)');
        });
        cy.get(
          sel + 'fieldset:nth-of-type(1) > legend .recordItem'
        ).should('have.text', '0');
        cy.get(
          sel + 'fieldset:nth-of-type(1) > legend textarea'
        ).should('have.value', 'aaaaa');

        cy.get(sel + 'fieldset:nth-of-type(1) > .mapValue').should(
          'contain', 'A record value number'
        );
        cy.get(sel + 'fieldset:nth-of-type(1) input[type=number]').should(
          'have.value', '123'
        );

        cy.get(sel + 'fieldset:nth-of-type(2) > legend .mapKey').should(
          'have.text', 'A record key string '
        );
        cy.get(
          sel + 'fieldset:nth-of-type(2) > legend .mapKey'
        ).should(($span) => {
          expect($span.attr('title')).to.equal('(record key)');
        });
        cy.get(
          sel + 'fieldset:nth-of-type(2) > legend .recordItem'
        ).should('have.text', '1');
        cy.get(
          sel + 'fieldset:nth-of-type(2) > legend textarea'
        ).should('have.value', 'bbbbb');

        cy.get(sel + 'fieldset:nth-of-type(2) > .mapValue').should(
          'contain', 'A record value number'
        );
        cy.get(sel + 'fieldset:nth-of-type(2) input[type=number]').should(
          'have.value', '456'
        );
      });

      it('Selects a FileList', function () {
        const sel = 'section:nth-of-type(7) > .innerItem:nth-of-type(7) ' +
          arraySels;
        cy.get(sel + 'div[data-type="filelist"] > span').should(($div) => {
          expect($div.attr('title')).to.equal('A FileList');
        });

        cy.get(
          sel + 'fieldset[data-type="file"]:nth-of-type(1) > legend'
        ).should(
          'have.text', 'A text File 1'
        );
        cy.get(
          sel + 'fieldset[data-type="file"]:nth-of-type(1) .fileName'
        ).should(
          'have.value', 'someName'
        );
        cy.get(
          sel + 'fieldset[data-type="file"]:nth-of-type(1) .contentType'
        ).should(
          'have.value', 'text/plain'
        );

        cy.get(
          sel + 'fieldset[data-type="file"]:nth-of-type(2) > legend'
        ).should(
          'have.text', 'A text File 2'
        );
        cy.get(
          sel + 'fieldset[data-type="file"]:nth-of-type(2) .fileName'
        ).should(
          'have.value', 'anotherName'
        );
        cy.get(
          sel + 'fieldset[data-type="file"]:nth-of-type(2) .contentType'
        ).should(
          'have.value', 'text/plain'
        );
      });
    });

    describe('Group 8', function () {
      it('Selects null', function () {
        const sel = 'section:nth-of-type(8) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="null"]').should(($div) => {
          expect($div.attr('title')).to.equal('Null');
        });
      });

      it('Selects enum', function () {
        const sel = 'section:nth-of-type(8) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal('An enum');
        });

        cy.get(sel + 'select[name="demo-type-choices-only-initial-value-string"]').should(
          'have.value', 'ghi'
        );
      });
    });

    describe('Group 9', function () {
      it('Selects null', function () {
        const sel = 'section:nth-of-type(9) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="null"]').should(($div) => {
          expect($div.attr('title')).to.equal('A null');
        });
      });

      it('Selects enum', function () {
        const sel = 'section:nth-of-type(9) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="number"]').should(($div) => {
          expect($div.attr('title')).to.equal('Number');
        });

        cy.get(sel + '[data-type="number"] select').should(
          'have.value', '0'
        );
      });

      it('Selects boolean', function () {
        const sel = 'section:nth-of-type(9) > .innerItem:nth-of-type(3) ' +
          arraySels;
        cy.get(sel + 'div[data-type="boolean"]').should(($div) => {
          expect($div.attr('title')).to.equal('Boolean');
        });

        cy.get(sel + 'input[value="true"]').should(
          'be.checked'
        );
      });

      it('Selects literal number', function () {
        const sel = 'section:nth-of-type(9) > .innerItem:nth-of-type(4) ' +
          arraySels;
        cy.get(sel + 'div[data-type="number"]').should(($div) => {
          expect($div.attr('title')).to.equal('Number');
        });

        cy.get(sel + '[data-type="number"] select').should(
          'have.value', '135'
        );
      });

      it('Selects NaN', function () {
        const sel = 'section:nth-of-type(9) > .innerItem:nth-of-type(5) ' +
          arraySels;
        cy.get(sel + 'div[data-type="nan"]').should(($div) => {
          expect($div.attr('title')).to.equal('NaN');
        });
      });

      it('Selects void', function () {
        const sel = 'section:nth-of-type(9) > .innerItem:nth-of-type(6) ' +
          arraySels;
        cy.get(sel + 'div[data-type="undef"]').should(($div) => {
          expect($div.attr('title')).to.equal('Undefined');
        });
      });

      it('Selects an enum', function () {
        const sel = 'section:nth-of-type(9) > .innerItem:nth-of-type(7) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal('String');
        });
        cy.get(sel + 'div[data-type="string"] select > option:selected').should(
          'have.value', 'ijkl'
        );
      });
    });

    describe('Group 10', function () {
      it('Selects NaN', function () {
        const sel = 'section:nth-of-type(10) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="nan"]').should(($div) => {
          expect($div.attr('title')).to.equal('NaN');
        });
      });

      it('Selects a catch', function () {
        const sel = 'section:nth-of-type(10) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal(
            'An overpassed string and A catch'
          );
        });

        cy.get(sel + 'textarea').should('have.value', 'def');
      });
    });

    describe('Group 11', function () {
      it('Selects NaN', function () {
        const sel = 'section:nth-of-type(11) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="nan"]').should(($div) => {
          expect($div.attr('title')).to.equal('NaN');
        });
      });

      it('Selects a catch', function () {
        const sel = 'section:nth-of-type(11) > .innerItem:nth-of-type(2) ' +
          arraySels;
        cy.get(sel + 'div[data-type="string"]').should(($div) => {
          expect($div.attr('title')).to.equal('String');
        });

        cy.get(sel + 'textarea').should('have.value', 'def');
      });
    });

    describe('Group 12', function () {
      it('Selects nested object', function () {
        const sel = 'section:nth-of-type(12) > .innerItem:nth-of-type(1) ' +
          arraySels;
        cy.get(sel + 'div[data-type="object"] span').should(($span) => {
          expect($span.attr('title')).to.equal('Some object');
        });

        const prefix = sel + (arraySels ? '' : ' > .typeContainer') +
          ' > [data-type="object"] > ' +
          '.arrayContents > .arrayItems > ';

        cy.get(
          prefix +
          'fieldset:nth-of-type(1) > legend > b'
        ).should(($b) => {
          expect($b.attr('title')).to.equal('a');
          expect($b.text()).to.equal('A array');
        });
        cy.get(
          prefix +
          'fieldset:nth-of-type(1) legend[data-type="number"]'
        ).should('contain', 'A number');
        cy.get(
          prefix +
          'fieldset:nth-of-type(1) legend[data-type="number"] > input'
        ).should('have.value', '0');
        cy.get(
          prefix +
          'fieldset:nth-of-type(1) fieldset[data-type="number"] ' +
          'input[type="number"]'
        ).should('have.value', '3');

        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > legend > b'
        ).should(($b) => {
          expect($b.attr('title')).to.equal('b');
          expect($b.text()).to.equal('B array');
        });
        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          'legend > input'
        ).should('have.value', '0');
        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(1) > legend > input'
        ).should('have.value', '0');
        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(1) > .typeContainer input'
        ).should('have.value', '5');

        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(2) > legend > input'
        ).should('have.value', '1');
        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(2) > .typeContainer input'
        ).should('have.value', '6');

        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(2) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(1) > legend > input'
        ).should('have.value', '0');
        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(2) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(1) > .typeContainer input'
        ).should('have.value', '7');

        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(2) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(2) > legend > input'
        ).should('have.value', '1');
        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(2) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(2) > .typeContainer input'
        ).should('have.value', '8');

        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(2) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(3) > legend > input'
        ).should('have.value', '2');
        cy.get(
          prefix +
          'fieldset:nth-of-type(2) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(2) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(3) > .typeContainer input'
        ).should('have.value', '9');

        cy.get(
          prefix +
          'fieldset:nth-of-type(3) > legend > b'
        ).should(($b) => {
          expect($b.attr('title')).to.equal('c');
          expect($b.text()).to.equal('C array');
        });

        cy.get(
          prefix +
          'fieldset:nth-of-type(3) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          'legend > input'
        ).should('have.value', '0');

        cy.get(
          prefix +
          'fieldset:nth-of-type(3) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(1) > legend > b[title="a"]'
        ).should('have.text', 'A number');
        cy.get(
          prefix +
          'fieldset:nth-of-type(3) > .typeContainer > ' +
          '[data-type="arrayNonindexKeys"] > .arrayContents > .arrayItems > ' +
          'fieldset:nth-of-type(1) > ' +
          '.typeContainer ' +
          'fieldset:nth-of-type(1) > .typeContainer input'
        ).should('have.value', '5');
      });
    });

    describe('Group 13', function () {
      it('Selects object with type selector', function () {
        const sel1 = 'form ' + (arraySels
          ? '> .typeContainer:nth-of-type(1) > ' +
            '[data-type="arrayNonindexKeys"] > ' +
            '.arrayContents > .arrayItems > fieldset > ' +
            'select:nth-of-type(1) '
          : '> select:nth-of-type(1) ');
        cy.get(
          sel1 + 'option:selected'
        ).should('have.text', 'Object (Some object)');

        const sel2 = 'form ' + (arraySels
          ? '> .typeContainer:nth-of-type(1) > ' +
            '[data-type="arrayNonindexKeys"] > ' +
            '.arrayContents > .arrayItems > fieldset > ' +
            '.typeContainer:nth-of-type(1) '
          : '> .typeContainer:nth-of-type(1) ');

        cy.get(sel2 + 'select option').should('have.length', '3');
        cy.get(sel2 + 'select option:selected').should('have.text', 'Number');
        cy.get(sel2 + '.typeContainer input').should('have.value', '3');
      });
    });

    describe('Group 14', function () {
      it('Selects object with type selector', function () {
        const sel = 'form ' + (arraySels
          ? '> .typeContainer:nth-of-type(2) > ' +
            '[data-type="arrayNonindexKeys"] > ' +
            '.arrayContents > .arrayItems > fieldset > ' +
            '.typeContainer:nth-of-type(1) '
          : '> .typeContainer:nth-of-type(2) ');

        cy.get(sel + 'select option').should('have.length', '3');
        cy.get(sel + 'select option:selected').should('have.text', 'Number');
        cy.get(sel + '.typeContainer input').should('have.value', '3');
      });
    });
  });
});
