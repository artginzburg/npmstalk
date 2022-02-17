#!/usr/bin/env node
const getMaintainerDownloads = require('./src/getMaintainerDownloads');

async function displayMaintainerDownloads(username) {
  console.log(await getMaintainerDownloads(username));
}

const lastArgument = process.argv[process.argv.length - 1];

if (lastArgument.includes('/')) {
  console.log(`Specify an NPM maintainer's username as the command argument, please`);
  process.exit(1);
}

displayMaintainerDownloads(lastArgument);
