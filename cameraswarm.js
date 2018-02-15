var regl = require('regl')({
  extensions: [
    'oes_standard_derivatives', 'oes_element_index_uint',
    'oes_texture_float'
  ]
})
var camera = require('regl-camera')(regl,
  { distance: 150, phi: 0 })
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')
var glsl = require('glslify')


var getSize = require('glsl-matrix-texture')

function Groups (opts) {
  if (!(this instanceof Groups)) return new Groups(opts)
  var size = opts.size || {}
  this._vertexSize = (size.positions || 4096*3)/3
  this._elementSize = (size.cells || 4096*3)/3
  this._modelSize = size.models || 64
  var msize = getSize(this._modelSize)
  this.data = {
    positions: new Float32Array(this._vertexSize*3),
    cells: new Uint32Array(this._elementSize*3),
    ids: new Float32Array(this._vertexSize),
    models: new Float32Array(msize.length),
    modelSize: [msize.width,msize.height],
    modelTexture: null,
    count: 0
  }
  this._attrKeys = []
  this._attrSizes = {}
  if (opts.attributes) {
    for (var i = 0; i < opts.attributes.length; i++) {
      var attr = opts.attributes[i]
      var m = /^(\w+)\[(\d+)\]/.exec(attr)
      if (m) {
        this._attrKeys.push(m[1])
        var n = Number(m[2])
        this._attrSizes[m[1]] = n
        this.data[m[1]] = new Float32Array(this._vertexSize*n)
      } else {
        this._attrKeys.push(attr)
        this._attrSizes[attr] = 1
        this.data[attr] = new Float32Array(this._vertexSize)
      }
    }
  }
  this._mfns = []
  this._updateTexture = opts.texture()
  this._voffsets = { _last: 0 }
  this._eoffsets = { _last: 0 }
  this._ids = { _last: -1 }
  this._lengths = { positions: 0, cells: 0 }
}

Groups.prototype.getId = function (name) {
  var id = this._ids[name]
  return id === undefined ? -1 : id
}

Groups.prototype.update = function () {
  for (var i = 0; i < this._mfns.length; i++) {
    var m = this.data.models.subarray(i*16,i*16+16)
    var f = this._mfns[i]
    if (typeof f === 'function') f(m)
  }
  this.data.modelTexture = this._updateTexture({
    data: this.data.models,
    width: this.data.modelSize[0],
    height: this.data.modelSize[1],
    format: 'rgba',
    wrapS: 'clamp',
    wrapT: 'clamp'
  })
}

Groups.prototype.add = function (name, mesh) {
  var positions = f32(mesh.positions)
  var cells = u32(mesh.cells)
  var id = ++this._ids._last
  this._ids[name] = id
  if (id*16 >= this.data.models.length) {
    this._resizeModels(this._modelSize*2)
  }
  this._mfns[id] = mesh.model

  var freeVert = this.data.positions.length - this._lengths.positions
  if (positions.length > freeVert) {
    this._resizeVertex(this._vertexSize*2)
    for (var i = 0; i < this._attrKeys.length; i++) {
      var name = this._attrKeys[i]
      var size = this._attrSizes[name]
      this._resizeAttr(name, this._vertexSize*2)
    }
  }
  var freeCells = this.data.cells.length - this._lengths.cells
  if (cells.length > freeCells) {
    this._resizeElements(this._elementSize*2)
  }
  for (var i = 0; i < cells.length; i++) {
    this.data.cells[i+this._eoffsets._last] = cells[i]
      + this._voffsets._last
  }
  this._eoffsets._last += cells.length
  for (var i = 0; i < positions.length; i++) {
    this.data.positions[i+this._voffsets._last*3] = positions[i]
  }
  for (var i = 0; i < positions.length/3; i++) {
    this.data.ids[i+this._voffsets._last] = id
  }
  for (var i = 0; i < this._attrKeys.length; i++) {
    var name = this._attrKeys[i]
    var size = this._attrSizes[name]
    var attrData = f32(mesh[name])
    for (var j = 0; j < attrData.length; j++) {
      this.data[name][j+this._voffsets._last*size] = attrData[j]
    }
  }
  this.data.count += cells.length
  this._lengths.cells += cells.length
  this._lengths.positions += positions.length
  this._voffsets[name] = this._voffsets._last
  this._voffsets._last += positions.length/3
}

