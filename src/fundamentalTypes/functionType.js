import {$e, $$e} from '../utils/templateUtils.js';
import {jml, parseAcorn} from '../vendor-imports.js';
import {copyObject} from '../utils/objects.js';

const observerMap = new WeakMap();

// See https://github.com/tc39/proposal-regexp-unicode-property-escapes#other-examples
const idRegex =
  String.raw`^(?:[$_\p{ID_Start}])(?:[$_\u200C\u200D\p{ID_Continue}])*$`;

/**
 * @param {{
 *   root: HTMLDivElement,
 *   specificSchemaObject?: import('../formats/schema.js').ZodexSchema
 *   textareas: HTMLTextAreaElement[]
 *   textareaBody: HTMLTextAreaElement
 * }} cfg
 */
const setTooltips = ({root, specificSchemaObject, textareas, textareaBody}) => {
  // Todo: For these `JSON.stringify` calls, might instead use
  //    zodexy->(zod)->zod-to-json-schema instead
  textareaBody.title = `Return type:\n\n${JSON.stringify(
    /** @type {import('zodexy').SzFunction<any, any>} */
    (specificSchemaObject).returns,
    null,
    2
  )}`;
  // eslint-disable-next-line prefer-destructuring -- TS
  const args = /** @type {import('zodexy').SzFunction<any, any>} */
    (specificSchemaObject).args;
  textareas.forEach((textarea, idx) => {
    textarea.title = JSON.stringify(
      args.items[idx] ?? args.rest,
      null,
      2
    );
  });

  if (observerMap.has(root)) {
    return;
  }

  /**
   * @param {Node} node
   */
  const addTitles = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const textarea = /** @type {Element} */ (
      node
    ).querySelector('textarea');
    if (textarea) {
      const textareas = /** @type {HTMLTextAreaElement[]} */ (
        $$e(root, 'textarea')
      ).slice(0, -1);

      // Redo them all, as order may have changed
      textareas.forEach((textarea, idx) => {
        textarea.title = JSON.stringify(
          args.items[idx] ?? args.rest,
          null,
          2
        );
      });
    }
  };

  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type !== 'childList') {
        continue;
      }

      for (const node of mutation.removedNodes) {
        addTitles(node);
      }
      for (const node of mutation.addedNodes) {
        addTitles(node);
      }
    }
  });
  observer.observe(root, {
    attributes: false, childList: true, subtree: true
  });
  observerMap.set(root, observer);
};

/**
 * @typedef {Function} ArbitraryFunction
 */

/**
 * @param {ArbitraryFunction} func
 */
const getArgsAndBodyOfFunction = (func) => {
  const funcStr = String(func);
  const funcStrFull = `(${
    funcStr.trimStart().startsWith('function')
      ? funcStr
      : `function ${funcStr}`
  })`;
  const body = funcStrFull.slice(
    funcStrFull.indexOf('{') + 1, funcStrFull.lastIndexOf('}')
  ).trim();

  const ast = /** @type {import('acorn').ExpressionStatement} */ (
    parseAcorn(funcStrFull, {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }).body[0]
  ).expression;

  const args = /** @type {import('acorn').Identifier[]} */ (
    /** @type {import('acorn').FunctionExpression} */ (
      ast
    ).params
  ).map(({name}) => name.trim());

  return {args, body};
};

/**
 * @param {{
 *   root: HTMLDivElement,
 *   value: import('../types.js').StructuredCloneValue
 *   specificSchemaObject?: import('../formats/schema.js').ZodexSchema
 * }} cfg
 */
const setValueAndTooltips = ({root, value, specificSchemaObject}) => {
  const {args, body} = getArgsAndBodyOfFunction(value);

  // Wait for textareas to be available
  setTimeout(() => {
    let textareas = /** @type {HTMLTextAreaElement[]} */ (
      $$e(root, 'textarea[name$="-string"]')
    );

    const textareaBody = /** @type {HTMLTextAreaElement} */ (textareas.pop());

    args.forEach((_arg, idx) => {
      if (!Object.hasOwn(textareas, idx)) {
        $e(root, '.addArrayElement')?.click();
      }
    });

    setTimeout(() => {
      textareas = /** @type {HTMLTextAreaElement[]} */ (
        $$e(root, 'textarea[name$="-string"]').slice(0, -1)
      );

      if (value) {
        args.forEach((arg, idx) => {
          textareas[idx].value = arg;
        });
        textareaBody.value = body;
      }
      if (specificSchemaObject) {
        setTooltips({root, specificSchemaObject, textareas, textareaBody});
      }
    }, 0);
  }, 0);
};

