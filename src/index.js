import Display from "./display.js";
import Engine from "./engine.js";
import Controller from "./controller.js";
import Entity from "./modules/world/entity.js";
import engineMath from "./modules/engineMath.js";
import CollisionHandler from "./collisionHandler.js";

import {getJson, setHomeURL} from "./modules/getData.js";
import {Rect, Texture, Camera, SpriteSheet} from "./modules/webgl/entities.js";

export default class Quixotic{
  
  constructor(display, controller){
  

    this.display = display;
    
    this.controller = controller;
    
    this.engine = undefined;

    this.render = undefined;
    this.update = undefined;
    this.frameRate = undefined;

    this.time = 0;
    
    this.onSpeedChange=()=>{};
    
    let _speed = 1;
    Object.defineProperty(this, "speed", {
      
      get(){
        
        return _speed;
        
      },
      
      set(value){
        
        _speed = value;
        this.onSpeedChange(value);
      },
    });
    
    this.speed = 1;
    
    this.world = {
      
      objects: {},
      
      objectsCollisionInfo: {},
      
      objectsArray: [],
      
      classesInfo: {}
      
    };
    
    this.timePassed = 0;
    
  }
  
  newClass(Class, info){
    
    const world = this.world;
    
    const {collision, name, objects, array, args} = info;
    
    if(collision){
      
      world.objectsCollisionInfo[name] = collision;
      
    }
    
    world.objects[name] = {};
    
    if(array){
      
      world.objects[name] = [];
      
    }
    const classInfo = {
      name,
    };
    
    if(args) classInfo.args = args;
    
    world.classesInfo[Class.name] = classInfo;
  }
  
  createEntity(Class, ...args){
    const display = this.display;
    
    const {rect, stroke} = display.createRectPos(5, 5);
    
    Class = Class ? Class : Entity;
    
    const className = Class.name;
    
    if(className !== "Entity" && !Entity.prototype.isPrototypeOf(Class.prototype)){
      
      throw new TypeError("Expected extended class of Entity. Instead got: " + className);
      
    }
     
    let instance;
    
    const {objectsArray, classesInfo, objects} = this.world;
    
    const classInfo = classesInfo[className];

    if(classInfo){

      if(classInfo.args){
        
        instance = new Class(...[...classInfo.args, ...args]);
        
      } else {
        instance = new Class(...args);
      }
      
      const name = classInfo.name;
      
      if(Array.isArray(objects[name])){
        
        objects[name].push(instance);
        instance.name = name;

        
      } else {
        
       console.warn("didn't save object in world.objects object, object wouldn't detect collision");
        
      }
      
    } else {

       instance = new Class(...args);

    }

    instance.setup(5, 5, ...display.getRectInfo(0, 0, rect, stroke, display.randomColor()));
    objectsArray.push(instance);

    return instance;
    
  }
  
  buildWorld({objects, classes, tileMap}){

    const world = {
      
      objects: {},
      
      objectsCollisionInfo: {},
      
      objectsArray: [],
      
      classesInfo: {},
      
    };
    if(tileMap){}
    
    if(!Array.isArray(objects)) return world;
    
    for(let i = objects.length - 1; i > -1; i --){
      const object = objects[i];
      const {name, array, amount, position, collision, args, area} = object;

      let createClass;
      
      if(!object.class){
        
        createClass = Entity;
        
      } else {
        const className = object.class;

        createClass = classes[className];
        
        world.classesInfo[className] = {
          name,
          args
        };
        
      }
      
      const _args = args ? args : [];
      
      let pos;
      
      if(collision){
        
        world.objectsCollisionInfo[name] = collision;
        
      }

      if(position){
          let p = amount; /*if there is an array of positions, this is use to keep count */
          switch(position.type){
          
            case "random":
              const {rangeX, rangeY} = position;
              pos = function(){
                
                return [
                  engineMath.randomBetween(...rangeX),
                  engineMath.randomBetween(...rangeY)
                ];
                
              };
              break;
            case "set":
              
              if(array){
                const positions = position.positions;
                
                pos = function(){
                  p--;
  
                  return positions[p];
                };
                
              } else {
                
                pos = function(){
                  return position.position;
                };
                
              }
            
          }
          
        }
      
      if(array){

        let _array = [];
        
        for(let j = amount; j--;){
          
          const instance = this.createEntity(createClass, ..._args);
          instance.name = name;
          
          if(position){
            instance.move(...pos());
          }
          
          if(area){
            
            instance.setSize(area);
            
          }
          
          _array.push(instance);

        }
        world.objects[name] = _array;
        world.objectsArray.push(..._array);

      } else {
        
        const instance = this.createEntity(createClass, ..._args);
        instance.name = name;
        
          
        if(position){
              
          instance.move(...pos());
        }
        
        if(area){
  
          instance.setSize(area);
        }
        
        world.objects[name] = instance;
        world.objectsArray.push(instance);
      }
      
    }

    return world;
    
  }
  
