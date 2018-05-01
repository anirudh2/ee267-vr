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

  // Tranforming position to view space
  vec3 positionViewCoords = fragPosCam;
  vec3 V = normalize(-positionViewCoords);

  // Transforming normal to view space
  vec3 normalView = normalize(normalCam);

  // Lighting Calculations

  vec3 diffuseReflection;
  vec3 specularReflection;
  for (int i=0;i<NUM_POINT_LIGHTS;i++) {

    // Converting pointLights[i] to view space
    vec4 pointLightView = viewMat * vec4(pointLights[i].position, 1.0);

    // Find d
    vec3 d_vec =  pointLightView.xyz - positionViewCoords;
    float d = length(d_vec);

    // Find L
    vec3 L = normalize(d_vec);

    // Attenuation term
    float att = 1.0/(attenuation.x + (attenuation.y*d) + (attenuation.z*pow(d,2.0)));

    // Find diffuse reflection
    diffuseReflection = diffuseReflection + (att * material.diffuse * pointLights[i].color * max(dot(normalView,L),0.0));

    // Find R
    vec3 R = normalize(-reflect(L,normalView));

    // Find specular reflection
    specularReflection = specularReflection + (att * material.specular * pointLights[i].color * pow(max(dot(R,V),0.0),material.shininess));
  }

  for (int i=0;i<NUM_DIR_LIGHTS;i++) {
    // The direction of L is opposite the direction of the light source.
    vec3 L = normalize(-directionalLights[i].direction);

    // No attenuation
    diffuseReflection = diffuseReflection + (material.diffuse * directionalLights[i].color * max(dot(normalView,L),0.0));

    vec3 R = normalize(-reflect(L,normalView));

    specularReflection = specularReflection + (material.specular * directionalLights[i].color * pow(max(dot(R,V),0.0),material.shininess));
  }

  // Compute ambient reflection
  vec3 ambientReflection = material.ambient * ambientLightColor;

  vec3 fColor = ambientReflection + diffuseReflection + specularReflection;

	gl_FragColor = vec4( fColor, 1.0 );

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
