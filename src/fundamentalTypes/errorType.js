import {error as errorTypesonRegistry} from 'typeson-registry';
import {$e} from '../utils/templateUtils.js';
import {tick} from '../utils/timing.js';
import {jml, toStringTag, hasConstructorOf} from '../vendor-imports.js';

/**
 * @type {import('../types.js').TypeObject}
 */
const errorType = {
  option: ['Error'],
  stringRegex: /^Error\((.*)\)$/u,
  valueMatch (x) {
    return toStringTag(x) === 'Error' &&
      // Exclude special errors to let it be handled elsewhere
      hasConstructorOf(x, Error);
  },
  toValue (s) {
    const obj = JSON.parse(s);
    const errObj = /** @type {{revive: import('typeson-registry').Reviver}} */ (
      errorTypesonRegistry.error
    ).revive(obj, {});
    return {value: errObj};
  },
  getInput ({root}) { // Which one to get here?
    return /** @type {HTMLInputElement} */ ($e(root, 'input:not([type])'));
  },
  setValue ({root, value}) {
    if (typeof value.message === 'string') {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.message:not([type])')
      ).value = value.message;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.message[type=checkbox]')
      ).click();
    }
    if (typeof value.name === 'string') {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.name:not([type])')
      ).value = value.name;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.name[type=checkbox]')
      ).click();
    }
    if (typeof value.fileName === 'string') {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.fileName:not([type])')
      ).value = value.fileName;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.fileName[type=checkbox]')
      ).click();
    }

    if (typeof value.lineNumber === 'number') {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.lineNumber[type=number]')
      ).value = value.lineNumber;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.lineNumber[type=number]')
      ).value = '';
    }

    if (typeof value.columnNumber === 'number') {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.columnNumber[type=number]')
      ).value = value.columnNumber;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.columnNumber[type=number]')
      ).value = '';
    }

    if (typeof value.stack === 'string') {
      /** @type {HTMLTextAreaElement} */ (
        $e(root, 'textarea.stack:not([type])')
      ).value = value.stack;
    } else {
      /** @type {HTMLInputElement} */ (
        $e(root, 'input.stack[type=checkbox]')
      ).click();
    }

    // Return a promise that settles once the deferred `.cause` sub-editor is
    //   built and populated, so callers can await a fully-built subtree.
    return (async () => {
      await tick();
      if (typeof value.cause !== 'object') {
        return;
      }

      /** @type {HTMLElement} */ ($e(root, '.cause')).click();
      await /** @type {import('../types.js').TypeObjectSetValue} */ (
        this.setValue
      )({
        root: /** @type {HTMLDivElement} */ ($e(root, '.causeContents')),
        value: value.cause
      });
    })();
  },
  getValue ({root}) {
    /**
     * @type {{
     *   name: string|undefined,
     *   stack?: string|undefined,
     *   cause?: unknown,
     *   message?: string|undefined
     *   fileName?: string,
     *   lineNumber?: number|undefined,
     *   columnNumber?: number|undefined
     * }}
     */
    let errObj;
    if (/** @type {HTMLInputElement} */ (
      $e(root, 'input.message[type=checkbox]')
    ).checked) {
      const message = /** @type {HTMLInputElement} */ (
        $e(root, 'input.message:not([type])')
      ).value;
      errObj = new Error(message);
    } else {
      // eslint-disable-next-line unicorn/error-message -- User requested
      errObj = new Error();
      errObj.message = undefined; // Force (at least needed for Chrome)
    }
    if (/** @type {HTMLInputElement} */ (
      $e(root, 'input.name[type=checkbox]')
    ).checked) {
      const name = /** @type {HTMLInputElement} */ (
        $e(root, 'input.name:not([type])')
      ).value;
      errObj.name = name;
    } else {
      errObj.name = undefined;
    }
    if (/** @type {HTMLInputElement} */ (
      $e(root, 'input.fileName[type=checkbox]')
    ).checked) {
      const fileName = /** @type {HTMLInputElement} */ (
        $e(root, 'input.fileName:not([type])')
      ).value;
      errObj.fileName = fileName;
    } else {
      errObj.fileName = undefined;
    }
    if (/** @type {HTMLInputElement} */ (
      $e(root, 'input.stack[type=checkbox]')
    ).checked) {
      const stack = /** @type {HTMLTextAreaElement} */ (
        $e(root, 'textarea.stack:not([type])')
      ).value;
      errObj.stack = stack;
    } else {
      errObj.stack = undefined;
    }

    const lineNumber = /** @type {HTMLInputElement} */ (
      $e(root, 'input.lineNumber[type=number]')
    ).value;
    errObj.lineNumber = lineNumber === '' ? undefined : Number(lineNumber);

    const columnNumber = /** @type {HTMLInputElement} */ (
      $e(root, 'input.columnNumber[type=number]')
    ).value;
    errObj.columnNumber = columnNumber === ''
      ? undefined
      : Number(columnNumber);

    const causeContents = /** @type {HTMLDivElement} */ (
      $e(root, '.causeContents')
    );
    if (causeContents.children.length) {
      errObj.cause = this.getValue({
        root: causeContents
      });
    }

    return errObj;
  },
  viewUI (
    {value: o, specificSchemaObject, types, format}
  ) {
    return /** @type {import('jamilih').JamilihArray} */ ([
      'div', {dataset: {type: 'error'}}, [
        ['b', {
          class: 'emphasis',
          title: specificSchemaObject?.description ? '(an Error)' : undefined
        }, [
          specificSchemaObject?.description ?? 'Error'
        ]],
        typeof o.message === 'string'
          ? ['div', [['b', ['Message: ']], ['span', [o.message]]]]
          : [],
        typeof o.name === 'string'
          ? ['div', [['b', ['Name: ']], ['span', [o.name]]]]
          : [],
        typeof o.fileName === 'string'
          ? ['div', [['b', ['File name: ']], ['span', [o.fileName]]]]
          : [],
        typeof o.lineNumber === 'number'
          ? ['div', [['b', ['Line number: ']], ['span', [o.lineNumber]]]]
          : [],
        typeof o.columnNumber === 'number'
          ? ['div', [['b', ['Column number: ']], ['span', [o.columnNumber]]]]
          : [],
        typeof o.stack === 'string'
          ? ['div', [['b', ['Stack: ']], ['span', [o.stack]]]]
          : [],
        ['b', ['Cause: ']], ['div', {class: 'causeHolder'}, [
          ['button', {$on: {click (/** @type {Event} */ e) {
            e.preventDefault();
            const {target} = e;
            const causeContents = /** @type {HTMLDivElement} */ (
              /** @type {HTMLElement} */ (target).nextElementSibling
            );
            causeContents.hidden = !causeContents.hidden;
            /** @type {HTMLElement} */ (
              target
            ).textContent = causeContents.hidden ? '+' : '-';
          }}}, ['-']],
          ['div', {class: 'causeContents'}, [
            o.cause
              ? this.viewUI({
                format,
                value: o.cause,
                types
              })
              : ''
          ]]
        ]]
      ]
    ]);
  },
  editUI ({typeNamespace, types, specificSchemaObject, value = {
    message: '',
    name: '',
    fileName: '',
    lineNumber: '',
    columnNumber: '',
    stack: '',
    cause: undefined
  }}) {
    /**
     * @param {Event} e
     * @this {HTMLInputElement}
     * @returns {void}
     */
    const click = function (e) {
      /** @type {HTMLElement} */ (
        /** @type {HTMLElement} */ (
          this.parentNode
        ).nextElementSibling
      // eslint-disable-next-line @stylistic/space-unary-ops -- TS
      ).hidden = !
      /** @type {HTMLInputElement} */
      (e.target).checked;
    };
    // eslint-disable-next-line consistent-this -- Clearer
    const component = this;

    if (typeof value.cause === 'object') {
      setTimeout(() => {
        /** @type {HTMLElement} */ ($e(
          div, '.cause'
        )).click();
      }, 0);
    }

    const div = jml(
      'div',
      {
        dataset: {type: 'error'},
        title: specificSchemaObject?.description ?? 'Error'
      },
      /** @type {import('jamilih').JamilihChildren} */ ([
        ['div', [
          ['label', [
            'Message? ',
            ['input', {
              class: 'message',
              type: 'checkbox', checked: typeof value.message === 'string',
              $on: {
                click
              }
            }]
          ]],
          ' ',
          ['label', {
            hidden: typeof value.message !== 'string'
          }, [
            'Message ',
            ['input', {
              class: 'message',
              name: `${typeNamespace}-error-message`,
              value: value.message
            }]
          ]]
        ]],
        ['div', [
          ['label', [
            'Name? ',
            ['input', {
              class: 'name',
              type: 'checkbox', checked: typeof value.name === 'string',
              $on: {
                click
              }
            }]
          ]],
          ' ',
          ['label', {
            hidden: typeof value.name !== 'string'
          }, [
            'Name ',
            ['input', {
              class: 'name',
              name: `${typeNamespace}-error-name`,
              value: value.name
            }]
          ]]
        ]],
        ['br'],
        ['div', [
          ['label', [
            'File name? ',
            ['input', {
              class: 'fileName',
              type: 'checkbox', checked: typeof value.fileName === 'string',
              $on: {
                click
              }
            }]
          ]],
          ' ',
          ['label', {
            hidden: typeof value.fileName !== 'string'
          }, [
            'File name ',
            ['input', {
              class: 'fileName',
              name: `${typeNamespace}-error-fileName`,
              value: value.fileName
            }]
          ]]
        ]],
        ['label', [
          'Line number ',
          ['input', {
            class: 'lineNumber',
            name: `${typeNamespace}-error-lineNumber`,
            type: 'number', step: 'any', value: value.lineNumber
          }]
        ]],
        ['br'],
        ['label', [
          'Column number ',
          ['input', {
            class: 'columnNumber',
            name: `${typeNamespace}-error-columnNumber`,
            type: 'number', step: 'any', value: value.columnNumber
          }]
        ]],
        ['div', [
          ['label', [
            'Stack? ',
            ['input', {
              class: 'stack',
              type: 'checkbox', checked: typeof value.stack === 'string',
              $on: {
                click
              }
            }]
          ]],
          ['label', {
            hidden: typeof value.stack !== 'string'
          }, [
            'Stack ',
            ['textarea', {
              class: 'stack',
              name: `${typeNamespace}-error-stack`
            }, [
              value.stack
            ]]
          ]]
        ]],
        ['label', [
          'Cause? ',
          ['input', {
            class: 'cause',
            type: 'checkbox',
            $on: {
              click (e) {
                click.call(/** @type {HTMLInputElement} */ (this), e);
                const causeHolder = /** @type {Element} */ (
                  /** @type {Element} */ (
                    this.parentElement
                  ).nextElementSibling
                );
                const causeContents = $e(causeHolder, '.causeContents');
                if (!causeContents?.children.length) {
                  const editui = component.editUI({
                    typeNamespace,
                    types,
                    value: value.cause
                  });
                  jml(...editui, causeContents);
                }
              }
            }
          }]
        ]],
        ['div', {class: 'causeHolder', hidden: true}, [
          ['label', ['Cause ']],
          ['button', {$on: {click (/** @type {Event} */ e) {
            e.preventDefault();
            const {target} = e;
            const causeContents = /** @type {HTMLDivElement} */ ($e(
              /** @type {HTMLElement} */
              (/** @type {HTMLElement} */ (target).closest('.causeHolder')),
              '.causeContents'
            ));
            causeContents.hidden = !causeContents.hidden;
            /** @type {HTMLElement} */ (
              target
            ).textContent = causeContents.hidden ? '+' : '-';
          }}}, ['-']],
          ['div', {class: 'causeContents'}]
        ]]
      ])
    );

    return [div];
  }
};

export default errorType;
