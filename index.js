const express = require('express');
const getMaintainerDownloads = require('./src/getMaintainerDownloads');

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
      cacheSeconds: 12 * 60 * 60,
    }),
  );
});

module.exports.endpoint = app;
