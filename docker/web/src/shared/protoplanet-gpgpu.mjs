/**
 * Shaders and helpers for the three.js webgl_gpgpu_protoplanet example.
 * @see https://threejs.org/examples/#webgl_gpgpu_protoplanet
 */

export const PROTOPLANET_SIM_WIDTH = 64

export const PROTOPLANET_COMPUTE_POSITION = /* glsl */ `
#define delta ( 1.0 / 60.0 )

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 tmpPos = texture2D( texturePosition, uv );
  vec3 pos = tmpPos.xyz;

  vec4 tmpVel = texture2D( textureVelocity, uv );
  vec3 vel = tmpVel.xyz;
  float mass = tmpVel.w;

  if ( mass == 0.0 ) {
    vel = vec3( 0.0 );
  }

  pos += vel * delta;

  gl_FragColor = vec4( pos, 1.0 );

}
`

export const PROTOPLANET_COMPUTE_VELOCITY = /* glsl */ `
#include <common>

#define delta ( 1.0 / 60.0 )

uniform float gravityConstant;
uniform float density;

const float width = resolution.x;
const float height = resolution.y;

float radiusFromMass( float mass ) {
  return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
}

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float idParticle = uv.y * resolution.x + uv.x;

  vec4 tmpPos = texture2D( texturePosition, uv );
  vec3 pos = tmpPos.xyz;

  vec4 tmpVel = texture2D( textureVelocity, uv );
  vec3 vel = tmpVel.xyz;
  float mass = tmpVel.w;

  if ( mass > 0.0 ) {

    float radius = radiusFromMass( mass );
    vec3 acceleration = vec3( 0.0 );

    for ( float y = 0.0; y < height; y++ ) {

      for ( float x = 0.0; x < width; x++ ) {

        vec2 secondParticleCoords = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
        vec3 pos2 = texture2D( texturePosition, secondParticleCoords ).xyz;
        vec4 velTemp2 = texture2D( textureVelocity, secondParticleCoords );
        vec3 vel2 = velTemp2.xyz;
        float mass2 = velTemp2.w;

        float idParticle2 = secondParticleCoords.y * resolution.x + secondParticleCoords.x;

        if ( idParticle == idParticle2 ) {
          continue;
        }

        if ( mass2 == 0.0 ) {
          continue;
        }

        vec3 dPos = pos2 - pos;
        float distance = length( dPos );
        float radius2 = radiusFromMass( mass2 );

        if ( distance == 0.0 ) {
          continue;
        }

        if ( distance < radius + radius2 ) {

          if ( idParticle < idParticle2 ) {
            vel = ( vel * mass + vel2 * mass2 ) / ( mass + mass2 );
            mass += mass2;
            radius = radiusFromMass( mass );
          } else {
            mass = 0.0;
            radius = 0.0;
            vel = vec3( 0.0 );
            break;
          }

        }

        float distanceSq = distance * distance;
        float gravityField = gravityConstant * mass2 / distanceSq;
        gravityField = min( gravityField, 1000.0 );
        acceleration += gravityField * normalize( dPos );

      }

      if ( mass == 0.0 ) {
        break;
      }
    }

    vel += delta * acceleration;

  }

  gl_FragColor = vec4( vel, mass );

}
`

export const PROTOPLANET_PARTICLE_VERTEX = /* glsl */ `
#include <common>

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform float cameraConstant;
uniform float density;
uniform float hueTint;

varying vec4 vColor;

float radiusFromMass( float mass ) {
  return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
}

void main() {

  vec4 posTemp = texture2D( texturePosition, uv );
  vec3 pos = posTemp.xyz;

  vec4 velTemp = texture2D( textureVelocity, uv );
  vec3 vel = velTemp.xyz;
  float mass = velTemp.w;

  vColor = vec4( 1.0, mass / 250.0, hueTint * 0.45, 1.0 );

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  float radius = radiusFromMass( mass );

  if ( mass == 0.0 ) {
    gl_PointSize = 0.0;
  } else {
    gl_PointSize = radius * cameraConstant / ( - mvPosition.z );
  }

  gl_Position = projectionMatrix * mvPosition;

}
`