  setup(game){
    
    const {style: {backgroundColor, backgroundImage, stroke}, world, engine: {frameRate, update, render}, setup} = game;
    
    this.world = this.buildWorld(world);

    this.collisionHandler = new CollisionHandler(this.world);
    
    const {collisionHandler, display, controller, entitySystem, world: {objectsArray, objects}} = this;
      
    if(backgroundImage){
      
      display.gl.canvas.style.background = `url(${backgroundImage})`;
      
      if(repeatX || repeatY){
        console.log("not read yet");
      }
    }
      
    
    this.frameRate = frameRate;
    let lastUpdated = 0;
    
    this.update = (time) =>{

      controller.update();
      let deltaTime = time - lastUpdated;
      lastUpdated = time;
      const speed = this.speed;
      
      this.timePassed += deltaTime*speed;
      
      for(let i = objectsArray.length; i--;){
        const object = objectsArray[i];
        
        if(object.delete){
          
          objectsArray.splice(i, 1);
        }
        
        collisionHandler.checkCollide(object);
        object.update(deltaTime/1000, speed);
      }

      update(deltaTime/1000, this);
    };
    
    let lastRendered = 0;
    
    this.render = (timeStamp) => {
      
      const deltaTime = timeStamp - lastRendered;
      lastRendered = timeStamp;
      
      if(backgroundColor) display.clear(backgroundColor);
      
      const length = objectsArray.length;
      
      for(let i = objectsArray.length; i--; ){
        
        const object = objectsArray[length - i - 1];
        
        const updateFillers = Object.entries(object.updateFillers);
        const fillersLength = updateFillers.length;
        
        if(fillersLength){
          
          for(let i = fillersLength; i--;){
            
            const [func, args] = updateFillers[fillersLength - i - 1];

            display[func + "Rect"](object, ...args);
          }
          
          object.updateFillers = {};
        }
        
        display.drawBuffer(object);
        
      }
      
      const speed = this.speed;
      const spriteSheets = display.spriteSheets;

      for(let i = spriteSheets.length; i--;){
        
        spriteSheets[i].update(deltaTime/1000*speed);
        
      }
      
      render(display, this);
      
      if(stroke){
        
        display.stroke(stroke.color, stroke.width);
      }
      
    };
    
    
    setup(this, display, controller, this.world);
    
    this.engine = new Engine(this.frameRate, this.update, this.render, 3);
    
    this.engine.start();
    
    return game;
    
  }
  
  end(){

    this.engine.stop();
    
  }
  
  static async create({display: {canvas, width, height, zAxis}, homeURL}){
    
    setHomeURL(homeURL);
    
    const minLength = innerWidth > innerHeight ? innerHeight : innerWidth;
    
    if(!width){
      width = minLength;
    }
    
    if(!height){
      height = minLength;
    }
    
    const display = await Display.create(canvas, width, height, zAxis);
    
    const controller = new Controller();
    
    function handleMouse(e, canvas){

      controller.mouseDownUpMove(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, e);
      
    }
    
    window.addEventListener("keydown", controller.keyDownUp);
    window.addEventListener("keyup", controller.keyDownUp);
    canvas.addEventListener("mousedown", (e) => handleMouse(e, canvas));
    canvas.addEventListener("mouseup",   (e) => handleMouse(e, canvas));
    canvas.addEventListener("mousemove", (e) => handleMouse(e, canvas));

    return new Quixotic(display, controller);
  }
  
}

export {Entity, engineMath, Rect, Texture, Camera, getJson, SpriteSheet};
