'use strict';

var urlParse = require('url').parse
  , decode   = require('querystring').decode

  , parse = JSON.parse;

module.exports = function (notify, options, state) {
	var log = options.log;
	return function (req, res) {
		var id = urlParse(req.url, true).query.id, data = '';

		req.on('data', function (chunk) { data += chunk; });
		req.on('end', function () {
			if (log) {
				console.log("Client[" + id + "] -> Server", parse(decode(data).data));
			}
			notify(id, data);
            state.data = data;
			res.writeHead(200);
			res.end();
		});
	};
};
