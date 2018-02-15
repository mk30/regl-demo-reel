var regl = require('regl')()
var mat4 = require('gl-mat4')
var glsl = require('glslify')

var speed = 8
var camera = (function () {
  var projection = new Float32Array(16)
  var view = new Float32Array(16)
  var eye = Float32Array.from([0,-0.4,0])
  var center = Float32Array.from([0,-0.4,1])
  var up = Float32Array.from([0,1,0])
  return regl({
    uniforms: {
      projection: function (context, props) {
        var aspect = context.viewportWidth / context.viewportHeight
        return mat4.perspective(projection, Math.PI/2, aspect, 0.1, 1000.0)
      },
      view: function (context, props) {
        return mat4.lookAt(view, eye, center, up)
      }
    }
  })
})()
var draw = {
  tube: tube(regl),
  bg: bg(regl)
}

function bg (regl) {
  return regl({
    frag: glsl`
      precision highp float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      #pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
      uniform float time, speed;
      varying vec2 vpos;
      void main () {
        float h = snoise(vec3(vpos*speed,time*1.0));
        float l = pow(snoise(vec3(vpos*32.0,time*0.2))*0.5+0.5,16.0);
        gl_FragColor = vec4(hsl2rgb(h,1.0,l),1);
      }
    `,
    vert: glsl`
      precision highp float;
      #pragma glslify: snoise = require('glsl-noise/simplex/2d')
      attribute vec2 position;
      varying vec2 vpos;
      uniform float time, speed;
      void main () {
        float gx = snoise(vec2(1.0,(time*speed)*0.1));
        float gy = snoise(vec2(1.0,(time*speed+120.0)*0.1));
        vpos = position + vec2(gx,gy)*0.5;
        gl_Position = vec4(position,0,1);
      }
    `,
    attributes: {
      position: [[-4,-4,-4,+4,+4,+0]]
    },
    elements: [[0,1,2]],
    depth: { mask: false },
    uniforms: {
      time: regl.context('time'),
      speed: speed
    }
  })
}

function tube (regl) {
  var mesh = {
    positions: [],
    cells: [],
    zs: []
  }
  var N = 16, Z = 100, r = 1.0
  for (var z = 0; z < Z; z++) {
    for (var i = 0; i < N; i++) {
      var theta = (i/(N-1)*2.0-1.0)*Math.PI/2
      mesh.positions.push([Math.sin(theta)*r,-Math.cos(theta)*r,z])
      mesh.zs.push(z)
    }
  }
  for (var z = 0; z < Z-1; z++) {
    for (var i = 0; i < N-1; i++) {
      mesh.cells.push([ i+z*N, i+z*N+1, i+(z+1)*N ])
      mesh.cells.push([ i+z*N+1, i+(z+1)*N+1, i+(z+1)*N ])
    }
  }
  return regl({
    frag: glsl`
      precision highp float;
      #pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
      #pragma glslify: snoise = require('glsl-noise/simplex/4d')
      uniform float time, speed;
      varying float vz;
      varying vec3 vpos;
      void main () {
        float h = mod(vz/10.0+time,1.0);
        float l = pow(snoise(
          vec4((vpos+vec3(0,0,time*speed))*1.0,time*0.2))*0.5+0.5,4.0);
        vec3 color = hsl2rgb(h,1.0,l);
        gl_FragColor = vec4(color,l);
      }
    `,
    vert: glsl`
      precision highp float;
      #pragma glslify: snoise = require('glsl-noise/simplex/2d')
      uniform mat4 projection, view;
      uniform float time, speed;
      attribute vec3 position;
      attribute float z;
      varying float vz;
      varying vec3 vpos;
      void main () {
        vz = z;
        vpos = position;
        float gx = snoise(vec2(1.0,(time*speed)*0.1));
        float gy = snoise(vec2(1.0,(time*speed+120.0)*0.1));
        float dx = snoise(vec2(1.0,(position.z*0.5+time*speed)*0.1));
        float dy = snoise(vec2(1.0,(position.z*0.5+time*speed+120.0)*0.1));
        vec3 p = vec3(
          position.x + dx*0.9*pow(1.05,position.z) - gx,
          position.y + dy*pow(1.05,position.z) - gy,
          position.z
        );
        gl_Position = projection * view * vec4(p,1);
      }
    `,
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    },
    depth: {
      mask: false
    },
    uniforms: {
      time: regl.context('time'),
      speed: speed
    },
    attributes: {
      position: mesh.positions,
      z: mesh.zs
    },
    elements: mesh.cells
  })
}

regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  draw.bg()
  camera(function () {
    draw.tube()
  })
})
