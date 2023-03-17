const NpmApi = require('npm-api');

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
      const repo = npm.repo(repoName);

      /** @type { number } */
      const downloads = await repo.total();

      totalMaintainerDownloads += downloads;

      reposWithDownloads[repoName] = downloads;
    }),
  );

  return {
    total: totalMaintainerDownloads,
    packages: sortPackages ? orderRecordStringNumber(reposWithDownloads) : reposWithDownloads,
  };
}

module.exports = getMaintainerDownloads;
