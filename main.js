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
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param file
 * @param cb
 */
function fileToCanvas(canvas, file, cb) {
	var ctx = canvas.getContext('2d');
	var img = new Image();
	img.onload = function () {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
		cb(img);
	};
	img.src = URL.createObjectURL(file);
}

domready(function () {
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
