/**
 * @file Fragment shader for DoF rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO (2.3) DoF Rendering */

var shaderID = "fShaderDof";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// texture map from the first rendering
uniform sampler2D textureMap;

// depth map from the first rendering
uniform sampler2D depthMap;

// Projection matrix used for the first pass
uniform mat4 projectionMat;

// Inverse of projectionMat
uniform mat4 invProjectionMat;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// Gaze position in [pixels]
uniform vec2 gazePosition;

// Diameter of pupil in [mm]
uniform float pupilDiameter;

// pixel pitch in [mm]
uniform float pixelPitch;

const float searchRad = 11.0;


// Comput the distance to fragment
float distToFrag( vec2 p ) {

	/* TODO (2.3.1) Distance to Fragment */

	return 0.0;

}


// compute the circle of confusion
float computeCoC( float fragDist, float focusDist ) {

	/* TODO (2.3.2) Circle of Confusion Computation */

	return 0.0;

}


// compute blur
vec3 computeBlur() {

	/* TODO (2.3.3) Retinal Blur */

	return vec3( 0.0 );
}


void main() {

	gl_FragColor = texture2D( textureMap,  textureCoords );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
