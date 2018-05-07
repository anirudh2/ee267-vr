
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
		// Make the rotation and translation matrices as in the Lecture 2 slides
		tMat = new THREE.Matrix4().makeTranslation(state.modelTranslation.x,
		state.modelTranslation.y,state.modelTranslation.z);
		rXMat = new THREE.Matrix4().makeRotationX(state.modelRotation.x);
		rYMat = new THREE.Matrix4().makeRotationY(state.modelRotation.y);
		rMat = new THREE.Matrix4().multiplyMatrices(rXMat,rYMat); // first y then x
		// first rotate then translate (switch if we want to rotate about world axes)
		return new THREE.Matrix4().multiplyMatrices(tMat,rMat);
	}

	// A function to compute a view matrix based on the current state.
	//
	// NOTE
	// Do not use lookAt().
	//
	// INPUT
	// state: state of StateController
	function computeViewTransform( state ) {
		// Find zC
		eMinusC = new THREE.Vector3().subVectors(state.viewerPosition, state.viewerTarget);
		normEMinusC = eMinusC.length();
		zC = eMinusC.divideScalar(normEMinusC);
		// Find xC. As in Piazza, the up-vector is assumed to be (0,1,0)
		u = new THREE.Vector3(0,1,0);
		uCrosszC = new THREE.Vector3().crossVectors(u, zC);
		normUCrosszC = uCrosszC.length();
		xC = uCrosszC.divideScalar(normUCrosszC);
		// Find yC
		yC = new THREE.Vector3().crossVectors(zC, xC);
		// Return the view transform matrix as on Lecture 2 slide 56
		return new THREE.Matrix4().set(
			xC.x, xC.y, xC.z, -xC.dot(state.viewerPosition),
			yC.x, yC.y, yC.z, -yC.dot(state.viewerPosition),
			zC.x, zC.y, zC.z, -zC.dot(state.viewerPosition),
			0, 0, 0, 1 );
		// return new THREE.Matrix4().set(
		// 		1, 0, 0, 0,
		// 		0, 1, 0, 0,
		// 		0, 0, 1, -800,
		// 		0, 0, 0, 1 );

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

		// Define variables for legibility
		var mOne = (2*clipNear)/(right-left),
		mFive = (2*clipNear)/(top-bottom),
		mNine = (right+left)/(right-left),
		mTen = (top+bottom)/(top-bottom),
		mElf = -(clipFar + clipNear)/(clipFar - clipNear),
		mFift = -(2*clipFar*clipNear)/(clipFar-clipNear);

		// return the projection matrix as specified in Lecture 2 slide 61
		return new THREE.Matrix4().set(
				mOne, 0, mNine, 0,
				0, mFive, mTen, 0,
				0, 0, mElf, mFift,
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

		// Create variables for legibility
		var mOne = 2/(right-left),
		mSix = 2/(top-bottom),
		mElf = -2/(clipFar-clipNear),
		mThir = -(right+left)/(right-left),
		mFourt = -(top+bottom)/(top-bottom),
		mFift = -(clipFar+clipNear)/(clipFar-clipNear);

		// Return the orthographic projection matrix as shown in Lecture 2 slide 62
		return new THREE.Matrix4().set(
			mOne, 0, 0, mThir,
			0, mSix, 0, mFourt,
			0, 0, mElf, mFift,
			0, 0, 0, 1);

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
