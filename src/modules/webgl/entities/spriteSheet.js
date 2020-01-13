import Texture from "./texture.js";

export default class SpriteSheet{
  
  constructor(texture){
    
    this.y = texture.y;
    this.matrix = texture.matrix;
    this.sprites = {};
    
  }
  
  updateY(y){
    
    this.y = y;
    
    const sprites = Object.values(this.sprites);
    
    for(let i = sprites.length; i--;){
      
      sprites[i].y += y;
      
    }
    
  }
  
  update(timePassed){
    
    const _y = this.y;
    
    const sprites = Object.values(this.sprites);

    for(let i = sprites.length; i--;){
      
      const sprite = sprites[i];
      
      const {animate, interval, coords} = sprite;
      
      if(animate){
        
        sprite.time += timePassed;
        
        if(sprite.time > interval){
          
          sprite.index++;
          
          sprite.time = 0;
          
          if(sprite.index == coords.length) sprite.index = 0;
          
          const currentCoords = coords[sprite.index];
          
          sprite.x = currentCoords[0];
          sprite.y = _y + currentCoords[1];
          
        }
        
      }
      
    }
    
  }
  
  setSpriteAnimation(name, coords, width, height, fps){

    const {matrix, sprites, y} = this;

    sprites[name] = {
      width, height, matrix, coords,
      x: coords[0][0],
      y: y + coords[0][1],
      sprite: true,
      animate: true,
      index: 0,
      time: 0,
      interval: 1000/fps/1000,
    };
    
  }
  
  resetSpriteAnimation(sprite){
    
    this.sprite[sprite].index = 0;
    
  }
  
  setSprite(name, x, _y, width, height){
    
    const {sprites, matrix, y} = this;
    
    sprites[name] = {
      x, width, height,
      y: y + y,
      sprite: true,
      matrix: matrix
    };
  }
  
  getSprite(name){
    return this.sprites[name];
  }
}
