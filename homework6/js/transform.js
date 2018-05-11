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

		var viewerPosition = state.viewerPosition;

		// string together rotations by multiply quaternions
		// first premultiply by rotateY180 so that IMU faces the origin.
		// (default quaternion is such that orientation matches the world ref frame).
		// then postmultiply to flip the z-axis, so it points back like a camera.
		// another way to think about it: the premultiply is extrinsic rotation,
		// the postmuliply is intrinsic rotation
		// rotation around y-axis by 180

		var rotateY180 = new THREE.Quaternion( 0, 1, 0, 0 );

		var viewerQuaternion = state.imuQuaternion.clone();

		viewerQuaternion.premultiply( rotateY180 ).multiply( rotateY180 );

		var translationMat =
			new THREE.Matrix4().makeTranslation(
				- viewerPosition.x,
				- viewerPosition.y,
				- viewerPosition.z );

		var q = viewerQuaternion.clone().inverse();

		var rotationMat = new THREE.Matrix4().makeRotationFromQuaternion( q );

		var ipdTranslateMat =
			new THREE.Matrix4().makeTranslation( halfIpdShift, 0, 0 );

		var viewMat = new THREE.Matrix4()
			.premultiply( translationMat )
			.premultiply( rotationMat )
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

		// Compute view matrix
		this.stereoViewMat.L =
			computeViewTransformFromQuatertion( state, ipd / 2 );

		this.stereoViewMat.R =
			computeViewTransformFromQuatertion( state, - ipd / 2 );

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
