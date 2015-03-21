var domready = require('domready');
var Cropper = require('./crop');
var vtf = require('vtf');

var selection = null;

var $ = document.getElementById.bind(document);

function handleFile(file) {
	console.log(file);
	var canvas = $('image');
	fileToCanvas(canvas, file, function (image) {
		$('input').className = 'hidden';
		$('edit').className = '';
		$('button-save').disabled = null;
		selection = new Cropper(canvas, image, true);
		var selectSize = Math.min(Math.min(256, image.width), Math.min(256, image.height));
		selection.init(0, 0, selectSize, selectSize);
	});
}

function resizeImageToWidth(image, width, cb) {
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
}

var saveData = (function () {
	var a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	return function (data, fileName) {
		var blob = new Blob([data], {type: "octet/stream"}),
			url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};
}());

/**
 * get an emscripten pointer to the image data from the canvas
 */
function dataFromCanvas(canvas) {
	var ctx = canvas.getContext("2d");
	return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

var resize = function resize(sourceRGBA, sourceWidth, sourceHeight, targetWidth, targetHeight) {
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

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param file
 * @param cb
 */
function fileToCanvas(canvas, file, cb) {
	var img = new Image();
	img.onload = function () {
		resizeImageToWidth(img, window.innerWidth, function (scaledImage) {
			canvas.width = scaledImage.width;
			canvas.height = scaledImage.height;

			cb(scaledImage);
		});
	};
	img.src = URL.createObjectURL(file);
}

function getTargetWidth(width) {
	if (width > 512) {
		return 512;
	}
	// get closest power of 2
	return Math.pow(2, Math.round(Math.log(width) / Math.log(2)));
}

domready(function () {
	var saving = false;
	$('button-new').onclick = function () {
		$('input').className = '';
		$('edit').className = 'hidden';
		selection = null;
		$('button-save').disabled = 'disabled';
	};

	$('button-save').onclick = function () {
		if (!selection || saving) {
			return;
		}
		saving = true;
		$('button-save').disabled = 'disabled';
		$('button-save').textContent = 'Working...';
		setTimeout(function () {
			var data = selection.getResults();
			var targetSize = getTargetWidth(selection.getWidth());
			if (selection.getWidth() != targetSize) {
				data = resize(data, selection.getWidth(), selection.getHeight(), targetSize, targetSize);
			}
			var targetData = vtf.fromRGBA(data, targetSize, targetSize);
			saveData(targetData, 'spray.vtf');
			saving = false;
			$('button-save').textContent = 'Save';
			$('button-save').disabled = null;
		}, 1);
	};

	var dropArea = $('droparea');
	var handleDragOver = function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	};
	if (dropArea) {
		dropArea.onclick = function () {
			$('file').click();
		};
		$('file').onchange = function (e) {
			var files = e.target.files; // FileList object
			if (files[0]) {
				handleFile(files[0]);
			}
		};
		dropArea.addEventListener('dragover', handleDragOver, false);
		dropArea.addEventListener('drop', function (evt) {
			evt.stopPropagation();
			evt.preventDefault();
			$('file').files = evt.dataTransfer.files;
		}, false);
	}
});
