import {mat4, vec3} from "../../glMatrix.js";
import WebglEntity from "../webglEntity.js";

export default class Camera extends WebglEntity{

  constructor(fieldOfView, aspect, zNear, zFar) {
    super();

    this.fieldOfView = fieldOfView;
    this.aspect = aspect;
    this.zNear = zNear;
    this.zFarr = zFar;

    this.projection = mat4.perspective(
      mat4.create(),
      fieldOfView,
      aspect,
      zNear,
      zFar
    );


  }

  resize(w, h){
    const {fieldOfView, zNear, zFar} = this;
    this.aspect = w/h
    this.projection = mat4.perspective(
      mat4.create(),
      fieldOfView,
      w/h,
      zNear,
      zFar
    );
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
    const {fieldOfView, aspect, zNear, zFar} = {...camera};

    const newCamera = new Camera(fieldOfView, aspect, zNear, zFar);
    return newCamera;
  }
}
