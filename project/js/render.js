/**
 * @file EE267 Virtual Reality
 * Homework 4
 * Build your HMD, Implement Stereo Rendering and Lens Distortion Correction
 *
 * In our homework, we heavily rely on THREE.js library for rendering.
 * THREE.js is a wonderful library to render a complicated scene without
 * cumbersome raw WebGL/OpenGL programming related to GPU use. Furthermore,
 * it also hides most of the math of computer graphics to allow designers to
 * focus on the scene creation. However, this homework does not use such
 * capabilities. We will compute them manually to understand the mathematics
 * behind the rendering pipeline!
 *
 * Instructor: Gordon Wetzstein <gordon.wetzstein@stanford.edu>,
 *             Robert Konrad <rkkonrad@stanford.edu>,
 *             Hayato Ikoma <hikoma@stanford.edu>,
 *             Marcus Pan <mpanj@stanford.edu>
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 * This version uses Three.js (r91), stats.js (r17) and jQuery (3.2.1).
 *
 */

// Global variales to control the rendring mode
// const STEREO_MODE = 0;
// const STEREO_UNWARP_MODE = 1;

const EASY_MODE = 0;
const DIFFICULT_MODE = 1;

const shift = 500;

//var renderingMode = STEREO_UNWARP_MODE;
var renderingMode = EASY_MODE;

var gameOver = 0;

var curr_sum = 0;


// Set up display parameters.
// The display parameters are hard-coded in the class since all teams have
// the same HMD.
var dispParams = new DisplayParameters();


// Create an instance for Javascript performance monitor.
// In our class, we would like to visualize the number of frames rendered
// in every second. For this purpose, stats.js is a handy tool to achieve it.
// https://github.com/mrdoob/stats.js/
var stats = new Stats();

// Add a DOM element of the performance monitor to HTML.
$( ".renderCanvas" ).prepend( stats.dom );


// Create a THREE's WebGLRenderer instance.
// Since we are not going to use stencil and depth buffers in this
// homework, those buffers are turned off. These two buffers are commonly
// used for more advanced rendering.
var webglRenderer = new THREE.WebGLRenderer( {
	antialias: false,
	stencil: false,
	depth: true,
} );


// Add a DOM element of the renderer to HTML.
$( ".renderCanvas" ).prepend( webglRenderer.domElement );


// Set the size of the renderer based on the current window size.
webglRenderer.setSize( dispParams.canvasWidth, dispParams.canvasHeight );


// add teapots with different shaders
var teapots = [];

var teapot1 =
	new Teapot( new THREE.Vector3( 0, -450, 0 ), //was 0, -350, -400 was ( - 500, 0, 0 )
		$( "#vShaderMultiPhong" ).text(),
		$( "#fShaderMultiPhong" ).text(),
	 0.75, 0);

teapots.push( teapot1 );
// makeTeapot(0,true, false);
// makeTeapot(100,false, true);
//makeTeapot(0, false, false);


function makeTeapot(wait, isLeft, isRight) {
	setTimeout(makeNew, wait);
	function makeNew() {
		if (isLeft && !isRight) {
			var teapot2 =
				new Teapot( new THREE.Vector3( -1, 100, -100 ), //was ( - 500, 0, 0 )
					$( "#vShaderMultiPhong" ).text(),
					$( "#fShaderMultiPhong" ).text(),
				0.075, 0 );
			teapots.push(teapot2);
		} else if (!isLeft && isRight) {
				var teapot2 =
				new Teapot( new THREE.Vector3( 1, 100, -100 ), //was ( - 500, 0, 0 )
					$( "#vShaderMultiPhong" ).text(),
					$( "#fShaderMultiPhong" ).text(),
					0.075,0 );
				teapots.push(teapot2);
		} else {
				var teapot2 =
				new Teapot( new THREE.Vector3( 0, 100, -100 ), //was ( - 500, 0, 0 )
					$( "#vShaderMultiPhong" ).text(),
					$( "#fShaderMultiPhong" ).text(),
				0.075,0 );
				teapots.push(teapot2);
		}
	}
}

// var teapot2 =
// 	new Teapot( new THREE.Vector3( 0, - 350, 100 ),
// 		$( "#vShaderMultiPhong" ).text(),
// 		$( "#fShaderMultiPhong" ).text() );

// teapots.push( teapot2 );


// var teapot3 =
// 	new Teapot( new THREE.Vector3( 500, - 200, - 130 ),
// 		$( "#vShaderMultiPhong" ).text(),
// 		$( "#fShaderMultiPhong" ).text() );

// teapots.push( teapot3 );

// var teapot4 =
// 	new Teapot( new THREE.Vector3( 0, 300, - 200 ),
// 		$( "#vShaderMultiPhong" ).text(),
// 		$( "#fShaderMultiPhong" ).text() );

