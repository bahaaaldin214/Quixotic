import QuixoticEngine from "./quixotic.min.js";
import game from "./example1/index.js";

window.onload = () => {
  
  const engine = QuixoticEngine.create(game.create)
    .then(engine => {
    
    game.start(engine);
    
    engine.onSpeedChange = (value) => {
    
      console.log("Game current speed is " + value);
    
    };
    
  }).catch(console.error);
  
};
