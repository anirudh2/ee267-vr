
/**
 * @file functions to comptue model/view/projection matrices
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/**
 * MVPmat
 *
 * @class MVPmat
 * @classdesc Class for holding and computing model/view/projection matrices.
 *
 * @param  {DisplayParameters} dispParams    display parameters
 */
var MVPmat = function ( dispParams ) {

	// Alias for acceccing this from a closure
	var _this = this;


	// A model matrix
	this.modelMat = new THREE.Matrix4();

	// A view matrix
	this.viewMat = new THREE.Matrix4();

	// A projection matrix
	this.projectionMat = new THREE.Matrix4();



	/* Private functions */

	// A function to compute a model matrix based on the current state
	//
	// INPUT
	// state: state of StateController
	function computeModelTransform( state ) {

		/* TODO (2.1.1.3) Matrix Update / (2.1.2) Model Rotation  */

		return new THREE.Matrix4();

	}

	// A function to compute a view matrix based on the current state.
	//
	// NOTE
	// Do not use lookAt().
	//
	// INPUT
	// state: state of StateController
	function computeViewTransform( state ) {

		/* TODO (2.2.3) Implement View Transform */

		return new THREE.Matrix4().set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, - 800,
			0, 0, 0, 1 );

	}

	// A function to compute a perspective projection matrix based on the
	// current state
	//
	// NOTE
	// Do not use makePerspective().
	//
	// INPUT
	// Notations for the input is the same as in the class.
	function computePerspectiveTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		/* TODO (2.3.1) Implement Perspective Projection */

		return new THREE.Matrix4().set(
				6.7, 0, 0, 0,
				0, 6.5, 0, 0,
				0, 0, - 1.0, - 2.0,
				0, 0, - 1.0, 0 );

	}

	// A function to compute a orthographic projection matrix based on the
	// current state
	//
	// NOTE
	// Do not use makeOrthographic().
	//
	// INPUT
	// Notations for the input is the same as in the class.
	function computeOrthographicTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		/* TODO (2.3.2) Implement Orthographic Projection */

		return new THREE.Matrix4();

	}



	/* Public functions */

	// Update the model/view/projection matrices
	// This function is called in every frame (animate() function in render.js).
	this.update = function ( state ) {

		// Compute model matrix
		this.modelMat.copy( computeModelTransform( state ) );

		// Compute view matrix
		this.viewMat.copy( computeViewTransform( state ) );

		// Compute projection matrix
		if ( state.perspectiveMat ) {

			var right = ( dispParams.canvasWidth * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

			var left = - right;

			var top = ( dispParams.canvasHeight * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

			var bottom = - top;

			this.projectionMat.copy( computePerspectiveTransform(
				left, right, top, bottom, state.clipNear, state.clipFar ) );

		} else {

			var right = dispParams.canvasWidth * dispParams.pixelPitch / 2;

			var left = - right;

			var top = dispParams.canvasHeight * dispParams.pixelPitch / 2;

			var bottom = - top;

			this.projectionMat.copy( computeOrthographicTransform(
				left, right, top, bottom, state.clipNear, state.clipFar ) );

		}

	};



	/* Grading purpose - Ignore here! */

	this.computeModelTransform = computeModelTransform;

	this.computeViewTransform = computeViewTransform;

	this.computePerspectiveTransform = computePerspectiveTransform;

	this.computeOrthographicTransform = computeOrthographicTransform;

};
