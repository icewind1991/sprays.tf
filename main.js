var domready = require('domready');
var Cropper = require('./crop');
var saver = require('./FileSaver');
var imageUtil = require('./imageutil');

var selection = null;

var $ = document.getElementById.bind(document);

function handleFile(file) {
	var canvas = $('image');
	imageUtil.fileToCanvas(canvas, file, function (image) {
		$('input').className = 'hidden';
		$('edit').className = '';
		$('button-save').disabled = null;
		selection = new Cropper(canvas, image, true);
		var selectSize = Math.min(Math.min(256, image.width), Math.min(256, image.height));
		selection.init(0, 0, selectSize, selectSize);
	});
}

var saveData = function (data, fileName) {
	var blob = new Blob([data], {type: "octet/stream"});
	saver.saveAs(blob, fileName);
};

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
		var saveButton = $('button-save');
		saving = true;
		saveButton.disabled = 'disabled';
		saveButton.textContent = 'Working...';
		var data = selection.getResults();
		var targetSize = getTargetWidth(selection.getWidth());
		if (selection.getWidth() != targetSize) {
			data = imageUtil.resizeRGBA(data, selection.getWidth(), selection.getHeight(), targetSize, targetSize);
		}
		var worker = new Worker("worker-bundle.js");
		worker.onmessage = function (e) {
			var targetData = e.data;
			saveData(targetData, 'spray.vtf');
			saving = false;
			saveButton.textContent = 'Save';
			saveButton.disabled = null;
		};
		worker.postMessage({data: data, size: targetSize});
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
