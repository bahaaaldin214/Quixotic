import {mat4} from "../../glMatrix.js";
import WebglEntity from "../webglEntity.js";

export default class Rect extends WebglEntity{
  
  constructor(){
    
    super();
    
    this.positionsBuffer = undefined;
    this.fragColorPos = undefined;
    
    this.strokeColorPos = undefined;
    this.strokePositionBuffer = undefined;
    
    this.vertexAttribInfo = undefined;
    this.vertextColorAttribInfo = undefined;

    this.vertexCount = undefined;
    this.textureInfo = undefined;
    

    this.multiTextures = false;
    
    this.strokeSize = 1;
    
    this.fillers = {
      fill: false,
      texture: false,
      stroke: false
    };
    
    
  }
  
  setup(matrix, positionsBuffer,  strokePositionBuffer, vertexAttribInfo, vertextColorAttribInfo, vertexCount){
    
    this.matrix = matrix;
    
    this.positionsBuffer = positionsBuffer;
    this.strokePositionBuffer = strokePositionBuffer;
   
    this.vertexAttribInfo = vertexAttribInfo;
    this.vertextColorAttribInfo = vertextColorAttribInfo;
    
    this.vertexCount = vertexCount;
    
    return this;
  }
  
  scale(scale){

    const matrix = this.matrix;

    mat4.scale(matrix, matrix, scale);
    
    return this;
    
  }
  
  attachImage(newTexture){
    this.fillers.texture = true;
    
    if(this.multiTextures){
      this.textureInfo.push(newTexture);
      return;
    }
    
    this.textureInfo = newTexture;
    this.fillers.TRIANGLE_STRIP = true;
    
    return this;
   
  }
  
  enableMultiTextures(){
    this.multiTextures = true;
    this.textureInfo = [this.textureInfo];
    
    return this;
    
  }
  
  detachImage(i){
    
    const {textureInfo, fillers, multiTextures} = this;
    
    if(multiTextures){
      
      textureInfo.splice(i, 1);
      if  (textureInfo.length <= 0){
        fillers.texture = false;
        
      }
      return;
    }
    
    this.textureInfo = null;
    fillers.texture = false;
    return this;
  }
  
  scaleToImage(textInfo){
    
    textInfo = textInfo ? textInfo : this.textureInfo;
    
    if(!textInfo){
      return this;
    }
    
    const {width, height} = textInfo;

    if(width !== height){
      if(width > height){
         
        this.scale([width/height, 1, 1]);
         
      } else {
         
        this.scale([1, height/width, 1]);
         
      }
     
    }
    
    return this;
    
  }
  
}