const getMaintainerDownloads = require('./src/getMaintainerDownloads');

console.time();
// assumes that your PC username is the same as your npm username.
getMaintainerDownloads(process.env.USER).then((data) => {
  console.log(data);
  console.timeEnd();
});
