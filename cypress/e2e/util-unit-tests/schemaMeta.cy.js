import {
  resolveSchemaMeta, schemaLabel, metaTooltipText, metaTable
} from '#jsoe/utils/schemaMeta.js';

/**
 * Cast a plain fixture object to the schema parameter type; fixtures here
 * deliberately include legacy and custom `meta` keys.
 * @param {{[key: string]: any}} o
 * @returns {import('zodexy').SzType}
 */
const sz = (o) => /** @type {import('zodexy').SzType} */ (o);

describe('schemaMeta', function () {
  describe('`resolveSchemaMeta`', function () {
    it('returns nothing for an undefined or bare schema', function () {
      expect(resolveSchemaMeta(undefined).hasAny).to.equal(false);
      expect(resolveSchemaMeta(sz({type: 'string'})).hasAny).to.equal(false);
      expect(resolveSchemaMeta(sz({type: 'string'})).label).to.be.undefined;
    });

    it('treats a legacy top-level `description` as the label', function () {
      const meta = resolveSchemaMeta(sz({type: 'string', description: 'A name'}));
      expect(meta.label).to.equal('A name');
      expect(meta.longText).to.be.undefined;
      expect(meta.hasAny).to.equal(true);
      expect(meta.rows).to.deep.equal([['Description', 'A name']]);
    });

    it('prefers `meta.title` and reserves `meta.description` for long text',
      function () {
        const meta = resolveSchemaMeta(sz({
          type: 'string',
          description: 'A name',
          meta: {title: 'Name', description: 'The full legal name.'}
        }));
        expect(meta.label).to.equal('Name');
        expect(meta.longText).to.equal('The full legal name.');
        expect(meta.rows).to.deep.equal([
          ['Title', 'Name'],
          ['Description', 'The full legal name.']
        ]);
      });

    it('falls back to `meta.description` when there is no `meta.title`',
      function () {
        const meta = resolveSchemaMeta(sz({
          type: 'string', meta: {description: 'Just prose'}
        }));
        expect(meta.label).to.equal('Just prose');
        expect(meta.longText).to.be.undefined;
      });

    it('surfaces `id`, `deprecated`, custom keys and the `jsoe` namespace',
      function () {
        const meta = resolveSchemaMeta(sz({
          type: 'object',
          meta: {
            title: 'Widget',
            id: 'widget',
            deprecated: true,
            'x-unit': 'pixels',
            jsoe: {tableView: true}
          }
        }));
        expect(meta.id).to.equal('widget');
        expect(meta.deprecated).to.equal(true);
        expect(meta.custom).to.deep.equal([['x-unit', 'pixels']]);
        expect(meta.jsoe).to.deep.equal({tableView: true});
        expect(meta.rows).to.deep.equal([
          ['Title', 'Widget'],
          ['ID', 'widget'],
          ['Deprecated', 'yes'],
          ['x-unit', 'pixels'],
          ['jsoe.tableView', 'true']
        ]);
      });

    it('omits a `deprecated: false` row', function () {
      const meta = resolveSchemaMeta(sz({
        type: 'string', meta: {title: 'X', deprecated: false}
      }));
      expect(meta.deprecated).to.equal(false);
      expect(meta.rows).to.deep.equal([['Title', 'X']]);
    });
  });

  describe('`schemaLabel`', function () {
    it('returns the label or undefined', function () {
      expect(
        schemaLabel(sz({type: 'string', meta: {title: 'T'}}))
      ).to.equal('T');
      expect(schemaLabel(sz({type: 'string'}))).to.be.undefined;
    });
  });

  describe('`metaTooltipText`', function () {
    it('joins rows as `key: value` lines', function () {
      expect(metaTooltipText([['Title', 'T'], ['ID', 'i']])).to.equal(
        'Title: T\nID: i'
      );
    });
  });

  describe('`metaTable`', function () {
    it('builds a jamilih table of the rows', function () {
      expect(metaTable([['Title', 'T']])).to.deep.equal([
        'table', {class: 'schema-meta-table'}, [
          ['tbody', [['tr', [['th', ['Title']], ['td', ['T']]]]]]
        ]
      ]);
    });
  });
});
