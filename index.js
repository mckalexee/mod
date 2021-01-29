
// Attach to the Canvas
let canvas = document.getElementById('canvas');
// Create the GL context
let gl = canvas.getContext('webgl');
// Set the clear color
gl.clearColor(1, 0 , 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

  void main (void) {

    // Normalize the x coordinate between 0 and 1
    float normal_x = (vpos.x + 1.0) * canvas_x / 2.0;

    // Translate the X position
    normal_x = normal_x + (translate_x * base);

    // Normalize the y coordinate between 0 and 1;
    float normal_y = (vpos.y + 1.0) * canvas_y / 2.0;

    // Translate the Y position
    normal_y = normal_y - (translate_y * base);
    float color_value = mod(normal_x * normal_y + step, base);
    float color_value_normal = color_value / (base - 1.0);

    gl_FragColor = vec4(vec3(color_value_normal), 1.0);
    // gl_FragColor = vec4(normal.x, normal.y, 0, 1.0);
  }
`

let fsPattern = `
  precision highp float;
  varying vec2 vpos;
  uniform float canvas_x;
  uniform float canvas_y;
  uniform float base;
  uniform float step;
  uniform float translate_x;
  uniform float translate_y;

  void main (void) {

    // Normalize the x coordinate between 0 and 1
    float normal_x = (vpos.x + 1.0) * canvas_x / 2.0;

    // Translate the X position
    normal_x = normal_x + (translate_x * base);

    // Normalize the y coordinate between 0 and 1;
    float normal_y = (vpos.y + 1.0) * canvas_y / 2.0;

    // Translate the Y position
    normal_y = normal_y - (translate_y * base);


    float color_value = mod(normal_x * normal_y + step, base);
    float color_value_normal = color_value / (base - 1.0);
    if(color_value_normal > 0.5) { color_value_normal = 1.0; }
    if(color_value_normal <= 0.5) { color_value_normal = 0.0; }
    gl_FragColor = vec4(vec3(color_value_normal), 1.0);
    // gl_FragColor = vec4(normal.x, normal.y, 0, 1.0);
  }
`
// A straightforward black to white to black shader
let fsSmooth = `
  precision highp float;
  varying vec2 vpos;
  uniform float canvas_x;
  uniform float canvas_y;
  uniform float base;
  uniform float step;

  void main (void) {
    float normal_x = (vpos.x + 1.0) * canvas_x / 2.0;
    float normal_y = (vpos.y + 1.0) * canvas_y / 2.0;
    float color_value = mod(normal_x * normal_y + step, base);
    float color_value_normal = color_value / (base - 1.0);
    color_value_normal = min(1.0 - color_value_normal, color_value_normal) * 2.0;

    gl_FragColor = vec4(vec3(color_value_normal), 1.0);
    // gl_FragColor = vec4(normal.x, normal.y, 0, 1.0);
  }
`

// A sine wave from black to white
let fsSin = `
  #define PI 3.1415926538
  precision highp float;
  varying vec2 vpos;
  uniform float canvas_x;
  uniform float canvas_y;
  uniform float base;
  uniform float step;

  void main (void) {
    float normal_x = (vpos.x + 1.0) * canvas_x / 2.0;
    float normal_y = (vpos.y + 1.0) * canvas_y / 2.0;
    float color_value = mod(normal_x * normal_y + step, base);
    float color_value_normal = color_value / (base - 1.0);
    float color_value_rad  = color_value_normal * PI;
    float color_value_sin = sin(color_value_rad);
    gl_FragColor = vec4(color_value_sin, color_value_sin, color_value_sin, 1.0);
    // gl_FragColor = vec4(normal.x, normal.y, 0, 1.0);
  }
`

// Sin waves RGB
let fsColorBands = `
  #define PI 3.1415926538
  precision highp float;
  varying vec2 vpos;
  uniform float canvas_x;
  uniform float canvas_y;
  uniform float base;
  uniform float step;

  void main (void) {
    float normal_x = (vpos.x + 1.0) * canvas_x / 2.0;
    float normal_y = (vpos.y + 1.0) * canvas_y / 2.0;
    float color_value_r = mod(normal_x * normal_y + step, base);
    float color_value_g = mod(normal_x * normal_y + step + (base / 3.0), base);
    float color_value_b = mod(normal_x * normal_y + step + (2.0 * base / 3.0), base);
    float color_value_normal_r = color_value_r / (base - 1.0);
    float color_value_normal_g = color_value_g / (base - 1.0);
    float color_value_normal_b = color_value_b / (base - 1.0);
    float color_value_rad_r  = color_value_normal_r * PI;
    float color_value_rad_g  = color_value_normal_g * PI;
    float color_value_rad_b  = color_value_normal_b * PI;
    float color_value_sin_r  = (sin(color_value_rad_r) - 0.9) * 10.0;
    float color_value_sin_g  = (sin(color_value_rad_g) - 0.9) * 10.0;
    float color_value_sin_b  = (sin(color_value_rad_b) - 0.9) * 10.0;


    gl_FragColor = vec4(color_value_sin_r, color_value_sin_g, color_value_sin_b, 1.0);
    // gl_FragColor = vec4(normal.x, normal.y, 0, 1.0);
  }
`
/**
 * The HTML element for a zoom slider
 */
const translateXSlider = document.getElementById('translate-x-slider')

/**
 * Display of the translateX value
 */
const translateXDisplay = document.getElementById('translate-x-value');
/**
 * How far we're translateXed in in percentage
 */
let translateX = 0;

translateXSlider.oninput = (e) => {
  translateX = e.target.value / e.target.max;
  translateXDisplay.innerText = `${translateX.toFixed(2)}`;
}

function updateTranslateOnZoom(currentZoomFactor) {
  const xDiff = (0.5 - 1/(2*(currentZoomFactor )));
  console.log(xDiff);
  // translateX = xDiff;
  translateXDisplay.innerText = `${translateX.toFixed(2)}`;
}



/**
 * The HTML element for a zoom slider
 */
const zoomSlider = document.getElementById('zoom-slider')

/**
 * Display of the zoom value
 */
const zoomDisplay = document.getElementById('zoom-value');
/**
 * How far we're zoomed in in percentage
 */
let zoomFactor = 1;

zoomSlider.oninput = (e) => {
  let newZoomFactor = 1 + (e.target.value / 100);
  updateTranslateOnZoom(newZoomFactor);

  zoomFactor = 1 + (e.target.value / 100);
  zoomDisplay.innerText = `${e.target.value}%`;
}


/**
 * The HTML element for a zoom slider
 */
const translateYSlider = document.getElementById('translate-y-slider')

/**
 * Display of the translateY value
 */
const translateYDisplay = document.getElementById('translate-y-value');
/**
 * How far we're translateYed in in percentage
 */
let translateY = 0;

translateYSlider.oninput = (e) => {
  translateY = e.target.value / e.target.max;
  translateYDisplay.innerText = `${translateY}`;
}


let vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, vs)
gl.compileShader(vertexShader);

let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fs);
// gl.shaderSource(fragmentShader, fsColorBands);
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
let baseLoc = gl.getUniformLocation(program, 'base');
let stepLoc = gl.getUniformLocation(program, 'step');
let canvasSizeXLoc = gl.getUniformLocation(program, 'canvas_x');
let canvasSizeYLoc = gl.getUniformLocation(program, 'canvas_y');
const translateXLoc = gl.getUniformLocation(program, 'translate_x');
const translateYLoc = gl.getUniformLocation(program, 'translate_y');


let vertices = new Float32Array([
  -1.0, -1.0,
  -1.0, 1.0,
  1.0, -1.0,
  1.0, 1.0,
  1.0, -1.0,
  -1.0, 1.0
]);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

let step = 0;


function animate() {
  let zoom = base * zoomFactor;
  step = (step + 1 * zoomFactor) % zoom;

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


  gl.uniform1f(canvasSizeXLoc, canvas.width)
  gl.uniform1f(canvasSizeYLoc, canvas.height)
  gl.uniform1f(translateXLoc, translateX)
  gl.uniform1f(translateYLoc, translateY)

  gl.uniform1f(baseLoc, zoom)
  gl.uniform1f(stepLoc, step)
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);