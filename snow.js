var glsl = require('glslify')
var regl = require('regl')()
var camera = require('./libraries/camera.js')(regl, {
  distance: 3, theta: -1.35, far: 5000
})
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')
var icosphere = require('icosphere')
var feedback = require('regl-feedback')

var draw = {
  bg: bg(regl)
}
var tex = regl.texture()
var drawfb = feedback(regl, `
  vec3 sample (vec2 uv, sampler2D tex) {
    return 0.9*texture2D(tex,(0.99*(2.0*uv-1.0)+1.0)*0.5).rgb;
  }
`)
regl.frame(function (context) {
  regl.clear({ color: [0,0,0,1], depth: true })
  drawfb({ texture: tex })
  camera(function () {
    draw.bg()
    tex({ copy: true, min: 'linear', mag: 'linear' })
  })
})
function bg (regl) {
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      varying vec2 uv;
      uniform vec3 eye;
      uniform float time;
      void main () {
        vec3 p = normalize(eye);
        vec2 spos = vec2(asin(p.x), atan(p.z,-p.y)) + uv;
        float x = snoise(vec3(spos,time*0.4))
          + snoise(vec3(spos*8.0,time*0.2))
        ;
        float y = snoise(vec3(spos*128.0,time*4.0));
        gl_FragColor = vec4(vec3(0.5,0.6,0.8)*x
          + vec3(0,0.2,1)*y,0.03);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view;
      attribute vec2 position;
      varying vec2 uv;
      void main () {
        uv = (position+1.0)*0.5;
        gl_Position = vec4(position,0,1);
      }
    `,
    attributes: {
      position: [-4,4,-4,-4,4,0]
    },
    count: 3,
    uniforms: {
      time: regl.context('time')
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: { mask: false }
  })
}
