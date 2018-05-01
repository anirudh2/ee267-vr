/**
 * @file Class for display parameters
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/**
 * DisplayParameters
 *
 * @class DisplayParameters
 * @classdesc A class to hold display parameters.
 * 		The height and width holds the size fo a window in pixel.
 * 		These values are automatically updated when the window is resized.
 */
var DisplayParameters = function () {

	// Alias for acceccing this from a closure
	var _this = this;


	// screen width in [mm]
	var screenWidth = 132.5;

	// screen height in [mm]
	var screenHeight = 74.5;

	// horizontal screen resolution [pixels]
	var screenWidthResolution = 1920;

	// vertical screen resolution [pixels]
	var screenHeightResolution = 1080;

	// lens diameter in [mm]
	var lensDiameter = 34;

	// Focal length of the lens in [mm]
	var focalLength = 40;

	// Eye relief in [mm]
	var eyeRelief = 18;


	// Vertical resolution of the current window in [pixel]
	this.canvasHeight = window.innerHeight;

	// Horizontal resolution of the current window in [pixel]
	this.canvasWidth = window.innerWidth;

	// Interpupillnary distance in [mm]
	this.ipd = 64; // 32 works well

	// distance between lens and screen in [mm]
	this.distLensScreen = 39;

	// Pixel pitch of the screen
	this.pixelPitch = screenWidth / screenWidthResolution;

	// Magnification of the lens
	this.lensMagnification = computeLensMagnification();

	// Distance between the viewer and the virtual screen in [mm]
	this.distanceScreenViewer = computeDistanceScreenViewer();



	/* Private functions */

	// Compute the magnification of the lens
	//
	// OUTPUT
	// Lens magnification
	//
	// NOTE
	// Use private variables defined above.
	// You may not need all of them.
	function computeLensMagnification() {

		return focalLength/(focalLength - _this.distLensScreen);

	}


	// Compute distance between the virtual screen
	//
	// OUTPUT
	// Distance between the virtual image and a viewer in [mm]
	//
	// NOTE
	// Use private variables defined above.
	// You may not need all of them.
	function computeDistanceScreenViewer() {

		return eyeRelief + 1/Math.abs((1/focalLength)-(1/_this.distLensScreen));
		// return 1500;

	}



	/* Event listners */

	// For automatic update of canvasHieght and canvasWidth upon
	// window resizing (jQuery's method)
	$( window ).resize( function () {

		_this.canvasHeight = window.innerHeight;

		_this.canvasWidth = window.innerWidth;

	} );


};
