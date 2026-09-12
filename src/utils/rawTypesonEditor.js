import dialogs from './dialogs.js';
import {$e, DOM} from './templateUtils.js';
import {
  Typeson, JSON6, EditorView, basicSetup, EditorState,
  javascript, toStringTag
} from '../vendor-imports.js';
import {structuredCloningJsoe} from '../formats/structuredCloning.js';
import {parseValue} from '../formats/schema.js';

/**
 * @returns {import('typeson').Typeson}
 */
const buildTypeson = () => {
  return new Typeson().register(structuredCloningJsoe);
};

const identifierKeyRegex = (/^[A-Za-z_$][\w$]*$/u);

/** @type {ReadonlySet<string>} */
const typedArrayTagNames = new Set([
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
  'Uint16Array', 'Int32Array', 'Uint32Array', 'Float16Array',
  'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'
]);

/** @type {ReadonlySet<string>} */
const errorTagNames = new Set([
  'Error', 'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError',
  'EvalError', 'URIError', 'AggregateError'
]);

/**
 * Base64-encodes raw bytes, chunked so a large buffer doesn't blow the
 *   argument-count limit `String.fromCodePoint(...bytes)` would hit spread
 *   over the whole thing at once.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
const bytesToBase64 = (bytes) => {
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCodePoint(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

/**
 * A minimal JSON6-*subset* stringifier: unquotes object keys that are valid
 *   identifiers (for the "simplified" display the JSON6 mode is meant to
 *   give), while always fully quoting string *values* via `JSON.stringify`.
 *
 *   `JSON6.stringify` (from the `json-6` package) was tried first but has a
 *   real bug: it runs the same identifier-unquoting logic it uses for keys
 *   on string *values* too, so e.g. the value `"hello"` is emitted as the
 *   bare word `hello` — not valid JS/JSON6 syntax as a value, and not even
 *   re-parseable by the package's own `JSON6.parse`. Hand-rolling this
 *   avoids depending on that broken path while still using `JSON6.parse`
 *   (which is correct) to read the text back after editing.
 * @param {unknown} value
 * @param {string} indent
 * @param {string} curIndent
 * @returns {string}
 */
const stringifyJSON6 = (value, indent, curIndent) => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  const nextIndent = curIndent + indent;
  if (Array.isArray(value)) {
    if (!value.length) {
      return '[]';
    }
    const items = value.map((item) => {
      return `${nextIndent}${stringifyJSON6(item, indent, nextIndent)}`;
    });
    return `[\n${items.join(',\n')}\n${curIndent}]`;
  }
  const keys = Object.keys(value);
  if (!keys.length) {
    return '{}';
  }
  const items = keys.map((key) => {
    const keyText = identifierKeyRegex.test(key)
      ? key
      : JSON.stringify(key);
    return `${nextIndent}${keyText}: ${
      stringifyJSON6(
        /** @type {{[key: string]: unknown}} */ (value)[key], indent,
        nextIndent
      )
    }`;
  });
  return `{\n${items.join(',\n')}\n${curIndent}}`;
};

/**
 * Builds the Typeson/JSON6 text shown by both the view-mode "View raw"
 *   button and, seeded, the edit-mode "Edit raw" button's Typeson mode.
 * @param {unknown} value
 * @returns {Promise<string>}
 */
export async function getTypesonTextForValue (value) {
  const typeson = buildTypeson();
  // `throwOnBadSyncType: false` matches `../formats/structuredCloning.js`'s
  //   own `encapsulateAsync` call: without it, Typeson throws when a value
  //   has no actually-async parts (no Blob/File/Promise) and so resolves
  //   synchronously despite the "Async" method having been called.
  const encapsulated = await typeson.encapsulateAsync(value, null, {
    throwOnBadSyncType: false
  });
  return stringifyJSON6(encapsulated, '  ', '');
}

/**
 * Reverses `getTypesonTextForValue`: parses JSON6 (superset) syntax and
 *   revives any Typeson-tagged values back into real JS values.
 * @param {string} text
 * @returns {unknown}
 */
export function getValueForTypesonText (text) {
  const typeson = buildTypeson();
  const parsed = JSON6.parse(text);
  return typeson.revive(parsed);
}