export const PROTOPLANET_PARTICLE_FRAGMENT = /* glsl */ `
varying vec4 vColor;

void main() {

  if ( vColor.y == 0.0 ) discard;

  float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
  if ( f > 0.5 ) {
    discard;
  }
  gl_FragColor = vColor;

}
`

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function protoplanetDefaults() {
  return {
    ppGravityConstant: 100,
    ppDensity: 0.45,
    ppRadius: 300,
    ppHeight: 8,
    ppExponent: 0.4,
    ppMaxMass: 15,
    ppVelocity: 70,
    ppVelocityExponent: 0.2,
    ppRandVelocity: 0.001,
    ppHue: 0.08,
  }
}

function num(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeProtoplanetSettings(input = {}) {
  const d = protoplanetDefaults()
  const next = input && typeof input === 'object' ? input : {}
  return {
    ppGravityConstant: clamp(num(next.ppGravityConstant, d.ppGravityConstant), 0, 1000),
    ppDensity: clamp(num(next.ppDensity, d.ppDensity), 0.001, 10),
    ppRadius: clamp(num(next.ppRadius, d.ppRadius), 10, 1000),
    ppHeight: clamp(num(next.ppHeight, d.ppHeight), 0, 50),
    ppExponent: clamp(num(next.ppExponent, d.ppExponent), 0, 2),
    ppMaxMass: clamp(num(next.ppMaxMass, d.ppMaxMass), 1, 50),
    ppVelocity: clamp(num(next.ppVelocity, d.ppVelocity), 0, 150),
    ppVelocityExponent: clamp(num(next.ppVelocityExponent, d.ppVelocityExponent), 0, 1),
    ppRandVelocity: clamp(num(next.ppRandVelocity, d.ppRandVelocity), 0, 50),
    ppHue: clamp(num(next.ppHue, d.ppHue), 0, 1),
  }
}

export function protoplanetStaticSignature(params) {
  return [
    params.ppRadius,
    params.ppHeight,
    params.ppExponent,
    params.ppMaxMass,
    params.ppVelocity,
    params.ppVelocityExponent,
    params.ppRandVelocity,
  ].join('|')
}

export function fillProtoplanetTextures(texturePosition, textureVelocity, params, width = PROTOPLANET_SIM_WIDTH) {
  const posArray = texturePosition.image.data
  const velArray = textureVelocity.image.data
  const particles = width * width

  const radius = params.ppRadius
  const height = params.ppHeight
  const exponent = params.ppExponent
  const maxMass = params.ppMaxMass * 1024 / particles
  const maxVel = params.ppVelocity
  const velExponent = params.ppVelocityExponent
  const randVel = params.ppRandVelocity

  for (let k = 0, kl = posArray.length; k < kl; k += 4) {
    let x
    let z
    let rr

    do {
      x = Math.random() * 2 - 1
      z = Math.random() * 2 - 1
      rr = x * x + z * z
    } while (rr > 1)

    rr = Math.sqrt(rr)
    const rExp = radius * Math.pow(rr, exponent)
    const vel = maxVel * Math.pow(rr, velExponent)
    const vx = vel * z + (Math.random() * 2 - 1) * randVel
    const vy = (Math.random() * 2 - 1) * randVel * 0.05
    const vz = -vel * x + (Math.random() * 2 - 1) * randVel

    x *= rExp
    z *= rExp
    const y = (Math.random() * 2 - 1) * height

    const mass = Math.random() * maxMass + 1

    posArray[k + 0] = x
    posArray[k + 1] = y
    posArray[k + 2] = z
    posArray[k + 3] = 1

    velArray[k + 0] = vx
    velArray[k + 1] = vy
    velArray[k + 2] = vz
    velArray[k + 3] = mass
  }
}

export function getProtoplanetCameraConstant(camera, heightPx) {
  const h = Math.max(1, heightPx || 1)
  return h / (Math.tan((Math.PI / 180) * 0.5 * camera.fov) / (camera.zoom || 1))
}
