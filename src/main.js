var Bluebird = require('bluebird');
var domready = require('domready');
var Cropper = require('./crop');
var filesaver = require('browser-filesaver');
var imageUtil = require('./imageutil');

var selection = null;

var $ = document.getElementById.bind(document);

function handleFile(file) {
	return handleUrl(URL.createObjectURL(file));
}

function handleUrl(url) {
	if (handleUrl.loading) {
		return Bluebird.reject();
	}
	handleUrl.loading = true;
	var canvas = $('image');
	return imageUtil.urlToCanvas(canvas, url)
		.then(function (image) {
			selection = new Cropper(canvas, image, true);
			var selectSize = Math.min(Math.min(256, image.width), Math.min(256, image.height));
			selection.init(0, 0, selectSize, selectSize);
			handleUrl.loading = false;
			setTimeout(function () {
				$('input').className = 'hidden';
				$('edit').className = '';
				$('button-save').disabled = null;
			}, 1);
		})
		.finally(function () {
			handleUrl.loading = false;
		});
}

handleUrl.loading = false;

var saveData = function (data, fileName) {
	var blob = new Blob([data], {type: "octet/stream"});
	filesaver.saveAs(blob, fileName);
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
		if (selection) {
			selection.clear();
		}
		selection = null;
		$('file-link').value = '';
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
		if (selection.getWidth() !== targetSize) {
			data = imageUtil.resizeRGBA(data, selection.getWidth(), selection.getHeight(), targetSize, targetSize);
		}
		var worker = new Worker("/build/worker-bundle.js");
		worker.onmessage = function (e) {
			var targetData = e.data;
			saveData(targetData, 'spray.vtf');
			saving = false;
			saveButton.textContent = 'Save';
			saveButton.disabled = null;
		};
		worker.postMessage({data: data, size: targetSize});
	};
	$('file-link').addEventListener('input', function () {
		this.classList.remove('error');
	}, false);
	$('input-text').addEventListener('submit', function (e) {
		var input = $('file-link');
		e.preventDefault();
		var link = input.value;
		input.classList.add('loading');
		handleUrl('https://cors-anywhere.herokuapp.com/' + link).catch(function () {
			input.classList.add('error');
		}).finally(function () {
			input.classList.remove('loading');
		});
	}, false);

	window.addEventListener('paste', function (e) {
		var items = (event.clipboardData || event.originalEvent.clipboardData).items;
		for (var i = 0; i < items.length; i++) {
			if (items[i].type === 'text/plain') {
				items[i].getAsString(handleUrl);
			} else if (items[i].type.substr(0, 6) === 'image/') {
				var file = items[i].getAsFile();
				handleFile(file);
			}
		}
	}, false);

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
