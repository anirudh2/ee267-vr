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


// Compute the distance to fragment
float distToFrag( vec2 p ) {

	vec3 ndcCoords = 2.0*vec3(texture2D(textureMap,p).x,texture2D(textureMap,p).y,texture2D(depthMap,p)) - 1.0;
  float w = projectionMat[3][2]/(ndcCoords.z - (projectionMat[2][2]/projectionMat[2][3]));
  vec4 cameraCoords = invProjectionMat*vec4(w*ndcCoords,w);
	// return cameraCoords.z;
  return length(cameraCoords);
  // return 0.0;

}


// compute the circle of confusion
float computeCoC( float fragDist, float focusDist ) {

	return pupilDiameter*abs(fragDist - focusDist)/fragDist;
  // return 0.0;

}


// compute blur
vec3 computeBlur() {
  float fragDist = distToFrag(textureCoords);
  float focusDist = distToFrag(gazePosition/windowSize);
	float cocBlur = computeCoC(fragDist,focusDist);
  float cocBlurRadPx = 0.5*cocBlur/pixelPitch;

  float numEl = 0.0;
  vec4 colourVec = vec4(0.0,0.0,0.0,0.0);
  for (int i = -int(searchRad); i < int(searchRad)+1; i++) {
    for (int j = -int(searchRad); j < int(searchRad)+1; j++) {
      float test = sqrt(float(i)*float(i)+float(j)*float(j));
      if (cocBlurRadPx > test) {
        colourVec += texture2D(textureMap,textureCoords+vec2(float(i)/windowSize.x, float(j)/windowSize.y));
        numEl += 1.0;
      }
    }
  }
  return colourVec.xyz/numEl;
	// return vec3( 0.0 );
}


void main() {

  vec3 colour = computeBlur();
  vec4 colourVec = vec4(colour, 1.0);
  gl_FragColor = colourVec;
	// gl_FragColor = texture2D( textureMap,  textureCoords );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
