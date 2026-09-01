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