/**
 * Only ever called when `types.allowUnsafeEval` is true. The whole point of
 *   eval mode is that the user's text is a plain JS expression (e.g.
 *   `{a: new Date()}`) that already evaluates to the real value directly;
 *   this never touches Typeson, unlike `getValueForTypesonText`.
 * @param {string} text
 * @returns {unknown}
 */
export function getValueForEvalText (text) {
  // User explicitly opted in via the `allowUnsafeEval` constructor option;
  //   same rationale as `functionSpec.revive` in
  //   `../formats/structuredCloning.js`.
  // eslint-disable-next-line no-eval -- User opted in
  return (0, eval)('(' + text + ')');
}

/**
 * Base64-encodes a `Blob`/`File`'s content — the one genuinely asynchronous
 *   part of eval-mode seeding, since reading a `Blob`'s bytes always returns
 *   a promise (unlike `ArrayBuffer`/typed-array bytes, already in memory).
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
const blobToBase64 = async (blob) => {
  return bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
};

/**
 * A dedicated serializer for seeding the editor's text when switching into
 *   eval mode. Deliberately does **not** reuse `getTypesonTextForValue`'s
 *   output: that form tags special values (e.g. a `Date` becomes an ISO
 *   string plus a `$types` entry), and evaluating that tagged text verbatim
 *   would hand back the plain tagged object, not a real `Date` — eval mode
 *   has no revive step to undo the tagging. This instead emits genuine JS
 *   constructor source for the same value.
 *
 *   Async because a `Blob`/`File`'s content can only be read
 *   asynchronously (`Blob#arrayBuffer()`); every other branch is
 *   synchronous work wrapped in a resolved promise.
 * @param {unknown} value
 * @param {Set<unknown>} [seen] Tracks objects already being serialized, to
 *   fail clearly on a cyclic value rather than recursing forever.
 * @returns {Promise<string>}
 */
