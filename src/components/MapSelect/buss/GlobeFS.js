//This file is automatically rebuilt by the Cesium build process.
export default
// Rainier functions shamefully stolen from:
// https://www.shadertoy.com/view/ldfyzl
    `
    #define MAX_RADIUS 2
    #define DOUBLE_HASH 0
    #define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)

float hash12(vec2 p)
{
vec3 p3 = fract(vec3(p.xyx) * HASHSCALE1);
p3 += dot(p3, p3.yzx + 19.19);
return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p)
{
vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
p3 += dot(p3, p3.yzx + 19.19);
return fract((p3.xx + p3.yz)*p3.zy);

}


vec3 getrainsplitcolor(sampler2D textureToSample, vec2 textureCoordinates){

vec2 uv=textureCoordinates*12.;


float iTime = czm_frameNumber / 100.;

vec2 p0 = floor(uv);
vec2 circles = vec2(0.);
for (int j = -MAX_RADIUS; j <= MAX_RADIUS; ++j)
{
for (int i = -MAX_RADIUS; i <= MAX_RADIUS; ++i)
{
vec2 pi = p0 + vec2(i, j);
#if DOUBLE_HASH
vec2 hsh = hash22(pi);
#else
vec2 hsh = pi;
#endif
vec2 p = pi + hash22(hsh);

float t = fract(0.3*iTime + hash12(hsh));
vec2 v = p - uv;
float d = length(v) - (float(MAX_RADIUS) + 1.)*t;

float h = 1e-3;
float d1 = d - h;
float d2 = d + h;
float p1 = sin(31.*d1) * smoothstep(-0.6, -0.3, d1) * smoothstep(0., -0.3, d1);
float p2 = sin(31.*d2) * smoothstep(-0.6, -0.3, d2) * smoothstep(0., -0.3, d2);
circles += 0.5 * normalize(v) * ((p2 - p1) / (2. * h) * (1. - t) * (1. - t));
}
}
circles /= float((MAX_RADIUS * 2 + 1)*(MAX_RADIUS * 2 + 1));


float intensity = mix(0.01, 0.15, smoothstep(0.1, 0.6, abs(fract(0.05*iTime + 0.5)*2. - 1.)));

vec3 n = vec3(circles, sqrt(1. - dot(circles, circles)));
// vec3 color = texture2D(textureToSample, uv2  - intensity*n.xy).rgb + 5.*pow(clamp(dot(n, normalize(vec3(1., 0.7, 0.5))), 0., 1.), 6.);
vec3 color = texture2D(textureToSample, textureCoordinates  - intensity*n.xy).rgb + 5.*pow(clamp(dot(n, normalize(vec3(2., 0.7, 0.5))), 0., 1.), 16.+hash12(abs(v_positionMC.xy*10.)));
//color=vec3(5.*pow(clamp(dot(n, normalize(vec3(1., 0.7, 0.5))), 0., 1.), 6.));
return color;

}

    `
