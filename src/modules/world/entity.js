import {vec2, mat4} from "../glMatrix.js";
import ClearableWeakMap from "../clearableWeakMap.js";
import Rect from "../webgl/entities/rect.js";

export default class Entity extends Rect{
  
  constructor(){

    super();
    
    this.velocity = vec2.create();
    this.area = undefined;
    this.mass = 2;
    
    this.updateFillers = {};
    this.delete = false;
    
    this.checkedCollide = new ClearableWeakMap();
  }
  
  setup(w, h, ...args){
    this.area = vec2.fromValues(w, h);
    super.setup(...args);
    
    return this;
  }
  
  remove(){
    
    this.delete = true;
    
    return this;
    
  }
  
  fill(...args){
    this.updateFillers.fill = args;
  }
  
  stroke(...args){
    this.updateFillers.stroke = args;
  }
  
  attachImage(image){
    
    super.attachImage(image);
    
    if(!this.fillers.fill){
      this.fill("#00000000");
    }
    
  }
  
  update(deltaTime, speed){

    const {checkedCollide, area, coords, velocity, velocity: [x, y]} = this;
    
    const mass = area[0] * area[1] * this.mass;
    const angle = Math.atan2(y, x);
    const length = Math.hypot(x, y);
    
    coords[0]+= speed*(Math.cos(angle)*length/mass);
    coords[1]+= speed*(Math.sin(angle)*length/mass);

    vec2.mul(velocity, velocity, [deltaTime, deltaTime]);
    
    super.move(coords);
    
    checkedCollide.clear();
    
    return this;
  }
  
  scale(w, h, z){
    
    if(typeof w == "object"){
      h = w[1];
      z = w[2];
      w = w[0];
    }
    
    if(!z) z = 1;
    super.scale([w, h, z]);
    
    const area = this.area;
    area[0] *= w;
    area[1] *= h;
    
    return this;
  }
  
  move(x, y){
    
    super.move([x, y, this.coords[2]]);
    
    return this;

  }
  
  rotate(rad){

    const matrix = this.matrix;
    
    mat4.rotateZ(matrix, matrix, rad);
    
    return this;

  }
  
  moveTowrd(object, acceleration){
    
    const coords = this.coords;
    const newCoords = object.coords;
    
    const [x, y] = coords;
    const [nx, ny] = newCoords;
    
    const angle = Math.atan2(ny -y, nx - x);
    
    this.accelerate(Math.cos(angle)*acceleration, Math.sin(angle)*acceleration);
    
    return this;
  }
  
  setSize(w, h){
    
    if(typeof w == "object"){

      h = w[1];
      w = w[0];
    }

    const area = this.area;
    const [_w, _h] = area;
    super.scale([w/_w, h/_h, 1]);
    
    area[0] = w;
    area[1] = h;
    
    return this;
    
  }
  
  accelerate(x, y){
    const {velocity} = this;

    vec2.add(velocity, velocity, [x, y]);
    
    return this;
    
  }
  
}
