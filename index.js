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

const express = require('express');
const app = express();

app.get('/:user', async (req, res) => {
  const downloads = await getMaintainerDownloads(req.params.user);

  res.end(
    JSON.stringify({
      schemaVersion: 1,
      label: 'downloads',
      message: String(downloads.total),
      color: 'red',
      namedLogo: 'npm',
      style: 'social',
      cacheSeconds: 8 * 60 * 60,
    }),
  );
});

module.exports.endpoint = app;
