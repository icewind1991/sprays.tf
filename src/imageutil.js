var Bluebird = require('bluebird');

var resizeImageToWidth = function (image, width, cb) {
	var c = document.createElement("canvas");
	var ctx = c.getContext("2d");
	width = Math.min(width, image.width);
	var height = width / image.width * image.height;
	c.width = width;
	c.height = height;
	ctx.drawImage(image, 0, 0, width, height);
	var img = new Image();
	img.onload = function () {
		cb(img);
	};
	img.src = c.toDataURL();
};

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} url
 */
exports.urlToCanvas = function (canvas, url) {
	return new Bluebird(function (resolve, reject) {
		var img = new Image();
		img.crossOrigin = "Anonymous";
		img.onload = function () {
			resizeImageToWidth(img, window.innerWidth, function (scaledImage) {
				canvas.width = scaledImage.width;
				canvas.height = scaledImage.height;

				resolve(scaledImage);
			});
		};
		img.onerror = function () {
			reject('Failed loading image');
		};
		img.src = url;
	});
};

exports.canvasToImage = function (canvas, cb) {
	var img = new Image();
	img.onload = function () {
		cb(img);
	};
	img.src = canvas.toDataURL();
};

exports.resizeRGBA = function (sourceRGBA, sourceWidth, sourceHeight, targetWidth, targetHeight) {
	var sourceCanvas = document.createElement("canvas");
	var sourceContext = sourceCanvas.getContext("2d");
	sourceCanvas.width = sourceWidth;
	sourceCanvas.height = sourceHeight;
	var imgData = sourceContext.createImageData(sourceWidth, sourceHeight);
	imgData.data.set(sourceRGBA);
	sourceContext.putImageData(imgData, 0, 0);

	var targetCanvas = document.createElement("canvas");
	var targetContext = targetCanvas.getContext("2d");
	targetCanvas.width = targetWidth;
	targetCanvas.height = targetHeight;
	targetContext.drawImage(sourceCanvas, 0, 0, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

	return targetContext.getImageData(0, 0, targetWidth, targetHeight).data;
};

exports.clearBackground = function (image, background, cb) {
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	canvas.width = image.width;
	canvas.height = image.height;
	context.drawImage(image, 0, 0, image.width, image.height);

	var getOpacity = function (pixel, color) {
		var diff1 = Math.abs(pixel[0] - color[0]);
		var diff2 = Math.abs(pixel[1] - color[1]);
		var diff3 = Math.abs(pixel[2] - color[2]);
		var diff = (diff1 + diff2 + diff3) / 3;
		if (diff > 10) {
			return 1;
		} else {
			return diff / 10;
		}
	};

	var srcData = context.getImageData(0, 0, canvas.width, canvas.height);
	var dstData = context.createImageData(srcData);

	var pixels = srcData.data;
	var l = pixels.length;

	for (var i = 0; i < l; i += 4) {
		var r = pixels[i];
		var g = pixels[i + 1];
		var b = pixels[i + 2];
		var a = pixels[i + 3];
		dstData.data[i] = r;
		dstData.data[i + 1] = g;
		dstData.data[i + 2] = b;
		dstData.data[i + 3] = a * getOpacity([r, g, b], background);
	}

	context.putImageData(dstData, 0, 0);
	exports.canvasToImage(canvas, cb);
};
