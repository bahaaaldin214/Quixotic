import Player from "./entities/player.js";
import Stone from "./entities/stone.js";
import Tree from "./entities/tree.js";
import Grass from "./entities/grass.js";
import Enemy from "./entities/enemy.js";

import Fireball from "./bullets/fireball.js";

import {Entity, engineMath, getJson, Texture} from "/Quixotic-Engine/quixotic.min.js";

let squareLength = Math.min(innerHeight, innerWidth);

const game =  {
  create: {
  
    display: {
      
      canvas: $("#canvas"),
      width:  squareLength,
      height: squareLength,
      zAxis: 93
      
    },
  },
  
  style: {
    
    backgroundColor: "#111122",
    //backgroundImage: "/assets/sprites/grass.jpg",
    
    stroke: {

      width: 1,
      color: "#dd1111"
       
    }

  },
  
  world: {
    
    objects: [],
    
    classes: {
      Enemy,
      Enemy,
      Grass,
      Tree,
      Stone,
      Player,
      Fireball
    },
    
    tileMap : {
      
      columns: 5,
      tileSize: 5,
      
      startCoords: [-35, 35],
      
      values: [
        Grass,
        Tree,
        Stone],
        
      tiles:  [[0,1],[0,1],[0,1],[0,1],[0,1],
                [0,1],0,0,0,[0,1],
                [0,1],2,2,0,[0,1],
                [0,1],0,0,0,[0,1],
                [0,1],[0,1],[0,1],[0,1],[0,1]]
    }
    
  },
  
  engine: {
        
    frameRate: 1000/60,
    
    update: function(deltaTime, engine){
      
      engine.display.currentCamera.follow(game.world.objects.player);
      
      const objects = game.world.objects;
      const player = objects.player;
      
      if(player.health <= 0){
        
        engine.end();
        
      }
      
      for(let i = 0; i < objects.enemies.length; i++){
        objects.enemies[i].moveTowrd(player, 5);
      }
    },
    
    render: function(display){}
    
  },
  
  start: function(engine){
    
    getJson("/Quixotic-Engine/examples/example1/world/default.json").then(world => {
      
      game.world.objects = world.objects;

      engine.setup({
        style: game.style,
        
        world: game.world,
        
        engine:game.engine,
        
        setup: game.setup,
        
      });
    });
    
  },
  
  setup: function(engine, display, controller, world){
    
    game.world.objects = world.objects;
    const {player, trees, enemies, fireballs, stones, grass} = world.objects;

    const treeTexture = display.createTexture("/Quixotic-Engine/examples/assets/sprites/tree.png");
    const stoneTexture = display.createTexture("/Quixotic-Engine/examples/assets/sprites/stone.jpg");
    const marioTexture = display.createTexture("/Quixotic-Engine/examples/assets/sprites/mario.png");
    const fireballTexture = display.createTexture("/Quixotic-Engine/examples/assets/sprites/fireball.png");
    
    for(let i = trees.length; i--;){
    
      const tree = trees[i];
    
      tree.fill("#00ff00");
    
    }
    for(let i = grass.length; i--;){
    
      const grassTile = grass[i];
    
      grassTile.fill("#00ff00");
    
    }
    for(let i = enemies.length; i--;){
    
      const enemy = enemies[i];
    
      enemy.fill("#ff0000");
    
    }
    treeTexture.onload = () => {
      
      for(let i = trees.length; i--;){
    
        const tree = trees[i];
    
        tree.attachImage(treeTexture);
        tree.fill("#00000000");
    
      }
    };
    
    stones.forEach(stone => {
      stone.attachImage(stoneTexture);
    });
    
    marioTexture.onload = () => {
      player.attachImage(marioTexture);
      player.scaleToImage();

    };
    
    const color = ["#9a1211", "#1554d5", "#ffffff", "#2de326"];
    player.fill(player, color);
    
    controller.attachKeyDown("a", () => player.accelerate(-20,  0));
    controller.attachKeyDown("d", () => player.accelerate( 20,  0));
    controller.attachKeyDown("w", () => player.accelerate(  0, 20));
    controller.attachKeyDown("s", () => player.accelerate(  0,-20));
    
    
    controller.attachKeyUp("1", () => {
      
      for(let i = 0; i < 50; i++){
        const angle = Math.PI*(i/25);
        
        const fireball = engine.createEntity(Fireball, angle, ...player.coords);
        fireball.move(...player.coords);
        
        const fireballTextureCopy = Texture.from(fireballTexture);
        
        fireball.rotate(angle);
        fireball.attachImage(fireballTextureCopy);
        fireball.scaleToImage();
      }
      
    });
    
    const canvas = display.gl.canvas;
    
    controller.attachMouseButton(0, 0, canvas.width, canvas.height, (x, y)=> {
      
      
      if(player.fireballCooldown <= 0){
        
        const angle = Math.atan2(-(y - canvas.height/2), x - canvas.width/2);
        
        const fireball = engine.createEntity(Fireball, angle, ...player.coords);
        fireball.move(...player.coords);
        
        const fireballTextureCopy = Texture.from(fireballTexture);
        
        fireball.rotate(angle);
        fireball.attachImage(fireballTextureCopy);
        fireball.scaleToImage();
        
        player.fireballCooldown = 1;
      }
      
    });
    
    controller.attachKeyDown("Enter", () =>player.move(0, 0));
    
    let speed = "normal";
    controller.attachKeyUp(" ", () => {
      
      const newTree = engine.createEntity(Tree);
      newTree.attachImage(treeTexture);
      newTree.move(engineMath.randomBetween(-30, 30), engineMath.randomBetween(-30, 30));
      switch(speed){
        
        case "normal":
          
          engine.speed = 3;
          speed = "fast";
          break;
        
        case "fast":
          engine.speed = 1;
          speed = "normal";
      }
      
    });
    
  }
  
};

export default game;