Groups.prototype.pack = function () {
  this._resizeModels(this._ids._last+1)
  this._resizeVertex(this._lengths.positions/3)
  this._resizeElements(this._lengths.cells/3)
}

Groups.prototype._resizeModels = function (newSize) {
  var msize = getSize(newSize)
  this._modelSize = newSize
  this.data.models = new Float32Array(msize.length)
  this.data.modelSize = [msize.width,msize.height]
}

Groups.prototype._resizeVertex = function (newSize) {
  var oldPositions = this.data.positions
  var oldIds = this.data.ids
  this.data.positions = new Float32Array(newSize*3)
  this.data.ids = new Float32Array(newSize)
  for (var i = 0; i < this._vertexSize; i++) {
    this.data.positions[i*3+0] = oldPositions[i*3+0]
    this.data.positions[i*3+1] = oldPositions[i*3+1]
    this.data.positions[i*3+2] = oldPositions[i*3+2]
    this.data.ids[i] = oldIds[i]
  }
  this._vertexSize = newSize
}

Groups.prototype._resizeElements = function (newSize) {
  var oldCells = this.data.cells
  this.data.cells = new Uint32Array(newSize*3)
  for (var i = 0; i < this._elementSize; i++) {
    this.data.cells[i*3+0] = oldCells[i*3+0]
    this.data.cells[i*3+1] = oldCells[i*3+1]
    this.data.cells[i*3+2] = oldCells[i*3+2]
  }
  this._elementSize = newSize
}

function istarray (x) {
  return typeof x.subarray === 'function'
}

function f32 (x) {
  if (istarray(x)) return x
  var isFlat = Array.isArray(x[0]) ? false : true
  if (isFlat) return Float32Array.from(x)
  var dim = x[0].length
  var out = new Float32Array(x.length * dim)
  var index = 0
  for (var i = 0; i < x.length; i++) {
    for (var j = 0; j < x[i].length; j++) {
      out[index++] = x[i][j]
    }
  }
  return out
}

function u32 (x) {
  if (istarray(x)) return x
  var isFlat = Array.isArray(x[0]) ? false : true
  if (isFlat) return Uint32Array.from(x)
  var dim = x[0].length
  var out = new Uint32Array(x.length * dim)
  var index = 0
  for (var i = 0; i < x.length; i++) {
    for (var j = 0; j < x[i].length; j++) {
      out[index++] = x[i][j]
    }
  }
  return out
}

var meshes = new Groups({
  texture: regl.texture
})

var draw = regl({
  frag: `
    #extension GL_OES_standard_derivatives: enable
    precision highp float;
    varying vec3 vpos;
    void main () {
      vec3 dx = dFdx(vpos);
      vec3 dy = dFdy(vpos);
      vec3 N = normalize(cross(dx,dy));
      gl_FragColor = vec4(N*0.5+0.5,1);
    }
  `,
  vert: glsl`
    precision highp float;
    #pragma glslify: read_mat = require('glsl-matrix-texture')
    uniform mat4 projection, view;
    uniform sampler2D mtex;
    uniform vec2 msize;
    attribute vec3 position;
    attribute float id;
    varying vec3 vpos;
    void main () {
      mat4 model = read_mat(mtex,id,msize);
      vpos = position;
      gl_Position = projection * view * model * vec4(position,1);
    }
  `,
  uniforms: {
    mtex: regl.prop('modelTexture'),
    msize: regl.prop('modelSize')
  },
  attributes: {
    position: regl.prop('positions'),
    id: regl.prop('ids')
  },
  elements: regl.prop('cells'),
  count: regl.prop('count')
})

