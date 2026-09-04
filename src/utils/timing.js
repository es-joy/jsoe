/* eslint-disable promise/avoid-new -- Primitive timing helper */

/**
 * Resolves after a macrotask, letting the browser flush pending DOM work
 *   scheduled with `setTimeout(fn, 0)` (element insertion, layout-dependent
 *   building, etc.). Used to replace bare `setTimeout` deferrals with an
 *   awaitable form so callers can know when the deferred work has completed.
 * @returns {Promise<void>}
 */
export const tick = () => new Promise((resolve) => {
  setTimeout(resolve, 0);
});

/**
 * Default upper bound, in {@link tick}s, for {@link whenConnected}. A control
 *   that is never attached to the document should be given up on rather than
 *   awaited forever.
 */
export const MAX_CONNECT_WAIT_TICKS = 50;

/**
 * Resolves once `el` is connected to the document, re-checking once per
 *   macrotask via {@link tick}. A control is built synchronously, but its
 *   consumer may only attach it a deferred tick later (e.g. a `setTimeout(0)`
 *   DOM insertion), and connection-dependent initialisation — an SCEditor
 *   iframe, an auto-`setValue`, a type-choices auto-trigger — has to wait for
 *   that. Bounded so a control that is never attached is abandoned rather than
 *   polled forever; the resolved value says which happened.
 * @param {Element} el
 * @param {number} [maxTicks]
 * @returns {Promise<boolean>} Whether `el` became connected within the bound.
 */
export const whenConnected = async (el, maxTicks = MAX_CONNECT_WAIT_TICKS) => {
  for (
    let waited = 0;
    !el.isConnected && waited < maxTicks;
    waited++
  ) {
    // eslint-disable-next-line no-await-in-loop -- Sequential by design
    await tick();
  }
  return el.isConnected;
};
