var vtf = require('vtf');

self.onmessage = function (input) {
	var targetData = vtf.fromRGBA(input.data, input.size, input.size);
	postMessage(targetData);
};
