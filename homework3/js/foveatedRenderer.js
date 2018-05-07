/**
 * @file Class for a foveated renderer
 *
 * @copyright The Board of Trustees of the Leland
 Stanford Junior University
 * @version 2018/03/28
 */


/**
 * DofRenderer
 *
 * @class FoveatedRenderer
 * @classdesc Class for foveated rendering.
 * This class should be used for adding some post effets on a pre-rendered scene.
 *
 *
 * @param  {THREE.WebGLRenderer} webglRenderer renderer
 * @param  {DisplayParameters} dispParams    display parameters
 */
var FoveatedRenderer = function ( webglRenderer, dispParams ) {

	// Alias for acceccing this from a closure
	var _this = this;


	// Set up a render target (a.k.a. frame buffer object in WebGL/OpenGL
	this.renderTarget = new THREE.WebGLRenderTarget(
		dispParams.canvasWidth, dispParams.canvasHeight );


	var camera = new THREE.Camera();

	var scene = new THREE.Scene();

	// angle per pixel in [degree]
	var pixelVA = computePixelVA(
		dispParams.pixelPitch, dispParams.distanceScreenViewer );

	// Eccentricity angle at which a 4x loss in resolution is imperceivable
	// (2*viusal degree of 1 pixel)*4
	var e1 = computeEcc( pixelVA*8 );

	// Eccentricity angle at which a 8x loss in resolution is imperceivable
	// (2*viusal degree of 1 pixel)*8
	var e2 = computeEcc( pixelVA*16 );

	var material = new THREE.RawShaderMaterial( {

		uniforms: {

			textureMap: { value: this.renderTarget.texture },

			windowSize: { value: new THREE.Vector2(
				dispParams.canvasWidth, dispParams.canvasHeight ) },

			// Gaze position in [px]
			gazePosition: { value: new THREE.Vector2() },

			// Gaussian kernel 1
			blur1: { value: [ 0.0625, 0.2500, 0.3750, 0.2500, 0.0625 ] },

			// Gaussian kernel 2
			blur2: { value: [ 0.0039, 0.0312, 0.1094, 0.2188,
				0.2734, 0.2188, 0.1094, 0.0312, 0.0039 ] },

			e1: { value: e1 },

			e2: { value: e2 },

			pixelVA: { value: pixelVA },

		},

		vertexShader: $( "#vShaderFoveated" ).text(),

		fragmentShader: $( "#fShaderFoveated" ).text(),

	} );


	// THREE.PlaneBufferGeometry( 2, 2 ) creates four vertices (-1,1,0),
	// (1,1,0),(-1,-1,0), (1,-1,0), which are position attributes. In addition,
	// it has texture coordinates (0,1), (1,1), (0,0), (1,0), which are uv
	// attributes. Check it in console to see what's stored in "mesh".
	var mesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 2, 2 ), material );

	scene.add( mesh );



	/* Private functions */

	// A function to computes the visual angle per pixel
	//
	// INPUT
	// pixelPitch: pixel pitch of your monitor in [mm]
	// distanceScreenViewer: distance between the viewer and the monitor
	//
	// OUTPUT
	// visual angle per pixel
	function computePixelVA( pixelPitch, distanceScreenViewer ) {

		// theta = rad2deg(2*arctan(pitch/2/distance))
		var theta = (180/Math.PI)*2*Math.atan(pixelPitch/(2*distanceScreenViewer));
		return theta;

	}

	// A function to computes the eccentricity correspoinding to a given
	// minimum angle of resolution in deg/cycle
	//
	// INPUT
	//  mar: Minimum angle of resolution in deg/cycle
	//
	// OUTPUT
	//  eccentricity
	function computeEcc( mar ) {

		// e = (mar-w0)/m
		var e = (mar-(1.0/48.0))/(0.0275);
		return e;

	}


	/* Public functions */

	// Perform rendering
	//
	// INPUT
	// state: the state variable in StateController
	this.render = function ( state ) {

		var gazePosition = state.gazePosition;

		material.uniforms.gazePosition.value.set( gazePosition.x, gazePosition.y );

		webglRenderer.render( scene, camera );

	};



	/* Event listners */

	// Automatic update of the renderer size when the window is resized.
	$( window ).resize( function () {

		_this.renderTarget.setSize(
			dispParams.canvasWidth, dispParams.canvasHeight );

		material.uniforms.windowSize.value.set(
			dispParams.canvasWidth, dispParams.canvasHeight );

	} );



	/* Grading purpose - Ignore here! */

	this.computeEcc = computeEcc;

	this.computePixelVA = computePixelVA;

};