/**
 * @type {import('../types.js').TypeObject}
 */
const functionType = {
  option: ['function'],
  regexEndings: ['}'],
  stringRegexBegin: /^function\((?<args>[^)]*?)\) \{(?<returns>.*)\}$/u,
  stringRegexEnd: /^\}/u,
  array: true,

  valueMatch (x) {
    return typeof x === 'function';
  },
  toValue (s, rootInfo) {
    const {groups: {
      args, returns
    /* istanbul ignore next -- Should always be found */
    } = {}} = /** @type {RegExpMatchArray} */ (
      /** @type {import('../types.js').RootInfo} */ (rootInfo).match
    );

    // Todo: Either re-use proper acorn parsing here for the `split` or
    //         get rid of acorn

    // eslint-disable-next-line no-new-func -- Needed
    return {value: new Function(...args.split(/\s*,\s*/u), returns)};
  },
  getInput ({root}) {
    return /** @type {HTMLTextAreaElement} */ ($e(root, 'textarea'));
  },
  setValue ({root, value}) {
    setValueAndTooltips({root, value});
  },
  getValue ({root}) {
    const textareas = /** @type {HTMLTextAreaElement[]} */ (
      $$e(root, 'textarea')
    );
    const textareaBody = /** @type {HTMLTextAreaElement} */ (textareas.pop());
    // eslint-disable-next-line no-new-func -- Needed
    return new Function(
      ...textareas.map(({value}) => value.trim()),
      textareaBody.value.trim()
    );
  },
  viewUI ({value, specificSchemaObject}) {
    const {args, body} = getArgsAndBodyOfFunction(value);
    return ['span', {
      dataset: {type: 'function'},
      title: specificSchemaObject?.description ?? '(a function)'
    }, [
      ['b', ['Args']],
      ' ',
      `(${args.join(', ')})`,
      ['br'],
      ['b', ['Body']],
      ' ',
      body
    ]];
  },
  editUI ({
    type, buildTypeChoices, specificSchemaObject,
    topRoot, // schemaContent,
    typeNamespace, value
  }) {
    // We want to allow overriding its descriptions
    const specificSchemaObj = specificSchemaObject
      ? copyObject(specificSchemaObject)
      : undefined;
    const argsTuple = /** @type {import('zodexy').SzFunction<any, any>} */ (
      specificSchemaObj
    )?.args ?? {type: 'tuple', items: [], rest: {type: 'any'}};
    argsTuple.description = '';
    // This `description` not in use, but could support
    if (argsTuple.rest) {
      argsTuple.rest.description = 'Argument';
    }

    const size = argsTuple.items.length;
    const args = /** @type {import('zodexy').SzType} */ (
      {
        type: 'set',
        minSize: size,
        maxSize: argsTuple.rest ? undefined : size,
        value: {
          type: 'string',
          regex: idRegex,
          flags: 'v'
        }
      }
    );

    const div = jml('div', {dataset: {type: 'function'}}, [
      ['b', ['Arguments']],
      ['br'],

      ...(/** @type {import('../typeChoices.js').BuildTypeChoices} */ (
        buildTypeChoices
      )({
        // resultType,
        topRoot: /** @type {HTMLDivElement} */ (topRoot),
        format: 'schema', // We're always supplying a schema
        // schemaOriginal: schemaContent,
        schemaContent: args,
        state: type,
        // itemIndex,
        typeNamespace
      }).domArray),

      ['b', ['Function body']],
      ['br'],
      ...(/** @type {import('../typeChoices.js').BuildTypeChoices} */ (
        buildTypeChoices
      )({
        // resultType,
        topRoot: /** @type {HTMLDivElement} */ (topRoot),
        format: 'schema', // We're always supplying a schema
        // schemaOriginal: schemaContent,
        schemaContent: {type: 'string'},
        state: type,
        // itemIndex,
        typeNamespace
      }).domArray)
    ]);

    if (value) {
      setTimeout(() => {
        setValueAndTooltips({
          root: div,
          value,
          specificSchemaObject
        });
      }, 0);
    } else if (specificSchemaObject) {
      setTimeout(() => {
        setTimeout(() => {
          // Should have some empty textareas by now
          const textareas = /** @type {HTMLTextAreaElement[]} */ (
            $$e(div, 'textarea')
          );
          const textareaBody = /** @type {HTMLTextAreaElement} */ (
            textareas.pop()
          );
          setTooltips({
            root: div, specificSchemaObject, textareas, textareaBody
          });
        }, 0);
      }, 0);
    }

    return [div];
  }
};

export default functionType;
