const NpmApi = require('npm-api');

const npm = new NpmApi();

const sumArray = (accumulator, currentValue) => accumulator + currentValue;

async function getMaintainerDownloads(username) {
  const maintainer = npm.maintainer(username);

  const repoNames = await maintainer.repos();

  let totalMaintainerDownloads = 0;

  const reposWithDownloads = {};

  await Promise.all(
    repoNames.map(async (repoName) => {
      const repo = npm.repo(repoName);

      const downloads = await repo.downloads();

      const onlyDownloads = downloads.map((el) => el.downloads);

      const sumOfDownloads = onlyDownloads.reduce(sumArray, 0);

      totalMaintainerDownloads += sumOfDownloads;

      reposWithDownloads[repoName] = sumOfDownloads;
    }),
  );

  return {
    total: totalMaintainerDownloads,
    packages: reposWithDownloads,
  };
}

getMaintainerDownloads('artginzburg').then((data) => {
  let badge = require('./badge.json');
  badge.message = data.total;
  require('fs').writeFileSync('badge.json', JSON.stringify(badge, null, 2));
});
