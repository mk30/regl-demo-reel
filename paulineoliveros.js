const regl = require('regl')()
const vectorizeText = require('vectorize-text')
const mat4 = require('gl-mat4')
const glsl = require('glslify')
const textMesh = vectorizeText('thank you pauline oliveros', {
  triangles: true,
  width: 5,
  textAlign: 'center',
  textBaseline: 'middle'
})
const camera = require('./libraries/camera.js')(regl, {
  center: [0, 0, 0],
  distance: 6 
})
function text (regl){
  var rmat = []
  var mesh = textMesh
  return regl({
    frag: `
      precision mediump float;
      uniform float t;
      void main () {
        gl_FragColor = vec4(sin(t), 0.3, 0.7, 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      attribute vec2 position;
      uniform float t;
      vec2 warp (vec2 p){
        float r = length(p.xy)*sin(t);
        float theta = atan(p.y, p.x);
        return vec2 (r*cos(theta), -r*sin(theta));
      }
      void main () {
        gl_Position = projection * view * model *
        vec4(warp(position), 0, 1.0);
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
        mat4.rotateY(rmat, mat4.identity(rmat), theta)
        return rmat
      }
    },
    primitive: "triangles"
  })
}
var draw = {
  text: text(regl)
}
regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    draw.text()
  })
})
