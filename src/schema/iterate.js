// @ts-nocheck

// Depth-first (Postorder) traversal

import jsonPointer from 'json-pointer';

/**
 * @typedef {{
 *   rootElements: [],
 *   childElements: []|{
 *     [key: (string|number)]: []
 *   },
 *   refinements: object
 * }} Info
 */

/**
 * @returns {Info}
 */
function createInfo () {
  return {
    rootElements: [],
    childElements: {},
    refinements: {}
  };
}

/*
0. Either find a value from the top-level or treat as empty and just
    follow any top-level schema
1. If come to an already-visited $ref, stop
2. If primitive or object/array, begin setting (though properties conditional)
3. If schema words, follow as deep as non-recursion allows, then rebuild upwards
4. Use `rootElements` in UI (if only one item, just show that item)
*/
const visited = new WeakMap();
const childToParent = new WeakMap();
const objectToInfo = new WeakMap();

/**
 * @typedef {any} AnyObject
 */

/**
 * @param {AnyObject} descendantObj
 * @returns {AnyObject}
 */
const getRoot = (descendantObj) => {
  let obj = descendantObj;
  let lastObj;
  while (true) {
    lastObj = obj;
    const result = childToParent.get(obj);
    if (!result) {
      break;
    }
    ({parent: obj} = result);
  }
  return lastObj;
};

/**
 * @typedef {{
 *   types: string[]
 * }} State
 */

/**
 * @param {{parent: AnyObject, key: string}|undefined} result
 * @param {AnyObject} obj
 * @param {State} state
 * @throws {Error}
 * @returns {Info|void}
 */
function collectForConjunctionChildren (result, obj, state) {
  const childInfo = objectToInfo.get(obj);
  if (!result) {
    return childInfo;
  }
  const {parent, key} = result;
  const parentInfo = objectToInfo.get(parent);
  switch (parent.type) {
  case 'intersection':
    parentInfo.rootElements = childInfo.rootElements;
    break;
  case 'object':
    parentInfo.childElements[key] = childInfo.rootElements;
    break;
  default:
    throw new Error('Unrecognized parent type ' + parent.type);
  }
  return undefined;
}

/**
 * @param {{parent: AnyObject, key: string}|undefined} result
 * @param {AnyObject} obj
 * @param {State} state
 * @throws {Error}
 * @returns {Info|void}
 */
function collectForBasicChildren (result, obj, state) {
  if (!result) {
    const info = objectToInfo.get(obj);
    if (!info.rootElements.includes(obj.type)) {
      info.rootElements.push(obj.type);
    }
    return info;
  }
  const {parent, key} = result;
  console.log('parent', parent.type);
  const info = objectToInfo.get(parent);
  switch (parent.type) {
  case 'union':
    info.rootElements.push(obj.type);
    console.log('info.rootElements', info.rootElements);
    break;
  case 'intersection':
    if (info.rootElements.size) {
      if (!info.rootElements.includes(obj.type)) {
        info.rootElements = [];
      }
    } else {
      info.rootElements.push(obj.type);
    }
    break;
  case 'not':
    info.rootElements = [...state.types].filter((type) => {
      return !info.rootElements.includes(type);
    });
    break;
  case 'object':
    info.childElements[key] = [obj.type];
    console.log('333', obj, parent);
    break;
  case 'array':
    info.childElements = [obj.type];
    break;
  case 'tuple':
    break;
  default:
    throw new Error('Not yet handled ' + parent.type);
  }
  return undefined;
}
/**
 * @typedef {any} ArbitraryValue
 */
/**
 * @param {ArbitraryValue} obj
 * @param {State} state
 * @returns {void}
 */
export const iterate = (obj, state) => {
  // Follow as deep as non-recursive $ref's allow, then rebuild upwards

  if (obj.$ref) {
    if (!visited.has(obj)) {
      visited.set(obj, true);
      const ref = jsonPointer.get(getRoot(obj), obj.$ref.slice(1));
      iterate(ref, state);
    }
    return undefined;
  }

  // console.log('obj.type', obj.type);

  switch (obj.type) {
  // Our own non-Zod/non-Zodex additions based on JSON Schema
  case 'not': {
    childToParent.set(obj.left, {parent: obj});
    childToParent.set(obj.right, {parent: obj});
    objectToInfo.set(obj, createInfo());
    iterate(obj.right, state);
    iterate(obj.left, state);
    const result = childToParent.get(obj);

    return collectForConjunctionChildren(result, obj, state);
  } case 'oneOf': {
    objectToInfo.set(obj, createInfo());
    obj.options.forEach((option) => {
      childToParent.set(option, {parent: obj});
      iterate(option, state);
    });
    const result = childToParent.get(obj);

    return collectForConjunctionChildren(result, obj, state);

    // "dependencies"
    // "if", "then", "else"
    // "additionalItems"/"prefixItems",
    // "contains"/"minContains",
    // "propertyNames", "patternProperties", "additionalProperties"
    // "unevaluatedProperties", "unevaluatedItems

  // Schema conjunctions
  // eslint-disable-next-line sonarjs/no-duplicated-branches -- Skeleton
  } case 'union': {
    objectToInfo.set(obj, createInfo());
    obj.options.forEach((option) => {
      childToParent.set(option, {parent: obj});
      iterate(option, state);
    });
    const result = childToParent.get(obj);

    return collectForConjunctionChildren(result, obj, state);
  // eslint-disable-next-line sonarjs/no-duplicated-branches -- Skeleton
  } case 'intersection': {
    childToParent.set(obj.left, {parent: obj});
    childToParent.set(obj.right, {parent: obj});
    objectToInfo.set(obj, createInfo());
    iterate(obj.right, state);
    iterate(obj.left, state);
    const result = childToParent.get(obj);

    return collectForConjunctionChildren(result, obj, state);
  // eslint-disable-next-line sonarjs/no-duplicated-branches -- Skeleton
  } case 'discriminatedUnion': {
    // obj.discriminator
    objectToInfo.set(obj, createInfo());
    obj.options.forEach((option) => {
      childToParent.set(option, {parent: obj});
      iterate(option, state);
    });
    const result = childToParent.get(obj);

    return collectForConjunctionChildren(result, obj, state);

    // Iterables
  } case 'object': {
    objectToInfo.set(obj, createInfo());
    if (obj.properties) {
      Object.entries(obj.properties).forEach(([key, val]) => {
        childToParent.set(val, {parent: obj, key});
        iterate(val, state);
      });
    }
    const result = childToParent.get(obj);
    return collectForBasicChildren(result, obj, state);
  } case 'array': {
    objectToInfo.set(obj, createInfo());
    if (obj.element) {
      childToParent.set(obj.element, {parent: obj});
      iterate(obj.element, state);
    }
    const result = childToParent.get(obj);
    return collectForBasicChildren(result, obj, state);

  // Handle isNullable/isOptional/defaultValue ?
  } case 'tuple': {
    // Todo:
    return undefined;
  } default: {
    console.log('obj', obj.type);
    const result = childToParent.get(obj);
    objectToInfo.set(obj, createInfo());
    return collectForBasicChildren(result, obj, state);
  }
  }
};
