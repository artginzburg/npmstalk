/**
 * Runs `mapper` over `items` while keeping at most `concurrency` calls in flight
 * at any moment. Results preserve input order.
 *
 * The npm downloads endpoint (api.npmjs.org, behind Cloudflare) rate-limits by a
 * per-IP token bucket, so firing every package in parallel trips `429`. Pacing the
 * requests through a small pool keeps us under the burst threshold without dropping
 * any work — every item is still processed, just not all at once.
 *
 * @template T, R
 * @param {readonly T[]} items
 * @param {number} concurrency
 * @param {(item: T, index: number) => Promise<R>} mapper
 * @returns {Promise<R[]>}
 */
async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  const limit = Math.max(1, Math.min(concurrency, items.length));

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));

  return results;
}

module.exports = { mapWithConcurrency };
