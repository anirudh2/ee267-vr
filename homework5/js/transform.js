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
	// without head-and-neck model
	//
	// INPUT
	// state: the state object of StateController
	// halfIpdShift: half of the ipd in [mm] (negated for right eye)
	function computeViewTransformFromQuatertion( state, halfIpdShift ) {

		// TODO: 2.5.i
		// Modify this function to use the orietation from the IMU.
		// You can access the quaternion by state.imuQuaternion

		var viewerPosition = state.viewerPosition;

		var translationMat =
			new THREE.Matrix4().makeTranslation(
				- viewerPosition.x,
				- viewerPosition.y,
				- viewerPosition.z );

		var ipdTranslateMat =
			new THREE.Matrix4().makeTranslation( halfIpdShift, 0, 0 );

		var viewMat = new THREE.Matrix4()
			.premultiply( translationMat )
			.premultiply( ipdTranslateMat );

		return viewMat;

	}


	// A function to compute a model matrix based on the current state
	// with head-and-neck model
	//
	// INPUT
	// state: the state object in StateController
	// halfIpdShift: half of the ipd in [mm] (negated for right eye)
	function computeViewTransformFromQuatertionWithHeadNeckmodel(
		state, halfIpdShift, neckLength, headLength ) {

		// TODO: 2.5.ii
		// Modify this function to use the orietation from the IMU and
		// incorporate the head-and-neck model.
		// You can access the quaternion by state.imuQuaternion.

		var viewerPosition = state.viewerPosition;

		var translationMat =
			new THREE.Matrix4().makeTranslation(
				- viewerPosition.x,
				- viewerPosition.y,
				- viewerPosition.z );

		var ipdTranslateMat =
			new THREE.Matrix4().makeTranslation( halfIpdShift, 0, 0 );

		var viewMat = new THREE.Matrix4()
			.premultiply( translationMat )
			.premultiply( ipdTranslateMat );

		return viewMat;

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

		if ( state.hnmodel ) {

		// Compute view matrix
			this.stereoViewMat.L =
				computeViewTransformFromQuatertionWithHeadNeckmodel(
					state, ipd / 2, dispParams.neckLength, dispParams.headLength );

			this.stereoViewMat.R =
				computeViewTransformFromQuatertionWithHeadNeckmodel(
					state, - ipd / 2, dispParams.neckLength, dispParams.headLength );

		} else {

		// Compute view matrix
			this.stereoViewMat.L =
				computeViewTransformFromQuatertion( state, ipd / 2 );

			this.stereoViewMat.R =
				computeViewTransformFromQuatertion( state, - ipd / 2 );

		}

		// Compute projection matrix
		var width = dispParams.canvasWidth * dispParams.pixelPitch;

		var height = dispParams.canvasHeight * dispParams.pixelPitch;

		var top = clipNear * M * height	/ 2 / d;

		var bottom = - top;

		var leftL = - clipNear * M * ( width - ipd ) / 2 / d;

		var rightL = clipNear * M *	ipd / 2 / d;

		this.stereoProjectionMat.L = computePerspectiveTransform(
			leftL, rightL, top, bottom, clipNear, clipFar );

		var leftR = - clipNear * M * ipd / 2 / d;

		var rightR = clipNear * M * ( width - ipd ) / 2 / d;

		this.stereoProjectionMat.R = computePerspectiveTransform(
			leftR, rightR, top, bottom, clipNear, clipFar );

	};

};