// teapots.push( teapot4 );

// var road = [];

// var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// var plane = new THREE.Mesh( geometry, material );
//scene.add( plane );

// Create an instance of our StateCoontroller class.
// By using this class, we store the mouse movement to change the scence to be
// rendered.
var sc = new StateController( dispParams );


// Set the teapots to the renderer
var standardRenderer =
	new StandardRenderer( webglRenderer, teapots, dispParams, 0 );

var stereoUnwarpRenderer =
	new StereoUnwarpRenderer( webglRenderer, dispParams );


// Instanciate our MVPmat class
var mat = new MVPmat( dispParams );

// Start rendering!
animate();



// animate
// This function is the main function to render the scene repeatedly.
//
// Note:
// This function uses some global variables.
//
// Advanced note:
// requestAnimationFrame() is a WebAPI which is often used to perform animation.
// Importantly, requestAnimationFrame() is asynchrous, which makes this
// rendering loop not recursive. requestAnimationFrame immediately returns, and
// the following codes are executed continuously. After a certain amount of
// time, which is determined by a refresh rate of a monitor, the passed callback
// function is executed. In addition, when the window is not displayed (i.e.
// another tab of your browser is displayed), requestAnimationFrame
// significantly reduces its refresh rate to save computational resource and
// battery.
//
// If you are interested, plase check out the documentation of
// requestAnimationFrame().
// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
var counter = 0;
var startflag = 0;
var okayToMove = 1;

function func() {
	okayToMove = 1;
}

