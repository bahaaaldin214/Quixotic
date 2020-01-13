const div = document.createElement("div");

export default function parseColor(color){
  
  div.style.color = color;
  color =  div.style.color.match(/(\d+){1,3}/g);
  
  if(color){
    switch(color.length){
      case 3:
        return [parseInt(color[0])/255, parseInt(color[1])/255, parseInt(color[2])/255, 1];
      case 4:
        return [parseInt(color[0])/255, parseInt(color[1])/255, parseInt(color[2])/255, parseInt(color[3])/255];
        
    }
    
  }
  
  return [0,0,0,1];
}