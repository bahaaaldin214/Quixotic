export default function onResize(element, callback){
  let elementHeight = element.height,
      elementWidth = element.width;

  setInterval(function(){

      if( element.height !== elementHeight || element.width !== elementWidth ){
        elementHeight = element.height;
        elementWidth = element.width;
        callback();
      } else {

      }
  }, 16);
}

