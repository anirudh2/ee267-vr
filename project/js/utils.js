/**
 * @file utility functions
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/**
 * @const {string} cardinalColor Our beautiful cardinal color!
 */
const cardinalColor = "rgb( 140, 21, 21 )";


/**
 * vector3ToString - convert THREE.Vector3 to string
 *
 * @param  {THREE.Vector3} v input vector i.e. [a,b,c]
 * @return {string}   output string i.e. "(a, b, c)"
 */
function vector3ToString( v ) {

	return "(" + v.x.toFixed( 1 ).toString()
		+ "," + v.y.toFixed( 1 ).toString()
		+ "," + v.z.toFixed( 1 ).toString() + ")";

}


/**
 * vector2ToString - convert THREE.Vector2 to string
 *
 * @param  {THREE.Vector2} v input vector i.e. [a,b]
 * @return {string}   output string i.e. "(a, b)"
 */
function vector2ToString( v ) {

	return "(" + v.x.toFixed( 2 ).toString()
		+ "," + v.y.toFixed( 2 ).toString() + ")";

}



/***
 * By clicking the rendering switch botton, the rendering mode is changed.
*/
$( "#renderingSwitchBtn" ).click( function () {
	//console.log("clicked");
	switchRenderingMode();

} );

$( "html" ).keydown( function ( e ) {

	// Checck if Key 1 is pressed
	if ( e.which == 49 ) {

		switchRenderingMode();

	}

} );


function switchRenderingMode() {

	// if ( renderingMode === STEREO_MODE ) {

	// 	renderingMode = STEREO_UNWARP_MODE;

	// 	$( "#renderingSwitchBtn" ).html( "Bla" ); //Stereo Unwarp

	// } else if ( renderingMode === STEREO_UNWARP_MODE ) {

	// 	renderingMode = STEREO_MODE;

	// 	$( "#renderingSwitchBtn" ).html( "Yo" ); //Stereo

	// }
	
	console.log("in function");
	if ( renderingMode === EASY_MODE ) {
		if (gameOver) {
			location.reload();
		}
		console.log("changing to difficult mode");
		renderingMode = DIFFICULT_MODE;

		$( "#renderingSwitchBtn" ).html( "Change difficulty" ); //Stereo Unwarp

	} else if ( renderingMode === DIFFICULT_MODE ) {
		if (gameOver) {
			location.reload();
		}
		console.log("changing to easy mode");
		renderingMode = EASY_MODE;

		$( "#renderingSwitchBtn" ).html( "Change difficulty" ); //Stereo

	}

}
