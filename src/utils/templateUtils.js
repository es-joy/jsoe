const nbsp = '\u{A0}';
const upArrow = '\u{2191}';
const downArrow = '\u{2193}';
const U = {nbsp, upArrow, downArrow};

/**
 * @param {string} sel
 * @returns {HTMLElement|null}
 */
const $ = (sel) => document.querySelector(sel);

/**
 * @param {string} sel
 * @returns {HTMLElement[]}
 */
const $$ = (sel) => [...(/** @type {NodeListOf<HTMLElement>} */ (
  document.querySelectorAll(sel)
))];

/**
 * @param {Element|HTMLElement|string} el
 * @param {string} descendentsSel
 * @returns {HTMLElement|null}
 */
const $e = (el, descendentsSel) => {
  const elem = typeof el === 'string' ? $(el) : el;
  if (!elem) {
    return null;
  }
  return elem.querySelector(descendentsSel);
};

/**
 * @param {HTMLElement|string} el
 * @param {string} descendentsSel
 * @returns {HTMLElement[]}
 */
const $$e = (el, descendentsSel) => {
  const elem = typeof el === 'string' ? $(el) : el;
  if (!elem) {
    return [];
  }
  return [...(/** @type {NodeListOf<HTMLElement>} */ (
    elem.querySelectorAll(descendentsSel)
  ))];
};

/**
 * @param {Node|string} node
 * @returns {void}
 */
const removeChildren = (node) => {
  const nde = typeof node === 'string' ? $(node) : node;
  if (!nde) {
    throw new Error('Node not found!');
  }
  while (nde.hasChildNodes()) {
    nde.lastChild?.remove();
  }
};

/**
 * @param {HTMLElement|string} sel
 * @returns {void}
 */
const removeIfExists = (sel) => {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (el) {
    el.remove();
  }
};

/**
 * @param {HTMLElement|string} el
 * @param {string|string[]} selectors
 * @returns {HTMLElement[]}
 */
const filterChildElements = (el, selectors) => {
  /**
   * @param {HTMLElement} el
   * @param {string} sel
   * @returns {HTMLElement[]}
   */
  const getMatchingChildrenForElement = (el, sel) => {
    const childElements = el.children;
    const matchingChildElements = [...childElements].filter((el) => {
      return el.matches(sel);
    });
    return /** @type {HTMLElement[]} */ (matchingChildElements);
  };
  const elem = typeof el === 'string' ? $(el) : el;
  if (!elem) {
    throw new Error('Element not found!');
  }
  let filtered = [elem];
  selectors = Array.isArray(selectors) ? selectors : [selectors];
  selectors.forEach((sel) => {
    filtered = filtered.reduce((els, childElement) => {
      /* istanbul ignore if -- Guard */
      if (!childElement) {
        return els;
      }
      els.push(...getMatchingChildrenForElement(childElement, sel));
      return els;
    }, /** @type {HTMLElement[]} */ ([]));
  });
  return filtered;
};

/**
 * @param {string} s
 * @returns {string}
 */
const initialCaps = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const DOM = {removeChildren, removeIfExists, filterChildElements, initialCaps};

export {
  U,
  $, $$,
  $e, $$e,
  DOM
};
