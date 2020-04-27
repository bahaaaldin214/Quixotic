import {Entity} from "/quixotic.min.js";

export default class Tree extends Entity {
  
  constructor(){
    super();

    this.life = 5;
    
  }
  
  touchedPlayer(player){
    
    player.touchedTree(this);
    
  }
  
}
