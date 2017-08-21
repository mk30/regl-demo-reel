var regl = require('regl/regl.js')()
var stack = [], num = 0

window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 0x25) { // left
    num = (num + 1) % stack.length
  } else if (ev.keyCode === 0x27) { // right
    num = (num - 1 + stack.length) % stack.length
  } else if (ev.keyCode === 0x4E) { // N
    num = 0
  } else if (ev.keyCode === 0x4B) { // K
    num = 14
  } else if (ev.keyCode === 0x47) { // G 
    num = 13
  } else if (ev.keyCode === 0x41) { // A 
    num = 12
  } else if (ev.keyCode === 0x45) { // E 
    num = 11
  } else if (ev.keyCode === 0x48) { // H 
    num = 10
  } else if (ev.keyCode === 0x59) { // Y 
    num = 9
  } else if (ev.keyCode === 0x55) { // U 
    num = 8 
  } else if (ev.keyCode === 0x43) { // C 
    num = 7 
  } else if (ev.keyCode === 0x49) { // I 
    num = 6
  } else if (ev.keyCode === 0x53) { // S 
    num = 5
  } else if (ev.keyCode === 0x56) { // V 
    num = 4 
  } else if (ev.keyCode === 0x4D) { // M 
    num = 3 
  } else if (ev.keyCode === 0x42) { // B 
    num = 2 
  } else if (ev.keyCode === 0x44) { // D 
    num = 1 
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
