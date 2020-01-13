import {vec3, mat4, mat3} from "../glMatrix.js";

export default class WebglEntity{
  
  constructor(){
    
    this.matrix = mat4.create();
    
    this.coords = vec3.create();
    
  }
  
  translate(newCoords){
    
    const {matrix, coords} = this;

    mat4.translate(matrix, matrix, newCoords);
    vec3.copy(coords, [matrix[12], matrix[13], matrix[14]]);

    
  }
  
  move(newCoords){
    
    const {matrix, coords} = this;
    
    vec3.copy(coords, newCoords);
    
    mat4.moveToVec3(matrix, coords);
    
  }
  
}