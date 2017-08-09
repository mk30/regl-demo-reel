const regl = require('regl')()
const mat4 = require('gl-mat4')
var fs = require('fs');
var image = fs.readFileSync(__dirname + '/emoji.jpg', 'base64');
var imageurl = 'data:image/png;base64,' + image
const drawCube = regl({
  frag: `
  precision mediump float;
  uniform sampler2D tex;
  varying vec2 uv;
  uniform float time;
  void main () {
    float extra = cos(time)/(uv.x*uv.y);
    gl_FragColor = texture2D(tex,vec2(uv.x +
    sin(time*2.0)/8.0, uv.y*(cos(time*3.0)-extra*0.1)));
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
