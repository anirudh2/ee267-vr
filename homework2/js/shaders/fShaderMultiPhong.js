/**
 * @file Phong fragment shader with point and directional lights
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO (2.3) */

var shaderID = "fShaderMultiPhong";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

uniform mat4 viewMat;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif

/***
 * NUM_DIR_LIGHTS is replaced to the number of directional lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;

	vec3 fColor = ambientReflection;

	gl_FragColor = vec4( fColor, 1.0 );

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
