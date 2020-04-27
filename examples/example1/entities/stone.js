import {Entity} from "/quixotic.min.js";

export default class Stone extends Entity {
  
  constructor(){
    super();
    
    this.life = 5;

  }
  
  touchedPlayer(player){
    
    player.touchedStone(this);
    
  }
  
}
