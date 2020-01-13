const urls = {};

export default function asyncImage(url){
  if(urls[url]) return urls[url];

    const promise =  new Promise( function(resolve, reject){
        var image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Error loading image"));
        image.src = url;
    });
    urls[url] = promise;
    return promise;
}