export async function getEvalSeedTextForValue (value, seen = new Set()) {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  switch (typeof value) {
  case 'string':
    return JSON.stringify(value);
  case 'number':
    // `String(-0)` is `"0"`, silently losing the sign; matches the
    //   convention already used by `../superTypes/SpecialNumberType.js`.
    return Object.is(value, -0) ? '-0' : String(value);
  case 'boolean':
    return String(value);
  case 'bigint':
    return `${value}n`;
  case 'function':
    // Mirrors `functionSpec.replace` in `../formats/structuredCloning.js`.
    return value.toString();
  default:
    break;
  }
  const tag = toStringTag(value);
  if (tag === 'Symbol') {
    // Mirrors `src/fundamentalTypes/symbolType.js`'s own convention
    //   (`String(value).slice(7, -1)` rather than `.description`, which
    //   would be `undefined` for `Symbol()` with no description).
    const sym = /** @type {symbol} */ (value);
    const key = Symbol.keyFor(sym);
    return key === undefined
      ? `Symbol(${JSON.stringify(String(sym).slice(7, -1))})`
      : `Symbol.for(${JSON.stringify(key)})`;
  }
  if (tag === 'Date') {
    return `new Date(${
      JSON.stringify(/** @type {Date} */ (value).toISOString())
    })`;
  }
  if (tag === 'RegExp') {
    return value.toString();
  }
  // Boxed primitives (`new String(...)`/`new Number(...)`/`new Boolean(...)`
  //   — distinct from the plain-primitive `string`/`number`/`boolean` cases
  //   in the `switch` above, which never reach here).
  if (tag === 'String') {
    const boxed = /** @type {{valueOf: () => string}} */ (value);
    return `new String(${JSON.stringify(boxed.valueOf())})`;
  }
  if (tag === 'Number') {
    const boxed = /** @type {{valueOf: () => number}} */ (value);
    return `new Number(${boxed.valueOf()})`;
  }
  if (tag === 'Boolean') {
    const boxed = /** @type {{valueOf: () => boolean}} */ (value);
    return `new Boolean(${boxed.valueOf()})`;
  }
  if (tag === 'BigInt') {
    // Matches typeson-registry's own `bigintObject` revive:
    //   `new Object(BigInt(e))`.
    const boxed = /** @type {{valueOf: () => bigint}} */ (value);
    return `Object(${boxed.valueOf()}n)`;
  }
  if (tag === 'DOMException') {
    const exc = /** @type {DOMException} */ (value);
    return `new DOMException(${JSON.stringify(exc.message)}, ${
      JSON.stringify(exc.name)
    })`;
  }
  // Matches `src/superTypes/domrectType.js`/`dompointType.js`, which support
  //   both the read-write and read-only variant under the same base type.
  if (tag === 'DOMRect' || tag === 'DOMRectReadOnly') {
    const r = /** @type {DOMRect} */ (value);
    return `new ${tag}(${r.x}, ${r.y}, ${r.width}, ${r.height})`;
  }
  if (tag === 'DOMPoint' || tag === 'DOMPointReadOnly') {
    const p = /** @type {DOMPoint} */ (value);
    return `new ${tag}(${p.x}, ${p.y}, ${p.z}, ${p.w})`;
  }
  if (tag === 'DOMMatrix' || tag === 'DOMMatrixReadOnly') {
    // Matches `src/superTypes/dommatrixType.js`'s own two constructor forms.
    const m = /** @type {DOMMatrix} */ (value);
    const nums = m.is2D
      ? [m.a, m.b, m.c, m.d, m.e, m.f]
      : [
        m.m11, m.m12, m.m13, m.m14,
        m.m21, m.m22, m.m23, m.m24,
        m.m31, m.m32, m.m33, m.m34,
        m.m41, m.m42, m.m43, m.m44
      ];
    return `new ${tag}([${nums.join(', ')}])`;
  }
  if (tag === 'ArrayBuffer' || tag === 'DataView' ||
    typedArrayTagNames.has(tag)
  ) {
    // Unlike `Blob`/`File`, a buffer's bytes are already in memory — no
    //   async read needed, just the same base64 wrapping.
    const bytes = tag === 'ArrayBuffer'
      ? new Uint8Array(/** @type {ArrayBuffer} */ (value))
      : new Uint8Array(
        /** @type {{buffer: ArrayBuffer, byteOffset: number, byteLength: number}} */
        (value).buffer,
        /** @type {{byteOffset: number}} */ (value).byteOffset,
        /** @type {{byteLength: number}} */ (value).byteLength
      );
    const bufferExpr = `Uint8Array.from(atob(${
      JSON.stringify(bytesToBase64(bytes))
    }), (c) => c.charCodeAt(0)).buffer`;
    if (tag === 'ArrayBuffer') {
      return bufferExpr;
    }
    return `new ${tag}(${bufferExpr})`;
  }
  if (tag === 'Blob' || tag === 'File') {
    const blob = /** @type {Blob} */ (value);
    const base64 = await blobToBase64(blob);
    const bytesExpr = `Uint8Array.from(atob(${
      JSON.stringify(base64)
    }), (c) => c.charCodeAt(0))`;
    if (tag === 'File') {
      const file = /** @type {File} */ (value);
      return `new File([${bytesExpr}], ${JSON.stringify(file.name)}, ${
        JSON.stringify({type: file.type, lastModified: file.lastModified})
      })`;
    }
    return `new Blob([${bytesExpr}], ${JSON.stringify({type: blob.type})})`;
  }
  if (tag === 'Promise') {
    // A pending/rejected/already-settled `Promise` has no meaningful static
    //   literal form; unlike the lossy fallback below, this is a value shape
    //   we recognize but have deliberately chosen not to support.
    throw new TypeError(
      'Eval mode cannot represent a Promise as JS source; use the Typeson ' +
      '(JSON6) mode instead.'
    );
  }
  if (seen.has(value)) {
    throw new Error(
      'Eval mode cannot represent a cyclic/repeated-reference value as ' +
      'JS source; use the Typeson (JSON6) mode instead.'
    );
  }
  seen.add(value);
  try {
    if (tag === 'FileList' || Array.isArray(value)) {
      // jsoe's own `filelist` control never actually requires a genuine
      //   `instanceof FileList` for its value model (see
      //   `docs/proposals/raw-typeson-edit-view.md` §1) — a plain array of
      //   `File`s round-trips the same way, so no special construct needed.
      let arr;
      if (tag === 'FileList') {
        const fileList = /** @type {Iterable<unknown>} */ (value);
        arr = [...fileList];
      } else {
        arr = /** @type {unknown[]} */ (value);
      }
      const items = await Promise.all(
        arr.map((item) => getEvalSeedTextForValue(item, seen))
      );
      return `[${items.join(', ')}]`;
    }
    if (tag === 'Map') {
      const map = /** @type {Map<unknown, unknown>} */ (value);
      // Not using `Iterator#toArray()`: not yet baseline-widely-available
      // eslint-disable-next-line unicorn/prefer-iterator-to-array -- Above
      const entries = await Promise.all([...map.entries()].map(
        async ([k, v]) => {
          return `[${await getEvalSeedTextForValue(k, seen)}, ${
            await getEvalSeedTextForValue(v, seen)
          }]`;
        }
      ));
      return `new Map([${entries.join(', ')}])`;
    }
    if (tag === 'Set') {
      const set = /** @type {Set<unknown>} */ (value);
      const items = await Promise.all(
        [...set].map((item) => getEvalSeedTextForValue(item, seen))
      );
      return `new Set([${items.join(', ')}])`;
    }
    if (tag === 'Error') {
      // `Object.prototype.toString` reports every `Error` subclass as
      //   `[object Error]` (an `[[ErrorData]]`-slot check, not a
      //   `Symbol.toStringTag` lookup), so `tag` alone can't tell a
      //   `TypeError` from a plain `Error` here — recover the real
      //   constructor name, falling back to `Error` for a subclass eval
      //   mode doesn't know how to name-construct (e.g. a user-defined
      //   `class MyError extends Error {}`).
      const err = /**
                   * @type {Error & {
                   *   cause?: unknown, fileName?: string, lineNumber?: number,
                   *   columnNumber?: number
                   * }}
                   */ (value);
      const ctorName = errorTagNames.has(err.constructor?.name)
        ? err.constructor.name
        : 'Error';
      const messageExpr = JSON.stringify(err.message);
      const optionsExpr = err.cause === undefined
        ? ''
        : `, {cause: ${await getEvalSeedTextForValue(err.cause, seen)}}`;
      const ctorExpr = ctorName === 'AggregateError'
        ? `new AggregateError([${
          (await Promise.all(
            /** @type {AggregateError} */ (err).errors.map(
              (e) => getEvalSeedTextForValue(e, seen)
            )
          )).join(', ')
        }], ${messageExpr}${optionsExpr})`
        : `new ${ctorName}(${messageExpr}${optionsExpr})`;
      // `name`/`fileName`/`lineNumber`/`columnNumber`/`stack` aren't
      //   constructor arguments — set via `Object.assign`, which (unlike a
      //   sequence of statements) still keeps this a single expression.
      const extraProps = [];
      if (typeof err.name === 'string') {
        extraProps.push(`name: ${JSON.stringify(err.name)}`);
      }
      if (typeof err.fileName === 'string') {
        extraProps.push(`fileName: ${JSON.stringify(err.fileName)}`);
      }
      if (typeof err.lineNumber === 'number') {
        extraProps.push(`lineNumber: ${err.lineNumber}`);
      }
      if (typeof err.columnNumber === 'number') {
        extraProps.push(`columnNumber: ${err.columnNumber}`);
      }
      if (typeof err.stack === 'string') {
        extraProps.push(`stack: ${JSON.stringify(err.stack)}`);
      }
      return extraProps.length
        ? `Object.assign(${ctorExpr}, {${extraProps.join(', ')}})`
        : ctorExpr;
    }
    if (typeof value === 'object') {
      // Anything reaching here that isn't a plain object literal (a class
      //   instance with a non-`Object.prototype` prototype) can't be
      //   faithfully reconstructed by the `{...}` literal below — better to
      //   fail clearly than silently emit a same-shaped-but-wrong plain
      //   object (losing the value's real identity/behavior entirely).
      const proto = Object.getPrototypeOf(value);
      if (proto !== null && proto !== Object.prototype) {
        // `toStringTag` reports a generic `Object` for most user-defined
        //   classes (no `Symbol.toStringTag` of their own), so name the
        //   error after the actual constructor instead where possible.
        const ctor = /** @type {{constructor?: {name?: string}}} */ (
          value
        ).constructor;
        throw new TypeError(
          `Eval mode cannot represent a ${
            ctor?.name || tag || 'non-plain-object'
          } value as JS source; use the Typeson (JSON6) mode instead.`
        );
      }
      const entries = await Promise.all(
        Object.entries(value).map(async ([k, v]) => {
          const key = (/^[A-Za-z_$][\w$]*$/u).test(k) ? k : JSON.stringify(k);
          return `${key}: ${await getEvalSeedTextForValue(v, seen)}`;
        })
      );
      return `{${entries.join(', ')}}`;
    }
    /* istanbul ignore next -- No other `typeof` reaches here */
    return String(value);
  } finally {
    seen.delete(value);
  }
}

