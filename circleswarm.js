const regl = require('regl')()
const mat4 = require('gl-mat4')
const vec3 = require('gl-vec3')
const glsl = require('glslify')
const normals = require('angle-normals')
const icosphere = require('icosphere')
const rmat = []
const camera = require('./libraries/camera.js')(regl, {
  center: [-5, 2, 0],
  distance: 15,
  theta: 0
})
function ball (regl){
  var model = [], vtmp = []
  const mesh = icosphere(3) 
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vpos;
      uniform float time;
      vec3 hsl2rgb(in vec3 hsl) {
        vec3 rgb = clamp(abs(mod(hsl.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
        return hsl.z+hsl.y*(rgb-0.5)*(1.0-abs(2.0*hsl.z-1.0));
      }
      void main () {
        vec3 c = vec3(sin((0.1*vpos.x)/ 
          vpos.y),1,0.7) * 0.7;
        /*
        float r = sin(time);
        float g = cos(time);
        vec3 color = vec3(r, g, 1);
        gl_FragColor = vec4(color,1);
        */
        gl_FragColor = vec4(hsl2rgb(c), 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      uniform float t, time, batchpathwobble;
      uniform vec3 trans;
      attribute vec3 position, normal;
      varying vec3 vpos, batchpath;
      void main () {
        batchpath = vec3(0, sin(time*3.0 - batchpathwobble),
        sin(time - batchpathwobble)*5.0);
        vpos = vec3(position.x+3.0*sin(t), 
          position.y,
          abs(sin(position.z)*4.0*sin(t)));
        gl_Position = projection * view * 
          (model * vec4(vpos, 1.0)
            + vec4(trans,1.0)
            + vec4(batchpath,1.0));
      }`,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      time: regl.context('time'),
      t: function(context, props){
        return context.time * props.itoffset *2.0 *
        props.otoffset
      },
      trans: regl.prop('trans'),
      batchpathwobble: regl.prop('batchpathwobble'),
      model: function(context, props){
        var theta = context.time
        mat4.identity(rmat)
        mat4.translate(rmat, rmat,
          [0,0,Math.sin(props.irot)*4])
        mat4.rotateZ(rmat, rmat, props.irot)
        return rmat}
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
  var i = 0
  var total = 40
  for (i=0; i<total/2; i++){
    batch.push({irot: i/10*Math.PI, 
      itoffset: i/20, 
      otoffset: Math.cos(i),
      batchpathwobble: 1,
      trans: [0,0,0]})
  }
  for (i=0; i<total/2; i++){
    batch.push({irot: i/10*Math.PI, 
      itoffset: i/20, 
      otoffset: Math.sin(i),
      batchpathwobble: 10,
      trans: [10,10,-6]})
  }
  camera(() => {
    draw.ball(batch)
  })
})
