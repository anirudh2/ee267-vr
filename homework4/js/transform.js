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


	this.modelMat = new THREE.Matrix4();

	this.stereoViewMat =
		{ L: new THREE.Matrix4(), R: new THREE.Matrix4() };

	this.stereoProjectionMat =
		{ L: new THREE.Matrix4(), R: new THREE.Matrix4() };


	var ipd = dispParams.ipd;

	var M = dispParams.lensMagnification;

	var d = dispParams.distanceScreenViewer;


	/* Private functions */

	// A function to compute a model transform matrix
	function computeModelTransform( state ) {

		var modelTranslation = state.modelTranslation;

		var modelRotation = state.modelRotation;

		var translationMat
			= new THREE.Matrix4().makeTranslation(
				modelTranslation.x,	modelTranslation.y, modelTranslation.z );

		var rotationMatX =
			new THREE.Matrix4().makeRotationX(
				modelRotation.x * THREE.Math.DEG2RAD );

		var rotationMatY =
			new THREE.Matrix4().makeRotationY(
				modelRotation.y * THREE.Math.DEG2RAD );

		var modelMatrix = new THREE.Matrix4().
			premultiply( rotationMatY ).
			premultiply( rotationMatX ).
			premultiply( translationMat );

		return modelMatrix;

	}

	// A function to compute a model matrix based on the current state
	function computeViewTransform( state, halfIpdShift ) {

		var viewerPosition = state.viewerPosition;

		var viewerTarget = state.viewerTarget;

		var viewerUp = new THREE.Vector3( 0, 1, 0 );

		var translationMat
			= new THREE.Matrix4().makeTranslation(
				- viewerPosition.x,
				- viewerPosition.y,
				- viewerPosition.z );

		// Matrix4().lookAt is equivalent to what we implemented in HW1.
		var rotationMat = new THREE.Matrix4().lookAt(
			viewerPosition, viewerTarget, viewerUp ).transpose();

		var ipdTranslateMat
			= new THREE.Matrix4().makeTranslation( halfIpdShift, 0, 0 );

		return new THREE.Matrix4()
			.premultiply( translationMat )
			.premultiply( rotationMat )
			.premultiply( ipdTranslateMat );

	}


	function computePerspectiveTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		return new THREE.Matrix4()
			.makePerspective( left, right, top, bottom, clipNear, clipFar );

	}



	/* Public functions */

	// Update the model/view/projection matrices based on the current state
	// This function is called in every frame.
	//
	// INPUT
	// state: the state object of StateController
	// renderingMode: this variable decides which matrices are updated
	this.update = function ( state ) {

		var clipNear = state.clipNear;

		var clipFar = state.clipFar;

		// Compute model matrix
		this.modelMat = computeModelTransform( state );

		// Compute view matrix
		this.stereoViewMat.L = computeViewTransform( state, ipd / 2 );

		this.stereoViewMat.R = computeViewTransform( state, - ipd / 2 );

		// Compute projection matrix

		/* TODO Stereo rendering
		 * Modify right, left, top, bottom to compute correct perspective
		 * matrices for HMD. You may use some display parameters.
		 * The values may be different for left and right eyes.
		 */

		// Modify right, left, top, bottom to compute correct perspective
		// matrices for HMD. You may use some display parameters.
		// NOTE: The values given in the starter code is not correct at all.

		var right = 25 * ( dispParams.canvasWidth * dispParams.pixelPitch / 2 )
					* ( state.clipNear / dispParams.distanceScreenViewer );

		var left = - right;

		var top = 25 * ( dispParams.canvasHeight * dispParams.pixelPitch / 2 )
				   * ( state.clipNear / dispParams.distanceScreenViewer );

		var bottom = - top;

		this.stereoProjectionMat.L = computePerspectiveTransform(
			left, right, top, bottom, clipNear, clipFar );

		this.stereoProjectionMat.R = computePerspectiveTransform(
			left, right, top, bottom, clipNear, clipFar );

	};

};
