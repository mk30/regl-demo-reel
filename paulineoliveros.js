var regl = require('regl')()
var fs = require('fs')
const glsl = require('glslify')
var sphereMesh = require('sphere-mesh')
const vectorizeText = require('vectorize-text')
var mat4 = require('gl-mat4')
const textMesh = vectorizeText('thank you pauline oliveros', {
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
        gl_FragColor = vec4(sin(t*5.0), 0.6, 0.7, 0.8);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      attribute vec2 position;
      uniform float t;
      void main () {
        gl_Position = projection * view * model * vec4(position.x, -position.y, 0, 1.0);
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
    elements: mesh.cells
  })
}
regl.frame(function () {
  regl.clear({ color: [0.3,0.2,0.9,1], depth: true })
  camera(function () {
    draw.sphere(),
    draw.text()
  })
})
