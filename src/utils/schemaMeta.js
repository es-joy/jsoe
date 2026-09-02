import {jml} from '../vendor-imports.js';

/**
 * @typedef {import('../formats/schema.js').ZodexSchema} ZodexSchema
 */

/**
 * Metadata keys with dedicated handling; everything else on `meta` (other than
 *   the reserved `jsoe` directive namespace) is treated as custom metadata.
 * @type {Set<string>}
 */
const RESERVED = new Set(['title', 'description', 'id', 'deprecated']);

/**
 * @param {unknown} val
 * @returns {string}
 */
function stringifyMetaValue (val) {
  return typeof val === 'string' ? val : JSON.stringify(val);
}

/**
 * Normalize the metadata carried on a serialized (zerialized) schema object,
 *   merging the legacy top-level `description` into the `meta` bag and applying
 *   jsoe's precedence rules.
 *
 * Precedence for the visible label is `meta.title` then `meta.description`
 *   then the top-level `description` (the last kept only while `.description`
 *   directly on a schema remains supported). `meta.description` is treated as
 *   tooltip-only long-form text only when `meta.title` is also present;
 *   otherwise it is already serving as the label.
 * @param {ZodexSchema} [schemaObject]
 * @returns {{
 *   label: string|undefined,
 *   longText: string|undefined,
 *   id: string|undefined,
 *   deprecated: boolean|string|undefined,
 *   custom: [string, unknown][],
 *   jsoe: {[key: string]: unknown}|undefined,
 *   rows: [string, string][],
 *   hasAny: boolean
 * }}
 */
export function resolveSchemaMeta (schemaObject) {
  const obj = schemaObject && typeof schemaObject === 'object'
    ? /** @type {{[key: string]: any}} */ (schemaObject)
    : undefined;
  const metaObj = obj && obj.meta && typeof obj.meta === 'object'
    ? /** @type {{[key: string]: any}} */ (obj.meta)
    : undefined;

  const topDescription = typeof obj?.description === 'string'
    ? obj.description
    : undefined;
  const metaTitle = typeof metaObj?.title === 'string'
    ? metaObj.title
    : undefined;
  const metaDescription = typeof metaObj?.description === 'string'
    ? metaObj.description
    : undefined;
  const id = typeof metaObj?.id === 'string' ? metaObj.id : undefined;
  const deprecated = typeof metaObj?.deprecated === 'boolean' ||
    typeof metaObj?.deprecated === 'string'
    ? metaObj.deprecated
    : undefined;
  const jsoe = metaObj && metaObj.jsoe && typeof metaObj.jsoe === 'object'
    ? /** @type {{[key: string]: unknown}} */ (metaObj.jsoe)
    : undefined;

  /** @type {[string, unknown][]} */
  const custom = metaObj
    ? Object.entries(metaObj).filter(([key]) => {
      return !RESERVED.has(key) && key !== 'jsoe';
    })
    : [];

  const label = metaTitle ?? metaDescription ?? topDescription;
  const longText = metaTitle ? metaDescription : undefined;

  /** @type {[string, string][]} */
  const rows = [];
  if (metaTitle) {
    rows.push(['Title', metaTitle]);
  }
  // Keep the table self-describing even when the description doubles as the
  //   label (no `meta.title`).
  const rowDescription = metaDescription ?? topDescription;
  if (rowDescription) {
    rows.push(['Description', rowDescription]);
  }
  if (id !== undefined) {
    rows.push(['ID', id]);
  }
  if (deprecated !== undefined && deprecated !== false) {
    rows.push([
      'Deprecated', deprecated === true ? 'yes' : String(deprecated)
    ]);
  }
  for (const [key, val] of custom) {
    rows.push([key, stringifyMetaValue(val)]);
  }
  if (jsoe) {
    for (const [key, val] of Object.entries(jsoe)) {
      rows.push([`jsoe.${key}`, stringifyMetaValue(val)]);
    }
  }

  return {
    label, longText, id, deprecated, custom, jsoe, rows,
    hasAny: rows.length > 0
  };
}

/**
 * Terse call-site sugar for the visible label of a (sub)schema. Returns
 *   `undefined` when the schema carries no usable metadata, so callers keep
 *   their own `?? fallback`.
 * @param {ZodexSchema} [schemaObject]
 * @returns {string|undefined}
 */
export function schemaLabel (schemaObject) {
  return resolveSchemaMeta(schemaObject).label;
}

