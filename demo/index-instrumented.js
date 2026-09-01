import {jml, body, $} from '../src/vendor-imports.js';
import dialogs from '../src/utils/dialogs.js';

import {
  typeChoices,
  getFormatAndSchemaChoices,
  formatAndTypeChoices,
  Types
} from '../src/index.js';

import {
  makeNoneditableType
} from './schema-data.js';

const types = new Types();

const keyPathNotExpectedTypeChoices = await formatAndTypeChoices({
  hasKeyPath: false,
  typeNamespace: 'demo-keypath-not-expected'
});

setTimeout(async function () {
  jml('section', {role: 'main'}, [
    ['h1', [
      'Jsoe testing'
    ]],
    ['h2', [
      'Format and type choices: No key path expected (type can vary at root)'
    ]],

    // Put inside form so can validate
    ['form', {id: 'formatAndTypeChoices'}, [
      ...keyPathNotExpectedTypeChoices.domArray
    ]],

    ['button', {
      id: 'getType',
      $on: {
        click () {
          dialogs.alert(keyPathNotExpectedTypeChoices.getType());
        }
      }
    }, ['Get type']],

    ['button', {
      id: 'isValid',
      $on: {
        click () {
          dialogs.alert(keyPathNotExpectedTypeChoices.validValuesSet());
        }
      }
    }, ['Is valid']],

    ['button', {
      id: 'logValue',
      $on: {
        click () {
          console.log(keyPathNotExpectedTypeChoices.getValue());
        }
      }
    }, ['Log value']],

    ['button', {
      id: 'viewUI',
      $on: {
        async click () {
          const controls =
            (await keyPathNotExpectedTypeChoices.formats.getControlsForFormatAndValue(
              keyPathNotExpectedTypeChoices.types,
              $('#useIndexedDBKey').checked
                ? 'indexedDBKey'
                : 'structuredCloning',
              keyPathNotExpectedTypeChoices.getValue(),
              {
                readonly: true
              }
            )).rootUI;
          $('#viewUIResults').firstChild?.remove();
          $('#viewUIResults').append(controls);
        }
      }
    }, ['view UI']],

    ['div', {id: 'viewUIResults'}],

    ['button', {
      id: 'initializeWithValue',
      $on: {
        async click () {
          await keyPathNotExpectedTypeChoices.setValue(42);
        }
      }
    }, ['Initialize with a value']],

    ['button', {
      id: 'initializeWithComplexValue',
      $on: {
        async click () {
          const a = {
            bbb: {},
            xxx: {yyy: []}
          };
          a.bbb.ccc = a;
          a.zzz = a.xxx.yyy;
          await keyPathNotExpectedTypeChoices.setValue(a);
        }
      }
    }, ['Initialize with a complex value']],

    ['button', {
      id: 'initializeWithNoneditableValue',
      $on: {
        click () {
          const a = makeNoneditableType();
          const root = $(
            '#formatAndTypeChoices div[data-type="resurrectable"]'
          );
          keyPathNotExpectedTypeChoices.types.setValue({
            type: 'resurrectable',
            root,
            value: a
          });
          keyPathNotExpectedTypeChoices.types.validate({
            type: 'resurrectable',
            root
          });

          setTimeout(() => {
            keyPathNotExpectedTypeChoices.types.setValue({
              type: 'resurrectable',
              root,
              value: undefined
            });
            keyPathNotExpectedTypeChoices.types.validate({
              type: 'resurrectable',
              root
            });
          }, 3000);
          // await keyPathNotExpectedTypeChoices.setValue(a);
        }
      }
    }, ['Initialize with noneditable value then change']],

    ['button', {
      id: 'programmaticallySetFormatToJSON',
      $on: {
        async click () {
          await keyPathNotExpectedTypeChoices.formatChoices.$setFormat({
            valueFormat: 'json'
          });
        }
      }
    }, [
      'Programmatically set format (to JSON)'
    ]],

    ['button', {
      id: 'setCustomValidateAllReferences',
      $on: {
        click () {
          keyPathNotExpectedTypeChoices.types.customValidateAllReferences =
            () => {
              dialogs.alert('customValidateAllReferences set');
            };
        }
      }
    }, [
      'Set custom all reference validation'
    ]],

    ['button', {
      id: 'showRootFormControl',
      $on: {
        click () {
          const root = $(
            '#formatAndTypeChoices > .typesHolder > ' +
              '.typeContainer > div[data-type]'
          );
          const formControl =
            keyPathNotExpectedTypeChoices.types.getFormControlForRoot(root);
          formControl.style.backgroundColor = 'red';
          setTimeout(() => {
            formControl.style.backgroundColor = 'white';
          }, 3000);
        }
      }
    }, ['Show root form control']],

    ['button', {
      id: 'getValueFromRootAncestor',
      $on: {
        click () {
          const val =
            keyPathNotExpectedTypeChoices.types.getValueFromRootAncestor(
              '#formatAndTypeChoices > .typesHolder > ' +
                '.typeContainer'
            );
          console.log(val);
        }
      }
    }, [
      'Get value from root ancestor'
    ]],

    ['button', {
      id: 'showFormControlFromRootAncestor',
      $on: {
        click () {
          const formControl =
            keyPathNotExpectedTypeChoices.types.getFormControlFromRootAncestor(
              '#formatAndTypeChoices > .typesHolder > ' +
                '.typeContainer'
            );
          formControl.style.backgroundColor = 'red';
          setTimeout(() => {
            formControl.style.backgroundColor = 'initial';
          }, 3000);
        }
      }
    }, [
      'Show form control from root ancestor'
    ]],

    ['h2', [
      'Format and type choices: Key path expected (object required at root)'
    ]],
    ...(await formatAndTypeChoices({
      hasKeyPath: true,
      typeNamespace: 'demo-keypath-expected'
    })).domArray,

    ['h2', [
      'Format choices without type selection ' +
        '(might use as retrieval return format)'
    ]],
    ['select', {id: 'formatAndSchemaChoices'}, [
      getFormatAndSchemaChoices()
    ]],

    ['h2', [
      'Type choices only'
    ]],

    (() => {
      const typeSelection = typeChoices({
        format: 'structuredCloning',
        typeNamespace: 'demo-type-choices-only'
      });

      return ['form', {
        id: 'typeChoicesOnly',
        $on: {
          submit (e) {
            e.preventDefault();
          }
        }
      }, [
        ...typeSelection.domArray,
        ['button', {
          id: 'typeChoicesOnly-getType',
          $on: {
            click () {
              dialogs.alert(typeSelection.getType());
            }
          }
        }, ['Get type']],

        ['button', {
          id: 'typeChoicesOnly-isValid',
          $on: {
            click () {
              dialogs.alert(typeSelection.validValuesSet());
            }
          }
        }, ['Is valid']],

        ['button', {
          id: 'validateInitialType',
          $on: {
            click () {
              dialogs.alert(typeSelection.domArray[0].$validate());
            }
          }
        }, [
          'Validate initial type'
        ]],

        ['button', {
          id: 'typeChoicesOnly-logValue',
          $on: {
            click () {
              console.log(typeSelection.getValue());
            }
          }
        }, ['Log value']],

        ['button', {
          id: 'typeChoicesOnly-initializeWithValue',
          $on: {
            async click () {
              await typeSelection.setValue(42);
            }
          }
        }, ['Initialize with a value']]
      ]];
    })(),

    ['h2', [
      'Type choices with initial value set'
    ]],

    (() => {
      const badDate = new Date('Bad date');
      const cause = new Error('some cause');
      const error = new Error('msg');
      /* eslint-disable unicorn/no-error-property-assignment -- Testing */
      error.cause = cause;

      // eslint-disable-next-line unicorn/error-message -- Testing empty
      const error2 = new Error();
      error2.message = undefined; // Needed to force (at least in Chrome)
      error2.fileName = 'abc';
      error2.name = undefined;
      error2.stack = undefined;
      error2.lineNumber = 10;
      error2.columnNumber = 20;

      const typeError = new TypeError('msg');
      const typeCause = new RangeError('some cause');
      typeError.cause = typeCause;

      // eslint-disable-next-line unicorn/error-message -- Testing empty
      const error3 = new TypeError();
      error3.message = undefined; // Needed to force (at least in Chrome)
      error3.fileName = 'abc';
      error3.name = undefined;
      error3.stack = undefined;
      error3.lineNumber = 10;
      error3.columnNumber = 20;

      const aggregate1 = new RangeError('agg err1');
      const aggregate2 = new TypeError('agg err2');
      const aggregate3 = new Error('agg err3');
      const errAggregate = new AggregateError(
        [aggregate1, aggregate2, aggregate3], 'agg msg'
      );

      const typeSelection = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: [
          42, 123n, 'test123', new Date('1999-01-01T20:00'), badDate,
          // eslint-disable-next-line require-unicode-regexp, sonarjs/no-empty-after-reluctant -- Testing
          /.*?/,
          // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
          new Boolean(false),
          // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
          new Boolean(true),
          // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
          new Number(42),
          // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
          new String('test123'),
          NaN,
          -0,
          new Blob(['<b>Testing</b>'], {type: 'text/html'}),
          new Map([
            [null, 3],
            [true, new Map([[false, 5]])],
            [new Map([[6, 4]]), 7]
          ]),
          error,
          error2,
          error3,
          typeError,
          errAggregate,
          new File(['abc'], 'someName', {
            lastModified: 1231231230,
            type: 'text/plain'
          }),
          new Blob(['abc'], {
            type: 'text/plain'
          }),
          new DOMException('some message', 'someName'),
          new DOMRect(1, 2, 3, 4),
          new DOMRectReadOnly(1, 2, 3, 4),
          new DOMPoint(1, 2, 3, 4),
          new DOMPointReadOnly(1, 2, 3, 4),
          new DOMMatrix([1, 2, 3, 4, 5, 6]),
          new DOMMatrixReadOnly([1, 2, 3, 4, 5, 6]),
          new DOMMatrix([
            1, 2, 3, 4,
            5, 6, 7, 8,
            9, 10, 11, 12,
            13, 14, 15, 16
          ]),
          new ArrayBuffer(8),
          new DataView(new ArrayBuffer(8), 2, 4),
          new Uint8Array(new ArrayBuffer(8), 2, 4),
          makeNoneditableType(),
          new Object(123n)
        ],
        typeNamespace: 'demo-type-choices-only-initial-value'
      });

      const typeSelectionBlobHTML = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: new Blob(['<b>Testing</b>'], {type: 'text/html'}),
        typeNamespace: 'demo-type-choices-only-initial-value'
      });

      const error4 = new Error('msg2');
      const cause4 = new Error('some cause2');
      error4.cause = cause4;
      const typeSelectionErrorWithCause = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: error4,
        typeNamespace: 'demo-type-choices-only-initial-value-ErrorCause'
      });

      const error5 = new TypeError('msg2');
      const cause5 = new RangeError('some cause2');
      error5.cause = cause5;
      const typeSelectionTypeErrorWithCause = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: error5,
        typeNamespace: 'demo-type-choices-only-initial-value-ErrorsCause'
      });

      const typeSelectionIndexedDBKey = typeChoices({
        format: 'indexedDBKey',
        setValue: true,
        value: [-0, -Infinity],
        typeNamespace: 'demo-type-choices-only-initial-value',
        keySelectClass: 'only-initial'
      });

      const agg1 = new RangeError('some err1');
      const agg2 = new TypeError('some err2');
      const agg3 = new Error('some err3');
      const errorAggregate = new AggregateError([agg1, agg2, agg3], 'msg2');
      errorAggregate.stack = undefined; // For coverage
      /* eslint-enable unicorn/no-error-property-assignment -- Testing */

      const typeSelectionTypeErrorWithAggregate = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: errorAggregate,
        typeNamespace: 'demo-type-choices-only-initial-value-ErrorsAggregate'
      });

      const typeSelectionFile = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: new File(['abc'], 'anotherName', {
          lastModified: 1231231230,
          type: 'text/plain'
        }),
        typeNamespace: 'demo-type-choices-only-initial-value'
      });

      const typeSelectionBlob = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: new Blob(['abc'], {
          type: 'text/plain'
        }),
        typeNamespace: 'demo-type-choices-only-initial-value'
      });

      const typeSelectionNoneditable = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: makeNoneditableType(),
        typeNamespace: 'demo-type-choices-only-initial-value'
      });

      const typeSelectionArrayBuffer = typeChoices({
        format: 'structuredCloning',
        setValue: true,
        value: new ArrayBuffer(8),
        typeNamespace: 'demo-type-choices-only-initial-value'
      });

      return ['form', [
        ...typeSelection.domArray,
        ...typeSelectionBlobHTML.domArray,
        ...typeSelectionErrorWithCause.domArray,
        ...typeSelectionIndexedDBKey.domArray,
        ...typeSelectionTypeErrorWithCause.domArray,
        ...typeSelectionTypeErrorWithAggregate.domArray,
        ...typeSelectionFile.domArray,
        ...typeSelectionBlob.domArray,
        ...typeSelectionNoneditable.domArray,
        ...typeSelectionArrayBuffer.domArray
      ]];
    })(),

    ['button', {
      id: 'validValuesSet',
      $on: {
        click () {
          dialogs.alert(Types.validValuesSet({
            form: this.previousElementSibling,
            typeNamespace: 'demo-type-choices-only-initial-value',
            keySelectClass: 'only-initial'
          }));
        }
      }
    }, [
      'Valid values set?'
    ]],

    ['h2', [
      'Require object'
    ]],
    (() => {
      const typeSelection = typeChoices({
        format: 'structuredCloning',
        typeNamespace: 'demo-type-choices-only',
        autoTrigger: false,
        requireObject: true
      });

      return ['form', {
        id: 'requireObject',
        $on: {
          /* istanbul ignore next -- Guard */
          submit (e) {
            /* istanbul ignore next -- Guard */
            e.preventDefault();
          }
        }
      }, [
        ...typeSelection.domArray
      ]];
    })(),

    ['h2', [
      'Convert arbitrary value to an editable menu'
    ]],

    await types.getControlsForFormatAndValue(
      'structuredCloning',
      new Date('1999-01-01')
    ),

    ['h2', [
      'Convert arbitrary value to a readonly menu'
    ]],

    await types.getControlsForFormatAndValue(
      'structuredCloning',
      new Date('1999-01-01'), {
        readonly: true
      }
    ),

    ['h2', [
      'Convert structured cloning string representation to value and log'
    ]],
    ['input', {
      id: 'getValueForString',
      placeholder: 'e.g., ["abc", 17]',
      $on: {
        change () {
          const types = new Types();
          const value = types.getValueForString(this.value, {
            format: $('#useIndexedDBKey').checked
              ? 'indexedDBKey'
              : 'structuredCloning'
          })[0];
          console.log(value);
        }
      }
    }],

    (() => {
      return ['form', {
        $on: {
          submit (e) {
            e.preventDefault();
          }
        }
      }, [
        ['button', {
          id: 'attemptBadIndexedDBKey',
          $on: {
            click () {
              const badDate = new Date('Bad date');
              const tc = typeChoices({
                format: 'indexedDBKey',
                setValue: true,
                value: [badDate],
                typeNamespace: 'demo-type-choices-only-initial-value'
              });
              jml('div', tc.domArray, body);
            }
          }
        }, [
          'Attempt bad indexedDBKey (invalid Date)'
        ]],
        ['button', {
          id: 'attemptBadIndexedDBKeyStringObject',
          $on: {
            click () {
              const tc = typeChoices({
                format: 'indexedDBKey',
                setValue: true,
                // eslint-disable-next-line no-new-wrappers, unicorn/new-for-builtins -- Testing
                value: [new String('Bad value')],
                typeNamespace: 'demo-type-choices-only-initial-value'
              });
              jml('div', tc.domArray, body);
            }
          }
        }, [
          'Attempt bad indexedDBKey (String object)'
        ]],
        ['button', {
          id: 'attemptBadJSON',
          $on: {
            click () {
              const tc = typeChoices({
                format: 'json',
                setValue: true,
                // eslint-disable-next-line no-sparse-arrays -- Testing
                value: [,],
                typeNamespace: 'demo-type-choices-only-initial-value'
              });
              jml('div', tc.domArray, body);
            }
          }
        }, [
          'Attempt bad JSON (sparse array)'
        ]]
      ]];
    })(),

    ['label', [
      'Use indexedDBKey (valid dates only)',
      ['input', {
        id: 'useIndexedDBKey',
        type: 'checkbox'
      }]
    ]]
  ], body);
}, 500);
