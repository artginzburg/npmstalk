/** @type {import('got').Got | undefined} */
let gotInstance;

/**
 * `got` is ESM-only, so it is imported lazily from this CommonJS module and cached.
 *
 * @returns {Promise<import('got').Got>}
 */
async function getGot() {
  if (!gotInstance) {
    ({ got: gotInstance } = await import('got'));
  }
  return gotInstance;
}

module.exports = { getGot };
