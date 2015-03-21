var $ = require('jquery');

var Cropper = function (canvas, image, keepAspect) {
	this.canvas = canvas;
	this.image = image;
	this.selection = null;
	this.keepAspect = keepAspect;
};
Cropper.prototype.init = function (x, y, w, h) {
	this.selection = new Selection(x, y, w, h);
	applyToCanvas(this.canvas, this.image, this.selection, this.keepAspect);
};
/**
 * Get the selected part of the image as a canvas
 *
 * @returns {HTMLCanvasElement}
 */
Cropper.prototype.getResults = function () {
	var outputContext, outputCanvas;
	outputCanvas = /** @type {!HTMLCanvasElement} */  document.createElement('canvas');
	outputContext = outputCanvas.getContext('2d');
	outputCanvas.width = this.selection.w;
	outputCanvas.height = this.selection.h;
	outputContext.drawImage(this.image, this.selection.x, this.selection.y, this.selection.w, this.selection.h, 0, 0, this.selection.w, this.selection.h);
	return outputCanvas;
};


// define Selection constructor
function Selection(x, y, w, h) {
	this.x = x; // initial positions
	this.y = y;
	this.w = w; // and size
	this.h = h;

	this.px = x; // extra variables to dragging calculations
	this.py = y;

	this.csize = 6; // resize cubes size
	this.csizeh = 10; // resize cubes size (on hover)

	this.bHow = [false, false, false, false]; // hover statuses
	this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
	this.bDrag = [false, false, false, false]; // drag statuses
	this.bDragAll = false; // drag whole selection
}

// define Selection draw method
Selection.prototype.draw = function (ctx, image) {

	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	ctx.strokeRect(this.x, this.y, this.w, this.h);

	// draw part of original image
	if (this.w > 0 && this.h > 0) {
		ctx.drawImage(image, this.x, this.y, this.w, this.h, this.x, this.y, this.w, this.h);
	}

	// draw resize cubes
	ctx.fillStyle = '#fff';
	ctx.fillRect(this.x - this.iCSize[0], this.y - this.iCSize[0], this.iCSize[0] * 2, this.iCSize[0] * 2);
	ctx.fillRect(this.x + this.w - this.iCSize[1], this.y - this.iCSize[1], this.iCSize[1] * 2, this.iCSize[1] * 2);
	ctx.fillRect(this.x + this.w - this.iCSize[2], this.y + this.h - this.iCSize[2], this.iCSize[2] * 2, this.iCSize[2] * 2);
	ctx.fillRect(this.x - this.iCSize[3], this.y + this.h - this.iCSize[3], this.iCSize[3] * 2, this.iCSize[3] * 2);
};

function drawScene(ctx, theSelection, image) { // main drawScene function
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

	// draw source image
	ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

	// and make it darker
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	// draw selection
	theSelection.draw(ctx, image);
}

