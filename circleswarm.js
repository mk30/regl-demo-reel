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
function blobsbg (regl) {
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      varying vec2 uv;
      uniform vec3 eye;
      uniform float time;
      void main () {
        vec3 p = normalize(eye);
        vec2 spos = vec2(p.x-time, p.y) + uv*2.0;
        float x = snoise(vec3(p.x, p.y,time)) + snoise(vec3(spos,time));
        float y = snoise(vec3(spos*12.0,(1.0-time)));
        //modify 12 to make cells bigger
        vec3 calccolor = vec3(0,0.4,1.0)*x-y;
        gl_FragColor =
        vec4(calccolor,pow(length(calccolor), 8.0));
        //vec4(calccolor,pow(length(calccolor)-1.0, 4.0));
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view;
      attribute vec2 position;
      varying vec2 uv;
      void main () {
        uv = (position+1.0)*0.5;
        gl_Position = vec4(position,0,1);
      }
    `,
    attributes: {
      position: [-4,4,-4,-4,4,0]
    },
    count: 3,
    uniforms: {
      time: regl.context('time')
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: { mask: false }
  })
}
function bg (regl) {
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      varying vec2 uv;
      uniform vec3 eye;
      uniform float time;
      void main () {
        vec3 p = normalize(eye);
        vec2 spos = vec2(p.x-time, p.y) + uv*2.0;
        float x = snoise(vec3(p.x, p.y,time)) + snoise(vec3(spos,time));
        float y = snoise(vec3(spos*12.0,(1.0-time)));
        //modify 12 to make cells bigger
        vec3 calccolor = vec3(0,0.4,1.0)*x-y;
        gl_FragColor =
        //vec4(calccolor,pow(length(calccolor), 8.0));
        vec4(calccolor,pow(length(calccolor)-1.0, 4.0));
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view;
      attribute vec2 position;
      varying vec2 uv;
      void main () {
        uv = (position)*0.1;
        gl_Position = vec4(position,0,1);
      }
    `,
    attributes: {
      position: [-4,4,-4,-4,4,0]
    },
    count: 3,
    uniforms: {
      time: regl.context('time')
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: { mask: false }
  })
}
function originallightning (regl) {
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      varying vec2 uv;
      uniform vec3 eye;
      uniform float time;
      void main () {
        vec3 p = normalize(eye);
        vec2 spos = vec2(asin(p.x), atan(p.z,-p.y)) + uv;
        float x = snoise(vec3(spos,time*0.4))
          + snoise(vec3(spos,time*0.2));
        float y = snoise(vec3(spos*12.0,time*4.0));
        gl_FragColor = vec4(vec3(0.5,0.3,1)*x
          + vec3(0,0.4,1)*y,0.1);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view;
      attribute vec2 position;
      varying vec2 uv;
      void main () {
        gl_Position = vec4(position,0,1);
      }
    `,
    attributes: {
      position: [-4,4,-4,-4,4,0]
    },
    count: 3,
    uniforms: {
      time: regl.context('time')
    },
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: { mask: false }
  })
}
var draw = {
  ball: ball(regl),
  blobsbg: blobsbg(regl),
  bg: bg(regl),
  originallightning: originallightning(regl)
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
    draw.bg()
    draw.blobsbg()
    draw.ball(batch)
    //draw.originallightning()
  })
})
