import {core} from 'zod';
import {$e} from '../utils/templateUtils.js';

const datetimeRegex = core.regexes.datetime({
  precision: 456
});

// Adapted from Zod: https://github.com/colinhacks/zod/blob/9257ab78eec366c04331a3c2d59deb344a02d9f6/src/types.ts
const ipv4Regex =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)$/u;
const ipv6Regex =
  /^(([a-f\d]{1,4}:){7}|::([a-f\d]{1,4}:){0,6}|([a-f\d]{1,4}:):([a-f\d]{1,4}:){0,5}|([a-f\d]{1,4}:){2}:([a-f\d]{1,4}:){0,4}|([a-f\d]{1,4}:){3}:([a-f\d]{1,4}:){0,3}|([a-f\d]{1,4}:){4}:([a-f\d]{1,4}:){0,2}|([a-f\d]{1,4}:){5}:([a-f\d]{1,4}:)?)([a-f\d]{1,4}|(((25[0-5])|(2[0-4]\d)|(1\d{2})|(\d{1,2}))\.){3}((25[0-5])|(2[0-4]\d)|(1\d{2})|(\d{1,2})))$/u;
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64Regex =
  /^([\da-zA-Z+/]{4})*(([\da-zA-Z+/]{2}==)|([\da-zA-Z+/]{3}=))?$/u;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const emojiRegexStr = String.raw`^(\p{Extended_Pictographic}|\p{Emoji_Component})+$`;
const emojiRegex = new RegExp(emojiRegexStr, 'u');
const cuidRegex = /^c[^\s-]{8,}$/iu;
const cuid2Regex = /^[\da-z]+$/u;
const ulidRegex = /^[\dA-HJKMNP-TV-Z]{26}$/iu;
const uuidRegex =
  /^[\da-f]{8}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{12}$/iu;
const nanoidRegex = /^[a-z\d_-]{21}$/iu;
const durationRegex =
  // eslint-disable-next-line sonarjs/no-empty-after-reluctant -- Ok
  /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/u;
// https://github.com/colinhacks/zod/blob/5bfc8f269a81d9edc283e7920868161e4129fb23/packages/zod/src/v3/types.ts#L642
const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/u;
const ipv4CidrRegex =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\/(3[0-2]|[12]?\d)$/u;
const ipv6CidrRegex =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))\/(12[0-8]|1[01]\d|[1-9]?\d)$/u;

// End adapted from Zod

/**
 * @param {{precision?: number|null}} args
 * @returns {string}
 */
function timeRegexSource (args) {
  // let regex = `\\d{2}:\\d{2}:\\d{2}`;
  let regex = String.raw`([01]\d|2[0-3]):[0-5]\d:[0-5]\d`;

  if (args.precision) {
    regex = String.raw`${regex}\.\d{${args.precision}}`;
  } else if (args.precision === null || args.precision === undefined) {
    regex = String.raw`${regex}(\.\d+)?`;
  }
  return regex;
}

/**
 * @param {{
 *   offset?: boolean;
 *   local?: boolean;
 *   precision?: number|null;
 * }} args
 * @returns {RegExp}
 */
function timeRegex (args) {
  return new RegExp(`^${timeRegexSource(args)}$`, 'u');
}

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
  editUI ({typeNamespace, specificSchemaObject, value}) {
    const stringSchemaObject = /** @type {import('zodexy').SzString} */ (
      specificSchemaObject
    );
    const kind = 'kind' in stringSchemaObject ? stringSchemaObject.kind : null;
    const isLiteral = specificSchemaObject?.type === 'literal';
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
      if (kind) {
        switch (kind) {
        case 'ip':
          switch ('version' in stringSchemaObject &&
              stringSchemaObject.version) {
          case 'v4':
            if (!ipv4Regex.test(value)) {
              return `Value doesn't match IP v4 pattern.`;
            }
            break;
          default:
            if (!ipv6Regex.test(value)) {
              return `Value doesn't match IP v6 pattern.`;
            }
          }
          break;
        case 'time':
          // @ts-expect-error It is present
          if (!timeRegex(stringSchemaObject).test(value)) {
            return `Value does not match time/precision.`;
          }
          break;
        case 'datetime':
          // @ts-expect-error It is present
          if (!datetimeRegex(stringSchemaObject).test(value)) {
            return `Value does not match datetime/precision/offset/local`;
          }
          break;
        case 'emoji':
          if (!emojiRegex.test(value)) {
            return `Value does not match emoji pattern`;
          }
          break;
        case 'uuid':
          if (!uuidRegex.test(value)) {
            return `Value does not match uuid pattern`;
          }
          break;
        case 'nanoid':
          if (!nanoidRegex.test(value)) {
            return `Value does not match nanoid pattern`;
          }
          break;
        case 'cuid':
          if (!cuidRegex.test(value)) {
            return `Value does not match cuid pattern`;
          }
          break;
        case 'cuid2':
          if (!cuid2Regex.test(value)) {
            return `Value does not match cuid2 pattern`;
          }
          break;
        case 'ulid':
          if (!ulidRegex.test(value)) {
            return `Value does not match ulid pattern`;
          }
          break;
        case 'duration':
          if (!durationRegex.test(value)) {
            return `Value does not match duration pattern`;
          }
          break;
        case 'base64':
          if (!base64Regex.test(value)) {
            return `Value does not match base64 pattern`;
          }
          break;
        case 'base64url':
          if (!base64urlRegex.test(value)) {
            return `Value does not match base64url pattern`;
          }
          break;
        case 'cidr':
          switch ('version' in stringSchemaObject &&
            stringSchemaObject.version) {
          case 'v4':
            if (!ipv4CidrRegex.test(value)) {
              return `Value doesn't match IP v4 cidr pattern.`;
            }
            break;
          default:
            if (!ipv6CidrRegex.test(value)) {
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
              that.setCustomValidity(message ?? '');
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
        : isLiteral
          ? ['select', specificSchemaObject.values.filter((
            /** @type {string} */ val
          ) => {
            return typeof val === 'string';
          }).map((
            /** @type {string} */ val
          ) => {
            return ['option', [val]];
          })]
          : ['textarea', {
            $on: {
              change () {
                const that = /** @type {HTMLTextAreaElement} */ (this);
                that.value = transform(that.value);
                const message = checkValue(that.value);
                that.setCustomValidity(message ?? '');
                that.reportValidity();
              }
            },
            name: `${typeNamespace}-string`,
            disabled: isLiteral,
            minlength, maxlength
          }, [
            (value ?? specificSchemaObject?.defaultValue ?? '')
          ]]
    ]];
  }
};

export default stringType;
