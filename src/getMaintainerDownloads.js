const NpmApi = require('npm-api');

const { orderRecordStringNumber } = require('./orderRecordStringNumber');

const npm = new NpmApi();

const sumArray = (/** @type {number} */ accumulator, /** @type {number} */ currentValue) =>
  accumulator + currentValue;

/**
 * @param {string} username
 */
async function getMaintainerDownloads(username) {
  const maintainer = npm.maintainer(username);

  /** @type {string[]} */
  const repoNames = await maintainer.repos();

  let totalMaintainerDownloads = 0;

  /** @type {Record<string, number>} */
  const reposWithDownloads = {};

  await Promise.all(
    repoNames.map(async (repoName) => {
      const repo = npm.repo(repoName);

      /** @type { { downloads: number }[] } */
      const downloads = await repo.downloads();

      const onlyDownloads = downloads.map((el) => el.downloads);

      const sumOfDownloads = onlyDownloads.reduce(sumArray, 0);

      totalMaintainerDownloads += sumOfDownloads;

      reposWithDownloads[repoName] = sumOfDownloads;
    }),
  );

  return {
    total: totalMaintainerDownloads,
    packages: orderRecordStringNumber(reposWithDownloads), // TODO only order downloads if the package is used as a CLI
  };
}

module.exports = getMaintainerDownloads;
