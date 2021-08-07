import {Texture, Camera, Rect, SpriteSheet} from "./modules/webgl/entities.js";
import {mat4, mat3, vec3, vec2} from "./modules/glMatrix.js";

import parseColor from "./modules/webgl/parseColor.js";

import getFile from "./modules/getData.js";
import asyncImage from "./modules/asyncImage.js";
import onResize from "./modules/onResize.js";

export default class Display{

  constructor(gl, programInfo, zAxis, texture){
    this.gl = gl;
    this.programInfo = programInfo;

    this.canvas = gl.canvas;

    this.currentCamera = new Camera(45 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.currentCamera.translate([0, 0, zAxis]);

    this.currentCamera.lookAt([0, 0, 0]);

    this.zAxis = zAxis;
    this.drawZAxis = 0;
    /*TODO:
      save data so can be restored later
    */
    this.last = {};

    texture.textAttribInfo = {
      numComponents: 2,
      type: gl.FLOAT,
      normalize: false,
      stride: 0,
      offset: 0
    };

    this.texture = texture;
    this.spriteSheets = [];

    const context = texture.context;
    const canvas = texture.canvas;

    this.images = {}; /*all the images with their src as their key*/

    onResize(texture.canvas, () => {

      const images = Object.values(this.images);

      for(let i = images.length; i--;){

        const {image, y} = images[i];

        context.drawImage(image, 0, y);
      }

      const internalFormat = gl.RGBA;

      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, internalFormat, gl.UNSIGNED_BYTE, canvas);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);



    });

  }

  newCamera(){

    return Camera.fromCamera(this.camera);

  }

  changeCamera(camera){

    if(camera instanceof Camera){

      this.currentCamera = camera;

    } else {

      throw new TypeError("Provided Camera isn't an instance Camera");
    }

  }

  setDrawZAxis(drawZAxis){
    this.drawZAxis = drawZAxis;

  }

  setSize(width, height){

    const {gl: {canvas}, gl, camera} = this;

    canvas.width = width;
    canvas.height = height;

    this.currentCamera.resize(canvas.width, canvas.height)
    gl.viewport(0, 0, canvas.width, canvas.height);


  }

  parseColor(color, config){
    if(Array.isArray(color)){

      if(config.type == "stroke"){

        return [
        ...parseColor(color[1]),
        ...parseColor(color[0]),
        ...parseColor(color[2]),
        ...parseColor(color[3])
        ];
      }
      return color.map(e => parseColor(e)).flat(1);

    } else {
      const colors = [];

      const [r, g, b, a] = parseColor(color);

      for(let i = config.length - 1; i > -1; i--){
        colors.push(r, g, b, a);
      }
      return colors;
    }
  }

  randomColor(){

    return "rgb(" + Math.random()*255 + "," + Math.random()*255 + "," + Math.random()*255 + ")";

  }

  clear(color){

    const gl = this.gl;

    const [r, g, b, a] = parseColor(color, { type: "", length: 4 });
    gl.clearColor(r, g, b, a);

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  }

  stroke(color, width){
    const drawZAxis = this.drawZAxis;

    const [x, y, z] = this.currentCamera.coords;
    this.drawZAxis = z - 1.21;

    const rect = this.rect(x, y, 1, 1);

    this.strokeRect(rect, color, width);

    this.drawBuffer(rect);

    this.drawZAxis = drawZAxis;
  }

  setRectSize(rect, area, h){

    const {createStaticDrawBuffer, gl, createRectPos} = this;
    let w;
    if(typeof area == "object"){
      w = area[0];
      h = area[1];

    } else {
      w = area;

    }

    rect.positionsBuffer = createStaticDrawBuffer(gl, createRectPos(w, h).rect);

  }

  polygon(rect, x, y, circle){

    let stroke = circle ? circle : rect;

    x = x ? x : 0;
    y = y ? y : 0;

    const polygon = new Rect();
    polygon.setup(...this.getRectInfo(x, y, rect, stroke));
    if(circle) polygon.circle = true;
    return polygon;
  }

  createSpriteSheet(src){

    const texture = this.createTexture(src);
    const spriteSheet = new SpriteSheet(texture);
    texture.onload = () => spriteSheet.updateY(texture.y);

    this.spriteSheets.push(spriteSheet);

    return spriteSheet;
  }

  createTexture(src){

    const {createAttribInfo, images, gl, texture: {context, canvas}} = this;

    if(images[src]){

      return Texture.from(images[src]);

    }

    const imageInfo = new Texture();

    asyncImage(src).then(image => {

      const {width, height} = image;

      const y = canvas.height;

      if(canvas.width < width){

        canvas.width = width;

      }

      imageInfo.setup(image, y, width, height, 0);

      canvas.height += height;

      images[src] = imageInfo;

      imageInfo.onload(imageInfo);

    }).catch(console.error);

    return imageInfo;
  }

  fillRect(rect, color){
    const {createStaticDrawBuffer, gl, parseColor} = this;

    rect.fillers.fill = true;

    if(color){
      rect.fragColorPos = createStaticDrawBuffer(gl, parseColor(color, { type: "", length: rect.vertexCount }));

    }
  }

  strokeRect(rect, color, size){
    rect.fillers.stroke = true;

    if(color){

      rect.strokeSize = size;

      if(size){

        const {gl, parseColor, createStaticDrawBuffer} = this;

        rect.strokeColorPos = createStaticDrawBuffer(gl, parseColor(color, { type: "stroke", length: rect.vertexCount }));

      }
    } else {

      rect.strokeSize = 1;

      const {gl, parseColor, createStaticDrawBuffer} = this;

      rect.strokeColorPos = createStaticDrawBuffer(gl, parseColor("#000", { type: "stroke", length: rect.vertexCount }));

    }
  }

  rect(x, y, w, h){

    const {rect, stroke} = this.createRectPos(w, h);

    const square = new Rect();
    square.setup(...this.getRectInfo(x, y, rect, stroke));

    return square;
  }

  circle(x, y, r) {

    const points = [];
    const stroke = []; //TODO:

    for (let i = 0; i < 361; i++){
      const k = i*Math.PI/180;
      points.push(
          0, 0,
          r*Math.sin(k),
          r*Math.cos(k)
        );

        stroke.push(
            Math.sin(k)*r, Math.cos(k)*r,
            (r+1)*Math.sin(k),
            (r+1)*Math.cos(k),
          );
    }

    return this.polygon(stroke, x, y, stroke);

  }
  createRectPos(w, h){

    const rect = [
       w/2,  h/2,
      -w/2,  h/2,
       w/2, -h/2,
      -w/2, -h/2
    ];

    const stroke = [
      -w/2,  h/2,
       w/2,  h/2,
       w/2, -h/2,
      -w/2, -h/2,
    ];

    return {rect, stroke};
  }

  getRectInfo(x, y, rect, stroke){

    return this.createSquareBuffer(rect, stroke, [x, y, this.drawZAxis]);
  }

  createStaticDrawBuffer(gl, data){

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    return buffer;
  }

  createSquareBuffer(positions, strokePosition, coords) {
    const {gl, createStaticDrawBuffer} = this;

    const positionsBuffer      = createStaticDrawBuffer(gl, positions);
    const strokePositionBuffer = createStaticDrawBuffer(gl, strokePosition);
    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix, modelViewMatrix, coords);

    return [modelViewMatrix,
                            positionsBuffer,
                            strokePositionBuffer,
                            this.createAttribInfo(2, gl.FLOAT, false, 0, 0),
                            this.createAttribInfo(4, gl.FLOAT, false, 0, 0),
                            positions.length/2];
  }

  createAttribInfo(numComponents, type, normalize, stride, offset){

    return { numComponents, type, normalize, stride, offset};
  }

  enableAttrib(buffer, attrib, gl, {numComponents, type, normalize, stride, offset}){

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.vertexAttribPointer(attrib, numComponents,type,normalize,stride,offset);

    gl.enableVertexAttribArray(attrib);

  }

  drawTexture(texture, gl, canvas, enableAttrib, createStaticDrawBuffer, textAttribInfo, vertexCount, textureCoord, textMatrix, useText){

    const _width = canvas.width;
    const _height = canvas.height;

    const {x, y, width, height, matrix} = texture;

    const realX = x/_width;
    const realWidth = realX+width/_width;
    const realHeight = y/_height;
    const realY = (y + height)/_height;

    const fragTextPos = createStaticDrawBuffer(gl, [
      realWidth,     realHeight,
      realX, realHeight,
      realWidth,     realY,
      realX, realY,
    ]);

    gl.uniformMatrix3fv(textMatrix, false, matrix);
    enableAttrib(fragTextPos, textureCoord, gl, textAttribInfo);
    gl.uniform1f(useText, true);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);

    gl.uniform1f(useText, false);
    gl.disableVertexAttribArray(textureCoord);
  }

  drawBuffer(buffer){

    const {gl, drawTexture, enableAttrib, createStaticDrawBuffer, currentCamera, texture: {context, canvas, textAttribInfo}, programInfo: {uniformLocations, program, attribLocations: {vertexPosition, vertexColor, textureCoord}}} = this;

    const cameraMatrix = currentCamera.matrix;

    const {positionsBuffer, fragColorPos, strokeColorPos, strokePositionBuffer, matrix, vertexAttribInfo, vertextColorAttribInfo, vertexCount, fragTextPos, fillers: {fill, stroke, texture}, strokeSize, textureInfo, multiTextures} = buffer;

    gl.uniformMatrix4fv(uniformLocations.projectionMatrix, false, cameraMatrix);
    gl.uniformMatrix4fv(uniformLocations.modelViewMatrix, false, matrix);

    if(stroke){

      gl.lineWidth(strokeSize);
      enableAttrib(strokePositionBuffer, vertexPosition, gl, vertexAttribInfo);
      enableAttrib(strokeColorPos, vertexColor, gl, vertextColorAttribInfo);
      gl.drawArrays(gl.LINE_LOOP, 0, vertexCount);

    }

    if(fill){

      enableAttrib(positionsBuffer, vertexPosition, gl, vertexAttribInfo);
      enableAttrib(fragColorPos, vertexColor, gl, vertextColorAttribInfo);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
      gl.disableVertexAttribArray(vertexColor);

    }


    if(texture){

      const _width = canvas.width;
      const _height = canvas.height;

      if(multiTextures){

        const length = textureInfo.length;
        for(let i = length; i--;){

          let currentTexture = textureInfo[length - i - 1];

          drawTexture(currentTexture, gl, canvas, enableAttrib, createStaticDrawBuffer, textAttribInfo, vertexCount, textureCoord, uniformLocations.textMatrix, uniformLocations.useText);
        }

      } else {

      drawTexture(textureInfo, gl, canvas, enableAttrib, createStaticDrawBuffer, textAttribInfo, vertexCount, textureCoord, uniformLocations.textMatrix, uniformLocations.useText);
      }
    }
  }

  static loadShader(gl, program, type, source) {

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    //if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    //  alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    //  gl.deleteShader(shader);
    //  return null;
    //}
    gl.attachShader(program, shader);

  }

  static async create(canvas, width, height, zAxis = 6){
    canvas.width  = width;
    canvas.height = height;

    const gl = canvas.getContext("webgl");

    const shaderProgram = gl.createProgram();

    Display.loadShader(gl, shaderProgram, gl.VERTEX_SHADER, await getFile("/modules/webgl/shaders/vertex.glsl"));
    Display.loadShader(gl, shaderProgram, gl.FRAGMENT_SHADER, await getFile("/modules/webgl/shaders/fragment.glsl"));

    gl.linkProgram(shaderProgram);

    //if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    //  alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    //  return null;
    //}

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),


      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        textMatrix: gl.getUniformLocation(shaderProgram, 'uTextMatrix'),
        sampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        useText: gl.getUniformLocation(shaderProgram, 'aUseText'),
        pointSize: gl.getUniformLocation(shaderProgram, 'uPointSize'),
      },
    };

    gl.useProgram(programInfo.program);

    gl.uniform1f(programInfo.uniformLocations.pointSize, 1.0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const textureBuffer = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    const textureCanvas = document.createElement("canvas");
    //document.body.appendChild(textureCanvas);
    textureCanvas.width = 0;
    textureCanvas.height = 0;

    let texture = {
        canvas: textureCanvas,
        buffer: textureBuffer,
        context: textureCanvas.getContext("2d"),
      };

    return new Display(gl, programInfo, zAxis, texture);
  }
}
