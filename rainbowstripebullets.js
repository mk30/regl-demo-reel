const regl = require('regl')()
const mat4 = require('gl-mat4')
const vec3 = require('gl-vec3')
const glsl = require('glslify')
const normals = require('angle-normals')
const icosphere = require('icosphere')
const rmat = []
const camera = require('./libraries/camera.js')(regl, {
  center: [0, 1, 0],
  distance: 10,
  theta: 0 
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
          + vec3(5.0*cos(vtime * vpos.z/10.0 
          + sin(vpos.z-vpos.x)*3.0
          + vpos.y/200.0),1,1) * 0.45;
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
        vpos = vec3(abs(sin(position.x)+sin(t)), 
          position.y+3.0*sin(t)+position.x*cos(t+position.y),
          abs(sin(position.z)*4.0*sin(t-position.x)));
        gl_Position = projection * view * model * vec4(vpos.xzy, 1.0);
      }`,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      t: function(context, props){
        return context.time * props.offset *5.0
      },
      model: function(context, props){
        var theta = context.time
        mat4.translate(rmat, 
          mat4.identity(rmat),
          [0,0, Math.sin(props.foo)])
        mat4.rotateY(rmat, rmat, props.foo)
        mat4.rotateX(rmat, rmat, props.foo/2.0)
        return rmat
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
    batch.push({foo: i/10*Math.PI, offset: i/20, trans: i})
  }
  camera(() => {
    draw.ball(batch)
  })
})