/**
 * Repopulates an existing object/array/set/map/filelist control's children
 *   in place after a raw-value edit. Object/array-family type objects have
 *   no `setValue` of their own (`types.setValue` is a no-op for them, as
 *   only leaf types implement it) — their children are always attached one
 *   at a time via `$addAndSetArrayElement`, driven by walking a Typeson
 *   `encapsulateAsync` pass. This reuses that exact mechanism, scoped to
 *   just this container, by pre-seeding `stateObj.rootUI` with the existing
 *   `root` element (see the corresponding change in
 *   `../formats/structuredCloning.js`'s `encapsulateObserver`, which reuses
 *   a pre-seeded root instead of building a new one).
 *
 *   The control's own root element is kept (not replaced), since other code
 *   may already hold a reference to it (most importantly, the root control
 *   of the whole form). The container's own `itemIndex`/legend-numbering
 *   counter, closed over since the control was first built, is reset via
 *   `root.$resetItemIndex()` right after its old children are cleared and
 *   before the new ones are attached, back to the same baseline the
 *   container started at when first built — so the repopulated items (and
 *   any later manually-added one, via "+ Item") end up numbered exactly as
 *   a fresh container holding the same new items would be, rather than
 *   continuing from wherever the replaced content had left off.
 * @param {object} cfg
 * @param {InstanceType<typeof import('../types.js').default>} cfg.types
 * @param {import('../formats.js').AvailableFormat} cfg.format
 * @param {import('../types.js').AvailableArbitraryType} cfg.type
 * @param {HTMLDivElement} cfg.root
 * @param {HTMLDivElement} cfg.topRoot
 * @param {string} [cfg.typeNamespace]
 * @param {import('zodexy').SzType} [cfg.specificSchemaObject]
 * @param {unknown} cfg.value
 * @returns {Promise<void>}
 */
