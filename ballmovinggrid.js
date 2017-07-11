const regl = require('regl')()
const ball = require('icosphere')(3)
const glsl = require('glslify')
const normals = require('angle-normals')
const rmat = []
const camera = require('regl-camera')(regl, {
  center: [0, 0, 0],
  distance: 7,
  theta: 1.0,
  phi: 0.7 
})
const drawBall = regl({
  frag: glsl`
    precision mediump float;
    #pragma glslify: snoise = require('glsl-noise/simplex/4d')
    varying vec3 vnormal, vpos, dvnormal;
    uniform float t;
    void main () {
      vec3 p = vpos + vnormal * snoise(vec4(vpos,t));
      float cross = pow(abs(max(
        max(sin(p.z*20.0), sin(p.y*20.0)),
        sin(p.x*20.0)
        )), 32.0);
      gl_FragColor = vec4(vnormal*cross + vpos + cross, cross);
    }`,
  vert: glsl`
    precision mediump float;
    uniform mat4 projection, view;
    uniform float t;
    attribute vec3 position, normal;
    varying vec3 vnormal, vpos;
    void main () {
      vnormal = normal;
      vpos = position;
      gl_Position = projection * view * vec4(vpos, 1.0);
    }`,
  attributes: {
    position: ball.positions,
    normal: normals(ball.cells, ball.positions)
  },
  elements: ball.cells,
  uniforms: {
    t: function(context, props){
      return context.time + props.offset
    },
    model: function(context, props){
      return mat4.translateX(rmat, mat4.identity(rmat), props.foo)
    }
  },
  blend: {
    enable: true,
    func: { src: 'src alpha', dst: 'one minus src alpha' }
  },
  cull: { enable: false }
})
regl.frame(() => {
  regl.clear({ color: [0, 0, 0, 1] })
  var batch = []
  for (var i=0; i<20; i++){
    batch.push({foo: i/10*Math.PI, offset: i/20})
  }
  camera(() => {
    drawBall(batch)
  })
})
