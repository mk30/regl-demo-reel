const regl = require('regl')()
const mat4 = require('gl-mat4')
var rmat = []

const skelly = require('./libraries/catmug.json')
const normals = require('angle-normals')

const camera = require('./libraries/camera.js')(regl, {
  center: [0, 0, 0]
})

function skeldraw (regl){
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnormal;
      vec3 hsl2rgb(in vec3 hsl) {
        vec3 rgb = clamp(abs(mod(hsl.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
        return hsl.z+hsl.y*(rgb-0.5)*(1.0-abs(2.0*hsl.z-1.0));
      }
      void main () {
        gl_FragColor = vec4(hsl2rgb(abs(vnormal)), 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      attribute vec3 position, normal;
      varying vec3 vnormal;
      uniform float t;
      vec3 warp (vec3 p){
        float r = length(p.zx);
        float theta = atan(p.z, p.y);
        //return vec3 (r, r, sin(theta)) + 2.0*vnormal+cos(40.0*t+p.y);
        return vec3 (p.x, p.y, p.z) +
        sin(12.0*t+vnormal)*vnormal*pow(abs(sin(t)), 3.0);
      }
      void main () {
        vnormal = normal;
        gl_Position = projection * view * model *
        vec4(warp(position), 1.0);
        gl_PointSize =
        (64.0*(1.0+sin(t*20.0+length(position))))/gl_Position.w;
      }`,
    attributes: {
      position: skelly.positions,
      normal: normals(skelly.cells, skelly.positions)
    },
    elements: skelly.cells,
    uniforms: {
      t: function(context, props){
           return context.time
         },
      model: function(context, props){
        var theta = context.time
        //return mat4.rotateZ(rmat, mat4.identity(rmat), theta/2.0)
        return mat4.identity(rmat)
      }
      
    },
    primitive: "triangles"
  })
}
var draw = {
  skeldraw: skeldraw(regl)
}
regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    draw.skeldraw()
  })
})

