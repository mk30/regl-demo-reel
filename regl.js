var regl = require('regl/regl.js')({
  extensions: [
    'oes_standard_derivatives', 'oes_element_index_uint',
    'oes_texture_float'
  ]
})
var stack = [], num = 0

window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 0x25) { // left
    num = (num + 1) % stack.length
  } else if (ev.keyCode === 0x27) { // right
    num = (num - 1 + stack.length) % stack.length
  }
})

regl.frame(function (context) {
  if (stack.length) stack[num].apply(this, arguments)
})

module.exports = function () {
  var r = function () { return regl.apply(this, arguments) }
  r.context = function () { return regl.context.apply(this, arguments) }
  r.prop = function () { return regl.prop.apply(this, arguments) }
  r.clear = function () { return regl.clear.apply(this, arguments) }
  r.draw = function () { return regl.draw.apply(this, arguments) }
  r.buffer = function () { return regl.buffer.apply(this, arguments) }
  r.elements = function () { return regl.elements.apply(this, arguments) }
  r.texture = function () { return regl.texture.apply(this, arguments) }
  r.frame = function (f) { stack.push(f) }
  r._gl = regl._gl
  r.framebuffer = regl.framebuffer
  r.read = regl.read
  r.loaders = regl.loaders
  return r
}
