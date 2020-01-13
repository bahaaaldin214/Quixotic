precision highp float;

varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;

uniform sampler2D uSampler;

uniform bool aUseText;

void main(void) {
  
  if( aUseText ){
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  } else {
    gl_FragColor = vColor;
  }
  
}