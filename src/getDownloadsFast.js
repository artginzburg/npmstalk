/**
 * @returns {Promise<number>}
 *
 * @param {string} repoName
 * @param {string?} end
 * @param {number?} cumulativeDownloadCount
 */
async function getDownloadsFastRecursive(
  repoName,
  end = undefined,
  cumulativeDownloadCount = 0,
) {
  const downloadsObject = await getDownloadsFast(repoName, end);
  const newDownloadCount = cumulativeDownloadCount + downloadsObject.downloads;
  if (downloadsObject.downloads === 0) {
    return newDownloadCount;
  }
  return getDownloadsFastRecursive(repoName, downloadsObject.start, newDownloadCount);
}

/** @type {import('got').Got | undefined} */
let got = undefined;

getGot();
async function getGot() {
  if (got) return;

  const { got: importedGot } = await import('got');
  got = importedGot;
}

/**
 * This gets downloads almost instantly. But it only allowed ranges up to 1.5 years, and {@link getDownloadsFastRecursive} works around that.
 *
 * @param {string} packageName
 * @returns {Promise<DownloadsFast>}
 */
async function getDownloadsFast(packageName, end = todayAsNpmDate()) {
  await getGot();
  const start = '2005-01-01';
  return got
    .get(`https://api.npmjs.org/downloads/point/${start}:${end}/${packageName}`, {
      // api.npmjs.org (Cloudflare) rate-limits by a per-IP token bucket. When the
      // window is momentarily exhausted it answers 429; backing off and retrying
      // lets the bucket refill instead of dropping the package. got honors a
      // Retry-After header automatically when one is present.
      retry: {
        limit: 5,
        methods: ['GET'],
        statusCodes: [408, 429, 500, 502, 503, 504],
      },
    })
    .json();
}

function todayAsNpmDate() {
  return toNpmDate(new Date());
}

function toNpmDate(
  /** @type {Date} */
  date,
) {
  return date.toJSON().split('T')[0];
}

module.exports = { getDownloadsFast, getDownloadsFastRecursive };
