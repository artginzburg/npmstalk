const getMaintainerDownloads = require('./src/getMaintainerDownloads');

console.time();
getMaintainerDownloads(process.env.USER).then((data) => {
  console.log(data);
  console.timeEnd();
});
