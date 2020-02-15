'use strict';

var parse = require('url').parse
  , sse   = require('./sse')
  , xhr   = require('./xhr');

module.exports = function (options) {
    options = options || {};
	var ssePath = options.ssePath || '/sse-slides/'
	  , xhrPath = options.xhrPath || '/slide/'
      , state = {count: 0}
	  , sseHandler = sse(options, state), xhrHandler = xhr(sseHandler.notify, options, state);

	return function (req, res, next) {
		var path = parse(req.url).pathname;
		if (path === ssePath) sseHandler(req, res);
		else if (path === xhrPath) xhrHandler(req, res);
		else next();
	};
};
