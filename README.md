# Quixotic Engine

The Quixotic Game Engine was created with 2 things in mind, spimplicty, and performance. The engine will take care of all the rendering and updating, you are ensured to have the best perofrmance possible so that you can stick to creating and deploying your game!

## [Read docs here](https://bahaaaldin214.github.io/Quixotic-Engine/)

##[Examples](https://bahaaaldin214.github.io/Quixotic-Engine/examples)

## Why Quixotic

1. Non-tiled-based collision detection, meaning you can detect collision with any game entity.

2. Solid performance, fastest peroframnce possible with 3 make up frames.

3. Easly make hundreds of entities.

4. Uses webgl, allowing for faster rendering.

5. Easily create tile maps, with power to edit each tile individually. (tile map builder coming soon!)

6. Easy managable speed, meanning you can slow things down or speed it up as you wish. There's also an event listener for when the speed changes.

## How it works
The core of the engine is a display class, this takes care of all the webgl stuff. Then the engine class which takes care of calling update and render functions. A controller class for handling client events. And a game class which glues everything together.

### Display class

The display class allows you to create rectangles, cameras, and polygons. All of which are extended from the WebglEntity class, which allows you to move, rotate, scale and translate object (Read docs for more methods).

With rectangles, you can fill, stroke or attach images onto them, there's also a provided spritesheet class. Read docs for more info on using them.

### Engine class

The engine class takes care of calling `update` and `render` functions, the update functions will gets called as fast as possible, it also allows up to 3 make up frames. The engine class takes in a framerate arguement, if the framerate provided was 1000/15, (15 frames per second), it will only call the render function 15 times a second, but update it as fast as possible.

### Controller class

The controller class takes care of all the events, such as key down, key up, mouse down, mouse up and mouse move. Read docs for more info

### Collision Handler class

The collision handler takes care of collison detection, this is done by looping every other object and skipping the ones that have already looped over it in the current frame, meaning if you're checking for collision betweeen object1 and object2, as well as object2 and object1, it will only check collision once and handle expected behavior. Read docs for more info.

### Game class

Ontop of all these classes comes the game class. This is where everything comes in together. When created, it creates a display instance, a display instance and sets it up, and a controller instance and sets it up. Read docs for more info.

Here you also create game entities, the game entities are extended from the display rect class, this allows you to move them and such. It also got more methods such as `accelerate`, which allows you to add onto the entity velocity.

