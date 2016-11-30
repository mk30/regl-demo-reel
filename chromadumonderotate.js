const regl = require('regl')()
const mat4 = require('gl-mat4')
var rmat = []
const dis = require('./libraries/chromadisplace.js')
const normals = require('angle-normals')
const camera = require('./libraries/camera')(regl, {
  center: [0, 0, 0],
  distance: 5,
  theta: 0.8

})
var glsl = require('glslify')
var feedback = require('regl-feedback')

var drawfeedback = feedback(regl, `
  vec3 sample (vec2 uv, sampler2D tex) {
    return 0.2*texture2D(tex, (0.2*(uv-1.0)+4.0)*0.5).rgb;
  }
`)
const feedBackTexture = regl.texture({})

const drawdis = regl({
  frag: glsl`
    precision mediump float;
    #pragma glslify: snoise = require('glsl-noise/simplex/3d')
    varying vec3 vnorm;
    uniform float t;
    void main () {
      //gl_FragColor = vec4(abs(vnorm), 0.4);
      gl_FragColor = vec4(abs(vnorm) + 
      vec3(snoise(vnorm + sin(t))), 1.0);
    }`,
  vert: glsl`
    precision mediump float;
    #pragma glslify: snoise = require('glsl-noise/simplex/3d')
    uniform mat4 model, projection, view;
    attribute vec3 position, normal;
    varying vec3 vnorm, vpos, dvpos;
    uniform float t;
    vec3 warp (vec3 p){
      float r = length(p.x*sin(t));
      float theta = atan(p.z, p.x);
      return vec3 (r*cos(r), 2.0+sin(theta-r), sin(r)*sin(theta+t));
    }
    void main () {
      vnorm = normal;
      float h = min(
        pow(abs(((position.y)-1.0)*0.5),5.0),
        0.9
      );
      float dx =
      snoise(position+sin(t))*h;
      float dz =
      snoise(position+cos(t))*h;
      vpos = position;
      dvpos = position + vec3(dx,0,dz);
      gl_Position = projection * view * model * vec4(warp(dvpos),1);
      gl_PointSize = (10.0*(1.0+sin(t*20.0+length(position))))/gl_Position.w;

    }`,
  attributes: {
    position: dis.positions,
    normal: normals(dis.cells, dis.positions)
  },
  elements: dis.cells,
  uniforms: {
    t: function(context, props){
         return (context.time + props.offset)*0.3
       },
    model: function(context, props){
      var theta = context.time
      mat4.rotateX(rmat, mat4.identity(rmat), props.foo)
      mat4.rotateZ(rmat, rmat, theta*props.foo*0.5)
      return rmat
    }
  },
  primitive: "points",
  blend: {
    enable: true,
    func: { src: 'src alpha', dst: 'one minus src alpha' }
  },
  cull: { enable: true }
})
regl.frame((context) => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  drawfeedback({texture: feedBackTexture})
  var batch = []
  for (var i=0; i<10; i++){
    batch.push({foo: (i/10)*(2*Math.PI), offset:
    Math.sin(Math.PI+i/10)})
  }
  camera(() => { 
    drawdis(batch) 
    feedBackTexture({ copy: true, min: 'linear', mag: 'linear' })
  })
})