export async function commitValueToContainer ({
  types, format, type, root, topRoot, typeNamespace, specificSchemaObject,
  value
}) {
  const {formats} = types;
  const rootWithCustomMethods = /**
                                 * @type {{
                                 *   $getArrayItems: () => HTMLElement,
                                 *   $resetItemIndex: () => void
                                 * }}
                                 */ (/** @type {unknown} */ (root));
  DOM.removeChildren(rootWithCustomMethods.$getArrayItems());
  rootWithCustomMethods.$resetItemIndex();
  const stateObj = /** @type {import('../types.js').StateObject} */ ({
    types,
    formats,
    format,
    typeNamespace,
    readonly: false,
    // This container's own schema stands in as the "whole record" schema
    //   for this scoped re-population, mirroring how the overall document
    //   schema drives the very first `getControlsForFormatAndValue` call.
    schemaContent: specificSchemaObject,
    rootUI: root
  });
  await formats.getAvailableFormat(format).iterate(value, stateObj);
  await stateObj.whenBuilt;
  if (stateObj.error) {
    throw stateObj.error;
  }
  types.validate({type, root, topRoot, avoidReport: false});
}

/**
 * Builds and shows the modal for the "View raw"/"Edit raw" buttons added to
 *   every eligible object/array-family control in
 *   `../fundamentalTypes/arrayType.js`.
 * @param {object} cfg
 * @param {InstanceType<typeof import('../types.js').default>} cfg.types
 * @param {import('../formats.js').AvailableFormat} cfg.format
 * @param {import('../types.js').AvailableArbitraryType} cfg.type
 * @param {HTMLDivElement} cfg.root
 * @param {HTMLDivElement} cfg.topRoot
 * @param {string} [cfg.typeNamespace]
 * @param {import('zodexy').SzType} [cfg.specificSchemaObject]
 * @param {boolean} cfg.readonly
 * @returns {Promise<void>}
 */
