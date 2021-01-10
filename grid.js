
// Attach to the Canvas
let canvas = document.getElementById('canvas');
// Create the GL context
let gl = canvas.getContext('webgl');
// Set the clear color
gl.clearColor(1, 0 , 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// GL Locations for Uniforms
let baseLoc;
let stepLoc;
let canvasSizeXLoc;
let canvasSizeYLoc;
let translateXLoc;
let translateYLoc;

let base = 1024;
// Set the vertex shader
let vs = `
  attribute vec2 pos;
  varying vec2 vpos;

  void main (void) {
    vpos = pos;
    gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
  }
`

// A straightforward black to white shader
let fs = `
precision highp float;
varying vec2 vpos;
uniform float canvas_x;
uniform float canvas_y;
uniform float base;
uniform float step;
uniform float translate_x;
uniform float translate_y;

// Returns which tile a coordinate is in
// based on the size of the grid
vec2 getTile(vec2 pixel, float grid_size) {
  vec2 tile;
  tile = floor(pixel * grid_size);
  if(tile.x >= grid_size) {
    tile.x = grid_size - 1.0;
  }

  if(tile.y >= grid_size) {
    tile.y = grid_size - 1.0;
  }

  tile = tile + 1.0;

  return(tile);
}


void main (void) {
  float grid_size = 67.0;
  float base = 97.0;
  vec2 normal = (vpos + 1.0) / 2.0;
  vec2 tile = getTile(normal, grid_size);
  float color = mod(tile.x * tile.y, base);
  float color_normal = color / (base - 1.0);

  gl_FragColor = vec4(color_normal, color_normal, color_normal, 1.0);
}



`

let vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, vs)
gl.compileShader(vertexShader);

let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fs);
gl.compileShader(fragmentShader);

let program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader)
gl.linkProgram(program);
gl.useProgram(program);
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
let posAttribute = gl.getAttribLocation(program, 'pos');
gl.enableVertexAttribArray(posAttribute);
gl.vertexAttribPointer(posAttribute, 2, gl.FLOAT, gl.FALSE, 0, 0)


// Set locations for uniforms
baseLoc = gl.getUniformLocation(program, 'base');
stepLoc = gl.getUniformLocation(program, 'step');
canvasSizeXLoc = gl.getUniformLocation(program, 'canvas_x');
canvasSizeYLoc = gl.getUniformLocation(program, 'canvas_y');
translateXLoc = gl.getUniformLocation(program, 'translate_x');
translateYLoc = gl.getUniformLocation(program, 'translate_y');

let vertices = new Float32Array([
  -1.0, -1.0,
  -1.0, 1.0,
  1.0, -1.0,
  1.0, 1.0,
  1.0, -1.0,
  -1.0, 1.0
]);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


function setCanvasSize(canvas) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  base = Math.min(width, height);

  const displayWidth  = base
  const displayHeight = base

  if(canvas.width != displayWidth || canvas.height != displayHeight) {
    canvas.width = base;
    canvas.height = base;
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    viewport(0, 0, canvas.width, canvas.height)
  }
}










let step = 0;


function animate() {
  let zoom = base * 1;
  step = (step + 0 * 1) % zoom;

  const width = window.innerWidth;
  const height = window.innerHeight;
  base = Math.min(width, height);

  const displayWidth  = base
  const displayHeight = base


  if(gl.canvas.width != displayWidth || gl.canvas.height != displayHeight) {
    canvas.width = base;
    canvas.height = base;
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }


  // gl.uniform1f(canvasSizeXLoc, canvas.width)
  // gl.uniform1f(canvasSizeYLoc, canvas.height)
  // gl.uniform1f(translateXLoc, translateX)
  // gl.uniform1f(translateYLoc, translateY)

  // gl.uniform1f(baseLoc, zoom)
  // gl.uniform1f(stepLoc, step)
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);