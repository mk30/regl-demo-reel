var regl = require('regl')()
var camera = require('./libraries/camera.js')(regl, {
  distance: 4, far: 5000
})
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')
var anormals = require('angle-normals')

function makecatmug (regl) {
  var catmug = require('./libraries/catmug.json')
  var model = []
  return regl({
    frag: `
      precision mediump float;
      uniform float time;
      varying vec3 vnorm, vpos;
      void main () {
        gl_FragColor =
        vec4(vnorm-vpos*sin(time), 1.0);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view, model;
      uniform float time;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos, dvpos;
      void main () {
        vnorm = normal;
        vpos = position;
        dvpos = position + sin(time);
        gl_Position = projection * view * model * vec4(dvpos,1);
      }
    `,
    attributes: {
      position: catmug.positions,
      normal: anormals(catmug.cells, catmug.positions)
    },
    uniforms: {
      model: function (context) {
        var theta = context.time
        mat4.rotateY(model, mat4.identity(model),
        Math.sin(theta)/2)
        return model
      },
      time: regl.context('time')
    },
    primitive: "triangles",
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    cull: { enable: true },
    elements: catmug.cells
  })
}
var draw = {
  catmug: makecatmug(regl)
}
regl.frame(function (context) {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () {
    draw.catmug()
  })
})
