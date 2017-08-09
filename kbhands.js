const regl = require('regl')()
const mat4 = require('gl-mat4')
var fs = require('fs');
var image = fs.readFileSync(__dirname + '/kbhands.jpg', 'base64');
var imageurl = 'data:image/png;base64,' + image
const drawCube = regl({
  frag: `
  precision mediump float;
  uniform sampler2D tex;
  varying vec2 uv;
  uniform float time;
  void main () {
    vec2 vuv = sin(time)/uv;
    float extra = cos(time)/(vuv.x*vuv.y);
    gl_FragColor = texture2D(tex,vec2(
      (1.0-uv.x),
      uv.y*(cos(1.0-extra)-extra*0.5)
    ));
  }`,
  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  uniform float time;
  void main() {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`,
  attributes: {
    position: [
      -2, 0,
      0, -2,
      2, 2
    ]
  },
  uniforms: {
    tex: regl.prop('texture'),
    time: regl.context('time')
  },
  count: 3
})

require('resl')({
  manifest: {
    texture: {
      type: 'image',
      src: imageurl,
      parser: (data) => regl.texture({
        data: data,
        mag: 'linear',
        min: 'linear'
      })
    }
  },
  onDone: ({texture}) => {
    regl.frame(() => {
      regl.clear({
        color: [0, 0, 0, 255],
        depth: 1
      })
      drawCube({texture})
    })
  }
})
