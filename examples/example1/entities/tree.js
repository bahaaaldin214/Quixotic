import {Entity} from "/Quixotic-Engine/quixotic.min.js";

export default class Tree extends Entity {
  
  constructor(){
    super();

    this.life = 5;
    
  }
  
  touchedPlayer(player){
    
    player.touchedTree(this);
    
  }
  
}
