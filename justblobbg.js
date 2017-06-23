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
        vec3 calccolor = vec3(0,0.4,1.0)*x-y;
        gl_FragColor =
        vec4(calccolor,pow(length(calccolor), 8.0));
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
