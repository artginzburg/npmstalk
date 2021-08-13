exports.endpoint = function (request, response) {
  response.end(JSON.stringify({ test: 'Hello world!' }));
};
