/**
 * @file Gouraud vertex shader with diffuse and ambient light
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2018/03/28
 */

/* TODO (2.1.1), (2.1.3) */

var shaderID = "vShaderGouraudDiffuse";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 vColor; // Color at a vertex

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 modelViewMat;
uniform mat3 normalMat;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

attribute vec3 position;
attribute vec3 normal;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 color;
		vec3 position;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

  // Required every time: transforming position to clip space
	gl_Position =
		projectionMat * modelViewMat * vec4( position, 1.0 );

  // Tranforming position to view space
  vec4 positionView = modelViewMat * vec4( position, 1.0 );
  vec3 positionViewCoords = positionView.xyz;

  // Transforming normal to view space
  vec3 normalView = normalize(normalMat * normal);

  // Lighting Calculations

  vec3 diffuseReflection;
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
  }

  // Compute ambient reflection
  vec3 ambientReflection = material.ambient * ambientLightColor;

  vColor = ambientReflection + diffuseReflection;
  vColor = clamp(vColor, 0.0, 1.0);
}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
