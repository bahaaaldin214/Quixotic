import {mat4, vec3} from "../../glMatrix.js";
import WebglEntity from "../webglEntity.js";

export default class Camera extends WebglEntity{
  
  constructor(fieldOfView, aspect, zNear, zFar) {
    super();
    
    if(fieldOfView == "from"){
      
      this.projection = aspect;
      this.matrx = zNear;
      this.coords = zFar;
      
    } else {
      
      this.projection = mat4.perspective(
        mat4.create(),
        fieldOfView,
        aspect,
        zNear,
        zFar
      );
    }
    
      
  }
  
  lookAt(lookAt) {
    const {matrix, projection, coords} = this;
    mat4.lookAt(
      matrix,
      coords,
      lookAt,
      [0, 1, 0]
    );
  
    mat4.mul(matrix, projection, matrix);
  }
  

  
  follow(object, axes){
    
    const newCoords = vec3.mul([], object.coords, axes || [1, 1, 1]);
    
    newCoords[2] = this.coords[2];

    super.move(newCoords);
    this.lookAt(object.coords);
    
   }
  
  static fromCamera(camera){
    
    TODO.log("fix Camera.fromCamera(), need to clone instead of refrence");
    const {projection, matrix, coords} = camera;
    
    return new Camera("from", projection, matrix, coords);
  }
}
