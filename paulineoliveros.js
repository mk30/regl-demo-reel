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
  center: [0, 3, 0],
  distance: 6 
})
function text (regl){
  var rmat = []
  var mesh = textMesh
  return regl({
    frag: `
      precision mediump float;
      void main () {
        gl_FragColor = vec4(0.2, 0.3, 0.7, 1.0);
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
        return mat4.rotateY(rmat, mat4.identity(rmat), 1.2)
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