var gaxis = [ 0.39, 0.92, 0.04 ]
new Array(6000).fill(0).forEach(function (_,i) {
  var r = Math.random()*200
  var theta = Math.random()*2*Math.PI
  var phi = (Math.random()*2-1)*Math.PI/2
  var pos = [
    Math.sin(phi)*r,
    Math.sin(theta)*r,
    Math.cos(theta)*r
  ]
  var axis = vec3.random([])
  meshes.add('camera'+i, {
    positions: [
      [-0.5,-0.5,-2.0],[-0.5,+0.5,-2.0],[+0.5,+0.5,-2.0],[+0.5,-0.5,-2.0], // back
      [-0.5,-0.5,+0.0],[-0.5,+0.5,+0.0],[+0.5,+0.5,+0.0],[+0.5,-0.5,+0.0], // front
      [-0.5,-0.5,-2.0],[-0.5,-0.5,+0.0],[+0.5,-0.5,+0.0],[+0.5,-0.5,-2.0], // bottom
      [-0.5,+0.5,-2.0],[-0.5,+0.5,+0.0],[+0.5,+0.5,+0.0],[+0.5,+0.5,-2.0], // top
      [-0.5,-0.5,-2.0],[-0.5,+0.5,-2.0],[-0.5,+0.5,+0.0],[-0.5,-0.5,+0.0], // right
      [+0.5,-0.5,-2.0],[+0.5,+0.5,-2.0],[+0.5,+0.5,+0.0],[+0.5,-0.5,+0.0], // left
      [-0.2,-0.2,+0.0],[-0.2,+0.2,+0.0],[-0.5,+0.5,+0.5],[-0.5,-0.5,+0.5], // right fan
      [+0.2,-0.2,+0.0],[+0.2,+0.2,+0.0],[+0.5,+0.5,+0.5],[+0.5,-0.5,+0.5], // left fan
      [-0.2,+0.2,+0.0],[+0.2,+0.2,+0.0],[+0.5,+0.5,+0.5],[-0.5,+0.5,+0.5], // top fan
      [-0.2,-0.2,+0.0],[+0.2,-0.2,+0.0],[+0.5,-0.5,+0.5],[-0.5,-0.5,+0.5] // bottom fan
    ],
    cells: [
      [0,1,2],[0,2,3],
      [4,5,6],[4,6,7],
      [8,9,10],[8,10,11],
      [12,13,14],[12,14,15],
      [16,17,18],[16,18,19],
      [20,21,22],[20,22,23],
      [24,25,26],[24,26,27],
      [28,29,30],[28,30,31],
      [32,33,34],[32,34,35],
      [36,37,38],[36,38,39]
    ],
    model: function (m) {
      mat4.identity(m)
      mat4.rotate(m,m,performance.now()*0.0001,gaxis)
      mat4.translate(m,m,pos)
      mat4.rotate(m,m,performance.now()*0.001+i,axis)
    }
  })
})
var bg = regl({
  frag: glsl`
    precision highp float;
    #pragma glslify: snoise = require('glsl-noise/simplex/3d')
    #pragma glslify: hsl2rgb = require('glsl-hsl2rgb')
    uniform float time;
    varying vec2 vpos;
    void main () {
      float s0 = snoise(vec3(vpos*8.0,time*0.3))*0.5+0.5;
      float s1 = snoise(vec3(vpos*1.0,time*0.1))*0.5+0.5;
      float s2 = snoise(vec3(vpos*32.0,time*1.2))*0.5+0.5;
      float h = s1*0.2+0.6;
      float s = (s1+s2)*0.5;
      vec2 p = vpos + vec2(cos(s0*6.28),sin(s1*6.28))*0.05;
      float l = ((pow((s0+s2)*0.5,4.0)*0.5+0.5)
        * (sin(p.y*256.0
          + mod(p.x+p.y*sin(p.x+p.y*256.0+time),4.0))*0.5+0.5)
      )*0.5;
      vec3 c = hsl2rgb(h,s,l);
      gl_FragColor = vec4(c,1);
    }
  `,
  vert: `
    precision highp float;
    attribute vec2 position;
    varying vec2 vpos;
    void main () {
      vpos = position;
      gl_Position = vec4(position,0,1);
    }
  `,
  uniforms: {
    time: regl.context('time')
  },
  attributes: {
    position: [-4,-4,-4,+4,+4,+0]
  },
  elements: [[0,1,2]],
  depth: { mask: false }
})

meshes.update()
meshes.pack()
regl.frame(function (context) {
  regl.clear({ color: [0,0,0,1], depth: true })
  bg()
  camera(function () { draw(meshes.data) })
  meshes.update()
})