var applyToCanvas = function (canvas, image, selection, keepAspect) {
	var theSelection = selection;
	var ctx = canvas.getContext('2d');

	canvas.addEventListener('mousemove', function (e) { // binding mouse move event
		var newFW, newFH;
		var i, canvasOffset = $(canvas).offset();
		var iMouseX = Math.floor(e.pageX - canvasOffset.left);
		var iMouseY = Math.floor(e.pageY - canvasOffset.top);

		// in case of drag of whole selector
		if (theSelection.bDragAll) {
			theSelection.x = iMouseX - theSelection.px;
			theSelection.y = iMouseY - theSelection.py;
		}

		for (i = 0; i < 4; i++) {
			theSelection.bHow[i] = false;
			theSelection.iCSize[i] = theSelection.csize;
		}

		// hovering over resize cubes
		if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
			iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

			theSelection.bHow[0] = true;
			theSelection.iCSize[0] = theSelection.csizeh;
		}
		if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
			iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

			theSelection.bHow[1] = true;
			theSelection.iCSize[1] = theSelection.csizeh;
		}
		if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
			iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

			theSelection.bHow[2] = true;
			theSelection.iCSize[2] = theSelection.csizeh;
		}
		if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
			iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

			theSelection.bHow[3] = true;
			theSelection.iCSize[3] = theSelection.csizeh;
		}

		// in case of dragging of resize cubes
		var iFW, iFH, iFX, iFY;
		if (theSelection.bDrag[0]) {
			var oldEndX = theSelection.x + theSelection.w;
			var oldEndY = theSelection.y + theSelection.h;
			iFX = iMouseX - theSelection.px;
			iFY = iMouseY - theSelection.py;
			iFW = theSelection.w + theSelection.x - iFX;
			iFH = theSelection.h + theSelection.y - iFY;
			if (keepAspect) {
				iFW = iFH = Math.round((iFW + iFH) / 2);
				iFX = oldEndX - iFW;
				iFY = oldEndY - iFH;
			}
		}
		if (theSelection.bDrag[1]) {
			var oldEndY = theSelection.y + theSelection.h;
			iFX = theSelection.x;
			iFY = iMouseY - theSelection.py;
			iFW = iMouseX - theSelection.px - iFX;
			iFH = theSelection.h + theSelection.y - iFY;
			if (keepAspect) {
				iFW = iFH = Math.round((iFW + iFH) / 2);
				iFY = oldEndY - iFH;
			}
		}
		if (theSelection.bDrag[2]) {
			iFX = theSelection.x;
			iFY = theSelection.y;
			iFW = iMouseX - theSelection.px - iFX;
			iFH = iMouseY - theSelection.py - iFY;
			if (keepAspect) {
				iFW = iFH = Math.round((iFW + iFH) / 2);
			}
		}
		if (theSelection.bDrag[3]) {
			var oldEndX = theSelection.x + theSelection.w;
			iFX = iMouseX - theSelection.px;
			iFY = theSelection.y;
			iFW = theSelection.w + theSelection.x - iFX;
			iFH = iMouseY - theSelection.py - iFY;
			if (keepAspect) {
				iFW = iFH = Math.round((iFW + iFH) / 2);
				iFX = oldEndX - iFW;
			}
		}

		if (iFW > theSelection.csizeh * 2 && iFH > theSelection.csizeh * 2) {
			theSelection.w = iFW;
			theSelection.h = iFH;

			theSelection.x = iFX;
			theSelection.y = iFY;
		}

		drawScene(ctx, theSelection, image);
	}, false);

	canvas.addEventListener('mousedown', function (e) { // binding mousedown event
		var i, canvasOffset = $(canvas).offset();
		var iMouseX = Math.floor(e.pageX - canvasOffset.left);
		var iMouseY = Math.floor(e.pageY - canvasOffset.top);

		theSelection.px = iMouseX - theSelection.x;
		theSelection.py = iMouseY - theSelection.y;

		if (theSelection.bHow[0]) {
			theSelection.px = iMouseX - theSelection.x;
			theSelection.py = iMouseY - theSelection.y;
		}
		if (theSelection.bHow[1]) {
			theSelection.px = iMouseX - theSelection.x - theSelection.w;
			theSelection.py = iMouseY - theSelection.y;
		}
		if (theSelection.bHow[2]) {
			theSelection.px = iMouseX - theSelection.x - theSelection.w;
			theSelection.py = iMouseY - theSelection.y - theSelection.h;
		}
		if (theSelection.bHow[3]) {
			theSelection.px = iMouseX - theSelection.x;
			theSelection.py = iMouseY - theSelection.y - theSelection.h;
		}


		if (iMouseX > theSelection.x + theSelection.csizeh && iMouseX < theSelection.x + theSelection.w - theSelection.csizeh &&
			iMouseY > theSelection.y + theSelection.csizeh && iMouseY < theSelection.y + theSelection.h - theSelection.csizeh) {

			theSelection.bDragAll = true;
		}

		for (i = 0; i < 4; i++) {
			if (theSelection.bHow[i]) {
				theSelection.bDrag[i] = true;
			}
		}
	}, false);

	canvas.addEventListener('mouseup', function (e) { // binding mouseup event
		theSelection.bDragAll = false;

		for (var i = 0; i < 4; i++) {
			theSelection.bDrag[i] = false;
		}
		theSelection.px = 0;
		theSelection.py = 0;
	}, false);

	drawScene(ctx, theSelection, image);
};

module.exports = Cropper;
