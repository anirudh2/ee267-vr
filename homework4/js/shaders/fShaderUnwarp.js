/**
 * @file Unwarp fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO Fragment shader implementation */

var shaderID = "fShaderUnwarp";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */

precision mediump float;

varying vec2 textureCoords;

// texture rendered in the first rendering pass
uniform sampler2D map;

// center of lens for un-distortion
// in normalized coordinates between 0 and 1
uniform vec2 centerCoordinate;

// [width, height] size of viewport in [mm]
// viewport is the left/right half of the browser window
uniform vec2 viewportSize;

// lens distortion parameters [K_1, K_2]
uniform vec2 K;

// distance between lens and screen in [mm]
uniform float distLensScreen;

void main() {

	float r_tilde = sqrt(pow((textureCoords.x*viewportSize.x - centerCoordinate.x*viewportSize.x),2.0) 
		+ pow((textureCoords.y*viewportSize.y - centerCoordinate.y*viewportSize.y),2.0));
	float r = r_tilde/distLensScreen;
	//float r = distance(textureCoords, centerCoordinate);
	float x_distorted = (centerCoordinate.x*viewportSize.x + (textureCoords.x*viewportSize.x - 
		centerCoordinate.x*viewportSize.x)*(1.0 + K.x*pow(r,2.0) + K.y*pow(r,4.0)))/viewportSize.x;
	float y_distorted = (centerCoordinate.y*viewportSize.y + (textureCoords.y*viewportSize.y - 
		centerCoordinate.y*viewportSize.y)*(1.0 + K.x*pow(r,2.0) + K.y*pow(r,4.0)))/viewportSize.y;
	if (x_distorted < 0.0 || x_distorted > 1.0 || y_distorted < 0.0 || y_distorted > 1.0) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	} else {
		vec2 distortedTextureCoords = vec2(x_distorted, y_distorted);
		gl_FragColor = texture2D(map, distortedTextureCoords);
	}

	//gl_FragColor = texture2D( map, textureCoords );
	//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
