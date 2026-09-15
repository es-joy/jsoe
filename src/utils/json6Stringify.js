const identifierKeyRegex = (/^[A-Za-z_$][\w$]*$/u);

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
export const stringifyJSON6 = (value, indent, curIndent) => {
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
