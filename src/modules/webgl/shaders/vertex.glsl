attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uTextMatrix;
uniform float uPointSize;

varying lowp vec4 vColor;
varying highp vec2 vTextureCoord;

void main(void) {
  
  gl_PointSize = uPointSize;
  
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  
  vColor = aVertexColor;
  vTextureCoord = (vec3(aTextureCoord, 1)*uTextMatrix).xy;

}