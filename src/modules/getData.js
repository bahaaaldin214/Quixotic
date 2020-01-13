const json = {};
const text = {};
let homeURL = "/";

export function setHomeURL(url){
  homeURL = url;
}

delete localStorage.fetchedFiles;

if(!localStorage.fetchedFiles) { localStorage.fetchedFiles = `{}`; }

function checkFetch(file, response){
  if (!response.ok) {
      if(response.status == 404){
        throw Error("Can't find " + file);
      }
      throw Error(response.statusText);
  }
  return response;
  
}

export function fetchFile(src){
  const fetchedFiles = JSON.parse(localStorage.fetchedFiles);
  
  const folders = src.split("/");
  const file = folders[folders.length -1];
  
  let fileDefined = defineHolder(fetchedFiles, folders);
  
  if(fileDefined.next().value){
    
    return fileDefined.next().value;
    
  }
  
  return fetch(src).then(r => checkFetch(file, r)).then(r => r.text()).then(text => {
    
    const definedFile = fileDefined.next(text).value;
  
    localStorage.fetchedFiles = JSON.stringify(fetchedFiles);

    return definedFile;
    
  });

}

export default function getFile(src){
  
  let fileDefined = defineHolder(text, src.split("/"));
  
  if(fileDefined.next().value){
    return fileDefined.next().value;
  }

  src = homeURL + src;
    
  return fetchFile(src).then(fetchedFile => {
    
    const returnValue = fileDefined.next(fetchedFile).value;
  
    return returnValue;
    
  });
  
}

export function getJson(src){
  
  let fileDefined = defineHolder(json, src.split("/"));
  
  if(fileDefined.next().value){
    return fileDefined.next().value;
  }
    
  return fetchFile(src).then(text => {
    
    const returnValue = fileDefined.next(JSON.parse(text)).value;

    return returnValue;
    
  });
  
}

function *defineHolder(object, folders){
  const length = folders.length;

  let lastFolder = object;
  let defined = false;
  let define;
  
  for (let i = 0; i < length; i++) {
    const folder = folders[i];

    if (i + 1 == length) {
      if (lastFolder[folder]) {
        defined = true;
        define = yield true;
        continue;

      } else {
        define = yield false;

        continue;
        
      }
    }
    if (!lastFolder[folder]) {
      lastFolder[folder] = {name: folder};
   
    }

    lastFolder = lastFolder[folder];
  }
  
  if(defined) return lastFolder[folders[length - 1]];

  lastFolder[folders[length - 1]] = define;
  return define;
}