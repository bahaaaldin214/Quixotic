import {Entity} from "/quixotic.min.js";

export default class Player extends Entity{
  
  constructor(){
    super();
    
    this.wood = 0;
    this.stones = 0;
    this.health = 3;
    this.coolDown = 0;
    this.fireballCooldown = 0;

  }
  
  touchedTree(tree){
    if(this.coolDown <= 0){
      
      this.wood++;
      tree.life--;

      if(tree.life <= 0){
        tree.remove();
      }
      this.coolDown = 1;
    }
  }
  
  touchedStone(stone){
    if(this.coolDown <= 0){
      
      this.stones++;
      stone.life--;
      if(stone.life <= 0){
        stone.remove();
      }
      this.coolDown = 1;
    }
  }
  
  update(deltaTime, speed){
    super.update(deltaTime, speed);
    
    const timePassed = deltaTime*speed;
    
    this.coolDown-= timePassed;
    this.fireballCooldown -=timePassed;
    
  }
}