var domready = require('domready');
var Cropper = require('./crop');

var $ = document.getElementById.bind(document);

function handleFile(file) {
	console.log(file);
	var canvas = $('image');
	fileToCanvas(canvas, file, function (image) {
		var selection = new Cropper(canvas, image, true);
		selection.init(200, 200, 200, 200);
	});
	$('input').className = 'hidden';
	$('edit').className = '';
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

domready(function () {
	$('button-new').onclick = function () {
		$('input').className = '';
		$('edit').className = 'hidden';
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
