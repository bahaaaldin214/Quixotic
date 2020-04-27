import {Entity} from "/Quixotic-Engine/quixotic.min.js";

export default class Enemy extends Entity {
  
  constructor(){
    super();
    
    this.life = 20;
    this.damage = 20;
    this.coolDown = 0;

  }
  
  touchedPlayer(player){
    if(this.coolDown <= 0){
      
      player.health -= this.damage;
      if(player.health <= 0){
        player.remove();
      }
      this.coolDown = 2;
    }
    
  }
  
  touchedFireball(fireBall){
    
    this.life -= fireBall.damage;
    
    if(this.life <= 0){
      super.remove();
    }
    
  }
  
  update(deltaTime, speed){
    super.update(deltaTime, speed);
    this.coolDown -= deltaTime*speed;
    
  }
  
}
