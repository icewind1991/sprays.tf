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
 * @param file
 * @param cb
 */
exports.fileToCanvas = function (canvas, file, cb) {
	var img = new Image();
	img.onload = function () {
		resizeImageToWidth(img, window.innerWidth, function (scaledImage) {
			canvas.width = scaledImage.width;
			canvas.height = scaledImage.height;

			cb(scaledImage);
		});
	};
	img.src = URL.createObjectURL(file);
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
