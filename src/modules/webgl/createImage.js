function createImage(data, updateWidth, array, width, height, fullWidth){

  let length = array.length;

  if(updateWidth){
    
    for(let i = array.length; i--;){
      const row = array[i];
      row.length = fullWidth;
      
      for(let j = row.length; j--;){
        if(row[j] || row[j] === 0) break;
        row[j] = 0;
        
      }
    }
  }
  
  for(let i = height; i--;){
    const row = (height - i-1)*width*4;
    const newArray = [];
    
    newArray.length = fullWidth;

    for(let j = fullWidth; j--;){
      const _j = fullWidth - j-1;
      newArray[_j] = data[row + _j];
    }
    
    //array[length] = newArray;
    array.push(newArray);
    length++;
  }
  
  return [fullWidth/4, array];
}


self.addEventListener("message", (e) => {
  self.postMessage(createImage(...e.data));
});