export async function openRawEditorDialog ({
  types, format, type, root, topRoot, typeNamespace, specificSchemaObject,
  readonly
}) {
  const {formats} = types;
  const value = types.getValueForRoot(
    /** @type {any} */ (root),
    /** @type {import('../types.js').StateObject} */ ({
      typeNamespace, formats, format, types
    }),
    ''
  );

  /** @type {'typeson'|'eval'} */
  let mode = 'typeson';

  // Declared before assignment (rather than `const`) since it is referenced
  //   by closures defined further up, before the dialog (and so the mount
  //   point `view` is assigned into) exists.
  /** @type {import('codemirror').EditorView} */
  // eslint-disable-next-line prefer-const -- See comment above
  let view;

  const errorClass = 'jsoe-raw-editor-error';
  const editorClass = 'jsoe-raw-editor';

  /**
   * @param {HTMLElement} dialog
   * @param {string} message
   * @returns {void}
   */
  const showError = (dialog, message) => {
    const errorEl = /** @type {HTMLElement} */ ($e(dialog, `.${errorClass}`));
    errorEl.textContent = message;
  };

  /**
   * @param {string} text
   * @returns {void}
   */
  const setText = (text) => {
    view.dispatch({
      changes: {from: 0, to: view.state.doc.length, insert: text}
    });
  };

  const seedTextForMode = async () => {
    return mode === 'eval'
      ? await getEvalSeedTextForValue(value)
      : await getTypesonTextForValue(value);
  };

  const initialText = readonly
    ? await getTypesonTextForValue(value)
    : await seedTextForMode();

  /** @type {import('jamilih').JamilihArray[]} */
  const children = [
    ['div', {class: errorClass, role: 'alert'}],
    ...(!readonly && types.allowUnsafeEval
      ? /** @type {import('jamilih').JamilihArray[]} */ ([
        ['select', {
          class: 'jsoe-raw-editor-mode',
          $on: {
            async change (/** @type {Event} */ e) {
              mode = /** @type {HTMLSelectElement} */ (
                e.target
              ).value === 'eval'
                ? 'eval'
                : 'typeson';
              try {
                setText(await seedTextForMode());
              } catch (error) {
                setText('');
                showError(
                  /** @type {HTMLElement} */ (
                    /** @type {HTMLSelectElement} */ (e.target).closest(
                      'dialog'
                    )
                  ),
                  /** @type {Error} */ (error).message
                );
              }
            }
          }
        }, [
          ['option', {value: 'typeson'}, ['Typeson (JSON6)']],
          ['option', {value: 'eval'}, ['JS (eval)']]
        ]]
      ])
      : []),
    ['div', {class: editorClass}]
  ];

  const dialog = readonly
    // @ts-expect-error TS bug
    ? dialogs.makeCancelDialog({children})
    : dialogs.makeSubmitDialog({
      submitText: 'Save',
      async submit ({dialog: dlg}) {
        const text = view.state.doc.toString();
        showError(dlg, '');
        let newValue;
        try {
          newValue = mode === 'eval'
            ? getValueForEvalText(text)
            : await getValueForTypesonText(text);
        } catch (error) {
          showError(dlg, /** @type {Error} */ (error).message);
          return;
        }
        if (specificSchemaObject) {
          const result = parseValue(
            types, specificSchemaObject, specificSchemaObject, newValue
          );
          if (!result.success) {
            showError(
              dlg, 'That value does not satisfy this field’s schema.'
            );
            return;
          }
        }
        try {
          await commitValueToContainer({
            types, format, type, root, topRoot, typeNamespace,
            specificSchemaObject, value: newValue
          });
        } catch (error) {
          showError(dlg, /** @type {Error} */ (error).message);
          return;
        }
        dlg.close();
      },
      // @ts-expect-error TS bug
      children
    });

  const editorHost = /** @type {HTMLElement} */ ($e(dialog, `.${editorClass}`));
  view = new EditorView({
    doc: initialText,
    extensions: [
      basicSetup,
      javascript(),
      ...(readonly ? [EditorState.readOnly.of(true)] : [])
    ],
    parent: editorHost
  });
}
