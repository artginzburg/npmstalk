const NpmApi = require('npm-api');

const { getDownloadsFastRecursive } = require('./getDownloadsFast');
const { orderRecordStringNumber } = require('./orderRecordStringNumber');
const { mapWithConcurrency } = require('./mapWithConcurrency');

const npm = new NpmApi();

/**
 * api.npmjs.org (behind Cloudflare) rate-limits by IP: a small concurrent-connection
 * cap plus a token bucket. Measured on a fresh budget, hard `429`s begin at 4 in
 * flight, so 2 keeps a slot of margin under the cap; the remaining token-bucket dips
 * are absorbed by the per-request retry in {@link getDownloadsFast}. Nothing is
 * dropped — packages are paced through the pool, not skipped.
 */
const DEFAULT_CONCURRENCY = 2;

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
  const maintainer = npm.maintainer(username);

  /** @type {string[]} */
  const repoNames = await maintainer.repos();

  let totalMaintainerDownloads = 0;

  /** @type {Record<string, number>} */
  const reposWithDownloads = {};

  await mapWithConcurrency(repoNames, concurrency, async (repoName) => {
    const downloads = await getDownloadsFastWithFallback(repoName);

    totalMaintainerDownloads += downloads;

    reposWithDownloads[repoName] = downloads;
  });

  return {
    total: totalMaintainerDownloads,
    packages: sortPackages ? orderRecordStringNumber(reposWithDownloads) : reposWithDownloads,
  };
}

async function getDownloadsFastWithFallback(
  /** @type {string} */
  repoName,
) {
  try {
    return await getDownloadsFastRecursive(repoName);
  } catch (error) {
    const repo = npm.repo(repoName);
    /** @type { number } */
    const downloads = await repo.total();
    return downloads;
  }
}

module.exports = getMaintainerDownloads;
