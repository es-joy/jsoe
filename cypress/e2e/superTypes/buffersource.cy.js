describe('Buffersource spec', () => {
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
      'buffersource'
    );
    cy.get(
      'input[name="demo-keypath-not-expected-buffersource-returnType-5"]'
    ).should(
      'exist'
    );
  });

  it('errs exceeding typed array buffer bounds', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-typedArrays-init').select('Int16Array');

    cy.clearTypeAndBlur(sel + '.byteLength', '16');

    cy.get(sel + '.typedArrayLength').should(($input) => {
      expect(
        /** @type {HTMLInputElement} */ ($input[0]).validationMessage
      ).to.eq(
        'The byte offset and the length times bytes per element ' +
        'is greater than the buffer length'
      );
    });
  });

  it(
    'errs exceeding typed array buffer bounds (changing typed array length)',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );
      cy.get(sel + '.buffersource-typedArrays-init').select('Int8Array');

      cy.clearTypeAndBlur(sel + '.byteLength', '16');

      cy.clearTypeAndBlur(sel + '.typedArrayLength', '100');

      cy.get(sel + '.typedArrayLength').should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ ($input[0]).validationMessage
        ).to.eq(
          'The byte offset and the length times bytes per element ' +
          'is greater than the buffer length'
        );
      });
    }
  );

  it('errs exceeding typed array length', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-typedArrays-init').select('BigUint64Array');

    cy.clearTypeAndBlur(sel + '.byteLength', '8000000000');

    cy.clearTypeAndBlur(sel + '.typedArrayLength', '1000000000');

    cy.get(sel + '.typedArrayLength').should(($input) => {
      expect(
        /** @type {HTMLInputElement} */ ($input[0]).validationMessage
      ).to.eq(
        'Typed Array length is too long'
      );
    });
  });

  it(
    'errs exceeding typed array buffer bounds (changing typed array)',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );
      cy.get(sel + '.buffersource-returnType-typedarray').click();

      cy.clearTypeAndBlur(sel + '.byteLength', '8');

      cy.get(sel + '.buffersource-typedArrays').select('BigInt64Array');

      cy.get(sel + '.typedArrayLength').should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ ($input[0]).validationMessage
        ).to.eq(
          'The byte offset and the length times bytes per element ' +
          'is greater than the buffer length'
        );
      });
    }
  );

  it(
    'errs exceeding typed array buffer byte length',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      // + 2 higher than max
      cy.clearTypeAndBlur(sel + '.byteLength', '9007199254740993');

      cy.get(sel + '.byteLength').should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ ($input[0]).validationMessage
        ).to.eq(
          'The ArrayBuffer length exceeds the maximum ' +
          'allowable size'
        );
      });
    }
  );

  it(
    'if new byte length exceeds max, reset max to new byte length',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      cy.clearTypeAndBlur(sel + '.maxByteLength', '16');
      cy.clearTypeAndBlur(sel + '.byteLength', '32');

      cy.get(sel + '.maxByteLength').should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ $input.val()
        ).to.eq(
          '32'
        );
      });
    }
  );

  it(
    'errs with buffer byte length defaulting to 0 for data view if not set',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      cy.clearTypeAndBlur(sel + '.dataViewByteLength', '16');

      cy.get(sel + '.dataViewByteLength').should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ ($input[0]).validationMessage
        ).to.eq(
          'The DataView byte length and offset exceed ' +
          'the buffer\'s byte length'
        );
      });
    }
  );

  it(
    'errs with typed array byte offset not a multiple of bytes-per-element',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      cy.clearTypeAndBlur(sel + '.byteLength', '32');
      cy.get(sel + '.buffersource-typedArrays-init').select('Int16Array');
      cy.clearTypeAndBlur(sel + '.typedArrayLength', '4');
      cy.clearTypeAndBlur(sel + '.typedArrayByteOffset', '5');

      cy.get(sel + '.typedArrayByteOffset').should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ ($input[0]).validationMessage
        ).to.eq(
          'Byte offset must be a multiple of the typed ' +
          'array\'s bytes-per-element size (2)'
        );
      });
    }
  );

  it(
    'errs with array buffer not a multiple of bytes-per-element',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      cy.clearTypeAndBlur(sel + '.byteLength', '15');
      cy.clearTypeAndBlur(sel + '.typedArrayLength', '2');
      cy.get(sel + '.buffersource-typedArrays-init').select('Int32Array');

      cy.get(sel + '.byteLength').should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ ($input[0]).validationMessage
        ).to.eq(
          'Array buffer must be a multiple of the typed array\'s ' +
          'bytes-per-element size (4)'
        );
      });
    }
  );

  it(
    'sets float pattern',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      cy.clearTypeAndBlur(sel + '.byteLength', '48');
      cy.get(sel + '.buffersource-typedArrays-init').select('Float32Array');
      cy.clearTypeAndBlur(sel + '.typedArrayLength', '2');

      cy.get(
        sel + '.typedArrayArea .typedArrayValue:first'
      ).should(($input) => {
        expect(
          /** @type {HTMLInputElement} */ ($input[0]).pattern
        ).to.eq(
          String.raw`\d+(?:\.\d+)?`
        );
      });
    }
  );

  it(
    'preserves number after array length change',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      cy.clearTypeAndBlur(sel + '.byteLength', '48');
      cy.clearTypeAndBlur(sel + '.typedArrayLength', '3');

      cy.clearTypeAndBlur(
        sel + '.typedArrayArea .typedArrayValue:first', '2'
      );

      cy.clearTypeAndBlur(sel + '.typedArrayLength', '4');

      cy.get(
        sel + '.typedArrayArea .typedArrayValue:first'
      ).should(($input) => {
        expect($input.val()).to.eq(
          '2'
        );
      });
    }
  );

  it(
    'changes mins and maxes per typed array type',
    function () {
      const sel = '#formatAndTypeChoices ';
      cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
        'buffersource'
      );

      cy.clearTypeAndBlur(sel + '.byteLength', '32');
      cy.clearTypeAndBlur(sel + '.typedArrayLength', '4');

      [
        ['Int8Array', '-128', '127'],
        ['Uint8Array', '0', '255'],
        ['Uint8ClampedArray', '0', '255'],
        ['Int16Array', '-32768', '32767'],
        ['Uint16Array', '0', '65535'],
        ['Int32Array', '-2147483648', '2147483647'],
        ['Uint32Array', '0', '4294967295'],
        ['Float32Array', '-3.4e+38', '3.4e+38'],
        [
          'Float64Array',
          /* '-1.8e+308' */ '-Infinity',
          /* '1.8e+308' */ 'Infinity'
        ],
        ['BigInt64Array', String(-(2 ** 63)), String((2 ** 63) - 1)],
        ['BigUint64Array', '0', String((2 ** 64) - 1)]
      ].forEach(([typedArray, min, max]) => {
        cy.get(sel + '.buffersource-typedArrays-init').select(typedArray);
        cy.get(
          sel + '.typedArrayArea .typedArrayValue:first'
        ).should(($input) => {
          expect(
            /** @type {HTMLInputElement} */ ($input[0]).min
          ).to.eq(min);
          expect(
            /** @type {HTMLInputElement} */ ($input[0]).max
          ).to.eq(max);
        });
      });
    }
  );

  it('gets type', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );

    cy.get('button#getType').click();
    cy.get('dialog[open]').should('include.text', 'buffersource');
  });

  it('is valid (false)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.clearTypeAndBlur(sel + '.byteLength', '8');
    cy.clearTypeAndBlur(sel + '.maxByteLength', '3');

    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'false');
  });

  it('is valid (true)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );

    cy.get('button#isValid').click();
    cy.get('dialog[open]').should('include.text', 'true');
  });

  it('logs value', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );

    cy.get('button#logValue').click();
    cy.get('@consoleLog').should('be.calledWith', new ArrayBuffer(0));
  });

  it('views UI (ArrayBuffer)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="buffersource"]'
    ).should('contain', 'ArrayBuffer');
  });

  it('views UI (DataView)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-returnType-dataview').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="buffersource"]'
    ).should('contain', 'DataView');
    cy.get(
      '#viewUIResults div[data-type="buffersource"]'
    ).should('contain', 'Data View byte length');
  });

  it('views UI (Typed Array)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-returnType-typedarray').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="buffersource"]'
    ).should('contain', 'Int8Array');
    cy.get(
      '#viewUIResults div[data-type="buffersource"]'
    ).should('contain', 'Typed Array byte offset');
  });

  it('views UI (views data)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-returnType-typedarray').click();
    cy.clearTypeAndBlur(sel + '.byteLength', '32');
    cy.clearTypeAndBlur(sel + '.typedArrayLength', '4');
    cy.clearTypeAndBlur(sel + '.typedArrayValue:first', '3');

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');

    cy.get('#viewUIResults .buffersource-viewData').click();
    cy.get(
      'dialog[open]'
    ).should('contain', '3');
  });

  it('views UI (views data with offsets and data view)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-returnType-typedarray').click();
    cy.clearTypeAndBlur(sel + '.byteLength', '64');

    cy.clearTypeAndBlur(sel + '.dataViewByteOffset', '2');
    cy.clearTypeAndBlur(sel + '.dataViewByteLength', '4');

    cy.get(sel + '.dataViewMethod').select('setInt8');
    cy.clearTypeAndBlur(sel + '.dataViewSetByteOffset', '1');
    cy.clearTypeAndBlur(sel + '.dataViewArea .typedArrayValue', '8');
    cy.get(sel + '.dataViewArea button').contains('Set').click();

    cy.get(sel + '.dataViewMethod').select('setInt16');
    cy.clearTypeAndBlur(sel + '.dataViewSetByteOffset', '1');
    cy.clearTypeAndBlur(sel + '.dataViewArea .typedArrayValue', '8');
    cy.get(sel + '.dataViewArea button').contains('Set').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');

    cy.get('#viewUIResults .buffersource-viewData').click();
    cy.get(
      'dialog[open]'
    ).should('contain', '8');
  });

  it('views UI (views data with BigInt data view)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-returnType-typedarray').click();
    cy.clearTypeAndBlur(sel + '.byteLength', '64');

    cy.get(sel + '.dataViewMethod').select('setBigInt64');
    cy.clearTypeAndBlur(sel + '.dataViewSetByteOffset', '0');
    cy.clearTypeAndBlur(sel + '.dataViewArea .typedArrayValue', '8');
    cy.get(sel + '.dataViewArea button').contains('Set').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');

    cy.get('#viewUIResults .buffersource-viewData').click();
    cy.get(
      'dialog[open]'
    ).should('contain', '8');
  });

  it('views UI (views data with Int16Array typed array)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-typedArrays-init').select('Int16Array');

    cy.clearTypeAndBlur(sel + '.byteLength', '32');
    cy.clearTypeAndBlur(sel + '.typedArrayLength', '4');
    cy.clearTypeAndBlur(sel + '.typedArrayValue:first', '3');

    cy.get(sel + '.buffersource-returnType-typedarray').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');

    cy.get('#viewUIResults .buffersource-viewData').click();
    cy.get(
      'dialog[open]'
    ).should('contain', '3');
  });

  it('views UI (views data with bigint typed array)', function () {
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-typedArrays-init').select('BigInt64Array');

    cy.clearTypeAndBlur(sel + '.byteLength', '32');
    cy.clearTypeAndBlur(sel + '.typedArrayLength', '4');
    cy.clearTypeAndBlur(sel + '.typedArrayValue:first', '3');

    cy.get(sel + '.buffersource-returnType-typedarray').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');

    cy.get('#viewUIResults .buffersource-viewData').click();
    cy.get(
      'dialog[open]'
    ).should('contain', '3');
  });

  // For the "Type choices with initial value set" control
  it('gets a value set onload (ArrayBuffer)', function () {
    cy.get(
      'fieldset[data-type="buffersource"]:nth-of-type(30) .byteLength'
    ).should(($input) => {
      expect(
        /** @type {HTMLInputElement & {$value: any}} */ ($input[0]).$value
      ).to.be.a('ArrayBuffer');
    });
  });

  it('gets a value set onload (DataView)', function () {
    cy.get(
      'fieldset[data-type="buffersource"]:nth-of-type(31) .byteLength'
    ).should(($input) => {
      expect(
        /** @type {HTMLInputElement & {$value: any}} */ ($input[0]).$value
      ).to.be.a('DataView');
    });
  });

  it('gets value (ArrayBuffer)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'ArrayBuffer({{}"byteLength": 8})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new ArrayBuffer(8)
    );
  });

  it('gets value (ArrayBuffer with Uint8Array)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'ArrayBuffer({{}"typedArray": "Uint8Array", "byteLength": 8, ' +
      '"set": [[3, 4, 5]]})'
    );
    const array = new Uint8Array(new ArrayBuffer(8));
    array.set([3, 4, 5]);
    cy.get('@consoleLog').should(
      'be.calledWith', array.buffer
    );
  });

  it('gets value (ArrayBuffer with BigInt64Array)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'ArrayBuffer({{}"typedArray": "BigInt64Array", "byteLength": 32, ' +
      '"set": [["3", "4", "5"]]})'
    );
    const array = new BigInt64Array(new ArrayBuffer(32));
    array.set([3n, 4n, 5n]);
    cy.get('@consoleLog').should(
      'be.calledWith', array.buffer
    );
  });

  it('gets value (ArrayBuffer with DataView method)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'ArrayBuffer({{}"byteLength": 32, "setInt8": [[0, 3]], ' +
      '"setBigInt64": [[1, "5"]]})'
    );
    const buffer = new ArrayBuffer(32);
    const dataView = new DataView(buffer);
    dataView.setInt8(0, 3);
    dataView.setBigInt64(1, 5n);
    cy.get('@consoleLog').should(
      'be.calledWith', buffer
    );
  });

  it('gets value (DataView)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'DataView({{}"byteLength": 8, "dataViewByteOffset": 2, ' +
      '"dataViewByteLength": 4})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new DataView(new ArrayBuffer(8), 2, 4)
    );
  });

  it('gets value (Uint8Array)', function () {
    cy.clearTypeAndBlur(
      '#getValueForString',
      'Uint8Array({{}"byteLength": 8})'
    );
    cy.get('@consoleLog').should(
      'be.calledWith', new Uint8Array(8)
    );
  });

  it('gets a value set onload (TypedArray)', function () {
    cy.get(
      'fieldset[data-type="buffersource"]:nth-of-type(32) .byteLength'
    ).should(($input) => {
      expect(
        /** @type {HTMLInputElement & {$value: any}} */ ($input[0]).$value
      ).to.be.a('Uint8Array');
    });
  });
});

describe('BufferSource spec (schemas)', () => {
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
      'buffersource'
    );

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');
    cy.get(
      '#viewUIResults div[data-type="buffersource"] .emphasis'
    ).then((elem) => {
      expect(elem.attr('title')).to.equal('(an ArrayBuffer)');
    });
  });

  it('views UI (DataView)', function () {
    cy.get('.formatChoices:first').select('Schema: Zodexy schema instance 2');
    const sel = '#formatAndTypeChoices ';
    cy.get(sel + 'select.typeChoices-demo-keypath-not-expected').select(
      'buffersource'
    );
    cy.get(sel + '.buffersource-returnType-dataview').click();

    cy.get('button#viewUI').click();
    cy.get('#viewUIResults div[data-type="buffersource"]').should('exist');

    cy.get(
      '#viewUIResults div[data-type="buffersource"] .emphasis'
    ).then((elem) => {
      expect(elem.attr('title')).to.equal('(a DataView)');
    });
  });
});
