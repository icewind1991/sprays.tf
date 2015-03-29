var Cropper = function (canvas, image, keepAspect) {
	this.canvas = canvas;
	this.image = image;
	this.selection = null;
	this.keepAspect = keepAspect;
	this.onMove = this.mouseMove.bind(this);
	this.onDown = this.mouseDown.bind(this);
	this.onOut = this.mouseOut.bind(this);
	this.onUp = this.mouseUp.bind(this);
};
Cropper.prototype.init = function (x, y, w, h) {
	this.selection = new Selection(x, y, w, h);
	this.applyToCanvas();
};
Cropper.prototype.setImage = function (image) {
	this.image = image;
	var ctx = this.canvas.getContext('2d');
	drawScene(ctx, this.selection, this.image);
};
Cropper.prototype.applyToCanvas = function () {
	this.canvas.addEventListener('mousemove', this.onMove, false);

	this.canvas.addEventListener('mousedown', this.onDown, false);

	this.canvas.addEventListener('mouseout', this.onOut, false);

	var ctx = this.canvas.getContext("2d");
	this.canvas.addEventListener('mouseup', this.onUp, false);

	drawScene(ctx, this.selection, this.image);
};
Cropper.prototype.clear = function(){
	this.canvas.removeEventListener('mousemove', this.onMove);
	this.canvas.removeEventListener('mousedown', this.onDown);
	this.canvas.removeEventListener('mouseout', this.onOut);
	this.canvas.removeEventListener('mouseup', this.onUp);
};
/**
 * Get the selected part of the image
 *
 * @returns {CanvasPixelArray}
 */
Cropper.prototype.getResults = function () {
	var ctx = this.canvas.getContext("2d");
	ctx.drawImage(this.image, 0, 0, ctx.canvas.width, ctx.canvas.height); //redraw the original image
	var data = ctx.getImageData(this.selection.x, this.selection.y, this.selection.w, this.selection.h).data;
	drawScene(ctx, this.selection, this.image);
	return data;
};

Cropper.prototype.getWidth = function () {
	return this.selection.w;
};

Cropper.prototype.getHeight = function () {
	return this.selection.h;
};

function getOffset(element) {
	var box = element.getBoundingClientRect();
	return {
		top : box.top + window.pageYOffset - document.documentElement.clientTop,
		left: box.left + window.pageXOffset - document.documentElement.clientLeft
	};
}

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

