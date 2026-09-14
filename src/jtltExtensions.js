/**
 * A minimal structural stand-in for the jtlt template `this` context — just
 * the two members these extensions use. Defined locally (rather than
 * imported from jtlt) so this module adds no dependency on jtlt itself;
 * jtlt's own `ContextExtensions` augmentation is a wider, compatible type.
 * `get` mirrors `JSONPathTransformerContext#get(select, wrap)`: a JSONPath
 * query against the current template data (or that data itself when
 * `select` is falsy).
 * @typedef {{
 *   appendOutput: (item: unknown) => unknown,
 *   get: (select: string|undefined, wrap: boolean) => unknown
 * }} JtltExtensionContext
 */

/**
 * The argument object a declarative `{$generateJsoeEditUI: {...}}` /
 * `{$generateJsoeViewUI: {...}}` node supplies, entirely unresolved — see
 * jtlt's own extension-call mechanism (`jsonTemplate.js`'s `runOperation`,
 * jtlt 0.21.0+): jtlt does not interpret any of these keys itself, so
 * resolving `select` (via `this.get`) is this module's own job, not
 * jtlt's. `db`/`store`, when given, name which store's schema should shape
 * the built controls — independent of `select`, since the *value* being
 * edited/viewed and the *store it belongs to* are two separate facts a
 * template may need to supply together (e.g. when a `behavior` reads rows
 * from a store other than the one its own route targets).
 * @typedef {{select: string, db?: string, store?: string}} JsoeUIArgs
 */

/**
 * Builds a `generateJsoeEditUI` / `generateJsoeViewUI` pair, ready to spread
 * into a jtlt `config.extensions` object — see
 * `~/idb-manager/ROUTE-OVERRIDES-PLAN.md` §5 ("idb-manager behavior
 * extensions"). Each function is a jtlt extension called with the
 * declarative node's own argument object, e.g. `{$generateJsoeEditUI:
 * {select: '$.record', db: 'myDb', store: 'myStore'}}` → `this.
 * generateJsoeEditUI({select: '$.record', db: 'myDb', store: 'myStore'})`
 * (or, from the raw-JS override tier, the same call made directly). It
 * resolves `select` itself (`this.get(select, false)`), looks up that
 * store's schema via `getSchemaContent` when `db`/`store` are both given,
 * builds jsoe's own edit/view control tree for the resolved value, and
 * inserts it into the current output itself via `this.appendOutput(...)`
 * — matching jtlt's own `$renderDefault` convention of the extension doing
 * its own insertion rather than returning a value for the interpreter to
 * place.
 *
 * Takes the caller's own `Types` instance rather than constructing one:
 * idb-manager (for example) already has a single, app-wide `Types`
 * instance (`new Types()` in `Router.js`) configured with whatever
 * constructor options it needs, and every control this builds should share
 * that configuration, not a second, independently-configured one.
 * @param {import('./types.js').default} types
 * @param {{
 *   typeNamespace?: string,
 *   getSchemaContent?: (db: string, store: string) => (
 *     import('./formats/schema.js').ZodexSchema | undefined |
 *     Promise<import('./formats/schema.js').ZodexSchema | undefined>
 *   )
 * }} [options] - `typeNamespace` scopes the jsoe-internal type-choice state
 *   so this doesn't collide with unrelated controls the same page builds
 *   elsewhere (see other `getControlsForFormatAndValue` call sites' own
 *   `typeNamespace` values); defaults to `'jtlt'`. `getSchemaContent`, when
 *   given, is called with each call's own `db`/`store` (e.g. wrapping
 *   idb-manager's `Schemas.js` lookup) — resolved fresh per call, so a
 *   single bundle correctly serves a `behavior` that edits/views records
 *   from more than one store, each with its own schema. Omitted (or a
 *   call's `db`/`store` omitted) means no schema — jsoe's controls still
 *   work, inferring type choices from the value alone.
 * @returns {{
 *   generateJsoeEditUI: (
 *     this: JtltExtensionContext, argObject: JsoeUIArgs
 *   ) => Promise<void>,
 *   generateJsoeViewUI: (
 *     this: JtltExtensionContext, argObject: JsoeUIArgs
 *   ) => Promise<void>
 * }}
 */
export default function createJtltExtensions (
  types, {typeNamespace = 'jtlt', getSchemaContent} = {}
) {
  /**
   * @param {boolean} readonly
   * @returns {(
   *   this: JtltExtensionContext, argObject: JsoeUIArgs
   * ) => Promise<void>}
   */
  const buildAndAppend = (readonly) => async function (argObject) {
    const {select, db, store} = argObject;
    const value = this.get(select, false);
    const schemaContent = db !== undefined && store !== undefined &&
      getSchemaContent
      ? await getSchemaContent(db, store)
      : undefined;
    const el = await types.getControlsForFormatAndValue(
      'structuredCloning', value, {readonly, typeNamespace, schemaContent}
    );
    this.appendOutput(el);
  };

  return {
    generateJsoeEditUI: buildAndAppend(false),
    generateJsoeViewUI: buildAndAppend(true)
  };
}
