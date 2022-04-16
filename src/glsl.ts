export const vertexSrc = `
  precision highp float;
  attribute vec2 aPos;
  attribute lowp vec4 aColor;
  varying lowp vec4 vColor;
  uniform mat3 uProjMatrix;

  void main() {
    ///////////////////////// slow!!!
    // gl_Position = vec4( (uProjMatrix * vec3(aPos, 1.0)).xy * aColor, 0.0 , 1.0);

    ///////////////////////// fast!!!
    // gl_Position = vec4((uProjMatrix * vec3(aPos, 1.0)).xy, 0.0 , 1.0)*aColor;

    gl_Position = vec4((uProjMatrix * vec3(aPos, 1.0)).xy, 0.0 , 1.0);
    vColor = aColor;
  }
`

export const fragSrc = `
  precision mediump float;

  // varying float vColor;
  varying lowp vec4 vColor;

  void main() {
    // gl_FragColor = vColor * vec4(1.0, 0.3, 0.3, 1.0);
    gl_FragColor = vColor; 
  }
`