Cropper.prototype.mouseMove = function (e) {
	var image = this.image;
	var oldEndX, oldEndY;
	var i, canvasOffset = getOffset(this.canvas);
	var iMouseX = Math.floor(e.pageX - canvasOffset.left);
	var iMouseY = Math.floor(e.pageY - canvasOffset.top);

	// in case of drag of whole selector
	if (this.selection.bDragAll) {
		var xStart = iMouseX - this.selection.px;
		var xEnd = xStart + this.selection.w;
		var yStart = iMouseY - this.selection.py;
		var yEnd = yStart + this.selection.h;
		if (xStart > 0) {
			if (xEnd < image.width) {
				this.selection.x = xStart;
			} else {
				this.selection.x = image.width - this.selection.w;
			}
		} else {
			this.selection.x = 0;
		}
		if (yStart > 0) {
			if (yEnd < image.height) {
				this.selection.y = yStart;
			} else {
				this.selection.y = image.height - this.selection.w;
			}
		} else {
			this.selection.y = 0;
		}
	}

	for (i = 0; i < 4; i++) {
		this.selection.bHow[i] = false;
		this.selection.iCSize[i] = this.selection.csize;
	}

	// hovering over resize cubes
	if (iMouseX > this.selection.x - this.selection.csizeh && iMouseX < this.selection.x + this.selection.csizeh &&
		iMouseY > this.selection.y - this.selection.csizeh && iMouseY < this.selection.y + this.selection.csizeh) {

		this.selection.bHow[0] = true;
		this.selection.iCSize[0] = this.selection.csizeh;
	}
	if (iMouseX > this.selection.x + this.selection.w - this.selection.csizeh && iMouseX < this.selection.x + this.selection.w + this.selection.csizeh &&
		iMouseY > this.selection.y - this.selection.csizeh && iMouseY < this.selection.y + this.selection.csizeh) {

		this.selection.bHow[1] = true;
		this.selection.iCSize[1] = this.selection.csizeh;
	}
	if (iMouseX > this.selection.x + this.selection.w - this.selection.csizeh && iMouseX < this.selection.x + this.selection.w + this.selection.csizeh &&
		iMouseY > this.selection.y + this.selection.h - this.selection.csizeh && iMouseY < this.selection.y + this.selection.h + this.selection.csizeh) {

		this.selection.bHow[2] = true;
		this.selection.iCSize[2] = this.selection.csizeh;
	}
	if (iMouseX > this.selection.x - this.selection.csizeh && iMouseX < this.selection.x + this.selection.csizeh &&
		iMouseY > this.selection.y + this.selection.h - this.selection.csizeh && iMouseY < this.selection.y + this.selection.h + this.selection.csizeh) {

		this.selection.bHow[3] = true;
		this.selection.iCSize[3] = this.selection.csizeh;
	}

	// in case of dragging of resize cubes
	var iFW, iFH, iFX, iFY;
	if (this.selection.bDrag[0]) {
		oldEndX = this.selection.x + this.selection.w;
		oldEndY = this.selection.y + this.selection.h;
		iFX = iMouseX - this.selection.px;
		iFY = iMouseY - this.selection.py;
		iFW = this.selection.w + this.selection.x - iFX;
		iFH = this.selection.h + this.selection.y - iFY;
		if (this.keepAspect) {
			iFW = iFH = Math.round((iFW + iFH) / 2);
			iFX = oldEndX - iFW;
			iFY = oldEndY - iFH;
		}
	}
	if (this.selection.bDrag[1]) {
		oldEndY = this.selection.y + this.selection.h;
		iFX = this.selection.x;
		iFY = iMouseY - this.selection.py;
		iFW = iMouseX - this.selection.px - iFX;
		iFH = this.selection.h + this.selection.y - iFY;
		if (this.keepAspect) {
			iFW = iFH = Math.round((iFW + iFH) / 2);
			iFY = oldEndY - iFH;
		}
	}
	if (this.selection.bDrag[2]) {
		iFX = this.selection.x;
		iFY = this.selection.y;
		iFW = iMouseX - this.selection.px - iFX;
		iFH = iMouseY - this.selection.py - iFY;
		if (this.keepAspect) {
			iFW = iFH = Math.round((iFW + iFH) / 2);
		}
	}
	if (this.selection.bDrag[3]) {
		oldEndX = this.selection.x + this.selection.w;
		iFX = iMouseX - this.selection.px;
		iFY = this.selection.y;
		iFW = this.selection.w + this.selection.x - iFX;
		iFH = iMouseY - this.selection.py - iFY;
		if (this.keepAspect) {
			iFW = iFH = Math.round((iFW + iFH) / 2);
			iFX = oldEndX - iFW;
		}
	}

	if (
		iFW > this.selection.csizeh * 2 && iFH > this.selection.csizeh * 2 &&
		iFX > 0 && iFY > 0 && (iFH + iFY) < image.height && (iFW + iFX) < image.width
	) {
		this.selection.w = iFW;
		this.selection.h = iFH;

		this.selection.x = iFX;
		this.selection.y = iFY;
	}

	var ctx = this.canvas.getContext('2d');
	drawScene(ctx, this.selection, this.image);
};

Cropper.prototype.mouseDown = function (e) {
	var i, canvasOffset = getOffset(this.canvas);
	var iMouseX = Math.floor(e.pageX - canvasOffset.left);
	var iMouseY = Math.floor(e.pageY - canvasOffset.top);

	this.selection.px = iMouseX - this.selection.x;
	this.selection.py = iMouseY - this.selection.y;

	if (this.selection.bHow[0]) {
		this.selection.px = iMouseX - this.selection.x;
		this.selection.py = iMouseY - this.selection.y;
	}
	if (this.selection.bHow[1]) {
		this.selection.px = iMouseX - this.selection.x - this.selection.w;
		this.selection.py = iMouseY - this.selection.y;
	}
	if (this.selection.bHow[2]) {
		this.selection.px = iMouseX - this.selection.x - this.selection.w;
		this.selection.py = iMouseY - this.selection.y - this.selection.h;
	}
	if (this.selection.bHow[3]) {
		this.selection.px = iMouseX - this.selection.x;
		this.selection.py = iMouseY - this.selection.y - this.selection.h;
	}


	if (iMouseX > this.selection.x + this.selection.csizeh && iMouseX < this.selection.x + this.selection.w - this.selection.csizeh &&
		iMouseY > this.selection.y + this.selection.csizeh && iMouseY < this.selection.y + this.selection.h - this.selection.csizeh) {

		this.selection.bDragAll = true;
	}

	for (i = 0; i < 4; i++) {
		if (this.selection.bHow[i]) {
			this.selection.bDrag[i] = true;
		}
	}
};

Cropper.prototype.mouseOut = function (e) {
	var image = this.image;
	var canvasOffset = getOffset(this.canvas);
	var iMouseX = Math.floor(e.pageX - canvasOffset.left);
	var iMouseY = Math.floor(e.pageY - canvasOffset.top);
	if (iMouseX < 0 || iMouseX > image.width || iMouseY < 0 || iMouseY > image.height) {
		var event = new Event('mouseup');
		this.canvas.dispatchEvent(event);
	}
};

Cropper.prototype.mouseUp = function () { // binding mouseup event
	this.selection.bDragAll = false;

	for (var i = 0; i < 4; i++) {
		this.selection.bDrag[i] = false;
	}
	this.selection.px = 0;
	this.selection.py = 0;
};

module.exports = Cropper;
