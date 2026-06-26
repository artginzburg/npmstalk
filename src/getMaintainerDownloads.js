const { getDownloadsFastRecursive } = require('./getDownloadsFast');
const { orderRecordStringNumber } = require('./orderRecordStringNumber');
const { mapWithConcurrency } = require('./mapWithConcurrency');
const { getGot } = require('./httpClient');

/**
 * api.npmjs.org (behind Cloudflare) rate-limits by IP with a token bucket. On shared
 * datacenter IPs (e.g. CI runners) that bucket is often already near-empty, so any
 * burst trips `429`. Querying serially spreads the (few dozen) requests out enough
 * for the bucket to refill between them, which is far more reliable there than a
 * small pool — and the per-request retry in {@link getDownloadsFast} still covers the
 * occasional dip. Callers that own a fresh IP can raise this for speed.
 */
const DEFAULT_CONCURRENCY = 1;

/**
 * @param {string} username
 * @param {boolean} sortPackages
 * @param {number} concurrency Maximum number of packages queried in parallel.
 */
async function getMaintainerDownloads(
  username,
  sortPackages = false,
  concurrency = DEFAULT_CONCURRENCY,
) {
  const repoNames = await getMaintainerPackages(username);

  let totalMaintainerDownloads = 0;

  /** @type {Record<string, number>} */
  const reposWithDownloads = {};

  await mapWithConcurrency(repoNames, concurrency, async (repoName) => {
    const downloads = await getDownloadsFastRecursive(repoName);

    totalMaintainerDownloads += downloads;

    reposWithDownloads[repoName] = downloads;
  });

  return {
    total: totalMaintainerDownloads,
    packages: sortPackages ? orderRecordStringNumber(reposWithDownloads) : reposWithDownloads,
  };
}

/**
 * Lists every package the user maintains via the registry search API.
 *
 * This used to go through `npm-api`, whose old streaming HTTP stack corrupts the
 * response on Node 24+ ("Invalid JSON") and leaves a hanging promise instead of
 * rejecting. A direct `got` request is reliable on modern Node and fails cleanly.
 *
 * @param {string} username
 * @returns {Promise<string[]>}
 */
async function getMaintainerPackages(username) {
  const got = await getGot();
  const pageSize = 250;
  const names = [];

  for (let from = 0; ; from += pageSize) {
    const url =
      'https://registry.npmjs.org/-/v1/search' +
      `?text=maintainer:${encodeURIComponent(username)}&size=${pageSize}&from=${from}`;

    /** @type {{ objects: { package: { name: string } }[], total: number }} */
    const page = await got
      .get(url, { retry: { limit: 3, methods: ['GET'], statusCodes: [408, 429, 500, 502, 503, 504] } })
      .json();

    names.push(...page.objects.map((object) => object.package.name));

    if (names.length >= page.total || page.objects.length === 0) break;
  }

  return names;
}

module.exports = getMaintainerDownloads;
