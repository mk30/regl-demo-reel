var regl = require('regl')()
var fs = require('fs')
const glsl = require('glslify')
var sphereMesh = require('sphere-mesh')
const vectorizeText = require('vectorize-text')
var mat4 = require('gl-mat4')
var feedback = require('./libraries/feedbackeffect.js')
var drawfeedback = feedback(regl, `
  vec3 sample (vec2 uv, sampler2D tex) {
    return 0.97*texture2D(tex, (0.99*(2.0*uv-1.0)+1.0)*0.5).rgb;
  }
`)
const feedBackTexture = regl.texture({})
const textMesh = vectorizeText('nightmare cats', {
  triangles: true,
  width: 4,
  textAlign: 'center',
  textBaseline: 'middle'
})
var camera = require('./libraries/camera.js')(regl, {
  center: [0,0,0],
  distance: 4
})
var draw = {
  sphere: sphere(regl),
  text: text(regl)
}
function text (regl){
  var rmat = []
  var mesh = textMesh
  return regl({
    frag: `
      precision mediump float;
      uniform float t;
      void main () {
        gl_FragColor = vec4(1.0, 0.5*sin(t)+0.3, 0, 0.4);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      attribute vec2 position;
      uniform float t;
      void main () {
        gl_Position = projection * view * model *
        vec4(position.x, -position.y, 0, 1.0);

      }`,
    attributes: {
      position: mesh.positions
    },
    elements: mesh.cells,
    uniforms: {
      t: function(context, props){
           return context.tick/1000
         },
      model: function(context, props){
        var theta = context.tick/60
        mat4.translate(rmat, mat4.identity(rmat), [1,0,0])
        mat4.rotateY(rmat, rmat, Math.PI/2)
        mat4.translate(rmat, rmat,
          [0,Math.sin(context.time)*0.1,Math.sin(context.time*0.1)*0.1])
        return rmat
      }
    },
    primitive: "triangles"
  })
}
function sphere (regl) {
  var mesh = sphereMesh(20, 1)
  var rmat = []
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      #pragma glslify: cnoise = require('glsl-curl-noise')
      varying vec3 pos;
      uniform float time;
      void main () {
        float l = snoise(cnoise(sin(pos*2.0) + vec3(0,-time,0)));
        gl_FragColor = vec4(l,l*0.3,l*-0.25,0.5);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view, model;
      attribute vec3 position;
      varying vec3 pos;
      void main () {
        pos = position;
        gl_Position = projection * view * model *
        vec4(position,1);
      }
    `,
    attributes: {
      position: mesh.positions
    },
    uniforms: {
      model: function(context, props){
        var theta = context.tick/60
        return mat4.identity(rmat)
      },
      time: regl.context('time')
    },
    primitive: 'points',
    elements: mesh.cells
  })
}
regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  drawfeedback({texture: feedBackTexture})
  camera(function () {
    draw.sphere(),
    draw.text()
    feedBackTexture({
      copy: true,
      min: 'linear',
      mag: 'linear'
    })
  })
})
