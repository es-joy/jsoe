import {regexes, z} from 'zod';
import {$e} from '../utils/templateUtils.js';

const cidrv6Schema = z.cidrv6();

/**
 * @type {import('../types.js').TypeObject}
 */
const stringType = {
  option: ['String'],
  stringRegex: /^"(?:[^\\"]|\\\\|\\")*"$/u,
  valueMatch (x) {
    return typeof x === 'string';
  },
  toValue (s) {
    return {value: s.slice(1, -1)};
  },
  getInput ({root}) {
    return /** @type {HTMLTextAreaElement} */ (
      $e(root, '[data-type="string"] > textarea,input,select')
    );
  },
  setValue ({root, value}) {
    this.getInput({root}).value = value;
  },
  getValue ({root}) {
    return this.getInput({root}).value;
  },
  viewUI ({value, specificSchemaObject}) {
    const kind = specificSchemaObject && 'kind' in specificSchemaObject &&
      specificSchemaObject.kind;
    return ['span', {
      dataset: {type: 'string'},
      title: specificSchemaObject?.description ??
        (kind === 'email'
          ? `(an ${kind} string)`
          : kind
            ? `(a ${kind} string)` // url, date
            : '(a string)')
    }, [value]];
  },
  editUI ({typeNamespace, specificSchemaObject, types, value}) {
    const stringSchemaObject = /** @type {import('zodexy').SzString} */ (
      specificSchemaObject ?? {type: 'string'}
    );
    const kind = 'kind' in stringSchemaObject ? stringSchemaObject.kind : null;
    const isConstrained = specificSchemaObject?.type === 'literal' ||
      specificSchemaObject?.type === 'enum';
    const minlength = stringSchemaObject?.min ?? stringSchemaObject?.length;
    const maxlength = stringSchemaObject?.max ?? stringSchemaObject?.length;

    const startsWith = stringSchemaObject?.startsWith;
    const endsWith = stringSchemaObject?.endsWith;

    const toLowerCase = stringSchemaObject?.toLowerCase;
    const toUpperCase = stringSchemaObject?.toUpperCase;
    const trim = stringSchemaObject?.trim;

    const includes = 'includes' in stringSchemaObject &&
      stringSchemaObject.includes;
    const position = 'position' in stringSchemaObject
      ? stringSchemaObject.position
      : undefined;

    const regex = 'regex' in stringSchemaObject &&
      stringSchemaObject.regex;
    const pattern = kind === 'email' && 'pattern' in stringSchemaObject
      ? stringSchemaObject.pattern
      : undefined;
    const flags = 'flags' in stringSchemaObject
      ? stringSchemaObject.flags
      : undefined;

    /**
     * @param {string} value
     */
    const checkValue = (value) => {
      if (startsWith && !value.startsWith(startsWith)) {
        return `Value doesn't start with expected: ${startsWith}`;
      }
      if (endsWith && !value.endsWith(endsWith)) {
        return `Value doesn't end with expected: ${endsWith}`;
      }
      if (includes && !value.includes(includes, position ?? 0)) {
        return `Value doesn't include the expected: ${includes}${
          position ? ` after position: ${position}` : ''
        }`;
      }
      if (regex && !(new RegExp(regex, flags ?? '')).test(value)) {
        return `Value doesn't match regular expression: ${regex}${
          flags ? ` with flags: ${flags}` : ''
        }`;
      }
      if (pattern && !(new RegExp(pattern, flags ?? '')).test(value)) {
        return `Value doesn't match email pattern: ${pattern}${
          flags ? ` with flags: ${flags}` : ''
        }`;
      }
      if (kind) {
        switch (kind) {
        case 'credit_card':
          if (!regexes.creditCard.test(value)) {
            return `Value doesn't match credit card pattern.`;
          }
          break;
        case 'ip':
          switch ('version' in stringSchemaObject &&
              stringSchemaObject.version) {
          case 'v4':
            if (!regexes.ipv4.test(value)) {
              return `Value doesn't match IP v4 pattern.`;
            }
            break;
          default:
            if (!regexes.ipv6.test(value)) {
              return `Value doesn't match IP v6 pattern.`;
            }
          }
          break;
        case 'time':
          // @ts-expect-error It is present
          if (!regexes.time(stringSchemaObject).test(value)) {
            return `Value does not match time/precision.`;
          }
          break;
        case 'datetime':
          // @ts-expect-error It is present
          if (!regexes.datetime(stringSchemaObject).test(value)) {
            return `Value does not match datetime/precision/offset/local`;
          }
          break;
        case 'emoji':
          if (!regexes.emoji().test(value)) {
            return `Value does not match emoji pattern`;
          }
          break;
        case 'uuid':
          if (!regexes.uuid(
            'version' in stringSchemaObject && stringSchemaObject.version
              ? Number(stringSchemaObject.version.slice(1))
              : undefined
          ).test(value)) {
            return `Value does not match uuid pattern`;
          }
          break;
        case 'jwt':
          if (!z.jwt(
            'algorithm' in stringSchemaObject
              ? {alg: stringSchemaObject.algorithm}
              : undefined
          ).safeParse(value).success) {
            return `Value does not match jwt pattern`;
          }
          break;
        case 'e164':
        case 'xid':
        case 'guid':
        case 'ksuid':
          if (!regexes[kind].test(value)) {
            return `Value does not match ${kind} pattern`;
          }
          break;
        case 'nanoid':
          if ('length' in stringSchemaObject && stringSchemaObject.length) {
            if (value.length !== stringSchemaObject.length) {
              return `Nanoid value is not of the expected length: ${
                stringSchemaObject.length
              }`;
            }

            if (!regexes.nanoidOfLength(15).test(value)) {
              return `Value does not match nanoid pattern`;
            }
            break;
          }
          if (!regexes.nanoid.test(value)) {
            return `Value does not match nanoid pattern`;
          }
          break;
        case 'cuid':
          if (!regexes.cuid.test(value)) {
            return `Value does not match cuid pattern`;
          }
          break;
        case 'cuid2':
          if (!regexes.cuid2.test(value)) {
            return `Value does not match cuid2 pattern`;
          }
          break;
        case 'ulid':
          if (!regexes.ulid.test(value)) {
            return `Value does not match ulid pattern`;
          }
          break;
        case 'duration':
          if (!regexes.duration.test(value)) {
            return `Value does not match duration pattern`;
          }
          break;
        case 'base64':
          if (!regexes.base64.test(value)) {
            return `Value does not match base64 pattern`;
          }
          break;
        case 'base64url':
          if (!regexes.base64url.test(value)) {
            return `Value does not match base64url pattern`;
          }
          break;
        case 'cidr':
          switch ('version' in stringSchemaObject &&
            stringSchemaObject.version) {
          case 'v4':
            if (!regexes.cidrv4.test(value)) {
              return `Value doesn't match IP v4 cidr pattern.`;
            }
            break;
          default:
            if (!cidrv6Schema.safeParse(value).success) {
              return `Value doesn't match IP v6 cidr pattern.`;
            }
          }
          break;
        default:
          // 'email'|'url'|'date' should already be handled by the input element
          break;
        }
      }
      return null;
    };

    /**
     * @param {string} value
     */
    const transform = (value) => {
      if (toLowerCase) {
        value = value.toLowerCase();
      }
      if (toUpperCase) {
        value = value.toUpperCase();
      }
      if (trim) {
        value = value.trim();
      }
      return value;
    };

    return ['div', {
      dataset: {type: 'string'},
      title: specificSchemaObject?.description ?? 'String'
    }, [
      kind && [
        // There is a `time` and `datetime-local` but they don't
        //    support milliseconds
        'email', 'url', 'date'
      ].includes(kind)
        ? ['input', {
          $on: {
            change () {
              const that = /** @type {HTMLInputElement} */ (this);
              that.value = transform(that.value);
              const message = checkValue(that.value);
              that.setCustomValidity(types.getValidationMessage({
                message,
                schema: specificSchemaObject,
                typeSpecific: true
              }) ?? '');
              that.reportValidity();
            }
          },
          name: `${typeNamespace}-string`,
          type: kind,
          value: value ?? specificSchemaObject?.defaultValue ?? '',

          // Form doesn't support for date
          minlength: kind === 'date' ? undefined : minlength,
          maxlength: kind === 'date' ? undefined : maxlength
        }]
        : isConstrained
          ? ['select', {
            name: `${typeNamespace}-string`
          }, Object.values(specificSchemaObject.values).filter((
            /** @type {string} */ val
          ) => {
            return typeof val === 'string';
          }).map((
            /** @type {string} */ val
          ) => {
            return ['option', {
              selected: val === (value ?? specificSchemaObject.defaultValue)
            }, [val]];
          })]
          : ['textarea', {
            $on: {
              change () {
                const that = /** @type {HTMLTextAreaElement} */ (this);
                that.value = transform(that.value);
                const message = checkValue(that.value);
                that.setCustomValidity(types.getValidationMessage({
                  message,
                  schema: specificSchemaObject,
                  typeSpecific: true
                }) ?? '');
                that.reportValidity();
              }
            },
            name: `${typeNamespace}-string`,
            minlength, maxlength
          }, [
            (value ?? specificSchemaObject?.defaultValue ?? '')
          ]]
    ]];
  }
};

export default stringType;
