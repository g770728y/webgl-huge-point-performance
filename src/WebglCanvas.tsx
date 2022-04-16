import * as React from "react";
import { fragSrc, vertexSrc } from "./glsl";
import { Matrix } from "./Matrix";

interface Props {
  width: number;
  height: number;
}
const WebglCanvas: React.FC<Props> = (props) => {
  const ref = React.useRef<HTMLCanvasElement>(null!);
  React.useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext("webgl2");
    render(gl!, 1000, 1000);
  }, []);

  return (
    <canvas {...props} ref={ref} style={{ border: "1px solid red" }}>
      WebglCanvas
    </canvas>
  );
};

export default WebglCanvas;

const getRandomColor = function () {
  return (Math.random() * 0xffffff) << 0;
};

function render(gl: WebGL2RenderingContext, w: number, h: number) {
  const prog = createProgram(gl);

  const { aPosition: points, aColor: colors } = createHugeSeries2(100 * 10000);

  const glPoints = new ArrayBuffer(points.length * 4 + colors.length * 4);
  const f32 = new Float32Array(glPoints);
  const u32 = new Uint32Array(glPoints);

  let p = 0;
  for (let i = 0; i < points.length; i += 2) {
    f32[p++] = points[i];
    f32[p++] = points[i + 1];
    u32[p++] = colors[i / 2];
  }

  const buf = gl.createBuffer();
  gl.viewport(0, 0, w, h);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);

  const aPosLoc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPosLoc);
  gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(aPosLoc);

  const aColorLoc = gl.getAttribLocation(prog, "aColor");
  gl.enableVertexAttribArray(aColorLoc);
  gl.vertexAttribPointer(aColorLoc, 4, gl.UNSIGNED_BYTE, true, 12, 8);
  gl.enableVertexAttribArray(aColorLoc);

  gl.bufferData(gl.ARRAY_BUFFER, glPoints, gl.DYNAMIC_DRAW);

  const uProjMatrixLoc = gl.getUniformLocation(prog, "uProjMatrix");
  const projMatrix = getProjMatrix(1000, 1000);

  gl.useProgram(prog);

  let i = 0;

  function draw() {
    i++;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 每次30-60ms
    // console.time("bufferData");
    // gl.bufferData(gl.ARRAY_BUFFER, glPoints, gl.DYNAMIC_DRAW);
    // console.timeEnd("bufferData");
    gl.uniformMatrix3fv(uProjMatrixLoc, false, projMatrix.toArray(true));
    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
    f();
  }

  function f() {
    requestAnimationFrame(draw);
  }
  f();

  let d = new Date();
  setInterval(() => {
    const d1 = new Date();
    let elapsed = (d1.getTime() - d.getTime()) / 1000;
    console.log("fps", i / elapsed);
  }, 1000);
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertexSrc);
  gl.compileShader(vertexShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragShader, fragSrc);
  gl.compileShader(fragShader);

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vertexShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);

  gl.detachShader(prog, vertexShader);
  gl.detachShader(prog, fragShader);

  return prog;
}

function getProjMatrix(w: number, h: number): Matrix {
  const sign = -1;

  const pm = Matrix.IDENTITY;

  pm.a = (1 / w) * 2;
  pm.d = sign * ((1 / h) * 2);

  pm.tx = -1 - 0 * pm.a;
  pm.ty = -sign - 0 * pm.d;

  return pm;
}

// 每点距离不同, 通过num_of_seg进行调节，距离越长则越慢（插值多）
const num_of_seg = 5000;
function createHugeSeries(n: number) {
  const aPosition = new Array();
  const aColor = new Array();

  for (let i = 0; i < n; i++) {
    const k = (i % num_of_seg) / num_of_seg*1000;
    aPosition.push(k,k);
    // aColor.push(rgba2hex(240, 0, 0, 255));
    aColor.push(0xff0000ff);
  }
  return { aPosition, aColor };
}

// 每点距离是1, 所以shader不会插值
function rgba2hex(r: number, g: number, b: number, a: number) {
  return ((r << 24) >>> 0) + (g << 16) + (b << 8) + a;
}

function createHugeSeries2(n: number) {
  const aPosition: number[] = [];
  const aColor: number[] = [];
  for (let i = 0; i < 1000; i++) {
    for (let j = 0; j < 1000; j++) {
      aPosition.push(i, j);
      const color = 0xff0000ff;
      aColor.push(color);
    }
  }
  return { aPosition, aColor };
}
