import Entity from "./modules/world/entity.js";


export default class EntitySystem{
  
  constructor(){
    /*TODO: save classes for collision? */
    this.classes = {};
  }
  
  registerClass(Class){

     Object.defineProperties(
      Class.prototype,
      Object.getOwnPropertyDescriptors(Entity.prototype)
    );
    
    this.classes[Class.name] = true;
    
  }
  
  createEntity(Class, display, ...args){}
  
}