const regl = require('regl')()
const mat4 = require('gl-mat4')
const vec3 = require('gl-vec3')
const glsl = require('glslify')
const normals = require('angle-normals')
const icosphere = require('icosphere')
const rmat = []
const camera = require('./libraries/camera.js')(regl, {
  center: [0, 0, 0],
  distance: 10,
  theta: 1
})
function ball (regl){
  var model = [], vtmp = []
  const mesh = icosphere(3) 
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnormal, vpos;
      varying float vtime;
      vec3 hsl2rgb(in vec3 hsl) {
        vec3 rgb = clamp(abs(mod(hsl.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
        return hsl.z+hsl.y*(rgb-0.5)*(1.0-abs(2.0*hsl.z-1.0));
      }
      void main () {
        vec3 c = abs(vnormal) * 0.1
          + vec3(10.0*sin(vtime - vpos.z/10.0 +
          vpos.y/200.0),1,1) * 0.45;
        c.y = 1.0;
        gl_FragColor = vec4(hsl2rgb(c), 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      uniform float t;
      attribute vec3 position, normal;
      varying vec3 vnormal, vpos;
      varying float vtime;
      void main () {
        vpos = vec3(position.x+3.0*sin(t), 
          position.y,
          abs(sin(position.z)*4.0*sin(t)));
        gl_Position = projection * view * model * vec4(vpos, 1.0);
      }`,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      t: function(context, props){
        return context.time * props.offset *2.0
      },
      model: function(context, props){
        var theta = context.tick/60
        mat4.identity(model)
        return mat4.rotateZ(rmat, mat4.identity(rmat), props.foo)
        return model
      }
    },
    primitive: "triangles"
  })
}
var draw = {
  ball: ball(regl)
}
regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  batch = []
  for (var i=0; i<20; i++){
    batch.push({foo: i/10*Math.PI, offset: i/20})
  }
  camera(() => {
    draw.ball(batch)
  })
})
