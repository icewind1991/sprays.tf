var vtf = require('vtf');

self.onmessage = function (e) {
	var targetData = vtf.fromRGBA(e.data.data, e.data.size, e.data.size);
	postMessage(targetData);
};
