/**
 * @file Fragment shader for anaglyph rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO (2.4.3) Color Channel Multiplexing */

var shaderID = "fShaderAnaglyph";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */

precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// Texture map for the left eye
uniform sampler2D textureMapL;

// Texture map for the right eye
uniform sampler2D textureMapR;

void main() {

  vec3 leftTexture = texture2D(textureMapL, textureCoords).xyz;
  vec3 rightTexture = texture2D(textureMapR, textureCoords).xyz;

  float red = leftTexture.x*0.2989 + leftTexture.y*0.5870 + leftTexture.z*0.1140;
  float gb = rightTexture.x*0.2989 + rightTexture.y*0.5870 + rightTexture.z*0.1140;

  // gl_FragColor = texture2D( textureMapL,  textureCoords );
  gl_FragColor = vec4(red, gb, gb, 1.0);


}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
