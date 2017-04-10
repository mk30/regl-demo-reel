var regl = require('regl')()
var camera = require('./libraries/camera.js')(regl, {
  center: [0,0,0],
  distance: 5,
  phi: 0.5,
  theta: -1.5
})
var anormals = require('angle-normals')
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')
var glsl = require('glslify')

var feedback = require('./libraries/feedbackeffect.js')
var drawfeedback = feedback(regl, `
  vec3 sample (vec2 uv, sampler2D tex) {
    return 0.95*texture2D(tex, (0.99*(2.0*uv-1.0)+1.0)*0.5).rgb;
  }
`)
const feedBackTexture = regl.texture({})
function makesphere (regl) {
  var sphere = require('./libraries/catmug.json')
  var model = []
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      #pragma glslify: cnoise = require('glsl-curl-noise')
      varying vec3 vpos, vnorm;
      uniform float time;
      void main () {
        float c = snoise(cnoise(sin(vnorm)));
        float z = vpos.y*2.0-5.0*sin(time);
        float y = sin(time);
        float x = vpos.z*sin(time);
        float e = c; 
        if (e < 0.0){
          gl_FragColor = vec4(vec3(0,0,0),1.0);
        }
        else gl_FragColor =
        vec4(vec3(z,x,y),1.0);
      }
    `,
    vert: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      uniform mat4 projection, view, model;
      uniform float time;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos, dvpos;
      void main () {
        vnorm = normal;
        //set ripplespeed low for faster ripples.
        float dxripplespeed = sin(time)*15.0;
        float dzripplespeed = cos(time/5.0)*5.0;
        float dx = snoise(position+2.0*
          pow(abs(sin(time/dxripplespeed)), 8.4))*0.1;
        float dz = snoise(position+
          pow(abs(cos(time/dzripplespeed)), 6.4))*0.1;
        vpos = position;
        dvpos = position +
          (vec3(dx,0,dz)
          + vec3(0,position.y/12.0-0.03*sin(time*2.0),position.z/12.0
          + 0.03*sin(time)));
        gl_Position = projection * view * model *
        vec4(dvpos,1);
      }
    `,
    attributes: {
      position: sphere.positions,
      normal: anormals(sphere.cells, sphere.positions)
    },
    uniforms: {
      texture: feedBackTexture,
      model: function () {
        mat4.identity(model)
        return model
      },
      time: regl.context('time')
    },
    primitive: "triangles",
    blend: {
      enable: true,
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha'
      }
    },
    cull: {
      enable: true 
    },
    elements: sphere.cells
  })
}
var draw = {
  sphere: makesphere(regl)
}
regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  drawfeedback({texture: feedBackTexture})    //**
  camera(function () {
    draw.sphere()
    feedBackTexture({    //**
      copy: true,
      min: 'linear',
      mag: 'linear'
    })
  })
})
