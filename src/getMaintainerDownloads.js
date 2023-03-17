const NpmApi = require('npm-api');

const { getDownloadsFast } = require('./getDownloadsFast');
const { orderRecordStringNumber } = require('./orderRecordStringNumber');

const npm = new NpmApi();

/**
 * @param {string} username
 */
async function getMaintainerDownloads(username, sortPackages = false) {
  const maintainer = npm.maintainer(username);

  /** @type {string[]} */
  const repoNames = await maintainer.repos();

  let totalMaintainerDownloads = 0;

  /** @type {Record<string, number>} */
  const reposWithDownloads = {};

  await Promise.all(
    repoNames.map(async (repoName) => {
      const downloads = await getDownloadsFastWithFallback(repoName);

      totalMaintainerDownloads += downloads;

      reposWithDownloads[repoName] = downloads;
    }),
  );

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
    return getDownloadsFastRecursive(repoName);
  } catch (error) {
    const repo = npm.repo(repoName);
    /** @type { number } */
    const downloads = await repo.total();
    return downloads;
  }
}

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
  const olderDownloadsObject = await getDownloadsFast(repoName, downloadsObject.start);
  const newDownloadCount = cumulativeDownloadCount + downloadsObject.downloads + olderDownloadsObject.downloads;
  if (olderDownloadsObject.downloads === 0) {
    return newDownloadCount;
  }
  return getDownloadsFastRecursive(repoName, olderDownloadsObject.start, newDownloadCount);
}

module.exports = getMaintainerDownloads;
