import {Entity} from "/quixotic.js";

export default class Fireball extends Entity{
  
  constructor(angle, x, y){
    
    super();
    
    this.mass = 2;
    this.speed = 20;
    this.damage = 30;
    this.cooldown = 0;
    this.range = 30;
    this.angle = angle;
    this.startingCoords = [x, y];

  }
  
  update(deltaTime, gameSpeed){
    
    super.update(deltaTime, gameSpeed);
    
    const {angle, speed} = this;
    this.cooldown -= deltaTime*gameSpeed;

    this.accelerate(Math.cos(angle)*speed, Math.sin(angle)*speed);
    
    const {coords, startingCoords, range} = this;
    
    const [x, y] = coords;
    const [ox, oy] = startingCoords;
    
    if(range <= Math.hypot(ox - x,oy - y)){
      
      super.remove();
      
    }
    
  }
  
}