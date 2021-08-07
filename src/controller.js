import engineMath from "./modules/engineMath.js";

export default class Controller{

  constructor(){
    this.keysPressed = {};
    this.functionalKeys = {};
    this.functionalKeysUp = {};
    this.mouseButtons = [];
    this.mouseDown = {x: 0, y: 0, down: false};

    this.keyDownUp = this.keyDownUp.bind(this);
  }

  keyDownUp(e){

    const key = e.key,
    {functionalKeysUp, keysPressed, functionalKeys} = this;
    if(functionalKeys[key]){
      e.preventDefault();
    }
    if(e.type == "keyup"){

      if(functionalKeysUp[key]){
        e.preventDefault();
        functionalKeysUp[key]();
      }
      keysPressed[key] = false;
    } else {
      keysPressed[key] = true;
    }

  }

  mouseDownUpMove(x, y, e){

    const last = this.mouseDown.current;
    this.mouseDown = {x, y, last, current: e.type };
    return this;
  }

  attachMouseButton(x, y, w, h, behavior){
    this.mouseButtons.push({x: x, y: y, w: w, h: h, call: behavior});
  }

  detachMouseButton(i){
    console.warn("fix maybe?");
    this.mouseButtons.splice(i);
  }

  attachKeyDown(key, call){
    this.functionalKeys[key] =  call;
    return this;
  }

  attachKeyUp(key, call){
    this.functionalKeysUp[key] =  call;
    return this;
  }

  detachKeyUp(key){
     delete this.functionalKeysUp[key];
  }

  detachKeyDown(key){
     delete this.functionalKeys[key];
  }

  update(){

    const {mouseDown, mouseButtons, keysPressed, functionalKeys} = this;
    const functionalKeysKeys = Object.keys(functionalKeys);

    for(let i = functionalKeysKeys.length;i--;){
      let key = functionalKeysKeys[i];

      if(keysPressed[key]){
        functionalKeys[key]();
      }

    }

    if(mouseDown.current == "mouseup"){

      for(let i = mouseButtons.length;i--;){
        let {x, y} = mouseDown;

        let button = mouseButtons[i];

        if(engineMath.between(x, button.x, button.w) && engineMath.between(y, button.y, button.h)){
          button.call(x, y);
        }
      }
    }
    mouseDown.current = null;
  }
}