/**
 * Whether a (sub)schema is marked deprecated via `meta.deprecated`.
 * @param {ZodexSchema} [schemaObject]
 * @returns {boolean}
 */
export function isDeprecated (schemaObject) {
  const {deprecated} = resolveSchemaMeta(schemaObject);
  return deprecated !== undefined && deprecated !== false;
}

/**
 * ` schema-deprecated` (leading space) when the schema is deprecated, else `''`
 * — for appending to an existing `class` string.
 * @param {ZodexSchema} [schemaObject]
 * @returns {string}
 */
export function deprecatedClassSuffix (schemaObject) {
  return isDeprecated(schemaObject) ? ' schema-deprecated' : '';
}

/**
 * The last element child of `el` that is not the appended schema-metadata
 * affordance. Use this in place of `el.lastElementChild` wherever a type root
 * is walked from its end, since `appendSchemaMeta` adds a trailing
 * `span.schema-meta`.
 * @param {Element} el
 * @returns {Element|null}
 */
export function lastTypeChild (el) {
  let child = el.lastElementChild;
  while (child && child.classList.contains('schema-meta')) {
    child = child.previousElementSibling;
  }
  return child;
}

/**
 * @param {[string, string][]} rows
 * @returns {string}
 */
export function metaTooltipText (rows) {
  return rows.map(([key, val]) => {
    return `${key}: ${val}`;
  }).join('\n');
}

/**
 * @param {[string, string][]} rows
 * @returns {import('jamilih').JamilihArray}
 */
export function metaTable (rows) {
  return ['table', {class: 'schema-meta-table'}, [
    ['tbody', rows.map(([key, val]) => {
      return ['tr', [['th', [key]], ['td', [val]]]];
    })]
  ]];
}

/**
 * Build the read-only metadata affordance (an info toggle that reveals a
 *   key/value table) and append it to a type's root element. A no-op when the
 *   schema carries no surfaced metadata.
 *
 * The table is created lazily on first toggle, so an untouched affordance adds
 *   no text to the root (the marker glyph comes from CSS, not a text node),
 *   keeping the DOM stable for tests and assistive tech.
 *
 * Rendered in both view and edit mode; it never mutates the schema (jsoe edits
 *   data conforming to a schema, not the schema guiding the session).
 * @param {HTMLElement} root
 * @param {ZodexSchema} [schemaObject]
 * @returns {void}
 */
export function appendSchemaMeta (root, schemaObject) {
  const meta = resolveSchemaMeta(schemaObject);
  if (!meta.hasAny) {
    return;
  }
  if (meta.deprecated !== undefined && meta.deprecated !== false) {
    root.classList.add('schema-deprecated');
  }
  /**
   * @param {Event} e
   * @returns {void}
   */
  const onToggle = (e) => {
    e.preventDefault();
    const toggle = /** @type {HTMLElement} */ (
      /** @type {HTMLElement} */ (e.target).closest('.schema-meta-toggle')
    );
    let tbl = /** @type {HTMLElement|null} */ (toggle.nextElementSibling);
    const show = !tbl || tbl.hidden;
    if (!tbl) {
      tbl = /** @type {HTMLElement} */ (jml(...metaTable(meta.rows)));
      /** @type {HTMLElement} */ (toggle.parentElement).append(tbl);
    }
    tbl.hidden = !show;
    toggle.setAttribute('aria-expanded', String(show));
  };

  /**
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  const onKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onToggle(e);
    }
  };

  // A `span[role=button]` rather than a real `<button>` so bare `getInput`
  //   selectors (`$e(root, 'button')` in `arrayType`/`noneditable`) never
  //   mistake the toggle for the type's own form control.
  const affordanceSpec = /** @type {import('jamilih').JamilihArray} */ ([
    'span', {class: 'schema-meta'}, [
      ['span', {
        class: 'schema-meta-toggle',
        role: 'button',
        tabindex: '0',
        'aria-expanded': 'false',
        'aria-label': 'Schema metadata',
        title: metaTooltipText(meta.rows),
        $on: {click: onToggle, keydown: onKeydown}
      }]
    ]
  ]);
  // Appended last (not prepended): tests and internal code select the type's
  //   label via `root > span` / `root > *:first-child`, so the affordance must
  //   not become the first child. The few `arrayType` helpers that walk
  //   `root.lastElementChild` use `lastTypeChild()` to skip a trailing
  //   `.schema-meta`.
  root.append(/** @type {HTMLElement} */ (jml(...affordanceSpec)));
}