function animate() {

	// if (sc.state.gyro_running_total < -10)
	// {
	// 	//console.log("hallelujah");
	// 	sc.state.modelTranslation.x -= 500;
	// }
	//console



		if (curr_sum == shift) {
			if (sc.state.gyro_running_total < -20) {
				sc.state.modelTranslation.x -= shift;
				curr_sum -= shift;
				okayToMove = 0;
				window.setTimeout(func,500);
			}
		}
		else if (curr_sum == 0) {
			if ((sc.state.gyro_running_total < -20) && (okayToMove == 1)) {
					sc.state.modelTranslation.x -= shift;
					curr_sum -= shift;
				} else if ((sc.state.gyro_running_total > 20) && (okayToMove == 1)) {
					sc.state.modelTranslation.x += shift;
					curr_sum += shift;
				}
			}
		else if (curr_sum == -shift) {
			if (sc.state.gyro_running_total > 20) {
				sc.state.modelTranslation.x += shift;
				curr_sum += shift;
				okayToMove = 0;
				window.setTimeout(func,500);
			}
		}



	if (renderingMode == EASY_MODE) {
		var modulo = 100;
	} else if (renderingMode == DIFFICULT_MODE) {
		var modulo = 25;
	}
	if (((counter % modulo) == 0) && (startflag)) {
		console.log("player x: " + teapots[0].position.x);
		var curr_rand = Math.floor((Math.random() * 10) + 1);
		if (curr_rand < 3) {
			makeTeapot(0, true,false);
		} else if (curr_rand >= 6 && curr_rand <= 8) {
			makeTeapot(0, false, true);
		} else if (curr_rand >= 3 && curr_rand <= 5) {
			makeTeapot(0, false, false);
		}
	} else if (((counter % 100) == 0) && (!startflag)) {
		startflag = 1;
		var curr_rand = Math.floor((Math.random() * 10) + 1);
		if (curr_rand < 6) {
			makeTeapot(0, true,false);
		} else {
			makeTeapot(0, false, true);
		}
	}
	counter++;

	if (renderingMode == EASY_MODE) {
		var multiplier = 2;
	} else if (renderingMode == DIFFICULT_MODE) {
		var multiplier = 8;
	}
	for (var i = 1; i < teapots.length; i++) {
		if (teapots[i].position.x < 0) {
			teapots[i].position.x -= multiplier*0.91;
			teapots[i].position.y -= multiplier;
			teapots[i].weight += multiplier*0.00122727272;
		} else if (teapots[i].position.x > 0) {
			teapots[i].position.x += multiplier*0.91;
			teapots[i].position.y -= multiplier;
			teapots[i].weight += multiplier*0.00122727272;
		} else {
			teapots[i].position.y -= multiplier;
			teapots[i].weight += multiplier*0.00122727272;
		}
		if (teapots[i].position.y == -500) {
			teapots.splice(i,1);
			sc.IncrementScore();
		}
	}
	var standardRenderer =
		new StandardRenderer( webglRenderer, teapots, dispParams );

	curr_id = requestAnimationFrame( animate );

	// if (teapots.length > 1) {
	// 	cancelAnimationFrame(curr_id);
	// }
	for (var i = 1; i < teapots.length; i++) {
		if ((Math.abs(teapots[0].currXPos-teapots[i].position.x) < 20)
		&& Math.abs(teapots[0].position.y-teapots[i].position.y) < 30) {
			/*console.log("player x: " + teapots[0].position.x);
			console.log("cpu x: " + teapots[i].position.x);
			console.log("player y: " + teapots[0].position.y);
			console.log("cpu y: " + teapots[i].position.y);*/

			// // add a grid object in the scene
			// var w = 2000;
			// // var sqGridBackRight = new THREE.GridHelper( w, 20, "gray", "gray" );

			// var x_right = 600;
			// var y_right = 0;
			// var z_right = - 600;

			// // Overlay a plane over the grid for depth of field rendering
			// var planeGeometryBackRight = new THREE.PlaneGeometry( w, w, 10, 10 );

			// //color used to be ivory
			// var planeMaterialBackRight = new THREE.MeshBasicMaterial( { color: "red", side: THREE.DoubleSide } );

			// var planeBackRight = new THREE.Mesh( planeGeometryBackRight, planeMaterialBackRight );

			// planeBackRight.position.set( x_right, y_right, z_right - 1 );

			// planeBackRight.rotation.x = 0 * THREE.Math.DEG2RAD;

			// planeBackRight.rotation.y = - 45 * THREE.Math.DEG2RAD;

			// planeBackRight.rotation.z = 0 * THREE.Math.DEG2RAD;

			// scene.add( planeBackRight );
			var standardRenderer =
				new StandardRenderer( webglRenderer, teapots, dispParams, 1 );
			// Display parameters used for rendering.
			
			cancelAnimationFrame(curr_id);
			gameOver = 1;
		}
	}
	// Start performance monitoring
	stats.begin();

	// update model/view/projection matrices
	mat.update( sc.state );

	// if ( renderingMode === STEREO_MODE ) {

	// 	if ( webglRenderer.autoClear ) webglRenderer.clear();

	// 	webglRenderer.setScissorTest( true );

	// 	// Render for the left eye on the left viewport
	// 	webglRenderer.setScissor(
	// 		0, 0, dispParams.canvasWidth / 2, dispParams.canvasHeight );

	// 	webglRenderer.setViewport(
	// 		0, 0, dispParams.canvasWidth / 2, dispParams.canvasHeight );

	// 	standardRenderer.render(
	// 		sc.state, mat.modelMat, mat.stereoViewMat.L, mat.stereoProjectionMat.L );

	// 	// Render for the right eye on the right viewport
	// 	webglRenderer.setScissor(
	// 		 dispParams.canvasWidth / 2, 0,
	// 		 dispParams.canvasWidth / 2, dispParams.canvasHeight );

	// 	webglRenderer.setViewport(
	// 		dispParams.canvasWidth / 2, 0,
	// 		dispParams.canvasWidth / 2, dispParams.canvasHeight );

	// 	standardRenderer.render(
	// 		sc.state, mat.modelMat, mat.stereoViewMat.R, mat.stereoProjectionMat.R );

	// 	webglRenderer.setScissorTest( false );

	// } else if ( renderingMode === STEREO_UNWARP_MODE ) {

	// 	// Render for the left eye on frame buffer object
	// 	standardRenderer.renderOnTarget( stereoUnwarpRenderer.renderTargetL,
	// 		sc.state, mat.modelMat, mat.stereoViewMat.L, mat.stereoProjectionMat.L, mat.scrollModelMat );

	// 	// Render for the right eye on frame buffer object
	// 	standardRenderer.renderOnTarget( stereoUnwarpRenderer.renderTargetR,
	// 		sc.state, mat.modelMat, mat.stereoViewMat.R, mat.stereoProjectionMat.R, mat.scrollModelMat );

	// 	stereoUnwarpRenderer.render( sc.state );

	// }

	// Render for the left eye on frame buffer object
		standardRenderer.renderOnTarget( stereoUnwarpRenderer.renderTargetL,
			sc.state, mat.modelMat, mat.stereoViewMat.L, mat.stereoProjectionMat.L, mat.scrollModelMat );

		// Render for the right eye on frame buffer object
		standardRenderer.renderOnTarget( stereoUnwarpRenderer.renderTargetR,
			sc.state, mat.modelMat, mat.stereoViewMat.R, mat.stereoProjectionMat.R, mat.scrollModelMat );

		stereoUnwarpRenderer.render( sc.state );

	// End performance monitoring
	stats.end();

	// Display parameters used for rendering.
	if (!gameOver) {
		sc.display(0);
	} else {
		sc.display(1);
		$( "#renderingSwitchBtn" ).html( "Play again" );
	}

}
