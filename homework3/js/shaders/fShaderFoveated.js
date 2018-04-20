/**
 * @file Fragment shader for foveated rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO (2.2.4) Fragment Shader Foveation Blur */

var shaderID = "fShaderFoveated";

var shader = document.createTextNode( `
/***
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// texture map from the first rendering
uniform sampler2D textureMap;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// coordinates where user is looking in [pixels]
uniform vec2 gazePosition;

// eccentricity angle between zones 1 and 2
uniform float e1;

// eccentricity angle between zones 2 and 3
uniform float e2;

// visual angle of one pixel
uniform float pixelVA;

// Foveated blur size radius from computation in part b in [pixel]
const float blurRad1 = 2.0;

// Foveated blur size radius from computation in part b in [pixel]
const float blurRad2 = 4.0;

// Gaussian blur kernel 1
uniform float blur1[int(blurRad1)*2+1];

// Gaussian blur kernel 2
uniform float blur2[int(blurRad2)*2+1];

void main() {

	gl_FragColor = texture2D( textureMap,  textureCoords );

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
