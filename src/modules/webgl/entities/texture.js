import {mat3} from "../../glMatrix.js";

export default class Texture{
  
  constructor(){
    
    this.matrix = mat3.create();
    
    this.image = undefined;
    this.width = undefined;
    this.height  = undefined;
    this.rotation = 0;
    this.y = 0;
    this.x = 0;
    
    let onload = function(){};
    
    Object.defineProperty(this, "onload", {
      
      get(){
        
        return onload;
        
      },
      
      set(value){
        
        if(this.loaded){
          
          value();
          
        } else {
          
          onload = value;
          
        }
        
      }
      
    });
    
    this.loaded = false;
  }
  
  setup(image, y, width, height, matrix, rotation){
    
    this.image = image;
    this.y = y;
    this.width = width;
    this.height  = height;
    this.rotation = 0;
    this.x = 0;
    
    if(matrix){

      this.matrix = matrix;
      
      if(rotation){
        this.rotation = rotation;
        
      }
    }
    
    this.loaded = true;
  }
  
  static from(texture){
    
    const newTexture = new Texture();
    
    const {image, y, width, height, matrix, rotation} = texture;

    newTexture.setup(image, y, width, height, mat3.clone(matrix), rotation);
    
    return newTexture;
  }
  
  scale(w, h){
    
    const matrix = this.matrix;
    
    mat3.scale(matrix, matrix, [w, h]);
    
  }
  
  rotate(rad){
  
    const matrix = this.matrix;
    this.rotation = (this.rotation+rad)%(Math.PI*2);

    mat3.rotate(matrix, matrix, rad);

  }
}